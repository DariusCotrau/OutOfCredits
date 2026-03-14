# ChiriiSmart — Technical Specification

---

## 1. Planning & Discovery

### 1.1 Core Purpose & Success

* **Mission Statement**: Centralizăm chiriile din Timișoara și recomandăm opțiunea optimă pe baza stilului de viață al utilizatorului.
* **Core Purpose & Goals**: Studenții și tinerii profesioniști din Timișoara pierd ore căutând chirii pe multiple platforme, fără a putea evalua rapid proximitatea față de universitate, job sau sală. ChiriiSmart agregă automat anunțurile și le scorează pe baza profilului personal — transformând o căutare de zile în minute.
* **Success Indicators**:
  * ≥ 200 anunțuri active indexate din Timișoara în prima lună
  * ≥ 50 utilizatori înregistrați în primele 2 luni
  * Timp mediu de la onboarding la prima recomandare < 3 minute
  * Rata de revenire (utilizatori care revin în 7 zile) ≥ 40%
* **Experience Qualities**: **Rapid**, **Personalizat**, **Clar**

### 1.2 Project Classification & Approach

* **Complexity Level**: Complex App (scraper + API + auth + maps + recommendation engine + frontend SPA)
* **Primary User Activity**: Acting (utilizatorul vine cu un scop clar: găsește-mi chiria potrivită)
* **Primary Use Cases**:
  1. Utilizatorul completează profilul (universitate, job, sală, buget, transport) → primește lista de chirii scorată
  2. Utilizatorul filtrează și sortează anunțuri după preț, nr. camere, zonă, scor
  3. Utilizatorul deschide detaliile unui anunț → vede harta, timpii de deplasare, scorul detaliat
  4. Utilizatorul primește alerte când apar chirii noi potrivite (Phase 2)

### 1.3 Feature-Selection Rationale

* **Core Problem Analysis**: Piața chiriilor din Timișoara este fragmentată pe 3+ platforme (Imobiliare.ro, OLX, Storia). Niciuna nu oferă scoring personalizat pe baza locațiilor frecventate. Rezultat: utilizatorul deschide 50+ tab-uri și calculează manual distanțele.
* **User Context**: Utilizatorii caută chirii în perioadele august–octombrie (început an universitar) și ianuarie–februarie. Folosesc telefonul (60%+) sau laptopul. Sesiuni scurte (5-15 min), repetate pe parcursul a 1-4 săptămâni.
* **Critical Path**: Landing → Register/Login → Completare Profil (wizard 4 pași) → Vezi Recomandări → Deschide Detalii Anunț
* **Key Moments**:
  1. **Primul scor de recomandare** — utilizatorul vede "93% compatibil" și înțelege imediat de ce
  2. **Compararea timpilor de deplasare** — "12 min cu tramvaiul la UPT, 8 min pe jos la Haufe"
  3. **Filtrul inteligent** — schimbă bugetul și lista se reordonează instant

### 1.4 High-Level Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                     │
│  Netlify CDN — TypeScript, React 18, TanStack Query, Zustand │
└──────────────────┬───────────────────────────────────────────┘
                   │ HTTPS (REST JSON)
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                   SERVER (NestJS + TypeScript)                │
│              Render / Railway / VPS (Docker)                  │
│                                                              │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │  Auth    │ │ Listings │ │ Recommend.   │ │  Scraper    │ │
│  │ Module  │ │  Module   │ │   Module     │ │  Module     │ │
│  └────┬────┘ └─────┬────┘ └──────┬───────┘ └──────┬──────┘ │
│       │            │             │                  │        │
│       ▼            ▼             ▼                  ▼        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │             TypeORM  —  MySQL 8.0                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              ▼                               │
│                 ┌──────────────────────┐                     │
│                 │   Google Maps API    │                     │
│                 │  (Directions,        │                     │
│                 │   Geocoding, Places) │                     │
│                 └──────────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
                              │
                   ┌──────────┴──────────┐
                   │  Imobiliare.ro      │
                   │  (web scraping)     │
                   └─────────────────────┘
