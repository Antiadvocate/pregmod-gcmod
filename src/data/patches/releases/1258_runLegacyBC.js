
App.Patch.register({
	releaseID: 1258,
	descriptionOfChanges: "This runs the legacy BC for older saves",
	post: (div) => {
		// call the legacy BC as patching didn't exist for this or earlier versions
		App.Patch.log("** Calling legacy BC **");
		App.UI.DOM.appendNewElement("div", div, App.Update.backwardsCompatibility());
	},
	slaveState: (div, actor, location) => {
		// call the valid parts of legacy BC for the slave
		App.Patch.log(`** Calling legacy BC **`);
		App.Update.Slave(actor, location === "gene pool");
		App.Update.SlaveDataSchemeCleanup(actor);
		App.Update.SlaveDatatypeCleanup(actor, location === "tank slave pool");
		/** @type {"normal" | "PC" | "detached" | "incubator"} */
		let slaveType = "normal";
		/** @type {App.Patch.Utils.HumanStateLocation[]} */
		const detachedLocations = ["detached boomerang", "detached hostage", "detached hostage wife", "detached shelter", "detached traitor"];
		if (location === "tank slave pool") {
			slaveType = "incubator";
		} else if (detachedLocations.includes(location)) {
			slaveType = "detached";
		}
		actor = /** @type {FC.SlaveState} */ (App.Update.human(actor, slaveType, div));
		return actor;
	},
	tankSlaveState: (div, actor) => {
		// call the valid parts of legacy BC for the tank slave
		App.Patch.log(`** Calling legacy BC **`);
		App.Update.Slave(actor);
		App.Update.SlaveDataSchemeCleanup(actor);
		App.Update.SlaveDatatypeCleanup(actor, true);
		actor = /** @type {FC.TankSlaveState} */ (App.Update.human(actor, "incubator", div));
		return actor;
	},
	playerState: (div, actor, location) => {
		// call the valid parts of legacy BC for the player
		App.Patch.log("** Calling legacy BC **");
		App.Update.Player(actor, location === "gene pool");
		actor = /** @type {FC.PlayerState} */ (App.Update.human(actor, "PC", div));
		return actor;
	},
	customSlaveOrder: (div, order, location) => {
		App.Patch.log(`** Calling legacy BC **`);
		App.Update.CustomSlaveOrder(order);
		return order;
	}
});
