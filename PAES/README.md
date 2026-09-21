# PAES Study - Recurso de Estudio Completo

Repositorio de materiales de estudio para la **Prueba de Acceso a la Educación Superior (PAES)** de Chile, enfocado en estudiantes de 4to año de Enseñanza Media, especialmente de liceos técnico-profesionales.

**Admisión objetivo:** 2027  
**Ubicación:** `/home/alexander/Documents/PAES/paes-study/`  
**Última actualización:** Septiembre 2026

---

## 1. Descripción General del Proyecto

Este proyecto contiene un recurso de estudio completo para la PAES que incluye:

- **Temarios oficiales** descargados del Mineduc (PDFs)
- **Pruebas oficiales** del DEMRE (PAES Regular 2025 + PAES Invierno 2026) con clavijeros
- **Guías de estudio** por asignatura (formato Markdown, contenido explicativo completo)
- **Contenidos de estudio** por asignatura (formato JSON con links a recursos)
- **Ejercicios progresivos** con explicaciones detalladas (formato JSON)
- **Recursos web gratuitos** verificados y organizados
- **Guías de estrategia** (técnicas de estudio, gestión del tiempo, manejo de ansiedad)
- **Plan de estudio** de 8 semanas
- **Datos de referencia** (calendario, estructura de pruebas, requisitos por carrera)

---

## 2. Estructura Completa del Proyecto

