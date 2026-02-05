App.Art.GenAI.PregPromptPart = class PregPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.censored) {
			return [];
		}

		if (this.slave.belly >= 10000) {
			return ["pregnant, full term, big belly"];
		} else if (this.slave.belly >= 5000) {
			return ["pregnant"];
		} else if (this.slave.belly >= 1500) {
			return ["early pregnancy"];
		} else if (this.slave.belly >= 100) {
			return ["very early pregnancy"];
		}
	}

	/**
	 * @override
	 */
	negative() {
		return [];
	}
};
