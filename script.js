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
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            document.getElementById('code').value = decodedText;
            alert(`Código escaneado: ${decodedText}`);
            html5QrCode.stop();
        },
        (errorMessage) => {
            console.log("Error de escaneo:", errorMessage);
        }
    ).catch((err) => {
        console.error("No se pudo iniciar el escáner:", err);
    });
});

// Escáner de códigos de barras para descuentos
document.getElementById('start-discount-scan').addEventListener('click', () => {
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            if (inventory[decodedText] && inventory[decodedText].quantity > 0) {
                inventory[decodedText].quantity -= 1;
                alert(`Producto descontado: ${inventory[decodedText].name}. Quedan ${inventory[decodedText].quantity} unidades.`);
            } else {
                alert(`Producto no encontrado o sin stock.`);
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

    document.getElementById('stop-scan').addEventListener('click', () => {
        html5QrCode.stop();
    });
});

// Inicializar la lista al cargar la página
document.addEventListener('DOMContentLoaded', updateInventoryList);
