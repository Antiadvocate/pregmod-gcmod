// cSpell:ignore Educatrix, Tlatoani, Cihuacoatl, Implantrix, Repopulist, Pharmacologes, Pharmacologos

/**
 * @returns {FC.PlayerState}
 */
globalThis.basePlayer = function() {
	return new App.Entity.PlayerState();
};

/**
 * Helper function returning PC's title
 * @returns {string}
 */
globalThis.properTitle = function() {
	const PC = V.PC;
	if (PC.customTitle) {
		return PC.customTitle;
	} else if (PC.title !== 0) {
		return "Sir";
	} else {
		return "Ma'am";
	}
};

/**
 * Helper function returning slave's title for PC in situations where getWrittenTitle() is inappropriate
 * @returns {string}
 */
globalThis.properMaster = function() {
	const PC = V.PC;
	if (PC.customTitle) {
		return PC.customTitle;
	} else if (PC.title !== 0) {
		return "Master";
	} else {
		return "Mistress";
	}
};

/**
 * @returns {string}
 */
globalThis.PlayerName = function() {
	const names = V.PC.slaveSurname ? [V.PC.slaveName, V.PC.slaveSurname] : [V.PC.slaveName];
	if ((V.surnameOrder !== 1 && ["Cambodian", "Chinese", "Ancient Chinese Revivalist", "Hungarian", "Japanese", "Edo Revivalist", "Korean", "Mongolian", "Taiwanese", "Vietnamese"].includes(V.PC.nationality)) || (V.surnameOrder === 2)) {
		names.reverse();
	}
	return names.join(" ");
};

/**
 * @returns {string}
 */
