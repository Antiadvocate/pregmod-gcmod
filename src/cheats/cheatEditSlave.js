/**
 * @deprecated we are working on moving this to {@link App.UI.Cheat.cheatEditActor}
 * TODO: @franklygeorge finish moving this
 * @param {FC.SlaveState} slave
 */
App.UI.SlaveInteract.cheatEditSlave = function(slave) {
	const el = new DocumentFragment();
	if (!V.temp.cheatActor) {
		V.temp.cheatActor = clone(slave);
	}

	App.UI.DOM.appendNewElement("h1", el, `Cheat edit ${slave.slaveName}`);

	el.append(App.Desc.longSlave(asSlave(V.temp.cheatActor)));

	const tabBar = new App.UI.Tabs.TabBar("CheatEditJS");
	tabBar.addTab("Profile", "profile", App.StartingGirls.profile(asSlave(V.temp.cheatActor), true));
	tabBar.addTab("Physical", "physical", App.StartingGirls.physical(asSlave(V.temp.cheatActor), true));
	tabBar.addTab("Upper", "upper", App.StartingGirls.upper(asSlave(V.temp.cheatActor), true));
	tabBar.addTab("Lower", "lower", App.StartingGirls.lower(asSlave(V.temp.cheatActor), true));
	if (V.temp.cheatActor.womb.length > 0) {
		tabBar.addTab(V.temp.cheatActor.womb.length > 1 ? 'Fetuses' : 'Fetus', "fetuses", analyzePregnancies(V.temp.cheatActor, true));
	}
	tabBar.addTab("Genes", "genes", genes());
	tabBar.addTab("Mental", "mental", App.StartingGirls.mental(asSlave(V.temp.cheatActor), true));
	tabBar.addTab("Skills", "skills", App.StartingGirls.skills(asSlave(V.temp.cheatActor), true));
	tabBar.addTab("Stats", "stats", App.StartingGirls.stats(V.temp.cheatActor));
	tabBar.addTab("Porn", "porn", porn());
	tabBar.addTab("Relationships", "family", App.Intro.editFamily(V.temp.cheatActor, true));
	tabBar.addTab("Body Mods", "body-mods", App.UI.bodyModification(asSlave(V.temp.cheatActor), true));
	tabBar.addTab("Salon", "salon", App.UI.salon(asSlave(V.temp.cheatActor), true));
	if (V.seeExtreme) {
		tabBar.addTab("Extreme", "extreme", extreme());
	}
	tabBar.addTab("Finalize", "finalize", finalize());
	el.append(tabBar.render());

	return el;

	function genes() {
		const el = new DocumentFragment();
		App.UI.DOM.appendNewElement("h2", el, "Genetic mods");
		el.append(App.UI.SlaveInteract.geneticMods(asSlave(V.temp.cheatActor)));
		App.UI.DOM.appendNewElement("h2", el, "Genetic quirks");
		el.append(App.UI.SlaveInteract.geneticQuirks(asSlave(V.temp.cheatActor), true));
		return el;
	}

	function finalize() {
		const el = new DocumentFragment();
		App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
			"Cancel",
			() => {
				delete V.temp.cheatActor;
			},
			[],
			"Slave Interact"
		));
		App.Utils.showSlaveChanges(V.temp.cheatActor, getSlave(V.temp.AS), (val) => App.UI.DOM.appendNewElement("div", el, val), " ");
		App.UI.DOM.appendNewElement("div", el, App.UI.DOM.link(
			"Apply cheat edits",
			() => {
				App.Verify.slaveState("V.temp.cheatEditActor", asSlave(V.temp.cheatActor), "main slave pool");
				normalizeRelationship();
				overwriteSlave(slave.ID, asSlave(V.temp.cheatActor));
				ibc.recalculate_coeff_id(slave.ID);
				delete V.temp.cheatActor;
			},
			[],
			"Cheat Edit JS Apply"
		));
		return el;
	}

	function normalizeRelationship() {
		if (asSlave(V.temp.cheatActor).relationship !== slave.relationship || asSlave(V.temp.cheatActor).relationshipTarget !== slave.relationshipTarget) {
			if (slave.relationship > 0 && asSlave(V.temp.cheatActor).relationship <= 0) {
				// broke relationship
				const friend = getSlave(slave.relationshipTarget);
				if (friend) {
					friend.relationship = 0;
					friend.relationshipTarget = 0;
				}
				asSlave(V.temp.cheatActor).relationshipTarget = 0;
			} else if (asSlave(V.temp.cheatActor).relationship > 0 && asSlave(V.temp.cheatActor).relationshipTarget !== slave.relationshipTarget) {
				// new relationship target
				const oldFriend = slave.relationship > 0 ? getSlave(slave.relationshipTarget) : null;
				if (oldFriend) {
					// first break this slave's existing relationship, if she had one
					oldFriend.relationship = 0;
					oldFriend.relationshipTarget = 0;
				}
				const newFriend = getSlave(asSlave(V.temp.cheatActor).relationshipTarget);
				if (newFriend) {
					// then break the target's existing relationship, if she had one
					const newFriendFriend = newFriend.relationship > 0 ? getSlave(newFriend.relationshipTarget) : null;
					if (newFriendFriend) {
						newFriendFriend.relationship = 0;
						newFriendFriend.relationshipTarget = 0;
					}
					// then make the new relationship bilateral
					newFriend.relationship = asSlave(V.temp.cheatActor).relationship;
					newFriend.relationshipTarget = V.temp.cheatActor.ID;
				}
			} else if (asSlave(V.temp.cheatActor).relationship > 0) {
				// same target, new relationship level
				const friend = getSlave(slave.relationshipTarget);
				if (friend) {
					friend.relationship = asSlave(V.temp.cheatActor).relationship;
				}
			}
		}
	}

	function extreme() {
		const el = new DocumentFragment();
		const options = new App.UI.OptionsGroup();
		options.addOption("Fuckdoll", "fuckdoll", V.temp.cheatActor)
			.addValue("Not a Fuckdoll", 0).addCallback(() => {
				V.temp.cheatActor.clothes = "no clothing";
				V.temp.cheatActor.shoes = "none";
			})
			.addValue("Barely a Fuckdoll", 15).addCallback(() => beginFuckdoll(asSlave(V.temp.cheatActor)))
			.addValue("Slight Fuckdoll", 25).addCallback(() => beginFuckdoll(asSlave(V.temp.cheatActor)))
			.addValue("Basic Fuckdoll", 45).addCallback(() => beginFuckdoll(asSlave(V.temp.cheatActor)))
			.addValue("Intermediate Fuckdoll", 65).addCallback(() => beginFuckdoll(asSlave(V.temp.cheatActor)))
			.addValue("Advanced Fuckdoll", 85).addCallback(() => beginFuckdoll(asSlave(V.temp.cheatActor)))
			.addValue("Total Fuckdoll", 100).addCallback(() => beginFuckdoll(asSlave(V.temp.cheatActor)))
			.showTextBox();
		el.append(options.render());
		return el;
	}

	function porn() {
		const el = new DocumentFragment();
		const porn = asSlave(V.temp.cheatActor).porn;
		const options = new App.UI.OptionsGroup();
		let option;
		const {him, he} = getPronouns(V.temp.cheatActor);
		options.addOption(`Studio outputting porn of ${him}`, "feed", porn)
			.addValue("off", 0).off()
			.addValue("on", 1).on();
		options.addOption(`Viewer count`, "viewerCount", porn).showTextBox();
		options.addOption(`Spending`, "spending", porn).showTextBox();

		option = options.addOption(`Porn ${he} is known for`, "fameType", porn).addValue("None", "none").pulldown();
		for (const genre of App.Porn.getAllGenres()) {
			option.addValue(genre.uiName(), genre.fameName);
		}

		if (porn.fameType !== "none") {
			options.addOption(`Prestige level`, "prestige", porn)
				.addValueList([
					["Not", 0],
					["Some", 1],
					["Recognized", 2],
					["World renowned", 3],
				]);
			let genre = App.Porn.getGenreByFameName(porn.fameType);
			let desc_auto = '';
			switch (porn.prestige) {
				case 1:
					desc_auto = `$He has a following in slave pornography. ${genre.prestigeDesc1}.`;
					break;
				case 2:
					desc_auto = `He is well known from $his career in slave pornography. ${genre.prestigeDesc2}.`;
					break;
				case 3:
					desc_auto = `$He is world famous for $his career in slave pornography. ${genre.prestigeDesc3}.`;
					break;
			}
			options.addOption(`Prestige Description`, "prestigeDesc", porn)
				.addValue("Disable", 0).off()
				.addValue("Automatic", desc_auto).off()
				.showTextBox();
		}

		option = options.addOption(`Porn the studio focuses on`, "focus", porn).addValue("None", "none").pulldown();
		for (const genre of App.Porn.getAllGenres()) {
			option.addValue(genre.uiName(), genre.focusName);
		}

		for (const genre of App.Porn.getAllGenres()) {
			options.addOption(`Fame level for ${genre.fameName}`, genre.fameVar, porn.fame).addValue("None", "none").showTextBox();
		}

		el.append(options.render());
		return el;
	}
};
