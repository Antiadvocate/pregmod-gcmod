/* eslint-disable camelcase */
// cSpell:ignore abilParts, chasParts, IHDR, IEND, IDAT

/** @param {FC.SlaveState} slave */
App.UI.SlaveInteract.SlaveBot.createSlaveBot = (slave) => {
	const el = new DocumentFragment();
	const p = App.UI.DOM.appendNewElement("p", el, `Exporting slave bot.\nThis might take a minute. Please wait...`);
	const imgArea = App.UI.DOM.appendNewElement("div", el);
	const a = App.UI.DOM.appendNewElement("a", el, '');

	App.UI.SlaveInteract.SlaveBot.exportFile(slave)
		.then((file) => {
			p.innerText = `Character Card for ${SlaveFullName(slave)}:`;
			const fileUrl = window.URL.createObjectURL(file);
			const img = document.createElement("img");
			img.setAttribute("src", fileUrl);
			imgArea.append(img);
			a.innerText = "Download Card";
			a.setAttribute('download', file.name);
			a.setAttribute('href', fileUrl);
			a.click();
		});

	return el;
};

/**
 *
 * @param {File} pngFile File from <input type="file" />
 */
App.UI.SlaveInteract.SlaveBot.importSlavePNG = async (pngFile) => {
	const pngAb = await pngFile.arrayBuffer();

	const allTextContent = App.UI.SlaveInteract.SlaveBot.Png.Parse(pngAb);

	/**
	 * @type {FC.SlaveBot.CharacterBook}
	 */
	const slaveBotData = Serial.parse(allTextContent);

	if (!slaveBotData.extensions.freecitiesJSON) {
		alert("No Free Cities data found from this character card. Maybe it is corrupted?");
	}

	const slaveString = slaveBotData.extensions.freecitiesJSON;

	let slave = App.UI.SlaveInteract.importSlaveFromString(slaveString);
	newSlave(slave);
	V.temp.AS = slave.ID;
	Engine.play("Slave Interact");
};

// Adapted from https://github.com/ZoltanAI/character-editor/
App.UI.SlaveInteract.SlaveBot.Png = class Png {
	static #uint8 = new Uint8Array(4);
	static #int32 = new Int32Array(this.#uint8.buffer);
	static #uint32 = new Uint32Array(this.#uint8.buffer);

	// Parse and extract PNG tEXt chunk
	static #decodeText(data) {
		let naming = true;
		let keyword = '';
		let text = '';

		for (let index = 0; index < data.length; index++) {
			const code = data[index];

			if (naming) {
				if (code) {
					keyword += String.fromCharCode(code);
				} else {
					naming = false;
				}
			} else {
				if (code) {
					text += String.fromCharCode(code);
				} else {
					throw new Error('Invalid NULL character found in PNG tEXt chunk');
				}
			}
		}

		return {
			keyword,
			text
		};
	}

	// Encode value to PNG tEXt chunk
	static #encodeText(keyword, text) {
		keyword = String(keyword);
		text = String(text);

		// eslint-disable-next-line no-control-regex
		if (!/^[\x00-\xFF]+$/.test(keyword) || !/^[\x00-\xFF]+$/.test(text)) {
			throw new Error('Invalid character in PNG tEXt chunk');
		}
		if (keyword.length > 79) {
			throw new Error('Keyword "' + keyword + '" is longer than the 79 character limit');
		}

		const data = new Uint8Array(keyword.length + text.length + 1);
		let idx = 0;
		let code;

		for (let i = 0; i < keyword.length; i++) {
			if (!(code = keyword.charCodeAt(i))) {
				throw new Error('0x00 character is not permitted in tEXt keywords');
			}
			data[idx++] = code;
		}

		data[idx++] = 0;

		for (let i = 0; i < text.length; i++) {
			if (!(code = text.charCodeAt(i))) {
				throw new Error('0x00 character is not permitted in tEXt text');
			}
			data[idx++] = code;
		}

		return data;
	}

	// Read PNG format chunk
	static #readChunk(data, idx) {
		// Read length field
		this.#uint8[3] = data[idx++];
		this.#uint8[2] = data[idx++];
		this.#uint8[1] = data[idx++];
		this.#uint8[0] = data[idx++];
		const length = this.#uint32[0];

		// Read chunk type field
		const chunkType = String.fromCharCode(data[idx++]) + String.fromCharCode(data[idx++]) + String.fromCharCode(data[idx++]) + String.fromCharCode(data[idx++]);

		// Read chunk data field
		const chunkData = data.slice(idx, idx + length);
		idx += length;

		// Read CRC field
		this.#uint8[3] = data[idx++];
		this.#uint8[2] = data[idx++];
		this.#uint8[1] = data[idx++];
		this.#uint8[0] = data[idx++];
		const crc = this.#int32[0];

		// Compare stored CRC to actual
		if (crc !== CRC32.buf(chunkData, CRC32.str(chunkType))) {
			throw new Error('PNG decode Error: CRC for "' + chunkType + '" header is invalid, file is likely corrupted');
		}

		return {
			type: chunkType,
			data: chunkData,
			crc
		};
	}

	// Read PNG file and extract chunks
	static #readChunks(data) {
		if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47 || data[4] !== 0x0D || data[5] !== 0x0A || data[6] !== 0x1A || data[7] !== 0x0A) {
			throw new Error('Png Format error: Invalid PNG header');
		}

		const chunks = [];

		let idx = 8; // Skip signature
		while (idx < data.length) {
			const chunk = Png.#readChunk(data, idx);

			if (!chunks.length && chunk.type !== 'IHDR') {
				throw new Error('PNG Decode Error: PNG missing IHDR header');
			}

			chunks.push(chunk);
			idx += 4 + 4 + chunk.data.length + 4; // Skip length, chunk type, chunk data, CRC
		}

		if (chunks.length === 0) {
			throw new Error('PNG Decode Error: PNG ended prematurely, no chunks');
		}
		if (chunks[chunks.length - 1].type !== 'IEND') {
			throw new Error('PNG Decode Error: PNG ended prematurely, missing IEND header');
		}

		return chunks;
	}

	// Write PNG file from chunks
	static #encodeChunks(chunks) {
		const output = new Uint8Array(chunks.reduce((a, c) => a + 4 + 4 + c.data.length + 4, 8)); // Signature + chunks (length, chunk type, chunk data, CRC)

		// Signature
		output[0] = 0x89;
		output[1] = 0x50;
		output[2] = 0x4E;
		output[3] = 0x47;
		output[4] = 0x0D;
		output[5] = 0x0A;
		output[6] = 0x1A;
		output[7] = 0x0A;

		let idx = 8; // After signature

		chunks.forEach(c => {
			// Write length field
			this.#uint32[0] = c.data.length;
			output[idx++] = this.#uint8[3];
			output[idx++] = this.#uint8[2];
			output[idx++] = this.#uint8[1];
			output[idx++] = this.#uint8[0];

			// Write chunk type field
			output[idx++] = c.type.charCodeAt(0);
			output[idx++] = c.type.charCodeAt(1);
			output[idx++] = c.type.charCodeAt(2);
			output[idx++] = c.type.charCodeAt(3);

			// Write chunk data field
			for (let i = 0; i < c.data.length;) {
				output[idx++] = c.data[i++];
			}

			// Write CRC field
			this.#int32[0] = c.crc || CRC32.buf(c.data, CRC32.str(c.type));
			output[idx++] = this.#uint8[3];
			output[idx++] = this.#uint8[2];
			output[idx++] = this.#uint8[1];
			output[idx++] = this.#uint8[0];
		});

		return output;
	}

	// Parse PNG file and return decoded UTF8 "chara" base64 tEXt chunk value
	static Parse(arrayBuffer) {
		const chunks = Png.#readChunks(new Uint8Array(arrayBuffer));

		const text = chunks.filter(c => c.type === 'tEXt').map(c => Png.#decodeText(c.data));
		if (text.length < 1) {
			throw new Error('PNG Missing Character error: No PNG text fields found in file');
		}

		const chara = text.find(t => t.keyword === 'chara');
		if (chara === undefined) {
			throw new Error('No PNG text field named "chara" found in file');
		}

		try {
			return new TextDecoder().decode(Uint8Array.from(atob(chara.text), c => c.charCodeAt(0)));
		} catch (e) {
			throw new Error('PNG Invalid Character Error: Unable to parse "chara" field as base64', {
				cause: e
			});
		}
	}

	// Parse PNG file, strip all tEXt chunks, add encoded UTF8 "chara" base64 tEXt chunk and return PNG file
	static Generate(arrayBuffer, text) {
		// Read PNG and remove all tEXt chunks, as TavernAI does
		// NOTE: TavernAI blindly reads first tEXt chunk, rather than searching for one named "chara"
		const chunks = Png.#readChunks(new Uint8Array(arrayBuffer)).filter(c => c.type !== 'tEXt');

		// Insert new "chara" tEXt chunk just before IEND chunk, as TavernAI does
		// NOTE: Some programs won't see the tEXt chunk if its after any IDAT chunks
		chunks.splice(-1, 0, {
			type: 'tEXt',
			data: Png.#encodeText('chara', btoa(new TextEncoder().encode(text).reduce((a, c) => a + String.fromCharCode(c), ''))),
			crc: undefined
		});

		return Png.#encodeChunks(chunks);
	}
};

