export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-brand-text-main)]">Learnova Blog</h1>
        <p className="text-[var(--color-brand-text-muted)]">Insights, updates, and practical tutorials from our team.</p>
      </div>
      <div className="mt-10 p-12 bg-white border border-[var(--color-brand-border)] rounded-2xl text-center">
        <p className="text-[var(--color-brand-text-muted)]">Published articles will appear here.</p>
      </div>
    </div>
  );
}