/**
 * I know record is not a state. I know that this breaks consistency, but it just felt right...
 * This houses App.Entity.GenePoolRecord and the functions that you should use to manipulate the gene pool.
 * The gene pool is read only and should not be accessed directly. Use the functions below to access it.
 * @see getGenePoolRecord use this to get a record from the gene pool.
 * @see getGenePoolRecordWriteMode use this to edit a record in the gene pool.
 * @see isInGenePool use this to check if a record is in the gene pool already; gene pool records must have unique slave IDs
 * @see addToGenePool use this to add a HumanState object to the gene pool; this will throw an error if a record already exist for the HumanState
 * @see deleteGenePoolRecord use this to remove the record from the gene pool; by default this will keep records that are still needed
 * @see App.Verify.I.genePool use this to clean the gene pool of all unneeded records
 * @see App.Entity.GenePoolRecord the class that defines what a GenePoolRecord is. Handle with care
 */

/**
 * Returns a read only record from the gene pool, will return undefined if there is no valid record.
 * Use `getGenePoolRecordWriteMode()` if you need to edit records.
 * @see getGenePoolRecordWriteMode
 * @param {FC.HumanState|number} key The HumanState object or ID to get the record for.
 * @returns {ReadonlyDeep<FC.GenePoolRecord>}
 */
globalThis.getGenePoolRecord = (key) => {
	return _getGenePoolRecord(key, false, false);
};

/**
 * Returns a read/write record from the gene pool, will return undefined if there is no valid record.
 * @param {FC.HumanState|number} key The HumanState object or ID to get the record for.
 * @returns {FC.GenePoolRecord}
 */
globalThis.getGenePoolRecordWriteMode = (key) => {
	return _getGenePoolRecord(key, false, true);
};

/**
 * Returns true if a genePool record exist for the given key
 * @param {FC.HumanState|number} key The HumanState object or ID to see if a record exist for
 * @returns {boolean}
 */
globalThis.isInGenePool = (key) => {
	/** @type {string} */
	let ID;
	if (typeof key === "number") {
		ID = String(key);
	} else if (typeof key === "object" && "ID" in key) {
		ID = String(key.ID);
	} else {
		throw new Error(`key must be an FC.HumanState object or valid HumanState.ID! Got: ${Serial.stringify(key)}`);
	}
	if (ID in V.genePool) {
		return true;
	}
	return false;
};

/**
 * Makes the given GenePoolRecord sparse saving storage space.
 * If record is undefined then we do nothing.
 * @param {FC.GenePoolRecord} record
 */
globalThis.makeSparseGeneRecord = (record) => {
	if (record === undefined) { return; }
	/**
	 * DANGER
	 * strip keys from obj that aren't in template, recursively
	 * @param {object} obj
	 * @param {object} template
	 */
	const stripKeys = (obj, template) => {
		for (const key in obj) {
			if (!(key in template)) {
				delete obj[key];
			} else if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
				if (template[key] && typeof template[key] === "object" && !Array.isArray(template[key])) {
					stripKeys(obj[key], template[key]);
				} else if (!["womb", "albinismOverride"].includes(key)) {
					console.error(`addToGenePool.stripKeys: ignoring key '${key}' because it is not an object in template for ID '${record.ID}'`);
				}
			}
		}
	};

	/**
	 * DANGER
	 * removes keys from obj that are identical to the key in template, recursively
	 * @param {object} obj
	 * @param {object} template
	 */
	const removeDefaults = (obj, template) => {
		for (const key in obj) {
			if (["inbreedingCoeff", "birthWeek"].includes(key)) {
				continue;
			}
			if (key in template) {
				if (Serial.stringify(obj[key]) === Serial.stringify(template[key])) {
					delete obj[key];
				} else if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
					if (template[key] && typeof template[key] === "object" && !Array.isArray(template[key])) {
						removeDefaults(obj[key], template[key]);
					} else if (!["womb", "albinismOverride"].includes(key)) {
						console.error(`addToGenePool.removeDefaults: ignoring key '${key}' because it is not an object in template for ID '${record.ID}'`);
					}
				}
			}
		}
	};

	// strip the record down to a valid GenePoolRecord
	stripKeys(record, new App.Entity.GenePoolRecord());
	// remove all default keys from GenePoolRecord
	removeDefaults(record, V.genePoolDefaults);
};

/**
 * Adds a clone of the given human to the genePool as a valid FC.GenePoolRecord.
 * Throws an error if they are already in the pool.
 * If unsure, use `isInGenePool()` first to check.
 * @see isInGenePool
 * @param {FC.HumanState} actor
 */
globalThis.addToGenePool = (actor) => {
	const record = _.cloneDeep(actor);
	const player = asPlayer(record);
	const slave = asSlave(record);
	if (player) {
		App.Verify.playerState(
			player,
			`<Player with ID '${record.ID}' passed to addToGenePool()>`,
			undefined,
			"gene pool",
		);
	} else if (slave) {
		App.Verify.slaveState(
			`<Slave with ID '${record.ID}' passed to addToGenePool()>`,
			slave,
			"gene pool"
		);
	} else {
		console.error(`addToGenePool: actor with ID '${record.ID}' is not a valid SlaveState or PlayerState object`);
		// TODO:@franklygeorge double check that all the keys from new App.Entity.GenePoolRecord() exist on actor
		// TODO:@franklygeorge if not then throw an error; once you write that code change the console.error above to console.warn
	}

	if (record.ID === 0) {
		console.error(new Error("addToGenePool: actors with an ID equal to 0 cannot be added to the gene pool"));
		return;
	}

	if (record.ID in V.genePool) {
		throw new Error(`There is already a genePool record for ID '${record.ID}'`);
	}

	// cull the contents of womb from the record
	record.womb = [];

	makeSparseGeneRecord(record);

	// @ts-expect-error V.genePool is set to read only. This is the one of the few lines that should be writing to it
	V.genePool[String(record.ID)] = record;
};