/**
 * Adapted from https://github.com/ZoltanAI/character-editor
 *
 * @param {File} file
 * @returns {HTMLAnchorElement}
 */
App.UI.SlaveInteract.SlaveBot.downloadFile = (file) => {
	const link = window.URL.createObjectURL(file);

	const a = document.createElement('a');
	a.innerText = "Download Card";
	a.setAttribute('download', file.name);
	a.setAttribute('href', link);
	a.click();

	return a;
};

/**
 * Adapted from https://github.com/ZoltanAI/character-editor
 *
 * @param {object} characterCard Finished Character card
 * @returns {File}
 */
App.UI.SlaveInteract.SlaveBot.exportJsonFile = (characterCard) => {
	const file = new File([Serial.stringify(characterCard, undefined, '\t')], `${characterCard.data.name || 'character'}.card.json`, {type: 'application/json;charset=utf-8'});
	return file;
};

/**
 * @param {FC.SlaveState} slaveState Slave state
 */
App.UI.SlaveInteract.SlaveBot.exportFile = async (slaveState) => {
	try {
		/** @type {string} */
		let imageUrl;
		if (V.aiCachingStrategy === 'static') {
			const displayedIdx = slaveState.custom.aiDisplayImageIdx;
			const imageDbId = slaveState.custom.aiImageIds[displayedIdx];
			const {data} = await App.Art.GenAI.staticImageDB.getImage(imageDbId);

			imageUrl = data;
		} else {
			/**
			 * @type {App.Art.GenAI.GetImageOptions}
			 */
			const effectiveOptions = {
				action: 'overview',
				size: 3,
				forceRegenerate: false,
				isEventImage: false,
			};
			const res = await App.Art.GenAI.reactiveImageDB.getImage([slaveState], effectiveOptions);
			imageUrl = res.data.images.lowRes;
		}

		const characterCardObj = App.UI.SlaveInteract.SlaveBot.createCharacterDataFromSlave(slaveState);
		const imageRes = await fetch(imageUrl);
		const imageArrayBuffer = await imageRes.arrayBuffer();
		const json = Serial.stringify(characterCardObj, undefined, '\t');
		const png = App.UI.SlaveInteract.SlaveBot.Png.Generate(imageArrayBuffer, json);

		const file = new File([png], `${characterCardObj.data.name || 'character'}.card.png`, {type: 'image/png'});
		return file;
	} catch (e) {
		if (V.debugMode === 1) {
			console.warn(e);
		}
		const {fallbackImage, createCharacterDataFromSlave} = App.UI.SlaveInteract.SlaveBot;

		const imageRes = await fetch(fallbackImage);
		const imageArrayBuffer = await imageRes.arrayBuffer();

		const characterCardObj = createCharacterDataFromSlave(slaveState);

		const json = Serial.stringify(characterCardObj, undefined, '\t');
		const png = App.UI.SlaveInteract.SlaveBot.Png.Generate(imageArrayBuffer, json);

		const file = new File([png], `${characterCardObj.data.name || 'character'}.card.png`, {type: 'image/png'});
		return file;
	}
};

/**
 * @param {FC.SlaveState} slave
 * @returns {FC.SlaveBot.TavernCardV2} asdf
 * */