globalThis.PCTitle = function() {
	const titles = [];

	let title = PlayerName();
	if (V.cheater === 1) {
		titles.push(`${title} the Cheater`);
	} else if (V.arcologies[0].FSRestart > 10) {
		titles.push(`${title} of the Societal Elite`);
	} else if (V.rep > 18000) {
		titles.push(`${title} the Great`);
	} else if (V.rep > 17000) {
		titles.push(`the exalted ${title}`);
	} else if (V.rep > 16000) {
		titles.push(`the illustrious ${title}`);
	} else if (V.rep > 15000) {
		titles.push(`the prestigious ${title}`);
	} else if (V.rep > 14000) {
		titles.push(`the renowned ${title}`);
	} else if (V.rep > 13000) {
		titles.push(`the famed ${title}`);
	} else if (V.rep > 12000) {
		titles.push(`the celebrated ${title}`);
	} else if (V.rep > 11000) {
		titles.push(`the honored ${title}`);
	} else if (V.rep > 10000) {
		titles.push(`the acclaimed ${title}`);
	} else if (V.rep > 9000) {
		titles.push(`the eminent ${title}`);
	} else if (V.rep > 8250) {
		titles.push(`the prominent ${title}`);
	} else if (V.rep > 7500) {
		titles.push(`the distinguished ${title}`);
	} else if (V.rep > 6750) {
		titles.push(`the admired ${title}`);
	} else if (V.rep > 6000) {
		titles.push(`the esteemed ${title}`);
	} else if (V.rep > 5250) {
		titles.push(`the respected ${title}`);
	} else if (V.rep > 4500) {
		titles.push(`the known ${title}`);
	} else if (V.rep > 3750) {
		titles.push(`the recognized ${title}`);
	} else if (V.rep > 3000) {
		titles.push(`the rumored ${title}`);
	} else {
		titles.push(title);
	}

	if (V.PC.slaveName === "FC Dev") {
		titles.push("the Creator");
	}

	if (V.plot === 1) {
		if (V.invasionVictory === 3) {
			if (V.PC.title === 1) {
				titles.push("Hero of the City");
			} else {
				titles.push("Heroine of the City");
			}
		} else if (V.invasionVictory === 2) {
			titles.push("Defender of the City");
		}
		if (V.daughtersVictory === 3) {
			titles.push("Destroyer of the Daughters");
		} else if (V.daughtersVictory === 2) {
			if (V.PC.title === 1) {
				titles.push("Victor over the Daughters");
			} else {
				titles.push("Victrix over the Daughters");
			}
		}
	}

	if (V.SF.Toggle && V.SF.FS.Tension > 100) {
		switch (App.Mods.SF.fsIntegration.crisis()[1]) {
			case 'MIGRATION':
				titles.push("The Abandoned");
				break;
			case 'Revolt':
				titles.push("The Betrayed");
				break;
			case 'ANNIHILATION':
				titles.push("The Runner");
				break;
			case 'OCCUPATION':
				titles.push("The Occupied");
				break;
			case 'ASSIMILATION':
				titles.push("The Deceived");
				break;
			case 'ISOLATION':
				titles.push("The Ignored");
				break;
		}
	}

	if (V.mercenaries >= 5) {
		if (V.mercenariesTitle === "Evocati") {
			titles.push(`Princeps of the ${V.mercenariesTitle}`);
		} else if (V.mercenariesTitle === "Knights") {
			if (V.PC.title === 1) {
				titles.push(`Lord Commander of the ${V.mercenariesTitle}`);
			} else {
				titles.push(`Lady Commander of the ${V.mercenariesTitle}`);
			}
		} else if (V.mercenariesTitle === "Immortals") {
			titles.push(`Tyrant of the ${V.mercenariesTitle}`);
		} else if (V.mercenariesTitle === "Black Eagles") {
			titles.push(`Imperial Overlord of the ${V.mercenariesTitle}`);
		} else {
			titles.push(`Commander of the ${V.mercenariesTitle}`);
		}
	} else if (V.mercenaries >= 1) {
		titles.push("Commander of the Mercenaries");
	}

	if (V.dispensary === 1) {
		if (V.PC.title === 1) {
			titles.push("Pharmacologos");
		} else {
			titles.push("Pharmacologes");
		}
	}

	if (V.arcologies[0].FSSupremacist >= V.FSLockinLevel * 0.9) {
		titles.push("Grand Champion of the Blood");
	} else if (V.arcologies[0].FSSupremacist >= V.FSLockinLevel * 0.6) {
		titles.push("Champion of the Blood");
	} else if (V.arcologies[0].FSSupremacist >= V.FSLockinLevel * 0.3) {
		titles.push("Defender of the Blood");
	}

	if (V.arcologies[0].FSSubjugationist >= V.FSLockinLevel * 0.9) {
		titles.push("Grand Overseer of the Inferior Race");
	} else if (V.arcologies[0].FSSubjugationist >= V.FSLockinLevel * 0.6) {
		titles.push("Overseer of the Inferior Race");
	} else if (V.arcologies[0].FSSubjugationist >= V.FSLockinLevel * 0.3) {
		titles.push("Subduer of the Inferior Race");
	}

	if (V.arcologies[0].FSGenderRadicalist >= V.FSLockinLevel * 0.9) {
		titles.push("Buttfucker of All Slaves");
	} else if (V.arcologies[0].FSGenderRadicalist >= V.FSLockinLevel * 0.6) {
		titles.push("Sodomizer of the Traps");
	} else if (V.arcologies[0].FSGenderRadicalist >= V.FSLockinLevel * 0.3) {
		if (V.PC.title === 1) {
			titles.push("Penetrator of the Sissies");
		} else {
			titles.push("Penetratrix of the Sissies");
		}
	}

	if (V.arcologies[0].FSGenderFundamentalist >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("Father to the City");
		} else {
			titles.push("Mother to the City");
		}
	} else if (V.arcologies[0].FSGenderFundamentalist >= V.FSLockinLevel * 0.6) {
		titles.push("Defender of Women");
	} else if (V.arcologies[0].FSGenderFundamentalist >= V.FSLockinLevel * 0.3) {
		titles.push("Restorer of Morals");
	}

	if (V.arcologies[0].FSPaternalist >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("Protector to All Slaves");
		} else {
			titles.push("Protectrix to All Slaves");
		}
	} else if (V.arcologies[0].FSPaternalist >= V.FSLockinLevel * 0.6) {
		if (V.PC.title === 1) {
			titles.push("Benefactor of Slaves");
		} else {
			titles.push("Benefactrix of Slaves");
		}
	} else if (V.arcologies[0].FSPaternalist >= V.FSLockinLevel * 0.3) {
		titles.push("Pursuer of Justice");
	}

	if (V.arcologies[0].FSRepopulationFocus >= V.FSLockinLevel * 0.9) {
		titles.push("the Savior of the Future");
	} else if (V.arcologies[0].FSRepopulationFocus >= V.FSLockinLevel * 0.6) {
		titles.push("the Holder of the Future");
	} else if (V.arcologies[0].FSRepopulationFocus >= V.FSLockinLevel * 0.3) {
		titles.push("the Repopulist");
	}

	if (V.arcologies[0].FSDegradationist >= V.FSLockinLevel * 0.9) {
		titles.push("Holder of the Rod and the Lash");
	} else if (V.arcologies[0].FSDegradationist >= V.FSLockinLevel * 0.6) {
		titles.push("Subduer of Slaves");
	} else if (V.arcologies[0].FSDegradationist >= V.FSLockinLevel * 0.3) {
		titles.push("Pursuer of Justice");
	}

	if (V.arcologies[0].FSIntellectualDependency >= V.FSLockinLevel * 0.9) {
		titles.push("Sovereign of Bimbos");
	} else if (V.arcologies[0].FSIntellectualDependency >= V.FSLockinLevel * 0.6) {
		titles.push("Shepherd of the Slow");
	} else if (V.arcologies[0].FSIntellectualDependency >= V.FSLockinLevel * 0.3) {
		titles.push("Lover of Bimbos");
	}

	if (V.arcologies[0].FSSlaveProfessionalism >= V.FSLockinLevel * 0.9) {
		titles.push("the Mastermind");
	} else if (V.arcologies[0].FSSlaveProfessionalism >= V.FSLockinLevel * 0.6) {
		titles.push("the Genius");
	} else if (V.arcologies[0].FSSlaveProfessionalism >= V.FSLockinLevel * 0.3) {
		titles.push("the Smart");
	}

	if (V.arcologies[0].FSBodyPurist >= V.FSLockinLevel * 0.9) {
		titles.push("the Purifier of the Breasts");
	} else if (V.arcologies[0].FSBodyPurist >= V.FSLockinLevel * 0.6) {
		titles.push("the Discerning");
	} else if (V.arcologies[0].FSBodyPurist >= V.FSLockinLevel * 0.3) {
		titles.push("the Tasteful");
	}

	if (V.arcologies[0].FSAssetExpansionist >= V.FSLockinLevel * 0.9) {
		titles.push("the Expander of the Breasts");
	} else if (V.arcologies[0].FSAssetExpansionist >= V.FSLockinLevel * 0.6) {
		titles.push("the Expander");
	} else if (V.arcologies[0].FSAssetExpansionist >= V.FSLockinLevel * 0.3) {
		if (V.PC.title === 1) {
			titles.push("the Implanter");
		} else {
			titles.push("the Implantrix");
		}
	}

	if (V.arcologies[0].FSStatuesqueGlorification >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("He Who Stands Above All");
		} else {
			titles.push("She Who Stands Above All");
		}
	} else if (V.arcologies[0].FSStatuesqueGlorification >= V.FSLockinLevel * 0.6) {
		titles.push("Agent of Growth");
	} else if (V.arcologies[0].FSStatuesqueGlorification >= V.FSLockinLevel * 0.3) {
		titles.push("height fetishist");
	}

	if (V.arcologies[0].FSPetiteAdmiration >= V.FSLockinLevel * 0.9) {
		titles.push("Supporter of the Small");
	} else if (V.arcologies[0].FSPetiteAdmiration >= V.FSLockinLevel * 0.6) {
		titles.push("the Size Enthusiast");
	} else if (V.arcologies[0].FSPetiteAdmiration >= V.FSLockinLevel * 0.3) {
		titles.push("height fetishist");
	}

	if (V.arcologies[0].FSPastoralist >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("the Master of Stock");
		} else {
			titles.push("the Mistress of Stock");
		}
	} else if (V.arcologies[0].FSPastoralist >= V.FSLockinLevel * 0.6) {
		titles.push("the Rancher");
	} else if (V.arcologies[0].FSPastoralist >= V.FSLockinLevel * 0.3) {
		titles.push("the Farmer");
	}

	if (V.arcologies[0].FSPhysicalIdealist >= V.FSLockinLevel * 0.9) {
		titles.push("beloved of Brodin");
	} else if (V.arcologies[0].FSPhysicalIdealist >= V.FSLockinLevel * 0.6) {
		if (V.PC.title === 1) {
			titles.push("he of the godlike Body");
		} else {
			titles.push("she of the godlike Body");
		}
	} else if (V.arcologies[0].FSPhysicalIdealist >= V.FSLockinLevel * 0.3) {
		titles.push("advancer of Gains");
	}

	if (V.arcologies[0].FSHedonisticDecadence >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("Master of Softness");
		} else {
			titles.push("Lady of Softness");
		}
	} else if (V.arcologies[0].FSHedonisticDecadence >= V.FSLockinLevel * 0.6) {
		titles.push("Thickness Enthusiast");
	} else if (V.arcologies[0].FSHedonisticDecadence >= V.FSLockinLevel * 0.3) {
		titles.push("the Feeder");
	}

	if (V.arcologies[0].FSMaturityPreferentialist >= V.FSLockinLevel * 0.9) {
		titles.push("Grand Preserver of MILFS");
	} else if (V.arcologies[0].FSMaturityPreferentialist >= V.FSLockinLevel * 0.6) {
		titles.push("Fucker of MILFS");
	} else if (V.arcologies[0].FSMaturityPreferentialist >= V.FSLockinLevel * 0.3) {
		if (V.PC.title === 1) {
			titles.push("he of the notorious MILF preference");
		} else {
			titles.push("she of the notorious MILF preference");
		}
	}

	if (V.arcologies[0].FSYouthPreferentialist >= V.FSLockinLevel * 0.9) {
		titles.push("Keeper of the Magnificent Young Harem");
	} else if (V.arcologies[0].FSYouthPreferentialist >= V.FSLockinLevel * 0.6) {
		titles.push("Keeper of Virgins");
	} else if (V.arcologies[0].FSYouthPreferentialist >= V.FSLockinLevel * 0.3) {
		titles.push("the Virginbreaker");
	}

	if (V.arcologies[0].FSChattelReligionistLaw === 1) {
		titles.push("the Prophet");
	} else if (V.arcologies[0].FSChattelReligionist >= V.FSLockinLevel * 0.9) {
		titles.push("Keeper of the Blade and Chalice");
	} else if (V.arcologies[0].FSChattelReligionist >= V.FSLockinLevel * 0.6) {
		titles.push("Champion of the Faith");
	} else if (V.arcologies[0].FSChattelReligionist >= V.FSLockinLevel * 0.3) {
		titles.push("the Holy");
	}

	if (V.arcologies[0].FSRomanRevivalist >= V.FSLockinLevel * 0.9) {
		titles.push("First Consul");
	} else if (V.arcologies[0].FSRomanRevivalist >= V.FSLockinLevel * 0.6) {
		titles.push("Aedile");
	} else if (V.arcologies[0].FSRomanRevivalist >= V.FSLockinLevel * 0.3) {
		titles.push("Quaestor");
	}

	if (V.arcologies[0].FSNeoImperialist >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("Immortal Emperor");
		} else {
			titles.push("Immortal Empress");
		}
	} else if (V.arcologies[0].FSNeoImperialist >= V.FSLockinLevel * 0.6) {
		if (V.PC.title === 1) {
			titles.push("His Highness");
		} else {
			titles.push("Her Highness");
		}
	} else if (V.arcologies[0].FSNeoImperialist >= V.FSLockinLevel * 0.3) {
		if (V.PC.title === 1) {
			titles.push("Lord and Master");
		} else {
			titles.push("Lord and Mistress");
		}
	}

	if (V.arcologies[0].FSAztecRevivalist >= V.FSLockinLevel * 0.9) {
		titles.push("Tlatcani");
	} else if (V.arcologies[0].FSAztecRevivalist >= V.FSLockinLevel * 0.6) {
		titles.push("Cihuacoatl");
	} else if (V.arcologies[0].FSAztecRevivalist >= V.FSLockinLevel * 0.3) {
		titles.push("Tlatoani");
	}

	if (V.arcologies[0].FSEgyptianRevivalist >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("the Living God");
		} else {
			titles.push("the Living Goddess");
		}
	} else if (V.arcologies[0].FSEgyptianRevivalist >= V.FSLockinLevel * 0.6) {
		titles.push("Pharaoh");
	} else if (V.arcologies[0].FSEgyptianRevivalist >= V.FSLockinLevel * 0.3) {
		if (V.PC.title === 1) {
			titles.push("Prince of the Nile");
		} else {
			titles.push("Princess of the Nile");
		}
	}

	if (V.arcologies[0].FSEdoRevivalist >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("Emperor and Descendant of Amaterasu");
		} else {
			titles.push("Amaterasu Reborn");
		}
	} else if (V.arcologies[0].FSEdoRevivalist >= V.FSLockinLevel * 0.6) {
		titles.push("Shogun");
	} else if (V.arcologies[0].FSEdoRevivalist >= V.FSLockinLevel * 0.3) {
		titles.push("Daimyo");
	}

	if (V.arcologies[0].FSArabianRevivalist >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("Caliph");
		} else {
			titles.push("Handmaiden of Allah");
		}
	} else if (V.arcologies[0].FSArabianRevivalist >= V.FSLockinLevel * 0.6) {
		if (V.PC.title === 1) {
			titles.push("Sultan");
		} else {
			titles.push("Sultana");
		}
	} else if (V.arcologies[0].FSArabianRevivalist >= V.FSLockinLevel * 0.3) {
		titles.push("Beloved of Allah");
	}

	if (V.arcologies[0].FSChineseRevivalist >= V.FSLockinLevel * 0.9) {
		if (V.PC.title === 1) {
			titles.push("Emperor and Holder of the Mandate of Heaven");
		} else {
			titles.push("Empress and Holder of the Mandate of Heaven");
		}
	} else if (V.arcologies[0].FSChineseRevivalist >= V.FSLockinLevel * 0.6) {
		if (V.PC.title === 1) {
			titles.push("Emperor");
		} else {
			titles.push("Empress");
		}
	} else if (V.arcologies[0].FSChineseRevivalist >= V.FSLockinLevel * 0.3) {
		if (V.PC.title === 1) {
			titles.push("Governor of the Province");
		} else {
			titles.push("Governess of the Province");
		}
	}

	if (V.arcologies[0].FSAntebellumRevivalist >= V.FSLockinLevel * 0.9) {
		titles.push(`Reclaimer of the Cause and ${V.PC.title === 1 ? 'Lord' : 'Lady'} of ${V.arcologies[0].name}`);
	} else if (V.arcologies[0].FSAntebellumRevivalist >= V.FSLockinLevel * 0.6) {
		titles.push(`${V.PC.title === 1 ? 'Lord' : 'Lady'} of ${V.arcologies[0].name}`);
	} else if (V.arcologies[0].FSAntebellumRevivalist >= V.FSLockinLevel * 0.3) {
		titles.push(`${V.PC.title === 1 ? 'Son' : 'Daughter'} of the South`);
	}

	const facilities = App.Entity.facilities;
	if (facilities.brothel.employeesIDs().size >= 15) {
		if (V.PC.title === 1) {
			titles.push("Procurator of the Brothel");
		} else {
			titles.push("Procuratrix of the Brothel");
		}
	}

	if (facilities.club.employeesIDs().size >= 15) {
		titles.push("First on the Club");
	}
	if (facilities.dairy.employeesIDs().size >= 15) {
		titles.push("Keeper of the Cattle");
	}
	if (cumSlaves().length >= 15) {
		if (V.PC.title === 1) {
			titles.push("Extractor of the Ejaculate");
		} else {
			titles.push("Extractrix of the Ejaculate");
		}
	}
	if (facilities.servantsQuarters.employeesIDs().size >= 15) {
		if (V.PC.title === 1) {
			titles.push("Director of the Servants");
		} else {
			titles.push("Directrix of the Servants");
		}
	}
	if (facilities.schoolroom.employeesIDs().size >= 10) {
		if (V.PC.title === 1) {
			titles.push("Educator of the Slaves");
		} else {
			titles.push("Educatrix of the Slaves");
		}
	}
	if (facilities.spa.employeesIDs().size >= 10) {
		titles.push("Order of the Bath");
	}
	if (facilities.arcade.employeesIDs().size >= 15) {
		titles.push("Comptroller of the Arcade");
	}
	if (V.nurseryChildren >= 10) {
		titles.push("Caretaker of the Youth");
	}

	const schoolsPresent = [];
	const schoolsPerfected = [];
	for (const [school, obj] of App.Data.misc.schools) {
		if (V[school].schoolProsperity >= 10) {
			schoolsPerfected.push(obj.title);
		} else if (V[school].schoolPresent === 1) {
			schoolsPresent.push(obj.title);
		}
	}

	if (schoolsPerfected.length > 0) {
		titles.push(`${V.PC.title === 1 ? 'Benefactor' : 'Benefactrix'} of ${toSentence(schoolsPerfected)}`);
	}
	if (schoolsPresent.length > 0) {
		titles.push(`Supporter of ${toSentence(schoolsPresent)}`);
	}

	if (V.TFS.schoolProsperity >= 10) {
		titles.push("Honorary Sibling of the Futanari Sisters");
	} else if (V.TFS.schoolPresent === 1) {
		if (V.PC.title === 1) {
			titles.push("Protector of the Futanari Sisters");
		} else {
			titles.push("Protectrix of the Futanari Sisters");
		}
	}

	if (slaveCount() > 50) {
		if (V.PC.title === 1) {
			titles.push("Master of Slaves");
		} else {
			titles.push("Mistress of Slaves");
		}
	} else if (slaveCount() > 40) {
		titles.push("Holder of Slaves");
	} else if (slaveCount() > 30) {
		titles.push("Keeper of Slaves");
	} else if (slaveCount() > 20) {
		titles.push("Manager of Slaves");
	} else if (slaveCount() > 10) {
		titles.push("owner of slaves");
	}
	const corpValue = App.Corporate.calculateValue();
	if (corpValue > 500000) {
		titles.push("Corporate Titan");
	} else if (corpValue > 250000) {
		titles.push("corporate innovator");
	} else if (corpValue > 100000) {
		titles.push("corporate founder");
	} else if (corpValue > 0) {
		if (V.PC.title === 1) {
			titles.push("noted corporate businessman");
		} else {
			titles.push("noted corporate businesswoman");
		}
	}

	if (V.rep > 18000) {
		if (V.PC.title === 1) {
			titles.push("unquestioned Master of the Arcology");
		} else {
			titles.push("unquestioned Mistress of the Arcology");
		}
	} else if (V.rep > 15000) {
		if (V.PC.title === 1) {
			titles.push("Lord of the Arcology");
		} else {
			titles.push("Lady of the Arcology");
		}
	} else if (V.rep > 12000) {
		titles.push("Ruler of the Arcology");
	} else if (V.rep > 9000) {
		titles.push("chief officer of the arcology");
	} else {
		titles.push("owner of the arcology");
	}

	return toSentence(titles);
};

