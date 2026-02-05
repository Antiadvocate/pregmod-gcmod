// cSpell:ignore Dextreme, Dincest, lolify, lolifying, lolification

/** creates an array from App.Data.HeroSlaves that will be similar to the old $heroSlaves.
 * @returns {FC.HeroSlaveTemplate[]}
 */
App.Utils.buildHeroArray = function() {
	let chunks = [];
	const IDs = [];
	for (const hero of [
		...App.Data.HeroSlaves.XX, ...App.Data.HeroSlaves.XXExtreme,
		...App.Data.HeroSlaves.XXFruitGirls, ...App.Data.HeroSlaves.XXFruitGirlsExtreme,
		...App.Data.HeroSlaves.XXHyperPreg, ...App.Data.HeroSlaves.XXIncest,
		...App.Data.HeroSlaves.XY, ...App.Data.HeroSlaves.XYExtreme,
		...App.Data.HeroSlaves.XYHyperPreg, ...App.Data.HeroSlaves.XYIncest,
		// ...App.Data.HeroSlaves.Custom,
	]) {
		if (hero.ID in IDs) {
			throw new Error(`ID '${hero.ID}' is in use by more than one hero slave`);
		}
		IDs.push(hero.ID);
	}
	if (V.seeDicks < 100) { // XX slaves
		chunks.push(App.Data.HeroSlaves.XX);
		chunks.push(App.Data.HeroSlaves.XXFruitGirls);
		if (V.seeExtreme === 1) {
			chunks.push(App.Data.HeroSlaves.XXExtreme);
			chunks.push(App.Data.HeroSlaves.XXFruitGirlsExtreme);
		}
		if (V.seeIncest === 1) {
			chunks.push(App.Data.HeroSlaves.XXIncest);
		}
		if (V.seeHyperPreg === 1) {
			chunks.push(App.Data.HeroSlaves.XXHyperPreg);
		}
	}
	if (V.seeDicks > 0) { // XY slaves
		chunks.push(App.Data.HeroSlaves.XY);
		if (V.seeExtreme === 1) {
			chunks.push(App.Data.HeroSlaves.XYExtreme);
		}
		if (V.seeIncest === 1) {
			chunks.push(App.Data.HeroSlaves.XYIncest);
		}
		if (V.seeHyperPreg === 1) {
			chunks.push(App.Data.HeroSlaves.XYHyperPreg);
		}
	}
	App.UI.DOM.renderPassage("custom Slaves Database"); // populate V.heroSlaves from user DB
	chunks.push(V.heroSlaves);
	let array = [].concat(...chunks);
	delete V.heroSlaves;

	/** @type {function(FC.SlaveState):boolean} */
	const disallowedPregnantSlave = (s) => (V.seePreg !== 1 && s.preg > 0);
	/** @type {function(FC.SlaveState):boolean} */
	const underAgedSlave = (s) => (s.actualAge < V.minimumSlaveAge);
	array.deleteWith((s) => V.heroSlavesPurchased.includes(s.ID) || disallowedPregnantSlave(s) || underAgedSlave(s));

	const collator = new Intl.Collator('en', {usage: "sort", ignorePunctuation: true});
	return array.sort((a, b) => collator.compare(a.slaveName, b.slaveName));
};

/**
 * Compile an object that pairs the database ID's of related hero slaves, for use in randomly selecting slaves during arcology
 * acquisition. To make sure both family members will be included in the output of "buildHeroArray", use the appropriate checks
 * (see below, and the examples in "buildHeroArray", above) to avoid referencing slaves who won't be found in the game.
 *
 * The slave whose ID serves as the value will appear first during acrology acquisition, with the key slave appearing
 * immediately afterward.
 *
 * @returns {object}
 */
App.Utils.getHeroFamilies = function() {
	let families = {};
	if (V.seeDicks < 100) {
		families = {...families, ...{906007: 906006}};
	}
	if (V.seeDicks > 0 && V.seeDicks < 100) {
		families = {...families, ...{800018: 900076}};
	}
	if (V.seeIncest === 1) {
		families.incest = {};
		if (V.seeDicks < 100) {
			const incestFamilies = {902002: 902001, 902003: 802001};
			families = {...families, ...incestFamilies};
			families.incest = {...families.incest, ...incestFamilies};
		}
	}
	return families;
};

