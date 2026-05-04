import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "REDACTED_FIREBASE_API_KEY",
  authDomain: "ventas-6fc67.firebaseapp.com",
  databaseURL: "https://ventas-6fc67-default-rtdb.firebaseio.com",
  projectId: "ventas-6fc67",
  storageBucket: "ventas-6fc67.firebasestorage.app",
  messagingSenderId: "567945428451",
  appId: "1:567945428451:web:30ccacd405b9c39d58b4d6",
  measurementId: "G-PG686TLSVV"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'minimarket');
const auth = getAuth(app);

let editModeId = null;
let editProductModeId = null; // Para editar productos

let appData = {
    productos: [],
    ventas: [],
    encargados: []
};

// DOM Elements
const totalVentasCount = document.getElementById('total-ventas-count');
const totalIngresosMonetario = document.getElementById('total-ingresos-monetario');
const totalGastadoProductos = document.getElementById('total-gastado-productos');
const salesList = document.getElementById('sales-list');
const noSalesMsg = document.getElementById('no-sales-msg');
const filterBtns = document.querySelectorAll('.filter-btn');
const filterDateCustom = document.getElementById('filter-date-custom');
const topProductsList = document.getElementById('top-products');
const topDepartmentsList = document.getElementById('top-departments');
const buscarVentaDeptoInput = document.getElementById('buscar-venta-depto');

const formProducto = document.getElementById('form-producto');
const tituloFormProducto = document.querySelector('#productos .form-container h2');
const nombreProductoInput = document.getElementById('nombre-producto');
const precioCompraInput = document.getElementById('precio-compra');
const precioVentaInput = document.getElementById('precio-venta');
const productosRegistradosList = document.getElementById('productos-registrados-list');
const noProductsMsg = document.getElementById('no-products-msg');
const productosListaDatalist = document.getElementById('productos-lista');
const buscarProductoInput = document.getElementById('buscar-producto');

const formEncargado = document.getElementById('form-encargado');
const nombreEncargadoInput = document.getElementById('nombre-encargado');
const encargadosList = document.getElementById('encargados-list');
const noEncargadosMsg = document.getElementById('no-encargados-msg');
const encargadoEntregaSelect = document.getElementById('encargado-entrega');

const formVenta = document.getElementById('form-venta');
const fechaHoraInput = document.getElementById('fecha-hora');
const productosVentaContainer = document.getElementById('productos-venta-container');
const btnAddProductoVenta = document.getElementById('btn-add-producto');
const ventaTotalDisplay = document.getElementById('venta-total-display');

const formConfigEmail = document.getElementById('form-config-email');
const formConfigPassword = document.getElementById('form-config-password');

const btnExport = document.getElementById('btn-export');
const fileImport = document.getElementById('file-import');
const btnImportTrigger = document.getElementById('btn-import-trigger');

const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const btnLogout = document.getElementById('btn-logout');
const themeToggle = document.getElementById('theme-toggle');
const themeText = document.getElementById('theme-text');

const navLinks = document.querySelectorAll('.nav-links li');
const pageSections = document.querySelectorAll('.page-section');

let currentFilter = 'dia'; 

function init() {
    setupEventListeners();
    setCurrentDateTime();

    const savedTheme = localStorage.getItem('appTheme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeText.innerText = 'Modo Claro';
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authContainer.classList.add('d-none');
            mainApp.classList.remove('d-none');

            console.log("Sesión iniciada. Conectando a la base de datos...");
            onValue(dbRef, (snapshot) => {
                const data = snapshot.val();
                console.log("Snapshot recibido de Firebase:", data);
                if (data) {
                    appData.productos = Array.isArray(data.productos) ? data.productos : [];
                    appData.ventas = Array.isArray(data.ventas) ? data.ventas : [];
                    appData.encargados = Array.isArray(data.encargados) ? data.encargados : [];
                } else {
                    appData = { productos: [], ventas: [], encargados: [] };
                }
                updateUI();
            });
        } else {
            authContainer.classList.remove('d-none');
            mainApp.classList.add('d-none');
        }
    });
}

function saveData() {
    console.log("Guardando datos completos en Firebase:", appData);
    set(dbRef, appData)
        .then(() => console.log("Datos guardados correctamente"))
        .catch(err => console.error("Error crítico al guardar:", err));
}

function toFirebaseEmail(val) {
    if (val.includes('@')) return val;
    return `${val}@ventasapp.com`;
}

