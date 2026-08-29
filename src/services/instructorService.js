import { fetchFromStrapi } from '@/lib/api';

export const instructorService = {
  // Get all courses created by this instructor
  async getInstructorCourses(userId, token) {
    try {
      const res = await fetchFromStrapi('/courses?populate=*', { token });
      const allCourses = res.data || [];

      // Filter courses owned by this instructor
      return allCourses.filter((course) => {
        const cData = course.attributes || course;
        const ownerId = cData.user?.data?.id || cData.user?.id || cData.user?.documentId || cData.user;
        return String(ownerId) === String(userId);
      });
    } catch (err) {
      console.warn('Failed to load instructor courses:', err);
      return [];
    }
  },

  // Create a new course
  async createCourse(courseData, userId, token) {
    const payload = {
      data: {
        title: courseData.title,
        slug: courseData.slug || courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: courseData.description,
        category: courseData.category,
        level: courseData.level || 'Beginner',
        user: userId,
      },
    };

    return await fetchFromStrapi('/courses', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },
};