App.Art.GenAI.Ill.GenderPromptPart = class GenderPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let prompt = [];
		if (this.isFeminine) {
			prompt.push("1girl");
			if (this.slave.race === "catgirl") {
				prompt.push("cat girl");
			}
		} else if (this.isMasculine) {
			prompt.push("1boy");
			if (this.slave.race === "catgirl") {
				prompt.push("cat boy");
			}
		} else {
			if (this.slave.race === "catgirl") {
				prompt.push("cat girl");
			}
		}

		return prompt;
	}

	/**
	 * @override
	 */
	negative() {
		let parts = [];
		if (this.slave.hormoneBalance > -20) {
			parts.push("beard", "mustache");// NG make permanent part of negative prompt?
		}

		if (this.isFeminine) {
			if (perceivedGender(this.slave) < -1) {  // Feminine hormone but Masculine appearing
				return [];
			} else { // Feminine hormone, Feminine appearing
				return parts;
			}
		}
		if (this.isMasculine) {
			if (perceivedGender(this.slave) > 1) { // Masculine hormone but Feminine appearing
				return [];
			} else { // Masculine hormone, Masculine appearing
				return ["1girl", ...parts];
			}
		}
		return [];
	}
};