```

### 1.5 Essential Features

#### F1: Scraper Node.js (Imobiliare.ro)
* **Functionality**: Scrapează periodic anunțurile de închiriere din Timișoara, parsează 14 câmpuri, stochează în MySQL cu deduplicare pe URL.
* **Purpose**: Sursa primară de date — fără scraper nu există anunțuri de recomandat.
* **Validation**: ≥ 100 anunțuri importate corect; prețul, nr. camere, zona extrase cu acuratețe ≥ 90%; cron rulează fără erori 7 zile consecutiv.

#### F2: Autentificare (JWT + Google OAuth)
* **Functionality**: Register/Login cu email+parolă (bcrypt) sau Google OAuth 2.0. JWT access + refresh tokens. Middleware guard pe rute protejate.
* **Purpose**: Profilul și recomandările sunt personalizate — necesită cont.
* **Validation**: Register → Login → Access rute protejate → Refresh token → Logout funcționează end-to-end. Google OAuth redirect flow complet.

#### F3: Profil Utilizator & Onboarding
* **Functionality**: Wizard în 4 pași: (1) Locații frecventate, (2) Transport, (3) Buget, (4) Preferințe locuință. Geocodare automată cu Google Geocoding API.
* **Purpose**: Profilul alimentează engine-ul de recomandări.
* **Validation**: Toate câmpurile se salvează corect; adresele se geocodează în coordonate valide; profilul incomplet blochează accesul la recomandări.

#### F4: Recommendation Engine
* **Functionality**: Calculează scor de compatibilitate (0-100) pentru fiecare anunț pe baza: (1) proximitate la locații din profil, (2) încadrare în buget, (3) potrivire preferințe (camere, suprafață, etaj). Formula: `score = w1*price_score + w2*distance_score + w3*preference_score`.
* **Purpose**: Diferențiatorul principal al aplicației — recomandări personalizate, nu doar listare.
* **Validation**: Un anunț mai ieftin, mai aproape de universitate și de job primește scor mai mare; modificarea profilului reordonează lista; cache-ul de distanțe reduce apelurile Google Maps cu ≥ 80%.

#### F5: Frontend React
* **Functionality**: SPA responsive cu: landing page, auth pages, onboarding wizard, listings grid cu filtre și sortare, pagină detalii cu hartă și timpi deplasare, pagină recomandări.
* **Purpose**: Interfața prin care utilizatorul interacționează cu toată logica de backend.
* **Validation**: Responsive pe mobile/desktop; navigare completă fără erori; loading states, error states, empty states implementate.

---

## 2. System Architecture & Technology

### 2.1 Tech Stack

| Layer | Technology | Motivare |
|-------|-----------|----------|
| **Language** | TypeScript 5.x | Type safety full-stack, un singur limbaj |
| **Frontend Framework** | React 18 | Ecosistem matur, componente refolosibile |
| **Frontend Build** | Vite 5 | HMR rapid, build optimizat |
| **State Management** | Zustand | Lightweight, fără boilerplate Redux |
| **Data Fetching** | TanStack Query (React Query) v5 | Cache automat, retry, stale-while-revalidate |
| **CSS** | Tailwind CSS 3 | Utility-first, rapid de prototipat |
| **Component Library** | Shadcn/ui | Componente accesibile, customizabile |
| **Backend Framework** | NestJS 10 | Modular, TypeScript-first, DI, guards, pipes |
| **ORM** | TypeORM 0.3 | Decoratori, migrări, suport MySQL nativ |
| **Database** | MySQL 8.0 | Schema relațională, performant pentru query-uri cu filtre |
| **Auth** | Passport.js (@nestjs/passport) | Strategii JWT + Google OAuth |
| **Scraping** | Cheerio + Axios (Node.js) | Parsing HTML rapid, fără browser headless |
| **Scheduled Jobs** | @nestjs/schedule (cron) | Integrat nativ în NestJS |
| **Maps** | Google Maps JavaScript API + APIs REST | Directions, Geocoding, Places |
| **Validation** | class-validator + class-transformer | Validare automată pe DTOs cu decoratori |
| **Hosting Frontend** | Netlify | CDN global, deploy automat din Git |
| **Hosting Backend** | Render / Railway | Container Docker, free tier disponibil |
| **CI/CD** | GitHub Actions | Build, lint, test automat la push |
| **Containerization** | Docker + Docker Compose | Mediu consistent local și producție |

### 2.2 Project Structure

```
/
├── client/                          # React SPA
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Imagini, fonturi
│   │   ├── components/
│   │   │   ├── ui/                  # Shadcn components (Button, Input, Card...)
│   │   │   ├── layout/             # Header, Footer, Sidebar, Layout
│   │   │   ├── listings/           # ListingCard, ListingGrid, ListingFilters
│   │   │   ├── auth/               # LoginForm, RegisterForm, GoogleButton
│   │   │   ├── profile/            # OnboardingWizard, ProfileForm
│   │   │   └── maps/               # MapView, MapMarker, RouteInfo
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Listings.tsx
│   │   │   ├── ListingDetail.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   └── Profile.tsx
│   │   ├── hooks/                   # useAuth, useListings, useRecommendations
│   │   ├── services/               # API client (axios instance)
│   │   ├── stores/                 # Zustand stores (authStore, filterStore)
│   │   ├── types/                  # Shared TypeScript interfaces
│   │   ├── lib/                    # Utilities, constants
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── server/                          # NestJS Backend
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── google-auth.guard.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── profiles/
│   │   │   ├── profiles.module.ts
│   │   │   ├── profiles.controller.ts
│   │   │   ├── profiles.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-profile.dto.ts
│   │   │   │   └── update-profile.dto.ts
│   │   │   └── entities/
│   │   │       └── profile.entity.ts
│   │   │
│   │   ├── listings/
│   │   │   ├── listings.module.ts
│   │   │   ├── listings.controller.ts
│   │   │   ├── listings.service.ts
│   │   │   ├── dto/
│   │   │   │   └── filter-listings.dto.ts
│   │   │   └── entities/
│   │   │       └── listing.entity.ts
│   │   │
│   │   ├── recommendations/
│   │   │   ├── recommendations.module.ts
│   │   │   ├── recommendations.controller.ts
│   │   │   ├── recommendations.service.ts
│   │   │   └── dto/
│   │   │       └── recommendation-response.dto.ts
│   │   │
│   │   ├── scraper/
│   │   │   ├── scraper.module.ts
│   │   │   ├── scraper.service.ts       # Orchestrează scraping-ul
│   │   │   ├── scraper.scheduler.ts     # Cron job scheduling
│   │   │   ├── parsers/
│   │   │   │   └── imobiliare.parser.ts # Parser Imobiliare.ro
│   │   │   └── dto/
│   │   │       └── scraped-listing.dto.ts
│   │   │
│   │   ├── maps/
│   │   │   ├── maps.module.ts
│   │   │   ├── maps.service.ts          # Google Maps API wrapper
│   │   │   └── entities/
│   │   │       └── distance-cache.entity.ts
│   │   │
│   │   ├── common/
│   │   │   ├── decorators/              # @CurrentUser, etc.
│   │   │   ├── interceptors/            # TransformInterceptor
│   │   │   ├── filters/                 # HttpExceptionFilter
│   │   │   └── pipes/                   # ValidationPipe config
│   │   │
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── google.config.ts
│   │   │   └── scraper.config.ts
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── package.json
│
├── database/
│   └── migrations/                  # TypeORM migrations
│
├── docker-compose.yml               # MySQL + Backend dev
├── Dockerfile                       # Backend production
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Lint + Test
│       └── deploy.yml               # Deploy backend
├── .env.example
├── .gitignore
├── PROJECT_SPEC.md
├── TECHNICAL_SPEC.md
└── README.md
```

### 2.3 Component Architecture

#### Server / Backend (NestJS)

**Framework**: NestJS 10 cu Express adapter (default), structurat pe module.

**Domain Entities** (TypeORM):

```typescript
// user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  googleId: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;
}

