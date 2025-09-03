// frontend/components/AuthenticatedRoute.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useEffect } from 'react';

const AuthenticatedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'student' }) => {
  const router = useRouter();
  const { isAuthenticated, role } = useSelector((state: RootState) => state.user);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (requiredRole && role !== requiredRole) {
      router.push('/login');
    }
  }, [isAuthenticated, role, requiredRole, router]);

  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return <div className="text-center mt-10">Yükleniyor...</div>;
  }

  return <>{children}</>;
};

export default AuthenticatedRoute;