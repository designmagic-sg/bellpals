# BellPals — Product Requirements Document

| | |
|---|---|
| **Version** | 0.1 (draft for review) |
| **Date** | 30 Sep 2026 |
| **Status** | Draft. Open decisions are tracked in [WHAT_I_NEED_FROM_YOU.md](WHAT_I_NEED_FROM_YOU.md) |
| **Related** | [Roadmap](ROADMAP.md) · [Design brief](DESIGN.md) · [Architecture](ARCHITECTURE.md) |

---

## 1. Summary

BellPals is a mobile alarm app built for friends. You can still set alarms ("bells") for yourself, but you can also set one for a pal or a whole crew. A live **Wake Board** shows who's actually up, and pals can rescue anyone who's still asleep.

It's for the mornings that matter, like the 5 a.m. airport run, exam day or the gym session you promised, and for ordinary mornings that are easier with company.

**Positioning.** For friend groups who need to be up for something that matters, BellPals is the shared alarm that actually rings, shows who's up and lets pals rescue anyone who isn't. Group chats and solo alarms fail without anyone noticing.

## 2. Problem

- **Alarms are solo tools, but oversleeping is a group problem.** When one person oversleeps, the whole group misses the flight, ferry or hike start, and usually nobody finds out until it's too late.
- **Group chats don't work at 5 a.m.** "U up?" messages get muted overnight, and nobody can tell who's really awake.
- **Heavy sleepers need backup.** They rely on friends or family to call them, but calls get silenced by Focus or Do Not Disturb, and calling someone at 5 a.m. is awkward.
- **Habits stick better with company.** People turn up for the 6 a.m. run when someone is counting on them, but there's no easy way to share the wake-up itself.
- **A technical gap has just closed.** Before iOS 26, third-party iPhone apps couldn't ring like the built-in Clock app, because the mute switch and Focus silenced them. Apple's **AlarmKit** (iOS 26, 2025) now lets apps schedule real alarms, so a social alarm people can trust is finally possible on both iOS and Android.

## 3. Goals and non-goals

**Goals for v1**
1. **It rings, every time.** A BellPals bell should be as trustworthy as the phone's built-in alarm.
2. **Shared wake-ups are effortless.** Creating a crew bell and getting everyone set should take less than a minute.
3. **Close the loop.** Everyone can see who's up, and nobody gets left asleep.
4. **Grow through friends.** Every shared bell is also an invitation.

**Non-goals for v1**
- Sleep tracking or sleep-science features.
- Matching with strangers, such as wake-up calls from random users.
- Tablet, web or dedicated smartwatch apps. The OS mirrors alarms to watches on its own.
- Ads.
- Paid features. v1 is free (see §13).

## 4. Target users

**Proposed launch audience:** friend groups aged 18–30 in Singapore: students, young professionals, NSFs, travel crews and gym/run/study buddies. English only at launch. *(Decision D1)*

| Persona | Situation | Job to be done | What they need |
|---|---|---|---|
| **Ethan, the organiser** (26) | Plans the group trips | Get 6 friends to Changi for a 7 a.m. flight without a night of "are you up?" texts | One bell for everyone, plus proof that everyone's up |
| **Mika, the heavy sleeper** (21) | Uni student who sleeps through three alarms | Not miss the 8 a.m. exam | Someone watching their back. A friend's voice works better than a beep |
| **Priya & Jon, the habit buddies** (29) | Run club, Mon/Wed/Fri at 6 a.m. | Stay consistent | Waking together, streaks and a little friendly pressure |
| **Lina, the long-distance one** (24) | Studying in London, family in Singapore | Stay close across time zones | Wake someone with a voice message at the right time for *them* |

## 5. Key use cases

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| U1 | organiser | create a one-time **Crew Bell** for 4:30 a.m. and invite my trip crew | everyone's phone rings at the same moment |
| U2 | crew member | accept a bell invite in one tap and trust it to ring even when my phone is on silent | I don't have to set anything up myself |
| U3 | organiser | see a **Wake Board** showing who's set, who's up and who's still asleep | I stop chasing people |
| U4 | pal | get alerted when someone hasn't checked in, and nudge them | nobody gets left behind |
| U5 | heavy sleeper | get a **Backup Bell** if I don't check in, and have my backup pals alerted | I can't just switch it off and go back to sleep |
| U6 | friend | record a voice message that wakes my pal up | mornings feel personal |
| U7 | habit buddy | set a recurring crew bell (Mon/Wed/Fri 6:00) and build a streak | we stay consistent together |
| U8 | anyone | control who can send me bells and when, and block people | my phone never rings without my say-so |
| U9 | solo user | use BellPals as my everyday alarm | I don't need two alarm apps |

