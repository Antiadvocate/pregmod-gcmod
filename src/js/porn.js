// cSpell:ignore maiesiophiliacs

/**
 * @typedef {object} PornGenreType
 * @property {number} focusedViewershipFactor
 * @property {number} unfocusedViewershipFactor
 * @property {number} viewershipSoakingFactor
 * @property {(slave: FC.SlaveState) => number} bonusViewership
 * @property {string} name
 */

/**
 * @typedef {object} PornGenre
 * @property {string} fameVar
 * @property {string} fameName
 * @property {string} focusName
 * @property {PornGenreType} type
 * @property {string} prestigeDesc1
 * @property {string} prestigeDesc2
 * @property {string} prestigeDesc3
 * @property {(slave: FC.SlaveState) => string} hitText
 * @property {(slave: FC.SlaveState) => string} trinketShotDesc
 * @property {(slave: FC.SlaveState) => boolean} valid
 * @property {() => string} uiName
 */

/** @type {{[key: string]: PornGenreType}} */
App.Porn.GenreType = {
	paraphilia: {
		focusedViewershipFactor: 1.5,
		unfocusedViewershipFactor: 0.5,
		viewershipSoakingFactor: 0.0,
		// eslint-disable-next-line jsdoc/require-jsdoc
		bonusViewership: function(slave) { return slave.fetishStrength * 2.0; },
		name: "paraphilia"
	},
	fetish: {
		focusedViewershipFactor: 2.0,
		unfocusedViewershipFactor: 0.5,
		viewershipSoakingFactor: 1.0,
		// eslint-disable-next-line jsdoc/require-jsdoc
		bonusViewership: function(slave) { return slave.fetishStrength; },
		name: "fetish"
	},
	general: {
		focusedViewershipFactor: 4.0,
		unfocusedViewershipFactor: 0.5,
		viewershipSoakingFactor: 1.0,
		// eslint-disable-next-line jsdoc/require-jsdoc
		bonusViewership: function(slave) { return 0.0; },
		name: "general"
	},
	quirk: {
		focusedViewershipFactor: 6.0,
		unfocusedViewershipFactor: 0.5,
		viewershipSoakingFactor: 1.0,
		// eslint-disable-next-line jsdoc/require-jsdoc
		bonusViewership: function(slave) { return 0.0; },
		name: "quirk"
	},
	generic: {
		focusedViewershipFactor: 5.0,
		unfocusedViewershipFactor: 1.0,
		viewershipSoakingFactor: 0.0,
		// eslint-disable-next-line jsdoc/require-jsdoc
		bonusViewership: function(slave) { return 0.0; },
		name: "generic"
	}
};

/** @type {{[key: string]: PornGenre}} */
App.Porn.Genre = {};

/* Paraphilia genres */

App.Porn.Genre.neglectful = {
	fameVar: "neglectful",
	fameName: "orgasm denial",
	focusName: "neglectful",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed the sight of $him ignoring $his own pleasure",
	prestigeDesc2: "$His many fans relish the sight of $him denying $himself pleasure",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him denying $himself pleasure",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} lack of interest in getting off ${getPronouns(slave).himself}, even when at the verge of climax, makes ${getPronouns(slave).him} a hit with viewers that enjoy orgasm denial.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} pleasing a line of partners without cumming once`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "neglectful"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.cumAddict = {
	fameVar: "cumAddict",
	fameName: "cum addiction",
	focusName: "cum addict",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed watching $him do anything and everything for cum",
	prestigeDesc2: "$His many fans relish the sight of $him doing anything for cum",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him doing anything for cum",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} complete obsession with cum makes ${getPronouns(slave).him} a hit with viewers that enjoy bukkake and cum drinking.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} bathing in a tub of cum`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "cum addict"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.fameName); }
};

