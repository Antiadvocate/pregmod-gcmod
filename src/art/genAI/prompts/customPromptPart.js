App.Art.GenAI.CustomPromptPart = class CustomPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let parts = [];
		const slave = asSlave(this.slave);
		if (slave && slave.useRulesAssistant === 1 && slave.custom.aiPrompts?.positiveRA) {
			parts.push(slave.custom.aiPrompts.positiveRA);
		}

		if (slave && slave.custom.aiPrompts?.positive) {
			parts.push(slave.custom.aiPrompts?.positive);
		}

		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		let parts = [];
		const slave = asSlave(this.slave);
		if (slave && slave.useRulesAssistant === 1 && slave.custom.aiPrompts?.negativeRA) {
			parts.push(slave.custom.aiPrompts?.negativeRA);
		}

		if (slave && slave.custom.aiPrompts?.negative) {
			parts.push(slave.custom.aiPrompts?.negative);
		}

		return parts;
	}
};
