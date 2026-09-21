/* ============================================
   PAES Quiz - Single Page Application
   ============================================ */

/* ---------- State ---------- */
let state = {
  token: localStorage.getItem('paes_token'),
  user: null,
  settings: null,
  currentQuiz: null,
  currentAnswers: [],
  questionIndex: 0,
  timerInterval: null,
  timerSeconds: 0,
  historyPage: 1,
  mobileMenuOpen: false,
  expandedHistoryId: null,
};

/* ---------- API Helper ---------- */
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  const res = await fetch(`https://api.nextuser.lat${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Error del servidor');
  }
  return json.data || json;
}

const ALL_SUBJECTS = ['competencia-lectora', 'matematica-m1', 'matematica-m2', 'ciencias-biologia', 'ciencias-fisica', 'ciencias-quimica', 'ciencias-tp', 'historia'];

const SUBJECT_LABELS = {
  'competencia-lectora': 'Competencia Lectora',
  'matematica-m1': 'Matemática 1',
  'matematica-m2': 'Matemática 2',
  'ciencias-biologia': 'Biología',
  'ciencias-fisica': 'Física',
  'ciencias-quimica': 'Química',
  'ciencias-tp': 'Módulo Técnico Profesional',
  'historia': 'Historia',
};

function normalizeSettings(raw) {
  if (!raw) return null;
  const subjects = typeof raw.subjects === 'string' ? JSON.parse(raw.subjects) : (raw.subjects || []);
  return {
    subjects: subjects.length > 0 ? subjects : [...ALL_SUBJECTS],
    questions_per_session: raw.questions_per_session || 10,
    difficulty_filter: raw.difficulty_filter || 'all',
    timer_enabled: !!raw.timer_enabled,
    timer_seconds: raw.timer_seconds || 30,
    show_explanations: raw.show_explanations !== false,
    theme: raw.theme || 'purple',
  };
}

/* ---------- Toast ---------- */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ---------- Theme ---------- */
function initTheme() {
  const saved = localStorage.getItem('paes_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('paes_theme', next);
}

/* ---------- Router ---------- */
const routes = {
  '#/login': renderLogin,
  '#/dashboard': renderDashboard,
  '#/quiz': renderQuiz,
  '#/results': renderResults,
  '#/settings': renderSettings,
  '#/history': renderHistory,
  '#/study': renderStudy,
};

function navigate(hash) {
  window.location.hash = hash;
}

function getRoute() {
  return window.location.hash || '#/login';
}

function router() {
  const app = document.getElementById('app');
  const route = getRoute();

  if (!state.token && route !== '#/login') {
    navigate('#/login');
    return;
  }

  if (state.token && route === '#/login') {
    navigate('#/dashboard');
    return;
  }

  const render = routes[route];
  if (render) {
    if (state.timerInterval && route !== '#/quiz') {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    render(app);
  } else {
    navigate('#/dashboard');
  }
}

window.addEventListener('hashchange', router);

/* ---------- Navbar Component ---------- */
function renderNavbar() {
  const hash = getRoute();
  const themeIcon = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  return `
    <nav class="navbar">
      <div class="navbar-brand" onclick="navigate('#/dashboard')">
        <span>🎓 PAES Quiz</span>
      </div>
      <div class="hamburger" onclick="toggleMobileMenu()">
        <span></span><span></span><span></span>
      </div>
      <div class="navbar-nav${state.mobileMenuOpen ? ' open' : ''}" id="navbarNav">
        <a class="nav-link${hash === '#/dashboard' ? ' active' : ''}" onclick="navigate('#/dashboard')">Dashboard</a>
        <a class="nav-link${hash === '#/study' ? ' active' : ''}" onclick="navigate('#/study')">Estudiar</a>
        <a class="nav-link${hash === '#/history' ? ' active' : ''}" onclick="navigate('#/history')">Historial</a>
        <a class="nav-link${hash === '#/settings' ? ' active' : ''}" onclick="navigate('#/settings')">Configuración</a>
      </div>
      <div class="navbar-actions">
        <button class="theme-toggle-btn" onclick="toggleTheme(); router();">${themeIcon}</button>
        <button class="logout-btn" onclick="logout()">Salir</button>
      </div>
    </nav>
  `;
}

function toggleMobileMenu() {
  state.mobileMenuOpen = !state.mobileMenuOpen;
  const nav = document.getElementById('navbarNav');
  if (nav) nav.classList.toggle('open', state.mobileMenuOpen);
}

function logout() {
  state.token = null;
  state.user = null;
  state.settings = null;
  localStorage.removeItem('paes_token');
  navigate('#/login');
}

/* ---------- Login / Register ---------- */
function renderLogin(container) {
  let activeTab = 'login';
  let loading = false;
  let error = '';

  function render() {
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-card glass animate-in">
          <h1>PAES Quiz</h1>
          <p class="subtitle">Prepárate para la Admisión 2027</p>
          <div class="auth-tabs">
            <div class="auth-tab${activeTab === 'login' ? ' active' : ''}" onclick="window._authTab('login')">Iniciar Sesión</div>
            <div class="auth-tab${activeTab === 'register' ? ' active' : ''}" onclick="window._authTab('register')">Registrarse</div>
          </div>
          ${error ? `<div class="form-error">${error}</div>` : ''}
          <form id="authForm" onsubmit="window._authSubmit(event)">
            <div class="form-group">
              <label>${activeTab === 'login' ? 'Usuario o correo' : 'Nombre de usuario'}</label>
              <input type="text" id="authUsername" placeholder="${activeTab === 'login' ? 'Tu usuario o correo' : 'Tu nombre (ñ, tildes y espacios permitidos)'}" required autocomplete="username">
            </div>
            ${activeTab === 'register' ? `
              <div class="form-group">
                <label>Correo electrónico</label>
                <input type="email" id="authEmail" placeholder="correo@ejemplo.com" required>
              </div>
            ` : ''}
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" id="authPassword" placeholder="Tu contraseña" required autocomplete="${activeTab === 'login' ? 'current-password' : 'new-password'}">
            </div>
            <button type="submit" class="btn btn-primary btn-full" id="authBtn" ${loading ? 'disabled' : ''}>
              ${loading ? '<span class="spinner"></span>' : ''}
              ${activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </div>
    `;
  }

  window._authTab = (tab) => {
    activeTab = tab;
    error = '';
    render();
  };

  window._authSubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    const email = document.getElementById('authEmail')?.value.trim();

    if (!username || !password) {
      error = 'Por favor completa todos los campos';
      render();
      return;
    }

    if (activeTab === 'register' && !email) {
      error = 'El correo electrónico es obligatorio';
      render();
      return;
    }

    if (activeTab === 'register') {
      if (!/^[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ _-]+$/.test(username)) {
        error = 'El usuario solo puede contener letras, números, espacios, guiones y bajos';
        render();
        return;
      }
    }

    loading = true;
    error = '';
    render();

    try {
      const endpoint = activeTab === 'login' ? '/paes/api/auth/login' : '/paes/api/auth/register';
      const body = { username, password };
      if (activeTab === 'register') body.email = email;

      const data = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      state.token = data.token;
      localStorage.setItem('paes_token', data.token);

      if (data.user) state.user = data.user;
      else if (data.username) state.user = { username: data.username, id: data.user_id };

      showToast(activeTab === 'login' ? '¡Bienvenido!' : '¡Cuenta creada!', 'success');
      navigate('#/dashboard');
    } catch (err) {
      error = err.message;
      loading = false;
      render();
    }
  };

  render();
}

