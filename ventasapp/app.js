import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX35b9tyOCPQNmAqNydWGvwolKKDx7v8c",
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
let editProductModeId = null;

let appData = {
    productos: [],
    ventas: [],
    encargados: [],
    personasCredito: []
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

// Credits Elements
const formPersonaCredito = document.getElementById('form-persona-credito');
const nombreCreditoInput = document.getElementById('nombre-credito');
const limiteCreditoInput = document.getElementById('limite-credito');
const creditosList = document.getElementById('creditos-list');
const noCreditosMsg = document.getElementById('no-creditos-msg');
const ventasPendientesList = document.getElementById('ventas-pendientes-list');
const metodoPagoSelect = document.getElementById('metodo-pago');
const grupoPersonaCredito = document.getElementById('grupo-persona-credito');
const personaCreditoSelect = document.getElementById('persona-credito-select');

const formVenta = document.getElementById('form-venta');
const fechaHoraInput = document.getElementById('fecha-hora');
const productosVentaContainer = document.getElementById('productos-venta-container');
const btnAddProductoVenta = document.getElementById('btn-add-producto');
const ventaTotalDisplay = document.getElementById('venta-total-display');

const formConfigEmail = document.getElementById('form-config-email');
const formConfigPassword = document.getElementById('form-config-password');

const btnExport = document.getElementById('btn-export');
const exportType = document.getElementById('export-type');
const exportDateSingleGroup = document.getElementById('export-date-single-group');
const exportDateRangeGroup = document.getElementById('export-date-range-group');
const exportDateSingle = document.getElementById('export-date-single');
const exportDateStart = document.getElementById('export-date-start');
const exportDateEnd = document.getElementById('export-date-end');

const fileImport = document.getElementById('file-import');
const btnImportTrigger = document.getElementById('btn-import-trigger');

const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');

const btnLogoutConfig = document.getElementById('btn-logout-config');
const themeToggleConfig = document.getElementById('theme-toggle-config');
const themeTextConfig = document.getElementById('theme-text-config');

const navLinks = document.querySelectorAll('.nav-links li');
const pageSections = document.querySelectorAll('.page-section');

let currentFilter = 'dia'; 

function init() {
    setupEventListeners();
    setCurrentDateTime();

    const savedTheme = localStorage.getItem('appTheme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeTextConfig) themeTextConfig.innerText = 'Modo Claro';
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authContainer.classList.add('d-none');
            mainApp.classList.remove('d-none');

            onValue(dbRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    appData.productos = firebaseToArray(data.productos);
                    appData.ventas = firebaseToArray(data.ventas);
                    appData.encargados = firebaseToArray(data.encargados);
                    appData.personasCredito = firebaseToArray(data.personasCredito);
                } else {
                    appData = { productos: [], ventas: [], encargados: [], personasCredito: [] };
                }
                updateUI();
            });
        } else {
            authContainer.classList.remove('d-none');
            mainApp.classList.add('d-none');
        }
    });
}

function firebaseToArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.values(data);
}

