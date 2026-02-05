new App.DomPassage("Options",
	() => {
		if (!["Options",].includes(lastPassage())) {
			V.storedLink = lastPassage();
		} else {
			V.storedLink = "Main";
		}

		V.nextButton = "Back";
		V.nextLink = V.storedLink;
		App.UI.StoryCaption.encyclopedia = "How to Play";

		return App.UI.optionsPassage();
	}, ["jump-to-safe", "jump-from-safe", "temporary-images"]
);

new App.DomPassage("Description Options",
	() => {
		V.nextButton = "Back";
		if (!["Description Options",].includes(lastPassage())) {
			V.storedLink = lastPassage();
		} else {
			V.storedLink = "Main";
		}

		V.nextLink = V.storedLink;

		return App.UI.descriptionOptions();
	}, ["jump-to-safe", "jump-from-safe"]
);

new App.DomPassage("Summary Options",
	() => {
		V.nextButton = "Back";
		if (V.storedLink !== "Slave Interact" && V.storedLink !== "Main") {
			V.storedLink = lastPassage() === "Main" ? "Main" : "Options";
		}
		V.nextLink = V.storedLink;
		App.Utils.PassageSwitchHandler.set(App.EventHandlers.optionsChanged);

		return App.UI.summaryOptions();
	}, ["jump-to-safe", "jump-from-safe"]
);

new App.DomPassage("Hotkey Settings",
	() => {
		V.nextButton = "Back";
		V.nextLink = "Main";

		return App.UI.Hotkeys.settings();
	}, ["jump-to-safe", "jump-from-safe"]
);

new App.DomPassage("Edit Genetics",
	() => {
		return App.UI.editGenetics();
	}, ["jump-from-safe"]
);

new App.DomPassage("Variable Difference",
	() => {
		V.nextButton = " "; /* disable the nextButton. Forces the user to use the "Go Back" option contained in the function */
		return App.UI.variableDifference();
	}
);

new App.DomPassage("MOD_Edit Arcology Cheat",
	() => {
		V.nextButton = "Continue";
		V.nextLink = "MOD_Edit Arcology Cheat Datatype Cleanup";
		return App.UI.Cheat.arcologyPassage();
	}
);

new App.DomPassage("MOD_Edit Arcology Cheat Datatype Cleanup",
	() => {
		V.nextButton = "Continue";
		V.nextLink = "Main";
		return App.UI.Cheat.arcologyCheatDatatypeCleanup();
	}
);

new App.DomPassage("MOD_Edit Neighbor Arcology Cheat Datatype Cleanup",
	() => {
		V.nextButton = "Continue";
		V.nextLink = "Main";
		return App.UI.Cheat.neighborArcologyCheatDatatypeCleanup();
	}
);

new App.DomPassage(
	"Cheat Edit Actor",
	() => {
		V.nextButton = " ";
		return App.UI.Cheat.cheatEditActor(V.temp.cheatActor);
	}
);

new App.DomPassage(
	"Cheat Edit Actor Apply",
	() => {
		V.nextButton = "Continue";
		V.nextLink = "Main";
		V.cheater = 1;
		const el = new DocumentFragment();
		App.UI.DOM.appendNewElement("p", el, `You perform the dark rituals, pray to the dark gods, and sell your soul for the power to bend reality to your will.`);
		App.UI.DOM.appendNewElement("p", el, `Your creation is probably stable, but when you play with this much power, who's to say? You've been branded a CHEATER to the world, but what are the odds you possess the arcane knowledge to fix that?`);
		return el;
	}, ["jump-from-safe"]
);

new App.DomPassage("PCCheatMenu",
	() => {
		V.nextButton = "Apply";
		V.nextLink = "PCCheatMenuCheatDatatypeCleanup";
		App.UI.StoryCaption.encyclopedia = "Design Your Master";
		return App.UI.Cheat.PCCheatMenu();
	}
);


new App.DomPassage("PCCheatMenuCheatDatatypeCleanup",
	() => {
		V.nextButton = "Continue";
		V.nextLink = "Manage Personal Affairs";
		return App.UI.Cheat.PCCheatMenuCheatDatatypeCleanup();
	}
);
