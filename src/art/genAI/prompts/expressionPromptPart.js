App.Art.GenAI.ExpressionPromptPart = class ExpressionPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const slave = asSlave(this.slave);
		const customPrompt = slave?.custom?.aiPrompts?.expressionPositive;
		if (customPrompt) {
			return [customPrompt];
		}

		// Existing special cases kept
		if (slave?.fuckdoll !== 0) {
			if (slave?.fuckdoll < 50) {
				return ["open mouth, clenched fists"];
			}
			return [];
		}
		if (this.helper.hasLora("Empty Eyes - Drooling v5 - 32dim") && this.slave.fetish === Fetish.MINDBROKEN) {
			return [this.helper.lora("Empty Eyes - Drooling v5 - 32dim", 1, " empty eyes, drooling")];
		}

		const tags = [];

		// TRUST dominates when very low
		if (slave && slave.trust < -50) {
			tags.push("scared expression", "looking down");
			if (slave.trust < -70) tags.push("crying");
		} else {
			// DEVOTION mood (single tag)
			if (this.slave.devotion < -50) {
				tags.push("angry expression");
			} else if (this.slave.devotion < -20) {
				tags.push("angry");
			} else if (this.slave.devotion < 51) {
				tags.push("neutral expression");
			} else if (this.slave.devotion < 95) {
				tags.push("smile");
			} else {
				tags.push("smile", "loving eyes");
			}

			// TRUST gaze
			tags.push("looking at viewer");
		}

		if (this.helper.isXLBased()) {
			return tags;
		}
		return [`(${tags.join(", ")})`];
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

		// Keep your existing special cases (minimal)
		if (slave?.fuckdoll !== 0) {
			return ["smile, angry, confident"];
		}
		if (this.slave.fetish === Fetish.MINDBROKEN) {
			return ["smile, angry, looking at viewer, confident"];
		}

		// Only block the "opposite" direction, lightly
		const neg = [];

		if (slave && slave.trust < -50) {
			// if we're scared/looking down, discourage confident + viewer-gaze
			neg.push("confident", "looking at viewer", "smile");
		} else {
			// if we're normal/viewer-gaze, discourage downcast scared look
			neg.push("looking down", "crying", "scared expression");
		}

		// discourage the opposite mood
		if (this.slave.devotion >= 51) {
			neg.push("angry");
		} else if (this.slave.devotion < -20) {
			neg.push("smile");
		}

		return neg;
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