function saveData() {
    set(dbRef, appData)
        .then(() => console.log("Sincronizado"))
        .catch(err => console.error("Error al guardar:", err));
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
            .catch(() => {
                authError.innerText = "Usuario o contraseña incorrectos.";
                authError.classList.remove('d-none');
            });
    });

    btnLogoutConfig.addEventListener('click', () => signOut(auth));

    themeToggleConfig.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('appTheme', 'light');
            themeTextConfig.innerText = 'Modo Oscuro';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('appTheme', 'dark');
            themeTextConfig.innerText = 'Modo Claro';
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
            const nameEl = li.querySelector('.prod-info-name');
            if (nameEl) {
                li.style.display = nameEl.textContent.toLowerCase().includes(term) ? 'flex' : 'none';
            }
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

    // CRUD Personas a Crédito
    formPersonaCredito.addEventListener('submit', (e) => {
        e.preventDefault();
        const persona = {
            id: Date.now().toString(),
            nombre: nombreCreditoInput.value.trim(),
            limite: parseFloat(limiteCreditoInput.value) || 0
        };
        appData.personasCredito.push(persona);
        saveData();
        formPersonaCredito.reset();
        updateCreditosUI();
    });

    // Sales Form Logic
    btnAddProductoVenta.addEventListener('click', () => {
        const div = document.createElement('div');
        div.className = 'producto-item';
        div.innerHTML = `
            <input type="text" class="producto-input" list="productos-lista" placeholder="Producto..." required>
            <input type="number" class="precio-override-input" placeholder="Precio" required min="0">
            <button type="button" class="btn-remove-producto"><i class="fas fa-trash"></i></button>
        `;
        productosVentaContainer.appendChild(div);
        
        const prodInput = div.querySelector('.producto-input');
        const priceInput = div.querySelector('.precio-override-input');
        
        prodInput.addEventListener('input', () => {
            const p = appData.productos.find(x => x.nombre === prodInput.value.trim());
            if (p) {
                priceInput.value = p.precioVenta;
                calculateLiveTotal();
            }
        });

        priceInput.addEventListener('input', calculateLiveTotal);

        div.querySelector('.btn-remove-producto').addEventListener('click', () => { 
            div.remove(); 
            calculateLiveTotal(); 
        });
    });

    productosVentaContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('producto-input')) {
            const p = appData.productos.find(x => x.nombre === e.target.value.trim());
            if (p) {
                const priceInput = e.target.parentElement.querySelector('.precio-override-input');
                if (priceInput) priceInput.value = p.precioVenta;
            }
        }
        calculateLiveTotal();
    });

    metodoPagoSelect.addEventListener('change', () => {
        grupoPersonaCredito.classList.toggle('d-none', metodoPagoSelect.value !== 'Crédito');
        if (metodoPagoSelect.value === 'Crédito') {
            personaCreditoSelect.required = true;
        } else {
            personaCreditoSelect.required = false;
        }
    });

    formVenta.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            const items = productosVentaContainer.querySelectorAll('.producto-item');
            const productosVendidos = [];
            let totalVenta = 0;
            let costoVentaTotal = 0;

            items.forEach(item => {
                const nombre = item.querySelector('.producto-input').value.trim();
                const precio = parseFloat(item.querySelector('.precio-override-input').value) || 0;
                
                if(nombre) {
                    productosVendidos.push({ nombre, precio });
                    totalVenta += precio;
                    
                    const p = appData.productos.find(x => x.nombre === nombre);
                    if(p) costoVentaTotal += p.precioCompra;
                }
            });

            if(productosVendidos.length === 0) {
                alert('Añade al menos un producto.');
                return;
            }

            const metodo = metodoPagoSelect.value;
            const personaCreditoId = metodo === 'Crédito' ? personaCreditoSelect.value : null;

            // Validar límite de crédito
            if (metodo === 'Crédito') {
                const pc = appData.personasCredito.find(x => x.id === personaCreditoId);
                if (pc) {
                    const usado = appData.ventas
                        .filter(v => v.personaCreditoId === pc.id && v.estadoPago === 'Pendiente')
                        .reduce((acc, v) => acc + v.totalVenta, 0);
                    if (usado + totalVenta > pc.limite) {
                        return alert(`Límite de crédito excedido para ${pc.nombre}. (Límite: $${pc.limite}, Usado: $${usado})`);
                    }
                }
            }

            const venta = {
                id: editModeId || Date.now().toString(),
                fechaHora: fechaHoraInput.value,
                departamento: document.getElementById('departamento').value,
                metodoPago: metodo,
                personaCreditoId,
                estadoPago: metodo === 'Crédito' ? 'Pendiente' : 'Pagado',
                encargado: encargadoEntregaSelect.value,
                productos: productosVendidos,
                comentario: document.getElementById('comentario-venta').value.trim(),
                totalVenta,
                costoVenta: costoVentaTotal
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
            grupoPersonaCredito.classList.add('d-none');
            navLinks[0].click();
        } catch (err) {
            console.error("Error al registrar venta:", err);
            alert("Ocurrió un error al procesar la venta.");
        }
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

    // Enhanced JSON Export
    if (exportType) {
        exportType.addEventListener('change', () => {
            exportDateSingleGroup.classList.toggle('d-none', exportType.value !== 'dia');
            exportDateRangeGroup.classList.toggle('d-none', exportType.value !== 'rango');
        });
    }

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            let filteredVentas = appData.ventas;
            const type = exportType.value;

            if (type === 'dia') {
                const date = exportDateSingle.value;
                if (!date) return alert('Selecciona una fecha.');
                filteredVentas = appData.ventas.filter(v => v.fechaHora.startsWith(date));
            } else if (type === 'rango') {
                const start = exportDateStart.value;
                const end = exportDateEnd.value;
                if (!start || !end) return alert('Selecciona el rango completo.');
                filteredVentas = appData.ventas.filter(v => {
                    const vd = v.fechaHora.split('T')[0];
                    return vd >= start && vd <= end;
                });
            }

            const dataToExport = {
                productos: appData.productos,
                ventas: filteredVentas,
                encargados: appData.encargados,
                personasCredito: appData.personasCredito,
                exportDate: new Date().toISOString(),
                filterUsed: type
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
            const a = document.createElement('a');
            a.href = dataStr; 
            a.download = `ventas_${type}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        });
    }

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
    productosVentaContainer.querySelectorAll('.precio-override-input').forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    ventaTotalDisplay.innerText = `$${total.toLocaleString()}`;
}

function updateUI() {
    updateProductosUI();
    updateEncargadosUI();
    updateCreditosUI();
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
    navLinks[2].click();
};

function updateEncargadosUI() {
    encargadosList.innerHTML = '';
    noEncargadosMsg.style.display = appData.encargados.length === 0 ? 'block' : 'none';
    
    const entregaCounts = {};
    if (Array.isArray(appData.ventas)) {
        appData.ventas.forEach(v => {
            if (v.encargado) {
                entregaCounts[v.encargado] = (entregaCounts[v.encargado] || 0) + 1;
            }
        });
    }

    appData.encargados.forEach(e => {
        const count = entregaCounts[e.nombre] || 0;
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column;">
                <span style="font-weight: 600;">${escapeHTML(e.nombre)}</span>
                <small style="color: var(--primary); font-weight: 500;">${count} entregas realizadas</small>
            </div>
            <button class="btn-icon" onclick="eliminarEncargado('${e.id}')"><i class="fas fa-trash"></i></button>
        `;
        encargadosList.appendChild(li);
    });
    
    encargadoEntregaSelect.innerHTML = '<option value="" disabled selected>Seleccione un encargado</option>' + 
        appData.encargados.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('');
}

