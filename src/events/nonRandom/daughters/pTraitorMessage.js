App.Events.PTraitorMessage = class PTraitorMessage extends App.Events.BaseEvent {
	eventPrerequisites() {
		return [
			() => getTraitor().actor !== 0
		];
	}

	execute(node) {
		let r = [];
		const traitor = getTraitor();
		const traitorActor = traitor.actor;
		const {
			He,
			he, him
		} = getPronouns(traitorActor ? traitorActor : {pronoun: App.Data.Pronouns.Kind.neutral});

		V.nextButton = "Continue";
		const weeks = traitor.weeks -1;
		const pregWeeks = traitor.weeks -1;
		traitor.weeks = 1;
		if (traitorActor === 0) { // never happens, just for typing
			return node;
		}

		/* ------------------ pregnancy setup start here----------------- */
		const wasPreg = (traitorActor.preg > 0) ? 1 : 0;

		WombProgress(traitorActor, pregWeeks, pregWeeks); /* In all cases should be done */
		WombUpdatePregVars(traitorActor);
		if (traitorActor.broodmother > 0) { /* Broodmother implant is assumed as removed.*/
			traitorActor.preg = -1;
			traitorActor.counter.birthsTotal += WombBirthReady(traitorActor, 37);
			traitorActor.broodmother = 0;
			traitorActor.broodmotherFetuses = 0;
			WombFlush(traitorActor);
		} else if (WombBirthReady(traitorActor, traitorActor.pregData.normalBirth) > 0 ) { /* normal birth case, partial birthers not supported*/
			traitorActor.preg = -1;
			traitorActor.counter.birthsTotal += WombBirthReady(traitorActor, traitorActor.pregData.normalBirth);
			WombFlush(traitorActor);
		} else { /* still pregnant slave */
			traitorActor.preg = WombMaxPreg(traitorActor); /* most ready fetus is a base*/
			traitorActor.pregWeek = WombMaxPreg(traitorActor); /* most ready fetus is a base*/
		}
		SetBellySize(traitorActor); /* In any case it's useful to do.*/

		const isPreg = (traitorActor.preg > 0) ? 1 : 0;

		/* ------------------ pregnancy setup end here-----------------
			r.push(`As no broodmother cases in code below, it's no need to setup every case of impregnation through new system. Backup mechanic will do it for normal pregnancies.`);
		*/
		
		if (traitorActor.fuckdoll !== 0) {
			traitorActor.fuckdoll = 0;
		}
		if (traitorActor.fetish === Fetish.MINDBROKEN) {
			traitorActor.fetish = "none";
			traitorActor.fetishStrength = 0;
		}
		if (traitorActor.hStyle === "shaved") {
			traitorActor.hStyle = "strip";
		}
		if (traitorActor.bald !== 1) {
			if (traitorActor.hLength < 150) {
				traitorActor.hLength += weeks;
			}
		}
		ageSlaveWeeks(traitorActor, weeks);

		r.push(`The month after freeing ${traitorActor.slaveName}, you receive another message from the Daughters of Liberty. This one contains a video. It shows ${traitorActor.slaveName} sitting quietly at a table${(wasPreg !== isPreg) ? ", no longer clearly pregnant" : ""}, wearing comfortable clothes and eating a nice meal.`);
		if (traitor.type === "agent") {
			if (traitorActor.intelligence+traitorActor.intelligenceImplant < -50) {
				r.push(`${He} looks a little bewildered, but there's an obvious happiness to ${him}; ${he} may be falling in with their teachings. ${He} seems unaware ${he}'s being recorded.`);
			} else if (wasPreg !== isPreg) {
				r.push(`${He} looks a little depressed, likely due to giving birth away from home, but ${he} is still playing the part of a traitor impeccably. ${He} seems aware ${he}'s being recorded and, for the briefest moment, makes eye contact with the camera.`);
			} else {
				r.push(`${He}'s playing the part of a traitor impeccably, feigning happiness despite yearning to be at your side. ${He} seems aware ${he}'s being recorded and, for the briefest moment, makes eye contact with the camera.`);
			}
		} else if (traitor.type === "defiant") {
			r.push(`${He} looks elated to be free, it's impossible to deny. ${He} seems unaware ${he}'s being recorded.`);
		} else if (traitor.type === "broken") {
			r.push(`${He} looks completely indifferent to the situation. ${He} likely is unaware that ${he} is no longer in the penthouse.`);
		} else {
			r.push(`${He} looks a little bewildered, but there's an obvious happiness to ${him}, it's impossible to deny. ${He} seems unaware ${he}'s being recorded.`);
		}

		App.Events.addParagraph(node, r);
		r = [];

		r.push(`A voice cuts in, calm but filled with unmistakable rage: "I hope you don't think this fixes everything, scum. We're still coming for you, and for all your slaveowning friends. All you've bought with this is the chance to maybe come out alive at the end. We'll be in touch."`);
		App.Events.addParagraph(node, r);
	}
};
