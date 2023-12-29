import mongoose from "mongoose";
export default function connectDB() {
  mongoose
    .connect("mongodb://127.0.0.1:27017/tugas-rest-api")
    .then(() => {
      console.log("Database Terhubung.....");
    })
    .catch((error) => {
      console.log("Db Tidak Terhubung.....");
      console.log(error);
    });
}
