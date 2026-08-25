# Hero DB — Angular CRUD Challenge

A full-featured SPA for managing superheroes, built with Angular 22, featuring a retro CRT-inspired design system, complete CRUD operations, and Docker support.
### Link deploy "Productivo".
https://riu-hotels-crud-challenge.netlify.app/heroes

## Tech Stack

- **Framework:** Angular 22 (Standalone Components, Signals)
- **Language:** TypeScript 6.0 (strict typing)
- **State Management:** Signals + RxJS (reactive programming)
- **Styling:** SCSS with custom Design Tokens
- **Testing:** Jasmine + Karma (376 tests, 92%+ coverage)
- **Build:** Angular CLI + esbuild
- **Containerization:** Docker (multi-stage) + Nginx
- **CI/CD:** GitHub Actions
- **Code Quality:** ESLint

## Features

- Hero catalog with responsive grid layout (pyramid rows on desktop, uniform grid on mobile)
- Desktop split-view: 40/60 layout with hero detail side panel
- Mobile full-screen hero detail view
- Search with debounced filtering and uppercase text transformation
- Paginated hero list (18 per page, client-side)
- Create, Edit, Delete heroes with form validation
- CRT frame overlay with retro scanline aesthetic
- Canvas background animation (deep ocean, tunnel rings, vignette)
- Keyboard navigation (arrow keys, Enter/Space, Escape) on desktop
- Loading skeleton states, error handling, toast notifications
- Responsive design (Mobile → Tablet → Desktop) with breakpoints at 576px, 768px, 900px, 1024px, 1280px
- Dark theme with Electric Indigo / Pure Red / Golden Glow palette
- Uppercase text transformation on hero names and search input

## Quick Start

### Prerequisites
- Node.js 22+
- npm 10+

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Open http://localhost:4200
```

### Run Tests

```bash
# Generate environment files (required before first test/build)
npm run set-env

# Run all tests
ng test --no-watch --browsers=ChromeHeadless

# Run with coverage
ng test --no-watch --browsers=ChromeHeadless --code-coverage
```

### Run Lint

```bash
npm run lint
```

## Docker

```bash
# Build and run (production, port 8080)
docker compose -f docker-compose.yml up --build

# Open http://localhost:8080

# Stop
docker compose -f docker-compose.yml down
```

> **Note:** `compose.yaml` defines dev/staging/prod multi-environment services (ports 4200/4201/4202).
> The command above uses `docker-compose.yml` which builds a single production container on port 8080.

## Architecture

```
src/app/
├── core/                          # Infrastructure
│   ├── interceptors/              # HTTP interceptors
│   └── services/                  # Singleton services (Toast, Loading)
├── features/
│   └── heroes/                    # Hero feature module
│       ├── pages/                 # Route components (list, create, edit)
│       ├── components/            # UI components (card, grid, details, search)
│       ├── services/              # Business logic (HeroService)
│       ├── data/                  # Data access (Repository pattern)
│       ├── adapters/              # API ↔ Domain mappers
│       └── models/                # TypeScript interfaces
├── shared/
│   ├── ui/                        # Reusable UI primitives
│   │   ├── button/
│   │   ├── input/
│   │   ├── badge/
│   │   ├── canvas-bg/
│   │   ├── confirm-dialog/
│   │   ├── toast/
│   │   ├── pagination/
│   │   └── uppercase/
│   └── layout/                    # Layout components
│       └── main-layout/
└── models/                        # Shared domain models
```

### Data Flow

```
Component → HeroService → HeroRepository → HeroApiRepository (seed: one-time fetch from CDN)
                                          → HeroLocalRepository (single source of truth for all reads/writes)
                                          → HeroMapper (API ↔ Domain on initial seed only)
```

After initialization, **all CRUD operations, search, and getById read from and write to the local in-memory repository**. The external API is only called once to seed the initial dataset.

### State Management

- **Signals** for component state (`signal()`, `computed()`)
- **RxJS** for HTTP streams and debouncing
- **Service injection** via `inject()` pattern
- **OnPush** change detection on all components

## API

This project uses the [akabab/superhero-api](https://github.com/akabab/superhero-api), served via CDN. No API key required.

- **Base URL:** `https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api`
- **Endpoints:** `/all.json` (all heroes), `/id/{id}.json` (single hero)
- **Read-only:** The external API only supports GET; CRUD operations use a local in-memory repository

## Environment Configuration

| Environment | Port | Production |
|-------------|------|------------|
| Development | 4200 | false |
| Production | 8080 (Docker) | true |

## Design System

Custom SCSS-based design system with:
- **Color Tokens:** Electric Indigo (#611BEE), Pure Red (#F90608), Golden Glow (#F5DE08)
- **Typography:** Aldrich (Google Fonts) for headings, system font stack for body
- **Spacing:** Consistent 4px base scale
- **Components:** Button, Input, Badge, Toast, Pagination, ConfirmDialog, CanvasBg, UppercaseDirective
- **Responsive:** Mobile-first with breakpoints at 576px, 768px, 900px, 1024px, 1280px
- **Effects:** CRT frame overlay, canvas background animation, electric border pulse on cards

## Testing

```bash
# Total tests: 376
# Coverage: Statements 92% | Branches 78% | Functions 97% | Lines 94%
```

### What's Tested
- HeroService (CRUD operations, error handling)
- HeroRepository (facade pattern, lazy initialization)
- HeroApiRepository (HTTP calls, caching, error handling)
- HeroLocalRepository (in-memory store)
- HeroMapper (API ↔ Domain mapping)
- HeroFormComponent (validations, submit behavior)
- HeroListComponent (load, search, pagination, selection, desktop/mobile)
- HeroGridComponent (keyboard navigation, panel mode, row helpers)
- HeroCardComponent (render, events, image error, alignment badge)
- HeroDetailsComponent (output emissions, image error)
- UppercaseDirective (text transformation, cursor preservation)
- InputComponent (uppercase mode, CVA, error states)
- ToastService (notification lifecycle)
- PaginationComponent (page navigation)
- ConfirmDialogComponent (confirm/cancel flow)

### Coverage Thresholds
- Statements: ≥ 80%
- Branches: ≥ 75%
- Functions: ≥ 80%
- Lines: ≥ 80%

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

```
Validate (lint + format)
    ↓
Test (unit tests + coverage)
    ↓
Build (production build)
    ↓
Docker (image build + verify)
```

## Known Limitations

- **No backend persistence:** Heroes created/edited/deleted are stored in memory only
- **Read-only API:** The superhero API only supports GET; all writes go to a local in-memory store
- **No authentication:** Login/auth not implemented (not required by challenge)
- **No E2E tests:** Unit tests only (E2E could be added with Playwright/Cypress)

## License

MIT
