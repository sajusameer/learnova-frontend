'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogService, extractCoverImage, getCleanBody } from '@/services/blogService';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

export default function PublicBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await blogService.getPublishedPosts();
        setPosts(data || []);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading articles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-2xl space-y-2">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
          Publications
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Engineering & Insights</h1>
        <p className="text-sm text-slate-600">
          Articles, architectural blueprints, and engineering tutorials written by our lead engineers.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No published articles available at this moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const data = post.attributes || post;
            const postId = post.documentId || post.id || data.id;
            const slug = data.slug || postId;

            // বডি ও কভার ইমেজ নিরাপদে বের করা
            const rawBody = data.body || data.content || '';
            const extractedCover = typeof rawBody === 'string' ? extractCoverImage(rawBody) : '';
            const coverSrc = extractedCover || data.coverUrl || data.cover || DEFAULT_COVER;

            const cleanSnippet = typeof rawBody === 'string' ? getCleanBody(rawBody) : '';
            const previewText = cleanSnippet ? cleanSnippet.slice(0, 120) + '...' : 'Read full publication...';

            return (
              <article
                key={postId}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                <div className="h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={coverSrc || DEFAULT_COVER}
                    alt={data.title || 'Article cover'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase">
                      {data.category || 'Article'}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {data.title}
                    </h2>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {previewText}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <Link
                      href={`/blog/${slug}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Read Article &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}