App.Art.GenAI.FakeTitsPromptPart = class FakeTitsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.censored) {
			return [];
		} else {
			if (this.slave.boobsImplant > 1) {
				return [`fake tits`];
			}
		}
		return [];
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.boobsImplant === 0) {
			return [`fake tits`]; // Space for negative prompt if needed NG
		}
		return [];
	}
};
