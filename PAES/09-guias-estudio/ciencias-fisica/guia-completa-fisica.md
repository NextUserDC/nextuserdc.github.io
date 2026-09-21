# Guía Completa: Física para PAES 2027 (Ciencias)

## Información General

Física es parte de la prueba de Ciencias (electiva). Para estudiantes TP, cubre el Módulo Técnico Profesional (MTP).

---

## Tema 1: Movimiento

### 1.1 Magnitudes Cinemáticas

**Magnitudes escalares:**
- **Posición (x):** Ubicación del cuerpo respecto a un origen
- **Distancia (d):** Trayectoria recorrida (escalar, siempre positiva)
- **Tiempo (t):** Duración del movimiento

**Magnitudes vectoriales:**
- **Desplazamiento (Δx):** Cambio de posición (vectorial)
- **Velocidad (v):** Rapidez con dirección
- **Aceleración (a):** Cambio de velocidad

### 1.2 MRU (Movimiento Rectilíneo Uniforme)

```
Velocidad constante (a = 0):
x = x₀ + v × t
v = constante
```

**Gráfica x vs t:** Recta pendiente = v
**Gráfica v vs t:** Recta horizontal

### 1.3 MRUA (Movimiento Rectilíneo Uniformemente Acelerado)

```
x = x₀ + v₀ × t + ½ × a × t²
v = v₀ + a × t
v² = v₀² + 2 × a × Δx
```

Donde:
- v₀ = velocidad inicial
- a = aceleración constante
- Δx = desplazamiento

**Gravedad:** a = g = 9.8 m/s² (hacia abajo)

**Caída libre** (v₀ = 0):
```
h = ½ × g × t²
v = g × t
v² = 2 × g × h
```

### 1.4 Tiro Horizontal

```
Horizontal: x = v₀ × t
Vertical: y = ½ × g × t²
Trayectoria: parábola
```

### 1.5 Tiro Oblicuo

```
Componentes iniciales:
v₀ₓ = v₀ × cos(θ)
v₀ᵧ = v₀ × sen(θ)

Horizontal: x = v₀ₓ × t
Vertical: y = v₀ᵧ × t - ½ × g × t²

Alcance máximo: R = v₀² × sen(2θ) / g
Altura máxima: H = v₀² × sen²(θ) / (2g)
Tiempo total: T = 2 × v₀ × sen(θ) / g
```

---

## Tema 2: Fuerzas y Leyes de Newton

### 2.1 Fuerza

**Unidad:** Newton (N) = kg × m/s²

**Tipos de fuerzas:**
| Tipo | Descripción |
|------|-------------|
| **Gravitatoria** | Atracción entre masas: F = G × m₁ × m₂ / r² |
| **Normal (N)** | Reacción de una superficie |
| **Fricción** | Opuesta al movimiento: f = μ × N |
| **Elastica** | Resortes: F = -k × x (Ley de Hooke) |
| **Tensión** | En cuerdas/sogas |
| **Peso** | F = m × g |

### 2.2 Leyes de Newton

**1ª Ley (Inercia):**
> Un cuerpo en reposo permanece en reposo, y en movimiento rectilíneo uniforme, a menos que una fuerza neta actúe sobre él.

**2ª Ley (Fuerza):**
```
F = m × a
Donde:
- F = fuerza neta (N)
- m = masa (kg)
- a = aceleración (m/s²)
```

**3ª Ley (Acción-Reacción):**
> Para toda fuerza que A ejerce sobre B, existe una fuerza igual y opuesta que B ejerce sobre A.
> F_AB = -F_BA

### 2.3 Aplicación de las leyes

**Plano inclinado:**
```
Componente del peso paralela: F = m × g × sen(θ)
Componente del peso perpendicular: F = m × g × cos(θ)
```

**Tres cuerpos (sistema):**
1. Dibujar diagrama de cuerpo libre
2. Definir ejes (generalmente x = dirección del movimiento)
3. Aplicar F = ma en cada eje
4. Resolver el sistema de ecuaciones

---

## Temo 3: Trabajo, Energía y Potencia

### 3.1 Trabajo

```
W = F × d × cos(θ)

Donde:
- W = trabajo (Joules, J)
- F = fuerza (N)
- d = desplazamiento (m)
- θ = ángulo entre F y d
```

- Si θ = 0°: W = F × d (trabajo máximo)
- Si θ = 90°: W = 0 (fuerza perpendicular)
- Si θ = 180°: W = -F × d (trabajo negativo)

### 3.2 Energía

**Energía cinética (movimiento):**
```
Ec = ½ × m × v²
```

**Energía potencial gravitatoria (altura):**
```
Ep = m × g × h
```

**Energía potencial elástica (resorte):**
```
Ep = ½ × k × x²
```

### 3.3 Conservación de la energía

