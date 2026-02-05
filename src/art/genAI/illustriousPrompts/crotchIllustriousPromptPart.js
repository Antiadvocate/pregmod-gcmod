// cSpell: ignore nopussy_v1

App.Art.GenAI.Ill.CrotchPromptPart = class CrotchPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const slave = asSlave(this.slave);

		// Per-slave explicit anatomy control.
		// 0/undefined: off (never mention crotch/butt/anus)
		// 1: implied only (bulge/cameltoe)
		// 2: explicit genitals (front)
		// 3: explicit rear (include anus)
		const anatomyMode = Number(slave?.custom?.aiAnatomyExposure ?? 0);
		if (this.censored || anatomyMode <= 0) {
			return [];
		}

		// null slaves
		if (this.slave.dick === 0 && this.slave.vagina === -1) {
			return ["(no pussy)"];
		}

		// chasity device
		if (this.slave.chastityPenis || this.slave.chastityVagina) {
			let type = this.slave.chastityPenis ? "cage" : "belt";
			return [`chastity ${type}`];
		}

		const {
			vagina,
			clit,
			labia,
			dick,
			foreskin,
			scrotum,
			balls,
			anus
		} = this.slave;

		// Implied-only mode: avoids strong pose steering (rear view / looking back).
		if (anatomyMode === 1) {
			if (this.slave.dick) {
				return ["bulge"];
			}
			if (this.slave.vagina >= 0) {
				return ["cameltoe"];
			}
			return [];
		}

		// Explicit modes: describe genitals regardless of clothing.
		if (anatomyMode >= 2) {
			const promptParts = [];

			// futanari
			if (dick && vagina >= 0) {
				promptParts.push("futanari");
				promptParts.push(dickDescription());
				promptParts.push(vaginaDescription());
				// male
			} else if (dick) {
				promptParts.push(dickDescription());
				// female
			} else if (vagina >= 0) {
				promptParts.push(vaginaDescription());
			}

			// Rear explicit mode: mentioning anus strongly biases pose (rear view / looking back),
			// so only include it when the player explicitly opted in.
			if (anatomyMode >= 3) {
				if (anus >= 3) {
					promptParts.push("gaping anus");
				} else {
					promptParts.push("anus");
				}
			}

			return promptParts;
		}

		return [];

		/** @returns {string} */
		function dickDescription() {
			let dickDescriptors = [];
			switch (dick) {
				case 0:
					break;
				case 1:
					dickDescriptors.push("(small penis:1.5)");
					break;
				case 2:
					dickDescriptors.push("(small penis:1.2)");
					break;
				case 3:
					dickDescriptors.push("small penis");
					break;
				case 4:
				case 5:
					dickDescriptors.push("penis");
					break;
				case 6:
				case 7:
					dickDescriptors.push("large penis");
					break;
				case 8:
					dickDescriptors.push("huge penis");
					break;
				case 9:
					dickDescriptors.push("gigantic penis");
					break;
				case 10:
				case 11:
					dickDescriptors.push("(gigantic penis:1.3)");
					break;
			}


			/**
			 * @type {number}
			 * * 0: circumcised
			 * * 1+:uncut, also affects clitoral hood size
			 */
			if (dickDescriptors.length) {
				if (foreskin === 0) {
					dickDescriptors.push("circumcised");
				} else {
					dickDescriptors.push("foreskin");
				}
			}

			if (scrotum && balls > 1) {
				switch (balls) {
					case 2:
						dickDescriptors.push("small testicles");
						break;
					case 3:
						break;
					case 4:
						dickDescriptors.push("large testicles");
						break;
					case 5:
					case 6:
						dickDescriptors.push("huge testicles");
						break;
					case 7:
					case 8:
						dickDescriptors.push("gigantic testicles");
						break;
					case 9:
						dickDescriptors.push("(gigantic testicles:1.2)");
						break;
					case 10:
					case 11:
						dickDescriptors.push("(gigantic testicles:1.5)");
						break;
				}
			} else {
				dickDescriptors.push("no testicles");
			}


			return dickDescriptors.join(", ");
		}

		/** @returns {string} */
		function vaginaDescription() {
			let vaginaDescriptors = ["pussy"];

			if (clit < 1) {
				// nothing
			} else if (clit < 3) {
				vaginaDescriptors.push("large clitoris");
			} else if (clit < 4 || dick !== 0) {
				vaginaDescriptors.push("huge clitoris");
			} else if (clit === 4) {
				vaginaDescriptors.push("futanari, (no testicles), (small penis:1.5), erection");
			} else {
				vaginaDescriptors.push("futanari, (no testicles), (small penis:1.2), erection");
			}

			if (vagina >= 4) {
				vaginaDescriptors.push("gaping vagina");
			}

			let labiaDescriptors = [];
			switch (labia) {
				case 0:
					break;
				case 1:
				case 2:
				case 3:
					labiaDescriptors.push("long");
					break;
			}

			if (labiaDescriptors.length) {
				labiaDescriptors.push("labia");
				vaginaDescriptors.push(labiaDescriptors.join(" "));
			}

			return vaginaDescriptors.join(", ");
		}
	}

	/**
	 * @override
	 */
	negative() {
		const {vagina, clit, dick, balls, scrotum} = this.slave;
		let promptParts = [];

		if (!dick && vagina >= 0) {
			promptParts.push("penis");
			if (clit >= 4) {
				promptParts.push("(testicles)");
			}
		}

		if (dick) {
			if (vagina < 0) {
				promptParts.push("pussy");
			}

			if (balls < 2 || !scrotum) {
				promptParts.push("testicles, scrotum");
			}
		} else if (vagina === -1) {
			promptParts.push("pussy");
		}

		return promptParts;
	}
};
