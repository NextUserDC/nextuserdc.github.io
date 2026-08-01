import { getProjects, saveProject, deleteProject, generateId } from './storage.js';

const PRESETS = [
  { label: '1920 × 1080', w: 1920, h: 1080, desc: 'Full HD' },
  { label: '1280 × 720', w: 1280, h: 720, desc: 'HD' },
  { label: '1080 × 1080', w: 1080, h: 1080, desc: 'Instagram' },
  { label: '1080 × 1920', w: 1080, h: 1920, desc: 'Story / Reel' },
  { label: '1200 × 628', w: 1200, h: 628, desc: 'Facebook' },
  { label: '1500 × 500', w: 1500, h: 500, desc: 'Twitter Header' },
  { label: '2560 × 1440', w: 2560, h: 1440, desc: 'QHD' },
  { label: '800 × 600', w: 800, h: 600, desc: 'SVGA' },
  { label: '3840 × 2160', w: 3840, h: 2160, desc: '4K UHD' },
  { label: '400 × 400', w: 400, h: 400, desc: 'Miniatura' },
];

const BG_COLORS = ['#ffffff', '#000000', '#7c3aed', '#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#ec4899'];

let onOpen = null;

export function initLanding(callback) {
  onOpen = callback;
  const app = document.getElementById('app');
  app.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0d0d0d;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;overflow-y:auto;padding:40px 20px;';
  render();
}

function render() {
  const app = document.getElementById('app');
  const projects = getProjects();

  app.innerHTML = `
    <div style="max-width:720px;width:100%;">
      <div style="text-align:center;margin-bottom:40px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#7c3aed,#a855f7);font-size:28px;font-weight:700;color:#fff;box-shadow:0 4px 24px rgba(124,58,237,0.4);margin-bottom:16px;">NE</div>
        <h1 style="font-size:32px;font-weight:700;margin:0 0 6px;">NextEdit</h1>
        <p style="color:#888;font-size:14px;margin:0;">Editor de imágenes ligero y moderno</p>
      </div>

      <div style="background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h2 style="font-size:14px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">Nuevo lienzo</h2>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:16px;" id="presets-grid">
          ${PRESETS.map(p => `
            <button class="landing-preset" data-w="${p.w}" data-h="${p.h}" style="
              background:#16213e;border:1px solid #2a2a4a;border-radius:8px;padding:12px;text-align:left;cursor:pointer;transition:all 0.15s ease;color:#e0e0e0;
            ">
              <div style="font-size:13px;font-weight:600;">${p.label}</div>
              <div style="font-size:11px;color:#888;margin-top:2px;">${p.desc}</div>
            </button>
          `).join('')}
        </div>

        <div style="border-top:1px solid #2a2a4a;padding-top:16px;">
          <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;">
            <div style="flex:1;min-width:100px;">
              <label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Ancho (px)</label>
              <input id="custom-w" type="number" min="1" value="1200" style="width:100%;background:#0f0f1a;border:1px solid #2a2a4a;border-radius:6px;padding:8px 12px;color:#e0e0e0;font-size:13px;text-align:center;">
            </div>
            <div style="flex:1;min-width:100px;">
              <label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Alto (px)</label>
              <input id="custom-h" type="number" min="1" value="800" style="width:100%;background:#0f0f1a;border:1px solid #2a2a4a;border-radius:6px;padding:8px 12px;color:#e0e0e0;font-size:13px;text-align:center;">
            </div>
            <div style="flex:0 0 auto;">
              <label style="display:block;font-size:11px;color:#888;margin-bottom:4px;">Color</label>
              <div style="display:flex;gap:4px;" id="bg-colors">
                ${BG_COLORS.map((c, i) => `
                  <div class="landing-color" data-color="${c}" style="width:28px;height:28px;border-radius:6px;background:${c};cursor:pointer;border:2px solid ${i === 0 ? '#7c3aed' : '#2a2a4a'};transition:border-color 0.15s;"></div>
                `).join('')}
              </div>
            </div>
            <button id="create-btn" style="
              background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.15s;white-space:nowrap;
            ">Crear lienzo</button>
          </div>
        </div>
      </div>

      ${projects.length > 0 ? `
        <div style="background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:24px;">
          <h2 style="font-size:14px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">Proyectos recientes</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;" id="projects-list">
            ${projects.map(p => `
              <div class="landing-project" data-id="${p.id}" style="
                background:#16213e;border:1px solid #2a2a4a;border-radius:8px;overflow:hidden;cursor:pointer;transition:all 0.15s;position:relative;
              ">
                <div style="aspect-ratio:16/10;background:#0f0f1a;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                  ${p.thumbnail ? `<img src="${p.thumbnail}" style="width:100%;height:100%;object-fit:cover;">` : `
                    <div style="color:#555;font-size:11px;">${p.width} × ${p.height}</div>
                  `}
                </div>
                <div style="padding:10px 12px;display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <div style="font-size:12px;font-weight:500;">${p.name || 'Sin nombre'}</div>
                    <div style="font-size:10px;color:#888;">${p.width} × ${p.height} · ${formatDate(p.updatedAt)}</div>
                  </div>
                  <button class="landing-delete" data-id="${p.id}" style="
                    background:none;border:none;color:#888;cursor:pointer;padding:4px;border-radius:4px;transition:all 0.15s;font-size:14px;
                  " title="Eliminar">×</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  let selectedColor = '#ffffff';

  document.querySelectorAll('.landing-preset').forEach(btn => {
    btn.addEventListener('mouseenter', () => { btn.style.borderColor = '#7c3aed'; btn.style.background = '#1e2a4a'; });
    btn.addEventListener('mouseleave', () => { btn.style.borderColor = '#2a2a4a'; btn.style.background = '#16213e'; });
    btn.addEventListener('click', () => {
      document.getElementById('custom-w').value = btn.dataset.w;
      document.getElementById('custom-h').value = btn.dataset.h;
    });
  });

  document.querySelectorAll('.landing-color').forEach(el => {
    el.addEventListener('click', () => {
      selectedColor = el.dataset.color;
      document.querySelectorAll('.landing-color').forEach(c => c.style.borderColor = '#2a2a4a');
      el.style.borderColor = '#7c3aed';
    });
  });

  document.getElementById('create-btn')?.addEventListener('click', () => {
    const w = Math.max(1, parseInt(document.getElementById('custom-w').value) || 1200);
    const h = Math.max(1, parseInt(document.getElementById('custom-h').value) || 800);
    const id = generateId();
    const project = { id, name: `${w} × ${h}`, width: w, height: h, bgColor: selectedColor, canvasJSON: null, thumbnail: null };
    saveProject(project);
    onOpen(project);
  });

  document.querySelectorAll('.landing-project').forEach(card => {
    card.addEventListener('mouseenter', () => { card.style.borderColor = '#7c3aed'; card.style.transform = 'translateY(-2px)'; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = '#2a2a4a'; card.style.transform = 'none'; });
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('landing-delete')) return;
      const projects = getProjects();
      const p = projects.find(x => x.id === card.dataset.id);
      if (p) onOpen(p);
    });
  });

  document.querySelectorAll('.landing-delete').forEach(btn => {
    btn.addEventListener('mouseenter', () => { btn.style.color = '#ef4444'; btn.style.background = 'rgba(239,68,68,0.1)'; });
    btn.addEventListener('mouseleave', () => { btn.style.color = '#888'; btn.style.background = 'none'; });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteProject(btn.dataset.id);
      render();
    });
  });
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'ahora';
  if (diff < 3600000) return `hace ${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}
