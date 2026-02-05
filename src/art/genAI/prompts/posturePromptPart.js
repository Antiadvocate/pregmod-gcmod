App.Art.GenAI.PosturePromptPart = class PosturePromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const slave = asSlave(this.slave);
		const customPrompt = slave?.custom?.aiPrompts?.pose;
		if (customPrompt) {
			return [customPrompt];
		}

		const parts = [];

		if (isAmputee(this.slave)) {
			parts.push(`sitting in chair`); // posture change prevents genning arms/legs, looks more natural
		} else if (slave?.fuckdoll !== 0) {
			if (this.helper.hasLora("Standing Straight v1 - locon 32dim") && !V.aiOpenPose) { // always prefer OpenPose over lora; less side effects
				parts.push(this.helper.lora("Standing Straight v1 - locon 32dim", 1));
			}
			parts.push(`standing straight`);
		} else if (isQuadrupedal(this.slave)) {
			parts.push(`on all fours`);
		} else if (canStand(this.slave)) {
			parts.push(`standing`);
		} else {
			parts.push(`kneeling`);
		}

		if (!isAmputee(this.slave) && !isQuadrupedal(this.slave)) { // no arms pose for amputees and quadrupeds
			if (this.slave.devotion < -50) {
				parts.push(`from side, arms crossed`);
			} else if (this.slave.devotion < -20) {
				parts.push(`arms crossed`);
			} else if (this.slave.devotion < 21) {
				// parts.push(`standing`);
			} else {
				parts.push(`arms behind back, from front`);
			}
		}

		if (slave?.fuckdoll !== 0) {
			// trustPart = ``;
		} else if (slave?.trust < -50) {
			parts.push(`trembling, head down`);
		} else if (slave?.trust < -20) {
			parts.push(`trembling`);
		}

		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		if (asSlave(this.slave)?.custom?.aiPrompts?.pose) {
			return [];
		}

		if (isAmputee(this.slave) || !canWalk(this.slave)) {
			return [];
		} else {
			return ["from above"];
		}
	}
};