App.Porn.Genre.analAddict = {
	fameVar: "analAddict",
	fameName: "anal addiction",
	focusName: "anal addict",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed watching $him do anything for a dick in $his ass",
	prestigeDesc2: "$His many fans relish the sight of $him doing anything for a dick up $his ass",
	prestigeDesc3: "Millions are intimately familiar with the sight of $his well-versed anus",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} complete obsession with taking things up ${getPronouns(slave).his} ass makes ${getPronouns(slave).him} a hit with viewers that enjoy hardcore anal.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} taking a series of huge cocks up ${getPronouns(slave).his} ass`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "anal addict" && canDoAnal(slave); },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.fameName); }
};

App.Porn.Genre.attentionWhore = {
	fameVar: "attentionWhore",
	fameName: "exhibition",
	focusName: "attention whore",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed watching $him do anything for attention",
	prestigeDesc2: "$His many fans relish the sight of $him doing anything for attention",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him doing anything for attention",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} complete obsession with being the center of attention makes ${getPronouns(slave).him} a hit with viewers that savor ${getPronouns(slave).his} frequent exhibitionism.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} flashing strangers`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "attention whore"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.breastGrowth = {
	fameVar: "breastGrowth",
	fameName: "breast expansion",
	focusName: "breast growth",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed charting the growth of $his breasts",
	prestigeDesc2: "$His many fans relish the sight of $his expanding bust",
	prestigeDesc3: "Millions are intimately familiar with the history of $his growing bust",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} complete obsession with the ever-increasing size of ${getPronouns(slave).his} tits makes ${getPronouns(slave).him} a hit with viewers that enjoy enormous knockers and breast expansion.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} having ${getPronouns(slave).his} tits measured`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "breast growth"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.abusive = {
	fameVar: "abusive",
	fameName: "abuse",
	focusName: "abusive",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed watching $him abuse others",
	prestigeDesc2: "$His many fans relish the sight of $him abusing others",
	prestigeDesc3: "Millions are intimately familiar with $his abusive tendencies",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} wanton enjoyment of pleasure through force amuses viewers that enjoy rape and abuse.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} taking what ${getPronouns(slave).he} wants by force`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "abusive"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.malicious = {
	fameVar: "malicious",
	fameName: "sexual torture",
	focusName: "malicious",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed $him getting off from the suffering $he caused",
	prestigeDesc2: "$His many fans relish the sight of $him getting off from the suffering $he caused",
	prestigeDesc3: "Millions are intimately familiar with $his hunger for making others suffer",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} sexual appetite for others' suffering makes ${getPronouns(slave).him} a hit with viewers that enjoy sadism and violence.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} tormenting ${getPronouns(slave).his} prey`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "malicious"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.selfHating = {
	fameVar: "selfHating",
	fameName: "self hating",
	focusName: "self hating",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed watching $him happily suffer",
	prestigeDesc2: "$His many fans relish $his suffering",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him suffering",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} complete disregard for ${getPronouns(slave).his} own wellbeing makes ${getPronouns(slave).him} a hit with viewers that enjoy watching ${getPronouns(slave).him} suffer.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} orgasming from pain`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "self hating"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.breeder = {
	fameVar: "breeder",
	fameName: "breeder",
	focusName: "breeder",
	type: App.Porn.GenreType.paraphilia,
	prestigeDesc1: "Thousands have enjoyed watching $him obsess over pumping out babies",
	prestigeDesc2: "$His many fans relish $his obsession with having children",
	prestigeDesc3: "Millions are intimately familiar with $his obsession with being pregnant",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} complete obsession with getting and staying pregnant makes ${getPronouns(slave).him} a hit with viewers with all manner of pregnancy fetish, but particularly resonates with those as focused on it as ${getPronouns(slave).he} is.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) {
		if (slave.counter.births > 0) {
			return `showing ${getPronouns(slave).him} having an orgasmic birth`;
		} else {
			return `showing ${getPronouns(slave).him} being bred`;
		}
	},
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualFlaw === "breeder"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

/* Fetish genres */

