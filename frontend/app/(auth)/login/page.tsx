"use client";

import React, { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Image from "next/image";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/login`,
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
      const message =
        (error.response?.data as { message?: string })?.message ||
        "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
      setErrorToast(message);
      setTimeout(() => setErrorToast(null), 4000);
    }
  };
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center">
      {errorToast && (
        <div className="fixed top-6 right-6 z-50">
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-800 shadow-lg px-4 py-3 animate-fade-in-up">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 5.5a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zM12 16a1 1 0 100 2 1 1 0 000-2z"/></svg>
            </span>
            <div className="text-sm font-medium pr-2">{errorToast}</div>
            <button
              aria-label="Kapat"
              className="ml-auto text-rose-600 hover:text-rose-800"
              onClick={() => setErrorToast(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="relative w-full max-w-5xl rounded-2xl border border-indigo-100 bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-indigo-50 to-sky-50">
            <div className="max-w-md">
              <h2 className="text-3xl font-extrabold text-indigo-700">Hoş Geldiniz!</h2>
              <p className="mt-2 text-sm text-gray-600">Öğrenci Yönetim Sistemine giriş yapın ve yönetimi kolaylaştırın.</p>
              <div className="relative mt-6 h-48 md:h-64 w-full overflow-hidden rounded-xl border border-indigo-100 shadow">
                <Image src="/images/studentlogin.jpg" alt="Login Illustration" fill className="object-cover" />
              </div>
            </div>
          </div>

         
          <div className="md:w-1/2 p-8 md:p-12">
            <div className="mx-auto max-w-md">
              <h1 className="text-center text-3xl md:text-4xl font-extrabold text-gray-900">Giriş Yap</h1>
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <Input
                  id="username"
                  label="Kullanıcı Adı"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı giriniz"
                />
                <Input
                  id="password"
                  label="Şifre"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi giriniz"
                />

              

                <Button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                >
                  Giriş Yap
                </Button>
              </form>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
