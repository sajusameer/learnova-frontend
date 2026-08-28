import { fetchFromStrapi } from '@/lib/api';

export const dashboardService = {
  // Get all courses and calculate progress for the student
  async getStudentDashboardData(userId, token) {
    try {
      const [coursesRes, progressRes] = await Promise.all([
        fetchFromStrapi('/courses?populate=*', { token }),
        fetchFromStrapi('/lesson-progresses?populate=*', { token }).catch(() => ({ data: [] })),
      ]);

      const courses = coursesRes.data || [];
      const progresses = progressRes.data || [];

      // Local progress fallback
      const coursesWithProgress = courses.map((course) => {
        const cData = course.attributes || course;
        const lessons = cData.lessons?.data || cData.lessons || [];
        const courseId = course.id;

        // Find completed lessons for this course
        const backendCompleted = progresses.filter((p) => {
          const pData = p.attributes || p;
          const uId = pData.user?.data?.id || pData.user?.id || pData.user?.documentId || pData.user;
          const cTargetId = pData.course?.data?.id || pData.course?.id || pData.course?.documentId || pData.course;
          return String(uId) === String(userId) && String(cTargetId) === String(courseId);
        });

        const localKey = `learnova_progress_${userId}_${courseId}`;
        let localCompleted = [];
        if (typeof window !== 'undefined') {
          localCompleted = JSON.parse(localStorage.getItem(localKey) || '[]');
        }

        const totalLessons = lessons.length;
        const completedCount = Math.max(backendCompleted.length, localCompleted.length);
        const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return {
          ...course,
          data: cData,
          totalLessons,
          completedCount,
          percent: Math.min(percent, 100),
        };
      });

      return coursesWithProgress;
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      return [];
    }
  },
};