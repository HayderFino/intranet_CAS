const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ctrl = require("../controllers/pcbController");

const UPLOAD_PATH = path.join(
  process.cwd(),
  "data/Herramientas/pcb/Documentos Inventario PCB",
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_PATH))
      fs.mkdirSync(UPLOAD_PATH, { recursive: true });
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), ctrl.uploadFile);
router.get("/", ctrl.getItems);
router.post("/", ctrl.createItem);
router.put("/:id", ctrl.updateItem);
router.delete("/:id", ctrl.deleteItem);

// --- Tabla de Plazos ---
router.get("/tabla", ctrl.getAllRows);
router.post("/tabla", ctrl.createRow);
router.put("/tabla/:id", ctrl.updateRow);
router.delete("/tabla/:id", ctrl.deleteRow);

module.exports = router;
