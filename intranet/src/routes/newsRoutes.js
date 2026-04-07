const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const NewsController = require("../controllers/newsController");

// Multer Storage Configuration (Specific to News Images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../data/imagenes");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

const { checkAuth } = require("../middlewares/authMiddleware");

// Routes
router.get("/", NewsController.getAllNews);
router.post("/", checkAuth, NewsController.createNews);
router.delete("/:id", checkAuth, NewsController.deleteNews);
router.post("/upload", checkAuth, upload.single("image"), NewsController.uploadImage);

module.exports = router;
