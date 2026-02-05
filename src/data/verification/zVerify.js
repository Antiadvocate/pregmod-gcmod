/**
 * This file must stay below all the other verification files
 * Need to know how to use verification? Go to the line with `====== How to use verification ======`.
 * Need to update/add verification? Then keep reading.
 *
 * Some things to note:
 *  - Verification should not delete, rename, or add any properties.
 *  - Verification should not change the type of a property.
 *  - Verification can and should change the value of a property if needed.
 *  - If a property needs deleted, renamed, added, or to have its type changed that needs to be handled in a patch.
 *  - Instructions for creating a patch can be found at the top of `/src/data/patches/patch.js`.
 *
 * Each data structure type defined in `App.Verify.instructions` has its own file in `/src/data/verification/`.
 * Most likely the thing you want to verify already has a verification function defined in `App.Verify.instructions`.
 * These verification functions are defined in the data structure type's file below the line with `Put your verification functions below this line`.
 * @see App.Verify.instructions
 * If so then just make your changes to the existing verification function.
 * If not then continue below.
 *
 * The easiest way to create a new verification function is to copy an existing one and rename it.
 * Lets say we named our new function `App.Verify.I.slaveBrain`.
 * Now we want to add our function to the correct instruction set.
 * In this example it would be `App.Verify.instructions.slaveState`.
 * The key is not very important, but in most cases it should match the last part of the function.
 * So in this case `slaveBrain` would be our key.
 * So we would add a line that had the contents `slaveBrain: App.Verify.I.slaveBrain` to `App.Verify.instructions.slaveState`.
 * The location we add this line to is potentally important as every function before ours in the set will be executed first.
 * For example: `App.Verify.I.slaveBelly()` has a call to `SetBellySize()` which checks pregnancy and as such should and does run after `App.Verify.I.slavePregnancy()`
 *
 * If you are verifying a data structure that extends another data structure then you also call the verification functions for the extended data structure.
 * For example:
 * TankSlaveState extends SlaveState which extends HumanState.
 * If you look at `App.Verify.I.tankSlaveAge()` you will see that it doesn't do anything but call `App.Verify.I.slaveAge()`.
 * And the last thing `App.Verify.I.slaveAge()` does is call `App.Verify.I.humanAge()` which does most of the heavy lifting.
 * @see App.Verify.I.tankSlaveAge
 * @see App.Verify.I.slaveAge
 * @see App.Verify.I.humanAge
 *
 * ====== How to use verification ======
 * In most cases you can run full verification for your object.
 * Each of the functions listed below catches any errors thrown by the validation instructions and returns the object in the state it was right before the error.
 * The validation instructions themselves are stored under `App.Verify.I` and can be called directly, but they will not catch their own errors.
 * Which functions you use will depend on what you want to accomplish.
 *
 * FC.GameVariables (V): call `App.Verify.everything()` or (ideally) use a specific function under `App.Verify.I`.
 * `App.Verify.everything()` will also apply all of the other verification functions listed below.
 * You should only use `App.Verify.everything()` if you truly need to verify everything as it is resource intensive.
 * @see App.Verify.everything
 *
 * FC.PlayerState: call `App.Verify.playerState()`.
 * @see App.Verify.playerState
 *
 * FC.SlaveState: call `App.Verify.slaveState()`.
 * @see App.Verify.slaveState
 *
 * FC.TankSlaveState: call `App.Verify.tankSlaveState()`.
 * @see App.Verify.tankSlaveState
 *
 * FC.ChildState: call `App.Verify.childState()`.
 * @see App.Verify.childState
 *
 * FC.InfantState: call `App.Verify.infantState()`.
 * @see App.Verify.infantState
 *
 * FC.HumanState.womb: call `App.Verify.womb()`
 * The functions above call this as needed
 * @see App.Verify.womb
 *
 * FC.Fetus: call `App.Verify.fetus()`.
 * `App.Verify.womb()` calls this
 * @see App.Verify.fetus
 */


