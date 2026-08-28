import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--color-brand-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Logo />
            <p className="text-sm text-[var(--color-brand-text-muted)] max-w-sm">
              Learn. Build. Grow. A role-governed education SaaS built for students, instructors, and content creators.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-brand-text-main)] uppercase tracking-wider">Navigation</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/courses" className="text-sm text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)] transition">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)] transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)] transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Security & Trust */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--color-brand-text-main)] uppercase tracking-wider">Platform</h3>
            <p className="mt-4 text-sm text-[var(--color-brand-text-muted)]">
              Built with server-enforced RBAC and strict data ownership policies.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--color-brand-border)] flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--color-brand-text-muted)] gap-4">
          <p>&copy; 2026 Learnova. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-[var(--color-brand-primary)] cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-[var(--color-brand-primary)] cursor-pointer transition">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}