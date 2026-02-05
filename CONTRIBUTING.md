# Contributing to FC: Pregmod

First off, thanks for taking the time to contribute!
Also note that even if you are making personal changes the info in this documentation will likely be of some use to you.

If there is anything you don't understand please ask us about it by creating a new [issue](https://gitgud.io/pregmodfan/fc-pregmod/-/issues/new).

Note that the advanced tooling is not required for fixing small typos or simple bugs, but it is suggested.

## Environment

### Requirements

To effectively work on the project the following tools are needed:

* [Git](https://git-scm.com)
* [Node.js](https://nodejs.org/en/) or another npm client
* a code editor/IDE
  * [VSCode](https://code.visualstudio.com/) is a popular option and is what we recommend if you don't already have a preference

These tools are not required, but are suggested and will make working on FC easier.

### Setting everything up

1. Clone the project from GitGud.io ([Detailed Git setup and work cycle](devNotes/gitSetup.md))
2. Navigate to the `fc-pregmod` root directory.
   * Windows: Run `Windows Powershell` or `Command Prompt` and execute `cd C:\path\to\project\fc-pregmod`
   * Mac/Linux: Open a terminal and execute `cd /path/to/project/fc-pregmod/`
3. Run `setup.bat` (Windows) or `setup.sh` (Mac/Linux) in your terminal
4. Follow the install steps until you get to the `Welcome to FC development!...` menu and then select `Exit`
5. Open the directory in your preferred editor/IDE

**Make sure you have ESLint, TypeScript, and spell checking (preferably with cSpell compatibility) support installed and enabled (if available) in your preferred editor/IDE to catch formatting, type def, and spelling errors**

<details><summary>Recommended editor/IDE plugins/extensions</summary>

The list below is for VSCode. If you are not using VSCode but want some of these extensions functionality, then do some research. Many of these extensions exist or have alternatives in most common editors/IDEs.

* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  * Catches formatting problems and lets you know when your code doesn't conform to our standards
* TypeScript/TSC
  * Built into VSCode. Catches discrepancies between your code and the existing TypeScript type defs
* [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
  * Catches most spelling issues
* [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)
  * Highlights lines that ESLint, TSC, or Code Spell Checker have marked as having problems
* [Git Extension Pack](https://marketplace.visualstudio.com/items?itemName=donjayamanne.git-extension-pack)
  * Adds a few tools that make working with git easier
* [IntelliCode](https://marketplace.visualstudio.com/items?itemName=VisualStudioExptTeam.vscodeintellicode)
  * Will make your day easier by suggesting functions and properties for autocompletion
  * Will also show you documentation for those suggested functions and properties
* [TODO Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight)
  * Makes TODO comments stand out better
* [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)
  * Adds a tab to the left sidebar that lists all TODO comments in the current project

</details>

If you are using VSCode we also suggest copying `.vscode/settings.template.jsonc` to `.vscode/settings.json` to use our recommended VSCode settings.

### Compiling

Use either the simple or advanced compiler. See the `Compile the game yourself` section in the [readme](README.md) for more information. We suggest using the advanced compiler when possible.

## Code style

The coding style is based on our [`.eslintrc.json`](/.eslintrc.json) file. If your editor/IDE has ESLint support it will let you know when your coding style doesn't conform to our standards.
  * Most editors/IDEs don't have native ESLint support and will need you to install an ESLint plugin/extension.

### Documentation

It's a good idea to provide meaningful documentation for new functions and classes where possible.
We follow [JSDoc's](https://jsdoc.app) type dialect for the most part with some TypeScript definitions thrown in.
We provide a [TypeScript configuration](/tsconfig.json) (for TSC support).
More complex type definitions are usually stored in our [TypeScript type definition files](https://gitgud.io/pregmodfan/fc-pregmod/-/tree/pregmod-master/devTools/types?ref_type=heads).
Don't worry too much about specific type syntax if you can't make TS work or don't understand it,
someone else will probably fix it for you as long as you've made the intent clear in some combination of Comments, JSDoc, and/or TypeScript type def.

Here are some links that are may be helpful in regards to TypeScript, jsdoc, and documentation.
  * Getting started with JSDoc: https://jsdoc.app/about-getting-started.html
  * JSDoc's website: https://jsdoc.app/
  * The `human.d.ts` file where the bulk of our commonly used type defs are stored: https://gitgud.io/pregmodfan/fc-pregmod/-/blob/pregmod-master/devTools/types/FC/human.d.ts

### JavaScript Features

Use modern JavaScript features when possible. We are currently targeting ECMAScript 2022, and aren't trying to support Internet Explorer or anything stupid like that (it isn't 2010 anymore). For example, use [`let`/`const` rather than `var`](https://www.freecodecamp.org/news/var-let-and-const-whats-the-difference/), prefer [`Arrow function expressions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) to inline long-form functions, use [`nullish coalescing`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) and [`optional chaining`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining), etc.

### Naming conventions

* JavaScript variable and function names should be `camelCase`.

```js
// good
let fooBar;

// bad
let foobar;
let Foobar;
let FooBar;
```

* JavaScript classes and namespaces should be `PascalCase`.

```js
// good
class Foo {}
App.Foo.bar();

// bad
class foo {}
class FOO {}
App.foo.bar();
```

* TypeScript type defs should be `PascalCase`.

```ts
// good
export type Foo = "bar" | "car";
export interface Foo {
  bar: boolean,
}

// bad
export type foo = "bar" | "car";
export interface FOO {
  bar: boolean,
}
```

* Typescript enum members should be `ALLCAPS`.

```ts
// good
enum Foo {
  BAR = 'bar',
  BAZ = 'baz',
}

// bad
enum Foo {
  bar = 'bar',
  Baz = 'baz',
}
```

This also applies to JavaScript objects that are used as enums.

```js
// good
/** @enum {string} */
const Foo = Object.freeze({
  BAR: 'bar',
  BAZ: 'baz',
});

// bad
/** @enum {string} */
const foo = Object.freeze({
  BAR: 'bar',
  BAZ: 'baz',
});

// worse
/** @enum {string} */
const Object.freeze(foo = {
  bar: 'bar',
  Baz: 'baz',
});
```

* CSS classes are `kebob-case`.

```css
/* good */
.foo-bar {}

/* bad */
.fooBar {}
.FOO-BAR {}
```

### Code quality

Contributions should generally not add any new ESLint, TSC, or spelling errors. You can check for errors by running `sanityCheck.bat` (Windows)/`sanityCheck.sh` (Mac/Linux) and/or by using a code editor that supports ESLint, TSC, and cSpell.
  * With the default settings running `sanityCheck.bat` (Windows) or `sanityCheck.sh` (Mac/Linux) will (mostly) show you just the errors that were caused by your changes.
  * If you are not using the advanced tooling then use `legacySanityCheck.bat` or `legacySanityCheck.sh` instead.

## Project Structure

### Source files

* `src/` is the main directory for source code. It also contains the embedded art files. Since it is inside an `eval()` statement debugging and minification is more complicated than for `js/`.
* `js/` is loaded before SugarCube and therefore outside SugarCube's eval which `src/` is contained in. This means accessing SugarCube features (like `SugarCube.Engine`) is more complicated however it other than `src/` it can be minified and is easier to debug. Currently, contains mainly static data, however new code not relying on SC2 should be sorted in here too.
* `css/` contains all CSS files. The internal structure is explained [here](css/css.md).
* `themes/` contains [custom themes](themes/themes.md) which are built separately.

### Developer Files

* `devNotes/` contains various wiki files and other potentially interesting files.
  * Note that many of these files have outdated info. Your best bet is to double check the actual code before utilizing the info found in these files
* `devTools/` contains various scripts and executables needed for working with the project or compiling.
  * TypeScript typing files are stored here as well in the `devTools/types/` directory.
* `submodules/` contains Git submodules
  * currently only a custom version of SugarCube 2

### Art files

* `artTools/`contains files for creating and updating [vector art](artTools/README.md)
* `resources/` contains various [art related files](resources/ReadmeBeforeAddingArt.md)

### External Programs

* `docker/` contains Docker files from which the docker containers for GitLabs CI are created
* `FCHost/` contains the sources for [FCHost](FCHost/README.md)
* `saveTools/` contains tools for [editing save files](saveTools/README.md)

## Further Reading

### Notes and things that it is useful to know

* I highly recommend reading https://javascript.info/comments
* Whenever you add, remove or change the type of a property that is stored when saving the game you need to create a patch for your changes. Instructions for this can be found at the top of https://gitgud.io/pregmodfan/fc-pregmod/-/blob/pregmod-master/src/data/patches/patch.js
* If you have any suggestions, changes, or additions to this document that would have been helpful to you you please create a new issue or create a merge request with your changes.

### New to JavaScript and/or web development?

Here are some links to tutorials and reference material that should help you on your journey.
  * https://www.w3schools.com/Js/
  * https://www.geeksforgeeks.org/javascript/
  * https://www.freecodecamp.org/news/learn-javascript-for-beginners/
  * https://developer.mozilla.org/en-US/docs/Web#web_technology_references

### Wiki Files

* Event Writing Guides
  * [Twine<sup>1</sup>](devNotes/sceneGuide.md)
  * [JavaScript](devNotes/jsEventCreationGuide.md)
* [Exception handling](devNotes/exceptions.md)
* [Sanity check<sup>2</sup>](devNotes/sanityCheck.md)
* [Slave List](devNotes/slaveListing.md)
* [Pronouns](devNotes/Pronouns.md)
* External function documentation
  * [Eyes](devNotes/eyeFunctions.md)
  * [Limbs](devNotes/limbFunctions.md)
  * [Some potentially useful JS functions](devNotes/usefulJSFunctionDocumentation.md)
  * [Content embedding chart](devNotes/contentEmbeddingChart.png) (for more details refer to [this issue](https://gitgud.io/pregmodfan/fc-pregmod/-/merge_requests/7453#note_118616))

<sup>1. Twine is being phased out of the project and should not be used in new code, but the basic concepts found here still apply.</sup>

<sup>2. Only applies to the legacy sanity checks.</sup>

### Useful issues

* [Setting up VS Code](https://gitgud.io/pregmodfan/fc-pregmod/-/issues/2448)
* [Classes in Game State](https://gitgud.io/pregmodfan/fc-pregmod/-/issues/696)
* [Self executing functions](https://gitgud.io/pregmodfan/fc-pregmod/-/issues/2325)
* [Sort a map](https://gitgud.io/pregmodfan/fc-pregmod/-/issues/2642)
* [How to create a Merge Request (MR)](https://gitgud.io/pregmodfan/fc-pregmod/-/issues/3903)
