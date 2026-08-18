(() => {
  const COLORS = ['red', 'green', 'yellow', 'blue'];
  const COLOR_NAMES = { red: 'Rojo', green: 'Verde', yellow: 'Amarillo', blue: 'Azul' };
  const CELL = 36;
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
    for (let c=6; c<=8; c++) { m[0][c]=1; m[14][c]=1; }
    for (let r=6; r<=8; r++) { m[r][14]=1; }
    m[7][7] = 1;
    m[6][1] = 3; m[1][8] = 4; m[8][13] = 5; m[13][6] = 6;
    m[6][4] = 2; m[2][8] = 2; m[8][12] = 2; m[12][6] = 2;
    m[6][13] = 2; m[1][6] = 2; m[8][1] = 2; m[13][8] = 2;
    return m;
  })();

  const MAIN_TRACK = [
    [6,1],[7,1],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],
    [12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],
    [8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],
    [6,11],[6,10],[6,9],[6,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
    [0,7],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[6,5],[6,4],
    [6,3],[6,2]
  ];

  const START_INDEX = { red: 0, green: 38, yellow: 24, blue: 11 };

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

  document.querySelectorAll('.setup-card .mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.setup-card .mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameMode = btn.dataset.mode;
      document.getElementById('local-options').classList.toggle('hidden', gameMode !== 'local');
      document.getElementById('online-options').classList.toggle('hidden', gameMode !== 'online');
    });
  });

  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      numPlayers = parseInt(btn.dataset.count);
      updateColorOptions();
      updateNameInputs();
    });
  });

  document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      if (opt.classList.contains('disabled')) return;
      opt.classList.toggle('selected');
      updateColorOptions();
      updateNameInputs();
    });
  });

  function updateColorOptions() {
    const selected = document.querySelectorAll('.color-opt.selected').length;
    document.querySelectorAll('.color-opt').forEach(opt => {
      if (!opt.classList.contains('selected') && selected >= numPlayers) {
        opt.classList.add('disabled');
      } else {
        opt.classList.remove('disabled');
      }
    });
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
        <input class="name-input" data-color="${color}" value="${COLOR_NAMES[color]}" maxlength="12">`;
      container.appendChild(row);
    });
  }

  updateNameInputs();

  document.getElementById('start-game').addEventListener('click', startLocalGame);
  document.getElementById('quit-btn').addEventListener('click', () => location.reload());
  document.getElementById('play-again').addEventListener('click', () => location.reload());

  document.getElementById('create-ludo-room').addEventListener('click', createLudoRoom);
  document.getElementById('join-ludo-room').addEventListener('click', joinLudoRoom);
  document.getElementById('ludo-copy-code').addEventListener('click', () => {
    const code = document.getElementById('ludo-room-code-display').textContent;
    navigator.clipboard.writeText(code).then(() => {
      document.getElementById('ludo-copy-code').textContent = '✅';
      setTimeout(() => { document.getElementById('ludo-copy-code').textContent = '📋'; }, 1500);
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
        reject(new Error('Tiempo de conexion agotado'));
      }, 8000);
      ws.onopen = () => { clearTimeout(timeout); resolve(); };
      ws.onerror = () => { clearTimeout(timeout); reject(new Error('No se pudo conectar al servidor')); };
      ws.onclose = () => {
        if (isOnline && gameActive) {
          addLog('⚠ Conexion perdida');
        }
      };
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        handleWSMessage(msg);
      };
    });
  }

  function showOnlineStatus(text, type) {
    const el = document.getElementById('ludo-online-status');
    if (!el) return;
    el.textContent = text;
    el.className = 'online-status ' + type;
    el.classList.remove('hidden');
  }

  async function createLudoRoom() {
    const btn = document.getElementById('create-ludo-room');
    const name = document.getElementById('online-name').value.trim() || 'Jugador';
    myColor = document.getElementById('online-color').value;
    btn.disabled = true;
    btn.textContent = 'Conectando...';
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
      btn.textContent = 'Crear sala';
    }
  }

  async function joinLudoRoom() {
    const btn = document.getElementById('join-ludo-room');
    const code = document.getElementById('ludo-room-code-input').value.trim().toUpperCase();
    const name = document.getElementById('online-name').value.trim() || 'Jugador';
    if (code.length !== 4) {
      showOnlineStatus('El codigo debe tener 4 caracteres', 'error');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Conectando...';
    try {
      await connectWS();
      ws.send(JSON.stringify({
        type: 'join',
        code,
        name,
        color: document.getElementById('online-color').value
      }));
    } catch (err) {
      showOnlineStatus(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Unirse';
    }
  }

  function handleWSMessage(msg) {
    switch (msg.type) {
      case 'created':
        myPlayerId = msg.player;
        document.getElementById('online-lobby').classList.add('hidden');
        document.getElementById('online-waiting').classList.remove('hidden');
        document.getElementById('ludo-room-code-display').textContent = msg.code;
        break;

      case 'joined':
        myPlayerId = msg.player;
        document.getElementById('online-lobby').classList.add('hidden');
        document.getElementById('online-waiting').classList.remove('hidden');
        document.getElementById('ludo-room-code-display').textContent = msg.code;
        document.getElementById('ludo-waiting-text').textContent = 'Esperando que el anfitrion inicie...';
        document.querySelector('#online-waiting .waiting-hint').textContent = '';
        break;

      case 'player_joined':
        document.getElementById('ludo-waiting-text').textContent = `${msg.name} se unio! (${msg.players}/2)`;
        document.querySelector('#online-waiting .waiting-hint').textContent = myPlayerId === 'p1' ? 'Presiona "Iniciar" cuando estes listo' : '';
        if (myPlayerId === 'p1' && msg.players === 2) {
          document.getElementById('online-start-area').classList.remove('hidden');
          document.getElementById('online-players-info').textContent = '2 jugadores conectados';
        }
        break;

      case 'player_left':
        addLog(`${msg.name} se desconecto`);
        if (gameActive) {
          gameActive = false;
          rollBtn.disabled = true;
          addLog('Juego terminado - oponente desconectado');
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
    addLog('Partida online iniciada!');
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
      addLog('Tu turno!');
    } else {
      addLog('Turno del oponente...');
    }
  }

  function handleRemoteRoll(playerId, value) {
    diceValue = value;
    diceFace.textContent = value;
    const p = players.find(pl => pl.color === (playerId === 'p1' ? players[0].color : players[1]?.color));
    if (p) addLog(`${p.name} saco ${value}`);
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
      positionPiece(p, pieceIndex);
      renderPlayersList();
    });
  }

  function handleRemoteCapture(playerId, opponentPieceIndex, opponentColor) {
    const p = players.find(pl => pl.color === opponentColor);
    if (p && p.pieces[opponentPieceIndex] !== undefined) {
      p.pieces[opponentPieceIndex] = -1;
      positionPiece(p, opponentPieceIndex);
      addLog('💥 Captura!');
    }
  }

  function startLocalGame() {
    isOnline = false;
    const selectedColors = [...document.querySelectorAll('.color-opt.selected')].map(o => o.dataset.color);
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
    addLog('Partida iniciada!');
  }

  document.getElementById('start-online-ludo')?.addEventListener('click', () => {
    if (myPlayerId !== 'p1') return;
    ws.send(JSON.stringify({ type: 'start' }));
  });

  function buildBoard() {
    boardEl.innerHTML = '';
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
        if (r === 7 && c >= 1 && c <= 5 && v === 0) cell.classList.add('home-red');
        if (c === 7 && r >= 1 && r <= 5 && v === 0) cell.classList.add('home-green');
        if (r === 7 && c >= 9 && c <= 13 && v === 0) cell.classList.add('home-yellow');
        if (c === 7 && r >= 9 && r <= 13 && v === 0) cell.classList.add('home-blue');
        boardEl.appendChild(cell);
      }
    }

    const center = boardEl.children[7*15+7];
    center.classList.add('center-cell');
    center.textContent = 'HOME';

    const playingColors = players.map(p => p.color);
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
      base.style.top = (r*CELL)+'px';
      base.style.left = (c*CELL)+'px';
      boardEl.appendChild(base);
    });

    players.forEach(p => {
      for (let i=0; i<4; i++) {
        const piece = document.createElement('div');
        piece.className = `piece ${p.color}`;
        piece.dataset.player = p.color;
        piece.dataset.piece = i;
        piece.addEventListener('click', () => onPieceClick(p.color, i));
        boardEl.appendChild(piece);
        p.pieceElements.push(piece);
      }
      positionAllPieces(p);
    });
  }

  function positionAllPieces(player) {
    player.pieces.forEach((pos, i) => {
      positionPiece(player, i);
    });
  }

  function positionPiece(player, pieceIndex) {
    const pos = player.pieces[pieceIndex];
    const el = player.pieceElements[pieceIndex];
    if (!el) return;
    let row, col;

    if (pos === -1) {
      const bp = BASE_POS[player.color][pieceIndex];
      row = bp[0]; col = bp[1];
    } else if (pos >= 0 && pos <= 51) {
      const trackPos = (START_INDEX[player.color] + pos) % 52;
      const coords = MAIN_TRACK[trackPos];
      row = coords[0]; col = coords[1];
    } else if (pos >= 52 && pos <= 56) {
      const homeIdx = pos - 52;
      const coords = HOME_COLUMN[player.color][homeIdx];
      row = coords[0]; col = coords[1];
    } else if (pos === 57) {
      const hc = HOME_COLUMN[player.color][4];
      row = hc[0]; col = hc[1];
    }

    el.style.left = (col * CELL + CELL/2 - 13) + 'px';
    el.style.top = (row * CELL + CELL/2 - 13) + 'px';
  }

  function renderPlayersList() {
    playersList.innerHTML = '';
    players.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'player-row';
      row.id = `pr-${p.color}`;
      const homeCount = p.pieces.filter(pos => pos === 57).length;
      row.innerHTML = `<span class="color-dot" style="background:var(--${p.color})"></span>
        <span class="pname">${p.name}</span>
        <span class="pscore">${homeCount}/4</span>`;
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

        if (isOnline) {
          ws.send(JSON.stringify({ type: 'roll', value: diceValue }));
        }
        onDiceRolled();
      }
    }, 60);
  }

  function onDiceRolled() {
    diceRolled = true;
    const player = players[currentTurn];
    addLog(`${player.name} saco ${diceValue}`);

    if (diceValue === 6) {
      consecutiveSixes++;
      if (consecutiveSixes >= 3) {
        addLog('Tres 6 seguidos! Pierde turno');
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
      addLog('No hay movimientos posibles');
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
    });
    addLog('Elige una ficha');
  }

  function clearSelectable(player) {
    player.pieceElements.forEach(el => el.classList.remove('selectable'));
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

  function getCellCoords(player, relativePos) {
    if (relativePos === -1) {
      const bp = BASE_POS[player.color][0];
      return { row: bp[0], col: bp[1] };
    } else if (relativePos >= 0 && relativePos <= 51) {
      const trackPos = (START_INDEX[player.color] + relativePos) % 52;
      const coords = MAIN_TRACK[trackPos];
      return { row: coords[0], col: coords[1] };
    } else if (relativePos >= 52 && relativePos <= 56) {
      const homeIdx = relativePos - 52;
      const coords = HOME_COLUMN[player.color][homeIdx];
      return { row: coords[0], col: coords[1] };
    } else if (relativePos === 57) {
      const hc = HOME_COLUMN[player.color][4];
      return { row: hc[0], col: hc[1] };
    }
    return { row: 0, col: 0 };
  }

  function animateMove(player, pieceIndex, fromPos, toPos, stepDelay, callback) {
    const el = player.pieceElements[pieceIndex];
    if (!el) { callback(); return; }
    const from = getCellCoords(player, fromPos);
    const to = getCellCoords(player, toPos);

    el.style.transition = 'none';
    el.style.left = (from.col * CELL + CELL/2 - 13) + 'px';
    el.style.top = (from.row * CELL + CELL/2 - 13) + 'px';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `left ${stepDelay}ms ease-in-out, top ${stepDelay}ms ease-in-out`;
        el.style.left = (to.col * CELL + CELL/2 - 13) + 'px';
        el.style.top = (to.row * CELL + CELL/2 - 13) + 'px';
        setTimeout(callback, stepDelay + 30);
      });
    });
  }

  function movePiece(player, pieceIndex) {
    let pos = player.pieces[pieceIndex];
    const stepDelay = 150;

    if (pos === -1 && (diceValue === 1 || diceValue === 6)) {
      player.pieces[pieceIndex] = 0;
      addLog(`${player.name}: ficha ${pieceIndex+1} sale de base`);
      animateMove(player, pieceIndex, -1, 0, stepDelay, () => {
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
                addLog(`★ ${player.name}: ficha ${pieceIndex+1} llego a casa!`);
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
                addLog(`${player.name}: ficha ${pieceIndex+1} entra a columna de casa`);
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
            addLog(`★ ${player.name}: ficha ${pieceIndex+1} llego a casa!`);
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
    if (!isOnline || !ws || ws.readyState !== 1) return;
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
    renderPlayersList();

    if (player.pieces.every(p => p === 57)) {
      gameActive = false;
      if (isOnline && ws && ws.readyState === 1) {
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
      ws.send(JSON.stringify({ type: 'turn_end', extraTurn }));
    } else {
      if (extraTurn) {
        rollBtn.disabled = false;
        addLog('Turno extra por sacar 6');
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
            addLog(`💥 ${player.name} captura a ${opponent.name}!`);
            if (isOnline && ws && ws.readyState === 1) {
              ws.send(JSON.stringify({ type: 'capture', opponentPiece: oi, opponentColor: opponent.color }));
            }
          }
        }
      });
    });
  }

  function isSafePosition(trackPos) {
    const safeTrackPositions = [0, 2, 10, 11, 14, 23, 24, 28, 37, 38, 42, 49];
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
    document.getElementById('win-title').textContent = `${player.name} gana!`;
    document.getElementById('win-message').textContent = `Todas las fichas de ${COLOR_NAMES[player.color]} llegaron a casa`;
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
    if (e.key === ' ' && gameActive && !rollBtn.disabled) {
      e.preventDefault();
      rollDice();
    }
    if (e.key === 'Escape') location.reload();
  });
})();