```
paes-study/
├── README.md                              # Este archivo (guía completa)
│
├── 01-temarios-oficiales/                 # PDFs de temarios del DEMRE
│   ├── temario-competencia-lectora.pdf    # Temario CL (360KB)
│   ├── temario-m1.pdf                     # Temario M1 (351KB)
│   ├── temario-m2.pdf                     # Temario M2 (350KB)
│   ├── temario-ciencias.pdf               # Temario Ciencias (286KB)
│   ├── temario-historia.pdf               # Temario Historia (200KB)
│   └── regular-2027/                      # Temarios Admisión 2027
│       ├── temario-competencia-lectora-2027.pdf  # CL v2 (199KB)
│       ├── temario-m1-2027.pdf                   # M1 v1 (202KB)
│       ├── temario-m2-2027.pdf                   # M2 v2 (196KB)
│       ├── temario-ciencias-2027.pdf              # Ciencias v1 (287KB)
│       └── temario-historia-2027.pdf              # Historia v2 (196KB)
│
├── 02-pruebas-oficiales/                  # Pruebas aplicadas y clavijeros
│   ├── paes-regular-2025/                 # PAES Regular 2025
│   │   ├── competencia-lectora.pdf        # Prueba completa CL
│   │   ├── m1.pdf                         # Prueba completa M1
│   │   ├── m2.pdf                         # Prueba completa M2
│   │   ├── historia.pdf                   # Prueba completa Historia
│   │   ├── ciencias.pdf                   # Prueba completa Ciencias
│   │   └── clavijeros/                    # Respuestas correctas
│   │       ├── clavijero-competencia-lectora.pdf
│   │       ├── clavijero-m1.pdf
│   │       ├── clavijero-m2.pdf
│   │       ├── clavijero-historia.pdf
│   │       ├── clavijero-ciencias-biologia.pdf
│   │       ├── clavijero-ciencias-quimica.pdf
│   │       ├── clavijero-ciencias-fisica.pdf
│   │       └── clavijero-ciencias-tp.pdf
│   │
│   └── paes-invierno-2026/                # PAES Invierno 2026 (Admisión 2027)
│       ├── competencia-lectora.pdf        # 56 páginas
│       ├── m1.pdf                         # ~1.9MB
│       ├── m2.pdf                         # ~1.9MB
│       ├── historia.pdf
│       ├── ciencias-tp.pdf                # 56 páginas
│       └── clavijeros/                    # 8 clavijeros
│           ├── clavijero-competencia-lectora.pdf
│           ├── clavijero-m1.pdf
│           ├── clavijero-m2.pdf
│           ├── clavijero-historia.pdf
│           ├── clavijero-ciencias-biologia.pdf
│           ├── clavijero-ciencias-quimica.pdf
│           ├── clavijero-ciencias-fisica.pdf
│           └── clavijero-ciencias-tp.pdf
│
├── 03-guias-estrategia/                   # Guías de estrategia de estudio
│   ├── estrategias-por-asignatura.md      # Estrategias específicas por materia
│   ├── tecnicas-de-estudio.md             # Pomodoro, Cornell, Feynman, etc.
│   ├── gestion-del-tiempo.md              # Cómo organizar el tiempo de estudio
│   ├── manejo-ansiedad.md                 # Técnicas para manejar la ansiedad
│   └── plan-estudio-8-semanas.md          # Plan semanal detallado
│
├── 04-quizzes/                            # (PRÓXIMAMENTE) Sistema de quizzes
│
├── 05-datos-referencia/                   # Datos de referencia importantes
│   ├── calendario-admision-2027.json      # Calendario completo del proceso
│   ├── estructura-pruebas.json            # Detalles de cada prueba (preguntas, tiempo, etc.)
│   └── requisitos-m2-carreras.json        # Carreras que requieren M2 obligatoria
│
├── 06-contenidos-asignatura/              # Contenidos de estudio por asignatura (JSON)
│   ├── competencia-lectora/
│   │   └── contenido-cl.json              # Ejes, habilidades, 6 recursos
│   ├── matematica-m1/
│   │   └── contenido-m1.json              # 4 ejes, 9 recursos
│   ├── matematica-m2/
│   │   └── contenido-m2.json              # 4 ejes, 4 recursos
│   ├── ciencias-biologia/
│   │   └── contenido-ciencias.json        # Estructura Ciencias, Bio/Fís/Quím, 8 recursos
│   ├── ciencias-fisica/
│   ├── ciencias-quimica/
│   ├── ciencias-tp/
│   │   └── contenido-mtp.json             # Módulo Técnico Profesional, 3 recursos
│   └── historia/
│       └── contenido-historia.json        # 3 ejes + geografía, 6 recursos
│
├── 07-ejercicios-progresivos/             # Ejercicios con explicaciones (JSON)
│   ├── competencia-lectora/
│   │   └── ejercicios-cl.json             # 20 ejercicios (8 básico, 7 intermedio, 5 avanzado)
│   ├── matematica-m1/
│   │   └── ejercicios-m1.json             # 40 ejercicios (15 básico, 15 intermedio, 10 avanzado)
│   ├── matematica-m2/                     # (próximamente)
│   ├── ciencias-biologia/
│   │   └── ejercicios-biologia.json       # 20 ejercicios
│   ├── ciencias-fisica/
│   │   └── ejercicios-fisica.json         # 15 ejercicios
│   ├── ciencias-quimica/
│   │   └── ejercicios-quimica.json        # 15 ejercicios
│   ├── ciencias-tp/
│   │   └── ejercicios-mtp.json            # 15 ejercicios
│   └── historia/
│       └── ejercicios-historia.json       # 15 ejercicios
│
├── 08-recursos-web/                       # Recursos gratuitos verificados
│   └── recursos-gratuitos.json            # Índice maestro de todos los recursos
│
└── 09-guias-estudio/                      # Guías completas por asignatura (Markdown)
    ├── competencia-lectora/
    │   └── guia-completa-cl.md            # Guía completa de CL
    ├── matematica-m1/
    │   └── guia-completa-m1.md            # Guía completa de M1
    ├── matematica-m2/
    │   └── guia-completa-m2.md            # Guía completa de M2
    ├── ciencias-biologia/
    │   └── guia-completa-biologia.md      # Guía completa de Biología
    ├── ciencias-fisica/
    │   └── guia-completa-fisica.md        # Guía completa de Física
    ├── ciencias-quimica/
    │   └── guia-completa-quimica.md       # Guía completa de Química
    ├── ciencias-tp/
    │   └── guia-completa-tp.md            # Guía completa de TP
    └── historia/
        └── guia-completa-historia.md      # Guía completa de Historia
```

---

## 3. Pruebas PAES - Admisión 2027

### 3.1 Pruebas Obligatorias

| Prueba | Preguntas | Duración | Descripción |
|--------|-----------|----------|-------------|
| **Competencia Lectora** | 65 (60 calificables + 5 pilotaje) | 2h 30min | Comprensión lectora de 7 textos. Evalúa: Localizar (25%), Interpretar (40%), Evaluar (35%) |
| **Competencia Matemática 1 (M1)** | 65 (60 calificables + 5 pilotaje) | 2h 20min | Matemática básica-intermedia (7° básico a 2° medio). Ejes: Números (26%), Álgebra (29%), Geometría (21%), Prob/Estad (24%) |

### 3.2 Pruebas Electivas

