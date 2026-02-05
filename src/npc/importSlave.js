App.UI.SlaveInteract.importSlaveFromJson = () => {
	const el = new DocumentFragment();
	App.UI.DOM.appendNewElement("span", el, `Paste the code into the text box and press enter: `);
	el.append(
		App.UI.DOM.makeTextBox(
			"",
			v => {
				if (v) {
					App.Verify.Utils.verificationError = false;
					let div = App.UI.DOM.makeElement("div");
					App.UI.DOM.appendNewElement("h4", div, "An error occurred!");
					let slave = App.UI.SlaveInteract.importSlaveFromString(v, div);
					if (App.Verify.Utils.verificationError) {
						el.append(div);
					} else {
						newSlave(slave);
						V.temp.AS = slave.ID;
						Engine.play("Slave Interact");
					}
				}
			}
		)
	);
	return el;
};

App.UI.SlaveInteract.importSlaveFromCharacterCard = () => {
	const el = new DocumentFragment();
	App.UI.DOM.appendNewElement("span", el, `Select your character card: `);

	const form = document.createElement("form");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		/**
		 * @type {File | undefined}
		 */
		// @ts-ignore
		const pngFile = form.querySelector('input[name="pngFile"]')?.files[0];

		if (!pngFile) {
			alert("No file found. Please contact the maintainers.");
			return;
		}

		const pngAb = await pngFile.arrayBuffer();
		const allTextContent = App.UI.SlaveInteract.SlaveBot.Png.Parse(pngAb);
		const slaveBotObj = Serial.parse(allTextContent);
		/**
		 * Parser returns the stuff we care about under "data".
		 * @type {FC.SlaveBot.CharacterBook}
		 */
		const slaveBotData = slaveBotObj.data;

		if (!slaveBotData?.extensions?.freecitiesJSON) {
			alert("No Free Cities data found from this character card. Maybe it is corrupted?");
			return;
		}
		const slaveString = slaveBotData.extensions.freecitiesJSON;
		let slave = App.UI.SlaveInteract.importSlaveFromString(slaveString);
		newSlave(slave);
		V.temp.AS = slave.ID;
		Engine.play("Slave Interact");
	});

	const input = document.createElement("input");
	input.type = 'file';
	input.accept = "image/png";
	input.name = "pngFile";

	const submitBtn = document.createElement("button");
	submitBtn.type = 'submit';
	submitBtn.innerText = "Submit";

	form.appendChild(input);
	form.appendChild(document.createElement("br"));
	form.appendChild(submitBtn);

	el.append(
		form
	);

	return el;
};


/**
 * @param {string} slaveSrc The output of App.UI.SlaveInteract.exportSlave
 * @param {HTMLDivElement} [div] an optional div, if provide any errors/validation info will be added to it
 * @returns {FC.SlaveState}
 * @see App.UI.SlaveInteract.exportSlave
 */
App.UI.SlaveInteract.importSlaveFromString = (slaveSrc, div) => {
	slaveSrc = slaveSrc.trim();
	// add curly braces if missing
	if (slaveSrc[0] !== "{") { slaveSrc = "{" + slaveSrc; }
	if (slaveSrc.slice(-1) !== "}") { slaveSrc += "}"; }
	// generate slave
	let slave = Serial.parse(slaveSrc);
	slave.ID = generateSlaveID();
	App.Verify.slaveState("<imported>", slave, "none", div);
	if (slave?.assignment) {
		removeJob(slave, slave.assignment);
	}
	return slave;
};

/**
 * @param {FC.SlaveState} slave
 * @returns {string} the json string representing the exported slave
 */
App.UI.SlaveInteract.exportSlave = function(slave) {
	const exportSlave = _.cloneDeep(slave);
	App.Verify.slaveState("<exported>", exportSlave, "none");
	exportSlave.ID = 0;
	return Serial.stringify(exportSlave, null, 2);
};

/**
 * @param {FC.SlaveState} slave
 * @returns {DocumentFragment}
 */
App.UI.SlaveInteract.exportSlaveDocument = function(slave) {
	const el = new DocumentFragment();
	App.UI.DOM.appendNewElement("p", el, `Copy the following block of code for importing: `, "note");
	App.UI.DOM.appendNewElement("textarea", el, App.UI.SlaveInteract.exportSlave(slave), ["export-field"]);
	return el;
};
