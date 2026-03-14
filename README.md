# AppBlocker

Aplicație Android (React Native) care blochează alte aplicații când limita de timp zilnică este depășită.

## Funcționalități
- Monitorizare timp de utilizare per aplicație (UsageStatsManager)
- Setare limite de timp zilnice per aplicație
- Blocare automată prin overlay fullscreen
- Foreground service pentru monitorizare continuă

## Structura Proiectului
- `AppBlocker/android/` — Module native Java (UsageStats, Overlay, BlockerService)
- `AppBlocker/src/` — Service layer JS (modele, servicii, utilitare, bridge-uri native)

## Cerințe
- Android API 26+ (Android 8.0 Oreo)
- Node.js 18+ (pentru build React Native)
- Android Studio / SDK Tools

## Setup
```bash
cd AppBlocker
npm install
npx react-native run-android
```

## Permisiuni Necesare
- **Usage Access** — pentru citirea statisticilor de utilizare
- **Draw Over Other Apps** — pentru afișarea overlay-ului de blocare
