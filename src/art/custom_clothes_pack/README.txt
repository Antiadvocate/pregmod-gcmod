Custom clothes pack (self-contained)

Adds 7 new outfits as self-contained App.Data.clothes overrides:
- a cardigan and sundress
- a denim jacket and skirt
- a blazer and pencil skirt
- a lace bodysuit
- a slip dress
- yoga set
- a witch outfit

Install:
1) Copy Mods/CustomClothes/* into your game's src/Mods/CustomClothes/ (create folder if needed).
   These files call App.Data.clothes.set(...) to register the new outfits.

2) Add matching entries to GenAI clothes prompt maps:
   - src/art/genAI/illustriousPrompts/clothesIllustriousPromptPart.js
   - src/art/genAI/prompts/clothesPromptPart.js (optional, if you still use non-Illustrious prompts)

Suggested prompt-map entries are included below.

Illustrious prompt-map snippet (paste into clothesPrompts object):

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
			"positive": "witch hat, corset dress, capelet, halloween costume",
			"negative": "jeans, pants",
		},

Non-Illustrious prompt-map snippet (optional):

		"a cardigan and sundress": {
			"positive": "cardigan, sundress, casual dress",
			"negative": "jeans, pants",
		},
		"a denim jacket and skirt": {
			"positive": "denim jacket, short skirt, casual outfit",
			"negative": "long dress, pants",
		},
		"a blazer and pencil skirt": {
			"positive": "blazer, pencil skirt, blouse",
			"negative": "lingerie, nude",
		},
		"a lace bodysuit": {
			"positive": "lace bodysuit, lingerie, sheer fabric",
			"negative": "jeans, pants",
		},
		"a slip dress": {
			"positive": "silk slip dress, spaghetti straps",
			"negative": "jeans, pants",
		},
		"yoga set": {
			"positive": "sports bra, high-waisted leggings, yoga outfit",
			"negative": "jeans, skirt, dress",
		},
		"a witch outfit": {
			"positive": "witch hat, short dress, capelet",
			"negative": "jeans, pants",
		},
