/**
 * politicas-sgi-admin.js
 * Módulo CRUD para Políticas Institucionales del SGI.
 */
const PoliticasSgiAdmin = (() => {
  const API = "../api.php?route=politicas-sgi";

  let form,
    editId,
    titleInput,
    codeInput,
    fileInput,
    listEl,
    saveBtn,
    cancelBtn;

  let items = [];

  function getEls() {
    form = document.getElementById("politicasSgiForm");
    editId = document.getElementById("politicasSgiEditId");
    titleInput = document.getElementById("politicasSgiTitle");
    codeInput = document.getElementById("politicasSgiCode");
    fileInput = document.getElementById("politicasSgiFile");
    listEl = document.getElementById("politicasSgiList");
    saveBtn = document.getElementById("politicasSgiSaveBtn");
    cancelBtn = document.getElementById("politicasSgiCancelBtn");

    if (form && !form._bound) {
      form.addEventListener("submit", onSubmit);
      cancelBtn.addEventListener("click", cancelEdit);
      form._bound = true;
    }
  }

  async function load() {
    getEls();
    if (!listEl) return;

    listEl.innerHTML = '<p style="padding:1rem;color:#64748b;">Cargando...</p>';
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      items = data.items || [];
      renderList();
    } catch (e) {
      listEl.innerHTML =
        '<p style="color:#ef4444;padding:1rem;">Error al cargar: ' +
        e.message +
        "</p>";
    }
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = "";

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.style.cssText =
        "color:#94a3b8;font-size:0.85rem;padding:2rem;text-align:center;background:#f8fafc;border-radius:12px;border:1px dashed #e2e8f0;";
      empty.innerHTML = "No hay documentos cargados en el sistema.";
      listEl.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `
                <div class="news-info" style="flex: 1; min-width: 0;">
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
                        <h4 style="margin:0; font-size:1.05rem; color:#1e293b;">${item.title}</h4>
                    </div>
                    
                    ${
                      item.code
                        ? `
                    <div style="background:#f1f5f9; color:#475569; padding:0.6rem; border-radius:8px; font-size:0.8rem; margin-bottom:0.75rem; line-height:1.5; overflow-wrap: anywhere; word-break: break-word;">
                        ${item.code}
                    </div>`
                        : ""
                    }

                    <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
                        ${
                          item.href && item.href !== "#"
                            ? `<a href="${item.href}" target="_blank" class="admin-file-badge">📄 Ver Documento</a>`
                            : '<span style="font-size:0.72rem; color:#94a3b8; font-style:italic;">⚠️ Sin archivo cargado</span>'
                        }
                    </div>
                </div>
                <div class="card-actions" style="margin-left: 1.5rem;">
                    <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                </div>`;
      listEl.appendChild(card);
    });

    listEl
      .querySelectorAll(".btn-delete")
      .forEach((btn) => (btn.onclick = () => deleteItem(btn.dataset.id)));
    listEl
      .querySelectorAll(".btn-edit")
      .forEach(
        (btn) =>
          (btn.onclick = () =>
            startEdit(items.find((i) => i.id === btn.dataset.id))),
      );
  }

  function startEdit(item) {
    if (!item) return;
    editId.value = item.id;
    titleInput.value = item.title;
    titleInput.readOnly = false;
    codeInput.value = item.code || "";
    form.setAttribute("data-current-url", item.href || "#");
    saveBtn.textContent = "Actualizar Documento";
    cancelBtn.classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    form.reset();
    editId.value = "";
    titleInput.readOnly = false;
    form.removeAttribute("data-current-url");
    saveBtn.textContent = "Guardar Documento";
    cancelBtn.classList.add("hidden");
  }

  async function onSubmit(e) {
    e.preventDefault();
    const id = editId.value;
    const item = items.find((i) => i.id === id);
    let fileUrl = form.getAttribute("data-current-url") || "#";

    toast(id ? "Actualizando..." : "Guardando...", "info");

    if (fileInput.files.length > 0) {
      const fd = new FormData();
      fd.append("file", fileInput.files[0]);
      try {
        const upRes = await fetch(`${API}/upload`, {
          method: "POST",
          body: fd,
        });
        const upData = await upRes.json();
        fileUrl = upData.fileUrl || "#";
      } catch {
        toast("Error al subir el archivo", "error");
        return;
      }
    }

    const payload = {
      title: titleInput.value.trim(),
      code: codeInput.value.trim(),
      fileUrl,
    };
    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/${id}` : API;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast(id ? "Actualizado ✓" : "Guardado ✓");
        cancelEdit();
        load();
      } else {
        toast("Error al guardar", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  }

  async function deleteItem(id) {
    if (!confirm("¿Eliminar este documento?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Documento eliminado");
        load();
      } else toast("Error al eliminar", "error");
    } catch {
      toast("Error de conexión", "error");
    }
  }

  function toast(msg, type = "success") {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = "toast" + (type === "error" ? " toast-error" : "");
    el.classList.remove("hidden");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add("hidden"), 3500);
  }

  return { load };
})();

window.PoliticasSgiAdmin = PoliticasSgiAdmin;
