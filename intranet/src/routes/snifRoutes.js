const express = require("express");
const router = express.Router();
const multer = require("multer");
const SnifController = require("../controllers/snifController");

// Almacenamiento temporal; el controlador mueve el archivo a la carpeta definitiva
const upload = multer({ dest: "uploads/" });

router.get("/", SnifController.getAll);
router.post("/", upload.single("file"), SnifController.create);
router.put("/:id", upload.single("file"), SnifController.update);
router.delete("/:id", SnifController.delete);

module.exports = router;
