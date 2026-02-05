/** base class for prompt parts */
App.Art.GenAI.PromptPart = class PromptPart {
	/**
	 * @param {FC.HumanState} slave
	 */
	constructor(slave) {
		this.slave = slave;
		this.censored = this.slave.visualAge < 18 && V.aiAgeFilter;
		this.helper = App.Art.GenAI.PromptHelpers;
		this.isFeminine = App.Art.GenAI.PromptHelpers.isFeminine(slave);
		this.isMasculine = App.Art.GenAI.PromptHelpers.isMasculine(slave);
	}

	/**
	 * Define any relevant keywords for the positive prompt
	 * @returns {Array<string>}
	 * @abstract
	 */
	positive() {
		return [];
	}

	/**
	 * Define any relevant keywords for the negative prompt
	 * @returns {Array<string>}
	 * @abstract
	 */
	negative() {
		return [];
	}

	/**
	 * Keywords for a high detail pass -- useful once the first pass has established image structure
	 * @returns {Array<string>}
	 * @abstract
	 */
	detailer() {
		return [];
	}

	/**
	 * Facial features -- separated for adetailer face pass
	 * @returns {Array<string>}
	 * @abstract
	 */
	face() {
		return [];
	}
};

App.Art.GenAI.Prompt = class Prompt {
	constructor(parts) {
		this.parts = parts;
	}

	/**
	 * @param {Array<string>} bits
	 * @returns {string}
	 */
	static joinClean(bits) {
		return bits
			.flat()
			.map(s => (s ?? "").toString().trim())
			.filter(s => s.length > 0)
			.join(", ");
	}

	positive() {
		return App.Art.GenAI.Prompt.joinClean(this.parts.map(part => part.positive()));
	}

	negative() {
		return App.Art.GenAI.Prompt.joinClean(this.parts.map(part => part.negative()));
	}

	detailer() {
		return App.Art.GenAI.Prompt.joinClean(this.parts.map(part => part.detailer()));
	}

	face() {
		return App.Art.GenAI.Prompt.joinClean(this.parts.map(part => part.face()));
	}
};
