/**
 * Planes de Talento Humano - Admin Module
 */

const PlanesTalentoAdmin = (() => {
  const API = "../api/planes-talento";
  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const FORBIDDEN_EXTS = [
    ".exe",
    ".bat",
    ".cmd",
    ".js",
    ".vbs",
    ".sh",
    ".ps1",
    ".msi",
    ".com",
  ];

  let elements = {};
  let items = [];
  let currentFilter = "all";

  function init() {
    elements = {
      form: document.getElementById("planesTalentoForm"),
      name: document.getElementById("planesTalentoName"),
      category: document.getElementById("planesTalentoCategory"),
      file: document.getElementById("planesTalentoFile"),
      saveBtn: document.getElementById("planesTalentoSaveBtn"),
      list: document.getElementById("planesTalentoItemsList"),
      cancelContainer: document.getElementById("planesTalentoCancelContainer"),
      filter: document.getElementById("filterPlanesTalento"),
      section: document.getElementById("planesTalentoSection"),
    };

    if (!elements.form || !elements.list) return;

    // Hidden input for ID
    let editIdInput = document.getElementById("planesTalentoEditId");
    if (!editIdInput) {
      editIdInput = document.createElement("input");
      editIdInput.type = "hidden";
      editIdInput.id = "planesTalentoEditId";
      elements.form.appendChild(editIdInput);
    }
    elements.editId = editIdInput;

    // Cancel button
    let cancelBtn = document.getElementById("planesTalentoCancelBtn");
    if (elements.cancelContainer && !cancelBtn) {
      cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.id = "planesTalentoCancelBtn";
      cancelBtn.className = "btn-secondary hidden";
      cancelBtn.style.marginLeft = "0.5rem";
      cancelBtn.innerText = "Cancelar Edición";
      elements.cancelContainer.appendChild(cancelBtn);
      cancelBtn.onclick = resetForm;
    }
    elements.cancelBtn = cancelBtn;

    elements.form.onsubmit = handleSubmit;
    if (elements.filter) {
      elements.filter.onchange = (e) => {
        currentFilter = e.target.value;
        render();
      };
    }

    load();
  }

  async function load() {
    if (!elements.list) {
      elements.list = document.getElementById("planesTalentoItemsList");
      if (!elements.list) return;
    }

    elements.list.innerHTML =
      '<p style="padding:1rem;">Cargando documentos...</p>';
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Error en respuesta");
      items = await res.json();
      render();
    } catch (e) {
      console.error(e);
      elements.list.innerHTML =
        '<p style="padding:1rem; color:red;">Error al cargar el listado.</p>';
    }
  }

  function render() {
    if (!elements.list) return;

    let filtered = items;
    if (currentFilter !== "all") {
      filtered = items.filter((i) => i.category === currentFilter);
    }

    if (filtered.length === 0) {
      elements.list.innerHTML = `<p style="padding:1rem;">No hay documentos ${currentFilter !== "all" ? `en "${currentFilter}"` : ""}.</p>`;
      return;
    }

    elements.list.innerHTML = "";
    filtered.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";

      card.innerHTML = `
                <div class="news-info">
                    <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
                        <span style="background:#e2e8f0; color:#475569; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">${item.category}</span>
                        <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">${item.type}</span>
                    </div>
                    <h4 style="margin:0;">${item.name}</h4>
                </div>
                <div class="card-actions">
                    <a href="${item.href}" target="_blank" class="btn-secondary" style="text-decoration:none;">Descargar</a>
                    <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                </div>`;
      elements.list.appendChild(card);
    });

    elements.list.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.onclick = () => startEdit(items.find((i) => i.id === btn.dataset.id));
    });

    elements.list.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.onclick = () => del(btn.dataset.id);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const id = elements.editId.value;
    const file = elements.file.files[0];
    const name = elements.name.value.trim();
    const category = elements.category.value;

    if (!name || !category)
      return notify("Nombre y categoría son obligatorios", "info");
    if (!id && !file) return notify("Selecciona un archivo", "info");

    if (file) {
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (FORBIDDEN_EXTS.includes(ext))
        return notify("Tipo de archivo prohibido", "error");
      if (file.size > MAX_SIZE_BYTES)
        return notify(`Supera el límite de ${MAX_SIZE_MB}MB`, "error");
    }

    notify(id ? "Actualizando..." : "Subiendo...", "info");
    const fd = new FormData();
    fd.append("name", name);
    fd.append("category", category);
    if (file) fd.append("file", file);

    try {
      const res = await fetch(id ? `${API}/${id}` : API, {
        method: id ? "PUT" : "POST",
        body: fd,
      });
      if (res.ok) {
        notify(id ? "Actualizado" : "Subido");
        resetForm();
        load();
      } else {
        const err = await res.json();
        notify(err.message || "Error al procesar", "error");
      }
    } catch (err) {
      notify("Error de red", "error");
    }
  }

  function startEdit(item) {
    if (!item || !elements.form) return;
    elements.editId.value = item.id;
    elements.name.value = item.name;
    elements.category.value = item.category;
    elements.saveBtn.innerText = "Actualizar Documento";
    if (elements.cancelBtn) elements.cancelBtn.classList.remove("hidden");
    elements.file.required = false;
    elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    if (!elements.form) return;
    elements.form.reset();
    elements.editId.value = "";
    elements.saveBtn.innerText = "Subir Documento";
    if (elements.cancelBtn) elements.cancelBtn.classList.add("hidden");
    elements.file.required = true;
  }

  async function del(id) {
    if (!confirm("¿Eliminar este documento?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        notify("Eliminado");
        load();
      } else {
        notify("Error al eliminar", "error");
      }
    } catch (err) {
      notify("Error de red", "error");
    }
  }

  function notify(msg, type = "success") {
    if (typeof showToast === "function") {
      showToast(msg, type);
    } else {
      console.log(`[PlanesTalento] ${type}: ${msg}`);
    }
  }

  return { init, load };
})();

// Registro Global
window.PlanesTalentoAdmin = PlanesTalentoAdmin;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("planesTalentoSection")) {
    PlanesTalentoAdmin.init();
  }
});
