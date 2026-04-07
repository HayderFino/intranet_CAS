const ManualesModel = require("../models/manualesModel");

const ManualesController = {
  getItems: (req, res) => {
    try {
      res.json(ManualesModel.getAll());
    } catch (e) {
      res.status(500).json({ message: "Error al obtener manuales." });
    }
  },
  createItem: (req, res) => {
    try {
      const id = ManualesModel.create(req.body);
      if (id) res.status(201).json({ message: "Manual creado.", id });
      else res.status(400).json({ message: "Error al crear." });
    } catch (e) {
      res.status(500).json({ message: "Error." });
    }
  },
  updateItem: (req, res) => {
    try {
      const newId = ManualesModel.update(req.params.id, req.body);
      if (newId)
        res.status(200).json({ message: "Manual actualizado.", id: newId });
      else res.status(404).json({ message: "No encontrado." });
    } catch (e) {
      res.status(500).json({ message: "Error." });
    }
  },
  deleteItem: (req, res) => {
    try {
      const ok = ManualesModel.delete(req.params.id);
      if (ok) res.status(200).json({ message: "Manual eliminado." });
      else res.status(404).json({ message: "No encontrado." });
    } catch (e) {
      res.status(500).json({ message: "Error." });
    }
  },
  uploadFile: (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Sin archivo." });
    const fileUrl = `../../data/menu header/sgi/manuales/${req.file.filename}`;
    res.json({ fileUrl });
  },
};

module.exports = ManualesController;
