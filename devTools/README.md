# Development Tools (`devTools/`)

## Overview

<!-- cSpell:disable -->

The `devTools/` directory contains all build tools, compilers, validators, and utilities needed to develop FC-Pregmod. These tools handle compilation, code quality checks, type checking, and development workflow automation.

## Directory Structure

```
devTools/
├── scripts/              # Node.js build and validation scripts
├── tweeGo/              # Twine/Twee compiler (TweeGo)
├── minify/              # HTML/JS/CSS minification tool
├── javaSanityCheck/     # Comprehensive code validator
├── types/               # TypeScript type definitions
├── dictionaries/        # Spell checker dictionaries
├── concatFiles.bat/sh   # File concatenation utility
├── checkJS.sh           # JavaScript syntax checker
└── [other utilities]    # Various helper scripts
```

## Core Components

### **`scripts/`** - Node.js Build Scripts

Modern JavaScript build scripts using Node.js and npm packages.

**Key Scripts:**

**`advancedCompiler.js`** - Main compilation orchestrator
- Reads `settings.json` configuration
- Runs sanity checks (if enabled)
- Executes Gulp build tasks
- Handles compilation flags and options
- Manages build notifications

**`setup.js`** - First-time setup and configuration
- Creates `settings.json` if missing
- Validates configuration
- Checks dependencies
- Initializes development environment

**`sanityCheck.js`** - Code validation runner
- Executes Java sanity checker
- Runs custom JavaScript checks
- Validates code structure
- Reports errors and warnings

**`watcher.js`** - File watching and auto-compilation
- Monitors `src/` and `css/` for changes
- Automatically recompiles on save
- Optional live reload
- Debounced compilation (prevents rapid rebuilds)

**`watcherLiveReload.js`** - Live reload server
- WebSocket server for browser communication
- Injects reload script into HTML
- Triggers browser refresh on compilation
- Development-only feature

**`eslintChecks.js`** - ESLint runner
- Runs ESLint on source code
- Enforces code style rules
- Reports style violations
- Can auto-fix many issues

**`typescriptChecks.js`** - TypeScript type checker
- Validates JSDoc type annotations
- Checks type consistency
- Uses `devTools/types/` definitions
- Provides IDE-like type checking

**`spellingChecks.js`** - Spell checker
- Uses cSpell for spell checking
- Checks strings and comments
- Uses custom dictionaries
- Reports spelling errors

**`customChecks.js`** - Custom validation rules
- Project-specific validation
- Custom linting rules
- Structural checks
- Best practice enforcement

**`dependencyCheck.js/bat/sh`** - Dependency validator
- Checks Node.js installation
- Verifies npm packages
- Validates tool availability
- Reports missing dependencies

**`detectChanges.js`** - Git change detection
- Detects modified files
- Determines what needs rebuilding
- Optimizes compilation
- Used by CI/CD

**`FCHostInstallAndRun.js`** - FCHost automation
- Downloads FCHost if needed
- Installs to correct location
- Launches FCHost with game
- Platform-specific handling

**`yesno.js`** - Interactive prompts
- Command-line user input
- Yes/no confirmations
- Used by setup and other scripts

**`gitHooks/`** - Git hook management
- `addHooks.js` - Installs git hooks
- `pre-commit` - Pre-commit hook script
- `pre-commit.js` - Pre-commit validation
- Runs checks before commits

### **`tweeGo/`** - Twine Compiler

TweeGo is the compiler that converts Twee/Twine source files into HTML.

**Structure:**
```
tweeGo/
├── tweego_nix64         # Linux 64-bit binary
├── tweego_nix86         # Linux 32-bit binary
├── tweego_osx64         # macOS 64-bit binary
├── tweego_osx86         # macOS 32-bit binary
├── tweego_win64.exe     # Windows 64-bit binary
├── tweego_win86.exe     # Windows 32-bit binary
├── storyFormats/        # Story format definitions
│   └── sugarcube-2/     # SugarCube 2 format
│       ├── format.js    # SugarCube engine
│       └── LICENSE      # SugarCube license
└── license/
    └── LICENSE.txt      # TweeGo license
```

