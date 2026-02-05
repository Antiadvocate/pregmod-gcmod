App.Events.recFSGenderFundamentalistLawBimbo = class recFSGenderFundamentalistLawBimbo extends App.Events.BaseEvent {
	eventPrerequisites() {
		return [
			() => V.FSAnnounced === 1,
			() => V.arcologies[0].FSGenderFundamentalistLawBimbo === 1,
			() => !(FutureSocieties.isActive("FSDegradationist")) // Even crazy parents have their limits.
		];
	}

	/* The high weight makes up for the fact that FSGenderFundamentalistLawBimbo makes the schools largely useless. */
	get weight() {
		return V.arcologies[0].FSGenderFundamentalist > random(1, 100) ? 5 : 0;
	}

	execute(node) {
		let r = [];

		/* The parents wouldn't offer the arcology owner an undesirable daughter as a sex slave, so we reroll until we get a decent one. Rerolling produces a more realistic distribution than censoring attributes at the min or max. */
		const params = {maxAge: 18, disableDisability: 1};
		let slave = GenerateNewSlave("XX", params);
		slave.face = random(-10, 80);
		slave.intelligence = Intelligence.random({limitIntelligence: [-50, 100]});
		if (!(slave.weight.isBetween(-95, 95))) {
			slave.weight = random(-95, 95);
		}
		if (slave.waist > 30) {
			slave.waist = random(-30, 0);
		}
		if (slave.intelligenceImplant > 15) {
			slave.intelligenceImplant = either(0, 0, 0, 15);
		}
		slave.origin = "$His gender fundamentalist parents believed that the proper role for a young woman is serving men and having babies rather than attending school.";
		setHealth(slave, random(0, 80), 0, Math.max(normalRandInt(0), 0), 0, random(5, 20));
		slave.devotion = random(-50, 50);
		slave.trust = Math.min(random(-50, 50), slave.devotion);
		slave.career = jsEither(["a cheerleader", "a cheerleader", "a cheerleader", "a girl scout", "a hospital volunteer", "a juvenile delinquent", "a juvenile delinquent", "a lemonade stand operator", "a student", "a student", "a student", "a student", "a student", "a student", "a student", "a student"]);

		/* The arcology isn't old enough for anyone to have been born there, but a citizen would learn the language, if she didn't know it already. */
		slave.accent = Math.min(slave.accent, jsEither([0, 0, 0, 0, 1, 1, 1, 2]));

		const {
			he, his, him, himself, daughter, girl
		} = getPronouns(slave);
		const contractCost = slaveCost(slave) * 0.8;
		r.push(`Your efforts to discourage women's education have succeeded to a greater extent than you'd ever imagined they might. Many citizens of ${V.arcologies[0].name} now consider selling a daughter into sexual slavery as a respectable choice that honors traditional gender values. Be ${he} a brothel whore, a club slut, or a highly regarded fucktoy, a good ${girl} is a ${girl} who makes proper use of ${his} feminine assets, preferably bearing children in the process.`);
		App.Events.addParagraph(node, r);
		r = [];
		r.push(`Therefore, you're not entirely surprised when a citizen family offers you the first chance to buy their ${daughter}--at a substantial discount to ${his} full value, no less, since the family believes you to be a moral, upstanding slaveowner who will ensure their little ${girl} serves men the way nature intended ${him} to.`);

		App.Events.addParagraph(node, r);

		node.append(App.Desc.longSlave(slave, {market: "generic"}));

		const choices = [];

		if (V.cash >= contractCost) {
			choices.push(new App.Events.Result(`Enslave ${him}`, enslave, `This will cost ${cashFormat(contractCost)}`));
		} else {
			choices.push(new App.Events.Result(null, null, `You lack the necessary funds to enslave ${him}.`));
		}
		App.Events.addResponses(node, choices);

		function enslave() {
			const frag = new DocumentFragment();
			r = [];
			r.push(`Coached by ${his} family, the new slave knows exactly how to present ${himself} to you, and does so with little hesitation, as the beaming family looks on. This, after all, is what ${girl}s are meant to do.`);

			r.push(App.UI.newSlaveIntro(slave));
			App.Events.addParagraph(frag, r);
			return frag;
		}
	}
};
