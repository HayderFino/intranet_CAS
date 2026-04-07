const fs = require("fs");
const path = require("path");

class ManualFuncionesModel {
  constructor() {
    this.htmlPath = path.join(
      __dirname,
      "../../header_menu/cas/manual-funciones.html",
    );
    this.dataDir = path.join(
      __dirname,
      "../../data/menu header/la cas/talento humano/Manual de Funciones",
    );
  }

  getAll() {
    if (!fs.existsSync(this.htmlPath)) return [];

    const content = fs.readFileSync(this.htmlPath, "utf8");
    const items = [];

    // Buscamos el bloque del grid
    const gridRegex =
      /id="manual-funciones-grid"[\s\S]*?>([\s\S]*?)<\/section>/i;
    const gridMatch = gridRegex.exec(content);

    if (gridMatch) {
      const gridContent = gridMatch[1];

      // Regex robusto para capturar las tarjetas
      const cardRegex =
        /<a\s+[^>]*?class="pdf-folder-card"[^>]*?>([\s\S]*?)<\/a>/gi;
      let cardMatch;

      while ((cardMatch = cardRegex.exec(gridContent)) !== null) {
        const outer = cardMatch[0];
        const inner = cardMatch[1];

        const idMatch = /data-id="([^"]*)"/i.exec(outer);
        const nameMatch = /<h4>([\s\S]*?)<\/h4>/i.exec(inner);
        const hrefMatch = /href="([^"]*)"/i.exec(outer);
        const btnMatch =
          /<span [^>]*?class="btn-pdf-download"[^>]*?>([\s\S]*?)<\/span>/i.exec(
            inner,
          );

        if (idMatch) {
          items.push({
            id: idMatch[1],
            name: nameMatch
              ? this._decodeHTML(nameMatch[1].trim())
              : "Sin nombre",
            href: hrefMatch ? hrefMatch[1] : "#",
            type: this._extractType(btnMatch ? btnMatch[1].trim() : ""),
            category: "Manual de Funciones y Competencias",
          });
        }
      }
    }

    return items;
  }

  create(item) {
    if (!fs.existsSync(this.htmlPath)) return null;
    let content = fs.readFileSync(this.htmlPath, "utf8");

    const newId = `mf_${Date.now()}`;
    const relativePath = `../../data/menu header/la cas/talento humano/Manual de Funciones/${item.filename}`;

    // Estilos por extensión
    const ext = path.extname(item.filename).toLowerCase();
    let iconColor = "var(--primary)";
    let btnBg = "var(--primary)";
    let typeStr = "Descargar PDF";

    if ([".xls", ".xlsx"].includes(ext)) {
      iconColor = "#1d6f42";
      btnBg = "#1d6f42";
      typeStr = "Descargar XLSX";
    } else if ([".doc", ".docx"].includes(ext)) {
      iconColor = "#2b579a";
      btnBg = "#2b579a";
      typeStr = "Descargar DOCX";
    } else if ([".ppt", ".pptx"].includes(ext)) {
      iconColor = "#d24726";
      btnBg = "#d24726";
      typeStr = "Descargar PPT";
    }

    const cardHtml = `
            <a href="${relativePath}" class="pdf-folder-card" data-id="${newId}">
                <div class="file-icon" style="color: ${iconColor};">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                </div>
                <h4>${item.name}</h4>
                <span class="btn-pdf-download" style="background: ${btnBg};">${typeStr}</span>
            </a>`;

    const gridTag = 'id="manual-funciones-grid"';
    const index = content.indexOf(gridTag);
    if (index !== -1) {
      const insertIndex = content.indexOf(">", index) + 1;
      content =
        content.substring(0, insertIndex) +
        "\n" +
        cardHtml +
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
    const cardRegex = new RegExp(
      `<a [^>]*?data-id="${escapedId}"[^>]*?>[\\s\\S]*?<\\/a>`,
      "gi",
    );
    const match = cardRegex.exec(content);

    if (match) {
      const oldCardHtml = match[0];
      const name =
        newData.name ||
        /<h4>([\s\S]*?)<\/h4>/i.exec(oldCardHtml)?.[1] ||
        "Sin nombre";
      const fileUrl = newData.filename
        ? `../../data/menu header/la cas/talento humano/Manual de Funciones/${newData.filename}`
        : /href="([^"]*)"/i.exec(oldCardHtml)?.[1] || "#";

      const ext = path.extname(fileUrl).toLowerCase();
      let iconColor = "var(--primary)";
      let btnBg = "var(--primary)";
      let typeStr = "Descargar PDF";
      if ([".xls", ".xlsx"].includes(ext)) {
        iconColor = "#1d6f42";
        btnBg = "#1d6f42";
        typeStr = "Descargar XLSX";
      } else if ([".doc", ".docx"].includes(ext)) {
        iconColor = "#2b579a";
        btnBg = "#2b579a";
        typeStr = "Descargar DOCX";
      }

      const newCardHtml = `
            <a href="${fileUrl}" class="pdf-folder-card" data-id="${id}">
                <div class="file-icon" style="color: ${iconColor};">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                </div>
                <h4>${name}</h4>
                <span class="btn-pdf-download" style="background: ${btnBg};">${typeStr}</span>
            </a>`;

      content = content.replace(oldCardHtml, newCardHtml);
      fs.writeFileSync(this.htmlPath, content, "utf8");
      return true;
    }
    return false;
  }

  delete(id) {
    if (!fs.existsSync(this.htmlPath)) return false;
    let content = fs.readFileSync(this.htmlPath, "utf8");

    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cardRegex = new RegExp(
      `<a [^>]*?data-id="${escapedId}"[^>]*?>[\\s\\S]*?<\\/a>`,
      "gi",
    );
    const match = cardRegex.exec(content);

    if (match) {
      const cardHtml = match[0];
      const href = /href="([^"]*)"/i.exec(cardHtml)?.[1];

      if (href && href !== "#" && !href.startsWith("http")) {
        const absPath = path.resolve(
          path.dirname(this.htmlPath),
          href.split("?")[0],
        );
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      }

      content = content.replace(cardHtml, "");
      fs.writeFileSync(this.htmlPath, content, "utf8");
      return true;
    }
    return false;
  }

  _extractType(text) {
    const t = text.toUpperCase();
    if (t.includes("PDF")) return "PDF";
    if (t.includes("XLS")) return "Excel";
    if (t.includes("DOC")) return "Word";
    if (t.includes("PPT")) return "PowerPoint";
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

module.exports = new ManualFuncionesModel();
