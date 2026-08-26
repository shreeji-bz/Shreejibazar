# System Architecture

## Overview

Shri Ji Bazaar follows a layered architecture pattern with:
- Flutter mobile app (client)
- Node.js + TypeScript backend (API server)
- PostgreSQL database (data persistence)
- Redis (caching and sessions)
- React + Vite admin panel

## Architecture Layers

- Presentation Layer (Mobile UI / Admin Panel)
- Application Layer (Use Cases / Controllers)
- Domain Layer (Entities / Repository Interfaces)
- Data Layer (Models / Data Sources / Repository Implementations)

## Communication

- REST API for standard CRUD operations
- WebSocket for real-time notifications and result updates
