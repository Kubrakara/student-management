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
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
        <aside className="w-72 bg-white/80 backdrop-blur-sm border-r border-indigo-100 shadow-md p-4 flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-3xl font-extrabold text-indigo-700">Öğrenci Paneli</h1>
            </div>
            <nav className="mt-4 space-y-1">
              <ul>
                <li>
                  <Link
                    href="/dashboard/student/profile"
                    className="py-3 px-4 text-gray-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>
                    </span>
                    Profil Yönetimi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/student/my-courses"
                    className="py-3 px-4 text-gray-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 4h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z"/></svg>
                    </span>
                    Kayıtlı Derslerim
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/student/all-courses"
                    className="py-3 px-4 text-gray-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4h12v2H4zM4 8h12v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"/></svg>
                    </span>
                    Derslere Kaydol
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 rounded-xl shadow-md hover:from-rose-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            >
              Çıkış Yap
            </button>
          </div>
        </aside>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </AuthenticatedRoute>
  );
};

export default StudentLayout;
