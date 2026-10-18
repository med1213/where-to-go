# where-to-go

> **Where to Go in Laos (ໄປໃສດີ)** — A full-stack, enterprise-grade travel and attractions discovery platform designed to showcase tourist attractions, scenic viewpoints, hidden waterfalls, cafes, and cultural landmarks across all 18 provinces of Laos.

---

## 🌟 Key Features

### 1. 🌏 Public Travel Discovery Web (`frontend-web`)
- **Modern Next.js 16 Web Application** with Lao typography (`Noto Sans Lao`) and glassmorphic UI.
- **Dynamic Recency & Sort Filters**:
  - Filter places by recency timeframe: Popular, Recent, 1 Month (`1m`), 3 Months (`3m`), 6 Months (`6m`), and 9 Months (`9m`).
  - Seamless URL query parameter sync: `?search=`, `?sort=`, `?province=`, `?category=`.
  - Desktop sidebar and mobile drawer filter navigation.
- **Interactive Multi-Image Galleria & Lightbox**:
  - High-resolution carousel with thumbnail slider and fullscreen preview.
  - Image client-side compression before upload.
- **Community Engagement**:
  - Social sharing to Facebook, clipboard copy, and native share dialogs.
  - One-click Wanna-Go (Favorites) bookmarking.
  - Multi-tier reviews with nested comment replies and image attachments.
- **Dynamic Hero Banners**:
  - Backoffice-curated rotating hero banner slides for featured promotions.

### 2. 🛡️ Admin Backoffice Management (`admin-portal`)
- **Executive Dashboard & Tourism Analytics**:
  - Collapsible / expandable sections (`Collapse All` / `Expand All` toggle for focused executive viewing).
  - Time-series tracking of post velocity (Today, Week, Month, Year, Custom date ranges) with More/Less indicators.
  - Price tier breakdowns, moderation funnels, and engagement conversion metrics.
  - Geographic place distribution across 18 provinces and categories.
  - CSV report export and print-ready executive views.
- **Complete Content Management**:
  - Places management table with pagination, approval toggles, and rich editing.
  - Categories management table.
  - Banner slider manager with link targeting and active/inactive toggle.
  - Multi-level comment moderation with direct place and author inspection.
- **Rich Toast Alerts & Seamless Authentication**:
  - Persistent login with automatic token refresh rotation.

### 3. 🚀 Backend API Services (`backend`)
- **NestJS Architecture** with PostgreSQL & Prisma ORM.
- **High-Security Auth (PS512 RSA)**:
  - Asymmetric cryptographically-signed JWTs using PS512.
  - Sliding session refresh token rotation with fingerprint validation.
  - Role-based Access Control (`ADMIN`, `USER`, `MODERATOR`).
- **RESTful Endpoints**:
  - `/api/v1/places`: Public search, recency filtering, and administrative CRUD.
  - `/api/v1/banners`: Managed banner slides.
  - `/api/v1/categories`: Categorization with icon tags.
  - `/api/v1/comments`: Reviews, replies, and moderation.
  - `/api/v1/favorites`: User bookmarking.
  - `/api/v1/stats`: Realtime aggregation queries.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Web** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons |
| **Admin Portal** | Vite, React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend API** | NestJS, Prisma ORM, PostgreSQL, Redis, Passport JWT (PS512 RSA) |
| **Media Handling** | Sharp (compression & thumbnailing), Multer |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database
- Git

### 1. Backend Setup
```bash
cd backend
npm install
# Set up .env with DATABASE_URL and JWT credentials
npx prisma generate
npx prisma db push
npm run build
node dist/main.js
```

### 2. Public Web Frontend
```bash
cd frontend-web
npm install
npm run build
npm run start -- -p 3000
```

### 3. Admin Backoffice Portal
```bash
cd admin-portal
npm install
npm run dev -- --port 5173
```

---

## 📄 License
This project is licensed under the MIT License.
