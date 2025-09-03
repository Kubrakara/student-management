"use client";

import React from "react";
import Link from "next/link";
import AuthenticatedRoute from "@/components/AuthenticatedRoute";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { logout } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <AuthenticatedRoute requiredRole="student">
      <div className="flex min-h-screen bg-gray-100">
        <aside className="w-64 bg-white shadow-md">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-blue-600">Öğrenci Paneli</h1>
          </div>
          <nav className="mt-4">
            <ul>
              <li>
                <Link
                  href="/dashboard/student/profile"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Profil Yönetimi
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/student/my-courses"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Kayıtlı Derslerim
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/student/all-courses"
                  className="block py-2 px-4 text-gray-700 hover:bg-gray-200"
                >
                  Derslere Kaydol
                </Link>
              </li>
            </ul>
          </nav>
          <div className="absolute bottom-0 left-0 w-full p-4">
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
            >
              Çıkış Yap
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AuthenticatedRoute>
  );
};

export default StudentLayout;
