App.Art.GenAI.Ill.HornsPromptPart = class HornsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const parts = [];
		// Horns: output both type and color when present
		if (this.slave.horn && this.slave.horn !== "none") {
			parts.push(`${this.slave.horn}`);
			if (this.slave.hornColor && this.slave.hornColor !== "none") {
				parts.push(`${this.slave.hornColor} horns`);
			}
		}
		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		const parts = [];
		// If no ears, push ear negatives to prevent model from adding them
		if (this.slave.earT === "none" && this.slave.earShape === "none") {
			parts.push("ear", "ears");
		}
		// If no tail, push tail negative to prevent model from adding it
		if (this.slave.tail === "none") {
			parts.push("tail");
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

