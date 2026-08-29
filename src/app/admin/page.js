'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [message, setMessage] = useState('');

  // Role verification: Admin authority check
  const isAdmin =
    user?.role?.type === 'admin' ||
    user?.role?.name?.toLowerCase().includes('admin') ||
    user?.username?.toLowerCase().includes('admin');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadAdminData = async () => {
      if (!user || !token) return;
      try {
        const [statsData, rolesData, userList] = await Promise.all([
          adminService.getPlatformStats(token),
          adminService.getAvailableRoles(token),
          adminService.getAllUsers(token),
        ]);

        setStats(statsData);
        setRoles(rolesData);
        setUsers(userList.length > 0 ? userList : (statsData?.users || []));
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) loadAdminData();
  }, [user, token, authLoading, router]);

  const handleRoleChange = async (userId, targetRoleId) => {
    if (!confirm('Are you sure you want to change this user role?')) return;
    setUpdatingUserId(userId);
    setMessage('');

    try {
      await adminService.updateUserRole(userId, targetRoleId, token);
      setMessage('User role updated successfully!');

      // Update state locally
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const matchedRole = roles.find((r) => String(r.id) === String(targetRoleId));
            return { ...u, role: matchedRole || u.role };
          }
          return u;
        })
      );
    } catch (err) {
      setMessage(`Failed to update role: ${err.message}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getUserRoleName = (userObj) => {
    if (!userObj?.role) return 'Student';
    return userObj.role.name || userObj.role.type || 'Student';
  };

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  });

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--color-brand-text-muted)]">Loading administrative cockpit...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Platform Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-text-main)]">
            Platform Cockpit & Role Governance
          </h1>
          <p className="text-sm text-[var(--color-brand-text-muted)]">
            Manage global accounts, reassign role permissions, and track platform metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs border border-gray-200 transition"
          >
            Switch to Dashboard
          </Link>
          <Link
            href="/courses"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
          >
            View Courses
          </Link>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Primary Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-black text-[var(--color-brand-text-main)]">{stats?.totalUsers || users.length}</p>
          <p className="text-[11px] text-gray-400">All registered platform accounts</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Total Courses</p>
          <p className="text-3xl font-black text-indigo-600">{stats?.totalCourses || 0}</p>
          <p className="text-[11px] text-gray-400">Published curricula tracks</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Total Enrollments</p>
          <p className="text-3xl font-black text-cyan-600">{stats?.totalEnrollments || 0}</p>
          <p className="text-[11px] text-gray-400">Active student enrollments</p>
        </div>

        <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs font-semibold text-[var(--color-brand-text-muted)] uppercase tracking-wider">Articles Published</p>
          <p className="text-3xl font-black text-green-600">{stats?.totalBlogs || 0}</p>
          <p className="text-[11px] text-gray-400">Engineering publications</p>
        </div>
      </div>

      {/* Role Breakdown Stats */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--color-brand-text-main)] uppercase tracking-wider">
          Role Distribution
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
            <p className="text-xs text-indigo-700 font-semibold">Admins</p>
            <p className="text-2xl font-black text-indigo-900 mt-1">{stats?.roleStats?.admin || 0}</p>
          </div>
          <div className="p-4 bg-cyan-50/50 border border-cyan-100 rounded-xl">
            <p className="text-xs text-cyan-700 font-semibold">Instructors</p>
            <p className="text-2xl font-black text-cyan-900 mt-1">{stats?.roleStats?.instructor || 0}</p>
          </div>
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700 font-semibold">Content Managers</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{stats?.roleStats?.contentManager || 0}</p>
          </div>
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <p className="text-xs text-emerald-700 font-semibold">Students</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{stats?.roleStats?.student || 0}</p>
          </div>
        </div>
      </div>

      {/* Users Role Management Table */}
      <div className="bg-white border border-[var(--color-brand-border)] rounded-2xl overflow-hidden shadow-sm space-y-4">
        <div className="p-6 border-b border-[var(--color-brand-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--color-brand-text-main)]">User Accounts & Role Permissions</h2>
            <p className="text-xs text-[var(--color-brand-text-muted)]">Reassign roles to modify platform capabilities instantly.</p>
          </div>

          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>

        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-[var(--color-brand-border)] uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Current Role</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const roleName = getUserRoleName(u);
                  const isSelf = u.id === user?.id;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition">
                      <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-xs">
                          {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                        </span>
                        <span>{u.username}</span>
                        {isSelf && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-600 rounded font-bold">
                            You
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          roleName.toLowerCase().includes('admin')
                            ? 'bg-indigo-50 text-indigo-700'
                            : roleName.toLowerCase().includes('instructor')
                            ? 'bg-cyan-50 text-cyan-700'
                            : roleName.toLowerCase().includes('manager')
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <select
                          disabled={updatingUserId === u.id || isSelf}
                          value={u.role?.id || ''}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-800 font-semibold focus:outline-none focus:border-indigo-600 disabled:opacity-50 cursor-pointer"
                        >
                          <option value="" disabled>Change Role...</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-gray-500">
            No matching users found.
          </div>
        )}
      </div>
    </div>
  );
}