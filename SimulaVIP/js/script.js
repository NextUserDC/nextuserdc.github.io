// Declaración de Variables (HTML -> JS)
const inpUser = document.getElementById("inpUser");
const inpPass = document.getElementById("inpPass");
const btnLogin = document.getElementById("btnLogin");

const nombreComprador = document.getElementById("nombreComprador");
const cantidadAdultos = document.getElementById("cantidadAdultos");
const cantidadNiños = document.getElementById("cantidadNiños");
const btnComprar = document.getElementById("btnComprar");
const btnVolver = document.getElementById("btnVolver");

const btnCerrar = document.getElementById("btnCerrar");
const errorLogin = document.getElementById("errorLogin");
const errorCompra = document.getElementById("errorCompra");

const login = document.getElementsByClassName("login");
const compra = document.getElementsByClassName("compra");
const compraSection = document.getElementsByClassName("compra-section");
const resultado = document.getElementsByClassName("resultado");

// Validar Inputs (No permitir valores que no sean enteros)
function bloquearTeclas(e) {
    if (['.', ',', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
    }
}

function soloNumeros(e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
}

cantidadAdultos.addEventListener("keydown", bloquearTeclas);
cantidadAdultos.addEventListener("input", soloNumeros);
cantidadNiños.addEventListener("keydown", bloquearTeclas);
cantidadNiños.addEventListener("input", soloNumeros);

// Validación de Login y cambio de pantalla
btnLogin.addEventListener("click", (e) => {
    e.preventDefault();

    let user = inpUser.value;
    let pass = inpPass.value;

    if (user == "ventas" && pass == "1234") {
        login[0].style.display = "none";
        compra[0].style.display = "block";
    } else {
        errorLogin.innerText = "Usuario o contraseña incorrectos";
        errorLogin.style.color = "red";
        setTimeout(() => { errorLogin.innerText = ""; }, 2000);
    }
});

// Validación de Compra y cambio de pantalla
btnComprar.addEventListener("click", (e) => {
    e.preventDefault();

    let comprador = nombreComprador.value;
    let adultos = parseInt(cantidadAdultos.value);
    let niños = parseInt(cantidadNiños.value);

    // Validación de campos vacíos
    if (comprador.trim() === "" || cantidadAdultos.value.trim() === "" || cantidadNiños.value.trim() === "") {
        errorCompra.innerText = "Error: Complete todos los campos";
        errorCompra.style.color = "red";
        setTimeout(() => { errorCompra.innerText = ""; }, 2000);
        return;
    }

    // Validación de campos numéricos
    else if (isNaN(adultos) || isNaN(niños)) {
        errorCompra.innerText = "Error: Ingrese valores numéricos válidos";
        errorCompra.style.color = "red";
        setTimeout(() => { errorCompra.innerText = ""; }, 2000);
        return;
    }

    // Validación de campos negativos
    else if (adultos < 0 || niños < 0) {
        errorCompra.innerText = "Error: Los valores no pueden ser negativos";
        errorCompra.style.color = "red";
        setTimeout(() => { errorCompra.innerText = ""; }, 2000);
        return;
    }

    // Cálculo de descuento
    else {
        let subtotal = (adultos * 3500) + (niños * 1500);
        let descuento = 0;

        // 10% de descuento sobre el subtotal si es mayor a $15.000
        if (subtotal > 15000) {
        descuento = subtotal * 0.10;
        }

    // Cálculo del total
    let total = subtotal - descuento;

    // Cambio de contenido HTML por resultados
    document.getElementById("resComprador").innerText = `Comprador: ${comprador}`;
    document.getElementById("resAdultos").innerText = `Entradas adulto: ${adultos} × $3.500 = $${(adultos * 3500).toLocaleString()}`;
    document.getElementById("resNinos").innerText = `Entradas niño: ${niños} × $1.500 = $${(niños * 1500).toLocaleString()}`;
    document.getElementById("resDescuento").innerText = descuento > 0 ? `Descuento 10%: -$${descuento.toLocaleString()}` : "";
    document.getElementById("resTotal").innerText = `Total a pagar: $${total.toLocaleString()}`;

    // Cambio de pantalla
    compraSection[0].style.display = "none";
    resultado[0].style.display = "block";
}
});

// Botón Volver
btnVolver.addEventListener("click", (e) => {
    e.preventDefault();

    nombreComprador.value = "";
    cantidadAdultos.value = 0;
    cantidadNiños.value = 0;
    compraSection[0].style.display = "block";
    resultado[0].style.display = "none";
});

// Botón Cerrar Sesión
btnCerrar.addEventListener("click", (e) => {
    e.preventDefault();

    nombreComprador.value = "";
    cantidadAdultos.value = 0;
    cantidadNiños.value = 0;
    compra[0].style.display = "none";
    login[0].style.display = "block";
});