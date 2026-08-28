// import Link from 'next/link';
// import Logo from '@/components/ui/Logo';

// export default function RegisterPage() {
//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
//       <div className="w-full max-w-md bg-white border border-[var(--color-brand-border)] rounded-2xl p-8 shadow-sm space-y-6">
//         <div className="flex flex-col items-center text-center space-y-2">
//           <Logo />
//           <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-text-main)] pt-2">Create an Account</h2>
//           <p className="text-sm text-[var(--color-brand-text-muted)]">Start your learning journey with Learnova</p>
//         </div>
//         <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center text-sm text-[var(--color-brand-primary)]">
//           Registration logic will be connected in Phase 2.
//         </div>
//         <div className="text-center text-sm text-[var(--color-brand-text-muted)]">
//           Already have an account?{' '}
//           <Link href="/login" className="text-[var(--color-brand-primary)] font-semibold hover:underline">
//             Sign in
//           </Link>
//         </div>
//       </div>
//     </div>
//   );

// }
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      await register(username, email, password);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[var(--color-brand-border)] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-text-main)] pt-2">Create Account</h2>
          <p className="text-sm text-[var(--color-brand-text-muted)]">Join Learnova as a Student</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-brand-text-main)] uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. john_doe"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-white text-sm text-[var(--color-brand-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-brand-text-main)] uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
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

          <div>
            <label className="block text-xs font-semibold text-[var(--color-brand-text-main)] uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-white text-sm text-[var(--color-brand-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm text-[var(--color-brand-text-muted)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--color-brand-primary)] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}