new App.DomPassage("BirthStorm",
	() => {
		V.nextButton = "Back";
		V.nextLink = "Slave Interact";

		return birth(getSlave(V.temp.AS), {birthStorm: true});
	}
);

new App.DomPassage("csec",
	() => {
		V.nextButton = "Back";
		V.nextLink = "Slave Interact";

		return birth(getSlave(V.temp.AS), {cSection: true});
	}
);

new App.DomPassage("Surrogacy",
	() => {
		V.nextButton = "Continue";

		return App.UI.surrogacy();
	}
);
