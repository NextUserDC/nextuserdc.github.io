(() => {
  let paragraphs = [];
  let duration = 60;
  let timer = null;
  let timeLeft = 0;
  let gameActive = false;

  const menuScreen = document.getElementById('menu-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultsScreen = document.getElementById('results-screen');
  const timerDisplay = document.getElementById('timer');

  const soloText = document.getElementById('solo-text');
  const soloInput = document.getElementById('solo-input');
  const soloWpm = document.getElementById('solo-wpm');
  const soloAcc = document.getElementById('solo-acc');
  const soloErrors = document.getElementById('solo-errors');

  let paragraphsLoaded = false;
  fetch('paragraphs.json').then(r => r.json()).then(d => {
    paragraphs = d.paragraphs;
    paragraphsLoaded = true;
  }).catch(() => {
    paragraphs = ['El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja.'];
    paragraphsLoaded = true;
  });

  document.querySelectorAll('.dur-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      duration = parseInt(btn.dataset.time);
    });
  });

  document.getElementById('start-solo').addEventListener('click', startGame);
  document.getElementById('play-again').addEventListener('click', showMenu);

  function showScreen(screen) {
    [menuScreen, gameScreen, resultsScreen].forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    screen.classList.remove('hidden');
    screen.classList.add('active');
  }

  function showMenu() {
    showScreen(menuScreen);
    gameActive = false;
    clearInterval(timer);
  }

  function getRandomParagraph() {
    if (!paragraphs.length) return 'El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja.';
    return paragraphs[Math.floor(Math.random() * paragraphs.length)];
  }

  function renderChars(container, text) {
    container.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.className = 'char ' + (i === 0 ? 'current' : 'pending');
      span.textContent = text[i];
      container.appendChild(span);
    }
  }

  let state;

  function startGame() {
    if (!paragraphs.length) return;
    const para = getRandomParagraph();
    timeLeft = duration;
    gameActive = true;

    showScreen(gameScreen);
    timerDisplay.textContent = timeLeft;
    timerDisplay.classList.remove('danger');

    state = {
      text: para, charIndex: 0, errors: 0,
      correctChars: 0, startTime: null, finished: false
    };

    renderChars(soloText, para);
    soloInput.value = '';
    soloInput.disabled = false;
    soloInput.focus();
    updateStats();

    startTimer();
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = timeLeft;
      if (timeLeft <= 10) timerDisplay.classList.add('danger');
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    clearInterval(timer);
    gameActive = false;
    soloInput.disabled = true;
    showResults();
  }

  soloInput.addEventListener('input', () => {
    if (!gameActive || state.finished) return;
    if (!state.startTime) state.startTime = Date.now();

    const typed = soloInput.value;
    const chars = soloText.querySelectorAll('.char');
    let errors = 0;
    let correct = 0;

    for (let i = 0; i < chars.length; i++) {
      if (i < typed.length) {
        if (typed[i] === state.text[i]) {
          chars[i].className = 'char correct';
          correct++;
        } else {
          chars[i].className = 'char incorrect';
          errors++;
        }
      } else if (i === typed.length) {
        chars[i].className = 'char current';
      } else {
        chars[i].className = 'char pending';
      }
    }

    state.charIndex = typed.length;
    state.errors = errors;
    state.correctChars = correct;

    const elapsed = (Date.now() - state.startTime) / 60000;
    const wpm = elapsed > 0 ? Math.round((correct / 5) / elapsed) : 0;
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;

    soloWpm.textContent = wpm;
    soloAcc.textContent = accuracy + '%';
    soloErrors.textContent = errors;

    if (typed.length >= state.text.length) {
      state.finished = true;
      soloInput.disabled = true;
      endGame();
    }
  });

  function updateStats() {
    soloWpm.textContent = '0';
    soloAcc.textContent = '100%';
    soloErrors.textContent = '0';
  }

  function showResults() {
    const elapsed = state.startTime ? (Date.now() - state.startTime) / 60000 : 0;
    const wpm = elapsed > 0 ? Math.round((state.correctChars / 5) / elapsed) : 0;
    const accuracy = state.charIndex > 0 ? Math.round((state.correctChars / state.charIndex) * 100) : 100;

    document.getElementById('results-title').textContent = 'Resultados';
    document.getElementById('results-content').innerHTML = `
      <div class="result-player winner">
        <div class="result-player-name">Tu resultado</div>
        <div class="result-stats">
          <div><span class="result-stat-label">WPM</span><span class="result-stat-value">${wpm}</span></div>
          <div><span class="result-stat-label">Precision</span><span class="result-stat-value">${accuracy}%</span></div>
          <div><span class="result-stat-label">Errores</span><span class="result-stat-value">${state.errors}</span></div>
        </div>
        <div class="result-stats" style="margin-top:0.75rem">
          <div><span class="result-stat-label">Correctas</span><span class="result-stat-value">${state.correctChars}</span></div>
          <div><span class="result-stat-label">Total</span><span class="result-stat-value">${state.text.length}</span></div>
          <div><span class="result-stat-label">Tiempo</span><span class="result-stat-value">${duration}s</span></div>
        </div>
      </div>`;
    showScreen(resultsScreen);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') showMenu();
  });
})();
