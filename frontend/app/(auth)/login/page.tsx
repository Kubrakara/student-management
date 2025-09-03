"use client";

import React, { useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
        }
      );
      const { token, role } = response.data;
      dispatch(setCredentials({ token, role }));

      if (role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error(
        "Giriş hatası:",
        (error.response?.data as { message: string })?.message ||
          "Bilinmeyen bir hata oluştu."
      );
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Giriş Yap
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
            <Button type="submit">Giriş Yap</Button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Hemen kaydol.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
