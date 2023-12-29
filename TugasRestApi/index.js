import express from "express";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import auth from "./routes/auth.js";
import transaction from "./routes/transaction.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Menghubungkan ke database MongoDB
connectDB();

// Mengatur rute otentikasi
app.use("/auth", auth);
app.use("/api", transaction);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
