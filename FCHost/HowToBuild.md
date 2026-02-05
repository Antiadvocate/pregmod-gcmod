# How to Build

## BUILD REQUIREMENTS

The below requirements must be met to build this project.

- CMake version 2.8.12.1 or newer
  - Ensure the CMake binary folder is added to your path (e.g. for Windows `C:\Program Files\CMake\bin`)
- Chromium Embedded Framework (CEF) 126.1 or newer
  - Running CMake will automatically download this so there is no need to configure it yourself

### Windows

Visual Studio 2019 (the community edition will work fine) or newer with the "Desktop development with C++" workload installed.

### Linux

Ensure you have a C++ compiler installed. On Debian/Ubuntu this can be installed with:

```bash
sudo apt install build-essential
```

## BUILD STEPS

### Windows

Assuming that Visual Studio 2019/2022 is being used, run the following command:

```bash
# For Visual Studio 2019
# Alternatively run `cmake_vs2019.bat`
cmake -G "Visual Studio 16" .

# For Visual Studio 2022
# Alternatively run `cmake_vs2022.bat`
cmake -G "Visual Studio 17" .
```

Open the generated `fchost.sln` file in Visual Studio. Then build the project by either:

- Selecting **Build > Build Solution** on the menu bar
- Pressing **Ctrl + Shift + B**

### Linux

Run the following commands:

```bash
cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release .
make -j4
```

### Output

The resulting binary and supporting files will be in `FCHost/fchost/Debug` or `FCHost/fchost/Release` depending on the configuration selected in Visual Studio via the drop down found under the Build and Debug tool bar headers.

You should be able to zip up the contents of the Release folder and distribute them to another machine or user if desired. Due to space and privacy concerns it is suggested that you remove `*.html` and `fchost.ilk` files (if present) prior to distribution.
