"use client";

import React, { useEffect } from "react";
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
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCourses());
    }
  }, [isAuthenticated, dispatch]);

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
        )}
      </div>
    </div>
  );
};

export default AllCoursesPage;
