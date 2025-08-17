# URL Shortening Service **Frontend** (Next.js + React)

## Executive Summary

This is a simple frontend for a URL shortening platform. Built with **Next.js (App Router) + React + TypeScript**, it focuses on a fast, accessible UX for creating and managing short links, while delegating heavy work (redirects, analytics, persistence) to the backend. It mirrors the backend’s reliability goals with client-side validation, resilient data fetching, and edge-friendly rendering.

Pairs with: **URL Shortening Service Backend (NestJS + PostgreSQL + Redis + BullMQ)**
Backend default: `http://localhost:8080`

---

## Core Architecture & Technology Stack

* **Framework**: Next.js 14+ (App Router), React 18, TypeScript
* **Data Fetching**: `fetch` 
* **Validation**: DTO, same custom slag & URL validation
* **UI**: Minimal, accessible components (works with Tailwind or CSS Modules)
* **Tooling**: ESLint + Prettier

### Rendering & Caching Strategy

* Public pages Home -> short url creation, All links
* Shorten URL flow **client-driven** with immediate feedback, copy-to-clipboard, and error reporting from backend.
* All links displays all shortened links with chronological order. Supports search. Consider pagination for large datasets.
* Dashboard links displays top performing links with hitsToday, hitsIn7d, hitsTotal filter.
* Redirects are handled by the backend (302/301) to ensure fast, server-side redirects.

## Screens & Routes

* `/` — Create short URL (form: target URL, custom alias), All links 
* `/dashboard` — Top performing links with hitsToday, hitsIn7d, hitsTotal
* Redirects (`/:slug`) are handled by the **backend** (302/301).
* not-found (`/404`) — handled by Next.js default
    
---

## Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/anidavtyan/url-shortener-fe.git
cd url-shortener-fe
npm install
```

### 2. Environment

Create `.env.local`:

```bash
# Backend base URL (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Public site URL (used for absolute links/QR)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> If your backend uses a different port/host, update `NEXT_PUBLIC_API_BASE_URL`.

### 3. Run

```bash
npm run dev
# open http://localhost:3000
```

---

## API Contract (assumed from backend)

* `POST /api/v1/urls/shorten`
  Body: `{ url, customSlug?, expireAt?, permanent? }`
  Returns: `{ slug, shortUrl, createdAt, ... }`
  Errors: `409` if alias taken, `400` on invalid input

* `GET /api/v1/urls/all`
  Returns newest→oldest (consider pagination for large datasets)

* `GET /api/v1/urls/top?limit=10&range=today`
  Returns list with top links in given range 'today', '7days', 'all'

* `GET /:slug` (backend)
  Issues `302` to target and **enqueues analytics** asynchronously

> The frontend mirrors backend validation (alias alphabet, lengths) but defers to backend for final validation & conflicts.

---

## Security & Privacy

* Client performs **basic validation**; backend enforces true validation & idempotency
* No secrets in client; only `NEXT_PUBLIC_*` vars are exposed

## Feature Enhancements

* **Auth & Ownership**: Scope “My links” to authenticated users (move away from IP-based identification)
* **Pagination **: Server-backed cursors for `/all`, filter by date/owner
* **Realtime**: Replace polling with WebSockets for live updates on link hits
* **i18n & Theming**: Locale switcher and dark mode
