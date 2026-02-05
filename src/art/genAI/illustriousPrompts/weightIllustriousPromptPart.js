App.Art.GenAI.Ill.WeightPromptPart = class WeightPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.slave.weight < -95) {
			return ['skinny, emaciated'];
		} else if (this.slave.weight < -30) {
			return ['skinny'];
		} else if (this.slave.weight < -10) {
			return [`slim`];
		} else if (this.slave.weight < 10) {
			return [];
		} else if (this.slave.weight < 30) {
			return [`curvy`];
		} else if (this.slave.weight < 60) {
			return ['fat'];
		} else if (this.slave.weight < 95) {
			return ['obese'];
		} else {
			return ['absurdly obese'];
		}
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.weight < -10 || this.slave.weight >= 10) {
			return [];
		} else {
			return ["skinny, emaciated, curvy, fat, obese"];
		}
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
