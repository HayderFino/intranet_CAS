const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const respelController = require("../controllers/respelController");

const DATA_CONFIG = {
  documentos: "data/Herramientas/Respel/Documentos de Referencia",
  empresas: "data/Herramientas/Respel/Empresas Gestoras Licenciadas por la CAS",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const section = req.body.section || "documentos";
      const relativeBase = DATA_CONFIG[section] || DATA_CONFIG["documentos"];
      const destPath = path.join(process.cwd(), relativeBase);

      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      cb(null, destPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), respelController.uploadFile);
router.get("/:section", respelController.getItems);
router.post("/:section", respelController.createItem);
router.put("/:section/:id", respelController.updateItem);
router.delete("/:section/:id", respelController.deleteItem);

module.exports = router;
