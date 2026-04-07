const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ctrl = require("../controllers/boletinesController");

const UPLOAD_PATH = path.join(process.cwd(), "data/menu header/git/boletines");

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

module.exports = router;
