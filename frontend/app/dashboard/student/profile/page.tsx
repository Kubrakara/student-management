"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { studentProfileAPI } from "@/services/api";
import Button from "@/components/Button";
import Input from "@/components/Input";

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

const StudentProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [profile, setProfile] = useState<StudentProfile>({
    _id: "",
    firstName: "",
    lastName: "",
    birthDate: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await studentProfileAPI.getOwnProfile();
      setProfile({
        _id: data.student._id,
        firstName: data.student.firstName,
        lastName: data.student.lastName,
        birthDate: new Date(data.student.birthDate).toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Profil yükleme hatası:', err);
      setMessage("Profil bilgileri yüklenirken hata oluştu.");
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const updatedStudent = await studentProfileAPI.updateOwnProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: profile.birthDate
      });
      setMessage("Profil başarıyla güncellendi!");
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Profil güncellenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
    setMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-sky-100 bg-white/80 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-700">Profil Yönetimi</h1>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes("başarıyla") 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ad</label>
            <Input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad</label>
            <Input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Doğum Tarihi</label>
            <Input
              type="date"
              value={profile.birthDate}
              onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}
            />
          </div>

          {!isEditing && (
            <div className="pt-2">
              <Button
                onClick={() => setIsEditing(true)}
                className="w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md"
              >
                Düzenle
              </Button>
            </div>
          )}

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {isLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button
                onClick={handleCancel}
                className="w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl"
              >
                İptal
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
