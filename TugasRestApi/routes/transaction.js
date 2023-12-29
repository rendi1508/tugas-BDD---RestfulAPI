import express from "express";
import jwt from "jsonwebtoken";
import Transaction from "../models/transaction.js";

const router = express.Router();

// Middleware untuk memeriksa token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  jwt.verify(token, "secret_key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token tidak valid" });
    }
    req.userId = decoded.userId;
    next();
  });
};

// POST /transactions * TOKEN REQUIRED
router.post("/transactions", verifyToken, async (req, res) => {
  const { keterangan, nominal, jenis } = req.body;
  try {
    // Membuat transaksi baru
    const newTransaction = new Transaction({
      keterangan,
      nominal,
      jenis,
    });

    await newTransaction.save();

    res.status(201).json({
      code: 201,
      success: true,
      message: "Berhasil melakukan transaksi",
      data: newTransaction,
    });
  } catch (error) {
    console.error("Transaksi gagal:", error);
    if (jenis !== "pemasukan" || jenis !== "pengeluaran") {
      res.status(500).json({
        success: false,
        message:
          "Jenis transaksi harus di isi antara pemasukan atau pengeluaran",
      });
    } else {
      res
        .status(500)
        .json({
          code: 500,
          success: false,
          message: "Transaksi gagal",
          data: { msg: "Internal server error" },
        });
    }
  }
});

// GET /transactions
router.get("/transactions", async (req, res) => {
  try {
    // Menampilkan semua transaksi milik pengguna yang sedang login
    const transactions = await Transaction.find();
    res.status(200).json({
      code: 200,
      success: true,
      message: "Berhasil mendapatkan semua data transaksi",
      data: transactions,
    });
  } catch (error) {
    console.error("Gagal mendapatkan data transaksi:", error);
    res
      .status(500)
      .json({
        code: 500,
        success: false,
        message: "Gagal mendapatkan data transaksi",
        data: { msg: "Internal server error" },
      });
  }
});

// GET /transactions/:id_transaction
router.get("/transactions/:id_transaction", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id_transaction);

    if (!transaction) {
      return res
        .status(404)
        .json({
          code: 404,
          success: false,
          message: "Transaksi tidak ditemukan",
        });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "Berhasil mendapatkan 1 data transaksi",
      data: transaction,
    });
  } catch (error) {
    console.error("Gagal mendapatkan data transaksi:", error);
    res
      .status(500)
      .json({
        code: 500,
        success: false,
        message: "Transaksi tidak ditemukan",
        data: { msg: "Internal server error" },
      });
  }
});

// PUT /transactions/:id_transaction * TOKEN REQUIRED
router.put("/transactions/:id_transaction", verifyToken, async (req, res) => {
  try {
    const { keterangan, nominal, jenis } = req.body;

    // Mengecek apakah transaksi milik pengguna yang sedang login
    const transaction = await Transaction.findOne({
      _id: req.params.id_transaction,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({
          code: 404,
          success: false,
          message: "Transaksi tidak ditemukan",
        });
    }

    // Mengupdate transaksi
    transaction.keterangan = keterangan;
    transaction.nominal = nominal;
    transaction.jenis = jenis;

    await transaction.save();

    res.status(200).json({
      code: 200,
      success: true,
      message: "Berhasil mengupdate data transaksi",
      data: transaction,
    });
  } catch (error) {
    console.error("Gagal update data transaksi:", error);
    res
      .status(500)
      .json({
        code: 500,
        success: false,
        message: "Gagal update data transaksi",
        data: { msg: "Internal server error" },
      });
  }
});

// DELETE /transactions/:id_transaction * TOKEN REQUIRED
router.delete(
  "/transactions/:id_transaction",
  verifyToken,
  async (req, res) => {
    try {
      // Mengecek apakah transaksi milik pengguna yang sedang login
      const transaction = await Transaction.findOneAndDelete({
        _id: req.params.id_transaction,
      });

      if (!transaction) {
        return res
          .status(404)
          .json({
            code: 404,
            success: false,
            message: "Transaksi tidak ditemukan",
          });
      }

      res
        .status(200)
        .json({
          code: 200,
          success: true,
          message: "Berhasil hapus 1 data transaksi",
        });
    } catch (error) {
      console.error("Gagal menghapus data transaksi:", error);
      res
        .status(500)
        .json({
          code: 500,
          success: false,
          message: "Gagal menghapus data transaksi",
          data: { msg: "Internal server error" },
        });
    }
  }
);

export default router;
