App.Art.GenAI.AndroidPromptPart = class AndroidPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const parts = [];

		if (asSlave(this.slave)?.fuckdoll > 0) {
			return []; // limbs covered by fuckdoll suit
		} else if (this.helper.hasLora("hololive_roboco-san") || this.helper.isPony()) {
			if (this.helper.hasLora("hololive_roboco-san") && (hasBothProstheticArms(this.slave) || hasBothProstheticLegs(this.slave))) {
				parts.push(this.helper.lora("hololive_roboco-san", 1, ", android"));
			}
			if (hasBothProstheticArms(this.slave)) {
				parts.push(`mechanical arms`);
			}
			if (hasBothProstheticLegs(this.slave)) {
				parts.push(`mechanical legs`);
			}
		}
		if (this.helper.hasLora('RobotDog0903') && isQuadrupedal(this.slave)) {
			parts.push(this.helper.lora("RobotDog0903", .8, "", "quadruped, "));
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
		const parts = [];
		if (this.helper.hasLora("hololive_roboco-san") || this.helper.isPony()) {
			if (!hasBothProstheticArms(this.slave) && !hasBothProstheticLegs(this.slave)) {
				// they have no prosthetics so we don't need to worry about prompt bleeding
			} else if (!hasBothProstheticArms(this.slave)) {
				parts.push(`mechanical arms`);
			} else if (!hasBothProstheticLegs(this.slave)) {
				parts.push(`mechanical legs`);
			}
		}
		return parts;
	}
};
