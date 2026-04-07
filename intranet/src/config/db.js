const mongoose = require("mongoose");

const connectDB = async () => {
  const MONGO_URI =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/intranet_cas";
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.error("❌ Error de conexión a MongoDB:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
