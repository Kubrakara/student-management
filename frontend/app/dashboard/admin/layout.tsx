"use client";

import React from "react";
import Link from "next/link";
import AuthenticatedRoute from "@/components/AuthenticatedRoute";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { logout } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <AuthenticatedRoute requiredRole="admin">
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 font-sans">
        <aside className="w-full md:w-72 bg-white/80 backdrop-blur-sm shadow-lg md:shadow-xl p-4 flex flex-col justify-between transition-all duration-300 ease-in-out md:relative absolute z-10 h-screen overflow-y-auto border-r border-indigo-100">
          <div>
            <div className="p-4 border-b border-gray-200 mb-4">
              <h1 className="text-3xl font-extrabold text-indigo-700 drop-shadow-sm">Admin Paneli</h1>
            </div>
            <nav className="mt-6 space-y-1">
              <ul>
                <li>
                  <Link
                    href="/dashboard/admin/students"
                    className="py-3 px-4 text-gray-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition duration-200 ease-in-out flex items-center gap-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                    </span>
                    Öğrenci Yönetimi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/courses"
                    className="py-3 px-4 text-gray-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition duration-200 ease-in-out flex items-center gap-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v1a3 3 0 01-3 3H7a3 3 0 01-3-3V4zm-7 9a4 4 0 018 0v2H0v-2zm-7 9a7 7 0 1114 0H3zM7 8a5 5 0 00-5 5v2h10v-2a5 5 0 00-5-5z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Ders Yönetimi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/admin/enrollments"
                    className="py-3 px-4 text-gray-700 font-medium rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition duration-200 ease-in-out flex items-center gap-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4a2 2 0 012 2v2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4H0a2 2 0 01-2-2V8a2 2 0 012-2h4V4zm8 0H6v2h6V4zm4 4h-4v4h4V8z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Kayıt Yönetimi
                  </Link>
                </li>
                
                
              </ul>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200 mt-4">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 rounded-xl shadow-md hover:from-rose-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 ease-in-out transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h5a1 1 0 000-2H4V4h4a1 1 0 100-2H3zm10.293 8.293a1 1 0 001.414 0l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293a1 1 0 000 1.414z" clipRule="evenodd" />
              </svg>
              Çıkış Yap
            </button>
          </div>
        </aside>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </AuthenticatedRoute>
  );
};

export default AdminLayout;
