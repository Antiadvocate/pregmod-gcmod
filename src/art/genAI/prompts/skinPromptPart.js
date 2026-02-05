App.Art.GenAI.SkinPromptPart = class SkinPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let skinDesc = [];

		// Albinism takes full priority
		if (this.slave.geneticQuirks.albinism === 2) {
			skinDesc.push("albino");
		// Furry races override standard skin
		} else if (this.slave.race === "catgirl") {
			skinDesc.push(`covered in ${this.slave.skin} fur`);
		// Otherwise, determine based on skin tone
		} else {
			switch (this.slave.skin) {
				case "pure white":
				case "ivory":
				case "white":
				case "extremely fair":
					skinDesc.push("white fur");
					break;
				case "extremely pale":
				case "very pale":
				case "pale":
				case "light beige":
				case "very fair":
					skinDesc.push("white fur");
					break;
				case "fair":
				case "light":
				case "beige":
					skinDesc.push("fair fur");
					break;
				case "light olive":
				case "sun tanned":
				case "spray tanned":
				case "tan":
					skinDesc.push("tan fur");
					break;
				case "olive":
				case "bronze":
				case "dark beige":
					skinDesc.push(this.helper.isXLOrPony() ? "olive fur" : "tan fur");
					break;
				case "dark olive":
				case "light brown":
				case "brown":
					skinDesc.push(this.helper.isXLBased() ? "brown fur" : "tan fur");
					break;
				case "dark":
				case "dark brown":
				case "black":
				case "ebony":
					skinDesc.push(this.helper.lora("melanin", 0.8, ", melanin, ") + "dark gray fur");
					break;
				case "pure black":
					skinDesc.push(this.helper.lora("melanin", 1, ", melanin, ") + "black fur");
					break;
				default:
					skinDesc.push(`${this.slave.skin} fur`);
			}
		}

		// ─── MARKINGS ───
		const marking = this.slave.markings?.toLowerCase?.();
		if (marking && marking !== "none") {
			if (marking === "beauty mark") {
				skinDesc.push("small beauty mark");
			} else if (marking === "birthmark") {
				skinDesc.push("a subtle birthmark");
			} else if (marking === "freckles") {
				skinDesc.push("light freckles across her fur");
			} else if (marking === "heavily freckled") {
				skinDesc.push("heavily freckled fur");
			} else {
				skinDesc.push(`with body markings: ${marking}`);
			}
		}

		return skinDesc;
	}

	/**
	 * @override
	 */
	negative() {
		if (this.helper.isXLBased()) {
			if (this.positive()?.includes("tan fur")) {
				return ["tan lines"];
			}
			return [];
		}
		switch (this.slave.skin) {
			case "pure white":
			case "ivory":
			case "white":
			case "extremely pale":
			case "very pale":
			case "pale":
			case "extremely fair":
			case "very fair":
			case "fair":
			case "light":
			case "light olive":
				return ["dark fur"];
			case "sun tanned":
			case "spray tanned":
			case "tan":
			case "olive":
				return ["black fur"];
			case "bronze":
			case "dark olive":
			case "dark":
			case "light beige":
			case "beige":
			case "dark beige":
			case "light brown":
			case "brown":
			case "dark brown":
			case "black":
			case "ebony":
			case "pure black":
				return ["light fur"];
		}
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
