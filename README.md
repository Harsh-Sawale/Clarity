# Clarity

> Ephemeral Camera and Scratchpad for Android. Zero Cloud. Zero Telemetry. 100% Offline.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android_8.0+-black.svg?style=flat-square)](https://developer.android.com)
[![Engine: React_Native_Expo](https://img.shields.io/badge/Framework-Expo_SDK_57-black.svg?style=flat-square)](https://expo.dev)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict-black.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Network: Zero_Permissions](https://img.shields.io/badge/Network-Zero_Permissions-black.svg?style=flat-square)](#privacy-guarantee)
[![Download APK](https://img.shields.io/badge/Download-Android_APK-success.svg?style=flat-square)](https://github.com/Harsh-Sawale/Clarity/releases/latest)

---

### [Download Clarity for Android (.APK)](https://github.com/Harsh-Sawale/Clarity/releases/latest)
Get the standalone, installable app for your phone:
1. Tap [Download Clarity.apk](https://github.com/Harsh-Sawale/Clarity/releases/latest).
2. Install the APK directly on any Android phone (Android 8.0 through Android 15).
3. No accounts, no setup, 100% offline.

---

## Overview

Modern smartphones suffer from camera roll pollution. Users frequently capture temporary visual data—parking spot identifiers, Wi-Fi codes on routers, store receipts, serial numbers, and whiteboard sketches—that are only relevant for a few hours. These files accumulate indefinitely, consuming storage, syncing to paid cloud quotas, and cluttering lifetime photo galleries.

**Clarity** is an open-source, offline-first mobile utility engineered to solve this friction. It functions as a sandboxed scratchpad: photos captured with Clarity never enter the system photo library, are tracked with fluid visual timers, and cleanly disappear once their utility has ended.

---

## Key Capabilities

### 1. Viewfinder & Immersive Shutter
* **Hardware Capture:** Locked to normal optical 4:3 ratio to avoid wide-angle lens distortion.
* **Dual Zoom Modes:** Fluid two-finger pinch-to-zoom + 1-tap `[ 1x ]` `[ 2x ]` `[ 3x ]` zoom selector pills.
* **Inspection Torch:** Persistent toggle for dark environments (behind desks, under hoods, dim parking garages).
* **Flip Camera:** Instant toggle between front and rear cameras.

### 2. Lifespan Engine (1 Minute to 1 Week)
* **Instant Presets:** Assign durations with one tap (`30m`, `2h`, `6h`, `24h`).
* **Custom Precision Timer:** Flexible slider allowing any duration from 1 minute up to 7 full days (1 week).
* **Optional Memo:** Attach quick text notes (Wi-Fi passwords, parking pillars, receipt tags) directly to photos.

### 3. Vault & Albums Hub
* **Expiring Notes:** Active temporary scratchpad displaying live countdown timers.
* **Grace Lounge (24H Net):** Safety holding zone for expired photos, preventing anxiety from accidental deletions with 1-tap restoration.
* **Keepers:** Sandboxed permanent archive for photos you decide to keep indefinitely without polluting Google Photos or the system camera roll.
* Prevents accidental data loss without cluttering active headspace.

### 4. The Vault (Permanent Keeps)
* Sandboxed local archive for images you decide to keep indefinitely, without mixing into your personal phone gallery.

### 5. Transparency & Privacy Center
* Complete developer and maintainer attribution.
* In-app audit explaining sandboxed scoped storage.
* One-tap full data export (.zip archive) and emergency zero-wipe.

---

## Design System

Clarity rejects generic gradient aesthetics and decorative clutter in favor of functional minimalism:
* **Zero Emojis:** Strictly prohibited across all interfaces, labels, and dialogs.
* **Typography:** Clean geometric sans-serif with strict weight hierarchy (400, 500, 600) and optical tracking.
* **Color Palette:** Pure OLED Black (`#000000`), elevated charcoal cards (`#121214`), hairline dividers (`#27272A`), and crisp white high-contrast text (`#FFFFFF`).
* **Micro-interactions:** Physical spring physics and tactile haptic feedback on all interactions.

---

## Privacy Guarantee

* **Zero Network Permissions:** Clarity does not declare `android.permission.INTERNET`. It is technically incapable of sending data over the network.
* **Scoped File System:** Images reside in the app's sandboxed `documentDirectory`. System gallery indexers and third-party apps cannot access these files.
* **Zero Telemetry:** No Google Analytics, no Firebase, no crash loggers, no trackers.

---

## Project Structure

```
src/
├── app/                  # Application root and navigation orchestrator
├── components/           # Atomic, reusable UI elements
│   ├── ShutterButton.tsx # Spring-loaded tactile shutter
│   ├── TimerDial.tsx     # Duration selection controls
│   ├── PhotoCard.tsx     # Masonry card with vector countdown
│   ├── TagChip.tsx       # Minimal text badge component
│   └── Header.tsx        # Standardized top app bar
├── screens/
│   ├── CameraScreen.tsx  # Viewfinder and capture interface
│   ├── PreviewModal.tsx  # Post-capture inspection sheet
│   ├── LimboScreen.tsx   # Active items gallery
│   ├── CryptScreen.tsx   # 24-hour grace period recovery area
│   ├── VaultScreen.tsx   # Protected permanent keep storage
│   ├── InfoScreen.tsx    # Maintainer info, architecture, and FAQ
│   └── SettingsScreen.tsx# Customization, data export, and nuclear wipe
├── services/
│   ├── storage.ts        # Sandboxed file system operations
│   └── expiration.ts     # Lifecycle evaluation and purge engine
├── config/
│   └── maintainer.ts     # Maintainer profile and GitHub configuration
└── types/
    └── index.ts          # Core TypeScript data contracts
```

---

## Getting Started

### Installation
```bash
# Clone the repository
git clone https://github.com/Harsh-Sawale/clarity.git
cd clarity

# Install dependencies
npm install

# Start the development server
npm run start
```

### Running on Android
```bash
npm run android
```

### Production Build (APK / AAB)
```bash
npx expo run:android --variant release
```

---

## Maintainer & Contributions

Developed and maintained by the Clarity Open Source Community. Contributions, bug reports, and feature requests are welcome via GitHub Issues and Pull Requests. Please review [CONTRIBUTING.md](CONTRIBUTING.md) before submitting code.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
