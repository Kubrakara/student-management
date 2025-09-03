"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Yönlendiriliyorsunuz...
        </h2>
        <p className="text-gray-600 mt-2">
          Kayıt işlemleri admin tarafından yapılmaktadır.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-500"
        >
          Giriş sayfasına dön.
        </Link>
      </div>
    </div>
  );
}
