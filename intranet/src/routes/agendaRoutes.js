const express = require("express");
const router = express.Router();
const AgendaController = require("../controllers/agendaController");

router.get("/", AgendaController.getAllActivities);
router.post("/", AgendaController.createActivity);
router.delete("/:id", AgendaController.deleteActivity);

module.exports = router;
