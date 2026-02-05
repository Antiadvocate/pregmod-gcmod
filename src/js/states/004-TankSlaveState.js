App.Entity.incubatorSettings = class {
	constructor(child, settingsOverride = null) {
		let fullAdapt;
		const setting = (settingsOverride !== null) ? settingsOverride : (child.genes === "XX" ? V.incubator.femaleSetting : V.incubator.maleSetting);

		if (setting.pregAdaptationPower === 1) {
			fullAdapt = 45000 / 2000;	// 22.5
		} else if (setting.pregAdaptationPower === 2) {
			fullAdapt = 100000 / 2000;	// 50
		} else if (setting.pregAdaptationPower === 3) {
			fullAdapt = 150000 / 2000;	// 75
		} else {
			fullAdapt = 15000 / 2000;	// 7.5
		}
		this.imprint = setting.imprint;
		this.weight = setting.weight;
		this.muscles = setting.muscles;
		this.growthStims = setting.growthStims;
		this.reproduction = setting.reproduction;
		this.growTime = Math.trunc(setting.targetAge * 52);
		this.pregAdaptation = setting.pregAdaptation;
		this.pregAdaptationPower = setting.pregAdaptationPower;
		this.pregAdaptationInWeek = Math.max(((fullAdapt - child.pregAdaptation) / Math.trunc(setting.targetAge * 52)), 0);
	}
};

App.Entity.TankSlaveState = class extends App.Entity.SlaveState {
	/**
	 * Do not call this directly when creating a Tank Slave, call App.Entity.TankSlaveState.toTank() instead
	 * @see App.Entity.TankSlaveState.toTank
	 * @param {number|string} [seed=undefined]
	 */
	constructor(seed=undefined) {
		// NOTE if the property you are adding could apply to more slaves then just tank slaves then it likely belongs in SlaveState instead
		super(seed);
		/** @type {App.Entity.incubatorSettings} */
		this.incubatorSettings = new App.Entity.incubatorSettings(this);
		if (this.incubatorSettings.imprint === "terror") {
			/** @type {1 | 2 | 3} */
			this.tankBaby = 2;
		} else if (this.incubatorSettings.imprint === "trust") {
			/** @type {1 | 2 | 3} */
			this.tankBaby = 1;
		} else {
			applyMindbroken(this, this.intelligence);
			/** @type {1 | 2 | 3} */
			this.tankBaby = 3;
		}
		return this;
	}

	/**
	 * Converts the given SlaveState object into a TankSlaveState
	 * @param {FC.SlaveState} child
	 * @param {any} settingsOverride // TODO: documentation and type hinting
	 * @returns {FC.TankSlaveState}
	 */
	static toTank(child, settingsOverride = null) {
		/** @type {FC.TankSlaveState} */
		const tank = /** @type {FC.TankSlaveState} */ (child);
		tank.incubatorSettings = new App.Entity.incubatorSettings(child, settingsOverride);
		if (tank.tankBaby === 0) {
			if (tank.incubatorSettings.imprint === "terror") {
				tank.tankBaby = 2;
			} else if (tank.incubatorSettings.imprint === "trust") {
				tank.tankBaby = 1;
			} else {
				applyMindbroken(tank, tank.intelligence);
				tank.tankBaby = 3;
			}
		}
		return tank;
	}

	/**
	 * Converts the given TankSlaveState object into a SlaveState, removing `incubatorSettings`
	 * @param {FC.TankSlaveState} tankSlave
	 * @returns {FC.SlaveState}
	 */
	static fromTank(tankSlave) {
		delete tankSlave.incubatorSettings;
		return tankSlave;
	}
};
