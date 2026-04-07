const express = require("express");
const router = express.Router();
const multer = require("multer");
const RevisionRedController = require("../controllers/revisionRedController");

const upload = multer({ dest: "uploads/" });

router.get("/", RevisionRedController.getAll);
router.post("/", upload.single("file"), RevisionRedController.create);
router.put("/:id", upload.single("file"), RevisionRedController.update);
router.delete("/:id", RevisionRedController.delete);

module.exports = router;
