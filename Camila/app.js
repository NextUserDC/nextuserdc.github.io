lucide.createIcons();

// ===== CONFIG =====
const CONTRASENA_HASH = "REDACTED_CAMILA_HASH";
const BANCO_PALABRAS = ["MARIA", "DIABLO", "AUN NO", "NAGUEVONA"];
const MAX_INTENTOS = 5;

// ===== DOM =====
const btnJugarWordle = document.getElementById('btn-jugar-wordle');
const wordleModal = document.getElementById('wordle-modal');
const btnCerrarWordle = document.getElementById('btn-cerrar-wordle');
const grid = document.getElementById('wordle-grid');
const teclado = document.getElementById('wordle-teclado');
const mensaje = document.getElementById('wordle-mensaje');
const pantallaEspera = document.getElementById('pantalla-espera');
const contenidoPrincipal = document.getElementById('contenido-principal');
const proximoJuegoContenedor = document.getElementById('proximo-juego-contenedor');
const proximoJuegoTiempo = document.getElementById('proximo-juego-tiempo');
const btnKey = document.getElementById('btn-key');
const passwordGroup = document.getElementById('password-group');
const passwordInput = document.getElementById('password-input');
const btnAcceder = document.getElementById('btn-acceder');
const passwordError = document.getElementById('password-error');

// ===== CONTADOR A MEDIANOCHE =====
const actualizarContadorMidnight = () => {
    const ahora = new Date();
    const medianoche = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    const distancia = medianoche - ahora;

    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

    document.getElementById('dias').innerText = String(dias).padStart(2, '0');
    document.getElementById('horas').innerText = String(horas).padStart(2, '0');
    document.getElementById('minutos').innerText = String(minutos).padStart(2, '0');
    document.getElementById('segundos').innerText = String(segundos).padStart(2, '0');
};

actualizarContadorMidnight();
setInterval(actualizarContadorMidnight, 1000);

// ===== ACCESO POR CONTRASEÑA =====
let modoPasswordActivo = false;

const sha256 = async (texto) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verificarPassword = async () => {
    const hash = await sha256(passwordInput.value);
    if (hash === CONTRASENA_HASH) {
        passwordError.classList.add('oculto');
        enviarNotificacionWhatsApp("Alguien ingresó a la página");
        desbloquearPagina();
    } else {
        passwordError.classList.remove('oculto');
        passwordInput.value = '';
        passwordInput.focus();
    }
};

btnKey.addEventListener('click', () => {
    modoPasswordActivo = !modoPasswordActivo;
    if (modoPasswordActivo) {
        btnJugarWordle.style.display = 'none';
        passwordGroup.style.display = 'flex';
        passwordInput.value = '';
        passwordError.classList.add('oculto');
        lucide.createIcons();
        setTimeout(() => passwordInput.focus(), 100);
    } else {
        btnJugarWordle.style.display = 'inline-flex';
        passwordGroup.style.display = 'none';
        passwordError.classList.add('oculto');
    }
});

btnAcceder.addEventListener('click', verificarPassword);
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verificarPassword();
});

// ===== WORDLE =====
const hoyString = new Date().toDateString();

let palabraSecreta = "";
let partes = [];
let soloLetras = "";
let longitudTotal = 0;
let intentoActual = 0;
let letraActual = 0;
let tablero = [];
let juegoTerminado = false;

const seleccionarPalabraAleatoria = () => {
    const indice = Math.floor(Math.random() * BANCO_PALABRAS.length);
    const palabra = BANCO_PALABRAS[indice];
    partes = palabra.split(' ');
    soloLetras = palabra.replace(/ /g, '');
    longitudTotal = soloLetras.length;
    return palabra;
};

const reiniciarJuego = () => {
    palabraSecreta = seleccionarPalabraAleatoria();
    intentoActual = 0;
    letraActual = 0;
    juegoTerminado = false;
    tablero = Array.from({ length: MAX_INTENTOS }, () => Array(longitudTotal).fill(''));
    grid.innerHTML = '';
    teclado.innerHTML = '';
    mensaje.classList.add('oculto');
    generarTablero();
};

const desbloquearPagina = () => {
    pantallaEspera.classList.add('desvanecer');
    setTimeout(() => {
        pantallaEspera.style.display = 'none';
        contenidoPrincipal.classList.remove('oculto');
        contenidoPrincipal.classList.add('aparicion-activa');
    }, 600);
};

