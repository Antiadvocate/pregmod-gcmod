
App.Art.GenAI.BreastsPromptPart = class BreastsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @returns {Array<string>}
	 * @private
	 */
	_breastPrompt() {
		if (this.censored) {
			return [];
		}
		let breastWord = "breasts";

		let breastDescriptors = [];

		let {boobs, boobShape} = this.slave;
		// @ts-ignore
		boobShape = boobShape.toLowerCase();

		if (boobShape && boobShape !== "normal") {
			breastDescriptors.push(boobShape);
		}

		if (boobs < 300) {
			breastDescriptors.push("flat");
			breastWord = this.helper.isPony() ? "chested" : "chest";
		} else if (boobs < 400) {
			breastDescriptors.push("very small");
		} else if (boobs < 500) {
			breastDescriptors.push("small");
		} else if (boobs < 650) {
			breastDescriptors.push("medium");
		} else if (boobs < 800) {
			breastDescriptors.push("large");
		} else if (boobs < 1000) {
			breastDescriptors.push("very large");
		} else if (boobs < 1400) {
			breastDescriptors.push("huge");
		} else if (this.helper.isPony()) {
			if (boobs < 1600) {
				breastDescriptors.push("gigantic");
			} else {
				breastDescriptors.push("hyper");
			}
		} else {
			if (this.helper.hasLora("BEReaction")) {
				return [this.helper.lora("BEReaction", 1, ", bereaction, breast expansion, (gigantic breasts:1.2)")];
			} else {
				if (boobs < 1600) {
					breastDescriptors.push("very huge");
				} else if (boobs < 1800) {
					breastDescriptors.push("enormous");
				} else if (boobs < 2050) {
					breastDescriptors.push("extremely enormous");
				} else if (boobs < 2600) {
					breastDescriptors.push("massive");
				} else if (boobs < 2900) {
					breastDescriptors.push("extremely massive");
				} else {
					breastDescriptors.push("unbelievably massive");
				}
			}
		}

		breastDescriptors.push(breastWord);

		return [breastDescriptors.join(" ")];
	}

	_colorMatcher() {
		const {race, skin} = this.slave;

		/*
         * --RACES--
         * white
         * black
         * latina
         * asian
         * middle eastern
         * amerindian
         * southern european
         * semitic
         * malay
         * indo-aryan
         * pacific islander
         * mixed race
         */

		// TODO: Mixed race should maybe consider nationality but that's a PITA

		if ([
			"pure white",
			"ivory",
			"white",
		].includes(skin)) {
			return "pale pink";
		}

		if ([
			"extremely pale",
			"very pale",
			"pale",
		].includes(skin)) {
			switch (race) {
				case "white":
				case "amerindian":
				case "semitic":
				case "latina":
					return "light pink";
				case "asian":
					return "dusty rose";
				case "middle eastern":
				case "malay":
				case "southern european":
				case "indo-aryan":
				case "pacific islander":
				case "mixed race":
					return "light beige";
			}
		}

		if ([
			"extremely fair",
			"very fair",
			"fair",
			"light",
			"light olive",
		].includes(skin)) {
			switch (race) {
				case "white":
				case "amerindian":
				case "semitic":
				case "latina":
					return "pink";
				case "asian":
					return "rose colored";
				case "middle eastern":
				case "malay":
				case "southern european":
				case "indo-aryan":
				case "pacific islander":
				case "mixed race":
					return "light brown";
			}
		}

		if ([
			"sun tanned",
			"spray tanned",
			"tan",
			"olive",
			"bronze",
			"dark olive",
		].includes(skin)) {
			switch (race) {
				case "white":
				case "amerindian":
				case "semitic":
				case "latina":
					return "dark pink";
				case "asian":
					return "light brown";
				case "middle eastern":
				case "malay":
				case "southern european":
				case "indo-aryan":
				case "pacific islander":
				case "mixed race":
					return "brown";
			}
		}

		if ([
			"dark",
			"light beige",
			"beige",
			"dark beige",
			"light brown",
		].includes(skin)) {
			switch (race) {
				case "white":
				case "amerindian":
				case "semitic":
				case "latina":
					return "light brown";
				case "asian":
					return "brown";
				case "middle eastern":
				case "malay":
				case "southern european":
				case "indo-aryan":
				case "pacific islander":
				case "mixed race":
					return "dark brown";
			}
		}

		if ([
			"brown",
			"dark brown",
			"black",
		].includes(skin)) {
			switch (race) {
				case "white":
				case "amerindian":
				case "semitic":
				case "latina":
					return "brown";
				case "asian":
					return "dark brown";
				case "middle eastern":
				case "malay":
				case "southern european":
				case "indo-aryan":
				case "pacific islander":
				case "mixed race":
					return "very dark brown";
			}
		}

		if ([
			"ebony",
			"pure black",
		].includes(skin)) {
			return "black";
		}
	}

	/**
	 * @returns {Array<string>}
	 * @private
	 */
	_nippleAreolaPrompt() {
		if (this.censored) {
			return [];
		}

		const exposesNipples = this.helper.exposesNipples(this.slave.clothes);
		if (!exposesNipples) {
			return [];
		}

		let {areolae, areolaeShape, nipples} = this.slave;
		// @ts-ignore
		areolaeShape = areolaeShape.toLowerCase();

		let areolaDescriptors = [];

		if (areolaeShape && areolaeShape !== "circle") {
			areolaDescriptors.push(areolaeShape);
		}

		switch (areolae) {
			case 0: break;
			case 1: areolaDescriptors.push("big"); break;
			case 2: areolaDescriptors.push("large"); break;
			case 3: areolaDescriptors.push("huge"); break;
			case 4: areolaDescriptors.push("massive"); break;
		}

		const nippleAreolaColor = this._colorMatcher();

		areolaDescriptors.push("areola");

		let nippleDescriptors = [nippleAreolaColor, "nipples"];

		if (nipples) {
			nippleDescriptors.unshift(nipples);
		}

		return [nippleDescriptors.join(" "), areolaDescriptors.join(" ")];
	}

	/**
	 * @override
	 */
	positive() {
		const breastDescriptor = this._breastPrompt();
		const nippleDescriptor = this._nippleAreolaPrompt();
		return [...breastDescriptor, ...nippleDescriptor];
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.boobs < 300) {
			return [`medium breasts, large breasts, huge breasts${this.censored ? ", bare breasts, (nipples:1.1), areola, exposed chest" : ""}`];
		} else if (this.slave.boobs < 650) {
			return this.censored ? ["bare breasts, (nipples:1.1), areola, exposed chest"] : [];
		} else {
			return [`small breasts, flat chest${this.censored ? ", bare breasts, (nipples:1.3), areola, exposed chest" : ""}`];
		}
	}
};
