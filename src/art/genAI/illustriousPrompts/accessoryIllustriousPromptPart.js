App.Art.GenAI.Ill.AccessoryPromptPart = class AccessoryPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let accessories = [];

		switch (this.slave.armAccessory) {
			case "none":
				break;
			case "hand gloves":
				accessories.push("gloves");
				break;
			case "elbow gloves":
				accessories.push("elbow gloves");
				break;
			default:
				accessories.push(this.slave.armAccessory);
				break;
		}

		if (this.helper.exposesLegs(this.slave.clothes)) {
			switch (this.slave.legAccessory) {
				case "none":
					accessories.push("bare legs");
					if (this.slave.shoes === "none") {
						accessories.push("");
					} else {
						accessories.push("");
					}
					break;
				case "short stockings":
					accessories.push("kneehighs");
					break;
				case "long stockings":
					accessories.push("thighhighs");
					break;
				default:
					accessories.push(this.slave.legAccessory);
					break;
			}
		} else {
			switch (this.slave.legAccessory) {
				case "none":
					if (this.slave.shoes === "none") {
						accessories.push("");
					} else {
						accessories.push("");
					}
					break;
				case "short stockings":
				case "long stockings":
					accessories.push("socks");
					break;
				default:
					accessories.push(this.slave.legAccessory);
					break;
			}
		}

		switch (this.slave.bellyAccessory) {
			case "none":
				break;
			case "a small empathy belly":
				accessories.push("belly");
				break;
			case "a medium empathy belly":
				accessories.push("implied pregnancy");
				break;
			case "a large empathy belly":
				accessories.push("pregnant");
				break;
			case "a huge empathy belly":
				accessories.push("pregnant", "hyper pregnancy");
				break;
			case "a corset":
			case "an extreme corset":
				accessories.push("corset");
				break;
			case "a support band":
				accessories.push("belly belt");
				break;
			default:
				accessories.push(this.slave.bellyAccessory);
		}

		if (this.slave.buttplugAttachment !== "none") {
			accessories.push(this.slave.buttplugAttachment);
		}

		if (this.slave.vaginalAccessory.includes("vibrator") ||
			this.slave.vaginalAttachment.includes("vibrator") ||
			this.slave.dickAccessory.includes("vibrator")) {
			accessories.push("vibrator in thigh strap");
		}

		switch (this.slave.shoes) {
			case "none":
				accessories.push("");
				break;
			case "heels":
			case "extreme heels":
				accessories.push("high heels");
				break;
			case "pumps":
				accessories.push("pumps");
				break;
			case "flats":
				accessories.push("flats shoes");
				break;
			case "boots":
				accessories.push("thigh boots");
				break;
			case "platform heels":
			case "extreme platform heels":
				accessories.push("platform heels");
				break;
			case "platform shoes":
				accessories.push("platform boots", "thigh boots");
				break;
		}

		if (this.slave.mouthAccessory !== "none") {
			accessories.push(this.slave.mouthAccessory, "gagged", "saliva");
		}

		return accessories;

		// if (this.slave.eyewear.includes("glasses")) {
		// 	return 'clear glasses';
		// }
		// return undefined;
	}

	/**
	 * @override
	 */
	negative() {
		let parts = [];
		switch (this.slave.armAccessory) {
			case "none":
				parts.push("gloves");
				break;
			case "hand gloves":
				parts.push("elbow gloves");
				break;
			case "elbow gloves":
			default:
				break;
		}

		return parts;
	}

	/**
	 * @override
	 */
	face() {
		const parts = [];
		if (this.slave.eyewear.includes("glasses")) {
			parts.push('glasses');
		}
		return parts;
	}
};
