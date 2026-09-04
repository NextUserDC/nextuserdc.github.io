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

    var barraEstado = document.getElementById('barraEstado');
    if (barraEstado) {
        barraEstado.classList.add('barraEstado');
        var reservaActiva = localStorage.getItem('reservaActiva');

        if (reservaActiva) {
            var datos = JSON.parse(reservaActiva);
            barraEstado.innerHTML = 'Tienes una reserva activa: ' + datos.horas + ' hora(s) por <strong>$' + datos.total.toLocaleString('es-CL') + '</strong>';
            barraEstado.classList.add('barraEstadoActiva');
        }
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

            var costoBase = horasNum * 8000;
            var costoImpresiones = checkImpresiones.checked ? 5000 : 0;
            var total = costoBase + costoImpresiones;

            var reserva = {
                servicio: 'Cabina Fotográfica Tótem',
                horas: horasNum,
                impresiones: checkImpresiones.checked,
                total: total
            };
            localStorage.setItem('reservaActiva', JSON.stringify(reserva));

            resumenReserva.innerHTML =
                '<h3>Resumen de Reserva</h3>' +
                '<div class="resumenFila"><span>Servicio</span><span>Cabina Fotográfica Tótem</span></div>' +
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
                '<td>' + datos.horas + '</td>' +
                '<td>' + (datos.impresiones ? 'Sí' : 'No') + '</td>' +
                '<td>$' + datos.total.toLocaleString('es-CL') + '</td>';
            tablaCuerpo.appendChild(fila);
        } else {
            var filaVacia = document.createElement('tr');
            filaVacia.innerHTML = '<td colspan="4" style="text-align:center; color: var(--text-muted);">No hay reservas registradas</td>';
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

});
