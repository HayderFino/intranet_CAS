const express = require("express");
const router = express.Router();
const EventosController = require("../controllers/eventosController");

router.get("/", EventosController.getAll);
router.post("/", EventosController.create);
router.put("/:id", EventosController.update);
router.delete("/:id", EventosController.delete);

module.exports = router;