// listing.entity.ts
@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'imobiliare' })
  source: string;

  @Column({ unique: true })
  sourceUrl: string;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ nullable: true })
  rooms: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  usefulAreaSqm: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  totalAreaSqm: number;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  buildingType: string;

  @Column({ nullable: true })
  yearBuilt: number;

  @Column({ default: 'Timișoara' })
  city: string;

  @Column({ nullable: true })
  zone: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column()
  firstSeenAt: Date;

  @Column()
  lastSeenAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Error Handling**: Global `HttpExceptionFilter` care formatează toate erorile ca:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["price must be a positive number"],
  "timestamp": "2026-03-13T10:00:00.000Z"
}
```

#### Client / Frontend (React)

**State Management** — Zustand stores:
| Store | Scope | Persisted |
|-------|-------|-----------|
| `authStore` | user, token, isAuthenticated, login(), logout() | Da (localStorage) |
| `filterStore` | priceRange, rooms, zone, sortBy, sortOrder | Da (URL params) |

**Data Fetching** — TanStack Query:
| Hook | Endpoint | Stale Time | Cache Time |
|------|----------|-----------|-----------|
| `useListings(filters)` | `GET /api/listings` | 2 min | 10 min |
| `useListing(id)` | `GET /api/listings/:id` | 5 min | 30 min |
| `useRecommendations()` | `GET /api/recommendations` | 1 min | 5 min |
| `useProfile()` | `GET /api/profile` | 10 min | 30 min |

**Routing** (React Router v6):
| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | Landing | Nu |
| `/login` | Login | Nu |
| `/register` | Register | Nu |
| `/auth/google/callback` | GoogleCallback | Nu |
| `/onboarding` | Onboarding | Da |
| `/listings` | Listings | Nu (dar recomandări necesită auth) |
| `/listings/:id` | ListingDetail | Nu |
| `/recommendations` | Recommendations | Da |
| `/profile` | Profile | Da |

**Type Definitions** — Shared interfaces:
```typescript
// types/listing.ts
export interface Listing {
  id: number;
  source: string;
  sourceUrl: string;
  title: string;
  price: number;
  currency: 'EUR' | 'RON';
  rooms: number | null;
  usefulAreaSqm: number | null;
  totalAreaSqm: number | null;
  floor: string | null;
  buildingType: string | null;
  yearBuilt: number | null;
  city: string;
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
}

// types/recommendation.ts
export interface RecommendedListing extends Listing {
  score: number;          // 0-100
  priceScore: number;     // 0-100
  distanceScore: number;  // 0-100
  preferenceScore: number; // 0-100
  travelTimes: TravelTime[];
}

export interface TravelTime {
  destinationName: string;  // "UPT", "Haufe", "Gym One"
  durationSeconds: number;
  distanceMeters: number;
  transportMode: TransportMode;
}

export type TransportMode = 'car' | 'public' | 'bike' | 'walk';
```

### 2.4 Data Flow & Real-Time

**Request/Response Lifecycle**:
```
React Component
  → TanStack Query hook (useListings)
    → Axios instance (with JWT interceptor)
      → NestJS Controller (@Get)
        → NestJS Service (business logic)
          → TypeORM Repository (SQL query)
        ← DTO response (class-transformer)
      ← JSON response
    ← Cache update + UI re-render
  ← Component displays data
```

**JWT Interceptor** (Axios):
```typescript
// Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Real-Time**: Nu este necesar pentru MVP. Phase 2 va folosi SSE (Server-Sent Events) pentru notificări de anunțuri noi.

---

## 3. Database & Server Logic

### 3.1 Database Schema

```sql
-- =============================================
-- ChiriiSmart Database Schema — MySQL 8.0
-- =============================================

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,                   -- NULL dacă Google OAuth
  google_id     VARCHAR(255) NULL UNIQUE,
  name          VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_google_id (google_id)
);

CREATE TABLE profiles (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE,
  -- Locații (stocate ca adresă text + coordonate geocodate)
  university       VARCHAR(255) NULL,
  university_lat   DECIMAL(10, 7) NULL,
  university_lng   DECIMAL(10, 7) NULL,
  workplace        VARCHAR(255) NULL,
  workplace_lat    DECIMAL(10, 7) NULL,
  workplace_lng    DECIMAL(10, 7) NULL,
  gym              VARCHAR(255) NULL,
  gym_lat          DECIMAL(10, 7) NULL,
  gym_lng          DECIMAL(10, 7) NULL,
  other_locations  JSON NULL,                        -- [{name, address, lat, lng}]
  -- Preferințe
  transport_mode   ENUM('car', 'public', 'bike', 'walk') DEFAULT 'public',
  budget_max       DECIMAL(10, 2) NULL,
  budget_currency  ENUM('EUR', 'RON') DEFAULT 'EUR',
  min_rooms        TINYINT NULL,
  min_area         DECIMAL(8, 2) NULL,
  preferred_floor  VARCHAR(10) NULL,                 -- "1-4", "parter", "orice"
  -- Metadata
  is_complete      BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

CREATE TABLE listings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  source           VARCHAR(50) NOT NULL DEFAULT 'imobiliare',
  source_url       VARCHAR(512) NOT NULL UNIQUE,
  title            VARCHAR(512) NOT NULL,
  price            DECIMAL(10, 2) NULL,
  currency         VARCHAR(5) DEFAULT 'EUR',
  rooms            TINYINT NULL,
  useful_area_sqm  DECIMAL(8, 2) NULL,
  total_area_sqm   DECIMAL(8, 2) NULL,
  floor            VARCHAR(10) NULL,
  building_type    VARCHAR(50) NULL,
  year_built       SMALLINT NULL,
  city             VARCHAR(100) DEFAULT 'Timișoara',
  zone             VARCHAR(255) NULL,
  latitude         DECIMAL(10, 7) NULL,
  longitude        DECIMAL(10, 7) NULL,
  first_seen_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_source_url (source_url),
  INDEX idx_city_active (city, is_active),
  INDEX idx_price (price),
  INDEX idx_rooms (rooms),
  INDEX idx_zone (zone),
  INDEX idx_last_seen (last_seen_at)
);

CREATE TABLE distance_cache (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  listing_id       INT NOT NULL,
  destination_lat  DECIMAL(10, 7) NOT NULL,
  destination_lng  DECIMAL(10, 7) NOT NULL,
  transport_mode   ENUM('car', 'public', 'bike', 'walk') NOT NULL,
  duration_seconds INT NOT NULL,
  distance_meters  INT NOT NULL,
  calculated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE KEY uk_listing_dest_mode (listing_id, destination_lat, destination_lng, transport_mode),
  INDEX idx_listing_id (listing_id)
);

CREATE TABLE refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token       VARCHAR(512) NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id)
);
```

