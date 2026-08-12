# NextUserDC

> [nextuser.lat](https://nextuser.lat) — Portfolio de proyectos web

## Descripcion

Sitio web estatico alojado en GitHub Pages que alberga una coleccion de proyectos web personales. Desarrollado con HTML, CSS y JavaScript puro (sin frameworks ni build tools).

## Proyectos

### TMail — Correo Temporal

Servicio de correos temporales con dominio `@nextuser.lat`. Generacion de direcciones personalizadas o aleatorias, bandeja de entrada en tiempo real, envio de correos, conexion multi-dispositivo y extension de tiempo. Incluye NCloud (almacenamiento en la nube) integrado como vista interna. PWA completa con service worker y Web Share API.

### NCloud — Almacenamiento en la Nube

Almacenamiento de archivos integrado dentro de TMail. Subida con drag-and-drop, TTL configurable (1h, 6h, 12h), carpetas, enlaces de compartir con expiracion y barra de espacio. Backend en Cloudflare R2.

### MCAccounts

Buscador de cuentas de Minecraft no premium con base de datos indexada por prefijo, service worker para soporte offline e infinite scroll.

### GameFinder

Motor de busqueda de ofertas de videojuegos en tiendas legales usando la API de CheapShark, con pestaña adicional para sitios alternativos y marketplaces de claves.

### Eaglercraft (PlayMC)

Cliente de Minecraft 1.12.2 que se ejecuta directamente en el navegador web, basado en EaglercraftX.

### Sistemas Operativos

Directorio de descargas directas de mas de 30 sistemas operativos y herramientas USB con busqueda en tiempo real y logos SVG personalizados. Organizados por distro base.

### La Mesa 58

Pagina web de un restaurante venezolano con menu completo, seccion de cultura venezolana y diseño responsive.

### SimulaVIP

Sistema de venta de entradas para un simulador VIP con login, calculo de precios y diseño responsive.

### Camila

Pagina web personal dedicada con cuenta regresiva, mini-juego Wordle como mecanismo de desbloqueo, album de fotos cifrado con AES-256-GCM y lista de Spotify embebida.

## Stack Tecnico

- **Frontend:** HTML5 / CSS3 / JavaScript vanilla
- **Backend:** Cloudflare Workers + D1 + R2 (TMail/NCloud)
- **Hosting:** GitHub Pages con dominio personalizado (`nextuser.lat`)
- **Diseno:** Glassmorphism, CSS Grid, Flexbox, responsive, SVG personalizados
