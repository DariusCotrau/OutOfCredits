# ChiriiSmart — Implementation Plan

---

## Phase 1: Project Infrastructure & Setup

- [x] **Step 1: Root-level project scaffolding & Docker**
  - **Task**: Create the monorepo structure with root configs, Docker Compose for MySQL development, environment example files, and updated `.gitignore`. This is the foundation — everything else depends on it.
  - **Files**:
    - `docker-compose.yml`: MySQL 8.0 service with persistent volume, ports 3306, credentials `chiriismart/chiriismart`, database `chiriismart`
    - `.env.example`: All environment variables (DB, JWT, Google OAuth, Google Maps, Scraper, App — as defined in TECHNICAL_SPEC section 8.1)
    - `.gitignore`: Extend existing to add `node_modules/`, `dist/`, `.env`, `coverage/`, `.turbo/`, `*.log`
    - `.nvmrc`: Pin Node.js 20
  - **Step Dependencies**: None
  - **User Instructions**: Install Docker Desktop if not already installed. Run `docker-compose up -d mysql` to start the local MySQL instance.

- [x] **Step 2: NestJS backend initialization**
  - **Task**: Initialize the NestJS project inside `server/` with TypeScript, TypeORM, ConfigModule, and base configuration. Set up the modular structure with placeholder modules.
  - **Files**:
    - `server/package.json`: NestJS 10 dependencies — `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/typeorm`, `@nestjs/config`, `@nestjs/schedule`, `@nestjs/throttler`, `typeorm`, `mysql2`, `class-validator`, `class-transformer`, `bcrypt`, `@types/bcrypt`
    - `server/tsconfig.json`: Strict mode, decorators enabled, paths configured
    - `server/tsconfig.build.json`: Exclude tests and spec files
    - `server/nest-cli.json`: Default NestJS CLI config with `sourceRoot: "src"`
    - `server/src/main.ts`: Bootstrap NestJS app with global ValidationPipe, CORS (whitelist FRONTEND_URL), global prefix `/api`, port from env
    - `server/src/app.module.ts`: Root module importing ConfigModule (`.env`), TypeOrmModule (async config from env), ScheduleModule, ThrottlerModule (100 req/min)
    - `server/src/config/database.config.ts`: TypeORM async configuration factory reading from ConfigService (DB_HOST, DB_PORT, etc.), autoLoadEntities, synchronize only in dev
  - **Step Dependencies**: Step 1
  - **User Instructions**: Run `cd server && npm install` to install dependencies.

