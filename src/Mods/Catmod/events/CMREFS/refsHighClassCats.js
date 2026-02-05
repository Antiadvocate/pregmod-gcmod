App.Events.refsHighClassCats = class refsHighClassCats extends App.Events.BaseEvent {
	eventPrerequisites() {
		return [
			() => V.projectN.public === 1,
			() => !!V.seeCats, // TODO: was not hooked up in TW, what else should gate be? Project N something?
		];
	}

	execute(node) {
		const slave = GenerateNewSlave("XX", {minAge: 16, maxAge: 24, race: "catgirl"});
		slave.origin = "You purchased $him from a high class boutique that meticulously cultivate their cats to the highest pedigrees.";
		slave.tailShape = "cat";
		slave.tailColor = slave.hColor;
		slave.collar = "silk ribbon";
		slave.clothes = "body oil";
		setHealth(slave, jsRandom(60, 100), 0, 0, 0, 0);
		slave.devotion = 100;
		slave.trust = 100;
		slave.face = 100;
		slave.muscles = 50;
		slave.skill.entertainment = 100;
		slave.skill.combat = 60;
		slave.intelligence = random(60, 100);
		App.Events.drawEventArt(node, slave);

		App.Events.addParagraph(node, [`As the technologies of Project N got spread around, some of the more well to-do merchants have gone out of their way to create custom-bred catgirls for those clientele with exacting tastes.`]);

		App.Events.addParagraph(node, [`One such stall has appeared in your arcology's market, and you can't help but to go in due to the preening catgirls on display, doing their best to look seductive to any possible buyers. Then again, it probably helped that their fur had been lovingly oiled.`]);

		App.Events.addParagraph(node, [`Attracted by the sight, you decide to enter to see how this particular merchant has engineered their cats. The catgirls in store immediately began to turn their attention towards you, doing their best to preen and pose seductively. From the corner of your eye, you can see the owner of these cats exit from backroom, where you can make out several incubator tubes filled with catgirls...and other things. The merchant in question is a curvaceous woman with cat-like features herself. Whether that was on purpose or happy concidence was up for debate.`]);

		App.Events.addParagraph(node, [`"Welcome to my menagerie, valued customer. As you can see, I have a variety of comely catgirls trained and ready to serve your every need. It may cost a pretty penny, but every credit you give me, means I can create more of these darlings." To emphasize her point, she gropes one of the catgirls who release a seductive meowing noise."`]);

		const cash = 200000;
		const choices = [];
		if (V.cash >= cash) {
			choices.push(new App.Events.Result(`Buy a catgirl`, buy, `Will cost ${cashFormat(cash)}`));
		}
		choices.push(new App.Events.Result(`Decline to purchase a catgirl`, refuse));
		App.Events.addResponses(node, choices);

		function buy() {
			cashX(-cash, "slaveTransfer", slave);
			return [
				`One of the catgirls sprawling about catches your eye and you decide to purchase her right there and then. Pleased with your desicision, the merchant proceeds to present you the catgirl's breeding papers to prove her quality. As you leave with your newly purchased kitten, she proceeds to seductively lick your ear while groping you. "I can't wait to play, meowster."`,
				App.UI.newSlaveIntro(slave)
			];
		}

		function refuse() {
			return `You politely reject the merchant, who appears to take the rejection with stride. ALthough, the catgirls can't help but be a little saddened. "Awww." "But I want cuddles." "Are you sure you don't want some nice titty kitties?" Leaving the stall, you wonder if you made a mistake..`;
		}
	}
};
