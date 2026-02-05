App.Art.GenAI.EyebrowPromptPart = class EyebrowPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.helper.isXLBased()) {
			return [];
		}
		const slave = asSlave(this.slave);
		if (slave?.fuckdoll > 0) {
			return []; // covered by fuckdoll mask
		}
		if (this.slave.eyebrowHStyle === "shaved" || this.slave.eyebrowHStyle === "bald" || this.slave.eyebrowHStyle === "hairless") {
			return [];
		}
		return [`${this.slave.eyebrowFullness} eyebrows`];
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.eyebrowHStyle === "shaved" || this.slave.eyebrowHStyle === "bald" || this.slave.eyebrowHStyle === "hairless") {
			return ["eyebrows"];
		}
		return [];
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
