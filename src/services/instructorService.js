import { fetchFromStrapi } from '@/lib/api';

export const instructorService = {
  // Get all courses created by this instructor
  async getInstructorCourses(userId, token) {
    try {
      const res = await fetchFromStrapi('/courses?populate=*', { token });
      const allCourses = res.data || [];

      return allCourses.filter((course) => {
        const cData = course.attributes || course;
        const ownerId =
          cData.user?.data?.id ||
          cData.user?.id ||
          cData.user?.documentId ||
          cData.user;
        return String(ownerId) === String(userId);
      });
    } catch (err) {
      console.warn('Failed to load instructor courses:', err);
      return [];
    }
  },

  // Create Course along with its Lessons safely
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
            course: newCourseId,
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

  // Update existing course details
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

  // Add single new lesson to an existing course
  async addLessonToCourse(courseId, lessonData, token) {
    const payload = {
      data: {
        title: lessonData.title,
        videoUrl: lessonData.videoUrl,
        content: lessonData.content || 'Video lecture module',
        course: courseId,
      },
    };

    return await fetchFromStrapi('/lessons', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },
};