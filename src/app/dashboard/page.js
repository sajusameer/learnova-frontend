// 'use client';
// import { useAuth } from '@/context/AuthContext';

// export default function StudentDashboardPage() {
//   const { user } = useAuth();
//   return (
//     <div className="max-w-7xl mx-auto px-4 py-16">
//       <h1 className="text-2xl font-bold">Student Dashboard</h1>
//       <p className="mt-2 text-gray-600">Welcome, {user?.username} ({user?.role?.name})</p>
//     </div>
//   );
// } 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dashboardService } from '@/services/dashboardService';

export default function StudentDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      if (!user || !token) return;
      try {
        const data = await dashboardService.getStudentDashboardData(user.id, token);
        setCourses(data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--color-brand-text-muted)]">Loading your learning space...</p>
      </div>
    );
  }

  // Analytics Metrics
  const totalEnrolled = courses.length;
  const totalCompletedLessons = courses.reduce((acc, c) => acc + c.completedCount, 0);
  const totalLessonsOverall = courses.reduce((acc, c) => acc + c.totalLessons, 0);
  const completedCourses = courses.filter((c) => c.percent === 100).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[var(--color-brand-primary)] uppercase tracking-wider">Student Dashboard</span>
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

      {/* Courses in Progress Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[var(--color-brand-text-main)]">My Learning Tracks</h2>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
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

                    {/* Dynamic Progress Bar */}
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