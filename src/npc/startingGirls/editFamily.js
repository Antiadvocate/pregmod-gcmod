// cSpell:ignore dont-be-dumb

/**
 * @param {FC.HumanState} slave
 * @param {boolean} [cheat]
 * @returns {DocumentFragment}
 */
App.Intro.editFamily = function(slave, cheat) {
	const el = new DocumentFragment();
	const allowPCFamily = (V.freshPC === 1 || V.saveImported === 0 || cheat);
	const {His, his} = getPronouns(slave);

	const editFamily = makeElWithID("edit-family");
	editFamily.append(makeFamilyTable());
	const familyTree = App.UI.DOM.makeElement("div", App.StartingGirls.uncommittedFamilyTree(slave));
	editFamily.append(familyTree);
	el.append(editFamily);

	return el;

	/** Can 'mother' be the mother of 'daughter'?
	 * @param {FC.HumanState} daughter
	 * @param {FC.HumanState} mother
	 */
	function canBecomeMotherOf(daughter, mother) {
		return (mother.vagina > 0 || mother.mpreg === 1) && // could give birth
			(daughter.mother !== mother.ID) && // not already mother
			(mother.actualAge - daughter.actualAge >= mother.pubertyAgeXX); // old enough
	}

	/** Can 'father' be the father of 'daughter'?
	 * @param {FC.HumanState} daughter
	 * @param {FC.HumanState} father
	 */
	function canBecomeFatherOf(daughter, father) {
		return (father.dick > 0) && // could knock someone up
			(daughter.father !== father.ID) && // not already father
			(father.actualAge - daughter.actualAge >= father.pubertyAgeXY); // old enough
	}

	function makeFamilyTable() {
		const familyTable = makeElWithID("family-table");
		const notPlayer = asSlave(slave);
		if (cheat && notPlayer) {
			familyTable.append(relationshipTarget(notPlayer));
			familyTable.append(relationshipType(notPlayer));
			familyTable.append(rivalTarget(notPlayer));
			familyTable.append(rivalryType(notPlayer));
			App.UI.DOM.appendNewElement("h2", familyTable, "Family");
		}
		familyTable.append(summary());
		familyTable.append(makeElWithID("dont-be-dumb"));
		familyTable.append(mother());
		familyTable.append(sameMotherAs());
		familyTable.append(father());
		familyTable.append(sameFatherAs());
		familyTable.append(motherOfTheChildren());
		familyTable.append(fatherOfTheChildren());
		if (allowPCFamily) {
			familyTable.append(resetAllRelativesOfPC());
		}
		return familyTable;
	}

	function summary() {
		const familySummary = App.UI.DOM.makeElement("p");
		$(familySummary).append(App.Desc.family(slave));
		return familySummary;
	}

	/** Set relationship - Slaves only
	 * @param {FC.SlaveState} slave
	 */
	function relationshipType(slave) {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		const option = options.addOption("Relationship", "relationship", slave)
			.addValueList([
				["Married to you", -3],
				["Emotionally bound to you", -2],
				["Emotional slut", -1],
				["None", 0],
			]);
		const relation = getSlave(slave.relationshipTarget);
		if (relation) {
			option.addValueList([
				[`Friends with ${relation.slaveName}`, 1],
				[`Best friends with ${relation.slaveName}`, 2],
				[`Friends with benefits with ${relation.slaveName}`, 3],
				[`Lover with ${relation.slaveName}`, 4],
				[`${relation.slaveName}'s slave wife`, 5]
			]);
		}
		el.append(options.render());
		return el;
	}

	/** Set relationship - Slaves only
	 * @param {FC.SlaveState} slave
	 */
	function relationshipTarget(slave) {
		const div = document.createElement("div");
		const relation = getSlave(slave.relationshipTarget);
		if (slave.relationshipTarget < 0) {
			div.append(`${slave.slaveName} has a relationship with you. `);
		} else if (slave.relationshipTarget === 0) {
			div.append(`${slave.slaveName} is not in a relationship. `);
		} else if (relation) {
			div.append(`${slave.slaveName} has a relationship with ${relation.slaveName} `);
		} else {
			div.append(`${slave.slaveName}'s relationship target, "${slave.relationshipTarget}" is not found `);
		}
		const change = App.UI.DOM.makeElement("span", App.UI.DOM.link("Change", () => {
			const linkArray = [];
			linkArray.push(
				App.UI.DOM.link(
					"Reset",
					() => {
						slave.relationshipTarget = 0;
						refresh();
					}
				)
			);

			for (const potentialRel of getSlaves().values()) {
				const relTerm = relativeTerm(slave, potentialRel);
				const link = document.createElement("span");
				link.append(App.UI.DOM.link(
					potentialRel.slaveName,
					() => {
						slave.relationshipTarget = potentialRel.ID;
						refresh();
					}
				));
				if (relTerm) {
					App.UI.DOM.appendNewElement("span", link, ` (${relTerm})`);
				}
				linkArray.push(link);
			}

			jQuery(change).empty().append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		}));
		div.append(change);

		return div;
	}

	/** Show the rival status - Slaves only
	 * @param {FC.SlaveState} slave
	 */
	function rivalryType(slave) {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		if (slave.rivalry) {
			options.addOption("Rivalry level", "rivalry", slave)
				.addValueList([
					[`Dislikes`, 1],
					[`Rival of`, 2],
					["Bitterly hates", 3],
				]);
		}
		el.append(options.render());
		return el;
	}

	/** Show the rival status and a link to change it - Slaves only
	 * @param {FC.SlaveState} slave
	 */
	function rivalTarget(slave) {
		const div = document.createElement("div");
		const rival = getSlave(slave.rivalryTarget);
		if (slave.rivalryTarget < 0) {
			div.append(`${slave.slaveName} has a rivalry with you. `);
		} else if (slave.rivalryTarget === 0) {
			div.append(`${slave.slaveName} has no rival. `);
		} else if (rival) {
			div.append(`${slave.slaveName} has a rivalry with ${rival.slaveName} `);
		} else {
			div.append(`${slave.slaveName}'s rivalry target, "${slave.rivalryTarget}" is not found `);
		}

		const change = App.UI.DOM.makeElement("span", App.UI.DOM.link("Change", () => {
			const linkArray = [];
			linkArray.push(
				App.UI.DOM.link(
					"Reset",
					() => {
						slave.rivalryTarget = 0;
						slave.rivalry = 0;
						refresh();
					}
				)
			);

			for (const potentialRival of getSlaves().values()) {
				linkArray.push(App.UI.DOM.link(
					potentialRival.slaveName,
					() => {
						slave.rivalryTarget = potentialRival.ID;
						slave.rivalry = slave.rivalry || 1;
						refresh();
					}
				));
			}
			jQuery(change).empty().append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		}));
		div.append(change);

		return div;
	}

	function mother() {
		const div = document.createElement("div");
		if (slave.ID === SID.PC) {
			div.append(`Your `);
		} else {
			div.append(`${slave.slaveName}'s `);
		}
		div.append(`mother is `, parentName("mother"), `. `);
		const change = App.UI.DOM.makeElement("span", App.UI.DOM.link("Change", () => {
			const linkArray = [];
			linkArray.push(
				App.UI.DOM.link(
					"Reset",
					() => {
						slave.mother = SID.GENERIC;
						refresh();
					}
				)
			);

			if (canBecomeMotherOf(slave, V.PC) && allowPCFamily) {
				linkArray.push(
					App.UI.DOM.link(
						"You",
						() => {
							slave.mother = SID.PC;
							refresh();
						}
					)
				);
			}

			for (const potentialRel of getSlaves().values()) {
				if (canBecomeMotherOf(slave, potentialRel) && potentialRel.newGamePlus === 0) {
					linkArray.push(
						App.UI.DOM.link(
							potentialRel.slaveName,
							() => {
								slave.mother = potentialRel.ID;
								refresh();
							}
						)
					);
				}
			}

			jQuery(change).empty().append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		}));
		div.append(change);

		return div;
	}

	function father() {
		const div = document.createElement("div");
		if (slave.ID === SID.PC) {
			div.append(`Your `);
		} else {
			div.append(`${slave.slaveName}'s `);
		}
		div.append(`father is `, parentName("father"), `. `);
		const change = App.UI.DOM.makeElement("span", App.UI.DOM.link("Change", () => {
			const linkArray = [];
			linkArray.push(
				App.UI.DOM.link(
					"Reset",
					() => {
						slave.father = SID.GENERIC;
						refresh();
					}
				)
			);

			if (canBecomeFatherOf(slave, V.PC) && allowPCFamily) {
				linkArray.push(
					App.UI.DOM.link(
						"You",
						() => {
							slave.father = SID.PC;
							refresh();
						}
					)
				);
			}

			for (const potentialRel of getSlaves().values()) {
				if (canBecomeFatherOf(slave, potentialRel) && potentialRel.newGamePlus === 0) {
					linkArray.push(
						App.UI.DOM.link(
							potentialRel.slaveName,
							() => {
								slave.father = potentialRel.ID;
								refresh();
							}
						)
					);
				}
			}

			jQuery(change).empty().append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		}));
		div.append(change);

		return div;
	}

	function sameMotherAs() {
		const div = document.createElement("div");
		if (slave.mother === SID.PC) {
			div.append(`You are ${his} mother, and also the mother of: `);
		} else {
			div.append(`${slave.ID === SID.PC ? "Your" : His} mom, `, parentName("mother"), `, is also the mother of: `);
		}

		div.append(App.StartingGirls.listOfSlavesWithParent('mother', slave.mother), " ");
		const change = App.UI.DOM.makeElement("span", App.UI.DOM.link("Change", () => {
			const linkArray = [];
			linkArray.push(
				App.UI.DOM.link(
					"Reset",
					() => {
						slave.mother = SID.GENERIC;
						refresh();
					}
				)
			);

			const mother = slave.mother === SID.PC ? V.PC : getSlave(slave.mother);
			if ((!mother || canBecomeMotherOf(V.PC, mother)) && allowPCFamily) {
				linkArray.push(
					App.UI.DOM.link(
						"You",
						() => {
							setRel(V.PC);
							refresh();
						}
					)
				);
			}

			for (const potentialRel of getSlaves().values()) {
				if ((!mother || canBecomeMotherOf(potentialRel, mother)) && potentialRel.newGamePlus === 0) {
					linkArray.push(
						App.UI.DOM.link(
							potentialRel.slaveName,
							() => {
								setRel(potentialRel);
								refresh();
							}
						)
					);
				}
			}

			jQuery(change).empty().append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		}));
		div.append(change);

		return div;

		function setRel(potentialRel) {
			if (potentialRel.mother !== SID.GENERIC) {
				slave.mother = potentialRel.mother;
			} else if (slave.mother !== SID.GENERIC) {
				potentialRel.mother = slave.mother;
			} else {
				slave.mother = -20 - 2 * slave.ID;
				potentialRel.mother = slave.mother;
			}
		}
	}

	function sameFatherAs() {
		const div = document.createElement("div");

		if (slave.father === SID.PC) {
			div.append(`You are ${his} father, and also the father of: `);
		} else {
			div.append(`${slave.ID === SID.PC ? "Your" : His} dad, `, parentName("father"), `, is also the father of: `);
		}

		div.append(App.StartingGirls.listOfSlavesWithParent('father', slave.father), " ");

		const change = App.UI.DOM.makeElement("span", App.UI.DOM.link("Change", () => {
			const linkArray = [];

			linkArray.push(
				App.UI.DOM.link(
					"Reset",
					() => {
						slave.father = SID.GENERIC;
						refresh();
					}
				)
			);

			const father = slave.father === SID.PC ? V.PC : getSlave(slave.father);
			if ((!father || canBecomeFatherOf(V.PC, father)) && allowPCFamily) {
				linkArray.push(
					App.UI.DOM.link(
						"You",
						() => {
							setRel(V.PC);
							refresh();
						}
					)
				);
			}

			for (const potentialRel of getSlaves().values()) {
				if ((!father || canBecomeFatherOf(potentialRel, father)) && potentialRel.newGamePlus === 0) {
					linkArray.push(
						App.UI.DOM.link(
							potentialRel.slaveName,
							() => {
								setRel(potentialRel);
								refresh();
							}
						)
					);
				}
			}

			jQuery(change).empty().append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		}));
		div.append(change);

		return div;

		function setRel(potentialRel) {
			if (potentialRel.father !== SID.GENERIC) {
				slave.father = potentialRel.father;
			} else if (slave.father !== SID.GENERIC) {
				potentialRel.father = slave.father;
			} else {
				slave.father = -20 - 2 * slave.ID - 1;
				potentialRel.father = slave.father;
			}
		}
	}

	function motherOfTheChildren() {
		const div = document.createElement("div");

		div.append(motheredNames());

		const change = App.UI.DOM.makeElement("span", App.UI.DOM.link("Change", () => {
			const linkArray = [];
			linkArray.push(
				App.UI.DOM.link(
					"Reset",
					() => {
						for (const s of getSlaves().values()) {
							if (s.mother === slave.ID && s.newGamePlus === 0) {
								s.mother = SID.GENERIC;
							}
						}
						if (V.PC.mother === slave.ID && allowPCFamily) {
							V.PC.mother = SID.GENERIC;
						}
						refresh();
					}
				)
			);

			if (canBecomeMotherOf(V.PC, slave) && allowPCFamily) {
				linkArray.push(
					App.UI.DOM.link(
						"You",
						() => {
							setRel(V.PC);
							refresh();
						}
					)
				);
			}

			for (const potentialRel of getSlaves().values()) {
				if (canBecomeMotherOf(potentialRel, slave) && potentialRel.newGamePlus === 0) {
					linkArray.push(
						App.UI.DOM.link(
							potentialRel.slaveName,
							() => {
								setRel(potentialRel);
								refresh();
							}
						)
					);
				}
			}

			jQuery(change).empty().append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		}));
		div.append(change);

		return div;

		function setRel(potentialRel) {
			potentialRel.mother = slave.ID;
			if (slave.vagina === 0) {
				slave.vagina = 1;
			}
		}
	}

	function motheredNames() {
		const children = App.StartingGirls.listOfSlavesWithParent("mother", slave.ID);
		let r = slave.ID === SID.PC ? "You are " : `${slave.slaveName} is `;
		if (children) {
			r += `the mother of these children: ${children}. Add: `;
		} else {
			r += `not a mother to any children yet. Add: `;
		}
		return r;
	}

	function fatherOfTheChildren() {
		const div = document.createElement("div");

		div.append(fatheredNames());

		const change = App.UI.DOM.makeElement("span", App.UI.DOM.link("Change", () => {
			const linkArray = [];
			linkArray.push(
				App.UI.DOM.link(
					"Reset",
					() => {
						for (const s of getSlaves().values()) {
							if (s.father === slave.ID && s.newGamePlus === 0) {
								s.father = SID.GENERIC;
							}
						}
						if (V.PC.father === slave.ID && allowPCFamily) {
							V.PC.father = SID.GENERIC;
						}
						refresh();
					}
				)
			);

			if (canBecomeFatherOf(V.PC, slave) && allowPCFamily) {
				linkArray.push(
					App.UI.DOM.link(
						"You",
						() => {
							V.PC.father = slave.ID;
							refresh();
						}
					)
				);
			}

			for (const potentialRel of getSlaves().values()) {
				if (canBecomeFatherOf(potentialRel, slave) && potentialRel.newGamePlus === 0) {
					linkArray.push(
						App.UI.DOM.link(
							potentialRel.slaveName,
							() => {
								potentialRel.father = slave.ID;
								refresh();
							}
						)
					);
				}
			}

			jQuery(change).empty().append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		}));
		div.append(change);

		return div;
	}

	function fatheredNames() {
		const children = App.StartingGirls.listOfSlavesWithParent("father", slave.ID);
		let r = slave.ID === SID.PC ? "You are " : `${slave.slaveName} is `;
		if (children) {
			r += `the father of these children: ${children}. Add: `;
		} else {
			r += `not a father to any children yet. Add: `;
		}
		return r;
	}

	function resetAllRelativesOfPC() {
		return App.UI.DOM.makeElement(
			"div",
			App.UI.DOM.link(
				"Reset ALL PC Relatives",
				() => {
					for (const s of getSlaves().values()) {
						if (s.newGamePlus === 0) {
							if (s.mother === SID.PC || s.mother === V.PC.mother) {
								s.mother = SID.GENERIC;
							}
							if (s.father === SID.PC || s.father === V.PC.father) {
								s.father = SID.GENERIC;
							}
						}
					}
					if (slave.mother === SID.PC || slave.mother === V.PC.mother) {
						slave.mother = SID.GENERIC;
					}
					if (slave.father === SID.PC || slave.father === V.PC.father) {
						slave.father = SID.GENERIC;
					}
					V.PC.father = SID.GENERIC;
					V.PC.mother = SID.GENERIC;
					refresh();
				}
			)
		);
	}

	function makeElWithID(id, elType = "div") {
		const el = document.createElement(elType);
		el.id = id;
		return el;
	}

	/**
	 * @param {string} rel "mother", etc. Property of slave object.
	 * @returns {string|HTMLElement}
	 */
	function parentName(rel) {
		if (slave[rel] === SID.PC) {
			return `You`;
		} else {
			const relObj = getSlave(slave[rel]);
			return relObj ? App.UI.DOM.slaveDescriptionDialog(relObj) : "unknown to you";
		}
	}

	function refresh() {
		jQuery('#family-table').replaceWith(makeFamilyTable);
		jQuery('#dont-be-dumb').empty().append(App.UI.DOM.makeElement("div", "You will break things by making impossible relations such as being your own father. If you do this, clearing all PC relations will fix it. Probably.", "note"));
		jQuery(familyTree).empty().append(App.StartingGirls.uncommittedFamilyTree(slave));
	}
};
