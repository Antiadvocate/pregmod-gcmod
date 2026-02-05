App.Patch.register({
	releaseID: 1270,
	descriptionOfChanges: "Moves most temporary variables to V.transistion",
	pre: (div) => {
		App.Patch.log("Moving variables");
		V.temp = {
			newCheatGirls: getProp(V, "newCheatGirls"),
			limitedCheatStart: getProp(V, "limitedCheatStart") === 1,
			AS: getProp(V, "AS"),
			activeFetus: getProp(V, "activeFetus"),
			gameover: getProp(V, "gameover"),
			prostheticsConfig: getProp(V, "prostheticsConfig"),
			readySlave: getProp(V, "readySlave"),
			newSlavePool: getProp(V, "newSlavePool"),
			slavesToImportMax: getProp(V, "slavesToImportMax"),
			activeArcologyIdx: getProp(V, "activeArcologyIdx"),
			showEmptyBudgetEntries: getProp(V, "showAllEntries"),
			cheatActor: getProp(V, "tempActor"),
			activeSlave: getProp(V, "activeSlave"),
			customLanguage: getProp(V, "seed"),
			applyCareerBonus: getProp(V, "applyCareerBonus"),
			careerBonusNeeded: getProp(V, "careerBonusNeeded"),
		};
		App.Utils.moveProperties(V.temp.showEmptyBudgetEntries, V.temp.showEmptyBudgetEntries, {
			cash: "costsBudget",
			rep: "repBudget",
		},
		false, true);
		deleteProps(V,
			// moved to V.temp above
			"newCheatGirls", "limitedCheatStart", "AS", "activeFetus",
			"gameover", "prostheticsConfig", "readySlave", "newSlavePool",
			"slavesToImportMax", "activeArcologyIdx", "showAllEntries",
			"tempActor", "activeSlave", "seed",
			"applyCareerBonus", "careerBonusNeeded",

			// removed because they were unused
			"oldLimbs", "backupActor",
		);
	}
});
