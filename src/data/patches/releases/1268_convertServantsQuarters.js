App.Patch.register({
	releaseID: 1268,
	descriptionOfChanges: "Converts V.servantsQuarters into an object",
	pre: () => {
		V.servantsQuarters = {
			capacity: Math.max(+V.servantsQuarters, 0) ?? 0,
			name: getProp(V, "servantsQuartersName", "the Servants' Quarters"),
			decoration: getProp(V, "servantsQuartersDecoration", "standard"),
			upgrades: {
				monitoring: Math.clamp(+getProp(V, "servantsQuartersUpgradeMonitoring", 0), 0, 1),
			},
			rules: {
				stewardessImpregnates: Math.clamp(+getProp(V, "stewardessImpregnates", 0), 0, 1),
			},
		};
		deleteProps(V,
			"servantsQuartersName",
			"servantsQuartersDecoration",
			"servantsQuartersUpgradeMonitoring",
			"stewardessImpregnates"
		);
		// Pre-conversion saves don't have the same name for the monitoring upgrade, which messes up V.costs
		// calculation into a NaN if the save is set in Main. We must recalculate costs and set V.costs before
		// getting back to Main or we'll get a NaN variable stuck in V.NaNArray for the week despite the calculation
		// being correct post-BC.
		V.costs = Math.trunc(calculateCosts.predict());
	}
});
