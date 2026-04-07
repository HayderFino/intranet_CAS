const fs = require("fs");
const path = require("path");

const RUA_HTML_PATH = path.join(__dirname, "../../herramientas/rua.html");

const RuaModel = {
  getAll: () => {
    if (!fs.existsSync(RUA_HTML_PATH)) return [];
    const content = fs.readFileSync(RUA_HTML_PATH, "utf8");
    const items = [];

    const gridRegex =
      /<div class="pdf-grid" id="rua-docs-grid">([\s\S]*?)<!-- END_RUA_GRID -->/;
    const gridMatch = gridRegex.exec(content);
    if (gridMatch) {
      const gridContent = gridMatch[1];
      const idRegex = /<h4[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/h4>/g;
      let match;
      while ((match = idRegex.exec(gridContent)) !== null) {
        const id = match[1];
        const name = match[2].trim();
        const remaining = gridContent.substring(idRegex.lastIndex);
        const hrefMatch = /href="([^"]*)"/.exec(remaining);

        items.push({
          id: id,
          name: name.replace(/&oacute;/g, "ó").replace(/&nbsp;/g, " "),
          href: hrefMatch ? hrefMatch[1] : "#",
        });
      }
    }
    return items;
  },

  create: (data) => {
    if (!fs.existsSync(RUA_HTML_PATH)) return null;
    let content = fs.readFileSync(RUA_HTML_PATH, "utf8");
    const id = Date.now().toString();

    const newItemHtml = `
                    <div class="pdf-folder-card">
                        <div class="file-icon">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        </div>
                        <h4 data-id="${id}">${data.name}</h4>
                        <a href="${data.fileUrl || "#"}" class="btn-pdf-download" target="_blank">Ver PDF</a>
                    </div>`;

    content = content.replace(
      /(<!-- END\_RUA\_GRID -->)/,
      newItemHtml + "\n                $1",
    );
    fs.writeFileSync(RUA_HTML_PATH, content, "utf8");
    return id;
  },

  delete: (id) => {
    if (!fs.existsSync(RUA_HTML_PATH)) return false;
    let content = fs.readFileSync(RUA_HTML_PATH, "utf8");

    const gridRegex =
      /(<div class="pdf-grid" id="rua-docs-grid">)([\s\S]*?)(<!-- END_RUA_GRID -->)/;
    const gridMatch = gridRegex.exec(content);
    if (!gridMatch) return false;

    const gridContent = gridMatch[2];
    const cards = gridContent.split(/(?=<div class="pdf-folder-card">)/);
    const escapedIdAttr = `data-id="${id}"`;

    let targetCardIndex = -1;
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].includes(escapedIdAttr)) {
        targetCardIndex = i;
        break;
      }
    }

    if (targetCardIndex !== -1) {
      const targetCardHtml = cards[targetCardIndex];
      const hrefMatch = /href="([^"]*)"/.exec(targetCardHtml);
      if (
        hrefMatch &&
        hrefMatch[1] &&
        !hrefMatch[1].startsWith("http") &&
        hrefMatch[1] !== "#"
      ) {
        const relativePath = hrefMatch[1];
        const absolutePath = path.resolve(
          path.dirname(RUA_HTML_PATH),
          relativePath,
        );
        try {
          if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
        } catch (e) {}
      }

      cards.splice(targetCardIndex, 1);
      const newGridContent = cards.join("");
      content = content.replace(gridContent, newGridContent);
      fs.writeFileSync(RUA_HTML_PATH, content, "utf8");
      return true;
    }
    return false;
  },

  update: (id, data) => {
    const items = RuaModel.getAll();
    const existing = items.find((i) => i.id === id);
    if (!existing) return null;

    if (!data.fileUrl || data.fileUrl === "#") {
      data.fileUrl = existing.href;
    }

    if (RuaModel.delete(id)) {
      return RuaModel.create(data);
    }
    return null;
  },
};

module.exports = RuaModel;
