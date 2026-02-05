App.Art.GenAI.Ill.HipsPromptPart = class HipsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.censored) {
			return [];
		}
		if (this.slave.hips <= -2) {
			return [`(narrow hips:1.1)`];
		} else if (this.slave.hips === -1) {
			return [`narrow hips`];
		} else if (this.slave.hips === 0 || this.slave.hips === 1) {
			return [];
		} else if (this.slave.hips === 2) {
			return [`wide hips`];
		} else {
			return [`(wide hips:1.1)`];
		}
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.hips <= -2) {
			return ["(wide hips:1.1)"];
		} else if (this.slave.hips === -1) {
			return ["wide hips"];
		} else if (this.slave.hips === 0 || this.slave.hips === 1) {
			return [];
		} else if (this.slave.hips === 2) {
			return [`narrow hips`];
		} else {
			return [`(narrow hips:1.1)`];
		}
	}
};
