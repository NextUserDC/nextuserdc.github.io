# Guía Completa: Matemática 2 (M2) PAES 2027

## Información General de la Prueba

| Dato | Detalle |
|------|---------|
| **Preguntas totales** | 55 |
| **Tiempo** | 2 horas 20 minutos |
| **Tipo** | Electiva (obligatoria para carreras STEM) |
| **Puntaje** | Escala 100 a 1000 |
| **Formato** | Selección múltiple (4 alternativas) |

**¿Cuándo es obligatoria M2?**
- Ingeniería
- Ciencias (Física, Matemática, Química, Biología)
- Medicina
- Arquitectura
- Agronomía
- Ciencias veterinarias
- Carreras con alta carga matemática

---

## Estructura por Ejes

### Eje 1: Álgebra (30% ≈ 17 preguntas)

#### 1.1 Funciones y sus propiedades

**Dominio:** Conjunto de valores de entrada (x) válidos
**Rango:** Conjunto de valores de salida (f(x))

**Dominios comunes:**
- Polinomios: ℝ (todos los reales)
- Fracción: ℝ menos donde el denominador = 0
- Raíz cuadrada: donde el radicando ≥ 0
- Logaritmo: donde el argumento > 0

**Paridad:**
- **Par:** f(-x) = f(x) → simétrica al eje Y
- **Impar:** f(-x) = -f(x) → simétrica al origen

**Monotonía:**
- **Creciente:** si x₁ < x₂ entonces f(x₁) < f(x₂)
- **Decreciente:** si x₁ < x₂ entonces f(x₁) > f(x₂)

**Ejemplo:**
> f(x) = x² - 4
> Dominio: ℝ
> Rango: [-4, +∞)
> Es par: f(-x) = (-x)² - 4 = x² - 4 = f(x)
> Mínimo en x = 0: f(0) = -4

#### 1.2 Funciones compuestas e inversas

**Compuesta:**
```
(g ∘ f)(x) = g(f(x))
```

**Ejemplo:**
> f(x) = 2x + 1, g(x) = x²
> (g ∘ f)(x) = (2x + 1)² = 4x² + 4x + 1
> (f ∘ g)(x) = 2(x²) + 1 = 2x² + 1

**Función inversa:**
```
Si y = f(x), entonces x = f⁻¹(y)
Procedimiento:
1. Reemplazar f(x) por y
2. Despejar x en función de y
3. Intercambiar x e y
4. Reemplazar y por f⁻¹(x)
```

**Ejemplo:**
> f(x) = 3x - 5
> y = 3x - 5
> y + 5 = 3x
> x = (y + 5)/3
> f⁻¹(x) = (x + 5)/3

#### 1.3 Función exponencial y logarítmica

**Exponencial:** f(x) = aˣ (a > 0, a ≠ 1)
```
Propiedades:
a^0 = 1
a^1 = a
a^(-x) = 1/aˣ
a^(x+y) = aˣ × aʸ
a^(x-y) = aˣ / aʸ
(aˣ)^y = a^(xy)
```

**Logaritmo:** log_a(x) = y ⟺ aʸ = x
```
Propiedades:
log_a(1) = 0
log_a(a) = 1
log_a(aˣ) = x
a^(log_a(x)) = x
log_a(xy) = log_a(x) + log_a(y)
log_a(x/y) = log_a(x) - log_a(y)
log_a(xⁿ) = n × log_a(x)
Cambio de base: log_a(x) = log_b(x) / log_b(a)
```

**Ejemplo:**
> Resolver: log₂(x) + log₂(x-2) = 3
> log₂(x(x-2)) = 3
> x(x-2) = 2³ = 8
> x² - 2x - 8 = 0
> (x-4)(x+2) = 0
> x = 4 (x = -2 no es válida porque log de negativo no existe)
> Verificación: log₂(4) + log₂(2) = 2 + 1 = 3 ✓

#### 1.4 Función trigonométrica

**Funciones base:**
```
sen(x), cos(x), tan(x) = sen(x)/cos(x)
cot(x) = cos(x)/sen(x) = 1/tan(x)
sec(x) = 1/cos(x)
csc(x) = 1/sen(x)
```

**Período:**
- sen y cos: 2π
- tan y cot: π

**Identidades fundamentales:**
```
sen²(x) + cos²(x) = 1
1 + tan²(x) = sec²(x)
1 + cot²(x) = csc²(x)
```

**Ángulos notables:**
| x | sen(x) | cos(x) | tan(x) |
|---|--------|--------|--------|
| 0° | 0 | 1 | 0 |
| 30° | 1/2 | √3/2 | √3/3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |
| 90° | 1 | 0 | indef. |

