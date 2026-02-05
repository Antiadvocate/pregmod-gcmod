App.Events.PCoupCollaboration = class PCoupCollaboration extends App.Events.BaseEvent {
	eventPrerequisites() {
		return [
			() => V.collaboration === 1,
			() => getTraitor().type !== "trapper"
		];
	}

	execute(node) {
		let r = [];
		const traitor = getTraitor();
		const traitorActor = traitor.actor;
		const {
			His, He,
			his, he, him
		} = getPronouns(traitorActor ? traitorActor : {pronoun: App.Data.Pronouns.Kind.neutral});

		if (traitorActor !== 0) {
			const pregWeeks = traitor.weeks;
			traitor.weeks = 0;

			WombProgress(traitorActor, pregWeeks, pregWeeks); /* In all cases should be done */
			WombUpdatePregVars(traitorActor);
			if (WombBirthReady(traitorActor, traitorActor.pregData.normalBirth) > 0) { /* normal birth case, partial birthers not supported*/
				traitorActor.preg = -1;
				traitorActor.counter.birthsTotal += WombBirthReady(traitorActor, traitorActor.pregData.normalBirth);
				WombFlush(traitorActor);
			} else { /* still pregnant slave */
				traitorActor.preg = WombMaxPreg(traitorActor); /* most ready fetus is a base*/
				traitorActor.pregWeek = WombMaxPreg(traitorActor); /* most ready fetus is a base*/
			}
			SetBellySize(traitorActor); /* In any case it's useful to do.*/
		}

		r.push(`You are awakened in the middle of the night by an odd darkness. All the normal lights of your healthy arcology are out. Main power has gone out, and you claw your way in the darkness to the video feeds, running on emergency backup.`);

		App.Events.addParagraph(node, r);
		r = [];

		r.push(`Armed rebels are running unchecked down the corridors.`);
		if (V.mercenaries > 0) {
			r.push(`Your mercenaries' quarters is locked down, but from the interior feeds you can see a few of them lying in their beds or slumped in chairs as gas is pumped through the ventilation systems.`);
		}
		r.push(`The security drones are actively assisting the rebels.`);
		if (traitorActor !== 0) {
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
			if (traitor.type === "agent") {
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
				r.push(`encouraging ${his} fellow fighter${(canTalk(traitorActor)) ? " with yells" : ""}, and when that fails, leading them by example${(traitorActor.bellyPreg >= 15000) ? ` as best ${he} can` : ""}.`);
			}
		}
		r.push(`In areas already controlled by the Daughters, slaveowners are being summarily shot in the streets. "${properTitle()}," ${V.assistant.name} says, "the Daughters of Liberty are in complete control of all arcology systems. Remain here."`);

		App.Events.addParagraph(node, r);
		r = [];

		r.push(`After half an hour of watching the executions,`);
		if (traitorActor !== 0) {
			const {
				say: say
			} = getEnunciation(traitorActor);
			if (traitor.type === "agent") {
				r.push(traitorActor.slaveName);
				if (traitorActor.bellyPreg >= 10000) {
					r.push(`waddles`);
				} else {
					r.push(`steps`);
				}
				r.push(`slowly into your office, dreading what is to come. You greet ${him} by name and ${he} breaks down in tears. As ${he} takes a shot at the nearest Daughter, they open fire on the both of you. Your cause of death is that of many an oppressor — an aneurysm of the cerebellum, in 9mm Parabellum.`);
			} else if (traitor.type === "horror") {
				r.push(traitorActor.slaveName);
				if (traitorActor.bellyPreg >= 10000) {
					r.push(`waddles`);
				} else {
					r.push(`steps`);
				}
				r.push(`gingerly into your office, not happy to be here once more. You greet ${him} by name, in response to which ${he} cowers in fear${(hasAnyArms(traitorActor)) ? ` and drops ${his} weapon` : ""}. Not interested in giving you an opportunity, ${his} comrade takes the shot. Your cause of death is that of many an oppressor — an aneurysm of the cerebellum, in 9mm Parabellum.`);
			} else if (traitor.type === "defiant") {
				r.push(traitorActor.slaveName);
				if (traitorActor.bellyPreg >= 10000) {
					r.push(`waddles`);
				} else {
					r.push(`strides`);
				}
				r.push(`confidently into your office. You greet ${him} by name, in response to which ${he}`);
				if (hasAnyArms(traitorActor)) {
					r.push(`deals`);
				} else {
					r.push(`orders one of ${his} comrades to give`);
				}
				r.push(`you a vicious open-handed slap that knocks you out of your chair.`);
				if (!canTalk(traitorActor)) {
					r.push(`${His} last words to you are nothing more than a rude gesture.`);
				} else if (traitorActor.slaveName !== traitorActor.birthName) {
					r.push(
						Spoken(traitorActor, `"My name,"`),
						`${he} ${say}s,`,
						Spoken(traitorActor, `"is ${traitorActor.birthName}. I'm going to enjoy this after what you did to me."`)
					);
				} else {
					r.push(
						Spoken(traitorActor, `"You stupid fuck,"`),
						`${he} ${say}s.`,
						Spoken(traitorActor, `"I'm going to enjoy this after what you did to me."`)
					);
				}
				r.push(`Your cause of death is that of many an oppressor — an aneurysm of the cerebellum, in 9mm Parabellum.`);
			} else {
				r.push(traitorActor.slaveName);
				if (traitorActor.bellyPreg >= 10000) {
					r.push(`waddles`);
				} else {
					r.push(`strides`);
				}
				r.push(`confidently into your office. You greet ${him} by name, in response to which ${he}`);
				if (hasAnyArms(traitorActor)) {
					r.push(`deals`);
				} else {
					r.push(`orders one of ${his} comrades to give`);
				}
				r.push(`you a vicious open-handed slap that knocks you out of your chair.`);
				if (!canTalk(traitorActor)) {
					r.push(`${He} wastes no time trying to speak to the likes of you.`);
				} else if (traitorActor.slaveName !== traitorActor.birthName) {
					r.push(
						Spoken(traitorActor, `"My name,"`),
						`${he} ${say}s,`,
						Spoken(traitorActor, `"is ${traitorActor.birthName}."`)
					);
				} else {
					r.push(
						Spoken(traitorActor, `"You stupid fuck,"`),
						`${he} ${say}s.`
					);
				}
				r.push(`Your cause of death is that of many an oppressor — an aneurysm of the cerebellum, in 9mm Parabellum.`);
			}
		} else {
			r.push(`the leader of the assault strides confidently into your office, deals you a vicious open-handed slap that knocks you out of your chair, and holds a pistol to your forehead. Your cause of death is that of many an oppressor — an aneurysm of the cerebellum, in 9mm Parabellum.`);
		}

		App.Events.addParagraph(node, r);
		App.UI.DOM.appendNewElement("p", node, "GAME OVER", "bold");
		V.ui = "start";
	}
};
