# BellPals: notes for Claude Code

BellPals is a social alarm app: alarms ("bells") shared with pals and crews, with a live Wake Board and Pal Rescue. **Status: planning.** There's no app code yet.

## Read before working
- `docs/WHAT_I_NEED_FROM_YOU.md`: open decisions (D1–D10). Don't assume an answer to anything still open.
- `docs/PRD.md`: scope and requirement IDs (e.g. `BELL-3`, `SHARE-5`). Reference the IDs in PRs.
- `docs/ROADMAP.md`: current phase and its exit criteria.
- `docs/ARCHITECTURE.md`: stack, bell engine, sync model, data model.
- `docs/DESIGN.md`: flows, screen specs, tokens, copy tone.

## Non-negotiables
1. **Reliability first.** Bells ring through OS alarm APIs only: AlarmKit on iOS, `AlarmManager.setAlarmClock` on Android. No silent-audio or background keep-alive hacks.
2. **Consent first.** Never schedule a bell on someone's phone unless they accepted it (or auto-accepted it via Trusted pal).
3. **The phone rings without the network.** The native side owns scheduled alarms. The server only orchestrates the social layer.
4. **Explicit time.** UTC instants + IANA time zones. Every shared bell has a time mode (`instant` / `local`).
5. **Privacy.** Wake status is visible only to that bell's participants. RLS on every table.

## Working agreements
- Small PRs per feature. Each PR includes "How to test on your phone" steps.
- Changes to `modules/bell-engine` or native config need a store build. JS-only changes can ship via EAS Update.
- Prose in docs uses British spelling; code identifiers follow platform conventions.
