App.Events.PCoupBetrayal = class PCoupBetrayal extends App.Events.BaseEvent {
	execute(node) {
		let r = [];
		const traitor = getTraitor();
		const traitorActor = traitor.actor;
		const {He, he} = getPronouns(traitorActor ? traitorActor : {pronoun: App.Data.Pronouns.Kind.neutral});

		V.nextButton = "Continue";
		V.daughtersVictory = 1;

		const weeks = traitor.weeks -1;
		const pregWeeks = traitor.weeks -1;
		traitor.weeks = 0;

		if (traitorActor === 0) { // never happens, needed for typing
			return node;
		}

		WombProgress(traitorActor, pregWeeks, pregWeeks); /* In all cases should be done */
		WombUpdatePregVars(traitorActor);
		if (WombBirthReady(traitorActor, traitorActor.pregData.normalBirth) > 0 ) { /* normal birth case, partial birthers not supported*/
			traitorActor.preg = -1;
			traitorActor.counter.birthsTotal += WombBirthReady(traitorActor, traitorActor.pregData.normalBirth);
			WombFlush(traitorActor);
		} else { /* still pregnant slave */
			traitorActor.preg = WombMaxPreg(traitorActor); /* most ready fetus is a base*/
			traitorActor.pregWeek = WombMaxPreg(traitorActor); /* most ready fetus is a base*/
		}
		SetBellySize(traitorActor); /* In any case it's useful to do.*/

		if (traitorActor.bald !== 1) {
			if (traitorActor.hLength < 150) {
				traitorActor.hLength += weeks;
			}
		}
		ageSlaveWeeks(traitorActor, weeks);

		r.push(`You are awakened in the middle of the night by a jolt that shakes the entire arcology, accompanied by a distant boom. It is followed by the wail of the arcology's alarm systems, and then finally by a faint crackle that grows to a constant chatter of gunfire. You rush to the video feeds to see what is going on. The Daughters of Liberty have not only succeeded in locking down your arcology with them outside of it, but have effectively cornered themselves against it. A PMC group has their retreat cut off and is steadily bleeding their numbers. It is a rather short, if not spectacular, battle.`);

		App.Events.addParagraph(node, r);
		r = [];

		r.push(`<span class="yellow">The Daughters of Liberty are utterly crushed.</span> ${V.arcologies[0].name} has been slightly damaged in the crossfire, but even as the last pockets of resistance are cleaned up, your citizens begin repairs themselves. The effect on your reputation is <span class="reputation inc">immensely positive,</span> since you won without lifting a finger and the arcology's prosperity, if anything, was benefited. However, the PMCs took the lion's share of the loot.`);

		cashX(-10000, "war");
		V.arcologies[0].prosperity = Math.trunc(V.arcologies[0].prosperity*0.9);
		repX(5000, "war");
		V.daughtersVictory = 3;
		addTrinket("a leftover banner bearing Daughters of Liberty insignia");

		App.Events.addParagraph(node, r);
		r = [];

		r.push(`When ${traitorActor.slaveName} finally manages to return to you, ${he} explains what happened. ${He} caught wind of the military contractors working in the area and succeeded in goading the Daughters of Liberty into attacking the supposed slaver troop. Once it became clear that the untrained ex-slaves and their saviors stood no chance against a coordinated force, they beat a hasty retreat for your arcology under the assumption that the codes you gave them would allow them a fortifiable position. But alas, they found nothing more than their demise.`);
		App.Events.addParagraph(node, r);
		restoreTraitor();
	}
};
