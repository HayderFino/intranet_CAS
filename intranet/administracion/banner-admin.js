const BannerAdmin = {
  API_URL: "../api/banner",

  load: async function () {
    const listContainer = document.getElementById("bannerList");
    if (!listContainer) return;

    listContainer.innerHTML = "<p>Cargando banners...</p>";

    try {
      const response = await fetch(this.API_URL);
      const banners = await response.json();

      if (banners.length === 0) {
        listContainer.innerHTML = "<p>No hay banners configurados.</p>";
        return;
      }

      listContainer.innerHTML = "";
      banners.forEach((banner) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.innerHTML = `
                    <div class="news-info">
                        <img src="${banner.imageUrl}" style="width: 100px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 1rem; float: left;">
                        <h4>${banner.title}</h4>
                        <p style="font-size: 0.8rem; color: #64748b;">
                            Orden: ${banner.order} | ${banner.link || "Sin link"}<br>
                            ${banner.fileUrl ? `<span style="color: #059669;">📄 Archivo: ${banner.fileUrl.split("/").pop()}</span>` : '<span style="color: #94a3b8;">Sin archivo asociado</span>'}
                        </p>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary" onclick="BannerAdmin.edit('${banner.id}')">Editar</button>
                        <button class="btn-delete" onclick="BannerAdmin.delete('${banner.id}')">Eliminar</button>
                    </div>
                `;
        listContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error loading banners:", error);
      showToast("Error al cargar banners", "error");
    }
  },

  save: async function (e) {
    e.preventDefault();
    const form = e.target;
    const id = document.getElementById("bannerEditId").value;
    const title = document.getElementById("bannerTitle").value;
    const link = document.getElementById("bannerLink").value;
    const order = document.getElementById("bannerOrder").value;

    const imageFile = document.getElementById("bannerImage").files[0];
    const associatedFile = document.getElementById("bannerFile").files[0];

    // Al crear, los data-* no existen → inicializamos en ''
    let imageUrl = form.dataset.currentImageUrl || "";
    let fileUrl = form.dataset.currentFileUrl || "";

    try {
      // 1. Si hay imagen o archivo, subirlos primero
      if (imageFile || associatedFile) {
        const formData = new FormData();
        if (imageFile) formData.append("image", imageFile);
        if (associatedFile) formData.append("file", associatedFile);

        showToast("Subiendo archivos...", "info");
        const uploadRes = await fetch(`${this.API_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          showToast("Error al subir archivos", "error");
          return;
        }

        const uploadData = await uploadRes.json();
        if (uploadData.imageUrl) imageUrl = uploadData.imageUrl;
        if (uploadData.fileUrl) fileUrl = uploadData.fileUrl;
      }

      if (!imageUrl) {
        showToast("Por favor sube una imagen para el banner", "error");
        return;
      }

      // 2. Save data
      const data = { title, link, order, imageUrl, fileUrl };
      const method = id ? "PUT" : "POST";
      const url = id ? `${this.API_URL}/${id}` : this.API_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast(id ? "Banner actualizado" : "Banner creado");
        this.resetForm();
        this.load();
      } else {
        showToast("Error al guardar banner", "error");
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      showToast("Error en el proceso", "error");
    }
  },

  edit: async function (id) {
    try {
      const res = await fetch(this.API_URL);
      const banners = await res.json();
      const banner = banners.find((b) => b.id === id);

      if (banner) {
        document.getElementById("bannerEditId").value = banner.id;
        document.getElementById("bannerTitle").value = banner.title;
        document.getElementById("bannerLink").value = banner.link || "";
        document.getElementById("bannerOrder").value = banner.order || 0;

        const form = document.getElementById("bannerForm");
        form.dataset.currentImageUrl = banner.imageUrl;
        form.dataset.currentFileUrl = banner.fileUrl || "";

        document.getElementById("bannerSaveBtn").innerText =
          "Actualizar Banner";
        document.getElementById("bannerCancelBtn").classList.remove("hidden");

        form.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      showToast("Error al obtener datos del banner", "error");
    }
  },

  delete: async function (id) {
    if (!confirm("¿Estás seguro de eliminar este banner?")) return;

    try {
      const res = await fetch(`${this.API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Banner eliminado");
        this.load();
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch (error) {
      showToast("Error al eliminar banner", "error");
    }
  },

  resetForm: function () {
    const form = document.getElementById("bannerForm");
    form.reset();
    document.getElementById("bannerEditId").value = "";
    delete form.dataset.currentImageUrl;
    delete form.dataset.currentFileUrl;
    document.getElementById("bannerSaveBtn").innerText = "Guardar Banner";
    document.getElementById("bannerCancelBtn").classList.add("hidden");
  },
};

// Initialize listeners
document.addEventListener("DOMContentLoaded", () => {
  const bannerForm = document.getElementById("bannerForm");
  if (bannerForm) {
    bannerForm.addEventListener("submit", (e) => BannerAdmin.save(e));
  }

  const cancelBtn = document.getElementById("bannerCancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => BannerAdmin.resetForm());
  }
});
