/**
 * Outfit designer for creating webgl custom outfits
 * @param {FC.SlaveState} slaveModel Model used to display edited outfits
 * @returns {HTMLElement}
 */
App.UI.outfitDesigner = function(slaveModel = null) {
	const container = document.createElement("span");
	const scene = JSON.parse(JSON.stringify(App.Art.defaultScene));
	const model = slaveModel ? structuredClone(slaveModel) : baseSlave();

	const outfitFlags = ["hideDick", "hideVagina", "hideHair", "hideNipples", "applyBulge", "applyPanty"];

	let currentClothing;
	let currentOutfit;
	let currentFigure;
	let showAllFigures = false;

	let figure;
	let outfits;
	let outfit;

	container.append(createPage());
	return container;

	/**
	 * Creates the outfit designer page
	 * @returns {DocumentFragment}
	 */
	function createPage() {
		const el = new DocumentFragment();

		model.clothes = currentClothing ? currentClothing : "naked";
		model.customOutfit = currentOutfit ? currentOutfit : "";

		figure = App.Art.getFigureById(scene, currentFigure);
		outfits = currentClothing in V.customOutfits
			? V.customOutfits[currentClothing]
			: null;
		if (outfits) {
			outfit = currentOutfit in V.customOutfits[currentClothing]
				? V.customOutfits[currentClothing][currentOutfit]
				: null;
		} else { outfit = null; }

		const topBox = document.createElement("div");
		topBox.className = "od-box";
		topBox.append(importExport());
		topBox.append(selectors());
		el.append(topBox);

		const outfitControlsBox = document.createElement("div");
		outfitControlsBox.className = "od-box";
		if (currentClothing) {
			outfitControlsBox.append(outfitControls());
			el.append(outfitControlsBox);
		}

		const main = document.createElement("div");
		main.className = "od-main";

		const editorEl = editor();

		const previewContainer = document.createElement("div");
		previewContainer.className = "od-preview-container";
		previewContainer.append(preview());

		main.append(editorEl, previewContainer);
		el.append(main);
		return el;
	}

	/**
	 * creates expor/import controls for the wardrobe
	 * @returns {HTMLElement}
	 */
	function importExport() {
		const wrap = document.createElement("div");
		wrap.className = "od-export-import";

		const top = document.createElement("div");
		const bottom = document.createElement("div");

		const importWrap = document.createElement("div");
		importWrap.hidden = true;

		const importArea = document.createElement("textarea");
		importArea.placeholder = "Paste your wardrobe here";

		const importConfirmBtn = document.createElement("button");
		importConfirmBtn.textContent = "Confirm";
		importConfirmBtn.addEventListener("click", () => {
			try {
				const importedOutfits = JSON.parse(importArea.value);
				if (typeof V.customOutfits !== "object" || V.customOutfits === null) {
					V.customOutfits = {};
				}
				Object.assign(V.customOutfits, importedOutfits);
				refresh();
			} catch (e) {
				console.error("Invalid import format", e);
			}
		});

		importWrap.append(importArea, importConfirmBtn);

		const importBtn = document.createElement("button");
		importBtn.textContent = "Import";
		importBtn.addEventListener("click", () => {
			importWrap.hidden = !importWrap.hidden;
		});

		const exportArea = document.createElement("textarea");
		exportArea.hidden = true;

		const exportBtn = document.createElement("button");
		exportBtn.textContent = "Export";
		exportBtn.addEventListener("click", () => {
			exportArea.value = JSON.stringify(V.customOutfits, null, 2);
			exportArea.hidden = !exportArea.hidden;
		});

		top.append(importBtn, exportBtn);
		bottom.append(importWrap, exportArea);

		App.UI.DOM.appendNewElement("span", wrap, "Import or export outfits");
		wrap.append(top, bottom);

		return wrap;
	}

	/**
	 * Creates selectors for clothing category and current outfit, plus outfit controls
	 * @returns {HTMLElement}
	 */
	function selectors() {
		const wrap = document.createElement("div");
		wrap.className = "od-selectors";

		const categoryContainer = document.createElement("div");
		App.UI.DOM.appendNewElement("span", categoryContainer, "Category:");
		categoryContainer.append(categorySelector());
		wrap.append(categoryContainer);

		if (currentClothing) {
			const outfitContainer = document.createElement("div");
			App.UI.DOM.appendNewElement("span", outfitContainer, "Outfit:");
			outfitContainer.append(outfitSelector());
			wrap.append(outfitContainer);
		}
		return wrap;

		/**
		 * Selector for clothing
		 * for outfit
		 * Controls for outfits
		 * @returns {HTMLElement}
		 */
		function categorySelector() {
			const catSel = document.createElement("select");
			catSel.className = "od-selector";

			let clothing = Object.keys(App.Data.SlaveSummary.long.clothes);
			clothing.forEach(c => {
				const opt = document.createElement("option");
				opt.value = c;
				opt.textContent = c;
				catSel.append(opt);
			});
			catSel.value = currentClothing;

			catSel.addEventListener("change", e => {
				// @ts-ignore
				currentClothing = e.target.value;
				currentOutfit = null;
				currentFigure = null;
				refresh();
			});
			return catSel;
		}

		/**
		 * Selector for outfit from the current category/clothing
		 * @returns {HTMLElement}
		 */
		function outfitSelector() {
			const outfitSel = document.createElement("select");
			outfitSel.className = "od-selector";
			if (outfits) {
				Object.keys(outfits).forEach(key => {
					const opt = document.createElement("option");
					opt.value = key;
					opt.textContent = key;
					outfitSel.append(opt);
				});
			}
			outfitSel.value = currentOutfit ? currentOutfit : "";

			outfitSel.addEventListener("change", e => {
				// @ts-ignore
				currentOutfit = e.target.value;
				currentFigure = null;
				refresh();
			});
			return outfitSel;
		}
	}

	/**
	 * Outfit controls, include
	 * New
	 * Rename, current
	 * Delete, current
	 * @returns {HTMLElement}
	 */
	function outfitControls() {
		const wrap = document.createElement("div");
		wrap.className = "od-outfit-controls";

		// top container for input + buttons
		const top = document.createElement("div");
		top.className = "od-controls-top";

		const inOutfit = document.createElement("input");
		inOutfit.type = "text";
		inOutfit.value = currentOutfit ? currentOutfit : "";

		const newBtn = document.createElement("button");
		newBtn.textContent = "New";
		newBtn.addEventListener("click", () => {
			if (!outfits) {
				outfits = {};
				V.customOutfits[currentClothing] = outfits;
			}
			if (!inOutfit.value ||inOutfit.value in outfits) { return; }
			currentOutfit = inOutfit.value;
			currentFigure = null;
			V.customOutfits[currentClothing][inOutfit.value] = {
				"figures": JSON.parse(JSON.stringify(App.Art.outfitFigures)),
				"materials": [],
				"flags": [],
			};
			refresh();
		});

		const renameBtn = document.createElement("button");
		renameBtn.textContent = "Rename";
		renameBtn.addEventListener("click", () => {
			if (!outfits || (inOutfit.value in outfits)) { return; }
			outfits[inOutfit.value] = outfits[currentOutfit];
			delete outfits[currentOutfit];
			currentOutfit = inOutfit.value;
			refresh();
		});

		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "Delete";
		deleteBtn.addEventListener("click", () => {
			if (!outfits) { return; }
			delete outfits[inOutfit.value];
			currentOutfit = null;
			currentFigure = null;
			refresh();
		});

		const exportWrap = document.createElement("div");
		const exportArea = document.createElement("textarea");
		exportArea.hidden = true;
		const exportBtn = document.createElement("button");
		exportBtn.textContent = "Export";
		exportBtn.addEventListener("click", () => {
			exportArea.value = JSON.stringify({[currentClothing]: {[currentOutfit]: outfit}}, null, 2);
			exportArea.hidden = !exportArea.hidden;
		});
		exportWrap.append(exportArea, exportBtn);

		top.append(inOutfit, newBtn);
		const bottom = document.createElement("div");
		if (outfit) {
			top.append(renameBtn, deleteBtn, exportWrap);
			bottom.append(flags());
		}

		wrap.append(top, bottom);
		return wrap;

		/**
		 * controls for outfit flags
		 * @returns {HTMLElement}
		 */
		function flags() {
			const wrap = document.createElement("div");
			wrap.className = "od-flags";

			outfitFlags.forEach(f => {
				const label = document.createElement("label");

				const cb = document.createElement("input");
				cb.type = "checkbox";
				cb.value = f;
				cb.checked = outfit.flags.includes(f);

				cb.addEventListener("change", () => {
					if (cb.checked) {
						if (!outfit.flags.includes(f)) { outfit.flags.push(f); }
					} else {
						outfit.flags = outfit.flags.filter(flag => flag !== f);
					}
					refresh();
				});

				label.append(cb, " ", f);
				wrap.append(label);
			});
			return wrap;
		}
	}

	/**
	 * Editor for the current outfit
	 * modifies figures and materials
	 * @returns {HTMLElement}
	 */
	function editor() {
		const wrap = document.createElement("div");
		wrap.className = "od-editor-grid od-box";

		let figures = [];
		let materials = [];

		if (outfit) {
			figures = outfit.figures;
			materials = outfit.materials;

			const lCol = document.createElement("div");
			lCol.className = "od-column od-box";

			lCol.append(figureControls());
			App.UI.DOM.appendNewElement("hr", lCol);
			lCol.append(figuresColumn());

			wrap.append(lCol);
			wrap.append(materialsColumn());
		}
		return wrap;

		/**
		 * List of all the figure within current outfit
		 * @returns {HTMLElement}
		 */
		function figuresColumn() {
			const figCol = document.createElement("div");
			figCol.className = "od-column";

			scene.models[0].figures.forEach(figure => {
				const figId = figure.figId;
				const figWrap = document.createElement("div");
				figWrap.className = "od-figure-wrap ";
				if (!(showAllFigures || figures.includes(figId))) {
					figWrap.style.display = "none";
				}

				const btn = document.createElement("button");
				btn.className = "od-figure-btn";
				btn.textContent = figId;

				const addRemoveBtn = document.createElement("button");

				if (figures.includes(figId)) {
					addRemoveBtn.textContent = "-";
					addRemoveBtn.className = "od-remove-btn";
					if (figId === currentFigure) {
						btn.className = "od-figure-btn od-figure-active";
					}
					btn.addEventListener("click", () => {
						currentFigure = figId;
						refresh();
					});
					addRemoveBtn.addEventListener("click", () => {
						if (!currentOutfit || !outfits || !(currentOutfit in outfits)) { return; }
						const idx = outfit.figures.indexOf(figId);
						if (idx !== -1) {
							outfit.figures.splice(idx, 1);
							if (currentFigure === figId) {
								currentFigure = null;
							}

							figure = App.Art.getFigureById(scene, figId);
							figure.surfaces.forEach(surface => {
								const matId = surface.matIds[0];
								if (matId) {
									const idx = materials.findIndex(m => m[0] === matId);
									materials.splice(idx, 1);
								}
							});

							refresh();
						}
					});
				} else {
					addRemoveBtn.textContent = "+";
					addRemoveBtn.className = "od-add-btn";
					addRemoveBtn.addEventListener("click", () => {
						outfit.figures.push(figId);
						currentFigure = figId;
						refresh();
					});
				}

				figWrap.append(btn);
				figWrap.append(addRemoveBtn);

				figCol.append(figWrap);
			});

			return figCol;
		}

		/**
		 * List of all the materials associated with current figure
		 * @returns {HTMLElement}
		 */
		function materialsColumn() {
			const materialsCol = document.createElement("div");
			materialsCol.className = "od-column od-box";

			if (!figure) { return materialsCol; }

			figure.surfaces.forEach(surface => {
				const matId = surface.matIds[0];
				if (matId) {
					materialsCol.append(materialRow(matId));
				}
			});

			return materialsCol;

			/**
			 * Generates a row for a single material
			 * Sets a color and tint strength
			 * @param {string} matId
			 * @returns {HTMLElement}
			 */
			function materialRow(matId) {
				const ogMaterial = App.Art.getMaterialById(scene, matId);

				let matColor = ogMaterial.Ka;
				let tintStrength = 0.0;
				const idx = materials.findIndex(m => m[0] === matId);
				if (idx !== -1) {
					let material = materials[idx];
					matColor = material[1];
					tintStrength = material[2];
					if (material.length > 3) { tintStrength = material[2]; }
				}

				const matContainer = document.createElement("div");
				matContainer.className = "od-material-container";
				App.UI.DOM.appendNewElement("span", matContainer, matId);

				const rowContainer = document.createElement("div");
				rowContainer.className = "od-material-row";

				const colorChoice = App.UI.DOM.colorInput(App.Art.rgbToHex(matColor), v => {
					const idx = materials.findIndex(m => m[0] === matId);
					if (idx !== -1) {
						materials[idx][1] = App.Art.hexToRgb(v);
					} else {
						materials.push([matId, App.Art.hexToRgb(v), tintStrength]);
					}
					refresh();
				});
				rowContainer.append(colorChoice);

				const strengthInput = document.createElement("input");
				strengthInput.type = "range";
				strengthInput.min = "0";
				strengthInput.max = "1";
				strengthInput.step = "0.01";

				strengthInput.value = tintStrength.toString();
				strengthInput.addEventListener("input", e => {
					// @ts-ignore
					const value = parseFloat(e.target.value);
					const idx = materials.findIndex(m => m[0] === matId);
					if (idx !== -1) {
						materials[idx][2] = value;
					} else {
						materials.push([matId, matColor, value]);
					}
					refresh();
				});
				rowContainer.append(strengthInput);

				if (idx !== -1) {
					const clearButton = document.createElement("button");
					clearButton.textContent = "Clear";
					clearButton.addEventListener("click", () => {
						materials.splice(idx, 1);
						refresh();
					});
					rowContainer.append(clearButton);
				}

				matContainer.append(rowContainer);
				return matContainer;
			}
		}

		/**
		 * Controls for adding and removing figures from an outfit
		 * @returns {HTMLElement}
		 */
		function figureControls() {
			const figWrap = document.createElement("div");

			const showBtn = document.createElement("button");
			showBtn.textContent = "ShowAll";
			showBtn.addEventListener("click", () => {
				showAllFigures = !showAllFigures;
				refresh();
			});

			figWrap.append(showBtn);

			return figWrap;
		}
	}

	/**
	 * Render webgl preview
	 * @returns {DocumentFragment}
	 */
	function preview() {
		const f = new DocumentFragment();
		const e = App.Events.drawEventArt(f, model);
		// @ts-ignore
		e.firstElementChild.style.marginBottom = "1em";
		// @ts-ignore
		e.firstElementChild.style.marginTop = "0em";
		return f;
	}

	function refresh() {
		jQuery(container).empty().append(createPage());
	}
};