/**
 * Instruction sets may be executed independent of each other. Do not depend on `gameVariables` being executed before `humanState` for example.
 * The instructions in each set will be executed in the order they are listed.
 * Each instruction set has its own file in `/src/data/verification/` that you should store its functions in.
 * @type {App.Verify.Utils.InstructionSet}
 */
App.Verify.instructions = {
	gameVariables: {
		genePool: App.Verify.I.genePool,
		economy: App.Verify.I.economy,
		facilityNames: App.Verify.I.facilityNames,
		facilityBrothel: App.Verify.I.facilityBrothel,
		facilityDairy: App.Verify.I.facilityDairy,
		facilityFarmyard: App.Verify.I.facilityFarmyard,
		facilityClub: App.Verify.I.facilityClub,
		facilityServantsQuarters: App.Verify.I.facilityServantsQuarters,
		facilitySchoolroom: App.Verify.I.facilitySchoolroom,
		facilitySpa: App.Verify.I.facilitySpa,
		facilityClinic: App.Verify.I.facilityClinic,
		facilityArcade: App.Verify.I.facilityArcade,
		facilityCellblock: App.Verify.I.facilityCellblock,
		facilityMasterSuite: App.Verify.I.facilityMasterSuite,
		facilityHeadGirlSuite: App.Verify.I.facilityHeadGirlSuite,
		facilityNursery: App.Verify.I.facilityNursery,
		futureSocieties: App.Verify.I.futureSocieties,
		arcologies: App.Verify.I.arcologies,
		mods: App.Verify.I.mods,
		pit: App.Verify.I.pit,
		jobIDMap: App.Verify.I.jobIDMap,
	},
	slaveState: {
		slaveAge: App.Verify.I.slaveAge,
		slaveHealth: App.Verify.I.slaveHealth,
		slavePhysical: App.Verify.I.slavePhysical,
		slaveSkin: App.Verify.I.slaveSkin,
		slaveFace: App.Verify.I.slaveFace,
		slaveHair: App.Verify.I.slaveHair,
		slaveBoobs: App.Verify.I.slaveBoobs,
		slaveButt: App.Verify.I.slaveButt,
		slaveGeneticQuirks: App.Verify.I.slaveGeneticQuirks,
		slavePregnancy: App.Verify.I.slavePregnancy,
		slaveBelly: App.Verify.I.slaveBelly,
		slaveGenitalia: App.Verify.I.slaveGenitalia,
		slaveImplants: App.Verify.I.slaveImplants,
		slavePiercings: App.Verify.I.slavePiercings,
		slaveTattoo: App.Verify.I.slaveTattoo,
		slaveCosmetics: App.Verify.I.slaveCosmetics,
		slaveDiet: App.Verify.I.slaveDiet,
		slavePorn: App.Verify.I.slavePorn,
		slaveRelation: App.Verify.I.slaveRelation,
		slaveSkill: App.Verify.I.slaveSkill,
		slaveStat: App.Verify.I.slaveStat,
		slavePreferences: App.Verify.I.slavePreferences,
		slaveRules: App.Verify.I.slaveRules,
		slaveMisc: App.Verify.I.slaveMisc,
	},
	tankSlaveState: {
		tankSlaveIncubatorSettings: App.Verify.I.tankSlaveIncubatorSettings,
		tankSlaveAge: App.Verify.I.tankSlaveAge,
		tankSlaveHealth: App.Verify.I.tankSlaveHealth,
		tankSlavePhysical: App.Verify.I.tankSlavePhysical,
		tankSlaveSkin: App.Verify.I.tankSlaveSkin,
		tankSlaveFace: App.Verify.I.tankSlaveFace,
		tankSlaveHair: App.Verify.I.tankSlaveHair,
		tankSlaveBoobs: App.Verify.I.tankSlaveBoobs,
		tankSlaveButt: App.Verify.I.tankSlaveButt,
		tankSlaveGeneticQuirks: App.Verify.I.tankSlaveGeneticQuirks,
		tankSlavePregnancy: App.Verify.I.tankSlavePregnancy,
		tankSlaveBelly: App.Verify.I.tankSlaveBelly,
		tankSlaveGenitalia: App.Verify.I.tankSlaveGenitalia,
		tankSlaveImplants: App.Verify.I.tankSlaveImplants,
		tankSlavePiercings: App.Verify.I.tankSlavePiercings,
		tankSlaveTattoo: App.Verify.I.tankSlaveTattoo,
		tankSlaveCosmetics: App.Verify.I.tankSlaveCosmetics,
		tankSlaveDiet: App.Verify.I.tankSlaveDiet,
		tankSlavePorn: App.Verify.I.tankSlavePorn,
		tankSlaveRelation: App.Verify.I.tankSlaveRelation,
		tankSlaveSkill: App.Verify.I.tankSlaveSkill,
		tankSlaveStat: App.Verify.I.tankSlaveStat,
		tankSlavePreferences: App.Verify.I.tankSlavePreferences,
		tankSlaveRules: App.Verify.I.tankSlaveRules,
		tankSlaveMisc: App.Verify.I.tankSlaveMisc,
	},
	playerState: {
		playerAge: App.Verify.I.playerAge,
		playerHealth: App.Verify.I.playerHealth,
		playerPhysical: App.Verify.I.playerPhysical,
		playerSkin: App.Verify.I.playerSkin,
		playerFace: App.Verify.I.playerFace,
		playerHair: App.Verify.I.playerHair,
		playerBoobs: App.Verify.I.playerBoobs,
		playerButt: App.Verify.I.playerButt,
		playerGeneticQuirks: App.Verify.I.playerGeneticQuirks,
		playerPregnancy: App.Verify.I.playerPregnancy,
		playerBelly: App.Verify.I.playerBelly,
		playerGenitalia: App.Verify.I.playerGenitalia,
		playerImplants: App.Verify.I.playerImplants,
		playerPiercings: App.Verify.I.playerPiercings,
		playerTattoo: App.Verify.I.playerTattoo,
		playerCosmetics: App.Verify.I.playerCosmetics,
		playerDiet: App.Verify.I.playerDiet,
		playerRelation: App.Verify.I.playerRelation,
		playerSkill: App.Verify.I.playerSkill,
		playerStat: App.Verify.I.playerStat,
		playerPreferences: App.Verify.I.playerPreferences,
		playerRules: App.Verify.I.playerRules,
		playerMisc: App.Verify.I.playerMisc,
	},
	childState: {
		childAge: App.Verify.I.childAge,
		childHealth: App.Verify.I.childHealth,
		childPhysical: App.Verify.I.childPhysical,
		childSkin: App.Verify.I.childSkin,
		childFace: App.Verify.I.childFace,
		childHair: App.Verify.I.childHair,
		childBoobs: App.Verify.I.childBoobs,
		childButt: App.Verify.I.childButt,
		childGeneticQuirks: App.Verify.I.childGeneticQuirks,
		childPregnancy: App.Verify.I.childPregnancy,
		childBelly: App.Verify.I.childBelly,
		childGenitalia: App.Verify.I.childGenitalia,
		childImplants: App.Verify.I.childImplants,
		childPiercings: App.Verify.I.childPiercings,
		childTattoo: App.Verify.I.childTattoo,
		childCosmetics: App.Verify.I.childCosmetics,
		childDiet: App.Verify.I.childDiet,
		childPorn: App.Verify.I.childPorn,
		childRelation: App.Verify.I.childRelation,
		childSkill: App.Verify.I.childSkill,
		childStat: App.Verify.I.childStat,
		childPreferences: App.Verify.I.childPreferences,
		childRules: App.Verify.I.childRules,
		childMisc: App.Verify.I.childMisc,
	},
	infantState: {
		infantAge: App.Verify.I.infantAge,
		infantHealth: App.Verify.I.infantHealth,
		infantPhysical: App.Verify.I.infantPhysical,
		infantSkin: App.Verify.I.infantSkin,
		infantFace: App.Verify.I.infantFace,
		infantHair: App.Verify.I.infantHair,
		infantBoobs: App.Verify.I.infantBoobs,
		infantButt: App.Verify.I.infantButt,
		infantGeneticQuirks: App.Verify.I.infantGeneticQuirks,
		infantPregnancy: App.Verify.I.infantPregnancy,
		infantBelly: App.Verify.I.infantBelly,
		infantGenitalia: App.Verify.I.infantGenitalia,
		infantImplants: App.Verify.I.infantImplants,
		infantPiercings: App.Verify.I.infantPiercings,
		infantTattoo: App.Verify.I.infantTattoo,
		infantCosmetics: App.Verify.I.infantCosmetics,
		infantDiet: App.Verify.I.infantDiet,
		infantPorn: App.Verify.I.infantPorn,
		infantRelation: App.Verify.I.infantRelation,
		infantSkill: App.Verify.I.infantSkill,
		infantStat: App.Verify.I.infantStat,
		infantPreferences: App.Verify.I.infantPreferences,
		infantRules: App.Verify.I.infantRules,
		infantMisc: App.Verify.I.infantMisc,
	},
	fetus: {
		fetusGeneticQuirks: App.Verify.I.fetusGeneticQuirks,
	},
	customSlaveOrder: {
		customSlaveOrderMisc: App.Verify.I.customSlaveOrderMisc,
	}
};

