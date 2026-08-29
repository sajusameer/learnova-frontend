'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { blogService, extractCoverImage, getCleanBody } from '@/services/blogService';

export default function EditBlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    cover: '',
    body: '',
    postStatus: 'published',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadPost = async () => {
      try {
        const post = await blogService.getPostById(id);
        if (post) {
          const pData = post.attributes || post;
          setFormData({
            title: pData.title || '',
            cover: extractCoverImage(pData.body),
            body: getCleanBody(pData.body),
            postStatus: pData.postStatus || 'published',
          });
        }
      } catch (err) {
        console.error('Failed to load post for editing:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && user) loadPost();
  }, [id, user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    setError(null);

    try {
      // Embed image back into markdown safely
      let finalBody = formData.body;
      if (formData.cover && formData.cover.trim()) {
        finalBody = `![cover](${formData.cover.trim()})\n\n${formData.body}`;
      }

      await blogService.updatePost(
        id,
        {
          title: formData.title,
          body: finalBody,
          postStatus: formData.postStatus,
        },
        token
      );
      router.push('/content-manager');
    } catch (err) {
      setError(err.message || 'Failed to update post.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
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
        <h1 className="text-2xl font-black text-[var(--color-brand-text-main)] mt-2">Edit Article</h1>
        <p className="text-xs text-[var(--color-brand-text-muted)] mt-1">Modify content and update publish status.</p>
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
          <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Article Body</label>
          <textarea
            rows={10}
            required
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600 font-mono text-xs"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            {saving ? 'Saving Changes...' : 'Update Article'}
          </button>
        </div>
      </form>
    </div>
  );
}