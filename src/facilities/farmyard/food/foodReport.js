App.UI.foodReport = function() {
	const text = [];

	text.push(
		production(),
		consumption(),
	);

	return text.join(' ');

	function production() {
		const text = [];
		const production = App.Facilities.Farmyard.foodProduction();
		const farmhands = App.Entity.facilities.farmyard.hostedSlaves();
		const slaveAmount = App.Entity.facilities.farmyard.employees()
			.reduce((acc, cur) => acc + App.Facilities.Farmyard.foodAmount(cur), 0);
		const menialAmount = V.farmMenials * App.Facilities.Farmyard.foodAmount();

		text.push(`${V.arcologies[0].name} produced ${massFormat(production)} of food this week.`);

		if (V.mods.food.overstocked > 0) {
			text.push(text.pop().replace(".", ","));
			text.push(`of which ${massFormat(V.mods.food.overstocked)} were sold due to lack of storage space.`);
		}

		if (slaveAmount > 0) {
			text.push(`${V.farmMenials ? capFirstChar(massFormat(slaveAmount)) : `All of it`} was produced by your ${num(farmhands)} farmhands`);
		}
		if (menialAmount > 0) {
			text.push(`${slaveAmount > 0 ? text.pop() + `, and ${massFormat(production - slaveAmount)}` : `All of it`} was produced by ${num(V.farmMenials)} menial slaves`);
		}

		if (slaveAmount + menialAmount > 0) {
			text.push(text.pop() + `.`);
		}

		return text.join(' ');
	}

	function consumption() {
		if (V.mods.food.enabled === false || V.mods.food.market === false) {
			return "";
		}
		const text = [];
		const production = App.Facilities.Farmyard.foodProduction();
		const consumption = App.Facilities.Farmyard.foodConsumption();
		const deficit = Math.abs(consumption - production);
		const cost = App.Facilities.Farmyard.foodBuyCost(deficit);
		const storage = App.Facilities.Farmyard.foodAvailable();

		if (production > consumption) {
			text.push(`${capFirstChar(massFormat(consumption))} of it was consumed, with a spare ${massFormat(production - (consumption + V.mods.food.overstocked))} moved into long-term storage.`);
		} else {
			if (storage > deficit) {
				text.push(`Unfortunately, this wasn't enough to cover the needs of your hungry arcology, and ${massFormat(deficit)} had to be brought out of storage.`);
			} else if (V.cash > cost) {
				text.push(`Unfortunately, this wasn't enough to cover the needs of your hungry arcology, and because you didn't have enough food in storage, you had to purchase an additional ${massFormat(deficit - storage)} for ${cashFormat(App.Facilities.Farmyard.foodBuyCost(deficit - storage))}.`);
			}
		}

		return text.join(' ');
	}
};