App.Porn.Genre.sub = {
	fameVar: "sub",
	fameName: "submissive",
	focusName: "submissive",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed $his submission",
	prestigeDesc2: "$His many fans relish $his submissiveness",
	prestigeDesc3: "Millions are intimately familiar with $his submissiveness",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} submissive streak, ${getPronouns(slave).he} has a clear advantage when it comes to fetish smut.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).his} submission`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === Fetish.SUBMISSIVE; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.cumSlut = {
	fameVar: "cumSlut",
	fameName: "cum",
	focusName: "cumslut",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed $his taste for cum",
	prestigeDesc2: "$His many fans relish $his desire for cum",
	prestigeDesc3: "Millions are intimately familiar with $his taste for cum",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} taste for cum, ${getPronouns(slave).he} has a clear advantage when it comes to ejaculate-based smut.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} drinking a glass of cum`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === "cumslut"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.anal = {
	fameVar: "anal",
	fameName: "buttslut",
	focusName: "buttslut",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed the sight of $his rear",
	prestigeDesc2: "$His many fans relish the sight of $his rear",
	prestigeDesc3: "Millions are intimately familiar with the sight of $his rear",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} fetish for asses, ${getPronouns(slave).he} finds friends in the company of viewers that love rear ends.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} shaking ${getPronouns(slave).his} booty`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === "buttslut"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.humiliation = {
	fameVar: "humiliation",
	fameName: "humiliating",
	focusName: "humiliation",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed $him humiliating $himself",
	prestigeDesc2: "$His many fans relish $his frequent humiliation",
	prestigeDesc3: "Millions are intimately familiar with $his frequent humiliation",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} fetish for humiliation, ${getPronouns(slave).he} has a clear advantage when it comes to demeaning smut.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} humiliated in public`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === "humiliation"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.boobs = {
	fameVar: "boobs",
	fameName: "breast",
	focusName: "boobs",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed the sight of $his breasts",
	prestigeDesc2: "$His many fans relish the sight of $his breasts",
	prestigeDesc3: "Millions are intimately familiar with $his breasts",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} fetish for tits, ${getPronouns(slave).he} has a clear advantage when it comes to breast-focused smut.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).his} bare chest`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === "boobs"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.dom = {
	fameVar: "dom",
	fameName: "dominant",
	focusName: "dom",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed $his dominance",
	prestigeDesc2: "$His many fans relish $his dominance",
	prestigeDesc3: "Millions are intimately familiar with $his dominant streak",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} dominant streak, ${getPronouns(slave).he} has a clear advantage when it comes to fetish smut.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} seated upon ${getPronouns(slave).his} obedient toy`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === "dom"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.fameName); }
};

