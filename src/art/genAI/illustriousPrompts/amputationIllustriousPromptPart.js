App.Art.GenAI.Ill.AmputationPromptPart = class AmputationPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (isAmputee(this.slave)) {
			return ["quadruple amputee"];
		}
		if (!(this.slave.arm.left || this.slave.arm.right)) {
			return ["double amputee"];
		}
		if (!(this.slave.leg.left || this.slave.leg.right)) {
			return ["legless amputee"];
		}
		if (!this.slave.arm.left || !this.slave.arm.right || !this.slave.leg.left || !this.slave.leg.right) {
			return ["amputee"];
		}
		return [];
	}

	/**
	 * @override
	 */
	negative() {
		if (isAmputee(this.slave)) {
			return ["feet, legs, arms"];
		}
		return [];
	}
};
