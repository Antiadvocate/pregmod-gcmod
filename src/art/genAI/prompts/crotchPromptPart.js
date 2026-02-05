// cSpell: ignore nopussy_v1

App.Art.GenAI.CrotchPromptPart = class CrotchPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		// censored or covered by clothes
		const exposesCrotch = this.helper.exposesCrotch(this.slave.clothes);
		const exposesUnderwear = this.helper.exposesUnderwear(this.slave.clothes);
		if (!exposesCrotch || this.censored) {
			
			if (!this.censored && this.slave.dick) {
				return ["bulge"];
			}
			if (!this.censored && !this.slave.dick && this.slave.vagina >= 0 && exposesUnderwear) {
			  return ["cameltoe"];
			}
			return [];
		}
		let promptParts = [];

		// null slaves
		if (this.slave.dick === 0 && this.slave.vagina === -1) {
			if (this.helper.hasLora("nopussy_v1")) {
				return [this.helper.lora("nopussy_v1", 1)];
			} else {
				return []; // probably renders as female anyway; use the LoRA if you want good results
			}
		}

		// chasity device
		if (this.slave.chastityPenis  || this.slave.chastityVagina) {
			let type = this.slave.chastityPenis ? "cage" : "belt";
			return [`chastity ${type}` + this.helper.lora("chastitybelt", .7, "", ", ")];
		}

		const {vagina, clit, labia, dick, foreskin, scrotum, balls} = this.slave;

		// futanari
		if (dick && vagina >= 0) {
			// cSpell: ignore flaccidfutanarimix, micropp
			if (this.slave.dick > 4 && this.helper.hasLora("flaccidfutanarimix-locon-dim64-alpha64-highLR")) {
				promptParts.push(this.helper.lora("flaccidfutanarimix-locon-dim64-alpha64-highLR", .8)); // Massive, unrealistic penis for futa - Converts to female appearance
			} else if (this.slave.dick >= 2 && this.helper.hasLora("futanari")) {
				promptParts.push(this.helper.lora("futanari")); // Normal penis for futa - Converts to female appearance
			} else if (this.slave.dick < 2 && this.slave.dick > 0 && this.helper.hasLora("micropp_128dim_nai_v2")) {
				promptParts.push(this.helper.lora("micropp_128dim_nai_v2", .8)); // Micro penis for futa - Converts to female appearance
			} else {
				// Applying this hard to override dick and pussy prompts.
				promptParts.push("futanari, herm");
			}
			promptParts.push(`[${dickDescription()}]`);
			//promptParts.push(`[${vaginaDescription()}]`);
		// male
		} else if (dick) {
			if (this.slave.dick < 2 && this.helper.hasLora("micropp_128dim_nai_v2")) {
				promptParts.push(this.helper.lora("micropp_128dim_nai_v2", .8)); // Micropenis
			} else if (this.slave.dick < 4 && this.helper.hasLora("OnlyCocksV1LORA")) {
				promptParts.push(this.helper.lora("OnlyCocksV1LORA", .8)); // Average Male Penis. Note this LoRA is always erect...
			} else if (this.helper.hasLora("flaccidfutanarimix-locon-dim64-alpha64-highLR")) {
				promptParts.push(this.helper.lora("flaccidfutanarimix-locon-dim64-alpha64-highLR", .8)); // Massive schlong. Always flaccid...
			}
			promptParts.push(dickDescription());
		// female
		} else if (vagina >= 0) {
			promptParts.push(vaginaDescription());
		}

		return promptParts;

		/** @returns {string} */
		function dickDescription() {
			let dickDescriptors = [];
			switch (dick) {
				case 0: break;
				case 1: dickDescriptors.push("tiny"); break;
				case 2: dickDescriptors.push("small"); break;
				case 3: dickDescriptors.push("normal-sized"); break;
				case 4: dickDescriptors.push("big"); break;
				case 5: dickDescriptors.push("huge"); break;
				case 6: dickDescriptors.push("gigantic"); break;
				case 7: dickDescriptors.push("massive"); break;
				case 8: dickDescriptors.push("extremely massive"); break;
				case 9: dickDescriptors.push("absurdly massive"); break;
				case 10:
				case 11: dickDescriptors.push("unbelievably massive"); break;
			}


			if (dickDescriptors.length) {
				if (foreskin === 0) {
					dickDescriptors.push("uncircumcised");
				} else {
					dickDescriptors.push("circumcised");
				}
			}

			dickDescriptors.push("penis");

			if (scrotum && balls > 1) {
				dickDescriptors.push("with");

				switch (balls) {
					case 2: dickDescriptors.push("small"); break;
					case 3: break;
					case 4: dickDescriptors.push("large"); break;
					case 5: dickDescriptors.push("massive"); break;
					case 6: dickDescriptors.push("huge"); break;
					case 7: dickDescriptors.push("gigantic"); break;
					case 8: dickDescriptors.push("enormous"); break;
					case 9: dickDescriptors.push("extremely enormous"); break;
					case 10:
					case 11: dickDescriptors.push("inhumanly enormous"); break;
				}

				dickDescriptors.push("balls");
			}


			return dickDescriptors.join(" ");
		}

		/** @returns {string} */
		function vaginaDescription() {
			let vaginaDescriptors = ["pussy"];

			let clitDescriptors = [];
			switch (clit) {
				case 0: break;
				case 1: clitDescriptors.push("large"); break;
				case 2: clitDescriptors.push("huge"); break;
				case 3: clitDescriptors.push("enormous"); break;
				case 4: clitDescriptors.push("penis-like"); break;
				case 5: clitDescriptors.push("large and penis-like"); break;
			}

			if (clitDescriptors.length) {
				clitDescriptors.push("clit");
				vaginaDescriptors.push(clitDescriptors.join(" "));
			}


			let labiaDescriptors = [];
			switch (labia) {
				case 0: break;
				case 1: labiaDescriptors.push("large"); break;
				case 2: labiaDescriptors.push("huge"); break;
				case 3: labiaDescriptors.push("enormous"); break;
			}

			if (labiaDescriptors.length) {
				labiaDescriptors.push("labia");
				vaginaDescriptors.push(labiaDescriptors.join(" "));
			}

			return vaginaDescriptors.join(",");
		}
	}

	/**
	 * @override
	 */
	negative() {
		const {vagina, dick, balls, scrotum} = this.slave;
		let promptParts = [];

		if (!dick && vagina >= 0) {
			promptParts.push("penis");
		}

		if (dick) {
			if (vagina < 0) {
				promptParts.push("pussy");
			}

			if (balls < 2) {
				promptParts.push("balls");
			}

			if (!scrotum) {
				promptParts.push("scrotum");
			}
		}

		return promptParts;
	}
};