const actualizarMiniContador = () => {
    const ahora = new Date();
    const mañana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    const diferencia = mañana - ahora;

    const h = Math.floor(diferencia / (1000 * 60 * 60));
    const m = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diferencia % (1000 * 60)) / 1000);

    proximoJuegoTiempo.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

if (localStorage.getItem('ultimoDiaJugado') === hoyString) {
    juegoTerminado = true;
    btnJugarWordle.style.display = 'none';
    proximoJuegoContenedor.style.display = 'block';
    actualizarMiniContador();
    if (!window._miniContadorInterval) {
        window._miniContadorInterval = setInterval(actualizarMiniContador, 1000);
    }
    mostrarMensaje('Ya jugaste hoy, vuelve mañana');
}

btnJugarWordle.addEventListener('click', () => {
    wordleModal.classList.remove('oculto');
    reiniciarJuego();
    btnJugarWordle.blur();
});

btnCerrarWordle.addEventListener('click', () => {
    wordleModal.classList.add('oculto');
});

function mostrarMensaje(texto, tiempo = 3000) {
    mensaje.innerText = texto;
    mensaje.classList.remove('oculto');
    if (tiempo > 0) {
        setTimeout(() => mensaje.classList.add('oculto'), tiempo);
    }
}

function generarTablero() {
    grid.innerHTML = '';
    for (let i = 0; i < MAX_INTENTOS; i++) {
        const fila = document.createElement('div');
        fila.className = 'wordle-fila';
        let celdaIdx = 0;
        partes.forEach((parte, pIdx) => {
            if (pIdx > 0) {
                const gap = document.createElement('div');
                gap.className = 'wordle-espacio';
                fila.appendChild(gap);
            }
            for (let j = 0; j < parte.length; j++) {
                const celda = document.createElement('div');
                celda.className = 'wordle-celda';
                celda.id = `celda-${i}-${celdaIdx}`;
                celdaIdx++;
                fila.appendChild(celda);
            }
        });
        grid.appendChild(fila);
    }
    generarTeclado();
}

function generarTeclado() {
    const filasTeclado = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
    ];

    teclado.innerHTML = '';
    filasTeclado.forEach(fila => {
        const filaDiv = document.createElement('div');
        filaDiv.className = 'teclado-fila';
        fila.forEach(tecla => {
            const boton = document.createElement('button');
            boton.className = 'tecla';
            if (tecla === 'ENTER') {
                boton.classList.add('ancho');
                boton.innerHTML = '&#9166;';
                boton.style.fontSize = "1.2rem";
            } else if (tecla === 'DEL') {
                boton.classList.add('ancho');
                boton.innerHTML = '&#9003;';
                boton.style.fontSize = "1.2rem";
            } else {
                boton.textContent = tecla;
            }
            boton.id = `tecla-${tecla}`;
            boton.onclick = () => {
                boton.blur();
                manejarTecla(tecla);
            };
            filaDiv.appendChild(boton);
        });
        teclado.appendChild(filaDiv);
    });
}

function manejarTecla(tecla) {
    if (juegoTerminado) return;

    if (tecla === 'DEL' || tecla === 'BACKSPACE') {
        if (letraActual > 0) {
            letraActual--;
            tablero[intentoActual][letraActual] = '';
            actualizarGrid();
        }
        return;
    }

    if (tecla === 'ENTER') {
        if (letraActual === longitudTotal) {
            verificarPalabra();
        } else {
            mostrarMensaje(`Faltan ${longitudTotal - letraActual} letras`);
        }
        return;
    }

    if (letraActual < longitudTotal && /^[A-Z]$/.test(tecla)) {
        tablero[intentoActual][letraActual] = tecla;
        letraActual++;
        actualizarGrid();
    }
}

function actualizarGrid() {
    for (let i = 0; i < MAX_INTENTOS; i++) {
        for (let j = 0; j < longitudTotal; j++) {
            const celda = document.getElementById(`celda-${i}-${j}`);
            if (!celda) continue;
            celda.textContent = tablero[i][j];
            if (i === intentoActual) {
                if (tablero[i][j] !== '') {
                    celda.classList.add('llena');
                } else {
                    celda.classList.remove('llena');
                }
            }
        }
    }
}

