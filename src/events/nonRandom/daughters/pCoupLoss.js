// cSpell:ignore zzzt

App.Events.PCoupLoss = class PCoupLoss extends App.Events.BaseEvent {
	execute(node) {
		let r = [];

		const traitor = getTraitor();
		const traitorActor = traitor.actor;

		if (traitorActor !== 0) {
			const pregWeeks = traitor.weeks;
			traitor.weeks = 0;

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
		}

		r.push(`You are awakened in the middle of the night by a jolt that shakes the entire arcology, accompanied by a distant boom. It is followed by another, and another, and then the wail of the arcology's alarm systems, and then finally by a faint crackle that grows to a constant chatter of gunfire. Main power goes out, and you claw your way in the darkness to the video feeds, running on emergency backup.`);

		App.Events.addParagraph(node, r);
		r = [];

		if (V.mercenaries > 0) {
			r.push(`Sheets of flame are pouring from your mercenaries' quarters; it seems they were among the first targets for bombs.`);
		}
		r.push(`Heavy gunfire is bringing down security drones by the scores. The attackers seem to have figured out where the drone hangars are, and are laying down fire on the exits the drones must use to get into action.`);
		if (traitorActor !== 0 && traitor.type !== "hostage") {
			const {
				his, he,
			} = getPronouns(traitorActor ? traitorActor : {pronoun: App.Data.Pronouns.Kind.neutral});
			r.push(`You can see`);
			if (traitorActor.bellyPreg >= 100000) {
				r.push(`the staggeringly pregnant`);
			} else if (traitorActor.bellyPreg >= 15000) {
				r.push(`the heavily pregnant`);
			} else if (traitorActor.bellyPreg >= 10000) {
				r.push(`the very pregnant`);
			} else if (traitorActor.bellyPreg >= 5000) {
				r.push(`the pregnant`);
			}
			r.push(`${traitorActor.slaveName} on one of the feeds,`);
			if (traitor.type === "agent" || traitor.type === "trapper") {
				r.push(`trying to sabotage a stockpile of explosives.`);
			} else if (traitor.type === "horror") {
				r.push(`encouraging ${his} fellow fighters`);
				if (canTalk(traitorActor)) {
					r.push(`with yells`);
				}
				r.push(`from the back lines.`);
			} else if (traitor.type === "defiant") {
				r.push(`encouraging ${his} fellow fighters`);
				if (canTalk(traitorActor)) {
					r.push(`with yells`);
				}
				r.push(`and spearheading the charge${(traitorActor.bellyPreg >= 15000) ? ` as best ${he} can` : ""}.`);
			} else {
				r.push(`encouraging ${his} fellow fighters${(canTalk(traitorActor)) ? " with yells" : ""}, and when that fails, leading them by example${(traitorActor.bellyPreg >= 15000) ? ` as best ${he} can` : ""}.`);
			}
		}
		r.push(`In areas already controlled by your enemies, slaveowners are being summarily shot in the streets.`);
		if (V.hackerSupport === 1) {
			r.push(`"${properTitle()}," ${V.assistant.name} says, "the Daughters of Liberty are attempting a coup. They appear to have smuggled a significant quantity of arms and explosives into the arcology.`);
		} else {
			r.push(`"${properTitle()}," ${V.assistant.name} says, "the Daughters of Liberty are attempting a coup. They appear to have smuggled a significant qua — zzzt —" There is nothing more from the computer systems.`);
		}

		App.Events.addParagraph(node, r);
		r = [];

		if (traitorActor !== 0) {
			r.push(`If this were a movie,`);
			if (traitor.type === "agent" || traitor.type === "hostage" || traitor.type === "trapper") {
				r.push(`you'd bleed out in the arms of the sobbing ${traitorActor.slaveName}`);
			} else {
				r.push(`${traitorActor.slaveName} would be the one to kill you`);
			}
			r.push(`after a desperate struggle in your office. Reality does not have such a refined sense of drama.`);
		}
		r.push(`If the Daughters had any plans to take you alive, they are lost to the exigencies of combat. Your penthouse remains locked down, forcing them to use breaching charges to make an entrance. These prove entirely too effective, and your last impression is of the floor heaving bodily up toward the ceiling.`);

		App.Events.addParagraph(node, r);
		App.UI.DOM.appendNewElement("p", node, "GAME OVER", "bold");
		V.ui = "start";
	}
};
