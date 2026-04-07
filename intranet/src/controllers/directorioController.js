const DirectorioModel = require("../models/directorioModel");

const DirectorioController = {
  getAll: (req, res) => {
    try {
      const items = DirectorioModel.getAll().sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
      res.status(200).json(items);
    } catch (e) {
      res.status(500).json({ message: "Error al obtener directorio." });
    }
  },
  create: (req, res) => {
    try {
      const item = DirectorioModel.create(req.body);
      res.status(201).json(item);
    } catch (e) {
      res.status(500).json({ message: "Error al crear contacto." });
    }
  },
  update: (req, res) => {
    try {
      const item = DirectorioModel.update(req.params.id, req.body);
      if (!item)
        return res.status(404).json({ message: "Contacto no encontrado." });
      res.status(200).json(item);
    } catch (e) {
      res.status(500).json({ message: "Error al actualizar contacto." });
    }
  },
  delete: (req, res) => {
    try {
      const ok = DirectorioModel.delete(req.params.id);
      if (!ok)
        return res.status(404).json({ message: "Contacto no encontrado." });
      res.status(200).json({ message: "Contacto eliminado." });
    } catch (e) {
      res.status(500).json({ message: "Error al eliminar contacto." });
    }
  },
};

module.exports = DirectorioController;
