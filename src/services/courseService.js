// import { fetchFromStrapi } from '@/lib/api';

// export const courseService = {
//   // Fetch all published courses with relations
//   async getCourses() {
//     return await fetchFromStrapi('/courses?populate=*');
//   },

//   // Fetch a single course by its slug
//   async getCourseBySlug(slug) {
//     const res = await fetchFromStrapi(`/courses?filters[slug][$eq]=${slug}&populate[instructor]=*&populate[lessons]=*&populate[thumbnail]=*`);
//     return res.data?.[0] || null;
//   },
// };

import { fetchFromStrapi } from '@/lib/api';

export const courseService = {
  // Fetch all published courses with relations
  async getCourses() {
    return await fetchFromStrapi('/courses?populate=*');
  },

  // Fetch single course (Fallback mechanism)
  async getCourseBySlug(identifier) {
    try {
      // 1. All courses এনে slug বা id ম্যাচ করানো (কখনোই ফিল্টার এরর দিবে না)
      const res = await fetchFromStrapi('/courses?populate=*');
      const courses = res.data || [];

      const matchedCourse = courses.find((item) => {
        const d = item.attributes || item;
        return (
          d.slug === identifier ||
          String(item.id) === String(identifier) ||
          item.documentId === identifier
        );
      });

      if (matchedCourse) {
        return matchedCourse;
      }
    } catch (err) {
      console.warn('Courses list lookup failed, attempting direct fetch:', err.message);
    }

    // 2. Direct ID fallback
    try {
      const direct = await fetchFromStrapi(`/courses/${identifier}?populate=*`);
      return direct.data || null;
    } catch (e) {
      console.error('Final fallback failed:', e.message);
      return null;
    }
  },
};