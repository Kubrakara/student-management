"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";

interface IUser {
  _id: string;
  username: string;
  role: "admin" | "student";
  studentId?: string;
  studentName?: string;
  studentBirthDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  studentUsers: number;
  usersWithStudent: number;
  usersWithoutStudent: number;
  orphanedUsers: number;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, pageSize]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/users?page=${currentPage}&limit=${pageSize}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (err: unknown) {
      const error = err as AxiosError;
      setError(
        (error.response?.data as { message?: string })?.message || 
        "Kullanıcılar yüklenirken hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get("/users/stats");
      setStats(response.data);
    } catch (err: unknown) {
      console.error("İstatistikler yüklenirken hata:", err);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Kullanıcılar yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold text-blue-800 drop-shadow-sm">Kullanıcı Yönetimi</h2>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-100 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-blue-800">Toplam Kullanıcı</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-green-100 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-green-800">Admin Kullanıcı</h3>
            <p className="text-3xl font-bold text-green-600">{stats.adminUsers}</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-purple-600">Öğrenci Kullanıcı</h3>
            <p className="text-3xl font-bold text-purple-700">{stats.studentUsers}</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Öğrenci Bilgisi Olan</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.usersWithStudent}</p>
          </div>
          <div className="bg-red-100 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-red-800">Öğrenci Bilgisi Olmayan</h3>
            <p className="text-3xl font-bold text-red-600">{stats.usersWithoutStudent}</p>
          </div>
          <div className="bg-orange-100 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
            <h3 className="text-lg font-semibold text-orange-800">Kopuk Kullanıcı</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.orphanedUsers}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h3 className="text-2xl font-bold text-blue-700 mb-4">
          Kullanıcı Listesi ({totalCount})
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sayfa boyutu:</label>
            <select
              className="h-10 border rounded-lg px-3 bg-white text-gray-700 focus:border-blue-500 focus:ring-blue-500 transition duration-200"
              value={pageSize}
              onChange={(e) => {
                const next = Number(e.target.value);
                setPageSize(next);
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Kullanıcı Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Öğrenci Bilgisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Henüz kullanıcı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Öğrenci'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.studentName ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.studentName}</div>
                          {user.studentBirthDate && (
                            <div className="text-xs text-gray-600 mt-1">
                              Doğum Tarihi: {new Date(user.studentBirthDate).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-red-600 font-medium">Öğrenci bilgisi yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.studentName ? (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">
                          Kopuk
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        <div className="flex items-center justify-between mt-6">
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Önceki
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => {
                return (
                  n === 1 ||
                  n === totalPages ||
                  (n >= currentPage - 2 && n <= currentPage + 2)
                );
              })
              .map((n, idx, arr) => {
                const prev = arr[idx - 1];
                const needEllipsis = prev && n - prev > 1;
                return (
                  <React.Fragment key={n}>
                    {needEllipsis && <span className="px-2 text-gray-600">…</span>}
                    <button
                      className={`px-4 py-2 rounded-lg font-medium transition duration-300 ease-in-out ${n === currentPage ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 ease-in-out"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages}
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
