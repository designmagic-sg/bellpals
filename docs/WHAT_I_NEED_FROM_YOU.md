# What I need from you

## A. Try the prototype and tell me what to change

The prototype in `prototype/` is a clickable version of the whole spec. A published link is shared in our chat.
- On a computer you'll see the phone, a *Prototype controls* panel, and your pals' phones live.
- On a phone, use the **Demo** button in the top-right corner.

Things worth trying:
1. Sign in, pick a BellPal, set an alarm.
2. **Pals → accept Aisha's invite** to Morning Crew.
3. **Ring my alarm now.** Watch your pals' phones start ringing 24 s later. Snooze once, then swipe and feed.
4. **Ring their alarm.** A pal's alarm rings on *your* phone 24 s after theirs.
5. **BellPal level +/-** and **See all 15 BellPal forms**.
6. Profile → **Delete account** (type DELETE).

## B. Questions about the rules

The prototype uses the proposed answer for each question. Reply with the number and your choice, e.g. "Q2: 15 min".

| # | Question | Proposed answer (used in the prototype) |
|---|---|---|
| Q1 | How long is a snooze? | **5 minutes.** The prototype has a 15-second demo switch |
| Q2 | If the owner never turns the alarm off (asleep, or phone dead), pals' phones would ring forever. Should there be a cut-off? | **Yes: stop every phone after 10 minutes**, and the BellPal misses its meal. *Not in the prototype yet* |
| Q3 | How many fed mornings to go up one level? | **3 per level for Lv 1–5, 5 for Lv 6–10, 7 for Lv 11–15.** That's about 68 mornings to Lv 15. Alternative: 1 feed = 1 level (Lv 15 in 15 mornings) |
| Q4 | If a group owner deletes their account, what happens to the group? | **The group is deleted for everyone.** Alternative: ownership passes to the longest-standing member |
| Q5 | Can someone be in more than one pal group? | **No, one group at a time**, so nobody's phone rings for 10+ alarms a day |
| Q6 | Who can invite people into a group? | **Any member** can invite their own friends. Alternative: owner only |
| Q7 | While a pal's alarm rings on my phone, can I do anything (e.g. mute my own phone for a minute)? | **No**, as in your spec. Note that on iPhone, Apple's alarm screen always has a Stop button; we'll re-ring if it's tapped too early |
| Q8 | "Sunday to Monday": I read this as any day of the week, Sunday to Saturday. Right? | **Yes, any day from Sunday to Saturday** |
| Q9 | Can people switch to a different BellPal later? | **No**, you pick once at sign-up |
| Q10 | Should anything happen to the BellPal when its owner sleeps through? | **Nothing for now** |
| Q11 | Pals in other time zones ring at the owner's alarm moment (maybe 3 a.m. for them). OK? | **Yes**, it's the same instant for everyone |
| Q12 | Finding friends in contacts needs a match. Phone-number matching needs SMS verification, which costs money per text. | **v1: match by email, and invite everyone else with a link.** Phone numbers later if needed |

## C. Design

- [ ] **Final BellPals:** 5 characters × 3 evolution stages = **15 designs**, with names and personalities. The prototype's Ding, Chime, Buzz, Jingle and Gong are placeholders.
- [ ] **5 treats**, one favourite per BellPal.
- [ ] **Moods** for the animations: idle, sleepy, ringing, hungry, mouth wide open, chomp, happy.
- [ ] **App icon and colours.** Keep or replace the prototype's cream, coral and midnight look.
- [ ] **2 alarm sounds:** your alarm, and a pal's alarm.
- [ ] Figma links as the screens take shape. I can build directly from them.

## D. Accounts: later, as you said

You don't need any store accounts to review the prototype. They become necessary at these points:

| Account | Needed for | When |
|---|---|---|
| **Apple Developer Program** (US$99/yr) | Testing on real iPhones with push notifications, which the group ringing depends on. A free Apple ID can't use push | Phase 1 (iPhone part). We can start Phase 1 on Android only while you set this up |
| **Google Play Console** (US$25 once) | Closed beta and release. Use an **organisation** account to avoid the "12 testers × 14 days" rule for personal accounts | Phase 5 |
| Expo, Supabase, Firebase | Builds, backend, Android push. All have free tiers | Phase 1–2. I'll say exactly when and which keys to add as secrets. Never paste keys in chat |

**Organisation accounts** need a D-U-N-S number. It's free, but can take 1–2 weeks, so it's worth starting early.

## E. Phones for the real-phone test (Phase 1)

Group ringing needs **several phones at once**:
- at least 2 iPhones on iOS 26 or 27
- at least 2 Android phones, ideally one Samsung or Xiaomi, since those brands are strict about background apps

They can be friends' phones.