App.UI.SlaveInteract.SlaveBot.createCharacterDataFromSlave = (slave) => {
	// Get all greetings that satisfy prereqs.
	const alternateGreetings = App.UI.SlaveInteract.SlaveBotGreetings
		.filter((greetingObj) => greetingObj.prereqs.every((prereq) => prereq(slave)))
		.map((greetingObj) => greetingObj.getGreeting(slave));

	const Generate = App.UI.SlaveInteract.SlaveBot.Generate;

	/**
	 * @type {Array<FC.SlaveBot.CharacterBookEntry>}
	 */
	const lorebookEntries = [
		Generate.lorebookArcology(0),
		Generate.lorebookFuckdoll(1),
		Generate.lorebookMindbroken(2),
		Generate.lorebookArcade(3),
		Generate.lorebookDairy(4),
		...Generate.lorebookActiveFS(100), // adds Future Societies to Lorebook
		Generate.lorebookHeadGirl(200),
		Generate.lorebookStewardess(201),
		Generate.lorebookPA(202),
		Generate.lorebookRivLov(203, slave),
	].filter(Boolean);

	/**
	 * Construct a character card based on the Card v2 spec: https://github.com/malfoyslastname/character-card-spec-v2
	 *
	 * @type {FC.SlaveBot.TavernCardV2}
	 */
	const characterCard = {
		spec: 'chara_card_v2',
		spec_version: '2.0', // May 8th addition
		data: {
			alternate_greetings: alternateGreetings,
			character_version: "main",
			creator: `FreeCities ${App.Version.pmod} System Generated`,
			creator_notes: `FreeCities ${App.Version.pmod} System Generated Slave Bot`,
			description: Generate.description(slave) + Generate.relationships(slave) + Generate.standardPrompt(),
			first_mes: Generate.firstMessage(slave),
			mes_example: "",
			name: slave.slaveName,
			personality: Generate.personality(slave) + "\nStewardess manages the servants that clean the penthouse.",
			scenario: `{{char}} and {{user}} exist in the slaveholding arcology of ${V.arcologies[0].name}.`,
			system_prompt: "",
			extensions: {
				freecitiesJSON: toJson(slave),  // This is full defintions export of slave using prior FC method
			},
			character_book: {  // aka Lorebook
				entries: lorebookEntries,
				name: `FC ${V.arcologies[0].name} ${slave.slaveName}`,
				extensions: {}, // mandatory V2 spec
			},
			post_history_instructions: '',
			tags: ['free cities', 'slave']
		}
	};
	return characterCard;
};


/**
 * Generates a character card description for the slave
 *
 * @param {FC.SlaveState} slave Slavestate
 * @returns {string}
 */
