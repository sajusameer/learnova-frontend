import { fetchFromStrapi } from '@/lib/api';

export const enrollmentService = {
  // Check if current user is enrolled in a course
  async getEnrollment(courseId, userId, token) {
    try {
      const res = await fetchFromStrapi('/enrollments?populate=*', { token });
      const enrollments = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      return (
        enrollments.find((e) => {
          const data = e.attributes || e;
          const u = data.user?.data || data.user;
          const uId = u?.documentId || u?.id || u?.attributes?.documentId || u?.attributes?.id || data.user;

          const c = data.course?.data || data.course;
          const cId = c?.documentId || c?.id || c?.attributes?.documentId || c?.attributes?.id || data.course;

          const isUserMatch = String(uId) === String(userId);
          const isCourseMatch = String(cId) === String(courseId);

          return isUserMatch && isCourseMatch;
        }) || null
      );
    } catch (err) {
      console.warn('Enrollment fetch fallback:', err.message);
      return null;
    }
  },

  // Get all courses enrolled by a specific student with lessons
  async getStudentEnrollments(userId, token) {
    try {
      // populate=* ব্যবহার করে সেইফ রিকোয়েস্ট (500 এরর আসবে না)
      const res = await fetchFromStrapi('/enrollments?populate[course][populate]=*&populate[user]=*', { token }).catch(
        async () => await fetchFromStrapi('/enrollments?populate=*', { token })
      );

      const enrollments = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      return enrollments.filter((e) => {
        const data = e.attributes || e;
        const u = data.user?.data || data.user;
        const uId = u?.documentId || u?.id || u?.attributes?.documentId || u?.attributes?.id || data.user;
        return String(uId) === String(userId);
      });
    } catch (err) {
      console.warn('Failed to load student enrollments:', err.message);
      return [];
    }
  },

  // Enroll user into a course
  async enrollCourse(courseId, userId, token) {
    const payloads = [
      {
        data: {
          user: typeof userId === 'string' && userId.length > 10 ? { set: [userId] } : userId,
          course: typeof courseId === 'string' && courseId.length > 10 ? { set: [courseId] } : courseId,
        },
      },
      {
        data: {
          user: userId,
          course: courseId,
        },
      },
    ];

    for (const payload of payloads) {
      try {
        const res = await fetchFromStrapi('/enrollments', {
          method: 'POST',
          token,
          body: JSON.stringify(payload),
        });
        if (res?.data || res?.id) return res;
      } catch {
        // try next payload
      }
    }
    return null;
  },

  // Get user completed lessons safely without deep-filter 500 crashes
  async getLessonProgress(courseId, userId, token) {
    const localKey = courseId ? `learnova_progress_${userId}_${courseId}` : null;
    let localSaved = [];
    if (typeof window !== 'undefined' && localKey) {
      try {
        localSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
      } catch {
        localSaved = [];
      }
    }

    try {
      const res = await fetchFromStrapi('/lesson-progresses?populate=*', { token });
      const allProgresses = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      // Filter by user
      const userProgresses = allProgresses.filter((p) => {
        const data = p.attributes || p;
        const u = data.user?.data || data.user;
        const uId = u?.documentId || u?.id || u?.attributes?.documentId || u?.attributes?.id || data.user;
        return String(uId) === String(userId);
      });

      if (!courseId) {
        return userProgresses;
      }

      const courseProgresses = userProgresses.filter((p) => {
        const data = p.attributes || p;
        const c = data.course?.data || data.course;
        const cId = c?.documentId || c?.id || c?.attributes?.documentId || c?.attributes?.id || data.course;
        return String(cId) === String(courseId);
      });

      if (courseProgresses.length > 0) {
        return courseProgresses;
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

    const localKey = `learnova_progress_${userDocId}_${courseDocId}`;
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        if (!existing.includes(lessonDocId)) {
          existing.push(lessonDocId);
          localStorage.setItem(localKey, JSON.stringify(existing));
        }
      } catch {
        // ignore
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