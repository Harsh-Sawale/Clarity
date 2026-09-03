# Contributing to Clarity

Thank you for your interest in contributing to Clarity. Clarity is an open-source, offline-first ephemeral camera application engineered for universal Android compatibility.

Our mission is to maintain a zero-bloat, privacy-respecting, aesthetically rigorous codebase that functions without network permissions.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and professional environment. Please be respectful, constructive, and collaborative in all discussions and pull requests.

---

## Architecture Principles

When submitting code to Clarity, please adhere to these core rules:

1. **Zero Emojis in Core UI:**
   The design system strictly forbids unicode emojis in UI layouts, buttons, dialogs, and notifications. Use standardized vector line icons (`lucide-react-native`).

2. **Zero Network Requirement:**
   Clarity must never require internet access to function. Do not introduce dependencies that perform telemetry, remote analytics, or require active network pings.

3. **Scoped Sandbox Storage:**
   All captured media must remain strictly within `FileSystem.documentDirectory` and never leak to the public Android MediaStore without explicit user intent.

4. **Universal Hardware Compatibility:**
   Code must execute reliably across varying Android OEM skins (One UI, HyperOS, Pixel OS, OxygenOS) from Android 8.0 (API 26) through Android 15+.

---

## Getting Started Locally

### Prerequisites
* Node.js LTS (v20+ or v22+)
* npm or yarn
* Android Studio (for Android emulator testing) or physical Android device with Expo Go

### Setup Steps
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/clarity.git
   cd clarity
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run start
   ```
4. Run on an Android device:
   ```bash
   npm run android
   ```

---

## Pull Request Guidelines

1. **Keep it Modular:** Separate logic into services (`/src/services`), UI components (`/src/components`), and views (`/src/screens`).
2. **Type Safety:** Ensure complete TypeScript definitions without untyped `any` fallbacks. Run `npx tsc --noEmit` before submitting.
3. **Descriptive Commits:** Use standard conventional commits format (`feat:`, `fix:`, `docs:`, `perf:`).
4. **Documentation:** Update `README.md` if introducing or modifying any user-facing workflows.

---

## License

By contributing to Clarity, you agree that your contributions will be licensed under the MIT License.
