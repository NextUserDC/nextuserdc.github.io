<h1 align="center">NextUserDC</h1>

<p align="center">
  <a href="https://nextuser.lat">nextuser.lat</a> — Juegos web &nbsp;·&nbsp;
  <a href="https://portfolio.nextuser.lat">portfolio.nextuser.lat</a> — Portfolio de proyectos
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Pages">
</p>

---

## Descripcion

Monorepo con **dos webs estaticas** servidas desde el mismo repositorio en **Cloudflare Pages**. Todo desarrollado con **HTML, CSS y JavaScript puro** — sin frameworks ni build tools.

| Dominio | Proyecto CF Pages | Contenido |
|:---:|:---:|:---|
| `nextuser.lat` | raiz del repo | Hub de juegos + webs de juegos (AdSense aqui) |
| `portfolio.nextuser.lat` | directorio `portfolio/` | Portfolio personal + legales (sin AdSense) |

Las rutas que cambiaron de dominio se redirigen con `301` via el archivo `_redirects` de la raiz.

---

## Estructura

```
/
├── index.html          # Hub de juegos (nextuser.lat)
├── _redirects          # 301 de rutas movidas a portfolio.nextuser.lat
├── ads.txt             # AdSense — solo en la raiz (juegos)
├── sitemap.xml         # Sitemap de juegos
├── Games/              # Mecanografía, Ludo (ES + EN)
├── PlayMC/             # Selector Eaglercraft (1.12.2 / 1.8.8)
├── MCAccounts/         # Buscador de cuentas (ES + EN)
├── GameFinder/         # Ofertas de videojuegos (ES + EN)
├── js/                 # consent.js e i18n.js de juegos
├── portfolio/          # Raiz del proyecto portfolio.nextuser.lat
│   ├── index.html      # Home del portfolio
│   ├── TMail/ Six/ Camila/ Os/ Mesa58/ SimulaVIP/ Photobooth/
│   ├── privacidad.html cookies.html terminos.html
│   ├── en/             # Version inglesa del portfolio
│   └── js/             # consent.js e i18n.js del portfolio
└── cf-mail-worker/     # API Cloudflare Worker (no desplegado con Pages)
```

---

## Proyectos — Juegos (nextuser.lat)

<table>
<tr>
<td width="50%">

### Games
Juegos web interactivos: Mecanografia (solitario) y Ludo (local 2-4 jugadores + online), con version en ingles.

`/Games/`

</td>
<td width="50%">

### Eaglercraft (PlayMC)
Selector con dos versiones de Minecraft en el navegador basado en EaglercraftX: **1.12.2** (WASM-GC, ultima) y **1.8.8** (clasica y estable). Mundos propios por version.

`/PlayMC/`

</td>
</tr>
<tr>
<td>

### MCAccounts
Buscador de cuentas de Minecraft no premium con base de datos indexada por prefijo, soporte offline e infinite scroll.

`/MCAccounts/`

</td>
<td>

### GameFinder
Motor de busqueda de ofertas de videojuegos en tiendas legales usando la API de CheapShark, con pestaña adicional para marketplaces de claves.

`/GameFinder/`

</td>
</tr>
</table>

---

## Proyectos — Portfolio (portfolio.nextuser.lat)

<table>
<tr>
<td width="50%">

### Correo Temporal (TMail)
Servicio de correos temporales con dominio propio. Generacion de direcciones personalizadas o aleatorias, bandeja de entrada en tiempo real, envio de correos y conexion multi-dispositivo. PWA completa con modo offline.

`/TMail/`

</td>
<td width="50%">

### Sistemas Operativos
Directorio de descargas directas de mas de 30 sistemas operativos y herramientas USB con busqueda en tiempo real y logos SVG personalizados.

`/Os/`

</td>
</tr>
<tr>
<td>

### La Mesa 58
Pagina web de un restaurante venezolano con menu completo, seccion de cultura venezolana y diseño responsive.

`/Mesa58/`

</td>
<td>

### SimulaVIP
Sistema de venta de entradas para un simulador VIP con login y calculo de precios.

`/SimulaVIP/`

</td>
</tr>
<tr>
<td>

### Photobooth
Sitio web de arriendo de cabinas fotograficas con login, cotizador, galeria y panel admin.

`/Photobooth/`

</td>
<td>

### Camila
Pagina web personal dedicada con cuenta regresiva, mini-juego Wordle y album de fotos.

`/Camila/`

</td>
</tr>
<tr>
<td>

### Six
Regalo de 6 meses con tema The Simpsons y bioinformativa. Timeline, viñetas, scrapbook y 5 juegos en Krustyland Arcade (acceso con contraseña, `noindex`).

`/Six/`

</td>
<td>

### Legales
Politicas de privacidad, cookies y terminos, en español e ingles.

`/privacidad.html`

</td>
</tr>
</table>

---

## Stack

| Tecnologia | Uso |
|:---:|:---:|
| HTML5 | Estructura y contenido |
| CSS3 | Glassmorphism, Grid, Flexbox, responsive |
| JavaScript vanilla | Logica, interaccion, animaciones |
| Cloudflare Pages | Hosting de ambos proyectos (monorepo) |
| Cloudflare Worker | API `api.nextuser.lat` (verificacion de passwords, correo) |
| Cloudflare D1 | Base de datos del worker (SQLite en la nube) |
| Cloudflare DNS | Dominios y redirecciones 301 |

---

<p align="center">
  <img src="https://img.shields.io/badge/Siguiente_user-NextUserDC-6d28d9?style=for-the-badge&logo=github&logoColor=white" alt="NextUserDC">
</p>
