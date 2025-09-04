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
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const initialState: CourseState = {
  courses: [],
  status: "idle",
  error: null,
  page: 1,
  limit: 10,
  totalCount: 0,
  totalPages: 0,
};

export const fetchCourses = createAsyncThunk(
  "course/fetchCourses",
  async (
    params: { page?: number; limit?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const response = await api.get("/courses", { params: { page, limit } });
      return response.data as {
        courses: ICourse[];
        totalCount: number;
        page: number;
        totalPages: number;
      };
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

export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  async (
    { courseId, updates }: { courseId: string; updates: Partial<Omit<ICourse, "_id">> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/courses/${courseId}`, updates);
      return response.data as ICourse;
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
        (
          state,
          action: PayloadAction<{
            courses: ICourse[];
            totalCount: number;
            page: number;
            totalPages: number;
          }>
        ) => {
          state.status = "succeeded";
          state.courses = action.payload.courses;
          state.totalCount = action.payload.totalCount;
          state.page = action.payload.page;
          state.totalPages = action.payload.totalPages;
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
      )
      // updateCourse için reducer
      .addCase(
        updateCourse.fulfilled,
        (state, action: PayloadAction<ICourse>) => {
          const index = state.courses.findIndex(c => c._id === action.payload._id);
          if (index !== -1) {
            state.courses[index] = action.payload;
          }
        }
      );
  },
});

export const {} = courseSlice.actions; 
export default courseSlice.reducer;
