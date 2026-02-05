/* map some tiny nationalities that AI models haven't been trained on to a larger neighbor or region with similar-looking people */
const globalSpeciesRandom = "{hyena|horse|mouse|bear|hare|fox|deer|tiger|tanuki|wolf|lynx|coyote|jackal|leopard|panther}";
const microstateFix = {
	// European Microstates
	"a Liechtensteiner": "Swiss",
	"Andorran": "Catalan",
	"Luxembourgian": "Belgian",
	// "Monégasque": "French", // Monégasque works fine in testing, strangely
	"Sammarinese": "Italian",
	"Vatican": "Italian",

	// Caribbean islands
	"Antiguan": "Caribbean",
	"Aruban": "Caribbean",
	"Curaçaoan": "Caribbean",
	"Dominiquais": "Caribbean",
	"Grenadian": "Caribbean",
	"Kittitian": "Caribbean",
	"Saint Lucian": "Caribbean",
	"Vincentian": "Caribbean",

	// Oceania - micronesian nations and major tourist destinations all seem to do ok as-is, so just a couple to map
	"French Polynesian": "Polynesian",
	"Niuean": "Polynesian",
	"a Cook Islander": "Polynesian",
	"Korean":"{tiger|wolf|fox|lynx|coyote}",
	"Vietnamese":"{tiger|tanuki|leopard|panther}",
	"Chinese":"{hyena|mouse|tanuki|hare}",
	"Japanese":"{tanuki|mouse|fox|hare}",
	"Taiwanese":"{tanuki|wolf|fox}",
	"Belgian":"{wolf|hare|lynx|fox}",
	"Dutch":"{jackal|hare|lynx|fox}",
	"German":"{fox|lynx|hare|jackal}",
	"Polish":"{wolf|hare|bear|lynx|fox}",
	"Ukrainian":"{bear|tiger|wolf|fox}",
	"Portuguese":"{wolf|hare|bear|fox}",
	"Hungarian":"{wolf|hare|bear|fox}",
	"Czech":"{wolf|hare|deer|lynx|fox}",
	"British":"{hyena|horse|mouse|bear|hare|fox|deer}",
	"Austrian":"{fox|lynx|hare|jackal|bear}",
	"Danish":"{jackal|deer|lynx|fox}",
	"Swedish":"{jackal|tiger|lynx|fox}",
	"Swiss":"{jackal|tiger|lynx|fox}",
	"Russian":"{bear|tiger|wolf|fox|hare}",
	"Slovak":"{wolf|hare|bear|tiger|lynx|fox}",
	"Norwegian":"{wolf|hare|bear|tiger|lynx|fox}",
	"American":"{hyena|horse|mouse|bear|hare|fox|deer|tiger|tanuki|wolf|lynx|coyote|jackal|leopard|panther}",
	"Mexican":"{hyena|mouse|fox|jackal|leopard|panther}",
	"Canadian":"{mouse|fox|lynx|deer|bear|tiger}",
};

App.Art.GenAI.NationalityPromptPart = class NationalityPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const slave = asSlave(this.slave);
		if (["Stateless", "none", "slave", ""].includes(this.slave.nationality) || slave?.fuckdoll > 0) {
			return [];
		}
		// Per-slave species override (takes precedence over nationality)
		const species = slave?.custom?.aiSpecies;
		if (species) {
			if (species === "random") {
				return [globalSpeciesRandom];
			}
			return [species];
		}
		if (this.slave.nationality.endsWith("Revivalist")) {
			return [];
		}
		const nationalityPrompt = microstateFix[this.slave.nationality] || this.slave.nationality;
		switch (V.aiNationality) {
			case 0:
				return []; // disabled
			case 1:
				return [`[${nationalityPrompt}]`]; // weak
			case 2:
				return [nationalityPrompt]; // strong;
			default: throw new Error(`Unexpected value for aiNationality: ${V.aiNationality}` );
		}
	}

	/**
	 * @override
	 */
	face() {
		return this.positive();
	}
};
