const model = require("../models/informeGestionModel");
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
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB for reports

const informeGestionController = {
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
      const { title, description } = req.body;
      if (!title) throw new Error("El título es obligatorio");

      const ext = path.extname(req.file.originalname).toLowerCase();
      if (FORBIDDEN_EXTS.includes(ext)) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw new Error("Tipo de archivo prohibido");
      }

      if (req.file.size > MAX_FILE_SIZE) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        throw new Error("El archivo excede el tamaño máximo de 50MB");
      }

      const finalName = `${Date.now()}-${req.file.originalname}`;
      const dest = path.join(model.baseDataDir, finalName);
      fs.renameSync(req.file.path, dest);

      const newItem = model.create({ title, description, filename: finalName });
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      let filename = null;

      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (FORBIDDEN_EXTS.includes(ext)) {
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          throw new Error("Tipo de archivo prohibido");
        }

        filename = `${Date.now()}-${req.file.originalname}`;
        const dest = path.join(model.baseDataDir, filename);
        fs.renameSync(req.file.path, dest);
      }

      const success = model.update(id, { title, description, filename });
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

module.exports = informeGestionController;
