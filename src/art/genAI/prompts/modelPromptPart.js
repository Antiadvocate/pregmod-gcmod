/**
 * Misc prompts that are dependent on the model
 */
App.Art.GenAI.ModelPromptPart = class ModelPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (V.aiUserInterface === 0 && this.helper.isXL() && this.options.willRunFaceReplacer) {
			return this.helper.lora("ip-adapter-faceid-plusv2_sdxl_lora", 0.8);
		}

		return undefined;
	}

	/**
	 * @override
	 */
	negative() {
		return undefined;
	}
};
