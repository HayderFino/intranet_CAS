const RespelModel = require("../models/respelModel");
const path = require("path");
const fs = require("fs");

const DATA_PATH_BASE = "data/Herramientas/Respel";

const RespelController = {
  getItems: (req, res) => {
    const { section } = req.params;
    try {
      const items = RespelModel.getAll(section);
      res.status(200).json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener items de Respel." });
    }
  },

  createItem: (req, res) => {
    const { section } = req.params;
    const data = req.body;

    try {
      const id = RespelModel.create(section, data);
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
    const { section, id } = req.params;
    const data = req.body;

    try {
      const newId = RespelModel.update(section, id, data);
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
    const { section, id } = req.params;
    try {
      const deleted = RespelModel.delete(section, id);
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

    const section = req.body.section || "documentos";
    const folderName =
      section === "documentos"
        ? "Documentos de Referencia"
        : "Empresas Gestoras Licenciadas por la CAS";

    // La URL debe ser relativa al archivo HTML (que está en herramientas/)
    // El archivo se subió a intranet/data/Herramientas/Respel/...
    // El HTML está en intranet/herramientas/
    // Así que la ruta desde el HTML sería: ../data/Herramientas/Respel/...
    const fileUrl = `../data/Herramientas/Respel/${folderName}/${req.file.filename}`;

    res.status(200).json({ fileUrl });
  },
};

module.exports = RespelController;
