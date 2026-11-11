# Desert Realms verification

Ten original fictional realms, not geography or wildlife education. Legacy components and original lore data remain in source; the current entry uses a readable layout, native dialog panels, deterministic terrain, original creatures and flora, and procedural imagined landmarks. No external image/HDR/audio dependencies.

Run `npm ci && npm run build`, then `WIDTH=390 node verification/check.cjs` (Playwright Chromium must be installed). Repeat WIDTH=320 and WIDTH=1440 independently. Set CHROME for a system Chrome path; URL tests a deployed site. PIXELS captures every scene and both themes.

Executed locally: current app build and zero-vulnerability npm audit; all ten scenes at 390/1440 checked for page and shader errors, actual screenshots captured; 320/390/1440 independent 40-state functional suites each wrote successful proof files with no errors (120 states total). The containing shell timed out during subsequent pixel capture; proof files were recovered and inspected. 14px label floor and UI contrast passed at 320/390/1440 for visible dark/light main UI, journal and about. `contrast.json` stores 232 glyph-mask samples, minimum 8.236:1, excluding covered content. Does not measure scene imagery.

Actual 14-second browser wind output captured externally; no context before opt-in, off closes context, replay passes. Subjective listening has not been signed off.

Latest local adjustment reduces landmark size to avoid top cropping. It builds and functional suites passed; fresh all-ten scene pixels at 390/1440 were inspected after the adjustment. No external 3D assets are used. Hosted verification and merge are separate remaining gates. Existing Vercel URL remains https://deserts-tau.vercel.app/.
