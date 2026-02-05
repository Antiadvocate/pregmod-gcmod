// cSpell:ignore sheedsh, Bugsh, lolimommy, rawr, Slooty, Arcol-O-gies, diss..., licky, milkies, breastgasms, Iluvutu, Viklanders, looove, Thurrr.. shty, Enthing, Ethrything, Arghhhh, Yershhhhh
// cSpell:ignore doin', holdin', comin', goin', hafta, concludin', keepin', headin', trustin'

/**
 * @file FCTVActors.js - FCTV Actor Definitions
 *
 * Contains all actor definitions used by FCTV channels.
 * Actors are dynamically generated slave objects with specific traits.
 *
 * @requires GenerateNewSlave (from game engine)
 * @requires baseSlave (from game engine)
 */

/** @type {{[key: string]: FC.SlaveState}} */
App.Data.FCTV.actors = {
	get millie() {
		const slave = baseSlave();
		slave.devotion = 100;
		slave.trust = 100;
		slave.weight = 120;
		slave.boobs = 5000;
		slave.hips = 2;
		slave.butt = 5;
		slave.hLength = 50;
		slave.skin = "dark olive";
		slave.hStyle = "luxurious";
		slave.hColor = "strawberry-blonde";
		slave.clothes = "a leotard";
		return slave;
	},
	get millieBreeder() {
		const slave = App.Data.FCTV.actors.millie;
		slave.devotion = 0;
		slave.trust = 0;
		slave.boobs = 700;
		slave.hips = 2;
		slave.butt = 5;
		slave.hLength = 50;
		slave.hStyle = "luxurious";
		slave.hColor = "blonde";
		slave.boobShape = "perky";
		slave.belly = 10000;
		slave.preg = 35;
		slave.clothes = "a maternity dress";
		return slave;
	},
	get kirk() {
		const slave = baseSlave();
		slave.actualAge = 44;
		slave.devotion = 0;
		slave.trust = 0;
		slave.muscles = 60;
		slave.weight = 30;
		slave.waist = 90;
		slave.boobs = 10;
		slave.shoulders = 2;
		slave.butt = 0;
		slave.hips = -1;
		slave.hLength = 10;
		slave.hColor = "dark brown";
		slave.faceShape = "masculine";
		slave.hStyle = "messy";
		slave.eyewear = "glasses";
		slave.clothes = "conservative clothing";
		slave.shoes = "flats";
		return slave;
	},
	get jules() {
		const slave = baseSlave();
		slave.devotion = 0;
		slave.trust = 0;
		slave.weight = 30;
		slave.waist = 30;
		slave.boobs = 700;
		slave.butt = 3;
		slave.hLength = 50;
		slave.hStyle = "luxurious";
		slave.hColor = "auburn";
		slave.boobShape = "perky";
		slave.clothes = "panties and pasties";
		slave.collar = "stylish leather";
		return slave;
	},
	get red() {
		const slave = baseSlave();
		slave.devotion = -90;
		slave.trust = 0;
		slave.face = -20;
		slave.hLength = 50;
		slave.hStyle = "messy";
		slave.hColor = "blazing red";
		slave.underArmHStyle = "bushy";
		slave.underArmHColor = "blazing red";
		slave.height = 150;
		slave.boobs = 700;
		slave.boobShape = "perky";
		slave.shoulders = 0;
		slave.waist = 180;
		slave.butt = 3;
		slave.hips = 3;
		slave.clothes = "spats and a tank top";
		slave.shoes = "flats";
		return slave;
	},
	get twin() {
		const slave = baseSlave();
		slave.devotion = 0;
		slave.trust = 0;
		slave.muscles = 60;
		slave.boobs = 700;
		slave.butt = 3;
		slave.hLength = 50;
		slave.skin = "tan";
		slave.hStyle = "messy";
		slave.hColor = "blonde";
		slave.boobShape = "perky";
		return slave;
	},
	get premiumVirgin() {
		let slave = GenerateNewSlave("XX", {
			disableDisability: 1, minAge: (V.fertilityAge + 2), maxAge: 18, ageOverridesPedoMode: 1
		});
		slave.devotion = jsRandom(60, 90);
		slave.weight = jsRandom(-10, 10);
		slave.waist = jsRandom(-45, 25);
		slave.face = jsRandom(70, 100);
		slave.anus = 0;
		slave.vagina = 0;
		slave.trueVirgin = 1;
		slave.boobs = jsRandom(14, 26) * 50;
		slave.natural.boobs = slave.boobs - 300;
		slave.boobShape = "perky";
		slave.hips = 2;
		slave.butt = jsRandom(5, 6);
		slave.shoulders = 1;
		slave.preg = 0;
		slave.ovaries = 1;
		slave.teeth = "normal";
		slave.vaginaLube = 2;
		slave.energy = jsRandom(65, 95);
		slave.attrXY = jsRandom(70, 100);
		slave.attrXX = jsRandom(60, 90);
		slave.attrKnown = 1;
		slave.fetishKnown = 1;
		slave.lips = jsRandom(20, 50);
		slave.fetish = either("cumslut", "cumslut", "humiliation", "pregnancy", "pregnancy", "pregnancy", "submissive");
		slave.behavioralQuirk = either("advocate", "funny", "insecure", "none", "none");
		slave.sexualQuirk = either("caring", "none", "romantic");
		slave.fetishStrength = jsRandom(70, 100);
		slave.sexualFlaw = "none";
		slave.behavioralFlaw = "none";
		slave.intelligence = jsRandom(51, 70);
		slave.intelligenceImplant = 30;
		slave.trust = jsRandom(50, 80);

		slave.custom.tattoo = "$He has a small stylized 'A' tattooed on the nape of $his neck marking $him as the product of the famous breeding program at Arcturus Arcology.";
		slave.skill.vaginal = 0;
		slave.skill.entertainment = jsRandom(50, 80);
		slave.skill.oral = jsRandom(20, 60);
		slave.skill.anal = 0;
		slave.skill.whoring = 0;
		slave = FCTV.FinalTouches(slave);
		return slave;
	},
	get hyperPregnant() {
		let slave = GenerateNewSlave("XX", {
			disableDisability: 1, minAge: (V.fertilityAge + 3), maxAge: 20, ageOverridesPedoMode: 1
		});
		slave.weight = jsRandom(10, 20);
		slave.waist = jsRandom(-25, 25);
		slave.anus = 1;
		slave.vagina = 2;
		slave.preg = jsRandom(25, 30);
		slave.pregAdaptation = 300;
		slave.lips = jsRandom(20, 50);
		slave.teeth = "normal";
		slave.vaginaLube = 2;
		slave.boobs = jsRandom(10, 30) * 50;
		slave.lactation = 1;
		slave.lactationDuration = 2;
		slave.hips = 3;
		slave.hipsImplant = 1;
		slave.butt = jsRandom(7, 9);
		slave.attrKnown = 1;
		slave.energy = jsRandom(65, 100);
		slave.attrXY = jsRandom(40, 100);
		slave.devotion = jsRandom(40, 70);
		slave.trust = jsRandom(40, 70);
		slave.fetish = "pregnancy";
		slave.fetishKnown = 1;
		slave.fetishStrength = 100;
		slave.sexualFlaw = "breeder";
		slave.behavioralFlaw = "none";
		slave.behavioralQuirk = "none";
		slave.sexualQuirk = either("caring", "caring", "romantic");
		slave.intelligence = jsRandom(-15, 80);
		slave.intelligenceImplant = 15;
		if (V.seeHyperPreg === 0) {
			slave.pregType = either(6, 7, 7, 8);
		} else {
			slave.pregType = jsRandom(10, 16);
		}
		slave.pregWeek = slave.preg;
		SetBellySize(slave);
		discoverPregnancy(slave);

		slave.skill.vaginal = jsRandom(50, 80);
		slave.skill.oral = jsRandom(40, 80);
		slave.skill.anal = jsRandom(20, 50);
		slave.skill.whoring = jsRandom(0, 50);
		slave = FCTV.FinalTouches(slave);
		return slave;
	},
	get superfetation() { // superfetation
		let slave = GenerateNewSlave("XX", {
			disableDisability: 1, minAge: (V.fertilityAge + 4), maxAge: 24, ageOverridesPedoMode: 1
		});

		slave.weight = jsRandom(20, 40);
		slave.waist = jsRandom(-25, 25);
		slave.boobs = jsRandom(4, 6) * 100;
		slave.butt = jsRandom(3, 5);
		slave.hips = 1;
		slave.face = jsRandom(60, 90);
		slave.anus = 1;
		slave.vagina = 3;
		slave.preg = 0;
		slave.pregWeek = -2;
		slave.bellySag = 1;
		slave.bellySagPreg = 1;
		slave.teeth = "normal";
		slave.vaginaLube = 2;
		slave.energy = jsRandom(60, 90);
		slave.attrXY = jsRandom(60, 100);
		slave.attrXX = jsRandom(40, 65);
		slave.attrKnown = 1;
		slave.fetishKnown = 1;
		slave.sexualQuirk = "none";
		slave.fetish = either("cumslut", "humiliation", "pregnancy", "pregnancy", "submissive");
		slave.fetishStrength = jsRandom(70, 100);
		slave.sexualFlaw = "none";
		slave.behavioralFlaw = "none";
		slave.behavioralQuirk = "none";
		slave.intelligence = jsRandom(-15, 80);
		slave.intelligenceImplant = 0;
		slave.devotion = jsRandom(60, 90);
		slave.trust = jsRandom(50, 80);
		slave.geneticQuirks.superfetation = 2;

		slave.skill.vaginal = jsRandom(50, 100);
		slave.skill.oral = jsRandom(20, 50);
		slave.skill.anal = jsRandom(10, 20);
		slave.counter.birthsTotal = jsRandom(2, 3);
		slave = FCTV.FinalTouches(slave);
		return slave;
	},
	get MILF() { // MILF
		let slave = GenerateNewSlave("XX", {
			disableDisability: 1, minAge: 36, maxAge: 40, ageOverridesPedoMode: 1
		});
		slave.weight = jsRandom(20, 90);
		slave.waist = jsRandom(-45, 45);
		slave.boobs = jsRandom(20, 30) * 50;
		slave.natural.boobs = 850;
		slave.butt = jsRandom(5, 7);
		slave.hips = 2;
		slave.face = jsRandom(60, 90);
		slave.anus = 1;
		slave.vagina = 2;
		slave.preg = 0;
		slave.teeth = "normal";
		slave.vaginaLube = 2;
		slave.energy = jsRandom(60, 90);
		slave.attrXY = jsRandom(60, 100);
		slave.attrXX = jsRandom(40, 85);
		slave.attrKnown = 1;
		slave.fetishKnown = 1;
		slave.fetish = either("buttslut", "buttslut", "cumslut", "cumslut", "humiliation", "pregnancy", "pregnancy", "submissive");
		slave.fetishStrength = jsRandom(70, 100);
		slave.sexualFlaw = "none";
		slave.behavioralFlaw = "none";
		slave.behavioralQuirk = "none";
		slave.sexualQuirk = "none";
		slave.intelligence = jsRandom(-15, 80);
		slave.intelligenceImplant = 15;
		slave.devotion = jsRandom(60, 90);
		slave.trust = jsRandom(50, 80);
		slave.skill.vaginal = jsRandom(50, 100);
		slave.skill.entertainment = jsRandom(20, 80);
		slave.skill.oral = jsRandom(50, 100);
		slave.skill.anal = jsRandom(20, 80);
		slave.skill.whoring = jsRandom(20, 80);
		slave.counter.birthsTotal = jsRandom(1, 3);
		slave = FCTV.FinalTouches(slave);
		return slave;
	},
	get youngHottie() { // discount young hottie
		let slave = GenerateNewSlave("XX", {disableDisability: 1, maxAge: 25, ageOverridesPedoMode: 1});

		slave.face = jsRandom(70, 100);
		slave.weight = jsRandom(-5, 10);
		slave.waist = jsRandom(-45, 25);
		slave.anus = 1;
		slave.vagina = 1;
		slave.boobs = jsRandom(14, 26) * 50;
		slave.boobShape = "perky";
		slave.hips = 2;
		slave.butt = jsRandom(5, 6);
		slave.shoulders = -1;
		slave.preg = 0;
		slave.lips = jsRandom(25, 50);
		slave.vaginaLube = 2;
		slave.sexualFlaw = either("hates anal", "hates oral", "hates penetration", "idealistic");
		slave.behavioralFlaw = either("arrogant", "bitchy", "hates men");
		slave.energy = 10;
		slave.fetish = "none";
		slave.clit = either(3, 3, 4, 4, 5);
		slave.muscles = jsRandom(0, 25);
		slave.devotion = jsRandom(-25, 25);
		slave.trust = jsRandom(-25, 25);
		if (slave.physicalAge >= 12) {
			slave.teeth = "normal";
		}
		slave.skill.vaginal = 15;
		slave.skill.oral = 15;
		slave.skill.anal = 15;
		slave.skill.whoring = 15;
		slave = FCTV.FinalTouches(slave);
		return slave;
	},
	get hugeBalls() { // huge balls
		let slave = GenerateNewSlave("XY", {disableDisability: 1, maxAge: 25, ageOverridesPedoMode: 1});

		slave.anus = 2;
		slave.balls = jsRandom(20, 35);
		slave.dick = jsRandom(3, 5);
		slave.prostate = 2;
		slave.devotion = jsRandom(50, 80);
		slave.trust = jsRandom(50, 80);
		slave.scrotum = slave.balls;
		slave.skill.oral = jsRandom(30, 60);
		slave.skill.penetrative = jsRandom(0, 50);
		slave.skill.anal = jsRandom(20, 50);
		slave.skill.whoring = jsRandom(0, 25);
		slave = FCTV.FinalTouches(slave);
		return slave;
	},
	get mpreg() { // mpreg dickgirl
		let slave = GenerateNewSlave("XY", {disableDisability: 1, maxAge: 22, ageOverridesPedoMode: 1});
		slave.anus = 2;
		slave.vagina = 1;
		slave.ovaries = 0;
		slave.mpreg = 1;
		slave.preg = 0;
		slave.dick = jsRandom(3, 5);
		slave.balls = jsRandom(3, 6);
		slave.muscles = either(20, 50);
		slave.energy = jsRandom(70, 100);
		slave.attrXY = jsRandom(70, 100);
		slave.attrXX = jsRandom(70, 100);
		slave.attrKnown = 1;
		slave.fetishKnown = 1;
		slave.fetish = "pregnancy";
		slave.fetishStrength = jsRandom(80, 100);
		slave.sexualFlaw = "none";
		slave.behavioralFlaw = "none";
		slave.behavioralQuirk = "none";
		slave.sexualQuirk = "none";
		slave.intelligence = jsRandom(-15, 80);
		slave.intelligenceImplant = 15;
		slave.devotion = jsRandom(60, 90);
		slave.trust = jsRandom(50, 80);
		slave.skill.oral = jsRandom(40, 80);
		slave.skill.penetrative = jsRandom(0, 20);
		slave.skill.anal = jsRandom(40, 80);
		slave.skill.whoring = jsRandom(40, 70);
		slave = FCTV.FinalTouches(slave);
		return slave;
	},
	get FSmodel() {
		const slave = baseSlave();
		slave.devotion = 0;
		slave.trust = 0;
		slave.hLength = 50;
		slave.hStyle = "neat";
		slave.hColor = "brown";
		slave.boobs = 700;
		slave.boobShape = "perky";
		slave.waist = 180;
		slave.butt = 3;
		slave.hips = 3;
		slave.clothes = "conservative clothing";
		slave.shoes = "flats";
		return slave;
	},
	get mindy() {
		const slave = GenerateNewSlave("XX");
		slave.devotion = 100;
		slave.trust = 100;
		slave.hLength = 50;
		slave.hStyle = "luxurious";
		slave.hColor = "strawberry-blonde";
		slave.boobs = 1400;
		slave.nipples = "huge";
		slave.boobShape = "perky";
		slave.areolae = 4;
		slave.waist = 180;
		slave.butt = 3;
		slave.hips = 3;
		slave.clothes = "a string bikini";
		return slave;
	},
	get mindyBloated() {
		const slave = GenerateNewSlave("XX");
		slave.devotion = 100;
		slave.trust = 100;
		slave.hLength = 50;
		slave.hStyle = "luxurious";
		slave.hColor = "strawberry-blonde";
		slave.boobs = 1400;
		slave.nipples = "huge";
		slave.boobShape = "perky";
		slave.areolae = 4;
		slave.waist = 180;
		slave.butt = 3;
		slave.hips = 3;
		slave.clothes = "a string bikini";
		slave.inflation = 2;
		slave.inflationType = "milk";
		slave.inflationMethod = 1;
		SetBellySize(slave);
		return slave;
	},
	get mike() {
		const slave = GenerateNewSlave("XY");
		slave.dick = 7;
		slave.faceShape = "masculine";
		slave.boobs = 10;
		slave.hLength = 10;
		slave.hColor = "dark brown";
		slave.clothes = "sport shorts";
		return slave;
	},
	/**
	 * CAUTION: This actor causes game errors when used in episodes.
	 * Keep defined for backwards compatibility but DO NOT use in new episodes.
	 */
	get hostess() {
		const gender = (V.seeDicks === 100) ? "XY" : "XX";
		const slave = GenerateNewSlave(gender, {
			ageOverridesPedoMode: 1, disableDisability: 1, minAge: 25, maxAge: 35, race: "nonslave"
		});
		slave.devotion = 45;
		slave.trust = 55;
		slave.muscles = 60;
		slave.hLength = 40;
		slave.hColor = "brown";
		slave.hStyle = "luxurious";
		slave.clothes = "a halter top dress";
		slave.shoes = "heels";

		slave.behavioralFlaw = "arrogant";
		slave.markings = "none";
		if (slave.weight > 130) {
			slave.weight -= 100;
			slave.waist = random(-10, 50);
		}
		slave.health.condition = random(60, 80);
		return slave;
	},
	/**
	 * CAUTION: This actor causes game errors when used in episodes.
	 * Keep defined for backwards compatibility but DO NOT use in new episodes.
	 */
	get scientist() {
		const gender = (V.seeDicks === 0) ? "XY" : "XX";
		const slave = GenerateNewSlave(gender, {
			ageOverridesPedoMode: 1, disableDisability: 1, minAge: 25, maxAge: 35, race: "nonslave"
		});

		slave.devotion = 0;
		slave.trust = 0;
		slave.muscles = 60;
		slave.boobs = 100;
		slave.butt = 0;
		slave.hLength = 10;
		slave.hStyle = "messy";
		slave.eyewear = "glasses";
		slave.clothes = "conservative clothing";
		slave.shoes = "flats";

		slave.behavioralFlaw = "arrogant";
		slave.markings = "none";
		if (slave.weight > 130) {
			slave.weight -= 100;
			slave.waist = random(-10, 50);
		}
		slave.health.condition = random(60, 80);
		return slave;
	},
	/**
	 * CAUTION: This actor causes game errors when used in episodes.
	 * Keep defined for backwards compatibility but DO NOT use in new episodes.
	 */
	get nun() {
		const gender = (V.seeDicks === 100) ? "XY" : "XX";
		const slave = GenerateNewSlave(gender, {
			ageOverridesPedoMode: 1, disableDisability: 1, minAge: 25, maxAge: 35, race: "nonslave"
		});

		slave.devotion = jsRandom(45, 60);
		slave.trust = jsRandom(-10, 0);
		slave.muscles = 30;
		slave.hLength = 1;
		slave.hStyle = "buzzcut";
		slave.clothes = "a penitent nuns habit";

		slave.behavioralFlaw = "arrogant";
		slave.markings = "none";
		if (slave.weight > 130) {
			slave.weight -= 100;
			slave.waist = random(-10, 50);
		}
		slave.health.condition = random(60, 80);
		return slave;
	},
	get littleCloud() {
		const slave = baseSlave();
		slave.devotion = 0;
		slave.trust = 100;
		slave.weight = -20;
		slave.boobs = 300;
		slave.hips = 0;
		slave.butt = 1;
		slave.hLength = 50;
		slave.skin = "very fair";
		slave.hStyle = "braided";
		slave.hColor = "black";
		slave.eyebrowHColor = slave.hColor;
		slave.clothes = "shibari ropes";
		return slave;
	},
};
