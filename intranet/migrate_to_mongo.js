const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const News = require("./src/models/MongoNews");
const User = require("./src/models/userModel");

// Mongo URI (Default local)
const MONGO_URI = "mongodb://127.0.0.1:27017/intranet_cas";

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("--- Conectado a MongoDB para migración ---");

    // 1. MIGRACIÓN DE NOTICIAS
    const noticiasPath = path.join(__dirname, "data/noticias.json");
    if (fs.existsSync(noticiasPath)) {
      const newsData = JSON.parse(fs.readFileSync(noticiasPath, "utf8"));
      console.log(`Leídas ${newsData.length} noticias. Iniciando inserción...`);

      for (const item of newsData) {
        const existing = await News.findOne({ title: item.title });
        if (!existing) {
          const newsItem = new News({
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            category: item.category || "General",
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          });
          await newsItem.save();
          console.log(`✅ Noticia migrada: ${item.title}`);
        }
      }
    } else {
      console.log("No existe el archivo noticias.json para migrar.");
    }

    // 2. MIGRACIÓN DE USUARIO POR DEFECTO
    const defaultUserPath = path.join(__dirname, "default_user.json");
    if (fs.existsSync(defaultUserPath)) {
      const userData = JSON.parse(fs.readFileSync(defaultUserPath, "utf8"));
      // migrate_to_mongo.js usará el primer usuario del array (Admin)
      const adminData = Array.isArray(userData) ? userData[0] : userData;

      const existingUser = await User.findOne({ username: adminData.username });
      if (!existingUser) {
        const newUser = new User({
          username: adminData.username,
          password: adminData.password,
          role: adminData.role,
          displayName: adminData.displayName,
          permissions: adminData.permissions,
        });
        await newUser.save();
        console.log(`👤 Usuario migrado: ${adminData.username}`);
      } else {
        console.log(
          `👤 El usuario ${adminData.username} ya existe en la base de datos.`,
        );
        // Opcional: Actualizar permisos si ya existe
        existingUser.permissions = adminData.permissions;
        await existingUser.save();
        console.log(`✅ Permisos actualizados para: ${adminData.username}`);
      }
    } else {
      console.log("No existe el archivo default_user.json.");
    }

    console.log("--- Migración finalizada con éxito ---");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error grave en migración:", err);
    process.exit(1);
  }
}

migrate();
