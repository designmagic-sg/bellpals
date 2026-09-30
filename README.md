# BellPals 🔔

**An alarm app for friends.** Join a pal group of up to 5 people:
- **Shared ringing:** when anyone's alarm rings and they're not up within 24 seconds, everyone's phone rings too, until that person turns it off.
- **Turning it off:** swipe, then feed your **BellPal**, a mascot that levels up and evolves as you feed it every morning.

> **Status:** clickable prototype ready. The real app hasn't been started yet.

## Try the prototype

The prototype is a web version of the full spec with simulated friends:

```bash
cd prototype
npm install
npm run dev       # open the printed URL
npm test          # rule tests: 24 s delay, one snooze, group cap, treats per level…
npm run build     # one self-contained HTML file in prototype/dist/
```

See [prototype/README.md](prototype/README.md) for what's simulated.

## The plan

| Doc | What's in it |
|---|---|
| [What I need from you](docs/WHAT_I_NEED_FROM_YOU.md) | Prototype feedback, 12 questions about the rules, design assets, accounts (later) |
| [PRD](docs/PRD.md) | Every requirement with an ID, plus what iPhone and Android allow |
| [Roadmap](docs/ROADMAP.md) | Prototype → real-phone test → build → beta → stores (about 17 weeks) |
| [Design](docs/DESIGN.md) | Screens, the 15 BellPal forms, visual direction, what the design team delivers |
| [Architecture](docs/ARCHITECTURE.md) | How group ringing works on each platform, data model, test matrix |
