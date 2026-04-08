const InformeGestionAdmin = {
  API_URL: "../api/informe-gestion",

  load: async function () {
    const list = document.getElementById("informeGestionList");
    if (!list) return;

    list.innerHTML = '<div class="loading">Cargando informes...</div>';

    try {
      const res = await fetch(this.API_URL);
      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const items = await res.json();

      if (!Array.isArray(items) || items.length === 0) {
        list.innerHTML = "<p>No hay informes registrados.</p>";
        return;
      }

      list.innerHTML = items
        .map(
          (item) => `
                <div class="news-manage-card">
                    <div class="news-info">
                        <h4>${item.title}</h4>
                        <p>${item.description || ""}</p>
                        <small style="color: #64748b;">PDF: ${item.pdfUrl.split("/").pop()}</small>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="InformeGestionAdmin.edit('${item.id}')">Editar</button>
                        <button class="btn-delete" onclick="InformeGestionAdmin.delete('${item.id}')">Eliminar</button>
                    </div>
                </div>
            `,
        )
        .join("");
    } catch (err) {
      console.error(err);
      list.innerHTML = '<p class="error">Error al cargar informes.</p>';
    }
  },

  save: async function (e) {
    e.preventDefault();
    const id = document.getElementById("informeGestionId").value;
    const title = document.getElementById("informeGestionTitle").value;
    const description = document.getElementById(
      "informeGestionDescription",
    ).value;
    const fileInput = document.getElementById("informeGestionFile");

    if (!id && !fileInput.files[0]) {
      showToast("Por favor selecciona un archivo PDF", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (fileInput.files[0]) {
      formData.append("file", fileInput.files[0]);
    }

    try {
      showToast("Guardando informe...", "info");
      const url = id ? `${this.API_URL}/${id}` : this.API_URL;
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        showToast(id ? "Informe actualizado" : "Informe creado");
        this.resetForm();
        this.load();
      } else {
        const data = await res.json();
        showToast(data.message || "Error al guardar", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión", "error");
    }
  },

  edit: async function (id) {
    try {
      const res = await fetch(this.API_URL);
      const items = await res.json();
      const item = items.find((i) => i.id === id);

      if (item) {
        document.getElementById("informeGestionId").value = item.id;
        document.getElementById("informeGestionTitle").value = item.title;
        document.getElementById("informeGestionDescription").value =
          item.description;
        document.getElementById("informeGestionFile").required = false; // No obligatorio al editar

        document.getElementById("informeGestionSaveBtn").innerText =
          "Actualizar Informe";
        document
          .getElementById("informeGestionCancelBtn")
          .classList.remove("hidden");

        document
          .getElementById("informeGestionSection")
          .scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      showToast("Error al cargar datos", "error");
    }
  },

  delete: async function (id) {
    if (!confirm("¿Estás seguro de eliminar este informe?")) return;

    try {
      const res = await fetch(`${this.API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Informe eliminado");
        this.load();
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    }
  },

  resetForm: function () {
    const form = document.getElementById("informeGestionForm");
    form.reset();
    document.getElementById("informeGestionId").value = "";
    document.getElementById("informeGestionFile").required = true;
    document.getElementById("informeGestionSaveBtn").innerText =
      "Guardar Informe";
    document.getElementById("informeGestionCancelBtn").classList.add("hidden");
  },
};

window.InformeGestionAdmin = InformeGestionAdmin;

// Initializer
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