| Prueba | Preguntas | Duración | Descripción |
|--------|-----------|----------|-------------|
| **Competencia Matemática 2 (M2)** | 55 | 2h 20min | Matemática avanzada (3° y 4° medio). **Obligatoria para carreras STEM.** Ejes: Álgebra (30%), Geo Analítica (25%), Combinatoria/Prob (25%), Cálculo (20%) |
| **Ciencias** | 80 (54 comunes + 26 electivas) | 2h 40min | Módulo Común (Bio, Fís, Quím de 1°-4° medio) + Módulo Electivo (Biología, Física o Química avanzada) o **Módulo Técnico Profesional (MTP)** |
| **Historia y Ciencias Sociales** | 65 | 2h | Mundo contemporáneo, Chile, Formación Ciudadana. Ejes: Historia de Chile (40%), Geografía (25%), Ciudadanía (20%), Mundo actual (15%) |

### 3.3 Módulo Técnico Profesional (MTP)

Para egresados de liceos técnico-profesionales, la prueba de Ciencias incluye un **Módulo Técnico Profesional** con 26 preguntas de:
- **Biología** (1° y 2° Medio): Célula, Genética, Evolución, Ecología
- **Física** (1° y 2° Medio): Movimiento, Fuerzas, Energía, Electricidad
- **Química** (1° y 2° Medio): Átomos, Enlaces, Reacciones, Ácidos/Bases

**Diferencia con electivas:** El MTP cubre contenidos de 1°-2° medio (más básico), mientras que las electivas cubren 3°-4° medio (más avanzado). Para estudiantes TP, el MTP es ideal porque refuerza lo que ya aprendieron en su formación técnica.

### 3.4 Puntaje

- Escala: 100 a 1000
- Puntaje mínimo: 150 (aprox.)
- Puntaje de corte varía por carrera y universidad

---

## 4. Contenido Detallado por Carpeta

### 4.1 `01-temarios-oficiales/`

**Archivos descargados:**
- 5 temarios base (del sitio anterior del DEMRE)
- 5 temarios Admisión 2027 (de Acceso Mineduc, versión v1 o v2)

**Fuentes de descarga:**
- Temarios base: `https://demre.cl/...` (archivos originales)
- Temarios 2027: `https://acceso.mineduc.cl/wp-content/uploads/2026/03/Temario-PAESRegular-2026-{SUBJ}-v{VERSION}.pdf`

**URLs exactas usadas:**
```
CL:      .../Temario-PAESRegular-2026-CL-v2.pdf
M1:      .../Temario-PAESRegular-2026-M1-v1.pdf
M2:      .../Temario-PAESRegular-2026-M2-v2.pdf
Ciencias: .../Temario-PAESRegular-2026-CIENCIAS-v1.pdf
Historia: .../Temario-PAESRegular-2026-HC-v2.pdf
```

**Nota:** El temario de Ciencias se llama "CIENCIAS" en la URL, no "CIE".

---

### 4.2 `02-pruebas-oficiales/`

**PAES Regular 2025:**
- 5 pruebas completas (PDFs)
- 8 clavijeros separados por asignatura (incluye Biología, Física, Química y TP por separado)

**PAES Invierno 2026 (Admisión 2027):**
- 5 pruebas completas
- 8 clavijeros
- **Nota:** Los archivos M1 y M2 muestran solo 6 páginas en metadata pero pesan ~1.9MB (posible empaquetado DEMRE)
- **Nota:** No se encontraron pruebas de Biología, Física y Química por separado, solo Ciencias-TP

**Tamaño total de materiales descargados:** ~21MB

---

### 4.3 `03-guias-estrategia/`

| Archivo | Contenido |
|---------|-----------|
| `estrategias-por-asignatura.md` | Estrategias específicas para CL, M1, M2, Ciencias, Historia |
| `tecnicas-de-estudio.md` | Técnica Pomodoro, Método Cornell, Mnemotecnia, Feynman, Mapas mentales, Espaciado |
| `gestion-del-tiempo.md` | Cómo distribuir el tiempo, priorización, semáforo de estudio |
| `manejo-ansiedad.md` | Técnicas de respiración, visualización, relajación, antes/durante/después de la prueba |
| `plan-estudio-8-semanas.md` | Plan semanal detallado: qué estudiar cada día, repeticiones, simulacros |

---

### 4.4 `05-datos-referencia/`

