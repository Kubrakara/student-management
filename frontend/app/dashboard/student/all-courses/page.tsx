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
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Mevcut Dersler</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        {courses.length === 0 ? (
          <p className="text-gray-500">Şu anda mevcut ders bulunmamaktadır.</p>
        ) : (
          <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Toplam: {totalCount}</div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sayfa boyutu:</label>
              <select
                className="border rounded px-2 py-1"
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
          <ul>
            {courses.map((course: ICourse) => (
              <li
                key={course._id}
                className="border-b py-2 flex justify-between items-center"
              >
                <span>{course.name}</span>
                <div className="space-x-2">
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={async () => {
                      try {
                        await api.post("/enrollments/self/enroll", { courseId: course._id });
                        // Başarılı: Kayıtlı derslere git
                        router.push("/dashboard/student/my-courses");
                      } catch (err: unknown) {
                        const error = err as AxiosError;
                        alert(
                          (error.response?.data as { message?: string })?.message ||
                            "Kayıt işlemi başarısız."
                        );
                      }
                    }}
                  >
                    Kaydol
                  </button>
                  <button
                    className="text-sm text-red-600 hover:text-red-800"
                    onClick={async () => {
                      try {
                        await api.delete(`/enrollments/self/withdraw/${course._id}`);
                        // Başarılı: Kayıtlı derslere git
                        router.push("/dashboard/student/my-courses");
                      } catch (err: unknown) {
                        const error = err as AxiosError;
                        alert(
                          (error.response?.data as { message?: string })?.message ||
                            "Kaydı silme işlemi başarısız."
                        );
                      }
                    }}
                  >
                    Kaydı Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
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
                .filter((n) => n === 1 || n === totalPages || (n >= currentPage - 2 && n <= currentPage + 2))
                .map((n, idx, arr) => {
                  const prev = arr[idx - 1];
                  const needEllipsis = prev && n - prev > 1;
                  return (
                    <React.Fragment key={n}>
                      {needEllipsis && <span className="px-2">…</span>}
                      <button
                        className={`px-3 py-1 rounded ${n === page ? "bg-blue-600 text-white" : "bg-gray-200"}`}
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
              disabled={page >= totalPages}
            >
              Sonraki
            </button>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllCoursesPage;
