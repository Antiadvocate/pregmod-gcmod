/**
 * @param {FC.SlaveState} slave
 * @returns {App.Art.GenAI.Prompt}
 */
// eslint-disable-next-line no-unused-vars
globalThis.buildPrompt = (slave) => {
	if (slave.custom.aiPromptsOverwrite === true) {
		return new App.Art.GenAI.Prompt([new App.Art.GenAI.CustomPromptPart(slave)]);
	}
	let prompts = [];
	switch (V.aiBaseModel) {
		// === SDXL / Pony  ===
		case 1: case 2:
			prompts = [
				new App.Art.GenAI.StylePromptPart(slave),          // image detail, framing, lighting
				//new App.Art.GenAI.StructurePromptPart(slave),      // general layout tags (portrait, full-body)
				new App.Art.GenAI.HairPromptPart(slave),           // hair color, length, style
				new App.Art.GenAI.RacePromptPart(slave),           // racial features
				new App.Art.GenAI.NationalityPromptPart(slave),    // nationality/ethnic visuals
				//new App.Art.GenAI.DemographicsPromptPart(slave),   // fallback age/gender/race handling
				new App.Art.GenAI.GenderPromptPart(slave),   //gender
				new App.Art.GenAI.CrotchPromptPart(slave),         // genitals
				new App.Art.GenAI.WaistPromptPart(slave),          // narrow/wide waist
				new App.Art.GenAI.HipsPromptPart(slave),           // hip width
				new App.Art.GenAI.AccessoryPromptPart(slave),      // toys, jewelry, etc
				new App.Art.GenAI.PubicHairPromptPart(slave),      // pubic hair
				new App.Art.GenAI.WeightPromptPart(slave),		   // Body weight traits
				new App.Art.GenAI.SkinPromptPart(slave),           // skin tone, markings
				new App.Art.GenAI.TattooPromptPart(slave),        // visible tattoos
				new App.Art.GenAI.MusclesPromptPart(slave),        // Muscle tone
				new App.Art.GenAI.EarsPromptPart(slave),           // ears
				new App.Art.GenAI.EyePromptPart(slave),            // eyes
				new App.Art.GenAI.EyebrowPromptPart(slave),        // eyebrows
				new App.Art.GenAI.ExpressionPromptPart(slave),     // facial expression
				new App.Art.GenAI.ArousalPromptPart(slave),        // arousal state
				new App.Art.GenAI.PregPromptPart(slave),           // pregnancy stage
				new App.Art.GenAI.CollarPromptPart(slave),         // collar
				new App.Art.GenAI.PosturePromptPart(slave),        // kneeling, standing, bound
				new App.Art.GenAI.ClothesPromptPart(slave),        // clothing
				new App.Art.GenAI.LocationPromptPart(slave),        // location
				new App.Art.GenAI.AmputationPromptPart(slave),
				new App.Art.GenAI.AndroidPromptPart(slave),        // android-specific flag
				new App.Art.GenAI.CustomPromptPart(slave),         // custom user-defined prompts
			];
			break;
		// === Illustrious models ===
		case 6:
			prompts = [
				// [1] Quality / style / ratings / framing
				new App.Art.GenAI.Ill.StylePromptPart(slave),

				// [3] Character identity
				new App.Art.GenAI.Ill.GenderPromptPart(slave),
				new App.Art.GenAI.Ill.AgePromptPart(slave),
				new App.Art.GenAI.Ill.RacePromptPart(slave),
				new App.Art.GenAI.NationalityPromptPart(slave),
				new App.Art.GenAI.Ill.SkinPromptPart(slave),
				//new App.Art.GenAI.Ill.BeautyPromptPart(slave),

				// [3] Head/face “top”
				new App.Art.GenAI.Ill.HairPromptPart(slave),
				new App.Art.GenAI.Ill.EyePromptPart(slave),
				new App.Art.GenAI.Ill.EyebrowPromptPart(slave),
				//new App.Art.GenAI.Ill.EarsPromptPart(slave),
				new App.Art.GenAI.Ill.ExpressionPromptPart(slave),

				// [3] Body “down”
				new App.Art.GenAI.Ill.HeightPromptPart(slave),
				new App.Art.GenAI.Ill.WeightPromptPart(slave),
				new App.Art.GenAI.Ill.MusclesPromptPart(slave),
				//new App.Art.GenAI.Ill.WaistPromptPart(slave),
				new App.Art.GenAI.Ill.HipsPromptPart(slave),
				//new App.Art.GenAI.Ill.ButtPromptPart(slave),
				new App.Art.GenAI.Ill.PregPromptPart(slave),
				new App.Art.GenAI.Ill.BreastsPromptPart(slave),

				// [3] Clothes (keep inside the “character block”, per the guide)
				new App.Art.GenAI.Ill.ClothesPromptPart(slave),

				// [3] Adornments (often behave like “attire”)
				new App.Art.GenAI.Ill.CollarPromptPart(slave),
				new App.Art.GenAI.Ill.AccessoryPromptPart(slave),
				new App.Art.GenAI.Ill.PiercingsPromptPart(slave),
				new App.Art.GenAI.Ill.TattooPromptPart(slave),

				// Extra features that affect anatomy/type
				//new App.Art.GenAI.Ill.AmputationPromptPart(slave),
				//new App.Art.GenAI.Ill.HealthPromptPart(slave),
				//new App.Art.GenAI.Ill.AndroidPromptPart(slave),

				// [4] Pose (after “who/what they’re wearing”)
				new App.Art.GenAI.Ill.PosturePromptPart(slave),

				// Genital/explicit cluster: keep late so it doesn’t hijack outfit/background
				new App.Art.GenAI.Ill.CrotchPromptPart(slave),
				new App.Art.GenAI.Ill.ArousalPromptPart(slave),
				new App.Art.GenAI.Ill.PubicHairPromptPart(slave),

				// [5] Background last (camera/background segment)
				new App.Art.GenAI.Ill.LocationPromptPart(slave),

				// User overrides last
				new App.Art.GenAI.CustomPromptPart(slave),
			];
			break;

		// === SD 1.5 / 2.0 models === Default: Full prompt with detailed modular coverage ===
		default:
			prompts = [
				// Style & visual framing
				new App.Art.GenAI.StylePromptPart(slave),          // art style, composition, detail
				new App.Art.GenAI.PosturePromptPart(slave),
				new App.Art.GenAI.ClothesPromptPart(slave),        // outfit, exposure
				//new App.Art.GenAI.RacePromptPart(slave),           // racial features
				new App.Art.GenAI.NationalityPromptPart(slave),    // ethnic/national appearance
				new App.Art.GenAI.SkinPromptPart(slave),           // skin tone, markings, freckles
				//new App.Art.GenAI.BeautyPromptPart(slave),         // subjective beauty value
				new App.Art.GenAI.GenderPromptPart(slave),         // male/female/intersex/etc
				new App.Art.GenAI.AgePromptPart(slave),            // visual age descriptor

				// Facial detail
				new App.Art.GenAI.EyePromptPart(slave),            // eye shape/color/sclera
				new App.Art.GenAI.EyebrowPromptPart(slave),        // eyebrow thickness/shape
				//new App.Art.GenAI.EarsPromptPart(slave),           // ears: normal, elf, animal
				new App.Art.GenAI.HairPromptPart(slave),           // hair: color, length, style
				new App.Art.GenAI.ExpressionPromptPart(slave),     // emotion or face mood

				// Body composition
				new App.Art.GenAI.WeightPromptPart(slave),         // skinny/fat
				new App.Art.GenAI.HeightPromptPart(slave),         // short/tall
				new App.Art.GenAI.MusclesPromptPart(slave),        // muscular/soft
				//new App.Art.GenAI.WaistPromptPart(slave),          // narrow/wide waist
				new App.Art.GenAI.HipsPromptPart(slave),           // hip width

				// Reproductive state
				new App.Art.GenAI.PregPromptPart(slave),           // pregnancy stage
				new App.Art.GenAI.BreastsPromptPart(slave),        // breast shape/size/nipples
				//new App.Art.GenAI.FakeTitsPromptPart(slave),       // basic implants
				//new App.Art.GenAI.HugeFakeTitsPromptPart(slave),   // massive implants

				// Genital area
				new App.Art.GenAI.CrotchPromptPart(slave),         // dick/pussy/futa/none
				new App.Art.GenAI.ArousalPromptPart(slave),        // wetness/erection
				new App.Art.GenAI.PubicHairPromptPart(slave),      // bush/shaved/landing strip

				// Extra features
				new App.Art.GenAI.TattooPromptPart(slave),        // visible tattoos
				new App.Art.GenAI.PiercingsPromptPart(slave),      // piercings (ears/nipples/etc)
				//new App.Art.GenAI.AmputationPromptPart(slave),     // limb loss, stump state
				//new App.Art.GenAI.HealthPromptPart(slave),         // sickly/healthy/wounds
				new App.Art.GenAI.AndroidPromptPart(slave),        // machine body traits

				// Pose & attire
				//new App.Art.GenAI.PosturePromptPart(slave),        // kneeling, standing, bound
				
				//new App.Art.GenAI.LocationPromptPart(slave),        // location
				new App.Art.GenAI.AccessoryPromptPart(slave),      // shoes, jewelry, toys
				new App.Art.GenAI.CollarPromptPart(slave),         // collar type/status

				// Final override or user-defined additions
				new App.Art.GenAI.CustomPromptPart(slave),         // extra prompt tweaks

			];
	}
	return new App.Art.GenAI.Prompt(prompts);
};
