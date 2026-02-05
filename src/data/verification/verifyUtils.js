
/**
 * @param {function(FC.SlaveState):boolean} predicate
 * @returns {FC.HumanID} ID of the first matched slave or 0 if no match was found
 */
App.Verify.Utils.findSlaveId = (predicate) => {
	const s = getSlaves().find(predicate);
	return s ? s.key : 0;
};

/**
 * @typedef {object} App.Verify.Utils.ChangeRecord
 * @property {"key"|"value"|"type"} type
 * @property {string} description
 * @property {string} path
 * @property {*} [origVal]
 * @property {*} [newVal]
 */

/**
 * Takes two objects and compares their changes, returning an array with the differences
 * @param {object} obj1 the original object
 * @param {object} obj2 the potentially different object
 * @param {keyof App.Verify.Utils.InstructionSet} setKey
 * @param {string} instructionID
 * @param {string} identifier
 * @returns {App.Verify.Utils.ChangeRecord[]|undefined}
 */
App.Verify.Utils.changeSummary = (obj1, obj2, setKey, instructionID, identifier) => {
	const temp = `When executing 'App.Verify.instructions.${setKey}.${instructionID}': '{path}' {change}`;

	if (Serial.stringify(obj1) === Serial.stringify(obj2)) { return undefined; } // Quick and dirty comparison, don't do work when it isn't needed

	// something has changed, deep comparison needed
	/**
	 * @param {object} obj1
	 * @param {object} obj2
	 * @param {string} [path=""]
	 * @returns {App.Verify.Utils.ChangeRecord[]}
	 */
	const compare = (obj1, obj2, path="") => {
		/** @type {App.Verify.Utils.ChangeRecord[]} */
		let changes = [];

		if (Serial.stringify(obj1) === Serial.stringify(obj2)) { return changes; } // don't do work when it isn't needed

		let keys1 = Object.keys(obj1);
		let keys2 = Object.keys(obj2);

		if (JSON.stringify(keys1) !== JSON.stringify(keys2)) {
			// a key was added or deleted
			// check for deletion
			keys1.forEach((key) => {
				if (!(key in obj2)) {
					// the key was deleted
					changes.push({
						type: "key",
						description: temp.replace("{path}", `${path}.${key}`).replace("{change}", `<${typeof obj1[key]}(${obj1[key]})> was deleted`),
						path: `${path}.${key}`,
					});
				}
			});
			// check for addition
			keys2.forEach((key) => {
				if (!(key in obj1)) {
					changes.push({
						type: "key",
						description: temp.replace("{path}", `${path}.${key}`).replace("{change}", `<${typeof obj2[key]}(${obj2[key]})> was created`),
						path: `${path}.${key}`,
					});
				}
			});
		}

		const sharedKeys = [...new Set(Object.keys(obj1).concat(Object.keys(obj2)).filter((value) => {
			return (value in obj1) && (value in obj2);
		}))];



		// check types and values
		sharedKeys.forEach((key) => {
			if (obj1[key] && typeof obj1[key] !== typeof obj2[key]) {
				// type changed
				changes.push({
					type: "type",
					description: temp.replace("{path}", `${path}.${key}`).replace("{change}", `was changed from type '${typeof obj1[key]}' with value of '${obj1[key]}' to type '${typeof obj2[key]}' with value of '${obj2[key]}'`),
					path: `${path}.${key}`,
				});
			} else if ((!obj1[key] || typeof obj1[key] !== "object") && obj1[key] !== obj2[key]) {
				// value changed
				changes.push({
					type: "value",
					description: temp.replace("{path}", `${path}.${key}`).replace("{change}", `changed from ${obj1[key]} to ${obj2[key]}`),
					path: `${path}.${key}`,
					origVal: obj1[key],
					newVal: obj2[key],
				});
			} else if (typeof obj1[key] === "object") {
				// recurse object
				changes = changes.concat(compare(obj1[key], obj2[key], `${path}.${key}`));
			}
		});
		return changes;
	};

	let changes = compare(obj1, obj2, identifier);

	return (changes.length === 0) ? undefined : changes;
};