function setupEventListeners() {
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = toFirebaseEmail(authEmail.value);
        signInWithEmailAndPassword(auth, email, authPassword.value)
            .catch((err) => {
                console.error("Error login:", err);
                authError.innerText = "Usuario o contraseña incorrectos.";
                authError.classList.remove('d-none');
            });
    });

    btnLogout.addEventListener('click', () => signOut(auth));

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('appTheme', 'light');
            themeText.innerText = 'Modo Oscuro';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('appTheme', 'dark');
            themeText.innerText = 'Modo Claro';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const target = link.getAttribute('data-target');
            pageSections.forEach(s => s.classList.toggle('active', s.id === target));
            if(target === 'nueva-venta' && !editModeId) setCurrentDateTime();
        });
    });

    // Dashboard Filters
    buscarVentaDeptoInput.addEventListener('input', updateDashboard);
    filterDateCustom.addEventListener('change', () => {
        currentFilter = 'custom';
        filterBtns.forEach(b => b.classList.remove('active'));
        updateDashboard();
    });
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterDateCustom.value = '';
            currentFilter = btn.getAttribute('data-filter');
            updateDashboard();
        });
    });

    // CRUD Productos
    formProducto.addEventListener('submit', (e) => {
        e.preventDefault();
        const prod = {
            id: editProductModeId || Date.now().toString(),
            nombre: nombreProductoInput.value.trim(),
            precioCompra: parseFloat(precioCompraInput.value) || 0,
            precioVenta: parseFloat(precioVentaInput.value) || 0
        };

        if (editProductModeId) {
            const idx = appData.productos.findIndex(p => p.id === editProductModeId);
            if (idx !== -1) appData.productos[idx] = prod;
            editProductModeId = null;
            tituloFormProducto.innerText = "Registrar Producto";
            formProducto.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Añadir Producto';
        } else {
            appData.productos.push(prod);
        }

        saveData();
        formProducto.reset();
        updateProductosUI();
    });

    buscarProductoInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#productos-registrados-list li').forEach(li => {
            li.style.display = li.querySelector('.prod-info-name').textContent.toLowerCase().includes(term) ? 'flex' : 'none';
        });
    });

    // CRUD Encargados
    formEncargado.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = nombreEncargadoInput.value.trim();
        if (nombre) {
            appData.encargados.push({ id: Date.now().toString(), nombre: nombre });
            saveData();
            nombreEncargadoInput.value = '';
            updateEncargadosUI();
        }
    });

    // Sales Form Logic
    btnAddProductoVenta.addEventListener('click', () => {
        const div = document.createElement('div');
        div.className = 'producto-item';
        div.innerHTML = `
            <input type="text" class="producto-input" list="productos-lista" placeholder="Buscar producto...">
            <button type="button" class="btn-remove-producto"><i class="fas fa-trash"></i></button>
        `;
        productosVentaContainer.appendChild(div);
        div.querySelector('.btn-remove-producto').addEventListener('click', () => { div.remove(); calculateLiveTotal(); });
    });

    productosVentaContainer.addEventListener('input', calculateLiveTotal);

    formVenta.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = productosVentaContainer.querySelectorAll('.producto-input');
        const productosVendidos = [];
        let totalVenta = 0;
        let costoVenta = 0;

        inputs.forEach(input => {
            const val = input.value.trim();
            if(val) {
                productosVendidos.push(val);
                const p = appData.productos.find(x => x.nombre === val);
                if(p) {
                    totalVenta += p.precioVenta;
                    costoVenta += p.precioCompra;
                }
            }
        });

        if(productosVendidos.length === 0) return alert('Añade productos.');

        const venta = {
            id: editModeId || Date.now().toString(),
            fechaHora: fechaHoraInput.value,
            departamento: document.getElementById('departamento').value,
            metodoPago: document.getElementById('metodo-pago').value,
            encargado: encargadoEntregaSelect.value,
            productos: productosVendidos,
            comentario: document.getElementById('comentario-venta').value.trim(),
            totalVenta,
            costoVenta
        };

        if (editModeId) {
            const idx = appData.ventas.findIndex(v => v.id === editModeId);
            if (idx !== -1) appData.ventas[idx] = venta;
            editModeId = null;
            document.getElementById('titulo-nueva-venta').innerText = "Registrar Nueva Venta";
            document.getElementById('btn-cancel-edit').classList.add('d-none');
        } else {
            appData.ventas.push(venta);
        }
        
        saveData();
        formVenta.reset();
        setCurrentDateTime();
        resetProductosVenta();
        calculateLiveTotal();
        navLinks[0].click();
    });

    // Config Account
    formConfigEmail.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEmail = toFirebaseEmail(document.getElementById('new-email').value);
        updateEmail(auth.currentUser, newEmail).then(() => alert('Usuario actualizado.')).catch(err => alert(err.message));
    });

    formConfigPassword.addEventListener('submit', (e) => {
        e.preventDefault();
        const p1 = document.getElementById('new-password').value;
        const p2 = document.getElementById('confirm-password').value;
        if(p1 !== p2) return alert('Contraseñas no coinciden.');
        updatePassword(auth.currentUser, p1).then(() => alert('Contraseña actualizada.')).catch(err => alert(err.message));
    });

    // JSON DB
    btnExport.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
        const a = document.createElement('a');
        a.href = dataStr; a.download = `ventas_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    });

    btnImportTrigger.addEventListener('click', () => fileImport.click());
    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (parsed.productos && parsed.ventas) {
                    appData = parsed;
                    saveData();
                    updateUI();
                    alert('Importado.');
                }
            } catch(e) { alert('JSON inválido.'); }
        };
        reader.readAsText(file);
        fileImport.value = '';
    });
}

function calculateLiveTotal() {
    let total = 0;
    productosVentaContainer.querySelectorAll('.producto-input').forEach(input => {
        const p = appData.productos.find(x => x.nombre === input.value.trim());
        if(p) total += p.precioVenta;
    });
    ventaTotalDisplay.innerText = `$${total.toLocaleString()}`;
}

function updateUI() {
    updateProductosUI();
    updateEncargadosUI();
    updateDashboard();
}

function updateProductosUI() {
    productosRegistradosList.innerHTML = '';
    noProductsMsg.style.display = appData.productos.length === 0 ? 'block' : 'none';
    appData.productos.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column;">
                <span class="prod-info-name" style="font-weight: 600;">${escapeHTML(p.nombre)}</span>
                <small style="color: var(--text-light);">Costo: $${(p.precioCompra || 0).toLocaleString()} | Venta: $${(p.precioVenta || 0).toLocaleString()}</small>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-icon" style="color: var(--primary);" onclick="editarProducto('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="eliminarProducto('${p.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        productosRegistradosList.appendChild(li);
    });
    productosListaDatalist.innerHTML = appData.productos.map(p => `<option value="${p.nombre}">`).join('');
}

window.editarProducto = (id) => {
    const p = appData.productos.find(x => x.id === id);
    if (!p) return;
    editProductModeId = id;
    tituloFormProducto.innerText = "Editar Producto";
    nombreProductoInput.value = p.nombre;
    precioCompraInput.value = p.precioCompra || 0;
    precioVentaInput.value = p.precioVenta || 0;
    formProducto.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
    nombreProductoInput.focus();
};

function updateEncargadosUI() {
    encargadosList.innerHTML = '';
    noEncargadosMsg.style.display = appData.encargados.length === 0 ? 'block' : 'none';
    appData.encargados.forEach(e => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${escapeHTML(e.nombre)}</span>
                        <button class="btn-icon" onclick="eliminarEncargado('${e.id}')"><i class="fas fa-trash"></i></button>`;
        encargadosList.appendChild(li);
    });
    encargadoEntregaSelect.innerHTML = '<option value="" disabled selected>Seleccione un encargado</option>' + 
        appData.encargados.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('');
}

