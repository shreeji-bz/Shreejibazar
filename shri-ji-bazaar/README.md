# Shri Ji Bazaar

## Project Overview

Shri Ji Bazaar is a multi-platform application for managing and viewing game schedules and results. The project consists of:

- **Flutter Mobile App** - Cross-platform mobile application for users
- **Node.js + TypeScript Backend** - REST API server with WebSocket support
- **React + Vite Admin Panel** - Web-based admin dashboard
- **PostgreSQL Database** - Primary data store (via Supabase)
- **Redis** - Caching and session management

## Architecture

The project follows **Clean Architecture** principles:

```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                │
│  (Mobile UI / Admin Panel UI)                       │
├─────────────────────────────────────────────────────┤
│                   Application Layer                 │
│  (Use Cases / Controllers)                          │
├─────────────────────────────────────────────────────┤
│                     Domain Layer                    │
│  (Entities / Repository Interfaces)                 │
├─────────────────────────────────────────────────────┤
│                      Data Layer                     │
│  (Models / Data Sources / Repository Impls)         │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Mobile | Flutter, Dart, GetX |
| Backend | Node.js, TypeScript, Express |
| Database | PostgreSQL (Supabase) |
| Cache | Redis |
| Admin | React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit |
| API | REST + WebSocket |
| Auth | JWT |

## Project Structure

```
shri-ji-bazaar/
├── mobile/          # Flutter mobile application
├── backend/         # Node.js + TypeScript API server
├── admin/           # React + Vite admin panel
├── database/        # Database schemas, migrations, seeds
├── docs/            # Documentation
├── docker/          # Docker configuration files
├── scripts/         # Setup and utility scripts
├── tests/           # Cross-project test configuration
├── docker-compose.yml
└── README.md
```

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Flutter SDK 3.16+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd shri-ji-bazaar
```

2. Run setup script:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

3. Start all services:
```bash
docker-compose up -d
```

### Manual Setup

#### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run dev
```
Server runs at http://localhost:3000

#### Admin Panel
```bash
cd admin
npm install
npm run dev
```
Admin runs at http://localhost:5173

#### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## Environment Configuration

### Backend (.env)
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
```

### Admin (.env)
```
VITE_API_URL=http://localhost:3000/api
```

### Mobile (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Running Tests

```bash
# Backend
cd backend && npm test

# Mobile
cd mobile && flutter test

# Admin
cd admin && npm test
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild a service
docker-compose up -d --build backend
```

## API Documentation

See [docs/api/](docs/api/) for detailed API documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

Proprietary - Shri Ji Bazaar
