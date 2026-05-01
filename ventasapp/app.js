import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
let appData = {
    productos: [],
    ventas: []
};

const navLinks = document.querySelectorAll('.nav-links li');
const pageSections = document.querySelectorAll('.page-section');

const totalVentasCount = document.getElementById('total-ventas-count');
const salesList = document.getElementById('sales-list');
const noSalesMsg = document.getElementById('no-sales-msg');
const filterBtns = document.querySelectorAll('.filter-btn');

const formProducto = document.getElementById('form-producto');
const nombreProductoInput = document.getElementById('nombre-producto');
const productosRegistradosList = document.getElementById('productos-registrados-list');
const noProductsMsg = document.getElementById('no-products-msg');
const productosListaDatalist = document.getElementById('productos-lista');
const buscarProductoInput = document.getElementById('buscar-producto');

const formVenta = document.getElementById('form-venta');
const fechaHoraInput = document.getElementById('fecha-hora');
const productosVentaContainer = document.getElementById('productos-venta-container');
const btnAddProductoVenta = document.getElementById('btn-add-producto');
const metodoPagoSelect = document.getElementById('metodo-pago');

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

            onValue(dbRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    appData.productos = data.productos || [];
                    appData.ventas = data.ventas || [];
                } else {
                    appData = { productos: [], ventas: [] };
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
    set(dbRef, appData)
        .catch(err => console.error("Error al guardar en Firebase:", err));
}

function setupEventListeners() {
    
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authEmail.value;
        const pwd = authPassword.value;
        
        signInWithEmailAndPassword(auth, email, pwd)
            .catch((error) => {
                authError.innerText = "Credenciales incorrectas o usuario no encontrado.";
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
            pageSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === target) {
                    section.classList.add('active');
                }
            });
            
            if(target === 'nueva-venta') {
                setCurrentDateTime();
            }
        });
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            updateDashboard();
        });
    });

    formProducto.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = nombreProductoInput.value.trim();
        if (nombre) {
            appData.productos.push({
                id: Date.now().toString(),
                nombre: nombre
            });
            saveData();
            nombreProductoInput.value = '';
            updateProductosUI();

            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Añadido';
            btn.style.background = 'var(--success)';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 1500);
        }
    });

    buscarProductoInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = productosRegistradosList.querySelectorAll('li');
        items.forEach(li => {
            const text = li.querySelector('span').textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                li.style.display = 'flex';
            } else {
                li.style.display = 'none';
            }
        });
    });

    btnAddProductoVenta.addEventListener('click', () => {
        const productDiv = document.createElement('div');
        productDiv.className = 'producto-item';
        productDiv.innerHTML = `
            <input type="text" class="producto-input" list="productos-lista" placeholder="Buscar o escribir producto...">
            <button type="button" class="btn-remove-producto" disabled><i class="fas fa-trash"></i></button>
        `;
        productosVentaContainer.appendChild(productDiv);

        productDiv.querySelector('.btn-remove-producto').addEventListener('click', function() {
            productDiv.remove();
            checkRemoveButtons();
        });
        
        checkRemoveButtons();
    });

    document.querySelectorAll('.btn-remove-producto').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
            checkRemoveButtons();
        });
    });

    productosVentaContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('producto-input')) {
            checkRemoveButtons();
        }
    });

    formVenta.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputs = productosVentaContainer.querySelectorAll('.producto-input');
        const productosVendidos = [];
        inputs.forEach(input => {
            if(input.value.trim() !== '') {
                productosVendidos.push(input.value.trim());
            }
        });

        if(productosVendidos.length === 0) {
            alert('Añade al menos un producto a la venta.');
            return;
        }

        const metodo = document.getElementById('metodo-pago').value;
        const comentario = document.getElementById('comentario-venta').value.trim();
        const nuevaVenta = {
            id: editModeId || Date.now().toString(),
            fechaHora: document.getElementById('fecha-hora').value,
            departamento: document.getElementById('departamento').value,
            metodoPago: metodo,
            productos: productosVendidos
        };
        
        if (comentario !== '') {
            nuevaVenta.comentario = comentario;
        }

        if (editModeId) {
            const index = appData.ventas.findIndex(v => v.id === editModeId);
            if (index !== -1) appData.ventas[index] = nuevaVenta;
            editModeId = null;
            document.getElementById('titulo-nueva-venta').innerText = "Registrar Nueva Venta";
            document.getElementById('btn-cancel-edit').classList.add('d-none');
        } else {
            appData.ventas.push(nuevaVenta);
        }
        
        saveData();

        formVenta.reset();
        setCurrentDateTime();

        productosVentaContainer.innerHTML = `
            <div class="producto-item">
                <input type="text" class="producto-input" list="productos-lista" placeholder="Buscar o escribir producto..." required>
                <button type="button" class="btn-remove-producto" disabled><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        productosVentaContainer.querySelector('.btn-remove-producto').addEventListener('click', function() {
            this.parentElement.remove();
            checkRemoveButtons();
        });

        alert('Venta guardada con éxito.');

        navLinks[0].click();
        updateDashboard();
    });

    btnExport.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `ventas_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    btnImportTrigger.addEventListener('click', () => {
        fileImport.click();
    });

    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (parsed.productos !== undefined && parsed.ventas !== undefined) {
                        appData = parsed;
                        saveData();
                        updateUI();
                        alert('Datos importados correctamente.');
                    } else {
                        alert('El archivo JSON no tiene el formato correcto.');
                    }
                } catch(e) {
                    alert('Error al leer el archivo JSON.');
                }
            };
            reader.readAsText(file);
        }
        
        fileImport.value = '';
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function setCurrentDateTime() {
    const now = new Date();
    
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    fechaHoraInput.value = now.toISOString().slice(0, 16);
}

