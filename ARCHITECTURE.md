# Arquitectura de Completadapp

Guía técnica para desarrolladores que se incorporan al proyecto. Cubre estructura, flujo de datos, motor de negocio, storage y cómo extender el código.

---

## Qué es y qué no es

Completadapp calcula ingredientes de completos (hot dogs chilenos) para un grupo, estima el costo y genera un mensaje de WhatsApp listo para compartir.

**No tiene:**
- Backend (todo vive en el dispositivo)
- Autenticación de usuarios
- Base de datos (usa AsyncStorage del sistema operativo)
- Sincronización entre dispositivos

---

## Stack tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Framework | Expo ~54 + React Native 0.81 | Permite compilar iOS/Android desde TypeScript |
| Lenguaje | TypeScript 5.9 | Tipos estáticos, autocomplete, seguridad |
| Navegación | Expo Router 6 | File-based routing (similar a Next.js App Router) |
| Storage | AsyncStorage 2.2 | Persistencia offline sin backend |
| Animaciones | Reanimated 4 + Animated API | Transiciones fluidas |
| Build cloud | EAS Build (Expo) | Genera APK/AAB sin Xcode/Android Studio local |

---

## Mapa de carpetas

```
completadapp/
│
├── app/                    ← RUTAS (cada archivo = una pantalla)
│   ├── _layout.tsx         ← Root: carga fuentes, inicializa storage, splash
│   ├── (tabs)/             ← Grupo de tabs (actualmente solo Home)
│   │   ├── _layout.tsx     ← Configura el tab navigator (tab bar oculto)
│   │   └── index.tsx       ← PANTALLA 01: Historial de completadas
│   ├── nueva/              ← Flujo creación (4 pantallas en secuencia)
│   │   ├── _layout.tsx     ← Stack navigator del flujo nueva completada
│   │   ├── nombre.tsx      ← PANTALLA 02: Nombre y fecha del evento
│   │   ├── personas.tsx    ← PANTALLA 03: Número de asistentes
│   │   ├── tipo.tsx        ← PANTALLA 04: Tipo de completo (italiano/dinámico/americano)
│   │   └── precios.tsx     ← PANTALLA 05: Precios base editables
│   ├── resumen.tsx         ← PANTALLA 06: Resultado + lista compras + WhatsApp
│   └── modal.tsx           ← Modal genérico (no usado en MVP)
│
├── lib/                    ← LÓGICA DE NEGOCIO (sin UI)
│   ├── calcularIngredientes.ts       ← Motor: personas + tipo → ingredientes a comprar
│   ├── calcularIngredientes.test.ts  ← Tests unitarios del motor
│   ├── storage.ts                    ← CRUD de completadas en AsyncStorage
│   ├── defaultPrices.ts             ← Precios base + inicialización
│   ├── whatsapp.ts                  ← Genera el mensaje + abre WhatsApp
│   └── whatsapp.test.ts             ← Tests del generador de mensajes
│
├── types/
│   └── index.ts            ← Todos los tipos TypeScript del proyecto
│
├── components/             ← COMPONENTES REUTILIZABLES
│   ├── button.tsx          ← Botón CTA (primary rojo / secondary arena)
│   ├── text.tsx            ← Wrapper de texto con variantes tipográficas
│   ├── progress-stepper.tsx ← Indicador de pasos (dots 1-4)
│   ├── bottom-sheet.tsx    ← Hoja animada (Ver resumen / Duplicar)
│   ├── completada-card.tsx ← Card de historial en Home
│   ├── price-badge.tsx     ← Badge de precio en tono mostaza
│   └── info-pill.tsx       ← Chip informativo gris claro
│
├── theme/                  ← DESIGN TOKENS (fuente de verdad visual)
│   ├── colors.ts           ← Paleta completa (brand, neutral, accent)
│   ├── spacing.ts          ← Sistema de espaciado (xs=4 … 2xl=32)
│   ├── radius.ts           ← Border radii (sm=8 … pill=100)
│   └── typography.ts       ← Estilos tipográficos con variant names
│
├── hooks/
│   └── use-color-scheme.ts ← Re-export del hook de React Native
│
├── assets/
│   ├── fonts/              ← 6 fuentes TTF (AlfaSlabOne, DMSans, Pacifico, SpecialElite)
│   ├── icons/              ← PNGs pixel art (calendar, cart, hotdog, money, people)
│   └── images/             ← Logo, splash, imágenes de completos por tipo
│
├── scripts/
│   ├── generate_splash_drawables.py  ← Regenera splash nativo Android post-prebuild
│   └── remove_bg.py                  ← Utilidad para remover fondo de pixel art
│
├── app.json                ← Config de Expo (nombre, íconos, plugins, EAS project ID)
├── eas.json                ← Perfiles de build: preview=APK, production=AAB
├── CLAUDE.md               ← Contexto del proyecto para Claude Code (leer antes de tocar código)
└── tsconfig.json           ← Paths alias: @/* → raíz del proyecto
```