- [ ] **Step 3: React frontend initialization**
  - **Task**: Scaffold the React frontend with Vite, TypeScript, Tailwind CSS, and foundational configuration. Install Shadcn/ui, Zustand, TanStack Query, React Router, and Axios.
  - **Files**:
    - `client/package.json`: Dependencies — `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `zustand`, `axios`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`; DevDeps — `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `@types/react`, `@types/react-dom`
    - `client/tsconfig.json`: Strict mode, jsx react-jsx, path aliases (`@/*` → `src/*`)
    - `client/tsconfig.node.json`: Node config for Vite
    - `client/vite.config.ts`: React plugin, path aliases, proxy `/api` → `http://localhost:3000`
    - `client/tailwind.config.ts`: Content paths, extend theme with ChiriiSmart colors (primary `#2563EB`, secondary `#10B981`, accent `#F59E0B`), Inter font family, `rounded-lg` default
    - `client/postcss.config.js`: Tailwind + Autoprefixer
    - `client/index.html`: Root HTML with Inter font from Google Fonts, meta viewport
    - `client/src/main.tsx`: React 18 createRoot, wrap with QueryClientProvider, BrowserRouter
    - `client/src/App.tsx`: Placeholder with React Router `<Routes>`, single `/` route rendering "ChiriiSmart"
    - `client/src/lib/utils.ts`: `cn()` helper (clsx + tailwind-merge)
    - `client/src/index.css`: Tailwind directives (`@tailwind base/components/utilities`), CSS custom properties for Shadcn
  - **Step Dependencies**: Step 1
  - **User Instructions**: Run `cd client && npm install` to install dependencies. Run `npx shadcn@latest init` to initialize Shadcn/ui (choose: TypeScript, default style, Slate base color, `src/` path, `@/` import alias).

- [ ] **Step 4: CI/CD pipeline & linting setup**
  - **Task**: Set up GitHub Actions CI pipeline for both server and client. Add ESLint and Prettier to both packages.
  - **Files**:
    - `.github/workflows/ci.yml`: Two parallel jobs (`server` and `client`), each: checkout → setup Node 20 → `npm ci` → `npm run lint` → `npm run build` (server also runs `npm run test`)
    - `server/.eslintrc.js`: NestJS default ESLint config (extends `@nestjs/eslint-config`)
    - `server/.prettierrc`: `{ "singleQuote": true, "trailingComma": "all" }`
    - `client/.eslintrc.cjs`: React + TypeScript ESLint config
    - `client/.prettierrc`: Same Prettier config as server
  - **Step Dependencies**: Steps 2, 3
  - **User Instructions**: None

---

## Phase 2: Database Schema & Entities

- [ ] **Step 5: TypeORM entities — Users & Profiles**
  - **Task**: Create the User and Profile TypeORM entities with full column definitions, constraints, and the 1:1 relationship. Create the RefreshToken entity.
  - **Files**:
    - `server/src/users/entities/user.entity.ts`: `@Entity('users')` — columns: `id` (PK auto-increment), `email` (unique), `passwordHash` (nullable), `googleId` (nullable unique), `name`, `createdAt`, `updatedAt`. Relation: `@OneToOne(() => Profile)`
    - `server/src/profiles/entities/profile.entity.ts`: `@Entity('profiles')` — columns: `id`, `userId` (unique FK), `university`, `universityLat/Lng`, `workplace`, `workplaceLat/Lng`, `gym`, `gymLat/Lng`, `otherLocations` (JSON), `transportMode` (enum), `budgetMax`, `budgetCurrency` (enum), `minRooms`, `minArea`, `preferredFloor`, `isComplete`, timestamps. Relation: `@OneToOne(() => User)` with `@JoinColumn()`
    - `server/src/auth/entities/refresh-token.entity.ts`: `@Entity('refresh_tokens')` — columns: `id`, `userId` (FK), `token` (unique), `expiresAt`, `createdAt`. Relation: `@ManyToOne(() => User)`
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

- [ ] **Step 6: TypeORM entities — Listings & Distance Cache**
  - **Task**: Create the Listing and DistanceCache TypeORM entities with all columns, indexes, and relationships as specified in the database schema.
  - **Files**:
    - `server/src/listings/entities/listing.entity.ts`: `@Entity('listings')` — 20 columns: `id`, `source`, `sourceUrl` (unique), `title`, `price` (decimal 10,2), `currency`, `rooms`, `usefulAreaSqm`, `totalAreaSqm`, `floor`, `buildingType`, `yearBuilt`, `city`, `zone`, `latitude/longitude` (decimal 10,7), `firstSeenAt`, `lastSeenAt`, `isActive`, timestamps. Indexes on: `sourceUrl`, `(city, isActive)`, `price`, `rooms`, `zone`, `lastSeenAt`
    - `server/src/maps/entities/distance-cache.entity.ts`: `@Entity('distance_cache')` — columns: `id`, `listingId` (FK), `destinationLat/Lng`, `transportMode` (enum), `durationSeconds`, `distanceMeters`, `calculatedAt`. Unique constraint on `(listingId, destinationLat, destinationLng, transportMode)`. Relation: `@ManyToOne(() => Listing)`
  - **Step Dependencies**: Step 5
  - **User Instructions**: None

- [ ] **Step 7: TypeORM migration generation & seed data**
  - **Task**: Configure TypeORM CLI for migrations. Generate the initial migration from entities. Create seed data for known Timișoara locations (UVT, UPT, UMFT, Haufe, Gym One with hardcoded coordinates).
  - **Files**:
    - `server/src/config/typeorm-cli.config.ts`: TypeORM DataSource config for CLI (reads `.env`, points to entities and migrations dirs)
    - `server/package.json`: Add scripts — `"migration:generate"`, `"migration:run"`, `"migration:revert"`, `"seed:run"` using `ts-node` and TypeORM CLI
    - `database/migrations/` (directory): Will contain auto-generated migration file after running `npm run migration:generate`
    - `server/src/config/seed-data.ts`: `KNOWN_LOCATIONS` constant object with UVT, UPT, UMFT, Haufe, Gym One — each with name, lat, lng
    - `server/src/config/seed.ts`: Script that connects to DB and inserts seed data if not already present
  - **Step Dependencies**: Step 6
  - **User Instructions**: Run `cd server && npm run migration:generate -- -n InitialSchema` then `npm run migration:run` to create all tables.

---

## Phase 3: Backend — Common Module & Auth

- [ ] **Step 8: Common module — decorators, filters, interceptors**
  - **Task**: Create shared backend utilities: `@CurrentUser()` parameter decorator, global `HttpExceptionFilter`, response transform interceptor, and validation pipe configuration.
  - **Files**:
    - `server/src/common/decorators/current-user.decorator.ts`: Custom param decorator that extracts `user` from `request.user` (set by JWT guard)
    - `server/src/common/filters/http-exception.filter.ts`: Catches all `HttpException`s, formats as `{ statusCode, message, errors[], timestamp }`
    - `server/src/common/interceptors/transform.interceptor.ts`: Wraps all responses in `{ data: ..., meta?: ... }` format
    - `server/src/common/common.module.ts`: Exports all common providers
  - **Step Dependencies**: Step 2
  - **User Instructions**: None

- [ ] **Step 9: Users module**
  - **Task**: Create the Users module with service (CRUD operations on users) and controller (GET `/api/users/me`, DELETE `/api/users/me` for GDPR, GET `/api/users/me/export`).
  - **Files**:
    - `server/src/users/users.module.ts`: Imports TypeOrmModule.forFeature([User]), exports UsersService
    - `server/src/users/users.service.ts`: Methods — `findByEmail(email)`, `findByGoogleId(googleId)`, `findById(id)`, `create(data)`, `delete(id)`, `exportUserData(id)` (returns all user data as JSON)
    - `server/src/users/users.controller.ts`: `@Get('me')` — return current user; `@Delete('me')` — delete account + cascade; `@Get('me/export')` — GDPR data export. All routes guarded with `@UseGuards(JwtAuthGuard)`
    - `server/src/users/dto/create-user.dto.ts`: DTO with `email`, `name`, `passwordHash?`, `googleId?`
  - **Step Dependencies**: Steps 5, 8
  - **User Instructions**: None

- [ ] **Step 10: Auth module — JWT strategy, register, login**
  - **Task**: Implement email+password authentication with JWT. Register endpoint hashes password with bcrypt, login validates credentials and returns tokens. JWT strategy validates access tokens on protected routes.
  - **Files**:
    - `server/src/auth/auth.module.ts`: Imports UsersModule, PassportModule, JwtModule (async config from env), TypeOrmModule.forFeature([RefreshToken]). Exports AuthService
    - `server/src/auth/auth.service.ts`: Methods — `register(dto)` (validate unique email, hash password, create user, generate tokens), `login(dto)` (validate credentials, generate tokens), `generateTokens(user)` (access JWT 15min + refresh token 7d saved to DB), `refreshToken(token)` (validate, rotate, return new tokens), `logout(userId, token)` (delete refresh token from DB)
    - `server/src/auth/auth.controller.ts`: `@Post('register')`, `@Post('login')`, `@Post('refresh')`, `@Post('logout')` (guarded). Rate limit login to 5/min with `@Throttle()`
    - `server/src/auth/strategies/jwt.strategy.ts`: PassportStrategy extending `Strategy` from `passport-jwt`. Extracts JWT from Bearer header, validates, attaches user to request
    - `server/src/auth/guards/jwt-auth.guard.ts`: `@Injectable()` guard extending `AuthGuard('jwt')`
    - `server/src/auth/dto/register.dto.ts`: `email` (@IsEmail), `password` (@MinLength(8), @Matches for uppercase+digit), `name` (@Length(2, 100))
    - `server/src/auth/dto/login.dto.ts`: `email` (@IsEmail), `password` (@IsString)
    - `server/src/auth/dto/refresh-token.dto.ts`: `refreshToken` (@IsString)
    - `server/src/config/jwt.config.ts`: JwtModuleAsyncOptions factory from ConfigService
  - **Step Dependencies**: Steps 5, 9
  - **User Instructions**: Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env` (generate random 64-char strings).

- [ ] **Step 11: Auth module — Google OAuth strategy**
  - **Task**: Add Google OAuth 2.0 authentication. User clicks "Login with Google" → redirects to Google → callback creates/links user → redirects to frontend with tokens.
  - **Files**:
    - `server/src/auth/strategies/google.strategy.ts`: PassportStrategy extending Google OAuth2 strategy. Config from env (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL). Scopes: `email`, `profile`. `validate()` method finds or creates user by googleId or email
    - `server/src/auth/guards/google-auth.guard.ts`: `AuthGuard('google')`
    - `server/src/auth/auth.controller.ts` (update): Add `@Get('google')` with GoogleAuthGuard (initiates redirect), `@Get('google/callback')` with GoogleAuthGuard (handles callback, generates tokens, redirects to `FRONTEND_URL/auth/google/callback?accessToken=...&refreshToken=...`)
    - `server/src/auth/auth.service.ts` (update): Add `findOrCreateGoogleUser(profile)` — checks googleId, then email, creates if neither found, links google account if email exists
    - `server/src/config/google.config.ts`: Google OAuth configuration factory
  - **Step Dependencies**: Step 10
  - **User Instructions**: Create a Google Cloud project, enable OAuth, create OAuth 2.0 credentials. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in `.env`. Add `http://localhost:3000/api/auth/google/callback` as authorized redirect URI in Google Console.

---

## Phase 4: Backend — Core Business Modules

- [ ] **Step 12: Listings module — entity, service, controller with filters**
  - **Task**: Build the Listings module with full CRUD, advanced filtering, pagination, and sorting. This is the most data-heavy endpoint.
  - **Files**:
    - `server/src/listings/listings.module.ts`: Imports TypeOrmModule.forFeature([Listing])
    - `server/src/listings/listings.service.ts`: Methods — `findAll(filters)` (QueryBuilder with dynamic WHERE clauses for price range, rooms range, zone, area, city, isActive; pagination with LIMIT/OFFSET; sorting by price/rooms/area/createdAt), `findById(id)`, `upsertFromScraper(data[])` (bulk upsert on sourceUrl — insert new, update lastSeenAt for existing), `deactivateStale(days)` (mark listings not seen in N days as inactive), `count(filters)`
    - `server/src/listings/listings.controller.ts`: `@Get()` — public, accepts query params (page, limit, minPrice, maxPrice, currency, minRooms, maxRooms, zone, minArea, sortBy, sortOrder), returns paginated response with meta. `@Get(':id')` — public, single listing detail
    - `server/src/listings/dto/filter-listings.dto.ts`: All query params with validation — `@IsOptional()`, `@Type(() => Number)`, `@Min(0)` for prices, `@IsEnum` for sortBy/sortOrder, `@Max(100)` for limit, default page=1 limit=20
    - `server/src/listings/dto/listing-response.dto.ts`: Response DTO with `@Expose()` decorators for serialization
  - **Step Dependencies**: Step 6
  - **User Instructions**: None

- [ ] **Step 13: Profiles module — CRUD & geocoding**
  - **Task**: Build the Profiles module with create/read/update operations. Integrate Google Geocoding API to convert addresses to coordinates on save. Use known locations for UVT/UPT/UMFT etc.
  - **Files**:
    - `server/src/profiles/profiles.module.ts`: Imports TypeOrmModule.forFeature([Profile]), MapsModule
    - `server/src/profiles/profiles.service.ts`: Methods — `findByUserId(userId)`, `create(userId, dto)` (geocode addresses, set isComplete based on required fields), `update(userId, dto)` (partial update, re-geocode if addresses changed). Uses MapsService for geocoding. Checks KNOWN_LOCATIONS before calling API
    - `server/src/profiles/profiles.controller.ts`: All routes `@UseGuards(JwtAuthGuard)`. `@Get()` — current user's profile. `@Post()` — create profile. `@Patch()` — update profile. Uses `@CurrentUser()` decorator
    - `server/src/profiles/dto/create-profile.dto.ts`: `university?`, `workplace?`, `gym?`, `otherLocations?` (array of {name, address}), `transportMode` (@IsEnum), `budgetMax` (@IsPositive), `budgetCurrency` (@IsEnum), `minRooms?`, `minArea?`, `preferredFloor?`. Validation: at least one location required
    - `server/src/profiles/dto/update-profile.dto.ts`: PartialType of create DTO
  - **Step Dependencies**: Steps 5, 9, 14
  - **User Instructions**: None

- [ ] **Step 14: Maps module — Google Maps service & distance cache**
  - **Task**: Build the Maps module wrapping Google Maps APIs (Geocoding, Directions). Implement aggressive cache-first strategy with distance_cache table. Cache geocoding results permanently, directions for 30 days.
  - **Files**:
    - `server/src/maps/maps.module.ts`: Imports TypeOrmModule.forFeature([DistanceCache]), exports MapsService
    - `server/src/maps/maps.service.ts`: Methods — `geocodeAddress(address)` (calls Google Geocoding API, returns {lat, lng} or null), `getTravelTime(listingId, destLat, destLng, mode)` (cache-first: check distance_cache → if miss or >30 days, call Google Directions API → upsert cache → return {durationSeconds, distanceMeters}), `batchGetTravelTimes(listingId, destinations[], mode)` (calls getTravelTime for each destination). Uses Axios for Google API calls. Handles API errors gracefully (returns null, doesn't throw)
    - `server/src/maps/maps.controller.ts`: `@Post('geocode')` — guarded, accepts `{ address: string }`, returns `{ lat, lng }` or 404. Used by frontend for custom address input
    - `server/src/maps/dto/geocode.dto.ts`: `address` (@IsString, @MinLength(3))
  - **Step Dependencies**: Step 6
  - **User Instructions**: Set `GOOGLE_MAPS_API_KEY` in `.env`. Enable Geocoding API and Directions API in Google Cloud Console.

- [ ] **Step 15: Scraper module — Imobiliare.ro port from Python**
  - **Task**: Port the existing Python scraper to Node.js/TypeScript within a NestJS module. Use Cheerio for HTML parsing (equivalent to BeautifulSoup) and Axios for HTTP requests. Replicate all 14 field extraction patterns, rate limiting, retry logic, and User-Agent rotation from the Python code. Schedule with @nestjs/schedule cron.
  - **Files**:
    - `server/src/scraper/scraper.module.ts`: Imports ListingsModule, MapsModule. Provides ScraperService, ImobiliareParser, ScraperScheduler
    - `server/src/scraper/scraper.service.ts`: Orchestrator — `scrape(propertyType, city, maxPages?)` method. Uses Axios with configurable headers (User-Agent rotation from 5+ agents). Implements delay (2-5s random between requests), retry with exponential backoff (3 attempts). Fetches first page → parses total pages → iterates remaining pages. Returns parsed listings array. Port of `scraper.py` logic
    - `server/src/scraper/parsers/imobiliare.parser.ts`: Static methods — `parseListingPage(html)`, `parseTotalPages(html)`, `extractListingData(card)`. Port of `parser.py`: same CSS selectors (`div.box-anunt`, `div.oferta`, etc. with fallbacks), same regex patterns for price/area/rooms/floor/year extraction, same `_clean_price` logic, same characteristics list parsing. Uses Cheerio instead of BeautifulSoup
    - `server/src/scraper/scraper.scheduler.ts`: `@Cron('0 */6 * * *')` decorated method. Scrapes `apartamente-inchiriere` + `garsoniere-inchiriere` for `timisoara`. Calls `listingsService.upsertFromScraper()`. Calls `listingsService.deactivateStale(7)`. Tries geocoding new listings via MapsService. Logs summary (new, updated, deactivated counts). Conditional on `SCRAPER_ENABLED` env var
    - `server/src/scraper/scraper.config.ts`: Constants — `BASE_URL`, `PROPERTY_TYPES` map, `USER_AGENTS` array (5 Chrome/Firefox/Safari variants), `DELAY_MIN/MAX`, `MAX_RETRIES`, `REQUEST_TIMEOUT`. Port of `config.py`
    - `server/src/scraper/dto/scraped-listing.dto.ts`: Interface matching the 14 scraped fields (Romanian names from Python: titlu, pret, moneda, etc.) + mapping function to Listing entity format
    - `server/package.json` (update): Add `cheerio` and `axios` dependencies
  - **Step Dependencies**: Steps 6, 12, 14
  - **User Instructions**: Run `npm install cheerio axios` in server directory. Set `SCRAPER_ENABLED=true` in `.env`.

