"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import Button from "@/components/Button";
import api from "@/services/api";

type EnrollmentRow = {
  _id: string;
  student: { _id: string; firstName: string; lastName: string };
  course: { _id: string; name: string };
};

const AdminEnrollmentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const students = useSelector((state: RootState) => state.student.students);
  const courses = useSelector((state: RootState) => state.course.courses);
  // Listeler dış sayfalarda yüklü; gerekirse otomatik fetch eklenebilir

  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const loadEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data as EnrollmentRow[]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Kayıtlar yüklenemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const handleCreate = async () => {
    setError(null);
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
      await loadEnrollments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Kayıt eklenemedi. Lütfen tekrar deneyin."
      );
    }
  };

  const handleDelete = async (enrollmentId: string) => {
    try {
      await api.delete(`/enrollments/withdraw/${enrollmentId}`);
      await loadEnrollments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || "Kayıt silinemedi.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Kayıt Yönetimi</h2>
      </div>

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
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName}
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
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate}>Kaydet</Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Kayıtlar</h3>
        {loading ? (
          <div>Yükleniyor...</div>
        ) : enrollments.length === 0 ? (
          <div>Henüz kayıt bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Öğrenci</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ders</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((row) => (
                  <tr key={row._id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.student.firstName} {row.student.lastName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.course.name}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="text-sm text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(row._id)}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollmentsPage;


