const usuario = document.getElementById("usuario");
const clave = document.getElementById("clave");
const btnLogin = document.getElementById("btnLogin");
const mensajeLogin = document.getElementById("mensajeLogin");
const login = document.getElementById("login");
const inventario = document.getElementById("inventario");
const btnCalcular = document.getElementById("btnCalcular");
const resultado = document.getElementById("resultado");
const stock = document.getElementById("stock");

// revisa si el usuario y la clave son correctos
btnLogin.addEventListener("click", function () {

    let u = usuario.value.trim();
    let c = clave.value.trim();

    if (u === "" && c === "") {
        mensajeLogin.textContent = "Ingrese usuario y contraseña.";
        mensajeLogin.style.color = "red";
        return;
    }

    if (u === "") {
        mensajeLogin.textContent = "Ingrese el usuario.";
        mensajeLogin.style.color = "red";
        return;
    }

    if (c === "") {
        mensajeLogin.textContent = "Ingrese la contraseña.";
        mensajeLogin.style.color = "red";
        return;
    }

    if (u !== "bodega") {
        mensajeLogin.textContent = "Usuario incorrecto.";
        mensajeLogin.style.color = "red";
        return;
    }

    if (c !== "1234") {
        mensajeLogin.textContent = "Contraseña incorrecta.";
        mensajeLogin.style.color = "red";
        return;
    }

    // cambia el fondo a verde y muestra el panel
    document.body.style.background = "green";
    login.style.display = "none";
    inventario.style.display = "block";

});

// toma lo que escribió el usuario y hace la cuenta
btnCalcular.addEventListener("click", function () {

    let material = document.getElementById("material").value.trim();
    let cantidad = document.getElementById("cantidad").value;
    let precio = document.getElementById("precio").value;

    // revisa que no quede nada vacío
    if (material === "" || cantidad.trim() === "" || precio.trim() === "") {

        resultado.innerHTML = "Complete todos los campos.";
        resultado.style.color = "red";
        stock.innerHTML = "";
        return;

    }

    // revisa que cantidad y precio sean números mayores a cero
    if (isNaN(cantidad) || isNaN(precio) || cantidad <= 0 || precio <= 0) {

        resultado.innerHTML = "Cantidad y Precio deben ser números mayores que cero.";
        resultado.style.color = "red";
        stock.innerHTML = "";
        return;

    }

    // multiplica cantidad por precio
    let total = cantidad * precio;

    resultado.innerHTML =
        "Material: <b>" + material +
        "</b><br>Cantidad: " + cantidad +
        "<br>Precio: $" + precio +
        "<br><br><b>Valor Total del Inventario: $" + total + "</b>";

    resultado.style.color = "green";

    // si la cantidad es menor a 5 avisa que hay poco stock
    if (cantidad < 5) {

        stock.innerHTML = "ALERTA: Stock Crítico";
        stock.style.color = "red";

    } else {

        stock.innerHTML = "Stock suficiente";
        stock.style.color = "green";

    }

});
