/**
 * universalCrawler.js
 * ───────────────────────────────────────────────────────────────────────────
 * Recorre TODAS las carpetas HTML y de datos de la intranet CAS y construye
 * un índice unificado de documentos, páginas y archivos para el buscador.
 *
 * Dos fuentes indexadas:
 *   A) Archivos físicos (.pdf, .docx, .doc, .xlsx, .pptx, .png) en /data/
 *   B) Links <a class="file-item"> extraídos de TODOS los HTML del servidor
 * ───────────────────────────────────────────────────────────────────────────
 */

const fs = require("fs");
const path = require("path");

// Raíz del servidor (donde está server.js)
const SERVER_ROOT = path.join(__dirname, "../../");

// ─── Extensiones de archivo consideradas documentos ────────────────────────
const DOC_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".doc",
  ".xlsx",
  ".xls",
  ".pptx",
  ".ppt",
  ".odt",
  ".ods",
  ".odp",
]);

// ─── Carpetas HTML a escanear (rutas relativas desde SERVER_ROOT) ──────────
const HTML_DIRS = [
  "header_menu/cas",
  "header_menu/sgi",
  "header_menu/git",
  "header_menu/git/manuales_usuario",
  "header_menu/talento-humano",
  "herramientas",
];

// ─── Carpetas de datos físicos a escanear ──────────────────────────────────
const DATA_DIRS = [
  "data/menu header/sgi/Documentos institucionales",
  "data/menu header/sgi/Procesos Estratégicos",
  "data/menu header/sgi/manuales",
  "data/menu header/git",
  "data/menu header/MECI",
  "data/menu header/la cas",
  "data/Talento humano",
  "data/Herramientas",
];

// ─── Mapeo de carpeta/HTML → tipo legible ──────────────────────────────────
const TYPE_MAP = [
  { match: "/sgi/documentos", label: "Documento Institucional" },
  { match: "/sgi/talento-humano", label: "SGI - Talento Humano" },
  { match: "/sgi/control-interno", label: "SGI - Control Interno" },
  { match: "/sgi/planeacion-estrate", label: "SGI - Planeación Estratégica" },
  { match: "/sgi/mejora-continua", label: "SGI - Mejora Continua" },
  { match: "/sgi/planeacion-ambiental", label: "SGI - Planeación Ambiental" },
  { match: "/sgi/vigilancia", label: "SGI - Vigilancia y Control" },
  { match: "/sgi/admin-recursos", label: "SGI - Recursos Naturales" },
  { match: "/sgi/gestion-documental", label: "SGI - Gestión Documental" },
  { match: "/sgi/gestion-financiera", label: "SGI - Gestión Financiera" },
  { match: "/sgi/gestion-tecnologias", label: "SGI - Tecnologías" },
  { match: "/sgi/juridico", label: "SGI - Jurídico" },
  { match: "/sgi/contratacion", label: "SGI - Contratación" },
  { match: "/sgi/bienes-servicios", label: "SGI - Bienes y Servicios" },
  { match: "/sgi/cobro-coactivo", label: "SGI - Cobro Coactivo" },
  { match: "/sgi/control-disciplinario", label: "SGI - Control Disciplinario" },
  { match: "/sgi/gestion-integral", label: "SGI - Gestión Integral" },
  { match: "/sgi/politicas", label: "SGI - Políticas" },
  { match: "/sgi/objetivos-calidad", label: "SGI - Objetivos de Calidad" },
  { match: "/sgi/manuales", label: "SGI - Manuales" },
  { match: "/sgi/", label: "SGI" },
  { match: "/git/manuales_usuario", label: "Manual de Usuario GIT" },
  { match: "/git/boletines", label: "Boletín de Seguridad GIT" },
  { match: "/git/normatividad", label: "GIT - Normatividad" },
  { match: "/git/gobierno-digital", label: "GIT - Gobierno Digital" },
  { match: "/git/proteccion", label: "GIT - Protección de Datos" },
  { match: "/git/", label: "GIT" },
  { match: "/cas/informe-gestion", label: "Informe de Gestión" },
  { match: "/cas/manual-funciones", label: "Manual de Funciones" },
  { match: "/cas/plan-monitoreo", label: "Plan Monitoreo SIGEP" },
  { match: "/cas/planes", label: "Planes Talento Humano" },
  { match: "/cas/convocatorias", label: "Convocatoria" },
  { match: "/cas/estudios-tecnicos", label: "Estudios Técnicos" },
  { match: "/cas/provision-empleos", label: "Provisión de Empleos" },
  { match: "/cas/ciberseguridad", label: "GIT - Ciberseguridad" },
  { match: "/cas/", label: "La CAS" },
  { match: "/herramientas/respel", label: "RESPEL" },
  { match: "/herramientas/rua", label: "RUA" },
  { match: "/herramientas/pcb", label: "PCB" },
  { match: "/herramientas/", label: "Herramienta" },
  { match: "MECI", label: "MECI" },
  { match: "Documentos institucionales", label: "Documento Institucional" },
  { match: "Talento humano", label: "SGI - Talento Humano" },
  { match: "boletines", label: "Boletín GIT" },
  { match: "gobierno digital", label: "GIT - Gobierno Digital" },
  { match: "manuales de usuario", label: "Manual de Usuario GIT" },
  { match: "normativa GIT", label: "GIT - Normatividad" },
  { match: "la cas", label: "La CAS" },
];

