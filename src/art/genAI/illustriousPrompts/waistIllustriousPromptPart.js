App.Art.GenAI.Ill.WaistPromptPart = class WaistPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.censored) {
			return [];
		}

		if (this.slave.waist > 30) {
			return ["muffin top"];
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
		if (this.slave.waist > 95) {
			return ["(narrow waist:1.1)"];
		} else if (this.slave.waist > 30) {
			return [`narrow waist`];
		} else {
			return [];
		}
	}
};
