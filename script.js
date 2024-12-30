let inventory = JSON.parse(localStorage.getItem('inventory')) || {};

// Actualiza la lista de inventario en la interfaz
function updateInventoryList() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';
    for (const [code, quantity] of Object.entries(inventory)) {
        const item = document.createElement('li');
        item.textContent = `Código: ${code}, Cantidad: ${quantity}`;
        inventoryList.appendChild(item);
    }
}

// Agregar producto al inventario
document.getElementById('add-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('code').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value.trim(), 10);

    if (!code || quantity <= 0) {
        alert('Por favor, ingrese datos válidos.');
        return;
    }

    inventory[code] = (inventory[code] || 0) + quantity;
    localStorage.setItem('inventory', JSON.stringify(inventory));
    updateInventoryList();

    document.getElementById('code').value = '';
    document.getElementById('quantity').value = '';
});

// Escáner de códigos de barras
function startBarcodeScanner() {
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            if (inventory[decodedText] && inventory[decodedText] > 0) {
                inventory[decodedText] -= 1;
                alert(`Producto ${decodedText} descontado. Quedan ${inventory[decodedText]} unidades.`);
            } else {
                alert(`Producto ${decodedText} no encontrado o sin stock.`);
            }
            localStorage.setItem('inventory', JSON.stringify(inventory));
            updateInventoryList();
        },
        (errorMessage) => {
            console.log("Error de escaneo:", errorMessage);
        }
    ).catch((err) => {
        console.error("No se pudo iniciar el escáner:", err);
    });

    // Botón para detener el escáner
    document.getElementById('stop-scan').addEventListener('click', () => {
        html5QrCode.stop().then(() => {
            console.log("Escaneo detenido.");
        }).catch((err) => {
            console.error("Error al detener el escáner:", err);
        });
    });
}

// Iniciar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateInventoryList();
    startBarcodeScanner();
});
