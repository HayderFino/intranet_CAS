const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const BannerController = require("../controllers/bannerController");

// Configuration for Banner Images and Files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "";
    if (file.fieldname === "image") {
      uploadPath = path.join(
        __dirname,
        "../../data/menu header/index/imagenes-banner",
      );
    } else if (file.fieldname === "file") {
      uploadPath = path.join(
        __dirname,
        "../../data/menu header/index/archivos banner",
      );
    } else {
      uploadPath = path.join(__dirname, "../../uploads"); // fallback
    }

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

router.get("/", BannerController.getAllBanners);
router.put("/:id", BannerController.updateBanner);
router.delete("/:id", BannerController.deleteBanner);

// Upload endpoint MUST be registered before POST '/' to avoid route shadowing
router.post(
  "/upload",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  BannerController.uploadFiles,
);

// Create banner (after /upload to avoid shadowing)
router.post("/", BannerController.createBanner);

module.exports = router;
