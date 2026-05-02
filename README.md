# 🎮 Aether Arena

**India's #1 Mobile Esports Tournament Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📸 Overview

Aether Arena is a full-featured esports tournament platform built for mobile gamers in India. Players can browse tournaments across popular mobile titles (Free Fire, BGMI, COD Mobile, Minecraft & more), register with secure Google Pay (UPI) payments, track leaderboards, watch live streams, earn virtual currency (Aether), and climb through a competitive league system.

![Aether Arena Dashboard](https://aetherarena.com/og-image.png)

---

## ✨ Features

### 🏆 Tournament System
- **Browse & Filter** — Search tournaments by game, status (upcoming/live/completed), and format (solo/duo/squad)
- **One-Click Registration** — Register for free tournaments instantly; paid tournaments use secure Google Pay (UPI)
- **Payment Verification** — Users pay via GPay and submit UTR/Transaction ID; admins verify within 15-30 minutes
- **Razorpay Coming Soon** — Automated payment gateway integration is planned for a future update
- **Room Credentials** — Auto-dispensed room ID and password after payment verification
- **Featured Tournaments** — Highlighted tournaments with premium placement on homepage

### 💰 Payment System
- **Google Pay (Active)** — Manual UPI payment with admin verification flow
- **UTR Verification** — Users submit transaction reference; admins approve/reject in real-time
- **Razorpay (Coming Soon)** — Automated payment gateway with instant verification (UI placeholder visible)
- **No Account Details Exposed** — Users only see the GPay number, no account holder name or bank details

### 📊 Leaderboard & Ranking
- **Global Leaderboard** — Filter by game and time period (weekly/monthly/all-time)
- **Per-Game Stats** — Total points, wins, kills, K/D ratio, avg placement, win rate
- **Top Players Widget** — Quick-glance top players on the homepage

### 🏅 League System
- **8 Competitive Tiers** — Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster → Legend
- **League Points** — Earn points through tournament performance
- **Profile Badges** — Display your current league tier on your profile

### 💎 Aether Virtual Currency
- **Earn Aether** — Daily check-ins, tasks, referrals, and tournament rewards
- **Redeem for INR** — Convert Aether coins to real money via UPI transfer
- **Welcome Bonus** — 50 Aether coins on signup
- **Referral Program** — 30 Aether per referral

### 🔐 Authentication
- **Email/Password** — Secure registration and login with bcrypt hashing (12 rounds)
- **Discord OAuth** — One-click sign up/login via Discord
- **4-Step Signup Wizard** — Identity → Contact → Security → Finish (with username availability check)
- **Session Management** — Cookie-based sessions with 30-day expiry and automatic cleanup
- **Email Verification** — Gmail SMTP verification with 24-hour token expiry
- **Account Lockout** — 5 failed login attempts = 15-minute lock
- **Admin Roles** — First user becomes admin; granular admin access for platform management

### 📺 Live Streams
- **Stream Schedule** — Upcoming and live stream calendar
- **Platform Integration** — Support for YouTube, Twitch, and custom stream URLs
- **Featured Streams** — Auto-rotating stream banner on the homepage

### 🛒 Affiliate Store & Top Up
- **Product Carousel** — Browse gaming gear and accessories
- **Codashop Integration** — Quick top-up packs for in-game currency
- **Click Tracking** — Track affiliate link clicks

### 👨‍💼 Admin Panel
- **Dashboard Analytics** — Overview stats (users, tournaments, revenue, pending verifications)
- **Tournament CRUD** — 3-step wizard: Details → Schedule → Publish
- **Payment Verification** — Verify/reject GPay payments with UTR matching
- **Game Management** — Manage supported games and their metadata
- **Stream Management** — Schedule and manage live stream events
- **Affiliate Management** — Add/edit affiliate product links
- **Top-Up Pack Management** — CRUD for Codashop affiliate packs
- **Aether Management** — Adjust user balances, process redemption requests
- **Platform Settings** — Key-value config for GPay number, social links, maintenance mode, etc.
- **Analytics Dashboard** — Recharts-powered data visualizations

### 🎨 UI/UX
- **Dark Gaming Theme** — Custom `arena-*` color tokens inspired by esports aesthetics
- **3-Panel Layout** — Left sidebar navigation, content area, and contextual right panel
- **Fully Responsive** — Mobile-first design with hamburger menu and adaptive layouts
- **PWA Ready** — Manifest, theme colors, and mobile-optimized experience
- **Accessible** — ARIA labels, semantic HTML, keyboard navigation, alt text
- **Toast Notifications** — Real-time feedback for user actions (success, error, info)
- **Loading Skeletons** — Placeholder UI during data fetching
- **Light/Dark Mode** — System-aware theme switching with manual override

### 📱 Social Integration
- **YouTube** — Channel link in footer and contact page
- **Instagram** — Profile link across the platform
- **Discord** — Server invite for community support
- **WhatsApp** — Channel link for updates

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | React framework with server components |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **UI Library** | shadcn/ui (New York) | Accessible component primitives |
| **Icons** | Lucide React | Consistent icon set |
| **Database** | PostgreSQL (Supabase) | Production-grade relational database |
| **ORM** | Prisma 6 | Type-safe database access |
| **State Management** | Zustand 5 | Client-side global state |
| **Server State** | TanStack Query v5 | Async data fetching & caching |
| **Validation** | Zod v4 | Schema validation |
| **Password Hashing** | bcryptjs (12 rounds) | Secure credential storage |
| **Authentication** | Custom cookie-based | Session tokens with bcrypt |
| **Email** | Nodemailer (Gmail SMTP) | Email verification |
| **Rate Limiting** | ioredis / Vercel KV | IP-based and account-based limits |
| **Animations** | Framer Motion | Smooth UI transitions |
| **Charts** | Recharts | Data visualization |
| **Deployment** | Vercel | Serverless deployment with cron jobs |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.17 or **Bun** >= 1.0
- **PostgreSQL** database (Supabase recommended)

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

# Start development server
bun run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooler) |
| `DIRECT_URL` | Yes | PostgreSQL direct connection |
| `NEXT_PUBLIC_BASE_URL` | Yes | Deployed domain URL |
| `SETUP_SECRET` | Yes | Protects the initial setup endpoint |
| `CRON_SECRET` | Yes | Protects cron job endpoint |
| `GMAIL_USER` | No | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | No | Gmail app password for SMTP |
| `DISCORD_CLIENT_ID` | No | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | No | Discord OAuth client secret |
| `RAZORPAY_KEY_ID` | No | Razorpay key (Coming Soon) |
| `RAZORPAY_KEY_SECRET` | No | Razorpay secret (Coming Soon) |

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Production build |
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
│   └── schema.prisma          # Database schema (20+ models)
├── public/
│   ├── favicon.ico
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO robots
│   └── logo*.webp/png/svg     # App logos
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with SEO metadata
│   │   ├── page.tsx            # SPA entry — all views rendered here
│   │   ├── globals.css         # Global styles & arena-* theme tokens
│   │   ├── sitemap.ts          # Dynamic sitemap generation
│   │   └── api/                # API routes (see below)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui + custom components
│   │   ├── views/              # Page views (SPA routing)
│   │   └── providers.tsx       # React Query + Theme providers
│   ├── lib/
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── auth.ts             # Session/token management
│   │   ├── env.ts              # Environment variable validation
│   │   ├── validations.ts      # Zod schemas
│   │   ├── email.ts            # Gmail SMTP sender
│   │   ├── rate-limit.ts       # Redis-backed rate limiting
│   │   ├── api.ts              # apiFetch helper
│   │   ├── store.ts            # Zustand stores
│   │   ├── aether.ts           # Aether coin logic
│   │   ├── theme.ts            # Theme configuration
│   │   └── utils.ts            # Utilities
│   └── hooks/
│       ├── use-mobile.ts
│       └── use-toast.ts
├── mini-services/
│   └── discord-bot/            # Standalone Discord bot
├── .env.example
├── vercel.json                 # Vercel cron jobs
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
| POST | `/api/auth/login` | Login with email/username/phone |
| POST | `/api/auth/logout` | End current session |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/auth/discord` | Redirect to Discord OAuth |
| GET | `/api/auth/discord/callback` | Handle Discord OAuth callback |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/resend-verification` | Resend verification email |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order (Coming Soon) |
| POST | `/api/payments/verify` | Verify Razorpay payment (Coming Soon) |
| POST | `/api/tournaments/[id]/register` | Register with GPay UTR reference |