---

## Tipos TypeScript centralizados

**Archivo:** `types/index.ts`

Todos los tipos que se comparten entre pantallas y módulos de lógica viven aquí. Los más importantes:

```typescript
// Los tres tipos de completo disponibles
type TipoCompleto = 'italiano' | 'dinamico' | 'americano'

// Cuántos completos de cada tipo pide el usuario
interface CompletosPorTipo {
  italiano: number
  dinamico: number
  americano: number
}

// Resultado del motor de cálculo
interface IngredientesCalculados {
  vienesas:  { total: number; packsX5: number; packsX20: number }
  pan:       { total: number; packsX8: number }
  palta:     { aplica: boolean; mallas: number }
  tomate:    { aplica: boolean; unidades: number }
  mayonesa:  { formato: 'chico' | 'mediano' | 'grande'; cantidad: number }
  mostaza:   { aplica: boolean; frascos: number }
  ketchup:   { aplica: boolean; frascos: number }
  chucrut:   { aplica: boolean; tarros: number }
}

// Una completada guardada en el dispositivo
interface Completada {
  id:           string                   // UUID v4
  nombre:       string                   // "Completada del viernes"
  fecha:        string                   // ISO 8601: "2026-05-18"
  personas:     number                   // 1–50
  completos:    CompletosPorTipo         // cuántos de cada tipo
  precios:      Record<string, number>   // precios editados por el usuario (CLP)
  ingredientes: IngredientesCalculados   // calculados y guardados
  creadaEn:     string                   // ISO 8601 timestamp
}
```

---

## Motor de ingredientes

**Archivo:** `lib/calcularIngredientes.ts`
**Función principal:** `calcularIngredientes(personas, completos)` → `IngredientesCalculados`

Es el núcleo de negocio de la app. Toma cuántas personas van y cuántos de cada tipo de completo se harán, y devuelve exactamente cuántos packs, mallas o frascos hay que comprar.

### Cómo funciona paso a paso

```
personas=10, tipo='italiano'
       ↓
completos = { italiano: 10, dinamico: 0, americano: 0 }
       ↓
1. aplicarMinimo(): si el total < personas, escala todos los tipos
       ↓
2. conMargen(): multiplica cada tipo por 1.1 y redondea hacia arriba (10% extra)
       → italiano = ceil(10 × 1.1) = 11
       ↓
3. Por cada ingrediente, calcula unidades de compra:
   - Vienesas:  ceil(11/5) = 3 packs x5   |  ceil(11/20) = 1 pack x20
   - Pan:       ceil(11/8) = 2 packs x8
   - Palta:     ceil(11×70 / 700) = 2 mallas  (70g por italiano, 700g usable por malla)
   - Tomate:    ceil(11×40 / 140) = 4 unidades (40g por italiano, 140g por tomate)
   - Mayonesa:  ver sección siguiente
       ↓
4. Retorna IngredientesCalculados
```

### Lógica de mayonesa (la más compleja)

La mayonesa tiene tres tamaños de frasco y la app elige el más económico según cuántos gramos se necesitan:

```
gramos_total = (italiano×50 + dinamico×30 + americano×25) × 1.1

Si gramos_total ≤ 394g  → frasco chico  ($5.590)
Si gramos_total ≤ 789g  → frasco mediano ($6.590)
Si gramos_total > 789g  → frasco grande  ($9.390)

cantidad = ceil(gramos_total / capacidad_frasco)
```

