// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { courseService } from '@/services/courseService';
// import { enrollmentService } from '@/services/enrollmentService';
// import { useAuth } from '@/context/AuthContext';
// import VideoPlayer from '@/components/ui/VideoPlayer';

// export default function CourseLearnPage() {
//   const { slug } = useParams();
//   const router = useRouter();
//   const { user, token, loading: authLoading } = useAuth();

//   const [course, setCourse] = useState(null);
//   const [activeLesson, setActiveLesson] = useState(null);
//   const [completedLessons, setCompletedLessons] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);

//   useEffect(() => {
//     if (!authLoading && !user) {
//       router.push('/login');
//       return;
//     }

//     const loadData = async () => {
//       if (!slug || !user || !token) return;
//       try {
//         const courseData = await courseService.getCourseBySlug(slug);
//         if (!courseData) {
//           router.push('/courses');
//           return;
//         }
//         setCourse(courseData);

//         const rawLessons = courseData.attributes?.lessons?.data || courseData.lessons || [];
//         if (rawLessons.length > 0) {
//           setActiveLesson(rawLessons[0]);
//         }

//         // Fetch completed progress
//         const courseId = courseData.id;
//         const progresses = await enrollmentService.getLessonProgress(courseId, user.id, token);
//         const completedIds = progresses.map((p) => {
//           const l = p.attributes?.lesson?.data || p.lesson;
//           return l?.id || l;
//         }).filter(Boolean);

//         setCompletedLessons(completedIds);
//       } catch (err) {
//         console.error('Failed to load course lessons:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, [slug, user, token, authLoading, router]);

//   const handleMarkComplete = async () => {
//     if (!activeLesson || !course || !user || updating) return;
//     setUpdating(true);

//     const activeId = activeLesson.id;

//     try {
//       await enrollmentService.markLessonComplete(activeLesson, course, user, token);
//       setCompletedLessons((prev) => Array.from(new Set([...prev, activeId])));
//     } catch (err) {
//       console.error('Error saving progress:', err);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   if (loading || authLoading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
//         <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
//         <p className="text-sm text-[var(--color-brand-text-muted)]">Loading learning workspace...</p>
//       </div>
//     );
//   }

//   const cData = course?.attributes || course || {};
//   const lessons = cData.lessons?.data || cData.lessons || [];
//   const activeData = activeLesson?.attributes || activeLesson || {};
//   const isCurrentCompleted = activeLesson ? completedLessons.includes(activeLesson.id) : false;
//   const progressPercent = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
//       {/* Top Bar Navigation & Progress */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[var(--color-brand-border)]">
//         <div>
//           <Link href={`/courses/${slug}`} className="text-xs text-[var(--color-brand-primary)] font-semibold hover:underline">
//             &larr; Back to Overview
//           </Link>
//           <h1 className="text-xl font-bold text-[var(--color-brand-text-main)] mt-1">{cData.title}</h1>
//         </div>

//         {/* Progress Bar */}
//         <div className="w-full md:w-64 space-y-2">
//           <div className="flex justify-between text-xs font-semibold text-[var(--color-brand-text-muted)]">
//             <span>Course Progress</span>
//             <span>{progressPercent}%</span>
//           </div>
//           <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
//             <div
//               className="bg-[var(--color-brand-primary)] h-full transition-all duration-300"
//               style={{ width: `${progressPercent}%` }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Main Learning Workspace */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* Left 2 Cols: Video Player & Content */}
//         <div className="lg:col-span-2 space-y-6">
//           <VideoPlayer
//             url={activeData.videoUrl || activeData.video_url}
//             title={activeData.title}
//           />

//           <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-4">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-brand-border)] pb-4">
//               <div>
//                 <span className="text-xs font-semibold text-[var(--color-brand-primary)] uppercase tracking-wider">Current Lesson</span>
//                 <h2 className="text-2xl font-bold text-[var(--color-brand-text-main)] mt-0.5">{activeData.title}</h2>
//               </div>

//               <button
//                 onClick={handleMarkComplete}
//                 disabled={isCurrentCompleted || updating}
//                 className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
//                   isCurrentCompleted
//                     ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
//                     : 'bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white shadow-sm'
//                 }`}
//               >
//                 {updating ? 'Saving...' : isCurrentCompleted ? '✓ Completed' : 'Mark as Completed'}
//               </button>
//             </div>

//             {/* Lesson Text / Notes */}
//             <div className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed pt-2 whitespace-pre-line">
//               {typeof activeData.content === 'string'
//                 ? activeData.content
//                 : 'Follow along with the video module above.'}
//             </div>
//           </div>
//         </div>

//         {/* Right Col: Lessons Sidebar */}
//         <div className="space-y-4">
//           <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-4 sticky top-24">
//             <h3 className="text-base font-bold text-[var(--color-brand-text-main)]">Curriculum Playlist</h3>

//             <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
//               {lessons.map((lesson, idx) => {
//                 const lData = lesson.attributes || lesson;
//                 const isActive = activeLesson?.id === lesson.id;
//                 const isDone = completedLessons.includes(lesson.id);

