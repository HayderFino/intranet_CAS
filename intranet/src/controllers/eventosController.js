const EventosModel = require("../models/eventosModel");

const EventosController = {
  getAll: (req, res) => {
    try {
      const items = EventosModel.getAll().sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha),
      );
      res.status(200).json(items);
    } catch (e) {
      res.status(500).json({ message: "Error al obtener eventos." });
    }
  },
  create: (req, res) => {
    try {
      const item = EventosModel.create(req.body);
      res.status(201).json(item);
    } catch (e) {
      res.status(500).json({ message: "Error al crear evento." });
    }
  },
  update: (req, res) => {
    try {
      const item = EventosModel.update(req.params.id, req.body);
      if (!item)
        return res.status(404).json({ message: "Evento no encontrado." });
      res.status(200).json(item);
    } catch (e) {
      res.status(500).json({ message: "Error al actualizar evento." });
    }
  },
  delete: (req, res) => {
    try {
      const ok = EventosModel.delete(req.params.id);
      if (!ok)
        return res.status(404).json({ message: "Evento no encontrado." });
      res.status(200).json({ message: "Evento eliminado." });
    } catch (e) {
      res.status(500).json({ message: "Error al eliminar evento." });
    }
  },
};

module.exports = EventosController;
