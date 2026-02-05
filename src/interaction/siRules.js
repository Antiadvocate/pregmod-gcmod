/**
 * @param {FC.SlaveState} slave
 * @param {function():void} refresh
 * @returns {DocumentFragment}
 */
App.UI.SlaveInteract.rules = function(slave, refresh) {
	const frag = new DocumentFragment();
	let p;
	let div;
	let array;
	/**
	 * @type {Array<listChoice>}
	 */
	let choices;
	const {
		He, His,
		he, him, his, himself
	} = getPronouns(slave);
	const facilityControlledAspects = App.Utils.assignmentControlledAspects(slave);

	if (V.seePreg !== 0) {
		if (V.universalRulesImpregnation === "PC") {
			updateBreederLink("you", "PCExclude");
		} else if (V.universalRulesImpregnation === "HG") {
			updateBreederLink("the Head Girl", "HGExclude");
		} else if (V.universalRulesImpregnation === "Stud") {
			updateBreederLink("your Stud", "StudExclude");
		} else if (V.universalRulesImpregnation === "Slaves") {
			updateBreederLink("your chattel", "inseminationExclude");
		} else if (V.universalRulesImpregnation === "Citizens") {
			updateBreederLink("the public", "inseminationExclude");
		}
	}

	/**
	 * @param {string} breeder
	 * @param {"PCExclude" | "HGExclude" | "StudExclude" | "inseminationExclude"} exclude
	 */
	function updateBreederLink(breeder, exclude) {
		p = document.createElement('p');
		const exempt = slave[exclude] ? "Include" : "Exempt";

		p.append(`Will ${slave[exclude] ? "not " : ""}be bred by ${breeder} when fertile. `);
		p.append(
			App.UI.DOM.link(`${exempt} ${him}`, () => {
				slave[exclude] = slave[exclude] ^ 1; // switch 0 and 1
				refresh();
			})
		);
		frag.append(p);
	}

	p = document.createElement('p');

	array = [];
	if (slave.useRulesAssistant === 0) {
		App.UI.DOM.appendNewElement("span", p, `Not subject `, ["bold", "gray"]);
		App.UI.DOM.appendNewElement("span", p, `to the Rules Assistant. `, "gray");
		array.push(
			App.UI.DOM.link(
				`Include ${him}`,
				() => {
					slave.useRulesAssistant = 1;
					refresh();
				}
			)
		);
	} else {
		App.UI.DOM.appendNewElement("h3", p, `Rules Assistant`);

		if (slave.hasOwnProperty("currentRules") && slave.currentRules.length > 0) {
			const ul = document.createElement("UL");
			ul.style.margin = "0";
			V.defaultRules.filter(
				x => ruleApplied(slave, x)
			).map(
				x => {
					const li = document.createElement('li');
					li.append(x.name);
					ul.append(li);
				}
			);

			// set up rules display
			if ($("ul").has("li").length) {
				App.UI.DOM.appendNewElement("div", p, `Rules applied: `);
				p.append(ul);
			} else {
				App.UI.DOM.appendNewElement("div", p, `There are no rules that would apply to ${him}.`, "gray");
			}
		}
		array.push(
			App.UI.DOM.link(
				`Apply rules`,
				() => {
					DefaultRules(slave);
					refresh();
				}
			)
		);
		array.push(
			App.UI.DOM.link(
				`Exempt ${him}`,
				() => {
					slave.useRulesAssistant = 0;
					refresh();
				}
			)
		);
		array.push(
			App.UI.DOM.link(
				`Apply all rules to ${him} again`,
				() => {
					removeFromRulesToApplyOnce(slave);
					DefaultRules(slave);
					refresh();
				}
			)
		);
		array.push(App.UI.DOM.passageLink("Rules Assistant Options", "Rules Assistant"));
	}
	p.append(App.UI.DOM.generateLinksStrip(array));
	frag.append(p);

	p = document.createElement('p');
	App.UI.DOM.appendNewElement("h3", p, `Other Rules`);

	if (slave.fuckdoll > 0) {
		App.UI.DOM.appendNewElement("span", p, "Rules have little meaning for living sex toys", "note");
	} else {
		// Living
		penthouseCensus();
		p.append("Living standard: ");

		if (facilityControlledAspects.has(FacilityControlledAspect.LIVING_RULES)) {
			if (slave.assignment === Job.HEADGIRL) {
				App.UI.DOM.appendNewElement("span", p, ` ${He} has ${his} own little luxurious room in the penthouse with everything ${he} needs to be a proper Head Girl.`, ["note"]);
			} else if (slave.assignment === Job.BODYGUARD) {
				App.UI.DOM.appendNewElement("span", p, ` ${He} has a comfortable room in the armory to call ${his} own.`, ["note"]);
			} else {
				App.UI.DOM.appendNewElement("span", p, ` ${His} living conditions are managed by ${his} assignment.`, ["note"]);
			}
		} else {
			choices = [
				{value: "spare"},
				{value: "normal"},
			];
			if (canMoveToRoom(slave) || slave.rules.living === "luxurious") {
				choices.push({value: "luxurious"});
			} else {
				choices.push({
					value: "luxurious",
					disabled: ["No luxurious rooms available"]
				});
			}

			p.append(listChoices(choices, "living"));
		}

		// Rest
		div = document.createElement("div");
		div.append("Sleep rules: ");
		if (facilityControlledAspects.has(FacilityControlledAspect.REST)) {
			App.UI.DOM.appendNewElement("span", div, ` ${His} sleeping schedule is managed by ${his} assignment.`, "note");
		} else {
			choices = [
				{value: "none", tooltip: "Never"},
				{value: "cruel", tooltip: "When Exhausted"},
				{value: "restrictive", tooltip: "When Fatigued"},
				{value: "permissive", tooltip: "When Tired"},
				{value: "mandatory", tooltip: "Every Week"},
			];
			div.append(listChoices(choices, "rest"));
		}
		p.append(div);

		// Mobility Aids
		if (!canWalk(slave) && canMove(slave)) {
			div = document.createElement("div");
			div.append("Use of mobility aids: ");
			choices = [
				{value: "restrictive"},
				{value: "permissive"},
			];
			div.append(listChoices(choices, "mobility"));
			p.append(div);
		}

		// Punishment
		div = document.createElement("div");
		div.append("Typical punishment: ");
		choices = [
			{value: "confinement", tooltip: App.UI.DOM.combineNodes(`Increases `, App.UI.DOM.makeElement("span", `fear`, ["trust", "dec"]), ` when the slave is punished.`)},
			{value: "whipping", tooltip: App.UI.DOM.combineNodes(`Significantly increases `, App.UI.DOM.makeElement("span", `fear`, ["trust", "dec"]), ` at the cost of `, App.UI.DOM.makeElement("span", `health`, ["health", "dec"]), ` when the slave is punished.`)},
			{value: "chastity", tooltip: App.UI.DOM.combineNodes(`Increases both `, App.UI.DOM.makeElement("span", `fear`, ["trust", "dec"]), ` and `, App.UI.DOM.makeElement("span", `devotion`, ["devotion", "inc"]), ` at the cost of `, App.UI.DOM.makeElement("span", `libido`, ["libido", "dec"]), ` when the slave is punished.`)},
			{value: "situational", tooltip: App.UI.DOM.combineNodes(`Increases `, App.UI.DOM.makeElement("span", `fear`, ["trust", "dec"]), ` when the slave is punished.`)},
		];
		div.append(listChoices(choices, "punishment"));
		p.append(div);

		// Reward
		div = document.createElement("div");
		div.append("Typical reward: ");
		choices = [
			{value: "relaxation", tooltip: App.UI.DOM.combineNodes(`Improves `, App.UI.DOM.makeElement("span", `health`, ["health", "inc"]), ` when a reward is earned.`)},
			{value: "drugs", tooltip: App.UI.DOM.combineNodes(`Significantly improves `, App.UI.DOM.makeElement("span", `devotion`, ["devotion", "inc"]), ` at the cost of `, App.UI.DOM.makeElement("span", `health`, ["health", "dec"]), ` when a reward is earned.`)},
			{value: "orgasm", tooltip: App.UI.DOM.combineNodes(`Improves `, App.UI.DOM.makeElement("span", `devotion`, ["devotion", "inc"]), ` and raises `, App.UI.DOM.makeElement("span", `libido`, ["libido", "inc"]), ` when a reward is earned.`)},
			{value: "situational", tooltip: App.UI.DOM.combineNodes(`Improves `, App.UI.DOM.makeElement("span", `devotion`, ["devotion", "inc"]), ` when a reward is earned.`)},
		];
		div.append(listChoices(choices, "reward"));
		p.append(div);

		// Lactation
		if (slave.lactation !== 2) {
			div = document.createElement("div");
			div.append("Lactation maintenance: ");

			if (facilityControlledAspects.has(FacilityControlledAspect.LACTATION)) {
				App.UI.DOM.appendNewElement("span", div, ` ${His} lactation is managed by ${his} assignment.`, "note")
			} else {
				choices = [
					{
						title: "Left alone",
						value: "none",
					},
				];

				if (slave.lactation === 0) {
					choices.push(
						{
							title: "Induce lactation",
							value: "induce",
						}
					);
				} else {
					choices.push(
						{
							title: "Maintain lactation",
							value: "maintain",
						}
					);
				}
				div.append(listChoices(choices, "lactation"));
			}
			p.append(div);
		}

		p.append(orgasm(slave));

		if (slave.voice !== 0) {
			div = document.createElement("div");
			div.append("Speech rules: ");
			choices = [
				{value: "restrictive"},
				{value: "permissive"},
			];
			if (slave.accent > 3) {
				choices.push({value: "language lessons"});
			} else if (slave.accent > 0) {
				choices.push({value: "accent elimination"});
			}
			div.append(listChoices(choices, "speech"));
			p.append(div);
		}

		div = document.createElement("div");
		div.append("Relationship rules: ");
		choices = [
			{value: "restrictive"},
			{value: "just friends"},
			{value: "permissive"},
		];
		div.append(listChoices(choices, "relationship"));
		p.append(div);

		p.append(smartSettings(slave));
	}
	frag.append(p);
	// pregnancy notice
	if (slave.ovaries === 1 || slave.mpreg === 1) {
		frag.append(App.Events.PregnancyNotice.options(slave));
	} else {
		App.UI.DOM.appendNewElement("span", frag, `Pregnancy Notice options are disabled for this slave because they do not have a functional womb.`);
	}
	return frag;

	/**
	 * @typedef {object} listChoice
	 * @property {string} value
	 * @property {string} [title]
	 * @property {string|HTMLElement|DocumentFragment} [tooltip]
	 * @property {Array<string>} [disabled]
	 */

	/**
	 * @param {Array<listChoice>} choices
	 * @param {string} property
	 * @returns {HTMLUListElement}
	 */
	function listChoices(choices, property) {
		const links = [];
		for (const c of choices) {
			const title = c.title || capFirstChar(c.value);
			if (c.disabled) {
				links.push(
					App.UI.DOM.disabledLink(
						title, c.disabled
					)
				);
			} else if (slave.rules[property] === c.value) {
				links.push(
					App.UI.DOM.disabledLink(
						title,
						c.tooltip ? ["Current Setting", c.tooltip] : ["Current Setting"]
					)
				);
			} else {
				links.push(
					App.UI.DOM.link(
						title,
						() => {
							slave.rules[property] = c.value;
							refresh();
						},
						[],
						"",
						c.tooltip ? c.tooltip : ""
					)
				);
			}
		}
		return App.UI.DOM.generateLinksStrip(links);
	}

	/**
	 * @param {FC.SlaveState} slave
	 * @returns {HTMLDivElement}
	 */
	function orgasm(slave) {
		const el = document.createElement('div');

		const title = document.createElement('div');
		title.textContent = `Non-assignment orgasm rules: `;
		el.append(title);

		/** @typedef {{title: string, value: string, enabled: string, disabled: string, master?: boolean}} orgasmChoices */

		/** @type {orgasmChoices[]} */
		const choices = [
			{
				title: "Masturbation",
				value: "masturbation",
				enabled: `Will be allowed to pleasure ${himself}`,
				disabled: `Will not be allowed to pleasure ${himself}`,
			},
			{
				title: "Partner",
				value: "partner",
				enabled: `Will be allowed sexual contact with ${his} romantic partner`,
				disabled: `Will not be allowed sexual contact with ${his} romantic partner`,
			},
			{
				title: "Facility leaders",
				value: "facilityLeader",
				enabled: `Development facility leaders are allowed to satisfy ${his} sexual needs while ${he} is assigned to their facility`,
				disabled: `Development facility leaders are not allowed to satisfy ${his} sexual needs while ${he} is assigned to their facility`,
			},
			{
				title: "Family",
				value: "family",
				enabled: `Will be allowed sexual contact with close family members`,
				disabled: `Will not be allowed sexual contact with close family members`,
			},
			{
				title: "Other slaves",
				value: "slaves",
				enabled: `Will be allowed sexual contact with other slaves`,
				disabled: `Will not be allowed sexual contact with other slaves`,
			},
			{
				title: "Master",
				value: "master",
				enabled: `You will fuck ${him} when ${he} needs it`,
				disabled: `You will not fuck ${him} when ${he} needs it`,
				master: true
			},
		];

		for (const orgasmObj of choices) {
			const row = document.createElement("div");
			row.classList.add("choices");
			row.append(`${orgasmObj.title}: `);
			App.UI.DOM.appendNewElement("span", row, makeLinks(orgasmObj));
			el.append(row);
		}

		return el;

		/**
		 * @param {orgasmChoices} orgasmObj
		 * @returns {HTMLUListElement}
		 */
		function makeLinks(orgasmObj) {
			const linkArray = [];
			makeLinks();

			return App.UI.DOM.generateLinksStrip(linkArray);

			function makeLinks() {
				const allow = orgasmObj.master ? `Grant` : `Allow`;
				const forbid = orgasmObj.master ? `Deny` : `Forbid`;
				if (!slave.rules.release[orgasmObj.value]) {
					linkArray.push(App.UI.DOM.link(allow, () => {
						slave.rules.release[orgasmObj.value] = 1;
						refresh();
					}));
					linkArray.push(App.UI.DOM.disabledLink(forbid, [orgasmObj.disabled]));
				} else {
					linkArray.push(App.UI.DOM.disabledLink(allow, [orgasmObj.enabled]));
					linkArray.push(App.UI.DOM.link(forbid, () => {
						slave.rules.release[orgasmObj.value] = 0;
						refresh();
					}));
				}
			}
		}
	}

	/**
	 * @param {FC.SlaveState} slave
	 * @returns {HTMLDivElement}
	 */
	function smartSettings(slave) {
		let el = document.createElement('div');
		const smartBulletVibe = dildoVibeLevel(slave) > 1 || slave.dickAccessory === "smart bullet vibrator";
		const smartDildoVibe = slave.vaginalAttachment === "smart vibrator";

		if (slave.piercing.genitals.smart || smartBulletVibe || smartDildoVibe) {
			/** @type {Map<string, FC.SmartPiercingSetting>} */
			const level = new Map();
			/** @type {Map<string, FC.SmartPiercingSetting>} */
			const bodyPart = new Map();
			/** @type {Map<string, FC.SmartPiercingSetting>} */
			const BDSM = new Map();
			/** @type {Map<string, FC.SmartPiercingSetting>} */
			const gender = new Map();
			/** @type {Map<string, FC.SmartPiercingSetting>} */
			const others = new Map();

			// Level
			level.set(`No sex`, `none`);
			level.set(`All sex`, `all`);
			level.set(`Disabled`, `off`);

			// Body part
			bodyPart.set(`Vanilla`, `vanilla`);
			bodyPart.set(`Oral`, `oral`);
			bodyPart.set(`Anal`, `anal`);
			bodyPart.set(`Boobs`, `boobs`);
			if (V.seePreg !== 0) {
				bodyPart.set(`Preg`, `pregnancy`);
			}
			// BDSM
			BDSM.set(`Sub`, `submissive`);
			BDSM.set(`Dom`, `dom`);
			BDSM.set(`Masochism`, `masochist`);
			BDSM.set(`Sadism`, `sadist`);
			BDSM.set(`Humiliation`, `humiliation`);

			// Gender
			gender.set(`Men`, `men`);
			gender.set(`Women`, `women`);
			gender.set(`Anti-men`, `anti-men`);
			gender.set(`Anti-women`, `anti-women`);

			// Others
			if (V.seeBestiality) {
				others.set("Bestiality", "bestiality");
			}

			let label = null;
			if (slave.piercing.genitals.smart) {
				label = `Smart ${slave.dick < 1 ? "clit" : "frenulum"} piercing `;
				label += (smartBulletVibe || smartDildoVibe) ? `and smart vibrator setting: ` : `setting: `;
			} else if (smartBulletVibe) {
				label = `Smart bullet vibrator setting: `;
			} else if (smartDildoVibe) {
				label = `Smart vibrating dildo attachment setting: `;
			}
			let title = App.UI.DOM.appendNewElement('div', el, label);
			let selected = App.UI.DOM.appendNewElement('span', title, `${slave.clitSetting}. `);
			selected.style.fontWeight = "bold";

			choices("Level", level);
			choices("Body part", bodyPart);
			choices("BDSM", BDSM);
			choices("Gender", gender);
			if (others.size > 0) {
				choices("Others", others);
			}
		}

		return el;

		/**
		 * @param {string} title
		 * @param {Map<string, FC.SmartPiercingSetting>} map
		 */
		function choices(title, map) {
			const row = document.createElement("div");
			row.classList.add("choices");
			row.append(`${title}: `);

			const linkArray = [];
			for (const [text, value] of map) {
				if (slave.clitSetting === value) {
					linkArray.push(
						App.UI.DOM.disabledLink(
							text,
							["Currently selected"]
						)
					);
				} else {
					linkArray.push(
						App.UI.DOM.link(
							text,
							() => {
								slave.clitSetting = value;
								refresh();
							}
						)
					);
				}
			}
			row.append(App.UI.DOM.generateLinksStrip(linkArray));
			el.append(row);
		}
	}
};