**Fórmulas de suma:**
```
sen(a+b) = sen(a)cos(b) + cos(a)sen(b)
cos(a+b) = cos(a)cos(b) - sen(a)sen(b)
sen(2a) = 2sen(a)cos(a)
cos(2a) = cos²(a) - sen²(a) = 2cos²(a) - 1 = 1 - 2sen²(a)
```

**Ecuaciones trigonométricas:**
> Resolver: sen(x) = 1/2 en [0, 2π)
> x = π/6 o x = 5π/6 (en el segundo cuadrante sen también es positivo)

---

### Eje 2: Geometría Analítica (25% ≈ 14 preguntas)

#### 2.1 Recta en el plano

**Formas de la ecuación:**
```
General: Ax + By + C = 0
Explícita: y = mx + b (m = pendiente, b = corte en Y)
Pendiente-intercepto: y - y₁ = m(x - x₁)
Dos puntos: (y-y₁)/(y₂-y₁) = (x-x₁)/(x₂-x₁)
```

**Pendiente:**
```
m = (y₂ - y₁) / (x₂ - x₁)
```

**Rectas paralelas:** m₁ = m₂
**Rectas perpendiculares:** m₁ × m₂ = -1

**Ángulo entre rectas:**
```
tan(θ) = |(m₂ - m₁) / (1 + m₁×m₂)|
```

**Distancia de un punto a una recta:**
```
d = |Ax₀ + By₀ + C| / √(A² + B²)
```

**Ejemplo:**
> Recta por (2,3) y (6,7):
> m = (7-3)/(6-2) = 4/4 = 1
> y - 3 = 1(x - 2)
> y = x + 1

#### 2.2 Circunferencia

**Ecuación central:**
```
(x-a)² + (y-b)² = r²
Centro: (a, b), Radio: r
```

**Ecuación general:**
```
x² + y² + Dx + Ey + F = 0
Centro: (-D/2, -E/2)
Radio: r = √(D²/4 + E²/4 - F)
```

**Posiciones relativas:**
- **Interior:** d < r (la recta no toca)
- **Tangente:** d = r (1 punto)
- **Exterior:** d > r (2 puntos o ninguno)

#### 2.3 Elipse, hipérbola y parábola

**Elipse:**
```
x²/a² + y²/b² = 1
- Centro: (0,0)
- Ejes: 2a (mayor), 2b (menor)
- Excentricidad: e = c/a (c² = a² - b²)
```

**Hipérbola:**
```
x²/a² - y²/b² = 1
- Centro: (0,0)
- Asíntotas: y = ±(b/a)x
- Excentricidad: e = c/a (c² = a² + b²)
```

**Parábola:**
```
y² = 4px (horizontal)
x² = 4py (vertical)
- Vértice: (0,0)
- Foco: (p, 0) o (0, p)
- Directriz: x = -p o y = -p
```

---

### Eje 3: Combinatoria y Probabilidad (25% ≈ 14 preguntas)

#### 3.1 Combinatoria

**Permutación:** Orden importa
```
P(n,r) = n! / (n-r)!
```

**Combinación:** Orden NO importa
```
C(n,r) = n! / (r!(n-r)!)
```

**Combinación con repetición:**
```
C'(n,r) = (n+r-1)! / (r!(n-1)!)
```

**Ejemplos:**
> 5 personas se sientan en 5 sillas: P(5,5) = 5! = 120
> Elegir 3 de 5 para un equipo: C(5,3) = 10
> Lanzar 2 dados: 6² = 36 resultados

**Principio de la suma:** Si A tiene m opciones y B tiene n, A∪B tiene m+n
**Principio del producto:** Si A tiene m opciones y B tiene n, A×B tiene m×n

#### 3.2 Probabilidad avanzada

**Probabilidad condicional:**
```
P(A|B) = P(A ∩ B) / P(B)
```

**Teorema de Bayes:**
```
P(A|B) = P(B|A) × P(A) / P(B)
```

**Variable aleatoria discreta:**
```
Valor esperado: E(X) = Σ xᵢ × P(xᵢ)
Varianza: Var(X) = E(X²) - [E(X)]²
```

**Distribución binomial:**
```
P(X=k) = C(n,k) × p^k × (1-p)^(n-k)
E(X) = n × p
Var(X) = n × p × (1-p)
```