### Qué ingrediente aplica a qué tipo

| Ingrediente | Italiano | Dinámico | Americano |
|-------------|----------|----------|-----------|
| Vienesas    | ✓ | ✓ | ✓ |
| Pan         | ✓ | ✓ | ✓ |
| Palta       | ✓ | — | — |
| Tomate      | ✓ | ✓ | — |
| Mayonesa    | ✓ | ✓ | ✓ |
| Mostaza     | — | ✓ | ✓ |
| Ketchup     | — | — | ✓ |
| Chucrut     | — | ✓ | — |

El campo `aplica: boolean` en `IngredientesCalculados` refleja esto. Si `aplica === false`, el ingrediente no se muestra en la lista de compras.

### Dónde se llama

- `app/nueva/precios.tsx` (~línea 70): para resolver el formato de mayonesa al cargar la pantalla
- `app/resumen.tsx` (~línea 30): para calcular los ingredientes finales al crear la completada

---

## Flujo de datos completo

```
[Pantalla 02 — nombre.tsx]
  usuario escribe "Completada del viernes"
  usuario selecciona fecha 18 de mayo
       ↓ router.push('/nueva/personas', { nombre, fecha })
       ↓
[Pantalla 03 — personas.tsx]
  usuario ajusta el stepper a 10 personas
       ↓ router.push('/nueva/tipo', { nombre, fecha, personas: 10 })
       ↓
[Pantalla 04 — tipo.tsx]
  usuario toca card "Italiano"
       ↓ router.push('/nueva/precios', { nombre, fecha, personas, tipo: 'italiano' })
       ↓ (sin botón Continuar — el tap en la card navega directamente)
       ↓
[Pantalla 05 — precios.tsx]
  - carga precios guardados (AsyncStorage) o DEFAULT_PRICES
  - muestra solo ingredientes aplicables al tipo 'italiano'
  - usuario puede editar cada precio tocando el badge amarillo
  - toca "Calcular →"
       ↓ savePrices(precios) → guarda en AsyncStorage
       ↓ router.push('/resumen', { nombre, fecha, personas, tipo, precios: JSON.stringify(precios) })
       ↓
[Pantalla 06 — resumen.tsx]
  - recibe params como strings (limitación de Expo Router)
  - parsea precios: JSON.parse(params.precios)
  - ejecuta calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })
  - genera UUID para la nueva completada
  - construye objeto Completada
  - llama guardarCompletada(completada) → AsyncStorage
  - muestra lista de compras, costo total
  - usuario toca "Compartir por WhatsApp"
       ↓
[lib/whatsapp.ts]
  - generarMensajeWhatsApp(completada, modo)
  - Linking.openURL('whatsapp://send?text=...')
  - Si WhatsApp no está instalado → abre wa.me/?text=... en el navegador
```

### Nota sobre los params de Expo Router

Expo Router pasa todo como strings en la URL. Siempre hay que parsear los valores numéricos y los objetos:

```typescript
// En resumen.tsx:
const params = useLocalSearchParams()
const personas = parseInt(params.personas as string, 10)
const precios = JSON.parse(params.precios as string) as Record<string, number>
```

---

## Storage — cómo funciona

**Archivo:** `lib/storage.ts`

AsyncStorage es un key-value store persistente en el dispositivo. No es una base de datos SQL — es como `localStorage` del browser pero para mobile.

### Keys usadas

| Key | Tipo de dato | Contenido |
|-----|-------------|-----------|
| `completadapp:completadas` | `Completada[]` como JSON string | Array de todas las completadas guardadas |
| `completadapp:precios` | `Record<string, number>` como JSON string | Precios editados por el usuario |

### Funciones disponibles

```typescript
// Guarda o actualiza una completada
// Si ya existe un registro con el mismo id, lo reemplaza
guardarCompletada(completada: Completada): Promise<void>

// Retorna todas las completadas ordenadas por fecha creación
listarCompletadas(): Promise<Completada[]>

// Busca por ID. Retorna null si no existe
obtenerCompletada(id: string): Promise<Completada | null>

// Elimina por ID y re-persiste el resto
eliminarCompletada(id: string): Promise<void>
```

