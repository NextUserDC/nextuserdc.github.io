# 🌐 NextUserDC

> [nextuser.lat](https://nextuser.lat) — Portfolio de proyectos web

## 📋 Descripción

Sitio web estático alojado en GitHub Pages que alberga una colección de proyectos web personales. Desarrollado con HTML, CSS y JavaScript puro (sin frameworks ni build tools).

## 🚀 Proyectos

### 📬 TMail — Correo Temporal

Servicio de correos temporales con dominio `@nextuser.lat`. Generación de direcciones personalizadas o aleatorias, bandeja de entrada en tiempo real, envío de correos, conexión multi-dispositivo mediante token y extensión de tiempo (24/48/72h). Protegido por contraseña verificada server-side via D1.

**Funcionalidades:**
- Generación de direcciones personalizadas o aleatorias
- Bandeja de entrada con polling cada 5 segundos
- Envío de correos vía Resend API (asunto opcional)
- Conexión desde otro dispositivo con token secreto
- Extensión de tiempo (24/48/72h)
- Prevención de duplicados
- Protección XSS server-side
- HMAC en localStorage para integridad de datos
- Colores diferenciados: azul (recibidos), naranja (enviados), morado (respuestas)

### ☁️ NCloud — Almacenamiento en la Nube

Almacenamiento de archivos integrado como vista dentro de TMail (sin páginas separadas). Usa Cloudflare R2 como backend.

**Funcionalidades:**
- Subida de archivos (drag & drop o selector)
- Carpetas y navegación por breadcrumb
- Espacio usado con barra de progreso
- Links temporales compartidos (presigned URLs, 60min, revocables)
- Eliminación de archivos y carpetas
- Autenticación vinculada al buzón de TMail
- Solo visible para direcciones personalizadas

### 🎮 MCAccounts

Buscador de cuentas de Minecraft no premium con base de datos indexada por prefijo, service worker para soporte offline e infinite scroll.

### 🕹️ GameFinder

Motor de búsqueda de ofertas de videojuegos en tiendas legales usando la API de CheapShark, con pestaña adicional para sitios alternativos y marketplaces de claves.

### 💕 Camila

Página web personal dedicada con cuenta regresiva, mini-juego Wordle como mecanismo de desbloqueo, álbum de fotos cifrado con AES-256-GCM y lista de Spotify embebida. Contraseña verificada server-side via D1.

### 💻 Sistemas Operativos

Directorio de descargas directas de más de 30 sistemas operativos y herramientas USB con búsqueda en tiempo real y logos SVG personalizados. Organizados por distro base.

### 🍽️ La Mesa 58

Página web de un restaurante venezolano con menú completo, sección de cultura venezolana y diseño responsive.

## 🛠️ Stack Técnico

- **Frontend:** HTML5 / CSS3 / JavaScript vanilla
- **Hosting:** GitHub Pages con dominio personalizado (`nextuser.lat`)
- **API/Backend:** Cloudflare Workers + D1 + R2
- **Email:** Resend API (envío de correos)
- **Seguridad:** SHA-256 server-side, AES-256-GCM (Camila), HMAC localStorage, sanitización XSS, CORS estricto
- **Diseño:** Glassmorphism, CSS Grid, Flexbox, responsive, SVG personalizados