**Usage:**
```bash
# Set story format path
export TWEEGO_PATH=devTools/tweeGo/storyFormats

# Compile game
tweego -o output.html \
       --module=bin/fc.js \
       --module=bin/fc.css \
       --head=resources/favicon.html \
       src/
```

**What TweeGo Does:**
1. Reads source files (`.js`, `.tw`, `.css`)
2. Processes Twee markup
3. Embeds JavaScript and CSS
4. Includes SugarCube engine
5. Generates single HTML file

**Environment Variable:**
- `TWEEGO_PATH` - Path to story formats directory
- Must be set before running TweeGo
- Points to `devTools/tweeGo/storyFormats`

### **`minify/`** - Minification Tool

Go-based minification tool for HTML, JavaScript, and CSS.

**Binaries:**
- `minify_darwin_amd64` - macOS Intel
- `minify_linux_amd64` - Linux x64
- `minify_win_amd64.exe` - Windows x64

**Features:**
- HTML minification (preserves comments for licenses)
- JavaScript minification (keeps variable names for eval)
- CSS minification
- Fast (Go-based)
- No dependencies

**Usage:**
```bash
# Minify HTML file
./devTools/minify/minify_linux_amd64 \
    --html-keep-comments \
    --js-keep-var-names \
    input.html > output.html
```

**Options:**
- `--html-keep-comments` - Preserve HTML comments (for SugarCube license)
- `--js-keep-var-names` - Keep JavaScript variable names (for SugarCube eval)
- Reduces file size by 30-40%

**Why Keep Variable Names:**
- SugarCube uses `eval()` extensively
- Eval depends on local variable names
- Renaming breaks SugarCube functionality
- Trade-off: larger file size, but working game

### **`javaSanityCheck/`** - Code Validator

Comprehensive Java-based code validation tool.

**Files:**
- `SanityCheck.jar` - Main validator (Java)
- `sources.zip` - Source code
- `dictionary_*.txt` - Validation dictionaries
- `excluded` - Files to skip
- `htmlTags` - Valid HTML tags
- `ignoredVariables` - Variables to ignore
- `twineTags` - Valid Twine tags

**What It Checks:**
- JavaScript syntax errors
- Undefined variables
- Typos in variable names
- Invalid HTML tags
- Malformed Twine markup
- Common coding mistakes
- Structural issues
- Best practice violations

**Dictionaries:**

**`dictionary_wholeWords.txt`** - Valid whole words
- Variable names
- Function names
- Game-specific terms
- Prevents false positives

**`dictionary_phrases.txt`** - Valid phrases
- Multi-word terms
- Common expressions
- Game-specific phrases

**`dictionary_caseSensitive_phrases.txt`** - Case-sensitive terms
- Proper nouns
- Specific identifiers
- Exact matches only

**Configuration Files:**

**`excluded`** - Files to skip
- Generated files
- Third-party code
- Legacy files
- Known issues

**`htmlTags`** - Valid HTML tags
- Standard HTML tags
- Custom tags
- SugarCube macros

**`ignoredVariables`** - Variables to ignore
- Global variables
- SugarCube variables
- Known externals

**`twineTags`** - Valid Twine tags
- Passage tags
- Special tags
- Custom tags

**Usage:**
```bash
java -jar devTools/javaSanityCheck/SanityCheck.jar
```

**Output:**
- Prints errors to console
- Returns exit code (0 = success)
- Detailed error messages
- File and line numbers

### **`types/`** - TypeScript Definitions

TypeScript `.d.ts` files providing type information for IDE support.

