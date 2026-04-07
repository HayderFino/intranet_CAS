const fs = require("fs");
const path = require("path");

// HTML del módulo SNIF (página pública que muestra los archivos)
const HTML_PATH = path.join(
  __dirname,
  "../../header_menu/git/manuales_usuario/snif.html",
);

// Carpeta física donde se almacenan los archivos SNIF
const SNIF_DATA_DIR = path.join(
  __dirname,
  "../../data/menu header/git/manuales de usuario/Snif",
);

const SnifModel = {
  /**
   * Obtiene todos los elementos de la cuadrícula de documentación del SNIF.
   * Lee directamente el HTML y extrae los datos de cada tarjeta.
   */
  getAll: () => {
    if (!fs.existsSync(HTML_PATH)) return [];
    const content = fs.readFileSync(HTML_PATH, "utf8");
    const items = [];

    // Buscamos el contenido dentro del div con id="snif-docs-grid"
    const gridIdAttr = `id="snif-docs-grid"`;
    let startIndex = content.indexOf(gridIdAttr);

    if (startIndex !== -1) {
      startIndex = content.indexOf(">", startIndex) + 1;
      // Buscamos el cierre de la sección
      let nextSection = content.indexOf("</section", startIndex);
      if (nextSection === -1)
        nextSection = content.indexOf("</main>", startIndex);
      if (nextSection === -1) nextSection = content.length;

      const gridContent = content.substring(startIndex, nextSection);
      const cardRegex = /<a [^>]*class="pdf-folder-card"[^>]*>([\s\S]*?)<\/a>/g;
      let cardMatch;

      while ((cardMatch = cardRegex.exec(gridContent)) !== null) {
        const outer = cardMatch[0];
        const inner = cardMatch[1];

        const idMatch = /data-id="([^"]*)"/.exec(outer);
        const nameMatch = /<h4>([\s\S]*?)<\/h4>/.exec(inner);
        const hrefMatch = /href="([^"]*)"/.exec(outer);
        const sizeMatch = /data-size="([^"]*)"/.exec(outer);
        const typeMatch = /data-type="([^"]*)"/.exec(outer);

        if (idMatch) {
          items.push({
            id: idMatch[1],
            name: nameMatch
              ? nameMatch[1]
                  .replace(/&iacute;/g, "í")
                  .replace(/&aacute;/g, "á")
                  .replace(/&uacute;/g, "ú")
                  .replace(/&oacute;/g, "ó")
                  .replace(/&eacute;/g, "é")
                  .replace(/&Aacute;/g, "Á")
                  .replace(/&Eacute;/g, "É")
                  .replace(/&Iacute;/g, "Í")
                  .replace(/&Oacute;/g, "Ó")
                  .replace(/&Uacute;/g, "Ú")
                  .replace(/&ntilde;/g, "ñ")
                  .replace(/&Ntilde;/g, "Ñ")
                  .trim()
              : "Sin nombre",
            category: "Documentación y Formatos",
            href: hrefMatch ? hrefMatch[1] : "#",
            size: sizeMatch ? sizeMatch[1] : "N/A",
            type: typeMatch ? typeMatch[1] : "PDF",
          });
        }
      }
    }

    return items;
  },

  /**
   * Crea una nueva tarjeta de archivo en el HTML del SNIF.
   */
  create: (data) => {
    if (!fs.existsSync(HTML_PATH)) return null;
    let content = fs.readFileSync(HTML_PATH, "utf8");
    const id = Date.now().toString();

    const newItemHtml = `
                    <a href="${data.fileUrl || "#"}" class="pdf-folder-card" data-id="${id}" data-size="${data.size || "N/A"}" data-type="${data.type || "PDF"}">
                        <div class="file-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>
                        <h4>${data.name}</h4>
                        <span class="btn-pdf-download">Descargar ${data.type || "PDF"}</span>
                    </a>`;

    // Insertamos dentro del div con id="snif-docs-grid"
    const gridRegex = /(<div [^>]*id="snif-docs-grid"[^>]*>)/i;

    if (gridRegex.test(content)) {
      content = content.replace(gridRegex, (match) => match + newItemHtml);
      fs.writeFileSync(HTML_PATH, content, "utf8");
      return id;
    }
    return null;
  },

  /**
   * Actualiza el nombre y/o archivo de una tarjeta existente.
   */
  update: (id, data) => {
    if (!fs.existsSync(HTML_PATH)) return false;
    let content = fs.readFileSync(HTML_PATH, "utf8");

    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cardRegex = new RegExp(
      `<a [^>]*data-id="${escapedId}"[^>]*>[\\s\\S]*?<\\/a>`,
      "g",
    );
    const match = cardRegex.exec(content);

    if (match) {
      const oldCardHtml = match[0];

      // Si no hay nuevo archivo, conservamos el href y atributos actuales
      const oldHrefMatch = /href="([^"]*)"/.exec(oldCardHtml);
      const oldSizeMatch = /data-size="([^"]*)"/.exec(oldCardHtml);
      const oldTypeMatch = /data-type="([^"]*)"/.exec(oldCardHtml);

      const name = data.name || "Sin nombre";
      const fileUrl = data.fileUrl || (oldHrefMatch ? oldHrefMatch[1] : "#");
      const size = data.size || (oldSizeMatch ? oldSizeMatch[1] : "N/A");
      const type = data.type || (oldTypeMatch ? oldTypeMatch[1] : "PDF");

      const newCardHtml = `
                    <a href="${fileUrl}" class="pdf-folder-card" data-id="${id}" data-size="${size}" data-type="${type}">
                        <div class="file-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg></div>
                        <h4>${name}</h4>
                        <span class="btn-pdf-download">Descargar ${type}</span>
                    </a>`;

      content = content.replace(oldCardHtml, newCardHtml);
      fs.writeFileSync(HTML_PATH, content, "utf8");
      return true;
    }
    return false;
  },

  /**
   * Elimina una tarjeta del HTML y, si aplica, el archivo físico asociado.
   */
  delete: (id) => {
    if (!fs.existsSync(HTML_PATH)) return false;
    let content = fs.readFileSync(HTML_PATH, "utf8");

    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cardRegex = new RegExp(
      `<a [^>]*data-id="${escapedId}"[^>]*>[\\s\\S]*?<\\/a>`,
      "g",
    );
    const match = cardRegex.exec(content);

    if (match) {
      const cardHtml = match[0];
      const hrefMatch = /href="([^"]*)"/.exec(cardHtml);

      // Intentamos eliminar el archivo físico si la ruta no es externa
      if (
        hrefMatch &&
        hrefMatch[1] &&
        hrefMatch[1] !== "#" &&
        !hrefMatch[1].startsWith("http")
      ) {
        let relativePath = hrefMatch[1].split("?")[0];
        const absolutePath = path.resolve(
          path.dirname(HTML_PATH),
          relativePath,
        );
        try {
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        } catch (e) {
          console.error("No se pudo eliminar el archivo físico:", e.message);
        }
      }

      content = content.replace(cardHtml, "");
      fs.writeFileSync(HTML_PATH, content, "utf8");
      return true;
    }
    return false;
  },
};

module.exports = SnifModel;
