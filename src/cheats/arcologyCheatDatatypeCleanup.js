// cSpell:ignore CHEATY

App.UI.Cheat.arcologyCheatDatatypeCleanup = function() {
	const node = new DocumentFragment();

	App.Verify.playerState(V.PC);
	App.Verify.I.arcology();

	App.UI.DOM.appendNewElement("p", node, "The chanting grows louder and louder, CHEAT! CHEAT! CHEAT!");
	App.UI.DOM.appendNewElement("p", node, "The Arcology morphs and changes shape, CHEAT! CHEAT! CHEAT!");
	App.UI.DOM.appendNewElement("p", node, "The Arcology has been changed forever and you forfeit your CHEATING CHEATY SOUL!");

	return node;
};
