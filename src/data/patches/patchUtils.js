
/**
 * Adds release ID to the given object if it is missing
 * @param {object} obj
 */
App.Patch.Utils.ensureReleaseID = (obj) => {
	if (!('releaseID' in obj)) {
		obj.releaseID = 0;
	}
};

/**
 * patches the given object using the given patchType and returns it.
 * if no object is given then it does patching on V and returns nothing.
 * throws an error on failure.
 * @param {App.Patch.Utils.PatchType} patchType
 * @param {number} patchUpTo the releaseID to patch to
 * @param {string} identifier a string that helps identify where an object came from
 * @param {HTMLDivElement} [div=undefined] an optional div to provide visual information
 * @param {object|undefined} [obj] the object to be patched, this object will not be modified
 * @param {App.Patch.Utils.HumanStateLocation|FC.HumanState|"pre"|"post"|"V.customSlave"|"V.huskSlave"|undefined} [extra] location, mother, customSlaveOrder location, or undefined
 */
App.Patch.Utils.patch = (patchType, patchUpTo, identifier, div=undefined, obj, extra) => {
	const DEBUG = false;
	const isV = (obj === undefined);
	if (isV && !["pre", "post"].includes(patchType)) {
		throw new Error(`patchType '${patchType}' cannot be used without an object`);
	} else if (!isV && ["pre", "post"].includes(patchType)) {
		throw new Error(`patchType '${patchType}' can only be used with V`);
	}

	obj = isV ? V : obj;
	div = div ?? App.UI.DOM.makeElement("div");

	App.Patch.Utils.current.div = div;
	App.Patch.Utils.current.identifier = identifier ?? ((typeof extra === "string" ? extra : "no identifier provided"));

	if (patchType === "playerState" && !extra) { extra = "PC"; }

	if (DEBUG) {
		console.log(`\\/ \\/ \\/ Patching of '${patchType}' started for '${identifier}'  \\/ \\/ \\/`);
	}
	const patchVersions = Object.keys(App.Patch.Patches).sort().filter((version) => {
		return (Number(version) <= patchUpTo && Number(version) > obj.releaseID);
	});

	/** @type {number} */
	let patchID;

	for (const ID in patchVersions) {
		try {
			patchID = Number(patchVersions[ID]);
			App.Patch.Utils.current.patch = patchID;
			if (obj.releaseID >= patchID) { continue; }

			// eslint-disable-next-line dot-notation
			const tools = App.Patch.Patches[patchID]["tools"];

			// apply the patch
			if (isV) {
				if (App.Patch.Patches[patchID][patchType]) {
					App.Patch.Utils.current.type = patchType;
					// @ts-ignore expects 3 arguments, even thought that is wrong
					App.Patch.Patches[patchID][patchType](div, tools);
				}
			} else if (extra) {
				if (App.Patch.Patches[patchID].humanState && ["slaveState", "tankSlaveState", "playerState", "childState", "infantState"].includes(patchType)) {
					App.Patch.Utils.current.type = "humanState";
					// @ts-ignore hush now
					App.Patch.Patches[patchID].humanState(div, obj, extra, tools);
				}
				if (App.Patch.Patches[patchID].slaveState && ["tankSlaveState", "childState", "infantState"].includes(patchType)) {
					App.Patch.Utils.current.type = "slaveState";
					// @ts-ignore dear children
					App.Patch.Patches[patchID].slaveState(div, obj, extra, tools);
				}
				if (App.Patch.Patches[patchID][patchType]) {
					App.Patch.Utils.current.type = patchType;
					// @ts-ignore for life is this way
					App.Patch.Patches[patchID][patchType](div, obj, extra, tools);
				}
			} else {
				if (["slaveState", "tankSlaveState", "playerState", "childState", "infantState"].includes(patchType)) {
					throw new Error(`App.Patch.Utils.patch called with patchType '${patchType}', but without location being specified!`);
				}
				if (App.Patch.Patches[patchID][patchType]) {
					App.Patch.Utils.current.type = patchType;
					App.Patch.Patches[patchID][patchType](div, obj, undefined, tools);
				}
			}
			if (patchType !== "pre") {
				obj.releaseID = Number(patchID);
			}
			if (patchType === "post" && V.releaseID === App.Version.release) {
				// bump the save's versions
				V.ver = App.Version.base;
				V.pmodVer = App.Version.pmod;
				V.commitHash = App.Version.commitHash;
			}
		} catch (e) {
			console.error(`/\\ /\\ /\\ Patching of '${patchType}' failed for '${identifier}' when applying patch for releaseID ${patchID} /\\ /\\ /\\`, e);
			throw e;
		}
	}
	if (DEBUG) {
		console.log(`/\\ /\\ /\\ Patching of '${patchType}' finished for '${identifier}' /\\ /\\ /\\`);
	}
};

