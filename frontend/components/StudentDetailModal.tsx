"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { AxiosError } from "axios";
import { IStudent } from "@/lib/features/student/studentSlice";

interface IEnrollment {
  _id: string;
  course: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface StudentDetailModalProps {
  student: IStudent | null;
  isOpen: boolean;
  onClose: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentEnrollments();
    }
  }, [isOpen, student]);

  const fetchStudentEnrollments = async () => {
    if (!student) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/students/${student._id}/enrollments`);
      setEnrollments(response.data.enrollments || []);
    } catch (err: unknown) {
      const error = err as AxiosError;
      setError(
        (error.response?.data as { message?: string })?.message || 
        "Kayıtlı dersler alınamadı."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Öğrenci Detayları</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Öğrenci Bilgileri */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad</label>
                  <p className="mt-1 text-sm text-gray-900">{student.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soyad</label>
                  <p className="mt-1 text-sm text-gray-900">{student.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(student.birthDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                  <p className="mt-1 text-sm text-gray-900">{student.username || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </div>

            {/* Kayıtlı Dersler */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Kayıtlı Dersler</h3>
              {loading ? (
                <p className="text-gray-500">Dersler yükleniyor...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : enrollments.length === 0 ? (
                <p className="text-gray-500">Bu öğrenci henüz hiçbir derse kayıtlı değil.</p>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="flex justify-between items-center bg-white p-3 rounded border"
                    >
                      <div>
                        <p className="font-medium">{enrollment.course.name}</p>
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

export default StudentDetailModal;
