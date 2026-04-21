const EventosAdmin = {
  API: "/intranet_CAS/intranet/api/eventos",

  load: async function () {
    const list = document.getElementById("eventosList");
    if (!list) return;
    list.innerHTML = "<p>Cargando...</p>";
    try {
      const res = await fetch(this.API);
      const items = await res.json();
      if (items.length === 0) {
        list.innerHTML =
          '<p style="color:#64748b;padding:1rem;">No hay entradas registradas.</p>';
        return;
      }
      list.innerHTML = "";
      items.forEach((ev) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        const tipoColor = ev.tipo === "Agenda" ? "#0ea5e9" : "#059669";
        card.innerHTML = `
                    <div class="news-info">
                        <h4>${ev.titulo}
                            <span style="font-size:.72rem;font-weight:600;padding:.2rem .55rem;border-radius:2rem;background:${tipoColor}20;color:${tipoColor};margin-left:.5rem;">${ev.tipo || "Evento"}</span>
                        </h4>
                        <p>${ev.fecha ? ev.fecha.split("-").reverse().join("/") : ""} &nbsp;|&nbsp; ${ev.lugar || "Sin lugar"}</p>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="EventosAdmin.edit('${ev.id}')">Editar</button>
                        <button class="btn-delete" onclick="EventosAdmin.delete('${ev.id}')">Eliminar</button>
                    </div>`;
        list.appendChild(card);
      });
    } catch (e) {
      showToast("Error al cargar", "error");
    }
  },

  save: async function (e) {
    e.preventDefault();
    const id = document.getElementById("eventoEditId").value;
    const data = {
      tipo: document.getElementById("eventoTipo").value,
      titulo: document.getElementById("eventoTitulo").value,
      fecha: document.getElementById("eventoFecha").value,
      lugar: document.getElementById("eventoLugar").value,
      descripcion: document.getElementById("eventoDescripcion").value,
      acento: document.getElementById("eventoAcento").value,
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
        showToast(id ? "Actualizado" : "Guardado");
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
    const ev = items.find((i) => i.id === id);
    if (!ev) return;
    document.getElementById("eventoEditId").value = ev.id;
    document.getElementById("eventoTipo").value = ev.tipo || "Evento";
    document.getElementById("eventoTitulo").value = ev.titulo;
    document.getElementById("eventoFecha").value = ev.fecha;
    document.getElementById("eventoLugar").value = ev.lugar || "";
    document.getElementById("eventoDescripcion").value = ev.descripcion || "";
    document.getElementById("eventoAcento").value = ev.acento || "";
    document.getElementById("eventoSaveBtn").innerText = "Actualizar";
    document.getElementById("eventoCancelBtn").classList.remove("hidden");
    document
      .getElementById("eventoForm")
      .scrollIntoView({ behavior: "smooth" });
  },

  delete: async function (id) {
    if (!confirm("¿Eliminar esta entrada?")) return;
    const res = await fetch(`${this.API}/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Eliminado");
      this.load();
    } else showToast("Error al eliminar", "error");
  },

  resetForm: function () {
    document.getElementById("eventoForm").reset();
    document.getElementById("eventoEditId").value = "";
    document.getElementById("eventoSaveBtn").innerText = "Guardar";
    document.getElementById("eventoCancelBtn").classList.add("hidden");
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const f = document.getElementById("eventoForm");
  if (f) f.addEventListener("submit", (e) => EventosAdmin.save(e));
  const c = document.getElementById("eventoCancelBtn");
  if (c) c.addEventListener("click", () => EventosAdmin.resetForm());
});
