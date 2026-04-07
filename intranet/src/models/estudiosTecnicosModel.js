const fs = require("fs");
const path = require("path");

class EstudiosTecnicosModel {
  constructor() {
    this.htmlPath = path.join(
      __dirname,
      "../../header_menu/cas/estudios-tecnicos.html",
    );
    // Usamos la ruta física exacta solicitada
    this.baseDataDir = path.join(
      __dirname,
      "../../data/menu header/la cas/talento humano/Estudios Tecnicos",
    );

    if (!fs.existsSync(this.baseDataDir)) {
      fs.mkdirSync(this.baseDataDir, { recursive: true });
    }
  }

  getAll() {
    if (!fs.existsSync(this.htmlPath)) return [];
    const content = fs.readFileSync(this.htmlPath, "utf8");

    // Regex robusto para capturar cada tarjeta de estudio técnico
    const itemRegex =
      /<div class="doc-item"[^>]*?data-id="([^"]*)"[^>]*?>([\s\S]*?)<\/a>\s*<\/div>/gi;

    const items = [];
    let match;

    while ((match = itemRegex.exec(content)) !== null) {
      const id = match[1];
      const inner = match[2];

      const typeMatch = /class="doc-type">([\s\S]*?)<\/span>/i.exec(inner);
      const dateMatch = /class="doc-date">([\s\S]*?)<\/span>/i.exec(inner);
      const titleMatch = /class="doc-title">([\s\S]*?)<\/div>/i.exec(inner);
      const descMatch = /class="doc-description">([\s\S]*?)<\/div>/i.exec(
        inner,
      );
      const hrefMatch = /href="([^"]*)"/i.exec(inner);

      items.push({
        id,
        type: typeMatch ? this._decodeHTML(typeMatch[1].trim()) : "",
        date: dateMatch ? this._decodeHTML(dateMatch[1].trim()) : "",
        title: titleMatch
          ? this._decodeHTML(titleMatch[1].trim())
          : "Sin título",
        description: descMatch ? this._decodeHTML(descMatch[1].trim()) : "",
        href: hrefMatch ? hrefMatch[1] : "#",
      });
    }

    return items;
  }

  create(item) {
    if (!fs.existsSync(this.htmlPath)) return null;
    let content = fs.readFileSync(this.htmlPath, "utf8");

    const newId = `est_${Date.now()}`;
    const relativePath = `../../data/menu header/la cas/talento humano/Estudios Tecnicos/${item.filename}`;

    const itemHtml = `
                <div class="doc-item" data-id="${newId}">
                    <div class="doc-header">
                        <span class="doc-type">${item.type || "ESTUDIO T&Eacute;CNICO"}</span>
                        <span class="doc-date">${item.date || new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="doc-title">${item.title}</div>
                    <div class="doc-description">${item.description || ""}</div>
                    <a href="${relativePath}" class="btn-download">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4.5 9h5v7h5V9h5L12 2zm10 18H2v2h20v-2z" />
                        </svg>
                        Descargar Documento (PDF)
                    </a>
                </div>`;

    const gridTrigger = 'id="estudios-tecnicos-grid"';
    const index = content.indexOf(gridTrigger);
    if (index !== -1) {
      const insertIndex = content.indexOf(">", index) + 1;
      content =
        content.substring(0, insertIndex) +
        "\n" +
        itemHtml +
        content.substring(insertIndex);
      fs.writeFileSync(this.htmlPath, content, "utf8");
      return { ...item, id: newId, href: relativePath };
    }
    return null;
  }

  update(id, newData) {
    if (!fs.existsSync(this.htmlPath)) return false;
    let content = fs.readFileSync(this.htmlPath, "utf8");

    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const itemRegex = new RegExp(
      `<div class="doc-item"[^>]*?data-id="${escapedId}"[\\s\\S]*?<\\/a>\\s*<\\/div>`,
      "i",
    );
    const match = itemRegex.exec(content);

    if (match) {
      const oldHtml = match[0];
      const type =
        newData.type ||
        /class="doc-type">([\s\S]*?)<\/span>/i.exec(oldHtml)?.[1] ||
        "ESTUDIO T&Eacute;CNICO";
      const date =
        newData.date ||
        /class="doc-date">([\s\S]*?)<\/span>/i.exec(oldHtml)?.[1] ||
        "";
      const title =
        newData.title ||
        /class="doc-title">([\s\S]*?)<\/div>/i.exec(oldHtml)?.[1] ||
        "";
      const description =
        newData.description ||
        /class="doc-description">([\s\S]*?)<\/div>/i.exec(oldHtml)?.[1] ||
        "";
      const href = newData.filename
        ? `../../data/menu header/la cas/talento humano/Estudios Tecnicos/${newData.filename}`
        : /href="([^"]*)"/i.exec(oldHtml)?.[1] || "#";

      const newHtml = `
                <div class="doc-item" data-id="${id}">
                    <div class="doc-header">
                        <span class="doc-type">${type}</span>
                        <span class="doc-date">${date}</span>
                    </div>
                    <div class="doc-title">${title}</div>
                    <div class="doc-description">${description}</div>
                    <a href="${href}" class="btn-download">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4.5 9h5v7h5V9h5L12 2zm10 18H2v2h20v-2z" />
                        </svg>
                        Descargar Documento (PDF)
                    </a>
                </div>`;

      content = content.replace(oldHtml, newHtml);
      fs.writeFileSync(this.htmlPath, content, "utf8");
      return true;
    }
    return false;
  }

  delete(id) {
    if (!fs.existsSync(this.htmlPath)) return false;
    let content = fs.readFileSync(this.htmlPath, "utf8");

    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const itemRegex = new RegExp(
      `<div class="doc-item"[^>]*?data-id="${escapedId}"[\\s\\S]*?<\\/a>\\s*<\\/div>`,
      "i",
    );
    const match = itemRegex.exec(content);

    if (match) {
      const itemHtml = match[0];
      const hrefMatch = /href="([^"]*)"/i.exec(itemHtml);

      if (
        hrefMatch &&
        hrefMatch[1] &&
        hrefMatch[1] !== "#" &&
        !hrefMatch[1].startsWith("http")
      ) {
        const relativePath = decodeURIComponent(
          hrefMatch[1].split("?")[0],
        ).trim();
        const absolutePath = path.resolve(
          path.dirname(this.htmlPath),
          relativePath,
        );
        try {
          if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
        } catch (e) {
          console.error("Error delete file:", e.message);
        }
      }

      content = content.replace(itemHtml, "");
      fs.writeFileSync(this.htmlPath, content, "utf8");
      return true;
    }
    return false;
  }

  _decodeHTML(html) {
    return html
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
      .replace(/&iquest;/g, "¿")
      .replace(/&ndash;/g, "-");
  }
}

module.exports = new EstudiosTecnicosModel();