- [ ] **Step 16: Recommendations module — scoring engine**
  - **Task**: Build the recommendation engine that scores each active listing against a user's profile. Implements the weighted formula: `score = 0.35*priceScore + 0.45*distanceScore + 0.20*preferenceScore`. Returns listings sorted by score with detailed breakdown and travel times.
  - **Files**:
    - `server/src/recommendations/recommendations.module.ts`: Imports ListingsModule, ProfilesModule, MapsModule
    - `server/src/recommendations/recommendations.service.ts`: Main method — `getRecommendations(userId, page, limit)`. Flow: (1) Load user profile (check isComplete, return error if not), (2) Load active listings with price != null, (3) For each listing, calculate `priceScore` (formula from spec — under/over budget scaling), `distanceScore` (average travel time to all profile locations × 2, capped 0-100), `preferenceScore` (rooms match +40, area match +35, floor match +25 — redistribute if pref not set), (4) Compute weighted total, (5) Sort by score DESC, (6) Paginate, (7) Attach travelTimes array to each result. Private helpers: `calculatePriceScore(price, budget)`, `calculateDistanceScore(listingId, profileLocations, transportMode)`, `calculatePreferenceScore(listing, profile)`
    - `server/src/recommendations/recommendations.controller.ts`: `@Get()` — `@UseGuards(JwtAuthGuard)`, accepts `?page=1&limit=20`, uses `@CurrentUser()` to get userId, returns paginated recommendations with scores
    - `server/src/recommendations/dto/recommendation-response.dto.ts`: Extends Listing with `score`, `priceScore`, `distanceScore`, `preferenceScore`, `travelTimes[]` ({ destinationName, durationSeconds, distanceMeters, transportMode })
  - **Step Dependencies**: Steps 12, 13, 14
  - **User Instructions**: None