function updateCreditosUI() {
    creditosList.innerHTML = '';
    noCreditosMsg.style.display = appData.personasCredito.length === 0 ? 'block' : 'none';
    
    // Selectores de la app
    personaCreditoSelect.innerHTML = '<option value="" disabled selected>Seleccione una persona</option>' + 
        appData.personasCredito.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

    appData.personasCredito.forEach(p => {
        const pendiente = appData.ventas
            .filter(v => v.personaCreditoId === p.id && v.estadoPago === 'Pendiente')
            .reduce((acc, v) => acc + (v.totalVenta || 0), 0);
        
        const disponible = p.limite - pendiente;
        const li = document.createElement('li');
        li.style.flexDirection = 'column';
        li.style.alignItems = 'flex-start';
        li.style.gap = '5px';
        li.innerHTML = `
            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">${escapeHTML(p.nombre)}</span>
                <button class="btn-icon" onclick="eliminarPersonaCredito('${p.id}')"><i class="fas fa-trash"></i></button>
            </div>
            <div style="width: 100%; display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-light);">
                <span>Usado: <strong style="color:var(--danger)">$${pendiente.toLocaleString()}</strong></span>
                <span>Límite: <strong>$${p.limite.toLocaleString()}</strong></span>
            </div>
            <div style="width: 100%; background: #eee; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 5px;">
                <div style="background: var(--primary); height: 100%; width: ${Math.min((pendiente/p.limite)*100, 100)}%;"></div>
            </div>
            <small style="color: var(--success); font-weight: 500;">Disponible: $${disponible.toLocaleString()}</small>
        `;
        creditosList.appendChild(li);
    });

    updateVentasPendientesUI();
}

