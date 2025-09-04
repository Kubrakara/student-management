import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/api";
import { AxiosError } from "axios";

export interface IEnrollmentItem {
  _id: string;
  student: { _id: string; firstName: string; lastName: string } | string;
  course: { _id: string; name: string } | string;
}

interface EnrollmentState {
  enrollments: IEnrollmentItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const initialState: EnrollmentState = {
  enrollments: [],
  status: "idle",
  error: null,
  page: 1,
  limit: 10,
  totalCount: 0,
  totalPages: 0,
};

export const fetchEnrollments = createAsyncThunk(
  "enrollment/fetchEnrollments",
  async (
    params: { page?: number; limit?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const response = await api.get("/enrollments", { params: { page, limit } });
      return response.data as {
        enrollments: IEnrollmentItem[];
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

export const deleteEnrollment = createAsyncThunk(
  "enrollment/deleteEnrollment",
  async (enrollmentId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/enrollments/withdraw/${enrollmentId}`);
      return enrollmentId;
    } catch (err: unknown) {
      const error = err as AxiosError;
      return rejectWithValue(
        (error.response?.data as { message?: string })?.message || error.message
      );
    }
  }
);

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchEnrollments.fulfilled,
        (
          state,
          action: PayloadAction<{
            enrollments: IEnrollmentItem[];
            totalCount: number;
            page: number;
            totalPages: number;
          }>
        ) => {
          state.status = "succeeded";
          state.enrollments = action.payload.enrollments;
          state.totalCount = action.payload.totalCount;
          state.page = action.payload.page;
          state.totalPages = action.payload.totalPages;
        }
      )
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(
        deleteEnrollment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.enrollments = state.enrollments.filter(e => e._id !== action.payload);
        }
      );
  },
});

export default enrollmentSlice.reducer;



