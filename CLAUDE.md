# BellPals: notes for Claude Code

BellPals is an alarm app for pal groups of up to 5 friends:
- When someone's alarm rings, everyone else's phone rings 24 s later, until the owner turns it off by swiping and feeding their BellPal (a tamagotchi-style mascot).
- **Status:** clickable web prototype in `prototype/`. The real Expo app hasn't been started.

## Read before working
- `docs/PRD.md`: requirement IDs (e.g. `RING-2`, `GROUP-3`). Reference them in PRs.
- `docs/WHAT_I_NEED_FROM_YOU.md`: open questions Q1–Q12. Don't treat a proposed answer as decided unless the doc says so.
- `docs/ARCHITECTURE.md`: platform constraints and how group ringing works.
- `prototype/src/domain/`: the product rules as pure TypeScript with tests. Keep the rules there and reuse them.

## Commands (prototype)
- `cd prototype && npm install`
- `npm test`: rule tests (Vitest)
- `npm run typecheck`
- `npm run build`: writes `dist/index.html` and `dist/bellpals-prototype.html` (a fragment for hosting)

## Non-negotiables
1. **Real alarms only.** AlarmKit on iOS, `AlarmManager.setAlarmClock` on Android. No silent-audio or keep-alive hacks.
2. **Pre-schedule, then control by push.** Each phone schedules its group's rings locally (owner at T, pals at T + 24 s). Pushes only cancel, stop, snooze or re-ring.
3. **The server enforces the rules:** one alarm per day, max 5 per group, friends-only invites, owner-only delete, one snooze. Never trust the client.
4. **Joining a group is consent** to ring for its alarms. No one else can make your phone ring.
5. **Privacy.** Contacts are hashed on the phone and never stored. Row-level security on every table.

## Working agreements
- Small PRs with "How to test on your phone" steps.
- Prose in docs uses British spelling. Code identifiers follow platform conventions.
