'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardService } from '@/services/dashboardService';
import { instructorService } from '@/services/instructorService';

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [studentCourses, setStudentCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if current logged-in user is an Instructor
  const isInstructor =
    user?.role?.type === 'instructor' ||
    user?.role?.name?.toLowerCase().includes('instructor') ||
    user?.username?.toLowerCase().includes('instructor');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      if (!user || !token) return;
      try {
        if (isInstructor) {
          const created = await instructorService.getInstructorCourses(user.id, token);
          setInstructorCourses(created);
        } else {
          const enrolled = await dashboardService.getStudentDashboardData(user.id, token);
          setStudentCourses(enrolled);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, token, authLoading, isInstructor, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--color-brand-text-muted)]">Loading dashboard metrics...</p>
      </div>
    );
  }

  // ================= INSTRUCTOR DASHBOARD VIEW =================
  if (isInstructor) {
    const totalCreated = instructorCourses.length;
    const totalLessonsPublished = instructorCourses.reduce((acc, c) => {
      const cData = c.attributes || c;
      const lList = cData.lessons?.data || cData.lessons || [];
      return acc + lList.length;
    }, 0);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Instructor Banner */}
        <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
              Instructor Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-sm text-[var(--color-brand-text-muted)]">
              Manage your curriculum, create new masterclasses, and monitor performance.
            </p>
          </div>

          <Link
            href="/instructor/courses/new"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            + Create New Course
          </Link>
        </div>

        {/* Instructor Analytics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
            <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Courses Created</p>
            <p className="text-3xl font-black text-[var(--color-brand-text-main)]">{totalCreated}</p>
          </div>

          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
            <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Total Lessons</p>
            <p className="text-3xl font-black text-indigo-600">{totalLessonsPublished}</p>
          </div>

          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
            <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Course Status</p>
            <p className="text-3xl font-black text-green-600">Active</p>
          </div>
        </div>

        {/* Created Courses List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--color-brand-text-main)]">My Published Courses</h2>

          {instructorCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorCourses.map((course) => {
                const cData = course.attributes || course;
                const lessons = cData.lessons?.data || cData.lessons || [];
                const slugOrId = cData.slug || course.documentId || course.id;

                return (
                  <div
                    key={course.id || course.documentId}
                    className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold uppercase tracking-wider">
                          {cData.category || 'Development'}
                        </span>
                        <span className="text-[var(--color-brand-text-muted)] font-medium">
                          {lessons.length} Lessons
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[var(--color-brand-text-main)] line-clamp-2">
                        {cData.title}
                      </h3>

                      <p className="text-xs text-[var(--color-brand-text-muted)] line-clamp-2">
                        {cData.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/courses/${slugOrId}`}
                        className="flex-1 text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs transition border border-gray-200"
                      >
                        View Page
                      </Link>
                      <Link
    href={`/instructor/courses/${slugOrId}/edit`}
    className="flex-1 text-center py-2 px-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold rounded-xl text-xs transition"
  >
    Edit Course
  </Link>
                      <Link
                        href={`/courses/${slugOrId}/learn`}
                        className="flex-1 text-center py-2 px-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-semibold rounded-xl text-xs transition"
                      >
                        Preview
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-[var(--color-brand-border)] rounded-2xl space-y-4">
              <p className="text-base font-semibold text-[var(--color-brand-text-main)]">You haven't created any courses yet</p>
              <p className="text-sm text-[var(--color-brand-text-muted)]">Click below to publish your first learning course.</p>
              <Link
                href="/instructor/courses/new"
                className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm transition shadow-sm"
              >
                Create Your First Course
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================= STUDENT DASHBOARD VIEW =================
  const totalEnrolled = studentCourses.length;
  const totalCompletedLessons = studentCourses.reduce((acc, c) => acc + c.completedCount, 0);
  const totalLessonsOverall = studentCourses.reduce((acc, c) => acc + c.totalLessons, 0);
  const completedCourses = studentCourses.filter((c) => c.percent === 100).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Student Banner */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider">
            Student Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            Keep pushing forward to achieve your learning goals.
          </p>
        </div>

        <Link
          href="/courses"
          className="px-5 py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          Browse More Courses
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Enrolled Courses</p>
          <p className="text-3xl font-black text-[var(--color-brand-text-main)]">{totalEnrolled}</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Completed Lessons</p>
          <p className="text-3xl font-black text-indigo-600">
            {totalCompletedLessons} <span className="text-sm font-normal text-gray-500">/ {totalLessonsOverall}</span>
          </p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Finished Courses</p>
          <p className="text-3xl font-black text-green-600">{completedCourses}</p>
        </div>
      </div>

      {/* Enrolled Courses List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[var(--color-brand-text-main)]">My Learning Tracks</h2>

        {studentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentCourses.map((course) => {
              const { data, totalLessons, completedCount, percent } = course;
              const slugOrId = data.slug || course.documentId || course.id;

              return (
                <div
                  key={course.id || course.documentId}
                  className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-[var(--color-brand-primary)] font-semibold uppercase tracking-wider">
                        {data.category || 'Development'}
                      </span>
                      <span className="text-[var(--color-brand-text-muted)] font-medium">
                        {completedCount} of {totalLessons} done
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--color-brand-text-main)] line-clamp-2">
                      {data.title}
                    </h3>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[var(--color-brand-text-muted)]">Progress</span>
                        <span className="text-[var(--color-brand-primary)]">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[var(--color-brand-primary)] h-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/courses/${slugOrId}/learn`}
                    className="block w-full text-center py-2.5 px-4 bg-indigo-50 hover:bg-[var(--color-brand-primary)] text-[var(--color-brand-primary)] hover:text-white font-semibold rounded-xl text-sm transition"
                  >
                    {percent === 100 ? 'Review Lessons' : 'Continue Learning'}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-[var(--color-brand-border)] rounded-2xl space-y-4">
            <p className="text-base font-semibold text-[var(--color-brand-text-main)]">No courses enrolled yet</p>
            <p className="text-sm text-[var(--color-brand-text-muted)]">Start your journey today by selecting a track from our course catalog.</p>
            <Link
              href="/courses"
              className="inline-block px-5 py-2.5 bg-[var(--color-brand-primary)] text-white font-semibold rounded-xl text-sm transition shadow-sm"
            >
              Explore Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}