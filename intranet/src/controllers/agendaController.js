const AgendaModel = require("../models/agendaModel");

const AgendaController = {
  getAllActivities: (req, res) => {
    try {
      const activities = AgendaModel.getAll();
      res.status(200).json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener agenda." });
    }
  },

  createActivity: (req, res) => {
    const { title, time } = req.body;
    if (!title || !time) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    try {
      const id = AgendaModel.create(title, time);
      res.status(201).json({ message: "Actividad agregada con éxito.", id });
    } catch (error) {
      res.status(500).json({ message: "Error al agregar actividad." });
    }
  },

  deleteActivity: (req, res) => {
    const id = req.params.id;
    try {
      AgendaModel.delete(id);
      res.status(200).json({ message: "Actividad eliminada." });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar actividad." });
    }
  },
};

module.exports = AgendaController;
