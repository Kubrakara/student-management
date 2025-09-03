"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchCourses,
  createCourse,
  deleteCourse,
  ICourse,
} from "@/lib/features/course/courseSlice";
import Button from "@/components/Button";
import Input from "@/components/Input";

const CourseManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: RootState) => state.course.courses);
  const status = useSelector((state: RootState) => state.course.status);

  const [newCourseName, setNewCourseName] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCourses());
    }
  }, [status, dispatch]);

  const handleCreateCourse = () => {
    if (newCourseName) {
      dispatch(createCourse({ name: newCourseName }));
      setNewCourseName("");
    }
  };

  const handleDeleteCourse = (id: string) => {
    dispatch(deleteCourse(id));
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Ders Yönetimi</h2>
      </div>

      {/* Yeni Ders Ekleme Formu */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Yeni Ders Ekle</h3>
        <div className="flex gap-4 mb-4">
          <Input
            label="Ders Adı"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
          />
          <Button onClick={handleCreateCourse}>Ekle</Button>
        </div>
      </div>

      {/* Ders Listesi */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          Ders Listesi ({courses.length})
        </h3>
        <ul>
          {courses.map((course: ICourse) => (
            <li
              key={course._id}
              className="border-b py-2 flex justify-between items-center"
            >
              <span>{course.name}</span>
              <div className="space-x-2">
                <button className="text-sm text-yellow-500 hover:text-yellow-700">
                  Düzenle
                </button>
                <button
                  className="text-sm text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteCourse(course._id)}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseManagementPage;
