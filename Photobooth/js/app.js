document.addEventListener('DOMContentLoaded', function() {

    var sesion = JSON.parse(localStorage.getItem('sesionActiva') || 'null');
    var paginaActual = window.location.pathname.split('/').pop() || 'index.html';

    if (!sesion && paginaActual !== 'index.html') {
        window.location.href = 'index.html';
        return;
    }

    if (sesion && paginaActual === 'index.html') {
        window.location.href = 'inicio.html';
        return;
    }

    if (sesion && paginaActual !== 'index.html') {
        var header = document.querySelector('header');
        if (header) {
            var indicador = document.createElement('div');
            indicador.classList.add('sesionIndicador');
            if (sesion.tipo === 'admin') {
                indicador.innerHTML = '<span class="sesionNombre">Administrador</span>';
            } else {
                indicador.innerHTML = '<span class="sesionNombre">Hola, ' + sesion.nombre + '</span>';
            }
            indicador.innerHTML += '<button class="btnCerrarSesion" id="btnCerrarSesion">Cerrar Sesión</button>';
            header.appendChild(indicador);

            document.getElementById('btnCerrarSesion').addEventListener('click', function() {
                localStorage.removeItem('sesionActiva');
                window.location.href = 'index.html';
            });
        }
    }

    var formularioLogin = document.getElementById('formularioLogin');
    var formularioRegistro = document.getElementById('formularioRegistro');
    var toggleRegistro = document.getElementById('toggleRegistro');
    var toggleLogin = document.getElementById('toggleLogin');
    var toggleLoginTexto = document.getElementById('toggleLoginTexto');
    var tituloFormulario = document.getElementById('tituloFormulario');

    if (formularioLogin && formularioRegistro) {
        toggleRegistro.addEventListener('click', function(e) {
            e.preventDefault();
            formularioLogin.style.display = 'none';
            formularioRegistro.style.display = 'flex';
            toggleRegistro.parentElement.style.display = 'none';
            toggleLoginTexto.style.display = 'block';
            tituloFormulario.textContent = 'Registrarse';
        });

        toggleLogin.addEventListener('click', function(e) {
            e.preventDefault();
            formularioRegistro.style.display = 'none';
            formularioLogin.style.display = 'flex';
            toggleLoginTexto.style.display = 'none';
            toggleRegistro.parentElement.style.display = 'block';
            tituloFormulario.textContent = 'Iniciar Sesión';
        });

        formularioLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            var usuario = document.getElementById('inputLoginUsuario').value.trim();
            var password = document.getElementById('inputLoginPassword').value.trim();
            var errorLogin = document.getElementById('errorLogin');
            errorLogin.textContent = '';

            if (usuario === '' || password === '') {
                errorLogin.textContent = 'Por favor, completa todos los campos.';
                return;
            }

            if (usuario === 'admin' && password === '1234') {
                localStorage.setItem('sesionActiva', JSON.stringify({ tipo: 'admin' }));
                window.location.href = 'inicio.html';
                return;
            }

            var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            var encontrado = null;
            for (var i = 0; i < usuarios.length; i++) {
                if (usuarios[i].usuario === usuario && usuarios[i].password === password) {
                    encontrado = usuarios[i];
                    break;
                }
            }

            if (!encontrado) {
                errorLogin.textContent = 'Credenciales incorrectas. Intenta de nuevo.';
                return;
            }

            localStorage.setItem('sesionActiva', JSON.stringify({
                tipo: 'usuario',
                nombre: encontrado.nombre,
                telefono: encontrado.telefono,
                email: encontrado.email
            }));
            window.location.href = 'inicio.html';
        });

        formularioRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            var nombre = document.getElementById('inputRegNombre').value.trim();
            var telefono = document.getElementById('inputRegTelefono').value.trim();
            var email = document.getElementById('inputRegEmail').value.trim();
            var usuario = document.getElementById('inputRegUsuario').value.trim();
            var password = document.getElementById('inputRegPassword').value.trim();
            var errorRegistro = document.getElementById('errorRegistro');
            errorRegistro.textContent = '';

            if (nombre === '' || telefono === '' || email === '' || usuario === '' || password === '') {
                errorRegistro.textContent = 'Por favor, completa todos los campos.';
                return;
            }

            if (nombre.length < 3) {
                errorRegistro.textContent = 'El nombre debe tener al menos 3 caracteres.';
                return;
            }

            if (isNaN(telefono)) {
                errorRegistro.textContent = 'El teléfono solo debe contener números.';
                return;
            }

            var telRegex = /^(9\d{8}|569\d{8})$/;
            if (!telRegex.test(telefono)) {
                errorRegistro.textContent = 'Formato inválido. Usa: 912345678 o 56912345678.';
                return;
            }

            var correoRegex = /@.+\..+/;
            if (!correoRegex.test(email)) {
                errorRegistro.textContent = 'El correo electrónico no es válido (debe contener @dominio.ext).';
                return;
            }

            if (usuario.length < 3) {
                errorRegistro.textContent = 'El usuario debe tener al menos 3 caracteres.';
                return;
            }

            if (password.length < 4) {
                errorRegistro.textContent = 'La contraseña debe tener al menos 4 caracteres.';
                return;
            }

            var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            for (var i = 0; i < usuarios.length; i++) {
                if (usuarios[i].usuario === usuario) {
                    errorRegistro.textContent = 'Ese nombre de usuario ya está registrado.';
                    return;
                }
            }

            usuarios.push({ nombre: nombre, telefono: telefono, email: email, usuario: usuario, password: password });
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            localStorage.setItem('sesionActiva', JSON.stringify({
                tipo: 'usuario',
                nombre: nombre,
                telefono: telefono,
                email: email
            }));
            window.location.href = 'inicio.html';
        });
    }

    var enlacesNav = document.querySelectorAll('header nav a');
    enlacesNav.forEach(function(enlace) {
        var href = enlace.getAttribute('href');
        if (href === paginaActual) {
            enlace.classList.add('navActivo');
        }
    });

    var slides = document.querySelectorAll('.carruselSlide');
    var puntos = document.querySelectorAll('.carruselPunto');
    var btnIzq = document.querySelector('.carruselIzq');
    var btnDer = document.querySelector('.carruselDer');
    var actual = 0;
    var total = slides.length;

    if (slides.length > 0) {
        function mostrarSlide(index) {
            slides[actual].classList.remove('activo');
            puntos[actual].classList.remove('activo');
            actual = index;
            slides[actual].classList.add('activo');
            puntos[actual].classList.add('activo');
        }

        function siguiente() {
            mostrarSlide((actual + 1) % total);
        }

        function anterior() {
            mostrarSlide((actual - 1 + total) % total);
        }

        var intervalo = setInterval(siguiente, 4000);

        btnDer.addEventListener('click', function() {
            clearInterval(intervalo);
            siguiente();
            intervalo = setInterval(siguiente, 4000);
        });

        btnIzq.addEventListener('click', function() {
            clearInterval(intervalo);
            anterior();
            intervalo = setInterval(siguiente, 4000);
        });

        puntos.forEach(function(punto) {
            punto.addEventListener('click', function() {
                clearInterval(intervalo);
                mostrarSlide(parseInt(this.dataset.index));
                intervalo = setInterval(siguiente, 4000);
            });
        });
    }

    var equipoContainer = document.getElementById('equipoContainer');
    if (equipoContainer) {
        var equipo = [
            {
                nombre: 'Elí Nuñez',
                cargo: 'Fotógrafo Principal',
                camara: 'Canon EOS R6',
                foto: 'src/camara.jpg'
            },
            {
                nombre: 'Camila Aponte',
                cargo: 'Operadora Técnica',
                camara: 'Sony A7 IV',
                foto: 'src/evento.jpg'
            },
            {
                nombre: 'Mateo Rojas',
                cargo: 'Operador de Iluminación',
                camara: 'Nikon Z6 II',
                foto: 'src/impresiones.jpg'
            }
        ];

        equipo.forEach(function(miembro) {
            var tarjeta = document.createElement('div');
            tarjeta.classList.add('tarjetaEquipo');
            tarjeta.innerHTML =
                '<img src="' + miembro.foto + '" alt="' + miembro.nombre + ' - ' + miembro.cargo + '">' +
                '<h3>' + miembro.nombre + '</h3>' +
                '<p class="cargo">' + miembro.cargo + '</p>' +
                '<p class="camara">Cámara: ' + miembro.camara + '</p>';
            equipoContainer.appendChild(tarjeta);
        });
    }

    var btnCotizar = document.getElementById('btnCotizar');
    if (btnCotizar) {
        btnCotizar.addEventListener('click', function() {
            var selectTipoServicio = document.getElementById('selectTipoServicio');
            var inputHoras = document.getElementById('inputHoras');
            var checkImpresiones = document.getElementById('checkImpresiones');
            var errorHoras = document.getElementById('errorHoras');
            var resumenReserva = document.getElementById('resumenReserva');
            var horas = inputHoras.value.trim();
            errorHoras.textContent = '';
            resumenReserva.style.display = 'none';

            if (horas === '') {
                errorHoras.textContent = 'Por favor, ingresa la cantidad de horas.';
                return;
            }

            if (isNaN(horas)) {
                errorHoras.textContent = 'El valor ingresado no es un número válido.';
                return;
            }

            var horasNum = parseFloat(horas);

            if (horasNum < 1) {
                errorHoras.textContent = 'La cantidad de horas debe ser igual o mayor a 1 hora.';
                return;
            }

            if (horasNum !== Math.floor(horasNum)) {
                errorHoras.textContent = 'La cantidad de horas debe ser un número entero (sin decimales).';
                return;
            }

            var optionSeleccionada = selectTipoServicio.options[selectTipoServicio.selectedIndex];
            var maxHoras = parseInt(optionSeleccionada.getAttribute('data-max-horas'));
            var tipoServicio = selectTipoServicio.value;
            var nombreTipoServicio = optionSeleccionada.text.split(' (')[0];

            if (horasNum > maxHoras) {
                errorHoras.textContent = 'Para ' + nombreTipoServicio + ' el máximo es de ' + maxHoras + ' horas.';
                return;
            }

            var costoBase = horasNum * 8000;
            var costoImpresiones = checkImpresiones.checked ? 5000 : 0;
            var total = costoBase + costoImpresiones;

            var reserva = {
                servicio: 'Cabina Fotográfica Tótem',
                tipoServicio: nombreTipoServicio,
                tipoServicioId: tipoServicio,
                horas: horasNum,
                impresiones: checkImpresiones.checked,
                total: total
            };
            localStorage.setItem('reservaActiva', JSON.stringify(reserva));

            resumenReserva.innerHTML =
                '<h3>Resumen de Reserva</h3>' +
                '<div class="resumenFila"><span>Servicio</span><span>Cabina Fotográfica Tótem</span></div>' +
                '<div class="resumenFila"><span>Tipo de Evento</span><span>' + nombreTipoServicio + '</span></div>' +
                '<div class="resumenFila"><span>Horas</span><span>' + horasNum + ' hora(s) × $8.000</span></div>' +
                '<div class="resumenFila"><span>Costo base</span><span>$' + costoBase.toLocaleString('es-CL') + '</span></div>' +
                '<div class="resumenFila"><span>Impresiones ilimitadas</span><span>' + (checkImpresiones.checked ? '+ $5.000' : 'No incluido') + '</span></div>' +
                '<div class="resumenFila"><span>TOTAL</span><span>$' + total.toLocaleString('es-CL') + '</span></div>';
            resumenReserva.style.display = 'block';
        });
    }

    var formularioContacto = document.getElementById('formularioContacto');
    if (formularioContacto && sesion) {
        if (sesion.tipo === 'admin') {
            var contactoSection = formularioContacto.closest('.cotizador');
            if (contactoSection) contactoSection.style.display = 'none';
        } else {
            document.getElementById('inputNombreContacto').value = sesion.nombre;
            document.getElementById('inputTelefonoContacto').value = sesion.telefono;
            document.getElementById('inputEmailContacto').value = sesion.email;
        }

        formularioContacto.addEventListener('submit', function(e) {
            e.preventDefault();
            var nombre = document.getElementById('inputNombreContacto');
            var telefono = document.getElementById('inputTelefonoContacto');
            var email = document.getElementById('inputEmailContacto');
            var mensaje = document.getElementById('inputMensajeContacto');
            var errorContacto = document.getElementById('errorContacto');
            var exitoContacto = document.getElementById('exitoContacto');

            errorContacto.textContent = '';
            exitoContacto.style.display = 'none';

            var nombreVal = nombre.value.trim();
            var telefonoVal = telefono.value.trim();
            var emailVal = email.value.trim();
            var mensajeVal = mensaje.value.trim();

            if (nombreVal === '' || telefonoVal === '' || emailVal === '' || mensajeVal === '') {
                errorContacto.textContent = 'Por favor, completa todos los campos.';
                return;
            }

            if (nombreVal.length < 3) {
                errorContacto.textContent = 'El nombre debe tener al menos 3 caracteres.';
                return;
            }

            if (isNaN(telefonoVal)) {
                errorContacto.textContent = 'El teléfono solo debe contener números.';
                return;
            }

            var telRegex = /^(9\d{8}|569\d{8})$/;
            if (!telRegex.test(telefonoVal)) {
                errorContacto.textContent = 'Formato inválido. Usa: 912345678 o 56912345678.';
                return;
            }

            var correoRegex = /@.+\..+/;
            if (!correoRegex.test(emailVal)) {
                errorContacto.textContent = 'El correo electrónico no es válido (debe contener @dominio.ext).';
                return;
            }

            if (mensajeVal.length < 5) {
                errorContacto.textContent = 'El mensaje debe tener al menos 5 caracteres.';
                return;
            }

            var consulta = {
                nombre: nombreVal,
                telefono: telefonoVal,
                email: emailVal,
                mensaje: mensajeVal,
                fecha: new Date().toLocaleString('es-CL')
            };
            var consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
            consultas.push(consulta);
            localStorage.setItem('consultas', JSON.stringify(consultas));

            exitoContacto.textContent = '✓ Consulta enviada correctamente. ¡Te contactaremos pronto!';
            exitoContacto.style.display = 'block';
            mensaje.value = '';
        });
    }

    var panelAdmin = document.getElementById('panelAdmin');
    if (panelAdmin && sesion && sesion.tipo === 'admin') {
        panelAdmin.style.display = 'block';
        renderizarTablaReservas();
    }

    function renderizarTablaReservas() {
        var tablaCuerpo = document.getElementById('cuerpoTabla');
        if (!tablaCuerpo) return;
        var reservaActiva = localStorage.getItem('reservaActiva');
        tablaCuerpo.innerHTML = '';
        if (reservaActiva) {
            var datos = JSON.parse(reservaActiva);
            var fila = document.createElement('tr');
            fila.innerHTML =
                '<td>' + datos.servicio + '</td>' +
                '<td>' + (datos.tipoServicio || 'No especificado') + '</td>' +
                '<td>' + datos.horas + '</td>' +
                '<td>' + (datos.impresiones ? 'Sí' : 'No') + '</td>' +
                '<td>$' + datos.total.toLocaleString('es-CL') + '</td>';
            tablaCuerpo.appendChild(fila);
        } else {
            var filaVacia = document.createElement('tr');
            filaVacia.innerHTML = '<td colspan="5" style="text-align:center; color: var(--text-muted);">No hay reservas registradas</td>';
            tablaCuerpo.appendChild(filaVacia);
        }

        var tablaConsultas = document.getElementById('cuerpoTablaConsultas');
        if (!tablaConsultas) return;
        var consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
        tablaConsultas.innerHTML = '';
        if (consultas.length > 0) {
            consultas.forEach(function(c) {
                var fila = document.createElement('tr');
                fila.innerHTML =
                    '<td><strong>' + c.nombre + '</strong></td>' +
                    '<td>' + c.telefono + '</td>' +
                    '<td>' + c.email + '</td>' +
                    '<td>' + c.mensaje + '</td>' +
                    '<td style="white-space:nowrap;">' + c.fecha + '</td>';
                tablaConsultas.appendChild(fila);
            });
        } else {
            var filaVacia = document.createElement('tr');
            filaVacia.innerHTML = '<td colspan="5" style="text-align:center; color: var(--text-muted); padding:24px;">No hay consultas registradas</td>';
            tablaConsultas.appendChild(filaVacia);
        }

        var tablaUsuarios = document.getElementById('cuerpoTablaUsuarios');
        if (!tablaUsuarios) return;
        var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        tablaUsuarios.innerHTML = '';
        if (usuarios.length > 0) {
            usuarios.forEach(function(u) {
                var fila = document.createElement('tr');
                fila.innerHTML =
                    '<td><strong>' + u.nombre + '</strong></td>' +
                    '<td>' + u.telefono + '</td>' +
                    '<td>' + u.email + '</td>' +
                    '<td>' + u.usuario + '</td>';
                tablaUsuarios.appendChild(fila);
            });
        } else {
            var filaVacia = document.createElement('tr');
            filaVacia.innerHTML = '<td colspan="4" style="text-align:center; color: var(--text-muted); padding:24px;">No hay usuarios registrados</td>';
            tablaUsuarios.appendChild(filaVacia);
        }
    }

    var btnVaciarReservas = document.getElementById('btnVaciarReservas');
    if (btnVaciarReservas) {
        btnVaciarReservas.addEventListener('click', function() {
            localStorage.removeItem('reservaActiva');
            renderizarTablaReservas();
        });
    }

    var btnVaciarConsultas = document.getElementById('btnVaciarConsultas');
    if (btnVaciarConsultas) {
        btnVaciarConsultas.addEventListener('click', function() {
            localStorage.removeItem('consultas');
            renderizarTablaReservas();
        });
    }

    var btnVaciarUsuarios = document.getElementById('btnVaciarUsuarios');
    if (btnVaciarUsuarios) {
        btnVaciarUsuarios.addEventListener('click', function() {
            localStorage.removeItem('usuarios');
            renderizarTablaReservas();
        });
    }

    var btnCalcular = document.getElementById('btnCalcular');
    if (btnCalcular) {
        btnCalcular.addEventListener('click', function() {
            var inputCPC = document.getElementById('inputCPC');
            var inputClics = document.getElementById('inputClics');
            var errorFinanzas = document.getElementById('errorFinanzas');
            var resultadoFinanzas = document.getElementById('resultadoFinanzas');
            var warningAds = document.getElementById('warningAds');

            errorFinanzas.textContent = '';
            resultadoFinanzas.style.display = 'none';
            warningAds.style.display = 'none';

            var dominioNum = 9990;
            var hostingNum = 30000;
            var tarifaNum = 10000;
            var horasTrabajoNum = 30;

            var palabraClave = inputCPC.value.trim().toLowerCase();
            var clics = inputClics.value.trim();

            if (palabraClave === '' || clics === '') {
                errorFinanzas.textContent = 'Por favor, completa todos los campos.';
                return;
            }

            if (palabraClave.indexOf(' ') !== -1) {
                errorFinanzas.textContent = 'Ingresa una sola palabra clave.';
                return;
            }

            if (isNaN(clics)) {
                errorFinanzas.textContent = 'La cantidad de clics debe ser numérica.';
                return;
            }

            var clicsNum = parseFloat(clics);

            if (clicsNum < 0) {
                errorFinanzas.textContent = 'Los clics no pueden ser negativos.';
                return;
            }

            fetch('js/keywords.json')
                .then(function(response) { return response.json(); })
                .then(function(data) {
                    var cpcNum = 0;
                    var nivelRelevancia = '';

                    for (var i = 0; i < data.alta.length; i++) {
                        if (palabraClave === data.alta[i]) {
                            cpcNum = 300;
                            nivelRelevancia = 'Alta relevancia';
                            break;
                        }
                    }

                    if (cpcNum === 0) {
                        for (var i = 0; i < data.media.length; i++) {
                            if (palabraClave === data.media[i]) {
                                cpcNum = 180;
                                nivelRelevancia = 'Media relevancia';
                                break;
                            }
                        }
                    }

                    if (cpcNum === 0) {
                        for (var i = 0; i < data.baja.length; i++) {
                            if (palabraClave === data.baja[i]) {
                                cpcNum = 80;
                                nivelRelevancia = 'Baja relevancia';
                                break;
                            }
                        }
                    }

                    if (cpcNum === 0) {
                        cpcNum = 50;
                        nivelRelevancia = 'Sin relevancia';
                    }

                    var costoCapitalHumano = horasTrabajoNum * tarifaNum;
                    var costoAds = cpcNum * clicsNum;
                    var costoTotal = dominioNum + hostingNum + costoCapitalHumano + costoAds;

                    var formatoCLP = function(valor) {
                        return '$' + Math.round(valor).toLocaleString('es-CL');
                    };

                    document.getElementById('resDominio').textContent = formatoCLP(dominioNum);
                    document.getElementById('resHosting').textContent = formatoCLP(hostingNum);
                    document.getElementById('resHoras').textContent = horasTrabajoNum;
                    document.getElementById('resTarifa').textContent = formatoCLP(tarifaNum);
                    document.getElementById('resHumano').textContent = formatoCLP(costoCapitalHumano);
                    document.getElementById('resAds').textContent = formatoCLP(costoAds) + ' (' + nivelRelevancia + ' - CPC: ' + formatoCLP(cpcNum) + ' por clic)';
                    document.getElementById('resTotal').textContent = formatoCLP(costoTotal);

                    resultadoFinanzas.style.display = 'block';

                    if (costoAds > 50000) {
                        warningAds.style.display = 'block';
                    }
                });
        });
    }

    // =====================================================
    // CHATBOT - Codigo generado con IA
    // A partir de aqui comienza el modulo del chatbot.
    // =====================================================

    if (paginaActual !== 'index.html') {

        var chatRespuestas = [
            // SALUDOS
            {
                keywords: ['hola', 'buenos', 'buenas', 'hey', 'que', 'tal', 'saludos', 'como', 'estas', 'onda', 'wena', 'holaa', 'holi', 'dias', 'tardes', 'noches'],
                respuesta: 'Hola! Bienvenido a PhotoBooth. Soy tu asistente virtual. Puedo ayudarte con informacion sobre nuestros servicios, precios, horarios, ubicacion y mas. Que te gustaria saber?'
            },
            // DESPEDIDAS
            {
                keywords: ['chao', 'adios', 'hasta', 'luego', 'nos', 'vemos', 'bye', 'pronto', 'manana'],
                respuesta: 'Hasta luego! Espero haberte ayudado. Si necesitas algo mas, aqui estare. Que tengas un excelente dia!'
            },
            // AGRADECIMIENTOS
            {
                keywords: ['gracias', 'agradezco', 'thanks', 'perfecto', 'genial', 'excelente'],
                respuesta: 'De nada! Me alegra poder ayudarte. Hay algo mas que quieras saber?'
            },
            // PRECIOS Y COSTOS
            {
                keywords: ['precio', 'precios', 'costo', 'costos', 'cuanto', 'cuesta', 'cuestan', 'valor', 'valores', 'tarifa', 'tarifas', 'cobran', 'cobro', 'cobras', 'dinero', 'plata', 'pesos', 'clp', 'presupuesto', 'cotizar', 'cotizacion', 'cotizo'],
                respuesta: 'PRECIOS PHOTOBOOTH\n\n- Servicio base: $8.000 CLP por hora\n- Impresiones ilimitadas: +$5.000 CLP (adicional, costo fijo)\n\nLimites de horas por tipo de evento:\n- Bodas: hasta 36 horas\n- Eventos Corporativos: hasta 12 horas\n- Fiestas: hasta 12 horas\n- Aire Libre: hasta 24 horas\n\nEjemplos:\n- 1 hora = $8.000\n- 3 horas = $24.000\n- 5 horas = $40.000\n- 5 horas + impresiones = $45.000\n\nUsa nuestro cotizador en la <a href="servicios.html">pagina de Servicios</a> para calcular el costo exacto de tu evento.'
            },
            // SERVICIO/PRODUCTO
            {
                keywords: ['servicio', 'servicios', 'cabina', 'cabinas', 'fotografia', 'fotografica', 'totem', 'photo', 'booth', 'photobooth', 'arriendo', 'arrendar', 'alquilar', 'alquilan', 'renta', 'producto', 'productos', 'ofrecen', 'hacen'],
                respuesta: 'NUESTRO SERVICIO\n\nOfrecemos el arriendo de Cabina Fotografica Totem, que incluye:\n\n- Iluminacion profesional\n- Fondo personalizado a tu gusto\n- Operador tecnico capacitado\n- Impresiones ilimitadas (opcional, +$5.000)\n- Formato Totem vertical moderno\n\nIdeal para bodas, fiestas, eventos corporativos, cumpleanos, graduaciones y mas. Consulta precios en la <a href="servicios.html">pagina de Servicios</a>.'
            },
            // IMPRESIONES
            {
                keywords: ['impresion', 'impresiones', 'imprimir', 'fotos', 'fotografias', 'cantidad', 'ilimitada', 'ilimitadas', 'copias', 'copia', 'imprime', 'prints'],
                respuesta: 'IMPRESIONES\n\n- Las impresiones son ILIMITADAS durante todo el evento\n- Costo adicional: $5.000 CLP (se agrega al precio base)\n- Sin impresiones: recibes las fotos en formato digital\n\nSi no agregas impresiones, las fotos se comparten digitalmente despues del evento. Las impresiones ilimitadas permiten que todos los invitados saquen fotos sin limite.'
            },
            // HORARIOS
            {
                keywords: ['horario', 'horarios', 'hora', 'horas', 'cuando', 'abren', 'cierran', 'atencion', 'disponible', 'disponibilidad', 'tiempo', 'funcionamiento', 'lunes', 'viernes', 'sabado', 'domingo'],
                respuesta: 'HORARIOS DE ATENCION\n\n- Lunes a Viernes: 9:00 - 18:00\n- Sabados: Solo con cita previa\n- Domingos y festivos: No disponible\n\nLos horarios del servicio de PhotoBooth se coordinan segun tu evento. Te recomendamos agendar con al menos 1 semana de anticipacion.'
            },
            // UBICACION/DIRECCION
            {
                keywords: ['ubicacion', 'direccion', 'donde', 'local', 'oficina', 'sede', 'mapa', 'location', 'address', 'llegar', 'estacion', 'central', 'avenida', 'calle'],
                respuesta: 'NUESTRA UBICACION\n\n- Direccion: Avenida 5 de Abril 4936, Estacion Central, Santiago\n- Comuna: Estacion Central\n- Region: Metropolitana\n\nPuedes ver nuestra ubicacion exacta en el mapa interactivo de la <a href="contacto.html">pagina de Contacto</a>.'
            },
            // CONTACTO
            {
                keywords: ['contacto', 'contactar', 'telefono', 'celular', 'mail', 'correo', 'email', 'whatsapp', 'llamar', 'escribir', 'numero', 'redes', 'social', 'instagram', 'facebook'],
                respuesta: 'CONTACTO\n\n- Telefono: +56 9 7774 5816\n- Email: Disponible en la <a href="contacto.html">pagina de Contacto</a>\n- Horario de atencion: Lunes a Viernes 9:00 - 18:00\n\nTambien puedes enviarnos un mensaje directo desde la <a href="contacto.html">pagina de Contacto</a>. Si eres usuario registrado, el formulario se auto-completa con tus datos.'
            },
            // TIPOS DE EVENTOS
            {
                keywords: ['evento', 'eventos', 'boda', 'bodas', 'wedding', 'cumpleanos', 'cumple', 'fiesta', 'fiestas', 'corporativo', 'corporativos', 'empresa', 'empresas', 'graduacion', 'quinceanera', 'kermes', 'aniversario', 'baby', 'shower', 'bautizo', 'comunion', 'navidad'],
                respuesta: 'TIPOS DE EVENTOS\n\nTrabajamos en todo tipo de eventos:\n\n- Bodas y compromisos (max. 36 horas)\n- Eventos corporativos y empresariales (max. 12 horas)\n- Fiestas, cumpleanos, quinceaneras (max. 12 horas)\n- Eventos al aire libre (max. 24 horas)\n\nNuestra cabina se adapta a cualquier celebracion. En el cotizador de la pagina de Servicios puedes seleccionar el tipo de evento y las horas (se validan segun el tipo).'
            },
            // EQUIPO
            {
                keywords: ['equipo', 'personal', 'trabajadores', 'empleados', 'quien', 'quienes', 'fotografo', 'operador', 'operadora', 'iluminacion', 'tecnico', 'staff', 'personas'],
                respuesta: 'NUESTRO EQUIPO\n\nSomos un equipo de 3 profesionales:\n\n- Eli Nunez - Fotografo Principal (Canon EOS R6)\n- Camila Aponte - Operadora Tecnica (Sony A7 IV)\n- Mateo Rojas - Operador de Iluminacion (Nikon Z6 II)\n\nCada evento cuenta con al menos 1 operador tecnico capacitado. Mas detalles en la <a href="nosotros.html">pagina "Nosotros"</a>.'
            },
            // COTIZADOR
            {
                keywords: ['cotizar', 'cotizador', 'calcular', 'calculadora', 'estimar', 'estimacion', 'quote', 'calculator', 'suma', 'saldría', 'sale'],
                respuesta: 'COTIZADOR\n\nPara calcular el costo exacto de tu evento:\n\n1. Ve a la <a href="servicios.html">pagina de Servicios</a>\n2. Selecciona el tipo de evento:\n   - Bodas (max. 36 horas)\n   - Eventos Corporativos (max. 12 horas)\n   - Fiestas (max. 12 horas)\n   - Aire Libre (max. 24 horas)\n3. Ingresa la cantidad de horas\n4. Marca la casilla si deseas impresiones ilimitadas (+$5.000)\n5. Haz clic en "Cotizar"\n\nEl sistema calculara el total automaticamente y podras guardar la reserva.'
            },
            // QUE INCLUYE
            {
                keywords: ['incluye', 'incluir', 'incluido', 'contiene', 'trae', 'lleva', 'tengo', 'recibimos', 'dan', 'dan', 'ofrece', 'adjunta'],
                respuesta: 'QUE INCLUYE EL SERVICIO\n\nLa Cabina Fotografica Totem incluye:\n\n- Cabina Totem vertical moderna\n- Iluminacion profesional incluida\n- Fondo personalizado (elegir antes del evento)\n- Operador tecnico durante todo el evento\n- Acceso digital a todas las fotos tomadas\n\nOpcional (+$5.000):\n- Impresiones ilimitadas para todos los invitados\n\nNo incluye: transporte (se coordina segun ubicacion), decoracion adicional del evento.'
            },
            // RESERVA
            {
                keywords: ['reservar', 'reserva', 'reservacion', 'agendar', 'agenda', 'booking', 'reservo', 'pasos', 'proceso'],
                respuesta: 'COMO RESERVAR\n\n1. Registrate en <a href="index.html">nuestro sistema</a> (o inicia sesion si ya tienes cuenta)\n2. Cotiza tu evento en la <a href="servicios.html">pagina de Servicios</a>\n3. Contactanos desde la <a href="contacto.html">pagina de Contacto</a> con los detalles de tu evento\n4. Confirmamos la disponibilidad y coordinamos los detalles\n\nTe recomendamos reservar con al menos 1-2 semanas de anticipacion para garantizar disponibilidad.'
            },
            // ESPECIFICACIONES TECNICAS
            {
                keywords: ['camara', 'calidad', 'resolucion', 'megapixeles', 'formato', 'jpg', 'png', 'jpeg', 'digital', 'video', 'grabar', 'luz', 'flash', 'fondo'],
                respuesta: 'ESPECIFICACIONES TECNICAS\n\n- Camaras profesionales (Canon, Sony, Nikon)\n- Iluminacion profesional integrada\n- Formato de imagen: Alta resolucion (digital)\n- Fondo personalizable\n- Las fotos se entregan en formato digital\n\nSi agregas impresiones (+$5.000), tambien obtienes copias fisicas durante el evento. La calidad de imagen es profesional, no es una camara de celular o selfie.'
            },
            // CANCELACION
            {
                keywords: ['cancelar', 'cancelacion', 'modificar', 'cambiar', 'cambio', 'devolver', 'reembolso', 'policy', 'politica', 'reglas', 'terminos', 'condiciones'],
                respuesta: 'POLITICA DE CAMBIOS Y CANCELACIONES\n\n- Para cambios o cancelaciones, contactanos con al menos 48 horas de anticipacion\n- Cancelaciones con menos de 48 horas pueden tener un cargo\n- Los cambios de fecha estan sujetos a disponibilidad\n\nPara consultas especificas sobre tu reserva, contactanos directamente por telefono o email.'
            },
            // ZONA DE COBERTURA
            {
                keywords: ['zona', 'cobertura', 'viajar', 'desplazamiento', 'transporte', 'traslado', 'region', 'comuna', 'santiago', 'providencia', 'condes', 'nunoa', 'vitacura'],
                respuesta: 'ZONA DE COBERTURA\n\n- Principalmente operamos en Santiago y alrededores\n- Estacion Central es nuestra base de operaciones\n- Para eventos en otras comunas, consulta disponibilidad\n\nEl costo de traslado puede variar segun la ubicacion de tu evento. Contactanos para confirmar si podemos cubrir tu zona.'
            },
            // CUENTA
            {
                keywords: ['cuenta', 'usuario', 'contrasena', 'password', 'login', 'sesion', 'iniciar', 'registrarse', 'registro', 'perfil', 'datos'],
                respuesta: 'TU CUENTA\n\n- Iniciar sesion: Usa tu usuario y contrasena en la pagina de login\n- Registrarse: Crea una cuenta con nombre, telefono, email, usuario y contrasena\n- Cerrar sesion: Haz clic en "Cerrar Sesion" en la parte superior\n\nSi olvidaste tu contrasena, contacta al administrador.'
            },
            // AUTO-AYUDA
            {
                keywords: ['ayuda', 'help', 'puedes', 'sabes', 'opciones', 'comandos', 'menu', 'preguntas', 'guia', 'tutorial'],
                respuesta: 'LO QUE PUEDO RESPONDER\n\nPreguntame sobre:\n\n- Precios y costos\n- Servicios y lo que incluyen\n- Impresiones\n- Horarios de atencion\n- Ubicacion y direccion\n- Informacion de contacto\n- Tipos de eventos que cubrimos\n- Nuestro equipo\n- Como cotizar y reservar\n- Especificaciones tecnicas\n- Politica de cancelaciones\n- Zona de cobertura\n- Tu cuenta de usuario\n\nSolo escribe tu pregunta y hare lo mejor por responderte.'
            }
        ];

        var chatAdminRespuestas = [
            // RESUMEN RESERVAS
            {
                keywords: ['resumen', 'reserva', 'reservas', 'cotizacion', 'cotizaciones', 'venta', 'ventas', 'quote'],
                respuesta: function() {
                    var reserva = localStorage.getItem('reservaActiva');
                    if (!reserva) return 'No hay reservas registradas actualmente. Las reservas se guardan cuando un usuario completa una cotizacion en la pagina de Servicios.';
                    var d = JSON.parse(reserva);
                    return 'RESUMEN DE RESERVAS\n\n- Servicio: ' + d.servicio + '\n- Tipo de Evento: ' + (d.tipoServicio || 'No especificado') + '\n- Horas: ' + d.horas + '\n- Impresiones ilimitadas: ' + (d.impresiones ? 'Si' : 'No') + '\n- Total: $' + d.total.toLocaleString('es-CL');
                }
            },
            // CONSULTAS
            {
                keywords: ['consulta', 'consultas', 'mensajes', 'clientes', 'contactos', 'inquiries', 'recibidos'],
                respuesta: function() {
                    var consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
                    if (consultas.length === 0) return 'No hay consultas registradas. Los usuarios envian consultas desde la pagina de Contacto.';
                    var respuesta = 'CONSULTAS DE CLIENTES (' + consultas.length + ' total)\n\n';
                    for (var i = 0; i < consultas.length; i++) {
                        var c = consultas[i];
                        respuesta += (i + 1) + '. ' + c.nombre + ' - ' + c.mensaje.substring(0, 40) + (c.mensaje.length > 40 ? '...' : '') + ' - ' + c.fecha + '\n';
                    }
                    respuesta += '\nSi necesitas ver mas detalles, visita la pagina de Contacto (panel admin).';
                    return respuesta;
                }
            },
            // USUARIOS
            {
                keywords: ['usuarios', 'registrados', 'cuentas', 'lista', 'miembros'],
                respuesta: function() {
                    var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                    if (usuarios.length === 0) return 'No hay usuarios registrados aparte de la cuenta admin.';
                    var respuesta = 'USUARIOS REGISTRADOS (' + usuarios.length + ' total)\n\n';
                    for (var i = 0; i < usuarios.length; i++) {
                        respuesta += (i + 1) + '. ' + usuarios[i].nombre + ' (' + usuarios[i].usuario + ')\n';
                    }
                    respuesta += '\nPara mas detalles, visita la pagina de Contacto (panel admin).';
                    return respuesta;
                }
            },
            // DASHBOARD
            {
                keywords: ['dashboard', 'estadistica', 'estadisticas', 'overview', 'general', 'completo', 'status', 'estado'],
                respuesta: function() {
                    var reserva = localStorage.getItem('reservaActiva');
                    var consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
                    var usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                    var respuesta = 'DASHBOARD ADMIN\n\n- Reservas: ' + (reserva ? '1 (Total: $' + JSON.parse(reserva).total.toLocaleString('es-CL') + ')' : '0') + '\n- Consultas: ' + consultas.length + '\n- Usuarios registrados: ' + usuarios.length;
                    return respuesta;
                }
            },
            // LIMPIAR
            {
                keywords: ['vaciar', 'limpiar', 'borrar', 'eliminar', 'clear', 'delete', 'reset'],
                respuesta: 'Para limpiar datos, usa los botones "Vaciar" en la pagina de Contacto (panel admin). Puedes vaciar reservas, consultas o usuarios por separado. No puedo eliminar datos directamente por seguridad.'
            },
            // INFO ADMIN
            {
                keywords: ['admin', 'administrador', 'panel', 'acceso', 'puedo', 'hacer'],
                respuesta: 'PANEL DE ADMINISTRADOR\n\nComo administrador tienes acceso a:\n\n- Ver todas las reservas y cotizaciones\n- Ver todas las consultas de clientes\n- Ver todos los usuarios registrados\n- Vaciar datos por categoria\n\nTodo esto esta disponible en la pagina de Contacto. Ademas, puedes preguntarme directamente: "resumen reservas", "ver consultas", "ver usuarios".'
            }
        ];

        var chatStopwords = [
            'de', 'la', 'el', 'un', 'una', 'los', 'las', 'que', 'en', 'por', 'para', 'con',
            'es', 'soy', 'hay', 'como', 'cual', 'quiero', 'necesito', 'puedo', 'me', 'tu',
            'usted', 'ustedes', 'nosotros', 'ellos', 'ella', 'el', 'ello', 'se', 'del', 'al',
            'lo', 'le', 'les', 'da', 'te', 'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'nos',
            'ya', 'tambien', 'mas', 'muy', 'si', 'no', 'pero', 'este', 'esta', 'ese', 'esa',
            'esto', 'eso', 'aquello', 'aqui', 'ahi', 'alla', 'all', 'aun', 'aun', 'aun',
            'sin', 'sobre', 'tras', 'ante', 'bajo', 'hacia', 'hasta', 'durante', 'mediante',
            'segun', 'contra', 'entre', 'ante', 'desde', 'donde', 'cuando', 'porque', 'pues',
            'que', 'cual', 'cuales', 'como', 'cuanto', 'cuantos', 'cuantas', 'otro', 'otra',
            'otros', 'otras', 'mismo', 'misma', 'mismos', 'mismas', 'todo', 'toda', 'todos',
            'todas', 'algo', 'nada', 'alguien', 'nadie', 'cada', 'cierto', 'cierta',
            'mi', 'mia', 'mio', 'mios', 'mias', 'nuestro', 'nuestra', 'nuestros', 'nuestras',
            'vuestro', 'vuestra', 'vuestros', 'vuestras', 'suyo', 'suya', 'suyos', 'suyas',
            'ser', 'estar', 'haber', 'tener', 'hacer', 'poder', 'querer', 'saber', 'decir',
            'ir', 'venir', 'dar', 'ver', 'poner', 'salir', 'llegar', 'pasar', 'seguir',
            'creer', 'hablar', 'llevar', 'dejar', 'sentir', 'tratar', 'mirar', 'contar',
            'empezar', 'esperar', 'buscar', 'existir', 'entrar', 'volver', 'tomar', 'conocer',
            'vivir', 'pensar', 'salir', 'caer', 'encontrar', 'llamar', 'venir', 'decir',
            'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'
        ];

        function normalizarChat(texto) {
            var t = texto.toLowerCase();
            t = t.replace(/[áà]/g, 'a').replace(/[éè]/g, 'e').replace(/[íì]/g, 'i');
            t = t.replace(/[óò]/g, 'o').replace(/[úù]/g, 'u');
            t = t.replace(/[^a-z0-9\s]/g, '');
            var palabras = t.split(/\s+/);
            var filtradas = [];
            for (var i = 0; i < palabras.length; i++) {
                var esStopword = false;
                for (var j = 0; j < chatStopwords.length; j++) {
                    if (palabras[i] === chatStopwords[j]) {
                        esStopword = true;
                        break;
                    }
                }
                if (!esStopword && palabras[i].length > 2) {
                    filtradas.push(palabras[i]);
                }
            }
            return filtradas.join(' ');
        }

        function matchPatronChat(textoNormalizado, diccionario) {
            var mejorMatch = null;
            var mejorPuntaje = 0;
            var palabrasInput = textoNormalizado.split(/\s+/).length;
            var umbral = palabrasInput <= 1 ? 1 : 2;
            for (var i = 0; i < diccionario.length; i++) {
                var patron = diccionario[i];
                var puntaje = 0;
                for (var j = 0; j < patron.keywords.length; j++) {
                    if (textoNormalizado.indexOf(patron.keywords[j]) !== -1) {
                        puntaje++;
                    }
                }
                if (puntaje >= umbral && puntaje > mejorPuntaje) {
                    mejorPuntaje = puntaje;
                    mejorMatch = patron;
                }
            }
            return mejorMatch;
        }

        function obtenerRespuestaChat(texto) {
            var norm = normalizarChat(texto);
            if (sesion && sesion.tipo === 'admin') {
                var adminMatch = matchPatronChat(norm, chatAdminRespuestas);
                if (adminMatch) {
                    if (typeof adminMatch.respuesta === 'function') {
                        return adminMatch.respuesta();
                    }
                    return adminMatch.respuesta;
                }
            }
            var generalMatch = matchPatronChat(norm, chatRespuestas);
            if (generalMatch) {
                return generalMatch.respuesta;
            }
            return 'No estoy seguro de entender tu pregunta. Puedo ayudarte con informacion sobre precios, servicios, horarios, ubicacion, contacto, eventos y mas. Intenta reformular tu pregunta o escribe "ayuda" para ver todo lo que puedo hacer.';
        }

        function limpiarNotificacionChat() {
            var consultasActuales = JSON.parse(localStorage.getItem('consultas') || '[]').length;
            var tieneCotizacion = localStorage.getItem('reservaActiva') ? 1 : 0;
            localStorage.setItem('chatUltimoVisto', JSON.stringify({
                consultas: consultasActuales,
                cotizaciones: tieneCotizacion
            }));
            actualizarBadgeChat();
        }

        function actualizarBadgeChat() {
            var badge = document.getElementById('chatBadge');
            if (!badge) return;
            if (!sesion || sesion.tipo !== 'admin') {
                badge.style.display = 'none';
                return;
            }
            var ultimoVisto = JSON.parse(localStorage.getItem('chatUltimoVisto') || '{"consultas":0,"cotizaciones":0}');
            var consultasActuales = JSON.parse(localStorage.getItem('consultas') || '[]').length;
            var tieneCotizacion = localStorage.getItem('reservaActiva') ? 1 : 0;
            var hayNuevos = consultasActuales > ultimoVisto.consultas || tieneCotizacion > ultimoVisto.cotizaciones;
            badge.style.display = hayNuevos ? 'block' : 'none';
        }

        function crearChatbot() {
            var chatBtn = document.createElement('button');
            chatBtn.className = 'chatBtn';
            chatBtn.id = 'chatBtn';
            chatBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
            document.body.appendChild(chatBtn);

            if (sesion && sesion.tipo === 'admin') {
                var badge = document.createElement('span');
                badge.className = 'chatBadge';
                badge.id = 'chatBadge';
                chatBtn.appendChild(badge);
                actualizarBadgeChat();
            }

            var chatVentana = document.createElement('div');
            chatVentana.className = 'chatVentana';
            chatVentana.id = 'chatVentana';
            chatVentana.innerHTML =
                '<div class="chatHeader">' +
                    '<span>PhotoBooth Asistente</span>' +
                    '<button class="chatCerrar" id="chatCerrar">&times;</button>' +
                '</div>' +
                '<div class="chatMensajes" id="chatMensajes"></div>' +
                '<div class="chatSugerencias" id="chatSugerencias"></div>' +
                '<div class="chatInput">' +
                    '<input type="text" id="chatInput" placeholder="Escribe tu pregunta..." autocomplete="off">' +
                    '<button id="chatEnviar">Enviar</button>' +
                '</div>';
            document.body.appendChild(chatVentana);
        }

        function agregarBurbujaChat(texto, tipo) {
            var mensajes = document.getElementById('chatMensajes');
            if (!mensajes) return;
            var burbuja = document.createElement('div');
            burbuja.className = 'chatBurbuja ' + tipo;
            burbuja.innerHTML = texto;
            mensajes.appendChild(burbuja);
            mensajes.scrollTop = mensajes.scrollHeight;
        }

        function renderizarSugerenciasChat() {
            var container = document.getElementById('chatSugerencias');
            if (!container) return;
            container.innerHTML = '';
            var sugerencias;
            if (sesion && sesion.tipo === 'admin') {
                sugerencias = ['Reservas', 'Consultas', 'Usuarios'];
            } else {
                sugerencias = ['Precios', 'Servicios', 'Horarios', 'Contacto'];
            }
            for (var i = 0; i < sugerencias.length; i++) {
                var btn = document.createElement('button');
                btn.className = 'chatSugerencia';
                btn.textContent = sugerencias[i];
                btn.setAttribute('data-pregunta', sugerencias[i]);
                container.appendChild(btn);
            }
        }

        function initChatbot() {
            var chatBtn = document.getElementById('chatBtn');
            var chatVentana = document.getElementById('chatVentana');
            var chatCerrar = document.getElementById('chatCerrar');
            var chatInput = document.getElementById('chatInput');
            var chatEnviar = document.getElementById('chatEnviar');
            var chatSugerencias = document.getElementById('chatSugerencias');

            var chatAbierto = false;

            chatBtn.addEventListener('click', function() {
                chatAbierto = !chatAbierto;
                if (chatAbierto) {
                    chatVentana.classList.add('chatAbierto');
                    chatInput.focus();

                    if (sesion && sesion.tipo === 'admin') {
                        var ultimoVisto = JSON.parse(localStorage.getItem('chatUltimoVisto') || '{"consultas":0,"cotizaciones":0}');
                        var consultasActuales = JSON.parse(localStorage.getItem('consultas') || '[]').length;
                        var tieneCotizacion = localStorage.getItem('reservaActiva') ? 1 : 0;
                        var consultasNuevas = Math.max(0, consultasActuales - ultimoVisto.consultas);
                        var cotizacionesNuevas = Math.max(0, tieneCotizacion - ultimoVisto.cotizaciones);

                        if (consultasNuevas > 0 || cotizacionesNuevas > 0) {
                            var partes = [];
                            if (consultasNuevas > 0) partes.push(consultasNuevas + ' nueva(s) consulta(s) de cliente(s)');
                            if (cotizacionesNuevas > 0) partes.push('una cotizacion pendiente');
                            setTimeout(function() {
                                agregarBurbujaChat('Tienes actualizaciones pendientes: ' + partes.join(' y ') + '.', 'bot');
                            }, 500);
                        }
                    }

                    limpiarNotificacionChat();
                } else {
                    chatVentana.classList.remove('chatAbierto');
                }
            });

            chatCerrar.addEventListener('click', function() {
                chatAbierto = false;
                chatVentana.classList.remove('chatAbierto');
            });

            function enviarMensaje() {
                var texto = chatInput.value.trim();
                if (texto === '') return;
                agregarBurbujaChat(texto, 'usuario');
                chatInput.value = '';
                setTimeout(function() {
                    var respuesta = obtenerRespuestaChat(texto);
                    agregarBurbujaChat(respuesta, 'bot');
                    actualizarBadgeChat();
                }, 400);
            }

            chatEnviar.addEventListener('click', enviarMensaje);
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') enviarMensaje();
            });

            chatSugerencias.addEventListener('click', function(e) {
                if (e.target.classList.contains('chatSugerencia')) {
                    var pregunta = e.target.getAttribute('data-pregunta');
                    chatInput.value = pregunta;
                    enviarMensaje();
                }
            });

            renderizarSugerenciasChat();
            agregarBurbujaChat('Hola! Soy el asistente de PhotoBooth. Puedo ayudarte con precios, servicios, horarios, ubicacion y mas. Como puedo ayudarte?', 'bot');
        }

        crearChatbot();
        initChatbot();
    }

});
