# 🌐 NextUserDC

> [nextuser.lat](https://nextuser.lat) — Portfolio de proyectos web

## 📋 Descripción

Sitio web estático alojado en GitHub Pages que alberga una colección de proyectos web personales. Desarrollado con HTML, CSS y JavaScript puro (sin frameworks ni build tools).

## 🚀 Proyectos

### 🎮 MCAccounts

Buscador de cuentas de Minecraft no premium con base de datos indexada por prefijo, service worker para soporte offline e infinite scroll.

### 🕹️ GameFinder

Motor de búsqueda de ofertas de videojuegos en tiendas legales usando la API de CheapShark, con pestaña adicional para sitios alternativos y marketplaces de claves (Eneba, G2A, EldoradoGG, Instant Gaming).

### 💕 Camila

Página web personal dedicada con cuenta regresiva, mini-juego Wordle como mecanismo de desbloqueo, álbum de fotos y lista de Spotify embebida. Contenido protegido con cifrado AES-256-GCM (textos e imágenes) y contraseña con hash SHA-256.

### 💻 Sistemas Operativos

Directorio de descargas directas de más de 30 sistemas operativos y herramientas USB con búsqueda en tiempo real y logos SVG personalizados. Organizados por distro base (Ubuntu, Debian, Arch, Fedora, ChromeOS).

### 📬 Temp Mail (TMail)

Servicio de correos temporales con dominio `@nextuser.lat`. Generación de direcciones personalizadas o aleatorias, bandeja de entrada en tiempo real, envío de correos vía Resend, conexión multi-dispositivo mediante token secreto, y extensión de tiempo (24/48/72h). Protegido por contraseña con sesión de 15 minutos.

- **API:** Cloudflare Worker en `api.nextuser.lat` con D1 database
- **Seguridad:** Secret token por buzón, validación de origen, sanitización HTML server-side, rate limiting
- **Frontend:** Estilo dark glassmorphism (Outfit font), polling con pausa en tabs inactivos, localStorage con integridad HMAC-SHA256

### 🍽️ La Mesa 58

Página web de un restaurante venezolano hecha exclusivamente para un trabajo de desarrollo web del liceo. Incluye menú completo, sección de cultura venezolana y diseño responsive.

## 🔒 Seguridad

- **Cifrado AES-256-GCM** para datos sensibles en Camila (teléfono, API key) y TMail (localStorage con integridad HMAC-SHA256)
- **Sanitización HTML** contra XSS en TMail (DOMParser client-side + regex server-side en Worker)
- **Autenticación por secret token** en TMail para acceder a buzones desde otros dispositivos
- **Validación de origen** en el Worker de TMail (bloquea requests desde dominios no permitidos)
- **Escape de HTML** en GameFinder para todos los campos provenientes de la API CheapShark
- **Content-Security-Policy** gestionada por Cloudflare (bloquea bots de AI/ML)

## ⚙️ Tecnologías

- 🌐 HTML5 / CSS3 / JavaScript (vanilla)
- 📦 GitHub Pages con dominio personalizado (`nextuser.lat`)
- ☁️ Cloudflare Workers + D1 (API de TMail)
- 📧 Resend API (envío de correos con DKIM/SPF/DMARC)
- 🔧 Service Workers (MCAccounts)
- 🎨 CSS Grid, Flexbox, Glassmorphism
- 🔐 Web Crypto API (PBKDF2, AES-256-GCM, SHA-256)
- 🖼️ SVG personalizados + imágenes optimizadas

## 📁 Estructura

```
├── 📄 index.html          # Página principal / hub de proyectos
├── 📄 robots.txt          # Reglas para crawlers
├── 📄 sitemap.xml         # Sitemap XML
├── 🎮 MCAccounts/         # Buscador de cuentas Minecraft
├── 🕹️ GameFinder/         # Buscador de ofertas de videojuegos
├── 💕 Camila/             # Página personal dedicada
│   ├── 📄 data.js         # Contenido cifrado (AES-256-GCM)
│   └── 🖼️ media/          # (excluido del repo, en data.js)
├── 📬 TMail/              # Servicio de correos temporales
├── 💻 Os/                 # Directorio de sistemas operativos
│   └── 🎨 src/            # Logos SVG de cada SO
└── 🍽️ Mesa58/             # Sitio de restaurante
    └── 🖼️ imgs/           # Imágenes del menú
```

## 📬 Contacto

Formulario de contacto en [nextuser.lat](https://nextuser.lat)
