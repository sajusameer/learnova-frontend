'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { instructorService } from '@/services/instructorService';
import { enrollmentService } from '@/services/enrollmentService';
import { fetchFromStrapi } from '@/lib/api';

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [studentCourses, setStudentCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [instructorStudentProgress, setInstructorStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const uId = user.documentId || user.id;

        if (isInstructor) {
          // Instructor Flow
          const created = await instructorService.getInstructorCourses(uId, token, user.username);
          setInstructorCourses(created);

          if (created.length > 0) {
            const courseIds = created.map((c) => c.documentId || c.id);
            const progressData = await instructorService.getStudentsProgressForCourses(courseIds, token);
            setInstructorStudentProgress(progressData);
          }
        } else {
          // Student Flow: Fetch Enrollments, All Courses with Lessons, and Progresses
          const [enrollments, allCoursesRes, progresses] = await Promise.all([
            enrollmentService.getStudentEnrollments(uId, token),
            fetchFromStrapi('/courses?populate=*', { token }).catch(() => ({ data: [] })),
            enrollmentService.getLessonProgress(null, uId, token),
          ]);

          const allCoursesList = Array.isArray(allCoursesRes?.data) ? allCoursesRes.data : [];

          const processedCourses = enrollments.map((enr) => {
            const eData = enr.attributes || enr;
            const courseItem = eData.course?.data || eData.course;
            const cData = courseItem?.attributes || courseItem || {};
            const rawCId = courseItem?.documentId || courseItem?.id || cData.id || cData.documentId;

            // Find full course metadata from allCourses to guarantee lessons array exists
            const matchedFullCourse = allCoursesList.find((c) => {
              const fullData = c.attributes || c;
              return (
                String(c.documentId || c.id) === String(rawCId) ||
                (cData.slug && fullData.slug === cData.slug) ||
                (cData.title && fullData.title === cData.title)
              );
            });

            const targetCourseData = matchedFullCourse?.attributes || matchedFullCourse || cData;
            const targetCourseId = matchedFullCourse?.documentId || matchedFullCourse?.id || rawCId;

            const lessons =
              targetCourseData.lessons?.data ||
              targetCourseData.lessons ||
              cData.lessons?.data ||
              cData.lessons ||
              [];

            // Match completed lessons for this course
            const completedForCourse = progresses.filter((p) => {
              const pData = p.attributes || p;
              const pCourse = pData.course?.data || pData.course;
              const pCourseAttr = pCourse?.attributes || pCourse || {};
              const pCourseId = pCourse?.documentId || pCourse?.id || pCourseAttr?.documentId || pCourseAttr?.id || pData.course;

              // Check match by ID or check if the completed lesson belongs to this course's lesson list
              const isDirectCourseMatch = pCourseId && String(pCourseId) === String(targetCourseId);
              
              const pLesson = pData.lesson?.data || pData.lesson;
              const pLessonAttr = pLesson?.attributes || pLesson || {};
              const pLessonId = pLesson?.documentId || pLesson?.id || pLessonAttr?.documentId || pLessonAttr?.id || pData.lesson;

              const isLessonInCourse = lessons.some((l) => {
                const lId = l.documentId || l.id || l.attributes?.documentId || l.attributes?.id;
                return String(lId) === String(pLessonId);
              });

              return isDirectCourseMatch || isLessonInCourse;
            });

            const totalLessons = lessons.length;
            const completedCount = completedForCourse.length;
            const percent = totalLessons > 0 ? Math.min(Math.round((completedCount / totalLessons) * 100), 100) : 0;

            return {
              id: targetCourseId,
              slug: targetCourseData.slug || cData.slug || targetCourseId,
              title: targetCourseData.title || cData.title || 'Untitled Course',
              category: targetCourseData.category || cData.category || 'Development',
              totalLessons,
              completedCount,
              percent,
            };
          });

          // Deduplicate courses
          const uniqueCourses = processedCourses.filter(
            (course, index, self) => index === self.findIndex((c) => String(c.id) === String(course.id))
          );

          setStudentCourses(uniqueCourses);
        }
      } catch (err) {
        console.warn('Dashboard data fetch note:', err.message);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
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
            href="/instructor/create-course"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            + Create New Course
          </Link>
        </div>

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
            <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Active Students</p>
            <p className="text-3xl font-black text-green-600">{instructorStudentProgress.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-brand-text-main)]">My Published Courses</h2>

          {instructorCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {instructorCourses.map((course, idx) => {
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
                        href={`/courses/${courseId}`}
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

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-brand-text-main)]">Enrolled Students Progress</h2>
          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden shadow-sm">
            {instructorStudentProgress.length === 0 ? (
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
                    {instructorStudentProgress.map((item, idx) => (
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
      </div>
    );
  }

  // ================= STUDENT DASHBOARD VIEW =================
  const totalEnrolled = studentCourses.length;
  const totalCompletedLessons = studentCourses.reduce((acc, c) => acc + c.completedCount, 0);
  const totalLessonsOverall = studentCourses.reduce((acc, c) => acc + c.totalLessons, 0);
  const completedCourses = studentCourses.filter((c) => c.percent === 100 && c.totalLessons > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
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
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          Browse More Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Enrolled Courses</p>
          <p className="text-3xl font-black text-[var(--color-brand-text-main)]">{totalEnrolled}</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Completed Lessons</p>
          <p className="text-3xl font-black text-indigo-600">
            {totalCompletedLessons} <span className="text-sm font-semibold text-slate-400">/ {totalLessonsOverall}</span>
          </p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Finished Courses</p>
          <p className="text-3xl font-black text-green-600">{completedCourses}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--color-brand-text-main)]">My Learning Tracks</h2>

        {studentCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studentCourses.map((course, idx) => (
              <div
                key={`${course.id || course.slug}-${idx}`}
                className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[10px]">
                      {course.category}
                    </span>
                    <span className="text-[var(--color-brand-text-muted)] font-medium text-[11px]">
                      {course.completedCount} of {course.totalLessons} done
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--color-brand-text-main)] line-clamp-2">
                    {course.title}
                  </h3>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-[var(--color-brand-text-muted)]">
                      <span>Progress</span>
                      <span>{course.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${course.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  href={`/courses/${course.slug}/learn`}
                  className="w-full py-2.5 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition"
                >
                  {course.percent === 100 ? 'Review Course' : 'Continue Learning'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white border border-[var(--color-brand-border)] rounded-2xl space-y-4">
            <p className="text-sm text-[var(--color-brand-text-muted)]">You have not enrolled in any courses yet.</p>
            <Link
              href="/courses"
              className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
            >
              Explore Available Courses &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}