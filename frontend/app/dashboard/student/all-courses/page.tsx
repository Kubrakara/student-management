"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchCourses, ICourse } from "@/lib/features/course/courseSlice";

const AllCoursesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: RootState) => state.course.courses);
  const status = useSelector((state: RootState) => state.course.status);
  const page = useSelector((state: RootState) => state.course.page);
  const totalPages = useSelector((state: RootState) => state.course.totalPages);
  const totalCount = useSelector((state: RootState) => state.course.totalCount);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window === "undefined") return 10;
    const saved = window.localStorage.getItem("student_all_courses_pageSize");
    return saved ? Number(saved) : 10;
  });
  const [isEnrollConfirmOpen, setIsEnrollConfirmOpen] = useState<boolean>(false);
  const [pendingCourse, setPendingCourse] = useState<ICourse | null>(null);
  const [enrollLoading, setEnrollLoading] = useState<boolean>(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCourses({ page: currentPage, limit: pageSize }));
    }
  }, [isAuthenticated, dispatch, currentPage, pageSize]);

  if (!isAuthenticated || status === "loading") {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow-sm mb-6">Mevcut Dersler</h2>

      <div className="rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-sky-100 bg-white/80 backdrop-blur-sm">
        {courses.length === 0 ? (
          <p className="text-gray-500">Şu anda mevcut ders bulunmamaktadır.</p>
        ) : (
          <>
          <div className="flex items-center justify-between mb-4">
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
                    window.localStorage.setItem("student_all_courses_pageSize", String(next));
                  }
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ders Adı</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {courses.map((course: ICourse) => (
                  <tr key={course._id} className="hover:bg-sky-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-200 to-sky-200 flex items-center justify-center text-indigo-700 font-semibold">
                          {course.name?.[0]}
                        </div>
                        <div className="font-semibold text-gray-900">{course.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition"
                          onClick={() => {
                            setEnrollError(null);
                            setPendingCourse(course);
                            setIsEnrollConfirmOpen(true);
                          }}
                        >
                          Kaydol
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 transition"
                          onClick={async () => {
                            try {
                              await api.delete(`/enrollments/self/withdraw/${course._id}`);
                              router.push("/dashboard/student/my-courses");
                            } catch (err: unknown) {
                              const error = err as AxiosError;
                              alert((error.response?.data as { message?: string })?.message || "Kaydı silme işlemi başarısız.");
                            }
                          }}
                        >
                          Kaydı Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Önceki
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || (n >= currentPage - 2 && n <= currentPage + 2))
                .map((n, idx, arr) => {
                  const prev = arr[idx - 1];
                  const needEllipsis = prev && n - prev > 1;
                  return (
                    <React.Fragment key={n}>
                      {needEllipsis && <span className="px-2 text-gray-400">…</span>}
                      <button
                        className={`px-4 py-2 rounded-xl font-medium transition ${n === page ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        onClick={() => setCurrentPage(n)}
                      >
                        {n}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            <button
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={page >= totalPages}
            >
              Sonraki
            </button>
          </div>
          </>
        )}
      </div>
      {isEnrollConfirmOpen && pendingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white/90 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">Derse Kaydol</h3>
            <p className="mt-2 text-sm text-gray-600">
              {pendingCourse.name} dersine kaydolmak istediğinize emin misiniz?
            </p>
            {enrollError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
                {enrollError}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition"
                onClick={() => {
                  setIsEnrollConfirmOpen(false);
                  setPendingCourse(null);
                }}
              >
                İptal
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-white shadow hover:from-emerald-700 hover:to-green-700 transition disabled:opacity-60"
                disabled={enrollLoading}
                onClick={async () => {
                  if (!pendingCourse) return;
                  setEnrollLoading(true);
                  setEnrollError(null);
                  try {
                    await api.post("/enrollments/self/enroll", { courseId: pendingCourse._id });
                    router.push("/dashboard/student/my-courses");
                  } catch (err: unknown) {
                    const error = err as AxiosError;
                    setEnrollError((error.response?.data as { message?: string })?.message || 'Kayıt işlemi başarısız.');
                  } finally {
                    setEnrollLoading(false);
                  }
                }}
              >
                {enrollLoading ? 'Kaydediliyor...' : 'Evet, Kaydol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCoursesPage;
