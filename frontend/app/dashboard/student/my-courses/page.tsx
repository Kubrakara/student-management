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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Kayıtlı Derslerim</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {enrollments.length === 0 ? (
          <p className="text-gray-500">
            Henüz kayıtlı dersiniz bulunmamaktadır.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
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
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {enrollment.course.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Kayıt Tarihi: {new Date(enrollment.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <button
                    className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    onClick={async () => {
                      if (confirm('Bu dersten kaydınızı silmek istediğinizden emin misiniz?')) {
                        try {
                          await api.delete(`/enrollments/self/withdraw/${enrollment.course._id}`);
                          setEnrollments((prev) => prev.filter((e) => e._id !== enrollment._id));
                          alert('Kayıt başarıyla silindi.');
                        } catch (err: unknown) {
                          const error = err as AxiosError;
                          alert(
                            (error.response?.data as { message?: string })?.message ||
                              "Kaydı silme işlemi başarısız."
                          );
                        }
                      }
                    }}
                  >
                    Kaydı Sil
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between mt-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Önceki
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || (n >= page - 2 && n <= page + 2))
                  .map((n, idx, arr) => {
                    const prev = arr[idx - 1];
                    const needEllipsis = prev && n - prev > 1;
                    return (
                      <React.Fragment key={n}>
                        {needEllipsis && <span className="px-2">…</span>}
                        <button
                          className={`px-3 py-1 rounded ${n === page ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>
              <button
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
