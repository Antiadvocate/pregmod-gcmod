/**
 * All of the code in this file is legacy. Changing it will likely break old saves, as the patching system still uses it.
 *
 * To create a new patch (BC) see the instructions at the top of `/src/data/patches/patch.js`.
 */

// @ts-nocheck this is legacy, all of it's missing/incorrect values where correct when they were implemented. This worked fine with save data structures from release 1258 and before. And saves/new games after 1258 shouldn't be running this code

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`
 */
App.Facilities.Farmyard.BC = function() {
	if (typeof V.farmyardUpgrades !== "object") {
		V.farmyardUpgrades = {
			pump: 0, fertilizer: 0, hydroponics: 0, machinery: 0, seeds: 0
		};
	}

	V.farmyardUpgrades.foodStorage = V.farmyardUpgrades.foodStorage ?? (V.mods.food.amount > 0)
		? Math.trunc(V.mods.food.amount / 1000) + 50 // old saves get enough storage to hold all their food plus a buffer
		: 150;

	if (App.Data.Animals.size === 0) {
		App.Facilities.Farmyard.animals.init();
	}

	if (V.foodStored) {
		V.mods.food.amount += V.foodStored;

		delete V.foodStored;
	}

	V.mods.food.deficit = V.mods.food.deficit ?? 0;
	V.mods.food.overstocked = V.mods.food.overstocked ?? 0;

	if (V.canine) {
		V.animals.canine = Array.from(V.canine);

		delete V.canine;
	}
	if (V.hooved) {
		V.animals.hooved = Array.from(V.hooved);

		delete V.hooved;
	}
	if (V.feline) {
		V.animals.feline = Array.from(V.feline);

		delete V.feline;
	}

	if (!V.animals || typeof V.animals !== "object") {
		V.animals = {
			canine: [],
			hooved: [],
			feline: [],
		};
	} else {
		V.animals.canine = V.animals.canine.filter(canine => !!getAnimal(canine));
		V.animals.hooved = V.animals.hooved.filter(hooved => !!getAnimal(hooved));
		V.animals.feline = V.animals.feline.filter(feline => !!getAnimal(feline));
	}

	if (V.active.canine && typeof getAnimal(V.active.canine) === "undefined") { V.active.canine = null; }
	if (V.active.hooved && typeof getAnimal(V.active.hooved) === "undefined") { V.active.hooved = null; }
	if (V.active.feline && typeof getAnimal(V.active.feline) === "undefined") { V.active.feline = null; }

	if (V.farmyardShowgirls) {
		delete V.farmyardShowgirls;
	}

	if (V.farmyardFarmers) {
		delete V.farmyardFarmers;
	}
};
