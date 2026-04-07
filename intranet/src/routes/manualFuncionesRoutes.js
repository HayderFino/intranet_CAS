const express = require("express");
const router = express.Router();
const controller = require("../controllers/manualFuncionesController");
const multer = require("multer");

// Subida a carpeta temporal primero
const upload = multer({ dest: "uploads/" });

router.get("/", controller.getAll);
router.post("/", upload.single("file"), controller.create);
router.put("/:id", upload.single("file"), controller.update);
router.delete("/:id", controller.delete);

module.exports = router;
