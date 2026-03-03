# SSShopee ERP

**Specially made for Shubham Super Shopee.**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Capacitor](https://img.shields.io/badge/capacitor-%23119EFF.svg?style=for-the-badge&logo=capacitor&logoColor=white)
![Electron](https://img.shields.io/badge/electron-%2320232a.svg?style=for-the-badge&logo=electron&logoColor=9FEAF9)

A modern ERP (Enterprise Resource Planning) app for single-shop operations. It tracks Income, Expenses, Inventory, Purchases, and Udhar (Credit) ledgers, with support for Web, Android APK, and Windows desktop installer builds.

## Features

- **Main Hub**: One-screen module launcher with all ERP sections.
- **Dashboard**: Daily and monthly metrics with visual analytics charts.
- **Inventory & Products**: Product CRUD, stock tracking, low-stock alerts.
- **Purchases**: Supplier-wise purchase logging and filtering.
- **Income & Expenses**: Day-wise cash-flow management.
- **Udhar Ledger**: Credit entries, due tracking, and payment settlement.
- **Yearly Overview**: Month-level business trend view.
- **Offline-first**: Stores data locally and works without internet.

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Recharts, Lucide React.
- **Data Layer**: Local `localStorage` service (`src/services/storage.ts`).
- **Mobile Packaging**: Capacitor 8 (Android).
- **Desktop Packaging**: Electron 37 + electron-builder (NSIS).

## Quick Start

### Prerequisites

- Node.js (LTS recommended)

### Install dependencies

```bash
npm install
```

### Run web app in development

```bash
npm run dev
```

### Build web production bundle

```bash
npm run build
```

### Preview production bundle

```bash
npm run preview
```

## Android APK (Capacitor)

### Prerequisites

1. Node.js
2. Android Studio
3. JDK

### Build and open native project

```bash
npm run build
npx cap sync android
npx cap open android
```

In Android Studio:

1. Wait for Gradle sync
2. Open `Build > Build Bundle(s) / APK(s) > Build APK(s)`
3. Use the generated APK link from the output panel

## Windows App (Electron)

### Run desktop app in dev mode

```bash
npm run desktop:dev
```

### Build Windows installer

```bash
npm run desktop:build
```

Output:

- `dist_electron/`
- Example: `dist_electron/Shubham Super Shopee ERP-Setup-0.0.0.exe`

## Project Notes

- App was originally created as **Store ERP Mobile App** and later rebranded + redesigned for **Shubham Super Shopee**.
- Routing is configured via `HashRouter` for desktop `file://` compatibility.
- All records are local; clearing app/browser data removes stored records.
