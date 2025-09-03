// frontend/lib/features/course/courseSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for a single Course object
export interface ICourse {
  _id: string;
  name: string;
}

interface CourseState {
  courses: ICourse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  status: "idle",
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    // Action to set the courses array
    setCourses: (state, action: PayloadAction<ICourse[]>) => {
      state.courses = action.payload;
    },
    // Other actions will be added later
  },
});

export const { setCourses } = courseSlice.actions;
export default courseSlice.reducer;