**`calendario-admision-2027.json`** - Calendario completo:
- Prueba de Invierno: 15-17 de junio 2026
- Prueba Regular: 30 de noviembre - 1-2 de diciembre 2026
- Resultados: 4 de enero 2027
- Postulación: 4-7 de enero 2027

**`estructura-pruebas.json`** - Detalle de cada prueba:
- Número de preguntas, duración, tipo de preguntas
- Ejes temáticos y porcentajes
- Formato (selección múltiple, etc.)

**`requisitos-m2-carreras.json`** - Carreras que requieren M2:
- Ingeniería (todas las menciones)
- Ciencias (Física, Matemática, Química, Biología)
- Medicina
- Arquitectura
- Agronomía
- Ciencias Veterinarias

---

### 4.5 `06-contenidos-asignatura/`

Cada archivo JSON contiene:
- **Estructura de la prueba** (preguntas, duración, formato)
- **Temario detallado** por eje temático
- **Recursos gratuitos** con URLs verificadas
- **Consejos de estudio** específicos

| Asignatura | Archivo | Ejes | Recursos |
|------------|---------|------|----------|
| Competencia Lectora | `contenido-cl.json` | Localizar, Interpretar, Evaluar | 6 |
| Matemática M1 | `contenido-m1.json` | Números, Álgebra, Geometría, Prob/Estad | 9 |
| Matemática M2 | `contenido-m2.json` | Álgebra, Geo Analítica, Combinatoria, Cálculo | 4 |
| Ciencias (Bio/Fís/Quím) | `contenido-ciencias.json` | Módulo común + electivos | 8 |
| Ciencias TP | `contenido-mtp.json` | MTP (Bio, Fís, Quím 1°-2° medio) | 3 |
| Historia | `contenido-historia.json` | Historia Chile, Geografía, Ciudadanía, Mundo | 6 |

---

### 4.6 `07-ejercicios-progresivos/`

Cada archivo JSON contiene ejercicios organizados por nivel con:
- **Respuesta correcta** con explicación detallada
- **Explicación de cada respuesta incorrecta** (por qué está mal)
- **Consejo** para recordar el concepto
- **Tema** específico al que pertenece

**Formato de cada ejercicio:**
```json
{
  "id": "M1-NUM-001",
  "nivel": "basico",
  "tema": "Operaciones con fracciones",
  "pregunta": "¿Cuánto es 3/4 + 2/5?",
  "opciones": ["A) 5/9", "B) 23/20", "C) 6/20", "D) 1/10"],
  "respuesta_correcta": "B",
  "explicacion_correcta": "Para sumar fracciones necesitamos denominador común: 3/4 + 2/5 = (3×5 + 2×4) / (4×5) = (15+8)/20 = 23/20",
  "explicaciones_incorrectas": {
    "A": "Error: se sumaron numeradores y denominadores por separado",
    "C": "Error: se multiplicaron numeradores y se sumaron denominadores",
    "D": "Error: se restaron en lugar de sumar"
  },
  "consejo": "Recuerda: para sumar fracciones, multiplica en cruz y multiplica denominadores"
}
```

| Asignatura | Ejercicios | Distribución |
|------------|------------|--------------|
| Competencia Lectora | 20 | 8 básico, 7 intermedio, 5 avanzado |
| Matemática M1 | 40 | 15 básico, 15 intermedio, 10 avanzado |
| Ciencias Biología | 20 | 8 básico, 7 intermedio, 5 avanzado |
| Ciencias Física | 15 | 5 básico, 5 intermedio, 5 avanzado |
| Ciencias Química | 15 | 5 básico, 5 intermedio, 5 avanzado |
| Ciencias TP | 15 | 5 básico, 5 intermedio, 5 avanzado |
| Historia | 15 | 5 básico, 5 intermedio, 5 avanzado |
| **TOTAL** | **140** | |

---

### 4.7 `08-recursos-web/`

**`recursos-gratuitos.json`** - Índice maestro de recursos gratuitos:

**Plataformas de Ejercicios:**
- **SimplePAES** (simplepaes.cl) - Ejercicios adaptativos M1/M2, mini-lecciones, diagnósticos
- **ExamenesGratis** (es.open-exam-prep.com) - 200+ preguntas por asignatura con explicaciones
- **Ensayo PAES** (ensayopaes.cl) - Simuladores, +2500 preguntas por materia
- **Filadd** (filadd.cl) - Ensayos nacionales gratuitos, guías por habilidad
- **Red de Matemáticas** (matematicas.cl) - 30+ guías gratuitas M1
- **Mates pal Colegio** (matespalcolegio.com) - Resoluciones completas M1/M2
- **Prueba PAES** (pruebapaes.cl) - Ensayos online por asignatura
- **Preuniversitario Cumbre** - Simulador CL con puntaje proyectado

