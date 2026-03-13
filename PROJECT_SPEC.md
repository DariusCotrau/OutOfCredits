# ChiriiSmart - Centralizator Inteligent de Chirii

O aplicație web care centralizează chiriile disponibile din Timișoara și recomandă cele mai potrivite opțiuni pe baza profilului utilizatorului (locul de muncă, universitate, hobby-uri, mijloc de transport).

## Target Audience

- **Studenți** din Timișoara (UVT, UPT, UMFT) care caută chirii accesibile, aproape de campus
- **Tineri profesioniști** care lucrează în oraș (ex: part-time la Haufe, Continental, etc.)
- **Persoane care se mută** în Timișoara și nu cunosc zonele

### User Persona (Exemplu)
> Student la UVT, lucrează part-time la Haufe, merge la sala Gym One.
> Are/nu are mașină. Buget: 250-350 EUR/lună.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | TypeScript + React |
| Backend | Node.js (Express/Fastify) |
| Database | MySQL |
| Maps | Google Maps API (Directions, Geocoding, Places) |
| Deployment | Netlify (frontend), TBD (backend — Render/Railway/VPS) |
| Auth | Email + Password + Google OAuth |

> **Nota:** Scraper-ul Python existent va fi rescris în Node.js pentru a menține un singur tech stack.

## Desired Features

### Phase 1 — MVP (Core)

#### Data Collection (Scraper Node.js)
- [ ] Rescrierea scraper-ului Imobiliare.ro din Python în Node.js
  - [ ] Extragere aceleași 14 câmpuri: titlu, preț, monedă, nr. camere, suprafață utilă/totală, etaj, tip imobil, an construcție, localitate, zonă, URL
  - [ ] Rate limiting și delay aleatoriu între request-uri
  - [ ] Retry logic cu exponential backoff
  - [ ] User-Agent rotation
- [ ] Stocare date în MySQL
  - [ ] Schema tabel `listings` cu toate câmpurile + timestamps
  - [ ] Deduplicare pe baza URL-ului
- [ ] Rulare periodică (cron job / node-cron) pentru actualizarea datelor
- [ ] Focus doar pe Timișoara (apartamente și garsoniere de închiriat)

#### Backend API (Node.js)
- [ ] `GET /api/listings` — listare anunțuri cu filtre (preț, camere, suprafață, zonă)
- [ ] `GET /api/listings/:id` — detalii anunț
- [ ] `POST /api/profile` — salvare profil utilizator
- [ ] `GET /api/recommendations` — anunțuri recomandate pe baza profilului
- [ ] Paginare și sortare

#### Autentificare
- [ ] Înregistrare cu email + parolă
  - [ ] Validare email
  - [ ] Hashare parolă (bcrypt)
- [ ] Login cu Google OAuth 2.0
- [ ] JWT tokens pentru sesiuni
- [ ] Middleware de protecție rute

#### User Profile & Onboarding
- [ ] Formular de profil cu:
  - [ ] Universitate (selectare din listă: UVT, UPT, UMFT, sau adresă custom)
  - [ ] Loc de muncă (adresă sau selectare din locații cunoscute)
  - [ ] Sală de sport / alte locații frecventate (adresă)
  - [ ] Mijloc de transport: mașină / transport public / bicicletă / pe jos
  - [ ] Buget maxim (EUR/RON)
  - [ ] Preferințe: nr. camere minim, suprafață minimă, etaj preferat
- [ ] Geocodare automată a adreselor introduse (Google Geocoding API)

#### Recommendation Engine
- [ ] Calcul timp de deplasare de la fiecare anunț la locațiile din profil
  - [ ] Google Directions API cu modul de transport corespunzător
  - [ ] Cache rezultate pentru a reduce costurile API
- [ ] Formula de scoring:
  - [ ] `scor = w1 * scor_pret + w2 * scor_distanta + w3 * scor_preferinte`
  - [ ] Ponderi configurabile
- [ ] Sortare anunțuri după scor de compatibilitate

