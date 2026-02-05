# Game Source Code (`src/`)

## Overview

The `src/` directory contains the **main game source code** for FC-Pregmod. All game logic, UI generation, systems, and content are here. Code in `src/` runs inside SugarCube's eval context, giving it access to game state (`V.*`) and SugarCube features.

## Key Characteristics

**`src/` vs `js/`:**
- ✅ **Has access to `V.*` and `State.*`** - Can read/modify game state
- ✅ **Can use SugarCube features** - Passages, macros, events
- ✅ **Dynamic content** - Changes during gameplay
- ⚠️ **Harder debugging** - Runs in eval context
- ⚠️ **Complex minification** - Requires special handling

**What belongs in `src/`:**
- Game logic and mechanics
- UI generation and display
- Event handlers
- Passage content
- Systems that modify game state
- Dynamic content generation

**How `src/` Uses Other Systems:**

```js
// src/ code accesses static data from js/
const career = randomChoice(App.Data.Careers.General.young); // js/003-data/

// src/ code uses TypeScript types for IDE hints
/**
 * @param {FC.SlaveState} slave - Type from devTools/types/FC/
 */
App.UI.slaveDescription = function(slave) {
    // Uses classes defined in src/js/states/
    const newSlave = new App.Entity.SlaveState();
    
    // Modifies game state (only src/ can do this)
    V.slaves.push(newSlave);
};
```

**Three-Way Relationship:**
1. **`devTools/types/FC/`** - Describes structure (for IDE)
2. **`js/`** - Provides static data and classes (loads first)
3. **`src/`** - Implements game logic (uses both, modifies `V.*`)

## Directory Structure

```
src/
├── 001-lib/              # Libraries (jQuery, Mousetrap, Pako)
├── 002-config/           # SugarCube configuration
├── 004-base/             # Base classes and frameworks
├── 005-passages/         # Passage registration
├── arcologyBuilding/     # Arcology construction system
├── art/                  # Art systems (Vector, WebGL, AI)
├── budget/               # Financial management
├── cheats/               # Cheat menu and debug tools
├── Corporation/          # Corporate divisions system
├── data/                 # Save/load and data management
├── debugging/            # Debug tools and profiling
├── descriptions/         # Slave description generators
├── endWeek/              # End-of-week processing
├── events/               # 500+ narrative events
├── facilities/           # Facility systems (Brothel, Dairy, etc.)
├── futureSocieties/      # Future Society mechanics
├── gui/                  # UI components (sidebar, options, etc.)
├── init/                 # Game initialization
├── interaction/          # Player-slave interactions
├── js/                   # Core game utilities
├── markets/              # Slave markets and trading
├── Mods/                 # Built-in mods (Catmod, SecExp, etc.)
├── neighbor/             # Neighbor arcology diplomacy
├── npc/                  # NPC/slave systems
├── personalAssistant/    # Personal assistant system
├── player/               # Player character systems
├── pregmod/              # Pregnancy and breeding systems
└── zz1-last/             # Final initialization (loads last)
```

## Load Order

Files load in **specific order** to manage dependencies:

```
1. src/001-lib/           (Libraries first)
2. src/002-config/        (Configuration)
3. src/004-base/          (Base classes)
4. src/005-passages/      (Passage registration)
5. src/* (alphabetical)   (All other directories)
6. src/zz1-last/          (Final initialization)
```

**Numbered Prefixes:**
- `001-`, `002-`, etc. control load order
- Lower numbers load first
- `zz1-` prefix loads last
- Within directories: alphabetical order

**Why This Matters:**
- Base classes must load before they're extended
- Passages must be registered before use
- Final initialization needs everything else loaded
- Breaking load order breaks the game

## Major Systems

### **`001-lib/`** - Core Libraries

Third-party libraries required by the game.

**Files:**
- `jquery.min.js` - jQuery library
- `mousetrap.min.js` - Keyboard shortcuts
- `pako.min.js` - Compression library

**Why in `src/` not `js/`:**
- Need to be in SugarCube eval context
- Used by other `src/` code
- Historical reasons (could be moved to `js/`)

### **`002-config/`** - SugarCube Configuration

Configures SugarCube engine and early setup.

**Files:**
- `fc-version.js` - Version information
- `fc-version.js.commitHash.js` - Git commit hash (generated)
- `serialization.js` - Save/load serialization setup
- `sugarcube-config.js` - SugarCube settings
- `versionTracking.js` - Version upgrade handling

**Key Configurations:**
- Save slot count
- History settings
- Macro configurations
- Debug settings

