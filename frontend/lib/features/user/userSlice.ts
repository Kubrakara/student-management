import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  token: string | null;
  role: "admin" | "student" | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  token: null,
  role: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; role: "admin" | "student" }>
    ) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("role", action.payload.role);
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        // Docker restart sonrası localStorage'ı temizle
        const lastRestart = localStorage.getItem("lastRestart");
        const currentTime = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 saat
        
        if (!lastRestart || (currentTime - parseInt(lastRestart)) > oneHour) {
          localStorage.clear();
          localStorage.setItem("lastRestart", currentTime.toString());
          return;
        }
        
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role") as "admin" | "student" | null;
        
        if (token && role) {
          state.token = token;
          state.role = role;
          state.isAuthenticated = true;
        }
      }
    },
    clearAuth: (state) => {
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
    },
  },
});

export const { setCredentials, logout, initializeAuth, clearAuth } = userSlice.actions;
export default userSlice.reducer;
