"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  fetchStudents,
  createStudent,
  deleteStudent,
  updateStudent,
  IStudent,
} from "@/lib/features/student/studentSlice";
import Button from "@/components/Button";
import Input from "@/components/Input";
import StudentDetailModal from "@/components/StudentDetailModal";

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
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [editFormError, setEditFormError] = useState<string>("");

  const [newStudent, setNewStudent] = useState<NewStudentData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    username: "",
    password: "",
  });

  const [editStudent, setEditStudent] = useState<Partial<IStudent>>({});

  useEffect(() => {
    const loadStudents = async () => {
      try {
        await dispatch(fetchStudents({ page: currentPage, limit: pageSize })).unwrap();
      } catch (error) {
        console.error('Öğrenciler yüklenirken hata:', error);
      }
    };
    loadStudents();
  }, [dispatch, currentPage, pageSize]);

  const handleCreateStudent = () => {
    setFormError("");

    // Alan kontrolü
    if (
      newStudent.firstName &&
      newStudent.lastName &&
      newStudent.birthDate &&
      newStudent.username &&
      newStudent.password
    ) {
      // Doğum tarihi gelecekte olamaz (istemci doğrulaması)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(newStudent.birthDate);
      selected.setHours(0, 0, 0, 0);

      if (selected.getTime() > today.getTime()) {
        setFormError("Doğum tarihi gelecekte olamaz.");
        return;
      }

      dispatch(createStudent(newStudent))
        .unwrap()
        .then(() => {
          // Yeni öğrenci eklendikten sonra listeyi tekrar çek
          dispatch(fetchStudents({ page: currentPage, limit: pageSize }));
          setFormError(""); // Başarılı olduğunda hata mesajını temizle
        })
        .catch((error) => {
          setFormError(error || "Öğrenci eklenirken hata oluştu.");
        });
      setNewStudent({
        firstName: "",
        lastName: "",
        birthDate: "",
        username: "",
        password: "",
      });
    } else {
      setFormError("Lütfen tüm alanları doldurun.");
    }
  };

  const handleDeleteStudent = (id: string) => {
    dispatch(deleteStudent(id))
      .unwrap()
      .then(() => {
        // Eğer mevcut sayfada sadece 1 öğrenci varsa ve o siliniyorsa, önceki sayfaya git
        if (students.length === 1 && currentPage > 1) {
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          dispatch(fetchStudents({ page: newPage, limit: pageSize }));
        } else {
          // Normal durumda mevcut sayfayı yenile
          dispatch(fetchStudents({ page: currentPage, limit: pageSize }));
        }
      })
      .catch((error) => {
        console.error('Öğrenci silinirken hata:', error);
      });
  };

  const handleStudentClick = (student: IStudent) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleEditStudent = (student: IStudent) => {
    setEditStudent({
      _id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditStudent({});
    setEditFormError("");
  };

  const handleUpdateStudent = () => {
    if (!editStudent._id) return;

    setEditFormError("");

    // Alan kontrolü
    if (!editStudent.firstName || !editStudent.lastName || !editStudent.birthDate) {
      setEditFormError("Lütfen tüm alanları doldurun.");
      return;
    }

    // Doğum tarihi gelecekte olamaz
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(editStudent.birthDate);
    selected.setHours(0, 0, 0, 0);

    if (selected.getTime() > today.getTime()) {
      setEditFormError("Doğum tarihi gelecekte olamaz.");
      return;
    }

    dispatch(updateStudent(editStudent as IStudent))
      .unwrap()
      .then(() => {
        // Başarılı olduğunda listeyi yenile
        dispatch(fetchStudents({ page: currentPage, limit: pageSize }));
        handleCloseEditModal();
      })
      .catch((error) => {
        setEditFormError(error || "Öğrenci güncellenirken hata oluştu.");
      });
  };

  if (status === "loading") {
    return <div className="text-center mt-10">Öğrenciler yükleniyor...</div>;
  }

  if (status === "failed") {
    return <div className="text-center mt-10 text-red-500">Veriler yüklenirken hata oluştu.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Öğrenci Yönetimi</h2>
      </div>


      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Yeni Öğrenci Ekle</h3>
        {formError && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300">
            {formError}
          </div>
        )}
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
          {students.length === 0 ? (
            <li className="text-center py-4 text-gray-500">
              {status === "succeeded" ? "Henüz öğrenci bulunmamaktadır." : "Öğrenciler yükleniyor..."}
            </li>
          ) : (
            students.map((student) => (
            <li
              key={student._id}
              className="border-b py-2 flex justify-between items-center"
            >
              <div>
                <span className="font-medium">
                  {student.firstName} {student.lastName}
                </span>
                {student.username && (
                  <span className="text-sm text-gray-500 ml-2">
                    (@{student.username})
                  </span>
                )}
              </div>
              <div className="space-x-2">
                <button 
                  className="text-sm text-blue-500 hover:text-blue-700"
                  onClick={() => handleStudentClick(student)}
                >
                  Detay
                </button>
                <button 
                  className="text-sm text-yellow-500 hover:text-yellow-700"
                  onClick={() => handleEditStudent(student)}
                >
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
            ))
          )}
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

      <StudentDetailModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Düzenleme Modal'ı */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border">
            <h3 className="text-xl font-semibold mb-4">Öğrenci Düzenle</h3>
            {editFormError && (
              <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300">
                {editFormError}
              </div>
            )}
            <div className="space-y-4">
              <Input
                label="Ad"
                value={editStudent.firstName || ""}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, firstName: e.target.value })
                }
              />
              <Input
                label="Soyad"
                value={editStudent.lastName || ""}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, lastName: e.target.value })
                }
              />
              <Input
                label="Doğum Tarihi"
                type="date"
                value={editStudent.birthDate || ""}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, birthDate: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={handleUpdateStudent}
                className="bg-green-600 hover:bg-green-700"
              >
                Güncelle
              </Button>
              <Button 
                onClick={handleCloseEditModal}
                className="bg-gray-500 hover:bg-gray-600"
              >
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagementPage;
