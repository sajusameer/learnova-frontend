'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { blogService } from '@/services/blogService';

export default function BlogPostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await blogService.getPostById(id);
        console.log('Strapi Blog Post Data:', data); 
        setPost(data);
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadPost();
  }, [id]);

  const getAuthorDisplay = (author) => {
    if (!author) return 'Learnova Editorial';
    if (typeof author === 'object') {
      return author.username || author.email || author.name || 'Learnova Editorial';
    }
    return String(author);
  };

  // Extract all text content recursively regardless of Strapi format
  const extractBody = (data) => {
    if (!data) return '';
    const raw = data.body || data.content || data.description || data.text || data.article;
    if (!raw) return '';

    // Handle Strapi 5 Rich Text Blocks array
    if (Array.isArray(raw)) {
      return raw
        .map((block) => {
          if (block.children && Array.isArray(block.children)) {
            return block.children.map((c) => c.text || '').join('');
          }
          return typeof block === 'string' ? block : '';
        })
        .filter(Boolean)
        .join('\n\n');
    }

    if (typeof raw === 'string') {
      const cleaned = raw.replace(/!\[.*?\]\(.*?\)\s*/g, '').trim();
      return cleaned.length > 0 ? cleaned : raw;
    }

    return String(raw);
  };

  const extractImage = (data) => {
    if (!data) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80';
    if (data.cover && typeof data.cover === 'string') return data.cover;
    const raw = data.body || data.content || '';
    if (typeof raw === 'string') {
      const match = raw.match(/!\[.*?\]\((.*?)\)/);
      if (match && match[1]) return match[1];
    }
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--color-brand-text-muted)]">Loading publication...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[var(--color-brand-text-main)]">Article Not Found</h2>
        <Link href="/blog" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  const pData = post.attributes || (post.data ? (post.data.attributes || post.data) : post);
  const coverUrl = extractImage(pData);
  const bodyContent = extractBody(pData);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <Link href="/blog" className="text-xs text-indigo-600 font-semibold hover:underline">
          &larr; Back to Articles
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-brand-text-main)] mt-3 leading-tight">
          {pData.title || 'Building Scalable Fullstack Architecture with Next.js & Strapi'}
        </h1>

        <div className="flex items-center gap-4 text-xs text-[var(--color-brand-text-muted)] mt-4 border-b border-[var(--color-brand-border)] pb-4">
          <span className="font-semibold text-indigo-600">By {getAuthorDisplay(pData.author)}</span>
          <span>•</span>
          <span>
            {pData.createdAt
              ? new Date(pData.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recently Published'}
          </span>
        </div>
      </div>

      {/* Featured Cover */}
      {coverUrl && (
        <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-[var(--color-brand-border)] shadow-sm">
          <img src={coverUrl} alt="Cover image" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Article Content */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-10 shadow-sm">
        {bodyContent ? (
          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line space-y-4 font-normal">
            {bodyContent}
          </div>
        ) : (
          <div className="text-sm text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">
            <p>
              In modern web development, decoupling your frontend presentation layer from backend business logic provides superior flexibility, performance, and developer velocity.
            </p>
            <p>
              <strong>1. The Power of Next.js App Router:</strong><br />
              Next.js App Router introduces React Server Components (RSC) by default, drastically reducing client-side JavaScript payloads. By rendering components on the server close to your data source, initial page loads become nearly instantaneous with optimal Core Web Vitals.
            </p>
            <p>
              <strong>2. Headless Content Authority with Strapi:</strong><br />
              Strapi delivers an intuitive, self-hosted headless CMS engine. It handles complex data schemas—such as courses, video lessons, quiz assessments, and user roles—while exposing clean REST APIs secured by JWT Bearer authentication.
            </p>
            <p>
              <strong>3. Server-Enforced RBAC & Security:</strong><br />
              Frontend route protection alone is never sufficient for enterprise SaaS applications. Security must be enforced directly at the API gateway layer. Using custom Strapi policies, we ensure that students cannot alter progress records and instructors can only modify courses they explicitly own.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}