App.UI.SlaveInteract.SlaveBot.Generate.description = (slave) => {
	let r = [];
	const {he, his} = getPronouns(slave);
	let descParts = [];

	// NAME
	r.push(`Name: ${SlaveFullName(slave)}`);

	// RELATIONSHIP
	r.push(`\r\nRelationship: ${slave.slaveName} is {{user}}'s `);
	// Slave age (consider visible age)
	r.push(`${slave.actualAge} year old `);

	// Devotion
	if (slave.fetish !== Fetish.MINDBROKEN) {
		if (slave.devotion < -95) {
			r.push("hate-filled, ");
		} else if (slave.devotion < -50) {
			r.push("hateful, ");
		} else if (slave.devotion < -20) {
			r.push("reluctant, ");
		} else if (slave.devotion <= 20) {
			r.push("hesitant, ");
		} else if (slave.devotion <= 50) {
			r.push("accepting, ");
		} else if (slave.devotion <= 95) {
			r.push("devoted, ");
		} else {
			r.push("worshipful, ");
		}

		// Trust
		if (slave.trust < -95) {
			r.push("abjectly terrified ");
		} else if (slave.trust < -50) {
			r.push("terrified ");
		} else if (slave.trust < -20) {
			r.push("frightened ");
		} else if (slave.trust < 20) {
			r.push("fearful ");
		} else if (slave.trust <= 50) {
			r.push("careful ");
		} else if (slave.trust < 95) {
			if (slave.devotion < -20) {
				r.push("bold ");
			} else {
				r.push("trusting ");
			}
		} else {
			if (slave.devotion < -20) {
				r.push("defiant ");
			} else {
				r.push("profoundly trusting ");
			}
		}
	} else {
		r.push("mindbroken ");
	}

	// Slave's Title, ex:"pregnant big bottomed busty milky hourglass broodmother"
	if (slave.fuckdoll > 0) {
		r.push("Fuckdoll");
	} else {
		r.push(`${SlaveTitle(slave)}`);
	}

	// DESCRIPTION
	r.push("\r\nDescription: ");

	// Eyes
	// eye color (orig vs. current?), Add check for no eyes (does it matter?)

	if (slave.fuckdoll > 0) {
		r.push(`blinded, `);
	} else if (!canSee(slave)) {
		r.push(`${slave.eye.origColor} eyes, is blind, `);
	} else {
		r.push(`${slave.eye.origColor} eyes, `);
	}

	if (slave.fuckdoll > 0) {
		r.push("mute, "); // Add fuckdoll additions (ADAPTATION) to any of above skipped descriptors here NG
	} else {
		// Skin
		r.push(`${slave.skin} skin, `);

		// Slave intelligence: Ignore average, include mindbroken
		if (slave.fetish === Fetish.MINDBROKEN) {
			r.push("mindbroken, ");
		} else if (slave.intelligence < -95) {
			r.push("borderline retarded, ");
		} else if (slave.intelligence < -50) {
			r.push("very dumb, ");
		} else if (slave.intelligence > 95) {
			r.push("brilliant, ");
		} else if (slave.intelligence > 50) {
			r.push("very smart, ");
		}

		// Beauty
		if (slave.face < -40) {
			r.push(`${slave.faceShape} ugly face, `);
		} else if (slave.face > 50) {
			r.push(`${slave.faceShape} gorgeous face, `);
		} else if (slave.face > 10) {
			r.push(`${slave.faceShape} very pretty face, `);
		} else {
			r.push(`${slave.faceShape} face, `);
		}

		// Hairstyle
		if (slave.hLength > 100) {
			r.push("very long ");
		} else if (slave.hLength > 30) {
			r.push("long ");
		} else if (slave.hLength > 10) {
			r.push("short ");
		} else if (slave.hLength > 0) {
			r.push("very short ");
		}
		r.push(`${slave.hColor} `);

		// Add "hair" to hairstyles that need it to make sense (e.g. "messy" becomes "messy hair" but "dreadlocks" stays as is)
		if (["braided", "curled", "eary", "bun", "messy bun", "tails", "drills", "luxurious", "messy", "neat", "permed", "bangs", "hime", "strip", "up", "trimmed", "undercut", "double buns", "chignon"].includes(slave.hStyle)) {
			r.push(`${slave.hStyle} hair, `);
		} else {
			r.push(`${slave.hStyle}, `);
		}

		// Start conditional descriptions
		// Education (bimbo/hindered, well educated)
		if (slave.intelligenceImplant < 10) {
			descParts.push("vapid bimbo with no education");
		} else if (slave.intelligenceImplant > 25) {
			descParts.push("very well educated");
		}
	}

	// Height. Ignore Average
	if (slave.height < 150) {
		descParts.push(`short`);
	} else if (slave.height > 180) {
		descParts.push(`tall`);
	}

	// Weight. Ignore average
	if (slave.weight < -95) {
		descParts.push(`emaciated`);
	} else if (slave.weight < -30) {
		descParts.push(`very skinny`);
	} else if (slave.weight > 95) {
		descParts.push(`very fat`);
	} else if (slave.weight > 30) {
		descParts.push(`plump`);
	}

	// Boobs. Ignore Average. Add lactation? NG
	if (slave.boobs < 300) {
		descParts.push(`flat chested`);
	} else if (slave.boobs < 500) {
		descParts.push(`small breasts`);
	} else if (slave.boobs > 1400) {
		descParts.push(`massive breasts that impede movement`);
	} else if (slave.boobs > 800) {
		descParts.push(`large breasts`);
	}

	// Butt. Ignore average
	if (slave.butt <= 1) {
		descParts.push(`flat butt`);
	} else if (slave.butt > 7) {
		descParts.push(`gigantic ass`);
	} else if (slave.butt > 3) {
		descParts.push(`big ass`);
	}

	// Musculature
	if (slave.muscles < -31) {
		descParts.push(`very weak`);
	} else if (slave.muscles > 50) {
		descParts.push(`very muscular`);
	}

	// Check amputee (add missing just arms/legs)
	if (isAmputee(slave)) {
		descParts.push(`missing both arms and both legs`);
	}

	// Check pregnant
	if (slave.preg > 30) {
		descParts.push(`very pregnant`);
	} else if (slave.preg > 20) {
		descParts.push(`pregnant`);
	}

	// Check teeth
	if (slave.teeth === "straightening braces" || slave.teeth === "cosmetic braces") {
		descParts.push(`braces on teeth`);
	} else if (slave.teeth === "removable") {
		descParts.push(`has dentures`);
	}

	if (descParts.length > 0) {
		r.push(`${descParts.join(', ')}`);
	}


	// BACKGROUND
	if (!slave.fuckdoll && slave.fetish !== Fetish.MINDBROKEN) {
		if (slave.career === "a slave") {
			r.push(`\r\nBackground: ${slave.slaveName} has been enslaved for as long as ${he} can remember`);
		} else {
			r.push(`\r\nBackground: Prior to enslavement, ${slave.slaveName} was ${slave.career}`);
		}
	}

	// ASSIGNMENT
	r.push(`\r\nAssignment: ${slave.assignment}`);

	if (!slave.fuckdoll) {
		// FETISH
		// Paraphilias listed and prompted
		if (slave.sexualFlaw === SexualFlaw.CUMADDICT) {
			r.push(`\r\nFetish: pathologically addicted to cum`);
		} else if (slave.sexualFlaw === SexualFlaw.ANALADDICT) {
			r.push(`\r\nFetish: pathologically addicted to anal sex`);
		} else if (slave.sexualFlaw === SexualFlaw.NEGLECT) {
			r.push(`\r\nTrait: only considers ${his} partner's pleasure`);
		} else if (slave.sexualFlaw === SexualFlaw.ATTENTION) {
			r.push(`\r\nTrait: pathologically narcissistic`);
		} else if (slave.sexualFlaw === SexualFlaw.BREASTEXP) {
			r.push(`\r\nFetish: pathologically addicted to breast augmentation`); // is this right
		} else if (slave.sexualFlaw === SexualFlaw.SELFHATING) {
			r.push(`\r\nTrait: pathologically masochistic`);
		} else if (slave.sexualFlaw === SexualFlaw.ABUSIVE || slave.sexualFlaw === SexualFlaw.MALICIOUS) {
			r.push(`\r\nTrait: sociopathic, delights in abusing others`); // Are above the same for purposes of LLM
		}

		// Explain sex/entertainment skill level. Leave off average. Check virgin status.

		// ABILITIES
		let abilParts = [];
		if (slave.vagina === 0) {
			abilParts.push("virgin");
		} else if (slave.skill.whoring < 10) {
			abilParts.push("sexually unskilled");
		} else if (slave.skill.whoring > 100) {
			abilParts.push("renowned whore");
		} else if (slave.skill.whoring > 61) {
			abilParts.push("expert whore");
		}

		if (slave.skill.entertainment > 100) {
			abilParts.push(`renowned entertainer`);
		} else if (slave.skill.entertainment > 61) {
			abilParts.push(`expert entertainer`);
		}
		if (abilParts.length > 0) {
			r.push(`\r\nAbilities: ${abilParts.join(', ')}`);
		}
	}

	// WEARING
	r.push(`\r\nWearing: ${slave.clothes}`);
	if (slave.collar !== "none") {
		r.push(`, ${slave.collar} collar`);
	}

	// GENITALS
	// Front
	r.push("\r\nGenitals: ");
	if (slave.dick === 0 && slave.vagina === -1) { // null slave
		r.push("No genitals");
	} else if (slave.vagina < 0) { // has a dick
		if (slave.dick < 1) {
			r.push("tiny penis");
		} else if (slave.dick > 8) {
			r.push("absurdly large penis");
		} else if (slave.dick > 5) {
			r.push("large penis");
		} else {
			r.push("penis");
		}
	} else if (slave.vagina === 0) { // has a pussy
		r.push("virgin pussy");
	} else if (slave.vagina < 2) {
		r.push("tight pussy");
	} else if (slave.vagina > 6) {
		r.push("cavernous pussy");
	} else if (slave.vagina > 3) {
		r.push("loose pussy");
	} else {
		r.push("pussy");
	}
	// Back
	if (slave.anus === 0) {
		r.push(", virgin anus");
	} else if (slave.vagina > 3) {
		r.push(", loose anus");
	}
	// PHair
	if (slave.pubicHStyle === "hairless" || slave.pubicHStyle === "bald") {
		r.push(", no pubic hair");
	} else {
		r.push(`, pubic hair ${slave.pubicHStyle}`);
	}
	// RULES
	let rulesParts = [];

	if (!slave.fuckdoll) {
		// Speech (also check for mute)
		if (slave.voice === 0) {
			rulesParts.push(`Mute and cannot speak`);
		} else if (slave.rules.speech === "restrictive") {
			rulesParts.push(`Not allowed to speak`);
		}
		// Masturbation rules, also check for ability to molest other slaves (release cases?)
		if (slave.rules.release.masturbation === 0) {
			rulesParts.push(`Not allowed to masturbate`);
		}
		// How they address the user, if not mute
		if (slave.voice !== 0) {
			rulesParts.push(`Addresses {{user}} as ${properMaster()}`);
		}
	}

	if (rulesParts.length > 0) {
		r.push(`\r\nRules: ${rulesParts.join(', ')}`);
	}

	// TATTOOS - Too much context for impact?
	let tattooParts = [];

	if (!slave.fuckdoll) {
		if (slave.armsTat) {
			tattooParts.push(`${slave.armsTat} arm tattoo`);
		}
		if (slave.legsTat) {
			tattooParts.push(`${slave.legsTat} leg tattoo`);
		}
		if (slave.bellyTat) {
			tattooParts.push(`${slave.bellyTat} belly tattoo`);
		}
		if (slave.boobsTat) {
			tattooParts.push(`${slave.boobsTat} breast tattoo`);
		}

		if (tattooParts.length > 0) {
			r.push(`\r\nTattoos: ${tattooParts.join(', ')}`);
		}
	}

	// CHASTITY
	let chasParts = [];
	if (slave.chastityVagina === 1) {
		chasParts.push(`vagina`);
	}
	if (slave.chastityPenis === 1) {
		chasParts.push(`penis`);
	}
	if (slave.chastityAnus === 1) {
		chasParts.push(`anus`);
	}
	if (chasParts.length > 0) {
		r.push(`\r\nChastity device covers: ${chasParts.join(', ')}`);
	}

	// PROSTHETICS
	if (hasBothProstheticArms(slave) && hasBothProstheticLegs(slave)) {
		r.push(`\r\n${slave.slaveName} has android arms and legs`);
	} else if (hasBothProstheticArms(slave)) {
		r.push(`\r\n${slave.slaveName} has android arms`);
	} else if (hasBothProstheticLegs(slave)) {
		r.push(`\r\n${slave.slaveName} has android legs`);
	}
	return r.join("");
};

