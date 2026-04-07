const RevisionRedModel = require("../models/revisionRedModel");
const path = require("path");
const fs = require("fs");

const RevisionRedController = {
  getAll: (req, res) => {
    try {
      const items = RevisionRedModel.getAll();
      res.json(items);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener manuales", error: error.message });
    }
  },

  create: (req, res) => {
    try {
      const { name } = req.body;
      let fileUrl = "#";
      let size = "0 KB";
      let type = "Desconocido";

      if (req.file) {
        const forbidden = [".exe", ".bat", ".cmd", ".js", ".vbs", ".sh"];
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (forbidden.includes(ext)) {
          fs.unlinkSync(req.file.path);
          return res
            .status(400)
            .json({ message: "Tipo de archivo no permitido." });
        }

        size = (req.file.size / 1024).toFixed(1) + " KB";
        if (req.file.size > 1024 * 1024)
          size = (req.file.size / (1024 * 1024)).toFixed(1) + " MB";
        type = ext.replace(".", "").toUpperCase();

        const filename = `${Date.now()}-${req.file.originalname}`;
        // Using the specific folder provided by user
        const relativeDest = `data/menu header/git/manuales de usuario/Revisión de red primer nivel Detalles`;
        const destDir = path.join(__dirname, "../../", relativeDest);

        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        const finalPath = path.join(destDir, filename);
        fs.renameSync(req.file.path, finalPath);
        fileUrl = `../../../${relativeDest}/${filename}`;
      }

      const id = RevisionRedModel.create({ name, fileUrl, size, type });
      res.status(201).json({ id, message: "Archivo creado con éxito" });
    } catch (error) {
      res.status(500).json({ message: "Error al crear", error: error.message });
    }
  },

  update: (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      let updateData = { name };

      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        const forbidden = [".exe", ".bat", ".cmd", ".js"];
        if (forbidden.includes(ext)) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ message: "Archivo prohibido." });
        }

        const size = (req.file.size / 1024).toFixed(1) + " KB";
        const type = ext.replace(".", "").toUpperCase();
        const filename = `${Date.now()}-${req.file.originalname}`;
        const relativeDest = `data/menu header/git/manuales de usuario/Revisión de red primer nivel Detalles`;
        const destDir = path.join(__dirname, "../../", relativeDest);

        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        const finalPath = path.join(destDir, filename);
        fs.renameSync(req.file.path, finalPath);

        updateData.fileUrl = `../../../${relativeDest}/${filename}`;
        updateData.size = size;
        updateData.type = type;
      }

      const success = RevisionRedModel.update(id, updateData);
      if (success) res.json({ message: "Actualizado con éxito" });
      else res.status(404).json({ message: "No encontrado" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al actualizar", error: error.message });
    }
  },

  delete: (req, res) => {
    try {
      const { id } = req.params;
      const success = RevisionRedModel.delete(id);
      if (success) res.json({ message: "Eliminado con éxito" });
      else res.status(404).json({ message: "No encontrado" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al eliminar", error: error.message });
    }
  },
};

module.exports = RevisionRedController;