- [ ] **Step 17: Health check endpoint & app module wiring**
  - **Task**: Wire all modules into AppModule. Add a health check endpoint. Ensure all guards, filters, and interceptors are registered globally.
  - **Files**:
    - `server/src/app.module.ts` (update): Import all feature modules — AuthModule, UsersModule, ProfilesModule, ListingsModule, RecommendationsModule, ScraperModule, MapsModule, CommonModule. Register global filter and interceptor via APP_FILTER and APP_INTERCEPTOR providers
    - `server/src/app.controller.ts`: `@Get('health')` — returns `{ status: 'ok', timestamp, uptime }`
    - `server/src/main.ts` (update): Enable shutdown hooks, set global prefix `/api`, enable CORS with credentials
  - **Step Dependencies**: Steps 8-16
  - **User Instructions**: Test all endpoints with `npm run start:dev`. Verify `GET /api/health` returns OK.

---

## Phase 5: Frontend — Foundation & Auth

- [ ] **Step 18: API client, stores, and type definitions**
  - **Task**: Set up the API client (Axios instance with JWT interceptor), Zustand stores (auth + filters), TanStack Query client config, and all shared TypeScript interfaces.
  - **Files**:
    - `client/src/services/api.ts`: Axios instance with baseURL from env. Request interceptor attaches Bearer token from authStore. Response interceptor catches 401 → logout + redirect to `/login`
    - `client/src/services/auth.service.ts`: API functions — `register(data)`, `login(data)`, `googleLogin()` (redirects to backend Google OAuth), `refreshToken(token)`, `logout()`
    - `client/src/services/listings.service.ts`: API functions — `getListings(filters)`, `getListingById(id)`
    - `client/src/services/profile.service.ts`: API functions — `getProfile()`, `createProfile(data)`, `updateProfile(data)`
    - `client/src/services/recommendations.service.ts`: API function — `getRecommendations(page, limit)`
    - `client/src/stores/auth.store.ts`: Zustand store — state: `user`, `accessToken`, `refreshToken`, `isAuthenticated`. Actions: `login(tokens, user)`, `logout()`, `setTokens()`. Persist to localStorage (only tokens + user)
    - `client/src/stores/filter.store.ts`: Zustand store — state: `minPrice`, `maxPrice`, `minRooms`, `maxRooms`, `zone`, `minArea`, `sortBy`, `sortOrder`, `page`. Actions: `setFilter()`, `resetFilters()`, `setPage()`. Sync with URL search params
    - `client/src/types/listing.ts`: `Listing`, `ListingFilters`, `PaginatedResponse<T>`, `PaginationMeta` interfaces
    - `client/src/types/user.ts`: `User`, `Profile`, `TransportMode`, `KnownLocation` interfaces
    - `client/src/types/recommendation.ts`: `RecommendedListing`, `TravelTime` interfaces
    - `client/src/types/auth.ts`: `LoginRequest`, `RegisterRequest`, `AuthResponse`, `TokenPair` interfaces
    - `client/src/lib/query-client.ts`: TanStack QueryClient config with default staleTime 2min, retry 1
  - **Step Dependencies**: Step 3
  - **User Instructions**: None

