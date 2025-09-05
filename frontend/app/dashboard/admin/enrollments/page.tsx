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

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchEnrollments({ page: currentPage, limit: pageSize })).unwrap(),
          dispatch(fetchStudents({ page: 1, limit: 1000 })).unwrap(),
          dispatch(fetchCourses({ page: 1, limit: 1000 })).unwrap() 
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
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-white to-sky-50 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow-sm">Kayıt Yönetimi</h2>
        <p className="mt-1 text-sm text-gray-600">Yeni kayıt ekleyin, mevcut kayıtları görüntüleyin ve yönetin.</p>
      </div>

      {/* Yeni Kayıt Ekle Formu */}
      <div className="rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl border border-indigo-100 bg-white/80 backdrop-blur-sm">
        <h3 className="text-xl md:text-2xl font-bold text-indigo-700 mb-4">Yeni Kayıt Ekle</h3>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Öğrenci</label>
            <select
              className="mt-1 block w-full h-10 text-gray-700 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/60 transition sm:text-sm"
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ders</label>
            <select
              className="mt-1 block w-full h-10 text-gray-700 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/60 transition sm:text-sm"
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
            <Button onClick={handleCreateEnrollment} className="w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300 ease-in-out shadow-md">Kaydet</Button>
          </div>
        </div>
      </div>

      {/* Kayıt Listesi Tablosu */}
      <div className="rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-sky-700">Tüm Kayıtlar ({totalCount})</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600" htmlFor="enroll-page-size">Sayfa boyutu:</label>
            <select
              id="enroll-page-size"
              className="h-10 border border-gray-200 rounded-lg px-3 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Öğrenci Adı Soyadı</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ders Adı</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    {status === "succeeded" ? "Henüz kayıt bulunmamaktadır." : "Kayıtlar yükleniyor..."}
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment: IEnrollmentItem) => {
                  const student = typeof enrollment.student === "string" ? null : enrollment.student;
                  const course = typeof enrollment.course === "string" ? null : enrollment.course;
                  return (
                    <tr key={enrollment._id} className="hover:bg-sky-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-200 to-sky-200 flex items-center justify-center text-indigo-700 font-semibold">
                            {student ? `${student.firstName?.[0]}${student.lastName?.[0]}` : "?"}
                          </div>
                          <div className="font-medium text-gray-900">{student ? `${student.firstName} ${student.lastName}` : "Öğrenci"}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{course ? course.name : "Ders"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 transition"
                            onClick={() => handleDelete(enrollment._id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9 3a1 1 0 00-1 1v1H4.5a.75.75 0 000 1.5h.79l.86 12.08A2.25 2.25 0 008.38 22h7.24a2.25 2.25 0 002.23-2.42L18.71 6.5h.79a.75.75 0 000-1.5H16V4a1 1 0 00-1-1H9zm2 5.5a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0v-8zM8.75 8.5a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0v-8zM13.75 8.5a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0v-8z"/></svg>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
      </div>
    </div>
  );
};

export default EnrollmentManagementPage;