```
En sistema sin fricción:
E_total = Ec + Ep = constante
```

**Ejemplo:** Una bola cae desde altura h
```
En la cúspide: Ec = 0, Ep = mgh
En el suelo: Ec = ½mv², Ep = 0
Por conservación: mgh = ½mv²
v = √(2gh)
```

### 3.4 Potencia

```
P = W / t = F × v

Potencia (Watts, W) = Trabajo / Tiempo
1 HP (caballo de fuerza) = 746 W
```

---

## Tema 4: Electricidad

### 4.1 Carga y campo eléctrico

**Carga eléctrica:**
- Positiva (+) y negativa (-)
- Se atraen opuestos, se repelen iguales
- Unidad: Coulomb (C)
- e = 1.6 × 10⁻¹⁹ C (carga del electrón)

**Ley de Coulomb:**
```
F = k × |q₁ × q₂| / r²

Donde:
- k = 9 × 10⁹ N·m²/C²
- q₁, q₂ = cargas (C)
- r = distancia entre cargas (m)
```

### 4.2 Corriente eléctrica

**Corriente (I):** Flujo de carga
```
I = Q / t

I = corriente (Amperios, A)
Q = carga (Coulombs, C)
t = tiempo (segundos, s)
```

**Circuito serie:**
```
R_total = R₁ + R₂ + R₃ + ...
I = I₁ = I₂ = I₃ (misma corriente)
V = V₁ + V₂ + V₃ (voltajes se suman)
```

**Circuito paralelo:**
```
1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...
V = V₁ = V₂ = V₃ (mismo voltaje)
I = I₁ + I₂ + I₃ (corrientes se suman)
```

### 4.3 Ley de Ohm

```
V = I × R

V = voltaje (Volts, V)
I = corriente (Amperios, A)
R = resistencia (Ohmios, Ω)
```

**Potencia eléctrica:**
```
P = V × I = I² × R = V² / R
```

### 4.4 Leyes de Kirchhoff

**1ª Ley (Nodos):** La suma de corrientes que entran = suma de corrientes que salen
```
Σ I_entrada = Σ I_salida
```

**2ª Ley (Mallas):** La suma de voltajes en un circuito cerrado = 0
```
Σ V = 0
```

---

## Tema 5: Ondas y Sonido

### 5.1 Ondas mecánicas

**Tipos:**
- **Longitudinales:** Oscilan en la dirección de propagación (sonido)
- **Transversales:** Oscilan perpendicular a la propagación (luz, cuerdas)

**Magnitudes:**
```
v = f × λ

v = velocidad (m/s)
f = frecuencia (Hz)
λ = longitud de onda (m)
```

**Periodo:**
```
T = 1/f
```

### 5.2 Sonido

- Onda mecánica longitudinal
- Necesita un medio para propagarse
- Velocidad en aire: ~343 m/s (a 20°C)

**Reflexión del sonido:**
- **Eco:** Reflejo en superficies lejanas (>0.1 s)
- **Reverberación:** Múltiples reflejos en espacios cerrados

**Frecuencias:**
- Infrasonido: < 20 Hz
- Audible: 20 Hz - 20,000 Hz
- Ultrasonido: > 20,000 Hz

### 5.3 Luz

**Propiedades:**
- Viaja en línea recta
- Velocidad en vacío: c = 3 × 10⁸ m/s
- Es una onda electromagnética

**Reflexión:**
```
Ángulo de incidencia = Ángulo de reflexión
θᵢ = θᵣ
```

**Refracción (Ley de Snell):**
```
n₁ × sen(θ₁) = n₂ × sen(θ₂)

n = índice de refracción = c/v
```

**Prisma:** La luz blanca se descompone en colores del arcoíris
```
Rojo → Violeta (menor a mayor refracción)
```

---

## Resumen de Fórmulas Clave

```
MOVIMIENTO:
- x = x₀ + v₀t + ½at²
- v = v₀ + at
- v² = v₀² + 2aΔx

FUERZAS:
- F = ma
- Peso = mg
- Fricción = μN

ENERGÍA:
- Ec = ½mv²
- Ep = mgh
- W = Fd cos(θ)
- P = W/t

ELECTRICIDAD:
- V = IR
- P = VI
- Serie: R_total = R₁ + R₂ + ...
- Paralelo: 1/R_total = 1/R₁ + 1/R₂ + ...

ONDAS:
- v = fλ
- T = 1/f
```

---

## Consejos para la Prueba de Física

1. **SIEMPRE** dibuja el diagrama de cuerpo libre
2. **Define el sistema** antes de aplicar F = ma
3. **Verifica unidades** antes de calcular
4. **Usa conservación de energía** cuando sea más simple que fuerzas
5. **En electricidad:** Identifica si es serie o paralelo primero
6. **Practica** con la prueba oficial de Ciencias del DEMRE