- [ ] **Step 19: Layout components — Header, Footer, ProtectedRoute**
  - **Task**: Build the app shell layout: responsive header with nav + auth status, footer, main layout wrapper, and a ProtectedRoute component that redirects unauthenticated users.
  - **Files**:
    - `client/src/components/layout/Header.tsx`: Responsive header — logo "ChiriiSmart" (link to `/`), nav links (Anunțuri → `/listings`, Recomandări → `/recommendations`). Auth state: if logged in → Avatar dropdown (Profil, Logout); if not → Login/Register buttons. Mobile: hamburger menu
    - `client/src/components/layout/Footer.tsx`: Simple footer — "ChiriiSmart © 2026", links
    - `client/src/components/layout/Layout.tsx`: Wraps children with Header + main content area (`max-w-7xl mx-auto px-4`) + Footer
    - `client/src/components/layout/ProtectedRoute.tsx`: Checks `authStore.isAuthenticated`. If not → redirect to `/login` with return URL in state. If yes → render children
    - `client/src/App.tsx` (update): Wrap all routes with Layout. Define routes: `/`, `/login`, `/register`, `/auth/google/callback`, `/onboarding` (protected), `/listings`, `/listings/:id`, `/recommendations` (protected), `/profile` (protected)
  - **Step Dependencies**: Step 18
  - **User Instructions**: Install Shadcn components: `npx shadcn@latest add button avatar dropdown-menu sheet`

- [ ] **Step 20: Auth pages — Login, Register, Google callback**
  - **Task**: Build the login and register pages with forms, validation, error handling, and the Google OAuth callback handler.
  - **Files**:
    - `client/src/pages/Login.tsx`: Card-centered layout. Form with email + password inputs (controlled). Submit calls `authService.login()` → on success stores tokens in authStore → redirects to `/recommendations` (or return URL). "Login cu Google" button → calls `authService.googleLogin()`. Link to Register. Error toast on failure. Loading state on submit
    - `client/src/pages/Register.tsx`: Same layout as Login. Form with name + email + password + confirm password. Client-side validation (password match, min 8 chars, uppercase + digit). Submit calls `authService.register()` → stores tokens → redirects to `/onboarding`. Link to Login. Error toast on email duplicate
    - `client/src/pages/GoogleCallback.tsx`: Extracts `accessToken` and `refreshToken` from URL query params. Stores in authStore. Fetches user profile. If profile exists and isComplete → redirect to `/recommendations`. If no profile → redirect to `/onboarding`. Shows loading spinner during process
    - `client/src/components/auth/GoogleButton.tsx`: Styled button "Continuă cu Google" with Google icon
  - **Step Dependencies**: Steps 18, 19
  - **User Instructions**: Install Shadcn components: `npx shadcn@latest add card input label toast`

