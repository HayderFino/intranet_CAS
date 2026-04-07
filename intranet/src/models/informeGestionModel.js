const fs = require("fs");
const path = require("path");

class InformeGestionModel {
  constructor() {
    this.htmlPath = path.join(
      __dirname,
      "../../header_menu/cas/informe-gestion.html",
    );
    this.baseDataDir = path.join(
      __dirname,
      "../../data/menu header/la cas/Informe de Gestión",
    );

    if (!fs.existsSync(this.baseDataDir)) {
      fs.mkdirSync(this.baseDataDir, { recursive: true });
    }
  }

  getAll() {
    if (!fs.existsSync(this.htmlPath)) return [];
    const content = fs.readFileSync(this.htmlPath, "utf8");

    // Regex para capturar las tarjetas de informe de gestión
    // Buscamos el contenedor info-card y capturamos hasta el segundo </div> consecutivo que cierra la tarjeta
    const itemRegex =
      /<div class="card info-card"[^>]*?data-id="([^"]*)"[^>]*?>([\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>)/gi;

    const items = [];
    let match;

    while ((match = itemRegex.exec(content)) !== null) {
      const id = match[1];
      const inner = match[2];

      const titleMatch = /<h3>([\s\S]*?)<\/h3>/i.exec(inner);
      const descMatch = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(inner);
      const iframeMatch = /<iframe[^>]*src="([^"]*?\.pdf)[^"]*"/i.exec(inner);
      const downloadMatch = /class="btn-pdf-download"[^>]*href="([^"]*)"/i.exec(
        inner,
      );

      items.push({
        id,
        title: titleMatch
          ? this._decodeHTML(titleMatch[1].trim())
          : "Sin título",
        description: descMatch ? this._decodeHTML(descMatch[1].trim()) : "",
        pdfUrl: iframeMatch
          ? iframeMatch[1]
          : downloadMatch
            ? downloadMatch[1]
            : "#",
      });
    }

    return items;
  }

  create(item) {
    if (!fs.existsSync(this.htmlPath)) return null;
    let content = fs.readFileSync(this.htmlPath, "utf8");

    const newId = `inf_${Date.now()}`;
    const relativePath = `../../data/menu header/la cas/Informe de Gestión/${item.filename}`;

    const itemHtml = `
            <div class="card info-card" data-id="${newId}">
                <h3>${item.title}</h3>
                <p style="margin-bottom: 1.5rem;">${item.description || ""}</p>
                
                <div style="width: 100%; height: 800px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; background: #f9f9f9;">
                    <iframe src="${relativePath}#toolbar=0" width="100%" height="100%" style="border: none;">
                        <p>Su navegador no soporta la visualizaci&oacute;n de PDFs. 
                           <a href="${relativePath}">Haga clic aqu&iacute; para descargar el archivo.</a>
                        </p>
                    </iframe>
                </div>

                <div style="margin-top: 1.5rem; text-align: right;">
                    <a href="${relativePath}" target="_blank" class="btn-pdf-download" style="display: inline-flex;">Abrir en pantalla completa</a>
                </div>
            </div>`;

    // Insertar después del welcome-header o al principio del main-scroll-area
    const insertionPoint = 'class="main-scroll-area">';
    const index = content.indexOf(insertionPoint);
    if (index !== -1) {
      const insertIndex =
        content.indexOf(">", index + insertionPoint.length) + 1;
      // O mejor después de los breadcrumbs
      const breadcrumbEnd = " </nav>";
      const bIndex = content.indexOf(breadcrumbEnd, insertIndex);
      const finalInsertIndex =
        bIndex !== -1 ? bIndex + breadcrumbEnd.length : insertIndex;

      content =
        content.substring(0, finalInsertIndex) +
        "\n" +
        itemHtml +
        content.substring(finalInsertIndex);
      fs.writeFileSync(this.htmlPath, content, "utf8");
      return { ...item, id: newId, pdfUrl: relativePath };
    }
    return null;
  }

  update(id, newData) {
    if (!fs.existsSync(this.htmlPath)) return false;
    let content = fs.readFileSync(this.htmlPath, "utf8");

    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const itemRegex = new RegExp(
      `<div class="card info-card"[^>]*?data-id="${escapedId}"[\\s\\S]*?<\\/div>[\\s\\S]*?<\\/div>\\s*<\\/div>`,
      "i",
    );
    const match = itemRegex.exec(content);

    if (match) {
      const oldHtml = match[0];
      const title = newData.title || "Informe";
      const description = newData.description || "";
      const pdfUrl = newData.filename
        ? `../../data/menu header/la cas/Informe de Gestión/${newData.filename}`
        : /src="([^"]*?\.pdf)/i.exec(oldHtml)?.[1] || "#";

      const newHtml = `
            <div class="card info-card" data-id="${id}">
                <h3>${title}</h3>
                <p style="margin-bottom: 1.5rem;">${description}</p>
                
                <div style="width: 100%; height: 800px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e0e0e0; background: #f9f9f9;">
                    <iframe src="${pdfUrl}#toolbar=0" width="100%" height="100%" style="border: none;">
                        <p>Su navegador no soporta la visualizaci&oacute;n de PDFs. 
                           <a href="${pdfUrl}">Haga clic aqu&iacute; para descargar el archivo.</a>
                        </p>
                    </iframe>
                </div>

                <div style="margin-top: 1.5rem; text-align: right;">
                    <a href="${pdfUrl}" target="_blank" class="btn-pdf-download" style="display: inline-flex;">Abrir en pantalla completa</a>
                </div>
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
      `<div class="card info-card"[^>]*?data-id="${escapedId}"[\\s\\S]*?<\\/div>[\\s\\S]*?<\\/div>\\s*<\\/div>`,
      "i",
    );
    const match = itemRegex.exec(content);

    if (match) {
      const itemHtml = match[0];
      const pdfMatch = /src="([^"]*?\.pdf)/i.exec(itemHtml);

      if (
        pdfMatch &&
        pdfMatch[1] &&
        pdfMatch[1] !== "#" &&
        !pdfMatch[1].startsWith("http")
      ) {
        const relativePath = decodeURIComponent(
          pdfMatch[1].split("?")[0].split("#")[0],
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

module.exports = new InformeGestionModel();
