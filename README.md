# Completadapp

App para organizar completadas (hot dogs chilenos). Calcula ingredientes, estima el costo y genera un mensaje de WhatsApp listo para compartir. Sin backend — todo vive en el dispositivo.

## Requisitos

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/more/expo-cli/)
- Android Studio (emulador) o dispositivo físico con USB debugging
- Xcode (solo iOS)

## Desarrollo local

```bash
npm install
npm run android   # npx expo run:android
npm run ios       # npx expo run:ios
```

## Builds de distribución (EAS)

Los builds en la nube se generan con [EAS Build](https://docs.expo.dev/build/introduction/).

| Perfil | Formato | Uso |
|--------|---------|-----|
| `preview` | APK | Instalar directamente en Android (testers, sideload) |
| `production` | AAB | Play Store |

```bash
# APK para testers (sideload)
eas build --profile preview --platform android

# Bundle para Play Store
eas build --profile production --platform android
```

El APK generado en `preview` se puede instalar directamente con `adb install <archivo.apk>` o enviando el archivo al dispositivo.

## Scripts

### `scripts/generate_splash_drawables.py`

El splash nativo de Android se genera con fuentes custom (Pacifico + Special Elite). Como `android/` está en `.gitignore`, estos archivos no viajan en el repo y deben regenerarse después de cada `prebuild`.

Después de correr `npx expo prebuild --clean`:

```bash
python3 scripts/generate_splash_drawables.py
```

Esto regenera los `splashscreen_logo.png` en todos los density buckets y restaura `colors.xml` con el fondo rojo (`#C1272D`).

### `scripts/remove_bg.py`

Utilidad para remover el fondo de imágenes pixel art (flood-fill por escala de grises). Usado para generar los assets en `assets/images/completos/`.

## Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Estructura del proyecto, flujo de datos, motor de ingredientes, guía para agregar pantallas y gotchas para devs nuevos.
- [`docs/design-system.md`](./docs/design-system.md) — Tokens de color, tipografía y espaciado.
- [`docs/pantallas-mvp.md`](./docs/pantallas-mvp.md) — Especificación de las pantallas del MVP.
- [`docs/ingredientes-engine.md`](./docs/ingredientes-engine.md) — Fórmulas del motor de ingredientes.
