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
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ders Detayları</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Ders Bilgileri */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Ders Bilgileri</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ders Adı</label>
                <p className="mt-1 text-sm text-gray-900">{course.name}</p>
              </div>
            </div>

            {/* Kayıtlı Öğrenciler */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Kayıtlı Öğrenciler</h3>
              {loading ? (
                <p className="text-gray-500">Öğrenciler yükleniyor...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : enrolledStudents.length === 0 ? (
                <p className="text-gray-500">Bu derse henüz hiçbir öğrenci kayıtlı değil.</p>
              ) : (
                <div className="space-y-2">
                  {enrolledStudents.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="flex justify-between items-center bg-white p-3 rounded border"
                    >
                      <div>
                        <p className="font-medium">
                          {enrollment.student.firstName} {enrollment.student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Kayıt Tarihi: {new Date(enrollment.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
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
