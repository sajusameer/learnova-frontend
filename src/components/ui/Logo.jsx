import Link from 'next/link';

export default function Logo({ className = "h-8 w-auto", textClassName = "text-xl" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
      <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-primary)] flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:bg-[var(--color-brand-primary-hover)] transition">
        {/* Minimalist L + Book Icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-[var(--color-brand-text-main)] group-hover:text-[var(--color-brand-primary)] transition ${textClassName}`}>
          Learnova
        </span>
      </div>
    </Link>
  );
}