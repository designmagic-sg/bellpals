# RumiNation Step 1 "Walk together" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Up to 8 friends create or join a world by code, pick Ding, Chime, Jingle or Gong, and walk around the Farm and the Market path together. The world has a day–night cycle, a clock, sleeping, emotes, and saves when everyone leaves.

**Architecture:** An npm-workspaces monorepo in `game/` with three packages:
- `shared/`: pure TypeScript rules (codes, time, maps, movement), unit-tested.
- `server/`: a Colyseus 0.18 server. Each world is one room, keyed by its code, and saved to SQLite through `node:sqlite`. The game logic sits in a plain `WorldSim` class that mutates the room's schema state, so it can be tested without sockets.
- `client/`: a Phaser 4 game built with Vite. A DOM lobby sits in front of it, and a DOM/SVG HUD (the clock) sits on top.

**Tech Stack:** Node 22, TypeScript 7.0.2, Phaser 4.2.1, colyseus 0.18.12, @colyseus/sdk 0.18.10, @colyseus/schema 5.0.50 (the `schema()`/`t.*` builder, no decorators), Vite 8.3.8, Vitest 5.1.1, tsx 4.23.15, concurrently 10.0.7, Python 3 + Pillow + numpy for the art scripts, Playwright (pre-installed) for the end-to-end check.

**Spec:** `docs/superpowers/specs/2026-11-23-ruminate-design.md` (catalogue: `docs/superpowers/specs/2026-11-23-ruminate-catalogue.md`, not used in this step)

## Global Constraints

- All game code lives in `game/`. `prototype/` is not touched.
- Up to **8 players** per world. Two players may be the same character.
- **1 real second = 1 in-game minute.** Day starts 06:00. Dusk 18:00–20:00, night 20:00–05:00, dawn 05:00–06:00. Anyone awake at 02:00 faints and the day ends.
- The clock stops while a world is empty, and the time it emptied is stored as `emptySince` for step 2's catch-up.
- **The server is the referee.** Clients send intentions. Positions are predicted on the client, checked on the server, and snapped back when impossible.
- World code: a 4-letter word, a dash and 4 digits from `2–9`, e.g. `MOON-4821`.
- The player key is secret: it's never put in the synced state.
- Art is pixel art drawn at 3× with nearest-neighbour scaling. Tiles are 16 px. Characters keep their sheet look; their side pose faces right and is flipped for left.
- Hunting/gore rules and other content rules from the spec don't apply in this step.
- Prose in docs uses British spelling. Code identifiers use American spelling (`color`).

## Review Focus

1. **Codes typed loosely**, like `moon 4821`, ` Moon-4821 ` or `MOON4821`, should still join the right world. Pinned in Task 1 (`normalizeCode`).
2. **The same player in two tabs**, or a quick rejoin, should replace the old character, not leave a ghost. Pinned in Task 5 (`join replaces an existing session with the same key`).
3. **A player who vanishes without leaving** (closed laptop, lost Wi-Fi) should drop out of the room, and the world should save once it's empty. Pinned in Task 6 (integration: `world saves and pauses when the last player disconnects`).
4. **A 9th player** should get a clear "This world is full (8/8)" message, not a hang. Pinned in Task 6 (integration: `ninth join is refused with WORLD_FULL`).
5. **Bad or hostile move messages** (NaN, missing fields, unknown zone, teleports, walking through walls) should be rejected and the player snapped back, without crashing the room. Pinned in Task 5 (`rejectMove` cases). A backgrounded tab sending one huge time step should not let anyone tunnel through walls either: pinned in Task 3 (`stepPlayer clamps dt`).

---

## File structure

```
game/
  package.json                 workspaces: shared, server, client; scripts dev/test/typecheck/build
  tsconfig.base.json
  README.md                    how to run, how friends join
  art/
    source/{ding,chime,gong,jingle}.webp   the owner's 4 pose sheets
    make_sprites.py            sheets → client/public/sprites/<species>-<pose>.png
    make_tiles.py              draws tiles.png + object PNGs into client/public/tiles/
  shared/src/
    codes.ts        world codes, nicknames
    time.ts         clock maths and light level
    maps/types.ts   ZoneMap, ZoneObject, Exit types
    maps/farm.ts    the Farm, as a text map
    maps/market.ts  the Market path
    maps/index.ts   ZONES registry, isSolid(), findExit()
    movement.ts     stepPlayer(), facingFor(), moveIsPlausible()
    world.ts        WorldSave / PlayerSave types, newWorldSave()
    index.ts        re-exports
  server/src/
    store.ts        SQLite world store
    schema.ts       Colyseus state: WorldState, PlayerState
    sim.ts          WorldSim: join/leave/move/emote/sleep/kick/tick, toSave()
    room.ts         WorldRoom: thin Colyseus glue around WorldSim
    http.ts         POST /api/worlds, GET /api/worlds/:code
    main.ts         defineServer + listen on 2567, serves client/dist if built
  server/test/      store, sim, integration tests
  client/
    index.html, vite.config.ts
    clock-preview.html   standalone clock and Rumi coin preview for the owner
    src/main.ts          boot: lobby → game
    src/net.ts           server URL, HTTP calls, joining a room, player key
    src/lobby/lobby.ts   create/join form, character picker
    src/game/WorldScene.ts   map, players, input, prediction, camera
    src/game/players.ts      sprite + name tag + walk/emote animation per player
    src/game/night.ts        night overlay and lit windows
    src/hud/clock.ts         the clock as SVG
    src/hud/toast.ts         short messages ("Everyone's asleep…", errors)
  e2e/two-players.mjs  Playwright: two browsers meet in one world
```

