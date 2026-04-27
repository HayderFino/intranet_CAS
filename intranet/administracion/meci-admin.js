/**
 * meci-admin.js
 * Módulo CRUD para administración de documentos MECI.
 * Soporta 3 categorías: Anticorrupcion, Documentos, Documentos varios
 * con subcarpetas dentro de Anticorrupcion.
 */
const MeciAdmin = (() => {
  const API_BASE = window.location.pathname.substring(
    0,
    window.location.pathname.lastIndexOf("/administracion/")
  ) + "/api.php?route=";

  // Mapping de tabs a rutas de API
  const TABS = [
    {
      id: "meci-tab-anticorrupcion",
      label: "Anticorrupcion",
      route: "meci/anticorrupcion",
      uploadRoute: "meci/anticorrupcion/upload",
      hasSubfolders: true,
      subfolders: [
        "Planes y Riesgos",
        "Documentos Base",
        "Valores y Actores",
        "Actores del Plan",
      ],
    },
    {
      id: "meci-tab-documentos",
      label: "Documentos",
      route: "meci/documentos",
      uploadRoute: "meci/documentos/upload",
      hasSubfolders: false,
      subfolders: [],
    },
    {
      id: "meci-tab-varios",
      label: "Documentos Varios",
      route: "meci/documentos-varios",
      uploadRoute: "meci/documentos-varios/upload",
      hasSubfolders: false,
      subfolders: [],
    },
  ];

  let activeTab = TABS[0];
  let items = [];
  let editingId = null;

  function getEls() {
    return {
      form: document.getElementById("meciForm"),
      editId: document.getElementById("meciEditId"),
      nameInput: document.getElementById("meciName"),
      subfolderGroup: document.getElementById("meciSubfolderGroup"),
      subfolderSelect: document.getElementById("meciSubfolder"),
      fileInput: document.getElementById("meciFile"),
      listEl: document.getElementById("meciList"),
      saveBtn: document.getElementById("meciSaveBtn"),
      cancelBtn: document.getElementById("meciCancelBtn"),
      filterSelect: document.getElementById("meciFilterSubfolder"),
      filterGroup: document.getElementById("meciFilterGroup"),
      countEl: document.getElementById("meciCount"),
    };
  }

  async function load(tabIndex = 0) {
    activeTab = TABS[tabIndex];
    editingId = null;
    items = [];

    // Actualizar tabs activos
    TABS.forEach((t, i) => {
      const el = document.getElementById(t.id);
      if (el) {
        el.classList.toggle("meci-tab-active", i === tabIndex);
      }
    });

    const els = getEls();
    if (!els.listEl) return;

    // Mostrar/ocultar select de subcarpeta
    if (els.subfolderGroup) {
      els.subfolderGroup.style.display = activeTab.hasSubfolders
        ? "block"
        : "none";
    }
    if (els.filterGroup) {
      els.filterGroup.style.display = activeTab.hasSubfolders
        ? "flex"
        : "none";
    }

    // Poblar opciones de subcarpeta
    if (activeTab.hasSubfolders && els.subfolderSelect) {
      els.subfolderSelect.innerHTML = activeTab.subfolders
        .map((sf) => `<option value="${sf}">${sf}</option>`)
        .join("");
    }
    if (activeTab.hasSubfolders && els.filterSelect) {
      els.filterSelect.innerHTML =
        '<option value="all">Todas las subcarpetas</option>' +
        activeTab.subfolders
          .map((sf) => `<option value="${sf}">${sf}</option>`)
          .join("");
    }

    // Resetear formulario
    cancelEdit();

    // Cargar lista
    els.listEl.innerHTML =
      '<p style="padding:1rem;color:#64748b;">Cargando documentos...</p>';
    try {
      const res = await fetch(`${API_BASE}${activeTab.route}`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      items = await res.json();
      renderList("all");
    } catch (e) {
      els.listEl.innerHTML = `<p style="color:#ef4444;padding:1rem;">Error al cargar: ${e.message}</p>`;
    }
  }

  function renderList(filterVal) {
    const els = getEls();
    if (!els.listEl) return;

    const filtered =
      filterVal === "all" || !activeTab.hasSubfolders
        ? items
        : items.filter((i) => i.subfolder === filterVal || i.category === filterVal);

    if (els.countEl) {
      els.countEl.textContent = `${filtered.length} de ${items.length} documentos`;
    }

    if (filtered.length === 0) {
      els.listEl.innerHTML =
        '<p style="color:#94a3b8;font-size:0.85rem;padding:2rem;text-align:center;background:#f8fafc;border-radius:12px;border:1px dashed #e2e8f0;">No hay documentos en esta sección.</p>';
      return;
    }

    els.listEl.innerHTML = "";

    // Si estamos en Anticorrupción y no hay filtro específico, agrupamos por subcarpeta
    if (activeTab.route === "meci/anticorrupcion" && filterVal === "all") {
      const groups = {};
      // Inicializar grupos en orden
      activeTab.subfolders.forEach((sf) => (groups[sf] = []));
      
      filtered.forEach((item) => {
        const sf = item.subfolder || item.category || "Planes y Riesgos";
        if (!groups[sf]) groups[sf] = [];
        groups[sf].push(item);
      });

      for (const sf in groups) {
        if (groups[sf].length === 0) continue;
        
        const groupHeader = document.createElement("div");
        groupHeader.style.cssText = "margin:1.5rem 0 0.75rem; display:flex; align-items:center; gap:0.75rem;";
        groupHeader.innerHTML = `
          <span style="height:1px; flex:1; background:#e2e8f0;"></span>
          <span style="font-size:0.7rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em;">${sf}</span>
          <span style="height:1px; flex:1; background:#e2e8f0;"></span>
        `;
        els.listEl.appendChild(groupHeader);

        groups[sf].forEach((item) => {
          els.listEl.appendChild(createCard(item));
        });
      }
    } else {
      filtered.forEach((item) => {
        els.listEl.appendChild(createCard(item));
      });
    }

    // Re-bind events
    els.listEl.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.onclick = () => deleteItem(btn.dataset.id);
    });
    els.listEl.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.onclick = () => startEdit(items.find((i) => i.id === btn.dataset.id));
    });
  }

  function createCard(item) {
    const subfolder = item.subfolder || item.category || "";
    const href = getFullUrl(item.href || item.fileUrl);
    const card = document.createElement("div");
    card.className = "news-manage-card";
    card.style.padding = "1.25rem";
    card.innerHTML = `
        <div class="news-info" style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap;">
            ${subfolder ? `<span style="background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:4px;font-size:0.65rem;font-weight:700;border:1px solid #e2e8f0;">${subfolder}</span>` : ""}
            <span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:4px;font-size:0.65rem;font-weight:700;border:1px solid #bfdbfe;">${getExt(item.filename || href)}</span>
          </div>
          <h4 style="margin:0 0 0.5rem;font-size:0.95rem;color:#1e293b;font-weight:600;line-height:1.4;">${item.name || item.title || item.filename}</h4>
          <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
            ${href && href !== "#"
        ? `<a href="${href}" target="_blank" class="admin-file-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              Ver Archivo
           </a>`
        : '<span style="font-size:0.72rem;color:#94a3b8;font-style:italic;">⚠️ Sin archivo vinculado</span>'
      }
          </div>
        </div>
        <div class="card-actions" style="margin-left:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
          <button class="btn-secondary btn-edit" data-id="${item.id}" style="padding:0.4rem 0.8rem; font-size:0.75rem; width:100%;">Editar</button>
          <button class="btn-delete" data-id="${item.id}" style="padding:0.4rem 0.8rem; font-size:0.75rem; width:100%;">Eliminar</button>
        </div>
      `;
    return card;
  }

  function getFullUrl(href) {
    if (!href || href === "#") return "#";
    // Si ya es una URL completa, no tocarla
    if (href.startsWith("http")) return href;
    // Si ya empieza con ../, ya está corregida
    if (href.startsWith("../")) return href;
    // Para rutas que vienen del API (ej: data/...), subir un nivel
    // porque el admin está en una subcarpeta
    return "../" + href;
  }

  function getExt(filename) {
    if (!filename) return "DOC";
    const ext = filename.split(".").pop().toUpperCase();
    return ext.length <= 5 ? ext : "DOC";
  }

  function startEdit(item) {
    if (!item) return;
    const els = getEls();
    editingId = item.id;
    els.editId.value = item.id;
    els.nameInput.value = item.name || item.title || "";
    if (activeTab.hasSubfolders && els.subfolderSelect) {
      const sf = item.subfolder || item.category || activeTab.subfolders[0];
      els.subfolderSelect.value = sf;
    }
    els.form.setAttribute("data-current-url", item.href || "#");
    els.saveBtn.textContent = "Actualizar Documento";
    els.cancelBtn.classList.remove("hidden");
    els.form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    const els = getEls();
    if (!els.form) return;
    els.form.reset();
    editingId = null;
    if (els.editId) els.editId.value = "";
    els.form.removeAttribute("data-current-url");
    if (els.saveBtn) els.saveBtn.textContent = "Guardar Documento";
    if (els.cancelBtn) els.cancelBtn.classList.add("hidden");
  }

  async function onSubmit(e) {
    e.preventDefault();
    const els = getEls();
    const id = els.editId.value;
    let fileUrl = els.form.getAttribute("data-current-url") || "#";
    const name = els.nameInput.value.trim();
    const subfolder = activeTab.hasSubfolders
      ? (els.subfolderSelect ? els.subfolderSelect.value : "")
      : "";

    toast(id ? "Actualizando..." : "Guardando...", "info");

    // Upload file if selected
    if (els.fileInput && els.fileInput.files.length > 0) {
      const fd = new FormData();
      fd.append("file", els.fileInput.files[0]);
      if (subfolder) fd.append("subfolder", subfolder);
      try {
        const upRes = await fetch(`${API_BASE}${activeTab.uploadRoute}`, {
          method: "POST",
          body: fd,
        });
        const upData = await upRes.json();
        fileUrl = upData.fileUrl || "#";
      } catch {
        toast("Error al subir el archivo", "error");
        return;
      }
    }

    const payload = { name, fileUrl, subfolder, category: subfolder };
    const method = id ? "PUT" : "POST";
    const url = id
      ? `${API_BASE}${activeTab.route}/${id}`
      : `${API_BASE}${activeTab.route}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast(id ? "Documento actualizado ✓" : "Documento guardado ✓");
        cancelEdit();
        load(TABS.indexOf(activeTab));
      } else {
        const err = await res.json().catch(() => ({}));
        toast("Error al guardar: " + (err.error || err.message || res.status), "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  }

  async function deleteItem(id) {
    if (!confirm("¿Eliminar este documento? Esta acción no se puede deshacer."))
      return;
    try {
      const res = await fetch(`${API_BASE}${activeTab.route}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Documento eliminado");
        load(TABS.indexOf(activeTab));
      } else {
        toast("Error al eliminar", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  }

  function toast(msg, type = "success") {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = "toast" + (type === "error" ? " toast-error" : "");
    el.classList.remove("hidden");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add("hidden"), 3500);
  }

  function init() {
    // Bind tabs
    TABS.forEach((tab, i) => {
      const el = document.getElementById(tab.id);
      if (el) el.addEventListener("click", () => load(i));
    });

    // Bind form
    const form = document.getElementById("meciForm");
    if (form && !form._mecibound) {
      form.addEventListener("submit", onSubmit);
      form._mecibound = true;
    }

    const cancelBtn = document.getElementById("meciCancelBtn");
    if (cancelBtn && !cancelBtn._mecibound) {
      cancelBtn.addEventListener("click", cancelEdit);
      cancelBtn._mecibound = true;
    }

    // Bind filter
    const filterSelect = document.getElementById("meciFilterSubfolder");
    if (filterSelect && !filterSelect._mecibound) {
      filterSelect.addEventListener("change", () => renderList(filterSelect.value));
      filterSelect._mecibound = true;
    }

    // Load first tab
    load(0);
  }

  return { init, load };
})();

window.MeciAdmin = MeciAdmin;
