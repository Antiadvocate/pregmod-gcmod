#!/bin/bash
# Free Cities Basic Compiler - Unix
output=/dev/stdout
name=FC_pregmod

function displayHelp() { # Displays help text
	cat <<HelpText
Usage: compile.sh [OPTION]...

Options:
  Short, Long | Env
  -a, --advanced | $FC_Compile_Advanced Run the advanced compiler
  -d, --dry | $FC_Compile_Dry Do not compile
  -f, --f | $FC_Compile_FinalName Final file name
  -g, --git | $FC_Compile_Add_GitHash Add hash of HEAD to filename
  -h, --help | Show this help text
  -s, --sanity | $FC_Compile_SanityCheck Run sanityCheck
  -q, --quiet | $FC_Compile_Quiet Suppress terminal output
  -t, --themes | $FC_Compile_Themes Generate theme files
  -m, --minify | $FC_Compile_Minify Minify output files
  --ci           CI mode

  exitCode
  0 - advancedCompiler could not run due to an error.
  1 - Unknown argument passed.
  2 - binary found.
  3 - Build failed.
  69 - advancedCompiler could not run due to lack of dependencies.
  
HelpText
}

function echoError() { # Display an error message
	echo -e "\033[0;31m$*\033[0m"
}

function echoMessage() { # Display message
	echo "$1" >"${output}"
}

function compile() { # Compile the HTML file
	TWEEGO_EXE="tweego"; TWEEGO_DIR=devTools/tweeGo
	mkdir -p bin/resources
	export TWEEGO_PATH=$TWEEGO_DIR/storyFormats

	if hash $TWEEGO_EXE 2>/dev/null; then echoMessage "system tweego binary"
	else
		case "$(uname -m)" in
			x86_64 | amd64)
				echoMessage "x64 arch"; arch="64"
				if [ "$(uname -s)" = "Darwin" ]; then MINIFY_EXE="./devTools/minify/minify_darwin_amd64"
				elif [ "$OSTYPE" = "msys" ]; then MINIFY_EXE="./devTools/minify/minify_win_amd64.exe"
				else MINIFY_EXE="./devTools/minify/minify_linux_amd64"
				fi
				;;
			x86 | i[3-6]86)
				echoMessage "x86 arch"; arch="x86"
				;;
			*)
				echoError "No system tweego binary found, and no precompiled binary for your platform available."
				echoError "Please compile tweego and put the executable in PATH."
				exit 2
				;;
		esac
		if [ "$(uname -s)" = "Darwin" ]; then TWEEGO_EXE="./${TWEEGO_DIR}/tweego_osx${arch}"
		elif [ "$OSTYPE" = "msys" ]; then TWEEGO_EXE="./${TWEEGO_DIR}/tweego_win${arch}"
		else TWEEGO_EXE="./${TWEEGO_DIR}/tweego_nix${arch}"
		fi
	fi
	file="bin/${name}.html"

	# Find and insert current commit
	if [[ "$ci" ]]; then COMMIT=$CI_COMMIT_SHORT_SHA
	elif [[ -d .git ]]; then COMMIT=$(git rev-parse --short HEAD)
		if [[ "$usehash" ]]; then file="bin/${name}${COMMIT}.html"; fi
	fi
	if [[ "$minify" || $FC_Compile_Minify ]]; then
		final_file=$file; file="bin/tmp.html"
	fi

	if [[ "$COMMIT" ]]; then
		printf "App.Version.commitHash = '%s';\n" "${COMMIT}" > src/002-config/fc-version.js.commitHash.js
	fi

	devTools/concatFiles.sh js/ '*.js' bin/fc.js
	devTools/concatFiles.sh css/ '*.css' bin/fc.css
	$TWEEGO_EXE -o "$file" --module=bin/fc.js --module=bin/fc.css --head resources/raster/favicon/arcologyVector.html src/ || build_failed="true"
	rm -f bin/fc.js bin/fc.css
	if [ "$build_failed" = "true" ]; then echoError "Build failed."; exit 3; fi

	if [[ "$minify" || $FC_Compile_Minify ]]; then
		if [[ "$MINIFY_EXE" ]]; then
			# SC license is inside an HTML comment, so keep them.
			# eval depends on local variables, so don't modify them (Config, Engine, ...)
			$MINIFY_EXE --html-keep-comments --js-keep-var-names "$file" > "$final_file"
			rm -f "$file"
		else
			echoError "Minification only available on amd64 systems."
			mv "$file" "$final_file"
		fi
		file=$final_file
	fi

	if [[ "$ci" || -d .git ]]; then rm src/002-config/fc-version.js.commitHash.js; fi
	echoMessage "Saved to $file."
}

if [[ "$1" == "" ]]; then echoMessage "For more options see $0 -h."
else
	while [[ "$1" ]]; do # 	Parse options
		case $1 in
			-a | --advanced)
				advanced="true"
				;;
			-d | --dry)
				dry="true"
				;;
			-f | --file)
				name=$2
				shift
				;;
			-g | --git)
				usehash="true"
				;;
			-h | --help)
				displayHelp
				exit
				;;
			-s | --sanity)
				sanity="true"
				;;
			-q | --quiet)
				output=/dev/null
				;;
			-t | --themes)
				themes="true"
				;;
			-m | --minify)
				minify="true"
				;;
			--ci)
				ci="true"
				;;
			*)
				echoError "Unknown argument $1."
				displayHelp
				exit 1
				;;
		esac
		shift
	done
fi

[[ "$sanity" || $FC_Compile_SanityCheck ]] && ./sanityCheck.sh # Run sanity check.
if ! [[ -d .git ]]; then echoMessage "No git repository. Git specific actions disabled."; fi

# Compile
if [[ "$advanced" || $FC_Compile_Advanced ]]; then
	./devTools/scripts/dependencyCheck.sh; exitCode=$?
	if [[ $exitCode -eq 69 || $exitCode -ne 0 ]]; then
		if [[ $exitCode -eq 69 ]]; then echo -n "Dependencies not met"
		elif [[ $exitCode -ne 0 ]]; then echo -n "Dependency check failed unexpectedly"
		fi
		echo ", falling back to the basic mode."
	else node devTools/scripts/advancedCompiler.js
	fi
fi
if [[ "$dry" || $FC_Compile_Dry ]]; then echoMessage "Dry run finished."
else compile && echoMessage "Compilation finished at $(date +%T)."
fi
# Compile themes
if [[ "$themes" || $FC_Compile_Themes ]]; then cd themes/ || exit
	for D in *; do
		if [ -d "${D}" ]; then
			../devTools/concatFiles.sh "${D}"/ '*.css' ../bin/"${D}".css
		fi
	done
	echoMessage "Themes compiled at $(date +%T)"
fi