App.Porn.Genre.sadist = {
	fameVar: "sadist",
	fameName: "sadistic",
	focusName: "sadist",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed $his sadism",
	prestigeDesc2: "$His many fans relish $his sadism",
	prestigeDesc3: "Millions are intimately familiar with $his sadistic streak",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} sadistic streak, ${getPronouns(slave).he} has a clear advantage when it comes to fetish smut.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} whipping ${getPronouns(slave).his} lover`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === "sadist"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.masochist = {
	fameVar: "masochist",
	fameName: "masochistic",
	focusName: "masochist",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed $his masochism",
	prestigeDesc2: "$His many fans relish the sight of $his masochism",
	prestigeDesc3: "Millions are intimately familiar with $his masochistic streak",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} masochistic streak, ${getPronouns(slave).he} has a clear advantage when it comes to fetish smut.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} being whipped`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === "masochist"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.pregnancy = {
	fameVar: "pregnancy",
	fameName: "pregnancy fetish",
	focusName: "pregnancy",
	type: App.Porn.GenreType.fetish,
	prestigeDesc1: "Thousands have enjoyed $his fondness for pregnancy",
	prestigeDesc2: "$His many fans relish the sight of $his fondness for pregnancy",
	prestigeDesc3: "Millions are intimately familiar with $his pregnancy kink",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `With ${getPronouns(slave).his} fetish for all things pregnancy, ${getPronouns(slave).he} has a clear advantage when it comes to fetish smut.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) {
		if (slave.ovaries === 1 || slave.mpreg === 1) {
			return `showing ${getPronouns(slave).him} getting knocked up`;
		} else if (slave.dick > 0) {
			return `showing ${getPronouns(slave).him} knocking a girl up`;
		} else {
			return `showing ${getPronouns(slave).him} pretending to be pregnant`;
		}
	},
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fetish === "pregnancy"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

/* General genres */

App.Porn.Genre.fuckdoll = {
	fameVar: "fuckdoll",
	fameName: "fuckdoll",
	focusName: "fuckdoll",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "$His fans relish the sight of $him being used",
	prestigeDesc2: "$His many fans relish the sight of $him being used",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him being used",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} latex encased body attracts a variety of viewers with tastes ranging from bondage to dolls.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing it offering itself`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.fuckdoll > 0; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.rape = {
	fameVar: "rape",
	fameName: "rape",
	focusName: "rape",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed the sight of $him being raped",
	prestigeDesc2: "$His many fans relish the sight of $him being raped",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him being raped",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).He} is too unbroken for consensual sex, but ${getPronouns(slave).his} viewers wouldn't want it any other way.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).his} rape`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return (slave.devotion < -20) && (slave.counter.anal + slave.counter.vaginal > 0); },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.preggo = {
	fameVar: "preggo",
	fameName: "preggo",
	focusName: "preggo",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed watching $him swell with child",
	prestigeDesc2: "$His many fans relish the sight of $him swollen with child",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him swollen with child",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} gravid swell may be a turn off to some, but the maiesiophiliacs love it.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} cradling ${getPronouns(slave).his} middle`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.bellyPreg > 500; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.BBW = {
	fameVar: "BBW",
	fameName: "BBW",
	focusName: "BBW",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed the sight of $his thick and soft body",
	prestigeDesc2: "$His many fans relish the sight of $his thick, soft body",
	prestigeDesc3: "Millions are intimately familiar with $his thick, soft body",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} weight gives ${getPronouns(slave).him} a heavy allure to the chubby chasers and BBW lovers out there.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} giving a bellyjob`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.weight > 95; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.loli = {
	fameVar: "loli",
	fameName: "underage",
	focusName: "loli",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed the sight of $his childish body",
	prestigeDesc2: "$His many fans relish $his immature body",
	prestigeDesc3: "Millions are intimately familiar with $his immature body",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} young age gives ${getPronouns(slave).him} a dangerous edge and a number of careful viewers.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).his} 'innocence'`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.visualAge <= 12; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.gainer = {
	fameVar: "gainer",
	fameName: "weight gain",
	focusName: "gainer",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed the sight of $him eating and gaining weight",
	prestigeDesc2: "$His many fans relish how curvy $he's gotten",
	prestigeDesc3: "Millions are intimately familiar with how much weight $he has gained",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} expanding waistline attracts those who enjoy seeing a ${getPronouns(slave).girl} pack on the pounds while stuffing ${getPronouns(slave).his} face.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} trying on ${getPronouns(slave).his} old clothes`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return (slave.weight > 30 && slave.diet === "fattening") || (slave.inflation > 0 && slave.inflationType === "food"); },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.stud = {
	fameVar: "stud",
	fameName: "big dick",
	focusName: "stud",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed the sight of $his throbbing erection",
	prestigeDesc2: "$His many fans relish the sight of $his heavy dick",
	prestigeDesc3: "Millions are intimately familiar with the sight of $his erect dick",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} powerful erection excites those who see it, especially when it is put to good use.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).his} money shot`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return canPenetrate(slave) && slave.dick > 3; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.fameName); }
};

