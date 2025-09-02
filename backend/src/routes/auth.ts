import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User"; // IUser'ı da içeri aktardık
import { IRequest } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Kullanıcı adı zaten mevcut." });
    }
    const user = new User({ username, password, role });
    await user.save();

    res.status(201).json({ message: "Kayıt başarılı." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
   
    const user = (await User.findOne({ username })) as IUser;
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

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" } 
    );

    res
      .status(200)
      .json({ message: "Giriş başarılı.", token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.post("/logout", (req: Request, res: Response) => {

  res.status(200).json({ message: "Çıkış başarılı." });
});

export default router;