/* ---------- Dashboard ---------- */
async function renderDashboard(container) {
  container.innerHTML = `${renderNavbar()}<div class="page dashboard-page"><div class="loading-container"><div class="loading-spinner"></div></div></div>`;

  try {
    if (!state.user) {
      const userData = await api('/paes/api/auth/profile');
      state.user = userData.user || userData;
    }
    if (!state.settings) {
      try {
        const settingsData = await api('/paes/api/settings');
        state.settings = settingsData.settings || settingsData;
      } catch {
        state.settings = null;
      }
    }
  } catch {
    logout();
    return;
  }

  let stats = { precision: 0, totalAnswers: 0, streak: 0, todaySessions: 0 };
  let subjectStats = [];

  try {
    const progress = await api('/paes/api/progress');
    stats.precision = progress.overallPct || 0;
    stats.totalAnswers = progress.totalAnswered || 0;
    stats.streak = progress.streak || 0;
    subjectStats = progress.bySubject || [];
  } catch {
    // Stats unavailable
  }

  let todaySessions = 0;
  try {
    const hist = await api('/paes/api/quiz/history?page=1&limit=50');
    const todayStr = new Date().toISOString().split('T')[0];
    todaySessions = (hist.sessions || []).filter(s => (s.started_at || '').startsWith(todayStr)).length;
  } catch {
    // ok
  }
  stats.todaySessions = todaySessions;

  const subjectLabels = SUBJECT_LABELS;

  const hasSettings = state.settings && state.settings.subjects && state.settings.subjects.length > 0;

  container.innerHTML = `
    ${renderNavbar()}
    <div class="page dashboard-page">
      <div class="page-header animate-in">
        <h2>Hola, ${state.user?.username || 'Estudiante'} 👋</h2>
        <p>Continúa preparándote para la PAES</p>
      </div>

      <div class="stats-grid animate-in delay-1">
        <div class="stat-card">
          <div class="stat-label">Precisión</div>
          <div class="stat-value purple">${stats.precision || 0}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Respuestas</div>
          <div class="stat-value">${stats.totalAnswers || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Racha (días)</div>
          <div class="stat-value green">${stats.streak || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Sesiones Hoy</div>
          <div class="stat-value yellow">${stats.todaySessions || 0}</div>
        </div>
      </div>

      ${!hasSettings ? `
        <div class="settings-prompt animate-in delay-2">
          <p>Primero configura tus materias preferidas para comenzar a practicar.</p>
          <button class="btn btn-primary" onclick="navigate('#/settings')">Ir a Configuración</button>
        </div>
      ` : `
        <div class="quick-actions animate-in delay-2">
          <button class="btn btn-primary" onclick="startQuickQuiz()">⚡ Quiz Rápido</button>
          <button class="btn btn-secondary" onclick="startDailyQuiz()">📅 Quiz Diario</button>
          <button class="btn btn-secondary" onclick="navigate('#/study')">📖 Estudiar</button>
        </div>
      `}

      <h3 class="section-title animate-in delay-3">Progreso por Materia</h3>
      <div class="subjects-grid animate-in delay-4">
        ${Object.entries(subjectLabels).filter(([id]) => (state.settings?.subjects || []).includes(id)).map(([id, name]) => {
          const sub = subjectStats.find(x => x.subject === id);
          const answered = sub?.total || 0;
          const total = sub?.total || 0;
          const pct = sub?.pct || 0;
          return `
            <div class="subject-card">
              <div class="subject-header">
                <span class="subject-name">${name}</span>
                <span class="subject-count">${answered} (${pct}%)</span>
              </div>
              <div class="progress-bar">
                <div class="fill" style="width: ${Math.min(pct, 100)}%"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ---------- Quiz Logic ---------- */
async function startQuickQuiz() {
  if (!state.settings) {
    showToast('Configura tus materias primero', 'error');
    navigate('#/settings');
    return;
  }
  await generateQuiz('quick');
}

async function startDailyQuiz() {
  if (!state.settings) {
    showToast('Configura tus materias primero', 'error');
    navigate('#/settings');
    return;
  }
  await generateQuiz('daily');
}

async function generateQuiz(mode) {
  const app = document.getElementById('app');
  app.innerHTML = `${renderNavbar()}<div class="page"><div class="loading-container"><div class="loading-spinner"></div></div></div>`;

  try {
    const body = {
      subjects: state.settings.subjects || [],
      count: state.settings.questions_per_session || 10,
      nivel: state.settings.difficulty_filter || 'all',
      mode,
    };

    const data = await api('/paes/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    state.currentQuiz = data.quiz || data;
    state.currentAnswers = [];
    state.questionIndex = 0;

    if (state.settings.timer_enabled) {
      state.timerSeconds = (state.settings.timer_seconds || 30) * (state.currentQuiz.questions?.length || body.count);
    }

    navigate('#/quiz');
  } catch (err) {
    showToast(err.message || 'Error al generar quiz', 'error');
    navigate('#/dashboard');
  }
}

/* ---------- Quiz View ---------- */
function renderQuiz(container) {
  if (!state.currentQuiz || !state.currentQuiz.questions) {
    navigate('#/dashboard');
    return;
  }

  const questions = state.currentQuiz.questions;
  const idx = state.questionIndex;
  const q = questions[idx];
  const total = questions.length;
  const practice = state.settings?.show_explanations !== false;
  const timerEnabled = state.settings?.timer_enabled;

  if (state.timerInterval) clearInterval(state.timerInterval);

  function renderQuizView() {
    const letters = ['A', 'B', 'C', 'D'];
    const timeLeft = state.timerSeconds;
    const timerClass = timeLeft <= 10 ? 'danger' : timeLeft <= 30 ? 'warning' : '';
    const timeStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;
    const selected = state.currentAnswers[idx];
    const answered = selected !== undefined;
    const showExplanation = practice && answered;

    const opts = q.opciones || q.options || [];

    container.innerHTML = `
      ${renderNavbar()}
      <div class="page quiz-page">
        <div class="quiz-topbar">
          <div class="quiz-info">
            <span class="quiz-question-count">Pregunta ${idx + 1}/${total}</span>
            <span class="difficulty-badge ${(q.nivel || q.difficulty || '').toLowerCase()}">${q.nivel || q.difficulty || 'Normal'}</span>
          </div>
          <div style="font-size:0.85rem;color:var(--text-secondary)">${q.subject || ''}</div>
          ${timerEnabled ? `<div class="quiz-timer ${timerClass}">⏱ ${timeStr}</div>` : ''}
        </div>

        <div class="quiz-progress-bar">
          <div class="fill" style="width: ${((idx + 1) / total) * 100}%"></div>
        </div>

        <div class="question-card">
          ${q.texto ? `<div class="question-text">${q.texto}</div>` : ''}
          <div class="question-enunciado">${q.enunciado}</div>
          <div class="options-grid">
            ${opts.map((opt, i) => {
              const optText = typeof opt === 'string' ? opt : opt.text || opt.texto || opt;
              let cls = 'quiz-option';
              if (answered) {
                cls += ' disabled';
              } else if (selected === i) {
                cls += ' selected';
              }
              return `
                <button class="${cls}" onclick="window._selectAnswer(${i})" ${answered ? 'disabled' : ''}>
                  <span class="option-letter">${letters[i]}</span>
                  <span>${optText}</span>
                </button>
              `;
            }).join('')}
          </div>
          ${showExplanation && q.explanation ? `
            <div class="explanation-box">
              <div class="explanation-label">Explicación</div>
              ${q.explanation}
            </div>
          ` : ''}
        </div>

        <div class="quiz-nav">
          <button class="btn btn-secondary btn-sm" onclick="window._prevQuestion()" ${idx === 0 ? 'disabled' : ''}>← Anterior</button>
          <div>
            ${idx < total - 1 ? `
              <button class="btn btn-primary btn-sm" onclick="window._nextQuestion()" ${!answered ? 'disabled' : ''}>Siguiente →</button>
            ` : `
              <button class="btn btn-success btn-sm" onclick="window._finishQuiz()" ${!answered ? 'disabled' : ''}>Terminar Quiz</button>
            `}
          </div>
        </div>
      </div>
    `;

    if (timerEnabled && !answered) {
      state.timerInterval = setInterval(() => {
        state.timerSeconds--;
        if (state.timerSeconds <= 0) {
          clearInterval(state.timerInterval);
          state.timerInterval = null;
          showToast('¡Se acabó el tiempo!', 'error');
          window._finishQuiz();
          return;
        }
        const timerEl = document.querySelector('.quiz-timer');
        if (timerEl) {
          const tl = state.timerSeconds;
          const tc = tl <= 10 ? 'danger' : tl <= 30 ? 'warning' : '';
          timerEl.className = `quiz-timer ${tc}`;
          timerEl.textContent = `⏱ ${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}`;
        }
      }, 1000);
    }
  }

  window._selectAnswer = (optionIndex) => {
    if (state.currentAnswers[state.questionIndex] !== undefined) return;
    state.currentAnswers[state.questionIndex] = optionIndex;

    if (state.settings?.show_explanations !== false) {
      renderQuizView();
    } else {
      renderQuizView();
    }
  };

  window._nextQuestion = () => {
    if (state.questionIndex < total - 1) {
      state.questionIndex++;
      renderQuizView();
    }
  };

  window._prevQuestion = () => {
    if (state.questionIndex > 0) {
      state.questionIndex--;
      renderQuizView();
    }
  };

  window._finishQuiz = async () => {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    const app = document.getElementById('app');
    app.innerHTML = `${renderNavbar()}<div class="page"><div class="loading-container"><div class="loading-spinner"></div></div></div>`;

    try {
      const answersPayload = questions.map((q, i) => ({
        exercise_id: q.session_exercise_id || q.id,
        selected: state.currentAnswers[i] !== undefined ? state.currentAnswers[i] : null,
        time_spent_ms: 0,
      }));

      const data = await api('/paes/api/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({
          session_id: state.currentQuiz.session_id,
          answers: answersPayload,
        }),
      });

      state.currentQuiz.results = data.results || [];
      state.currentQuiz.score = data.score_pct || 0;
      state.currentQuiz.correct = data.correct_answers || 0;
      state.currentQuiz.total = data.total_questions || questions.length;
      navigate('#/results');
    } catch (err) {
      showToast(err.message || 'Error al enviar respuestas', 'error');
      navigate('#/dashboard');
    }
  };

  renderQuizView();
}

