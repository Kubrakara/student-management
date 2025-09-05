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
import CourseDetailModal from "@/components/CourseDetailModal";

const CourseManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: RootState) => state.course.courses);
  const status = useSelector((state: RootState) => state.course.status);
  const page = useSelector((state: RootState) => state.course.page);
  const totalPages = useSelector((state: RootState) => state.course.totalPages);
  const totalCount = useSelector((state: RootState) => state.course.totalCount);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window === "undefined") return 10;
    const saved = window.localStorage.getItem("admin_courses_pageSize");
    return saved ? Number(saved) : 10;
  });
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newCourseName, setNewCourseName] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseName, setEditingCourseName] = useState<string>("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        await dispatch(fetchCourses({ page: currentPage, limit: pageSize })).unwrap();
      } catch (error) {
        console.error('Dersler yüklenirken hata:', error);
      }
    };
    loadCourses();
  }, [dispatch, currentPage, pageSize]);

  const handleCreateCourse = () => {
    if (newCourseName) {
      dispatch(createCourse({ name: newCourseName }))
        .unwrap()
        .then(() => {
          dispatch(fetchCourses({ page: currentPage, limit: pageSize }));
        });
      setNewCourseName("");
    }
  };

  const handleDeleteCourse = (id: string) => {
    dispatch(deleteCourse(id))
      .unwrap()
      .then(() => {
        dispatch(fetchCourses({ page: currentPage, limit: pageSize }));
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
        dispatch(fetchCourses({ page: currentPage, limit: pageSize }));
      });
  };

  const handleCourseClick = (course: ICourse) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Dersler yükleniyor...</div>;
  }

  if (status === "failed") {
    return <div className="text-center mt-10 text-red-500">Veriler yüklenirken hata oluştu.</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-white to-sky-50 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow-sm">Ders Yönetimi</h2>
        <p className="mt-1 text-sm text-gray-600">Ders ekleyin, düzenleyin ve kayıtlı öğrencileri görüntüleyin.</p>
      </div>

      <div className="rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl border border-indigo-100 bg-white/80 backdrop-blur-sm">
        <h3 className="text-xl md:text-2xl font-bold text-indigo-700 mb-4">Yeni Ders Ekle</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Ders Adı"
              placeholder="Örn: Matematik I"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
          </div>
          <div className="sm:self-end">
            <Button onClick={handleCreateCourse} className="w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300 ease-in-out shadow-md">
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z"/></svg>
                Ekle
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-sky-700">Ders Listesi ({totalCount})</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600" htmlFor="course-page-size">Sayfa boyutu:</label>
            <select
              id="course-page-size"
              className="h-10 border border-gray-200 rounded-lg px-3 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
              value={pageSize}
              onChange={(e) => {
                const next = Number(e.target.value);
                setPageSize(next);
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("admin_courses_pageSize", String(next));
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

        {courses.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{status === "succeeded" ? "Henüz ders bulunmamaktadır." : "Dersler yükleniyor..."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ders Adı</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {courses.map((course: ICourse) => (
                  <tr key={course._id} className="hover:bg-sky-50/70 transition-colors">
                    <td className="px-4 py-3">
                      {editingCourseId === course._id ? (
                        <Input
                          value={editingCourseName}
                          onChange={(e) => setEditingCourseName(e.target.value)}
                          placeholder="Ders adını düzenleyin"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-200 to-sky-200 flex items-center justify-center text-indigo-700 font-semibold">
                            {course.name?.[0]}
                          </div>
                          <div className="font-semibold text-gray-900">{course.name}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingCourseId === course._id ? (
                          <>
                            <button
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition"
                              onClick={saveEdit}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9 16.17l-3.88-3.88a1 1 0 10-1.41 1.42l4.59 4.59a1 1 0 001.41 0l10.59-10.6a1 1 0 10-1.41-1.41L9 16.17z"/></svg>
                              Kaydet
                            </button>
                            <button
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                              onClick={cancelEdit}
                            >
                              İptal
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sky-700 bg-sky-100 hover:bg-sky-200 transition"
                              onClick={() => handleCourseClick(course)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                              Detay
                            </button>
                            <button
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition"
                              onClick={() => startEdit(course)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4 15.5V20h4.5l9.9-9.9-4.5-4.5L4 15.5zm15.7-9.2c.4-.4.4-1 0-1.4l-2.6-2.6a1 1 0 00-1.4 0l-1.8 1.8 4.5 4.5 1.3-1.3z"/></svg>
                              Düzenle
                            </button>
                          </>
                        )}
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 transition"
                          onClick={() => handleDeleteCourse(course._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9 3a1 1 0 00-1 1v1H4.5a.75.75 0 000 1.5h.79l.86 12.08A2.25 2.25 0 008.38 22h7.24a2.25 2.25 0 002.23-2.42L18.71 6.5h.79a.75.75 0 000-1.5H16V4a1 1 0 00-1-1H9zm2 5.5a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0v-8zM8.75 8.5a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0v-8zM13.75 8.5a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0v-8z"/></svg>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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

      <CourseDetailModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        className="!bg-transparent"
      />
    </div>
  );
};

export default CourseManagementPage;
