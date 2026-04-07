const fs = require("fs");
const path = require("path");

const BOLETINES_HTML_PATH = path.join(
  __dirname,
  "../../header_menu/git/boletines.html",
);

const BoletinesModel = {
  getAll: () => {
    if (!fs.existsSync(BOLETINES_HTML_PATH)) return [];
    const content = fs.readFileSync(BOLETINES_HTML_PATH, "utf8");
    const items = [];

    const gridRegex =
      /<div[^>]*id="boletines-historico-grid"[^>]*>([\s\S]*?)<!-- END_BOLETINES_GRID -->/;
    const gridMatch = gridRegex.exec(content);
    if (!gridMatch) return [];

    const gridContent = gridMatch[1];
    // Each item is an <a> tag
    const itemRegex = /<a\s[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = itemRegex.exec(gridContent)) !== null) {
      const id = match[1];
      const inner = match[2];
      const hrefMatch = /href="([^"]*)"/.exec(match[0]);
      const titleMatch = /<strong[^>]*>([\s\S]*?)<\/strong>/.exec(inner);
      const subtitleMatch =
        /<span[^>]*font-size: 0.75rem[^>]*>([\s\S]*?)<\/span>/.exec(inner);

      items.push({
        id,
        title: titleMatch
          ? titleMatch[1]
              .replace(/&iacute;/g, "í")
              .replace(/&oacute;/g, "ó")
              .trim()
          : "",
        subtitle: subtitleMatch
          ? subtitleMatch[1]
              .replace(/&oacute;/g, "ó")
              .replace(/&oacute;/g, "ó")
              .trim()
          : "",
        href: hrefMatch ? hrefMatch[1] : "#",
      });
    }
    return items;
  },

  create: (data) => {
    if (!fs.existsSync(BOLETINES_HTML_PATH)) return null;
    let content = fs.readFileSync(BOLETINES_HTML_PATH, "utf8");
    const id = Date.now().toString();

    const newItemHtml = `
                    <a href="${data.fileUrl || "#"}" class="card"
                        data-id="${id}"
                        target="_blank"
                        style="text-decoration: none; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #e2e8f0; background: #fff;">
                        <span style="font-size: 1.5rem; color: var(--text-light);">&rsaquo;</span>
                        <div>
                            <strong style="display: block; font-size: 0.9rem;">${data.title}</strong>
                            <span style="font-size: 0.75rem; color: #666;">${data.subtitle || ""}</span>
                        </div>
                    </a>`;

    content = content.replace(
      "<!-- END_BOLETINES_GRID -->",
      newItemHtml + "\n                <!-- END_BOLETINES_GRID -->",
    );
    fs.writeFileSync(BOLETINES_HTML_PATH, content, "utf8");
    return id;
  },

  delete: (id) => {
    if (!fs.existsSync(BOLETINES_HTML_PATH)) return false;
    let content = fs.readFileSync(BOLETINES_HTML_PATH, "utf8");

    const gridRegex =
      /(<div[^>]*id="boletines-historico-grid"[^>]*>)([\s\S]*?)(<!-- END_BOLETINES_GRID -->)/;
    const gridMatch = gridRegex.exec(content);
    if (!gridMatch) return false;

    const gridContent = gridMatch[2];
    // Split into <a> ... </a> items
    const parts = gridContent.split(/(?=<a\s)/);
    const targetAttr = `data-id="${id}"`;

    let targetIndex = -1;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes(targetAttr)) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex !== -1) {
      const targetHtml = parts[targetIndex];
      const hrefMatch = /href="([^"]*)"/.exec(targetHtml);
      if (
        hrefMatch &&
        hrefMatch[1] &&
        !hrefMatch[1].startsWith("http") &&
        hrefMatch[1] !== "#"
      ) {
        const relativePath = hrefMatch[1];
        const absolutePath = path.resolve(
          path.dirname(BOLETINES_HTML_PATH),
          relativePath,
        );
        try {
          if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
        } catch (e) {}
      }
      parts.splice(targetIndex, 1);
      const newGridContent = parts.join("");
      content = content.replace(gridContent, newGridContent);
      fs.writeFileSync(BOLETINES_HTML_PATH, content, "utf8");
      return true;
    }
    return false;
  },

  update: (id, data) => {
    const items = BoletinesModel.getAll();
    const existing = items.find((i) => i.id === id);
    if (!existing) return null;

    if (!data.fileUrl || data.fileUrl === "#") {
      data.fileUrl = existing.href;
    }

    if (BoletinesModel.delete(id)) {
      return BoletinesModel.create(data);
    }
    return null;
  },
};

module.exports = BoletinesModel;
