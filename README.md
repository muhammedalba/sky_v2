# 🌌 Sky Galaxy - Premium E-commerce Admin Dashboard

A powerful, modern, and high-performance e-commerce management dashboard built with **Next.js 15 (App Router)**, **TypeScript**, and **TailwindCSS**.

---

## 🚀 Key Features

- **Premium Design**: Modern UI with dark mode, glassmorphism, and smooth animations.
- **Role-Based Security**: Strict protection for admin routes.
- **Internationalization (i18n)**: Full support for English and Arabic with automatic RTL detection.
- **Modular API Architecture**: Clean separation of API logic with centralized environment variables.
- **State Management**: Performance-optimized using Zustand.
- **Server State**: Robust data fetching and caching with React Query.

---

## 📂 Project Structure

```text
sky_v2/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── [locale]/         # Multilingual routes (ar/en)
│   │   ├── home/         # 🏠 Landing Page
│   │   ├── dashboard/    # 🔒 Protected Admin Dashboard
│   │   ├── login/        # Auth Pages
│   │   └── ...
├── components/           # UI & Layout Components
│   ├── layout/           # Sidebar, Topbar, DashboardLayout
│   └── ui/               # Reusable atomic components & Icons
├── hooks/                # Custom React Hooks (API & Business logic)
├── lib/                  # Core Utilities & Configuration
│   ├── api/              # 🛰️ Modular API Client & Modules
│   ├── auth.ts           # Authentication & Authorization helpers
│   └── utils.ts          # Helper functions (Currency, Date formatting)
├── messages/             # Translation files (JSON)
├── store/                # Global state (Zustand)
└── types/                # TypeScript interfaces and types
```

---

## �️ API System & Endpoints

The project uses a **Modular API Layer**. All endpoints are configurable via `.env` to ensure zero code modification when moving environments.

### Authentication Endpoints
- `POST` Login: `${NEXT_PUBLIC_ENDPOINT_AUTH_LOGIN}`
- `POST` Register: `${NEXT_PUBLIC_ENDPOINT_AUTH_REGISTER}`
- `GET` Profile: `${NEXT_PUBLIC_ENDPOINT_AUTH_ME}`

### Core Modules
- **Products**: Manage catalog, inventory, and statistics.
- **Orders**: Real-time order tracking and management.
- **Categories**: Organize products and view department stats.
- **Users**: Admin-level user management and role assignment.

---

## 🔐 Environment Variables (`.env`)

Configuration is managed entirely through environment variables. Copy `.env.example` to `.env` before starting.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base API URL | - |
| `NEXT_PUBLIC_APP_NAME` | Website Name | Sky Galaxy |
| `NEXT_PUBLIC_DEFAULT_LOCALE`| Default Language | en |
| `NEXT_PUBLIC_DEFAULT_CURRENCY`| Formatting Currency | USD |
| `NEXT_PUBLIC_ENDPOINT_*` | API Route paths | (Configurable) |

---

## �️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **Logic/Forms**: React Hook Form + Zod
- **Icons**: Custom SVG managed through `Icons.tsx`

---

## � Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Update your NEXT_PUBLIC_API_URL and other variables
   ```

3. **Run in development**:
   ```bash
   npm run dev
   ```

---

## 🛡️ Security Logic

- **Guest**: Can only access `home`, `login`, and `signup`.
- **Authenticated User**: Can access `home` and `profile`.
- **Admin/Manager**: Has full access to the `dashboard` and management tools.
- *Any unauthorized attempt to access `/dashboard` will redirect the user to `/login` or `/home` based on their auth status.*

---

## 🎨 Design System

We use a premium color palette centered around the **Primary (Blue/Indigo)** and **Secondary (Slate/Zinc)** scales, optimized for both high-contrast light mode and deep-space dark mode.

---

Built with ❤️ by **Antigravity AI**
