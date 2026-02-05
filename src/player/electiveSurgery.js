// cSpell: ignore Ohmagosh

/**
 * Player surgery UI + surgery links
 */
App.UI.electiveSurgery = function() {
	const el = document.createElement("div");
	const {
		HeU, He,
		heU, hisU, himU, himselfU,
		girlU
	} = getNonlocalPronouns(V.seeDicks === 100 ? 100 : 0).appendSuffix("U");

	const arcology = V.arcologies[0];
	let freebie = 0;

	// half for a visual, half to keep track of asset variations
	// important notes are boobs, butt, belly, and dick
	const nurse = baseSlave();
	if (V.racialAttractivenessBonus === 2 || FutureSocieties.isActive("FSSupremacist")) {
		if (arcology.FSSupremacistRace !== 0) {
			nurse.race = arcology.FSSupremacistRace;
		} else if (V.continent === "South America") {
			nurse.race = "latina";
		} else if (V.continent === "the Middle East") {
			nurse.race = "middle eastern";
		} else if (V.continent === "Africa") {
			nurse.race = "black";
		} else if (V.continent === "Asia" || V.continent === "Japan") {
			nurse.race = "asian";
		} else if (V.continent === "Southern Europe") {
			nurse.race = "southern european";
		} else {
			nurse.race = "white";
		}
	} else {
		nurse.race = "white";
	}
	nurse.devotion = 100;
	nurse.trust = 100;
	if (["asian", "semitic", "southern european", "white"].includes(nurse.race)) {
		nurse.skin = "light";
	} else {
		nurse.skin = "brown";
	}
	if (FutureSocieties.isActive('FSHedonisticDecadence', arcology)) {
		nurse.weight = 60;
	} else {
		nurse.weight = -30;
	}
	nurse.waist = -60;
	if (FutureSocieties.isActive('FSPhysicalIdealist', arcology)) {
		nurse.muscles = 20;
	}
	if (FutureSocieties.isActive('FSSlimnessEnthusiast', arcology)) {
		nurse.boobs = 300;
	} else {
		nurse.boobs = 2000;
		if (FutureSocieties.isActive('FSAssetExpansionist', arcology)) {
			nurse.boobs = 10000;
		}
		if (FutureSocieties.isActive('FSTransformationFetishist', arcology)) {
			nurse.boobs = 10000;
			nurse.boobsImplant = 9800;
		} else if (!FutureSocieties.isActive('FSBodyPurist', arcology)) {
			nurse.boobsImplant = nurse.boobs - 1000;
		}
	}
	nurse.boobShape = "perky";
	if (FutureSocieties.isActive('FSPastoralist', arcology)) {
		nurse.lactation = 2;
	}
	nurse.hips = 1;
	if (FutureSocieties.isActive('FSSlimnessEnthusiast', arcology)) {
		nurse.butt = 1;
	} else {
		nurse.butt = 4;
		if (FutureSocieties.isActive('FSAssetExpansionist', arcology)) {
			nurse.butt = 8;
			nurse.buttImplant = 4;
		}
		if (arcology.FSGenderRadicalistLawFuta === 1) {
			nurse.dick = 3;
			nurse.balls = 2;
		} else if (arcology.FSGenderRadicalistLawFuta === 3) {
			nurse.butt = 12;
			nurse.hips = 3;
		}
		if (FutureSocieties.isActive('FSTransformationFetishist', arcology)) {
			nurse.buttImplant = nurse.butt-2;
		} else if (!FutureSocieties.isActive('FSBodyPurist', arcology)) {
			nurse.buttImplant = 2;
		}
	}
	nurse.lips = 60;
	nurse.lipsImplant = 40;
	nurse.hLength = 20;
	nurse.hStyle = "bun";
	nurse.hColor = "black";
	nurse.eye.left.iris = "brown";
	nurse.eye.right.iris = "brown";
	if (FutureSocieties.isActive('FSIntellectualDependency', arcology)) {
		nurse.clothes = "a slutty nurse outfit";
	} else {
		nurse.clothes = "a nice nurse outfit";
	}
	if (V.pSurgery.nursePreg > 0) {
		nurse.preg = V.pSurgery.nursePreg;
		nurse.pregType = 1;
		SetBellySize(nurse);
	}

	if (V.pSurgery.state > 1) {
		App.Events.addParagraph(el, [
			`You arrive at your favorite plastic surgeon for your appointment to find them as busy as ever, but you find yourself quickly directed into an exam room by their jealous assistant. ${(nurse.butt > 10 || nurse.belly >= 10000) ? `The ponderous ${girlU} squeezes in after you and starts` : `${HeU} gets right to the point in`} stripping you down, measuring you and making sure you are healthy enough for surgery${(nurse.butt > 10 || nurse.belly >= 5000 || nurse.boobs > 2000) ? `; it's actually kind of impressive just how well ${heU}'s managing to avoid brushing ${hisU} lewd body against you` : ""}. "What can we help you with today?"`
		]);
	} else if (V.pSurgery.state > 0) {
		App.Events.addParagraph(el, [
			`You arrive at your favorite plastic surgeon for your appointment to find them as busy as ever, but you find yourself ${(nurse.butt > 10 || nurse.belly >= 10000) ? "directed" : "quickly hurried"} into an exam room by their ${nurse.boobs > 2000 ? "busty" : "cute"} assistant. ${(nurse.butt > 10 || nurse.belly >= 10000) ? `The ponderous ${girlU} squeezes in after you and starts` : `${HeU} wastes no time`} stripping you down, measuring you and making sure you are healthy enough for surgery, all the while not so subtly running ${hisU} hands across ${nurse.belly >= 5000 ? `your body and pushing ${hisU} baby bump into` : "every part of"} you. ${V.pSurgery.disloyal ? "...I can tell you've had surgery done by someone other than us. And that's fine and all. It's just the 'happy ending' is a courtesy, you know? And I'm not sure I'm feeling it anymore. Well then, what surgery you want?" : "So, what can I help you with?"}"`
		]);
		if (V.pSurgery.disloyal) {
			V.pSurgery.state = 2;
		}
	} else {
		App.Events.addParagraph(el, [
			`You ${canWalk(V.PC) ? "wander" : "drive"} up and down ${arcology.name}'s primary medical pavilion, taking in what practices are available and their relative popularity. ${FutureSocieties.isActive('FSBodyPurist', arcology) ? "Most of the plastic surgeons have packed up and left, but of those that chose to stay," : "While there is no shortage of plastic surgeons to choose from,"} there is a clear winner; the small suite at the end of the wing completely swarmed by patrons. It takes some effort to work your way through the crowd, but the moment the ${nurse.boobs > 2000 ? "busty" : "cute"} assistant behind the counter notices you and ${nurse.belly >= 10000 ? "waddles" : "rushes"} over${nurse.butt > 10 ? `, practically bulldozing ${himselfU} a path in the process with ${hisU} absurd hips and rear` : ""}, do you find yourself whisked away to an exam room by ${himU}. "${V.PC.visualAge < V.minimumSlaveAge ? "Oh my god! You're so cute! Does your mother know you're here? If she doesn't, your secret's safe with us!" : "You're the new owner, right? Recognized you from the newsfeeds"}. Anyway, we'll need to do a few measurements, take some biometrics, and sign a couple papers before we can put you under the knife. You know, standard business and all that." With the paperwork taken care of, and after what can only be called an "intimate fondlng" under the guise of a medical examination${nurse.butt > 10 || nurse.belly >= 5000 || nurse.boobs > 2000 ? `, with a little helping of ${hisU} larger assets rubbing against you on the side` : ""}, you're ready to look over the available procedures. ${nurse.butt > 10 || nurse.belly >= 5000 || nurse.boobs > 2000 ? `"Heh, yeah I can get a little handsy, and feeling all of this," ${heU} gestures at ${hisU} enhanced curves, "pushing against someone is just soo thrilling!` : `"Heh, yeah I can get a little handsy.`} I think that's part of why we're so popular, not that any of the doctors' work is shabby or anything! I mean, I came out okay, right? Plus I really do enjoy seeing what they can come up with, it's an art form, really, and boy does it get me excited." ${HeU} coughs and gets back to the heart of the matter. "You have a dream body, and we have the means to make it happen! So, what can I help you with?"`
		]);
		App.Events.addParagraph(el, [
			`"Oh! I almost forgot! Since you're a new client, <span class="green">today's basic surgery is half off!</span>${FutureSocieties.isActive('FSBodyPurist', arcology) ? ` But, <span class="red">the cost of implants is still high</span> due to policy, unfortunately...` : FutureSocieties.isActive('FSTransformationFetishist', arcology) ? ` And with <span class="green">implants being so cheap,</span> we're practically giving them away!` : ""}"`
		]);
		freebie = 1;
		V.pSurgery.state = 1;
	}
	if (V.pSurgery.state > 1) {
		if (FutureSocieties.isActive('FSBodyPurist', arcology)) {
			App.Events.addParagraph(el, [
				`"Oh, and thanks to your leadership, I <span class="red">can't get reasonably priced implants anymore.</span> So thanks for that."`
			]);
		} else if (FutureSocieties.isActive('FSTransformationFetishist', arcology)) {
			App.Events.addParagraph(el, [
				`"Oh, and you should know that we have an abundance of implants being made, so <span class="green">they're quite cheap</span> these days. So thanks, I guess..."`
			]);
		}
	} else if (V.pSurgery.state > 0) {
		if (FutureSocieties.isActive('FSBodyPurist', arcology)) {
			App.Events.addParagraph(el, [
				`"Ah! And you should be aware that there is an implant shortage <span class="red">driving up their price.</span> I guess that's just how things are these days..."`
			]);
		} else if (FutureSocieties.isActive('FSTransformationFetishist', arcology)) {
			App.Events.addParagraph(el, [
				`"Oh, and we're overflowing with implants, as if you couldn't tell, so <span class="green">they're really cheap!</span> I know I'm going to get some more put in soon!"`
			]);
		}
	}

	const tabBar = new App.UI.Tabs.TabBar("ElectiveSurgery");
	tabBar.addTab("Head", "head", headGroup());
	tabBar.addTab("Body", "body", bodyGroup());
	tabBar.addTab("Breasts", "boobs", boobsGroup());
	tabBar.addTab("Belly", "belly", bellyGroup());
	tabBar.addTab("Butt", "butt", butt());
	tabBar.addTab("Genitals", "junk", genitalsGroup());
	tabBar.addTab("Sex Change", "genderswap", sexType());
	el.append(tabBar.render());

	return el;

	/**
	 * @param {number} price the price to be potential discounted
	 * @param {boolean} [implant] should be true if it is an implant being discounted
	 * @returns {number} discounted price
	 */
	function applyDiscount(price, implant = false) {
		if (freebie === 1) {
			price *= .5;
		}
		if (implant) {
			if (FutureSocieties.isActive('FSBodyPurist', arcology)) {
				price *= 2;
			} else if (FutureSocieties.isActive('FSTransformationFetishist', arcology)) {
				price *= .5;
			}
		}
		price = Math.trunc(price);
		return price;
	}

	/**
	 * Fills out the tab for facial surgery
	 */
	function headGroup() {
		const el = new DocumentFragment();
		el.append(face());
		App.Events.addParagraph(el, [``]);
		el.append(voice());
		App.Events.addParagraph(el, [``]);
		el.append(lips());
		App.Events.addParagraph(el, [``]);
		if (!["baby", "mixed", "removable", "straightening braces"].includes(V.PC.teeth)) {
			el.append(teeth());
			App.Events.addParagraph(el, [``]);
		}
		el.append(ears());
		App.Events.addParagraph(el, [``]);
		el.append(horns());
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their facial features (younger or older, facial beauty)
	 */
	function face() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"${V.PC.face < -10 ? 'Hmm, yeah, that face needs some serious work.' : 'Your face is nice, but surely we can make it even better.'}" ${heU} states coldly. "<span class="cash">${cashFormat(applyDiscount(5000))}</span> for a face lift, <span class="cash">${cashFormat(applyDiscount(12000))}</span> for aesthetic improvements. Also can't recommend changing your eyes, face shape or skin color; some security systems get real uppity over things like that. Though I s'pose race and hair can fall under that as well, but hey, we don't handle racial surgery and this isn't a hair salon, so nothing to blame on us, right? Unlike whatever other surgeons you've been seeing, I can promise you that none of our work will cause your systems to fail to recognize you."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"You sure you want to mess with that${V.PC.face < -10 ? ', um, unique' : ' lovely'} face?" ${heU} teases, caressing your cheek. "<span class="cash">${cashFormat(applyDiscount(5000))}</span> for a face lift, <span class="cash">${cashFormat(applyDiscount(12000))}</span> for aesthetic improvements. Also wouldn't recommend changing your eyes, face shape or skin color; some security systems get real uppity over things like that. Though I s'pose race and hair can fall under that as well, but hey, we don't handle racial surgery and this isn't a hair salon, so nothing to worry about, right? Yes, I'm certain your systems will recognize you after we finish working on you — give us some credit."`
			], "div");
		}
		if (V.PC.faceImplant >= 100) {
			r.push(`Your face has been <span class="intro question">completely reworked,</span> again and again.`);
		} else if (V.PC.faceImplant >= 65) {
			r.push(`Your face has been <span class="intro question">heavily reworked.</span>`);
		} else if (V.PC.faceImplant >= 35) {
			r.push(`Your face has seen <span class="intro question">noticeable work.</span>`);
		} else if (V.PC.faceImplant >= 15) {
			r.push(`Your face has seen a <span class="intro question">little work.</span>`);
		} else if (V.PC.faceImplant > 0) {
			r.push(`"Hmm, I don't think we apply another surgery while still keeping it secret that you've had work done."`);
			App.Events.addNode(el, r, "div");
			r = [];
		} else {
			r.push(`${HeU} says with pride, "Yes, I think we can slip a surgery in without anyone being able to tell."`);
			App.Events.addNode(el, r, "div");
			r = [];
		}
		if (V.PC.faceImplant > 95) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`${HeU} sighs, "I don't think it can take any more. I'm sorry."`);
		} else {
			r.push(`You're <span class="intro question">${V.PC.actualAge} years old.</span>`);
			if (V.PC.ageImplant !== 0) {
				if (V.PC.visualAge !== V.PC.actualAge) {
					r.push(`You've had surgery to make yourself <span class="lime">look ${V.PC.ageImplant > 0 ? 'older' : 'younger'}.</span>`);
					if ((V.PC.ageImplant > 0 && V.PC.visualAge > V.PC.actualAge) || (V.PC.ageImplant < 0 && V.PC.visualAge < V.PC.actualAge)) {
						linkArray.push(surgeryLink("Undo Facial surgery", "restoreFace", () => {
							healthDamage(V.PC, 10);
							V.PC.ageImplant = 0;
							V.PC.visualAge = V.PC.physicalAge;
							cashX(forceNeg(applyDiscount(5000)), "PCmedical");
						}));
					} else {
						r.push(`You've managed to undo most of it yourself, though. ${HeU} chimes in, "Which means we can't really undo it either."`);
					}
					if (V.PC.ageImplant > 0) {
						linkArray.push(surgeryLink("Make yourself look even older", "ageUp", () => {
							healthDamage(V.PC, 10);
							V.PC.faceImplant = Math.min(V.PC.faceImplant + 5, 100);
							cashX(forceNeg(applyDiscount(5000)), "PCmedical");
						}));
					} else {
						linkArray.push(surgeryLink(`${V.PC.visualAge < 35 ? 'Make yourself look even younger' : 'Get another face lift'}`, "ageDown", () => {
							healthDamage(V.PC, 10);
							V.PC.faceImplant = Math.min(V.PC.faceImplant + 5, 100);
							cashX(forceNeg(applyDiscount(5000)), "PCmedical");
						}));
					}
				}
			} else {
				if (V.PC.visualAge >= 65 || V.PC.visualAge >= 50) {
					r.push(`You could benefit from a face lift.`);
				} else if (V.PC.visualAge >= 35) {
					r.push(`You could go for a face lift, though making yourself look older could be useful.`);
				} else {
					r.push(`You could undergo facial surgery to make yourself look older${(V.PC.visualAge >= 25) ? ", though you could also make yourself look even younger" : ""}.`);
				}
				if (V.PC.visualAge >= 25) {
					linkArray.push(surgeryLink(`${V.PC.visualAge < 35 ? 'Remodel your face to appear younger' : 'Get a face lift'}`, "ageDown", () => {
						healthDamage(V.PC, 10);
						V.PC.faceImplant = Math.min(V.PC.faceImplant + 5, 100);
						cashX(forceNeg(applyDiscount(5000)), "PCmedical");
					}));
				}
				linkArray.push(surgeryLink("Remodel your face to appear older", "ageUp", () => {
					healthDamage(V.PC, 10);
					V.PC.faceImplant = Math.min(V.PC.faceImplant + 5, 100);
					cashX(forceNeg(applyDiscount(5000)), "PCmedical");
				}));
			}
			if (V.PC.face < 100) {
				let faceLink = "Get your face touched up";
				if (V.PC.face > 95) {
					r.push(`Your face is <span class="intro question">nearly flawless.</span>`);
					faceLink = "Fix that";
				} else if (V.PC.face > 40) {
					r.push(`Your face is <span class="intro question">gorgeous.</span>`);
				} else if (V.PC.face > 10) {
					r.push(`Your face is <span class="intro question">very attractive.</span>`);
				} else if (V.PC.face >= -10) {
					r.push(`Your face is <span class="intro question">attractive.</span>`);
				} else if (V.PC.face >= -40) {
					r.push(`Your face <span class="intro question">isn't very pleasant.</span>`);
				} else if (V.PC.face >= -95) {
					r.push(`Your face is <span class="intro question">hard to look at.</span>`);
					faceLink = "Get your face fixed";
				} else {
					r.push(`<span class="intro question">You try not to look at your face if you can help it.</span>`);
					faceLink = "Get your face fixed";
				}
				linkArray.push(surgeryLink(faceLink, "faceUp", () => {
					healthDamage(V.PC, 10);
					V.PC.faceImplant = Math.min(V.PC.faceImplant + 10, 100);
					cashX(forceNeg(applyDiscount(12000)), "PCmedical");
				}));
			}
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their voice towards feminine
	 */
	function voice() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"${perceivedGender(V.PC) >= 0 && V.PC.voice === 1 ? `Yeah, no. That voice needs to go. It's just not right coming out of you.` : `If you think your voice is too high or too low, we can fix it.`}" ${heU} states, "and it's a quick procedure too, in and out. You'll have a sore throat for a bit, but I'm just going to keep my mouth shut and not get myself into trouble again." ${HeU} quickly changes the topic, "It costs <span class="cash">${cashFormat(applyDiscount(4000))}</span> to lengthen vocal cords for a deeper voice and <span class="cash">${cashFormat(applyDiscount(2500))}</span> to shorten them up for a softer one."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"${perceivedGender(V.PC) >= 0 && V.PC.voice === 1 ? `That voice of yours does not go with your looks, but we can help with that!` : `Find your voice too shrill or too deep? We can fix that!`}" ${heU} exclaims, "and it's a pretty easy procedure too, no scarring or anything! Well, maybe a sore throat for a bit, but you don't strike me as the type concerned with that sort of thing. I know it would get in the way of my work," ${heU} clams up for a moment, flushing, "but nevermind that! It costs <span class="cash">${cashFormat(applyDiscount(4000))}</span> to lengthen vocal cords for a deeper voice and  <span class="cash">${cashFormat(applyDiscount(2500))}</span> to shorten them up for a softer one."`
			], "div");
		}
		if (!canTalk(V.PC)) {
			r.push(`"But there isn't really a point if you don't talk, is there?"`);
		} else if (V.PC.electrolarynx) {
			r.push(`"But you have a robot voicebox, don't you? We're surgeons, not mechanics!"`);
		} else if (V.PC.voice === 2) {
			r.push(`You have a <span class="intro question">soft, feminine voice.</span>`);
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"Which means it's right in that area that we can't really do anything with, sorry. I mean we could, but it would be a complete remodel and a lot more invasive. Special case, in other words."`);
		} else {
			if (V.PC.voice === 3) {
				r.push(`You have a <span class="intro question">very high, girly voice.</span>`);
				App.Events.addNode(el, r, "div");
				r = [];
				r.push(`"It tends to make people not take you seriously..."`);
			} else if (V.PC.voice === 1) {
				r.push(`You have a <span class="intro question">deep, masculine voice.</span>`);
			}
			if (V.PC.voiceImplant !== 0) {
				if (V.PC.voiceImplant === 1) {
					linkArray.push(surgeryLink("Restore your voice", "restoreVoice", () => {
						healthDamage(V.PC, 5);
						V.PC.voiceImplant = 0;
						V.PC.voice = 1;
						cashX(forceNeg(applyDiscount(4000)), "PCmedical");
					}));
				} else {
					linkArray.push(surgeryLink("Restore your voice", "restoreVoice", () => {
						healthDamage(V.PC, 5);
						V.PC.voiceImplant = 0;
						V.PC.voice = 3;
						cashX(forceNeg(applyDiscount(2500)), "PCmedical");
					}));
				}
			} else if (V.PC.voice === 1 || V.PC.voice === 3) {
				if (V.PC.voice === 1) {
					linkArray.push(surgeryLink("Shorten your vocal cords", "voiceFeminine", () => {
						healthDamage(V.PC, 5);
						V.PC.voiceImplant = 1;
						V.PC.voice = 2;
						cashX(forceNeg(applyDiscount(2500)), "PCmedical");
					}));
				} else {
					linkArray.push(surgeryLink("Lengthen your vocal cords", "voiceLessGirly", () => {
						healthDamage(V.PC, 5);
						V.PC.voiceImplant = -1;
						V.PC.voice = 2;
						cashX(forceNeg(applyDiscount(4000)), "PCmedical");
					}));
				}
			}
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their lips size
	 */
	function lips() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"Not everyone loves having luscious lips as much as I do, and trust me, I'd go bigger if it wouldn't get in the way of talking. It'll run you <span class="cash">${cashFormat(applyDiscount(2000))}</span> for a reduction, <span class="cash">${cashFormat(applyDiscount(7000, true))}</span> for a new pair of implants, and <span class="cash">${cashFormat(applyDiscount(1000, true))}</span> for implant filler."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`${HeU} puckers ${hisU} thick lips and blows you kiss. "Not everyone loves having luscious lips as much as I do, and trust me, I'd go bigger if it wouldn't get in the way of talking. It'll run you <span class="cash">${cashFormat(applyDiscount(2000))}</span> for a reduction, <span class="cash">${cashFormat(applyDiscount(7000, true))}</span> for a new pair of implants, <span class="cash">${cashFormat(applyDiscount(1000, true))}</span> for implant filler, and only <span class="cash">${cashFormat(applyDiscount(500))}</span> for draining."`
			], "div");
		}
		const lipImplantSize = V.PC.lipsImplant > 0 ? ` A pair of fillable implants makes up about <span class="intro question">${Math.floor((V.PC.lipsImplant / V.PC.lips) * 100)}%</span> of their size.` : ``;
		if (V.PC.lips > 95) {
			r.push(`You have <span class="intro question">oversized lips.</span>${lipImplantSize}`);
		} else if (V.PC.lips > 70) {
			r.push(`You have <span class="intro question">huge lips.</span>${lipImplantSize}`);
			if (V.PC.lips > 85) {
				App.Events.addNode(el, r, "div");
				r = [];
				r.push(`"If we make them any larger, they'll not really be moveable anymore. So no talking, reduced facial expressions; you'll pretty much only be good at making love with them."`);
				App.Events.addNode(el, r, "div");
				r = [];
			}
		} else if (V.PC.lips > 40) {
			r.push(`You have <span class="intro question">plump, kissable lips.</span>${lipImplantSize}`);
		} else if (V.PC.lips > 20) {
			r.push(`You have <span class="intro question">full lips.</span>${lipImplantSize}`);
		} else if (V.PC.lips > 10) {
			r.push(`You have <span class="intro question">normal lips.</span>${lipImplantSize}`);
		} else {
			r.push(`You have <span class="intro question">unattractively thin lips.</span>${lipImplantSize}`);
		}
		if (V.PC.lipsImplant > 0) {
			if (V.PC.lips > 95) {
				linkArray.push(App.UI.DOM.disabledLink("Have your implants filled", ["Your lips can't get any larger"]));
			} else {
				linkArray.push(surgeryLink("Have your implants filled", "lipEnlargement", () => {
					healthDamage(V.PC, 5);
					V.PC.lips += 10;
					V.PC.lipsImplant += 10;
					cashX(forceNeg(applyDiscount(1000, true)), "PCmedical");
				}));
			}
			if (V.PC.lipsImplant <= 10) {
				linkArray.push(App.UI.DOM.disabledLink("Have some filler removed", ["Your implants are as low as they can go without causing issues"]));
			} else {
				linkArray.push(surgeryLink("Have some filler removed", "lipReduction", () => {
					healthDamage(V.PC, 5);
					V.PC.lips -= 10;
					V.PC.lipsImplant -= 10;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			}
			linkArray.push(surgeryLink("Have your implants removed", "lipReduction", () => {
				healthDamage(V.PC, 10);
				V.PC.lips -= V.PC.lipsImplant;
				V.PC.lipsImplant = 0;
				cashX(forceNeg(applyDiscount(2000)), "PCmedical");
			}));
		} else {
			linkArray.push(surgeryLink("Get fillable lip implants", "lipEnlargementImplant", () => {
				healthDamage(V.PC, 10);
				V.PC.lips += 20;
				V.PC.lipsImplant += 20;
				cashX(forceNeg(applyDiscount(7000, true)), "PCmedical");
			}));
			if (V.PC.lips > 80) {
				App.Events.addNode(el, r, "div");
				r = [];
				r.push(`Taking note of the size of your lips, ${heU} adds, "We'll need to carve out a little room to insert them, just so you're aware."`);
			}
		}
		if (V.PC.lips === 0) {
			linkArray.push(App.UI.DOM.disabledLink("Have your lips reduced", ["You don't have any lip left"]));
		} else {
			linkArray.push(surgeryLink("Have your lips reduced", "lipReduction", () => {
				healthDamage(V.PC, 10);
				V.PC.lips -= 10;
				cashX(forceNeg(applyDiscount(2000)), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their ears
	 */
	function teeth() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"We have a wonderful dental and orthodontal pair working off the suite, you know," ${heU} says beeming you a smile, "that can fix any problems you might have with your teeth for around <span class="cash">${cashFormat(2000)},</span> and that includes removing braces in the future. Now, we've talked with them about cosmetic additions, and they're cool with it, but it'll cost you <span class="cash">${cashFormat(6000)}</span> for any exotic work done."`
		], "div");
		r.push(`You have <span class="intro question">`);
		if (V.PC.teeth === "normal") {
			r.push(`a flawless smile.`);
		} else if (V.PC.teeth === "crooked") {
			r.push(`crooked, mismatched teeth.`);
		} else if (V.PC.teeth === "gapped") {
			r.push(`a large gap between your front teeth.`);
		} else if (V.PC.teeth === "pointy") {
			r.push(`pointed, threatening teeth.`);
		} else if (V.PC.teeth === "fangs") {
			r.push(`a pair of fangs.`);
		} else if (V.PC.teeth === "fang") {
			r.push(`a singular fang.`);
		} else if (V.PC.teeth === "cosmetic braces") {
			r.push(`braces.`);
		}
		r.push(`</span>`);
		if (V.PC.teeth === "crooked" || V.PC.teeth === "gapped") {
			linkArray.push(surgeryLink("Get them straightened", "bracesOn", () => {
				V.PC.teeth = "straightening braces";
				cashX(forceNeg(2000), "PCmedical");
			}));
		} else if (V.PC.teeth === "cosmetic braces") {
			linkArray.push(surgeryLink("Have them taken off", "bracesOff", () => {
				V.PC.teeth = "normal";
			}));
		} else if (V.PC.teeth !== "normal") {
			linkArray.push(surgeryLink("Have them restored", "teeth", () => {
				healthDamage(V.PC, 20);
				V.PC.teeth = "normal";
				cashX(forceNeg(6000), "PCmedical");
			}));
		} else {
			linkArray.push(surgeryLink("Get cosmetic braces", "bracesOn", () => {
				V.PC.teeth = "cosmetic braces";
				cashX(forceNeg(2000), "PCmedical");
			}));
			linkArray.push(surgeryLink("Have them built into points", "teeth", () => {
				healthDamage(V.PC, 20);
				V.PC.teeth = "pointy";
				cashX(forceNeg(6000), "PCmedical");
			}));
			linkArray.push(surgeryLink("Have two replaced with fangs", "teeth", () => {
				healthDamage(V.PC, 20);
				V.PC.teeth = "fangs";
				cashX(forceNeg(6000), "PCmedical");
			}));
			linkArray.push(surgeryLink("Have one replaced with a fang", "teeth", () => {
				healthDamage(V.PC, 10);
				V.PC.teeth = "fang";
				cashX(forceNeg(6000), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their ears
	 */
	function ears() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"A surprising number of clients have requested some, ah, unusual changes being made to their ears. And you know what, I kinda get it, but still... Since it's not something we're practiced in, and not damaging your inner ear structure adds a bunch of complication, our current asking price is <span class="cash">${cashFormat(applyDiscount(8000))}</span> for an ear remodeling." ${HeU} quickly adds in, "Right, can't forget we only do humanoid ears. No animal ones. Anatomy goes a very long way in this business, you know?"`
		], "div");
		if (V.PC.earShape === "none" || V.PC.earShape === "holes") {
			r.push(`"We also can't make ears out of nothing. So moving on..."`);
		} else {
			r.push(`You have <span class="intro question">${V.PC.earShape === "damaged" ? " tattered" : `${V.PC.earShape}`} ears.</span>`);
			if (V.PC.earShape === "damaged") {
				linkArray.push(surgeryLink("Get them fixed", "earShape", () => {
					healthDamage(V.PC, 5);
					V.PC.earShape = "normal";
					cashX(forceNeg(applyDiscount(8000)), "PCmedical");
				}));
			} else if (V.PC.earShape !== "normal") {
				linkArray.push(surgeryLink("Have them restored", "earShape", () => {
					healthDamage(V.PC, 5);
					V.PC.earShape = "normal";
					cashX(forceNeg(applyDiscount(8000)), "PCmedical");
				}));
			}
			if (V.PC.earShape !== "pointy") {
				linkArray.push(surgeryLink("Get them reshaped to points", "earShape", () => {
					healthDamage(V.PC, 5);
					V.PC.earShape = "pointy";
					cashX(forceNeg(applyDiscount(8000)), "PCmedical");
				}));
			}
			if (V.PC.earShape !== "elven") {
				linkArray.push(surgeryLink("Get them reshaped to look elven", "earShape", () => {
					healthDamage(V.PC, 5);
					V.PC.earShape = "elven";
					cashX(forceNeg(applyDiscount(8000)), "PCmedical");
				}));
			}
			if (V.PC.earShape !== "orcish") {
				linkArray.push(surgeryLink("Get them reshaped to look like little orc ears", "earShape", () => {
					healthDamage(V.PC, 5);
					V.PC.earShape = "orcish";
					cashX(forceNeg(applyDiscount(8000)), "PCmedical");
				}));
			}
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player add and remove horns
	 */
	function horns() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"While we're on the subject of unusual modifications, what are your thoughts on horns? We could graft a pair onto your skull if you're into that sort of thing. The whole dom, sub dynamic isn't really my cup of tea, but the doms are starting to butt heads, sometimes literally, to get their hands on these intimidating pieces of work! They're pretty easy to get on, but you have to be careful with them for a bit cause they will be sore and you really do not want to bust one off. <span class="cash">${cashFormat(applyDiscount(6000, true))}</span> to have a horn customized and installed. A horn, one. I can't stress that enough. So <span class="cash">${cashFormat(applyDiscount(12000, true))}</span> for a set of them." ${HeU} almost moves on before realizing ${heU} forgot something, "<span class="cash">${cashFormat(applyDiscount(500))}</span> for a removal, and you'll need to have to old set removed before getting a new set installed. And it will hurt like hell, so we can't install the new ones right away either. You'll need to come back."`
		], "div");
		if (V.PC.horn !== "none") {
			r.push(`You have <span class="intro question">${V.PC.horn}</span> grafted to your skull.`);
			linkArray.push(surgeryLink("Remove them", "hornOff", () => {
				healthDamage(V.PC, 20);
				V.PC.horn = "none";
				cashX(forceNeg(applyDiscount(500)), "PCmedical");
			}));
		} else {
			linkArray.push(surgeryLink("Install succubus horns", "hornOn", () => {
				healthDamage(V.PC, 20);
				V.PC.horn = "curved succubus horns";
				cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
			}));
			linkArray.push(surgeryLink("Install backswept horns", "hornOn", () => {
				healthDamage(V.PC, 20);
				V.PC.horn = "backswept horns";
				cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
			}));
			linkArray.push(surgeryLink("Install cow horns", "hornOn", () => {
				healthDamage(V.PC, 20);
				V.PC.horn = "cow horns";
				cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
			}));
			linkArray.push(surgeryLink("Install an oni horn", "hornOn", () => {
				healthDamage(V.PC, 10);
				V.PC.horn = "one long oni horn";
				cashX(forceNeg(applyDiscount(6000, true)), "PCmedical");
			}));
			linkArray.push(surgeryLink("Install two oni horns", "hornOn", () => {
				healthDamage(V.PC, 20);
				V.PC.horn = "two long oni horns";
				cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
			}));
			linkArray.push(surgeryLink("Just get a pair of small ones", "hornOn", () => {
				healthDamage(V.PC, 20);
				V.PC.horn = "small horns";
				cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Fills out the tab for body surgery
	 */
	function bodyGroup() {
		const el = new DocumentFragment();
		el.append(weight());
		App.Events.addParagraph(el, [``]);
		el.append(shoulders());
		App.Events.addParagraph(el, [``]);
		el.append(hips());
		App.Events.addParagraph(el, [``]);
		if (V.PC.heels !== 0) {
			el.append(heels());
			App.Events.addParagraph(el, [``]);
		}
		el.append(skin());
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player get liposuction
	 */
	function weight() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"${V.PC.weight > 95 ? "Feeling a little fat lately? Can't see all of yourself in your mirror?" : "Starting to feel like your weight is creeping up on you?"} We can suck that flab right out of you for only <span class="cash">${cashFormat(applyDiscount(500))} a session,</span> or <span class="cash">${cashFormat(applyDiscount(1500))}</span> for a big drain and a skin tuck. You will be a little loose if we take out too much.`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"If being a BB${perceivedGender(V.PC) >= 0 ? `W` : `M`} isn't doing it for you or you just need a little help getting back on track, we can help you out with a little liposuction! Only <span class="cash">${cashFormat(applyDiscount(500))} a suck!</span> If we need to do a big drain, we'll have to trim the excess skin off of you. That'll cost <span class="cash">${cashFormat(applyDiscount(1500))}</span> to do."`
			], "div");
		}

		r.push(`You are <span class="intro question">`);
		if (V.PC.weight > 190) {
			r.push(`extremely obese.`);
		} else if (V.PC.weight > 160) {
			r.push(`very obese.`);
		} else if (V.PC.weight > 130) {
			r.push(`very fat.`);
		} else if (V.PC.weight > 95) {
			r.push(`fat.`);
		} else if (V.PC.weight > 30) {
			r.push(`overweight.`);
		} else if (V.PC.weight > 10) {
			r.push(`chubby.`);
		} else if (V.PC.weight >= -10) {
			r.push(`a healthy weight.`);
		} else if (V.PC.weight >= -30) {
			r.push(`thin.`);
		} else if (V.PC.weight >= -95) {
			r.push(`very thin.`);
		} else {
			r.push(`extremely thin.`);
		}
		r.push(`</span>`);
		if (V.PC.weight < 10) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"You've already got a trim body; I don't think we could ethically remove any more fat from you. Assuming there actually is any left in there."`);
		} else {
			if (V.PC.weight > 190) {
				linkArray.push(surgeryLink("Get major liposuction and an absurd skin tuck", "lipoFull", () => {
					healthDamage(V.PC, 40);
					V.PC.weight = 0;
					cashX(forceNeg(applyDiscount(1500)), "PCmedical");
				}));
			} else if (V.PC.weight > 130) {
				linkArray.push(surgeryLink("Get heavy liposuction and a major skin tuck", "lipoFull", () => {
					healthDamage(V.PC, 20);
					V.PC.weight = 0;
					cashX(forceNeg(applyDiscount(1500)), "PCmedical");
				}));
			} else if (V.PC.weight > 30) {
				linkArray.push(surgeryLink("Get liposuction and a skin tuck", "lipoFull", () => {
					healthDamage(V.PC, 10);
					V.PC.weight = 0;
					cashX(forceNeg(applyDiscount(1500)), "PCmedical");
				}));
			} else {
				linkArray.push(surgeryLink("Get liposuction", "lipoFull", () => {
					healthDamage(V.PC, 10);
					V.PC.weight = 0;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			}
			if (V.PC.weight > 60) {
				linkArray.push(surgeryLink("Have a bit of fat removed", "lipoSuck", () => {
					healthDamage(V.PC, 10);
					V.PC.weight -= 30;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			}
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player adjust the width of their shoulders
	 */
	function shoulders() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"We can adjust the width of your shoulders if you're feeling brave." ${HeU} shudders, "It's horribly painful, both shaving down and shortening the bones, and, since you won't expect it, anchoring the implants and getting used to the pressure being put on them. But you have to do what you have to do if you weren't gifted with the body you want, right? It'll run you <span class="cash">${cashFormat(applyDiscount(20000))}</span> for the procedure, materials, and lengthy recovery stay."`
		], "div");
		r.push(`You have<span class="intro question">`);
		if (V.PC.shoulders < -1) {
			r.push(`very narrow shoulders.`);
		} else if (V.PC.shoulders < 0) {
			r.push(`narrow shoulders.`);
		} else if (V.PC.shoulders > 1) {
			r.push(`very broad shoulders.`);
		} else if (V.PC.shoulders > 0) {
			r.push(`broad shoulders.`);
		} else {
			r.push(`normal shoulders.`);
		}
		r.push(`</span>`);
		if (V.PC.shouldersImplant > 0) {
			r.push(`You've already underwent surgery to widen them.`);
		} else if (V.PC.shouldersImplant < 0) {
			r.push(`You've already surgery to reduce them.`);
		}
		if (V.PC.shoulders < 2) {
			linkArray.push(surgeryLink(`Have them broadened${V.PC.shouldersImplant > 0 ? " further " : ""}`, "shouldersUp", () => {
				healthDamage(V.PC, 40);
				V.PC.shoulders++;
				V.PC.shouldersImplant++;
				cashX(forceNeg(applyDiscount(20000)), "PCmedical");
			}));
		}
		if (V.PC.shoulders > -2) {
			linkArray.push(surgeryLink(`Have them narrowed${V.PC.shouldersImplant < 0 ? " further" : ""}`, "shouldersDown", () => {
				healthDamage(V.PC, 40);
				V.PC.shoulders--;
				V.PC.shouldersImplant--;
				cashX(forceNeg(applyDiscount(20000)), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player adjust the width of their hips
	 */
	function hips() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"Same can be done to your hips too," ${HeU} adds, <span class="cash">"same price too."</span> ${HeU} clears ${hisU} throat before continuing, "It's easier in some ways, just padding out or shaving down the outer bit, and harder in others, adjusting the pelvic girdle... You're going to be sitting funny for a week, assuming you can even manage that much."`
		], "div");
		r.push(`You have<span class="intro question">`);
		if (V.PC.hips < -1) {
			r.push(`very narrow hips.`);
		} else if (V.PC.hips < 0) {
			r.push(`narrow hips.`);
		} else if (V.PC.hips > 2) {
			r.push(`absurdly wide hips.`);
		} else if (V.PC.hips > 1) {
			r.push(`very wide hips.`);
		} else if (V.PC.hips > 0) {
			r.push(`broad hips.`);
		} else {
			r.push(`normal hips.`);
		}
		r.push(`</span>`);
		if (V.PC.hips > 2) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`After a long pause, ${heU} finally speaks ${hisU} mind,  "I don't know who did your hips, but they did an impressive job... I'm sure there's a reason you're here and not with them for more surgery, but, no actually I shouldn't pry. But anyway, I don't think we can really work on them without causing you more harm than good. Sorry..."`);
		} else {
			if (V.PC.hipsImplant > 0) {
				r.push(`You've already underwent surgery to widen them.`);
			} else if (V.PC.hipsImplant < 0) {
				r.push(`You've already surgery to reduce them.`);
			}
			if (V.PC.hips < 2) {
				linkArray.push(surgeryLink(`Have them broadened${V.PC.shouldersImplant > 0 ? " further " : ""}`, "hipsUp", () => {
					healthDamage(V.PC, 50);
					V.PC.hips++;
					V.PC.hipsImplant++;
					cashX(forceNeg(applyDiscount(20000)), "PCmedical");
				}));
			}
			if (V.PC.hips > -2) {
				linkArray.push(surgeryLink(`Have them narrowed${V.PC.shouldersImplant < 0 ? " further" : ""}`, "hipsDown", () => {
					healthDamage(V.PC, 50);
					V.PC.hips--;
					V.PC.hipsImplant--;
					cashX(forceNeg(applyDiscount(20000)), "PCmedical");
				}));
			}
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player fix their cut tendons
	 */
	function heels() {
		const el = new DocumentFragment();
		const linkArray = [];
		App.Events.addNode(el, [
			`"So I noticed that your heels have been clipped, and no judgement if that's your thing, but if you wanted it fixed we can do it for <span class="cash">${cashFormat(applyDiscount(5000))}.</span> We don't supply new shoes though, but your old ones'll still work, right?"`
		], "div");
		linkArray.push(surgeryLink("Replace your achilles tendons", "fixHeels", () => {
			healthDamage(V.PC, 10);
			V.PC.heels = 0;
			cashX(forceNeg(applyDiscount(5000)), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their skin tone
	 */
	function skin() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"If you don't care for the color of your skin, we have a solution," ${heU} says, pulling a large tanning bed-like cart out of a closet. "<span class="cash">${cashFormat(applyDiscount(2000))}.</span> This thing just came out of testing. I assure you it doesn't cause cancer anymore! But still, mind your security systems. We won't be held accountable if you get arrested for trying to enter your penthouse." ${HeU} looks a little worrisome, "Now, there are some side effects, and we will have to keep you under special care for a few days. It's similar to a severe sunburn, across your entire body, all of it, even down there. Now don't give me that look, we have special ointments to soothe the pain but it's still gonna suck for you." You can tell ${heU} is being purposefully spiteful towards you. "Now all your typical skin tones are preprogrammed into it, and with a couple button presses... There! I unlocked the option for custom hues. Now this thing is going to recolor your skin pigment permanently, so you might want to take it seriously. It'll be all on you if you come out looking like a circus clown."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"Your skin is beautiful as is, but we can change it if you want," ${heU} says, pulling a large tanning bed-like cart out of a closet. "<span class="cash">${cashFormat(applyDiscount(2000))}.</span> This thing just came out of testing. I assure you it doesn't cause cancer anymore! But still, mind your security systems. We won't be held accountable if you get arrested for trying to enter your penthouse." ${HeU} looks a little worrisome, "Now, there are some side effects, and we will have to keep you under special care for a few days. It's similar to a severe sunburn, across your entire body, all of it, even down there. Now don't give me that look, we have special ointments to soothe the pain and have a little fun with." ${HeU} tosses you a wink alongside a hesitant giggle. "Now all your typical skin tones are preprogrammed into it, and with a couple button presses... There! I unlocked the option for custom hues. Now this thing is going to recolor your skin pigment permanently, so you might want to take it seriously. It'll all be on you if I choke with laughter ${(V.PC.dick !== 0) ? `sucking on your big polka-dotted cock` : `going down on your polka-dotted pussy`}!"`
			], "div");
		}

		r.push(`You have <span class="intro question">${V.PC.skin} skin.</span>`);
		if (V.PC.skin !== V.PC.origSkin) {
			r.push(`Your original skin tone was ${V.PC.origSkin}.`);
		}
		if (V.PC.markings !== "none") {
			r.push(`You could have completely clear skin...`);
			linkArray.push(surgeryLink("Fry your blemishes off", "skinMarkings", () => {
				healthDamage(V.PC, 30);
				V.PC.markings = "none";
				cashX(forceNeg(applyDiscount(2000)), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));

		const choiceDiv = document.createElement("div");
		/**
		 * @type {selectOption[]}
		 */
		const choices = [];
		if (V.PC.skin !== V.PC.origSkin) {
			choices.push({key: V.PC.origSkin, name: capFirstChar(`Restore natural ${V.PC.origSkin}`)});
		}
		for (const skin of [...App.Medicine.Modification.naturalSkins, ...App.Medicine.Modification.dyedSkins]) {
			choices.push({key: skin, name: capFirstChar(skin)});
		}

		const select = App.UI.DOM.makeSelect(choices, V.PC.skin, value => {
			healthDamage(V.PC, 30);
			V.PC.skin = value;
			cashX(forceNeg(applyDiscount(2000)), "PCmedical");
			showDegradation("skinTone");
		});

		choiceDiv.append(select, " or custom ", App.UI.DOM.makeTextBox(
			V.PC.skin, v => {
				healthDamage(V.PC, 30);
				V.PC.skin = v;
				cashX(forceNeg(applyDiscount(2000)), "PCmedical");
				showDegradation("skinTone");
			}
		));
		el.append(choiceDiv);
		return el;
	}

	/**
	 * Fills out the tab for breast surgery
	 */
	function boobsGroup() {
		const el = new DocumentFragment();
		el.append(breasts());
		App.Events.addParagraph(el, [``]);
		if (V.PC.boobs >= 300 && V.PC.breastMesh === 0) {
			el.append(breastShape());
			App.Events.addParagraph(el, [``]);
		}
		el.append(nippleShape());
		App.Events.addParagraph(el, [``]);
		el.append(areolae());
		if (V.PC.boobs >= 2000 && V.PC.boobsImplant === 0 && V.meshImplants === 1 && V.PC.breastMesh === 0) {
			App.Events.addParagraph(el, [``]);
			el.append(breastMesh());
		}
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their breast size
	 */
	function breasts() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			r.push(`"We do excellent breast work, if you couldn't tell," ${heU} teases, bouncing ${hisU} pair around alluringly. "Do you want a feel?" ${heU} asks, despite keeping them tantalizingly out of reach.`);
		} else {
			r.push(`"Maybe some breast work? I assure you they are lovely," ${heU} says as ${heU} brushes the back of your head with ${hisU} own pair.`);
		}
		if (V.PC.boobsImplant > 0) {
			if (V.PC.boobsImplantType === "string") {
				r.push(`"So your string implants, um, I hate to tell you this, but the left one is a little bigger. Lopsided." ${HeU} covers the last bit with a fake cough, before carrying on, "If you want to replace them with a brand new pair of modern implants, we'll do it for <span class="cash">${cashFormat(applyDiscount(10000, true))},</span> and if you insist on keeping those things, we could drain off some of the fluid for <span class="cash">${cashFormat(applyDiscount(500))}.</span> Still you should really get rid of those, they're terrible for your health. A quick <span class="cash">${cashFormat(applyDiscount(5000))}</span> and you'll never have to be irritated by them again.`);
			} else if (V.PC.boobsImplant < 800 && V.PC.boobsImplant >= 600) {
				r.push(`"<span class="cash">${cashFormat(applyDiscount(10000, true))}</span> to swap them out for a pair of fillables or <span class="cash">${cashFormat(applyDiscount(5000))}</span> to remove them entirely."`);
			} else if (V.PC.boobsImplant < 2200 && V.PC.boobsImplant >= 1800) {
				r.push(`"Your implants are at their limit, but we can fit you with even larger fillables for <span class="cash">${cashFormat(applyDiscount(10000, true))}.</span> Still <span class="cash">${cashFormat(applyDiscount(5000))}</span> for removal and <span class="cash">${cashFormat(applyDiscount(500))}</span> if you want to make them smaller."`);
			} else if (V.PC.boobsImplant < 11000 && V.PC.boobsImplant >= 10000 && FutureSocieties.researchAvailable("TransformationFetishist")) {
				r.push(`"Your implants may be at their limit, but why stop there? We can stuff some truly crazy fillables in there for <span class="cash">${cashFormat(applyDiscount(10000, true))}.</span> I think it'll be a while before we manage to completely fill those babies up. I don't know why you'd want to, but it's  <span class="cash">${cashFormat(applyDiscount(5000))}</span> to take yours out and <span class="cash">${cashFormat(applyDiscount(500))}</span> if you want to make them smaller."`);
			} else if (V.PC.boobsImplant >= 800) {
				r.push(`"<span class="cash">${cashFormat(applyDiscount(1000, true))}</span> for additional filler, <span class="cash">${cashFormat(applyDiscount(500))}</span> to drain to drain some out and <span class="cash">${cashFormat(applyDiscount(5000))}</span> to remove them entirely."`);
			} else {
				r.push(`"<span class="cash">${cashFormat(applyDiscount(10000, true))}</span> for the next size up and <span class="cash">${cashFormat(applyDiscount(5000))}</span> to pop them out."`);
			}
		} else {
			r.push(`"<span class="cash">${cashFormat(applyDiscount(5000))}</span> for a reduction, <span class="cash">${cashFormat(applyDiscount(10000, true))}</span> for implants, that includes size ups, and <span class="cash">${cashFormat(applyDiscount(15000))}</span> for additional breast tissue. That last one might as well be real!${(V.PC.boobs < 700) ? " With a little work, we can even remove a small amount of fat from your breasts to bring your cup size down without damaging their inner workings. Though we'll have to build them up some before we can stick reasonable implants into you." : ""}"`);
		}
		App.Events.addNode(el, r, "div");
		r = [];
		if (V.PC.breastMesh === 1) {
			r.push(`"But we can't really do anything to your breasts without damaging that tangle you've got going on in them."`);
		} else if (V.PC.boobs >= 300) {
			r.push(`You have <span class="intro question">`);
			r.push(App.Desc.boobBits.format("%ADJ %CUP breasts, each %VOLUME CCs.", V.PC.boobs));
			r.push(`</span>`);
			if (V.PC.boobsImplant > 0) {
				r.push(`About <span class="intro question">${Math.floor((V.PC.boobsImplant / V.PC.boobs) * 100)}% of their volume consists of your ${V.PC.boobsImplant} CC ${V.PC.boobsImplantType !== "normal" ? `${V.PC.boobsImplantType} ` : ``}implants.</span>`);
			}
			const isCrippled = "Your boobs are debilitating; it's not possible for you to walk while carrying their weight.";
			const almostCrippled = "Your body just can't support breasts of your size; if they get much bigger, you might not be able to walk anymore.";
			const isProblem = "Your boobs are large enough to impede your ability to run your arcology.";
			const almostProblem = "You are starting to experience back pain; any bigger and they might seriously impede your ability to run your arcology.";
			if (V.PC.physicalAge >= 18) {
				if (V.PC.boobs > 40000 + (V.PC.muscles * 200)) {
					r.push(isCrippled);
				} else if (V.PC.boobs > 38000 + (V.PC.muscles * 200)) {
					r.push(almostCrippled);
				} else if (V.PC.boobs > 5000) {
					r.push(isProblem);
				} else if (V.PC.boobs > 4000) {
					r.push(almostProblem);
				}
			} else if (V.PC.physicalAge > 12) {
				if (V.PC.boobs > 25000 + (V.PC.muscles * 100)) {
					r.push(isCrippled);
				} else if (V.PC.boobs > 23000 + (V.PC.muscles * 100)) {
					r.push(almostCrippled);
				} else if (V.PC.boobs > 5000) {
					r.push(isProblem);
				} else if (V.PC.boobs > 3000) {
					r.push(almostProblem);
				}
			} else {
				if (V.PC.boobs > 10000 + (V.PC.muscles * 50)) {
					r.push(isCrippled);
				} else if (V.PC.boobs > 9000 + (V.PC.muscles * 50)) {
					r.push(almostCrippled);
				} else if (V.PC.boobs > 5000) {
					r.push(isProblem);
				} else if (V.PC.boobs > 2000) {
					r.push(almostProblem);
				}
			}
			// These will be hideous. Deal with it.
			if (V.PC.boobsImplant > 0) {
				if (V.PC.boobsImplantType === "string") {
					linkArray.push(surgeryLink("Upgrade to a newer implant", "breastImplantSwap", () => {
						healthDamage(V.PC, 15);
						// do selection based off size!
						cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
					}));
					if (V.PC.boobsImplant > 600) {
						linkArray.push(breastReductionDrainImplant());
					}
				} else if (V.PC.boobsImplant < 800 && V.PC.boobsImplant >= 600) {
					linkArray.push(surgeryLink("Upgrade to fillable implants", "breastEnlargementImplant", () => {
						healthDamage(V.PC, 10);
						V.PC.boobs += 200;
						V.PC.boobsImplant += 200;
						V.PC.boobsImplantType = "fillable";
						cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
					}));
					linkArray.push(breastReductionRemoveImplant());
				} else if (V.PC.boobsImplant < 2200 && V.PC.boobsImplant >= 1800) {
					linkArray.push(surgeryLink("Upgrade to advanced fillable implants", "breastEnlargementImplant", () => {
						healthDamage(V.PC, 10);
						V.PC.boobs += 200;
						V.PC.boobsImplant += 200;
						V.PC.boobsImplantType = "advanced fillable";
						cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
					}));
					linkArray.push(
						breastReductionDrainImplant(),
						breastReductionRemoveImplant()
					);
				} else if (V.PC.boobsImplant < 11000 && V.PC.boobsImplant >= 10000 && FutureSocieties.researchAvailable("TransformationFetishist")) {
					linkArray.push(surgeryLink("Upgrade to hyper fillable implants", "breastEnlargementImplant", () => {
						healthDamage(V.PC, 10);
						V.PC.boobs += 1000;
						V.PC.boobsImplant += 1000;
						V.PC.boobsImplantType = "hyper fillable";
						cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
					}));
					linkArray.push(
						breastReductionDrainImplant(400),
						breastReductionRemoveImplant()
					);
				} else if (V.PC.boobsImplant >= 800 && ["fillable", "advanced fillable", "hyper fillable"].includes(V.PC.boobsImplantType)) { // fillables
					const fillerRate = V.PC.boobsImplantType === "hyper fillable" ? 1000 : V.PC.boobsImplantType === "advanced fillable" ? 400 : 200;
					linkArray.push(breastEnlargementFillImplant(fillerRate));
					if (V.PC.boobsImplant > 800) {
						linkArray.push(breastReductionDrainImplant(fillerRate));
					}
					linkArray.push(breastReductionRemoveImplant());
				} else { // non-fillables
					linkArray.push(
						breastEnlargementImplant(),
						breastReductionRemoveImplant()
					);
				}
			} else {
				linkArray.push(getImplants());
				if (V.PC.boobs < 400) {
					linkArray.push(breastEnlargement(100));
				} else {
					linkArray.push(breastEnlargement());
				}
				if (V.PC.boobs < 400) {
					linkArray.push(App.UI.DOM.disabledLink("Have fatty tissue removed", ["You lack sufficient fatty tissue to permit additional size reduction short of total breast removal"]));
				} else if (V.PC.boobs < 500) {
					linkArray.push(breastShrinkageAbsolute(350));
				} else if (V.PC.boobs < 1000) {
					linkArray.push(breastShrinkageRelative(100));
				} else if (V.PC.boobs < 4000) {
					linkArray.push(breastShrinkageRelative());
				} else {
					linkArray.push(breastShrinkageRelative(500));
				}
				linkArray.push(flatChest());
				if (V.PC.boobs >= 2000) {
					App.Events.addNode(el, r, "div");
					r = [];
					r.push(`"With breasts that big, getting implants won't be very noticeable until you size up a few times."`);
				}
			}
		} else if (V.PC.title === 1) {
			r.push(`You have a <span class="intro question">masculine chest.</span> At your request, breast tissue could be added until you have a healthy bust, though society is unlikely to approve.`);
			linkArray.push(breasts());
		} else {
			r.push(`<span class="intro question">You're flat.</span>`);
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"We can fix that, if you want."`);
			linkArray.push(breasts());
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;

		/**
		 * @returns {HTMLAnchorElement} a link for breast implant removal
		 */
		function breastReductionRemoveImplant() {
			return surgeryLink("Have your implants removed", "breastReductionImplant", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs -= V.PC.boobsImplant;
				V.PC.boobsImplant = 0;
				V.PC.boobsImplantType = "none";
				// do shape change
				cashX(forceNeg(applyDiscount(5000)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for breast enlargement via implant
		 */
		function breastEnlargementImplant() {
			return surgeryLink("Get the next size up", "breastEnlargementImplant", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs += 200;
				V.PC.boobsImplant += 200;
				cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
			});
		}

		/**
		 * @param {number} [boobGrowth] how much the breasts should be enlarged (200 by default)
		 * @returns {HTMLAnchorElement} a link for breast enlargement via implant filler
		 */
		function breastEnlargementFillImplant(boobGrowth = 200) {
			return surgeryLink("Add additional filler", "breastEnlargementImplant", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs += boobGrowth;
				V.PC.boobsImplant += boobGrowth;
				cashX(forceNeg(applyDiscount(1000, true)), "PCmedical");
			});
		}

		/**
		 * @param {number} [boobLoss] how much the breasts should be reduced (200 by default)
		 * @returns {HTMLAnchorElement} a link for breast shrinkage via implant filler
		 */
		function breastReductionDrainImplant(boobLoss = 200) {
			return surgeryLink("Drain filler", "breastReductionImplant", () => {
				healthDamage(V.PC, 5);
				V.PC.boobs -= boobLoss;
				V.PC.boobsImplant -= boobLoss;
				// make sure to respect floors!
				cashX(forceNeg(applyDiscount(500)), "PCmedical");
			});
		}

		/**
		 * @param {number} [boobGrowth] how much the breasts should be enlarged (200 by default)
		 * @returns {HTMLAnchorElement} a link for breast enlargement via flesh
		 */
		function breastEnlargement(boobGrowth = 200) {
			return surgeryLink("Add additional breast tissue", "breastEnlargement", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs += boobGrowth;
				cashX(forceNeg(applyDiscount(15000)), "PCmedical");
			});
		}

		/**
		 * @param {number} [reduction] how much the breasts should be reduced (200 by default)
		 * @returns {HTMLAnchorElement} a link for breast shrinkage via flesh removal
		 */
		function breastShrinkageRelative(reduction = 200) {
			return surgeryLink("Have tissue removed", "breastShrinkage", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs -= reduction;
				cashX(forceNeg(applyDiscount(5000)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for breast implant installation
		 */
		function getImplants() {
			return surgeryLink("Get a pair of breast implants", "breastEnlargementImplant", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs += 200;
				V.PC.boobsImplant += 200;
				V.PC.boobsImplantType = "normal";
				cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
			});
		}

		/**
		 * @param {number} newSize
		 * @returns {HTMLAnchorElement}
		 */
		function breastShrinkageAbsolute(newSize) {
			return surgeryLink("Have fatty tissue removed", "breastShrinkage", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs = newSize;
				cashX(forceNeg(applyDiscount(5000)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for the full removal of the breasts (flat as a board as they say)
		 */
		function flatChest() {
			return surgeryLink("Have them removed", "flatChest", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs = 100;
				cashX(forceNeg(applyDiscount(5000)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for that adds breasts to the player
		 */
		function breasts() {
			return surgeryLink("Get a pair of breasts", "breasts", () => {
				healthDamage(V.PC, 10);
				V.PC.boobs = 450;
				cashX(forceNeg(applyDiscount(15000)), "PCmedical");
			});
		}
	}

	/**
	 * Appends a div to `el` that lets the player change their breast shape
	 */
	function breastShape() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"${V.PC.boobShape === "saggy" || V.PC.boobShape === "downward-facing" ? "Your breasts seem to be looking a little down, but we can fix that" : "If you wanted to change things up, we can reshape your breasts"}. <span class="cash">${cashFormat(applyDiscount(7000))}."</span> ${HeU} puffs out ${hisU} chest, "Can never go wrong with perky tits!"${V.pSurgery.state > 1 ? `` : ` ${HeU} unbuttons ${hisU} jacket and gives you a quick flash.`}`
		], "div");
		r.push(`You have <span class="intro question">${V.PC.boobShape} breasts.</span>`);
		if (V.PC.boobShape === "spherical") {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"Well we can't really reshape implants. They're just round. And since your boobs are all implant, well, what shape do you expect them to be?"`);
		} else if (V.PC.breastMesh === 1) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"We can't reshape your breasts without damaging that tangle you've got going on in them."`);
		} else {
			if (V.PC.boobShape !== "perky") {
				linkArray.push(surgeryLink("Make them perky", "breastReconstruction", () => {
					healthDamage(V.PC, 10);
					V.PC.boobShape = "perky";
					cashX(forceNeg(applyDiscount(7000)), "PCmedical");
				}));
			}
			if (V.PC.boobShape !== "torpedo-shaped") {
				linkArray.push(surgeryLink("Make them torpedoes", "breastReconstruction", () => {
					healthDamage(V.PC, 10);
					V.PC.boobShape = "torpedo-shaped";
					cashX(forceNeg(applyDiscount(7000)), "PCmedical");
				}));
			}
			if (V.PC.boobShape !== "wide-set") {
				linkArray.push(surgeryLink("Make them wide-set", "breastReconstruction", () => {
					healthDamage(V.PC, 10);
					V.PC.boobShape = "wide-set";
					cashX(forceNeg(applyDiscount(7000)), "PCmedical");
				}));
			}
			if (V.PC.boobShape !== "normal") {
				linkArray.push(surgeryLink("Make them average", "breastReconstruction", () => {
					healthDamage(V.PC, 10);
					V.PC.boobShape = "normal";
					cashX(forceNeg(applyDiscount(7000)), "PCmedical");
				}));
			}
			if (V.PC.boobShape !== "downward-facing") {
				linkArray.push(surgeryLink("Make them face down", "breastReconstruction", () => {
					healthDamage(V.PC, 10);
					V.PC.boobShape = "downward-facing";
					cashX(forceNeg(applyDiscount(7000)), "PCmedical");
				}));
			}
			if (V.PC.boobShape !== "saggy") {
				linkArray.push(surgeryLink("Make them sag", "breastReconstruction", () => {
					healthDamage(V.PC, 10);
					V.PC.boobShape = "saggy";
					cashX(forceNeg(applyDiscount(7000)), "PCmedical");
				}));
			}
		}
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their nipple shape or size
	 */
	function nippleShape() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"It's a touch difficult, but we can reshape your nipples too for <span class="cash">${cashFormat(applyDiscount(9000))},</span> but with how sensitive they are, I don't think I'd want a knife touching mine."`
		], "div");
		r.push(`You have <span class="intro question">${V.PC.nipples} nipples.</span>`);
		if (V.PC.nipples === "flat") {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"Yeah, too much implant will do that. You'd need a skin transplant for us to even attempt to do anything, so you may want to try some natural breast growth to get something for us to work with."`);
		} else if (V.PC.nipples === "fuckable") {
			App.Events.addNode(el, r, "div");
			r = [];
			if (V.pSurgery.state > 1) {
				r.push(`"That's too lewd, even for me. Can't really say we can work on those either."`);
			} else {
				r.push(`"Oh wow, they're like little pussies! Not really something that we can work on though."`);
			}
		} else {
			if (V.PC.nipples !== "huge") {
				linkArray.push(surgeryLink("Make them huge", "nippleReconstruction", () => {
					healthDamage(V.PC, 15);
					V.PC.nipples = "huge";
					cashX(forceNeg(applyDiscount(9000)), "PCmedical");
				}));
			}
			if (V.PC.nipples !== "puffy") {
				linkArray.push(surgeryLink("Make them puffy", "nippleReconstruction", () => {
					healthDamage(V.PC, 15);
					V.PC.nipples = "puffy";
					cashX(forceNeg(applyDiscount(9000)), "PCmedical");
				}));
			}
			if (V.PC.nipples !== "cute") {
				linkArray.push(surgeryLink("Make them cute", "nippleReconstruction", () => {
					healthDamage(V.PC, 15);
					V.PC.nipples = "cute";
					cashX(forceNeg(applyDiscount(9000)), "PCmedical");
				}));
			}
			if (V.PC.nipples !== "tiny") {
				linkArray.push(surgeryLink("Make them tiny", "nippleReconstruction", () => {
					healthDamage(V.PC, 15);
					V.PC.nipples = "tiny";
					cashX(forceNeg(applyDiscount(9000)), "PCmedical");
				}));
			}
			if (V.PC.nipples !== "partially inverted") {
				linkArray.push(surgeryLink("Partially invert them", "nippleReconstruction", () => {
					healthDamage(V.PC, 15);
					V.PC.nipples = "partially inverted";
					cashX(forceNeg(applyDiscount(9000)), "PCmedical");
				}));
			}
			if (V.PC.nipples !== "inverted") {
				linkArray.push(surgeryLink("Fully invert them", "nippleReconstruction", () => {
					healthDamage(V.PC, 15);
					V.PC.nipples = "inverted";
					cashX(forceNeg(applyDiscount(9000)), "PCmedical");
				}));
				if (V.pSurgery.state === 1) {
					App.Events.addNode(el, r, "div");
					r = [];
					r.push(`"A literal nip-tuck, am I right?"`);
				}
			}
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their areolae size and shape
	 */
	function areolae() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"Self-conscious about the size of your areolae? We can tone them down for <span class="cash">${cashFormat(applyDiscount(3000))}.</span> Or maybe you'd like 'em bigger, or perhaps something, you know, different? They can be grafted and reshaped for only <span class="cash">${cashFormat(applyDiscount(6000))}</span> into some fun sizes and patterns!"`
		], "div");
		r.push(`You have <span class="intro question">`);
		if (V.PC.areolae === 0) {
			if (V.PC.areolaeShape !== "circle") {
				r.push(`${V.PC.areolaeShape}-shaped`);
			} else {
				r.push(`normal`);
			}
		} else if (V.PC.areolae === 1) {
			r.push(`large`);
			if (V.PC.areolaeShape !== "circle") {
				r.push(`${V.PC.areolaeShape}-shaped`);
			}
		} else if (V.PC.areolae === 2) {
			r.push(`unusually wide`);
			if (V.PC.areolaeShape !== "circle") {
				r.push(`${V.PC.areolaeShape}-shaped`);
			}
		} else if (V.PC.areolae === 3) {
			r.push(`huge`);
			if (V.PC.areolaeShape !== "circle") {
				r.push(`${V.PC.areolaeShape}-shaped`);
			}
		} else if (V.PC.areolae === 4) {
			r.push(`massive`);
			if (V.PC.areolaeShape !== "circle") {
				r.push(`${V.PC.areolaeShape}-shaped`);
			}
		}
		r.push(`areolae.</span>`);
		if (V.PC.areolae === 0) {
			linkArray.push(App.UI.DOM.disabledLink("Have them reduced", ["Your areolae can't get any smaller without being just a nipple"]));
			linkArray.push(surgeryLink("Have them enlarged", "areolae", () => {
				healthDamage(V.PC, 10);
				V.PC.areolae++;
				cashX(forceNeg(applyDiscount(6000)), "PCmedical");
			}));
		} else if (V.PC.areolae === 4) {
			linkArray.push(surgeryLink("Have them reduced", "areolae", () => {
				healthDamage(V.PC, 10);
				V.PC.areolae--;
				cashX(forceNeg(applyDiscount(3000)), "PCmedical");
			}));
			linkArray.push(App.UI.DOM.disabledLink("Have them enlarged", ["Your areolae can't get any bigger; they already take up most of your breasts"]));
		} else {
			linkArray.push(surgeryLink("Have them reduced", "areolae", () => {
				healthDamage(V.PC, 10);
				V.PC.areolae--;
				cashX(forceNeg(applyDiscount(3000)), "PCmedical");
			}));
			linkArray.push(surgeryLink("Have them enlarged", "areolae", () => {
				healthDamage(V.PC, 10);
				V.PC.areolae++;
				cashX(forceNeg(applyDiscount(6000)), "PCmedical");
			}));
		}
		if (V.PC.areolaeShape !== "circle") {
			linkArray.push(surgeryLink("Restore them to a normal shape", "areolae", () => {
				healthDamage(V.PC, 10);
				V.PC.areolaeShape = "circle";
				cashX(forceNeg(applyDiscount(9000)), "PCmedical");
			}));
		}
		if (V.PC.areolaeShape !== "heart") {
			linkArray.push(surgeryLink("Reshape them into hearts", "areolae", () => {
				healthDamage(V.PC, 10);
				V.PC.areolaeShape = "heart";
				cashX(forceNeg(applyDiscount(9000)), "PCmedical");
			}));
		}
		if (V.PC.areolaeShape !== "star") {
			linkArray.push(surgeryLink("Reshape them into stars", "areolae", () => {
				healthDamage(V.PC, 10);
				V.PC.areolaeShape = "star";
				cashX(forceNeg(applyDiscount(9000)), "PCmedical");
			}));
		}
		/* works, but is kinda ugly
		linkArray.push("Reshape them into...", App.UI.DOM.makeTextBox(
			V.PC.areolaeShape, v => {
				healthDamage(V.PC, 10);
				V.PC.areolaeShape = v;
				cashX(forceNeg(applyDiscount(9000)), "PCmedical");
				showDegradation("areolae");
			}
		));
		*/
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player apply the breastMesh augment
	 */
	function breastMesh() {
		const el = new DocumentFragment();
		const linkArray = [];
		App.Events.addNode(el, [
			`"Eh? What is that? Some sort of net? Wait, you want that put into your breasts...? Huh. So it preserves their shape? Well let me ask the surgeon real quick." ${HeU} hustles off to get a price for you. After a minute, ${heU} returns with an answer, "Alright, we can do it, but it'll run you <span class="cash">${cashFormat(applyDiscount(20000))}</span> and render further breast work an impossibility. Personally, I'd just take touch ups every now and then."`
		], "div");
		linkArray.push(surgeryLink("Install the supportive breast mesh", "breastMesh", () => {
			healthDamage(V.PC, 15);
			V.PC.breastMesh = 1;
			cashX(forceNeg(applyDiscount(20000)), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Fills out the tab for belly surgery
	 */
	function bellyGroup() {
		const el = new DocumentFragment();
		el.append(belly());
		App.Events.addParagraph(el, [``]);
		el.append(waist());
		if (V.PC.bellyImplant > -1 && V.PC.cervixImplant === 0) {
			App.Events.addParagraph(el, [``]);
			el.append(bellyImplant());
		}
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player fix belly problems (sag, csec)
	 */
	function belly() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.PC.belly > (V.PC.pregAdaptation * 4500)) {
			r.push(`${HeU} flinches at the sight of the tears forming on your stomach, "Oh that's sickening. It's like something out of a horror movie." ${HeU} quickly realizes what ${heU} said, "Sorry, I didn't mean anything bad by that. I'm sure we can smooth those right over in the future, or, um, patch up the hole? Either way, we'll have your middle looking good as new!`);
		} else if (V.PC.belly > (V.PC.pregAdaptation * 3200)) {
			r.push(`${HeU} reaches for your middle, before hesitating and drawing ${hisU} hand back, "Oh those stretch marks look bad... We can surely fix them once they heal up though, but still, they must really hurt."`);
		} else if (V.PC.bellyImplant > -1) {
			if (nurse.belly >= 100) {
				r.push(`${HeU} rubs ${hisU} own tummy as ${heU} contemplates your implant, "Pregnancy isn't really the kind of investment I wanted to make to stay trendy, so I can see the appeal. But still, it does detract a little from the rest of you, no?"`);
			} else if (V.pSurgery.state > 1) {
				r.push(`${HeU} glares at your middle, "Pregnancy is not the kind of investment I'd want to make, even if it's a fake one."`);
			} else {
				r.push(`${HeU} pats your middle, "Always an interesting piece. I'd consider one, but pregnancy isn't really for me."`);
			}
		} else if (V.PC.preg > 3) {
			if (V.pSurgery.state > 1) {
				r.push(`"Before you ask, no, we don't perform abortions here."`);
			} else {
				r.push(`${HeU} darts for your middle,`);
				if (V.PC.belly >= 1000000) {
					r.push(`"I can't get over how absurd this is. I've seen you around, since, you know, you're a little big, if you didn't notice..." ${HeU} coughs and continues, "It's just looking at it up close just gives you such a different perspective. How do you do it? I don't think I could stand getting this knocked up." ${HeU} takes a moment to compose ${himselfU}, "But anyway, there's no denying that your body is going to be utterly ruined by this pregnancy, but I assure you that we're more than capable of giving you a nice, trim belly again after the fact." ${HeU}`);
					if (V.PC.preg > 40) {
						r.push(`gives your overdue ${pregNumberName(V.PC.pregType, 1)}-bursting belly another look over. "I don't think we could handle you giving birth here. I mean, we'll have you delivering just fine, but I don't know where all of them would go."`);
					} else {
						r.push(`moves to give your bulging belly a reassuring pat, before deciding you don't need any more pressure put on it.`);
					}
				} else if (V.PC.belly >= 750000) {
					r.push(`but quickly changes ${hisU} mind. "Oh that's horrific, just what did you manage to do to yourself?" ${HeU} traces a finger between the bulges coating your belly, "Yeah, this isn't going to be able to mend on it's own; you'll just have a big deflated balloon hanging off your body. But, we welcome a challenge and would be happy to fix you up. It'll be like you never got so stretched out." ${HeU}`);
					if (V.PC.preg > 40) {
						r.push(`watches your overdue ${pregNumberName(V.PC.pregType, 1)}-bursting belly, truly taking in just how full you really are. "I don't think we could handle you giving birth here. I mean, they'll come out just fine, but I don't think we can fit all of them in the office..."`);
					} else {
						r.push(`moves to give your bulging belly a reassuring pat, before deciding you don't need any more pressure put on it.`);
					}
				} else if (V.PC.belly >= 600000) {
					r.push(`but quickly changes ${hisU} mind. "Oh that's unsettling, I just noticed all the movement in there... It's a bit nauseating, but kinda hypnotic. Huh. Huh?" ${HeU} stops eying your obscene pregnancy long enough to remember to upsell ${hisU} services, "Right, so looking at just how big you are, after the birth, your stomach is not going to return to anything even close to normal. But, we can easily fix that for you, so keep us in mind!" ${HeU}`);
					if (V.PC.preg > 40) {
						r.push(`places a hand on your overdue ${pregNumberName(V.PC.pregType, 1)}-bursting belly, accidentally groping ${(V.PC.pregType > 1) ? "a fetus" : "your child"} and recoiling when it squirms in response. "I hope to never get that knocked up. At least we have the equipment to help you give birth, though I doubt we have the room for all of them."`);
					} else {
						r.push(`gives your overfull belly a reassuring pat.`);
					}
				} else if (V.PC.belly >= 450000) {
					r.push(`"Ohmagosh! What happened to you? Eep!" ${HeU} squeaks in surprise and hops back, "I felt something move under my hand! Huh, if I look closely, I can actually see them in there. Squirming. It's making me a little uncomfortable, honestly." ${HeU} takes a moment to compose ${himselfU} again, "But you must be so much more, though. After you give birth, come see us, we can put everything back where it's supposed to be." ${HeU} gives your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-bloated belly a pat, setting your ${(V.PC.pregType > 1) ? "children" : "child"} kicking. "If you go into labor, well, we'll try to accommodate everything you pop out. Or at least, I hope we can."`);
					} else {
						r.push(`packed belly a comforting pat.`);
					}
				} else if (V.PC.belly >= 300000) {
					r.push(`"Ohmagosh! What happened to you? What's even IN you? I mean, girls can't get THAT pregnant... can they? Eep! They're moving... Um, so I hate to tell you this, but I don't think your belly is going to return to normal after all of this. Lucky for you we can fix it no problem!" ${heU} proclaims proudly as ${heU} massages your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-bloated belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we'll try to handle everything for you, but we only have room for so many children at once, you know?"`);
					} else {
						r.push(`over-filled belly.`);
					}
				} else if (V.PC.belly >= 150000) {
					r.push(`"My god! What happened to you? You might not want to hit the fertility drugs so hard next time because man are you pregnant! But hey, you won't see us complain when you come in for a tummy tuck to get everything back where it used to be," ${heU} says with a wink as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-bloated belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`over-crowded belly.`);
					}
				} else if (V.PC.belly >= 120000) {
					r.push(`"My god! What happened to you? You might not want to hit the fertility drugs so hard next time. Then again, I don't think you'll see us complaining when you come in for a tummy tuck to get everything back where it used to be," ${heU} says with a wink as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-stuffed belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`over-crowded belly.`);
					}
				} else if (V.PC.belly >= 105000) {
					r.push(`"My god! What happened to you? You might not want to hit the fertility drugs so hard next time. Then again, I don't think you'll see us complaining when you come in for a tummy tuck to get everything back where it used to be," ${heU} says with a wink as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-stuffed belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`over-crowded belly.`);
					}
				} else if (V.PC.belly >= 90000) {
					r.push(`Oh wow! It's like a party in there!" ${heU} says as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-stuffed belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`crowded belly.`);
					}
				} else if (V.PC.belly >= 75000) {
					r.push(`You must feel so full, like all the time. What's it feel like? Do they ever calm down?" ${heU} says as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-filled belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`crowded belly.`);
					}
				} else if (V.PC.belly >= 60000) {
					r.push(`Oh wow! You're immense! I almost can't wrap my arms around it!" ${heU} says as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-filled belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`crowded belly.`);
					}
				} else if (V.PC.belly >= 45000) {
					r.push(`"Oh wow! You're gigantic! Are you sure you want to have surgery in this state? Things start to get complicated when you're this pregnant," ${heU} says as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-filled belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`crowded belly.`);
					}
				} else if (V.PC.belly >= 30000) {
					r.push(`"My word, are you sure you want to have surgery in this state? You're gigantic! Plus things start to get complicated when you're this pregnant," ${heU} says as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue ${pregNumberName(V.PC.pregType, 1)}-filled belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`crowded belly.`);
					}
				} else if (V.PC.belly >= 16000) {
					r.push(`"My word, are you sure you want to have surgery in this state? You're giant!" ${heU} says as ${heU} uses both hands to massage your`);
					if (V.PC.preg > 40) {
						r.push(`overdue belly, enjoying the kicks from your ${(V.PC.pregType > 1) ? "children" : "child"} within. "If you go into labor, we have everything you'll need, so don't worry."`);
					} else {
						r.push(`belly, taking note of the extra occupants.`);
					}
				} else if (V.PC.belly >= 14000) {
					r.push(`"Wow, are you going to be ok? That looks really heavy," ${heU} says as ${heU} uses both hands to grope your massive belly, paying extra attention to your navel. "Are you sure you don't want to take a seat?"`);
				} else if (V.PC.belly >= 12000) {
					r.push(`"You're huge! Look at that adorable navel!" ${heU} says as ${heU} uses both hands to grope your huge belly, paying extra attention to your navel.`);
				} else if (V.PC.belly >= 10000) {
					r.push(`"Look how big you are!" ${heU} says as ${heU} uses both hands to grope your huge belly.`);
				} else if (V.PC.belly >= 7000) {
					r.push(`"You're getting so big!" ${heU} says as ${heU} uses both hands to massage your big pregnant belly.`);
				} else if (V.PC.belly >= 5000) {
					r.push(`"You're getting so big!" ${heU} says as ${heU} uses both hands to massage your pregnant belly.`);
				} else if (V.PC.belly >= 3000) {
					r.push(`"Looks like fun!" ${heU} says as ${heU} uses both hands to rub your pregnant belly.`);
				} else if (V.PC.belly >= 1500) {
					r.push(`"Awwww, you're getting soo big!" ${heU} says as ${heU} rubs your pregnant belly.`);
				} else if (V.PC.belly >= 500) {
					r.push(`"Awwww, you have a bun in the oven! That's so adorable; didn't think you the type," ${heU} says as ${heU} pats your rounded middle.`);
				} else if (V.PC.belly >= 300) {
					r.push(`"Awwww, you have a bun in the oven! That's so adorable; didn't think you the type," ${heU} says as ${heU} rubs your slightly rounded middle.`);
				} else if (V.PC.belly >= 100) {
					r.push(`"Awwww, you have a bun in the oven! That's so adorable; didn't think you the type," ${heU} says as ${heU} rubs your slightly swollen belly.`);
				}
			}
			if (V.PC.pregKnown === 0) {
				if (V.PC.bellyPreg >= 500) {
					r.push(`Given how big it's gotten, <span class="pregnant">this shouldn't come as a surprise.</span>`);
				} else {
					r.push(`<span class="pregnant">No denying it now.</span>`);
				}
			}
		} else if (V.PC.belly >= 1500) {
			if (V.pSurgery.state > 1) {
				r.push(`${HeU} pokes your belly, "Been having a bit of fun? Can't say I like it. Also means we can't work on it. Empty out and come back."`);
			} else if (V.PC.belly >= 10000) {
				r.push(`${HeU} runs a hand over your taut belly, "If you keep this up you're going to stretch yourself out. And when that happens, we'll can fix you right up so you can do it again! That's the point right? I don't really get the fetish..."`);
			} else if (V.PC.belly >= 5000) {
				r.push(`${HeU} gives your full belly a pat, "Heh, really packing it in there, aren't you? If you accidentally stretch yourself out, we can smooth things back out."`);
			} else {
				r.push(`${HeU} wobbles your belly, "Heh, that's pretty fun. But it also means it's a little too unstable to work on."`);
			}
		} else {
			if (V.PC.bellySag > 0) {
				r.push(`${HeU} pinches your belly. "How about a tummy tuck? We can smooth this right out, cheaply too, <span class="cash">${cashFormat(applyDiscount(500))}.</span>" ${HeU} lets your saggy middle flop back to its usual drooping state.`);
				linkArray.push(surgeryLink("Firm up your stomach", "tummyTuck", () => {
					V.PC.bellySag = 0;
					V.PC.bellySagPreg = 0;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			}
			if (V.PC.scar.hasOwnProperty("belly") && V.PC.scar.belly["c-section"] > 0) {
				r.push(`"We can wipe away that unsightly cesarean scar for you, quick and painless for an easy <span class="cash">${cashFormat(applyDiscount(200))}.</span>"`);
				linkArray.push(surgeryLink("Remove your c-section scar", "tummyTuck", () => {
					App.Medicine.Modification.removeScar(V.PC, "belly", "c-section");
					cashX(forceNeg(applyDiscount(200)), "PCmedical");
				}));
			}
		}

		if (V.PC.belly > (V.PC.pregAdaptation * 1000) && V.PC.belly <= (V.PC.pregAdaptation * 3200)) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"We can help with those stretch marks too, you know, once you're done stretching."`);
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player adjust the width of their waist
	 */
	function waist() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"If you ever wanted a hourglass waist like mine," ${HeU} says, thrusting ${hisU} hips left and right to show off ${hisU} own, "it'll cost <span class="cash">${cashFormat(applyDiscount(3000))}</span> for a trim down. We can also build it up for <span class="cash">${cashFormat(applyDiscount(2000))},</span> if that's what you want."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"If you ever wanted a hourglass waist like mine," ${HeU} says, showing ${hisU} off with a simple belly dance, "it'll cost <span class="cash">${cashFormat(applyDiscount(3000))}</span> to move things around and extract what we can." ${HeU} finishes off ${hisU} display and continues, "Now if you think yours is too thin, we can also build it up for <span class="cash">${cashFormat(applyDiscount(2000))}.</span> Not very popular, that one, but you see the odd case now and then. Don't worry, your secret'll be safe with us."`
			], "div");
		}
		r.push(`You have<span class="intro question"> a`);
		if (V.PC.waist > 95) {
			r.push(`broad, dense`);
		} else if (V.PC.waist > 40) {
			r.push(`broad`);
		} else if (V.PC.waist > 10) {
			r.push(`thick`);
		} else if (V.PC.waist >= -10) {
			r.push(`average`);
		} else if (V.PC.waist >= -40) {
			r.push(`thin`);
		} else if (V.PC.waist >= -95) {
			r.push(`waspish`);
		} else {
			r.push(`hourglass`);
		}
		r.push(`waist.</span>`);
		if (V.PC.belly >= 10000) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`${HeU} circles around you several times, clearly looking for something, "Hmm, I don't think it will be possible to do anything to your waist right now. It's just too distorted..."`);
		} else if (V.PC.waist < -95) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"I'm sorry, but I don't think we can operate on your waist. The structure just isn't there anymore to support any support additions, and don't you even think for a second we'll try to make it even narrower. You'd be just a spine!"`);
		} else if (V.PC.waist < -75) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"We're not about to extract ribs from you to get your waist narrower. Do I have to cut you off?"`);
			linkArray.push(surgeryLink(`Have it thickened`, "waistUp", () => {
				healthDamage(V.PC, 15);
				V.PC.waist += 20;
				cashX(forceNeg(applyDiscount(2000)), "PCmedical");
			}));
		} else {
			if (V.PC.waist > 95) {
				linkArray.push(App.UI.DOM.disabledLink("Have it thickened", ["Your waist can't get any thicker"]));
			} else {
				linkArray.push(surgeryLink(`Have it thickened`, "waistUp", () => {
					healthDamage(V.PC, 15);
					V.PC.waist += 20;
					cashX(forceNeg(applyDiscount(2000)), "PCmedical");
				}));
			}
			linkArray.push(surgeryLink(`Have it narrowed${V.PC.shouldersImplant < 0 ? " further" : ""}`, "waistDown", () => {
				healthDamage(V.PC, 15);
				V.PC.waist -= 20;
				cashX(forceNeg(applyDiscount(3000)), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player inflate, deflate, or remove their belly implant.
	 */
	function bellyImplant() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"Well, since it uses the same filler as more typical implants, let me do some quick math." ${HeU} hums to ${himselfU} as ${heU} runs the numbers, "Yep, so if the point is to look pregnant, you'd want enough filler to go up a size, right? But that's a lot of filler to do at once, so no, we can't do that. But we can do <span class="cash">200 CC for ${cashFormat(applyDiscount(1000, true))},</span> or <span class="cash">600 CC for ${cashFormat(applyDiscount(3000, true))}.</span> As for draining, it'll be 200, 500, or 1000 CCs per session, all priced at <span class="cash">${cashFormat(applyDiscount(500))},</span> unless you want us to just pop the cork and let it all out, in which case you're getting charged <span class="cash">${cashFormat(applyDiscount(5000))}</span> for disposal. And since we don't really deal with non-standard implants too often, removal will be nothing short of an experimental procedure, so it'll run you <span class="cash">${cashFormat(applyDiscount(15000))}</span> for removal or <span class="cash">${cashFormat(applyDiscount(30000))}</span> to empty and remove it." ${HeU} lets out breath, "That was a lot to go over."`
		], "div");
		if (V.PC.bellyImplant > 0) {
			r.push(`You have a <span class="intro question">${V.PC.bellyImplant} CC belly implant.</span>`);
			if (V.PC.belly >= 300000) {
				r.push(`It can very clearly be called a hyperpregnancy.`);
			} else if (V.PC.belly >= 150000) {
				r.push(`It makes you unrealistically pregnant.`);
			} else if (V.PC.belly >= 120000) {
				r.push(`It makes you look full term with octuplets.`);
			} else if (V.PC.belly >= 90000) {
				r.push(`It makes you look very pregnant with multiple babies.`);
			} else if (V.PC.belly >= 30000) {
				r.push(`It makes you look pregnant with multiples.`);
			} else if (V.PC.belly >= 15000) {
				r.push(`It makes you look full term.`);
			} else if (V.PC.belly >= 10000) {
				r.push(`It makes you look very pregnant.`);
			} else if (V.PC.belly >= 5000) {
				r.push(`It makes you look obviously pregnant.`);
			} else if (V.PC.belly >= 1500) {
				r.push(`It makes you look pregnant.`);
			} else if (V.PC.belly >= 500) {
				r.push(`It resembles an early pregnancy.`);
			} else {
				r.push(`It isn't really large enough to be noticeable.`);
			}
			const isCrippled = "Your belly is debilitating; it's not possible for you to walk with its mass jutting out of you.";
			const almostCrippled = "Your body just can't support a belly of your size; if it gets much bigger, you might not be able to walk anymore.";
			const isProblem = "Your belly is large enough to impede your ability to run your arcology.";
			const almostProblem = "You are starting to experience trouble getting around; any bigger and it might seriously impede your ability to run your arcology.";
			if (V.PC.physicalAge >= 18) {
				if (V.PC.belly >= 450000 + (V.PC.muscles * 2000)) {
					r.push(isCrippled);
				} else if (V.PC.belly >= 449000 + (V.PC.muscles * 2000)) {
					r.push(almostCrippled);
				} else if (V.PC.belly >= 60000 || V.PC.belly >= 60000 / (1 + Math.pow(Math.E, -0.4 * (V.PC.physicalAge - 14))) || V.PC.belly >= Math.max(10000, ((12500 / 19) * V.PC.height) - (1172500 / 19))) {
					r.push(isProblem);
				} else if (V.PC.belly >= 75000) {
					r.push(almostProblem);
				}
			} else if (V.PC.physicalAge > 12) {
				if (V.PC.belly >= 350000 + (V.PC.muscles * 1000)) {
					r.push(isCrippled);
				} else if (V.PC.belly >= 349000 + (V.PC.muscles * 1000)) {
					r.push(almostCrippled);
				} else if (V.PC.belly >= 60000 || V.PC.belly >= 60000 / (1 + Math.pow(Math.E, -0.4 * (V.PC.physicalAge - 14))) || V.PC.belly >= Math.max(10000, ((12500 / 19) * V.PC.height) - (1172500 / 19))) {
					r.push(isProblem);
				} else if (V.PC.belly >= 30000) {
					r.push(almostProblem);
				}
			} else {
				if (V.PC.belly >= 150000 + (V.PC.muscles * 800)) {
					r.push(isCrippled);
				} else if (V.PC.belly >= 149000 + (V.PC.muscles * 800)) {
					r.push(almostCrippled);
				} else if (V.PC.belly >= 60000 || V.PC.belly >= 60000 / (1 + Math.pow(Math.E, -0.4 * (V.PC.physicalAge - 14))) || V.PC.belly >= Math.max(10000, ((12500 / 19) * V.PC.height) - (1172500 / 19))) {
					r.push(isProblem);
				} else if (V.PC.belly >= 30000) {
					r.push(almostProblem);
				}
			}
		} else {
			r.push(`You have <span class="intro question">an empty belly implant.</span>`);
		}
		if (V.PC.belly > (V.PC.pregAdaptation * 3200)) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"No. I'm putting my foot down here. If you go any bigger, your stomach could just split open. Nobody here wants to see that happen."`);
		} else if (V.PC.bellyImplant >= 750000 || (V.PC.bellyImplant >= 120000 && V.arcologies[0].FSTransformationFetishistResearch !== 1)) {
			App.Events.addNode(el, r, "div");
			r = [];
			r.push(`"That implant is at capacity. We're not about to overfill it and risk liability of it bursting in you."`);
		} else {
			linkArray.push(surgeryLink(`Have a lot of filler added`, "bellyUp", () => {
				healthDamage(V.PC, 10);
				V.PC.bellyImplant += 600;
				V.PC.belly += 600;
				cashX(forceNeg(applyDiscount(3000, true)), "PCmedical");
			}));
			linkArray.push(surgeryLink(`Have filler added`, "bellyUp", () => {
				healthDamage(V.PC, 5);
				V.PC.bellyImplant += 200;
				V.PC.belly += 200;
				cashX(forceNeg(applyDiscount(1000, true)), "PCmedical");
			}));
		}
		if (V.PC.bellyImplant > 0) {
			if (V.PC.bellyImplant >= 1000) {
				linkArray.push(surgeryLink(`Get the largest filler draining`, "bellyDown", () => {
					healthDamage(V.PC, 5);
					V.PC.bellyImplant -= 1000;
					V.PC.belly -= 1000;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			}
			if (V.PC.bellyImplant >= 500) {
				linkArray.push(surgeryLink(`Have a lot of filler drained`, "bellyDown", () => {
					healthDamage(V.PC, 5);
					V.PC.bellyImplant -= 500;
					V.PC.belly -= 500;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			}
			if (V.PC.bellyImplant >= 200) {
				linkArray.push(surgeryLink(`Have filler drained`, "bellyDown", () => {
					healthDamage(V.PC, 5);
					V.PC.bellyImplant -= 200;
					V.PC.belly -= 200;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			}
			if (V.PC.bellyImplant < 200) {
				linkArray.push(surgeryLink(`Empty all filler`, "bellyDown", () => {
					healthDamage(V.PC, 5);
					V.PC.bellyImplant = 0;
					SetBellySize(V.PC);
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			} else {
				linkArray.push(surgeryLink(`Empty all filler`, "bellyDownHuge", () => {
					healthDamage(V.PC, 5);
					V.PC.bellyImplant = 0;
					SetBellySize(V.PC);
					cashX(forceNeg(applyDiscount(5000)), "PCmedical");
				}));
			}
			linkArray.push(surgeryLink(`Have your implant drained and removed`, "bellyOut", () => {
				healthDamage(V.PC, 20);
				V.PC.bellyImplant = -1;
				SetBellySize(V.PC);
				cashX(forceNeg(applyDiscount(30000)), "PCmedical");
			}));
		} else {
			linkArray.push(surgeryLink(`Have your implant removed`, "bellyOut", () => {
				healthDamage(V.PC, 15);
				V.PC.bellyImplant = -1;
				cashX(forceNeg(applyDiscount(15000)), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their butt size
	 */
	function butt() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			r.push(`"Perhaps you'd like a butt like mine?" ${heU} teases as ${heU} runs a finger across ${hisU} curves. "Same prices as the breasts." ${HeU} gives it an enticing slap.`);
		} else {
			r.push(`"How about a new butt?" ${heU} says as ${heU} wiggles ${hisU} own at you. "Same prices as the breasts." ${HeU} gives it an enticing slap.`);
		}
		if (V.PC.buttImplant > 0) {
			if (V.PC.buttImplantType === "string") {
				r.push(`"Those terrible string implants you've got just can't be comfortable to sit on." ${HeU} chits unapprovingly at them, "A pair of modern implants could be swapped in for <span class="cash">${cashFormat(applyDiscount(10000, true))}</span> if you wanted. Or <span class="cash">${cashFormat(applyDiscount(5000))}</span> to just be rid of them. Of course we can just drain fluid from them for <span class="cash">${cashFormat(applyDiscount(500))},</span> but really, you should just get a fresh pair.`);
			} else if (V.PC.buttImplant < 3 && V.PC.buttImplant >= 2) {
				r.push(`"<span class="cash">${cashFormat(applyDiscount(10000, true))}</span> to upgrade to fillables or <span class="cash">${cashFormat(applyDiscount(5000))}</span> to take them out."`);
			} else if (V.PC.buttImplant < 5 && V.PC.buttImplant >= 4) {
				r.push(`"The next fillable size up is <span class="cash">${cashFormat(applyDiscount(10000, true))},</span> and <span class="cash">${cashFormat(applyDiscount(500))}</span> for a draining. We can remove them for <span class="cash">${cashFormat(applyDiscount(5000))}.</span>"`);
			} else if (V.PC.buttImplant < 9 && V.PC.buttImplant >= 8 && FutureSocieties.researchAvailable("TransformationFetishist")) {
				r.push(`"At your limit? We have some crazy advanced fillables we can put in for <span class="cash">${cashFormat(applyDiscount(10000, true))}.</span> Still will be <span class="cash">${cashFormat(applyDiscount(5000))}</span> to take 'em out and <span class="cash">${cashFormat(applyDiscount(500))}</span> to drain some filler."`);
			} else if (V.PC.buttImplant >= 3) {
				r.push(`"<span class="cash">${cashFormat(applyDiscount(1000, true))}</span> for filler, <span class="cash">${cashFormat(applyDiscount(500))}</span> to drain and <span class="cash">${cashFormat(applyDiscount(5000))}</span> to remove them."`);
			} else {
				r.push(`"<span class="cash">${cashFormat(applyDiscount(10000, true))}</span> for a bigger pair and <span class="cash">${cashFormat(applyDiscount(5000))}</span> to take them out."`);
			}
		} else {
			r.push(`"<span class="cash">${cashFormat(applyDiscount(10000, true))}</span> for implants, <span class="cash">${cashFormat(applyDiscount(5000))}</span> for a reduction, and <span class="cash">${cashFormat(applyDiscount(15000))}</span> for additional tissue."`);
		}
		App.Events.addNode(el, r, "div");
		r = [];
		r.push(`You have <span class="intro question">`);
		if (V.PC.butt > 14) {
			r.push(`an obscenely massive`);
		} else if (V.PC.butt > 10) {
			r.push(`an inhumanly large`);
		} else if (V.PC.butt > 7) {
			r.push(`an immense`);
		} else if (V.PC.butt > 6) {
			r.push(`a gigantic`);
		} else if (V.PC.butt > 5) {
			r.push(`an enormous`);
		} else if (V.PC.butt > 4) {
			r.push(`a huge`);
		} else if (V.PC.butt > 3) {
			r.push(`a large`);
		} else if (V.PC.butt > 2) {
			r.push(`an average`);
		} else if (V.PC.butt > 1) {
			r.push(`a small`);
		} else if (V.PC.butt > 0) {
			r.push(`a relatively flat`);
		} else {
			r.push(`no`);
		}
		r.push(`ass.</span>`);
		if (V.PC.buttImplant > 0) {
			r.push(`About <span class="intro question">${Math.floor((V.PC.buttImplant / V.PC.butt) * 100)}% of their volume consists of your ${V.PC.boobsImplantType !== "normal" ? `${V.PC.buttImplantType} ` : ``}implants.</span>`);
		}
		const isCrippled = "Your butt is debilitating; it's so large and bulbous that it obstructs your ability to walk.";
		const almostCrippled = "Your body just isn't built for a butt as big as yours; if it gets much larger, it might stop you from being able to walk.";
		const isProblem = "Your butt is so big it actively impedes your ability to run your arcology.";
		const almostProblem = "You can barely squeeze your rear into your clothes and are starting to get stuck in chairs; any bigger and it might seriously impede your ability to run your arcology.";
		if (V.PC.physicalAge > 12) {
			if (V.PC.butt > 22) {
				r.push(isCrippled);
			} else if (V.PC.butt > 21) {
				r.push(almostCrippled);
			} else if (V.PC.butt > 6) {
				r.push(isProblem);
			} else if (V.PC.butt >= 5) {
				r.push(almostProblem);
			}
		} else {
			if (V.PC.butt > 14) {
				r.push(isCrippled);
			} else if (V.PC.butt > 13) {
				r.push(almostCrippled);
			} else if (V.PC.butt > 6) {
				r.push(isProblem);
			} else if (V.PC.butt >= 5) {
				r.push(almostProblem);
			}
		}
		// Still hideous.
		if (V.PC.buttImplant > 0) {
			if (V.PC.buttImplantType === "string") {
				linkArray.push(surgeryLink("Upgrade to a newer implant", "buttImplantSwap", () => {
					healthDamage(V.PC, 15);
					// do selection based off size!
					cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
				}));
				if (V.PC.buttImplant > 1) {
					linkArray.push(buttReductionDrainImplant());
				}
			} else if (V.PC.buttImplant < 3 && V.PC.buttImplant >= 2) {
				linkArray.push(surgeryLink("Upgrade to fillable implants", "buttEnlargementImplant", () => {
					healthDamage(V.PC, 10);
					V.PC.butt += 1;
					V.PC.buttImplant += 1;
					V.PC.buttImplantType = "fillable";
					cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
				}));
				linkArray.push(buttReductionRemoveImplant());
			} else if (V.PC.buttImplant < 5 && V.PC.buttImplant >= 4) {
				linkArray.push(surgeryLink("Upgrade to advanced fillable implants", "buttEnlargementImplant", () => {
					healthDamage(V.PC, 10);
					V.PC.butt += 1;
					V.PC.buttImplant += 1;
					V.PC.buttImplantType = "advanced fillable";
					cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
				}));
				linkArray.push(
					buttReductionDrainImplant(),
					buttReductionRemoveImplant()
				);
			} else if (V.PC.buttImplant < 9 && V.PC.buttImplant >= 8 && FutureSocieties.researchAvailable("TransformationFetishist")) {
				linkArray.push(surgeryLink("Upgrade to hyper fillable implants", "buttEnlargementImplant", () => {
					healthDamage(V.PC, 10);
					V.PC.butt += 1;
					V.PC.buttImplant += 1;
					V.PC.buttImplantType = "hyper fillable";
					cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
				}));
				linkArray.push(
					buttReductionDrainImplant(),
					buttReductionRemoveImplant()
				);
			} else if (V.PC.buttImplant >= 3 && ["fillable", "advanced fillable", "hyper fillable"].includes(V.PC.buttImplantType)) { // fillables
				linkArray.push(buttEnlargementFillImplant());
				if (V.PC.buttImplant > 5) {
					linkArray.push(buttReductionDrainImplant());
				}
				linkArray.push(buttReductionRemoveImplant());
			} else { // non-fillables
				linkArray.push(
					buttEnlargementImplant(),
					buttReductionRemoveImplant()
				);
			}
		} else {
			linkArray.push(
				surgeryLink("Get a pair of butt implants", "buttEnlargementImplant", () => {
					V.PC.butt += 1;
					V.PC.buttImplant += 1;
					V.PC.buttImplantType = "normal";
					cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
				})
			);
			if (V.PC.butt >= 20) {
				linkArray.push(App.UI.DOM.disabledLink("Add additional fatty tissue", ["That ass is too fat and this is an intervention"]));
			} else {
				linkArray.push(buttEnlargement());
			}
			if (V.PC.butt < 1) {
				linkArray.push(App.UI.DOM.disabledLink("Have fat removed", ["Your ass is flat not fat"]));
			} else {
				linkArray.push(buttShrinkage());
			}
			if (V.PC.butt > 7) {
				App.Events.addNode(el, r, "div");
				r = [];
				r.push(`"Just so you know, if we stick a pair of implants in that ass, nobody will be able to tell. You'll probably need a few size ups for it to be noticeable."`);
			}
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;

		/**
		 * @returns {HTMLAnchorElement} a link for removal of butt implants
		 */
		function buttReductionRemoveImplant() {
			return surgeryLink("Have your implants removed", "buttReductionImplant", () => {
				healthDamage(V.PC, 10);
				V.PC.butt -= V.PC.buttImplant;
				V.PC.buttImplant = 0;
				V.PC.buttImplantType = "none";
				cashX(forceNeg(applyDiscount(5000)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for shrinkage of the butt via flesh removal
		 */
		function buttShrinkage() {
			return surgeryLink("Have fat removed", "buttShrinkage", () => {
				healthDamage(V.PC, 10);
				V.PC.butt -= 1;
				cashX(forceNeg(applyDiscount(5000)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for enlargement of the butt via implant
		 */
		function buttEnlargementImplant() {
			return surgeryLink("Get the next size up", "buttEnlargementImplant", () => {
				healthDamage(V.PC, 10);
				V.PC.butt += 1;
				V.PC.buttImplant += 1;
				cashX(forceNeg(applyDiscount(10000, true)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for enlargement of the butt via implant filler
		 */
		function buttEnlargementFillImplant() {
			return surgeryLink("Add additional filler", "buttEnlargementImplant", () => {
				healthDamage(V.PC, 10);
				V.PC.butt += 1;
				V.PC.buttImplant += 1;
				cashX(forceNeg(applyDiscount(1000, true)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for butt shrinkage via implant filler
		 */
		function buttReductionDrainImplant() {
			return surgeryLink("Drain filler", "buttReductionImplant", () => {
				healthDamage(V.PC, 5);
				V.PC.butt -= 1;
				V.PC.buttImplant -= 1;
				cashX(forceNeg(applyDiscount(500)), "PCmedical");
			});
		}

		/**
		 * @returns {HTMLAnchorElement} a link for enlargement of the butt via flesh
		 */
		function buttEnlargement() {
			return surgeryLink("Add additional fatty tissue", "buttEnlargement", () => {
				healthDamage(V.PC, 10);
				V.PC.butt += 1;
				cashX(forceNeg(applyDiscount(15000)), "PCmedical");
			});
		}
	}

	/**
	 * Fills out the tab for genital surgery
	 */
	function genitalsGroup() {
		const el = new DocumentFragment();
		if (V.PC.dick > 0) {
			el.append(dickGroup());
			App.Events.addParagraph(el, [``]);
			el.append(ballsGroup());
			App.Events.addParagraph(el, [``]);
		}
		if (V.PC.vagina >= 0) {
			el.append(vaginaGroup());
			App.Events.addParagraph(el, [``]);
		}
		el.append(anusGroup());
		App.Events.addParagraph(el, [``]);
		if (V.PC.dick === 0) {
			el.append(dickGroup());
			App.Events.addParagraph(el, [``]);
			el.append(ballsGroup());
			App.Events.addParagraph(el, [``]);
		}
		if (V.PC.vagina < 0) {
			el.append(vaginaGroup());
			App.Events.addParagraph(el, [``]);
		}
		el.append(ovaryGroup());
		return el;
	}


	/**
	 * Dick grouping for genital surgery
	 */
	function dickGroup() {
		const el = new DocumentFragment();
		if (V.PC.dick > 0) {
			el.append(foreskin());
			App.Events.addParagraph(el, [``]);
			el.append(removeDick());
		} else {
			el.append(addDick());
		}
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player alter their foreskin
	 */
	function foreskin() {
		const el = new DocumentFragment();
		let r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"Hmm, I don't know, maybe your dick would look nicer ${V.PC.foreskin > 0 ? `without the foreskin. Only <span class="cash">${cashFormat(applyDiscount(500))}</span> to snip it off` : `if it had a foreskin. Well aren't you lucky we can restore that for you? Only <span class="cash">${cashFormat(15000)}</span> to do so`}."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"If you're unhappy with your foreskin, or you felt you were robbed of ever having one, then you've come to the right place! It'll be <span class="cash">${cashFormat(applyDiscount(500))}</span> to trim it or remove it, pretty cheap right? But to actually undo a circumcision while looking good and restoring sensitivity isn't easy and will run you <span class="cash">${cashFormat(15000)}.</span>"`
			], "div");
		}
		if (V.PC.foreskin > 0) {
			if (V.PC.foreskin <= V.PC.dick) {
				linkArray.push(App.UI.DOM.disabledLink("Get a foreskin tuck", ["Your foreskin already fits perfectly"]));
			} else {
				linkArray.push(surgeryLink("Get a foreskin tuck", "foreskinDown", () => {
					V.PC.foreskin = V.PC.dick;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			}
			linkArray.push(surgeryLink("Get circumcised", "circumcision", () => {
				V.PC.foreskin = 0;
				cashX(forceNeg(applyDiscount(500)), "PCmedical");
			}));
		} else {
			linkArray.push(surgeryLink("Have your foreskin restored", "foreskinRestore", () => {
				healthDamage(V.PC, 10);
				V.PC.foreskin = Math.max(V.PC.dick -1, 1);
				cashX(forceNeg(15000), "PCmedical");
			}));
			if (V.PC.dick > 1) {
				App.Events.addNode(el, r, "div");
				r = [];
				r.push(`"It'll probably be a little tight."`);
			}
		}
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player remove their dick
	 */
	function removeDick() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"I suppose we could also just clip your dick off for <span class="cash">${cashFormat(15000)}.</span> Not entirely sure why'd you want to without any of the other touch ups a sex change would give, but you do you."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"We could also just remove your entire dick for <span class="cash">${cashFormat(15000)},</span> but I don't think you should, at least not this way. Getting a sex change covers so much more for a better price, but if you just wanted your dick gone for what ever reason, what can I say?" ${HeU} flushes a little, "Maybe that I'll miss it?"`
			], "div");
		}
		linkArray.push(surgeryLink("Get your dick removed", "dickGone", () => {
			healthDamage(V.PC, 30);
			V.PC.dick = 0;
			// and suddenly a clit appears if you have a pussy
			V.PC.foreskin = 0;
			cashX(forceNeg(15000), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player get a dick
	 */
	function addDick() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"We could just stick a penis on you for <span class="cash">${cashFormat(70000)},</span> but why would you want just a dick and nothing else related to it? You do want to get hard, right? Otherwise, what's the point? Go check out our gender modification offers for the real deal!"`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"If it's your thing, we could grow and attach a dick to you for <span class="cash">${cashFormat(70000)},</span> but it really would just be for the novelty." ${HeU} frowns, "You wouldn't even get hard without the extra bits. If you are truly interested in getting a working penis to play with, look into our sex change and augmentation offers."`
			], "div");
		}
		linkArray.push(surgeryLink("Get a dick", "newDick", () => {
			healthDamage(V.PC, 20);
			V.PC.dick = 2;
			V.PC.foreskin = 2;
			cashX(forceNeg(70000), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Testicle grouping for genital surgery
	 */
	function ballsGroup() {
		const el = new DocumentFragment();
		if (V.PC.balls > 0 && V.PC.scrotum > 0) {
			el.append(balls());
			App.Events.addParagraph(el, [``]);
			el.append(vasectomy());
			App.Events.addParagraph(el, [``]);
			el.append(scrotum());
			App.Events.addParagraph(el, [``]);
			el.append(removeBalls());
			App.Events.addParagraph(el, [``]);
		} else if (V.PC.balls > 0) {
			el.append(relocate());
			App.Events.addParagraph(el, [``]);
			el.append(vasectomy());
			App.Events.addParagraph(el, [``]);
			el.append(removeBalls());
			App.Events.addParagraph(el, [``]);
		}
		if (V.PC.balls === 0 || V.PC.scrotum > 0) {
			el.append(addBalls());
			App.Events.addParagraph(el, [``]);
		} else if (V.PC.balls > 0 && V.PC.ballType !== "human") {
			el.append(refreshBalls());
			App.Events.addParagraph(el, [``]);
		}
		el.append(prostate());
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their ball size
	 */
	function balls() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"Ever feel like you just lack balls? Or just need bigger ones to deal with life's nonsense? Let us help make you feel more manly with this filler gel for your testes! <span class="cash">${cashFormat(applyDiscount(7500))}</span> for draining and <span class="cash">${cashFormat(applyDiscount(12000, true))}</span> for filling, since I would expect that you'd want your family jewels to still work and all that." ${HeU} snuckers a little, "Anyway, they'll be very obvious, so everyone will know you mean business." ${HeU} takes another look at you before offering another option. "Of course, if you want bigger balls in a <i>functional</i> sense, we can do that too. The doctor's research in advanced targeted growth hormones has shown promising results in test subjects, and he's been able to use them successfully on a few citizen patients so far. A direct injection of hormones, and your testes will grow on their own. Unlike the cosmetic gel, there's no easily reversing this treatment, unless you are willing to subject yourself to slave drugs. It's expensive too, for the high quality drugs you want; <span class="cash">${cashFormat(25000)}</span> for one round of therapy. I should also warn you that repeated doses tend to have an increased effect."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"We could add gel around your testes to make your balls look bigger. Would also dampen any impacts to them as well, if that is anything to consider," ${heU} says, running a finger down the length of your shaft. "<span class="cash">${cashFormat(applyDiscount(7500))}</span> for draining and <span class="cash">${cashFormat(applyDiscount(12000, true))}</span> for filling, it's not the most simple procedure, you know? Anyway, they'll be very obvious, if that turns you on." ${HeU} takes another look at you before offering another option. "Of course, if you want bigger balls in a <i>functional</i> sense, we can do that too. The doctor's research in advanced targeted growth hormones has shown promising results in test subjects, and he's been able to use them successfully on a few citizen patients so far. A direct injection of hormones, and your testes will grow on their own. Unlike the cosmetic gel, there's no easily reversing this treatment, unless you are willing to subject yourself to slave drugs. It's expensive too, for the high quality drugs you want; <span class="cash">${cashFormat(25000)}</span> for one round of therapy. I should also warn you that repeated doses tend to have an increased effect."`
			], "div");
		}
		r.push(`You have a pair of<span class="intro question">`);
		if (V.PC.ballsImplant > 0) {
			r.push(`augmented,`);
		}
		if (V.PC.balls >= 30) {
			r.push(`inhumanly monstrous, hypertrophied`);
		} else if (V.PC.balls >= 14) {
			r.push(`inhumanly enormous, heavy`);
		} else if (V.PC.balls >= 10) {
			r.push(`inhumanly large`);
		} else if (V.PC.balls === 9) {
			r.push(`titanic`);
		} else if (V.PC.balls === 8) {
			r.push(`gigantic`);
		} else if (V.PC.balls === 7) {
			r.push(`monstrous`);
		} else if (V.PC.balls === 6) {
			r.push(`enormous`);
		} else if (V.PC.balls === 5) {
			r.push(`huge`);
		} else if (V.PC.balls === 4) {
			r.push(`big`);
		} else if (V.PC.balls === 3) {
			r.push(`average`);
		} else if (V.PC.balls === 2) {
			r.push(`small`);
		} else if (V.PC.balls === 1) {
			r.push(`tiny`);
		}
		r.push(`balls.</span>`);

		const isCrippled = "Your balls are debilitating; they're so large and bulbous that they either obstruct your ability to walk or serve as a sensitive anchor depending on their position.";
		const almostCrippled = "Your balls are simply too big to not be in the way of your legs; if they get much larger, you won't be able to step around them.";
		const isProblem = "It's troublesome to get around and even using furniture has become difficult due to your over-sized nuts. They're so large that they seriously impede your ability to run your arcology, or close your legs, for that matter.";
		const almostProblem = "You're beginning to have trouble moving around and using furniture thanks to your over-sized nuts, even bringing your legs together is a pain; any bigger and they might seriously impede your ability to run your arcology, or walk, for that matter.";
		if (V.PC.physicalAge > 12) {
			if (V.PC.balls >= 90 + (V.PC.muscles * 0.7)) {
				r.push(isCrippled);
			} else if (V.PC.balls >= 85 + (V.PC.muscles * 0.7)) {
				r.push(almostCrippled);
			} else if (V.PC.balls >= 14) {
				r.push(isProblem);
			} else if (V.PC.balls >= 9) {
				r.push(almostProblem);
			}
		} else {
			if (V.PC.balls >= (60 + V.PC.muscles * 0.5)) {
				r.push(isCrippled);
			} else if (V.PC.balls >= (55 + V.PC.muscles * 0.5)) {
				r.push(almostCrippled);
			} else if (V.PC.balls >= 14) {
				r.push(isProblem);
			} else if (V.PC.balls >= 9) {
				r.push(almostProblem);
			}
		}
		if (V.PC.balls >= 30) {
			if (V.PC.ballsImplant) {
				linkArray.push(
					surgeryLink("Have gel extracted", "ballShrinkage", () => {
						V.PC.balls -= 1;
						V.PC.ballsImplant -= 1;
						cashX(forceNeg(applyDiscount(7500)), "PCmedical");
					})
				);
				if (V.PC.ballsImplant > 2) {
					linkArray.push(
						surgeryLink("Have a lot of gel extracted", "ballBigShrinkage", () => {
							V.PC.balls -= 3;
							V.PC.ballsImplant -= 3;
							cashX(forceNeg(applyDiscount(7500)), "PCmedical");
						})
					);
				}
			}
		} else if (V.PC.balls >= 14) {
			if (V.PC.ballsImplant) {
				linkArray.push(
					surgeryLink("Have even more gel added", "ballEnlargement", () => {
						V.PC.balls += 4;
						V.PC.ballsImplant += 4;
						cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
					}),
					surgeryLink("Have gel extracted", "ballShrinkage", () => {
						V.PC.balls -= 1;
						V.PC.ballsImplant -= 1;
						cashX(forceNeg(applyDiscount(7500)), "PCmedical");
					})
				);
			} else {
				linkArray.push(surgeryLink("Get another round of growth hormones anyway", "ballEnlargementHorm", () => {
					V.PC.balls += 10;
					cashX(forceNeg(25000), "PCmedical");
				}));
			}
		} else if (V.PC.balls >= 9) {
			if (V.PC.ballsImplant) {
				linkArray.push(
					surgeryLink("Have more gel added", "ballEnlargement", () => {
						V.PC.balls += 3;
						V.PC.ballsImplant += 3;
						cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
					}),
					surgeryLink("Have gel extracted", "ballShrinkage", () => {
						V.PC.balls -= 1;
						V.PC.ballsImplant -= 1;
						cashX(forceNeg(applyDiscount(7500)), "PCmedical");
					})
				);
			} else {
				linkArray.push(surgeryLink("Get another round of growth hormones", "ballEnlargementHorm", () => {
					V.PC.balls += 6;
					cashX(forceNeg(25000), "PCmedical");
				}));
			}
		} else if (V.PC.balls >= 5) {
			if (V.PC.ballsImplant) {
				linkArray.push(
					surgeryLink("Have more gel added", "ballEnlargement", () => {
						V.PC.balls += 2;
						V.PC.ballsImplant += 2;
						cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
					}),
					surgeryLink("Have gel extracted", "ballShrinkage", () => {
						V.PC.balls -= 1;
						V.PC.ballsImplant -= 1;
						cashX(forceNeg(applyDiscount(7500)), "PCmedical");
					})
				);
			} else {
				linkArray.push(surgeryLink("Get another round of growth hormones", "ballEnlargementHorm", () => {
					V.PC.balls += 4;
					cashX(forceNeg(25000), "PCmedical");
				}));
			}
		} else {
			linkArray.push(
				surgeryLink("Get hormone treatment", "ballEnlargementHorm", () => {
					V.PC.balls += 2;
					cashX(forceNeg(25000), "PCmedical");
				}),
				surgeryLink("Have the gel added", "ballEnlargement", () => {
					V.PC.balls += 2;
					V.PC.ballsImplant += 2;
					cashX(forceNeg(applyDiscount(12000, true)), "PCmedical");
				})
			);
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player get or reverse a vasectomy
	 */
	function vasectomy() {
		const el = new DocumentFragment();
		const linkArray = [];
		App.Events.addNode(el, [
			`"If your main concern is accidentally siring a bastard, a quick little snip for only <span class="cash">${cashFormat(applyDiscount(500))}</span> will wipe those worries away! It's just as easy to undo, should you decide you miss the risk."`
		], "div");
		if (V.PC.vasectomy) {
			linkArray.push(surgeryLink("Undo your vasectomy", "vasectomy", () => {
				healthDamage(V.PC, 5);
				V.PC.vasectomy = 0;
				cashX(forceNeg(applyDiscount(500)), "PCmedical");
			}));
		} else {
			linkArray.push(surgeryLink("Get a vasectomy", "vasectomy", () => {
				healthDamage(V.PC, 5);
				V.PC.vasectomy = 1;
				cashX(forceNeg(applyDiscount(500)), "PCmedical");
			}));
		}
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player tighten or lose their scrotum
	 */
	function scrotum() {
		const el = new DocumentFragment();
		const linkArray = [];
		App.Events.addNode(el, [
			`"Now it's pretty common for ballsacks to sag a bit over time, and I'm not saying yours does or anything, but should you feel the need to have a little loose skin taken off, it'll run you <span class="cash">${cashFormat(applyDiscount(500))}</span> too." ${HeU} pauses for a moment in thought, "Now there is this procedure to relocate testicles up into the abdomen, which might tempt some. I guess it really depends on how you want to present yourself, but frankly dicks should come with balls. But I digress, if it's something you want, it will cost <span class="cash">${cashFormat(10000)}."</span>`
		], "div");
		if (V.PC.scrotum <= V.PC.balls) {
			linkArray.push(App.UI.DOM.disabledLink("Get a scrotal tuck", ["Your scrotum is not loose"]));
		} else {
			linkArray.push(surgeryLink("Get a scrotal tuck", "scrotum", () => {
				V.PC.scrotum = V.PC.balls;
				cashX(forceNeg(applyDiscount(500)), "PCmedical");
			}));
		}
		if (V.PC.balls > 2) {
			linkArray.push(App.UI.DOM.disabledLink("Internalize your balls", ["They are too large to comfortably fit"]));
		} else {
			linkArray.push(surgeryLink("Internalize your balls", "internalBalls", () => {
				healthDamage(V.PC, 20);
				V.PC.scrotum = 0;
				cashX(forceNeg(10000), "PCmedical");
			}));
		}
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player remove their balls
	 */
	function removeBalls() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"Of course we can always just cut them ${V.PC.scrotum > 0 ? `off` : `out`}. If that's how you want to get your rocks off one last time it's gonna cost you <span class="cash">${cashFormat(8000)}."</span>`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"If you didn't want your balls any more, we can get rid of them for <span class="cash">${cashFormat(8000)},</span> no judgement."`
			], "div");
		}
		linkArray.push(surgeryLink("Remove your balls", "removeBalls", () => {
			healthDamage(V.PC, 15);
			V.PC.scrotum = 0;
			V.PC.balls = 0;
			V.PC.vasectomy = 0;
			cashX(forceNeg(8000), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player remove their balls
	 */
	function relocate() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"If you miss having balls that people can see, we can stitch together a scrotum and put them back where they belong. <span class="cash">${cashFormat(15000)}.</span> Yes it costs more, but you should have thought of that before you stuck them up in you."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"Honestly, dicks need balls. It's just weird otherwise. Since we'll need to craft a new scrotum, it's going to be a bit more expensive than moving them the first time. Undoing things will cost <span class="cash">${cashFormat(15000)}."</span>`
			], "div");
		}
		linkArray.push(surgeryLink("Put your balls back where they belong", "scrotum", () => {
			healthDamage(V.PC, 20);
			V.PC.scrotum = V.PC.balls;
			cashX(forceNeg(15000), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player regenerate their balls
	 */
	function refreshBalls() {
		const el = new DocumentFragment();
		const r = [];
		r.push(`"To replace your balls with a new pair? <span class="cash">${cashFormat(50000)}</span> is our going price for testicles, so that much, I guess?"`);
		if (V.PC.balls > 4) {
			r.push(`${HeU} eyes your sack, "They will be smaller, just so you know."`);
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", surgeryLink("Regenerate your balls and fix your potency concerns", "replaceBalls", () => {
			V.PC.balls = 2;
			V.PC.ballType = "human";
			cashX(forceNeg(50000), "PCmedical");
		})));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player get new balls
	 */
	function addBalls() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"Ever wanted to just have a pair of balls? We can grow and stick 'em on you for only <span class="cash">${cashFormat(50000)}.</span> ${V.PC.dick > 0 ? `They'll complete the package for you.` : `You can sport your own set of trucknuts.`}"`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"We can grow a set of testicles and attach them to you for only <span class="cash">${cashFormat(50000)}.</span> They'll even work correctly, ${V.PC.dick > 0 ? `so you know I'll be eager to see that cock of yours rise to the occasion.` : `so I'm pretty excited to see what happens when you orgasm with them.`}"`
			], "div");
		}
		linkArray.push(surgeryLink("Get a set of testicles", "newBalls", () => {
			healthDamage(V.PC, 20);
			V.PC.balls = 2;
			V.PC.ballType = "human";
			V.PC.scrotum = 2;
			cashX(forceNeg(50000), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player get new balls
	 */
	function prostate() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.PC.prostate > 0) {
			App.Events.addNode(el, [
				`"If you're having prostate troubles, we can remove it for <span class="cash">${cashFormat(20000)}.</span> We mostly focus on putting them in, but same concept for removal, so why not?"`
			], "div");
			linkArray.push(surgeryLink("Remove your prostate", "prostate", () => {
				healthDamage(V.PC, 20);
				V.PC.prostate = 0;
				V.PC.prostateImplant = 0;
				cashX(forceNeg(7000), "PCmedical");
			}));
		} else {
			App.Events.addNode(el, [
				`"${V.PC.dick > 0 ? `Getting a new prostate would make your loads all the better, don't you agree?` : `Have you ever consider having a prosate put in? If you ever really wanted to squirt, and I mean really squirt, on orgasm, this's the way to do it.`} <span class="cash">${cashFormat(20000)}'s</span> all it would take..."`
			], "div");
			linkArray.push(surgeryLink("Get a prostate", "prostate", () => {
				healthDamage(V.PC, 20);
				V.PC.prostate = 1;
				cashX(forceNeg(20000), "PCmedical");
			}));
		}
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Vagina grouping for genital surgery
	 */
	function vaginaGroup() {
		const el = new DocumentFragment();
		if (V.PC.vagina >= 0) {
			el.append(vagina());
			App.Events.addParagraph(el, [``]);
			if (V.PC.dick === 0) {
				el.append(clit());
				App.Events.addParagraph(el, [``]);
			}
			el.append(labia());
			App.Events.addParagraph(el, [``]);
			if (V.PC.bellyImplant >= 0 && (V.PC.cervixImplant === 0 || V.PC.cervixImplant === 2) && V.cervixImplants >= 1) {
				el.append(cervix());
				App.Events.addParagraph(el, [``]);
			}
			el.append(removeVagina());
		} else {
			el.append(addVagina());
		}
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player tighten their vagina and/or restore their hymen
	 */
	function vagina() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		if (V.PC.vagina >= 2 && V.PC.newVag === 0) {
			r.push(`"${V.PC.vagina > 2 ? `Looking a little loose down there; we can fix that for you. Get you nice and tight again.` : `Starting to get a little experience? Not as tight as you once were? We can fix that for you.`} Oh, and our pussies are guaranteed to not lose their tightness, or your money back! <span class="cash">${cashFormat(15000)}</span> for a brand new vagina, or just <span class="cash">${cashFormat(applyDiscount(4000))}</span> for a tightening." ${HeU} nods in favor of the offer, ${V.PC.preg < 1 ? "You can even get a hymen reconstruction if you want. Nobody will notice that your vagina has already been used, it will be a perfect work of craftsmanship" : "If you weren't pregnant, you could get a hymen reconstruction, think about it for when you have your uterus free"}. It costs <span class="cash">${cashFormat(applyDiscount(2000))}</span> more."`);
			if (getRumors("penetrative") > 0) {
				r.push(`${HeU} thinks for a moment and adds: "The advantage of having an intact hymen is that ${V.doctor.state > 0 ? "your" : "a renowned "} doctor can certify your virginity: this will help to reduce the rumors about you. It will cost you another <span class="cash">${cashFormat(2000)},</span> but it is worth it."`);
			}
			linkArray.push(surgeryLink("Get a tighter vagina", "tightPussy", () => {
				healthDamage(V.PC, 25);
				V.PC.vagina = 1;
				V.PC.newVag = 1;
				cashX(forceNeg(15000), "PCmedical");
			}));
			linkArray.push(surgeryLink("Just have yours tightened", "tightPussy", () => {
				healthDamage(V.PC, 10);
				V.PC.vagina = 1;
				cashX(forceNeg(applyDiscount(4000)), "PCmedical");
			}));
			if (V.PC.preg <= 0) {
				linkArray.push(surgeryLink("Get a tight virgin vagina", "tightPussy", () => {
					healthDamage(V.PC, 25);
					V.PC.vagina = 0;
					V.PC.newVag = 1;
					V.PC.trueVirgin = 0;
					V.PC.counter.reHymen = V.PC.counter.reHymen ? V.PC.counter.reHymen + 1 : 1;
					if (getRumors("penetrative") > 0) {
						cashX(forceNeg(19000), "PCmedical");
					} else {
						cashX(forceNeg(17000), "PCmedical");
					}
				}));
			}
		} else if (V.PC.vagina > 0) {
			if (V.PC.preg <= 0) {
				r.push(`"It looks like you have lost the warranty seal${V.PC.counter.reHymen ? " again" : ""}. We can give you a hymen reconstruction for only <span class="cash">${cashFormat(2000)}.</span> No one will notice that your vagina has ${V.PC.counter.vaginal/V.week > 10 ? "largely" : ""} been used${V.PC.counter.raped > 0 ? " and abused" : ""}, it will be a perfect work of craftsmanship. The surgery will also serve to make your duct narrow like"`);
				if (V.PC.physicalAge < 13 || V.PC.actualAge < 13) {
					r.push("a child like you is supposed to have.");
				} else if (V.PC.visualAge < 13) {
					r.push("the child you look like is supposed to have.");
				} else if (!V.PC.pubertyXX) {
					r.push(`a prepubescent ${V.PC.genes === "XX" ? "girl" : "boy with vagina"} like you is supposed to have.`);
				} else if (V.PC.genes === "XX") {
					r.push("as you had it at birth.");
				} else {
					r.push("that of a preteen girl.");
				}
				if (getRumors("penetrative") > 0) {
					r.push(`${HeU} thinks for a moment and adds: "The advantage of having an intact hymen is that ${V.doctor.state > 0 ? "your" : "a renowned "} doctor can certify your virginity: this will help to reduce the rumors about you. It will cost you <span class="cash">${cashFormat(2000)}</span> more, but it is worth it."`);
				}
				linkArray.push(surgeryLink("Get your hymen restored", "reVirgin", () => {
					healthDamage(V.PC, 5);
					V.PC.vagina = 0;
					V.PC.trueVirgin = 0;
					V.PC.counter.reHymen = V.PC.counter.reHymen ? V.PC.counter.reHymen + 1 : 1;
					if (getRumors("penetrative") > 0) {
						cashX(forceNeg(4000), "PCmedical");
					} else {
						cashX(forceNeg(2000), "PCmedical");
					}
				}));
			} else {
				r.push(`"It looks like you have lost the warranty seal${V.PC.counter.reHymen ? " again" : ""}. If you weren't pregnant, we could give you a hymen reconstruction for only <span class="cash">${cashFormat(2000)}.</span> No one would notice that your vagina has ${V.PC.counter.vaginal/V.week > 10 ? "largely" : ""} been used${V.PC.counter.raped > 0 ? " and abused" : ""}, it would be a perfect work of craftsmanship. The surgery would also serve to make your duct narrow like"`);
				if (V.PC.physicalAge < 13 || V.PC.actualAge < 13) {
					r.push("a child like you is supposed to have.");
				} else if (V.PC.visualAge < 13) {
					r.push("the child you look like is supposed to have.");
				} else if (!V.PC.pubertyXX) {
					r.push(`a prepubescent ${V.PC.genes === "XX" ? "girl" : "boy with vagina"} like you is supposed to have.`);
				} else if (V.PC.genes === "XX") {
					r.push("as you had it at birth.");
				} else {
					r.push("that of a preteen girl.");
				}
				if (getRumors("penetrative") > 0) {
					r.push(`${HeU} thinks for a moment and adds: "The advantage of having an intact hymen is that ${V.doctor.state > 0 ? "your" : "a renowned "} doctor can certify your virginity: this would help to reduce the rumors about you. It would cost you <span class="cash">${cashFormat(2000)}</span> more, but it is worth it."`);
				}
				r.push(`${He} makes a resigned face and tells you "Come back when you're not pregnant if you're interested."`);
			}
		}

		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player alter their clit and hood
	 */
	function clit() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"${V.PC.clit >= 3 ? `Looks like you're popping a bit of a boner there, oh wait, that's just your clit.` : `Feel like your clit is just a little too big and maybe makes you tent your panties at times?`} We can trim it down for <span class="cash">${cashFormat(5000)}.</span> We can also correct any issues you may have with your hood for only <span class="cash">${cashFormat(applyDiscount(500))}."</span> ${HeU} quickly adds on, "And <span class="cash">${cashFormat(15000)}</span> to uncircumcise you, should that be your desire."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"${V.PC.clit >= 3 ? `That's some clit you have there. Bit penisish if you ask me.` : `Ever feel like your clit is a little unladylike?`} We can trim it down for <span class="cash">${cashFormat(5000)}.</span> We can also correct any issues you may have with your hood for only <span class="cash">${cashFormat(applyDiscount(500))}."</span>  ${HeU} quickly adds on, "And <span class="cash">${cashFormat(15000)}</span> to uncircumcise you, should that be what you're looking for."`
			], "div");
		}
		r.push(`You have <span class="intro question">`);
		if (V.PC.clit > 4) {
			r.push(`a massive`);
		} else if (V.PC.clit > 3) {
			r.push(`a penis-like`);
		} else if (V.PC.clit > 2) {
			r.push(`an enormous`);
		} else if (V.PC.clit > 1) {
			r.push(`a huge`);
		} else if (V.PC.clit > 0) {
			r.push(`a large`);
		} else {
			r.push(`a average`);
		}
		r.push(`clit</span> with`);
		if (V.PC.foreskin === 0) {
			r.push(`<span class="intro question">a circumcised hood.</span>`);
		} else if (V.PC.foreskin !== V.PC.clit || V.PC.clit >= 4) {
			r.push(`<span class="intro question">an ill-fitting hood.</span>`);
		} else {
			r.push(`<span class="intro question">a normal hood.</span>`);
		}
		if (V.PC.clit > 0) {
			linkArray.push(surgeryLink(`Have your clit reduced`, "clitDown", () => {
				healthDamage(V.PC, 15);
				V.PC.clit -= 1;
				cashX(forceNeg(5000), "PCmedical");
			}));
		} else {
			linkArray.push(App.UI.DOM.disabledLink("Have your clit reduced", ["Your clit can't get any smaller"]));
		}
		if (V.PC.foreskin > 0) {
			if (V.PC.foreskin !== V.PC.clit) {
				linkArray.push(surgeryLink(`Refit your clitoral hood`, "clitHood", () => {
					healthDamage(V.PC, 5);
					V.PC.foreskin = V.PC.clit;
					cashX(forceNeg(applyDiscount(500)), "PCmedical");
				}));
			} else {
				linkArray.push(App.UI.DOM.disabledLink("Refit your clitoral hood", ["Your hood fits your clit as well as it ever will"]));
			}
			linkArray.push(surgeryLink(`Get circumcised`, "clitHood", () => {
				healthDamage(V.PC, 5);
				V.PC.foreskin = 0;
				cashX(forceNeg(applyDiscount(500)), "PCmedical");
			}));
		} else {
			linkArray.push(surgeryLink(`Have your clitoral hood restored`, "clitHood", () => {
				healthDamage(V.PC, 10);
				V.PC.foreskin = V.PC.clit;
				cashX(forceNeg(15000), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player alter their labia
	 */
	function labia() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"Think your labia is a little too large for comfort? Or maybe it's too small for your kinks? Adjustments cost a mere <span class="cash">${cashFormat(applyDiscount(1000))}."</span> ${HeU} clarifies, "Quite a bit of bloodflow in there, not a simple snip and go, you know?"`
		], "div");
		r.push(`Yours are <span class="intro question">`);
		if (V.PC.labia === 0) {
			r.push(`small and cute.</span>`);
		} else if (V.PC.labia === 1) {
			r.push(`big and puffy.</span>`);
		} else if (V.PC.labia === 2) {
			r.push(`pretty huge.</span>`);
		} else {
			r.push(`huge and drooping.</span>`);
		}
		if (V.PC.labia === 0) {
			linkArray.push(App.UI.DOM.disabledLink("Have your labia reduced", ["Your labia can't be reduced further"]));
		} else {
			linkArray.push(surgeryLink(`Have your labia reduced`, "labia", () => {
				healthDamage(V.PC, 10);
				V.PC.labia -= 1;
				cashX(forceNeg(applyDiscount(1000)), "PCmedical");
			}));
		}
		if (V.PC.labia > 2) {
			linkArray.push(App.UI.DOM.disabledLink("Get your labia enlarged", ["Your labia can't be enlarged further"]));
		} else {
			linkArray.push(surgeryLink(`Have your labia enlarged`, "labia", () => {
				healthDamage(V.PC, 15);
				V.PC.labia += 1;
				cashX(forceNeg(applyDiscount(1000)), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player implant the cervix micro pump filter
	 */
	function cervix() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.PC.cervixImplant === 2) {
			App.Events.addNode(el, [
				`"So your belly grows whenever your butt takes a load, and you want us to hook that pump up to your pussy too." ${HeU} stares at you incredulously, "Okay. It will cost you <span class="cash">${cashFormat(30000)}</span> because, at this point, I think you're just testing how much we are willing to do."`
			], "div");
			linkArray.push(surgeryLink(`Install the secondary cervix implant`, "cervix", () => {
				healthDamage(V.PC, 30);
				V.PC.cervixImplant = 3;
				cashX(forceNeg(30000), "PCmedical");
			}));
		} else {
			App.Events.addNode(el, [
				`"A pump to generate and transfer filler to inflate your belly when you get banged." ${HeU} stares at you incredulously, "Well if you can provide us with it, I guess we could stick it in for <span class="cash">${cashFormat(15000)},</span> but really, let's not make this a habit. There is a lot of liability involved with these bizarre requests."`
			], "div");
			linkArray.push(surgeryLink(`Install the cervix implant`, "cervix", () => {
				healthDamage(V.PC, 30);
				V.PC.cervixImplant = 1;
				cashX(forceNeg(15000), "PCmedical");
			}));
		}
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player remove their vagina
	 */
	function removeVagina() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"We could extract your pussy for <span class="cash">${cashFormat(20000)},</span> but I don't know why you'd want to. I know I enjoy mine quite a bit."`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"If you don't want your pussy anymore, it would take <span class="cash">${cashFormat(20000)}</span> to remove it." ${HeU} slips a finger down ${hisU} skirt, "I'd never give mine up. Ever."`
			], "div");
		}
		if (V.PC.preg > 3) {
			if (V.PC.mpreg > 0) {
				r.push(`"Ah, but we can't do that with you being pregnant. How would the baby come out of you?"`);
			} else {
				r.push(`"Ah, but we can't do that with you being pregnant. How would the baby come out of you?" You take a moment to correct ${himU}, "Out the butt. Really?"`);
				linkArray.push(surgeryLink("Get your vagina removed", "vaginaGone", () => {
					healthDamage(V.PC, 30);
					V.PC.vagina = 0;
					V.PC.labia = 0;
					V.PC.clit = 0;
					V.PC.preferredHole = 0;
					cashX(forceNeg(20000), "PCmedical");
				}));
			}
		} else if (V.PC.preg > 0 && V.PC.mpreg === 0) {
			linkArray.push(App.UI.DOM.disabledLink("Get your vagina removed", ["This is a placeholder for reasons that will become apparent in a few weeks"]));
			// requires no hole pregnancy support
		} else {
			linkArray.push(surgeryLink("Get your vagina removed", "vaginaGone", () => {
				healthDamage(V.PC, 30);
				V.PC.vagina = 0;
				V.PC.labia = 0;
				V.PC.clit = 0;
				V.PC.preferredHole = 0;
				cashX(forceNeg(20000), "PCmedical");
			}));
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player get a vagina
	 */
	function addVagina() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"Joining the girls' club and getting a pussy will only cost you <span class="cash">${cashFormat(80000)}.</span> A definite steal!" ${HeU} winks at you, "But of course, it doesn't come with all the other parts you'll need so, if you want to do it proper, check out our sex change options.`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"Let me tell you, a pussy is a wonderful thing to have. And since yours will be hand crafted, you don't have to worry about taking your virginity and can just enjoy having it filled," ${heU} wiggles at the thought, "all the time." Uh, right! <span class="cash">${cashFormat(80000)}</span> is all it would take to have one installed. Now of course, you could go all the way, but that's a matter for our sex change options."`
			], "div");
		}
		linkArray.push(surgeryLink("Get a vagina", "newVagina", () => {
			healthDamage(V.PC, 40);
			V.PC.vagina = 1;
			cashX(forceNeg(80000), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Anal grouping for genital surgery
	 */
	function anusGroup() {
		const el = new DocumentFragment();
		el.append(anus());
		App.Events.addParagraph(el, [``]);
		if (V.PC.bellyImplant >= 0 && (V.PC.cervixImplant === 0 || V.PC.cervixImplant === 1) && V.cervixImplants >= 1) {
			el.append(rectum());
		}
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player fix their anus
	 */
	function anus() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.pSurgery.state > 1) {
			App.Events.addNode(el, [
				`"Now I know some people can be a little way too much into anal play and end up blowing out their asshole, so we've made sure to be fully able to tighten up your balloon knot. Only <span class="cash">${cashFormat(applyDiscount(4000))}</span> for nobody to be able to tell your proclivities! With a stretched hole often comes a more unsightly anus, but we can shrink that down to something more dainty for <span class="cash">${cashFormat(applyDiscount(700))}.</span>"`
			], "div");
		} else {
			App.Events.addNode(el, [
				`"Some people really like anal play and end up over doing it, but we can easily tighten up back up for <span class="cash">${cashFormat(applyDiscount(4000))},</span> yep yep! And even better, we can touch up an unsightly oversized anus for a mere <span class="cash">${cashFormat(applyDiscount(700))}!</span> Just no surprises up there, please."`
			], "div");
		}
		if (V.PC.anus <= 1) {
			linkArray.push(App.UI.DOM.disabledLink("Tighten your anus", ["Your anus thankfully isn't stretched out"]));
		} else {
			linkArray.push(surgeryLink("Tighten your anus", "analCleanup", () => {
				healthDamage(V.PC, 10);
				V.PC.anus = 1;
				cashX(forceNeg(applyDiscount(4000)), "PCmedical");
			}));
		}
		if (V.PC.analArea - V.PC.anus <= 0) {
			linkArray.push(App.UI.DOM.disabledLink("Reduce your anal ring", ["Yours fits your anus the way it should"]));
		} else {
			linkArray.push(surgeryLink("Reduce your anal ring", "analCleanup", () => {
				healthDamage(V.PC, 5);
				V.PC.analArea = V.PC.anus;
				cashX(forceNeg(applyDiscount(700)), "PCmedical");
			}));
		}
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player implant the cervix micro pump filter in their rectum
	 */
	function rectum() {
		const el = new DocumentFragment();
		const linkArray = [];
		if (V.PC.cervixImplant === 2) {
			App.Events.addNode(el, [
				`"So your belly grows whenever you take a load, and you want us to hook that pump up to your rectum too." ${HeU} stares at you incredulously, "You do realize you won't be able to eat normal food anymore, right? Well if that's what you want, <span class="cash">${cashFormat(30000)}</span> because, at this point, I think you're just testing how much we are willing to do."`
			], "div");
			linkArray.push(surgeryLink(`Install the secondary rectal implant`, "rectum", () => {
				healthDamage(V.PC, 30);
				V.PC.cervixImplant = 3;
				cashX(forceNeg(30000), "PCmedical");
			}));
		} else {
			App.Events.addNode(el, [
				`"A pump to generate and transfer filler to inflate your belly when you get anally banged." ${HeU} stares at you incredulously, "Won't that leave you unable to, you know, fully digest food? But if you're fine with that, I guess we could stick it in for <span class="cash">${cashFormat(15000)},</span> but really, let's not make this a habit. There is a lot of liability involved with these bizarre requests."`
			], "div");
			linkArray.push(surgeryLink(`Install the rectal implant`, "rectum", () => {
				healthDamage(V.PC, 30);
				V.PC.cervixImplant = 2;
				cashX(forceNeg(15000), "PCmedical");
			}));
		}
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Ovary grouping for genital surgery
	 */
	function ovaryGroup() {
		const el = new DocumentFragment();
		if (V.PC.mpreg === 1 || V.PC.ovaries > 0) {
			if (V.PC.ovaryAge >= 47 && V.PC.physicalAge < 70) {
				el.append(regenerateOvaries());
			} else if (V.PC.preg === -2) {
				el.append(restoreFertility());
			} else if (V.PC.preg < -2 || V.PC.eggType !== "human") {
				el.append(refreshOvaries());
			}
		} else if (V.PC.vagina >= 0) {
			el.append(addOvaries());
		}
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player undo menopause
	 */
	function regenerateOvaries() {
		const el = new DocumentFragment();
		const r = [];
		r.push(`"Now we can only do this so many times before your body just can't handle it, but if you ${V.PC.physicalAge > 50 ? "absolutely must have a child with your, um, vintage," : "are left wanting after releasing all your eggs,"} then we can do something for you. For <span class="cash">${cashFormat(50000)},</span> we can clone and replace your depleted ovaries with slightly younger ones. They'll get you a couple more years of ovulation before they dry up too, but if you're desperate for a child, they may be your last option."`);
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", surgeryLink("Regenerate your ovaries and cheat menopause for a couple more years", "ovulationRestart", () => {
			healthDamage(V.PC, 20);
			V.PC.ovaryAge = 45;
			V.PC.preg = 0;
			V.PC.ovaImplant = 0;
			V.PC.wombImplant = "none";
			if (V.menstruation === 1) {
				V.PC.fertPeak = 1;
			}
			cashX(forceNeg(50000), "PCmedical");
		})));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player undo basic sterilization
	 */
	function restoreFertility() {
		const el = new DocumentFragment();
		const r = [];
		r.push(`"It's not my business as to why, but we can restore your fertility for <span class="cash">${cashFormat(50000)},</span> For <span class="cash">${cashFormat(500)}.</span> Children aren't really my thing, but as a women, I can understand the frustration of having that taken from you."`);
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", surgeryLink("Fix your fertility concerns", "replaceOvaries", () => {
			healthDamage(V.PC, 10);
			V.PC.preg = 0;
			if (V.menstruation === 1) {
				V.PC.fertPeak = 1;
			}
			cashX(forceNeg(applyDiscount(500)), "PCmedical");
		})));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player regenerate their ovaries
	 */
	function refreshOvaries() {
		const el = new DocumentFragment();
		const r = [];
		r.push(`"To replace your ovaries with a new pair? <span class="cash">${cashFormat(50000)}</span> is what we usually charge, would that work?"`);
		if (V.PC.preg > 3) {
			r.push(`${HeU} eyes your belly, "The pregnancy though. Probably best to not do surgery there. You can wait, right? I mean, you are already with${V.PC.preg === -3 || V.PC.eggType === "sterile" ? ` child.` : `, uh, a child?`}"`);
			App.Events.addNode(el, r, "div");
		} else {
			App.Events.addNode(el, r, "div");
			el.append(App.UI.DOM.makeElement("div", surgeryLink("Regenerate your ovaries and fix your fertility concerns", "replaceOvaries", () => {
				healthDamage(V.PC, 20);
				V.PC.preg = V.PC.preg === -3 ? 0 : V.PC.preg;
				V.PC.eggType = "human";
				V.PC.ovaImplant = 0;
				V.PC.wombImplant = "none";
				if (V.menstruation === 1) {
					V.PC.fertPeak = 1;
				}
				cashX(forceNeg(50000), "PCmedical");
			})));
		}
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player get ovaries. Requires a vagina.
	 */
	function addOvaries() {
		const el = new DocumentFragment();
		const linkArray = [];
		App.Events.addNode(el, [
			`"Can we interest you in a pair of ovaries and a womb to go with that pussy? Only <span class="cash">${cashFormat(50000)}!"</span>`
		], "div");
		linkArray.push(surgeryLink("Get a pair of ovaries", "replaceOvaries", () => {
			healthDamage(V.PC, 20);
			V.PC.ovaries = 1;
			V.PC.preg = 0;
			V.PC.eggType = "human";
			if (V.menstruation === 1) {
				V.PC.fertPeak = 1;
			}
			cashX(forceNeg(50000), "PCmedical");
		}));
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 * Appends a div to `el` that lets the player change their sex
	 */
	function sexType() {
		const el = new DocumentFragment();
		const r = [];
		const linkArray = [];
		App.Events.addNode(el, [
			`"Now, if what you are looking for is sex reassignment surgery, that's going to be more complicated. Personally I think you are fine the way you are, but if you insist on paying me, I won't say no to it. We'll need to take a DNA sample to clone the required organs, and that will take some time to complete, so tell me early if this is what you really want. I've had a few patients seeking a working set of both sexes, so if that gets you off, it is an option. As for prices, <span class="cash">${cashFormat(70000)}</span> for a sex swap, <span class="cash">${cashFormat(150000)}</span> to be a fully functional herm, oh and <span class="red">breasts are not included unless you undergo a full body remodeling.</span> You'll have to set up another appointment for that, however. Oh, and I guess <span class="cash">${cashFormat(40000)}</span> is fair for having a sex organ removed, if you have both. It's a very invasive procedure, as we will be near completely remodeling your body. I assure you, we do such fantastic work that no one will know you weren't naturally born that way! Oh, and due to the extent of the surgery, we will not perform the procedure if you are pregnant; please clean yourself out before you arrive."`
		], "div");
		if (V.PC.preg > 0) {
			r.push(`${HeU} pokes your belly. "You're pregnant. What did I tell you?"`);
		} else {
			if (V.PC.dick !== 0 && V.PC.vagina !== -1) {
				r.push(`You have <span class="intro question">male and female reproductive organs</span> and a <span class="intro question">`);
				if (V.PC.title > 0) {
					r.push(`masculine`);
				} else {
					r.push(`feminine`);
				}
				r.push(`build.</span> "We'll store some of your sperm for you, should you decide to lose your maleness, and have it shipped to your arcology. Who you decide to use it on, well... That's up to you!"`);
				linkArray.push(
					surgeryLink("Remove your male half", "herm2female", () => {
						healthDamage(V.PC, 60);
						V.PC.ballsImplant = 0;
						V.PC.balls = 0;
						V.PC.ballType = "human";
						V.PC.scrotum = 0;
						V.PC.dick = 0;
						V.PC.foreskin = 0;
						V.PC.prostate = 0;
						V.PC.prostateImplant = 0;
						V.PC.counter.storedCum += 10;
						cashX(forceNeg(40000), "PCmedical");
					})
				);
				if (V.PC.ovaries > 0) {
					linkArray.push(
						surgeryLink("Remove your female half", "herm2male", () => {
							healthDamage(V.PC, 60);
							V.PC.vagina = -1;
							V.PC.vaginaLube = 0;
							V.PC.preferredHole = 0;
							V.PC.labia = 0;
							V.PC.ovaries = 0;
							V.PC.ovaImplant = 0;
							V.PC.wombImplant = "none";
							V.PC.eggType = "human";
							V.PC.preg = 0;
							WombFlush(V.PC);
							cashX(forceNeg(40000), "PCmedical");
						}),
					);
				}
				if (V.PC.title > 0) {
					linkArray.push(surgeryLink("Remove your male half completely", "herm2truefemale", () => {
						healthDamage(V.PC, 80);
						V.PC.ballsImplant = 0;
						V.PC.balls = 0;
						V.PC.ballType = "human";
						V.PC.scrotum = 0;
						V.PC.dick = 0;
						V.PC.foreskin = 0;
						V.PC.prostate = 0;
						V.PC.prostateImplant = 0;
						V.PC.counter.storedCum += 10;
						V.PC.title = 0;
						generatePlayerPronouns(V.PC);
						cashX(forceNeg(40000), "PCmedical");
					}));
				} else if (V.PC.mpreg === 0) {
					linkArray.push(surgeryLink("Remove your female half completely", "herm2truemale", () => {
						healthDamage(V.PC, 80);
						V.PC.vagina = -1;
						V.PC.vaginaLube = 0;
						V.PC.preferredHole = 0;
						V.PC.labia = 0;
						V.PC.ovaries = 0;
						V.PC.ovaImplant = 0;
						V.PC.wombImplant = "none";
						V.PC.eggType = "human";
						V.PC.preg = 0;
						WombFlush(V.PC);
						V.PC.boobs = 100;
						V.PC.boobsImplant = 0;
						V.PC.boobsImplantType = "none";
						V.PC.lactation = 0;
						V.PC.title = 1;
						generatePlayerPronouns(V.PC);
						cashX(forceNeg(40000), "PCmedical");
					}));
				}
			} else if (V.PC.dick !== 0) {
				r.push(`You have <span class="intro question">male genitalia</span> and a <span class="intro question">`);
				if (V.PC.title > 0) {
					r.push(`masculine`);
				} else {
					r.push(`feminine`);
				}
				r.push(`build.</span> "We'll store some of your sperm for you, should you decide to lose your maleness, and have it shipped to your arcology. Who you decide to use it on, well... That's up to you!"`);
				linkArray.push(
					surgeryLink("Have your male organs replaced with female ones", "male2female", () => {
						healthDamage(V.PC, 80);
						V.PC.ballsImplant = 0;
						V.PC.balls = 0;
						V.PC.ballType = "human";
						V.PC.scrotum = 0;
						V.PC.dick = 0;
						V.PC.prostate = 0;
						V.PC.prostateImplant = 0;
						V.PC.counter.storedCum += 10;
						V.PC.vagina = 0;
						V.PC.clit = 0;
						V.PC.foreskin = 1;
						V.PC.vaginaLube = 0;
						V.PC.ovaries = V.PC.mpreg === 0 ? 1 : 0;
						V.PC.eggType = V.PC.mpreg === 0 ? "human" : V.PC.eggType;
						cashX(forceNeg(70000), "PCmedical");
					}),
					surgeryLink("Add a female reproductive tract", "male2herm", () => {
						healthDamage(V.PC, 60);
						V.PC.vagina = 1;
						V.PC.vaginaLube = 1;
						V.PC.ovaries = V.PC.mpreg === 0 ? 1 : 0;
						V.PC.preg = 0;
						V.PC.eggType = V.PC.mpreg === 0 ? "human" : V.PC.eggType;
						WombFlush(V.PC);
						cashX(forceNeg(150000), "PCmedical");
					}),
				);
				if (V.PC.title > 0) {
					linkArray.push(
						surgeryLink("Become a woman", "male2truefemale", () => {
							healthDamage(V.PC, 80);
							V.PC.ballsImplant = 0;
							V.PC.balls = 0;
							V.PC.ballType = "human";
							V.PC.scrotum = 0;
							V.PC.dick = 0;
							V.PC.prostate = 0;
							V.PC.prostateImplant = 0;
							V.PC.counter.storedCum += 10;
							V.PC.vagina = 0;
							V.PC.vaginaLube = 0;
							V.PC.clit = 0;
							V.PC.foreskin = 1;
							V.PC.preg = 0;
							V.PC.title = 0;
							V.PC.ovaries = V.PC.mpreg === 0 ? 1 : 0;
							V.PC.eggType = V.PC.mpreg === 0 ? "human" : V.PC.eggType;
							generatePlayerPronouns(V.PC);
							cashX(forceNeg(70000), "PCmedical");
						}),
						surgeryLink("Become a hermaphrodite girl", "male2hermfemale", () => {
							healthDamage(V.PC, 80);
							V.PC.vagina = 0;
							V.PC.vaginaLube = 0;
							V.PC.ovaries = V.PC.mpreg === 0 ? 1 : 0;
							V.PC.eggType = V.PC.mpreg === 0 ? "human" : V.PC.eggType;
							V.PC.preg = 0;
							WombFlush(V.PC);
							V.PC.title = 0;
							generatePlayerPronouns(V.PC);
							cashX(forceNeg(150000), "PCmedical");
						}),
					);
				}
			} else {
				r.push(`You have <span class="intro question">female genitalia</span> and a <span class="intro question">`);
				if (V.PC.title > 0) {
					r.push(`masculine`);
				} else {
					r.push(`feminine`);
				}
				r.push(`build.</span>`);
				linkArray.push(
					surgeryLink("Have your female organs replaced with male ones", "female2male", () => {
						healthDamage(V.PC, 80);
						V.PC.ballsImplant = 0;
						V.PC.balls = 3;
						V.PC.scrotum = 3;
						V.PC.dick = 4;
						V.PC.foreskin = 4;
						V.PC.prostate = 1;
						V.PC.vagina = -1;
						V.PC.vaginaLube = 0;
						V.PC.preferredHole = 0;
						V.PC.labia = 0;
						V.PC.ovaries = 0;
						V.PC.eggType = V.PC.mpreg === 0 ? "human" : V.PC.eggType;
						cashX(forceNeg(70000), "PCmedical");
					}),
					surgeryLink("Add a male reproductive tract", "female2herm", () => {
						healthDamage(V.PC, 60);
						V.PC.ballsImplant = 0;
						V.PC.balls = 3;
						V.PC.scrotum = 3;
						V.PC.dick = 4;
						V.PC.foreskin = 4;
						V.PC.prostate = 1;
						cashX(forceNeg(150000), "PCmedical");
					}),
				);
				if (V.PC.title === 0) {
					linkArray.push(
						surgeryLink("Become a man", "female2truemale", () => {
							healthDamage(V.PC, 80);
							V.PC.ballsImplant = 0;
							V.PC.balls = 3;
							V.PC.scrotum = 3;
							V.PC.dick = 4;
							V.PC.foreskin = 4;
							V.PC.prostate = 1;
							V.PC.vagina = -1;
							V.PC.vaginaLube = 0;
							V.PC.labia = 0;
							V.PC.preferredHole = 0;
							V.PC.ovaries = 0;
							V.PC.ovaImplant = V.PC.mpreg === 0 ? 0 : V.PC.ovaImplant;
							V.PC.wombImplant = V.PC.mpreg === 0 ? "none" : V.PC.wombImplant;
							V.PC.eggType = V.PC.mpreg === 0 ? "human" : V.PC.eggType;
							V.PC.preg = 0;
							WombFlush(V.PC);
							V.PC.title = 1;
							generatePlayerPronouns(V.PC);
							V.PC.boobs = 100;
							V.PC.boobsImplant = 0;
							V.PC.boobsImplantType = "none";
							V.PC.lactation = 0;
							cashX(forceNeg(70000), "PCmedical");
						}),
						surgeryLink("Become a hermaphrodite boy", "female2hermmale", () => {
							healthDamage(V.PC, 80);
							V.PC.balls = 3;
							V.PC.scrotum = 3;
							V.PC.dick = 4;
							V.PC.foreskin = 4;
							V.PC.prostate = 1;
							V.PC.title = 1;
							generatePlayerPronouns(V.PC);
							V.PC.boobs = 100;
							V.PC.boobsImplant = 0;
							V.PC.boobsImplantType = "none";
							V.PC.lactation = 0;
							cashX(forceNeg(150000), "PCmedical");
						}),
					);
				}
			}
		}
		App.Events.addNode(el, r, "div");
		el.append(App.UI.DOM.makeElement("div", App.UI.DOM.generateLinksStrip(linkArray)));
		return el;
	}

	/**
	 *
	 * @param {string} title
	 * @param {FC.Medicine.Surgery.Type} type
	 * @param {function():void} func
	 * @returns {HTMLAnchorElement}
	 */
	function surgeryLink(title, type, func) {
		return App.UI.DOM.link(
			title,
			() => {
				func();
				showDegradation(type);
			}
		);
	}

	/**
	 * Appends a DocumentFragment to `el` that shows the result of the player's surgery
	 * @param {FC.Medicine.Surgery.Type} type the type of surgery that was performed
	 */
	function showDegradation(type) {
		V.nextButton = "Continue";
		V.nextLink = "Manage Personal Affairs";
		App.Utils.scheduleSidebarRefresh();
		jQuery(el).empty().append(App.UI.PCSurgeryDegradation(type));
	}
};