/**
 * Runs verification for everything.
 * This is resource intensive. If you only need to verify a single data structure, use its verification function(s) instead.
 * @param {HTMLDivElement} [div] if provided then info may be appended to this div
 * @param {Function} [callback] Called when verification finishes if provided
 */
App.Verify.everything = (div, callback) => {
	// a list of verifications to run
	const funcs = [
		{func: App.Verify.slaveStates, params: [div], message: "Verifying SlaveStates..."},
		{func: App.Verify.tankSlaveStates, params: [div], message: "Verifying TankSlaveStates..."},
		{func: App.Verify.childStates, params: [div], message: "Verifying ChildStates..."},
		{func: App.Verify.infantStates, params: [div], message: "Verifying InfantStates..."},
		{func: App.Verify.fetuses, params: [div], message: `Verifying ${V.seePreg === 1 ? 'Fetuses' : 'FStates'}...`},
		{func: App.Verify.playerState, params: [V.PC, "PC", div], message: "Verifying PlayerState..."},
		{func: App.Verify.customSlaveOrders, params: [div], message: "Verifying CustomSlaveOrders..."},
		{func: App.Verify.gameVariables, params: [div], message: "Verifying GameVariables (V)..."}, // game variables should always be verified last
	].reverse();

	// attempt to get the element, use a dummy if it doesn't exist
	const message = document.getElementById("patch-message") ?? App.UI.DOM.makeElement("div");

	const verify = () => {
		// get the verification to run
		const func = funcs.pop();
		// run the verification
		try {
			func.func.apply(null, func.params);
		} catch (e) {
			if (div) {
				// attempt to get the element, use a dummy if it doesn't exist
				const header = document.getElementById("patch-header") ?? App.UI.DOM.makeElement("div");
				header.innerHTML += `<span class="error">Verification failed!</span>`;
				console.error("Verification failed!");
				if (App.Patch.Utils.current.div) {
					App.Patch.Utils.current.div.append(App.UI.DOM.formatException(e));
				} else {
					div.append(App.UI.DOM.formatException(e));
				}
				header.innerHTML += `<br><span>See below for details</span><hr>`;
			} else {
				console.error(e);
				console.error("Verification failed!");
			}
			State.restore(); // restore the state to before patching
			// close the loading screen (if it is open) so that the user can see the error
			App.Patch.Utils.loadingScreen.end();
			return;
		}

		// check if there are more to run
		if (funcs.length !== 0) {
			// set the message the player sees
			message.innerHTML = funcs.last().message;
			// wait for the DOM to update then call verify
			setTimeout(verify, 0);
		} else if (callback) {
			callback();
		}
	};
	if (funcs.length !== 0) {
		// set the message the player sees
		message.innerHTML = funcs.last().message;
		// wait for the DOM to update then call verify
		setTimeout(verify, 0);
	}
};
