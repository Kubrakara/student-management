"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { ICourse } from "@/lib/features/course/courseSlice";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";

const MyCoursesPage: React.FC = () => {
  const dispatch = useDispatch();
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get("/enrollments/my-courses");
        setCourses(response.data);
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
    fetchMyCourses();
  }, [dispatch]);

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
        {courses.length === 0 ? (
          <p className="text-gray-500">
            Henüz kayıtlı dersiniz bulunmamaktadır.
          </p>
        ) : (
          <ul>
            {courses.map((course: ICourse) => (
              <li
                key={course._id}
                className="border-b py-2 flex justify-between items-center"
              >
                <span>{course.name}</span>
                <button
                  className="text-sm text-red-600 hover:text-red-800"
                  onClick={async () => {
                    try {
                      await api.delete(`/enrollments/self/withdraw/${course._id}`);
                      // sayfayı yenile
                      setCourses((prev) => prev.filter((c) => c._id !== course._id));
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
