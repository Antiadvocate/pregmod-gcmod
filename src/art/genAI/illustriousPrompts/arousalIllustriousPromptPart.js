App.Art.GenAI.Ill.ArousalPromptPart = class ArousalPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let prompts = [];
		if (this.censored) {
			if (asSlave(this.slave)?.fuckdoll > 0) {
				return [];
			}
			if (this.slave.energy > 60) {
				prompts.push("blush");
			}
			if (this.slave.energy > 80) {
				prompts.push("sweat", "heavy breathing");
			}
		} else if (asSlave(this.slave)?.fuckdoll > 0) {
			// fuckdolls are kept in a state of permanent arousal, with genitals exposed
			if (this.slave.vagina >= 0) {
				prompts.push("pussy juice");
			}
			if (this.slave.dick > 0 && canAchieveErection(this.slave)) {
				prompts.push("precum, erection");
			}
		} else {
			const genitalsCovered = App.Data.clothes.get(this.slave.clothes).exposure < 3;
			if (!genitalsCovered && this.slave.vagina >= 0 && this.slave.vaginaLube === 2) {
				prompts.push("pussy juice"); // no equivalent for penises
			}
			if (this.slave.energy > 60) {
				prompts.push("blush");
				if (this.slave.dick > 0 && canAchieveErection(this.slave)) {
					prompts.push("erection");
				} else if (this.slave.dick > 0) {
					prompts.push("flaccid");
				}
			}
			if (this.slave.energy > 80) {
				prompts.push("sweat");
				if (!genitalsCovered && this.slave.dick > 0) { // // NG add male precum (check gen), remove pussy mention if slave has penis
					prompts.push("precum");
				} else if (!genitalsCovered && this.slave.vagina >= 0 && this.slave.vaginaLube === 1) {
					prompts.push("pussy juice");
				}
			}
		}
		return prompts;
	}

	/**
	 * @override
	 */
	face() {
		if (asSlave(this.slave)?.fuckdoll > 0) {
			return [];
		}

		let prompts = [];
		if (this.slave.energy > 60) {
			prompts.push("blush");
		}
		if (this.slave.energy > 80) {
			prompts.push("sweat");
		}

		return prompts;
	}
};
