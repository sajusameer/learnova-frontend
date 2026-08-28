export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-brand-text-main)]">About Learnova</h1>
        <p className="text-[var(--color-brand-text-muted)]">Learn. Build. Grow.</p>
      </div>
      <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-8 space-y-6 text-[var(--color-brand-text-muted)] leading-relaxed">
        <p>
          Learnova is a structured Learning Management System designed to bridge the gap between course instruction and verified student learning.
        </p>
        <p>
          Built with dedicated dashboards for Students, Instructors, Content Managers, and Administrators, the platform enforces strict data ownership rules on the backend to guarantee educational integrity.
        </p>
      </div>
    </div>
  );
}