### **`004-base/`** - Base Classes

Foundation classes extended by game systems.

**Files:**
- `baseEvent.js` - Base class for events
- `baseFacility.js` - Base class for facilities
- `baseBuilding.js` - Base class for buildings
- `000-proxies.js` - Proxy object system
- Various utility base classes

<!-- cSpell:disable -->

**Pattern:**
```js
class BaseEvent {
    constructor() {
        this.name = "";
        this.weight = 10;
    }
    
    condition() {
        // Override in subclass
        return true;
    }
    
    content() {
        // Override in subclass
        return new DocumentFragment();
    }
}
```

### **`005-passages/`** - Passage Registration

Registers SugarCube passages for navigation.

**Files:**
- `arcologyPassages.js` - Arcology-related passages
- `eventPassages.js` - Event passages
- `facilityPassages.js` - Facility passages
- `guiPassages.js` - UI passages
- `interactionPassages.js` - Interaction passages
- `mainPassages.js` - Main game passages
- `marketPassages.js` - Market passages
- `playerPassages.js` - Player passages
- `pregmodPassages.js` - Pregnancy passages
- `slavePassages.js` - Slave passages
- `utilityPassages.js` - Utility passages

**Pattern:**
```js
// Register passage
Story.addPassage("PassageName", () => {
    const frag = new DocumentFragment();
    // Build UI
    return frag;
});
```

**Why Separate:**
- Centralizes passage registration
- Makes navigation clear
- Easier to find passages
- Prevents duplicate names

### **`npc/`** - NPC/Slave Systems

Everything related to NPCs and slaves.

**Structure:**
```
npc/
├── agent/               # Arcology agent system
├── bodyguard/           # Bodyguard system
├── children/            # Child NPCs
├── databases/           # Premade slave databases
├── descriptions/        # Description generators
├── generate/            # Slave generation
├── infants/             # Infant system
├── interaction/         # NPC interactions
└── [others]             # Various NPC systems
```

**Key Systems:**
- **`descriptions/`** - Modular description generation
  - `boobs/`, `belly/`, `legs/`, `face/`, etc.
  - Short and long descriptions
  - Context-aware (market, event, interaction)
- **`generate/`** - Slave generation from scratch
  - Random generation
  - Template-based generation
  - Market generation
- **`databases/`** - Premade slaves
  - Historical figures
  - Fictional characters
  - Template slaves

### **`facilities/`** - Facility Systems

All facility-related code (20+ facilities).

**Structure per Facility:**
```
facilities/facilityName/
├── facilityNameFramework.js  # Data definition
├── facilityName.js            # Main UI
├── facilityNameSelect.js      # Manager selection
├── facilityNameAssignment.js  # Job assignments
└── [others]                   # Facility-specific files
```

**Major Facilities:**
- `brothel/` - Prostitution facility
- `club/` - Entertainment club
- `dairy/` - Milk production
- `farmyard/` - Food/cum production
- `clinic/` - Medical facility
- `schoolroom/` - Training facility
- `nursery/` - Child care
- `incubator/` - Artificial wombs
- `arcade/` - Sex arcade
- `pit/` - Combat arena
- `masterSuite/` - Player quarters
- `headGirlSuite/` - Head Girl quarters
- `servantsQuarters/` - Servant housing
- `spa/` - Spa and relaxation
- `penthouse/` - Main penthouse

**Facility Pattern:**
1. Framework defines jobs and requirements
2. Main file provides UI and passage content
3. Select file handles manager selection
4. Assignment files handle slave assignments
5. End-week report in `src/endWeek/reports/`

### **`events/`** - Narrative Events

500+ events driving story progression.

**Structure:**
```
events/
├── RE/                  # Random Events
├── RESS/                # Random Event Slave-Specific
├── RETS/                # Random Event Time-Specific
├── PE/                  # Player Events
├── timeGated/           # Time-gated plot events
├── recruitment/         # Recruitment events
└── [others]             # Event utilities
```

**Event Types:**
- **RE** - Random events (any time)
- **RESS** - Slave-specific random events
- **RETS** - Time-specific random events
- **PE** - Player-initiated events
- **Time-Gated** - Unlock at specific weeks
- **Recruitment** - Acquire new slaves

**Event Pattern:**
```js
const myEvent = {
    name: "eventName",
    weight: 10,
    
    condition() {
        // Return true if event can trigger
        return V.week > 10 && V.slaves.length > 5;
    },
    
    content() {
        const frag = new DocumentFragment();
        // Build event UI
        return frag;
    }
};

App.Events.register(myEvent);
```

