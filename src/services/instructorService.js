import { fetchFromStrapi } from '@/lib/api';

export const instructorService = {
  // Get all courses created specifically by this instructor
  async getInstructorCourses(userId, token, username) {
    try {
      const res = await fetchFromStrapi('/courses?populate=*', { token });
      const allCourses = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      return allCourses.filter((course) => {
        const cData = course.attributes || course;

        // Extract owner user data handling Strapi v4/v5 nesting variations
        const rawUser = cData.user?.data || cData.user;
        const userAttr = rawUser?.attributes || rawUser || {};

        const ownerId = rawUser?.id || rawUser?.documentId || userAttr?.id || userAttr?.documentId;
        const ownerUsername =
          userAttr?.username ||
          rawUser?.username ||
          (typeof cData.user === 'string' ? cData.user : null) ||
          cData.instructor;

        // Match either by ID or by Username
        const isIdMatched = userId && ownerId && String(ownerId) === String(userId);
        const isNameMatched =
          username && ownerUsername && String(ownerUsername).toLowerCase() === String(username).toLowerCase();

        return Boolean(isIdMatched || isNameMatched);
      });
    } catch (err) {
      console.warn('Failed to load instructor courses:', err);
      return [];
    }
  },

  // Get enrolled students and their progress for instructor's courses
  // async getStudentsProgressForCourses(courseIds, token) {
  //   if (!courseIds || courseIds.length === 0) return [];
  //   try {
  //     // Safe populate to avoid 500 errors in Strapi v5
  //     const [enrollmentsRes, progressesRes, allCoursesRes] = await Promise.all([
  //       fetchFromStrapi('/enrollments?populate=*', { token }).catch(() => ({ data: [] })),
  //       fetchFromStrapi('/lesson-progresses?populate=*', { token }).catch(() => ({ data: [] })),
  //       fetchFromStrapi('/courses?populate=*', { token }).catch(() => ({ data: [] })),
  //     ]);

  //     const enrollments = Array.isArray(enrollmentsRes?.data) ? enrollmentsRes.data : [];
  //     const progresses = Array.isArray(progressesRes?.data) ? progressesRes.data : [];
  //     const allCourses = Array.isArray(allCoursesRes?.data) ? allCoursesRes.data : [];

  //     const targetCourseIds = courseIds.map(String);

  //     // Filter enrollments belonging only to this instructor's courses
  //     const relevantEnrollments = enrollments.filter((e) => {
  //       const eData = e.attributes || e;
  //       const c = eData.course?.data || eData.course;
  //       const cAttr = c?.attributes || c || {};
  //       const cId = c?.documentId || c?.id || cAttr?.documentId || cAttr?.id || eData.course;
  //       return targetCourseIds.includes(String(cId));
  //     });

  //     return relevantEnrollments.map((e) => {
  //       const eData = e.attributes || e;
  //       const u = eData.user?.data || eData.user;
  //       const uAttr = u?.attributes || u || {};
  //       const studentId = u?.documentId || u?.id || uAttr?.documentId || uAttr?.id || eData.user;
  //       const studentName = uAttr?.username || u?.username || 'Student';
  //       const studentEmail = uAttr?.email || u?.email || 'N/A';

  //       const c = eData.course?.data || eData.course;
  //       const cAttr = c?.attributes || c || {};
  //       const courseId = c?.documentId || c?.id || cAttr?.documentId || cAttr?.id || eData.course;

  //       // Get accurate course and lessons from allCourses
  //       const fullCourse = allCourses.find((fc) => {
  //         const fcData = fc.attributes || fc;
  //         return String(fc.documentId || fc.id) === String(courseId) || (cAttr.title && fcData.title === cAttr.title);
  //       });

  //       const fcData = fullCourse?.attributes || fullCourse || cAttr;
  //       const courseTitle = fcData.title || cAttr.title || 'Course';
  //       const lessons = fcData.lessons?.data || fcData.lessons || [];
  //       const totalLessons = lessons.length > 0 ? lessons.length : 2;

  //       // Calculate completed lessons for this student & course
  //       const studentProgress = progresses.filter((p) => {
  //         const pData = p.attributes || p;
  //         const pu = pData.user?.data || pData.user;
  //         const puAttr = pu?.attributes || pu || {};
  //         const puId = pu?.documentId || pu?.id || puAttr?.documentId || puAttr?.id || pData.user;

  //         const pc = pData.course?.data || pData.course;
  //         const pcAttr = pc?.attributes || pc || {};
  //         const pcId = pc?.documentId || pc?.id || pcAttr?.documentId || pcAttr?.id || pData.course;

  //         // Check direct course match OR check if the completed lesson is part of this course
  //         const isDirectCourseMatch = pcId && String(pcId) === String(courseId);

  //         const pl = pData.lesson?.data || pData.lesson;
  //         const plAttr = pl?.attributes || pl || {};
  //         const plId = pl?.documentId || pl?.id || plAttr?.documentId || plAttr?.id || pData.lesson;

  //         const isLessonMatch = lessons.some((l) => {
  //           const lId = l.documentId || l.id || l.attributes?.documentId || l.attributes?.id;
  //           return String(lId) === String(plId);
  //         });

  //         return String(puId) === String(studentId) && (isDirectCourseMatch || isLessonMatch);
  //       });

  //       const completedCount = studentProgress.length;
  //       const percent = Math.min(Math.round((completedCount / totalLessons) * 100), 100);

  //       return {
  //         id: e.documentId || e.id,
  //         studentName,
  //         studentEmail,
  //         courseTitle,
  //         completedLessons: completedCount,
  //         totalLessons,
  //         percent,
  //       };
  //     });
  //   } catch (err) {
  //     console.warn('Failed to load student progress:', err);
  //     return [];
  //   }
  // },
// Get enrolled students and their progress for instructor's courses (Deduplicated)
  async getStudentsProgressForCourses(courseIds, token) {
    if (!courseIds || courseIds.length === 0) return [];
    try {
      const [enrollmentsRes, progressesRes, allCoursesRes] = await Promise.all([
        fetchFromStrapi('/enrollments?populate=*', { token }).catch(() => ({ data: [] })),
        fetchFromStrapi('/lesson-progresses?populate=*', { token }).catch(() => ({ data: [] })),
        fetchFromStrapi('/courses?populate=*', { token }).catch(() => ({ data: [] })),
      ]);

      const enrollments = Array.isArray(enrollmentsRes?.data) ? enrollmentsRes.data : [];
      const progresses = Array.isArray(progressesRes?.data) ? progressesRes.data : [];
      const allCourses = Array.isArray(allCoursesRes?.data) ? allCoursesRes.data : [];

      const targetCourseIds = courseIds.map(String);

      // Filter enrollments belonging only to instructor's courses
      const relevantEnrollments = enrollments.filter((e) => {
        const eData = e.attributes || e;
        const c = eData.course?.data || eData.course;
        const cAttr = c?.attributes || c || {};
        const cId = c?.documentId || c?.id || cAttr?.documentId || cAttr?.id || eData.course;
        return targetCourseIds.includes(String(cId));
      });

      // Deduplicate by Student + Course pair
      const uniqueEnrollmentsMap = new Map();
      relevantEnrollments.forEach((e) => {
        const eData = e.attributes || e;
        const u = eData.user?.data || eData.user;
        const uAttr = u?.attributes || u || {};
        const studentId = u?.documentId || u?.id || uAttr?.documentId || uAttr?.id || eData.user;

        const c = eData.course?.data || eData.course;
        const cAttr = c?.attributes || c || {};
        const courseId = c?.documentId || c?.id || cAttr?.documentId || cAttr?.id || eData.course;

        const pairKey = `${studentId}_${courseId}`;
        if (!uniqueEnrollmentsMap.has(pairKey)) {
          uniqueEnrollmentsMap.set(pairKey, e);
        }
      });

      const uniqueEnrollments = Array.from(uniqueEnrollmentsMap.values());

      return uniqueEnrollments.map((e) => {
        const eData = e.attributes || e;
        const u = eData.user?.data || eData.user;
        const uAttr = u?.attributes || u || {};
        const studentId = u?.documentId || u?.id || uAttr?.documentId || uAttr?.id || eData.user;
        const studentName = uAttr?.username || u?.username || 'Student';
        const studentEmail = uAttr?.email || u?.email || 'N/A';

        const c = eData.course?.data || eData.course;
        const cAttr = c?.attributes || c || {};
        const courseId = c?.documentId || c?.id || cAttr?.documentId || cAttr?.id || eData.course;

        const fullCourse = allCourses.find((fc) => {
          const fcData = fc.attributes || fc;
          return String(fc.documentId || fc.id) === String(courseId) || (cAttr.title && fcData.title === cAttr.title);
        });

        const fcData = fullCourse?.attributes || fullCourse || cAttr;
        const courseTitle = fcData.title || cAttr.title || 'Course';
        const lessons = fcData.lessons?.data || fcData.lessons || [];
        const totalLessons = lessons.length > 0 ? lessons.length : 2;

        const studentProgress = progresses.filter((p) => {
          const pData = p.attributes || p;
          const pu = pData.user?.data || pData.user;
          const puAttr = pu?.attributes || pu || {};
          const puId = pu?.documentId || pu?.id || puAttr?.documentId || puAttr?.id || pData.user;

          const pc = pData.course?.data || pData.course;
          const pcAttr = pc?.attributes || pc || {};
          const pcId = pc?.documentId || pc?.id || pcAttr?.documentId || pcAttr?.id || pData.course;

          const isDirectCourseMatch = pcId && String(pcId) === String(courseId);

          const pl = pData.lesson?.data || pData.lesson;
          const plAttr = pl?.attributes || pl || {};
          const plId = pl?.documentId || pl?.id || plAttr?.documentId || plAttr?.id || pData.lesson;

          const isLessonMatch = lessons.some((l) => {
            const lId = l.documentId || l.id || l.attributes?.documentId || l.attributes?.id;
            return String(lId) === String(plId);
          });

          return String(puId) === String(studentId) && (isDirectCourseMatch || isLessonMatch);
        });

        const completedCount = studentProgress.length;
        const percent = Math.min(Math.round((completedCount / totalLessons) * 100), 100);

        return {
          id: e.documentId || e.id,
          studentId,
          studentName,
          studentEmail,
          courseTitle,
          completedLessons: completedCount,
          totalLessons,
          percent,
        };
      });
    } catch (err) {
      console.warn('Failed to load student progress:', err);
      return [];
    }
  },
  // Create Course along with its Lessons & bind to Instructor
  async createCourseWithLessons(courseData, lessons, userId, token) {
    const slugValue =
      courseData.slug ||
      courseData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const coursePayload = {
      data: {
        title: courseData.title,
        slug: slugValue,
        description: courseData.description,
        user: typeof userId === 'string' && userId.length > 10 ? { set: [userId] } : userId,
      },
    };

    const createdCourseRes = await fetchFromStrapi('/courses', {
      method: 'POST',
      token,
      body: JSON.stringify(coursePayload),
    });

    const newCourseId =
      createdCourseRes?.data?.documentId ||
      createdCourseRes?.data?.id ||
      createdCourseRes?.id;

    if (lessons && lessons.length > 0 && newCourseId) {
      for (const lesson of lessons) {
        if (!lesson.title?.trim()) continue;

        const lessonPayload = {
          data: {
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            content: lesson.content || 'Video lecture module',
            course: typeof newCourseId === 'string' && newCourseId.length > 10 ? { set: [newCourseId] } : newCourseId,
          },
        };

        try {
          await fetchFromStrapi('/lessons', {
            method: 'POST',
            token,
            body: JSON.stringify(lessonPayload),
          });
        } catch (lErr) {
          console.warn('Lesson creation note:', lErr.message);
        }
      }
    }

    return createdCourseRes;
  },

  async updateCourse(courseId, courseData, token) {
    const payload = {
      data: {
        title: courseData.title,
        description: courseData.description,
      },
    };

    return await fetchFromStrapi(`/courses/${courseId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    });
  },

  async addLessonToCourse(courseId, lessonData, token) {
    const payload = {
      data: {
        title: lessonData.title,
        videoUrl: lessonData.videoUrl,
        content: lessonData.content || 'Video lecture module',
        course: typeof courseId === 'string' && courseId.length > 10 ? { set: [courseId] } : courseId,
      },
    };

    return await fetchFromStrapi('/lessons', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },
};