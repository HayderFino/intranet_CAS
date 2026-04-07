const fs = require("fs");
const path = require("path");

const CITA_HTML_PATH = path.join(
  __dirname,
  "../../header_menu/git/manuales_usuario/cita.html",
);

const CitaModel = {
  getAll: () => {
    if (!fs.existsSync(CITA_HTML_PATH)) return [];
    const content = fs.readFileSync(CITA_HTML_PATH, "utf8");
    const items = [];

    // Regex to match sections and their contents
    const sectionRegex =
      /<section class="category-section">[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<div class="pdf-grid"([^>]*)>([\s\S]*?)<\/div>\s*<\/section>/g;

    let sectionMatch;
    while ((sectionMatch = sectionRegex.exec(content)) !== null) {
      const categoryHtml = sectionMatch[1].trim();
      // Remove SVG and clean up category name
      const categoryName = categoryHtml
        .replace(/<svg[\s\S]*?<\/svg>/, "")
        .replace(/&Iacute;/g, "Í")
        .replace(/&Aacute;/g, "Á")
        .trim();
      const gridContent = sectionMatch[3];

      const cardRegex =
        /<a [^>]*class="pdf-folder-card"[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
      let cardMatch;
      while ((cardMatch = cardRegex.exec(gridContent)) !== null) {
        const id = cardMatch[1];
        const outer = cardMatch[0];
        const inner = cardMatch[2];
        const nameMatch = /<h4>([\s\S]*?)<\/h4>/.exec(inner);
        const hrefMatch = /href="([^"]*)"/.exec(outer);
        const sizeMatch = /data-size="([^"]*)"/.exec(outer);
        const typeMatch = /data-type="([^"]*)"/.exec(outer);

        items.push({
          id: id,
          name: nameMatch
            ? nameMatch[1]
                .replace(/&iacute;/g, "í")
                .replace(/&aacute;/g, "á")
                .replace(/&uacute;/g, "ú")
                .trim()
            : "Sin nombre",
          category: categoryName,
          href: hrefMatch ? hrefMatch[1] : "#",
          size: sizeMatch ? sizeMatch[1] : "N/A",
          type: typeMatch ? typeMatch[1] : "PDF",
        });
      }
    }
    return items;
  },

  create: (data) => {
    if (!fs.existsSync(CITA_HTML_PATH)) return null;
    let content = fs.readFileSync(CITA_HTML_PATH, "utf8");
    const id = Date.now().toString();

    const newItemHtml = `
                    <a href="${data.fileUrl || "#"}" class="pdf-folder-card" data-id="${id}" data-size="${data.size || "N/A"}" data-type="${data.type || "PDF"}">
                        <div class="file-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>
                        <h4>${data.name}</h4>
                        <span class="btn-pdf-download">Descargar ${data.type || "PDF"}</span>
                    </a>`;

    // Map categories from admin to HTML section titles
    const categoryMap = {
      "GUÍAS - LIQUIDACIONES": "GU&Iacute;AS - LIQUIDACIONES",
      "GUÍAS - PERMISOS Y TRÁMITES":
        "GU&Iacute;AS - PERMISOS Y TR&Aacute;MITES",
      "GUÍAS - SANCIONATORIO": "GU&Iacute;AS - SANCIONATORIO",
      "PROCEDIMIENTOS - PERMISOS Y TRÁMITES":
        "PROCEDIMIENTOS - PERMISOS Y TR&Aacute;MITES",
      "PROCEDIMIENTOS - SANCIONATORIOS": "PROCEDIMIENTOS - SANCIONATORIOS",
    };

    const targetCategory = categoryMap[data.category] || data.category;
    const escapedCategory = targetCategory.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const gridRegex = new RegExp(
      `(<h3[^>]*>[\\s\\S]*?${escapedCategory}[\\s\\S]*?<\\/h3>[\\s\\S]*?<div [^>]*class="pdf-grid"[^>]*>)`,
      "i",
    );

    if (gridRegex.test(content)) {
      content = content.replace(gridRegex, (match) => match + newItemHtml);
      fs.writeFileSync(CITA_HTML_PATH, content, "utf8");
      return id;
    }
    return null;
  },

  update: (id, data) => {
    if (!fs.existsSync(CITA_HTML_PATH)) return false;
    let content = fs.readFileSync(CITA_HTML_PATH, "utf8");

    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cardRegex = new RegExp(
      `<a [^>]*class="pdf-folder-card"[^>]*data-id="${escapedId}"[^>]*>[\\s\\S]*?<\\/a>`,
      "g",
    );
    const match = cardRegex.exec(content);

    if (match) {
      const oldCardHtml = match[0];
      const name = data.name || "Sin nombre";
      const fileUrl = data.fileUrl || "#";
      const size = data.size || "N/A";
      const type = data.type || "PDF";

      const newCardHtml = `
                    <a href="${fileUrl}" class="pdf-folder-card" data-id="${id}" data-size="${size}" data-type="${type}">
                        <div class="file-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>
                        <h4>${name}</h4>
                        <span class="btn-pdf-download">Descargar ${type}</span>
                    </a>`;

      content = content.replace(oldCardHtml, newCardHtml);
      fs.writeFileSync(CITA_HTML_PATH, content, "utf8");
      return true;
    }
    return false;
  },

  delete: (id) => {
    if (!fs.existsSync(CITA_HTML_PATH)) return false;
    let content = fs.readFileSync(CITA_HTML_PATH, "utf8");

    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cardRegex = new RegExp(
      `<a [^>]*class="pdf-folder-card"[^>]*data-id="${escapedId}"[^>]*>[\\s\\S]*?<\\/a>`,
      "g",
    );
    const match = cardRegex.exec(content);

    if (match) {
      const cardHtml = match[0];
      const hrefMatch = /href="([^"]*)"/.exec(cardHtml);

      if (
        hrefMatch &&
        hrefMatch[1] &&
        hrefMatch[1] !== "#" &&
        !hrefMatch[1].startsWith("http")
      ) {
        let relativePath = hrefMatch[1];
        relativePath = relativePath.split("?")[0];
        const absolutePath = path.resolve(
          path.dirname(CITA_HTML_PATH),
          relativePath,
        );
        try {
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        } catch (e) {
          console.error(e);
        }
      }

      content = content.replace(cardHtml, "");
      fs.writeFileSync(CITA_HTML_PATH, content, "utf8");
      return true;
    }
    return false;
  },
};

module.exports = CitaModel;