/**
 * Patches fetuses in wombs if they exist
 * @param {string} identifier a string that helps identify where an actor came from
 * @param {FC.HumanState} actor
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.patchWomb = (identifier, actor, div, patchUpTo=App.Version.release) => {
	if ('womb' in actor && Array.isArray(actor.womb)) {
		for (let f in actor.womb) {
			App.Patch.Utils.ensureReleaseID(actor.womb[f]);
			if (actor.womb[f].releaseID >= patchUpTo) { continue; }
			// patch
			App.Patch.Utils.fetus(`${identifier}.womb[${f}]`, actor.womb[f], actor, div, patchUpTo);
		}
	}
};

/**
 * Patch FC.GameVariables (V). Do not call directly, call `App.Verify.gameVariables()` instead
 * @see App.Verify.gameVariables
 * @param {"pre"|"post"} type
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.gameVariables = (type, div, patchUpTo=App.Version.release) => {
	App.Patch.Utils.ensureReleaseID(V);
	if (V.releaseID >= patchUpTo) { return; }
	// patch
	App.Patch.Utils.patch(type, patchUpTo, "V", div, undefined);
	if (V.releaseID !== App.Version.release) { return; }
	// add nonexistant properties to V from `App.Data.defaultGameStateVariables` and `App.Data.resetOnNGPlus`
	App.Utils.assignMissingDefaults(V, App.Data.defaultGameStateVariables, App.Data.resetOnNGPlus);
};

/**
 * Patch FC.PlayerState objects. Do not call directly, call `App.Verify.playerState()` instead
 * @see App.Verify.playerState
 * @param {string} identifier a string that can be used to locate the given actor (likely "PC" in this case)
 * @param {FC.PlayerState} actor
 * @param {App.Patch.Utils.HumanStateLocation} [location="PC"]
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.playerState = (identifier, actor, location="PC", div, patchUpTo=App.Version.release) => {
	App.Patch.Utils.ensureReleaseID(actor);
	if (actor.releaseID >= patchUpTo) { return; }
	// patch
	App.Patch.Utils.patch("playerState", patchUpTo, identifier, div, actor, location);
	if (actor.releaseID !== App.Version.release) { return; }
	// add missing props
	App.Utils.assignMissingDefaults(actor, basePlayer());
	// TODO:@franklygeorge report extra properties if patch debugging is enabled
};

/**
 * @param {FC.SlaveState} actor
 * @returns {FC.SlaveState}
 */
App.Patch.Utils.slaveTemplate = (actor) => {
	/** @type {"XX"|"XY"} */
	let sex = "XX";
	if (actor.genes && ["XX", "XY"].includes(actor.genes)) {
		sex = /** @type {"XX"|"XY"} */ (actor.genes);
	}
	return GenerateNewSlave(
		sex,
		{
			minAge: actor.visualAge,
			maxAge: actor.visualAge,
			nationality: actor.nationality,
			race: actor.race,
			disableDisability: 1,
		}
	);
};