---

## Phase 6: Frontend — Profile & Onboarding

- [ ] **Step 21: Onboarding wizard — 4-step profile setup**
  - **Task**: Build the multi-step onboarding wizard. Step 1: Locations (university dropdown + workplace/gym text inputs). Step 2: Transport mode selection. Step 3: Budget slider. Step 4: Preferences. Each step validates before advancing. Final submit creates profile via API.
  - **Files**:
    - `client/src/pages/Onboarding.tsx`: Wizard container — manages current step (1-4), form data state, progress bar. "Înapoi" and "Continuă" navigation buttons. Final step: "Finalizează" button calls `profileService.createProfile()` → redirects to `/recommendations`
    - `client/src/components/profile/StepLocations.tsx`: Step 1 — University select (UVT, UPT, UMFT, Altă universitate → text input). Workplace text input. Gym text input. Optional "Adaugă altă locație" button (max 3 extra). Validation: at least one location filled
    - `client/src/components/profile/StepTransport.tsx`: Step 2 — 4 cards with icons (Car, Bus, Bike, Walking from Lucide) for transport mode. Single select, visually highlighted
    - `client/src/components/profile/StepBudget.tsx`: Step 3 — Budget slider (100-1000 range) + manual input field, synced. Currency toggle EUR/RON. Validation: budget > 0
    - `client/src/components/profile/StepPreferences.tsx`: Step 4 — Rooms selector (1-5, button group). Area slider (20-150 mp). Floor preference select (Parter, 1-4, Orice). All optional
    - `client/src/components/profile/ProgressBar.tsx`: 4-step progress indicator with active/completed/pending states
  - **Step Dependencies**: Steps 18, 19, 20
  - **User Instructions**: Install Shadcn components: `npx shadcn@latest add select slider tabs badge progress`

- [ ] **Step 22: Profile page — view & edit**
  - **Task**: Build the profile management page where authenticated users can view and edit their profile. Reuses the same form components from onboarding but in edit mode.
  - **Files**:
    - `client/src/pages/Profile.tsx`: Fetches profile with `useProfile()` hook (TanStack Query). Displays current profile data in a card layout. "Editează" button opens edit mode (same form components as onboarding, pre-filled). Save calls `profileService.updateProfile()` → invalidates query cache. Shows GDPR section: "Exportă datele mele" button + "Șterge contul" button with confirmation dialog
    - `client/src/hooks/useProfile.ts`: TanStack Query hook wrapping `profileService.getProfile()`, staleTime 10min
    - `client/src/components/profile/ProfileCard.tsx`: Read-only display of profile — locations with map pins, transport mode icon, budget badge, preferences list
  - **Step Dependencies**: Step 21
  - **User Instructions**: Install Shadcn component: `npx shadcn@latest add dialog`

---

## Phase 7: Frontend — Listings & Recommendations

- [ ] **Step 23: Listings page — grid, cards, pagination**
  - **Task**: Build the main listings browsing page with a responsive grid of listing cards, pagination, and empty/loading states.
  - **Files**:
    - `client/src/pages/Listings.tsx`: Page layout — filter sidebar (desktop) / filter button (mobile) + sort bar + listing grid + pagination. Fetches data with `useListings()` hook. Displays skeleton grid during load. Empty state: "Nu au fost găsite anunțuri" with reset filters button
    - `client/src/hooks/useListings.ts`: TanStack Query hook wrapping `listingsService.getListings(filters)`, reads filters from filterStore, staleTime 2min. Refetches on filter change
    - `client/src/components/listings/ListingCard.tsx`: Card component — placeholder image area (gradient with zone name), specs row ("2 camere • 54 mp • Et. 3"), zone name, price formatted ("350 EUR/lună"), optional score bar (if user has profile), optional travel time snippet. Hover: scale-[1.02] + shadow-lg. Click navigates to `/listings/:id`
    - `client/src/components/listings/ListingGrid.tsx`: Responsive CSS grid — 3 columns xl, 2 columns md, 1 column mobile. Gap-6
    - `client/src/components/listings/ListingSkeleton.tsx`: Skeleton card matching ListingCard dimensions. Shows 6 skeleton cards during loading
    - `client/src/components/listings/SortBar.tsx`: Horizontal bar with sort options (Preț, Camere, Suprafață, Dată), sort order toggle button. Updates filterStore
  - **Step Dependencies**: Steps 18, 19
  - **User Instructions**: Install Shadcn components: `npx shadcn@latest add skeleton pagination`

