import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/api";
import { AxiosError } from "axios";

export interface IStudent {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  username: string; 
  password: string; 
}

interface StudentState {
  students: IStudent[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const initialState: StudentState = {
  students: [],
  status: "idle",
  error: null,
  page: 1,
  limit: 10,
  totalCount: 0,
  totalPages: 0,
};
//paginatiom fetch students
export const fetchStudents = createAsyncThunk(
  "student/fetchStudents",
  async (
    params: { page?: number; limit?: number } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const response = await api.get("/students", { params: { page, limit } });
      return response.data as {
        students: IStudent[];
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

export const createStudent = createAsyncThunk(
  "student/createStudent",
  async (studentData: Omit<IStudent, "_id">, { rejectWithValue }) => {
    try {
      
      const response = await api.post("/auth/register", studentData);
      return response.data; 
    } catch (err: unknown) {
      const error = err as AxiosError;
      return rejectWithValue(
        (error.response?.data as { message?: string })?.message || error.message
      );
    }
  }
);

// Asenkron thunk: Öğrenci güncelleme
export const updateStudent = createAsyncThunk(
  "student/updateStudent",
  async (studentData: IStudent, { rejectWithValue }) => {
    try {
      const response = await api.put(`/students/${studentData._id}`, studentData);
      return response.data;
    } catch (err: unknown) {
      const error = err as AxiosError;
      return rejectWithValue(
        (error.response?.data as { message?: string })?.message || error.message
      );
    }
  }
);

// Asenkron thunk: Öğrenci silme
export const deleteStudent = createAsyncThunk(
  "student/deleteStudent",
  async (studentId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/students/${studentId}`);
      return studentId;
    } catch (err: unknown) {
      const error = err as AxiosError;
      return rejectWithValue(
        (error.response?.data as { message?: string })?.message || error.message
      );
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchStudents.fulfilled,
        (
          state,
          action: PayloadAction<{
            students: IStudent[];
            totalCount: number;
            page: number;
            totalPages: number;
          }>
        ) => {
          state.status = "succeeded";
          state.students = action.payload.students;
          state.totalCount = action.payload.totalCount;
          state.page = action.payload.page;
          state.totalPages = action.payload.totalPages;
        }
      )
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createStudent.fulfilled, () => {
        // Yeni öğrenci eklendiğinde state güncellenmez, 
        // fetchStudents ile tekrar çekilir
      })
      .addCase(
        updateStudent.fulfilled,
        (state, action: PayloadAction<IStudent>) => {
          const index = state.students.findIndex(
            (student) => student._id === action.payload._id
          );
          if (index !== -1) {
            state.students[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteStudent.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.students = state.students.filter(
            (student) => student._id !== action.payload
          );
        }
      );
  },
});

export default studentSlice.reducer;