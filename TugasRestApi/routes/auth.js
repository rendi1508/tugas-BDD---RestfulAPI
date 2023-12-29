import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Cek apakah email atau username sudah digunakan
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Gagal Register",
        data: {
          msg: "Email atau Username sudah ada",
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna baru ke database
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Buat token JWT
    const token = jwt.sign({ userId: newUser._id }, "secret_key", {
      expiresIn: "1h",
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Berhasil Register",
      data: {
        token: token,
      },
    });
  } catch (error) {
    console.error("Registrasi gagal:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Gagal Register",
      data: { msg: "Internal server error" },
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Cari pengguna berdasarkan email atau username
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Gagal Login",
        data: {
          msg: " Email atau Username tidak ditemukan",
        },
      });
    }

    // Periksa kata sandi
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Gagal Login",
        data: {
          msg: "Password salah",
        },
      });
    }

    // Buat token JWT
    const token = jwt.sign({ userId: user._id }, "secret_key", {
      expiresIn: "1h",
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Berhasil Login",
      data: {
        token: token,
      },
    });
  } catch (error) {
    console.error("Login gagal:", error);
    res.status(500).json({
      code: 500,
      success: false,
      message: "Gagal Login",
      data: { msg: "Internal server error" },
    });
  }
});

export default router;
