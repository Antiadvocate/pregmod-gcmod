App.PersonalAttention.reset = function() {
	if (V.PC.health.condition < -20 || V.PC.health.illness > 1 || onBedRest(V.PC, true)) {
		V.personalAttention = {task: PersonalAttention.RELAX};
	} else if (isHorny(V.PC)) {
		V.personalAttention = {task: PersonalAttention.SEX};
	} else if (isPCCareerInCategory("escort")) {
		V.personalAttention = {task: PersonalAttention.WHORING};
	} else if (isPCCareerInCategory("servant")) {
		V.personalAttention = {task: PersonalAttention.MAID};
	} else {
		V.personalAttention = {task: PersonalAttention.BUSINESS};
	}
};

/**
 * @template {string} In
 * @param {In} input
 * @returns {FC.PersonalAttentionTrainingObjective|In}
 */
App.PersonalAttention.update = function(input) {
	switch (input) {
		case "soften her behavioral flaw":
			return "soften behavioral flaw";
		case "fix her behavioral flaw":
			return "fix behavioral flaw";
		case "soften her sexual flaw":
			return "soften sexual flaw";
		case "fix her sexual flaw":
			return "fix sexual flaw";
		case "break her will":
			return "break will";
		case "harshly break her will":
			return "harshly break will";
		case "build her devotion":
			return "build devotion";
		case "look after her health":
			return "health";
		case "teach her":
			return "learn skills";
		case "train her":
			return "combat training";
		case "spar with her":
			return "spar";
		case "explore her sexuality":
			return "explore sexuality";
		case "manage your libido":
			return "ravish";
		case "sate your lust":
			return "ravished";
		case "torture her":
			return "torture";
	}
	// settings for inducing flaws/paraphilias are unchanged
	return input;
};

/**
	* @param {FC.PersonalAttentionTrainingObjective} objective
	* @param {FC.SlaveState} slave
	* @returns {string}
	*/
App.PersonalAttention.getText = function(objective, slave) {
	const {his, him} = getPronouns(slave);
	switch (objective) {
		case "soften behavioral flaw":
			return `soften ${his} behavioral flaw`;
		case "fix behavioral flaw":
			return `fix ${his} behavioral flaw`;
		case "soften sexual flaw":
			return `soften ${his} sexual flaw`;
		case "fix sexual flaw":
			if (App.Data.misc.paraphiliaList.includes(slave.sexualFlaw)) {
				return `remove ${his} paraphilia`;
			} else {
				return `fix ${his} sexual flaw`;
			}
		case "break will":
			return `break ${his} will`;
		case "harshly break will":
			return `harshly break ${his} will`;
		case "build devotion":
			return `build ${his} devotion`;
		case "health":
			return `look after ${his} health`;
		case "learn skills":
			return `teach ${him}`;
		case "combat training":
			return `teach ${him} combat`;
		case "spar":
			return `spar with ${him}`;
		case "explore sexuality":
			return `explore ${his} sexuality`;
		case "ravish":
			return `manage your libido`;
		case "ravished":
			return `sate your lust`;
		case "torture":
			return `torture ${him}`;
	}
	// settings for inducing flaws/paraphilias can be printed as-is
	return objective;
};

/**
 * @param {FC.HumanID} ID
 * @param {FC.PersonalAttentionTrainingObjective} objective
 * @returns {boolean}
 */
globalThis.getPersonalAttention = function(ID, objective = null) {
	const tasks = ["soften behavioral flaw", "fix behavioral flaw", "soften sexual flaw", "fix sexual flaw", "break will", "harshly break will", "build devotion", "health", "learn skills", "combat training", "spar", "explore sexuality"]; // Not counting rutting and torture as training.
	if (typeof V.personalAttention.slaves === "undefined") {
		return false;
	} else if (!ID) {
		if (!objective) {
			return false;
		} else if (objective === "training") {
			return (tasks.includes(V.personalAttention.slaves[0].objective) || tasks.includes(V.personalAttention.slaves[1]?.objective));
		} else {
			return (V.personalAttention.slaves[0].objective === objective || V.personalAttention.slaves[1]?.objective === objective);
		}
	} else {
		if (!objective) {
			return (V.personalAttention.slaves[0].ID === ID || V.personalAttention.slaves[1]?.ID === ID);
		} else if (objective === "training") {
			return ((V.personalAttention.slaves[0].ID === ID && tasks.includes(V.personalAttention.slaves[0].objective)) || (V.personalAttention.slaves[1]?.ID === ID && tasks.includes(V.personalAttention.slaves[1]?.objective)));
		} else {
			return ((V.personalAttention.slaves[0].ID === ID && V.personalAttention.slaves[0].objective === objective) || (V.personalAttention.slaves[1]?.ID === ID && V.personalAttention.slaves[1]?.objective === objective));
		}
	}
};

/**
 * @param {FC.HumanID} ID
 * @returns {"none" | FC.PersonalAttentionTrainingObjective}
 */
globalThis.getPersonalAttentionType = function(ID) {
	if (typeof V.personalAttention.slaves === "undefined") {
		return "none";
	} else {
		if (V.personalAttention.slaves[0].ID === ID) {
			return V.personalAttention.slaves[0].objective;
		} else if (V.personalAttention.slaves[1]?.ID === ID) {
			return V.personalAttention.slaves[1].objective;
		}
	}
	return "none";
};

/** @returns {boolean} */
globalThis.getSharedPersonalAttention = function() {
	if (typeof V.personalAttention.slaves === "undefined") {
		return false;
	} else {
		return V.personalAttention.slaves[0].objective === V.personalAttention.slaves[1]?.objective;
	}
};
