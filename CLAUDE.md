# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start dev server (scan QR with Expo Go)
npx expo start --android
npx expo start --ios
npx expo start --web
```

There are no lint or test scripts configured.

The API base URL is read from `EXPO_PUBLIC_API_URL` (env var); defaults to `http://192.168.1.5:3333`.

## Architecture Overview

React Native + Expo (SDK 54) pizzeria app with two distinct UIs: **customer ordering** and **admin/staff management panel**, selected at runtime by user role.

### Provider hierarchy (`App.tsx`)

```
ThemeProvider → AppContent → GestureHandlerRootView
  └── SafeAreaProvider
        └── AuthProvider
              └── CartProvider
                    └── NavigationContainer
                          └── RootNavigator
```

`RootNavigator` gates on `isAuthenticated`: unauthenticated users see `AuthNavigator` (Login/Register); authenticated users see `AppNavigator`.

### Navigation structure

`AppNavigator` is a native stack whose root screen is `TabNavigator` (registered as `MainTabs`). All full-screen modals and drill-down screens (ProductDetails, Cart, Checkout, Admin forms, etc.) live on the stack above the tabs.

`TabNavigator` renders **different tab sets** based on auth role:
- **Customer** (`!isStaff`): Home · Cardápio · Pedidos · Perfil
- **Staff** (`isStaff`): AdminPedidos · AdminProdutos · (AdminRelatorios + AdminGerenciar if `isAdmin`) · Perfil

Navigation types are declared in `src/navigation/types.ts`:
- `AppTabParamList` — bottom tab screens
- `AppStackParamList` — stack screens pushed on top of tabs

### Auth & role system

`AuthContext` (`src/contexts/AuthContext.tsx`) persists a JWT to `@pizzaria:token` (AsyncStorage). The `api` Axios instance (`src/services/api.ts`) auto-attaches it via a request interceptor.

User roles: `CLIENTE` | `FUNCIONARIO` | `ADMIN`. The context exposes boolean helpers: `isCliente`, `isFuncionario`, `isAdmin`, `isStaff` (`isStaff = isFuncionario || isAdmin`). Gate UI using these — never read `usuario.papel` directly in screens.

### Color / theme system

Two sources of truth for colors:

1. **`src/theme/colors.ts`** — exports `darkColors` and `lightColors` (type `AppColors`). Consumed via `useTheme()` → `colors` for all StyleSheet-based components. Key values:
   - `colors.primary` `#C0392B` — red (main actions)
   - `colors.accent` `#B8860B` — dark gold (highlights, prices)
   - `colors.bg` `#0A0A0A` — deep black background

2. **`tailwind.config.js`** — mirrors those values as Tailwind tokens (`primary`, `accent`, `dark`, `offwhite`, etc.) for components using NativeWind class names.

Prefer `StyleSheet` + `useTheme()` for new screens; NativeWind classes exist in older components.

### Service layer

All API calls go through services in `src/services/`. Each service imports the shared `api` Axios instance. Services follow the naming convention `<domain>Service.ts`:
- `authService` — login / register
- `userService` — current user profile
- `productService` — products + categories
- `orderService` — customer orders
- `adminService` — admin order management, status updates
- `marketingService` — banners / promotions

### Shared state

- `AuthContext` — user identity, token, role predicates
- `CartContext` — cart items, coupon application, totals
- `ThemeContext` — `colors` object + `isDark` flag + `toggleTheme()`; theme preference stored at `@pizzaria:theme`

### Key conventions

- All domain types are in `src/types/index.ts` in Brazilian Portuguese (`Pedido`, `Produto`, `Categoria`, `StatusPedido`, etc.).
- `StatusPedido` progression: `PENDENTE → PREPARANDO → ENTREGANDO → ENTREGUE` (or `CANCELADO` at any step).
- Animations use `react-native-reanimated` (Reanimated 4) or `Animated` from core RN — both are present.
- `expo-linear-gradient` is available for gradient backgrounds.
- Safe area insets are handled via `useSafeAreaInsets()` — always apply `insets.top` to headers and `insets.bottom` to tab bars.
