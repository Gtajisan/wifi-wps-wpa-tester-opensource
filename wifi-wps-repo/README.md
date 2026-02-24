# WiFi WPS WPA Tester - Open Source

[![Build & Release APK](https://github.com/fulvius31/wifi-wps-wpa-tester-opensource/actions/workflows/build-and-release-apk.yml/badge.svg)](https://github.com/fulvius31/wifi-wps-wpa-tester-opensource/actions/workflows/build-and-release-apk.yml)
[![Android Build](https://github.com/fulvius31/wifi-wps-wpa-tester-opensource/actions/workflows/android.yml/badge.svg)](https://github.com/fulvius31/wifi-wps-wpa-tester-opensource/actions/workflows/android.yml)

A limited, open-source version of the popular **WIFI WPS WPA TESTER** Android application for educational and security research purposes.

## Disclaimer

**This application is intended for educational and authorized security testing purposes only.**

By using this software, you agree to the following:

- **Legal Use Only**: This tool must only be used on networks you own or have explicit written permission to test. Unauthorized access to computer networks is illegal in most jurisdictions and may result in criminal prosecution.

- **Educational Purpose**: This application is designed to help security researchers, network administrators, and enthusiasts understand WPS vulnerabilities and improve their network security.

- **No Warranty**: This software is provided "as is" without any warranty of any kind. The developers are not responsible for any misuse, damage, or legal consequences resulting from the use of this tool.

- **Responsible Disclosure**: If you discover vulnerabilities in networks you are authorized to test, please follow responsible disclosure practices.

## Legal Notice

Testing wireless networks without authorization is illegal under laws including but not limited to:
- Computer Fraud and Abuse Act (CFAA) - United States
- Computer Misuse Act - United Kingdom
- Similar cybercrime laws in other countries

**Always obtain proper authorization before testing any network.**

## About This Project

> **Note**: This tool was developed with the assistance of an LLM (Claude by Anthropic) based on specifications and guidance provided by **Alessandro Sangiorgi**. The codebase incorporates concepts and some existing code from the well-known **WIFI WPS WPA TESTER** application, which is owned by Alessandro Sangiorgi.
>
> **Important**: This is **not** the same codebase as the official WIFI WPS WPA TESTER app available on app stores. While it may contain portions of that code and follows similar architectural patterns, this open-source version is a separate project with different features and implementation details.

## Features

- **WiFi Network Scanning**: Discover nearby WiFi networks with WPS enabled
- **WPS PIN Testing**: Test WPS PINs using various algorithms
- **Pixie Dust Attack**: Attempt to recover WPS PIN using the Pixie Dust vulnerability (for vulnerable routers)
- **Multiple PIN Algorithms**: Support for various vendor-specific PIN generation algorithms
- **PIN Database**: Lookup known default PINs based on router MAC address
- **Modern UI**: Built with Jetpack Compose and Material Design 3

## Requirements

- Android 7.0 (API 24) or higher
- **Root access required** for WPS testing functionality
- Location permission (required by Android for WiFi scanning)

## How It Works

This application tests WPS (WiFi Protected Setup) implementations for known vulnerabilities:

1. **PIN-based Testing**: WPS uses an 8-digit PIN for authentication. Many routers use predictable PINs based on their MAC address or have known default PINs.

2. **WPS Protocol Vulnerability (Bruteforce)**: The WPS protocol has a fundamental design flaw that makes bruteforce attacks practical:
   - The 8-digit PIN is validated in two separate halves
   - The router responds differently when the **first 4 digits are correct** vs incorrect
   - The **last digit is a checksum** calculated from the first 7 digits
   - This reduces the attack from 100,000,000 combinations (10^8) to only **11,000 attempts** (10,000 + 1,000)
   - First half: 4 digits = 10,000 possible combinations
   - Second half: 3 digits + checksum = 1,000 possible combinations

3. **Pixie Dust Attack**: Some routers have weak random number generators in their WPS implementation, allowing the PIN to be computed from a single failed authentication attempt.

4. **Algorithm-based PIN Generation**: Various router manufacturers use predictable algorithms to generate default WPS PINs, which can be computed from the router's MAC address.

## WPS Connection Library

The core WPS connection logic (PIN testing, brute force, Pixie Dust, wpa_supplicant management) lives in a separate library:

**[WpsConnectionLibrary](https://github.com/fulvius31/WpsConnectionLibrary)** — consumed via [JitPack](https://jitpack.io/#fulvius31/WpsConnectionLibrary)

---

## Building from Source

### Local Build

```bash
# Clone the repository
git clone https://github.com/fulvius31/wifi-wps-wpa-tester-opensource.git

# Navigate to project directory
cd wifi-wps-wpa-tester-opensource

# Build debug APK
./gradlew assembleOpenDebug

# Build release APK
./gradlew assembleOpenRelease

# Run tests
./gradlew test
```

The built APK will be located at:
```
app/build/outputs/apk/open/debug/app-open-debug.apk       # Debug
app/build/outputs/apk/open/release/app-open-release.apk    # Release
```

### Build Requirements (Local)

| Requirement | Version |
|-------------|---------|
| JDK | 17 |
| Android SDK | API 36 (compileSdk) |
| Build Tools | 36.0.0 |
| Gradle | 9.3.0 (via wrapper) |
| Min SDK | API 24 (Android 7.0) |
| Target SDK | API 36 |

---

## CI/CD: GitHub Actions (Automated Build & Release)

This project includes a fully automated CI/CD pipeline that builds the APK and uploads it to GitHub Releases. The setup is inspired by TWRP recovery action builders with disk space optimization and swap setup.

### Workflow Files

| Workflow | File | Purpose |
|----------|------|---------|
| **Build & Release APK** | `.github/workflows/build-and-release-apk.yml` | Full build pipeline with automatic release upload |
| **Android Build** | `.github/workflows/android.yml` | Code quality checks, build, and testing |

### How the Build & Release Workflow Works

#### Triggers

The workflow runs automatically in these cases:

| Trigger | Build Type | Creates Release? |
|---------|-----------|-----------------|
| Push to `main` branch | Debug | Yes (pre-release) |
| Tag push (`v*` or `release-*`) | Release | Yes (latest) |
| Pull request to `main` | Debug | No |
| Manual dispatch | Your choice | Your choice |

#### Build Pipeline Steps

```
1. Checkout Code
       |
2. Free Disk Space (removes unused tools ~30GB freed)
       |
3. Set Up Swap Space (10GB - prevents OOM kills)
       |
4. Install JDK 17 (Temurin) with Gradle cache
       |
5. Install Android SDK (API 36 + Build Tools 36.0.0)
       |
6. Validate Gradle Wrapper
       |
7. Cache Gradle Dependencies
       |
8. Run Code Quality Checks (Spotless + Detekt)
       |
9. Build APK (debug or release)
       |
10. Run Unit Tests
       |
11. Rename APK (with version, date, commit hash)
       |
12. Upload as Build Artifact
       |
13. Create GitHub Release + Upload APK
```

#### Environment Setup Details

The workflow automatically handles:

- **Disk Space**: Cleans up ~30GB of unused pre-installed tools (dotnet, Android NDK, Haskell, etc.)
- **Swap Space**: Allocates 10GB of swap to prevent out-of-memory kills during Kotlin/Compose compilation
- **JDK**: Installs Temurin JDK 17 with Gradle caching
- **Android SDK**: Installs Android SDK API 36 and Build Tools 36.0.0
- **Gradle Cache**: Caches dependencies based on `*.gradle*`, `gradle-wrapper.properties`, and `libs.versions.toml`

### How to Use

#### Option 1: Automatic Build on Push

Simply push your code to the `main` branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

The workflow will build a debug APK and create a pre-release automatically.

#### Option 2: Create a Release with a Tag

Create and push a version tag to trigger a release build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This builds a release APK and creates a GitHub Release marked as "latest".

#### Option 3: Manual Trigger

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select **"Build & Release APK"** from the left sidebar
4. Click **"Run workflow"**
5. Choose your options:
   - **Build Type**: `debug` or `release`
   - **Create GitHub Release**: `true` or `false`
   - **Release tag name**: Leave empty for auto-generated, or enter custom tag (e.g., `v2.0-beta`)
6. Click the green **"Run workflow"** button

#### Downloading the APK

After a successful build:

1. **From Releases**: Go to the **Releases** section of the repository. The APK is attached to the release.
2. **From Artifacts**: Go to **Actions** > click on the workflow run > scroll to **Artifacts** section > download the APK.

### APK Naming Convention

Built APKs follow this naming pattern:

```
wifi-wps-wpa-tester-v{VERSION}-{BUILD_TYPE}-{DATE}-{COMMIT}.apk
```

Example: `wifi-wps-wpa-tester-v1.0-debug-20260224-a3f5c2d.apk`

### Release Notes

Each release automatically includes:
- Version and build type info
- Commit hash and build date
- Last 10 commits as changelog
- Android requirements
- Legal disclaimer

---

## Project Structure

```
app/src/main/java/sangiorgi/wps/opensource/
├── algorithm/          # PIN generation algorithms
├── data/               # Data layer (databases, assets)
├── di/                 # Hilt dependency injection modules
├── domain/             # Domain models
├── permissions/        # Permission management
├── ui/                 # Compose UI components
│   ├── screens/        # Screen composables
│   ├── viewmodels/     # ViewModels
│   └── theme/          # Material theme
└── utils/              # Utility classes

.github/
└── workflows/
    ├── android.yml                 # CI: Build + Test + Release (tag-based)
    └── build-and-release-apk.yml   # CI/CD: Full build pipeline with auto-release
```

WPS connection logic (commands, handlers, services) is provided by the [WpsConnectionLibrary](https://github.com/fulvius31/WpsConnectionLibrary).

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | Kotlin |
| UI Framework | Jetpack Compose |
| Design System | Material Design 3 |
| DI | Hilt (Dagger) |
| Navigation | Compose Navigation |
| Root Access | libsu |
| WPS Logic | [WpsConnectionLibrary](https://github.com/fulvius31/WpsConnectionLibrary) |
| Build System | Gradle 9.3.0 |
| CI/CD | GitHub Actions |
| Code Quality | Spotless, Detekt, Checkstyle |

## Contributing

Contributions are welcome! Please ensure your contributions:

1. Follow the existing code style (enforced by Spotless)
2. Include appropriate tests
3. Do not introduce security vulnerabilities
4. Respect the educational nature of this project

## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original concept and code by **Alessandro Sangiorgi** (WIFI WPS WPA TESTER)
- [WpsConnectionLibrary](https://github.com/fulvius31/WpsConnectionLibrary) for WPS connection logic
- [libsu](https://github.com/topjohnwu/libsu) for root shell operations
- [wpa_supplicant](https://w1.fi/wpa_supplicant/) for WPS functionality
- [pixiewps](https://github.com/wiire-a/pixiewps) for Pixie Dust attack implementation

## Support

This is an open-source educational project. For issues and feature requests, please use the GitHub issue tracker.

**Remember: Use responsibly and legally. Always obtain proper authorization before testing any network.**

---