### **`endWeek/`** - End-of-Week Processing

Weekly calculations for all game systems.

**Structure:**
```
endWeek/
├── sa*.js               # Slave processing (40+ files)
├── reports/             # Facility reports
├── economics/           # Economic calculations
├── player/              # Player processing
├── events/              # Event processing
└── nextWeek/            # Next week preparation
```

**Processing Order:**
1. Preparation (`endWeek.js`)
2. Per-slave processing (`sa*.js` files)
3. Facility reports (`reports/`)
4. Economic updates (`economics/`)
5. Player updates (`player/`)
6. Event handling (`events/`)
7. Next week prep (`nextWeek/`)

**Key `sa*.js` Files:**
- `saRules.js` - Rules Assistant application
- `saClothes.js` - Clothing updates
- `saDiet.js` - Diet effects
- `saDrugs.js` - Drug effects
- `saHealth.js` - Health updates
- `saPregnancy.js` - Pregnancy progression
- `saRelationships.js` - Relationship updates
- `saTraining.js` - Training effects
- And 30+ more...

### **`interaction/`** - Player-Slave Interactions

Direct player interactions with slaves.

**Key Files:**
- `slaveInteract.js` - Main interaction screen
- `siWork.js` - Job assignment
- `siRules.js` - Individual rules
- `siCustomize.js` - Customization
- `siSurgery.js` - Surgery interface
- `useSlave/` - Sexual interactions
- `main/` - Main interaction options

**Interaction Flow:**
```
Main → Slave Interact → Specific Interaction
  ↓
Modify slave state
  ↓
Return to previous screen
```

### **`gui/`** - UI Components

User interface systems.

**Key Systems:**
- `sidebar/` - Left sidebar
- `options/` - Game options menu
- `encyclopedia/` - In-game encyclopedia
- `mainMenu/` - Main menu
- `tabs/` - Tab system
- `tooltips/` - Tooltip system
- `theming/` - Theme management

### **`art/`** - Art Systems

Character art rendering.

**Systems:**
- `vector/` - SVG vector art (2500+ files)
- `vector_revamp/` - Revamped vector art (700+ files)
- `webgl/` - WebGL 3D rendering
- `genAI/` - AI art generation (see `src/art/genAI/README.MD`)

**See Also:**
- `src/art/genAI/README.MD` - Detailed AI art documentation
- `artTools/README.md` - Art processing tools

### **`pregmod/`** - Pregnancy & Breeding

Core pregnancy and breeding mechanics.

**Files:**
- `surrogacy.js` - Surrogacy surgeries
- `eliteBreedingExam.js` - Elite breeding program
- `blackMarket.js` - Black market operations
- `editGenetics.js` - Genetic editing
- `FCTV/` - Free Cities TV system

**Key Features:**
- Natural pregnancy
- Surrogacy
- Artificial wombs
- Male pregnancy (optional)
- Elite breeding program
- Genetic manipulation

### **`player/`** - Player Character

Player character systems.

**Key Files:**
- `managePersonalAffairs.js` - Personal management
- `doctorConsultation.js` - Medical consultations
- `pcSalon.js` - Player appearance changes
- `MpregSelf.js` - Player pregnancy
- `desc/` - Player descriptions
- `pDildoAss.js`, `pDildoVagina.js` - Player interactions

### **`data/`** - Save/Load System

Save file management and backwards compatibility.

**Structure:**
```
data/
├── backwardsCompatibility/  # Old save updates
├── patches/                 # Version-specific patches
├── verification/            # Data validation
└── [utilities]              # Save/load utilities
```

**Key Functions:**
- Save file serialization
- Load file deserialization
- Backwards compatibility
- Data migration
- Verification and validation

### **`js/`** - Core Utilities

Core game utilities and functions.

**Key Files:**
- `utilsSlave.js` - Slave utility functions
- `utilsPlayer.js` - Player utility functions
- `utilsGeneral.js` - General utilities
- `pregJS.js` - Pregnancy utilities
- `wombJS.js` - Womb system
- `birth/` - Birth system
- `states/` - State object definitions (see below)
- `rulesAssistant.js` - Rules Assistant

**Common Functions:**
- `getSlave(id)` - Get slave by ID
- `getPronouns(slave)` - Get pronouns
- `canWalk(slave)` - Capability checks
- `WombNormalizePreg(actor)` - Pregnancy normalization

### **`js/states/`** - State Object Definitions

**Critical:** Defines the class structure for all game characters.

