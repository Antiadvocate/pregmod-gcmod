App.Art.GenAI.Ill.EarsPromptPart = class EarsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.slave.faceAccessory === "cat ears") {
			return [`cat ears hairband`];
		}

		const parts = [];
		if (this.slave.earT !== "none" && this.slave.earT !== "normal") {
			parts.push(`${this.slave.earT} ears`);
		}

		switch (this.slave.earShape) {
			case "bird":
				parts.push("bird ears");
				break;
			case "cow": case "deer": case "robot": case "sheep":
				// TODO: "deer" and "sheep" need LoRAs since the model adds deer/sheep horns and negative prompting doesn't remove them
				parts.push(`${this.slave.earShape} ears`);
				break;
			case "damaged":
				if (this.slave.earT !== "none") {
					parts.push(`cut human ear`);
				} else {
					parts.push(`cut ear`);
				}
				break;
			case "dragon":
				parts.push("dragon ears");
				break; // TODO: needs a lora
			case "elven": case "pointy":
				parts.push(`pointy ears`);
				break;
			case "gazelle":
				parts.push(`gazelle ears`);
				break; // TODO: needs a lora for reliable results
			case "holes":
				break; // TODO: will need a lora
			case "none":
				break; // TODO: currently handled in negative prompt, but that doesn't work very reliably. We need a lora
			case "normal":
				break;
			case "orcish":
				parts.push("orc ears");
				break; // TODO: nees a lora; model attempts to make an orc; adding orc to negatives makes the model remove the ears
		}

		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		const parts = [];
		if (this.slave.tail === "none") {
			parts.push(`tail`); // animal ears bleed into tail
		}

		switch (this.slave.earShape) {
			case "bird":
				parts.push("(wings)");	// prompt for bird ear cause wings to be drawn
				break;
			case "cow": case "deer": case "robot": case "sheep":
				if (this.slave.horn === "none") {
					parts.push("cow horns");
				}
				break;
			case "damaged":
				break;
			case "dragon":
				if (this.slave.horn === "none") {
					parts.push("dragon horns");
				}
				break;
			case "elven": case "pointy":
				break;
			case "gazelle":
				if (this.slave.horn === "none") {
					parts.push("gazelle horns");
				}
				break;
			case "holes":
			case "none":
			case "normal":
			case "orcish":
				break; // TODO: nees a lora; model attempts to make an orc; adding orc to negatives makes the model remove the ears
		}

		if (this.slave.earT === "none" && this.slave.earShape === "none") {
			parts.push(`ear`, `ears`);
		}
		return parts;
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
