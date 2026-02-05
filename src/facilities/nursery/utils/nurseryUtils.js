/**
 * Displays a list of the children in the Nursery
 * @returns {DocumentFragment}
 */
App.Facilities.Nursery.childList = function childList() {
	let frag = document.createDocumentFragment();
	let r = [];

	if (V.nurseryChildren) {
		App.UI.DOM.appendNewElement("h3", frag, `Children in ${V.nurseryName}`, "indent");

		const list = App.UI.DOM.appendNewElement("p", frag, '', "indent");

		for (const child of getInfants().values()) {
			const weeksOwned = V.week - child.weekAcquired;
			const weeksLeft = (V.targetAgeNursery * 52) - weeksOwned;
			const {he, him, He} = getPronouns(child);

			list.appendChild(App.UI.sectionBreak());

			if (child.actualAge < 3) {
				$(list).append(App.UI.DOM.link(SlaveFullName(child), (id) => V.activeChild = getInfant(id), [child.ID], "Infant Interact"));
				$(list).append(App.Facilities.Nursery.InfantSummary(child));
			} else {
				$(list).append(App.UI.DOM.link(SlaveFullName(child), (id) => V.activeChild = getInfant(id), [child.ID], "Child Interact"));
				$(list).append(App.Facilities.Nursery.ChildSummary(child));
			}

			if (weeksLeft <= 0 || child.actualAge >= V.targetAgeNursery) {
				const targetText = child.targetLocation === "slavery" ? `Introduce ${him} to life as a slave` : `Set ${him} free`;

				list.appendChild(document.createElement("br"));

				r.push(` ${He} is ready to leave ${V.nurseryName} and ${child.targetLocation === "slavery" ? `join your ménage` : `become a free citizen`}.`);
				$(list).append(App.UI.DOM.passageLink(targetText, "Nursery Retrieval Workaround", () => {
					V.temp.AS = child.ID;
					deleteProps(child, "targetLocation");
					// TODO: FIXME: handle `targetLocation` in `App.UI.facilityRetrievalWorkaround("Nursery")` or remove it and all references to it completely from `InfantState`
					V.nurseryChildren--;
				}));
			} else {
				list.appendChild(document.createElement("br"));

				r.push(`${He} is to continue staying in ${V.nurseryName} for another ${years(child.growTime)}. ${He} is destined for ${child.targetLocation} once ${he} is of age.`);
			}

			$(list).append(r.join(' '));

			r = [];	// reset for next child
		}
	}

	return frag;
};

/**
 * Converts the infant object into a new child object
 * @param {object} child
 * @returns {object}
 */
App.Facilities.Nursery.infantToChild = function infantToChild(child) {
	child.boobShape = jsEither(["normal", "normal", "normal", "perky", "perky", "perky", "torpedo-shaped", "downward-facing", "wide-set"]);
	child.boobs = jsRandom(200, 500);
	child.butt = jsRandom(0, 3);
	child.clit = jsRandom(0, 2);
	child.devotion = 40;
	child.oldDevotion = 40;
	child.energy = 0;
	child.fertKnown = 1;
	child.fetishStrength = 0;
	child.hLength = jsRandom(30, 70);
	setHealth(child, jsRandom(80, 100), 0, 0, 0, 0);
	child.intelligence = 100;
	child.labia = jsRandom(0, 2);
	child.lips = jsRandom(10, 30);
	child.rules.living = "normal";
	child.muscles = jsRandom(-10, 10);
	if (child.boobs > 500 || child.weight > 95) {
		child.nipples = jsEither(["cute", "puffy", "partially inverted", "inverted", "tiny"]);
	} else {
		child.nipples = jsEither(["cute", "cute", "cute", "tiny"]);
	}
	child.origRace = child.race;
	if (child.eyeColor) {
		child.eye.origColor = child.eyeColor;
	}
	child.origSkin = child.skin;
	child.ovaries = child.genes === "XX" ? 1 : 0;
	child.ovaryAge = child.actualAge;
	child.physicalAge = child.actualAge;
	child.teeth = "baby";
	child.vagina = child.genes === "XX" ? 0 : -1;
	child.visualAge = child.actualAge;
	child.weight = jsRandom(-10, 10);
	resetEyeColor(child, "both");
	generatePronouns(child);
	child.height = Height.forAge(child.natural.height, child);

	return child;
};