function updateDashboard() {
    const now = new Date();
    let filtered = appData.ventas.filter(v => {
        const fv = new Date(v.fechaHora);
        if (currentFilter === 'dia') return fv.toDateString() === now.toDateString();
        if (currentFilter === 'semana') return (now - fv) / 86400000 <= 7;
        if (currentFilter === 'mes') return fv.getMonth() === now.getMonth() && fv.getFullYear() === now.getFullYear();
        if (currentFilter === 'custom') return v.fechaHora.startsWith(filterDateCustom.value);
        return true;
    });

    const depto = buscarVentaDeptoInput.value.toLowerCase().trim();
    if(depto) filtered = filtered.filter(v => v.departamento.toLowerCase().includes(depto));

    totalVentasCount.innerText = filtered.length;
    const ingresos = filtered.reduce((acc, v) => acc + (v.totalVenta || 0), 0);
    const inversion = filtered.reduce((acc, v) => acc + (v.costoVenta || 0), 0);
    totalIngresosMonetario.innerText = `$${ingresos.toLocaleString()}`;
    totalGastadoProductos.innerText = `$${inversion.toLocaleString()}`;

    salesList.innerHTML = '';
    noSalesMsg.style.display = filtered.length === 0 ? 'block' : 'none';
    filtered.sort((a,b) => new Date(b.fechaHora) - new Date(a.fechaHora)).forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(v.fechaHora).toLocaleString([], {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}</td>
            <td>${escapeHTML(v.productos.join(', '))}${v.comentario ? `<br><small style="color:var(--primary)">${escapeHTML(v.comentario)}</small>` : ''}</td>
            <td><span class="badge">Depto. ${escapeHTML(v.departamento)}</span></td>
            <td>${escapeHTML(v.encargado || 'N/A')}</td>
            <td style="font-weight:600">$${(v.totalVenta || 0).toLocaleString()}</td>
            <td>
                <button class="btn-icon" style="color:var(--primary)" onclick="editarVenta('${v.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="eliminarVenta('${v.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        salesList.appendChild(tr);
    });

    // Top Stats
    const productCounts = {};
    const deptCounts = {};
    filtered.forEach(v => {
        v.productos.forEach(p => productCounts[p] = (productCounts[p] || 0) + 1);
        deptCounts[v.departamento] = (deptCounts[v.departamento] || 0) + 1;
    });

    renderStats(topProductsList, productCounts, 'vendidos');
    renderStats(topDepartmentsList, deptCounts, 'ventas', 'Depto.');
}