/**
 * Used by `App.Patch.applyAll` to detect when an error occurs during verification.
 * Set to false by `App.Patch.applyAll`.
 * set to true by `App.Verify.Utils.verify` on error.
 * @see App.Patch.applyAll
 * @see App.Verify.Utils.verify
 * @type {boolean}
 */
App.Verify.Utils.verificationError = false;

/**
 * verifies the given object using the given set and returns it.
 * if extra === "V" then it does verification on V and returns nothing.
 * if a verification instruction fails an error will be logged to the console and the object will be returned with all of the changes up to the failed verification instruction
 * @param {keyof App.Verify.Utils.InstructionSet} setKey
 * @param {string} identifier a string that helps identify where an object came from
 * @param {object|undefined} [obj] the object to be verified, this object will not be modified
 * @param {*|undefined} [extra] extra data to pass to the verification instruction
 * @param {HTMLDivElement} [div] if provided info will be appended to this div
 * @returns {object|undefined} the verified (and potential changed) object, you should overwrite the original with this
 */
App.Verify.Utils.verify = (setKey, identifier, obj, extra, div) => {
	const DEBUG = false;
	const isV = (extra === "V");
	if (isV && setKey !== "gameVariables") {
		throw new Error(`setKey '${setKey}' cannot be used without an object`);
	} else if (!isV && setKey === "gameVariables") {
		throw new Error(`setKey '${setKey}' can only be used with V`);
	}

	obj = isV ? V : obj;

	const setName = `App.Verify.instructions.${setKey}`;
	if (DEBUG) {
		console.log(`\\/ \\/ \\/ Verification started for '${setName}' on '${identifier}'  \\/ \\/ \\/`);
	}
	let original;
	for (const instructionID in App.Verify.instructions[setKey]) {
		if (DEBUG) {
			console.log(`Executing '${setName}.${instructionID}' on '${identifier}'  \\/ \\/ \\/`);
		}
		// create a copy for change detection and/or rollback
		original = _.cloneDeep(isV ? V : obj);
		try {
			// apply the verification instruction
			if (isV) {
				// @ts-ignore expects 2 arguments, even thought that is wrong
				App.Verify.instructions[setKey][instructionID]();
				// we don't assign to V as it is a constant
			} else if (extra) {
				obj = App.Verify.instructions[setKey][instructionID](obj, extra);
			} else {
				// @ts-ignore expects 2 arguments, even thought that may be wrong
				obj = App.Verify.instructions[setKey][instructionID](obj);
			}
			if (obj.releaseID !== original.releaseID) {
				throw new Error(`releaseID was changed from '${original.releaseID}' to '${obj.releaseID}'. This is not allowed!`);
			}
		} catch (e) {
			App.Verify.Utils.verificationError = true;
			const message = `Verification failed when executing '${setName}.${instructionID}' on '${identifier}'`;
			if (div) {
				$(div).append(`<div><span class="error">${message}</span></div>`);
				div.append(App.UI.DOM.formatException(e));
			} else {
				console.error(`/\\ /\\ /\\ ${message} /\\ /\\ /\\`, e);
			}
			if (isV) {
				// rollback the game state
				State.restore();
				// and return nothing
				return;
			} else {
				// rollback to the last successful verification and return it
				return original;
			}
		}

		// report changes if V.logVerificationChanges is set to 1
		if (getProp(V, "reportVerificationChanges", 0) === 1) {
			const changes = App.Verify.Utils.changeSummary(original, obj, setKey, instructionID, identifier);
			if (changes) {
				changes.forEach((record) => {
					if (record.path === "V.IDNumber") {
						return;
					}
					let level = "error";
					if (
						record.description.includes(`'App.Verify.instructions.gameVariables.genePool'`) ||
						record.type === "key"
					) {
						// The genePool verification is one of the (maybe the only) times that properties should actually be deleted/created
						level = "orange";
					}
					if (["key", "type"].includes(record.type)) {
						if (div) {
							$(div).append(`<div><span class="${level}">${record.description}</span></div>`);
						} else if (level === "error") {
							console.error(record.description);
						} else {
							console.warn(record.description);
						}
					} else {
						if (div) {
							$(div).append(`<div><span>${record.description}</span></div>`);
						} else {
							console.warn(record.description);
							console.warn("original val:", record.origVal, "new val:", record.newVal);
						}
					}
				});
			}
		}
	}
	if (DEBUG) {
		console.log(`/\\ /\\ /\\ Verification finished for '${setName}' on '${identifier}' /\\ /\\ /\\`);
	}
	if (isV) {
		return;
	} else {
		return obj;
	}
};

