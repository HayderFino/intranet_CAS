const express = require("express");
const router = express.Router();
const multer = require("multer");
const SirhController = require("../controllers/sirhController");

const upload = multer({ dest: "uploads/" });

router.get("/", SirhController.getAll);
router.post("/", upload.single("file"), SirhController.create);
router.put("/:id", upload.single("file"), SirhController.update);
router.delete("/:id", SirhController.delete);

module.exports = router;
