const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "../../data/eventos.json");

const EventosModel = {
  getAll: () => {
    try {
      if (!fs.existsSync(JSON_PATH)) return [];
      return JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
    } catch (e) {
      console.error("Error leyendo eventos.json:", e);
      return [];
    }
  },
  saveAll: (items) => {
    fs.writeFileSync(JSON_PATH, JSON.stringify(items, null, 2), "utf8");
  },
  create: (data) => {
    const items = EventosModel.getAll();
    const newItem = {
      id: Date.now().toString(),
      tipo: data.tipo || "Evento", // 'Evento' | 'Agenda'
      titulo: data.titulo || "",
      fecha: data.fecha || "",
      lugar: data.lugar || "",
      descripcion: data.descripcion || "",
      acento: data.acento || "",
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    EventosModel.saveAll(items);
    return newItem;
  },
  update: (id, data) => {
    const items = EventosModel.getAll();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...data };
    EventosModel.saveAll(items);
    return items[idx];
  },
  delete: (id) => {
    const items = EventosModel.getAll();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    EventosModel.saveAll(filtered);
    return true;
  },
};

module.exports = EventosModel;