/**
 * @param {string|Array<string>} input
 * @param {number} [increase=1]
 * @returns {string}
 */
globalThis.IncreasePCSkills = function(input, increase = 1) {
	if (Array.isArray(input)) {
		return input.reduce((r, inputArray) => r + IncreasePCSkills(inputArray, increase), '');
	}
	const player = V.PC;
	const oldSkill = player.skill[input];
	player.skill[input] = Math.clamp(player.skill[input] + increase, -100, 100);
	let t = ``;

	if (oldSkill < 10 && player.skill[input] >= 10) {
		t += ` <span class="green">You have gained basic knowledge in ${input}.</span>`;
	} else if (oldSkill < 30 && player.skill[input] >= 30) {
		t += ` <span class="green">You have gained some knowledge in ${input}.</span>`;
	} else if (oldSkill < 60 && player.skill[input] >= 60) {
		t += ` <span class="green">You have become an expert in ${input}.</span>`;
	} else if (oldSkill < 100 && player.skill[input] >= 100) {
		t += ` <span class="green">You have mastered ${input}.</span>`;
	}
	return t;
};

/** Returns if the player is on mandatory bedrest.
 * If player still conducts business or is completely disabled is controlled by 'workingFromBed'
 * @param {FC.PlayerState} actor
 * @param {boolean} workingFromBed
 * @returns {boolean}
 */
