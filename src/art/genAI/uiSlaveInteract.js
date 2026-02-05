App.Art.GenAI.UI.SlaveInteract = {};

/**
 * Renders the slave customization options for GenAI
 * @param {FC.SlaveState} slave
 * @param {Function} refresh
 * @returns {HTMLDivElement}
 */
App.Art.GenAI.UI.SlaveInteract.custom = (slave, refresh) => {
	const {his, him} = getPronouns(slave);

	const aiAutoRegen = () => {
		let el = document.createElement('div');
		let label = document.createElement('div');

		const links = [];
		links.push(
			App.UI.DOM.link(
				`Exclude`,
				() => {
					slave.custom.aiAutoRegenExclude = 1;
					refresh();
				},
			)
		);

		links.push(
			App.UI.DOM.link(
				`Include`,
				() => {
					slave.custom.aiAutoRegenExclude = 0;
					refresh();
				},
			)
		);

		label.append(`Exclude ${him} from automatic image generation: `);
		App.UI.DOM.appendNewElement("span", label, slave.custom.aiAutoRegenExclude ? "Excluded" : "Included", ["bold"]);

		el.appendChild(label);
		el.appendChild(App.UI.DOM.generateLinksStrip(links));

		return el;
	};

	/** @returns {DocumentFragment} */
	function aiPrompts() {
		/** @returns {HTMLSpanElement} */
		function posePrompt() {
			let el = document.createElement('p');
			el.append(`Override ${his} pose prompt: `);
			el.appendChild(
				App.UI.DOM.makeTextBox(
					slave.custom.aiPrompts.pose,
					v => {
						slave.custom.aiPrompts.pose = v;
						$(promptDiv).empty().append(genAIPrompt());
					}
				)
			);

			let choices = document.createElement('div');
			choices.className = "choices";
			choices.appendChild(App.UI.DOM.makeElement('span', ` This prompt will replace the default body pose prompts. Example: 'kneeling, arms behind back'. If you are using OpenPose, make sure your selected pose and pose prompt agree.`, 'note'));
			el.appendChild(choices);
			return el;
		}
		
		/** @returns {HTMLParagraphElement} */
		function speciesOverridePrompt() {
			const el = document.createElement("p");
			el.append(`Species override: `);

			const select = document.createElement("select");

			const options = [
				["Off (use nationality)", ""],
				["Random (global)", "random"],

				["Wolf", "wolf"],
				["Fox", "fox"],
				["Tiger", "tiger"],
				["Lynx", "lynx"],
				["Coyote", "coyote"],
				["Tanuki", "tanuki, racoon dog"],
				["Jackal", "jackal"],
				["Hyena", "hyena"],
				["Bear", "bear"],
				["Deer", "deer"],
				["Horse", "horse"],
				["Mouse", "mouse"],
				["Hare", "hare"],
				["Leopard", "leopard"],
				["Panther", "panther"],
			];

			for (const [label, value] of options) {
				const opt = document.createElement("option");
				opt.text = label;
				opt.value = value;
				select.add(opt);
			}

			select.value = slave.custom.aiSpecies || "";

			select.onchange = () => {
				const v = select.value;
				if (!v) {
					delete slave.custom.aiSpecies;
				} else {
					slave.custom.aiSpecies = v;
				}
				// Update the debug prompt preview immediately
				$(promptDiv).empty().append(genAIPrompt());
			};

			el.appendChild(select);
			return el;
		}
		


/** @returns {HTMLParagraphElement} */
function aspectOverridePrompt() {
	const el = document.createElement("p");
	el.append(`Aspect override: `);

	const select = document.createElement("select");
	const options = [
		["Off (use global)", ""],
		["Portrait", "portrait"],
		["Landscape", "landscape"],
	];

	for (const [label, value] of options) {
		const opt = document.createElement("option");
		opt.text = label;
		opt.value = value;
		select.add(opt);
	}

	select.value = slave.custom.aiAspectOverride || "";

	select.onchange = () => {
		const v = select.value;
		if (!v) {
			delete slave.custom.aiAspectOverride;
		} else {
			slave.custom.aiAspectOverride = v;
		}
	};

	el.appendChild(select);

	const choices = document.createElement('div');
	choices.className = "choices";
	choices.appendChild(
		App.UI.DOM.makeElement(
			'span',
			` Swaps width/height for this character only at render time (A1111). Useful for side-lying poses on a portrait canvas.`,
			'note'
		)
	);
	el.appendChild(choices);

	return el;
}

		/** @returns {HTMLParagraphElement} */
		function anatomyExposurePrompt() {
			const el = document.createElement("p");
			el.append("Explicit anatomy: ");

			const select = document.createElement("select");
			const options = [
				["Off (do not mention genitals/butt)", 0],
				["Implied only (bulge/cameltoe)", 1],
				["Genitals visible (front)", 2],
				["Rear explicit (include anus/butt)", 3],
			];

			for (const [label, value] of options) {
				const opt = document.createElement("option");
				opt.text = label;
				opt.value = String(value);
				select.add(opt);
			}

			select.value = String(slave.custom.aiAnatomyExposure ?? 0);
			select.onchange = () => {
				const v = Number(select.value);
				if (!v) {
					delete slave.custom.aiAnatomyExposure;
				} else {
					slave.custom.aiAnatomyExposure = v;
				}
				$(promptDiv).empty().append(genAIPrompt());
			};

			el.appendChild(select);

			const choices = document.createElement("div");
			choices.className = "choices";
			choices.appendChild(
				App.UI.DOM.makeElement(
					"span",
					" Controls whether the prompt explicitly mentions genitals/butt. This avoids the model auto-rotating to rear-view just because clothing is revealing.",
					"note"
				)
			);
			el.appendChild(choices);

			return el;
		}
		
		function posePresetPrompt() {
			const el = document.createElement("p");
			el.append(`Pose preset: `);

			// Ensure the prompts object exists, since we are about to write into it
			if (!slave.custom.aiPrompts) {
				slave.custom.aiPrompts = new App.Entity.SlaveCustomAIPrompts();
			}

			const PRESETS = [
				["Off (use game posture)", ""],

				// --- Brothel-style presets (stable, no DynamicPrompts) ---
				["Brothel: hands on butt, looking back", "standing, rear_view/from_behind, looking_back, looking_at_viewer, looking_over_shoulder, hands on butt"],
				["Brothel: legs up, on back", "from_above, lying, on_back, on_bed, spread_legs, legs_up, presenting"],
				["Brothel: on side, presenting butt", "from_behind, rear_view, lying, on_side, on_bed, presenting_hindquarters, looking_back, looking_over_shoulder, butt"],
				["Brothel: on side, presenting genitals", "lying, on_side, on_bed, front_view, raised_leg, presenting"],
				["Brothel: squatting, spreading legs", "squatting, legs apart, breast grab, holding own breasts, full body"],
				["Brothel: kneeling on bed, spreading legs", "kneeling, on bed, knees apart, upright posture, breast_grab"],
				["Brothel: all fours, looking back", "from_behind, all_fours, presenting_hindquarters, looking_back, looking_at_viewer"],
				["Brothel: sitting on bed, spreading legs", "sitting, leaning_back, hands_behind_back, spread_legs, on_bed, presenting"],
			];

			const select = document.createElement("select");
			for (const [label, value] of PRESETS) {
				const opt = document.createElement("option");
				opt.text = label;
				opt.value = value;
				select.add(opt);
			}

			// If current pose matches one of the presets, select it; otherwise show Off.
			const current = slave.custom.aiPrompts.pose || "";
			select.value = PRESETS.some(([, v]) => v === current) ? current : "";

			select.onchange = () => {
				const v = select.value;
				if (!v) {
					// Clear override and go back to automatic posture logic
					delete slave.custom.aiPrompts.pose;
					delete slave.custom.aiPosePresetLocked;
				} else {
					slave.custom.aiPrompts.pose = v;
					delete slave.custom.aiPosePresetLocked;
				}
				$(promptDiv).empty().append(genAIPrompt());
			};

			el.appendChild(select);

			// Add a "Random (locked)" + "Reroll" buttons
			const btnRandom = App.UI.DOM.link("Random (locked)", () => {
				const candidates = PRESETS.map(p => p[1]).filter(v => v);
				const choice = candidates[Math.floor(Math.random() * candidates.length)];
				slave.custom.aiPosePresetLocked = choice;
				slave.custom.aiPrompts.pose = choice;
				select.value = choice;
				$(promptDiv).empty().append(genAIPrompt());
			});

			const btnReroll = App.UI.DOM.link("Reroll", () => {
				const candidates = PRESETS.map(p => p[1]).filter(v => v);
				const choice = candidates[Math.floor(Math.random() * candidates.length)];
				slave.custom.aiPosePresetLocked = choice;
				slave.custom.aiPrompts.pose = choice;
				select.value = choice;
				$(promptDiv).empty().append(genAIPrompt());
			});

			el.append(" ");
			el.append(btnRandom);
			el.append(" / ");
			el.append(btnReroll);

			return el;
		}

		
		/** Add HTML for overriding positive expression prompt */
		function expressionPositivePrompt() {
			let el = document.createElement('p');
			el.append(`Override ${his} positive expression prompt: `);
			el.appendChild(
				App.UI.DOM.makeTextBox(
					slave.custom.aiPrompts.expressionPositive,
					v => {
						slave.custom.aiPrompts.expressionPositive = v;
						$(promptDiv).empty().append(genAIPrompt());
					}
				)
			);

			let choices = document.createElement('div');
			choices.className = "choices";
			choices.appendChild(App.UI.DOM.makeElement('span', ` This prompt will replace the default positive facial expression prompts. Example: 'smile, grin, loving expression'.`, 'note'));
			el.appendChild(choices);
			return el;
		}

		/** Add HTML for overriding negative expression prompt */
		function expressionNegativePrompt() {
			let el = document.createElement('p');
			el.append(`Override ${his} negative expression prompt: `);
			el.appendChild(
				App.UI.DOM.makeTextBox(
					slave.custom.aiPrompts.expressionNegative,
					v => {
						slave.custom.aiPrompts.expressionNegative = v;
						$(promptDiv).empty().append(genAIPrompt());
					}
				)
			);

			let choices = document.createElement('div');
			choices.className = "choices";
			choices.appendChild(App.UI.DOM.makeElement('span', ` This prompt will replace the default negative facial expression prompts. Example: 'angry'.`, 'note'));
			el.appendChild(choices);
			return el;
		}

		/** @returns {HTMLSpanElement} */
		function positivePrompt() {
			let el = document.createElement('p');
			el.append(`Add positive prompts: `);
			el.appendChild(
				App.UI.DOM.makeTextBox(
					slave.custom.aiPrompts.positive,
					v => {
						slave.custom.aiPrompts.positive = v;
						$(promptDiv).empty().append(genAIPrompt());
					}
				)
			);

			let choices = document.createElement('div');
			choices.className = "choices";
			choices.appendChild(App.UI.DOM.makeElement('span', ` Prompts specified here will be appended to the end of the dynamic positive prompt; specify things you want to see in the rendered image.`, 'note'));
			el.appendChild(choices);
			return el;
		}

		/** @returns {HTMLSpanElement} */
		function negativePrompt() {
			let el = document.createElement('p');
			el.append(`Add negative prompts: `);
			el.appendChild(
				App.UI.DOM.makeTextBox(
					slave.custom.aiPrompts.negative,
					v => {
						slave.custom.aiPrompts.negative = v;
						$(promptDiv).empty().append(genAIPrompt());
					}
				)
			);

			let choices = document.createElement('div');
			choices.className = "choices";
			choices.appendChild(App.UI.DOM.makeElement('span', ` Prompts specified here will be appended to the end of the dynamic negative prompt; specify things you don't want to see in the rendered image.`, 'note'));
			el.appendChild(choices);
			return el;
		}

		/** @returns {HTMLSpanElement} */
		function overrideToggle() {
			let el = document.createElement('p');
			let options = new App.UI.OptionsGroup();
			options.addOption(`Override dynamic prompts: `, `aiPromptsOverwrite`, slave.custom)
				.addValue("True", true).on().addValue("False", false).off();
			el.appendChild(options.render());
			return el;
		}

		const frag = new DocumentFragment();

		// Debug information for AI art, or prompt suggestions for custom images
		const promptDiv = App.UI.DOM.makeElement('div');
		if ((V.imageChoice === 6 && (V.debugMode === 1 || slave.custom.aiPrompts)) || (V.seeCustomImagesOnly && V.aiCustomImagePrompts)) {
			promptDiv.append(genAIPrompt());
		} else if (V.imageChoice === 6) {
			promptDiv.append(App.UI.DOM.link("Show AI Prompts", f => {
				$(promptDiv).empty().append(genAIPrompt());
			}));
		}
		frag.append(promptDiv);

		// Custom prompt parts
		const customDiv = App.UI.DOM.makeElement('div');
		if (V.imageChoice === 6 || (V.seeCustomImagesOnly && V.aiCustomImagePrompts)) {
			if (slave.custom.aiPrompts) {
				customDiv.append(
					speciesOverridePrompt(),
					aspectOverridePrompt(),
					anatomyExposurePrompt(),
					posePresetPrompt(),
					posePrompt(),
					expressionPositivePrompt(),
					expressionNegativePrompt(),
					positivePrompt(),
					negativePrompt(),
					overrideToggle(),
				);
				customDiv.append(App.UI.DOM.link("Disable Prompt Customization", f => {
					delete slave.custom.aiPrompts;
					refresh();
				}));
			} else {
				customDiv.append(
					speciesOverridePrompt(),
					aspectOverridePrompt(),
					posePresetPrompt(),
					anatomyExposurePrompt(),
					App.UI.DOM.link("Customize AI Prompts", f => {
						slave.custom.aiPrompts = new App.Entity.SlaveCustomAIPrompts();
						refresh();
				}));
			}
		}
		frag.append(customDiv);
		return frag;
	}

	/** @returns {HTMLSpanElement} */
	function genAIPrompt() {
		let el = document.createElement('p');

		let prompt = buildPrompt(slave);
		el.appendChild(document.createElement('h5')).textContent = `Positive prompt`;
		el.appendChild(document.createElement('kbd')).textContent = prompt.positive();
		el.appendChild(document.createElement('h5')).textContent = `Negative prompt`;
		el.appendChild(document.createElement('kbd')).textContent = prompt.negative();
		el.appendChild(document.createElement('h5')).textContent = `Face prompt`;
		el.appendChild(document.createElement('kbd')).textContent = prompt.face();

		return el;
	}

	/** @returns {DocumentFragment|HTMLDivElement} */
	function customAIPose() {
		if (V.imageChoice !== 6 || !V.aiOpenPose) {
			return new DocumentFragment();
		}

		let container = document.createElement('div');

		let el = document.createElement('p');
		el.append(`Assign ${him} a custom pose using OpenPose: `);

		const select = document.createElement('select');
		[
			"PNG",
			"JSON",
			"Library",
		].forEach((type) => {
			const el = document.createElement('option');
			el.value = type;
			el.text = type;
			select.add(el);
		});
		select.value = slave.custom.aiPose?.type || "Library";
		el.appendChild(select);

		if (["PNG", "JSON"].includes(slave.custom.aiPose?.type)) {
			const textbox = document.createElement("input");
			textbox.value = slave.custom.aiPose?.filename;
			el.appendChild(textbox);

			let choices = document.createElement('div');
			choices.className = "choices";
			let note = document.createElement('span');
			note.className = "note";
			note.append(`Place OpenPose file in the `);
			note.appendChild(App.UI.DOM.makeElement('kbd', 'resources\\poses'));
			note.append(` folder. Enter the filename without extension in the space provided and press enter. For example, for a file with the path `);
			note.appendChild(App.UI.DOM.makeElement('kbd', `\\bin\\resources\\poses\\standing_devoted.png`));
			note.append(`, choose `);
			note.appendChild(App.UI.DOM.makeElement('kbd', 'PNG'));
			note.append(` then enter `);
			note.appendChild(App.UI.DOM.makeElement('kbd', 'standing_devoted'));
			note.append(`.`);

			choices.appendChild(note);
			el.appendChild(choices);

			let error = document.createElement('div');
			error.className = "error";
			el.append(error);

			textbox.onchange = () => {
				const c = slave.custom;
				if (textbox.value.length === 0) {
					c.aiPose = null;
				} else {
					fetch(`resources/poses/${textbox.value}.${c.aiPose.type.toLowerCase()}`)
						.then(r => {
							error.textContent = "";
						})
						.catch(r => {
							error.textContent = "Unable to fetch the requested resource. Your browser may prohibit local file access, or you may have mistyped the filename.";
						});
					if (!c.aiPose) {
						c.aiPose = new App.Entity.SlaveCustomAIPose();
						c.aiPose.type = /** @type {"PNG"|"JSON"|"Library"} */ (select.value);
						c.aiPose.filename = textbox.value;
					} else {
						c.aiPose.filename = textbox.value;
					}
					App.Events.refreshEventArt(slave);
				}
			};
		} else {
			const poseSel = document.createElement('select');
			const def = document.createElement('option');
			def.value = "";
			def.text = "(Default)";
			poseSel.add(def);
			Object.keys(App.Data.Art.Poses).forEach((pose) => {
				const el = document.createElement('option');
				el.value = pose;
				el.text = pose;
				poseSel.add(el);
			});
			poseSel.value = slave.custom.aiPose?.name || "";
			el.appendChild(poseSel);

			poseSel.onchange = () => {
				const c = slave.custom;
				if (poseSel.value.length === 0) {
					c.aiPose = null;
				} else {
					if (!c.aiPose) {
						c.aiPose = new App.Entity.SlaveCustomAIPose();
						c.aiPose.type = /** @type {"PNG"|"JSON"|"Library"} */ (select.value);
						c.aiPose.name = poseSel.value;
					} else {
						c.aiPose.name = poseSel.value;
					}
					App.Events.refreshEventArt(slave);
				}
			};
		}
		select.onchange = () => {
			if (select.value !== "Library" && !slave.custom.aiPose) {
				slave.custom.aiPose = new App.Entity.SlaveCustomAIPose();
			}
			if (slave.custom.aiPose) {
				slave.custom.aiPose.type = /** @type {"PNG"|"JSON"|"Library"} */ (select.value);
			}
			refresh();
		};

		el.appendChild(
			App.UI.DOM.link(
				` Reset`,
				() => {
					slave.custom.aiPose = null;
					refresh();
					App.Events.refreshEventArt(slave);
				},
			)
		);

		container.append(el);
		return container;
	}

	let container = document.createElement('div');

	container.append(
		App.UI.DOM.makeElement('h4', `Image generation AI (eg. Stable Diffusion)`, null),
		App.UI.DOM.generateLinksStrip([
			App.UI.DOM.link("Export an archive of all the current images", async () => {
				if (slave.custom.aiDisplayImageIdx === -1) { return; }
				await App.Art.GenAI.Archiving.downloadCharacter(clone(slave));
			}),
			App.UI.DOM.link("Import an archive and replaces all images", async () => {
				function refresh() {
					App.UI.reload();
				}
				await App.Art.GenAI.Archiving.importCharacter(slave, refresh);
			})
		]),
		aiPrompts(),
		customAIPose()
	);
	if (V.aiAutoGen) {
		container.append(aiAutoRegen());
	}

	return container;
};
