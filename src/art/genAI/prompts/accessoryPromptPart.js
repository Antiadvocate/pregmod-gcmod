App.Art.GenAI.AccessoryPromptPart = class AccessoryPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
	/* 	let accessories = [];

		if (this.slave.armAccessory !== "none") {
			accessories.push(this.slave.armAccessory);
		}

		if (this.slave.legAccessory !== "none") {
			accessories.push(this.slave.legAccessory);
		}

		if (this.slave.bellyAccessory !== "none") {
			accessories.push(this.slave.bellyAccessory);
		}

		if (this.slave.buttplugAttachment !== "none") {
			accessories.push(this.slave.buttplugAttachment);
		}

		switch (this.slave.shoes) {
			case "none":
				accessories.push("bare feet");
				break;
			case "heels":
			case "extreme heels":
				accessories.push("high heels");
				break;
			case "pumps":
			case "flats":
				accessories.push("(female pumps shoes)");
				break;
			case "boots":
				accessories.push("high heeled knee boots");
				break;
			case "platform heels":
			case "extreme platform heels":
				accessories.push("platform heels");
				break;
			case "platform shoes":
				accessories.push("high heeled platform knee boots");
				break;

		return accessories.join(', '); */

		if (this.slave.eyewear.includes("glasses")) {
			return ['clear glasses'];
		}
		return [];
	}

	/**
	 * @override
	 */
	face() {
		const parts = [];
		if (this.slave.eyewear.includes("glasses")) {
			parts.push('clear glasses');
		}
		return parts;
	}
};
