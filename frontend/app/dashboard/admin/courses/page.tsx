"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchCourses,
  createCourse,
  deleteCourse,
  updateCourse,
  ICourse,
} from "@/lib/features/course/courseSlice";
import Button from "@/components/Button";
import Input from "@/components/Input";

const CourseManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: RootState) => state.course.courses);
  const status = useSelector((state: RootState) => state.course.status);

  const [newCourseName, setNewCourseName] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseName, setEditingCourseName] = useState<string>("");

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleCreateCourse = () => {
    if (newCourseName) {
      dispatch(createCourse({ name: newCourseName }))
        .unwrap()
        .then(() => {
          dispatch(fetchCourses());
        });
      setNewCourseName("");
    }
  };

  const handleDeleteCourse = (id: string) => {
    dispatch(deleteCourse(id))
      .unwrap()
      .then(() => {
        dispatch(fetchCourses());
      });
  };

  const startEdit = (course: ICourse) => {
    setEditingCourseId(course._id);
    setEditingCourseName(course.name);
  };

  const cancelEdit = () => {
    setEditingCourseId(null);
    setEditingCourseName("");
  };

  const saveEdit = () => {
    if (!editingCourseId) return;
    const name = editingCourseName.trim();
    if (!name) return;
    dispatch(updateCourse({ courseId: editingCourseId, updates: { name } }))
      .unwrap()
      .then(() => {
        setEditingCourseId(null);
        setEditingCourseName("");
        dispatch(fetchCourses());
      });
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Ders Yönetimi</h2>
      </div>

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
              <span className="flex-1">
                {editingCourseId === course._id ? (
                  <Input
                    value={editingCourseName}
                    onChange={(e) => setEditingCourseName(e.target.value)}
                  />
                ) : (
                  course.name
                )}
              </span>
              <div className="space-x-2">
                {editingCourseId === course._id ? (
                  <>
                    <button
                      className="text-sm text-green-600 hover:text-green-800"
                      onClick={saveEdit}
                    >
                      Kaydet
                    </button>
                    <button
                      className="text-sm text-gray-600 hover:text-gray-800"
                      onClick={cancelEdit}
                    >
                      İptal
                    </button>
                  </>
                ) : (
                  <button
                    className="text-sm text-yellow-500 hover:text-yellow-700"
                    onClick={() => startEdit(course)}
                  >
                    Düzenle
                  </button>
                )}
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