/* ---------- Results ---------- */
function renderResults(container) {
  if (!state.currentQuiz || !state.currentQuiz.questions) {
    navigate('#/dashboard');
    return;
  }

  const questions = state.currentQuiz.questions;
  const results = state.currentQuiz.results || [];
  const practice = state.settings?.show_explanations !== false;

  const correct = state.currentQuiz.correct || 0;
  const total = state.currentQuiz.total || questions.length;
  const pct = state.currentQuiz.score || 0;
  const circumference = 314;
  const offset = circumference - (circumference * pct / 100);

  const levels = { basico: { t: 0, c: 0 }, intermedio: { t: 0, c: 0 }, avanzado: { t: 0, c: 0 } };
  results.forEach(r => {
    const q = questions.find(q => (q.session_exercise_id || q.id) === r.exercise_id);
    const diff = (q?.nivel || 'basico').toLowerCase();
    if (levels[diff]) {
      levels[diff].t++;
      if (r.correct) levels[diff].c++;
    }
  });

  container.innerHTML = `
    ${renderNavbar()}
    <div class="page results-page">
      <div class="score-circle-container animate-in">
        <div class="score-circle-wrapper">
          <svg viewBox="0 0 120 120">
            <circle class="circle-bg" cx="60" cy="60" r="50"></circle>
            <circle class="circle-fill" cx="60" cy="60" r="50" style="--score-offset: ${offset}"></circle>
          </svg>
          <div class="score-text">
            <div class="score-percentage">${pct}%</div>
            <div class="score-label">Precisión</div>
          </div>
        </div>
      </div>

      <div class="results-summary animate-in delay-1">
        <div class="result-stat">
          <div class="result-stat-value" style="color:var(--success)">${correct}/${total}</div>
          <div class="result-stat-label">Correctas</div>
        </div>
        <div class="result-stat">
          <div class="result-stat-value">${pct >= 70 ? 'Buen' : pct >= 50 ? 'Regular' : 'Necesita'} trabajo</div>
          <div class="result-stat-label">Nivel</div>
        </div>
      </div>

      <div class="results-breakdown animate-in delay-2">
        <h3>Desglose por Nivel</h3>
        <div class="breakdown-grid">
          <div class="breakdown-item">
            <div class="level-name">Básico</div>
            <div class="level-score" style="color:var(--success)">${levels.basico.c}/${levels.basico.t}</div>
          </div>
          <div class="breakdown-item">
            <div class="level-name">Intermedio</div>
            <div class="level-score" style="color:var(--warning)">${levels.intermedio.c}/${levels.intermedio.t}</div>
          </div>
          <div class="breakdown-item">
            <div class="level-name">Avanzado</div>
            <div class="level-score" style="color:var(--error)">${levels.avanzado.c}/${levels.avanzado.t}</div>
          </div>
        </div>
      </div>

      <div class="results-details animate-in delay-3">
        <h3>Detalle de Preguntas</h3>
        ${results.map((r, i) => {
          const q = questions.find(q => (q.session_exercise_id || q.id) === r.exercise_id) || {};
          const letters = ['A', 'B', 'C', 'D'];
          const opts = q.opciones || q.options || [];
          const selectedIdx = r.selected != null ? ['A','B','C','D'].indexOf(r.selected) : -1;
          const correctIdx = r.correct_answer != null ? ['A','B','C','D'].indexOf(r.correct_answer) : -1;
          return `
            <div class="result-item">
              <div class="result-item-header">
                <span class="result-icon">${r.correct ? '✅' : '❌'}</span>
                <strong style="font-size:0.85rem;color:var(--text-secondary)">Pregunta ${i + 1}</strong>
              </div>
              <div class="result-question">${q.enunciado || r.exercise_id}</div>
              <div class="result-answer">
                Tu respuesta: <span class="${r.correct ? 'correct-answer' : 'your-answer'}">${r.selected || 'Sin respuesta'}</span>
                ${!r.correct ? `<br>Correcta: <span class="correct-answer">${r.correct_answer}</span>` : ''}
              </div>
              ${practice && r.explanation ? `
                <div class="result-explanation">
                  <strong>Explicación:</strong> ${r.explanation}
                </div>
              ` : ''}
              ${practice && r.consejo ? `
                <div class="result-explanation" style="border-left-color:var(--accent-light)">
                  <strong>Consejo:</strong> ${r.consejo}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="results-actions animate-in delay-4">
        <button class="btn btn-secondary" onclick="navigate('#/dashboard')">Volver al Dashboard</button>
        <button class="btn btn-primary" onclick="startQuickQuiz()">Nuevo Quiz</button>
      </div>
    </div>
  `;
}

/* ---------- Settings ---------- */
async function renderSettings(container) {
  container.innerHTML = `${renderNavbar()}<div class="page settings-page"><div class="loading-container"><div class="loading-spinner"></div></div></div>`;

  if (!state.settings) {
    try {
      const data = await api('/paes/api/settings');
      state.settings = normalizeSettings(data);
    } catch {
      state.settings = {
        subjects: [...ALL_SUBJECTS],
        questions_per_session: 10,
        difficulty_filter: 'all',
        timer_enabled: false,
        timer_seconds: 30,
        show_explanations: true,
      };
    }
  }

  const s = state.settings;
  const subjectMap = [
    { id: 'competencia-lectora', name: 'Competencia Lectora' },
    { id: 'matematica-m1', name: 'Matemática 1' },
    { id: 'matematica-m2', name: 'Matemática 2' },
    { id: 'ciencias-biologia', name: 'Biología' },
    { id: 'ciencias-fisica', name: 'Física' },
    { id: 'ciencias-quimica', name: 'Química' },
    { id: 'ciencias-tp', name: 'Módulo Técnico Profesional' },
    { id: 'historia', name: 'Historia' },
  ];

  let saving = false;
  let changingPassword = false;

  function render() {
    container.innerHTML = `
      ${renderNavbar()}
      <div class="page settings-page">
        <a class="back-link" onclick="navigate('#/dashboard')">← Volver</a>
        <div class="page-header animate-in">
          <h2>Configuración</h2>
          <p>Personaliza tu experiencia de estudio</p>
        </div>

        <div class="settings-section animate-in delay-1">
          <h3>Materias</h3>
          <div class="subject-toggles">
            ${subjectMap.map(sub => `
              <label class="subject-toggle${s.subjects?.includes(sub.id) ? ' active' : ''}" data-subject="${sub.id}" onclick="event.preventDefault(); window._toggleSubject('${sub.id}')">
                <input type="checkbox" ${s.subjects?.includes(sub.id) ? 'checked' : ''} tabindex="-1">
                <span class="check-icon">${s.subjects?.includes(sub.id) ? '✓' : ''}</span>
                <span>${sub.name}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="settings-section animate-in delay-2">
          <h3>Quiz</h3>
          <div class="settings-row">
            <div>
              <div class="settings-label">Preguntas por sesión</div>
            </div>
            <select class="settings-select" id="settingCount" onchange="window._updateSetting('questions_per_session', parseInt(this.value))">
              <option value="5" ${s.questions_per_session === 5 ? 'selected' : ''}>5</option>
              <option value="10" ${s.questions_per_session === 10 ? 'selected' : ''}>10</option>
              <option value="15" ${s.questions_per_session === 15 ? 'selected' : ''}>15</option>
              <option value="20" ${s.questions_per_session === 20 ? 'selected' : ''}>20</option>
            </select>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-label">Dificultad</div>
            </div>
            <select class="settings-select" id="settingDiff" onchange="window._updateSetting('difficulty_filter', this.value)">
              <option value="all" ${s.difficulty_filter === 'all' ? 'selected' : ''}>Todas</option>
              <option value="basico" ${s.difficulty_filter === 'basico' ? 'selected' : ''}>Básico</option>
              <option value="intermedio" ${s.difficulty_filter === 'intermedio' ? 'selected' : ''}>Intermedio</option>
              <option value="avanzado" ${s.difficulty_filter === 'avanzado' ? 'selected' : ''}>Avanzado</option>
            </select>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-label">Temporizador</div>
              <div class="settings-desc">Limitar tiempo por quiz</div>
            </div>
            <label class="toggle">
              <input type="checkbox" ${s.timer_enabled ? 'checked' : ''} onchange="window._updateSetting('timer_enabled', this.checked)">
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </label>
          </div>
          ${s.timer_enabled ? `
            <div class="settings-row">
              <div>
                <div class="settings-label">Segundos por pregunta</div>
              </div>
              <select class="settings-select" onchange="window._updateSetting('timer_seconds', parseInt(this.value))">
                <option value="15" ${s.timer_seconds === 15 ? 'selected' : ''}>15s</option>
                <option value="30" ${s.timer_seconds === 30 ? 'selected' : ''}>30s</option>
                <option value="45" ${s.timer_seconds === 45 ? 'selected' : ''}>45s</option>
                <option value="60" ${s.timer_seconds === 60 ? 'selected' : ''}>60s</option>
              </select>
            </div>
          ` : ''}
          <div class="settings-row">
            <div>
              <div class="settings-label">Mostrar explicaciones</div>
              <div class="settings-desc">En modo práctica</div>
            </div>
            <label class="toggle">
              <input type="checkbox" ${s.show_explanations !== false ? 'checked' : ''} onchange="window._updateSetting('show_explanations', this.checked)">
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </label>
          </div>
        </div>

        <div class="settings-section animate-in delay-3">
          <h3>Apariencia</h3>
          <div class="settings-row">
            <div>
              <div class="settings-label">Modo claro</div>
            </div>
            <label class="toggle">
              <input type="checkbox" ${document.documentElement.getAttribute('data-theme') === 'light' ? 'checked' : ''} onchange="toggleTheme()">
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </label>
          </div>
        </div>

        <div class="settings-section animate-in delay-4">
          <h3>Cambiar Contraseña</h3>
          <div class="password-section">
            <div class="form-group">
              <label>Contraseña actual</label>
              <input type="password" id="currentPassword" placeholder="Tu contraseña actual">
            </div>
            <div class="form-group">
              <label>Nueva contraseña</label>
              <input type="password" id="newPassword" placeholder="Nueva contraseña">
            </div>
            <div class="form-group">
              <label>Confirmar contraseña</label>
              <input type="password" id="confirmPassword" placeholder="Confirmar nueva contraseña">
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window._changePassword()" id="changePwBtn">
              ${changingPassword ? '<span class="spinner"></span>' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>

        <div class="settings-section animate-in delay-5 danger-zone">
          <h3>Zona de Peligro</h3>
          <p class="danger-desc">Eliminar tu cuenta borrará permanentemente todo tu progreso, historial de quizzes y configuración. Esta acción no se puede deshacer.</p>
          <div class="password-section">
            <div class="form-group">
              <label>Contraseña (para confirmar)</label>
              <input type="password" id="deleteAccountPassword" placeholder="Escribe tu contraseña">
            </div>
            <button class="btn btn-danger btn-sm" onclick="window._deleteAccount()">
              Eliminar mi cuenta
            </button>
          </div>
        </div>

        <div style="padding: 16px 0" class="animate-in delay-4">
          <button class="btn btn-primary btn-full" onclick="window._saveSettings()" id="saveSettingsBtn">
            ${saving ? '<span class="spinner"></span>' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    `;
  }

  window._toggleSubject = (subject) => {
    if (!s.subjects) s.subjects = [...ALL_SUBJECTS];
    const idx = s.subjects.indexOf(subject);
    if (idx >= 0) {
      s.subjects.splice(idx, 1);
    } else {
      s.subjects.push(subject);
    }
    document.querySelectorAll('.subject-toggle').forEach(el => {
      const subId = el.getAttribute('data-subject');
      if (subId === subject) {
        const isActive = s.subjects.includes(subject);
        el.classList.toggle('active', isActive);
        el.querySelector('.check-icon').textContent = isActive ? '✓' : '';
      }
    });
  };

  window._updateSetting = (key, value) => {
    s[key] = value;
    if (key === 'timer_enabled') render();
  };

  window._saveSettings = async () => {
    saving = true;
    render();
    try {
      await api('/paes/api/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          subjects: s.subjects,
          questions_per_session: s.questions_per_session,
          difficulty_filter: s.difficulty_filter,
          timer_enabled: s.timer_enabled,
          timer_seconds: s.timer_seconds,
          show_explanations: s.show_explanations,
        }),
      });
      showToast('Configuración guardada', 'success');
    } catch (err) {
      showToast(err.message || 'Error al guardar', 'error');
    }
    saving = false;
    render();
  };

  window._changePassword = async () => {
    const current = document.getElementById('currentPassword')?.value;
    const newPw = document.getElementById('newPassword')?.value;
    const confirm = document.getElementById('confirmPassword')?.value;

    if (!current || !newPw || !confirm) {
      showToast('Completa todos los campos', 'error');
      return;
    }
    if (newPw !== confirm) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    if (newPw.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    changingPassword = true;
    render();

    try {
      await api('/paes/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      showToast('Contraseña cambiada', 'success');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } catch (err) {
      showToast(err.message || 'Error al cambiar contraseña', 'error');
    }
    changingPassword = false;
    render();
  };

  window._deleteAccount = async () => {
    const pw = document.getElementById('deleteAccountPassword')?.value;
    if (!pw) {
      showToast('Ingresa tu contraseña para confirmar', 'error');
      return;
    }
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es permanente.')) return;

    try {
      await api('/paes/api/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: pw }),
      });
      localStorage.removeItem('paes_token');
      state.token = null;
      state.user = null;
      state.settings = null;
      showToast('Cuenta eliminada', 'success');
      navigate('#/login');
    } catch (err) {
      showToast(err.message || 'Error al eliminar cuenta', 'error');
    }
  };

  render();
}

/* ---------- History ---------- */
async function renderHistory(container) {
  container.innerHTML = `${renderNavbar()}<div class="page history-page"><div class="loading-container"><div class="loading-spinner"></div></div></div>`;

  let sessions = [];
  let totalPages = 1;

  try {
    const data = await api(`/paes/api/quiz/history?page=${state.historyPage}&limit=10`);
    sessions = data.sessions || [];
    totalPages = data.pagination?.pages || 1;
  } catch {
    sessions = [];
  }

  container.innerHTML = `
    ${renderNavbar()}
    <div class="page history-page">
      <a class="back-link" onclick="navigate('#/dashboard')">← Volver</a>
      <div class="page-header animate-in">
        <h2>Historial</h2>
        <p>Tu progreso en sesiones anteriores</p>
      </div>

      ${sessions.length === 0 ? `
        <div class="empty-state animate-in delay-1">
          <div class="empty-icon">📝</div>
          <h3>Sin sesiones aún</h3>
          <p>Completa tu primer quiz para ver el historial aquí.</p>
          <button class="btn btn-primary" onclick="startQuickQuiz()">Comenzar Quiz</button>
        </div>
      ` : `
        <div class="history-table-wrapper animate-in delay-1">
          <table class="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Materias</th>
                <th>Modo</th>
                <th>Puntaje</th>
                <th>Preguntas</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              ${sessions.map(s => {
                const date = new Date(s.started_at || s.created_at);
                const dateStr = date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
                const score = s.score_pct || 0;
                const scoreClass = score >= 70 ? 'high' : score >= 50 ? 'mid' : 'low';
                let subjs = [];
                try { subjs = typeof s.subjects === 'string' ? JSON.parse(s.subjects) : (s.subjects || []); } catch { subjs = []; }
                const subjectsStr = subjs.map(id => SUBJECT_LABELS[id] || id).join(', ') || 'General';
                const totalMs = s.total_time_ms || 0;
                const tMins = Math.floor(totalMs / 60000);
                const tSecs = Math.floor((totalMs % 60000) / 1000);
                return `
                  <tr onclick="window._expandHistory('${s.id}')">
                    <td>${dateStr}</td>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${subjectsStr}</td>
                    <td>${s.mode || 'practice'}</td>
                    <td><span class="score-badge ${scoreClass}">${Math.round(score)}%</span></td>
                    <td>${s.correct_answers || 0}/${s.total_questions || '?'}</td>
                    <td>${tMins}:${String(tSecs).padStart(2, '0')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${totalPages > 1 ? `
          <div class="pagination">
            <button ${state.historyPage <= 1 ? 'disabled' : ''} onclick="window._historyPage(${state.historyPage - 1})">← Ant</button>
            ${Array.from({length: Math.min(totalPages, 5)}, (_, i) => i + 1).map(p => `
              <button class="${p === state.historyPage ? 'active' : ''}" onclick="window._historyPage(${p})">${p}</button>
            `).join('')}
            <button ${state.historyPage >= totalPages ? 'disabled' : ''} onclick="window._historyPage(${state.historyPage + 1})">Sig →</button>
          </div>
        ` : ''}
      `}
    </div>
  `;

  window._historyPage = (p) => {
    state.historyPage = p;
    renderHistory(container);
  };

  window._expandHistory = (id) => {
    showToast('Detalle de sesión: ' + id, 'info');
  };
}

/* ---------- Init ---------- */

const EXERCISE_FILES = {
  'competencia-lectora': '07-ejercicios-progresivos/competencia-lectora/ejercicios-cl.json',
  'matematica-m1': '07-ejercicios-progresivos/matematica-m1/ejercicios-m1.json',
  'matematica-m2': '07-ejercicios-progresivos/matematica-m2/ejercicios-m2.json',
  'ciencias-biologia': '07-ejercicios-progresivos/ciencias-biologia/ejercicios-biologia.json',
  'ciencias-fisica': '07-ejercicios-progresivos/ciencias-fisica/ejercicios-fisica.json',
  'ciencias-quimica': '07-ejercicios-progresivos/ciencias-quimica/ejercicios-quimica.json',
  'ciencias-tp': '07-ejercicios-progresivos/ciencias-tp/ejercicios-mtp.json',
  'historia': '07-ejercicios-progresivos/historia/ejercicios-historia.json',
};

state.exercisesCache = {};
state.studySubject = null;
state.studyViewed = {};

async function loadAllExercises(subjectId) {
  if (state.exercisesCache[subjectId]) return state.exercisesCache[subjectId];
  const filePath = EXERCISE_FILES[subjectId];
  if (!filePath) return [];
  try {
    const res = await fetch(filePath);
    if (!res.ok) return [];
    const data = await res.json();
    const exercises = Array.isArray(data) ? data : (data.exercises || []);
    state.exercisesCache[subjectId] = exercises;
    return exercises;
  } catch {
    return [];
  }
}

function renderStudy(container) {
  const subjects = Object.entries(SUBJECT_LABELS);
  const currentSubject = state.studySubject;
  const viewed = state.studyViewed[currentSubject] || {};
  const viewedCount = Object.keys(viewed).length;

  if (!currentSubject) {
    container.innerHTML = `
      ${renderNavbar()}
      <div class="page study-page">
        <div class="page-header animate-in">
          <h2>Estudiar</h2>
          <p>Explora ejercicios por materia</p>
        </div>
        <div class="subjects-grid animate-in delay-1">
          ${subjects.map(([id, name]) => `
            <div class="subject-card study-subject-card" onclick="window._selectStudySubject('${id}')" style="cursor:pointer">
              <div class="subject-header">
                <span class="subject-name">${name}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    window._selectStudySubject = async (id) => {
      state.studySubject = id;
      state.studyViewed[id] = state.studyViewed[id] || {};
      renderStudy(container);
    };
    return;
  }

  container.innerHTML = `
    ${renderNavbar()}
    <div class="page study-page">
      <div class="loading-container"><div class="loading-spinner"></div></div>
    </div>
  `;

  loadAllExercises(currentSubject).then(exercises => {
    const byLevel = { basico: [], intermedio: [], avanzado: [] };
    exercises.forEach(ex => {
      const lvl = (ex.nivel || ex.difficulty || 'basico').toLowerCase();
      if (byLevel[lvl]) byLevel[lvl].push(ex);
      else byLevel.basico.push(ex);
    });

    const totalExercises = exercises.length;
    const levelOrder = [
      { key: 'basico', label: 'Básico', color: 'var(--success)' },
      { key: 'intermedio', label: 'Intermedio', color: 'var(--warning)' },
      { key: 'avanzado', label: 'Avanzado', color: 'var(--error)' },
    ];

    container.innerHTML = `
      ${renderNavbar()}
      <div class="page study-page">
        <a class="back-link" onclick="window._studyBack()">← Volver</a>
        <div class="page-header animate-in">
          <h2>${SUBJECT_LABELS[currentSubject] || currentSubject}</h2>
          <p>${totalExercises} ejercicios &middot; ${viewedCount}/${totalExercises} vistos</p>
        </div>

        ${levelOrder.map(({ key, label, color }) => {
          const items = byLevel[key];
          if (items.length === 0) return '';
          return `
            <div class="study-level-section animate-in delay-1">
              <h3 class="study-level-title" style="color:${color}">${label} (${items.length})</h3>
              ${items.map(ex => {
                const letters = ['A', 'B', 'C', 'D'];
                const opts = ex.opciones || ex.options || [];
                const correctIdx = ex.respuesta_correcta != null ? ex.respuesta_correcta : null;
                const exId = ex.id || '';
                const isViewed = viewed[exId];
                if (exId) viewed[exId] = true;
                return `
                  <div class="study-exercise-card${isViewed ? ' viewed' : ''}">
                    <div class="study-exercise-header">
                      <span class="study-id-badge">${exId}</span>
                      <span class="difficulty-badge ${(ex.nivel || 'basico').toLowerCase()}">${ex.nivel || ex.difficulty || 'Básico'}</span>
                    </div>
                    ${ex.titulo ? `<div class="study-titulo">${ex.titulo}</div>` : ''}
                    ${ex.texto ? `<div class="study-texto">${ex.texto}</div>` : ''}
                    <div class="study-enunciado">${ex.enunciado}</div>
                    <div class="study-options">
                      ${opts.map((opt, i) => {
                        const optText = typeof opt === 'string' ? opt : opt.text || opt.texto || opt;
                        const isCorrect = correctIdx != null && (correctIdx === i || ['A','B','C','D'][i] === correctIdx || String(correctIdx) === String(i));
                        return `
                          <div class="study-option${isCorrect ? ' correct' : ''}">
                            <span class="option-letter">${letters[i]}</span>
                            <span>${optText}</span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                    ${ex.explanation ? `
                      <details class="study-details">
                        <summary>Ver explicación</summary>
                        <div class="study-explanation">${ex.explanation}</div>
                      </details>
                    ` : ''}
                    ${ex.consejo ? `
                      <div class="study-consejo">💡 ${ex.consejo}</div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;

    state.studyViewed[currentSubject] = viewed;
  });

  window._studyBack = () => {
    state.studySubject = null;
    renderStudy(container);
  };
}
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  router();
});