globalThis.onBedRest = function(actor, workingFromBed = false) {
	// consider player injuries in the future!
	if (!actor) {
		return null;
	} else if (actor.majorInjury > 0) {
		return true;
	} else if (actor.health.condition < -90) {
		return true;
	} else if (!isMovable(actor) && !workingFromBed) {
		return true;
	} else if (isTrapped(actor) && !workingFromBed) {
		return true;
	} else if (actor.preg > actor.pregData.normalBirth / 1.05 && actor.pregControl !== "labor suppressors") { // consider if the player should be able to ignore contractions
		return true;
	} else if (actor.womb.find((ft) => ft.genetics.geneticQuirks.polyhydramnios === 2 && ft.age >= 20) && !workingFromBed) {
		return true;
	} else if (actor.bellyPreg >= actor.pregAdaptation * 2200 && actor.geneMods.progenitor !== 1 && !workingFromBed) {
		return true;
	} else if (isInduced(actor)) {
		return true;
	} else if (actor.geneMods.rapidCellGrowth !== 1 && actor.bellyPreg >= 100000 && actor.belly > (actor.pregAdaptation * 3200) && (actor.bellyPreg >= 500000 || actor.wombImplant !== "restraint")) {
		return true;
	}
	return false;
};

/** Returns if the player is able to move via wheelchair.
 * Consider moving this to encompass slaves in the future.
 * Ridiculously far future proofing.
 * @param {FC.PlayerState} actor
 * @returns {boolean}
 */
