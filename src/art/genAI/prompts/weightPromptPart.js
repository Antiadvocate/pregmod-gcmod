App.Art.GenAI.WeightPromptPart = class WeightPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.helper.isXLOrPony()) {
			if (this.slave.weight < -95) {
				return ['skinny, emaciated'];
			} else if (this.slave.weight < -30) {
				return ['skinny'];
			} else if (this.slave.weight < -10) {
				return [`slim`];
			} else if (this.slave.weight < 10) {
				return [];
			} else if (this.slave.weight < 30) {
				return [`curvy`];
			} else if (this.slave.weight < 60) {
				return ['fat'];
			} else if (this.slave.weight < 95) {
				return ['obese'];
			} else {
				return ['fat, obese'];
			}
		}
		if (this.slave.weight < -95) {
			return [`emaciated, very thin, skinny`];
		} else if (this.slave.weight < -30) {
			return [`very thin, skinny`];
		} else if (this.slave.weight < -10) {
			return [`slim`];
		} else if (this.slave.weight < 10) {
			return [];
		} else if (this.slave.weight < 30) {
			return [`curvy`];
		} else if (this.slave.weight < 95) {
			return [`plump, chubby`];
		} else {
			return [`fat, obese, plump`];
		}
	}

	/**
	 * @override
	 */
	negative() {
		const parts = [];
		if (this.helper.isXLOrPony()) {
			if (this.slave.weight < -30) {
				parts.push('fat');
			}
		}
		if (this.slave.weight < -30) {
			parts.push(`plump, chubby`);
		} else if (this.slave.weight < 50) {
			// do nothing
		} else {
			parts.push(`thin, skinny`);
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
