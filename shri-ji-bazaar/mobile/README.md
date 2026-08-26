# Shri Ji Bazaar - Mobile Application

## Overview
Flutter mobile application for Shri Ji Bazaar gaming results platform.

## Prerequisites
- Flutter SDK (>=3.0.0)
- Dart SDK (>=3.0.0)
- Android Studio / Xcode
- VS Code or IntelliJ IDEA

## Setup
```bash
flutter pub get
```

## Run
```bash
# Debug mode
flutter run

# Release mode
flutter run --release
```

## Build
```bash
# Android APK (Debug)
flutter build apk --debug

# Android APK (Release)
flutter build apk --release

# iOS (Debug)
flutter build ios --debug

# iOS (Release)
flutter build ios --release
```

## Testing
```bash
flutter test
flutter analyze
```

## Project Structure
```
lib/
├── core/           # Core functionality, themes, routing, network
├── shared/         # Shared widgets and components
├── features/       # Feature modules
│   ├── splash/
│   ├── authentication/
│   ├── home/
│   ├── games/
│   ├── game_details/
│   ├── results/
│   ├── my_activity/
│   ├── points/
│   ├── bonuses/
│   ├── referrals/
│   ├── notifications/
│   ├── profile/
│   ├── support/
│   └── settings/
└── main.dart       # Entry point
```

## Notes
- This app uses virtual points only - no real money functionality
- API base URL is configured in `lib/core/config/api_config.dart`
- All business logic will be implemented in the clean architecture layers
