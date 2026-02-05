# CSS Styling System (`css/`)

<!-- cSpell:disable -->

## Overview

The `css/` directory contains **all stylesheets** for FC-Pregmod. CSS files are organized by system and functionality, following a modular approach that mirrors the JavaScript source structure. All CSS files are compiled into a single module and embedded in the final HTML.

**Relationship with Other Systems:**

```
css/002-variables/colors.css (BASE THEME)
  └─> Defines CSS custom properties (--background-default, --link-color, etc.)
      └─> Used by all other css/ files
          └─> Can be overridden by themes/

themes/light/01-variables/colors.css (THEME OVERRIDE)
  └─> Overrides CSS variables for light theme
      └─> Loaded as separate CSS file (bin/light.css)
          └─> Applied dynamically in-game

css/gui/buttons.css, css/facilities/, etc. (COMPONENT STYLES)
  └─> Use CSS variables: var(--button-color)
      └─> Automatically theme-aware
          └─> Work with any theme
```

**Key Relationships:**
- **`css/`** → Compiled into main game CSS (embedded in HTML)
- **`themes/`** → Compiled into separate theme files (bin/light.css, bin/Twilight.css)
- **CSS variables** → Bridge between base styles and themes
- **`src/`** → JavaScript may reference CSS classes, but doesn't generate CSS

## Key Characteristics

**CSS Organization:**
- ✅ **Modular structure** - Each system has its own CSS directory
- ✅ **Theme-aware** - Uses CSS custom properties (variables) for theming
- ✅ **Load order controlled** - Numbered prefixes control compilation order
- ✅ **No catch-all files** - Each system gets its own dedicated styles
- ✅ **Compiled into single module** - All CSS combined during build

**What belongs in `css/`:**
- All visual styling and layout
- Theme variables and color schemes
- Component-specific styles
- System-specific UI styling
- Responsive design rules

## Directory Structure

```
css/
├── 001-lib/              # Third-party library styles
│   ├── Jquery.css        # jQuery UI overrides
│   ├── macros.css        # SugarCube macro styling
│   └── tippy.css         # Tooltip library styles
├── 002-variables/        # CSS custom properties
│   └── colors.css        # Default color scheme
├── 003-sugarcube-overwrite/  # SugarCube engine overrides
│   ├── general.css       # General SugarCube styling
│   └── sidebar.css       # Sidebar customization
├── arcologyBuilding/     # Arcology construction UI
├── art/                  # Art system styling
│   ├── art.css           # General art display
│   ├── genAI.css         # AI art generation UI
│   └── outfitDesigner.css # Outfit design interface
├── corporation/          # Corporate system styling
├── debugging/            # Debug tools styling
├── endWeek/              # End-of-week UI
│   ├── endWeekAnim.css   # Animations
│   ├── FCTV.css          # FCTV system styling
│   └── slavesReport.css  # Slave reports
├── events/               # Event system styling
├── facilities/           # Facility-specific styles
│   ├── dressingRoom.css   # Dressing room UI
│   ├── nursery.css       # Nursery interface
│   ├── statistics.css    # Statistics display
│   ├── studio.css        # Studio interface
│   └── wardrobe.css      # Wardrobe management
├── futureSocieties/      # Future Society UI
├── general/              # Reusable utility styles
│   ├── formatting.css    # Text formatting utilities
│   ├── layout.css        # Layout utilities
│   └── textColors.css    # Text color utilities
├── gui/                  # Core UI components
│   ├── accordion.css      # Accordion components
│   ├── buttons.css       # Button styling
│   ├── encyclopedia.css  # Encyclopedia UI
│   ├── favorite.css      # Favorites system
│   ├── hotkeySettings.css # Hotkey configuration
│   ├── linksStrip.css    # Link strips
│   ├── lists.css         # List styling
│   ├── options.css       # Options menu
│   ├── personalLog.css   # Personal log UI
│   ├── quicklinks.css    # Quick links
│   ├── sidebar.css       # Sidebar styling
│   ├── slaveList/        # Slave list components
│   │   ├── cardStyle.css # Card-based display
│   │   ├── quickList.css # Quick list view
│   │   └── slaveList.css # Main slave list
│   ├── tabs.css          # Tab components
│   └── tooltips/         # Tooltip styling
│       └── tippy.css     # Tippy.js tooltips
├── icons/                # Icon styling
│   └── unicode_icons.css # Unicode icon definitions
├── interaction/          # Player interaction UI
│   ├── export.css        # Export functionality
│   ├── familyTree.css    # Family tree display
│   ├── prosthetics.css   # Prosthetics interface
│   ├── slaveInteract.css # Slave interaction UI
│   └── wardrobe.css      # Wardrobe interface
├── intro/                # Introduction/tutorial UI
├── manage/               # Management interfaces
│   ├── budget.css        # Budget management
│   └── main.css          # Main management UI
├── neighbor/             # Neighbor system UI
├── npc/                  # NPC-specific styling
└── rulesAssistant/       # Rules Assistant UI
    ├── conditionEditor.css # Condition editor
    ├── raLists.css       # RA lists
    ├── raOptions.css     # RA options
    └── raSummary.css     # RA summary
```

