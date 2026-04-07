const fs = require("fs");
const path = require("path");

class PlanesTalentoModel {
  constructor() {
    this.htmlPath = path.join(__dirname, "../../header_menu/cas/planes.html");
    this.baseDataDir = path.join(
      __dirname,
      "../../data/menu header/la cas/talento humano/Planes",
    );

    this.categories = {
      "Plan Anual de Vacantes": "vacantes-list",
      "Bienestar e Incentivos": "bienestar-list",
      "Previsión de Recurso Humano": "prevision-list",
      "Plan Estratégico TH": "estrategico-list",
      "Plan de Capacitación (PIC)": "pic-list",
      "Resoluciones - 2026": "resoluciones-list",
    };

    this._ensureFolders();
  }

  _ensureFolders() {
    if (!fs.existsSync(this.baseDataDir)) {
      fs.mkdirSync(this.baseDataDir, { recursive: true });
    }
    Object.keys(this.categories).forEach((cat) => {
      const catPath = path.join(this.baseDataDir, cat);
      if (!fs.existsSync(catPath)) {
        fs.mkdirSync(catPath, { recursive: true });
      }
    });
  }

  getAll() {
    if (!fs.existsSync(this.htmlPath)) return [];

    const content = fs.readFileSync(this.htmlPath, "utf8");
    const items = [];

    Object.entries(this.categories).forEach(([categoryName, listId]) => {
      const listRegex = new RegExp(
        `id="${listId}"[\\s\\S]*?>([\\s\\S]*?)<\\/(?:div|ul)>`,
        "i",
      );
      const listMatch = listRegex.exec(content);

      if (listMatch) {
        const listContent = listMatch[1];
        const itemRegex =
          /<a\s+[^>]*?class="plan-item"[^>]*?>([\s\S]*?)<\/a>/gi;
        let itemMatch;

        while ((itemMatch = itemRegex.exec(listContent)) !== null) {
          const outer = itemMatch[0];
          const inner = itemMatch[1];

          const idMatch = /data-id="([^"]*)"/i.exec(outer);
          const nameMatch = /<\/svg>\s*([\s\S]*?)\s*$/i.exec(inner);
          const hrefMatch = /href="([^"]*)"/i.exec(outer);

          if (idMatch) {
            items.push({
              id: idMatch[1],
              name: this._decodeHTML(
                nameMatch ? nameMatch[1].trim() : "Sin nombre",
              ),
              href: hrefMatch ? hrefMatch[1] : "#",
              category: categoryName,
              type: this._extractType(hrefMatch ? hrefMatch[1] : ""),
            });
          }
        }
      }
    });

    return items;
  }

  create(item) {
    if (!fs.existsSync(this.htmlPath)) return null;
    let content = fs.readFileSync(this.htmlPath, "utf8");

    const newId = `pt_${Date.now()}`;
    const listId = this.categories[item.category];
    if (!listId) return null;

    const relativePath = `../../data/menu header/la cas/talento humano/Planes/${item.category}/${item.filename}`;

    const itemHtml = `
                        <a href="${relativePath}" class="plan-item" data-id="${newId}">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            ${item.name}
                        </a>`;

    const listTag = `id="${listId}"`;
    const index = content.indexOf(listTag);
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
      `<a [^>]*?data-id="${escapedId}"[^>]*?>[\\s\\S]*?<\\/a>`,
      "gi",
    );
    const match = itemRegex.exec(content);

    if (match) {
      const oldHtml = match[0];
      const name = newData.name || "Documento";
      const href = newData.filename
        ? `../../data/menu header/la cas/talento humano/Planes/${newData.category}/${newData.filename}`
        : /href="([^"]*)"/i.exec(oldHtml)?.[1] || "#";

      const newHtml = `
                        <a href="${href}" class="plan-item" data-id="${id}">
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            ${name}
                        </a>`;

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
      `<a [^>]*?data-id="${escapedId}"[^>]*?>[\\s\\S]*?<\\/a>`,
      "gi",
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
        const relativePath = hrefMatch[1].split("?")[0];
        const absolutePath = path.resolve(
          path.dirname(this.htmlPath),
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

      content = content.replace(itemHtml, "");
      fs.writeFileSync(this.htmlPath, content, "utf8");
      return true;
    }
    return false;
  }

  _extractType(href) {
    const ext = path.extname(href).toLowerCase();
    if (ext === ".pdf") return "PDF";
    if ([".xls", ".xlsx"].includes(ext)) return "Excel";
    if ([".doc", ".docx"].includes(ext)) return "Word";
    if ([".ppt", ".pptx"].includes(ext)) return "PowerPoint";
    return "Archivo";
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
      .replace(/&Ntilde;/g, "Ñ");
  }
}

module.exports = new PlanesTalentoModel();
