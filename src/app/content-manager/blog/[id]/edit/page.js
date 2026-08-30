'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchFromStrapi } from '@/lib/api';

export default function EditBlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [body, setBody] = useState('');
  const [isDraft, setIsDraft] = useState(false);

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
        // Bulletproof Fetch: findOne (404) এড়াতে সব ফেচ করে ফিল্টার করা হচ্ছে
        const res = await fetchFromStrapi(`/blog-posts?populate=*`, { token });
        const allPosts = res?.data || res || [];
        
        // URL id এর সাথে ম্যাচ করা
        const post = allPosts.find(p => String(p.documentId) === String(id) || String(p.id) === String(id));

        if (post) {
          const pData = post.attributes || post;
          const rawTitle = pData.title || '';
          const rawBody = pData.body || pData.content || '';

          const imgMatch = rawBody.match(/^!\[cover\]\((.*?)\)\n\n/);
          const extractedCover = imgMatch ? imgMatch[1] : (pData.coverUrl || pData.cover || '');
          const cleanBody = imgMatch ? rawBody.replace(/^!\[cover\]\(.*?\)\n\n/, '') : rawBody;

          const checkDraft = rawTitle.startsWith('[DRAFT]');
          setIsDraft(checkDraft);
          setTitle(checkDraft ? rawTitle.replace(/^\[DRAFT\]\s*/i, '') : rawTitle);
          setCoverUrl(extractedCover);
          setBody(cleanBody);
        } else {
          setError('Post not found. It may have been deleted.');
        }
      } catch (err) {
        console.error('Failed to load post for editing:', err);
        setError('Failed to load post details.');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) loadPost();
  }, [id, user, token, authLoading, router]);

  const handleSubmit = async (e, forceDraft = null) => {
    if (e) e.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    setError(null);

    const draftState = forceDraft !== null ? forceDraft : isDraft;

    let formattedBody = body;
    if (coverUrl && coverUrl.trim()) {
      formattedBody = `![cover](${coverUrl.trim()})\n\n${body}`;
    }

    let finalTitle = title.trim();
    if (draftState && !finalTitle.startsWith('[DRAFT]')) {
      finalTitle = `[DRAFT] ${finalTitle}`;
    } else if (!draftState && finalTitle.startsWith('[DRAFT]')) {
      finalTitle = finalTitle.replace(/^\[DRAFT\]\s*/i, '');
    }

    try {
      await fetchFromStrapi(`/blog-posts/${id}`, {
        method: 'PUT',
        token,
        body: {
          data: {
            title: finalTitle,
            body: formattedBody,
          },
        },
      });

      router.push('/content-manager');
      router.refresh();
    } catch (err) {
      console.error('Failed to update post:', err);
      setError(err.message || 'Update failed! Please check Strapi permissions.');
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
        <h1 className="text-2xl font-black text-slate-900 mt-2">Edit Article</h1>
        <p className="text-xs text-slate-500 mt-1">Modify content and update publish status.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, isDraft)} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Article Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Cover Image URL</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Publishing Status</label>
            <select
              value={isDraft ? 'draft' : 'published'}
              onChange={(e) => setIsDraft(e.target.value === 'draft')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs"
            >
              <option value="published">Published (Public)</option>
              <option value="draft">Draft (Private)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Article Body</label>
          <textarea
            rows={10}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-xs"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, false)}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
          >
            {saving ? 'Publishing...' : 'Publish / Update Article'}
          </button>
        </div>
      </form>
    </div>
  );
}