function enviarNotificacionWhatsApp(textoMensaje) {
    const _k = [99,52,109,49,108,52,95,108,48,118,51];
    const _n = [72,1,91,8,94,2,109,84,6,68,6,82];
    const _a = [85,4,90,3,90,7,103];
    const d = (e) => String.fromCharCode(...e.map((c,i) => c ^ _k[i % _k.length]));
    const n = d(_n), k = d(_a);
    const t = encodeURIComponent(textoMensaje);
    fetch(`https://api.callmebot.com/whatsapp.php?phone=${n}&text=${t}&apikey=${k}`, { mode: 'no-cors' }).catch(() => {});
}

function verificarPalabra() {
    const intento = tablero[intentoActual];
    const palabraSecretaArr = soloLetras.split('');
    const resultadoCeldas = Array(longitudTotal).fill('ausente');

    for (let i = 0; i < longitudTotal; i++) {
        if (intento[i] === palabraSecretaArr[i]) {
            resultadoCeldas[i] = 'correcto';
            palabraSecretaArr[i] = null;
        }
    }

    for (let i = 0; i < longitudTotal; i++) {
        if (resultadoCeldas[i] !== 'correcto') {
            const idxEnSecreta = palabraSecretaArr.indexOf(intento[i]);
            if (idxEnSecreta !== -1) {
                resultadoCeldas[i] = 'presente';
                palabraSecretaArr[idxEnSecreta] = null;
            }
        }
    }

    for (let i = 0; i < longitudTotal; i++) {
        const celda = document.getElementById(`celda-${intentoActual}-${i}`);
        const teclaEl = document.getElementById(`tecla-${intento[i]}`);
        const estado = resultadoCeldas[i];

        celda.classList.add(estado);

        if (teclaEl) {
            if (estado === 'correcto') {
                teclaEl.className = 'tecla correcto';
            } else if (estado === 'presente' && !teclaEl.classList.contains('correcto')) {
                teclaEl.className = 'tecla presente';
            } else if (estado === 'ausente' && !teclaEl.classList.contains('correcto') && !teclaEl.classList.contains('presente')) {
                teclaEl.className = 'tecla ausente';
            }
        }
    }

    if (intento.join('') === soloLetras) {
        juegoTerminado = true;
        localStorage.setItem('ultimoDiaJugado', hoyString);
        mostrarMensaje('Adivinaste la palabra', 0);

        enviarNotificacionWhatsApp("Alguien adivinó la palabra del día");

        setTimeout(() => {
            wordleModal.classList.add('oculto');
            btnJugarWordle.style.display = 'none';
            proximoJuegoContenedor.style.display = 'block';
            actualizarMiniContador();
            if (!window._miniContadorInterval) {
                window._miniContadorInterval = setInterval(actualizarMiniContador, 1000);
            }
        }, 3000);
    } else {
        intentoActual++;
        letraActual = 0;
        if (intentoActual === MAX_INTENTOS) {
            juegoTerminado = true;
            localStorage.setItem('ultimoDiaJugado', hoyString);

            enviarNotificacionWhatsApp("Alguien falló la palabra del día");

            mostrarMensaje('Perdiste amor, quizá mañana', 0);

            setTimeout(() => {
                wordleModal.classList.add('oculto');
                btnJugarWordle.style.display = 'none';
                proximoJuegoContenedor.style.display = 'block';
                actualizarMiniContador();
                if (!window._miniContadorInterval) {
                    window._miniContadorInterval = setInterval(actualizarMiniContador, 1000);
                }
            }, 3000);
        }
    }
}

document.addEventListener('keydown', (e) => {
    const tecla = e.key.toUpperCase();
    if (/^[A-Z]$/.test(tecla) || tecla === 'ENTER' || tecla === 'BACKSPACE') {
        manejarTecla(tecla === 'BACKSPACE' ? 'DEL' : tecla);
    }
});

const secciones = document.querySelectorAll('.seccion');
const itemsNavegacion = document.querySelectorAll('.item-navegacion');

const opcionesObservador = {
    root: null,
    threshold: 0.3
};

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add('activo');
            const id = entrada.target.getAttribute('id');
            itemsNavegacion.forEach(item => {
                if (item.getAttribute('href') === '#' + id) {
                    item.classList.add('activo');
                } else {
                    item.classList.remove('activo');
                }
            });
        }
    });
}, opcionesObservador);

secciones.forEach(seccion => {
    observador.observe(seccion);
});