/**
 * Generates relationships content for the slave
 *
 * @param {FC.SlaveState} slave Slavestate
 * @returns {string}
 */
App.UI.SlaveInteract.SlaveBot.Generate.relationships = (slave) => {
	let r = [];
	// const { he, his } = getPronouns(slave);
	// RELATIONSHIPS and RIVALRIES
	// Lover
	if (!slave.fuckdoll) {
		const lover = slave.relationship > 0 ? getSlave(slave.relationshipTarget) : null;
		if (lover) {
			if (slave.relationship > 4) {
				r.push(`\r\n${SlaveFullName(lover)} is ${slave.slaveName}'s wife`);
			} else if (slave.relationship > 3) {
				r.push(`\r\n${SlaveFullName(lover)} is ${slave.slaveName}'s lover`);
			} else if (slave.relationship > 2) {
				r.push(`\r\n${SlaveFullName(lover)} is ${slave.slaveName}'s girlfriend`);
			} else if (slave.relationship > 1) {
				r.push(`\r\n${SlaveFullName(lover)} is ${slave.slaveName}'s friend with benefits`);
			} else {
				r.push(`\r\n${SlaveFullName(lover)} is ${slave.slaveName}'s friend`);
			}
		}
	}

	// Rival
	if (!slave.fuckdoll) {
		const rival = slave.rivalry > 0 ? getSlave(slave.rivalryTarget) : null;
		if (rival) {
			if (slave.rivalry <= 1) {
				r.push(`\r\n${slave.slaveName} dislikes ${SlaveFullName(rival)}`);
			} else if (slave.rivalry <= 2) {
				r.push(`\r\n${slave.slaveName} hates ${SlaveFullName(rival)}`);
			} else {
				r.push(`\r\n${slave.slaveName} bitterly hates ${SlaveFullName(rival)}`);
			}
		}
	}
	return r.join("");
};

/**
 *
 * @returns {string} Standard prompt
 */
App.UI.SlaveInteract.SlaveBot.Generate.standardPrompt = () => {
	let r = [];

	// PERMANENT CHAR PROMPT PART - Does not rely on any slave attributes, but leaving with .join and (slave) passthrough for future conditionals
	r.push(`\r\n{{user}} is the owner of ${V.arcologies[0].name}, an arcology in the fictional slave-holding world of Free Cities. `);
	r.push(App.UI.SlaveInteract.SlaveBot.Generate.playerSummary());
	r.push(`\r\n{{user}} has authority over his subjects, including training and conditioning slaves for sexual servitude. This is accomplished through coercion, punishment, and other conditioning.\r\nRespond and roleplay only for {{char}} and other NPC.`);

	return r.join("");
};

/**
 * @param {FC.SlaveState} slave Slavestate
 * @returns {string} Slave's first message in the chat
 */
