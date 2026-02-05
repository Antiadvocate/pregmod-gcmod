App.Art.GenAI.Ill.LocationPromptPart = class LocationPromptPart extends App.Art.GenAI.PromptPart {
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
			return [this.clothBasedBackground(slave)];
		}
	}


	/**
	 * @override
	 */
	negative() {
		if (!V.aiLocationBackgrounds) {
			return [];
		}

		let parts = [];

		if (this.positive().includes("outdoor")) {
			parts.push("bedroom, bed");
		}

		if (this.slave.rules.living === "spare") {
			parts.push("decorations, furniture");
		}

		return parts;
	}

	/**
	 * @param { FC.SlaveState} slave
	 * @returns {Array<string>}
	 */
	assignmentBasedBackground(slave) {
		const societyStyles = {
			FSRomanRevivalist: "column, marble \\(stone\\), greco-roman architecture, frescoed walls",
			FSNeoImperialist: "militaristic decoration, tiles, black floor, black walls",
			FSEgyptianRevivalist: "column, sandstone, ancient egyptian",
			FSEdoRevivalist: "ancient japan, wooden beam, tatami",
			FSArabianRevivalist: "arabic decoration, arched doorways, lantern",
			FSChineseRevivalist: "ancient chinese decoration, wooden beam, red wooden pillar",
			FSAztecRevivalist: "mesoamerican architecture, aztec decoration",
			FSAntebellumRevivalist: "antebellum architecture, crystal chandeliers, patterned wallpaper",
		};

		let useEnv = false;
		let style = "";
		for (const [id, styleName] of Object.entries(societyStyles)) {
			if (FutureSocieties.isActive(id)) {
				style = styleName;
				break; // stop at the first active one
			}
		}

		let parts = [];
		switch (slave?.assignment) {
			case undefined:
				useEnv = true;
				parts.push("hallway");
				break;
			case Job.ARCADE:
				useEnv = true;
				parts.push("restrained, chain, handcuffs, ankle cuffs, neck ring, (bondage), (from side), fellatio, vaginal, sex, 2boys, penis, glory hole, cum on body, cum on breasts, neon lights, dark hallway");
				break;
			case Job.GLORYHOLE:
				useEnv = true;
				parts.push("glory hole, fellatio, handjob, double handjob, cum, cum on body");
				break;
			case Job.ARENA: // training
			case Job.PIT: // fighting
				useEnv = true;
				parts.push("arena, holding weapon");
				break;
			case Job.BROTHEL:
				useEnv = true;
				parts.push("pink light, indoors, love hotel, bedroom, bed, night");
				break;
			case Job.MADAM:
				useEnv = true;
				parts.push("pink light, indoors, love hotel, main hall");
				break;
			case Job.CELLBLOCK:
			case Job.CONFINEMENT:
				parts.push("prisoner, prison cell, prison, jail, jail cell, indoors, underground, dark room");
				break;
			case Job.WARDEN:
				parts.push("dark room, high-tech command room, computer screen, prison, prison cell");
				break;
			case Job.CLASSES:
			case Job.SCHOOL:
				useEnv = true;
				parts.push("classroom, school desk, desk, school chair, from side");
				break;
			case Job.TEACHER:
				useEnv = true;
				parts.push("classroom, teacher, teaching, chalkboard, holding book");
				break;
			case Job.CLINIC:
				useEnv = true;
				parts.push("clinic, hospital, hospital bed, monitor");
				break;
			case Job.NURSE:
				useEnv = true;
				parts.push("clinic, hospital, hospital bed, holding clipboard");
				break;
			case Job.CLUB:
				useEnv = true;
				parts.push("party, dance floor, neon lights, disco ball, crowd, orgy, sex, fellatio, cum on body, 3boys, penis");
				break;
			case Job.DJ:
				useEnv = true;
				parts.push("dj, dj desk, headphones, desk, disco ball, party, neon lights, crowd");
				break;
			case Job.WHORE:
				parts.push("alley, outdoors, night, 1boy, faceless, penis");
				break;
			case Job.PUBLIC:
				useEnv = true;
				parts.push("outdoors, crowd, street, orgy, sex, fellatio, cum on body, 3boys, penis");
				break;
			case Job.CONCUBINE:
			case Job.MASTERSUITE:
			case Job.FUCKTOY:
				useEnv = true;
				parts.push("upscale interior, luxurious apartment, on bed");
				break;
			case Job.BODYGUARD:
				useEnv = true;
				parts.push("indoors, luxurious apartment, bedroom, holding gun, handgun");
				break;
			case Job.MILKED:
			case Job.DAIRY:
			case Job.MILKMAID:
				parts.push("barn, stall");
				if (this.slave.dick > 0) {
					parts.push("penis milking");
				}
				break;
			case Job.HEADGIRL:
			case Job.HEADGIRLSUITE:
				useEnv = true;
				parts.push("office, desk, computer, monitor, whip");
				break;
			case Job.HOUSE:
			case Job.QUARTER:
			case Job.STEWARD:
				useEnv = true;
				parts.push("kitchen, cooking");
				break;
			case Job.SPA:
			case Job.ATTENDANT:
				useEnv = true;
				parts.push("onsen, wooden wall, indoors, waterfall, fog, in water");
				break;
			case Job.REST:
				parts.push("bedroom");
				switch (slave.rules.living) {
					case "normal":
						// nothing to add
						break;
					case "spare":
						parts.push("empty room, single bed");
						break;
					case "luxurious":
						parts.push("luxurious room, decorations");
						break;
				}
				break;
			case Job.RECRUITER:
				useEnv = true;
				parts.push("cafe, table, clipboard");
				break;
			case Job.AGENT:
			case Job.AGENTPARTNER:
				useEnv = true;
				parts.push("office, clipboard, large window");
				break;
			case Job.FARMER:
			case Job.FARMYARD:
				parts.push("outdoors, farm");
				break;
			case Job.MATRON: // head nursery nanny
			case Job.NURSERY: // nanny
				parts.push("crib");
				break; // I wouldn't worry about this location at the moment since the nursery is overdue for a rework - franklygeorge
			case Job.LURCHER:
				parts.push("outdoors, forest, path");
				break;
			case Job.TANK:
				parts.push("tank interior, driving");
				break;
			case Job.SUBORDINATE: // serving another slave. doesn't really have a location, though you could probably grab the location of their master using `getHuman(slave.subTarget)` though that would require restructuring this - franklygeorge
				parts.push("hallway");
				useEnv = true;
				break;
		}

		if (useEnv && style !== "") {
			parts.push(style);
		}

		return parts;
	}

	/**
	 * @param { FC.SlaveState} slave
	 * @returns {string}
	 */
	clothBasedBackground(slave) {
		switch (slave.clothes) {
			case "a ball gown":
			case "a courtesan dress":
			case "a halter top dress":
			case "a mini dress":
			case "a slave gown":
			case "a gothic lolita dress":
			case "an evening dress":
			case "a maternity dress":
				return "ballroom, marble floor, dancing crowd";
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
	 * @param {"bathing" | "club" | "penthouse"} type
	 * @returns {string}
	 */
	randomizer(type) {
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
		};
		const items = data[type];

		let randomIndex = Math.floor(seededRandom(this.slave.natural.artSeed - this.slave.clothes.length) * items.length);
		return items[randomIndex];
	}
};
