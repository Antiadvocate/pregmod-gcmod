/**
 * @param {FC.HumanState} actor
 * @param {function():void} [refresh]
 * @returns {HTMLParagraphElement}
 */
globalThis.customImageSelector = (actor, refresh) => {
	refresh = refresh ?? App.UI.reload;
	const {
		him,
	} = getPronouns(actor);
	let el = document.createElement('p');
	el.append(`Assign ${(actor.ID === SID.PC) ? "yourself" : him} a custom image: `);

	const textbox = document.createElement("input");
	textbox.value = actor.custom.image === null ? "" : actor.custom.image.filename;
	el.appendChild(textbox);

	let kbd = document.createElement('kbd');
	const select = document.createElement('select');
	select.style.border = "none";

	[
		"png",
		"jpg",
		"gif",
		"webm",
		"webp",
		"mp4"
	].forEach((fileType) => {
		const el = document.createElement('option');
		el.value = fileType;
		el.text = fileType.toUpperCase();
		select.add(el);
	});
	select.value = actor.custom.image ? actor.custom.image.format : "png";

	kbd.append(`.`);
	kbd.appendChild(select);
	el.appendChild(kbd);

	el.appendChild(
		App.UI.DOM.link(
			` Reset`,
			() => {
				actor.custom.image = null;
				refresh();
				App.Events.refreshEventArt(actor);
			},
		)
	);

	let choices = document.createElement('div');
	choices.className = "choices";
	let note = document.createElement('span');
	note.className = "note";
	note.append(`Place file in the `);
	note.appendChild(App.UI.DOM.makeElement('kbd', 'resources'));
	note.append(` folder. Choose the extension from the menu first, then enter the filename in the space and press enter. For example, for a file with the path `);
	note.appendChild(App.UI.DOM.makeElement('kbd', `\\bin\\resources\\headgirl.png`));
	note.append(`, choose `);
	note.appendChild(App.UI.DOM.makeElement('kbd', 'png'));
	note.append(` then enter `);
	note.appendChild(App.UI.DOM.makeElement('kbd', 'headgirl'));
	note.append(`.`);

	choices.appendChild(note);
	el.appendChild(choices);

	textbox.onchange = () => {
		const c = actor.custom;
		if (textbox.value.length === 0) {
			c.image = null;
		} else {
			if (c.image === null) {
				c.image = {
					filename: textbox.value,
					format: /** @type {FC.ImageFormat} */ (select.value)
				};
			} else {
				c.image.filename = textbox.value;
			}
			refresh();
			App.Events.refreshEventArt(actor);
		}
	};
	select.onchange = () => {
		if (actor.custom.image !== null) {
			actor.custom.image.format = /** @type {FC.ImageFormat} */ (select.value);
			refresh();
			App.Events.refreshEventArt(actor);
		}
	};

	return el;
};

/**
 * @param {FC.SlaveState} slave
 * @param {function():void} refresh
 * @returns {HTMLDivElement}
 */
