(() => {
  var _EN = location.pathname.indexOf('/en/') === 0;
  const COLORS = ['red', 'green', 'yellow', 'blue'];
  const COLOR_NAMES = _EN
    ? { red: 'Red', green: 'Green', yellow: 'Yellow', blue: 'Blue' }
    : { red: 'Rojo', green: 'Verde', yellow: 'Amarillo', blue: 'Azul' };
  const BOARD_SIZE = 15;
  const WS_URL = 'wss://vps.nextuser.lat/ws/ludo';

  let players = [];
  let numPlayers = 2;
  let currentTurn = 0;
  let diceValue = 0;
  let gameActive = false;
  let consecutiveSixes = 0;
  let moveInProgress = false;
  let diceRolled = false;
  let gameMode = 'local';
  let isMyTurnOnline = false;

  let ws = null;
  let myPlayerId = null;
  let myColor = null;
  let isOnline = false;
  let onlineSelectedColor = 'red';

  const setupScreen = document.getElementById('setup-screen');
  const gameScreen = document.getElementById('game-screen');
  const winScreen = document.getElementById('win-screen');

  const boardEl = document.getElementById('board');
  const diceFace = document.getElementById('dice-face');
  const diceEl = document.getElementById('dice');
  const rollBtn = document.getElementById('roll-btn');
  const turnName = document.getElementById('turn-name');
  const playersList = document.getElementById('players-list');
  const gameLog = document.getElementById('game-log');

  const BOARD_MAP = (() => {
    const m = Array.from({length:15}, () => Array(15).fill(0));
    for (let r=1; r<=5; r++) { m[r][6]=1; m[r][7]=1; m[r][8]=1; }
    for (let c=9; c<=13; c++) { m[6][c]=1; m[7][c]=1; m[8][c]=1; }
    for (let r=9; r<=13; r++) { m[r][6]=1; m[r][7]=1; m[r][8]=1; }
    for (let c=1; c<=5; c++) { m[6][c]=1; m[7][c]=1; m[8][c]=1; }
    for (let r=6; r<=8; r++) { m[r][0]=1; }
    for (let c=6; c<=8; c++) { m[0][c]=1; m[14][c]=1; }
    for (let r=6; r<=8; r++) { m[r][14]=1; }
    m[7][7] = 1;
    m[6][1] = 3; m[1][8] = 4; m[8][13] = 5; m[13][6] = 6;
    m[6][4] = 2; m[2][8] = 2; m[8][12] = 2; m[12][6] = 2;
    m[6][13] = 2; m[1][6] = 2; m[8][1] = 2; m[13][8] = 2;
    return m;
  })();

  const MAIN_TRACK = [
    [6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],
    [10,6],[11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],
    [10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],
    [6,13],[6,12],[6,11],[6,10],[6,9],[6,8],[5,8],[4,8],[3,8],[2,8],
    [1,8],[0,8],[0,7],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
    [6,5],[6,4]
  ];

  const START_INDEX = { red: 0, green: 40, yellow: 26, blue: 13 };

  const HOME_COLUMN = {
    red:    [[7,1],[7,2],[7,3],[7,4],[7,5]],
    green:  [[1,7],[2,7],[3,7],[4,7],[5,7]],
    yellow: [[7,13],[7,12],[7,11],[7,10],[7,9]],
    blue:   [[13,7],[12,7],[11,7],[10,7],[9,7]]
  };

  const BASE_POS = {
    red:    [[1.5,1.5],[1.5,3.5],[3.5,1.5],[3.5,3.5]],
    green:  [[1.5,10.5],[1.5,12.5],[3.5,10.5],[3.5,12.5]],
    yellow: [[10.5,10.5],[10.5,12.5],[12.5,10.5],[12.5,12.5]],
    blue:   [[10.5,1.5],[10.5,3.5],[12.5,1.5],[12.5,3.5]]
  };

  const FINISH_OFFSET = {
    red:    [-0.2, 0],
    green:  [0, -0.2],
    yellow: [0.2, 0],
    blue:   [0, 0.2]
  };

  const STACK_OFFSETS = [[0,0],[1,-1],[-1,1],[1,1],[-1,-1],[-1,0],[0,1],[1,0],[0,-1]];

  const PIECE_NAMES = _EN
    ? { red: 'red piece', green: 'green piece', yellow: 'yellow piece', blue: 'blue piece' }
    : { red: 'ficha roja', green: 'ficha verde', yellow: 'ficha amarilla', blue: 'ficha azul' };

  let baseZones = [];
  let joinedRoom = false;
  let lastRoomCode = '';
  let lastRoomName = '';
  let reconnecting = false;
  let reconnectAttempts = 0;

  function cellPx() {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
    return isNaN(v) ? 36 : v;
  }

  function pieceHalf(el) {
    if (el) {
      const w = parseFloat(getComputedStyle(el).width);
      if (!isNaN(w) && w > 0) return w / 2;
    }
    return 13;
  }

  document.querySelectorAll('.setup-card .mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.setup-card .mode-btn').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      gameMode = btn.dataset.mode;
      document.getElementById('local-options').classList.toggle('hidden', gameMode !== 'local');
      document.getElementById('online-options').classList.toggle('hidden', gameMode !== 'online');
    });
  });

  const dropdownDisplay = document.getElementById('online-color-display');
  const dropdownOptions = document.getElementById('online-color-options');
  const COLOR_DOT_COLORS = { red: '#ef4444', green: '#22c55e', yellow: '#eab308', blue: '#3b82f6' };

  function isDropdownOpen() {
    return !!dropdownOptions && dropdownOptions.classList.contains('open');
  }

  function openDropdown() {
    if (!dropdownOptions || !dropdownDisplay) return;
    dropdownOptions.classList.add('open');
    dropdownDisplay.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown(focusTrigger) {
    if (!dropdownOptions || !dropdownDisplay) return;
    dropdownOptions.classList.remove('open');
    dropdownDisplay.setAttribute('aria-expanded', 'false');
    if (focusTrigger) dropdownDisplay.focus();
  }

  function selectDropdownColor(color) {
    if (!dropdownDisplay) return;
    onlineSelectedColor = color;
    dropdownDisplay.querySelector('.color-dot').style.background = COLOR_DOT_COLORS[color];
    dropdownDisplay.querySelector('.ludo-dd-selected-text').textContent = COLOR_NAMES[color];
    if (dropdownOptions) {
      dropdownOptions.querySelectorAll('.ludo-dd-option').forEach(o => {
        o.setAttribute('aria-selected', o.dataset.color === color ? 'true' : 'false');
      });
    }
    closeDropdown(true);
  }

  if (dropdownDisplay && dropdownOptions) {
    const ddOptions = [...dropdownOptions.querySelectorAll('.ludo-dd-option')];

    dropdownDisplay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isDropdownOpen()) closeDropdown(false);
      else openDropdown();
    });

    dropdownDisplay.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      e.stopPropagation();
      openDropdown();
      const opt = e.key === 'ArrowDown' ? ddOptions[0] : ddOptions[ddOptions.length - 1];
      if (opt) opt.focus();
    });

    ddOptions.forEach((opt, i) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        selectDropdownColor(opt.dataset.color);
      });
      opt.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          const next = e.key === 'ArrowDown'
            ? (i + 1) % ddOptions.length
            : (i - 1 + ddOptions.length) % ddOptions.length;
          ddOptions[next].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          selectDropdownColor(opt.dataset.color);
        }
      });
    });

    document.addEventListener('click', () => {
      closeDropdown(false);
    });
  }

  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.count-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      numPlayers = parseInt(btn.dataset.count);
      updateColorOptions();
      updateNameInputs();
    });
  });

  document.querySelectorAll('.color-opt').forEach(opt => {
    const toggleOpt = () => {
      if (opt.classList.contains('disabled')) return;
      if (!opt.classList.contains('selected')) {
        const currentSelected = document.querySelectorAll('.color-opt.selected').length;
        if (currentSelected >= numPlayers) return;
      }
      opt.classList.toggle('selected');
      opt.setAttribute('aria-pressed', opt.classList.contains('selected') ? 'true' : 'false');
      updateColorOptions();
    };
    opt.addEventListener('click', toggleOpt);
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleOpt();
      }
    });
  });

  function updateColorOptions() {
    const selected = document.querySelectorAll('.color-opt.selected');
    const selectedCount = selected.length;
    if (selectedCount > numPlayers) {
      for (let i = numPlayers; i < selectedCount; i++) {
        selected[i].classList.remove('selected');
      }
    }
    const nowSelected = document.querySelectorAll('.color-opt.selected').length;
    document.querySelectorAll('.color-opt').forEach(opt => {
      if (!opt.classList.contains('selected') && nowSelected >= numPlayers) {
        opt.classList.add('disabled');
      } else {
        opt.classList.remove('disabled');
      }
      opt.setAttribute('aria-pressed', opt.classList.contains('selected') ? 'true' : 'false');
      opt.setAttribute('aria-disabled', opt.classList.contains('disabled') ? 'true' : 'false');
    });
    updateNameInputs();
  }

  function updateNameInputs() {
    const container = document.getElementById('name-inputs');
    const selected = [...document.querySelectorAll('.color-opt.selected')];
    container.innerHTML = '';
    selected.forEach(opt => {
      const color = opt.dataset.color;
      const row = document.createElement('div');
      row.className = 'name-input-row';
      row.innerHTML = `<span class="color-dot" style="background:var(--${color})"></span>
        <input class="name-input" data-color="${color}" value="${COLOR_NAMES[color]}" maxlength="12" aria-label="${_EN ? 'Name' : 'Nombre'}: ${COLOR_NAMES[color]}">`;
      container.appendChild(row);
    });
  }

  updateNameInputs();

  document.getElementById('start-game').addEventListener('click', startLocalGame);
  document.getElementById('quit-btn').addEventListener('click', () => {
    if (confirm(_EN ? 'Abandon the game?' : '¿Abandonar la partida?')) location.reload();
  });
  document.getElementById('play-again').addEventListener('click', () => location.reload());

  document.getElementById('create-ludo-room').addEventListener('click', createLudoRoom);
  document.getElementById('join-ludo-room').addEventListener('click', joinLudoRoom);
  document.getElementById('ludo-copy-code').addEventListener('click', () => {
    const btn = document.getElementById('ludo-copy-code');
    const code = document.getElementById('ludo-room-code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = '✅';
      announce(_EN ? 'Room code copied' : 'Código de sala copiado');
      setTimeout(() => { btn.textContent = '📋'; }, 1500);
    }).catch(() => {
      btn.textContent = '📋';
      announce(_EN ? 'Could not copy the room code' : 'No se pudo copiar el código de sala');
    });
  });
  document.getElementById('ludo-room-code-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinLudoRoom();
  });

  function connectWS() {
    return new Promise((resolve, reject) => {
      if (ws && ws.readyState === WebSocket.OPEN) { resolve(); return; }
      ws = new WebSocket(WS_URL);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error(_EN ? 'Connection timed out' : 'Tiempo de conexión agotado'));
      }, 8000);
      ws.onopen = () => { clearTimeout(timeout); resolve(); };
      ws.onerror = () => { clearTimeout(timeout); reject(new Error(_EN ? 'Could not connect to the server' : 'No se pudo conectar al servidor')); };
      ws.onclose = handleWSClose;
      ws.onmessage = (e) => {
        let msg;
        try {
          msg = JSON.parse(e.data);
        } catch (err) {
          return;
        }
        handleWSMessage(msg);
      };
    });
  }

  function shouldReconnect() {
    return isOnline && gameActive && joinedRoom && !!lastRoomCode && !!lastRoomName;
  }

  function handleWSClose() {
    if (!shouldReconnect()) {
      if (isOnline && gameActive) {
        addLog(_EN ? '⚠ Connection lost' : '⚠ Conexión perdida');
      }
      return;
    }
    if (reconnecting) return;
    scheduleReconnect();
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= 2) {
      reconnecting = false;
      reconnectAttempts = 0;
      showOnlineStatus(
        _EN ? 'Connection lost. Could not reconnect.' : 'Conexión perdida. No se pudo reconectar.',
        'error'
      );
      addLog(_EN ? '⚠ Could not reconnect to the room' : '⚠ No se pudo reconectar a la sala');
      return;
    }
    reconnectAttempts++;
    reconnecting = true;
    showOnlineStatus(
      _EN ? 'Connection lost, reconnecting…' : 'Conexión perdida, reconectando…',
      'error'
    );
    addLog(_EN ? 'Connection lost, reconnecting…' : 'Conexión perdida, reconectando…');
    setTimeout(doReconnect, 2000);
  }

  async function doReconnect() {
    try {
      ws = null;
      await connectWS();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'join',
          code: lastRoomCode,
          name: lastRoomName,
          color: myColor || onlineSelectedColor
        }));
      }
      reconnecting = false;
      reconnectAttempts = 0;
      showOnlineStatus(_EN ? 'Reconnected' : 'Reconectado', 'success');
    } catch (err) {
      scheduleReconnect();
    }
  }

  function showOnlineStatus(text, type) {
    const el = document.getElementById('ludo-online-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'online-status ' + type;
    el.classList.remove('hidden');
  }

  function announce(text) {
    const el = document.getElementById('ludo-a11y-live');
    if (!el) return;
    el.textContent = '';
    setTimeout(() => { el.textContent = text; }, 80);
  }

  async function createLudoRoom() {
    const btn = document.getElementById('create-ludo-room');
    const name = document.getElementById('online-name').value.trim() || (_EN ? 'Player' : 'Jugador');
    myColor = onlineSelectedColor;
    lastRoomName = name;
    reconnecting = false;
    reconnectAttempts = 0;
    btn.disabled = true;
    btn.textContent = _EN ? 'Connecting...' : 'Conectando...';
    try {
      await connectWS();
      ws.send(JSON.stringify({
        type: 'create',
        name,
        color: myColor
      }));
    } catch (err) {
      showOnlineStatus(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = _EN ? 'Create room' : 'Crear sala';
    }
  }

  async function joinLudoRoom() {
    const btn = document.getElementById('join-ludo-room');
    const code = document.getElementById('ludo-room-code-input').value.trim().toUpperCase();
    const name = document.getElementById('online-name').value.trim() || (_EN ? 'Player' : 'Jugador');
    if (code.length !== 4) {
      showOnlineStatus(_EN ? 'The code must be 4 characters long' : 'El código debe tener 4 caracteres', 'error');
      return;
    }
    lastRoomCode = code;
    lastRoomName = name;
    reconnecting = false;
    reconnectAttempts = 0;
    btn.disabled = true;
    btn.textContent = _EN ? 'Connecting...' : 'Conectando...';
    try {
      await connectWS();
      ws.send(JSON.stringify({
        type: 'join',
        code,
        name,
        color: onlineSelectedColor
      }));
    } catch (err) {
      showOnlineStatus(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = _EN ? 'Join' : 'Unirse';
    }
  }

  function handleWSMessage(msg) {
    switch (msg.type) {
      case 'created':
        myPlayerId = msg.player;
        joinedRoom = true;
        lastRoomCode = msg.code;
        document.getElementById('online-lobby').classList.add('hidden');
        document.getElementById('online-waiting').classList.remove('hidden');
        document.getElementById('ludo-room-code-display').textContent = msg.code;
        break;

      case 'joined':
        myPlayerId = msg.player;
        joinedRoom = true;
        lastRoomCode = msg.code;
        if (msg.colorAssigned && msg.colorChanged) {
          myColor = msg.colorAssigned;
          onlineSelectedColor = msg.colorAssigned;
          if (dropdownDisplay) {
            dropdownDisplay.querySelector('.color-dot').style.background = COLOR_DOT_COLORS[msg.colorAssigned];
            dropdownDisplay.querySelector('.ludo-dd-selected-text').textContent = COLOR_NAMES[msg.colorAssigned];
          }
          showOnlineStatus((_EN ? 'Your color was already taken. You were assigned: ' : 'Tu color estaba en uso. Se te asignó: ') + COLOR_NAMES[msg.colorAssigned], 'error');
        }
        document.getElementById('online-lobby').classList.add('hidden');
        document.getElementById('online-waiting').classList.remove('hidden');
        document.getElementById('ludo-room-code-display').textContent = msg.code;
        document.getElementById('ludo-waiting-text').textContent = _EN ? 'Waiting for the host to start...' : 'Esperando que el anfitrión inicie...';
        document.querySelector('#online-waiting .waiting-hint').textContent = '';
        break;

      case 'player_joined':
        document.getElementById('ludo-waiting-text').textContent = _EN
          ? `${msg.name} joined! (${msg.players}/2)`
          : `${msg.name} se unió! (${msg.players}/2)`;
        document.querySelector('#online-waiting .waiting-hint').textContent = myPlayerId === 'p1'
          ? (_EN ? 'Press "Start" when you are ready' : 'Presiona "Iniciar" cuando estés listo')
          : '';
        if (myPlayerId === 'p1' && msg.players === 2) {
          document.getElementById('online-start-area').classList.remove('hidden');
          document.getElementById('online-players-info').textContent = _EN ? '2 players connected' : '2 jugadores conectados';
        }
        break;

      case 'player_left':
        addLog(_EN ? `${msg.name} disconnected` : `${msg.name} se desconectó`);
        if (gameActive) {
          gameActive = false;
          rollBtn.disabled = true;
          addLog(_EN ? 'Game over - opponent disconnected' : 'Juego terminado - oponente desconectado');
        }
        break;

      case 'error':
        showOnlineStatus(msg.msg, 'error');
        break;

      case 'game_start':
        isOnline = true;
        setupOnlineGame(msg);
        break;

      case 'turn':
        handleOnlineTurn(msg.player);
        break;

      case 'roll':
        handleRemoteRoll(msg.player, msg.value);
        break;

      case 'move':
        handleRemoteMove(msg.player, msg.pieceIndex, msg.to, msg.pieces);
        break;

      case 'capture':
        handleRemoteCapture(msg.player, msg.opponentPiece, msg.opponentColor);
        break;

      case 'win': {
        const winnerId = msg.player;
        const winPlayer = players.find((p, i) => {
          if (winnerId === myPlayerId) return i === 0;
          return i === 1;
        });
        if (winPlayer) {
          gameActive = false;
          setTimeout(() => showWin(winPlayer), 500);
        }
        break;
      }
    }
  }

  function setupOnlineGame(msg) {
    const colors = msg.colors;
    const names = msg.names;
    const myColorVal = colors[myPlayerId];
    const oppColorVal = colors[myPlayerId === 'p1' ? 'p2' : 'p1'];

    players = [
      { color: myColorVal, name: names[myPlayerId], pieces: [-1,-1,-1,-1], pieceElements: [] },
      { color: oppColorVal, name: names[myPlayerId === 'p1' ? 'p2' : 'p1'], pieces: [-1,-1,-1,-1], pieceElements: [] }
    ];

    showScreen(gameScreen);
    buildBoard();
    renderPlayersList();
    gameActive = true;
    currentTurn = 0;
    consecutiveSixes = 0;
    moveInProgress = false;
    diceRolled = false;
    addLog(_EN ? 'Online game started!' : 'Partida online iniciada!');
  }

  function handleOnlineTurn(turnPlayerId) {
    isMyTurnOnline = turnPlayerId === myPlayerId;
    if (isMyTurnOnline) {
      currentTurn = 0;
    } else {
      currentTurn = 1;
    }
    diceRolled = false;
    moveInProgress = false;
    consecutiveSixes = 0;
    diceValue = 0;
    diceFace.textContent = '?';
    rollBtn.disabled = !isMyTurnOnline;
    updateTurnDisplay();
    if (isMyTurnOnline) {
      addLog(_EN ? 'Your turn!' : 'Tu turno!');
    } else {
      addLog(_EN ? "Opponent's turn..." : 'Turno del oponente...');
    }
  }

  function handleRemoteRoll(playerId, value) {
    if (playerId === myPlayerId) return;
    diceValue = value;
    diceFace.textContent = value;
    const p = players.find(pl => pl.color === (playerId === 'p1' ? players[0].color : players[1]?.color));
    if (p) addLog(_EN ? `${p.name} rolled ${value}` : `${p.name} sacó ${value}`);
  }

  function handleRemoteMove(playerId, pieceIndex, toPos, piecesState) {
    const isOpponent = playerId !== myPlayerId;
    if (!isOpponent) return;
    const p = players[1];
    if (!p || !p.pieceElements[pieceIndex]) return;
    const fromPos = p.pieces[pieceIndex];

    if (piecesState) {
      p.pieces = piecesState;
    } else {
      p.pieces[pieceIndex] = toPos;
    }

    animateMoveStepByStep(p, pieceIndex, fromPos, p.pieces[pieceIndex], 150, () => {
      repositionAll();
      renderPlayersList();
    });
  }

  function handleRemoteCapture(playerId, opponentPieceIndex, opponentColor) {
    const p = players.find(pl => pl.color === opponentColor);
    if (p && p.pieces[opponentPieceIndex] !== undefined) {
      p.pieces[opponentPieceIndex] = -1;
      repositionAll();
      addLog('💥 ' + (_EN ? 'Capture!' : 'Captura!'));
    }
  }

  function startLocalGame() {
    isOnline = false;
    const selectedColors = [...document.querySelectorAll('.color-opt.selected')].map(o => o.dataset.color);
    if (selectedColors.length !== numPlayers) {
      return;
    }
    if (selectedColors.length < 2) return;

    players = selectedColors.map(color => {
      const nameInput = document.querySelector(`.name-input[data-color="${color}"]`);
      return {
        color,
        name: nameInput ? nameInput.value : COLOR_NAMES[color],
        pieces: [-1,-1,-1,-1],
        pieceElements: []
      };
    });

    showScreen(gameScreen);
    buildBoard();
    renderPlayersList();
    gameActive = true;
    currentTurn = 0;
    consecutiveSixes = 0;
    moveInProgress = false;
    diceRolled = false;
    updateTurnDisplay();
    addLog(_EN ? 'Game started!' : 'Partida iniciada!');
  }

  document.getElementById('start-online-ludo')?.addEventListener('click', () => {
    if (myPlayerId !== 'p1') return;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'start' }));
  });

  function buildBoard() {
    boardEl.innerHTML = '';
    baseZones = [];
    for (let r=0; r<15; r++) {
      for (let c=0; c<15; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        const v = BOARD_MAP[r][c];
        if (v===1) cell.classList.add('path');
        if (v===2) cell.classList.add('safe');
        if (v===3) cell.classList.add('start-red');
        if (v===4) cell.classList.add('start-green');
        if (v===5) cell.classList.add('start-yellow');
        if (v===6) cell.classList.add('start-blue');
        if (r < 6 && c < 6 && v === 0) cell.classList.add('base-red');
        if (r < 6 && c > 8 && v === 0) cell.classList.add('base-green');
        if (r > 8 && c > 8 && v === 0) cell.classList.add('base-yellow');
        if (r > 8 && c < 6 && v === 0) cell.classList.add('base-blue');
        boardEl.appendChild(cell);
      }
    }

    Object.keys(HOME_COLUMN).forEach(color => {
      HOME_COLUMN[color].forEach(coords => {
        const cell = boardEl.children[coords[0] * 15 + coords[1]];
        if (cell) cell.classList.add('home-' + color);
      });
    });

    const center = boardEl.children[7*15+7];
    center.classList.add('center-cell');
    center.textContent = 'HOME';

    const playingColors = players.map(p => p.color);
    const cellSize = cellPx();
    ['red','green','yellow','blue'].forEach(color => {
      if (!playingColors.includes(color)) return;
      const base = document.createElement('div');
      base.className = `base-zone ${color}`;
      for (let i=0; i<4; i++) {
        const slot = document.createElement('div');
        slot.className = 'base-slot';
        base.appendChild(slot);
      }
      const pos = {red:'0,0', green:'0,9', yellow:'9,9', blue:'9,0'}[color];
      const [r,c] = pos.split(',').map(Number);
      base.style.top = (r*cellSize)+'px';
      base.style.left = (c*cellSize)+'px';
      boardEl.appendChild(base);
      baseZones.push({ el: base, row: r, col: c });
    });

    players.forEach(p => {
      for (let i=0; i<4; i++) {
        const piece = document.createElement('div');
        piece.className = `piece ${p.color}`;
        piece.dataset.player = p.color;
        piece.dataset.piece = i;
        piece.setAttribute('role', 'button');
        piece.setAttribute('tabindex', '-1');
        piece.addEventListener('click', () => onPieceClick(p.color, i));
        piece.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onPieceClick(p.color, i);
          }
        });
        boardEl.appendChild(piece);
        p.pieceElements.push(piece);
      }
      positionAllPieces(p);
    });
  }

  function repositionBases() {
    const cell = cellPx();
    baseZones.forEach(b => {
      b.el.style.top = (b.row * cell) + 'px';
      b.el.style.left = (b.col * cell) + 'px';
    });
  }

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (!players.length) return;
      repositionBases();
      repositionAll();
    });
  });

  function positionAllPieces(player) {
    player.pieces.forEach((pos, i) => {
      positionPiece(player, i);
    });
  }

  function repositionAll() {
    players.forEach(p => positionAllPieces(p));
  }

  function pieceTargetAt(player, pos, pieceIndex) {
    if (pos === -1) {
      const bp = BASE_POS[player.color][pieceIndex] || BASE_POS[player.color][0];
      return { row: bp[0], col: bp[1], group: 'base-' + player.color + '-' + pieceIndex, finish: false };
    }
    if (pos >= 0 && pos <= 51) {
      const trackPos = (START_INDEX[player.color] + pos) % 52;
      const coords = MAIN_TRACK[trackPos];
      return { row: coords[0], col: coords[1], group: 'track-' + trackPos, finish: false };
    }
    if (pos >= 52 && pos <= 56) {
      const coords = HOME_COLUMN[player.color][pos - 52];
      return { row: coords[0], col: coords[1], group: 'home-' + coords[0] + '-' + coords[1], finish: false };
    }
    if (pos === 57) {
      return { row: 7, col: 7, group: 'finish-' + player.color, finish: true };
    }
    return { row: 0, col: 0, group: 'unknown', finish: false };
  }

  function pieceTarget(player, pieceIndex) {
    return pieceTargetAt(player, player.pieces[pieceIndex], pieceIndex);
  }

  function stackIndexFor(targetPlayer, targetIndex, group) {
    let idx = 0;
    for (const p of players) {
      for (let i = 0; i < p.pieces.length; i++) {
        if (p === targetPlayer && i === targetIndex) return idx;
        if (pieceTarget(p, i).group === group) idx++;
      }
    }
    return 0;
  }

  function targetPixels(player, pos, pieceIndex) {
    const t = pieceTargetAt(player, pos, pieceIndex);
    const el = player.pieceElements[pieceIndex];
    const cell = cellPx();
    const half = pieceHalf(el);
    let x = t.col * cell + cell / 2 - half;
    let y = t.row * cell + cell / 2 - half;
    if (t.finish) {
      x += FINISH_OFFSET[player.color][0] * cell;
      y += FINISH_OFFSET[player.color][1] * cell;
    }
    return { x, y, t };
  }

  function pieceLabel(player, pieceIndex) {
    const pos = player.pieces[pieceIndex];
    const name = PIECE_NAMES[player.color];
    if (pos === -1) return _EN ? name + ', base' : name + ', en base';
    if (pos === 57) return _EN ? name + ', home' : name + ', en casa';
    if (pos >= 52) return _EN ? name + ', home column' : name + ', columna de casa';
    return _EN ? name + ', square ' + (pos + 1) : name + ', casilla ' + (pos + 1);
  }

  function positionPiece(player, pieceIndex) {
    const el = player.pieceElements[pieceIndex];
    if (!el) return;
    const pos = player.pieces[pieceIndex];
    const target = targetPixels(player, pos, pieceIndex);
    let x = target.x;
    let y = target.y;
    const stack = stackIndexFor(player, pieceIndex, target.t.group);
    if (stack > 0) {
      const step = Math.max(3, Math.round(cellPx() * 0.1));
      const off = STACK_OFFSETS[Math.min(stack, STACK_OFFSETS.length - 1)];
      x += off[0] * step;
      y += off[1] * step;
    }
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.setAttribute('aria-label', pieceLabel(player, pieceIndex));
  }

  function renderPlayersList() {
    playersList.innerHTML = '';
    players.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'player-row';
      row.id = `pr-${p.color}`;
      const homeCount = p.pieces.filter(pos => pos === 57).length;

      const colorDot = document.createElement('span');
      colorDot.className = 'color-dot';
      colorDot.style.background = `var(--${p.color})`;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'pname';
      nameSpan.textContent = p.name;

      const scoreSpan = document.createElement('span');
      scoreSpan.className = 'pscore';
      scoreSpan.textContent = `${homeCount}/4`;

      row.appendChild(colorDot);
      row.appendChild(nameSpan);
      row.appendChild(scoreSpan);
      playersList.appendChild(row);
    });
  }

  function updateTurnDisplay() {
    if (!players.length) return;
    const p = players[currentTurn];
    if (!p) return;
    turnName.textContent = p.name;
    turnName.style.color = `var(--${p.color})`;
    document.querySelectorAll('.player-row').forEach(r => r.classList.remove('active-turn'));
    const row = document.getElementById(`pr-${p.color}`);
    if (row) row.classList.add('active-turn');
  }

  rollBtn.addEventListener('click', rollDice);
  diceEl.addEventListener('click', () => { if (rollBtn.disabled === false) rollDice(); });

  function rollDiceValue() {
    const r = Math.random();
    if (r < 0.22) return 1;
    if (r < 0.44) return 6;
    return Math.floor(Math.random() * 4) + 2;
  }

  function rollDice() {
    if (!gameActive || moveInProgress) return;
    if (isOnline && !isMyTurnOnline) return;
    rollBtn.disabled = true;
    diceEl.classList.add('rolling');
    diceFace.textContent = '';

    let count = 0;
    const interval = setInterval(() => {
      diceFace.textContent = Math.floor(Math.random()*6)+1;
      count++;
      if (count > 10) {
        clearInterval(interval);
        diceEl.classList.remove('rolling');
        diceValue = rollDiceValue();
        diceFace.textContent = diceValue;

        if (isOnline && ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'roll', value: diceValue }));
        }
        onDiceRolled();
      }
    }, 60);
  }

  function onDiceRolled() {
    diceRolled = true;
    const player = players[currentTurn];
    addLog(_EN ? `${player.name} rolled ${diceValue}` : `${player.name} sacó ${diceValue}`);

    if (diceValue === 6) {
      consecutiveSixes++;
      if (consecutiveSixes >= 3) {
        addLog(_EN ? 'Three 6s in a row! Turn skipped' : 'Tres 6 seguidos! Pierde turno');
        consecutiveSixes = 0;
        moveInProgress = false;
        endTurn(false);
        return;
      }
    } else {
      consecutiveSixes = 0;
    }

    const movable = getMovablePieces(player);
    if (movable.length === 0) {
      addLog(_EN ? 'No possible moves' : 'No hay movimientos posibles');
      setTimeout(() => {
        moveInProgress = false;
        diceRolled = false;
        endTurn(diceValue === 6);
      }, 800);
      return;
    }

    if (movable.length === 1) {
      moveInProgress = true;
      movePiece(player, movable[0]);
    } else {
      highlightSelectable(player, movable);
    }
  }

  function getMovablePieces(player) {
    const movable = [];
    player.pieces.forEach((pos, i) => {
      if (pos === 57) return;
      if (pos === -1) {
        if (diceValue === 1 || diceValue === 6) movable.push(i);
      } else if (pos >= 0 && pos <= 51) {
        const newPos = pos + diceValue;
        if (newPos <= 57) movable.push(i);
      } else if (pos >= 52 && pos <= 56) {
        const newPos = pos + diceValue;
        if (newPos <= 57) movable.push(i);
      }
    });
    return movable;
  }

  function highlightSelectable(player, movable) {
    movable.forEach(i => {
      player.pieceElements[i].classList.add('selectable');
      player.pieceElements[i].setAttribute('tabindex', '0');
    });
    addLog(_EN ? 'Choose a piece' : 'Elige una ficha');
  }

  function clearSelectable(player) {
    player.pieceElements.forEach(el => {
      el.classList.remove('selectable');
      el.setAttribute('tabindex', '-1');
    });
  }

  function onPieceClick(color, pieceIndex) {
    if (!gameActive || moveInProgress || !diceRolled) return;
    if (isOnline && !isMyTurnOnline) return;
    const player = players[currentTurn];
    if (player.color !== color) return;

    const movable = getMovablePieces(player);
    if (!movable.includes(pieceIndex)) return;

    clearSelectable(player);
    moveInProgress = true;
    movePiece(player, pieceIndex);
  }

  function animateMove(player, pieceIndex, fromPos, toPos, stepDelay, callback) {
    const el = player.pieceElements[pieceIndex];
    if (!el) { callback(); return; }
    const from = targetPixels(player, fromPos, pieceIndex);
    const to = targetPixels(player, toPos, pieceIndex);

    el.style.transition = 'none';
    el.style.left = from.x + 'px';
    el.style.top = from.y + 'px';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `left ${stepDelay}ms ease-in-out, top ${stepDelay}ms ease-in-out`;
        el.style.left = to.x + 'px';
        el.style.top = to.y + 'px';
        setTimeout(callback, stepDelay + 30);
      });
    });
  }

  function movePiece(player, pieceIndex) {
    let pos = player.pieces[pieceIndex];
    const stepDelay = 150;

    if (pos === -1 && (diceValue === 1 || diceValue === 6)) {
      player.pieces[pieceIndex] = 0;
      addLog(_EN ? `${player.name}: piece ${pieceIndex+1} leaves base` : `${player.name}: ficha ${pieceIndex+1} sale de base`);
      animateMove(player, pieceIndex, -1, 0, stepDelay, () => {
        positionPiece(player, pieceIndex);
        checkCapture(player, 0);
        sendMove(player, pieceIndex);
        afterMove(player);
      });
      return;
    }

    if (pos >= 0 && pos <= 51) {
      let newPos = pos + diceValue;
      if (newPos > 51) {
        const homeEntry = newPos - 52;
        if (homeEntry <= 5) {
          if (homeEntry === 5) {
            animateMoveStepByStep(player, pieceIndex, pos, 51, stepDelay, () => {
              animateMove(player, pieceIndex, 51, 57, stepDelay, () => {
                player.pieces[pieceIndex] = 57;
                addLog(_EN ? `★ ${player.name}: piece ${pieceIndex+1} made it home!` : `★ ${player.name}: ficha ${pieceIndex+1} llegó a casa!`);
                positionPiece(player, pieceIndex);
                sendMove(player, pieceIndex);
                afterMove(player);
              });
            });
          } else {
            animateMoveStepByStep(player, pieceIndex, pos, 51, stepDelay, () => {
              const finalPos = 52 + homeEntry;
              animateMove(player, pieceIndex, 51, finalPos, stepDelay, () => {
                player.pieces[pieceIndex] = finalPos;
                addLog(_EN ? `${player.name}: piece ${pieceIndex+1} enters the home column` : `${player.name}: ficha ${pieceIndex+1} entra a columna de casa`);
                positionPiece(player, pieceIndex);
                sendMove(player, pieceIndex);
                afterMove(player);
              });
            });
          }
          return;
        }
      }

      animateMoveStepByStep(player, pieceIndex, pos, newPos, stepDelay, () => {
        player.pieces[pieceIndex] = newPos;
        checkCapture(player, newPos);
        positionPiece(player, pieceIndex);
        sendMove(player, pieceIndex);
        afterMove(player);
      });
      return;
    }

    if (pos >= 52 && pos <= 56) {
      const newPos = pos + diceValue;
      if (newPos <= 57) {
        animateMoveStepByStep(player, pieceIndex, pos, newPos, stepDelay, () => {
          player.pieces[pieceIndex] = newPos;
          if (newPos === 57) {
            addLog(_EN ? `★ ${player.name}: piece ${pieceIndex+1} made it home!` : `★ ${player.name}: ficha ${pieceIndex+1} llegó a casa!`);
          }
          positionPiece(player, pieceIndex);
          sendMove(player, pieceIndex);
          afterMove(player);
        });
      }
      return;
    }

    positionPiece(player, pieceIndex);
    afterMove(player);
  }

  function sendMove(player, pieceIndex) {
    if (!isOnline || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'move',
      pieceIndex,
      from: -1,
      to: player.pieces[pieceIndex],
      pieces: player.pieces.slice()
    }));
  }

  function animateMoveStepByStep(player, pieceIndex, from, to, stepDelay, callback) {
    const steps = Math.abs(to - from);
    const direction = to > from ? 1 : -1;
    let current = from;
    let step = 0;

    function doStep() {
      step++;
      current += direction;
      const intermediatePos = current;

      animateMove(player, pieceIndex, current - direction, intermediatePos, stepDelay, () => {
        if (step < steps) {
          doStep();
        } else {
          callback();
        }
      });
    }

    doStep();
  }

  function afterMove(player) {
    repositionAll();
    renderPlayersList();

    if (player.pieces.every(p => p === 57)) {
      gameActive = false;
      if (isOnline && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'win' }));
      }
      setTimeout(() => showWin(player), 500);
      return;
    }

    setTimeout(() => {
      moveInProgress = false;
      diceRolled = false;
      endTurn(diceValue === 6);
    }, 400);
  }

  function endTurn(extraTurn) {
    if (isOnline) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'turn_end', extraTurn }));
      }
    } else {
      if (extraTurn) {
        rollBtn.disabled = false;
        addLog(_EN ? 'Extra turn for rolling a 6' : 'Turno extra por sacar 6');
      } else {
        nextTurn();
      }
    }
  }

  function checkCapture(player, trackPos) {
    const myAbs = (START_INDEX[player.color] + trackPos) % 52;
    if (isSafePosition(myAbs)) return;

    players.forEach(opponent => {
      if (opponent.color === player.color) return;
      opponent.pieces.forEach((opos, oi) => {
        if (opos >= 0 && opos <= 51) {
          const opAbs = (START_INDEX[opponent.color] + opos) % 52;
          if (myAbs === opAbs) {
            opponent.pieces[oi] = -1;
            positionPiece(opponent, oi);
            addLog(_EN ? `💥 ${player.name} captures ${opponent.name}!` : `💥 ${player.name} captura a ${opponent.name}!`);
            if (isOnline && ws && ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'capture', opponentPiece: oi, opponentColor: opponent.color }));
            }
          }
        }
      });
    });
  }

  function isSafePosition(trackPos) {
    const safeTrackPositions = [0, 4, 12, 13, 17, 25, 26, 30, 39, 40, 44, 51];
    return safeTrackPositions.includes(trackPos);
  }

  function nextTurn() {
    currentTurn = (currentTurn + 1) % players.length;
    diceRolled = false;
    moveInProgress = false;
    updateTurnDisplay();
    rollBtn.disabled = false;
  }

  function showWin(player) {
    showScreen(winScreen);
    document.getElementById('win-title').textContent = _EN ? `${player.name} wins!` : `${player.name} gana!`;
    document.getElementById('win-message').textContent = _EN
      ? `All ${COLOR_NAMES[player.color]} pieces made it home`
      : `Todas las fichas de ${COLOR_NAMES[player.color]} llegaron a casa`;
    createConfetti();
  }

  function createConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';
    const colors = ['#ef4444','#22c55e','#eab308','#3b82f6','#a855f7','#ec4899'];
    for (let i=0; i<50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random()*100 + '%';
      piece.style.background = colors[Math.floor(Math.random()*colors.length)];
      piece.style.animationDelay = Math.random()*2 + 's';
      piece.style.animationDuration = (2+Math.random()*2) + 's';
      container.appendChild(piece);
    }
  }

  function addLog(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = msg;
    gameLog.prepend(entry);
    if (gameLog.children.length > 30) gameLog.removeChild(gameLog.lastChild);
  }

  function showScreen(screen) {
    [setupScreen, gameScreen, winScreen].forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    screen.classList.remove('hidden');
    screen.classList.add('active');
  }

  document.addEventListener('keydown', (e) => {
    const target = e.target;
    const onControl = target && target.closest && target.closest('button, a, input, select, textarea, [role="button"]');
    if (e.key === ' ' && gameActive && !rollBtn.disabled && !onControl) {
      e.preventDefault();
      rollDice();
    }
    if (e.key === 'Escape' && isDropdownOpen()) {
      e.preventDefault();
      closeDropdown(true);
    }
  });
})();