/**
 * @param {FC.HeroSlaveTemplate} heroTemplate
 * @returns {FC.SlaveState}
 */
App.Utils.getHeroSlave = function(heroTemplate) {
	const template = clone(heroTemplate);
	let newAge = undefined;
	/**
	 * @param {FC.SlaveState & FC.HeroSlaveTemplate} slave
	 */
	function repairLimbs(slave) {
		if (slave.hasOwnProperty("_limbs")) {
			if (slave._limbs[0] >= 0) {
				configureLimbs(slave, "left arm", slave._limbs[0]);
			}
			if (slave._limbs[1] >= 0) {
				configureLimbs(slave, "right arm", slave._limbs[1]);
			}
			if (slave._limbs[2] >= 0) {
				configureLimbs(slave, "left leg", slave._limbs[2]);
			}
			if (slave._limbs[3] >= 0) {
				configureLimbs(slave, "right leg", slave._limbs[3]);
			}
			delete slave._limbs;
		}
	}

	// Nationalities, races, surnames random fill
	if (!template.nationality) {
		// Check for a pre-set race and if the nationality fits, else regenerate
		if (template.race && App.Data.misc.filterRaces.has(template.race)) {
			raceToNationality(/** @type {FC.HumanState} */ (template));
		} else {
			template.nationality = hashChoice(V.nationalities);
		}
	}
	if (!template.race || !App.Data.misc.filterRaces.has(template.race)) {
		nationalityToRace(/** @type {FC.HumanState} */ (template));
	}
	if (!template.birthSurname && template.birthSurname !== "") {
		template.birthSurname = (App.Data.misc.surnamePoolSelector[template.nationality + "." + template.race] ||
			App.Data.misc.surnamePoolSelector[template.nationality] ||
			App.Data.misc.whiteAmericanSlaveSurnames).random();
	}
	// Custom hero slaves are created using Twine rather than pure JavaScript, and apparently Twine sets missing
	// values to defaults, which is what "App.Utils.assignMissingDefaults" does for hero slaves from the normal
	// hero databases. This isn't a problem for "birthSurname", since its default of 0 evaluates as "False" and
	// therefore passes the first Boolean test in the block above.
	if ((!template.birthName && template.birthName !== "") || template.birthName === "blank") {
		template.birthName = (App.Data.misc.namePoolSelector[template.nationality + "." + template.race] ||
			App.Data.misc.namePoolSelector[template.nationality] ||
			App.Data.misc.whiteAmericanSlaveNames).random();
	}
	// Setting both "slaveSurname" and "birthSurname" to empty strings removes all mention of surnames from a
	// slave's description--but setting "slaveSurname" to an ampty string and "birthSurname" to anything else
	// produces a description that displays the empty string as if it were an actual name. We need to fix
	// this corner case by making sure "slaveSurname" gets reset to the default (no slave surname displayed).
	if (template.slaveSurname === "" && template.birthSurname !== "") {
		delete template.slaveSurname;
	}
	if (template.slaveName === -1) {
		template.slaveName = template.birthName;
	}
	if (template.slaveSurname === -1) {
		template.slaveSurname = template.birthSurname;
	}

	/** @type {FC.SlaveState} */
	let heroSlave = /** @type {FC.SlaveState} */ (template);
	// make the template a full slave object
	App.Utils.assignMissingDefaults(heroSlave, baseSlave(template.seed));

	generatePronouns(heroSlave);
	heroSlave.ID = generateSlaveID();
	repairLimbs(heroSlave);
	heroSlave.weekAcquired = V.week;
	if (heroSlave.overrideRace !== 1) {
		heroSlave.origRace = heroSlave.race;
	}
	if (heroSlave.overrideEyeColor !== 1) {
		resetEyeColor(heroSlave, "both");
	}
	if (heroSlave.overrideHColor !== 1) {
		heroSlave.hColor = getGeneticHairColor(heroSlave);
	}
	if (heroSlave.overrideArmHColor !== 1) {
		heroSlave.underArmHColor = getGeneticHairColor(heroSlave);
	}
	if (heroSlave.overridePubicHColor !== 1) {
		heroSlave.pubicHColor = getGeneticHairColor(heroSlave);
	}
	if (heroSlave.overrideBrowHColor !== 1) {
		heroSlave.eyebrowHColor = getGeneticHairColor(heroSlave);
	}
	if (heroSlave.overrideSkin !== 1) {
		heroSlave.skin = getGeneticSkinColor(heroSlave);
	}
	if (!template.natural?.height) {
		// assumes adult - child hero slaves MUST specify natural height separately!
		heroSlave.natural.height = heroSlave.height - heroSlave.heightImplant * 10;
	}
	if (!template.natural?.boobs) {
		// assumes a natural chest- child and male hero slaves, as well as those with unnatural busts, MUST specify natural size separately!
		heroSlave.natural.boobs = heroSlave.boobs;
	}
	if (!template.natural?.artSeed) {
		heroSlave.natural.artSeed = jsRandom(0, 10 ** 14);
	}

	/* If we're in pedo mode, later we're going	to "lolify" slaves older than 17, placing them in the pedo range. However, we want to avoid
		lolifying slaves with skills for leadership roles that benefit from their original age. We set the flag here in case there are
		siblings (see below) who need to be kept older. Currently, there are no such siblings in the database, but if there were, the
		custom siblings code for the family in question might have to set the flag to keep one sibling (with skills) from being lolified
		while the other (without skills) is. If the sibling without skills were acquired first, things would break unless that slave's
		database ID were saved before a slave ID is assigned, above, so that the database ID could be checked against "getHeroFamilies".
	*/
	const keepSlaveOld = App.Utils.oldIsGood(heroSlave);

	/* The following exceptions to keep siblings sensible in the Special Slave Market, mostly to make sure one acquired later ages the same
		amount as one acquired earlier, but also to restore incestuous relationships. During arcology acquisition, this code won't work,
		because family members are both generated before being added to the gene pool, and the relationship check functions use the gene
		pool. Thus, we do things differently there (and in any case we don't need to worry about age updates during arcology acquisition).

		For pedo mode, we use a smaller age gap, which should be the gap that results from lolifying both siblings at the same time (under
		typical pedo setting of minimum slave age at 12 or less), as happens if they're viewed in the Special Market before one of them is
		bought. This prevents minimizes the chance that a slave from changing age in the market display after her sibling is bought.
	*/
	let slave;
	if (heroSlave.mother === -9999 && heroSlave.father === -9998) { // The twins — Camille & Kennerly
		slave = getSlaves().find(s => areSisters(s, heroSlave) > 0)?.value;
		if (slave) {
			heroSlave.actualAge = slave.actualAge;
			heroSlave.physicalAge = heroSlave.actualAge;
			heroSlave.visualAge = heroSlave.actualAge;
			heroSlave.ovaryAge = heroSlave.actualAge;
			heroSlave.birthWeek = slave.birthWeek;
			heroSlave.natural.artSeed = slave.natural.artSeed;
			/* The twins will re-ignite their incestuous relationship unless the existing twin is in a relationship with another slave or married
				to the PC. The twincest *will* override "emotionally bound"; they love each other *that* much (and it gives a player who bought
				only one of them initially an easy way to keep her on ice until he can grab the other one). */
			if (slave.relationship >= -2 && slave.relationship <= 0) {
				slave.relationship = 3;
				slave.relationshipTarget = heroSlave.ID;
				heroSlave.relationship = 3;
				heroSlave.relationshipTarget = slave.ID;
			}
		}
	}
	if (heroSlave.mother === -9997 && heroSlave.father === -9996) { // The rebel siblings — Elisa & Martin
		slave = getSlaves().find(s => areSisters(s, heroSlave) > 0)?.value;
		if (slave) {
			const adjustedAge = adjustNewSiblingAge(heroSlave, slave, "Elisa", "Martin", 1, 1);
			newAge = adjustedAge;

			// In pedo mode, the lolify function uses "newAge" to set the age values, and we need to preserve the existing ones for now so it knows
			// what to work backware from.
			if (V.pedoMode === 0) {
				heroSlave.actualAge = newAge;
				heroSlave.physicalAge = heroSlave.actualAge;
				heroSlave.visualAge = heroSlave.actualAge;
				heroSlave.ovaryAge = heroSlave.actualAge;
			}
		}
	}
	if (heroSlave.mother === -9995 && heroSlave.father === -9994) { // The fruit siblings — Green & Purple Grape
		slave = getSlaves().find(s => areSisters(s, heroSlave) > 0)?.value;
		if (slave) {
			const adjustedAge = adjustNewSiblingAge(heroSlave, slave, "Green Grape", "Purple Grape", 5, 3);
			newAge = adjustedAge;

			// In pedo mode, the lolify function uses "newAge" to set the age values, and we need to preserve the existing ones for now so it knows what to work backware from.
			if (V.pedoMode === 0) {
				heroSlave.actualAge = newAge;
				heroSlave.physicalAge = heroSlave.actualAge;
				heroSlave.visualAge = heroSlave.actualAge;
				heroSlave.ovaryAge = heroSlave.actualAge;
			}
		}
	}
	if (heroSlave.mother === -9993 && heroSlave.father === -9992) { // The professional siblings — Bai & Qiang
		slave = getSlaves().find(s => areSisters(s, heroSlave) > 0)?.value;
		if (slave) {
			const adjustedAge = adjustNewSiblingAge(heroSlave, slave, "Qiang", "Bai", 2, 2);
			newAge = adjustedAge;

			// In pedo mode, the lolify function uses "newAge" to set the age values, and we need to preserve the existing ones for now so it knows what to work backware from.
			if (V.pedoMode === 0) {
				heroSlave.actualAge = newAge;
				heroSlave.physicalAge = heroSlave.actualAge;
				heroSlave.visualAge = heroSlave.actualAge;
				heroSlave.ovaryAge = heroSlave.actualAge;
			}
			if (slave.relationship >= -2 && slave.relationship <= 0) {
				slave.relationship = 3;
				slave.relationshipTarget = heroSlave.ID;
				heroSlave.relationship = 3;
				heroSlave.relationshipTarget = slave.ID;
			}
		}
	}

	/* In pedo mode, we're going to "lolify" slaves to fit them within the pedo age range (though not to younger than 12, since making them too
		young creates too much weirdness with origins, careers, and such). We do this close to the end of the function because we want to make
		sure that anything that needs to get adjusted for age (in particular, physical aseets) has already been set.

		There's no need to lolify slaves who are already under 18. 18 falls into the pedo mode range, but there are a LOT of 18-year-olds in the
		hero database, and they're meant to be close to the youngest heroes.

	*/
	if (newAge && newAge > 17 && heroSlave.actualAge !== newAge) {
		heroSlave.physicalAge += newAge - heroSlave.actualAge;
		heroSlave.visualAge += newAge - heroSlave.actualAge;
		heroSlave.ovaryAge += newAge - heroSlave.actualAge;
		heroSlave.actualAge = newAge;
	} else if (V.lolifier && heroSlave.physicalAge > 12) { // pregmodders variant, makes lolis based off age.
		if (heroSlave.physicalAge > 40) {
			heroSlave = lolifySlave(heroSlave, true, Math.max(12, V.minimumSlaveAge+4));
		}
		if (heroSlave.physicalAge > 30) {
			heroSlave = lolifySlave(heroSlave, true, Math.max(11, V.minimumSlaveAge+3));
		}
		if (heroSlave.physicalAge > 22) {
			heroSlave = lolifySlave(heroSlave, true, Math.max(10, V.minimumSlaveAge+2));
		}
		if (heroSlave.physicalAge > 16) {
			heroSlave = lolifySlave(heroSlave, true, Math.max(9, V.minimumSlaveAge+1));
		}
		if (heroSlave.physicalAge > 12) {
			heroSlave = lolifySlave(heroSlave, true, Math.max(8, V.minimumSlaveAge));
		}
		// In pedo mode with a high minimum age setting, it's possible two siblings with an age gap of 1 might have birthdays too close together.
		if (slave) {
			const lolifiedAgeGap = heroSlave.actualAge - slave.actualAge;
			if (lolifiedAgeGap === 1) {
				const minBirthWeek = slave.birthWeek - 10;
				if (heroSlave.birthWeek < minBirthWeek) {
					heroSlave.birthWeek = random(minBirthWeek, 51);
				}
			} else if (lolifiedAgeGap === 0) {
				heroSlave.birthWeek = slave.birthWeek; // Fraternal twins
			} else if (lolifiedAgeGap === -1) {
				const maxBirthWeek = slave.birthWeek + 10;
				if (heroSlave.birthWeek > maxBirthWeek) {
					heroSlave.birthWeek = random(0, maxBirthWeek);
				}
			}
		}
	} else if (V.pedoMode === 1 && heroSlave.physicalAge > 17 && !keepSlaveOld) {
		heroSlave = lolifySlave(heroSlave, newAge); // Except in the case of maintaining a sibling age gap, "newAge" is undefined.
		// In pedo mode with a high minimum age setting, it's possible two siblings with an age gap of 1 might have birthdays too close together.
		if (slave) {
			const lolifiedAgeGap = heroSlave.actualAge - slave.actualAge;
			if (lolifiedAgeGap === 1) {
				const minBirthWeek = slave.birthWeek - 10;
				if (heroSlave.birthWeek < minBirthWeek) {
					heroSlave.birthWeek = random(minBirthWeek, 51);
				}
			} else if (lolifiedAgeGap === 0) {
				heroSlave.birthWeek = slave.birthWeek; // Fraternal twins
			} else if (lolifiedAgeGap === -1) {
				const maxBirthWeek = slave.birthWeek + 10;
				if (heroSlave.birthWeek > maxBirthWeek) {
					heroSlave.birthWeek = random(0, maxBirthWeek);
				}
			}
		}
	}


	// The three functions called below are the only ones that depend on age, so we save them until after lolification.
	generatePuberty(heroSlave);
	setHealth(heroSlave, heroSlave.health.condition, 0, 0, 0, heroSlave.health.tired);
	SetBellySize(heroSlave);

	nationalityToAccent(heroSlave);
	return heroSlave;
};