App.UI.SlaveInteract.custom = function(slave, refresh) {
	const {
		He, His,
		he, his, him,
	} = getPronouns(slave);

	const el = document.createElement('div');

	el.append(intro());

	App.UI.DOM.appendNewElement("h3", el, `Art`);
	el.append(
		customImageSelector(slave, refresh),
		customHairImage(),
		artSeed()
	);
	if (V.seeImages && V.imageChoice === 6) {
		el.append(App.Art.GenAI.UI.SlaveInteract.custom(slave, refresh));
	}

	App.UI.DOM.appendNewElement("h3", el, `Names`);
	el.append(
		playerTitle(),
		slaveFullName(),
		pronouns()
	);

	App.UI.DOM.appendNewElement("h3", el, `Description`);
	el.append(
		hair(),
		eyeColor(),
		customTattoo(),
		customOriginStory(),
		customDescription(),
		customSlaveTitle(),
		customLabel()
	);

	return el;

	function intro() {
		const frag = new DocumentFragment();
		let p;
		p = document.createElement('p');
		p.id = "rename";
		frag.append(p);

		p = document.createElement('p');
		p.className = "scene-p";
		p.append(`You may enter custom descriptors for your slave's hair color, hair style, tattoos, or anything else here. After typing, press `);
		p.appendChild(App.UI.DOM.makeElement("kbd", "enter"));
		p.append(` to commit your change. These custom descriptors will appear in descriptions of your slave, but will have no gameplay effect. Changing them is free.`);
		frag.append(p);
		return frag;
	}

	function playerTitle() {
		let playerTitle = document.createElement('p');
		const label = document.createElement('div');
		let result;
		if (slave.devotion >= -50) {
			if (slave.custom.title !== "") {
				label.textContent = `You have instructed ${him} to always refer to you as ${slave.custom.title}, which, should ${he} lisp, comes out as ${slave.custom.titleLisp}.`;
			} else {
				label.textContent = `You expect ${him} to refer to you as all your other slaves do.`;
			}
			result = document.createElement('div');
			result.id = "result";
			result.className = "choices";

			let hiddenTextBox = document.createElement('span');
			let shownTextBox = document.createElement('span');
			if (slave.custom.title === "") {
				hiddenTextBox.appendChild(
					App.UI.DOM.link(
						`Set a custom title for ${him} to address you as`,
						() => {
							jQuery('#result').empty().append(shownTextBox);
						}
					)
				);
				result.appendChild(hiddenTextBox);
				shownTextBox.textContent = `Custom title: `;
				shownTextBox.append(
					App.UI.DOM.makeTextBox(
						"",
						v => {
							slave.custom.title = v;
							slave.custom.titleLisp = lispReplace(slave.custom.title);
							refresh();
						}
					)
				);
			} else {
				result.append(`${He}'s trying ${his} best to call you `);
				result.append(
					App.UI.DOM.makeTextBox(
						slave.custom.title,
						v => {
							slave.custom.title = v;
							slave.custom.titleLisp = lispReplace(slave.custom.title);
							refresh();
						}
					)
				);
				result.appendChild(
					App.UI.DOM.link(
						` Stop using a custom title`,
						() => {
							slave.custom.title = "";
							slave.custom.titleLisp = "";
							refresh();
						}
					)
				);
			}
			label.appendChild(result);
		} else {
			label.textContent = `You must break ${his} will further before ${he} will refer to you by a new title. `;
			if (SlaveStatsChecker.checkForLisp(slave)) {
				if (slave.custom.titleLisp && slave.custom.titleLisp !== "") {
					label.textContent += `For now, ${he} intends to keep calling you "${slave.custom.titleLisp}."`;
				}
			} else {
				if (slave.custom.title && slave.custom.title !== "") {
					label.textContent += `For now, ${he} intends to keep calling you "${slave.custom.title}."`;
				}
			}
		}
		playerTitle.appendChild(label);
		return playerTitle;
	}

	function slaveFullName() {
		let slaveFullNameNode = document.createElement('span');
		if (
			((slave.devotion >= -50 || slave.trust < -20) && (slave.birthName !== slave.slaveName)) ||
			(slave.devotion > 20 || slave.trust < -20)
		) {
			slaveFullNameNode.appendChild(slaveName());
			slaveFullNameNode.appendChild(slaveSurname());
		} else {
			slaveFullNameNode.textContent = `You must break ${his} will further before you can successfully force a new name on ${him}.`;
			slaveFullNameNode.className = "note";
		}

		return slaveFullNameNode;

		function slaveName() {
			const oldName = slave.slaveName;
			const oldSurname = slave.slaveSurname;
			// Slave Name
			let slaveNameNode = document.createElement('p');
			let label = document.createElement('div');
			let result = document.createElement('div');
			result.id = "result";
			result.className = "choices";
			const linkArray = [];

			label.append(`Change ${his} given name`);
			if (slave.birthName !== slave.slaveName) {
				if (slave.birthName === "") {
					label.append(` (${his} birth name is not known)`);
				} else {
					label.append(` (${his} birth name was ${slave.birthName})`);
				}
			}
			label.append(`: `);

			label.append(
				App.UI.DOM.makeTextBox(
					slave.slaveName,
					v => {
						slave.slaveName = v;
						updateName(slave, {oldName: oldName, oldSurname: oldSurname});
					},
					false,
				)
			);

			slaveNameNode.appendChild(label);

			if (slave.slaveName === slave.birthName) {
				linkArray.push(App.UI.DOM.disabledLink(`${He} has ${his} birth name`, [`Nothing to reset`]));
			} else if (slave.birthName === "") {
				linkArray.push(App.UI.DOM.disabledLink(`${He} has no birth name to restore`, [`Nothing to reset`]));
			} else {
				linkArray.push(App.UI.DOM.link(
					`Restore ${his} birth name`,
					() => {
						slave.slaveName = slave.birthName;
						updateName(slave, {oldName: oldName, oldSurname: oldSurname});
					}
				));
			}

			if (FutureSocieties.isActive('FSPastoralist')) {
				if (slave.lactation > 0) {
					linkArray.push(chooseThreeNames(`Choose a random cow name for ${him}`, App.Data.misc.cowSlaveNames));
				}
			}
			if (FutureSocieties.isActive('FSIntellectualDependency')) {
				if (slave.intelligence + slave.intelligenceImplant < -10) {
					linkArray.push(chooseThreeNames(`Give ${him} a random stripper given name`, App.Data.misc.bimboSlaveNames));
				}
			}
			if (FutureSocieties.isActive('FSChattelReligionist')) {
				linkArray.push(chooseThreeNames(`Give ${him} a random devotional given name`, App.Data.misc.chattelReligionistSlaveNames));
			}
			if (slave.race === "catgirl") {
				linkArray.push(chooseThreeNames(`Give ${him} a random cat name`, App.Data.misc.catSlaveNames));
			}
			result.append(App.UI.DOM.generateLinksStrip(linkArray));
			slaveNameNode.appendChild(result);
			return slaveNameNode;

			/**
			 * @param {string} title
			 * @param {string[]} array
			 */
			function chooseThreeNames(title, array) {
				const el = document.createElement("span");
				el.append(
					App.UI.DOM.link(
						title,
						() => {
							linkGuts();
						}
					)
				);
				return el;

				function linkGuts() {
					// Pick three random names, not including the slave's current name
					const names = array.filter(n => n !== slave.slaveName).pluckMany(3);

					// return the three names as links
					const nameLinks = names.map(n =>
						App.UI.DOM.link(n, () => {
							slave.slaveName = n;
							updateName(slave, {oldName: oldName, oldSurname: oldSurname});
						})
					);
					nameLinks.push(
						App.UI.DOM.link("...", () => {
							linkGuts();
						})
					);
					jQuery(el).empty().append(App.UI.DOM.generateLinksStrip(nameLinks));
				}
			}
		}

		function slaveSurname() {
			// Slave Surname
			const oldName = slave.slaveName;
			const oldSurname = slave.slaveSurname;
			const linkArray = [];
			let slaveSurnameNode = document.createElement('p');
			let label = document.createElement('div');
			let result = document.createElement('div');
			result.id = "result";
			result.className = "choices";

			label.append(`Change ${his} surname`);
			if (slave.birthSurname !== slave.slaveSurname) {
				if (slave.birthSurname === "") {
					label.append(` (${his} birth surname is not known)`);
				} else {
					label.append(` (${his} birth surname was ${slave.birthSurname})`);
				}
			}
			label.append(`: `);

			label.append(
				App.UI.DOM.makeTextBox(
					slave.slaveSurname,
					v => {
						slave.slaveSurname = v;
						updateName(slave, {oldName: oldName, oldSurname: oldSurname});
					},
					false,
				)
			);

			slaveSurnameNode.appendChild(label);

			if (slave.slaveSurname === slave.birthSurname) {
				linkArray.push(
					App.UI.DOM.disabledLink(
						`Restore ${his} birth surname`,
						[`${He} has ${his} birth surname`]
					)
				);
			} else if (slave.birthSurname === "") {
				linkArray.push(
					App.UI.DOM.disabledLink(
						`Restore ${his} birth surname`,
						[`${He} has no birth surname to restore`]
					)
				);
			} else {
				linkArray.push(App.UI.DOM.link(
					`Restore ${his} birth surname`,
					() => {
						slave.slaveSurname = slave.birthSurname;
						updateName(slave, {oldName: oldName, oldSurname: oldSurname});
					}
				));
			}
			if (getSlave(slave.mother) || getSlave(slave.father) || slave.mother === SID.PC || slave.father === SID.PC) {
				linkArray.push(App.UI.DOM.link(
					`Regenerate ${his} surname based on current Universal Rules`,
					() => {
						regenerateSurname(slave);
						updateName(slave, {oldName: oldName, oldSurname: oldSurname});
					}
				));
			}
			if (V.surnameArcology) {
				linkArray.push(App.UI.DOM.link(
					`Give ${him} the arcology surname ${V.surnameArcology}`,
					() => {
						slave.slaveSurname = V.surnameArcology;
						updateName(slave, {oldName: oldName, oldSurname: oldSurname});
					}
				));
			}
			if (slave.slaveSurname) {
				linkArray.push(App.UI.DOM.link(
					`Take ${his} surname away`,
					() => {
						slave.slaveSurname = 0;
						updateName(slave, {oldName: oldName, oldSurname: oldSurname});
					}
				));
			}
			if (slave.relationship >= 5) {
				const spouse = getSlave(slave.relationshipTarget);
				if (spouse.slaveSurname && slave.slaveSurname !== spouse.slaveSurname) {
					const wifePronouns = getPronouns(spouse);
					linkArray.push(
						App.UI.DOM.link(
							`Give ${him} ${his} ${wifePronouns.wife}'s surname`,
							() => {
								slave.slaveSurname = spouse.slaveSurname;
								updateName(slave, {oldName: oldName, oldSurname: oldSurname});
							}
						)
					);
				}
			}
			if (slave.relationship === -3) {
				if (V.PC.slaveSurname && slave.slaveSurname !== V.PC.slaveSurname) {
					linkArray.push(
						App.UI.DOM.link(
							`Give ${him} your surname`,
							() => {
								slave.slaveSurname = V.PC.slaveSurname;
								updateName(slave, {oldName: oldName, oldSurname: oldSurname});
							}
						)
					);
				}
			}
			if (FutureSocieties.isActive('FSRomanRevivalist')) {
				linkArray.push(
					App.UI.DOM.link(
						`Give ${him} a random full Roman name`,
						() => {
							slave.slaveName = App.Data.misc.romanSlaveNames.random();
							slave.slaveSurname = App.Data.misc.romanSlaveSurnames.random();
							updateName(slave, {oldName: oldName, oldSurname: oldSurname});
						}
					)
				);
			} else if (FutureSocieties.isActive('FSAztecRevivalist')) {
				linkArray.push(
					App.UI.DOM.link(
						`Give ${him} a random full Aztec name`,
						() => {
							slave.slaveName = App.Data.misc.aztecSlaveNames.random();
							slave.slaveSurname = 0;
							updateName(slave, {oldName: oldName, oldSurname: oldSurname});
						}
					)
				);
			} else if (FutureSocieties.isActive('FSEgyptianRevivalist')) {
				linkArray.push(
					App.UI.DOM.link(
						`Give ${him} a random full ancient Egyptian name`,
						() => {
							slave.slaveName = App.Data.misc.ancientEgyptianSlaveNames.random();
							slave.slaveSurname = 0;
							updateName(slave, {oldName: oldName, oldSurname: oldSurname});
						}
					)
				);
			} else if (FutureSocieties.isActive('FSEdoRevivalist')) {
				linkArray.push(
					App.UI.DOM.link(
						`Give ${him} a random full feudal Japanese name`,
						() => {
							slave.slaveName = App.Data.misc.edoSlaveNames.random();
							slave.slaveSurname = App.Data.misc.edoSlaveSurnames.random();
							updateName(slave, {oldName: oldName, oldSurname: oldSurname});
						}
					)
				);
			} else if (FutureSocieties.isActive('FSChineseRevivalist')) {
				linkArray.push(
					App.UI.DOM.link(
						`Give ${him} a random full Ancient Chinese name`,
						() => {
							slave.slaveName = App.Data.misc.chineseSlaveNames.random();
							slave.slaveSurname = App.Data.misc.chineseRevivalistSlaveSurnames.random();
							updateName(slave, {oldName: oldName, oldSurname: oldSurname});
						}
					)
				);
			} else if (FutureSocieties.isActive('FSAntebellumRevivalist')) {
				linkArray.push(
					App.UI.DOM.link(
						`Give ${him} a random full old Southern name`,
						() => {
							slave.slaveName = App.Data.misc.antebellumSlaveNames.random();
							slave.slaveSurname = App.Data.misc.antebellumSlaveSurnames.random();
							updateName(slave, {oldName: oldName, oldSurname: oldSurname});
						}
					)
				);
			}
			if (FutureSocieties.isActive('FSDegradationist')) {
				linkArray.push(
					App.UI.DOM.link(
						`Give ${him} a degrading full name`,
						() => {
							DegradingName(slave);
							updateName(slave, {oldName: oldName, oldSurname: oldSurname});
						}
					)
				);
			}
			result.append(App.UI.DOM.generateLinksStrip(linkArray));
			slaveSurnameNode.appendChild(result);
			return slaveSurnameNode;
		}

		function updateName(slave, {oldName: oldName, oldSurname: oldSurname}) {
			let genepoolRec = isInGenePool(slave) ? getGenePoolRecordWriteMode(slave) : undefined;
			if (genepoolRec) {
				genepoolRec.slaveName = slave.slaveName;
				genepoolRec.slaveSurname = slave.slaveSurname;
				App.UI.SlaveInteract.rename(slave, {oldName: oldName, oldSurname: oldSurname});
			}
			refresh();
		}
	}

	function pronouns() {
		const pnNode = new DocumentFragment();

		const grp = new App.UI.OptionsGroup(); // note that OptionsGroup's default refresh will reload the entire page, which is desirable in this case
		grp.addOption("Pronouns to use:", "pronoun", slave)
			.addValue("Feminine", App.Data.Pronouns.Kind.female)
			.addValue("Masculine", App.Data.Pronouns.Kind.male)
			.addValue("Neuter/Toy", App.Data.Pronouns.Kind.neutral)
			// .addValue("Epicene/Plural", App.Data.Pronouns.Kind.epicene) - TODO: epicene pronouns have verb tense problems ("they is...")
			// .addValue("Custom", App.Data.Pronouns.Kind.custom) - TODO: custom pronoun mechanism is incomplete/broken right now
			.addComment(`${slave.slaveName} will be addressed as "${he}/${him}."`);

		pnNode.append(grp.render());

		return pnNode;
	}

	function hair() {
		let hairNode = new DocumentFragment();
		hairNode.appendChild(hairStyle());
		hairNode.appendChild(hairColor());
		return hairNode;

		function hairStyle() {
			let hairStyleNode = document.createElement('p');
			let label = document.createElement('div');
			label.append(`Custom hair description: `);

			label.append(
				App.UI.DOM.makeTextBox(
					slave.hStyle,
					v => {
						// @ts-expect-error string is not a valid FC.HairStyle
						slave.hStyle = v;
						refresh();
					}
				)
			);

			switch (slave.hStyle) {
				case "tails":
				case "dreadlocks":
				case "drills":
				case "cornrows":
				case "bangs":
					label.append(` "${His} hair is in ${slave.hStyle}."`);
					break;
				case "ponytail":
					label.append(` "${His} hair is in a ${slave.hStyle}."`);
					break;
				case "hime":
					label.append(` "${His} hair is in a ${slave.hStyle} cut."`);
					break;
				default:
					label.append(` "${His} hair is ${slave.hStyle}."`);
					break;
			}
			hairStyleNode.appendChild(label);

			let choices = document.createElement('div');
			choices.className = "choices";
			choices.appendChild(App.UI.DOM.makeElement('span', ` For best results, use a short, uncapitalized and unpunctuated description; for example: 'back in a ponytail'`, 'note'));
			hairStyleNode.appendChild(choices);
			return hairStyleNode;
		}

		function hairColor() {
			let hairStyleNode = document.createElement('p');
			let label = document.createElement('div');
			label.append(`Custom hair color: `);
			label.append(
				App.UI.DOM.makeTextBox(
					slave.hColor,
					v => {
						slave.hColor = v;
						refresh();
					}
				)
			);
			label.append(` "${His} hair is ${slave.hColor}."`);
			hairStyleNode.appendChild(label);

			let choices = document.createElement('div');
			choices.className = "choices";
			choices.appendChild(App.UI.DOM.makeElement('span', ` For best results, use a short, uncapitalized and unpunctuated description; for example: 'black with purple highlights'`, 'note'));
			hairStyleNode.appendChild(choices);
			return hairStyleNode;
		}
	}

	function eyeColor() {
		let eyeColorNode = document.createElement('p');
		let label = document.createElement('div');
		if (getLenseCount(slave) > 0) {
			label.textContent = `${He} is wearing ${App.Desc.eyesColor(slave, "", "lense", "lenses")}.`;
		} else {
			label.textContent = `${He} has ${App.Desc.eyesColor(slave)}.`;
		}
		eyeColorNode.appendChild(label);

		let choices = document.createElement('div');
		choices.className = "choices";

		let eye;

		if (hasLeftEye(slave)) {
			eye = document.createElement('div');
			eye.append(`Custom left eye color: `);
			eye.append(
				App.UI.DOM.makeTextBox(
					slave.eye.left.iris,
					v => {
						slave.eye.left.iris = v;
						refresh();
					}
				)
			);
			choices.appendChild(eye);
		}
		if (hasRightEye(slave)) {
			eye = document.createElement('div');
			eye.append(`Custom right eye color: `);
			eye.append(
				App.UI.DOM.makeTextBox(
					slave.eye.right.iris,
					v => {
						slave.eye.right.iris = v;
						refresh();
					}
				)
			);
			choices.appendChild(eye);
		}
		choices.appendChild(App.UI.DOM.makeElement('span', `For best results, use a short, uncapitalized and unpunctuated description; for example: 'blue'`, 'note'));
		eyeColorNode.appendChild(choices);
		return eyeColorNode;
	}

	function customTattoo() {
		let el = document.createElement('p');
		el.append(`Change ${his} custom tattoo: `);
		el.appendChild(App.UI.DOM.makeTextBox(
			slave.custom.tattoo,
			v => {
				slave.custom.tattoo = v;
				refresh();
			}));

		let choices = document.createElement('div');
		choices.className = "choices";
		choices.appendChild(App.UI.DOM.makeElement('span', `For best results, use complete sentences; for example: '${He} has blue stars tattooed along ${his} cheekbones.'`, 'note'));
		el.appendChild(choices);

		return el;
	}

	function customOriginStory() {
		let el = document.createElement('p');
		el.append(`Change ${his} origin story: `);
		el.appendChild(App.UI.DOM.makeTextBox(
			slave.origin,
			v => {
				slave.origin = v;
				refresh();
			}));

		let choices = document.createElement('div');
		choices.className = "choices";
		choices.appendChild(App.UI.DOM.makeElement('span', ` For best results, use complete, capitalized and punctuated sentences; for example: '${He} followed you home from the pet store.'`, 'note'));
		el.appendChild(choices);

		return el;
	}

	function customDescription() {
		let el = document.createElement('p');
		el.append(`Change ${his} custom description: `);
		el.appendChild(
			App.UI.DOM.makeTextBox(
				pronounsForSlaveProp(slave, slave.custom.desc),
				v => {
					slave.custom.desc = v;
					refresh();
				}
			)
		);

		let choices = document.createElement('div');
		choices.className = "choices";
		choices.appendChild(App.UI.DOM.makeElement('span', ` For best results, use complete, capitalized and punctuated sentences; for example: '${He} has a beauty mark above ${his} left nipple.'`, 'note'));
		el.appendChild(choices);

		return el;
	}

	function customSlaveTitle() {
		let el = document.createElement('p');
		el.append(`Change ${his} custom slave title: `);
		el.appendChild(
			App.UI.DOM.makeTextBox(slave.custom.name,
				v => {
					slave.custom.name = v;
					refresh();
				}
			)
		);

		let choices = document.createElement('div');
		choices.className = "choices";
		choices.appendChild(App.UI.DOM.makeElement('span', ` For best results, should fit into a sentence like: '${SlaveFullName(slave)} is a "slave title"'`, 'note'));
		el.appendChild(choices);

		return el;
	}

	function customLabel() {
		let el = document.createElement('p');
		el.append(`Change ${his} custom label: `);
		el.appendChild(App.UI.DOM.makeTextBox(
			slave.custom.label,
			v => {
				slave.custom.label = v;
				refresh();
			}));

		let choices = document.createElement('div');
		choices.className = "choices";
		choices.appendChild(App.UI.DOM.makeElement('span', ` For best results, use a short phrase; for example: 'Breeder.'`, 'note'));
		el.appendChild(choices);

		return el;
	}

	function artSeed() {
		const frag = new DocumentFragment();
		if (V.imageChoice === 4 || V.imageChoice === 6) { // webGL and AI art only right now
			App.UI.DOM.appendNewElement("p", frag, `Some rendering methods use a "seed value" to make small changes to the appearance of your slaves. If you're dissatisfied with this slave's appearance and correcting ${his} physical parameters doesn't seem to help, you can try replacing the seed value. Slaves with identical seeds will look identical; the game carefully preserves this value for clones and identical twins, but if you change it here it becomes your responsibility.`);

			const setArtSeed = (/** @type {number} */ num) => {
				slave.natural.artSeed = num;
				refresh();
				App.Events.refreshEventArt(slave);
			};
			const button = App.UI.DOM.makeElement("button", "Randomize");
			button.onclick = () => setArtSeed(jsRandom(0, 10 ** 14));
			const textbox = App.UI.DOM.makeTextBox(slave.natural.artSeed, (num) => setArtSeed(num), true);
			textbox.style.maxWidth = "12em";
			textbox.style.minWidth = "12em";
			App.UI.DOM.appendNewElement("p", frag, App.UI.DOM.combineNodes(
				"Art seed: ",
				textbox,
				button
			));
		}
		return frag;
	}

	function customHairImage() {
		let el = document.createElement('p');
		if (V.seeImages === 1 && V.imageChoice === 1) {
			if (!slave.custom.hairVector) {
				slave.custom.hairVector = 0;
			}
			el.append(`Assign ${him} a custom hair SVG image: `);

			el.appendChild(App.UI.DOM.makeTextBox(
				slave.custom.hairVector,
				v => {
					slave.custom.hairVector = v;
					refresh();
				}));

			el.appendChild(
				App.UI.DOM.link(
					` Reset`,
					() => {
						slave.custom.hairVector = 0;
						refresh();
						App.Events.refreshEventArt(slave);
					},
				)
			);
		}

		return el;
	}
};
