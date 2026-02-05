App.Art.GenAI.PromptHelpers = (() => {
	const SANITIZATION_REGEX = /^\s*(an?\s+)?(.*?)(\s*$)/;

	// ===!! These are base categories, must not have overlap clothes !!===
	const NAKEDISH_OUTFITS = new Set([
		"no clothing",
		"chains",
		"body oil",
		"uncomfortable straps",
		"shibari ropes",
		"clubslut netting",
		"slave gown",
		"harem gauze",
		"slutty jewelry",
		"string bikini"
	]);
	// Clothing with cameltoe | bulge and midriff, Legs & Arms
	const NO_COVERAGE_WITH_CAMELTOE_OUTFITS = new Set([
		"attractive lingerie",
		"attractive lingerie for a pregnant woman",
		"kitty lingerie",
		"string bikini",
		"scalemail bikini",
		"samba outfit",
		"frilly bikini",
		"nipple bikini",
		"sport shorts and a sports bra",
		"panties and pasties",
		"tube top and thong",
	]);
	// Clothing without cameltoe | bulge but with Midriff, Legs & Arms
	const NO_COVERAGE_NO_CAMELTOE_OUTFITS = new Set([
		"cutoffs and a t-shirt",
		"bimbo outfit",
		"tribal outfit",
		"tropical outfit",
		"scalemail bikini",
		"cheerleader outfit",
		"slutty outfit",
	]);
	// Clothing without tops exposing midriff, breasts, nipples, and arms
	const TOPLESS_OUTFITS = new Set([
		"jeans",
		"leather pants",
		"cutoffs",
		"boyshorts",
		"skimpy loincloth",
		"thong",
		"sport shorts",
		"striped panties",
		"panties",
	]);
	const BOTTOMLESS_OUTFITS = new Set([
		"button-up shirt",
		"sweater",
		"t-shirt",
		"tank-top",
		"bra",
		"sports bra",
		"tube top",
		"oversized t-shirt",
		"pasties",
		"striped bra",
		"babydoll",
	]);

	// ************************************************************************

	// === These are concrete categories, can have overlapping clothes ===
	// === Can only reference base categories, must never reference each other ===
	// Clothing that shows cameltoe/bulge
	const CAMELTOE_VISIBLE_OUTFITS = new Set([
		"restrictive latex",
		"latex catsuit",
		"comfortable bodysuit",
		"cybersuit",
		"one-piece swimsuit",
		"sweater and panties",
		"t-shirt and panties",
		"tank-top and panties",
		"thong",
		"t-shirt and thong",
		"button-up shirt and panties",
		"sport shorts",
		"sport shorts and a t-shirt",
		"burkini",
		"monokini",
		"boyshorts",
		"leotard",
		"panties",
		"schoolgirl outfit",
		"slutty business attire",
		"stretch pants and a crop-top",
		"superhero outfit",
		...NO_COVERAGE_WITH_CAMELTOE_OUTFITS,
	]);

	const MIDRIFF_EXPOSING_OUTFITS = new Set([
		"western clothing",
		"huipil",
		"stretch pants and a crop-top",
		"battledress",
		"cardigan",
		"streetwear outfit",
		"leather pants and a tube top",
		"leather pants and pasties",
		"sports bra",
		"striped bra",
		"schoolgirl outfit",
		...NO_COVERAGE_NO_CAMELTOE_OUTFITS,
		...NO_COVERAGE_WITH_CAMELTOE_OUTFITS,
		...NAKEDISH_OUTFITS,
	]);

	const NIPPLE_EXPOSING_OUTFITS = new Set([
		"restrictive latex",
		"chattel habit",
		"monokini",
		"attractive lingerie for a pregnant woman",
		...NAKEDISH_OUTFITS,
		...TOPLESS_OUTFITS,
	]);

	const BREAST_EXPOSING_OUTFITS = new Set([
		"attractive lingerie for a pregnant woman",
		"panties and pasties",
		"monokini",
		"pasties",
		"leather pants and pasties",
		...NAKEDISH_OUTFITS,
		...TOPLESS_OUTFITS,
	]);

	const CROTCH_EXPOSING_OUTFITS = new Set([
		"Fuckdoll suit",
		"pasties",
		...NAKEDISH_OUTFITS,
		...BOTTOMLESS_OUTFITS,
	]);
	const ARM_EXPOSING_OUTFITS = new Set([
		"apron",
		"toga",
		"slutty qipao",
		"long qipao",
		"maternity dress",
		"stretch pants and a crop-top",
		"succubus outfit",
		"ball gown",
		"halter top dress",
		"evening dress",
		"mini dress",
		"overalls",
		"bunny outfit",
		"slutty maid outfit",
		"slutty nurse outfit",
		"nice nurse outfit",
		"one-piece swimsuit",
		"battledress",
		"courtesan dress",
		"monokini",
		"leotard",
		"superhero outfit",
		"country outfit",
		"leather outfit",
		"sundress",
		"cocktail dress",
		"magical girl costume",
		"babydoll",
		"petite admi outfit",
		"leather pants and a tube top",
		"western clothing",
		"tank-top and panties",
		"tank-top",
		"bra",
		"leather pants and pasties",
		"t-shirt",
		"t-shirt and thong",
		"t-shirt and jeans",
		"t-shirt and panties",
		"sports bra",
		"cutoffs and a t-shirt",
		"sport shorts and a t-shirt",
		"burkini",
		"striped bra",
		"leotard",
		"spats and a tank top",
		...NO_COVERAGE_NO_CAMELTOE_OUTFITS,
		...NAKEDISH_OUTFITS,
		...NO_COVERAGE_WITH_CAMELTOE_OUTFITS,
		...TOPLESS_OUTFITS,
	]);

	const LEG_EXPOSING_OUTFITS = new Set([
		"apron",
		"toga",
		"huipil",
		"slutty qipao",
		"long qipao",
		"maternity dress",
		"succubus outfit",
		"fallen nuns habit",
		"chattel habit",
		"striped panties",
		"slutty business attire",
		"nice business attire",
		"evening dress",
		"mini dress",
		"bunny outfit",
		"slutty maid outfit",
		"slutty nurse outfit",
		"one-piece swimsuit",
		"santa dress",
		"schoolgirl outfit",
		"monokini",
		"leotard",
		"superhero outfit",
		"sundress",
		"cocktail dress",
		"babydoll",
		"petite admi outfit",
		"military uniform",
		"red army uniform",
		"button-up shirt and panties",
		"cutoffs",
		"sweater and cutoffs",
		"sweater and panties",
		"t-shirt and panties",
		"tank-top and panties",
		"boyshorts",
		"skimpy loincloth",
		"thong",
		"t-shirt and thong",
		"oversized t-shirt and boyshorts",
		"sport shorts",
		"cutoffs and a t-shirt",
		"sport shorts and a t-shirt",
		"leotard",
		"panties",
		"spats and a tank top",
		"gothic lolita dress",
		"penitent nuns habit",
		"lederhosen",
		"magical girl costume",
		...NO_COVERAGE_NO_CAMELTOE_OUTFITS,
		...NAKEDISH_OUTFITS,
		...NO_COVERAGE_WITH_CAMELTOE_OUTFITS,
		...BOTTOMLESS_OUTFITS,
	]);

	// Tight tops with visible protrusion of nipples, opaque, nipples are not visible
	const TIGHT_TOPS = new Set([
		"slutty qipao",
		"spats and a tank top",
		"attractive lingerie",
		"attractive lingerie for a pregnant woman",
		"kitty lingerie",
		"stretch pants and a crop-top",
		"nipple bikini",
		"cheerleader outfit",
		"cutoffs and a t-shirt",
		"comfortable bodysuit",
		"cybersuit",
		"slutty nurse outfit",
		"nice pony outfit",
		"slutty pony outfit",
		"sweater",
		"t-shirt",
		"tank-top",
		"tube top",
		"sports bra",
		"pasties",
		"tube top and thong",
		"sweater and panties",
		"tank-top and panties",
		"t-shirt and thong",
		"sport shorts and a t-shirt",
		"sport shorts and a sports bra",
		"t-shirt and panties",
		"panties and pasties",
		"sweater and cutoffs",
		"leather pants and a tube top",
		"t-shirt and jeans",
		"leather pants and pasties",
		"schoolgirl outfit",
		"superhero outfit",
		"cardigan",
		"streetwear outfit",
		"country outfit",
		"sundress",
		"samba outfit",
		"tribal outfit",
		"baroque dress",
		"babydoll",
		"frilly bikini",
		"cocktail dress",
		"tropical outfit",
	]);

	const sanitizeDescriptor = (descriptor) => (
		/**
		 * Get's rid of leading "a" and any trailing or leading whitespace" and
		 * converts to lower-case.
		 **/
		descriptor.match(SANITIZATION_REGEX)[2].toLowerCase()
	);

	const validateAgainst = (description, targets) => targets.has(sanitizeDescriptor(description));

	const XLCheckpoint = () => V.aiBaseModel === 1;

	const ponyCheckpoint = () => V.aiBaseModel === 2;

	const illustriousCheckpoint = () => V.aiBaseModel === 6;

	const isFeminine = (slave) => {
		if (V.aiGenderHint === 1) { // Hormone balance
			const hormoneTransitionThreshold = 100;
			if (slave.hormoneBalance >= hormoneTransitionThreshold) {
				return true; // transwoman (or hormone-boosted natural woman)
			}
			return slave.genes === "XX" && (slave.hormoneBalance > -hormoneTransitionThreshold); // natural woman, and NOT transman
		} else if (V.aiGenderHint === 2) { // Perceived gender
			return perceivedGender(slave) > 1;
		} else if (V.aiGenderHint === 3) { // Pronouns
			return slave.pronoun === App.Data.Pronouns.Kind.female;
		} else {
			return false;
		}
	};

	const isMasculine = (slave) => {
		if (V.aiGenderHint === 1) { // Hormone balance
			return !isFeminine(slave);
		} else if (V.aiGenderHint === 2) { // Perceived gender
			return perceivedGender(slave) < -1;
		} else if (V.aiGenderHint === 3) { // Pronouns
			return slave.pronoun === App.Data.Pronouns.Kind.male;
		} else {
			return false;
		}
	};

	/**
	 * Returns a string that allows the selected AI User Interface to use the LoRA model.
	 * Returns an empty string if {@link App.Art.GenAI.sdClient.hasLora}(loraKey) returns false.
	 * @param {string} loraKey The LoRA key as defined in {@link App.Art.GenAI.UI.Options.recommendedLoRAs}.
	 * @param {number} [strength=0.5] What strength the LoRA should have [default=0.5].
	 * @param {string} [postString=""] If provided this is added to the end of the string [default=""].
	 * @param {string} [preString=""] If provided this is added to the beginning of the string [default=""].
	 * @returns {string} The constructed string.
	 */
	const loraBuilder = (loraKey, strength = 0.5, postString = "", preString = "") => {
		if (!App.Art.GenAI.sdClient.hasLora(loraKey)) {
			return "";
		}
		strength = strength ?? 0.5;
		if (typeof strength !== "number" || Number.isNaN(strength)) {
			throw new Error(`loraBuilder: strength must be a non NaN number! got '${strength}'`);
		}
		postString = postString ?? "";
		preString = preString ?? "";
		// we want to be able to continue even if the lora isn't in recommendedLoRAs (because someone forgot to add it)
		// we don't put an error message on the console for this because App.Art.GenAI.sdClient.hasLora() above already does that for us
		let loraName = App.Art.GenAI.UI.Options.recommendedLoRAs.get(loraKey)?.name ?? loraKey;
		return `${preString}<lora:${loraName}:${strength}>${postString}`;
	};

	return {
		sanitizeDescriptor,
		exposesMidriff: (description) => validateAgainst(
			description, MIDRIFF_EXPOSING_OUTFITS
		),
		exposesNipples: (description) => validateAgainst(
			description, NIPPLE_EXPOSING_OUTFITS
		),
		exposesBreasts: (description) => validateAgainst(
			description, BREAST_EXPOSING_OUTFITS
		),
		exposesCrotch: (description) => validateAgainst(
			description, CROTCH_EXPOSING_OUTFITS
		),
		exposesUnderwear: (description) => validateAgainst(
			description, CAMELTOE_VISIBLE_OUTFITS
		),
		exposesArms: (description) => validateAgainst(
			description, ARM_EXPOSING_OUTFITS
		),
		exposesLegs: (description) => validateAgainst(
			description, LEG_EXPOSING_OUTFITS
		),
		tightTops: (description) => validateAgainst(
			description, TIGHT_TOPS
		),
		activelyExposesCrotch: (assignment) => {
			return assignment === Job.FUCKTOY ||
				assignment === Job.BROTHEL ||
				assignment === Job.CONCUBINE ||
				assignment === Job.MASTERSUITE ||
				assignment === Job.WHORE;
		},
		isXL: XLCheckpoint,
		isPony: ponyCheckpoint,
		isXLOrPony: () => {
			return (XLCheckpoint() || ponyCheckpoint());
		},
		isIll: illustriousCheckpoint,
		isXLOrIll: () => {
			return (XLCheckpoint() || illustriousCheckpoint());
		},
		isPonyOrIll: () => {
			return (ponyCheckpoint() || illustriousCheckpoint());
		},
		/** @returns {boolean} true if the Checkpoint is an XL checkpoint or based off of XL (Pony, Illustrious, etc) */
		isXLBased: () => {
			return XLCheckpoint() || ponyCheckpoint() || illustriousCheckpoint();
		},
		isFeminine,
		isMasculine,
		lora: loraBuilder,
		/**
		 * @param {InternalLoraName} loraKey The name of the lora to check for as defined in {@link App.Art.GenAI.UI.Options.recommendedLoRAs}
		 * @returns {boolean} returns true if the lora name is a valid lora for the given base model and it is available for use
		 */
		hasLora: (loraKey) => {
			return App.Art.GenAI.sdClient.hasLora(loraKey);
		},
	};
})();

