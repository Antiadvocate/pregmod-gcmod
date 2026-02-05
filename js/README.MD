# JavaScript Source Files (`js/`)

<!-- cSpell:disable -->

## Overview

The `js/` directory contains **JavaScript source files** that are loaded **before** the main game code in `src/`. These files are processed separately from `src/` and embedded as modules in the final HTML. They provide foundational libraries, static data, and systems that don't require SugarCube's eval context.

## Key Difference: `js/` vs `src/`

| Aspect | `js/` | `src/` |
|--------|-------|--------|
| **Load Time** | Before SugarCube | After SugarCube |
| **Context** | Outside SugarCube eval | Inside SugarCube eval |
| **Access to V/State** | ❌ No | ✅ Yes |
| **Debugging** | ✅ Easier | ❌ Harder (eval) |
| **Minification** | ✅ Standard | ⚠️ Complex |
| **Purpose** | Libraries, static data | Game logic, UI |
| **Compilation** | Concatenated to `bin/fc.js` | Embedded in story |

**Why this matters:**
- `js/` code runs in normal JavaScript context (easier debugging)
- `src/` code runs in SugarCube's eval (has access to game state)
- Moving code from `src/` to `js/` improves performance and debuggability
- But `js/` code cannot directly access `V.*` or `State.*`

## Directory Structure

```
js/
├── 001-lib/              # Third-party libraries (load first)
├── 002-config/           # Early initialization
├── 003-data/             # Static game data
├── 004-base/             # Base classes and frameworks
├── extensions/           # JavaScript prototype extensions
├── medicine/             # Medical system data and logic
├── rulesAssistant/       # Rules Assistant system
├── ui/                   # UI utilities
├── artInfrastructure.js  # Art system foundation
├── countries.js          # Country/nationality data
├── diff.js               # Object difference tracking
├── dynamicJSLoading.js   # Dynamic script loading
├── random.js             # Random number generation
├── ratings.js            # Slave rating calculations
└── utils.js              # General utilities
```

## Load Order

Files are loaded in **alphabetical order** within each directory. Numbered prefixes (`001-`, `002-`, etc.) control load sequence:

```
1. js/001-lib/          (Third-party libraries)
2. js/002-config/       (Configuration)
3. js/003-data/         (Static data)
4. js/004-base/         (Base classes)
5. js/* (alphabetical)  (Everything else)
```

## Core Directories

### **`001-lib/`** - Third-Party Libraries

External JavaScript libraries loaded before any game code.

**Libraries:**
- **`crc-32-1.2.min.js`** - CRC32 checksum calculation
- **`d3.min.js`** - D3.js data visualization library
- **`idb.js`** - IndexedDB wrapper for storage
- **`jszip.min.js`** - ZIP file creation/extraction
- **`lodash-4.17.15.min.js`** - Utility library
- **`marked.min.js`** - Markdown parser
- **`popper.min.js`** - Tooltip positioning engine
- **`sha1.min.js`** - SHA1 hashing
- **`tippy-bundle.umd.min.js`** - Tooltip library

**Why here:**
- Must load before any code that uses them
- Minified for performance
- Rarely change (stable versions)

### **`002-config/`** - Early Configuration

**`fc-js-init.js`** - Initializes global namespaces and early setup.

**Creates:**
- `App.*` namespace structure
- `App.Data.*` for static data
- `App.UI.*` for UI functions
- `App.Art.*` for art systems
- Early configuration flags

**Why here:**
- Must exist before other `js/` files use them
- Sets up global structure
- Configures environment

### **`003-data/`** - Static Game Data

Large data files that don't change during gameplay.

**Key Files:**

**World Data:**
- `arcologyData.js` - Arcology configurations
- `arcologyNames.js` - Arcology name lists
- `countries.js` - Country/nationality data
- `dictionary.js` - Word lists for generation
- `weatherData.js` - Weather system data

**Character Data:**
- `slaveBody.js` - Body part configurations
- `slaveGeneData.js` - Genetic trait data
- `slaveMods.js` - Modification data
- `slaveProstheticsData.js` - Prosthetic options
- `slaveSorting.js` - Sorting configurations
- `slaveSummaryData.js` - Summary display data
- `slaveTradePresets.js` - Market presets
- `startingGirlsData.js` - Starting slave templates

