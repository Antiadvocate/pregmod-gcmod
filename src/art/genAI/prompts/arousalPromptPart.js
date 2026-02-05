App.Art.GenAI.ArousalPromptPart = class ArousalPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let prompt = {terms: [], weight: 1};

		if (this.censored) {
			if (asSlave(this.slave)?.fuckdoll > 0) {
				return [];
			}
			// In censored mode: keep it light and face-driven elsewhere
			if (this.slave.energy > 60) {
				prompt.terms.push("blush");
			}
			// Do NOT add sweat/heavy breathing here
		} else if (asSlave(this.slave)?.fuckdoll > 0) {
			// fuckdolls are kept in a state of permanent arousal, with genitals exposed
			if (this.slave.vagina >= 0) {
				prompt.terms.push("pussy juice");
			}
			if (this.slave.dick > 0 && canAchieveErection(this.slave)) {
				prompt.terms.push("precum", "erection");
			}
		} else {
			const genitalsCovered = App.Data.clothes.get(this.slave.clothes).exposure < 3;

			if (!genitalsCovered && this.slave.vagina >= 0 && this.slave.vaginaLube === 2) {
				prompt.terms.push("pussy juice");
			}

			if (this.slave.energy > 60) {
				prompt.terms.push("blush");
				if (this.slave.dick > 0 && canAchieveErection(this.slave)) {
					prompt.terms.push("erection");
				} else if (this.slave.dick > 0) {
					prompt.terms.push("flaccid");
				}
			}

			// At higher arousal, keep it to fluids only (no sweat/breathing)
			if (this.slave.energy > 80) {
				if (!genitalsCovered && this.slave.dick > 0) {
					prompt.terms.push("precum");
				} else if (!genitalsCovered && this.slave.vagina >= 0 && this.slave.vaginaLube === 1) {
					prompt.terms.push("pussy juice");
				}
			}

			// Slight emphasis at extreme arousal if you want
			if (this.slave.energy > 95) {
				prompt.weight = 1.05;
			}
		}

		if (prompt.terms && prompt.terms.length > 0) {
			if (prompt.weight !== 1) {
				return [`(${prompt.terms.join(", ")}:${prompt.weight})`];
			}
			return prompt.terms;
		}
		return [];
	}

	/**
	 * @override
	 */
	face() {
		let prompt = {terms: [], weight: 1};

		if (asSlave(this.slave)?.fuckdoll > 0) {
			return [];
		}

		if (this.slave.energy > 60) {
			prompt.terms.push("blush");
		}
		if (this.slave.energy > 80) {
			// Safer “aroused face” cues that don’t create foggy scenes
			prompt.terms.push("parted lips", "half-lidded eyes", "flushed face");
		}

		if (this.slave.energy > 95) {
			// If you still want sweat, keep it weak and only at the very top end
			prompt.terms.push("(sweat:0.4)");
			prompt.weight = 1.05;
		}

		if (prompt.terms && prompt.terms.length > 0) {
			if (prompt.weight !== 1) {
				return [`(${prompt.terms.join(", ")}:${prompt.weight})`];
			}
			return prompt.terms;
		}
		return [];
	}
};

