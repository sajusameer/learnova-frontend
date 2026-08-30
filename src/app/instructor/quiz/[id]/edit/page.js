'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchFromStrapi } from '@/lib/api';

export default function EditQuizPage() {
  const params = useParams();
  const quizId = params?.id;
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [targetDocId, setTargetDocId] = useState(quizId);
  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctIndex: 0 }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadQuiz = async () => {
      try {
        const res = await fetchFromStrapi('/quizzes?populate=*', { token });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

        const found = list.find(
          (q) => String(q.documentId) === String(quizId) || String(q.id) === String(quizId)
        );

        if (found) {
          const d = found.attributes || found;
          setTargetDocId(found.documentId || found.id);
          setQuizTitle(d.title || '');
          setPassingScore(d.passingScore || 70);

          if (Array.isArray(d.questions) && d.questions.length > 0) {
            setQuestions(
              d.questions.map((q) => ({
                questionText: q.question || q.questionText || '',
                options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                correctIndex: q.correctAnswerIndex ?? q.correctIndex ?? 0
              }))
            );
          }
        } else {
          setError('Quiz not found.');
        }
      } catch (err) {
        console.error('Fetch quiz error:', err);
        setError('Failed to load quiz details.');
      } finally {
        setLoading(false);
      }
    };

    if (quizId && user) loadQuiz();
  }, [quizId, user, token, authLoading, router]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctIndex: 0 }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleQuestionChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].questionText = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    setError(null);

    const payload = {
      data: {
        title: quizTitle.trim(),
        passingScore: Number(passingScore),
        questions: questions.map((q) => ({
          question: q.questionText.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctAnswerIndex: Number(q.correctIndex)
        }))
      }
    };

    try {
      await fetchFromStrapi(`/quizzes/${targetDocId || quizId}`, {
        method: 'PUT',
        token,
        body: payload
      });

      router.push('/instructor');
      router.refresh();
    } catch (err) {
      console.error('Update quiz error:', err);
      setError(err.message || 'Failed to update quiz.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link href="/instructor" className="text-xs text-indigo-600 font-semibold hover:underline">
          &larr; Back to Instructor Portal
        </Link>
        <h1 className="text-2xl font-black text-slate-900 mt-2">Edit Quiz</h1>
        <p className="text-xs text-slate-500">Update questions, choices, and passing criteria.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-bold text-slate-700">Quiz Title</label>
            <input
              type="text"
              required
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Passing Score (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Delete
                </button>
              )}
            </div>

            <input
              type="text"
              required
              value={q.questionText}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              placeholder="Enter question text"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Option {optIndex + 1}</label>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-700">Correct Option:</label>
              <select
                value={q.correctIndex}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIndex].correctIndex = Number(e.target.value);
                  setQuestions(updated);
                }}
                className="mt-1 block w-full sm:w-48 px-3 py-2 border border-slate-200 rounded-lg text-xs"
              >
                {q.options.map((_, idx) => (
                  <option key={idx} value={idx}>Option {idx + 1}</option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            + Add Another Question
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
          >
            {saving ? 'Updating Quiz...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}