## 6. Competitive landscape

The "social alarm" category has been validated, but it's young and fragmented. Several small apps have launched recently and none of them dominates yet.

| App | What it offers | Where BellPals can win |
|---|---|---|
| **Galarm** | Long-running alarms and reminders app with group alarms and alarms for others | It's broad and utilitarian. BellPals focuses on the social wake-up and has a stronger brand |
| **Ringlink: Group Alarm** | Group alarms synced across time zones; shows who was on time, snoozed or slept in | BellPals adds Pal Rescue, Voice Bells and consent controls |
| **WakeMate** | Set alarms for friends and family remotely, with permission controls | BellPals adds a crew/group focus, the rescue loop and design quality |
| **PingPal** | Send alarms to friends; recipients prove they're up with a selfie, pose or dance video | Fun but gimmicky. BellPals leads with reliability and rescue, and adds proofs later |
| **Wake: The Social Alarm** | Voice messages from friends, group alarms | The closest concept. BellPals competes on reliability, the rescue loop, design and a focused local launch |
| **Snooze Squad** | Social alarm | To assess |
| **Alarmy** | Solo alarm with "missions" that prove you're awake; the category leader for heavy sleepers | It isn't social. Missions are a later add-on for BellPals |

> Feature notes above come from store listings and search results (Sep 2026). A hands-on teardown of the top three is part of Phase 0.

**Implication:** BellPals has to win on four things:
1. **Reliability.** It rings, and we can prove it.
2. **The rescue loop.** Nobody gets left asleep.
3. **Design and brand.**
4. **Focused go-to-market.** Singapore friend groups, campuses and travel crews first.

## 7. Product principles

1. **It must ring.** Reliability beats features. If something can't ring reliably, it doesn't ship.
2. **Consent first.** Nobody can make your phone ring without your say-so.
3. **Kind mornings.** Accountability without shame. The tone can be cheeky, but never mean.
4. **Groggy-proof.** Every wake-time action works half-asleep: big targets, one tap, no typing.
5. **Private by default.** Your wake status is shared only with the people on that bell.

## 8. Core concepts (glossary)

| Term | Meaning |
|---|---|
| **Bell** | An alarm in BellPals, either one-time or repeating |
| **Pal** | A mutual friend connection |
| **Crew** | A named group of pals, e.g. "Bali Trip ✈️" or "Run Club 🏃" |
| **Ringer** | A person whose phone rings for a bell |
| **Watcher** | A person who gets status updates and rescue alerts for a bell but whose phone doesn't ring (e.g. the sender of a Pal Bell, or a Backup Pal) |
| **My Bell** | A bell where I'm the only ringer. I can optionally add **Backup Pals** as watchers |
| **Pal Bell** | A bell I set for one pal, who is the ringer while I watch. They must accept unless they trust me |
| **Crew Bell** | A bell for a crew. Each member accepts to become a ringer |
| **Voice Bell** | A bell whose sound is a pal's recorded voice clip |
| **Set ✓** | The ringer's phone has confirmed that the bell is scheduled on the device |
| **I'm up!** | The check-in that tells everyone you're awake |
| **Wake Board** | Live status of everyone on a bell |
| **Wake window** | From ring time to ring time + 60 min |
| **Backup Bell** | A second ring if you haven't checked in N minutes after ring time |
| **Pal Rescue** | Watchers and crewmates get alerted when someone hasn't checked in, and can nudge them |
| **Nudge** | An urgent push alert a pal sends to someone who's still asleep |
| **Trusted pal** | A pal whose bells are accepted automatically |
| **Quiet hours** | Hours when non-urgent BellPals notifications (requests, reactions) arrive silently |

## 9. MVP requirements

Requirement IDs are referenced in issues and PRs.

### 9.1 Accounts and profiles (ACC)
- **ACC-1** Sign in with Apple, Google or an email one-time code. *(Decision D4)*
  Apple requires an equivalent privacy-focused login whenever Google sign-in is offered, and Sign in with Apple is the simplest way to meet that.
- **ACC-2** Profile with display name, unique `@username`, avatar (photo, or emoji plus colour) and time zone. The time zone comes from the device automatically and can be edited.
- **ACC-3** Delete the account in-app, which removes the profile, pals and clips and anonymises wake history. The App Store requires this.
- **ACC-4** One ringing phone per account in v1: the phone you last confirmed. Switching phones moves your bells over.

