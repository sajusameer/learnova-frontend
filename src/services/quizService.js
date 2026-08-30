import { fetchFromStrapi } from '@/lib/api';

export const quizService = {
  async getCourseQuizzes(courseId, token) {
    try {
      const res = await fetchFromStrapi('/quizzes?populate=*', { token }).catch(() => ({ data: [] }));
      const quizzes = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      return quizzes.filter((q) => {
        const qData = q.attributes || q;
        const c = qData.course?.data || qData.course;
        const cAttr = c?.attributes || c || {};
        const cId = c?.documentId || c?.id || cAttr?.documentId || cAttr?.id || qData.course;
        return String(cId) === String(courseId);
      });
    } catch (err) {
      console.warn('Failed to load course quizzes:', err);
      return [];
    }
  },

  async submitQuizResult(quizId, userId, score, totalQuestions, token, customTitle) {
    const numericScore = Number(score) || 0;
    const numericTotal = Number(totalQuestions) || 0;

    const payloads = [
      {
        data: {
          score: numericScore,
          totalQuestions: numericTotal,
          user: typeof userId === 'string' && userId.length > 10 ? { set: [userId] } : userId,
          quiz: typeof quizId === 'string' && quizId.length > 10 ? { set: [quizId] } : quizId,
        },
      },
      {
        data: {
          score: numericScore,
          totalQuestions: numericTotal,
          user: userId,
          quiz: quizId,
        },
      },
    ];

    for (const payload of payloads) {
      try {
        const res = await fetchFromStrapi('/quiz-results', {
          method: 'POST',
          token,
          body: JSON.stringify(payload),
        });
        if (res && (res.data || res.id)) return res;
      } catch {
        // try fallback
      }
    }

    // Local fallback
    if (typeof window !== 'undefined') {
      const key = `learnova_quiz_results_${userId}`;
      try {
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({
          id: Date.now(),
          score: numericScore,
          totalQuestions: numericTotal,
          quiz: { id: quizId, title: customTitle || 'Course Milestone Assessment' },
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(existing));
      } catch {
        // ignore
      }
    }

    return { success: true, localOnly: true };
  },

  async getStudentQuizResults(userId, token) {
    let localSaved = [];
    if (typeof window !== 'undefined') {
      try {
        localSaved = JSON.parse(localStorage.getItem(`learnova_quiz_results_${userId}`) || '[]');
      } catch {
        localSaved = [];
      }
    }

    try {
      const res = await fetchFromStrapi('/quiz-results?populate=*', { token }).catch(() => ({ data: [] }));
      const allResults = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      const filtered = allResults.filter((r) => {
        const data = r.attributes || r;
        const u = data.user?.data || data.user;
        const uAttr = u?.attributes || u || {};
        const uId = u?.documentId || u?.id || uAttr?.documentId || uAttr?.id || data.user;
        return String(uId) === String(userId);
      });

      if (filtered.length > 0) return filtered;
    } catch (err) {
      console.warn('Quiz results fetch fallback to local:', err);
    }

    return localSaved;
  },

  async getInstructorCourseQuizResults(courseIds, token) {
    if (!courseIds || courseIds.length === 0) return [];
    try {
      const res = await fetchFromStrapi('/quiz-results?populate=*', { token }).catch(() => ({ data: [] }));
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  },
};