function getTypeLabel(pathOrHref) {
  const lp = (pathOrHref || "").toLowerCase().replace(/\\/g, "/");
  for (const entry of TYPE_MAP) {
    if (lp.includes(entry.match.toLowerCase())) return entry.label;
  }
  return "Documento";
}

// ─── Limpieza de entidades HTML ─────────────────────────────────────────────
function cleanHtml(str) {
  return (str || "")
    .replace(/&oacute;/gi, "ó")
    .replace(/&aacute;/gi, "á")
    .replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&Oacute;/gi, "Ó")
    .replace(/&Aacute;/gi, "Á")
    .replace(/&Eacute;/gi, "É")
    .replace(/&Iacute;/gi, "Í")
    .replace(/&Uacute;/gi, "Ú")
    .replace(/&Ntilde;/gi, "Ñ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&[a-z]+;/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

// ─── Normalizar URL relativa → absoluta desde servidor ─────────────────────
function normalizeUrl(href, htmlFilePath) {
  if (!href || href === "#") return "#";
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return href;

  // Relativa con ../../
  if (href.startsWith("../../")) {
    return "/" + href.replace("../../", "");
  }
  if (href.startsWith("../")) {
    const htmlDir = path.dirname(htmlFilePath);
    const resolved = path.resolve(htmlDir, href);
    const rel = path
      .relative(path.join(SERVER_ROOT), resolved)
      .replace(/\\/g, "/");
    return "/" + rel;
  }
  // Relativa simple
  const htmlDir = path.dirname(htmlFilePath);
  const resolved = path.resolve(htmlDir, href);
  const rel = path.relative(SERVER_ROOT, resolved).replace(/\\/g, "/");
  return "/" + rel;
}

// ─── Nombre legible desde nombre de archivo físico ─────────────────────────
function fileNameToTitle(fileName) {
  return (
    fileName
      .replace(/\.[^.]+$/, "") // quitar extensión
      .replace(/[-_]/g, " ") // guiones → espacios
      .replace(/\s+/g, " ")
      .trim()
      // Capitalizar primera letra de cada palabra
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// ─── A) CRAWL de archivos FÍSICOS en /data/ ────────────────────────────────
function crawlPhysicalFiles() {
  const items = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (DOC_EXTENSIONS.has(ext)) {
          // URL relativa al servidor
          const rel = path.relative(SERVER_ROOT, fullPath).replace(/\\/g, "/");
          const href = "/" + rel;
          const typeLabel = getTypeLabel(fullPath);
          const title = fileNameToTitle(entry.name);
          // Categoria basada en carpeta padre
          const parentDir = path.basename(path.dirname(fullPath));

          items.push({
            id: `file-${rel}`,
            title,
            name: title,
            href,
            fileUrl: href,
            type: typeLabel,
            category: cleanHtml(parentDir),
            snippet: `Archivo: ${entry.name} — ${typeLabel}`,
            // texto de búsqueda enriquecido
            searchText:
              `${title} ${entry.name} ${parentDir} ${typeLabel} ${rel}`.toLowerCase(),
          });
        }
      }
    }
  }

  for (const relDir of DATA_DIRS) {
    walk(path.join(SERVER_ROOT, relDir));
  }

  return items;
}

