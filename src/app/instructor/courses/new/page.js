'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { instructorService } from '@/services/instructorService';

export default function NewCoursePage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !prev.slugModified) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    setError(null);

    try {
      await instructorService.createCourse(formData, user.id, token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create course. Ensure you have instructor permissions.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link href="/dashboard" className="text-xs text-[var(--color-brand-primary)] font-semibold hover:underline">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-black text-[var(--color-brand-text-main)] mt-2">Create New Course</h1>
        <p className="text-xs text-[var(--color-brand-text-muted)] mt-1">Set up the foundations for your learning track.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Course Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Modern Fullstack Development with Next.js"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-brand-text-main)]">URL Slug</label>
          <input
            type="text"
            name="slug"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value, slugModified: true })}
            placeholder="e.g. modern-fullstack-development"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
            >
              <option value="Web Development">Web Development</option>
              <option value="Backend Engineering">Backend Engineering</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Difficulty Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Course Description</label>
          <textarea
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a comprehensive summary of learning milestones..."
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold rounded-xl text-xs transition shadow-sm"
          >
            {saving ? 'Creating Course...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
}