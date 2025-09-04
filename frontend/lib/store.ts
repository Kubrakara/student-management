import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice";
import studentReducer from "./features/student/studentSlice";
import courseReducer from "./features/course/courseSlice";
import enrollmentReducer from "./features/enrollment/enrollmentSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    student: studentReducer,
    course: courseReducer,
    enrollment: enrollmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
