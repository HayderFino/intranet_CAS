const BannerModel = require("../models/bannerModel");

const BannerController = {
  getAllBanners: (req, res) => {
    try {
      const banners = BannerModel.getAll();
      banners.sort((a, b) => (a.order || 0) - (b.order || 0));
      res.status(200).json(banners);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener banners." });
    }
  },

  createBanner: (req, res) => {
    try {
      const banner = BannerModel.create(req.body);
      res.status(201).json(banner);
    } catch (error) {
      res.status(500).json({ message: "Error al crear banner." });
    }
  },

  updateBanner: (req, res) => {
    try {
      const banner = BannerModel.update(req.params.id, req.body);
      if (banner) {
        res.status(200).json(banner);
      } else {
        res.status(404).json({ message: "Banner no encontrado." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar banner." });
    }
  },

  deleteBanner: (req, res) => {
    try {
      const success = BannerModel.delete(req.params.id);
      if (success) {
        res.status(200).json({ message: "Banner eliminado." });
      } else {
        res.status(404).json({ message: "Banner no encontrado." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar banner." });
    }
  },

  uploadFiles: (req, res) => {
    const files = req.files;
    const responseData = {};

    if (files && files.image) {
      responseData.imageUrl = `/data/menu header/index/imagenes-banner/${files.image[0].filename}`;
    }

    if (files && files.file) {
      responseData.fileUrl = `/data/menu header/index/archivos banner/${files.file[0].filename}`;
    }

    if (Object.keys(responseData).length === 0) {
      return res.status(400).json({ message: "No se subieron archivos." });
    }

    res.status(200).json(responseData);
  },
};

module.exports = BannerController;
