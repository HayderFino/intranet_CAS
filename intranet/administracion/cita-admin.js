/**
 * CITA Admin Module - Isolated CRUD logic
 * Path: /administracion/cita-admin.js
 */

const CitaAdmin = (() => {
  // --- Config & State ---
  const API = "/intranet_CAS/intranet/api/cita";
  const elements = {
    form: document.getElementById("citaForm"),
    editId: null, // We'll create this if it doesn't exist
    name: document.getElementById("citaName"),
    category: document.getElementById("citaCategory"),
    file: document.getElementById("citaFile"),
    saveBtn: document.getElementById("citaSaveBtn"),
    list: document.getElementById("citaItemsList"),
    filter: document.getElementById("citaFilterCategory"),
    cancelBtn: null,
  };

  let items = [];

  // --- Initialization ---
  function init() {
    console.log("CITAdmin initialized");

    // Ensure hidden edit ID input exists
    if (!document.getElementById("citaEditId")) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.id = "citaEditId";
      elements.form.appendChild(input);
      elements.editId = input;
    } else {
      elements.editId = document.getElementById("citaEditId");
    }

    // Ensure Cancel Edit button exists
    if (!document.getElementById("citaCancelBtn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "citaCancelBtn";
      btn.className = "btn-secondary hidden";
      btn.style.marginLeft = "0.5rem";
      btn.innerText = "Cancelar Edición";
      elements.form.querySelector(".form-actions").appendChild(btn);
      elements.cancelBtn = btn;
      btn.onclick = resetForm;
    } else {
      elements.cancelBtn = document.getElementById("citaCancelBtn");
    }

    // Events
    elements.form.onsubmit = handleSubmit;
    elements.filter.onchange = render;

    load();
  }

  // --- Core Actions ---
  async function load() {
    elements.list.innerHTML =
      '<p style="padding:1rem;">Cargando manuales CITA...</p>';
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
                    <p>No se encontraron archivos en esta categoría.</p>
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

    try {
      let fileUrl = "";
      
      // Step 1: Upload file if selected
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch(`${API}/upload`, {
          method: "POST",
          body: fd,
        });
        if (!upRes.ok) throw new Error("Error en la subida del archivo");
        const upData = await upRes.json();
        fileUrl = upData.fileUrl;
      }

      // Step 2: Save metadata
      const payload = {
        name: elements.name.value,
        category: elements.category.value,
      };
      if (fileUrl) payload.href = fileUrl;

      const options = {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };
      const url = id ? `${API}/${id}` : API;

      const res = await fetch(url, options);
      if (res.ok) {
        showNotify(id ? "Manual actualizado" : "Manual subido con éxito");
        resetForm();
        load();
      } else {
        const err = await res.json();
        showNotify(err.error || err.message || "Error al procesar", "error");
      }
    } catch (e) {
      showNotify(e.message || "Error de conexión con el servidor", "error");
    }
  }

  function startEdit(item) {
    if (!item) return;
    elements.editId.value = item.id;
    elements.name.value = item.name;
    // Search category name in category mapping (it might be encoded or exact)
    // We set it exactly as it is since we updated our select values
    elements.category.value = item.category;

    elements.saveBtn.innerText = "Actualizar Manual";
    elements.cancelBtn.classList.remove("hidden");
    elements.file.required = false; // Not required for update

    elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    elements.form.reset();
    elements.editId.value = "";
    elements.saveBtn.innerText = "Guardar Manual";
    elements.cancelBtn.classList.add("hidden");
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

// Auto-init for isolation
document.addEventListener("DOMContentLoaded", () => {
  // We wait a bit to ensure elements are present if they are dynamic (though they aren't here)
  if (document.getElementById("citaSection")) {
    CitaAdmin.init();
  }
});
