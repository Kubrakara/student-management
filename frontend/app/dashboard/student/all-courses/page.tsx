"use client";

import React, { useEffect } from "react";
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

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchCourses());
    }
  }, [isAuthenticated, status, dispatch]);

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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllCoursesPage;