- [ ] **Step 24: Listings page — filters sidebar**
  - **Task**: Build the filter sidebar component with price range, rooms, zone, and area filters. Syncs with URL params and filterStore. On mobile, renders as a bottom sheet.
  - **Files**:
    - `client/src/components/listings/ListingFilters.tsx`: Sidebar container — Price range (two inputs min/max or dual slider), Rooms (button group 1-5+), Zone (multi-select dropdown with Timișoara zones), Area (min area slider). "Aplică filtre" button + "Resetează" link. Reads/writes filterStore
    - `client/src/components/listings/MobileFilterSheet.tsx`: Sheet component (Shadcn Sheet) that wraps ListingFilters for mobile. Trigger: floating "Filtre" button at bottom of screen. Badge shows active filter count
    - `client/src/hooks/useFilterSync.ts`: Custom hook that syncs filterStore ↔ URL search params bidirectionally. On mount: reads URL → populates store. On store change: updates URL
    - `client/src/lib/zones.ts`: Static list of Timișoara zones/neighborhoods for the zone filter dropdown (Lipovei, Complexul Studențesc, Fabric, Iosefin, Circumvalațiunii, Dâmbovița, Ghiroda, Giroc, etc.)
  - **Step Dependencies**: Step 23
  - **User Instructions**: None

- [ ] **Step 25: Listing detail page**
  - **Task**: Build the individual listing detail page showing all information, embedded map (if coordinates available), and travel times to profile locations (if authenticated with complete profile).
  - **Files**:
    - `client/src/pages/ListingDetail.tsx`: Fetches listing with `useListing(id)` hook. Layout: Left column — full listing info card (all 14 fields formatted nicely), Back button. Right column — Google Maps embed (static map image or iframe if coordinates exist), travel times card (if user authenticated + profile complete: fetches recommendations for this listing to get travelTimes). Loading skeleton. 404 state if listing not found
    - `client/src/hooks/useListing.ts`: TanStack Query hook wrapping `listingsService.getListingById(id)`, staleTime 5min
    - `client/src/components/listings/ListingInfo.tsx`: Detailed card — Title (h1), Price badge, Specs grid (rooms, area useful/total, floor, building type, year), Zone + City, Source link (opens Imobiliare.ro in new tab), First seen / Last seen dates
    - `client/src/components/listings/TravelTimesCard.tsx`: Card showing travel times to each profile location — icon + name + formatted time ("12 min") + distance ("2.1 km") + transport mode icon. Only renders if data available
    - `client/src/components/maps/StaticMap.tsx`: Google Maps static image component using Maps Static API. Marker at listing coordinates. Fallback: "Locație indisponibilă" placeholder
  - **Step Dependencies**: Steps 23, 18
  - **User Instructions**: None

- [ ] **Step 26: Recommendations page**
  - **Task**: Build the personalized recommendations page showing scored listings with visual score indicators and travel time summaries. Requires auth + complete profile.
  - **Files**:
    - `client/src/pages/Recommendations.tsx`: Protected page. Checks profile.isComplete → if not, shows prompt to complete onboarding with CTA button. If complete: fetches recommendations with `useRecommendations()`. Displays as grid of RecommendationCards sorted by score. Pagination. Empty state if no recommendations
    - `client/src/hooks/useRecommendations.ts`: TanStack Query hook wrapping `recommendationsService.getRecommendations(page, limit)`, staleTime 1min
    - `client/src/components/recommendations/RecommendationCard.tsx`: Extends ListingCard with: prominent score badge (colored: green ≥80, amber ≥50, red <50), score breakdown tooltip (preț: 85, distanță: 98, preferințe: 95), travel times summary (top 2 locations inline). Click → listing detail
    - `client/src/components/recommendations/ScoreBar.tsx`: Horizontal progress bar with fill animation. Color varies by score range. Shows percentage text
    - `client/src/components/recommendations/ScoreBreakdown.tsx`: Tooltip/popover showing 3 sub-scores with mini bars + labels (Preț, Distanță, Preferințe)
  - **Step Dependencies**: Steps 23, 18
  - **User Instructions**: Install Shadcn components: `npx shadcn@latest add tooltip popover`

---

## Phase 8: Frontend — Landing Page

- [ ] **Step 27: Landing page**
  - **Task**: Build the landing/homepage that introduces ChiriiSmart, explains the value proposition, and drives users to register.
  - **Files**:
    - `client/src/pages/Landing.tsx`: Sections: (1) Hero — headline "Găsește chiria perfectă în Timișoara", subtitle explaining personalized recommendations, CTA "Începe acum" → `/register` (or `/recommendations` if logged in). (2) How it works — 3-step cards (Completează profilul → Primești recomandări → Alege chiria). (3) Features — grid of feature cards (Scoring personalizat, Filtre avansate, Date actualizate, Timp de deplasare). (4) CTA final section
    - `client/src/components/landing/HeroSection.tsx`: Full-width hero with gradient background (blue → indigo), text content, CTA button, decorative illustration/mockup placeholder
    - `client/src/components/landing/HowItWorks.tsx`: 3 numbered step cards with icons (UserPlus, Search, Home from Lucide)
    - `client/src/components/landing/FeatureGrid.tsx`: 4 feature cards with icons and short descriptions
  - **Step Dependencies**: Step 19
  - **User Instructions**: None

---

## Phase 9: Backend Testing

- [ ] **Step 28: Unit tests — services**
  - **Task**: Write unit tests for the core business logic services: RecommendationService scoring, ImobiliareParser extraction, AuthService token handling, ListingsService filtering.
  - **Files**:
    - `server/src/recommendations/recommendations.service.spec.ts`: Test `calculatePriceScore` — under budget, at budget, over budget, way over budget, no budget set. Test `calculateDistanceScore` — close locations, far locations, no travel data. Test `calculatePreferenceScore` — full match, partial match, no preferences. Test overall `getRecommendations` — mock dependencies, verify sort order
    - `server/src/scraper/parsers/imobiliare.parser.spec.ts`: Test `parseListingPage` with HTML fixture files (save sample Imobiliare.ro HTML). Verify all 14 fields extracted correctly. Test edge cases: missing price, missing rooms, garsoniera=1 room, price with dots/commas, parter=floor 0. Test `parseTotalPages` — single page, multiple pages, no pagination
    - `server/src/auth/auth.service.spec.ts`: Test register — creates user with hashed password, returns tokens. Test login — correct password succeeds, wrong password fails. Test token refresh — valid token returns new access token, expired token rejected. Test Google OAuth — new user created, existing email linked
    - `server/src/listings/listings.service.spec.ts`: Test `findAll` with various filters. Test `upsertFromScraper` — new listings inserted, existing updated. Test `deactivateStale`
    - `server/test/fixtures/imobiliare-sample.html`: Sample HTML page from Imobiliare.ro for parser tests
  - **Step Dependencies**: Steps 10, 12, 15, 16
  - **User Instructions**: Run `cd server && npm run test` to execute all unit tests.

