
(function () {
    'use strict';


    const TRIVIA_PREGUNTAS = [
        {
            pregunta: "¿Cuál es la frase icónica de Homer Simpson cuando hace algo mal?",
            opciones: ["Ay caramba", "D'oh!", "Mmm... donas", "¡Excelente!"],
            correcta: 1
        },
        {
            pregunta: "¿Cómo se llama la cerveza favorita de Homer?",
            opciones: ["Budweiser", "Springfield Golden", "Duff", "Duffman"],
            correcta: 2
        },
        {
            pregunta: "¿Cuál es el nombre completo de Bart Simpson?",
            opciones: ["Bartholomew Jojo Simpson", "Bartolomé Juan Simpson", "Bartholomew J. Simpson", "Bartolomeo Jojo Simpson"],
            correcta: 0
        },
        {
            pregunta: "¿Dónde trabaja Homer Simpson?",
            opciones: ["Kwik-E-Mart", "Planta Nuclear de Springfield", "Escuela Primaria de Springfield", "Taverna de Moe"],
            correcta: 1
        },
        {
            pregunta: "¿Quién es el dueño de la Kwik-E-Mart?",
            opciones: ["Homer Simpson", "Ned Flanders", "Apu Nahasapeemapetilon", "Moe Szyslak"],
            correcta: 2
        },
        {
            pregunta: "¿Cuántos hijos tiene la familia Simpson?",
            opciones: ["2", "3", "4", "5"],
            correcta: 1
        },
        {
            pregunta: "¿Cómo se llama el padre de Homer?",
            opciones: ["Grampa", "Abraham", "Abe", "Todas son correctas"],
            correcta: 3
        },
        {
            pregunta: "¿Cuál es el nombre del vecino de los Simpson?",
            opciones: ["Joe Quimby", "Ned Flanders", "Principal Skinner", "Barney Gumble"],
            correcta: 1
        },
        {
            pregunta: "¿Qué instrumento toca Lisa Simpson?",
            opciones: ["Piano", "Saxofón", "Guitarra", "Violín"],
            correcta: 1
        },
        {
            pregunta: "¿Cómo se llama el matón de la escuela que siempre acosaba a Bart?",
            opciones: ["Nelson Muntz", "Jimbo Jones", "Dolph", "Kearney"],
            correcta: 0
        },
        {
            pregunta: "¿Cuál es el lema de la familia Simpson en el opening?",
            opciones: ["D'oh!", "Eat my shorts", "La familia Simpson", "No hay"],
            correcta: 2
        },
        {
            pregunta: "¿Qué animal doméstico tiene la familia Simpson?",
            opciones: ["Un gato", "Un perro", "Un pez", "Un pájaro"],
            correcta: 1
        },
        {
            pregunta: "¿Quién creó Springfield en Los Simpson?",
            opciones: ["Jebediah Springfield", "Hans Moleman", "Mr. Burns", "Mayor Quimby"],
            correcta: 0
        },
        {
            pregunta: "¿Cuál es el nombre completo de Marge Simpson de soltera?",
            opciones: ["Marge Bouvier", "Marge Bouvier-Simpson", "Marge Jackie Bouvier", "Marge Elizabeth Bouvier"],
            correcta: 2
        },
        {
            pregunta: "¿Dónde vive la familia Simpson?",
            opciones: ["Las Vegas", "Springfield", "Shelbyville", "Capital City"],
            correcta: 1
        }
    ];

    const PERSONAJES = [
        {
            nombre: "Homer Simpson",
            pista: "Trabaja en la central nuclear, ama las donas y siempre dice una palabra cuando hace algo mal.",
            opciones: ["Homer Simpson", "Ned Flanders", "Moe Szyslak", "Barney Gumble"],
            correcta: 0
        },
        {
            nombre: "Marge Simpson",
            pista: "Tiene el pelo azul, es la madre de la familia y siempre mantiene unida a todos.",
            opciones: ["Lisa Simpson", "Marge Simpson", "Patty Bouvier", "Selma Bouvier"],
            correcta: 1
        },
        {
            nombre: "Bart Simpson",
            pista: "Es el hijo rebelde, le gusta hacer travesuras y su frase favorita es un insulto a los patines.",
            opciones: ["Bart Simpson", "Milhouse Van Houten", "Nelson Muntz", "Ralph Wiggum"],
            correcta: 0
        },
        {
            nombre: "Lisa Simpson",
            pista: "Es inteligente, toca el saxofón y le preocupa el medio ambiente. La segunda hija.",
            opciones: ["Lisa Simpson", "Bart Simpson", "Maggie Simpson", "Janey Powell"],
            correcta: 0
        },
        {
            nombre: "Ned Flanders",
            pista: "Es el vecino perfecto, muy religioso, siempre dice 'Hola vecinito' y vende cosas para zurdos.",
            opciones: ["Ned Flanders", "Reverendo Lovejoy", "Principal Skinner", "Hans Moleman"],
            correcta: 0
        },
        {
            nombre: "Moe Szyslak",
            pista: "Es el dueño de la taberna donde Homer toma cerveza Duff. Es solitario y siempre busca pareja.",
            opciones: ["Moe Szyslak", "Barney Gumble", "Chief Wiggum", "Apu Nahasapeemapetilon"],
            correcta: 0
        },
        {
            nombre: "Mr. Burns",
            pista: "Es el anciano dueño de la planta nuclear, extremadamente rico y malvado. Siempre dice 'Excelente'.",
            opciones: ["Mr. Burns", "Smithers", "Principal Skinner", "Mayor Quimby"],
            correcta: 0
        },
        {
            nombre: "Maggie Simpson",
            pista: "Es la bebé de la familia, siempre tiene un chupete en la boca y una vez le disparó a Mr. Burns.",
            opciones: ["Maggie Simpson", "Lisa Simpson", "Ralph Wiggum", "Santa's Little Helper"],
            correcta: 0
        }
    ];

    const WORDLE_PALABRAS = [
        "HOMER", "BART", "LISA", "MARGE", "MOE", "DUFF", "DONA",
        "BURNS", "FLANDERS", "SKINNER", "WIGGUM", "APU",
        "SPRINGFIELD", "KWIK", "PLANTA", "NUCLEAR",
        "MILHOUSE", "NELSON", "RALPH", "MAGGIE",
        "KIRK", "VAN", "HOUTEN", "SELMA", "PATTY",
        "COMUN", "SIMPS", "AY", "CARAMBA", "EXCELENTE"
    ];

    const MEMORIA_PAREJAS = [
        { emoji: "🍩", personaje: "Homer", frase: "¡D'oh!" },
        { emoji: "🎸", personaje: "Bart", frase: "Eat my shorts" },
        { emoji: "🎷", personaje: "Lisa", frase: "¡Ay, caramba!" },
        { emoji: "💇‍♀️", personaje: "Marge", frase: "Homie..." },
        { emoji: "🍺", personaje: "Moe", frase: "Hola viejo" },
        { emoji: "☢️", personaje: "Burns", frase: "¡Excelente!" }
    ];

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function mostrarFeedback(elemento, texto, tipo) {
        elemento.classList.remove('oculto');
        elemento.style.background = tipo === 'correcto'
            ? 'rgba(91, 154, 77, 0.15)'
            : 'rgba(204, 0, 0, 0.1)';
        elemento.style.borderColor = tipo === 'correcto'
            ? 'var(--verde)'
            : 'var(--rojo)';
        elemento.style.color = tipo === 'correcto'
            ? 'var(--verde)'
            : 'var(--rojo)';
        elemento.textContent = texto;
    }

    let triviaEstado = {
        preguntas: [],
        actual: 0,
        score: 0,
        terminado: false
    };

    function iniciarTrivia() {
        triviaEstado = {
            preguntas: shuffle(TRIVIA_PREGUNTAS).slice(0, 10),
            actual: 0,
            score: 0,
            terminado: false
        };
        mostrarPreguntaTrivia();
    }

    function mostrarPreguntaTrivia() {
        const estado = triviaEstado;
        if (estado.actual >= estado.preguntas.length) {
            finalizarTrivia();
            return;
        }

        const p = estado.preguntas[estado.actual];
        const preguntaEl = document.getElementById('trivia-pregunta');
        const opcionesEl = document.getElementById('trivia-opciones');
        const contadorEl = document.getElementById('trivia-contador');
        const barraEl = document.getElementById('trivia-barra');
        const resultadoEl = document.getElementById('trivia-resultado');

        resultadoEl.classList.add('oculto');
        preguntaEl.textContent = p.pregunta;
        contadorEl.textContent = `${estado.actual + 1} / ${estado.preguntas.length}`;
        barraEl.style.width = `${((estado.actual) / estado.preguntas.length) * 100}%`;
        document.getElementById('trivia-score').textContent = estado.score;

        const opcionesShuffle = shuffle(p.opciones.map((op, i) => ({ texto: op, esCorrecta: i === p.correcta })));
        opcionesEl.innerHTML = '';

        opcionesShuffle.forEach(op => {
            const btn = document.createElement('button');
            btn.className = 'trivia-opcion';
            btn.textContent = op.texto;
            btn.addEventListener('click', () => {
                if (btn.classList.contains('deshabilitada')) return;

                opcionesEl.querySelectorAll('.trivia-opcion').forEach(b => b.classList.add('deshabilitada'));

                if (op.esCorrecta) {
                    btn.classList.add('correcta');
                    estado.score += 10;
                    document.getElementById('trivia-score').textContent = estado.score;
                    mostrarFeedback(resultadoEl, respuestasTriviaCorrecta[Math.floor(Math.random() * respuestasTriviaCorrecta.length)], 'correcto');
                } else {
                    btn.classList.add('incorrecta');
                    opcionesEl.querySelectorAll('.trivia-opcion').forEach(b => {
                        if (b.textContent === p.opciones[p.correcta]) b.classList.add('correcta');
                    });
                    mostrarFeedback(resultadoEl, respuestasTriviaIncorrecta[Math.floor(Math.random() * respuestasTriviaIncorrecta.length)], 'incorrecto');
                }

                estado.actual++;
                setTimeout(mostrarPreguntaTrivia, 1800);
            });
            opcionesEl.appendChild(btn);
        });
    }

    const respuestasTriviaCorrecta = [
        "¡Excelente! 🎉",
        "¡D'oh, no! Espera... ¡Sí, correcto! 😄",
        "¡Mmm... respuestas correctas! 🍩",
        "¡Lo lograste, vecinito! 🏠",
        "¡Eres más inteligente que Homer! 🧠"
    ];

    const respuestasTriviaIncorrecta = [
        "¡D'oh! ❌",
        "¡Ay, caramba! No era esa 😅",
        "No no no... ¡Eat my shorts! 🎸",
        "Mmm... incorrecta 🤔"
    ];

    function finalizarTrivia() {
        const pregEl = document.getElementById('trivia-pregunta');
        const opcionesEl = document.getElementById('trivia-opciones');
        const resultadoEl = document.getElementById('trivia-resultado');
        const barraEl = document.getElementById('trivia-barra');

        barraEl.style.width = '100%';
        pregEl.textContent = '';

        const total = triviaEstado.preguntas.length * 10;
        const pct = (triviaEstado.score / total) * 100;

        let mensaje;
        if (pct >= 80) mensaje = "¡Eres un verdadero fan de Los Simpson! 🏆";
        else if (pct >= 50) mensaje = "¡No está mal! Conoces Springfield 📺";
        else mensaje = "¡D'oh! Pero seguro la pasaste bien 😄";

        opcionesEl.innerHTML = '';
        mostrarFeedback(resultadoEl, `Puntuación: ${triviaEstado.score}/${total} - ${mensaje}`, triviaEstado.score >= 50 ? 'correcto' : 'incorrecto');

        const btnReiniciar = document.createElement('button');
        btnReiniciar.className = 'trivia-opcion';
        btnReiniciar.textContent = '🔄 Jugar de nuevo';
        btnReiniciar.style.marginTop = '1rem';
        btnReiniciar.addEventListener('click', iniciarTrivia);
        opcionesEl.appendChild(btnReiniciar);

        triviaEstado.terminado = true;
    }

    let personajeEstado = {
        personajes: [],
        actual: 0,
        score: 0,
        terminado: false
    };

    function iniciarPersonaje() {
        personajeEstado = {
            personajes: shuffle(PERSONAJES).slice(0, 8),
            actual: 0,
            score: 0,
            terminado: false
        };
        mostrarPersonaje();
    }

    function mostrarPersonaje() {
        const estado = personajeEstado;
        if (estado.actual >= estado.personajes.length) {
            finalizarPersonaje();
            return;
        }

        const p = estado.personajes[estado.actual];
        const pistaEl = document.getElementById('personaje-pista');
        const opcionesEl = document.getElementById('personaje-opciones');
        const contadorEl = document.getElementById('personaje-contador');
        const feedbackEl = document.getElementById('personaje-feedback');

        feedbackEl.classList.add('oculto');
        pistaEl.textContent = `"${p.pista}"`;
        contadorEl.textContent = `${estado.actual + 1} / ${estado.personajes.length}`;
        document.getElementById('personaje-score').textContent = estado.score;

        const opcionesShuffle = shuffle(p.opciones.map((op, i) => ({ texto: op, esCorrecta: i === 0 })));
        opcionesEl.innerHTML = '';

        opcionesShuffle.forEach(op => {
            const btn = document.createElement('button');
            btn.className = 'personaje-opcion';
            btn.textContent = op.texto;
            btn.addEventListener('click', () => {
                opcionesEl.querySelectorAll('.personaje-opcion').forEach(b => b.style.pointerEvents = 'none');

                if (op.esCorrecta) {
                    btn.classList.add('correcta');
                    estado.score++;
                    document.getElementById('personaje-score').textContent = estado.score;
                    mostrarFeedback(feedbackEl, "¡Correcto! ¡Eres genial! 🎉", 'correcto');
                } else {
                    btn.classList.add('incorrecta');
                    opcionesEl.querySelectorAll('.personaje-opcion').forEach(b => {
                        if (b.textContent === p.nombre) b.classList.add('correcta');
                    });
                    mostrarFeedback(feedbackEl, `Era ${p.nombre} 😅`, 'incorrecto');
                }

                estado.actual++;
                setTimeout(mostrarPersonaje, 1800);
            });
            opcionesEl.appendChild(btn);
        });
    }

    function finalizarPersonaje() {
        const pistaEl = document.getElementById('personaje-pista');
        const opcionesEl = document.getElementById('personaje-opciones');
        const feedbackEl = document.getElementById('personaje-feedback');

        pistaEl.textContent = '';
        const total = personajeEstado.personajes.length;

        let mensaje;
        if (personajeEstado.score === total) mensaje = "¡Perfecto! Conoces a todos los Simpson 🏆";
        else if (personajeEstado.score >= total * 0.6) mensaje = "¡Buen trabajo! Conoces Springfield bien 📺";
        else mensaje = "¡D'oh! Pero seguro reconoces a algunos 😄";

        opcionesEl.innerHTML = '';
        mostrarFeedback(feedbackEl, `Aciertos: ${personajeEstado.score}/${total} - ${mensaje}`, personajeEstado.score >= total * 0.6 ? 'correcto' : 'incorrecto');

        const btnReiniciar = document.createElement('button');
        btnReiniciar.className = 'personaje-opcion';
        btnReiniciar.textContent = '🔄 Jugar de nuevo';
        btnReiniciar.style.marginTop = '1rem';
        btnReiniciar.addEventListener('click', iniciarPersonaje);
        opcionesEl.appendChild(btnReiniciar);

        personajeEstado.terminado = true;
    }

    let wordleEstado = {
        palabra: '',
        intentos: [],
        intentoActual: 0,
        maxIntentos: 6,
        longPalabra: 0,
        letraActual: 0,
        terminado: false,
        hoy: ''
    };

    function iniciarWordle() {
        const hoy = new Date().toDateString();
        const palabra = WORDLE_PALABRAS[Math.floor(Math.random() * WORDLE_PALABRAS.length)];

        wordleEstado = {
            palabra: palabra,
            intentos: [],
            intentoActual: 0,
            maxIntentos: 6,
            longPalabra: palabra.length,
            letraActual: 0,
            terminado: false,
            hoy: hoy
        };

        if (localStorage.getItem('wordleDia') === hoy) {
            document.getElementById('wordle-info').textContent = 'Ya jugaste hoy, vuelve mañana 🗓️';
            document.getElementById('wordle-grid').innerHTML = '';
            document.getElementById('wordle-teclado').innerHTML = '';
            return;
        }

        document.getElementById('wordle-info').textContent = `Adivina la palabra (${palabra.length} letras)`;
        generarGridWordle();
        generarTecladoWordle();
    }

    function generarGridWordle() {
        const grid = document.getElementById('wordle-grid');
        grid.innerHTML = '';
        grid.style.flexDirection = 'column';

        for (let i = 0; i < wordleEstado.maxIntentos; i++) {
            const fila = document.createElement('div');
            fila.className = 'wordle-fila';
            for (let j = 0; j < wordleEstado.longPalabra; j++) {
                const celda = document.createElement('div');
                celda.className = 'wordle-celda';
                celda.id = `wcelda-${i}-${j}`;
                fila.appendChild(celda);
            }
            grid.appendChild(fila);
        }

        wordleEstado.intentos = Array.from({ length: wordleEstado.maxIntentos }, () => Array(wordleEstado.longPalabra).fill(''));
    }

    function generarTecladoWordle() {
        const teclado = document.getElementById('wordle-teclado');
        teclado.innerHTML = '';
        const filas = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
        ];

        filas.forEach(fila => {
            const filaDiv = document.createElement('div');
            filaDiv.className = 'teclado-fila';
            fila.forEach(tecla => {
                const btn = document.createElement('button');
                btn.className = 'tecla';
                btn.id = `tecla-w-${tecla}`;
                if (tecla === 'ENTER' || tecla === 'DEL') {
                    btn.classList.add('ancho');
                    btn.textContent = tecla === 'ENTER' ? '↵' : '⌫';
                } else {
                    btn.textContent = tecla;
                }
                btn.addEventListener('click', () => manejarTeclaWordle(tecla));
                filaDiv.appendChild(btn);
            });
            teclado.appendChild(filaDiv);
        });
    }

    function manejarTeclaWordle(tecla) {
        if (wordleEstado.terminado) return;

        if (tecla === 'DEL') {
            if (wordleEstado.letraActual > 0) {
                wordleEstado.letraActual--;
                wordleEstado.intentos[wordleEstado.intentoActual][wordleEstado.letraActual] = '';
                actualizarGridWordle();
            }
            return;
        }

        if (tecla === 'ENTER') {
            if (wordleEstado.letraActual === wordleEstado.longPalabra) {
                verificarWordle();
            } else {
                mostrarMensajeWordle(`Faltan ${wordleEstado.longPalabra - wordleEstado.letraActual} letras`);
            }
            return;
        }

        if (wordleEstado.letraActual < wordleEstado.longPalabra && /^[A-Z]$/.test(tecla)) {
            wordleEstado.intentos[wordleEstado.intentoActual][wordleEstado.letraActual] = tecla;
            wordleEstado.letraActual++;
            actualizarGridWordle();
        }
    }

    function actualizarGridWordle() {
        for (let j = 0; j < wordleEstado.longPalabra; j++) {
            const celda = document.getElementById(`wcelda-${wordleEstado.intentoActual}-${j}`);
            if (!celda) continue;
            celda.textContent = wordleEstado.intentos[wordleEstado.intentoActual][j];
            celda.classList.toggle('llena', wordleEstado.intentos[wordleEstado.intentoActual][j] !== '');
        }
    }

    function verificarWordle() {
        const intento = wordleEstado.intentos[wordleEstado.intentoActual];
        const secretArr = wordleEstado.palabra.split('');
        const resultado = Array(wordleEstado.longPalabra).fill('ausente');

        for (let i = 0; i < wordleEstado.longPalabra; i++) {
            if (intento[i] === secretArr[i]) {
                resultado[i] = 'correcto';
                secretArr[i] = null;
            }
        }

        for (let i = 0; i < wordleEstado.longPalabra; i++) {
            if (resultado[i] !== 'correcto') {
                const idx = secretArr.indexOf(intento[i]);
                if (idx !== -1) {
                    resultado[i] = 'presente';
                    secretArr[idx] = null;
                }
            }
        }

        for (let i = 0; i < wordleEstado.longPalabra; i++) {
            const celda = document.getElementById(`wcelda-${wordleEstado.intentoActual}-${i}`);
            const teclaBtn = document.getElementById(`tecla-w-${intento[i]}`);
            const estado = resultado[i];

            celda.classList.add(estado);

            if (teclaBtn) {
                if (estado === 'correcto') {
                    teclaBtn.className = 'tecla';
                    if (intento[i] === 'ENTER' || intento[i] === 'DEL') teclaBtn.classList.add('ancho');
                    teclaBtn.classList.add('correcto');
                } else if (estado === 'presente' && !teclaBtn.classList.contains('correcto')) {
                    teclaBtn.className = 'tecla';
                    if (intento[i] === 'ENTER' || intento[i] === 'DEL') teclaBtn.classList.add('ancho');
                    teclaBtn.classList.add('presente');
                } else if (estado === 'ausente' && !teclaBtn.classList.contains('correcto') && !teclaBtn.classList.contains('presente')) {
                    teclaBtn.className = 'tecla';
                    if (intento[i] === 'ENTER' || intento[i] === 'DEL') teclaBtn.classList.add('ancho');
                    teclaBtn.classList.add('ausente');
                }
            }
        }

        if (intento.join('') === wordleEstado.palabra) {
            wordleEstado.terminado = true;
            localStorage.setItem('wordleDia', wordleEstado.hoy);
            mostrarMensajeWordle("¡Adivinaste! 🎉");
            setTimeout(() => reiniciarWordleBoton(), 2000);
        } else {
            wordleEstado.intentoActual++;
            wordleEstado.letraActual = 0;

            if (wordleEstado.intentoActual >= wordleEstado.maxIntentos) {
                wordleEstado.terminado = true;
                localStorage.setItem('wordleDia', wordleEstado.hoy);
                mostrarMensajeWordle(`Perdiste 😅. La palabra era: ${wordleEstado.palabra}`);
                setTimeout(() => reiniciarWordleBoton(), 3000);
            }
        }
    }

    function reiniciarWordleBoton() {
        const grid = document.getElementById('wordle-grid');
        const info = document.getElementById('wordle-info');
        const existing = grid.parentElement.querySelector('.btn-reiniciar-wordle');
        if (existing) existing.remove();
        const btnReiniciar = document.createElement('button');
        btnReiniciar.className = 'trivia-opcion btn-reiniciar-wordle';
        btnReiniciar.textContent = '🔄 Jugar de nuevo';
        btnReiniciar.style.marginTop = '1rem';
        btnReiniciar.addEventListener('click', () => {
            localStorage.removeItem('wordleDia');
            btnReiniciar.remove();
            iniciarWordle();
        });
        grid.parentElement.appendChild(btnReiniciar);
    }

    function mostrarMensajeWordle(texto) {
        const msg = document.getElementById('wordle-mensaje');
        msg.classList.remove('oculto');
        msg.textContent = texto;
        setTimeout(() => msg.classList.add('oculto'), 3000);
    }

    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('modal-wordle');
        if (modal && !modal.classList.contains('oculto')) {
            const tecla = e.key.toUpperCase();
            if (/^[A-Z]$/.test(tecla)) manejarTeclaWordle(tecla);
            else if (tecla === 'ENTER') manejarTeclaWordle('ENTER');
            else if (e.key === 'Backspace') manejarTeclaWordle('DEL');
        }
    });

    let memoriaEstado = {
        cartas: [],
        volteadas: [],
        emparejadas: 0,
        movimientos: 0,
        bloqueado: false,
        terminado: false
    };

    function iniciarMemoria() {
        const parejasDuplicadas = [...MEMORIA_PAREJAS, ...MEMORIA_PAREJAS];
        const cartasShuffle = shuffle(parejasDuplicadas);

        memoriaEstado = {
            cartas: cartasShuffle,
            volteadas: [],
            emparejadas: 0,
            movimientos: 0,
            bloqueado: false,
            terminado: false
        };

        document.getElementById('memoria-movimientos').textContent = '0';
        document.getElementById('memoria-parejas').textContent = '0';

        const grid = document.getElementById('memoria-grid');
        grid.innerHTML = '';

        grid.style.gridTemplateColumns = 'repeat(4, 1fr)';

        cartasShuffle.forEach((carta, i) => {
            const cartaEl = document.createElement('div');
            cartaEl.className = 'memoria-carta';
            cartaEl.dataset.index = i;
            cartaEl.innerHTML = `
                <div class="carta-contenido">
                    <div class="carta-personaje">${carta.emoji}</div>
                    <div class="carta-frase">${carta.personaje}</div>
                </div>
            `;
            cartaEl.addEventListener('click', () => voltearCarta(i));
            grid.appendChild(cartaEl);
        });

        document.getElementById('memoria-mensaje').classList.add('oculto');
    }

    function voltearCarta(index) {
        if (memoriaEstado.bloqueado || memoriaEstado.terminado) return;

        const cartaEl = document.querySelectorAll('.memoria-carta')[index];
        if (!cartaEl || cartaEl.classList.contains('volteada') || cartaEl.classList.contains('emparejada')) return;

        cartaEl.classList.add('volteada');
        memoriaEstado.volteadas.push(index);

        if (memoriaEstado.volteadas.length === 2) {
            memoriaEstado.movimientos++;
            document.getElementById('memoria-movimientos').textContent = memoriaEstado.movimientos;

            const [i1, i2] = memoriaEstado.volteadas;
            const c1 = memoriaEstado.cartas[i1];
            const c2 = memoriaEstado.cartas[i2];

            if (c1.emoji === c2.emoji && c1.personaje === c2.personaje) {
                const el1 = document.querySelectorAll('.memoria-carta')[i1];
                const el2 = document.querySelectorAll('.memoria-carta')[i2];
                el1.classList.add('emparejada');
                el2.classList.add('emparejada');
                memoriaEstado.emparejadas++;
                document.getElementById('memoria-parejas').textContent = memoriaEstado.emparejadas;
                memoriaEstado.volteadas = [];

                if (memoriaEstado.emparejadas === MEMORIA_PAREJAS.length) {
                    memoriaEstado.terminado = true;
                    const msgEl = document.getElementById('memoria-mensaje');
                    mostrarFeedback(msgEl, `¡Ganaste! En ${memoriaEstado.movimientos} movimientos 🎉`, 'correcto');
                }
            } else {
                memoriaEstado.bloqueado = true;
                setTimeout(() => {
                    const el1 = document.querySelectorAll('.memoria-carta')[i1];
                    const el2 = document.querySelectorAll('.memoria-carta')[i2];
                    if (el1) el1.classList.remove('volteada');
                    if (el2) el2.classList.remove('volteada');
                    memoriaEstado.volteadas = [];
                    memoriaEstado.bloqueado = false;
                }, 900);
            }
        }
    }

    let lluviaAnimacion = null;
    let intensidadListener = null;

    function iniciarLluvia() {
        const canvas = document.getElementById('canvas-lluvia');
        const ctx = canvas.getContext('2d');
        const intensidadInput = document.getElementById('lluvia-intensidad');

        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const ancho = canvas.offsetWidth;
        const alto = canvas.offsetHeight;

        let gotas = [];
        let intensidad = parseInt(intensidadInput.value);

        if (intensidadListener) intensidadInput.removeEventListener('input', intensidadListener);
        intensidadListener = () => { intensidad = parseInt(intensidadInput.value); };
        intensidadInput.addEventListener('input', intensidadListener);

        const edificios = [
            { x: ancho * 0.05, w: 30, h: 60, color: '#1a2a1a' },
            { x: ancho * 0.15, w: 25, h: 45, color: '#1a2a1a' },
            { x: ancho * 0.3, w: 20, h: 35, color: '#1a2a1a' },
            { x: ancho * 0.5, w: 18, h: 90, color: '#2a3a2a', esNuclear: true },
            { x: ancho * 0.65, w: 28, h: 40, color: '#1a2a1a' },
            { x: ancho * 0.8, w: 22, h: 50, color: '#1a2a1a' },
            { x: ancho * 0.9, w: 26, h: 38, color: '#1a2a1a' },
        ];

        if (lluviaAnimacion) cancelAnimationFrame(lluviaAnimacion);

        function animar() {
            ctx.clearRect(0, 0, ancho, alto);

            const gradCielo = ctx.createLinearGradient(0, 0, 0, alto);
            gradCielo.addColorStop(0, '#0a0a2a');
            gradCielo.addColorStop(0.5, '#1a1a3a');
            gradCielo.addColorStop(0.85, '#2a3a2a');
            gradCielo.addColorStop(1, '#3a5a3a');
            ctx.fillStyle = gradCielo;
            ctx.fillRect(0, 0, ancho, alto);

            edificios.forEach(e => {
                ctx.fillStyle = e.color;
                ctx.fillRect(e.x, alto - e.h, e.w, e.h);

                if (e.esNuclear) {
                    ctx.fillStyle = '#FDB927';
                    ctx.fillRect(e.x + 4, alto - e.h + 10, 10, 6);
                    ctx.fillRect(e.x + 4, alto - e.h + 22, 10, 6);

                    ctx.fillStyle = '#3a5a3a';
                    ctx.fillRect(e.x + 4, alto - 15, 10, 15);
                }
            });

            const maxGotas = intensidad * 8;
            while (gotas.length < maxGotas) {
                gotas.push({
                    x: Math.random() * ancho,
                    y: Math.random() * -alto,
                    vel: 2 + Math.random() * 3 + intensidad * 0.3,
                    len: 5 + Math.random() * 10,
                    opacidad: 0.2 + Math.random() * 0.4
                });
            }

            while (gotas.length > maxGotas) gotas.pop();

            ctx.strokeStyle = '#7EC8E3';
            ctx.lineWidth = 1;

            gotas.forEach(g => {
                ctx.globalAlpha = g.opacidad;
                ctx.beginPath();
                ctx.moveTo(g.x, g.y);
                ctx.lineTo(g.x - 1, g.y + g.len);
                ctx.stroke();

                g.y += g.vel;
                if (g.y > alto) {
                    g.y = Math.random() * -100;
                    g.x = Math.random() * ancho;
                }
            });

            ctx.globalAlpha = 1;

            lluviaAnimacion = requestAnimationFrame(animar);
        }

        animar();
    }

    window.iniciarJuego = function (juego) {
        switch (juego) {
            case 'trivia': iniciarTrivia(); break;
            case 'personaje': iniciarPersonaje(); break;
            case 'wordle': iniciarWordle(); break;
            case 'memoria': iniciarMemoria(); break;
            case 'lluvia': setTimeout(iniciarLluvia, 100); break;
        }
    };

    window.detenerLluvia = function () {
        if (lluviaAnimacion) {
            cancelAnimationFrame(lluviaAnimacion);
            lluviaAnimacion = null;
        }
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lluviaAnimacion) {
            cancelAnimationFrame(lluviaAnimacion);
            lluviaAnimacion = null;
        }
    });

})();
