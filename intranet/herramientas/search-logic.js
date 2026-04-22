document.addEventListener("DOMContentLoaded", () => {
  const resultsList = document.getElementById("resultsList");
  const resultsCount = document.getElementById("resultsCount");
  const form = document.getElementById("advancedSearchForm");
  const queryInput = document.getElementById("filterQuery");
  const categorySelect = document.getElementById("filterCategory");
  const startDateInput = document.getElementById("filterStartDate");
  const endDateInput = document.getElementById("filterEndDate");

  // Parse URL params (cuando se llega desde la barra de búsqueda del header)
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q");
  if (initialQuery) {
    queryInput.value = initialQuery;
    performSearch(initialQuery);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    performSearch();
  });

  // Búsqueda en tiempo real mientras se escribe (debounce 350ms)
  let debounceTimer;
  queryInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (queryInput.value.trim().length >= 2) performSearch();
    }, 350);
  });

  async function performSearch(qOverride = null) {
    const query = qOverride !== null ? qOverride : queryInput.value.trim();
    const category = categorySelect.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!query && !startDate && !endDate && category === "all") {
      resultsList.innerHTML = `
                <div class="card" style="text-align: center; padding: 4rem; color: #94a3b8;">
                    <svg style="width:48px;height:48px;margin:0 auto 1rem;display:block;opacity:0.4;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p>Ingresa un término para comenzar la búsqueda.</p>
                </div>`;
      resultsCount.innerText = "";
      return;
    }

    resultsList.innerHTML = `
            <div style="text-align:center;padding:3rem;color:#64748b;display:flex;flex-direction:column;align-items:center;gap:1rem;">
                <svg style="width:32px;height:32px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
                <span>Buscando coincidencias...</span>
            </div>`;
    resultsCount.innerText = "Buscando...";

    try {
      // Calcular ruta base relativa a la raiz del proyecto (asumiendo que estamos en /herramientas/)
      const apiPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/herramientas/')) + '/api.php?route=';
      const url = `${apiPath}search&q=${encodeURIComponent(query)}&category=${category}&startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderResults(data, query);
    } catch (err) {
      console.error(err);
      resultsList.innerHTML = `
                <div class="card" style="text-align:center;padding:3rem;color:#ef4444;">
                    <p>⚠️ Error al conectar con el motor de búsqueda.</p>
                </div>`;
      resultsCount.innerText = "Error";
    }
  }

  function highlight(text, query) {
    if (!text || !query) return text || "";
    const keywords = query.split(/\s+/).filter((k) => k.length > 0);
    let result = escHtml(text);
    keywords.forEach((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(
        new RegExp(`(${escaped})`, "gi"),
        '<mark style="background:#fef08a;border-radius:3px;padding:0 2px;">$1</mark>',
      );
    });
    return result;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderResults(results, query) {
    if (results.length === 0) {
      resultsList.innerHTML = `
                <div class="card" style="text-align:center;padding:4rem;color:#94a3b8;">
                    <svg style="width:48px;height:48px;margin:0 auto 1rem;display:block;opacity:0.4;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 14s1.5 2 3 2 3-2 3-2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/>
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <p>No se encontraron resultados para <strong>"${escHtml(query)}"</strong></p>
                    <p style="font-size:0.85rem;margin-top:0.5rem;">Intenta con términos más cortos o sinónimos.</p>
                </div>`;
      resultsCount.innerText = "0 resultados";
      return;
    }

    resultsCount.innerHTML = `<strong>${results.length}</strong> resultado${results.length !== 1 ? "s" : ""} encontrado${results.length !== 1 ? "s" : ""}`;

    resultsList.innerHTML = results
      .map((res, i) => {
        const isFile =
          res.href &&
          (res.href.endsWith(".pdf") ||
            res.href.endsWith(".docx") ||
            res.href.endsWith(".pptx") ||
            res.href.endsWith(".xlsx") ||
            res.href.endsWith(".doc"));
        const target =
          isFile || res.href.startsWith("http") ? "_blank" : "_self";
        const { color, bg, icon } = getTypeStyle(res.type);
        const dateStr = formatDate(res.date);
        const titleHtml = highlight(res.title, query);
        const snippetHtml = highlight(res.snippet, query);

        return `
            <div class="search-result-card card"
                style="display:flex;flex-direction:column;gap:0.6rem;cursor:pointer;
                       animation:fadeUp 0.3s ease ${i * 0.04}s both;
                       border-left: 4px solid ${color};"
                onclick="window.open('${res.href}', '${target}')">
                <style>@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}</style>
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
                    <span style="background:${bg};color:${color};padding:4px 12px;border-radius:99px;
                                 font-size:0.72rem;font-weight:700;letter-spacing:0.03em;
                                 display:flex;align-items:center;gap:6px;">
                        ${icon} ${escHtml(res.type)}
                    </span>
                    <span style="font-size:0.75rem;color:#94a3b8;">${dateStr}</span>
                </div>
                <h3 style="margin:0;font-size:1.05rem;color:#1e293b;line-height:1.4;">${titleHtml}</h3>
                ${res.snippet ? `<p style="margin:0;color:#64748b;font-size:0.875rem;line-height:1.6;">${snippetHtml}</p>` : ""}
                <div style="margin-top:0.25rem;color:#3b82f6;font-size:0.8rem;font-weight:600;
                            display:flex;align-items:center;gap:4px;">
                    ${isFile ? "⬇ Descargar archivo" : "→ Ver recurso"}
                </div>
            </div>`;
      })
      .join("");
  }

  const TYPE_STYLES = {
    noticia: { color: "#0ea5e9", bg: "#e0f2fe" },
    informe: { color: "#8b5cf6", bg: "#f3e8ff" },
    agenda: { color: "#f59e0b", bg: "#fef3c7" },
    sgi: { color: "#059669", bg: "#d1fae5" },
    documento: { color: "#059669", bg: "#d1fae5" },
    herramienta: { color: "#6366f1", bg: "#eef2ff" },
    manual: { color: "#2563eb", bg: "#dbeafe" },
    git: { color: "#7c3aed", bg: "#ede9fe" },
    talento: { color: "#be185d", bg: "#fce7f3" },
    meci: { color: "#dc2626", bg: "#fee2e2" },
    convocatoria: { color: "#d97706", bg: "#fef3c7" },
    provisión: { color: "#b45309", bg: "#fef3c7" },
    pcb: { color: "#065f46", bg: "#d1fae5" },
    respel: { color: "#991b1b", bg: "#fee2e2" },
    rua: { color: "#1e40af", bg: "#dbeafe" },
    boletín: { color: "#7c3aed", bg: "#ede9fe" },
  };

  const ICONS = {
    noticia:
      '<svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-1 14H5V8h14v10z"/></svg>',
    doc: '<svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',
    tool: '<svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
    calendar:
      '<svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>',
    default:
      '<svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
  };

  function getTypeStyle(type) {
    const lt = (type || "").toLowerCase();
    let key = "default";
    for (const k of Object.keys(TYPE_STYLES)) {
      if (lt.includes(k)) {
        key = k;
        break;
      }
    }
    const style = TYPE_STYLES[key] || { color: "#64748b", bg: "#f1f5f9" };

    let icon = ICONS.default;
    if (lt.includes("noticia")) icon = ICONS.noticia;
    else if (lt.includes("agenda") || lt.includes("evento"))
      icon = ICONS.calendar;
    else if (lt.includes("herramienta")) icon = ICONS.tool;
    else if (
      lt.includes("manual") ||
      lt.includes("informe") ||
      lt.includes("sgi") ||
      lt.includes("documento") ||
      lt.includes("git") ||
      lt.includes("talento")
    )
      icon = ICONS.doc;

    return { ...style, icon };
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }
});
