/**
 * Procesos de Apoyo - Admin Module
 */

const ProcesosApoyoAdmin = (() => {
  let API = "../api.php?route=sgi-gestion-documental";
  const MAX_SIZE_MB = 20;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const FORBIDDEN_EXTS = [".exe", ".bat", ".cmd", ".js", ".vbs", ".sh", ".ps1", ".msi", ".com"];

  const PROCESSES = {
    "sgi-gestion-documental": {
      name: "Gestión Documental",
      categories: ["Caracterización", "Formatos", "Procedimientos", "Instructivos", "Documentos de Apoyo y Riesgos"]
    },
    "sgi-contratacion": {
      name: "Contratación",
      categories: ["Caracterización", "Formatos de Incorporación", "Gestión Contractual (PCT)", "Manuales y Guías", "Procedimientos"]
    },
    "sgi-juridico": {
      name: "Jurídico",
      categories: ["Caracterización", "Formatos Jurídicos", "Procedimientos", "Gestión de Riesgos"]
    },
    "sgi-bienes-servicios": {
      name: "Bienes y Servicios",
      categories: ["Caracterización", "Formatos (Bienes y Seguridad Vial)", "Procedimientos", "Seguridad Vial (PESV)", "Instructivos y Guías", "Registros y Gestión de Riesgos"]
    },
    "sgi-gestion-tecnologias": {
      name: "Gestión de la Información y Tecnologías",
      categories: ["Caracterización", "Formatos TIC (F-PGT)", "Procedimientos", "Instructivos y Manuales", "Ciberseguridad y Anexos"]
    },
    "sgi-talento-humano": {
      name: "Talento Humano",
      categories: ["Caracterización", "Formatos Institucionales (PTH)", "Procedimientos", "Manuales y Gestión de Riesgos", "Anexos y Programas", "Procesos de Provisión de Empleos"]
    },
    "sgi-control-disciplinario": {
      name: "Control Interno Disciplinario",
      categories: ["Caracterización", "Formatos (F-PCD)", "Procedimientos", "Constancias y Riesgos"]
    },
    "sgi-cobro-coactivo": {
      name: "Cobro Coactivo",
      categories: ["Caracterización", "Formatos de Control (F-PCC)", "Procedimientos", "Gestión de Riesgos"]
    },
    "sgi-gestion-financiera": {
      name: "Gestión Financiera",
      categories: ["Caracterización", "Formatos (F-PGF)", "Procedimientos (PGF)", "Gestión de Riesgos"]
    },
    "sgi-gestion-integral": {
      name: "Gestión Integral",
      categories: ["Caracterización", "Seguridad y Salud en el Trabajo (SST)", "Gestión Ambiental", "Procedimientos e Instructivos", "Registros y Resoluciones"]
    }
  };

  let elements = {};
  let items = [];
  let currentProcess = "sgi-gestion-documental";
  let currentFilter = "all";

  function init() {
    console.log("[ProcesosApoyoAdmin] Iniciando...");
    elements = {
      section: document.getElementById("procesosApoyoSection"),
      grid: document.getElementById("paGridContainer"),
      adminArea: document.getElementById("paAdminArea"),
      backBtn: document.getElementById("paBackBtn"),
      currentTitle: document.getElementById("paCurrentProcessTitle"),
      processSelect: document.getElementById("paProcessSelect"),
      form: document.getElementById("paForm"),
      name: document.getElementById("paName"),
      category: document.getElementById("paCategory"),
      file: document.getElementById("paFile"),
      saveBtn: document.getElementById("paSaveBtn"),
      cancelBtn: document.getElementById("paCancelBtn"),
      editId: document.getElementById("paEditId"),
      list: document.getElementById("paList"),
      filter: document.getElementById("paFilterCategory"),
      count: document.getElementById("paCount")
    };

    // Verificar elementos críticos
    const critical = ["grid", "adminArea", "form", "list", "processSelect"];
    const missing = critical.filter(k => !elements[k]);
    if (missing.length > 0) {
      console.error("[ProcesosApoyoAdmin] Faltan elementos en el DOM:", missing);
      return;
    }

    try {
      elements.processSelect.onchange = (e) => {
        selectProcess(e.target.value);
      };

      if (elements.backBtn) {
        elements.backBtn.onclick = () => {
          showGrid();
        };
      }

      elements.form.onsubmit = handleSubmit;
      if (elements.cancelBtn) elements.cancelBtn.onclick = resetForm;

      if (elements.filter) {
        elements.filter.onchange = (e) => {
          currentFilter = e.target.value;
          render();
        };
      }

      renderGrid();
      showGrid();
      console.log("[ProcesosApoyoAdmin] Inicialización completada.");
    } catch (err) {
      console.error("[ProcesosApoyoAdmin] Error durante init:", err);
    }
  }

  function renderGrid() {
    if (!elements.grid) return;
    elements.grid.innerHTML = "";
    
    Object.keys(PROCESSES).forEach(key => {
      try {
        const p = PROCESSES[key];
        const card = document.createElement("div");
        card.className = "folder-card";
        card.style.cssText = "background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.2s; text-align: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);";
        
        card.onmouseover = () => card.style.transform = "translateY(-5px)";
        card.onmouseout = () => card.style.transform = "translateY(0)";
        card.onclick = () => selectProcess(key);
        
        card.innerHTML = `
          <div style="width: 60px; height: 60px; background: #fff7ed; color: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" style="width: 32px; height: 32px;"><path fill="currentColor" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
          </div>
          <h4 style="margin: 0; color: #1e293b; font-size: 0.95rem; font-weight: 700;">${p.name}</h4>
          <span style="font-size: 0.75rem; color: #64748b;">${p.categories.length} Subcarpetas</span>
        `;
        elements.grid.appendChild(card);
      } catch (e) {
        console.error("Error rendering card for " + key, e);
      }
    });
  }

  function showGrid() {
    elements.grid.classList.remove("hidden");
    elements.adminArea.classList.add("hidden");
  }

  function selectProcess(key) {
    currentProcess = key;
    API = `../api.php?route=${currentProcess}`;
    elements.processSelect.value = key;
    elements.currentTitle.textContent = PROCESSES[key].name;
    
    elements.grid.classList.add("hidden");
    elements.adminArea.classList.remove("hidden");
    
    updateCategories();
    resetForm();
    load();
  }

  function updateCategories() {
    const categories = PROCESSES[currentProcess].categories;
    
    // Update form category select
    elements.category.innerHTML = '<option value="" disabled selected>Seleccione subcarpeta...</option>';
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      elements.category.appendChild(opt);
    });

    // Update filter select
    if (elements.filter) {
      elements.filter.innerHTML = '<option value="all">Todas las subcarpetas</option>';
      categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        elements.filter.appendChild(opt);
      });
      currentFilter = "all";
      elements.filter.value = "all";
    }
  }

  async function load() {
    elements.list.innerHTML = '<p style="padding:2rem; text-align:center;">Cargando documentos...</p>';
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Error loading");
      items = await res.json();
      render();
    } catch (e) {
      console.error(e);
      elements.list.innerHTML = '<p style="padding:2rem; text-align:center; color:red;">Error al cargar datos.</p>';
    }
  }

  function render() {
    let filtered = items;
    if (currentFilter !== "all") {
      filtered = items.filter(i => i.category === currentFilter);
    }

    if (elements.count) elements.count.textContent = `(${filtered.length} archivos)`;

    if (filtered.length === 0) {
      elements.list.innerHTML = '<p style="padding:2rem; text-align:center; color:#64748b;">No hay documentos en esta selección.</p>';
      return;
    }

    elements.list.innerHTML = "";
    filtered.forEach(item => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `
        <div class="news-info">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span class="badge-category">${item.category || "General"}</span>
          </div>
          <h4 style="margin:0; font-size:1rem;">${item.name}</h4>
          <small style="color:#64748b; display:block; margin-top:0.2rem;">${item.filename}</small>
        </div>
        <div class="card-actions">
          <a href="${item.fileUrl}" target="_blank" class="btn-secondary">Ver</a>
          <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
          <button class="btn-delete" data-id="${item.id}">Eliminar</button>
        </div>
      `;
      elements.list.appendChild(card);
    });

    elements.list.querySelectorAll(".btn-edit").forEach(btn => {
      btn.onclick = () => startEdit(items.find(i => i.id === btn.dataset.id));
    });

    elements.list.querySelectorAll(".btn-delete").forEach(btn => {
      btn.onclick = () => del(btn.dataset.id);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const id = elements.editId.value;
    const file = elements.file.files[0];
    const name = elements.name.value.trim();
    const category = elements.category.value;

    if (!name || !category) return notify("Complete todos los campos", "info");
    if (!id && !file) return notify("Seleccione un archivo", "info");

    let fileUrl = id ? items.find(i => i.id === id)?.fileUrl : "";

    if (file) {
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (FORBIDDEN_EXTS.includes(ext)) return notify("Extensión no permitida", "error");
      if (file.size > MAX_SIZE_BYTES) return notify(`Máximo ${MAX_SIZE_MB}MB`, "error");

      notify("Subiendo archivo...", "info");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);

      try {
        const upRes = await fetch(`${API}/upload`, { method: "POST", body: fd });
        if (!upRes.ok) throw new Error("Upload failed");
        const upData = await upRes.json();
        fileUrl = upData.fileUrl;
      } catch (err) {
        return notify("Error al subir archivo", "error");
      }
    }

    notify(id ? "Actualizando..." : "Guardando...", "info");
    try {
      const res = await fetch(id ? `${API}/${id}` : API, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, fileUrl })
      });

      if (res.ok) {
        notify(id ? "Documento actualizado" : "Documento guardado");
        resetForm();
        load();
      } else {
        notify("Error al procesar", "error");
      }
    } catch (err) {
      notify("Error de red", "error");
    }
  }

  function startEdit(item) {
    if (!item) return;
    elements.editId.value = item.id;
    elements.name.value = item.name;
    elements.category.value = item.category;
    elements.file.required = false;
    elements.saveBtn.textContent = "Actualizar Documento";
    elements.cancelBtn.classList.remove("hidden");
    elements.form.scrollIntoView({ behavior: "smooth" });
  }

  function resetForm() {
    elements.form.reset();
    elements.editId.value = "";
    elements.file.required = true;
    elements.saveBtn.textContent = "Subir Documento";
    elements.cancelBtn.classList.add("hidden");
  }

  async function del(id) {
    if (!confirm("¿Seguro que desea eliminar este archivo?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        notify("Eliminado correctamente");
        load();
      } else {
        notify("Error al eliminar", "error");
      }
    } catch (err) {
      notify("Error de red", "error");
    }
  }

  function notify(msg, type = "success") {
    if (typeof showToast === "function") showToast(msg, type);
    else alert(msg);
  }

  return { init, load };
})();

window.ProcesosApoyoAdmin = ProcesosApoyoAdmin;
