'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchFromStrapi } from '@/lib/api';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80';

export default function BlogPostDetailPage() {
  const params = useParams();
  const routeId = params?.id || params?.slug || Object.values(params || {})[0];

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchFromStrapi('/blog-posts?populate=*');
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

        const found = list.find((p) => {
          const d = p.attributes || p;
          return (
            String(p.documentId) === String(routeId) ||
            String(p.id) === String(routeId) ||
            String(d.slug) === String(routeId)
          );
        });

        if (found) {
          const d = found.attributes || found;

          // Blocks অ্যারে থেকে টেক্সট বের করা
          let contentText = '';
          if (Array.isArray(d.body)) {
            contentText = d.body
              .map((block) =>
                block.children?.map((child) => child.text || '').join('') || ''
              )
              .join('\n\n');
          } else if (typeof d.body === 'string') {
            contentText = d.body;
          }

          setPost({
            title: d.title || 'Untitled Post',
            body: contentText,
            coverImageUrl: d.coverImageUrl || DEFAULT_COVER,
            date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '8/31/2026',
            author: d.author?.username || 'Learnova Team',
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (routeId) load();
  }, [routeId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Post Not Found</h2>
        <Link href="/blog" className="text-xs text-indigo-600 font-semibold underline">
          &larr; Back to Publications
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <Link href="/blog" className="text-xs text-indigo-600 font-semibold hover:underline">
          &larr; Back to Publications
        </Link>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{post.title}</h1>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>By <b className="text-slate-700">{post.author}</b></span>
          <span>&bull;</span>
          <span>Published {post.date}</span>
        </div>
      </div>

      <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
        <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* আর্টিকেল বডি টেক্সট */}
      <div className="text-slate-800 text-base leading-relaxed whitespace-pre-line py-4 border-t border-slate-100 font-normal">
        {post.body || <p className="text-slate-400 italic">No content available for this publication.</p>}
      </div>
    </article>
  );
}