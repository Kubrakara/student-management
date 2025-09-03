// frontend/app/dashboard/admin/layout.tsx

import React from "react";
import Link from "next/link";
import AuthenticatedRoute from "@/components/AuthenticatedRoute";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthenticatedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-blue-600">Admin Paneli</h1>
          </div>
          <nav className="mt-4">
            <ul>
              <li>
                <Link
                  href="/dashboard/admin/students"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Öğrenci Yönetimi
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/courses"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Ders Yönetimi
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin/enrollments"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Kayıt Yönetimi
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AuthenticatedRoute>
  );
};

export default AdminLayout;