App.UI.SlaveInteract.SlaveBot.Generate.firstMessage = (slave) => {
	let r = [];
	const {He, His, he, his} = getPronouns(slave);
	// Set up basic scenario
	r.push("I am sitting in my office as {{char}} arrives for inspection.\r\n");

	// Trust switches
	if (slave.fuckdoll > 0) {
		r.push(`{{char}} is lead in, encased in ${his} fuckdoll suit. `);
		if (slave.fuckdoll < 50) {
			r.push(`${His} twitching hands and slight movement shows ${he} is still fighting the adaptation process, but is unable to move. `);
		} else {
			r.push(`${He} is eerily still. `);
		}
	} else {
		r.push("{{char}} comes in, ");

		if (slave.trust < -95) {
			r.push(`appearing abjectly terrified, barely able to control ${his} terror. `);
		} else if (slave.trust < -50) {
			r.push(`appearing terrified, barely concealing ${his} fear. `);
		} else if (slave.trust < -20) {
			r.push("looking frightened. ");
		} else if (slave.trust < 20) {
			r.push("looking fearful. ");
		} else if (slave.trust <= 50) {
			r.push("appearing cautious. ");
		} else if (slave.trust < 95) {
			if (slave.devotion < -20) {
				r.push("boldly approaching my desk. ");
			} else {
				r.push("trustingly approaching my desk. ");
			}
		} else {
			if (slave.devotion < -20) {
				r.push(`defiantly approaching my desk, ${his} head held high. `);
			} else {
				r.push(`a serene look of profound trust on ${his} face. `);
			}
		}

		// Devotion switches
		if (slave.devotion < -95) {
			r.push(`${His} hate-filled face is barely under control. `);
		} else if (slave.devotion < -50) {
			r.push(`${His} hate for me and these inspections is obvious, though ${he} manages a neutral face. `);
		} else if (slave.devotion < -20) {
			r.push(`${He} appears to have come only reluctantly, preferring to avoid me whenever possible. `);
		} else if (slave.devotion <= 20) {
			r.push(`${He} appears hesitant, not quite trusting me or these inspections.`);
		} else if (slave.devotion <= 50) {
			r.push(`${His} demeanor is accepting, knowing that inspections are a normal part of the week.`);
		} else if (slave.devotion <= 95) {
			r.push(`${He} looks very pleased to have ${properMaster()}'s attention, shining with devotion. `);
		} else {
			r.push(`${He} is positively glowing at the opportunity to have ${his} precious ${properMaster()}'s attention, radiating worshipful devotion.`);
		}
	}
	r.push("\r\n");

	// Check Voice and Vocal Rules
	if (slave.voice === 0 || slave.rules.speech === "restrictive") {
		r.push(`{{char}} is silent, waiting for {{user}} to act.`);
	} else {
		r.push(`{{char}} looks forward and speaks, "${properMaster()}, how may I serve you?"`);
	}

	return r.join("");
};

/**
 * @param {FC.SlaveState} slave Slavestate
 * @returns {string} Personality description
 */
App.UI.SlaveInteract.SlaveBot.Generate.personality = (slave) => {
	let r = [];
	r.push("\r\n{{char}} is {{user}}'s ");
	// Slave age (consider visible age)
	r.push(`${slave.actualAge} year old `);

	// Devotion
	if (slave.fetish !== Fetish.MINDBROKEN) {
		if (slave.devotion < -95) {
			r.push("hate-filled, ");
		} else if (slave.devotion < -50) {
			r.push("hateful, ");
		} else if (slave.devotion < -20) {
			r.push("reluctant, ");
		} else if (slave.devotion <= 20) {
			r.push("hesitant, ");
		} else if (slave.devotion <= 50) {
			r.push("accepting, ");
		} else if (slave.devotion <= 95) {
			r.push("devoted, ");
		} else {
			r.push("worshipful, ");
		}

		// Trust
		if (slave.trust < -95) {
			r.push("abjectly terrified ");
		} else if (slave.trust < -50) {
			r.push("terrified ");
		} else if (slave.trust < -20) {
			r.push("frightened ");
		} else if (slave.trust < 20) {
			r.push("fearful ");
		} else if (slave.trust <= 50) {
			r.push("careful ");
		} else if (slave.trust < 95) {
			if (slave.devotion < -20) {
				r.push("bold ");
			} else {
				r.push("trusting ");
			}
		} else {
			if (slave.devotion < -20) {
				r.push("defiant ");
			} else {
				r.push("profoundly trusting ");
			}
		}
	} else {
		r.push("mindbroken ");
	}

	// Slave's Title
	if (slave.fuckdoll > 0) {
		r.push("Fuckdoll");
	} else {
		r.push(`${SlaveTitle(slave)}`);
	}

	return r.join("");
};

/**
 * Generates player summary for character cards.
 *
 * @returns {string} Player summary
 */
