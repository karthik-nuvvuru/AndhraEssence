# Mobile App - AndhraEssence

React Native (Expo) mobile app for the AndhraEssence food delivery platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS Simulator
npx expo run:ios
```

## Commands

```bash
# Start Expo dev server
npm start

# Run on iOS (requires Xcode)
npx expo run:ios

# Run on Android (requires Android SDK)
npx expo run:android

# Run on Web
npx expo start --web

# Start with specific platform
npx expo start --platform ios
npx expo start --platform android

# Build for production
npx expo export

# Prebuild native projects
npx expo prebuild

# Run with custom Metro port
EXPO_METRO_PORT=8082 npm start

# Linting
npx expo lint

# TypeScript check
npx tsc --noEmit

# Clear Metro cache
npx expo start --clear
```

## Prerequisites

### iOS
- Xcode 15+
- iOS Simulator (iOS 15+)
- CocoaPods

### Android
- Android Studio
- Android SDK
- Java 17+

## Project Structure

```
mobile/
├── app/                  # Expo Router screens
│   ├── _layout.tsx      # Root layout
│   ├── index.tsx        # Landing page
│   ├── onboarding/      # Onboarding flow
│   ├── auth/            # Authentication screens
│   ├── (tabs)/          # Tab navigation
│   │   ├── _layout.tsx  # Tab layout
│   │   ├── index.tsx    # Home
│   │   ├── search.tsx   # Search
│   │   ├── cart.tsx     # Cart
│   │   ├── orders.tsx   # Orders
│   │   └── profile.tsx  # Profile
│   ├── restaurant/      # Restaurant screens
│   ├── checkout.tsx     # Checkout
│   └── order/           # Order screens
├── components/          # Reusable components
├── services/            # API client and services
├── store/               # Zustand stores
├── theme/               # Design system
├── types/               # TypeScript types
└── utils/               # Utilities
```

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Landing | `/` | Welcome screen with logo |
| Onboarding | `/onboarding` | App introduction |
| Login | `/auth/login` | User login |
| Register | `/auth/register` | User registration |
| Home | `/(tabs)` | Restaurant listing |
| Search | `/(tabs)/search` | Search restaurants |
| Cart | `/(tabs)/cart` | Shopping cart |
| Orders | `/(tabs)/orders` | Order history |
| Profile | `/(tabs)/profile` | User profile |
| Restaurant | `/restaurant/[id]` | Restaurant details |
| Checkout | `/checkout` | Payment and delivery |
| Order Tracking | `/order/[id]` | Live order tracking |

## Environment Variables

Create an `.env` file in the `mobile/` directory:

```env
API_URL=http://localhost:8000
```

## Design System

The app uses a premium coral/orange theme (Zomato/Swiggy inspired):

- **Primary**: #FF4500 (Coral)
- **Background**: #0D0D0D (Deep Dark)
- **Accent**: #FFD60A (Electric Yellow)

## State Management

Uses Zustand for global state:
- `useAuthStore` - Authentication
- `useCartStore` - Shopping cart
- `useOrderStore` - Orders
- `useUIStore` - UI state

## API Integration

The app connects to the backend at `http://localhost:8000`:
- REST API at `/api/v1`
- WebSocket for live order tracking

## Troubleshooting

```bash
# Clear all caches
rm -rf node_modules/.cache
npx expo start --clear

# Reset iOS build
cd ios && rm -rf Pods && pod install && cd ..

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Expo doctor
npx expo-doctor
```

## Tech Stack

- **Framework**: React Native (Expo)
- **Routing**: Expo Router
- **State**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated
- **Styling**: StyleSheet + Design System