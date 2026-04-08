/**
 * Manual de Funciones y Competencias - Admin Module
 */

const ManualFuncionesAdmin = (() => {
  const API = "/CAS/intranet_CAS/intranet/api/manual-funciones";
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
    // Inicializar elementos aquí para asegurar que el DOM esté listo
    elements = {
      form: document.getElementById("manualFuncionesForm"),
      name: document.getElementById("manualFuncionesName"),
      file: document.getElementById("manualFuncionesFile"),
      saveBtn: document.getElementById("manualFuncionesSaveBtn"),
      list: document.getElementById("manualFuncionesItemsList"),
      cancelContainer: document.getElementById(
        "manualFuncionesCancelContainer",
      ),
    };

    if (!elements.form || !elements.list) {
      console.error(
        "[ManualFuncionesAdmin] Elementos no encontrados en el DOM",
      );
      return;
    }

    // Input oculto para ID (si no existe)
    let editIdInput = document.getElementById("manualFuncionesEditId");
    if (!editIdInput) {
      editIdInput = document.createElement("input");
      editIdInput.type = "hidden";
      editIdInput.id = "manualFuncionesEditId";
      elements.form.appendChild(editIdInput);
    }
    elements.editId = editIdInput;

    // Botón Cancelar (si no existe)
    let cancelBtn = document.getElementById("manualFuncionesCancelBtn");
    if (elements.cancelContainer && !cancelBtn) {
      cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.id = "manualFuncionesCancelBtn";
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
    // Aseguramos que elements esté poblado si load es llamado antes de init de forma externa
    if (!elements.list) {
      elements.list = document.getElementById("manualFuncionesItemsList");
      if (!elements.list) return;
    }

    elements.list.innerHTML =
      '<p style="padding:1rem;">Cargando manuales...</p>';
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Error en respuesta");
      items = await res.json();
      render();
    } catch (e) {
      console.error(e);
      elements.list.innerHTML =
        '<p style="padding:1rem; color:red;">Error al cargar el listado.</p>';
      showNotify("Error al cargar listado", "error");
    }
  }

  function render() {
    if (!elements.list) return;

    if (items.length === 0) {
      elements.list.innerHTML =
        '<p style="padding:1rem;">No hay manuales registrados.</p>';
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

    if (!name) return showNotify("El nombre es obligatorio", "info");
    if (!id && !file) return showNotify("Selecciona un archivo", "info");

    if (file) {
      const ext = "." + file.name.split(".").pop().toLowerCase();
      if (FORBIDDEN_EXTS.includes(ext))
        return showNotify("Tipo de archivo prohibido", "error");
      if (file.size > MAX_SIZE_BYTES)
        return showNotify(`Supera el límite de ${MAX_SIZE_MB}MB`, "error");
    }

    showNotify(id ? "Actualizando..." : "Subiendo...", "info");
    const fd = new FormData();
    fd.append("name", name);
    if (file) fd.append("file", file);

    try {
      const res = await fetch(id ? `${API}/${id}` : API, {
        method: id ? "PUT" : "POST",
        body: fd,
      });
      if (res.ok) {
        showNotify(id ? "Actualizado" : "Subido");
        resetForm();
        load();
      } else {
        const err = await res.json();
        showNotify(err.message || "Error al procesar", "error");
      }
    } catch (err) {
      showNotify("Error de red", "error");
    }
  }

  function startEdit(item) {
    if (!item || !elements.form) return;
    elements.editId.value = item.id;
    elements.name.value = item.name;
    elements.saveBtn.innerText = "Actualizar Manual";
    if (elements.cancelBtn) elements.cancelBtn.classList.remove("hidden");
    elements.file.required = false;
    elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    if (!elements.form) return;
    elements.form.reset();
    elements.editId.value = "";
    elements.saveBtn.innerText = "Subir Manual";
    if (elements.cancelBtn) elements.cancelBtn.classList.add("hidden");
    elements.file.required = true;
  }

  async function del(id) {
    if (!confirm("¿Eliminar este manual?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotify("Eliminado");
        load();
      } else {
        showNotify("Error al eliminar", "error");
      }
    } catch (err) {
      showNotify("Error de red", "error");
    }
  }

  function showNotify(msg, type = "success") {
    if (typeof showToast === "function") {
      showToast(msg, type);
    } else {
      console.log(`[ManualFunciones] ${type}: ${msg}`);
      const t = document.getElementById("toast");
      if (t) {
        t.innerText = msg;
        t.style.backgroundColor =
          type === "success"
            ? "#10b981"
            : type === "error"
              ? "#ef4444"
              : "#3b82f6";
        t.classList.remove("hidden");
        setTimeout(() => t.classList.add("hidden"), 3000);
      }
    }
  }

  return { init, load };
})();

// Registro Global
window.ManualFuncionesAdmin = ManualFuncionesAdmin;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("manualFuncionesSection")) {
    ManualFuncionesAdmin.init();
  }
});
