# BellPals — Design Notes

| | |
|---|---|
| **Version** | 0.2 · 30 Sep 2026 |
| **Source of truth** | The clickable prototype in [`prototype/`](../prototype/README.md). This doc explains it and lists what the design team needs to produce. |
| **Related** | [PRD](PRD.md) · [Architecture](ARCHITECTURE.md) |

## 1. Principles

- **Groggy-proof.** Wake-time screens have one job, big targets (≥ 64 pt) and no typing.
- **Cute, then calm.** Daytime screens are warm and playful. Alarm screens are dark, so nobody gets blinded at 5 a.m.
- **Show the stakes.** While your alarm rings, you see your pals' faces and the countdown to *their* phones ringing.
- **Kind accountability.** "Your alarm woke 3 pals" is honest, never mean.

## 2. Screens (as built in the prototype)

**Sign-up**
1. **Welcome:** the five BellPals and the one-line promise, then *Continue with Apple* and *Continue with Google*.
2. **Profile:** full name, @username with an availability check, and the linked Gmail / Apple ID.
3. **Pick your BellPal:**
   - the 5 choices
   - the selected one, large, with its personality line
   - its evolution path, with the Super and Mega forms shown as silhouettes until they're unlocked
4. **First alarm:** hour / minute / AM–PM wheel, then day chips from S to S (default weekdays at 7:00 AM). There's a *Skip* option.

**Tabs**

1. **Home**
   - the BellPal at its current form: tap it to see a reaction
   - level and progress to the next level
   - treats per alarm
   - next evolution
   - your next alarm with a countdown
   - "{group} today": everyone's alarm time
   - or, if you're not in a group: the pending invitation, or *Create a group*
2. **Alarms**
   - a week list from Sunday to Saturday, one row per day, each with a time or *No alarm* and an on/off switch
   - *Set alarm for several days* opens the editor
   - the editor warns when it will replace a day's existing alarm (one per day)
3. **Pals**, split into *My group* and *Friends*
   - **My group:**
     - members with their BellPal, the owner badge and each person's next alarm
     - pending invites
     - *Invite friends (n seats left)*
     - "How your group works"
     - *Leave group* (member) or *Delete group* (owner)
   - **No group:** invitation cards showing the members and their alarm times, *Decline* / *Join group*, and *Create a group*.
   - **Friends:**
     - *Add friends from contacts*: a permission primer, then "On BellPals" with *Add*, and "Invite to BellPals" with *Invite*
     - search by username
     - requests and the friends list, with *Invite* to your group
4. **Profile**
   - name, @username and *Edit*
   - your BellPal
   - linked accounts (Gmail, Apple ID)
   - notifications info
   - *Sign out*
   - *Delete account*: a two-step sheet with typed DELETE

**Alarm screens**
1. **Your alarm ringing:**
   - big clock and your BellPal shaking
   - a group box: "Morning Crew rings in 0:18. Get up now to spare them", which turns red: "3 pals ringing now"
   - *Snooze (once)*
   - *Swipe to feed {BellPal}*
2. **Snoozed:**
   - countdown to the second ring
   - "rings on every phone in the group at the same time"
   - *I'm up, feed now* / *Hide*
3. **Second ring:** same as the first ring, with "Snooze used" and no snooze button.
4. **Feeding:**
   - "Still ringing"
   - the BellPal big and hungry; its mouth opens wider when a treat gets close
   - 1–3 treats in a tray to drag into its mouth
5. **Result:**
   - "Alarm off for everyone"
   - a happy BellPal and progress
   - level-up or evolution: a flash, then the new form
   - "Your alarm woke 3 pals" or "You were up before your pals rang"
6. **A pal's alarm on your phone:**
   - "Aisha isn't up yet"
   - "Only Aisha can turn it off"
   - how long it's been ringing
   - who else in the group is ringing

   Then either "Aisha snoozed" with a countdown, or "Aisha is up!"
7. **Notifications** (5 min and 1 min before): "Aisha's alarm in 5 minutes · 6:30 AM. Your phone rings 24 s later if Aisha isn't up."

**On iPhone the first alarm screen is Apple's, not ours.** AlarmKit draws the lock-screen alarm. We can set:
- its title
- the Stop button and one extra button (e.g. *Feed Ding*), with their colours

Our swipe-and-feed screens open from that button. See [ARCHITECTURE.md](ARCHITECTURE.md).

## 3. BellPals and treats

Five BellPals × three stages = **15 designs**, plus one treat each.

| BellPal | Personality | Treat | Stage 1 (Lv 1–5) | Stage 2 (Lv 6–10) | Stage 3 (Lv 11–15) |
|---|---|---|---|---|---|
| Ding | Sunny, a bit bossy | Honey cookie | Classic bell with a handle | + bow tie | + crown, glow, sparkles |
| Chime | A calm cat | Fish cracker | Cat ears, whiskers | Bigger ears + tail | + golden bell collar, star |
| Buzz | A snack-powered robot | Volt candy | One antenna | Two antennae + chest light | + visor eyes, bolts |
| Jingle | A bouncy bunny | Carrot | Bunny ears | Longer ears + flower | + bow, sparkles |
| Gong | A small loud dragon | Dragon fruit slice | Little horns | Bigger horns + spikes | + wings |

- The names and art are **placeholders** drawn in code for the prototype. Final names, designs and treats are yours.
- **Moods each BellPal needs:**
  - *idle*, which blinks and bobs
  - *sleepy*: Zzz
  - *ringing*, which shakes
  - *hungry*: mouth open
  - *mouth wide*, when a treat is near
  - *chomp*
  - *happy*
- **For evolutions:** a short transition (flash → new form) plus a silhouette version for locked forms.

## 4. Visual direction used in the prototype

**Palette**
- Daytime: warm cream background (`#FFF4E8`) with white cards and deep-purple ink (`#2A2344`).
- Accents: coral (`#E0492A` for buttons, `#FF7A59`) and sun yellow (`#FFC94A`).
- Alarm screens: midnight blue (`#161B3F`) with a sunrise glow.

**Type**
- *Fredoka* for headings and clocks.
- *Nunito* for text.

**Shape and motion**
- Chunky, rounded, "toy-like" buttons with a solid bottom shadow.
- Motion is small and purposeful: BellPals bob and blink, shake when ringing, and bounce when fed. With Reduce Motion on, everything turns into simple fades.

This is a starting point for the design team, not a brand. Replace it freely.

## 5. Accessibility

- [ ] Text contrast ≥ 4.5:1 (prototype colours were checked) and touch targets ≥ 48 pt.
- [ ] The feeding game works without dragging: in the prototype a treat can be fed with the keyboard (Enter). The native app needs an equivalent, e.g. a VoiceOver/TalkBack action.
- [ ] Every state is written in words, not only shown in colour (Ringing, Snoozed, Rings in 0:12…).
- [ ] Reduce Motion is respected.

## 6. What the design team needs to deliver

| When | Deliverable |
|---|---|
| Phase 2 | App icon · stage 1 of all 5 BellPals · colour and type tokens · screens for sign-up, home, alarms |
| Phase 3 | Screens for friends, contacts, groups and invitations |
| Phase 4 | Stages 2 and 3 of all BellPals · 5 treats · moods and evolution animation · alarm screens · the iPhone lock-screen alarm (title, buttons, tint) and Android full-screen alarm · 2 alarm sounds (your alarm and a pal's alarm) |
| Phase 6 | Store screenshots and preview video |

Share Figma links as you go. I can read Figma files and build from them.
