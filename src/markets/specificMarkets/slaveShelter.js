App.Markets["Slave Shelter"] = function() {
	const el = new DocumentFragment();
	let r = [];

	const shelterSlave = getShelterSlave();

	if (shelterSlave.bought === 1) {
		App.UI.DOM.appendNewElement("span", el, ` You already bought a shelter slave this week.`);
	} else {
		r.push(`You contact the Slave Shelter to review the profile of the slave the Shelter is offering to a good`);
		if (V.PC.title === 1) {
			r.push(`Master`);
		} else {
			r.push(`Mistress`);
		}
		r.push(`willing to pay the Shelter's nominal placement fee. The severe, tired-looking woman who answers your call hurries through the disclaimers. "All Shelter Slaves are provided as-is... the Shelter provides a single slave for placement each week... resale of Shelter slaves is contractually forbidden... we reserve the right to unannounced inspection of placed slaves... the Shelter follows up on reports of abuse or resale of its slaves..."`);

		App.UI.DOM.appendNewElement("span", el, r.join(" "));

		if (shelterSlave.actor === 0) {
			const possibleOrigins = [];
			possibleOrigins.push("broken");
			if (V.seeExtreme === 1) {
				possibleOrigins.push("amputee", "blind", "deaf");
				if (jsRandom(1, 100) <= V.seeDicks) {
					possibleOrigins.push("cannibal victim male");
				} else {
					possibleOrigins.push("cannibal victim female");
				}
			}
			if (jsRandom(1, 100) <= V.seeDicks) {
				possibleOrigins.push("dickpain", "gelding");
			}
			if (jsRandom(0, 99) >= V.seeDicks) {
				possibleOrigins.push("plugs", "reaction", "used whore");
				if (V.seePreg !== 0) {
					possibleOrigins.push("breeder", "broken womb");
				}
			}
			if (V.week > 80) {
				possibleOrigins.push("degraded DoL");
			}

			const origin = possibleOrigins.random();
			let pedo;
			let minAge;
			let maxAge;
			switch (origin) {
				case "broken":
					shelterSlave.actor = GenerateNewSlave(null, {disableDisability: 1});
					shelterSlave.actor.origin = "$He has never communicated anything about $his background, since $he arrived at the shelter with a broken mind.";
					shelterSlave.actor.career = "a slave";
					setHealth(shelterSlave.actor, jsRandom(-30, -10));
					shelterSlave.actor.anus = 3;
					applyMindbroken(shelterSlave.actor, shelterSlave.actor.intelligence);
					break;
				case "amputee":
					shelterSlave.actor = GenerateNewSlave(null, {disableDisability: 1});
					shelterSlave.actor.origin = "It's not clear why $his previous owner cut $his arms and legs off.";
					shelterSlave.actor.career = "a slave";
					removeLimbs(shelterSlave.actor, "all");
					shelterSlave.actor.devotion = jsRandom(-100, -90);
					shelterSlave.actor.trust = jsRandom(-100, -90);
					setHealth(shelterSlave.actor, jsRandom(-60, -40), normalRandInt(10, 3), normalRandInt(20, 3));
					shelterSlave.actor.behavioralFlaw = either("hates men", "hates women", "odd");
					shelterSlave.actor.sexualFlaw = either("apathetic", "hates anal", "hates oral", "hates penetration");
					break;
				case "blind":
					shelterSlave.actor = GenerateNewSlave(null, {minAge: V.minimumSlaveAge, maxAge: 22, disableDisability: 1});
					shelterSlave.actor.origin = "$His owner purposely blinded $him by dumping boiling water into $his eyes.";
					shelterSlave.actor.career = "a slave";
					eyeSurgery(shelterSlave.actor, "both", "blind");
					setEyeColor(shelterSlave.actor, "milky white");
					App.Medicine.Modification.addScar(shelterSlave.actor, "face", "burn", 2);
					shelterSlave.actor.devotion = jsRandom(-100, -90);
					shelterSlave.actor.trust = jsRandom(-100, -90);
					setHealth(shelterSlave.actor, jsRandom(-60, -40), normalRandInt(10, 3), normalRandInt(20, 3));
					shelterSlave.actor.behavioralFlaw = "hates men";
					shelterSlave.actor.sexualFlaw = "hates oral";
					shelterSlave.actor.canRecruit = 0;
					shelterSlave.actor.overrideEyeColor = 1;
					break;
				case "deaf":
					shelterSlave.actor = GenerateNewSlave(null, {minAge: V.minimumSlaveAge, maxAge: 22, disableDisability: 1});
					shelterSlave.actor.origin = "$His owner purposely deafened $him by piercing $his eardrums with knitting needles.";
					shelterSlave.actor.career = "a slave";
					shelterSlave.actor.hears = -2;
					shelterSlave.actor.devotion = jsRandom(-100, -90);
					shelterSlave.actor.trust = jsRandom(-100, -90);
					setHealth(shelterSlave.actor, jsRandom(-60, -40), normalRandInt(10, 3), normalRandInt(20, 3));
					shelterSlave.actor.behavioralFlaw = "hates men";
					shelterSlave.actor.sexualFlaw = "hates oral";
					shelterSlave.actor.canRecruit = 0;
					break;
				case "broken womb":
					shelterSlave.actor = GenerateNewSlave("XX", {minAge: 6, maxAge: 22, disableDisability: 1});
					shelterSlave.actor.origin = "$He was found unresponsive in the lower arcology with a gaping pussy and deflated belly. It is unclear what happened to $him.";
					shelterSlave.actor.career = "homeless";
					setHealth(shelterSlave.actor, jsRandom(-50, -30), normalRandInt(10, 3), normalRandInt(20, 3));
					shelterSlave.actor.weight = -50;
					shelterSlave.actor.vagina = 9;
					shelterSlave.actor.bellySag = 20;
					applyMindbroken(shelterSlave.actor, shelterSlave.actor.intelligence);
					break;
				case "cannibal victim male":
					if (V.pedoMode === 1) {
						pedo = 1;
					} else {
						maxAge = 42;
					}
					shelterSlave.actor = GenerateNewSlave("XY", {
						minAge: 16, maxAge: maxAge, disableDisability: 1, ageOverridesPedoMode: pedo
					});
					shelterSlave.actor.origin = "$His previous owner forced $him to cut off $his dick and balls and cook them.";
					shelterSlave.actor.career = "a slave";
					shelterSlave.actor.devotion = jsRandom(-100, -80);
					shelterSlave.actor.trust = jsRandom(-100, -90);
					setHealth(shelterSlave.actor, jsRandom(-60, -40), normalRandInt(10, 3), normalRandInt(20, 3));
					shelterSlave.actor.dick = 0;
					shelterSlave.actor.foreskin = 0;
					shelterSlave.actor.balls = 0;
					shelterSlave.actor.scrotum = 0;
					shelterSlave.actor.skill.penetrative = 0;
					shelterSlave.actor.behavioralFlaw = either("anorexic", "anorexic", "anorexic", "odd");
					shelterSlave.actor.sexualFlaw = either("apathetic", "neglectful", "self hating");
					shelterSlave.actor.fetish = either("masochist", "none", "none");
					App.Medicine.Modification.addScar(shelterSlave.actor, "pubic mound", "scars from $his crudely performed self-castration");
					break;
				case "cannibal victim female":
					if (V.pedoMode === 1) {
						pedo = 1;
					} else {
						maxAge = 42;
					}
					shelterSlave.actor = GenerateNewSlave("XX", {
						minAge: 16, maxAge: maxAge, disableDisability: 1, ageOverridesPedoMode: pedo
					});
					shelterSlave.actor.origin = "$His previous owner forced $him to cut off $his breasts and cook them.";
					shelterSlave.actor.career = "a slave";
					shelterSlave.actor.devotion = jsRandom(-100, -80);
					shelterSlave.actor.trust = jsRandom(-100, -90);
					setHealth(shelterSlave.actor, jsRandom(-60, -40), normalRandInt(10, 3), normalRandInt(20, 3));
					shelterSlave.actor.boobs = 10;
					shelterSlave.actor.boobsImplant = 0;
					shelterSlave.actor.boobsImplantType = "none";
					shelterSlave.actor.nipples = "tiny";
					shelterSlave.actor.behavioralFlaw = either("anorexic", "anorexic", "anorexic", "odd");
					shelterSlave.actor.sexualFlaw = either("apathetic", "neglectful", "self hating");
					shelterSlave.actor.fetish = either("masochist", "none", "none");
					App.Medicine.Modification.addScar(shelterSlave.actor, "left breast", "an ugly mess of scar tissue");
					App.Medicine.Modification.addScar(shelterSlave.actor, "right breast", "an ugly mess of scar tissue");
					break;
				case "degraded DoL":
					shelterSlave.actor = GenerateNewSlave(null, {minAge: 14, disableDisability: 1, ageOverridesPedoMode: 1});
					shelterSlave.actor.origin = "$He is an enslaved Daughter of Liberty, caught some weeks after the failed coup. $His previous owner used $him as a punching bag and dart board, then when he was bored of $him tattooed obscenities all over $his body and threw $him away.";
					shelterSlave.actor.career = "a slave";
					shelterSlave.actor.devotion = jsRandom(-100, -90);
					shelterSlave.actor.trust = jsRandom(-100, -90);
					setHealth(shelterSlave.actor, jsRandom(-60, -40), normalRandInt(10, 3), normalRandInt(20, 3));
					shelterSlave.actor.slaveName = either("Cumbitch", "Cumbucket", "Cumdoll", "Cumgulper", "Fuckhole", "Fuckmeat", "Fuckpuppet", "Fuckslut", "Fucktoy", "Rapemeat", "Sluttypig", "Spunkbucket", "Spunkswallow", "Whorelips");
					shelterSlave.actor.slaveSurname = 0;
					shelterSlave.actor.minorInjury = either("black eye", "bruise", "split lip", 0);
					shelterSlave.actor.weight = jsRandom(-90, -30);
					shelterSlave.actor.muscles = jsRandom(-75, 0);
					shelterSlave.actor.energy = jsRandom(0, 30);
					shelterSlave.actor.fetish = either("humiliation", "humiliation", "masochist", "none", "none", "submissive");
					shelterSlave.actor.boobsTat = either("degradation", "rude words", "none");
					shelterSlave.actor.buttTat = either("degradation", "rude words", 0);
					shelterSlave.actor.lipsTat = either("degradation", "rude words", 0);
					shelterSlave.actor.anusTat = either("degradation", "rude words", 0);
					shelterSlave.actor.shouldersTat = either("degradation", "rude words", 0);
					shelterSlave.actor.armsTat = either("degradation", "rude words", 0);
					shelterSlave.actor.legsTat = either("degradation", "rude words", 0);
					shelterSlave.actor.backTat = either("degradation", "rude words", 0);
					shelterSlave.actor.stampTat = either("degradation", "rude words", 0);
					shelterSlave.actor.skill.anal = jsRandom(10, 25);
					shelterSlave.actor.anus = jsRandom(1, 4);
					if (isFertile(shelterSlave.actor) && V.seePreg !== 0) {
						shelterSlave.actor.preg = either(-3, -2, -2, -2, 0, 0, 2, 3, 4, 5);
						if (shelterSlave.actor.preg > 0) {
							shelterSlave.actor.pregSource = SID.CITIZEN;
							shelterSlave.actor.pregKnown = 1;
							shelterSlave.actor.pregType = setPregType(shelterSlave.actor);
							WombImpregnate(shelterSlave.actor, shelterSlave.actor.pregType, shelterSlave.actor.pregSource, shelterSlave.actor.preg);
						}
					}
					if (shelterSlave.actor.vagina > -1) {
						shelterSlave.actor.vagina = jsRandom(1, 4);
						shelterSlave.actor.skill.vaginal = jsRandom(10, 25);
						shelterSlave.actor.vaginaTat = either("degradation", "rude words", 0);
					}
					if (shelterSlave.actor.dick > 1) {
						shelterSlave.actor.dickTat = either("degradation", "rude words", 0);
					}
					break;
				case "gelding":
					shelterSlave.actor = GenerateNewSlave("XY", {minAge: 20, maxAge: 42, disableDisability: 1});
					shelterSlave.actor.origin = "$His previous owner gelded $him and used $him for anal abuse.";
					shelterSlave.actor.career = "a slave";
					shelterSlave.actor.devotion = jsRandom(-75, -60);
					shelterSlave.actor.trust = jsRandom(-100, -75);
					setHealth(shelterSlave.actor, jsRandom(-50, -30));
					shelterSlave.actor.face = jsRandom(-60, -20);
					shelterSlave.actor.dick = jsRandom(1, 2);
					shelterSlave.actor.balls = 0;
					shelterSlave.actor.anus = 4;
					shelterSlave.actor.skill.oral = 0;
					shelterSlave.actor.skill.penetrative = 0;
					shelterSlave.actor.skill.anal = 15;
					shelterSlave.actor.skill.whoring = 0;
					shelterSlave.actor.skill.entertainment = 0;
					shelterSlave.actor.skill.combat = 0;
					shelterSlave.actor.attrXY = jsRandom(40, 60);
					shelterSlave.actor.behavioralFlaw = either("anorexic", "gluttonous", "hates men", "odd");
					shelterSlave.actor.sexualFlaw = either("apathetic", "hates anal");
					break;
				case "dickpain":
					shelterSlave.actor = GenerateNewSlave("XY", {minAge: 20, maxAge: 42, disableDisability: 1});
					shelterSlave.actor.origin = "$His background is obscure, but seems to have involved terrible abuse of $his huge cock and balls.";
					shelterSlave.actor.career = "a slave";
					shelterSlave.actor.devotion = jsRandom(-75, -60);
					shelterSlave.actor.trust = jsRandom(-100, -75);
					setHealth(shelterSlave.actor, jsRandom(-50, -30));
					shelterSlave.actor.face = jsRandom(-60, -20);
					shelterSlave.actor.dick = jsRandom(4, 5);
					shelterSlave.actor.balls = jsRandom(4, 5);
					shelterSlave.actor.anus = 0;
					shelterSlave.actor.skill.oral = 0;
					shelterSlave.actor.skill.penetrative = 0;
					shelterSlave.actor.skill.anal = 0;
					shelterSlave.actor.skill.whoring = 0;
					shelterSlave.actor.skill.entertainment = 0;
					shelterSlave.actor.skill.combat = 0;
					shelterSlave.actor.energy = jsRandom(5, 10);
					shelterSlave.actor.attrXX = 0;
					shelterSlave.actor.behavioralFlaw = either("hates women", "odd");
					shelterSlave.actor.sexualFlaw = either("apathetic");
					break;
				case "plugs":
					shelterSlave.actor = GenerateNewSlave("XX", {minAge: 20, maxAge: 42, disableDisability: 1});
					shelterSlave.actor.origin = "$His holes were cruelly stretched by constant plug use.";
					shelterSlave.actor.career = "a slave";
					shelterSlave.actor.devotion = jsRandom(-75, -60);
					shelterSlave.actor.trust = jsRandom(-100, -75);
					setHealth(shelterSlave.actor, jsRandom(-50, -30));
					shelterSlave.actor.vagina = 4;
					shelterSlave.actor.anus = 4;
					shelterSlave.actor.skill.oral = 15;
					shelterSlave.actor.skill.anal = 15;
					shelterSlave.actor.skill.vaginal = 15;
					shelterSlave.actor.skill.whoring = 0;
					shelterSlave.actor.skill.entertainment = 0;
					shelterSlave.actor.skill.combat = 0;
					shelterSlave.actor.behavioralFlaw = either("anorexic", "gluttonous", "odd");
					shelterSlave.actor.sexualFlaw = either("hates anal", "hates oral", "hates penetration");
					break;
				case "breeder":
					if (V.pedoMode === 1) {
						minAge = (V.fertilityAge + 6);
						pedo = 1; // Old enough to have been pregnant many times.
					} else {
						minAge = 30;
						maxAge = 42;
					}
					shelterSlave.actor = GenerateNewSlave("XX", {
						minAge: minAge, maxAge: maxAge, disableDisability: 1, ageOverridesPedoMode: pedo
					});
					shelterSlave.actor.origin = "$His previous owner discarded $him after many pregnancies.";
					shelterSlave.actor.career = "a breeder";
					shelterSlave.actor.devotion = jsRandom(-75, -60);
					shelterSlave.actor.trust = jsRandom(-100, -75);
					setHealth(shelterSlave.actor, jsRandom(-50, -30));
					shelterSlave.actor.preg = -2;
					shelterSlave.actor.counter.birthsTotal = 13;
					shelterSlave.actor.pregAdaptation = 60;
					shelterSlave.actor.bellySag = 10;
					shelterSlave.actor.bellySagPreg = 10;
					shelterSlave.actor.vagina = 3;
					shelterSlave.actor.skill.oral = 0;
					shelterSlave.actor.skill.anal = 0;
					shelterSlave.actor.skill.vaginal = 0;
					shelterSlave.actor.skill.whoring = 0;
					shelterSlave.actor.skill.entertainment = 0;
					shelterSlave.actor.skill.combat = 0;
					shelterSlave.actor.behavioralFlaw = either("gluttonous", "hates men", "odd");
					shelterSlave.actor.sexualFlaw = either("apathetic", "hates penetration", "repressed");
					break;
				case "used whore":
					shelterSlave.actor = GenerateNewSlave("XX", {
						minAge: 32, maxAge: 42, disableDisability: 1, ageOverridesPedoMode: 1
					});// 20 years of brothel service.
					shelterSlave.actor.origin = "$He was worn out by twenty years of brothel service.";
					shelterSlave.actor.career = "a prostitute";
					shelterSlave.actor.devotion = jsRandom(-75, -60);
					shelterSlave.actor.trust = jsRandom(-100, -75);
					setHealth(shelterSlave.actor, jsRandom(-60, -40), normalRandInt(10, 3));
					shelterSlave.actor.face = jsRandom(-60, -20);
					shelterSlave.actor.preg = -2;
					shelterSlave.actor.vagina = 4;
					shelterSlave.actor.anus = 4;
					shelterSlave.actor.skill.oral = 35;
					shelterSlave.actor.skill.anal = 35;
					shelterSlave.actor.skill.vaginal = 35;
					shelterSlave.actor.skill.penetrative = 15;
					shelterSlave.actor.skill.whoring = 35;
					shelterSlave.actor.skill.entertainment = 15;
					shelterSlave.actor.skill.combat = 0;
					shelterSlave.actor.behavioralFlaw = either("anorexic", "gluttonous", "hates men", "odd");
					shelterSlave.actor.sexualFlaw = either("apathetic", "hates anal", "hates oral", "hates penetration");
					break;
				case "reaction":
					shelterSlave.actor = GenerateNewSlave(null, {disableDisability: 1});
					shelterSlave.actor.origin = "$He was discarded after suffering a terrible reaction to growth hormone treatment.";
					shelterSlave.actor.career = "a slave";
					shelterSlave.actor.devotion = jsRandom(-75, -60);
					shelterSlave.actor.trust = jsRandom(-100, -75);
					setHealth(shelterSlave.actor, jsRandom(-60, -40), normalRandInt(10, 3), normalRandInt(20, 3));
					shelterSlave.actor.chem = 1000;
					if ((shelterSlave.actor.dick > 0) && (jsRandom(1, 2) === 1)) {
						shelterSlave.actor.dick = jsRandom(5, 6);
					}
					if ((shelterSlave.actor.balls > 0) && (jsRandom(1, 2) === 1)) {
						shelterSlave.actor.balls = jsRandom(5, 10);
					}
					if (jsRandom(1, 3) === 1) {
						shelterSlave.actor.boobs += 100 * jsRandom(10, 30);
					}
					if (jsRandom(1, 3) === 1) {
						shelterSlave.actor.butt += jsRandom(3, 5);
					}
					shelterSlave.actor.behavioralFlaw = either("anorexic", "gluttonous", "odd");
					shelterSlave.actor.sexualFlaw = either("apathetic", "hates anal", "hates oral", "hates penetration");
					break;
				default:
					shelterSlave.actor = GenerateNewSlave(null, {disableDisability: 1});
					throw Error(`"${origin}" not found`);
			}
		}
		const cost = sexSlaveContractCost();
		const {his} = getPronouns(shelterSlave.actor);

		App.UI.DOM.appendNewElement("p", el, `The placement fee is ${cashFormat(cost)}.`);

		if (V.cash >= cost) {
			App.UI.DOM.appendNewElement(
				"p",
				el,
				App.UI.DOM.link(
					`Buy ${his} slave contract`,
					() => {
						cashX(forceNeg(cost), "slaveTransfer", asSlave(shelterSlave.actor));
						shelterSlave.bought = 1;
						asSlave(shelterSlave.actor).origin = "You got $him at the Slave Shelter. " + asSlave(shelterSlave.actor).origin;
						jQuery("#slave-markets").empty().append(App.UI.newSlaveIntro(asSlave(shelterSlave.actor)));
					}
				)
			);
		} else {
			App.UI.DOM.appendNewElement("p", el, `You lack the necessary funds to buy this slave.`, "note");
		}

		el.append(App.Desc.longSlave(shelterSlave.actor, {market: "generic"}));
		App.UI.DOM.appendNewElement("p", el, pronounsForSlaveProp(shelterSlave.actor, shelterSlave.actor.origin));
	}
	return el;
};
