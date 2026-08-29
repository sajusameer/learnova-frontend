'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { blogService } from '@/services/blogService';

export default function ContentManagerDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadPosts = async () => {
      if (!user || !token) return;
      try {
        const data = await blogService.getAllPostsForManager(token);
        setPosts(data || []);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadPosts();
  }, [user, token, authLoading, router]);

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await blogService.deletePost(postId, token);
      setPosts((prev) => prev.filter((p) => (p.documentId || p.id) !== postId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const getAuthorDisplay = (author) => {
    if (!author) return 'Editorial';
    if (typeof author === 'object') {
      return author.username || author.email || 'Editorial';
    }
    return String(author);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--color-brand-text-muted)]">Loading content manager workspace...</p>
      </div>
    );
  }

  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => {
    const item = p.attributes || p;
    return (item.postStatus || item.status) === 'published';
  }).length;
  const draftCount = totalPosts - publishedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
            Content Manager Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
            Welcome, {user?.username}!
          </h1>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            Create, moderate, and publish engineering articles for the Learnova community.
          </p>
        </div>

        <Link
          href="/content-manager/blog/new"
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          + Write New Post
        </Link>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Total Articles</p>
          <p className="text-3xl font-black text-[var(--color-brand-text-main)]">{totalPosts}</p>
        </div>
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Published</p>
          <p className="text-3xl font-black text-green-600">{publishedCount}</p>
        </div>
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Drafts</p>
          <p className="text-3xl font-black text-amber-500">{draftCount}</p>
        </div>
      </div>

      {/* Articles Management Table */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[var(--color-brand-border)] flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--color-brand-text-main)]">All Articles</h2>
          <Link href="/blog" className="text-xs font-semibold text-indigo-600 hover:underline">
            View Public Blog &rarr;
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-[var(--color-brand-border)] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => {
                  const pData = post.attributes || post;
                  const postId = post.documentId || post.id;
                  const isPub = (pData.postStatus || pData.status) === 'published';

                  return (
                    <tr key={postId} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900 max-w-xs truncate">
                        {pData.title}
                      </td>
                      <td className="p-4 text-gray-600">{getAuthorDisplay(pData.author)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPub ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {pData.postStatus || 'published'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {pData.createdAt ? new Date(pData.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/content-manager/blog/${postId}/edit`}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(postId)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-gray-800">No blog posts found</p>
            <Link
              href="/content-manager/blog/new"
              className="inline-block px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Write First Article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}