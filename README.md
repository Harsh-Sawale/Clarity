# Clarity

> Ephemeral Camera and Scratchpad for Android. Zero Cloud. Zero Telemetry. 100% Offline.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android_8.0+-black.svg?style=flat-square)](https://developer.android.com)
[![Engine: React_Native_Expo](https://img.shields.io/badge/Framework-Expo_SDK_57-black.svg?style=flat-square)](https://expo.dev)
[![TypeScript: Strict](https://img.shields.io/badge/TypeScript-Strict-black.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Network: Zero_Permissions](https://img.shields.io/badge/Network-Zero_Permissions-black.svg?style=flat-square)](#privacy-guarantee)

---

## Overview

Modern smartphones suffer from camera roll pollution. Users frequently capture temporary visual data—parking spot identifiers, Wi-Fi codes on routers, store receipts, serial numbers, and whiteboard sketches—that are only relevant for a few hours. These files accumulate indefinitely, consuming storage, syncing to paid cloud quotas, and cluttering lifetime photo galleries.

**Clarity** is an open-source, offline-first mobile utility engineered to solve this friction. It functions as a sandboxed scratchpad: photos captured with Clarity never enter the system photo library, are tracked with fluid visual timers, and cleanly disappear once their utility has ended.

---

## Key Capabilities

### 1. Viewfinder & Immediate Action
* **Instant Shutter:** Low-latency hardware capture via Camera2 backend.
* **Elastic Preview Sheet:** Post-capture preview card for fast inspection.
* **Lifespan Presets:** Immediate duration assignment (30 minutes, 2 hours, 6 hours, 24 hours, or custom duration).
* **Category Tagging:** Assign fast contextual tags (`Parking`, `Receipt`, `Pass`, `Note`) to automate default expiration times.
* **Inspection Torch:** Persistent toggle for dark environments (behind desks, under hoods, dim parking garages).

### 2. The Limbo (Active Gallery)
* Masonry grid displaying active temporary items.
* Real-time vector countdown indicators showing time remaining.
* Instant actions: Keep permanently in Vault, share directly, or delete immediately.

### 3. The Crypt (Grace Period)
* Expired items move into a 24-hour safety lounge before permanent disk zeroing.
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
git clone https://github.com/your-username/clarity.git
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
