# RumiNation: items and recipes catalogue

*First pass, 23 Nov 2026. Goes with [the design](2026-11-23-ruminate-design.md). Quantities, growth times and drop rates are starting points to balance from. The names and the list are what the owner reviews.*

- **117 crafting items** in 10 groups.
- **25 craftables:** 6 hunting weapons, 4 fishing items, 4 tools and 11 appliances.
- In the game this lives in `game/shared/` as data (`items.ts`, `recipes.ts`). A test checks that every item can be got from somewhere and that every recipe only uses items that exist.

**Where things are made**

| Station | How you get it | What it does |
|---|---|---|
| **Forge** | In the blacksmith's shed from the start | Melts ore into bars; makes metal parts, weapons and tools |
| **Workbench** | In the blacksmith's shed from the start | Wooden parts; cleans fish into scales, bones and oil; builds appliances |
| **Kiln** | Craft it (#15) | Charcoal, brick, glass |
| **Tanning rack** | Craft it (#16) | Hides into leather |
| **Loom** | Craft it (#17) | Cloth, linen, rope, bowstring, silk, dyes, fishing line |
| **Gem polisher** | Craft it (#24) | Raw gems into cut gems |

## 1. Crafting items (117)

### 1.1 Crops: 14

All crops can go into the **preserves jar** (they sell for more) or the **seed maker** (you get seeds back).

| # | Item | Days to grow | Notes |
|---|---|---|---|
| 1 | Turnip | 3 | Starter |
| 2 | Carrot | 4 | |
| 3 | Potato | 5 | |
| 4 | Strawberry | 6, then fruits every 3 | |
| 5 | Tulip | 4 | Red dye |
| 6 | Sunflower | 7 | Yellow dye, lamp oil |
| 7 | Cotton | 5 | Cloth |
| 8 | Flax | 5 | Linen, rope |
| 9 | Pumpkin | 9 | High value |
| 10 | Chilli | 6 | Red dye |
| 11 | Indigo | 7 | Indigo dye |
| 12 | Lotus | 8 | Grows in water tiles; lotus silk |
| 13 | Ginseng | 10 | Very high value |
| 14 | **Rafflesia** | 14 | The final crop. Highest value. Seeds come from the last quest, then the seed maker |

### 1.2 Fish: 16

Any fish can be cleaned at the workbench for parts (§1.4), or smoked in the fish smoker.

| # | Fish | Where | When | Rod needed |
|---|---|---|---|---|
| 15 | Minnow | Pond | Day | Bamboo |
| 16 | Carp | Pond | Any time | Bamboo |
| 17 | Perch | Pond | Day | Bamboo |
| 18 | Catfish | Pond | Night | Bamboo |
| 19 | Koi | Pond | Day | Cedar |
| 20 | Golden koi | Pond | Day, rare | Jade |
| 21 | Moonfish | Pond | Night | Jade |
| 22 | Trout | River | Day | Bamboo |
| 23 | Salmon | River | Any time | Cedar |
| 24 | Pike | River | Day | Cedar |
| 25 | Eel | River | Night | Cedar |
| 26 | River crab | River | Any time | Crab pot (or rare on a rod) |
| 27 | Ghost shrimp | River | Night | Crab pot |
| 28 | Jade perch | River | Day | Jade |
| 29 | Sturgeon | River | Any time, rare | **Diamond** |
| 30 | Dragon carp | River | Night, legendary | Jade (very rare) or **Diamond** (rare) |

### 1.3 Fishing finds: 4

| # | Item | Where it comes from | Used for |
|---|---|---|---|
| 31 | Driftwood | Any water | Handle (instead of timber) |
| 32 | Old boot | Any water | Tanning rack → leather |
| 33 | Pondweed | Pond | Lotus silk |
| 34 | River pearl | River, rare | Pearl lure |

### 1.4 Fish parts: 7 (cleaning fish at the workbench)

| # | Item | From | Used for |
|---|---|---|---|
| 35 | Fish scale | Any fish | Fish glue |
| 36 | Fish bone | Any fish | Fish glue |
| 37 | Fish oil | Oily fish (carp, catfish, salmon, eel, sturgeon) | Leather, lacquer, lamp oil |
| 38 | Eel skin | Eel | Jade rod grip |
| 39 | Crab shell | River crab | Crab pot |
| 40 | Sturgeon roe | Sturgeon | Sells for a lot |
| 41 | Dragon scale | Dragon carp | Diamond rod |

### 1.5 Hunting drops: 12

| # | Item | From | Used for |
|---|---|---|---|
| 42 | Feather | Pheasant | Longbow fletching; Quarry quest |
| 43 | Tail plume | Pheasant | Longbow |
| 44 | Golden feather | Golden pheasant (rare) | Pearl lure |
| 45 | Boar hide | Wild boar | Leather |
| 46 | Boar tusk | Wild boar | Reinforced slingshot |
| 47 | Deer hide | Deer | Fine leather |
| 48 | Antler | Deer | Gem polisher |
| 49 | White antler | White stag (rare, deep woods) | Golden spear |
| 50 | Owl feather | Night owl | Golden spear tassel |
| 51 | Owl talon | Night owl | Crossbow trigger |
| 52 | Sinew | Boar, deer | Bowstring |
| 53 | Game parcel | Boar, deer, pheasant | Fish smoker (smoked parcel), sells |

### 1.6 Mining: 19

| # | Item | Where | Pickaxe needed |
|---|---|---|---|
| 54 | Stone | Quarry | Copper |
| 55 | Flint | Quarry | Copper |
| 56 | Clay | Quarry | Copper |
| 57 | Sand | Quarry | Copper |
| 58 | Coal | Quarry, mine | Copper |
| 59 | Copper ore | Quarry | Copper |
| 60 | Tin ore | Quarry | Copper |
| 61 | Iron ore | Old mine floor 1+ | Iron |
| 62 | Silver ore | Old mine floor 1+ | Iron |
| 63 | Quartz | Old mine floor 1+ | Iron |
| 64 | Jade | Old mine floor 1+ | Iron |
| 65 | Sulphur | Old mine floor 2+ | Steel |
| 66 | Gold ore | Old mine floor 2+ | Steel |
| 67 | Amethyst | Old mine floor 2+ | Steel |
| 68 | Ruby | Old mine floor 3 | Steel |
| 69 | Sapphire | Old mine floor 3 | Steel |
| 70 | Emerald | Old mine floor 3 | Steel |
| 71 | Diamond | Old mine floor 3, rare | Steel |
| 72 | Obsidian | Old mine floor 3 | Steel |

### 1.7 Shop basics: 4

| # | Item | Used for |
|---|---|---|
| 73 | Timber | Handles, charcoal, appliances |
| 74 | Bamboo pole | Rod blank, longbow |
| 75 | Resin | Lacquer, tanning rack |
| 76 | Twine | Rope, bowstring, loom |

### 1.8 Refined materials: 22

| # | Item | Station | Recipe |
|---|---|---|---|
| 77 | Copper bar | Forge | 3 copper ore + 1 coal |
| 78 | Bronze bar | Forge | 2 copper ore + 1 tin ore + 1 coal |
| 79 | Iron bar | Forge | 3 iron ore + 1 coal |
| 80 | Steel bar | Forge | 1 iron bar + 2 charcoal |
| 81 | Silver bar | Forge | 3 silver ore + 1 coal |
| 82 | Gold bar | Forge | 3 gold ore + 1 coal + 1 sulphur |
| 83 | Charcoal | Kiln | 2 timber |
| 84 | Brick | Kiln | 2 clay + 1 stone |
| 85 | Glass | Kiln | 3 sand + 1 coal |
| 86 | Leather | Tanning rack | 1 boar hide + 1 fish oil, *or* 2 old boots |
| 87 | Fine leather | Tanning rack | 1 deer hide + 2 fish oil |
| 88 | Cloth | Loom | 3 cotton |
| 89 | Linen | Loom | 3 flax |
| 90 | Rope | Loom | 2 flax + 1 twine |
| 91 | Bowstring | Loom | 2 sinew + 1 twine |
| 92 | Lotus silk | Loom | 3 lotus + 1 pondweed |
| 93 | Indigo dye | Loom | 2 indigo |
| 94 | Red dye | Loom | 2 chilli + 1 tulip |
| 95 | Yellow dye | Loom | 2 sunflower |
| 96 | Fish glue | Workbench | 2 fish bone + 1 fish scale |
| 97 | Lacquer | Workbench | 1 resin + 1 fish oil |
| 98 | Lamp oil | Workbench | 1 fish oil + 1 sunflower |

### 1.9 Cut gems: 7 (gem polisher, each is 1 raw gem + 1 sand)

| # | Item | Used for |
|---|---|---|
| 99 | Cut quartz | Steel pickaxe |
| 100 | Cut jade | Jade rod |
| 101 | Cut amethyst | Lantern post |
| 102 | Cut ruby | Golden spear |
| 103 | Cut sapphire | Quality sprinkler |
| 104 | Cut emerald | Silver watering can |
| 105 | Cut diamond | Diamond rod |

### 1.10 Parts: 12

| # | Item | Station | Recipe |
|---|---|---|---|
| 106 | Handle | Workbench | 1 timber *or* 1 driftwood |
| 107 | Rod blank | Workbench | 2 bamboo poles + 1 lacquer |
| 108 | Iron nails (×10) | Forge | 1 iron bar |
| 109 | Hinge | Forge | 1 iron bar |
| 110 | Gear | Forge | 1 bronze bar |
| 111 | Chain | Forge | 2 iron bars |
| 112 | Blade blank | Forge | 2 steel bars |
| 113 | Spearhead | Forge | 1 blade blank + 1 obsidian |
| 114 | Hook (×5) | Forge | 1 iron bar |
| 115 | Reel | Forge | 1 bronze bar + 1 gear |
| 116 | Gem setting | Forge | 1 silver bar |
| 117 | Fishing line | Loom | 1 linen + 1 fish glue |

## 2. Craftables (25)

### 2.1 Hunting weapons: 6

The shop sells the basic slingshot, bow, arrows and snare. These are better ones, topped by the golden spear.

| # | Craftable | Station | Recipe | What it does |
|---|---|---|---|---|
| 1 | Reinforced slingshot | Forge | 2 iron bars, 1 handle, 1 bowstring, 1 leather, 1 boar tusk | Pheasants in 1 hit |
| 2 | Hunter's longbow | Workbench | 2 bamboo poles, 2 bowstrings, 1 lacquer, 1 leather, 3 feathers, 1 tail plume | Longer range, faster arrows |
| 3 | Crossbow | Forge | 2 steel bars, 1 gear, 1 handle, 2 bowstrings, 1 fish glue, 1 owl talon | Boars in 1 hit; slow to reload |
| 4 | Steel snare | Forge | 2 steel bars, 1 chain, 1 rope | Holds boars and deer (the basic snare only holds pheasants) |
| 5 | Throwing net | Loom | 3 rope, 2 linen, 4 flint | Catches pheasants and owls without a chase |
| 6 | **Golden spear** | Forge | 3 gold bars, 1 spearhead, 1 handle, 1 gem setting, 1 cut ruby, 1 fine leather, 1 white antler, 2 owl feathers, 1 red dye | The top weapon. Thrown; catches anything in 1 hit, including the white stag. Comes back to your hand |

### 2.2 Fishing: 4

| # | Craftable | Station | Recipe | What it does |
|---|---|---|---|---|
| 7 | Jade rod | Workbench | 1 rod blank, 2 cut jade, 1 reel, 1 fishing line, 1 hook, 1 eel skin | Golden koi, moonfish, jade perch |
| 8 | **Diamond rod** | Forge | 1 rod blank, 1 cut diamond, 1 gem setting, 2 silver bars, 1 reel, 1 lotus silk, 1 dragon scale, 1 indigo dye | The top rod. Sturgeon and dragon carp; the timing band is wider |
| 9 | Crab pot | Workbench | 3 timber, 1 rope, 2 iron nails, 1 crab shell | Place it in the river; it has a crab or shrimp each morning |
| 10 | Pearl lure | Workbench | 1 river pearl, 1 hook, 1 golden feather | Rare fish bite more often |

### 2.3 Tools: 4

The shop sells the copper pickaxe, a basic hoe and a basic watering can.

| # | Craftable | Station | Recipe | What it does |
|---|---|---|---|---|
| 11 | Iron pickaxe | Forge | 3 iron bars, 1 handle | Breaks iron, silver, quartz, jade rocks |
| 12 | Steel pickaxe | Forge | 3 steel bars, 1 handle, 1 cut quartz | Breaks gold, gem, diamond, obsidian rocks |
| 13 | Steel hoe | Forge | 2 steel bars, 1 handle | Tills 3 tiles in a row |
| 14 | Silver watering can | Forge | 3 silver bars, 1 hinge, 1 cut emerald | Waters 3 tiles in a row |

### 2.4 Appliances: 11

Placed in the world, and shared by everyone in it.

| # | Craftable | Station | Recipe | What it does |
|---|---|---|---|---|
| 15 | Kiln | Workbench | 20 stone, 10 clay, 1 iron bar | Makes charcoal, brick, glass |
| 16 | Tanning rack | Workbench | 4 timber, 2 rope, 1 resin | Makes leather, fine leather |
| 17 | Loom | Workbench | 6 timber, 2 iron nails, 1 gear, 1 twine | Makes cloth, linen, rope, bowstring, silk, dyes, fishing line |
| 18 | Fish smoker | Workbench | 10 brick, 2 iron bars, 1 chain | Fish or game parcel → smoked (sells for twice as much) |
| 19 | Sprinkler | Forge | 1 copper bar, 1 bronze bar, 1 glass | Waters the 4 tiles next to it each morning |
| 20 | Quality sprinkler | Forge | 1 gold bar, 1 steel bar, 1 glass, 1 cut sapphire | Waters the 8 tiles around it each morning |
| 21 | Seed maker | Workbench | 5 timber, 1 gear, 1 bronze bar, 1 cloth, 1 sunflower | 1 crop → 1–3 of its seeds. The only way to get more Rafflesia seeds |
| 22 | Preserves jar | Workbench | 2 glass, 1 timber, 1 lacquer | Crop → jam or pickles (sells for twice as much) |
| 23 | Lantern post | Forge | 1 iron bar, 2 glass, 1 lamp oil, 1 cut amethyst, 1 yellow dye | Lights the area at night |
| 24 | Gem polisher | Workbench | 4 timber, 1 gear, 1 bronze bar, 1 antler | Raw gem + sand → cut gem |
| 25 | Storage chest | Workbench | 8 timber, 1 hinge, 2 iron nails, 1 cloth | 24 slots, shared by everyone |

## 3. Notes for balancing

- **The road to the top.** The golden spear needs the deep woods (white stag), floor 3 of the old mine (ruby, obsidian), night hunting (owl), the loom and the tanning rack. The diamond rod needs floor 3 (diamond) and a dragon scale. The dragon carp can be caught on a jade rod, very rarely, so the first diamond rod is possible. The diamond rod then makes it much more likely.
- Sell prices go up with how far along the chain an item is: raw < refined < parts < craftables. Smoked and preserved goods sell for twice the price of the raw item.
- Both top items should take a group of friends about 15–25 in-game days.
