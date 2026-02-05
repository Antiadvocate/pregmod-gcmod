App.Art.GenAI.Ill.ButtPromptPart = class ButtPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const anatomyMode = Number(asSlave(this.slave)?.custom?.aiAnatomyExposure ?? 0);
		// "ass/butt" strongly biases the model toward rear-view compositions.
		// Only emit butt descriptors when the player explicitly opted into rear-explicit mode.
		if (this.censored || anatomyMode < 3) {
			return [];
		}

		/**
		 * @type {number} butt size
		 * * 0	: flat
		 * * 1	: small
		 * * 2  : plump *
		 * * 3	: big bubble butt
		 * * 4	: huge
		 * * 5	: enormous
		 * * 6	: gigantic
		 * * 7	: ridiculous
		 * * 8 - 10: immense
		 * * 11 - 20: inhuman
		 *
		 * _* Descriptions vary for just how big 2 is, as such, it may be better to just go with 3_
		 */
		if (this.slave.butt === 0) {
			return [`flat ass`];
		} else if (this.slave.butt <= 2) {
			return [];
		} else if (this.slave.butt <= 4) {
			return [`bubble butt`];
		} else  {
			return [`(bubble butt)`];
		}
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.hips === 0) {
			return ["bubble butt"];
		}
		return [];
	}
};
