App.StartingGirls.passage = function() {
	V.temp.activeSlave = V.temp.activeSlave || App.StartingGirls.generate();
	if (!jsDef(V.temp.applyCareerBonus)) {
		V.temp.applyCareerBonus = 1;
	}
	const el = new DocumentFragment();
	let r = [];
	let linkArray = [];
	if (slaveCount() === 0) {
		r.push(`You're no stranger to the Free Cities, which means you're no stranger to slavery. If you wish, you can bring slaves from your past life with you to your arcology. You can spend your cash reserves on slaves here, or bring it with you to start the game. Slaves created here will be much cheaper than if they were purchased on the market.`);
		if (V.PC.dick !== 0 && V.PC.vagina !== -1 && (V.seeDicks !== 0 || V.makeDicks === 1)) {
			r.push(`Since you have both a penis and a vagina yourself, you've obviously had access to a source of advanced surgery and organ farming. <span class="skill player">Slaves get a smaller cost increase here for having both penises and vaginas, and for having both testicles and ovaries.</span>`);
		}
		if (isPCCareerInCategory("slaver")) {
			r.push(`Since you`);
			if (V.PC.career === "slaver") {
				r.push(`personally saw to the capture, breaking and or training of`);
			} else if (V.PC.career === "slave overseer") {
				r.push(`managed the slave pits that processed`);
			} else if (V.PC.career === "slave tender") {
				r.push(`helped train`);
			}
			r.push(`these slaves, <span class="skill player">they cost half of what they normally would have here.</span>`);
		}
	} else {
		const pronoun = slaveCount() > 1 ? "they" : getPronouns(getSlaves().atIndex(0).value).he;
		r.push(`The following slave records have been finalized; ${pronoun} will arrive with you when you take over your new arcology.`);
	}
	r.push(App.UI.DOM.makeElement("div", "Current cash reserves can be found on the far left sidebar."));
	App.Events.addNode(el, r, "p");
	if (slaveCount() > 0) {
		for (const slave of getSlaves().values()) {
			const cost = slave.slaveCost;
			App.Events.addNode(el, [
				App.UI.DOM.slaveDescriptionDialog(slave),
				`costing: ${cashFormatColor(cost)}`,
				App.UI.DOM.generateLinksStrip([
					App.UI.DOM.link("Delete", () => {
						cashX(Math.abs(cost), "slaveTransfer", slave);
						removeSlave(slave);
						App.UI.reload();
					})
				])
			], "div");
		}
		App.Events.addNode(el, [], "p");
	}

	const headerLinks = App.UI.DOM.appendNewElement("div", el);
	linkArray.push(
		App.UI.DOM.makeElement(
			"span",
			App.UI.DOM.passageLink("Refresh", "Starting Girls"),
			["major-link"]
		)
	);
	linkArray.push(
		App.UI.DOM.link(
			"Randomize career",
			() => {
				asSlave(V.temp.activeSlave).career = randomCareer(asSlave(V.temp.activeSlave));
				App.UI.reload();
			}
		)
	);

	linkArray.push(
		App.UI.DOM.link(
			"Randomize name",
			() => {
				nationalityToName(asSlave(V.temp.activeSlave));
				asSlave(V.temp.activeSlave).slaveName = asSlave(V.temp.activeSlave).birthName;
				App.UI.reload();
			}
		)
	);

	linkArray.push(
		App.UI.DOM.link(
			"Start over with a random slave",
			() => {
				V.temp.activeSlave = App.StartingGirls.generate();
				App.UI.reload();
			}
		)
	);

	linkArray.push(
		App.UI.DOM.link(
			"Start over by selecting an archetype",
			() => {
				const el = new DocumentFragment();
				App.UI.DOM.appendNewElement("div", el, "Convenient combinations of slave attributes", "note");
				App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
					"Irish Rose",
					() => {
						V.temp.activeSlave = App.StartingGirls.generate({nationality: "Irish", race: "white"});
						V.temp.activeSlave.eye.origColor = "green";
						V.temp.activeSlave.origSkin = "fair";
						V.temp.activeSlave.origHColor = "red";
						V.temp.activeSlave.markings = "heavily freckled";
						V.temp.activeSlave.face = 55;
						App.UI.reload();
					}
				), "indent")
					.append(App.UI.DOM.makeElement("span", " A beautiful flower from the Emerald Isle", "note"));

				App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
					"Cali Girl",
					() => {
						V.temp.activeSlave = App.StartingGirls.generate({nationality: "American", race: "white"});
						V.temp.activeSlave.eye.origColor = "blue";
						V.temp.activeSlave.skin = "sun tanned";
						V.temp.activeSlave.overrideSkin = 1;
						V.temp.activeSlave.origHColor = "blonde";
						V.temp.activeSlave.markings = "none";
						V.temp.activeSlave.face = 55;
						V.temp.activeSlave.muscles = 20;
						V.temp.activeSlave.weight = -20;
						V.temp.activeSlave.natural.height = 190;
						V.temp.activeSlave.height = Height.forAge(V.temp.activeSlave.natural.height, V.temp.activeSlave);
						App.UI.reload();
					}
				), "indent")
					.append(App.UI.DOM.makeElement("span", " Tall, taut, and tan", "note"));

				App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
					"Novice",
					() => {
						V.temp.activeSlave = App.StartingGirls.generate({minAge: 18, maxAge: 18});
						V.temp.activeSlave.skill.anal = 0;
						V.temp.activeSlave.skill.oral = 0;
						V.temp.activeSlave.skill.vaginal = 0;
						V.temp.activeSlave.skill.penetrative = 0;
						V.temp.activeSlave.skill.whoring = 0;
						V.temp.activeSlave.skill.entertainment = 0;
						V.temp.activeSlave.skill.combat = 0;
						V.temp.activeSlave.fetishKnown = 0;
						V.temp.activeSlave.attrKnown = 0;
						App.UI.reload();
					}
				), "indent")
					.append(App.UI.DOM.makeElement("span", " Train your own and save", "note"));

				App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
					"Head Girl Prospect",
					() => {
						V.temp.activeSlave = App.StartingGirls.generate({minAge: 36, maxAge: 44});
						V.temp.activeSlave.career = App.Data.Careers.Leader.HG.random();
						V.temp.activeSlave.intelligence = 70;
						V.temp.activeSlave.intelligenceImplant = 0;
						App.UI.reload();
					}
				), "indent")
					.append(App.UI.DOM.makeElement("span", " Inexpensive potential to become a great right hand woman", "note"));

				if (V.seeExtreme !== 0) {
					App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
						"Wellspring",
						() => {
							V.temp.activeSlave = App.StartingGirls.generate({minAge: 18, maxAge: 18});
							V.temp.activeSlave.skill.anal = 0;
							V.temp.activeSlave.skill.oral = 0;
							V.temp.activeSlave.skill.vaginal = 0;
							V.temp.activeSlave.skill.penetrative = 0;
							V.temp.activeSlave.skill.whoring = 0;
							V.temp.activeSlave.skill.entertainment = 0;
							V.temp.activeSlave.skill.combat = 0;
							V.temp.activeSlave.fetishKnown = 0;
							V.temp.activeSlave.attrKnown = 0;
							V.temp.activeSlave.health.condition = 10;
							V.temp.activeSlave.intelligence = -100;
							V.temp.activeSlave.intelligenceImplant = 0;
							V.temp.activeSlave.vagina = 3;
							V.temp.activeSlave.anus = 3;
							V.temp.activeSlave.ovaries = 1;
							V.temp.activeSlave.dick = 5;
							V.temp.activeSlave.balls = 5;
							V.temp.activeSlave.prostate = 1;
							V.temp.activeSlave.lactation = 2;
							V.temp.activeSlave.lactationDuration = 2;
							V.temp.activeSlave.nipples = "huge";
							V.temp.activeSlave.boobs = 10000;
							App.UI.reload();
						}
					), "indent")
						.append(App.UI.DOM.makeElement("span", " Capable of producing all kinds of useful fluids", "note"));

					App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
						"Onahole",
						() => {
							V.temp.activeSlave = App.StartingGirls.generate();
							applyMindbroken(V.temp.activeSlave);
							V.temp.activeSlave.voice = 0;
							V.temp.activeSlave.hears = 0;
							removeLimbs(V.temp.activeSlave, "all");
							eyeSurgery(V.temp.activeSlave, "both", "normal");
							App.UI.reload();
						}
					), "indent")
						.append(App.UI.DOM.makeElement("span", " A living cocksleeve", "note"));
				}

				App.UI.DOM.appendNewElement("div", el, App.UI.DOM.passageLink("Back", "Starting Girls"), "indent");
				jQuery(headerLinks).empty().append(el);
			}
		)
	);

	linkArray.push(
		App.UI.DOM.link(
			"Start over by selecting a nationality",
			() => {
				const el = new DocumentFragment();
				const linkArray = [];
				App.UI.DOM.appendNewElement("h3", el, "Start over by selecting a nationality:");
				for (const nation of App.Data.misc.baseNationalities) {
					linkArray.push(
						App.UI.DOM.link(
							nation,
							() => {
								V.temp.activeSlave = App.StartingGirls.generate({nationality: nation});
								App.UI.reload();
							}
						)
					);
				}
				el.append(App.UI.DOM.generateLinksStrip(linkArray));
				App.UI.DOM.appendNewElement("div", el, App.UI.DOM.passageLink("Back", "Starting Girls"));
				jQuery(headerLinks).empty().append(el);
			}
		)
	);

	/**
	 * @param {FC.HumanState} source
	 * @param {FC.SlaveState} template
	 * @param {function(FC.SlaveState): void} [afterCreateCB]
	 * */
	function relativeLinkStrip(source, template, afterCreateCB) {
		const relatives = [];
		const finish = (slave) => {
			App.StartingGirls.randomizeUnknowns(slave);
			if (typeof afterCreateCB === "function") {
				afterCreateCB(slave);
			}
		};
		const makeSiblingLink = (sibling) => {
			return App.UI.DOM.link(capFirstChar(sibling), () => {
				setMissingParents(source);
				template.mother = source.mother;
				template.father = source.father;
				V.temp.activeSlave = generateRelatedSlave(template, sibling);
				finish(V.temp.activeSlave);
				App.UI.reload();
			});
		};
		if (source) {
			relatives.push(makeSiblingLink("twin"));
			if (V.seeDicks !== 100 && source.mother === SID.GENERIC) {
				const ageRange = getParentAgeRange(source, false);
				if (ageRange.min <= ageRange.max) {
					relatives.push(
						App.UI.DOM.link("Mother", () => {
							V.temp.activeSlave = generateRelatedSlave(template, "mother");
							finish(V.temp.activeSlave);
							source.mother = V.temp.activeSlave.ID;
							App.UI.reload();
						})
					);
				}
			}
			if (V.seeDicks !== 0 && source.father === SID.GENERIC) {
				const ageRange = getParentAgeRange(source, true);
				if (ageRange.min <= ageRange.max) {
					relatives.push(
						App.UI.DOM.link("Father", () => {
							V.temp.activeSlave = generateRelatedSlave(template, "father");
							finish(V.temp.activeSlave);
							source.father = V.temp.activeSlave.ID;
							App.UI.reload();
						})
					);
				}
			}
			if (source.actualAge < V.retirementAge - 2) {
				if (V.seeDicks !== 100) {
					relatives.push(makeSiblingLink("older sister"));
				}
				if (V.seeDicks !== 0) {
					relatives.push(makeSiblingLink("older brother"));
				}
			}
			if (source.actualAge > V.minimumSlaveAge + 2) {
				if (V.seeDicks !== 100) {
					relatives.push(makeSiblingLink("younger sister"));
				}
				if (V.seeDicks !== 0) {
					relatives.push(makeSiblingLink("younger brother"));
				}
			}
			const minAgeToParent = (source.genes === "XY" ? source.pubertyAgeXY : source.pubertyAgeXX) + V.minimumSlaveAge + 1;
			if (source.actualAge > minAgeToParent) {
				if (V.seeDicks !== 100) {
					relatives.push(
						App.UI.DOM.link("Daughter", () => {
							V.temp.activeSlave = generateRelatedSlave(template, "daughter");
							finish(V.temp.activeSlave);
							App.UI.reload();
						})
					);
				}
				if (V.seeDicks !== 0) {
					relatives.push(
						App.UI.DOM.link("Son", () => {
							V.temp.activeSlave = generateRelatedSlave(template, "son");
							finish(V.temp.activeSlave);
							App.UI.reload();
						})
					);
				}
			}
		}
		return App.UI.DOM.generateLinksStrip(relatives);
	}

	linkArray.push(
		App.UI.DOM.link(
			"Start over with your relative",
			() => {
				const pcAsSlave = App.Entity.HumanState.enslavePC({badEnding: "none"});
				pcAsSlave.ID = SID.PC; // cheesy but works...DO NOT try to use this abomination for anything else
				App.UI.DOM.appendNewElement("div", el, relativeLinkStrip(V.PC, pcAsSlave, (rel) => {
					// reset some stuff that shouldn't be copied from player conversion onto relatives
					rel.career = randomCareer(rel); // not arcology owners
					rel.skill = new App.Entity.SlaveSkillsState();
					rel.trust = 0;
					rel.devotion = 0;
					rel.origin = "$auto"; // TODO:@franklygeorge custom automatic origins for PC relatives
				}));
				App.UI.DOM.appendNewElement("div", el, App.UI.DOM.passageLink("Back", "Starting Girls"));
				jQuery(headerLinks).empty().append(el);
			}
		)
	);

	const newSlaves = getSlaves().filter(s => s.newGamePlus === 0);
	if (newSlaves.size > 0) {
		linkArray.push(
			App.UI.DOM.link(
				`Start over with a finalized slave's relative`,
				() => {
					const el = new DocumentFragment();

					const options = [];
					for (const slave of newSlaves.values()) {
						options.push({
							key: slave.ID.toString(),
							name: `${SlaveFullName(slave)} (${slave.genes}, ${slave.actualAge})`
						});
					}
					const select = App.UI.DOM.makeSelect(options, null, slaveID => {
						const srcSlave = getSlave(Number.parseInt(slaveID));
						jQuery(linkDiv).empty().append(relativeLinkStrip(srcSlave, srcSlave));
					});
					App.UI.DOM.appendNewElement("div", el, App.UI.DOM.combineNodes(`Relative of slave: `, select));

					const linkDiv = App.UI.DOM.appendNewElement("div", el, ``);
					App.UI.DOM.appendNewElement("div", el, "Warning: related slaves will influence each other's opinion of you, and may become difficult to control if not properly broken.", "note");
					App.UI.DOM.appendNewElement("div", el, App.UI.DOM.passageLink("Back", "Starting Girls"));
					jQuery(headerLinks).empty().append(el);
				}
			)
		);
	}

	linkArray.push(App.UI.DOM.passageLink("Take control of your arcology", "Acquisition"));
	headerLinks.append(App.UI.DOM.generateLinksStrip(linkArray));
	el.append(headerLinks);
	App.UI.DOM.appendNewElement("hr", el);

	App.StartingGirls.cleanup(V.temp.activeSlave);
	App.Verify.slaveState(`<starting girl with id ${V.temp.activeSlave.ID}>`, V.temp.activeSlave, "none");

	if (V.temp.activeSlave.father === SID.PC) {
		if (V.PC.dick === 0) {
			V.temp.activeSlave.father = SID.GENERIC;
		} else if ((V.PC.actualAge - V.temp.activeSlave.actualAge) < V.minimumSlaveAge || ((V.PC.actualAge - V.temp.activeSlave.actualAge) < V.potencyAge)) {
			V.temp.activeSlave.father = SID.GENERIC;
		}
		if (V.saveImported === 1) {
			V.temp.activeSlave.father = SID.GENERIC;
		}
	}
	if (V.temp.activeSlave.mother === SID.PC) {
		if (V.PC.vagina === -1) {
			V.temp.activeSlave.mother = SID.GENERIC;
		} else if (((V.PC.actualAge - V.temp.activeSlave.actualAge) < V.minimumSlaveAge) || ((V.PC.actualAge - V.temp.activeSlave.actualAge) < V.fertilityAge)) {
			V.temp.activeSlave.mother = SID.GENERIC;
		}
		if (V.saveImported === 1) {
			V.temp.activeSlave.mother = SID.GENERIC;
		}
	}

	App.UI.DOM.appendNewElement("h2", el, "You are customizing this slave:");
	el.append(App.Desc.longSlave(V.temp.activeSlave, {market: "starting"}));

	const tabBar = new App.UI.Tabs.TabBar("StartingGirls");
	tabBar.addTab("Profile", "profile", App.StartingGirls.profile(V.temp.activeSlave));
	tabBar.addTab("Physical", "physical", App.StartingGirls.physical(V.temp.activeSlave));
	tabBar.addTab("Upper", "upper", App.StartingGirls.upper(V.temp.activeSlave));
	tabBar.addTab("Lower", "lower", App.StartingGirls.lower(V.temp.activeSlave));
	tabBar.addTab("Genetic Quirks", "genes", App.StartingGirls.genes(V.temp.activeSlave));
	tabBar.addTab("Mental", "mental", App.StartingGirls.mental(V.temp.activeSlave));
	tabBar.addTab("Skills", "skills", App.StartingGirls.skills(V.temp.activeSlave));
	tabBar.addTab("Stats", "stats", App.StartingGirls.stats(V.temp.activeSlave));
	tabBar.addTab("Family", "family", App.Intro.editFamily(V.temp.activeSlave));
	tabBar.addTab("Body Mods", "body-mods", App.UI.bodyModification(V.temp.activeSlave, true, true));
	tabBar.addTab("Salon", "salon", App.UI.salon(V.temp.activeSlave, true, true));
	tabBar.addTab("Import / Export", "import-export", importExportContent());
	tabBar.addTab("Finalize", "finalize", App.StartingGirls.finalize(V.temp.activeSlave),
		startingSlaveCost(V.temp.activeSlave) > V.cash ? "show-warning" : undefined);
	el.append(tabBar.render());

	return el;

	/**
	 * @returns {DocumentFragment}
	 */
	function importExportContent() {
		const el = new DocumentFragment();

		App.UI.DOM.appendNewElement("div", el, "This functionality is currently experimental.", ["warning"]);

		const textareaElement = App.UI.DOM.makeElement("textarea");

		const errorDiv = App.UI.DOM.makeElement("div");
		App.UI.DOM.appendNewElement("h4", errorDiv, "An error occurred!");

		App.UI.DOM.appendNewElement("div", el,
			App.UI.DOM.link("Export this slave", () => {
				// @ts-expect-error V.temp.activeSlave is defined at this point
				textareaElement.value = App.UI.SlaveInteract.exportSlave(V.temp.activeSlave);
			})
		);

		App.UI.DOM.appendNewElement("div", el,
			App.UI.DOM.link(
				"Import this slave",
				() => {
					App.Verify.Utils.verificationError = false;
					let slave = App.UI.SlaveInteract.importSlaveFromString(textareaElement.value, errorDiv);
					if (App.Verify.Utils.verificationError) {
						el.append(errorDiv);
					} else {
						V.temp.activeSlave = slave;
						App.UI.reload();
					}
				},
			)
		);

		el.append(textareaElement);

		return el;
	}
};
