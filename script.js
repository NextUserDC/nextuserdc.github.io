let inventory = JSON.parse(localStorage.getItem('inventory')) || {};

// Actualiza la lista de inventario en la interfaz
function updateInventoryList() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    for (const [code, product] of Object.entries(inventory)) {
        const item = document.createElement('li');
        item.textContent = `Nombre: ${product.name}, Código: ${code}, Cantidad: ${product.quantity}`;
        inventoryList.appendChild(item);
    }
}

// Inicializa el escáner
function initializeScanner(scannerElementId, callback) {
    const html5QrCode = new Html5Qrcode(scannerElementId);

    html5QrCode.start(
        { facingMode: "environment" }, // Cámara trasera
        {
            fps: 10, // Frames por segundo
            qrbox: { width: 250, height: 250 } // Tamaño del área de escaneo
        },
        (decodedText) => {
            callback(decodedText); // Devuelve el texto escaneado
        },
        (errorMessage) => {
            console.log("Error de escaneo:", errorMessage); // Ignora errores menores
        }
    ).catch((err) => {
        console.error("Error al iniciar el escáner:", err);
        alert("No se pudo iniciar el escáner. Verifica los permisos de la cámara.");
    });

    return html5QrCode;
}

// Detiene el escáner
function stopScanner(scannerInstance) {
    if (scannerInstance) {
        scannerInstance.stop().then(() => {
            console.log("Escáner detenido.");
        }).catch((err) => {
            console.error("Error al detener el escáner:", err);
        });
    }
}

// Agregar producto al inventario
document.getElementById('add-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const code = document.getElementById('code').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value.trim(), 10);

    if (!name || !code || quantity <= 0) {
        alert('Por favor, ingrese datos válidos.');
        return;
    }

    inventory[code] = { name, quantity: (inventory[code]?.quantity || 0) + quantity };
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateInventoryList();

    document.getElementById('name').value = '';
    document.getElementById('code').value = '';
    document.getElementById('quantity').value = '';
});

// Escáner de códigos de barras para agregar productos
document.getElementById('scan-add-code').addEventListener('click', () => {
    const html5QrCode = initializeScanner("reader", (decodedText) => {
        document.getElementById('code').value = decodedText;
        alert(`Código escaneado: ${decodedText}`);
        stopScanner(html5QrCode); // Detenemos el escáner después de escanear
    });
});

// Escáner de códigos de barras para descuentos
document.getElementById('start-discount-scan').addEventListener('click', () => {
    const html5QrCode = initializeScanner("reader", (decodedText) => {
        if (inventory[decodedText] && inventory[decodedText].quantity > 0) {
            inventory[decodedText].quantity -= 1;
            alert(`Producto descontado: ${inventory[decodedText].name}. Quedan ${inventory[decodedText].quantity} unidades.`);
        } else {
            alert(`Producto no encontrado o sin stock.`);
        }
        localStorage.setItem('inventory', JSON.stringify(inventory));
        updateInventoryList();
        stopScanner(html5QrCode); // Detenemos el escáner después de escanear
    });
});

// Botón para detener el escáner manualmente
document.getElementById('stop-scan').addEventListener('click', () => {
    stopScanner(html5QrCode);
});

// Inicializar la lista al cargar la página
document.addEventListener('DOMContentLoaded', updateInventoryList);
