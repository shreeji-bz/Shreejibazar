# Clean Architecture

## Domain Layer
- Contains business entities and repository interfaces
- No external dependencies

## Data Layer
- Repository implementations
- Data models and data sources
- Depends on domain layer only

## Presentation Layer
- UI components and state management
- Uses use cases from domain layer
