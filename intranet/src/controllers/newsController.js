const NewsModel = require("../models/newsModel");

const NewsController = {
  getAllNews: async (req, res) => {
    try {
      const news = await NewsModel.getAll();
      res.status(200).json(news);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener noticias." });
    }
  },

  createNews: async (req, res) => {
    const { title, description, imageUrl, category } = req.body;
    if (!title || !description || !imageUrl) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    try {
      const id = await NewsModel.create(title, description, imageUrl, category);
      res.status(201).json({ message: "Noticia creada con éxito.", id });
    } catch (error) {
      res.status(500).json({ message: "Error al crear la noticia." });
    }
  },

  deleteNews: async (req, res) => {
    const id = req.params.id;
    try {
      const success = await NewsModel.delete(id);
      if (success) {
        res.status(200).json({ message: "Noticia eliminada." });
      } else {
        res.status(404).json({ message: "Noticia no encontrada." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar la noticia." });
    }
  },

  uploadImage: (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ninguna imagen." });
    }
    const imageUrl = `/data/imagenes/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  },
};

module.exports = NewsController;