**Preuniversitarios Gratuitos:**
- **PreUNAB** - Diagnóstico, ensayos, ruta personalizada, clases online

**Plataformas de Aprendizaje:**
- **Khan Academy español** - Cursos completos de matemáticas y ciencias

**Fuentes Oficiales:**
- Portal de Acceso Mineduc: https://acceso.mineduc.cl/paes/
- DEMRE: https://demre.cl/paes/
- Material de Preparación: https://acceso.mineduc.cl/material-de-preparacion-paes/

---

### 4.8 `09-guias-estudio/` (GUÍAS COMPLETAS)

Guías en formato Markdown con TODO el contenido que necesitas saber para cada prueba. Incluyen: fórmulas, ejemplos resueltos, errores comunes, estrategia de tiempo, consejos.

| Asignatura | Archivo | Contenido Principal |
|------------|---------|---------------------|
| **Competencia Lectora** | `guia-completa-cl.md` | 3 ejes (Localizar 25%, Interpretar 40%, Evaluar 35%), tipos de texto, estrategias, ejemplos |
| **Matemática 1** | `guia-completa-m1.md` | 4 ejes: Números (fracciones, porcentajes, proporcionalidad), Álgebra (productos notables, ecuaciones, funciones), Geometría (Pitágoras, áreas, semejanza), Prob/Estad (media, mediana, probabilidad) |
| **Matemática 2** | `guia-completa-m2.md` | Funciones (dominio, inversa, composición), Exponencial/Logaritmos, Trigonometría, Geometría Analítica (rectas, circunferencia, cónicas), Combinatoria (permutaciones, combinaciones), Cálculo (límites, derivadas, integrales) |
| **Biología** | `guia-completa-biologia.md` | Teoría celular, organelos, metabolismo (fotosíntesis/respiración), genética (ADN, Mendel), evolución, ecología, salud |
| **Física** | `guia-completa-fisica.md` | MRU/MRUA, caída libre, tiro, Leyes de Newton, trabajo/energía/potencia, electricidad (Ley de Ohm, circuitos), ondas/luz |
| **Química** | `guia-completa-quimica.md` | Estructura atómica, tabla periódica, enlaces (iónico/covalente/metálico), reacciones, estequiometría, ácidos/bases/pH |
| **TP** | `guia-completa-tp.md` | Contenido específico MTP, diferencia con electivas, estrategias para estudiantes técnicos, fórmulas clave |
| **Historia** | `guia-completa-historia.md` | Precolombino, Conquista/Colonia, Independencia, República, Siglo XX, Chile actual, Geografía (16 regiones), Ciudadanía, Globalización |

---

## 5. Cómo Usar este Material

### Ruta de estudio recomendada:

1. **Semana 1:** Revisar temarios oficiales (`01-temarios-oficiales/regular-2027/`) para conocer qué entra
2. **Semana 1-2:** Leer las guías de estudio (`09-guias-estudio/`) para entender los contenidos de cada asignatura
3. **Semana 2-4:** Estudiar contenidos usando los JSON de `06-contenidos-asignatura/` y los recursos web de `08-recursos-web/`
4. **Semana 3-6:** Practicar con ejercicios progresivos (`07-ejercicios-progresivos/`), empezando por nivel básico
5. **Semana 5-8:** Practicar con pruebas oficiales (`02-pruebas-oficiales/`) en condiciones cronometradas
6. **Durante todo:** Usar las guías de estrategia (`03-guias-estrategia/`) y el plan de 8 semanas

### Para estudiantes TP:
1. Empezar por la guía de TP (`09-guias-estudio/ciencias-tp/guia-completa-tp.md`)
2. Repasar las guías de Biología, Física y Química (contenidos de 1°-2° medio)
3. Practicar especialmente las 26 preguntas electivas de Ciencias

---

## 6. Próximos Pasos - Sistema de Quizzes (Futuro)

El proyecto tiene como objetivo implementar un **sistema de quizzes diarios** para practicar la PAES de forma interactiva.

### 6.1 Estructura planificada:

