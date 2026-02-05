
/**
 * Runs verification for all CustomSlaveOrder objects
 * @see App.Entity.CustomSlaveOrder
 * @see V.customSlave
 * @see V.huskSlave
 * @param {HTMLDivElement} [div]
 */
App.Verify.customSlaveOrders = (div) => {
	if (V.customSlave) {
		App.Verify.customSlaveOrder(V.customSlave, "V.customSlave", div);
	}
	if (V.huskSlave) {
		App.Verify.customSlaveOrder(V.huskSlave, "V.huskSlave", div);
	}
};

/**
 * Runs verification of the provided CustomSlaveOrder object
 * @param {FC.CustomSlaveOrder} order
 * @param {"V.customSlave"|"V.huskSlave"} location
 * @param {HTMLDivElement} [div]
 */
App.Verify.customSlaveOrder = (order, location, div) => {
	const original = _.cloneDeep(order);
	try {
		App.Patch.Utils.customSlaveOrder(location, order);
	} catch (e) {
		console.error(e);
		order = original;
		return;
	}
	// add missing props
	App.Utils.assignMissingDefaults(order, new App.Entity.CustomSlaveOrder());
	// verify
	order = App.Verify.Utils.verify("customSlaveOrder", location, order, location, div);
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\

/**
 * @type {App.Verify.Utils.FunctionCustomSlaveOrder}
 */
App.Verify.I.customSlaveOrderMisc = (order) => {
	//TODO: figure out what needs verified in App.Entity.CustomSlaveOrder and add it here
	return order;
};
