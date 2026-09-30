# BellPals clickable prototype

A web version of the full BellPals spec, for reviewing the product before building the real app. It runs in any browser. On a computer you get a phone frame, prototype controls and your pals' phones side by side. On a phone the app fills the screen and a **Demo** button opens the controls.

## Run it

```bash
npm install
npm run dev        # development server
npm test           # rule tests
npm run typecheck
npm run build      # dist/index.html (one self-contained file) + dist/bellpals-prototype.html (fragment for hosting)
```

## What's real and what's simulated

| Real (works as specified) | Simulated |
|---|---|
| All rules: 24 s group delay, ringing until the owner turns it off, one snooze, second ring for everyone together, max 5 per group, friends-only invites, owner-only delete, one alarm per day, treats per level, evolution | Sign-in (no real Apple or Google account) |
| Swipe, then drag treats into the BellPal's mouth | Friends, contacts and their replies (they accept after a few seconds) |
| Alarms ring at their set time **while the page is open** | Pals' phones: shown in the side panel. Pals snooze and turn off their alarms on a script, or when you use the controls |
| 5-minute and 1-minute notifications (in-app banners) | Sound uses simple generated beeps |

State is saved in the browser (`localStorage`); **Reset prototype** clears it. Nothing is sent anywhere.

## Code map

```text
src/domain/       Product rules (pure TypeScript + Vitest tests). Reuse these in the real app.
src/data/         The 5 BellPals and the sample people, groups and contacts
src/state/        Store (reducer), clock, engine (scheduling, simulated pals, sound)
src/components/   BellPal art (SVG, 5 × 3 forms), treats, time wheel, swipe, feeding game
src/phone/        The app: sign-up, tabs, sheets, alarm screens
src/demo/         Prototype controls, pals' phones panel, BellPal gallery
```

The BellPal art is placeholder SVG drawn in code, for the design team to replace.
