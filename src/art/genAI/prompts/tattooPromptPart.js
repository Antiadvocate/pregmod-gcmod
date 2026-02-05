App.Art.GenAI.TattooPromptPart = class TattooPromptPart extends App.Art.GenAI.PromptPart {
	locations() {
		return {
			arm: !!this.slave.armsTat && this.helper.exposesArms(this.slave.clothes),
			leg: !!this.slave.legsTat && this.helper.exposesLegs(this.slave.clothes),
			shoulder: !!this.slave.shouldersTat && this.helper.exposesArms(this.slave.clothes),
			belly: !!this.slave.bellyTat && this.helper.exposesMidriff(this.slave.clothes),
			breast: !!this.slave.boobsTat && this.helper.exposesBreasts(this.slave.clothes),
			dick: !!this.slave.dickTat && this.slave.dick > 0 && this.helper.exposesCrotch(this.slave.clothes),
			vagina: !!this.slave.vaginaTat && this.slave.vagina > -1 && (this.helper.exposesMidriff(this.slave.clothes) || this.helper.exposesCrotch(this.slave.clothes)),
			lips: !!this.slave.lipsTat,
		};
	}

	/**
	 * @override
	 */
	positive() {
		const parts = [];
		const loc = this.locations();
		if (this.helper.isPony()) { // Most SDXL models don't work the best with tattoos, so they have also been excluded - franklygeorge
			// TODO: add tattoo descriptions back in where/when they work
			if (loc.arm) {
				parts.push('arm tattoo');
			}
			if (loc.leg) {
				parts.push('leg tattoo');
			}
			if (loc.shoulder) {
				parts.push('shoulder tattoo');
			}
			if (loc.belly) {
				parts.push('belly tattoo');
			}
			if (loc.breast) {
				parts.push('breast tattoo');
				switch (this.slave.boobsTat) {
					case "tribal patterns":
					case "flowers":
						parts.push('floral chest tattoo');
						break;
					case "scenes":
					case "Asian art":
					case "degradation":
					case "counting":
					case "advertisements":
					case "rude words":
					case "bovine patterns":
					case "sacrament":
					case "sacrilege":
					case "possessive":
					case "paternalist":
				}
			}
			// if (loc.dick) {
			// 	parts.push('dick tattoo');
			// }
			if (loc.vagina) {
				parts.push('womb tattoo');
			}
			// if (loc.lips) {
			// 	parts.push('lip tattoo');
			// }
		} else { // SD1.X and SDXL
			// SD1.X and SDXL models do really bad with tattoos - franklygeorge
			// Life Like is on or off with no sense of location and most of the others (SD1.X) just add weird artifacts - franklygeorge
			// So we don't generate tattoos for them at all - franklygeorge
			// If someone can figure out how to make them work reliably (LoRA maybe?) then be my guest - franklygeorge
			// https://civitai.com/models/139749/tattoo-sleeve (SD1.X) shows potential promise for arm tattoos - franklygeorge
			// https://civitai.com/models/355902/tattoos (SD1.X) shows promise in general if we can figure out how to isolate it to a single location - franklygeorge

			// if (loc.arm) {
			// 	parts.push('arm tattoo');
			// }
			// if (loc.leg) {
			// 	parts.push('leg tattoo');
			// }
			// if (loc.shoulder) {
			// 	parts.push('shoulder tattoo');
			// }
			// if (loc.belly) {
			// 	parts.push('belly tattoo');
			// }
			// if (loc.breast) {
			// 	parts.push('breast tattoo');
			// }
			// if (loc.dick) {
			// 	parts.push('dick tattoo');
			// }
			if (loc.vagina) {
				switch (this.slave.vaginaTat) {
					case "tribal patterns":
					case "flowers":
					case "scenes":
					case "Asian art":
					case "degradation":
					case "counting":
					case "advertisements":
					case "rude words":
					case "bovine patterns":
					case "sacrament":
					case "sacrilege":
					case "possessive":
					case "paternalist":
						break;
					case "lewd crest":
						if (this.helper.isXL()) {
							if (this.helper.hasLora("lewd_crest_crotch_tattoo_sdxl")) {
								// This doesn't work with most realistic models - franklygeorge
								parts.push(this.helper.lora("lewd_crest_crotch_tattoo_sdxl", 0.8, '(pubic tattoo)'));
							}
						} else if (this.helper.hasLora("womb_tattoo")) {
							// Note that this lora seems to work with all the SD1.X models I tested to some degree or another
							// except for Life Like where it doesn't work until you turn it up so high that it disorts everything else.
							// This is interesting since it works pretty well with Life Like if you remove all the rest of our prompting. - franklygeorge
							parts.push(this.helper.lora("womb_tattoo", 0.8, '(womb tattoo, pubic tattoo)'));
						}
						break;
				}
			}
			// if (loc.lips) {
			// 	parts.push('lip tattoo');
			// }
		}

		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		const parts = [];
		const loc = this.locations();
		if (this.positive().includes('tattoo')) { // only add negative prompting if it is actually needed
			if (!loc.arm) {
				parts.push('arm tattoo');
			}
			if (!loc.leg) {
				parts.push('leg tattoo');
			}
			if (!loc.shoulder) {
				parts.push('shoulder tattoo');
			}
			if (!loc.belly) {
				parts.push('belly tattoo');
			}
			if (!loc.breast) {
				parts.push('breast tattoo');
			}
			// if (!loc.dick) {

			// }
			if (!loc.vagina) {
				parts.push('womb tattoo');
			}
			// if (!loc.lips) {

			// }
		}
		return parts;
	}
};
