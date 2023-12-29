import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  tanggal: { type: Date, default: Date.now },
  keterangan: String,
  nominal: Number,
  jenis: { type: String, enum: ["pemasukan", "pengeluaran"] },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
