// import Link from 'next/link';

// export default function CourseCard({ course }) {
//   // Strapi v4/v5 data structure normalization
//   const data = course.attributes || course;
//   const { title, slug, short_description, level, category, lessons, instructor } = data;

//   return (
//     <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
//       <div className="p-6 space-y-3">
//         <div className="flex items-center justify-between gap-2">
//           <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-[var(--color-brand-primary)] uppercase tracking-wider">
//             {category || 'General'}
//           </span>
//           <span className="text-xs font-medium text-[var(--color-brand-text-muted)] capitalize">
//             {level || 'All Levels'}
//           </span>
//         </div>

//         <h3 className="text-lg font-bold text-[var(--color-brand-text-main)] line-clamp-2 hover:text-[var(--color-brand-primary)] transition">
//           <Link href={`/courses/${slug}`}>
//             {title}
//           </Link>
//         </h3>

//         <p className="text-sm text-[var(--color-brand-text-muted)] line-clamp-2">
//           {short_description || 'No description provided.'}
//         </p>
//       </div>

//       <div className="p-6 pt-0 space-y-4">
//         <div className="flex items-center justify-between text-xs text-[var(--color-brand-text-muted)] border-t border-[var(--color-brand-border)] pt-4">
//           <span className="font-medium text-gray-700">
//             By {instructor?.username || instructor?.attributes?.username || 'Instructor'}
//           </span>
//           <span>{lessons?.length || lessons?.data?.length || 0} Lessons</span>
//         </div>

//         <Link
//           href={`/courses/${slug}`}
//           className="block w-full text-center py-2.5 px-4 bg-indigo-50 hover:bg-[var(--color-brand-primary)] text-[var(--color-brand-primary)] hover:text-white font-semibold rounded-xl text-sm transition"
//         >
//           View Course
//         </Link>
//       </div>
//     </div>
//   );
// } 
import Link from 'next/link';

export default function CourseCard({ course }) {
  // Strapi v4/v5 data structure normalization
  const data = course.attributes || course;
  const { title, short_description, level, category, lessons, user, instructor } = data;

  // Strapi v5-এ documentId বা id নির্ধারণ করা
  const courseId = course.documentId || course.id || data.documentId || data.id;
  const courseInstructor = user || instructor?.data?.attributes || instructor;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col justify-between">
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-[var(--color-brand-primary)] uppercase tracking-wider">
            {category || 'General'}
          </span>
          <span className="text-xs font-medium text-[var(--color-brand-text-muted)] capitalize">
            {level || 'All Levels'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-[var(--color-brand-text-main)] line-clamp-2 hover:text-[var(--color-brand-primary)] transition">
          <Link href={`/courses/${courseId}`}>
            {title}
          </Link>
        </h3>

        <p className="text-sm text-[var(--color-brand-text-muted)] line-clamp-2">
          {data.description || short_description || 'No description provided.'}
        </p>
      </div>

      <div className="p-6 pt-0 space-y-4">
        <div className="flex items-center justify-between text-xs text-[var(--color-brand-text-muted)] border-t border-[var(--color-brand-border)] pt-4">
          <span className="font-medium text-gray-700">
            By {courseInstructor?.username || 'Instructor'}
          </span>
          <span>{lessons?.length || lessons?.data?.length || 0} Lessons</span>
        </div>

        <Link
          href={`/courses/${courseId}`}
          className="block w-full text-center py-2.5 px-4 bg-indigo-50 hover:bg-[var(--color-brand-primary)] text-[var(--color-brand-primary)] hover:text-white font-semibold rounded-xl text-sm transition"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}