**Structure:**
```
types/
├── FC/                  # FC-Pregmod types
│   ├── common.d.ts      # Common types
│   ├── gameState.d.ts   # V.* variables
│   ├── slaveBot.d.ts    # Slave state
│   ├── facilities.d.ts  # Facility types
│   ├── UI.d.ts          # UI functions
│   ├── util.d.ts        # Utility types
│   └── [others]         # System-specific types
├── idb/                 # IndexedDB types
├── tippy/               # Tippy.js types
├── assistant.d.ts       # Personal assistant
├── crc32.d.ts           # CRC32 library
├── extensions.d.ts      # JS extensions
├── jszip.d.ts           # JSZip library
└── SugarCubeExtensions.d.ts  # SugarCube types
```

**Purpose:**
- IDE autocomplete
- Type checking (via TypeScript)
- Documentation
- Error prevention
- Better developer experience

**Usage:**
- Automatically used by VSCode/IDEs
- Referenced in `tsconfig.json`
- Provides IntelliSense
- No compilation (definitions only)

**Example:**
```typescript
// types/FC/slaveBot.d.ts
declare namespace FC {
    interface SlaveState {
        ID: number;
        slaveName: string;
        age: number;
        devotion: number;
        trust: number;
        // ... hundreds more properties
    }
}
```

**Benefits:**
- Catch errors before runtime
- IDE shows available properties
- Function parameter hints
- Return type information

**Critical Relationship with JavaScript:**

TypeScript definitions and JavaScript code work together:

```typescript
// devTools/types/FC/human.d.ts (TYPE DEFINITION)
declare namespace FC {
    interface SlaveState {
        devotion: number;
        trust: number;
    }
}
```

```javascript
// src/js/states/003-SlaveState.js (ACTUAL IMPLEMENTATION)
App.Entity.SlaveState = class extends App.Entity.HumanState {
    constructor() {
        this.devotion = 0;  // Creates actual property
        this.trust = 0;     // Sets default value
    }
};
```

**How They Work Together:**
1. **TypeScript describes structure** - What properties exist, what types they are
2. **JavaScript implements behavior** - Creates objects, sets defaults, defines logic
3. **JSDoc bridges them** - `@param {FC.SlaveState}` references TypeScript type
4. **Both must match** - Adding property requires updating both files

**Usage Example:**
```javascript
/**
 * @param {FC.SlaveState} slave - TypeScript provides IDE hints
 */
function updateSlave(slave) {
    // IDE autocomplete shows 'devotion' because TypeScript defines it
    // But actual object created by JavaScript class
    slave.devotion += 10;
}
```

**When Adding/Changing Properties:**
1. Update JavaScript class in `src/js/states/`
2. Update TypeScript definition in `devTools/types/FC/`
3. Both must stay synchronized
4. IDE autocomplete comes from TypeScript
5. Runtime behavior comes from JavaScript

### **`dictionaries/`** - Spell Checker Dictionaries

Custom word lists for cSpell spell checker.

**Files:**

**`countries_and_people_groups.txt`** - Geographic terms
- Country names
- Nationality terms
- Ethnic groups
- Regional names

**`japanese.txt`** - Japanese terms
- Romanized Japanese
- Anime terms
- Cultural references

**`languages.txt`** - Language names
- Language identifiers
- Linguistic terms

**`names.txt`** - Personal names
- Character names
- Historical figures
- Common names

**`misc.txt`** - Miscellaneous terms
- Game-specific terms
- Technical jargon
- Slang and colloquialisms
- Medical terms

**Usage:**
- Referenced in `cspell.json`
- Prevents false spelling errors
- One word per line
- Case-insensitive

**Adding Words:**
1. Open appropriate dictionary file
2. Add word (one per line)
3. Save file
4. Spell checker automatically uses it

## Utility Scripts

### **`concatFiles.bat/sh`** - File Concatenation

Simple script to concatenate multiple files in order.

