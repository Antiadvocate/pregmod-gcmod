// switch (V.surgeryType) {
/*

case "amp1":
V.nextLink = "Surgery Degradation", V.surgeryType = "amp";
r.push(`Since you have already have a prosthetic interface prepared for this slave, you can install it during the operation.<br>`);
r.push(`The procedure will put additional strain on ${his} health but less so than if you were to perform the procedures separately.`);
if (isProstheticAvailable(slave, "interfaceP1")) {
<br>
[[Install basic interface|Surgery Degradation][slave.PLimb = 1, slave.health.condition -= 10, V.surgeryType = "amp2", V.nextLink = "Surgery Degradation"]]
}
if (isProstheticAvailable(slave, "interfaceP2")) {
<br>
[[Install advanced interface|Surgery Degradation][slave.PLimb = 2, slave.health.condition -= 10, V.surgeryType = "amp2", V.nextLink = "Surgery Degradation"]]
}

break;
case "amp2":
if (slave.fetish === "mindbroken") {
r.push(`Of course, ${he} could not walk out of the surgery; you carried ${him}. ${He} squirms the entire time trying to move the arms and legs ${he} now lacks, never noticing the ports in ${his} stumps. Since the surgery was invasive, <span class="health dec">${his} health has been greatly affected.</span>`);
} else if (slave.devotion > 50) {
r.push(`Of course, ${he} could not walk out of the surgery; you carried ${him}. ${He} knows what a slave's life is, but ${he} did not really expect that it would ever come to this for ${him}. Anesthesia has yet to completely wear off so it takes ${him} a while to notice ports in ${his} stumps. When ${he} does, ${he} visibly relaxes, realizing ${he} may yet walk again. ${He} squares ${his} shoulders and visibly resolves to carry on being a good slave as best ${he} can. Since the surgery was invasive, <span class="health dec">${his} health has been greatly affected.</span>`);
} else if (slave.devotion > 20) {
r.push(`Of course, ${he} could not walk out of the surgery; you carried ${him}. Despite ${his} obedience, ${he} cries softly the whole time, shoulder and hip stumps moving occasionally as ${he} reflexively tries to stand — to walk — to touch ${himself} — to gesture — all things that ${he} will never do again. ${He} slightly calms down when ${he}`);
if (canSee(slave)) {
r.push(`sees`);
} else {
r.push(`feels`);
}
r.push(`ports installed in ${his} stumps and realizes ${his} immobility is not permanent. Even so, ${he} is still <span class="gold">terrified</span> of your total power over ${his} body. <span class="mediumorchid">${He} will struggle greatly with ${his} medically created disability.</span> Since the surgery was invasive, <span class="health dec">${his} health has been greatly affected.</span>`);
slave.trust -= 10;
slave.devotion -= 10;
} else {
r.push(`Of course, ${he} could not walk out of the surgery; you carried ${him}. You had a good idea what ${his} reaction would be, so`);
if (slave.teeth === "removable") {
r.push(`you removed ${his} teeth`);
} else {
r.push(`${he}'s muzzled`);
}
r.push(`to prevent ${him} from trying to bite. ${He} sobs convulsively, and ${his}`);
if (canSee(slave)) {
r.push(`eyes dart desperately from side to side through ${his} tears, hopelessly imploring the mirror to show ${him} something other than this.`);
} else {
r.push(`stumps twitch pathetically with ${his} desperate efforts to move ${his} limbs, to prove there is something other than this.`);
}
r.push(`Anything other than this. <span class="mediumorchid">The surgical invasion has filled ${him} with horror and anger.</span> Since the surgery was invasive, <span class="health dec">${his} health has been greatly affected.</span> ${He} is <span class="gold">terrified to the point of insanity</span> of your total power over ${his} body.`);
slave.trust -= 50;
slave.devotion -= 50;
}

V.prostheticsConfig = "interface";
<<include "Prosthetics Configuration">>
V.nextLink = "Remote Surgery";
break;
*/
/* This was moved to prostheticsConfig.tw
case "basicPLimbs":
r.push(`${He} exits the surgery hesitantly, the software of ${his} prosthetic limbs and the wetware of ${his} brain working together to figure out how to walk together under the tutelage of a prescribed tutorial. Recovery will be <span class="health dec">significant,</span> since the surgical implantation of anchor points for the limbs themselves and the installation of nerve impulse detectors constituted major surgery.`);
if (slave.fetish !== "mindbroken" && slave.fuckdoll === 0) {
	if (slave.devotion > 20) {
		r.push(`Nevertheless, ${he}'s <span class="hotpink">overwhelmed with gratitude,</span> and thanks you profusely the first chance ${he} gets. ${He} follows the acclimation program diligently, doing ${his} best to learn how to be a good slave despite, or sometimes even because of, ${his} artificial arms and legs. ${He} <span class="mediumaquamarine">places more trust in you,</span> too, since you obviously have ${his} best interests at heart.`);
		slave.devotion += 5;
slave.trust += 5;
	} else if (slave.devotion >= -20) {
		r.push(`${He}'s <span class="hotpink">overwhelmed with gratitude,</span> in part because ${he} didn't think you'd do something like this for ${him}. ${He} thanks you profusely the first chance ${he} gets, and follows the acclimation program diligently, trying to deserve the expense you went to. ${He} <span class="mediumaquamarine">places more trust in you,</span> too, since you seem to have a plan for ${him}.`);
		slave.devotion += 5;
slave.trust += 5;
	} else {
		r.push(`Despite ${his} hatred of you, ${he} can't help but <span class="mediumaquamarine">trust you a bit more,</span> since you clearly have a plan that involves putting a good deal of value into ${him}. Your goals might not be ${hers}, but at least ${he} has an indication that you're not toying with ${him}.`);
		slave.trust += 5;
	}
}

break;
case "sexPLimbs":
r.push(`${His} Limb upgrades took place in the surgery, since its manipulators are well suited to delicate work on circuitry and ceramics as well as on flesh. ${He} exits the surgery experimenting with ${his} new arms and legs.`);
if (slave.fetish !== "mindbroken" && slave.fuckdoll === 0) {
	if (slave.devotion <= 20) {
		r.push(`${He} rapidly discovers that ${his} fingertips are now vibrators, and then makes a mess when ${he} figures out that ${his} hands can dispense lube without figuring out how to make them stop dispensing lube. ${He}'s frustrated and <span class="gold">frightened,</span> realizing that even ${his} prosthetics are now customized to suit ${his} purpose as a human sex toy. ${He} knew ${he} was a toy before, but somehow, being a literal vibrator is a bit much for ${him}.`);
		slave.trust -= 5;
	} else if (slave.energy > 95) {
		r.push(`Since ${he}'s a nympho, ${he} discovers ${his} new sexual functions in a hurry. They trigger in part is based on arousal, and ${he}'s never not aroused, so they activate one by one as ${he} leaves the surgery. The vibration, lube, and other dirty functions surprise ${him}, and it takes ${him} a moment to realize what's going on, but ${he} begins to breathe hard when ${he} understands. ${He} runs off to try them out, and <span class="hotpink">thanks you profusely,</span> if tiredly, the next time ${he} sees you.`);
		slave.devotion += 5;
	} else {
		r.push(`${He} discovers ${his} sexy new functions one by one. The vibration, lube, and other dirty functions surprise ${him}, and it takes ${him} a moment to realize what's going on, but ${he} begins to shake with amusement when ${he} understands. ${He} heads off to try them out, and <span class="hotpink">thanks you politely</span> the next time ${he} sees you.`);
		slave.devotion += 3;
	}
}

break;
case "beautyPLimbs":
r.push(`${His} Limb upgrades took place in the surgery, since its manipulators are well suited to delicate work on circuitry and ceramics as well as on flesh. ${He} exits the surgery`);
if (canSee(slave)) {
r.push(`marveling at the beautiful, natural appearance of ${his} new arms and legs.`);
} else {
r.push(`thanking you for ${his} new arms and legs, unaware of how natural they look.`);
}
if (slave.fetish !== "mindbroken" && slave.fuckdoll === 0) {
	if (slave.devotion <= 20) {
		r.push(`${He}'s <span class="mediumaquamarine">more willing to trust you</span> after this. If ${he} doubts that you have some sort of long term plan for ${him}, all ${he} has to do is`);
if (canSee(slave)) {
r.push(`look down and examine`);
} else {
r.push(`feel`);
}
r.push(`${his} elegant, natural prosthetics, which are often mistaken for the genuine article. Even ${he} makes the mistake at times as ${he} gets used to them.`);
		slave.trust += 5;
	} else if (slave.skill.entertainment >= 100) {
		r.push(`Since ${he}'s a masterful entertainer, ${he} knows multiple styles of dance, though ${his} straightforward modern prosthetics never allowed ${him} to be anything more than a mechanically competent dancer. ${He} finds that ${he} has far better balance now, in addition to looking more natural. Before long, ${he} goes //en pointe// and holds the position, before collapsing in a heap. It soon becomes apparent that this wasn't due to clumsiness: ${he}'s sobbing so hard ${he} can barely breathe. ${He} <span class="hotpink">thanks you profusely</span> the next time ${he} sees you, eyes still puffy with tears of joy.`);
		slave.devotion += 5;
	} else {
		r.push(`When ${he} first`);
if (canSee(slave)) {
r.push(`catches sight of ${himself} in a mirror,`);
} else {
r.push(`runs a new finger over ${his} natural feeling skin,`);
}
r.push(`${he} begins to cry. Terribly complex emotions war across ${his} face: gratitude, joy, regret, and something undefinable. Blinking, ${he} uses newly elegant fingertips to trace the scarcely visible seams where ${his} artificial and natural skin meet. ${He} <span class="hotpink">thanks you profusely</span> the next time ${he} sees you, eyes still puffy with tears.`);
		slave.devotion += 3;
	}
}

break;
case "combatPLimbs":
r.push(`${His} Limb upgrades took place in the surgery, since its manipulators are well suited to delicate work on circuitry and ceramics as well as on flesh. ${He} exits the surgery wondering at the bulky`);
if (canSee(slave)) {
r.push(`appearance`);
} else {
r.push(`weight`);
}
r.push(`of ${his} reinforced arms and legs.`);
if (slave.fetish !== "mindbroken" && slave.fuckdoll === 0) {
	if (slave.devotion <= 20) {
		r.push(`${He}'s <span class="gold">frightened,</span> once ${he} discovers what ${he} can do, and what ${he} is. ${His} integral weapons are locked out by the arcology systems, for now, but ${he} quickly realizes what they are. ${He} is not, to say the least, thrilled by the revelation that ${he} is now a living weapon, and is kept awake by thoughts of what you might be planning for ${him}.`);
		slave.trust -= 5;
	} else if (slave.skill.combat === 1) && (slave.devotion > 75) {
		r.push(`${He} leaves the surgery with a purpose, ${his} footsteps a bit heavier than before. ${He} heads down to the armory's range, still naked, and when ${he} gets there, ${he} places ${his} dominant hand over ${his} thigh on that side. It folds open, revealing a handgun, which ${he} draws and empties into a`);
if (canSee(slave)) {
r.push(`target`);
} else {
r.push(`beeping target`);
}; as ${he} fires the last rounds, ${he} uses ${his} off hand to reach down to that thigh, which folds open and reveals spare magazines. ${He} <span class="hotpink">thanks you profusely</span> the next time ${he} sees you. ${He} knows that ${his} prosthetics are a wash, at best, in terms of actual combat effectiveness; they'll never match the reliability and dexterity of the genuine article. But ${he} thinks they are //cool.//
		slave.devotion += 5;
	} else {
		r.push(`${He} has mixed feelings about what ${he} soon discovers. ${He}'s a living weapon now, and has to live with the constant knowledge that ${he} can incapacitate or kill with nothing more than what's contained within ${his} arms and legs. ${He}'s <span class="hotpink">touched,</span> though, by the tremendous trust this shows. ${He} knows that the arcology would instantly lock out ${his} weapons if ${he} were to misbehave, but ${he}'s still affected.`);
		slave.devotion += 3;
	}
}

break;
case "cyberPLimbs":
r.push(`${His} Limb upgrades were performed in the surgery, since its manipulators are well suited to delicate work on their circuitry as well as on flesh. ${He} exits the surgery marveling`);
if (canSee(slave)) {
r.push(`at the shiny artificial skin of ${his} new arms and legs.`);
} else {
r.push(`at the feel of the artificial skin of ${his} new arms and legs under ${his} new fingers.`);
}
if (slave.fetish !== "mindbroken" && slave.fuckdoll === 0) {
	if (slave.devotion <= 20) {
		r.push(`${He}'s <span class="gold">frightened,</span> once ${he} discovers what ${he} can do, and what ${he} is. ${His} cybernetic limbs are restricted by the arcology systems, for now, but ${he} quickly realizes what they are. ${He} is not, to say the least, thrilled by the revelation that ${he} is now a living weapon, and is kept awake by thoughts of what you might be planning for ${him}.`);
		slave.trust -= 5;
	} else if (slave.skill.combat === 1) && (slave.devotion > 75) {
		r.push(`${He} leaves the surgery with a purpose, ${his} footsteps a bit heavier than before. ${He} heads down to the armory's range, still naked, and when ${he} gets there, ${he} places ${his} dominant hand over ${his} thigh on that side. It folds open, revealing a handgun, which ${he} draws and empties into a`);
if (canSee(slave)) {
r.push(`target`);
} else {
r.push(`beeping target`);
}; as ${he} fires the last rounds, ${he} uses ${his} off hand to reach down to that thigh, which folds open and reveals spare magazines. ${He} <span class="hotpink">thanks you profusely</span> the next time ${he} sees you. ${He} knows that ${his} prosthetics will enhance ${his} combat effectiveness and ${he} thinks they are //cool.//
		slave.devotion += 5;
	} else {
		r.push(`${He} has mixed feelings about what ${he} soon discovers. ${He}'s a living weapon now, and has to live with the constant knowledge that ${he} can incapacitate or kill with nothing more than ${his} arms and legs themselves. ${He}'s <span class="hotpink">touched,</span> though, by the tremendous trust this shows. ${He} knows that the arcology would instantly lock out ${his} limbs if ${he} were to misbehave, but ${he}'s still affected.`);
		slave.devotion += 3;
	}
}

break;
case "removeLimbs":
if (slave.fetish === "mindbroken") {
	r.push(`Of course, ${he} could not walk out of the surgery; you carried ${him}. ${He} squirms the entire time trying to move the arms and legs that ${he} used to have. As with all surgery <span class="health dec">${his} health has been slightly affected.</span>`);
} else if (slave.devotion > 50) {
	r.push(`Of course, ${he} could not walk out of the surgery; you carried ${him}. ${He} knows what a slave's life is, but ${he} did not really expect ${his} artificial limbs would be removed again so suddenly. After a long, silent`);
if (canSee(slave)) {
r.push(`stare at`);
} else {
r.push(`consideration of`);
}
r.push(`${his} limbless torso, ${he} squares ${his} shoulders and visibly resolves to carry on being a good slave as best ${he} can. As ${he} was already amputated, there was no lasting effect. As with all surgery <span class="health dec">${his} health has been slightly affected.</span>`);
} else if (slave.devotion > 20) {
	r.push(`Of course, ${he} could not walk out of the surgery; you carried ${him}. Despite ${his} obedience, ${he} cries softly the whole time, shoulder and hip stumps moving occasionally as ${he} reflexively tries to stand — to walk — to touch ${himself} — to gesture — all things that ${he} had to learn to do again. Your removal of ${his} prosthetic limbs has caused <span class="mediumorchid">${his} devotion to drop</span> and <span class="gold">${his} trust to drop.</span> As with all surgery <span class="health dec">${his} health has been slightly affected.</span>`);
	slave.trust -= 5;
slave.devotion -= 5;
} else {
	r.push(`Of course, ${he} could not walk out of the surgery; you carried ${him}. It seems that ${his} mistrust of you was well founded and this removal of ${his} artificial limbs has caused <span class="mediumorchid">${his} devotion to drop</span> and <span class="gold">${his} trust to drop.</span> As with all surgery <span class="health dec">${his} health has been slightly affected.</span>`);
	slave.trust -= 5;
slave.devotion -= 5;
}
break;
*/
//	default:
//		r.push(`ERROR bad/missing surgery description`);
//		r.push(`surgeryType: ${V.surgeryType}`);
//		r.push(`Devotion: ${slave.devotion}`);
//