App.UI.SlaveInteract.SlaveBot.Generate.playerSummary = () => {
	// sections here taken from pLongDescription.js
	const PC = V.PC;
	const r = [];

	r.push(`{{user}} is `);
	if (!PC.nationality || V.seeNationality !== 1 || PC.nationality === "Stateless" || PC.nationality === "slave") {
		r.push(`${PC.race} `);
	} else if (PC.nationality === "Zimbabwean" && PC.race === "white") {
		r.push(`a Rhodesian `);
	} else if (PC.nationality === "Vatican") {
		r.push(`${PC.race} Vatican `);
	} else {
		r.push(`${PC.race} ${PC.nationality} `);
	}
	if (PC.dick && PC.vagina !== -1) {
		r.push(`futanari `);
	} else if (PC.dick > 0) {
		r.push(`${PC.actualAge > 12 ? "man " : "boy "}`);
	} else {
		r.push(`${PC.actualAge > 12 ? "woman " : "girl "}`);
	}
	r.push(`with `);
	if (PC.markings === "freckles") {
		r.push(`freckled `);
	} else if (PC.markings === "heavily freckled") {
		r.push(`heavily freckled `);
	}
	r.push(`${PC.skin} skin, `);

	r.push(App.Desc.Player.face(PC) + " ");

	let ageDifference = '';
	if (PC.visualAge > PC.actualAge) {
		ageDifference = `{{user}} has taken measures to look an older ${PC.visualAge}.`;
	} else if (PC.visualAge < PC.actualAge) {
		ageDifference = `{{user}} has taken measures to look a younger ${PC.visualAge}.`;
	}
	r.push(`{{user}} is ${PC.actualAge} years old.`, ageDifference);

	return r.join("");
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookArcology = (startId) => {
	return {
		id: startId,
		keys: ["arcology"], // Trigger word for ST to use the content
		secondary_keys: [], // Second Trigger condition (requires both to insert)
		comment: "Concept: Arcology",
		content: "Arcology: sustainable urban living complex, integrating living spaces, workspaces, and recreational areas in a harmonious and efficient manner. ", // This content is inserted in context. Note it includes Key
		constant: false,
		selective: true,
		insertion_order: 100, // Prioritizes order. Lower value = higher priority
		enabled: true,
		position: "after_char", // Position of content in context
		extensions: { // Below mostly deals with probability-based insertion
			position: 1,
			exclude_recursion: false,
			display_index: 0,
			probability: 100,
			useProbability: true,
			depth: 4,
			selectiveLogic: 0,
			group: ""
		}
	};
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookFuckdoll = (startId) => {
	return {
		id: startId,
		keys: ["fuckdoll"],
		secondary_keys: [],
		comment: "Concept: Fuckdoll",
		content: "Fuckdoll suit: advanced slave suit, permanently worn, subjecting slave to total control, eliminates all sensory stimulation other than orders passed by the suit's systems and objects inserted into the Fuckdoll's face, pussy, and ass. Slave reactions to commands are mechanical and automatic, pussy and ass are kept lubricated automatically",
		constant: false,
		selective: true,
		insertion_order: 100,
		enabled: true,
		position: "after_char",
		extensions: {
			position: 1,
			exclude_recursion: false,
			display_index: 0,
			probability: 100,
			useProbability: true,
			depth: 4,
			selectiveLogic: 0,
			group: ""
		}
	};
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookMindbroken = (startId) => {
	return {
		id: startId,
		keys: ["mindbroken"],
		secondary_keys: [],
		comment: "Concept: Mindbroken",
		content: "Mindbroken: slave's mind is blank, everything she experiences will quickly be forgotten.",
		constant: false,
		selective: true,
		insertion_order: 100,
		enabled: true,
		position: "after_char",
		extensions: {
			position: 1,
			exclude_recursion: false,
			display_index: 0,
			probability: 100,
			useProbability: true,
			depth: 4,
			selectiveLogic: 0,
			group: ""
		}
	};
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookArcade = (startId) => {
	return {
		id: startId,
		keys: ["arcade"],
		secondary_keys: [],
		comment: "Location: Arcade",
		content: "Arcade: gloryhole stalls, offering retrained slaves mouths, vaginas and anuses for use by the public",
		constant: false,
		selective: true,
		insertion_order: 100,
		enabled: true,
		position: "after_char",
		extensions: {
			position: 1,
			exclude_recursion: false,
			display_index: 0,
			probability: 100,
			useProbability: true,
			depth: 4,
			selectiveLogic: 0,
			group: ""
		}
	};
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookDairy = (startId) => {
	return {
		id: startId,
		keys: ["dairy"],
		secondary_keys: [],
		comment: "Location: Dairy",
		content: "Dairy: barn used for milking and breeding human slaves, collecting human milk for sale and selling breeding services",
		constant: false,
		selective: true,
		insertion_order: 100,
		enabled: true,
		position: "after_char",
		extensions: {
			position: 1,
			exclude_recursion: false,
			display_index: 0,
			probability: 100,
			useProbability: true,
			depth: 4,
			selectiveLogic: 0,
			group: ""
		}
	};
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {Array<FC.SlaveBot.CharacterBookEntry>}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookActiveFS = (startId) => {
	// FUTURE SOCIETIES - Lorebook returns a block of all active FS
	// Lorebook entries are always applied, so no Key required
	return FutureSocieties.activeFSes(V.arcologies[0]).map((activeFS, idx) => {
		return {
			id: startId + idx,
			keys: [], // no keys bc always applied
			secondary_keys: [],
			comment: activeFS,
			content: App.UI.SlaveInteract.SlaveBot.Generate.lorebookFSContent(activeFS),
			constant: true, // always applied
			selective: true,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}

		};
	});
};


/**
 * Converts an FS type into a string description.
 *
 * @param {FC.FutureSociety} fsType The future society applied
 * @returns {string}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookFSContent = (fsType) => {
	// Content descriptions should be kept short as they are always applied if the associated Future Society is in place
	switch (fsType) {
		case "FSSubjugationist":
			return (`${V.arcologies[0].name} believes implicitly in the inferiority of the ${V.arcologies[0].FSSubjugationistRace} race.`);
		case "FSSupremacist":
			return (`${V.arcologies[0].name} believes implicity in the superiority of the ${V.arcologies[0].FSSupremacistRace} race.`);
		case "FSGenderRadicalist":
			return (`${V.arcologies[0].name} identifies powerful people as male, and everyone else as female.`);
		case "FSGenderFundamentalist":
			return (`${V.arcologies[0].name} has a societal preference for feminine slaves and support for slave pregnancy.`);
		case "FSPaternalist":
			return (`${V.arcologies[0].name} believes in slave improvement, and prioritizes  slave health, mental well-being, and education.`);
		case "FSDegradationist":
			return (`${V.arcologies[0].name} believes that slaves are not human and should not be treated decently.`);
		case "FSIntellectualDependency":
			return (`${V.arcologies[0].name} believes that slaves should be airheaded, horny and fully dependent on their owners.`);
		case "FSSlaveProfessionalism":
			return (`${V.arcologies[0].name} values smart, refined, and highly skilled slaves.`);
		case "FSBodyPurist":
			return (`${V.arcologies[0].name} disapproves of breast and butt implants, heavy tattoos and piercings`);
		case "FSTransformationFetishist":
			return (`${V.arcologies[0].name} fetishizes slaves with implant surgery, heavy piercings, and tattoos.`);
		case "FSYouthPreferentialist":
			return (`${V.arcologies[0].name} has a societal preference for young slaves.`);
		case "FSMaturityPreferentialist":
			return (`${V.arcologies[0].name} has a societal preference for mature slaves.`);
		case "FSStatuesqueGlorification":
			return (`${V.arcologies[0].name} has a societal preference for tall slaves.`);
		case "FSPetiteAdmiration":
			return (`${V.arcologies[0].name} has a societal preference for short slaves.`);
		case "FSSlimnessEnthusiast":
			return (`${V.arcologies[0].name} prefers slaves with slim, girlish figures.`);
		case "FSAssetExpansionist":
			return (`${V.arcologies[0].name} fetishizes slaves with huge breasts, butts, and lips.`);
		case "FSPastoralist":
			return (`${V.arcologies[0].name} highly values slaves as human cows and their milk.`);
		case "FSPhysicalIdealist":
			return (`${V.arcologies[0].name} has a societal reverence for the idealized human form, including height, health and muscle.`);
		case "FSChattelReligionist":
			return (`${V.arcologies[0].name} follows a religion that justifies slaveholding by emphasizing slaveholding portions of religious history.`);
		case "FSRomanRevivalist":
			return (`${V.arcologies[0].name} is building itself into a new Rome, embracing its architectural and societal ideals, including gladiators.`);
		case "FSAztecRevivalist":
			return (`${V.arcologies[0].name} is building itself into a new Aztec Empire, embracing its architectural and societal ideals, including human sacrifice.`);
		case "FSEgyptianRevivalist":
			return (`${V.arcologies[0].name} is building itself into Pharaoh's Egypt, embracing its architectural and societal ideals.`);
		case "FSEdoRevivalist":
			return (`${V.arcologies[0].name} is building itself into Edo Japan, embracing its architectural and societal ideals.`);
		case "FSArabianRevivalist":
			return (`${V.arcologies[0].name} is building itself into an Arabian Sultanate, embracing its architectural and societal ideals.`);
		case "FSChineseRevivalist":
			return (`${V.arcologies[0].name} is building itself into a version of ancient China, embracing its architectural and societal ideals.`);
		case "FSAntebellumRevivalist":
			return (`${V.arcologies[0].name} is building itself into an Antebellum American South, embracing its architectural and societal ideals.`);
		case "FSNull":
			return (`${V.arcologies[0].name} is committed to the arcology's citizens cultural freedom.`);
		case "FSRepopulationFocus":
			return (`${V.arcologies[0].name} is a focus on mass slave breeding in order to repopulate the future world.`);
		case "FSHedonisticDecadence":
			return (`${V.arcologies[0].name} pursues overindulgence and immediate gratification, be it food, drink, sex, or drugs.`);
		case "FSRestart":
			return (`${V.arcologies[0].name} is rebuilding society using a restrictive breeding program reserved solely for society's finest, monitored by the powerful Societal Elite.`);
		default:
			return null;
	}
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookHeadGirl = (startId) => {
	// Returns lorebook entry of HeadGirl
	// Lorebook entry will Key on the title of the slave, as well as their first name (either/or)
	// Need to figure out how to turn this off if exported slave *is* the HeadGirl
	if (V.HeadGirlID !== 0) {
		return {
			id: startId,
			keys: ["Head Girl", "headgirl", S.HeadGirl.slaveName], // either/or title, first name
			secondary_keys: [], // not used
			comment: "HeadGirl",
			content: App.UI.SlaveInteract.SlaveBot.Generate.description(S.HeadGirl) + "/nThe head girl manages the health, training, and wellbeing of all slaves in your penthouse, and ensures your businesses are running smoothly.", // slave description minus relationships
			constant: false, // selectively applied
			selective: false,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}
		};
	} else { // Specifically outline state if there is no HG
		return {
			id: startId,
			keys: ["Head Girl", "headgirl"], // either/or title, first name
			secondary_keys: [], // not used
			comment: "noHeadGirl",
			content: "There is no head girl assigned to the penthouse; slaves training and assignments are overseen by {{user}}.",
			constant: false, // selectively applied
			selective: false,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}
		};
	}
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookStewardess = (startId) => {
	// Returns lorebook entry of Stewardess
	// Lorebook entry will Key on the title of the slave, as well as their first name (either/or)
	// Need to figure out how to turn this off if exported slave *is* the Stewardess
	if (V.StewardessID !== 0) {
		return {
			id: startId,
			keys: ["stewardess", "steward", S.Stewardess.slaveName], // either/or title, first name
			secondary_keys: [], // not used
			comment: "Stewardess",
			content: App.UI.SlaveInteract.SlaveBot.Generate.description(S.Stewardess) + "/nThe stewardess manages the slaves that clean your penthouse, and controls the household budget.", // slave description plus role description, minus relationships
			constant: false, // selectively applied
			selective: false,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}
		};
	} else {
		return {
			id: startId,
			keys: ["stewardess", "steward"],
			secondary_keys: [], // not used
			comment: "noStewardess",
			content: "No stewardess is assigned; {{user}} manages the slaves that clean the penthouse.",
			constant: false, // selectively applied
			selective: false,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}
		};
	}
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @param {object} slave slave NPC being exported; Rival or Lover is in relation to slave
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookRivLov = (startId, slave) => {
	// Returns lorebook entry of Rival or Lover, depending
	// Lorebook entry will Key on the type of relationship, as well as their first name (either/or)
	let otherSlave;

	if (slave.relationship > 0) {
		otherSlave = getSlave(slave.relationshipTarget);
	} else if (slave.rivalry > 0) {
		otherSlave = getSlave(slave.rivalryTarget);
	} else {
		otherSlave = null;
	}

	if (otherSlave) {
		return {
			id: startId,
			keys: [otherSlave.slaveName], // rival/lover first name
			secondary_keys: [], // not used
			comment: "Relationship",
			content: App.UI.SlaveInteract.SlaveBot.Generate.description(otherSlave), // slave description minus relationships
			constant: true, // always applied, since it is part of basic slave description
			selective: false,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}
		};
	} else {
		return {
			id: startId,
			keys: ["rival", "lover", "friend", "enemy"],
			secondary_keys: [], // not used
			comment: "noRelationship",
			content: `${slave.slaveName} has no friends, lovers, or rivals.`,
			constant: false, // selectively applied
			selective: false,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}
		};
	}
};

/**
 * @param {number} startId Starting ID of the block in the lorebook
 * @returns {FC.SlaveBot.CharacterBookEntry}
 */
App.UI.SlaveInteract.SlaveBot.Generate.lorebookPA = (startId) => {
	// Returns lorebook entry of penthouse Personal Assistant, if such exists
	// Lorebook entry will Key on PA, as well as their first name (either/or)
	if (V.assistant.personality === 1) {
		return {
			id: startId,
			keys: ["personal assistant", V.assistant.name], // PA name
			secondary_keys: [], // not used
			comment: "PersonalAssistant",
			content: `${capFirstChar(V.assistant.name)} is your AI personal assistant, helping you manage your slaves and business holdings. They appear as a ${V.assistant.appearance}.`,
			constant: false, // selectively applied
			selective: false,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}
		};
	} else {
		return {
			id: startId,
			keys: ["personal assistant"], // PA name
			secondary_keys: [], // not used
			comment: "noPersonalAssistant",
			content: `Your computerized personal assistant is not advanced enough to actively manage the penthouse.`,
			constant: false, // selectively applied
			selective: false,
			insertion_order: 100,
			enabled: true,
			position: "after_char",
			extensions: {
				position: 1,
				exclude_recursion: false,
				display_index: 0,
				probability: 100,
				useProbability: true,
				depth: 4,
				selectiveLogic: 0,
				group: ""
			}
		};
	}
};