**Usage:**
```bash
# Unix/Mac
./devTools/concatFiles.sh source_dir/ '*.js' output.js

# Windows
devTools\concatFiles.bat source_dir\ *.js output.js
```

**Process:**
1. Finds all matching files
2. Sorts alphabetically
3. Adds file path comment
4. Concatenates content
5. Writes to output file

**Used By:**
- Simple compiler
- Theme compilation
- Quick builds

### **`checkJS.sh`** - JavaScript Syntax Checker

Quick JavaScript syntax validation.

**Usage:**
```bash
./devTools/checkJS.sh file.js
```

**Checks:**
- Syntax errors
- Parse errors
- Basic validation
- Fast feedback

### **`convert_twscript_to_js.sh`** - TwineScript Converter

Converts old TwineScript/SugarCube macro code to JavaScript.

**Purpose:**
- Migrate legacy code
- Convert widgets to functions
- Modernize codebase

**Usage:**
```bash
./devTools/convert_twscript_to_js.sh input.tw output.js
```

### **`embed_favicon.bat/py`** - Favicon Embedder

Embeds favicon into HTML head section.

**Files:**
- `embed_favicon.bat` - Windows wrapper
- `embed_favicon.py` - Python script

**Usage:**
```bash
python devTools/embed_favicon.py favicon.ico output.html
```

**Process:**
1. Reads favicon file
2. Converts to base64
3. Generates data URI
4. Embeds in HTML

### **`BuildAndIPFSify.sh`** - IPFS Build

Builds game and prepares for IPFS distribution.

**Process:**
1. Compiles game
2. Optimizes for IPFS
3. Generates IPFS hash
4. Prepares distribution

**Usage:**
```bash
./devTools/BuildAndIPFSify.sh
```

### **`DL-Loop.sh`** - Download Loop

Automated download and build loop for CI/CD.

**Purpose:**
- Continuous integration
- Automated builds
- Testing pipeline

### **`switchBranch.sh`** - Git Branch Switcher

Safely switches git branches with cleanup.

**Features:**
- Stashes changes
- Switches branch
- Restores changes
- Rebuilds if needed

### **`updateTool.sh`** - Tool Updater

Updates development tools to latest versions.

**Updates:**
- TweeGo compiler
- Node packages
- TypeScript definitions
- Other tools

### **`upload.sh`** - Upload Script

Uploads compiled game to distribution servers.

**Features:**
- FTP/SFTP upload
- Version tagging
- Changelog generation
- Release automation

## Configuration Files

### **`settings.json`** - Build Settings

User-specific build configuration (created by `setup.js`).

**Structure:**
```json
{
  "compilerMode": "advanced",
  "compilerVerbosity": 6,
  "compilerSourcemaps": true,
  "compilerMinify": false,
  "compilerAddDebugFiles": false,
  "compilerFilenameHash": false,
  "compilerFilenameEpoch": false,
  "compilerFilenamePmodVersion": false,
  "compilerRunSanityChecks": 1,
  "compileThemes": true,
  "WatcherLiveReload": true
}
```

**Options:**

**`compilerMode`** - "simple" or "advanced"
- Simple: Fast, minimal dependencies
- Advanced: Full features, slower

**`compilerVerbosity`** - 1-6
- 1: Errors only
- 6: All messages

**`compilerSourcemaps`** - true/false
- Generate source maps for debugging
- Increases file size

**`compilerMinify`** - true/false
- Minify output (30-40% smaller)
- Slower compilation

**`compilerAddDebugFiles`** - true/false
- Include `*.debug.*` files
- Development only

**`compilerFilenameHash`** - true/false
- Add git commit hash to filename
- Example: `FC_pregmod_a1b2c3d.html`

**`compilerFilenameEpoch`** - true/false
- Add timestamp to filename
- Example: `FC_pregmod_1234567890.html`

**`compilerFilenamePmodVersion`** - true/false
- Add version to filename
- Example: `FC_pregmod_4.0.0-alpha.38.html`