## Load Order

CSS files are compiled in **specific order** to manage dependencies:

```
1. css/001-lib/           (Third-party libraries first)
2. css/002-variables/     (CSS variables before usage)
3. css/003-sugarcube-overwrite/ (SugarCube overrides)
4. css/* (alphabetical)   (All other directories)
```

**Numbered Prefixes:**
- `001-`, `002-`, `003-` control compilation order
- Lower numbers compile first
- Variables must be defined before they're used
- Library styles must load before overrides

**Why This Matters:**
- CSS variables must be defined before use
- Library styles must load before custom overrides
- SugarCube overrides must come after base styles
- Breaking load order can cause styling conflicts

## CSS Architecture

### **CSS Custom Properties (Variables)**

The theming system uses CSS custom properties defined in `css/002-variables/colors.css`:

```css
:root {
    /* Base colors */
    --background-default: #111;
    --background-lighter: #1a1a1a;
    --background-light: #222;
    --background-highlight: #333;

    /* Button colors */
    --button-color: #252525;
    --button-border-color: #333333;
    --button-selected-color: #050505;
    --button-hover-color: #414141;
    --button-disabled-color: var(--background-lighter);

    /* Link colors */
    --link-color: #68D;
    --link-hover-color: #8af;
}
```

**Usage:**
```css
.my-button {
    background-color: var(--button-color);
    border: 1px solid var(--button-border-color);
}

.my-button:hover {
    background-color: var(--button-hover-color);
}
```

### **Theme System**

Themes override CSS variables to change the color scheme:

**Light Theme (`themes/light/01-variables/colors.css`):**
```css
:root {
    --background-color: #fff;
    --text-color: #000;
    --button-color: #b38cd9;
    --link-color: #2A52B7;
}
```

**Twilight Theme (`themes/Twilight/01-variables/colors.css`):**
```css
:root {
    --background-color: #1c1d24;
    --text-color: #e1e1e1;
    --button-color: #2b2640;
    --link-color: #6574cd;
}
```

### **Component Organization**

Each system follows a consistent pattern:

**Facility Styling:**
```css
/* css/facilities/studio.css */
.studio-interface {
    /* Studio-specific styles */
}

.studio-controls {
    /* Control panel styling */
}
```

**GUI Components:**
```css
/* css/gui/buttons.css */
.purchase-button {
    font-style: normal;
    margin: 0.25em 1em;
    outline: none;
    transition: 0.2s;
}

.purchase-button.disabled {
    background-color: black;
    cursor: not-allowed;
}
```

## Development Guidelines

### **Adding New Styles**

**1. Choose the Right Location:**
- **System-specific**: Put in matching `css/systemName/` directory
- **Reusable utilities**: Put in `css/general/`
- **Third-party overrides**: Put in `css/001-lib/`
- **Theme variables**: Put in `css/002-variables/`

**2. Follow Naming Conventions:**
```css
/* Good: Descriptive, system-specific */
.slave-card-header { }
.facility-controls { }
.budget-display { }

/* Bad: Generic, unclear purpose */
.header { }
.controls { }
.display { }
```

**3. Use CSS Variables:**
```css
/* Good: Theme-aware */
.my-component {
    background-color: var(--button-color);
    color: var(--text-color);
}

/* Bad: Hard-coded colors */
.my-component {
    background-color: #252525;
    color: #fff;
}
```

**4. Create New Files When Needed:**
- Don't add unrelated styles to existing files
- Create new files for new systems
- Keep files focused and manageable

### **CSS Patterns**

**Layout Utilities (`css/general/layout.css`):**
```css
.center {
    margin-left: auto;
    margin-right: auto;
    text-align: center;
}

div.flex-container {
    display: flex;
}

div.grid-2columns-auto {
    display: grid;
    grid-template-columns: auto auto;
    grid-column-gap: 1em;
}
```

**Text Formatting (`css/general/formatting.css`):**
```css
.indent {
    text-indent: 2em;
}

.double-indent {
    text-indent: 4em;
}

.choices {
    margin-left: 2em;
}
```