**Game Systems:**
- `assistantData.js` - Personal assistant configurations
- `careers.js` - Career backgrounds
- `futureSocietyData.js` - Future Society definitions
- `policiesData.js` - Policy options
- `poses.js` - Character pose data

**Clothes:**
- `clothes/001-slaveWearData.js` - Clothing base data
- `clothes/aSlaveGown.js` - Specific clothing items

**Medicine:**
- `medicine/implants.js` - Implant definitions

**Drugs:**
- `drugs/002-moddedDrugsData.js` - Drug system data

**Other:**
- `constants.js` - Game constants
- `gameVariableData.js` - Variable templates
- `miscData.js` - Miscellaneous data
- `miscDataNames.js` - Name generation data
- `playerData.js` - Player character templates
- `svgFilters.js` - SVG filter definitions

**Why in `js/` not `src/`:**
- Static data doesn't need SugarCube context
- Easier to maintain and validate
- Better performance (no eval overhead)
- Can be used by both `js/` and `src/` code

**How Static Data Is Used:**

```javascript
// js/003-data/careers.js (STATIC REFERENCE DATA)
App.Data.Careers = {
    Leader: {
        HG: ["a captain", "a director", "a politician"],
        bodyguard: ["a soldier", "a boxer", "an assassin"]
    }
    // This never changes during gameplay
};
```

```javascript
// src/npc/generate/randomSlave.js (DYNAMIC USAGE)
const career = randomChoice(App.Data.Careers.General.young);
slave.career = career; // Picks from static list, stores in game state
```

**Data Flow:**
```
Static Data (js/003-data/)  →  Dynamic Code (src/)  →  Game State (V.*)
─────────────────────────      ──────────────────      ─────────────────
App.Data.Careers            →  Pick random career  →  slave.career = "a nurse"
App.Data.Countries          →  Generate nation     →  slave.nationality = "Japanese"
App.Data.Clothes            →  Select outfit       →  slave.clothes = "a kimono"
   (never changes)                (logic/selection)       (saved with game)
```

**Key Distinction:**
- **`js/003-data/`** = What options exist? (reference tables)
- **`src/data/`** = How to save/load? (save management)
- **`V.*`** = What was selected? (game state)

### **`004-base/`** - Base Classes

Foundation classes extended by other systems.

**Files:**
- `SurgeryEffect.js` - Base class for surgery effects
- `SurgeryProcedure.js` - Base class for surgery procedures

**Pattern:**
```javascript
class SurgeryProcedure {
    constructor(options) {
        this.name = options.name;
        this.cost = options.cost;
        this.effects = [];
    }
    
    apply(slave) {
        // Apply surgery effects
    }
}
```

**Why here:**
- Must load before surgery definitions
- Provides inheritance structure
- Used by `medicine/` subdirectory

### **`medicine/`** - Medical System

Comprehensive medical/surgery system with 100+ surgery definitions.

**Structure:**
```
medicine/
├── surgery/
│   ├── addGenitals/      (Add reproductive organs)
│   ├── assets/           (Breasts, butt implants)
│   ├── belly/            (Belly modifications)
│   ├── chemosensory/     (Smell, taste)
│   ├── ears/             (Hearing, ear mods)
│   ├── exotic/           (Race changes, treatments)
│   ├── extreme/          (Fuckdoll, mindbreak)
│   ├── eye/              (Vision, eye mods)
│   ├── face/             (Face, lips, age)
│   ├── genitals/         (Genital surgeries)
│   ├── hair/             (Hair removal/restoration)
│   ├── horns/            (Horn modifications)
│   ├── liposuction/      (Fat removal, waist)
│   ├── nipples/          (Nipple, lactation)
│   ├── prosthetics/      (Prosthetic limbs)
│   ├── structural/       (Height, bones)
│   ├── teeth/            (Dental work)
│   └── voice/            (Voice modifications)
├── utility.js            (Medical utilities)
└── z001-organFarm/       (Organ storage system)
```

