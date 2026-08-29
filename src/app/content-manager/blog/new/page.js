'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { blogService } from '@/services/blogService';

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    body: '',
    postStatus: 'published',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in first to publish an article.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await blogService.createPost(formData, user.id, token);
      router.push('/content-manager');
    } catch (err) {
      setError(err.message || 'Failed to publish post.');
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
        <Link href="/content-manager" className="text-xs text-indigo-600 font-semibold hover:underline">
          &larr; Back to Content Manager
        </Link>
        <h1 className="text-2xl font-black text-[var(--color-brand-text-main)] mt-2">Write New Article</h1>
        <p className="text-xs text-[var(--color-brand-text-muted)] mt-1">Compose educational content for the Learnova publication.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Article Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Next.js 15 Fullstack Architecture"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Cover Image URL</label>
            <input
              type="url"
              required
              value={formData.cover}
              onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Publishing Status</label>
            <select
              value={formData.postStatus}
              onChange={(e) => setFormData({ ...formData, postStatus: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
            >
              <option value="published">Published (Public)</option>
              <option value="draft">Draft (Private)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Article Body (Markdown/Text)</label>
          <textarea
            rows={10}
            required
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Write your guide here..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600 font-mono text-xs"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            {saving ? 'Publishing Article...' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
}