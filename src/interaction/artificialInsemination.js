/**
 * @returns {DocumentFragment}
 */
App.UI.SlaveInteract.artificialInsemination = function() {
	const f = new DocumentFragment();
	const targetSlave = getSlave(V.temp.AS);
	const facilityControlledAspects = App.Utils.assignmentControlledAspects(targetSlave);

	let r;
	App.UI.DOM.appendNewElement("p", f, `${targetSlave.slaveName} is prepped for fertilization; now you must select a target to harvest sperm from.`, "scene-intro");

	App.UI.DOM.appendNewElement("h2", f, "Select an eligible slave to serve as the semen donor");

	r = [];
	let any = false;
	for (const slave of getSlaves().values()) {
		if (slave.balls > 0 && slave.pubertyXY === 1 && canBreed(targetSlave, slave)) {
			const {his} = getPronouns(slave);

			const name = App.UI.DOM.makeElement("span", SlaveFullName(slave), "has-tooltip");
			tippy(name, {
				content: App.UI.DOM.slaveDescriptionDialog(slave, "Pop-up", {noArt: true}),
				interactive: true,
			});
			r.push(App.UI.DOM.makeElement("div", name));

			r.push(App.UI.DOM.makeElement("div",
				App.Medicine.Surgery.makeLink(
					new App.Medicine.Surgery.Procedures.Insemination(targetSlave, `Use ${his} sperm.`, slave),
					exit, false, facilityControlledAspects
				)
			));

			any = true;
		}
	}
	if (r.length > 0) {
		App.Events.addNode(f, r, "div", "grid-2columns-auto");
	} else {
		App.UI.DOM.appendNewElement("p", f, "You have no slaves with potent sperm.", "note");
	}

	if (tankSlaveCount() > 0 && App.Entity.facilities.incubator.upgrade('reproduction') === 1) {
		r = [];
		any = false;
		for (const tank of getTankSlaves().values()) {
			if (tank.balls > 0 && tank.dick > 0 && tank.incubatorSettings.reproduction === 2 && canBreed(targetSlave, tank)) {
				if (any === false) {
					App.UI.DOM.appendNewElement("h2", f, "Select an eligible incubatee to milk for semen");
					App.UI.DOM.appendNewElement("p", f, "Incubator settings are resulting in large-scale fluid secretion.", "scene-intro");
					any = true;
				}
				r.push(App.UI.DOM.makeElement("div",
					App.Medicine.Surgery.makeLink(
						new App.Medicine.Surgery.Procedures.Insemination(targetSlave, `Use ${tank.slaveName}'s sperm.`, tank),
						exit, false, facilityControlledAspects
					)
				));
			}
		}

		if (any) {
			App.Events.addParagraph(f, r);
		} else {
			App.UI.DOM.appendNewElement("p", f, "You have no growing slaves producing sperm.", "note");
		}
	}

	if (V.PC.balls !== 0) {
		App.UI.DOM.appendNewElement("p", f,
			App.Medicine.Surgery.makeLink(
				new App.Medicine.Surgery.Procedures.Insemination(targetSlave, "Use your own", V.PC),
				exit, false, facilityControlledAspects
			)
		);
	} else if (V.PC.counter.storedCum > 0) {
		r = [];
		r.push(App.Medicine.Surgery.makeLink(
			new App.Medicine.Surgery.Procedures.InseminationFromStored(targetSlave, "Use a vial of your own", V.PC),
			exit, false, facilityControlledAspects
		));
		r.push(`<span class="detail">You have enough sperm stored away to inseminate ${V.PC.counter.storedCum} more ${V.PC.counter.storedCum > 1 ? "slaves" : "slave"}.</span>`);
		App.Events.addParagraph(f, r);
	}

	function exit() {
		Engine.play("Remote Surgery");
	}

	return f;
};
