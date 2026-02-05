App.Art.GenAI.EarsPromptPart = class EarsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.slave.faceAccessory === "cat ears") {
			return [`cat ears`]; // TODO: this probably needs a lora as it is a cat face mask with cat ears, not actual cat ears
		}
		const parts = [];
		if (this.slave.earT !== "none" && this.slave.earT !== "normal") {
			parts.push(`${this.slave.earT} ears`);
		}
		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		const parts = [];
		if (this.slave.tail === "none") {
			parts.push(``); // animal ears bleed into tail
		}
		if (this.slave.earT === "none" && this.slave.earShape === "none") {
			parts.push(`ear`, `ears`);
		}
		return parts;
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
