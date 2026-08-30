'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchFromStrapi } from '@/lib/api';

export default function CreatePostPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e, asDraft = false) => {
    if (e) e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setErrorMsg('Title and Content body are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    // কভার ইমেজ বডিতে যুক্ত করা
    let formattedBody = body;
    if (coverUrl && coverUrl.trim()) {
      formattedBody = `![cover](${coverUrl.trim()})\n\n${body}`;
    }

    // ড্রাফট হলে টাইটেলে [DRAFT] ট্যাগ নিশ্চিত করা
    let finalTitle = title.trim();
    if (asDraft && !finalTitle.startsWith('[DRAFT]')) {
      finalTitle = `[DRAFT] ${finalTitle}`;
    } else if (!asDraft && finalTitle.startsWith('[DRAFT]')) {
      finalTitle = finalTitle.replace(/^\[DRAFT\]\s*/i, '');
    }

    try {
      // শুধুমাত্র Strapi-র বৈধ কোর ফিল্ড পাঠানো
      const postData = {
        title: finalTitle,
        body: formattedBody,
      };

      await fetchFromStrapi('/blog-posts', {
        method: 'POST',
        token,
        body: { data: postData },
      });

      router.push('/content-manager');
      router.refresh();
    } catch (err) {
      console.error('Failed to create post:', err);
      setErrorMsg(err.message || 'Failed to publish post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <Link href="/content-manager" className="text-xs text-indigo-600 font-semibold hover:underline">
            &larr; Back to Content Hub
          </Link>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Write New Article</h1>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Article Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Building Scalable Architecture"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-medium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cover Image URL</label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Content Body</label>
          <textarea
            required
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your article content here..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-sans"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
          >
            {submitting ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
}