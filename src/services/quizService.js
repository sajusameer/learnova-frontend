import { fetchFromStrapi } from '@/lib/api';

export const quizService = {
  // Fetch quizzes related to a course safely
  async getCourseQuizzes(courseId, token) {
    try {
      // 1. Fetch quizzes with simple populate
      const res = await fetchFromStrapi('/quizzes?populate=*', { token });
      const quizzes = res.data || [];

      // Filter quizzes matching current course
      const matchedQuizzes = quizzes.filter((q) => {
        const qData = q.attributes || q;
        const cId =
          qData.course?.data?.id ||
          qData.course?.id ||
          qData.course?.documentId ||
          qData.course;
        return String(cId) === String(courseId);
      });

      return matchedQuizzes;
    } catch {
      // If quiz endpoint is empty or relations differ, fallback to empty array
      return [];
    }
  },

  // Submit quiz results safely
  async submitQuizResult(quizId, userId, score, totalQuestions, token) {
    const passed = totalQuestions > 0 ? score / totalQuestions >= 0.6 : false;

    const payload = {
      data: {
        score,
        total: totalQuestions,
        passed,
      },
    };

    // 1. Try sending to backend
    try {
      const res = await fetchFromStrapi('/quiz-results', {
        method: 'POST',
        token,
        body: JSON.stringify({
          data: {
            ...payload.data,
            user: userId,
            quiz: quizId,
          },
        }),
      });
      return res;
    } catch {
      // 2. Fallback to LocalStorage persistence
      const localKey = `learnova_quiz_${userId}_${quizId}`;
      const localData = {
        score,
        total: totalQuestions,
        passed,
        submittedAt: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(localKey, JSON.stringify(localData));
      }
      return { success: true, localOnly: true, ...localData };
    }
  },
};