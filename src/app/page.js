import Link from 'next/link';
import { courseService } from '@/services/courseService';

export default async function HomePage() {
  // Gracefully fetch real courses from Strapi or fall back to realistic demo data
  let popularCourses = [];

  try {
    const fetched = await courseService.getAllCourses();
    if (Array.isArray(fetched) && fetched.length > 0) {
      popularCourses = fetched.slice(0, 3).map((course) => {
        const cData = course.attributes || course;
        const lessonsCount =
          cData.lessons?.data?.length ||
          (Array.isArray(cData.lessons) ? cData.lessons.length : 0);
        const instructorName =
          cData.user?.data?.attributes?.username ||
          cData.user?.username ||
          cData.instructor ||
          'Learnova Faculty';

        return {
          id: course.documentId || course.id,
          title: cData.title || 'Untitled Course',
          description: cData.description || 'Structured practical curriculum.',
          lessonCount: lessonsCount || 10,
          instructor: instructorName,
        };
      });
    }
  } catch {
    // Silent fallback to standard demo courses if backend is unreachable
  }

  // Fallback demo courses matching specifications
  if (popularCourses.length === 0) {
    popularCourses = [
      {
        id: 1,
        title: 'Next.js Fundamentals',
        description: 'Build modern web applications with Next.js and React.',
        lessonCount: 12,
        instructor: 'Alex Morgan',
      },
      {
        id: 2,
        title: 'React Essentials',
        description: 'Learn the fundamentals of building modern interfaces with React.',
        lessonCount: 10,
        instructor: 'Sarah Wilson',
      },
      {
        id: 3,
        title: 'JavaScript Mastery',
        description: 'Strengthen your JavaScript skills through practical concepts and examples.',
        lessonCount: 14,
        instructor: 'Daniel Carter',
      },
    ];
  }

  return (
    <div className="space-y-20 sm:space-y-28 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (Subtle ambient gradient tint + Soft Cyan glow) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-slate-50/40 to-[#F8FAFC] border-b border-[var(--color-brand-border)] pt-20 pb-20 sm:pt-28 sm:pb-28">
        {/* Soft atmospheric ambient glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-gradient-to-tr from-indigo-200/30 via-cyan-200/20 to-transparent blur-3xl pointer-events-none rounded-full"
          aria-hidden="true" 
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100/80 text-xs font-semibold text-indigo-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Modern Learning Platform
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--color-brand-text-main)] leading-[1.15]">
              Learn. Build. Grow.
            </h1>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
              Master Real-World Skills.
            </p>
          </div>

          <p className="text-base sm:text-lg text-[var(--color-brand-text-muted)] max-w-2xl mx-auto leading-relaxed">
            A modern learning platform with structured courses, real-time progress tracking, and interactive quizzes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/courses"
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-[0.99] text-center"
            >
              Explore Courses
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-[var(--color-brand-text-main)] text-sm font-semibold rounded-xl shadow-sm transition text-center"
            >
              Get Started
            </Link>
          </div>

          {/* 2. HERO TRUST / FEATURE ROW */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-[var(--color-brand-text-muted)]">
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>Structured Learning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>Track Your Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>Interactive Quizzes</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--color-brand-border)] pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
              Popular Courses
            </h2>
            <p className="text-sm text-[var(--color-brand-text-muted)] mt-1">
              Explore practical courses designed to help you build real-world skills.
            </p>
          </div>
          <Link
            href="/courses"
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1 self-start sm:self-auto"
          >
            View All Courses &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                    Course
                  </span>
                  <span className="text-[var(--color-brand-text-muted)] font-medium">
                    {course.lessonCount} Lessons
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--color-brand-text-main)] group-hover:text-indigo-600 transition">
                  {course.title}
                </h3>

                <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-[var(--color-brand-text-muted)]">
                  By <span className="font-semibold text-slate-700">{course.instructor}</span>
                </span>
                <Link
                  href={`/courses/${course.id}`}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHY LEARN WITH LEARNOVA */}
      <section className="bg-white border-y border-[var(--color-brand-border)] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
              Why Learn with Learnova
            </h2>
            <p className="text-sm text-[var(--color-brand-text-muted)]">
              Purpose-built tools designed to help you stay focused and build confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[var(--color-brand-border)] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-[var(--color-brand-text-main)]">Learn at Your Pace</h3>
              <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed">
                Stream modular lessons anytime and resume your progress whenever you are ready.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[var(--color-brand-border)] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-[var(--color-brand-text-main)]">Track Real Progress</h3>
              <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed">
                Keep track of every completed milestone with synchronized, real-time metrics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[var(--color-brand-border)] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-[var(--color-brand-text-main)]">Test Your Knowledge</h3>
              <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed">
                Validate your understanding with interactive quizzes and immediate result feedback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[var(--color-brand-border)] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-[var(--color-brand-text-main)]">Build Practical Skills</h3>
              <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed">
                Learn through structured courses designed around practical, real-world skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LEARNING EXPERIENCE (Product Journey & LMS Preview Card) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Context */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              YOUR LEARNING JOURNEY
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--color-brand-text-main)] leading-tight">
              Stay on track from your first lesson to your final quiz.
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-brand-text-muted)] leading-relaxed max-w-lg">
              Learn step by step, monitor your progress, and see how far you&apos;ve come with an intuitive workspace designed for focus.
            </p>
            <div className="pt-2">
              <Link
                href="/courses"
                className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
              >
                Browse Curriculum
              </Link>
            </div>
          </div>

          {/* Right Column: LMS Progress Preview Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-brand-text-main)]">
                    Next.js Fundamentals
                  </h4>
                  <p className="text-xs text-[var(--color-brand-text-muted)]">Course in progress</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600">75%</span>
                  <p className="text-[10px] text-[var(--color-brand-text-muted)]">Progress</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-3/4" />
                </div>
                <p className="text-[11px] text-[var(--color-brand-text-muted)]">
                  6 of 8 lessons completed
                </p>
              </div>

              {/* Lesson Items */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Introduction</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Routing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Data Fetching</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Server Components</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>API Integration</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Deployment</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                  <span>Performance</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />
                  <span>Final Quiz</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/courses"
                  className="block w-full py-2.5 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-brand-text-muted)]">
            A straightforward process to help you get the most out of every track.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2.5 shadow-sm">
            <span className="text-xs font-black text-indigo-600 tracking-wider">01 — Explore</span>
            <h4 className="text-sm font-bold text-[var(--color-brand-text-main)]">Browse available courses</h4>
            <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed">
              Browse available courses across different learning areas.
            </p>
          </div>

          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2.5 shadow-sm">
            <span className="text-xs font-black text-indigo-600 tracking-wider">02 — Enroll</span>
            <h4 className="text-sm font-bold text-[var(--color-brand-text-main)]">Join chosen tracks</h4>
            <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed">
              Join the courses that match your learning goals.
            </p>
          </div>

          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2.5 shadow-sm">
            <span className="text-xs font-black text-indigo-600 tracking-wider">03 — Learn</span>
            <h4 className="text-sm font-bold text-[var(--color-brand-text-main)]">Step-by-step curriculum</h4>
            <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed">
              Complete lessons and learn step by step.
            </p>
          </div>

          <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2.5 shadow-sm">
            <span className="text-xs font-black text-indigo-600 tracking-wider">04 — Track &amp; Test</span>
            <h4 className="text-sm font-bold text-[var(--color-brand-text-main)]">Verify your mastery</h4>
            <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed">
              Track your progress and test your knowledge with quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-center text-white space-y-5 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Start Learning?
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Create your account, explore courses, track your progress, and learn at your own pace.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block px-7 py-3 bg-white text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-50 transition shadow-sm"
            >
              Join for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}