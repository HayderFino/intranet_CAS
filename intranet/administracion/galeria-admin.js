/**
 * galeria-admin.js
 * Administración de la Galería Fotográfica — Intranet CAS
 */

window.GaleriaAdmin = (() => {
  const API = '../api.php?route=';
  let albums = [];
  let currentAlbum = null;   // { slug, name }
  let currentPhotos = [];

  // ─────────────────────────────────────────────────────────
  //  RENDER PRINCIPAL
  // ─────────────────────────────────────────────────────────
  function renderSection() {
    const section = document.getElementById('galeriaSection');
    if (!section) return;
    section.innerHTML = buildHTML();
    bindEvents();
    loadAlbums();
  }

  function buildHTML() {
    return `
    <div class="admin-form-container" style="max-width:100%">
      <h2>📷 Administración de Galería Fotográfica</h2>
      <p style="color:#64748b;font-size:.88rem;margin-bottom:1.5rem">
        Crea álbumes y sube fotografías institucionales. Soporta carga múltiple de imágenes.
      </p>

      <!-- Volver btn (oculto al inicio) -->
      <div id="ga-back-bar" style="display:none;margin-bottom:1.5rem">
        <button id="ga-back-btn" class="btn-secondary" style="display:flex;align-items:center;gap:.5rem">
          <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Volver a Álbumes
        </button>
      </div>

      <!-- ─── Vista: Álbumes ─── -->
      <div id="ga-albums-view">
        <!-- Crear álbum -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:1.5rem;margin-bottom:2rem">
          <h3 style="margin:0 0 1rem;font-size:1rem;color:#1e293b">Crear nuevo álbum</h3>
          <form id="ga-album-form" style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
            <div class="form-group" style="flex:1;min-width:180px;margin:0">
              <label for="ga-album-name">Nombre del álbum *</label>
              <input type="text" id="ga-album-name" placeholder="Ej: Jornada de Reforestación 2025" required>
            </div>
            <div class="form-group" style="flex:2;min-width:220px;margin:0">
              <label for="ga-album-desc">Descripción (opcional)</label>
              <input type="text" id="ga-album-desc" placeholder="Breve descripción del álbum">
            </div>
            <div>
              <button type="submit" class="btn-primary" id="ga-album-save-btn">Crear Álbum</button>
            </div>
          </form>
        </div>

        <!-- Lista de álbumes -->
        <h3 style="margin-bottom:1rem;color:#1e293b">Álbumes existentes</h3>
        <div id="ga-albums-list">
          <div class="loading-spinner-inline">Cargando álbumes…</div>
        </div>
      </div>

      <!-- ─── Vista: Fotos dentro de un álbum ─── -->
      <div id="ga-photos-view" style="display:none">
        <h3 id="ga-album-title" style="margin-bottom:1.2rem;color:#1e293b"></h3>

        <!-- Upload zone -->
        <div id="ga-dropzone"
          style="border:2px dashed #cbd5e1;border-radius:14px;padding:2.5rem 2rem;text-align:center;background:#f8fafc;cursor:pointer;transition:border-color .2s,background .2s;margin-bottom:1.5rem"
          ondragover="GaleriaAdmin.onDragOver(event)"
          ondragleave="GaleriaAdmin.onDragLeave(event)"
          ondrop="GaleriaAdmin.onDrop(event)"
          onclick="document.getElementById('ga-file-input').click()">
          <svg viewBox="0 0 24 24" style="width:48px;height:48px;fill:#94a3b8;margin-bottom:.8rem">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
          <p style="color:#475569;font-weight:600;margin:0">Arrastra imágenes aquí o haz clic para seleccionar</p>
          <p style="color:#94a3b8;font-size:.82rem;margin:.4rem 0 0">JPG, PNG, GIF, WebP — múltiples archivos soportados</p>
          <input type="file" id="ga-file-input" accept="image/*" multiple style="display:none" onchange="GaleriaAdmin.onFilesSelected(event)">
        </div>

        <!-- Upload queue preview -->
        <div id="ga-upload-queue" style="display:none;margin-bottom:1.5rem">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem">
            <span id="ga-queue-count" style="font-weight:600;color:#1e293b"></span>
            <div style="display:flex;gap:.5rem">
              <button class="btn-secondary" onclick="GaleriaAdmin.clearQueue()">Limpiar</button>
              <button class="btn-primary" id="ga-upload-btn" onclick="GaleriaAdmin.uploadQueue()">Subir Imágenes</button>
            </div>
          </div>
          <div id="ga-queue-previews" style="display:flex;flex-wrap:wrap;gap:.6rem"></div>
          <div id="ga-upload-progress" style="display:none;margin-top:1rem">
            <div style="background:#e2e8f0;border-radius:99px;height:8px;overflow:hidden">
              <div id="ga-progress-bar" style="height:100%;background:linear-gradient(90deg,#1a3c5e,#2d6a4f);width:0%;transition:width .3s;border-radius:99px"></div>
            </div>
            <p id="ga-progress-text" style="font-size:.82rem;color:#64748b;margin-top:.4rem;text-align:center"></p>
          </div>
        </div>

        <!-- Caption input -->
        <div class="form-group" style="max-width:400px">
          <label for="ga-caption">Descripción / pie de foto (opcional, aplica a todas las imágenes subidas)</label>
          <input type="text" id="ga-caption" placeholder="Ej: Jornada ambiental – Mayo 2025">
        </div>

        <!-- Photos list -->
        <h4 style="margin:1.5rem 0 .8rem;color:#1e293b" id="ga-photos-count-title">Fotos en este álbum</h4>
        <div id="ga-photos-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem"></div>
      </div>

      <!-- Toast notification -->
      <div id="ga-toast" style="
        position:fixed;bottom:2rem;right:2rem;z-index:9999;
        background:#1e293b;color:#fff;padding:.8rem 1.4rem;border-radius:10px;
        font-size:.88rem;box-shadow:0 4px 20px rgba(0,0,0,.25);
        transform:translateY(100px);opacity:0;transition:transform .3s,opacity .3s;
        pointer-events:none;max-width:320px;
      "></div>
    </div>`;
  }

  // ─────────────────────────────────────────────────────────
  //  EVENTS
  // ─────────────────────────────────────────────────────────
  function bindEvents() {
    document.getElementById('ga-album-form').addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('ga-album-name').value.trim();
      const desc = document.getElementById('ga-album-desc').value.trim();
      if (!name) return;
      const btn = document.getElementById('ga-album-save-btn');
      btn.disabled = true; btn.textContent = 'Creando…';
      try {
        const res = await fetch(API + 'galeria/album', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, descripcion: desc })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast('✅ Álbum creado correctamente');
          document.getElementById('ga-album-name').value = '';
          document.getElementById('ga-album-desc').value = '';
          await loadAlbums();
        } else {
          toast('❌ ' + (data.message || 'Error al crear álbum'), true);
        }
      } catch { toast('❌ Error de red', true); }
      btn.disabled = false; btn.textContent = 'Crear Álbum';
    });

    document.getElementById('ga-back-btn').addEventListener('click', showAlbumsView);
  }

  // ─────────────────────────────────────────────────────────
  //  LOAD ALBUMS
  // ─────────────────────────────────────────────────────────
  async function loadAlbums() {
    const list = document.getElementById('ga-albums-list');
    if (!list) return;
    list.innerHTML = '<div class="loading-spinner-inline">Cargando…</div>';
    try {
      const res = await fetch(API + 'galeria');
      albums = await res.json();
      renderAlbumsList();
    } catch {
      list.innerHTML = '<p style="color:#ef4444">Error al cargar álbumes.</p>';
    }
  }

  function renderAlbumsList() {
    const list = document.getElementById('ga-albums-list');
    if (!list) return;
    if (!albums.length) {
      list.innerHTML = `<div style="text-align:center;padding:2rem;color:#94a3b8">
        <p>No hay álbumes aún. Crea el primero arriba.</p>
      </div>`;
      return;
    }
    list.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.2rem">
      ${albums.map(albumCard).join('')}
    </div>`;
  }

  function albumCard(a) {
    const cover = a.cover
      ? `<img src="${a.cover}" alt="${escHtml(a.name)}" style="width:100%;height:130px;object-fit:cover;display:block" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const ph = `<div style="${a.cover ? 'display:none;' : ''}width:100%;height:130px;background:linear-gradient(135deg,#1a3c5e,#2d6a4f);display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" style="width:40px;height:40px;fill:rgba(255,255,255,.4)"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>
    </div>`;
    return `<div style="border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.06)">
      ${cover}${ph}
      <div style="padding:.9rem 1rem">
        <div style="font-weight:700;color:#1e293b;margin-bottom:.2rem">${escHtml(a.name)}</div>
        ${a.descripcion ? `<div style="font-size:.78rem;color:#64748b;margin-bottom:.4rem;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${escHtml(a.descripcion)}</div>` : ''}
        <div style="font-size:.78rem;color:#94a3b8;margin-bottom:.8rem">🖼 ${a.photoCount} foto${a.photoCount !== 1 ? 's' : ''}</div>
        <div style="display:flex;gap:.5rem">
          <button class="btn-secondary" style="font-size:.8rem;padding:.4rem .9rem;flex:1"
            onclick="GaleriaAdmin.openAlbum('${escHtml(a.slug)}','${escHtml(a.name)}')">
            Gestionar
          </button>
          <button class="btn-secondary" style="font-size:.8rem;padding:.4rem .9rem;color:#ef4444;border-color:#fca5a5"
            onclick="GaleriaAdmin.deleteAlbum('${escHtml(a.slug)}','${escHtml(a.name)}')">
            Eliminar
          </button>
        </div>
      </div>
    </div>`;
  }

  // ─────────────────────────────────────────────────────────
  //  OPEN ALBUM
  // ─────────────────────────────────────────────────────────
  function openAlbum(slug, name) {
    currentAlbum = { slug, name };
    document.getElementById('ga-albums-view').style.display = 'none';
    document.getElementById('ga-photos-view').style.display = '';
    document.getElementById('ga-back-bar').style.display = '';
    document.getElementById('ga-album-title').textContent = '📂 ' + name;
    clearQueue();
    loadPhotos();
  }

  function showAlbumsView() {
    currentAlbum = null;
    currentPhotos = [];
    document.getElementById('ga-albums-view').style.display = '';
    document.getElementById('ga-photos-view').style.display = 'none';
    document.getElementById('ga-back-bar').style.display = 'none';
    loadAlbums();
  }

  async function loadPhotos() {
    const list = document.getElementById('ga-photos-list');
    list.innerHTML = '<div class="loading-spinner-inline">Cargando fotos…</div>';
    try {
      const res = await fetch(API + 'galeria/' + currentAlbum.slug);
      const data = await res.json();
      currentPhotos = data.photos || [];
      renderPhotos();
    } catch {
      list.innerHTML = '<p style="color:#ef4444">Error al cargar fotos.</p>';
    }
  }

  function renderPhotos() {
    const list = document.getElementById('ga-photos-list');
    const titleEl = document.getElementById('ga-photos-count-title');
    if (titleEl) titleEl.textContent = `Fotos en este álbum (${currentPhotos.length})`;
    if (!currentPhotos.length) {
      list.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:#94a3b8">Aún no hay fotos. ¡Sube las primeras!</div>`;
      return;
    }
    list.innerHTML = currentPhotos.map(p => `
      <div style="border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;background:#f8fafc;position:relative;group">
        <img src="${p.url}" alt="${escHtml(p.name)}" loading="lazy"
          style="width:100%;height:120px;object-fit:cover;display:block" />
        <div style="padding:.4rem .6rem;font-size:.75rem;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${escHtml(p.caption || p.name)}
        </div>
        <button onclick="GaleriaAdmin.deletePhoto('${p.id}','${escHtml(p.name)}')"
          style="position:absolute;top:.4rem;right:.4rem;background:rgba(239,68,68,.85);color:#fff;border:none;
          border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:1rem;line-height:1;display:flex;
          align-items:center;justify-content:center"
          title="Eliminar foto">&#x2715;</button>
      </div>
    `).join('');
  }

  // ─────────────────────────────────────────────────────────
  //  DRAG & DROP / FILE SELECT
  // ─────────────────────────────────────────────────────────
  let fileQueue = [];

  function onDragOver(e) {
    e.preventDefault();
    const dz = document.getElementById('ga-dropzone');
    dz.style.borderColor = '#1a3c5e';
    dz.style.background = '#e0f2fe';
  }

  function onDragLeave(e) {
    const dz = document.getElementById('ga-dropzone');
    dz.style.borderColor = '#cbd5e1';
    dz.style.background = '#f8fafc';
  }

  function onDrop(e) {
    e.preventDefault();
    onDragLeave(e);
    addToQueue(Array.from(e.dataTransfer.files));
  }

  function onFilesSelected(e) {
    addToQueue(Array.from(e.target.files));
    e.target.value = '';
  }

  function addToQueue(files) {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    fileQueue.push(...imgs);
    renderQueue();
  }

  function renderQueue() {
    const queueDiv = document.getElementById('ga-upload-queue');
    const prevsDiv = document.getElementById('ga-queue-previews');
    const countEl  = document.getElementById('ga-queue-count');
    if (!fileQueue.length) { queueDiv.style.display = 'none'; return; }
    queueDiv.style.display = '';
    countEl.textContent = `${fileQueue.length} imagen${fileQueue.length !== 1 ? 'es' : ''} lista${fileQueue.length !== 1 ? 's' : ''} para subir`;
    prevsDiv.innerHTML = '';
    fileQueue.forEach((f, i) => {
      const url = URL.createObjectURL(f);
      const el = document.createElement('div');
      el.style.cssText = 'position:relative;width:72px;height:72px;border-radius:8px;overflow:hidden;border:2px solid #e2e8f0;flex-shrink:0';
      el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover" />
        <button onclick="GaleriaAdmin.removeFromQueue(${i})"
          style="position:absolute;top:1px;right:1px;background:rgba(0,0,0,.6);color:#fff;border:none;
          border-radius:50%;width:18px;height:18px;font-size:.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>`;
      prevsDiv.appendChild(el);
    });
  }

  function removeFromQueue(i) {
    fileQueue.splice(i, 1);
    renderQueue();
  }

  function clearQueue() {
    fileQueue = [];
    const queueDiv = document.getElementById('ga-upload-queue');
    if (queueDiv) queueDiv.style.display = 'none';
  }

  // ─────────────────────────────────────────────────────────
  //  UPLOAD
  // ─────────────────────────────────────────────────────────
  async function uploadQueue() {
    if (!fileQueue.length || !currentAlbum) return;
    const caption  = (document.getElementById('ga-caption')?.value || '').trim();
    const btn      = document.getElementById('ga-upload-btn');
    const progress = document.getElementById('ga-upload-progress');
    const bar      = document.getElementById('ga-progress-bar');
    const text     = document.getElementById('ga-progress-text');

    btn.disabled = true;
    progress.style.display = '';

    // Upload in batches of 5 (to avoid PHP upload limits)
    const BATCH = 5;
    let done = 0;
    const total = fileQueue.length;

    for (let i = 0; i < total; i += BATCH) {
      const batch = fileQueue.slice(i, i + BATCH);
      const fd = new FormData();
      fd.append('album', currentAlbum.slug);
      fd.append('caption', caption);
      batch.forEach(f => fd.append('images[]', f));

      try {
        const res = await fetch(API + 'galeria/upload', { method: 'POST', body: fd });
        const data = await res.json();
        done += (data.uploaded?.length || 0);
      } catch { /* continue */ }

      const pct = Math.round(((i + batch.length) / total) * 100);
      bar.style.width = pct + '%';
      text.textContent = `Subiendo… ${Math.min(i + batch.length, total)} / ${total}`;
    }

    btn.disabled = false;
    progress.style.display = 'none';
    bar.style.width = '0%';
    fileQueue = [];
    clearQueue();
    document.getElementById('ga-caption').value = '';
    toast(`✅ ${done} imagen${done !== 1 ? 'es' : ''} subida${done !== 1 ? 's' : ''} correctamente`);
    loadPhotos();
  }

  // ─────────────────────────────────────────────────────────
  //  DELETE
  // ─────────────────────────────────────────────────────────
  async function deletePhoto(id, name) {
    if (!confirm(`¿Eliminar la foto "${name}"?`)) return;
    try {
      const res = await fetch(API + `galeria/${currentAlbum.slug}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast('🗑 Foto eliminada'); loadPhotos(); }
      else toast('❌ ' + (data.message || 'Error'), true);
    } catch { toast('❌ Error de red', true); }
  }

  async function deleteAlbum(slug, name) {
    if (!confirm(`¿Eliminar el álbum "${name}" y TODAS sus fotos? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(API + 'galeria/' + slug, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast('🗑 Álbum eliminado'); loadAlbums(); }
      else toast('❌ ' + (data.message || 'Error'), true);
    } catch { toast('❌ Error de red', true); }
  }

  // ─────────────────────────────────────────────────────────
  //  TOAST
  // ─────────────────────────────────────────────────────────
  let toastTimer;
  function toast(msg, isError = false) {
    const el = document.getElementById('ga-toast');
    if (!el) return;
    el.textContent = msg;
    el.style.background = isError ? '#ef4444' : '#1e293b';
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.style.transform = 'translateY(100px)';
      el.style.opacity = '0';
    }, 3500);
  }

  function escHtml(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // ─────────────────────────────────────────────────────────
  //  PUBLIC API
  // ─────────────────────────────────────────────────────────
  return { renderSection, openAlbum, deleteAlbum, deletePhoto, onDragOver, onDragLeave, onDrop, onFilesSelected, uploadQueue, removeFromQueue, clearQueue };
})();
