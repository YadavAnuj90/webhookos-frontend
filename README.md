
<div align="center">

<img src="./public/logo.svg" width="90" height="90" alt="WebhookOS Logo" />

# WebhookOS Frontend

**A modern, developer-first webhook management platform**

[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![Deploy](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.0.0-success)](package.json)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔗 **Endpoints** | Create and manage webhook endpoints with secret signing |
| ⚡ **Events** | View and inspect all incoming webhook events in real time |
| 🔔 **Alerts** | Configure alerting rules with visual condition builders |
| 🔑 **API Keys** | Generate and manage API keys for programmatic access |
| 🔄 **Transformations** | Apply custom logic to transform webhook payloads |
| 🧪 **Playground** | Test and verify webhook signatures interactively |
| 🌐 **Portal** | Generate shareable customer-facing portal links |
| 🛡 **Admin Panel** | User management and full audit log |
| 🌗 **Dark / Light Mode** | Persistent theme toggle with smooth transitions |

---

## 🛠 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Zustand](https://img.shields.io/badge/Zustand-orange?style=for-the-badge)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-f97316?style=for-the-badge)

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | CSS Custom Properties (design system) |
| State | Zustand 4 |
| Data Fetching | TanStack React Query 5 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Notifications | React Hot Toast |

---

## 🚀 Getting Started

### Prerequisites

![Node](https://img.shields.io/badge/Node.js-≥18.0-339933?logo=node.js&logoColor=white)
![npm](https://img.shields.io/badge/npm-≥9.0-CB3837?logo=npm&logoColor=white)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd whk-frontend-v5

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ Never commit `.env.local` or any file containing secrets. It is already listed in `.gitignore`.

### Run Development Server

```bash
npm run dev
# → http://localhost:3001
```

### Build for Production

```bash
npm run build
npm start
# → http://localhost:3001
```

---

## 📁 Project Structure

```
whk-frontend-v5/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint + type-check on every push & PR
│       └── deploy.yml          # Deploy to production on push to main
├── public/
│   └── logo.svg                # Round SVG brand logo
├── src/
│   ├── app/
│   │   ├── (app)/              # Protected app pages (requires auth)
│   │   │   ├── dashboard/
│   │   │   ├── endpoints/
│   │   │   ├── events/
│   │   │   ├── alerts/
│   │   │   ├── api-keys/
│   │   │   ├── transformations/
│   │   │   ├── playground/
│   │   │   ├── portal/
│   │   │   └── admin/
│   │   ├── auth/               # Login / auth pages
│   │   └── globals.css         # Design system & theme variables
│   ├── components/
│   │   └── layout/
│   │       └── AppShell.tsx    # Sidebar + Topbar shell
│   ├── lib/
│   │   └── api.ts              # All API functions (React Query)
│   └── store/                  # Zustand global state stores
├── .env.local                  # ← NOT committed (in .gitignore)
├── .gitignore
├── README.md
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 🔄 CI / CD Workflows

| Workflow | Trigger | What it does |
|---|---|---|
| **CI** | Every push & PR | Installs deps → Type-check → Build |
| **Deploy** | Push to `main` | Builds and deploys to production |

Workflow files are in `.github/workflows/`. Update the deploy step in `deploy.yml` to match your hosting provider (Vercel, Railway, etc.).

---

## 🎨 Theming

The app ships with **dark mode** (default) and **light mode** toggled via the ☀️/🌙 button in the top bar. The preference is persisted in `localStorage`.

Theming works via a `data-theme="light"` attribute on `<html>`, with all design tokens defined as CSS custom properties in `globals.css`.

```css
/* Dark (default) */
:root { --bg: #0d0f1a; --text: #e2e4f0; }

/* Light */
[data-theme="light"] { --bg: #f0f2ff; --text: #1a1d2e; }
```

---

## 📄 License

MIT © 2024 Anujali Tech
