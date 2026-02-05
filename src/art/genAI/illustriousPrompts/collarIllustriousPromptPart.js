App.Art.GenAI.Ill.CollarPromptPart = class CollarPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (asSlave(this.slave)?.fuckdoll > 0) {
			return []; // fuckdolls can't wear collars
		}

		if (this.slave.collar === "bell collar") {  // Doesn't work well, better than "bell collar collar"
			return ["collar, neck bell"];
		} else if (this.slave.collar === "bowtie") {
			return ["bowtie"];
		} else if (this.slave.collar === "leather with cowbell") {  // Doesn't work well, better than "leather with cowbell collar"
			return ["collar, leather collar, cowbell"];
		} else if (this.slave.collar === "neck corset") { // Doesn't work well, but doesn't add real corsets
			return ["neck corset, posture collar"];
		} else if (this.slave.collar === "neck tie") {
			return ["necktie"];
		} else if (this.slave.collar === "satin choker") {
			return ["satin choker"];
		} else if (this.slave.collar.includes("biometrics")) { // Avoid a pregnancy prompt
			return ["collar"];
		} else if (this.slave.collar !== "none") {
			return [`${this.slave.collar} collar`];
		}
		return [];
	}
};
