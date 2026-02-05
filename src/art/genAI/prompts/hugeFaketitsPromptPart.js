App.Art.GenAI.HugeFakeTitsPromptPart = class HugeFakeTitsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.censored){
			return [];
		}
		if (this.helper.hasLora("hugefaketits1") && this.slave.boobsImplant !== 0) {
			const ImplantPercentage = this.slave.boobsImplant / (this.slave.boobs - this.slave.boobsImplant);
			if (ImplantPercentage > 0.2) {
				return [this.helper.lora("hugefaketits1", Math.clamp(ImplantPercentage / 2, 0.1, 0.5))];
			}
		}
		return [];
	}
};
