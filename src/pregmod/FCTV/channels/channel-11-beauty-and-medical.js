// cSpell:ignore exfoliants, maca

/**
 * @file channel-11-beauty-and-medical.js - FCTV Channel 11: Beauty & Medical
 *
 * Health, beauty, and medical enhancement channel featuring infomercials,
 * cosmetic procedures, health products, and medical innovations.
 */

App.Data.FCTV.channels.set(11, {
	loop: true,
	episode: [
		{
			get slaves() {
				const array = [];
				if (S.Concubine) {
					array.push(S.Concubine);
				}
				return array;
			},
			get text() {
				const r = [];
				const {He = '', he = '', him = '', his = '', himself = ''} = S.Concubine ? getPronouns(S.Concubine) : {};
				const {title: Master = ''} = canTalk(S.Concubine) ? getEnunciation(S.Concubine) : {};
				let position = false;

				if (FCTV.channelCount(11, 1, 'gt')) {
					r.push(`, once again,`);
				}
				r.push(`which is currently showing an infomercial attempting to sell a product named "sag-B-gone" that claims to be able to prevent breasts from naturally sagging under their own weight.<p>`);
				if (V.purchasedSagBGone === 1) {
					r.push(`You've already made the mistake of ordering the sham of a product. While it gave you a great excuse to fondle breasts, it's not like you needed one in the first place.</p>`);
					if (S.Concubine && S.Concubine.fetish !== Fetish.MINDBROKEN && canTalk(S.Concubine) && (canSee(S.Concubine) || canHear(S.Concubine))) {
						r.push(
							`<p>`,
							Spoken(S.Concubine, `"I told you it wouldn't work, ${Master}. Plus you know you can touch these anytime!"`),
							`${S.Concubine.slaveName} shakes ${his} chest at you.</p>`
						);
					}
				} else {
					if (FCTV.channelCount(11, 1, 'gt')) {
						r.push(`You could always order a crate to play around with. Who knows, maybe it'll actually work?`);
						if (V.PC.dick !== 0) {
							r.push(`At the very least it should make for some decent lubricant for a titfuck.`);
						}
					} else {
						r.push(`You could always order a crate to play around with. Who knows, maybe it'll actually work?`);
						if (V.PC.dick !== 0) {
							r.push(`At the very least it should make for some decent lubricant for a titfuck.`);
						}
						if (S.Concubine && S.Concubine.fetish !== Fetish.MINDBROKEN && (canSee(S.Concubine) || canHear(S.Concubine))) {
							r.push(`</p><p>`);
							if (S.Concubine.boobs >= 25000) {
								r.push(S.Concubine.slaveName);
								if (hasAnyArms(S.Concubine)) {
									r.push(`pats`);
								} else {
									r.push(`wobbles`);
								}
								r.push(`${his} lap-filling breasts before chuckling.`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `<p>"Is it even possible to tell if these are saggy?"</p>`));
								} else {
									r.push(`<p>Clearly ${he} thinks ${his} tits are too big to tell if they're saggy or not.</p>`);
								}
							} else if (S.Concubine.boobs > 2000 && S.Concubine.boobShape === BreastShape.SAGGY) {
								r.push(S.Concubine.slaveName);
								if (hasAnyArms(S.Concubine)) {
									r.push(`hefts`);
								} else {
									r.push(`shakes`);
								}
								r.push(`${his} breasts and lets them flop back into their usual saggy position.`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `<p>"Far too late for these ladies. I doubt it will work though, products like that never do."</p>`));
								} else {
									r.push(`<p>${He} sighs doubtfully.</p>`);
								}
							} else if (S.Concubine.boobs > 2000) {
								r.push(`${S.Concubine.slaveName} massages ${his} big breasts.<p>`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `"I doubt it will work, but if you're looking for an excuse, you don't need one!"`));
								} else {
									r.push(`${He} scoffs at the commercial and clearly expresses ${his} doubt before puffing out ${his} chest at you.`);
								}
								r.push(`</p><p>${He} leans into you so ${his} bust flops into your lap.</p>`);
								position = true;
							} else {
								r.push(S.Concubine.slaveName);
								if (hasAnyArms(S.Concubine)) {
									r.push(`cups`);
								} else {
									r.push(`considers`);
								}
								r.push(`${his} breasts.</p><p>`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `"What a joke. I'm sure it doesn't work, plus don't you think they are lovely enough already, ${Master}?"`));
								} else {
									r.push(`${He} scoffs with doubt before proudly sticking out ${his} chest.`);
								}
								r.push(`</p><p>${He} bounces ${his} tits for you. You'll have to agree with ${him}; not a bit of sag to them.`);
							}
							if (V.PC.boobs >= 300 && V.PC.boobShape === BreastShape.SAGGY) {
								r.push(`${He} slides closer to you, coming in low and planting a kiss on your nipple.</p><p>`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `"Oh ${Master}, if only we heard about this sooner." ${He} sighs, before popping your nipple into ${his} mouth and starting to suck.</p>`));
								} else {
									r.push(`${He} sighs in pity over your saggy tits before starting to suck on your nipple.</p>`);
								}
								r.push(`You appreciate the attention, but you wish ${he} wouldn't call so much attention to your ${canTalk(S.Concubine) ? "sagging" : "defeated"} breasts.`);
							} else if (V.PC.boobs >= 200000 && V.PC.boobsImplant === 0) {
								r.push(`${He} returns to using your breast as a lounge.</p><p>`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `"${Master}, does their shape really matter when they're essentially furniture? No matter what you do, they're just going to be, well, everywhere."</p>`));
								} else {
									r.push(`${He} sinks in deeper, kneading the supple flesh in all directions. Is ${he} calling your couch-like tits shapeless?</p>`);
								}
								r.push(`<p>You pretend to take that as a slight and flip over, completely burying ${him} under your other boob with the intent to force ${him} to beg for mercy. Instead, ${he} opts to call it a night and enjoy the warm titflesh enveloping ${his} body.</p>`);
							} else if (V.PC.boobs >= 70000 && V.PC.boobsImplant === 0) {
								r.push(`${He} returns to using your breast as a pillow.</p><p>`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `"${Master}, does their shape really matter when they can only be described as a pile? It's not like you can lift them up, right?"</p>`));
								} else {
									r.push(`${He} snuggles in deeper, kneading the supple flesh in all directions. Is ${he} calling your beanbag tits shapeless?</p>`);
								}
								r.push(`<p>You pretend to take that as a slight and flip over, smothering ${him} with your other boob and forcing ${him} to beg for mercy. Only when ${he} has lavished attention on every ${V.showInches === 2 ? "inch" : "centimeter"} of your endless bosom do you let ${him} go.</p>`);
							} else if (V.PC.boobs >= 25000 && V.PC.boobsImplant === 0) {
								r.push(`${He} ${position ? "shifts upright" : "leans over"}, resting ${his} head on your monstrous tit, before angling ${himself} to give it a kiss.</p><p>`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `"When you sit with them in your lap like that, ${Master}, does it matter their shape? They just kind of spill everywhere..."</p>`));
									r.push(`${He} gives ${his} pillow a nuzzling, causing your breastflesh to engulf ${his} face.`);
								} else {
									r.push(`You think ${he}'s trying to say that ${he}'d love them even it they were saggy.</p>`);
								}
								r.push(`<p>You take that as an open invitation and throw the covers over the two of you so you can have a little fun before bed.</p>`);
							} else if (V.PC.boobs >= 10000 && V.PC.boobsImplant === 0) {
								r.push(`${He} slides closer to you,`);
								if (hasAnyArms(S.Concubine)) {
									if (hasBothArms(S.Concubine)) {
										r.push(`cups the undersides of your immense breasts`);
									} else {
										r.push(`cup the underside of an immense breast`);
									}
									r.push(`and buries ${his} face into your cleavage.</p><p>`);
								} else {
									r.push(`pushing ${his} face into the valley between your immense breasts.</p><p>`);
								}
								if (canTalk(S.Concubine)) {
									r.push(`${He} pokes ${his} head up through the ravine as your tits plop to its sides.`);
									r.push(Spoken(S.Concubine, `"Oh ${Master}! Look at that landslide of flesh! If I didn't know better, I'd assume YOU might need it!"</p>`));
									r.push(`Giggling to ${himself}, ${he} goes back to motorboating you.`);
								} else {
									if (canSee(S.Concubine)) {
										r.push(`${He} looks up at you as your tits comically plop to either side of ${his} head.</p>`);
									} else {
										r.push(`${He} pushes ${his} head up between them, allowing your tits to comically plop to either side of ${his} head.</p>`);
									}
									r.push(`${He}'s calling you saggy!`);
								}
								r.push(`<p>You take that as an open invitation and throw the covers over the two of you so you can have a little fun before bed.</p>`);
							} else if (V.PC.boobs >= 1400 && V.PC.boobsImplant === 0) {
								r.push(`${He} slides closer to you,`);
								if (hasAnyArms(S.Concubine)) {
									r.push(`wraps`);
									if (hasBothArms(S.Concubine)) {
										r.push(`an`);
									} else {
										r.push(`${his}`);
									}
									r.push(`arm around your back, and grabs`);
								} else {
									r.push(`pushing ${his} head against`);
								}
								r.push(`your huge breasts.</p><p>`);
								if (canTalk(S.Concubine)) {
									r.push(Spoken(S.Concubine, `"Oh ${Master}! It feels like YOU might need it!"</p>`));
								} else {
									r.push(`${He} nuzzles further into your rack.</p>`);
								}
								if (hasAnyArms(S.Concubine)) {
									r.push(`${He} jiggles your boobs in ${his}`);
									if (hasBothArms(S.Concubine)) {
										r.push(`hands.`);
									} else {
										r.push(`hand.`);
									}
								}
								if (!canTalk(S.Concubine)) {
									r.push(`${He}'s calling you saggy!`);
								}
								r.push(`<p>You take that as an open invitation and throw the covers over the two of you so you can have a little fun before bed.</p>`);
							}
						} else if (V.PC.boobs >= 300 && V.PC.boobShape === BreastShape.SAGGY) {
							r.push(`You trace a breast down towards its nipple. Yep, too late for something like this to be helpful.`);
						} else if (V.PC.boobs >= 25000 && V.PC.boobsImplant === 0) {
							r.push(`You pat your immense breasts. You're not sure it would even be noticeable if the cream worked or not on a rack the size of yours; and that's not to mention the cost of how much it would take to cover them...`);
						} else if (V.PC.boobs >= 1400 && V.PC.boobsImplant === 0) {
							r.push(`You cup your huge breasts. They're pretty large and you swear they've been drooping a little lately; maybe you could benefit from this cream...`);
						}
					}
					r.push(`</p><div id="called">`);
					r.push(App.UI.link(
						"Place an order",
						() => {
							V.purchasedSagBGone = 1;
							cashX(forceNeg(Math.trunc(50 * V.upgradeMultiplierTrade)), "PCmedical");
							jQuery("#called").empty().append('Your order should arrive by next week. If the advertisement is to be believed, all you need to do is rub the cream into your breasts several times a day and it will ward off sagging.');
						}
					));
					r.push(`<i>This will cost ${cashFormat(Math.trunc(50 * V.upgradeMultiplierTrade))}</i></div>`);
				}

				return r.join(" ");
			}
		},
	]
});

