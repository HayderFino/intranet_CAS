const model = require("../models/planesTalentoModel");
const path = require("path");
const fs = require("fs");

const FORBIDDEN_EXTS = [
  ".exe",
  ".bat",
  ".cmd",
  ".js",
  ".sh",
  ".ps1",
  ".vbs",
  ".msi",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB ajustable

const planesTalentoController = {
  getAll: async (req, res) => {
    try {
      const items = model.getAll();
      res.json(items);
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      if (!req.file) throw new Error("No se subió ningún archivo");
      const { name, category } = req.body;
      if (!name || !category)
        throw new Error("Nombre y categoría son obligatorios");

      const ext = path.extname(req.file.originalname).toLowerCase();
      if (FORBIDDEN_EXTS.includes(ext)) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw new Error("Tipo de archivo prohibido");
      }

      if (req.file.size > MAX_FILE_SIZE) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw new Error("El archivo excede el tamaño máximo de 10MB");
      }

      const catDir = path.join(model.baseDataDir, category);
      if (!fs.existsSync(catDir)) {
        fs.mkdirSync(catDir, { recursive: true });
      }

      const finalName = `${Date.now()}-${req.file.originalname}`;
      const dest = path.join(catDir, finalName);
      fs.renameSync(req.file.path, dest);

      const newItem = model.create({ name, filename: finalName, category });
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, category } = req.body;
      let filename = null;

      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (FORBIDDEN_EXTS.includes(ext)) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          throw new Error("Tipo de archivo prohibido");
        }

        const catDir = path.join(model.baseDataDir, category);
        filename = `${Date.now()}-${req.file.originalname}`;
        const dest = path.join(catDir, filename);
        fs.renameSync(req.file.path, dest);
      }

      const success = model.update(id, { name, filename, category });
      if (success)
        res.json({ status: "ok", message: "Actualizado correctamente" });
      else res.status(404).json({ status: "error", message: "No encontrado" });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const success = model.delete(id);
      if (success)
        res.json({ status: "ok", message: "Eliminado correctamente" });
      else res.status(404).json({ status: "error", message: "No encontrado" });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },
};

module.exports = planesTalentoController;
