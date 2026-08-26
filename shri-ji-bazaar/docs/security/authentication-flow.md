# Authentication Flow

## Mobile
1. User enters mobile and password
2. POST /api/auth/login
3. Server validates and returns JWT token
4. Token stored in secure storage
5. Token included in subsequent requests

## Admin
1. Admin enters email and password
2. POST /api/auth/admin/login
3. Server validates and returns JWT token
4. Token stored in localStorage
5. Token included in Authorization header
