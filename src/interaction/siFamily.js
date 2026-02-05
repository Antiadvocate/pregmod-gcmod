/**
 * @param {FC.SlaveState} slave
 * @returns {HTMLParagraphElement}
 */
App.UI.SlaveInteract.family = function(slave) {
	const p = document.createElement("p");
	p.id = "family";
	p.append(renderFamilyTree(getSlaves().asArray(), slave.ID));

	return p;
};
