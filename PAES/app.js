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
  adminPage: 1,
  adminSearch: '',
  mobileMenuOpen: false,
  expandedHistoryId: null,
};

/* ---------- API Helper ---------- */
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  const res = await fetch(`https://api.nextuser.lat${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Error del servidor');
  }
  return data;
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
  '#/admin': renderAdmin,
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
  const isAdmin = state.user && state.user.role === 'admin';
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
        <a class="nav-link${hash === '#/history' ? ' active' : ''}" onclick="navigate('#/history')">Historial</a>
        <a class="nav-link${hash === '#/settings' ? ' active' : ''}" onclick="navigate('#/settings')">Configuración</a>
        ${isAdmin ? `<a class="nav-link${hash === '#/admin' ? ' active' : ''}" onclick="navigate('#/admin')">Admin</a>` : ''}
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
            ${activeTab === 'register' ? `
              <div class="form-group">
                <label>Correo electrónico</label>
                <input type="email" id="authEmail" placeholder="correo@ejemplo.com">
                <span class="optional">(opcional)</span>
              </div>
            ` : ''}
            <div class="form-group">
              <label>Usuario</label>
              <input type="text" id="authUsername" placeholder="Tu nombre de usuario" required autocomplete="username">
            </div>
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

    loading = true;
    error = '';
    render();

    try {
      const endpoint = activeTab === 'login' ? '/paes/api/auth/login' : '/paes/api/auth/register';
      const body = { username, password };
      if (activeTab === 'register' && email) body.email = email;

      const data = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      state.token = data.token;
      localStorage.setItem('paes_token', data.token);

      if (data.user) state.user = data.user;

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
      const userData = await api('/paes/api/auth/me');
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
    const dashData = await api('/paes/api/stats/dashboard');
    if (dashData.stats) stats = { ...stats, ...dashData.stats };
    if (dashData.subjects) subjectStats = dashData.subjects;
  } catch {
    // Stats unavailable
  }

  const subjects = [
    'Competencia Lectora', 'Matemática 1', 'Matemática 2', 'Biología',
    'Física', 'Química', 'Módulo Técnico Profesional', 'Historia'
  ];

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
        </div>
      `}

      <h3 class="section-title animate-in delay-3">Progreso por Materia</h3>
      <div class="subjects-grid animate-in delay-4">
        ${subjects.map(s => {
          const sub = subjectStats.find(x => x.name === s || x.subject === s);
          const answered = sub?.answered || 0;
          const total = sub?.total || 1;
          const pct = Math.round((answered / total) * 100);
          return `
            <div class="subject-card">
              <div class="subject-header">
                <span class="subject-name">${s}</span>
                <span class="subject-count">${answered}/${total}</span>
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
      count: state.settings.questionsPerSession || 10,
      difficulty: state.settings.difficulty || 'todas',
      mode,
    };

    const data = await api('/paes/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    state.currentQuiz = data.quiz || data;
    state.currentAnswers = [];
    state.questionIndex = 0;

    if (state.settings.timerEnabled) {
      state.timerSeconds = (state.settings.timerSeconds || 30) * (state.currentQuiz.questions?.length || body.count);
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
  const practice = state.settings?.showExplanations !== false;
  const timerEnabled = state.settings?.timerEnabled;

  if (state.timerInterval) clearInterval(state.timerInterval);

  function renderQuizView() {
    const letters = ['A', 'B', 'C', 'D'];
    const timeLeft = state.timerSeconds;
    const timerClass = timeLeft <= 10 ? 'danger' : timeLeft <= 30 ? 'warning' : '';
    const timeStr = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;
    const selected = state.currentAnswers[idx];
    const answered = selected !== undefined;
    const showExplanation = practice && answered;

    container.innerHTML = `
      ${renderNavbar()}
      <div class="page quiz-page">
        <div class="quiz-topbar">
          <div class="quiz-info">
            <span class="quiz-question-count">Pregunta ${idx + 1}/${total}</span>
            <span class="difficulty-badge ${(q.difficulty || '').toLowerCase()}">${q.difficulty || 'Normal'}</span>
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
            ${q.options.map((opt, i) => {
              let cls = 'quiz-option';
              if (answered) {
                cls += ' disabled';
                if (q.options[i] === q.correctAnswer || i === q.correct) cls += ' correct';
                if (selected === i && i !== q.correct) cls += ' incorrect';
              } else if (selected === i) {
                cls += ' selected';
              }
              return `
                <button class="${cls}" onclick="window._selectAnswer(${i})" ${answered ? 'disabled' : ''}>
                  <span class="option-letter">${letters[i]}</span>
                  <span>${typeof opt === 'string' ? opt : opt.text || opt}</span>
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

    if (state.settings?.showExplanations !== false) {
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
        questionId: q.id || i,
        answer: state.currentAnswers[i] !== undefined ? state.currentAnswers[i] : null,
      }));

      const data = await api('/paes/api/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({
          quizId: state.currentQuiz.id,
          answers: answersPayload,
          timeSpent: state.settings?.timerEnabled
            ? ((state.settings.timerSeconds || 30) * total) - state.timerSeconds
            : 0,
        }),
      });

      state.currentQuiz.results = data.results || data;
      state.currentQuiz.score = data.score || data;
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
  const answers = state.currentAnswers;
  const results = state.currentQuiz.results;
  const practice = state.settings?.showExplanations !== false;

  let correct = 0;
  questions.forEach((q, i) => {
    const userAns = answers[i];
    const correctIdx = q.correct;
    if (userAns === correctIdx) correct++;
  });

  const total = questions.length;
  const pct = Math.round((correct / total) * 100);
  const circumference = 314;
  const offset = circumference - (circumference * pct / 100);

  const timeSpent = results?.timeSpent || 0;
  const mins = Math.floor(timeSpent / 60);
  const secs = timeSpent % 60;

  const levels = { basico: { t: 0, c: 0 }, intermedio: { t: 0, c: 0 }, avanzado: { t: 0, c: 0 } };
  questions.forEach((q, i) => {
    const diff = (q.difficulty || 'basico').toLowerCase();
    if (levels[diff]) {
      levels[diff].t++;
      if (answers[i] === q.correct) levels[diff].c++;
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
          <div class="result-stat-value">${mins}:${String(secs).padStart(2, '0')}</div>
          <div class="result-stat-label">Tiempo</div>
        </div>
        <div class="result-stat">
          <div class="result-stat-value" style="color:${pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)'}">${pct >= 70 ? 'Buen' : pct >= 50 ? 'Regular' : 'Necesita'} trabajo</div>
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
        ${questions.map((q, i) => {
          const userAns = answers[i];
          const isCorrect = userAns === q.correct;
          const letters = ['A', 'B', 'C', 'D'];
          return `
            <div class="result-item">
              <div class="result-item-header">
                <span class="result-icon">${isCorrect ? '✅' : '❌'}</span>
                <strong style="font-size:0.85rem;color:var(--text-secondary)">Pregunta ${i + 1}</strong>
              </div>
              <div class="result-question">${q.enunciado}</div>
              <div class="result-answer">
                Tu respuesta: <span class="${isCorrect ? 'correct-answer' : 'your-answer'}">${userAns !== undefined ? letters[userAns] + '. ' + (typeof q.options[userAns] === 'string' ? q.options[userAns] : q.options[userAns]?.text || '') : 'Sin respuesta'}</span>
                ${!isCorrect ? `<br>Correcta: <span class="correct-answer">${letters[q.correct]}. ${typeof q.options[q.correct] === 'string' ? q.options[q.correct] : q.options[q.correct]?.text || ''}</span>` : ''}
              </div>
              ${practice && q.explanation ? `
                <div class="result-explanation">
                  <strong>Explicación:</strong> ${q.explanation}
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
      state.settings = data.settings || data;
    } catch {
      state.settings = {
        subjects: [],
        questionsPerSession: 10,
        difficulty: 'todas',
        timerEnabled: false,
        timerSeconds: 30,
        showExplanations: true,
      };
    }
  }

  const s = state.settings;
  const allSubjects = [
    'Competencia Lectora', 'Matemática 1', 'Matemática 2', 'Biología',
    'Física', 'Química', 'Módulo Técnico Profesional', 'Historia'
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
            ${allSubjects.map(sub => `
              <label class="subject-toggle${s.subjects?.includes(sub) ? ' active' : ''}" onclick="window._toggleSubject('${sub}')">
                <input type="checkbox" ${s.subjects?.includes(sub) ? 'checked' : ''}>
                <span class="check-icon">${s.subjects?.includes(sub) ? '✓' : ''}</span>
                <span>${sub}</span>
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
            <select class="settings-select" id="settingCount" onchange="window._updateSetting('questionsPerSession', parseInt(this.value))">
              <option value="5" ${s.questionsPerSession === 5 ? 'selected' : ''}>5</option>
              <option value="10" ${s.questionsPerSession === 10 ? 'selected' : ''}>10</option>
              <option value="15" ${s.questionsPerSession === 15 ? 'selected' : ''}>15</option>
              <option value="20" ${s.questionsPerSession === 20 ? 'selected' : ''}>20</option>
            </select>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-label">Dificultad</div>
            </div>
            <select class="settings-select" id="settingDiff" onchange="window._updateSetting('difficulty', this.value)">
              <option value="todas" ${s.difficulty === 'todas' ? 'selected' : ''}>Todas</option>
              <option value="basico" ${s.difficulty === 'basico' ? 'selected' : ''}>Básico</option>
              <option value="intermedio" ${s.difficulty === 'intermedio' ? 'selected' : ''}>Intermedio</option>
              <option value="avanzado" ${s.difficulty === 'avanzado' ? 'selected' : ''}>Avanzado</option>
            </select>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-label">Temporizador</div>
              <div class="settings-desc">Limitar tiempo por quiz</div>
            </div>
            <label class="toggle">
              <input type="checkbox" ${s.timerEnabled ? 'checked' : ''} onchange="window._updateSetting('timerEnabled', this.checked)">
              <span class="toggle-track"></span>
              <span class="toggle-thumb"></span>
            </label>
          </div>
          ${s.timerEnabled ? `
            <div class="settings-row">
              <div>
                <div class="settings-label">Segundos por pregunta</div>
              </div>
              <select class="settings-select" onchange="window._updateSetting('timerSeconds', parseInt(this.value))">
                <option value="15" ${s.timerSeconds === 15 ? 'selected' : ''}>15s</option>
                <option value="30" ${s.timerSeconds === 30 ? 'selected' : ''}>30s</option>
                <option value="45" ${s.timerSeconds === 45 ? 'selected' : ''}>45s</option>
                <option value="60" ${s.timerSeconds === 60 ? 'selected' : ''}>60s</option>
              </select>
            </div>
          ` : ''}
          <div class="settings-row">
            <div>
              <div class="settings-label">Mostrar explicaciones</div>
              <div class="settings-desc">En modo práctica</div>
            </div>
            <label class="toggle">
              <input type="checkbox" ${s.showExplanations !== false ? 'checked' : ''} onchange="window._updateSetting('showExplanations', this.checked)">
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

        <div style="padding: 16px 0" class="animate-in delay-4">
          <button class="btn btn-primary btn-full" onclick="window._saveSettings()" id="saveSettingsBtn">
            ${saving ? '<span class="spinner"></span>' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    `;
  }

  window._toggleSubject = (subject) => {
    if (!s.subjects) s.subjects = [];
    const idx = s.subjects.indexOf(subject);
    if (idx >= 0) {
      s.subjects.splice(idx, 1);
    } else {
      s.subjects.push(subject);
    }
    render();
  };

  window._updateSetting = (key, value) => {
    s[key] = value;
    if (key === 'timerEnabled') render();
  };

  window._saveSettings = async () => {
    saving = true;
    render();
    try {
      await api('/paes/api/settings', {
        method: 'POST',
        body: JSON.stringify(s),
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

  render();
}

/* ---------- History ---------- */
async function renderHistory(container) {
  container.innerHTML = `${renderNavbar()}<div class="page history-page"><div class="loading-container"><div class="loading-spinner"></div></div></div>`;

  let sessions = [];
  let totalPages = 1;

  try {
    const data = await api(`/paes/api/quiz/history?page=${state.historyPage}&limit=10`);
    sessions = data.sessions || data.history || data.results || [];
    totalPages = data.totalPages || data.pages || 1;
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
                const date = new Date(s.date || s.createdAt || s.created_at);
                const dateStr = date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
                const score = s.score || s.percentage || 0;
                const scoreClass = score >= 70 ? 'high' : score >= 50 ? 'mid' : 'low';
                const subjects = s.subjects?.join(', ') || s.subject || 'General';
                const time = s.timeSpent || s.time || 0;
                const tMins = Math.floor(time / 60);
                const tSecs = time % 60;
                return `
                  <tr onclick="window._expandHistory('${s.id || s._id || ''}')">
                    <td>${dateStr}</td>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${subjects}</td>
                    <td>${s.mode || 'quick'}</td>
                    <td><span class="score-badge ${scoreClass}">${Math.round(score)}%</span></td>
                    <td>${s.totalQuestions || s.questionsCount || '?'}</td>
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

/* ---------- Admin ---------- */
async function renderAdmin(container) {
  if (!state.user || state.user.role !== 'admin') {
    container.innerHTML = `
      ${renderNavbar()}
      <div class="page">
        <div class="empty-state">
          <div class="empty-icon">🔒</div>
          <h3>Acceso restringido</h3>
          <p>Solo los administradores pueden ver esta sección.</p>
          <button class="btn btn-primary" onclick="navigate('#/dashboard')">Volver al Dashboard</button>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `${renderNavbar()}<div class="page admin-page"><div class="loading-container"><div class="loading-spinner"></div></div></div>`;

  let adminStats = { totalUsers: 0, totalQuizzes: 0, totalQuestions: 0 };
  let users = [];
  let usersTotal = 1;
  let subjectCounts = [];

  try {
    const data = await api('/paes/api/admin/stats');
    adminStats = data.stats || data;
  } catch { /* */ }

  try {
    const data = await api(`/paes/api/admin/users?page=${state.adminPage}&limit=10&search=${state.adminSearch}`);
    users = data.users || [];
    usersTotal = data.totalPages || 1;
  } catch { /* */ }

  try {
    const data = await api('/paes/api/admin/subjects');
    subjectCounts = data.subjects || data.counts || [];
  } catch { /* */ }

  container.innerHTML = `
    ${renderNavbar()}
    <div class="page admin-page">
      <a class="back-link" onclick="navigate('#/dashboard')">← Volver</a>
      <div class="page-header animate-in">
        <h2>Panel de Administración</h2>
        <p>Gestiona la plataforma PAES Quiz</p>
      </div>

      <div class="admin-stats animate-in delay-1">
        <div class="stat-card">
          <div class="stat-label">Usuarios</div>
          <div class="stat-value purple">${adminStats.totalUsers || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Quizzes Completados</div>
          <div class="stat-value green">${adminStats.totalQuizzes || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Preguntas Totales</div>
          <div class="stat-value yellow">${adminStats.totalQuestions || 0}</div>
        </div>
      </div>

      <div class="admin-section animate-in delay-2">
        <h3>Preguntas por Materia</h3>
        <div class="subjects-grid">
          ${subjectCounts.length > 0 ? subjectCounts.map(sc => `
            <div class="subject-card">
              <div class="subject-header">
                <span class="subject-name">${sc.name || sc.subject}</span>
                <span class="subject-count">${sc.count || 0}</span>
              </div>
            </div>
          `).join('') : '<p style="color:var(--text-secondary)">Sin datos disponibles</p>'}
        </div>
      </div>

      <div class="admin-section animate-in delay-3">
        <h3>Usuarios</h3>
        <div class="admin-search">
          <input type="text" placeholder="Buscar usuario..." value="${state.adminSearch}" oninput="window._adminSearch(this.value)">
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              ${users.length > 0 ? users.map(u => `
                <tr>
                  <td>${u.username}</td>
                  <td>${u.email || '-'}</td>
                  <td><span class="difficulty-badge ${u.role === 'admin' ? 'avanzado' : 'basico'}">${u.role || 'user'}</span></td>
                  <td>${new Date(u.createdAt || u.created_at).toLocaleDateString('es-CL')}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary)">Sin usuarios</td></tr>'}
            </tbody>
          </table>
        </div>
        ${usersTotal > 1 ? `
          <div class="pagination">
            <button ${state.adminPage <= 1 ? 'disabled' : ''} onclick="window._adminPageNav(${state.adminPage - 1})">← Ant</button>
            ${Array.from({length: Math.min(usersTotal, 5)}, (_, i) => i + 1).map(p => `
              <button class="${p === state.adminPage ? 'active' : ''}" onclick="window._adminPageNav(${p})">${p}</button>
            `).join('')}
            <button ${state.adminPage >= usersTotal ? 'disabled' : ''} onclick="window._adminPageNav(${state.adminPage + 1})">Sig →</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  let searchTimeout;
  window._adminSearch = (val) => {
    state.adminSearch = val;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => renderAdmin(container), 400);
  };

  window._adminPageNav = (p) => {
    state.adminPage = p;
    renderAdmin(container);
  };
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  router();
});
