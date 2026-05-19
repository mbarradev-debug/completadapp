# CLAUDE.md — Completadapp

Contexto de proyecto para Claude Code. Este archivo se carga automáticamente en cada sesión.

---

## Qué es este proyecto

App mobile-first para organizar completadas (hot dogs chilenos). Calcula ingredientes exactos para N personas, estima el costo total y genera un mensaje de WhatsApp listo para compartir. Sin backend, sin auth, sin base de datos — todo vive en el dispositivo del organizador.

**Figma:** `yNZABLj9uCBoszDnlCKXtl`  
**Docs de referencia:** `ingredientes-engine.md`, `design-system.md`, `pantallas-mvp.md`, `plan-completadapp.md`

---

## Stack

| Capa       | Tecnología                                              |
| ---------- | ------------------------------------------------------- |
| Framework  | Expo (React Native) + TypeScript                        |
| Navegación | Expo Router (file-based, convención Next.js App Router) |
| Storage    | AsyncStorage (sin backend, funciona offline)            |
| Compartir  | `Linking.openURL` con deep link `wa.me/?text=...`       |
| Dev        | Expo Go (QR en dispositivo real)                        |
| Prod       | EAS Build → Play Store                                  |

**Sin backend. Sin autenticación. Sin base de datos.** Todo en AsyncStorage del dispositivo.

---

## Reglas del motor de ingredientes

```ts
// Fórmula base
const total_tipo = ceil(completos_por_tipo * 1.1); // margen 10%

// Tipos: italiano, dinamico, americano
// Ingredientes por tipo:
// Italiano:   vienesa + pan + palta(70g) + tomate(40g) + mayo(50g)
// Dinámico:   vienesa + pan + chucrut(40g) + tomate(40g) + mayo(30g) + mostaza(10g)
// Americano:  vienesa + pan + ketchup(20g) + mayo(25g) + mostaza(10g)

// Formatos de compra:
// Vienesas: pack x5 o pack x20 — mostrar ambas opciones
// Pan: pack x8 → ceil(total / 8)
// Palta: malla 1kg → 700g usable → ceil(total_italiano * 70 / 700) // ~1 malla por cada 10 completos
// Tomate: 140g c/u → ceil((italiano + dinamico) * 40 / 140)
// Mayo: chico 394g ($5.590) / mediano 789g ($6.590) / grande 1262g ($9.390)
//   → fórmula: (italianos×50g) + (dinámicos×30g) + (americanos×25g) + 10% margen
//   → el frasco grande es el caso más común para grupos de 8+ personas con italianos
// Mostaza: frasco 200g (din + ame) → ceil(total * 10 / 200)
// Ketchup: frasco 400g (ame) → ceil(total * 20 / 400)
// Chucrut: tarro 400g (din) → ceil(total * 40 / 400)
```

**Nunca mostrar gramos al usuario — siempre unidades de compra reales (packs, mallas, frascos, tarros).**

---

## Design system

### Paleta principal

| Token                         | Hex       | Uso                               |
| ----------------------------- | --------- | --------------------------------- |
| `color/brand/red`             | `#C1272D` | CTA principal, único por pantalla |
| `color/neutral/cream`         | `#FFF8E8` | Fondo de TODAS las pantallas      |
| `color/neutral/carbon`        | `#1A1A1A` | Texto principal                   |
| `color/neutral/gray`          | `#666666` | Texto secundario                  |
| `color/accent/mustard-text`   | `#9A6F00` | Precios y badges                  |
| `color/accent/mustard-bg`     | `#FFF8E0` | Fondo de badges de precio         |
| `color/accent/mustard-border` | `#D4A017` | Borde de badges de precio         |

### Tipografía — reglas críticas

- **Alfa Slab One** → headings y botones únicamente (nunca en cuerpo de texto)
- **DM Sans** → cuerpo de texto (Regular / Medium / Bold)
- **Pacifico** → solo el logo wordmark
- **Special Elite** → solo etiquetas decorativas (`Special/FormLabel`, `Special/Category`)
- ⚠️ **Special Elite NUNCA para valores numéricos** — los dígitos pierden legibilidad. Precios siempre en `Label/Bold` (DM Sans Bold 15px)

### Espaciado

| Token         | Valor | Uso                                              |
| ------------- | ----- | ------------------------------------------------ |
| `spacing/lg`  | 16px  | Padding interno de cards                         |
| `spacing/xl`  | 24px  | Gap entre cards y secciones                      |
| `spacing/2xl` | 32px  | **Padding horizontal de pantalla** (ambos lados) |

### Radios