**Ejemplo:**
> Se lanza un dado 3 veces. P(salir 6 al menos una vez):
> P(al menos 1) = 1 - P(ninguna)
> P(ninguna) = (5/6)³ = 125/216
> P = 1 - 125/216 = 91/216

---

### Eje 4: Cálculo (20% ≈ 10 preguntas)

#### 4.1 Límites

```
lim(x→a) f(x) = L significa que f(x) se aproxima a L cuando x se acerca a a
```

**Límites fundamentales:**
```
lim(x→a) c = c
lim(x→a) x = a
lim(x→∞) 1/x = 0
lim(x→0) sen(x)/x = 1
```

**Propiedades:**
```
lim(f+g) = lim f + lim g
lim(f×g) = lim f × lim g
lim(f/g) = lim f / lim g (si lim g ≠ 0)
```

**Indeterminaciones:**
- 0/0 → factorizar o racionalizar
- ∞/∞ → dividir por el mayor grado
- 0×∞ → convertir a fracción

#### 4.2 Derivadas

**Definición:**
```
f'(x) = lim(h→0) [f(x+h) - f(x)] / h
```

**Reglas de derivación:**
```
(c)' = 0
(xⁿ)' = n × x^(n-1)
(eˣ)' = eˣ
(ln x)' = 1/x
(sen x)' = cos x
(cos x)' = -sen x
(tan x)' = sec²x
```

**Regla del producto:** (fg)' = f'g + fg'
**Regla del cociente:** (f/g)' = (f'g - fg') / g²
**Regla de la cadena:** (f∘g)'(x) = f'(g(x)) × g'(x)

**Aplicaciones:**
- **Recta tangente:** y - f(a) = f'(a)(x - a)
- **Puntos críticos:** f'(x) = 0
- **Máximos/mínimos:** Analizar cambio de signo de f'

#### 4.3 Integrales

**Integral indefinida:**
```
∫ xⁿ dx = x^(n+1)/(n+1) + C (n ≠ -1)
∫ 1/x dx = ln|x| + C
∫ eˣ dx = eˣ + C
∫ sen x dx = -cos x + C
∫ cos x dx = sen x + C
```

**Integral definida:**
```
∫[a,b] f(x) dx = F(b) - F(a)
```

**Área bajo la curva:**
```
Área = ∫[a,b] |f(x)| dx
```

---

## Fórmulas Esenciales de M2

```
FUNCIONES:
- Inversa: y = f(x) → x = f⁻¹(y)
- Compuesta: (g∘f)(x) = g(f(x))

LOGARITMOS:
- log_a(xy) = log_a(x) + log_a(y)
- log_a(xⁿ) = n·log_a(x)

TRIGONOMETRÍA:
- sen²x + cos²x = 1
- sen(2x) = 2sen(x)cos(x)

GEOMETRÍA ANALÍTICA:
- Distancia: d = √((x₂-x₁)² + (y₂-y₁)²)
- Circunferencia: (x-a)² + (y-b)² = r²

COMBINATORIA:
- P(n,r) = n!/(n-r)!
- C(n,r) = n!/(r!(n-r)!)

CÁLCULO:
- (xⁿ)' = nxⁿ⁻¹
- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C
```

---

## Errores Comunes en M2

| Error | Cómo evitarlo |
|-------|---------------|
| Confundir dominio con rango | Dibuja la gráfica |
| Error en logaritmos: log(a+b) ≠ log a + log b | Solo funciona con productos |
| No verificar dominio en inversas | Revisa que exista f⁻¹ |
| Olvidar ± en raíces cuadradas | √(x²) = |x|, no x |
| Error en cadena: (sen(2x))' | = 2cos(2x), no cos(2x) |
| Confundir perm. con comb. | ¿El orden importa? |

---

## Estrategia de Tiempo

- **55 preguntas en 140 minutos** = ~2.5 minutos por pregunta
- **Eje 1 (Álgebra):** ~2.5 min/pregunta
- **Eje 2 (Geo. Analítica):** ~3 min/pregunta (más visual)
- **Eje 3 (Combinatoria/Prob):** ~2 min/pregunta (más directo)
- **Eje 4 (Cálculo):** ~3 min/pregunta (más técnico)

**Consejo:** Las preguntas de combinatoria suelen ser las más rápidas. Hazlas primero.

---

## Práctica Recomendada

1. **Semana 1-2:** Funciones (dominio, inversa, composición)
2. **Semana 3-4:** Exponenciales, logaritmos y trigonometría
3. **Semana 5-6:** Geometría analítica (rectas, circunferencia)
4. **Semana 7-8:** Combinatoria, probabilidad, cálculo y pruebas completas
