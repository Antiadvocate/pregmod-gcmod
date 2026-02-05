App.Events.REReputedDaughter = class REReputedDaughter extends App.Events.BaseEvent {
	eventPrerequisites() {
		return [
			() => !onBedRest(V.PC),
		];
	}

	actorPrerequisites() {
		return [
			[
				(s) => s.skill.penetrative > 60 || s.fetish === Fetish.MINDBROKEN,
				(s) => s.dick > 3,
				(s) => s.actualAge > V.fertilityAge, // the slave is older than the addict daughter
				(s) => s.visualAge > V.minimumSlaveAge,
				(s) => s.prestige > 0 || s.porn.prestige > 0 || slaveCost(s) > 20000 || Beauty(s) > 150, // the slave must be worth a minimum or be very attractive
				(s) => isFullyPotent(s) ? V.week - s.weekAcquired > 12 : V.week - s.weekAcquired > 8, // if the slave is potent must have been able to impregnate the daughter to the point of showing
				canWalk,
				canPenetrate,
				(s) => [Job.BROTHEL, Job.CLUB, Job.WHORE, Job.PUBLIC].includes(s.assignment),
			]
		];
	}

	execute(node) {
		const PC = V.PC;
		const [slave] = this.actors.map(a => getSlave(a));
		const {His, He, he, his, him, himself} = getPronouns(slave);
		const {HeF, heF, hisF, himF, womanF, fatherF} = getNonlocalPronouns(PC.title === 0 && FutureSocieties.isActive("FSGenderRadicalist") ? 0 : 100).appendSuffix('F');
		const newAge = Math.max(V.minimumSlaveAge, V.fertilityAge - (V.precociousPuberty ? V.pubertyHormones ? 3 : 1 : 0));
		const rDaughter = GenerateNewSlave("XX", {
			minAge: newAge, maxAge: newAge, race: "nonslave", disableDisability: 1
		});
		const {HisD, HeD, heD, hisD, himD, girlD, daughterD} = getPronouns(rDaughter).appendSuffix('D');
		const kid = rDaughter.actualAge > 12 ? rDaughter.actualAge < 18 ? "teenager" : "young "+ girlD : "kid";
		const child = rDaughter.actualAge > 12 ? girlD : "child";
		const VIP = FutureSocieties.isActive("FSRestart") ? V.arcologies[0].FSNeoImperialistLaw2 === 1 ? "Baron" : "member of the Social Elite" : "slaveowner";
		const VIPs = FutureSocieties.isActive("FSRestart") ? V.arcologies[0].FSNeoImperialistLaw2 === 1 ? "Barons" : "members of the Social Elite" : "slaveowners";

		rDaughter.anus = slave.dick > 5 ? 3 : 2;
		rDaughter.analArea = either(1, 1, 2);
		rDaughter.vagina = slave.dick > 5 ? 4 : 3;
		rDaughter.vaginaLube = either(1, 2);
		rDaughter.pubertyXX = 1;
		rDaughter.preg = 0;
		rDaughter.attrXY = 100;
		rDaughter.energy = 100;
		rDaughter.addict = 12;
		rDaughter.canRecruit = 0;
		const attitude = random(0, 20);
		rDaughter.devotion = -40 - attitude;
		rDaughter.trust = 60 - attitude;
		rDaughter.fetish = Fetish.PREGNANCY;
		rDaughter.behavioralFlaw = either(BehavioralFlaw.ARROGANT, BehavioralFlaw.ARROGANT, BehavioralFlaw.BITCHY, BehavioralFlaw.ODD, BehavioralFlaw.HATESWOMEN, rDaughter.behavioralFlaw);
		rDaughter.behavioralQuirk = either(BehavioralQuirk.ADORESMEN, BehavioralQuirk.FUNNY, BehavioralQuirk.SINFUL, rDaughter.behavioralQuirk);
		rDaughter.sexualFlaw = either(SexualFlaw.ATTENTION, SexualFlaw.BREEDER, SexualFlaw.JUDGEMENT, rDaughter.sexualFlaw);
		rDaughter.sexualQuirk = either(SexualQuirk.PERVERT, SexualQuirk.TEASE, SexualQuirk.UNFLINCHING, SexualQuirk.SIZEQUEEN, SexualQuirk.SIZEQUEEN, rDaughter.sexualQuirk);
		rDaughter.career = V.AgePenalty === 0 ? either("a student council president", "a student council president", "a girl scout", "a scholar") : "from an upper class family";
		rDaughter.clothes = either("a cheerleader outfit", "a schoolgirl outfit");
		rDaughter.intelligenceImplant = Math.min(12 + newAge, 30);
		rDaughter.intelligence = random(30, 95 - rDaughter.intelligenceImplant); // intelligence + education = smart or very smart
		rDaughter.prestige = 2;
		rDaughter.prestigeDesc = `$He was a member of an illustrious well-off household.`;
		rDaughter.origin = `$He was the ${daughterD} of a prestigious family, until $his ${fatherF} disinherited $him and sold $him into slavery due to $his addiction to drugs and sex.`;
		rDaughter.custom.tattoo = `$He has $his family emblem tattooed on $his right wrist.`;
		rDaughter.skill.anal = Math.max(rDaughter.anus * 15, rDaughter.skill.anal);
		rDaughter.skill.vaginal = Math.max(rDaughter.vagina * 20, rDaughter.skill.vaginal);
		rDaughter.skill.oral = Math.max(rDaughter.skill.oral, 15);
		rDaughter.skill.whoring = 0;
		rDaughter.skill.entertainment = Math.max(rDaughter.skill.entertainment, 40);
		const genetics = random(0, 12);
		if (genetics === 0) {
			rDaughter.geneticQuirks.fertility = 2;
		} else if (genetics === 1 && V.seeHyperPreg) {
			rDaughter.geneticQuirks.hyperFertility = 2;
		} else if (genetics <= 3) {
			rDaughter.geneticQuirks.uterineHypersensitivity = 2;
		} else if (genetics <= 5) {
			rDaughter.geneticQuirks.pFace = 2;
			rDaughter.face = 100;
		} else if (genetics === 6) {
			rDaughter.geneticQuirks.albinism = 2;
			rDaughter.albinismOverride = makeAlbinismOverride(rDaughter.race);
			applyGeneticColor(rDaughter);
		}
		const sDrugs = random(0, 10);
		if (sDrugs < 3) {
			rDaughter.hormoneBalance = Math.min(rDaughter.hormoneBalance + random(400, 600), 1000); // took femenine hormones
		} else if (sDrugs < 5) {
			rDaughter.lips = Math.min(rDaughter.lips + random(40, 70), 100); // took lips growth
		} else if (sDrugs < 7) {
			rDaughter.boobs = Math.min(rDaughter.boobs + random(500, 900), 1200); // took boobs growth
		} else if (sDrugs === 7) {
			rDaughter.clit = either(3, 4, 5); // took clit enhancer
			rDaughter.foreskin = either(rDaughter.foreskin, rDaughter.clit, rDaughter.clit - 1, Math.min(rDaughter.clit + 1, 5));
			rDaughter.skill.penetrative = rDaughter.skill.penetrative + random(30, 50);
		} else if (sDrugs === 8) {
			rDaughter.butt = Math.min(rDaughter.butt + random(2, 4), 7); // took butt growth
		} else if (sDrugs === 9) {
			rDaughter.drugs = V.superFertilityDrugs ? Drug.SUPERFERTILITY : Drug.FERTILITY; // took fertility drugs
		} else if (sDrugs === 10) {
			rDaughter.nipples = "huge"; // took nipple enhancer
		}
		if (canImpreg(rDaughter, slave, true, true)) {
			WombImpregnate(rDaughter, setPregType(rDaughter), slave.ID, random(12, Math.min(V.week - slave.weekAcquired, 20)));
			SetBellySize(rDaughter);
		}
		rDaughter.drugs = Drug.NONE;
		setHealth(rDaughter);
		const preggers = rDaughter.preg > 0;
		const mindbroken = slave.fetish === Fetish.MINDBROKEN;
		const rumored = V.policies.sexualOpenness === 0 && getRumors("penetrative") > 2 && penetrativeSocialUse() < 40;
		App.Events.drawEventArt(node, [slave, rDaughter]);

		let r = [];

		r.push(`You have a meeting with several prominent ${VIPs} of your arcology detailing the progress and improvements you have made lately; lending them an ear to voice their opinions helps garner their favor, even if it's just for show. The last attendee to arrive is the leader of an influential local family accompanied, oddly enough, by ${hisD} ${rDaughter.actualAge}-year-old ${daughterD} and your slave,`, contextualIntro(PC, slave, true, true), ".");
		r.push(`The ${womanF} openly expresses ${hisF} anger towards your slave, blaming ${him} for corrupting and ruining ${hisF} ${daughterD}. ${HeF} alleges that the ${girlD}`);
		if (preggers) {
			r.push(`is carrying ${slave.slaveName}'s child and that ${heD}`);
		}
		r.push(`has spent a significant sum of money on${V.policies.sexualOpenness === 0 ? ` aberrant` : ""} sex, aphrodisiacs and other drugs meant for slaves. Before your other guests, ${heF} declares that ${heF} no longer regards ${himD} as ${hisF} ${daughterD} and that ${heD} has been banished from the family registry. Furthermore, even though ${heF} would prefer to never see ${himD} again, ${heD} will be serving as a slave in ${hisF} household going forward as repayment.`);
		App.Events.addParagraph(node, r);
		r = [];
		r.push(`You observe the ${kid}, who appears to be simultaneously nervous and excited. ${HisD} blatant dependence on aphrodisiacs is unmistakable. Considering ${hisD} privileged upbringing and reputable background, it is reasonable to assume that ${heD} has the capacity to excel as a sexual slave, rather than merely serving as a domestic servant.`);
		r.push(`Turning to face you, the ${fatherF} demands that you make up for the harm your slave has caused to ${himF} and ${hisF} family. While doing so, ${heF} leers at ${slave.slaveName} with a lascivious expression${rumored ? `, which conjures up rumors about the peculiar sexual preferences that have been circulating about ${himF}` : ""}.`);
		App.Events.addParagraph(node, r);
		r = [];

		const compensation = 1000 + (Math.min(Math.round(V.cash / 5000), 4) * 500); // from 1,000 to 3,000
		const value = 30000 + Math.clamp((Math.round(((slaveCost(rDaughter) - 35000) * .9) / 500) * 500), 0, 30000); // from 30,000 to 60,000
		const canBuy = !getSlaves().some(s => s.origin.includes("disinherited $him and sold $him into slavery") && V.week - s.weekAcquired < 6) && V.seeDicks !== 100; // we don't want a legion of reputed daughters
		const choices = [];
		choices.push(V.cash > compensation
			? new App.Events.Result(`Offer ${himF} ${cashFormat(compensation)} as financial compensation.`, money)
			: new App.Events.Result(null, null, `You lack the funds needed to adequately recompense ${himF}.`));
		choices.push(new App.Events.Result(`Offer to give ${himF} ${slave.slaveName} as compensation.`, giveSlave));
		if (canBuy) {
			choices.push(V.cash > value
				? new App.Events.Result(`Offer ${himF} ${cashFormat(value)} ${V.debugMode ? `(of ${slaveCost(rDaughter)})` : ""} to purchase ${hisF} ${daughterD}.`, buyDaughter)
				: new App.Events.Result(null, null, `You lack the necessary funds to buy the ${daughterD}'s debt.`));
			choices.push(new App.Events.Result(`Offer ${himF} ${slave.slaveName} in return for ${hisF} ${daughterD}.`, trade));
		}
		choices.push(new App.Events.Result(`You're not responsible for ${hisF} ${daughterD}'s actions.`, evade));
		choices.push(new App.Events.Result(`Blame ${himF} for ${hisF} ${daughterD}'s inadequate education.`, blame));
		if (canPenetrate(PC) && isFullyPotent(PC) && canBreed(slave, PC) && preggers) {
			choices.push(new App.Events.Result(`It's actually yours.`, oops));
		}
		choices.push(new App.Events.Result(`Punish your slave.`, punish));
		App.Events.addResponses(node, choices);

		return;

		/** @returns {DocumentFragment} */
		function money() {
			let frag = new DocumentFragment();
			let r = [];
			r.push(`You don't want to take the risk of angering one of the most influential ${VIPs} in your arcology, so you offer to provide priority access to the medical and pharmacological resources needed to treat ${hisF} ${daughterD}, in addition to some generous financial compensation. ${HeF} accepts the offer, seemingly content, and instructs the ${kid} to wait outside. <span class="reputation inc">Word spreads quickly that you are a conscientious ${properMaster()}</span> and are committed to rectifying any damage caused by your slaves.`);
			// FUTURE: lower authority. Allowing your slaves to do such things is a no no. Likewise in the other routes.
			repX(900, "event");
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`You dispatch ${slave.slaveName} back to ${his} duties.`);
			r = r.concat(slavesReaction("unpunished"));
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			cashX(forceNeg(compensation), "event", slave);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		/** @returns {DocumentFragment} */
		function giveSlave() {
			let frag = new DocumentFragment();
			let r = [];
			r.push(`Since you don't want to risk upsetting one of the most influential ${VIPs} in your arcology, you offer to transfer ownership of ${slave.slaveName} to ${himF}, as well as priority access to the medical and pharmaceutical resources needed to treat ${hisF} ${daughterD}. Satisfied, ${heF} nods and tells the ${kid} and ${hisF} new slave to wait outside. Your former slave`);
			if (mindbroken) {
				r.push(`seems to understand, with ${his} limited mind, that you are no longer ${his} master and`);
			} else {
				r.push(slave.devotion > 50 ? `sorrowfully` : slave.devotion > -50 ? `reluctantly` : `contemptuously`);
			}
			r.push(`obeys your final order. <span class="reputation inc">Word gets out that you are a conscientious ${properMaster()}</span> and that you bear liability for any harm that your slaves may inflict.`);
			repX(1000, "event");
			App.Events.addParagraph(frag, r);
			r = [];
			r = r.concat(slavesReaction("given"));
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			if (rumored) {
				r.push(`Rumor quickly spreads that the citizen who sold ${hisF} ${daughterD} into slavery enjoys spending the day with ${slave.slaveName}'s turgid dick buried in ${hisF} asshole, <span class="change positive">drawing attention away from your own predilections.</span>`);
				softenRumors.penetrative(5);
				App.Events.addParagraph(frag, r);
			}
			removeSlave(slave);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		/** @returns {DocumentFragment} */
		function buyDaughter() {
			let frag = new DocumentFragment();
			let r = [];
			r.push(`Since you don't want to risk upsetting one of the most influential ${VIPs} in your arcology, you make a generous offer to buy ${hisF} ${daughterD} and eliminate ${hisD} debt. Satisfied, ${heF} signs the documents transferring ownership of the ${child} to you. <span class="reputation inc">Word gets out that you are a giving and conscientious ${properMaster()}</span> who accepts accountability for whatever harm their slaves may inflict.`);
			repX(500, "event");
			cashX(forceNeg(value), "slaveTransfer", rDaughter);
			newSlave(rDaughter); // skip new slave intro
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`You give your new slave and ${slave.slaveName} the order to wait outside the room until the meeting is over.`);
			if (!mindbroken && slave.devotion <= 50) {
				r.push(`${slave.slaveName} feels like that ${he} <span class="trust inc">got away with something ${he} shouldn't have</span>`);
				if (slave.rules.relationship === "restrictive" || slave.relationship !== 0) {
					if (slave.rules.release.slaves === 0) {
						r.push(`and is <span class="devotion dec">annoyed</span> that your rules mean ${he} can't keep fucking the ${kid}.`);
						slave.devotion -= 5;
						slave.trust += 3;
					} else {
						r.push(`and is <span class="devotion inc">thrilled</span> that ${he} can now freely access ${his} little fucktoy${V.universalRulesConsent === 0 ? `, even when ${heD} doesn't feel like it` : ""}.`);
						slave.devotion += 3;
						slave.trust += 5;
					}
				} else {
					slave.relationship = slave.rules.relationship === "just friends" ? App.Utils.sexAllowed(slave, rDaughter) ? 3 : 2 : 4;
					slave.relationshipTarget = rDaughter.ID;
					rDaughter.relationship = slave.relationship;
					rDaughter.relationshipTarget = slave.ID;
					r.push(`and you can tell from the glances the two are exchanging that their relationship goes beyond just sex.`);
					if (App.Utils.sexAllowed(slave, rDaughter)) {
						r.push(`${He}'s <span class="devotion inc">grateful</span> that ${he} can now freely access ${his} little fucktoy.`);
						slave.devotion += 5;
						slave.trust += 5;
					} else {
						r.push(`But that's just too bad for ${him}, since <span class="devotion dec">${he} can't fuck the ${kid} anymore</span> because of your rules.`);
						slave.devotion -= 10;
						slave.trust += 5;
					}
				}
			}
			App.Events.addParagraph(frag, r);
			return frag;
		}

		/** @returns {DocumentFragment} */
		function trade() {
			let frag = new DocumentFragment();
			let r = [];
			r.push(`Since you don't want to risk upsetting one of the most influential ${VIPs} in your arcology, you offer to exchange ${slave.slaveName} for ${his} ${daughterD}; ${he} never has to see ${himD} again and ${heF} gets to do as ${heD} sees fit to the slave that caused all these problems. ${HeF} rushes to sign the contract with you, clearly excited by the outcome. <span class="reputation inc">Word gets out that you are a just and liable ${properMaster()}</span> who accepts accountability for whatever harm their slaves may inflict.`);
			repX(500, "event");
			newSlave(rDaughter); // skip new slave intro
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`You order your new slave to wait outside the room until the meeting is over.`);
			r = r.concat(slavesReaction("given"));
			App.Events.addParagraph(frag, r);
			r = [];
			if (rumored) {
				App.Events.addParagraph(frag, r);
				r = [];
				r.push(`Rumor quickly spreads that the citizen who sold ${hisF} ${daughterD} into slavery enjoys spending the day with ${slave.slaveName}'s turgid dick buried in ${hisF} asshole, <span class="change positive">drawing attention away from your own predilections.</span>`);
				softenRumors.penetrative(5);
				App.Events.addParagraph(frag, r);
			}
			removeSlave(slave);
			return frag;
		}

		/** @returns {DocumentFragment} */
		function evade() {
			let frag = new DocumentFragment();
			let r = [];
			r.push(`You respond angrily to the ${VIP}, informing ${himF} that ${slave.slaveName}'s job is to sexually please your citizens, and judging from the ${child}'s lustful face${preggers ? ` and  swollen tummy` : ""}, ${he} succeeded at it. You explain to the ${VIP} that ${hisF} ${daughterD}'s actions are entirely ${hisD} responsibility, not ${hisF}, not yours, and especially not your slave's. Nevertheless, you tell ${himF} that since ${heF} is who ${heF} is, you will grant ${himF} priority access to the pharmaceutical and medical resources needed to treat ${hisF} ${daughterD} at a discounted rate, should ${heF} so desire.`);
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`You dispatch ${slave.slaveName} back to ${his} duties.`);
			r = r.concat(slavesReaction("unpunished"));
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`Tensions only rise during the meeting; no doubt <span class="reputation dec">rumors will be spread that are a conniving ${properMaster()}</span> who does not own up to the issues their slaves may cause.`);
			repX(-700, "event");
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		/** @returns {DocumentFragment} */
		function blame() {
			let frag = new DocumentFragment();
			let r = [];
			r.push(`You retort angrily at the ${VIP}, telling ${himF} that ${hisF} failure to properly teach ${hisF} ${daughterD} impulse control is the real problem, not anything your slave has done. You lecture ${himF} that ${hisF} ${daughterD}'s actions are entirely ${hisF} responsibility, not yours and especially not your slave's. Not giving ${himF} the opportunity to reply, you instruct ${slave.slaveName} to return to ${his} duties and then proceed to address the other attendees, initiating the meeting.`);
			App.Events.addParagraph(frag, r);
			r = [];
			r = r.concat(slavesReaction("unpunished"));
			App.Events.addParagraph(frag, r);
			r = [];
			if (random(0, V.rep) < 3000) {
				r.push(`Tensions rise during the session; no doubt <span class="reputation dec">rumors will be spread that you are a despotic ${properMaster()}</span> and inconsiderate of the matters of the ${VIPs}.`);
				repX(-700, "event");
			} else if (random(0, V.rep) < 5000) {
				r.push(`The session goes by uncomfortably; you have suspicions that <span class="reputation dec">word will get out that you behaved in an unpleasant and abrupt manner</span> with the ${VIPs}.`);
				repX(-300, "event");
			} else {
				r.push(`Throughout the session, no one says anything. <span class="reputation inc">Word gets out that you're a hard-to-break, strict arcology owner with character.</span>`);
				repX(700, "event");
			}
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		/** @returns {DocumentFragment} */
		function oops() {
			let frag = new DocumentFragment();
			let r = [];
			r.push(`You explain to the ${VIP} that ${slave.slaveName} has no way of accessing the drugs ${hisF} ${daughterD} has become hooked on, before sheepishly letting it slip that the baby is probably yours. ${HeD} has been working as a Free Whore, likely in exchange for ${hisD} vices, and you've been making frequent use of ${himD} while touring the streets. Nevertheless, you let ${himF} know that you will grant ${himF} priority access to the pharmaceutical and medical resources needed to treat ${hisF} ${daughterD} for free, if ${heF} should desire.`);
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`You dispatch ${slave.slaveName} back to ${his} duties.`);
			if (!mindbroken && slave.devotion <= 50) {
				r.push(`Given that ${slave.slaveName} effectively <span class="trust inc">got away with being naughty,</span> ${he} seems oddly <span class="devotion dec">miffed</span> over the revelation.`);
				slave.devotion -= 5;
				slave.trust += 5;
			}
			App.Events.addParagraph(frag, r);
			r = [];
			r.push(`Several jokes are made at your expense during the session; you get the feeling <span class="reputation dec">fathers will be trying to keep their ${daughterD}s away from you,</span> lest you accidentally knock them up.`);
			repX(-300, "event");
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		/** @returns {DocumentFragment} */
		function punish() {
			let frag = new DocumentFragment();
			let r = [];
			r.push(`Despite your doubts, it's better to punish your slave than risk offending one of your arcology's most influential ${VIPs}.`);
			App.Events.addParagraph(frag, r);

			const choices = [];
			choices.push(new App.Events.Result(`Sentence ${him} to two weeks ${V.cellblock ? `in ${V.cellblockName}` : `of confinement`}.`, confine));
			choices.push(new App.Events.Result(`Sentence ${him} to two weeks in ${V.arcade > 0 && (slave.indenture < 0 || slave.indentureRestrictions === 0) ? V.arcadeName : `a gloryhole`}.`, sentence));
			if (slave.indenture > 0 && slave.indentureRestrictions !== 0) {
				choices.push(new App.Events.Result(null, null, `${His} indenture limits how far ${he} may be punished for such a minor offense.`));
			} else if (V.cash < V.surgeryCost) {
				choices.push(new App.Events.Result(null, null, `You lack the funds needed to mutilate ${him}.`));
			} else {
				if (V.seeExtreme) {
					choices.push(new App.Events.Result(`Remove ${his} penis.`, penis));
					choices.push(new App.Events.Result(`Remove ${his} genitalia.`, genitalia));
					if (slave.scrotum > 0) {
						choices.push(new App.Events.Result(`Geld ${him}`, geld));
					}
					if (slave.vagina < 0) {
						choices.push(new App.Events.Result(`Turn ${his} penis from the outside in.`, vagina));
					}
				}
			}
			choices.push(new App.Events.Result(`Lock ${him} in chastity.`, chastity));
			choices.push(new App.Events.Result(`Let the ${VIP} punish ${him}.`, VIPPunish));
			App.Events.addResponses(frag, choices);
			return frag;
		}

		/** @returns {DocumentFragment} */
		function confine() {
			let frag2 = new DocumentFragment();
			let r = [];
			if (mindbroken) {
				r.push(`The broken mind of ${slave.slaveName} accepts ${his} fate without any emotion; remaining confined will probably have no effect on ${him}.`);
			} else {
				r.push(`${slave.slaveName} cries and begs when you tell ${him} what ${his} punishment will be, but you don't give in.`);
				r.push(`For the next two weeks, ${slave.slaveName} will spend ${his} time isolated in ${V.cellblock ? V.cellblockName : `a room`}, reflecting on what ${he} supposedly did wrong.`);
				slave.devotion -= V.cellblock ? 10 : 5;
				slave.trust -= 5;
			}
			assignJob(slave, V.cellblock ? Job.CELLBLOCK : Job.CONFINEMENT);
			slave.sentence = 3;
			r = r.concat(slavesReaction("punished"));
			App.Events.addParagraph(frag2, r);
			r = [];
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function sentence() {
			let frag2 = new DocumentFragment();
			let r = [];
			const arcade = V.arcade > 0 && (slave.indenture < 0 || slave.indentureRestrictions === 0);
			if (mindbroken) {
				r.push(`The broken mind of ${slave.slaveName} accepts ${his} fate without any emotion, just as ${he} would accept any other task given to ${him}.`);
			} else {
				r.push(`${slave.slaveName} ${canTalk(slave) ? "screams and " : ""}begs when ${he} realizes what ${his} punishment is, but you are obdurate.`);
				if (arcade) {
					if (slave.muscles > 30) {
						r.push(`${His} powerful form has to be sedated for immurement in ${V.arcadeName}.`);
					} else if (slave.weight >= 190) {
						r.push(`${He} is so massively fat that immuring ${him} in ${V.arcadeName} is a struggle, even when ${he} isn't trying to.`);
					} else if (slave.belly >= 120000) {
						r.push(`${He} is so enormously gravid that immuring ${him} in ${V.arcadeName} is a hassle, even though ${his} ${bellyAdjective(slave)} middle limits ${his} ability to struggle.`);
					} else if (slave.weight >= -10) {
						r.push(`${His} desperate struggles make immuring ${him} in ${V.arcadeName} difficult.`);
					} else if (slave.belly >= 1500) {
						r.push(`${His}`);
						if (slave.bellyPreg >= 3000) {
							r.push(`pregnant`);
						} else {
							r.push(bellyAdjective(slave));
						}
						r.push(`body makes it slightly difficult to fit ${him} properly into the restraints for immurement in ${V.arcadeName}.`);
					} else if (slave.muscles < -15) {
						r.push(`${His} weak body makes immuring ${him} in ${V.arcadeName} pathetically easy.`);
					} else {
						r.push(`${His} thin form makes immuring ${him} in ${V.arcadeName} pathetically easy.`);
					}
					r.push(`After ${he}'s properly confined, the only sign of ${his} discomfiture is a slight movement of ${his} ${slave.skin} butt as ${he} wriggles desperately against ${his} restraints.`);
				} else {
					let holes = ["mouth"];
					if (slave.vagina >= 0 && slave.chastityVagina === 0) {
						holes.push("cunt");
					}
					if (slave.chastityAnus === 0) {
						holes.push("ass");
					}
					r.push(`For the next two weeks, ${he} will be locked within a dark box with nothing to do but let cock after cock come in through the holes, eager to use ${his} ${toSentence(holes)}.`);
				}
				slave.devotion -= arcade ? 15 : 10;
				slave.trust -= 10;
			}
			assignJob(slave, arcade ? Job.ARCADE : Job.GLORYHOLE);
			slave.sentence = 3;
			r = r.concat(slavesReaction("punished"));
			App.Events.addParagraph(frag2, r);
			r = [];
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function VIPPunish() {
			let frag2 = new DocumentFragment();
			let r = [`You offer the offended ${fatherF} the freedom to punish ${slave.slaveName} however ${heF} wants, directing ${himF} to an adjacent room for privacy. However, the sounds emanating from the room suggest a more sexual punishment over the expected corporal one. After a while, the ${VIP} returns to the meeting and sits down, at which point a wet fart is heard and the unmistakable smell of semen fills the room. The other attendees stare at ${himF}; some with surprise, others with disgust and most with amusement. One of them bursts out laughing, and it is contagious, causing everyone to join in. The ${womanF}, red with shame, quickly flees the room, leaving ${hisF} ${daughterD} behind.`];
			if (rumored) {
				r.push(`The populace will now have something new to talk about, <span class="change positive">instead of focusing on your unconventional sexual preferences.</span>`);
				softenRumors.penetrative(10);
			}
			r.push(`You and your remaining guests are left to discuss what to do with the ${kid}.`);
			App.Events.addParagraph(frag2, r);
			const choices = [];
			choices.push(new App.Events.Result(`Let them take care of ${himD}.`, giveDaughter));
			choices.push(new App.Events.Result(`Send ${himD} to ${hisD} ${fatherF}.`, returnDaughter));
			if (canBuy) {
				choices.push(new App.Events.Result(`Send ${slave.slaveName} to ${hisD} ${fatherF} instead of ${himD}.`, tradeBis));
			}
			choices.push(new App.Events.Result(`Keep the ${girlD} for yourself.`, keepDaughter));
			App.Events.addResponses(frag2, choices);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function chastity() {
			let frag2 = new DocumentFragment();
			let r = [];
			r.push(`You lock ${his} dick in a chastity cage and tuck away the key; ${he} won't be fucking anyone until you change your mind.`);
			if (!mindbroken) {
				r.push(`Even though ${slave.slaveName} enjoys a good fuck, ${he} feels that this is not truly a punishment.`);
			}
			r = r.concat(slavesReaction("unpunished"));
			App.Events.addParagraph(frag2, r);
			r = [];
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			slave.chastityPenis = 1;
			App.Events.refreshEventArt([slave, rDaughter]);
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function penis() {
			let frag2 = new DocumentFragment();
			let r = [];
			r.push(`You arrange for ${him} to be sent the remote surgery after determining that the best way to nip this problem in the bud is to snip off ${his} dick.`);
			let procedure = new App.Medicine.Surgery.Procedures.ChopPenis(slave);
			const result = App.Medicine.Surgery.apply(procedure, false);
			if (result === null) {
				r.push(`${slave.slaveName} <span class="health dec">dies from complications of surgery.</span>`);
				r.push(`This denouement caught the ${VIPs} off guard. A melancholic grimace appears on the ${girlD}'s face. Unexpectedly, the same goes for ${hisD} ${fatherF}'s.`);
				r = r.concat(slavesReaction("exitus"));
				App.Events.addParagraph(frag2, r);
				r = [];
				removeSlave(slave, {dead: true});
			} else {
				const [diff, reaction] = result;
				if (FutureSocieties.isActive("FSPaternalist") && V.arcologies[0].FSPaternalist > 60) {
					r.push(`The ${VIPs} are <span class="rep dec">horrified</span> by such a severe punishment being handed out so trivially.`);
					repX(-200, "event");
				} else if (FutureSocieties.isActive("FSDegradationist") && V.arcologies[0].FSDegradationist > 60) {
					r.push(`The ${VIPs} seem <span class="rep dec">pleased</span> with the punishment being so severe.`);
					repX(200, "event");
				}
				r.push(`A grimace of displeasure appears on the ${girlD}'s face. Unexpectedly, the same goes for ${hisD} ${fatherF}'s.`);
				r = r.concat(slavesReaction("mutilated"));
				App.Events.addParagraph(frag2, r);
				r = [];
				App.Events.addParagraph(frag2, [App.Medicine.Surgery.makeSlaveReaction(procedure.originalSlave, diff, reaction)]);
				r = [];
				App.Utils.Diff.applyDiff(procedure.originalSlave, diff);
				App.Events.refreshEventArt([slave, rDaughter]);
			}
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function geld() {
			let frag2 = new DocumentFragment();
			let r = [];
			r.push(`You arrange for ${him} to be sent the remote surgery after determining that the best way to nip this problem in the bud is to cut off ${his} balls.`);
			slave.balls = 0;
			slave.ballType = "human";
			slave.scrotum = 0;
			slave.vasectomy = 0;
			if ([Drug.GROWTESTICLE, Drug.HYPERTESTICLE, Drug.ATROPHYTESTICLE].includes(slave.drugs)) {
				slave.drugs = Drug.NONE;
			}
			if (FutureSocieties.isActive("FSPaternalist") && V.arcologies[0].FSPaternalist > 60) {
				r.push(`The ${VIPs} are <span class="rep dec">horrified</span> by such a severe punishment being handed out so trivially.`);
				repX(-200, "event");
			} else if (FutureSocieties.isActive("FSDegradationist") && V.arcologies[0].FSDegradationist > 60) {
				r.push(`The ${VIPs} seem <span class="rep dec">pleased</span> with the punishment being so severe.`);
				repX(200, "event");
			}
			r.push(`A grimace of displeasure appears on the ${girlD}'s face. Unexpectedly, the same goes for ${hisD} ${fatherF}'s.`);
			r = r.concat(slavesReaction("mutilated"));
			App.Events.addParagraph(frag2, r);
			r = [];
			App.Events.refreshEventArt([slave, rDaughter]);
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function genitalia() {
			let frag2 = new DocumentFragment();
			let r = [];
			r.push(`You arrange for ${him} to be sent the remote surgery after determining that the best way to deal with this is to just strip ${him} of ${his} genitals.`);
			let procedure = new App.Medicine.Surgery.Procedures.ChopPenis(slave); // the most important part removed, since there is no surgery for convert to null
			if (slave.vagina >= 0) {
				surgeryAmp(slave, "vagina"); // make sure vagina, ovaries and related attributes are set to 0 and the health damage is applied
			}
			slave.balls = 0;
			slave.ballType = "human";
			slave.scrotum = 0;
			slave.vasectomy = 0;
			if ([Drug.GROWTESTICLE, Drug.HYPERTESTICLE, Drug.ATROPHYTESTICLE].includes(slave.drugs)) {
				slave.drugs = Drug.NONE;
			}
			const result = App.Medicine.Surgery.apply(procedure, false);
			if (result === null) {
				r.push(`${slave.slaveName} <span class="health dec">dies from complications of surgery.</span>`);
				r.push(`This denouement caught the ${VIPs} off guard. A melancholic grimace appears on the ${girlD}'s face. Unexpectedly, the same goes for ${hisD} ${fatherF}'s.`);
				r = r.concat(slavesReaction("exitus"));
				App.Events.addParagraph(frag2, r);
				r = [];
				removeSlave(slave, {dead: true});
			} else {
				const [diff, reaction] = result;
				if (FutureSocieties.isActive("FSPaternalist") && V.arcologies[0].FSPaternalist > 60) {
					r.push(`The ${VIPs} are <span class="rep dec">horrified</span> by such a severe punishment being handed out so trivially.`);
					repX(-200, "event");
				} else if (FutureSocieties.isActive("FSDegradationist") && V.arcologies[0].FSDegradationist > 60) {
					r.push(`The ${VIPs} seem <span class="rep dec">pleased</span> with the punishment being so severe.`);
					repX(200, "event");
				}
				r.push(`A grimace of displeasure appears on the ${girlD}'s face. Unexpectedly, the same goes for ${hisD} ${fatherF}'s.`);
				r = r.concat(slavesReaction("mutilated"));
				App.Events.addParagraph(frag2, r);
				r = [];
				App.Events.addParagraph(frag2, [App.Medicine.Surgery.makeSlaveReaction(procedure.originalSlave, diff, reaction)]);
				r = [];
				App.Utils.Diff.applyDiff(procedure.originalSlave, diff);
				App.Events.refreshEventArt([slave, rDaughter]);
			}
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function vagina() {
			let frag2 = new DocumentFragment();
			let r = [];
			r.push(`You arrange for ${him} to be sent the remote surgery after determining that the proper punishment is to replace ${his} penis with a vagina.`);
			let procedure = new App.Medicine.Surgery.Procedures.MaleToFemale(slave);
			const keepBalls = slave.balls;
			const keepSperm = slave.ballType;
			const keepProstate = slave.prostate;
			const keepScrotum = slave.balls >= 2 ? slave.scrotum : 0;
			const keepVasectomy = slave.vasectomy;
			const keepDrugs = slave.drugs.includes("penis") ? Drug.NONE : slave.drugs;
			const result = App.Medicine.Surgery.apply(procedure, false);
			if (result === null) {
				r.push(`[${slave.slaveName} <span class="health dec">dies from complications of surgery.</span>`);
				r.push(`This denouement caught the ${VIPs} off guard. A melancholic grimace appears on the ${girlD}'s face. Unexpectedly, the same goes for ${hisD} ${fatherF}'s.`);
				r = r.concat(slavesReaction("exitus"));
				App.Events.addParagraph(frag2, r);
				r = [];
				removeSlave(slave, {dead: true});
			} else {
				const [diff, reaction] = result;
				diff.balls = keepBalls;
				diff.ballType = keepSperm;
				diff.prostate = keepProstate;
				diff.scrotum = keepScrotum;
				diff.vasectomy = keepVasectomy;
				diff.drugs = keepDrugs;
				if (FutureSocieties.isActive("FSPaternalist") && V.arcologies[0].FSPaternalist > 60) {
					r.push(`The ${VIPs} are <span class="rep dec">horrified</span> by such a severe punishment being handed out so trivially.`);
					repX(-200, "event");
				} else if (FutureSocieties.isActive("FSDegradationist") && V.arcologies[0].FSDegradationist > 60) {
					r.push(`The ${VIPs} seem <span class="rep dec">pleased</span> with the punishment being so severe.`);
					repX(200, "event");
				}
				r.push(`A grimace of displeasure appears on the ${girlD}'s face. Unexpectedly, the same goes for ${hisD} ${fatherF}'s.`);
				r = r.concat(slavesReaction("mutilated"));
				App.Events.addParagraph(frag2, r);
				r = [];
				App.Events.addParagraph(frag2, [App.Medicine.Surgery.makeSlaveReaction(procedure.originalSlave, diff, reaction)]);
				r = [];
				App.Utils.Diff.applyDiff(procedure.originalSlave, diff);
				App.Events.refreshEventArt([slave, rDaughter]);
			}
			r.push(`When the meeting comes to a close, you are shocked to see one of the other guests purchase the ${girlD}'s debt for an absurdly low sum.`);
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function giveDaughter() {
			let frag2 = new DocumentFragment();
			let r = [`You end the meeting by informing the ${VIPs} that you have other matters to take care of. They assure you that they'll take the ${kid} back to ${hisD} ${fatherF}'s house. From their lewd gestures and filthy comments as they make their way out, you are certain that the journey will be <span class="rep inc">an entertaining one.</span>`];
			repX(100, "event");
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function returnDaughter() {
			let frag2 = new DocumentFragment();
			let r = [`You end the meeting by informing the ${VIPs} that you have other matters to take care of, and that you will see the return of the ${daughterD} to ${hisD} ${fatherF} later that day. You order ${V.BodyguardID !== 0 ? "your bodyguard" : "one of your most trusted slaves"} to escort the ${child}, making sure ${heD} doesn't get into any more trouble involving you. The ${VIPs} <span class="reputation dec">seem disappointed</span> by your decision, but you are not having any more problems involving this ${girlD} thrown at you; if they want to be lecherous, there are plenty of public sluts that would be glad to service them.`];
			repX(-200, "event");
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function tradeBis() {
			let frag2 = new DocumentFragment();
			let r = [];
			r.push(`You end the meeting by informing the ${VIPs} that you have other matters to take care of, and that you will take care of the abandoned ${daughterD} personally. There is a clear air of <span class="reputation dec">jealousy</span> about them. You send ${slave.slaveName}, along with ${his} slave contract, while you keep the ${child}. The ${fatherF} hastily sends you the contract, seemingly eager to officially get ${his} hands on ${slave.slaveName}.`);
			repX(-400, "event");
			newSlave(rDaughter); // skip new slave intro
			App.Events.addParagraph(frag2, r);
			r = [];
			r = r.concat(slavesReaction("given"));
			App.Events.addParagraph(frag2, r);
			r = [];
			removeSlave(slave);
			return frag2;
		}

		/** @returns {DocumentFragment} */
		function keepDaughter() {
			let frag2 = new DocumentFragment();
			let r = [];
			r.push(`You end the meeting by informing the ${VIPs} that you have other matters to take care of, and that you will take care of the abandoned ${daughterD} personally. There is a clear air of <span class="reputation dec">jealousy</span> about them. You barely have time to start your inspection of your new toy before ${hisD} ${fatherF} transfers ${hisD} ownership to you. ${HeF} <span class="reputation dec">probably expects something in return, but should have thought of that before presenting you with this gift.</span>`);
			repX(-800, "event");
			newSlave(rDaughter); // skip new slave intro
			App.Events.addParagraph(frag2, r);
			return frag2;
		}

		/**
		 * @param {"unpunished" | "given" | "punished" | "mutilated" | "exitus"} action
		 * @returns {string[]|undefined}
		 */
		function slavesReaction(action) {
			let r = [];
			if (action === "unpunished") {
				if (mindbroken) {
					r.push(`Unable to understand what is happening, your slave heads back to offer ${his} body to whoever ${[Job.WHORE, Job.CLUB].includes(slave.assignment) ? "will pay for it" : "asks"}. `);
				} else {
					r.push(`${He} feared that you would punish ${him} in some cruel manner,`);
					if (slave.devotion <= -20) {
						if (slave.trust > 20) {
							r.push(`and since you haven't, ${he} begins to wonder what ${he} <span class="trust inc">could possibly get away with.</span>`);
							slave.trust += 2;
						} else {
							r.push(`working ${himself} up into a <span class="trust dec">paranoid state.</span> ${He} <span class="devotion dec">hates</span> knowing that you may change you mind at any point.`);
							slave.devotion -=2;
							slave.trust -= 2;
						}
					} else if (slave.devotion <= 20) {
						r.push(`but because you haven't, <span class="trust inc">perhaps you find ${him} valuable?</span>`);
						slave.trust += 5;
					} else if (slave.devotion > 95) {
						r.push(`but you haven't, <span class="trust inc">reassuring ${him}</span> that you will stand up for ${him} if ${he} is unfairly accused.`);
						slave.trust += 5;
					} else if (slave.trust <= 50) {
						r.push(`and although you haven't, <span class="trust dec">${he} fears the consequences</span> that another accusation from one of ${his} ${[Job.WHORE, Job.CLUB].includes(slave.assignment) ? "clients" : "users"} could have.`);
						slave.trust -= 3;
					} else {
						r.push(`but ${he} is relieved that you didn't.`);
					}
				}
				r.push(`When they learn what has happened, your other slaves are <span class="devotion inc">glad that you'd protect them</span> from false accusations, although the more rebellious ones feel <span class="defiant inc">they can take advantage of your benevolence.</span>`);
				getSlaves().forEach(s => {
					if (s.devotion < -20 && s.trust > 50) {
						s.devotion--;
						s.trust += 5;
					} else {
						s.devotion++;
					}
				});
				return r;
			} else if (action === "given" || action === "punished") {
				r.push(`After learning of what happened to ${slave.slaveName}, <span class="trust dec">your other slaves are afraid</span> that any accusation against them, no matter how fabricated, could have unpredictable consequences. Those not devoted to you begin to have <span class="devotion dec">serious doubts</span> about their futures.`);
				getSlaves().forEach(s => {
					s.trust -= 5;
					if (s.devotion <= 50) {
						s.devotion -= 5;
					}
				});
				if (action === "punished") {
					return r;
				}
				if (slave.relationship > 0) {
					const relationSlave = getSlave(slave.relationshipTarget);
					const {he2, his2} = getPronouns(relationSlave).appendSuffix('2');
					const family = relativeTerm(relationSlave, slave);
					let relation = relationshipTerm(relationSlave);
					if (family) {
						relation += ` and ${family}`;
					}
					if (relationSlave.fetish !== Fetish.MINDBROKEN) {
						if (relationSlave.devotion > 50) {
							r.push(relationSlave.slaveName + ` accepts with resignation your decision to get rid of ${his2} ${relation}, but <span class="trust dec">${he2} is terrified to think that ${he2} could be the next</span> to be handed over to a stranger.`);
							relationSlave.trust -= (20 + slave.relationship * 5);
						} else if (relationSlave.devotion >= -50) {
							r.push(relationSlave.slaveName + ` <span class="devotion dec">is saddened by your decision</span> to get rid of ${his2} ${relation}, and <span class="trust dec">${he2} is terrified to think that ${he2} could be the next</span> to be handed over to a stranger.`);
							relationSlave.devotion -= slave.relationship * 5;
							relationSlave.trust -= (20 + slave.relationship * 5);
						} else {
							r.push(relationSlave.slaveName + ` <span class="devotion dec">hates you for your decision</span> to get rid of ${his2} ${relation}, and <span class="trust inc">thoughts of revenge come to ${his2} mind.</span>`);
							relationSlave.devotion -= (10 + slave.relationship * 5);
							relationSlave.trust += (20 + slave.relationship * 5);
						}
					} else {
						r.push(`The broken mind of ${relationSlave.slaveName} won't even notice that ${his2} ${relation} is gone.`);
					}
				}
				if (slave.rivalry > 0) {
					const rival = getSlave(slave.rivalryTarget);
					const {he2, his2} = getPronouns(rival).appendSuffix('2');
					if (rival.fetish !== Fetish.MINDBROKEN) {
						r.push(`${rival.slaveName} is <span class="devotion inc">pleased</span> that ${he2} won't have to deal with ${his2} ${rivalryTerm(rival)} any more, and <span class="trust inc">hopes</span> this means ${his} life will now be easier.`);
						rival.devotion += rival.rivalry;
						rival.trust += rival.rivalry;
					}
				}
				return r;
			} else if (action === "mutilated" || action === "exitus") {
				const exitus = action === "exitus";
				r.push(`After learning of what happened to ${slave.slaveName}, <span class="trust dec">${his} peers are terrified</span> that any accusation against them, no matter how fabricated, ${exitus ? `could lead to their death` : `could have serious consequences`}. Those not devoted to you begin to believe that <span class="devotion dec">you'll be their demise.</span>`);
				if (mindbroken) {
					r.push(`This opinion of you is further tarnished by the fact that ${slave.slaveName} ${exitus ? "was" : "is"} mindbroken and incapable of doing anything wrong on purpose.`);
				}
				getSlaves().forEach(s => {
					s.trust -= (8 + (exitus ? 2 : 0) + (mindbroken ? 1 : 0));
					s.devotion -= ((exitus ? 1 : 0) + (mindbroken ? 2 : 0));
					if (s.devotion <=51) {
						s.devotion -= (6 + (exitus ? 2 : 0) + (mindbroken ? 1 : 0));
					}
				});
				return r;
			}
		}
	}
};