#### Frontend (React + TypeScript)
- [ ] Landing page cu prezentarea aplicației
- [ ] Pagină de înregistrare / login
- [ ] Pagină de profil (onboarding wizard)
- [ ] Pagină de listare anunțuri
  - [ ] Grid/List view cu card-uri
  - [ ] Filtre laterale (preț, camere, suprafață, zonă)
  - [ ] Sortare (preț, scor, distanță, dată)
- [ ] Pagină de detalii anunț
  - [ ] Informații complete
  - [ ] Hartă cu locația
  - [ ] Timp de deplasare la locațiile din profil
- [ ] Pagină de recomandări personalizate

### Phase 2 — Enhanced UX

#### Hartă Interactivă
- [ ] Google Maps embed cu pin-uri pentru fiecare anunț
- [ ] Clustere de pin-uri la zoom out
- [ ] Popup la click cu preview anunț
- [ ] Evidențiere zone recomandate (heat map sau coloring)
- [ ] Afișare rute de la anunț la locațiile din profil

#### Notificări și Alerte
- [ ] Email alert pentru anunțuri noi care se potrivesc profilului
- [ ] Configurare frecvență notificări (instant / zilnic / săptămânal)
- [ ] Alertă zonă de construcții în apropierea unui anunț

#### Surse Adiționale de Date
- [ ] Scraping OLX.ro (secțiunea imobiliare)
- [ ] Scraping Storia.ro
- [ ] Deduplicare cross-platform (anunțuri identice pe mai multe site-uri)

### Phase 3 — Nice to Have

- [ ] Comparare side-by-side a anunțurilor
- [ ] Salvare anunțuri favorite
- [ ] Istoric prețuri (tracking modificări)
- [ ] Review-uri zone / cartiere de la utilizatori
- [ ] Dark mode
- [ ] PWA (Progressive Web App) pentru experiență mobilă
- [ ] Expandare la alte orașe (Cluj-Napoca, București, Iași)

## Design Requests

- [ ] UI modern, clean, responsive (mobile-first)
  - [ ] Design system consistent (culori, fonturi, spacing)
  - [ ] Card-uri cu preview pentru fiecare anunț (imagine placeholder dacă nu e disponibilă)
- [ ] Onboarding wizard intuitiv (3-4 pași)
- [ ] Dashboard clar cu recomandările principale vizibile imediat
- [ ] Hartă vizibilă pe pagina principală de listare

## Database Schema (Draft)

```sql
-- Utilizatori
users (id, email, password_hash, google_id, name, created_at, updated_at)

-- Profile utilizatori
profiles (id, user_id, university, workplace, gym, other_locations JSON,
          transport_mode ENUM('car','public','bike','walk'),
          budget_max, budget_currency, min_rooms, min_area, preferred_floor,
          created_at, updated_at)

-- Anunțuri imobiliare
listings (id, source, source_url, title, price, currency,
          rooms, useful_area_sqm, total_area_sqm, floor,
          building_type, year_built, city, zone,
          latitude, longitude,
          first_seen_at, last_seen_at, is_active,
          created_at, updated_at)

-- Cache distanțe
distance_cache (id, listing_id, destination_lat, destination_lng,
                transport_mode, duration_seconds, distance_meters,
                calculated_at)
```

## Project Structure (Proposed)

```
/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/       # API client
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── scraper/        # Node.js scraper (rewrite)
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── migrations/
└── README.md
```

## Other Notes

- **Google Maps API costs**: Implementare cache agresiv pentru Directions API (costă $5/1000 request-uri). Recalculare doar când apare un anunț nou sau se modifică profilul.
- **Legal**: Respectarea `robots.txt` și Terms of Service ale site-urilor de imobiliare. Rate limiting generos.
- **GDPR**: Datele utilizatorilor stocate conform GDPR (drept de ștergere, export date).
- **Timișoara focus**: Început cu date POI (Points of Interest) pre-populate pentru UVT, UPT, UMFT, Haufe, Gym One, etc.