**`compilerRunSanityChecks`** - 0 or 1
- 0: Never run sanity checks
- 1: Run before compilation

**`compileThemes`** - true/false
- Compile theme CSS files
- Generates `bin/light.css`, `bin/Twilight.css`

**`WatcherLiveReload`** - true/false
- Enable live reload in watcher
- Auto-refresh browser on changes

## Development Workflow

### **First-Time Setup**

```bash
# 1. Install Node.js (if using advanced compiler)
# Download from https://nodejs.org/

# 2. Run setup script
./setup.sh        # Mac/Linux
setup.bat         # Windows

# 3. Install dependencies (advanced mode only)
npm install

# 4. Compile game
./compile.sh      # Mac/Linux
compile.bat       # Windows
```

### **Daily Development**

```bash
# Start file watcher (auto-compile on save)
./watcher.sh      # Mac/Linux
watcher.bat       # Windows

# Edit files in src/ or css/
# Game automatically recompiles
# Refresh browser to see changes
```

### **Before Committing**

```bash
# Run code quality checks
npm run lint              # ESLint
npm run typecheck         # TypeScript
npm run spell             # Spell checker
./sanityCheck.sh          # Sanity check

# Fix auto-fixable issues
npm run lint:fix

# Commit changes
git add .
git commit -m "Description"
```

### **Production Build**

```bash
# Configure for production
# Edit settings.json:
# - compilerMinify: true
# - compilerSourcemaps: false
# - compilerRunSanityChecks: 1

# Compile
./compile.sh

# Output: bin/FC_pregmod.html (optimized)
```

## Troubleshooting

**"Node.js not found":**
- Install Node.js from https://nodejs.org/
- Ensure it's in PATH
- Restart terminal

**"npm install fails":**
- Check internet connection
- Try `npm cache clean --force`
- Delete `node_modules/` and retry
- Check npm version (`npm --version`)

**"TweeGo not found":**
- Check `devTools/tweeGo/` exists
- Verify binary permissions (Mac/Linux)
- Try `chmod +x devTools/tweeGo/tweego_*`

**"Java not found" (sanity check):**
- Install Java JRE 8+
- Ensure java is in PATH
- Check with `java -version`

**"Permission denied" (Mac/Linux):**
- Make scripts executable:
  ```bash
  chmod +x *.sh
  chmod +x devTools/*.sh
  chmod +x devTools/tweeGo/tweego_*
  ```

**"Sanity check fails":**
- Check `sanityCheck.log` for details
- Review reported errors
- Fix code issues
- Rerun sanity check

**"Watcher not detecting changes":**
- Check file permissions
- Verify paths in watcher config
- Try manual compile
- Restart watcher

## Adding New Tools

### **Adding a Node.js Script**

1. **Create script in `devTools/scripts/`:**
```javascript
// devTools/scripts/myNewTool.js
import jetpack from "fs-jetpack";

console.log("Running my new tool...");

// Tool logic here

export default function myNewTool() {
    // Implementation
}
```

2. **Add npm script in `package.json`:**
```json
{
  "scripts": {
    "mytool": "node devTools/scripts/myNewTool.js"
  }
}
```

3. **Use it:**
```bash
npm run mytool
```

### **Adding a Shell Script**

1. **Create script in `devTools/`:**
```bash
#!/bin/bash
# devTools/myNewTool.sh

echo "Running my new tool..."

# Tool logic here
```

2. **Make executable:**
```bash
chmod +x devTools/myNewTool.sh
```

3. **Use it:**
```bash
./devTools/myNewTool.sh
```

<!-- cSpell:enable -->

## Related Documentation

- `DEVELOPER_GUIDE.md` - Project overview, build flow, and comprehensive developer documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `README.md` - User-facing documentation
- `gulpfile.js` - Gulp build configuration
- `package.json` - npm scripts and dependencies
