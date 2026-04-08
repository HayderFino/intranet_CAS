/**
 * Convocatorias - Admin Module (v3 con máxima depuración)
 */

window.ConvocatoriasAdmin = (() => {
  const API = "/CAS/intranet_CAS/intranet/api/convocatorias";
  let items = [];

  function getElements() {
    return {
      form: document.getElementById("convocatoriasForm"),
      list: document.getElementById("convocatoriasItemsList"),
      section: document.getElementById("convocatoriasSection"),
      saveBtn: document.getElementById("convocatoriasSaveBtn"),
      file: document.getElementById("convocatoriasFile"),
    };
  }

  async function load() {
    const els = getElements();
    console.log("[Convocatorias] Cargando listado...");

    if (!els.list) {
      console.error("[Convocatorias] Elemento de lista no encontrado");
      return;
    }

    els.list.innerHTML =
      '<p style="padding:1rem;">Cargando convocatoria...</p>';
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      items = await res.json();
      console.log("[Convocatorias] Data recibida:", items.length);
      render();
    } catch (e) {
      console.error("[Convocatorias] Error:", e);
      els.list.innerHTML = `<p style="padding:1rem; color:red;">Error de conexión: ${e.message}</p>`;
    }
  }

  function render() {
    const els = getElements();
    if (!els.list) return;

    console.log("[Convocatorias] Renderizando UI. Total items:", items.length);
    if (items.length === 0) {
      els.list.innerHTML =
        '<p style="padding:1.5rem; text-align:center; color:#64748b;">No hay convocatorias registradas.</p>';
      return;
    }

    els.list.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `
                <div class="news-info">
                    <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
                        <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;">
                            ${item.type || "DOCUMENTO"}
                        </span>
                        <span style="color:#64748b; font-size:0.75rem;">${item.date || ""}</span>
                    </div>
                    <h4 style="margin:0; font-size:1rem; color:#1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</h4>
                    <p style="font-size:0.85rem; color:#475569; margin:5px 0 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.description || ""}</p>
                </div>
                <div class="card-actions" style="flex-shrink: 0; display: flex; gap: 0.5rem; align-items: center;">
                    <a href="${item.href}" target="_blank" class="btn-secondary" style="text-decoration:none; padding: 0.5rem 0.8rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;">Descargar</a>
                    <button class="btn-secondary btn-edit" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;" onclick="ConvocatoriasAdmin.editByBtn('${item.id}')">Editar</button>
                    <button class="btn-delete" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;" onclick="ConvocatoriasAdmin.deleteByBtn('${item.id}')">Eliminar</button>
                </div>`;
      els.list.appendChild(card);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const els = getElements();
    const editIdInput = document.getElementById("convocatoriasEditId");
    const id = editIdInput ? editIdInput.value : "";
    const title = document.getElementById("convocatoriasTitle").value.trim();
    const type = document.getElementById("convocatoriasType").value.trim();
    const date = document.getElementById("convocatoriasDate").value.trim();
    const desc = document
      .getElementById("convocatoriasDescription")
      .value.trim();
    const file = els.file.files[0];

    if (!title) return alert("El título es obligatorio");
    if (!id && !file) return alert("Selecciona un archivo");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("type", type);
    fd.append("date", date);
    fd.append("description", desc);
    if (file) fd.append("file", file);

    try {
      const res = await fetch(id ? `${API}/${id}` : API, {
        method: id ? "PUT" : "POST",
        body: fd,
      });
      if (res.ok) {
        alert("¡Éxito!");
        resetForm();
        load();
      } else {
        const err = await res.json();
        alert("Error: " + (err.message || "Error desconocido"));
      }
    } catch (err) {
      alert("Error de red");
    }
  }

  function editByBtn(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    document.getElementById("convocatoriasTitle").value = item.title;
    document.getElementById("convocatoriasType").value = item.type || "";
    document.getElementById("convocatoriasDate").value = item.date || "";
    document.getElementById("convocatoriasDescription").value =
      item.description || "";

    const editIdInput = document.getElementById("convocatoriasEditId");
    if (editIdInput) editByInput(item.id);
    else {
      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.id = "convocatoriasEditId";
      hidden.value = item.id;
      getElements().form.appendChild(hidden);
    }

    getElements().saveBtn.innerText = "Actualizar Convocatoria";
    getElements().file.required = false;
    getElements().form.scrollIntoView({ behavior: "smooth" });
  }

  function editByInput(id) {
    document.getElementById("convocatoriasEditId").value = id;
  }

  async function deleteByBtn(id) {
    if (!confirm("¿Eliminar esta convocatoria?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        load();
      } else alert("Error al eliminar");
    } catch (e) {
      alert("Error de red");
    }
  }

  function resetForm() {
    const els = getElements();
    els.form.reset();
    const editId = document.getElementById("convocatoriasEditId");
    if (editId) editId.value = "";
    els.saveBtn.innerText = "Subir Documento";
    els.file.required = true;
  }

  function init() {
    console.log("[Convocatorias] Iniciando Admin...");
    const els = getElements();
    if (els.form) els.form.onsubmit = handleSubmit;
    load();
  }

  return { init, load, editByBtn, deleteByBtn };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("convocatoriasSection")) {
    ConvocatoriasAdmin.init();
  }
});
