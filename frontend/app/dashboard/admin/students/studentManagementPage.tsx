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
        if (students.length === 1 && currentPage > 1) {
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          dispatch(fetchStudents({ page: newPage, limit: pageSize }));
        } else {
        
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
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-white to-sky-50 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 drop-shadow-sm">Öğrenci Yönetimi</h2>
        <p className="mt-1 text-sm text-gray-600">Öğrenci ekleyin, düzenleyin ve kayıtlarını görüntüleyin.</p>
      </div>

      <div className="rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl border border-indigo-100 bg-white/80 backdrop-blur-sm">
        <h3 className="text-xl md:text-2xl font-bold text-indigo-700 mb-4">Yeni Öğrenci Ekle</h3>
        {formError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
            {formError}
          </div>
        )}
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
            <Input
              label="Ad"
              placeholder="Örn: Ayşe"
              value={newStudent.firstName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, firstName: e.target.value })
              }
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
            <Input
              label="Soyad"
              placeholder="Örn: Yılmaz"
              value={newStudent.lastName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, lastName: e.target.value })
              }
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
            <Input
              label="Doğum Tarihi"
              type="date"
              value={newStudent.birthDate}
              onChange={(e) =>
                setNewStudent({ ...newStudent, birthDate: e.target.value })
              }
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
            <Input
              label="Kullanıcı Adı"
              placeholder="Örn: ayse.yilmaz"
              value={newStudent.username}
              onChange={(e) =>
                setNewStudent({ ...newStudent, username: e.target.value })
              }
            />
          </div>
          <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
            <Input
              label="Şifre"
              type="password"
              placeholder="Güçlü bir şifre girin"
              value={newStudent.password}
              onChange={(e) =>
                setNewStudent({ ...newStudent, password: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreateStudent} className="w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-300 ease-in-out shadow-md">
            <span className="inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 4.5a.75.75 0 01.75.75v6h6a.75.75 0 010 1.5h-6v6a.75.75 0 01-1.5 0v-6h-6a.75.75 0 010-1.5h6v-6A.75.75 0 0112 4.5z"/></svg>
              Ekle
            </span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-sky-700">
            Öğrenci Listesi ({totalCount})
          </h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600" htmlFor="page-size">Sayfa boyutu:</label>
            <select
              id="page-size"
              className="h-10 border border-gray-200 rounded-lg px-3 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
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

        {students.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{status === "succeeded" ? "Henüz öğrenci bulunmamaktadır." : "Öğrenciler yükleniyor..."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ad Soyad</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kullanıcı Adı</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-sky-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-200 to-sky-200 flex items-center justify-center text-indigo-700 font-semibold">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-gray-500">ID: {student._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{student.username ? `@${student.username}` : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sky-700 bg-sky-100 hover:bg-sky-200 transition"
                          onClick={() => handleStudentClick(student)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                          Detay
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-amber-700 bg-amber-100 hover:bg-amber-200 transition"
                          onClick={() => handleEditStudent(student)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4 15.5V20h4.5l9.9-9.9-4.5-4.5L4 15.5zm15.7-9.2c.4-.4.4-1 0-1.4l-2.6-2.6a1 1 0 00-1.4 0l-1.8 1.8 4.5 4.5 1.3-1.3z"/></svg>
                          Düzenle
                        </button>
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 bg-rose-100 hover:bg-rose-200 transition"
                          onClick={() => handleDeleteStudent(student._id)}
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
              .filter((n) => {
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

      <StudentDetailModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Düzenleme Modal'ı */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md mx-auto shadow-2xl border border-gray-200 animate-zoom-in">
            <h3 className="text-2xl font-bold text-blue-700 mb-6">Öğrenci Düzenle</h3>
            {editFormError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                {editFormError}
              </div>
            )}
            <div className="flex flex-wrap -mx-2 mb-4">
              <div className="w-full md:w-1/2 px-2 mb-4">
                <Input
                  label="Ad"
                  value={editStudent.firstName || ""}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, firstName: e.target.value })
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                />
              </div>
              <div className="w-full md:w-1/2 px-2 mb-4">
                <Input
                  label="Soyad"
                  value={editStudent.lastName || ""}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, lastName: e.target.value })
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                />
              </div>
              <div className="w-full px-2 mb-4">
                <Input
                  label="Doğum Tarihi"
                  type="date"
                  value={editStudent.birthDate || ""}
                  onChange={(e) =>
                    setEditStudent({ ...editStudent, birthDate: e.target.value })
                  }
                  className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <Button 
                onClick={handleUpdateStudent}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5"
              >
                Güncelle
              </Button>
              <Button 
                onClick={handleCloseEditModal}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5"
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
