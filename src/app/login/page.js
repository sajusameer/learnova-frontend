import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[var(--color-brand-border)] rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-brand-text-main)] pt-2">Welcome Back</h2>
          <p className="text-sm text-[var(--color-brand-text-muted)]">Enter your credentials to access your account</p>
        </div>
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center text-sm text-[var(--color-brand-primary)]">
          Authentication logic will be connected in Phase 2.
        </div>
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