**Each Surgery File:**
```javascript
// Example: medicine/surgery/assets/boobs.js
const boobImplants = new SurgeryProcedure({
    name: "Breast Implants",
    cost: 5000,
    effects: [
        new SurgeryEffect({
            property: "boobs",
            change: 400,
            description: "Increases breast size"
        })
    ]
});
```

**Why in `js/`:**
- Static surgery definitions
- No need for SugarCube context
- Easier to maintain and test
- Better organization than `src/`

### **`rulesAssistant/`** - Rules Assistant System

Automated slave management system.

**Files:**
- `01-stack.js` - Rule stack management
- `conditionEditorSimple.js` - Simple condition editor UI
- `conditionEditorTree.js` - Advanced tree-based editor
- `conditionEvaluation.js` - Condition evaluation engine
- `z1-conditionEditorController.js` - Editor controller (loads last)

**System:**
```
Rule Structure:
  Conditions (if slave matches)
    └─> Actions (do this)

Example:
  IF devotion > 50 AND trust > 50
    THEN assignment = "whoring"
```

**Why in `js/`:**
- Complex logic benefits from normal JS context
- Easier debugging
- Better performance
- Condition evaluation doesn't need `V.*` directly

### **`extensions/`** - JavaScript Prototype Extensions

Extends built-in JavaScript types with useful methods.

**Files:**
- `map.extension.js` - Extends `Map` prototype
- `number.extension.js` - Extends `Number` prototype
- `set.extension.js` - Extends `Set` prototype

**Example:**
```javascript
// number.extension.js
Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

// Usage:
const value = 150;
const clamped = value.clamp(0, 100); // 100
```

**Why here:**
- Must load early (before use)
- Affects global JavaScript environment
- Used throughout codebase

### **`ui/`** - UI Utilities

**`select.js`** - Custom select/dropdown utilities

**Features:**
- Enhanced select elements
- Custom styling hooks
- Event handling

**Why in `js/`:**
- Pure UI utility
- No game state dependency
- Reusable across systems

## Root-Level Files

### **`artInfrastructure.js`** - Art System Foundation

Sets up art system infrastructure before `src/art/` loads.

**Provides:**
- `App.Art.*` namespace
- Art caching structures
- Layer management
- Asset loading utilities

**Why here:**
- Must exist before `src/art/` uses it
- Foundation for art systems
- No SugarCube dependency

### **`countries.js`** - Country/Nationality Data

Detailed country and nationality information.

**Data:**
- Country names and codes
- Nationality descriptors
- Regional groupings
- Cultural attributes

**Used by:**
- Slave generation
- Description systems
- Market systems

### **`diff.js`** - Object Difference Tracking

Tracks changes between object states.

**Features:**
- Deep object comparison
- Change detection
- Diff generation
- Used for save file analysis

**Functions:**
```javascript
diff(oldObj, newObj) // Returns differences
applyDiff(obj, diff) // Applies changes
```

### **`dynamicJSLoading.js`** - Dynamic Script Loading

Loads JavaScript files on-demand.

**Use Cases:**
- Heavy systems (WebGL, AI generation)
- Optional features
- Lazy loading for performance

**API:**
```javascript
App.Loader.loadScript("path/to/script.js")
    .then(() => {
        // Script loaded
    });
```

### **`random.js`** - Random Number Generation

Seeded random number generation for reproducibility.

**Features:**
- Seedable RNG
- Consistent results
- Distribution functions
- Used for slave generation

**Why separate:**
- Needs to be deterministic
- Used across many systems
- No SugarCube dependency

### **`ratings.js`** - Slave Rating Calculations

Calculates slave value and ratings.

**Calculations:**
- Beauty rating
- Skill rating
- Overall value
- Market price

**Functions:**
```javascript
calculateBeauty(slave) // Beauty score
calculateValue(slave)  // Market value
slaveCost(slave)       // Purchase price
```

### **`utils.js`** - General Utilities

Miscellaneous utility functions.

**Utilities:**
- String manipulation
- Array helpers
- Object utilities
- Math functions
- Validation helpers