---

### Task 1: Workspace and world codes

**Files:**
- Create: `game/package.json`, `game/tsconfig.base.json`, `game/.gitignore` (`node_modules`, `dist`, `data/`), `game/shared/package.json` (name `@ruminate/shared`, `"main": "src/index.ts"`, `"type": "module"`), `game/shared/tsconfig.json`, `game/shared/src/codes.ts`, `game/shared/src/index.ts`
- Test: `game/shared/test/codes.test.ts`

**Interfaces:**
- Produces:
  - `CODE_WORDS: readonly string[]`: at least 40 friendly 4-letter uppercase words (MOON, LEAF, BELL, FERN, PEAR, PLUM, JADE, …).
  - `generateCode(random: () => number = Math.random): string`
  - `normalizeCode(input: string): string | null`: accepts any case, spaces, dash or no dash; returns `WORD-1234` or null.
  - `cleanNickname(input: string): string | null`: trims, collapses spaces, max 16 chars, strips control characters; null if empty.
  - Root scripts: `npm test` (vitest in shared and server), `npm run typecheck`, `npm run dev` (Task 7), `npm run build` (Task 7).

- [ ] **Step 1: Scaffold.** Write the root `package.json` with `"workspaces": ["shared","server","client"]` and devDependencies `typescript@7.0.2`, `vitest@5.1.1`, `tsx@4.23.15`, `concurrently@10.0.7`. Write `tsconfig.base.json` (strict, `module: "nodenext"` for shared and server, `noEmit`). Run `cd game && npm install`. Expected: exits 0.
- [ ] **Step 2: Write failing tests** in `codes.test.ts`:
  - `generateCode` matches `/^[A-Z]{4}-[2-9]{4}$/` for 1,000 seeded runs, and every word part is in `CODE_WORDS`.
  - `normalizeCode`: `'moon 4821'`, `' Moon-4821 '`, `'MOON4821'`, `'moon–4821'` (en dash) all give `'MOON-4821'`. `'MOO-4821'`, `'MOON-1821'` (1 isn't allowed), `'MOON-48211'` and `''` all give `null`.
  - `cleanNickname`: `'  Aris  '` gives `'Aris'`; `'a'.repeat(30)` gives 16 chars; `'\u0000\u0007'` gives `null`; `'Big   Bear'` gives `'Big Bear'`.
- [ ] **Step 3: Run** `npm test -w shared`. Expected: FAIL, the module isn't found.
- [ ] **Step 4: Implement** `codes.ts`.
- [ ] **Step 5: Run** `npm test -w shared`. Expected: PASS.
- [ ] **Step 6: Commit** `game: scaffold workspace and world codes`.

### Task 2: Game clock

**Files:**
- Create: `game/shared/src/time.ts`
- Test: `game/shared/test/time.test.ts`

**Interfaces:**
- Produces:
  - `interface Clock { day: number; minute: number }`. `minute` counts from midnight of `day` and runs past 1440 up to the faint time, so 01:00 that night is 1500.
  - Constants: `MS_PER_GAME_MINUTE = 1000`, `DAY_START = 360`, `FAINT_AT = 1560`, `DUSK_START = 1080`, `NIGHT_START = 1200`.
  - `advanceClock(clock: Clock, elapsedMs: number): { clock: Clock; fainted: boolean }`: stops at `FAINT_AT` and reports `fainted: true`. It never rolls over by itself.
  - `startNextDay(clock: Clock): Clock` gives `{ day: day + 1, minute: DAY_START }`.
  - `formatClock(clock: Clock): string` gives `"Day 3 · 18:05"`. Minutes past 1440 show as next-morning hours (`1500` gives `01:00`).
  - `lightLevel(minute: number): number`, from 0 (full day) to 1 (full night). It's 0 from `DAY_START` to `DUSK_START`, linear from `DUSK_START` to `NIGHT_START` (0 to 1), and holds 1 until `FAINT_AT`. There's no dawn phase, because every day ends by 02:00 and restarts at 06:00. The morning is shown as a 2 s fade on the client instead (Task 9).
  - `sunAngle(minute: number): number`, in radians: the angle for the sun/moon arm on the clock, a full turn per 24 h, with noon at the top.

- [ ] **Step 1: Write failing tests:**
  - `advanceClock({day:1,minute:360}, 60_000)` gives minute 420, `fainted` false.
  - `advanceClock({day:1,minute:1550}, 30_000)` gives minute 1560, `fainted` true.
  - `startNextDay({day:4,minute:1560})` gives `{day:5,minute:360}`.
  - `formatClock({day:3,minute:1085})` gives `'Day 3 · 18:05'`; `formatClock({day:3,minute:1500})` gives `'Day 3 · 01:00'`.
  - `lightLevel`: 0 at 720, 0.5 at 1140, 1 at 1200 and at 1500.
  - `sunAngle(720)` is 0 (straight up), `sunAngle(1440)` is π.
- [ ] **Step 2: Run** `npm test -w shared`. Expected: FAIL.
- [ ] **Step 3: Implement** `time.ts`.
- [ ] **Step 4: Run** `npm test -w shared`. Expected: PASS.
- [ ] **Step 5: Commit** `game: add the game clock`.

### Task 3: Zone maps and movement

Maps are text grids in TypeScript rather than Tiled files. The server needs the same collision data, and text maps can be read in a code review. The spec is updated to match (Task 10).

**Files:**
- Create: `game/shared/src/maps/types.ts`, `maps/farm.ts`, `maps/market.ts`, `maps/index.ts`, `game/shared/src/movement.ts`
- Test: `game/shared/test/maps.test.ts`, `game/shared/test/movement.test.ts`

**Interfaces:**
- Produces:
  - `TILE = 16`.
  - `type ZoneId = 'farm' | 'market'`.
  - `interface ZoneObject { kind: 'house' | 'shed' | 'stall' | 'board' | 'sign' | 'lamp' | 'tree' | 'rock'; x: number; y: number }`, in tile coordinates of the top-left corner.
  - `OBJECT_FOOTPRINT: Record<ZoneObject['kind'], { w: number; h: number; solidRows: number }>`. Only the bottom `solidRows` rows block movement, so you can walk behind a roof. Sizes: house 6×5 (3 solid rows), shed 4×4 (2), stall 4×3 (1), board 2×2 (1), sign 1×1 (1), lamp 1×2 (1), tree 2×3 (1), rock 1×1 (1).
  - `interface Exit { x: number; y: number; w: number; h: number; to: ZoneId; spawn: { x: number; y: number } }`, tiles in, spawn in tiles.
  - `interface ZoneMap { id: ZoneId; name: string; rows: string[]; objects: ZoneObject[]; exits: Exit[]; spawn: { x: number; y: number }; houseDoor?: { x: number; y: number } }`.
  - Tile characters: `.` grass, `,` flower grass, `=` path, `:` farm plot (grass with a lighter edge; tilled in step 2), `~` water (solid), `#` fence (solid), `b` bush (solid), `_` wooden bridge.
  - `ZONES: Record<ZoneId, ZoneMap>`
  - `isSolid(zone: ZoneMap, px: number, py: number): boolean`, in world pixels. Anything outside the map is solid.
  - `findExit(zone: ZoneMap, px: number, py: number): Exit | null`
  - `interface Input { dx: -1|0|1; dy: -1|0|1 }`
  - `type Facing = 'down' | 'up' | 'left' | 'right'`
  - `interface Pos { x: number; y: number }`, the player's feet in world pixels.
  - Constants: `WALK_SPEED = 64` (px/s), `MAX_STEP_MS = 100`, `HITBOX = { w: 10, h: 6 }` (centred on the feet).
  - `stepPlayer(pos: Pos, input: Input, dtMs: number, zone: ZoneMap): Pos`. It normalises diagonals, clamps `dtMs` to `MAX_STEP_MS`, and resolves the x and y axes separately so you slide along walls.
  - `facingFor(input: Input, previous: Facing): Facing`
  - `moveIsPlausible(from: Pos, to: Pos, elapsedMs: number, zone: ZoneMap): boolean`. It's true if the distance ≤ `WALK_SPEED * max(elapsedMs, 50)/1000 * 1.5 + 2`, and `to`'s hitbox isn't solid.
- Map content:
  - **Farm** (40×30): house at the top middle, with the door at its bottom centre (`houseDoor`) and the shed to its right. A 16×10 `:` farm plot is in front of the house. A quest board and sign are by the path. A path leads east to the exit at the right edge, which goes to `market`. A pond is drawn at the bottom-left behind a `#` fence (locked until step 3, so it's solid). Trees line the edges.
  - **Market path** (30×20): a path from the west exit (back to `farm`) to a market stall, with lamps, bushes and a fenced-off track north labelled by a sign (the Woods, locked).

- [ ] **Step 1: Write failing map tests:**
  - Every row in each zone has the same length.
  - Each zone's `spawn`, each exit's `spawn` (in the target zone) and the farm's `houseDoor` (the tile below it) are not solid.
  - Each zone can reach each of its exits from `spawn`. Use a BFS over non-solid tiles.
  - `findExit` on the farm's east edge returns `to: 'market'`.
  - `isSolid` is true at `(-1, 5)` and inside the house's bottom rows, and false in the house's top (roof) rows.
- [ ] **Step 2: Write failing movement tests:**
  - Walking right on open grass for 1,000 ms (ten 100 ms steps) moves 64 px.
  - A diagonal for 1,000 ms moves about 45.25 px on each axis.
  - `stepPlayer clamps dt`: a single 5,000 ms step moves at most 6.4 px.
  - Walking into a fence stops at it, and walking diagonally into a fence slides along it.
  - `moveIsPlausible`: a 4 px move in 66 ms is true; a 200 px move in 66 ms is false; a move into water is false; `NaN` coordinates are false.
  - `facingFor({dx:0,dy:0},'left')` gives `'left'`; `facingFor({dx:1,dy:1},'up')` gives `'right'` (horizontal wins).
- [ ] **Step 3: Run** `npm test -w shared`. Expected: FAIL.
- [ ] **Step 4: Implement** the types, both maps, the registry and `movement.ts`.
- [ ] **Step 5: Run** `npm test -w shared`. Expected: PASS.
- [ ] **Step 6: Commit** `game: add the farm and market maps and movement rules`.

### Task 4: Art: character sprites and tiles

**Files:**
- Create: `game/art/source/ding.webp` (= `prototype/art/source/ding-sheet.webp`, the bear), `chime.webp` (the fox sheet), `gong.webp` (the green sheet), `jingle.webp` (the bunny sheet). Copy these from the owner's uploads.
- Create: `game/art/make_sprites.py`, `game/art/make_tiles.py`, `game/art/README.md` (how to rerun)
- Output: `game/client/public/sprites/{species}-{pose}.png` (4 × 8 = 32 files), `game/client/public/tiles/tiles.png` (a 16 px tileset strip), `game/client/public/tiles/{house,shed,stall,board,sign,lamp,tree,rock}.png`

**Interfaces:**
- Produces:
  - Poses `front, threeq, side, back, walk, jump, sit, sleep` (sheet order: row 1 left→right, then row 2).
  - Each sprite is downscaled so **one art pixel = one image pixel**. The source has roughly 11 px art pixels; detect them per sheet or use the existing per-character factors as a starting point. Sprites are bottom-aligned on a shared canvas per species, so poses don't jump.
  - `tiles.png` frame order = `TILE_FRAMES` in `client/src/game/tiles.ts` (Task 8): `grass, grass2, flowers, path, plot, water1, water2, fence, bush, bridge`.
- [ ] **Step 1:** Write `make_sprites.py`, reusing the cut-out, palette and clean-up code from `prototype/scripts/make_sprites.py`. Split each sheet into a 4×2 grid, drop the floating "zz" from the sleep pose, and write the 32 PNGs. Run: `python3 game/art/make_sprites.py`. Expected: "wrote 32 sprites".
- [ ] **Step 2:** Make a contact sheet (`game/art/out/contact.png`, every sprite at 4×) and look at it. Expected: all 32 poses are recognisable, outlines are unbroken, and there are no stray pixels or "zz".
- [ ] **Step 3:** Write `make_tiles.py`. It draws the tiles and objects in the characters' palette: a dark plum outline `#3B2230`, the soft greens from Gong, the warm creams from Ding, the corals from Chime and the lilacs from Jingle. Give the house a pitched roof and a lit-window variant (`house-lit.png`) for night. Run it, make a contact sheet and look at it. Expected: a cosy, readable set that sits well with the characters.
- [ ] **Step 4: Commit** `game: add character sprites and world tiles`.

### Task 5: Server state and simulation

**Files:**
- Create: `game/server/package.json` (deps `colyseus@0.18.12`, `@colyseus/schema@5.0.50`, `@ruminate/shared`), `game/server/tsconfig.json`, `game/shared/src/world.ts`, `game/server/src/schema.ts`, `game/server/src/sim.ts`, `game/server/src/store.ts`
- Test: `game/server/test/sim.test.ts`, `game/server/test/store.test.ts`

**Interfaces:**
- Consumes: `Clock`, `advanceClock`, `startNextDay` (Task 2); `ZONES`, `moveIsPlausible`, `findExit`, `Facing`, `Pos` (Task 3); `cleanNickname`, `generateCode` (Task 1).
- Produces:
  - `shared/src/world.ts`:
    - `type Species = 'ding' | 'chime' | 'jingle' | 'gong'`
    - `interface PlayerSave { nickname: string; species: Species; zone: ZoneId; x: number; y: number; facing: Facing }`
    - `interface WorldSave { code: string; name: string; ownerKey: string; clock: Clock; players: Record<string, PlayerSave>; banned: string[]; emptySince: number | null }`
    - `newWorldSave(code: string, name: string, ownerKey: string): WorldSave`. Starts on day 1 at 06:00, with `emptySince: null`.
    - `MAX_PLAYERS = 8`, `type Emote = 'jump' | 'sit' | 'sleep'`
  - `schema.ts`:
    - `PlayerState`: `nickname`, `species`, `zone`, `x`, `y`, `facing`, `moving: boolean`, `emote: string` (`''` when none), `inBed: boolean`, `isOwner: boolean`.
    - `WorldState`: `name`, `code`, `day`, `minute`, `players: map<PlayerState>` keyed by sessionId.
  - `sim.ts`, `class WorldSim`:
    - `constructor(state: WorldState, save: WorldSave, now: () => number = Date.now)`
    - `join(sessionId: string, playerKey: string, nickname: string, species: Species): JoinResult`. `JoinResult` is `{ ok: true; replaced?: string } | { ok: false; error: 'BANNED' | 'BAD_NAME' | 'BAD_SPECIES' }`. A returning key gets its saved spot. A new key spawns at the farm `spawn`. The same key already online is removed first and its old sessionId returned as `replaced`, for the room to disconnect.
    - `leave(sessionId: string): void`. Writes the player's position into the save.
    - `move(sessionId: string, msg: unknown): MoveResult`. `MoveResult` is `{ ok: true } | { ok: false; snapTo: { zone: ZoneId; x: number; y: number } }`. It validates the shape (finite numbers, a known zone, a facing value), changes zone only via `findExit` at the old position (landing on the exit's `spawn`), and otherwise checks `moveIsPlausible` against the last accepted move time. Any movement clears `emote` and `inBed`.
    - `emote(sessionId: string, kind: unknown): void`. Ignores unknown kinds.
    - `goToBed(sessionId: string): boolean`. Only works within 1.5 tiles of `ZONES.farm.houseDoor`.
    - `kick(bySessionId: string, targetSessionId: string): string | null`. Owner only. Adds the target's key to `banned` and returns the key so the room can disconnect them.
    - `tick(elapsedMs: number): TickEvent | null`. `TickEvent` is `'new-day' | 'fainted'`. It advances the clock while at least one player is online. If every online player is in bed, it starts the next day. If the clock reaches `FAINT_AT`, everyone is moved to the house door and the next day starts. In both cases `inBed` is cleared.
    - `toSave(): WorldSave`. Includes current positions. `emptySince` is set to `now()` when no one's online, otherwise `null`.
    - `onlineCount(): number`
  - `store.ts`:
    - `openStore(path: string): WorldStore` (`':memory:'` for tests)
    - `WorldStore.createWorld(name: string, ownerKey: string): WorldSave`. Retries the code until it's unused.
    - `WorldStore.load(code: string): WorldSave | null`
    - `WorldStore.save(world: WorldSave): void`
    - `WorldStore.exists(code: string): boolean`
    - Table: `worlds(code TEXT PRIMARY KEY, name TEXT, data TEXT, updated_at INTEGER)`.
- [ ] **Step 1: Write failing store tests.** Create, then load, round-trips the data. Two hundred `createWorld` calls give unique codes. `load('NOPE-2222')` is null. Saving updates `updated_at`.
- [ ] **Step 2: Write failing sim tests:**
  - A new player spawns at the farm spawn; a returning key gets its saved position.
  - `join replaces an existing session with the same key`: the old sessionId is returned, and only one `PlayerState` exists.
  - A banned key gets `BANNED`; nickname `''` gets `BAD_NAME`; species `'cat'` gets `BAD_SPECIES`.
  - `rejectMove` cases: a payload of `{x: NaN}`, `{}`, `null`, `zone: 'moon'`, a teleport of 200 px, or a move into water. Each returns `ok: false` with the last good position, and the state is unchanged.
  - A legal 4 px move after 66 ms is accepted. Standing in the farm's east exit and sending `zone: 'market'` lands on the exit's `spawn`.
  - `tick(60_000)` with one player online moves `minute` from 360 to 420. With nobody online, `minute` doesn't change.
  - Both of two players `goToBed` → `tick` returns `'new-day'` with day 2 at 06:00. If only one is in bed, it doesn't.
  - `goToBed` far from the door returns false.
  - Ticking to 1560 returns `'fainted'`: everyone ends up at the door, on the next day.
  - `kick` by a non-owner returns null; by the owner, it bans the key.
  - `toSave()` with no one online has `emptySince` = the injected `now()`.
  - Emote `'dance'` is ignored; emote `'sit'` sets `emote`, and the next accepted move clears it.
- [ ] **Step 3: Run** `npm test -w server`. Expected: FAIL.
- [ ] **Step 4: Implement** `world.ts`, `schema.ts` (using `schema()` and `t.*`), `store.ts` (`DatabaseSync` from `node:sqlite`) and `sim.ts`.
- [ ] **Step 5: Run** `npm test -w server`. Expected: PASS.
- [ ] **Step 6: Commit** `game: add the world simulation and store`.

### Task 6: Server room, HTTP and running server

**Files:**
- Create: `game/server/src/room.ts`, `game/server/src/http.ts`, `game/server/src/main.ts`
- Test: `game/server/test/integration.test.ts` (adds `@colyseus/sdk@0.18.10` as a server devDependency)

**Interfaces:**
- Consumes: `WorldSim`, `WorldStore`, `WorldState` (Task 5); `normalizeCode`, `MAX_PLAYERS`.
- Produces:
  - `createGameServer(opts: { port: number; dbPath: string; clientDist?: string }): Promise<{ close(): Promise<void> }>`, exported from `main.ts`. When run directly it uses `PORT ?? 2567` and `DB_PATH ?? ./data/worlds.db`.
  - Room `'world'`, registered with `.filterBy(['code'])`, `maxClients = MAX_PLAYERS`. The client joins with `joinOrCreate('world', options)`.
    - Join options: `{ code: string; playerKey: string; nickname: string; species: Species }`.
    - `onCreate` sets `this.roomId = code` and loads the world (or throws `WORLD_NOT_FOUND`). **Watch out:** when a filtered room is full, `joinOrCreate` makes a *second* room with the same code. So `onCreate` first asks the matchmaker whether a `'world'` room with this code is already running, and throws `WORLD_FULL` if it is.
    - `onJoin` calls `sim.join` and throws its error code if it fails. When it replaces an old session, the old client is disconnected.
    - `onLeave` calls `sim.leave` and saves.
    - The simulation interval is 250 ms and calls `sim.tick`, broadcasting `'event'` with the `TickEvent`.
    - Saves every 30 s, and once more in `onDispose`.
  - Client → server messages: `'move'`, `'emote'`, `'bed'`, `'kick'`. On a rejected move, the server sends `'snap'` (`{zone, x, y}`) to that client only.
  - HTTP:
    - `POST /api/worlds` with `{name, playerKey}` gives `201 {code}`. It returns 400 if the name is empty after `cleanNickname` (also capped at 16 chars) or the `playerKey` isn't 32 hex characters.
    - `GET /api/worlds/:code` gives `200 {code, name, online}` or `404`. It normalises the code first.
    - CORS is allowed for any origin (it's a local game for now).
  - A full room is refused with a join error. The client maps it to "This world is full (8/8)", and the integration test asserts the error is a refusal, not a timeout.
- [ ] **Step 1: Write failing integration tests.** Start `createGameServer` on port 0 or a random free port, with `':memory:'`.
  - Create a world over HTTP. Two SDK clients join with its code. Client A sends a legal move, and client B's state shows A's new x within 500 ms.
  - Typing the code as `moon 4821`-style (lowercase, a space instead of the dash) still gets in: the client normalises it before joining, and `GET` also accepts it.
  - `ninth join is refused with WORLD_FULL`: eight clients join, and the ninth is rejected.
  - `world saves and pauses when the last player disconnects`: a client joins, the clock advances, and the client's socket closes without a leave message. The world is then saved with the same minute and a non-null `emptySince`. Rejoining resumes from that minute.
  - Joining an unknown code is rejected.
- [ ] **Step 2: Run** `npm test -w server`. Expected: FAIL.
- [ ] **Step 3: Implement** `room.ts`, `http.ts` (via `defineServer`'s `express` hook) and `main.ts` (it also serves `clientDist` as static files when it exists).
- [ ] **Step 4: Run** `npm test -w server`. Expected: PASS.
- [ ] **Step 5: Commit** `game: add the world room, HTTP endpoints and server`.

### Task 7: Client shell and lobby

**Files:**
- Create: `game/client/package.json` (deps `phaser@4.2.1`, `@colyseus/sdk@0.18.10`, `@ruminate/shared`; devDep `vite@8.3.8`), `game/client/tsconfig.json`, `game/client/vite.config.ts`, `game/client/index.html`, `game/client/src/main.ts`, `game/client/src/net.ts`, `game/client/src/lobby/lobby.ts`, `game/client/src/lobby/lobby.css`
- Modify: `game/package.json` scripts: `dev` = `concurrently` running the server (`tsx watch server/src/main.ts`) and the client (`vite client`); `build` = typecheck, then `vite build client`.

**Interfaces:**
- Consumes: `normalizeCode`, `cleanNickname`, `Species` (Tasks 1, 5); the HTTP and room API (Task 6).
- Produces:
  - `serverUrl(): string`. Uses `VITE_SERVER_URL` if set; otherwise, on Vite's dev port 5173, it's `${protocol}//${hostname}:2567`; otherwise the page's own origin.
  - `playerKey(): string`. 32 hex characters, kept in `localStorage['ruminate.playerKey']`, made with `crypto.getRandomValues`. Falls back to an in-memory key if storage throws.
  - `createWorld(name: string): Promise<string>` and `joinWorld(code: string, nickname: string, species: Species): Promise<Room>`. Errors are mapped to friendly text: `WORLD_NOT_FOUND` gives "No world with that code.", full gives "This world is full (8/8).", `BANNED` gives "You can't join this world."
  - `showLobby(root: HTMLElement): Promise<{ room: Room; species: Species }>`
- Lobby: the title "RumiNation" in a chunky pixel font (Google Fonts "Press Start 2P" for the title only, plus a readable body font), two tabs (**Create a world** and **Join with a code**), a nickname field, and a four-card character picker showing each `front` sprite gently bobbing, with its name. The last nickname, character and code are remembered in `localStorage`. After creating a world, the code is shown big, with a "Copy code" button, before entering.
- [ ] **Step 1:** Implement `net.ts`, `lobby.ts`, `main.ts` (lobby first, then start Phaser with `WorldScene` (Task 8) and pass in `{room, species}`), and the root scripts.
- [ ] **Step 2: Verify** with `npm run typecheck` (expected: no errors), then `npm run dev`. With Playwright, open `http://localhost:5173`, create a world called "Test", and screenshot the lobby and the code screen. Expected: the code is shown in the `WORD-1234` format, and the picker shows all four characters.
- [ ] **Step 3: Commit** `game: add the client shell and lobby`.

### Task 8: The world scene: map, players, movement, emotes, bed

**Files:**
- Create: `game/client/src/game/WorldScene.ts`, `game/client/src/game/players.ts`, `game/client/src/game/tiles.ts`, `game/client/src/hud/toast.ts`

**Interfaces:**
- Consumes: `ZONES`, `stepPlayer`, `facingFor`, `findExit`, `TILE` (Task 3); the room messages (Task 6); the sprites and tiles (Task 4).
- Produces:
  - `TILE_FRAMES: Record<string, number>`, matching `tiles.png`.
  - `class PlayerView`: `constructor(scene, state: PlayerState, isMe: boolean)`, `update(state, dtMs)`, `destroy()`. It owns the sprite, the name tag (Phaser text, white with a dark outline; your own name is gold) and the animation.
  - `WorldScene` (`key: 'world'`) gets `{room, species}` through `init`.
- Behaviour:
  - Renders the current zone's tiles and objects at 3× with `pixelArt: true` (`roundPixels`). Objects are depth-sorted by their foot y.
  - **Own player:** reads WASD or the arrow keys every frame, runs `stepPlayer` locally, and sends `'move'` every 66 ms while the position or facing changed, plus once on stopping. When the feet enter an exit, it sends the move with `zone` set to the exit's target, then rebuilds the scene for the new zone at the exit's `spawn`. On `'snap'`, it jumps to the given spot (and zone).
  - **Other players:** only those in the same zone are shown. They're drawn 100 ms behind, interpolating between their last two states.
  - **Poses:** down alternates `front` and `walk` every 180 ms while moving. Up uses `back` and left/right use `side` (flipped for left), each with a 1-px bob while moving. Standing still shows the facing pose. The `emote` field shows `jump` (with a little hop tween), `sit` or `sleep`.
  - **Emotes:** Z = jump, X = sit, C = sleep, each sending `'emote'`.
  - **Bed:** near the house door, a prompt "E · Go to bed" appears. Pressing E sends `'bed'` and hides your sprite (others see you vanish into the house), and a toast says "Sleeping… the day ends when everyone's in bed". Moving gets you up again.
  - `'event'`: `'new-day'` shows the toast "Good morning! Day N". `'fainted'` shows "You fainted from tiredness… Day N".
  - The camera follows your own player, bounded to the map, at a 3× zoom.
  - **World code in the HUD:** under the clock, show the world name and code with a "Copy" button, so anyone can invite friends.
  - **Players list:** P opens a small panel listing everyone online (nickname, character icon, "(owner)"). The owner sees a "Remove" button next to each other player, which sends `'kick'` after a confirm. The removed player gets the lobby back with "You can't join this world."
- [ ] **Step 1:** Implement `tiles.ts`, `players.ts`, `toast.ts` and `WorldScene.ts`.
- [ ] **Step 2: Verify:** `npm run typecheck` gives no errors. Then `npm run dev`. With Playwright and two pages, create a world in page A and join with its code in page B. Hold D in page A for 1 s, and screenshot both pages. Expected: B sees A's character walk right with a name tag; both see the Farm; nobody passes through fences or the house.
- [ ] **Step 3: Verify zones and emotes.** Walk A into the east exit, and screenshot. Expected: A is on the Market path, and B no longer sees A. Press X in B. Expected: in a second page C, B is shown in the sit pose. In page A (the owner), press P, remove C, and check C is back at the lobby with the message.
- [ ] **Step 4: Commit** `game: add the world scene with movement, zones, emotes and bed`.

### Task 9: Night and the clock (owner approval gate)

**Files:**
- Create: `game/client/src/hud/clock.ts`, `game/client/src/hud/coin.ts`, `game/client/clock-preview.html`, `game/client/src/game/night.ts`
- Modify: `game/client/src/game/WorldScene.ts` (add the night overlay and HUD)

**Interfaces:**
- Consumes: `lightLevel`, `sunAngle`, `formatClock`, `Clock` (Task 2).
- Produces:
  - `mountClock(parent: HTMLElement): { set(clock: Clock): void; destroy(): void }`. An inline SVG of about 132 px, fixed top-right:
    - a ring of dark carved stone with gold engraving: 24 tick marks, longer at 6/12/18/24
    - a sky disc inside it, from dawn gold (`#F3C77A`) through day blue (`#9CC9E8`) and dusk coral (`#E58A6E`) to night indigo (`#1E2148`)
    - an arm turning by `sunAngle`, with a gold sun at one end and a pale moon at the other
    - the text from `formatClock` below the ring
  - `coinSvg(size: number): string`, the Rumi: a round grey-green stone (`#8FA597`), darker rim, a square hole, four carved strokes around the hole, and a soft highlight. Used from step 2; previewed now.
  - `mountNight(scene: Phaser.Scene): { set(minute: number): void; morning(): void }`. A full-screen tint over the world, alpha = `lightLevel × 0.55`, colour `#1B1F4A`. `morning()` fades the tint from 0.55 to 0 over 2 s, and is called on `'new-day'` and `'fainted'`. At night the house uses `house-lit.png` and lamps get a soft additive glow.
- [ ] **Step 1:** Implement `clock.ts` and `coin.ts`. Build `clock-preview.html`, showing the clock at 06:00, 12:00, 18:30, 21:00 and 01:30, plus the coin at 24 and 64 px, on light and dark backgrounds.
- [ ] **Step 2: Owner approval.** Screenshot the preview at deviceScaleFactor 2, send it to the owner, and ask for changes. **Don't continue until they approve the look.** Make the changes they ask for and send it again.
- [ ] **Step 3:** Implement `night.ts`, and wire the clock and night into `WorldScene` from the room state's `day` and `minute`.
- [ ] **Step 4: Verify:** `npm run typecheck`. Then, with the server started with `TIME_SCALE=60` (a dev-only env var read in `room.ts` that multiplies `elapsedMs`; it defaults to 1), play to 21:00 and screenshot. Expected: the world is tinted, the house windows glow, and the clock shows the moon on top. Then both players go to bed. Expected: the "Good morning! Day 2" toast and daylight.
- [ ] **Step 5: Commit** `game: add day and night with the clock`.

### Task 10: End-to-end check, readme and spec touch-ups

**Files:**
- Create: `game/e2e/two-players.mjs`, `game/README.md`
- Modify: `docs/superpowers/specs/2026-11-23-ruminate-design.md`. Change "Phaser 3" to "Phaser 4". Change "drawn in Tiled (a free map editor)" to "written as a text map in `shared/src/maps/`, so the server uses the same walls". Update the file list in §6.2 to match.

**Interfaces:**
- Consumes: everything above.
- [ ] **Step 1:** Write `two-players.mjs`. It starts `npm run dev`, waits for ports 2567 and 5173, opens two Chromium pages, creates a world in A, joins it in B with the code typed in lowercase with a space, walks A for 1 s, and asserts B's scene has two `PlayerView`s. (`window.__ruminate.players()` is exposed only when `import.meta.env.DEV`.) It then saves screenshots to `game/e2e/out/`, stops the servers, and exits 0.
- [ ] **Step 2: Run** `node game/e2e/two-players.mjs`. Expected: "two players met in MOON-…" and exit 0.
- [ ] **Step 3: Run the whole suite:** `cd game && npm test && npm run typecheck && npm run build`. Expected: all pass, and `client/dist/` exists.
- [ ] **Step 4:** Write `game/README.md`: what RumiNation is; `npm install` and `npm run dev`; how a friend on the same Wi-Fi joins (`http://<your-computer's-local-IP>:5173`); controls; where saves live (`game/server/data/worlds.db`); and that online hosting is a later step.
- [ ] **Step 5: Commit** `game: add the end-to-end check, readme and spec updates`, then push.
