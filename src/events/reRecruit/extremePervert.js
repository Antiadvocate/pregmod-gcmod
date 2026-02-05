App.Events.recExtremePervert = class recExtremePervert extends App.Events.BaseEvent {
	constructor(actors, params) {
		super(actors, params);
	}

	eventPrerequisites() {
		return [
			() => V.rep > 500
		];
	}

	get eventName() {
		return "Extreme Pervert";
	}

	execute(node) {
		const slave = makeSlave();
		const {He, he, his, him, himself, woman} = getPronouns(slave);
		const {himselfA} = getPronouns(assistant.pronouns().main).appendSuffix("A");
		let r = [];

		r.push(`${capFirstChar(V.assistant.name)} alerts you that a supplicant has arrived at the door to the penthouse. A constant stream of hopefuls appear at your door, and ${V.assistant.name} makes ${himselfA} invaluable by filtering them. One of the few categories of applicant that is always admitted is people willing to be enslaved for some reason; the odd individual standing before you is just such a ${woman}.`);
		App.Events.addParagraph(node, r);
		r = [];
		r.push(Spoken(slave, `"Fuck! You're even sexier in person and you smell like sex too,"`));
		r.push(`${he} says between heavy breaths. With a well-trained eye, you recognize that this crazy bitch has multiple vibrators shoved not only into ${his} bottom, but also ${his} breasts. Sensing your gaze, ${he} rips off ${his} top and expose ${his} fuckable nipples. ${He} hurriedly explain that ${he} has amassed a massive debt in order to turn themselves into sex incarnate. Now, all ${he} need to finish this journey, is someone who could match ${his} freak and give ${him} an endless string of partners to fuck. In other words, you.`);
		App.Events.addParagraph(node, r);
		r = [];
		r.push(`${He} begins jerking ${himself} after finishing ${his} pitch. ${He}'s more than likely to fit in. Hell, ${he}'d probably sign ${himself} up to the arcade if you left ${him} alone.`);

		App.Events.addParagraph(node, r);

		node.append(App.Desc.longSlave(slave, {market: "generic"}));

		const contractCost = 1000;
		const responses = [];
		if (V.cash >= contractCost) {
			responses.push(new App.Events.Result(`Enslave ${him}`, enslave));
		} else {
			responses.push(new App.Events.Result(null, null, `You lack the necessary funds to enslave ${him}`));
		}
		App.Events.addResponses(node, responses);

		// eslint-disable-next-line jsdoc/require-jsdoc
		function enslave() {
			const el = new DocumentFragment();
			let r = [];
			cashX(forceNeg(contractCost), "slaveTransfer", slave);
			r.push(`${He} continues to masturbate furiously as the biometric scanners scrupulously record ${his} very being as a piece of human property. ${He} seems a little disappointed that ${he} won't be immediately allowed to fuck, but nonetheless places ${his} biometric signature before requesting that someone rails both of ${his} holes as ${he} buries ${himself} balls deep into someone else.`);
			r.push(App.UI.newSlaveIntro(slave));
			App.Events.addNode(el, r);
			return el;
		}

		// eslint-disable-next-line jsdoc/require-jsdoc
		function makeSlave() {
			const slave = GenerateNewSlave(null, {
				minAge: 18, maxAge: 42, disableDisability: 1, race: "nonslave"
			});
			generateSalonModifications(slave);
			slave.origin = `$He offered $himself to you for enslavement out of desperation to curb $his endless libido.`;
			slave.boobs = random(4, 6) * 3000;
			slave.natural.boobs = slave.boobs;
			slave.nipples = "fuckable";
			slave.weight = -20;
			slave.natural.height = random(160, 200);
			slave.height = Height.forAge(slave.natural.height, slave);
			slave.face = random(15, 100);
			slave.butt = random(5, 10);
			slave.lips = 0;
			slave.devotion = random(65, 100);
			slave.trust = random(65, 100);
			slave.career = "a whore";
			setHealth(slave, jsRandom(-60, -50), undefined, undefined, undefined, 0);
			slave.intelligence = random(16, 50);
			slave.skill.entertainment = 40;
			slave.anus = 2;
			slave.vagina = 2;
			slave.dick = 3;
			slave.balls = 1;
			slave.ovaries = 1;
			slave.skill.vaginal = 100;
			slave.skill.oral = 100;
			slave.skill.anal = 100;
			slave.skill.whoring = 100;
			slave.intelligenceImplant = 0;
			slave.behavioralFlaw = "odd";
			slave.fetish = "humiliation";
			slave.energy = 100;
			slave.attrXX = 100;
			slave.attrXY = 100;
			return slave;
		}
	}
};
