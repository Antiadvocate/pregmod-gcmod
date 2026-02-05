new App.DomPassage("Backwards Compatibility",
	() => {
		V.nextButton = "Continue";
		if (["Options", "Backwards Compatibility", "End Week"].includes(V.nextLink)) {
			V.nextLink = "Main";
		}

		return App.Patch.applyAll();
	}
);
