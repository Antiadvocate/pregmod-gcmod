App.Art.GenAI.Ill.PubicHairPromptPart = class PubicHairPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const anatomyMode = Number(asSlave(this.slave)?.custom?.aiAnatomyExposure ?? 0);
		// Only mention pubic hair when the player explicitly opted into explicit anatomy.
		if (anatomyMode < 2 || this.censored) {
			return [];
		}

		if (this.slave.pubicHStyle === "waxed" || this.slave.pubicHStyle === "bald" || this.slave.pubicHStyle === "hairless" || this.slave.physicalAge < Math.min(this.slave.pubertyAgeXX, this.slave.pubertyAgeXY)) {
			return [];
		}
		if ((asSlave(this.slave)?.fuckdoll > 0)) {
			return []; // pubic region should be covered by clothes
		}
		const style = (this.slave.pubicHStyle === "bushy in the front and neat in the rear" ? "bushy" : this.slave.pubicHStyle); // less complicated prompt works better for the long style
		return [`${this.slave.pubicHColor} ${style} pubic hair`];
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.pubicHStyle === "waxed" || this.slave.pubicHStyle === "bald" || this.slave.pubicHStyle === "hairless" || this.slave.physicalAge < Math.min(this.slave.pubertyAgeXX, this.slave.pubertyAgeXY)) {
			return ["pubic hair"];
		}
		return [];
	}
};
