# The workflow for updating the SugarCube format.js file

sugarcube:
	echo "Compiling SugarCube"
	(cd submodules/sugarcube-2/ && node build.js -n -b 2)
	mv submodules/sugarcube-2/build/twine2/sugarcube-2/format.js devTools/tweeGo/storyFormats/sugarcube-2/format.js
	(cd submodules/sugarcube-2/ && git diff master fc-rebased > sugarcube-fc-changes.patch)
	mv submodules/sugarcube-2/sugarcube-fc-changes.patch devNotes/"sugarcube stuff"/sugarcube-fc-changes.patch

.PHONY: sugarcube
