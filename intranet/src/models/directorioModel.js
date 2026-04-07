const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "../../data/directorio.json");

const DirectorioModel = {
  getAll: () => {
    try {
      if (!fs.existsSync(JSON_PATH)) return [];
      return JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
    } catch (e) {
      console.error("Error leyendo directorio.json:", e);
      return [];
    }
  },
  saveAll: (items) => {
    fs.writeFileSync(JSON_PATH, JSON.stringify(items, null, 2), "utf8");
  },
  create: (data) => {
    const items = DirectorioModel.getAll();
    const newItem = {
      id: Date.now().toString(),
      nombre: data.nombre || "",
      cargo: data.cargo || "",
      dependencia: data.dependencia || "",
      correo: data.correo || "",
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    DirectorioModel.saveAll(items);
    return newItem;
  },
  update: (id, data) => {
    const items = DirectorioModel.getAll();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data };
    DirectorioModel.saveAll(items);
    return items[idx];
  },
  delete: (id) => {
    const items = DirectorioModel.getAll();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    DirectorioModel.saveAll(filtered);
    return true;
  },
};

module.exports = DirectorioModel;
