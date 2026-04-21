document.addEventListener("DOMContentLoaded", () => {
  // Configuración de rutas dinámicas para APIs
  const API_BASE = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/administracion/')) + '/api';

  // Verificar sesión antes de cargar nada
  checkSession();

  // Sync initial state
  loadNewsList();

  // --- UI Elements ---
  const toast = document.getElementById("toast");
  const sections = {
    newsForm: document.getElementById("newsFormSection"),
    newsList: document.getElementById("newsListSection"),
    agenda: document.getElementById("agendaSection"),
    sgi: document.getElementById("sgiSection"),
    dashboard: document.getElementById("dashboardSection"),
    preview: document.getElementById("previewArea"),
    // Procesos misionales
    adminRecursos: document.getElementById("adminRecursosSection"),
    planeacionAmbiental: document.getElementById("planeacionAmbientalSection"),
    vigilanciaControl: document.getElementById("vigilanciaControlSection"),
    cita: document.getElementById("citaSection"),
    sirh: document.getElementById("sirhSection"),
    revisionRed: document.getElementById("revisionRedSection"),
    snif: document.getElementById("snifSection"),
    manualFunciones: document.getElementById("manualFuncionesSection"),
    planMonitoreo: document.getElementById("planMonitoreoSection"),
    planesTalento: document.getElementById("planesTalentoSection"),
    convocatorias: document.getElementById("convocatoriasSection"),
    estudiosTecnicos: document.getElementById("estudiosTecnicosSection"),
    provisionEmpleos: document.getElementById("provisionEmpleosSection"),
    banner: document.getElementById("bannerSection"),
    eventos: document.getElementById("eventosSection"),
    directorio: document.getElementById("directorioSection"),
    informeGestion: document.getElementById("informeGestionSection"),
    politicasSgi: document.getElementById("politicasSgiSection"),
    users: document.getElementById("usersSection"),
  };

  const navItems = {
    dashboard: document.getElementById("nav-dashboard"),
    newNews: document.getElementById("nav-new-news"),
    listNews: document.getElementById("nav-list-news"),
    agenda: document.getElementById("nav-agenda"),
    sgi: document.getElementById("nav-sgi"),
    mejora: document.getElementById("nav-mejora"),
    // Procesos misionales
    adminRecursos: document.getElementById("nav-admin-recursos"),
    planeacionAmbiental: document.getElementById("nav-planeacion-ambiental"),
    vigilanciaControl: document.getElementById("nav-vigilancia-control"),
    cita: document.getElementById("nav-cita"),
    sirh: document.getElementById("nav-sirh"),
    revisionRed: document.getElementById("nav-revision-red"),
    snif: document.getElementById("nav-snif"),
    manualFunciones: document.getElementById("nav-manual-funciones"),
    planMonitoreo: document.getElementById("nav-plan-monitoreo"),
    planesTalento: document.getElementById("nav-planes-talento"),
    convocatorias: document.getElementById("nav-convocatorias"),
    estudiosTecnicos: document.getElementById("nav-estudios-tecnicos"),
    provisionEmpleos: document.getElementById("nav-provision-empleos"),
    banner: document.getElementById("nav-banner"),
    eventos: document.getElementById("nav-eventos"),
    directorio: document.getElementById("nav-directorio"),
    informeGestion: document.getElementById("nav-informe-gestion"),
    politicasSgi: document.getElementById("nav-politicas-sgi"),
    users: document.getElementById("nav-users"),
  };

  // --- Navigation Logic ---
  function hideAll() {
    Object.values(sections).forEach(
      (sec) => sec && sec.classList.add("hidden"),
    );
    Object.values(navItems).forEach(
      (nav) => nav && nav.classList.remove("active"),
    );
  }

  navItems.dashboard.onclick = () => {
    hideAll();
    sections.dashboard.classList.remove("hidden");
    navItems.dashboard.classList.add("active");
    updateStats();
  };
  navItems.newNews.onclick = () => {
    hideAll();
    sections.newsForm.classList.remove("hidden");
    navItems.newNews.classList.add("active");
  };
  navItems.listNews.onclick = () => {
    hideAll();
    sections.newsList.classList.remove("hidden");
    navItems.listNews.classList.add("active");
    loadNewsList();
  };
  navItems.agenda.onclick = () => {
    hideAll();
    sections.agenda.classList.remove("hidden");
    navItems.agenda.classList.add("active");
    loadAgendaList();
  };
  navItems.users.onclick = () => {
    hideAll();
    sections.users.classList.remove("hidden");
    navItems.users.classList.add("active");
    if (window.UsersAdmin) window.UsersAdmin.init();
  };

  navItems.sgi.onclick = () => {
    hideAll();
    sections.sgi.classList.remove("hidden");
    navItems.sgi.classList.add("active");
    switchSgiSection("planeacion");
  };

  navItems.mejora.onclick = () => {
    hideAll();
    sections.sgi.classList.remove("hidden");
    navItems.mejora.classList.add("active");
    switchSgiSection("mejora");
  };

  navItems.respel = document.getElementById("nav-respel");
  sections.respel = document.getElementById("respelSection");

  navItems.respel.onclick = () => {
    hideAll();
    sections.respel.classList.remove("hidden");
    navItems.respel.classList.add("active");
    switchRespelSection("documentos");
  };

  navItems.rua = document.getElementById("nav-rua");
  sections.rua = document.getElementById("ruaSection");

  navItems.rua.onclick = () => {
    hideAll();
    sections.rua.classList.remove("hidden");
    navItems.rua.classList.add("active");
    loadRuaList();
  };

  navItems.boletines = document.getElementById("nav-boletines");
  sections.boletines = document.getElementById("boletinesSection");

  navItems.boletines.onclick = () => {
    hideAll();
    sections.boletines.classList.remove("hidden");
    navItems.boletines.classList.add("active");
    loadBoletinesList();
  };

  navItems.cita.onclick = () => {
    hideAll();
    sections.cita.classList.remove("hidden");
    navItems.cita.classList.add("active");
    if (typeof CitaAdmin !== "undefined") CitaAdmin.load();
  };

  navItems.sirh.onclick = () => {
    hideAll();
    sections.sirh.classList.remove("hidden");
    navItems.sirh.classList.add("active");
    if (typeof SirhAdmin !== "undefined") SirhAdmin.load();
  };

  navItems.revisionRed.onclick = () => {
    hideAll();
    sections.revisionRed.classList.remove("hidden");
    navItems.revisionRed.classList.add("active");
    if (typeof RevisionRedAdmin !== "undefined") RevisionRedAdmin.load();
  };

  navItems.snif.onclick = () => {
    hideAll();
    sections.snif.classList.remove("hidden");
    navItems.snif.classList.add("active");
    if (typeof SnifAdmin !== "undefined") SnifAdmin.load();
  };

  navItems.manualFunciones.onclick = () => {
    hideAll();
    sections.manualFunciones.classList.remove("hidden");
    navItems.manualFunciones.classList.add("active");
    if (typeof ManualFuncionesAdmin !== "undefined")
      ManualFuncionesAdmin.load();
  };

  navItems.planMonitoreo.onclick = () => {
    hideAll();
    sections.planMonitoreo.classList.remove("hidden");
    navItems.planMonitoreo.classList.add("active");
    if (typeof PlanMonitoreoAdmin !== "undefined") PlanMonitoreoAdmin.load();
  };

  navItems.planesTalento.onclick = () => {
    hideAll();
    sections.planesTalento.classList.remove("hidden");
    navItems.planesTalento.classList.add("active");
    if (typeof PlanesTalentoAdmin !== "undefined") PlanesTalentoAdmin.load();
  };

  navItems.convocatorias.onclick = () => {
    hideAll();
    sections.convocatorias.classList.remove("hidden");
    navItems.convocatorias.classList.add("active");
    if (typeof ConvocatoriasAdmin !== "undefined") ConvocatoriasAdmin.load();
  };

  navItems.estudiosTecnicos.onclick = () => {
    hideAll();
    sections.estudiosTecnicos.classList.remove("hidden");
    navItems.estudiosTecnicos.classList.add("active");
    if (typeof EstudiosTecnicosAdmin !== "undefined")
      EstudiosTecnicosAdmin.load();
  };

  navItems.provisionEmpleos.onclick = () => {
    hideAll();
    sections.provisionEmpleos.classList.remove("hidden");
    navItems.provisionEmpleos.classList.add("active");
    if (typeof ProvisionEmpleosAdmin !== "undefined")
      ProvisionEmpleosAdmin.load();
  };

  navItems.banner.onclick = () => {
    hideAll();
    sections.banner.classList.remove("hidden");
    navItems.banner.classList.add("active");
    if (typeof BannerAdmin !== "undefined") BannerAdmin.load();
  };

  navItems.eventos.onclick = () => {
    hideAll();
    sections.eventos.classList.remove("hidden");
    navItems.eventos.classList.add("active");
    if (typeof EventosAdmin !== "undefined") EventosAdmin.load();
  };

  navItems.directorio.onclick = () => {
    hideAll();
    sections.directorio.classList.remove("hidden");
    navItems.directorio.classList.add("active");
    if (typeof DirectorioAdmin !== "undefined") DirectorioAdmin.load();
  };

  navItems.informeGestion.onclick = () => {
    hideAll();
    sections.informeGestion.classList.remove("hidden");
    navItems.informeGestion.classList.add("active");
    if (typeof InformeGestionAdmin !== "undefined") InformeGestionAdmin.load();
  };

  navItems.politicasSgi.onclick = () => {
    hideAll();
    sections.politicasSgi.classList.remove("hidden");
    navItems.politicasSgi.classList.add("active");
    if (typeof PoliticasSgiAdmin !== "undefined") PoliticasSgiAdmin.load();
  };

  // --- Procesos Misionales SGI (genérico) ---
  // Config para las 3 secciones misionales
  const misionalConfig = [
    {
      navId: "nav-admin-recursos",
      sectionEl: "adminRecursosSection",
      formId: "sgiMisional1Form",
      editId: "sgiMisional1EditId",
      nameId: "sgiMisional1Name",
      catId: "sgiMisional1Category",
      fileId: "sgiMisional1File",
      listId: "adminRecursosItemsList",
      saveBtn: "sgiMisional1SaveBtn",
      cancelBtn: "sgiMisional1CancelBtn",
      apiSection: "admin-recursos",
    },
    {
      navId: "nav-planeacion-ambiental",
      sectionEl: "planeacionAmbientalSection",
      formId: "sgiMisional2Form",
      editId: "sgiMisional2EditId",
      nameId: "sgiMisional2Name",
      catId: "sgiMisional2Category",
      fileId: "sgiMisional2File",
      listId: "planeacionAmbientalItemsList",
      saveBtn: "sgiMisional2SaveBtn",
      cancelBtn: "sgiMisional2CancelBtn",
      apiSection: "planeacion-ambiental",
    },
    {
      navId: "nav-vigilancia-control",
      sectionEl: "vigilanciaControlSection",
      formId: "sgiMisional3Form",
      editId: "sgiMisional3EditId",
      nameId: "sgiMisional3Name",
      catId: "sgiMisional3Category",
      fileId: "sgiMisional3File",
      listId: "vigilanciaControlItemsList",
      saveBtn: "sgiMisional3SaveBtn",
      cancelBtn: "sgiMisional3CancelBtn",
      apiSection: "vigilancia-control",
    },
  ];

  function initMisionalSection(cfg) {
    const secEl = document.getElementById(cfg.sectionEl);
    const form = document.getElementById(cfg.formId);
    const editId = document.getElementById(cfg.editId);
    const listEl = document.getElementById(cfg.listId);
    let loadedItems = [];
    let activeFilter = "all";

    // Nav click (usa navItems global que ya tiene el elemento correcto)
    const navEl = document.getElementById(cfg.navId);
    navEl.onclick = () => {
      hideAll();
      secEl.classList.remove("hidden");
      navEl.classList.add("active");
      loadList();
    };

    // Insertar barra de filtros encima del listado (solo una vez)
    const filterBar = document.createElement("div");
    filterBar.id = `${cfg.listId}-filterbar`;
    filterBar.style.cssText =
      "display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem; flex-wrap:wrap;";
    filterBar.innerHTML = `
            <label style="font-weight:600; font-size:0.85rem; color:#334155;">
                Filtrar por categoría:
            </label>
            <select id="${cfg.listId}-catfilter"
                style="padding:0.45rem 0.8rem; border:1px solid #cbd5e1; border-radius:8px;
                       font-size:0.85rem; background:#fff; cursor:pointer; color:#334155;">
                <option value="all">Todas las categorías</option>
            </select>
            <span id="${cfg.listId}-count"
                style="margin-left:auto; font-size:0.8rem; color:#64748b;"></span>
        `;
    listEl.parentNode.insertBefore(filterBar, listEl);
    const catFilter = document.getElementById(`${cfg.listId}-catfilter`);
    const countEl = document.getElementById(`${cfg.listId}-count`);

    catFilter.onchange = () => {
      activeFilter = catFilter.value;
      renderList();
    };

    async function loadList() {
      listEl.innerHTML = '<p style="padding:1rem;">Cargando...</p>';
      try {
        const res = await fetch(`${API_BASE}/sgi/${cfg.apiSection}`);
        loadedItems = await res.json();
        rebuildFilterOptions();
        renderList();
      } catch (e) {
        showToast("Error al cargar", "error");
      }
    }

    function rebuildFilterOptions() {
      // Categorías únicas de los items
      const cats = [...new Set(loadedItems.map((i) => i.category))].filter(
        Boolean,
      );
      catFilter.innerHTML = '<option value="all">Todas las categorías</option>';
      cats.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        if (c === activeFilter) opt.selected = true;
        catFilter.appendChild(opt);
      });
      // Si el filtro activo ya no existe, reset a 'all'
      if (activeFilter !== "all" && !cats.includes(activeFilter))
        activeFilter = "all";
    }

    function renderList() {
      const filtered =
        activeFilter === "all"
          ? loadedItems
          : loadedItems.filter((i) => i.category === activeFilter);

      countEl.textContent = `${filtered.length} de ${loadedItems.length} documentos`;

      if (filtered.length === 0) {
        listEl.innerHTML =
          '<p style="padding:1rem;color:#64748b;">No hay documentos en esta categoría.</p>';
        return;
      }
      listEl.innerHTML = "";
      filtered.forEach((item) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.innerHTML = `
                    <div class="news-info">
                        <div style="display: flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
                             <span style="background:#e2e8f0; color:#475569; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:600;">
                                ${item.category}
                            </span>
                            <a href="${item.href}" target="_blank" class="admin-file-badge">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                Ver Archivo
                            </a>
                        </div>
                        <h4>${item.name}</h4>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                    </div>
                `;
        listEl.appendChild(card);
      });

      listEl.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.onclick = () => deleteItem(btn.dataset.id);
      });
      listEl.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.onclick = () =>
          startEdit(loadedItems.find((i) => i.id === btn.dataset.id));
      });
    }

    function startEdit(item) {
      if (!item) return;
      editId.value = item.id;
      document.getElementById(cfg.nameId).value = item.name;
      document.getElementById(cfg.catId).value = item.category;
      document.getElementById(cfg.saveBtn).innerText = "Actualizar";
      document.getElementById(cfg.cancelBtn).classList.remove("hidden");
      form.setAttribute("data-current-url", item.href);
      // Scroll al formulario
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function cancelEdit() {
      form.reset();
      editId.value = "";
      document.getElementById(cfg.saveBtn).innerText = "Guardar";
      document.getElementById(cfg.cancelBtn).classList.add("hidden");
    }

    document.getElementById(cfg.cancelBtn).onclick = cancelEdit;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = editId.value;
      const fileInput = document.getElementById(cfg.fileId);
      const file = fileInput.files[0];
      let fileUrl = form.getAttribute("data-current-url") || "#";

      showToast(id ? "Actualizando..." : "Guardando...", "info");
      try {
        const name = document.getElementById(cfg.nameId).value;
        const category = document.getElementById(cfg.catId).value;

        if (file) {
          const fd = new FormData();
          // ⚠️ Los campos de texto DEBEN ir antes del archivo
          // para que Multer los tenga en req.body al elegir destino
          fd.append("section", cfg.apiSection);
          fd.append("category", category); // subcarpeta destino
          fd.append("file", file); // archivo al final
          const upRes = await fetch(`${API_BASE}/sgi/upload`, {
            method: "POST",
            body: fd,
          });
          const upData = await upRes.json();
          fileUrl = upData.fileUrl;
        }
        const method = id ? "PUT" : "POST";
        const url = id
          ? `${API_BASE}/sgi/${cfg.apiSection}/${id}`
          : `${API_BASE}/sgi/${cfg.apiSection}`;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category, fileUrl }),
        });
        if (res.ok) {
          showToast(id ? "Actualizado" : "Guardado");
          cancelEdit();
          loadList();
        } else {
          showToast("Error al guardar", "error");
        }
      } catch (err) {
        showToast("Error en el proceso", "error");
      }
    };

    async function deleteItem(id) {
      if (!confirm("¿Eliminar este documento?")) return;
      try {
        const res = await fetch(`${API_BASE}/sgi/${cfg.apiSection}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Eliminado");
          loadList();
        }
      } catch (e) {
        showToast("Error al eliminar", "error");
      }
    }
  }

  // Inicializar las 3 secciones misionales
  misionalConfig.forEach((cfg) => initMisionalSection(cfg));

  // --- PCB Logic ---
  (() => {
    // Registrar en globals para hideAll
    sections.pcb = document.getElementById("pcbSection");
    navItems.pcb = document.getElementById("nav-pcb");

    const form = document.getElementById("pcbForm");
    const editId = document.getElementById("pcbEditId");
    const listEl = document.getElementById("pcbItemsList");
    let loadedItems = [];

    navItems.pcb.onclick = () => {
      hideAll();
      sections.pcb.classList.remove("hidden");
      navItems.pcb.classList.add("active");
      loadList();
    };

    async function loadList() {
      listEl.innerHTML = '<p style="padding:1rem;">Cargando...</p>';
      try {
        const res = await fetch(`${API_BASE}/pcb`);
        loadedItems = await res.json();
        renderList();
      } catch (e) {
        showToast("Error al cargar PCB", "error");
      }
    }

    function renderList() {
      if (loadedItems.length === 0) {
        listEl.innerHTML =
          '<p style="padding:1rem; color:#64748b;">No hay documentos PCB.</p>';
        return;
      }
      listEl.innerHTML = "";
      loadedItems.forEach((item) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.innerHTML = `
                    <div class="news-info">
                        <h4>${item.title}</h4>
                        <a href="${item.href}" target="_blank" class="admin-file-badge" style="margin-top: 0.4rem;">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            Ver Archivo
                        </a>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                    </div>
                `;
        listEl.appendChild(card);
      });
      listEl.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.onclick = () => deleteItem(btn.dataset.id);
      });
      listEl.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.onclick = () =>
          startEdit(loadedItems.find((i) => i.id === btn.dataset.id));
      });
    }

    function startEdit(item) {
      if (!item) return;
      editId.value = item.id;
      document.getElementById("pcbTitle").value = item.title;
      document.getElementById("pcbSaveBtn").innerText = "Actualizar";
      document.getElementById("pcbCancelBtn").classList.remove("hidden");
      form.setAttribute("data-current-url", item.href);
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function cancelEdit() {
      form.reset();
      editId.value = "";
      document.getElementById("pcbSaveBtn").innerText = "Guardar Documento";
      document.getElementById("pcbCancelBtn").classList.add("hidden");
    }

    document.getElementById("pcbCancelBtn").onclick = cancelEdit;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = editId.value;
      const file = document.getElementById("pcbFile").files[0];
      let fileUrl = form.getAttribute("data-current-url") || "#";

      showToast(id ? "Actualizando..." : "Guardando...", "info");
      try {
        if (file) {
          const fd = new FormData();
          fd.append("file", file);
          const upRes = await fetch(`${API_BASE}/pcb/upload`, {
            method: "POST",
            body: fd,
          });
          const upData = await upRes.json();
          fileUrl = upData.fileUrl;
        }
        const title = document.getElementById("pcbTitle").value;
        const method = id ? "PUT" : "POST";
        const url = id ? `${API_BASE}/pcb/${id}` : `${API_BASE}/pcb`;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, fileUrl }),
        });
        if (res.ok) {
          showToast(id ? "Documento actualizado" : "Documento guardado");
          cancelEdit();
          loadList();
        } else {
          showToast("Error al guardar", "error");
        }
      } catch (err) {
        showToast("Error en el proceso", "error");
      }
    };

    async function deleteItem(id) {
      if (
        !confirm("¿Eliminar este documento PCB? El archivo también se borrará.")
      )
        return;
      try {
        const res = await fetch(`${API_BASE}/pcb/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Documento eliminado");
          loadList();
        } else showToast("Error al eliminar", "error");
      } catch (e) {
        showToast("Error al eliminar", "error");
      }
    }
  })();

  // --- PCB Tabla de Plazos ---
  (() => {
    const form = document.getElementById("pcbTablaForm");
    const editId = document.getElementById("pcbTablaEditId");
    const tablaList = document.getElementById("pcbTablaList");
    let rows = [];

    // Carga la lista de filas cuando se abre la sección PCB
    const origPcbOnclick = navItems.pcb.onclick;
    navItems.pcb.onclick = () => {
      if (origPcbOnclick) origPcbOnclick();
      loadRows();
    };

    async function loadRows() {
      tablaList.innerHTML = '<p style="padding:0.5rem;">Cargando filas...</p>';
      try {
        const res = await fetch(`${API_BASE}/pcb/tabla`);
        rows = await res.json();
        renderRows();
      } catch (e) {
        tablaList.innerHTML = '<p style="color:red;">Error al cargar.</p>';
      }
    }

    function renderRows() {
      if (rows.length === 0) {
        tablaList.innerHTML =
          '<p style="color:#64748b;">No hay filas en la tabla.</p>';
        return;
      }
      tablaList.innerHTML = "";
      rows.forEach((row) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.style.cssText = "flex-wrap:wrap; gap:0.5rem;";
        card.innerHTML = `
                    <div class="news-info" style="width:100%;">
                        <h4 style="font-size:0.9rem; margin-bottom:0.25rem;">${row.tipoProp}</h4>
                        <p style="font-size:0.78rem; color:#64748b;">
                            Plazo: <strong>${row.plazoInsc}</strong> &nbsp;|&nbsp;
                            Límite: <strong>${row.fechaLimite}</strong> &nbsp;|&nbsp;
                            Anual: <strong>${row.actualizacion}</strong>
                        </p>
                    </div>
                    <div class="card-actions">
                        <button class="btn-secondary btn-edit" data-id="${row.id}">Editar</button>
                        <button class="btn-delete" data-id="${row.id}">Eliminar</button>
                    </div>
                `;
        tablaList.appendChild(card);
      });
      tablaList.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.onclick = () => deleteRow(btn.dataset.id);
      });
      tablaList.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.onclick = () =>
          startRowEdit(rows.find((r) => r.id === btn.dataset.id));
      });
    }

    function startRowEdit(row) {
      if (!row) return;
      editId.value = row.id;
      document.getElementById("pcbTablaTipo").value = row.tipoProp;
      document.getElementById("pcbTablaPlazo").value = row.plazoInsc;
      document.getElementById("pcbTablaBalance").value = row.periodoBalance;
      document.getElementById("pcbTablaFecha").value = row.fechaLimite;
      document.getElementById("pcbTablaActual").value = row.actualizacion;
      document.getElementById("pcbTablaSaveBtn").innerText = "Actualizar Fila";
      document.getElementById("pcbTablaCancelBtn").classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function cancelRowEdit() {
      form.reset();
      editId.value = "";
      document.getElementById("pcbTablaSaveBtn").innerText = "Guardar Fila";
      document.getElementById("pcbTablaCancelBtn").classList.add("hidden");
    }
    document.getElementById("pcbTablaCancelBtn").onclick = cancelRowEdit;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = editId.value;
      const data = {
        tipoProp: document.getElementById("pcbTablaTipo").value,
        plazoInsc: document.getElementById("pcbTablaPlazo").value,
        periodoBalance: document.getElementById("pcbTablaBalance").value,
        fechaLimite: document.getElementById("pcbTablaFecha").value,
        actualizacion: document.getElementById("pcbTablaActual").value,
      };
      const method = id ? "PUT" : "POST";
      const url = id ? `${API_BASE}/pcb/tabla/${id}` : `${API_BASE}/pcb/tabla`;
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          showToast(id ? "Fila actualizada" : "Fila agregada");
          cancelRowEdit();
          loadRows();
        } else showToast("Error al guardar fila", "error");
      } catch (err) {
        showToast("Error en el proceso", "error");
      }
    };

    async function deleteRow(id) {
      if (!confirm("¿Eliminar esta fila de la tabla?")) return;
      try {
        const res = await fetch(`${API_BASE}/pcb/tabla/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Fila eliminada");
          loadRows();
        } else showToast("Error al eliminar", "error");
      } catch (e) {
        showToast("Error al eliminar", "error");
      }
    }
  })();

  // --- Manuales SGI ---
  (() => {
    const API = `${API_BASE}/manuales-sgi`;
    const form = document.getElementById("manualesSgiForm");
    const editId = document.getElementById("manualesSgiEditId");
    const listEl = document.getElementById("manualesSgiList");
    const saveBtn = document.getElementById("manualesSgiSaveBtn");
    const cancelBtn = document.getElementById("manualesSgiCancelBtn");

    // Registrar sección/nav
    sections.manualesSgi = document.getElementById("manualesSgiSection");
    navItems.manualesSgi = document.getElementById("nav-manuales-sgi");

    navItems.manualesSgi.onclick = () => {
      hideAll();
      sections.manualesSgi.classList.remove("hidden");
      navItems.manualesSgi.classList.add("active");
      loadList();
    };

    let items = [];

    async function loadList() {
      listEl.innerHTML = '<p style="padding:0.5rem;">Cargando...</p>';
      try {
        const res = await fetch(API);
        items = await res.json();
        renderList();
      } catch (e) {
        listEl.innerHTML =
          '<p style="color:red;">Error al cargar manuales.</p>';
      }
    }

    function renderList() {
      if (items.length === 0) {
        listEl.innerHTML =
          '<p style="color:#64748b;">No hay manuales registrados.</p>';
        return;
      }
      listEl.innerHTML = "";
      items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.innerHTML = `
                    <div class="news-info">
                        <h4>${item.title}</h4>
                        <div style="display: flex; align-items: center; gap: 0.8rem; margin-top: 0.4rem;">
                             <span style="font-size:0.75rem; color:#64748b;">${item.code || ""}</span>
                             ${
                               item.fileUrl && item.fileUrl !== "#"
                                 ? `<a href="${item.fileUrl}" target="_blank" class="admin-file-badge">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                    Descargar Manual
                                 </a>`
                                 : '<span style="font-size:0.7rem; color:#94a3b8; font-style:italic;">Sin archivo</span>'
                             }
                        </div>
                    </div>
                    <div class="card-actions">
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
      document.getElementById("manualesSgiTitle").value = item.title;
      document.getElementById("manualesSgiCode").value = item.code || "";
      // Preservar URL actual
      form.setAttribute("data-current-url", item.href || "#");
      saveBtn.innerText = "Actualizar Manual";
      cancelBtn.classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function cancelEdit() {
      form.reset();
      editId.value = "";
      form.removeAttribute("data-current-url");
      saveBtn.innerText = "Guardar Manual";
      cancelBtn.classList.add("hidden");
    }
    cancelBtn.onclick = cancelEdit;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = editId.value;
      let fileUrl = form.getAttribute("data-current-url") || "";

      // 1. Subir archivo si hay uno
      const fileInput = document.getElementById("manualesSgiFile");
      if (fileInput.files.length > 0) {
        const fd = new FormData();
        fd.append("file", fileInput.files[0]);
        try {
          const upRes = await fetch(`${API}/upload`, {
            method: "POST",
            body: fd,
          });
          const upData = await upRes.json();
          fileUrl = upData.fileUrl || "";
        } catch {
          showToast("Error al subir archivo", "error");
          return;
        }
      }

      const data = {
        title: document.getElementById("manualesSgiTitle").value,
        code: document.getElementById("manualesSgiCode").value,
        fileUrl,
      };

      const method = id ? "PUT" : "POST";
      const url = id ? `${API}/${id}` : API;
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          showToast(id ? "Manual actualizado" : "Manual guardado");
          cancelEdit();
          loadList();
        } else showToast("Error al guardar", "error");
      } catch {
        showToast("Error en el proceso", "error");
      }
    };

    async function deleteItem(id) {
      if (!confirm("¿Eliminar este manual? El archivo también se borrará."))
        return;
      try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Manual eliminado");
          loadList();
        } else showToast("Error al eliminar", "error");
      } catch {
        showToast("Error al eliminar", "error");
      }
    }
  })();

  // --- Control Interno Logic ---
  (() => {
    const API_SECTION = "control-interno";
    const form = document.getElementById("controlInternoForm");
    const editId = document.getElementById("controlInternoEditId");
    const nameInput = document.getElementById("controlInternoName");
    const catSelect = document.getElementById("controlInternoCategory");
    const fileInput = document.getElementById("controlInternoFile");
    const listEl = document.getElementById("controlInternoList");
    const saveBtn = document.getElementById("controlInternoSaveBtn");
    const cancelBtn = document.getElementById("controlInternoCancelBtn");
    const filterSel = document.getElementById("controlInternoFilter");
    const countEl = document.getElementById("controlInternoCount");

    let allItems = [];

    // Registrar sección y nav
    sections.controlInterno = document.getElementById("controlInternoSection");
    navItems.controlInterno = document.getElementById("nav-control-interno");

    navItems.controlInterno.onclick = () => {
      hideAll();
      sections.controlInterno.classList.remove("hidden");
      navItems.controlInterno.classList.add("active");
      loadList();
    };

    async function loadList() {
      listEl.innerHTML = '<p style="padding:1rem;">Cargando...</p>';
      try {
        const res = await fetch(`${API_BASE}/sgi/${API_SECTION}`);
        if (!res.ok) throw new Error("Status: " + res.status);
        allItems = await res.json();
        renderList();
      } catch (e) {
        console.error(e);
        listEl.innerHTML = `<p style="color:red; padding:1rem;">Error al cargar: ${e.message}</p>`;
      }
    }

    function renderList() {
      const filterVal = filterSel.value;
      const filtered =
        filterVal === "" || filterVal === "all"
          ? allItems
          : allItems.filter((i) => i.category === filterVal);

      countEl.textContent = `${filtered.length} de ${allItems.length} documentos`;

      if (filtered.length === 0) {
        listEl.innerHTML =
          '<p style="padding:2rem; color:#64748b; text-align:center;">No hay documentos que mostrar.</p>';
        return;
      }

      listEl.innerHTML = "";
      filtered.forEach((item) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.innerHTML = `
                    <div class="news-info">
                        <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.4rem;">
                            <span style="background:#e2e8f0; color:#475569; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:600;">
                                ${item.category}
                            </span>
                            ${
                              item.fileUrl && item.fileUrl !== "#"
                                ? `<a href="${item.fileUrl}" target="_blank" class="admin-file-badge">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                                    Ver Archivo
                                   </a>`
                                : '<span style="font-size:0.7rem; color:#94a3b8; font-style:italic;">Sin archivo</span>'
                            }
                        </div>
                        <h4>${item.name}</h4>
                    </div>
                    <div class="card-actions">
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
              startEdit(allItems.find((i) => i.id === btn.dataset.id))),
        );
    }

    filterSel.onchange = renderList;

    function startEdit(item) {
      if (!item) return;
      editId.value = item.id;
      nameInput.value = item.name;
      catSelect.value = item.category;
      form.setAttribute("data-current-url", item.fileUrl || "#");
      saveBtn.innerText = "Actualizar";
      cancelBtn.classList.remove("hidden");
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function cancelEdit() {
      form.reset();
      editId.value = "";
      form.removeAttribute("data-current-url");
      saveBtn.innerText = "Guardar Documento";
      cancelBtn.classList.add("hidden");
    }
    cancelBtn.onclick = cancelEdit;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = editId.value;
      const name = nameInput.value;
      const category = catSelect.value;
      let fileUrl = form.getAttribute("data-current-url") || "";

      if (fileInput.files.length > 0) {
        const fd = new FormData();
        fd.append("section", API_SECTION);
        fd.append("category", category);
        fd.append("file", fileInput.files[0]);
        try {
          const upRes = await fetch(`${API_BASE}/sgi/upload`, {
            method: "POST",
            body: fd,
          });
          const upData = await upRes.json();
          fileUrl = upData.fileUrl || "";
        } catch {
          showToast("Error al subir archivo", "error");
          return;
        }
      }

      const data = { name, category, fileUrl };
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_BASE}/sgi/${API_SECTION}/${id}`
        : `${API_BASE}/sgi/${API_SECTION}`;
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          showToast(id ? "Documento actualizado" : "Documento guardado");
          cancelEdit();
          loadList();
        } else showToast("Error al guardar", "error");
      } catch {
        showToast("Error en el proceso", "error");
      }
    };

    async function deleteItem(id) {
      if (!confirm("¿Eliminar este documento?")) return;
      try {
        const res = await fetch(`${API_BASE}/sgi/${API_SECTION}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Documento eliminado");
          loadList();
        } else showToast("Error al eliminar", "error");
      } catch {
        showToast("Error al eliminar", "error");
      }
    }
  })();

  // --- Respel Logic ---
  const respelForm = document.getElementById("respelForm");
  const respelItemsList = document.getElementById("respelItemsList");
  const respelEditId = document.getElementById("respelEditId");
  const respelCurrentSection = document.getElementById("respelCurrentSection");
  const respelTabButtons = document.querySelectorAll(".respel-tab");

  let loadedRespelItems = [];

  function switchRespelSection(section) {
    respelCurrentSection.value = section;
    respelTabButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.target === section),
    );

    // Update labels and show/hide fields
    const isEmpresas = section === "empresas";
    document.getElementById("respelNameLabel").innerText = isEmpresas
      ? "Nombre de la Empresa"
      : "Nombre del Documento";
    document.getElementById("respelName").placeholder = isEmpresas
      ? "Ej: Geoambiental LTDA."
      : "Ej: Manual de Residuos";
    document
      .getElementById("respelEmpresasFields")
      .classList.toggle("hidden", !isEmpresas);

    cancelRespelEdit();
    loadRespelList();
  }

  respelTabButtons.forEach((btn) => {
    btn.onclick = () => switchRespelSection(btn.dataset.target);
  });

  async function loadRespelList() {
    const section = respelCurrentSection.value;
    respelItemsList.innerHTML =
      '<p style="padding: 1rem;">Cargando listado...</p>';
    try {
      const res = await fetch(`${API_BASE}/respel/${section}`);
      loadedRespelItems = await res.json();
      renderRespelList();
      updateStats();
    } catch (error) {
      showToast("Error al cargar items", "error");
    }
  }

  function renderRespelList() {
    const section = respelCurrentSection.value;
    if (loadedRespelItems.length === 0) {
      respelItemsList.innerHTML =
        '<p style="padding: 1rem; color: #64748b;">No hay registros encontrados.</p>';
      return;
    }

    respelItemsList.innerHTML = "";
    loadedRespelItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";

      let infoHtml = `<h4>${item.name}</h4><p style="font-size: 0.8rem; color: #64748b;">${item.href}</p>`;
      if (section === "empresas") {
        infoHtml = `
                    <h4>${item.name}</h4>
                    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.4rem;">
                        Acto: ${item.actNum} (${item.actDate}) &nbsp;|&nbsp; 
                        <a href="${item.href}" target="_blank" class="admin-file-badge">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            ${item.fileName}
                        </a>
                    </p>`;
      }

      card.innerHTML = `
                <div class="news-info">${infoHtml}</div>
                <div class="card-actions">
                    <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                </div>
            `;
      respelItemsList.appendChild(card);
    });

    respelItemsList.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.onclick = () => deleteRespelItem(btn.dataset.id);
    });

    respelItemsList.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.onclick = () =>
        startRespelEdit(loadedRespelItems.find((i) => i.id === btn.dataset.id));
    });
  }

  function startRespelEdit(item) {
    if (!item) return;
    respelEditId.value = item.id;
    document.getElementById("respelName").value = item.name;

    if (respelCurrentSection.value === "empresas") {
      document.getElementById("respelActNum").value = item.actNum || "";
      document.getElementById("respelActDate").value = item.actDate || "";
      document.getElementById("respelFileName").value = item.fileName || "";
    }

    document.getElementById("respelSaveBtn").innerText = "Actualizar Item";
    document.getElementById("respelCancelEditBtn").classList.remove("hidden");
    respelForm.setAttribute("data-current-url", item.href);
    respelForm.scrollIntoView({ behavior: "smooth" });
  }

  function cancelRespelEdit() {
    respelForm.reset();
    respelEditId.value = "";
    document.getElementById("respelSaveBtn").innerText = "Guardar Item";
    document.getElementById("respelCancelEditBtn").classList.add("hidden");
  }

  document.getElementById("respelCancelEditBtn").onclick = cancelRespelEdit;

  respelForm.onsubmit = async (e) => {
    e.preventDefault();
    const section = respelCurrentSection.value;
    const id = respelEditId.value;
    const fileInput = document.getElementById("respelFile");
    const file = fileInput.files[0];
    let fileUrl = respelForm.getAttribute("data-current-url") || "#";

    showToast(id ? "Actualizando..." : "Guardando...", "info");

    try {
      if (file) {
        const fd = new FormData();
        fd.append("section", section);
        fd.append("file", file);
        const upRes = await fetch(`${API_BASE}/respel/upload`, {
          method: "POST",
          body: fd,
        });
        const upData = await upRes.json();
        fileUrl = upData.fileUrl;
      }

      const payload = {
        name: document.getElementById("respelName").value,
        fileUrl: fileUrl,
      };

      if (section === "empresas") {
        payload.actNum = document.getElementById("respelActNum").value;
        payload.actDate = document.getElementById("respelActDate").value;
        payload.fileName = document.getElementById("respelFileName").value;
        payload.isAlternate = loadedRespelItems.length % 2 === 1; // Basic zebra striping for new items
      }

      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_BASE}/respel/${section}/${id}`
        : `${API_BASE}/respel/${section}`;

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(id ? "Actualizado" : "Guardado");
        cancelRespelEdit();
        loadRespelList();
      } else {
        showToast("Error al guardar", "error");
      }
    } catch (error) {
      showToast("Error en el proceso", "error");
    }
  };

  async function deleteRespelItem(id) {
    if (
      !confirm("¿Eliminar este registro? El archivo físico también se borrará.")
    )
      return;
    const section = respelCurrentSection.value;
    try {
      const res = await fetch(`${API_BASE}/respel/${section}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Eliminado");
        loadRespelList();
      }
    } catch (e) {
      showToast("Error al eliminar", "error");
    }
  }

  // --- RUA Logic ---
  const ruaForm = document.getElementById("ruaForm");
  const ruaItemsList = document.getElementById("ruaItemsList");
  const ruaEditId = document.getElementById("ruaEditId");
  let loadedRuaItems = [];

  async function loadRuaList() {
    ruaItemsList.innerHTML =
      '<p style="padding: 1rem;">Cargando listado RUA...</p>';
    try {
      const res = await fetch(`${API_BASE}/rua`);
      loadedRuaItems = await res.json();
      renderRuaList();
      updateStats();
    } catch (error) {
      showToast("Error al cargar RUA", "error");
    }
  }

  function renderRuaList() {
    if (loadedRuaItems.length === 0) {
      ruaItemsList.innerHTML =
        '<p style="padding: 1rem; color: #64748b;">No hay registros RUA.</p>';
      return;
    }

    ruaItemsList.innerHTML = "";
    loadedRuaItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `
                <div class="news-info">
                    <h4>${item.name}</h4>
                    <a href="${item.href}" target="_blank" class="admin-file-badge" style="margin-top: 0.4rem;">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        Ver Documento
                    </a>
                </div>
                <div class="card-actions">
                    <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                </div>
            `;
      ruaItemsList.appendChild(card);
    });

    ruaItemsList.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.onclick = () => deleteRuaItem(btn.dataset.id);
    });
    ruaItemsList.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.onclick = () =>
        startRuaEdit(loadedRuaItems.find((i) => i.id === btn.dataset.id));
    });
  }

  function startRuaEdit(item) {
    if (!item) return;
    ruaEditId.value = item.id;
    document.getElementById("ruaName").value = item.name;
    document.getElementById("ruaSaveBtn").innerText = "Actualizar Item";
    document.getElementById("ruaCancelEditBtn").classList.remove("hidden");
    ruaForm.setAttribute("data-current-url", item.href);
  }

  function cancelRuaEdit() {
    ruaForm.reset();
    ruaEditId.value = "";
    document.getElementById("ruaSaveBtn").innerText = "Guardar Item";
    document.getElementById("ruaCancelEditBtn").classList.add("hidden");
  }

  document.getElementById("ruaCancelEditBtn").onclick = cancelRuaEdit;

  ruaForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = ruaEditId.value;
    const fileInput = document.getElementById("ruaFile");
    const file = fileInput.files[0];
    let fileUrl = ruaForm.getAttribute("data-current-url") || "#";

    showToast(id ? "Actualizando..." : "Guardando...", "info");

    try {
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch(`${API_BASE}/rua/upload`, {
          method: "POST",
          body: fd,
        });
        const upData = await upRes.json();
        fileUrl = upData.fileUrl;
      }

      const payload = {
        name: document.getElementById("ruaName").value,
        fileUrl: fileUrl,
      };

      const method = id ? "PUT" : "POST";
      const url = id ? `${API_BASE}/rua/${id}` : `${API_BASE}/rua`;

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(id ? "Actualizado" : "Guardado");
        cancelRuaEdit();
        loadRuaList();
      } else {
        showToast("Error al guardar", "error");
      }
    } catch (error) {
      showToast("Error en el proceso", "error");
    }
  };

  async function deleteRuaItem(id) {
    if (!confirm("¿Eliminar este registro RUA?")) return;
    try {
      const res = await fetch(`${API_BASE}/rua/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Eliminado");
        loadRuaList();
      }
    } catch (e) {
      showToast("Error al eliminar", "error");
    }
  }

  // --- Boletines GIT Logic ---
  const boletinesForm = document.getElementById("boletinesForm");
  const boletinesItemsList = document.getElementById("boletinesItemsList");
  const boletinesEditId = document.getElementById("boletinesEditId");
  let loadedBoletinesItems = [];

  async function loadBoletinesList() {
    boletinesItemsList.innerHTML =
      '<p style="padding: 1rem;">Cargando boletines...</p>';
    try {
      const res = await fetch(`${API_BASE}/boletines`);
      loadedBoletinesItems = await res.json();
      renderBoletinesList();
    } catch (error) {
      showToast("Error al cargar boletines", "error");
    }
  }

  function renderBoletinesList() {
    if (loadedBoletinesItems.length === 0) {
      boletinesItemsList.innerHTML =
        '<p style="padding: 1rem; color: #64748b;">No hay boletines registrados.</p>';
      return;
    }
    boletinesItemsList.innerHTML = "";
    loadedBoletinesItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `
                <div class="news-info">
                    <h4>${item.title}</h4>
                    <div style="display: flex; align-items: center; gap: 0.8rem; margin-top: 0.4rem;">
                        <span style="font-size:0.8rem; color:#64748b;">${item.subtitle || "Sin descripción"}</span>
                        <a href="${item.href}" target="_blank" class="admin-file-badge">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            Ver Boletín
                        </a>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                </div>
            `;
      boletinesItemsList.appendChild(card);
    });

    boletinesItemsList.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.onclick = () => deleteBoletinItem(btn.dataset.id);
    });
    boletinesItemsList.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.onclick = () =>
        startBoletinEdit(
          loadedBoletinesItems.find((i) => i.id === btn.dataset.id),
        );
    });
  }

  function startBoletinEdit(item) {
    if (!item) return;
    boletinesEditId.value = item.id;
    document.getElementById("boletinesTitle").value = item.title;
    document.getElementById("boletinesSubtitle").value = item.subtitle || "";
    document.getElementById("boletinesSaveBtn").innerText =
      "Actualizar Boletín";
    document
      .getElementById("boletinesCancelEditBtn")
      .classList.remove("hidden");
    boletinesForm.setAttribute("data-current-url", item.href);
  }

  function cancelBoletinEdit() {
    boletinesForm.reset();
    boletinesEditId.value = "";
    document.getElementById("boletinesSaveBtn").innerText = "Guardar Boletín";
    document.getElementById("boletinesCancelEditBtn").classList.add("hidden");
  }

  document.getElementById("boletinesCancelEditBtn").onclick = cancelBoletinEdit;

  boletinesForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = boletinesEditId.value;
    const fileInput = document.getElementById("boletinesFile");
    const file = fileInput.files[0];
    let fileUrl = boletinesForm.getAttribute("data-current-url") || "#";

    showToast(id ? "Actualizando..." : "Guardando...", "info");
    try {
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch(`${API_BASE}/boletines/upload`, {
          method: "POST",
          body: fd,
        });
        const upData = await upRes.json();
        fileUrl = upData.fileUrl;
      }

      const payload = {
        title: document.getElementById("boletinesTitle").value,
        subtitle: document.getElementById("boletinesSubtitle").value,
        fileUrl,
      };

      const method = id ? "PUT" : "POST";
      const url = id ? `${API_BASE}/boletines/${id}` : `${API_BASE}/boletines`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(id ? "Boletín actualizado" : "Boletín guardado");
        cancelBoletinEdit();
        loadBoletinesList();
      } else {
        showToast("Error al guardar", "error");
      }
    } catch (error) {
      showToast("Error en el proceso", "error");
    }
  };

  async function deleteBoletinItem(id) {
    if (
      !confirm("¿Eliminar este boletín? El archivo físico también se borrará.")
    )
      return;
    try {
      const res = await fetch(`${API_BASE}/boletines/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Boletín eliminado");
        loadBoletinesList();
      }
    } catch (e) {
      showToast("Error al eliminar", "error");
    }
  }

  // --- News Logic ---
  // ... rest of the file ...
  const sgiForm = document.getElementById("sgiForm");
  const sgiItemsList = document.getElementById("sgiItemsList");
  const sgiEditId = document.getElementById("sgiEditId");
  const sgiCurrentSection = document.getElementById("sgiCurrentSection");
  const sgiCategory = document.getElementById("sgiCategory");
  const sgiSaveBtn = document.getElementById("sgiSaveBtn");
  const sgiCancelEditBtn = document.getElementById("sgiCancelEditBtn");
  const sgiSubtitle = document.getElementById("sgiSubtitle");
  const sgiFilterCategory = document.getElementById("sgiFilterCategory");
  const sgiTabButtons = document.querySelectorAll(".tab-btn");

  let loadedSgiItems = [];

  // --- Stats Logic ---
  async function updateStats() {
    try {
      const [
        newsR,
        eventosR,
        planeacionR,
        mejoraR,
        controlIR,
        respelR,
        empresasR,
        ruaR,
        snifR,
        provisionR,
        convocatoriasR,
        informesR,
        politicasR,
      ] = await Promise.all([
        fetch(`${API_BASE}/news`),
        fetch(`${API_BASE}/eventos`),
        fetch(`${API_BASE}/sgi/planeacion`),
        fetch(`${API_BASE}/sgi/mejora`),
        fetch(`${API_BASE}/sgi/control-interno`),
        fetch(`${API_BASE}/respel/documentos`),
        fetch(`${API_BASE}/respel/empresas`),
        fetch(`${API_BASE}/rua`),
        fetch(`${API_BASE}/snif`),
        fetch(`${API_BASE}/provision-empleos`),
        fetch(`${API_BASE}/convocatorias`),
        fetch(`${API_BASE}/informe-gestion`),
        fetch(`${API_BASE}/politicas-sgi`),
      ]);

      const news = newsR.ok ? await newsR.json() : [];
      const eventos = eventosR.ok ? await eventosR.json() : [];
      const planeacion = planeacionR.ok ? await planeacionR.json() : [];
      const mejora = mejoraR.ok ? await mejoraR.json() : [];
      const controlI = controlIR.ok ? await controlIR.json() : [];
      const respel = respelR.ok ? await respelR.json() : [];
      const empresas = empresasR.ok ? await empresasR.json() : [];
      const rua = ruaR.ok ? await ruaR.json() : [];
      const snif = snifR.ok ? await snifR.json() : [];
      const provision = provisionR.ok ? await provisionR.json() : [];
      const convocatorias = convocatoriasR.ok
        ? await convocatoriasR.json()
        : [];
      const informes = informesR.ok ? await informesR.json() : [];
      const politicas = politicasR.ok ? await politicasR.json() : { items: [] };

      const setStat = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || 0;
      };

      setStat("stat-news-count", news.length);
      setStat("stat-agenda-count", eventos.length); // Ahora unificado
      setStat(
        "stat-sgi-count",
        (planeacion.length || 0) +
          (mejora.length || 0) +
          (controlI.length || 0) +
          (politicas.items?.length || 0),
      );
      setStat("stat-respel-count", respel.length);
      setStat("stat-empresas-count", empresas.length);
      setStat("stat-rua-count", rua.length);
      setStat("stat-snif-count", snif.length);
      setStat("stat-provision-count", provision.length);
      setStat("stat-convocatorias-count", convocatorias.length);
      setStat("stat-informe-count", informes.length);
      setStat(
        "stat-last-update",
        new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        }),
      );
    } catch (e) {
      console.error("Error updating stats", e);
    }
  }

  // Initial call
  updateStats();

  const SGI_CATEGORIES = {
    planeacion: [
      "Anexos",
      "Caracterización",
      "Formatos",
      "Instructivo",
      "Manuales",
      "Mapa de riesgos",
      "Procedimientos",
      "Registros",
      "Mejora Continua",
    ],
    mejora: [
      "Caracterización",
      "Formatos",
      "Instructivos",
      "Mapa de Riesgos",
      "Procedimientos",
    ],
  };

  function switchSgiSection(section) {
    sgiCurrentSection.value = section;
    sgiSubtitle.innerText = `Administra los documentos de ${section === "planeacion" ? "Planeación Estratégica" : "Mejora Continua"}.`;

    // Update Tabs UI
    sgiTabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.target === section);
    });

    // Update Categories Select & Filter Select
    const optionsHtml = SGI_CATEGORIES[section]
      .map((cat) => `<option value="${cat}">${cat}</option>`)
      .join("");
    const filterOptionsHtml =
      `<option value="all">Todas las categor&iacute;as</option>` + optionsHtml;

    sgiCategory.innerHTML = optionsHtml;
    sgiFilterCategory.innerHTML = filterOptionsHtml;

    // Reset Form
    cancelSgiEdit();
    loadSgiList();
  }

  sgiFilterCategory.onchange = () => renderSgiList();

  sgiTabButtons.forEach((btn) => {
    btn.onclick = () => switchSgiSection(btn.dataset.target);
  });

  async function loadSgiList() {
    const section = sgiCurrentSection.value;
    sgiItemsList.innerHTML =
      '<p style="padding: 1rem;">Cargando documentos...</p>';
    try {
      const res = await fetch(`${API_BASE}/sgi/${section}`);
      loadedSgiItems = await res.json();
      renderSgiList();
    } catch (error) {
      showToast("Error al cargar items", "error");
    }
  }

  function renderSgiList() {
    const filter = sgiFilterCategory.value;
    const filteredData =
      filter === "all"
        ? loadedSgiItems
        : loadedSgiItems.filter((item) => item.category === filter);

    if (filteredData.length === 0) {
      sgiItemsList.innerHTML = `<p style="padding: 1rem; color: #64748b;">No hay documentos ${filter !== "all" ? `en la categoría "${filter}"` : "en esta sección"}.</p>`;
      return;
    }

    sgiItemsList.innerHTML = "";
    filteredData.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `
                <div class="news-info">
                    <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.4rem;">
                        <span class="category-tag" style="background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${item.category}</span>
                        <a href="${item.href}" target="_blank" class="admin-file-badge">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                            Ver Archivo
                        </a>
                    </div>
                    <h4>${item.name}</h4>
                </div>
                <div class="card-actions">
                    <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                    <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                </div>
            `;
      sgiItemsList.appendChild(card);
    });

    sgiItemsList.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.onclick = () => deleteSgiItem(btn.dataset.id);
    });

    sgiItemsList.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.onclick = () =>
        startSgiEdit(loadedSgiItems.find((i) => i.id === btn.dataset.id));
    });
  }

  function startSgiEdit(item) {
    if (!item) return;
    document.getElementById("sgiTitle").value = item.name;
    sgiCategory.value = item.category;
    sgiEditId.value = item.id;
    sgiSaveBtn.innerText = "Actualizar Documento";
    sgiCancelEditBtn.classList.remove("hidden");
    document.getElementById("sgiFile").required = false;
    sgiForm.setAttribute("data-current-url", item.href);
    sgiForm.scrollIntoView({ behavior: "smooth" });
  }

  function cancelSgiEdit() {
    sgiForm.reset();
    sgiEditId.value = "";
    sgiSaveBtn.innerText = "Guardar Documento";
    sgiCancelEditBtn.classList.add("hidden");
    document.getElementById("sgiFile").required = true;
  }

  sgiCancelEditBtn.onclick = cancelSgiEdit;

  sgiForm.onsubmit = async (e) => {
    e.preventDefault();
    const section = sgiCurrentSection.value;
    const id = sgiEditId.value;
    const name = document.getElementById("sgiTitle").value;
    const category = sgiCategory.value;
    const fileInput = document.getElementById("sgiFile");
    const file = fileInput.files[0];
    let fileUrl = sgiForm.getAttribute("data-current-url");

    if (!id && !file) return showToast("Selecciona un archivo", "error");

    showToast(id ? "Actualizando..." : "Subiendo...", "info");

    try {
      if (file) {
        const fd = new FormData();
        fd.append("section", section);
        fd.append("category", category);
        fd.append("file", file);

        const upRes = await fetch(`${API_BASE}/sgi/upload`, {
          method: "POST",
          body: fd,
        });
        if (!upRes.ok) {
          const errorText = await upRes.text();
          let errorMessage = "Error al subir el archivo al servidor.";
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch (e) {}
          throw new Error(errorMessage);
        }
        const upData = await upRes.json();
        fileUrl = upData.fileUrl;
      }

      const method = id ? "PUT" : "POST";
      const url = id ? `${API_BASE}/sgi/${section}/${id}` : `${API_BASE}/sgi/${section}`;

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, fileUrl }),
      });

      if (res.ok) {
        showToast(id ? "Actualizado" : "Guardado");
        cancelSgiEdit();
        loadSgiList();
      } else {
        const err = await res.json();
        showToast(err.message, "error");
      }
    } catch (error) {
      showToast("Error en el proceso", "error");
    }
  };

  async function deleteSgiItem(id) {
    if (!confirm("¿Eliminar documento?")) return;
    const section = sgiCurrentSection.value;
    try {
      const res = await fetch(`${API_BASE}/sgi/${section}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Eliminado");
        loadSgiList();
      }
    } catch (e) {
      showToast("Error al eliminar", "error");
    }
  }

  // --- News Logic ---
  async function loadNewsList() {
    const newsItemsList = document.getElementById("newsItemsList");
    newsItemsList.innerHTML = "<p>Cargando noticias...</p>";
    try {
      const res = await fetch(`${API_BASE}/news`);
      const news = await res.json();

      // Actualizar el contador de noticias en el Dashboard
      const statValue = document.querySelector(".stat-value");
      if (statValue) statValue.textContent = news.length;

      newsItemsList.innerHTML = news.length
        ? ""
        : '<p style="padding: 1.5rem;">No hay noticias guardadas en el sistema JSON.</p>';
      news.forEach((item) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.innerHTML = `
                    <img src="${API_BASE.replace("/api","")}${item.imageUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <div class="news-info" style="flex: 1; margin-left: 1rem; overflow: hidden;">
                        <h4 style="margin: 0;">${item.title}</h4>
                        <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.description}</p>
                        <span style="font-size: 0.7rem; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${item.category || "General"}</span>
                    </div>
                    <button class="btn-delete" onclick="deleteNews('${item.id}')">Eliminar</button>
                `;
        newsItemsList.appendChild(card);
      });
    } catch (e) {
      showToast("Error al cargar noticias", "error");
    }
  }

  window.deleteNews = async (id) => {
    if (!confirm("¿Eliminar noticia?")) return;
    await fetch(`${API_BASE}/news/${id}`, { method: "DELETE" });
    loadNewsList();
    showToast("Eliminada");
  };

  // --- Preview dinámico de imagen seleccionada ---
  const imageInput = document.getElementById("imageInput");
  const previewArea = document.getElementById("previewArea");
  const previewCard = document.getElementById("previewCard");

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        showPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  const previewBtn = document.getElementById("previewBtn");
  previewBtn.onclick = () => {
    const title = document.getElementById("title").value || "Título de ejemplo";
    const description =
      document.getElementById("description").value ||
      "Descripción del contenido...";
    const category = document.getElementById("category").value;
    const file = imageInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        showPreview(e.target.result, title, description, category);
      };
      reader.readAsDataURL(file);
    } else {
      showPreview(
        "../data/imagenes/placeholder.jpeg",
        title,
        description,
        category,
      );
    }
  };

  function showPreview(imgSrc, title = "", desc = "", cat = "") {
    previewArea.classList.remove("hidden");
    previewCard.innerHTML = `
            <div class="card news-item" style="max-width: 400px; margin: 0 auto; background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <img src="${imgSrc}" style="width: 100%; height: 200px; object-fit: cover;">
                <div style="padding: 1.5rem;">
                    <span style="font-size: 0.7rem; color: #3b82f6; text-transform: uppercase; font-weight: 700;">${cat}</span>
                    <h3 style="margin: 0.5rem 0;">${title || "Título de la Noticia"}</h3>
                    <p style="font-size: 0.9rem; color: #64748b;">${desc || "Descripción de la noticia..."}</p>
                </div>
            </div>
        `;
    previewArea.scrollIntoView({ behavior: "smooth" });
  }

  document.getElementById("newsForm").onsubmit = async (e) => {
    e.preventDefault();
    showToast("Subiendo imagen...", "info");

    const fd = new FormData();
    fd.append("image", document.getElementById("imageInput").files[0]);

    try {
      const upRes = await fetch(`${API_BASE}/news/upload`, {
        method: "POST",
        body: fd,
      });
      if (!upRes.ok) throw new Error("Error al subir imagen");
      const { imageUrl } = await upRes.json();

      const newsRes = await fetch(`${API_BASE}/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: document.getElementById("title").value,
          category: document.getElementById("category").value,
          description: document.getElementById("description").value,
          imageUrl,
        }),
      });

      if (newsRes.ok) {
        showToast("Noticia publicada con éxito");
        document.getElementById("newsForm").reset();
        previewArea.classList.add("hidden");
        loadNewsList(); // Refrescar lista y estadísticas
      } else {
        showToast("Error al guardar noticia", "error");
      }
    } catch (err) {
      showToast("Error en el servidor", "error");
      console.error(err);
    }
  };

  // --- Agenda Logic ---
  async function loadAgendaList() {
    const list = document.getElementById("agendaItemsList");
    list.innerHTML = "Cargando...";
    const res = await fetch(`${API_BASE}/agenda`);
    const data = await res.json();
    list.innerHTML = "";
    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "news-manage-card";
      card.innerHTML = `<div><h4>${item.title}</h4><p>${item.time}</p></div><button class="btn-delete" onclick="deleteAgenda('${item.id}')">Eliminar</button>`;
      list.appendChild(card);
    });
  }

  window.deleteAgenda = async (id) => {
    await fetch(`${API_BASE}/agenda/${id}`, { method: "DELETE" });
    loadAgendaList();
  };

  if (document.getElementById("agendaForm")) {
    document.getElementById("agendaForm").onsubmit = async (e) => {
      e.preventDefault();
      const rawTime = document.getElementById("agendaTime").value;
      const time = new Date(rawTime).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
      await fetch(`${API_BASE}/agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: document.getElementById("agendaTitle").value,
          time,
        }),
      });
      loadAgendaList();
      document.getElementById("agendaForm").reset();
    };
  }

  // --- SNIF Logic ---
  const SnifAdmin = (() => {
    const API = `${API_BASE}/snif`;
    const MAX_SIZE_MB = 20;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const FORBIDDEN_EXTS = [
      ".exe",
      ".bat",
      ".cmd",
      ".js",
      ".vbs",
      ".sh",
      ".ps1",
      ".msi",
      ".com",
    ];

    const elements = {
      form: document.getElementById("snifForm"),
      name: document.getElementById("snifName"),
      file: document.getElementById("snifFile"),
      saveBtn: document.getElementById("snifSaveBtn"),
      list: document.getElementById("snifItemsList"),
      editId: null,
      cancelBtn: null,
    };

    let items = [];

    function init() {
      if (!elements.form || !elements.list) return;

      // Input oculto para ID en edición
      let existingEditId = document.getElementById("snifEditId");
      if (!existingEditId) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.id = "snifEditId";
        elements.form.appendChild(input);
        existingEditId = input;
      }
      elements.editId = existingEditId;

      // Botón Cancelar Edición
      const cancelContainer = document.getElementById("snifCancelContainer");
      let existingCancelBtn = document.getElementById("snifCancelBtn");
      if (cancelContainer && !existingCancelBtn) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "snifCancelBtn";
        btn.className = "btn-secondary hidden";
        btn.style.marginLeft = "0.5rem";
        btn.innerText = "Cancelar Edición";
        cancelContainer.appendChild(btn);
        existingCancelBtn = btn;
        btn.onclick = resetForm;
      }
      elements.cancelBtn = existingCancelBtn;

      elements.form.onsubmit = handleSubmit;
      load();
    }

    async function load() {
      if (!elements.list) return;
      elements.list.innerHTML =
        '<p style="padding:1rem;">Cargando archivos SNIF...</p>';
      try {
        const res = await fetch(API);
        items = await res.json();
        render();
      } catch (e) {
        showToast("Error al cargar listado SNIF", "error");
      }
    }

    function render() {
      if (items.length === 0) {
        elements.list.innerHTML =
          '<p style="padding:1rem;">No hay archivos SNIF.</p>';
        return;
      }
      elements.list.innerHTML = "";
      items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "news-manage-card";
        card.innerHTML = `
                    <div class="news-info">
                        <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
                            <span style="background:#e2e8f0; color:#475569; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">${(item.type || "PDF").toUpperCase()}</span>
                        </div>
                        <h4 style="margin:0;">${item.name}</h4>
                    </div>
                    <div class="card-actions">
                        <a href="${item.href}" target="_blank" class="btn-secondary" style="text-decoration:none;">Descargar</a>
                        <button class="btn-secondary btn-edit" data-id="${item.id}">Editar</button>
                        <button class="btn-delete" data-id="${item.id}">Eliminar</button>
                    </div>`;
        elements.list.appendChild(card);
      });
      elements.list
        .querySelectorAll(".btn-edit")
        .forEach(
          (btn) =>
            (btn.onclick = () =>
              startEdit(items.find((i) => i.id === btn.dataset.id))),
        );
      elements.list
        .querySelectorAll(".btn-delete")
        .forEach((btn) => (btn.onclick = () => del(btn.dataset.id)));
    }

    async function handleSubmit(e) {
      e.preventDefault();
      const id = elements.editId.value;
      const file = elements.file.files[0];
      if (!id && !file) return showToast("Selecciona un archivo", "info");

      showToast(id ? "Actualizando..." : "Subiendo...", "info");
      const fd = new FormData();
      fd.append("name", elements.name.value);
      if (file) fd.append("file", file);

      try {
        const res = await fetch(id ? `${API}/${id}` : API, {
          method: id ? "PUT" : "POST",
          body: fd,
        });
        if (res.ok) {
          showToast(id ? "Actualizado" : "Subido");
          resetForm();
          load();
        } else showToast("Error al procesar", "error");
      } catch (err) {
        showToast("Error de red", "error");
      }
    }

    function startEdit(item) {
      if (!item) return;
      elements.editId.value = item.id;
      elements.name.value = item.name;
      elements.saveBtn.innerText = "Actualizar";
      if (elements.cancelBtn) elements.cancelBtn.classList.remove("hidden");
      elements.file.required = false;
      elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function resetForm() {
      elements.form.reset();
      elements.editId.value = "";
      elements.saveBtn.innerText = "Subir Archivo";
      if (elements.cancelBtn) elements.cancelBtn.classList.add("hidden");
      elements.file.required = true;
    }

    async function del(id) {
      if (!confirm("¿Eliminar archivo?")) return;
      try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (res.ok) {
          showToast("Eliminado");
          load();
        }
      } catch (err) {
        showToast("Error de red", "error");
      }
    }

    return { init, load };
  })();

  window.SnifAdmin = SnifAdmin;
  if (document.getElementById("snifSection")) SnifAdmin.init();

  // --- CITA Logic ---
  // Moved to cita-admin.js for modularity and isolation.

  // --- Autenticación y Sesión ---
  async function checkSession() {
    try {
      const res = await fetch(`${API_BASE}/auth/check`);
      const data = await res.json();

      if (data.success) {
        const nameEl = document.getElementById("adminUserName");
        const avatarEl = document.getElementById("adminAvatar");
        if (nameEl) nameEl.textContent = data.user.displayName;
        if (avatarEl)
          avatarEl.textContent = data.user.displayName[0].toUpperCase();

        // Aplicar permisos
        applyUserPermissions(data.user);
      } else {
        window.location.href = "login.html";
      }
    } catch (err) {
      console.error("Error al verificar sesión:", err);
      window.location.href = "login.html";
    }
  }

  function applyUserPermissions(user) {
    const p = user.permissions || {};
    const isAdmin = user.role === "superadmin";

    // Mapeo completo y granular de selectores a permisos
    const permissionMap = [
      // General
      { id: "nav-dashboard", perm: true },
      { id: "nav-banner", perm: p.banner },
      { id: "nav-eventos", perm: p.eventos },
      { id: "nav-directorio", perm: p.correos },
      { id: "nav-informe-gestion", perm: p.informe_gestion },

      // NotiCAS
      { id: "nav-new-news", perm: p.news },
      { id: "nav-list-news", perm: p.news },
      { id: "nav-agenda", perm: p.agenda_cas },

      // SGI: Estratégicos
      { id: "nav-sgi", perm: p.sgi_planeacion },
      { id: "nav-mejora", perm: p.sgi_mejora },

      // SGI: Misionales
      { id: "nav-admin-recursos", perm: p.sgi_recursos },
      { id: "nav-planeacion-ambiental", perm: p.sgi_ambiental },
      { id: "nav-vigilancia-control", perm: p.sgi_vigilancia },

      // SGI: Seguimiento
      { id: "nav-control-interno", perm: p.sgi_control },
      { id: "nav-manuales-sgi", perm: p.sgi_manuales },
      { id: "nav-politicas-sgi", perm: p.sgi_politicas },

      // Herramientas
      { id: "nav-respel", perm: p.respel },
      { id: "nav-rua", perm: p.rua },
      { id: "nav-boletines", perm: p.boletines_git },
      { id: "nav-pcb", perm: p.pcb },

      // GIT
      { id: "nav-cita", perm: p.cita },
      { id: "nav-sirh", perm: p.sirh },
      { id: "nav-revision-red", perm: p.revision_red },
      { id: "nav-snif", perm: p.snif },

      // Talento Humano
      { id: "nav-manual-funciones", perm: p.manual_funciones },
      { id: "nav-plan-monitoreo", perm: p.sigep },
      { id: "nav-planes-talento", perm: p.planes_talento },
      { id: "nav-convocatorias", perm: p.convocatorias },
      { id: "nav-estudios-tecnicos", perm: p.estudios_tecnicos },
      { id: "nav-provision-empleos", perm: p.provision_empleos },

      // Seguridad
      { id: "nav-users", perm: p.users },
      { id: "nav-group-security", perm: p.users },
    ];

    permissionMap.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) {
        if (isAdmin || item.perm) {
          el.classList.remove("hidden");
        } else {
          el.classList.add("hidden");
        }
      }
    });

    // Lógica para ocultar Títulos de Grupo si no hay hijos visibles
    const groups = [
      {
        id: "nav-group-noticas",
        items: ["nav-new-news", "nav-list-news", "nav-agenda"],
      },
      { id: "nav-group-sgi-est", items: ["nav-sgi", "nav-mejora"] },
      {
        id: "nav-group-sgi-mis",
        items: [
          "nav-admin-recursos",
          "nav-planeacion-ambiental",
          "nav-vigilancia-control",
        ],
      },
      {
        id: "nav-group-sgi-seg",
        items: ["nav-control-interno", "nav-manuales-sgi", "nav-politicas-sgi"],
      },
      {
        id: "nav-group-herramientas",
        items: ["nav-respel", "nav-rua", "nav-boletines", "nav-pcb"],
      },
      {
        id: "nav-group-git",
        items: ["nav-cita", "nav-sirh", "nav-revision-red", "nav-snif"],
      },
      {
        id: "nav-group-talento",
        items: [
          "nav-manual-funciones",
          "nav-plan-monitoreo",
          "nav-planes-talento",
          "nav-convocatorias",
          "nav-estudios-tecnicos",
          "nav-provision-empleos",
        ],
      },
    ];

    groups.forEach((group) => {
      const groupEl = document.getElementById(group.id);
      if (groupEl) {
        const hasVisibleItem = group.items.some((itemId) => {
          const el = document.getElementById(itemId);
          return el && !el.classList.contains("hidden");
        });
        if (hasVisibleItem || isAdmin) {
          groupEl.classList.remove("hidden");
        } else {
          groupEl.classList.add("hidden");
        }
      }
    });

    // Ocultar botones de acceso rápido en el dashboard
    const dashboardButtons = document.querySelectorAll(
      "#dashboardSection .btn-secondary",
    );
    dashboardButtons.forEach((btn) => {
      const text = btn.textContent.toLowerCase();
      let show = isAdmin;

      if (text.includes("noticia") && p.news) show = true;
      if (text.includes("evento") && p.eventos) show = true;
      if (text.includes("planeación") && p.sgi_planeacion) show = true;
      if (text.includes("mejora") && p.sgi_mejora) show = true;
      if (text.includes("snif") && p.snif) show = true;
      if (text.includes("provisión") && p.provision_empleos) show = true;
      if (text.includes("convocatorias") && p.convocatorias) show = true;
      if (text.includes("planes") && p.planes_talento) show = true;
      if (text.includes("revisión") && p.revision_red) show = true;
      if (text.includes("informe") && p.informe_gestion) show = true;
      if (text.includes("respel") && p.respel) show = true;

      if (show) btn.classList.remove("hidden");
      else btn.classList.add("hidden");
    });
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.onclick = async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_BASE}/auth/logout`);
        window.location.href = "login.html";
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
        window.location.href = "login.html";
      }
    };
  }

  // --- Helper ---
  window.showToast = showToast;
  function showToast(message, type = "success") {
    toast.innerHTML = message;
    toast.style.backgroundColor =
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6";
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }
});