globalThis.isMovable = function(actor) {
	if (!actor) {
		return null;
	} else if (canMove(actor)) {
		return true;
	} else if (actor.boobs >= 1500000) {
		return false;
	} else if (actor.balls >= 160) {
		return false;
	} else if (actor.belly >= 1100000) {
		return false;
	} else if (actor.weight >= 300) {
		return false;
	}
	return true;
};

/** Returns if the player has grown so large they no longer can leave their bedroom.
 * Slaves can force their way. (add health drop for this!)
 * @param {FC.PlayerState} actor
 * @returns {boolean}
 */
globalThis.isTrapped = function(actor) {
	if (!actor) {
		return null;
	} else if (V.buttAccessibility === 1 || V.pregAccessibility === 1 || V.ballsAccessibility === 1 || V.boobAccessibility === 1) {
		return false;
	} else if (actor.boobsImplant >= 600000 || actor.boobs >= 1000000) {
		return true;
	} else if (actor.belly >= 800000) {
		return true;
	} else if (actor.dick >= 100) {
		return true;
	} else if (actor.balls >= 100) {
		return true;
	} else if (actor.buttImplant >= 30) {
		return true;
	}
	return false;
};

/** How badly hindered is the player? Stacks from various sources up until a 75% reduction in your ability to do business.
 * You have to seriously try to fuck yourself up that badly; just stacking basic hindrances will only get you to 50%.
 * This probably still needs more adjustments.
 * @param {FC.HumanState} actor
 * @param {boolean} sexyTime
 * @returns {number}
 */
globalThis.isHinderedDegree = function(actor, sexyTime = false) {
	let mult = 1;
	const averageHeight = Height.mean(actor);
	const estimatedSackSag = ballsToCM(actor.balls) * .8 * (1 + ((actor.scrotum - actor.balls) * .5));
	// player exclusives
	const pc = asPlayer(actor);
	if (!pc) {
		return mult;
	}
	// PC on bedrest plans to work from home.
	if (onBedRest(pc) && !sexyTime) { // And since the player only takes a limited number of clients while whoring, this shouldn't affect it.
		return .5;
	} else if (pc.physicalImpairment !== 0) {
		mult -= .3;
	// } else if (actor.energy > 95 || actor.need > 0) {
	//	return true;
	}
	// not really worrying about this for now
	if (!isQuadrupedal(pc) && hasAnyQuadrupedLegs(pc)) {
		mult -= .2;
	} else if (hasBothQuadrupedLegs(pc) && !hasBothQuadrupedArms(pc)) {
		mult -= .1;
	} else if (!hasBothQuadrupedLegs(pc) && hasAnyQuadrupedLegs(pc) && !hasBothQuadrupedArms(pc) && hasAnyQuadrupedArms(pc)) {
		mult -= .3;
	}
	// Not having to walk drastically affects how much assets are a hindrance
	if (!canWalk(pc)) {
		mult -= .1; // Of course, not being able to walk is also a hindrance
		if (pc.belly >= 60000 || pc.belly >= 60000 / (1 + Math.pow(Math.E, -0.4 * (pc.physicalAge - 14))) || pc.belly >= Math.max(10000, ((12500 / 19) * pc.height) - (1172500 / 19))) {
			mult -= .1;
		}
		if (V.pregAccessibility === 1) {
			if (pc.belly >= 1000000) {
				mult -= .1;
			} else if (pc.belly >= 500000) {
				mult -= .05;
			}
		} else {
			if (pc.belly >= 1000000) {
				mult -= .25;
			} else if (pc.belly >= 750000) {
				mult -= .2;
			} else if (pc.belly >= 500000) {
				mult -= .15;
			} else if (pc.belly >= 250000) {
				mult -= .1;
			} else if (pc.belly >= 100000) {
				mult -= .05;
			}
		}
		// Assets do not hinder prostitutes
		if (!sexyTime) {
			if (pc.muscles > 95 && pc.height <= (averageHeight + 10)) {
				mult -= .05;
			} else if (pc.muscles < -95) {
				mult -= .3;
			} else if (pc.muscles < -60) {
				mult -= .1;
			} else if (pc.muscles < -30) {
				mult -= .05;
			}
			if (pc.weight >= 190) {
				mult -= .05;
			}
			if (pc.boobs > 5000) {
				mult -= .1;
			}
			if (V.boobAccessibility === 1) {
				if (pc.boobs > 75000) {
					mult -= .1;
				}
			} else {
				if (pc.boobs > 75000) {
					mult -= .2;
				} else if (pc.boobs > 50000) {
					mult -= .15;
				} else if (pc.boobs > 25000) {
					mult -= .1;
				}
			}
			if (pc.balls >= 14) {
				mult -= .1;
			}
			if (V.ballsAccessibility === 1) {
				if (estimatedSackSag > (pc.height / 2)) {
					mult -= .05;
				}
			} else {
				if (estimatedSackSag > (pc.height / 2)) {
					mult -= .1;
				}
			}
			if (pc.hips > 2) {
				mult -= .1;
			}
			if (pc.butt > 6) {
				mult -= .1;
			}
			if (V.buttAccessibility === 1) {
				if (pc.butt > 15) {
					mult -= .05;
				}
			} else {
				if (pc.butt > 15) {
					mult -= .1;
				}
			}
		}
	} else {
		if (pc.belly >= 60000 || pc.belly >= 60000 / (1 + Math.pow(Math.E, -0.4 * (pc.physicalAge - 14))) || pc.belly >= Math.max(10000, ((12500 / 19) * pc.height) - (1172500 / 19))) {
			mult -= .1;
		}
		if (V.pregAccessibility === 1) {
			if (pc.belly >= 1000000) {
				mult -= .2;
			} else if (pc.belly >= 500000) {
				mult -= .1;
			}
		} else {
			if (pc.belly >= 1000000) {
				mult -= .5;
			} else if (pc.belly >= 750000) {
				mult -= .4;
			} else if (pc.belly >= 500000) {
				mult -= .3;
			} else if (pc.belly >= 250000) {
				mult -= .2;
			} else if (pc.belly >= 100000) {
				mult -= .1;
			}
		}
		// Assets do not hinder prostitutes
		if (!sexyTime) {
			if (pc.muscles > 95 && pc.height <= (averageHeight + 10)) {
				mult -= .1;
			} else if (pc.muscles < -95) {
				mult -= .7;
			} else if (pc.muscles < -60) {
				mult -= .5;
			} else if (pc.muscles < -30) {
				mult -= .2;
			}
			if (pc.weight >= 130 || (pc.weight >= 95 + ((pc.physicalAge - 9) * 5))) {
				mult -= .1;
			}
			if (pc.boobs > 5000) {
				mult -= .1;
			}
			if (V.boobAccessibility === 1) {
				if (pc.boobs > 75000) {
					mult -= .15;
				} else if (pc.boobs > 50000) {
					mult -= .1;
				}
			} else {
				if (pc.boobs > 75000) {
					mult -= .6;
				} else if (pc.boobs > 50000) {
					mult -= .4;
				} else if (pc.boobs > 25000) {
					mult -= .2;
				} else if (pc.boobs > 10000) {
					mult -= .1;
				}
			}
			if (pc.balls >= 14) {
				mult -= .1;
			}
			if (V.ballsAccessibility === 1) {
				if (estimatedSackSag > (pc.height / 2)) {
					mult -= .15;
				} else if (estimatedSackSag >= (pc.height / 2) - 10) {
					mult -= .1;
				} else if (estimatedSackSag >= (pc.height / 4)) {
					mult -= .05;
				}
			} else {
				if (estimatedSackSag > (pc.height / 2)) {
					mult -= .2;
				} else if (estimatedSackSag >= (pc.height / 2) - 10) {
					mult -= .15;
				} else if (estimatedSackSag >= (pc.height / 4)) {
					mult -= .1;
				}
			}
			if (pc.hips > 2) {
				mult -= .1;
			}
			if (pc.butt > 6) {
				mult -= .1;
			}
			if (V.buttAccessibility === 1) {
				if (pc.butt > 15) {
					mult -= .1;
				}
			} else {
				if (pc.butt > 15) {
					mult -= .2;
				} else if (pc.butt > 10) {
					mult -= .1;
				}
			}
		}
	}
	if (sexyTime) { // But they do get tired
		if (pc.muscles < -95) {
			mult -= .7;
		} else if (pc.muscles < -60) {
			mult -= .3;
		} else if (pc.muscles < -30) {
			mult -= .1;
		}
		if (pc.weight >= 130 || (pc.weight >= 95 + ((pc.physicalAge - 9) * 5))) {
			mult -= .2;
		}
	}
	return Math.max(.25, mult);
};

