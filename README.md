# BellPals 🔔

**The alarm clock your friends are in on.** Set bells for yourself, your pals or your whole crew. See who's up, and rescue anyone who isn't.

> **Status: planning (Phase 0).** There's no app code yet. This repo holds the product plan.

## Start here

| Doc | What's in it |
|---|---|
| **[What I need from you](docs/WHAT_I_NEED_FROM_YOU.md)** | Decisions (with recommended defaults), accounts, devices and assets needed to start. **Read this first** |
| [PRD](docs/PRD.md) | Problem, users, competitors, MVP requirements, metrics, risks |
| [Roadmap](docs/ROADMAP.md) | Phases, milestones and exit criteria. Target public launch: late Jan 2027 |
| [Design brief](docs/DESIGN.md) | UX principles, platform constraints, flows, screen specs, visual direction, tone of voice |
| [Architecture](docs/ARCHITECTURE.md) | Stack, native alarm engine, sync model, data model, security, the Phase 0 reliability spike |

## BellPals in 30 seconds

- **Crew Bells:** one bell for the whole group (early flight, gym, exam day). Everyone's phone rings, and a live **Wake Board** shows who's up.
- **Pal Bells:** set a bell for a friend. They accept, it rings on their phone, and you find out when they're up.
- **Voice Bells:** wake up to a pal's recorded voice.
- **Pal Rescue:** if you haven't checked in, a Backup Bell rings and your pals get a *Nudge* button.
- **Consent first:** nobody can make your phone ring unless you've said yes.

## Proposed stack

Expo (React Native + TypeScript), with native Swift/Kotlin alarm modules (**AlarmKit** on iOS 26+, **AlarmManager** on Android) and a **Supabase** backend in the Singapore region. See [Architecture](docs/ARCHITECTURE.md).