**Relationships**:
* `users` 1:1 `profiles` (un utilizator are exact un profil)
* `listings` 1:N `distance_cache` (un anunț poate avea multiple cache-uri de distanță)
* `users` 1:N `refresh_tokens` (un utilizator poate avea mai multe sesiuni)

**Migration Strategy**: TypeORM migrations (`typeorm migration:generate`, `typeorm migration:run`). Fiecare modificare de schemă = o migrare nouă, comisă în Git, rulată automat la deploy.

### 3.2 Server Actions

#### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | Nu | Înregistrare email+parolă |
| `POST` | `/api/auth/login` | Nu | Login email+parolă → JWT |
| `GET` | `/api/auth/google` | Nu | Redirect Google OAuth |
| `GET` | `/api/auth/google/callback` | Nu | Google OAuth callback → JWT |
| `POST` | `/api/auth/refresh` | Nu | Refresh access token |
| `POST` | `/api/auth/logout` | Da | Invalidare refresh token |
| `GET` | `/api/users/me` | Da | Date utilizator curent |
| `GET` | `/api/profile` | Da | Profil utilizator curent |
| `POST` | `/api/profile` | Da | Creare profil |
| `PATCH` | `/api/profile` | Da | Actualizare profil |
| `GET` | `/api/listings` | Nu | Listare anunțuri cu filtre |
| `GET` | `/api/listings/:id` | Nu | Detalii anunț |
| `GET` | `/api/recommendations` | Da | Recomandări personalizate |
| `POST` | `/api/geocode` | Da | Geocodare adresă → coordonate |

#### Endpoint Details

**`GET /api/listings`** — Query params:
```
?page=1
&limit=20
&minPrice=200
&maxPrice=400
&currency=EUR
&minRooms=1
&maxRooms=3
&zone=Lipovei
&minArea=30
&sortBy=price|rooms|area|createdAt
&sortOrder=ASC|DESC
```

