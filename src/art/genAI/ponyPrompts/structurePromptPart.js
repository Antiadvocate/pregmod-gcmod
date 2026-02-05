App.Art.GenAI.StructurePromptPart = class StructurePromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		// define stance and image composition

		const slave = asSlave(this.slave);
		const customPrompt = slave?.custom?.aiPrompts?.pose;

		const parts = [];

		parts.push('portrait, solo'); // portrait structure prompt may become unnecessary once rest of body part prompts are in?

		if (customPrompt) {
			parts.push(customPrompt);
			return parts.join(', ');
		}

		if (isQuadrupedal(this.slave)) {
			return 'all fours'; // too hard to do anything else with this stance
		} else if (canStand(this.slave)) {
			parts.push('standing');

			if (slave?.trust < -20) {
				parts.push('look away, look down');
			} else if (slave?.devotion < -20) {
				parts.push('defiant, head up');
			}
		} else {
			parts.push('kneeling');

			if ((slave?.trust < -20) && (slave?.devotion < 51)) {
				parts.push('look down, bowing');
			} else if (slave?.devotion > 95) {
				parts.push('from side, look up');
			}
		}

		if (V.arcologies[0] && (V.arcologies[0].FSChattelReligionist > 0) && (slave?.devotion > 95)) {
			parts.push('praying');
		} else if ((slave?.need > 100) && (slave?.fetishKnown === 1) && (slave?.fetishStrength > 60)) {
			switch (slave?.fetish) {
				case "boobs":
					parts.push('holding breasts');
					break;
				case "pregnancy":
					parts.push('holding waist');
					break;
				case "cumslut":
					parts.push('holding mouth');
					break;
				case "buttslut":
					parts.push('holding ass');
					break;
				case "dom":
					parts.push('hands on hips');
					break;
			}
		}

		return parts;
	}
};
