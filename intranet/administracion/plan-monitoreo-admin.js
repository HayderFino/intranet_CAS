/**
 * Plan de Monitoreo del SIGEP - Admin Module
 */

const PlanMonitoreoAdmin = (() => {
  const API = "/intranet_CAS/intranet/api/plan-monitoreo";
  const MAX_SIZE_MB = 20;
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

  function init() {
    elements = {
      form: document.getElementById("planMonitoreoForm"),
      name: document.getElementById("planMonitoreoName"),
      file: document.getElementById("planMonitoreoFile"),
      saveBtn: document.getElementById("planMonitoreoSaveBtn"),
      list: document.getElementById("planMonitoreoItemsList"),
      cancelContainer: document.getElementById("planMonitoreoCancelContainer"),
      section: document.getElementById("planMonitoreoSection"),
    };

    if (!elements.form || !elements.list) return;

    // Input oculto para ID (si no existe)
    let editIdInput = document.getElementById("planMonitoreoEditId");
    if (!editIdInput) {
      editIdInput = document.createElement("input");
      editIdInput.type = "hidden";
      editIdInput.id = "planMonitoreoEditId";
      elements.form.appendChild(editIdInput);
    }
    elements.editId = editIdInput;

    // Botón Cancelar (si no existe)
    let cancelBtn = document.getElementById("planMonitoreoCancelBtn");
    if (elements.cancelContainer && !cancelBtn) {
      cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.id = "planMonitoreoCancelBtn";
      cancelBtn.className = "btn-secondary hidden";
      cancelBtn.style.marginLeft = "0.5rem";
      cancelBtn.innerText = "Cancelar Edición";
      elements.cancelContainer.appendChild(cancelBtn);
      cancelBtn.onclick = resetForm;
    }
    elements.cancelBtn = cancelBtn;

    elements.form.onsubmit = handleSubmit;
    load();
  }

  async function load() {
    if (!elements.list) {
      elements.list = document.getElementById("planMonitoreoItemsList");
      if (!elements.list) return;
    }

    elements.list.innerHTML =
      '<p style="padding:1rem;">Cargando archivos...</p>';
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

    if (items.length === 0) {
      elements.list.innerHTML =
        '<p style="padding:1rem;">No hay archivos registrados.</p>';
      return;
    }

    elements.list.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";

      card.innerHTML = `
                <div class="news-info">
                    <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
                        <span style="background:#e2e8f0; color:#475569; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">${(item.type || "FILE").toUpperCase()}</span>
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

    if (!name) return notify("El nombre es obligatorio", "info");
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
    elements.saveBtn.innerText = "Actualizar Archivo";
    if (elements.cancelBtn) elements.cancelBtn.classList.remove("hidden");
    elements.file.required = false;
    elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    if (!elements.form) return;
    elements.form.reset();
    elements.editId.value = "";
    elements.saveBtn.innerText = "Subir Archivo";
    if (elements.cancelBtn) elements.cancelBtn.classList.add("hidden");
    elements.file.required = true;
  }

  async function del(id) {
    if (id === "sigep_default")
      return notify(
        "El archivo principal no se puede eliminar por seguridad.",
        "info",
      );
    if (!confirm("¿Eliminar este archivo?")) return;
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
      console.log(`[PlanMonitoreo] ${type}: ${msg}`);
    }
  }

  return { init, load };
})();

// Registro Global
window.PlanMonitoreoAdmin = PlanMonitoreoAdmin;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("planMonitoreoSection")) {
    PlanMonitoreoAdmin.init();
  }
});
