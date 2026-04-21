/**
 * Revision Red Admin Module - Isolated CRUD logic
 * Module: Revision de red primer nivel Sedes Regionales de Apoyo
 * Path: /administracion/revision-red-admin.js
 */

const RevisionRedAdmin = (() => {
  // --- Config & State ---
  const API = "/intranet_CAS/intranet/api/revision-red";
  const elements = {
    form: document.getElementById("revisionRedForm"),
    editId: null,
    name: document.getElementById("revisionRedName"),
    file: document.getElementById("revisionRedFile"),
    saveBtn: document.getElementById("revisionRedSaveBtn"),
    list: document.getElementById("revisionRedItemsList"),
    cancelBtn: null,
  };

  let items = [];

  // --- Initialization ---
  function init() {
    console.log("RevisionRedAdmin initialized");

    // Ensure hidden edit ID input exists
    if (!document.getElementById("revisionRedEditId")) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.id = "revisionRedEditId";
      elements.form.appendChild(input);
      elements.editId = input;
    } else {
      elements.editId = document.getElementById("revisionRedEditId");
    }

    // Ensure Cancel Edit button exists
    const cancelContainer = document.getElementById(
      "revisionRedCancelContainer",
    );
    if (cancelContainer && !document.getElementById("revisionRedCancelBtn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "revisionRedCancelBtn";
      btn.className = "btn-secondary hidden";
      btn.style.marginLeft = "0.5rem";
      btn.innerText = "Cancelar Edición";
      cancelContainer.appendChild(btn);
      elements.cancelBtn = btn;
      btn.onclick = resetForm;
    } else {
      elements.cancelBtn = document.getElementById("revisionRedCancelBtn");
    }

    elements.form.onsubmit = handleSubmit;
    load();
  }

  // --- Core Actions ---
  async function load() {
    elements.list.innerHTML =
      '<p style="padding:1rem; color:#64748b;">Cargando archivos...</p>';
    try {
      const res = await fetch(API);
      items = await res.json();
      render();
    } catch (e) {
      showNotify("Error al cargar el listado", "error");
      elements.list.innerHTML =
        '<p style="padding:1rem; color:#ef4444;">Error de conexión con el servidor.</p>';
    }
  }

  function render() {
    if (items.length === 0) {
      elements.list.innerHTML = `
                <div style="padding: 3rem; text-align: center; color: #64748b; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0;">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="#cbd5e1" style="margin-bottom:1rem;"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                    <p>No hay archivos cargados aún.</p>
                    <p style="font-size:0.85rem; margin-top:0.5rem;">Usa el formulario de arriba para subir el primer archivo.</p>
                </div>`;
      return;
    }

    elements.list.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";

      // Icon based on type
      const type = (item.type || "PDF").toUpperCase();
      let iconColor = "#ef4444"; // PDF red
      if (["DOC", "DOCX"].includes(type)) iconColor = "#2563eb";
      if (["XLS", "XLSX"].includes(type)) iconColor = "#16a34a";
      if (["PPT", "PPTX"].includes(type)) iconColor = "#d97706";
      if (["JPG", "PNG", "SVG", "JPEG"].includes(type)) iconColor = "#7c3aed";
      if (["ZIP"].includes(type)) iconColor = "#0891b2";

      card.innerHTML = `
                <div class="news-info">
                    <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                        <span style="background:${iconColor}20; color:${iconColor}; padding:3px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; letter-spacing:0.05em;">${type}</span>
                        <span style="font-size: 0.75rem; color: #94a3b8;">${item.size || "N/A"}</span>
                    </div>
                    <h4 style="margin:0; font-size:0.95rem; color:#1e293b;">${item.name}</h4>
                </div>
                <div class="card-actions">
                    <a href="${item.href}" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem; justify-content:center;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5v-2z"/></svg>
                        Descargar
                    </a>
                    <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                </div>
            `;
      elements.list.appendChild(card);
    });

    // Bind action buttons
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

    if (!id && !file)
      return showNotify("Debes seleccionar un archivo para subir", "error");
    if (!elements.name.value.trim())
      return showNotify("El nombre del archivo es obligatorio", "error");

    showNotify(id ? "Actualizando archivo..." : "Subiendo archivo...", "info");

    const fd = new FormData();
    fd.append("name", elements.name.value.trim());
    if (file) fd.append("file", file);

    try {
      const res = await fetch(id ? `${API}/${id}` : API, {
        method: id ? "PUT" : "POST",
        body: fd,
      });

      if (res.ok) {
        showNotify(
          id ? "Archivo actualizado correctamente" : "Archivo subido con éxito",
        );
        resetForm();
        load();
      } else {
        const err = await res.json();
        showNotify(err.message || "Error al procesar el archivo", "error");
      }
    } catch (e) {
      showNotify("Error de conexión con el servidor", "error");
    }
  }

  function startEdit(item) {
    if (!item) return;
    elements.editId.value = item.id;
    elements.name.value = item.name;
    elements.saveBtn.innerText = "Actualizar Archivo";
    if (elements.cancelBtn) elements.cancelBtn.classList.remove("hidden");
    elements.file.required = false;
    elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    elements.form.reset();
    elements.editId.value = "";
    elements.saveBtn.innerText = "Subir Archivo";
    if (elements.cancelBtn) elements.cancelBtn.classList.add("hidden");
    elements.file.required = true;
  }

  async function del(id) {
    if (
      !confirm(
        "¿Seguro que deseas eliminar este archivo? Esta acción no se puede deshacer.",
      )
    )
      return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotify("Archivo eliminado correctamente");
        load();
      } else {
        showNotify("Error al eliminar el archivo", "error");
      }
    } catch (e) {
      showNotify("Error de red al intentar eliminar", "error");
    }
  }

  function showNotify(msg, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return alert(msg);
    toast.innerText = msg;
    toast.style.backgroundColor =
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6";
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3500);
  }

  return { init, load };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("revisionRedSection")) {
    RevisionRedAdmin.init();
  }
});