/** For event consistency. Returns the expected state of the player on the sidebar if debug mode is on.
 * @param {FC.PlayerState} actor
 * @returns {string}
 */
globalThis.playerConsistencyCheck = function(actor = V.PC) {
	let r;
	if (onBedRest(actor)) {
		if (onBedRest(actor, true)) {
			if (!isMovable(actor)) {
				return "Bedbound";
			} else if (isTrapped(actor)) {
				r = "Roombound";
				if (!canWalk(actor)) {
					r += "+Wheelchair";
				}
				if (isHindered(actor)) {
					r += "+Hindered";
				}
				return r;
			} else {
				r = "Bedrest";
				if (!canWalk(actor)) {
					r += "+Wheelchair";
				}
				if (isHindered(actor)) {
					r += "+Hindered";
				}
				return r;
			}
		} else {
			return "Incapacitated";
		}
	} else if (!canWalk(actor)) {
		r = "Wheelchair";
		if (isHindered(actor)) {
			r += "+Hindered";
		}
		return r;
	} else if (isHindered(actor)) {
		return "Hindered";
	} else {
		return "Unhindered";
	}
};

/** Returns if the player can eat solid food.
 * Consider moving this to encompass slaves in the future.
 * @param {FC.PlayerState} actor
 * @returns {boolean}
 */
globalThis.canEatFood = function(actor) {
	if (!actor) {
		return null;
	} else if (actor.digestiveSystem === "atrophied") {
		return false;
	} else if (actor.mpreg > 0) {
		return false;
	} else if (actor.cervixImplant >= 2) {
		return false;
	}
	return true;
};

/** Returns if the player is thinking with their genitals.
 * Mainly for use in events and personal attention.
 * Intended to allow ravishing a slave to give you mental clarity at the cost of making the problem worse in the long run.
 * @param {FC.PlayerState} actor
 * @returns {boolean}
 */
globalThis.isPlayerLusting = function(actor = V.PC) {
	if (isHorny(actor) || actor.lusty) {
		if (getPersonalAttention(null, "ravish") || getPersonalAttention(null, "ravished")) {
			return false;
		} else {
			return true;
		}
	}
	return false;
};

/**
 * Param takes "classic" PC careers, and then function checks data to see if PC has that classic career or a 4.0 equivalent.
 * @param {"wealth"|"escort"|"servant"|"gang"|"BlackHat"|"capitalist"|"mercenary"|"engineer"|"medicine"|"slaver"|"celebrity"|"arcology owner"} category
 * @returns {boolean}
 */
globalThis.isPCCareerInCategory = function(category) {
	try {
		return Object.values(App.Data.player.career.get(category)).includes(V.PC.career);
	} catch {
		console.log(`"${category}" not found in App.Data.player.career`);
		return false;
	}
};

/** Identifies which "tier" a particular career is in
 * @param {string} [career]
 * @returns {"master" | "apprentice" | "child"}
 */
globalThis.PCCareerTier = function(career = V.PC.career) {
	/** @type {("master" | "apprentice" | "child")[]} */
	const tiers = ["master", "apprentice", "child"];
	const careerGroups = Array.from(App.Data.player.career.values());
	for (const grp of careerGroups) {
		for (const tier of tiers) {
			if (grp[tier] === career) {
				return tier;
			}
		}
	}
	console.log(`"${career}" not found in App.Data.player.career`);
	return "master";
};

/** Identifies which category the PC's career is in
 * @param {string} [career]
 * @returns {string}
 */
globalThis.PCCareerCategory = function(career = V.PC.career) {
	for (const [category, group] of App.Data.player.career) {
		if (Object.values(group).includes(career)) {
			return category;
		}
	}
	console.log(`"${career}" not found in App.Data.player.career`);
	return career;
};

/** Returns warning text for the player being penetrated and also warns about losing virginities.
 * @param {string} [holes = "vaginal first"] (vaginal | anal | both | either | vaginal first)
 * @param {boolean} [escape = false] (true | false) is there a way to escape the penetration or it is unavoidable
 * @returns {string}
 */
