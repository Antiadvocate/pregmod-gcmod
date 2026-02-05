App.Art.GenAI.Ill.AndroidPromptPart = class AndroidPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const parts = [];

		if (asSlave(this.slave)?.fuckdoll > 0) {
			return []; // limbs covered by fuckdoll suit
		}

		if (hasBothProstheticArms(this.slave)) {
			parts.push("mechanical arms");
		}
		if (hasBothProstheticLegs(this.slave)) {
			parts.push("mechanical legs");
		}
		if (isQuadrupedal(this.slave)) {
			parts.push("all fours, quadruped");
		}

		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		if (asSlave(this.slave)?.fuckdoll > 0) {
			return []; // limbs covered by fuckdoll suit
		}

		if (!hasBothProstheticArms(this.slave) && !hasBothProstheticLegs(this.slave)) {
			return []; // they have no prosthetics so we don't need to worry about prompt bleeding
		}

		const parts = [];
		if (!hasBothProstheticArms(this.slave)) {
			parts.push(`mechanical arms`);
		}
		if (!hasBothProstheticLegs(this.slave)) {
			parts.push(`mechanical legs`);
		}

		return parts;
	}
};
