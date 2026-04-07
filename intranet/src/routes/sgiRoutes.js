const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sgiController = require("../controllers/sgiController");

const { sgiUploadPaths: DATA_CONFIG } = require("../config/sgiConfig");

// Configuración de Multer dinámico
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      console.log("[Multer] Iniciando destino...");
      const section = req.body.section || "planeacion";
      const category = req.body.category || "Varios";

      const relativeBase = DATA_CONFIG[section] || DATA_CONFIG["planeacion"];
      const destPath = path.join(process.cwd(), relativeBase, category);

      console.log(`[Multer] Body:`, req.body);
      console.log(`[Multer] Ruta absoluta calculada: ${destPath}`);

      if (!fs.existsSync(destPath)) {
        console.log(`[Multer] Creando directorio faltante...`);
        fs.mkdirSync(destPath, { recursive: true });
      }
      cb(null, destPath);
    } catch (err) {
      console.error("[Multer Error Grave]", err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Rutas API
router.post("/upload", upload.single("file"), sgiController.uploadFile);
router.get("/:section", sgiController.getItems);
router.post("/:section", sgiController.createItem);
router.put("/:section/:id", sgiController.updateItem);
router.delete("/:section/:id", sgiController.deleteItem);

module.exports = router;
