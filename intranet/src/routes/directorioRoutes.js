const express = require("express");
const router = express.Router();
const DirectorioController = require("../controllers/directorioController");

router.get("/", DirectorioController.getAll);
router.post("/", DirectorioController.create);
router.put("/:id", DirectorioController.update);
router.delete("/:id", DirectorioController.delete);

module.exports = router;
