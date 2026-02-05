App.Medicine.Surgery.Reactions.CervixPumpTubing = class extends App.Medicine.Surgery.SimpleReaction {
	/**
	 * @param {FC.SlaveState} slave
	 * @param {Partial<FC.SlaveState>} diff
	 * @returns {reactionResult}
	 */
	reaction(slave, diff) {
		const reaction = super.reaction(slave, diff);
		const {He, he, his, him} = getPronouns(slave);
		const r = [];

		if (slave.fetish === Fetish.MINDBROKEN) {
			r.push(`${He} leaves the surgery with nothing but a nonspecific ache across ${his} entire torso with no identifiable source. Since the surgery was extremely invasive to render the system imperceptible, <span class="health dec">${his} health has been direly affected.</span>`);
		} else if (slave.devotion > 50) {
			r.push(`${He} leaves the surgery with nothing but a nonspecific ache across ${his} entire torso, and as such, knows you added something throughout ${his} body. ${He} is <span class="devotion inc">excited</span> by what this implant will do to ${him}, and eagerly awaits to see the end result. Since the surgery was extremely invasive to render the system imperceptible, <span class="health dec">${his} health has been direly affected.</span>`);
			reaction.devotion += 4;
		} else if (slave.devotion >= -20) {
			r.push(`${He} leaves the surgery with nothing but a nonspecific ache across ${his} entire torso, and as such, knows you added something throughout ${his} body. ${He} understands the realities of ${his} life as a slave, but ${he} is still surprised by the new system running through ${his} body. Since the surgery was extremely invasive to render the system imperceptible, <span class="health dec">${his} health has been direly affected.</span> ${He} is <span class="trust dec">sensibly fearful</span> of your total power over ${his} body.`);
			reaction.trust -= 5;
		} else {
			r.push(`${He} leaves the surgery with nothing but a nonspecific ache across ${his} entire torso, but ${he} knows enough about surgery and sex slaves to believe that you've inserted some new method to control ${him} into ${his} body. ${He} does not understand the realities of ${his} life as a slave at a core level, so ${he}'s <span class="devotion dec">terrified and angry</span> at the potential that ${he}'s been subject of such modifications. Even after what has been implanted into ${his} body is explained to ${him}, ${he} is no less defiant; though ${he} is relieved that it isn't some sort of control mechanism, ${he} still feels dirty and humiliated when ${he} thinks of sex slowly warping ${his} body to be increasingly lewd. Since the surgery was extremely invasive to render the system imperceptible, <span class="health dec">${his} health has been direly affected.</span> ${He} is <span class="trust dec">sensibly fearful</span> of your total power over ${his} body.`);
			reaction.trust -= 10;
			reaction.devotion -= 10;
		}

		reaction.longReaction.push(r);
		return reaction;
	}
};

App.Medicine.Surgery.Procedures.CervixPumpTubing = class extends App.Medicine.Surgery.Procedure {
	get name() {
		return "Install inert filler circulatory system";
	}

	get description() {
		const {he, his} = getPronouns(this.originalSlave);
		return `Will allow inert filler to be transported throughout ${his} body to be added to any fillable implants ${he} may possess`;
	}

	get healthCost() {
		return 60;
	}

	apply(cheat) {
		this._slave.cervixImplantTubing = 1;
		this._slave.cervixImplantTarget = "none";
		return this._assemble(new App.Medicine.Surgery.Reactions.CervixPumpTubing());
	}
};
