

import { fetchFromStrapi } from '@/lib/api';

export const enrollmentService = {
  // Check if current user is enrolled in a course
  async getEnrollment(courseId, userId, token) {
    try {
      const res = await fetchFromStrapi('/enrollments?populate=*', { token });
      const enrollments = res.data || [];
      return (
        enrollments.find((e) => {
          const data = e.attributes || e;
          const uId = data.user?.data?.id || data.user?.id || data.user?.documentId || data.user;
          const cId = data.course?.data?.id || data.course?.id || data.course?.documentId || data.course;
          return String(uId) === String(userId) && String(cId) === String(courseId);
        }) || null
      );
    } catch (err) {
      console.warn('Enrollment fetch fallback:', err.message);
      return null;
    }
  },

  // Enroll user into a course
  async enrollCourse(courseId, userId, token) {
    return await fetchFromStrapi('/enrollments', {
      method: 'POST',
      token,
      body: JSON.stringify({
        data: {
          user: userId,
          course: courseId,
        },
      }),
    });
  },

  // Get user completed lessons for a course
  async getLessonProgress(courseId, userId, token) {
    // 1. LocalStorage চেক
    const localKey = `learnova_progress_${userId}_${courseId}`;
    const localSaved = JSON.parse(localStorage.getItem(localKey) || '[]');

    try {
      const res = await fetchFromStrapi('/lesson-progresses?populate=*', { token });
      const allProgresses = res.data || [];

      const backendProgresses = allProgresses.filter((p) => {
        const data = p.attributes || p;
        const uId = data.user?.data?.id || data.user?.id || data.user?.documentId || data.user;
        const cId = data.course?.data?.id || data.course?.id || data.course?.documentId || data.course;
        return String(uId) === String(userId) && String(cId) === String(courseId);
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

    // 1. LocalStorage
    const localKey = `learnova_progress_${user.id}_${course.id}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    if (!existing.includes(lesson.id)) {
      existing.push(lesson.id);
      localStorage.setItem(localKey, JSON.stringify(existing));
    }

    // 2. Strapi 5 & 4  Payload 
    const payloads = [
      {
        data: {
          completed: true,
          lesson: lessonDocId,
          course: courseDocId,
        },
      },
      {
        data: {
          completed: true,
          lesson: lesson.id,
          course: course.id,
          user: userDocId,
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
        return res;
      } catch {
        // next payload
      }
    }

    return { success: true, localOnly: true };
  },
};