**State Class Hierarchy:**
```
GenePoolRecord (001-GenePoolRecord.js)
  └─> Genetic/physical properties only
      Properties: face, height, skin, genes, geneticQuirks
      Used for: Gene pool, family relationships
  
  ↓ extends
  
HumanState (002-HumanState.js)
  └─> Shared properties between PC and slaves
      Adds: clothes, rules, pregnancy, skills, diet
      Used by: Both PlayerState and SlaveState
  
  ↓ extends
  
  ├─> PlayerState (003-PlayerState.js)
  │   └─> Player character specific
  │       Adds: career skills, bad rumors, title
  │       Creates: V.PC
  │
  └─> SlaveState (003-SlaveState.js)
      └─> Slave specific
          Adds: devotion, trust, assignment, porn fame
          Creates: V.slaves[]
          
      ↓ extends
      
      ├─> TankSlaveState (004-TankSlaveState.js)
      │   └─> Artificial womb slaves
      │
      ├─> InfantState (004-InfantState.js)
      │   └─> Baby slaves in nursery
      │
      └─> ChildState (004-ChildState.js)
          └─> Child slaves (planned)
```

**Why This Organization:**
- **Inheritance hierarchy**: Each level adds properties
- **Code reuse**: Shared properties defined once
- **Type safety**: TypeScript mirrors this structure
- **Save compatibility**: Patches work on specific state types

**Relationship with TypeScript:**
```js
// src/js/states/003-SlaveState.js (IMPLEMENTATION)
App.Entity.SlaveState = class extends App.Entity.HumanState {
    constructor() {
        super();
        this.devotion = 0;  // Default value
        this.trust = 0;
        this.assignment = Job.REST;
    }
};
```

```typescript
// devTools/types/FC/human.d.ts (TYPE DEFINITION)
type SlaveState = InstanceType<typeof App.Entity.SlaveState>;
// TypeScript describes what JavaScript creates
```

**When to Modify:**
- Adding new slave property → Update `003-SlaveState.js` AND `devTools/types/FC/human.d.ts`
- Adding new player property → Update `003-PlayerState.js` AND type definition
- Changing property type → Update both JavaScript and TypeScript
- Requires backwards compatibility patch in `src/data/patches/`

### **`zz1-last/`** - Final Initialization

**Critical:** Loads **after** everything else.

**Files:**
- `init.js` - Final initialization calls
- `setupEventHandlers.js` - SugarCube event handlers

**What It Does:**
- Caches art data
- Initializes systems that need everything loaded
- Sets up event handlers
- Final configuration

**Why Last:**
- Needs all other systems loaded
- Registers global event handlers
- Performs final setup
- Can depend on everything

## Development Patterns

### **UI Generation Pattern**

```js
App.UI.myFunction = function(slave) {
    const frag = new DocumentFragment();
    const {he, his, He} = getPronouns(slave);
    
    // Create elements
    const div = document.createElement("div");
    div.className = "my-class";
    div.textContent = `${He} is ${slave.age} years old.`;
    
    // Append to fragment
    frag.appendChild(div);
    
    return frag;
};
```

**Why DocumentFragment:**
- Batches DOM changes
- Better performance
- Type-safe
- Can be appended directly

### **Event Pattern**

```js
const myEvent = {
    name: "eventName",
    weight: 10,
    
    condition() {
        // Check if event can trigger
        if (V.week < 10) return false;
        if (V.slaves.length < 5) return false;
        return true;
    },
    
    content() {
        const frag = new DocumentFragment();
        // Build event content
        return frag;
    }
};
```

### **Facility Framework Pattern**

```js
App.Data.Facilities.myFacility = {
    baseName: "facilityName",
    jobs: {
        jobName: {
            position: "job title",
            assignment: Job.CONSTANT,
            publicSexUse: true,
            fuckdollAccepted: false,
            commonControlledAspects: []
        }
    },
    manager: {
        position: "manager title",
        assignment: Job.MANAGER,
        requiredDevotion: 21,
        // ... manager requirements
    }
};
```

### **Description Pattern**

```js
App.Desc.myDescription = function(slave, options = {}) {
    const r = [];
    const {he, his, He} = getPronouns(slave);
    
    // Build description
    if (slave.age < 20) {
        r.push(`${He} is young.`);
    } else {
        r.push(`${He} is mature.`);
    }
    
    // Context-aware
    if (options.market) {
        r.push("Market-specific text.");
    }
    
    return r.join(" ");
};
```

### **Pronoun System**

