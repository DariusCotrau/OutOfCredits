# Împărțirea Taskurilor - AppBlocker

## Persoana 1: Backend Nativ Android (Java)

Responsabilă pentru tot codul nativ Java care interacționează direct cu API-urile Android.

### Taskuri:

#### 1. Module Native (DONE - bază existentă, de extins)
- [x] `AppUsageModule.java` — interogare UsageStatsManager
- [x] `OverlayModule.java` — permisiune overlay
- [x] `BlockerService.java` — foreground service de monitorizare
- [x] `BlockerServiceModule.java` — bridge RN pentru control service
- [x] `AppBlockerPackage.java` — înregistrare module

#### 2. Îmbunătățiri BlockerService
- [ ] Adăugare suport pentru limite de timp diferite per aplicație (acum e o singură limită globală)
- [ ] Detectare corectă a aplicației din foreground (nu doar aggregate, ci real-time)
- [ ] Gestionare lifecycle corectă (restart după kill, boot completed receiver)
- [ ] Testare pe Android 10, 11, 12, 13, 14 (restricții background diferite)

#### 3. BootReceiver
- [ ] Creare `BootCompletedReceiver.java` care repornește `BlockerService` la boot
- [ ] Înregistrare în AndroidManifest.xml

#### 4. Overlay Avansat
- [ ] Înlocuire TextView simplu cu un layout XML custom pentru overlay
- [ ] Buton "Întoarcere la AppBlocker" pe overlay
- [ ] Animație la apariția overlay-ului

#### 5. Notificări
- [ ] Notificare de avertizare la 80% din limită (per aplicație)
- [ ] Acțiuni pe notificare (extindere limită cu 15 min, deschide AppBlocker)

#### 6. Testare
- [ ] Unit tests pentru logica de monitorizare
- [ ] Testare pe dispozitive reale / emulatoare cu versiuni diferite Android

---

## Persoana 2: Service Layer JavaScript + Logica de Business

Responsabilă pentru toată logica JS: modele, servicii, persistență, utilitare.

### Taskuri:

#### 1. Modele de Date (DONE - bază existentă, de extins)
- [x] `BlockRule.js` — model regulă blocare
- [ ] Adăugare model `UsageRecord.js` — istoric utilizare zilnică
- [ ] Adăugare model `AppProfile.js` — cache info aplicație (nume, icon)

#### 2. Servicii (DONE - bază existentă, de extins)
- [x] `StorageService.js` — CRUD reguli în AsyncStorage
- [x] `BlockerManager.js` — manager central
- [x] `PermissionService.js` — gestionare permisiuni
- [ ] Adăugare `UsageHistoryService.js` — salvare și interogare istoric utilizare
- [ ] Adăugare logică de sincronizare între regulile JS și configurația serviciului nativ

#### 3. Logica de Business Avansată
- [ ] Calcul statistici agregate (timp total blocat, top aplicații, trend zilnic)
- [ ] Logica de grouped rules (ex: "Social Media" = Instagram + TikTok + Facebook)
- [ ] Validare input (limite rezonabile, pachete valide)
- [ ] Migrare date la update versiune aplicație

#### 4. Utilitare
- [x] `timeUtils.js` — formatare timp
- [ ] Adăugare `notificationUtils.js` — helper-e pentru mesaje notificare
- [ ] Adăugare `constants.js` — constante aplicație (limite default, intervale)

#### 5. Bridge-uri Native (DONE)
- [x] `AppUsageBridge.js`
- [x] `OverlayBridge.js`
- [x] `BlockerServiceBridge.js`

#### 6. Testare
- [ ] Unit tests pentru `BlockRule` (createBlockRule, isLimitExceeded, getRemainingTime)
- [ ] Unit tests pentru `StorageService` (mock AsyncStorage)
- [ ] Unit tests pentru `timeUtils`
- [ ] Integration tests pentru `BlockerManager`

---

## Notă

**Frontend-ul (UI/componente React Native) nu este inclus** — va fi realizat după finalizarea backend-ului și a service layer-ului.

### Dependențe între persoane:
- Persoana 2 depinde de Persoana 1 pentru API-urile native (bridge-urile JS reflectă modulele Java)
- Dacă Persoana 1 adaugă o metodă nouă într-un modul Java, Persoana 2 trebuie să actualizeze bridge-ul JS corespunzător
- Comunicare frecventă necesară pentru a menține sincronizarea interfețelor
