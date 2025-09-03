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

const StudentManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const students = useSelector((state: RootState) => state.student.students);
  const status = useSelector((state: RootState) => state.student.status);

  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchStudents());
    }
  }, [status, dispatch]);

  const handleCreateStudent = () => {
    dispatch(createStudent(newStudent));
    setNewStudent({ firstName: "", lastName: "", birthDate: "" });
  };

  const handleDeleteStudent = (id: string) => {
    dispatch(deleteStudent(id));
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Öğrenci Yönetimi</h2>
      </div>

      {/* Yeni Öğrenci Ekleme Formu */}
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
        </div>
        <Button onClick={handleCreateStudent}>Ekle</Button>
      </div>

      {/* Öğrenci Listesi */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          Öğrenci Listesi ({students.length})
        </h3>
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
      </div>
    </div>
  );
};

export default StudentManagementPage;
