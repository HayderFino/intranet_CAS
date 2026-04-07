const PcbModel = require("../models/pcbModel");

const PcbController = {
  getItems: (req, res) => {
    try {
      res.json(PcbModel.getAll());
    } catch (e) {
      res.status(500).json({ message: "Error al obtener." });
    }
  },
  createItem: (req, res) => {
    try {
      const id = PcbModel.create(req.body);
      if (id) res.status(201).json({ message: "Creado.", id });
      else res.status(400).json({ message: "Error." });
    } catch (e) {
      res.status(500).json({ message: "Error al crear." });
    }
  },
  updateItem: (req, res) => {
    try {
      const newId = PcbModel.update(req.params.id, req.body);
      if (newId) res.status(200).json({ message: "Actualizado.", id: newId });
      else res.status(404).json({ message: "No encontrado." });
    } catch (e) {
      res.status(500).json({ message: "Error al actualizar." });
    }
  },
  deleteItem: (req, res) => {
    try {
      const ok = PcbModel.delete(req.params.id);
      if (ok) res.status(200).json({ message: "Eliminado." });
      else res.status(404).json({ message: "No encontrado." });
    } catch (e) {
      res.status(500).json({ message: "Error al eliminar." });
    }
  },
  uploadFile: (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Sin archivo." });
    const fileUrl = `../data/Herramientas/pcb/Documentos Inventario PCB/${req.file.filename}`;
    res.json({ fileUrl });
  },

  // --- Tabla de Plazos ---
  getAllRows: (req, res) => {
    try {
      res.json(PcbModel.getAllRows());
    } catch (e) {
      res.status(500).json({ message: "Error al obtener filas." });
    }
  },
  createRow: (req, res) => {
    try {
      const id = PcbModel.createRow(req.body);
      if (id) res.status(201).json({ message: "Fila creada.", id });
      else res.status(400).json({ message: "Error al crear fila." });
    } catch (e) {
      res.status(500).json({ message: "Error." });
    }
  },
  updateRow: (req, res) => {
    try {
      const newId = PcbModel.updateRow(req.params.id, req.body);
      if (newId)
        res.status(200).json({ message: "Fila actualizada.", id: newId });
      else res.status(404).json({ message: "Fila no encontrada." });
    } catch (e) {
      res.status(500).json({ message: "Error." });
    }
  },
  deleteRow: (req, res) => {
    try {
      const ok = PcbModel.deleteRow(req.params.id);
      if (ok) res.status(200).json({ message: "Fila eliminada." });
      else res.status(404).json({ message: "Fila no encontrada." });
    } catch (e) {
      res.status(500).json({ message: "Error." });
    }
  },
};

module.exports = PcbController;
