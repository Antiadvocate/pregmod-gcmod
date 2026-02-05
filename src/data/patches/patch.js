// cSpell:words divs

/**
 * Need to know how to apply a patch? Go to the line with `====== How to apply a patch ======`.
 * Need to create a patch for a new feature? Then keep reading.
 * Need to create a patch to make an old save load correctly? Then keep reading and also read the contents of `====== How to create a legacy patch ======`.
 *
 * Each patch should exist in its own file in `/src/data/patches/releases/`.
 * The naming scheme is: `[releaseID]_[some name that describes what this patch does].js`.
 * With the exception of the underdash the naming scheme is the same as the rest of FC's files.
 *
 * Each patch file should have a single call to `App.Patch.register()` with a `App.Patch.Utils.PatchRecord` object as the only argument.
 * See {@link App.Patch.register} and {@link App.Patch.Utils.PatchRecord}
 *
 * Each function defined by `App.Patch.Utils.PatchRecord` is optional, only use the ones you need.
 * The definitions of each function and what it is used for can be found below starting on the line with `====== Functions and their use ======`.
 * The `releaseID` and `descriptionOfChanges` properties listed in `App.Patch.Utils.PatchRecord` are not optional.
 * 'releaseID` should be `App.Version.release` + 1 and should be the same number as in the patches filename.
 * `App.Version.release` is defined on line ~13 of `/src/002-config/fc-version.js`
 * There can only be one patch for each `releaseID`.
 * `descriptionOfChanges` should be a string that describes what was changed to cause this patch to be needed.
 *
 * There are some helpful functions located in `/src/data/dataUtils.js` and under {@link App.Utils}.
 * You should use {@link App.Patch.log}() to report what you are doing in each patch function.
 *
 * ====== Patch functions and their use ======
 *
 * `gameVariables` is for anything on the save variable (`V`) that isn't covered by another function.
 * @see V
 * `humanState` is for anything that needs to be modified for any object that is based off `App.Entity.HumanState`.
 * @see App.Entity.HumanState
 * `slaveState` is for anything that needs to be modified for any object that is based off `App.Entity.SlaveState`.
 * @see App.Entity.SlaveState
 * `tankSlaveState` is for anything that needs to be modified for any object that is based off `App.Entity.TankSlaveState`.
 * @see App.Entity.TankSlaveState
 * `playerState` is for anything that needs to be modified for any object that is based off `App.Entity.PlayerState`.
 * @see App.Entity.PlayerState
 *
 * `fetus` is for anything that needs to be modified for any object (babies in the womb) that is based off `App.Entity.Fetus`.
 * @see App.Entity.Fetus
 * `infantState` is for anything that needs to be modified for any object that is based off `App.Entity.InfantState`.
 * @see App.Entity.InfantState
 * `childState` is for anything that needs to be modified for any object that is based off `App.Entity.ChildState`.
 * @see App.Entity.ChildState
 *
 * ====== How to create a legacy patch ======
 *
 * Legacy patches are mostly the same as normal patches except for a few differences.
 *
 * Legacy patches should never assume that a property exists, likewise they should never assume that a property doesn't exist.
 * The [Nullish coalescing operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
 * And [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
 * are both helpful in this regard.
 * So is `App.Utils.objectExistsAndHasKeys()` when working with simple/flat objects.
 * @see App.Utils.objectExistsAndHasKeys
 *
 * The naming scheme for legacy patches is: `legacy_[save's releaseID].js`.
 * The releaseID of a legacy patch should be the save's releaseID +1.
 *
 * If a legacy patch already exists for the save's releaseID, but the save still won't load.
 * Then add the code needed to make the save load to the bottom of the existing patch.
 * Make sure not to modify the existing code in the patch as that code is what was required to get other peoples saves to load
 *
 * The first legacy patch that has been written is located at `/src/data/patches/releases/legacy_1055.js` and can serve as a guide.
 *
 * ====== How to apply a patch ======
 *
 * If you need to apply it to everything (loading an old save for example) then call `App.Patch.applyAll()`.
 * @see App.Patch.applyAll
 *
 * If you only need to patch a specific data structure then you should also do data verification.
 * Refer to the verification instructions at the top of `/src/data/verification/zVerify.js`
 * for the correct data verification function(s). Data verification does patching as needed.
 */

