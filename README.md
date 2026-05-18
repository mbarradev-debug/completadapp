# Completadapp

App para organizar completadas (hot dogs chilenos). Calcula ingredientes, estima el costo y genera un mensaje de WhatsApp listo para compartir. Sin backend — todo vive en el dispositivo.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Run on device/emulator

   ```bash
   npm run android   # npx expo run:android
   npm run ios       # npx expo run:ios
   ```

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

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
