App.Art.GenAI.EyePromptPart = class EyePromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const positive = [];
		const slave = asSlave(this.slave);
		if (slave?.fuckdoll > 0) {
			return []; // eyes are not visible behind fuckdoll mask
		} else if (hasBothEyes(this.slave)) {
			positive.push(this.helper.lora("Loraeyes_V1"));
			if (!canSee(this.slave) && this.helper.hasLora("eye-allsclera")) {
				positive.push(this.helper.lora("eye-allsclera", 1));
			} else if (this.slave.eye.left.iris === this.slave.eye.right.iris) {
				if (this.slave.eye.left.sclera !== "white") {
					positive.push(`${this.slave.eye.left.iris} eyes, ${this.slave.eye.left.sclera} sclera`);
				} else {
					positive.push(`${this.slave.eye.left.iris} eyes` );
				}
				switch (this.slave.eye.left.sclera) {
					case "catlike": case "demonic": case "devilish": case "serpent-like":
						positive.push("slit pupils");
						break;
					case "goat-like":
						positive.push("horizontal pupils"); // Probably won't do anything, even on Pony;
						break;
					case "heart-shaped":
						positive.push("<3 eyes");
						break;
					case "hypnotic":
						positive.push("spiral eyes");
						break;
					case "vacant":
						positive.push("blank eyes");
						break;
				}
			} else {
				positive.push(`heterochromia, ${this.slave.eye.left.iris} left eye, ${this.slave.eye.right.iris} right eye`);
			}
		} else if (hasLeftEye(this.slave)) { // one-eyed prompts don't seem to work well regardless of wording (no/empty/missing/etc)
			positive.push(`no right eye, ${this.slave.eye.left.iris} left eye`);
		} else if (hasRightEye(this.slave)) {
			positive.push(`no left eye, ${this.slave.eye.right.iris} right eye`);
		} else {
			positive.push(`closed eyes`);
		}
		if (this.slave.eyewear === "corrective glasses" || this.slave.eyewear === "blurring glasses" || this.slave.eyewear === "glasses"){
			positive.push(`glasses`);
		}
		return positive;
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
