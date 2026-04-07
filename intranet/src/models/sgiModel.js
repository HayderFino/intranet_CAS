const fs = require("fs");
const path = require("path");

// Mapa completo de TODAS las secciones SGI (header_menu/sgi/)
const CONFIG = {
  planeacion: {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/planeacion-estrategica.html",
    ),
  },
  mejora: {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/mejora-continua.html",
    ),
  },
  "admin-recursos": {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/admin-recursos.html"),
  },
  "planeacion-ambiental": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/planeacion-ambiental.html",
    ),
  },
  "vigilancia-control": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/vigilancia-control.html",
    ),
  },
  "control-interno": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/control-interno.html",
    ),
  },
  documentos: {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/documentos.html"),
  },
  "talento-humano": {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/talento-humano.html"),
  },
  "gestion-documental": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/gestion-documental.html",
    ),
  },
  "gestion-financiera": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/gestion-financiera.html",
    ),
  },
  "gestion-tecnologias": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/gestion-tecnologias.html",
    ),
  },
  juridico: {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/juridico.html"),
  },
  contratacion: {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/contratacion.html"),
  },
  "gestion-integral": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/gestion-integral.html",
    ),
  },
  "mejora-continua": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/mejora-continua.html",
    ),
  },
  "procesos-estrategicos": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/procesos-estrategicos.html",
    ),
  },
  "procesos-misionales": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/procesos-misionales.html",
    ),
  },
  "procesos-apoyo": {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/procesos-apoyo.html"),
  },
  "control-disciplinario": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/control-disciplinario.html",
    ),
  },
  "cobro-coactivo": {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/cobro-coactivo.html"),
  },
  "bienes-servicios": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/bienes-servicios.html",
    ),
  },
  "objetivos-calidad": {
    htmlPath: path.join(
      __dirname,
      "../../header_menu/sgi/objetivos-calidad.html",
    ),
  },
  politicas: {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/politicas.html"),
  },
  manuales: {
    htmlPath: path.join(__dirname, "../../header_menu/sgi/manuales.html"),
  },
};

// Nombres legibles para el tipo en búsqueda
const SECTION_LABELS = {
  planeacion: "SGI - Planeación Estratégica",
  mejora: "SGI - Mejora Continua",
  "mejora-continua": "SGI - Mejora Continua",
  "admin-recursos": "SGI - Administración de Recursos",
  "planeacion-ambiental": "SGI - Planeación Ambiental",
  "vigilancia-control": "SGI - Vigilancia y Control",
  "control-interno": "SGI - Control Interno",
  documentos: "Documento Institucional",
  "talento-humano": "SGI - Talento Humano",
  "gestion-documental": "SGI - Gestión Documental",
  "gestion-financiera": "SGI - Gestión Financiera",
  "gestion-tecnologias": "SGI - Gestión de Tecnologías",
  juridico: "SGI - Jurídico",
  contratacion: "SGI - Contratación",
  "gestion-integral": "SGI - Gestión Integral",
  "procesos-estrategicos": "SGI - Procesos Estratégicos",
  "procesos-misionales": "SGI - Procesos Misionales",
  "procesos-apoyo": "SGI - Procesos de Apoyo",
  "control-disciplinario": "SGI - Control Disciplinario",
  "cobro-coactivo": "SGI - Cobro Coactivo",
  "bienes-servicios": "SGI - Bienes y Servicios",
  "objetivos-calidad": "SGI - Objetivos de Calidad",
  politicas: "SGI - Políticas",
  manuales: "SGI - Manuales",
};

