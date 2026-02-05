// cSpell: ignore derpibooru

App.Art.GenAI.StylePromptPart = class StylePromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let parts = [];
		if (this.helper.isPony()) {
			// this is a negative LoRA but it has to go in the positive prompt to be loaded
			parts.push(this.helper.lora("badanatomy_SDXL_negative_LORA_AutismMix_v1", -0.2, " "));
		}
		// Check if filter is on and needed, then pick model-appropriate framing tags.
		if (this.censored) {
			if (this.helper.isPony()) {
				parts.push("front view, half-length portrait");
			} else {
				parts.push("straight-on, cowboy shot");
			}
			parts.push("face focus");
		} else {
			if (this.helper.isPony()) {
				parts.push("full-length portrait");
			} else {
				parts.push("full body, portrait");
			}
		}
		switch (V.aiStyle) {
			case 0: //	Custom Style
				return [V.aiCustomStylePos];
			case 1: // Photorealistic
				if (this.helper.isPony()) {
					parts.push("score_9, score_8_up, score_7_up");
				}
				return [...parts, "photorealistic, dark theme, black background"];
			case 2: //	Anime/Hentai
				if (this.helper.isXL()) {
					return [...parts, "masterpiece, best quality"]; // SDXL gets flat when asked for 2d or anime, and gets old looking when asked for hentai
				} else if (this.helper.isPony()) {
					return [...parts, "score_9, score_8_up, score_7_up, source_anime, source_cartoon"]; // Pony does better with scoring; `source_anime, source_cartoon` is much better than `2d, anime, hentai`
				}
				return [...parts, "2d, anime, hentai"];
			case 3: // No extra styling
				return parts;
		}
	}

	/**
	 * @override
	 */
	negative() {
		let parts = [];
		if (V.aiStyle !== 0) {
			parts.push("text, watermark, low quality, censored, mosaic_censoring, bar_censor, lowres, bad anatomy, bad hands");
			if (this.helper.isPony()) {
				parts.push("score_4, score_5, score_6, source_pony, derpibooru_p_low");
			}
		}
		if (this.censored) {
			parts.push("NSFW, nude");
			if (this.helper.isPony()) {
				parts.push("full-length portrait");
			} else {
				parts.push("full body");
			}
		} else {
			parts.push("close-up");
			if (this.helper.isPony()) {
				parts.push("half-length portrait");
			} else {
				parts.push("cowboy shot");
			}
		}
		switch (V.aiStyle) {
			case 0: // Custom Style
				return [...parts, V.aiCustomStyleNeg];
			case 1: // Photorealistic
				if (this.helper.isPony()) {
					parts.push("source_anime, source_cartoon");
				}
				return [...parts, "greyscale, monochrome, cg, render"];
			case 2: // Anime/Hentai
				if (this.helper.isXL()) {
					parts.push("worst quality, low quality");
				}
				return [...parts, "greyscale, monochrome, photography, 3d render, speech bubble"];
			case 3: // None
				return parts;
		}
	}

	/**
	 * @override
	 */
	face() {
		switch (V.aiStyle) {
			case 0: //	Custom Style
				return [V.aiCustomStylePos];
			case 1: // Photorealistic
				return ["photorealistic, dark theme, black background"];
			case 2: //	Anime/Hentai
				if (this.helper.isXL()) {
					return ["masterpiece, best quality"];
				} else if (this.helper.isPony()) {
					return ["score_9, score_8_up, score_7_up, score_6_up, source_anime, source_cartoon"];
				}
				return ["2d, anime, hentai"];
			case 3: // None
				return [];
		}
	}
};
