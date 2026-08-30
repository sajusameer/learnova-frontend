'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchFromStrapi } from '@/lib/api';

export default function CreateQuizPage() {
  const params = useParams();
  const courseId = params?.id;
  const router = useRouter();
  const { user, token } = useAuth();

  const [quizTitle, setQuizTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctIndex: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // নতুন প্রশ্ন যোগ করার ফাংশন
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctIndex: 0 }
    ]);
  };

  // অপশন হ্যান্ডলার
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

    try {
      // ১. কুইজ তৈরি ও কোর্সের সাথে লিংক করা
      const quizPayload = {
        data: {
          title: quizTitle.trim(),
          passingScore: Number(passingScore),
          course: courseId, // Strapi Course Relation
          instructor: user.id || user.documentId,
          questions: questions.map((q) => ({
            question: q.questionText,
            options: q.options,
            correctAnswerIndex: Number(q.correctIndex)
          }))
        }
      };

      await fetchFromStrapi('/quizzes', {
        method: 'POST',
        token,
        body: quizPayload,
      });

      router.push(`/instructor/courses/${courseId}`);
      router.refresh();
    } catch (err) {
      console.error('Quiz creation error:', err);
      setError(err.message || 'Failed to create quiz. Check permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <Link href={`/instructor/courses/${courseId}`} className="text-xs text-indigo-600 font-semibold hover:underline">
          &larr; Back to Course
        </Link>
        <h1 className="text-2xl font-black text-slate-900 mt-2">Create Quiz</h1>
        <p className="text-xs text-slate-500">Add questions and multiple-choice options for your course.</p>
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
              placeholder="e.g., React Basics Assessment"
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

        {/* Questions Section */}
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">Question {qIndex + 1}</h3>
            <input
              type="text"
              required
              value={q.questionText}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              placeholder="Enter your question"
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
                    placeholder={`Option ${optIndex + 1}`}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-700">Select Correct Option:</label>
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
            {saving ? 'Creating Quiz...' : 'Publish Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}