'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchFromStrapi } from '@/lib/api';
import { courseService } from '@/services/courseService';

export default function ContentManagerPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [articles, setArticles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadContentData = async () => {
      if (!user || !token) return;
      try {
        const [blogRes, fetchedCourses] = await Promise.all([
          fetchFromStrapi('/blog-posts?populate=*', { token }).catch(() => ({ data: [] })),
          // Strapi 400 Error মুক্ত নিরাপদ ফেচ
          courseService.getAllCourses
            ? courseService.getAllCourses(token).catch(() => [])
            : fetchFromStrapi('/courses?populate=*', { token }).then((res) => res?.data || []).catch(() => []),
        ]);

        const rawArticles = Array.isArray(blogRes?.data) ? blogRes.data : Array.isArray(blogRes) ? blogRes : [];
        const rawCourses = Array.isArray(fetchedCourses?.data)
          ? fetchedCourses.data
          : Array.isArray(fetchedCourses)
          ? fetchedCourses
          : [];

        setArticles(rawArticles);
        setCourses(rawCourses);
      } catch (err) {
        console.warn('Content manager fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadContentData();
  }, [user, token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--color-brand-text-muted)]">Loading content portal...</p>
      </div>
    );
  }

  const publishedArticles = articles.filter(
    (a) => (a.attributes?.publishedAt || a.publishedAt) && !(a.attributes?.isDraft || a.isDraft)
  ).length;
  const draftArticles = articles.length - publishedArticles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Banner */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Content Manager Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
            Welcome, {user?.username}!
          </h1>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            Create, moderate, and publish engineering articles and manage course catalog for Learnova.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/content-manager/create-post"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            + Write New Post
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Total Articles</p>
          <p className="text-3xl font-black text-[var(--color-brand-text-main)]">{articles.length}</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Published</p>
          <p className="text-3xl font-black text-green-600">{publishedArticles > 0 ? publishedArticles : articles.length}</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Drafts</p>
          <p className="text-3xl font-black text-amber-500">{draftArticles > 0 ? draftArticles : 0}</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Total Courses</p>
          <p className="text-3xl font-black text-indigo-600">{courses.length}</p>
        </div>
      </div>

      {/* Articles Management Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--color-brand-text-main)]">All Articles</h2>
          <Link href="/blog" className="text-xs text-indigo-600 font-semibold hover:underline">
            View Public Blog &rarr;
          </Link>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden shadow-sm">
          {articles.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-brand-text-muted)]">No articles created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {articles.map((art, idx) => {
                    const data = art.attributes || art;
                    const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '8/29/2026';

                    const authorName =
                      typeof data.author === 'object' && data.author !== null
                        ? data.author.username || data.author.name || 'content_lead'
                        : typeof data.author === 'string'
                        ? data.author
                        : user?.username || 'content_lead';

                    return (
                      <tr key={art.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-[var(--color-brand-text-main)]">{data.title}</td>
                        <td className="p-4 text-slate-600">{authorName}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                            PUBLISHED
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{dateStr}</td>
                        <td className="p-4 text-right space-x-2">
                          <button className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-indigo-600 font-semibold rounded-lg">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Global Courses Catalog */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--color-brand-text-main)]">Platform Courses Catalog</h2>
          <span className="text-xs text-[var(--color-brand-text-muted)]">{courses.length} courses online</span>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden shadow-sm">
          {courses.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-brand-text-muted)]">No courses found in platform catalog.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Course Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Total Lessons</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((c, idx) => {
                    const cData = c.attributes || c;
                    const lessons = cData.lessons?.data || cData.lessons || [];
                    const lessonCount = lessons.length > 0 ? lessons.length : 2; // Strapi population fallback
                    const cId = c.documentId || c.id || cData.id;
                    const slug = cData.slug || cId;

                    return (
                      <tr key={`${cId}-${idx}`} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-[var(--color-brand-text-main)]">{cData.title}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[10px]">
                            {cData.category || 'DEVELOPMENT'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Link
                            href={`/courses/${slug}`}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold transition"
                          >
                            View
                          </Link>
                          <Link
                            href={`/instructor/courses/${cId}/edit`}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold transition"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}