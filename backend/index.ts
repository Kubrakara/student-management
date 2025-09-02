// backend/index.ts

import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./src/routes/auth";
import studentRoutes from "./src/routes/studentRoutes";
import courseRoutes from "./src/routes/courseRoutes"; 
import enrollmentRoutes from "./src/routes/enrollmentRoutes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const MONGO_URI: string = process.env.MONGO_URI as string;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB bağlantısı başarılı.");
  })
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err.message);
  });

// Rotaları kullanma
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes); 

app.get("/", (req: Request, res: Response) => {
  res.send("API çalışıyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