```js
const {he, him, his, He, Him, His, himself, Himself, man, men, boy, girl} = getPronouns(slave);

// Usage:
`${He} walks to ${his} room. ${His} hair is ${slave.hColor}.`
// Result: "She walks to her room. Her hair is blonde."
// or:     "He walks to his room. His hair is blonde."
```

**Benefits:**
- Gender-neutral code
- Single description for all genders
- Reduces duplication
- Maintainable

## Common Tasks

### **Adding a New Event**

1. **Create event file in appropriate directory:**
```js
// src/events/RE/myNewEvent.js
const myNewEvent = {
    name: "myNewEvent",
    weight: 10,
    
    condition() {
        return V.week > 20 && V.slaves.length > 10;
    },
    
    content() {
        const frag = new DocumentFragment();
        // Build event UI
        return frag;
    }
};

App.Events.register(myNewEvent);
```

2. **Test in game:**
- Compile
- Load game
- Advance weeks
- Event should trigger when conditions met

### **Adding a New Facility**

1. **Create facility directory:**
```
src/facilities/myFacility/
├── myFacilityFramework.js
├── myFacility.js
├── myFacilitySelect.js
└── myFacilityAssignment.js
```

2. **Define framework:**
```js
// myFacilityFramework.js
App.Data.Facilities.myFacility = {
    baseName: "myFacility",
    jobs: { /* ... */ },
    manager: { /* ... */ }
};
```

3. **Create UI:**
```js
// myFacility.js
App.UI.myFacility = function() {
    const frag = new DocumentFragment();
    // Build facility UI
    return frag;
};
```

4. **Register passage:**
```js
// src/005-passages/facilityPassages.js
Story.addPassage("MyFacility", App.UI.myFacility);
```

5. **Add end-week report:**
```js
// src/endWeek/reports/myFacilityReport.js
App.Reports.myFacility = function() {
    // Generate weekly report
};
```

### **Adding a New Description Module**

1. **Create description file:**
```js
// src/npc/descriptions/myNewDesc.js
App.Desc.myNewDesc = function(slave, options = {}) {
    const r = [];
    const {he, his, He} = getPronouns(slave);
    
    // Build description
    if (slave.myProperty > 50) {
        r.push(`${He} has high value.`);
    }
    
    return r.join(" ");
};
```

2. **Use in long description:**
```js
// src/npc/descriptions/longSlaveDescription.js
// Add call to your new description
r.push(App.Desc.myNewDesc(slave, options));
```

### **Modifying End-Week Processing**

1. **Find appropriate `sa*.js` file or create new one:**
```js
// src/endWeek/saMyNewProcessing.js
function processMyNewSystem(slave) {
    // Process slave
    if (slave.myProperty > 50) {
        slave.myProperty -= 10;
    }
}

// Called by end-week system
```

2. **Ensure it's called in end-week loop:**
- Check `src/endWeek/endWeek.js`
- Add call if needed

## Performance Considerations

**Heavy Operations:**
- Description generation (called frequently)
- End-week processing (processes all slaves)
- Art rendering (SVG/WebGL)
- Save/load (compression/decompression)

**Optimization Tips:**
- Use `DocumentFragment` for DOM building
- Cache expensive calculations
- Minimize passage transitions
- Use early returns in loops
- Avoid repeated DOM queries

**Memory Management:**
- Clean up temporary variables
- Remove old event data
- Prune history
- Validate state regularly

## Debugging

**Browser Console:**
```js
// Access game state
V.slaves[0]              // First slave
V.PC                     // Player character
V.week                   // Current week

// Call functions
App.UI.myFunction(V.slaves[0])
getSlave(1)

// Modify state for testing
V.cash = 999999
V.slaves[0].devotion = 100
```

**Common Issues:**
- **Undefined errors** - Check for null/undefined
- **State not updating** - Verify assignment order
- **Art not showing** - Check cache initialization
- **Save/load errors** - Validate data structure

## File Organization

**Naming Conventions:**
- `sa*.js` - Slave assignment/processing
- `*Framework.js` - Facility/system frameworks
- `*Select.js` - Manager selection
- `*Passages.js` - Passage registration
- `p*.js` - Player-specific (in `player/`)
- `si*.js` - Slave interact (in `interaction/`)

**Directory Organization:**
- Group by system/feature
- Keep related files together
- Use subdirectories for large systems
- Follow existing patterns

<!-- cSpell:enable -->

## Related Documentation

- `DEVELOPER_GUIDE.md` - Overall project structure and comprehensive developer documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `js/README.MD` - JavaScript source files documentation
- `src/art/genAI/README.MD` - AI art system
- `devTools/README.md` - Development tools
- `devNotes/docs/` - Technical guides