/**
 * SNIF Admin Module
 * Path: /administracion/snif-admin.js
 */

const SnifAdmin = (() => {
  const API = "../api/snif";
  const elements = {
    form: document.getElementById("snifForm"),
    name: document.getElementById("snifName"),
    file: document.getElementById("snifFile"),
    saveBtn: document.getElementById("snifSaveBtn"),
    list: document.getElementById("snifItemsList"),
  };

  let items = [];
  let editId = null;

  function init() {
    if (!elements.form) return;
    console.log("SNIF Admin initialized");

    // Cancel button
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn-secondary hidden";
    cancelBtn.style.marginLeft = "0.5rem";
    cancelBtn.innerText = "Cancelar Edición";
    elements.form.querySelector(".form-actions").appendChild(cancelBtn);

    elements.cancelBtn = cancelBtn;
    cancelBtn.onclick = resetForm;

    elements.form.onsubmit = handleSubmit;
    load();
  }

  async function load() {
    elements.list.innerHTML = "<p>Cargando archivos SNIF...</p>";
    try {
      const res = await fetch(API);
      items = await res.json();
      render();
    } catch (e) {
      console.error(e);
      elements.list.innerHTML = '<p class="error">Error al cargar listado</p>';
    }
  }

  function render() {
    if (items.length === 0) {
      elements.list.innerHTML = "<p>No hay archivos registrados.</p>";
      return;
    }

    elements.list.innerHTML = items
      .map(
        (item) => `
            <div class="news-manage-card">
                <div class="news-info">
                    <h4>${item.name}</h4>
                    <small style="color: #64748b;">${item.type || "Archivo"} - ${item.size || ""}</small>
                </div>
                <div class="card-actions">
                    <a href="${item.href}" target="_blank" class="btn-secondary" style="text-decoration:none;">Ver</a>
                    <button class="btn-secondary" onclick="SnifAdmin.startEdit('${item.id}')">Editar</button>
                    <button class="btn-delete" onclick="SnifAdmin.del('${item.id}')">Eliminar</button>
                </div>
            </div>
        `,
      )
      .join("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const file = elements.file.files[0];
    if (!editId && !file) {
      showNotify("Por favor selecciona un archivo", "error");
      return;
    }

    const fd = new FormData();
    fd.append("name", elements.name.value);
    if (file) fd.append("file", file);

    try {
      showNotify(editId ? "Actualizando..." : "Subiendo...", "info");
      const res = await fetch(editId ? `${API}/${editId}` : API, {
        method: editId ? "PUT" : "POST",
        body: fd,
      });

      if (res.ok) {
        showNotify(editId ? "Actualizado" : "Creado");
        resetForm();
        load();
      } else {
        const data = await res.json();
        showNotify(data.message || "Error", "error");
      }
    } catch (e) {
      showNotify("Error de conexión", "error");
    }
  }

  function startEdit(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    editId = id;
    elements.name.value = item.name;
    elements.file.required = false;
    elements.saveBtn.innerText = "Actualizar Archivo";
    elements.cancelBtn.classList.remove("hidden");
    elements.form.scrollIntoView({ behavior: "smooth" });
  }

  function resetForm() {
    elements.form.reset();
    editId = null;
    elements.file.required = true;
    elements.saveBtn.innerText = "Subir Archivo";
    elements.cancelBtn.classList.add("hidden");
  }

  async function del(id) {
    if (!confirm("¿Estás seguro?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotify("Eliminado");
        load();
      }
    } catch (e) {
      showNotify("Error al eliminar", "error");
    }
  }

  function showNotify(msg, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = msg;
    toast.style.backgroundColor =
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6";
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  return { init, startEdit, del };
})();

document.addEventListener("DOMContentLoaded", SnifAdmin.init);
window.SnifAdmin = SnifAdmin;