const SgiModel = {
  /**
   * Devuelve todos los items de file-items de un HTML de sección SGI.
   * Funciona con items que tengan o NO tengan data-id (legacy).
   */
  getAll: (section) => {
    const config = CONFIG[section];
    if (!config || !fs.existsSync(config.htmlPath)) return [];

    let content;
    try {
      content = fs.readFileSync(config.htmlPath, "utf8");
    } catch (e) {
      console.error(
        `SgiModel.getAll: cannot read ${config.htmlPath}`,
        e.message,
      );
      return [];
    }

    const items = [];

    // Capturar bloques de categoría
    const categoryRegex =
      /<section class="category-section"[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<div class="file-list-grid">([\s\S]*?)<\/div>\s*<\/section>/g;
    let catMatch;

    while ((catMatch = categoryRegex.exec(content)) !== null) {
      const rawCategory = catMatch[1]
        .trim()
        // Limpiar entidades HTML básicas
        .replace(/&oacute;/g, "ó")
        .replace(/&aacute;/g, "á")
        .replace(/&eacute;/g, "é")
        .replace(/&iacute;/g, "í")
        .replace(/&uacute;/g, "ú")
        .replace(/&ntilde;/g, "ñ")
        .replace(/&[a-z]+;/g, "");

      const gridContent = catMatch[2];

      // Capturar cualquier <a class="file-item"> con o sin data-id
      const itemRegex = /<a [^>]*class="file-item"[^>]*>([\s\S]*?)<\/a>/g;
      let itemMatch;

      while ((itemMatch = itemRegex.exec(gridContent)) !== null) {
        const fullTag = itemMatch[0];
        const innerHtml = itemMatch[1];

        const idMatch = /data-id="([^"]*)"/.exec(fullTag);
        const hrefMatch = /href="([^"]*)"/.exec(fullTag);
        const nameMatch = /<div class="file-name">([\s\S]*?)<\/div>/.exec(
          innerHtml,
        );

        let fileUrl = hrefMatch ? hrefMatch[1] : "#";

        // Normalizar rutas relativas a absolutas desde la raíz del servidor
        if (fileUrl.startsWith("../../")) {
          fileUrl = "/" + fileUrl.replace("../../", "");
        } else if (
          fileUrl !== "#" &&
          !fileUrl.startsWith("/") &&
          !fileUrl.startsWith("http")
        ) {
          // Calcular ruta base del HTML para resolver relativas simples
          const htmlDir = path.dirname(config.htmlPath);
          const resolved = path.resolve(htmlDir, fileUrl);
          // Convertir a URL relativa al servidor (desde /intranet/)
          fileUrl = resolved
            .replace(/\\/g, "/")
            .replace(/^.*\/header_menu\//, "/header_menu/")
            .replace(/^.*\/data\//, "/data/");
        }

        const cleanName = nameMatch
          ? nameMatch[1]
              .trim()
              .replace(/&oacute;/g, "ó")
              .replace(/&aacute;/g, "á")
              .replace(/&eacute;/g, "é")
              .replace(/&iacute;/g, "í")
              .replace(/&uacute;/g, "ú")
              .replace(/&ntilde;/g, "ñ")
              .replace(/&[a-z]+;/g, "")
          : "Sin nombre";

        items.push({
          id: idMatch ? idMatch[1] : `legacy-${fileUrl.split("/").pop()}`,
          href: fileUrl,
          fileUrl: fileUrl,
          name: cleanName,
          category: rawCategory,
        });
      }
    }

    return items;
  },

  /**
   * Devuelve TODOS los items de TODAS las secciones.
   * Útil para búsqueda global.
   */
  getAllSections: () => {
    const allItems = [];
    for (const section of Object.keys(CONFIG)) {
      try {
        const items = SgiModel.getAll(section);
        items.forEach((item) => {
          allItems.push({
            ...item,
            section,
            sectionLabel: SECTION_LABELS[section] || "SGI",
          });
        });
      } catch (e) {
        console.error(
          `SgiModel.getAllSections error in ${section}:`,
          e.message,
        );
      }
    }
    return allItems;
  },

  getSectionLabel: (section) => SECTION_LABELS[section] || "SGI",

  getSections: () => Object.keys(CONFIG),

  create: (section, name, category, fileUrl, existingId = null) => {
    const config = CONFIG[section];
    const id = existingId || Date.now().toString();
    if (!config || !fs.existsSync(config.htmlPath)) return null;

    let content = fs.readFileSync(config.htmlPath, "utf8");

    let meta = "PDF - Documento";
    const lc = category.toLowerCase();
    if (lc.includes("procedimiento")) meta = "PDF - Procedimiento";
    else if (lc.includes("formato")) meta = "PDF - Formato";
    else if (lc.includes("instructivo")) meta = "PDF - Instructivo";
    else if (lc.includes("riesgo") || lc.includes("matriz"))
      meta = "PDF - Matriz de Riesgos";
    else if (lc.includes("anexo") || lc.includes("guía")) meta = "PDF - Anexo";
    else if (lc.includes("membrete") || lc.includes("papelería"))
      meta = "Word - Institucional";
    else if (lc.includes("caracterización")) meta = "PDF - Caracterización";
    else if (lc.includes("manual")) meta = "PDF - Manual";

    const newItemHtml = `
                    <a href="${fileUrl}" target="_blank" class="file-item" data-id="${id}">
                        <div class="icon"><svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg></div>
                        <div>
                            <div class="file-name">${name}</div>
                            <div class="file-meta">${meta}</div>
                        </div>
                    </a>`;

    // Intentar mapear nombres limpios a entidades HTML para encontrar la categoría en el HTML
    const fixForHtml = (str) =>
      str
        .replace(/ó/g, "&oacute;")
        .replace(/á/g, "&aacute;")
        .replace(/é/g, "&eacute;")
        .replace(/í/g, "&iacute;")
        .replace(/ú/g, "&uacute;")
        .replace(/ñ/g, "&ntilde;");

    const searchCategory = fixForHtml(category);
    const escapedCategory = searchCategory.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const catRegex = new RegExp(
      `(<h3[^>]*>${escapedCategory}<\\/h3>[\\s\\S]*?<div [^>]*class="file-list-grid"[^>]*>)`,
      "i",
    );

    if (catRegex.test(content)) {
      content = content.replace(catRegex, (match) => match + newItemHtml);
      fs.writeFileSync(config.htmlPath, content, "utf8");
      return id;
    } else {
      // Intentar también sin entidades
      const rawEscaped = category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rawCatRegex = new RegExp(
        `(<h3[^>]*>${rawEscaped}<\\/h3>[\\s\\S]*?<div [^>]*class="file-list-grid"[^>]*>)`,
        "i",
      );
      if (rawCatRegex.test(content)) {
        content = content.replace(rawCatRegex, (match) => match + newItemHtml);
        fs.writeFileSync(config.htmlPath, content, "utf8");
        return id;
      }
      console.error(`Categoría no encontrada en HTML: ${category}`);
      return null;
    }
  },

  delete: (section, id, deletePhysical = true) => {
    const config = CONFIG[section];
    if (!config || !fs.existsSync(config.htmlPath)) return false;

    let content = fs.readFileSync(config.htmlPath, "utf8");
    const itemRegex = new RegExp(
      `<a [^>]*class="file-item"[^>]*data-id="${id}"[^>]*>[\\s\\S]*?<\\/a>`,
      "g",
    );
    const match = itemRegex.exec(content);

    if (match) {
      const itemHtml = match[0];
      if (deletePhysical) {
        const hrefMatch = /href="([^"]*)"/.exec(itemHtml);
        if (hrefMatch && hrefMatch[1] && hrefMatch[1] !== "#") {
          const relativePath = hrefMatch[1];
          const absolutePath = path.resolve(
            path.dirname(config.htmlPath),
            relativePath,
          );
          try {
            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
          } catch (err) {
            console.error(`Error al eliminar archivo físico: ${err.message}`);
          }
        }
      }
      content = content.replace(itemRegex, "");
      fs.writeFileSync(config.htmlPath, content, "utf8");
      return true;
    }
    return false;
  },

  update: (section, id, name, category, fileUrl) => {
    const items = SgiModel.getAll(section);
    const currentItem = items.find((i) => i.id === id);
    const shouldDeletePhysical =
      currentItem &&
      currentItem.fileUrl !== fileUrl &&
      currentItem.fileUrl !== "#";
    const deleted = SgiModel.delete(section, id, shouldDeletePhysical);
    if (deleted) {
      return SgiModel.create(section, name, category, fileUrl, id);
    }
    return null;
  },
};

module.exports = SgiModel;
