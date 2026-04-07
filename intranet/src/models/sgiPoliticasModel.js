/**
 * sgiPoliticasModel.js
 * Gestión de metadatos y documentos de Políticas Institucionales SGI.
 */
const fs = require("fs");
const path = require("path");

const HTML_PATH = path.join(__dirname, "../../header_menu/sgi/politicas.html");
const UPLOAD_DIR = path.join(
  process.cwd(),
  "data/menu header/sgi/Políticas Institucionales",
);

const SgiPoliticasModel = {
  /** Devuelve documentos estáticos (fijos en HTML) y dinámicos (gestión admin) */
  getAll() {
    if (!fs.existsSync(HTML_PATH)) return [];
    const content = fs.readFileSync(HTML_PATH, "utf8");
    const results = [];

    // 1. Artículos estáticos con data-id="static-..."
    const articleRx =
      /<article[^>]*class="policy-card[^"]*"[^>]*data-id="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g;
    let artMatch;
    while ((artMatch = articleRx.exec(content)) !== null) {
      const id = artMatch[1];
      const chunk = artMatch[2];
      const titleM = /<h2[^>]*class="policy-title"[^>]*>([\s\S]*?)<\/h2>/.exec(
        chunk,
      );
      const hrefM =
        /<a [^>]*href="([^"#][^"]*)"[^>]*class="btn-download"/.exec(chunk) ||
        /<a [^>]*class="btn-download"[^>]*href="([^"#][^"]*)"/.exec(chunk);

      // Obtener descripción (párrafo dentro de policy-content)
      let descText = "";
      const descM = /<div class="policy-content">([\s\S]*?)<\/div>/.exec(chunk);
      if (descM) {
        const pMatch = /<p>([\s\S]*?)<\/p>/.exec(descM[1]);
        descText = pMatch ? pMatch[1].trim() : descM[1].trim();
      }

      results.push({
        id,
        title: titleM ? titleM[1].trim() : "",
        code: descText, // Usamos 'code' para mapear a la descripción en el admin
        href: hrefM ? hrefM[1] : "#",
        isStatic: true,
      });
    }

    // 2. Artículos dinámicos entre marcadores
    const gridM =
      /(<!-- BEGIN_POLITICAS_DOCS -->)([\s\S]*?)(<!-- END_POLITICAS_DOCS -->)/.exec(
        content,
      );
    if (gridM) {
      const gridContent = gridM[2];
      const parts = gridContent.split(/<article/);
      for (let i = 1; i < parts.length; i++) {
        const chunk = parts[i];
        const idM = /data-id="([^"]*)"/.exec(chunk);
        const titleM =
          /<h2[^>]*class="policy-title"[^>]*>([\s\S]*?)<\/h2>/.exec(chunk);
        const descM = /<div class="policy-content">([\s\S]*?)<\/div>/.exec(
          chunk,
        );
        let descText = "";
        if (descM) {
          const pMatch = /<p>([\s\S]*?)<\/p>/.exec(descM[1]);
          descText = pMatch ? pMatch[1].trim() : descM[1].trim();
        }
        const hrefM =
          /href="([^"]*)"[^>]*class="btn-download"/.exec(chunk) ||
          /class="btn-download"[^>]*href="([^"]*)"/.exec(chunk);

        if (idM) {
          results.push({
            id: idM[1],
            title: titleM ? titleM[1].trim() : "",
            code: descText,
            href: hrefM ? hrefM[1] : "#",
            isStatic: false,
          });
        }
      }
    }

    return results;
  },

  create(data) {
    if (!fs.existsSync(HTML_PATH)) return null;
    let content = fs.readFileSync(HTML_PATH, "utf8");
    const id = "dyn-" + Date.now();

    const card = `
                <!-- Documento Dinámico: ${data.title} -->
                <article class="policy-card policy-accent-teal" data-id="${id}">
                    <div class="policy-header">
                        <div class="policy-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <h2 class="policy-title">${data.title}</h2>
                    </div>
                    <div class="policy-content">
                        <p>${data.code || ""}</p>
                    </div>
                    <div class="download-actions">
                        <a href="${data.fileUrl || "#"}" class="btn-download" target="_blank">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            Descargar Política
                        </a>
                    </div>
                </article>`;

    content = content.replace(
      "<!-- END_POLITICAS_DOCS -->",
      card + "\n                <!-- END_POLITICAS_DOCS -->",
    );
    fs.writeFileSync(HTML_PATH, content, "utf8");
    return id;
  },

  delete(id) {
    if (!fs.existsSync(HTML_PATH)) return false;
    let content = fs.readFileSync(HTML_PATH, "utf8");
    let found = false;

    if (id.startsWith("static-")) {
      const articleRegex = new RegExp(
        `<article[^>]*data-id="${id}"[\\s\\S]*?<\\/article>`,
        "i",
      );
      if (articleRegex.test(content)) {
        content = content.replace(articleRegex, "");
        found = true;
      }
    } else {
      const gridM =
        /(<!-- BEGIN_POLITICAS_DOCS -->)([\s\S]*?)(<!-- END_POLITICAS_DOCS -->)/.exec(
          content,
        );
      if (!gridM) return false;

      const gridContent = gridM[2];
      const parts = gridContent.split(/<article/);
      const newParts = parts.filter((p, i) => {
        if (i === 0) return true;
        if (p.includes(`data-id="${id}"`)) {
          const hrefM =
            /href="([^"]*)"[^>]*class="btn-download"/.exec(p) ||
            /class="btn-download"[^>]*href="([^"]*)"/.exec(p);
          if (hrefM && hrefM[1] !== "#" && hrefM[1].includes("data/")) {
            try {
              const abs = path.join(
                process.cwd(),
                hrefM[1].replace("../../", ""),
              );
              if (fs.existsSync(abs)) fs.unlinkSync(abs);
            } catch (_) {}
          }
          found = true;
          return false;
        }
        return true;
      });
      if (found) {
        const newGrid = newParts
          .map((p, i) => (i === 0 ? p : `<article${p}`))
          .join("");
        content = content.replace(gridContent, newGrid);
      }
    }

    if (found) {
      fs.writeFileSync(HTML_PATH, content, "utf8");
      return true;
    }
    return false;
  },

  update(id, data) {
    if (!fs.existsSync(HTML_PATH)) return null;
    let content = fs.readFileSync(HTML_PATH, "utf8");

    if (id.startsWith("static-")) {
      // Actualizar card fijo de forma robusta
      const articleRegex = new RegExp(
        `(<article[^>]*data-id="${id}"[\\s\\S]*?<h2[^>]*class="policy-title"[^>]*>)([\\s\\S]*?)(<\\/h2>[\\s\\S]*?<div[^>]*class="policy-content"[^>]*>\\s*<p>)([\\s\\S]*?)(<\\/p>[\\s\\S]*?class="btn-download"[^>]*href=")([^"]*)`,
        "i",
      );

      if (articleRegex.test(content)) {
        content = content.replace(
          articleRegex,
          `$1${data.title}$3${data.code || ""}$5${data.fileUrl || "#"}`,
        );
        fs.writeFileSync(HTML_PATH, content, "utf8");
        return id;
      } else {
        // Fallback: al menos actualizar el href si la estructura es distinta
        const hrefOnlyRegex = new RegExp(
          `(<article[^>]*data-id="${id}"[\\s\\S]*?class="btn-download"[^>]*href=")([^"]*)`,
          "i",
        );
        if (hrefOnlyRegex.test(content)) {
          content = content.replace(hrefOnlyRegex, `$1${data.fileUrl || "#"}`);
          fs.writeFileSync(HTML_PATH, content, "utf8");
          return id;
        }
      }
    } else {
      if (this.delete(id)) return this.create(data);
    }
    return null;
  },
};

module.exports = SgiPoliticasModel;