### Aether (Virtual Currency)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/aether/balance` | Get balance |
| POST | `/api/aether/checkin` | Daily check-in |
| GET | `/api/aether/streak` | Login streak |
| POST | `/api/aether/referral` | Referral info |
| POST | `/api/aether/redeem` | Redeem for INR |
| GET | `/api/aether/transactions` | Transaction history |
| GET | `/api/aether/tasks` | Available tasks |
| POST | `/api/aether/tasks/[key]/complete` | Complete a task |

### Tournaments, Leaderboard, Profiles, etc.
_(Full API documentation available in code — 40+ endpoints)_

### Admin (requireAdmin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET/PUT | `/api/admin/settings` | Platform settings (GPay, social, etc.) |
| GET/POST | `/api/admin/tournaments` | List/create tournaments |
| GET | `/api/admin/registrations` | List registrations (filter by status) |
| POST | `/api/admin/registrations/[id]/verify` | Verify payment |
| POST | `/api/admin/registrations/[id]/reject` | Reject payment |
| GET/POST | `/api/admin/games` | Manage games |
| GET/POST | `/api/admin/streams` | Manage streams |
| GET/POST | `/api/admin/affiliates` | Manage affiliates |
| GET/POST | `/api/admin/topup-packs` | Manage top-up packs |
| POST | `/api/admin/aether/adjust` | Adjust Aether balance |
| GET/PATCH | `/api/admin/redemptions` | Process redemptions |

