'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useEffect, useState } from 'react';

const AuthenticatedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'student' }) => {
  const router = useRouter();
  const { isAuthenticated, role } = useSelector((state: RootState) => state.user);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // localStorage'dan token kontrolü için kısa bir gecikme
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requiredRole && role !== requiredRole) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, role, requiredRole, router, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;