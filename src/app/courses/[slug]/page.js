'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { enrollmentService } from '@/services/enrollmentService';

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params?.slug || params?.id;
  
  const router = useRouter();
  const { user, token } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (!courseId || courseId === 'undefined') return;

    const fetchCourse = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://lms-backend-production-a418.up.railway.app/api';
        
        const res = await fetch(`${apiUrl}/courses/${courseId}?populate=*`);
        
        if (!res.ok) {
          throw new Error('Course not found');
        }

        const json = await res.json();
        setCourse(json.data);
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[var(--color-brand-text-main)]">Course Not Found</h2>
        <Link href="/courses" className="text-sm text-[var(--color-brand-primary)] font-semibold hover:underline">
          &larr; Back to Courses
        </Link>
      </div>
    );
  }

  const courseData = course.attributes || course;
  const lessons = courseData.lessons?.data || courseData.lessons || [];
  const instructor = courseData.user || courseData.instructor?.data?.attributes || courseData.instructor || {};

  const handleEnrollClick = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setIsEnrolling(true);
      const targetCourseId = course.documentId || course.id || courseId;
      const targetUserId = user.documentId || user.id;

      await enrollmentService.enrollCourse(targetCourseId, targetUserId, token);
      router.push('/dashboard');
    } catch (err) {
      console.error('Enrollment error:', err);
      router.push(`/courses/${courseId}/learn`);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Course Banner */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 sm:p-12 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-[var(--color-brand-primary)] uppercase tracking-wider">
            {courseData.category || 'General'}
          </span>
          <span className="text-xs font-medium text-[var(--color-brand-text-muted)] capitalize">
            Level: {courseData.level || 'All Levels'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-brand-text-main)] leading-tight">
          {courseData.title}
        </h1>

        <p className="text-base text-[var(--color-brand-text-muted)] max-w-3xl leading-relaxed">
          {courseData.description || courseData.short_description}
        </p>

        <div className="flex items-center gap-4 pt-4 border-t border-[var(--color-brand-border)]">
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-primary)] text-white font-bold flex items-center justify-center">
            {instructor.username ? instructor.username.charAt(0).toUpperCase() : 'I'}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-brand-text-main)]">
              {instructor.username || 'Course Instructor'}
            </p>
            <p className="text-xs text-[var(--color-brand-text-muted)]">{instructor.email || 'Verified Instructor'}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-brand-text-main)]">About This Course</h2>
            <div className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed whitespace-pre-line">
              {courseData.description || 'Detailed syllabus and guidelines.'}
            </div>
          </div>

          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[var(--color-brand-text-main)]">Curriculum</h2>
              <span className="text-xs text-[var(--color-brand-text-muted)] font-medium">{lessons.length} Lessons</span>
            </div>

            <div className="space-y-3">
              {lessons.length > 0 ? (
                lessons.map((lesson, idx) => {
                  const lData = lesson.attributes || lesson;
                  return (
                    <div
                      key={lesson.documentId || lesson.id || idx}
                      className="p-4 rounded-xl border border-[var(--color-brand-border)] bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-[var(--color-brand-primary)] text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-[var(--color-brand-text-main)]">
                          {lData.title}
                        </span>
                      </div>
                      {lData.duration && (
                        <span className="text-xs text-[var(--color-brand-text-muted)]">{lData.duration} min</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-[var(--color-brand-text-muted)]">No lessons uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Access</span>
              <p className="text-2xl font-black text-[var(--color-brand-primary)]">Free Enrollment</p>
            </div>

            <button
              onClick={handleEnrollClick}
              disabled={isEnrolling}
              className="w-full py-3.5 px-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-sm text-sm cursor-pointer"
            >
              {isEnrolling ? 'Enrolling...' : user ? 'Enroll Now' : 'Sign In to Enroll'}
            </button>

            <ul className="text-xs text-[var(--color-brand-text-muted)] space-y-2.5 pt-2 border-t border-[var(--color-brand-border)]">
              <li className="flex items-center gap-2">✓ Full lifetime access to all lessons</li>
              <li className="flex items-center gap-2">✓ Dynamic progress tracking & sync</li>
              <li className="flex items-center gap-2">✓ End-of-course quiz evaluation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}