function renderStats(container, counts, label, prefix = '') {
    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
    container.innerHTML = sorted.length ? sorted.map(([name, count]) => `
        <div class="stats-item">
            <span class="stats-name">${prefix} ${escapeHTML(name)}</span>
            <span class="stats-count">${count} ${label}</span>
        </div>`).join('') : '<div class="empty-state">No hay datos</div>';
}

window.eliminarProducto = (id) => { if(confirm('¿Eliminar producto?')) { appData.productos = appData.productos.filter(p => p.id !== id); saveData(); } };
window.eliminarEncargado = (id) => { if(confirm('¿Eliminar encargado?')) { appData.encargados = appData.encargados.filter(e => e.id !== id); saveData(); } };
window.eliminarVenta = (id) => { if(confirm('¿Eliminar venta?')) { appData.ventas = appData.ventas.filter(v => v.id !== id); saveData(); } };

window.editarVenta = (id) => {
    const v = appData.ventas.find(x => x.id === id);
    if(!v) return;
    editModeId = id;
    document.getElementById('titulo-nueva-venta').innerText = "Editar Venta";
    document.getElementById('btn-cancel-edit').classList.remove('d-none');
    fechaHoraInput.value = v.fechaHora;
    document.getElementById('departamento').value = v.departamento;
    document.getElementById('metodo-pago').value = v.metodoPago;
    encargadoEntregaSelect.value = v.encargado || '';
    document.getElementById('comentario-venta').value = v.comentario || '';
    productosVentaContainer.innerHTML = v.productos.map(p => `
        <div class="producto-item">
            <input type="text" class="producto-input" list="productos-lista" value="${p}">
            <button type="button" class="btn-remove-producto"><i class="fas fa-trash"></i></button>
        </div>`).join('');
    productosVentaContainer.querySelectorAll('.btn-remove-producto').forEach(b => b.addEventListener('click', () => { b.parentElement.remove(); calculateLiveTotal(); }));
    calculateLiveTotal();
    document.getElementById('nav-nueva-venta').click();
};

document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    editModeId = null;
    document.getElementById('titulo-nueva-venta').innerText = "Registrar Nueva Venta";
    document.getElementById('btn-cancel-edit').classList.add('d-none');
    formVenta.reset(); setCurrentDateTime(); resetProductosVenta(); calculateLiveTotal();
});

function resetProductosVenta() {
    productosVentaContainer.innerHTML = '<div class="producto-item"><input type="text" class="producto-input" list="productos-lista" placeholder="Buscar producto..." required><button type="button" class="btn-remove-producto" disabled><i class="fas fa-trash"></i></button></div>';
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t));
}

function setCurrentDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    fechaHoraInput.value = now.toISOString().slice(0, 16);
}

init();
