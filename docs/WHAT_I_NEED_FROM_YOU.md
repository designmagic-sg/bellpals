# What I need from you

This is the living checklist of decisions, accounts, devices and assets needed to build BellPals. I've proposed a default for every decision. **You can reply "go with the defaults"** and just tell me which ones to change.

## This week: top 5

1. **Answer the decisions in section A**, or accept the defaults.
2. **Start the Apple Developer and Google Play organisation sign-ups.**
   - Organisation accounts need a **D-U-N-S number**. It's free, but it can take 1–2 weeks, so it's the slowest step.
   - An organisation Play account also avoids Google's *12 testers × 14 days* closed-test rule for new personal accounts.
3. **Check the name is free:**
   - search "BellPals" on the App Store and Google Play
   - check the domain (`bellpals.app` / `bellpals.com`)
   - run an [IPOS](https://www.ipos.gov.sg/) trademark search
4. **Line up test phones:**
   - an iPhone on iOS 26 or 27
   - a Samsung and/or Xiaomi/Oppo Android phone

   Simulators can't prove an alarm really rings.
5. **Pick a brand direction** (A, B or C in [DESIGN.md §7](DESIGN.md#7-visual-direction)), or send existing brand assets or a Figma link.

---

## A. Decisions

| # | Decision | My recommended default | Why it matters |
|---|---|---|---|
| D1 | **Launch audience and market** | Friend groups aged 18–30 in **Singapore**, English only | Shapes onboarding copy, launch channels and store listings |
| D2 | **Platforms and minimum OS** | **iOS + Android together**. iOS 26+ (required for AlarmKit), Android 10+, phones only | iOS-only would roughly halve the Phase 0 spike, but friend groups use both platforms |
| D3 | **MVP scope** | As in [PRD §9](PRD.md#9-mvp-requirements): Crew and Pal Bells, Wake Board, Pal Rescue, Backup Bell, Voice Bells. Missions and widgets come later | Scope is the biggest driver of the launch date |
| D4 | **Sign-in methods** | Apple + Google + email code. **No SMS in v1** (it costs money per text and is heavier on privacy) | Affects onboarding friction and contact discovery |
| D5 | **Tech stack** | **Expo (React Native/TypeScript)** + native alarm modules + **Supabase** (Singapore region) | Tell me if you or your team prefer Flutter, native or Firebase |
| D6 | **Business model** | **Free at launch.** BellPals+ subscription later. Never charge for receiving bells | Affects the paywall design and the growth loop |
| D7 | **Who designs the UI** | **designmagic designs in Figma** from [DESIGN.md](DESIGN.md), and I build from the Figma file. Alternatively, I design directly in code from the brief | Sets how Phase 1–2 design handoff works |
| D8 | **Brand direction** | **A · Sunrise Social** | Needed before tokens, components and the app icon |
| D9 | **Publisher entity** | Publish under an existing company, or set up a new one (e.g. BellPals Pte. Ltd.) | Appears on the store listings. Needs D-U-N-S; affects PDPA/legal ownership |
| D10 | **Team, pace and budget** | You + Claude Code at ~1 FTE, with a ~US$1k year-1 infrastructure budget | Timeline estimates assume this; at half-time, double them |

**Product defaults I'll assume unless you object**
- Time mode: *same moment* for one-time crew bells, *same local time* for repeating ones.
- Snooze 9 min · Backup Bell at T+10 · Pal Rescue at T+15 · wake window 60 min · max 3 nudges per pal per bell.
- Quiet hours 23:00–07:00 for requests. Crews up to 20 people. Voice clips up to 30 s, deleted 30 days after the bell.
- Minimum age 13+.

## B. Accounts to create

Only you can create these. **Never paste keys or passwords into chat.** When a step needs a secret, I'll say exactly which one to add to GitHub Actions secrets, EAS secrets or this Claude environment's secrets.

| ✓ | Account | Cost | Needed by | Notes |
|---|---|---|---|---|
| [ ] | **D-U-N-S number** for the publishing company | Free | Now | Needed by both Apple and Google for organisation accounts |
| [ ] | **Apple Developer Program** (organisation) | US$99/yr | Phase 0 (spike on real iPhones) | Enables TestFlight, AlarmKit on device and push (APNs key) |
| [ ] | **Google Play Console** (organisation) | US$25 once | Phase 1 | Organisation accounts skip the 12-tester rule. Complete identity verification early |
| [ ] | **Expo account + organisation** (`bellpals`) | Free to start | Phase 0 | For EAS builds. Later you'll add an `EXPO_TOKEN` to GitHub secrets for CI |
| [ ] | **Supabase** (staging + production projects, Singapore region) | Free → ~US$25/mo | Phase 1 | Invite me via keys in secrets when we get there |
| [ ] | **Firebase project** (FCM only) | Free | Phase 2 | Android push needs FCM credentials, even with Expo Push |
| [ ] | **Domain** (e.g. `bellpals.app`) + support email | ~US$15–25/yr | Phase 2 | For invite links, the landing page and the privacy policy URL |
| [ ] | Sentry, PostHog | Free tiers | Phase 1 / 3 | |
| [ ] | RevenueCat | Free to start | Post-launch | Only when BellPals+ happens |

## C. Devices and people

- [ ] **Test phones:**
  - an iPhone on iOS 26/27, ideally two so both versions get covered
  - a **Samsung** and/or **Xiaomi/Oppo** (aggressive battery management), ideally a **Pixel** as well
- [ ] **A Mac with Xcode**, if you have one. It helps a lot when debugging the iOS alarm module; EAS can build without it.
- [ ] **Your time for device testing.** Each spike or release-candidate run takes about 30–45 min. I'll give you a scripted checklist, because I can't physically hear an alarm ring from the cloud.
- [ ] **A dogfood crew of 5–10 friends** for Phase 2 (early December).
- [ ] **20–50 beta testers** for Phase 3, including **at least 12 on Android** who stay opted in for 14 days.

## D. Design and brand

- [ ] Brand direction (D8) or existing brand guidelines.
- [ ] Logo and app icon. Tell me if designmagic is doing these, or if I should propose concepts.
- [ ] **A Figma file link** once screens exist. I can read it through the Figma connector and build from it.
- [ ] **Sounds:** a signature chime plus 8+ alarm tones, commissioned or licensed with an app-distribution licence. I can write the sound brief.
- [ ] Approval of the **tone of voice** ([DESIGN.md §9](DESIGN.md#9-voice-and-tone)).
- [ ] Later: store screenshots, a preview video and the landing page.

## E. Legal and admin

- [ ] The **company** that publishes the app (D9), and a **Data Protection Officer** contact (PDPA).
- [ ] **Trademark and name check** for "BellPals" (IPOS, plus any markets you plan to enter).
- [ ] **Privacy policy and terms.** I'll draft them for a lawyer to review before the beta.
- [ ] A **support email address** (e.g. `hello@bellpals.app`).
- [ ] Before scaling: a **freedom-to-operate check** on group-alarm patents with an IP lawyer. Low priority for the MVP.

---

## What happens after you reply

1. I update the PRD and roadmap with your decisions and record them as ADRs.
2. **Phase 0 starts:** I build the alarm-engine spike app and write your device test checklist.
3. You run the checklist on your phones. We review the reliability report together and make the **go/no-go call (M0)**.
