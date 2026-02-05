App.Art.GenAI.AmputationPromptPart = class AmputationPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (isAmputee(this.slave)) {
			if (!this.helper.isXLBased()) {
				return [this.helper.lora("amputee-000003", 1)];
			} else if (this.helper.isPony()) {
				return [this.helper.lora("amputee_XL_pony", 0.75)];
			}
		}
	}

	/**
	 * @override
	 */
	negative() {
		if (isAmputee(this.slave) && this.helper.hasLora("amputee-000003")) {
			return []; // Space for negative prompt if needed NG
		}
		return [];
	}
};
