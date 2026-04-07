const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ruaController = require("../controllers/ruaController");

const RUA_UPLOAD_PATH = "data/Herramientas/Rua/Documentos de Referencia";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destPath = path.join(process.cwd(), RUA_UPLOAD_PATH);
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), ruaController.uploadFile);
router.get("/", ruaController.getItems);
router.post("/", ruaController.createItem);
router.put("/:id", ruaController.updateItem);
router.delete("/:id", ruaController.deleteItem);

module.exports = router;
