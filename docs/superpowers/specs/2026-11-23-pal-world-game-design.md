# Pal Patch: a shared farming world (design)

*Working title. Status: draft for approval, 23 Nov 2026.*

## 1. Intent

A cosy 2D farming game you play in the browser with friends. It plays like Stardew Valley: farm, fish, explore and earn, with new land unlocking as you go. You play as one of the four pixel characters from BellPals (Ding the bear, Chime the fox, Jingle the bunny, Gong the green one). Otherwise the game has **nothing to do with the BellPals alarm app**.

Who it's for: the owner and their friends first, other players later. It starts in the browser and may later come to mobile and Steam.

**Why the design looks like this:** you play together in a shared world that stays put, and you get into it by typing a short code. That's the part that's hard to change later, so it drives the technical choices.

## 2. Goals

1. **Shared worlds.** Anyone can create a world and gets a code (e.g. `MOON-4821`). Friends type the code to join. Everyone in a world sees each other move and act in real time.
2. **Pick a character.** Choose Ding, Chime, Jingle or Gong when you join a world.
3. **Farm.** Till, plant, water and harvest vegetables and flowers on the plot in front of the house.
4. **Fish.** Cast into the pond or river, catch fish with a short timing game, and sell them.
5. **Hunt.** Walk into the woods, find wild animals and hunt them with gear from the shop.
6. **Stone coins.** The currency is round stone coins with a square hole, in the style of old Chinese coins. You earn them by selling crops, fish and hunting drops. You spend them in the shop on seeds, fishing gear and hunting gear.
7. **Quests unlock land.** A quest board lists tasks like "Catch 3 fish". Finishing one opens a fenced-off area: more farm land, the pond, deeper woods.
8. **Expandable world.** The world is made of zones described in data. Adding an area means adding a map and one entry, not changing the code.
9. **Day and night.** A full day–night cycle, shown on a one-of-a-kind clock with an ornate, mythic look, *inspired by* Elden Ring's style but our own design.
10. **Saved worlds.** The world (fields, crops, unlocked land, each player's bag and coins) is saved on the server and is still there when you come back.

## 3. Non-goals (not in this version)

- Phone touch controls, a mobile app, or a Steam build. We keep the door open (see §6.8) but don't build them.
- Accounts with email and password. Players are known by a key their browser keeps (see §6.6).
- Seasons, weather, crafting, cooking, stamina or energy.
- Villagers to befriend, relationships, combat against monsters, or a story.
- Text chat (friends will usually be on a call). Emotes are in (§6.9).
- Public world lists or matchmaking with strangers. You only get in with a code.
- Paid hosting set-up. It runs on your computer while we build. Hosting comes as its own step.

## 4. Anti-goals (would make it a failure even if it works)

- **Copying Stardew Valley** (or Minecraft, or Elden Ring). No borrowed art, maps, names, menus or music. Same kind of game, our own look.
- **Gore.** Hunting stays cartoonish: a hit makes an animal flash, and when it's caught it vanishes in a puff of smoke and leaves its drop. No blood, no bodies.
- **Hunting animals that look like the player characters.** No bears, foxes, rabbits or anything like Gong as prey.
- **Laggy walking.** Your own character must respond instantly, even on a slow connection.
- **One player ruining a shared world.** The server checks every action (§6.3). A client can't give itself coins or wipe someone's crops.

## 5. Constraints

- Runs in a modern desktop browser (Chrome, Safari, Firefox, Edge) with keyboard and mouse.
- TypeScript throughout, like the existing `prototype/`.
- Lives in a new `game/` folder in this repo. It doesn't share code with `prototype/` apart from the character art.
- The character art is four pose sheets, each 4 × 2 poses: front, three-quarter, side, back, walk, jump, sit, sleep. Each character has **one** walk frame and **one** side view.
- There's no other art, so I'll draw the tiles, crops, fish, animals, tools, the coin and the clock as pixel art in the characters' palette (dark plum outline, soft pastels). They're built to be swapped for final art later.
- Prose in docs uses British spelling.

## 6. How it works

### 6.1 Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **Picked** | **Game server.** A Node server keeps every world and syncs players. | Worlds exist even when their creator is offline. Rules can't be cheated. The same server works later for mobile and Steam. Costs about US$5–10/month to host once it's public. |
| | One player hosts (peer-to-peer). | No server costs, but the world is only open while the host plays. Some networks block it, and cheating is trivial. |
| | Hosted database (Firebase or Supabase). | Quick to start, but walking feels laggy, conflicts happen, and the rules can't be enforced. |

The owner chose the game server.

### 6.2 Pieces

```
game/
  shared/   game rules as pure TypeScript, with tests: crops, items, prices, fish, animals, quests, time, zones
  server/   Colyseus game server: one "room" per world, saving to SQLite
  client/   Phaser 3 game in the browser, built with Vite
  art/      source sheets and the script that turns them into sprites
```

- **Phaser 3** draws the game: tile maps, sprites, camera, input.
- **Colyseus** handles rooms, joining by code and syncing state to every player.
- **`shared/`** is used by both client and server, so the rules exist in one place. It has unit tests (Vitest), in the same spirit as `prototype/src/domain/`.
- **SQLite** holds the saved worlds while we build. We'd switch to Postgres when we host it.

### 6.3 Who decides what

- **The server is the referee.** The client sends *intentions* ("till tile 12,8", "buy rod", "cast here"). The server checks them against the rules in `shared/` (are you close enough, do you own the seed, can you afford it, is the tile free) and then changes the world. Everyone sees the change.
- **Your own walking is predicted.** Your character moves the moment you press a key. The client sends its position about 15 times a second. The server rejects impossible jumps (too fast, through walls) and snaps you back. Other players are smoothed between updates.

### 6.4 Worlds and codes

- **Create a world:** pick a world name. The server makes a code: a 4-letter word, a dash and 4 digits (e.g. `MOON-4821`). It uses a short list of friendly words and leaves out letters and numbers that are easy to mix up.
- **Join:** type the code, pick a nickname and a character.
- **Up to 4 players at a time** per world. Two players can be the same character; name tags tell them apart.
- **Saving:** every 30 seconds while anyone is in the world, and when the last player leaves.
- The **creator is the world's owner.** For now the only owner-only power is removing a player from the world.

### 6.5 Time, day and night

- **1 real second = 1 in-game minute.** A full day is 24 real minutes.
- Morning starts at 06:00. It gets dark from 18:00 and is fully night from 20:00 until 05:00.
- **Night is darker, not black.** A blue tint, with lights from windows and lanterns. Some fish and animals only appear at night.
- **Sleeping:** go to bed in the house to end the day. With several players online, the day ends when **everyone online is in bed**, then morning comes for all. At 02:00 anyone still awake faints and wakes up at home, and the day ends anyway.
- **When nobody is online, time stops** and crops wait. ⚠️ *Open, see §9.*
- **The clock** sits in a top corner. It's a ring of dark stone with gold engraving. A sun and a moon ride on an arm that turns around it, through a sky disc that shifts from dawn gold to midnight blue. The day number and time are under it. I'll mock it up for the owner to approve before it goes in.

### 6.6 Players

- On first visit, the browser makes a **secret player key** and keeps it. The server stores each player's data in each world under that key: nickname, character, position, bag, coins, tools.
- If browser data is cleared, the player starts fresh in that world. (Accounts come with Steam or mobile.)

### 6.7 Gameplay

**Controls.** WASD or arrow keys to move, **E** or **Space** to use the held item on the tile in front of you, **1–9** for the toolbar, **Tab** for the bag, **Esc** for menus. A mouse click also uses the item on a nearby tile.

**Facing and walking.** Up uses the back pose, down the front pose, and left and right use the side pose (flipped for left). Walking alternates the base pose and the walk frame, with a little bounce.

**Farming.**
- Hoe a grass tile in your farm area to till it. Plant a seed, then water it with the can.
- A crop grows one stage each morning if it was watered the day before. It's ready after its number of days, and you harvest it by hand.
- Starting crops: turnip (3 days), carrot (4), potato (5), strawberry (6, keeps fruiting). Flowers: tulip and sunflower, which sell well, and you can also leave them as decoration.
- Watered soil dries overnight.

**Fishing.**
- Face water with a rod and hold **Use** to choose how far to cast. Wait for a bite.
- When a fish bites, a ring closes in around the bobber. Press **Use** while it's inside the gold band. Bigger fish need two or three hits in a row, each with a narrower band.
- Fish depend on the place (pond or river), the time (day or night) and the rod. Rods: **bamboo rod** (starter, free), **cedar rod**, **jade rod**. Bait makes bites come sooner.

**Hunting.**
- Woods animals: **pheasant** (flies off), **wild boar** (charges, then gets tired), **deer** (shy, runs off) and the **night owl** (only at night).
- Weapons: **slingshot** (cheap, 2 hits for a pheasant), **bow** (needs arrows), and a **snare** you put down and come back to later.
- Aim with the mouse and fire with a click or **Use**. A hit makes the animal flash. When it's caught it vanishes in a puff of smoke and leaves a drop: feathers, hide, antler, or a "game parcel" (meat, shown wrapped as a parcel). You can sell drops or use them for quests.
- Animals come back each morning, up to a set number per zone. If a charging boar runs into you, you're knocked back and drop nothing. There's no health bar.

**Stone coins and the shop.**
- The coin is a round grey-green stone with a square hole. We call it a **Stone**, written "◎ 25".
- The shop is a market stall near the farm, open 08:00–18:00. It sells seeds, rods, bait, the slingshot, bow, arrows and snares, and buys crops, fish and drops.
- Prices live in `shared/` so we can balance them in one place.

**Quests and land.**
- A quest board stands by the house. Each quest has a goal and a reward of coins and/or **unlocking a zone**.
- Starting zones: Farm, Market path. Unlockable: Pond (quest: harvest 5 turnips), East field (catch 3 fish), Woods (earn 200 Stones), River (catch a night fish), Deep woods (bring 3 hides).
- A locked zone sits behind a fence with a sign showing its quest. Unlocking plays a short animation and the fence disappears for everyone.

**Expanding the world.** Each zone is its own map, drawn in Tiled (a free map editor), plus one entry in `shared/zones.ts` with its name, quest, edges, fish table and animal table. Adding land means adding a map and an entry.

### 6.8 Later: mobile and Steam

- Phaser runs inside Electron or Tauri for Steam, and inside Capacitor for phones. The server stays the same.
- Input goes through one "controls" layer, so touch controls can be added without touching the gameplay code.

### 6.9 Emotes

The pose sheets already have jump, sit and sleep. Keys **Z**, **X** and **C** play them, and everyone sees them.

### 6.10 Running it

- `cd game && npm install && npm run dev` starts the server and the client together. You play at `http://localhost:5173`.
- Friends on the same Wi-Fi can join through your computer's local address. Friends elsewhere need it hosted, which is a later step. (A tunnel such as `cloudflared` is a stop-gap.)

## 7. Build order

Each step is a playable checkpoint.

1. **Walk together.** Server, worlds and codes, the four characters, the Farm and Market path zones, the day–night cycle and clock, saving, emotes.
2. **Farm and earn.** Tools, crops, watering, growth, selling, Stones, the shop.
3. **Fish and unlock.** Rods, the fishing game, the pond and river, the quest board, unlocking zones.
4. **Hunt.** The woods, animals and their behaviour, slingshot, bow and snare, drops.
5. **Polish.** Sound and music, a title screen, balancing, a hosting guide.

## 8. Left to the builder

- Exact prices, growth times, fish and animal tables, within the shapes above.
- Tile size (16 px art drawn at 3× is the default) and the camera.
- How the art script slices and cleans the sheets (extend `prototype/scripts/make_sprites.py`, copied into `game/art/`).
- How the server stores world state (a JSON snapshot per world is fine to start).

## 9. Open questions for the owner

See the conversation. The answers will be written in here.
