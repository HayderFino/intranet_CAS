const News = require("./MongoNews");
const fs = require("fs");
const path = require("path");

const NewsModel = {
  getAll: async () => {
    try {
      const news = await News.find().sort({ createdAt: -1 });
      return news.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        category: item.category,
        createdAt: item.createdAt,
      }));
    } catch (error) {
      console.error("Error reading from MongoDB:", error);
      return [];
    }
  },

  create: async (title, description, imageUrl, category = "General") => {
    try {
      const fixedImageUrl = imageUrl.startsWith("/")
        ? imageUrl
        : "/" + imageUrl;

      const newNews = new News({
        title,
        description,
        imageUrl: fixedImageUrl,
        category,
        createdAt: new Date(),
      });

      const saved = await newNews.save();
      return saved._id.toString();
    } catch (error) {
      console.error("Error writing to MongoDB:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      // 1. Buscar la noticia para obtener la ruta de la imagen
      const newsItem = await News.findById(id);
      if (!newsItem) return false;

      const relativeImageUrl = newsItem.imageUrl; // Ej: /data/imagenes/archivo.jpg

      // 2. Eliminar de MongoDB
      const result = await News.findByIdAndDelete(id);

      // 3. Si se eliminó de la BD, intentar borrar el archivo físico
      if (result && relativeImageUrl && relativeImageUrl.startsWith("/data/")) {
        // Construir ruta absoluta (estamos en src/models, subimos dos niveles)
        const absoluteImagePath = path.join(
          __dirname,
          "..",
          "..",
          relativeImageUrl,
        );

        if (fs.existsSync(absoluteImagePath)) {
          try {
            fs.unlinkSync(absoluteImagePath);
            console.log(`✅ Imagen física eliminada: ${absoluteImagePath}`);
          } catch (err) {
            console.error(
              `❌ No se pudo borrar el archivo físico: ${absoluteImagePath}`,
              err,
            );
          }
        }
      }

      return !!result;
    } catch (error) {
      console.error("Error al eliminar noticia e imagen:", error);
      throw error;
    }
  },
};

module.exports = NewsModel;