/**
 * Returns true if an older age is better (career wise) for the given slave
 * @param {FC.SlaveState} slave
 * @returns {boolean}
 */
App.Utils.oldIsGood = function(slave) {
	const headGirlSkill = App.Data.Careers.Leader.HG.includes(slave.career) || slave.skill.headGirl >= Constant.MASTERED_XP;

	const madamSkill = App.Data.Careers.Leader.madam.includes(slave.career) || slave.skill.madam >= Constant.MASTERED_XP;
	const stewardessSkill = App.Data.Careers.Leader.stewardess.includes(slave.career) || slave.skill.stewardess >= Constant.MASTERED_XP;
	const actualAge36Skill = slave.actualAge >= 36 && (madamSkill || stewardessSkill);

	const attendantSkill = App.Data.Careers.Leader.attendant.includes(slave.career) || slave.skill.attendant >= Constant.MASTERED_XP;
	const schoolteacherSkill = App.Data.Careers.Leader.schoolteacher.includes(slave.career) || slave.skill.teacher >= Constant.MASTERED_XP;
	const visualAge36Skill = slave.physicalAge >= 36 && (attendantSkill || schoolteacherSkill);

	return headGirlSkill || actualAge36Skill || visualAge36Skill;
};

/**
 * Adjust sibling ages when acquiring them separately in the Special Market, making sure their final age gap is large enough to allow for the second
 * one to gestate, or turning them into fraternal twins.
 * @param {FC.SlaveState} newSibling
 * @param {FC.SlaveState} existingSibling
 * @param {string} youngerName
 * @param {string} olderName
 * @param {number} ageGap
 * @param {number} pedoAgeGap
 * @returns {number}
 */
const adjustNewSiblingAge = function(newSibling, existingSibling, youngerName, olderName, ageGap, pedoAgeGap) {
	let newAge;
	ageGap = (V.pedoMode === 0 ? ageGap : pedoAgeGap);
	if (newSibling.birthName === youngerName) {
		newAge = Math.max(existingSibling.actualAge - ageGap, V.minimumSlaveAge);
	} else if (newSibling.birthName === olderName) {
		newAge = Math.min(existingSibling.actualAge + ageGap, V.retirementAge - 1);
		if (V.pedoMode === 1) {
			newAge = Math.min(newAge, 18);
		}
	}
	return newAge;
};
