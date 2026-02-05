App.Art.GenAI.Ill.HairPromptPart = class HairPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.slave.hStyle === "bald" || this.slave.hStyle === "shaved" || this.slave.hLength === 0) {
			return [`bald`];
		}

		const styleObj = App.Medicine.Modification.hairStyles.Normal.find(hs => hs.value === this.slave.hStyle);
		let styleStr = (styleObj?.title || this.slave.hStyle).toLowerCase();
		const stylePostfix = styleStr.startsWith("in") || styleStr === "up";

		const heightVhLength = this.slave.hLength / this.slave.height;
		let hairLength = '';
		if (heightVhLength > 0.75) {
			hairLength = `absurdly long hair`;
		} else if (heightVhLength >= 0.5) {
			hairLength = `very long hair`;
		} else if (heightVhLength >= 0.2) {
			hairLength = `long hair`;
		} else if (this.slave.hLength >= 15) {
			hairLength = `medium hair`;
		} else {
			hairLength = `short hair`;
		}

		const parts = [hairLength];
		parts.push(`${this.slave.hColor} hair`);

		if (stylePostfix) {
			parts.push(`${styleStr} hair`);
		}

		if (this.slave.hEffect.includes(`undercoloring`) || this.slave.hEffect.includes(`highlights`)) {
			parts.push(`${this.slave.hEffect} hair`); // color is already included in hEffect
		} else if (this.slave.hEffect.includes(`stripes`)) {
			parts.push(`${this.slave.hEffect} in hair`);
		}

		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.hStyle === "bald" || this.slave.hStyle === "shaved" || this.slave.hLength === 0) {
			return [`hair, long hair, short hair`];
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
