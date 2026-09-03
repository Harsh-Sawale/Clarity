# Clarity

> A fast, private camera for temporary photos that auto-deletes them so they don't clog your phone.

Built with care by **Harsh Sawale** ([@Harsh-Sawale](https://github.com/Harsh-Sawale)).

[![Download APK](https://img.shields.io/badge/Download-Clarity.apk-black?style=for-the-badge&logo=android)](https://github.com/Harsh-Sawale/Clarity/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android_8.0+-black?style=for-the-badge&logo=android)](https://github.com/Harsh-Sawale/Clarity/releases/latest)

---

## Why I Built This

Like most people, my phone's camera roll was a disaster.

Whenever I parked at a mall, I would snap a photo of the parking pillar. When setting up a router, I'd take a picture of the Wi-Fi password sticker. Receipts, grocery lists, package tracking barcodes, whiteboard notes from class—I took photos of things I only needed for **30 minutes**.

Six months later, Google Photos would hit me with: *"Your cloud storage is 98% full."* And whenever I scrolled through my gallery to find pictures of family, trips, or friends, I had to sift through hundreds of blurry parking signs and store receipts.

I wanted a simple camera app that:
1. Keeps temporary scratch photos **out of my main camera roll**.
2. Never uploads anything to the cloud (100% offline).
3. Automatically deletes them when I don't need them anymore.

So I built **Clarity**.

---

## How It Works

1. **Snap:** Open Clarity and take a picture. It uses your phone's real 4:3 optical sensor without wide-angle distortion.
2. **Set Lifespan:** Pick how long you need the photo: `30 minutes`, `2 hours`, `6 hours`, `24 hours`, or enter a custom time (from 1 minute up to 1 week).
3. **Forget:** Clarity isolates the photo in its private local vault. When the timer runs out, it automatically cleans it up.

If you ever realize you need an expired photo, it waits in the **Trash (24H)** recovery window before being permanently erased. And if you took a photo you want to keep forever, just tap **Keep** to save it indefinitely.

---

## Features

* **Real Optical Camera:** Locked to normal optical 4:3 lens ratio to avoid wide-angle edge warping.
* **Two-Finger Pinch Zoom:** Fluid pinch-to-zoom plus quick `[ 1x ]` `[ 2x ]` `[ 3x ]` zoom selector buttons.
* **Custom Lifespan Timer:** Set any duration from **1 minute** to **7 days** (1 week).
* **High-Density List Mode:** Switch between Grid and List format to quickly scroll through photos.
* **Batch Photo Management:** Long-press to enter multi-select mode. Select multiple photos or tap "Select All" to batch-extend (+2h), batch-keep, or batch-delete with one tap.
* **24-Hour Safety Net:** Expired photos aren't immediately nuked—they sit in the 24-hour Trash lounge so you never lose anything by accident.
* **Tactile Glass Design:** Physical spring animations, haptic click feedback, and liquid screen transitions.
* **Full Settings Suite:** Customize default timers, trash duration, compression quality, and haptic feedback.

---

## Privacy: 100% Offline by Design

Clarity requires **zero internet permissions**. 

* No analytics.
* No telemetry.
* No account or sign-in.
* No cloud backups.
* Photos are sandboxed in the app's internal storage and never touch your public camera roll.

You can audit the entire source code right here in this repository.

---

## Download & Install

You can download the ready-to-install Android package directly:

👉 **[Download Latest Clarity.apk](https://github.com/Harsh-Sawale/Clarity/releases/latest)**

1. Download the `.apk` file to your Android phone.
2. Tap the file in your notifications or downloads folder to install.
3. Open Clarity and start shooting clutter-free!

---

## Running from Source

If you want to build or tinker with Clarity locally:

```bash
# Clone the repository
git clone https://github.com/Harsh-Sawale/Clarity.git
cd Clarity

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

---

## Contributing

Clarity is free, open source, and welcoming to contributors. If you have an idea, feel free to open an issue or submit a pull request!

---

## License

This project is licensed under the [MIT License](LICENSE) &copy; 2026 Harsh Sawale.