globalThis.PCPenetrationWarning = function(holes = "vaginal first", escape = false) {
	let targets = [];
	let virgins = [];
	let result = "";
	let action = escape ? "can" : "will";
	if (holes === "vaginal" || holes === "both" || holes === "either" || holes === "vaginal first") {
		if (V.PC.vagina >= 0) {
			targets.push("vagina");
			if (V.PC.vagina === 0) {
				virgins.push("vaginal");
			}
		}
	}
	if (holes === "anal" || holes === "both" || holes === "either" || (holes === "vaginal first" && targets.length === 0)) {
		if (V.PC.anus >= 0) {
			targets.push("anus");
			if (V.PC.anus === 0) {
				virgins.push("anal");
			}
		}
	}
	if (targets.length === 0) {
		return result;
	} else if (targets.length === 2) {
		if (holes === "either") {
			result = `This option ${action} penetrate your vagina or anus.`;
		} else {
			result = `This option ${action} penetrate your vagina and anus.`;
		}
	} else {
		result = `This option ${action} penetrate your ${targets[0]}.`;
	}
	if (virgins.length === 0) {
		return result;
	} else if (virgins.length === 2) {
		if (holes === "either") {
			result += `WARNING# This option ${action} take your vaginal or anal virginities.`;
		} else {
			result += `WARNING# This option ${action} take your vaginal and anal virginities.`;
		}
	} else {
		result += `WARNING# This option ${action} take your ${virgins[0]} virginity.`;
	}
	return result;
};

/** Returns "true" if the player can be receptive to penetration, even if the sexualOpenness policy is not adopted. This function should only be used to offer options to the player, it does not imply true willingness.
 * @param {any} [penetrator = null]  If a slave is passed as an argument, it also takes into account if slave.toyHole is "dick".
 * @returns {boolean}
 */
globalThis.isPlayerReceptive = function(penetrator = null) {
	if (penetrator && penetrator.toyHole && penetrator.toyHole === "dick") {
		return true; // if argument is passed, it is a slave and toyHole is dick
	} else if (V.policies.sexualOpenness === 1) {
		return true; // penetrative campaign
	} else if (V.PC.drugs.includes("fertility") || V.PC.diet.includes("fertility") || V.PC.refreshment.includes("fertility")) {
		return true; // PC wants to be pregnant, even if not fertile
	} else if (
		getSlaves().filter(s => s.toyHole === "dick").size * 4 > getSlaves().filter(s => s.dick > 0).size ||
		getSlaves().filter(s => s.toyHole === "dick").size * 10 > slaveCount() ||
		getSlaves().filter(s => s.toyHole === "dick").size >= 8
	) {
		return true; // at least 8 slaves, or 25% of the slaves with penises, or 10% of all the slaves, have dick as toyHole
	} else if (V.PC.counter.anal * 2 > V.week) {
		return true; // player is used to anal penetration
	/** } else if (V.PC.counter.vaginal * 2 V.week) {
		return true; // vaginal isn't only increased by penetration, but it's also increased by tribbing and cunnilingus */
	} else if (isPlayerLusting() && (V.PC.anus > 0 || V.PC.vagina > 0)) {
		return true; // player needs sex and has some penetrative experience
	} else if (V.PC.preg > V.PC.pregData.normalBirth / 2 && V.PC.pregMood === 2) {
		return true; // player's pregnancy increases libido
	} else if (isFertile(V.PC) && V.PC.forcedFertDrugs > 0) {
		return true; // forcedFertDrugs influence the behavior of the player, who unconsciously wants to be fertilized
	}
	return false;
};

/** Determine if the player favors masturbation over sex.
 * Currently not used much, but will be used more with the addition of new .pregMoods
 * @returns {boolean}
 */
globalThis.isPlayerFrigid = function() {
	if (V.PC.diet === PCDiet.WEANING) {
		return true;
	} else if (V.PC.preg < -3) { // < -2? Does it start at 4 or 3 at first week start?
		return true;
	} else if (V.PC.preg > V.PC.pregData.normalBirth / 2 && V.PC.pregMood === 2) {
		return false;
	} else if (V.PC.energy === 0) {
		return true;
	}
	return false;
};

/** Returns the value of bad rumors circulating about the player, of a specific type or the overall weighted value.
 * * 0: no rumors
 * * 1 - 10: occasional whispers
 * * 11	- 25: minor rumors
 * * 26	- 50: rumors
 * * 51	- 75: bad rumors
 * * 70	- 100: severe rumors
 * * 101+: life ruining rumors
 * @param {"penetrative" | "birth" | "weakness" | "all"} rumorType
 * @returns {number}
 */
globalThis.getRumors = function(rumorType = "all") {
	let result = {
		penetrative: V.PC.badRumors.penetrative,
		birth: V.PC.badRumors.birth,
		weakness: V.PC.badRumors.weakness,
	};
	if (V.PC.counter.raped > 0) { // rapes are everlasting weakness rumors
		result.weakness += Math.min(V.PC.counter.raped, 10);
		if (V.PC.counter.raped > 10) {
			result.weakness += Math.sqrt(V.PC.counter.raped - 10);
		}
		result.weakness = Math.floor(result.weakness);
	}
	if (V.policies.sexualOpenness === 1 || V.arcologies[0].FSChattelReligionistLaw === 1 || V.arcologies[0].FSRestartDecoration > 99) {
		result.penetrative = 0;
	}
	if ((rumorType === "weakness" || rumorType === "all") && result.weakness > 0) {
		result.weakness = 1 + Math.round((result.weakness - 1) * 0.5); // weakness is not as devastating as other bad rumors.
		if (result.penetrative + result.birth > 20) {
			result.weakness = Math.round(result.weakness * 0.66); // other rumors downplay the impact of weakness ones.
		}
	}
	return rumorType === "all" ? result.penetrative + result.birth + result.weakness : result[rumorType];
};

