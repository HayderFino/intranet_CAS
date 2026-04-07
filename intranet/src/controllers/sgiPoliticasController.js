const SgiPoliticasModel = require("../models/sgiPoliticasModel");
const UniversalCrawler = require("../models/universalCrawler");

const SgiPoliticasController = {
  getPoliticas: (req, res) => {
    try {
      res.json({
        items: SgiPoliticasModel.getAll(),
      });
    } catch (e) {
      console.error("Error getPoliticas:", e.message);
      res.status(500).json({ message: "Error al obtener políticas." });
    }
  },

  createPolitica: (req, res) => {
    try {
      const id = SgiPoliticasModel.create(req.body);
      if (id) {
        UniversalCrawler.invalidate();
        res.status(201).json({ message: "Documento creado.", id });
      } else {
        res.status(400).json({ message: "Error al crear el documento." });
      }
    } catch (e) {
      console.error("Error createPolitica:", e.message);
      res.status(500).json({ message: "Error interno." });
    }
  },

  updatePolitica: (req, res) => {
    try {
      const newId = SgiPoliticasModel.update(req.params.id, req.body);
      if (newId) {
        UniversalCrawler.invalidate();
        res.status(200).json({ message: "Documento actualizado.", id: newId });
      } else {
        res.status(404).json({ message: "Documento no encontrado." });
      }
    } catch (e) {
      console.error("Error updatePolitica:", e.message);
      res.status(500).json({ message: "Error interno." });
    }
  },

  deletePolitica: (req, res) => {
    try {
      const ok = SgiPoliticasModel.delete(req.params.id);
      if (ok) {
        UniversalCrawler.invalidate();
        res.status(200).json({ message: "Documento eliminado." });
      } else {
        res
          .status(404)
          .json({ message: "Documento no encontrado o no eliminable." });
      }
    } catch (e) {
      console.error("Error deletePolitica:", e.message);
      res.status(500).json({ message: "Error interno." });
    }
  },

  uploadFile: (req, res) => {
    if (!req.file)
      return res.status(400).json({ message: "No se envió ningún archivo." });
    const fileUrl = `../../data/menu header/sgi/Políticas Institucionales/${req.file.filename}`;
    res.json({ fileUrl });
  },
};

module.exports = SgiPoliticasController;