```
04-quizzes/
├── competencia-lectora/
│   ├── localizar.json
│   ├── interpretar.json
│   └── evaluar.json
├── matematica-m1/
│   ├── aritmetica.json
│   ├── algebra.json
│   ├── geometria.json
│   ├── probabilidad.json
│   └── datos.json
├── matematica-m2/
│   ├── algebra-avanzada.json
│   ├── trigonometria.json
│   └── funciones.json
├── ciencias/
│   ├── biologia.json
│   ├── fisica.json
│   ├── quimica.json
│   └── tecnico-profesional.json
└── historia/
    ├── mundo-contemporaneo.json
    ├── chile-siglo-xx.json
    └── formacion-ciudadana.json
```

### 6.2 Formato de cada pregunta (JSON):

```json
{
  "id": "CL-LOC-001",
  "materia": "Competencia Lectora",
  "habilidad": "Localizar",
  "pregunta": "Según el texto, ¿cuál es la tesis principal del autor?",
  "opciones": [
    "A) Opción A",
    "B) Opción B",
    "C) Opción C",
    "D) Opción D"
  ],
  "respuesta_correcta": "B",
  "explicacion": "El autor plantea explícitamente en el párrafo 3 que...",
  "tema": "Análisis de tesis",
  "dificultad": "intermedio",
  "tiempo_estimado": 90
}
```

### 6.3 Funcionalidades planificadas:
- **Quiz diario**: Preguntas aleatorias por materia
- **Modo estudio**: Ver explicaciones antes de responder
- **Modo examen**: Simular condiciones reales de la prueba
- **Progreso**: Seguir avance por tema y habilidad
- **Estadísticas**: Récord personal, temas débiles, mejora
- **Temporizador**: Controlar tiempo por pregunta (similar a la PAES real)

---

## 7. Información Técnica para la Web

### 7.1 Estructura de datos JSON

Todos los archivos JSON están diseñados para ser consumidos fácilmente por una aplicación web:

- **`contenido-*.json`**: Metadatos de asignaturas, temarios, recursos
- **`ejercicios-*.json`**: Preguntas con respuestas, explicaciones y niveles
- **`recursos-gratuitos.json`**: Índice de plataformas externas
- **`calendario-admision-2027.json`**: Fechas del proceso
- **`estructura-pruebas.json`**: Configuración de cada prueba
- **`requisitos-m2-carreras.json`**: Requisitos por carrera

### 7.2 Campos comunes en ejercicios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único (ej: "M1-ALG-001") |
| `nivel` | string | "basico", "intermedio", "avanzado" |
| `tema` | string | Tema específico al que pertenece |
| `pregunta` | string | Texto de la pregunta |
| `opciones` | array[string] | 4 alternativas (A, B, C, D) |
| `respuesta_correcta` | string | Letra de la respuesta correcta |
| `explicacion_correcta` | string | Por qué es correcta |
| `explicaciones_incorrectas` | object | Por qué cada otra opción está mal |
| `consejo` | string | Tip para recordar el concepto |

### 7.3 URLs de recursos verificados

Todos los URLs en los JSON han sido verificados y funcionan. Las URLs de DEMRE/Mineduc pueden cambiar periódicamente, por lo que se recomienda verificar antes de usarlas en producción.

---

## 8. Fuentes y Créditos

- **DEMRE** (Demarcación de Evaluación y Medición de Resultados Educacionales)
- **Mineduc** (Ministerio de Educación de Chile)
- **Khan Academy** (khanacademy.org)
- **SimplePAES** (simplepaes.cl)
- **Ensayo PAES** (ensayopaes.cl)
- **Filadd** (filadd.cl)
- **PreUNAB** (preunab.cl)

---

## 9. Notas Importantes

1. **Los temarios oficiales** son la fuente principal. Siempre verifica contra ellos.
2. **Las pruebas oficiales** son el mejor material de práctica. Úsalas en condiciones reales.
3. **Los ejercicios propios** tienen explicaciones detalladas pero no son oficiales del DEMRE.
4. **Los recursos web** son gratuitos y verificados, pero pueden cambiar sin previo aviso.
5. **El plan de 8 semanas** es una guía, ajústalo a tu ritmo y necesidades.
6. **Para TP:** El MTP refuerza contenidos de 1°-2° medio. No intentes estudiar temas avanzados de 3°-4° medio.

---

*Proyecto creado en Septiembre 2026. Para información actualizada, consulta siempre las fuentes oficiales del DEMRE y Acceso Mineduc.*