/** Records possible harmful rumors about the player. */
globalThis.newRumor = (function() {
	return {
		penetrative: penetrated,
		birth: miscegenated,
		weakness: weak,
		// other: other,
	};

	/** Records rumors about the player being penetrated by a slave, if applicable, and returns a warning text in that case.
	 * @param {FC.SlaveState} slave - penetrator
	 * @param {number} strength - multiplier, defaults to 1
	 * @returns {string}
	 */
	function penetrated(slave = undefined, strength = 1) {
		if (V.policies.sexualOpenness === 1 || V.arcologies[0].FSChattelReligionistLaw === 1 || V.arcologies[0].FSRestartDecoration > 99 || (V.arcologies[0].FSRepopulationFocus >= 60 && (canGetPregnant(V.PC) || V.PC.preg.isBetween(0, 11)))) {
			return "";
		}
		let acceptance = 0;
		if (!slave || !asSlave(slave)) {
			acceptance = penetrativeSocialUse();
		} else {
			acceptance = penetrativeSocialUse(slave);
		}
		if (acceptance > 70) {
			return "";
		} else if (acceptance > 40) {
			let luck = 70 - jsRandom(40, acceptance); // from 1 to 30
			strength = Math.round(strength / 30 * luck); // the higher the acceptance, the highest chance of stength being 0
			if (strength === 0) {
				return "";
			}
		}
		V.PC.badRumors.penetrative = Math.round(V.PC.badRumors.penetrative + strength);
		return `Rumors spread that you <span class="warning">enjoy taking it from slaves.</span>`;
	}

	/** Records the displeasure of the society over the fact that the player gave birth to babies of slaves or miscegenated. Call only once per birth. It returns nothing.
	 * @param {number} strength - multiplier, defaults to 1
	 */
	function miscegenated(strength = 10) {
		if (V.arcologies[0].FSChattelReligionistLaw === 1) { // society accepts the acts of the prophet
			return;
		}
		let weight = FutureSocieties.isActive("FSRepopulationFocus") && V.arcologies[0].FSRepopulationFocus > 99 ? .1 : 2;
		let impregnator = findFather(V.PC.pregSource);
		if (FutureSocieties.isActive('FSSupremacist') && impregnator.race !== V.arcologies[0].FSSupremacistRace) {
			weight += 1;
		}
		if (FutureSocieties.isActive('FSSubjugationist') && impregnator.race === V.arcologies[0].FSSubjugationistRace) {
			weight += 5;
		}
		V.PC.badRumors.birth = Math.round(V.PC.badRumors.birth + weight * strength);
	}

	/** Records rumors about the player having a weak character to impose himself on his slaves.
	 * @param {number} strength - multiplier, defaults to 1
	 * @returns {string}
	 */
	function weak(strength = 1) {
		let luck = Math.min(V.rep > 7000 ? 1 : (jsRandom(1, V.rep) / 4000), 1) - (FutureSocieties.isActive("FSPaternalist") && jsRandom(0, V.arcologies[0].FSPaternalist) > 50 ? 1 : 0) + (FutureSocieties.isActive("FSDegradationist") && jsRandom(0, V.arcologies[0].FSDegradationist) > 50 ? 1 : 0);
		luck = Math.max(luck, 0);
		strength = Math.round(luck * strength);
		V.PC.badRumors.weakness += strength;
		return strength > 0 ? `Rumors spread that <span class="warning">you are not able to impose yourself on your slaves.</span>` : "";
	}
})();

/** Softens harmful rumors about the player. */
globalThis.softenRumors = (function() {
	return {
		penetrative: penetrated,
		birth: miscegenated,
		weakness: weak,
		// other: other,
		all: all,
	};

	/** Softens rumors about the player being penetrated by slaves.
	 * @param {number} strength - multiplier, defaults to 1
	 */
	function penetrated(strength = 1) {
		if (V.policies.sexualOpenness === 1 || V.arcologies[0].FSChattelReligionistLaw === 1 || V.arcologies[0].FSRestartDecoration > 99) {
			V.PC.badRumors.penetrative = 0;
			return;
		}
		if (V.PC.badRumors.penetrative <= 1) {
			return;
		}
		if (V.arcologies[0].FSRepopulationFocus > 60 && (canGetPregnant(V.PC) || V.PC.preg.isBetween(0, 11))) {
			if (V.PC.badRumors.penetrative > 5 * strength) {
				V.PC.badRumors.penetrative -= 5 * strength;
			} else {
				V.PC.badRumors.penetrative = 1;
			}
		}
		if (V.PC.badRumors.penetrative <= strength) {
			strength = V.PC.badRumors.penetrative - 1;
		}
		if (V.PC.badRumors.penetrative > Math.max(10, strength)) {
			V.PC.badRumors.penetrative -= strength;
			if (V.PC.badRumors.penetrative > Math.max(20, strength) && penetrativeSocialUse() > 75) {
				V.PC.badRumors.penetrative -= [0, 0, 1].random();
			}
		} else if (V.PC.badRumors.penetrative > 1 && (jsRandom(0, 10 + penetrativeSocialUse()) > 20)) { //intended: doesn't go below 10 if there isn't a minimum social acceptance of penetration.
			V.PC.badRumors.penetrative -= Math.min(strength, V.PC.badRumors.penetrative - 1);
		}
	}

	/** Softens rumors about unpopular births by the player.
	 * @param {number} strength - multiplier, defaults to 1
	 */
	function miscegenated(strength = 1) {
		if (V.arcologies[0].FSChattelReligionistLaw === 1) {
			if (V.PC.badRumors.birth > 10) { // implies baby born before the player became the prophet
				V.PC.badRumors.birth = Math.round(V.PC.badRumors.birth / 2);
			} else {
				V.PC.badRumors.birth =  0;
			}
			return;
		}
		if (V.PC.badRumors.birth > 1) {
			let luck = 3 + (FutureSocieties.isActive("FSRestart") || FutureSocieties.isActive("FSSubjugationist") || FutureSocieties.isActive("FSSupremacist") ? 1 : 0);
			V.PC.badRumors.birth -= jsRandom(0, luck) < 3 ? Math.min(strength, V.PC.badRumors.birth - 1) : 0;
		}
	}

	/** Softens rumors about the player's weakness of character.
	 * @param {number} strength - multiplier, defaults to 1
	 */
	function weak(strength = 1) {
		let luck = 1 + Math.floor(V.rep / 7000); // the higher the reputation, less chances of reducing rumors since society expects more authority of the player
		if (V.PC.badRumors.weakness > 1 && jsRandom(0, luck) <= 1) {
			V.PC.badRumors.weakness - Math.min(strength, V.PC.badRumors.weakness - 1);
		}
	}

	/** Softens all rumors about the player.
	 * @param {number} strength - multiplier, defaults to 1
	 */
	function all(strength = 1) {
		penetrated(strength);
		miscegenated(strength);
		weak(strength);
	}
})();

/**
 * Check which of their own holes the player prefers
 * @returns {"vagina" | "anus"}
 */
globalThis.getPCPreferredHole = function() {
	if (V.PC.vagina > -1 && V.PC.preferredHole !== 0) {
		if (V.PC.preferredHole === -1) {
			const choices = [];
			// low chance of virgin hole (1 in 11) being chosen if a non virgin hole exists
			// 50/50 if both holes are virgin or both holes have had their cherries popped
			if (V.PC.vagina === 0) {
				choices.push("vagina");
			} else {
				choices.push(
					"vagina", "vagina", "vagina", "vagina", "vagina",
					"vagina", "vagina", "vagina", "vagina", "vagina",
				);
			}
			if (V.PC.anus === 0) {
				choices.push("anus");
			} else {
				choices.push(
					"anus", "anus", "anus", "anus", "anus",
					"anus", "anus", "anus", "anus", "anus",
				);
			}
			return /** @type {"vagina" | "anus"} */ (choices.random());
		}
		return "vagina";
	} else {
		return "anus";
	}
};
