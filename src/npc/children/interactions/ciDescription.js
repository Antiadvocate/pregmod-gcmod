/**
 * @param {FC.InfantState} infant
 * @returns {DocumentFragment}
 */
App.UI.ChildInteract.description = function(infant) {
	const el = new DocumentFragment();
	const descriptionLink = document.createElement("div");
	descriptionLink.style.fontStyle = "italic";
	descriptionLink.id = "description-link";

	if (V.seeDetails === 1) {
		const descriptionOptions = document.createElement("div");

		descriptionOptions.id = "description-options";
		el.append(descriptionOptions);

		el.append(App.Desc.longSlave(infant, {noArt: true, links: true}));

		descriptionLink.append(showOptions());
		el.append(descriptionLink);
	} else {
		descriptionLink.append(
			App.UI.DOM.link(
				"Show descriptions",
				() => {
					V.seeDetails = 1;
				},
				[],
				"Child Interact"
			)
		);
		el.append(descriptionLink);
	}

	return el;

	function showOptions() {
		return App.UI.DOM.link(
			"Description Options",
			() => {
				jQuery("#description-link").empty().append(hideOptions());
				jQuery("#description-options").empty().append(App.UI.descriptionOptions());
			}
		);
	}

	function hideOptions() {
		return App.UI.DOM.link(
			"Description Options",
			() => {
				jQuery("#description-link").empty().append(showOptions());
				jQuery("#description-options").empty().append();
			}
		);
	}
};
