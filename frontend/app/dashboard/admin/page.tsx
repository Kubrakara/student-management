import React from "react";
import Link from "next/link";

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="min-h-[60vh]">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow-sm">Admin Paneline Hoş Geldiniz!</h2>
        <p className="mt-1 text-sm text-gray-600">Sık kullanılan bölümlere aşağıdan hızlıca erişin.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/dashboard/admin/students" className="group rounded-2xl border border-indigo-100 bg-white/80 backdrop-blur-sm p-5 shadow hover:shadow-lg transition flex items-start gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z"/></svg>
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">Öğrenci Yönetimi</h3>
            <p className="text-sm text-gray-500">Öğrenci ekle, düzenle ve detaylarını görüntüle.</p>
          </div>
        </Link>

        <Link href="/dashboard/admin/courses" className="group rounded-2xl border border-indigo-100 bg-white/80 backdrop-blur-sm p-5 shadow hover:shadow-lg transition flex items-start gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 4h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z"/></svg>
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">Ders Yönetimi</h3>
            <p className="text-sm text-gray-500">Dersleri oluştur, düzenle ve takip et.</p>
          </div>
        </Link>

        <Link href="/dashboard/admin/enrollments" className="group rounded-2xl border border-indigo-100 bg-white/80 backdrop-blur-sm p-5 shadow hover:shadow-lg transition flex items-start gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4 6a2 2 0 012-2h4a2 2 0 012 2v2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4H0a2 2 0 01-2-2V8a2 2 0 012-2h4V6z"/></svg>
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">Kayıt Yönetimi</h3>
            <p className="text-sm text-gray-500">Öğrencileri derslere kaydet ve yönet.</p>
          </div>
        </Link>

        <Link href="/dashboard/admin/users" className="group rounded-2xl border border-indigo-100 bg-white/80 backdrop-blur-sm p-5 shadow hover:shadow-lg transition flex items-start gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z"/></svg>
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">Kullanıcı Yönetimi</h3>
            <p className="text-sm text-gray-500">Admin ve kullanıcı hesaplarını düzenle.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
