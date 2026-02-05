App.Art.GenAI.WingsPromptPart = class WingsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const parts = [];
		if (this.slave.appendages === "mod" && this.slave.wingsShape && this.slave.wingsShape !== "none") {
			parts.push(`${this.slave.wingsShape} wings`);
		}
		if (this.slave.appendages === "flight") {
			parts.push("mechanical wings");
		}
		if (this.slave.appendages === "falcon") {
			parts.push("mechanical wings");
		}
		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		return [];
	}
};

