App.Art.GenAI.Archiving = class Archiving {
	/**
	 * Caches the sha1 signature of images in indexedDB, to compare when importing an archive.
	 * Should be empty unless when importing.
	 * @type {Map}
	 */
	static signatureCache = new Map();

	/** @type {FC.GameVariables["aiUserInterface"]} */
	static lastAIUserInterface = undefined; // FIXME: this is a hack without this image archiving fails for ComfyUI

	/**
	 * @typedef {{path: string, week: number | 'unknown'}} archivingAIManifestEntry
	 */

	/**
	 * @typedef {Partial<Record<FC.HumanID, archivingAIManifestEntry[]>>} archivingAIManifest
	 */

	/**
	 * Fetches all the stored images of a character and puts them in the given zip container
	 *
	 * @param {FC.HumanState} s - The character whose images to fetch
	 * @param {JSZip} zip - the zip container to use
	 * @param {Function} callbackBefore A function to call before a file is added to the archive.
	 *                                  Used for UI progression indicators.
	 * @param {Function} callbackAfter A function to call after a file is added to the archive.
	 *                                 Used for UI progression indicators.
	 * @returns {Promise<Array<archivingAIManifestEntry>>} A manifest of all processed images, of the form:
	 *                 ```
	 *                 { ID:
	 *                     [
	 *                          {
	 *                              'path': Filepath in the container,
	 *                              'week': Week of image generation, or 'unknown'
	 *                          }
	 *                     ]
	 *                 }
	 *                 ```
	 * ID is "PC" for the PC's manifest.
	 */
	static async #exportImages(s, zip, callbackBefore = null, callbackAfter = null) {
		/** @type {Array<archivingAIManifestEntry>} */
		let manifest = [];
		for (const aiImageId of s.custom.aiImageIds) {
			await App.Art.GenAI.staticImageDB.getImage(aiImageId)
				.then(data => {
					let filename = `${s.ID}- ${s.slaveSurname} ${s.slaveName}/${aiImageId}${data.week ? "-week" + data.week : ""}.png`;
					if (callbackBefore) {
						callbackBefore(filename);
					}
					zip.file(filename, data.data.substring('data:image/png;base64,'.length), {base64: true});
					manifest.push({path: filename, week: data.week ? data.week : 'unknown'});
					if (callbackAfter) {
						callbackAfter();
					}
				})
				.catch(error => {
					console.log(error.message || error);
					document.getElementById("dialog-ai-archiving").textContent = error.message || error;
				});
		}
		return manifest;
	}

	/**
	 * Creates and downloads a .zip archive of all images
	 * generated for all characters in the current arcology.
	 *
	 * The archive contains the current savefile and a JSON manifest
	 * of the archived images for future reimport (see `Archiving.exportImages()`)
	 */
	static async downloadArcology() {
		Archiving.lastAIUserInterface = V.aiUserInterface;
		V.aiUserInterface = 0;
		/**
		 * Displays the current filename to be archived
		 * @param {string} filename
		 */
		function beforeAdding(filename) {
			document.getElementById("dialog-ai-archiving").textContent = `Exporting ${filename}`;
		}

		function afterAdding() {
			document.getElementById("dialog-ai-archiving-progress").value += 1;
		}

		let imagesCount = V.PC.custom.aiImageIds.length;
		/** @type {archivingAIManifest} */
		let manifest = {};
		for (const s of getSlaves().values()) {
			imagesCount += s.custom.aiImageIds.length;
			manifest[s.ID] = [];
		}
		Dialog.setup("Archiving all images");
		Dialog.append(`<p>${imagesCount} images to export.</p>`);
		Dialog.append(`<p id="dialog-ai-archiving"></p>`);
		Dialog.append(`<progress id="dialog-ai-archiving-progress" value="0" max="${imagesCount}" style="width: 100%"></progress>`);
		Dialog.open();

		let zip = new JSZip();
		manifest[-1] = await Archiving.#exportImages(V.PC, zip, beforeAdding, afterAdding);
		for (const s of getSlaves().values()) {
			manifest[s.ID] = await Archiving.#exportImages(s, zip, beforeAdding, afterAdding);
		}

		let fileName = App.Utils.getSaveFilename('free-cities', '');
		zip.file("manifest.json", JSON.stringify(manifest));
		zip.file(`${fileName}.save`, Save.base64.save());
		document.getElementById("dialog-ai-archiving").textContent = `Preparing file: "${fileName}.ai-img.zip"`;

		await Archiving.#downloadContainer(zip, `${fileName}.ai-img.zip`);
		Dialog.close();
		V.aiUserInterface = Archiving.lastAIUserInterface;
		App.UI.reload();
	}

	/**
	 * Creates and downloads a .zip archive of all images
	 * generated for the given character.
	 *
	 * The archive contains a JSON manifest of the archived
	 * images for future reimport (see `Archiving.exportImages()`)
	 *
	 * @param {FC.HumanState} s - The character whose images to fetch
	 */
	static async downloadCharacter(s) {
		Archiving.lastAIUserInterface = V.aiUserInterface;
		V.aiUserInterface = 0;
		let imagesCount = s.custom.aiImageIds.length;
		Dialog.setup("Archiving all images");
		Dialog.append(`<p>${imagesCount} images to export.</p>`);
		Dialog.append(`<p id="dialog-ai-archiving"></p>`);
		Dialog.append(`<progress id="dialog-ai-archiving-progress" value="0" max="${imagesCount}" style="width: 100%"></progress>`);
		Dialog.open();

		let zip = new JSZip();

		let manifest = {};
		if (s.ID === -111111) {
			s.ID = SID.PC;
		}
		manifest[s.ID] = await Archiving.#exportImages(s, zip);
		zip.file("manifest.json", JSON.stringify(manifest));

		await Archiving.#downloadContainer(zip, `${App.Utils.getSaveFilename('free-cities', 'ai-img.zip', s)}`);
		Dialog.close();
		V.aiUserInterface = Archiving.lastAIUserInterface;
		App.UI.reload();
	}

	/**
	 * Takes a zip container and downloads it as the filename given. No "Save As" dialog will be shown.
	 *
	 * @param {JSZip} zip - the zip container to use
	 * @param {string} filename
	 */
	static async #downloadContainer(zip, filename) {
		try {
			const content = await zip.generateAsync({type: "blob"});
			// (download technique taken verbatim from https://github.com/Touffy/client-zip)
			// make and click a temporary link to download the Blob
			const link = document.createElement("a");
			link.href = URL.createObjectURL(content);
			link.download = filename;
			link.click();
			link.remove();
		} catch (e) {
			console.log(e.message || e);
		}
	}

	/**
	 * Lets the user choose a local .zip file, extracts the manifest,
	 * then sends both manifest and .zip contents to a callback function.
	 *
	 * Throws an error if there's no manifest.json file found in the .zip,
	 * as this is a sign that the .zip is invalid (either corrupted or not
	 * an FC AI archive)
	 *
	 * @param {(zip: JSZip, manifest: archivingAIManifest) => Promise<any>} process - A callback function taking parameters zip (JSZip)
	 *                             and manifest (hash), and in which the actual
	 *                             processing of the data will take place.
	 */
	static async importContainer(process) {
		const input = document.createElement("input");
		input.id = "ai-import-archive-filepicker";
		input.type = "file";
		input.accept = ".zip";
		input.onchange = async () => {
			let file = input.files[0];
			if (file) {
				let contents = await blobToBase64(file);
				try {
					let zip = new JSZip();
					const z = await zip.loadAsync(contents, {base64: true});
					const manifestFile = z.file("manifest.json");
					if (manifestFile === null) {
						throw new Error("Unable to load manifest");
					}

					await process(zip, JSON.parse(await manifestFile.async("string")));

					if (document.getElementById("ai-import-archive-filepicker")) {
						document.getElementById("ai-import-archive-filepicker").remove();
					}
				} catch (e) {
					console.error(e);
				}
			}
		};
		input.click();
	}

	/**
	 * Imports an arcology's entire catalog of images.
	 *
	 * Calls importContainer with the expectation that all the characters in the chosen .zip
	 * are present in the current arcology.
	 */
	static async importArcology() {
		Archiving.lastAIUserInterface = V.aiUserInterface;
		V.aiUserInterface = 0;
		function updateProgress() {
			document.getElementById("dialog-ai-archiving-progress").value += 1;
		}
		Dialog.create("Importing an arcology");
		Dialog.append(`<p id="dialog-ai-archiving"></p>`);
		Dialog.append(`<progress id="dialog-ai-archiving-progress" value="0" max="0" style="width: 100%"></progress>`);
		const message = document.getElementById("dialog-ai-archiving");
		Dialog.open();
		message.textContent = `Opening the archive...`;
		await Archiving.importContainer(async (zip, manifest) => {
			document.getElementById("dialog-ai-archiving-progress").max = Object.values(manifest).reduce((a, c) => a + Object.keys(c).length, 0);
			let i = 1;
			for (const [k, v] of Object.entries(manifest)) {
				/** @type {archivingAIManifest} */
				let characterManifest = {};
				characterManifest[k] = v;
				let character = (Number(k) === -1 ? V.PC : getSlave(Number(k)));
				message.textContent = `Importing ${i}/${Object.keys(manifest).length}: ${character.slaveSurname} ${character.slaveName}`;
				await Archiving.#processCharacter(zip, character, characterManifest, updateProgress);
				i++;
			}
			Archiving.signatureCache = new Map();
			Dialog.close();
			V.aiUserInterface = Archiving.lastAIUserInterface;
			App.UI.reload();
		});
	}

	/**
	 *  Imports an archive of AI images for a character. The archive must
	 *  have been generated by downloadCharacter(), or carefully crafted to
	 *  mimic the results.
	 *
	 *  @param {FC.SlaveState} s - The character whose images will be replaced
	 *                             by the contents of the selected archive.
	 *  @param {Function} finalize - A callback function called after the processing.
	 *                               Used to refresh the art container for the character.
	 */
	static async importCharacter(s, finalize) {
		Archiving.lastAIUserInterface = V.aiUserInterface;
		V.aiUserInterface = 0;
		function updateProgress() {
			document.getElementById("dialog-ai-archiving-progress").value += 1;
		}
		Dialog.create("Importing a character");
		Dialog.append(`<p id="dialog-ai-archiving"></p>`);
		Dialog.append(`<progress id="dialog-ai-archiving-progress" value="0" max="0" style="width: 100%"></progress>`);
		const message = document.getElementById("dialog-ai-archiving");
		const progress = document.getElementById("dialog-ai-archiving-progress");
		Dialog.open();
		await Archiving.importContainer(async (zip, manifest) => {
			progress.max = Object.keys(manifest[s.ID]).length;
			message.textContent = `Import ${progress.max} images for ${s.slaveSurname} ${s.slaveName}`;
			await Archiving.#processCharacter(zip, s, manifest, updateProgress);
			finalize();
			Archiving.signatureCache = new Map();
			Dialog.close();
			V.aiUserInterface = Archiving.lastAIUserInterface;
			App.UI.reload();
		});
	}


	/**
	 * Reads all images stored in the given zip container and stores them in the given character,
	 * according to the given manifest.
	 *
	 * @param {JSZip} zip
	 * @param {FC.HumanState} s
	 * @param {archivingAIManifest} manifest See exportImages()
	 * @param {() => void} callback Callback after each image
	 * @returns {Promise<void>}
	 */
	static async #processCharacter(zip, s, manifest, callback) {
		try {
			if (Object.keys(manifest)[0] === "-1") {
				s = V.PC;
			} else if (!getSlaves().has(Number(Object.keys(manifest)[0]))) {
				throw new Error(`Character ID ${Object.keys(manifest)[0]} is not present in current game!`);
			} else if (s.ID !== Number(Object.keys(manifest)[0])) {
				throw new Error(`The loaded archive has not been made from the selected character!`);
			}

			/** @type {number[]} */
			// @ts-ignore
			const aiImageIds = await App.Art.GenAI.staticImageDB.getIndexesList();
			s.custom.aiImageIds = [];
			for (const img of manifest[s.ID]) {
				let f = zip.file(img.path);
				if (f) {
					let imageData = getImageData(await f.async("base64"));
					let imageId = await Archiving.compareSignatures(sha1(imageData), aiImageIds);
					if (imageId === -1) {
						imageId = await App.Art.GenAI.staticImageDB.putImage({data: imageData, week: img.week});
					}
					s.custom.aiImageIds.push(imageId);
				} else {
					console.log(`Path "${img.path}" is listed in the manifest but doesn't exist in the archive. The archive may be corrupted.`);
				}
				callback();
			}
			s.custom.aiDisplayImageIdx = s.custom.aiImageIds.length - 1;
		} catch (e) {
			console.error(e);
			alert(e);
		}
	}

	/**
	 * Compare a sha1 signature against the signatures of a list of imageIDs in indexedDB.
	 *
	 * It builds a cache of sha1 signatures to speed up comparisons, which is meant to be
	 * cleared by the main import function after finishes its job. This means the calculations
	 * will need to be redone for each character or arcology import, but this is not a frequent
	 * enough operation to justify keeping it in-memory.
	 *
	 * @param {string} signature
	 * @param {number[]} imageIDs
	 * @returns {Promise<number>} The ID of the existing image, or -1 if the image doesn't exist.
	 */
	static async compareSignatures(signature, imageIDs) {
		for (let imageID of imageIDs) {
			if (![...Archiving.signatureCache.values()].includes(imageID)) {
				Archiving.signatureCache.set(
					sha1((await App.Art.GenAI.staticImageDB.getImage(imageID)).data),
					imageID);
			}
			if (Archiving.signatureCache.has(signature)) {
				return Archiving.signatureCache.get(signature);
			}
		}
		return -1;
	}
};
