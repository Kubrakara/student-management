import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import Student from "../models/Student";
import { IRequest } from "../middlewares/authMiddleware";
import authMiddleware, { authorizeRoles } from "../middlewares/authMiddleware";

const router = express.Router();

router.post(
  "/register",
  authMiddleware,
  authorizeRoles("admin"),
  async (req: IRequest, res: Response) => {
    const { username, password, firstName, lastName, birthDate } = req.body;
    const role = "student";

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ message: "Kullanıcı adı zaten mevcut." });
      }

      const student = new Student({ firstName, lastName, birthDate });
      await student.save();

      const user = new User({
        username,
        password,
        role,
        studentId: student._id,
      });
      await user.save();

      res.status(201).json({
        message: "Öğrenci kaydı başarıyla oluşturuldu.",
        studentId: student._id,
      });
    } catch (err: any) {
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Sunucu hatası." });
    }
  }
);

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const normalizedUsername = (username || "").toLowerCase().trim();
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Geçersiz kullanıcı adı veya şifre." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Geçersiz kullanıcı adı veya şifre." });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message: "Giriş başarılı.", token, role: user.role });
  } catch (err: any) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.status(200).json({ message: "Çıkış başarılı." });
});

export default router;
