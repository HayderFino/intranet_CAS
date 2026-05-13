/**
 * SNIF Admin Module
 * Path: /administracion/snif-admin.js
 */

const SnifAdmin = (() => {
  const API = "../api/snif";
  const elements = {
    form: document.getElementById("snifForm"),
    name: document.getElementById("snifName"),
    category: document.getElementById("snifCategory"),
    file: document.getElementById("snifFile"),
    saveBtn: document.getElementById("snifSaveBtn"),
    list: document.getElementById("snifItemsList"),
    filter: document.getElementById("snifFilterCategory"),
  };

  let items = [];
  let editId = null;

  function init() {
    if (!elements.form) return;
    console.log("SNIF Admin initialized");

    // Cancel button
    const cancelContainer = document.getElementById("snifCancelContainer");
    if (cancelContainer) {
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "btn-secondary hidden";
      cancelBtn.style.marginLeft = "0.5rem";
      cancelBtn.innerText = "Cancelar Edición";
      cancelContainer.appendChild(cancelBtn);
      elements.cancelBtn = cancelBtn;
      cancelBtn.onclick = resetForm;
    }

    elements.form.onsubmit = handleSubmit;
    if (elements.filter) {
      elements.filter.onchange = render;
    }

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
    const filterVal = elements.filter ? elements.filter.value : "all";
    
    let filtered = items;
    if (filterVal !== "all") {
      filtered = items.filter(i => 
        (i.category || "").trim().toLowerCase() === filterVal.trim().toLowerCase()
      );
    }

    if (filtered.length === 0) {
      elements.list.innerHTML = "<p>No hay archivos en esta categoría.</p>";
      return;
    }

    elements.list.innerHTML = filtered
      .map(
        (item) => `
            <div class="news-manage-card">
                <div class="news-info">
                    <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.5rem;">
                        <span style="background:#10b98120; color:#10b981; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">${item.category || "General"}</span>
                        <small style="color: #64748b;">${(item.type || "PDF").toUpperCase()} - ${item.size || ""}</small>
                    </div>
                    <h4>${item.name}</h4>
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

    try {
      showNotify(editId ? "Actualizando..." : "Subiendo...", "info");

      let fileUrl = "";
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

      const payload = {
        name: elements.name.value,
        category: elements.category.value
      };
      if (fileUrl) payload.href = fileUrl;

      const res = await fetch(editId ? `${API}/${editId}` : API, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotify(editId ? "Actualizado" : "Creado");
        resetForm();
        load();
      } else {
        const data = await res.json();
        showNotify(data.error || data.message || "Error", "error");
      }
    } catch (e) {
      showNotify(e.message || "Error de conexión", "error");
    }
  }

  function startEdit(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    editId = id;
    elements.name.value = item.name;
    elements.category.value = item.category || "Documentación y Formatos";
    elements.file.required = false;
    elements.saveBtn.innerText = "Actualizar Archivo";
    if (elements.cancelBtn) elements.cancelBtn.classList.remove("hidden");
    elements.form.scrollIntoView({ behavior: "smooth" });
  }

  function resetForm() {
    elements.form.reset();
    editId = null;
    elements.file.required = true;
    elements.saveBtn.innerText = "Subir Archivo";
    if (elements.cancelBtn) elements.cancelBtn.classList.add("hidden");
  }

  async function del(id) {
    if (!confirm("¿Estás seguro de eliminar este archivo?")) return;
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
