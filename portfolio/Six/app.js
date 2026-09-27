
(function () {
    'use strict';

    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

    const PBKDF2_ITERATIONS = 100000;

    async function deriveKey(password, saltB64) {
        const enc = new TextEncoder();
        const passwordKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
        const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
    }

    async function decryptData(encObj, key) {
        const ct = Uint8Array.from(atob(encObj.ct), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(encObj.iv), c => c.charCodeAt(0));
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    }

    async function decryptContent(password) {
        if (!window._encryptedData) return;
        const data = window._encryptedData;

        const textPromises = Object.entries(data.texts).map(async ([id, enc]) => {
            try {
                const key = await deriveKey(password, enc.salt);
                const buf = await decryptData(enc, key);
                const text = new TextDecoder().decode(buf);
                const el = document.querySelector(`[data-text="${id}"]`);
                if (el) el.textContent = text;
            } catch (e) {
                console.error(`Error descifrando texto "${id}":`, e);
            }
        });

        const imgPromises = Object.entries(data.images).map(async ([filename, enc]) => {
            try {
                const key = await deriveKey(password, enc.salt);
                const buf = await decryptData(enc, key);
                const blob = new Blob([buf], { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);
                const el = document.querySelector(`[data-img="${filename}"]`);
                if (el) el.src = url;
            } catch (e) {
                console.error(`Error descifrando imagen "${filename}":`, e);
            }
        });

        await Promise.all([...textPromises, ...imgPromises]);
    }

    const pantallaLogin = $('#pantalla-login');
    const contenidoPrincipal = $('#contenido-principal');
    const passwordInput = $('#password-input');
    const btnAcceder = $('#btn-acceder');
    const passwordError = $('#password-error');

    const desbloquearPagina = () => {
        pantallaLogin.classList.add('desvanecer');
        setTimeout(() => {
            pantallaLogin.style.display = 'none';
            contenidoPrincipal.classList.remove('oculto');
            contenidoPrincipal.classList.add('aparicion-activa');
            iniciarObservadores();
        }, 600);
    };

    const verificarPassword = async () => {
        const password = passwordInput.value;
        if (!password) return;

        btnAcceder.disabled = true;
        const originalHTML = btnAcceder.innerHTML;
        btnAcceder.innerHTML = '<svg class="spinner" viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg>';

        try {
            const res = await fetch('https://api.nextuser.lat/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service: 'six', password }),
            });
            const data = await res.json();
            if (data.code === 0 && data.data?.valid) {
                passwordError.classList.add('oculto');
                await decryptContent(password);
                desbloquearPagina();
            } else {
                passwordError.classList.remove('oculto');
                passwordInput.value = '';
                passwordInput.focus();
                btnAcceder.disabled = false;
                btnAcceder.innerHTML = originalHTML;
            }
        } catch {
            passwordError.classList.remove('oculto');
            passwordInput.value = '';
            passwordInput.focus();
            btnAcceder.disabled = false;
            btnAcceder.innerHTML = originalHTML;
        }
    };

    btnAcceder.addEventListener('click', verificarPassword);
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') verificarPassword();
    });

    function iniciarObservadores() {
        const secciones = $$('.seccion');

        const revealObserver = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add(entrada.target.classList.contains('seccion') ? 'activo' : 'visible');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

        secciones.forEach(el => revealObserver.observe(el));
        $$('.vineta, .timeline-evento, .scrapbook-foto').forEach(el => revealObserver.observe(el));
    }

    const modales = {};
    ['trivia', 'personaje', 'wordle', 'memoria', 'lluvia'].forEach(juego => {
        modales[juego] = $(`#modal-${juego}`);
    });

    function cerrarModal(juego) {
        if (modales[juego]) {
            modales[juego].classList.add('oculto');
            document.body.style.overflow = '';
            if (juego === 'lluvia' && typeof window.detenerLluvia === 'function') {
                window.detenerLluvia();
            }
        }
    }

    function cerrarTodosModales() {
        Object.keys(modales).forEach(cerrarModal);
    }

    $$('.maquina-arcade').forEach(maquina => {
        maquina.addEventListener('click', () => {
            const juego = maquina.getAttribute('data-juego');
            if (modales[juego]) {
                modales[juego].classList.remove('oculto');
                document.body.style.overflow = 'hidden';
                if (typeof window.iniciarJuego === 'function') {
                    window.iniciarJuego(juego);
                }
            }
        });
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-cerrar-modal');
        if (btn) {
            cerrarModal(btn.getAttribute('data-cerrar'));
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarTodosModales();
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-juego') && !e.target.classList.contains('oculto')) {
            e.target.classList.add('oculto');
            document.body.style.overflow = '';
        }
    });

    const btnTorre = $('#lluvia-torre');
    const homerEasterEgg = $('#lluvia-homer');
    if (btnTorre && homerEasterEgg) {
        btnTorre.addEventListener('click', () => {
            homerEasterEgg.classList.remove('oculto');
            setTimeout(() => homerEasterEgg.classList.add('oculto'), 2500);
        });
    }

})();
