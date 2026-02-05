/* eslint-disable no-unused-vars */
// cspell:ignore anyth

/**
 * @type {Array<{ prereqs: Array<actorPredicate>, getGreeting: (s: FC.SlaveState) => string }>}
 */
// Alternate Greetings are drawn from existing FC Events with minimal adaptations, dropping response options in favor of LLM RP
// This aligns AltGreetings lore with existing FC Lore.
// Prerequisites are likewise drawn from their FC Events, so that AltGreetings will only be exported if they match slave descriptions, e.g. badDream only applies to low trust slaves
// Prerequisites have been pared back to be more broadly applicable, e.g. slave assignment prerequisites dropped for lazyEvening, "need" from desperatelyHorny
// Idea here is that bias should be to export the AltGreeting if it makes sense for base slave attributes (trust, obedience, body), and ignore easily changed ones (rules, assignments, etc.)
// New AltGreetings can simple be added on below using same schema; they will be exported to applicable slaves automatically without need to edit other files
// Tests with Mistral showed better results using the FC Event's native second person for AltGreeting, rather than first person, so this was left unchanged. NG Aug 2024
App.UI.SlaveInteract.SlaveBotGreetings = [
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself, girl, hers
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			// SRC deperatelyHorny.js
			let r = [];
			r.push(
				`Looking deeply unhappy and shivering occasionally, ${s.slaveName}, comes to see you.`
			);
			if (s.rules.speech === "restrictive") {
				r.push(`Since ${he} is not allowed to speak, ${he} just enters your office and stands there, unsure what to do.`);
			} else {
				if (!canTalk(s)) {
					r.push(`${He} tries to communicate something with ${his}`);
					if (hasBothArms(s)) {
						r.push(`hands,`);
					} else {
						r.push(`hand,`);
					}
					r.push(`but ${he}'s so distracted ${he} can't manage it. ${He} starts to shake a little and gives up.`);
				} else {
					r.push(
						Spoken(s, `"${Master}, please! Please — I — please, I need to — oh, ${Master}—"`),
						he
					);
					if (SlaveStatsChecker.checkForLisp(s)) {
						r.push(`lisps frantically.`);
					} else {
						r.push(`babbles.`);
					}
					r.push(`${He} starts to shake a little and lapses into silence.`);
				}
			}
			r.push(`The reason for ${his} distress is obvious:`);
			if (s.chastityPenis === 1) {
				r.push(`${his} chastity cage is mostly solid, but it has a small hole below where the tip of ${his} dick is held, and this is dripping precum. ${He}'s sexually helpless, and sexually overcharged to the point where ${he}'s dripping more precum than a usual dickgirl might ejaculate normally.`);
			} else if (s.dick > 0 && s.hormoneBalance >= 100 && !canAchieveErection(s)) {
				r.push(`though the hormones are keeping it soft, ${his} member is dripping a stream of precum; droplets of the stuff spatter ${his} legs. One of ${his} spasms brings ${his} dickhead brushing against ${his} thigh, and the stimulation almost brings ${him} to orgasm.`);
			} else if (s.dick > 0 && s.balls > 0 && s.ballType === "sterile" && !canAchieveErection(s)) {
				r.push(`though ${he}'s chemically castrated, ${his} soft member is dripping a stream of watery precum; droplets of the stuff spatter ${his} legs. One of ${his} spasms brings ${his} dickhead brushing against ${his} thigh, and the stimulation almost brings ${him} to orgasm.`);
			} else if (s.dick > 0 && s.balls === 0 && !canAchieveErection(s)) {
				r.push(`though ${he}'s gelded, ${his} soft member is dripping a stream of watery precum; droplets of the stuff spatter ${his} legs. One of ${his} spasms brings ${his} dickhead brushing against ${his} thigh, and the stimulation almost brings ${him} to orgasm.`);
			} else if (s.dick > 0 && !canAchieveErection(s)) {
				r.push(`though ${he}'s far too large to get hard, ${his} engorged member is dripping a stream of watery precum; droplets of the stuff spatter the floor. One of ${his} spasms brushes the length of ${his} cock against ${his} thigh, and the stimulation almost brings ${him} to orgasm.`);
			} else if (s.dick > 0) {
				if (s.dick > 4) {
					r.push(`${his} gigantic member juts out painfully, scattering droplets of precum whenever ${he} moves. One of ${his} spasms brings ${his} dickhead brushing up against ${his}`);
				} else if (s.dick > 2) {
					r.push(`${his} impressive member juts out painfully, scattering droplets of precum whenever ${he} moves. One of ${his} spasms brings ${his} dickhead brushing up against ${his}`);
				} else {
					r.push(`${his} little member juts out painfully, scattering droplets of precum whenever ${he} moves. One of ${his} spasms brings ${his} dickhead brushing up against ${his}`);
				}
				if (s.belly >= 10000 || s.weight > 95) {
					r.push(belly);
					if (s.bellyPreg >= 3000) {
						r.push(`pregnancy,`);
					} else {
						r.push(`belly,`);
					}
				} else {
					r.push(`abdomen,`);
				}
				r.push(`and the stimulation almost brings ${him} to orgasm.`);
			} else if (s.chastityVagina) {
				r.push(`female juices are leaking out from behind ${his} chastity belt. ${His} cunt desperately wants to be fucked, and is dripping natural lubricant to ease penetration by cocks that cannot reach it through its protective shield.`);
			} else if (s.clit > 3) {
				r.push(`${his} dick-like clit is painfully engorged and juts out massively. The stimulation of the air on ${his} clit keeps ${him} on the brink of orgasm.`);
			} else if (s.clit > 0) {
				r.push(`${his} lovely clit is painfully engorged, and ${his} pussy is so wet there are little rivulets of moisture running down ${his} inner thighs. One of ${his} spasms brings ${his} clit brushing accidentally against ${his} hand, and the stimulation almost brings ${him} to orgasm.`);
			} else if (s.labia > 0) {
				r.push(`${his} lovely pussylips are painfully engorged, and ${his} pussy is so wet there are little rivulets of moisture running down ${his} inner thighs. One of ${his} spasms brings ${his} generous labia brushing against ${his} thighs, and the stimulation almost brings ${him} to orgasm.`);
			} else if (s.vagina === -1) {
				r.push(`though ${he} has no external genitalia to display it, ${he}'s flushed and uncomfortable, and is unconsciously presenting ${his} ass, since that's ${his} only real avenue to climax.`);
			} else {
				r.push(`${his} pussy is so wet there are little rivulets of moisture running down ${his} inner thighs. One of ${his} spasms brings ${him} enough stimulation that it almost brings ${him} to orgasm.`);
			}
			r.push(`\n\nThis is the result of not getting off for several days while on the slave diet provided by the nutritional systems. The mild aphrodisiacs included in ${his} food increase ${his} sex drive, and the increased libido can become cumulative if it's not regularly addressed. It looks like ${he} hasn't really gotten ${hers} in a couple of days, and the poor ${girl} can likely think of nothing but that. ${He}'s so horny ${he}'ll do anything for release. However, ${he} did come to you with ${his} trouble rather than masturbating illicitly.`);
			return r.join(" ");
		},
		prereqs: [
			/* TESTING */
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			s => s.devotion >= -20,
			s => s.trust >= -50,
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself, hers
			} = getPronouns(s);
			const belly = bellyAdjective(s);
			// SRC badDream.js
			let r = [];
			r.push(
				`Passing near the slave dormitory late at night, you hear a quiet cry within. This is strange; most slaves housed there are not inclined or not allowed to have sex in the middle of the night, and in any case, the noise wasn't one of pleasure. Looking in, you see a jerky movement near the door. It's ${s.slaveName} and ${he}'s obviously having a bad dream. ${He} raises`
			);
			if (hasBothArms(s)) {
				r.push(`an`);
			} else {
				r.push(`${his}`);
			}
			r.push(`arm to fend off some imagined danger, and in doing so, pushes the sheet down around ${his} waist. ${He} sleeps naked, like all your slaves, and the movement bares ${his}`);
			if (s.boobs > 2000) {
				r.push(`udders`);
			} else if (s.boobs > 1000) {
				r.push(`heavy breasts`);
			} else if (s.boobs > 400) {
				r.push(`boobs`);
			} else {
				r.push(`little tits`);
			}
			if (s.belly >= 5000) {
				r.push(`and ${belly}`);
				if (s.bellyPreg >= 3000) {
					r.push(`pregnant`);
				}
				r.push(`belly`);
			}
			r.push(`to the cool night air. The low blue light outlines ${his} nipples as they`);
			if (s.nipples !== "fuckable") {
				r.push(`stiffen`);
			} else {
				r.push(`swell`);
			}
			r.push(`at the sudden change of temperature,`);
			switch (s.nipples) {
				case "tiny":
					r.push(`pricking up into little buds.`);
					break;
				case "flat":
					r.push(`becoming visible against ${his} areolae.`);
					break;
				case "puffy":
					r.push(`the puffy promontories jutting even farther out.`);
					break;
				case "partially inverted":
					r.push(`just starting to poke past their inversion.`);
					break;
				case "inverted":
					r.push(`the twin domes formed by their inverted shapes becoming more prominent.`);
					break;
				case "huge":
					r.push(`becoming so large they cast long shadows across ${his} bed.`);
					break;
				case "fuckable":
					r.push(`the fuckable holes steadily closing and starting to poke outwards.`);
					break;
				default:
					r.push(`becoming attractively erect.`);
			}
			r.push(`Still dreaming, ${he} clasps ${his}`);
			if (hasBothArms(s)) {
				r.push(`arms`);
			} else {
				r.push(`arm`);
			}
			r.push(`protectively over ${his}`);
			if (s.pregKnown === 1) {
				r.push(`unborn`);
				if (s.pregType > 1) {
					r.push(`children,`);
				} else {
					r.push(`child,`);
				}
			} else {
				r.push(`vulnerable chest,`);
			}
			r.push(`and rolls to one side. Halfway into a fetal position, ${he} turns ${his} head against ${his} pillow, murmuring`);
			if (s.accent <= 2) {
				r.push(Spoken(s, `"N-no — please no — I'll d-do anyth-thing — no..."`));
			} else {
				r.push(`earnest protests in ${his} mother tongue.`);
			}
			return r.join(" ");
		},
		prereqs: [
			/* TESTING */
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			s => canTalk(s, false),
			s => s.devotion <= 20,
			s => s.trust < -20
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, His, his, hers, him, himself, girl, woman
			} = getPronouns(s);
			const {title} = getEnunciation(s);
			// SCR lazyEvening.js
			let t = [];
			t.push(`Although your life as an arcology owner comes with many associated privileges, extended idleness to bask in your luxury is not often among them. Thankfully, ${V.assistant.name} knows better than to let you run yourself ragged from the weight of your assorted responsibilities and often allots time in the evenings of your active schedule to simply relax.`);

			t.push(`\n\nOf course, no self respecting arcology owner could be expected to enjoy a lazy night of idle relaxation on their own. As you resolve the last of your most pressing responsibilities for the evening, ${V.assistant.name} directs one of your attentive slaves to gently guide you away from the unending burdens of running your arcology. Leaning against the doorway and wearing a facsimile of what an old world ${woman} might wear on a casual night in, ${s.slaveName}`);
			if (!canTalk(s)) {
				t.push(`asks with a gesture that carries just the right mixture of submission and exaggerated casualness if you'd like to 'hang out.'`);
			} else if (SlaveStatsChecker.checkForLisp(s)) {
				t.push(
					`lisps with exaggerated casualness,`,
					Spoken(s, `"Let's hang out, ${title}?"`)
				);
			} else {
				t.push(
					`asks with exaggerated casualness,`,
					Spoken(s, `"Want to hang out, ${title}?"`)
				);
			}

			t.push(`\n\n${He} saunters over and`);
			if (s.belly >= 100000) {
				t.push(`struggles to lower ${his} ${bellyAdjective(s)} form to an obedient kneel`);
			} else if (s.belly >= 10000) {
				t.push(`gingerly lowers ${his} heavily ${s.bellyPreg > 3000 ? "gravid" : "swollen"} form to an obedient kneel`);
			} else if (s.belly >= 5000) {
				t.push(`gently lowers ${his} ${s.bellyPreg > 3000 ? "gravid" : "swollen"} form to an obedient kneel`);
			} else {
				t.push(`kneels obediently`);
			}
			t.push(`in front of you, awaiting further direction.`);

			if (getLimbCount(s, 102) > 2) {
				t.push(`Clad in an antique T-Shirt referencing some defunct old world website, ${his} P-Limbs stand in stark contrast — gyros and servomotors against simple thread and cloth. With such tangible examples of the technological prowess of the Free Cities serving as ${his} limbs, ${his} ${s.belly >= 5000 ? "taut " : ""} shirt is an amusing testimonial to how far behind the old world stands in contrast to the new.`);
			} else if (s.boobs > 4000) {
				t.push(`${His} breasts are so massive that the front of ${his} loose pajama top must be unbuttoned. Even so, the protrusion of ${his} immense breasts`);
				if (s.belly >= 5000) {
					t.push(`and ${bellyAdjective(s)} rounded belly from ${his} body`);
				} else {
					t.push(`from ${his} chest`);
				}
				t.push(`strains the soft pajama top to its breaking point.`);
			} else if (s.intelligence + s.intelligenceImplant > 50) {
				t.push(`As a clever ${girl}, ${his} simple${s.belly >= 5000 ? `, yet tight around the middle,` : ""} summer dress evokes memories of bygone warm weather days at elite old world colleges — and the sexual conquest of their youthful residents.`);
			} else if (s.muscles > 30) {
				t.push(`${His} simple sports bra and compression shorts ensemble does little to conceal ${his} incredible musculature,`);
				if (s.belly >= 1500) {
					t.push(`straining to hold up against ${his} swelling middle and`);
				}
				t.push(`glistening with sweat from a recent workout. Despite ${his} recent exertions, ${he}'s able to maintain utter stillness in the perfect posture of an obedient slave.`);
			} else if (s.energy > 95) {
				t.push(`${He}'s controlling ${his} absurd sex drive for the moment in deference to the notion of your relaxation time, but ${he} clearly wouldn't mind some sex as part of the evening.`);
				if (s.dick > 0) {
					if (canAchieveErection(s)) {
						t.push(`${His} cock is painfully erect`);
						if (s.belly >= 10000) {
							t.push(`and pressed against the underside of ${his} belly,`);
						}
					} else {
						t.push(`${His} soft dick is dribbling precum,`);
					}
				} else {
					t.push(`${His} pussy is visibly soaked,`);
				}
				t.push(`showing unmistakably how badly ${he} needs release.`);
			} else {
				t.push(`${He} keeps ${his}`);
				if (canSee(s)) {
					t.push(App.Desc.eyesColor(s));
				} else {
					t.push("face");
				}
				t.push(`slightly downcast, ${his} hands lightly smoothing the folds from ${his} tight skirt while ${his} breasts visibly rise and fall under ${his} even tighter blouse.`);
				if (s.belly >= 5000) {
					t.push(`Between the two, there is little ${he} can do to cover ${his} exposed ${s.bellyPreg >= 3000 ? "pregnancy" : "middle"}.`);
				}
				t.push(`${He}'s the perfect picture of an attentive little old world ${girl}friend${s.height > 185 ? ` (though, of course, ${he}'s anything but physically small)` : ""}.`);
			}
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			canStand,
			hasAnyArms,
			s => s.devotion > 20,
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself, girl
			} = getPronouns(s);
			const {title: Master, say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			// SRC ignorantHorny.js
			let r = [];
			r.push(
				`First on the inspection schedule is ${s.slaveName} and as you watch ${him} enter your office, you note several good signs about ${his} progress towards becoming a good sex slave. ${He} enters obediently, without pretending to be thrilled to be here, but also without hesitation. Best of all,`
			);
			if (s.chastityPenis && canAchieveErection(s)) {
				r.push(`${he}'s squirming with discomfort over the lack of room in ${his} chastity.`);
			} else if (s.dick > 4 && canAchieveErection(s)) {
				r.push(`${he}'s sporting a massive half-erection which slaps lewdly against ${his} thighs as ${he} walks.`);
			} else if (s.dick > 2 && canAchieveErection(s)) {
				r.push(`${his} dick is half-erect, bobbing lewdly as ${he} walks.`);
			} else if (s.dick > 0 && canAchieveErection(s)) {
				r.push(`${his} pathetic little bitch dick is half-erect.`);
			} else if (s.dick > 6) {
				r.push(`${his} enormous dick is slightly engorged and dripping precum.`);
			} else if (s.dick > 0) {
				r.push(`${his} soft bitch dick is dripping precum.`);
			} else if (s.labia > 1) {
				r.push(`${his} lovely pussylips are flushed and wet.`);
			} else if (s.clit > 1) {
				r.push(`${his} glorious bitch button is stiffly erect.`);
			} else if (s.vagina === -1) {
				r.push(`${he}'s unconsciously sticking ${his} ass out. Getting fucked there is ${his} main sexual outlet, now that ${he} lacks genitals.`);
			} else {
				r.push(`${his} pussy is flushed and moist.`);
			}
			r.push(`\n\n`);
			if (s.aphrodisiacs > 0 || s.inflationType === "aphrodisiac") {
				r.push(`The aphrodisiacs racing through ${his} system have ${him} desperate to get off, right now.`);
			} else if (s.piercing.genitals.smart && s.clitSetting !== "none") {
				r.push(His);
				if (s.vagina > -1) {
					r.push(`clit`);
				} else {
					r.push(`frenulum`);
				}
				r.push(`piercing is keeping ${his} arousal exquisitely balanced for ${his} inspection.`);
			} else {
				r.push(`The mild aphrodisiacs in the slave food have clearly built up some arousal that ${he} hasn't been able to address recently.`);
			}
			r.push(`${He} hasn't been with you long. ${He} may not be fully cognizant of how ${his} libido is being altered. New slaves aren't informed of the true extent of your abilities to force sexual need. It can be useful for a new ${girl} to wonder if some of the horniness ${he} feels is natural, and suspect that ${he}'s nothing but a dirty slut who deserves to be a sex slave.`);
			return r.join(" ");
		},
		prereqs: [
			// TESTING
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			canTalk,
			s => s.devotion <= 50,
			s => s.devotion >= -20
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself, girl
			} = getPronouns(s);
			const belly = bellyAdjective(s);
			const children = s.pregType > 1 ? "children" : "child";
			// SRC refreshmentDelivery
			let r = [];
			r.push(
				`When it's time for refreshments, ${V.assistant.name} directs the closest unoccupied slave capable of bringing them in to do so. This has the added advantage of bringing an enjoyably unpredictable variety of slaves under your eyes. This time, ${s.slaveName} comes through the door of your office, carrying`
			);
			if (V.PC.refreshmentType === 0) {
				r.push(`a selection of ${V.PC.refreshment} brands and the necessary implements`);
			} else if (V.PC.refreshmentType === 1) {
				r.push(`a bottle of ${V.PC.refreshment} with a glass in your favorite style`);
			} else if (V.PC.refreshmentType === 2) {
				r.push(`a selection of ${V.PC.refreshment} on a plate of your favored style`);
			} else if (V.PC.refreshmentType === 3) {
				r.push(`a line of ${V.PC.refreshment} and the necessary implements`);
			} else if (V.PC.refreshmentType === 4) {
				r.push(`a syringe of ${V.PC.refreshment} and the necessary implements`);
			} else if (V.PC.refreshmentType === 5) {
				r.push(`a bottle of ${V.PC.refreshment}`);
			} else if (V.PC.refreshmentType === 6) {
				r.push(`several sheets of ${V.PC.refreshment}`);
			}
			if (s.preg > s.pregData.normalBirth / 1.33) {
				r.push(`on a tray carefully held against ${his} pregnant belly, doing ${his} best to will ${his} ${children} to not kick the tray off balance.`);
			} else if (s.belly >= 10000) {
				r.push(`on a tray carefully held against ${his} ${belly}`);
				if (s.bellyPreg >= 3000) {
					r.push(`pregnant`);
				}
				r.push(`belly.`);
			} else {
				r.push(`on a tray.`);
			}
			r.push(`\n\n`);
			r.push(`${He} comes to a stop right beside your elbow, waiting for further direction, just as ${he}'s been trained to do in these cases.`);
			if (getLimbCount(s, 102) > 2) {
				r.push(`As ${he} maintains ${his} posture obediently, ${his} P-Limbs produce minute machine noises. They allow ${him} good coordination, but their gyros and servomotors are constantly working to maintain it, which means that when ${he} stands still, they're not perfectly quiet.`);
			} else if (s.boobs > 4000) {
				r.push(`${His} breasts are so massive that ${he}'s got the tray more or less balanced on top of them. As ${he} breathes, ${his} tits rise and fall slightly,`);
				if (V.PC.refreshmentType === 0) {
					r.push(`causing the ${V.PC.refreshment} collection to roll from side to side.`);
				} else if (V.PC.refreshmentType === 1) {
					r.push(`causing ripples in the bottle of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 2) {
					r.push(`threatening to knock the ${V.PC.refreshment} from it's plate.`);
				} else if (V.PC.refreshmentType === 3) {
					r.push(`disturbing the lines of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 4) {
					r.push(`causing the syringes of ${V.PC.refreshment} to roll from side to side.`);
				} else if (V.PC.refreshmentType === 5) {
					r.push(`rattling the ${V.PC.refreshment} in its bottle.`);
				} else if (V.PC.refreshmentType === 6) {
					r.push(`threatening to knock the sheets of ${V.PC.refreshment} off the tray.`);
				}
			} else if (s.preg > s.pregData.normalBirth / 1.33) {
				r.push(`${He} keeps the tray balanced atop ${his} ${belly} pregnancy, though the weight encourages ${his} ${children} to begin kicking. As you glance over at ${him}, ${he} lets out a minute, tired sigh, as kicks from ${his} ${children}`);
				if (V.PC.refreshmentType === 0) {
					r.push(`cause the ${V.PC.refreshment} collection to roll from side to side.`);
				} else if (V.PC.refreshmentType === 1) {
					r.push(`cause ripples in the bottle of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 2) {
					r.push(`threaten to knock the ${V.PC.refreshment} from it's plate.`);
				} else if (V.PC.refreshmentType === 3) {
					r.push(`disturb the lines of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 4) {
					r.push(`cause the syringes of ${V.PC.refreshment} to roll from side to side.`);
				} else if (V.PC.refreshmentType === 5) {
					r.push(`rattle the ${V.PC.refreshment} in its bottle.`);
				} else if (V.PC.refreshmentType === 6) {
					r.push(`threaten to knock the sheets of ${V.PC.refreshment} off the tray.`);
				}
			} else if (s.belly >= 10000) {
				r.push(`${His}`);
				if (s.bellyPreg >= 3000) {
					r.push(`pregnant`);
				}
				r.push(`belly is big enough that ${he}'s got the tray more or less balanced on top of it. As you glance over at ${him}, ${he} lets out a minute, tired sigh,`);
				if (V.PC.refreshmentType === 0) {
					r.push(`causing the ${V.PC.refreshment} collection to roll from side to side.`);
				} else if (V.PC.refreshmentType === 1) {
					r.push(`causing ripples in the bottle of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 2) {
					r.push(`nearly rocking the ${V.PC.refreshment} from it's plate.`);
				} else if (V.PC.refreshmentType === 3) {
					r.push(`disturbing the lines of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 4) {
					r.push(`causing the syringes of ${V.PC.refreshment} to roll from side to side.`);
				} else if (V.PC.refreshmentType === 5) {
					r.push(`nearly tipping the bottle of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 6) {
					r.push(`threatening to blow the sheets of ${V.PC.refreshment} off the tray.`);
				}
			} else if (s.muscles > 30) {
				r.push(`With ${his} incredible musculature, ${he}'s able to maintain utter stillness in the perfect posture of an obedient slave. A naturally standing human makes some small movements, but ${his} strength allows ${him} to suppress them by setting muscle groups against each other. This has the ancillary benefit of making them stand out nicely.`);
			} else if (s.muscles < -30) {
				r.push(`${He} is so physically frail that ${he} can barely manage to hold the tray steady. As ${he} rapidly tires, ${his} ${hasBothArms(s) ? "arms begin slightly shaking" : "arm begins to slightly shake"},`);
				if (V.PC.refreshmentType === 0) {
					r.push(`causing the ${V.PC.refreshment} collection to roll from side to side.`);
				} else if (V.PC.refreshmentType === 1) {
					r.push(`causing ripples in the bottle of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 2) {
					r.push(`threatening to knock the ${V.PC.refreshment} from it's plate.`);
				} else if (V.PC.refreshmentType === 3) {
					r.push(`disturbing the lines of ${V.PC.refreshment}.`);
				} else if (V.PC.refreshmentType === 4) {
					r.push(`causing the syringes of ${V.PC.refreshment} to roll from side to side.`);
				} else if (V.PC.refreshmentType === 5) {
					r.push(`rattling the ${V.PC.refreshment} in its bottle.`);
				} else if (V.PC.refreshmentType === 6) {
					r.push(`threatening to knock the sheets of ${V.PC.refreshment} off the tray.`);
				}
			} else if (s.energy > 95) {
				r.push(`${He}'s controlling ${his} absurd sex drive for the moment, but ${he} clearly wouldn't mind some sex as part of the delivery.`);
				if (s.dick > 0) {
					if (canAchieveErection(s)) {
						r.push(`${His} cock is painfully erect,`);
					} else {
						r.push(`${His} soft dick is dribbling precum,`);
					}
				} else if (s.vagina === -1) {
					r.push(`${He}'s unconsciously presenting ${his} bottom,`);
				} else {
					r.push(`${His} pussy is visibly soaked,`);
				}
				r.push(`showing unmistakably how badly ${he} needs release.`);
			} else {
				r.push(`${He} keeps ${his}`);
				if (canSee(s)) {
					r.push(App.Desc.eyesColor(s));
				} else {
					r.push(`face`);
				}
				r.push(`slightly downcast, ${his} back arched, ${his} chest pressed outward, and ${his} bottom stuck out a bit. ${He}'s the perfect picture of an obedient little sex slave`);
				if (s.height > 185) {
					r.push(`(though, of course, ${he}'s anything but physically small)`);
				}
				r.push(r.pop() + `.`);
			}
			return r.join(" ");
		},
		prereqs: [
			/* TESTING */
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			canWalk,
			s => s.devotion > 20,
			s => s.trust > -10
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself
			} = getPronouns(s);
			const belly = bellyAdjective(s);
			// SRC objectifyingVisit.js
			let r = [];
			r.push(`At appropriate intervals during the day ${V.assistant.name} directs an unoccupied slave to visit your office to ensure all your needs are currently being met. With such a vague task set before them, the slaves who enter your domain in such a way often find themselves used in a multitude of refreshingly novel ways. At this particular moment ${s.slaveName} comes through the door of your office and obediently`);
			if (s.belly >= 300000) {
				r.push(`settles ${himself}`);
			} else {
				r.push(`kneels`);
			}
			r.push(`beside your desk to await further orders. It occurs to you, gazing down at your obedient slave, that ${he} exists as little more than an object to meet your various needs. Perhaps you should treat ${him} as such.`);
			return r.join(" ");
		},
		prereqs: [
			/* TESTING  */
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			s => s.trust > 20,
			s => s.devotion > 50
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself
			} = getPronouns(s);
			const {title: Master, say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const hands = (hasBothArms(s)) ? `hands` : `hand`;
			// SRC terrifiedInspection
			let r = [];
			r.push(` ${s.slaveName} appears in the door of your office for a scheduled inspection. ${He} hesitates in the doorway,`,
			);
			if (canSee(s)) {
				r.push(`staring fixedly downward with huge ${App.Desc.eyesColor(s)},`);
			} else {
				r.push(`${his} face towards the floor,`);
			}
			r.push(`before stumbling forward to stand in front of your desk. ${His} chest is rising and falling with panicked hyperventilation. The poor ${SlaveTitle(s)} is terrified of you for some reason.`);
			r.push(`\n\n`);
			r.push(`You let ${him} stand there naked and shivering while you finish what you're working on. ${He} holds ${his} ${s.skin}`);
			if (hasBothArms(s)) {
				r.push(`hands down at ${his} sides, just like ${he}'s supposed to, but they twitch`);
			} else {
				r.push(`hand down at ${his} side, just like ${he}'s supposed to, but it twitches`);
			}
			r.push(`inward occasionally, betraying ${his} desire to shield ${his}`);
			if (s.nipples === "huge") {
				r.push(`prominent nipples`);
			} else if (s.boobs > 1000) {
				r.push(`big tits`);
			} else {
				r.push(`chest`);
			}
			r.push(`and`);
			if (s.dick >= 10) {
				r.push(`massive, limp dick`);
			} else if (s.dick > 7) {
				r.push(`huge, limp dick`);
			} else if (s.dick > 3) {
				r.push(`big, limp dick`);
			} else if (s.dick > 0) {
				r.push(`limp little prick`);
			} else if (s.clit > 1) {
				r.push(`absurd clit`);
			} else if (s.labia > 0) {
				r.push(`pretty petals`);
			} else if (s.vagina === -1) {
				r.push(`smooth, featureless groin`);
			} else {
				r.push(`pussy`);
			}
			r.push(`from your view. The wait gives license to ${his} fears. ${His}`);
			if (s.lips > 70) {
				r.push(`ridiculous`);
			} else if (s.lips > 0) {
				r.push(`plush`);
			}
			r.push(`lips are quivering, and tears are quickly gathering at the corners of ${his} eyes.`);
			return r.join(" ");
		},
		prereqs: [
			/* TESTING */
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			canTalk,
			s => s.trust < -50,
			s => s.devotion <= 20
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself, girl
			} = getPronouns(s);
			const {title: Master, say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			// SRC usedWhore.js
			let r = [];
			r.push(
				`At the end of a long day, you take a moment to watch the comings and goings of your arcology to decompress. While doing so, you notice someone who's clearly had a longer day than you. ${s.slaveName} is`);
			if (s.belly >= 5000) {
				r.push(`slowly waddling, one hand under ${his} ${belly}`);
				if (s.bellyPreg >= 3000) {
					r.push(`pregnant`);
				}
				r.push(`belly and the other on the small of ${his} back,`);
			} else {
				r.push(`making`);
			}
			r.push(`${his} tired way back to the kitchen for a meal and then bed after a long day of sex work. ${He}'s stripped off ${his} soiled clothes already, and is clearly too tired to care about nudity at all.`);
			r.push(`\n\n`);
			r.push(`${He} comes around the corner and`);
			if (PC.belly >= 100000) {
				r.push(`slams into your massively distended belly, nearly knocking you over.`);
			} else if (PC.belly >= 10000) {
				r.push(`bumps into your heavily gravid middle.`);
			} else if (PC.belly >= 5000) {
				r.push(`bumps into your rounded middle.`);
			} else if (PC.balls >= 14) {
				r.push(`nearly knees your prominent testicles.`);
			} else if (PC.boobs >= 800) {
				r.push(`runs into your prominent rack.`);
			} else {
				r.push(`almost runs into you.`);
			}
			r.push(`${He} stops and`);
			if (canSee(s)) {
				r.push(`stares,`);
			} else {
				r.push(`faces you,`);
			}
			r.push(`struggling to find the appropriate thing to say or do, but too exhausted to manage it. Even though ${he}'s been obediently cleaning ${himself} between fucks, ${he} looks used up. ${His} ${s.skin} skin is reddened here and there.`);
			if (s.belly >= 750000) {
				r.push(`${His} ${belly} belly is heavily bruised, the super-stretched skin nearly at its limit from the weight put on it and the forces pushing against it.`);
			} else if (s.belly >= 600000) {
				r.push(`${His} ${belly} belly is deep red and heavily bruised; it's clear that at least one client roughly fucked ${him} over it.`);
			} else if (s.belly >= 450000) {
				r.push(`${His} ${belly} belly looks extremely painful, it's obvious ${he} got fucked over it.`);
			} else if (s.belly >= 300000) {
				r.push(`${His} ${belly} belly is black and blue, it's obvious ${he} got fucked over it.`);
			} else if (s.belly >= 150000) {
				r.push(`${His} ${belly} belly is heavily chafed from rubbing the floor as ${he} struggled to keep ${his} weight off it.`);
			} else if (s.belly >= 100000) {
				r.push(`${His} ${belly} belly is heavily chafed from rubbing against the floor.`);
			} else if (s.belly >= 10000) {
				r.push(`The tip of ${his} huge belly is chafed from rubbing against the floor.`);
			}
			if (canDoVaginal(s)) {
				r.push(`${His}`);
				if (s.labia > 1) {
					r.push(`generous`);
				} else {
					r.push(`poor`);
				}
				r.push(`pussylips are puffy, and you have no doubt ${his} vagina is quite sore.`);
			}
			if (canDoAnal(s)) {
				r.push(`The awkward way ${he}'s standing suggests that ${his}`);
				if (s.anus > 2) {
					r.push(`gaping`);
				} else if (s.anus > 1) {
					r.push(`big`);
				} else {
					r.push(`tight`);
				}
				r.push(`asshole has had more than one dick up it recently.`);
			}
			if (s.nipples !== "fuckable") {
				r.push(`Even ${his} nipples are pinker than usual, having been cruelly pinched`);
				if (s.lactation > 0) {
					r.push(`and milked`);
				}
				r.push(r.pop() + `.`);
			} else {
				r.push(`Even ${his} nipples show signs of wear, having prolapsed slightly from heavy use.`);
			}
			return r.join(" ");
		},
		prereqs: [
			/* TESTING */
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			s => s.vagina !== 0,
			s => s.anus !== 0,
			s => s.devotion <= 50
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself
			} = getPronouns(s);
			const {title: Master, say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			// SRC likeMe.js
			let r = [];
			r.push(
				`${s.slaveName} appears at the door of your office, looking frightened. ${He} takes one hesitant step in and stops, wavering, ${his} hand balled into fists and ${his} lower lip caught behind ${his} teeth. The ${SlaveTitle(s)} is getting used to ${his} place as chattel, but ${he} isn't sure of ${himself} yet. After a few moments, it becomes obvious that ${he}'s lost whatever mental momentum propelled ${him} to come in here, and can't muster the courage to back out, either. You rescue ${him} by politely but firmly ordering ${him} to tell you why ${he}'s here. After two false starts, ${he}`
			);
			if (!canTalk(s)) {
				r.push(`uses shaky hands to ask you to fuck ${him}.`);
			} else {
				r.push(
					Spoken(s, `"P-please fuck me, ${Master},"`),
					`${he} chokes out.`
				);
			}
			r.push(`To go by ${his} behavior, the likelihood that ${he}'s actually eager to`);
			if (PC.dick === 0) {
				r.push(`eat pussy,`);
			} else {
				r.push(`take a dick,`);
			}
			r.push(`never mind yours, is vanishingly small.`);
			return r.join(" ");
		},
		prereqs: [
			/* TESTING */
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			s => s.trust <= 20,
			s => s.trust >= -75,
			s => s.devotion <= 30,
			s => s.devotion >= -20
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself, hers
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const inch = V.showInches === 2 ? "inch" : "centimeter";
			// SRC devotedLotion
			let r = [];
			r.push(
				`Your slaves are required to take very good care of themselves, and your best ones spend several hours a day maintaining every ${inch} of their bodies. You notice ${s.slaveName} standing naked in front of a mirror outside the bathroom, carefully applying moisturizing lotion to every ${inch} of ${his} ${s.skin} skin. ${He}'s clearly feeling well, and ${his}`
			);
			if (s.face > 95) {
				r.push(`gorgeous`);
			} else if (s.face <= 40) {
				r.push(`attractive`);
			} else if (s.face <= 10) {
				r.push(`pretty`);
			} else if (s.face < -10) {
				r.push(`plain`);
			} else {
				r.push(`homely`);
			}
			r.push(`face bears a smile of simple enjoyment as ${he} basks in the warmth of the slave quarters, calibrated to make nudity comfortable. ${He} straightens ${his}`);
			if (s.height >= 185) {
				r.push(`wonderfully long`);
			} else if (s.height >= 170) {
				r.push(`long`);
			} else if (s.height >= 160) {
				r.push(`nice`);
			} else if (s.height >= 150) {
				r.push(`short`);
			} else {
				r.push(`short little`);
			}
			r.push(`legs and bends at the waist,`);
			if (s.belly >= 600000) {
				r.push(`${his} ${belly} belly coming to rest on the floor as ${he} spreads ${his} legs around it,`);
			} else if (s.belly >= 400000) {
				r.push(`${his} ${belly} belly forcing ${him} to really spread ${his} legs,`);
			} else if (s.belly >= 100000) {
				r.push(`${his} ${belly} belly forcing ${his} legs wide as ${he} goes,`);
			} else if (s.belly >= 10000) {
				r.push(`${his}`);
				if (s.bellyPreg >= 3000) {
					r.push(`hugely gravid`);
				} else if (s.bellyImplant >= 3000) {
					r.push(`${belly} protruding`);
				} else {
					r.push(`heavy,`);
					r.push(`${s.inflationType}-filled`);
				}
				r.push(`belly parting ${his} legs as ${he} goes,`);
			} else if (s.belly >= 5000) {
				r.push(`${his}`);
				if (s.bellyPreg >= 3000) {
					r.push(`gravid`);
				} else if (s.bellyImplant >= 3000) {
					r.push(`protruding`);
				} else {
					r.push(`sloshing`);
				}
				r.push(`belly parting ${his} legs as ${he} goes,`);
			}
			r.push(`moaning at the pleasurable feeling of a good stretch. ${He} sets the lotion bottle on the ground next to ${him}, dispenses a little, and carefully rubs it into the tops of ${his} feet. When ${he} reaches ${his} ankles, still bent almost double, ${he}`);
			if (canSee(s)) {
				r.push(`catches sight of you watching ${him} from between ${his} legs.`);
			} else if (canHear(s)) {
				r.push(`picks up the sound of your breathing.`);
			} else {
				r.push(`realizes that you're there watching ${him}.`);
			}
			r.push(`${He} smiles at you and keeps working.`);
			r.push(`\n\n`);
			r.push(`${He} shifts ${his}`);
			if (s.hips > 2) {
				r.push(`broodmother`);
			} else if (s.hips > 1) {
				r.push(`broad`);
			} else if (s.hips >= 0) {
				r.push(`curvy`);
			} else {
				r.push(`trim`);
			}
			r.push(`hips innocently and moves up to ${his} lower legs. But then, as ${he} slowly massages the lotion into ${his}`);
			if (s.muscles > 30) {
				r.push(`muscled`);
			} else if (s.weight > 10) {
				r.push(`plush`);
			} else {
				r.push(`cute`);
			}
			r.push(`calves, ${he} arches ${his} back and cocks ${his} hips a little. This causes`);
			if (s.chastityPenis === 1) {
				r.push(`the bottom of ${his} chastity cage to become visible, a reminder that`);
				if (canDoAnal(s) && canDoVaginal(s)) {
					r.push(`only ${his} holes are to be used.`);
				} else if (canDoAnal(s) && !canDoVaginal(s)) {
					r.push(`${he}'s a butthole slave.`);
				} else if (canDoVaginal(s)) {
					r.push(`the focus is ${his} pussy, not dick.`);
				} else {
					r.push(`with ${his} ass in chastity, ${he}'s forbidden from release.`);
				}
			} else if (s.belly >= 100000) {
				r.push(`the underside of ${his}`);
				if (s.bellyPreg >= 3000) {
					r.push(`pregnancy`);
				} else {
					r.push(`belly`);
				}
				r.push(`and`);
				if (canDoAnal(s) && canDoVaginal(s)) {
					r.push(`${his} flushed, glistening pussy and`);
					if (s.anus === 0) {
						r.push(`virgin`);
					} else {
						r.push(`hungry`);
					}
					r.push(`anus to become visible.`);
				} else if (canDoVaginal(s)) {
					r.push(`${his} flushed pussy to become visible, glistening with moisture.`);
				} else {
					r.push(`${his}`);
					if (s.anus === 0) {
						r.push(`virgin`);
					} else {
						r.push(`hungry`);
					}
					r.push(`anus to become visible.`);
				}
			} else if (s.belly >= 5000) {
				r.push(`the underside of ${his}`);
				if (s.bellyPreg >= 3000) {
					r.push(`pregnancy`);
				} else {
					r.push(`belly`);
				}
				r.push(`and`);
				if (canDoAnal(s) && canDoVaginal(s)) {
					r.push(`${his} flushed, glistening pussy and`);
					if (s.anus === 0) {
						r.push(`virgin`);
					} else {
						r.push(`hungry`);
					}
					r.push(`anus to become visible, before ${he} hugs ${his} thighs together, sighing as ${he} flexes them a little to put gentle pressure on ${his} womanhood.`);
				} else if (canDoVaginal(s)) {
					r.push(`${his} flushed pussy to appear for a moment, glistening with moisture, before ${he} hugs ${his} thighs together, sighing as ${he} flexes them a little to put gentle pressure on ${his} womanhood.`);
				} else {
					r.push(`${his}`);
					if (s.anus === 0) {
						r.push(`virgin`);
					} else {
						r.push(`hungry`);
					}
					r.push(`anus to become visible.`);
				}
			} else if (!canAchieveErection(s) && s.dick > 10) {
				r.push(`${his} giant, soft dick to swing back between ${his} legs; ${he} hugs ${his} thighs together again and traps it back behind ${him}, enjoying the sensation along its length.`);
			} else if (!canAchieveErection(s) && s.dick > 0) {
				r.push(`${his} thighs to come tightly together, hiding ${his} soft dick.`);
			} else if (s.dick > 0) {
				r.push(`${his} stiff dick to swing back between ${his} legs; ${he} hugs ${his} thighs together again and traps it back behind ${him}, showing off how hard ${he} is.`);
			} else if (canDoAnal(s) && canDoVaginal(s)) {
				r.push(`${his} flushed, glistening pussy and`);
				if (s.anus === 0) {
					r.push(`virgin`);
				} else {
					r.push(`hungry`);
				}
				r.push(`anus to become visible, before ${he} hugs ${his} thighs together, sighing as ${he} flexes them a little to put gentle pressure on ${his} womanhood.`);
			} else if (canDoVaginal(s)) {
				r.push(`${his} flushed pussy to appear for a moment, glistening with moisture, before ${he} hugs ${his} thighs together, sighing as ${he} flexes them a little to put gentle pressure on ${his} womanhood.`);
			} else {
				r.push(`it to become apparent that ${his} hungry asspussy serves as ${his} only genitalia.`);
			}
			r.push(`With ${his} back arched and ${his} thighs together ${his}`);
			if (s.butt > 5) {
				r.push(`massive buttocks part a little, showing a hint of`);
			} else if (s.butt > 2) {
				r.push(`big buttocks part, revealing`);
			} else {
				r.push(`cute buttocks are spread wide apart, displaying`);
			}
			r.push(`${his}`);
			if (s.anus > 2) {
				r.push(`lewd anal slit.`);
			} else if (s.anus === 2) {
				r.push(`big butthole.`);
			} else {
				r.push(`tight anus.`);
			}
			if (canSee(s)) {
				if (s.belly >= 50000) {
					r.push(`${His} ${belly} stomach is far too large to see around, but given ${his} held pose, ${he}'s waiting to see what you do.`);
				} else if (s.belly >= 5000) {
					r.push(`${He} peeks around the edge of ${his} belly, checking your crotch to see if you are watching.`);
				} else {
					r.push(`${He} peeks between ${his} legs again, checking to see if you're watching.`);
				}
			} else if (canHear(s)) {
				r.push(`${His} ears perk up, listening to see if you are still there.`);
			} else {
				r.push(`${He} stays as still as ${he} can, clearly waiting for you to make a move.`);
			}
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			canTalk,
			s => s.devotion > 50,
			s => s.trust > 20
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, his, him, himself
			} = getPronouns(s);
			const {say, title: Master} = getEnunciation(s);
			const PC = V.PC;
			// SRC imScared.js
			let t = [];
			t.push(`During ${his} weekly inspection, ${s.slaveName} has trouble following the routine orders that position ${him} so you can examine ${his} body. The cause is not difficult to determine: ${he}'s so cripplingly terrified that ${he}'s having difficulty functioning. ${He} seems to be trying to obey you, but ${he}'s so scared that ${his} mind is having trouble translating your simple verbal commands into physical obedience. You ask ${him} what ${he}'s so frightened of. The question stuns ${him}, and ${he} ${canSee(s) ? "stares at" : "faces"} you in mute horror, looking even more terrified than ${he} has up to this point and completely devoid of any idea how to respond. You order ${him} to respond, and this starts ${him} out of ${his} fugue. ${He} begins to cry, makes two false starts, sobs, and then begins forcing out words.`);
			t.push(`\n\n`);
			t.push(`"E-e-everything," ${he} cries. "${Spoken(s, "I'm s-so s-sorry b-but I c-can't help")}," ${he} chokes on a sob and hiccups, "${Spoken(s, "help it. This, this place, being a sex slave")},`);
			switch (s.rules.punishment) {
				case "confinement":
					t.push(Spoken(s, "b-being sh-shut up in the d-dark"));
					break;
				case "whipping":
					t.push(Spoken(s, "b-being wh-wh-whip-ped"));
					break;
				case "chastity":
					t.push(Spoken(s, "h-having my p-parts locked up in ch-chastity"));
					break;
				default:
					t.push(Spoken(s, "n-never knowing what th-the p-punishment will be"));
			}
			t.push(`${Spoken(s, `wh-when I'm bad, e-everything, ${s.rudeTitle === 1 ? PoliteRudeTitle(s) : Master}. Oh, oh, I'm sorry, p-please, I'm sorry I, I'm like this, I'm crying, p-please ${s.rudeTitle === 1 ? PoliteRudeTitle(s) : Master}, please don't...`)}" ${He} trails off, giving you a look of supplication.`);
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			canMove,
			canTalk,
			s => s.trust < -50,
			s => s.devotion <= 50,
		]
	},
	{
		getGreeting: (s) => {
			const {His, He, he, his, him} = getPronouns(s);
			const {title: Master, say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			// SCR scrubbing.js
			let r = [];
			r.push(`${V.arcologies[0].name} is well fitted with automated cleaning systems. However, ${s.slaveName} is acting as a servant to your other slaves, so whenever ${he} has nothing else to do the cleaners are deactivated and ${he} is made to clean by hand. After all, there is no sense in leaving ${him} idle, when ${he} could be scrubbing floors.`);
			r.push(`\n\n`);
			r.push(`Which, incidentally, is what ${he}'s doing now. ${He} has standing orders to change into a sturdy apron when doing such work, which ${he} is not pleased to follow, since the apron has no back at`);
			if (s.belly >= 100000) {
				r.push(`all, and with ${his} ${belly}`);
				if (s.bellyPreg > 0) {
					r.push(`pregnancy,`);
				} else {
					r.push(`belly,`);
				}
				r.push(`absolutely no side coverage either.`);
			} else if (s.weight > 190) {
				r.push(`all, and with ${his} hanging gut, no side coverage either.`);
			} else if (s.belly >= 10000) {
				r.push(`all, and with ${his}`);
				if (s.bellyPreg >= 8000) {
					r.push(`advanced pregnancy`);
				} else if (s.bellyImplant >= 8000) {
					r.push(`${belly} belly`);
				}
				r.push(r.pop() + ",");
				r.push(`no side coverage either.`);
			} else if (s.weight > 130) {
				r.push(`all, and with ${his} gut, no side coverage either.`);
			} else if (s.weight > 95) {
				r.push(`all, and with ${his} fat belly, no side coverage either.`);
			} else if (s.belly >= 5000) {
				r.push(`all, and with ${his}`);
				if (s.bellyPreg >= 3000) {
					r.push(`growing pregnancy`);
				} else if (s.bellyImplant >= 3000) {
					r.push(`bulging belly`);
				}
				r.push(r.pop() + ",");
				r.push(`no side coverage either.`);
			} else {
				r.push(`all.`);
			}
			r.push(`${He}'s working diligently on the floor, though, down on`);
			if (hasAllLimbs(s)) {
				r.push(`all fours,`);
			} else {
				r.push(`the ground,`);
			}
			if (s.belly >= 150000) {
				r.push(`struggling to work with ${his}`);
				if (s.bellyPreg >= 8000) {
					r.push(`pregnancy`);
				} else if (s.bellyImplant >= 8000) {
					r.push(`middle`);
				}
				r.push(`forcing ${him} off the ground, desperately trying to reach the floor with ${his} scrub brush.`);
			} else if (s.belly >= 100000) {
				r.push(his);
				if (s.bellyPreg >= 8000) {
					r.push(`pregnancy`);
				} else if (s.bellyImplant >= 8000) {
					r.push(`middle`);
				}
				r.push(`pushing uncomfortably into the floor, trying to use`);
				if (hasBothArms(s)) {
					r.push(`both hands`);
				} else {
					r.push(`${his} whole arm`);
				}
				r.push(`to work a scrub-brush back and forth.`);
			} else if (s.weight > 190) {
				r.push(`${his} gut dragging along under ${him}, using`);
				if (hasBothArms(s)) {
					r.push(`both hands`);
				} else {
					r.push(`${his} whole arm`);
				}
				r.push(`to work a scrub-brush back and forth.`);
			} else if (s.belly >= 10000) {
				r.push(his);
				if (s.bellyPreg >= 8000) {
					r.push(`pregnancy`);
				} else if (s.bellyImplant >= 8000) {
					r.push(`distended middle`);
				}
				r.push(`barely off the ground, using both hands to work a scrub-brush back and forth.`);
			} else if (s.weight > 130) {
				r.push(`fours, ${his} gut barely off the ground, using`);
				if (hasBothArms(s)) {
					r.push(`both hands`);
				} else {
					r.push(`${his} whole arm`);
				}
				r.push(`to work a scrub-brush back and forth.`);
			} else if (s.weight > 95) {
				r.push(`${his} fat belly nearly sagging to the ground, using`);
				if (hasBothArms(s)) {
					r.push(`both hands`);
				} else {
					r.push(`${his} whole arm`);
				}
				r.push(`to work a scrub-brush back and forth.`);
			} else {
				r.push(`using`);
				if (hasBothArms(s)) {
					r.push(`both hands`);
				} else {
					r.push(`${his} whole arm`);
				}
				r.push(`to work a scrub-brush back and forth.`);
			}
			r.push(`${His} bare ass bobs back and forth as though ${he} were doing it doggy style with an invisible man.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			s => s.devotion <= 50,
			hasAnyArms,
			canWalk
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, His, his, him, himself, girl
			} = getPronouns(s);
			const {say, title: Master} = getEnunciation(s);
			const desc = SlaveTitle(s);
			const belly = bellyAdjective(s);
			const dickSize = s.dick > 4 ? "big" : (s.dick > 2 ? "" : "tiny");
			const PC = V.PC;
			// SRC comfortableSeat
			let t = [];
			t.push("There are sturdy leather seats placed strategically throughout your penthouse. They offer something convenient to bend your slaves over, wherever you happen to encounter them, and they're comfortable, too. At the moment, you're sitting on one, using a tablet to take care of some business that caught you away from your office, but isn't worth heading back to your desk for. Slaves move by your impromptu throne as you work, mostly");
			if (V.averageTrust > 50) {
				t.push("greeting you cheerfully");
			} else if (V.averageTrust > 20) {
				t.push("greeting you properly");
			} else if (V.averageTrust > -20) {
				t.push("doing their best to greet you properly");
			} else if (V.averageTrust > -50) {
				t.push("greeting you fearfully");
			} else {
				t.push("struggling to greet you through their terror");
			}
			t.push("as they pass. Busy, you spare few of them more than a glance.\n\n");
			t.push(`One of them slows as ${he} goes by, however. Looking up, you see that it's ${s.slaveName}.`);
			if (canTalk(s)) {
				if (s.belly >= 1500) {
					t.push(`"Hi ${Master}," ${he} ${say}s flirtatiously rubbing a hand across ${his} ${belly} ${s.bellyPreg > 0 ? "pregnancy" : "belly"}.`);
				} else {
					t.push(`"Hi ${Master}," ${he} ${say}s flirtatiously.`);
				}
				t.push(Spoken(s, `"That looks like a really comfortable seat. Can I sit down and rest ${s.belly >= 10000 ? "my tired legs" : ""} for a little while?"`));
			} else {
				t.push(`${He} greets you properly, but adds a flirtiness to ${his} gestures, and asks if ${he} can sit down and rest`);
				if (s.belly >= 10000) {
					t.push(`${his} ${s.bellyPreg > 0 ? "gravid" : belly} bulk`);
				}
				t.push("on the comfortable seat for a little while.");
			}
			t.push(`${He} is not pointing at the soft leather cushion next to you: ${he}'s pointing at your crotch.\n\n`);

			t.push(`You're nude, a consequence of ${V.ConcubineID !== 0 && V.ConcubineID !== s.ID ? `recent activities involving ${contextualIntro(V.PC, S.Concubine)}` : "recent unrelated activities"}. ${PC.dick !== 0 ? "Your formidable dick is three quarters hard," : "Nude, that is, all except for the strap-on you were just using and haven't taken off yet,"} and ${s.slaveName} is pointing right at it. ${He} knows exactly what ${he}'s asking for and gives ${his}`);
			if (s.hips > 0) {
				t.push("broad");
			} else if (s.hips > -1) {
				t.push("trim");
			} else {
				t.push("narrow");
			}
			t.push("hips a little wiggle to make it even more abundantly clear.");
			if (s.chastityPenis === 1) {
				t.push(`${His} poor dick is visibly straining against the restrictive chastity belt ${he}'s wearing.`);
			} else if (canAchieveErection(s)) {
				t.push(`${His} ${dickSize} dick is jutting out stiffly and there's a bead of precum ${s.foreskin === 0 ? "forming at its smooth tip" : `escaping from ${his} foreskin`}.`);
			} else if (s.dick > 0) {
				t.push(`${His} ${dickSize} dick is as soft as ever, but there's a string of precum running between ${s.foreskin === 0 ? "its smooth tip" : "the soft foreskin that completely covers its tip"} and ${his} inner thigh.`);
			} else if (s.clit > 0) {
				t.push(`${His} ${s.clit > 1 ? "formidable" : "big"} clit is visibly erect. ${s.piercing.genitals.weight > 1 ? `${His} sizable clit piercing never lets its hood completely cover hide ${his} bitch button, but it's completely retracted now,` : `${His} delicate clitoral hood has been pushed back by ${his} female erection,`} leaving ${him} proudly aroused.`);
			} else if (s.labia > 0) {
				t.push(`${His} ${s.labia > 1 ? "dangling" : "thick"} labia are visibly swollen, flushing and growing prouder as the blood rushes to ${his} womanhood.`);
			} else if (s.vagina === -1) {
				t.push(`Since ${he}'s featureless in front, ${he} makes a little half turn to the side, making it very clear that ${his} asspussy needs fucking.`);
			} else {
				t.push(`${He} has a shapely womanhood, with trim labia and a demure clit, but it's a little flushed.`);
			}
			t.push(`${(s.vaginaLube > 0 && s.vagina > -1) ? `${His} wet cunt is already lubricating itself generously for you, slicking ${his} labia with female arousal.` : ""} The slutty ${desc} wants it badly.`);
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			canStand,
			hasAnyArms,
			canSee,
			s => s.trust > 20,
			s => s.devotion > 20,
			s => s.belly < 300000
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, his, him, girl, hers
			} = getPronouns(s);
			const {title: Master, say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const hands = hasBothArms(s) ? "hands" : "hand";
			// SRC cumslutWhore.js
			let r = [];
			r.push(
				`Late at night ${s.slaveName} returns to the living area of the penthouse. It's the end of ${his} day as a working girl, and despite being obviously tired, ${he}'s smiling with obvious sexual satiation. Every so often, ${he}'ll get a dreamy expression and lick ${his} lips. ${He} fetishizes cum to the extent that getting to eat a`
			);
			if (V.showInches === 2) {
				r.push(`mile`);
			} else {
				r.push(`kilometer`);
			}
			r.push(`of dick really satisfies ${him}.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			s => s.devotion > 20,
			s => s.fetishKnown === 1,
			s => s.fetish === "cumslut"
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, him, his, himself, girl
			} = getPronouns(s);
			// SRC devotedFearfulSlave.js
			let t = [];
			t.push(`You are working late tonight, poring over some particularly troublesome business documents — though, thankfully, the end appears to be in sight. The sun has all but completely slipped below the horizon, drowning your office in moody twilight. Seeing that you are finally approaching the end of a long day, ${V.assistant.name} takes the liberty of having a`);

			if (V.PC.refreshmentType === 1) {
				t.push(`glass of`);
			} else if (V.PC.refreshmentType === 2) {
				t.push(`plate of`);
			} else if (V.PC.refreshmentType === 3) {
				t.push(`line of`);
			} else if (V.PC.refreshmentType === 4) {
				t.push(`syringe of`);
			} else if (V.PC.refreshmentType === 5) {
				t.push(`pill of`);
			} else if (V.PC.refreshmentType === 6) {
				t.push(`tab of`);
			}

			t.push(`${V.PC.refreshment} brought in to you. This time ${s.slaveName} has been sent to deliver it. ${He} loves you, but fears you simultaneously. Such relationships were not uncommon before the advent of modern slavery, but they are especially prevalent in its wake, as fear has proven a highly effective control method for those slaveowners with the inclination and relative lack of conscience to utilize it as such. You hurriedly put the finishing touches on your work, eager to be done, and then reach for your ${V.PC.refreshment}. ${s.slaveName} flinches at your sudden movement, taking a few frightened steps back, nearly dropping the serving tray and leaving you grasping at thin air. It was a simple fear response; ${he} didn't realize you were ready for your treat and instinctively thought you were reaching out to strike ${him}. Tears well up in ${his} eyes as ${he} apologizes profusely.`);
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			canWalk,
			canSee,
			canHear,
			hasAnyArms,
			s => s.devotion >= 50,
			s => s.trust <= 20
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, girl
			} = getPronouns(s);
			const {womanP} = getPronouns(V.PC).appendSuffix("P");
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			// SRC sleepingAmbivalent
			let r = [];
			r.push(`Passing through the slave dormitory at night, you run your eyes down the row of sleeping chattel. The light here is low, but it's not dark. Slaves need to be able to find the bathroom, slaves on late assignments need to find their beds, and those permitted to do so need to be able to select slaves for sex. ${s.slaveName} catches your eye. The dormitory is kept at a pleasant temperature so that the slaves, who of course sleep nude, are comfortable on their bedrolls covered by a single sheet, or nothing at all. ${He} probably went to sleep with ${his} sheet pulled up to ${his} chin, which is normal behavior for slaves who aren't yet accepting of their status as compulsory sex objects, but ${he}'s shrugged it down. Half ${his} torso is bare.`);
			r.push(`The dim blue light plays across ${his} ${s.skin} skin.`);
			if (s.boobs > 2000) {
				r.push(`${His} massive boob on that side is slightly shifted by each breath.`);
			} else if (s.boobs > 800) {
				r.push(`${His} breast on that side rises and falls with each breath.`);
			} else {
				r.push(`That side of ${his} chest rises and falls with each breath.`);
			}
			if (s.belly >= 5000) {
				r.push(`${His} ${belly}`);
				if (s.bellyPreg >= 3000) {
					r.push(`pregnant`);
				}
				r.push(`belly is only partially covered by the sheet, leaving most of it visible.`);
			}
			r.push(`${He}'s sleeping soundly, ${his} breaths coming deep and slow. Most slaves where ${he} is mentally are troubled by bad dreams, but the poor ${girl} is evidently too tired for that.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			canTalk,
			s => s.devotion <= 20,
			s => s.devotion > -10,
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, his, him, himself
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			// SRC resistantShower.js
			let r = [];
			r.push(`Though ${V.assistant.name} constantly monitors all your slaves, you keep an eye on the video feeds yourself. There's nothing like the personal, human touch. You notice one night that ${s.slaveName} is crouched in the bottom of the shower. Sensing something amiss, you discreetly investigate, and find that ${he}'s crying quietly under the warm water.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			s => s.devotion <= 20,
			s => s.devotion >= -50,
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, His, his, him, himself, girl, woman, loli
			} = getPronouns(s);
			const {title: Master, say: say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const hands = hasBothArms(s) ? "hands" : "hand";
			const skinDesc = (skinToneLevel(s.skin) < 10)
				? "pink"
				: (skinToneLevel(s.skin) < 10)
					? "dark brown"
					: "brown";
			// SRC butthole.js
			let t = [];
			t.push(`The slave bathrooms are designed to completely eliminate privacy. There are few partitions, and those are glass. Your better-behaved slaves have all long since lost any hesitation about performing their ablutions nude. As you pass through the area, you notice ${s.slaveName} checking out ${his} own anus in the bathroom mirror.\n\n`);

			t.push(`There's no other way to describe what ${he}'s doing: the ${SlaveTitle(s)}`);
			if (s.belly >= 300000) {
				t.push(`is leaning over ${his} ${belly} belly with ${his} feet planted on the counter,`);
			} else if (s.height < 140) {
				t.push(`is on a step stool with ${his} back to the mirror,`);
			} else if (s.height < 160) {
				t.push(`has ${his} back to the mirror and is up on tiptoe to bring ${his} butthole into view,`);
			} else {
				t.push(`has ${his} back to the mirror,`);
			}
			t.push(`and ${he}'s`);
			if (s.butt > 6) {
				if (hasBothArms(s)) {
					t.push(`using both hands to`);
				} else if (hasAnyArms(s)) {
					t.push(`using ${his} hand to`);
				} else if (s.belly >= 300000) {
					t.push(`letting gravity`);
				} else {
					t.push(`using the edge of the sink to`);
				}
				t.push(`pull ${his} massive buttcheeks apart to`);
			} else if (s.butt > 3) {
				if (hasAnyArms(s)) {
					t.push(`using ${his} ${hands} to`);
				} else if (s.belly >= 300000) {
					t.push(`letting gravity`);
				} else {
					t.push(`using the edge of the sink to`);
				}
				t.push(`spread ${his} healthy buttcheeks to`);
			} else {
				t.push(`got ${his} hips cocked to spread ${his} sleek butt and`);
			}
			t.push(`reveal ${his} backdoor. Your slaves are trained to check themselves daily,`);
			if (s.chastityAnus) {
				t.push(`including those assigned to wear anal chastity,`);
			}
			t.push(`but ${he} seems fascinated. As you pause to watch, ${he} begins to clench and relax ${his}`);
			if (s.anus > 2) {
				t.push(`loose`);
			} else {
				t.push(`cute`);
			}
			t.push(`hole,`);
			if ((s.analArea - s.anus) > 1) {
				t.push(`lewdly flexing`);
			} else {
				t.push(`alternately puckering and relaxing`);
			}
			t.push(`the ${skinDesc} skin around it. ${He} giggles self-consciously at the sight, and then relaxes all the way, causing ${his} asspussy to open into a`);
			if (s.anus > 2) {
				if (V.PC.dick !== 0) {
					t.push(`cock-hungry`);
				} else {
					t.push(`dildo-hungry`);
				}
			} else {
				t.push(`slight`);
			}
			t.push(`gape. ${He} notices you out of the corner of ${his} eye and`);
			if (s.butt > 6) {
				if (s.belly >= 300000) {
					t.push(`slides back onto ${his} feet`);
				} else if (hasAnyArms(s)) {
					t.push(`releases ${his} grip on ${his} heavy buttocks`);
				} else {
					t.push(`slides ${his} heavy buttocks off the counter`);
				}
				t.push(`to turn and greet you, letting`);
				if (s.belly >= 300000) {
					t.push(`${his} heavy buttocks`);
				} else {
					t.push(`them`);
				}
				t.push(`clap gently together and conceal ${his} asshole again.`);
			} else if (s.butt > 3) {
				if (s.belly >= 300000) {
					t.push(`slides back onto ${his} feet`);
				} else if (hasAnyArms(s)) {
					t.push(`lets ${his} butt go`);
				} else {
					t.push(`slides ${his} butt off the counter`);
				}
				t.push(`to turn and greet you, mostly hiding ${his} asshole from the mirror.`);
			} else {
				if (s.belly >= 300000) {
					t.push(`slides back onto ${his} feet and`);
				}
				t.push(`turns to greet you, ${his} pretty rear only partially concealing ${his} asshole in the mirror.`);
			}

			t.push(`\n\n`);
			t.push(Spoken(s, `"Hi ${Master},"`));
			t.push(`${he} ${say}s cheerfully.`);
			t.push(Spoken(s, `"I was just noticing how much my butt has changed. I check it every day, but I hadn't really looked at it in a while, you know? It used to be so tight, and now`));
			if (s.anus > 2) {
				t.push(Spoken(s, `I've got a rear pussy."`));
			} else {
				t.push(Spoken(s, `it's obviously a fuckhole."`));
			}
			if (s.belly >= 300000) {
				t.push(`${He} struggles to hike ${his} knee over ${his} extreme gravidity without losing balance.`);
			} else {
				t.push(`${He} turns to face the mirror,`);
				if (s.belly >= 10000) {
					t.push(`slowly hiking one knee up onto the bathroom counter in front of it while giving ${his}`);
					if (s.belly >= 10000) {
						if (s.bellyPreg >= 3000) {
							t.push(`pregnancy`);
						} else {
							t.push(`greatly bloated middle`);
						}
						t.push(`room to hang.`);
					}
				} else {
					t.push(`hiking one knee up onto the bathroom counter in front of it.`);
				}
			}
			t.push(`${He}`);
			if (s.butt > 6) {
				t.push(`reaches around to pull a buttock aside and starts blatantly winking ${his} anus for`);
				if (hasAnyArms(s)) {
					t.push(`you, using ${his}`);
					if (hasBothArms(s)) {
						t.push(`other`);
					}
					t.push(`hand to`);
					if (s.nipples !== "fuckable") {
						t.push(`tweak`);
					} else {
						t.push(`finger`);
					}
					t.push(`a nipple.`);
				} else {
					t.push(`you.`);
				}
			} else if (s.butt > 3) {
				t.push(`spreads ${himself} and starts blatantly winking ${his} anus for`);
				if (hasAnyArms(s)) {
					t.push(`you, using ${his} ${hands} to`);
					if (s.nipples !== "fuckable") {
						t.push(`tweak`);
					} else {
						t.push(`finger`);
					}
					t.push(`${his} nipples.`);
				} else {
					t.push(`you.`);
				}
			} else {
				t.push(`cocks ${his} hips again and starts blatantly winking ${his} anus for you`);
				if (hasAnyArms(s)) {
					t.push(`you, using ${his} ${hands} to`);
					if (s.nipples !== "fuckable") {
						t.push(`tweak`);
					} else {
						t.push(`finger`);
					}
					t.push(`${his} nipples.`);
				} else {
					t.push(`you.`);
				}
			}
			if (s.analArea > 3) {
				t.push(`The huge area of ${skinDesc} anus around ${his} actual hole certainly draws the eye towards its center, though the way ${he}'s using ${his} sphincter as a come-on does enhance the effect.`);
			}
			t.push(Spoken(s, `"Please, ${Master},"`));
			if (s.fetish === "buttslut") {
				t.push(`${he} begins to beg.`);
				t.push(Spoken(s, `"I can't wait to feel ${V.PC.dick !== 0 ? 'your cock' : 'you'} inside me."`));
			} else {
				t.push(`${he} ${say}s.`);
				t.push(Spoken(s, `"Use me."`));
			}
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			s => s.devotion > 50,
			s => s.trust > 50,
			canTalk,
			canWalk,
			canSee,
			canHear,
			s => s.anus.isBetween(1, 4),
			s => s.analArea > 1
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const PC = V.PC;
			// SRC resistantAnalVirgin
			let r = [];
			r.push(`${s.slaveName} has never had anything significant up ${his} ass. Living in ${V.arcologies[0].name}, ${he} can't have missed that anal sex is a part of most slaves' lives. ${He}`);
			if (canSee(s)) {
				r.push(`witnesses`);
			} else if (canHear(s)) {
				r.push(`hears`);
			} else {
				r.push(`thinks about`);
			}
			r.push(`sodomy several times a day, at least.`);
			r.push('\n\n');
			r.push(`Lately, you've noticed that ${he} reacts to these`);
			if (canSee(s)) {
				r.push(`sights`);
			} else if (canHear(s)) {
				r.push(`sounds`);
			} else {
				r.push(`thoughts`);
			}
			r.push(`with a well-concealed flash of apprehension. It seems ${he}'s figured out that ${he} will probably be required to take it up ${his} little`);
			if (V.seeRace === 1) {
				r.push(s.race);
			}
			r.push(`butt someday, and isn't enthusiastic about the prospect. You could probably exploit this.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			s => s.devotion < -20,
			s => s.trust >= -20,
			s => s.anus === 0
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself
			} = getPronouns(s);
			const belly = bellyAdjective(s);
			const arms = hasBothArms(s) ? `arms` : `arm`;
			// SRC torpedoSqueeze
			let r = [];
			r.push(`The penthouse bathroom has a long counter and mirror arrangement with many sinks, so a number of slaves can get ready at once. During those moments of the day when`);
			if (slaveCount() > 10) {
				r.push(`many`);
			} else {
				r.push(`more than one`);
			}
			r.push(
				`of them have just been awoken and showered and are hurrying to prettify themselves, this row of sinks presents one of the nicer sights in the arcology, a neatly spaced line of slave butts and a matching line of breasts reflected in the mirror. ${s.slaveName} is especially impressive. ${His}`
			);
			if (s.boobs > 4000) {
				r.push(`monstrous`);
			} else if (s.boobs > 2000) {
				r.push(`huge`);
			} else {
				r.push(`big`);
			}
			r.push(`torpedo-shaped tits stick out a long way when ${he}'s standing upright in the nude like this.`);
			r.push(`\n\n`);
			r.push(`With ${his}`);
			if (s.belly >= 100000) {
				if (s.bellyPreg >= 1500) {
					r.push(`${belly} pregnant`);
				} else {
					r.push(belly);
				}
				r.push(`belly`);
			} else if (s.weight > 130) {
				r.push(`fat belly`);
			} else if (s.belly >= 10000) {
				if (s.bellyFluid >= 10000) {
					r.push(`${s.inflationType}-stuffed`);
				} else if (s.bellyPreg >= 1500) {
					r.push(`enormously pregnant`);
				} else {
					r.push(`enormously distended`);
				}
				r.push(`belly`);
			} else if (s.weight > 30) {
				r.push(`soft belly`);
			} else if (s.belly >= 1500) {
				if (s.bellyFluid >= 1500) {
					r.push(`${s.inflationType}-filled`);
				} else if (s.bellyPreg >= 1500) {
					r.push(`pregnant`);
				} else {
					r.push(`implant rounded`);
				}
				r.push(`belly`);
			} else if (s.muscles > 30) {
				r.push(`ripped abs`);
			} else if (s.muscles > 5) {
				r.push(`toned stomach`);
			} else {
				r.push(`middle`);
			}
			r.push(`against the edge of the counter as ${he} leans forward a little to`);
			if (s.makeup !== 0) {
				r.push(`finish ${his} makeup,`);
			} else {
				r.push(`apply lotion to ${his} face,`);
			}
			r.push(`${his} ${s.nipples} nipples are`);
			if (s.boobs > 6000) {
				r.push(`pressed against the mirror.`);
			} else if (s.boobs > 4000) {
				r.push(`almost brushing the mirror.`);
			} else if (s.boobs > 2000) {
				r.push(`halfway to the mirror.`);
			} else {
				r.push(`over the sink.`);
			}
			r.push(`${He}'s concentrating on ${his} task, and every little motion of ${his} ${arms} makes ${his} spectacularly pointed breasts sway a little.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			s => s.assignment !== Job.QUARTER,
			s => s.boobs > 600,
			s => s.boobShape === "torpedo-shaped",
			s => s.devotion >= -50,
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, his, him
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			// SRC fearfulHumiliation
			let r = [];
			r.push(`Even if ${he} isn't yet a truly devoted sex slave, ${s.slaveName} generally obeys orders. ${He} blushes furiously when given any sexual command, but ${his} true feelings about humiliation become clear when ${he} is ordered to serve in front of others, even other slaves. It sometimes seems the number of people watching ${him} get fondled, used, or fucked directly reduces the distance between ${him} and ${his} next blushing or even sobbing orgasm.`
			);
			r.push(`\n\n`);
			r.push(`You consider whether to prove the depths of ${his} humiliation to ${him}, or perhaps use a bait and switch tactic before setting ${him} out for public use.`
			);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			canTalk,
			canHear,
			s => s.fetish === "humiliation",
			s => s.devotion <= 50,
			s => s.devotion >= -20,
			s => canDoAnal(s) || canDoVaginal(s),
			s => s.anus !== 0,
			s => s.vagina !== 0,
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			// SRC soreAss
			let r = [];
			r.push(`One night, you see ${s.slaveName}`);
			if (!hasAnyLegs(s)) {
				r.push(`scooting ${himself} from side to side uncomfortably,`);
			} else if (s.heels === 1 && shoeHeelCategory(s) === 0) {
				r.push(`crawling gingerly,`);
			} else if (shoeHeelCategory(s) > 1) {
				r.push(`tottering along painfully,`);
			} else {
				r.push(`walking a little funny,`);
			}
			r.push(`as though ${he} has a sore butt. You call ${him} over to inspect ${his} backdoor to see if ${he} needs care,`);
			if (!hasAnyLegs(s)) {
				r.push(`and set ${his} helpless body down, spreading ${his} buttocks to examine ${his} anus.`);
			} else {
				r.push(`and order ${him} to spread ${his} buttocks for you so you can examine ${his} anus.`);
			}
			r.push(`${His} asshole is fine, just a little sore from hard buttfucks. ${He} complies with you, but as you probe ${him} gently with a finger,`);
			if (!canTalk(s) && (!hasAnyArms(s))) {
				r.push(`${he} wriggles desperately and turns to mouth "it hurts ${getWrittenTitle(s)} please don't assrape me" at you.`);
			} else if (!canTalk(s)) {
				r.push(`${he} gestures desperately, telling you ${his} butt hurts and asking you not to assfuck ${him}.`);
			} else {
				r.push(
					`${he} bursts out,`,
					Spoken(s, `"${Master}, my butt is so sore! Please don't use my ass, ${Master}. Please."`)
				);
			}
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			s => s.devotion <= 50,
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, his, him, himself
			} = getPronouns(s);
			const {say, title: Master} = getEnunciation(s);
			const desc = SlaveTitle(s);
			const PC = V.PC;
			// SRC devotedEducated
			let t = [];
			t.push(`${s.slaveName} comes before you for a routine inspection. The ${desc} is a well-educated and obedient slave. Though ${he} performs ${his} duties devotedly and to the best of ${his} abilities, slave life is not particularly conducive to straining an individual's brainpower. You happen to run into ${s.slaveName} in the hallways of the penthouse, where ${he} takes the opportunity to wordlessly signal ${he} wishes to gain your attention.`);
			if (canTalk(s)) {
				t.push(`"${Master}," ${he} ${say}s. "${Spoken(s, `I really enjoy my role as your slave, but I just don't feel like my new life stimulates me.`)}" ${He} blushes prettily at ${his} choice of words before continuing, "${Spoken(s, `Stimulate my mind, I mean.`)}"`);
			} else {
				t.push(`${He} uses gestures to beg your pardon and explains that while ${he} enjoys life as your slave, ${he} doesn't feel like ${his} new role in your arcology allows ${him} to stimulate ${his} mind as often as it does ${his} body.`);
			}
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			s => (canWalk(s) || (canMove(s) && s.rules.mobility === "permissive")),
			hasAnyArms,
			canTalk,
			s => s.devotion > 50,
			s => s.intelligence + s.intelligenceImplant > 50,
			s => s.intelligenceImplant >= 15,
			s => s.accent < 4
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, His, his, him
			} = getPronouns(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			// SRC obedientBitchy
			let t = [];
			t.push(`${s.slaveName} is a decent slave, pretty well broken to your will and generally obedient. However, ${he} retains a cutting tongue. Though ${he}'s learned to ${his} considerable cost not to direct ${his} cheek at you, ${he} still insults your other slaves, and worse, will be sarcastic to members of the public ${he} encounters. You've worked on it, but it remains unsolved. Today, however, ${he} crossed the line. You were doing business in your office with a respected female slave drug wholesaler. The woman is in her late forties, and though she's something of a plastic surgery addict she has permitted her hair to go a becoming steel grey. Passing your office, ${s.slaveName} audibly commented on how old she looked to`);
			if (canStand(s)) {
				t.push(`another slave.`);
			} else {
				t.push(`${his} aide.`);
			}
			t.push(`Anger flashes in the businesswoman's eyes.`);
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			canTalk,
			canSee,
			s => s.behavioralFlaw === "bitchy",
			s => s.devotion > 20,
			s => s.trust >= -20
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, His, his, him, himself
			} = getPronouns(s);
			const {hisA} = getPronouns(assistant.pronouns().main).appendSuffix('A');
			const {title: Master} = getEnunciation(s);
			const desc = SlaveTitle(s);
			const PC = V.PC;
			// SRC cockfeederResistance
			let t = [];
			t.push(`As you're starting your day, your assistant pauses their review of business matters to report that ${s.slaveName} is not accepting ${his} breakfast from the phallic feeders in the kitchen. With nothing else urgent, you head down to address the situation. ${s.slaveName} is in the proper position for feeding, on ${hasBothLegs(s) ? `${his} knees` : "the ground"} in front of a feeding fuckmachine. ${He} isn't sucking it off for ${his} breakfast, however. ${He} doesn't seem to be fully awake, and is ${canSee(s) ? "regarding" : "touching"} the big dildo that ${he}'s supposed to suck off for food with vague distaste. ${His} ${s.faceShape} face is scrunched into a look of tired disgust.`);
			t.push(`\n\n`);
			t.push(`${He} turns to you as you enter, and ${canSee(s) ? "seeing" : "realizing"} that it's you, ${he}`);
			if (canTalk(s)) {
				t.push(`mumbles unhappily, "${Spoken(s, `Please, ${Master}, please, can I just eat normally for one day? This is, um, kind of gross.`)}"`);
			} else {
				t.push(`uses hesitant gestures to beg you to let ${him} eat normally today. ${His} hand${hasBothArms(s) ? "s become" : " becomes"} vehement when it comes to the phallus in ${his} face, which ${he} apparently finds disgusting.`);
			}
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			canStand,
			hasAnyArms,
			s => s.devotion <= 20 && s.devotion >= -50,
			s => s.trust >= -20,
			s => s.fetish !== "cumslut"
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, His, his, him, himself
			} = getPronouns(s);
			const {hisA} = getPronouns(assistant.pronouns().main).appendSuffix('A');
			const {title: Master} = getEnunciation(s);
			const desc = SlaveTitle(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			// suppositoryResistance
			let t = [];
			t.push(`As you're starting your day, your assistant pauses their review of business matters to report that ${s.slaveName} is not accepting ${his} drugs from the phallic feeders in the kitchen. With nothing else urgent, you head down to address the situation. ${s.slaveName} is standing in front of the place where ${he}'s supposed to take ${his} drugs. It's a little pad on the ground on which ${he}'s supposed to kneel, with a fuckmachine positioned to penetrate ${his} anus once ${he} does so. ${He}'s not completely awake yet, and is just standing there, ${canSee(s) ? "viewing" : "feeling"} the setup with a vague look of distaste. ${He}'s facing it, and has ${his}`);
			if (s.butt > 6) {
				t.push("massive behind");
			} else if (s.butt > 3) {
				t.push("beautiful bottom");
			} else {
				t.push("cute butt");
			}
			t.push("pointed very much away from the machine that's supposed to be fucking it.");
			t.push(`\n\n`);
			t.push(`${He} turns to you as you enter, and ${canSee(s) ? "seeing" : "realizing"} that it's you, ${he}`);
			if (canTalk(s)) {
				t.push(
					`mumbles unhappily,`,
					Spoken(s, `"Please, ${Master}, can I just take a shot? Assrape from, you know, people, is, um, bad enough."`)
				);
			} else {
				t.push(`uses hesitant gestures to beg you to let ${him} take ${his} drugs normally. ${He} tries to use gestures to explain that ${he} thinks ${he} gets enough anal from humans, without being buttfucked by a machine every morning.`);
			}
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			canStand,
			hasAnyArms,
			s => s.devotion <= 20 && s.devotion >= -50,
			s => s.trust >= -20,
			s => s.fetish !== "buttslut"
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			// SRC hatesOral
			let r = [];
			r.push(`${s.slaveName} has been in your service long enough to know that oral sex is a daily fact of life for most slaves, and that most slaves are not only required to put up with cum, but to love it, too — or at least be able to fake enjoyment convincingly. ${He}'s`);
			if (canSee(s)) {
				r.push(`seen cum spattered on other slaves' faces, pooling in their mouths, and dripping from their asses only to be licked up by other slaves.`);
			} else if (canHear(s)) {
				r.push(`heard cum spattering across other slaves' faces, the sound of it in their mouths, dripping from their asses, and more.`);
			} else {
				r.push(`felt seminal fluid on ${his} skin and on ${his} lips, always coercively or accidentally.`);
			}
			r.push(`It's clear from ${s.slaveName}'s recent reactions to these acts that ${he}'s quite disgusted by oral sex in general and cum in particular. Depending on your point of view, this could be a flaw for ${him} to overcome or a weakness you can exploit.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			s => s.devotion <= 50,
			s => s.sexualFlaw === "hates oral",
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, his, himself, him
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			// SRC REBusyArcade
			let r = [];
			r.push(`Slaves in your arcade are not immured in the facility permanently, since holding them in one position at all times would negatively impact their health. They are released to exercise, eat, bathe, and sleep, but for nothing else. You occasionally inspect them when they do so, to see that their harsh lives are not inappropriately difficult for them. One day when you are doing so, ${s.slaveName} flings ${himself} on the ground in front of you the instant ${he} sees you.`);
			r.push(`Facing the ground, ${he}`);
			if (!canTalk(s)) {
				r.push(`gestures`);
				if (hasAnyArms(s)) {
					r.push(`with ${hasBothArms(s) ? "shaking hands" : "a shaking hand"}`);
				} else {
					r.push(`in the limited capacity that ${he} is capable of`);
				}
				r.push(`that ${he} cannot take any more. ${He} begs you abjectly to let ${him} out of the arcade and promises to be a perfect sex slave if you do.`);
			} else {
				if (SlaveStatsChecker.checkForLisps) {
					r.push(`lisps through tears`);
				} else {
					r.push(`sobs,`);
				}
				r.push(`"${Master}, ${Spoken(s, "please. I can't take any more of this. Please let me out. I'll do anything")}, ${Master}. I'll love you forever, ${Master} — ${Spoken(s, "just don't make me go back inside")} that wall."`);
			}
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			s => canMove(s) || hasAnyLegs(s),
			s => s.devotion < 45
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, hers, He, he, his, him, himself, woman, girl, loli
			} = getPronouns(s);
			const {title: Master, say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			const phallus = PC.dick === 0 ? "phallus" : "cock";
			// SRC devotedShortstack
			let t = [];
			t.push(`${s.slaveName} comes before you for a routine inspection. The`);

			if ((s.height > 130) && (s.boobs > 800)) {
				t.push(`shortstack`);
			} else if ((s.height > 130) && (s.boobs < 600)) {
				t.push(`petite`);
			} else {
				t.push(`short`);
			}
			if (s.belly >= 10000) {
				if (s.bellyPreg >= 3000) {
					t.push(`and heavily pregnant`);
				} else {
					t.push(`and ${belly} bellied`);
				}
			} else if (s.bellyPreg >= 1500) {
				t.push(`pregnant`);
			}
			if (s.physicalAge > 30) {
				t.push(`${woman}`);
			} else if (s.physicalAge > 17) {
				t.push(`${girl}`);
			} else if (s.physicalAge > 12) {
				t.push(`teen`);
			} else {
				t.push(`${loli}`);
			}
			t.push(`is looking good despite ${his} diminutive height. When ${he} raises ${his}`);
			if (hasBothArms(s)) {
				t.push(`arms`);
			} else {
				t.push("arm");
			}
			t.push(`above ${his} head to submit to an inspection under your gaze, the top of ${his} ${s.hColor}-haired head doesn't even reach your chest. Despite the discrepancy between your height and ${hers}, you notice an unmistakable flush of embarrassment tinging ${his} cheeks.`);
			if (canSee(s)) {
				t.push(`${His} ${App.Desc.eyesColor(s)} flick up to gaze at you, but ${he} must crane ${his} head upwards as well to meet your gaze.`);
			} else if (canHear(s)) {
				t.push(`${His} ears perk up to hear at the sound of some minute noise you made, before ${he} cranes ${his} head upwards so that ${his} sightless eyes may meet your gaze.`);
			} else {
				t.push(`${He} knows from training and experience how tall you are, and uses this knowledge to crane ${his} head exactly so that your gaze meets ${his} face directly.`);
			}
			if (!canTalk(s)) {
				t.push(`${He} uses gestures to beg your pardon, even as ${he} continues to blush rosily, and explains that ${he} doesn't understand why you keep ${him} in your penthouse, when there are such tall, beautiful slaves in abundance in your arcology. ${He} pauses, shuffling about a little shamefacedly before signing that ${he} thinks their bodies could be more fit to pleasure you.`);
			} else {
				t.push(`"${Master}," ${he} ${say}s.`);
				t.push(Spoken(s, `"Why do you keep a short, plain slave like me in your penthouse, when there are such beautiful, tall slaves out there in the arcology?"`));
				t.push(`${He} shuffles about under your gaze a little shamefacedly before saying in a quiet voice,`);
				t.push(Spoken(s, `"Surely, their bodies are more fit for pleasuring you."`));
			}
			return t.join(" ");
		},
		prereqs: [
			s => s.height < (Height.mean(s) * 0.95),
			s => s.physicalAge > 12,
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			canStand,
			s => s.trust <= 95,
			s => s.devotion > 20,
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him
			} = getPronouns(s);
			const {title: Master, say} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			// SRC cowMilking
			let r = [];
			r.push(
				`Heading back towards your office after seeing to a minor matter, you encounter ${s.slaveName}, heading for the penthouse milkers.`);
			if (s.assignment === Job.MILKED) {
				r.push(`Though it's ${his} job to be a human cow, ${he}'s allowed to roam as ${he} pleases when ${he}'s not getting milked, being fed, or otherwise occupied, and ${he} must have been elsewhere.`);
			} else {
				r.push(`${He}'s not assigned to be a human cow full time, since it's ${his} main focus to ${s.assignment}, but ${he}'s still obliged to visit the milkers regularly.`);
			}
			r.push(`In any case, ${he}'s obviously in desperate need of a milking. ${He}'s hurrying along with ${his}`);
			if (s.boobs > 4000) {
				r.push(`absurd`);
			} else {
				r.push(`heavy`);
			}
			r.push(`udders cradled in both arms, trying desperately to shield them from the uncomfortable motion of walking.`);
			r.push(`\n\n`);
			if (canSee(s)) {
				r.push(`Seeing`);
			} else {
				r.push(`Noticing`);
			}
			r.push(`you, ${he} stops short and then winces as ${his} milk-filled breasts slosh to a stop, too.`);
			if (!canTalk(s)) {
				r.push(`${He} gestures a submissive greeting and then hesitates, catching ${his} lower lip cutely behind ${his} upper teeth. Then ${he} politely asks if you would milk ${him}.`);
			} else {
				r.push(
					Spoken(s, `"Hi ${Master},"`),
					`${he} ${say}s in greeting, and then hesitates, catching ${his} lower lip cutely behind ${his} upper teeth.`,
					Spoken(s, `"Um, would you please milk me?"`)
				);
			}
			if (s.fetish === "boobs") {
				r.push(`The shamelessly breast obsessed cow rarely misses an opportunity to ask for mammary intercourse, or anything remotely like it. Something as intimate as having you tug the ${milkFlavor(s)}milk from ${his} nipples would definitely qualify.`);
			} else {
				r.push(`${He}'s not exactly a breast fetishist, but milking is nonetheless a deeply important activity for ${him}, emotionally; the neurochemical effects of continual lactation are strong. ${He}'s so devoted to you that ${he} probably considers this a reassuringly intimate act.`);
			}
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			canTalk,
			s => s.lactation > 0,
			s => s.boobs > 800,
			s => s.devotion > 20,
			s => s.trust > 20,
		]
	},
	{
		getGreeting: (s) => {
			const {His, He, he, his, him, himself} = getPronouns(s);
			const belly = bellyAdjective(s);
			// SRC devotedNympho
			let r = [];
			r.push(`On first slot of the inspection schedule for the day is ${s.slaveName}. When ${he} walks clumsily through the door of your office, it's obvious the poor nympho slut hasn't found release since waking up. ${His} incredible sex drive has ${his} arousal at a fever pitch.`);
			r.push(`\n\n`);
			r.push(`${He}'s walking awkwardly because of how painfully horny ${he} is. ${His}`);
			switch (s.nipples) {
				case "tiny":
					r.push(`tiny little nipples are rock hard.`);
					break;
				case "flat":
					r.push(`stretched nipples, which normally rest flush with ${his} areolae, are hard and prominent.`);
					break;
				case "puffy":
					r.push(`puffy nipples are flushed and stiff.`);
					break;
				case "partially inverted":
					r.push(`nipples, which normally rest flush with ${his} areolae, are fully erect.`);
					break;
				case "inverted":
					r.push(`nipples, which are normally fully inverted, are all the way out; that must have been a painful process.`);
					break;
				case "huge":
					r.push(`massive nipples are so big and hard ${he} could probably penetrate someone with them.`);
					break;
				case "fuckable":
					r.push(`fuckable nipples are practically swollen shut.`);
					break;
				default:
					r.push(`nipples are standing out with uncomfortable hardness.`);
			}
			if (s.chastityPenis) {
				r.push(`${His} chastity cage looks fit to burst with engorged dick.`);
			} else if (s.dick > 4 && canAchieveErection(s)) {
				r.push(`${His} gigantic erection waves around in front of ${him} as ${he} moves, its head describing a long arc in the air with each step.`);
			} else if (s.dick > 2 && canAchieveErection(s)) {
				r.push(`${His} erection waves around in front of ${him} as ${he} moves, its head bobbing lewdly up and down with each step.`);
			} else if (canAchieveErection(s)) {
				r.push(`${His} erection is so pathetically small that it stands out straight and stiff as ${he} moves.`);
			} else if (s.dick > maxErectionSize(s)) {
				r.push(`${His} oversized dick is as engorged as ${his} body can manage.`);
			} else if (s.dick > 0) {
				r.push(`${He}'s actually partway erect despite ${his} impotence, a remarkable testament to ${his} need.`);
			} else if (s.chastityVagina) {
				r.push(`${His} chastity belt positively tortures ${him} as ${he} moves.`);
			} else if (s.labia > 1) {
				r.push(`${His} normally-large pussylips are even more prominent than usual, swollen with need.`);
			} else if (s.clit > 3) {
				r.push(`${His} dick-like clit stands out straight and stiff as ${he} moves.`);
			} else if (s.clit > 1) {
				r.push(`${His} huge, sensitive clit positively tortures ${him} as ${he} moves.`);
			} else if (s.vagina === -1) {
				r.push(`${He} has no genitals to get hard or wet, but ${his} posture leaves no doubt that there's nothing ${he} wants more than to get ${his} ass reamed.`);
			} else {
				r.push(`${His} pussy is soaking wet, and streaks of female arousal are shining on ${his} inner thighs.`);
			}
			r.push(`As ${he} staggers to a halt in front of your desk,`);
			if (s.chastityPenis) {
				r.push(`the pressure on ${his} penis finally`);
			} else if (s.dick > 4 && canAchieveErection(s)) {
				r.push(`the movement of ${his} huge penis through the air`);
			} else if (s.dick > 2 && canAchieveErection(s)) {
				r.push(`${his} cock slaps up against ${his} stomach, which`);
			} else if (canAchieveErection(s)) {
				r.push(`${his} tiny dick is momentarily trapped between ${his} thighs, which`);
			} else if (s.dick > 6) {
				r.push(`${his} motion of ${his} gigantic cock against ${his} body.`);
			} else if (s.dick > 0) {
				r.push(`${his} floppy cock hits ${his} thighs, which`);
			} else if (s.chastityVagina) {
				r.push(`the friction against ${his} genitals finally`);
			} else if (s.labia > 1) {
				r.push(`which brings ${his} thighs together enough that this`);
			} else if (s.clit > 3) {
				r.push(`the movement of ${his} huge clit through the air`);
			} else if (s.clit > 1) {
				r.push(`stimulating ${his} clit enough that it`);
			} else if (s.vagina === -1) {
				r.push(`${his} motion flexes ${his} buttocks together just enough to clench ${his} sensitive asspussy, and`);
			} else {
				r.push(`${his} motion`);
			}
			r.push(`provides just enough stimulation that ${he} climaxes. ${His}`);
			if (hasAnyArms(s)) {
				if (hasBothArms(s)) {
					r.push(`hands ball into fists at ${his} sides`);
				} else {
					r.push(`hand balls into a fist at ${his} side`);
				}
				r.push(`and ${his}`);
			}
			r.push(`torso pitches forward involuntarily,`);
			if (s.chastityPenis) {
				r.push(`a dribble of cum leaking from ${his} cage.`);
			} else if ((s.balls > 3 && s.hormoneBalance < -20) || s.balls >= 10) {
				r.push(`a ridiculous, pent-up torrent of cum shooting out`);
				if (s.dick > 0) {
					r.push(`and onto the floor.`);
				} else {
					r.push(`of the tiny hole on ${his} featureless crotch.`);
				}
			} else if (canAchieveErection(s)) {
				r.push(`a strong jet of cum shooting out and onto the floor.`);
			} else if (s.vagina === -1 && s.dick === 0) {
				r.push(`dribbling a little fluid out of the tiny hole in ${his} otherwise featureless groin.`);
			} else if (s.balls > 0 && s.dick > 0 && !canAchieveErection(s)) {
				r.push(`${his} soft cock twitching upward and shooting out quite a lot of cum.`);
			} else if (s.dick > 0) {
				if (s.prostate > 1) {
					r.push(`a large spurt of`);
				} else {
					r.push(`a few drops`);
				}
				r.push(`watery ejaculate scattering from ${his} dickhead.`);
			} else if (s.vagina > 1) {
				r.push(`the strong muscles around ${his} big cunt visibly contracting with the force as ${he} squirts a jet of girlcum out onto ${his} legs and the floor.`);
			} else if (s.lactation > 1) {
				r.push(`a surprising`);
				if (s.nipples !== "fuckable") {
					r.push(`jet`);
				} else {
					r.push(`gush`);
				}
				r.push(`of ${milkFlavor(s)}milk issuing from both of ${his} nipples.`);
				s.lactationDuration = 2;
				s.boobs -= s.boobsMilk;
				s.boobsMilk = 0;
			} else if (s.lactation > 0) {
				r.push(`drops of ${milkFlavor(s)}milk`);
				if (s.nipples !== "fuckable") {
					r.push(`appearing at each of ${his} motherly nipples only to be flung onto the floor.`);
				} else {
					r.push(`running from each of ${his} nipples and down ${his} breasts.`);
				}
				s.lactationDuration = 2;
				s.boobs -= s.boobsMilk;
				s.boobsMilk = 0;
			} else if (s.belly >= 2000) {
				if (s.bellyFluid >= 2000) {
					r.push(`forcing a grunt out of ${him} as ${he} bends against ${his} ${belly} ${s.inflationType}-filled belly`);
					if (s.vagina > -1) {
						r.push(`squirting a`);
						if (s.prostate > 0) {
							r.push(`a large spurt of`);
						} else {
							r.push(`little jet`);
						}
						r.push(`of girlcum`);
						if (s.inflationMethod === 2) {
							r.push(`from ${his} pussy and a dribble of ${s.inflationType} from ${his} ass`);
						} else {
							r.push(`down ${his} legs and`);
						}
						r.push(`onto the floor.`);
					} else {
						if (s.inflationMethod === 2) {
							r.push(`as the muscles in ${his} lower body visibly contract with the force, squirting out a little jet of ${s.inflationType} from ${his} ass.`);
						} else {
							r.push(`as the muscles in ${his} lower body visibly contract with the force.`);
						}
					}
				} else {
					r.push(`forcing a grunt out of ${him} as ${he} bends against ${his} ${belly}`);
					if (s.bellyPreg >= 2000) {
						r.push(`pregnant`);
					}
					r.push(`belly`);
					if (s.vagina > -1) {
						r.push(`squirting a`);
						if (s.prostate > 0) {
							r.push(`a large spurt of`);
						} else {
							r.push(`little jet`);
						}
						r.push(`of girlcum out onto ${his} legs and the floor.`);
					} else {
						r.push(`as the muscles in ${his} lower body visibly contract with the force.`);
					}
				}
			} else if (s.vagina < 0) {
				r.push(`the muscles in ${his} lower body visibly contracting with the force.`);
			} else {
				r.push(`squirting a`);
				if (s.prostate > 0) {
					r.push(`a large spurt of`);
				} else {
					r.push(`little jet`);
				}
				r.push(`of girlcum out onto ${his} legs and the floor.`);
			}
			r.push(`${He} stands up straight, but this brings ${his}`);
			if (canSee(s)) {
				r.push(`${App.Desc.eyesColor(s)} up to gaze straight into yours,`);
			} else {
				r.push(`face to face with you,`);
			}
			r.push(`and the mixed release, humiliation, and naughtiness of having climaxed prematurely right in front of ${his} ${getWrittenTitle(s)} produces an aftershock, adding to the mess on the floor.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			canWalk,
			canTalk,
			s => s.devotion > 50,
			s => s.anus > 0,
			s => s.vagina !== 0,
			s => s.assignment !== Job.QUARTER,
			s => canDoAnal(s) || canDoVaginal(s)
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself, girl
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			// milkgasm
			let r = [];
			r.push(
				`${s.slaveName} is implanted with slow-release lactation drugs. ${His} lactation is dissimilar to that of a normal mother. It's the same stuff, but it's produced at a much, much higher volume. To stay comfortable, ${s.slaveName} has to use milkers every couple of`
			);
			if (s.assignment !== Job.MILKED) {
				r.push(`hours even though ${he} isn't assigned to give milk as ${his} primary job.`);
			} else {
				r.push(`hours.`);
			}
			r.push(`Any more than that, and ${he} gets painfully sore; any less than that, and`);
			if (s.nipples === "inverted" || s.nipples === "fuckable") {
				r.push(`${his} ${milkFlavor(s)}milk, backed up behind ${his} ${s.nipples} nipples, leaves ${him} in agony.`);
			} else {
				r.push(`${he} begins to spontaneously squirt cream whenever ${his} breasts are subjected to the slightest motion.`);
			}
			r.push(`\n\n`);
			r.push(`${He} constantly passes by your desk as you work, going back and forth between the milkers and ${his} other tasks. Even if you didn't know which was which, it would be easy to tell which way ${he} was going. One way, ${he}`);
			if (!canWalk(s)) {
				r.push(`crawls`);
			} else if (shoeHeelCategory(s) > 1) {
				r.push(`totters`);
			} else if (s.belly >= 10000) {
				r.push(`waddles`);
			} else {
				r.push(`walks`);
			}
			if (hasAnyArms(s)) {
				r.push(`gingerly, supporting ${his} udders with`);
				if (hasBothArms(s)) {
					r.push(`both hands`);
				} else {
					r.push(`${his} hand`);
				}
				if (s.belly >= 10000) {
					r.push(`and ${his} ${belly}`);
					if (s.belly >= 3000) {
						r.push(`pregnant`);
					} else {
						r.push(`rounded`);
					}
					r.push(`belly`);
				}
			} else {
				r.push(`gingerly, doing everything in ${his} limited capacity to keep them steady`);
			}
			r.push(r.pop() + ",");
			if (s.nipples === "inverted") {
				r.push(`wincing`);
			} else {
				r.push(`dribbling a little bit of ${milkFlavor(s)}milk`);
			}
			r.push(`as ${he} goes. The other way, ${he} has a distinctly relieved expression and ${his} breasts are much saggier.`);
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			canMove,
			s => s.devotion >= -20,
			s => (canDoAnal(s) || canDoVaginal(s)),
			s => s.lactation > 1,
			s => s.boobs > 500
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const arms = hasBothArms(s) ? "arms" : "arm";
			const birthName = Spoken(s, s.birthName);
			const slaveName = Spoken(s, s.slaveName);
			// SRC notMyName
			let r = [];
			r.push(App.UI.DOM.slaveDescriptionDialog(s));
			r.push(`${s.slaveName} is not yet broken to your will. With your experience with slaves, you've been expecting ${him} to take some opportunity of exercising ${his} remaining independence. You don't have long to wait. One day, you give ${him} inconsequential orders, naturally addressing ${him} by ${his} slave name, ${s.slaveName}. ${He} replies`);
			if (s.lips > 70) {
				r.push(`waspishly through ${his} dick-sucking lips,`);
			} else if (s.piercing.lips.weight + s.piercing.tongue.weight > 2) {
				r.push(`waspishly through ${his} heavily-pierced lips,`);
			} else {
				r.push(`waspishly,`);
			}
			r.push(
				Spoken(s, `"${Master}, my name is ${birthName}."`),
				`${He} sets ${his} jaw and`
			);
			if (canSee(s)) {
				r.push(`manages to meet your eyes without flinching.`);
			} else {
				r.push(`meets your glare with a look of defiance.`);
			}
			return r.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			canTalk,
			s => s.slaveName !== s.birthName,
			s => s.birthName !== "",
			s => s.devotion <= 20,
			s => s.trust >= -20,
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, he, His, his, him, girl
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const PC = V.PC;
			// SRC obedientAddict
			let t = [];
			t.push(`${s.slaveName} takes ${his} aphrodisiacs in pill form, with ${his} food. They're dispensed alongside ${his} nutrition in the kitchen. You happen to be passing by when ${he}'s being issued ${his} drugs, and you see ${him} ${canSee(s) ? "staring" : "gazing"} thoughtfully at the insignificant-looking little pill, just holding it in ${his} hand and considering it for a long time. When ${he} realizes you're watching, ${he} turns to you and you realize ${his} eyes are moist.\n\n`);
			if (canTalk(s)) {
				t.push(`${He} ${SlaveStatsChecker.checkForLisp(s) ? "lisps through huge, quivering lips" : "mutters"}, "${Master}, ${Spoken(s, "I hate this shit. I come and come and come but it's just physical. I haven't felt close to anyone ever since I've been on these fucking aphrodisiacs.")}" ${He} shrugs bitterly. ${Spoken(s, `"Still crave them though."`)}`);
			} else {
				t.push(`${He} uses trembling gestures to pour out dissatisfaction with life as an aphrodisiac addict. ${He} is emotionally unsatisfied with the mechanical orgasms ${he} gets on the drugs, but craves them intensely.`);
			}
			return t.join(" ");
		},
		prereqs: [
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			s => s.aphrodisiacs > 0 || s.inflationType === "aphrodisiac",
			s => s.addict > 20,
			s => s.devotion > 20 || s.trust < -20
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, His,
				he, his, him, himself
			} = getPronouns(S.Stewardess);
			const {
				He2,
				he2, his2, him2, himself2
			} = getPronouns(s).appendSuffix("2");
			// SRC petsStewardessBeating
			let r = [];
			r.push(`Poor ${s.slaveName} clearly isn't working as hard as ${he2} should. ${S.Stewardess.slaveName} has ${him2} bent over with ${his2} buttocks bare, and is administering a punishing spanking. ${s.slaveName}'s ${s.skin} skin is starting to show the force of the beating, and ${he2}'s begging desperately for mercy.`
			);
			r.push(`\n\n`);
			r.push(`${S.Stewardess.slaveName}, meanwhile, is obviously enjoying torturing the poor servant for ${his2} failings. ${He}'s `);
			if (S.Stewardess.chastityPenis === 1) {
				r.push(`using a couple of fingers to buttfuck ${himself}`);
			} else if (canAchieveErection(S.Stewardess)) {
				r.push(`jacking off furiously`);
			} else if (S.Stewardess.dick > 0) {
				r.push(`rubbing ${his} pathetically soft dick`);
			} else if (S.Stewardess.vagina === -1) {
				r.push(`desperately rubbing ${his} soft perineum`);
			} else {
				r.push(`rubbing ${his} sopping pussy`);
			}
			r.push(`with ${his} other hand, getting close to orgasm as the servant begs and moans.`);
			r.push(`\n\nYou wonder whether to intervene, take part in the punishment, or just watch…`)
			return r.join(" ");
		},
		prereqs: [
			// This one's unique in that it only exports if NPC is assigned as Servant
			() => !!S.Stewardess,
			() => S.Stewardess.actualAge >= 30 || V.AgePenalty === 0,
			s => [Job.HOUSE, Job.QUARTER].includes(s.assignment)
		]
	},
	{
		getGreeting: (s) => {
			const {
				He, His,
				he, his, him, himself, girl, woman
			} = getPronouns(s);
			const belly = bellyAdjective(s);
			const {title: Master} = getEnunciation(s);
			const {
				He2,
				he2, his2, him2, himself2
			} = getPronouns(S.HeadGirl).appendSuffix("2");
			// SRC reAnalPunishment
			let r = [];
			r.push(
				`As you're making the rounds through your penthouse, you hear ${S.HeadGirl.slaveName} speaking in the tones ${he2} uses to castigate misbehaving slaves in the next room. When you appear in the doorway, you have little chance to survey the situation before ${s.slaveName}, apparently the miscreant, flings ${himself} at your feet. ${He} clings to one of your legs convulsively, choking on tears as ${he} stares up at you and tries to muster an explanation. After two false starts, ${he} manages to start begging.`
			)
			r.push(Spoken(s, `"Please, ${Master},"`));
			r.push(`${he} wails miserably.`);
			r.push(Spoken(s, `"Please don't let ${him2} rape my butt."`));
			r.push(`\n\n`);
			r.push(`You shoot an amused glance at ${S.HeadGirl.slaveName}, who smiles back as ${he2} explains the slave's minor sin and ${his2} intention to sodomize the malefactor. ${He2} does not bother to keep an edge of anticipation out of ${his2} voice, and ${s.slaveName} cries harder and clings to you with renewed force as your Head Girl pronounces ${his2} intention with cruel clarity.`);
			if (s.boobs > 4000) {
				r.push(`The supplicant's breasts are so huge that ${his} embrace of your leg has completely surrounded it in deliciously heaving breastflesh.`);
			} else if (s.boobs > 1000) {
				r.push(`The weight of the supplicant's breasts is quite noticeable as ${his} embrace of your leg presses them against it.`);
			}
			r.push(`You look down at ${s.slaveName}. ${He} stares back with huge wet ${App.Desc.eyesColor(s)}, doing ${his} best to implore you with ${his} gaze, and`);
			if (s.belly < 10000) {
				r.push(`scooting ${his} rear in towards your foot`);
			} else {
				r.push(`struggling to hide ${his} rear`);
			}
			r.push(`in an unconscious effort to protect it from the promised assrape. ${He}'s quite authentically terrified; ${his} whole body is shaking.`);
			r.push(`\n\n`);
			r.push(`${S.HeadGirl.slaveName} is very much acting within ${his2} duties, and ${s.slaveName} has now misbehaved twice by trying to go over your Head Girl's head by appealing to you. ${S.HeadGirl.slaveName} is ready to carry out the sentence:`);
			if (canPenetrate(S.HeadGirl) && (S.HeadGirl.dick > 2)) {
				r.push(`${his2} cock is fully erect, and ${he2}'s keeping it hard with one hand. ${He2} slaps its head against ${his2} other palm,`);
			} else if (S.HeadGirl.dick > 0) {
				r.push(`since ${his2} dick isn't an appropriate instrument for inflicting anal pain, ${he2}'s got an elephantine dildo ready. ${He2} slaps it against ${his2} palm,`);
			} else {
				r.push(`${He2}'s got an elephantine dildo ready, and ${he2} slaps it against ${his2} palm,`);
			}
			r.push(`forcing a frightened moan from ${s.slaveName}.`);
			return r.join(" ");
		},
		prereqs: [
			() => V.HeadGirlID !== 0,
			() => V.HGSeverity >= 0,
			(s) => s.devotion <= 50,
			(s) => s.anus !== 0,
			(s) => s.fetish !== Fetish.MINDBROKEN,
			canDoAnal,
			canMove,
			hasAnyArms,
			canTalk,
			canHear,
			canSee
		]
	},
	{
		getGreeting: (s) => {
			const {
				His, He, he, his, him, himself, girl
			} = getPronouns(s);
			const {title: Master} = getEnunciation(s);
			const belly = bellyAdjective(s);
			const PC = V.PC;
			const {
				HeA, heA, himA, hisA, himselfA, girlA, womanA, loliA
			} = getPronouns(assistant.pronouns().main).appendSuffix("A");
			// SRC PAservant
			let r = [];
			r.push(`As you begin your day one morning, you hear the quiet`);
			switch (V.assistant.appearance) {
				case "monstergirl":
					r.push(`but unmistakably sensual voice of your monster${girlA}`);
					break;
				case "shemale":
					r.push(`but unmistakably lewd voice of your shemale`);
					break;
				case "amazon":
					r.push(`but unmistakably aggressive voice of your amazon`);
					break;
				case "businesswoman":
					r.push(`but unmistakably dominant voice of your business${womanA}`);
					break;
				case "fairy":
				case "pregnant fairy":
					r.push(`but unmistakably adorable voice of your fairy`);
					break;
				case "goddess":
				case "hypergoddess":
					r.push(`and kindly voice of your goddess`);
					break;
				case "loli":
					r.push(`and childish voice of your ${loliA}`);
					break;
				case "preggololi":
					r.push(`and childish, out of breath voice of your pregnant ${loliA}`);
					break;
				case "angel":
					r.push(`but unmistakably caring voice of your angel`);
					break;
				case "cherub":
					r.push(`yet overly cheerful voice of your cherub`);
					break;
				case "incubus":
					r.push(`and commanding, but obviously aroused voice of your incubus`);
					break;
				case "succubus":
					r.push(`and seductive, but obviously aroused voice of your succubus`);
					break;
				case "imp":
					r.push(`and harassing voice of your imp`);
					break;
				case "witch":
					r.push(`and oddly aroused voice of your witch`);
					break;
				case "ERROR_1606_APPEARANCE_FILE_CORRUPT":
					r.push(`and very distinct voice of your avatar`);
					break;
				case "schoolgirl":
					r.push(`but unmistakably suggestive voice of your school${girlA}`);
			}
			r.push(`personal assistant coming from your office. Looking in, you are treated to the sight of ${s.slaveName}'s`);
			if (s.butt > 8) {
				r.push(`ridiculous bottom jiggling`);
			} else if (s.butt > 4) {
				r.push(`big behind bouncing`);
			} else {
				r.push(`cute rear`);
			}
			if (s.belly >= 5000) {
				r.push(r.pop() + `, and the ${belly} rounded belly hanging between ${his} legs,`);
			}
			r.push(`as ${he} reaches out over the glass top of your desk with a soft, dust-free cloth and a bottle of screen cleaner. ${capFirstChar(V.assistant.name)} is displaying ${hisA} avatar right under where the slave is cleaning the glass screen, and ${heA}'s displaying it nude. ${HeA}'s positioned ${himselfA} so that the poor slave appears to be wiping`);
			switch (V.assistant.appearance) {
				case "monstergirl":
					r.push(`${hisA} hair-tentacles`);
					break;
				case "shemale":
					r.push(`the shaft of ${hisA} massive prick`);
					break;
				case "amazon":
					r.push(`the insides of ${hisA} muscular thighs`);
					break;
				case "businesswoman":
					r.push(`${hisA} pussy`);
					break;
				case "fairy":
					r.push(`${hisA} tiny body`);
					break;
				case "pregnant fairy":
					r.push(`${hisA} tiny yet swollen body`);
					break;
				case "goddess":
					r.push(`${hisA} motherly tits`);
					break;
				case "hypergoddess":
					r.push(`${hisA} huge pregnant belly`);
					break;
				case "loli":
					r.push(`${hisA} flat chest`);
					break;
				case "preggololi":
					r.push(`${hisA} pregnant belly`);
					break;
				case "angel":
					r.push(`${hisA} wide-spread wings`);
					break;
				case "cherub":
					r.push(`${hisA} cute pussy`);
					break;
				case "incubus":
					r.push(`${hisA} throbbing prick`);
					break;
				case "succubus":
					r.push(`${hisA} lovely pussy`);
					break;
				case "imp":
					r.push(`${hisA} pussy`);
					break;
				case "witch":
					r.push(`${hisA} plump tits`);
					break;
				case "ERROR_1606_APPEARANCE_FILE_CORRUPT":
					r.push(`${hisA} phallic tentacles`);
					break;
				case "schoolgirl":
					r.push(`${hisA} perky tits`);
			}
			r.push(`down with screen cleaner, and is talking dirty to the furiously blushing servant. "Ohh, that feels good," ${heA} moans. "Rub me right there, you ${SlaveTitle(s)} slut! I love it!" The poor slave is doing ${his} best to hurry, embarrassed and unsure of how to react to ${V.assistant.name}'s behavior.`);
			return r.join(" ");
		},
		prereqs: [
			() => V.assistant.appearance !== "normal",
			() => V.assistant.personality === 1,
			s => s.fetish !== Fetish.MINDBROKEN,
			hasAnyArms,
			hasAnyLegs,
			canTalk,
			s => s.devotion >= -20,
			s => s.devotion <= 50,
			canSee,
			s => [Job.HOUSE, Job.QUARTER].includes(s.assignment),
			s => canDoVaginal(s) || canDoAnal(s),
		]
	},
	/* ALT GREETING TEMPLATES
	{
		getGreeting: (s) => {
			let r=[];
			r.push(`Hello, my last name is ${s.slaveName} and I am a trusting slave. TESTING EXAMPLE ONLY`);
			return r.join(" ");
		},
		prereqs: [
			(s) => s.trust > 0
		]
	},
	{
		getGreeting: (s) => `Hello, my last name is ${s.slaveSurname} and I am a terrified slave. TESTING EXAMPLE ONLY`,
		prereqs: [
			(s) => s.trust < 0
		]
	}
	*/
];
