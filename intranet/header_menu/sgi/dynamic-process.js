/**
 * Dynamic Process Loader - SGI
 */

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const fileName = path.split("/").pop();
  const routeMap = {
    "gestion-documental.html": "sgi-gestion-documental",
    "contratacion.html": "sgi-contratacion",
    "juridico.html": "sgi-juridico",
    "bienes-servicios.html": "sgi-bienes-servicios",
    "gestion-tecnologias.html": "sgi-gestion-tecnologias",
    "talento-humano.html": "sgi-talento-humano",
    "control-disciplinario.html": "sgi-control-disciplinario",
    "cobro-coactivo.html": "sgi-cobro-coactivo",
    "gestion-financiera.html": "sgi-gestion-financiera",
    "gestion-integral.html": "sgi-gestion-integral"
  };

  const route = routeMap[fileName];
  if (!route) return;

  const API = `../../api.php?route=${route}`;
  const container = document.querySelector(".main-scroll-area");
  
  // Keep the header and breadcrumbs, but remove the meta-info-bar and all category sections
  const welcomeHeader = document.querySelector(".welcome-header");
  const metaInfoBar = document.querySelector(".meta-info-bar");
  if (metaInfoBar) metaInfoBar.remove();
  
  // Remove existing hardcoded sections
  document.querySelectorAll(".category-section").forEach(s => s.remove());

  // Create a loading state
  const loading = document.createElement("p");
  loading.textContent = "Cargando documentos...";
  loading.style.padding = "2rem";
  container.appendChild(loading);

  async function loadData() {
    try {
      const res = await fetch(API);
      const items = await res.json();
      loading.remove();
      render(items);
    } catch (e) {
      loading.textContent = "Error al cargar los documentos.";
      console.error(e);
    }
  }

  function getCategoryIcon(cat) {
    const c = cat.toLowerCase();
    if (c.includes("caracterización")) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (c.includes("formato")) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (c.includes("procedimiento")) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (c.includes("instructivo") || c.includes("guía") || c.includes("manual")) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (c.includes("riesgo") || c.includes("apoyo") || c.includes("anexo")) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (c.includes("seguridad") || c.includes("sst")) return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function render(items) {
    if (items.length === 0) {
      const p = document.createElement("p");
      p.textContent = "No hay documentos disponibles en este momento.";
      p.style.padding = "2rem";
      p.style.color = "#64748b";
      container.appendChild(p);
      return;
    }

    // Group by category
    const grouped = {};
    items.forEach(item => {
      const cat = item.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    // Sort categories (Caracterización first, then others)
    const sortedCats = Object.keys(grouped).sort((a, b) => {
      if (a.toLowerCase().includes("caracterización")) return -1;
      if (b.toLowerCase().includes("caracterización")) return 1;
      return a.localeCompare(b);
    });

    sortedCats.forEach(cat => {
      const section = document.createElement("section");
      section.className = "category-section";
      
      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `
        <div class="category-icon">
          ${getCategoryIcon(cat)}
        </div>
        <h3>${cat}</h3>
      `;
      
      const grid = document.createElement("div");
      grid.className = "file-list-grid";
      
      grouped[cat].forEach(item => {
        const a = document.createElement("a");
        a.href = item.fileUrl;
        a.target = "_blank";
        a.className = "file-item";
        a.innerHTML = `
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </div>
          <div class="file-name">${item.name}</div>
        `;
        grid.appendChild(a);
      });
      
      section.appendChild(header);
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  loadData();
});
