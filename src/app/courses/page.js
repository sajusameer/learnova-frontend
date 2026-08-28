'use client';

import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';
import CourseCard from '@/components/ui/CourseCard';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await courseService.getCourses();
        setCourses(res.data || []);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const categories = ['All', ...new Set(courses.map((c) => (c.attributes || c).category).filter(Boolean))];

  const filteredCourses = courses.filter((c) => {
    const data = c.attributes || c;
    const matchesSearch = data.title?.toLowerCase().includes(search.toLowerCase()) ||
                          data.short_description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || data.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-brand-text-main)]">
          Explore Courses
        </h1>
        <p className="text-[var(--color-brand-text-muted)]">
          Learn cutting-edge skills from experienced instructors.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-[var(--color-brand-border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]"
        />

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[var(--color-brand-primary)] text-white shadow-sm'
                  : 'bg-white border border-[var(--color-brand-border)] text-[var(--color-brand-text-muted)] hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-2xl border border-[var(--color-brand-border)]" />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id || course.documentId} course={course} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-[var(--color-brand-border)] rounded-2xl space-y-2">
          <p className="text-base font-semibold text-[var(--color-brand-text-main)]">No courses found</p>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            Try adjusting your search query or category filter.
          </p>
        </div>
      )}
    </div>
  );
}