/**
 * Allows the player to name the infant
 * FIXME: Does not currently work
 * @param {object} child
 * @returns {string}
 */
App.Facilities.Nursery.nameChild = function nameChild(child) {
	const PC = V.PC;
	const arcology = V.arcologies[0];
	const girl = child.genes === "XX" ? "girl" : "boy";

	let r = ``;
	/** @type {FC.Zeroable<FC.HumanState>} */
	let father = 0;
	/** @type {FC.Zeroable<FC.HumanState>} */
	let mother = 0;

	const {him, his, he} = getPronouns(child);

	if (child.father === SID.PC && child.mother === SID.PC) {
		father = PC;
		mother = PC;
	} else {
		if (child.father === SID.PC) {
			father = PC;
			mother = getSlave(child.mother);
		} else if (child.mother === SID.PC) {
			father = getSlave(child.father);
			mother = PC;
		} else {
			father = getSlave(child.father);
			mother = getSlave(child.mother);
		}
	}

	function newChildName(child) {
		child.birthName = generateName(child.nationality, child.race, child.genes === "XY");

		if (child.genes === "XY" && !V.allowMaleSlaveNames && isMaleName(child.birthName, child.nationality, child.race)) {
			child.slaveName = generateName(child.nationality, child.race, false);
		} else {
			child.slaveName = child.birthName;
		}
	}

	r += `You can name the new child, if you so desire. `;

	r += `<br><<textbox "${child.slaveName}" ${child.slaveName}>>`;
	r += App.UI.passageLink("Commit name", "Nursery Workaround", `${child.birthName = child.slaveName}, ${App.UI.replace("#naming", `You instruct ${V.assistant.name} to register the new ${girl} as "${child.slaveName}" in the slave registry.`)}`);
	r += `<br>`;
	r += App.UI.passageLink(`Have your PA assign ${him} a random name`, "Nursery Workaround", `${App.UI.replace("#naming", `${newChildName(child)}<br>${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.`)}`);

	if (FutureSocieties.isActive('FSPastoralist', arcology)) {
		if (child.lactation > 0) {
			r += `<br>
			<<link "Have your PA assign ${him} a random cow name">>
			<<replace "#naming">>`;
			child.slaveName = App.Data.misc.cowSlaveNames.random();
			child.birthName = child.slaveName;
			r += `${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.
			<</replace>>
			<</link>>`;
		}
	}
	if (child.race === "catgirl") {
		r += `<br>
		<<link "Have your PA assign ${him} a random cat name">>
		<<replace "#naming">>`;
		child.slaveName = App.Data.misc.catSlaveNames.random();
		child.birthName = child.slaveName;
		r += `${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.
		<</replace>>
		<</link>>`;
	}
	if (FutureSocieties.isActive('FSChattelReligionist', arcology)) {
		r += `<br>
		<<link "Have your PA assign ${him} a random devotional name">>
			<<replace "#naming">>`;
		child.slaveName = App.Data.misc.chattelReligionistSlaveNames.random();
		child.birthName = child.slaveName;
		r += `${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.
			<</replace>>
		<</link>>`;
	}
	if (FutureSocieties.isActive('FSRomanRevivalist', arcology)) {
		r += `<br>
		<<link "Have your PA assign ${him} a random Roman name">>
			<<replace "#naming">>`;
		child.slaveName = App.Data.misc.romanSlaveNames.random();
		child.birthName = child.slaveName;
		r += `${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.
			<</replace>>
		<</link>>`;
	} else if (FutureSocieties.isActive('FSAztecRevivalist', arcology)) {
		r += `<br>
		<<link "Have your PA assign ${him} a random Aztec name">>
			<<replace "#naming">>`;
		child.slaveName = App.Data.misc.aztecSlaveNames.random();
		child.birthName = child.slaveName;
		r += `${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.
			<</replace>>
		<</link>>`;
	} else if (FutureSocieties.isActive('FSEgyptianRevivalist', arcology)) {
		r += `<br>
		<<link "Have your PA assign ${him} a random ancient Egyptian name">>
			<<replace "#naming">>`;
		child.slaveName = App.Data.misc.ancientEgyptianSlaveNames.random();
		child.birthName = child.slaveName;
		r += `${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.
			<</replace>>
		<</link>>`;
	} else if (FutureSocieties.isActive('FSEdoRevivalist', arcology)) {
		r += `<br>
		<<link "Have your PA assign ${him} a random feudal Japanese name">>
			<<replace "#naming">>`;
		child.slaveName = App.Data.misc.edoSlaveNames.random();
		child.birthName = child.slaveName;
		r += `${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.
			<</replace>>
		<</link>>`;
	}
	if (FutureSocieties.isActive('FSDegradationist', arcology)) {
		r += `<br>
		<<link "Have your PA assign ${him} a degrading name">>
			<<replace "#naming">>`;
		DegradingName(child);
		child.birthName = child.slaveName;
		r += `${V.assistant.name} registers the new ${girl} as "${child.slaveName}" in your registry.
			<</replace>>
		<</link>>`;
	}
	if (mother !== PC && mother !== 0) {
		const {He2, he2, his2} = getPronouns(mother).appendSuffix('2');
		if (mother.ID === V.ConcubineID) {
			r += `<br>
			<<link "Permit your Concubine to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(mother, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${mother.slaveName} picks a name ${he2} thinks you might find attractive; from now on ${his2} daughter will be known as "${child.slaveName}".
				<</replace>>
			<</link>>`;
		} else if (mother.relationship === -3 && mother.devotion >= -20) {
			r += `<br>
			<<link "Permit your wife to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(mother, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${mother.slaveName} picks a name suitable for your daughter; from now on ${he2} will be known as "${child.slaveName}".
				<</replace>>
			<</link>>`;
		} else if (mother.ID === V.BodyguardID) {
			r += `<br>
			<<link "Permit your bodyguard to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(mother, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${mother.slaveName} decides on "${child.slaveName}" for ${his2} daughter. ${He2} hopes you'll find it fitting ${his} station.
				<</replace>>
			<</link>>`;
		} else if (mother.ID === V.HeadGirlID) {
			r += `<br>
			<<link "Permit your Head Girl to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(mother, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${mother.slaveName} decides on "${child.slaveName}" for ${his2} daughter, and hopes it will be a name your other slaves will learn to respect.
				<</replace>>
			<</link>>`;
		} else if (mother.devotion > 50 && mother.trust > 50) {
			r += `<br>
			<<link "Permit ${his} devoted mother to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(mother, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${mother.slaveName} picks a name ${he2} hopes you'll like; from now on ${his2} daughter will be known as "${child.slaveName}".
				<</replace>>
			<</link>>`;
		}
	}
	if (father !== PC && father !== 0 && father !== mother) {
		const {He2, he2, his2} = getPronouns(father).appendSuffix('2');
		if (father.ID === V.ConcubineID) {
			r += `<br>
			<<link "Permit your Concubine to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(father, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${father.slaveName} picks a name ${he2} thinks you might find attractive; from now on ${his2} daughter will be known as "${child.slaveName}".
				<</replace>>
			<</link>>`;
		} else if (father.relationship === -3 && father.devotion >= -20) {
			r += `<br>
			<<link "Permit your wife to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(father, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${father.slaveName} picks a name suitable for your daughter; from now on ${he} will be known as "${child.slaveName}".
				<</replace>>
			<</link>>`;
		} else if (father.ID === V.BodyguardID) {
			r += `<br>
			<<link "Permit your bodyguard to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(father, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${father.slaveName} decides on "${child.slaveName}" for ${his2} daughter. ${He2} hopes you'll find it fitting ${his} station.
				<</replace>>
			<</link>>`;
		} else if (father.ID === V.HeadGirlID) {
			r += `<br>
			<<link "Permit your Head Girl to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(father, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${father.slaveName} decides on "${child.slaveName}" for ${his2} daughter, and hopes it will be a name your other slaves will learn to respect.
				<</replace>>
			<</link>>`;
		} else if (father.devotion > 50 && father.trust > 50) {
			r += `<br>
			<<link "Permit ${his} devoted father to name ${his2} daughter">>
				<<replace "#naming">>`;
			parentNames(father, child);
			child.birthName = child.slaveName;
			r += `After some careful consideration, ${father.slaveName} picks a name ${he2} hopes you'll like; from now on ${his2} daughter will be known as "${child.slaveName}".
				<</replace>>
			<</link>>`;
		}
	}

	return r;
};

/**
 * Adds an infant to the cribs
 * @param {FC.InfantState} child
 */
App.Facilities.Nursery.newChild = function newChild(child) {
	child.ID = generateSlaveID();

	child.actualAge = 0;
	child.ovaryAge = 0;
	child.physicalAge = 0;
	child.visualAge = 0;
	child.birthWeek = 0;

	if (child.overrideRace !== 1) {
		child.origRace = child.race;
	}

	if (child.overrideHColor !== 1) {
		child.hColor = getGeneticHairColor(child);
	}
	if (child.overrideArmHColor !== 1) {
		child.underArmHColor = getGeneticHairColor(child);
	}
	if (child.overridePubicHColor !== 1) {
		child.pubicHColor = getGeneticHairColor(child);
	}
	if (child.overrideBrowHColor !== 1) {
		child.eyebrowHColor = getGeneticHairColor(child);
	}
	if (child.overrideSkin !== 1) {
		child.origSkin = getGeneticSkinColor(child);
	}
	child.overrideRace = 0;
	child.overrideHColor = 0;
	child.overrideArmHColor = 0;
	child.overridePubicHColor = 0;
	child.overrideBrowHColor = 0;
	child.overrideSkin = 0;
	child.overrideEyeColor = 0;

	child.arm = {
		left: new App.Entity.ArmState(),
		right: new App.Entity.ArmState()
	};
	child.leg = {
		left: new App.Entity.LegState(),
		right: new App.Entity.LegState()
	};

	if (V.surnamesForbidden === 1) {
		child.slaveSurname = 0;
	}

	if (child.clone !== 0) {
		child.canRecruit = 0;
	}
	generatePronouns(child);
	const {He} = getPronouns(child);
	child.origin = `${He} was born and raised in your arcology. `;
	child.targetLocation = "slavery";
	child.growTime = V.targetAgeNursery * 52;
	addInfant(child);
	V.nurseryChildren++;
};

/**
 * Displays a list of slaves with children eligible for the Nursery
 * FIXME: Does not currently work
 * @returns {string}
 */
App.Facilities.Nursery.nurserySort = function nurserySort() {
	const PC = V.PC;
	const arcology = V.arcologies[0];
	const freeCribs = (V.nurseryCribs - infantCount());

	let r = ``;
	let eligibility = 0;
	let sortNurseryList = V.sortNurseryList || "Unsorted";
	let nurseryHasReservedChildren = false;
	let reservedChildrenNursery = FetusGlobalReserveCount("nursery");

	r += `<br><i>Sorting:</i> <b><span id="ql-nursery-sort">${sortNurseryList}.</span></b> `;
	r += `${App.UI.passageLink("Sort by Name", "Nursery", `${sortNurseryList = "Name"}, ${App.UI.replace(`#ql-nursery-sort`, sortNurseryList)}, ${byName()}`)} | `;
	r += `${App.UI.passageLink("Sort by Reserved Nursery Spots", "Nursery", `${sortNurseryList = "Reserved Nursery Spots"}, ${App.UI.replace(`#ql-nursery-sort`, sortNurseryList)}, ${byReservedSpots()}`)} | `;
	r += `${App.UI.passageLink("Sort by Pregnancy Week", "Nursery", `${sortNurseryList = "Pregnancy Week"}, ${App.UI.replace(`#ql-nursery-sort`, sortNurseryList)}, ${byPregnancyWeek()}`)} | `;
	r += `${App.UI.passageLink("Sort by Number of Children", "Nursery", `${sortNurseryList = "Number of Children"}, ${App.UI.replace(`#ql-nursery-sort`, sortNurseryList)}, ${byPregnancyCount()}`)}`;
	r += `<br>`;

	r += `<div id="ql-nursery">`;

	for (const slave of getSlaves().values()) {
		const {His, his} = getPronouns(slave);

		if (slave.preg > 0 && !slave.broodmother && slave.pregKnown && slave.eggType === "human") {
			if (slave.assignment !== Job.DAIRY && V.dairyPregSetting <= 0) {
				const slaveID = "slave-" + slave.ID;
				const WL = slave.womb.length;
				const reservedNursery = WombReserveCount(slave, "nursery");
				const reservedIncubator = WombReserveCount(slave, "incubator");
				const pregWeek = slave.pregWeek;
				const slaveName = SlaveFullName(slave);

				r += `<div class="possible" @id="${slaveID}" @data-preg-count="${WL}" @data-reserved-spots="${reservedNursery}" @data-preg-week="${pregWeek}" @data-name="${slaveName}">`;

				r += `${App.UI.SlaveDescriptionDialog(slave)} is ${pregWeek} weeks pregnant with `;

				switch (slave.pregSource) {
					case SID.GENERIC:
						r += `someone's${slave.preg <= 5 ? `, though it is too early to tell whose,` : ``}`;
						break;
					case SID.PC:
						r += `your`;
						break;
					case SID.CITIZEN:
						r += `a citizen's`;
						break;
					case SID.FORMERMASTER:
						r += `your Master's`;
						break;
					case SID.ARCOWNER:
						r += `another arcology owner's`;
						break;
					case SID.CLIENT:
						r += `your client's`;
						break;
					case SID.ELITE:
						r += `the Societal Elite's`;
						break;
					case SID.LAB:
						r += `the lab's`;
						break;
					case SID.FUTA:
						r += `the Futanari Sister's`;
						break;
					case SID.RAPIST:
						r += `your rapist`;
						break;
					default:
						if (slave.preg <= 5) {
							r += `someone's, though it is too early to tell whose,`;
						} else {
							let source = getSlave(slave.pregSource);
							if (source !== undefined) {
								r += `${source.slaveName}'s`;
							}
						}
						break;
				}
				r += ` ${WL > 1 ? `babies` : `baby`}. `;

				if (reservedNursery > 0) {
					nurseryHasReservedChildren = true;
					if (WL === 1) {
						r += `${His} child will be placed in ${V.nurseryName}. `;
					} else if (reservedNursery < WL) {
						r += `${reservedNursery} of ${his} children will be placed in ${V.nurseryName}. `;
					} else if (WL === 2) {
						r += `Both of ${his} children will be placed in ${V.nurseryName}. `;
					} else {
						r += `All ${reservedNursery} of ${his} children will be placed in ${V.nurseryName}. `;
					}

					if ((reservedIncubator + reservedNursery < WL) && (reservedChildrenNursery < freeCribs)) {
						r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
						r += App.UI.passageLink("Keep another child", "Nursery", `${WombAddToGenericReserve(slave, "nursery", 1)}`);
						if (reservedNursery > 0) {
							r += ` | ${App.UI.passageLink("Keep one less child", "Nursery", `${WombCleanGenericReserve(slave, "nursery", 1)}`)}`;
						}
						if (reservedNursery > 1) {
							r += ` | ${App.UI.passageLink(`Keep none of ${his} children`, "Nursery", `${WombCleanGenericReserve(slave, "nursery", 9999)}`)}`;
						}
						if (reservedChildrenNursery + WL - reservedNursery <= freeCribs) {
							r += ` | ${App.UI.passageLink(`Keep the rest of ${his} children`, "Nursery", `${WombAddToGenericReserve(slave, "nursery", 9999)}`)}`;
						}
					} else if (reservedNursery === WL || reservedChildrenNursery === freeCribs || reservedIncubator + reservedNursery === WL) {
						r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
						r += App.UI.passageLink("Keep one less child", "Nursery", `${WombCleanGenericReserve(slave, "nursery", 1)}`);
						if (reservedNursery > 1) {
							r += ` | ${App.UI.passageLink(`Keep none of ${his} children`, "Nursery", `${WombCleanGenericReserve(slave, "nursery", 9999)}`)}`;
						}
					}
				} else if (reservedChildrenNursery < freeCribs && freeCribs > WL) {
					if (WL - reservedIncubator === 0) {
						r += `<i>${His} children are already reserved for ${V.incubator.name}</i>`;
						r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
						r += App.UI.passageLink(`Keep ${his} child${WL > 1 ? `ren` : ``} here instead`, "Nursery", `${WombAddToGenericReserve(slave, "nursery", 1)}`);
					} else {
						r += `You have ${freeCribs === 1 ? `an ` : ``}<span class="lime">available room${freeCribs > 1 ? `s` : ``}.</span> `;
						r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
						r += App.UI.passageLink(`Keep ${WL > 1 ? `a` : `the`} child`, "Nursery", `${WombAddToGenericReserve(slave, "nursery", 1)}`);
						if (WL > 1 && (reservedChildrenNursery + WL - reservedNursery <= freeCribs)) {
							r += ` | ${App.UI.passageLink(`Keep all of ${his} children`, "Nursery", `${WombAddToGenericReserve(slave, "nursery", 9999)}`)}`;
						}
					}
				} else if (reservedChildrenNursery === freeCribs) {
					r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
					r += `You have <span class="red">no room for ${his} offspring.</span> `;
				}

				eligibility = 1;
				r += `</div>`;
			}
		}
	}

	r += `</div>`;

	$('div#ql-nursery').ready(byPreviousSort);

	if (!eligibility) {
		r += `<br>`;
		r += `<i>You have no pregnant slave bearing eligible children</i>`;
	}

	if (PC.pregKnown && (!FutureSocieties.isActive('FSRestart', arcology) || V.eugenicsFullControl || (PC.pregSource !== SID.PC && PC.pregSource !== SID.ELITE))) {
		const WL = PC.womb.length;

		let reservedIncubator = WombReserveCount(PC, "incubator");
		let reservedNursery = WombReserveCount(PC, "nursery");

		r += `<br><b><span class="pink">You're pregnant</span></b> and going to have ${WL === 1 ? `a baby. ` : pregNumberName(WL, 1)} `;

		if (reservedNursery > 0) {
			nurseryHasReservedChildren = true;
			if (WL === 1) {
				r += `Your child will be placed in ${V.nurseryName}.`;
			} else if (reservedNursery < WL) {
				r += `${reservedNursery} of your children will be placed in ${V.nurseryName}.`;
			} else if (WL === 2) {
				r += `Both of your children will be placed in ${V.nurseryName}.`;
			} else {
				r += `All ${reservedNursery} of your children will be placed in ${V.nurseryName}.`;
			}

			if (reservedNursery < WL && reservedChildrenNursery < freeCribs && reservedNursery - reservedIncubator > 0) {
				r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
				r += App.UI.passageLink("Keep another child", "Nursery", `${reservedNursery += 1}, ${reservedChildrenNursery += 1}`);
				if (reservedNursery > 0) {
					r += ` | ${App.UI.passageLink("Keep one less child", "Nursery", `${reservedNursery -= 1}, ${reservedChildrenNursery -= 1}`)}`;
				}

				if (reservedNursery > 1) {
					r += ` | ${App.UI.passageLink("Keep none of your children", "Nursery", `${reservedChildrenNursery -= reservedNursery}, ${reservedChildrenNursery = 0}`)}`;
				}

				if (reservedChildrenNursery + WL - reservedNursery <= freeCribs) {
					r += ` | ${App.UI.passageLink("Keep the rest of your children", "Nursery", `${reservedChildrenNursery += (WL - reservedNursery)}, ${reservedNursery += (WL - reservedNursery)}`)}`;
				}
			} else if (reservedNursery === WL || reservedChildrenNursery === freeCribs || reservedNursery - reservedIncubator >= 0) {
				r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
				r += App.UI.passageLink("Keep one less child", "Nursery", `${reservedNursery -= 1}, ${reservedChildrenNursery -= 1}`);
				if (reservedNursery > 1) {
					r += App.UI.passageLink("Keep none of your children", "Nursery", `${reservedChildrenNursery -= reservedNursery}, ${reservedNursery = 0}`);
				}
			}
		} else if (reservedChildrenNursery < freeCribs) {
			if (WL - reservedIncubator === 0) {
				r += `<i>Your child${WL > 1 ? `ren are` : ` is`} already reserved for ${V.incubator.name}</i>`;
				r += App.UI.passageLink(`Keep your child${WL > 1 ? `ren` : ``} here instead`, "Nursery", `${reservedNursery += WL}, ${reservedIncubator = 0}`);
			} else {
				r += `You have ${freeCribs === 1 ? `an ` : ``}<span class="lime">available room${freeCribs > 1 ? `s` : ``}. `;
				r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
				r += App.UI.passageLink(`Keep ${WL > 1 ? `a` : `your`} child`, "Nursery", `${reservedNursery += 1}, ${reservedChildrenNursery += 1}`);
				if (WL > 1 && (reservedChildrenNursery + WL - reservedNursery <= freeCribs)) {
					r += ` | ${App.UI.passageLink("Keep all of your children", "Nursery", `${reservedChildrenNursery += WL}, ${reservedNursery += WL}`)}`;
				}
			}
		} else if (reservedChildrenNursery === freeCribs) {
			r += `<br>&nbsp;&nbsp;&nbsp;&nbsp;`;
			r += `You have <span class="red">no room for your offspring.</span> `;
		}
	}

	if (reservedChildrenNursery || nurseryHasReservedChildren) {
		r += `<br>`;
		r += App.UI.passageLink("Clear all reserved children", "Nursery", `${getSlaves().forEach((slave) => WombCleanGenericReserve(slave, "nursery", 9999))}, ${WombCleanGenericReserve(PC, "nursery", 9999)}`);
	}

	function byName() {
		let sortedNurseryPossibles = $('#ql-nursery div.possible').detach();
		sortedNurseryPossibles = sortDomObjects(sortedNurseryPossibles, 'data-name');
		$(sortedNurseryPossibles).appendTo($('#ql-nursery'));
	}

	function byReservedSpots() {
		let sortedNurseryPossibles = $('#ql-nursery div.possible').detach();
		sortedNurseryPossibles = sortDomObjects(sortedNurseryPossibles, 'data-reserved-spots');
		$(sortedNurseryPossibles).appendTo($('#ql-nursery'));
	}

	function byPregnancyWeek() {
		let sortedNurseryPossibles = $('#ql-nursery div.possible').detach();
		sortedNurseryPossibles = sortDomObjects(sortedNurseryPossibles, 'data-preg-week');
		$(sortedNurseryPossibles).appendTo($('#ql-nursery'));
	}

	function byPregnancyCount() {
		let sortedNurseryPossibles = $('#ql-nursery div.possible').detach();
		sortedNurseryPossibles = sortDomObjects(sortedNurseryPossibles, 'data-preg-count');
		$(sortedNurseryPossibles).appendTo($('#ql-nursery'));
	}

	function byPreviousSort() {
		let sort = V.sortNurseryList;
		if (sort !== 'unsorted') {
			if (sort === 'Name') {
				sortNurseryPossiblesByName();
			} else if (sort === 'Reserved Nursery Spots') {
				sortNurseryPossiblesByReservedSpots();
			} else if (sort === 'Pregnancy Week') {
				sortNurseryPossiblesByPregnancyWeek();
			} else if (sort === 'Number of Children') {
				sortNurseryPossiblesByPregnancyCount();
			}
		}
	}

	return r;
};
