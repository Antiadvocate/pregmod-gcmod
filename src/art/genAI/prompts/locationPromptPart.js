App.Art.GenAI.LocationPromptPart = class LocationPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (V.aiLocationBackgrounds === 0) {
			return [];
		}
		const slave = asSlave(this.slave);

		if (V.aiLocationBackgrounds === 1) {
			return this.assignmentBasedBackground(slave);
		} else {
			return [this.clothingBasedBackground(slave)];
		}
	}

	/**
	 * @param {FC.SlaveState} slave
	 * @returns {Array<string>}
	 */
	assignmentBasedBackground(slave) {
		let style;
		const societyStyles = {
			FSRomanRevivalist: "marble columns, mosaic tile flooring, frescoed walls",
			FSNeoImperialist: "black marble floor, black marble walls",
			FSEgyptianRevivalist: "sandstone columns, hieroglyphic wall carvings, striped stone flooring, gold-trimmed decor",
			FSEdoRevivalist: "shoji screen walls, tatami mat flooring, wooden beams, minimalist decor",
			FSArabianRevivalist: "mashrabiya screens, arched doorways, mosaic tile walls, ornate lantern sconces",
			FSChineseRevivalist: "wooden lattice screens, carved red columns, curved roof beams",
			FSAztecRevivalist: "aztec architecture",
			FSAntebellumRevivalist: "antebellum architecture, crystal chandeliers, patterned wallpaper",
		};

		for (const [id, styleName] of Object.entries(societyStyles)) {
			if (FutureSocieties.isActive(id)) {
				style = styleName;
				break; // stop at the first active one
			}
		}
		const parts = [];
		switch (slave?.assignment) {
			case undefined:
				parts.push(style);
				parts.push("hallway");
				break;
			case Job.ARCADE:
			case Job.GLORYHOLE:
				parts.push(style);
				parts.push("dark sterile hallway, neon lights");
				break;
			case Job.ARENA: // training
			case Job.PIT: // fighting
				parts.push("boxing ring, wwe arena");
				break;
			case Job.BROTHEL:
				parts.push(style);
				parts.push("red upscale interior, red room, red light, bed, dark atmosphere");
				break;
			case Job.MADAM:
				parts.push(style);
				parts.push("red upscale interior, red room, red light, dark atmosphere, gold decor, night, grand staircase, chandelier");
				break;
			case Job.CELLBLOCK:
			case Job.CONFINEMENT:
				parts.push("prison cell, prison bars, dark walls");
				break;
			case Job.WARDEN:
				parts.push("dark room, high tech command room, computer screens, dark surrounding, prison bars");
				break;
			case Job.CLASSES:
			case Job.SCHOOL:
			case Job.TEACHER:
				parts.push(style);
				parts.push("school room, chalkboard background, school desk");
				break;
			case Job.CLINIC:
			case Job.NURSE:
				parts.push("hospital, examination room, white tiled wall, clinic");
				break;
			case Job.CLUB:
				parts.push(style);
				parts.push("dance club, dance floor, flashing neon lights, dancing crowd");
				break;
			case Job.DJ:
				parts.push(style);
				parts.push("dance club, dance floor, flashing neon lights, raised stage, dj desk, headphones, mixing music");
				break;
			case Job.WHORE:
			case Job.PUBLIC:
				parts.push(style);
				parts.push("bustling street, walking crowd, outdoor");
				break;
			case Job.CONCUBINE:
			case Job.MASTERSUITE:
			case Job.FUCKTOY:
			case Job.BODYGUARD:
				parts.push(style);
				parts.push("upscale interior, luxurious apartment, bed");
				break;
			case Job.MILKED:
			case Job.DAIRY:
			case Job.MILKMAID:
				parts.push("dairy, milking stalls, milk tanks");
				break;
			case Job.HEADGIRL:
			case Job.HEADGIRLSUITE:
				parts.push(style);
				parts.push("office, desk, computer monitor, rustic interior, office chair, dark wood");
				break;
			case Job.HOUSE:
			case Job.QUARTER:
			case Job.STEWARD:
				parts.push(style);
				parts.push("modern kitchen, kitchen, dark wood");
				break;
			case Job.SPA:
			case Job.ATTENDANT:
				parts.push("spa, stone floor, wood walls, indoor pool, indoor waterfall");
				break;
			case Job.REST:
				parts.push("bedroom");
				switch (slave.rules.living) {
					case "normal":
						// nothing to add
						break;
					case "spare":
						parts.push("empty room, sparse room");
						break;
					case "luxurious":
						parts.push("luxurious room");
						break;
				}
				break;
			case Job.RECRUITER:
				parts.push("coffee shop, clipboard");
				break;
			case Job.AGENT:
			case Job.AGENTPARTNER:
				parts.push("office, clipboard, big windows");
				break;
			case Job.FARMER:
			case Job.FARMYARD:
				parts.push("outdoor, farm");
				break;
			case Job.MATRON: // head nursery nanny
			case Job.NURSERY: // nanny
				break; // I wouldn't worry about this location at the moment since the nursery is overdue for a rework - franklygeorge
			case Job.LURCHER:
				parts.push("outdoor, trail, forest");
				break;
			case Job.TANK:
				if (!this.helper.isXLBased()) { // while SD1.X seems to have a reasonable understanding of this concept. XL+ doesn't or I am using the wrong prompting - franklygeorge
					parts.push("cloning tank"); // TODO: this prompt could use more work. Could also use a LoRA to solidify its understanding. - franklygeorge
				}
				break;
			case Job.SUBORDINATE: // serving another slave. doesn't really have a location, though you could probably grab the location of their master using `getHuman(slave.subTarget)` though that would require restructuring this - franklygeorge
				break;
		}
		return parts;
	}

	/**
	 * @param {FC.SlaveState} slave
	 * @returns {string}
	 */
	clothingBasedBackground(slave) {
		switch (slave.clothes) {
			case "a ball gown":
			case "a courtesan dress":
			case "a halter top dress":
			case "a mini dress":
			case "a slave gown":
			case "a gothic lolita dress":
			case "an evening dress":
			case "a maternity dress":
				return this.randomizer("dress");
			case "a bimbo outfit":
			case "a bunny outfit":
			case "clubslut netting":
			case "a slutty outfit":
			case "a tube top":
			case "a tube top and thong":
			case "leather pants":
			case "leather pants and a tube top":
			case "leather pants and pasties":
			case "no clothing":
				return this.randomizer("club");
			case "a biyelgee costume":
			case "a dirndl":
			case "a klan robe":
			case "lederhosen":
			case "Western clothing":
			case "a confederate army uniform":
				return "outdoor, folk festival, dancing crowd";
			case "a bra":
			case "a button-up shirt":
			case "a button-up shirt and panties":
			case "a skimpy loincloth":
			case "a sports bra":
			case "a striped bra":
			case "a sweater":
			case "a sweater and cutoffs":
			case "a sweater and panties":
			case "a t-shirt":
			case "a t-shirt and jeans":
			case "a t-shirt and panties":
			case "a t-shirt and thong":
			case "a tank-top":
			case "a tank-top and panties":
			case "a thong":
			case "an oversized t-shirt":
			case "an oversized t-shirt and boyshorts":
			case "attractive lingerie":
			case "attractive lingerie for a pregnant woman":
			case "boyshorts":
			case "choosing her own clothes":
			case "cutoffs":
			case "jeans":
			case "kitty lingerie":
			case "cutoffs and a t-shirt":
			case "panties":
			case "panties and pasties":
			case "pasties":
			case "striped panties":
			case "striped underwear":
				return this.randomizer("penthouse");
			case "a burkini":
			case "a monokini":
			case "a one-piece swimsuit":
			case "a scalemail bikini":
			case "a string bikini":
				return this.randomizer("bathing");
			case "a chattel habit":
			case "a fallen nuns habit":
			case "a penitent nuns habit":
			case "a succubus outfit":
				return "church, altar, big windows";
			case "a burqa":
			case "a hijab and abaya":
			case "a hijab and blouse":
			case "a niqab and abaya":
				return "mosque";
			case "a cheerleader outfit":
			case "spats and a tank top":
			case "sport shorts":
			case "sport shorts and a sports bra":
			case "sport shorts and a t-shirt":
			case "stretch pants and a crop-top":
				return "stadium, football field, cheering crowd";
			case "a comfortable bodysuit":
			case "a cybersuit":
			case "a Fuckdoll suit":
			case "a latex catsuit":
				return "cyberpunk street, neon light, night";
			case "a hanbok":
			case "a huipil":
			case "a kimono":
			case "a long qipao":
			case "a slutty qipao":
			case "a toga":
				return "hotel lobby, traditional architecture";
			case "a leotard":
				return "dance studio, big mirror wall";
			case "a military uniform":
			case "conservative clothing":
			case "nice business attire":
			case "slutty business attire":
				return "office, rustic interior, office chair, office desk, bookshelf";
			case "a nice maid outfit":
			case "a slutty maid outfit":
			case "an apron":
				return "modern kitchen, kitchen";
			case "a nice nurse outfit":
			case "a slutty nurse outfit":
				return "hospital, clinice, examination room";
			case "a police uniform":
				return "street, night, police cruiser, flashing lights";
			case "a schoolgirl outfit":
				return "school room, chalkboard background, school desk";
			case "battlearmor":
			case "Imperial Plate":
			case "a tight Imperial bodysuit":
			case "battledress":
				return "outdoor, airfield, fighter jet";
			case "harem gauze":
			case "slutty jewelry":
				return "arabian room, silk curtains, sandstone";
			case "restrictive latex":
			case "shibari ropes":
			case "uncomfortable straps":
				return "prison cell, prison bars, dark walls";
			/* case "a mounty outfit":
			case "a nice pony outfit":
			case "a red army uniform":
			case "a Santa dress":
			case "a schutzstaffel uniform":
			case "a slutty klan robe":
			case "a slutty pony outfit":
			case "a slutty schutzstaffel uniform":
			case "body oil":
			case "chains":
			case "overalls":
			 */
			default:
				return "hallway";
		}
	}


	/**
	 * @override
	 */
	negative() {
		if (!V.aiLocationBackgrounds) {
			return [];
		}
		if (this.positive().includes("outdoor")) {
			return ["bedroom, bed"];
		}
	}

	/**
	 * @param {"bathing" | "club" | "penthouse" | "dress"} type
	 * @returns {string}
	 */
	randomizer(type) {
		/**
		 * @param {string} str
		 */
		function hashString(str) {
			let hash = 5381;
			for (let i = 0; i < str.length; i++) {
				hash = (hash * 33) ^ str.charCodeAt(i);
			}
			return hash >>> 0; // Ensure unsigned 32-bit integer
		}

		/**
		 * Selects a posture from the given list based on artSeed and clothes.
		 * @param {number} seed - The artSeed (e.g. person ID).
		 * @param {string} clothes - The clothing description.
		 * @param {string[]} array - An array of entry strings to choose from.
		 * @returns {string} - A deterministically selected posture.
		 */
		function getEntryForSeedAndClothes(seed, clothes, array) {
			const combined = `${seed}:${clothes}`;
			const hash = hashString(combined);
			const index = hash % array.length;
			return array[index];
		}


		let livingString = "apartment";
		switch (this.slave.rules.living) {
			case "spare":
				livingString = "empty apartment, sparse apartment";
				break;
			case "luxurious":
				livingString = "luxurious apartment";
				break;
		}
		const data = {
			bathing: [
				"wet skin, beach, palms, sunset",
				"wet skin, tropical setting, corals",
				"wet skin, skyscraper, city skyline, jacuzzi, partially under water",
				"wet skin, indoor pool",
				"wet skin, pool mediterranean mansion",
				"tropical waterfall, resort, wood floor, sunset",
				"beach, sand, sun lounger",
				"crystal wall, spa temple, red silk curtains, steam, water pool, flower petals on surface, oiled skin, pool edge",
				"twilight beach setting, orange-pink sky, wet sand, waves, sensual atmosphere",
			],
			club: [
				"strip club, dance floor",
				"grungy bar, counter, beverages",
				"vintage bar, counter, beverages",
				"rooftop bar, counter, beverages",
				"beach bar, sand, sunset, counter, beverages",
			],
			penthouse: [
				`${livingString}, vintage interior`,
				`${livingString}, vintage interior, bed`,
				`${livingString}, modern interior`,
				`${livingString}, modern interior, bed`,
				`${livingString}, futuristic interior, neon glow`,
				`${livingString}, futuristic interior, neon glow, bed`,
			],
			dress: [
				"castle balcony at night, full moon overhead, dark clouds, hands on railing, spires",
				"holding a single glass, towering stained glass windows",
				"sunlit palace hall,  golden columns, open archways, warm ambient light, playing with hair",
				"ornate private lounge, cream walls with gold accents, plush red seating, soft daylight through lace curtains",
				"imperial garden terrace, trimmed hedges, flowering trees, decorative fountains, marble balustrade, golden afternoon sun",
				"gilded garden terrace, sunset, carved stone balustrade, mountain view, mediterranean flowers, mediterranean landscape, ocean",
				"opulent ballroom, red velvet curtains, moonlight through arched windows",
				"luxurious apartment, vintage interior",
				"sitting on couch, leaning to side, lavish bedroom, art nouveau decor, ornate golden bedframe, stained glass windows with floral patterns, warm golden tones, antique furniture, plush red velvet pillows",
				"standing, stone bench, wrought iron garden pavilion, roses blooming, soft focus, sunlight, vines",
				"silk sheets, dim bedside lamp, soft shadows, red velvet curtains, lying on side, hand on hip",

			],
		};
		const items = data[type];
		return getEntryForSeedAndClothes(this.slave.natural.artSeed, this.slave.clothes, items);
	}
};
