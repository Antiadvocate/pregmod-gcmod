App.Art.GenAI.AgePromptPart = class AgePromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
	return [`${this.slave.visualAge} year old`];
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.visualAge >= 18) {
			return ["child", "teen", "underage"];
		}
		return [];
	}
};