### 9.2 Pals and crews (PAL)
- **PAL-1** Add pals via an invite link (shared through WhatsApp, Telegram or Instagram), a QR code or a `@username` search.
- **PAL-2** Accept or decline pal requests, and see pending requests.
- **PAL-3** Remove a pal or block a user. A blocked user can't find you, request you or send you bells, and any shared bells with them end.
- **PAL-4** Mark a pal as **Trusted** so their bells are auto-accepted. Off by default.
- **PAL-5** Crews: create one (name, emoji, colour), invite pals, leave, and let the owner remove members. Up to 20 members in v1.
- **PAL-6** An invite link opens the app if it's installed, otherwise the store. After installing, tapping the link again completes the invite. Deferred deep linking (joining without the second tap) comes in v1.1.
- **Acceptance:** a new user who taps a crew invite link can be in the crew and looking at the pending bell within 2 minutes, including sign-up.

### 9.3 Bells (BELL)
- **BELL-1** Create a bell with:
  - a time
  - a date (one-time) or repeat days
  - a label (short, because it shows on the lock screen)
  - an emoji
  - a sound
  - snooze on/off and length (5/9/10/15 min, default 9)
  - an optional Backup Bell
- **BELL-2** Choose who's ringing (me / a pal / a crew) and optionally who's watching.
- **BELL-3** The bell rings at the scheduled time on each ringer's phone, even when the phone is:
  - locked
  - on silent/mute
  - in Focus or Do Not Disturb
  - running with the app closed
  - offline

  This applies on supported OS versions; see the test matrix in [ARCHITECTURE.md](ARCHITECTURE.md#11-phase-0-reliability-spike).
- **BELL-4** Stop and snooze from the lock screen. Snoozes are counted (best-effort on iOS).
- **BELL-5** Edit or cancel a bell and the changes reach participants' phones. Participants show *Update pending* until their phone confirms.
- **BELL-6** Time zones. Every shared bell has a **time mode**:
  - **Same moment**: everyone rings at the same instant (default for one-time bells, e.g. flight day).
  - **Same local time**: everyone rings at, say, 07:00 wherever they are (default for repeating bells, e.g. habits).

  The UI always shows each person's local ring time.
- **BELL-7** **Alarm Health**:
  - Onboarding and Settings check the permissions (alarms, notifications, exact alarms and battery optimisation on Android).
  - They explain how to fix anything that's off.
  - A **Test ring in 1 minute** button lets the user confirm it works.
- **BELL-8** A built-in sound set of at least 8 original tones, ranging from gentle to loud, including a signature BellPals chime.
- **BELL-9** The Bells list shows upcoming bells (mine, pal and crew) sorted by next ring, with the next bell highlighted and a countdown.

### 9.4 Shared bells and consent (SHARE)
- **SHARE-1** Pal and crew bells create **invites**. The ringer sees who sent it, the label, the ring time *in their local time*, the sound and who else is in. They can accept or decline in one tap, including straight from the notification.
- **SHARE-2** Bells from trusted pals are auto-accepted. The ringer gets a heads-up notification and can still leave.
- **SHARE-3** Incoming policy: *Any of my pals* (default) / *Trusted pals only* / *Nobody*.
- **SHARE-4** Quiet hours (default 23:00–07:00 local time) make requests and reactions arrive silently. They never silence a bell you've accepted.
- **SHARE-5** **Device confirmation.** A ringer only shows **Set ✓** once their phone confirms the bell is scheduled. Unconfirmed ringers get reminders 12 h and 1 h before ring time.
- **SHARE-6** Anyone can leave a bell at any time.
- **SHARE-7** Rate limits:
  - at most 5 pending bell invites from one sender to one recipient
  - at most 20 bells created per user per day
  - at most 50 pal requests per user per day
- **Acceptance:** nobody's phone can ring for a bell they haven't accepted (or auto-accepted via Trusted).

### 9.5 Waking up and the Wake Board (WAKE)
- **WAKE-1** **I'm up!** check-in: one big tap after the alarm, with an optional emoji.
  - On iOS, check-in opens from the alarm's *I'm up* button or a follow-up "Tap to check in" notification. The system owns the alarm screen itself.
  - On Android, check-in is on our full-screen ringing screen.
- **WAKE-2** A **Wake Board** for each bell occurrence shows each person's state:
  - Invited · Declined · Set ✓ · Update pending
  - Ringing · Snoozed ×n
  - Up (with time)
  - Not up yet · Slept through

  It updates within 5 s while online. States are listed in [DESIGN.md](DESIGN.md#6-wake-board-states).
- **WAKE-3** Notifications (each type can be switched off):
  - "Mika is up ☀️"
  - "Everyone's up 🎉"
  - "Mika isn't up yet. Nudge?"
- **WAKE-4** **Backup Bell.** If there's no check-in 10 min after ring time (configurable), a second bell rings. It's scheduled on the device in advance and cancelled on check-in, so it works offline.
- **WAKE-5** **Pal Rescue and Nudges.**
  - After the grace period (default 15 min, configurable 5–30), watchers and crewmates are alerted and can nudge.
  - A nudge is an urgent push alert with sound.
  - Each pal can send at most 3 nudges per occurrence, and only inside the wake window.
- **WAKE-6** **Streaks** for recurring bells:
  - personal on-time streak
  - crew streak: occurrences where everyone was up within the grace period
- **Acceptance:** in beta, at least 80% of shared-bell occurrences end with every ringer checked in within 15 min.

### 9.6 Voice Bells (VOICE)
- **VOICE-1** Record a clip of up to 30 s when sending a Pal or Crew Bell. You can preview it and re-record.
- **VOICE-2** The ringer hears the clip **as the alarm sound** if the platform allows it. The Phase 0 spike checks this. If it doesn't, the fallback is that the bell rings with a tone and the clip plays automatically on check-in.
- **VOICE-3** Clips are private to the bell's participants, can be reported, and are auto-deleted 30 days after the bell ends.
- **VOICE-4** Ringers can switch off voice bells and use their own sound instead.

### 9.7 Onboarding and settings (ONB / SET)
- **ONB-1** Onboarding runs in this order:
  1. value intro (3 cards)
  2. sign in
  3. name, avatar and username
  4. permission primers that explain *why* before each OS prompt
  5. first bell and a test ring
  6. invite pals
- **ONB-2** New users arriving from an invite link go straight to that bell or crew after sign-up. Permissions are asked for at the moment they're needed, e.g. when accepting the bell.
- **SET-1** Settings include:
  - default sound and snooze
  - who can send me bells
  - trusted pals and quiet hours
  - Alarm Health
  - notification types
  - blocked users
  - privacy policy and terms
  - delete account

### 9.8 Support and trust (ADM)
- **ADM-1** Report a user or a clip. Reports are stored for review; the Supabase dashboard is enough as the admin tool in v1.
- **ADM-2** An **"It didn't ring"** button on missed bells captures diagnostics: OS, app version, permission state and scheduled alarms. This feeds reliability triage.

## 10. Post-MVP backlog

| Priority | Items |
|---|---|
| **Should** (v1.1–1.2) | Wake-up missions (math, shake, scan QR, photo proof) · morning selfies and reactions on the Wake Board · contact discovery with hashed phone numbers · home-screen widgets and Live Activity countdown · deferred deep links · localisation (中文, Bahasa Melayu, தமிழ்) · calendar suggestions ("Flight at 07:40, set a 04:30 bell?") · crew bedtime nudge |
| **Could** (later) | BellPals+ subscription · sound packs · dedicated Apple Watch / Wear OS apps · public challenges ("5 a.m. club") · live wake-up calls · smart-light integrations |
| **Won't** (for now) | Stranger matching · ads · tablet/desktop apps |

## 11. Non-functional requirements

| Area | Requirement |
|---|---|
| Reliability | ≥ 99.5% of accepted bells ring within ±60 s (measured in the Phase 0 matrix and in beta). "Didn't ring" reports < 0.5% of occurrences |
| Offline | Accepted bells ring with no network. Check-ins queue and sync later |
| Latency | Wake Board updates within 5 s of a check-in while online |
| Performance | Cold start < 2 s on a mid-range Android. Ringing UI visible within 1 s of the alarm |
| Platforms | iOS 26+ (AlarmKit) and Android 10+ (targeting API 36), phones only *(Decision D2)* |
| Accessibility | Dynamic Type/font scaling · VoiceOver/TalkBack labels · text contrast ≥ 4.5:1 · touch targets ≥ 48 pt (≥ 64 pt on wake-time screens) · Reduce Motion respected · status never shown by colour alone |
| Privacy | Wake status visible only to that bell's participants. No location data and no contact upload in v1. Data stored in a Singapore region |
| Security | Row-level security on every table · rate limits on requests and nudges · signed URLs for media |
| Battery | No background-audio keep-alive hacks. Only OS alarm APIs |
| Quality | Crash-free sessions ≥ 99.5% |

## 12. Success metrics

**North-star metric: shared wake-ups per week**, i.e. check-ins on bells that have more than one participant.

| Metric | Initial target (3 months after launch) |
|---|---|
| Activation: new users with ≥ 1 pal **and** ≥ 1 accepted shared bell within 7 days | 40% |
| Shared-bell success: occurrences where every ringer checks in within 15 min | ≥ 80% |
| Invite conversion: invite link tapped → installed and joined | ≥ 30% |
| D30 retention | ≥ 25% |
| "Didn't ring" reports | < 0.5% of occurrences |
| Crash-free sessions | ≥ 99.5% |

These targets are starting guesses and will be re-baselined after the closed beta.

## 13. Monetisation *(Decision D6)*

**Recommendation: free at launch.** Growth depends on every friend joining, so we should never paywall *receiving* or *accepting* bells.

Once there's retention signal (v1.2+), introduce **BellPals+** at roughly S$3–5 a month, via RevenueCat. It would include:
- a voice clip library
- bigger crews
- premium sound packs
- missions
- themes
- wake stats

## 14. Safety, privacy and compliance

- **Consent model:** SHARE-1…4, trusted pals, rate limits, nudges only inside the wake window, block and report.
- **Age:** target 13+. Complete the App Store and Play age-rating questionnaires in Phase 4.
- **PDPA (Singapore):**
  - collect data with consent and a clear purpose
  - appoint a Data Protection Officer and publish their contact
  - handle access and correction requests
  - apply retention limits
  - notify the PDPC of notifiable breaches (within 3 days of assessment)
- **Other jurisdictions:** GDPR / UK GDPR applies if we market in the EU or UK.
- **App Store:**
  - privacy nutrition labels
  - in-app account deletion
  - Sign in with Apple
  - a clear `NSAlarmKitUsageDescription`
  - no background-audio hacks
- **Google Play:**
  - Data safety form
  - declarations for `USE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT` and the foreground-service type
  - target API 36
  - for personal developer accounts, a closed test with ≥ 12 testers for 14 days before production
- **Voice clips:** private storage, reportable, deleted 30 days after the bell ends.

## 15. Risks and mitigations

| Risk | Likelihood / impact | Mitigation |
|---|---|---|
| **Bells don't ring reliably.** AlarmKit is new, and developers have reported late or missed alarms in some conditions plus regressions in iOS 27 betas. Some Android makers aggressively kill background apps | Medium / **Critical** | Phase 0 device spike against a test matrix · native modules · Backup Bell · Alarm Health · "didn't ring" diagnostics · track Apple forums and file Feedback |
| **iOS only lets us schedule a bell when our app gets to run** on the pal's phone | High / High | Consent-first accept flow: tapping Accept runs the app, which schedules the bell · Set ✓ confirmation · reminders before ring time · Phase 0 tests scheduling from a notification action without opening the app |
| **Crowded category** | High / Medium | Win on reliability, Pal Rescue, design and a focused Singapore launch · ship fast |
| **Abuse** (unwanted alarms or nudges, offensive clips) | Medium / High | Consent model, trusted pals, rate limits, nudges only in the wake window, block/report, clip retention limits |
| **Store review / policy rejections** (alarm permissions, background modes) | Medium / Medium | Use only sanctioned APIs · prepare declarations and review notes with a demo video |
| **Google Play's 12-tester rule** for personal accounts | High (personal) / Low (organisation) | Publish from an organisation account, or run the Phase 3 closed beta with ≥ 12 Android testers for 14 days |
| **Time-zone and DST bugs** | Medium / High | UTC instants plus IANA zones, explicit time modes, unit tests with DST fixtures |
| **Scope creep delays launch** | Medium / Medium | Strict MVP. Everything else goes to the backlog |
| **Existing patents on group alarms** (e.g. US 10,299,236; US 9,715,820) | Low / Medium | Freedom-to-operate check with an IP lawyer before scaling. This isn't legal advice |

## 16. Go-to-market (outline)

- **Market:** Singapore first, in English, on iOS and Android together.
- **Seeding:** 5–10 real friend groups during beta. Then campus clubs and hall committees, run and hiking clubs, and travel groups.
- **Built-in virality:** every shared bell is an invite. Shareable "Everyone's up 🎉" cards.
- **Seasonal moments:**
  - **Ramadan 2027**, expected to start around early Feb 2027 depending on moon sighting: "Sahur crews", where families and friends wake together before dawn. This fits a late-January launch.
  - Exam seasons.
  - Year-end travel.
- **Content:** short-form videos, e.g. "my friends woke me up with…" and the voice-bell reactions.

## 17. Open questions

These are tracked with recommended defaults in [WHAT_I_NEED_FROM_YOU.md](WHAT_I_NEED_FROM_YOU.md).
