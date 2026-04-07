const RuaModel = require("../models/ruaModel");
const path = require("path");
const fs = require("fs");

const RuaController = {
  getItems: (req, res) => {
    try {
      const items = RuaModel.getAll();
      res.status(200).json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener items de RUA." });
    }
  },

  createItem: (req, res) => {
    const data = req.body;
    try {
      const id = RuaModel.create(data);
      if (id) {
        res.status(201).json({ message: "Item creado con éxito.", id });
      } else {
        res.status(400).json({ message: "Error al crear item." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear item." });
    }
  },

  updateItem: (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
      const newId = RuaModel.update(id, data);
      if (newId) {
        res.status(200).json({ message: "Item actualizado.", id: newId });
      } else {
        res.status(404).json({ message: "No se pudo actualizar el item." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar." });
    }
  },

  deleteItem: (req, res) => {
    const { id } = req.params;
    try {
      const deleted = RuaModel.delete(id);
      if (deleted) {
        res.status(200).json({ message: "Item eliminado correctamente." });
      } else {
        res.status(404).json({ message: "Item no encontrado." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar item." });
    }
  },

  uploadFile: (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }
    const fileUrl = `../data/Herramientas/Rua/Documentos de Referencia/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  },
};

module.exports = RuaController;
