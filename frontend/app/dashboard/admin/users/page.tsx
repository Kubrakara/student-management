"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
      </div>

      {/* İstatistikler */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Toplam Kullanıcı</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Admin Kullanıcı</h3>
            <p className="text-3xl font-bold text-green-600">{stats.adminUsers}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Öğrenci Kullanıcı</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.studentUsers}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Öğrenci Bilgisi Olan</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.usersWithStudent}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Öğrenci Bilgisi Olmayan</h3>
            <p className="text-3xl font-bold text-red-600">{stats.usersWithoutStudent}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800">Kopuk Kullanıcı</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.orphanedUsers}</p>
          </div>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          Kullanıcı Listesi ({totalCount})
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sayfa boyutu:</label>
            <select
              className="border rounded px-2 py-1"
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Öğrenci Bilgisi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oluşturulma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Öğrenci'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.studentName ? (
                        <div>
                          <div className="text-sm text-gray-900">{user.studentName}</div>
                          {user.studentBirthDate && (
                            <div className="text-xs text-gray-500">
                              {new Date(user.studentBirthDate).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-red-600">Öğrenci bilgisi yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.studentName ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
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
        <div className="flex items-center justify-between mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Önceki
          </button>
          <div className="flex items-center gap-1">
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
                    {needEllipsis && <span className="px-2">…</span>}
                    <button
                      className={`px-3 py-1 rounded ${
                        n === currentPage ? "bg-blue-600 text-white" : "bg-gray-200"
                      }`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
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