/**
 * Patch FC.SlaveState objects. Do not call directly, call `App.Verify.slaveState()` instead
 * @see App.Verify.slaveState
 * @param {string} identifier a string that can be used to locate the given actor
 * @param {FC.SlaveState} actor
 * @param {App.Patch.Utils.HumanStateLocation} location
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.slaveState = (identifier, actor, location, div, patchUpTo=App.Version.release) => {
	App.Patch.Utils.ensureReleaseID(actor);
	if (actor.releaseID >= patchUpTo) { return; }
	// patch
	App.Patch.Utils.patch("slaveState", patchUpTo, identifier, div, actor, location);
	if (actor.releaseID !== App.Version.release) { return; }
	// add missing props
	App.Utils.assignMissingDefaults(actor, App.Patch.Utils.slaveTemplate(actor));
	// TODO:@franklygeorge report extra properties if patch debugging is enabled
};

/**
 * Patch FC.TankSlaveState objects. Do not call directly, call `App.Verify.tankSlaveState()` instead
 * @see App.Verify.tankSlaveState
 * @param {string} identifier a string that can be used to locate the given actor
 * @param {FC.TankSlaveState} actor
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.tankSlaveState = (identifier, actor, div, patchUpTo=App.Version.release) => {
	App.Patch.Utils.ensureReleaseID(actor);
	if (actor.releaseID >= patchUpTo) { return; }
	// patch
	App.Patch.Utils.patch("tankSlaveState", patchUpTo, identifier, div, actor, "tank slave pool");
	if (actor.releaseID !== App.Version.release) { return; }
	// add missing props
	App.Utils.assignMissingDefaults(
		actor,
		App.Patch.Utils.slaveTemplate(actor),
		App.Entity.TankSlaveState.toTank(App.Patch.Utils.slaveTemplate(actor))
	);
	// TODO:@franklygeorge report extra properties if patch debugging is enabled
};

/**
 * @param {FC.ChildState} actor
 * @returns {FC.ChildState}
 */
App.Patch.Utils.childTemplate = (actor) => {
	return new App.Entity.ChildState(); // TODO: use generator when/if it exists
};

/**
 * Patch FC.ChildState objects. Do not call directly, call `App.Verify.childState()` instead
 * @see App.Verify.childState
 * @param {string} identifier a string that can be used to locate the given actor
 * @param {FC.ChildState} actor
 * @param {App.Patch.Utils.HumanStateLocation} location
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.childState = (identifier, actor, location, div, patchUpTo=App.Version.release) => {
	App.Patch.Utils.ensureReleaseID(actor);
	if (actor.releaseID >= patchUpTo) { return; }
	// patch
	App.Patch.Utils.patch("childState", patchUpTo, identifier, div, actor, location);
	if (actor.releaseID !== App.Version.release) { return; }
	// add missing props
	App.Utils.assignMissingDefaults(actor, App.Patch.Utils.childTemplate(actor));
	// TODO:@franklygeorge report extra properties if patch debugging is enabled
};

/**
 * @param {FC.InfantState} actor
 * @returns {FC.InfantState}
 */
App.Patch.Utils.infantTemplate = (actor) => {
	return new App.Entity.InfantState(); // TODO: use generator when/if it exists
};

/**
 * Patch FC.InfantState objects. Do not call directly, call `App.Verify.infantState()` instead
 * @see App.Verify.infantState
 * @param {string} identifier a string that can be used to locate the given actor
 * @param {FC.InfantState} actor
 * @param {App.Patch.Utils.HumanStateLocation} [location="infant slave pool"]
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.infantState = (identifier, actor, location="infant slave pool", div, patchUpTo=App.Version.release) => {
	App.Patch.Utils.ensureReleaseID(actor);
	if (actor.releaseID >= patchUpTo) { return; }
	// patch
	App.Patch.Utils.patch("infantState", patchUpTo, identifier, div, actor, location);
	if (actor.releaseID !== App.Version.release) { return; }
	// add missing props
	App.Utils.assignMissingDefaults(actor, App.Patch.Utils.infantTemplate(actor));
	// TODO:@franklygeorge report extra properties if patch debugging is enabled
};

/**
 * @param {FC.Fetus} actor
 * @param {FC.HumanState} mother
 * @returns {FC.Fetus}
 */
