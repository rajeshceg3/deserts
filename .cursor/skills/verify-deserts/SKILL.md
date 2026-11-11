# Verify deserts
Desert Realms - ten fictional 360 desert landscapes (vite + React + three.js).
## Launch
`npm install`, then `npm run dev` or `npm run build && npm run preview -- --host 127.0.0.1`.
## Doctor
`python3 .cursor/skills/verify-deserts/verify.py` - a few minutes (real Chromium).
## Drive
Builds with vite, runs the repo's own verification/check.cjs (40 states at 390px: drag/reset, keyboard/Home, themes, motion, 14px floor, journal/collection/photo/zen/breathe/about), then the playwright smoke specs (boot, accessible controls, keyboard reset).
## Evidence
`.cursor/skills/verify-deserts/evidence.json` plus verification/proof-*.json.
## Cleanup
The check kills its static server; playwright manages its preview.
## Known boundaries
Default width 390 via VERIFY_WIDTH; subjective scene quality unverified.