function checkRemoveButtons() {
    const items = productosVentaContainer.querySelectorAll('.producto-item');
    items.forEach(item => {
        const btn = item.querySelector('.btn-remove-producto');
        const input = item.querySelector('.producto-input');
        if (items.length <= 1 || input.value.trim() === '') {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });
}

function updateUI() {
    updateProductosUI();
    updateDashboard();
}

function updateProductosUI() {
    
    productosRegistradosList.innerHTML = '';
    if (appData.productos.length === 0) {
        productosRegistradosList.style.display = 'none';
        noProductsMsg.style.display = 'block';
    } else {
        productosRegistradosList.style.display = 'block';
        noProductsMsg.style.display = 'none';
        
        appData.productos.forEach(prod => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${escapeHTML(prod.nombre)}</span>
                <button class="btn-icon" onclick="eliminarProducto('${prod.id}')"><i class="fas fa-trash"></i></button>
            `;
            productosRegistradosList.appendChild(li);
        });
    }

    productosListaDatalist.innerHTML = '';
    appData.productos.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.nombre;
        productosListaDatalist.appendChild(option);
    });
}

function updateDashboard() {
    const now = new Date();

    const ventasFiltradas = appData.ventas.filter(venta => {
        const fechaVenta = new Date(venta.fechaHora);
        
        if (currentFilter === 'dia') {
            return fechaVenta.getDate() === now.getDate() &&
                   fechaVenta.getMonth() === now.getMonth() &&
                   fechaVenta.getFullYear() === now.getFullYear();
        } 
        else if (currentFilter === 'semana') {
            const unDiaMs = 24 * 60 * 60 * 1000;
            const diffDias = Math.round(Math.abs((now - fechaVenta) / unDiaMs));
            return diffDias <= 7;
        }
        else if (currentFilter === 'mes') {
            return fechaVenta.getMonth() === now.getMonth() &&
                   fechaVenta.getFullYear() === now.getFullYear();
        }
        
        return true; 
    });

    const totalCount = ventasFiltradas.length;

    totalVentasCount.innerText = totalCount;

    salesList.innerHTML = '';
    if (ventasFiltradas.length === 0) {
        salesList.parentElement.style.display = 'none';
        noSalesMsg.style.display = 'block';
    } else {
        salesList.parentElement.style.display = 'table';
        noSalesMsg.style.display = 'none';

        ventasFiltradas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

        ventasFiltradas.forEach(venta => {
            const tr = document.createElement('tr');
            
            const fecha = new Date(venta.fechaHora);
            const fechaStr = fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const productosStr = escapeHTML(venta.productos.join(', '));
            
            let metodoBadge = escapeHTML(venta.metodoPago);
            
            let comentarioHtml = '';
            if (venta.comentario) {
                comentarioHtml = `<br><small style="color: var(--primary); display: block; margin-top: 4px; font-style: italic;"><i class="fas fa-comment-dots"></i> ${escapeHTML(venta.comentario)}</small>`;
            }
            
            tr.innerHTML = `
                <td>${fechaStr}</td>
                <td>${productosStr}${comentarioHtml}</td>
                <td><span class="badge">Depto. ${escapeHTML(venta.departamento)}</span></td>
                <td>${metodoBadge}</td>
                <td>
                    <button class="btn-icon" style="color: var(--primary);" onclick="editarVenta('${venta.id}')" title="Editar Venta"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" onclick="eliminarVenta('${venta.id}')" title="Eliminar Venta"><i class="fas fa-trash"></i></button>
                </td>
            `;
            salesList.appendChild(tr);
        });
    }
}

window.eliminarProducto = function(id) {
    if(confirm('¿Seguro que deseas eliminar este producto?')) {
        appData.productos = appData.productos.filter(p => p.id !== id);
        saveData();
        updateProductosUI();
    }
}

window.eliminarVenta = function(id) {
    if(confirm('¿Seguro que deseas eliminar esta venta? Esta acción no se puede deshacer.')) {
        appData.ventas = appData.ventas.filter(v => v.id !== id);
        saveData();
        updateDashboard();
    }
}

window.editarVenta = function(id) {
    const venta = appData.ventas.find(v => v.id === id);
    if (!venta) return;
    
    editModeId = id;
    document.getElementById('titulo-nueva-venta').innerText = "Editar Venta";
    document.getElementById('btn-cancel-edit').classList.remove('d-none');
    
    document.getElementById('fecha-hora').value = venta.fechaHora;
    document.getElementById('departamento').value = venta.departamento;
    document.getElementById('metodo-pago').value = venta.metodoPago;
    document.getElementById('comentario-venta').value = venta.comentario || '';
    
    productosVentaContainer.innerHTML = '';
    venta.productos.forEach(prod => {
        const productDiv = document.createElement('div');
        productDiv.className = 'producto-item';
        const isFirst = productosVentaContainer.children.length === 0;
        productDiv.innerHTML = `
            <input type="text" class="producto-input" list="productos-lista" value="${prod}" ${isFirst ? 'required' : ''}>
            <button type="button" class="btn-remove-producto"><i class="fas fa-trash"></i></button>
        `;
        productosVentaContainer.appendChild(productDiv);
        productDiv.querySelector('.btn-remove-producto').addEventListener('click', function() {
            this.parentElement.remove();
            checkRemoveButtons();
        });
    });
    checkRemoveButtons();
    
    document.getElementById('nav-nueva-venta').click();
}

document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    editModeId = null;
    document.getElementById('titulo-nueva-venta').innerText = "Registrar Nueva Venta";
    document.getElementById('btn-cancel-edit').classList.add('d-none');
    formVenta.reset();
    setCurrentDateTime();
    productosVentaContainer.innerHTML = `
        <div class="producto-item">
            <input type="text" class="producto-input" list="productos-lista" placeholder="Buscar o escribir producto..." required>
            <button type="button" class="btn-remove-producto" disabled><i class="fas fa-trash"></i></button>
        </div>
    `;
    productosVentaContainer.querySelector('.btn-remove-producto').addEventListener('click', function() {
        this.parentElement.remove();
        checkRemoveButtons();
    });
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
