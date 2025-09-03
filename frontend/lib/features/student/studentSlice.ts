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
}

const initialState: StudentState = {
  students: [],
  status: "idle",
  error: null,
};

export const fetchStudents = createAsyncThunk(
  "student/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/students");
      return response.data.students;
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
        (state, action: PayloadAction<IStudent[]>) => {
          state.status = "succeeded";
          state.students = action.payload;
        }
      )
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createStudent.fulfilled, (state) => {
      
      })
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