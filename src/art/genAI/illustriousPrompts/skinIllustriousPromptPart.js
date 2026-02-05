App.Art.GenAI.Ill.SkinPromptPart = class SkinPromptPart extends App.Art.GenAI.PromptPart {
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
			skinDesc.push(`${this.slave.skin} fur`);
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
					skinDesc.push("light fur");
					break;
				case "fair":
				case "light":
				case "beige":
					skinDesc.push("light fur");
					break;
				case "sun tanned":
				case "tan":
					skinDesc.push("light fur, tan, tanlines");
					break;
				case "light olive":
				case "spray tanned":
					skinDesc.push("tan fur");
					break;
				case "olive":
				case "bronze":
				case "dark beige":
				case "dark olive":
				case "light brown":
				case "brown":
					skinDesc.push("light brown fur");
					break;
				case "dark":
				case "dark brown":
				case "black":
				case "ebony":
					skinDesc.push("dark fur");
					break;
				case "pure black":
					skinDesc.push("black fur");
					break;
				default:
					skinDesc.push(`${this.slave.skin} fur`);
			}
		}

		// ─── MARKINGS ───
		const marking = this.slave.markings?.toLowerCase?.();
		if (marking && marking !== "none") {
			if (marking === "beauty mark") {
				skinDesc.push("mole under eye");
			} else if (marking === "birthmark") {
				skinDesc.push("birthmark");
			} else if (marking === "freckles") {
				skinDesc.push("freckles");
			} else if (marking === "heavily freckled") {
				skinDesc.push("heavily freckles");
			} else {
				skinDesc.push(`body markings, ${marking}`);
			}
		}

		return skinDesc;
	}

	/**
	 * @override
	 */
	negative() {
		if (this.helper.isXLBased()) {
			if (this.positive()?.includes("tan skin")) {
				return ["tan lines"];
			}
			return [];
		}
		switch (this.slave.skin) {
			case "pure white":
			case "ivory":
			case "white":
			case "extremely fair":
			case "extremely pale":
			case "very pale":
			case "pale":
			case "light beige":
			case "very fair":
				return ["dark fur"];
			case "fair":
			case "light":
			case "beige":
				return [];
			case "sun tanned":
			case "tan":
				return [];
			case "light olive":
			case "spray tanned":
			case "olive":
			case "bronze":
			case "dark beige":
			case "dark olive":
			case "light brown":
			case "brown":
			case "dark":
			case "dark brown":
			case "black":
			case "ebony":
			case "pure black":
			default:
				return ["tanlines"];
		}
	}
};
