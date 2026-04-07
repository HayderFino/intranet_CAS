const SgiModel = require("../models/sgiModel");
const UniversalCrawler = require("../models/universalCrawler");
const path = require("path");
const fs = require("fs");

const { sgiUploadPaths: DATA_CONFIG } = require("../config/sgiConfig");

const SgiController = {
  getItems: (req, res) => {
    const { section } = req.params;
    try {
      const items = SgiModel.getAll(section);
      res.status(200).json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener items de SGI." });
    }
  },

  createItem: (req, res) => {
    const { section } = req.params;
    const { name, category, fileUrl } = req.body || {};
    if (!name || !category || !fileUrl) {
      return res.status(400).json({
        message: "Faltan campos obligatorios (nombre, categoría o URL).",
      });
    }

    try {
      const id = SgiModel.create(section, name, category, fileUrl);
      if (id) {
        UniversalCrawler.invalidate();
        res.status(201).json({ message: "Item creado con éxito.", id });
      } else {
        res.status(404).json({
          message: `Categoría "${category}" no encontrada en la página.`,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear item." });
    }
  },

  updateItem: (req, res) => {
    const { section, id } = req.params;
    const { name, category, fileUrl } = req.body || {};

    try {
      const newId = SgiModel.update(section, id, name, category, fileUrl);
      if (newId) {
        UniversalCrawler.invalidate();
        res.status(200).json({ message: "Documento actualizado.", id: newId });
      } else {
        res
          .status(404)
          .json({ message: "No se pudo actualizar el documento." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar." });
    }
  },

  deleteItem: (req, res) => {
    const { section, id } = req.params;
    try {
      const deleted = SgiModel.delete(section, id);
      if (deleted) {
        UniversalCrawler.invalidate();
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
      console.error("[Upload] Error: No req.file found");
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    const section = (req.body && req.body.section) || "planeacion";
    const category = (req.body && req.body.category) || "Varios";
    const baseDir = DATA_CONFIG[section] || DATA_CONFIG["planeacion"];

    // fileUrl relativa desde los HTML en header_menu/sgi/
    const fileUrl = `../../${baseDir}/${category}/${req.file.filename}`;
    console.log(`[Upload Success] section="${section}" category="${category}"`);
    console.log(`[Upload Success] fileUrl="${fileUrl}"`);
    // Invalidar caché del buscador para que el nuevo archivo aparezca de inmediato
    UniversalCrawler.invalidate();
    res.status(200).json({ fileUrl });
  },
};

module.exports = SgiController;
