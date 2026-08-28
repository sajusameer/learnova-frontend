import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      title: 'Learn at Your Pace',
      description: 'Structured video modules with crystal-clear lesson objectives and resources.',
      icon: (
        <svg className="w-6 h-6 text-[var(--color-brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Track Real Progress',
      description: 'Dynamic percentage calculation synced directly with our secure backend API.',
      icon: (
        <svg className="w-6 h-6 text-[var(--color-brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Test Your Knowledge',
      description: 'Built-in multiple-choice quizzes with instant server-side result evaluations.',
      icon: (
        <svg className="w-6 h-6 text-[var(--color-brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Build Verified Skills',
      description: 'Created by certified instructors who maintain ownership and quality standards.',
      icon: (
        <svg className="w-6 h-6 text-[var(--color-brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const steps = [
    { num: '01', title: 'Explore', desc: 'Browse curated courses across multiple tech disciplines.' },
    { num: '02', title: 'Enroll', desc: 'One-click student enrollment tied to your secure profile.' },
    { num: '03', title: 'Learn', desc: 'Watch lessons and follow practical coding breakdowns.' },
    { num: '04', title: 'Evaluate', desc: 'Complete interactive quizzes and track mastery.' },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-[var(--color-brand-primary)] border border-indigo-100 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
            Empowering Modern Learners
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--color-brand-text-main)] max-w-4xl mx-auto leading-tight">
            Learn. Build. Grow. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)]">
              Master Real-World Skills.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-brand-text-muted)] max-w-2xl mx-auto leading-relaxed">
            A secure, role-governed learning platform. Experience structured courses, real-time progress persistence, and server-evaluated assessments.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold shadow-sm shadow-indigo-200 transition"
            >
              Explore Courses
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-[var(--color-brand-text-main)] font-semibold border border-[var(--color-brand-border)] shadow-sm transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Why Learnova? Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-brand-text-main)]">Why Learn with Learnova?</h2>
          <p className="mt-3 text-[var(--color-brand-text-muted)]">Engineered with clear separation of roles and dedicated learning paths.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-[var(--color-brand-card)] p-6 rounded-2xl border border-[var(--color-brand-border)] hover:shadow-md transition space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-[var(--color-brand-text-main)]">{feature.title}</h3>
              <p className="text-sm text-[var(--color-brand-text-muted)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Process Section */}
      <section className="bg-white border-y border-[var(--color-brand-border)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-brand-text-main)]">How It Works</h2>
            <p className="mt-3 text-[var(--color-brand-text-muted)]">Simple, focused learning lifecycle designed for retention.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative space-y-2">
                <span className="text-4xl font-extrabold text-indigo-100">{step.num}</span>
                <h3 className="text-lg font-bold text-[var(--color-brand-text-main)]">{step.title}</h3>
                <p className="text-sm text-[var(--color-brand-text-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--color-brand-primary)] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-lg shadow-indigo-200">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Start Learning?</h2>
          <p className="text-indigo-100 max-w-xl mx-auto text-base">
            Join Learnova today. Create an account, browse verified courses, and track your progress in real time.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block bg-white text-[var(--color-brand-primary)] hover:bg-indigo-50 font-semibold px-8 py-3.5 rounded-xl shadow-sm transition"
            >
              Join for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}