**Examples:**
```javascript
clamp(value, min, max)
capitalize(string)
deepClone(object)
randomChoice(array)
```

## Development Guidelines

### **When to Put Code in `js/` vs `src/`**

**Use `js/` for:**
- ✅ Static data (doesn't change during gameplay)
- ✅ Pure functions (no game state dependency)
- ✅ Libraries and utilities
- ✅ Base classes and frameworks
- ✅ Code that benefits from easier debugging

**Use `src/` for:**
- ✅ Game logic (needs `V.*` or `State.*`)
- ✅ UI generation (needs SugarCube passages)
- ✅ Event handlers (SugarCube events)
- ✅ Dynamic content (changes during gameplay)
- ✅ Code that modifies game state

### **Adding New Data Files**

1. **Create file in appropriate `js/` subdirectory:**
```javascript
// js/003-data/myNewData.js
App.Data.MyNewData = {
    items: [
        {id: 1, name: "Item 1"},
        {id: 2, name: "Item 2"}
    ],
    
    getById(id) {
        return this.items.find(item => item.id === id);
    }
};
```

2. **Use in `src/` code:**
```javascript
// src/mySystem/myFile.js
const item = App.Data.MyNewData.getById(1);
```

### **Adding New Utilities**

1. **Add to `js/utils.js` or create new file:**
```javascript
// js/myUtility.js
App.Utils.myUtility = function(param) {
    // Utility logic
    return result;
};
```

2. **Use anywhere:**
```javascript
const result = App.Utils.myUtility(value);
```

### **Extending Medicine System**

1. **Create surgery file in appropriate subdirectory:**
```javascript
// js/medicine/surgery/face/myNewSurgery.js
const myNewSurgery = new SurgeryProcedure({
    name: "My New Surgery",
    cost: 10000,
    description: "Does something cool",
    effects: [
        new SurgeryEffect({
            property: "face",
            change: 10,
            description: "Improves face"
        })
    ]
});

// Register surgery
App.Medicine.Surgeries.push(myNewSurgery);
```

## Compilation Process

### **How `js/` Files Are Compiled**

```
Simple Mode:
  js/**/*.js ──> [concatFiles.sh] ──> bin/fc.js
  (Concatenated alphabetically, embedded in HTML)

Advanced Mode:
  js/**/*.js
    ├──> [gulp-sort] (alphabetical)
    ├──> [gulp-sourcemaps] (if enabled)
    ├──> [gulp-strip-comments]
    ├──> [gulp-terser] (if --minify)
    ├──> [gulp-concat]
    └──> build/module/module-script.js
         └──> [TweeGo] ──> bin/FC_pregmod.html
```

### **Load Order in Final HTML**

```html
<script>
  // 1. SugarCube engine
  // 2. js/ modules (from bin/fc.js or build/module/)
  // 3. src/ code (embedded in story)
</script>
```

## Performance Considerations

**Benefits of `js/` over `src/`:**
- ✅ **Faster execution** - No eval overhead
- ✅ **Better debugging** - Source maps work better
- ✅ **Easier minification** - Standard minifiers work
- ✅ **Better caching** - Can be cached separately
- ✅ **Cleaner stack traces** - Not wrapped in eval

**Trade-offs:**
- ❌ **No `V.*` access** - Can't directly read/modify game state
- ❌ **No SugarCube macros** - Pure JavaScript only
- ❌ **Load order matters** - Must be careful with dependencies

## Troubleshooting

**"Cannot read property of undefined":**
- Check load order (numbered prefixes)
- Ensure dependencies load first
- Verify namespace exists (`App.Data.*`)

**"V is not defined":**
- `V` only exists in `src/` code
- Move code to `src/` or pass data as parameters

**"Function not found":**
- Check if file is in `js/` directory
- Verify compilation included the file
- Check browser console for load errors

## Related Documentation

- `DEVELOPER_GUIDE.md` - Overall project structure and comprehensive developer documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `src/README.MD` - Main game source code
- `devTools/README.md` - Build tools and compilation

<!-- cSpell:enable -->