<!-- cSpell:ignore fchost, Shokusku's -->

# FCHost

FCHost is an alternative HTML renderer for playing Pregmod based on Chromium. It has multiple advantages compared to normal browsers:

- No browser cache limits, allowing arbitrarily large save files.
- Saves are stored in an easily accessible way on disk, allowing for easy manual editing.
- No lost saves due to accidentally cleared cookies.
- Can be noticeable faster.

A Windows build is available for [download](https://mega.nz/file/kY5GmLRa#jwwgshNuKz0yAQDDeSs-jbPOOGX4Ap1ha_EKlWp-9-M).

If you are developing FC using the advanced tooling then you can run `FCHost.bat` (Windows) or `FCHost.sh` (Mac/Linux) to download and setup FCHost automatically.

## Initial setup

### HTML files

Place `FC_pregmod.html` next to the FCHost executable. This is usually `fchost.exe`, but it may be a file named `fchost` on Mac/Linux.

### Art resources

Art resources work the same way as with other browser. For embedded art no actions are necessary, while for the others
the art resources have to be placed in a `resources` directory next to the HTML file.

Elohiem's interactive WebGL:

- fchost.exe
- resources/
  - webgl

Shokusku's rendered image pack

- fchost.exe
- resources/
  - dynamic
  - renders

If making changes while the game is open make sure to refresh or restart FCHost before trying the art styles.

## Keybinds

| Action    | Key Combination  |
| --------- | ---------------- |
| Zoom In   | Ctrl + Plus      |
| Zoom Out  | Ctrl + Minus     |
| Dev Tools | Ctrl + Shift + J |

## Save file locations

| Platform | Location                                                       |
| -------- | -------------------------------------------------------------- |
| Windows  | `%User%\Documents\FreeCities_Pregmod\FCHostPersistentStorage\` |
| Linux    | `~/.local/share/FreeCities_Pregmod/FCHostPersistentStorage/`   |

## Building FCHost

If you want to build FCHost yourself please refer to [FCHost/HowToBuild.md](FCHost/HowToBuild.md).
