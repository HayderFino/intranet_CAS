// Compute API base dynamically (same logic as admin-logic.js)
const _informeApiBase = (() => {
  const path = window.location.pathname;
  const adminIdx = path.indexOf('/administracion/');
  if (adminIdx !== -1) return path.substring(0, adminIdx) + '/api';
  const adminShortIdx = path.indexOf('/administracion');
  if (adminShortIdx !== -1) return path.substring(0, adminShortIdx) + '/api';
  return '../api';
})();

const InformeGestionAdmin = {
  get API_URL() { return _informeApiBase + '/informe-gestion'; },

  load: async function () {
    const list = document.getElementById("informeGestionList");
    if (!list) return;

    list.innerHTML = '<p style="padding:1rem;color:#64748b;">Cargando informes...</p>';

    try {
      const res = await fetch(this.API_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const items = await res.json();

      if (!Array.isArray(items) || items.length === 0) {
        list.innerHTML = '<p style="padding:1rem;color:#64748b;">No hay informes registrados.</p>';
        return;
      }

      list.innerHTML = items.map((item) => `
        <div class="news-manage-card">
          <div class="news-info">
            <h4>${item.title || 'Sin título'}</h4>
            <p style="font-size:0.85rem;color:#64748b;margin-top:0.3rem;">${item.description || ''}</p>
            <a href="${item.pdfUrl}" target="_blank" class="admin-file-badge" style="margin-top:0.5rem;display:inline-flex;">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;margin-right:4px;"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              ${decodeURIComponent((item.pdfUrl || '').split('/').pop())}
            </a>
          </div>
          <div class="card-actions">
            <button class="btn-secondary btn-edit" onclick="InformeGestionAdmin.edit('${item.id}')">Editar</button>
            <button class="btn-delete" onclick="InformeGestionAdmin.delete('${item.id}')">Eliminar</button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error('[InformeGestion] load error:', err);
      list.innerHTML = '<p style="color:red;padding:1rem;">Error al cargar informes: ' + err.message + '</p>';
    }
  },

  save: async function (e) {
    e.preventDefault();
    const id = document.getElementById("informeGestionId").value.trim();
    const title = document.getElementById("informeGestionTitle").value.trim();
    const description = document.getElementById("informeGestionDescription").value.trim();
    const fileInput = document.getElementById("informeGestionFile");
    const file = fileInput.files[0];

    if (!title) {
      showToast("El Título del Informe es obligatorio", "error");
      return;
    }
    if (!id && !file) {
      showToast("Por favor selecciona un archivo PDF", "error");
      return;
    }

    showToast(id ? "Actualizando informe..." : "Guardando informe...", "info");

    try {
      let res;

      if (id) {
        // ── EDICIÓN ── PUT con JSON (solo metadatos, archivo opcional si se reemplaza)
        if (file) {
          // Si hay nuevo archivo, subir primero
          const fd = new FormData();
          fd.append("file", file);
          const upRes = await fetch(this.API_URL + '/upload', { method: "POST", body: fd });
          const upData = await upRes.json().catch(() => ({}));
          if (!upRes.ok) {
            showToast(upData.message || "Error al subir el archivo", "error");
            return;
          }
          // Actualizar metadatos + pdfUrl via PUT
          res = await fetch(this.API_URL + '/' + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, pdfUrl: upData.fileUrl || '' }),
          });
        } else {
          // Solo actualizar metadatos sin tocar el archivo
          res = await fetch(this.API_URL + '/' + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
          });
        }
      } else {
        // ── CREACIÓN ── un solo FormData con archivo + metadatos
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title);
        fd.append("description", description);
        res = await fetch(this.API_URL, { method: "POST", body: fd });
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast(id ? "Informe actualizado" : "Informe guardado correctamente");
        this.resetForm();
        this.load();
      } else {
        showToast(data.error || data.message || "Error al guardar el informe", "error");
        console.error('[InformeGestion] save error response:', data);
      }
    } catch (err) {
      console.error('[InformeGestion] save exception:', err);
      showToast("Error de conexión al guardar", "error");
    }
  },

  edit: async function (id) {
    try {
      const res = await fetch(this.API_URL);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const items = await res.json();
      const item = items.find((i) => i.id === id);

      if (item) {
        document.getElementById("informeGestionId").value = item.id;
        document.getElementById("informeGestionTitle").value = item.title || '';
        document.getElementById("informeGestionDescription").value = item.description || '';
        document.getElementById("informeGestionFile").required = false;
        document.getElementById("informeGestionSaveBtn").innerText = "Actualizar Informe";
        document.getElementById("informeGestionCancelBtn").classList.remove("hidden");
        document.getElementById("informeGestionSection").scrollIntoView({ behavior: "smooth" });
      } else {
        showToast("Informe no encontrado", "error");
      }
    } catch (err) {
      console.error('[InformeGestion] edit error:', err);
      showToast("Error al cargar datos del informe", "error");
    }
  },

  delete: async function (id) {
    if (!confirm("¿Estás seguro de eliminar este informe? El archivo PDF también será eliminado.")) return;

    try {
      const res = await fetch(this.API_URL + '/' + id, { method: "DELETE" });
      if (res.ok) {
        showToast("Informe eliminado correctamente");
        this.load();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Error al eliminar el informe", "error");
      }
    } catch (err) {
      console.error('[InformeGestion] delete error:', err);
      showToast("Error de conexión al eliminar", "error");
    }
  },

  resetForm: function () {
    const form = document.getElementById("informeGestionForm");
    if (form) form.reset();
    document.getElementById("informeGestionId").value = "";
    document.getElementById("informeGestionFile").required = true;
    document.getElementById("informeGestionSaveBtn").innerText = "Guardar Informe";
    document.getElementById("informeGestionCancelBtn").classList.add("hidden");
  },
};

window.InformeGestionAdmin = InformeGestionAdmin;

// ── Inicialización ──
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("informeGestionForm");
  if (form) {
    form.addEventListener("submit", (e) => InformeGestionAdmin.save(e));
  }
  const cancelBtn = document.getElementById("informeGestionCancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => InformeGestionAdmin.resetForm());
  }
});
