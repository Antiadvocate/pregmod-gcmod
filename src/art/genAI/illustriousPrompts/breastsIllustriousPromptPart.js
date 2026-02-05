App.Art.GenAI.Ill.BreastsPromptPart = class BreastsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @returns {Array<string>}
	 * @private
	 */
	_breastPrompt() {
		if (this.censored) {
			return [];
		}

		let breastDescriptors = [];

		let {boobs, boobShape} = this.slave;
		let boobShapeString = boobShape.toLowerCase();

		/**
		 * @type {FC.BreastShape} breast shape
		 * * "normal"
		 * * "perky"
		 * * "saggy"
		 * * "torpedo-shaped"
		 * * "downward-facing"
		 * * "wide-set"
		 * * "spherical"
		 */
		if (boobShapeString && boobShapeString !== "normal") {
			switch (boobShapeString) {
				case "perky":
					breastDescriptors.push("perky breasts");
					break;
				case "saggy":
				case "downward-facing":
					breastDescriptors.push("sagging breasts");
					break;
				case "torpedo-shaped":
					breastDescriptors.push("pointy breasts");
					break;
				case "wide-set":
					breastDescriptors.push("breasts apart");
					break;
				case "spherical":
					// in negative prompt
					break;
				default:
					break;
			}
		}

		/**
		 * @type {number} Their boob size (in cc)
		 * * 0-299	- flat;
		 * * 300-399   - A-cup;
		 * * 400-499   - B-cup
		 * * 500-649   - C-cup
		 * * 650-799   - D-cup
		 * * 800-999   - DD-cup
		 * * 1000-1199 - F-cup
		 * * 1200-1399 - G-cup
		 * * 1400-1599 - H-cup
		 * * 1600-1799 - I-cup
		 * * 1800-2049 - J-cup
		 * * 2050-2299 - K-cup
		 * * 2300-2599 - L-cup
		 * * 2600-2899 - M-cup
		 * * 2900-3249 - N-cup
		 * * 3250-3599 - O-cup
		 * * 3600-3949 - P-cup
		 * * 3950-4299 - Q-cup
		 * * 4300-4699 - R-cup
		 * * 4700-5099 - S-cup
		 * * 5100-5499 - T-cup
		 * * 5500-6499 - U-cup
		 * * 6500-6999 - V-cup
		 * * 7000-7499 - X-cup
		 * * 7500-7999 - Y-cup
		 * * 8000-8499 - Z-cup
		 * * 8500-14999 - obscenely massive
		 * * 15000-24999 - arm filling
		 * * 25000-39999 - figure dominating
		 * * 40000-54999 - beanbag sized
		 * * 55000-69999 - door jamming
		 * * 70000-89999 - hall clearing
		 * * 90000-100000 - hall jamming
		 */
		if (boobs < 300) {
			breastDescriptors.push("flat chest");
		} else if (boobs < 500) {
			breastDescriptors.push("small breasts");
		} else if (boobs < 800) {
			breastDescriptors.push("medium breasts");
		} else if (boobs < 1400) {
			breastDescriptors.push("large breasts");
		} else if (boobs < 3600) {
			breastDescriptors.push("huge breasts");
		} else if (boobs < 8500) {
			breastDescriptors.push("gigantic breasts");
		} else if (boobs < 15000) {
			breastDescriptors.push("(gigantic breasts)");
		} else if (boobs < 25000) {
			breastDescriptors.push("(gigantic breasts:1.2)");
		} else if (boobs < 40000) {
			breastDescriptors.push("(gigantic breasts:1.3)");
		} else if (boobs < 55000) {
			breastDescriptors.push("(gigantic breasts:1.5)");
		} else if (boobs < 70000) {
			breastDescriptors.push("(gigantic breasts:1.7)");
		} else {
			breastDescriptors.push("(gigantic breasts:1.9)");
		}

		if (boobs >= 8500) {
			breastDescriptors.push("inconvenient breasts");
		}

		return breastDescriptors;
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
				case "asian":
					return "light";
				case "middle eastern":
				case "malay":
				case "southern european":
				case "indo-aryan":
				case "pacific islander":
				case "mixed race":
					return "dark";
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
				case "asian":
					return "light";
				case "middle eastern":
				case "malay":
				case "southern european":
				case "indo-aryan":
				case "pacific islander":
				case "mixed race":
					return "dark";
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
					return "light";
				case "asian":
					return "dark";
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
					return "light";
				case "asian":
				case "middle eastern":
				case "malay":
				case "southern european":
				case "indo-aryan":
				case "pacific islander":
				case "mixed race":
					return "dark";
			}
		}

		if ([
			"brown",
			"dark brown",
			"black",
		].includes(skin)) {
			return "dark";
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

		// areolaeShape: "heart"|"star"|"circle"
		if (areolaeShape && areolaeShape !== "circle") {
			// TODO: Not doable with Illustrious, maybe lora?
			// areolaDescriptors.push(areolaeShape);
		}

		switch (areolae) {
			case 0: {
				break;
			}
			case 1:
			case 2: {
				areolaDescriptors.push("large areolae");
				break;
			}
			case 3:
			case 4: {
				areolaDescriptors.push("(large areolae)");
				break;
			}
		}

		const nippleAreolaColor = this._colorMatcher();

		let nippleDescriptors = [`${nippleAreolaColor} nipples`];

		/**
		 * @type {FC.NippleShape} nipple shape
		 * * "huge"
		 * * "puffy"
		 * * "inverted"
		 * * "tiny"
		 * * "cute"
		 * * "partially inverted"
		 * * "fuckable"
		 * * "flat"
		 */
		if (nipples) {
			switch (nipples) {
				case "huge":
				case "puffy":
				case "flat":
					nippleDescriptors.push(`${nipples} nipples`);
					break;
				case "inverted":
				case "partially inverted":
					nippleDescriptors.push("inverted nipples");
					break;
				case "fuckable":
					nippleDescriptors.push("nipple gape, inverted nipples");
					break;
				case "tiny":
				case "cute":
					nippleDescriptors.push("small nipples");
					break;
			}
		}

		return [...nippleDescriptors, ...areolaDescriptors];
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
		let prompt = [];
		if (this.slave.boobShape === "spherical") {
			prompt.push("breasts apart, sagging breasts");
		}

		if (this.censored) {
			prompt.push("bare breasts, (nipples:1.1), areola, exposed chest");
		}

		return prompt;
	}
};