//                 return (
//                   <button
//                     key={lesson.id || idx}
//                     onClick={() => setActiveLesson(lesson)}
//                     className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 text-sm ${
//                       isActive
//                         ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-[var(--color-brand-primary)]'
//                         : 'border-[var(--color-brand-border)] bg-gray-50/50 hover:bg-gray-100 text-[var(--color-brand-text-main)]'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
//                         isDone ? 'bg-green-600 text-white' : isActive ? 'bg-[var(--color-brand-primary)] text-white' : 'bg-gray-200 text-gray-700'
//                       }`}>
//                         {isDone ? '✓' : idx + 1}
//                       </span>
//                       <span className="line-clamp-1">{lData.title}</span>
//                     </div>
//                   </button>
//                 );
//                 <div className="pt-4 border-t border-[var(--color-brand-border)]">
//   <Link
//     href={`/courses/${slug}/quiz`}
//     className="w-full block text-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
//   >
//     Take Course Assessment &rarr;
//   </Link>
// </div>
//               })}
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }  
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import VideoPlayer from '@/components/ui/VideoPlayer';

export default function CourseLearnPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      if (!slug || !user || !token) return;
      try {
        const courseData = await courseService.getCourseBySlug(slug);
        if (!courseData) {
          router.push('/courses');
          return;
        }
        setCourse(courseData);

        const rawLessons = courseData.attributes?.lessons?.data || courseData.lessons || [];
        if (rawLessons.length > 0) {
          setActiveLesson(rawLessons[0]);
        }

        // Fetch completed progress
        const courseId = courseData.id;
        const progresses = await enrollmentService.getLessonProgress(courseId, user.id, token);
        const completedIds = progresses.map((p) => {
          const l = p.attributes?.lesson?.data || p.lesson;
          return l?.id || l;
        }).filter(Boolean);

        setCompletedLessons(completedIds);
      } catch (err) {
        console.error('Failed to load course lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, user, token, authLoading, router]);

  const handleMarkComplete = async () => {
    if (!activeLesson || !course || !user || updating) return;
    setUpdating(true);

    const activeId = activeLesson.id;

    try {
      await enrollmentService.markLessonComplete(activeLesson, course, user, token);
      setCompletedLessons((prev) => Array.from(new Set([...prev, activeId])));
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--color-brand-text-muted)]">Loading learning workspace...</p>
      </div>
    );
  }

  const cData = course?.attributes || course || {};
  const lessons = cData.lessons?.data || cData.lessons || [];
  const activeData = activeLesson?.attributes || activeLesson || {};
  const isCurrentCompleted = activeLesson ? completedLessons.includes(activeLesson.id) : false;
  const progressPercent = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Navigation & Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[var(--color-brand-border)]">
        <div>
          <Link href={`/courses/${slug}`} className="text-xs text-[var(--color-brand-primary)] font-semibold hover:underline">
            &larr; Back to Overview
          </Link>
          <h1 className="text-xl font-bold text-[var(--color-brand-text-main)] mt-1">{cData.title}</h1>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[var(--color-brand-text-muted)]">
            <span>Course Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--color-brand-primary)] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Learning Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Video Player & Content */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer
            url={activeData.videoUrl || activeData.video_url}
            title={activeData.title}
          />

          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-brand-border)] pb-4">
              <div>
                <span className="text-xs font-semibold text-[var(--color-brand-primary)] uppercase tracking-wider">Current Lesson</span>
                <h2 className="text-2xl font-bold text-[var(--color-brand-text-main)] mt-0.5">{activeData.title}</h2>
              </div>

              <button
                onClick={handleMarkComplete}
                disabled={isCurrentCompleted || updating}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isCurrentCompleted
                    ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : 'bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white shadow-sm'
                }`}
              >
                {updating ? 'Saving...' : isCurrentCompleted ? '✓ Completed' : 'Mark as Completed'}
              </button>
            </div>

            {/* Lesson Text / Notes */}
            <div className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed pt-2 whitespace-pre-line">
              {typeof activeData.content === 'string'
                ? activeData.content
                : 'Follow along with the video module above.'}
            </div>
          </div>
        </div>

        {/* Right Col: Lessons Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-[var(--color-brand-text-main)]">Curriculum Playlist</h3>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {lessons.map((lesson, idx) => {
                const lData = lesson.attributes || lesson;
                const isActive = activeLesson?.id === lesson.id;
                const isDone = completedLessons.includes(lesson.id);

                return (
                  <button
                    key={lesson.id || idx}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 text-sm ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-[var(--color-brand-primary)]'
                        : 'border-[var(--color-brand-border)] bg-gray-50/50 hover:bg-gray-100 text-[var(--color-brand-text-main)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                        isDone ? 'bg-green-600 text-white' : isActive ? 'bg-[var(--color-brand-primary)] text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </span>
                      <span className="line-clamp-1">{lData.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quiz Assessment Button */}
            <div className="pt-4 border-t border-[var(--color-brand-border)]">
              <Link
                href={`/courses/${slug}/quiz`}
                className="w-full block text-center py-2.5 px-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold rounded-xl text-xs transition shadow-sm"
              >
                Take Course Assessment &rarr;
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}