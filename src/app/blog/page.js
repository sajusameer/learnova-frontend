'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogService, extractCoverImage, getCleanBody } from '@/services/blogService';

export default function PublicBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const getAuthorDisplay = (author) => {
    if (!author) return 'Learnova Editorial';
    if (typeof author === 'object') {
      return author.username || author.email || 'Learnova Editorial';
    }
    return String(author);
  };

  const filteredPosts = posts.filter((post) => {
    const pData = post.attributes || post;
    const title = pData.title || '';
    const body = pData.body || '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      body.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-brand-border)] pb-8">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Learnova Publication
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-brand-text-main)]">
            Engineering & Education Blog
          </h1>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            Deep-dives into modern web architecture, backend scalability, and role governance.
          </p>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-white text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[var(--color-brand-text-muted)]">Loading published articles...</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => {
            const pData = post.attributes || post;
            const postId = post.documentId || post.id;
            const coverUrl = extractCoverImage(pData.body);
            const cleanText = getCleanBody(pData.body);
            const excerpt = cleanText ? `${cleanText.slice(0, 130)}...` : 'Read article details...';

            return (
              <article
                key={postId}
                className="bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition group"
              >
                <div className="h-44 w-full bg-gray-100 overflow-hidden relative">
                  <img
                    src={coverUrl}
                    alt={pData.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-brand-text-muted)]">
                      <span className="font-semibold text-indigo-600">{getAuthorDisplay(pData.author)}</span>
                      <span>
                        {pData.createdAt
                          ? new Date(pData.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recently'}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[var(--color-brand-text-main)] group-hover:text-indigo-600 transition line-clamp-2">
                      {pData.title}
                    </h2>

                    <p className="text-xs text-[var(--color-brand-text-muted)] leading-relaxed line-clamp-3">
                      {excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      href={`/blog/${postId}`}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      Read Full Article &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-white border border-[var(--color-brand-border)] rounded-2xl space-y-3">
          <p className="text-base font-bold text-[var(--color-brand-text-main)]">No articles found</p>
        </div>
      )}
    </div>
  );
}