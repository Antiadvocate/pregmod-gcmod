App.Intro.CustomSlaveTrade = function() {
	let baseControlsFilter = "all";
	/**
	 * @typedef  {"c1"|"c2"|"c3"|"percent"|"10th percent"} adjustModeValue
	 */
	/** @type {adjustModeValue} */
	let adjustMode = "c2";

	const dynamicModeSettings = {
		travelFrictionExponent: App.Data.World.TravelFrictionExponent,
		popScaleFactor: App.Data.World.PopScaleFactor,
		debugView: 0,
	};

	const outerContainer = new DocumentFragment();
	App.UI.DOM.appendNewElement("p", outerContainer, `When civilization turned upon itself, some countries readily took to enslaving their own. Others were raided by their neighbors for their desirable, and profitable, citizens. Which nationalities were most affected by the booming slave trade, and thus, likely to appear in your local slave markets?`);

	let dynamicDiv = document.createElement("div");
	dynamicDiv.append(dynamicContent());
	outerContainer.append(dynamicDiv);

	return outerContainer;

	function dynamicContent() {
		const f = new DocumentFragment();

		if (hashSum(V.nationalities) < 1) {
			App.UI.DOM.appendNewElement("p", f, `You cannot be a slaveowner without a slave trade. Please add nationalities to continue.`, ["note"]);
		} else {
			App.UI.DOM.appendNewElement("p", f, App.UI.DOM.passageLink(
				"Confirm customization",
				// @ts-ignore
				V.customWA ? "Extreme Intro" : "Intro Summary",
				// @ts-ignore
				() => delete V.customWA
			));
		}

		f.append(App.UI.nationalitiesDisplay());

		const tabBar = new App.UI.Tabs.TabBar("customST");
		tabBar.addTab("Adjust slave populations", "custom", customControls());
		tabBar.addTab("Presets", "presets", presetControls());
		tabBar.addTab("Dynamic World", "dynamic", worldMap());
		tabBar.addTab("Import/Export", "import-export", importExport());
		f.append(tabBar.render());

		return f;
	}

	function customControls() {
		const f = new DocumentFragment();
		f.append(filters());
		f.append(adjustSelector());
		f.append(resetOptions());
		f.append(App.UI.sectionBreak());
		f.append(popControls());
		return f;
	}

	/**
	 * @returns {DocumentFragment}
	 */
	function filters() {
		const frag = new DocumentFragment();

		/* Filter controls */
		const raceDiv = document.createElement("div");
		raceDiv.append("Filter by Race: ");
		const raceLinks = [];
		for (const [race, capRace] of App.Data.misc.filterRaces) {
			if (baseControlsFilter === race) {
				raceLinks.push(App.UI.DOM.disabledLink(capRace, ["Currently selected race"]));
			} else {
				raceLinks.push(App.UI.DOM.link(capRace,
					() => {
						baseControlsFilter = race;
						refresh();
					}
				));
			}
		}
		raceDiv.append(App.UI.DOM.generateLinksStrip(raceLinks));
		frag.append(raceDiv);

		const regionDiv = document.createElement("div");
		regionDiv.append("Filter by Region: ");
		const regionLinks = [];
		for (const region of App.Data.misc.filterRegions) {
			if (baseControlsFilter === uncapFirstChar(region).replace(/[ -]/g, '')) {
				regionLinks.push(App.UI.DOM.disabledLink(region, ["Currently selected region"]));
			} else {
				regionLinks.push(App.UI.DOM.link(region,
					() => {
						baseControlsFilter = uncapFirstChar(region).replace(/[ -]/g, '');
						refresh();
					}
				));
			}
		}
		regionDiv.append(App.UI.DOM.generateLinksStrip(regionLinks));
		frag.append(regionDiv);
		return frag;
	}

	/**
	 * @returns {HTMLDivElement}
	 */
	function adjustSelector() {
		const div = document.createElement("div");
		div.append("Adjustment amount: ");
		/**
		 * @type {Array<[string, adjustModeValue]>}
		 */
		const options = [["Constant Small", "c1"], ["Constant Medium", "c2"], ["Constant Large", "c3"], ["Single Percent", "percent"], ["A 10th percent", "10th percent"]];
		const links = [];
		for (const o of options) {
			if (adjustMode === o[1]) {
				links.push(App.UI.DOM.disabledLink(o[0], ["Mode selected"]));
			} else {
				links.push(App.UI.DOM.link(o[0], () => {
					adjustMode = o[1];
					refresh();
				}));
			}
		}
		div.append(App.UI.DOM.generateLinksStrip(links));
		return div;
	}

	/**
	 * @returns {HTMLDivElement}
	 */
	function resetOptions() {
		const div = document.createElement("div");
		div.append(
			App.UI.DOM.link(
				"Reset filters",
				() => {
					baseControlsFilter = "all";
					refresh();
				}
			)
		);
		div.append(" | ");
		div.append(
			App.UI.DOM.link(
				"Clear all nationalities",
				() => {
					V.nationalities = {};
					refresh();
				}
			)
		);
		return div;
	}

	/**
	 * Fine control tweaking of populations
	 * @returns {DocumentFragment}
	 */
	function popControls() {
		const frag = new DocumentFragment();
		const nationalitiesCheck = App.UI.nationalitiesCheck();

		const grid = document.createElement("p");
		grid.classList.add("customize-slave-trade-grid");

		let nationalities = App.Data.misc.baseNationalities;
		if (baseControlsFilter !== "all") {
			const controlsNationality = App.Data.misc.nationalitiesByRace[baseControlsFilter] || App.Data.misc[baseControlsFilter + 'Nationalities'];
			nationalities = Object.keys(controlsNationality);
		}
		for (const nation of nationalities) {
			const div = document.createElement("div");
			div.append(nation);

			const span = document.createElement("span");
			span.classList.add("controls-container");

			const plusButton = App.UI.DOM.appendNewElement("button", span, "+", ["plus-button"]);
			plusButton.onclick = () => {
				addNationality(nation, adjustmentStep(nation, true));
				refresh();
			};

			if (nationalitiesCheck[nation]) {
				const minusButton = App.UI.DOM.appendNewElement("button", span, "-", ["minus-button"]);
				minusButton.onclick = () => {
					addNationality(nation, adjustmentStep(nation, false));
					refresh();
				};
			}

			if (V.nationalities[nation] > 1) {
				const zeroButton = App.UI.DOM.appendNewElement("button", span, "0", ["zero-button"]);
				zeroButton.onclick = () => {
					delete V.nationalities[nation];
					refresh();
				};
			}

			div.append(span);
			grid.append(div);
		}
		frag.append(grid);

		if (baseControlsFilter === "all") {
			frag.append(ethnicityControls());
		}

		return frag;
	}

	function ethnicityControls() {
		const frag = new DocumentFragment();
		App.UI.DOM.appendNewElement("p", frag, `By dominant race/ethnicity (hover over the name to see the nationalities affected):`);
		const grid = document.createElement("p");
		grid.classList.add("customize-slave-trade-grid");
		for (const race of App.Data.misc.filterRaces.keys()) {
			const racialNationalities = App.Data.misc.baseNationalities.filter(function(n) {
				let races = App.Data.misc.raceSelector[n] || App.Data.misc.raceSelector[''];
				return races[race] * 3.5 > hashSum(races);
			});

			if (racialNationalities.length > 0) {
				const div = document.createElement("div");
				div.append(App.UI.DOM.spanWithTooltip(race, racialNationalities.length > 0 ? racialNationalities.join(", ") : "(none)"));

				const span = document.createElement("span");
				span.classList.add("controls-container");

				const plusButton = App.UI.DOM.appendNewElement("button", span, "+", ["plus-button"]);
				plusButton.onclick = () => {
					racialNationalities.forEach(nation => {
						addNationality(nation, adjustmentStep(nation, true));
					});
					refresh();
				};

				const minusButton = App.UI.DOM.appendNewElement("button", span, "0", ["zero-button"]);
				minusButton.onclick = () => {
					racialNationalities.forEach(n => delete V.nationalities[n]);
					refresh();
				};

				div.append(span);
				grid.append(div);
			}
		}
		frag.append(grid);
		return frag;
	}

	/**
	 * How much a single +/- action should affect
	 * @param {string} nation
	 * @param {boolean} up
	 * @returns {number}
	 */
	function adjustmentStep(nation, up) {
		if (adjustMode === "c1") {
			return up ? 1 : -1;
		} else if (adjustMode === "c2") {
			return up ? 100 : -100;
		} else if (adjustMode === "c3") {
			return up ? 1000 : -1000;
		}

		const total = hashSum(V.nationalities);
		if (total === 0) {
			return 1;
		}

		const nationValue = V.nationalities[nation] ? V.nationalities[nation] : 0;

		if (nationValue === 0) {
			if (adjustMode === "percent") {
				return total / 99;
			} else if (adjustMode === "10th percent") {
				return total / 999;
			}
		}

		let fractionChange = 0;
		if (adjustMode === "percent") {
			fractionChange = 0.01;
		} else if (adjustMode === "10th percent") {
			fractionChange = 0.001;
		}

		const nonNationTotal = (total - nationValue);
		const nationFraction = nationValue / total;
		const nonNationFraction = nonNationTotal / total;

		if (!up) {
			// When going down we want to change by the same ratio, but in the opposite direction
			fractionChange *= -1;
		}

		// Arrive at this function from:
		// Target ratio = Value ratio with adjusted nationValue
		// <=>
		// (nationFraction + fractionChange) / (nonNationFraction - fractionChange) = (nationValue + change) / nonNationTotal
		// // Edit both fractions, because we want a behavior like this: 50% / 50% -> 51% / 49%
		// <=>
		// change = ... (See below)
		return nonNationTotal * ((nationFraction + fractionChange) / (nonNationFraction - fractionChange)) - nationValue;
	}


	function presetControls() {
		const f = new DocumentFragment();
		f.append(`Vanilla presets: `, generatePresetLinks(App.Data.NationalityPresets.Vanilla));
		f.append(`Mod presets: `, generatePresetLinks(App.Data.NationalityPresets.Mod));
		return f;
	}

	/**
	 * @param {Map<string, Record<string,number>>} presets
	 * @returns {HTMLDivElement}
	 */
	function generatePresetLinks(presets) {
		const grid = document.createElement("div");
		grid.classList.add("customize-slave-trade-grid", "presets");
		for (const [name, nationalities] of presets) {
			const div = document.createElement("div");
			div.append(name);

			const span = document.createElement("span");
			span.classList.add("controls-container");

			const setButton = App.UI.DOM.appendNewElement("button", span, "Set", ["set-button"]);
			setButton.onclick = () => {
				V.nationalities = clone(nationalities);
				refresh();
			};

			const plusButton = App.UI.DOM.appendNewElement("button", span, "+", ["plus-button"]);
			plusButton.onclick = () => {
				for (const nat in nationalities) {
					addNationality(nat, nationalities[nat]);
				}
				refresh();
			};

			div.append(span);
			grid.append(div);
		}
		return grid;
	}

	/**
	 * @param {string} nation
	 * @param {number} amount
	 */
	function addNationality(nation, amount) {
		if (V.nationalities.hasOwnProperty(nation)) {
			V.nationalities[nation] += amount;
			if (V.nationalities[nation] <= 0) {
				delete V.nationalities[nation];
			}
		} else if (amount > 0) {
			V.nationalities[nation] = amount;
		}
	}

	/**
	 * @returns {DocumentFragment}
	 */
	function worldMap() {
		const f = new DocumentFragment();
		App.UI.DOM.appendNewElement("p", f, `Slave trade is global, yet local trade is dominated by local availability. Where is your arcology located?`);
		App.UI.DOM.appendNewElement("p", f, "Click anywhere on the map to create a new slave trade distribution.", ["note"]);
		addMapSelector(f);

		let options = new App.UI.OptionsGroup();
		options.customRefresh(refresh);

		options.addSlider("Travel Friction Exponent", -2, 1, "travelFrictionExponent", dynamicModeSettings)
			.setStep(0.01)
			.addEndLabels("Global", "Local").addTextBox();
		options.addSlider("Population Scale Factor", 1, 50, "popScaleFactor", dynamicModeSettings)
			.setStep(0.1)
			.addEndLabels("Homogenous", "Diverse").addTextBox();

		/** @type {Array<[string,number,number]>} */
		const presets = [["Default (Balanced)", App.Data.World.TravelFrictionExponent, App.Data.World.PopScaleFactor],
			["Greenland (Local)", 0.55, 10],
			["Hyper Global Realistic", -2, 50], ["Hyper Global Equal", -2, 1]];

		const o = options.addCustomOption("Presets");
		for (const p of presets) {
			o.addButton(p[0], () => {
				dynamicModeSettings.travelFrictionExponent = p[1];
				dynamicModeSettings.popScaleFactor = p[2];
				refresh();
			});
		}

		options.addOption("Debug View", "debugView", dynamicModeSettings)
			.addValue("Off", 0).off()
			.addValue("A", 1).on()
			.addValue("B", 2).on();

		f.append(options.render());
		return f;
	}

	/**
	 * @param {DocumentFragment} container
	 */
	function addMapSelector(container) {
		// SVG size
		const width = 5760;
		const height = 2880;

		// TODO: it may make sense to create a new toplevel svg instead of cloning the entire svg
		const svg = App.Data.Art.OtherSVG.get("world").cloneNode(true);
		d3.select(svg)
			.style("width", null)
			.style("height", null)
			.style("width", "100%")
			.style("height", "100%")
			.on("click", listen);

		if (dynamicModeSettings.debugView > 0) {
			const g = d3.select(svg)
				.append("g")
				.attr("transform", `scale(${width / 360}, -${height / 180}) translate(180, -90)`);

			for (const p of App.Data.World.gridPoints()) {
				const pop = App.Data.World.populationAt(p);

				if (dynamicModeSettings.debugView === 1) {
					if (pop > 0) {
						const [lat, lon] = App.Data.World.gridPointToCoordinate(p);
						const r = 10 * Math.log(pop / 10) / 100;
						const nation = App.Data.World.nationIdAt(p);
						let color = nation / 230 * (255 * 255 * 255);
						g.append("circle").attr("cx", lon).attr("cy", lat).attr("r", r)
							.attr("fill", "#" + Math.round(color).toString(16))
							.attr("opacity", "0.5");
					}
				} else if (dynamicModeSettings.debugView === 2) {
					if (p[0] === -1) {
						const [lat, lon] = App.Data.World.gridPointToCoordinate(p);
						g.append("circle").attr("cx", lon).attr("cy", lat).attr("r", 0.5).attr("fill", "red");
					}
				}
			}
		}

		container.append(svg);

		function listen(ev) {
			let [x, y] = d3.pointer(ev);
			let lon = (x / width) * 360 - 180;
			let lat = ((y / height) * 180 - 90) * -1;
			console.log(lon, lat);
			const popScaleCache = createPopScaleCache();
			populateFromCoordinates(lat, lon, popScaleCache);
			normalizePopulation();
			refresh();
		}
	}

	/**
	 * Create scaling factors for each nationality based on total population
	 * @returns {{[key:string]:number}}
	 */
	function createPopScaleCache() {
		/** @type {{[key:string]:number}} */
		const cache = {};

		// Build pop cache
		for (const p of App.Data.World.gridPoints()) {
			const nation = App.Data.World.nationAt(p);
			const pop = App.Data.World.populationAt(p);
			if (cache.hasOwnProperty(nation)) {
				cache[nation] += pop;
			} else {
				cache[nation] = pop;
			}
		}

		// Build pop scale cache
		for (const p in cache) {
			const pop = cache[p];
			const a = Math.exp(dynamicModeSettings.popScaleFactor);
			const scaled = a * Math.log1p(pop / a);
			cache[p] = scaled / pop;
		}

		return cache;
	}

	/**
	 * Normalize population numbers and round them.
	 */
	function normalizePopulation() {
		// Find max
		let max = 0;
		for (const n in V.nationalities) {
			if (V.nationalities[n] > max) {
				max = V.nationalities[n];
			}
		}
		// Scale everything relative to max
		// relMax controls at which point small populations are cut off. The larger, the smaller allowed populations
		// will be. This does not change their relative likelihood.
		const relMax = 1000.0;
		const scale = relMax / max;
		for (const n in V.nationalities) {
			const val = Math.round(V.nationalities[n] * scale);
			if (val > 0) {
				V.nationalities[n] = val;
			} else {
				delete V.nationalities[n];
			}
		}
	}

	/**
	 * The distribution of population within the grid square must be uniform, but the data is essentially concentrated at the center point
	 * When the user clicks within a populated grid square, provide an alternative "distance" for that grid square's population
	 * Basically this stabilizes the weight of the grid you clicked inside, so clicking at the center or the edge of the cell doesn't affect it
	 * @param {number} lat Latitude of grid cell center
	 * @param {number} lon Longitude of grid cell center
	 */
	function altDist(lat, lon) {
		const lonCell = 360 / App.Data.World.GridDimensions.width;
		const latCell = 180 / App.Data.World.GridDimensions.height;

		// take one third of the corner-to-corner measurement of the grid cell as our alternate distance.
		// ideally we want the average distance between coordinates within the grid cell and the grid cell's center, but that's hard to calculate, and it's about the same.
		// the actual value for a square is around 0.3826, and for an equilateral triangle is 0.289. grid cells are almost square near the equator and almost triangular near the poles.
		return distanceInKmBetweenEarthCoordinates(lat - 0.5 * latCell, lon - 0.5 * lonCell, lat + 0.5 * latCell, lon + 0.5 * lonCell) / 3;
	}

	/**
	 * @param {number} lat
	 * @param {number} lon
	 * @param {{[key:string]:number}} popScaleData
	 */
	function populateFromCoordinates(lat, lon, popScaleData) {
		V.nationalities = {};
		const thisGP = App.Data.World.coordinateToGridPoint(lat, lon);
		for (const p of App.Data.World.gridPoints()) {
			const pop1 = 1; // or App.Data.World.populationAt(thisGP);
			const pop2 = App.Data.World.populationAt(p);
			if (pop2 > 0) {
				const coords = App.Data.World.gridPointToCoordinate(p);
				// is this the grid square we clicked inside of? use alternate distance if so
				const clickedGrid = (p[0] === thisGP[0] && p[1] === thisGP[1]);
				const dist = clickedGrid ? altDist(coords[0], coords[1]) : distanceInKmBetweenEarthCoordinates(lat, lon, coords[0], coords[1]);
				let gravity = (pop1 * pop2) / (dist * dist * frictionForDistance(dist));
				if (gravity < 1 && clickedGrid) {
					gravity = 1; // always give _some_ population for the grid cell you clicked on, if it's inhabited
				}
				const nation = App.Data.World.nationAt(p);
				// console.log(nation, gravity, Math.round(gravity));
				addNationality(nation, popScaleData[nation] * gravity);
			}
		}
	}

	/**
	 * Compute travel friction factor for a given distance. More friction means less influence for distant grid points
	 * Ideally we'd also do some pathing between the grid points (traveling over an unpopulated ocean/desert should be more expensive), but skip that for now
	 * @param {number} distance In km
	 * @returns {number} greater 0
	 */
	function frictionForDistance(distance) {
		// theoretically there should be a constant factor here too but it gets cancelled out during normalization, so we ignore it
		const e = dynamicModeSettings.travelFrictionExponent; // 0 is no scaling
		return Math.pow(distance, e);
	}

	// https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
	/**
	 * @param {number} lat1
	 * @param {number} lon1
	 * @param {number} lat2
	 * @param {number} lon2
	 */
	function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
		const earthRadiusKm = 6371;

		const dLat = degreesToRadians(lat2 - lat1);
		const dLon = degreesToRadians(lon2 - lon1);

		lat1 = degreesToRadians(lat1);
		lat2 = degreesToRadians(lat2);

		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return earthRadiusKm * c;
	}

	/**
	 * @param {number} degrees
	 */
	function degreesToRadians(degrees) {
		return degrees * Math.PI / 180;
	}


	function importExport() {
		const f = new DocumentFragment();
		const span = document.createElement("p");
		const importExportContainer = document.createElement("div");
		App.UI.DOM.appendNewElement(
			"span",
			span,
			App.UI.DOM.link(
				"Export Settings",
				() => {
					settingsExport(importExportContainer);
				}
			)
		);
		span.append(" | ");
		App.UI.DOM.appendNewElement(
			"span",
			span,
			App.UI.DOM.link(
				"Import Settings",
				() => {
					settingsImport(importExportContainer);
				}
			)
		);
		f.append(span);

		f.append(importExportContainer);
		return f;
	}

	/**
	 * @param {HTMLDivElement} container
	 */
	function settingsExport(container) {
		let textArea = document.createElement("textarea");
		textArea.value = Serial.stringify(V.nationalities);
		$(container).empty().append(textArea);
	}

	/**
	 * @param {HTMLDivElement} container
	 */
	function settingsImport(container) {
		let textArea = document.createElement("textarea");
		let button = document.createElement("button");
		button.append("Load");
		button.onclick = () => {
			try {
				V.nationalities = Serial.parse(textArea.value);
			} catch (SyntaxError) {
				Dialog.create("Invalid Input");
				Dialog.append("The input is not a valid nationalities object.");
				Dialog.open();
				return;
			}
			refresh();
		};

		$(container).empty().append(textArea, button);
	}

	function refresh() {
		return $(dynamicDiv).empty().append(dynamicContent());
	}
};

