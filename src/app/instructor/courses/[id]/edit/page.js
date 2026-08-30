'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { instructorService } from '@/services/instructorService';
import { fetchFromStrapi } from '@/lib/api';

export default function EditCoursePage() {
  const params = useParams();
  const id = params?.id || params?.slug;
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [existingLessons, setExistingLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', content: '' });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadCourse = async () => {
      try {
        let res = await fetchFromStrapi(`/courses/${id}?populate=*`, { token }).catch(() => null);

        if (!res?.data) {
          const slugRes = await fetchFromStrapi(`/courses?filters[slug][$eq]=${id}&populate=*`, { token }).catch(() => null);
          if (slugRes?.data && slugRes.data.length > 0) {
            res = { data: slugRes.data[0] };
          }
        }

        const data = res?.data;
        if (data) {
          const cData = data.attributes || data;
          setFormData({
            title: cData.title || '',
            description: cData.description || '',
          });
          setExistingLessons(cData.lessons?.data || cData.lessons || []);
        } else {
          setMessage('Course not found in database.');
        }
      } catch (err) {
        console.error('Failed to load course for edit:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && user && token) {
      loadCourse();
    }
  }, [id, user, token, authLoading, router]);

  const handleCourseUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      await instructorService.updateCourse(id, formData, token);
      setMessage('Course details updated successfully!');
    } catch (err) {
      setMessage(`Update failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title.trim() || !newLesson.videoUrl.trim()) return;
    setAddingLesson(true);

    try {
      const res = await instructorService.addLessonToCourse(id, newLesson, token);
      if (res?.data) {
        setExistingLessons((prev) => [...prev, res.data]);
        setNewLesson({ title: '', videoUrl: '', content: '' });
        setMessage('New lesson added successfully!');
      }
    } catch (err) {
      setMessage(`Failed to add lesson: ${err.message}`);
    } finally {
      setAddingLesson(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <Link href="/instructor" className="text-xs text-[var(--color-brand-primary)] font-semibold hover:underline">
          &larr; Back to Instructor Portal
        </Link>
        <h1 className="text-2xl font-black text-[var(--color-brand-text-main)] mt-2">Edit Course & Curriculum</h1>
        <p className="text-xs text-[var(--color-brand-text-muted)] mt-1">Update course metadata and manage curriculum lessons.</p>
      </div>

      {message && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Course Info Update */}
      <form onSubmit={handleCourseUpdate} className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-brand-text-main)] border-b border-[var(--color-brand-border)] pb-3">
          Course Details
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Course Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-brand-text-main)]">Course Description</label>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] text-sm focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className="px-6 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
          >
            {updating ? 'Saving...' : 'Save Course Info'}
          </button>
        </div>
      </form>

      {/* Existing Lessons List */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-brand-text-main)] border-b border-[var(--color-brand-border)] pb-3">
          Curriculum Lessons ({existingLessons.length})
        </h2>

        <div className="space-y-2">
          {existingLessons.length === 0 ? (
            <p className="text-xs text-gray-500">No lessons created yet.</p>
          ) : (
            existingLessons.map((lesson, idx) => {
              const lData = lesson.attributes || lesson;
              return (
                <div key={lesson.id || idx} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{lData.title}</p>
                      <p className="text-[11px] text-gray-500 truncate max-w-md">{lData.videoUrl || lData.video_url}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add New Lesson Form */}
      <form onSubmit={handleAddLesson} className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-[var(--color-brand-text-main)] border-b border-[var(--color-brand-border)] pb-3">
          + Add New Lesson
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Lesson Title</label>
            <input
              type="text"
              required
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              placeholder="e.g. Next.js Data Fetching"
              className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Video URL</label>
            <input
              type="url"
              required
              value={newLesson.videoUrl}
              onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Lesson Content</label>
          <input
            type="text"
            value={newLesson.content}
            onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
            placeholder="Key takeaway notes..."
            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={addingLesson}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
          >
            {addingLesson ? 'Adding...' : 'Add Lesson to Course'}
          </button>
        </div>
      </form>
    </div>
  );
}