App.Porn.Genre.muscle = {
	fameVar: "muscle",
	fameName: "muscle",
	focusName: "muscle",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed the sight of $his hard muscles",
	prestigeDesc2: "$His many fans relish the sight of $his hard muscles",
	prestigeDesc3: "Millions are intimately familiar with the sight of $his hard muscles",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} powerful muscles and bodybuilder physique attracts a dedicated audience.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} holding ${getPronouns(slave).his} partner in the air during sex`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.muscles > 80; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.fameName); }
};

App.Porn.Genre.incest = {
	fameVar: "incest",
	fameName: "taboo",
	focusName: "incest",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed seeing the love $he shares with $his family members",
	prestigeDesc2: "$His many fans relish the sight of $him loving $his family members",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him loving $his family members",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) {
		if (App.Utils.hasPartnerSex(slave) && areRelated(slave, getSlave(slave.relationshipTarget))) {
			const partner = getSlave(slave.relationshipTarget);
			return `${getPronouns(slave).His} sexual escapades with ${getPronouns(slave).his} ${relativeTerm(slave, partner)} ${partner.slaveName} excite viewers attracted to incestuous relationships.`;
		} else if (App.Utils.hasFamilySex(slave)) {
			return `${getPronouns(slave).His} sexual escapades with ${getPronouns(slave).his} close family members excite viewers attracted to incest.`;
		} else {
			return `${getPronouns(slave).His} sexual escapades with you, ${getPronouns(slave).his} own ${relativeTerm(slave, V.PC)}, excite viewers attracted to incestuous relationships.`;
		}
	},
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) {
		if (App.Utils.hasPartnerSex(slave) && areRelated(slave, getSlave(slave.relationshipTarget))) {
			const partner = getSlave(slave.relationshipTarget);
			return `showing ${getPronouns(slave).him} having fun with ${getPronouns(slave).his} ${relativeTerm(slave, partner)} ${partner.slaveName}`;
		} else if (App.Utils.hasFamilySex(slave)) {
			return `showing ${getPronouns(slave).him} having incestuous fun with ${getPronouns(slave).his} family`;
		} else {
			return `showing ${getPronouns(slave).him} having incestuous fun with you`;
		}
	},
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) {
		return (V.seeIncest !== 0) && (
			(App.Utils.hasFamilySex(slave)) || // has sex with family
			(App.Utils.hasPartnerSex(slave) && areRelated(slave, getSlave(slave.relationshipTarget))) || // or with her partner, who is related to her
			(App.Utils.sexAllowed(slave, V.PC) && areRelated(slave, V.PC)) // or with you, and is related to you
		);
	},
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.fameName); }
};

App.Porn.Genre.fucker = {
	fameVar: "fucker",
	fameName: "penetrative",
	focusName: "penetrative",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed witnessing $his mastery of drilling vaginas and rectums",
	prestigeDesc2: "$His many fans relish learning new techniques from watching $him masterfully penetrate holes",
	prestigeDesc3: "Millions are intimately familiar with $his masterful technique at pleasing others by pounding their pussy or butthole",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).He} hypnotizes ${getPronouns(slave).his} audience with the flawless technique ${getPronouns(slave).he} uses when penetrating any bodily orifice.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} driving ${getPronouns(slave).his} partner crazy with the pleasure granted by ${getPronouns(slave).his} masterful cock.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return canPenetrate(slave) && slave.dick > 2 && slave.skill.penetrative >= 100; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.fameName); }
};

App.Porn.Genre.clitFucker = {
	fameVar: "clitFucker",
	fameName: "clitoral penetrative",
	focusName: "dickclit",
	type: App.Porn.GenreType.general,
	prestigeDesc1: "Thousands have enjoyed watching $him drill vaginas and rectums with nothing but $his clit",
	prestigeDesc2: "$His many fans relish the sight of $him fucking holes with $his clit",
	prestigeDesc3: "Millions are intimately familiar with the sight of $his clit pounding holes and putting dicks to shame",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).He} amazes viewers with just how well a clitoris can be used in place of a dick.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).his} prominently erect clit.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.chastityVagina === 0 && slave.clit >= 3 && slave.skill.penetrative >= 60; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.fameName); }
};

/* quirk genres */

App.Porn.Genre.deepThroat = {
	fameVar: "deepThroat",
	fameName: "deepthroat",
	focusName: "gagfuck queen",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed the sounds $he makes when being throatfucked",
	prestigeDesc2: "$His many fans relish the sounds $he makes when being throatfucked",
	prestigeDesc3: "Millions are intimately familiar with the sounds $he makes when being throatfucked",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).He} impresses with just how much dick can slip down ${getPronouns(slave).his} throat.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} getting facefucked`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "gagfuck queen"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.struggleFuck = {
	fameVar: "struggleFuck",
	fameName: "unwilling",
	focusName: "strugglefuck queen",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed how $he struggles during sex",
	prestigeDesc2: "$His many fans relish how perfectly $he struggles during sex",
	prestigeDesc3: "Millions are intimately familiar with how perfectly $he struggles during sex",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).He} impresses with ${getPronouns(slave).his} ability to put up just the right amount of fight during sex.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} struggling`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "strugglefuck queen" && (canDoVaginal(slave) || canDoAnal(slave)); },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.painal = {
	fameVar: "painal",
	fameName: "hardcore anal",
	focusName: "painal queen",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed watching $his asshole pushed to its limit",
	prestigeDesc2: "$His many fans relish watching $his asshole pushed to its limit",
	prestigeDesc3: "Millions are intimately familiar with seeing $his asshole pushed to its limit",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).He} impresses with ${getPronouns(slave).his} ability to push ${getPronouns(slave).his} anus to its limit.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} taking an enormous dick up ${getPronouns(slave).his} ass`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "painal queen" && canDoAnal(slave); },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.tease = {
	fameVar: "tease",
	fameName: "softcore",
	focusName: "tease",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed $his lewd striptease",
	prestigeDesc2: "$His many fans relish $his lewd striptease",
	prestigeDesc3: "Millions are intimately familiar with $his lewd striptease",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).He} tantalizes viewers with ${getPronouns(slave).his} suggestive moves.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} stripping`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "tease"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.romantic = {
	fameVar: "romantic",
	fameName: "romantic",
	focusName: "romantic",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed the deep bond $he shares with $his partners",
	prestigeDesc2: "$His many fans relish the deep bond $he shares with $his partners",
	prestigeDesc3: "Millions are intimately familiar with the deep bond $he shares with $his partners",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).He} draws viewers in with ${getPronouns(slave).his} genuine pleasure.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} sharing an orgasm with ${getPronouns(slave).his} partner`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "romantic"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.pervert = {
	fameVar: "pervert",
	fameName: "really perverted",
	focusName: "perverted",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed $his most perverted tendencies",
	prestigeDesc2: "$His many fans relish the depths of $his perversions",
	prestigeDesc3: "Millions are intimately familiar with the depths of $his perversions",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} perverted tastes shock and allure viewers in ways they didn't even realize.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} doing something perverted`; }, /* FIXME: really, that's the best we could come up with??? */
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "perverted"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.caring = {
	fameVar: "caring",
	fameName: "voyeur",
	focusName: "caring",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed watching $him devote $himself to $his partners' pleasure",
	prestigeDesc2: "$His many fans relish $his devotion to $his partners' pleasure",
	prestigeDesc3: "Millions are intimately familiar with $his devotion to $his partners' pleasure",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} sincere devotion to ${getPronouns(slave).his} partner's pleasure draws in viewers with an interest in watching couples fuck.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} bringing ${getPronouns(slave).his} partner to orgasm`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "caring"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.unflinching = {
	fameVar: "unflinching",
	fameName: "unspeakable",
	focusName: "unflinching",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed $his willingness to do things not repeated in polite company",
	prestigeDesc2: "$His many fans relish $his willingness to do anything and everything",
	prestigeDesc3: "Millions are intimately familiar with $his willingness to do things not repeated in polite company",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} willingness to do anything catches the attention of those who enjoy acts that should never be mentioned to others.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} doing something unmentionable`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "unflinching"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

App.Porn.Genre.sizeQueen = {
	fameVar: "sizeQueen",
	fameName: "huge insertion",
	focusName: "size queen",
	type: App.Porn.GenreType.quirk,
	prestigeDesc1: "Thousands have enjoyed the sight of $his holes filled to their limits",
	prestigeDesc2: "$His many fans relish the sight of $his holes filled to their limits",
	prestigeDesc3: "Millions are intimately familiar with the sight of $his holes filled to their limits",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return `${getPronouns(slave).His} intent on taking the largest things possible into ${getPronouns(slave).his} holes draws in viewers with an interest for huge insertions.`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).his} belly bulging from within`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return slave.sexualQuirk === "size queen"; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return capFirstChar(this.focusName); }
};

