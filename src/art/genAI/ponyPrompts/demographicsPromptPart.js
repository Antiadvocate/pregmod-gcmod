App.Art.GenAI.DemographicsPromptPart = class DemographicsPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const slave = asSlave(this.slave);
		const parts = [];

		// height, age, gender
		let height = '';

		if (slave?.height < 150) {
			height = 'short ';
		} else if (slave?.height > 180) {
			height = 'tall ';
		}

		if (this.isFeminine) {
			if ((slave?.visualAge < 16) && !V.aiAgeFilter) {
				parts.push(height + 'young girl', 'loli');
			} else if (slave?.visualAge < 18 && !V.aiAgeFilter) {
				parts.push(height + 'young woman', 'teenager');
			} else if (slave?.visualAge <= 20) {
				parts.push(height + 'young woman');
			} else if (slave?.visualAge <= 40) {
				parts.push(height + 'woman');
			} else if (slave?.visualAge >= 40) {
				parts.push(height + 'mature');
			}

			if (perceivedGender(this.slave) < -1) {
				parts.push('butch');
			}

			if (this.slave.race === "catgirl") {
				parts.push("catgirl");
			}
		} else if (this.isMasculine) {
			if ((slave?.visualAge < 16) && !V.aiAgeFilter) {
				parts.push(height + 'young boy', 'shota');
			} else if (slave?.visualAge < 18 && !V.aiAgeFilter) {
				parts.push(height + 'young man', 'teenager');
			} else if (slave?.visualAge <= 20) {
				parts.push(height + 'young man');
			} else if (slave?.visualAge <= 40) {
				parts.push(height + 'man');
			} else if (slave?.visualAge >= 40) {
				parts.push(height + 'older man');
			}

			if (perceivedGender(this.slave) > 1) {
				parts.push('feminine');
			}

			if (this.slave.race === "catgirl") {
				parts.push("catboy");
			}
		} else {
			if (this.slave.race === "catgirl") {
				parts.push("catperson");
			}
		}

		if ((slave?.visualAge < 10) && !V.aiAgeFilter) {
			parts.push(height + 'young child');
		}

		if (slave?.visualAge >= 60) {
			parts.push('elderly');
		}

		if ((slave?.visualAge < 10) && !V.aiAgeFilter) {
			parts.push('kid');
		} else if ((slave?.visualAge < 6) && !V.aiAgeFilter) {
			parts.push('child');
		}

		// breasts
		let breastShape = '';
		if (slave?.boobs > 300) {
			switch (slave?.boobShape) {
				case "perky":
				case "torpedo-shaped":
					breastShape = 'perky ';
					break;
				case "downward-facing":
				case "saggy":
				case "wide-set":
					breastShape = 'saggy ';
					break;
			}
		}

		if (slave?.boobs < 300) {
			breastShape += this.helper.isPony() ? 'flat chested' : 'flat chest'; // Pony uses a slightly different tag
		} else if (slave?.boobs < 400) {
			breastShape += 'tiny ';
		} else if (slave?.boobs < 500 || this.censored) {
			breastShape += 'small ';
		} else if (slave?.boobs < 650 || this.slave.visualAge < 6) {
			breastShape += 'medium ';
		} else if (slave?.boobs < 800 || this.slave.visualAge < 10) {
			breastShape += 'large ';
		} else if (slave?.boobs < 1000 || this.slave.visualAge < 18) {
			breastShape += 'huge ';
		} else {//if (slave?.boobs < 1400) {
			breastShape += 'giant breasts, huge ';
		}

		// breast/nipple exposure for clothing
		const clothingBreasts = [
			"no clothing", "chains", "body oil", "uncomfortable straps", "shibari robes", "striped panties", "clubslut netting", "striped underwear", "a thong", "a skimpy loincloth", "boyshorts", "panties", "cutoffs", "sport shorts", "harem gauze", "slutty jewelry", "a slutty pony outfit"
		];
		const clothingCleavage = [
			"conservative clothing", "Western clothing", "a slutty qipao", "spats and a tank top", "a latex catsuit", "attractive lingerie", "attractive lingerie for a pregnant woman", "kitty lingerie", "a maternity dress", "stretch pants and a crop-top", "a succubus outfit", "a fallen nuns habit", "a cheerleader outfit", "cutoffs and a t-shirt", "slutty business attire", "a ball gown", "a slave gown", "a halter top dress", "an evening dress", "a mini dress", "a bunny outfit", "a slutty maid outfit", "a slutty nurse outfit", "a dirndl", "a gothic lolita dress", "a button-up shirt and panties", "a button-up shirt", "a t-shirt", "a tank-top", "a tube top", "a bra", "a sports bra", "a striped bra", "a tube top and thong", "a tank-top and panties", "a t-shirt and thong", "leather pants and a tube top", "a bimbo outfit", "a slutty outfit", "a courtesan dress"
		];
		const clothingSideboob = [
			"a toga", "a chattel habit", "a scalemail bikini", "a slave gown", "a leotard", "an apron", "overalls", "a courtesan dress"
		];
		const clothingUnderboob = [
			"stretch pants and a crop-top", "a succubus outfit", "a penitent nuns habit", "a t-shirt", "a tank-top", "a tube top", "a tube top and thong", "a tank-top and panties", "a t-shirt and thong", "a t-shirt and panties", "leather pants and a tube top", "harem gauze", "a bimbo outfit", "a slutty outfit"
		];

		const clothingBreastParts = [];

		if (clothingBreasts.includes(slave?.clothes)) {
			if (slave?.boobsImplant === 0 && slave?.boobs > 300) {
				clothingBreastParts.push('breasts');
			} else if (slave?.boobsImplant !== 0) {
				clothingBreastParts.push('fake tits');
			}
		}
		if (clothingCleavage.includes(slave?.clothes)) {
			clothingBreastParts.push('cleavage');
		}
		if (clothingSideboob.includes(slave?.clothes)) {
			clothingBreastParts.push('sideboob');
		}
		if (clothingUnderboob.includes(slave?.clothes)) {
			clothingBreastParts.push('underboob');
		}
		if (clothingBreastParts.length === 0) {
			if (slave?.boobsImplant === 0 && slave?.boobs > 300) {
				clothingBreastParts.push('breasts');
			} else if (slave?.boobsImplant !== 0) {
				clothingBreastParts.push('fake tits');
			}
		}

		parts.push(breastShape + clothingBreastParts.join(', '));

		// display nipple if uncovered, or covered nipples if large
		// nipple piercings also handled here
		if (this.helper.exposesNipples(this.slave.clothes)) {
			switch (slave?.nipples) {
				case "huge":
					parts.push('big nipples');
					break;
				case "puffy":
					parts.push('puffy nipples');
					break;
				case "fuckable":
				case "inverted":
				case "partially inverted":
					parts.push('inverted nipples');
					break;
				default:
					parts.push('nipples');
					break;
			}

			if ((slave?.piercing.areola.weight > 0 || slave?.piercing.nipple.weight > 0) && (slave?.visualAge < 18 && V.aiAgeFilter)) {
				parts.push('nipple piercings'); // the models can only handle this in a very basic way
			}
		} else {
			switch (slave?.nipples) {
				case "huge":
				case "puffy":
					parts.push(this.helper.isPony() ? 'nipple outline' : 'covered nipples'); // Using covered nipples on Pony is detrimental when clothed
					break;
				default:
					if (slave?.visualAge < 18 && V.aiAgeFilter) {
						// TODO: this prompting makes the clothes transparent on Illustrious (and maybe other models). If the goal is to censor the nipples why are we even prompting for them at all?
						parts.push('covered nipples');
					}
			}
		}

		// waist and hips
		if (slave?.waist < -40) {
			parts.push('narrow waist');
		}

		if (slave?.hips > 1) {
			parts.push('wide hips');
		}
		if (slave?.hips > 2) {
			parts.push('wide hips, thick thighs');
		}

		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		const slave = asSlave(this.slave);
		const parts = [];

		// handles masculine female phenotype
		if (this.isFeminine && perceivedGender(this.slave) < -1) {
			parts.push('woman');
		}

		switch (slave?.boobShape) {
			case "perky":
			case "torpedo-shaped":
			case "spherical":
				parts.push('saggy');
				break;
			default:
				if (slave?.boobsImplant > 1) {
					parts.push('saggy');
				}
		}

		if (slave?.waist > 10) {
			parts.push('narrow waist');
		}

		if (slave?.hips < -1) {
			parts.push('wide hips');
		}
		if (slave?.hips < -2) {
			parts.push('huge hips');
		}

		return parts;
	}

	face() {
		const slave = asSlave(this.slave);
		const parts = [];

		// age, gender
		if (this.isFeminine) {
			if ((slave?.visualAge < 18) && !V.aiAgeFilter) {
				switch (V.aiBaseModel) {
					case 1: case 2: // SDXL and Pony
						parts.push('young, loli');
						break;
					default:
						parts.push('young girl');
				}
			} else if (slave?.visualAge <= 20) {
				parts.push('young woman');
			} else if (slave?.visualAge <= 40) {
				parts.push('woman');
			} else if (slave?.visualAge >= 40) {
				parts.push('mature');
			}

			if (perceivedGender(this.slave) < -1) {
				parts.push('butch');
			} else if (perceivedGender(this.slave) > -1 && perceivedGender(this.slave) < 1) {
				parts.push('androgynous');
			}

			if (this.slave.race === "catgirl") {
				parts.push("catgirl");
			}
		} else if (this.isMasculine) {
			if ((slave?.visualAge < 18) && !V.aiAgeFilter) {
				switch (V.aiBaseModel) {
					case 1: case 2: // SDXL and Pony
						parts.push('young, shota');
						break;
					default:
						parts.push('young boy');
				}
			} else if (slave?.visualAge <= 20) {
				parts.push('young man');
			} else if (slave?.visualAge <= 40) {
				parts.push('man');
			} else if (slave?.visualAge >= 40) {
				parts.push('older man');
			}

			if (perceivedGender(this.slave) > 1) {
				switch (V.aiBaseModel) {
					case 1: case 2: case 6:
						parts.push('girly, femboy');
						break;
					default:
						parts.push('feminine');
				}
			} else if (perceivedGender(this.slave) > -1 && perceivedGender(this.slave) < 1) {
				parts.push('androgynous');
			}
		}

		if ((slave?.visualAge < 13) && !V.aiAgeFilter) {
			parts.push('child');
		}

		if (slave?.visualAge >= 60) {
			parts.push('elderly');
		}

		if (slave?.visualAge >= 13 && slave?.visualAge < 18 && !V.aiAgeFilter) {
			parts.push('teenager');
		}

		return parts;
	}
};
