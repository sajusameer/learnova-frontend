// import { fetchFromStrapi } from '@/lib/api';

// export const enrollmentService = {
//   // Check if current user is enrolled in a course
//   async getEnrollment(courseId, userId, token) {
//     try {
//       const res = await fetchFromStrapi('/enrollments?populate=*', { token });
//       const enrollments = res.data || [];
//       return (
//         enrollments.find((e) => {
//           const data = e.attributes || e;
//           const uId = data.user?.data?.id || data.user?.id || data.user;
//           const cId = data.course?.data?.id || data.course?.id || data.course;
//           return String(uId) === String(userId) && String(cId) === String(courseId);
//         }) || null
//       );
//     } catch (err) {
//       console.warn('Enrollment fetch fallback:', err.message);
//       return null;
//     }
//   },

//   // Enroll user into a course
//   async enrollCourse(courseId, userId, token) {
//     return await fetchFromStrapi('/enrollments', {
//       method: 'POST',
//       token,
//       body: JSON.stringify({
//         data: {
//           user: userId,
//           course: courseId,
//           enrolled_at: new Date().toISOString(),
//         },
//       }),
//     });
//   },

//   // Get user completed lessons for a course
//   async getLessonProgress(courseId, userId, token) {
//     try {
//       const res = await fetchFromStrapi('/lesson-progresses?populate=*', { token });
//       const allProgresses = res.data || [];

//       // Filter locally to avoid deep filtering syntax errors
//       return allProgresses.filter((p) => {
//         const data = p.attributes || p;
//         const uId = data.user?.data?.id || data.user?.id || data.user;
//         const cId = data.course?.data?.id || data.course?.id || data.course;
//         return String(uId) === String(userId) && String(cId) === String(courseId);
//       });
//     } catch (err) {
//       console.warn('LessonProgress fetch fallback:', err.message);
//       return [];
//     }
//   },

//   // Mark a lesson as completed
// //   async markLessonComplete(lessonId, courseId, userId, token) {
// //     return await fetchFromStrapi('/lesson-progresses', {
// //       method: 'POST',
// //       token,
// //       body: JSON.stringify({
// //         data: {
// //           user: userId,
// //           lesson: lessonId,
// //           course: courseId,
// //           completed: true,
// //           completed_at: new Date().toISOString(),
// //         },
// //       }),
// //     });
// //   }, 
// // Mark a lesson as completed
// //   async markLessonComplete(lessonId, courseId, userId, token) {
// //     return await fetchFromStrapi('/lesson-progresses', {
// //       method: 'POST',
// //       token,
// //       body: JSON.stringify({
// //         data: {
// //           user: userId,
// //           lesson: lessonId,
// //           course: courseId,
// //           completed: true,
// //         },
// //       }),
// //     });
// //   },

// // Mark a lesson as completed
//   async markLessonComplete(lessonId, courseId, userId, token) {
//     // Strapi v5 & v4 Universal Payload formats
//     const payloads = [
//       // 1. Direct Relation Mapping
//       {
//         data: {
//           user: userId,
//           lesson: lessonId,
//           course: courseId,
//           completed: true,
//         },
//       },
//       // 2. Strapi v5 Connect Syntax
//       {
//         data: {
//           user: { connect: [userId] },
//           lesson: { connect: [lessonId] },
//           course: { connect: [courseId] },
//           completed: true,
//         },
//       },
//     ];

//     for (const payload of payloads) {
//       try {
//         const res = await fetchFromStrapi('/lesson-progresses', {
//           method: 'POST',
//           token,
//           body: JSON.stringify(payload),
//         });
//         return res;
//       } catch (err) {
//         console.warn('Attempting payload fallback for lesson progress:', err.message);
//       }
//     }

//     // Direct fallback: try singular / alternative endpoint if plural varies
//     return await fetchFromStrapi('/lesson-progress', {
//       method: 'POST',
//       token,
//       body: JSON.stringify({
//         data: {
//           completed: true,
//         },
//       }),
//     });
//   },
// };

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

    // 1. সেভ ইন LocalStorage (যাতে ফ্রন্টএন্ড সাথে সাথে ১০০% রেসপন্স করে)
    const localKey = `learnova_progress_${user.id}_${course.id}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    if (!existing.includes(lesson.id)) {
      existing.push(lesson.id);
      localStorage.setItem(localKey, JSON.stringify(existing));
    }

    // 2. Strapi 5 & 4 কমপ্যাটিবল Payload ট্রাই
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
        // পরবর্তী পেলোড ফরম্যাটে চেষ্টা করবে
      }
    }

    return { success: true, localOnly: true };
  },
};