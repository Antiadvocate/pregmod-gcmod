// The smaller, the more global
App.Data.World.TravelFrictionExponent = -0.6;
// The smaller, the more are large nationalities downscaled
App.Data.World.PopScaleFactor = 23;

/**
 * @typedef {Record<number, number>} gridPoint
 * Not intended for manual handling, use one of the functions below to get the data behind it.
 *
 * If gridPoint[0] >= 0: Point in the world data grids. (X, Y)
 * Otherwise           : Encodes a small territory
 */

/**
 * @returns {Generator<gridPoint, void, *>}
 */
App.Data.World.gridPoints = function*() {
	for (let x = 0; x < App.Data.World.GridDimensions.width; x++) {
		for (let y = 0; y < App.Data.World.GridDimensions.height; y++) {
			yield [x, y];
		}
	}
	for (let i = 0; i < App.Data.World.SmallTerritories.length; i++) {
		yield [-1, i];
	}
};

/**
 * Turn a grid cell into a global coordinate.
 * @param {gridPoint} p
 * @returns {[number, number]} Latitude, Longitude
 */
App.Data.World.gridPointToCoordinate = function(p) {
	if (p[0] === -1) {
		const st = App.Data.World.SmallTerritories[p[1]];
		return [st[2], st[3]];
	}

	const width = App.Data.World.GridDimensions.width;
	const height = App.Data.World.GridDimensions.height;

	const lon = p[0] / App.Data.World.GridDimensions.width * 360 - 180;
	const lat = p[1] / App.Data.World.GridDimensions.height * -180 + 90;

	const lonCell = 360 / width;
	const latCell = 180 / height;

	return [lat - latCell / 2, lon + lonCell / 2];
};

/**
 * Return the grid cell that encloses the given coordinates
 * @param {number} lat
 * @param {number} lon
 * @returns {gridPoint}
 */
App.Data.World.coordinateToGridPoint = function(lat, lon) {
	const width = App.Data.World.GridDimensions.width;
	const height = App.Data.World.GridDimensions.height;

	const lonCell = 360 / width;
	const latCell = 180 / height;

	const x = Math.floor((lon + 180) / lonCell);
	const y = Math.floor((-lat + 90) / latCell);

	return [x, y];
};

/**
 * @param {gridPoint} p
 * @returns {number}
 */
App.Data.World.populationAt = function(p) {
	if (p[0] === -1) {
		const st = App.Data.World.SmallTerritories[p[1]];
		return st[1];
	}
	return App.Data.World.PopGrid[p[1]][p[0]];
};

/**
 * @param {gridPoint} p
 * @returns {number}
 */
App.Data.World.nationIdAt = function(p) {
	if (p[0] === -1) {
		const st = App.Data.World.SmallTerritories[p[1]];
		return st[0];
	}
	return App.Data.World.NationGrid[p[1]][p[0]];
};

/**
 * @param {gridPoint} p
 * @returns {string}
 */
App.Data.World.nationAt = function(p) {
	const nationId = App.Data.World.nationIdAt(p);
	return App.Data.World.Nations[nationId] || "Stateless";
};
