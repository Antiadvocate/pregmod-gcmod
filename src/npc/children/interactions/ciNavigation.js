/**
 * @param {FC.InfantState} infant
 * @returns {DocumentFragment}
 */
App.UI.ChildInteract.navigation = function(infant) {
	const f = new DocumentFragment();

	/*
	if (V.cheatMode) {
		App.UI.DOM.appendNewElement("div", f,
			App.UI.DOM.passageLink("Cheat Edit Slave", "Cheat Edit Actor", () => {
				App.Verify.infantState(`getInfant(${V.temp.AS})`, getInfant(V.temp.AS));
				V.tempSlave = clone(getInfant(V.temp.AS));
			}),
			"cheat-menu"
		);
	}
  */

	const p = document.createElement("p");
	p.classList.add("center");

	// const placeInLine = App.UI.SlaveInteract.placeInLine(child);
	const div = App.UI.DOM.appendNewElement("div", p, null);
	const previous = App.UI.DOM.makeElement("span", null, ['margin-right']);
	const next = App.UI.DOM.makeElement("span", null, ['margin-left']);
	const name = App.UI.DOM.makeElement("span", infant.slaveName, ['slave-name', "si-header"]);

	/*
	previous.id = "prev-slave";
	next.id = "next-slave";

	previous.append(
		App.UI.DOM.makeElement("span", App.UI.Hotkeys.hotkeys("prev-slave"), ['hotkey']),
		" ",
		App.UI.DOM.makeElement("span", App.UI.DOM.passageLink("Prev", "Slave Interact", () => {
			V.temp.AS = placeInLine[0];
		}), ["adjacent-slave"]),
	);
	next.append(
		App.UI.DOM.makeElement("span", App.UI.DOM.passageLink("Next", "Slave Interact", () => {
			V.temp.AS = placeInLine[1];
		}), ["adjacent-slave"]),
		" ",
		App.UI.DOM.makeElement("span", App.UI.Hotkeys.hotkeys("next-slave"), ['hotkey']),
	);
  */

	function content() {
		const frag = new DocumentFragment();

		frag.append(
			previous,
			name,
			' ',
			/*
      App.UI.DOM.makeElement("span", App.UI.favoriteToggle(child, () => {
				App.UI.DOM.replace(div, content());
			}), ['si-header']),
      */
			next,
		);

		return frag;
	}

	div.append(content());

	f.append(p);

	return f;
};
