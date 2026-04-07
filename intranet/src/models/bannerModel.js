const fs = require("fs");
const path = require("path");

const BANNER_JSON_PATH = path.join(__dirname, "../../data/banner.json");
// Raíz del proyecto (dos niveles arriba de src/models)
const ROOT = path.join(__dirname, "../../");

function deleteFileIfExists(relativeUrl) {
  if (!relativeUrl) return;
  // Las URLs llegan como "/data/menu header/index/..."
  const absPath = path.join(ROOT, relativeUrl.replace(/^\//, ""));
  try {
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
      console.log(`🗑️  Archivo eliminado: ${absPath}`);
    }
  } catch (err) {
    console.error(`❌ No se pudo eliminar ${absPath}:`, err.message);
  }
}

const BannerModel = {
  getAll: () => {
    try {
      if (!fs.existsSync(BANNER_JSON_PATH)) return [];
      return JSON.parse(fs.readFileSync(BANNER_JSON_PATH, "utf8"));
    } catch (error) {
      console.error("Error al leer banner.json:", error);
      return [];
    }
  },

  saveAll: (banners) => {
    try {
      fs.writeFileSync(
        BANNER_JSON_PATH,
        JSON.stringify(banners, null, 2),
        "utf8",
      );
      return true;
    } catch (error) {
      console.error("Error al guardar banner.json:", error);
      return false;
    }
  },

  create: (data) => {
    const banners = BannerModel.getAll();
    const newBanner = {
      id: Date.now().toString(),
      title: data.title || "",
      description: data.description || "",
      imageUrl: data.imageUrl || "",
      fileUrl: data.fileUrl || "", // ← incluir desde creación
      link: data.link || "",
      order: data.order || banners.length,
      createdAt: new Date().toISOString(),
    };
    banners.push(newBanner);
    BannerModel.saveAll(banners);
    return newBanner;
  },

  update: (id, data) => {
    const banners = BannerModel.getAll();
    const index = banners.findIndex((b) => b.id === id);
    if (index !== -1) {
      banners[index] = { ...banners[index], ...data };
      BannerModel.saveAll(banners);
      return banners[index];
    }
    return null;
  },

  delete: (id) => {
    const banners = BannerModel.getAll();
    const banner = banners.find((b) => b.id === id);
    if (!banner) return false;

    // Eliminar imagen de la carpeta
    deleteFileIfExists(banner.imageUrl);

    // Eliminar archivo asociado (PDF u otro documento)
    deleteFileIfExists(banner.fileUrl);

    const filtered = banners.filter((b) => b.id !== id);
    BannerModel.saveAll(filtered);
    return true;
  },
};

module.exports = BannerModel;
