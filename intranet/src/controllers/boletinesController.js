const BoletinesModel = require("../models/boletinesModel");

const BoletinesController = {
  getItems: (req, res) => {
    try {
      res.status(200).json(BoletinesModel.getAll());
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Error al obtener boletines." });
    }
  },

  createItem: (req, res) => {
    try {
      const id = BoletinesModel.create(req.body);
      if (id) res.status(201).json({ message: "Boletín creado.", id });
      else res.status(400).json({ message: "Error al crear boletín." });
    } catch (e) {
      res.status(500).json({ message: "Error al crear." });
    }
  },

  updateItem: (req, res) => {
    try {
      const newId = BoletinesModel.update(req.params.id, req.body);
      if (newId) res.status(200).json({ message: "Actualizado.", id: newId });
      else res.status(404).json({ message: "No encontrado." });
    } catch (e) {
      res.status(500).json({ message: "Error al actualizar." });
    }
  },

  deleteItem: (req, res) => {
    try {
      const ok = BoletinesModel.delete(req.params.id);
      if (ok) res.status(200).json({ message: "Boletín eliminado." });
      else res.status(404).json({ message: "No encontrado." });
    } catch (e) {
      res.status(500).json({ message: "Error al eliminar." });
    }
  },

  uploadFile: (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Sin archivo." });
    const fileUrl = `../../data/menu header/git/boletines/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  },
};

module.exports = BoletinesController;