Response:
```json
{
  "data": [Listing],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

**`GET /api/recommendations`** — Query params: `?page=1&limit=20`

Response:
```json
{
  "data": [
    {
      ...listing,
      "score": 93,
      "priceScore": 85,
      "distanceScore": 98,
      "preferenceScore": 95,
      "travelTimes": [
        {
          "destinationName": "UPT",
          "durationSeconds": 720,
          "distanceMeters": 2100,
          "transportMode": "public"
        }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 87 }
}
```

**`POST /api/auth/register`** — Body:
```json
{
  "email": "student@e-uvt.ro",
  "password": "SecureP4ss!",
  "name": "Ion Popescu"
}
```
Validation: email valid, password ≥ 8 chars cu cel puțin o literă mare + o cifră, name 2-100 chars.

#### Background Jobs (Scraper)

```typescript
// scraper.scheduler.ts
@Injectable()
export class ScraperScheduler {

  @Cron(CronExpression.EVERY_6_HOURS)  // Rulează la 00:00, 06:00, 12:00, 18:00
  async scrapeImobiliare() {
    // 1. Scrapează apartamente-inchiriere / timisoara
    // 2. Scrapează garsoniere-inchiriere / timisoara
    // 3. Upsert în listings (deduplicare pe source_url)
    // 4. Marchează anunțurile nevăzute > 7 zile ca is_active=false
    // 5. Geocodare anunțuri noi (zone → coordonate via Google Geocoding)
  }
}
```

#### External API Integrations

**Google Maps APIs**:
| API | Scop | Cost | Cache Strategy |
|-----|------|------|----------------|
| Geocoding | Adresă → lat/lng (profil + anunțuri) | $5/1000 req | Permanent (adresele nu se mișcă) |
| Directions | Rute + timp deplasare | $5-10/1000 req | `distance_cache` table, TTL 30 zile |
| Places Autocomplete | Autocomplete adrese în profil | $2.83/1000 req | Session tokens (reduce costs) |

**Maps Service** — Cache-first:
```typescript
async getTravelTime(
  listingId: number,
  destLat: number,
  destLng: number,
  mode: TransportMode
): Promise<{ durationSeconds: number; distanceMeters: number }> {
  // 1. Check distance_cache table
  const cached = await this.distanceCacheRepo.findOne({
    where: { listingId, destinationLat: destLat, destinationLng: destLng, transportMode: mode }
  });
  if (cached && dayjs().diff(cached.calculatedAt, 'day') < 30) {
    return { durationSeconds: cached.durationSeconds, distanceMeters: cached.distanceMeters };
  }

  // 2. Call Google Directions API
  const result = await this.googleMapsClient.directions({ origin, destination, mode });

  // 3. Save to cache
  await this.distanceCacheRepo.upsert({ listingId, destLat, destLng, mode, ...result });

  return result;
}
```

---

## 4. Feature Specifications

### Feature 1: Scraper Imobiliare.ro (Node.js Rewrite)

**User Story**: Ca administrator, vreau ca aplicația să colecteze automat anunțurile de închiriere din Timișoara pentru a avea date actualizate fără intervenție manuală.

**Implementation**:
1. `ScraperService` — Orchestrare:
   - Folosește Axios cu headers din config (User-Agent rotation cu 5+ user agents)
   - Delay aleatoriu 2-5s între request-uri
   - Retry cu exponential backoff (3 încercări)
   - Parsează HTML cu Cheerio (echivalent BeautifulSoup)
2. `ImobiliareParser` — Extragere date:
   - Portează logica din `parser.py` existentă (aceleași selectoare CSS, fallback-uri, regex)
   - Extrage 14 câmpuri: titlu, preț, monedă, camere, suprafață utilă/totală, etaj, tip, an, localitate, zonă, URL
3. `ScraperScheduler` — Cron:
   - Rulează la fiecare 6 ore
   - Scrapează `apartamente-inchiriere` + `garsoniere-inchiriere` din Timișoara
   - Upsert pe `source_url` (insert dacă nou, update `last_seen_at` dacă existent)
   - Anunțuri nevăzute > 7 zile → `is_active = false`

**Edge Cases**:
- Site-ul schimbă structura HTML → selectoare multiple cu fallback (ca în parser.py)
- Rate limiting / IP block → delay generos + retry + logging
- Anunț fără preț → se salvează cu `price = NULL`, exclus din recomandări
- Caractere speciale în zona/titlu → sanitizare cu `he` library

**Validation**: Test automat care parsează un HTML snapshot salvat local → verifică extragerea celor 14 câmpuri.

---

### Feature 2: Autentificare

**User Story**: Ca utilizator, vreau să mă înregistrez cu email sau Google pentru a-mi salva profilul și a primi recomandări personalizate.

**Implementation**:

**Register flow**:
```
Client POST /api/auth/register { email, password, name }
  → Validate DTO (class-validator)
  → Check email uniqueness
  → Hash password (bcrypt, 12 rounds)
  → Insert user
  → Generate JWT access token (15 min) + refresh token (7 zile)
  → Return { accessToken, refreshToken, user }
```

**Google OAuth flow**:
```
Client GET /api/auth/google
  → Redirect to Google consent screen
  → User approves
  → Google redirects to /api/auth/google/callback?code=xxx
  → Exchange code for Google profile
  → Find or create user (match by google_id or email)
  → Generate JWT tokens
  → Redirect to client with tokens in URL fragment
```

**Token refresh**:
```
Client POST /api/auth/refresh { refreshToken }
  → Validate refresh token exists in DB + not expired
  → Generate new access token
  → Optionally rotate refresh token
  → Return { accessToken, refreshToken? }
```

**Edge Cases**:
- Email deja înregistrat cu Google → se face legătura (link accounts)
- Refresh token expirat → 401 → client redirect la login
- Password brute force → rate limiting cu `@nestjs/throttler` (5 încercări / minut)

---

### Feature 3: Profil & Onboarding

**User Story**: Ca utilizator nou, vreau să îmi completez profilul în pași simpli pentru a primi recomandări relevante.

**Implementation** — Wizard 4 Steps:

| Step | Câmpuri | Validare |
|------|---------|----------|
| 1. Locații | Universitate (dropdown: UVT/UPT/UMFT/custom), Loc de muncă (input + autocomplete), Sală (input + autocomplete) | Cel puțin o locație |
| 2. Transport | Selectare mijloc transport (car/public/bike/walk) cu icons | Obligatoriu |
| 3. Buget | Buget maxim (slider + input), Monedă (EUR/RON toggle) | Buget > 0 |
| 4. Preferințe | Nr. camere minim (1-5), Suprafață minimă (mp slider), Etaj preferat (dropdown) | Opționale |

**Geocoding**: La salvarea profilului, adresele text se convertesc în coordonate via Google Geocoding API. Locații pre-definite (UVT, UPT, UMFT, Haufe, Gym One) au coordonatele hardcodate pentru a economisi API calls.

**Pre-defined locations** (seed data):
```typescript
const KNOWN_LOCATIONS = {
  'UVT': { lat: 45.7472, lng: 21.2266, name: 'Universitatea de Vest din Timișoara' },
  'UPT': { lat: 45.7474, lng: 21.2262, name: 'Universitatea Politehnica Timișoara' },
  'UMFT': { lat: 45.7523, lng: 21.2289, name: 'Universitatea de Medicină și Farmacie' },
  'Haufe': { lat: 45.7597, lng: 21.2297, name: 'Haufe Group Timișoara' },
  'Gym One': { lat: 45.7601, lng: 21.2361, name: 'Gym One Timișoara' },
};
```

---

### Feature 4: Recommendation Engine

**User Story**: Ca utilizator cu profil complet, vreau să văd anunțurile ordonate după cât de bine se potrivesc stilului meu de viață.

**Scoring Formula**:
```
total_score = w_price * price_score + w_distance * distance_score + w_pref * preference_score

Default weights: w_price = 0.35, w_distance = 0.45, w_pref = 0.20
```

**Price Score** (0-100):
```
Dacă price <= budget: price_score = 100 - (price / budget) * 50
  → Anunț la 200 EUR cu buget 400 EUR → 100 - 25 = 75
  → Anunț la 350 EUR cu buget 400 EUR → 100 - 43.75 = 56.25
Dacă price > budget: price_score = max(0, 50 - (price - budget) / budget * 100)
  → Anunț la 450 EUR cu buget 400 EUR → max(0, 50 - 12.5) = 37.5
  → Anunț la 600 EUR cu buget 400 EUR → max(0, 50 - 50) = 0
```

**Distance Score** (0-100):
```
Se calculează media timpilor de deplasare la locațiile din profil.
avg_minutes = sum(travel_times) / num_locations
distance_score = max(0, 100 - avg_minutes * 2)
  → 5 min medie → 90
  → 15 min medie → 70
  → 30 min medie → 40
  → 50+ min medie → 0
```

**Preference Score** (0-100):
```
Se acumulează puncte din 100 pe baza match-urilor:
- Rooms match (>= min_rooms): +40
- Area match (>= min_area): +35
- Floor match: +25
Dacă preferința nu e setată, punctele se redistribuie.
```

**Edge Cases**:
- Utilizator fără profil complet → returnează listings sortate după preț (no score)
- Anunț fără preț → exclus din recomandări
- Anunț fără coordonate → exclus din distance scoring, dar inclus cu distance_score = 50
- Google Maps API down → folosește cache existent, scor distanță = 50 dacă nu există cache

---

### Feature 5: Frontend — Listings Page

**User Story**: Ca utilizator, vreau să văd toate anunțurile disponibile cu filtre și sortare pentru a găsi rapid ce mă interesează.

**Implementation**:

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Header (logo, nav, user menu)                  │
├──────────┬──────────────────────────────────────┤
│ Filters  │  Sort bar: [Preț ▼] [Camere] [Scor] │
│ sidebar  │──────────────────────────────────────│
│          │  ┌──────┐ ┌──────┐ ┌──────┐         │
│ Preț:    │  │Card 1│ │Card 2│ │Card 3│         │
│ [200-500]│  └──────┘ └──────┘ └──────┘         │
│          │  ┌──────┐ ┌──────┐ ┌──────┐         │
│ Camere:  │  │Card 4│ │Card 5│ │Card 6│         │
│ [1] [2]  │  └──────┘ └──────┘ └──────┘         │
│          │                                      │
│ Zonă:    │  [1] [2] [3] ... [8]  Pagination     │
│ [▼ Sel.] │                                      │
├──────────┴──────────────────────────────────────┤
│  Footer                                         │
└─────────────────────────────────────────────────┘
```

**Listing Card**:
```
┌──────────────────────────────┐
│  [Img placeholder / zone]    │
│──────────────────────────────│
│  2 camere • 54 mp • Et. 3   │
│  Zona Lipovei                │
│  350 EUR/lună                │
│  ────────────                │
│  Score: ████████░░ 82%       │
│  🕐 12 min → UPT             │
│  [Vezi detalii →]            │
└──────────────────────────────┘
```

**Mobile**: Sidebar collapses to bottom sheet filter. Grid → single column. Cards fullwidth.

---

## 5. Design System

### 5.1 Visual Tone & Identity

* **Branding**: "ChiriiSmart" — inteligent, accesibil, local. Logo: stilizat cu pin de locație + casă.
* **Emotional Response**: Încredere, claritate, eficiență — utilizatorul trebuie să simtă că economisește timp.
* **Design Personality**: Modern-profesional cu accente prietenoase. Nu corporatist, nu copilăresc.
* **Visual Metaphors**: Pin de hartă, casă, busolă, scor/gauge.
* **Simplicity Spectrum**: Interface mediu-simplă. Dense information dar bine organizată (card-uri, not tables).

### 5.2 Color Strategy

* **Color Scheme**: Complementar (albastru-verde principal cu accente calde)
* **Primary**: `#2563EB` (Blue 600) — încredere, profesionalism, tech
* **Secondary**: `#10B981` (Emerald 500) — succes, pozitiv, "match bun"
* **Accent**: `#F59E0B` (Amber 500) — atenție, CTA-uri, scoruri
* **Error**: `#EF4444` (Red 500) — erori, anunțuri expirate
* **Neutrals**: Slate scale (`#0F172A` text, `#F8FAFC` bg, `#E2E8F0` borders)
* **Color Accessibility**: Toate combinațiile text/background respectă WCAG AA (contrast ≥ 4.5:1)
* **Dark Mode**: Pregătit în Tailwind config, implementat în Phase 3

### 5.3 Typography System

* **Headings**: Inter (Google Fonts) — geometric, modern, excelent pe ecrane
* **Body**: Inter — consistent, lizibil la orice dimensiune
* **Monospace**: JetBrains Mono — pentru prețuri și cifre (opțional)
* **Scale**: Tailwind default: `text-sm` (14px), `text-base` (16px body), `text-lg` (18px), `text-xl`–`text-4xl` (headings)
* **Line height**: 1.5 body, 1.2 headings
* **Font weights**: 400 (body), 500 (labels), 600 (subheadings), 700 (headings)

### 5.4 Visual Hierarchy & Layout

* **Grid**: 12-column CSS grid (Tailwind). Content max-width: `max-w-7xl` (1280px). Padding: `px-4` mobile, `px-8` desktop.
* **Spacing scale**: Tailwind 4px base: `space-1` (4px), `space-2` (8px), `space-4` (16px), `space-6` (24px), `space-8` (32px)
* **Breakpoints**: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
* **Responsive approach**: Mobile-first. Sidebar filters → bottom sheet sub 768px. Grid 3col → 2col → 1col.
* **White space**: Generos între secțiuni (`py-8`–`py-16`). Card-uri cu `p-4`–`p-6`.

### 5.5 Animations

* **Page transitions**: Fade in subtil (`opacity 0→1, 150ms ease-out`)
* **Card hover**: Scale subtil (`scale-[1.02]`) + shadow upgrade (`shadow-md → shadow-lg`)
* **Loading**: Skeleton screens (Shadcn Skeleton) nu spinners
* **Score bar**: Fill animation la render (`width 0% → N%, 600ms ease-out`)
* **Filters**: Slide in/out smooth pentru sidebar mobile

### 5.6 UI Elements & Components (Shadcn/ui)

| Component | Usage |
|-----------|-------|
| `Button` | Primary (blue), Secondary (outline), Ghost (text) |
| `Input` | Text fields, price inputs |
| `Select` | Zone, rooms, sort dropdowns |
| `Slider` | Price range, area range |
| `Card` | Listing cards, stat cards |
| `Dialog` | Confirmări, detalii rapide |
| `Tabs` | Grid/List view toggle |
| `Badge` | "Nou", "Scor 90+", zone tags |
| `Skeleton` | Loading states |
| `Toast` | Notificări success/error |
| `Avatar` | User menu |
| `Pagination` | Listings navigation |

**Component States**:
- Hover: `bg-blue-50` highlight
- Focus: `ring-2 ring-blue-500 ring-offset-2`
- Disabled: `opacity-50 cursor-not-allowed`
- Error: `border-red-500 text-red-600`
- Loading: Skeleton pulse animation

### 5.7 Visual Consistency Framework

* **Approach**: Component-based design system. Toate componentele derivă din Shadcn/ui cu Tailwind overrides.
* **Border radius**: `rounded-lg` (8px) consistent peste tot
* **Shadows**: `shadow-sm` (cards), `shadow-md` (hover), `shadow-lg` (modals)
* **Iconografie**: Lucide React (vine cu Shadcn) — outlined, 24px default

### 5.8 Accessibility & Readability

* **WCAG AA compliance** pe toate contrastele text/background
* **ARIA labels** pe butoane icon-only, navigare, și formulare
* **Keyboard navigation**: Tab order logic, focus visible, Escape pentru modals
* **Screen reader**: Alt text pe imagini, aria-live pentru loading states
* **Reduced motion**: `prefers-reduced-motion` → dezactivează animațiile

---

## 6. Security & Compliance

* **Data in Transit**: HTTPS enforced (Netlify + Render default). HSTS headers.
* **Data at Rest**: Parole hashate cu bcrypt (12 rounds). MySQL connection over TLS.
* **JWT Security**:
  - Access token: 15 minute TTL, stocat în memorie (nu localStorage)
  - Refresh token: 7 zile TTL, stocat în httpOnly cookie
  - Token rotation la fiecare refresh
* **Rate Limiting**: `@nestjs/throttler` — 100 req/min global, 5 req/min pe /auth/login
* **Input Validation**: `class-validator` pe toate DTO-urile. Sanitizare HTML input.
* **SQL Injection**: Protecție nativă prin TypeORM parametrized queries.
* **XSS**: React escaping default + Content-Security-Policy headers.
* **CORS**: Whitelist doar domeniul frontend-ului.
* **GDPR**:
  - Endpoint `DELETE /api/users/me` — ștergere completă cont + profil + date asociate
  - Endpoint `GET /api/users/me/export` — export date personale (JSON)
  - Consimțământ explicit la înregistrare (checkbox terms + privacy policy)
  - Nu se stochează date personale în logs
* **Secrets Management**: Toate cheile API în variabile de mediu (`.env`). Nu se comit niciodată în Git.

---

## 7. Optional Integrations

### 7.1 Payment Integration

Nu este cazul pentru MVP. Aplicația este gratuită.

### 7.2 Analytics Integration

* **Tracking**: Google Analytics 4 (GA4) — free, suficient pentru MVP.
* **Events**:
  - `user_register` (method: email|google)
  - `profile_complete` (step: 1-4)
  - `listing_view` (listing_id, source)
  - `recommendation_click` (listing_id, score)
  - `filter_apply` (filter_type, value)
* **Privacy**: GA4 cu IP anonymization activat. Cookie consent banner (GDPR).

---

## 8. Environment Configuration & Deployment

### 8.1 Environment Variables

```bash
# .env.example

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=chiriismart
DB_PASSWORD=
DB_DATABASE=chiriismart

# JWT
JWT_SECRET=
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Google Maps
GOOGLE_MAPS_API_KEY=

# Scraper
SCRAPER_ENABLED=true
SCRAPER_CRON=0 */6 * * *
SCRAPER_DELAY_MIN=2000
SCRAPER_DELAY_MAX=5000

# App
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 8.2 Local Development

```bash
# 1. Clone
git clone https://github.com/DariusCotrau/VremBaniiDeLaHaufe.git
cd VremBaniiDeLaHaufe

# 2. Start MySQL
docker-compose up -d mysql

# 3. Backend
cd server
cp .env.example .env  # Fill in values
npm install
npm run migration:run
npm run start:dev      # http://localhost:3000

# 4. Frontend
cd ../client
npm install
npm run dev            # http://localhost:5173
```

**Docker Compose** (development):
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: chiriismart
      MYSQL_USER: chiriismart
      MYSQL_PASSWORD: chiriismart
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### 8.3 Staging / Production

| Aspect | Staging | Production |
|--------|---------|------------|
| Frontend | Netlify preview deploys (PR-based) | Netlify production (`main` branch) |
| Backend | Render free tier | Render paid tier / Railway |
| Database | PlanetScale free / Render MySQL | PlanetScale / managed MySQL |
| Scraper | Dezactivat sau 1x/zi | La fiecare 6 ore |

### 8.4 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd server && npm ci
      - run: cd server && npm run lint
      - run: cd server && npm run test
      - run: cd server && npm run build

  client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd client && npm ci
      - run: cd client && npm run lint
      - run: cd client && npm run build
```

### 8.5 Monitoring & Logging

* **Application logging**: NestJS built-in Logger (JSON format în producție)
* **Error tracking**: Sentry (free tier — 5k events/month)
* **Uptime**: UptimeRobot (free) pe endpoint `/api/health`
* **Scraper monitoring**: Logging detaliat al fiecărui run (listings noi, actualizate, erori)

---

## 9. Testing & Quality Assurance

### 9.1 Unit Testing
* **Framework**: Jest (vine cu NestJS)
* **Coverage goal**: ≥ 70% pe services (business logic)
* **Focus**: RecommendationService (scoring), ImobiliareParser (data extraction), AuthService (token generation)

### 9.2 Integration Testing
* **API tests**: Supertest + Jest (NestJS e2e testing)
* **Database**: Test database separat, resetat înainte de fiecare suită
* **Focus**: Auth flow complet, CRUD listings, recommendation endpoint

### 9.3 End-to-End Testing
* **Framework**: Playwright
* **Scenarii critice**:
  1. Register → Login → Complete Profile → View Recommendations
  2. Browse Listings → Apply Filters → View Detail
  3. Google OAuth flow

### 9.4 Performance Testing
* **Lighthouse**: Score ≥ 90 pe Performance, Accessibility, Best Practices
* **API**: Response time < 200ms pentru `GET /api/listings` (cu indexuri)
* **Scraper**: Procesare completă (100+ anunțuri) < 10 minute

### 9.5 Linting & Formatting
* **ESLint** + **Prettier** — configurare shared între client și server
* **Husky** + **lint-staged** — pre-commit hooks

---

## 10. Edge Cases, Implementation Considerations & Reflection

### Potential Obstacles
* **Imobiliare.ro schimbă structura HTML** → Selectoare multiple cu fallback (ca în scraper-ul Python existent). Logging detaliat când parsarea eșuează. Alertă admin.
* **Google Maps API cost** → Cache agresiv. Pre-populare coordonate locații cunoscute. Batch requests unde posibil.
* **IP blocking de la Imobiliare.ro** → Rate limiting generos (2-5s), User-Agent rotation, proxy opțional (Phase 2).

### Edge-Case Handling
* **Listing fără preț** → Se salvează dar se exclude din scor. Badge "Preț la cerere".
* **Listing fără zonă** → Se salvează, geocodare imposibilă → distance_score = 50 (neutral).
* **Profil incomplet** → Redirect la onboarding. Nu se permit recomandări.
* **Google Maps API indisponibil** → Fallback pe cache. Dacă nu există cache, distance_score = 50.
* **Duplicate cross-source** (Phase 2) → Matching pe: preț similar (±5%) + suprafață identică + zonă identică.

### Technical Constraints
* **Google Maps API free tier**: $200/lună credit gratuit. Cu cache agresiv ar trebui să fie suficient pentru MVP.
* **Render free tier**: Container se oprește după 15 min inactivitate → cold start 30-50s. Acceptable pentru MVP.
* **MySQL connection limits**: Free tiers oferă 5-10 conexiuni. TypeORM connection pool = 5.

### Scalability
* **Horizontal**: NestJS este stateless → se poate scala cu multiple instanțe.
* **Database**: Indexuri pe coloanele filtrate. Query-uri optimizate cu select specific (nu `SELECT *`).
* **Phase 3 multi-city**: Adaugă `city` filter pe toate query-urile. Scraper configurabil per oraș.

### Critical Questions
1. **robots.txt Imobiliare.ro** — Permite scraping-ul? Trebuie verificat și respectat.
2. **Google Maps billing** — Cine plătește dacă se depășește free tier?
3. **Render vs Railway** — Care oferă MySQL managed + free tier mai bun?

### Approach Suitability
NestJS este over-engineering pentru un simplu CRUD, dar pentru acest proiect cu module multiple (auth, scraper, recommendations, maps, scheduling) este potrivit. Structura modulară previne dezordinea pe termen lung și face fiecare componentă testabilă independent.

### Exceptional Solution Definition
Proiectul ar fi excepțional dacă:
* Recomandările sunt atât de bune încât utilizatorii găsesc chiria în top 5 rezultate
* Scorul de compatibilitate este transparent și explicabil ("82% — aproape de UPT, dar 50 EUR peste buget")
* Experiența mobile este fluidă și rapidă (< 2s time to interactive)

---

## 11. Summary & Next Steps

### Recap
| Decizie | Alegere |
|---------|---------|
| Backend Framework | NestJS 10 (TypeScript) |
| ORM | TypeORM |
| Database | MySQL 8.0 |
| Frontend | React 18 + Vite + Tailwind + Shadcn/ui |
| State | Zustand + TanStack Query |
| Auth | JWT (access + refresh) + Google OAuth via Passport.js |
| Scraping | Cheerio + Axios (port din Python) |
| Maps | Google Maps APIs cu cache DB |
| Scoring | Weighted formula (35% preț + 45% distanță + 20% preferințe) |
| Hosting | Netlify (FE) + Render/Railway (BE) |
| CI/CD | GitHub Actions |

### Open Questions
1. Confirmare buget Google Maps API și cine gestionează billing-ul
2. Verificare robots.txt Imobiliare.ro pentru conformitate legală
3. Decizie finală Render vs Railway vs VPS pentru backend hosting
4. Necesitatea unui proxy pentru scraper (în funcție de rate limiting)

### Next Steps (Implementation Order)
1. **Setup proiect** — Inițializare NestJS + React + Docker Compose + GitHub Actions
2. **Database** — Schema + migrări + seed data (locații cunoscute)
3. **Auth module** — Register/Login/Google OAuth + JWT
4. **Scraper module** — Port din Python + cron + stocare MySQL
5. **Listings module** — CRUD API + filtre + paginare
6. **Profiles module** — CRUD + geocodare
7. **Recommendations module** — Scoring engine + Maps cache
8. **Frontend** — Landing → Auth → Onboarding → Listings → Recommendations
9. **Testing** — Unit + Integration + E2E
10. **Deploy** — Netlify + Render + CI/CD
