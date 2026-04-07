const fs = require("fs");
const path = require("path");

const RESPEL_HTML_PATH = path.join(__dirname, "../../herramientas/respel.html");

const RespelModel = {
  getAll: (section = "documentos") => {
    if (!fs.existsSync(RESPEL_HTML_PATH)) return [];
    const content = fs.readFileSync(RESPEL_HTML_PATH, "utf8");
    const items = [];

    if (section === "documentos") {
      const gridRegex =
        /<div class="pdf-grid" id="respel-docs-grid">([\s\S]*?)<!-- END_RESPEL_GRID -->/;
      const gridMatch = gridRegex.exec(content);
      if (gridMatch) {
        const gridContent = gridMatch[1];
        const cardRegex =
          /<div class="pdf-folder-card">([\s\S]*?)<\/div>\s*(?=<div class="pdf-folder-card">|<!-- END_RESPEL_GRID -->|$)/g;
        let match;
        while ((match = cardRegex.exec(gridContent)) !== null) {
          const inner = match[1];
          const idMatch = /data-id="([^"]*)"/.exec(inner);
          const nameMatch = /<h4[^>]*>([\s\S]*?)<\/h4>/.exec(inner);
          const hrefMatch = /href="([^"]*)"/.exec(inner);

          if (idMatch) {
            items.push({
              id: idMatch[1],
              name: (nameMatch ? nameMatch[1].trim() : "Documento")
                .replace(/&oacute;/g, "ó")
                .replace(/&nbsp;/g, " "),
              href: hrefMatch ? hrefMatch[1] : "#",
            });
          }
        }
      }
    } else if (section === "empresas") {
      const tbodyRegex = /<tbody>([\s\S]*?)<\/tbody>/;
      const tbodyMatch = tbodyRegex.exec(content);
      if (tbodyMatch) {
        const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
        let trMatch;
        while ((trMatch = trRegex.exec(tbodyMatch[1])) !== null) {
          const inner = trMatch[1];
          const idMatch = /data-id="([^"]*)"/.exec(inner);
          const tds = inner.split(/<\/td>/);

          if (idMatch && tds.length >= 4) {
            const name = tds[0].replace(/<td[^>]*>/, "").trim();
            const actNum = tds[1].replace(/<td[^>]*>/, "").trim();
            const actDate = tds[2].replace(/<td[^>]*>/, "").trim();
            const fileLinkMatch = /href="([^"]*)"/.exec(tds[3]);
            const fileNameMatch =
              /<a[^>]*>\s*(?:&#128196;)?\s*([\s\S]*?)<\/a>/.exec(tds[3]);

            items.push({
              id: idMatch[1],
              name: name
                .replace(/&nbsp;/g, " ")
                .replace(/\r?\n/g, " ")
                .replace(/\s+/g, " "),
              actNum: actNum.replace(/\r?\n/g, " ").trim(),
              actDate: actDate.replace(/\r?\n/g, " ").trim(),
              href: fileLinkMatch ? fileLinkMatch[1] : "#",
              fileName: fileNameMatch ? fileNameMatch[1].trim() : "Ver",
            });
          }
        }
      }
    }
    return items;
  },

  create: (section, data) => {
    if (!fs.existsSync(RESPEL_HTML_PATH)) return null;
    let content = fs.readFileSync(RESPEL_HTML_PATH, "utf8");
    const id = Date.now().toString();

    if (section === "documentos") {
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
        /(<!-- END\_RESPEL\_GRID -->)/,
        newItemHtml + "\n                $1",
      );
    } else if (section === "empresas") {
      const bgClass = data.isAlternate
        ? 'style="background:#f9fbe7;"'
        : 'style="background:#fff;"';
      const newItemHtml = `
                            <tr ${bgClass}>
                                <td style="padding:0.75rem 1rem; border-bottom:1px solid #e0e0e0;" data-id="${id}">${data.name}</td>
                                <td style="padding:0.75rem 1rem; border-bottom:1px solid #e0e0e0; text-align:center;">${data.actNum}</td>
                                <td style="padding:0.75rem 1rem; border-bottom:1px solid #e0e0e0; text-align:center;">${data.actDate}</td>
                                <td style="padding:0.75rem 1rem; border-bottom:1px solid #e0e0e0; text-align:center;">
                                    <a href="${data.fileUrl || "#"}" target="_blank" class="respel-file-badge">&#128196; ${data.fileName || "VER"}</a>
                                </td>
                            </tr>`;

      content = content.replace(
        /<tbody>([\s\S]*?)<\/tbody>/,
        (match, items) => {
          return `<tbody>${items}${newItemHtml}</tbody>`;
        },
      );
    }

    fs.writeFileSync(RESPEL_HTML_PATH, content, "utf8");
    return id;
  },

  delete: (section, id) => {
    if (!fs.existsSync(RESPEL_HTML_PATH)) return false;
    let content = fs.readFileSync(RESPEL_HTML_PATH, "utf8");

    if (section === "documentos") {
      const gridRegex =
        /(<div class="pdf-grid" id="respel-docs-grid">)([\s\S]*?)(<!-- END_RESPEL_GRID -->)/;
      const gridMatch = gridRegex.exec(content);
      if (!gridMatch) return false;

      const gridContent = gridMatch[2];
      // Split by card opening tag
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
            path.dirname(RESPEL_HTML_PATH),
            relativePath,
          );
          try {
            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
          } catch (e) {}
        }

        // Remove only the target card
        cards.splice(targetCardIndex, 1);
        const newGridContent = cards.join("");

        content = content.replace(gridContent, newGridContent);
        fs.writeFileSync(RESPEL_HTML_PATH, content, "utf8");
        return true;
      }
    } else if (section === "empresas") {
      const itemRegex = new RegExp(
        `<tr[^>]*>\\s*<td[^>]*data-id="${id}"[\\s\\S]*?<\\/tr>`,
        "g",
      );
      const match = itemRegex.exec(content);
      if (match) {
        const itemHtml = match[0];
        const hrefMatch = /href="([^"]*)"/.exec(itemHtml);
        if (
          hrefMatch &&
          hrefMatch[1] &&
          !hrefMatch[1].startsWith("http") &&
          hrefMatch[1] !== "#"
        ) {
          const relativePath = hrefMatch[1];
          const absolutePath = path.resolve(
            path.dirname(RESPEL_HTML_PATH),
            relativePath,
          );
          try {
            if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
          } catch (e) {}
        }
        content = content.replace(itemHtml, "");
        fs.writeFileSync(RESPEL_HTML_PATH, content, "utf8");
        return true;
      }
    }
    return false;
  },

  update: (section, id, data) => {
    const items = RespelModel.getAll(section);
    const existing = items.find((i) => i.id === id);
    if (!existing) return null;

    if (!data.fileUrl || data.fileUrl === "#") {
      data.fileUrl = existing.href;
    }

    if (RespelModel.delete(section, id)) {
      return RespelModel.create(section, data);
    }
    return null;
  },
};

module.exports = RespelModel;
