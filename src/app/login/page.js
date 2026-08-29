'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(identifier, password);
      const userObj = res?.user || res;

      // 1. Extract role information from all possible Strapi representations
      const roleName = (
        userObj?.role?.name ||
        userObj?.role?.type ||
        ''
      ).toLowerCase();
      
      const userName = (userObj?.username || identifier || '').toLowerCase();

      // 2. Direct hard redirect based on priority
      if (roleName.includes('admin') || userName.includes('admin')) {
        window.location.href = '/admin';
      } else if (
        roleName.includes('content') ||
        roleName.includes('manager') ||
        userName.includes('content')
      ) {
        window.location.href = '/content-manager';
      } else if (roleName.includes('instructor') || userName.includes('instructor')) {
        window.location.href = '/instructor';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message || 'Invalid email/username or password');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[var(--color-brand-border)] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-text-main)] pt-2">
            Welcome Back
          </h2>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            Sign in to your Learnova account
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-brand-text-main)] uppercase tracking-wider mb-1.5">
              Email or Username
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. content_lead or admin"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-white text-sm text-[var(--color-brand-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-brand-text-main)] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-white text-sm text-[var(--color-brand-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-[var(--color-brand-text-muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[var(--color-brand-primary)] font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}