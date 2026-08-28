'use client';
import { useAuth } from '@/context/AuthContext';

export default function ContentManagerDashboardPage() {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">Content Manager Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {user?.username} ({user?.role?.name})</p>
    </div>
  );
}