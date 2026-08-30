'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { courseService } from '@/services/courseService';
import { quizService } from '@/services/quizService';

export default function CourseQuizPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadQuizData = async () => {
      if (!slug || !user || !token) return;
      try {
        const courseData = await courseService.getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }
        setCourse(courseData);

        const courseId = courseData.documentId || courseData.id;
        const fetchedQuizzes = await quizService.getCourseQuizzes(courseId, token);
        if (fetchedQuizzes && fetchedQuizzes.length > 0) {
          setCurrentQuiz(fetchedQuizzes[0]);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [slug, user, token, authLoading, router]);

  // Fallback demo questions matching course topics
  const defaultQuestions = [
    {
      title: 'What is the recommended approach to validate incoming requests in Next.js Server Actions?',
      options: ['Schema validation with Zod', 'Checking window.location', 'Local state verification', 'Inline try/catch only'],
      correct_answer: 0,
    },
    {
      title: 'Which header prevents clickjacking attacks on modern web applications?',
      options: ['X-Frame-Options', 'Access-Control-Allow-Origin', 'Cache-Control', 'Accept-Encoding'],
      correct_answer: 0,
    },
  ];

  const qData = currentQuiz?.attributes || currentQuiz || {};
  const rawQuestions = qData.questions?.data || qData.questions || [];
  const questions = rawQuestions.length > 0 ? rawQuestions : defaultQuestions;

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      const item = q.attributes || q;
      const correctIdx = Number(item.correctAnswer ?? item.correct_answer ?? 0);
      if (selectedAnswers[idx] === correctIdx) {
        calculatedScore += 1;
      }
    });

    const isPassed = calculatedScore / (questions.length || 1) >= 0.6;
    const quizId = currentQuiz?.documentId || currentQuiz?.id || 1;
    const userId = user?.documentId || user?.id;
    const cData = course?.attributes || course || {};
    const quizTitle = qData.title || `${cData.title || 'Course'} Assessment`;

    try {
      if (userId) {
        await quizService.submitQuizResult(
          quizId,
          userId,
          calculatedScore,
          questions.length,
          token,
          quizTitle
        );
      }
    } catch (err) {
      console.warn('Quiz submission fallback handled:', err.message);
    } finally {
      setResult({
        score: calculatedScore,
        total: questions.length,
        passed: isPassed,
      });
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--color-brand-text-muted)]">Loading assessment module...</p>
      </div>
    );
  }

  const cData = course?.attributes || course || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <Link href={`/courses/${slug}/learn`} className="text-xs text-indigo-600 font-semibold hover:underline">
            &larr; Back to Lessons
          </Link>
          <h1 className="text-2xl font-extrabold text-[var(--color-brand-text-main)] mt-1">
            {qData.title || `${cData.title || 'Course'} Assessment`}
          </h1>
          <p className="text-xs text-[var(--color-brand-text-muted)] mt-1">
            Pass the assessment (≥ 60%) to prove your course milestone completion.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          {questions.length} Questions
        </span>
      </div>

      {/* Result Card */}
      {result && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-3 ${
            result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
              {result.passed ? '🎉 Assessment Passed!' : 'Needs Revision'}
            </h2>
            <span className="text-lg font-black text-gray-900">
              Score: {result.score} / {result.total} ({Math.round((result.score / result.total) * 100)}%)
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {result.passed
              ? 'Excellent job! Your assessment score has been recorded to your dashboard.'
              : 'You scored below the 60% passing mark. Review the modules and try again.'}
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => {
                setSelectedAnswers({});
                setResult(null);
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
            >
              Retake Assessment
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
            >
              View in Dashboard &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <div className="space-y-6">
        {questions.map((question, qIdx) => {
          const item = question.attributes || question;
          const optionsList = Array.isArray(item.options)
            ? item.options
            : typeof item.options === 'string'
            ? item.options.split(',')
            : ['Option A', 'Option B', 'Option C', 'Option D'];

          return (
            <div
              key={qIdx}
              className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
                  {qIdx + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--color-brand-text-main)]">
                  {item.title || item.questionText}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {optionsList.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`text-left p-4 rounded-xl border text-sm font-medium transition flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700'
                          : 'border-slate-200 bg-gray-50/50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!result && (
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || Object.keys(selectedAnswers).length < questions.length}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            {submitting ? 'Submitting Answers...' : 'Submit Assessment'}
          </button>
        </div>
      )}
    </div>
  );
}