### Flujo interno de guardarCompletada

```
1. AsyncStorage.getItem('completadapp:completadas')
2. JSON.parse() → array de Completada (o [] si era null)
3. Busca si ya existe un item con el mismo id (upsert)
   - Si existe: reemplaza en esa posición
   - Si no: push al array
4. JSON.stringify(array) → AsyncStorage.setItem(...)
```

### Precios — inicialización

`lib/defaultPrices.ts` tiene `initializePrices()` que se llama UNA VEZ al arrancar la app (`app/_layout.tsx` línea ~30). Si no hay precios guardados, escribe los DEFAULT_PRICES. Esto garantiza que la pantalla 05 siempre tiene valores válidos aunque sea la primera vez que se abre la app.

---

## Pantallas en detalle

### Pantalla 01 — Home (`app/(tabs)/index.tsx`)

Punto de entrada de la app. Muestra el historial o el estado vacío.

**Cómo se refresca:** usa `useFocusEffect` de Expo Router. Cada vez que la pantalla "recibe foco" (el usuario vuelve desde otra pantalla), se llama `listarCompletadas()`. Esto hace que el historial siempre esté actualizado después de crear una completada nueva.

```typescript
useFocusEffect(
  useCallback(() => {
    listarCompletadas().then(setCompletadas)
  }, [])
)
```

**Estado vacío:** muestra un ícono de hot dog pixel art, un título y un subtítulo. Código en el componente local `EmptyState`.

### Pantalla 04 — Tipo (`app/nueva/tipo.tsx`)

Única pantalla sin botón "Continuar". El tap en cualquier card navega directamente. Esto fue una decisión de UX deliberada — no revertir.

### Pantalla 05 — Precios (`app/nueva/precios.tsx`)

La más compleja. Tiene:
1. Un modal animado para editar cada precio (slide-up desde abajo, `Animated.Value`)
2. Lógica para mostrar solo ingredientes aplicables al tipo seleccionado
3. Lógica para resolver el formato de mayonesa recomendado

El modal de edición usa `InputAccessoryView` en iOS para mostrar un botón "Listo" encima del teclado numérico.

### Pantalla 06 — Resumen (`app/resumen.tsx`)

Tiene dos modos:
- **Modo creación:** recibe params del flujo (nombre, fecha, personas, tipo, precios). Calcula ingredientes, genera UUID, guarda en storage.
- **Modo consulta:** recibe solo `id`. Carga la completada guardada sin recalcular nada.

El toggle Individual/Colaborativo solo afecta cómo se muestra el costo (total vs. por persona) y el mensaje de WhatsApp generado.

---

## Design system — reglas importantes

### Nunca hardcodear valores visuales

Todos los tokens están en `theme/`. Importar siempre desde ahí:

```typescript
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import { radius } from '@/theme/radius'

// Correcto:
backgroundColor: colors.neutral.cream

// Incorrecto:
backgroundColor: '#FFF8E8'
```

### Tipografía — regla crítica

`Special Elite` (la fuente de máquina de escribir) **nunca** para números. Los dígitos de esta fuente pierden legibilidad. Los precios y cantidades siempre usan `Label/Bold` (DM Sans Bold 15px).

```typescript
// Precio — correcto:
<Text variant="Label/Bold">$5.590</Text>

// Precio — incorrecto (se ve mal):
<Text variant="Special/FormLabel">$5.590</Text>
```

### Componente Text

Siempre usar `@/components/text.tsx` en lugar de `<Text>` de React Native directamente. El componente propio aplica la tipografía correcta según el `variant`:

```typescript
import { Text } from '@/components/text'

<Text variant="Heading/H2">Título</Text>
<Text variant="Body/Regular">Párrafo de cuerpo</Text>
<Text variant="Special/FormLabel">ETIQUETA FORMULARIO</Text>
```

Los variants disponibles están en `theme/typography.ts`.

---

## Cómo agregar una pantalla nueva

Expo Router usa file-based routing: cada archivo en `app/` se convierte en una ruta navegable automáticamente.

### Pasos