**Responsive Design:**
```css
@media only screen and (min-width: 768px) {
    div.grid-2columns-auto {
        grid-template-columns: max-content auto;
    }
}
```

## Compilation Process

### **Build Integration**

CSS files are processed during compilation:

```
css/**/*.css
    ├── [gulp-sort] (alphabetical order)
    ├── [gulp-sourcemaps] (generate source maps)
    ├── [gulp-postcss + autoprefixer] (add vendor prefixes)
    ├── [gulp-clean-css] (minify if --minify)
    ├── [gulp-concat] (combine into single file)
    └── build/module/module-styles.css
```

**Final Output:**
- Combined into single CSS file
- Embedded in HTML `<head>` section
- Minified in production builds
- Source maps for debugging

### **Theme Compilation**

Themes are compiled separately:

```
themes/light/**/*.css
    ├── [gulp-sort] (alphabetical order)
    ├── [gulp-postcss + autoprefixer]
    ├── [gulp-clean-css] (if --minify)
    ├── [gulp-concat]
    └── bin/light.css

themes/Twilight/**/*.css
    ├── [gulp-sort] (alphabetical order)
    ├── [gulp-postcss + autoprefixer]
    ├── [gulp-clean-css] (if --minify)
    ├── [gulp-concat]
    └── bin/Twilight.css
```

## Common Tasks

### **Adding Styles for New System**

1. **Create directory**: `css/myNewSystem/`
2. **Add CSS file**: `css/myNewSystem/myNewSystem.css`
3. **Use variables**: Reference CSS custom properties
4. **Test**: Compile and verify styling

```css
/* css/myNewSystem/myNewSystem.css */
.my-new-system {
    background-color: var(--background-default);
    border: 1px solid var(--button-border-color);
    padding: 1em;
}

.my-new-system-header {
    color: var(--text-color);
    font-weight: bold;
}
```

### **Creating New Theme**

1. **Copy base theme**: `cp -r themes/light themes/myTheme`
2. **Modify variables**: Edit `themes/myTheme/01-variables/colors.css`
3. **Test theme**: Use `App.UI.Theme.loadTheme("myTheme.css")`
4. **Compile theme**: Run `npx gulp themes`

### **Debugging CSS Issues**

**1. Check Load Order:**
- Variables defined before use?
- Libraries loaded before overrides?

**2. Verify Selectors:**
- Specific enough to override defaults?
- Not conflicting with other styles?

**3. Use Browser DevTools:**
- Inspect computed styles
- Check CSS variable values
- Verify media queries

**4. Test Theme Switching:**
- Load different themes
- Check variable overrides
- Verify color changes

## Performance Considerations

### **CSS Optimization**

**Minification:**
- CSS is minified in production builds
- Removes whitespace and comments
- Reduces file size by ~30-40%

**Vendor Prefixes:**
- Autoprefixer adds vendor prefixes automatically
- Ensures cross-browser compatibility
- No manual prefix management needed

**Source Maps:**
- Generated for debugging
- Map minified CSS back to source
- Helpful for development

### **Best Practices**

**1. Use CSS Variables:**
- Enables theme switching
- Centralizes color management
- Reduces duplication

**2. Modular Organization:**
- Keep related styles together
- Avoid monolithic files
- Easy to maintain and debug

**3. Responsive Design:**
- Use media queries appropriately
- Test on different screen sizes
- Consider mobile users

**4. Performance:**
- Avoid overly specific selectors
- Use efficient CSS properties
- Minimize reflows and repaints

## Troubleshooting

### **Common Issues**

**Styles Not Applying:**
- Check CSS variable definitions
- Verify selector specificity
- Ensure proper load order

**Theme Not Switching:**
- Check variable overrides
- Verify theme file compilation
- Test with browser dev tools

**Layout Issues:**
- Check flexbox/grid properties
- Verify responsive breakpoints
- Test on different browsers

**Performance Problems:**
- Profile CSS performance
- Check for expensive properties
- Optimize selectors

### **Debugging Tools**

**Browser DevTools:**
- Inspect element styles
- Check CSS variable values
- Profile performance

**CSS Linting:**
- Use stylelint for code quality
- Check for common mistakes
- Enforce coding standards

**Theme Testing:**
- Use `App.UI.Theme.loadTheme()` for quick testing
- Compare different themes
- Verify variable inheritance

## Related Documentation

- `DEVELOPER_GUIDE.md` - Overall project architecture and comprehensive developer documentation
- `themes/themes.md` - Theme creation guide
- `css/css.md` - Basic CSS organization rules
- `devTools/README.md` - Build system documentation

<!-- cSpell:enable -->