<!-- cSpell:ignore nwjs -->

# Free Cities - pregmod

Pregmod is a modification of the original [Free Cities](https://freecitiesblog.blogspot.com/) created by FCdev.

## Play the game

* WARNING - FCHost users need to update or rebuild FCHost before running alpha.34 or later (or the latest build) or it WILL DELETE YOUR LOCAL SAVES!!! Download info is at https://gitgud.io/pregmodfan/fc-pregmod/-/blob/pregmod-master/FCHost/README.md?ref_type=heads#fchost and build info is at https://gitgud.io/pregmodfan/fc-pregmod/-/blob/pregmod-master/FCHost/HowToBuild.md#how-to-build

* WARNING - JoiPlay users need to export any saves they care about (using the Save to Clipboard option) before updating from alpha.33 or earlier. Any saves that aren't exported will be lost!

1. Download the game
   * [Current release](https://gitgud.io/pregmodfan/fc-pregmod/-/releases)
   * [Latest build](https://gitgud.io/pregmodfan/fc-pregmod/-/jobs/artifacts/pregmod-master/download?job=build)
2. Open the game in your preferred browser
   * On PC, we recommend either Firefox or [FCHost](FCHost/README.md).
   * Recommendation: Drag it into incognito mode
3. Have fun!

### Compile the game yourself

If you want to tweak the game a bit, you can easily download the files and compile it yourself.

1. Clone the git repository:
   1. [Install Git for terminal](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) or a Git GUI of your
      choice.
   2. Clone the repo
       * Via terminal: `git clone --single-branch https://gitgud.io/pregmodfan/fc-pregmod.git`
   3. Get updates
       * Via terminal: `git pull`

2. Compile the game:
   * Using one of two methods
     1. The simple compiler by running `simple-compiler.bat` (Windows) or `simple-compiler.sh` (Mac/Linux)
         * Benefits:
           * Requires no external dependencies
           * Slightly faster compiling
     2. The advanced compiler by running `compile.bat` (Windows) or `compile.sh` (Mac/Linux)
         * Requires:
           * [Git](https://git-scm.com/)
           * [Node.js](https://nodejs.org)
           * ~500 MB of Node packages
           * `compile.[bat, sh]` will attempt to help you with the installation of its dependencies
         * Benefits:
           * Easier debugging
           * Early problem detection
           * Spell checking
           * Tweaking of compiler settings by running `setup.bat` (Windows) or `setup.sh` (Mac/Linux)
           * Copies `FC_pregmod.html` to `FCHost` if it is installed
           * Live reloading of FC after file changes by running `watcher.bat` (Windows) or `watcher.sh` (Mac/Linux)
   * We suggest using the advanced compiler when possible.
   * **The second run of the compiler will overwrite the existing `FC_pregmod.html` file!**
   * **All our tooling expects that you are running them in FC's root directory** (Where you see devTools, src, js, etc). Failure to do so will result in errors.
   * If you are using an ARM-based device, you may need to use `arch -x86_64 bash [compile or simple-compiler].sh` to properly compile.

3. To play open `FC_pregmod.html` in the `bin/` folder
  * Repeat steps 2 and 3 after you make any changes or use `watcher.[bat, sh]` to do them automatically.

## Contributing to and modifying FC Pregmod

New Contributors are always welcome. Basic information before you start can be found [here](CONTRIBUTING.md).

This info is useful even if you are making personal changes with no intention of merging.

Also we accept a lot of merges and features that people wouldn't expect, so if you are on the fence, just create an issue or merge request and ask.

## Common problems

* If compiling takes a long time (more than 2 minutes) or causes a noticeable increase in system resource utilisation.
  - FC's compiler makes a lot of file changes over a short period of time. Some Antivirus programs will make FC's compiler wait while it scans the contents of each changed file. So it might be worth making sure FC's directory is excluded in your Antivirus settings.
    * If your Antivirus is Windows Defender (currently tested with Windows 10 on 04/14/2024):
      * `Start menu` -> `Windows Security` -> `Virus & threat protection` -> `Virus & threat protection settings` ->
      `Manage settings` -> `Exclusions (near the bottom)` -> `Add or remove exclusions` -> `Add an exclusion` ->
      `path to FC's root directory (Where you see devTools, src, js, etc).`

* `sessionStorage quota exceeded` / `localStorage quota exceeded` or something similar
  - Your saves stored inside the browser are getting too large. There are multiple ways to solve this:
    1. Delete saves stored in the browser. If you want to keep them, save them to disk first.
    2. Disable autosave and delete the current one. Due to technical reasons autosaves are larger than normal saves, so this may help more than expected.
    3. If on Firefox, raise the storage limit: Type `about:config` in the address bar and search for
       `dom.storage.default_quota`. Increase this value as needed. Default value is 5120 kilobytes / 5 MB.
    4. Switch to a different browser. Recommended is either Firefox or [FCHost](FCHost/README.md), a custom HTML renderer specifically for Pregmod.
    5. If you absolutely need to use Google Chrome:
       1. download and unzip [NW.js SDK](https://nwjs.io/downloads/) for your operative system.
       2. copy the game file (FC_pregmod.html) into the `nwjs-sdk-v0.XX.Y-YOUR_OS` folder
       3. in the same folder, create a text file with the following content:
          ```
          {
              "name": "Free Cities pregmod edition",
              "main": "FC_pregmod.html",
              "dom_storage_quota":30
          }
          ```
          and save it as package.json. In this example, 30 is the limit (in MB) that is set for the storage quota,
          but you can replace it with any number. Google Chrome has the same default value as Firefox.
       4. Double click nw.exe to launch the game.

* Everything is broken!
  - **Do not copy over your existing download** as it may leave old files behind, replace it entirely

* I can't save more than once or twice.
  - Known issue caused by SugarCube level changes. Save to file doesn't have this problem and will likely avoid the
    first problem as well.
  - It is possible to increase the memory utilized by your browser to delay this

* I wish to report an issue.
  1. Search [issues](https://gitgud.io/pregmodfan/fc-pregmod/-/issues) to see if someone has already reported the issue.
  2. [Open a new issue](https://gitgud.io/pregmodfan/fc-pregmod/-/issues/new) or, if you are interested in trying to fix it yourself, please see our guide on [contributing](CONTRIBUTING.md).

## Submodules

FC uses a modified version of SugarCube 2. More information can be found [here](devNotes/sugarcube stuff/building SugarCube.md).
