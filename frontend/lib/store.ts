import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice";
import studentReducer from "./features/student/studentSlice";
import courseReducer from "./features/course/courseSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    student: studentReducer,
    course: courseReducer,
    // Diğer reducer'lar buraya eklenecek
  },
});

// TypeScript için gerekli tipler
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
