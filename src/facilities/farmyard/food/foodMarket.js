App.UI.foodMarket = {};

App.UI.foodMarket.quantities = new Set([1, 10, 100, 1000, 10000, 100000]);

App.UI.foodMarket.buyLinks = () => {
	const div = App.UI.DOM.makeElement("div", null, ['indent']);
	const links = [];
	const maxFood = App.Facilities.Farmyard.foodMaxBuyable();

	if (maxFood === 0) {
		div.append(`You have no storage space left for food.`);
		return div;
	}

	div.append(`Buy `);

	for (const q of App.UI.foodMarket.quantities) {
		if (App.Facilities.Farmyard.foodStorageAvailable() >= q) {
			links.push(App.UI.DOM.link(
				massFormat(q),
				() => {
					App.Facilities.Farmyard.foodBuy(q);
					App.UI.reload();
				},
				undefined,
				undefined,
				cashFormat(Math.trunc(App.Facilities.Farmyard.foodBuyCost(q))),
			));
		}
	}
	if (!App.UI.foodMarket.quantities.has(maxFood)) {
		links.push(App.UI.DOM.link(
			massFormat(maxFood),
			() => {
				App.Facilities.Farmyard.foodBuy(maxFood);
				App.UI.reload();
			},
			undefined,
			undefined,
			cashFormat(Math.trunc(App.Facilities.Farmyard.foodBuyCost(maxFood))),
		));
	}

	div.append(App.UI.DOM.generateLinksStrip(links));
	div.append(` of food.`);

	return div;
};

App.UI.foodMarket.sellLinks = () => {
	const div = App.UI.DOM.makeElement("div", null, ['indent']);
	const links = [];

	if (App.Facilities.Farmyard.foodAvailable() === 0) {
		div.append(`You have no food left to sell.`);
		return div;
	}

	div.append(`Sell `);

	if (App.Facilities.Farmyard.foodAvailable() > 0) {
		for (const q of App.UI.foodMarket.quantities) {
			if (App.Facilities.Farmyard.foodAvailable() >= q) {
				links.push(App.UI.DOM.link(
					massFormat(q),
					() => {
						App.Facilities.Farmyard.foodSell(q);
						App.UI.reload();
					},
					undefined,
					undefined,
					cashFormat(Math.trunc(App.Facilities.Farmyard.foodSellValue(q))),
				));
			}
		}
		if (!App.UI.foodMarket.quantities.has(App.Facilities.Farmyard.foodAvailable())) {
			links.push(App.UI.DOM.link(
				massFormat(App.Facilities.Farmyard.foodAvailable()),
				() => {
					App.Facilities.Farmyard.foodSell(App.Facilities.Farmyard.foodAvailable());
					App.UI.reload();
				},
				undefined,
				undefined,
				cashFormat(Math.trunc(App.Facilities.Farmyard.foodSellValue(App.Facilities.Farmyard.foodAvailable()))),
			));
		}
	}

	div.append(App.UI.DOM.generateLinksStrip(links));
	div.append(` of food.`);

	return div;
};


App.UI.foodMarket.foodStorageDescription = () => {
	const div = document.createElement("div");
	const text = new SpacedTextAccumulator(div);

	const consumption = App.Facilities.Farmyard.foodConsumption();
	const foodAvailable = App.Facilities.Farmyard.foodAvailable();
	const foodValue = App.Facilities.Farmyard.foodSellValue(foodAvailable);
	const citizens = V.lowerClass + V.middleClass + V.upperClass + V.topClass;

	text.push(`You have <span class="food">${massFormat(foodAvailable)}</span> of food stored in your storehouses, valued at a total of ${cashFormat(foodValue)}.`);

	if (V.mods.food.enabled && V.eventResults.foodCrisis) {
		if (foodAvailable > consumption) {
			text.push(`This is enough to provide for ${numberWithPluralOne(slaveCount(), `slave`)} and ${numberWithPluralOne(citizens, `citizen`)} for about ${years(Math.trunc(foodAvailable / consumption))}.`);
		} else if (foodAvailable < consumption) {
			text.push(`You will need an additional ${massFormat(consumption - foodAvailable)} to provide for ${numberWithPluralOne(slaveCount(), `slave`)} and ${numberWithPluralOne(citizens, `citizen`)} during the upcoming week.`);
		}
	}

	text.toChildren();

	return div;
};

App.UI.foodMarket.foodStorageUpgrades = () => {
	const div = document.createElement("div");
	const text = new SpacedTextAccumulator(div);
	text.push(`You have storage for ${massFormat(V.farmyardUpgrades.foodStorage * 1000)} of food. Any food produced that you don't have storage for will be sold immediately.`);
	text.toParagraph();
	text.push(`Buy an extra`);
	const costPerTon = Math.trunc((100 + (V.farmyardUpgrades.foodStorage / 10)));
	const links = [];

	for (const q of [1, 10, 100, 1000]) {
		if ((costPerTon * q) < V.cash) {
			links.push(App.UI.DOM.link(
				massFormat(q * 1000),
				() => {
					cashX(forceNeg(costPerTon * q), "farmyard");
					V.farmyardUpgrades.foodStorage += q;
					App.UI.reload();
				},
				undefined,
				undefined,
				cashFormat(costPerTon * q),
			));
		}
	}

	text.push(App.UI.DOM.generateLinksStrip(links));

	text.push(`of food storage.`);

	text.toChildren();
	return div;
};

App.UI.foodMarket.main = () => {
	const frag = new DocumentFragment();

	if (V.useTabs === 0) {
		frag.append(App.UI.DOM.makeElement("h2", "The Food Market"));
	}

	frag.append(
		App.UI.foodMarket.foodStorageDescription(),
		App.UI.foodMarket.foodStorageUpgrades(),
		App.UI.foodMarket.buyLinks(),
		App.UI.foodMarket.sellLinks(),
		remove(),
	);

	return frag;

	function remove() {
		const div = document.createElement("div");

		div.append(
			`You can remove the food market entirely and let your citizens fend for themselves, if you wish.`,
			App.UI.DOM.makeElement("div", App.UI.DOM.link(`Dismantle`, () => {
				V.mods.food.market = false;
				repX(forceNeg(8500), "food");
				App.UI.reload();
			}, [], '', `Your citizens WILL hate you for this.`), ['indent']),
		);

		return div;
	}
};
