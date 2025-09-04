"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { deleteEnrollment, fetchEnrollments, IEnrollmentItem } from "@/lib/features/enrollment/enrollmentSlice";
import { fetchStudents } from "@/lib/features/student/studentSlice";
import { fetchCourses } from "@/lib/features/course/courseSlice";
import Button from "@/components/Button";
import api from "@/services/api";
import { AxiosError } from "axios";

const EnrollmentManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const enrollments = useSelector((state: RootState) => state.enrollment.enrollments);
  const students = useSelector((state: RootState) => state.student.students);
  const courses = useSelector((state: RootState) => state.course.courses);
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

  // Yeni kayıt ekleme formu için state'ler
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchEnrollments({ page: currentPage, limit: pageSize })).unwrap(),
          dispatch(fetchStudents({ page: 1, limit: 1000 })).unwrap(), // Tüm öğrencileri getir
          dispatch(fetchCourses({ page: 1, limit: 1000 })).unwrap() // Tüm dersleri getir
        ]);
      } catch (error) {
        console.error('Veriler yüklenirken hata:', error);
      }
    };
    loadData();
  }, [dispatch, currentPage, pageSize]);

  const handleDelete = (id: string) => {
    dispatch(deleteEnrollment(id))
      .unwrap()
      .then(() => dispatch(fetchEnrollments({ page: currentPage, limit: pageSize })));
  };

  const handleCreateEnrollment = async () => {
    setError("");
    if (!selectedStudent || !selectedCourse) {
      setError("Lütfen öğrenci ve ders seçiniz.");
      return;
    }

    try {
      await api.post("/enrollments/enroll", {
        studentId: selectedStudent,
        courseId: selectedCourse,
      });
      setSelectedStudent("");
      setSelectedCourse("");
      dispatch(fetchEnrollments({ page: currentPage, limit: pageSize }));
    } catch (err: unknown) {
      const error = err as AxiosError;
      setError(
        (error.response?.data as { message?: string })?.message || 
        "Kayıt eklenirken hata oluştu."
      );
    }
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Kayıtlar yükleniyor...</div>;
  }

  if (status === "failed") {
    return <div className="text-center mt-10 text-red-500">Veriler yüklenirken hata oluştu.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Kayıt Yönetimi</h2>
      </div>

      {/* Yeni Kayıt Ekle Formu */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Yeni Kayıt Ekle</h3>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Öğrenci</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Seçiniz</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ders</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Seçiniz</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreateEnrollment}>Kaydet</Button>
          </div>
        </div>
      </div>

      {/* Kayıt Listesi Tablosu */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Tüm Kayıtlar ({totalCount})</h3>
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
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Öğrenci Adı Soyadı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ders Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    {status === "succeeded" ? "Henüz kayıt bulunmamaktadır." : "Kayıtlar yükleniyor..."}
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment: IEnrollmentItem) => {
                const student = typeof enrollment.student === "string" ? null : enrollment.student;
                const course = typeof enrollment.course === "string" ? null : enrollment.course;
                return (
                  <tr key={enrollment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student ? `${student.firstName} ${student.lastName}` : "Öğrenci"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course ? course.name : "Ders"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(enrollment._id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
