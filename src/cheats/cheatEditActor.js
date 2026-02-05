/**
 * @param {FC.HumanState} actor this should be a clone of the actor you want to edit
 * @returns {DocumentFragment}
 * TODO: make sure this has parity with App.UI.SlaveInteract.cheatEditSlave() and then replace App.UI.SlaveInteract.cheatEditSlave()
 * TODO: replace App.UI.editGenetics with this
 */
App.UI.Cheat.cheatEditActor = function(actor) {
	console.log(`Editing actor with ID '${actor.ID}'`);
	const cheat = V.cheatMode === 1;

	const el = new DocumentFragment();

	/** null if the actor isn't a PlayerState object, otherwise a PlayerState object */
	const player = asPlayer(actor);
	/** a PlayerState object if baseActor has an ID that matches V.PC, otherwise undefined */
	const realPlayer = actor.ID === SID.PC ? player : undefined;

	/** null if the actor isn't an InfantState object, otherwise an InfantState object */
	const infant =  asInfant(actor);
	/** an InfantState object if baseActor has an ID that exists in the infant slave pool, otherwise undefined */
	const realInfant = getInfant(actor.ID) !== undefined ? infant : undefined;

	/** null if the actor isn't a ChildState object, otherwise a ChildState object */
	const child = null; // TODO: replace null once ChildState is actually implemented
	/** a ChildState object if baseActor has an ID that exists in ???, otherwise undefined */
	const realChild = undefined; // TODO: replace undefined once ChildState is actually implemented

	/** null if the actor isn't a TankSlaveState object, otherwise a TankSlaveState object */
	const tankSlave = asTankSlave(actor);
	/** a TankSlaveState object if baseActor has an ID that exists in V.incubator.tanks, otherwise undefined */
	const realTankSlave = getTankSlave(actor.ID) !== undefined ? tankSlave : undefined;

	/** null if the actor isn't a SlaveState object, otherwise a SlaveState object */
	const slave = asSlave(actor);
	/** a SlaveState object if baseActor has an ID that exists in V.slaves, otherwise undefined */
	const realSlave = getSlave(actor.ID) !== undefined ? slave : undefined;

	/** null if the actor isn't a [this is a placeholder] object, otherwise a [this is a placeholder] object */
	const citizen = null; // placeholder for when/if persistent citizens are added
	/** a [this is a placeholder] object if baseActor has an ID that exists in ???, otherwise undefined */
	const realCitizen = undefined; // placeholder for when/if persistent citizens are added

	console.log(`type; player: ${player !== null}, infant: ${infant !== null}, child: ${child !== null}, tankSlave: ${tankSlave !== null}, slave: ${slave !== null}, citizen: ${citizen !== null}`);
	console.log(`real; player: ${realPlayer !== undefined}, infant: ${realInfant !== undefined}, child: ${realChild !== undefined}, tankSlave: ${realTankSlave !== undefined}, slave: ${realSlave !== undefined}, citizen: ${realCitizen !== undefined}`);

	App.UI.DOM.appendNewElement("h1", el, `Cheat edit ${actor.slaveName}`);

	if (player) {
		el.append(App.Desc.Player.longDescription(player));
	} else if (slave) {
		el.append(App.Desc.longSlave(slave));
	} else if (child) {
		el.append(App.Facilities.Nursery.LongChildDescription(child));
	} else if (infant) {
		el.append(App.Facilities.Nursery.LongInfantDescription(infant));
	} else if (tankSlave) {
		// TODO: needs to be built in App.UI.incubator
	} else if (citizen) {
		// Futureproofing for non-slave persistent entities
	}

	const tabBar = new App.UI.Tabs.TabBar("CheatEditJS");
	tabBar.addTab("Background", "background", background());
	if (tankSlave) {
		tabBar.addTab("Tank Settings", "tank", tank());
	}
	tabBar.addTab("Physique", "physical", physical());
	tabBar.addTab("Face", "face", face());
	tabBar.addTab("Upper", "upper", upper());
	tabBar.addTab("Lower", "lower", lower());
	if (actor.womb.length > 0) {
		tabBar.addTab(actor.womb.length > 1 ? 'Fetuses' : 'Fetus', "fetuses", analyzePregnancies(actor, true));
	}
	tabBar.addTab("Genes", "genes", genes());
	tabBar.addTab("Mental", "mental", mental());
	tabBar.addTab("Skills", "skills", skills());
	tabBar.addTab("Stats", "stats", stats());
	if (slave || citizen) {
		tabBar.addTab("Porn", "porn", porn());
	}
	if (slave) { // this will all need to be redone
		tabBar.addTab("Relationships", "family", App.Intro.editFamily(actor, true));
	} else if (player) {
		tabBar.addTab("Family", "family", App.Intro.editFamily(actor, true));
	}
	if (slave || citizen) {
		tabBar.addTab("Body Mods", "body-mods", App.UI.bodyModification(slave ?? citizen, true));
	}
	if (player){
		tabBar.addTab("Salon", "salon", App.UI.playerSalon(player, true));
	} else if (!infant && !tankSlave) {
		tabBar.addTab("Salon", "salon", App.UI.salon(actor, true));
	}

	if (V.seeExtreme) {
		tabBar.addTab("Extreme", "extreme", extreme());
	}
	tabBar.addTab("Finalize", "finalize", finalize());
	el.append(tabBar.render());

	return el;

	/** @returns {DocumentFragment} */
	function background() {
		const el = new DocumentFragment();
		let options = new App.UI.OptionsGroup();
		let option;

		options.addOption("Birth name", "birthName", actor).showTextBox();
		options.addOption("Slave name", "slaveName", actor).showTextBox();
		options.addOption("Birth surname", "birthSurname", actor).showTextBox();
		options.addOption("Slave surname", "slaveSurname", actor).showTextBox({forceString: true});

		if (player) {
			options.addOption("Title", "title", actor)
				.addValue("Masculine", 1).on()
				.addValue("Feminine", 0).off();
		}

		if (!tankSlave) {
			options.addOption("Age", "actualAge", actor).showTextBox();
			options.addOption("Physical age", "physicalAge", actor).showTextBox();
			options.addOption("Visual age", "visualAge", actor).showTextBox();
			options.addOption("Ovary age", "ovaryAge", actor).showTextBox();
			options.addOption("Age implant", "ageImplant", actor)
				.addValue("Installed", 1).on()
				.addValue("Not installed", 0).off();
			options.addOption("Weeks since birthday", "birthWeek", actor).showTextBox();
		}

		if (slave) {
			const {him} = getPronouns(actor);
			option = options.addOption("Career", "career", actor).showTextBox();
			/** @type {Array<string>} */
			let careers;
			let text;
			if (actor.actualAge < 16) {
				text = "very young";
				careers = App.Data.Careers.General.veryYoung;
			} else {
				if (V.AgePenalty === 1) {
					if (actor.actualAge <= 24) {
						text = "young";
						careers = App.Data.Careers.General.young;
					} else if (actor.intelligenceImplant >= 15) {
						text = "educated";
						careers = App.Data.Careers.General.educated;
					} else {
						text = "uneducated";
						careers = App.Data.Careers.General.uneducated;
					}
				} else {
					if (actor.intelligenceImplant >= 15) {
						text = "educated";
						careers = App.Data.Careers.General.educated;
					} else if (actor.actualAge <= 24) {
						text = "young";
						careers = App.Data.Careers.General.young;
					} else {
						text = "uneducated";
						careers = App.Data.Careers.General.uneducated;
					}
				}
			}
			careers = careers.filter(App.StartingGirls.careerBonusFilters.get(App.StartingGirls.careerFilter));
			const niceCareers = new Map();
			for (const career of careers) {
				const nice = capFirstChar(App.Utils.removeArticles(career));
				niceCareers.set(nice, career);
			}
			for (const career of [...niceCareers.keys()].sort()) {
				option.addValue(career, niceCareers.get(career));
			}
			const optionComment = ` Available careers are based on age and education. Currently most influential is ${him} being ${text}.`;
			option.addComment(App.UI.DOM.combineNodes(App.StartingGirls.makeCareerFilterPulldown(), optionComment)).pulldown();

			const indenture = {active: slave.indenture > -1};
			options.addOption("Legal status", "active", indenture)
				.addValue("Slave", false, () => {
					slave.indenture = -1;
					slave.indentureRestrictions = 0;
				})
				.addValue("Indentured Servant", true, () => {
					slave.indenture = 52;
				});
			if (slave.indenture > -1) {
				options.addOption("Remaining weeks", "indenture", actor).showTextBox();

				options.addOption("Indenture restrictions", "indentureRestrictions", actor)
					.addValueList([["None", 0], ["Protective", 1], ["Restrictive", 2]]);
			}
			options.addOption("Owned since week", "weekAcquired", actor).showTextBox();
			options.addOption("Can recruit family", "canRecruit", actor)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
		} else if (player) {
			options.addOption("Former career", "career", actor)
				.addValueList([
					["Money, Lots of", "wealth"],
					["Investor", "capitalist"],
					["Mercenary", "mercenary"],
					["Slaver", "slaver"],
					["Engineer", "engineer"],
					["Doctor", "medicine"],
					["Celebrity", "celebrity"],
					["Escort", "escort"],
					["Servant", "servant"],
					["Gang member", "gang"],
					["Infamous hacker", "BlackHat"],

					["Trust funder", "trust fund"],
					["Entrepreneur", "entrepreneur"],
					["Recruit", "recruit"],
					["Slave overseer", "slave overseer"],
					["Construction worker", "construction"],
					["Medical assistant", "medical assistant"],
					["Rising star", "rising star"],
					["Prostitute", "prostitute"],
					["Handmaid", "handmaiden"],
					["Hoodlum", "hoodlum"],
					["Hacker", "hacker"],

					["Rich kid", "rich kid"],
					["Business kid", "business kid"],
					["Child soldier", "child soldier"],
					["Slave tender", "slave tender"],
					["Worksite helper", "worksite helper"],
					["Nurse", "nurse"],
					["Child star", "child star"],
					["Child prostitute", "child prostitute"],
					["Child servant", "child servant"],
					["Street urchin", "street urchin"],
					["Script kiddy", "script kiddy"],

					["Arcology owner", "arcology owner"],
				])
				.pulldown();

			options.addOption("How you got here", "rumor", actor)
				.addValueList([
					["Wealth", "wealth"],
					["Diligence", "diligence"],
					["Force", "force"],
					["Social engineering", "social engineering"],
					["Luck", "luck"],
				]);
		}

		// move this
		// figure out how to apply App.Data.StartingGirlsNonNumericPresets.genes
		options.addOption("Genes", "genes", actor)
			.addValueList([["Male", "XY"], ["Female", "XX"]]);

		if (slave || citizen) {
			option = options.addOption("Prestige", "prestige", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.prestige, true);
			options.addOption("Prestige Description", "prestigeDesc", actor).showTextBox({forceString: true});
		}

		if (!tankSlave) {
			options.addOption(`Nationality`, "nationality", actor).showTextBox()
				.addValueList(App.Data.misc.baseNationalities)
				.pulldown();
		}

		options.addOption(`Original Race`, "origRace", actor)
			.showTextBox().pulldown()
			.addValueList(Array.from(App.Data.misc.filterRaces, (k => [k[1], k[0]])));
		options.addOption(`Current Race`, "race", actor)
			.showTextBox().pulldown()
			.addComment("If different from original ethnicity, entity will be described as surgically altered.")
			.addValueList(Array.from(App.Data.misc.filterRaces, (k => [k[1], k[0]])));

		if (player) {
			options.addOption("Rumors: dick taking", "penetrative", player.badRumors)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Rumors: undesirable birthing", "birth", player.badRumors)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Rumors: showing weakness", "weakness", player.badRumors)
				.addValue("None", 0).off().showTextBox();

			App.UI.Player.refreshmentChoice(options, true);
		}

		if (slave) {
			const origin = App.StartingGirls.playerOrigin(slave).preview;
			options.addOption("Origin story", "origin", actor)
				.customButton("Customize", () => App.StartingGirls.playerOrigin(slave).apply(), "")
				.showTextBox({forceString: true})
				.addComment(origin === "" ? "No origin available" : pronounsForSlaveProp(actor, origin));
		}

		if (!player && !tankSlave) {
			options.addOption("Description", "desc", actor.custom).showTextBox({large: true})
				.addComment("Use complete, capitalized and punctuated sentences.");
			options.addOption("Label", "label", actor.custom).showTextBox().addComment("Use a short phrase");
		}
		if (!tankSlave) {
			if (V.imageChoice === 4 || V.imageChoice === 6) {
				options.addOption("Art Seed", "artSeed", actor.natural).showTextBox({large: true})
					.customButton("Randomize", () => actor.natural.artSeed = random(0, 10 ** 14), "")
					.addComment(`The WebGL and AI Art renderers use the art seed to set minor face and body parameters. You can change it if you don't like this slave's appearance.`);
			}
		}

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function physical() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		let option;

		option = options.addOption(`Natural skin color`, "origSkin", actor).showTextBox().pulldown();
		const naturalSkins = actor.race === "catgirl" ? App.Medicine.Modification.catgirlNaturalSkins : App.Medicine.Modification.naturalSkins;
		for (const skin of naturalSkins) {
			option.addValue(capFirstChar(skin), skin);
		}

		option = options.addOption(`Natural hair color`, "origHColor", actor)
			.showTextBox();
		for (const color of App.Medicine.Modification.Color.Primary) {
			option.addValue(capFirstChar(color.value), color.value);
		}
		option.pulldown()
			.addComment("For generic hair options, please use the salon.");
		options.addOption("Bald", "bald", actor)
			.addValue("No", 0).off()
			.addValue("Yes", 1).on();

		if (!infant && !tankSlave) {
			option = options.addOption("Condition", "condition", actor.health)
				.addValueList([["Unhealthy", -40], ["Healthy", 0], ["Very healthy", 40], ["Extremely healthy", 80]])
				.showTextBox();
			options.addOption("Short term damage", "shortDamage", actor.health).showTextBox();
			options.addOption("Long term damage", "longDamage", actor.health).showTextBox();
			options.addOption("Illness", "illness", actor.health)
				.addValueList([
					["Not ill", 0],
					["A little under the weather", 1],
					["Minor illness", 2],
					["Ill", 3],
					["Serious illness", 4],
					["Dangerous illness", 5],
				]);
			options.addOption("Tiredness", "tired", actor.health).showTextBox();
		}
		options.addOption("Premature birth", "premature", actor)
			.addValue("No", 0).off()
			.addValue("Yes", 1).on();
		options.addOption("Aphrodisiac addiction", "addict", actor).showTextBox();
		options.addOption("Chemical buildup", "chem", actor).showTextBox();
		if (player) {
			options.addOption("Physical impairment", "physicalImpairment", actor)
				.addValueList([
					["None", 0],
					["Hindered", 1],
					["Crippled", 2],
				]);
			options.addOption("Critical damage", "criticalDamage", actor)
				.addValue("None", 0)
				.showTextBox();
			options.addOption("Major injury", "majorInjury", actor).showTextBox();
		}
		if (!infant && !tankSlave && !player) {
			options.addOption("Minor injury", "minorInjury", actor)
				.addValueList([
					["None", 0],
					["Black eye", "black eye"],
					["Split lip", "bruise"],
					["Split lip", "split lip"],
				]);
		}
		if (player) { // this could be applied to all in the future
			options.addOption("Digestive system", "digestiveSystem", actor)
				.addValueList([
					["Normal", "normal"],
					["Atrophied", "atrophied"],
				]);
		}
		options.addOption("Inbreeding", "inbreedingCoeff", actor).showTextBox();
		options.addOption("Hormone balance", "hormoneBalance", actor)
			.addValueList([
				["Overwhelmingly masculine", -400],
				["Extremely masculine", -300],
				["Heavily masculine", -200],
				["Very masculine", -100],
				["Masculine", -20],
				["Neutral", 0],
				["Feminine", 20],
				["Very feminine", 100],
				["Heavily feminine", 200],
				["Extremely feminine", 300],
				["Overwhelmingly feminine", 400],
			])
			.showTextBox().pulldown();

		options.addOption(`Natural Adult Height: ${heightToEitherUnit(actor.natural.height)}`, "height", actor.natural).showTextBox({unit: "cm"})
			.addRange(145, 150, "<", "Petite")
			.addRange(155, 160, "<", "Short")
			.addRange(165, 170, "<", "Average")
			.addRange(180, 185, "<", "Tall")
			.addRange(190, 185, ">=", "Very tall");
		option = options.addCustomOption(`Average natural adult height is ${heightToEitherUnit(Height.mean(actor.nationality, actor.race, actor.genes, 20))}`)
			.addButton(
				"Make average",
				() => resyncSlaveHeight(actor),
				""
			);
		if (actor.geneticQuirks.dwarfism === 2) {
			option.addButton(
				"Make dwarf",
				() => actor.natural.height = Height.random(actor, {limitMult: [-4, -1], spread: 0.15}),
				""
			);
		}
		if (actor.geneticQuirks.gigantism === 2) {
			option.addButton(
				"Make giant",
				() => actor.natural.height = Height.random(actor, {limitMult: [3, 10], spread: 0.15}),
				""
			);
		}
		if (!infant) {
			options.addOption(`Current Height: ${heightToEitherUnit(actor.height)}`, "height", actor).showTextBox({unit: "cm"})
				.addRange(Height.forAge(145, actor), Height.forAge(150, actor), "<", `Petite for age`)
				.addRange(Height.forAge(155, actor), Height.forAge(160, actor), "<", "Short for age")
				.addRange(Height.forAge(165, actor), Height.forAge(170, actor), "<", "Average for age")
				.addRange(Height.forAge(180, actor), Height.forAge(185, actor), "<", "Tall for age")
				.addRange(Height.forAge(190, actor), Height.forAge(185, actor), ">=", "Very tall for age");
			options.addCustomOption(`Average height for a ${actor.physicalAge} year old is ${heightToEitherUnit(Height.mean(actor))}`)
				.addButton(
					"Scale for age from adult height",
					() => actor.height = Height.forAge(actor.natural.height, actor),
					""
				);
		}
		if (!infant && !child && !tankSlave) {
			options.addOption("Height implant", "heightImplant", actor)
				.addValueList([
					["-10 cm", -1],
					["None", 0],
					["+10 cm", 1],
				]);
		}
		option = options.addOption("Weight", "weight", actor);
		App.StartingGirls.addSet(option, App.Data.StartingGirls.weight, true);
		if (!infant) {
			option = options.addOption("Muscles", "muscles", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.muscles, true);
			option = options.addOption("Waist", "waist", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.waist, true);
		}

		if (!infant && !child && !tankSlave) {
			if (V.seeExtreme === 1) {
				option = options.addOption("Prosthetic limb interface", "PLimb", actor);
				option.addValueList([
					["None", 0],
					["Basic", 1],
					["Advanced", 2],
				]);
				if (slave) {
					option.addValue("Quadruped", 3);
				}
				for (const limb of ["arm", "leg"]) {
					for (const side of ["left", "right"]) {
						if (actor[limb][side]) {
							option = options.addOption(`${capFirstChar(side)} ${limb}: present`, "type", actor[limb][side]);
							option.addValue("Natural", 1);
							option.customButton("Amputate",
								() => {
									actor[limb][side] = null;
								},
								""
							);
							if (actor.PLimb.isBetween(0, 3)) {
								option.addValueList([
									["Simple prosthetic", 2],
									["Advanced: Sex", 3],
									["Advanced: Beauty", 4],
									["Advanced: Combat", 5],
								]);
							}
							if (actor.PLimb.isBetween(1, 3)) {
								option.addValue("Cybernetic", 6);
							}
							if (actor.PLimb === 3) {
								option.addValueList([
									["Feline: Structural", 7],
									["Canine: Structural", 8],
									["Feline: Combat", 9],
									["Canine: Combat", 10],
								]);
							}
						} else {
							options.addCustomOption(`${capFirstChar(side)} ${limb}: amputated`)
								.addButton("Restore",
									() => {
										if (limb === "arm") {
											actor[limb][side] = new App.Entity.ArmState();
										} else {
											actor[limb][side] = new App.Entity.LegState();
										}
									},
									""
								);
						}
					}
				}
			}
			options.addOption("Prosthetic tail interface", "PTail", actor)
				.addValue("None", 0).off().addCallback(()=>{
					actor.tail = "none";
					actor.tailShape = "none";
				})
				.addValue("Installed", 1).on();
			if (actor.PTail) {
				options.addOption("Tail role", "tail", actor)
					.addValueList([
						["None", "none"],
						["Modular", "mod"],
						["Sex", "sex"],
						["Combat", "combat"],
						["Stinger", "stinger"],
					]);
				options.addOption("Tail shape", "tailShape", actor)
					.addValueList([
						["None", "none"],
						["Cat", "cat"],
						["Leopard", "leopard"],
						["Tiger", "tiger"],
						["Jaguar", "jaguar"],
						["Lion", "lion"],
						["Dog", "dog"],
						["Wolf", "wolf"],
						["Jackal", "jackal"],
						["Fox", "fox"],
						["9 Tailed fox", "kitsune"],
						["Tanuki", "tanuki"],
						["Raccoon", "raccoon"],
						["Rabbit", "rabbit"],
						["Squirrel", "squirrel"],
						["Horse", "horse"],
						["Bird", "bird"],
						["Phoenix", "phoenix"],
						["Peacock", "peacock"],
						["Raven", "raven"],
						["Swan", "swan"],
						["Sheep", "sheep"],
						["Cow", "cow"],
						["Gazelle", "gazelle"],
						["Deer", "deer"],
						["Succubus", "succubus"],
						["Dragon", "dragon"],
					]);
				options.addOption("Tail color", "tailColor", actor)
					.addValue (`Matches main hair color (${actor.hColor})`, actor.hColor)
					.addValue("White", "white").off();
			}
			options.addOption("Prosthetic back interface", "PBack", actor)
				.addValue("None", 0).off().addCallback(()=>{
					actor.appendages = "none";
					actor.wingsShape = "none";
				})
				.addValue("Installed", 1).on();
			if (actor.PBack) {
				options.addOption("Appendages Type", "appendages", actor)
					.addValueList([
						["None", "none"],
						["Modular", "mod"],
						["Flight", "flight"],
						["Sex", "sex"],
						["Combat: Falcon", "falcon"],
						["Combat: Arachnid", "arachnid"],
						["Combat: Kraken", "kraken"],
					]);

				options.addOption("Wings shape", "wingsShape", actor)
					.addValueList([
						["None", "none"],
						["Angel", "angel"],
						["Seraph", "seraph"],
						["Demon", "demon"],
						["Dragon", "dragon"],
						["Phoenix", "phoenix"],
						["Bird", "bird"],
						["Fairy", "fairy"],
						["Butterfly", "butterfly"],
						["Moth", "moth"],
						["Insect", "insect"],
						["Evil", "evil"],
					]);
				options.addOption("Appendages Color", "appendagesColor", actor)
					.addValue (`Matches main hair color (${actor.hColor})`, actor.hColor)
					.addValue("White", "white").off();
			}
		}

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function face() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		let option;

		option = options.addOption("Face shape", "faceShape", actor);
		for (const [key, shape] of App.Medicine.Modification.faceShape) {
			if (shape.hasOwnProperty("requirements") && !shape.requirements) {
				continue;
			}
			option.addValue(capFirstChar(key), key);
		}
		option = options.addOption("Facial attractiveness", "face", actor);
		App.StartingGirls.addSet(option, App.Data.StartingGirls.face, true);
		if (!infant && !tankSlave) {
			options.addOption("Facial implant", "faceImplant", actor)
				.addValueList([
					["None", 0],
					["Subtle Improvements", 15],
					["Noticeable Work", 35],
					["Heavily Reworked", 65],
					["Uncanny Valley", 100],
				])
				.showTextBox();
		}
		option = options.addOption("Natural eye color", "origColor", actor.eye)
			.showTextBox();
		for (const color of App.Medicine.Modification.eyeColor.map(color => color.value)) {
			option.addValue(capFirstChar(color), color);
		}
		option.addGlobalCallback(() => resetEyeColor(actor))
			.pulldown();

		if (!tankSlave && !infant) {
			/** @type {("left"|"right")[]} */
			const sides = ["left", "right"];
			for (const side of sides) {
				if (actor.eye[side]) { // has eye
					let option = options.addOption(`${capFirstChar(side)} eye vision`, "vision", actor.eye[side]);
					option.addValueList([["Normal", 2], ["Nearsighted", 1]]);
					if (V.seeExtreme === 1) {
						option.addValue("Blind", 0);
					} else {
						if (actor.eye[side].vision === 0) {
							actor.eye[side].vision = 2;
						}
					}
					if (!child) {
						option = options.addOption(`${capFirstChar(side)} eye type`, "type", actor.eye[side])
							.addValueList([
								["Normal", 1, () => eyeSurgery(actor, side, "normal")],
								["Glass", 2, () => eyeSurgery(actor, side, "glass")],
							]);
						option.addValue("Cybernetic", 3, () => eyeSurgery(actor, side, "cybernetic"));
						if (V.seeExtreme === 1) {
							option.customButton("Remove eye", () => eyeSurgery(actor, side, "remove"), "");
						}
					}
					option = options.addOption(`${capFirstChar(side)} pupil shape`, "pupil", actor.eye[side])
						.showTextBox();
					for (const color of App.Medicine.Modification.eyeShape.map(shape => shape.value)) {
						option.addValue(capFirstChar(color), color);
					}
					option.pulldown();

					option = options.addOption(`${capFirstChar(side)} sclera color`, "sclera", actor.eye[side])
						.showTextBox();
					for (const color of App.Medicine.Modification.eyeColor.map(color => color.value)) {
						option.addValue(capFirstChar(color), color);
					}
					option.pulldown();
				} else {
					option = options.addCustomOption(`Missing ${side} eye`)
						.addButton("Restore natural", () => eyeSurgery(actor, side, "normal"));
					if (cheat) {
						option.addButton("Cybernetic", () => eyeSurgery(actor, side, "cybernetic"));
					}
				}
			}
		}
		if (!infant && !tankSlave) { // This needs to have natural variants figured out. Right now I am considering them surgical only.
			options.addOption("Horns", "horn", actor)
				.addValueList([
					["None", "none"],
					["Succubus", "curved succubus horns"],
					["Backswept", "backswept horns"],
					["Cow", "cow horns"],
					["Oni", "one long oni horn"],
					["Oni x2", "two long oni horns"],
					["Small ones", "small horns"],
				]);
			options.addOption("Horn color", "hornColor", actor)
				.addValue (`Matches main hair color (${actor.hColor})`, actor.hColor)
				.addComment(`More extensive coloring options are available in the Salon tab, as long as hairless is not selected here`);

			options.addOption("Ear shape", "earShape", actor)
				.addValueList([
					["Normal", "normal"],
					["Holes", "holes"],
					["None/Smooth", "none"],
					["Damaged", "damaged"],
					["Pointy", "pointy"],
					["Elven", "elven"],
					["Orcish", "orcish"],
					["Cow", "cow"],
					["Sheep", "sheep"],
					["Gazelle", "gazelle"],
					["Deer", "deer"],
					["Bird", "bird"],
					["Dragon", "dragon"],
				]);

			options.addOption("Top ears", "earT", actor)
				.addValueList([
					["None", "none"],
					["Cat", "cat"],
					["Leopard", "leopard"],
					["Tiger", "tiger"],
					["Jaguar", "jaguar"],
					["Lion", "lion"],
					["Dog", "dog"],
					["Wolf", "wolf"],
					["Jackal", "jackal"],
					["Fox", "fox"],
					["Raccoon", "raccoon"],
					["Rabbit", "rabbit"],
					["Squirrel", "squirrel"],
					["Horse", "horse"],
				]);
			options.addOption("Top ear color", "earTColor", actor)
				.addValue (`Matches main hair color (${actor.hColor})`, actor.hColor)
				.addValue("Hairless", "hairless").off()
				.addComment(`More extensive coloring options are available in the Salon tab, as long as hairless is not selected here`);
		}

		if (!infant && !tankSlave) {
			option = options.addOption("Hearing", "hears", actor);
			option.addValueList([["Normal", 0], ["Hard of hearing", -1]]);
			if (V.seeExtreme === 1) {
				option.addValue("Deaf", -2);
			} else if (actor.hears === -2) {
				actor.hears = -1;
			}
			options.addOption("Ear implant", "earImplant", actor)
				.addValue("Implanted", 1).on()
				.addValue("None", 0).off();
		}

		if (!infant && !tankSlave) {
			option = options.addOption("Lips", "lips", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.lips, true);
			options.addOption("Lips implant", "lipsImplant", actor)
				.addValueList([
					["None", 0],
					["Normal", 10],
					["Large", 20],
					["Enormous", 30],
				]).showTextBox();
		}

		option = options.addOption("Voice", "voice", actor);
		option.addValue("Mute", 0);
		if (!infant) {
			option.addValueList([["Deep", 1], ["Normal", 2]]);
		}
		option.addValue("High", 3);
		if (!infant && !tankSlave) {
			options.addOption("Voice implant", "voiceImplant", actor)
				.addValueList([
					["None", 0],
					["Higher", 1],
					["Lower", -1],
				]);
		}
		if (!infant && !tankSlave) {
			options.addOption("Electrolarynx", "electrolarynx", actor)
				.addValue("None", 0).off()
				.addValue("Installed", 1).on();
		}

		if (!tankSlave && !infant && !player) {
			if (actor.voice !== 0) {
				options.addOption(V.language, "accent", actor)
					.addValueList([
						["Unaccented", 0],
						[`Pretty ${aNational(actor.nationality)} accent`, 1],
						[`Thick ${aNational(actor.nationality)} accent`, 2],
						["Not fluent", 3]
					]);
			}
		}

		if (V.seeExtreme === 1) {
			options.addOption("Smell ability", "smells", actor)
				.addValueList([["Normal", 0], ["None", -1]]);

			options.addOption("Taste ability", "tastes", actor)
				.addValueList([["Normal", 0], ["None", -1]]);
		}

		if (!infant && !tankSlave) {
			option = options.addOption("Teeth", "teeth", actor)
				.addValueList([
					["Crooked", "crooked"],
					["Gapped", "gapped"],
					["Braces", "straightening braces"]
				]);

			if (actor.physicalAge >= 12) {
				option.addValue("Straight", "normal");
			} else if (actor.physicalAge >= 6) {
				option.addValue("Mixed adult & child", "mixed");
			} else {
				option.addValue("Baby", "baby");
			}
			option.addValueList([
				["Pointy", "pointy"],
				["Fangs", "fangs"],
				["Fang", "fang"],
				["Cosmetic Braces", "cosmetic braces"],
				["Removable", "removable"]
			]);
		}
		options.addOption("Markings", "markings", actor)
			.addValueList([
				["None", "none"],
				["Beauty mark", "beauty mark"],
				["Birthmark", "birthmark"],
				["Freckles", "freckles"],
				["Heavy freckling", "heavily freckled"]
			]);

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function upper() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		let option;

		options.addOption("Breasts", "boobs", actor).showTextBox({unit: "CCs"})
			.addRange(200, 200, "<=", "Flat (AA-cup)")
			.addRange(300, 300, "<=", "Small (A-cup)")
			.addRange(400, 400, "<=", "Medium (B-cup)")
			.addRange(500, 500, "<=", "Healthy (C-cup)")
			.addRange(800, 800, "<=", "Large (DD-cup)")
			.addRange(1200, 1200, "<=", "Very Large (G-cup)")
			.addRange(2050, 2050, "<=", "Huge (K-cup)")
			.addRange(3950, 3950, "<=", "Massive (Q-cup)")
			.addRange(6000, 6000, "<=", "Monstrous")
			.addRange(8000, 6000, ">", "Science Experiment");

		options.addOption("Genetic breast size", "boobs", actor.natural).showTextBox({unit: "CCs"})
			.addRange(200, 200, "<=", "Flat (AA-cup)")
			.addRange(300, 300, "<=", "Small (A-cup)")
			.addRange(400, 400, "<=", "Medium (B-cup)")
			.addRange(500, 500, "<=", "Healthy (C-cup)")
			.addRange(800, 800, "<=", "Large (DD-cup)")
			.addRange(1200, 1200, "<=", "Very Large (G-cup)")
			.addRange(2050, 2050, "<=", "Huge (K-cup)")
			.addRange(3950, 3950, "<=", "Massive (Q-cup)")
			.addRange(6000, 6000, "<=", "Monstrous")
			.addRange(8000, 6000, ">", "Science Experiment");

		if (!infant && !tankSlave) {
			options.addOption("Breast implant type", "boobsImplantType", actor)
				.addValueList([
					["None", "none", () => actor.boobsImplant = 0],
					["Normal", "normal", () => actor.boobsImplant = actor.boobsImplant || 200],
					["String", "string", () => actor.boobsImplant = actor.boobsImplant || 200],
					["Fillable", "fillable", () => actor.boobsImplant = actor.boobsImplant || 200],
					["Advanced Fillable", "advanced fillable", () => actor.boobsImplant = actor.boobsImplant || 200],
					["Hyper Fillable", "hyper fillable", () => actor.boobsImplant = actor.boobsImplant || 200],
				]);

			if (actor.boobsImplantType !== "none") {
				options.addOption("Breast implant volume", "boobsImplant", actor).showTextBox({unit: "CCs"})
					.addValue("None", 0)
					.addRange(200, 200, "<=", "Flat (AA-cup)")
					.addRange(300, 300, "<=", "Small (A-cup)")
					.addRange(400, 400, "<=", "Medium (B-cup)")
					.addRange(500, 500, "<=", "Healthy (C-cup)")
					.addRange(800, 800, "<=", "Large (DD-cup)")
					.addRange(1200, 1200, "<=", "Very Large (G-cup)")
					.addRange(2050, 2050, "<=", "Huge (K-cup)")
					.addRange(3950, 3950, "<=", "Massive (Q-cup)")
					.addRange(6000, 6000, "<=", "Monstrous")
					.addRange(8000, 6000, ">", "Science Experiment")
					.addGlobalCallback(() => actor.boobs = Math.max(actor.boobs, actor.boobsImplant))
					.addComment(`Value is added to breast volume to produce final breast size.`);
			}
			options.addOption("Supportive breast mesh", "breastMesh", actor)
				.addValue("None", 0).off()
				.addValue("Installed", 1).on();
		}

		option = options.addOption("Natural shape", "boobShape", actor)
			.addValueList([
				["Normal", "normal"],
				["Perky", "perky"],
				["Saggy", "saggy"],
				["Torpedo-shaped", "torpedo-shaped"],
				["Downward-facing", "downward-facing"],
				["Wide-set", "wide-set"],
			]);
		// this could be gated with infant and tankSlave, but should be impossible already due to implants being blocked.
		if (actor.boobsImplant / actor.boobs >= 0.90) {
			option.addValue("Spherical", "spherical");
		}

		option = options.addOption("Lactation", "lactation", actor);
		if (!infant && !tankSlave) {
			option.addValue("Artificial", 2, () => actor.lactationDuration = 2);
		}
		option.addValue("Natural", 1, () => actor.lactationDuration = 2);
		option.addValue("None", 0);

		options.addOption("Lactation adaptation", "lactationAdaptation", actor).showTextBox();
		if (!tankSlave) {
			options.addOption("Lactation induction", "induceLactation", actor).showTextBox();
		}

		option = options.addOption("Nipples", "nipples", actor);
		option.addValueList([
			["Huge", "huge"],
			["Puffy", "puffy"],
			["Inverted", "inverted"],
			["Partially Inverted", "partially inverted"],
			["Tiny", "tiny"],
			["Cute", "cute"],
		]);
		if (!infant && !tankSlave) {
			option.addValue("Fuckable", "fuckable");
		}
		if (actor.boobsImplant / actor.boobs >= 0.90) {
			option.addValue("Flat", "flat");
		}

		options.addOption("Areolae", "areolae", actor)
			.addValueList([["Normal", 0], ["Large", 1], ["Wide", 2], ["Huge", 3], ["Massive", 4]]);
		if (!infant) {
			options.addOption("Areolae shape", "areolaeShape", actor)
				.addValueList([
					["Normal", "circle"],
					["Heart", "heart"],
					["Star", "star"]
				])
				.showTextBox();
		}

		if (!infant) {
			options.addOption("Shoulders", "shoulders", actor)
				.addValueList([["Very narrow", -2], ["Narrow", -1], ["Feminine", 0], ["Broad", 1], ["Very broad", 2]]);
		}
		if (!infant && !tankSlave) {
			options.addOption("Shoulders implant", "shouldersImplant", actor)
				.addValueList([["Heavily narrowed", -2], ["Narrowed", -1], ["Unmodified", 0], ["Broadened", 1], ["Heavily broadened", 2]]);
		}

		options.addOption("Underarm hair", "underArmHStyle", actor)
			.addValueList([
				["Hairless", "hairless"],
				["Hairy", "bushy"]
			])
			.showTextBox();

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function lower() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		let option;

		if (!infant) {
			options.addOption("Belly implant", "bellyImplant", actor)
				.addValueList([
					["No Implant", -1],
					["Implanted but unfilled", 0],
					["Looks like early pregnancy", 1500],
					["Looks pregnant", 5000],
					["Looks hugely pregnant", 10000],
					["Looks full term", 15000],
					["Inhumanly pregnant", 150000],
					["Hyperpregnant", 300000],
				]).showTextBox();
			if (actor.bellyImplant > 0) {
				options.addOption("Implant fill", "bellyPain", actor)
					.addValueList([
						["None", 0],
						["Tolerable", 1],
						["Painful", 2]
					]);
			}
			if (actor.bellyImplant >= 0 || (actor.ovaries === 0 && actor.mpreg === 0)) {
				option = options.addOption("Implant feeder", "cervixImplant", actor);
				option.addValue("None", 0);
				if (actor.vagina >= 0) {
					option.addValue("Vaginal", 1);
				}
				option.addValue("Anal", 2);
				if (actor.vagina >= 0) {
					option.addValue("Both", 3);
				}
			}
			if (actor.cervixImplant > 0) {
				options.addOption("Implant feeder distribution system", "cervixImplantTubing", actor)
					.addValue("None", 0).off()
					.addValue("Installed", 1).on();
			}
		}
		if (!infant && !tankSlave) {
			options.addOption("Belly fluid", "bellyFluid", actor).showTextBox({unit: "MLs"})
				.addValue("Empty", 0)
				.addRange(100, 100, "<=", "Bloated")
				.addRange(2000, 2000, "<=", "Clearly bloated")
				.addRange(5000, 5000, "<=", "Very full")
				.addRange(10000, 10000, "<=", "Full to bursting");
			options.addOption("Belly sag", "bellySag", actor).showTextBox();
			if (V.seePreg) {
				options.addOption("Belly sag due to pregnancy", "bellySag", actor).showTextBox();
			}
		}
		if (slave) {
			options.addOption("Ruptured Internals", "burst", actor)
				.addValue("Normal", 0).off()
				.addValue("Burst", 1).on();
		}

		if (!infant) {
			option = options.addOption("Hips", "hips", actor)
				.addValueList([["Very narrow", -2], ["Narrow", -1], ["Normal", 0], ["Wide", 1], ["Very wide", 2]]);
		}
		if (!infant && !tankSlave) {
			option.addValue("Unnaturally broad", 3);
			options.addOption("Hips implant", "hipsImplant", actor)
				.addValueList([["Heavily narrowed", -2], ["Narrowed", -1], ["Unmodified", 0], ["Widened", 1], ["Heavily widened", 2]]);
		}

		options.addOption("Butt", "butt", actor)
			.addValueList([["Flat", 0], ["Small", 1], ["Plump", 2], ["Big", 3], ["Huge", 4], ["Enormous", 5], ["Gigantic", 6], ["Massive", 7]])
			.showTextBox();

		if (!infant && !tankSlave) {
			options.addOption("Butt implant type", "buttImplantType", actor)
				.addValueList([
					["None", "none"],
					["Normal", "normal"],
					["String", "string"],
					["Fillable", "fillable"],
					["Advanced Fillable", "advanced fillable"],
					["Hyper Fillable", "hyper fillable"],
				]);

			options.addOption("Butt implant size", "buttImplant", actor).showTextBox()
				.addValue("None", 0)
				.addValue("Implant", 1)
				.addValue("Big implant", 2)
				.addValue("Fillable implant", 3)
				.addRange(8, 8, "<=", "Advanced fillable implants")
				.addRange(9, 9, ">=", "Hyper fillable implants");
		}

		if (!infant && !tankSlave) {
			const oldAnus = actor.anus;
			options.addOption("Anus", "anus", actor)
				.addValue("Virgin", 0, () => {
					actor.analArea = 1;
				})
				.addValue("Normal", 1, () => {
					actor.analArea = Math.clamp(actor.analArea + (1 - oldAnus), 1, 3);
				})
				.addValue("Veteran", 2, () => {
					actor.analArea = Math.clamp(actor.analArea + (2 - oldAnus), 2, 4);
				})
				.addValue("Gaping", 3, () => {
					actor.analArea = Math.clamp(actor.analArea + (3 - oldAnus), 3, 5);
				});

			if (actor.anus > 0) {
				let comment;
				if (actor.analArea <= actor.anus) {
					comment = "Recently stretched to current size.";
				} else if (actor.analArea - actor.anus === 1) {
					comment = "Used to current size.";
				} else {
					comment = "Very broad.";
				}
				options.addOption("External anus appearance", "analArea", actor)
					.addValueList([
						["Recently stretched", actor.anus],
						["Used to current size", actor.anus + 1],
						["Very broad", actor.anus + 2],
					]).addComment(comment);
			}
		}

		option = options.addOption("Vagina", "vagina", actor);
		option.addValue("No vagina", -1);
		option.addValue("Virgin", 0);
		if (!infant && !tankSlave) {
			option.addValue("Normal", 1);
			option.addValue("Veteran", 2);
			option.addValue("Gaping", 3);
			option.addValue("Ruined", 10);
		}
		if (player) {
			options.addOption("Rebuilt vagina", "newVag", actor)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
		}

		if (actor.vagina > -1) {
			if (actor.dick === 0) {
				options.addOption("Clit", "clit", actor)
					.addValueList([["Normal", 0],
						["Large", 1],
						["Huge", 2],
						["Enormous", 3],
						["Gigantic", 4],
						["That's no dick!", 5]
					]).showTextBox();

				option = options.addOption("Hood", "foreskin", actor);
				if (V.seeCircumcision === 1) {
					if (!tankSlave) {
						option.addValue("Circumcised", 0);
					}
					option.addValue("Uncut", actor.clit + 1);
				}
				option.showTextBox();
			}

			options.addOption("Labia", "labia", actor)
				.addValueList([["Normal", 0], ["Large", 1], ["Huge", 2], ["Huge Dangling", 3]]);

			options.addOption("Vaginal wetness", "vaginaLube", actor)
				.addValueList([["Dry", 0], ["Normal", 1], ["Excessive", 2]]);

			options.addOption("Ovaries", "ovaries", actor)
				.addValue("Yes", 1).on()
				.addValue("No", 0).off();

			options.addOption("Chemical castration", "eggType", actor)
				.addValue("Yes", "sterile").on()
				.addValue("No", "human").off();
			// TODO: add animal eggs here
		}

		if (!infant && !tankSlave && V.seePreg) {
			options.addOption("Anal pregnancy", "mpreg", actor)
				.addValue("Installed", 1).on()
				.addValue("No", 0).off();
		}

		options.addOption("Puberty", "pubertyXX", actor)
			.addValue("Prepubescent", 0, () => {
				actor.pubertyAgeXX = V.fertilityAge;
				actor.belly = 0;
				actor.bellyPreg = 0;
				WombFlush(actor);
			}).addValue("Postpubescent", 1);
		options.addOption("Age of Female puberty", "pubertyAgeXX", actor).showTextBox();

		if (V.seePreg !== 0 && (actor.mpreg !== 0 || actor.ovaries !== 0) && !tankSlave && !infant) { // Incubating slaves are not permitted to get pregnant. Yet. Try not to think about what accelerating growth would do to a fetus. Infants need more support first.
			if (actor.pubertyXX === 1) {
				option = options.addOption("Pregnancy", "preg", actor);
				if (V.seeHyperPreg === 1) {
					option.addValue("Bursting at the seams", 43, () => {
						actor.pregType = 150;
						actor.pregWeek = 43;
						actor.pregKnown = 1;
						actor.belly = 2700000;
						actor.bellyPreg = 2700000;
						actor.pubertyXX = 1;
						actor.readyOva = 0;
					});
					if (actor.preg === 43) {
						option.addComment("Extreme hyper pregnancy!");
					}
				}
				option.addValue("Completely Filled", 42, () => {
					actor.pregType = 8;
					actor.pregWeek = 42;
					actor.pregKnown = 1;
					actor.belly = 120000;
					actor.bellyPreg = 120000;
					actor.pubertyXX = 1;
					actor.readyOva = 0;
				}).addValue("Ready to drop", 40, () => {
					actor.pregType = 1;
					actor.pregWeek = 40;
					actor.pregKnown = 1;
					actor.belly = 15000;
					actor.bellyPreg = 15000;
					actor.pubertyXX = 1;
					actor.readyOva = 0;
				}).addValue("Advanced", 34, () => {
					actor.pregType = 1;
					actor.pregWeek = 34;
					actor.pregKnown = 1;
					actor.belly = 10000;
					actor.bellyPreg = 10000;
					actor.pubertyXX = 1;
					actor.readyOva = 0;
				}).addValue("Showing", 27, () => {
					actor.pregType = 1;
					actor.pregWeek = 27;
					actor.pregKnown = 1;
					actor.belly = 5000;
					actor.bellyPreg = 5000;
					actor.pubertyXX = 1;
					actor.readyOva = 0;
				}).addValue("Early", 12, () => {
					actor.pregType = 1;
					actor.pregWeek = 12;
					actor.pregKnown = 1;
					actor.belly = 100;
					actor.bellyPreg = 100;
					actor.pubertyXX = 1;
					actor.readyOva = 0;
				}).addValue("None", 0, () => {
					actor.pregType = 0;
					actor.belly = 0;
					actor.bellyPreg = 0;
					actor.pregSource = SID.GENERIC;
					actor.pregWeek = 0;
					actor.pregKnown = 0;
					actor.readyOva = 0;
					WombFlush(actor);
				}).addValue("Contraceptives", -1, () => {
					actor.pregType = 0;
					actor.belly = 0;
					actor.bellyPreg = 0;
					actor.pregSource = SID.GENERIC;
					actor.pregWeek = 0;
					actor.pregKnown = 0;
					actor.readyOva = 0;
					WombFlush(actor);
				}).addValue("Barren", -2, () => {
					actor.pregType = 0;
					actor.belly = 0;
					actor.bellyPreg = 0;
					actor.pregSource = SID.GENERIC;
					actor.pregWeek = 0;
					actor.pregKnown = 0;
					actor.readyOva = 0;
					WombFlush(actor);
				}).addValue("Sterilized", -3, () => {
					actor.pregType = 0;
					actor.belly = 0;
					actor.bellyPreg = 0;
					actor.pregSource = SID.GENERIC;
					actor.pregWeek = 0;
					actor.pregKnown = 0;
					actor.readyOva = 0;
					WombFlush(actor);
				});
				if (V.seeHyperPreg && V.seeExtreme && slave) {
					option.addValue("Broodmother", 1, () => {
						actor.broodmother = 1;
						actor.broodmotherFetuses = 1;
						actor.pregType = 1;
						actor.pregWeek = 1;
						actor.pregKnown = 1;
						actor.belly = 0;
						actor.bellyPreg = 0;
						actor.pubertyXX = 1;
						actor.readyOva = 0;
					});
				}
				option.showTextBox();

				options.addOption("Births", "birthsTotal", actor.counter).showTextBox().addComment(`Absolute total number of births, not just in current game.`);
				if (V.seeHyperPreg && V.seeExtreme && actor.broodmother === 1) {
					options.addOption("Babies produced per week", "broodmotherFetuses", actor).showTextBox();
				}
				options.addOption("Pregnancy adaptation", "pregAdaptation", actor).showTextBox();
			}
			if (V.seePreg !== 0 && canGetPregnant(actor, true, true)) {
				options.addOption("Ova ripe for seeding", "readyOva", actor).showTextBox()
					.addComment("Sets next pregnancy's baby count.");
			}
			if (player) {
				options.addOption("Forced fertility drugs", "forcedFertDrugs", actor)
					.addValue("None", 0).off()
					.showTextBox();
			}

			if (!infant && !tankSlave) {
				if (actor.ovaries || actor.mpreg) {
					options.addOption("Womb implant", "wombImplant", actor)
						.addValueList([
							["None", 0],
							["Support", "restraint"],
						]);
					options.addOption("Ova implant", "ovaImplant", actor)
						.addValueList([
							["None", 0],
							["Fertility", "fertility"],
							["Sympathy", "sympathy"],
							["Asexual", "asexual"],
						]);
				}
			}
			App.Interact.ActorEdit.fetusFatherSelector(actor, options, cheat);
			App.Interact.ActorEdit.fetusCount(actor, options);

			options.addOption("Breeding mark", "breedingMark", actor)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
		} else if (actor.preg !== 0) {
			options.addOption("Fertility", "preg", actor)
				.addValue("Restore fertility", 0);
		}
		if (V.seePreg !== 0 && actor.mpreg !== 0 && actor.ovaries !== 0 && V.debugMode) {
			options.addOption("Fertility awareness", "fertKnown", actor)
				.addValue("Yes", 1).on()
				.addValue("No", 0).off();
			options.addOption("Fertility cycle", "fertPeak", actor).showTextBox();
		}
		if (V.seePreg !== 0) {
			if (player) {
				options.addOption("Pregnancy moodiness", "pregMood", actor)
					.addValueList([
						["Normal", 0],
						["Motherly", 1],
						["Aggressive", 2],
					]);
			}
		}


		if (V.seeDicks !== 0 || V.makeDicks === 1) {
			options.addOption("Penis", "dick", actor)
				.addValue("None", 0)
				.addValue("Tiny", 1, () => actor.clit = 0)
				.addValue("Small", 2, () => actor.clit = 0)
				.addValue("Normal", 3, () => actor.clit = 0)
				.addValue("Large", 4, () => actor.clit = 0)
				.addValue("Massive", 5, () => actor.clit = 0)
				.addValue("Huge", 6, () => actor.clit = 0)
				.addValue("More Huge", 7, () => actor.clit = 0)
				.addValue("Enormous", 8, () => actor.clit = 0)
				.addValue("Monstrous", 9, () => actor.clit = 0)
				.addValue("Big McLargeHuge", 10, () => actor.clit = 0)
				.pulldown().showTextBox();

			if (actor.dick > 0) {
				option = options.addOption("Foreskin", "foreskin", actor);
				if (V.seeCircumcision === 1 && !tankSlave) {
					option.addValue("Circumcised", 0);
				}
				option.addValueList([["Tiny", 1], ["Small", 2], ["Normal", 3], ["Large", 4], ["Massive", 5]]);
				option.showTextBox();
			}

			options.addOption("Testicles", "balls", actor)
				.addValue("None", 0)
				.addValueList([["Vestigial", 1],
					["Small", 2],
					["Normal", 3],
					["Large", 4],
					["Massive", 5],
					["Huge", 6],
					["More Huge", 7],
					["Enormous", 8],
					["Monstrous", 9],
					["Big McLargeHuge", 10],
				]).pulldown().showTextBox();

			options.addOption("Age of Male Puberty", "pubertyAgeXY", actor).showTextBox();

			options.addOption("Ballsack", "scrotum", actor)
				.addValueList([
					["None", 0],
					["Tiny", 1],
					["Small", 2],
					["Normal", 3],
					["Large", 4],
					["Massive", 5],
					["Huge", 6],
					["More Huge", 7],
					["Enormous", 8],
					["Monstrous", 9],
					["Big McLargeHuge", 10],
				]).pulldown().showTextBox();

			options.addOption("Male Puberty", "pubertyXY", actor)
				.addValue("Prepubescent", 0, () => actor.pubertyAgeXY = V.potencyAge)
				.addValue("Postpubescent", 1);
			options.addOption("Chemical castration", "ballType", actor)
				.addValue("Yes", "sterile").on()
				.addValue("No", "human").off();
			// TODO: add animal balls here
			if (!tankSlave && !infant) {
				options.addOption("Vasectomy", "vasectomy", actor)
					.addValue("Yes", 1).on()
					.addValue("No", 0).off();
			}
			if (player) { // TODO:@franklygeorge implement this for slaves
				// You know what? Let's revise this before adding it here.
				// options.addOption("Ball Implant", "ballsImplant", V.tempSlave).text.showTextBox();
			}
		}

		option = options.addOption("Prostate", "prostate", actor)
			.addValueList([
				["No prostate", 0],
				["Has a prostate", 1]
			]);
		if (!tankSlave && !infant) {
			option.addValueList([
				["Hyperactive prostate", 2],
				["Hyperactive modified prostate", 3],
			]);
			options.addOption("Prostate Implant", "prostateImplant", actor)
				.addValueList([
					["None", 0],
					["Stimulator", "stimulator"],
				]);
		}
		options.addOption("Pubic hair", "pubicHStyle", actor)
			.addValueList([
				["Hairless", "hairless"],
				["Hairy", "bushy"]
			])
			.showTextBox();

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function mental() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		let option;

		option = options.addOption("Intelligence", "intelligence", actor);
		App.StartingGirls.addSet(option, App.Data.StartingGirls.intelligence, true);

		if (!tankSlave && !infant) {
			option = options.addOption("Education", "intelligenceImplant", actor);
			option.addValueList([["Uneducated", 0], ["Educated", 15]]);
			if (!child) {
				option.addValue("Well educated", 30);
			}
		}

		if (!infant && !player) {
			option = options.addOption("Devotion", "devotion", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.devotion, true);
			option = options.addOption("Trust", "trust", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.trust, true);
		}

		if (!infant && !tankSlave && !player) {
			options.addOption("Fetish", "fetishKnown", actor)
				.addValue("Unknown", 0).off()
				.addValue("Known", 1).on();
		}
		if (!player) {
			const paraphilias = [SexualFlaw.ABUSIVE, SexualFlaw.ANALADDICT, SexualFlaw.ANIMALLOVER, SexualFlaw.ATTENTION, SexualFlaw.BREASTEXP,
				SexualFlaw.BREEDER, SexualFlaw.CUMADDICT, SexualFlaw.MALICIOUS, SexualFlaw.NEGLECT, SexualFlaw.NEGLECT];
			option = options.addOption("Fetish", "fetish", actor)
				.addValueList([["None", "none"],
					["Sub", "submissive"],
					["Dom", "dom"],
					["Cumslut", "cumslut"],
					["Humiliation", "humiliation"],
					["Buttslut", "buttslut"],
					["Breasts", "boobs"],
					["Pregnancy", "pregnancy"],
					["Sadism", "sadist"],
					["Masochism", "masochist"]
				]);
			if (V.seeBestiality) {
				option.addValue("Bestiality", "bestiality");
			}
			if (V.seeExtreme === 1 && !infant && !child) {
				option.addValue("Mindbroken", "mindbroken", () => {
					actor.fetishStrength = 10;
					actor.sexualFlaw = "none";
					actor.sexualQuirk = "none";
					actor.behavioralFlaw = "none";
					actor.behavioralQuirk = "none";
				});
			}
			if (actor.fetish !== Fetish.NONE && actor.fetish !== Fetish.MINDBROKEN) {
				if (paraphilias.includes(actor.sexualFlaw) && (actor.sexualFlaw !== paraphiliaForFetish(actor.fetish) || actor.fetish !== fetishForParaphilia(actor.sexualFlaw))){
					option = options.addCustomOption("Match fetish and paraphilia")
						.addButton("Match Fetish to current paraphilia", () => actor.fetish = fetishForParaphilia(actor.sexualFlaw))
						.addButton("Match paraphilia to current Fetish", () => actor.sexualFlaw = paraphiliaForFetish(actor.fetish))
						.addComment("A characters Fetish not matching their paraphilia can lead to odd interactions.");
				}
				option = options.addOption("Fetish strength", "fetishStrength", actor);
				App.StartingGirls.addSet(option, App.Data.StartingGirls.fetishStrength, true);
			}
		}

		if (!infant && !tankSlave && !player) {
			options.addOption("Sexuality", "attrKnown", actor)
				.addValue("Unknown", 0).off()
				.addValue("Known", 1).on();
		}
		if (!infant && !player) {
			option = options.addOption("Attraction to men", "attrXY", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.attr, true);
			option = options.addOption("Attraction to women", "attrXX", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.attr, true);
		}
		if (!infant) {
			option = options.addOption("Sex drive", "energy", actor);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.energy, true);
			options.addOption("Sexual Need", "need", actor).showTextBox();
		}
		if (player) {
			options.addOption("Horny", "lusty", actor)
				.addValue("No", 0).off()
				.addValue("YES!", 1).on();
		}

		if (actor.fetish !== Fetish.MINDBROKEN) {
			if (!infant && !player) {
				options.addOption("Behavioral Flaw", "behavioralFlaw", actor)
					.addValueList([["None", "none"], ["Arrogant", "arrogant"], ["Bitchy", "bitchy"], ["Odd", "odd"], ["Hates Men", "hates men"],
						["Hates Women", "hates women"], ["Anorexic", "anorexic"], ["Gluttonous", "gluttonous"], ["Devout", "devout"],
						["Liberated", "liberated"]]);

				options.addOption("Behavioral Quirk", "behavioralQuirk", actor)
					.addValueList([["None", "none"], ["Confident", "confident"], ["Cutting", "cutting"], ["Funny", "funny"],
						["Adores Men", "adores men"], ["Adores Women", "adores women"], ["Insecure", "insecure"], ["Fitness", "fitness"],
						["Sinful", "sinful"], ["Advocate", "advocate"]]);

				options.addOption("Sexual Flaw", "sexualFlaw", actor)
					.addValueList([["None", "none"], ["Hates Oral", "hates oral"], ["Hates Anal", "hates anal"],
						["Hates Penetration", "hates penetration"], ["Repressed", "repressed"], ["Shamefast", "shamefast"], ["Apathetic", "apathetic"],
						["Crude", "crude"], ["Judgemental", "judgemental"], ["Sexually idealistic", "idealistic"]]);

				options.addOption("Paraphilia", "sexualFlaw", actor)
					.addValueList([["None", "none"], ["Abusive", "abusive"], ["Anal Addict", "anal addict"], ["Animal Lover", "animal lover"],
						["Attention Whore", "attention whore"], ["Breast Growth", "breast growth"], ["Breeder", "breeder"], ["Cum Addict", "cum addict"],
						["Malicious", "malicious"], ["Neglectful", "neglectful"], ["Self Hating", "self hating"]]);

				options.addOption("Sexual Quirk", "sexualQuirk", actor)
					.addValueList([["None", "none"], ["Oral", "gagfuck queen"], ["Anal", "painal queen"], ["Penetration", "strugglefuck queen"],
						["Perverted", "perverted"], ["Tease", "tease"], ["Caring", "caring"], ["Unflinching", "unflinching"], ["Size queen", "size queen"],
						["Romantic", "romantic"]]);
			}
		}

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function skills() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		let option;

		if (!infant && !tankSlave) {
			option = options.addOption("Oral sex", "oral", actor.skill);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.skill, true);
			option = options.addOption("Vaginal sex", "vaginal", actor.skill);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.skill, true);
			option = options.addOption("Anal sex", "anal", actor.skill);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.skill, true);
			option = options.addOption("Penetrative sex", "penetrative", actor.skill);
			if (!player) {
				App.StartingGirls.addSet(option, App.Data.StartingGirls.skill, true);
				option = options.addOption("Prostitution", "whoring", actor.skill);
				App.StartingGirls.addSet(option, App.Data.StartingGirls.skill, true);
				option = options.addOption("Entertainment", "entertainment", actor.skill);
				App.StartingGirls.addSet(option, App.Data.StartingGirls.skill, true);
			}
			option = options.addOption("Combat", "combat", actor.skill);
			App.StartingGirls.addSet(option, App.Data.StartingGirls.skill, true);
			if (slave) {
				options.addOption("As Head Girl", "headGirl", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Recruiter", "recruiter", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Bodyguard", "bodyguard", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Madam", "madam", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As DJ", "DJ", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Nurse", "nurse", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Teacher", "teacher", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Attendant", "attendant", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Matron", "matron", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Stewardess", "stewardess", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Milkmaid", "milkmaid", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Farmer", "farmer", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As Wardeness", "wardeness", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As servant", "servant", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As entertainer", "entertainer", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("As whore", "whore", actor.skill)
					.addValue("None", 0).off().showTextBox();
			}
			if (player) {
				options.addOption("Trading", "trading", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("Warfare", "warfare", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("Slaving", "slaving", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("Engineering", "engineering", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("Medicine", "medicine", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("Hacking", "hacking", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("Fighting", "fighting", actor.skill)
					.addValue("None", 0).off().showTextBox();
				options.addOption("Using the cum tap", "cumTap", actor.skill)
					.addValue("None", 0).off().showTextBox();
			}
		}

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function stats() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();

		if (!infant && !tankSlave) {
			options.addOption("Total oral sex", "oral", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Total vaginal sex", "vaginal", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Total anal sex", "anal", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Total mammary sex", "mammary", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Total penetrative sex", "penetrative", actor.counter)
				.addValue("None", 0).off().showTextBox();
			if (!player) {
				options.addOption("Public Usage", "publicUse", actor.counter)
					.addValue("None", 0).off().showTextBox();
			}
		}
		if (slave || citizen) {
			if (V.seeBestiality) {
				options.addOption("Bestiality", "bestiality", actor.counter)
					.addValue("None", 0).off().showTextBox();
			}
		}
		if (!tankSlave) {
			options.addOption("Total milk", "milk", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Total cum", "cum", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (slave || citizen) {
			options.addOption("Pit wins", "pitWins", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Pit losses", "pitLosses", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Pit kills", "pitKills", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (!tankSlave && !player) {
			options.addOption("Births", "births", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (!tankSlave) {
			options.addOption("Total births", "birthsTotal", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Labor count", "laborCount", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Miscarriages", "miscarriages", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (!tankSlave && !infant) {
			options.addOption("Abortions", "abortions", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (player) {
			options.addOption("Elite babies", "birthElite", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Master's babies", "birthMaster", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Slave babies", "birthDegenerate", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Whoring babies", "birthClient", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Arcology owner babies", "birthArcOwner", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Citizen babies", "birthCitizen", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Futa Sister babies", "birthFutaSis", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Selfcest babies", "birthSelf", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Testtube babies", "birthLab", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Rape babies", "birthRape", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Other babies", "birthOther", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		options.addOption("Slaves fathered", "slavesFathered", actor.counter)
			.addValue("None", 0).off().showTextBox();
		if (!player) {
			options.addOption("Player children fathered", "PCChildrenFathered", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		options.addOption("Slaves impregnated", "slavesKnockedUp", actor.counter)
			.addValue("None", 0).off().showTextBox();
		if (!player) {
			options.addOption("Player impregnations", "PCKnockedUp", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (!tankSlave && !player) {
			if (!infant && !child) {
				options.addOption("Times bred by player", "timesBred", actor.counter)
					.addValue("None", 0).off().showTextBox();
			}
			options.addOption("Player's children carried", "PCChildrenBeared", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (!tankSlave && !infant) {
			options.addOption("Times restored hymen", "reHymen", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (player) {
			options.addOption("Stored cum", "storedCum", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Times raped", "raped", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Elite event 1", "moves", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Elite event 2", "quick", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Elite event 3", "crazy", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Elite event 4", "virgin", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Elite event 5", "futa", actor.counter)
				.addValue("None", 0).off().showTextBox();
			options.addOption("Elite event 6", "preggo", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}
		if (slave) {
			options.addOption("Random slave events starred", "events", actor.counter)
				.addValue("None", 0).off().showTextBox();
		}

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function genes() {
		const el = new DocumentFragment();
		let options = new App.UI.OptionsGroup();

		App.UI.DOM.appendNewElement("h2", el, "Genetic quirks");
		options.addOption("Albinism", "albinism", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1]
			])
			.addValue("Active", 2, () => actor.albinismOverride = makeAlbinismOverride(actor.race))
			.addComment("You'll still need to edit eyes, hair and skin color.");
		options.addOption("Gigantism", "gigantism", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]).addComment("Active adds height options above.");
		options.addOption("Dwarfism", "dwarfism", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]).addComment("Active adds height options above.");
		if (V.seeAge) {
			options.addOption("Neoteny", "neoteny", actor.geneticQuirks)
				.addValueList([
					["No", 0],
					["Carrier", 1],
					["Active", 2],
					["Inactive", 3],
				]);
			options.addOption("Progeria", "progeria", actor.geneticQuirks)
				.addValueList([
					["No", 0],
					["Carrier", 1],
					["Active", 2],
					["Inactive", 3],
				]);
		}
		options.addOption("Heterochromia", "heterochromia", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1]
			]).showTextBox({forceString:true}).addComment("Put a color in the textbox to activate the quirk.");
		options.addOption("Androgyny", "androgyny", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Perfect Face", "pFace", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Hideous Face", "uFace", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Potency", "potent", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Fertile", "fertility", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Hyper fertile", "hyperFertility", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Superfetation", "superfetation", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		if (V.seeAge) {
			options.addOption("Polyhydramnios", "polyhydramnios", actor.geneticQuirks)
				.addValueList([
					["No", 0],
					["Carrier", 1],
					["Active", 2]
				]);
		}
		options.addOption("Uterine hypersensitivity", "uterineHypersensitivity", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Macromastia", "macromastia", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2],
				["Inactive", 3],
			]);
		options.addOption("Gigantomastia", "gigantomastia", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2],
				["Inactive", 3],
			]);
		options.addOption("Galactorrhea", "galactorrhea", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2],
				["Inactive", 3],
			]);
		options.addOption("Well hung", "wellHung", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Rear lipedema", "rearLipedema", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Hyperleptinemia", "wGain", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Hypoleptinemia", "wLoss", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Myotonic hypertrophy", "mGain", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Myotonic dystrophy", "mLoss", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Twinning", "twinning", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		options.addOption("Girls only", "girlsOnly", actor.geneticQuirks)
			.addValueList([
				["No", 0],
				["Carrier", 1],
				["Active", 2]
			]);
		if (!infant && !tankSlave) {
			el.append(options.render());
			options = new App.UI.OptionsGroup();
			App.UI.DOM.appendNewElement("h2", el, "Genetic mods");
			options.addOption("Induced NCS", "NCS", actor.geneMods)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
			options.addOption("Rapid cell growth", "rapidCellGrowth", actor.geneMods)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
			options.addOption("Immortality", "immortality", actor.geneMods)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
			options.addOption("Flavored Milk", "flavoring", actor.geneMods)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on()
				.addComment("Make sure to set milk flavor!");
			options.addOption("Aggressive Sperm", "aggressiveSperm", actor.geneMods)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
			options.addOption("Production optimization", "livestock", actor.geneMods)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
			options.addOption("Breeding optimization", "progenitor", actor.geneMods)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
		}
		if (actor.geneMods.flavoring) {
			options.addOption("Milk flavor", "milkFlavor", actor)
				.addValueList([
					["Milk", "none"],
					["Almond", "almond"],
					["Apricot", "apricot"],
					["Banana", "banana"],
					["Blackberry", "blackberry"],
					["Blueberry", "blueberry"],
					["Caramel", "caramel"],
					["Cherry", "cherry"],
					["Chocolate", "chocolate"],
					["Cinnamon", "cinnamon"],
					["Coconut", "coconut"],
					["Coffee", "coffee"],
					["Honey", "honey"],
					["Mango", "mango"],
					["Melon", "melon"],
					["Mint", "mint"],
					["Peach", "peach"],
					["Peanut butter", "peanut butter"],
					["Pineapple", "pineapple"],
					["Raspberry", "raspberry"],
					["Strawberry", "strawberry"],
					["Vanilla", "vanilla"]
				]).showTextBox();
		}

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function extreme() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		if (slave) {
			options.addOption("Fuckdoll", "fuckdoll", actor)
				.addValue("Not a Fuckdoll", 0).addCallback(() => {
					actor.clothes = "no clothing";
					actor.shoes = "none";
				})
				.addValue("Barely a Fuckdoll", 15).addCallback(() => beginFuckdoll(slave))
				.addValue("Slight Fuckdoll", 25).addCallback(() => beginFuckdoll(slave))
				.addValue("Basic Fuckdoll", 45).addCallback(() => beginFuckdoll(slave))
				.addValue("Intermediate Fuckdoll", 65).addCallback(() => beginFuckdoll(slave))
				.addValue("Advanced Fuckdoll", 85).addCallback(() => beginFuckdoll(slave))
				.addValue("Total Fuckdoll", 100).addCallback(() => beginFuckdoll(slave))
				.showTextBox();
		}
		if (slave || citizen) {
			options.addOption("Clipped heels", "heels", actor)
				.addValue("No", 0).off()
				.addValue("Yes", 1).on();
		}
		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function porn() {
		const el = new DocumentFragment();
		const porn = slave?.porn || citizen?.porn;
		const options = new App.UI.OptionsGroup();
		let option;
		const {him, he} = getPronouns(actor);
		options.addOption(`Studio outputting porn of ${him}`, "feed", porn)
			.addValue("off", 0).off()
			.addValue("on", 1).on();
		options.addOption(`Viewer count`, "viewerCount", porn).showTextBox();
		options.addOption(`Spending`, "spending", porn).showTextBox();

		option = options.addOption(`Porn ${he} is known for`, "fameType", porn).addValue("None", "none").pulldown();
		for (const genre of App.Porn.getAllGenres()) {
			option.addValue(genre.uiName(), genre.fameName);
		}

		if (porn.fameType !== "none") {
			options.addOption(`Prestige level`, "prestige", porn)
				.addValueList([
					["Not", 0],
					["Some", 1],
					["Recognized", 2],
					["World renowned", 3],
				]);
			let genre = App.Porn.getGenreByFameName(porn.fameType);
			let descAuto = '';
			switch (porn.prestige) {
				case 1:
					descAuto = `$He has a following in slave pornography. ${genre.prestigeDesc1}.`;
					break;
				case 2:
					descAuto = `He is well known from $his career in slave pornography. ${genre.prestigeDesc2}.`;
					break;
				case 3:
					descAuto = `$He is world famous for $his career in slave pornography. ${genre.prestigeDesc3}.`;
					break;
			}
			options.addOption(`Prestige Description`, "prestigeDesc", porn)
				.addValue("Disable", 0).off()
				.addValue("Automatic", descAuto).off()
				.showTextBox({forceString: true});
		}

		option = options.addOption(`Porn the studio focuses on`, "focus", porn).addValue("None", "none").pulldown();
		for (const genre of App.Porn.getAllGenres()) {
			option.addValue(genre.uiName(), genre.focusName);
		}

		for (const genre of App.Porn.getAllGenres()) {
			options.addOption(`Fame level for ${genre.fameName}`, genre.fameVar, porn.fame).addValue("None", "none").showTextBox();
		}

		el.append(options.render());
		return el;
	}

	/** @returns {DocumentFragment} */
	function tank() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();

		options.addOption(`Weeks until release`, "growTime", tankSlave.incubatorSettings)
			.addValue("Release", 0).off()
			.showTextBox();
		// Fill this out? Is there anything other than this?

		el.append(options.render());
		return el;
	}

	/** show change, and let the player commit to them or abort */
	function finalize() {
		const el = new DocumentFragment();
		// clean data
		const verDiv = App.UI.DOM.appendNewElement("div", el);
		App.UI.DOM.appendNewElement("h3", el, "Verification Changes:");
		if (realPlayer) {
			App.Verify.playerState(player, `<passed to cheatEditActor; has ID ${actor.ID}>`, verDiv);
		} else if (realChild) {
			// TODO: same as the others once ChildState is implemented
		} else if (realInfant) {
			App.Verify.infantState(`<passed to cheatEditActor; has ID ${actor.ID}>`, infant, verDiv);
		} else if (realTankSlave) {
			App.Verify.tankSlaveState(`<passed to cheatEditActor; has ID ${actor.ID}>`, tankSlave, verDiv);
		} else if (realSlave) {
			App.Verify.slaveState(`<passed to cheatEditActor; has ID ${actor.ID}>`, slave, "none", verDiv);
		} else if (realCitizen) {
			// placeholder for when/if persistent citizens are added
		}

		App.UI.DOM.appendNewElement("hr", el);
		App.UI.DOM.appendNewElement("h3", el, "All Changes:");
		let returnPassage = undefined;
		if (realPlayer) {
			App.Utils.showSlaveChanges(actor, V.PC, (val) => App.UI.DOM.appendNewElement("div", el, val), " ");
			returnPassage = "Manage Personal Affairs";
		} else if (realSlave) {
			App.Utils.showSlaveChanges(actor, getSlave(actor.ID), (val) => App.UI.DOM.appendNewElement("div", el, val), " ");
			V.temp.AS = actor.ID;
			returnPassage = "Slave Interact";
		} else if (realChild) {
			// TODO
			// App.Utils.showSlaveChanges(actor, getChild(baseActor.ID), (val) => App.UI.DOM.appendNewElement("div", el, val), " ");
		} else if (realInfant) {
			// TODO
			// App.Utils.showSlaveChanges(actor, getInfant(baseActor.ID), (val) => App.UI.DOM.appendNewElement("div", el, val), " ");
		} else if (realTankSlave) {
			App.Utils.showSlaveChanges(actor, getTankSlave(actor.ID), (val) => App.UI.DOM.appendNewElement("div", el, val), " ");
			returnPassage = "Incubator";
		} else if (realCitizen) {
			// Future
			// App.Utils.showSlaveChanges(actor, getCitizen(baseActor.ID), (val) => App.UI.DOM.appendNewElement("div", el, val), " ");
		}

		App.UI.DOM.appendNewElement("hr", el);
		App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
			"Cancel",
			() => { cleanup(); },
			[],
			returnPassage
		));

		App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
			"Apply cheat edits",
			() => {
				if (actor) {
					if (realPlayer) {
						V.PC = player;
					} else if (realSlave) {
						normalizeRelationship();
						updateGeneRecord();
						overwriteSlave(actor.ID, slave);
					} else if (realTankSlave) {
						normalizeRelationship();
						updateGeneRecord();
						overwriteTankSlave(actor.ID, tankSlave);
					} else {
						throw new Error('Finilization is not implemented for this actor type yet!');
					}
					// TODO: child/etc cleanups
					if (!realTankSlave) {
						ibc.recalculate_coeff_id(actor.ID);
					}
				}
				cleanup();
			},
			[],
			"Cheat Edit Actor Apply"
		));
		return el;
	}

	// Update the gene record attributes
	// Currently the ones that can be edited through gene editor (editGenetics.js) and whatever is referenced in generateGenetics.js
	function updateGeneRecord() {
		let geneRecord = getGenePoolRecordWriteMode(actor.ID);
		let updatedRecord = asSlave(V.temp.cheatActor);

		geneRecord.birthName = updatedRecord.birthName;
		geneRecord.birthSurname = updatedRecord.birthSurname;
		geneRecord.slaveName = updatedRecord.slaveName;
		geneRecord.slaveSurname = updatedRecord.slaveSurname;
		geneRecord.genes = updatedRecord.genes;
		geneRecord.nationality = updatedRecord.nationality;
		geneRecord.origRace = updatedRecord.origRace;
		geneRecord.career = updatedRecord.career;
		geneRecord.father = updatedRecord.father;
		geneRecord.mother = updatedRecord.mother;
		geneRecord.actualAge = updatedRecord.actualAge;
		geneRecord.birthWeek = updatedRecord.birthWeek;

		geneRecord.origSkin = updatedRecord.origSkin;
		geneRecord.markings = updatedRecord.markings;
		geneRecord.eye.origColor = updatedRecord.eye.origColor;
		geneRecord.origHColor = updatedRecord.origHColor;
		geneRecord.underArmHStyle = updatedRecord.underArmHStyle;
		geneRecord.pubicHStyle = updatedRecord.pubicHStyle;
		geneRecord.height = updatedRecord.height;
		geneRecord.natural.height = updatedRecord.natural.height;
		geneRecord.weight = updatedRecord.weight;
		geneRecord.muscles = updatedRecord.muscles;
		geneRecord.shoulders = updatedRecord.shoulders;
		geneRecord.waist = updatedRecord.waist;
		geneRecord.hips = updatedRecord.hips;
		geneRecord.butt = updatedRecord.butt;
		geneRecord.boobs = updatedRecord.boobs;
		geneRecord.boobShape = updatedRecord.boobShape;
		geneRecord.natural.boobs = updatedRecord.natural.boobs;
		geneRecord.nipples = updatedRecord.nipples;
		geneRecord.areolae = updatedRecord.areolae;
		geneRecord.face = updatedRecord.face;
		geneRecord.faceShape = updatedRecord.faceShape;
		geneRecord.lips = updatedRecord.lips;
		geneRecord.teeth = updatedRecord.teeth;
		geneRecord.voice = updatedRecord.voice;

		geneRecord.labia = updatedRecord.labia;
		geneRecord.clit = updatedRecord.clit;
		geneRecord.ovaries = updatedRecord.ovaries;
		geneRecord.eggType = updatedRecord.eggType;

		geneRecord.dick = updatedRecord.dick;
		geneRecord.balls = updatedRecord.balls;
		geneRecord.prostate = updatedRecord.prostate;
		geneRecord.ballType = updatedRecord.ballType;

		geneRecord.hormoneBalance = updatedRecord.hormoneBalance;
		geneRecord.analArea = updatedRecord.analArea;

		geneRecord.intelligence = updatedRecord.intelligence;

		geneRecord.geneticQuirks = updatedRecord.geneticQuirks;
		geneRecord.behavioralFlaw = updatedRecord.behavioralFlaw;
		geneRecord.sexualFlaw = updatedRecord.sexualFlaw;
	}

	/** cleanup any temp vars on V that we used */
	function cleanup() {
		delete V.temp.cheatActor;
	}

	function normalizeRelationship() {
		/** @type {ReadonlyDeep<FC.SlaveState>} */
		const baseSlave = getSlave(actor.ID);
		if (slave && baseSlave && (slave.relationship !== baseSlave.relationship || slave.relationshipTarget !== baseSlave.relationshipTarget)) {
			if (baseSlave.relationship > 0 && slave.relationship <= 0) {
				// broke relationship
				const friend = getSlave(baseSlave.relationshipTarget);
				if (friend) {
					friend.relationship = 0;
					friend.relationshipTarget = 0;
				}
				slave.relationshipTarget = 0;
			} else if (slave.relationship > 0 && slave.relationshipTarget !== baseSlave.relationshipTarget) {
				// new relationship target
				const oldFriend = baseSlave.relationship > 0 ? getSlave(baseSlave.relationshipTarget) : null;
				if (oldFriend) {
					// first break this actor's existing relationship, if she had one
					oldFriend.relationship = 0;
					oldFriend.relationshipTarget = 0;
				}
				const newFriend = getSlave(slave.relationshipTarget);
				if (newFriend) {
					// then break the target's existing relationship, if she had one
					const newFriendFriend = newFriend.relationship > 0 ? getSlave(newFriend.relationshipTarget) : null;
					if (newFriendFriend) {
						newFriendFriend.relationship = 0;
						newFriendFriend.relationshipTarget = 0;
					}
					// then make the new relationship bilateral
					newFriend.relationship = slave.relationship;
					newFriend.relationshipTarget = actor.ID;
				}
			} else if (slave.relationship > 0) {
				// same target, new relationship level
				const friend = getSlave(baseSlave.relationshipTarget);
				if (friend) {
					friend.relationship = slave.relationship;
				}
			}
		}
	}
	/**
	 * Returns the paraphilia for the given Fetish.
	 *
	 * @param {FC.Fetish} fetish
	 * @throws If fetish is unknown
	 * @returns {FC.SexualFlaw}
	 */
	function paraphiliaForFetish(fetish){
		switch (fetish){
			// case Fetish.NONE:
			// case Fetish.MINDBROKEN:
			// 	return SexualFlaw.NONE;
			case Fetish.BESTIALITY:
				return SexualFlaw.ANIMALLOVER;
			case Fetish.BOOBS:
				return SexualFlaw.BREASTEXP;
			case Fetish.BUTTSLUT:
				return SexualFlaw.ANALADDICT;
			case Fetish.CUMSLUT:
				return SexualFlaw.CUMADDICT;
			case Fetish.DOM:
				return SexualFlaw.ABUSIVE;
			case Fetish.HUMILIATION:
				return SexualFlaw.ATTENTION;
			case Fetish.MASOCHIST:
				return SexualFlaw.SELFHATING;
			case Fetish.PREGNANCY:
				return SexualFlaw.BREEDER;
			case Fetish.SADIST:
				return SexualFlaw.MALICIOUS;
			case Fetish.SUBMISSIVE:
				return SexualFlaw.NEGLECT;
			default:
				throw new Error(`Unknown Fetish passed to 'sexualFlawForFetish': ${fetish}`);
		}
	}

	/**
	 * Returns the Fetish for the given paraphilia.
	 *
	 * @param {FC.SexualFlaw} paraphilia
	 * @throws If paraphilia does not have a matching fetish
	 * @returns {FC.Fetish}
	 */
	function fetishForParaphilia(paraphilia){
		switch (paraphilia){
			case SexualFlaw.ANIMALLOVER:
				return Fetish.BESTIALITY;
			case SexualFlaw.BREASTEXP:
				return Fetish.BOOBS;
			case SexualFlaw.ANALADDICT:
				return Fetish.BUTTSLUT;
			case SexualFlaw.CUMADDICT:
				return Fetish.CUMSLUT;
			case SexualFlaw.ABUSIVE:
				return Fetish.DOM;
			case SexualFlaw.ATTENTION:
				return Fetish.HUMILIATION;
			case SexualFlaw.SELFHATING:
				return Fetish.MASOCHIST;
			case SexualFlaw.BREEDER:
				return Fetish.PREGNANCY;
			case SexualFlaw.MALICIOUS:
				return Fetish.SADIST;
			case SexualFlaw.NEGLECT:
				return Fetish.SUBMISSIVE;
			default:
				throw new Error(`Unknown SexualFlaw passed to 'fetishForParaphilia': ${paraphilia}`);
		}
	}
};

// TODO: move code shared by starting player editor, starting girls editor, and/or the cheat actor editor to here
App.Interact.ActorEdit = {};

/**
 * @param {FC.HumanState} actor
 * @param {InstanceType<App.UI.OptionsGroup>} options
 */
App.Interact.ActorEdit.fetusCount = (actor, options) => {
	if (actor.preg > 0) {
		options.addOption("Number of babies in their womb", "a", {a: actor.pregType})
			.showTextBox()
			.addGlobalCallback((count) => {
				let change = count - actor.pregType;
				actor.pregType = count;
				if (change > 0) {
					WombImpregnate(actor, change, actor.pregSource, 0);
				} else if (change < 0) {
					while (change < 0) {
						change++;
						WombRemoveFetus(actor, actor.womb.length -1);
					}
				}
			}).addComment(`Setting this number to less than it already is will remove fetuses.`);
	}
};

/**
 * @param {FC.HumanState} actor
 * @param {InstanceType<App.UI.OptionsGroup>} options
 * @param {boolean} [cheat]
 */
App.Interact.ActorEdit.fetusFatherSelector = (actor, options, cheat=(V.cheatMode === 1)) => {
	let option;
	if (actor.preg > 0) {
		// pregSource
		option = options.addOption(`Set the father of their future children to`, "a", {a: actor.pregSource});
		if (canBreed(V.PC, actor)) {
			option.addValue(`Yourself`, SID.PC);
		}
		if (canBreed(actor, actor)) {
			option.addValue(`Themself`, actor.ID);
		}
		option.addValueList([
			["An unknown source", SID.GENERIC],
			["Another arcology's owner", SID.ARCOWNER],
			["A citizen", SID.CITIZEN],
			["An unknown rapist", SID.RAPIST],
		]);
		if (isPCCareerInCategory("servant")) {
			option.addValue("Your former master", SID.FORMERMASTER);
		}
		if (isPCCareerInCategory("escort")) {
			option.addValue("One of your clients", SID.CLIENT);
		}
		getSlaves().forEach((s) => {
			if (s.ID !== actor.ID && canBreed(s, actor)) {
				option.addValue(SlaveFullName(s), s.ID);
			}
		});
		option.pulldown();
		option.addGlobalCallback(
			/** @param {FC.HumanID} fatherID */
			(fatherID) => {
				actor.pregSource = fatherID;
			}
		);
		if (cheat) {
			option.showTextBox();
		}

		// existing children
		option = options.addOption(`Set the father of their existing child${actor.womb.length > 1 ? "ren" : ""} to`, "a", {a: -10532052305});
		option.addValue(`Don't change`, -10532052305);
		if (canBreed(V.PC, actor)) {
			option.addValue(`Yourself`, SID.PC);
		}
		if (canBreed(actor, actor)) {
			option.addValue(`Themself`, actor.ID);
		}
		option.addValueList([
			["An unknown source", SID.GENERIC],
			["Another arcology's owner", SID.ARCOWNER],
			["A citizen", SID.CITIZEN],
			["An unknown rapist", SID.RAPIST],
		]);
		if (isPCCareerInCategory("servant")) {
			option.addValue("Your former master", SID.FORMERMASTER);
		}
		if (isPCCareerInCategory("escort")) {
			option.addValue("One of your clients", SID.CLIENT);
		}
		getSlaves().forEach((s) => {
			if (s.ID !== actor.ID && canBreed(s, actor)) {
				option.addValue(SlaveFullName(s), s.ID);
			}
		});
		option.pulldown();
		option.addGlobalCallback(
			/** @param {FC.HumanID} fatherID */
			(fatherID) => {
				WombForceFatherID(actor, fatherID);
			}
		);
		if (cheat) {
			option.showTextBox();
		}
	}
};
