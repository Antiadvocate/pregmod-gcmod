new App.DomPassage("Child Interact",
	() => {
		V.nextButton = "Confirm changes";
		V.nextLink = "Nursery";

		return App.UI.ChildInteract.mainPage(V.activeChild);
	}, ["jump-from-safe"]
);