App.Patch.Utils.fetusTemplate = (actor, mother) => {
	return new App.Entity.Fetus(
		actor.age,
		actor.fatherID,
		mother,
	);
};

/**
 * Patch FC.Fetus objects. Do not call directly, call `App.Verify.fetus()` instead
 * @see App.Verify.fetus
 * @param {string} identifier a string that can be used to locate the given actor
 * @param {FC.Fetus} actor
 * @param {FC.HumanState} mother
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.fetus = (identifier, actor, mother, div, patchUpTo=App.Version.release) => {
	App.Patch.Utils.ensureReleaseID(actor);
	if (actor.releaseID >= patchUpTo) { return; }
	// patch
	App.Patch.Utils.patch("fetus", patchUpTo, identifier, div, actor, mother);
	if (actor.releaseID !== App.Version.release) { return; }
	// add missing props
	App.Utils.assignMissingDefaults(actor, App.Patch.Utils.fetusTemplate(actor, mother));
	// TODO:@franklygeorge report extra properties if patch debugging is enabled
};

/**
 * Patch FC.CustomOrderSlave objects. Do not call directly, call `App.Verify.customSlaveOrder()` instead
 * @see App.Verify.customSlaveOrder
 * @param {"V.customSlave"|"V.huskSlave"} location
 * @param {FC.CustomSlaveOrder} order
 * @param {HTMLDivElement} [div]
 * @param {number} [patchUpTo=App.Version.release] the releaseID to patch to
 */
App.Patch.Utils.customSlaveOrder = (location, order, div, patchUpTo=App.Version.release) => {
	App.Patch.Utils.ensureReleaseID(order);
	if (order.releaseID >= patchUpTo) { return; }
	// patch
	App.Patch.Utils.patch("customSlaveOrder", patchUpTo, location, div, order, location);
	if (order.releaseID !== App.Version.release) { return; }
	// add missing props
	App.Utils.assignMissingDefaults(order, new App.Entity.CustomSlaveOrder());
	// TODO:@franklygeorge report extra properties if patch debugging is enabled
};

App.Patch.Utils.current = {
	/** @type {number} */
	patch: 0,
	/** @type {HTMLDivElement} */
	div: undefined,
	/** @type {string} */
	identifier: "",
	/** @type {App.Patch.Utils.PatchType|"humanState"} */
	type: undefined,
};

/**
 * @typedef {"pre"|"post"|"slaveState"|"tankSlaveState"|"playerState"|"fetus"|"infantState"|"childState"|"customSlaveOrder"} App.Patch.Utils.PatchType
 */

/**
 * @typedef {"PC"|"main slave pool"|"tank slave pool"|"infant slave pool"|"gene pool"|"detached hostage"|"detached hostage wife"|"detached boomerang"|"detached traitor"|"detached shelter"|"none"} App.Patch.Utils.HumanStateLocation
 */