| Token         | Valor | Uso                   |
| ------------- | ----- | --------------------- |
| `radius/sm`   | 8px   | Chips, badges         |
| `radius/md`   | 12px  | Cards de contenido    |
| `radius/lg`   | 16px  | Cards principales     |
| `radius/pill` | 100px | Botones CTA, steppers |

**Fondo base siempre `#FFF8E8` — nunca blanco puro.**

---

## Pantallas del MVP

| #   | Pantalla                | Frame Figma                                  |
| --- | ----------------------- | -------------------------------------------- |
| 01  | Home / Mis completadas  | `v2 · 01 · Home` (`23:2`)                    |
| 01b | Home con historial      | `v2 · 01 · Home — Con historial` (`70:2`)    |
| 01c | Bottom Sheet acciones   | `v2 · 01 · Bottom Sheet — Acciones` (`71:2`) |
| 02  | Nombre y fecha          | `v2 · 02 · Nombre y fecha` (`23:17`)         |
| 03  | Participantes (stepper) | `v2 · 03 · Participantes` (`23:41`)          |
| 04  | Tipo de completo        | `v2 · 04 · Tipo de completo` (`23:66`)       |
| 05  | Precios base            | `v2 · 05 · Precios base` (`23:96`)           |
| 06a | Resumen Individual      | `v2 · 06 · Resumen — Individual` (`23:144`)  |
| 06b | Resumen Colaborativo    | `v2 · 06 · Resumen — Colaborativo` (nuevo)   |

**Los node IDs son referenciales — siempre buscar por nombre:**

```ts
page.findOne((n) => n.name === "v2 · 04 · Tipo de completo");
```

### Navegación

- Transición adelante: PUSH LEFT, 300ms, ease-out
- Transición atrás: PUSH RIGHT
- Bottom sheet: OVERLAY + DISSOLVE (no NAVIGATE)
- Pantalla 04 → selección directa en card = navegación inmediata (sin botón Continuar)

---

## Decisiones de UX ya tomadas — no revertir

- **Guardado automático** al llegar a pantalla 06, silencioso, sin confirmación
- **Sin botón "Continuar" en pantalla 04** — tap en card navega directamente
- **Label "personas" eliminado** en pantalla 03 — el contexto visual del stepper lo hace innecesario
- **Precios duplicados** copiados del evento original incluyendo ediciones manuales
- **Mensaje WhatsApp como texto plano** vía deep link — sin generación de imagen (pospuesto a v2)
- **Solo AsyncStorage** — sin base de datos, funciona offline

---

## Lo que NO entra en el MVP

- Eliminar completadas del historial
- Registro de pagos (quién pagó / quién debe)
- Notificaciones push
- Autenticación de usuarios
- Vista pública para participantes
- Múltiples organizadores por evento
- Imagen como mensaje de WhatsApp (v2)

---

## Mensaje de WhatsApp (formato exacto)

```
🌭 *Nombre del evento*
📅 DD de mes  |  👥 N personas  |  Tipo

🛒 *Lista de compras*
· Ingrediente — cantidad

💰 *Total: $XX.XXX*  ·  $X.XXX por persona

¿Tú organizas el próximo? → completadapp.cl
```

- Texto entre `*asteriscos*` = negrita en WhatsApp
- Solo ingredientes del tipo seleccionado
- Costo por persona: `ceil(total / personas)`
- Link al final = distribución orgánica integrada

---

## Precios base (CLP, actualizables por el organizador)

| Ingrediente    | Formato             | Precio |
| -------------- | ------------------- | ------ |
| Vienesas       | Pack x5             | $1.750 |
| Pan            | Pack x8             | $1.990 |
| Palta Hass     | Malla 1kg           | $5.500 |
| Tomate         | Por kg              | $1.990 |
| Mayonesa Kraft | Frasco chico 394g   | $5.590 |
| Mayonesa Kraft | Frasco mediano 789g | $6.590 |
| Mayonesa Kraft | Frasco grande 1262g | $9.390 |
| Mostaza Heinz  | Frasco              | $2.090 |
| Ketchup Heinz  | Frasco              | $2.995 |
| Chucrut        | Tarro 400g          | $990   |

---

## Workflow de desarrollo

1. Miguel trabaja desde tickets en **Linear.app**
2. El skill `linear-to-code-prompt` convierte el ticket en prompt para Claude Code
3. Claude Code implementa la pantalla o feature siguiendo este CLAUDE.md
4. Figma file `yNZABLj9uCBoszDnlCKXtl` es la fuente de verdad visual
5. Siempre buscar nodos Figma por nombre, nunca por ID hardcodeado
