App.Art.GenAI.Ill.ExpressionPromptPart = class ExpressionPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const slave = asSlave(this.slave);
		const customPrompt = slave?.custom?.aiPrompts?.expressionPositive;
		if (customPrompt) {
			return [customPrompt];
		}


		if (slave?.fuckdoll !== 0) {
			if (slave?.fuckdoll < 50) {
				return [`open mouth, clenched fists`]; // NG proxy for terrified for early adaptation
			} else {
				return ["expressionless"];
			}
		}
		if (this.slave.fetish === Fetish.MINDBROKEN) {
			return ["mind break, saliva, empty eyes"];
		}

		let prompts = [];

		if (this.slave.devotion < -50) {
			prompts.push(`angry, frown`);
		} else if (this.slave.devotion < -20) {
			prompts.push(`angry`);
		} else if (this.slave.devotion < 51) {
			prompts.push("expressionless");
		} else if (!(slave?.assignment === Job.PUBLIC || slave?.assignment === Job.ARCADE || slave?.assignment === Job.CLUB)) {
			if (this.slave.devotion < 95 && this.slave.mouthAccessory === "none") {
				prompts.push(`seductive smile`);
			} else if (this.slave.mouthAccessory === "none") {
				prompts.push(`seductive smile, parted lips, happy`);
			}
		}

		if (slave) {
			// When slave not very devoted, allow crying expression
			// When slave is devoted, crying paired with smile creates a weird expression
			if (this.slave.devotion < 51) {
				if (slave.trust < -90) {
					prompts.push(`scared, looking down, looking away, crying, tears`);
				} else if (slave.trust < -50) {
					prompts.push(`scared, looking down, looking away, crying`);
				} else if (slave.trust < -20) {
					prompts.push(`scared, looking down, looking away`);
				} else if (slave.trust < 51) {
					prompts.push("looking down, looking away");
				} else {
					prompts.push("looking at viewer");
				}
			} else {
				if (slave.trust < -20) {
					prompts.push("looking down, looking away");
				} else {
					prompts.push("looking at viewer");
				}
			}
		}

		return prompts;
	}

	/**
	 * @override
	 */
	negative() {
		const slave = asSlave(this.slave);
		const customPrompt = slave?.custom?.aiPrompts?.expressionNegative;
		if (customPrompt) {
			return [customPrompt];
		}

		return [];
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