// TODO:@franklygeorge add a way to force apply a list of patch versions and types in order
// TODO:@franklygeorge move the "Open All Reports" code from App.EndWeek.slaveAssignmentReport to App.UI.DOM and then utilize it in the patch system

/**
 * registers a patch to the database
 * @param {App.Patch.Utils.PatchRecord} patchRecord
 */
App.Patch.register = (patchRecord) => {
	if (patchRecord.releaseID === 2000) {
		throw new Error("releaseID 2000 cannot be used, skip it and use 2001 instead");
	} else if (Object.keys(App.Patch.Patches).includes(String(patchRecord.releaseID))) {
		throw new Error(`There can be only one patch for each releaseID and a patch already exists for releaseID ${patchRecord.releaseID}.`);
	} else if (patchRecord.releaseID > App.Version.release) {
		throw new Error(`Patch exists for release ${patchRecord.releaseID}, but App.Version.release === ${App.Version.release}. Did you forget to increment the release in 'src/002-config/fc-version.js'?`);
	} else if (patchRecord.descriptionOfChanges.trim() === "") {
		console.warn(`patchRecord for releaseID ${patchRecord.releaseID} is missing its description`);
	}
	App.Patch.Patches[patchRecord.releaseID] = patchRecord;
};

/**
 * Visually displays a message and also prints it to the console
 * @param {string} message
 * @param {"info"|"warn"|"error"} type
 */
App.Patch.log = (message, type="info") => {
	const locator = `Patch ${App.Patch.Utils.current.patch}["${App.Patch.Utils.current.type}"](${App.Patch.Utils.current.identifier})`;
	const eTemplate = `<span class="error">${locator}: ${message}</span>`;
	const wTemplate = `<span class="orange">${locator}: ${message}</span>`;
	const iTemplate = `<span>${locator}: ${message}</span>`;
	const div = App.UI.DOM.makeElement("div");
	if (type === "info") {
		// console.log(message);
		div.innerHTML = iTemplate;
	} else if (type === "error") {
		// console.error(message);
		div.innerHTML += eTemplate;
	} else if (type === "warn") {
		// console.warn(message);
		div.innerHTML += wTemplate;
	}
	App.Patch.Utils.current.div.append(div);
};

/**
 * Applies all available patches in order.
 * Skipping patches that have releaseID's that are less than the current releaseID
 * Updates the releaseID to match the last patch applied
 * @returns {DocumentFragment} a document fragment with the results of the patching
 */