1. **Crea el archivo** en la carpeta correcta:
   ```
   app/nueva/mi-pantalla.tsx     → ruta: /nueva/mi-pantalla
   app/configuracion.tsx         → ruta: /configuracion
   ```

2. **Estructura mínima de una pantalla:**
   ```typescript
   import { View, StyleSheet } from 'react-native'
   import { useSafeAreaInsets } from 'react-native-safe-area-context'
   import { useRouter, useLocalSearchParams } from 'expo-router'
   import { Button } from '@/components/button'
   import { Text } from '@/components/text'
   import { colors } from '@/theme/colors'
   import { spacing } from '@/theme/spacing'

   export default function MiPantallaScreen() {
     const router = useRouter()
     const insets = useSafeAreaInsets()
     const params = useLocalSearchParams<{ nombre?: string }>()

     return (
       <View style={[styles.root]}>
         {/* Navbar */}
         <View style={[styles.navbar, { paddingTop: insets.top }]}>
           <View style={styles.navbarContent}>
             <Text variant="Heading/H3-Nav" style={{ color: 'white' }}>
               Mi pantalla
             </Text>
           </View>
         </View>

         {/* Contenido */}
         <View style={styles.content}>
           <Text variant="Body/Regular">Hola, {params.nombre}</Text>
         </View>

         {/* Footer */}
         <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
           <Button label="Continuar →" onPress={() => router.push('/siguiente')} />
         </View>
       </View>
     )
   }

   const styles = StyleSheet.create({
     root:         { flex: 1, backgroundColor: colors.neutral.cream },
     navbar:       { backgroundColor: colors.brand.red },
     navbarContent:{ height: 56, alignItems: 'center', justifyContent: 'center' },
     content:      { flex: 1, padding: spacing['2xl'] },
     footer:       { paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg, backgroundColor: colors.neutral.cream },
   })
   ```

3. **Navegar hacia ella** desde otra pantalla:
   ```typescript
   router.push('/nueva/mi-pantalla')

   // Con parámetros:
   router.push({ pathname: '/nueva/mi-pantalla', params: { nombre: 'Juan' } })
   ```

4. **Registrarla en el Stack** (solo si necesita opciones especiales):
   En `app/_layout.tsx`, dentro del componente `<Stack>`, agregar:
   ```typescript
   <Stack.Screen name="nueva/mi-pantalla" options={{ gestureEnabled: true }} />
   ```
   Si no se registra explícitamente, igual funciona con las opciones por defecto (`headerShown: false`, `slide_from_right`).

---

## Correr el proyecto

### Requisitos previos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

### Desarrollo con Expo Go (más rápido, sin compilar nativo)

```bash
npm install
npm start
```

Escanear el QR con la app **Expo Go** en el dispositivo. Limitación: no muestra el splash screen personalizado ni funciona con ciertos módulos nativos.

### Desarrollo con build nativo (recomendado para testear features completas)

Requiere Java 17 (no funciona con Java 26+):

```bash
# Primera vez: verificar Java
/usr/libexec/java_home -V   # macOS — ver versiones disponibles

# Setear Java 17:
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/platform-tools:$PATH

# Correr en Android:
npm run android    # → npx expo run:android

# Correr en iOS:
npm run ios        # → npx expo run:ios
```

### Generar APK para testers (sin Play Store)

```bash
eas build --profile preview --platform android
```

El APK se genera en la nube (EAS Build) y se puede descargar desde expo.dev. Instalar directamente en el dispositivo Android con "Instalar desde fuente desconocida".

### Generar AAB para Play Store

```bash
eas build --profile production --platform android
```

### Después de cambios en app.json o plugins nativos

```bash
npx expo prebuild --clean --platform android
# Luego regenerar el splash nativo:
python3 scripts/generate_splash_drawables.py
```

---

## Gotchas y decisiones no obvias

### 1. `android/` está en `.gitignore`

La carpeta con el código nativo de Android no se versiona. Se regenera con `npx expo prebuild --clean`. Como consecuencia, el splash screen nativo (que tiene fuentes custom) se pierde en cada prebuild. La solución está en `scripts/generate_splash_drawables.py`.

### 2. Params de Expo Router siempre son strings

