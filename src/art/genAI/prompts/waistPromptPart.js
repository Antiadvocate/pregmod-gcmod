App.Art.GenAI.WaistPromptPart = class WaistPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.censored) {
			return [];
		}
		if (this.slave.waist > 95) {
			return [`very wide waist`];
		} else if (this.slave.waist > 10) {
			return [`wide waist`];
		} else if (this.slave.waist > -40) {
			return [];
		} else if (this.slave.waist > -95) {
			return [`narrow waist`];
		} else {
			return [`(narrow waist:1.1)`];
		}
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.waist > 30) {
			return [`narrow waist`];
		} else if (this.slave.waist > -30) {
			return [];
		} else if (this.slave.waist > -95) {
			return [`wide waist`];
		}
	}
};
