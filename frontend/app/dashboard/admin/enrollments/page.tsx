"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { deleteEnrollment, fetchEnrollments, IEnrollmentItem } from "@/lib/features/enrollment/enrollmentSlice";

const EnrollmentManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const enrollments = useSelector((state: RootState) => state.enrollment.enrollments);
  const status = useSelector((state: RootState) => state.enrollment.status);
  const page = useSelector((state: RootState) => state.enrollment.page);
  const totalPages = useSelector((state: RootState) => state.enrollment.totalPages);
  const totalCount = useSelector((state: RootState) => state.enrollment.totalCount);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window === "undefined") return 10;
    const saved = window.localStorage.getItem("admin_enrollments_pageSize");
    return saved ? Number(saved) : 10;
  });

  useEffect(() => {
    dispatch(fetchEnrollments({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleDelete = (id: string) => {
    dispatch(deleteEnrollment(id))
      .unwrap()
      .then(() => dispatch(fetchEnrollments({ page: currentPage, limit: pageSize })));
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Kayıt Yönetimi</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Kayıt Listesi ({totalCount})</h3>
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
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("admin_enrollments_pageSize", String(next));
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
          {enrollments.map((e: IEnrollmentItem) => {
            const student = typeof e.student === "string" ? null : e.student;
            const course = typeof e.course === "string" ? null : e.course;
            return (
              <li key={e._id} className="border-b py-2 flex justify-between items-center">
                <span className="flex-1">
                  {student ? `${student.firstName} ${student.lastName}` : "Öğrenci"} - {course ? course.name : "Ders"}
                </span>
                <button
                  className="text-sm text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(e._id)}
                >
                  Sil
                </button>
              </li>
            );
          })}
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
      </div>
    </div>
  );
};

export default EnrollmentManagementPage;
