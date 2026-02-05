/** Find the previous and next slaves' IDs based on the current sort order
 * @param {FC.SlaveState} slave
 * @returns {[FC.HumanID, FC.HumanID]} - previous and next slave ID
 */
App.UI.SlaveInteract.placeInLine = function(slave) {
	const useSlave = assignmentVisible(slave) ? ((s) => assignmentVisible(s)) : ((s) => slave.assignment === s.assignment);
	SlaveSort.slaves();
	const slaveList = getSlaves().filter(useSlave);
	const curSlaveIndex = [...slaveList.keys()].findIndex((ID) => ID === slave.ID);

	let nextIndex;
	if (curSlaveIndex + 1 > slaveList.size - 1) {
		nextIndex = 0; // wrap around to first slave
	} else {
		nextIndex = curSlaveIndex + 1;
	}
	let prevIndex;
	if (curSlaveIndex - 1 < 0) {
		prevIndex = slaveList.size - 1; // wrap around to last slave
	} else {
		prevIndex = curSlaveIndex - 1;
	}

	return [slaveList.atIndex(prevIndex).key, slaveList.atIndex(nextIndex).key];
};

/** @typedef RowItem
 * @type {object}
 * @property {FC.FutureSociety} [FS] - FS requirement, if any
 * @property {string} [text] - link text
 * @property {object} [updateSlave] - properties to be merged onto the slave
 * @property {object} [update] - properties to be merged into global state
 * @property {string} [disabled] - text indicating why the option is unavailable
 * @property {string} [note]
 */

/** Generate a row of choices
 * @param {RowItem[]} array
 * @param {FC.SlaveState} slave
 * @param {string} [category] - should be in the form of slave.category, the thing we want to update.
 * @param {boolean} [accessCheck=false]
 * @param {Function} [refresh]
 * @returns {HTMLSpanElement}
 */
App.UI.SlaveInteract.generateRows = function(array, slave, category, accessCheck = false, refresh) {
	const linkArray = [];
	for (const item of array) {
		let link;
		// Some items will never be in App.Data.slaveWear, especially "none" if it falls in between harsh and nice data sets. Trying to look it up would cause an error, which is what access check works around.
		/** @type {boolean|string} */
		let unlocked;
		if (accessCheck === true) {
			const itemName = (category === "chastity") ? item.text.toLowerCase() : item.updateSlave[category]; // Yucky. Category name does not match for chastity (since it sets multiple kinds of chastity at once). Compare using a lowercase name instead.
			unlocked = isItemAccessible.entry(itemName, category, slave);
		}
		if (accessCheck === false || unlocked) {
			// is it just text?
			if (item.disabled) {
				link = App.UI.DOM.disabledLink(item.text, [item.disabled]);
			} else if (typeof unlocked === 'string') {
				link = App.UI.DOM.disabledLink(item.text, [unlocked]);
			} else {
				link = document.createElement('span');

				// Set up the link
				link.appendChild(
					App.UI.DOM.link(
						`${item.text} `,
						() => { click(item); },
						[],
						"",
						item.note ? item.note : ""
					)
				);

				if (item.FS) {
					link.append(App.UI.DOM.spanWithTooltip(`FS`, FutureSocieties.displayAdj(item.FS), ["note"]));
				}
			}
			linkArray.push(link);
		}
	}

	return App.UI.DOM.generateLinksStrip(linkArray);

	/** @param {RowItem} arrayOption */
	function click(arrayOption) {
		if (arrayOption.updateSlave) {
			for (const slaveProperty in arrayOption.updateSlave) {
				_.set(slave, slaveProperty, arrayOption.updateSlave[slaveProperty]);
			}
		}
		if (arrayOption.update) {
			Object.assign(V, arrayOption.update);
		}
		refresh();
	}
};
