// cSpell: ignore derpibooru

App.Art.GenAI.Ill.StylePromptPart = class StylePromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let prompts = ["masterpiece, best quality, amazing quality"];
		// Check if filter is on and needed, then pick model-appropriate framing tags.
		if (this.censored) {
			prompts.push("general");
		}

		prompts.push("full body, full-length portrait");

		switch (V.aiStyle) {
			case 0: //	Custom Style
				return [V.aiCustomStylePos];
			case 1: // Photorealistic
				return [...prompts, "realistic"];
			case 2: //	Anime/Hentai
				return [...prompts, "anime"];
			case 3: // No extra styling
			default:
				return prompts;
		}
	}

	/**
	 * @override
	 */
	negative() {
		let prompts = [];
		if (this.censored) {
			prompts.push("nsfw, nude");
		} else {
			prompts.push("censored");
		}

		if (V.aiStyle === 0) {
			return [...prompts, V.aiCustomStyleNeg];
		}

		let defaultPrompt = "bad quality, worst quality, worst detail, sketch, watermark, breath, from below";
		return [defaultPrompt, ...prompts];
	}

	/**
	 * @override
	 */
	face() {
		switch (V.aiStyle) {
			case 0: //	Custom Style
				return [V.aiCustomStylePos];
			case 1: // Photorealistic
				return ["photorealistic"];
			case 2: //	Anime/Hentai
				return ["masterpiece, best quality, anime"];
			case 3: // None
				return [];
		}
	}
};
