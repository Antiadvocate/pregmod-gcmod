// cSpell:ignore xxmaskedxx, nopussy, flaccidfutanarimix, micropp
App.Art.GenAI.ClothesPromptPart = class ClothesPromptPart extends App.Art.GenAI.PromptPart {
	/** @type {Record<FC.Clothes, {positive: string, negative: string}>} */
	clothesPrompts = {
		"no clothing": {
			"positive": "completely nude, naked",
			"negative": "",
		},
		"a Fuckdoll suit": {  // NG good gen requires LoRA, but below will work without LoRA as well
			"positive": "black latex bodysuit, long sleeves" + App.Art.GenAI.PromptHelpers.lora("xxmaskedxx_lora_v01", .8, " xxmaskedxx", ", "),
			"negative": " exposed skin, exposed legs, exposed arms, short sleeves, nude, pussy, nipples",
		},
		"conservative clothing": {
			"positive": "black pants, white silk blouse",
			"negative": "",
		},
		"chains": {
			"positive": "metal chain harness, wrist cuffs with short chains, waist chain, thigh chains, standing",
			"negative": "clothes, jeans, underwear, pants, shorts, skirt, panties",
		},
		"Western clothing": {
			"positive": "cowboy hat, white tied blouse, jeans hotpants, standing, hands on hips",
			"negative": "",
		},
		"body oil": {  // Doesn't work well
			"positive": "body oil, completely nude, wet fur, shiny fur, glistening fur, lower body",
			"negative": "clothes, jeans, underwear, pants, shorts, skirt, panties",
		},
		"a toga": {  // Doesn't work well
			"positive": "short white toga, sturdy white linen, gold belt, wrapped leather sandals",
			"negative": "",
		},
		"a huipil": {  // Doesn't work well
			"positive": "woven wrap top, colorful short poncho, decorative sash, fringed mini skirt, layered bracelets, patterned textiles",
			"negative": "",
		},
		"a slutty qipao": {
			"positive": "short red silk qipao with gold embroidery, high mandarin collar, side slit up to the thigh, sleeveless, breast cutout, traditional frog buttons, subtle floral pattern woven into the fabric",
			"negative": "",
		},
		"a kimono": {
			"positive": "traditional kimono, crane and cherry blossom patterns, wide obi sash, long flowing sleeves",
			"negative": "",
		},
		"spats and a tank top": {  // Spats don't work well
			"positive": "bike shorts, tank top",
			"negative": "bike, jeans, nude, pussy, nipples",
		},
		"uncomfortable straps": {
			"positive": "leather harness, ring harness, thigh bands, armlet,  leather belt",
			"negative": "",
		},
		"shibari ropes": {
			"positive": "shibari rope, bondage, rope harness thigh ropes",
			"negative": "clothes, jeans, underwear, pants, shorts, skirt, panties",
		},
		"restrictive latex": {  // Doesn't work well
			"positive": "latex bodysuit, skintight, long sleeves, long gloves, straight posture, arms on side",
			"negative": " exposed skin, exposed legs, exposed arms, short sleeves, nude, pussy, midriff",
		},
		"a latex catsuit": {  // Doesn't work well
			"positive": "latex catsuit, long sleeves, long gloves",
			"negative": " exposed skin, exposed legs, exposed arms, short sleeves, nude, pussy",
		},
		"attractive lingerie": {
			"positive": "$color lace g-string, lace bra, lace stockings",
			"negative": "clothes, jeans, pants",
		},
		"attractive lingerie for a pregnant woman": {  // Cupless part doesn't work well
			"positive": "cotton thong, cotton bra, cotton stockings",
			"negative": "",
		},
		"kitty lingerie": {  // Broken for photorealistic models, probably works for anime models
			"positive": "kitty lingerie, cat lingerie, kawaii lingerie",
			"negative": "cat ears, jeans, nude, pussy, nipples",
		},
		"a maternity dress": {
			"positive": "maternity dress, loose dress",
			"negative": "",
		},
		"stretch pants and a crop-top": {
			"positive": "crop top, leggings",
			"negative": "",
		},
		"a succubus outfit": {
			"positive": "succubus costume, red leather corset, red leather miniskirt, black demon horns, black lace stockings",
			"negative": "",
		},
		"a fallen nuns habit": {
			"positive": "latex mini dress, latex nun veil, long latex gloves, cross amulet, latex stockings, glossy finish,  glossy latex texture, reflective material",
			"negative": "",
		},
		"a penitent nuns habit": {
			"positive": "long burlap dress, long burlap sleeves, long  burlap skirt, beige nun veil, rope belt",
			"negative": "jeans, nude, pussy, nipples",
		},
		"a chattel habit": {
			"positive": "white latex mini dress, white latex nun veil, long latex gloves, cross amulet, gold belt, latex stockings, transparent clothing, glossy finish,  glossy latex texture, reflective material",
			"negative": "",
		},
		"a string bikini": {  // Cupless part doesn't work well
			"positive": "floral pattern, $color bikini top, bikini bottom",
			"negative": "",
		},
		"a nipple bikini": {
		  positive: "$color micro bikini, tiny triangle bikini top, string bikini bottom, side-tie bottoms, skimpy swimwear",
		  negative: "one-piece swimsuit, sports bra, tankini",
		},
		"a tankini": {
		  positive: "$color tankini, two-piece swimsuit, tankini top, bikini bottoms, swimwear",
		  negative: "one-piece swimsuit, dress, jeans, pants",
		},
		"a scalemail bikini": {  // Doesn't work well
			"positive": "studded leather bikini, chainmail covering, bikini bottom, leather bracer",
			"negative": "",
		},
		"striped panties": {
			"positive": "blue striped panties, bare breasts, topless",
			"negative": "",
		},
		"a cheerleader outfit": {
			"positive": "$color cheerleader outfit, skirt, crop top, school emblem",
			"negative": "pom pom",
		},
		"clubslut netting": {
			"positive": "transparent clothing, $color crotchless fishnet bodysuit, fishnet gloves, fishnet stockings",
			"negative": "",
		},
		"cutoffs and a t-shirt": {
			"positive": "white t-shirt, jean shorts",
			"negative": "",
		},
		"slutty business attire": {
			"positive": "closed white blazer, white pencil skirt, black underwear, black stockings",
			"negative": ""
		},
		"nice business attire": {
			"positive": "white blazer, collared shirt, black skirt, black pantyhose",
			"negative": "",
		},
		"a ball gown": {
			"positive": "$color luxurious $material dress, long gloves, long skirt, strapless",
			"negative": "",
		},
		"a slave gown": {
			"positive": "transparent lace dress, transparend clothing, anklet, long skirt, strapless",
			"negative": "",
		},
		"a halter top dress": {
			"positive": "$color $material halterneck  dress, luxurious dress, bare back, long skirt",
			"negative": "jeans, nude, pussy, nipples",
		},
		"an evening dress": {
			"positive": "$color $material long wrapped dress, stockings",
			"negative": "",
		},
		"a mini dress": {
			"positive": "$color $material mini dress, strapless, stockings",
			"negative": "",
		},
		"a comfortable bodysuit": {
			"positive": "$colorLatex latex catsuit, off shoulder, long sleeves",
			"negative": "",
		},
		"a leotard": {
			"positive": "strapless $color leotard, pantyhose",
			"negative": "",
		},
		"a monokini": {  // This one likely will never do quite right since the monokini was a topless bikini, but if you search for it you get a lot of other bikini designs - franklygeorge
			"positive": `sporty $color one-piece swimsuit, topless one-piece swimsuit, monokini${V.aiAgeFilter ? "" : ", nipples"}`,
			"negative": "",
		},
		"an apron": {
			"positive": "short white kitchen apron, no clothes underneath, open sides, thighs, bare hips, side boob, bare legs, barefoot",
			"negative": "",
		},
		"overalls": {
			"positive": "overalls, no clothes underneath",
			"negative": "",
		},
		"a cybersuit": {  // Doesn't work well
			"positive": "futuristic $colorLatex bodysuit, neon accents, glowing lines, shiny material",
			"negative": "",
		},
		"a tight Imperial bodysuit": {  // Doesn't work well
			"positive": "futuristic bodysuit, long pants, neon accents, glowing lines, shiny material, cyberpunk, utility belt, bracers, armored corset, armored pauldron",
			"negative": " exposed skin, exposed legs, exposed arms, short sleeves, nude, pussy, nipples",
		},
		"battlearmor": {  // Doesn't work well
			"positive": "knight armor, high collar, long armored pants, big pauldron, long knight gloves, armored corset, spikes, reflective material",
			"negative": "",
		},
		"Imperial Plate": {  // Doesn't work well
			"positive": "black roman armor, high collar, long skirt over pants, long pants, armored skirt, oversized pauldron, knee boots, layered armor, long knight gloves, armored corset, reflective material, long flowing cape",
			"negative": "",
		},
		"a bunny outfit": {
			"positive": "black satin leotard, strapless, pantyhose, stockings, headband, bunny ears",
			"negative": "",
		},
		"a slutty maid outfit": {
			"positive": "slutty french maid outfit, maid skirt, stockings, corset, frilly headband, apron",
			"negative": "",
		},
		"a nice maid outfit": {
			"positive": "french maid outfit, long petticoat skirt, high collar, long sleeves, corset, frilly headband, apron",
			"negative": "",
		},
		"a slutty nurse outfit": {
			"positive": "nurse, short white latex mini dress, latex stockings, nurse cap",
			"negative": "",
		},
		"a nice nurse outfit": {
			"positive": "nurse, white medical scrubs, pants",
			"negative": "",
		},
		"a dirndl": {
			"positive": "dirndl, frilly white blouse with floral motif, corset, frilly cotton skirt",
			"negative": "",
		},
		"a long qipao": {
			"positive": "long red silk qipao with gold embroidery, high mandarin collar,  side slit up to the thigh, long sleeves, traditional frog buttons, subtle floral pattern woven into the fabric",
			"negative": "",
		},
		"lederhosen": {
			"positive": "traditional brown suede lederhosen, detailed embroidery, suspenders, white puff-sleeve blouse with a square neckline, knee-high wool socks",
			"negative": "",
		},
		"a biyelgee costume": {  // Doesn't work well
			"positive": "traditional biyelgee costume, long skirt, richly embroidered silk, wide decorative belt, long sleeves with ornate cuffs, intricate patterns, traditional headdress with beadwork and fabric accents",
			"negative": "",
		},
		"a hanbok": {
			"positive": "traditional hanbok with a pastel pink jeogori, white cuffs, delicate floral embroidery, over a flowing sky blue chima, with soft pleats, wide ribbon, tied neatly at the front, paired with white beoseon",
			"negative": "",
		},
		"a burkini": { // Doesn't work well
			"positive": "black burqa, burkini",
			"negative": "hair",
		},
		"a hijab and blouse": {
			"positive": "hijab, blouse, short sleeves, long skirt",
			"negative": "",
		},
		"a hijab and abaya": {
			"positive": "hijab, abaya",
			"negative": "",
		},
		"a niqab and abaya": {  // Doesn't work well
			"positive": "niqab, covered face, abaya",
			"negative": "",
		},
		"a burqa": {  // Doesn't work well
			"positive": "burqa, muslim clothes",
			"negative": "",
		},
		"a police uniform": {
			"positive": "police uniform, policewoman, police hat, jacket, pants, utility belt, holster",
			"negative": "",
		},
		"a gothic lolita dress": {
			"positive": "long black lace dress, long petticoat skirt, lace trim, long sleeves, long gloves",
			"negative": "",
		},
		"a one-piece swimsuit": {
			"positive": "sporty swimsuit, high collar, shiny material",
			"negative": "",
		},
		"a nice pony outfit": {
			"positive":  App.Art.GenAI.PromptHelpers.lora("ponygirl", .7, " ponygirl, ",) + "bdsm, bodysuit, horse mask",
			"negative": "nude"
		},
		"a slutty pony outfit": {
			"positive": App.Art.GenAI.PromptHelpers.lora("ponygirl", .7, " ponygirl, ",) + "bdsm, horse mask",
			"negative": "pussy",
		},
		"a button-up shirt and panties": {  // Often not bottomless
			"positive": "collared shirt, oversized clothes, panties, (bottomless:1.1), thighs",
			"negative": "",
		},
		"a button-up shirt": {  // Often not bottomless
			"positive": "collared shirt, oversized clothes, nude, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"a sweater": {  // Often not bottomless
			"positive": "sweater, oversized clothes, nude, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"a t-shirt": {  // Often not bottomless
			"positive": "t-shirt, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"a tank-top": {  // Often not bottomless
			"positive": "tank top, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"a tube top": {  // Often not bottomless
			"positive": "tube top, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nude, nipples",
		},
		"an oversized t-shirt": {  // Often not bottomless
			"positive": "t-shirt, oversized clothes, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"a bra": {  // Often not bottomless
			"positive": "bra, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"a sports bra": {  // Often not bottomless
			"positive": "sports bra, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"a striped bra": {  // Often not bottomless
			"positive": "striped bra, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"pasties": {  // Doesn't work well
			"positive": "pasties, nude, (bottomless:1.1), thighs",
			"negative": "jeans, pants, skirt, shorts, nipples",
		},
		"a tube top and thong": {
			"positive": "tube top, (bottomless:1.1), g-string, thighs",
			"negative": "jeans, pants, skirt, shorts, nipples, pussy",
		},
		"a sweater and panties": {  // Often not bottomless
			"positive": "sweater, oversized clothes, panties, thighs",
			"negative": "jeans, pants, skirt, shorts, nipples, pussy",
		},
		"a tank-top and panties": {  // Often not bottomless
			"positive": "tank top, panties, thighs",
			"negative": "jeans, pants, skirt, shorts, nipples, pussy",
		},
		"a t-shirt and thong": {  // Often not bottomless
			"positive": "t-shirt, g-string, thighs",
			"negative": "jeans, pants, skirt, shorts, nipples, pussy",
		},
		"an oversized t-shirt and boyshorts": {  // Doesn't work well
			"positive": "t-shirt, oversized clothes, boyshort panties, thighs",
			"negative": "jeans, pants, skirt, nipples, pussy",
		},
		"sport shorts and a t-shirt": {
			"positive": "t-shirt, sport shorts",
			"negative": "jeans, pants, skirt, nipples, pussy",
		},
		"sport shorts and a sports bra": {
			"positive": "sports bra, sport shorts",
			"negative": "jeans, pants, skirt, nipples, pussy",
		},
		"a t-shirt and panties": {  // Often not bottomless
			"positive": "t-shirt, panties, thighs",
			"negative": "jeans, pants, skirt, shorts, nipples, pussy",
		},
		"striped underwear": {  // Often not bottomless
			"positive": "striped panties, striped bra",
			"negative": "jeans, pants, skirt, shorts, nipples, pussy",
		},
		"a thong": {
			"positive": "thong, topless",
			"negative": "jeans, pants, skirt, shorts, pussy",
		},
		"a skimpy loincloth": {  // Doesn't work well
			"positive": "loincloth, topless",
			"negative": "jeans, pants, skirt, shorts, pussy",
		},
		"boyshorts": {
			"positive": "boyshort panties, topless",
			"negative": "jeans, pants, skirt, pussy",
		},
		"panties": {
			"positive": "panties, topless",
			"negative": "jeans, pants, skirt, pussy",
		},
		"panties and pasties": {  // Doesn't work well
			"positive": "panties, pasties, topless",
			"negative": "jeans, pants, skirt, pussy, nipples",
		},
		"cutoffs": {
			"positive": "jean shorts, topless",
			"negative": "pussy",
		},
		"sport shorts": {
			"positive": "sport shorts, topless",
			"negative": "jeans, pants, skirt, pussy",
		},
		"a sweater and cutoffs": {
			"positive": "sweater, jean shorts",
			"negative": "pussy, nipples",
		},
		"leather pants and a tube top": {
			"positive": "leather pants, tube top, bare shoulders",
			"negative": "jeans, pants, skirt, shorts, pussy, nipples",
		},
		"a t-shirt and jeans": {
			"positive": "t-shirt, jeans",
			"negative": "pussy, nipples",
		},
		"leather pants and pasties": {  // Doesn't work well
			"positive": "leather pants, pasties, topless",
			"negative": "jeans, pants, skirt, shorts, pussy, nipples",
		},
		"leather pants": {
			"positive": "leather pants, topless",
			"negative": "jeans, pants, skirt, shorts, pussy",
		},
		"jeans": {
			"positive": "jeans, topless",
			"negative": "pussy",
		},
		"a military uniform": {
			"positive": "military uniform, shirt, necktie, skirt",
			"negative": "",
		},
		"a red army uniform": { // not red army, but soviet is at least close
			"positive": "soviet uniform, military uniform, shirt, necktie, skirt",
			"negative": "",
		},
		"battledress": {
			"positive": "military fatigues, camouflage pants, tank top",
			"negative": "",
		},
		"a mounty outfit": {  // Doesn't work well
			"positive": "mounty, red military jacket",
			"negative": "jeans, shorts, pussy, nipples",
		},
		"harem gauze": {
			"positive": "face veil, belly chain, belly dancer outfit, loose dress, see-through, transparent clothes",
			"negative": "",
		},
		"slutty jewelry": {
			"positive": "completely nude, gem amulet, belly chains, gold chain bra, gold chains, armlet, gold headdress",
			"negative": ""
		},
		"a Santa dress": {
			"positive": "santa costume, santa dress, stockings, fur trim",
			"negative": ""
		},
		"a bimbo outfit": {
			"positive": "pink tube top, latex pink miniskirt",
			"negative": "jeans, nude, pussy, nipples",
		},
		"a slutty outfit": {
			"positive": "(pink:1.1) crop top, pink lowleg microskirt, hip bones, groin, tight clothes, midriff, navel, (thighs:1.1)",
			"negative": "jeans, nude, nipples",
		},
		"a courtesan dress": {  // Corset was messing stuff up, so I removed it
			"positive": "long dress, layered fabric, corset, long sleeves, detached sleeves, stockings",
			"negative": "",
		},
		"a schoolgirl outfit": {
			"positive": "white tight blouse tied above navel, plaid micro skirt, stockings",
			"negative": "",
		},
		"a superhero outfit": {
			"positive": "red and blue superman leotard, superman symbol, red cape, red boots, standing, hands on hips",
			"negative": "",
		},
		"a cardigan": {
			"positive": "crop top, loose cardigan, leather pants, knee boots",
			"negative": "",
		},
		"a streetwear outfit": {
			"positive": "ripped fishnet stockings, short denim skirt, crop top, leather jacket",
			"negative": "",
		},
		"a country outfit": {
			"positive": "tight embroidered corset top, puffed sleeves, flower embroidery, flared folk skirt, thigh-high boots",
			"negative": "",
		},
		"a leather outfit": {
			"positive": "black leather corset, sleeveless, tight leather pants, leather bracer, knee boots",
			"negative": "",
		},
		"a turtleneck and miniskirt": {
			"positive": "form-fitting turtleneck sweater, leather mini skirt, thigh-high boots",
			"negative": "",
		},
		"a red priestess outfit": {
			"positive": "crimson red robe, detached sleeves, long skirt, bone headdress, corset, ritual ruby necklace, lace stockings, high heels, standing, praying",
			"negative": "",
		},
		"an eastern european outfit": {
			"positive": "embroidered blouse, corset, long floral skirt, floral crown, high heels",
			"negative": "",
		},
		"a samba outfit": {
			"positive": "carnival outfit, elaborate feathered headdress, jeweled bikini, sparkling bra top, beaded thong, high heels, feathered backpiece, sequins, decorative arm bands, shimmering textures",
			"negative": "",
		},
		"a tribal outfit": {
			"positive": "tribal-inspired outfit, beaded halter top, decorative feathers, feather headdress, leather armband, fringed mini skirt, leather straps, ornamental patterns, braided accessories, high boots, sensual tribal fashion",
			"negative": "",
		},
		"a tropical outfit": {
			"positive": "woven grass skirt, woven grass bra top, flower lei, decorative arm bands",
			"negative": "",
		},
		"a valkyrie outfit": {
			"positive": "fur-trimmed leather corset, metal accents, metal bracer, mini skirt, fur coat, braided hair accessories, warrior elegance, knee boots, valkyrie",
			"negative": "",
		},
		"a baroque dress": {
			"positive": "$color petticoat baroque dress, floor length skirt, high heels, standing",
			"negative": "",
		},
		"a cocktail dress": {
			"positive": "$color frill cocktail dress, off-the-shoulder design, fitted waist, high heels, stockings, knee length, standing",
			"negative": "",
		},
		"an ice queen outfit": {
			"positive": "long white lace dress, fur coat, high heels, white stockings, white crown",
			"negative": "",
		},
		"a magical girl costume": {
			"positive": "(magical girl cosplay:1.1), corset bodice, sailor collar, puff sleeves, chest bow, frilly skirt, thighhigh stockings",
			"negative": "anime, topless",
		},
		"a slutty magical girl costume": {
			"positive": "(skimpy magical girl cosplay:1.1), (skimpy leotard:1.1), deep v-neck, underbust cutout, sailor collar, chest bow, puff sleeves, thighhigh stockings",
			"negative": "topless, bare chest, anime",
		},		
		"slave rags": {
			"positive": "tattered clothing, ragged clothing, rags",
			"negative": "",
		},
		"a sundress": {
			"positive": "short floral sundress, wide-brim sunhat, sandals",
			"negative": "",
		},
		"a wedding dress": {
			"positive": "white wedding dress, veil, high heels, holding a rose bouquet",
			"negative": "",
		},
		"an armored dress": {
			"positive": "Fantasy armor, long skirt, metallic corset, gold embroidery, royal cloak, metal accessories, shoulder pads, bracer, high boots",
			"negative": "",
		},
		"a babydoll": {
			"positive": "$color babydoll nightgown, transparent fabric, bows, thighhighs",
			"negative": "",
		},
		"a coat and corset": {
			"positive": "black trench coat, corset, lace stockings, lace skirt",
			"negative": "",
		},
		"a frilly bikini": {
			"positive": "$color ruffled bikini set, frill bikini, frill bikini bottom, frilly details",
			"negative": "",
		},
		"a hoodie": {
			"positive": "hoodie, oversized hoodie, nude, bottomless",
			"negative": "jeans, pants, skirt, shorts"
		},
	};

	clothesPromptsAgeControl = {
		"no clothing": {
			"positive": "strapless tube top, visible shoulders",
			"negative": "",
		},
		"chains": {
			"positive": "metal chains collar, chainmail tube top, visible shoulders, chain belt, chainmail skirt",
			"negative": "jeans, pants, skirt",
		},
		"body oil": {
			"positive": "(shiny skin, glistening skin, body oil:1.1), strapless swimsuit, visible shoulders",
			"negative": "jeans",
		},
		"a slutty qipao": {
			"positive": "qipao, chinese clothing",
			"negative": "jeans, nude, pussy, nipples",
		},
		"spats and a tank top": {
			"positive": "bike shorts, tank top",
			"negative": "bike, jeans, nude, pussy, nipples",
		},
		"uncomfortable straps": {
			"positive": "leather straps top, visible shoulders, leather belt, leather straps skirt",
			"negative": "jeans, pants, shorts",
		},
		"shibari ropes": {
			"positive": "macrame tube top, ropes, rope belt, macrame skirt",
			"negative": "jeans, pants, shorts",
		},
		"attractive lingerie": {
			"positive": "strapless swimsuit, visible shoulders",
			"negative": "jeans, pants",
		},
		"attractive lingerie for a pregnant woman": {
			"positive": "strapless swimsuit, visible shoulders",
			"negative": "jeans, pants",
		},
		"kitty lingerie": { // Broken for photorealistic models, probably works for anime models
			"positive": "strapless hello kitty swimsuit, visible shoulders",
			"negative": "cat ears, jeans",
		},
		"a maternity dress": {
			"positive": "wide dress, loose dress",
			"negative": "jeans, nude, pussy, nipples",
		},
		"a succubus outfit": {
			"positive": "demon costume, red leather top, red leather miniskirt, black demon horns",
			"negative": "jeans, nude, pussy, nipples",
		},
		"a penitent nuns habit": {
			"positive": "(latex nun habit:1.1), ropes",
			"negative": "jeans",
		},
		"a chattel habit": {
			"positive": "(white latex nun habit:1.1), gold belt, sleveless, cleavage, visible shoulders",
			"negative": "",
		},
		"a string bikini": {
			"positive": "strapless swimsuit",
			"negative": "jeans,",
		},
		"a scalemail bikini": {
			"positive": "chainmail swimsuit",
			"negative": "jeans",
		},
		"striped panties": {
			"positive": "strapless blue striped swimsuit",
			"negative": "jeans",
		},
		"clubslut netting": {
			"colors": ["light blue", "pink", "lime green"],
			"positive": "rave clothing, fishnet clothing, $color bodysuit, choker",
			"negative": "jeans, pants, corset",
		},
		"a slave gown": {
			"positive": "ballgown, long dress, luxurious dress, cleavage, slave straps",
			"negative": "jeans",
		},
		"a halter top dress": {
			"positive": "(halterneck:1.1), long dress, luxurious dress, backless dress",
			"negative": "jeans",
		},
		"a leotard": {
			"positive": "leotard",
			"negative": "jeans",
		},
		"a monokini": {
			"positive": "swimsuit",
			"negative": "jeans",
		},
		"an apron": {
			"positive": "apron swimsuit",
			"negative": "t-shirt, shirt, pants, shorts",
		},
		"overalls": {
			"positive": "overalls, visible shoulders, sleeveless",
			"negative": "t-shirt, shirt, pants, shorts, topless",
		},
		"a bunny outfit": {
			"positive": "magazine bunny costume, backless leotard",
			"negative": "jeans, nude, rabbit ears",
		},
		"a gothic lolita dress": {
			"positive": "gothic dress, short dress, thighhighs",
			"negative": "jeans",
		},
		"a button-up shirt and panties": {
			"positive": "collared shirt, oversized clothes, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a button-up shirt": {
			"positive": "collared shirt, oversized clothes, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a sweater": {
			"positive": "only sweater, oversized clothes, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a t-shirt": {
			"positive": "only t-shirt, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a tank-top": {
			"positive": "only tank top, visible shoulders",
			"negative": "jeans",
		},
		"a tube top": {
			"positive": "only tube top, visible shoulders",
			"negative": "jeans",
		},
		"an oversized t-shirt": {
			"positive": "only t-shirt, oversized clothes, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a bra": {
			"positive": "white swimsuit top",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a sports bra": {
			"positive": "sports swimsuit top",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a striped bra": {
			"positive": "striped swimsuit top",
			"negative": "jeans, pants, skirt, shorts",
		},
		"pasties": {
			"positive": "strapless tube top, visible shoulders",
			"negative": "",
		},
		"a tube top and thong": {
			"positive": "tube top, visible shoulders",
			"negative": "jeans",
		},
		"a sweater and panties": {
			"positive": "sweater, oversized clothes, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a tank-top and panties": {
			"positive": "tank top, visible shoulders",
			"negative": "jeans",
		},
		"a t-shirt and thong": {
			"positive": "t-shirt, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"an oversized t-shirt and boyshorts": {
			"positive": "t-shirt, oversized clothes, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"sport shorts and a sports bra": {
			"positive": "sports swimsuit top",
			"negative": "jeans, pants, skirt",
		},
		"a t-shirt and panties": {
			"positive": "t-shirt, swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"striped underwear": {
			"positive": "striped swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a thong": {
			"positive": "tube top, visible shoulders",
			"negative": "jeans",
		},
		"a skimpy loincloth": {
			"positive": "leather straples swimsuit",
			"negative": "jeans, pants, skirt, shorts",
		},
		"boyshorts": {
			"positive": "swimsuit top",
			"negative": "jeans",
		},
		"panties": {
			"positive": "swimsuit top",
			"negative": "jeans",
		},
		"panties and pasties": {
			"positive": "swimsuit top",
			"negative": "jeans",
		},
		"cutoffs": {
			"positive": "jean shorts, strapless tube top, visible shoulders",
			"negative": "",
		},
		"sport shorts": {
			"positive": "sports swimsuit top, sport shorts",
			"negative": "jeans, pants, skirt",
		},
		"leather pants and a tube top": {
			"positive": "leather pants, tube top, visible shoulders",
			"negative": "jeans, skirt, shorts",
		},
		"leather pants and pasties": {
			"positive": "leather pants, swimsuit top",
			"negative": "jeans, skirt, shorts",
		},
		"leather pants": {
			"positive": "leather pants, swimsuit top",
			"negative": "jeans, skirt, shorts",
		},
		"jeans": {
			"positive": "jeans, swimsuit top",
			"negative": "",
		},
		"harem gauze": {
			"positive": "harem outfit, loose dress",
			"negative": "jeans, shorts",
		},
		"slutty jewelry": {
			"positive": "jewelry, gem, gold chains, armlet, visible shoulders",
			"negative": "jeans, pants, shorts"
		},
		"a bimbo outfit": {
			"positive": "(pink tube top:1.1), cleavage",
			"negative": "",
		},
		"a slutty outfit": {
			"positive": "(pink crop top:1.1), cleavage",
			"negative": "",
		},
		"a courtesan dress": {  // Corset was messing stuff up, so I removed it
			"positive": "(luxurious flowing dress:1.1), exposed shoulders, long sleeves, detached sleeves",
			"negative": "jeans, nude, pussy, nipples",
		},
	};
	/**
	 * @returns {string}
	 */
	getClothes() {
		let clothes = this.slave.clothes;
		if (!this.clothesPrompts.hasOwnProperty(clothes) && !V.customClothesPrompts.hasOwnProperty(clothes)) {
			console.error("AI Art: Missing clothing:", clothes);
			clothes = "no clothing";
		}
		return clothes;
	}

	/**
	 * Replace the literal "$color" in a prompt with the name of a color
	 * @param {string} prompt
	 * @returns {string}
	 */
	replacer(prompt) {
		const colors =
		[
			"light blue", "cream colored", "pink", "white", "black", "silver", "gold", "deep red", "amethyst", "emerald", "deep blue", "turquoise",
			"bright red", "black and red", "silver and gold", "black and gold", "white and gold", "emerald and gold", "deep blue and silver",
			"deep blue and gold"
		];
		const colorsLatex = ["pink", "white", "black", "deep red"];
		const materials = ["latex", "satin", "lace", "sequin", "silk", "tulle", "fishnet", "frill"];

		let availableColorsLatex = [...colorsLatex];
		let availableColors = [...colors];
		let availableMaterials = [...materials];

		let randomIndex = Math.floor(seededRandom(this.slave.natural.artSeed - prompt.length) * availableColorsLatex.length);
		prompt = prompt.replaceAll('$colorLatex', availableColorsLatex[randomIndex] );

		randomIndex = Math.floor(seededRandom(this.slave.natural.artSeed - prompt.length) * availableColors.length);
		prompt = prompt.replaceAll('$color', availableColors[randomIndex] );

		randomIndex = Math.floor(seededRandom(this.slave.natural.artSeed - prompt.length) * availableMaterials.length);
		prompt = prompt.replaceAll('$material', availableMaterials[randomIndex] );

		return prompt;
	}


	/**
	 * Adds missing words to the negative prompt is aiAgeControl is active
	 * @param {string} negPrompt
	 * @returns {string}
	 */
	addNegativeControl(negPrompt) {
		const toAdd = ["penis", "pussy", "nude", "scrotum", "clitoris", "topless"];
		if (this.censored) {
			toAdd.forEach(w => {
				if (!negPrompt.includes(w)) {
					negPrompt += `${negPrompt.length > 0 ? ", " : ""}${w}`;
				}
			});
		}
		return negPrompt;
	}

	/**
	 * @override
	 */
	positive() {
		let basePrompt;
		if (V.customClothesPrompts.hasOwnProperty(this.getClothes()) && V.customClothesPrompts[this.getClothes()].positive !== '') {
			basePrompt = V.customClothesPrompts[this.getClothes()];
		} else {
			if (this.censored){
				basePrompt = this.clothesPromptsAgeControl[this.getClothes()] ?? this.clothesPrompts[this.getClothes()];
			} else {
				basePrompt = this.clothesPrompts[this.getClothes()];
			}
		}

		const coloredPrompt = this.replacer(basePrompt.positive);
		return [coloredPrompt];
	}

	/**
	 * @override
	 */
	negative() {
		let prompt = "";
		if (V.customClothesPrompts.hasOwnProperty(this.getClothes()) && V.customClothesPrompts[this.getClothes()].negative !== '') {
			prompt = this.addNegativeControl(V.customClothesPrompts[this.getClothes()].negative + (this.censored) ? ", (nude:1.3), (nipples:1.1), areola" : "");
		} else {
			prompt = this.censored ? this.addNegativeControl(this.clothesPromptsAgeControl[this.getClothes()]?.negative ?? this.clothesPrompts[this.getClothes()].negative) : this.clothesPrompts[this.getClothes()].negative;
		}
		if (prompt === "") {
			return [];
		}
		return [prompt];
	}
};
