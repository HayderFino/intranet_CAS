const SnifModel = require("../models/snifModel");
const path = require("path");
const fs = require("fs");

// Extensiones prohibidas por seguridad
const FORBIDDEN_EXTS = [
  ".exe",
  ".bat",
  ".cmd",
  ".vbs",
  ".sh",
  ".ps1",
  ".msi",
  ".com",
];

// Tamaño máximo por archivo: 20 MB
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

// Carpeta destino (ya existente, no se crea desde el frontend)
const RELATIVE_DEST = "data/menu header/git/manuales de usuario/Snif";

const SnifController = {
  /** GET /api/snif — devuelve el listado de archivos */
  getAll: (req, res) => {
    try {
      const items = SnifModel.getAll();
      res.json(items);
    } catch (error) {
      console.error("[SNIF] getAll error:", error.message);
      res.status(500).json({
        message: "Error al obtener listado SNIF",
        error: error.message,
      });
    }
  },

  /** POST /api/snif — sube un nuevo archivo */
  create: (req, res) => {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ message: "El nombre del archivo es obligatorio." });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Debes seleccionar un archivo para subir." });
      }

      // Validar tamaño
      if (req.file.size > MAX_SIZE_BYTES) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          message: "El archivo supera el tamaño máximo permitido (20 MB).",
        });
      }

      // Validar extensión
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (FORBIDDEN_EXTS.includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ message: `Tipo de archivo no permitido: ${ext}` });
      }

      // Calcular tamaño legible
      let size = (req.file.size / 1024).toFixed(1) + " KB";
      if (req.file.size > 1024 * 1024) {
        size = (req.file.size / (1024 * 1024)).toFixed(1) + " MB";
      }
      const type = ext.replace(".", "").toUpperCase();

      // Mover el archivo a la carpeta SNIF (ya existente)
      const filename = `${Date.now()}-${req.file.originalname}`;
      const destDir = path.join(__dirname, "../../", RELATIVE_DEST);

      // La carpeta debe existir (no se crea desde frontend, regla del módulo)
      if (!fs.existsSync(destDir)) {
        fs.unlinkSync(req.file.path);
        return res.status(500).json({
          message: "La carpeta de destino SNIF no existe en el servidor.",
        });
      }

      const finalPath = path.join(destDir, filename);
      fs.renameSync(req.file.path, finalPath);

      // URL relativa para el HTML público
      const fileUrl = `../../../${RELATIVE_DEST}/${filename}`;

      const id = SnifModel.create({ name: name.trim(), fileUrl, size, type });
      if (id) {
        res.status(201).json({ id, message: "Archivo SNIF creado con éxito." });
      } else {
        res.status(500).json({
          message: "No se pudo insertar el archivo en el HTML del SNIF.",
        });
      }
    } catch (error) {
      console.error("[SNIF] create error:", error.message);
      res.status(500).json({
        message: "Error al crear el archivo SNIF.",
        error: error.message,
      });
    }
  },

  /** PUT /api/snif/:id — actualiza nombre y/o reemplaza archivo */
  update: (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || !name.trim()) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ message: "El nombre del archivo es obligatorio." });
      }

      let updateData = { name: name.trim() };

      if (req.file) {
        // Validar tamaño
        if (req.file.size > MAX_SIZE_BYTES) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            message: "El archivo supera el tamaño máximo permitido (20 MB).",
          });
        }

        // Validar extensión
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (FORBIDDEN_EXTS.includes(ext)) {
          fs.unlinkSync(req.file.path);
          return res
            .status(400)
            .json({ message: `Tipo de archivo no permitido: ${ext}` });
        }

        let size = (req.file.size / 1024).toFixed(1) + " KB";
        if (req.file.size > 1024 * 1024) {
          size = (req.file.size / (1024 * 1024)).toFixed(1) + " MB";
        }
        const type = ext.replace(".", "").toUpperCase();

        const filename = `${Date.now()}-${req.file.originalname}`;
        const destDir = path.join(__dirname, "../../", RELATIVE_DEST);

        if (!fs.existsSync(destDir)) {
          fs.unlinkSync(req.file.path);
          return res.status(500).json({
            message: "La carpeta de destino SNIF no existe en el servidor.",
          });
        }

        const finalPath = path.join(destDir, filename);
        fs.renameSync(req.file.path, finalPath);

        updateData.fileUrl = `../../../${RELATIVE_DEST}/${filename}`;
        updateData.size = size;
        updateData.type = type;
      }

      const success = SnifModel.update(id, updateData);
      if (success) {
        res.json({ message: "Archivo SNIF actualizado con éxito." });
      } else {
        res.status(404).json({ message: "Archivo no encontrado." });
      }
    } catch (error) {
      console.error("[SNIF] update error:", error.message);
      res.status(500).json({
        message: "Error al actualizar el archivo SNIF.",
        error: error.message,
      });
    }
  },

  /** DELETE /api/snif/:id — elimina el archivo y su entrada en el HTML */
  delete: (req, res) => {
    try {
      const { id } = req.params;
      const success = SnifModel.delete(id);
      if (success) {
        res.json({ message: "Archivo SNIF eliminado con éxito." });
      } else {
        res.status(404).json({ message: "Archivo no encontrado." });
      }
    } catch (error) {
      console.error("[SNIF] delete error:", error.message);
      res.status(500).json({
        message: "Error al eliminar el archivo SNIF.",
        error: error.message,
      });
    }
  },
};

module.exports = SnifController;
