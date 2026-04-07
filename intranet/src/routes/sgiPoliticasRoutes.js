const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ctrl = require("../controllers/sgiPoliticasController");

const UPLOAD_PATH = path.join(
  process.cwd(),
  "data/menu header/sgi/Políticas Institucionales",
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

// GET    /api/sgi/politicas (devuelve metadata + items)
router.get("/", ctrl.getPoliticas);

// POST   /api/sgi/politicas/upload
router.post("/upload", upload.single("file"), ctrl.uploadFile);

// POST   /api/sgi/politicas (crear dinámico)
router.post("/", ctrl.createPolitica);

// PUT    /api/sgi/politicas/:id (actualizar dinámico o estático)
router.put("/:id", ctrl.updatePolitica);

// DELETE /api/sgi/politicas/:id
router.delete("/:id", ctrl.deletePolitica);

module.exports = router;
