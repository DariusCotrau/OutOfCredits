# AppBlocker - Aplicație Android de Blocare a Aplicațiilor

O aplicație Android construită cu React Native care monitorizează timpul de utilizare al aplicațiilor și le blochează automat când limita de timp impusă este atinsă.

## Descriere

AppBlocker permite utilizatorului să seteze limite de timp zilnice pentru aplicațiile instalate pe telefon. Când o aplicație depășește limita, un overlay fullscreen blochează accesul la aceasta, forțând utilizatorul să își gestioneze mai bine timpul.

## Tech Stack

| Layer | Tehnologie |
|-------|-----------|
| Framework | React Native 0.76+ |
| Platforma | Android (API 26+) |
| Module Native | Java (Android UsageStatsManager, WindowManager) |
| Persistență | AsyncStorage |
| Background | Android Foreground Service |

## Funcționalități

### Core (MVP)

#### Permisiuni și Setup
- [ ] Verificare și cerere permisiune Usage Access (USAGE_STATS)
- [ ] Verificare și cerere permisiune Overlay (SYSTEM_ALERT_WINDOW)
- [ ] Onboarding flow pentru acordarea permisiunilor

#### Gestionare Reguli
- [ ] Vizualizare lista aplicații instalate (non-sistem)
- [ ] Selectare aplicații de blocat
- [ ] Setare limită de timp per aplicație (minute)
- [ ] Activare/dezactivare reguli individuale
- [ ] Persistența regulilor în AsyncStorage

#### Monitorizare și Blocare
- [ ] Foreground Service care monitorizează utilizarea la fiecare 5 secunde
- [ ] Interogare UsageStatsManager pentru timpul zilnic de foreground
- [ ] Afișare overlay fullscreen când limita este depășită
- [ ] Notificare persistentă (foreground service)

#### Vizualizare Utilizare
- [ ] Dashboard cu timpul utilizat per aplicație astăzi
- [ ] Procent din limita consumată
- [ ] Timp rămas pentru fiecare aplicație blocată

### Phase 2

- [ ] Statistici săptămânale/lunare
- [ ] Programare pe ore (ex: blocare doar între 22:00-06:00)
- [ ] Notificări de avertizare la 80% din limită
- [ ] Export date utilizare
- [ ] Widget home screen cu statistici

## Arhitectură

```
AppBlocker/
├── android/                          # Cod nativ Android
│   └── app/src/main/
│       ├── AndroidManifest.xml
│       └── java/com/appblocker/
│           └── modules/
│               ├── AppBlockerPackage.java    # Înregistrare module RN
│               ├── AppUsageModule.java       # UsageStatsManager bridge
│               ├── OverlayModule.java        # Permisiune overlay bridge
│               ├── BlockerService.java       # Foreground service monitorizare
│               └── BlockerServiceModule.java # Control service din JS
├── src/
│   ├── models/
│   │   └── BlockRule.js              # Model regulă de blocare
│   ├── native/
│   │   ├── AppUsageBridge.js         # Bridge JS pentru AppUsageModule
│   │   ├── BlockerServiceBridge.js   # Bridge JS pentru BlockerServiceModule
│   │   └── OverlayBridge.js          # Bridge JS pentru OverlayModule
│   ├── services/
│   │   ├── BlockerManager.js         # Manager central logică blocare
│   │   ├── PermissionService.js      # Gestionare permisiuni
│   │   └── StorageService.js         # CRUD reguli în AsyncStorage
│   └── utils/
│       └── timeUtils.js              # Formatare și calcule timp
└── package.json
```

## Permisiuni Android Necesare

| Permisiune | Scop |
|-----------|------|
| `PACKAGE_USAGE_STATS` | Citire statistici utilizare aplicații |
| `SYSTEM_ALERT_WINDOW` | Afișare overlay peste alte aplicații |
| `FOREGROUND_SERVICE` | Rulare serviciu de monitorizare în background |
| `RECEIVE_BOOT_COMPLETED` | Repornire automată serviciu după restart telefon |
