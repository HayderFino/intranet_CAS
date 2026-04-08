// ===================================
// Script.js - Intranet CAS
// ===================================

// Capturar la URL base del proyecto a partir de la ruta de este script
const scriptSrc = document.currentScript ? document.currentScript.src : window.location.href;
const BASE_PATH = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);

// --- Carrusel Dinámico ---
let currentSlide = 0;

function moveCarousel(direction) {
  const track = document.getElementById("carouselTrack");
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".dot");

  if (!track || slides.length === 0) return;

  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSlide);
  });
}

function initCarousel() {
  const track = document.getElementById("carouselTrack");
  const dotsContainer = document.getElementById("carouselDots");
  const slides = document.querySelectorAll(".carousel-slide");

  if (!track || !dotsContainer || slides.length === 0) return;

  // Limpiar dots previos para evitar duplicados
  dotsContainer.innerHTML = "";

  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.onclick = () => {
      currentSlide = index;
      moveCarousel(0);
    };
    dotsContainer.appendChild(dot);
  });

  // --- Auto-play del carrusel cada 5s
  setInterval(() => moveCarousel(1), 5000);
}

// --- Carga dinámica del Banner ---
async function loadDynamicBanner() {
  const bannerContainer = document.getElementById("banner-container");
  if (!bannerContainer) return;

  try {
    const response = await fetch(BASE_PATH + "api/banner");
    if (!response.ok) throw new Error("Error al obtener banners");
    const banners = await response.json();

    if (banners.length === 0) {
      bannerContainer.style.display = "none";
      return;
    }

    // Estructura del Carousel (usando clases existentes en styles.css)
    bannerContainer.innerHTML = `
            <div class="carousel-container">
                <div class="carousel-track" id="carouselTrack">
                    ${banners
                      .map((banner) => {
                        const targetUrl = banner.fileUrl || banner.link || "#";
                        const hasLink = targetUrl !== "#";
                        return `
                        <div class="carousel-slide">
                            ${hasLink ? `<a href="${targetUrl}" target="_blank">` : ""}
                                <img src="${banner.imageUrl}" alt="${banner.title}" title="${banner.title}">
                            ${hasLink ? "</a>" : ""}
                        </div>
                    `;
                      })
                      .join("")}
                </div>

                
                <button class="carousel-btn btn-prev" onclick="moveCarousel(-1)">&#10094;</button>
                <button class="carousel-btn btn-next" onclick="moveCarousel(1)">&#10095;</button>
                
                <div class="carousel-dots" id="carouselDots"></div>
            </div>
        `;

    // Inicializar lógica de movimiento tras renderizar
    initCarousel();
  } catch (error) {
    console.error("Error al cargar banner dinámico:", error);
    bannerContainer.style.display = "none";
  }
}

