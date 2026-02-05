App.Events.PCoupCollaborationChoice = class PCoupCollaborationChoice extends App.Events.BaseEvent {
	eventPrerequisites() {
		return [
			() => getTraitor().actor !== 0
		];
	}

	execute(node) {
		let r = [];
		const traitor = getTraitor();
		const traitorActor = traitor.actor;
		if (traitorActor === 0) { // for typing
			return node;
		}
		const {
			He,
			his, he, him, himself
		} = getPronouns(traitorActor);

		const {say: say, title: Master} = getEnunciation(traitorActor);

		V.nextButton = "Continue";

		r.push(`Your next communication from the Daughters of Liberty is a request for a live video call. You accept and are surprised to be confronted by ${traitorActor.slaveName}'s`);
		if (traitor.type === "horror") {
			r.push(`terrified face.`);
		} else if (traitor.type === "broken") {
			r.push(`coherent face; it would seem ${his} mind has come back to ${him}.`);
		} else {
			r.push(`face.`);
		}
		r.push(`${He} looks very different, without visible modifications of any kind and dressed in utilitarian clothes, but it's ${him}.`);

		App.Events.addParagraph(node, r);
		r = [];

		if (traitor.type === "agent") {
			if (traitorActor.intelligence + traitorActor.intelligenceImplant >= 100) {
				if (canTalk(traitorActor)) {
					r.push(
						Spoken(traitorActor, `"Hello, ${Master},"`),
						`${he} ${say}s simply.`,
						Spoken(traitorActor, `"It's happening soon. The Daughters have asked me to call you to ask you for your cooperation. All they want are the access codes to your security systems and they trust me to get them. You still trust me, right? I promise giving me codes to give them is the right choice."`),
						`${He} stares at the camera, trying ${his} best to convey the deeper meaning to ${his} request.`,
						Spoken(traitorActor, `"It may be rough, but I promise we'll make it through it."`)
					);
				} else {
					r.push(`${He} gestures that the Daughters are coming and that ${he} was entrusted with earning your cooperation. ${He} explains that they want ${him} to get your security codes for them, and fully expect that ${he}'ll succeed. ${He} vows that you won't be making a mistake by giving ${him} codes and that you'll be reunited when it is all over.`);
				}
				traitor.type = "trapper";
			} else if (traitorActor.intelligence + traitorActor.intelligenceImplant < 0) {
				if (canTalk(traitorActor)) {
					r.push(
						Spoken(traitorActor, `"${Master},"`),
						`${he} ${say}s with panic in ${his} voice,`,
						Spoken(traitorActor, `"They are coming for you. They want your access codes so they can get to you easier, but now you know not to trust them!"`),
						`${He} manages to shout as ${he} is dragged offscreen,`,
						Spoken(traitorActor, `"Don't let them get you ${Master}! Show them who's boss!"`)
					);
				} else {
					r.push(`${He} hastily gestures that they are coming for you and that nothing you can do will deter them. ${He} barely signs off a plea for you to prepare your defenses before being dragged offscreen.`);
				}
				traitor.type = "hostage";
			} else if (traitorActor.intelligence + traitorActor.intelligenceImplant < -50) {
				if (canTalk(traitorActor)) {
					r.push(
						Spoken(traitorActor, `"Hello, ${Master},"`),
						`${he} ${say}s simply.`,
						Spoken(traitorActor, `"It's happening soon. The Daughters have asked me to call you to ask you for your help. All they need is the access codes to your security systems. They'll let you live, ${Master}, they'll even let you take your money. But the arcology and the slaves, those will have to go free."`),
						`${He} hesitates a little.`,
						Spoken(traitorActor, `"${Master}, I like being free. But I don't want to see you killed. Please, please agree."`)
					);
				} else {
					r.push(`${He} gestures that the Daughters are coming and that ${he} was asked if you would lend your assistance. ${He} explains, that in return for the security codes, you'll be allowed to live and escape with your wealth, but at the loss of your slaves and arcology. ${He} hesitates a little, before imploring you to save yourself.`);
				}
				traitor.type = "standard";
			} else {
				if (canTalk(traitorActor)) {
					r.push(
						Spoken(traitorActor, `"Hello, ${Master},"`),
						`${he} ${say}s simply.`,
						Spoken(traitorActor, `"It's happening soon. The Daughters have asked me to call you to ask you for your help. All they need is the access codes to your security systems. They'll let you live, ${Master}, they'll even let you take your money. But the arcology and the slaves, those will have to go free. You do not want to be around when they clean up the slave owners."`),
						`${He} hesitates a little, unsure of who may be listening.`,
						Spoken(traitorActor, `"${Master}, I don't want to see you killed. Please, please think about who you are dealing with."`),
						`${He} stares into the camera, imploring you to make the right choice.`
					);
				} else {
					r.push(`${He} gestures that the Daughters are coming and that ${he} was asked if you would lend your assistance. ${He} explains, that in return for the security codes, you'll be allowed to live and escape with your wealth, but at the loss of your slaves and arcology. ${He} stares into the camera, imploring you not to trust ${his} words.`);
				}
			}
		} else if (traitor.type === "horror") {
			if (canTalk(traitorActor)) {
				r.push(
					Spoken(traitorActor, `"${Master},"`),
					`${he} struggles to ${say},`,
					Spoken(traitorActor, `"The Daughters have asked me to call you to ask you for your help."`),
					`${He} takes a deep breath and composes ${himself}.`,
					Spoken(traitorActor, `"They need the access codes to your security systems."`),
					`${He} flinches upon making such a request.`,
					Spoken(traitorActor, `"They'll let you live, ${Master}, they'll even let you take your money. But the arcology and the slaves, those will have to go free."`),
					`${He} hesitates a little.`,
					Spoken(traitorActor, `"${Master}, I like being free. But I don't want anything more to do with you. Please, please agree."`)
				);
			} else {
				r.push(`${He} shakily gestures that the Daughters are coming and that ${he} was asked if you would lend your assistance. ${He} explains, that in return for the security codes, you'll be allowed to live and escape with your wealth, but at the loss of your slaves and arcology. ${He} hesitates a little, before asking you to take the deal so you never have to see each other again.`);
			}
		} else if (traitor.type === "defiant") {
			if (canTalk(traitorActor)) {
				r.push(
					Spoken(traitorActor, `"Hello, ${Master},"`),
					`${he} ${say}s simply.`,
					Spoken(traitorActor, `"It's happening soon. The Daughters have asked me to call you to ask you for your help. All they need is the access codes to your security systems. You'll get to live, ${Master}, and you'll even get to keep your money. But the arcology and the slaves will be handed over."`),
					`${He} hesitates a little.`,
					Spoken(traitorActor, `"${Master}, I like being free. But I don't want to see you killed by them. Please, please agree."`)
				);
			} else {
				r.push(`${He} gestures that the Daughters will be coming soon and that ${he} was asked if you would comply with their demands. ${He} explains, that in return for the security codes, you'll be allowed to live and escape with your wealth. ${He} emphasizes that they will kill you otherwise.`);
			}
		} else {
			if (canTalk(traitorActor)) {
				r.push(
					Spoken(traitorActor, `"Hello, ${Master},"`),
					`${he} ${say}s simply.`,
					Spoken(traitorActor, `"It's happening soon. The Daughters have asked me to call you to ask you for your help. All they need is the access codes to your security systems. They'll let you live, ${Master}, they'll even let you take your money. But the arcology and the slaves, those will have to go free."`),
					`${He} hesitates a little.`,
					Spoken(traitorActor, `"${Master}, I like being free. But I don't want to see you killed. Please, please agree."`)
				);
			} else {
				r.push(`${He} gestures that the Daughters are coming and that ${he} was asked if you would lend your assistance. ${He} explains, that in return for the security codes, you'll be allowed to live and escape with your wealth, but at the loss of your slaves and arcology. ${He} hesitates a little, before imploring you to save yourself.`);
			}
		}

		App.Events.addParagraph(node, r);

		App.Events.addResponses(node, [
			new App.Events.Result(`Transmit the codes`, transmit),
			new App.Events.Result(`Refuse`, refuse)
		]);

		function transmit() {
			const frag = new DocumentFragment();
			let r = [];
			if (traitorActor === 0) { // for typing. Why the fuck do I have to do this for a nested function.
				return node;
			}
			r.push(`You transmit the access codes to your security systems.`);
			if (traitor.type === "agent") {
				r.push(`${traitorActor.slaveName} silently frowns as tears start to well in ${his} eyes.`);
			} else if (traitor.type === "trapper") {
				r.push(`${traitorActor.slaveName} smiles and thanks you. "I won't disappoint you."`);
			} else if (traitor.type === "hostage") {
				r.push(`If this will lessen what will happen to ${traitorActor.slaveName}, you don't know.`);
			} else if (traitor.type === "horror") {
				r.push(`${traitorActor.slaveName} meekly thanks you and hurries offscreen.`);
			} else if (traitor.type === "defiant") {
				r.push(`${traitorActor.slaveName} smiles and thanks you. "I hope you survive the attack, ${PoliteRudeTitle(traitorActor)}."`);
			} else {
				r.push(`${traitorActor.slaveName} smiles and thanks you. "You made the right decision, ${Master}. I love you."`);
			}
			V.collaboration = 1;

			App.Events.addParagraph(frag, r);
			return frag;
		}

		function refuse() {
			return `You close the video call without a word. From your desk, you have access to thousands of video feeds from all across the arcology; they show men and women working, sleeping, eating, chatting, fucking. You wonder how many of them have plans, and what those plans are.`;
		}
	}
};
