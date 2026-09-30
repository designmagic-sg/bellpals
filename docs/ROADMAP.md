# BellPals — Build Roadmap

| | |
|---|---|
| **Version** | 0.2 · 30 Sep 2026 |
| **Assumes** | You plus Claude Code at about 1 full-time person. At half-time, double the durations. |
| **Related** | [PRD](PRD.md) · [Design](DESIGN.md) · [Architecture](ARCHITECTURE.md) · [What I need from you](WHAT_I_NEED_FROM_YOU.md) |

The riskiest part of BellPals is **one phone controlling alarms on other phones**: ringing pals 24 s later, keeping them ringing, stopping them, and syncing the second ring. We prove that on real phones before building the full app.

| Phase | What | Length | Needs from you |
|---|---|---|---|
| **0 · Prototype** ✅ | Clickable web prototype of the whole spec | Done | Feedback, answers to the open questions |
| **1 · Real-phone test** | Prove group ringing works on iPhone and Android | 2–3 weeks | Test phones; Apple Developer Program for the iPhone part |
| **2 · Foundations** | Sign-in, profile, BellPal, alarms, notifications | 3 weeks | BellPal designs (at least stage 1) |
| **3 · Friends and groups** | Contacts, friend requests, create/invite/join/leave/delete | 3 weeks | — |
| **4 · Group ringing and feeding** | 24 s ring, snooze once, second ring, swipe and feed, levels and evolution | 4 weeks | All 15 BellPal designs and treats, alarm sounds |
| **5 · Deletion, polish, beta** | Account deletion, accessibility, closed beta | 3 weeks | Google Play Console; 10–20 testers |
| **6 · Store release** | Listings, review, launch | 2 weeks | Store assets, privacy policy |

**Total: about 17 weeks after you sign off the prototype.**

---

## Phase 0: Clickable prototype ✅

**Delivered:**
- A web prototype (`prototype/`) covering every requirement in the PRD, using simulated friends.
- Tests for the rules: 24 s delay, one snooze, the shared second ring, the 5-person cap, one alarm per day, treats per level, evolution.

**You:**
- Try it and answer the questions in [WHAT_I_NEED_FROM_YOU.md](WHAT_I_NEED_FROM_YOU.md).

## Phase 1: Real-phone test of group ringing (2–3 weeks)

**Build** a bare test app (Expo with native alarm modules) and a small server. Then measure these on real phones:
- The owner's alarm rings at T, even when the phone is:
  - on silent
  - in Focus / Do Not Disturb
  - locked
  - running with the app closed
- Pals' phones ring at T + 24 s. Also: what happens when the owner is up within 24 s?
- How fast a pal's phone stops after the owner turns the alarm off (target: under 5 s).
- Snooze: pals go quiet, and the second ring starts on every phone within 2 s of each other.
- On iPhone:
  - What happens when a pal taps Apple's Stop button? Can we re-ring?
  - How reliable are background pushes when the app is closed or the phone is asleep?
- The 5-min and 1-min notifications with a full group (iOS allows only 64 pending notifications).

**Exit:** a written reliability report and a decision on how the iPhone version handles each ⚠️ in [PRD §3](PRD.md#3-what-the-platforms-allow).

## Phase 2: Foundations (3 weeks)

- Expo app, design system from the prototype and your designs, CI.
- Sign in with Apple and Google, profile (username, full name, linked Gmail).
- Choose a BellPal, and levels (PAL-1…6).
- Alarms: one per day, Sunday to Saturday, AM/PM picker (ALARM-1…4), ringing through the native alarm engine.
- Local notifications scheduled on the phone.

**Exit:** you use BellPals as your own alarm for a week with no misses.

## Phase 3: Friends and groups (3 weeks)

- Friends from contacts, username search, friend requests (FRIEND-1…3).
- Groups: create, invite friends, accept, leave, owner-only delete, max 5, one group per person (GROUP-1…7).
- Server rules with tests: people can't bypass them from a modified app.

## Phase 4: Group ringing and feeding (4 weeks)

- Share schedules across the group. Each phone pre-schedules its pals' alarms at T + 24 s.
- The live alarm session:
  - the owner can snooze once
  - the second ring starts on every phone together
  - every phone stops when the owner turns it off (RING-1…7)
- Swipe, then the feeding game with 1/2/3 treats (OFF-1…3).
- Levels, evolution animation and the 15 forms.
- The 5-min and 1-min notifications to the whole group (NOTIF-1…2).

**Exit:** a group of 5 real people uses BellPals for a week.

## Phase 5: Account deletion, polish and closed beta (3 weeks)

- Two-step account deletion with typed DELETE (DEL-1…3), including revoking Sign in with Apple tokens.
- Accessibility pass. Error and offline states.
- Closed beta:
  - TestFlight for iPhone
  - Google Play closed testing for Android. A *personal* Play account needs at least 12 testers for 14 days first; an organisation account doesn't.

## Phase 6: Store release (2 weeks)

- Store listings, screenshots, privacy labels, data-safety form, alarm-permission declarations.
- Submit, review, release.

---

## How we'll work

- Small pull requests, each with **"How to test on your phone"** steps.
- I write and test the code. On-device alarm testing is yours, because I can't hear a phone ring from the cloud. I'll give you short checklists.
