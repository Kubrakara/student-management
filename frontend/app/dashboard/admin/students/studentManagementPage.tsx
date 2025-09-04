"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchStudents,
  createStudent,
  deleteStudent,
} from "@/lib/features/student/studentSlice";
import Button from "@/components/Button";
import Input from "@/components/Input";

type NewStudentData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  username: string; 
  password: string; 
};

const StudentManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const students = useSelector((state: RootState) => state.student.students);
  const status = useSelector((state: RootState) => state.student.status);
  const page = useSelector((state: RootState) => state.student.page);
  const totalPages = useSelector((state: RootState) => state.student.totalPages);
  const totalCount = useSelector((state: RootState) => state.student.totalCount);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window === "undefined") return 10;
    const saved = window.localStorage.getItem("admin_students_pageSize");
    return saved ? Number(saved) : 10;
  });

  const [newStudent, setNewStudent] = useState<NewStudentData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchStudents({ page: currentPage, limit: pageSize }));
    }
  }, [status, dispatch, pageSize, currentPage]);

  useEffect(() => {
    dispatch(fetchStudents({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleCreateStudent = () => {
    if (
      newStudent.firstName &&
      newStudent.lastName &&
      newStudent.birthDate &&
      newStudent.username &&
      newStudent.password
    ) {
      dispatch(createStudent(newStudent))
        .unwrap()
        .then(() => {
          // Yeni bir öğrenci eklendikten sonra listeyi tekrar çek
          dispatch(fetchStudents());
        });
      setNewStudent({
        firstName: "",
        lastName: "",
        birthDate: "",
        username: "",
        password: "",
      });
    }
  };

  const handleDeleteStudent = (id: string) => {
    dispatch(deleteStudent(id))
      .unwrap()
      .then(() => {
        dispatch(fetchStudents());
      });
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Öğrenci Yönetimi</h2>
      </div>


      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Yeni Öğrenci Ekle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="Ad"
            value={newStudent.firstName}
            onChange={(e) =>
              setNewStudent({ ...newStudent, firstName: e.target.value })
            }
          />
          <Input
            label="Soyad"
            value={newStudent.lastName}
            onChange={(e) =>
              setNewStudent({ ...newStudent, lastName: e.target.value })
            }
          />
          <Input
            label="Doğum Tarihi"
            type="date"
            value={newStudent.birthDate}
            onChange={(e) =>
              setNewStudent({ ...newStudent, birthDate: e.target.value })
            }
          />
          <Input
            label="Kullanıcı Adı"
            value={newStudent.username}
            onChange={(e) =>
              setNewStudent({ ...newStudent, username: e.target.value })
            }
          />
          <Input
            label="Şifre"
            type="password"
            value={newStudent.password}
            onChange={(e) =>
              setNewStudent({ ...newStudent, password: e.target.value })
            }
          />
        </div>
        <Button onClick={handleCreateStudent}>Ekle</Button>
      </div>

    
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          Öğrenci Listesi ({totalCount})
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sayfa boyutu:</label>
            <select
              className="border rounded px-2 py-1"
              value={pageSize}
              onChange={(e) => {
                const next = Number(e.target.value);
                setPageSize(next);
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("admin_students_pageSize", String(next));
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
        <ul>
          {students.map((student) => (
            <li
              key={student._id}
              className="border-b py-2 flex justify-between items-center"
            >
              <span>
                {student.firstName} {student.lastName}
              </span>
              <div className="space-x-2">
                <button className="text-sm text-blue-500 hover:text-blue-700">
                  Detay
                </button>
                <button className="text-sm text-yellow-500 hover:text-yellow-700">
                  Düzenle
                </button>
                <button
                  className="text-sm text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteStudent(student._id)}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Önceki
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => {
                // Show a window around current page: first, last, and +/-2
                return (
                  n === 1 ||
                  n === totalPages ||
                  (n >= currentPage - 2 && n <= currentPage + 2)
                );
              })
              .map((n, idx, arr) => {
                const prev = arr[idx - 1];
                const needEllipsis = prev && n - prev > 1;
                return (
                  <React.Fragment key={n}>
                    {needEllipsis && <span className="px-2">…</span>}
                    <button
                      className={`px-3 py-1 rounded ${n === page ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>
          <button
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentManagementPage;
