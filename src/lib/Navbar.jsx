'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout, getDashboardPath } = useAuth();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path) => pathname === path;

  const roleString = user?.role?.name || user?.role?.type || user?.username || '';
  const normalized = roleString.toLowerCase().replace(/[\s-_]+/g, '');

  const dashboardLabel = () => {
    if (normalized.includes('admin')) return 'Admin Panel';
    if (normalized.includes('instructor')) return 'Instructor Portal';
    if (normalized.includes('content') || normalized.includes('manager')) return 'Content Manager';
    return 'Dashboard';
  };

  const resolveDashboardHref = () => {
    if (typeof getDashboardPath === 'function') {
      return getDashboardPath(user?.role);
    }
    if (normalized.includes('admin')) return '/admin';
    if (normalized.includes('content') || normalized.includes('manager')) return '/content-manager';
    return '/dashboard';
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[var(--color-brand-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Logo />

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition ${
                  isActive(link.href)
                    ? 'text-[var(--color-brand-primary)] font-semibold'
                    : 'text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-primary)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href={resolveDashboardHref()}
                  className="text-xs font-semibold bg-indigo-50 text-[var(--color-brand-primary)] hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-100 transition"
                >
                  {dashboardLabel()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-[var(--color-brand-error)] hover:bg-red-50 px-3 py-2 rounded-xl transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text-main)] px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white px-4 py-2 rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[var(--color-brand-text-muted)] hover:text-[var(--color-brand-text-main)] hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-b border-[var(--color-brand-border)] bg-white px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? 'bg-indigo-50 text-[var(--color-brand-primary)] font-semibold'
                  : 'text-[var(--color-brand-text-muted)] hover:bg-gray-50 hover:text-[var(--color-brand-text-main)]'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-[var(--color-brand-border)] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={resolveDashboardHref()}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-indigo-50 text-[var(--color-brand-primary)] font-medium rounded-xl text-sm"
                >
                  {dashboardLabel()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-2 border border-red-200 text-[var(--color-brand-error)] rounded-xl text-sm font-medium hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm font-medium text-[var(--color-brand-text-main)] hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white rounded-xl text-sm font-medium shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}