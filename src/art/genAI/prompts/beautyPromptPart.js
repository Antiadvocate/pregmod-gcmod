App.Art.GenAI.BeautyPromptPart = class BeautyPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (asSlave(this.slave)?.fuckdoll > 0) {
			return []; // face not visible
		}

		if (this.slave.face < -95) {
			return ["ugly"];
		} else if (this.slave.face < -50) {
			return ["unattractive"];
		} else if (this.slave.face < 10) { /* empty */ } else if (this.slave.face < 50) {
			return ["attractive"];
		} else if (this.slave.face < 95) {
			if (geneToGender(this.slave.genes) === "XY") {
				return ["handsome"];
			} else {
				return ["beautiful"];
			}
		} else {
			return ["gorgeous"];
		}
	}
};
