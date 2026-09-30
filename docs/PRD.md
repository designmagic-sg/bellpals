# BellPals — Product Requirements

| | |
|---|---|
| **Version** | 0.2 · 30 Sep 2026 · rewritten around the product owner's spec |
| **Prototype** | [`prototype/`](../prototype/README.md): a clickable web version of everything below |
| **Related** | [Roadmap](ROADMAP.md) · [Design](DESIGN.md) · [Architecture](ARCHITECTURE.md) · [What I need from you](WHAT_I_NEED_FROM_YOU.md) |

## 1. The product in one paragraph

BellPals is an alarm app for small groups of friends.

- **Pal groups.** You invite friends into a pal group of up to 5 people.
- **Shared ringing.** When anyone's alarm rings and they're not up within 24 seconds, every phone in the group starts ringing too. It keeps ringing until that person turns their alarm off.
- **Turning it off.** To turn it off, you swipe and then feed your **BellPal**, a tamagotchi-style mascot, by dragging treats into its mouth.
- **Growing your BellPal.** Your BellPal levels up and evolves as it's fed each morning.

## 2. Requirements

IDs are used in issues, PRs and tests.

### Sign-in and profile

| ID | Requirement |
|---|---|
| AUTH-1 | Sign in with **Apple ID** or **Google (Gmail)**. |
| AUTH-2 | The profile lets you link the other provider too, e.g. link Gmail to an Apple sign-in. |
| PROF-1 | The profile has a **username** (unique; 3–20 characters: lowercase letters, numbers, `.` and `_`) and a **full name**. Both can be edited. |
| PROF-2 | The profile shows the linked Gmail address. |

### BellPal

| ID | Requirement |
|---|---|
| PAL-1 | At sign-up you choose one of **5 BellPals**. Prototype placeholders: Ding, Chime, Buzz, Jingle, Gong. |
| PAL-2 | A BellPal has **levels 1–15** (for now). |
| PAL-3 | It levels up by being **fed by its owner when their alarm rings**. |
| PAL-4 | **Treats needed to turn off an alarm:**<ul><li>Lv 1–5: 1 treat</li><li>Lv 6–10: 2 treats</li><li>Lv 11–15: 3 treats</li></ul> |
| PAL-5 | **Evolution.** Each band is a stage with its own look: Lv 1–5 → Lv 6–10 → Lv 11–15. That's 3 forms per BellPal and **15 designs in total** (prototype names: Mini, Super, Mega). |
| PAL-6 | ⚠️ *Open:* how many fed mornings each level takes. The prototype uses 3 (Lv 1–5), 5 (Lv 6–10) and 7 (Lv 11–15), which is about 68 mornings to reach Lv 15. See Q3. |

### Alarms

| ID | Requirement |
|---|---|
| ALARM-1 | Each user can set **one alarm per day**. |
| ALARM-2 | Pick any days from **Sunday to Saturday**, with an exact hour and minute. The picker shows **AM / PM**. |
| ALARM-3 | Setting a time on a day that already has an alarm replaces it, and the app says so. Each day can be switched off or deleted. |
| ALARM-4 | Because groups are capped at 5 people, a group has **at most 5 alarms per day**. |

### Friends

| ID | Requirement |
|---|---|
| FRIEND-1 | **Add friends from your phone contacts** easily: see which contacts already use BellPals and add them, or send an invite link to those who don't. |
| FRIEND-2 | Add friends by searching their username. |
| FRIEND-3 | Friend requests can be accepted or declined. |

### Pal groups

| ID | Requirement |
|---|---|
| GROUP-1 | Any user can **create** a group and becomes its **owner**. |
| GROUP-2 | **Joining takes two steps:**<ol><li>Someone adds you as a **friend**.</li><li>They **invite you to the group**.</li></ol>You join when you **accept the invitation**. |
| GROUP-3 | **Maximum 5 people** per group, including the owner. Pending invitations hold a seat. |
| GROUP-4 | Members can **leave**. |
| GROUP-5 | **Only the owner can delete** the group. |
| GROUP-6 | *Assumption:* a person is in **one group at a time**. They have to leave before joining or creating another (Q5). |
| GROUP-7 | *Assumption:* **any member** can invite their own friends, not only the owner (Q6). |