/**
 * This and App.Verify.Utils.InstructionSet should have the same keys
 * With the exception of the `humanState`, `pre`, and `post` keys which should be missing from `App.Patch.Utils.PatchRecord`
 * and the `gameVariables` key which should be missing from here.
 * @see App.Verify.Utils.InstructionSet
 *
 * @typedef {object} App.Patch.Utils.PatchRecord
 * @property {number} releaseID
 * @property {string} descriptionOfChanges
 *
 * @property {object} [tools] this object is for shared functions
 *
 * @property {(div: HTMLDivElement, tools: object) => void} [pre] used to modify the V object before any other patch is ran
 * @property {(div: HTMLDivElement, tools: object) => void} [post] used to modify the V object after all the other patches have ran
 *
 * @property {(div: HTMLDivElement, human: FC.HumanState, location: App.Patch.Utils.HumanStateLocation, tools: object) => FC.HumanState} [humanState]
 * @property {(div: HTMLDivElement, slave: FC.SlaveState, location: App.Patch.Utils.HumanStateLocation, tools: object) => FC.SlaveState} [slaveState]
 * @property {(div: HTMLDivElement, tank: FC.TankSlaveState, tools: object) => FC.TankSlaveState} [tankSlaveState]
 * @property {(div: HTMLDivElement, player: FC.PlayerState, location: App.Patch.Utils.HumanStateLocation, tools: object) => FC.PlayerState} [playerState]
 *
 * @property {(div: HTMLDivElement, fetus: FC.Fetus, mother: FC.HumanState, tools: object) => FC.Fetus} [fetus]
 * @property {(div: HTMLDivElement, infant: FC.InfantState, tools: object) => FC.InfantState} [infantState]
 * @property {(div: HTMLDivElement, child: FC.ChildState, tools: object) => FC.ChildState} [childState]
 * @property {(div: HTMLDivElement, order: FC.CustomSlaveOrder, location: "V.customSlave"|"V.huskSlave", tools: object) => FC.CustomSlaveOrder} [customSlaveOrder]
 */

// put on a loading screen
// this was copied from endWeekAnim.js and modified
App.Patch.Utils.loadingScreen = (function() {
	let loadLockID = -1;
	let timeoutTime = 1000; // 1 second is plenty as this will never fire while the DOM is busy. So it will only fire after the loading screen is closed or an error has stopped execution
	let timeout;
	/** @type {HTMLDivElement} */
	let infoDiv = null;

	// Create an observer instance.
	const observer = new MutationObserver(function(mutations) {
		startTimeout();
	});

	function makeInfoDiv() {
		infoDiv = document.createElement("div");
		infoDiv.className = "endweek-titleblock";
		const title = document.createElement("div");
		title.className = "endweek-maintitle";
		title.innerHTML = "Applying patches...";
		infoDiv.append(title);
		const sub = document.createElement("div");
		sub.className = "endweek-subtitle";
		sub.id = "patch-message";
		infoDiv.append(sub);

		observer.observe(title, {
			childList:     true,
		});
		observer.observe(sub, {
			childList:     true,
		});
	}

	/**
	 * @param {boolean} dueToTimeout If true then the reason we are adding the link is due to timing out
	 */
	function makeHideLink(dueToTimeout = false) {
		if (infoDiv === null) { return; }
		const link = document.createElement("a");
		link.id = "hide-patch-screen";
		link.innerHTML = dueToTimeout ? "Something may have gone wrong. Click here to continue" : "Hide this screen";
		link.addEventListener("click", () => {
			App.Patch.Utils.loadingScreen.end();
		});
		infoDiv.append(link);
	}

	function stopTimeout() {
		if (timeout) {
			clearTimeout(timeout);
		}
	}

	function startTimeout() {
		stopTimeout();
		const link = document.getElementById("hide-patch-screen");
		if (link && !V.debugMode) {
			link.remove();
		}
		timeout = setTimeout(() => { makeHideLink(true); }, timeoutTime);
	}

	function start() {
		if (loadLockID === -1) {
			makeInfoDiv();
			if (V.debugMode) {
				makeHideLink();
			}
			$("#init-screen").append(infoDiv);
			loadLockID = LoadScreen.lock();
			startTimeout();
		}
	}

	function end() {
		if (loadLockID !== -1) {
			setTimeout(() => {
				LoadScreen.unlock(loadLockID);
				observer.disconnect();
				stopTimeout();
				infoDiv.remove();
				infoDiv = null;
				loadLockID = -1;
			}, 0);
		}
	}

	return {
		start,
		end
	};
})();
