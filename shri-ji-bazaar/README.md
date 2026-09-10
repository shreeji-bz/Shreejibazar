# Shri Ji Bazaar

> Play. Earn. Win.

**Shri Ji Bazaar** is a full-stack gaming and rewards platform featuring 9 live games with real-time results, a points wallet system, and a complete admin management suite.

## Games Catalogue

The platform features 9 popular games:

| # | Game Name     | Opening Time | Result Time |
| - | ------------- | ------------ | ----------- |
| 1 | Delhi Bazar   | 3:00 PM      | 3:30 PM     |
| 2 | Shri Ganesh   | 4:35 PM      | 5:05 PM     |
| 3 | Faridabad     | 5:55 PM      | 6:25 PM     |
| 4 | Ghaziyabad    | 9:30 PM      | 10:00 PM    |
| 5 | Gali          | 11:35 PM     | 12:05 AM    |
| 6 | Disawar       | 4:30 PM      | 5:00 PM     |
| 7 | Kashi Morning | 10:00 AM     | 10:30 AM    |
| 8 | Kashi Day     | 12:40 PM     | 1:10 PM     |
| 9 | Kashi Night   | 9:13 PM      | 9:43 PM     |

### Round Flow

1. **Pending** — Round created, not yet open
2. **Open** — Users can view game and check results
3. **Closed** — Play window closed
4. **Result Declared** — Result announced, points awarded

## Points System

### Earning Points

| Activity        | Points         |
| --------------- | -------------- |
| View game       | +5             |
| Check result    | +3             |
| Daily login     | +10            |
| Referral signup | +50 (referrer) |
| Welcome bonus   | +100           |
| Claim bonus     | Variable       |

### Points Wallet

Each user has a `points_wallet` with balance, total_earned, and total_spent. Every point change creates a transaction record.

## Architecture

```
shri-ji-bazaar/
├── mobile/          # Flutter mobile app (iOS + Android)
├── backend/         # Node.js + TypeScript REST API + WebSocket
├── admin/           # React + Vite admin panel
├── database/        # PostgreSQL schemas, migrations, seeds
├── docker/          # Docker configs
├── scripts/         # Setup and dev scripts
├── docs/            # Full documentation
├── tests/           # Cross-service tests
├── assets/          # Shared branding assets
├── docker-compose.yml
└── README.md
```

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Mobile    | Flutter 3.x + Provider + GoRouter            |
| Backend   | Node.js 20 + TypeScript + Express + Supabase |
| Database  | PostgreSQL (Supabase)                        |
| Cache     | Redis                                        |
| Real-time | Socket.IO                                    |
| Admin     | React 18 + Vite + TypeScript + Tailwind CSS  |

## Quick Start

### Prerequisites

- Node.js >= 20
- Flutter >= 3.24
- Supabase account
- Redis
- Docker (optional)

### 1. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npm run dev
```

### 2. Setup Admin Panel

```bash
cd admin
npm install
npm run dev
```

### 3. Setup Mobile

```bash
cd mobile
flutter pub get
flutter run
```

### 4. Docker (All Services)

```bash
docker compose up --build
```

## Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secret-key-change-in-production
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

| Method | Path                            | Description         |
| ------ | ------------------------------- | ------------------- |
| GET    | `/api/v1/games`               | List all games      |
| GET    | `/api/v1/games/popular`       | Popular games       |
| GET    | `/api/v1/rounds/upcoming`     | Upcoming rounds     |
| GET    | `/api/v1/rounds/results`      | Latest results      |
| GET    | `/api/v1/points/wallet`       | Points wallet       |
| GET    | `/api/v1/points/transactions` | Transaction history |
| GET    | `/api/v1/bonuses`             | Available bonuses   |
| POST   | `/api/v1/bonuses/claim/:id`   | Claim bonus         |
| GET    | `/api/v1/referrals/stats`     | Referral stats      |
| GET    | `/api/v1/notifications`       | Notifications       |
| GET    | `/api/v1/banners`             | Active banners      |

## Database

See `database/schemas/` for full SQL definitions. Run via Supabase SQL editor or migration tooling.

## WebSocket Events

| Event                | Direction        | Description          |
| -------------------- | ---------------- | -------------------- |
| `result:declared`  | Server → Client | New result announced |
| `notification:new` | Server → Client | New notification     |

## Development

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Admin
cd admin && npm run dev

# Terminal 3: Mobile
cd mobile && flutter run
```

## License

Proprietary — Shri Ji Bazaar

cdcon