/**
 * @typedef {(actor: FC.HumanState, location: App.Patch.Utils.HumanStateLocation) => FC.HumanState} App.Verify.Utils.FunctionHumanState
 */

/**
 * @typedef {() => void} App.Verify.Utils.FunctionGameVariables
 */

/**
 * @typedef {{[key: string]: App.Verify.Utils.FunctionGameVariables}} App.Verify.Utils.GameVariablesInstructionDef
 */

/**
 * @typedef {(actor: FC.SlaveState, location: App.Patch.Utils.HumanStateLocation) => FC.SlaveState} App.Verify.Utils.FunctionSlaveState
 */

/**
 * @typedef {{[key: string]: App.Verify.Utils.FunctionSlaveState}} App.Verify.Utils.SlaveStateInstructionDef
 */

/**
 * @typedef {(actor: FC.TankSlaveState) => FC.TankSlaveState} App.Verify.Utils.FunctionTankSlaveState
 */

/**
 * @typedef {{[key: string]: App.Verify.Utils.FunctionTankSlaveState}} App.Verify.Utils.TankSlaveStateInstructionDef
 */

/**
 * @typedef {(actor: FC.PlayerState) => FC.PlayerState} App.Verify.Utils.FunctionPlayerState
 */

/**
 * @typedef {{[key: string]: App.Verify.Utils.FunctionPlayerState}} App.Verify.Utils.PlayerStateInstructionDef
 */

/**
 * @typedef {(actor: FC.ChildState) => FC.ChildState} App.Verify.Utils.FunctionChildState
 */

/**
 * @typedef {{[key: string]: App.Verify.Utils.FunctionChildState}} App.Verify.Utils.ChildStateInstructionDef
 */

/**
 * @typedef {(actor: FC.InfantState) => FC.InfantState} App.Verify.Utils.FunctionInfantState
 */

/**
 * @typedef {{[key: string]: App.Verify.Utils.FunctionInfantState}} App.Verify.Utils.InfantStateInstructionDef
 */

/**
 * @typedef {(actor: FC.Fetus, mother: FC.HumanState) => FC.Fetus} App.Verify.Utils.FunctionFetus
 */

/**
 * @typedef {{[key: string]: App.Verify.Utils.FunctionFetus}} App.Verify.Utils.FetusInstructionDef
 */

/**
 * @typedef {(order: FC.CustomSlaveOrder) => FC.CustomSlaveOrder} App.Verify.Utils.FunctionCustomSlaveOrder
 */

/**
 * @typedef {{[key: string]: App.Verify.Utils.FunctionCustomSlaveOrder}} App.Verify.Utils.CustomSlaveOrderInstructionDef
 */

/**
 * This and App.Patch.Utils.PatchRecord should have the same keys.
 * With the exception of the `humanState`, `pre`, and `post` keys which should be missing from here
 * and the `gameVariables` key which should be missing from `App.Patch.Utils.PatchRecord`.
 * @see App.Patch.Utils.PatchRecord
 *
 * @typedef {object} App.Verify.Utils.InstructionSet
 * @property {App.Verify.Utils.GameVariablesInstructionDef} gameVariables
 * @property {App.Verify.Utils.SlaveStateInstructionDef} slaveState
 * @property {App.Verify.Utils.TankSlaveStateInstructionDef} tankSlaveState
 * @property {App.Verify.Utils.PlayerStateInstructionDef} playerState
 * @property {App.Verify.Utils.ChildStateInstructionDef} childState
 * @property {App.Verify.Utils.InfantStateInstructionDef} infantState
 * @property {App.Verify.Utils.FetusInstructionDef} fetus
 * @property {App.Verify.Utils.CustomSlaveOrderInstructionDef} customSlaveOrder
 */
