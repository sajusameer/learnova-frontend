import { fetchFromStrapi } from '@/lib/api';

export const adminService = {
  // Get all registered users along with their roles
  async getAllUsers(token) {
    try {
      const res = await fetchFromStrapi('/users?populate=role', { token });
      return Array.isArray(res) ? res : res.data || [];
    } catch (err) {
      console.warn('Failed to load users via /users:', err.message);
      return [];
    }
  },

  // Get available platform roles from Strapi Users-Permissions
  async getAvailableRoles(token) {
    try {
      const res = await fetchFromStrapi('/users-permissions/roles', { token });
      return res.roles || res.data || [];
    } catch {
      return [
        { id: 1, name: 'Authenticated', type: 'authenticated' },
        { id: 2, name: 'Student', type: 'student' },
        { id: 3, name: 'Instructor', type: 'instructor' },
        { id: 4, name: 'Content Manager', type: 'content_manager' },
        { id: 5, name: 'Admin', type: 'admin' },
      ];
    }
  },

  // Update user role
  async updateUserRole(userId, roleId, token) {
    return await fetchFromStrapi(`/users/${userId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ role: roleId }),
    });
  },

  // Get Platform Overview Statistics
  async getPlatformStats(token) {
    try {
      const [users, courses, enrollments, posts] = await Promise.allSettled([
        fetchFromStrapi('/users?populate=role', { token }),
        fetchFromStrapi('/courses'),
        fetchFromStrapi('/enrollments', { token }),
        fetchFromStrapi('/blog-posts'),
      ]);

      const userList = users.status === 'fulfilled' ? (Array.isArray(users.value) ? users.value : users.value.data || []) : [];
      const courseList = courses.status === 'fulfilled' ? courses.value.data || [] : [];
      const enrollmentList = enrollments.status === 'fulfilled' ? enrollments.value.data || [] : [];
      const blogList = posts.status === 'fulfilled' ? posts.value.data || [] : [];

      const roleStats = {
        admin: 0,
        instructor: 0,
        contentManager: 0,
        student: 0,
      };

      userList.forEach((u) => {
        const rName = (u.role?.name || u.role?.type || '').toLowerCase();
        if (rName.includes('admin')) roleStats.admin += 1;
        else if (rName.includes('instructor')) roleStats.instructor += 1;
        else if (rName.includes('manager') || rName.includes('content')) roleStats.contentManager += 1;
        else roleStats.student += 1;
      });

      return {
        totalUsers: userList.length,
        totalCourses: courseList.length,
        totalEnrollments: enrollmentList.length,
        totalBlogs: blogList.length,
        roleStats,
        users: userList,
      };
    } catch (err) {
      console.error('Error compiling platform stats:', err);
      return null;
    }
  },
};