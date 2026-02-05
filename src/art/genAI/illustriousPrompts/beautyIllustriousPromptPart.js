App.Art.GenAI.Ill.BeautyPromptPart = class BeautyPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (asSlave(this.slave)?.fuckdoll > 0) {
			return []; // face not visible
		}

		if (this.slave.face < -50) {
			return ["ugly"];
		}
		if (this.slave.face < 10) {
			return ["unattractive"];
		}
		if (this.slave.face < 50) {
			return ["attractive"];
		}

		if (geneToGender(this.slave.genes) === "XY") {
			return ["handsome"];
		} else {
			return ["beautiful"];
		}
	}
};
