const fs = require("fs");
const path = require("path");

const HTML_PATH = path.join(__dirname, "../../header_menu/sgi/manuales.html");
const UPLOAD_DIR = path.join(process.cwd(), "data/menu header/sgi/manuales");

const SVG_PATH = `M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z`;

const ManualesModel = {
  getAll: () => {
    if (!fs.existsSync(HTML_PATH)) return [];
    const content = fs.readFileSync(HTML_PATH, "utf8");

    const gridRegex =
      /<div class="pdf-grid">([\s\S]*?)<!-- END_MANUALES_GRID -->/;
    const gridMatch = gridRegex.exec(content);
    if (!gridMatch) return [];

    const items = [];
    // Split por apertura genérica: data-id viene antes que class en el HTML generado
    const parts = gridMatch[1].split(/<a /);
    for (let i = 1; i < parts.length; i++) {
      const chunk = parts[i];
      if (!chunk.includes("pdf-folder-card")) continue; // ignorar otros <a>
      const idMatch = /data-id="([^"]*)"/.exec(chunk);
      const hrefMatch = /href="([^"]*)"/.exec(chunk);
      // Buscar h4 y el <p> que viene inmediatamente después del h4
      const titleMatch = /<h4>([\s\S]*?)<\/h4>/.exec(chunk);
      const afterH4 = titleMatch ? chunk.slice(chunk.indexOf("</h4>") + 5) : "";
      const codeMatch = /<p[^>]*>([\s\S]*?)<\/p>/.exec(afterH4);

      if (idMatch) {
        items.push({
          id: idMatch[1],
          href: hrefMatch ? hrefMatch[1] : "#",
          title: titleMatch ? titleMatch[1].trim() : "",
          code: codeMatch ? codeMatch[1].trim() : "",
        });
      }
    }
    return items;
  },

  create: (data) => {
    if (!fs.existsSync(HTML_PATH)) return null;
    let content = fs.readFileSync(HTML_PATH, "utf8");
    const id = Date.now().toString();

    const newCard = `
                <a data-id="${id}" href="${data.fileUrl || "#"}" class="pdf-folder-card" target="_blank">
                    <div class="file-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="${SVG_PATH}" />
                        </svg>
                    </div>
                    <h4>${data.title}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-light);">${data.code || ""}</p>
                </a>`;

    content = content.replace(
      "<!-- END_MANUALES_GRID -->",
      newCard + "\n                <!-- END_MANUALES_GRID -->",
    );
    fs.writeFileSync(HTML_PATH, content, "utf8");
    return id;
  },

  delete: (id) => {
    if (!fs.existsSync(HTML_PATH)) return false;
    let content = fs.readFileSync(HTML_PATH, "utf8");

    const gridRegex =
      /(<div class="pdf-grid">)([\s\S]*?)(<!-- END_MANUALES_GRID -->)/;
    const m = gridRegex.exec(content);
    if (!m) return false;

    const gridContent = m[2];
    const parts = gridContent.split(/<a /);
    const targetTag = `data-id="${id}"`;
    let found = false;

    const newParts = parts.filter((p, i) => {
      if (i === 0) return true;
      if (p.includes(targetTag) && p.includes("pdf-folder-card")) {
        // Borrar archivo físico
        const hrefMatch = /href="([^"]*)"/.exec(p);
        if (hrefMatch && hrefMatch[1] !== "#") {
          try {
            const abs = path.join(UPLOAD_DIR, path.basename(hrefMatch[1]));
            if (fs.existsSync(abs)) fs.unlinkSync(abs);
          } catch (e) {
            /* ignorar */
          }
        }
        found = true;
        return false;
      }
      return true;
    });

    if (!found) return false;

    const newGrid = newParts.map((p, i) => (i === 0 ? p : `<a ${p}`)).join("");
    content = content.replace(gridContent, newGrid);
    fs.writeFileSync(HTML_PATH, content, "utf8");
    return true;
  },

  update: (id, data) => {
    const items = ManualesModel.getAll();
    const existing = items.find((i) => i.id === id);
    if (!existing) return null;
    if (!data.fileUrl || data.fileUrl === "#") data.fileUrl = existing.href;
    if (ManualesModel.delete(id)) return ManualesModel.create(data);
    return null;
  },
};

module.exports = ManualesModel;