/**
 * deletes the given genePool record for the given HumanState as long as it is no longer needed
 * use App.Verify.I.genePool() to check the whole genePool for unneeded records
 * @see App.Verify.I.genePool
 * @param {FC.HumanState} actor The HumanState object to delete the record for
 * @param {boolean} [force=false] if true then we will delete the record even if it is still referenced
 */
globalThis.deleteGenePoolRecord = (actor, force=false) => {
	if (actor.ID === 0) {
		console.error(new Error("deleteGenePoolRecord: actors with an ID equal to 0 cannot be deleted from the gene pool"));
		return;
	}
	if (!(actor.ID in V.genePool)) {
		return; // nothing to do
	}
	if (force === true) {
		console.log(`deleteGenePoolRecord: force=true, deleting record for ID ${actor.ID} without running checks`);
		// @ts-expect-error V.genePool is set to read only. This is the one of the few lines that should be writing to it
		delete V.genePool[String(actor.ID)]; // skip checks and just delete it
	}
	let keep = getHumanStates(true).some(other => {
		return (
			// return false if other is actor
			actor.ID !== other.ID &&
			// has actor imprenated other?
			isImpregnatedBy(other, actor) &&
			// are any of the fetuses in other the child of actor (transplants)?
			hasTransplantFrom(other, actor)
		);
	});
	if (!keep) {
		// console.log(`deleteGenePoolRecord: deleting record for ID ${actor.ID} because it is no longer needed`);
		// @ts-expect-error V.genePool is set to read only. This is the one of the few lines that should be writing to it
		delete V.genePool[actor.ID];
	}
};

/**
 * Use `getGenePoolRecord()` or `getGenePoolRecordWriteMode()` instead of calling this directly
 * @see getGenePoolRecord
 * @see getGenePoolRecordWriteMode
 * @param {FC.HumanState|number} key The HumanState object or ID to get the record for.
 * @param {boolean} [missingOkay=false] if true then we won't warn if the record is missing, use sparingly.
 * @param {boolean} [write=false] if true allow writing to the record.
 * @returns {FC.GenePoolRecord}
 */
globalThis._getGenePoolRecord = (key, missingOkay=false, write=false) => {
	/** @type {string} */
	let ID;
	if (typeof key === "number") {
		ID = String(key);
	} else if (typeof key === "object" && "ID" in key) {
		ID = String(key.ID);
	} else {
		throw new Error(`key must be an FC.HumanState object or valid HumanState.ID! Got: ${Serial.stringify(key)}`);
	}
	if (ID in V.genePool) {
		// this implementation means that write=true will convert the record from a sparse object into a full one.
		// this should be okay since validation will reconvert it to sparse later, but it is not ideal
		// the reason for doing this is that proxies are an absolute pain if you need to fill in values with defaults recursively.
		// this also means that if someone tries to write to this with write=false there will be no error or warning to indindcate that something is wrong
		const record = write ? V.genePool[ID] : clone(V.genePool[ID]);
		App.Utils.assignMissingDefaults(record, V.genePoolDefaults, new App.Entity.GenePoolRecord());
		return /** @type {FC.GenePoolRecord} */ (record);
	} else {
		if (!missingOkay) {
			// TODO:@franklygeorge: guess what the missing parent(s) should be based off the existing children and add the guesses to the gene pool
			// console.warn(`Gene pool record missing for ID '${ID}'`);
		}
		return undefined;
	}
};

/**
 * This defines properties that are shared between the gene pool and all HumanState objects.
 * The values here should be the default for SlaveState objects.
 * @see App.Entity.HumanState
 */