// --- Inicialización General ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Lógica del botón Ingresar (Generalización para cualquier página) ---
  const loginBtns = document.querySelectorAll(".btn-login");
  loginBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Usamos BASE_PATH calculado al inicio para ir al login desde cualquier subcarpeta
      e.preventDefault();
      window.location.href = BASE_PATH + "administracion/login.html";
    });
  });

  // --- Lógica de Búsqueda Global (Header) ---
  const headerSearchInput = document.querySelector(".search-bar input");
  if (headerSearchInput) {
    headerSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = headerSearchInput.value.trim();
        if (query) {
          window.location.href = BASE_PATH + `herramientas/busqueda.html?q=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // --- Carga dinámica de noticias ---
  const rawGrids = [
    document.querySelector(".news-grid"),
    document.getElementById("noticas-grid"),
    document.getElementById("news-grid-main"),
  ];
  // Filtrar elementos duplicados o nulos
  const newsGrids = [...new Set(rawGrids.filter((el) => el !== null))];

  newsGrids.forEach((newsGrid) => {
    if (newsGrid) {
      // Limpiar si hay placeholder o items previos
      newsGrid.innerHTML = "";

      fetch(BASE_PATH + "api/news")
        .then((res) => res.json())
        .then((news) => {
          if (news && news.length > 0) {
            // Invertimos para que al hacer prepend queden en orden cronológico (más reciente arriba)
            // O simplemente usamos append si ya vienen ordenados (el modelo ya hace unshift)
            news.forEach((item) => {
              const newsCard = document.createElement("div");
              newsCard.className = "card news-item dynamic-news";
              newsCard.style.cursor = "pointer";
              newsCard.innerHTML = `
                                <img src="${item.imageUrl}" alt="${item.title}" class="news-image" style="width: 100%; border-radius: 1rem; height: 200px; object-fit: cover;">
                                <div class="news-body" style="padding: 1.5rem;">
                                    <h3 style="margin-top: 0; font-size: 1.1rem; line-height: 1.4;">${item.title}</h3>
                                    <p class="news-description-truncated" style="font-size: 0.9rem; color: var(--text-light); margin-top: 0.5rem;">${item.description}</p>
                                </div>
                            `;

              newsCard.onclick = () => openNewsModal(item);
              newsGrid.appendChild(newsCard);
            });
          } else {
            newsGrid.innerHTML =
              '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 2rem;">No hay noticias que mostrar en este momento.</p>';
          }
        })
        .catch((err) => {
          console.error("Error al cargar noticias:", err);
          newsGrid.innerHTML =
            '<p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 2rem;">Error al cargar las noticias.</p>';
        });
    }
  });

  // Cargar banner dinámico
  loadDynamicBanner();

  // Inicializar carrusel si existe en la página fijo (ahora redundante si es dinámico, pero seguro dejarlo)
  // initCarousel(); // Se llama dentro de loadDynamicBanner

  // Activar nav link seleccionado
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Efecto de entrada suave en tarjetas
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.5s ease forwards";
    card.style.transitionDelay = `${index * 0.08}s`;

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 50);
  });

  // Expandir boletines (si existe en la página)
  window.toggleExpand = (button) => {
    const card = button.closest(".bulletin-card");
    const content = card.querySelector(".bulletin-expanded-content");
    const isActive = content.classList.contains("active");

    document.querySelectorAll(".bulletin-expanded-content").forEach((el) => {
      if (el !== content) {
        el.classList.remove("active");
        const otherBtn =
          el.previousElementSibling?.querySelector(".btn-expand");
        if (otherBtn) otherBtn.innerHTML = "Ver m&aacute;s &#9662;";
      }
    });

    content.classList.toggle("active");
    button.innerHTML = isActive ? "Ver m&aacute;s &#9662;" : "Cerrar &#9652;";
  };

  // Toast global (para páginas que no tienen el de admin)
  window.showToast = (message, type = "success") => {
    const existing = document.querySelector(".global-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "global-toast";
    toast.textContent = message;
    toast.style.cssText = `
            position: fixed; bottom: 2rem; right: 2rem;
            background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
            color: white; padding: 1rem 1.5rem; border-radius: 0.75rem;
            font-weight: 600; z-index: 9999; font-family: 'Inter', sans-serif;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };
  // --- Feed de Actividad Reciente ---
  const loadRecentActivity = async () => {
    const feedContainer = document.getElementById("recent-activity-feed");
    if (!feedContainer) return;

    try {
      // Fetch múltiples fuentes en paralelo
      const endpoints = [
        { url: BASE_PATH + "api/eventos", type: "evento" },
        { url: BASE_PATH + "api/news", type: "noticia" },
        { url: BASE_PATH + "api/informe-gestion", type: "informe" },
        {
          url: BASE_PATH + "api/estudios-tecnicos",
          type: "manual",
          cat: "Estudio Técnico",
        },
        {
          url: BASE_PATH + "api/provision-empleos",
          type: "manual",
          cat: "Provisión Empleo",
        },
        { url: BASE_PATH + "api/convocatorias", type: "manual", cat: "Convocatoria" },
        { url: BASE_PATH + "api/plan-monitoreo", type: "manual", cat: "Plan Monitoreo" },
        { url: BASE_PATH + "api/planes-talento", type: "manual", cat: "Plan Talento" },
        {
          url: BASE_PATH + "api/manual-funciones",
          type: "manual",
          cat: "Manual Funciones",
        },
        { url: BASE_PATH + "api/cita", type: "manual", cat: "CITA" },
        { url: BASE_PATH + "api/sirh", type: "manual", cat: "SIRH" },
        { url: BASE_PATH + "api/snif", type: "manual", cat: "SNIF" },
        { url: BASE_PATH + "api/revision-red", type: "manual", cat: "REVISIÓN RED" },
      ];

      const responses = await Promise.all(
        endpoints.map((e) =>
          fetch(e.url)
            .then((res) => res.json())
            .catch(() => []),
        ),
      );

      // Combinar y enriquecer datos
      let activity = [];
      responses.forEach((data, index) => {
        if (!Array.isArray(data)) return;

        const type = endpoints[index].type;
        const cat = endpoints[index].cat;

        data.forEach((item) => {
          // Normalizar campos para el feed
          let timestamp;
          if (item.createdAt) {
            timestamp = new Date(item.createdAt);
          } else if (item.id && !isNaN(item.id) && item.id.length > 10) {
            timestamp = new Date(parseInt(item.id));
          } else {
            // Legacy item (no createdAt and non-numeric long ID)
            timestamp = null;
          }

          let normalized = {
            id: item.id || Date.now(),
            type: type,
            timestamp: timestamp,
            title: "",
            desc: "",
            icon: "",
          };

          const docIcon =
            '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>';

          if (type === "evento") {
            normalized.title =
              (item.tipo || "Evento") === "Agenda"
                ? "Nueva Agenda"
                : "Nuevo Evento";
            normalized.desc = item.titulo || "Sin título";
            normalized.icon =
              '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>';
          } else if (type === "noticia") {
            normalized.title = "Nueva Noticia";
            normalized.desc = item.title || "Sin título";
            normalized.icon =
              '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 18H5V4h14v16zM7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"/></svg>';
          } else if (type === "manual") {
            normalized.title =
              cat.startsWith("Manual") ||
              cat.startsWith("REVISIÓN") ||
              cat === "CITA" ||
              cat === "SIRH" ||
              cat === "SNIF"
                ? `Manual ${cat}`
                : `Nuevo ${cat}`;
            normalized.desc =
              item.name || item.title || item.titulo || "Documento cargado";
            normalized.icon = docIcon;
          } else if (type === "informe") {
            normalized.title = "Informe de Gestión";
            normalized.desc = item.title || "Nuevo informe cargado";
            normalized.icon = docIcon;
          }

          activity.push(normalized);
        });
      });

      // Ordenar por fecha (más reciente primero)
      activity.sort((a, b) => b.timestamp - a.timestamp);

      if (activity.length === 0) {
        feedContainer.innerHTML =
          '<p class="feed-placeholder">No hay actividad reciente.</p>';
        return;
      }

      feedContainer.innerHTML = "";
      // Mostrar los últimos 6 movimientos
      activity.slice(0, 6).forEach((item) => {
        const feedItem = document.createElement("div");
        feedItem.className = "feed-item";

        // Formatear fecha de forma amigable
        let dateDisplay = "Reciente";
        if (!isNaN(item.timestamp)) {
          const now = new Date();
          const diffDays = Math.floor(
            (now - item.timestamp) / (1000 * 60 * 60 * 24),
          );
          if (diffDays === 0) dateDisplay = "Hoy";
          else if (diffDays === 1) dateDisplay = "Ayer";
          else dateDisplay = item.timestamp.toLocaleDateString();
        }

        feedItem.innerHTML = `
                    <div class="feed-icon">${item.icon}</div>
                    <div class="feed-content">
                        <h4>${item.title}</h4>
                        <p>${item.desc}</p>
                        <span class="feed-date">${dateDisplay}</span>
                    </div>
                `;
        feedContainer.appendChild(feedItem);
      });
    } catch (err) {
      console.error("Error al cargar actividad reciente:", err);
      feedContainer.innerHTML =
        '<p class="feed-placeholder">Error al cargar actividad.</p>';
    }
  };

  loadRecentActivity();
});

