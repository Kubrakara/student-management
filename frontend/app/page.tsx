"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "student") {
        router.push("/dashboard/student");
      }
    }
  }, [isAuthenticated, role, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-blue-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
                          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-3">
              Öğrenci Yönetim
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                Sistemi
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Yöneticiler için kapsamlı yönetim, öğrenciler için kolay erişim.
            </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="text-center">
            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Admin Features */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-900">Yönetici Paneli</h3>
                </div>
                <ul className="text-base text-indigo-700 space-y-2">
                  <li>• Öğrenci yönetimi</li>
                  <li>• Kurs yönetimi</li>
                  <li>• Kayıt takibi</li>
                </ul>
              </div>

              {/* Student Features */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Öğrenci Paneli</h3>
                </div>
                <ul className="text-base text-blue-700 space-y-2">
                  <li>• Profil görüntüleme</li>
                  <li>• Kurs keşfi</li>
                  <li>• Kayıt takibi</li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-lg mx-auto">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Hemen Başlayın
                </h2>
                <p className="text-gray-600 mb-6">
                  Sisteme giriş yaparak öğrenci yönetimine başlayabilirsiniz.
                </p>
                
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center w-full px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Giriş Yap
                  </Link>
                  
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
