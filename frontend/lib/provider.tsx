'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth, clearAuth } from './features/user/userSlice';
import axios from 'axios';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuthWithValidation = async () => {
      // Önce localStorage'dan token'ı yükle
      dispatch(initializeAuth());
      
      // Token varsa backend'den doğrula
      const state = store.getState();
      if (state.user.token) {
        try {
          await axios.get('http://localhost:5000/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${state.user.token}`
            }
          });
        } catch (error) {
          // Token geçersizse temizle
          dispatch(clearAuth());
        }
      }
    };

    initializeAuthWithValidation();
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}