/**
 * @returns {HTMLElement}
 */
App.UI.nationalitiesDisplay = function() {
	const p = document.createElement("p");

	/* Generates cloned array of V.nationalities, removing duplicates and then sorting */
	const nationalitiesCheck = App.UI.nationalitiesCheck();
	const nationalities = [];
	for (const nat in nationalitiesCheck) {
		nationalities.push(nat);
	}
	nationalities.sort((a, b) => nationalitiesCheck[b] - nationalitiesCheck[a]);

	/* Prints distribution of V.nationalities, using nationalitiesCheck to render array */
	let percentPerPoint = 100.0 / hashSum(V.nationalities);
	let len = Object.keys(nationalitiesCheck).length;
	let j = 0;
	for (const nation of nationalities) {
		const span = document.createElement("span");
		span.append(`${nation} `);
		let percent = (V.nationalities[nation] * percentPerPoint).toFixed(2);
		if (percent === "0.00") {
			percent = "<0.01";
		}
		App.UI.DOM.appendNewElement("span", span, percent + "%", ["orange"]);
		j++;
		if (j < len) {
			span.append(` | `);
		}
		p.append(span);
	}
	return p;
};

/**
 * @returns {object}
 */
App.UI.nationalitiesCheck = function() {
	return Object.assign(
		{
			// Player can add custom nations here.
		},
		V.nationalities);
};