---

## 🗄 Database Schema

The platform uses **20+ models** powered by Prisma + PostgreSQL (Supabase):

| Model | Purpose |
|-------|---------|
| `Profile` | User accounts with league, stats, preferences, and referrals |
| `AccountCredential` | Email/password authentication with verification |
| `Session` | Cookie-based session management (30-day) |
| `Account` | OAuth provider accounts (Discord) |
| `Game` | Supported game catalog |
| `Tournament` | Tournament details, schedule, room credentials |
| `TournamentRegistration` | Player registration + payment tracking (GPay UTR) |
| `Match` / `MatchParticipant` | Individual match stats |
| `Leaderboard` | Aggregated per-game/period entries |
| `Notification` | User notifications |
| `Announcement` | Platform-wide announcements |
| `StreamSchedule` | Live stream events |
| `AffiliateLink` | Product affiliate links with click tracking |
| `PlatformSetting` | Key-value config store (GPay number, social links, etc.) |
| `AetherBalance` / `AetherTransaction` | Virtual currency system |
| `AetherTask` / `AetherTaskProgress` | Earn Aether tasks |
| `UserStreak` | Login streak tracking |
| `RedemptionRequest` | Aether → INR redemption |
| `TopupPack` | Codashop affiliate packs |
| `PhoneVerification` | OTP for phone verification |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy — auto-deploys on push to `main`

### Current Production

- **Frontend + API**: Vercel (serverless)
- **Database**: Supabase PostgreSQL
- **Email**: Gmail SMTP
- **Rate Limiting**: Vercel KV (Upstash Redis)

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