Todo lo que se pasa entre pantallas vía `router.push(..., { params })` llega como string en el destino. Siempre parsear:

```typescript
const personas = parseInt(params.personas as string, 10)
const precios = JSON.parse(params.precios as string)
```

### 3. Safe area insets — siempre respetar

En iOS y Android edge-to-edge, hay áreas del sistema (status bar, home indicator, notch) que el contenido no debe cubrir. Siempre usar `useSafeAreaInsets()` en navbars y footers:

```typescript
const insets = useSafeAreaInsets()
// Navbar:
<View style={{ paddingTop: insets.top }}>
// Footer:
<View style={{ paddingBottom: Math.max(insets.bottom, spacing.xl) }}>
```

### 4. KeyboardAvoidingView tiene un bug conocido de espacio residual

Las pantallas con inputs de texto no usan `KeyboardAvoidingView`. En cambio, usan listeners directos de `Keyboard` para mover solo el footer. Esto evita un bug donde el componente nativo deja espacio vacío después de cerrar el teclado. Ver implementación en `app/nueva/nombre.tsx` (~línea 45).

### 5. Guardado automático y silencioso

La completada se guarda en `resumen.tsx` automáticamente al llegar a esa pantalla, sin confirmación del usuario. No hay botón "Guardar". Esto fue una decisión de UX deliberada.

### 6. La pantalla 04 no tiene botón "Continuar"

En `tipo.tsx`, tocar una card navega inmediatamente a la siguiente pantalla. No hay botón separado. Si se agrega un botón, rompe la decisión de UX intencionada.

### 7. Precios se persisten globalmente pero se guardan por completada

Cuando el usuario edita precios en pantalla 05, se guardan dos veces:
- `savePrices()` → actualiza los precios "globales" del dispositivo (default para la próxima completada)
- Los precios también se guardan dentro del objeto `Completada` → sirven para mostrar el costo correcto al ver una completada antigua aunque los precios globales hayan cambiado

### 8. El motor de cálculo aplica un 10% de margen

`calcularIngredientes` multiplica todos los totales por 1.1 y redondea hacia arriba. Esto es intencional para cubrir imprevistos. No remover este margen.

### 9. Animaciones del BottomSheet

`bottom-sheet.tsx` usa dos animaciones en paralelo: un `spring` para el slide del sheet y un `timing` para el fade del overlay. El PanResponder detecta drag hacia abajo para cerrar. Si se refactoriza la animación, validar que ambas se limpien correctamente al desmontar.

### 10. typedRoutes y reactCompiler están activos

```json
// app.json
"experiments": {
  "typedRoutes": true,    // type-checking de rutas en tiempo de compilación
  "reactCompiler": true   // optimizador de re-renders automático
}
```

`typedRoutes` genera tipos para `router.push(...)` automáticamente. Si aparecen errores de TypeScript en rutas, puede ser que hay que regenerar con `npx expo start`.

---

## Cómo correr los tests

```bash
npm test
```

Los tests están en `lib/calcularIngredientes.test.ts` y `lib/whatsapp.test.ts`. Usan Jest con ts-jest. No hay mocks de AsyncStorage — la lógica de negocio está separada del storage deliberadamente para facilitar los tests.

---

## Figma

La fuente de verdad visual es el archivo Figma `yNZABLj9uCBoszDnlCKXtl`. Los frames de referencia son:

| Pantalla | Frame en Figma |
|----------|---------------|
| Home | `v2 · 01 · Home` |
| Home con historial | `v2 · 01 · Home — Con historial` |
| Bottom Sheet acciones | `v2 · 01 · Bottom Sheet — Acciones` |
| Nombre y fecha | `v2 · 02 · Nombre y fecha` |
| Participantes | `v2 · 03 · Participantes` |
| Tipo de completo | `v2 · 04 · Tipo de completo` |
| Precios base | `v2 · 05 · Precios base` |
| Resumen Individual | `v2 · 06 · Resumen — Individual` |
| Resumen Colaborativo | `v2 · 06 · Resumen — Colaborativo` |

Siempre buscar nodos por nombre, no por ID:
```typescript
page.findOne((n) => n.name === "v2 · 04 · Tipo de completo")
```
