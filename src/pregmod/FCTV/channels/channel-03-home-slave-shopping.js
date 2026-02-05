/**
 * @file channel-03-home-slave-shopping.js - FCTV Channel 3: 'Home Slave Shopping'
 */

App.Data.FCTV.channels.set(3, {		// NOTE: These slaves are meant to be high quality and expensive, they are the product of the combined slave markets of all the Free Cities. Additionally, they won't follow the player's slave selling policies because they aren't being sold in the PC's arcology. Because they are purchased, it shouldn't be a balance issue or impact the game like a slave gift.
	tags: {},
	loop: true,
	// @ts-ignore
	disableSelection: true,
	intro: `which is currently streaming 'Home Slave Shopping'. It's a bit strange, shopping for slaves without inspecting them in person, but you have to admit it's kind of convenient. Plus, you might find something that'd be difficult to get in your own arcology's markets. You start watching at the end of one slave being displayed; the program goes into a lot of detail that isn't always available from shady salesmen at the market. Two hosts are displaying the merchandise and an older male reads details on each slave from a prompter, while a fit female works the slave for the camera to give viewers a good look at what they might purchase.`,
	/**
	 * Generates the outro content for a slave episode, including purchase option and description
	 * @param {object} slave - The slave object being displayed
	 * @param {number} show - The show/episode number, used to calculate price multipliers
	 * @returns {HTMLParagraphElement} A paragraph element containing purchase link and slave description
	 */
	outro: function(slave, show) {
		const p = document.createElement("p");
		let cost = slaveCost(slave);
		if (show < 3 || show > 6) {
			cost *= 1.3;
		} else if (show === 4) {
			cost *= 2;
		} else if (show === 6) {
			cost *= 0.7;
		}
		cost = 500 * Math.trunc(cost / 500);
		p.append(`The offered price is ${cashFormat(cost)}. `);

		if (V.cash >= cost) {
			p.append(
				App.UI.DOM.link(
					"Buy this contract.",
					() => {
						cashX(forceNeg(cost), "slaveTransfer", slave);
						jQuery("#fctv-watch").empty().append(App.UI.newSlaveIntro(slave));
					}
				)
			);
		} else {
			App.UI.DOM.appendNewElement("span", p, `You lack the necessary funds.`, ["red", "note"]);
		}
		p.append(App.Desc.longSlave(slave, {market: "generic"}));
		return p;
	},
	episode: [
		{// premium virgin
			tags: {},
			get slaves() { return [App.Data.FCTV.actors.premiumVirgin]; },
			/**
			 * Generates episode text for premium virgin slave showcase
			 * @param {object} slave - The slave being showcased
			 * @returns {string} HTML formatted episode text
			 */
			text: function(slave) {
				const {He, he} = getPronouns(slave);
				return `<p>"Next up, we have a premium virgin named ${slave.slaveName}." A bright pink "VV" symbol flashes on the corner of the screen. "Take a good look, because ${he} is a product of the famous sex slave breeding program at Arcturus Arcology. Like all the slaves they sell, ${he}'s a premium <span class="pink">double virgin.</span> ${He} has excellent breeding potential, and while ${he} isn't that skilled yet, ${he}'s got good intelligence and is already well acclimated to the life of a sex slave."</p>`;
			}
		},
		{// hyperpregnant
			tags: {},
			get slaves() { return [App.Data.FCTV.actors.hyperPregnant]; },
			/**
			 * Generates episode text for hyperpregnant slave showcase
			 * @param {object} slave - The slave being showcased
			 * @returns {string} HTML formatted episode text
			 */
			text: function(slave) {
				const r = [];
				const {his, he, him} = getPronouns(slave);
				r.push(`<p>"Next up, we have ${addA(slave.race)} breeder, young and healthy with an advanced`);
				if (V.seeHyperPreg === 0) {
					r.push(`<i><span class="pink">super pregnancy.</span></i>`);
				} else {
					r.push(`<span class="pink">hyper pregnancy.</span>`);
				}
				r.push(`${slave.slaveName} is really into making babies, and has even had ${his} hips surgically widened to help ${him} carry a large brood. Our tests here at HSS show that ${he}'s pregnant with ${slave.pregType} babies!"</p>`);
				return r.join(" ");
			}
		},
		{// superfetation
			tags: {preg: true},
			get slaves() { return [App.Data.FCTV.actors.superfetation]; },
			/**
			 * Generates episode text for superfetation slave showcase
			 * @param {object} slave - The slave being showcased
			 * @returns {string} HTML formatted episode text
			 */
			text: function(slave) {
				const r = [];
				const {girl, his, He, he, him} = getPronouns(slave);
				r.push(`<p>"Next up, we have a special slave named ${slave.slaveName} who has quite the gift, <span class="pink">superfetation!</span> ${He} can become pregnant while pregnant! Isn't that amazing? ${He} may have a few miles on ${him}, having just completed a double pregnancy, but with a trait like that, ${he}'s more than worth ${his} price if you like your ${girl}s to constantly have a bun in the oven."</p>`);
				return r.join(" ");
			}
		},
		{// MILF
			tags: {},
			get slaves() { return [App.Data.FCTV.actors.MILF]; },
			/**
			 * Generates episode text for MILF slave showcase
			 * @param {object} slave - The slave being showcased
			 * @returns {string} HTML formatted episode text
			 */
			text: function(slave) {
				const r = [];
				const {He, he} = getPronouns(slave);
				r.push(`<p>"Next up, we have ${addA(slave.race)} <span class="pink">MILF.</span> ${He}'s no longer young, but still quite attractive. ${He} has been a slave for many years now, and has been trained well. ${He} also has a good array of skills that you can put to use. ${He} has huge tits and a huge ass to play with, but ${he}'d also make good`);
				if (V.seePreg === 0) {
					r.push(`<i>sandwiches</i>."</p>`);
				} else {
					r.push(`stock for a breeding program."</p>`);
				}
				return r.join(" ");
			}
		},
		{// discount young hottie
			tags: {},
			get slaves() { return [App.Data.FCTV.actors.youngHottie]; },
			/**
			 * Generates episode text for discount young hottie slave showcase
			 * @param {object} slave - The slave being showcased
			 * @returns {string} HTML formatted episode text
			 */
			text: function(slave) {
				const r = [];
				const {girl, his, he, him} = getPronouns(slave);
				r.push(`<p>"Next up, we have a bargain discount offer on a young ${slave.race} ${girl}. Unlike our usual stock ${he}'s something of a <span class="red">disobedient</span> slave, but that means savings for you, and all the fun of breaking in a new slave. We have to admit that ${his} previous owner had a hard time training ${him}, but I'm sure you can tell that ${his} body has`);
				if (slave.clit > 4) {
					r.push(`potential, just look at the <span class="pink">clit</span> on ${him}!"</p>`);
				} else {
					r.push(`potential!"</p>`);
				}

				return r.join(" ");
			}
		},
		{// huge balls
			tags: {dicks: true},
			get slaves() { return [App.Data.FCTV.actors.hugeBalls]; },
			/**
			 * Generates episode text for huge balls slave showcase
			 * @param {object} slave - The slave being showcased
			 * @returns {string} HTML formatted episode text
			 */
			text: function(slave) {
				const r = [];
				const {his, He} = getPronouns(slave);
				r.push(`<p>"Next up, we have ${addA(slave.race)} cum cow. Just take a look at that pair of <span class="pink">massive balls.</span> This slave also has a prostate stimulating hormone implant to ramp up ${his} cum production even further. ${He}'s a perfect fit for your dairy, or even your own kitchen creamery!"</p>`);
				r.push(`<p>The woman helping to display the slaves shows her hand to the camera; it's coated in a sticky layer of precum from handling the cum cow's equipment.</p>`);
				return r.join(" ");
			}
		},
		{// mpreg dickgirl
			tags: {dicks: true, preg: true},
			get slaves() { return [App.Data.FCTV.actors.mpreg]; },
			/**
			 * Generates episode text for mpreg dickgirl slave showcase
			 * @param {object} slave - The slave being showcased
			 * @returns {string} HTML formatted episode text
			 */
			text: function(slave) {
				const {girl, his, he, him} = getPronouns(slave);
				return `<p>"Next up, we have a strong young ${slave.race} ${girl} that retains ${his} cock and balls. ${slave.slaveName} has something that makes ${him} special: thanks to medical science ${he}'s got a <span class="pink">functional ass womb.</span> That's right folks, this slave is fertile and can get knocked up if you inseminate ${his} asshole. That's pretty amazing, to be honest, and exceptionally rare. Don't let this opportunity slip by!"</p>`;
			}
		},
	]
});
