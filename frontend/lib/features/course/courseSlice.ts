import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/api";
import { AxiosError } from "axios";

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

export const fetchCourses = createAsyncThunk(
  "course/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/courses");
      return response.data.courses;
    } catch (err: unknown) {
      const error = err as AxiosError;
      return rejectWithValue(
        (error.response?.data as { message?: string })?.message || error.message
      );
    }
  }
);


export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (courseData: Omit<ICourse, "_id">, { rejectWithValue }) => {
    try {
      const response = await api.post("/courses", courseData);
      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      return rejectWithValue(
        (error.response?.data as { message?: string })?.message || error.message
      );
    }
  }
);

export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${courseId}`);
      return courseId;
    } catch (err: unknown) {
      const error = err as AxiosError;
      return rejectWithValue(
        (error.response?.data as { message?: string })?.message || error.message
      );
    }
  }
);

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchCourses için reducer'lar
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCourses.fulfilled,
        (state, action: PayloadAction<ICourse[]>) => {
          state.status = "succeeded";
          state.courses = action.payload;
        }
      )
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      // createCourse için reducer
      .addCase(
        createCourse.fulfilled,
        (state, action: PayloadAction<ICourse>) => {
          state.courses.push(action.payload);
        }
      )
      // deleteCourse için reducer
      .addCase(
        deleteCourse.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.courses = state.courses.filter(
            (course) => course._id !== action.payload
          );
        }
      );
  },
});

export const {} = courseSlice.actions; 
export default courseSlice.reducer;
