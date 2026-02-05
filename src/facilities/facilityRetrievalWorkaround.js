/**
 * Currently setup for the Incubator and Nursery
 * @param {"Incubator"|"Nursery"} facility
 * @returns {DocumentFragment}
 */
App.UI.facilityRetrievalWorkaround = function(facility) {
	const isIncubator = facility === "Incubator";
	const facilityName = isIncubator ? V.incubator.name : V.nurseryName;
	const retrieveReadyTanks = !Number.isInteger(V.temp.AS);

	const node = new DocumentFragment();
	if (!retrieveReadyTanks) {
		let readySlave;
		if (isIncubator) {
			readySlave = getTankSlave(V.temp.AS);
			getTankSlaves().delete(readySlave.ID);
		} else {
			readySlave = getInfant(V.temp.AS);
			getInfants().delete(readySlave.ID);
		}
		const {he, his, him} = getPronouns(readySlave);
		animalBabyWarning(readySlave);
		App.UI.DOM.appendNewElement("p", node, `${readySlave.slaveName} has been discharged from ${facilityName} and is ready for ${his} first ever inspection.`);
		if (isIncubator) {
			App.UI.DOM.appendNewElement("div", node, App.Desc.longSlave(readySlave));
			if (readySlave.tankBaby !== 3) {
				checkOrgans(readySlave);
				App.UI.DOM.appendNewElement("div", node, App.UI.newChildIntro(readySlave));
			} else {
				const price = Math.trunc(slaveCost(readySlave)/3);
				V.temp.husk = readySlave;
				node.append(`A husk is ready to be used.`);
				App.UI.DOM.appendNewElement("div", node, `As expected, ${he} is a complete vegetable, but that is what you wanted after all. You lack the facilities to care for ${him} in this state, so you should do what you are planning quickly. Or you could sell ${him} to the Flesh Heap.`, "note");
				if (V.cash >= V.surgeryCost) {
					App.UI.DOM.appendNewElement("div", node, App.UI.DOM.passageLink("Contact the bodyswap surgeon.", "Husk Slave Swap Workaround", null, "Will significantly increase the selected slave's upkeep."));
					App.UI.DOM.appendNewElement("div", node, App.UI.DOM.passageLink("Sell the husk to Flesh Heap.", "Main", () => { cashX(price, "slaveTransfer"); }, `This body can be bought by the Flesh Heap for ${cashFormat(price)}.`));
				} else {
					cashX(price, "slaveTransfer");
					App.UI.DOM.appendNewElement("span", node, `You can't sustain ${him} and thus must sell ${him} for ${cashFormat(price)}.`, "note");
				}
			}
			readySlave = App.Entity.TankSlaveState.fromTank(/** @type {FC.TankSlaveState} */ (readySlave));
		} else {
			App.UI.DOM.appendNewElement("div", node, App.Desc.longSlave(readySlave));
			App.UI.DOM.appendNewElement("div", node, App.UI.newChildIntro(readySlave));
		}
	} else if (retrieveReadyTanks) {
		// incubator only right now?
		let newSlavePool = [];
		for (const [step, tank] of getTankSlaves()) {
			if (tank.incubatorSettings.growTime <= 0) {
				newSlavePool.push(tank);
				getTankSlaves().delete(tank.ID);
			}
		}
		App.UI.DOM.appendNewElement("p", node, `The following slaves were discharged from ${facilityName}:`);
		for (const tankSlave of newSlavePool) {
			const slave = isIncubator ? App.Entity.TankSlaveState.fromTank(/** @type {FC.TankSlaveState} */ (tankSlave)) : tankSlave;
			App.UI.DOM.appendNewElement("div", node, `Name: ${SlaveFullName(slave)}`);
			App.UI.DOM.appendNewElement("div", node, parent(slave, "mother"));
			App.UI.DOM.appendNewElement("div", node, parent(slave, "father"));
			if (slave.father === SID.ANIMAL) {
				// no popups, just kill them all
				App.UI.DOM.appendNewElement("div", node, `Animal-fathered children are not currently supported, as the Farmyard is a WIP; child killed.`, ["error"]);
			} else {
				newSlave(slave);
				checkOrgans(slave);
			}
		}
	}

	return node;

	/**
	 * @param {FC.SlaveState} slave
	 */
	function animalBabyWarning(slave) {
		if (slave.father === SID.ANIMAL) {
			Dialog.create("Attention");
			const frag = new DocumentFragment();
			frag.append(`As the Farmyard is currently WIP, animal-fathered children shouldn't be here! Affected slave: ${slave.slaveName}.`);
			App.UI.DOM.appendNewElement("div", frag, "Please either close this dialog, load a previous save and abort the pregnancy, or sell/discard this slave.");
			App.UI.DOM.appendNewElement("div", frag,
				App.UI.DOM.link("Alternatively, discard this slave and return.", () => {
					if (Dialog.isOpen()) {
						Dialog.close();
					}
				}, [], (retrieveReadyTanks ? `${facility} Retrieval Workaround` : facility))
			);
			$(Dialog.body()).empty().append(frag);
			Dialog.open();
		}
	}

	/**
	 * @param {FC.SlaveState} slave
	 * @param {"father"|"mother"} type
	 */
	function parent(slave, type) {
		const r = new DocumentFragment();
		const missingTableEntry = V.missingTable[slave[type]];
		const missingSlave = missingTableEntry ? capFirstChar(missingSlaveAddress(missingTableEntry)) : `Unknown.`;
		r.append(`${capFirstChar(type)}: `);
		if (slave[type] > 0) {
			const tempParent = getSlave(slave[type]);
			if (!tempParent) {
				r.append(`Unknown.`);
			} else {
				r.append(SlaveFullName(tempParent));
			}
		} else if (slave[type] === SID.PC) {
			r.append(PlayerName());
		} else if (type === "father") {
			if (slave.father === SID.CITIZEN) {
				r.append(`Unknown citizen.`);
			} else if (slave.father === SID.FORMERMASTER) {
				r.append(`Your former Master.`);
			} else if (slave.father === SID.ARCOWNER) {
				r.append(`Another arcology's owner.`);
			} else if (slave.father === SID.CLIENT) {
				r.append(`One of your clients.`);
			} else if (slave.father === SID.ELITE) {
				r.append(`Societal Elite.`);
			} else if (slave.father === SID.LAB) {
				r.append(`Lab crafted.`);
			} else if (slave.father === SID.ANIMAL) {
				r.append(`Your animals.`);
			} else if (slave.father === SID.FUTA) {
				r.append(`Futanari Sister.`);
			} else if (slave.father === SID.RAPIST) {
				r.append(`Your rapist.`);
			} else {
				r.append(missingSlave);
			}
		} else {
			r.append(missingSlave);
		}
		return r;
	}

	/**
	 * @param {FC.SlaveState} slave
	 */
	function checkOrgans(slave) {
		const movedOrgans = V.incubator.organs.deleteWith(o => o.ID === slave.ID);
		for (const organ of movedOrgans) {
			if (organ.weeksToCompletion <= 0) {
				V.completedOrgans.push(organ);
			} else {
				V.organs.push(organ);
			}
		}
	}
};
