/**
 * SIRH Admin Module - Isolated CRUD logic
 * Path: /administracion/sirh-admin.js
 */

const SirhAdmin = (() => {
  // --- Config & State ---
  const API = "/intranet_CAS/intranet/api/sirh";
  const elements = {
    form: document.getElementById("sirhForm"),
    editId: null,
    name: document.getElementById("sirhName"),
    category: document.getElementById("sirhCategory"),
    file: document.getElementById("sirhFile"),
    saveBtn: document.getElementById("sirhSaveBtn"),
    list: document.getElementById("sirhItemsList"),
    filter: document.getElementById("sirhFilterCategory"),
    cancelBtn: null,
  };

  let items = [];

  // --- Initialization ---
  function init() {
    console.log("SIRHAdmin initialized");

    // Ensure hidden edit ID input exists
    if (!document.getElementById("sirhEditId")) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.id = "sirhEditId";
      elements.form.appendChild(input);
      elements.editId = input;
    } else {
      elements.editId = document.getElementById("sirhEditId");
    }

    // Ensure Cancel Edit button exists
    const cancelContainer = document.getElementById("sirhCancelContainer");
    if (cancelContainer && !document.getElementById("sirhCancelBtn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "sirhCancelBtn";
      btn.className = "btn-secondary hidden";
      btn.style.marginLeft = "0.5rem";
      btn.innerText = "Cancelar Edición";
      cancelContainer.appendChild(btn);
      elements.cancelBtn = btn;
      btn.onclick = resetForm;
    } else {
      elements.cancelBtn = document.getElementById("sirhCancelBtn");
    }

    // Events
    elements.form.onsubmit = handleSubmit;
    elements.filter.onchange = render;

    load();
  }

  // --- Core Actions ---
  async function load() {
    elements.list.innerHTML =
      '<p style="padding:1rem;">Cargando manuales SIRH...</p>';
    try {
      const res = await fetch(API);
      items = await res.json();
      render();
    } catch (e) {
      showNotify("Error al cargar listado", "error");
    }
  }

  function render() {
    const filterVal = elements.filter.value;
    const filtered =
      filterVal === "all"
        ? items
        : items.filter((i) => i.category === filterVal);

    if (filtered.length === 0) {
      elements.list.innerHTML = `
                <div style="padding: 3rem; text-align: center; color: #64748b; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0;">
                    <p>No se encontraron archivos en esta clasificación.</p>
                </div>`;
      return;
    }

    elements.list.innerHTML = "";
    filtered.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";

      // Icon based on type
      let icon =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>';
      const type = (item.type || "PDF").toUpperCase();
      if (["JPG", "PNG", "SVG", "JPEG"].includes(type))
        icon =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
      if (["XLS", "XLSX"].includes(type))
        icon =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path><path d="M8 13h8M8 17h8M8 9h2"></path></svg>';

      card.innerHTML = `
                <div class="news-info">
                    <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.4rem;">
                        <span style="background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">
                            ${item.category}
                        </span>
                        <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">
                            ${type}
                        </span>
                        <span style="font-size: 0.7rem; color: #94a3b8;">${item.size || "N/A"}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 24px; color: #3b82f6;">${icon}</div>
                        <h4 style="margin:0;">${item.name}</h4>
                    </div>
                </div>
                <div class="card-actions">
                    <a href="${item.href}" target="_blank" class="btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">Ver</a>
                    <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                </div>
            `;
      elements.list.appendChild(card);
    });

    // Bind buttons
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
      return showNotify("Selecciona un archivo para subir", "error");

    showNotify(id ? "Actualizando..." : "Subiendo archivo...", "info");

    const fd = new FormData();
    fd.append("name", elements.name.value);
    fd.append("category", elements.category.value);
    if (file) fd.append("file", file);

    try {
      const options = {
        method: id ? "PUT" : "POST",
        body: fd,
      };
      const url = id ? `${API}/${id}` : API;

      const res = await fetch(url, options);
      if (res.ok) {
        showNotify(id ? "Archivo actualizado" : "Archivo subido con éxito");
        resetForm();
        load();
      } else {
        const err = await res.json();
        showNotify(err.message || "Error al procesar", "error");
      }
    } catch (e) {
      showNotify("Error de conexión con el servidor", "error");
    }
  }

  function startEdit(item) {
    if (!item) return;
    elements.editId.value = item.id;
    elements.name.value = item.name;
    elements.category.value = item.category;

    elements.saveBtn.innerText = "Actualizar Archivo";
    if (elements.cancelBtn) elements.cancelBtn.classList.remove("hidden");
    elements.file.required = false;

    elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    elements.form.reset();
    elements.editId.value = "";
    elements.saveBtn.innerText = "Guardar Archivo";
    if (elements.cancelBtn) elements.cancelBtn.classList.add("hidden");
    elements.file.required = true;
  }

  async function del(id) {
    if (!confirm("¿Seguro que deseas eliminar este archivo?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotify("Archivo eliminado");
        load();
      } else {
        showNotify("Error al eliminar", "error");
      }
    } catch (e) {
      showNotify("Error de red", "error");
    }
  }

  function showNotify(msg, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return alert(msg);
    toast.innerText = msg;
    toast.style.backgroundColor =
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6";
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  return { init, load };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("sirhSection")) {
    SirhAdmin.init();
  }
});