// TODO:@franklygeorge typing hints and documentation for all of these properties
App.Entity.GenePoolRecord = class GenePoolRecord {
	/**
	 * @param {number|string} [seed=undefined]
	 */
	constructor(seed=undefined) {
		// WARNING removing keys from this class will cause validation to cull them from all new V.genePool objects
		// WARNING make absolutely sure that you intend your changes to take place
		// WARNING when in doubt verify in via issue in the FC-pregmod repo
		// GenePoolRecord objects are supposed to be records of the humans state right before they are first introduced to the player
		// GenePoolRecord objects values should not be updated after their creation (with a few exceptions)
		// The goals for this class are two fold:
		//   1. To be able to check if a physical trait of the actor has changed/has been changed
		//   2. To be able to generate relatives of the actor relative to their original state

		/**
		 * @type {number} used for patching via BC
		 * @see App.Patch.applyAll
		 * @see App.Patch.Patches
		 */
		this.releaseID = App.Version.release;
		/** @type {string} the seed that was passed or a new seed from generateNewID() is none was passed  */
		this.seed = seed ? String(seed) : generateNewID();
		/** @type {FC.HumanID} Their ID; This must be unique; Use generateSlaveID() to get a new one; */
		this.ID = 0;

		/** @type {string} Their current name */
		this.slaveName = "blank"; // TODO:@franklygeorge refactor to `name`
		/** @type {FC.Zeroable<string>} Their current surname */
		this.slaveSurname = 0; // TODO:@franklygeorge refactor to `surname`
		/** @type {string} Their original name */
		this.birthName = "blank";
		/** @type {FC.Zeroable<string>} Their original surname */
		this.birthSurname = 0;

		/** @type {App.Data.Pronouns.Kind} */
		this.pronoun = App.Data.Pronouns.Kind.female;
		/** @type {FC.GenderGenes} Their sex */
		this.genes = "XX";

		/** @type {InstanceType<typeof App.Entity.GeneticState>} Their natural genetic properties */
		this.natural = new App.Entity.GeneticState(seed);

		/** @type {FC.SpecialID|FC.HumanID} ID of their father */
		this.father = SID.GENERIC;
		/** @type {FC.SpecialID|FC.HumanID} ID of their mother */
		this.mother = SID.GENERIC;

		/** Are they a clone? If so, what is the original human's name?
		 * @type {FC.Zeroable<string>}
		 * 0: no; string: yes */
		this.clone = 0;
		/** ID they were cloned from */
		this.cloneID = 0;

		/** @type {number} week they were born in (int between 0-51) */
		this.birthWeek = jsRandom(0, 51, undefined, seed);
		/** @type {number} How old they really are. */
		this.actualAge = 18;
		/** @type {number} How old their body looks. */
		this.visualAge = 18;
		/** @type {number} How old their body is. */
		this.physicalAge = 18;
		/** @type {number} How old their ovaries are. (used to trick menopause) */
		this.ovaryAge = 18;

		/** @type {string} Their nationality */
		this.nationality = "slave";
		/** @type {FC.Race} Their race */
		this.race = "white";
		/** Their original race
		 * @type {FC.Race} */
		this.origRace = "white";

		/** career prior to joining the arcology
		 * @type {string}
		 * @see App.Data.Careers for a list
		 */
		this.career = "a slave";

		this.health = {
			/**
			 * Their health
			 * * -90 -	: On the edge of death
			 * * -90 -	-51: Extremely unhealthy
			 * * -50 -	-21: Unhealthy
			 * * -20 -	20: Healthy
			 * * 21	-	50: Very healthy
			 * * 50	-	90: Extremely healthy
			 * * 90	-	: Unnaturally healthy
			 */
			condition: 0,
			/** Their short term health damage */
			shortDamage: 0,
			/** Their long term health damage */
			longDamage: 0,
			/**
			 * Their current illness status
			 * * 0 : Not ill
			 * * 1 : A little under the weather
			 * * 2 : Minor illness
			 * * 3 : Ill
			 * * 4 : serious illness
			 * * 5 : dangerous illness
			 */
			illness: 0,
			/**
			 * Their current level of exhaustion
			 * * 0  - 30 : Perfectly fine
			 * * 31 - 60 : tired
			 * * 61 - 90 : fatigued
			 * * 91 - 100 : exhausted
			 */
			tired: 0,
			/** Their combined health (condition - short - long) */
			health: 0
		};

		/**
		 * Their markings
		 * * "beauty mark"
		 * * "birthmark"
		 * * "freckles"
		 * * "heavily freckled"
		 * @type {FC.Markings}
		 */
		this.markings = "none";

		/**  @type {InstanceType<typeof App.Entity.EyeState>} Their eyes. */
		this.eye = new App.Entity.EyeState();

		/**
		 * @type {FC.Hearing} Their hearing
		 * * -2: deaf
		 * * -1: hard of hearing
		 * * 0: normal
		 */
		this.hears = 0;

		/** @type {0|-1} sense of smell; 0 = yes; -1 = no */
		this.smells = 0;

		/** @type {0|-1} sense of taste; 0 = yes; -1 = no */
		this.tastes = 0;

		/** @type {0|1|2|3} Their voice; 0: mute, 1: deep, 2: feminine, 3: high, girly */
		this.voice = 2;
		/**
		 * @type {0|1|-1} Has voice implant
		 * * 0: no
		 * * 1: yes, high
		 * * -1: yes, low
		 */
		this.voiceImplant = 0;
		/** @type {FC.Bool} Has cybernetic voicebox; 0: no; 1: yes */
		this.electrolarynx = 0;
		/**
		 * @type {0|1|2|3|4} Their accent
		 * * 0: none
		 * * 1: attractive
		 * * 2: heavy
		 * * 3: does not speak language
		 * * 4: does not speak any language
		 */
		this.accent = 0;

		/** @type {FC.Bool} Is there an inner ear implant device; 0: no; 1: yes */
		this.earImplant = 0;
		/** @type {FC.EarShape} the shape of their outer ears */
		this.earShape = "normal";
		/** @type {FC.EarTopType} type of top ears if any */
		this.earT = "none";
		/** @type {FC.Bool} If 1 then they don't need an implant for their top ears to function */
		this.earTNatural = 0;
		/** @type {string} top ear color */
		this.earTColor = "hairless";
		/** @type {string} top ear effect color */
		this.earTEffectColor = "none";
		/** @type {string} top ear effect */
		this.earTEffect = "none";

		/** @type {FC.HornType} horn type if any */
		this.horn = "none";
		/** @type {string} horn color */
		this.hornColor = "none";

		/**
		 * @type {0|1|2|3} What level of prosthetic interface she has installed
		 * * 0: no interface
		 * * 1: basic interface
		 * * 2: advanced interface
		 * * 3: quadruped interface
		 */
		this.PLimb = 0;
		/**
		 * legs of the slave
		 */
		this.leg = {
			left: new App.Entity.LegState(),
			right: new App.Entity.LegState()
		};
		/**
		 * arms of the slave
		 */
		this.arm = {
			left: new App.Entity.ArmState(),
			right: new App.Entity.ArmState()
		};
		/** @type {FC.Bool} are heels clipped; 0: no, 1: yes */
		this.heels = 0;

		/** @type {FC.TailType} type of tail installed */
		this.tail = "none";
		/**
		 * @type {FC.Bool} Do they have a tail interface installed
		 * * 0: no
		 * * 1: yes
		 */
		this.PTail = 0;
		/** @type {FC.TailShape} the current shape of their modular tail */
		this.tailShape = "none";
		/** @type {string} tail color */
		this.tailColor = "none";
		/** @type {string} tail effect color */
		this.tailEffectColor = "none";
		/** @type {string} tail effect */
		this.tailEffect = "none";

		/** @type {FC.AppendagesType} type of dorsal (back/upper) appendages installed */
		this.appendages = "none";
		/** @type {string} appendage color */
		this.appendagesColor = "none";
		/** @type {string} appendages effect color */
		this.appendagesEffectColor = "none";
		/** @type {string} appendages effect */
		this.appendagesEffect = "none";
		/**
		 * @type {FC.Bool} Do they have a back interface installed
		 * * 0: no
		 * * 1: yes
		 */
		this.PBack = 0;
		/** @type {FC.WingsShape} the current shape of their modular wings */
		this.wingsShape = "none";

		/** The color of their pattern
		 * @type {FC.PatternColor}
		 * applies to:
		 * @see FC.PatternedEars ears
		 * @see FC.PatternedTails tails
		 * @see FC.PatternedAppendages appendages
		 */
		this.patternColor = "black";

		/** @type {string} Their hair color */
		this.hColor = "brown";
		/** @type {string} Their original hair color, defaults to their initial hair color. */
		this.origHColor = "brown";
		/** @type {string} hair effect color */
		this.hEffectColor = "none";
		/** @type {string} hair effect */
		this.hEffect = "none";
		/** @type {string} pubic hair color */
		this.pubicHColor = "brown";
		/** @type {string} armpit hair style */
		this.underArmHColor = "brown";
		/** @type {string} eyebrowHColor*/
		this.eyebrowHColor = "brown";
		/**
		 * @type {number} hair length
		 * * 150: calf-length
		 * * 149-100: ass-length
		 * * 99-30: long
		 * * 29-10: shoulder-length
		 * * 9-0: short
		 */
		this.hLength = 60;
		/**
		 * @type {FC.EyebrowThickness} eyebrow thickness
		 * * "pencil-thin"
		 * * "thin"
		 * * "threaded"
		 * * "natural"
		 * * "tapered"
		 * * "thick"
		 * * "bushy"
		 */
		this.eyebrowFullness = "natural";
		/** @type {FC.HairStyle} hair style */
		this.hStyle = "neat";
		/** @type {string} pubic hair style */
		this.pubicHStyle = "neat";
		/** @type {string} armpit hair style */
		this.underArmHStyle = "neat";
		/** @type {string} eyebrowHStyle */
		this.eyebrowHStyle = "natural";

		/** @type {string} skin color */
		this.skin = "light";
		/** @type {string} Their original skin color. */
		this.origSkin = "light";

		/**
		 * @type {number} face attractiveness
		 * * -96 - : very ugly
		 * * -95 - -41: ugly
		 * * -40 - -11: unattractive
		 * * -10 - 10: averagee
		 * * 11 - 40: attractive
		 * * 41 - 95: gorgeous
		 * * 96+: very beautiful
		 */
		this.face = 0;
		/**
		 * @type {number} facial surgery degree
		 * * 0 - 14: none
		 * * 15 - 34: Subtle Improvements
		 * * 35 - 64: Noticeable Work
		 * * 65 - 99: Heavily Reworked
		 * * 100: Uncanny Valley
		 */
		this.faceImplant = 0;
		/** has had facial surgery to reduce age. 0: no, 1: yes
		 * @type {FC.Bool} */
		this.ageImplant = 0;
		/**
		 * @type {FC.FaceShape} accepts string (will be treated as "normal")
		 * * "normal"
		 * * "masculine"
		 * * "androgynous"
		 * * "cute"
		 * * "sensual"
		 * * "exotic"
		 * * "feline" (catmod exclusive)
		 */
		this.faceShape = "normal";
		/**
		 * @type {number} lip size (0 - 100)
		 * * 0 - 10: thin
		 * * 11 - 20: normal
		 * * 21 - 40: pretty
		 * * 41 - 70: plush
		 * * 71 - 95: huge(lisps)
		 * * 96 - 100: facepussy(mute)
		 */
		this.lips = 15;
		/**
		 * @type {number} how large their lip implants are
		 * @see lips
		 */
		this.lipsImplant = 0;
		/**
		 * * "normal"
		 * * "crooked"
		 * * "gapped"
		 * * "straightening braces"
		 * * "cosmetic braces"
		 * * "removable"
		 * * "pointy"
		 * * "fangs"
		 * * "fang"
		 * * "baby"
		 * * "mixed"
		 * @type {FC.TeethType} teeth type
		 */
		this.teeth = "normal";

		/** @type {FC.Tattoo} shoulder tattoo */
		this.shouldersTat = 0;
		/** @type {FC.Tattoo} arm tattoo */
		this.armsTat = 0;
		/** @type {FC.Tattoo} leg tattoo */
		this.legsTat = 0;
		/** @type {FC.Tattoo} back tattoo */
		this.backTat = 0;
		/** @type {FC.Tattoo} tramp stamp (lower back tattoo) */
		this.stampTat = 0;
		/** @type {FC.Tattoo} butt tattoo */
		this.buttTat = 0;
		/** @type {FC.Tattoo} boobs tattoo */
		this.boobsTat = 0;
		/** @type {FC.Tattoo} dick tattoo */
		this.dickTat = 0;
		/** @type {FC.TattooAnus} anus tattoo */
		this.anusTat = 0;
		/** @type {FC.TattooVagina} vagina tattoo */
		this.vaginaTat = 0;
		/** @type {FC.TattooLip} lip tattoo */
		this.lipsTat = 0;
		/** @type {FC.TattooBelly} They have a tattoo that is only recognizable when they have a big belly. */
		this.bellyTat = 0;
		/**
		 * @type {number} They have a series of tattoos to denote how many abortions they have had.
		 * * -1: no tattoo
		 * *  0: assigned to have tattoo, may not have one yet
		 * * 1+: number of abortion tattoos they have
		 */
		this.abortionTat = -1;
		/**
		 * @type {number} They have a series of tattoos to denote how many times they have given birth.
		 * * -1: no tattoo
		 * *  0: assigned to have tattoo, may not have one yet
		 * * 1+: number of birth tattoos they have
		 */
		this.birthsTat = -1;

		/**
		 * @type {number} Their weight
		 * * 191+: dangerously obese
		 * * 190 - 161: super obese
		 * * 160 - 131: obese
		 * * 130 - 96: fat
		 * * 95 - 31: overweight
		 * * 30 - 11: curvy
		 * * 10 - -10: neither too fat nor too skinny
		 * * -11 - -30: thin
		 * * -31 - -95: very thin
		 * * -96 - : emaciated
		 */
		this.weight = 0;
		/**
		 * @type {number} Their muscles
		 * * 96+ : extremely muscular
		 * * 31 - 95: muscular
		 * * 6 - 30: toned
		 * * -5 - 5: none
		 * * -30 - -6: weak
		 * * -95 - -31: very weak
		 * * -96- : frail
		 */
		this.muscles = 0;
		/**
		 * @type {number} Their height in cm
		 * * < 150: petite
		 * * 150 - 159: short
		 * * 160 - 169: average
		 * * 170 - 185: tall
		 * * 186+ : very tall
		 */
		this.height = 170;
		/** Do they have a height implant
		 * -1: -10 cm, 0: none, 1: +10 cm
		 * @type {FC.HeightImplant} */
		this.heightImplant = 0;
		/**
		 * @type {number} slave waist
		 * * 96+: masculine
		 * * 95 - 41: ugly
		 * * 40 - 11: unattractive
		 * * 10 - -10: average
		 * * -11 - -40: feminine
		 * * -40 - -95: hourglass
		 * * -96-: absurd
		 */
		this.waist = 0;
		/**
		 * @type {-2|-1|0|1|2|3} hip size
		 * * -2: very narrow
		 * * -1: narrow
		 * * 0: normal
		 * * 1: wide hips
		 * * 2: very wide hips
		 * * 3: inhumanly wide hips
		 */
		this.hips = 0;
		/** @type {number} they have a hip implant; */
		this.hipsImplant = 0;
		/**
		 * @type {number} butt size
		 * * 0	: flat
		 * * 1	: small
		 * * 2  : plump *
		 * * 3	: big bubble butt
		 * * 4	: huge
		 * * 5	: enormous
		 * * 6	: gigantic
		 * * 7	: ridiculous
		 * * 8 - 10: immense
		 * * 11 - 20: inhuman
		 *
		 * _* Descriptions vary for just how big 2 is, as such, it may be better to just go with 3_
		 */
		this.butt = 0;
		/**
		 * @type {number} butt implant type and size
		 * * 0: none
		 * * 1: butt implant
		 * * 2: big butt implant
		 * * 3: fillable butt implants
		 * * 5 - 8: advanced fillable implants
		 * * 9+: hyper fillable implants
		 */
		this.buttImplant = 0;
		/**
		 * @type {FC.InstalledSizingImplantType} Implant type
		 * * "none"
		 * * "normal"
		 * * "string"
		 * * "fillable"
		 * * "advanced fillable"
		 * * "hyper fillable"
		 */
		this.buttImplantType = "none";
		/**
		 * @type {-2|-1|0|1|2} shoulder width
		 * * -2: very narrow
		 * * -1: narrow
		 * * 0: feminine
		 * * 1: broad
		 * * 2: very broad
		 */
		this.shoulders = 0;
		/** @type {number} has shoulder implant */
		this.shouldersImplant = 0;
		/**
		 * @type {number} Their boob size (in cc)
		 * * 0-299	- flat;
		 * * 300-399   - A-cup;
		 * * 400-499   - B-cup
		 * * 500-649   - C-cup
		 * * 650-799   - D-cup
		 * * 800-999   - DD-cup
		 * * 1000-1199 - F-cup
		 * * 1200-1399 - G-cup
		 * * 1400-1599 - H-cup
		 * * 1600-1799 - I-cup
		 * * 1800-2049 - J-cup
		 * * 2050-2299 - K-cup
		 * * 2300-2599 - L-cup
		 * * 2600-2899 - M-cup
		 * * 2900-3249 - N-cup
		 * * 3250-3599 - O-cup
		 * * 3600-3949 - P-cup
		 * * 3950-4299 - Q-cup
		 * * 4300-4699 - R-cup
		 * * 4700-5099 - S-cup
		 * * 5100-5499 - T-cup
		 * * 5500-6499 - U-cup
		 * * 6500-6999 - V-cup
		 * * 7000-7499 - X-cup
		 * * 7500-7999 - Y-cup
		 * * 8000-8499 - Z-cup
		 * * 8500-14999 - obscenely massive
		 * * 15000-24999 - arm filling
		 * * 25000-39999 - figure dominating
		 * * 40000-54999 - beanbag sized
		 * * 55000-69999 - door jamming
		 * * 70000-89999 - hall clearing
		 * * 90000-100000 - hall jamming
		 */
		this.boobs = 0;
		/**
		 * @type {number} Their implant size
		 * * 0: no implants;
		 * * 1-199: small implants;
		 * * 200-399: normal implants;
		 * * 400-599: large implants;
		 * * 600+: boobsImplant size fillable implants
		 */
		this.boobsImplant = 0;
		/**
		 * @type {FC.InstalledSizingImplantType} Implant type
		 * * "none"
		 * * "normal"
		 * * "string"
		 * * "fillable"
		 * * "advanced fillable"
		 * * "hyper fillable"
		 */
		this.boobsImplantType = "none";
		/**
		 * @type {FC.BreastShape} breast shape
		 * * "normal"
		 * * "perky"
		 * * "saggy"
		 * * "torpedo-shaped"
		 * * "downward-facing"
		 * * "wide-set"
		 * * "spherical"
		 */
		this.boobShape = "normal";
		/**
		 * @type {FC.NippleShape} nipple shape
		 * * "huge"
		 * * "puffy"
		 * * "inverted"
		 * * "tiny"
		 * * "cute"
		 * * "partially inverted"
		 * * "fuckable"
		 * * "flat"
		 */
		this.nipples = "cute";
		/** @type {0|1|2|3|4} Their areolae; 0: normal; 1: large; 2: unusually wide; 3: huge, 4: massive */
		this.areolae = 0;
		/** @type {"heart"|"star"|"circle"} Their areolae shape */
		this.areolaeShape = "circle";

		/**
		 * @type {number} vagina type
		 * * -1: no vagina
		 * * 0: virgin
		 * * 1: tight
		 * * 2: reasonably tight
		 * * 3: loose
		 * * 4: cavernous
		 * * 10: ruined
		 */
		this.vagina = 0;
		/** how wet they are
		 *
		 * 0: dry; 1: wet; 2: soaking wet
		 * @type {FC.VaginaLubeType} */
		this.vaginaLube = 0;
		/**
		 * @type {FC.OvaryImplantType} Ovary implant type.
		 * * 0: no implants
		 * * "fertility": higher chance of twins (or more)
		 * * "sympathy": doubles eggs released
		 * * "asexual": self-fertilizing
		 */
		this.ovaImplant = 0;
		/**
		 * @type {FC.WombImplantType} Womb focused enhancements.
		 * * "none"
		 * * "restraint": Provides structural support for extremely oversized pregnancies
		 */
		this.wombImplant = "none";
		/**
		 * What species of sperm do they produce.
		 * * "human"
		 * * "dog"
		 * * "pig"
		 * * "horse"
		 * * "cow"
		 * * "sterile"
		 * @type {FC.ReproductiveSystem}
		 */
		this.ballType = "human";
		/**
		 * What species of ovum do they produce.
		 * * "human"
		 * * "dog"
		 * * "pig"
		 * * "horse"
		 * * "cow"
		 * * "sterile"
		 * @type {FC.ReproductiveSystem}
		 */
		this.eggType = "human";

		/**
		 * @type {0|1|2|3} have they been turned into a broodmother
		 * * 0: no
		 * * 1: standard 1 birth / week
		 * * 2: black market 12 births / week
		 * * 3: black market upgrade for implant firmware, to allow change weekly number
		 * of ova in range of 1 to 12 in remote surgery block. (broodmotherFetuses change
		 * through remote surgery). (future usage)
		 */
		this.broodmother = 0;
		/**
		 * @type {number} count of ova that broodmother implant force to release.
		 * Should be set with "broodmother" property together. If broodmother === 0 has no meaning.
		 */
		this.broodmotherFetuses = 0;
		/**
		 * @type {FC.Bool} If broodmother implant set to pause its work.
		 * * 1: implant on pause
		 * * 0: working.
		 *
		 * _If broodmother birth their last baby and their implant is on pause, they will be in a contraception like state._
		 */
		this.broodmotherOnHold = 0;
		/**
		 * @type {number} Number of weeks left until last baby will be birthed.
		 * Mainly informative only. Updated automatically at birth process based on remaining fetuses. 0 - 37
		 */
		this.broodmotherCountDown = 0;

		/**
		 * labia type
		 * * 0: minimal
		 * * 1: big
		 * * 2: huge
		 * * 3: huge dangling
		 * @type {FC.LabiaType}
		 */
		this.labia = 0;
		/**
		 * clit size
		 * * 0: normal
		 * * 1: large
		 * * 2: huge
		 * * 3: enormous
		 * * 4: penis-like
		 * * 5: like a massive penis
		 * @type {FC.ClitType}
		 */
		this.clit = 0;
		/**
		 * @type {number}
		 * * 0: circumcised
		 * * 1+:uncut, also affects clitoral hood size
		 */
		this.foreskin = 0;
		/**
		 * anus size
		 * * 0: virgin
		 * * 1: tight
		 * * 2: loose
		 * * 3: very loose
		 * * 4: gaping
		 * @type {FC.AnusType} */
		this.anus = 0;
		/** @type {number} used to calculate size of area around anus. */
		this.analArea = 1;
		/**
		 * @type {number} dick size
		 * * 0: none
		 * * 1: tiny
		 * * 2: little
		 * * 3: normal
		 * * 4: big
		 * * 5: huge
		 * * 6: gigantic
		 * * 7: massive/gigantic
		 * * 8: truly imposing/titanic
		 * * 9: monstrous/absurd
		 * * 10: awe-inspiring/inhuman
		 * * 11+: hypertrophied
		 */
		this.dick = 0;
		/**
		 * do they have a prostate?
		 * * 0: no
		 * * 1: normal
		 * * 2: hyperstimulated +20%
		 * * 3: modified hyperstimulated +50%
		 * @type {FC.ProstateType} */
		this.prostate = 0;
		/**
		 * Prostate implant type.
		 * @type {number|string}
		 *
		 * * 0: no implants
		 * * "stimulator": Stimulates a prostate orgasm. A null's best friend!
		 */
		this.prostateImplant = 0;
		/**
		 * @type {number} ball size
		 * * 0: none
		 * * 1: vestigial
		 * * 2: small
		 * * 3: average
		 * * 4: large
		 * * 5: massive
		 * * 6: huge
		 * * 7: giant
		 * * 8: enormous
		 * * 9: monstrous
		 * * 10: inhuman
		 * * 11+: hypertrophied
		 */
		this.balls = 0;
		/**
		 * @type {0|1|2|3|4} ball size booster
		 * * 0: none
		 */
		// TODO: figure out what states 1-4 mean
		// TODO:@franklygeorge implement this for slaves
		this.ballsImplant = 0;
		/**
		 * @type {number} scrotum size
		 *
		 * function relative to .balls
		 *
		 * *If .balls > 0 and .scrotum === 0, balls are internal*
		 */
		this.scrotum = 0;
		/** has ovaries
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.ovaries = 0;
		/** @type {{[key: string]: string}} */
		this.brand = {};
		this.piercing = new App.Entity.completePiercingState();

		/** @type {number} if greater than 10 triggers side effects from drug use. */
		this.chem = 0;
		/**
		 * @type {number} how addicted to aphrodisiacs they are
		 * * 0: not
		 * * 1-2: new addict
		 * * 3-9: confirmed addict
		 * * 10+: dependent
		 */
		this.addict = 0;

		/**
		 * @type {number} slave 's devotion
		 * * -96 - : hate-filled
		 * * -95 - -51: hateful
		 * * -50 - -21: reluctant
		 * * -20 - 20: careful
		 * * 21 - 50: accepting
		 * * 51 - 95: devoted
		 * * 96+: worshipful */
		this.devotion = 0;
		/**
		 * @type {number} Their intelligence
		 * * -100 - -96: borderline retarded
		 * * -95 - -51: very slow
		 * * -50 - -16: slow
		 * * -15 - 15: average
		 * * 16 - 50: smart
		 * * 51 - 95: very smart
		 * * 96 - 100: brilliant
		 */
		this.intelligence = 0;
		/**
		 * @type {number} Degree of their education
		 * * -15+: miseducated (they appear to be dumber than they really are)
		 * * 0: uneducated
		 * * 1+: partial education (not really used)
		 * * 15+: educated
		 * * 30: well educated
		 */
		this.intelligenceImplant = 0;

		/** 0: does not have; 1: carrier; 2: active
		 * * heterochromia is an exception. String = active
		 * @type {FC.GeneticQuirks}
		 */
		this.geneticQuirks = {
			/** Oversized breasts. Increased growth rate, reduced shrink rate. Breasts try to return to oversized state if reduced. */
			macromastia: 0,
			/** Greatly oversized breasts. Increased growth rate, reduced shrink rate. Breasts try to return to oversized state if reduced.
			 *
			 * **macromastia + gigantomastia** - Breasts never stop growing. Increased growth rate, no shrink rate. */
			gigantomastia: 0,
			/** sperm is much more likely to knock someone up */
			potent: 0,
			/** is prone to having twins, shorter pregnancy recovery rate */
			fertility: 0,
			/** is prone to having multiples, even shorter pregnancy recovery rate
			 *
			 * **fertility + hyperFertility** - will have multiples, even shorter pregnancy recovery rate */
			hyperFertility: 0,
			/** pregnancy does not block ovulation, slave can become pregnant even while pregnant */
			superfetation: 0,
			/** abnormal production of amniotic fluid
			 *  only affects fetuses */
			polyhydramnios: 0,
			/** Pleasurable pregnancy and orgasmic birth. Wider hips, looser and wetter vagina. High pregadaptation and low birth damage. */
			uterineHypersensitivity: 0,
			/** inappropriate lactation*/
			galactorrhea: 0,
			/** is abnormally tall. gigantism + dwarfism - is very average*/
			gigantism: 0,
			/** is abnormally short. gigantism + dwarfism - is very average*/
			dwarfism: 0,
			/** retains childlike characteristics*/
			neoteny: 0,
			/** rapid aging
			 *
			 * **neoteny + progeria** - progeria wins, not that she'll make it to the point that neoteny really kicks in */
			progeria: 0,
			/** has a flawless face. pFace + uFace - Depends on carrier status, may swing between average and above/below depending on it
			 * Any code that sets this to a positive value _must_ also set "face" to 100--this will not occur automatically, except when
			 * positive "pFace" is generated randomly in "generateNewSlave" and "generateGenetics".
			 */
			pFace: 0,
			/** has a hideous face. pFace + uFace - Depends on carrier status, may swing between average and above/below depending on it
			 * Any code that sets this to a positive value _must_ also set "face" to -100--this will not occur automatically, except when
			 * positive "uFace" is generated randomly in "generateNewSlave" and "generateGenetics".
			 */
			uFace: 0,
			/** has pale skin, white hair and red eyes */
			albinism: 0,
			/** may have mismatched eyes, the eye color stored here is always the left eye */
			heterochromia: 0,
			/** ass never stops growing. Increased growth rate, reduced shrink rate. */
			rearLipedema: 0,
			/** has (or will have) a huge dong */
			wellHung: 0,
			/** constantly gains weight unless dieting, easier to gain weight. wGain + wLoss - weight gain/loss fluctuates randomly */
			wGain: 0,
			/** constantly loses weight unless gaining, easier to lose weight. wGain + wLoss - weight gain/loss fluctuates randomly */
			wLoss: 0,
			/** body attempts to normalize to an androgynous state */
			androgyny: 0,
			/** constantly gains muscle mass, easier to gain muscle. mGain + mLoss - muscle gain/loss amplified, passively lose muscle unless building */
			mGain: 0,
			/** constantly loses muscle mass, easier to gain muscle. mGain + mLoss - muscle gain/loss amplified, passively lose muscle unless building */
			mLoss: 0,
			/** ova will split if room is available
			 *  only affects fetuses */
			twinning: 0,
			/** slave can only ever birth girls */
			girlsOnly: 0
		};

		/** @type {number} chance of generating sperm with a Y chromosome (yields male baby). inherited by sons, with mutation */
		this.spermY = 50;

		/** @type {number} Target .physicalAge for female puberty to occur. */
		this.pubertyAgeXX = 13;
		/** Have they gone through female puberty.
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.pubertyXX = 0;
		/** @type {number} Target .physicalAge for male puberty to occur. */
		this.pubertyAgeXY = 13;
		/** Have they gone through male puberty.
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.pubertyXY = 0;

		/**
		 * scar
		 * Sub-object:
		 * the body part in question, such as back or left hand
		 * the key of that part is the type of scar they can have and the value is how serious it is, from 0 up
		 * @type {{[key: string]: Partial<App.Entity.ScarState>}} */
		this.scar = {};

		/** Were they born prematurely?
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.premature = 0;

		/** Have they had a vasectomy?
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.vasectomy = 0;

		/**
		 * Their current hormonal balance, directs saHormones changes
		 *
		 * ||thresholds|
		 * |-|-|
		 * -500 | absolutely masculine
		 * -499 - -400 | overwhelmingly masculine
		 * -399 - -300 | extremely masculine
		 * -299 - -200 | heavily masculine
		 * -199 - -100 | very masculine
		 * -99 - -21 | masculine
		 * -20 - 20 | neutral
		 * 21 - 99 | feminine
		 * 100 - 199 | very feminine
		 * 200 - 299 | heavily feminine
		 * 300 - 399 | extremely feminine
		 * 400 - 499 | overwhelmingly feminine
		 * 500 | absolutely feminine
		 */
		this.hormoneBalance = 0;

		/**
		 * * "none"
		 * * "arrogant": clings to her dignity, thinks slavery is beneath her
		 * * "bitchy": can't keep her opinions to herself
		 * * "odd": says and does odd things
		 * * "hates men": hates men
		 * * "hates women": hates women
		 * * "gluttonous": likes eating, gains weight
		 * * "anorexic": dislikes eating and being forced to eat, loses weight
		 * * "devout": resistance through religious faith
		 * * "liberated": believes slavery is wrong
		 * @type {FC.BehavioralFlaw}
		 */
		this.behavioralFlaw = "none";
		/**
		 * * "none"
		 * * "confident": believes she has value as a slave
		 * * "cutting": often has as witty or cunning remark ready, knows when to say it
		 * * "funny": is funny
		 * * "fitness": loves working out
		 * * "adores women": likes spending time with women
		 * * "adores men": likes spending time with men
		 * * "insecure": defines herself on the thoughts of others
		 * * "sinful": breaks cultural norms
		 * * "advocate": advocates slavery
		 * @type {FC.BehavioralQuirk}
		 */
		this.behavioralQuirk = "none";
		/**
		 * * "none"
		 * * "hates oral": hates oral sex
		 * * "hates anal": hates anal sex
		 * * "hates penetration": dislikes penetrative sex
		 * * "shamefast": nervous when naked
		 * * "idealistic": believes sex should be based on love and consent
		 * * "repressed": dislikes sex
		 * * "apathetic": inert during sex
		 * * "crude": sexually crude and has little sense of what partners find disgusting during sex
		 * * "judgemental": sexually judgemental and often judges her sexual partners' performance
		 * * "neglectful": disregards herself in sex
		 * * "cum addict": addicted to cum
		 * * "anal addict": addicted to anal
		 * * "attention whore": addicted to being the center of attention
		 * * "breast growth": addicted to her own breasts
		 * * "abusive": sexually abusive
		 * * "malicious": loves causing pain and suffering
		 * * "self hating": hates herself
		 * * "breeder": addicted to being pregnant
		 * * "animal lover" addicted to fucking animals
		 * @type {FC.SexualFlaw}
		 */
		this.sexualFlaw = "none";
		/**
		 * * "none"
		 * * "gagfuck queen": can take a facefucking
		 * * "painal queen": knows how far she can go without getting hurt
		 * * "strugglefuck queen": knows how much resistance her partners want
		 * * "tease": is a tease
		 * * "romantic": enjoys the closeness of sex
		 * * "perverted": enjoys breaking sexual boundaries
		 * * "caring": enjoys bring her partners to orgasm
		 * * "unflinching": willing to do anything
		 * * "size queen": prefers big cocks
		 * @type {FC.SexualQuirk}
		 */
		this.sexualQuirk = "none";

		this.geneMods = {
			/** Do they have induced NCS?
			 * @type {FC.Bool}
			 * 0: no; 1: yes */
			NCS: 0,
			/** Have they undergone the elasticity (plasticity) treatment?
			 * @type {FC.Bool}
			 * 0: no; 1: yes */
			rapidCellGrowth: 0,
			/** Are they immortal?
			 * @type {FC.Bool}
			 * 0: no; 1: yes */
			immortality: 0,
			/** Have they been treated to produce flavored milk?
			 * @type {FC.Bool}
			 * 0: no; 1: yes */
			flavoring: 0,
			/** Have their sperm been optimized?
			 * @type {FC.Bool}
			 * 0: no; 1: yes */
			aggressiveSperm: 0,
			/** Have they been optimized for production?
			 * @type {FC.Bool}
			 * 0: no; 1: yes */
			livestock: 0,
			/** Have they been optimized for child bearing?
			 * @type {FC.Bool}
			 * 0: no; 1: yes */
			progenitor: 0
		};
		/** @type {string} flavor of their milk*/
		this.milkFlavor = "none";

		/** Stores the exact colors of the albinism quirk
		 * @type {{skin:string, eyeColor:string, hColor:string}}
		 */
		this.albinismOverride = null;
		/** @type {number} Their inbreeding coefficient */
		this.inbreedingCoeff = 0;

		/** @type {FC.Bool | undefined} */
		this.trueVirgin = 0;

		/** @type {App.Entity.Fetus[] | undefined} */
		this.womb = undefined;
	}
};
