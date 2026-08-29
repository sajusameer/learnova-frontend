import { fetchFromStrapi } from '@/lib/api';

export const dashboardService = {
  async getStudentDashboardData(userId, token) {
    try {
      // Strapi v5: user.id অথবা user.documentId উভয় সাপোর্ট করার জন্য
      const [enrollmentsRes, progressRes] = await Promise.all([
        fetchFromStrapi(
          `/enrollments?filters[$or][0][user][id][$eq]=${userId}&filters[$or][1][user][documentId][$eq]=${userId}&populate[course][populate]=*`,
          { token }
        ).catch(() => ({ data: [] })),
        fetchFromStrapi(
          `/lesson-progresses?filters[$or][0][user][id][$eq]=${userId}&filters[$or][1][user][documentId][$eq]=${userId}&populate=*`,
          { token }
        ).catch(() => ({ data: [] })),
      ]);

      const enrollments = enrollmentsRes?.data || [];
      const progresses = progressRes?.data || [];

      if (enrollments.length === 0) {
        return [];
      }

      return enrollments
        .map((enrollment) => {
          const item = enrollment.attributes || enrollment;
          const course = item.course?.data || item.course;
          if (!course) return null;

          const cData = course.attributes || course;
          const lessons = cData.lessons?.data || cData.lessons || [];
          const courseId = course.id || course.documentId;

          const backendCompleted = progresses.filter((p) => {
            const pData = p.attributes || p;
            const cTargetId =
              pData.course?.data?.id ||
              pData.course?.id ||
              pData.course?.documentId ||
              pData.course;
            return String(cTargetId) === String(course.id) || String(cTargetId) === String(course.documentId);
          });

          const totalLessons = lessons.length;
          const completedCount = backendCompleted.length;
          const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          return {
            ...course,
            id: course.id,
            documentId: course.documentId,
            data: cData,
            totalLessons,
            completedCount,
            percent: Math.min(percent, 100),
          };
        })
        .filter(Boolean);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      return [];
    }
  },
};