- [ ] **Step 29: Integration tests — API endpoints**
  - **Task**: Write e2e/integration tests for the main API flows using Supertest. Tests run against a test database.
  - **Files**:
    - `server/test/auth.e2e-spec.ts`: Test complete auth flow — register → login → access protected route → refresh token → logout. Test duplicate email registration. Test invalid credentials. Test rate limiting on login
    - `server/test/listings.e2e-spec.ts`: Seed test listings → test GET /api/listings with no filters → test with price filter → test with rooms filter → test pagination → test sort. Test GET /api/listings/:id → existing vs non-existing
    - `server/test/profile.e2e-spec.ts`: Auth first → create profile → get profile → update profile → verify isComplete flag
    - `server/test/jest-e2e.json` (update): Configure test database, increase timeout
    - `server/test/test-utils.ts`: Helper to create test app, seed data, get auth token, clean up
  - **Step Dependencies**: Step 28
  - **User Instructions**: Create a `chiriismart_test` database in MySQL. Set `DB_DATABASE=chiriismart_test` for test environment. Run `cd server && npm run test:e2e`.

---

## Phase 10: Polish & Deploy

- [ ] **Step 30: Error handling, loading states & responsive polish**
  - **Task**: Add comprehensive error boundaries, loading skeletons, empty states, toast notifications, and responsive design fixes across the entire frontend.
  - **Files**:
    - `client/src/components/ui/ErrorBoundary.tsx`: React error boundary wrapper — catches render errors, shows "Ceva nu a mers bine" with retry button
    - `client/src/components/ui/EmptyState.tsx`: Reusable empty state — icon, title, description, optional CTA button. Used for empty listings, no recommendations, etc.
    - `client/src/components/ui/LoadingPage.tsx`: Full-page loading spinner/skeleton for route transitions
    - `client/src/App.tsx` (update): Wrap routes with ErrorBoundary. Add Toaster component (Shadcn). Add React Query DevTools in dev
    - `client/src/pages/Listings.tsx` (update): Ensure mobile-first responsive — filter sheet on mobile, grid column adjustments, proper touch targets
    - `client/src/pages/Onboarding.tsx` (update): Error toast on save failure. Loading state on submit. Prevent double-submit
  - **Step Dependencies**: Steps 20-27
  - **User Instructions**: None

- [ ] **Step 31: Dockerfile & deployment configuration**
  - **Task**: Create production Docker configuration for the backend. Configure Netlify deployment for the frontend. Finalize environment variable documentation.
  - **Files**:
    - `Dockerfile`: Multi-stage build — Stage 1: `node:20-alpine` install + build NestJS. Stage 2: `node:20-alpine` copy dist + node_modules(production) + run. Expose port 3000. CMD `node dist/main`
    - `client/netlify.toml`: Build command `npm run build`, publish dir `dist`, redirects (`/* → /index.html` for SPA). Environment: `VITE_API_URL` pointing to backend URL
    - `client/src/services/api.ts` (update): Read `VITE_API_URL` from env for production (use Vite env)
    - `.env.example` (update): Add comments explaining each variable, mark required vs optional
    - `docker-compose.yml` (update): Add `server` service using Dockerfile, depends_on mysql, env_file `.env`, ports 3000
  - **Step Dependencies**: Step 17
  - **User Instructions**: For Render: create a new Web Service, connect GitHub repo, set root directory to `/`, set Dockerfile path. Add all environment variables from `.env.example`. For Netlify: connect repo, set base directory to `client/`, build command `npm run build`, publish directory `dist/`. Set `VITE_API_URL` to the Render backend URL.

---

## Summary

### Approach
The plan follows a **bottom-up, backend-first** strategy:
1. **Infrastructure** (Steps 1-4): Monorepo scaffold, both frameworks initialized, CI/CD from day one
2. **Data layer** (Steps 5-7): All entities and migrations before any business logic
3. **Backend modules** (Steps 8-17): Auth → Core CRUD → Scraper → Recommendations, each module self-contained
4. **Frontend foundation** (Steps 18-20): API client + stores + auth pages before feature pages
5. **Frontend features** (Steps 21-27): Onboarding → Listings → Recommendations → Landing, matching the critical user path
6. **Testing** (Steps 28-29): Unit tests on business logic, integration tests on API flows
7. **Polish & Deploy** (Steps 30-31): Error handling, responsive fixes, production config

### Key Considerations
- **Scraper port** (Step 15) is the largest single step — the Python parser has complex regex patterns that must be faithfully translated
- **Google Maps API costs** — cache aggressively in Step 14, use hardcoded coordinates for known locations
- **Auth security** — JWT in memory (not localStorage for access token), httpOnly refresh cookie, bcrypt 12 rounds, rate limiting
- **No step exceeds 20 files** — each is scoped to a single module or feature
- **Each step is independently testable** — the backend can be verified with curl/Postman before frontend is built
- **Total: 31 steps** covering the complete MVP (Phase 1 from PROJECT_SPEC)
