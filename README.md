# WiFi WPS/WPA Tester Enhanced

Advanced WiFi WPS/WPA Security Testing Tool — Enhanced Edition

## Developer

- **Developer:** Farhan Muh Tasim
- **GitHub:** [https://github.com/Gtajisan](https://github.com/Gtajisan)
- **Base Inspired From:** [StrykerApp](https://github.com/Stryker-Defense-Inc/strykerapp)
- **Enhanced Using:** [FARHAN-Shot](https://github.com/Porter-union-rom-updates/FARHAN-Shot)

## Features

- **WiFi Network Scanner** — Scan and analyze nearby access points with WPS vulnerability detection
- **Pixie Dust Attack** — Exploit weak nonce generation in WPS handshake (FARHAN-Shot integration)
- **PIN Algorithm Database** — 18 vendor-specific algorithms: Zhao, TpLink, ASUS, D-Link, Arris, Belkin, Netgear, Broadcom, and more
- **Brute Force Mode** — Sequential PIN testing with rate-limit detection and WPS lock awareness
- **WPS PIN Database** — Pre-computed known default PINs for common routers
- **Dark Cybersecurity UI** — Professional hacker-terminal themed interface

## Requirements

- Android 7.0 (Nougat) or higher
- Root access required for WPS testing
- Location permission (required for WiFi scanning on Android)
- Uses WpsConnectionLibrary via JitPack

## Tech Stack

- **Frontend:** React Native / Expo (Expo Router, file-based routing)
- **Backend:** Express.js (TypeScript)
- **UI:** Custom dark cybersecurity theme with Rajdhani + Share Tech Mono fonts
- **State:** React Query, AsyncStorage

## Build & Run

### Development

```bash
# Install dependencies
npm install

# Start the backend server (port 5000)
npm run server:dev

# Start the Expo dev server (port 8081)
npm run expo:dev
```

### Android APK (CI/CD)

The project includes a GitHub Actions workflow for automated APK builds. See `.github/workflows/build-and-release-apk.yml`.

To build locally with Android SDK:

```bash
# If using native Android build
./gradlew assembleDebug --stacktrace
# Output: app/build/outputs/apk/debug/app-debug.apk
```

## Project Structure

```
app/
  _layout.tsx              # Root layout with providers and font loading
  (tabs)/
    _layout.tsx            # Tab navigation (Scanner, Algorithms, Attack, About)
    index.tsx              # WiFi Network Scanner screen
    algorithms.tsx         # WPS PIN Algorithm Database screen
    attack.tsx             # Attack Mode Selector screen
    about.tsx              # Developer credits and legal disclaimer
components/
  ErrorBoundary.tsx        # Error boundary wrapper
  ErrorFallback.tsx        # Error fallback UI
constants/
  colors.ts               # Dark cybersecurity color theme
lib/
  query-client.ts          # React Query client configuration
server/
  index.ts                 # Express server entry point
  routes.ts                # API route definitions
  templates/
    landing-page.html      # Landing page template
shared/
  schema.ts                # Database schema definitions
```

## WPS Algorithms Included

| Algorithm   | Vendor             | Success Rate |
|-------------|--------------------|-------------|
| Zhao        | TP-Link / Linksys  | 82%         |
| TpLink      | TP-Link            | 74%         |
| ASUS        | ASUS               | 71%         |
| Dlink       | D-Link             | 68%         |
| DlinkNIC    | D-Link NIC         | 61%         |
| Brcm1       | Broadcom           | 63%         |
| Brcm2       | Broadcom v2        | 57%         |
| Netgear     | Netgear            | 58%         |
| Arris       | Arris / Motorola   | 55%         |
| Brcm3       | Broadcom v3        | 51%         |
| Belkin      | Belkin             | 49%         |
| Pixie Dust  | Multiple           | 91%         |
| Brute Force | Any WPS            | 30%         |

## Legal Disclaimer

This application is developed for **educational purposes only**. The developer assumes no liability for any misuse of this software.

You are solely responsible for ensuring that your use of this app complies with all applicable local, state, national, and international laws and regulations.

**Only test networks that you own or have received explicit written permission to test.** Unauthorized access to computer networks is illegal and may result in criminal prosecution.

## License

Open Source — Educational Use Only

© 2024 Farhan Muh Tasim (Gtajisan)
