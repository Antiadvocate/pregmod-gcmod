App.Art.GenAI.Ill.TattooPromptPart = class TattooPromptPart extends App.Art.GenAI.PromptPart {
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
			// have no effect
			parts.push('belly tattoo');
		}
		if (loc.breast) {
			parts.push('breast tattoo');
		}
		if (loc.dick) {
			// no effect
			// parts.push('penis tattoo');
		}
		if (loc.vagina) {
			parts.push('pubic tattoo');
		}
		if (loc.lips) {
			// no effect
			parts.push('facial tattoo');
		}

		return parts;
	}
};
