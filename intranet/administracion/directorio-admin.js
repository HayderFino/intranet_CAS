const DirectorioAdmin = {
  API: "/api/directorio",

  load: async function () {
    const list = document.getElementById("directorioList");
    if (!list) return;
    list.innerHTML = "<p>Cargando contactos...</p>";
    try {
      const res = await fetch(this.API);
      const items = await res.json();
      if (items.length === 0) {
        list.innerHTML =
          '<p style="color:#64748b;padding:1rem;">No hay contactos registrados.</p>';
        return;
      }
      list.innerHTML = "";
      items.forEach((p) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.innerHTML = `
                    <div class="news-info">
                        <h4>${p.nombre}</h4>
                        <p>${p.cargo} &nbsp;|&nbsp; ${p.dependencia}</p>
                        <p style="color:#0ea5e9;font-size:.8rem;">${p.correo}</p>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="DirectorioAdmin.edit('${p.id}')">Editar</button>
                        <button class="btn-delete" onclick="DirectorioAdmin.delete('${p.id}')">Eliminar</button>
                    </div>`;
        list.appendChild(card);
      });
    } catch (e) {
      showToast("Error al cargar directorio", "error");
    }
  },

  save: async function (e) {
    e.preventDefault();
    const id = document.getElementById("dirEditId").value;
    const data = {
      nombre: document.getElementById("dirNombre").value,
      cargo: document.getElementById("dirCargo").value,
      dependencia: document.getElementById("dirDependencia").value,
      correo: document.getElementById("dirCorreo").value,
    };
    const method = id ? "PUT" : "POST";
    const url = id ? `${this.API}/${id}` : this.API;
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast(id ? "Contacto actualizado" : "Contacto creado");
        this.resetForm();
        this.load();
      } else showToast("Error al guardar", "error");
    } catch (e) {
      showToast("Error en el proceso", "error");
    }
  },

  edit: async function (id) {
    const res = await fetch(this.API);
    const items = await res.json();
    const p = items.find((i) => i.id === id);
    if (!p) return;
    document.getElementById("dirEditId").value = p.id;
    document.getElementById("dirNombre").value = p.nombre;
    document.getElementById("dirCargo").value = p.cargo;
    document.getElementById("dirDependencia").value = p.dependencia;
    document.getElementById("dirCorreo").value = p.correo;
    document.getElementById("dirSaveBtn").innerText = "Actualizar Contacto";
    document.getElementById("dirCancelBtn").classList.remove("hidden");
    document
      .getElementById("directorioForm")
      .scrollIntoView({ behavior: "smooth" });
  },

  delete: async function (id) {
    if (!confirm("¿Eliminar este contacto?")) return;
    const res = await fetch(`${this.API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Contacto eliminado");
      this.load();
    } else showToast("Error al eliminar", "error");
  },

  resetForm: function () {
    document.getElementById("directorioForm").reset();
    document.getElementById("dirEditId").value = "";
    document.getElementById("dirSaveBtn").innerText = "Guardar Contacto";
    document.getElementById("dirCancelBtn").classList.add("hidden");
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const f = document.getElementById("directorioForm");
  if (f) f.addEventListener("submit", (e) => DirectorioAdmin.save(e));
  const c = document.getElementById("dirCancelBtn");
  if (c) c.addEventListener("click", () => DirectorioAdmin.resetForm());
});
