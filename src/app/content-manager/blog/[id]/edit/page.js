'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchFromStrapi } from '@/lib/api';

export default function EditBlogPostPage() {
  const params = useParams();
  const routeId = params?.id || params?.slug || Object.values(params || {})[0];
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [docId, setDocId] = useState('');
  const [title, setTitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
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
        const res = await fetchFromStrapi('/blog-posts?populate=*', { token });
        const allPosts = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

        const post = allPosts.find(
          (p) =>
            String(p.documentId) === String(routeId) ||
            String(p.id) === String(routeId)
        );

        if (post) {
          const d = post.attributes || post;
          setDocId(post.documentId || post.id);
          setTitle(d.title || '');
          setCoverImageUrl(d.coverImageUrl || '');
          setIsDraft(d.postStatus === 'draft' || (d.title && d.title.startsWith('[DRAFT]')));

          // Blocks ফরম্যাট থেকে প্লেইন টেক্সটে কনভার্ট
          if (Array.isArray(d.body)) {
            const extracted = d.body
              .map((block) =>
                block.children?.map((c) => c.text || '').join('') || ''
              )
              .join('\n\n');
            setBody(extracted);
          } else if (typeof d.body === 'string') {
            setBody(d.body);
          } else {
            setBody('');
          }
        } else {
          setError('Post not found.');
        }
      } catch (err) {
        console.error('Failed to load post:', err);
        setError('Failed to load post details.');
      } finally {
        setLoading(false);
      }
    };

    if (routeId && user) loadPost();
  }, [routeId, user, token, authLoading, router]);

  const handleSubmit = async (e, forceDraft = null) => {
    if (e) e.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    setError(null);

    const draftState = forceDraft !== null ? forceDraft : isDraft;
    const targetStatus = draftState ? 'draft' : 'published';

    // Strapi Blocks ফরম্যাট তৈরি
    const paragraphs = body.trim().split('\n\n').filter(Boolean);
    const blocksData = paragraphs.length > 0 
      ? paragraphs.map((p) => ({
          type: 'paragraph',
          children: [{ type: 'text', text: p.trim() }],
        }))
      : [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: body.trim() }],
          },
        ];

    const payload = {
      data: {
        title: title.trim(),
        body: blocksData, // Strapi Blocks ফরম্যাট পাঠানো হচ্ছে
        coverImageUrl: coverImageUrl.trim() || null,
        postStatus: targetStatus,
      },
    };

    try {
      const targetEndpoint = `/blog-posts/${docId || routeId}`;
      await fetchFromStrapi(targetEndpoint, {
        method: 'PUT',
        token,
        body: payload,
      });

      router.push(`/blog/${docId || routeId}`);
      router.refresh();
    } catch (err) {
      console.error('Failed to update post:', err);
      setError(err.message || 'Update failed! Check Strapi permissions.');
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
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
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
            rows={8}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write full article content here..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs leading-relaxed"
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