// --- Funciones de Noticias (Vista Expandida) ---
window.openNewsModal = (item) => {
  // Si no existe el overlay en el DOM lo creamos
  let overlay = document.querySelector(".modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closeNewsModal()">&times;</button>
                <div id="modal-news-data"></div>
            </div>
        `;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeNewsModal();
    };
    document.body.appendChild(overlay);
  }

  const modalData = document.getElementById("modal-news-data");
  modalData.innerHTML = `
        <div style="width: 100%; background: #0f172a; border-radius: 1rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: center; overflow: hidden; height: 450px; box-shadow: var(--shadow);">
            <img src="${item.imageUrl}" alt="${item.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <span style="background: rgba(5, 150, 105, 0.1); color: var(--primary); padding: 4px 12px; border-radius: 99px; font-size: 0.8rem; font-weight: 600;">${item.category || "Noticias"}</span>
        <h2 style="margin: 1rem 0; font-size: 2rem; color: #0f172a; line-height: 1.2;">${item.title}</h2>
        <div style="font-size: 1.1rem; color: #475569; line-height: 1.7; white-space: pre-wrap;">${item.description}</div>
        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; font-size: 0.8rem; color: #94a3b8;">
            Publicado el ${new Date(item.createdAt || Date.now()).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
        </div>
    `;

  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeNewsModal = () => {
  const overlay = document.querySelector(".modal-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
};
