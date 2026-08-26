# API Integration

## Base URL
Configured via `VITE_API_URL` environment variable.
Default: `http://localhost:3000/api`

## Request Flow
Widget -> Controller -> UseCase -> Repository -> Datasource -> ApiService -> HTTP
