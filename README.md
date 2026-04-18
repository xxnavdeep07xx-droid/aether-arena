# 🎮 Aether Arena

**India's #1 Mobile Esports Tournament Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📸 Overview

Aether Arena is a full-featured esports tournament platform built for mobile gamers in India. Players can browse tournaments across popular mobile titles, register with UPI payments, track leaderboards, watch live streams, and climb through a competitive league system.

![Aether Arena Dashboard](https://aetherarena.com/og-image.png)

---

## ✨ Features

### 🏆 Tournament System
- **Browse & Filter** — Search tournaments by game, status (upcoming/live/completed), and format (solo/duo/squad)
- **One-Click Registration** — Register for tournaments with secure UPI payment flow
- **Payment Verification** — Admin panel for verifying screenshot-based payments
- **Room Credentials** — Auto-dispensed room ID and password after registration
- **Featured Tournaments** — Highlighted tournaments with premium placement on homepage

### 📊 Leaderboard & Ranking
- **Global Leaderboard** — Filter by game and time period (weekly/monthly/all-time)
- **Per-Game Stats** — Total points, wins, kills, K/D ratio, avg placement, win rate
- **Top Players Widget** — Quick-glance top 5 on the homepage

### 🏅 League System
- **8 Competitive Tiers** — Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster → Legend
- **League Points** — Earn points through tournament performance
- **Profile Badges** — Display your current league tier on your profile

### 🔐 Authentication
- **Email/Password** — Secure registration and login with bcrypt hashing
- **Session Management** — Token-based sessions with automatic expiry
- **Admin Roles** — Granular admin access for platform management

### 📺 Live Streams
- **Stream Schedule** — Upcoming and live stream calendar
- **Platform Integration** — Support for YouTube, Twitch, and custom stream URLs
- **Featured Streams** — Auto-rotating stream banner on the homepage

### 🛒 Affiliate Store
- **Product Carousel** — Browse gaming gear and accessories
- **Click Tracking** — Track affiliate link clicks
- **Discount Display** — Show original vs. discounted pricing

### 👨‍💼 Admin Panel
- **Dashboard Analytics** — Overview stats (users, tournaments, revenue)
- **Tournament CRUD** — Full create/read/update/delete for tournaments
- **Game Management** — Manage supported games and their metadata
- **Registration Management** — Verify/reject tournament registrations with payments
- **Stream Management** — Schedule and manage live stream events
- **Affiliate Management** — Add/edit affiliate product links
- **Platform Settings** — Key-value configuration store for platform-wide settings

### 🎨 UI/UX
- **Dark Gaming Theme** — Custom `arena-*` color tokens inspired by esports aesthetics
- **3-Panel Layout** — Left sidebar navigation, content area, and contextual right panel
- **Fully Responsive** — Mobile-first design with hamburger menu and adaptive layouts
- **Accessible** — ARIA labels, semantic HTML, keyboard navigation, alt text
- **Toast Notifications** — Real-time feedback for user actions (success, error, info)
- **Loading Skeletons** — Placeholder UI during data fetching

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | React framework with server components |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **UI Library** | shadcn/ui (New York) | Accessible component primitives |
| **Icons** | Lucide React | Consistent icon set |
| **Database** | SQLite via Prisma ORM | Lightweight relational database |
| **State Management** | Zustand | Client-side global state |
| **Server State** | TanStack Query v5 | Async data fetching & caching |
| **Validation** | Zod v4 | Schema validation |
| **Password Hashing** | bcryptjs | Secure credential storage |
| **Forms** | React Hook Form | Form state management |
| **Animations** | Framer Motion | Smooth UI transitions |
| **Date Handling** | date-fns | Date formatting & manipulation |
| **Charts** | Recharts | Data visualization |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.17 or **Bun** >= 1.0
- **SQLite** (bundled with Prisma)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/aether-arena.git
cd aether-arena

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Push database schema
bun run db:push

# Seed the database with sample data
bun run db:seed

# Start development server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env` file in the project root:

```env
# Database (SQLite)
DATABASE_URL=file:./db/custom.db

# Discord OAuth (optional — for social login)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Production build with static asset copy |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database (destructive) |

---

## 📁 Project Structure

```
aether-arena/
├── prisma/
│   ├── schema.prisma          # Database schema (14 models)
│   └── seed.ts                # Database seeder
├── public/
│   ├── favicon.ico
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO robots
│   └── logo.png                # App logo
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with SEO metadata
│   │   ├── page.tsx            # SPA entry — all views rendered here
│   │   ├── globals.css         # Global styles & arena-* theme tokens
│   │   └── sitemap.ts          # Dynamic sitemap generation
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── providers.tsx       # React Query + next-themes providers
│   ├── lib/
│   │   ├── db.ts               # Prisma client singleton
│   │   └── auth.ts             # Session/token management
│   ├── stores/
│   │   ├── useAppStore.ts      # App navigation state (Zustand)
│   │   ├── useAuthStore.ts     # Authentication state (Zustand)
│   │   └── useSearchStore.ts   # Search query state (Zustand)
│   └── app/
│       └── api/
│           ├── auth/           # register, login, logout, me, discord
│           ├── tournaments/    # CRUD, register, game listing
│           ├── registrations/  # User registration endpoints
│           ├── games/          # Game catalog
│           ├── leaderboard/    # Leaderboard queries
│           ├── profiles/       # User profiles
│           ├── notifications/  # Notification CRUD
│           ├── streams/        # Stream schedule
│           ├── affiliates/     # Affiliate links
│           └── admin/          # Admin-only endpoints
│               ├── stats/
│               ├── tournaments/
│               ├── registrations/
│               ├── games/
│               ├── streams/
│               ├── affiliates/
│               └── settings/
├── mini-services/              # Optional microservices (WebSocket, etc.)
├── eslint.config.mjs
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🌐 API Routes

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | End current session |
| GET | `/api/auth/me` | Get current user profile |

### Tournaments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tournaments` | List tournaments (paginated, filterable) |
| GET | `/api/tournaments/[id]` | Get tournament details |
| POST | `/api/tournaments/[id]/register` | Register for a tournament |
| GET | `/api/tournaments/games` | List supported games |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Get leaderboard (filter by game/period) |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/[id]` | Get user profile |
| PUT | `/api/profiles/[id]` | Update user profile |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Admin (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| POST/GET | `/api/admin/tournaments` | Create/list tournaments |
| GET | `/api/admin/registrations` | List all registrations |
| PATCH | `/api/admin/registrations/[id]/verify` | Verify payment |
| PATCH | `/api/admin/registrations/[id]/reject` | Reject payment |
| GET | `/api/admin/games` | List games |
| POST | `/api/admin/streams` | Create stream schedule |
| GET | `/api/admin/affiliates` | List affiliate links |
| GET/PUT | `/api/admin/settings` | Platform settings |

---

## 🗄 Database Schema

The platform uses **14 models** powered by Prisma + SQLite:

| Model | Purpose |
|-------|---------|
| `Profile` | User accounts with league, stats, and preferences |
| `AccountCredential` | Email/password authentication |
| `Session` | Token-based session management |
| `Account` | OAuth provider accounts (Discord) |
| `Game` | Supported game catalog (Free Fire, BGMI, etc.) |
| `Tournament` | Tournament details, schedule, and metadata |
| `TournamentRegistration` | Player registration + payment tracking |
| `Match` | Individual match within a tournament |
| `MatchParticipant` | Per-player match stats (kills, deaths, placement) |
| `Leaderboard` | Aggregated leaderboard entries per game/period |
| `Notification` | User notifications (registration, results, etc.) |
| `Announcement` | Platform-wide announcements |
| `StreamSchedule` | Live stream events with viewer tracking |
| `AffiliateLink` | Product affiliate links with click tracking |
| `PlatformSetting` | Key-value configuration store |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy

> **Note:** For SQLite, consider switching to PostgreSQL via Prisma for production Vercel deployments, or use a persistent volume.

### Docker

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'Add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Use shadcn/ui components over custom implementations
- Follow existing patterns in the codebase

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <strong>Aether Arena Team</strong>
</p>
