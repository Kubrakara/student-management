"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";

interface ICourse {
  _id: string;
  name: string;
}

interface IEnrolledStudent {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface CourseDetailModalProps {
  course: ICourse | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  className,
}) => {
  const [enrolledStudents, setEnrolledStudents] = useState<IEnrolledStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && course) {
      fetchCourseEnrollments();
    }
  }, [isOpen, course]);

  const fetchCourseEnrollments = async () => {
    if (!course) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/courses/${course._id}/enrollments`);
      setEnrolledStudents(response.data.enrollments || []);
    } catch (err: unknown) {
      const error = err as AxiosError;
      setError(
        (error.response?.data as { message?: string })?.message || 
        "Kayıtlı öğrenciler alınamadı."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm ${className || ""}`}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-indigo-100 bg-white/90 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-indigo-700">Ders Detayları</h2>
              <p className="text-sm text-gray-500 mt-1">Ders bilgisi ve kayıtlı öğrenciler</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition"
              aria-label="Kapat"
              title="Kapat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M6.225 4.811a1 1 0 011.414 0L12 9.172l4.361-4.361a1 1 0 011.414 1.414L13.414 10.586l4.361 4.361a1 1 0 01-1.414 1.414L12 12l-4.361 4.361a1 1 0 01-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 010-1.414z"/></svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ders Bilgileri</h3>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v2H4V6zm0 4h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z"/></svg>
                </span>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Ders Adı</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{course.name}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kayıtlı Öğrenciler</h3>
              {loading ? (
                <p className="text-gray-500">Öğrenciler yükleniyor...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : enrolledStudents.length === 0 ? (
                <p className="text-gray-500">Bu derse henüz hiçbir öğrenci kayıtlı değil.</p>
              ) : (
                <ul className="space-y-2">
                  {enrolledStudents.map((enrollment) => (
                    <li
                      key={enrollment._id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z"/></svg>
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{enrollment.student.firstName} {enrollment.student.lastName}</p>
                          <p className="text-xs text-gray-500">Kayıt Tarihi: {new Date(enrollment.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
