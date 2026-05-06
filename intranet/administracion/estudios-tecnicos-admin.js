/**
 * Estudios Técnicos - Admin Module
 */

window.EstudiosTecnicosAdmin = (() => {
  const API = "../api/estudios-tecnicos";
  let items = [];

  function getElements() {
    return {
      form: document.getElementById("estudiosTecnicosForm"),
      list: document.getElementById("estudiosTecnicosItemsList"),
      section: document.getElementById("estudiosTecnicosSection"),
      saveBtn: document.getElementById("estudiosTecnicosSaveBtn"),
      file: document.getElementById("estudiosTecnicosFile"),
      cancelContainer: document.getElementById(
        "estudiosTecnicosCancelContainer",
      ),
    };
  }

  async function load() {
    const els = getElements();
    console.log("[EstudiosTecnicos] Cargando listado...");

    if (!els.list) return;

    els.list.innerHTML = '<p style="padding:1rem;">Cargando listado...</p>';
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      items = await res.json();
      render();
    } catch (e) {
      console.error("[EstudiosTecnicos] Error:", e);
      els.list.innerHTML = `<p style="padding:1rem; color:red;">Error de conexión: ${e.message}</p>`;
    }
  }

  function render() {
    const els = getElements();
    if (!els.list) return;

    if (items.length === 0) {
      els.list.innerHTML =
        '<p style="padding:1.5rem; text-align:center; col      8b;">No hay estudios técnicos registrados.</p>';
      return;
    }

    els.list.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `
                <div class="news-info">
                    <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
                        <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;">
                            ${item.type || "ESTUDIO TÉCNICO"}
                        </span>
                        <span style="color:#64748b; font-size:0.75rem;">${item.date || ""}</span>
                    </div>
                    <h4 style="margin:0; font-size:1rem; color:#1e293b;">${item.title}</h4>
                    <p style="font-size:0.85rem; color:#475569; margin:5px 0 0 0;">${item.description || ""}</p>
                </div>
                <div class="card-actions" style="flex-shrink:0;">
                    <a href="${item.href}" target="_blank" class="btn-secondary" style="text-decoration:none; padding: 0.5rem 0.8rem; font-size: 0.8rem;">Descargar</a>
                    <button class="btn-secondary btn-edit" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;" onclick="EstudiosTecnicosAdmin.editByBtn('${item.id}')">Editar</button>
                    <button class="btn-delete" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;" onclick="EstudiosTecnicosAdmin.deleteByBtn('${item.id}')">Eliminar</button>
                </div>`;
      els.list.appendChild(card);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const els = getElements();
    const editIdInput = document.getElementById("estudiosTecnicosEditId");
    const id = editIdInput ? editIdInput.value : "";
    const title = document.getElementById("estudiosTecnicosTitle").value.trim();
    const type = document.getElementById("estudiosTecnicosType").value.trim();
    const date = document.getElementById("estudiosTecnicosDate").value.trim();
    const desc = document
      .getElementById("estudiosTecnicosDescription")
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
        alert("¡Documento guardado con éxito!");
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

    document.getElementById("estudiosTecnicosTitle").value = item.title;
    document.getElementById("estudiosTecnicosType").value = item.type || "";
    document.getElementById("estudiosTecnicosDate").value = item.date || "";
    document.getElementById("estudiosTecnicosDescription").value =
      item.description || "";

    let editIdInput = document.getElementById("estudiosTecnicosEditId");
    if (!editIdInput) {
      editIdInput = document.createElement("input");
      editIdInput.type = "hidden";
      editIdInput.id = "estudiosTecnicosEditId";
      getElements().form.appendChild(editIdInput);
    }
    editIdInput.value = item.id;

    const els = getElements();
    els.saveBtn.innerText = "Actualizar Documento";
    els.file.required = false;

    // Mostrar botón cancelar si no existe
    let cancelBtn = document.getElementById("estudiosTecnicosCancelBtn");
    if (!cancelBtn && els.cancelContainer) {
      cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.id = "estudiosTecnicosCancelBtn";
      cancelBtn.className = "btn-secondary";
      cancelBtn.style.marginLeft = "0.5rem";
      cancelBtn.innerText = "Cancelar";
      cancelBtn.onclick = resetForm;
      els.cancelContainer.appendChild(cancelBtn);
    } else if (cancelBtn) {
      cancelBtn.classList.remove("hidden");
    }

    els.form.scrollIntoView({ behavior: "smooth" });
  }

  async function deleteByBtn(id) {
    if (!confirm("¿Eliminar este documento definitivamente?")) return;
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
    const editId = document.getElementById("estudiosTecnicosEditId");
    if (editId) editId.value = "";
    els.saveBtn.innerText = "Subir Documento";
    els.file.required = true;

    const cancelBtn = document.getElementById("estudiosTecnicosCancelBtn");
    if (cancelBtn) cancelBtn.classList.add("hidden");
  }

  function init() {
    console.log("[EstudiosTecnicos] Inicializando...");
    const els = getElements();
    if (els.form) els.form.onsubmit = handleSubmit;
    if (els.section) load();
  }

  return { init, load, editByBtn, deleteByBtn };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("estudiosTecnicosSection")) {
    EstudiosTecnicosAdmin.init();
  }
});
