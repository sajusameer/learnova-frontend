'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { instructorService } from '@/services/instructorService';
import { quizService } from '@/services/quizService';

export default function InstructorDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [studentProgressList, setStudentProgressList] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadInstructorData = async () => {
      if (!user || !token) return;
      try {
        const uId = user.documentId || user.id;

        // Fetch instructor courses
        const createdCourses = await instructorService.getInstructorCourses(uId, token, user.username);
        setCourses(createdCourses);

        if (createdCourses.length > 0) {
          const courseIds = createdCourses.map((c) => c.documentId || c.id);

          // Fetch student progress and quiz results simultaneously
          const [progressData, quizzesData] = await Promise.all([
            instructorService.getStudentsProgressForCourses(courseIds, token),
            quizService.getInstructorCourseQuizResults(courseIds, token),
          ]);

          setStudentProgressList(progressData);
          setQuizResults(quizzesData);
        }
      } catch (err) {
        console.error('Failed to load instructor analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInstructorData();
  }, [user, token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--color-brand-text-muted)]">Loading instructor portal...</p>
      </div>
    );
  }

  const totalLessonsSum = courses.reduce((acc, course) => {
    const cData = course.attributes || course;
    const lessons = cData.lessons?.data || cData.lessons || [];
    return acc + lessons.length;
  }, 0);

  const activeStudentsCount = new Set(
    studentProgressList
      .map((s) => s.studentId || s.studentEmail || s.studentName)
      .filter(Boolean)
  ).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Instructor Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            Manage your curriculum, create new masterclasses, and monitor enrolled student progress.
          </p>
        </div>

        <Link
          href="/instructor/create-course"
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          + Create New Course
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">
            Courses Created
          </p>
          <p className="text-3xl font-black text-[var(--color-brand-text-main)]">{courses.length}</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">
            Total Lessons
          </p>
          <p className="text-3xl font-black text-indigo-600">{totalLessonsSum}</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">
            Active Students
          </p>
          <p className="text-3xl font-black text-green-600">{activeStudentsCount}</p>
        </div>
      </div>

      {/* Published Courses */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-brand-text-main)]">My Published Courses</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => {
              const cData = course.attributes || course;
              const lessons = cData.lessons?.data || cData.lessons || [];
              const courseId = course.documentId || course.id || cData.id;

              return (
                <div
                  key={`${courseId}-${idx}`}
                  className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[10px]">
                        {cData.category || 'Development'}
                      </span>
                      <span className="text-[var(--color-brand-text-muted)] font-medium">
                        {lessons.length} Lessons
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--color-brand-text-main)] line-clamp-2">
                      {cData.title}
                    </h3>
                    <p className="text-xs text-[var(--color-brand-text-muted)] line-clamp-2">
                      {cData.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/courses/${cData.slug || courseId}`}
                      className="flex-1 py-2 text-center bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      View Page
                    </Link>
                    <Link
                      href={`/instructor/courses/${courseId}/edit`}
                      className="flex-1 py-2 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                    >
                      Edit Course
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center bg-white border border-[var(--color-brand-border)] rounded-2xl space-y-3">
            <p className="text-sm text-[var(--color-brand-text-muted)]">You haven't created any courses yet.</p>
            <Link
              href="/instructor/create-course"
              className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition"
            >
              Create your first course &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Enrolled Students Progress Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-brand-text-main)]">Enrolled Students Progress</h2>
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden shadow-sm">
          {studentProgressList.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-brand-text-muted)]">
              No students enrolled in your courses yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Completed Lessons</th>
                    <th className="p-4">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentProgressList.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-[var(--color-brand-text-main)]">
                        {item.studentName}
                        <span className="block text-[10px] font-normal text-[var(--color-brand-text-muted)]">
                          {item.studentEmail}
                        </span>
                      </td>
                      <td className="p-4 text-[var(--color-brand-text-main)]">{item.courseTitle}</td>
                      <td className="p-4 text-[var(--color-brand-text-muted)]">
                        {item.completedLessons} / {item.totalLessons}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{item.percent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quiz & Assessment Submissions Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-brand-text-main)]">Quiz & Assessment Submissions</h2>
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden shadow-sm">
          {quizResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-brand-text-muted)]">
              No assessment submissions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Quiz / Assessment</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizResults.map((qr, idx) => {
                    const data = qr.attributes || qr;
                    const u = data.user?.data?.attributes || data.user || {};
                    const q = data.quiz?.data?.attributes || data.quiz || {};
                    const score = Number(data.score ?? 0);
                    const total = Number(data.totalQuestions ?? 2);
                    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
                    const passed = percent >= 60;

                    return (
                      <tr key={qr.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-[var(--color-brand-text-main)]">
                          {u.username || 'Student'}
                          <span className="block text-[10px] font-normal text-[var(--color-brand-text-muted)]">
                            {u.email || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--color-brand-text-main)]">
                          {q.title || 'Course Milestone Assessment'}
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {score} / {total} ({percent}%)
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              passed
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {passed ? 'Passed' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}