### How a group alarm rings

| ID | Requirement |
|---|---|
| RING-1 | At alarm time **T**, the owner's phone rings (the **first ring**). |
| RING-2 | **24 s later**, every other phone in the group starts ringing, unless the owner has already turned the alarm off. |
| RING-3 | Every phone **keeps ringing until the owner turns the alarm off**. Only the owner can turn it off. |
| RING-4 | The owner can **snooze once**. Snoozing silences every phone in the group. |
| RING-5 | When the snooze ends, the **second ring starts on every phone at the same moment**, with no 24 s delay. |
| RING-6 | After the second ring, the only option is to turn the alarm off. |
| RING-7 | Group alarms ring at the owner's alarm time as an absolute moment. Pals in other time zones ring at the same instant. |

### Turning the alarm off

| ID | Requirement |
|---|---|
| OFF-1 | The owner **swipes** the alarm, then the BellPal appears on screen. |
| OFF-2 | The owner **drags each treat with a finger into the BellPal's mouth**. The number of treats follows PAL-4. |
| OFF-3 | When the last treat is eaten, the alarm stops **on every phone in the group**. The BellPal gets a fed morning, which may mean a level-up or an evolution. |

### Notifications

| ID | Requirement |
|---|---|
| NOTIF-1 | **5 minutes before** any group alarm, every member of the group is notified, including the owner. |
| NOTIF-2 | **1 minute before** the alarm, a second notification goes to every member. |

### Account deletion

| ID | Requirement |
|---|---|
| DEL-1 | A user can delete their account in the app. |
| DEL-2 | **Deletion takes two steps:**<ol><li>A screen explains what will be lost.</li><li>The user **types DELETE** to confirm.</li></ol> |
| DEL-3 | The account, BellPal, alarms, friendships and group membership are deleted. Groups the user owns are deleted (Q4). |

## 3. What the platforms allow

The prototype shows the intended behaviour. Real phones limit how closely we can match it, and the Phase 1 test on real devices will measure the gaps.

| Rule | Android | iPhone |
|---|---|---|
| Own alarm rings at T, even on silent or with the app closed | ✅ `AlarmManager` | ✅ AlarmKit (iOS 26+) |
| Pals' phones ring at T + 24 s | ✅ Pre-scheduled on each phone | ✅ Pre-scheduled on each phone |
| Pals' phones stay silent if the owner is up within 24 s | ✅ Cancelled by push | ⚠️ Cancelled by push, which isn't guaranteed; a pal's phone may still ring briefly |
| Only the owner can stop the ringing | ✅ Our own ringing screen | ⚠️ Apple's alarm screen always has a Stop button. We can re-ring if a pal taps Stop too early |
| Stop every phone when the owner turns it off | ✅ High-priority push | ⚠️ Background push, which isn't guaranteed; a pal may have to tap Stop |
| Snooze: silence everyone, then ring everyone together | ✅ Push | ⚠️ Needs a push to reach each phone in time |
| Swipe, then feed the BellPal to turn off | ✅ Fully ours | ⚠️ Apple's alarm screen comes first; our swipe-and-feed screen opens from its button |
| Notifications 5 min and 1 min before | ✅ Scheduled on each phone | ✅ Scheduled on each phone (iOS allows 64 pending, so we schedule a rolling few days) |

## 4. Out of scope for now

Anything not listed above, such as missions, streaks, chat, ads and payments.

## 5. Assumptions and open questions

These are tracked with proposed answers in [WHAT_I_NEED_FROM_YOU.md](WHAT_I_NEED_FROM_YOU.md#b-questions-about-the-rules).