// ─── B) CRAWL de links <a class="file-item"> en todos los HTML ─────────────
function crawlHtmlFiles() {
  const items = [];
  const seenHrefs = new Set();

  function processHtml(htmlFilePath) {
    if (!fs.existsSync(htmlFilePath)) return;
    let content;
    try {
      content = fs.readFileSync(htmlFilePath, "utf8");
    } catch {
      return;
    }

    const htmlRelPath = path
      .relative(SERVER_ROOT, htmlFilePath)
      .replace(/\\/g, "/");
    const pageType = getTypeLabel("/" + htmlRelPath);

    // Extraer categoría del <h3> más cercano
    const categoryRegex = /<h3[^>]*>([\s\S]*?)<\/h3>/g;
    const fileItemRegex = /<a [^>]*class="file-item"[^>]*>([\s\S]*?)<\/a>/g;

    // Primero mapear posiciones de h3 → categoría
    const categories = [];
    let cm;
    while ((cm = categoryRegex.exec(content)) !== null) {
      categories.push({ pos: cm.index, name: cleanHtml(cm[1]) });
    }

    let fm;
    while ((fm = fileItemRegex.exec(content)) !== null) {
      const fullTag = fm[0];
      const inner = fm[1];
      const hrefMatch = /href="([^"]*)"/.exec(fullTag);
      const nameMatch = /<div class="file-name">([\s\S]*?)<\/div>/.exec(inner);

      if (!hrefMatch) continue;
      const rawHref = hrefMatch[1];
      if (!rawHref || rawHref === "#") continue;

      const href = normalizeUrl(rawHref, htmlFilePath);
      if (seenHrefs.has(href)) continue;
      seenHrefs.add(href);

      // Encontrar categoría: la última h3 que aparece ANTES de este item
      let cat = "";
      for (const c of categories) {
        if (c.pos < fm.index) cat = c.name;
        else break;
      }

      const rawName = nameMatch
        ? cleanHtml(nameMatch[1])
        : fileNameToTitle(path.basename(rawHref));

      items.push({
        id: `html-${href}`,
        title: rawName,
        name: rawName,
        href,
        fileUrl: href,
        type: pageType,
        category: cat,
        snippet: cat ? `${cat} — ${pageType}` : pageType,
        searchText:
          `${rawName} ${cat} ${pageType} ${href} ${rawHref}`.toLowerCase(),
      });
    }
  }

  function walkHtmlDir(dir) {
    if (!fs.existsSync(dir)) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkHtmlDir(fullPath);
      } else if (entry.name.endsWith(".html")) {
        processHtml(fullPath);
      }
    }
  }

  for (const relDir of HTML_DIRS) {
    walkHtmlDir(path.join(SERVER_ROOT, relDir));
  }

  return items;
}

// ─── ÍNDICE COMBINADO (singleton con caché) ─────────────────────────────────
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 segundos

const UniversalCrawler = {
  /**
   * Devuelve el índice completo de documentos. Se cachea 60s.
   */
  getIndex() {
    const now = Date.now();
    if (_cache && now - _cacheTime < CACHE_TTL) return _cache;

    const physical = crawlPhysicalFiles();
    const fromHtml = crawlHtmlFiles();

    // Combinar y deduplicar por href
    const byHref = new Map();
    for (const item of [...physical, ...fromHtml]) {
      if (!byHref.has(item.href)) {
        byHref.set(item.href, item);
      }
    }

    _cache = Array.from(byHref.values());
    _cacheTime = now;
    console.log(
      `[UniversalCrawler] Índice construido: ${_cache.length} documentos indexados.`,
    );
    return _cache;
  },

  /**
   * Busca en el índice con múltiples palabras clave (AND).
   * @param {string} query - texto libre de búsqueda
   * @returns {Array} resultados
   */
  search(query) {
    if (!query || query.trim().length === 0) return [];
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 0);
    const index = this.getIndex();

    return index.filter((item) =>
      keywords.every((kw) => item.searchText.includes(kw)),
    );
  },

  /**
   * Invalida la caché (útil cuando se sube un nuevo archivo).
   */
  invalidate() {
    _cache = null;
    _cacheTime = 0;
  },
};

module.exports = UniversalCrawler;