function updateVentasPendientesUI() {
    ventasPendientesList.innerHTML = '';
    const pendientes = appData.ventas.filter(v => v.metodoPago === 'Crédito' && v.estadoPago === 'Pendiente');
    
    pendientes.sort((a,b) => new Date(b.fechaHora) - new Date(a.fechaHora)).forEach(v => {
        const pc = appData.personasCredito.find(p => p.id === v.personaCreditoId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(v.fechaHora).toLocaleDateString()}</td>
            <td>${escapeHTML(pc ? pc.nombre : 'Desconocido')}</td>
            <td><span class="badge">Depto. ${escapeHTML(v.departamento)}</span></td>
            <td style="font-weight:600">$${v.totalVenta.toLocaleString()}</td>
            <td>
                <button class="btn-icon" style="color: var(--success);" onclick="liquidarCredito('${v.id}')" title="Marcar como Pagado"><i class="fas fa-check-circle"></i> Liquidar</button>
            </td>
        `;
        ventasPendientesList.appendChild(tr);
    });
}

window.liquidarCredito = (id) => {
    if (confirm('¿Marcar esta venta como PAGADA? Se liberará el crédito de la persona.')) {
        const idx = appData.ventas.findIndex(v => v.id === id);
        if (idx !== -1) {
            appData.ventas[idx].estadoPago = 'Pagado';
            saveData();
            updateUI();
        }
    }
};

window.eliminarPersonaCredito = (id) => {
    if (confirm('¿Eliminar esta persona? Sus deudas activas podrían quedar huérfanas.')) {
        appData.personasCredito = appData.personasCredito.filter(p => p.id !== id);
        saveData();
        updateUI();
    }
};

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
        
        const displayProds = v.productos.map(p => {
            if (typeof p === 'string') return p;
            return `${p.nombre} ($${p.precio.toLocaleString()})`;
        }).join(', ');

        const statusLabel = v.metodoPago === 'Crédito' ? 
            `<br><small style="color:${v.estadoPago === 'Pendiente' ? 'var(--danger)' : 'var(--success)'}">${v.estadoPago}</small>` : '';

        tr.innerHTML = `
            <td>${new Date(v.fechaHora).toLocaleString([], {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}</td>
            <td>${escapeHTML(displayProds)}${v.comentario ? `<br><small style="color:var(--primary)">${escapeHTML(v.comentario)}</small>` : ''}</td>
            <td><span class="badge">Depto. ${escapeHTML(v.departamento)}</span></td>
            <td>${escapeHTML(v.encargado || 'N/A')}${statusLabel}</td>
            <td style="font-weight:600">$${(v.totalVenta || 0).toLocaleString()}</td>
            <td>
                <button class="btn-icon" style="color: var(--primary);" onclick="editarVenta('${v.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" onclick="eliminarVenta('${v.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        salesList.appendChild(tr);
    });

    const productCounts = {};
    const deptCounts = {};
    filtered.forEach(v => {
        v.productos.forEach(p => {
            const name = typeof p === 'string' ? p : p.nombre;
            productCounts[name] = (productCounts[name] || 0) + 1;
        });
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
    metodoPagoSelect.value = v.metodoPago;
    
    grupoPersonaCredito.classList.toggle('d-none', v.metodoPago !== 'Crédito');
    if (v.metodoPago === 'Crédito') {
        personaCreditoSelect.value = v.personaCreditoId || '';
    }

    encargadoEntregaSelect.value = v.encargado || '';
    document.getElementById('comentario-venta').value = v.comentario || '';
    
    productosVentaContainer.innerHTML = v.productos.map(p => {
        const name = typeof p === 'string' ? p : p.nombre;
        const price = typeof p === 'string' ? 0 : p.precio;
        return `
            <div class="producto-item">
                <input type="text" class="producto-input" list="productos-lista" value="${name}">
                <input type="number" class="precio-override-input" value="${price}">
                <button type="button" class="btn-remove-producto"><i class="fas fa-trash"></i></button>
            </div>`;
    }).join('');
    
    productosVentaContainer.querySelectorAll('.btn-remove-producto').forEach(b => b.addEventListener('click', () => { b.parentElement.remove(); calculateLiveTotal(); }));
    calculateLiveTotal();
    document.getElementById('nav-nueva-venta').click();
};

document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    editModeId = null;
    document.getElementById('titulo-nueva-venta').innerText = "Registrar Nueva Venta";
    document.getElementById('btn-cancel-edit').classList.add('d-none');
    formVenta.reset(); 
    setCurrentDateTime(); 
    resetProductosVenta(); 
    calculateLiveTotal();
    grupoPersonaCredito.classList.add('d-none');
});

function resetProductosVenta() {
    productosVentaContainer.innerHTML = `
        <div class="producto-item">
            <input type="text" class="producto-input" list="productos-lista" placeholder="Producto..." required>
            <input type="number" class="precio-override-input" placeholder="Precio" required min="0">
            <button type="button" class="btn-remove-producto" disabled><i class="fas fa-trash"></i></button>
        </div>`;
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
