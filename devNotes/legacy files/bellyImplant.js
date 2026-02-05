/**
 * @param {App.Entity.SlaveState} slave
 * @param {object} params
 * @param {FC.Zeroable<FC.SlaveMarketName>} [params.market]
 * @param {boolean} [params.eventDescription]
 * @returns {string}
 */
App.Desc.bellyImplant = function(slave, {market, eventDescription} = {}) {
	const r = [];
	const {
		he, him, his, He, His, girl
	} = getPronouns(slave);

	r.push(shape());
	r.push(clothing());

	if (slave.fuckdoll === 0) {
		r.push(navel());
		r.push(tattoo());
		r.push(age());
	} else {
		if (slave.navelPiercing > 0) {
			if (slave.bellyImplant >= 4000) {
				if (slave.navelPiercing === 1) {
					r.push(`${His} popped navel bears a simple stud.`);
				} else if (slave.navelPiercing === 2) {
					r.push(`${His} popped navel is pierced with a big ring.`);
				}
				r.push(`It's eye-catching, since most of ${his} piercings are hidden by the suit.`);
			}
		} else {
			r.push(`${His} navel piercing runs through the suit's material.`);
		}
		if (slave.physicalAge >= 13) {
			if (slave.bellyImplant >= 31000) {
				r.push(`The difficulties of carrying such an enormous implant are greatly reduced for a Fuckdoll, since it's almost always restrained, stationary, or both.`);
			}
		} else if (slave.physicalAge >= 4) {
			if (slave.bellyImplant >= 14000) {
				r.push(`The difficulties of carrying such an enormous implant are greatly reduced for a Fuckdoll, since it's almost always restrained, stationary, or both.`);
			}
		} else if (slave.physicalAge < 4) {
			if (slave.bellyImplant >= 10000) {
				r.push(`The difficulties of carrying such an enormous implant are greatly reduced for a Fuckdoll, since it's almost always restrained, stationary, or both.`);
			}
		}
	}

	return r.join(" ");

	function shape() {
		const r = [];
		if (slave.bellyImplant >= 32000) {
			r.push(`${He} looks inhumanly pregnant,`);
			if (slave.physicalAge <= 3) {
				r.push(`and ${he} is nearly spherical. ${His} toddlerish form is utterly dwarfed by ${his} implant, all ${he} can do is lay on top of it. ${He} is so overfilled you can clearly make out the implant within ${his} body through ${his} skin. It is so taut, not one motion can be seen in its contents.`);
			} else if (slave.physicalAge <= 12) {
				r.push(`and ${he} is more belly than ${girl}. ${His} absolutely gigantic, overfilled implant keeps ${his} pinned to the ground. ${He} is so overfilled you can clearly make out the implant within ${his} body through ${his} skin. It is so taut, not one motion can be seen in its contents.`);
			} else if (slave.height >= 185) {
				r.push(`but ${his} tall frame barely keeps ${his} grotesque belly off the ground. ${He} is so overfilled you can clearly make out the implant within ${his} body through ${his} skin. It is so taut, not one motion can be seen in its contents.`);
			} else if (slave.height < 150) {
				r.push(`and ${he} is more belly than ${girl}. ${His} absolutely gigantic, overfilled implant keeps ${his} pinned to the ground. ${He} is so overfilled you can clearly make out the implant within ${his} body through ${his} skin. It is so taut, not one motion can be seen in its contents.`);
			} else if (slave.muscles > 1) {
				r.push(`and ${he} can barely hold ${his} overfilled belly upright. ${He} is so overfilled you can clearly make out the implant within ${his} body through ${his} skin. It is so taut, not one motion can be seen in its contents.`);
			} else {
				r.push(`and ${he} is more belly than ${girl}. ${His} gigantic, overfilled implant keeps ${his} pinned to the ground. ${He} is so overfilled you can clearly make out the implant within ${his} body through ${his} skin. It is so taut, not one motion can be seen in its contents.`);
			}
		} else if (slave.bellyImplant >= 16000) {
			r.push(`${He} looks unbelievably pregnant,`);
			if (slave.physicalAge <= 3) {
				r.push(`and ${his} belly pins ${him} to the ground. ${His} toddlerish form is dwarfed by ${his} implant; try as ${he} might, ${he} cannot even drag the massive thing. ${He} is so full you can nearly make out the implant within ${his} body through ${his} skin.`);
			} else if (slave.physicalAge <= 12) {
				r.push(`and ${he} can barely function with ${his} enormous belly. ${He} is so full you can nearly make out the implant within ${his} body through ${his} skin.`);
			} else if (slave.height >= 185) {
				r.push(`but ${his} tall frame barely bears ${his} obscene, drum-taut belly. ${He} is so full you can nearly make out the implant within ${his} body through ${his} skin.`);
			} else if (slave.height < 150) {
				r.push(`and ${he} can barely function with ${his} enormous belly. ${He} is so full you can nearly make out the implant within ${his} body through ${his} skin.`);
			} else if (slave.muscles > 30) {
				r.push(`and ${his} fit body allows ${him} to carry ${his} obscene belly without too much trouble. ${He} is so full you can nearly make out the implant within ${his} body through ${his} skin.`);
			} else {
				r.push(`and ${he} can barely function with ${his} enormous belly. ${He} is so full you can nearly make out the implant within ${his} body through ${his} skin.`);
			}
		} else if (slave.bellyImplant >= 8000) {
			r.push(`${He} looks hugely pregnant,`);
			if (slave.physicalAge <= 3) {
				r.push(`and ${his} toddlerish body is absolutely filled by ${his} implant. ${He} can barely move ${him}self and resembles an overinflated blow-up doll.`);
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
		} else if (slave.bellyImplant >= 4000) {
			r.push(`${He} looks pregnant,`);
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
		} else if (slave.bellyImplant >= 2000) {
			r.push(`${He} looks bloated,`);
			if (slave.physicalAge <= 3) {
				r.push(`and ${his} swollen belly looks obscene on ${his} toddlerish body.`);
			} else if (slave.physicalAge <= 12) {
				r.push(`and ${his} swollen belly already looks huge on ${his} tiny frame.`);
			} else if (slave.weight > 95) {
				r.push(`but ${he}'s sufficiently overweight that it's not obvious.`);
			} else if (slave.height < 150) {
				r.push(`and ${his} swollen belly already looks huge on ${his} tiny frame.`);
			} else if (slave.weight < -10) {
				r.push(`${his} thin form making ${his} swollen belly very obvious.`);
			} else {
				r.push(`the implant just beginning to visibly bulge ${his} belly.`);
			}
		}
		return r.join(" ");
	}

	function clothing() {
		const r = [];

		if (V.showClothing === 1 && !market) {
			if (V.surgeryDescription === 0) {
				if (slave.bellyImplant >= 32000) {
					if (slave.bellyAccessory === "an extreme corset") {
						r.push(`${slave.slaveName}'s titanic implant-filled belly makes a mockery of ${his} corset; one or the other will eventually win out.`);
					} else if ((slave.bellyAccessory === "a corset")) {
						r.push(`${slave.slaveName}'s corset looks ridiculous trying to bind ${his} middle while allowing ${his} monstrous belly to hang out.`);
					}
					switch (slave.clothes) {
						case "a Fuckdoll suit":
							r.push(`${slave.slaveName}'s titanic implant-filled belly is allowed to bulge out of a huge hole in the suit.`);
							break;
						case "conservative clothing":
							if (slave.boobs > 24000) {
								r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater far from ${his} titanic implant-filled belly.`);
							} else if (slave.boobs > 12000) {
								r.push(`${slave.slaveName}'s titanic implant-filled belly adds even more strain to ${his} struggling oversized sweater.`);
							} else if (slave.boobs > 8000) {
								r.push(`${slave.slaveName}'s oversized breasts keep ${his} sweater far from ${his} titanic implant-filled belly.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s sweater rests atop ${his} titanic implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s blouse rests atop ${his} titanic implant-filled belly.`);
							}
							break;
						case "chains":
							r.push(`${slave.slaveName}'s titanic implant-filled belly is tightly wrapped with chains; they can barely sink into the overfilled implant.`);
							break;
						case "Western clothing":
							r.push(`${slave.slaveName}'s flannel shirt can't close over ${his} titanic implant-filled belly so ${he} has left the bottom buttons open leaving ${his} stomach hanging out.`);
							break;
						case "body oil":
							r.push(`${slave.slaveName}'s titanic implant-filled is covered in a sheen of stretch-mark defeating oil.`);
							break;
						case "a succubus outfit":
							r.push(`${slave.slaveName}'s titanic implant-filled sticks out of ${his} corset, which is laced above it as best ${he} can manage.`);
							break;
						case "a toga":
							r.push(`${slave.slaveName}'s titanic implant-filled belly parts ${his} toga.`);
							break;
						case "a huipil":
							r.push(`${slave.slaveName}'s huipil meekly rests atop ${his} titanic implant-filled belly.`);
							break;
						case "a slutty qipao":
							r.push(`${His} qipao is slit up the side. However, it merely rests atop ${his} titanic implant-filled belly.`);
							break;
						case "uncomfortable straps":
							r.push(`${slave.slaveName}'s slave outfit's straining straps barely press into ${his} titanic implant-filled belly. The straps connect to a steel ring encircling ${his} popped navel.`);
							break;
						case "shibari ropes":
							r.push(`${slave.slaveName}'s titanic bulging implant-filled is tightly bound with rope; they can barely sink into the overfilled implant`);
							break;
						case "a latex catsuit":
						case "restrictive latex":
							r.push(`${slave.slaveName}'s titanic bulging implant-filled greatly distends ${his} latex suit. ${He} looks like an overinflated balloon ready to pop. Only ${his} popped navel sticking out the front of ${his} belly disrupts the smoothness.`);
							break;
						case "a military uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s titanic implant-filled belly hangs out ${his} open tunic and shirt`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt lies half open, since ${his} titanic implant-filled belly has triumphed over ${his} buttons.`);
							} else {
								r.push(`${slave.slaveName}'s tunic and shirt lie half open, since ${his} titanic implant-filled belly has triumphed over ${his} buttons.`);
							}
							break;
						case "a schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s titanic implant-filled belly hangs out ${his} open tunic and shirt`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt lies half open, since ${his} titanic implant-filled belly has triumphed over ${his} buttons.`);
							} else {
								r.push(`${slave.slaveName}'s tunic and shirt lie half open, since ${his} titanic implant-filled belly has triumphed over ${his} buttons.`);
							}
							break;
						case "a slutty schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s titanic implant-filled belly hangs out ${his} open tunic and shirt`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt lies half open, since ${his} titanic implant-filled belly has triumphed over ${his} buttons.`);
							} else {
								r.push(`${slave.slaveName}'s tunic and shirt lie half open, since ${his} titanic implant-filled belly has triumphed over ${his} buttons.`);
							}
							break;
						case "a red army uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s titanic implant-filled belly hangs out ${his} open tunic and shirt`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt lies half open, since ${his} titanic implant-filled belly has triumphed over ${his} buttons.`);
							} else {
								r.push(`${slave.slaveName}'s tunic and shirt lie half open, since ${his} titanic implant-filled belly has triumphed over ${his} buttons.`);
							}
							break;
						case "a nice nurse outfit":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s titanic implant-filled belly parts ${his} uncovered breasts.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s oversized breasts keep ${his} scrub top far from ${his} titanic implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s scrub top rests meekly atop ${his} titanic implant-filled belly.`);
							}
							break;
						case "a bimbo outfit":
							r.push(`${slave.slaveName}'s titanic implant-filled belly eclipses ${his} miniskirt and leaves little to hold up ${his} thong.`);
							break;
						case "a courtesan dress":
							r.push(`${slave.slaveName}'s corset attempts to cradle, rather than bind, ${his} titanic implant-filled belly, but the sheer size of ${his} artificial bump forces the ribs wide, exposing the thin cloth beneath.`);
							break;
						case "a mini dress":
							r.push(`${slave.slaveName}'s mini dress has burst trying to contain ${his} titanic implant-filled belly leaving it hanging out the hole it made.`);
							break;
						case "battlearmor":
							r.push(`${slave.slaveName}'s armor has burst trying to contain ${his} gigantic implant-filled belly leaving it hanging out the hole it made.`);
							break;
						case "Imperial Plate":
							r.push(`${slave.slaveName}'s armor has burst trying to contain ${his} gigantic implant-filled belly leaving it hanging out the hole it made.`);
							break;
						case "a mounty outfit":
							r.push(`${slave.slaveName}'s tunic lies half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							break;
						case "lederhosen":
							r.push(`${slave.slaveName}'s tunic lies half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							break;
						case "a long qipao":
							r.push(`${slave.slaveName}'s dress is almost conservative, it barely contains ${his} gigantic implant-filled belly. Its seams strain to hold back ${his} overfilled middle.`);
							break;
						case "a dirndl":
							r.push(`${slave.slaveName}'s dress is almost conservative, it barely contains ${his} gigantic implant-filled belly. Its seams strain to hold back ${his} overfilled middle.`);
							break;
						case "a biyelgee costume":
							r.push(`${slave.slaveName}'s dress is almost conservative, it barely contains ${his} gigantic implant-filled belly. Its seams strain to hold back ${his} overfilled middle.`);
							break;
						case "attractive lingerie":
							r.push(`${slave.slaveName}'s titanic implant-filled belly completely hides ${his} lacy g-string.`);
							break;
						case "attractive lingerie for a pregnant woman":
							r.push(`${slave.slaveName}'s titanic implant-filled belly completely hides ${his} silken panties. ${His} silken vest sensually frames ${his} overfilled middle.`);
							break;
						case "kitty lingerie":
							r.push(`${slave.slaveName}'s titanic implant-filled belly completely hides ${his} silk panties.`);
							break;
						case "a maternity dress":
							r.push(`${slave.slaveName}'s titanic implant-filled belly strains ${his} dress. ${His} dress is specially tailored to be modest yet draw attention to ${his} abnormal midriff.`);
							break;
						case "stretch pants and a crop-top":
							r.push(`${slave.slaveName}'s titanic implant-filled belly takes full advantage of ${his} exposed midriff to hang freely.`);
							break;
						case "a slutty maid outfit":
							r.push(`${slave.slaveName}'s maid dress fails to cover ${his} titanic implant-filled belly, but the outfit includes a thin white blouse that rests meekly atop ${his} immense stomach.`);
							break;
						case "a nice maid outfit":
							r.push(`${slave.slaveName}'s maid dress was almost conservative, but it has burst open trying to contain ${his} titanic implant-filled belly. ${His} immense stomach hangs out the hole it made, its sides peeking out from behind ${his} apron.`);
							break;
						case "a fallen nuns habit":
							r.push(`${slave.slaveName}'s latex habit's corset is left hanging open fully revealing ${his} titanic implant-filled belly.`);
							break;
						case "a penitent nuns habit":
							r.push(`${slave.slaveName}'s titanic implant-filled belly stretches ${his} habit. The coarse cloth aggravates ${his} sensitive stretched skin, even more so, given the amount of skin it has to torment.`);
							break;
						case "a string bikini":
							r.push(`${slave.slaveName}'s titanic implant-filled belly hides most of ${his} string bikini.`);
							break;
						case "a scalemail bikini":
							r.push(`${slave.slaveName}'s scalemail bikini exposes ${his} titanic implant-filled belly.`);
							break;
						case "striped panties":
							r.push(`${slave.slaveName}'s cute panties expose ${his} titanic implant-filled belly.`);
							break;
						case "clubslut netting":
							r.push(`${slave.slaveName}'s titanic implant-filled belly has burst through ${his} clubslut netting.`);
							break;
						case "a cheerleader outfit":
							r.push(`${slave.slaveName}'s cheerleader top rests atop ${his} implant-filled pregnant belly making it look like that this cheerleader has fucked the entire school.`);
							break;
						case "cutoffs and a t-shirt":
							if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s titanic implant-filled belly parts ${his} uncovered breasts.`);
							} else if (slave.boobs > 2000) {
								r.push(`${slave.slaveName}'s tits keep ${his} t-shirt far from ${his} titanic implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s t-shirt fails to cover ${his} titanic implant-filled belly at all.`);
							}
							break;
						case "a slutty outfit":
							r.push(`${slave.slaveName}'s titanic implant-filled belly is allowed to hang free, demonstrating just how slutty ${he} is.`);
							break;
						case "a slave gown":
							r.push(`${slave.slaveName}'s slave gown is carefully tailored, giving ${him} a sensual motherly look as it carefully caresses ${his} titanic implant-filled belly.`);
							break;
						case "slutty business attire":
							r.push(`${slave.slaveName}'s titanic implant-filled stomach hangs out the front of ${his} suit jacket and blouse as there is no way ${he} could close them.`);
							break;
						case "nice business attire":
							r.push(`${slave.slaveName}'s titanic implant-filled belly hangs out the front of ${his} specially tailored blouse and jacket as there is no way for ${him} to close them.`);
							break;
						case "harem gauze":
							r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} titanic implant-filled belly.`);
							break;
						case "a comfortable bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} titanic implant-filled belly and prominently displaying ${his} popped navel.`);
							break;
						case "a slutty nurse outfit":
							r.push(`${slave.slaveName}'s jacket fails to even come close to closing over ${his} titanic implant-filled belly leaving ${him} with only the button below ${his} breasts done.`);
							break;
						case "a schoolgirl outfit":
							r.push(`${slave.slaveName}'s blouse rests atop ${his} titanic implant-filled belly, making ${him} look like the super promiscuous school slut.`);
							break;
						case "a kimono":
							r.push(`${slave.slaveName}'s titanic implant-filled belly parts the front of ${his} kimono leaving it gracefully hanging to its sides.`);
							break;
						case "a hijab and abaya":
						case "a niqab and abaya":
							r.push(`${slave.slaveName}'s abaya lies completely taut on ${his} titanic implant-filled belly.`);
							break;
						case "a klan robe":
							r.push(`${slave.slaveName}'s robe lies completely taut on ${his} titanic implant-filled belly.`);
							break;
						case "a burqa":
							r.push(`The heavy fabric of ${slave.slaveName}'s burqa lies taut against ${his} titanic implant-filled belly.`);
							break;
						case "a nice pony outfit":
						case "a slutty pony outfit":
							r.push(`The leather material of ${slave.slaveName}'s pony outfit lies taut against ${his} titanic implant-filled belly.`);
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
							r.push(`${slave.slaveName}'s outfit completely bares ${his} titanic implant-filled belly.`);
							break;
						case "a one-piece swimsuit":
							r.push(`${slave.slaveName}'s swimsuit lies completely taut on ${his} titanic implant-filled belly.`);
							break;
						case "a sweater":
						case "a sweater and cutoffs":
						case "a sweater and panties":
							r.push(`${slave.slaveName}'s sweater lies completely taut on ${his} titanic implant-filled belly.`);
							break;
						case "a police uniform":
							r.push(`${slave.slaveName}'s uniform lies completely taut on ${his} titanic implant-filled belly.`);
							break;
						case "a hanbok":
							r.push(`${slave.slaveName}'s hanbok has been retrofitted with a large elastic band to accommodate ${his} titanic implant-filled belly.`);
							break;
						case "a gothic lolita dress":
							r.push(`${slave.slaveName}'s dress lies completely taut on ${his} titanic implant-filled belly.`);
							break;
						case "a tank-top":
						case "a tank-top and panties":
							r.push(`${slave.slaveName}'s tank-top lies completely taut on ${his} titanic implant-filled belly.`);
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
							r.push(`${slave.slaveName}'s shirt lies completely taut on ${his} titanic implant-filled belly.`);
							break;
						case "a Santa dress":
							r.push(`The bottom of ${slave.slaveName}'s titanic implant-filled belly is stretching ${his} dress's belt to its breaking point.`);
							break;
						case "a burkini":
							r.push(`The bottom of ${slave.slaveName}'s burkini's tunic lies at crotch-level due to ${his} titanic implant-filled belly.`);
							break;
						case "a hijab and blouse":
							r.push(`${slave.slaveName}'s skirt has been retrofitted with a large elastic band to accommodate ${his} titanic implant-filled belly.`);
							break;
						case "battledress":
							r.push(`${slave.slaveName}'s tank top rests atop ${his} titanic implant-filled belly leaving ${him} looking like someone who fucked half the country.`);
							break;
						case "a halter top dress":
							r.push(`${slave.slaveName}'s beautiful halter top dress has been torn open by ${his} titanic implant-filled belly. ${His} immense stomach hangs out the whole it made.`);
							break;
						case "a ball gown":
							r.push(`${slave.slaveName}'s fabulous silken ball gown has been retailored to expose ${his} titanic implant-filled belly while still maintaining its beauty.`);
							break;
						case "slutty jewelry":
							r.push(`${slave.slaveName}'s bangles include a long thin chain that looks ready to snap as in encircles ${his} titanic implant-filled belly.`);
							break;
						case "a leotard":
							r.push(`${slave.slaveName}'s tight leotard shows off every`);
							if (V.showInches === 2) {
								r.push(`inch`);
							} else {
								r.push(`centimeter`);
							}
							r.push(`of ${his} titanic implant-filled belly. ${His} immense stomach slightly protrudes from the various rips and tears that have begun appearing in the fabric.`);
							break;
						case "a monokini":
							r.push(`${slave.slaveName}'s titanic implant-filled belly has pushed down the front of ${his} monokini, leaving ${his} belly mostly bare.`);
							break;
						case "overalls":
							if (slave.boobs > (slave.belly + 250)) {
								r.push(`${slave.slaveName}'s gigantic breasts push out ${his} overalls so far that ${his} huge implant-filled belly is left halfway uncovered.`);
							} else {
								r.push(`The front of ${slave.slaveName}'s overalls barely covers half of ${his} huge implant-filled pregnant belly.`);
							}
							break;
						case "an apron":
							r.push(`${slave.slaveName} has given up trying to tie ${his} apron's strings, allowing the frilly garment to idly rest upon ${his} titanic implant-filled belly.`);
							break;
						case "a cybersuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} titanic implant-filled belly and prominently displaying ${his} popped navel.`);
							break;
						case "a tight Imperial bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} titanic implant-filled belly and prominently displaying ${his} popped navel.`);
							break;
						case "a chattel habit":
							r.push(`The strip of cloth running down ${his} front is forced to one side by ${his} titanic implant-filled belly.`);
							break;
						case "a bunny outfit":
							r.push(`${slave.slaveName}'s teddy has burst trying to contain ${his} titanic implant-filled belly leaving it hanging out the hole it made.`);
							break;
						case "spats and a tank top":
							if (slave.boobs > 1200) {
								r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} titanic implant-filled belly by ${his} breasts.`);
							} else {
								r.push(`${slave.slaveName}'s top fails to cover ${his} titanic implant-filled belly at all.`);
							}
							break;
						default:
					}
					if (V.arcologies[0].FSTransformationFetishist !== "unset") {
						r.push(`Your transformation fetishizing society is fascinated by ${his} unusual implant.`);
					}
				} else if (slave.bellyImplant >= 16000) {
					if (slave.bellyAccessory === "an extreme corset") {
						r.push(`${slave.slaveName}'s gigantic implant-filled belly is strains ${his} corset, threatening to burst it; one or the other will eventually win out.`);
					} else if ((slave.bellyAccessory === "a corset")) {
						r.push(`${slave.slaveName}'s corset strains around ${his} monstrous belly.`);
					}
					switch (slave.clothes) {
						case "a Fuckdoll suit":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly is allowed to bulge out of a huge hole in the suit.`);
							break;
						case "conservative clothing":
							if (slave.boobs > 20000) {
								r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater far from ${his} gigantic implant-filled belly.`);
							} else if (slave.boobs > 10000) {
								r.push(`${slave.slaveName}'s gigantic implant-filled belly adds even more strain to ${his} struggling oversized sweater.`);
							} else if (slave.boobs > 8000) {
								r.push(`${slave.slaveName}'s gigantic implant-filled belly parts ${his} poorly covered breasts.`);
							} else if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s oversized breasts keep ${his} sweater far from ${his} gigantic implant-filled belly.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s sweater rests atop ${his} gigantic implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s blouse rests atop ${his} gigantic implant-filled belly.`);
							}
							break;
						case "chains":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly is tightly wrapped with chains causing it to bulge angrily.`);
							break;
						case "Western clothing":
							r.push(`${slave.slaveName}'s flannel shirt can't close over ${his} gigantic implant-filled belly so ${he} has left the bottom buttons open leaving ${his} stomach hanging out.`);
							break;
						case "a succubus outfit":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly sticks out of ${his} corset, which is laced above and below it as best ${he} can manage. The laces are straining to hold together.`);
							break;
						case "body oil":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly is covered in a sheen of stretch-mark defeating oil.`);
							break;
						case "a toga":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly parts ${his} toga.`);
							break;
						case "a huipil":
							r.push(`${slave.slaveName}'s huipil meekly rests atop ${his} gigantic implant-filled belly.`);
							break;
						case "a slutty qipao":
							r.push(`${His} qipao is slit up the side. However, it merely rests atop ${his} gigantic implant-filled belly.`);
							break;
						case "uncomfortable straps":
							r.push(`${slave.slaveName}'s slave outfit's straining straps press into ${his} gigantic implant-filled belly causing flesh to spill out the gaps. The straps connect to a steel ring encircling ${his} popped navel.`);
							break;
						case "shibari ropes":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly is tightly bound with rope, flesh angrily bulges from between them.`);
							break;
						case "a latex catsuit":
						case "restrictive latex":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly greatly distends ${his} latex suit. ${He} looks like an overinflated balloon ready to pop. Only ${his} popped navel sticking out the front of ${his} belly disrupts the smoothness.`);
							break;
						case "a military uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s gigantic implant-filled belly hangs out ${his} open tunic and shirt`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt lies half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							} else {
								r.push(`${slave.slaveName}'s tunic and shirt lie half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							}
							break;
						case "a schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s gigantic implant-filled belly hangs out ${his} open tunic and shirt`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt lies half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							} else {
								r.push(`${slave.slaveName}'s tunic and shirt lie half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							}
							break;
						case "a slutty schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s gigantic implant-filled belly hangs out ${his} open tunic and shirt`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt lies half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							} else {
								r.push(`${slave.slaveName}'s tunic and shirt lie half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							}
							break;
						case "a red army uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s gigantic implant-filled belly hangs out ${his} open tunic and shirt`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt lies half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							} else {
								r.push(`${slave.slaveName}'s tunic and shirt lie half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							}
							break;
						case "a nice nurse outfit":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s gigantic implant-filled belly parts ${his} uncovered breasts.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s oversized breasts keep ${his} scrub top far from ${his} gigantic implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s scrub top rests meekly atop ${his} gigantic implant-filled belly.`);
							}
							break;
						case "a mini dress":
							r.push(`${slave.slaveName}'s mini dress has burst trying to contain ${his} gigantic implant-filled belly leaving it hanging out the hole it made.`);
							break;
						case "battlearmor":
							r.push(`${slave.slaveName}'s armor has burst trying to contain ${his} gigantic implant-filled belly leaving it hanging out the hole it made.`);
							break;
						case "Imperial Plate":
							r.push(`${slave.slaveName}'s armor has burst trying to contain ${his} gigantic implant-filled belly leaving it hanging out the hole it made.`);
							break;
						case "a mounty outfit":
							r.push(`${slave.slaveName}'s tunic lies half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							break;
						case "lederhosen":
							r.push(`${slave.slaveName}'s tunic lies half open, since ${his} gigantic implant-filled belly has triumphed over ${his} buttons.`);
							break;
						case "a long qipao":
							r.push(`${slave.slaveName}'s dress is almost conservative, it barely contains ${his} gigantic implant-filled belly. Its seams strain to hold back ${his} overfilled middle.`);
							break;
						case "a dirndl":
							r.push(`${slave.slaveName}'s dress is almost conservative, it barely contains ${his} gigantic implant-filled belly. Its seams strain to hold back ${his} overfilled middle.`);
							break;
						case "a biyelgee costume":
							r.push(`${slave.slaveName}'s dress is almost conservative, it barely contains ${his} gigantic implant-filled belly. Its seams strain to hold back ${his} overfilled middle.`);
							break;
						case "attractive lingerie":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly completely hides ${his} lacy g-string.`);
							break;
						case "attractive lingerie for a pregnant woman":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly completely hides ${his} silken panties. ${His} silken vest sensually frames ${his} overfilled belly.`);
							break;
						case "kitty lingerie":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly completely hides ${his} silk panties.`);
							break;
						case "a maternity dress":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly fills ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to ${his} giant middle.`);
							break;
						case "stretch pants and a crop-top":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly takes full advantage of ${his} exposed midriff to hang freely.`);
							break;
						case "a slutty maid outfit":
							r.push(`${slave.slaveName}'s maid dress fails to cover ${his} gigantic implant-filled belly, but the outfit includes a thin white blouse that rests meekly atop ${his} stomach.`);
							break;
						case "a nice maid outfit":
							r.push(`${slave.slaveName}'s maid dress is almost conservative, it barely contains ${his} gigantic implant-filled belly. Its seams strain to hold back ${his} overfilled middle.`);
							break;
						case "a fallen nuns habit":
							r.push(`${slave.slaveName}'s latex habit's corset is left hanging open fully revealing ${his} gigantic implant-filled belly.`);
							break;
						case "a penitent nuns habit":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly completely fills ${his} habit. The coarse cloth aggravates ${his} sensitive stretched skin.`);
							break;
						case "a string bikini":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly parts ${his} string bikini to either side.`);
							break;
						case "a scalemail bikini":
							r.push(`${slave.slaveName}'s scalemail bikini exposes ${his} gigantic implant-filled belly.`);
							break;
						case "striped panties":
							r.push(`${slave.slaveName}'s cute panties expose ${his} gigantic implant-filled belly.`);
							break;
						case "clubslut netting":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly has burst through ${his} clubslut netting.`);
							break;
						case "a cheerleader outfit":
							r.push(`${slave.slaveName}'s cheerleader top rests atop ${his} gigantic implant-filled belly displaying that this cheerleader is a massive slut.`);
							break;
						case "cutoffs and a t-shirt":
							if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s gigantic implant-filled belly parts ${his} uncovered breasts.`);
							} else if (slave.boobs > 2000) {
								r.push(`${slave.slaveName}'s tits keep ${his} t-shirt far from ${his} gigantic implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s t-shirt fails to cover ${his} gigantic implant-filled belly at all.`);
							}
							break;
						case "a slutty outfit":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly really shows how big of a slut ${he} is.`);
							break;
						case "a slave gown":
							r.push(`${slave.slaveName}'s slave gown is carefully tailored, giving ${him} a sensual motherly look as it carefully caresses ${his} gigantic implant-filled belly.`);
							break;
						case "slutty business attire":
							r.push(`${slave.slaveName}'s gigantic implant-filled stomach hangs out the front of ${his} suit jacket and blouse as there is no way ${he} could close them.`);
							break;
						case "nice business attire":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly hangs out the front of ${his} specially tailored blouse and jacket as there is no way for ${him} to close them.`);
							break;
						case "harem gauze":
							r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} gigantic implant-filled belly.`);
							break;
						case "a comfortable bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} gigantic implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a slutty nurse outfit":
							r.push(`${slave.slaveName}'s jacket fails to even come close to closing over ${his} gigantic implant-filled belly leaving ${him} with only the button below ${his} breasts done.`);
							break;
						case "a schoolgirl outfit":
							r.push(`${slave.slaveName}'s blouse rests atop ${his} gigantic implant-filled belly, leaving ${him} looking particularly slutty.`);
							break;
						case "a kimono":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly parts the front of ${his} kimono leaving it gracefully covering its sides.`);
							break;
						case "a hijab and abaya":
						case "a niqab and abaya":
							r.push(`${slave.slaveName}'s abaya is straining to contain ${his} huge implant-filled belly.`);
							break;
						case "a klan robe":
							r.push(`${slave.slaveName}'s robe is straining to contain ${his} huge implant-filled belly.`);
							break;
						case "a burqa":
							r.push(`${slave.slaveName}'s burqa is filled out by ${his} huge implant-filled belly.`);
							break;
						case "a nice pony outfit":
						case "a slutty pony outfit":
							r.push(`The leather material of ${slave.slaveName}'s pony outfit lies taut against ${his} huge implant-filled belly.`);
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
							r.push(`${slave.slaveName}'s outfit completely bares ${his} huge implant-filled belly.`);
							break;
						case "a one-piece swimsuit":
							r.push(`${slave.slaveName}'s swimsuit lies completely taut on ${his} huge implant-filled belly.`);
							break;
						case "a sweater":
						case "a sweater and cutoffs":
						case "a sweater and panties":
							r.push(`${slave.slaveName}'s sweater lies completely taut on ${his} huge implant-filled belly.`);
							break;
						case "a police uniform":
							r.push(`${slave.slaveName}'s uniform lies completely taut on ${his} huge implant-filled belly.`);
							break;
						case "a hanbok":
							r.push(`${slave.slaveName}'s hanbok has been retrofitted with a large elastic band to accommodate ${his} huge implant-filled belly.`);
							break;
						case "a gothic lolita dress":
							r.push(`${slave.slaveName}'s dress lies completely taut on ${his} huge implant-filled belly.`);
							break;
						case "a tank-top":
						case "a tank-top and panties":
							r.push(`${slave.slaveName}'s tank-top lies completely taut on ${his} huge implant-filled belly.`);
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
							r.push(`${slave.slaveName}'s shirt lies completely taut on ${his} huge implant-filled belly.`);
							break;
						case "a Santa dress":
							r.push(`${slave.slaveName}'s leather belt can only just barely fit around ${his} huge implant-filled belly.`);
							break;
						case "a burkini":
							r.push(`The fabric of ${slave.slaveName}'s burkini is pushed up to just below ${his} crotch due to ${his} huge implant-filled belly.`);
							break;
						case "a hijab and blouse":
							r.push(`${slave.slaveName}'s shirts are straining to contain ${his} huge implant-filled belly.`);
							break;
						case "battledress":
							r.push(`${slave.slaveName}'s tank top rests atop ${his} gigantic implant-filled belly leaving ${him} looking like someone who fucked all the locals.`);
							break;
						case "a halter top dress":
							r.push(`${slave.slaveName}'s beautiful halter top dress is strained by ${his} gigantic implant-filled belly. ${His} popped navel prominently pokes through the front of ${his} dress as its seams strain to hold together.`);
							break;
						case "a ball gown":
							r.push(`${slave.slaveName}'s fabulous silken ball gown, while tailored, strains to contain ${his} gigantic implant-filled belly.`);
							break;
						case "slutty jewelry":
							r.push(`${slave.slaveName}'s bangles include a long thin chain that rests above ${his} popped navel.`);
							break;
						case "a leotard":
							r.push(`${slave.slaveName}'s tight leotard shows off every kick and movement within ${his} gigantic implant-filled belly. The material tightly clings to ${his} popped navel and strains to hold together.`);
							break;
						case "a monokini":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly pushes the fabric of ${his} monokini to below ${his} popped navel.`);
							break;
						case "overalls":
							if (slave.boobs > (slave.belly + 250)) {
								r.push(`${slave.slaveName}'s enormous breasts push out ${his} overalls so far that ${his} huge implant-filled belly is left mostly uncovered.`);
							} else {
								r.push(`${slave.slaveName}'s overalls are pulled taut by ${his} huge implant-filled belly.`);
							}
							break;
						case "an apron":
							r.push(`The strings of ${slave.slaveName}'s apron struggle to stay tied due to the size of ${his} huge implant-filled belly.`);
							break;
						case "a cybersuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} gigantic implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a tight Imperial bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} gigantic implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a chattel habit":
							r.push(`The strip of cloth running down ${his} front is parted to one side by ${his} gigantic implant-filled belly.`);
							break;
						case "a bunny outfit":
							r.push(`${slave.slaveName}'s teddy has burst trying to contain ${his} gigantic implant-filled belly, leaving it hanging out the hole it made.`);
							break;
						case "spats and a tank top":
							if (slave.boobs > 1200) {
								r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} gigantic implant-filled belly by ${his} breasts.`);
							} else {
								r.push(`${slave.slaveName}'s top merely rests on ${his} gigantic implant-filled belly.`);
							}
							break;
						case "a bimbo outfit":
							r.push(`${slave.slaveName}'s gigantic implant-filled belly eclipses ${his} miniskirt and leaves little to hold up ${his} thong.`);
							break;
						case "a courtesan dress":
							r.push(`${slave.slaveName}'s corset cradles, rather than binds, ${his} gigantic implant-filled belly, but the sheer size of ${his} artificial bump forces the ribs wide, exposing the thin cloth beneath.`);
							break;
						default:
					}
					if (V.arcologies[0].FSTransformationFetishist !== "unset") {
						r.push(`Your transformation fetishizing society is fascinated by ${his} unusual implant.`);
					}
				} else if (slave.bellyImplant >= 8000) {
					if (slave.bellyAccessory === "an extreme corset") {
						r.push(`${slave.slaveName}'s huge implant-filled belly is tightly compressed by ${his} corset; one or the other will eventually win out.`);
					} else if ((slave.bellyAccessory === "a corset")) {
						r.push(`${slave.slaveName}'s huge implant-filled belly comfortably bulges out of ${his} corset.`);
					}
					switch (slave.clothes) {
						case "a Fuckdoll suit":
							r.push(`${slave.slaveName}'s huge implant-filled belly is allowed to bulge out of a huge hole in the suit.`);
							break;
						case "conservative clothing":
							if (slave.boobs > 24000) {
								r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater from covering ${his} huge implant-filled belly, though they do a fine job of hiding it themselves.`);
							} else if (slave.boobs > 12000) {
								r.push(`${slave.slaveName}'s huge implant-filled belly is hidden by ${his} massive tits and oversized sweater.`);
							} else if (slave.boobs > 8000) {
								r.push(`${slave.slaveName}'s oversized breasts keep ${his} sweater far from ${his} huge implant-filled belly.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s sweater is pulled taut by ${his} huge implant-filled belly, the bottom of which can be seen peeking out from underneath. ${His} popped navel forms a small tent in the material.`);
							} else {
								r.push(`${slave.slaveName}'s blouse is pulled taut by ${his} huge implant-filled belly, the bottom of which can be seen peeking out from underneath. ${His} popped navel forms a small tent in ${his} shirt.`);
							}
							break;
						case "attractive lingerie for a pregnant woman":
							r.push(`${slave.slaveName}'s huge implant-filled belly completely hides ${his} silken panties. ${His} silken vest sensually frames ${his} heavy stomach.`);
							break;
						case "a maternity dress":
							r.push(`${slave.slaveName}'s huge implant-filled belly fills out ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to ${his} expanded middle.`);
							break;
						case "stretch pants and a crop-top":
							r.push(`${slave.slaveName}'s huge implant-filled belly takes full advantage of ${his} exposed midriff to hang freely and obscure ${his} stretch pants.`);
							break;
						case "chains":
							r.push(`${slave.slaveName}'s huge implant-filled belly is tightly wrapped with chains, causing it to bulge angrily.`);
							break;
						case "Western clothing":
							r.push(`${slave.slaveName}'s flannel shirt can't close over ${his} huge implant-filled belly so ${he} has left the bottom buttons open, leaving ${his} stomach hanging out.`);
							break;
						case "body oil":
							r.push(`${slave.slaveName}'s huge implant-filled belly is covered in a sheen of special oil meant to prevent stretch marks.`);
							break;
						case "a toga":
							r.push(`${slave.slaveName}'s huge implant-filled belly parts ${his} toga.`);
							break;
						case "a huipil":
							r.push(`${slave.slaveName}'s huge implant-filled belly lifts ${his} huipil.`);
							break;
						case "a slutty qipao":
							r.push(`${His} qipao is slit up the side. However, it merely rests atop ${his} huge implant-filled belly.`);
							break;
						case "uncomfortable straps":
							r.push(`${slave.slaveName}'s slave outfit's straining straps press into ${his} huge implant-filled belly, causing flesh to spill out of the gaps. The straps connect to a steel ring encircling ${his} popped navel.`);
							break;
						case "shibari ropes":
							r.push(`${slave.slaveName}'s huge implant-filled belly is tightly bound with ropes; flesh bulges angrily from between them.`);
							break;
						case "a latex catsuit":
						case "restrictive latex":
							r.push(`${slave.slaveName}'s huge implant-filled belly greatly distends ${his} latex suit. ${He} looks like an overinflated balloon ready to pop. Only ${his} popped navel sticking out the front of ${his} belly disrupts the smoothness.`);
							break;
						case "a military uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s huge implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt strains to contain ${his} huge implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s huge implant-filled belly greatly stretches ${his} uniform's jacket.`);
							}
							break;
						case "a schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s huge implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt strains to contain ${his} huge implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s huge implant-filled belly greatly stretches ${his} uniform's jacket.`);
							}
							break;
						case "a slutty schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s huge implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt strains to contain ${his} huge implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s huge implant-filled belly greatly stretches ${his} uniform's jacket.`);
							}
							break;
						case "a red army uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s huge implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt strains to contain ${his} huge implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s huge implant-filled belly greatly stretches ${his} uniform's jacket.`);
							}
							break;
						case "a nice nurse outfit":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s huge implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s nurse outfit could be called conservative, if it could cover more than half of ${his} breasts; ${his} huge implant-filled belly hangs out from under them, obscuring ${his} trousers.`);
							} else {
								r.push(`${slave.slaveName}'s nurse outfit is almost conservative, though ${his} huge implant-filled belly hangs out from under ${his} top, obscuring ${his} trousers.`);
							}
							break;
						case "a mini dress":
							r.push(`${slave.slaveName}'s mini dress barely clings to ${his} huge implant-filled belly.`);
							break;
						case "battlearmor":
							r.push(`${slave.slaveName}'s armor tightly clings to ${his} huge implant-filled belly.`);
							break;
						case "Imperial Plate":
							r.push(`${slave.slaveName}'s armor tightly clings to ${his} huge implant-filled belly.`);
							break;
						case "a mounty outfit":
							r.push(`${slave.slaveName}'s tunic tightly clings to ${his} huge implant-filled belly.`);
							break;
						case "lederhosen":
							r.push(`${slave.slaveName}'s tunic tightly clings to ${his} huge implant-filled belly.`);
							break;
						case "a long qipao":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} huge implant-filled belly.`);
							break;
						case "a dirndl":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} huge implant-filled belly.`);
							break;
						case "a biyelgee costume":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} huge implant-filled belly.`);
							break;
						case "attractive lingerie":
							r.push(`${slave.slaveName}'s huge implant-filled belly completely hides ${his} lacy g-string.`);
							break;
						case "kitty lingerie":
							r.push(`${slave.slaveName}'s huge implant-filled belly completely hides ${his} silk panties.`);
							break;
						case "a succubus outfit":
							r.push(`${slave.slaveName}'s huge implant-filled belly sticks out of ${his} corset, which is laced above and below it as best ${he} can manage.`);
							break;
						case "a slutty maid outfit":
							r.push(`${slave.slaveName}'s maid dress fails to cover ${his} huge implant-filled belly, but the outfit includes a thin white blouse that conceals only the upper part of ${his} stomach.`);
							break;
						case "a nice maid outfit":
							r.push(`${slave.slaveName}'s maid dress is almost conservative. It covers ${his} huge implant-filled belly completely, though it cannot hide ${his} popped navel, poking through the front.`);
							break;
						case "a fallen nuns habit":
							r.push(`${slave.slaveName}'s latex habit's corset is left hanging open fully revealing ${his} huge implant-filled belly.`);
							break;
						case "a penitent nuns habit":
							r.push(`${He} looks absolutely blasphemous in a habit with such a huge implant-filled belly. The coarse cloth aggravates ${his} sensitive stretched skin.`);
							break;
						case "a string bikini":
							r.push(`${slave.slaveName}'s huge implant-filled belly parts ${his} string bikini to either side.`);
							break;
						case "a scalemail bikini":
							r.push(`${slave.slaveName}'s scalemail bikini exposes ${his} huge implant-filled belly.`);
							break;
						case "striped panties":
							r.push(`${slave.slaveName}'s cute panties expose ${his} huge implant-filled belly.`);
							break;
						case "clubslut netting":
							r.push(`${slave.slaveName}'s clubslut netting is stretched to the breaking point by ${his} huge implant-filled belly.`);
							break;
						case "a cheerleader outfit":
							r.push(`${slave.slaveName}'s cheerleader top rides up ${his} huge implant-filled belly, covering only the top of it while leaving the rest on display to show how slutty this cheerleader is.`);
							break;
						case "cutoffs and a t-shirt":
							if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s huge implant-filled belly is obscured by ${his} huge tits.`);
							} else if (slave.boobs > 2000) {
								r.push(`${slave.slaveName}'s tits keep ${his} t-shirt far from ${his} huge implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s t-shirt fails to cover ${his} huge implant-filled belly at all.`);
							}
							break;
						case "a slutty outfit":
							r.push(`${slave.slaveName}'s huge implant-filled belly really shows what a slut ${he} is.`);
							break;
						case "a slave gown":
							r.push(`${slave.slaveName}'s slave gown is carefully tailored, giving ${him} a sensual motherly look as it carefully caresses ${his} huge implant-filled belly.`);
							break;
						case "slutty business attire":
							r.push(`${slave.slaveName}'s huge implant-filled belly hangs out the front of ${his} suit jacket and blouse, as there is no way ${he} could close them.`);
							break;
						case "nice business attire":
							r.push(`${slave.slaveName}'s huge implant-filled belly strains ${his} specially tailored blouse and jacket.`);
							break;
						case "harem gauze":
							r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} huge implant-filled belly.`);
							break;
						case "a comfortable bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} huge implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a slutty nurse outfit":
							r.push(`${slave.slaveName}'s jacket fails to even come close to closing over ${his} huge implant-filled belly, leaving ${him} with only the button below ${his} breasts done.`);
							break;
						case "a schoolgirl outfit":
							r.push(`${slave.slaveName}'s blouse rides up ${his} huge implant-filled belly, leaving ${him} looking particularly slutty.`);
							break;
						case "a kimono":
							r.push(`${slave.slaveName}'s huge implant-filled belly parts the front of ${his} kimono, leaving it gracefully covering its sides.`);
							break;
						case "a hijab and abaya":
						case "a niqab and abaya":
							r.push(`${slave.slaveName}'s burqa is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a klan robe":
							r.push(`${slave.slaveName}'s robe is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a burqa":
							r.push(`${slave.slaveName}'s burqa is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a nice pony outfit":
						case "a slutty pony outfit":
							r.push(`The leather material of ${slave.slaveName}'s pony outfit is noticeably rounded out by ${his} huge implant-filled belly.`);
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
							r.push(`${slave.slaveName}'s outfit completely bares ${his} huge implant-filled belly.`);
							break;
						case "a one-piece swimsuit":
							r.push(`${slave.slaveName}'s swimsuit is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a sweater":
						case "a sweater and cutoffs":
						case "a sweater and panties":
							r.push(`${slave.slaveName}'s sweater is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a police uniform":
							r.push(`${slave.slaveName}'s uniform is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a hanbok":
							r.push(`${slave.slaveName}'s hanbok is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a gothic lolita dress":
							r.push(`${slave.slaveName}'s dress is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a tank-top":
						case "a tank-top and panties":
							r.push(`${slave.slaveName}'s tank-top is noticeably rounded out by ${his} huge implant-filled belly.`);
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
							r.push(`${slave.slaveName}'s shirt is noticeably rounded out by ${his} huge implant-filled belly.`);
							break;
						case "a Santa dress":
							r.push(`${slave.slaveName}'s belt is struggling to fully encircle ${his} huge implant-filled belly.`);
							break;
						case "a burkini":
							r.push(`The fabric of ${slave.slaveName}'s burkini is slightly pushed up thanks to ${his} huge implant-filled belly.`);
							break;
						case "a hijab and blouse":
							r.push(`${slave.slaveName} has trouble pulling ${his} skirt up to fit around ${his} huge implant-filled belly.`);
							break;
						case "battledress":
							r.push(`${slave.slaveName}'s tank top barely even covers the top of ${his} huge implant-filled belly, leaving ${him} looking like someone who had too much fun on shore leave.`);
							break;
						case "a halter top dress":
							r.push(`${slave.slaveName}'s beautiful halter top dress is filled by ${his} huge implant-filled belly. ${His} popped navel prominently pokes through its front.`);
							break;
						case "a ball gown":
							r.push(`${slave.slaveName}'s fabulous silken ball gown is tailored to not only fit ${his} huge implant-filled belly, but draw attention to it.`);
							break;
						case "slutty jewelry":
							r.push(`${slave.slaveName}'s bangles include a long thin chain that rests above ${his} popped navel.`);
							break;
						case "a leotard":
							r.push(`${slave.slaveName}'s tight leotard shows off every kick and movement within ${his} huge implant-filled belly. The material tightly clings to ${his} popped navel.`);
							break;
						case "a monokini":
							r.push(`${slave.slaveName}'s huge implant-filled belly pushes the fabric of ${his} monokini to rest just above ${his} popped navel.`);
							break;
						case "overalls":
							if (slave.boobs > (slave.belly + 250)) {
								r.push(`${slave.slaveName}'s massive breasts push out ${his} overalls so far that ${his} hugely swollen belly is left almost entirely uncovered.`);
							} else {
								r.push(`${slave.slaveName}'s hugely swollen belly stretches out the fabric of ${his} overalls.`);
							}
							break;
						case "an apron":
							r.push(`${slave.slaveName}'s apron is pushed away from ${his} body by ${his} huge implant-filled belly.`);
							break;
						case "a cybersuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} huge implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a tight Imperial bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} huge implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a chattel habit":
							r.push(`The strip of cloth running down ${his} front is parted to one side by ${his} huge implant-filled belly.`);
							break;
						case "a bunny outfit":
							r.push(`${slave.slaveName}'s teddy is stretched to tearing by ${his} huge implant-filled belly. ${His} popped navel prominently pokes through the material.`);
							break;
						case "spats and a tank top":
							if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s huge implant-filled belly is obscured by ${his} huge tits.`);
							} else if (slave.boobs > 1200) {
								r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} huge implant-filled belly by ${his} breasts.`);
							} else {
								r.push(`${slave.slaveName}'s top merely rests on ${his} huge implant-filled belly.`);
							}
							break;
						case "a bimbo outfit":
							r.push(`${slave.slaveName}'s miniskirt is trapped beneath ${his} huge implant-filled belly and ${his} thong strings forced to caress its curves.`);
							break;
						case "a courtesan dress":
							r.push(`${slave.slaveName}'s huge implant-filled belly strains the ribs of ${his} corset.`);
							break;
						default:
					}
					if (V.arcologies[0].FSTransformationFetishist !== "unset") {
						r.push(`Your transformation fetishizing society is fascinated by ${his} unusual implant.`);
					}
				} else if (slave.bellyImplant >= 4000) {
					if (slave.bellyAccessory === "an extreme corset") {
						r.push(`${slave.slaveName}'s implant-filled belly is tightly compressed by ${his} corset; one or the other will eventually win out.`);
					} else if ((slave.bellyAccessory === "a corset")) {
						r.push(`${slave.slaveName}'s implant-filled belly comfortably bulges out of ${his} corset.`);
					}
					switch (slave.clothes) {
						case "a Fuckdoll suit":
							r.push(`${slave.slaveName}'s implant-filled belly is allowed to bulge out of a hole in the suit.`);
							break;
						case "conservative clothing":
							if (slave.boobs > 20000) {
								r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater from covering ${his} implant-filled belly, though they do a fine job of hiding it themselves.`);
							} else if (slave.boobs > 10000) {
								r.push(`${slave.slaveName}'s implant-filled belly is hidden by ${his} massive tits and oversized sweater.`);
							} else if (slave.boobs > 8000) {
								r.push(`${slave.slaveName}'s oversized breasts keep ${his} sweater far from ${his} implant-filled belly.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s sweater is pulled taut by ${his} implant-filled belly. ${His} popped navel forms a small tent in material.`);
							} else {
								r.push(`${slave.slaveName}'s blouse is pulled taut by ${his} implant-filled belly. ${His} popped navel forms a small tent in ${his} shirt.`);
							}
							break;
						case "attractive lingerie for a pregnant woman":
							r.push(`${slave.slaveName}'s implant-filled belly hides ${his} silken panties. ${His} silken vest sensually frames ${his} heavy stomach.`);
							break;
						case "a maternity dress":
							r.push(`${slave.slaveName}'s implant-filled belly fills out ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to ${his} rounded middle.`);
							break;
						case "stretch pants and a crop-top":
							r.push(`${slave.slaveName}'s implant-filled belly takes full advantage of ${his} exposed midriff to bulge freely and slightly obscure ${his} stretch pants.`);
							break;
						case "chains":
							r.push(`${slave.slaveName}'s implant-filled belly is tightly wrapped with chains, causing it to bulge angrily.`);
							break;
						case "Western clothing":
							r.push(`${slave.slaveName}'s flannel shirt can't close over ${his} implant-filled belly, so ${he} has left the bottom buttons open leaving ${his} belly hanging out.`);
							break;
						case "body oil":
							r.push(`${slave.slaveName}'s implant-filled belly is covered in a sheen of special oil meant to prevent stretch marks.`);
							break;
						case "a toga":
							r.push(`${slave.slaveName}'s implant-filled belly parts ${his} toga.`);
							break;
						case "a huipil":
							r.push(`${slave.slaveName}'s implant-filled belly lifts ${his} huipil.`);
							break;
						case "a slutty qipao":
							r.push(`${His} qipao is slit up the side. However, it only covers the top of ${his} implant-filled belly.`);
							break;
						case "uncomfortable straps":
							r.push(`${slave.slaveName}'s slave outfit's straining straps press into ${his} implant-filled belly, causing flesh to spill out of the gaps. The straps connect to a steel ring encircling ${his} popped navel.`);
							break;
						case "shibari ropes":
							r.push(`${slave.slaveName}'s implant-filled belly is tightly bound with rope; flesh bulges angrily from between them.`);
							break;
						case "a latex catsuit":
						case "restrictive latex":
							r.push(`${slave.slaveName}'s implant-filled belly greatly distends ${his} latex suit. ${He} looks like an overinflated balloon. Only ${his} popped navel sticking out the front of ${his} belly disrupts the smoothness.`);
							break;
						case "a military uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt strains to contain ${his} implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s implant-filled belly notably distends ${his} uniform's jacket.`);
							}
							break;
						case "a schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt strains to contain ${his} implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s implant-filled belly notably distends ${his} uniform's jacket.`);
							}
							break;
						case "a slutty schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt strains to contain ${his} implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s implant-filled belly notably distends ${his} uniform's jacket.`);
							}
							break;
						case "a red army uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt strains to contain ${his} implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s implant-filled belly notably distends ${his} uniform's jacket.`);
							}
							break;
						case "a nice nurse outfit":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-filled belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s nurse outfit could be called conservative, if it could cover more than half of ${his} breasts; ${his} implant-filled belly hangs out from under them, obscuring ${his} trousers.`);
							} else {
								r.push(`${slave.slaveName}'s nurse outfit is almost conservative, though ${his} implant-filled hangs out from under ${his} top, slightly obscuring ${his} trousers.`);
							}
							break;
						case "a mini dress":
							r.push(`${slave.slaveName}'s mini dress tightly clings to ${his} implant-filled belly.`);
							break;
						case "battlearmor":
							r.push(`${slave.slaveName}'s armor tightly clings to ${his} implant-filled belly.`);
							break;
						case "Imperial Plate":
							r.push(`${slave.slaveName}'s armor tightly clings to ${his} implant-filled belly.`);
							break;
						case "a mounty outfit":
							r.push(`${slave.slaveName}'s tunic tightly clings to ${his} implant-filled belly.`);
							break;
						case "lederhosen":
							r.push(`${slave.slaveName}'s tunic tightly clings to ${his} implant-filled belly.`);
							break;
						case "a long qipao":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} implant-filled belly.`);
							break;
						case "a dirndl":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} implant-filled belly.`);
							break;
						case "a biyelgee costume":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} implant-filled belly.`);
							break;
						case "attractive lingerie":
							r.push(`${slave.slaveName}'s implant-filled belly hides ${his} lacy g-string.`);
							break;
						case "kitty lingerie":
							r.push(`${slave.slaveName}'s implant-filled belly hides ${his} silk panties.`);
							break;
						case "a succubus outfit":
							r.push(`${slave.slaveName}'s implant-filled belly sticks out of ${his} corset, which is laced above and below it.`);
							break;
						case "a slutty maid outfit":
							r.push(`${slave.slaveName}'s maid dress fails to cover ${his} implant-filled belly, but the outfit includes a thin white blouse that conceals only the top half of ${his} stomach.`);
							break;
						case "a nice maid outfit":
							r.push(`${slave.slaveName}'s maid dress is almost conservative, it covers ${his} implant-filled belly completely. Though it cannot hide ${his} popped navel poking through the front.`);
							break;
						case "a fallen nuns habit":
							r.push(`${slave.slaveName}'s latex habit's corset is left hanging open fully revealing ${his} implant-filled belly.`);
							break;
						case "a penitent nuns habit":
							r.push(`${He} looks absolutely blasphemous in a habit with an implant-filled belly. The coarse cloth aggravates ${his} sensitive stretched skin.`);
							break;
						case "a string bikini":
							r.push(`${slave.slaveName}'s implant-filled belly parts ${his} string bikini to either side.`);
							break;
						case "a scalemail bikini":
							r.push(`${slave.slaveName}'s scalemail bikini exposes ${his} implant-filled belly.`);
							break;
						case "striped panties":
							r.push(`${slave.slaveName}'s cute panties expose ${his} implant-filled belly.`);
							break;
						case "clubslut netting":
							r.push(`${slave.slaveName}'s clubslut netting is stretched out by ${his} implant-filled belly.`);
							break;
						case "a cheerleader outfit":
							r.push(`${slave.slaveName}'s cheerleader top covers most of ${his} implant-filled belly, the bottom of which peeks out showing how slutty this cheerleader is.`);
							break;
						case "cutoffs and a t-shirt":
							if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s implant-filled belly is obscured by ${his} huge tits.`);
							} else if (slave.boobs > 2000) {
								r.push(`${slave.slaveName}'s tits keep ${his} t-shirt far from ${his} implant-filled belly.`);
							} else {
								r.push(`${slave.slaveName}'s t-shirt covers only the top of ${his} implant-filled belly.`);
							}
							break;
						case "a slutty outfit":
							r.push(`${slave.slaveName}'s implant-filled belly really shows how big of a slut ${he} is.`);
							break;
						case "a slave gown":
							r.push(`${slave.slaveName}'s slave gown is carefully tailored, giving ${him} a sensual motherly look as it carefully caresses ${his} implant-filled belly.`);
							break;
						case "slutty business attire":
							r.push(`${slave.slaveName}'s implant-filled belly strains the buttons of ${his} suit jacket and blouse.`);
							break;
						case "nice business attire":
							r.push(`${slave.slaveName}'s implant-filled belly looks good in ${his} specially tailored blouse and jacket.`);
							break;
						case "harem gauze":
							r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} implant-filled belly.`);
							break;
						case "a comfortable bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a slutty nurse outfit":
							r.push(`${slave.slaveName}'s jacket barely closes over ${his} implant-filled belly leaving its buttons threatening to pop.`);
							break;
						case "a schoolgirl outfit":
							r.push(`${slave.slaveName}'s blouse rides up ${his} implant-filled belly, leaving ${him} looking particularly slutty.`);
							break;
						case "a kimono":
							r.push(`${slave.slaveName}'s implant-filled belly is demurely covered by ${his} kimono.`);
							break;
						case "a hijab and abaya":
						case "a niqab and abaya":
							r.push(`${slave.slaveName}'s abaya is filled out by ${his} implant-filled belly.`);
							break;
						case "a klan robe":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s robe, thanks to ${his} implant-filled belly.`);
							break;
						case "a burqa":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s burqa, thanks to ${his} implant-filled belly.`);
							break;
						case "a nice pony outfit":
						case "a slutty pony outfit":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s pony outfit, thanks to ${his} implant-filled belly.`);
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
							r.push(`${slave.slaveName}'s outfit completely bares ${his} implant-filled belly.`);
							break;
						case "a one-piece swimsuit":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s swimsuit, thanks to ${his} implant-filled belly.`);
							break;
						case "a sweater":
						case "a sweater and cutoffs":
						case "a sweater and panties":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s sweater, thanks to ${his} implant-filled belly.`);
							break;
						case "a police uniform":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s uniform, thanks to ${his} implant-filled belly.`);
							break;
						case "a hanbok":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s hanbok, thanks to ${his} implant-filled belly.`);
							break;
						case "a gothic lolita dress":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s dress, thanks to ${his} implant-filled belly.`);
							break;
						case "a tank-top":
						case "a tank-top and panties":
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s tank-top, thanks to ${his} implant-filled belly.`);
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
							r.push(`There is a slight roundness to the middle of ${slave.slaveName}'s shirt, thanks to ${his} implant-filled belly.`);
							break;
						case "a Santa dress":
							r.push(`The belt on ${slave.slaveName}'s dress has been loosened to accommodate the significant bulge of ${his} implant-filled belly.`);
							break;
						case "a burkini":
							r.push(`${slave.slaveName}'s burkini bulges significantly from ${his} implant-filled belly.`);
							break;
						case "a hijab and blouse":
							r.push(`${slave.slaveName}'s skirt is slightly pushed down by ${his} implant-filled belly.`);
							break;
						case "battledress":
							r.push(`${slave.slaveName}'s tank top rides up ${his} implant-filled belly leaving ${him} looking like someone who had too much fun on shore leave.`);
							break;
						case "a halter top dress":
							r.push(`${slave.slaveName}'s beautiful halter top dress is filled by ${his} implant-filled belly. ${His} popped navel prominently pokes through the front of ${his} dress.`);
							break;
						case "a ball gown":
							r.push(`${slave.slaveName}'s fabulous silken ball gown is tailored to not only fit ${his} implant-filled belly but draw attention to it.`);
							break;
						case "slutty jewelry":
							r.push(`${slave.slaveName}'s bangles include a long thin chain that rests above ${his} popped navel.`);
							break;
						case "a leotard":
							r.push(`${slave.slaveName}'s tight leotard shows off every kick and movement within ${his} implant-filled belly. The material tightly clings to ${his} popped navel.`);
							break;
						case "a monokini":
							r.push(`${slave.slaveName}'s implant-filled belly pushes down the fabric of ${his} monokini down somewhat.`);
							break;
						case "overalls":
							if (slave.boobs > (slave.belly + 250)) {
								r.push(`${slave.slaveName}'s huge breasts push out ${his} overalls so far that ${his} implant-filled belly is left uncovered.`);
							} else {
								r.push(`${slave.slaveName}'s overalls are significantly curved by ${his} implant-filled belly.`);
							}
							break;
						case "an apron":
							r.push(`${slave.slaveName}'s apron is filled out by ${his} implant-filled belly.`);
							break;
						case "a cybersuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a tight Imperial bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} implant-filled belly, prominently displaying ${his} popped navel.`);
							break;
						case "a chattel habit":
							r.push(`The strip of cloth running down ${his} front is parted to one side by ${his} implant-filled belly.`);
							break;
						case "a bunny outfit":
							r.push(`${slave.slaveName}'s teddy is stretched out by ${his} implant-filled belly. ${His} popped navel prominently pokes through the material.`);
							break;
						case "spats and a tank top":
							if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s implant-filled belly is obscured by ${his} huge tits.`);
							} else if (slave.boobs > 1200) {
								r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} implant-filled belly by ${his} breasts, allowing it to slightly obscure ${his} spats from view.`);
							} else {
								r.push(`${slave.slaveName}'s top can't entirely cover ${his} implant-filled belly, allowing it to slightly obscure ${his} spats from view.`);
							}
							break;
						case "a bimbo outfit":
							r.push(`${slave.slaveName}'s miniskirt rests at the base of ${his} implant-filled belly.`);
							break;
						case "a courtesan dress":
							r.push(`${slave.slaveName}'s implant-filled belly is carefully caressed by the ribs of ${his} corset.`);
							break;
						default:
					}
					if (V.arcologies[0].FSTransformationFetishist !== "unset") {
						r.push(`Your transformation fetishizing society is fascinated by ${his} unusual implant.`);
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
						case "a Fuckdoll suit":
							r.push(`${slave.slaveName}'s fat belly is cruelly squeezed by the suit.`);
							break;
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
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s fat belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt struggles to cover ${his} fat belly. The bottom of which peeks out from under it.`);
							} else {
								r.push(`${slave.slaveName}'s fat belly is covered by ${his} uniform's jacket. The bottom of which just barely peeks out from under it.`);
							}
							break;
						case "a schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s fat belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt struggles to cover ${his} fat belly. The bottom of which peeks out from under it.`);
							} else {
								r.push(`${slave.slaveName}'s fat belly is covered by ${his} uniform's jacket. The bottom of which just barely peeks out from under it.`);
							}
							break;
						case "a slutty schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s fat belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s shirt struggles to cover ${his} fat belly. The bottom of which peeks out from under it.`);
							} else {
								r.push(`${slave.slaveName}'s fat belly is covered by ${his} uniform's jacket. The bottom of which just barely peeks out from under it.`);
							}
							break;
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
						case "battlearmor":
							r.push(`${slave.slaveName}'s armor tightly clings to ${his} fat belly.`);
							break;
						case "Imperial Plate":
							r.push(`${slave.slaveName}'s armor tightly clings to ${his} fat belly.`);
							break;
						case "lederhosen":
							r.push(`${slave.slaveName}'s tunic tightly clings to ${his} fat belly, clearly showing every fold and roll.`);
							break;
						case "a mounty outfit":
							r.push(`${slave.slaveName}'s tunic tightly clings to ${his} fat belly, clearly showing every fold and roll.`);
							break;
						case "a long qipao":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} fat belly, clearly showing every fold and roll.`);
							break;
						case "a dirndl":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} fat belly, clearly showing every fold and roll.`);
							break;
						case "a biyelgee costume":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} fat belly, clearly showing every fold and roll.`);
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
							r.push(`${slave.slaveName}'s scalemail bikini exposes ${his} fat belly.`);
							break;
						case "striped panties":
							r.push(`${slave.slaveName}'s cute panties expose ${his} fat belly.`);
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
							r.push(`${slave.slaveName}'s robe is filled out by ${his} fat belly.`);
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
								r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} fat belly by ${his} breasts, allowing it to hang loose and obscure ${his} spats from view.`);
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
				} else if (slave.bellyImplant >= 2000) {
					if (slave.bellyAccessory === "an extreme corset") {
						r.push(`${slave.slaveName}'s implant-rounded belly is tightly compressed by ${his} corset causing ${his} distress.`);
					} else if ((slave.bellyAccessory === "a corset")) {
						r.push(`${slave.slaveName}'s implant-rounded belly comfortably rounds out ${his} corset.`);
					}
					switch (slave.clothes) {
						case "a Fuckdoll suit":
							r.push(`${slave.slaveName}'s implant-rounded belly nearly requires ${him} to be switched into a suit with a hole for it to hang out from.`);
							break;
						case "conservative clothing":
							if (slave.boobs > 20000) {
								r.push(`${slave.slaveName}'s immense breasts keep ${his} oversized sweater from covering ${his} implant-rounded belly, though they do a fine job of hiding it themselves.`);
							} else if (slave.boobs > 10000) {
								r.push(`${slave.slaveName}'s implant-rounded belly is hidden by ${his} massive tits and oversized sweater.`);
							} else if (slave.boobs > 8000) {
								r.push(`${slave.slaveName}'s oversized breasts keep ${his} sweater far from ${his} implant-rounded belly.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s sweater bulges with ${his} implant-rounded belly.`);
							} else {
								r.push(`${slave.slaveName}'s blouse bulges with ${his} implant-rounded belly.`);
							}
							break;
						case "attractive lingerie for a pregnant woman":
							r.push(`${slave.slaveName}'s implant-rounded belly rests above ${his} silken panties. ${His} silken vest sensually frames ${his} swollen belly.`);
							break;
						case "a maternity dress":
							r.push(`${slave.slaveName}'s implant-rounded belly is noticeable under ${his} loose dress. ${His} dress is specially tailored to be modest yet draw attention to ${his} swollen middle.`);
							break;
						case "stretch pants and a crop-top":
							r.push(`${slave.slaveName}'s implant-rounded belly takes full advantage of ${his} exposed midriff to bulge freely.`);
							break;
						case "chains":
							r.push(`${slave.slaveName}'s implant-rounded belly is tightly wrapped with chains.`);
							break;
						case "Western clothing":
							r.push(`${slave.slaveName}'s flannel shirt bulges with ${his} implant-rounded belly.`);
							break;
						case "body oil":
							r.push(`${slave.slaveName}'s implant-rounded belly is covered in a sheen of oil.`);
							break;
						case "a toga":
							r.push(`${slave.slaveName}'s implant-rounded belly gently bulges under ${his} toga.`);
							break;
						case "a huipil":
							r.push(`${slave.slaveName}'s implant-rounded belly slightly bulges under ${his} huipil.`);
							break;
						case "a slutty qipao":
							r.push(`${His} qipao is slit up the side. The front is pushed out by ${his} implant-rounded belly.`);
							break;
						case "uncomfortable straps":
							r.push(`${slave.slaveName}'s slave outfit's straining straps press into ${his} implant-rounded belly.`);
							break;
						case "shibari ropes":
							r.push(`${slave.slaveName}'s implant-rounded belly is tightly bound with rope, flesh bulges from between them.`);
							break;
						case "a latex catsuit":
						case "restrictive latex":
							r.push(`${slave.slaveName}'s implant-rounded belly greatly bulges under ${his} latex suit.`);
							break;
						case "a military uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-rounded belly is obscured by ${his} massive tits.`);
								break;
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s undershirt covers ${his} implant-rounded belly.`);
							} else {
								r.push(`${slave.slaveName}'s uniform covers ${his} implant-rounded belly.`);
							}
							break;
						case "a schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-rounded belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s undershirt covers ${his} implant-rounded belly.`);
							} else {
								r.push(`${slave.slaveName}'s uniform covers ${his} implant-rounded belly.`);
							}
							break;
						case "a slutty schutzstaffel uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-rounded belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s undershirt covers ${his} implant-rounded belly.`);
							} else {
								r.push(`${slave.slaveName}'s uniform covers ${his} implant-rounded belly.`);
							}
							break;
						case "a red army uniform":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-rounded belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s undershirt covers ${his} implant-rounded belly.`);
							} else {
								r.push(`${slave.slaveName}'s uniform covers ${his} implant-rounded belly.`);
							}
							break;
						case "a nice nurse outfit":
							if (slave.boobs > 6000) {
								r.push(`${slave.slaveName}'s implant-rounded belly is obscured by ${his} massive tits.`);
							} else if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s nurse outfit could be called conservative, if it could cover more than half of ${his} breasts; ${his} implant-rounded belly is completely exposed.`);
							} else {
								r.push(`${slave.slaveName}'s nurse outfit is almost conservative, it covers ${his} implant-rounded belly completely.`);
							}
							break;
						case "a mini dress":
							r.push(`${slave.slaveName}'s mini dress tightly clings to ${his} implant-rounded belly.`);
							break;
						case "battlearmor":
							r.push(`${slave.slaveName}'s armor tightly clings to ${his} implant-rounded belly.`);
							break;
						case "Imperial Plate":
							r.push(`${slave.slaveName}'s armor tightly clings to ${his} implant-rounded belly.`);
							break;
						case "a mounty outfit":
							r.push(`${slave.slaveName}'s tunic tightly clings to ${his} implant-rounded belly.`);
							break;
						case "lederhosen":
							r.push(`${slave.slaveName}'s tunic tightly clings to ${his} implant-rounded belly.`);
							break;
						case "a long qipao":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} implant-rounded belly.`);
							break;
						case "a dirndl":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} implant-rounded belly.`);
							break;
						case "a biyelgee costume":
							r.push(`${slave.slaveName}'s dress tightly clings to ${his} implant-rounded belly.`);
							break;
						case "attractive lingerie":
							r.push(`${slave.slaveName}'s implant-rounded belly rests above ${his} lacy g-string.`);
							break;
						case "kitty lingerie":
							r.push(`${slave.slaveName}'s implant-rounded belly rests above ${his} silk panties.`);
							break;
						case "a succubus outfit":
							r.push(`${slave.slaveName}'s implant-rounded belly peeks out of ${his} corset, which is laced above and below it.`);
							break;
						case "a slutty maid outfit":
							r.push(`${slave.slaveName}'s maid dress is slightly distended by ${his} implant-rounded belly.`);
							break;
						case "a nice maid outfit":
							r.push(`${slave.slaveName}'s maid dress is almost conservative, it covers ${his} implant-rounded belly completely.`);
							break;
						case "a fallen nuns habit":
							r.push(`${slave.slaveName}'s latex habit's corset struggles to hold ${his} implant-rounded belly.`);
							break;
						case "a penitent nuns habit":
							r.push(`${slave.slaveName}'s habit gently bulges from ${his} implant-rounded belly. The coarse cloth aggravates ${his} sensitive skin.`);
							break;
						case "a string bikini":
							r.push(`${slave.slaveName}'s implant-rounded belly juts out between the strings of ${his} bikini.`);
							break;
						case "a scalemail bikini":
							r.push(`${slave.slaveName}'s implant-rounded belly juts out underneath ${his} bikini.`);
							break;
						case "striped panties":
							r.push(`${slave.slaveName}'s implant-rounded belly juts out above ${his} panties.`);
							break;
						case "clubslut netting":
							r.push(`${slave.slaveName}'s clubslut netting clings to ${his} implant-rounded belly.`);
							break;
						case "a cheerleader outfit":
							r.push(`${slave.slaveName}'s cheerleader top gently bulges from ${his} implant-rounded belly displaying how slutty this cheerleader is.`);
							break;
						case "cutoffs and a t-shirt":
							if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s implant-rounded belly is obscured by ${his} huge tits.`);
							} else if (slave.boobs > 2000) {
								r.push(`${slave.slaveName}'s tits keep ${his} t-shirt far from ${his} implant-rounded belly.`);
							} else {
								r.push(`${slave.slaveName}'s t-shirt bulges with ${his} implant-rounded belly. The bottom of which is beginning to peek from under ${his} T-shirt.`);
							}
							break;
						case "a slutty outfit":
							r.push(`${slave.slaveName}'s implant-rounded belly shows how big of a slut ${he} is.`);
							break;
						case "a slave gown":
							r.push(`${slave.slaveName}'s slave gown is carefully tailored, giving ${him} a sensual look as it carefully caresses ${his} implant-rounded belly.`);
							break;
						case "slutty business attire":
							r.push(`${slave.slaveName}'s implant-rounded belly bulges ${his} suit jacket and blouse. It peeks out from under their bottom slightly.`);
							break;
						case "nice business attire":
							r.push(`${slave.slaveName}'s implant-rounded belly bulges under ${his} tailored blouse and jacket.`);
							break;
						case "harem gauze":
							r.push(`${slave.slaveName}'s harem girl outfit sensually accentuates ${his} implant-rounded middle.`);
							break;
						case "a comfortable bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} implant-rounded belly, displaying ${his} swollen body.`);
							break;
						case "a slutty nurse outfit":
							r.push(`${slave.slaveName}'s jacket bulges with ${his} implant-rounded belly, which can be seen peeking out from underneath.`);
							break;
						case "a schoolgirl outfit":
							r.push(`${slave.slaveName}'s blouse bulges with ${his} implant-rounded belly. It peeks out from the bottom leaving ${him} looking particularly slutty.`);
							break;
						case "a kimono":
							r.push(`${slave.slaveName}'s implant-rounded belly is demurely covered by ${his} kimono.`);
							break;
						case "a hijab and abaya":
						case "a niqab and abaya":
							r.push(`${slave.slaveName}'s abaya bulges with ${his} implant-rounded belly.`);
							break;
						case "a klan robe":
							r.push(`${slave.slaveName}'s robe is filled out by ${his} implant-swollen belly.`);
							break;
						case "a burqa":
							r.push(`${slave.slaveName}'s burqa is filled out by ${his} implant-swollen belly.`);
							break;
						case "a nice pony outfit":
						case "a slutty pony outfit":
							r.push(`${slave.slaveName}'s pony outfit is rounded out by ${his} implant-swollen belly.`);
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
							r.push(`${slave.slaveName}'s outfit completely bares ${his} implant-swollen belly.`);
							break;
						case "a one-piece swimsuit":
							r.push(`${slave.slaveName}'s swimsuit is rounded out by ${his} implant-swollen belly.`);
							break;
						case "a sweater":
						case "a sweater and cutoffs":
						case "a sweater and panties":
							r.push(`${slave.slaveName}'s sweater is rounded out by ${his} implant-swollen belly.`);
							break;
						case "a police uniform":
							r.push(`${slave.slaveName}'s uniform is rounded out by ${his} implant-swollen belly.`);
							break;
						case "a hanbok":
							r.push(`${slave.slaveName}'s hanbok gently bulges from ${his} implant-swollen belly.`);
							break;
						case "a gothic lolita dress":
							r.push(`${slave.slaveName}'s dress gently bulges from ${his} implant-swollen belly.`);
							break;
						case "a tank-top":
						case "a tank-top and panties":
							r.push(`${slave.slaveName}'s tank-top gently bulges from ${his} implant-swollen belly.`);
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
							r.push(`${slave.slaveName}'s shirt covers most of ${his} implant-swollen belly.`);
							break;
						case "a Santa dress":
							r.push(`The belt of ${slave.slaveName}'s dress lies atop the gentle bulge of ${his} implant-rounded belly.`);
							break;
						case "a burkini":
							r.push(`${slave.slaveName}'s burkini gently bulges from ${his} implant-rounded belly.`);
							break;
						case "a hijab and blouse":
							r.push(`${slave.slaveName}'s blouse and skirt bulge from ${his} implant-rounded belly.`);
							break;
						case "battledress":
							r.push(`${slave.slaveName}'s tank top covers the top of ${his} implant-rounded belly leaving ${him} looking like someone who had too much fun on shore leave.`);
							break;
						case "a halter top dress":
							r.push(`${slave.slaveName}'s beautiful halter top dress bulges with ${his} implant-rounded belly.`);
							break;
						case "a ball gown":
							r.push(`${slave.slaveName}'s fabulous silken ball gown is tailored to draw attention to ${his} rounded middle.`);
							break;
						case "slutty jewelry":
							r.push(`${slave.slaveName}'s bangles include a long thin chain that rests across ${his} implant-rounded belly.`);
							break;
						case "a leotard":
							r.push(`${slave.slaveName}'s tight leotard shows off ${his} implant-rounded belly.`);
							break;
						case "a monokini":
							r.push(`${slave.slaveName}'s monokini is filled out by ${his} implant-rounded belly.`);
							break;
						case "overalls":
							if (slave.boobs > (slave.belly + 250)) {
								r.push(`${slave.slaveName}'s large breasts push out ${his} overalls so far that ${his} implant-rounded belly is left uncovered.`);
							} else {
								r.push(`${slave.slaveName}'s implant-rounded belly rounds out the front of ${his} overalls.`);
							}
							break;
						case "an apron":
							r.push(`${slave.slaveName}'s apron is rounded out by ${his} implant-rounded belly.`);
							break;
						case "a cybersuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} implant-rounded belly, displaying ${his} swollen body.`);
							break;
						case "a tight Imperial bodysuit":
							r.push(`${slave.slaveName}'s bodysuit tightly clings to ${his} implant-rounded belly, displaying ${his} swollen body.`);
							break;
						case "a chattel habit":
							r.push(`The strip of cloth running down ${his} front is pushed out by ${his} implant-rounded belly.`);
							break;
						case "a bunny outfit":
							r.push(`${slave.slaveName}'s teddy bulges with ${his} implant-rounded belly.`);
							break;
						case "spats and a tank top":
							if (slave.boobs > 4000) {
								r.push(`${slave.slaveName}'s fat belly is obscured by ${his} huge tits.`);
							} else if (slave.boobs > 1200) {
								r.push(`${slave.slaveName}'s top is prevented from trying to cover ${his} implant-rounded belly by ${his} breasts.`);
							} else {
								r.push(`${slave.slaveName}'s top bulges with ${his} implant-rounded belly, which peeks out from the bottom.`);
							}
							break;
						case "a bimbo outfit":
							r.push(`${slave.slaveName}'s miniskirt keeps sliding down ${his} implant-rounded belly.`);
							break;
						case "a courtesan dress":
							r.push(`${slave.slaveName}'s corset bulges with ${his} implant-rounded belly.`);
							break;
						default:
					}
					if (V.arcologies[0].FSTransformationFetishist !== "unset") {
						r.push(`Your transformation fetishizing society is fascinated by ${his} unusual implant.`);
					}
				}
			} else {
				r.push(`${slave.slaveName}'s belly is bare and ready for surgery.`);
			}
		}

		return r.join(" ");
	}

	function navel() {
		const r = [];
		if (slave.navelPiercing === 1) {
			r.push(`${His} navel bears a simple stud.`);
		} else if (slave.navelPiercing === 2) {
			r.push(`${His} navel is pierced with a big ring.`);
			if (slave.bellyImplant >= 16000) {
				r.push(`It has a heavy bell dangling from it.`);
			} else if ((slave.clothes === "slutty jewelry")) {
				r.push(`It has a length of gilded chain dangling from it.`);
			} else {
				r.push(`It has a short length of chain dangling from it.`);
			}
		}
		return r.join(" ");
	}

	function tattoo() {
		const r = [];
		// Belly tat
		if (slave.bellyTat !== 0) {
			if (slave.bellyImplant >= 32000) {
				if (slave.bellyTat === "a heart") {
					r.push(`A heart is tattooed around ${his} popped navel, though it is barely recognizable so stretched by ${his} titanic implant-filled middle.`);
				} else if (slave.bellyTat === "a star") {
					r.push(`A star is tattooed around ${his} popped navel, though it is barely recognizable so stretched by ${his} titanic implant-filled pregnancy middle.`);
				} else if (slave.bellyTat === "a butterfly") {
					r.push(`A butterfly is tattooed around ${his} popped navel, though it is barely recognizable so stretched by ${his} titanic implant-filled pregnancy middle.`);
				}
			} else if (slave.bellyImplant >= 16000) {
				if (slave.bellyTat === "a heart") {
					r.push(`A heart is tattooed around ${his} popped navel, though it is rather stretched by ${his} enormous implant-filled middle.`);
				} else if (slave.bellyTat === "a star") {
					r.push(`A star is tattooed around ${his} popped navel, though it is rather stretched by ${his} enormous implant-filled middle.`);
				} else if (slave.bellyTat === "a butterfly") {
					r.push(`A butterfly is tattooed around ${his} popped navel, though it is rather stretched by ${his} enormous implant-filled middle.`);
				}
			} else if (slave.bellyImplant >= 8000) {
				if (slave.bellyTat === "a heart") {
					r.push(`A heart is tattooed around ${his} popped navel, only to be truly seen when ${he} appears full-term.`);
				} else if (slave.bellyTat === "a star") {
					r.push(`A star is tattooed around ${his} popped navel, only to be truly seen when ${he} appears full-term.`);
				} else if (slave.bellyTat === "a butterfly") {
					r.push(`A butterfly is tattooed around ${his} popped navel, only to be truly seen when ${he} appears full-term.`);
				}
			} else if (slave.bellyImplant >= 4000) {
				r.push(`${He} has a barely recognizable tattoo around ${his} navel, it should reveal itself fully once ${he} is a little bigger.`);
			} else if (slave.bellyImplant >= 2000) {
				r.push(`${He} has an unrecognizable tattoo around ${his} navel, it has stretched slightly along with ${his} rounded middle.`);
			} else {
				r.push(`${He} has an unrecognizable tattoo scrunched around ${his} navel.`);
			}
		}

		if (slave.birthsTat > 0) {
			if (slave.birthsTat > 1) {
				r.push(`${He} has a series of ${slave.birthsTat} baby-shaped tattoos adorning ${his} stomach; one for each successful`);
				if (slave.pregKnown === 1) {
					r.push(`pregnancy and a temporary one for ${his} current pregnancy.`);
				} else {
					r.push(`pregnancy.`);
				}
			} else {
				r.push(`${He} has a single baby-shaped`);
				if (slave.pregKnown === 1) {
					r.push(`tattoo, and one temporary one,`);
				} else {
					r.push(`tattoo`);
				}
				r.push(`adorning ${his} stomach.`);
			}
		} else if (slave.birthsTat === 0 && slave.abortionTat === -1 && slave.pregKnown === 1) {
			r.push(`${He} has a single baby-shaped temporary tattoo adorning ${his} stomach.`);
		}
		if (slave.abortionTat > 0) {
			if (slave.abortionTat > 1) {
				r.push(`${He} has a series of ${slave.abortionTat} crossed out baby-shaped`);
				if (slave.pregKnown === 1) {
					r.push(`tattoos, and one uncrossed one,`);
				} else {
					r.push(`tattoos`);
				}
				r.push(`adorning ${his} stomach; one for each pregnancy ${he}'s failed to complete.`);
			} else {
				r.push(`${He} has a single crossed out, baby-shaped tattoo`);
				if (slave.pregKnown === 1) {
					r.push(`tattoo, and one uncrossed one,`);
				} else {
					r.push(`tattoo`);
				}
				r.push(`adorning ${his} stomach.`);
			}
		} else if (slave.abortionTat === 0 && slave.birthsTat === -1 && slave.pregKnown === 1) {
			r.push(`${He} has a single baby-shaped temporary tattoo adorning ${his} stomach.`);
		}

		if (slave.breedingMark === 1) {
			if (V.propOutcome === 1) {
				r.push(`The Societal Elites' mark designating ${him} as a breeder is prominently displayed across ${his} lower belly, beneath ${his} navel.`);
			} else {
				r.push(`An alluring tattoo is prominently displayed across ${his} lower belly, beneath ${his} navel, urging ${him} to be bred.`);
			}
		}

		return r.join(" ");
	}

	function age() {
		const r = [];
		if (slave.physicalAge >= 13) {
			if (slave.bellyImplant >= 31000) {
				if (canWalk(slave)) {
					r.push(`${His} middle is so massive that it is difficult for ${him} to move.`);
					if (slave.muscles > 95) {
						r.push(`However, ${he} is so powerfully built that ${he} can manage it with effort, using ${his} arms to support it.`);
					} else if (slave.muscles > 30) {
						r.push(`${He} can barely manage to get to ${his} feet unaided, and usually walks with ${his} arms under ${his} belly to help take its weight.`);
					} else if (slave.muscles > 5) {
						r.push(`${He} requires assistance to get to ${his} feet, and tends to lean on things to help relieve the weight.`);
					} else {
						r.push(`${He} cannot get to ${his} feet unaided, and tries to stay seated as much as ${he} can.`);
					}
				} else if (tooBigBelly(slave)) {
					r.push(`It is easily as large as ${his} torso, making ${him} at least half belly.`);
				} else {
					r.push(`It is easily as large as ${his} torso, making ${him} at least half belly.`);
				}
				if (slave.bellyImplant >= 16000) {
					if (V.pregAccessibility === 1) {
						r.push(`Fortunately for ${him}, the penthouse is adapted for daily life with a belly`);
					} else {
						if (market) {
							r.push(`${He}'ll have`);
						} else {
							r.push(`${He} has`);
						}
						r.push(`trouble living in your penthouse, which is not designed for ${girl}s with bellies`);
					}
					r.push(`wider than a standard doorway.`);
				}
			}
		} else if (slave.physicalAge >= 4) {
			if (slave.bellyImplant >= 14000) {
				if (canWalk(slave)) {
					r.push(`${His} middle is so massive that it is difficult for ${him} to move.`);
					if (slave.muscles > 95) {
						r.push(`However, ${he} is so powerfully built that ${he} can manage it with effort, using ${his} arms to support it.`);
					} else if (slave.muscles > 30) {
						r.push(`${He} can barely manage to get to ${his} feet unaided, and usually walks with ${his} arms under ${his} belly to help take its weight.`);
					} else if (slave.muscles > 5) {
						r.push(`${He} requires assistance to get to ${his} feet, and tends to lean on things to help relieve the weight.`);
					} else {
						r.push(`${He} cannot get to ${his} feet unaided, and tries to stay seated as much as ${he} can.`);
					}
				} else if (tooBigBelly(slave)) {
					r.push(`It is easily bigger than ${he} is, making ${him} mostly belly.`);
				} else {
					r.push(`It is easily as large as ${his} torso, making ${him} at least half belly.`);
				}
				if (slave.bellyImplant >= 16000) {
					if (V.pregAccessibility === 1) {
						r.push(`Fortunately for ${him}, the penthouse is adapted for daily life with a belly`);
					} else {
						if (market) {
							r.push(`${He}'ll have`);
						} else {
							r.push(`${He} has`);
						}
						r.push(`trouble living in your penthouse, which is not designed for ${girl}s with bellies`);
					}
					r.push(`wider than a standard doorway.`);
				}
			}
		} else if (slave.physicalAge < 4) {
			if (slave.bellyImplant >= 10000) {
				if (canWalk(slave)) {
					r.push(`${His} middle is so massive that it is difficult for ${him} to move.`);
					if (slave.muscles > 95) {
						r.push(`However, ${he} is so powerfully built that ${he} can manage it with effort, using ${his} arms to support it.`);
					} else if (slave.muscles > 30) {
						r.push(`${He} can barely manage to get to ${his} feet unaided, and usually walks with ${his} arms under ${his} belly to help take its weight.`);
					} else if (slave.muscles > 5) {
						r.push(`${He} requires assistance to get to ${his} feet, and tends to lean on things to help relieve the weight.`);
					} else {
						r.push(`${He} cannot get to ${his} feet unaided, and tries to stay seated as much as ${he} can.`);
					}
				} else if (tooBigBelly(slave)) {
					r.push(`It easily dwarfs ${him}, making ${him} almost entirely belly.`);
				} else {
					r.push(`It is easily as large as ${his} torso, making ${him} at least half belly.`);
				}
				if (slave.bellyImplant >= 16000) {
					if (V.pregAccessibility === 1) {
						r.push(`Fortunately for ${him}, the penthouse is adapted for daily life with a belly`);
					} else {
						if (market) {
							r.push(`${He}'ll have`);
						} else {
							r.push(`${He} has`);
						}
						r.push(`trouble living in your penthouse, which is not designed for ${girl}s with bellies`);
					}
					r.push(`wider than a standard doorway.`);
				}
			}
		}
		return r.join(" ");
	}
};
