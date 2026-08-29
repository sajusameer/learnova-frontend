import { fetchFromStrapi } from '@/lib/api';

export const enrollmentService = {
  // Check if current user is enrolled in a course
  async getEnrollment(courseId, userId, token) {
    try {
      const res = await fetchFromStrapi(
        `/enrollments?filters[$or][0][user][id][$eq]=${userId}&filters[$or][1][user][documentId][$eq]=${userId}&populate=*`,
        { token }
      );
      const enrollments = res.data || [];
      return (
        enrollments.find((e) => {
          const data = e.attributes || e;
          const cId = data.course?.data?.id || data.course?.id || data.course?.documentId || data.course;
          return String(cId) === String(courseId);
        }) || null
      );
    } catch (err) {
      console.warn('Enrollment fetch fallback:', err.message);
      return null;
    }
  },

  // Enroll user into a course (Strapi v5 & v4 Compatible)
  async enrollCourse(courseId, userId, token) {
    const payload = {
      data: {
        user: typeof userId === 'string' && userId.length > 10 ? { set: [userId] } : userId,
        course: typeof courseId === 'string' && courseId.length > 10 ? { set: [courseId] } : courseId,
      },
    };

    return await fetchFromStrapi('/enrollments', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  // Get user completed lessons for a course
  async getLessonProgress(courseId, userId, token) {
    const localKey = `learnova_progress_${userId}_${courseId}`;
    let localSaved = [];
    if (typeof window !== 'undefined') {
      try {
        localSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
      } catch {
        localSaved = [];
      }
    }

    try {
      const res = await fetchFromStrapi(
        `/lesson-progresses?filters[$or][0][user][id][$eq]=${userId}&filters[$or][1][user][documentId][$eq]=${userId}&populate=*`,
        { token }
      );
      const allProgresses = res.data || [];

      const backendProgresses = allProgresses.filter((p) => {
        const data = p.attributes || p;
        const cId = data.course?.data?.id || data.course?.id || data.course?.documentId || data.course;
        return String(cId) === String(courseId);
      });

      if (backendProgresses.length > 0) {
        return backendProgresses;
      }
    } catch (err) {
      console.warn('LessonProgress fetch fallback to local:', err.message);
    }

    return localSaved.map((lessonId) => ({ lesson: { id: lessonId } }));
  },

  // Mark a lesson as completed
  async markLessonComplete(lesson, course, user, token) {
    const lessonDocId = lesson.documentId || lesson.id;
    const courseDocId = course.documentId || course.id;
    const userDocId = user.documentId || user.id;

    const localKey = `learnova_progress_${user.id}_${course.id}`;
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      if (!existing.includes(lesson.id)) {
        existing.push(lesson.id);
        localStorage.setItem(localKey, JSON.stringify(existing));
      }
    }

    const payloads = [
      {
        data: {
          completed: true,
          lesson: lessonDocId,
          course: courseDocId,
          user: userDocId,
        },
      },
      {
        data: {
          completed: true,
          lesson: { set: [lessonDocId] },
          course: { set: [courseDocId] },
          user: { set: [userDocId] },
        },
      },
    ];

    for (const payload of payloads) {
      try {
        const res = await fetchFromStrapi('/lesson-progresses', {
          method: 'POST',
          token,
          body: JSON.stringify(payload),
        });
        if (res && (res.data || res.id)) return res;
      } catch {
        // try next
      }
    }

    return { success: true, localOnly: true };
  },
};