/* Generic porn - leave this entry last */

App.Porn.Genre.general = {
	fameVar: "general",
	fameName: "generic",
	focusName: "porn",
	type: App.Porn.GenreType.generic,
	prestigeDesc1: "Thousands have enjoyed the sight of $him being used",
	prestigeDesc2: "$His many fans relish the sight of $him being used",
	prestigeDesc3: "Millions are intimately familiar with the sight of $him mid-coitus",
	// eslint-disable-next-line jsdoc/require-jsdoc
	hitText: function(slave) { return ``; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	trinketShotDesc: function(slave) { return `showing ${getPronouns(slave).him} mid-coitus`; },
	// eslint-disable-next-line jsdoc/require-jsdoc
	valid: function(slave) { return true; /* anyone can do generic porn */ },
	// eslint-disable-next-line jsdoc/require-jsdoc
	uiName: function() { return "Smut is smut"; }
};

/**
 * Returns a given genre by its fame name.
 * @param {PornGenre["fameName"]} fameName
 * @returns {PornGenre}
 */
App.Porn.getGenreByFameName = function(fameName) {
	return _.values(App.Porn.Genre).find((g) => g.fameName === fameName);
};

/**
 * Returns a given genre by its focus name.
 * @param {PornGenre["focusName"]} focusName
 * @returns {PornGenre}
 */
App.Porn.getGenreByFocusName = function(focusName) {
	return _.values(App.Porn.Genre).find((g) => g.focusName === focusName);
};

/**
 * Returns all the genres in the system.
 * @returns {PornGenre[]}
 */
App.Porn.getAllGenres = function() {
	return _.values(App.Porn.Genre);
};

/**
 * Returns all the genres with a given type.
 * @param {PornGenre["type"]} type
 * @returns {PornGenre[]}
 */
App.Porn.getGenresByType = function(type) {
	return _.values(App.Porn.Genre).filter((g) => g.type === type);
};

/** Returns the links necessary to set any valid porn genre for this slave.
 * @param {FC.SlaveState} slave
 * @param {function(FC.SlaveState) : void} callback
 * @returns {HTMLElement}
 */
App.Porn.genreChoiceLinks = function(slave, callback) {
	let makeLink = (genre) => {
		if (slave.porn.focus === genre.focusName) {
			return App.UI.DOM.disabledLink(genre.uiName(), [`Current focus`]);
		} else {
			return App.UI.DOM.link(genre.uiName(), (s, g) => {
				s.porn.focus = g.focusName;
				if (callback) {
					callback(s);
				}
			}, [slave, genre]);
		}
	};
	let links = this.getAllGenres().filter((g) => g.valid(slave)).map(makeLink);
	if (slave.porn.focus === "none") {
		links.push(App.UI.DOM.disabledLink("No focus", [`Already has no focus`]));
	} else {
		links.push(App.UI.DOM.link("No focus", (s) => {
			s.porn.focus = "none";
			if (callback) {
				callback(s);
			}
		}, [slave]));
	}
	return App.UI.DOM.generateLinksStrip(links);
};
