"use client";

import React, { useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username,
          password,
          role,
        }
      );
      console.log("Kayıt başarılı:", response.data.message);
      router.push("/login");
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error(
        "Kayıt hatası:",
        (error.response?.data as { message: string })?.message ||
          "Bilinmeyen bir hata oluştu."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Hesap Oluştur
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="username"
            label="Kullanıcı Adı"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            id="password"
            label="Şifre"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="student">Öğrenci</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <Button type="submit">Kaydol</Button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600">
          Zaten bir hesabın var mı?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
