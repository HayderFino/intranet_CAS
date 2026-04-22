/**
 * Provisión de Empleos - Admin Module
 */

window.ProvisionEmpleosAdmin = (() => {
  function resolveApiUrl() {
    const marker = "/administracion/";
    const path = window.location.pathname || "";
    const idx = path.lastIndexOf(marker);

    if (idx !== -1) {
      return `${path.substring(0, idx)}/api.php?route=provision-empleos`;
    }

    return "../api.php?route=provision-empleos";
  }

  const API = resolveApiUrl();
  let items = [];

  function getElements() {
    return {
      form: document.getElementById("provisionEmpleosForm"),
      list: document.getElementById("provisionEmpleosItemsList"),
      section: document.getElementById("provisionEmpleosSection"),
      saveBtn: document.getElementById("provisionEmpleosSaveBtn"),
      file: document.getElementById("provisionEmpleosFile"),
      cancelContainer: document.getElementById(
        "provisionEmpleosCancelContainer",
      ),
    };
  }

  async function load() {
    const els = getElements();
    console.log("[ProvisionEmpleos] Cargando listado...");

    if (!els.list) return;

    els.list.innerHTML = '<p style="padding:1rem;">Cargando listado...</p>';
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      items = await res.json();
      render();
    } catch (e) {
      console.error("[ProvisionEmpleos] Error:", e);
      els.list.innerHTML = `<p style="padding:1rem; color:red;">Error de conexión: ${e.message}</p>`;
    }
  }

  function render() {
    const els = getElements();
    if (!els.list) return;

    if (items.length === 0) {
      els.list.innerHTML =
        '<p style="padding:1.5rem; text-align:center; color:#64748b;">No hay documentos registrados.</p>';
      return;
    }

    els.list.innerHTML = "";
    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `
                <div class="news-info">
                    <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
                        <span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;">
                            ${item.type || "PROVISIÓN"}
                        </span>
                        <span style="color:#64748b; font-size:0.75rem;">${item.date || ""}</span>
                    </div>
                    <h4 style="margin:0; font-size:1rem; color:#1e293b;">${item.title}</h4>
                    <p style="font-size:0.85rem; color:#475569; margin:5px 0 0 0;">${item.description || ""}</p>
                </div>
                <div class="card-actions" style="flex-shrink:0;">
                    <a href="${item.href}" target="_blank" class="btn-secondary" style="text-decoration:none; padding: 0.5rem 0.8rem; font-size: 0.8rem;">Descargar</a>
                    <button class="btn-secondary btn-edit" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;" onclick="ProvisionEmpleosAdmin.editByBtn('${item.id}')">Editar</button>
                    <button class="btn-delete" style="padding: 0.5rem 0.8rem; font-size: 0.8rem;" onclick="ProvisionEmpleosAdmin.deleteByBtn('${item.id}')">Eliminar</button>
                </div>`;
      els.list.appendChild(card);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const els = getElements();
    const editIdInput = document.getElementById("provisionEmpleosEditId");
    const id = editIdInput ? editIdInput.value : "";
    const title = document.getElementById("provisionEmpleosTitle").value.trim();
    const type = document.getElementById("provisionEmpleosType").value.trim();
    const date = document.getElementById("provisionEmpleosDate").value.trim();
    const desc = document
      .getElementById("provisionEmpleosDescription")
      .value.trim();
    const fileInput = els.file.files[0];

    if (!title) return alert("El título es obligatorio");
    if (!id && !fileInput) return alert("Selecciona un archivo");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("type", type);
    fd.append("date", date);
    fd.append("description", desc);
    if (fileInput) fd.append("file", fileInput);

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

    document.getElementById("provisionEmpleosTitle").value = item.title;
    document.getElementById("provisionEmpleosType").value = item.type || "";
    document.getElementById("provisionEmpleosDate").value = item.date || "";
    document.getElementById("provisionEmpleosDescription").value =
      item.description || "";

    let editIdInput = document.getElementById("provisionEmpleosEditId");
    if (!editIdInput) {
      editIdInput = document.createElement("input");
      editIdInput.type = "hidden";
      editIdInput.id = "provisionEmpleosEditId";
      getElements().form.appendChild(editIdInput);
    }
    editIdInput.value = item.id;

    const els = getElements();
    els.saveBtn.innerText = "Actualizar Documento";
    els.file.required = false;

    let cancelBtn = document.getElementById("provisionEmpleosCancelBtn");
    if (!cancelBtn && els.cancelContainer) {
      cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.id = "provisionEmpleosCancelBtn";
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
    const editId = document.getElementById("provisionEmpleosEditId");
    if (editId) editId.value = "";
    els.saveBtn.innerText = "Subir Documento";
    els.file.required = true;

    const cancelBtn = document.getElementById("provisionEmpleosCancelBtn");
    if (cancelBtn) cancelBtn.classList.add("hidden");
  }

  function init() {
    console.log("[ProvisionEmpleos] Inicializando...");
    const els = getElements();
    if (els.form) els.form.onsubmit = handleSubmit;
    if (els.section) load();
  }

  return { init, load, editByBtn, deleteByBtn };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("provisionEmpleosSection")) {
    ProvisionEmpleosAdmin.init();
  }
});