App.Patch.applyAll = () => {
	// create a loading screen
	App.Patch.Utils.loadingScreen.start();

	// create our document fragment and our main divs
	const frag = document.createDocumentFragment();
	const head = App.UI.DOM.appendNewElement("div", frag);
	head.id = "patch-header";
	const cDiv = App.UI.DOM.appendNewElement("div", frag);
	cDiv.id = "patch-content";

	// get all available patches in reverse order so that when we call .pop we will get the smallest patch version
	let patchVersions = Object.keys(App.Patch.Patches).sort((a, b)=> +b - +a);

	// make sure a patch exists for App.Version.release
	if (Number(patchVersions[0]) < App.Version.release) {
		App.Patch.Utils.loadingScreen.end();
		throw new Error(`No patch exists for releaseID ${App.Version.release}! Did you make a patch? Instructions are in '/src/data/patches/patch.js'.`);
	}

	// remove all unneeded patch versions from the array
	patchVersions = patchVersions.filter((patchID) => { return Number(patchID) > V.releaseID; });
	// get the amount of the patches we are going to apply for later use
	const patchCount = patchVersions.length;

	// We use setTimeout here to give the App.Patch.applyAll() function time to return frag and SugarCube the time to change passages
	// The execution flow skips this setTimeout call temporarily
	setTimeout((() => {
		// get the elements we created earlier
		let f = document.getElementById("patch-content");
		let header = document.getElementById("patch-header");
		// this element was created by the App.Patch.Utils.loadingScreen.start() call
		let message = document.getElementById("patch-message");

		let verificationStart;

		/** This is called by App.Verify.everything() when it is done */
		const finalize = () => {
			if (getProp(V, "reportVerificationChanges", 0) === 0) {
				App.Patch.Utils.current.div.append(App.UI.DOM.makeElement('div', "Change detection was skipped because it is disabled"));
			}

			// report the time taken and the amount of content added to current div
			const verificationTime = (new Date().getTime() - verificationStart).toLocaleString();
			const divLength = App.Patch.Utils.current.div.childNodes.length;

			f.append(App.UI.DOM.accordion(
				`Cleanup and Verification (${divLength}) (${verificationTime}ms)`,
				App.Patch.Utils.current.div,
				(divLength === 0 || getProp(V, "useAccordion", 1) > 0)
			));

			// handle App.Verify.Utils.verificationError
			if (App.Verify.Utils.verificationError) {
				header.innerHTML += `<span class="error">Verification failed!</span>`;
				console.error("Verification failed!");
				State.restore(); // restore the state to before patching
			} else {
				if (patchCount !== 0) {
					header.innerHTML += `<span class="green">${patchCount} patches applied! You are on release ${V.releaseID}</span>`;
				} else {
					header.innerHTML += `<span class="green">No patches needed to be applied! You are on release ${V.releaseID}</span>`;
				}
				App.UI.DOM.appendNewElement("h3", f, "Done!");
				console.log("Done!");
			}

			header.innerHTML += `<br><span>See below for details</span><hr>`;

			// update the sidebar to remove any potential errors that were cause by being on an outdated save
			App.Utils.scheduleSidebarRefresh();

			// remove the loading screen so the user can see the results
			App.Patch.Utils.loadingScreen.end();

			App.Patch.Utils.current.div = undefined;
			// this is where the execution actually stops for the patching system
		};

		/**
		 * This function is called later in the code.
		 * It does verification and final cleanup after the patching is done
		 * @returns {undefined}
		 */
		const verifyAndCleanup = () => {
			// make a new div
			App.Patch.Utils.current.div = App.UI.DOM.makeElement("div");

			// Cleanup
			console.log(`Cleanup`);

			V.NaNArray = findNaN(); // reset NaNArray
			App.UI.SlaveSummary.settingsChanged(); // let slave summary know that settings may have changed

			// verification
			console.log(`Verification`);

			App.Verify.Utils.verificationError = false;
			try {
				verificationStart = new Date().getTime();
				// does the actual verification
				App.Verify.everything(App.Patch.Utils.current.div, finalize);
			} catch (e) {
				header.innerHTML += `<span class="error">Verification failed!</span>`;
				console.error("Verification failed!");
				App.Patch.Utils.current.div.append(App.UI.DOM.formatException(e));
				State.restore(); // restore the state to before patching
				header.innerHTML += `<br><span>See below for details</span><hr>`;
				// close the loading screen so that the user can see the error
				App.Patch.Utils.loadingScreen.end();
				return;
			}
		};

		const patchingStart = new Date().getTime();
		let i;

		/**
		 * This function is called later in the code.
		 * It applies a single patch.
		 * If there are more patches to apply it calls itself, if not then it calls verifyAndCleanup().
		 * @returns {undefined}
		 */
		const applyPatch = () => {
			const patchID = Number(patchVersions.pop());

			/** @type {{identifier: string, actor: FC.HumanState, div: HTMLDivElement}[]} */
			const wombs = [];

			const patchStart = new Date().getTime();

			const writePatchDiv = () => {
				// report the time taken and the amount of content added to current div
				const patchTime = (new Date().getTime() - patchStart).toLocaleString();
				const divLength = App.Patch.Utils.current.div.childNodes.length;

				f.append(App.UI.DOM.accordion(
					`Patch ${patchID} (${divLength}) (${patchTime}ms)`,
					App.Patch.Utils.current.div,
					(divLength === 0 || getProp(V, "useAccordion", 1) > 0)
				));
			};

			// patch
			try {
				// make a new div
				App.Patch.Utils.current.div = App.UI.DOM.makeElement("div");

				// Pre patch; This should always be the first patch
				App.Patch.Utils.gameVariables("pre", App.Patch.Utils.current.div, patchID);

				// PlayerState
				App.Patch.Utils.playerState("PC", V.PC, "PC", App.Patch.Utils.current.div, patchID);
				wombs.push({identifier: `V.PC`, actor: V.PC, div: App.Patch.Utils.current.div});

				// SlaveState
				for (const [ID, slave] of getSlaves(true)) {
					App.Patch.Utils.slaveState(
						`getSlave(${ID})`, slave, "main slave pool", App.Patch.Utils.current.div, patchID
					);
					wombs.push({identifier: `getSlave(${ID})`, actor: slave, div: App.Patch.Utils.current.div});
				}

				const hostage = V.detached?.hostage?.actor ?? getProp(V, "hostage");
				if (hostage) {
					App.Patch.Utils.slaveState(
						`getHostage().actor`, hostage, "detached hostage", App.Patch.Utils.current.div, patchID
					);
					wombs.push({identifier: `getHostage().actor`, actor: hostage, div: App.Patch.Utils.current.div});
				}

				const hostageWife = V.detached?.hostage?.wife ?? getProp(V, "hostageWife");
				if (hostageWife) {
					App.Patch.Utils.slaveState(
						`getHostage().wife`, hostageWife, "detached hostage wife", App.Patch.Utils.current.div, patchID
					);
					wombs.push({identifier: `getHostage().wife`, actor: hostageWife, div: App.Patch.Utils.current.div});
				}

				const boomerang = V.detached?.boomerang?.actor ?? getProp(V, "boomerangSlave");
				if (boomerang) {
					App.Patch.Utils.slaveState(
						`getBoomerang().actor`, boomerang, "detached boomerang",
						App.Patch.Utils.current.div, patchID
					);
					wombs.push({identifier: `getBoomerang().actor`, actor: boomerang, div: App.Patch.Utils.current.div});
				}

				const shelterSlave = V.detached?.shelter?.actor ?? getProp(V, "shelterSlave");
				if (shelterSlave) {
					App.Patch.Utils.slaveState(
						`getShelterSlave().actor`, shelterSlave, "detached shelter",
						App.Patch.Utils.current.div, patchID
					);
					wombs.push({identifier: `getShelterSlave().actor`, actor: shelterSlave, div: App.Patch.Utils.current.div});
				}

				const traitor = V.detached?.traitor?.actor ?? getProp(V, "traitor");
				if (traitor) {
					App.Patch.Utils.slaveState(
						`getTraitor().actor`, traitor, "detached traitor", App.Patch.Utils.current.div, patchID
					);
					wombs.push({identifier: `getTraitor().actor`, actor: traitor, div: App.Patch.Utils.current.div});
				}

				// TankSlaveState
				const tankSlaves = getTankSlaves(true);
				for (const [ID, tankSlave] of tankSlaves) {
					App.Patch.Utils.tankSlaveState(
						`getTankSlave(${ID})`, tankSlave, App.Patch.Utils.current.div, patchID
					);
					wombs.push({
						identifier: `getTankSlave(${ID})`,
						actor: tankSlave,
						div: App.Patch.Utils.current.div
					});
				}

				// InfantState
				const infants = getInfants(true);
				for (const [ID, infant] of infants) {
					App.Patch.Utils.infantState(
						`getInfant(${ID})`, infant, "infant slave pool", App.Patch.Utils.current.div, patchID
					);
					wombs.push({identifier: `getInfant(${ID})`, actor: infant, div: App.Patch.Utils.current.div}); // shouldn't be needed, but InfantStates are HumanStates so might as well make sure it is right
				}

				// ChildState
				// TODO:@franklygeorge this is waiting on FC.ChildState to be implemented
				const children = [];
				for (i in children) {
					App.Patch.Utils.childState(
						// @ts-ignore
						`children[${i}]`, children[i], "children", App.Patch.Utils.current.div, patchID
					);
					wombs.push({identifier: `children[${i}]`, actor: children[i], div: App.Patch.Utils.current.div});
				}

				// Wombs/Fetuses; This should always be below all the HumanState patches
				wombs.forEach((womb) => {
					App.Patch.Utils.patchWomb(womb.identifier, womb.actor, womb.div, patchID);
				});

				// CustomOrderSlave
				if (V.customSlave) {
					App.Patch.Utils.customSlaveOrder(
						"V.customSlave", V.customSlave, App.Patch.Utils.current.div, patchID
					);
				}
				if (V.huskSlave) {
					App.Patch.Utils.customSlaveOrder(
						"V.huskSlave", V.huskSlave, App.Patch.Utils.current.div, patchID
					);
				}

				// Post patch; This should always be the last patch
				App.Patch.Utils.gameVariables("post", App.Patch.Utils.current.div, patchID);
			} catch (e) {
				header.innerHTML += `<span class="error">Patching Failed when applying patch ${App.Patch.Utils.current.patch}["${App.Patch.Utils.current.type}"] to ${App.Patch.Utils.current.identifier}!</span>`;
				App.Patch.Utils.current.div.append(App.UI.DOM.formatException(e));
				State.restore(); // restore the state to before patching
				header.innerHTML += `<br><span>See below for details</span><hr>`;
				// close the loading screen so that the user can see the error
				App.Patch.Utils.loadingScreen.end();
				writePatchDiv(); // write out the current patch div so the error can be read
				return;
			}

			writePatchDiv();

			// continue
			if (patchVersions.length !== 0) {
				// let the user know what we are doing, by changing the loading screen message
				message.innerHTML = `Applying Patch ${patchVersions.last()}...`;
				// give the DOM time to update and then call applyPatch() again
				setTimeout(applyPatch, 0);
			} else {
				const patchingTime = (new Date().getTime() - patchingStart).toLocaleString();
				f.append(App.UI.DOM.accordion(
					`Patching results (${patchCount} patches) (${patchingTime}ms)`,
					App.UI.DOM.makeElement('div', `Patching completed successfully, applying ${patchCount} patches in ${patchingTime}ms`),
					true,
				));
				// let the user know what we are doing, by changing the loading screen message
				message.innerHTML = `Cleaning up and verifying...`;
				// give the DOM time to update and then call verifyAndCleanup()
				setTimeout(verifyAndCleanup, 0);
			}
		};

		// start the patching
		if (patchVersions.length !== 0) {
			// let the user know what we are doing, by changing the loading screen message
			message.innerHTML = `Applying Patch ${patchVersions.last()}...`;
			// give the DOM time to update and then call applyPatch()
			setTimeout(applyPatch, 0);
		} else {
			// we didn't have any patches to apply but we still run verification
			App.UI.DOM.appendNewElement('div', f, `No patches needed to be applied`);
			// let the user know what we are doing, by changing the loading screen message
			message.innerHTML = `Cleaning up and verifying...`;
			// give the DOM time to update and then call verifyAndCleanup()
			setTimeout(verifyAndCleanup, 0);
		}
	}), 0);

	// return the empty document
	// the first setTimeout above will execute soon after the passage change happens
	return frag;
};
