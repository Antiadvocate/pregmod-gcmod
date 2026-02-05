/**
 * @param {App.Entity.SlaveState} slave
 * @param {object} params
 * @param {FC.Zeroable<FC.SlaveMarketName>} [params.market]
 * @param {boolean} [params.eventDescription]
 * @returns {string}
 */
App.Desc.bellyInflation = function(slave, {market, eventDescription} = {}) {
	const r = [];
	const {
		he, him, his, He, His
	} = getPronouns(slave);
	if (slave.inflation === 3) {
		r.push(`${His} middle is enormously distended with ${slave.inflationType},`);
		if (slave.physicalAge <= 3) {
			r.push(`and ${his} toddlerish body is absolutely filled by ${his} bloated innards. ${He} can barely move ${him}self and resembles an overinflated blow-up doll.`);
		} else if (slave.physicalAge <= 12) {
			r.push(`and ${his} massive, drum-taut belly dominates ${his} poor little frame.`);
		} else if (slave.height >= 185) {
			r.push(`but ${his} tall frame bears ${his} massive, drum-taut belly well.`);
		} else if (slave.height < 150) {
			r.push(`and ${his} massive, drum-taut belly dominates ${his} poor little frame.`);
		} else if (slave.muscles > 30) {
			r.push(`and ${his} fit body bears ${his} massive, drum-taut belly well.`);
		} else {
			r.push(`and ${his} massive, drum-taut belly dominates ${his} frame.`);
		}
	} else if (slave.inflation === 2) {
		r.push(`${He} is greatly distended with ${slave.inflationType},`);
		if (slave.physicalAge <= 3) {
			r.push(`and ${his} swollen belly is nearly as big as ${his} toddlerish body.`);
		} else if (slave.physicalAge <= 12) {
			r.push(`and ${his} swollen belly dominates ${his} poor little frame.`);
		} else if (slave.height >= 185) {
			r.push(`but ${his} tall frame bears ${his} swollen belly well.`);
		} else if (slave.height < 150) {
			r.push(`and ${his} swollen belly dominates ${his} poor little frame.`);
		} else if (slave.muscles > 30) {
			r.push(`and ${his} fit body bears ${his} swollen belly well.`);
		} else {
			r.push(`and ${his} swollen belly dominates ${his} frame.`);
		}
	} else if (slave.inflation === 1) {
		r.push(`${He} is visibly swollen with ${slave.inflationType},`);
		if (slave.physicalAge <= 3) {
			r.push(`and ${his} sloshing belly looks obscene on ${his} toddlerish body.`);
		} else if (slave.physicalAge <= 10) {
			r.push(`and ${his} sloshing belly looks huge on ${his} tiny frame.`);
		} else if (slave.weight > 10) {
			r.push(`but ${he}'s sufficiently overweight that it's not obvious.`);
		} else if (slave.height < 150) {
			r.push(`and ${his} sloshing belly looks huge on ${his} tiny frame.`);
		} else if (slave.weight <= -10) {
			r.push(`${his} thin form making ${his} sloshing belly very obvious.`);
		} else {
			r.push(`giving ${his} stomach a distinct curvature.`);
		}
	}

	if (V.showClothing === 1 && !market) {
		if (V.surgeryDescription === 0) {
			if (slave.inflation === 3) {
				if (slave.bellyAccessory === "an extreme corset") {
					r.push(`${slave.slaveName}'s hugely swollen belly is tightly compressed by ${his} corset causing it to bulge above and below; one or the other will eventually win out.`);
				} else if ((slave.bellyAccessory === "a corset")) {
					r.push(`${slave.slaveName}'s hugely swollen belly comfortably bulges out of ${his} corset.`);
				}
				switch (slave.clothes) {
					case "conservative clothing":
						if (slave.boobs > 20000) {
							r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater from covering ${his} hugely swollen belly, though they do a fine job of hiding it themselves.`);
						} else if (slave.boobs > 10000) {
							r.push(`${slave.slaveName}'s hugely swollen belly is hidden by ${his} massive tits and oversized sweater.`);
						} else if (slave.boobs > 8000) {
							r.push(`${slave.slaveName}'s oversized breasts keep ${his} sweater far from ${his} hugely swollen belly.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s sweater is pulled taut by ${his} hugely swollen belly, the bottom of which can be seen peeking out from underneath. ${His} popped navel forms a small tent in the material.`);
						} else {
							r.push(`${slave.slaveName}'s blouse is pulled taut by ${his} hugely swollen belly, the bottom of which can be seen peeking out from underneath. ${His} popped navel forms a small tent in ${his} shirt.`);
						}
						break;
					case "attractive lingerie for a pregnant woman":
						r.push(`${slave.slaveName}'s hugely swollen belly completely hides ${his} silken panties. ${His} silken vest sensually frames ${his} heavy belly.`);
						break;
					case "a maternity dress":
						r.push(`${slave.slaveName}'s hugely swollen belly fills out ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to ${his} rounded stomach.`);
						break;
					case "stretch pants and a crop-top":
						r.push(`${slave.slaveName}'s hugely swollen belly takes full advantage of ${his} exposed midriff to bulge freely and obscure ${his} stretch pants.`);
						break;
					case "chains":
						r.push(`${slave.slaveName}'s hugely swollen belly is tightly wrapped with chains, causing it to bulge angrily.`);
						break;
					case "Western clothing":
						r.push(`${slave.slaveName}'s flannel shirt can't close over ${his} hugely swollen belly so ${he} has left the bottom buttons open, leaving ${his} belly hanging out.`);
						break;
					case "body oil":
						r.push(`${slave.slaveName}'s hugely swollen is covered in a sheen of oil.`);
						break;
					case "a toga":
						r.push(`${slave.slaveName}'s hugely swollen belly parts ${his} toga.`);
						break;
					case "a huipil":
						r.push(`${slave.slaveName}'s hugely swollen belly lifts ${his} huipil.`);
						break;
					case "a slutty qipao":
						r.push(`${His} qipao is slit up the side. However, it merely rests atop ${his} hugely swollen belly.`);
						break;
					case "uncomfortable straps":
						r.push(`${slave.slaveName}'s slave outfit's straining straps press into ${his} hugely swollen belly, causing flesh to spill out of the gaps. The straps connect to a steel ring encircling ${his} popped navel.`);
						break;
					case "shibari ropes":
						r.push(`${slave.slaveName}'s hugely swollen belly is tightly bound with ropes; flesh bulges angrily from between them.`);
						break;
					case "a latex catsuit":
					case "restrictive latex":
						r.push(`${slave.slaveName}'s hugely swollen belly greatly distends ${his} latex suit. ${He} looks like an overinflated balloon ready to pop. Only ${his} popped navel sticking out the front of ${his} belly disrupts the smoothness.`);
						break;
					case "a military uniform":
					case "a schutzstaffel uniform":
					case "a slutty schutzstaffel uniform":
					case "a red army uniform uniform":
						if (slave.boobs > 6000) {
							r.push(`${slave.slaveName}'s hugely swollen belly is obscured by ${his} massive tits.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s shirt strains to contain ${his} hugely swollen belly.`);
						} else {
							r.push(`${slave.slaveName}'s hugely swollen belly greatly stretches ${his} uniform's jacket.`);
						}
						break;
					case "a nice nurse outfit":
						if (slave.boobs > 6000) {
							r.push(`${slave.slaveName}'s hugely swollen belly is obscured by ${his} massive tits.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s nurse outfit could be called conservative, if it could cover more than half of ${his} breasts; ${his} hugely swollen belly hangs out from under them, obscuring ${his} trousers.`);
						} else {
							r.push(`${slave.slaveName}'s nurse outfit is almost conservative, though ${his} hugely swollen belly hangs out from under ${his} top, obscuring ${his} trousers.`);
						}
						break;
					case "a mini dress":
						r.push(`${slave.slaveName}'s mini dress barely clings to ${his} hugely swollen belly.`);
						break;
					case "a long qipao":
						r.push(`${slave.slaveName}'s dress barely clings to ${his} hugely swollen belly.`);
						break;
					case "battlearmor":
						r.push(`${slave.slaveName}'s armor barely clings to ${his} hugely swollen belly.`);
						break;
					case "Imperial Plate":
						r.push(`${slave.slaveName}'s armor barely clings to ${his} hugely swollen belly.`);
						break;
					case "a mounty outfit":
						r.push(`${slave.slaveName}'s tunic barely clings to ${his} hugely swollen belly.`);
						break;
					case "a dirndl":
						r.push(`${slave.slaveName}'s dress barely clings to ${his} hugely swollen belly.`);
						break;
					case "lederhosen":
						r.push(`${slave.slaveName}'s tunic barely clings to ${his} hugely swollen belly.`);
						break;
					case "a biyelgee costume":
						r.push(`${slave.slaveName}'s dress barely clings to ${his} hugely swollen belly.`);
						break;
					case "attractive lingerie":
						r.push(`${slave.slaveName}'s hugely swollen belly completely hides ${his} lacy g-string.`);
						break;
					case "kitty lingerie":
						r.push(`${slave.slaveName}'s hugely swollen belly completely hides ${his} silk panties.`);
						break;
					case "a succubus outfit":
						r.push(`${slave.slaveName}'s hugely swollen belly sticks out of ${his} corset, which is laced above and below it as best ${he} can manage.`);
						break;
					case "a slutty maid outfit":
						r.push(`${slave.slaveName}'s maid dress fails to cover ${his} hugely swollen belly, but the outfit includes a thin white blouse that conceals only the upper part of ${his} stomach.`);
						break;
					case "a nice maid outfit":
						r.push(`${slave.slaveName}'s maid dress is almost conservative. It covers ${his} hugely swollen belly completely, though it cannot hide ${his} popped navel, poking through the front.`);
						break;
					case "a fallen nuns habit":
						r.push(`${slave.slaveName}'s latex habit's corset is left hanging open fully revealing ${his} hugely swollen belly.`);
						break;
					case "a penitent nuns habit":
						r.push(`${He} looks absolutely blasphemous in a habit with such a hugely swollen belly. The coarse cloth aggravates ${his} sensitive stretched skin.`);
						break;
					case "a string bikini":
						r.push(`${slave.slaveName}'s hugely swollen belly parts ${his} string bikini to either side.`);
						break;
					case "a scalemail bikini":
						r.push(`${slave.slaveName}'s hugely swollen belly juts out underneath ${his} scalemail bikini.`);
						break;
					case "striped panties":
						r.push(`${slave.slaveName}'s hugely swollen belly juts out above ${his} panties.`);
						break;
					case "clubslut netting":
						r.push(`${slave.slaveName}'s clubslut netting is stretched to the breaking point by ${his} hugely swollen belly.`);
						break;
					case "a cheerleader outfit":
						r.push(`${slave.slaveName}'s cheerleader top rides up ${his} hugely swollen belly, covering only the top of it while leaving the rest on display to bring wonder to how many loads ${he} took last night.`);
						break;
					case "cutoffs and a t-shirt":
						if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s hugely swollen belly is obscured by ${his} huge tits.`);
							break;
						} else if (slave.boobs > 2000) {
							r.push(`${slave.slaveName}'s tits keep ${his} t-shirt far from ${his} hugely swollen belly.`);
							break;
						} else {
							r.push(`${slave.slaveName}'s t-shirt fails to cover ${his} hugely swollen belly at all.`);
							break;
						}
					case "a slutty outfit":
						r.push(`${slave.slaveName}'s hugely swollen belly really shows what a slut ${he} is.`);
						break;
					case "a slave gown":
						r.push(`${slave.slaveName}'s slave gown is carefully tailored, giving ${him} a sensual motherly look as it carefully caresses ${his} hugely swollen belly.`);
						break;
					case "slutty business attire":
						r.push(`${slave.slaveName}'s hugely swollen stomach hangs out the front of ${his} suit jacket and blouse, as there is no way ${he} could close them.`);
						break;
					case "nice business attire":
						r.push(`${slave.slaveName}'s hugely swollen belly strains ${his} specially tailored blouse and jacket.`);
						break;
					case "harem gauze":
						r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} hugely swollen stomach.`);
						break;
					case "a comfortable bodysuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} hugely swollen belly, displaying ${his} popped navel and every jiggle of ${his} bloated stomach.`);
						break;
					case "a slutty nurse outfit":
						r.push(`${slave.slaveName}'s jacket fails to even come close to closing over ${his} hugely swollen belly, leaving ${him} with only the button below ${his} breasts done.`);
						break;
					case "a schoolgirl outfit":
						r.push(`${slave.slaveName}'s blouse rides up ${his} hugely swollen belly, leaving ${him} looking particularly slutty.`);
						break;
					case "a kimono":
						r.push(`${slave.slaveName}'s hugely swollen belly parts the front of ${his} kimono, leaving it gracefully covering its sides.`);
						break;
					case "a hijab and abaya":
					case "a niqab and abaya":
						r.push(`${slave.slaveName}'s abaya is filled by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a klan robe":
						r.push(`${slave.slaveName}'s robe is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a burqa":
						r.push(`${slave.slaveName}'s burqa is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a nice pony outfit":
					case "a slutty pony outfit":
						r.push(`${slave.slaveName}'s pony outfit is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a tube top and thong":
					case "a bra":
					case "a thong":
					case "a tube top":
					case "a striped bra":
					case "striped underwear":
					case "a skimpy loincloth":
					case "a slutty klan robe":
					case "a sports bra":
					case "boyshorts":
					case "cutoffs":
					case "leather pants and pasties":
					case "leather pants":
					case "panties":
					case "panties and pasties":
					case "pasties":
					case "sport shorts and a sports bra":
					case "jeans":
					case "leather pants and a tube top":
					case "sport shorts":
						r.push(`${slave.slaveName}'s outfit completely bares ${his} hugely swollen belly.`);
						break;
					case "a one-piece swimsuit":
						r.push(`${slave.slaveName}'s swimsuit is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a sweater":
					case "a sweater and cutoffs":
					case "a sweater and panties":
						r.push(`${slave.slaveName}'s sweater is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a police uniform":
						r.push(`${slave.slaveName}'s uniform is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a hanbok":
						r.push(`${slave.slaveName}'s hanbok is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a gothic lolita dress":
						r.push(`${slave.slaveName}'s dress is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a tank-top":
					case "a tank-top and panties":
						r.push(`${slave.slaveName}'s tank-top is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a button-up shirt and panties":
					case "a button-up shirt":
					case "a t-shirt":
					case "a t-shirt and thong":
					case "an oversized t-shirt and boyshorts":
					case "an oversized t-shirt":
					case "sport shorts and a t-shirt":
					case "a t-shirt and jeans":
					case "a t-shirt and panties":
						r.push(`${slave.slaveName}'s shirt is noticeably rounded out by ${his} hugely swollen belly.`);
						break;
					case "a Santa dress":
						r.push(`${slave.slaveName}'s belt is struggling to fully encircle ${his} hugely ${slave.inflationType}-swollen belly.`);
						break;
					case "a burkini":
						r.push(`The fabric of ${slave.slaveName}'s burkini is slightly pushed up thanks to ${his} hugely ${slave.inflationType}-swollen belly.`);
						break;
					case "a hijab and blouse":
						r.push(`${slave.slaveName} has trouble pulling ${his} skirt up to fit around ${his} hugely swollen belly.`);
						break;
					case "battledress":
						r.push(`${slave.slaveName}'s tank top barely even covers the top of ${his} hugely swollen belly, leaving ${him} looking like someone who had too much fun on shore leave.`);
						break;
					case "a halter top dress":
						r.push(`${slave.slaveName}'s beautiful halter top dress is filled by ${his} hugely swollen belly. ${His} popped navel prominently pokes through its front.`);
						break;
					case "a ball gown":
						r.push(`${slave.slaveName}'s fabulous silken ball gown is tailored to not only fit ${his} hugely swollen belly, but draw attention to it.`);
						break;
					case "slutty jewelry":
						r.push(`${slave.slaveName}'s bangles include a long thin chain that rests above ${his} popped navel.`);
						break;
					case "a leotard":
						r.push(`${slave.slaveName}'s tight leotard shows off every slosh and jiggle within ${his} hugely swollen belly. The material tightly clings to ${his} popped navel.`);
						break;
					case "a monokini":
						r.push(`${slave.slaveName}'s monokini covers far less than half of ${his} hugely swollen belly.`);
						break;
					case "overalls":
						if (slave.boobs > (slave.belly + 250)) {
							r.push(`${slave.slaveName}'s massive breasts push out ${his} overalls so far that ${his} hugely swollen belly is left almost entirely uncovered.`);
						} else {
							r.push(`${slave.slaveName}'s hugely swollen belly stretches out the fabric of ${his} overalls.`);
						}
						break;
					case "an apron":
						r.push(`${slave.slaveName}'s apron is pushed away from ${his} body by ${his} hugely ${slave.inflationType}-swollen belly.`);
						break;
					case "a cybersuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} hugely swollen belly, displaying ${his} popped navel and every jiggle of ${his} bloated stomach.`);
						break;
					case "a tight Imperial bodysuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} hugely swollen belly, displaying ${his} popped navel and every jiggle of ${his} bloated stomach.`);
						break;
					case "a chattel habit":
						r.push(`The strip of cloth running down ${his} front is parted to one side by ${his} hugely swollen belly.`);
						break;
					case "a bunny outfit":
						r.push(`${slave.slaveName}'s teddy is stretched to tearing by ${his} hugely swollen belly. ${His} popped navel prominently pokes through the material.`);
						break;
					case "spats and a tank top":
						if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s hugely swollen belly is obscured by ${his} huge tits.`);
						} else if (slave.boobs > 1200) {
							r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} hugely swollen belly by ${his} breasts.`);
						} else {
							r.push(`${slave.slaveName}'s top cannot even attempt to cover ${his} hugely swollen belly.`);
						}
						break;
					case "a bimbo outfit":
						r.push(`${slave.slaveName}'s hugely swollen belly forces ${his} miniskirt out of the way as it hangs ponderously from ${his} midriff.`);
						break;
					case "a courtesan dress":
						r.push(`${slave.slaveName}'s hugely swollen belly strains under the ribs of ${his} corset`);
						break;
					default:
				}
			} else if (slave.inflation === 2) {
				if (slave.bellyAccessory === "an extreme corset") {
					r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is tightly compressed by ${his} corset causing it to bulge out above and below; one or the other will eventually win out.`);
				} else if ((slave.bellyAccessory === "a corset")) {
					r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly comfortably hangs out of ${his} corset.`);
				}
				switch (slave.clothes) {
					case "conservative clothing":
						if (slave.boobs > 20000) {
							r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater from covering ${his} jiggling ${slave.inflationType}-filled belly, though they do a fine job of hiding it themselves.`);
						} else if (slave.boobs > 10000) {
							r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is hidden by ${his} massive tits and oversized sweater.`);
						} else if (slave.boobs > 8000) {
							r.push(`${slave.slaveName}'s oversized breasts keep ${his} sweater far from ${his} jiggling ${slave.inflationType}-filled belly.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s sweater is pulled taut by ${his} jiggling ${slave.inflationType}-filled belly. ${His} popped navel forms a small tent in material.`);
						} else {
							r.push(`${slave.slaveName}'s blouse is pulled taut by ${his} jiggling ${slave.inflationType}-filled belly. ${His} popped navel forms a small tent in ${his} shirt.`);
						}
						break;
					case "attractive lingerie for a pregnant woman":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly hides ${his} silken panties. ${His} silken vest sensually frames ${his} heavy belly.`);
						break;
					case "a maternity dress":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly fills out ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to ${his} swollen middle.`);
						break;
					case "stretch pants and a crop-top":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly takes full advantage of ${his} exposed midriff to bulge freely and slightly obscure ${his} stretch pants.`);
						break;
					case "chains":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is tightly wrapped with chains, causing it to bulge angrily.`);
						break;
					case "Western clothing":
						r.push(`${slave.slaveName}'s flannel shirt can't close over ${his} jiggling ${slave.inflationType}-filled belly, so ${he} has left the bottom buttons open leaving ${his} belly hanging out.`);
						break;
					case "body oil":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is covered in a sheen of oil.`);
						break;
					case "a toga":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly parts ${his} toga.`);
						break;
					case "a huipil":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly lifts ${his} huipil.`);
						break;
					case "a slutty qipao":
						r.push(`${His} qipao is slit up the side. However, it only covers the top of ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "uncomfortable straps":
						r.push(`${slave.slaveName}'s slave outfit's straining straps press into ${his} jiggling ${slave.inflationType}-filled belly, causing flesh to spill out of the gaps. The straps connect to a steel ring encircling ${his} popped navel.`);
						break;
					case "shibari ropes":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is tightly bound with rope; flesh bulges angrily from between them.`);
						break;
					case "a latex catsuit":
					case "restrictive latex":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly greatly distends ${his} latex suit. ${He} looks like an overinflated balloon. Only ${his} popped navel sticking out the front of ${his} belly disrupts the smoothness.`);
						break;
					case "a military uniform":
					case "a schutzstaffel uniform":
					case "a slutty schutzstaffel uniform":
					case "a red army uniform":
						if (slave.boobs > 6000) {
							r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is obscured by ${his} massive tits.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s shirt strains to contain ${his} jiggling ${slave.inflationType}-filled belly.`);
						} else {
							r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly notably distends ${his} uniform's jacket.`);
						}
						break;
					case "a nice nurse outfit":
						if (slave.boobs > 6000) {
							r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is obscured by ${his} massive tits.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s nurse outfit could be called conservative, if it could cover more than half of ${his} breasts; ${his} jiggling ${slave.inflationType}-filled belly hangs out from under them, obscuring ${his} trousers.`);
						} else {
							r.push(`${slave.slaveName}'s nurse outfit is almost conservative, though ${his} jiggling ${slave.inflationType}-filled hangs out from under ${his} top, slightly obscuring ${his} trousers.`);
						}
						break;
					case "a mini dress":
						r.push(`${slave.slaveName}'s mini dress tightly clings to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a long qipao":
						r.push(`${slave.slaveName}'s dress tightly clings to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "battlearmor":
						r.push(`${slave.slaveName}'s armor tightly clings to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "Imperial Plate":
						r.push(`${slave.slaveName}'s armor tightly clings to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a mounty outfit":
						r.push(`${slave.slaveName}'s tunic tightly clings to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a dirndl":
						r.push(`${slave.slaveName}'s dress tightly clings to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "lederhosen":
						r.push(`${slave.slaveName}'s tunic tightly clings to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a biyelgee costume":
						r.push(`${slave.slaveName}'s dress tightly clings to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "attractive lingerie":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly hides ${his} lacy g-string.`);
						break;
					case "kitty lingerie":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly hides ${his} silk panties.`);
						break;
					case "a succubus outfit":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly sticks out of ${his} corset, which is laced above and below it.`);
						break;
					case "a slutty maid outfit":
						r.push(`${slave.slaveName}'s maid dress fails to cover ${his} jiggling ${slave.inflationType}-filled belly, but the outfit includes a thin white blouse that conceals only the top half of ${his} stomach.`);
						break;
					case "a nice maid outfit":
						r.push(`${slave.slaveName}'s maid dress is almost conservative, it covers ${his} jiggling ${slave.inflationType}-filled belly completely. Though it cannot hide ${his} popped navel poking through the front.`);
						break;
					case "a fallen nuns habit":
						r.push(`${slave.slaveName}'s latex habit's corset is left hanging open fully revealing ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a penitent nuns habit":
						r.push(`${He} looks absolutely blasphemous in a habit with a jiggling ${slave.inflationType}-filled belly. The coarse cloth aggravates ${his} sensitive stretched skin.`);
						break;
					case "a string bikini":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly parts ${his} string bikini to either side.`);
						break;
					case "a scalemail bikini":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly hangs underneath ${his} scalemail bikini.`);
						break;
					case "striped panties":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly hangs above ${his} cute panties.`);
						break;
					case "clubslut netting":
						r.push(`${slave.slaveName}'s clubslut netting is stretched out by ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a cheerleader outfit":
						r.push(`${slave.slaveName}'s cheerleader top covers most of ${his} jiggling ${slave.inflationType}-filled belly, the bottom of which peeks out showing how slutty this cheerleader is.`);
						break;
					case "cutoffs and a t-shirt":
						if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is obscured by ${his} huge tits.`);
						} else if (slave.boobs > 2000) {
							r.push(`${slave.slaveName}'s tits keep ${his} t-shirt far from ${his} jiggling ${slave.inflationType}-filled belly.`);
						} else {
							r.push(`${slave.slaveName}'s t-shirt covers only the top of ${his} jiggling ${slave.inflationType}-filled belly.`);
						}
						break;
					case "a slutty outfit":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly really shows how big of a slut ${he} is.`);
						break;
					case "a slave gown":
						r.push(`${slave.slaveName}'s slave gown is carefully tailored, giving ${him} a sensual motherly look as it carefully caresses ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "slutty business attire":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled stomach strains the buttons of ${his} suit jacket and blouse.`);
						break;
					case "nice business attire":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly looks good in ${his} specially tailored blouse and jacket.`);
						break;
					case "harem gauze":
						r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} jiggling ${slave.inflationType}-filled.`);
						break;
					case "a comfortable bodysuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} jiggling ${slave.inflationType}-filled belly, displaying ${his} popped navel and every motion ${his} contents make.`);
						break;
					case "a slutty nurse outfit":
						r.push(`${slave.slaveName}'s jacket barely closes over ${his} jiggling ${slave.inflationType}-filled belly leaving its buttons threatening to pop.`);
						break;
					case "a schoolgirl outfit":
						r.push(`${slave.slaveName}'s blouse rides up ${his} jiggling ${slave.inflationType}-filled belly, leaving ${him} looking particularly slutty.`);
						break;
					case "a kimono":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is demurely covered by ${his} kimono.`);
						break;
					case "a hijab and abaya":
					case "a niqab and abaya":
						r.push(`${slave.slaveName}'s abaya is filled out by ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a klan robe":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s robe, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a burqa":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s burqa, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a nice pony outfit":
					case "a slutty pony outfit":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s pony outfit, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a tube top and thong":
					case "a bra":
					case "a thong":
					case "a tube top":
					case "a striped bra":
					case "striped underwear":
					case "a skimpy loincloth":
					case "a slutty klan robe":
					case "a sports bra":
					case "boyshorts":
					case "cutoffs":
					case "leather pants and pasties":
					case "leather pants":
					case "panties":
					case "panties and pasties":
					case "pasties":
					case "sport shorts and a sports bra":
					case "jeans":
					case "leather pants and a tube top":
					case "sport shorts":
						r.push(`${slave.slaveName}'s outfit completely bares ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a one-piece swimsuit":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s swimsuit, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a sweater":
					case "a sweater and cutoffs":
					case "a sweater and panties":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s sweater, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a police uniform":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s uniform, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a hanbok":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s hanbok, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a gothic lolita dress":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s dress, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a tank-top":
					case "a tank-top and panties":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s tank-top, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a button-up shirt and panties":
					case "a button-up shirt":
					case "a t-shirt":
					case "a t-shirt and thong":
					case "an oversized t-shirt and boyshorts":
					case "an oversized t-shirt":
					case "sport shorts and a t-shirt":
					case "a t-shirt and jeans":
					case "a t-shirt and panties":
						r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s shirt, thanks to ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a Santa dress":
						r.push(`The belt on ${slave.slaveName}'s dress has been loosened to accommodate the significant bulge of ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a burkini":
						r.push(`${slave.slaveName}'s burkini bulges significantly from ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a hijab and blouse":
						r.push(`${slave.slaveName}'s skirt is slightly pushed down by ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "battledress":
						r.push(`${slave.slaveName}'s tank top rides up ${his} jiggling ${slave.inflationType}-filled belly leaving ${him} looking like someone who had too much fun on shore leave.`);
						break;
					case "a halter top dress":
						r.push(`${slave.slaveName}'s beautiful halter top dress is filled by ${his} jiggling ${slave.inflationType}-filled belly. ${His} popped navel prominently pokes through the front of ${his} dress.`);
						break;
					case "a ball gown":
						r.push(`${slave.slaveName}'s fabulous silken ball gown is tailored to not only fit ${his} jiggling ${slave.inflationType}-filled belly but draw attention to it.`);
						break;
					case "slutty jewelry":
						r.push(`${slave.slaveName}'s bangles include a long thin chain that rests above ${his} popped navel.`);
						break;
					case "a leotard":
						r.push(`${slave.slaveName}'s tight leotard shows off every movement within ${his} jiggling ${slave.inflationType}-filled belly. The material tightly clings to ${his} popped navel.`);
						break;
					case "a monokini":
						r.push(`${slave.slaveName}'s monokini covers only half of ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "overalls":
						if (slave.boobs > (slave.belly + 250)) {
							r.push(`${slave.slaveName}'s huge breasts push out ${his} overalls so far that ${his} jiggling ${slave.inflationType}-filled belly is left uncovered.`);
						} else {
							r.push(`${slave.slaveName}'s overalls are significantly curved by ${his} jiggling ${slave.inflationType}-filled belly.`);
						}
						break;
					case "an apron":
						r.push(`${slave.slaveName}'s apron is filled out by ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a cybersuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} jiggling ${slave.inflationType}-filled belly, displaying ${his} popped navel and every motion ${his} contents make.`);
						break;
					case "a tight Imperial bodysuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} jiggling ${slave.inflationType}-filled belly, displaying ${his} popped navel and every motion ${his} contents make.`);
						break;
					case "a chattel habit":
						r.push(`The strip of cloth running down ${his} front is parted to one side by ${his} jiggling ${slave.inflationType}-filled belly.`);
						break;
					case "a bunny outfit":
						r.push(`${slave.slaveName}'s teddy is stretched out by ${his} jiggling ${slave.inflationType}-filled belly. ${His} popped navel prominently pokes through the material.`);
						break;
					case "spats and a tank top":
						if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is obscured by ${his} huge tits.`);
						} else if (slave.boobs > 1200) {
							r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} jiggling ${slave.inflationType}-filled belly by ${his} breasts.`);
						} else {
							r.push(`${slave.slaveName}'s top only slightly covers ${his} jiggling ${slave.inflationType}-filled belly.`);
						}
						break;
					case "a bimbo outfit":
						r.push(`${slave.slaveName}'s miniskirt digs into ${his} jiggling ${slave.inflationType}-filled belly as the top half spills over its edge.`);
						break;
					case "a courtesan dress":
						r.push(`${slave.slaveName}'s jiggling ${slave.inflationType}-filled belly is tightly gripped by the ribs of ${his} corset, forcing it to bulge angrily between the gaps.`);
						break;
					default:
				}
			} else if (slave.weight > 95) {
				if (slave.bellyAccessory === "an extreme corset") {
					r.push(`${slave.slaveName}'s huge gut is tightly compressed by ${his} corset, ${his} fat billows out of any gap it can find.`);
				} else if ((slave.bellyAccessory === "a corset")) {
					r.push(`${slave.slaveName}'s huge gut hangs out the hole in ${his} corset designed to accommodate a pregnant belly.`);
				} else if ((slave.bellyAccessory === "a small empathy belly")) {
					r.push(`${slave.slaveName}'s small empathy belly is barely noticeable over ${his} huge gut.`);
				}
				switch (slave.clothes) {
					case "conservative clothing":
						if (slave.boobs > 20000) {
							r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater from covering ${his} fat belly, though they do a fine job of hiding it themselves.`);
						} else if (slave.boobs > 10000) {
							r.push(`${slave.slaveName}'s fat belly is hidden by ${his} massive tits and oversized sweater.`);
						} else if (slave.boobs > 8000) {
							r.push(`${slave.slaveName}'s oversized breasts ${his} fat belly hang free.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s sweater is pulled tight over ${his} fat belly. The bottom of which peeks out from under it.`);
						} else {
							r.push(`${slave.slaveName}'s blouse is pulled tight over ${his} fat belly. The bottom of which peeks out from under it.`);
						}
						break;
					case "attractive lingerie for a pregnant woman":
						r.push(`${slave.slaveName}'s fat belly is large enough to hide ${his} panties. ${His} silken vest sensually frames ${his} heavy, jiggly gut.`);
						break;
					case "a maternity dress":
						r.push(`${slave.slaveName}'s fat belly fills out ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to a growing pregnancy, though it works on big, jiggly guts all the same.`);
						break;
					case "stretch pants and a crop-top":
						r.push(`${slave.slaveName}'s fat belly takes full advantage of ${his} exposed midriff to hang freely and obscure ${his} stretch pants.`);
						break;
					case "chains":
						r.push(`${slave.slaveName}'s chains sink deep into ${his} fat belly, several even disappearing beneath ${his} folds.`);
						break;
					case "Western clothing":
						r.push(`${slave.slaveName}'s flannel shirt strains to stay shut over ${his} fat belly, fat bulges between ${his} buttons and quite a bit of ${his} lower belly hangs out beneath ${his} shirt.`);
						break;
					case "body oil":
						r.push(`${slave.slaveName}'s fat belly is covered in a sheen of oil.`);
						break;
					case "a toga":
						r.push(`${slave.slaveName}'s toga can barely be pulled shut over ${his} fat belly.`);
						break;
					case "a long qipao":
						r.push(`${slave.slaveName}'s dress can barely be pulled shut over ${his} fat belly.`);
						break;
					case "a mounty outfit":
						r.push(`${slave.slaveName}'s tunic is pulled tight over ${his} fat belly. The bottom of which peeks out from under it.`);
						break;
					case "battlearmor":
						r.push(`${slave.slaveName}'s armor can barely contain ${his} fat belly.`);
						break;
					case "Imperial Plate":
						r.push(`${slave.slaveName}'s armor can barely contain ${his} fat belly.`);
						break;
					case "lederhosen":
						r.push(`${slave.slaveName}'s tunic can barely be pulled shut over ${his} fat belly.`);
						break;
					case "a biyelgee costume":
						r.push(`${slave.slaveName}'s fat belly fills out ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to a growing pregnancy, though it works on big, jiggly guts all the same.`);
						break;
					case "a dirndl":
						r.push(`${slave.slaveName}'s fat belly fills out ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to a growing pregnancy, though it works on big, jiggly guts all the same.`);
						break;
					case "a huipil":
						r.push(`${slave.slaveName}'s huipil gets lifted by ${his} fat belly, so it's useless for covering ${his} body.`);
						break;
					case "a slutty qipao":
						r.push(`${His} qipao is slit up the side. However, it only covers the top of ${his} fat belly, allowing it to hang free.`);
						break;
					case "uncomfortable straps":
						r.push(`${slave.slaveName}'s slave outfit's straps sink deep into ${his} fat belly, several even disappearing beneath ${his} folds. The straps connect to a steel ring that parts the fold concealing ${his} navel, allowing it to be seen once again.`);
						break;
					case "shibari ropes":
						r.push(`${slave.slaveName}'s binding ropes sink deep into ${his} fat belly, several even disappearing beneath ${his} folds.`);
						break;
					case "a latex catsuit":
					case "restrictive latex":
						r.push(`${slave.slaveName}'s fat belly is compressed by ${his} latex suit, leaving it looking round and smooth.`);
						break;
					case "a military uniform":
					case "a schutzstaffel uniform":
					case "a slutty schutzstaffel uniform":
					case "a red army uniform":
						if (slave.boobs > 6000) {
							r.push(`${slave.slaveName}'s fat belly is obscured by ${his} massive tits.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s shirt struggles to cover ${his} fat belly. The bottom of which peeks out from under it.`);
						} else {
							r.push(`${slave.slaveName}'s fat belly is covered by ${his} uniform's jacket. The bottom of which just barely peeks out from under it.`);
						}
						break;
					case "a nice nurse outfit":
						if (slave.boobs > 6000) {
							r.push(`${slave.slaveName}'s fat belly is obscured by ${his} massive tits.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s nurse outfit could be called conservative, if it could cover more than half of ${his} breasts; ${his} fat belly freely hangs out from under them, obscuring ${his} trousers.`);
						} else {
							r.push(`${slave.slaveName}'s nurse outfit is almost conservative, though ${his} fat belly freely hangs from under ${his} top, obscuring ${his} trousers.`);
						}
						break;
					case "a mini dress":
						r.push(`${slave.slaveName}'s mini dress tightly clings to ${his} fat belly, clearly showing every fold and roll.`);
						break;
					case "attractive lingerie":
						r.push(`${slave.slaveName}'s fat belly hides ${his} lacy g-string.`);
						break;
					case "kitty lingerie":
						r.push(`${slave.slaveName}'s fat belly hides ${his} silk panties.`);
						break;
					case "a succubus outfit":
						r.push(`${slave.slaveName}'s fat belly sticks out of ${his} corset, which is laced above and below it allowing it to hang free.`);
						break;
					case "a slutty maid outfit":
						r.push(`${slave.slaveName}'s maid dress fails to cover ${his} fat belly, but the outfit includes a thin white blouse that, when stretched, only manages to wrangle the top of ${his} gut.`);
						break;
					case "a nice maid outfit":
						r.push(`${slave.slaveName}'s maid dress is almost conservative, it covers ${his} fat belly completely, but does nothing to hide how big it is.`);
						break;
					case "a fallen nuns habit":
						r.push(`${slave.slaveName}'s latex habit's corset is barely holding together over ${his} fat belly, causing flab to spill out from every opening.`);
						break;
					case "a penitent nuns habit":
						r.push(`${His} fat belly fills out ${his} habit. The coarse cloth has plenty of extra skin to aggravate.`);
						break;
					case "a string bikini":
						r.push(`${slave.slaveName}'s fat belly parts ${his} string bikini to either side.`);
						break;
					case "a scalemail bikini":
						r.push(`${slave.slaveName}'s fat belly juts out underneath ${his} scalemail bikini.`);
						break;
					case "striped panties":
						r.push(`${slave.slaveName}'s fat belly juts out above ${his} cute panties.`);
						break;
					case "clubslut netting":
						r.push(`${slave.slaveName}'s clubslut netting is stretched out by ${his} fat belly, forcing flab to poke through the mesh.`);
						break;
					case "a cheerleader outfit":
						r.push(`${slave.slaveName}'s cheerleader top covers most of ${his} fat belly. However, the bottom of it peeks out, obscuring ${his} skirt and a letting everyone know how badly this cheerleader needs to diet.`);
						break;
					case "cutoffs and a t-shirt":
						if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s fat belly is obscured by ${his} huge tits.`);
						} else if (slave.boobs > 2000) {
							r.push(`${slave.slaveName}'s tits keep ${his} t-shirt busy, allowing ${his} fat belly to hang free.`);
						} else {
							r.push(`${slave.slaveName}'s t-shirt covers only the top of ${his} fat belly, allowing it to hang mostly free and cover ${his} jeans.`);
						}
						break;
					case "a slutty outfit":
						r.push(`${slave.slaveName} lets ${his} fat belly hang free, leaving ${him} looking particularly slutty.`);
						break;
					case "a slave gown":
						r.push(`${slave.slaveName}'s slave gown is carefully tailored, accentuating and hugging every curve of ${his} fat belly.`);
						break;
					case "slutty business attire":
						r.push(`${slave.slaveName}'s fat belly strains the buttons of ${his} suit jacket and blouse. The bottom of which just barely peeks out from under them.`);
						break;
					case "nice business attire":
						r.push(`${slave.slaveName}'s tailored blouse and jacket fit ${his} fat belly well, though they do nothing to hide how big ${his} gut is.`);
						break;
					case "harem gauze":
						r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} fat belly.`);
						break;
					case "a comfortable bodysuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} fat belly, displaying every fold and roll in it.`);
						break;
					case "a slutty nurse outfit":
						r.push(`${slave.slaveName}'s jacket barely closes over ${his} fat belly forcing plenty of flab out from under its bottom and between the straining buttons.`);
						break;
					case "a schoolgirl outfit":
						r.push(`${slave.slaveName}'s blouse rides up ${his} fat belly, leaving it hanging loose and covering ${his} skirt.`);
						break;
					case "a kimono":
						r.push(`${slave.slaveName}'s fat belly is demurely covered by ${his} kimono.`);
						break;
					case "a hijab and abaya":
					case "a niqab and abaya":
						r.push(`${slave.slaveName}'s abaya is filled out by ${his} fat belly.`);
						break;
					case "a klan robe":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} robe.`);
						break;
					case "a burqa":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} burqa.`);
						break;
					case "a nice pony outfit":
					case "a slutty pony outfit":
						r.push(`${slave.slaveName}'s fat belly molds itself against ${his} pony outfit.`);
						break;
					case "a tube top and thong":
					case "a bra":
					case "a thong":
					case "a tube top":
					case "a striped bra":
					case "striped underwear":
					case "a skimpy loincloth":
					case "a slutty klan robe":
					case "a sports bra":
					case "boyshorts":
					case "cutoffs":
					case "leather pants and pasties":
					case "leather pants":
					case "panties":
					case "panties and pasties":
					case "pasties":
					case "sport shorts and a sports bra":
					case "jeans":
					case "leather pants and a tube top":
					case "sport shorts":
						r.push(`${slave.slaveName}'s outfit completely bares ${his} fat belly.`);
						break;
					case "a one-piece swimsuit":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} swimsuit.`);
						break;
					case "a sweater":
					case "a sweater and cutoffs":
					case "a sweater and panties":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} sweater.`);
						break;
					case "a police uniform":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} uniform.`);
						break;
					case "a hanbok":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} hanbok.`);
						break;
					case "a gothic lolita dress":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} dress.`);
						break;
					case "a tank-top":
					case "a tank-top and panties":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} tank-top.`);
						break;
					case "a button-up shirt and panties":
					case "a button-up shirt":
					case "a t-shirt":
					case "a t-shirt and thong":
					case "an oversized t-shirt and boyshorts":
					case "an oversized t-shirt":
					case "sport shorts and a t-shirt":
					case "a t-shirt and jeans":
					case "a t-shirt and panties":
						r.push(`${slave.slaveName}'s fat belly just manages to brush up against ${his} shirt.`);
						break;
					case "a Santa dress":
						r.push(`${slave.slaveName}'s fat belly bulges around the belt around ${his} waist.`);
						break;
					case "a burkini":
						r.push(`${slave.slaveName}'s burkini bulges from ${his} fat belly.`);
						break;
					case "a hijab and blouse":
						r.push(`${slave.slaveName}'s blouse and skirt are filled out by ${his} fat belly.`);
						break;
					case "battledress":
						r.push(`${slave.slaveName}'s tank top rests atop ${his} fat belly, leaving everyone wondering how this recruit passed basic.`);
						break;
					case "a halter top dress":
						r.push(`${slave.slaveName}'s beautiful halter top dress is filled by ${his} fat belly. Every crease, fold and roll is clearly visible within it.`);
						break;
					case "a ball gown":
						r.push(`${slave.slaveName}'s fabulous silken ball gown is tailored to not only fit ${his} fat belly but draw attention to it.`);
						break;
					case "slutty jewelry":
						r.push(`${slave.slaveName}'s bangles include long, thin chains running along ${his} fat folds.`);
						break;
					case "a leotard":
						r.push(`${slave.slaveName}'s tight leotard tightly clings to ${his} fat belly, clearly displaying every fold and roll.`);
						break;
					case "a monokini":
						r.push(`${slave.slaveName}'s monokini tightly clings to ${his} fat belly, clearly displaying every fold and roll.`);
						break;
					case "overalls":
						if (slave.boobs > (slave.belly + 250)) {
							r.push(`${slave.slaveName}'s large breasts push out ${his} overalls so far that ${his} fat belly is left uncovered.`);
						} else {
							r.push(`${slave.slaveName}'s fat belly bulges out from over the sides of ${his} overalls.`);
						}
						break;
					case "an apron":
						r.push(`${slave.slaveName}'s mini dress tightly clings to ${his} fat belly, clearly showing every fold and roll.`);
						break;
					case "a cybersuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} fat belly, displaying every fold and roll in it.`);
						break;
					case "a tight Imperial bodysuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} fat belly, displaying every fold and roll in it.`);
						break;
					case "a chattel habit":
						r.push(`The strip of cloth running down ${his} front is gently sinks into ${his} fat belly.`);
						break;
					case "a bunny outfit":
						r.push(`${slave.slaveName}'s teddy is stretched out by ${his} fat belly. ${His} flab juts out around its edges and it does nothing to hide ${his} folds and rolls.`);
						break;
					case "spats and a tank top":
						if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s fat belly is obscured by ${his} huge tits.`);
						} else if (slave.boobs > 1200) {
							r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} fat belly by ${his} breasts.`);
						} else {
							r.push(`${slave.slaveName}'s top can't entirely cover ${his} fat belly, allowing it to hang loose and slightly obscure ${his} spats from view.`);
						}
						break;
					case "a bimbo outfit":
						r.push(`${slave.slaveName}'s thong strings dig into ${his} fat belly as it lewdly drapes over ${his} miniskirt.`);
						break;
					case "a courtesan dress":
						r.push(`${slave.slaveName}'s fat belly bulges the ribs of ${his} corset, creating valleys of soft flesh.`);
						break;
					default:
				}
				if (V.arcologies[0].FSSlimnessEnthusiast !== "unset") {
					r.push(`Your sleek, slim society finds ${his} bloated body unsightly.`);
				}
			} else if (slave.inflation === 1) {
				if (slave.bellyAccessory === "an extreme corset") {
					r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is tightly compressed by ${his} corset causing ${his} distress.`);
				} else if ((slave.bellyAccessory === "a corset")) {
					r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is lightly compressed by ${his} corset making ${him} uncomfortable.`);
				}
				switch (slave.clothes) {
					case "conservative clothing":
						if (slave.boobs > 20000) {
							r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater from covering ${his} ${slave.inflationType}-swollen belly, though they do a fine job of hiding it themselves.`);
						} else if (slave.boobs > 10000) {
							r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is hidden by ${his} massive tits and oversized sweater.`);
						} else if (slave.boobs > 8000) {
							r.push(`${slave.slaveName}'s oversized breasts keep ${his} sweater far from ${his} ${slave.inflationType}-swollen belly.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s sweater bulges with ${his} ${slave.inflationType}-swollen belly.`);
						} else {
							r.push(`${slave.slaveName}'s blouse bulges with ${his} ${slave.inflationType}-swollen belly.`);
						}
						break;
					case "attractive lingerie for a pregnant woman":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly rests above ${his} silken panties. ${His} silken vest sensually frames ${his} swelling belly.`);
						break;
					case "a maternity dress":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is noticeable under ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to ${his} distended stomach.`);
						break;
					case "stretch pants and a crop-top":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly takes full advantage of ${his} exposed midriff to bulge freely.`);
						break;
					case "chains":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is tightly wrapped with chains.`);
						break;
					case "Western clothing":
						r.push(`${slave.slaveName}'s flannel shirt bulges with ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "body oil":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is covered in a sheen of oil.`);
						break;
					case "a toga":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly gently bulges under ${his} toga.`);
						break;
					case "a huipil":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly slightly bulges under ${his} huipil.`);
						break;
					case "a slutty qipao":
						r.push(`${His} qipao is slit up the side. The front is pushed out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "uncomfortable straps":
						r.push(`${slave.slaveName}'s slave outfit's straining straps press into ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "shibari ropes":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is tightly bound with rope, flesh bulges from between them.`);
						break;
					case "a latex catsuit":
					case "restrictive latex":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly greatly bulges under ${his} latex suit.`);
						break;
					case "a military uniform":
						if (slave.boobs > 6000) {
							r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is obscured by ${his} massive tits.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s undershirt covers ${his} ${slave.inflationType}-swollen belly.`);
						} else {
							r.push(`${slave.slaveName}'s uniform covers ${his} ${slave.inflationType}-swollen belly.`);
						}
						break;
					case "a schutzstaffel uniform":
					case "a slutty schutzstaffel uniform":
					case "a red army uniform":
					case "a long qipao":
						r.push(`${slave.slaveName}'s dress tightly clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a mounty outfit":
						r.push(`${slave.slaveName}'s tunic tightly clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "battlearmor":
						r.push(`${slave.slaveName}'s armor tightly clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "Imperial Plate":
						r.push(`${slave.slaveName}'s armor tightly clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "lederhosen":
						r.push(`${slave.slaveName}'s tunic tightly clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a dirndl":
						r.push(`${slave.slaveName}'s dress tightly clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a biyelgee costume":
						r.push(`${slave.slaveName}'s costume tightly clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a nice nurse outfit":
						if (slave.boobs > 6000) {
							r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is obscured by ${his} massive tits.`);
						} else if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s nurse outfit could be called conservative, if it could cover more than half of ${his} breasts; ${his} ${slave.inflationType}-swollen belly is completely exposed.`);
						} else {
							r.push(`${slave.slaveName}'s nurse outfit is almost conservative, it covers ${his} ${slave.inflationType}-swollen belly completely.`);
						}
						break;
					case "a mini dress":
						r.push(`${slave.slaveName}'s mini dress tightly clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "attractive lingerie":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly rests above ${his} lacy g-string.`);
						break;
					case "kitty lingerie":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly rests above ${his} silk panties.`);
						break;
					case "a succubus outfit":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly peeks out of ${his} corset, which is laced above and below it.`);
						break;
					case "a slutty maid outfit":
						r.push(`${slave.slaveName}'s maid dress is slightly distended by ${his} growing belly.`);
						break;
					case "a nice maid outfit":
						r.push(`${slave.slaveName}'s maid dress is almost conservative, it covers ${his} ${slave.inflationType}-swollen belly completely.`);
						break;
					case "a fallen nuns habit":
						r.push(`${slave.slaveName}'s latex habit's corset struggles to hold ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a penitent nuns habit":
						r.push(`${slave.slaveName}'s habit gently bulges from ${his} ${slave.inflationType}-swollen belly. The coarse cloth aggravates ${his} sensitive skin.`);
						break;
					case "a string bikini":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly juts out between the strings of ${his} bikini.`);
						break;
					case "a scalemail bikini":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly juts out underneath ${his} bikini.`);
						break;
					case "striped panties":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly juts out above ${his} panties.`);
						break;
					case "clubslut netting":
						r.push(`${slave.slaveName}'s clubslut netting clings to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a cheerleader outfit":
						r.push(`${slave.slaveName}'s cheerleader top gently bulges from ${his} ${slave.inflationType}-swollen belly displaying how slutty this cheerleader is.`);
						break;
					case "cutoffs and a t-shirt":
						if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is obscured by ${his} huge tits.`);
						} else if (slave.boobs > 2000) {
							r.push(`${slave.slaveName}'s tits keep ${his} t-shirt far from ${his} ${slave.inflationType}-swollen belly.`);
						} else {
							r.push(`${slave.slaveName}'s t-shirt bulges with ${his} ${slave.inflationType}-swollen belly. The bottom of which is beginning to peek from under ${his} T-shirt.`);
						}
						break;
					case "a slutty outfit":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly shows how big of a slut ${he} is.`);
						break;
					case "a slave gown":
						r.push(`${slave.slaveName}'s slave gown is carefully tailored, giving ${him} a sensual look as it carefully caresses ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "slutty business attire":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly bulges ${his} suit jacket and blouse. It peeks out from under their bottom slightly.`);
						break;
					case "nice business attire":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly bulges under ${his} tailored blouse and jacket.`);
						break;
					case "harem gauze":
						r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a comfortable bodysuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} ${slave.inflationType}-swollen belly, displaying ${his} bloated body.`);
						break;
					case "a slutty nurse outfit":
						r.push(`${slave.slaveName}'s jacket bulges with ${his} ${slave.inflationType}-swollen belly, which can be seen peeking out from underneath.`);
						break;
					case "a schoolgirl outfit":
						r.push(`${slave.slaveName}'s blouse bulges with ${his} ${slave.inflationType}-swollen belly. It peeks out from the bottom leaving ${him} looking particularly slutty.`);
						break;
					case "a kimono":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is demurely covered by ${his} kimono.`);
						break;
					case "a hijab and abaya":
					case "a niqab and abaya":
						r.push(`${slave.slaveName}'s abaya is filled out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a klan robe":
						r.push(`${slave.slaveName}'s robe is filled out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a burqa":
						r.push(`${slave.slaveName}'s burqa is filled out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a nice pony outfit":
					case "a slutty pony outfit":
						r.push(`${slave.slaveName}'s pony outfit is rounded out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a tube top and thong":
					case "a bra":
					case "a thong":
					case "a tube top":
					case "a striped bra":
					case "striped underwear":
					case "a skimpy loincloth":
					case "a slutty klan robe":
					case "a sports bra":
					case "boyshorts":
					case "cutoffs":
					case "leather pants and pasties":
					case "leather pants":
					case "panties":
					case "panties and pasties":
					case "pasties":
					case "sport shorts and a sports bra":
					case "jeans":
					case "leather pants and a tube top":
					case "sport shorts":
						r.push(`${slave.slaveName}'s outfit completely bares ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a one-piece swimsuit":
						r.push(`${slave.slaveName}'s swimsuit is rounded out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a sweater":
					case "a sweater and cutoffs":
					case "a sweater and panties":
						r.push(`${slave.slaveName}'s sweater is rounded out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a police uniform":
						r.push(`${slave.slaveName}'s uniform is rounded out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a hanbok":
						r.push(`${slave.slaveName}'s hanbok bulges from ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a gothic lolita dress":
						r.push(`${slave.slaveName}'s dress bulges from ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a tank-top":
					case "a tank-top and panties":
						r.push(`${slave.slaveName}'s tank-top bulges from ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a button-up shirt and panties":
					case "a button-up shirt":
					case "a t-shirt":
					case "a t-shirt and thong":
					case "an oversized t-shirt and boyshorts":
					case "an oversized t-shirt":
					case "sport shorts and a t-shirt":
					case "a t-shirt and jeans":
					case "a t-shirt and panties":
						r.push(`${slave.slaveName}'s shirt covers most of ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a Santa dress":
						r.push(`The belt of ${slave.slaveName}'s dress lies atop the gentle bulge of ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a burkini":
						r.push(`${slave.slaveName}'s burkini bulges from ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a hijab and blouse":
						r.push(`${slave.slaveName}'s blouse and skirt bulge from ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "battledress":
						r.push(`${slave.slaveName}'s tank top covers the top of ${his} ${slave.inflationType}-swollen belly leaving ${him} looking like someone who had too much fun on shore leave.`);
						break;
					case "a halter top dress":
						r.push(`${slave.slaveName}'s beautiful halter top dress bulges with ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a ball gown":
						r.push(`${slave.slaveName}'s fabulous silken ball gown is tailored to draw attention to ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "slutty jewelry":
						r.push(`${slave.slaveName}'s bangles include a long thin chain that rests across ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a leotard":
						r.push(`${slave.slaveName}'s tight leotard shows off ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "overalls":
						if (slave.boobs > (slave.belly + 250)) {
							r.push(`${slave.slaveName}'s large breasts push out ${his} overalls so far that ${his} ${slave.inflationType}-swollen belly is left uncovered.`);
						} else {
							r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly rounds out the front of ${his} overalls.`);
						}
						break;
					case "a monokini":
						r.push(`${slave.slaveName}'s monokini covers most of ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "an apron":
						r.push(`${slave.slaveName}'s apron is rounded out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a cybersuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} ${slave.inflationType}-swollen belly, displaying ${his} bloated body.`);
						break;
					case "a tight Imperial bodysuit":
						r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} ${slave.inflationType}-swollen belly, displaying ${his} bloated body.`);
						break;
					case "a chattel habit":
						r.push(`The strip of cloth running down ${his} front is pushed out by ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a bunny outfit":
						r.push(`${slave.slaveName}'s teddy bulges with ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "spats and a tank top":
						if (slave.boobs > 4000) {
							r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is obscured by ${his} huge tits.`);
						} else if (slave.boobs > 1200) {
							r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} ${slave.inflationType}-swollen belly by ${his} breasts.`);
						} else {
							r.push(`${slave.slaveName}'s top can't entirely cover ${his} ${slave.inflationType}-swollen belly, allowing it to hang loose and slightly obscure ${his} spats from view.`);
						}
						break;
					case "a bimbo outfit":
						r.push(`${slave.slaveName}'s miniskirt pushes into ${his} ${slave.inflationType}-swollen belly.`);
						break;
					case "a courtesan dress":
						r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly bulges between the ribs of ${his} corset.`);
						break;
					default:
				}
			}
		} else {
			r.push(`${slave.slaveName}'s ${slave.inflationType}-swollen belly is bare and ready for surgery.`);
		}
	}

	if (slave.navelPiercing === 1) {
		r.push(`${His} navel bears a simple stud.`);
	} else if (slave.navelPiercing === 2) {
		r.push(`${His} navel is pierced with a big ring.`);
		if (slave.clothes === "slutty jewelry") {
			r.push(`It has a length of gilded chain dangling from it.`);
		} else {
			r.push(`It has a short length of chain dangling from it.`);
		}
	}

	if (slave.bellyTat !== 0) {
		if (slave.inflation === 3) {
			if (slave.bellyTat === "a heart") {
				r.push(`A heart is tattooed around ${his} popped navel, only to be truly seen when ${he} is full-term or absolutely filled with ${slave.inflationType}.`);
			} else if (slave.bellyTat === "a star") {
				r.push(`A star is tattooed around ${his} popped navel, only to be truly seen when ${he} is full-term or absolutely filled with ${slave.inflationType}.`);
			} else if (slave.bellyTat === "a butterfly") {
				r.push(`A butterfly is tattooed around ${his} popped navel, only to be truly seen when ${he} is full-term or absolutely filled with ${slave.inflationType}.`);
			}
		} else if (slave.inflation === 2) {
			r.push(`${He} has a barely recognizable tattoo around ${his} navel, it should reveal itself fully once ${he} is bloated a little more.`);
		} else if (slave.inflation === 1) {
			r.push(`${He} has an unrecognizable tattoo around ${his} navel, it has stretched slightly along with ${his} distended middle.`);
		} else {
			r.push(`${He} has an unrecognizable tattoo scrunched around ${his} navel.`);
		}
	}

	if (slave.breedingMark === 1) {
		if (V.propOutcome === 1) {
			r.push(`The Societal Elites' mark designating ${him} as a breeder is prominently displayed across ${his} lower belly, beneath ${his} navel.`);
		} else {
			r.push(`An alluring tattoo is prominently displayed across ${his} lower belly, beneath ${his} navel, urging ${him} to be bred.`);
		}
	}

	return r.join(" ");
};
