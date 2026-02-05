// cSpell:ignore xxmaskedxx, nopussy, flaccidfutanarimix, micropp
App.Art.GenAI.Ill.ClothesPromptPart = class ClothesPromptPart extends App.Art.GenAI.PromptPart {
	/** @type {Record<FC.Clothes, {positive: string, negative: string}>} */
	clothesPrompts = {
		"no clothing": {
			"positive": "nude",
			"negative": "",
		},
		"a Fuckdoll suit": {  // NG good gen requires LoRA, but below will work without LoRA as well
			"positive": "kneeling, latex bodysuit, bdsm, bondage, full body, bound, bound arms, bound legs, covered eyes, mask, anus cutout, pussy cutout, open mouth",
			"negative": "eyes, breasts",
		},
		"conservative clothing": {
			"positive": "black pants, white shirt",
			"negative": "",
		},
		"chains": {
			"positive": "chained, chained wrists, ankle cuffs, wrist cuffs, handcuffs, own hands together, nude,",
			"negative": "handcuff dangle, clothes, jeans, underwear, pants, shorts, skirt, panties",
		},
		"Western clothing": {
			"positive": "cowboy hat, white shirt, tied shirt, jeans",
			"negative": "",
		},
		"body oil": {
			"positive": "body oil, completely nude, oiled fur, shiny fur, glistening fur",
			"negative": "clothes, jeans, underwear, pants, shorts, skirt, panties",
		},
		"a toga": {
			"positive": "toga, linen clothing, gold belt, leather sandals",
			"negative": "",
		},
		"a huipil": {  // Doesn't work well
			"positive": "woven wrap top,  colorful short poncho, decorative sash, fringed mini skirt, layered bracelets, patterned textiles",
			"negative": "",
		},
		"a slutty qipao": {
			"positive": "china dress, breast cutout, short dress",
			"negative": "",
		},
		"a kimono": {
			"positive": "white kimono, long sleeves, long dress, sandals, white socks",
			"negative": "breasts, shoulder",
		},
		"spats and a tank top": {
			"positive": "bike shorts, tank top, spats \\(footwear\\)",
			"negative": "breasts",
		},
		"uncomfortable straps": {
			"positive": "nude, leather, harness, bondage",
			"negative": "",
		},
		"shibari ropes": {
			"positive": "nude, shibari, bondage, harness, thigh belt",
			"negative": "",
		},
		"restrictive latex": {
			"positive": "latex bodysuit, long sleeves, gloves, breasts out, breast cutout, shiny clothes",
			"negative": "",
		},
		"a latex catsuit": {  // Doesn't work well
			"positive": "catsuit, latex",
			"negative": "breast cutout, breasts",
		},
		"attractive lingerie": {
			"positive": "$color pants, g-string, lace trim, $color bra",
			"negative": "clothes, jeans, pants",
		},
		"attractive lingerie for a pregnant woman": {  // Cupless part doesn't work well
			"positive": "cotton thong, cotton bra, cotton stockings, cupless bra",
			"negative": "pants",
		},
		"kitty lingerie": {  // Broken for photorealistic models, probably works for anime models
			"positive": "kitty lingerie, cat lingerie, kawaii lingerie",
			"negative": "nude",
		},
		"a maternity dress": {
			"positive": "maternity dress, (short dress)",
			"negative": "breasts, breast cutout, stomach cutout, long dress",
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
			"negative": "jeans, nude",
		},
		"a chattel habit": {
			"positive": "white latex mini dress, white latex nun veil, long latex gloves, cross amulet, gold belt, latex stockings, transparent clothing, glossy finish,  glossy latex texture, reflective material",
			"negative": "",
		},
		"a nipple bikini": {
			"positive": "string bikini, micro bikini, $color bikini",
			"negative": "",
		},
		"a tankini": {
		  positive: "$color tankini, two-piece swimsuit, tankini top, bikini bottoms, swimwear",
		  negative: "one-piece swimsuit, dress, jeans, pants",
		},
		"a string bikini": {  // Cupless part doesn't work well
			"positive": "cupless bikini, string bikini, crotchless bikini, $color bikini",
			"negative": "",
		},
		"a scalemail bikini": {  // Doesn't work well
			"positive": "bikini armor, scale armor",
			"negative": "",
		},
		"striped panties": {
			"positive": "blue striped panties, bare breasts, topless",
			"negative": "",
		},
		"a cheerleader outfit": {
			"positive": "$color clothes, cheerleader, skirt, crop top, school emblem",
			"negative": "(pom pom)",
		},
		"clubslut netting": {
			"positive": "see-through clothes, see-through cleavage, $color bodysuit, fishnet bodysuit, crotchless, fishnet gloves, fishnets",
			"negative": "",
		},
		"cutoffs and a t-shirt": {
			"positive": "t-shirt, white shirt, short shorts, short jeans",
			"negative": "",
		},
		"slutty business attire": {
			"positive": "white blazer, white skirt, pencil skirt, microskirt, panties, black panties, plunging neckline",
			"negative": ""
		},
		"nice business attire": {
			"positive": "black blazer, black skirt, medium skirt, pencil skirt",
			"negative": "(cleavage)",
		},
		"a ball gown": {
			"positive": "$color dress, $material dress, gown, long gloves, long skirt, strapless",
			"negative": "",
		},
		"a slave gown": {
			"positive": "transparent lace dress, transparent clothing, anklet, long skirt, strapless",
			"negative": "",
		},
		"a halter top dress": {
			"positive": "$color $material dress, halter dress, luxurious dress, backless dress, long dress",
			"negative": "jeans, nude",
		},
		"an evening dress": {
			"positive": "$color $material evening gown, (medium dress)",
			"negative": "",
		},
		"a mini dress": {
			"positive": "$color $material short dress, strapless",
			"negative": "",
		},
		"a comfortable bodysuit": {
			"positive": "$colorLatex latex bodysuit, bare shoulders, long sleeves",
			"negative": "",
		},
		"a leotard": {
			"positive": "strapless leotard, $color leotard",
			"negative": "",
		},
		"a monokini": {
			"positive": `$color monokini, breasts out, ${V.aiAgeFilter ? "" : ", nipples"}`,
			"negative": "",
		},
		"an apron": {
			"positive": "naked apron, white apron, sideboob",
			"negative": "",
		},
		"overalls": {
			"positive": "naked overalls",
			"negative": "",
		},
		"a cybersuit": {
			"positive": "cyberpunk, catsuit, $colorLatex bodysuit, full body",
			"negative": "",
		},
		"a tight Imperial bodysuit": {
			"positive": "cyberpunk, catsuit, utility belt, bracer, armored bodysuit, pauldrons",
			"negative": "bare legs, bare arms, bare shoulders, nude",
		},
		"battlearmor": {
			"positive": "armor, chest armor, leg armor, arm armor, hip armor, pauldrons, armored gloves, armored boots, high collar, utility belt",
			"negative": "",
		},
		"Imperial Plate": {  // Doesn't work well
			"positive": "roman armor, armor, chest armor, leg armor, arm armor, hip armor, pauldrons, armored gloves, armored boots, high collar, utility belt",
			"negative": "",
		},
		"a bunny outfit": {
			"positive": "playboy bunny, rabbit ears, hairband, fishnets",
			"negative": "",
		},
		"a slutty maid outfit": {
			"positive": "maid apron, maid headdress, maid, microdress, white panties, cleavage cutout",
			"negative": "",
		},
		"a nice maid outfit": {
			"positive": "maid apron, maid headdress, maid, square neckline, long dress, dress lift",
			"negative": "",
		},
		"a slutty nurse outfit": {
			"positive": "nurse, nurse cap, microskirt, white latex dress, panties, cleavage cutout",
			"negative": "",
		},
		"a nice nurse outfit": {
			"positive": "nurse, nurse cap, medical scrubs, pants",
			"negative": "",
		},
		"a dirndl": {
			"positive": "dirndl, frilled dress, floral print, corset",
			"negative": "",
		},
		"a long qipao": {
			"positive": "chinese traditional dress, long dress",
			"negative": "",
		},
		"lederhosen": {
			"positive": "brown suede lederhosen, embroidery, suspenders, puffy sleeves, white sleeves, square neckline",
			"negative": "",
		},
		"a biyelgee costume": {  // Doesn't work well
			"positive": "biyelgee costume, turtleneck, medium dress, richly embroidered silk, wide decorative belt, long sleeves with ornate cuffs, intricate patterns, traditional headdress with beadwork and fabric accents",
			"negative": "",
		},
		"a hanbok": {
			"positive": "hanbok, jeogori \\(clothes\\), white cuffs, floral embroidery, wide ribbon, tied neatly at the front, white beoseon",
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
			"positive": "niqab, covered face, abaya, long dress, black dress",
			"negative": "",
		},
		"a burqa": {  // Doesn't work well
			"positive": "burqa, muslim clothes, mouth mask, long dress, black dress",
			"negative": "",
		},
		"a police uniform": {
			"positive": "police uniform, policewoman, police hat, jacket, pants, utility belt, holster",
			"negative": "",
		},
		"a gothic lolita dress": {
			"positive": "lolita fashion, medium dress, black dress, frilled dress, frilled sleeves, square neckline",
			"negative": "",
		},
		"a one-piece swimsuit": {
			"positive": "one-piece swimsuit, high collar",
			"negative": "",
		},
		"a nice pony outfit": {
			"positive": "bdsm, bodysuit, horse mask, face mask",
			"negative": "nude"
		},
		"a slutty pony outfit": {
			"positive": "bdsm, bodysuit, horse mask, breasts out",
			"negative": "",
		},
		"a button-up shirt and panties": {
			"positive": "collared shirt, loose clothes, oversized clothes, panties, no pants",
			"negative": "",
		},
		"a button-up shirt": {
			"positive": "collared shirt, loose clothes, oversized clothes, no panties, no pants, bottomless, pussy",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a sweater": {
			"positive": "sweater, oversized clothes, bottomless, no panties, no pants",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a t-shirt": {
			"positive": "t-shirt, oversized clothes, bottomless, no panties, no pants",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a tank-top": {
			"positive": "tank top, bottomless, no panties, no pants",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a tube top": {
			"positive": "tube top, bottomless, no panties, no pants",
			"negative": "jeans, pants, skirt, shorts, nude",
		},
		"an oversized t-shirt": {
			"positive": "t-shirt, (oversized clothes), bottomless, no panties, no pants",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a bra": {
			"positive": "bra, bottomless,(no panties), no pants",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a sports bra": {
			"positive": "sports bra, bottomless,(no panties), no pants",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a striped bra": {
			"positive": "striped bra, bottomless,(no panties), no pants",
			"negative": "jeans, pants, skirt, shorts",
		},
		"pasties": {  // Doesn't work well
			"positive": "pasties, bottomless,(no panties), no pants",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a tube top and thong": {
			"positive": "tube top, thong",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a sweater and panties": {
			"positive": "sweater, oversized clothes, panties",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a tank-top and panties": {
			"positive": "tank top, thong",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a t-shirt and thong": {
			"positive": "t-shirt, thong",
			"negative": "jeans, pants, skirt, shorts",
		},
		"an oversized t-shirt and boyshorts": {
			"positive": "t-shirt, oversized clothes, boyshort panties",
			"negative": "jeans, pants, skirt",
		},
		"sport shorts and a t-shirt": {
			"positive": "t-shirt, sports panties",
			"negative": "jeans, pants, skirt",
		},
		"sport shorts and a sports bra": {
			"positive": "sports bra, sports panties",
			"negative": "jeans, pants, skirt",
		},
		"a t-shirt and panties": {
			"positive": "t-shirt, panties",
			"negative": "jeans, pants, skirt, shorts",
		},
		"striped underwear": {
			"positive": "striped panties, striped bra",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a thong": {
			"positive": "thong, topless",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a skimpy loincloth": {
			"positive": "loincloth, topless",
			"negative": "jeans, pants, skirt, shorts",
		},
		"boyshorts": {
			"positive": "boyshort panties, topless",
			"negative": "jeans, pants, skirt",
		},
		"panties": {
			"positive": "panties, topless",
			"negative": "jeans, pants, skirt",
		},
		"panties and pasties": {  // Doesn't work well
			"positive": "panties, pasties",
			"negative": "jeans, pants, skirt",
		},
		"cutoffs": {
			"positive": "jean shorts, topless",
			"negative": "",
		},
		"sport shorts": {
			"positive": "sport shorts, topless",
			"negative": "jeans, pants, skirt",
		},
		"a sweater and cutoffs": {
			"positive": "sweater, jean shorts",
			"negative": "",
		},
		"leather pants and a tube top": {
			"positive": "leather pants, tube top, bare shoulders",
			"negative": "jeans, pants, skirt, shorts",
		},
		"a t-shirt and jeans": {
			"positive": "t-shirt, jeans",
			"negative": "",
		},
		"leather pants and pasties": {  // Doesn't work well
			"positive": "leather pants, pasties, topless",
			"negative": "jeans, pants, skirt, shorts",
		},
		"leather pants": {
			"positive": "leather pants, topless",
			"negative": "jeans, pants, skirt, shorts",
		},
		"jeans": {
			"positive": "jeans, topless",
			"negative": "",
		},
		"a military uniform": {
			"positive": "military uniform, shirt, necktie, miniskirt",
			"negative": "",
		},
		"a red army uniform": { // not red army, but soviet is at least close
			"positive": "soviet uniform, military uniform, shirt, necktie, miniskirt",
			"negative": "",
		},
		"battledress": {
			"positive": "military jacket, camouflage jacket, camouflage pants, tank top",
			"negative": "",
		},
		"a mounty outfit": {  // Doesn't work well
			"positive": "mounty, red military jacket, black pants",
			"negative": "jeans, shorts",
		},
		"harem gauze": {
			"positive": "veil, belly chain, harem outfit, loose clothes, see-through clothes",
			"negative": "",
		},
		"slutty jewelry": {
			"positive": "nude, ornate ring, gem, belly chain, chain between breasts, armlet, gold headband",
			"negative": ""
		},
		"a Santa dress": {
			"positive": "santa costume, santa dress, medium dress, fur trim",
			"negative": ""
		},
		"a bimbo outfit": {
			"positive": "pink tube top, pink skirt, latex, (miniskirt)",
			"negative": "jeans, nude",
		},
		"a slutty outfit": {
			"positive": "(pink:1.1) crop top, pink microskirt, panties, tight clothes, midriff, navel",
			"negative": "jeans, nude",
		},
		"a courtesan dress": {
			"positive": "long dress, layered fabric, corset, bare shoulders, long sleeves, detached sleeves",
			"negative": "",
		},
		"a schoolgirl outfit": {
			"positive": "school uniform, microskirt, white panties, pleated skirt, white blouse, tied shirt",
			"negative": "",
		},
		"petite admi outfit": {
			"positive": "pencil skirt, miniskirt, shirt, shirt tucked in",
			"negative": "nude",
		},
		"a superhero outfit": {
			"positive": "red and blue superman leotard, superman symbol, red cape, red boots, standing, hands on hips",
			"negative": "",
		},
		"a cardigan": {
			"positive": "crop top, loose cardigan, leather pants",
			"negative": "",
		},
		"a streetwear outfit": {
			"positive": "fishnet pantyhose, torn pantyhose, short denim skirt, crop top, leather jacket",
			"negative": "",
		},
		"a country outfit": {
			"positive": "embroidered corset top, puffed sleeves, flower embroidery, flared folk skirt",
			"negative": "",
		},
		"a leather outfit": {
			"positive": "black leather corset, sleeveless, tight leather pants, leather bracer",
			"negative": "",
		},
		"a turtleneck and miniskirt": {
			"positive": "form-fitting turtleneck sweater, leather mini skirt",
			"negative": "",
		},
		"a red priestess outfit": {
			"positive": "crimson red robe, detached sleeves, long skirt, bone headdress, corset, ruby necklace, lace, praying",
			"negative": "",
		},
		"an eastern european outfit": {
			"positive": "embroidered blouse, corset, long floral skirt, floral crown",
			"negative": "",
		},
		"a samba outfit": {
			"positive": "carnival outfit, elaborate feathered headdress, jeweled bikini, sparkling bra top, beaded thong, feathered backpiece, sequins, decorative arm bands, shimmering textures",
			"negative": "",
		},
		"a tribal outfit": {
			"positive": "tribal-inspired outfit, beaded halter top, decorative feathers, feather headdress, leather armband, fringed mini skirt, leather straps, ornamental patterns, braided accessories, sensual tribal fashion",
			"negative": "",
		},
		"a tropical outfit": {
			"positive": "woven grass skirt, woven grass bra top, flower lei, decorative arm bands",
			"negative": "",
		},
		"a valkyrie outfit": {
			"positive": "fur-trimmed leather corset, metal accents, metal bracer, mini skirt, fur coat, braided hair accessories, warrior elegance, valkyrie",
			"negative": "",
		},
		"a baroque dress": {
			"positive": "$color petticoat baroque dress, long dress, square neckline",
			"negative": "",
		},
		"a cocktail dress": {
			"positive": "$color frill cocktail dress, medium dress, off-the-shoulder design, fitted waist",
			"negative": "",
		},
		"an ice queen outfit": {
			"positive": "long dress, long skirt, white dress, lace trim, fur coat, white crown",
			"negative": "bare legs, highleg, lowleg",
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
			"positive": "white wedding dress, long dress, frilled dress, veil, holding a rose bouquet",
			"negative": "bare legs, highleg, lowleg",
		},
		"an armored dress": {
			"positive": "long skirt, (armored dress), armored corset, gold embroidery, royal cloak, metal accessories, shoulder pads, bracer",
			"negative": "bare legs, highleg, lowleg",
		},
		"a babydoll": {
			"positive": "$color babydoll nightgown, transparent fabric, bows",
			"negative": "",
		},
		"a coat and corset": {
			"positive": "black trench coat, corset, lace stockings, lace skirt, miniskirt",
			"negative": "",
		},
		"a frilly bikini": {
			"positive": "$color ruffled bikini set, frill bikini, frill bikini bottom, frilly details",
			"negative": "",
		},
		"a hoodie": {
			"positive": "$color hoodie, oversized hoodie, nude, bottomless",
			"negative": "jeans, pants, skirt, shorts"
		},
		"a cardigan and sundress": {
			"positive": "cardigan, sundress, casual dress",
			"negative": "jeans, pants, suit",
		},
		"a denim jacket and skirt": {
			"positive": "denim jacket, short skirt, casual outfit",
			"negative": "long dress, pants",
		},
		"a blazer and pencil skirt": {
			"positive": "blazer, pencil skirt, blouse, office attire",
			"negative": "lingerie, nude",
		},
		"a lace bodysuit": {
			"positive": "lace bodysuit, lingerie, sheer fabric",
			"negative": "jeans, pants, skirt",
		},
		"a slip dress": {
			"positive": "silk slip dress, spaghetti straps, lingerie dress",
			"negative": "jeans, pants",
		},
		"yoga set": {
			"positive": "sports bra, high-waisted leggings, yoga outfit",
			"negative": "jeans, skirt, dress",
		},
		"a witch outfit": {
			"positive": "witch hat, corset dress, capelet, witch costume",
			"negative": "jeans, pants",
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
			"positive": "qipao, chinese clothing, cleavage cutout",
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
			"positive": "(latex nun habit:1.1), ropes, medium dress",
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
			"positive": "gown, long dress, luxurious dress, cleavage, slave straps",
			"negative": "jeans",
		},
		"a halter top dress": {
			"positive": "halterneck, long dress, luxurious dress, backless dress",
			"negative": "jeans",
		},
		"a leotard": {
			"positive": "leotard",
			"negative": "jeans",
		},
		"a monokini": {
			"positive": "swimsuit, monokini, breasts out",
			"negative": "jeans",
		},
		"an apron": {
			"positive": "naked apron, white apron, sideboob",
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
		if (this.slave.race === "catgirl") {
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
		prompt = prompt.replaceAll('$colorLatex', availableColorsLatex[randomIndex]);

		randomIndex = Math.floor(seededRandom(this.slave.natural.artSeed - prompt.length) * availableColors.length);
		prompt = prompt.replaceAll('$color', availableColors[randomIndex]);

		randomIndex = Math.floor(seededRandom(this.slave.natural.artSeed - prompt.length) * availableMaterials.length);
		prompt = prompt.replaceAll('$material', availableMaterials[randomIndex]);

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
			if (this.censored) {
				basePrompt = this.clothesPromptsAgeControl[this.getClothes()] ?? this.clothesPrompts[this.getClothes()];
			} else {
				basePrompt = this.clothesPrompts[this.getClothes()];
			}
		}

		let positive = "";

		if (this.helper.tightTops(this.getClothes())) {
			positive += ", covered nipples";
		}

		const coloredPrompt = this.replacer(basePrompt.positive + positive);
		return [coloredPrompt];
	}

	/**
	 * @override
	 */
	negative() {
		let prompt;
		if (V.customClothesPrompts.hasOwnProperty(this.getClothes()) && V.customClothesPrompts[this.getClothes()].negative !== '') {
			prompt = this.addNegativeControl(V.customClothesPrompts[this.getClothes()].negative + (this.censored) ? ", (nude:1.3), (nipples:1.1), areola" : "");
		} else {
			prompt = this.censored
				? this.addNegativeControl(this.clothesPromptsAgeControl[this.getClothes()]?.negative ?? this.clothesPrompts[this.getClothes()].negative)
				: this.clothesPrompts[this.getClothes()].negative;
		}
		let parts = [];
		if (prompt !== "") {
			parts.push(prompt);
		}

		let slave = asSlave(this.slave);
		if (!this.helper.exposesCrotch(this.getClothes()) && !this.helper.activelyExposesCrotch(slave?.assignment)) {
			parts.push("pussy");
		}

		if (!this.helper.exposesNipples(this.getClothes())) {
			parts.push("nipples");
		}

		return parts;
	}
};
