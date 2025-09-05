"use client";

import React, { useEffect, useState } from "react";
import { studentProfileAPI } from "@/services/api";
import { ICourse } from "@/lib/features/course/courseSlice";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/features/user/userSlice";
import api from "@/services/api";

interface IEnrollment {
  _id: string;
  course: ICourse;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const MyCoursesPage: React.FC = () => {
  const dispatch = useDispatch();
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window === "undefined") return 10;
    const saved = window.localStorage.getItem("student_my_courses_pageSize");
    return saved ? Number(saved) : 10;
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [pendingDelete, setPendingDelete] = useState<IEnrollment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMyEnrollments = async () => {
      setLoading(true);
      try {
        const data = await studentProfileAPI.getOwnEnrollments({ page, limit: pageSize });
        setEnrollments(data.enrollments as unknown as IEnrollment[]);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } catch (err: unknown) {
        const error = err as AxiosError;
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          dispatch(logout());
        }
        setError(
          (error.response?.data as { message?: string })?.message ||
            "Kayıtlı dersler alınamadı."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMyEnrollments();
  }, [dispatch, page, pageSize]);

  if (loading) {
    return <div className="text-center mt-10">Dersler yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow-sm">Kayıtlı Derslerim</h2>
      </div>

      <div className="rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-sky-100 bg-white/80 backdrop-blur-sm">
        {enrollments.length === 0 ? (
          <p className="text-gray-500">Henüz kayıtlı dersiniz bulunmamaktadır.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Toplam: {totalCount}</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sayfa boyutu:</label>
                <select
                  className="h-10 border border-gray-200 rounded-lg px-3 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                  value={pageSize}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPageSize(next);
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem("student_my_courses_pageSize", String(next));
                    }
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            {enrollments.map((enrollment: IEnrollment) => (
              <div
                key={enrollment._id}
                className="border rounded-xl p-4 hover:shadow-md transition bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-200 to-sky-200 flex items-center justify-center text-indigo-700 font-semibold">
                      {enrollment.course.name?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{enrollment.course.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Kayıt Tarihi: {new Date(enrollment.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 transition"
                    onClick={() => {
                      setPendingDelete(enrollment);
                      setIsConfirmOpen(true);
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-2">
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Önceki
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || (n >= page - 2 && n <= page + 2))
                  .map((n, idx, arr) => {
                    const prev = arr[idx - 1];
                    const needEllipsis = prev && n - prev > 1;
                    return (
                      <React.Fragment key={n}>
                        {needEllipsis && <span className="px-2 text-gray-400">…</span>}
                        <button
                          className={`px-4 py-2 rounded-xl font-medium transition ${n === page ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
      {isConfirmOpen && pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-indigo-100 bg-white/90 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">Kaydı Sil</h3>
            <p className="mt-2 text-sm text-gray-600">
              {pendingDelete.course.name} dersinden kaydınızı silmek istediğinize emin misiniz?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setPendingDelete(null);
                }}
              >
                İptal
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-white shadow hover:from-rose-700 hover:to-red-700 transition disabled:opacity-60"
                disabled={deleteLoading}
                onClick={async () => {
                  if (!pendingDelete) return;
                  setDeleteLoading(true);
                  try {
                    await api.delete(`/enrollments/self/withdraw/${pendingDelete.course._id}`);
                    setEnrollments((prev) => prev.filter((e) => e._id !== pendingDelete._id));
                    setIsConfirmOpen(false);
                    setPendingDelete(null);
                  } catch (err: unknown) {
                    const error = err as AxiosError;
                    console.error((error.response?.data as { message?: string })?.message || 'Kaydı silme işlemi başarısız.');
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
              >
                {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
