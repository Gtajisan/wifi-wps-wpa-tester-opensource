# WiFi WPS/WPA Tester Enhanced

## Overview
An advanced WiFi WPS/WPA Security Testing companion app built with Expo React Native. Features a dark cybersecurity-themed UI with network scanning, WPS PIN algorithm database, attack mode simulation, and developer credits.

## Developer
- Farhan Muh Tasim (Gtajisan)
- Base Inspired From: StrykerApp
- Enhanced Using: FARHAN-Shot

## Architecture
- **Frontend:** Expo React Native with Expo Router (file-based routing)
- **Backend:** Express.js (TypeScript) on port 5000
- **Frontend Dev Server:** Expo on port 8081
- **Fonts:** Rajdhani (UI text), Share Tech Mono (monospace/terminal)
- **Theme:** Dark cybersecurity (deep blacks, cyan accents, green/orange/red status colors)

## Key Files
- `app/(tabs)/index.tsx` — WiFi Network Scanner screen
- `app/(tabs)/algorithms.tsx` — WPS PIN Algorithm Database (18 algorithms)
- `app/(tabs)/attack.tsx` — Attack Mode Selector (Pixie Dust, Brute Force, PIN)
- `app/(tabs)/about.tsx` — Developer credits and legal disclaimer
- `constants/colors.ts` — Color theme constants
- `README.md` — Full project documentation
- `.github/workflows/build-and-release-apk.yml` — CI/CD for APK builds

## Workflows
- `Start Backend` — `npm run server:dev` (Express on port 5000)
- `Start Frontend` — `npm run expo:dev` (Expo on port 8081)

## Dependencies
- @expo-google-fonts/share-tech-mono, @expo-google-fonts/rajdhani (custom fonts)
- expo-haptics, expo-linear-gradient, expo-blur, expo-glass-effect
- @expo/vector-icons (Ionicons, MaterialCommunityIcons)
- @tanstack/react-query
