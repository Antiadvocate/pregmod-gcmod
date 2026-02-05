// cSpell:ignore SensaMaxx, MilkMaxx, Élégance, PheroLure

/**
 * @file channel-17-sextoy-channel.js - FCTV Channel 17: sextoy channel
 */

App.Data.FCTV.channels.set(17, {
	tags: {},
	loop: true,
	intro: `which frequently airs infomercials for various sextoys.`,
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
				const {He = ''} = S.Concubine ? getPronouns(S.Concubine) : {};
				const {title: Master = ''} = canTalk(S.Concubine) ? getEnunciation(S.Concubine) : {};

				if (V.boughtItem.toys.smartStrapon === 1) {
					r.push(`<p>It's a high-end strap-on; in fact, you already own it, or at least something similar to it.</p>`);
				} else {
					r.push(`<p>It appears to be a high-end strap-on of some sort.</p>`);
				}
				r.push(`<p>The commercial carries on showcasing the product's features. "It vibrates, it pulses! Hot and cold on demand! Want some lumps or bumps? Maybe rings that undulate? This flexible material allows the dildo to do it all! Guaranteed to fill any hole with our patented adjustable engorgement system, for that tight squeeze every time. And did we mention? All of this is feedbacked into YOU! With every thrust, you feel the sensation. Your partner about to cum? You better believe this toy will have you on the edge, ready to join them! This top of the line model even allows its owner to remotely control it, adjusting its settings to their exact desires. Order now, for the exclusive price of ${(cashFormat(3000))}!</p>`);
				if (V.boughtItem.toys.smartStrapon === 1) {
					if (V.PC.dick === 0 && V.PC.clit < 3) {
						r.push(`<p>You know you're happy with it. Your slaves probably are too.</p>`);
					} else {
						r.push(`<p>It was fun while it lasted, but it just doesn't beat having a real tool to fuck a slave with.</p>`);
					}
				} else {
					if (V.PC.dick > 0 || V.PC.clit >= 3) {
						r.push(`<p>While interesting, you have to say that you prefer your own tool.</p>`);
					} else if (FCTV.channelCount(17, 1, 'gt')) {
						if (V.PC.lusty > 0) {
							if (V.PC.vagina >= 0) {
								r.push(`<p>You need it. Even if it isn't going to go in you, those feedback settings sound too good to your lust-addled mind.</p>`);
							} else if (V.PC.anus > 0) {
								r.push(`<p>In your lust-addled state, you can't help but fantasize about filling your ass with it and finding out just how fun those settings really are.</p>`);
							} else {
								r.push(`<p>In your lust-addled state, you can't help but think about losing your anal cherry to such a toy.</p>`);
							}
						} else {
							r.push(`<p>It could be fun to play around with, but it sounds like your slaves would get more enjoyment out of it than you.</p>`);
						}
					} else {
						if (V.PC.lusty > 0 && V.PC.vagina === 0) {
							r.push(`<p>You kind of want it. Vibrators just don't cut it when you're fucking slaves, and it's not like you could use any penetrative toys during the act without throwing away your virginity.</p>`);
						} else {
							r.push(`<p>It could be fun to play around with, but it sounds like your slaves would get more enjoyment out of it than you.</p>`);
						}
						if (S.Concubine && canTalk(S.Concubine) && canSee(S.Concubine) && S.Concubine.fetish !== Fetish.MINDBROKEN) {
							r.push(`<p>${S.Concubine.slaveName} chimes in,`);
							if (S.Concubine.fetish === Fetish.PREGNANCY || S.Concubine.fetish === Fetish.CUMSLUT) {
								r.push(Spoken(S.Concubine, `"What? No squirt feature? ${Master}, does that sound like it "does it all" to you? ${isVirile(V.PC) ? "Can't even load your cum up in it and fill me up with it" : "It's no fun if it can't cum in me"}..."`));
							} else if (S.Concubine.energy > 95) {
								r.push(Spoken(S.Concubine, `"I call first fucking if you buy it!"`));
							} else if (S.Concubine.intelligence + S.Concubine.intelligenceImplant > 15) {
								r.push(Spoken(S.Concubine, `"Hmm, looks like it is missing some features, like a squirt function, for instance. It's supposed to be smart, right? So perhaps all the controllers inside of it just didn't leave room?"`));
							} else {
								r.push(Spoken(S.Concubine, `"${Master}, you aren't thinking what I'm thinking, are you? Heh, you dirty ${getPronouns(V.PC).girl}, you. I'm down for anything, you know."`));
								r.push(`${He} tosses you a wink and smiles seductively.`);
							}
							r.push(`</p>`);
						}
					}
					r.push(`<div id="called">`);
					r.push(App.UI.link(
						"Place an order",
						() => {
							V.boughtItem.toys.smartStrapon = 1;
							cashX(forceNeg(3000), "capEx");
							jQuery("#called").empty().append('Your order should arrive by the morning. When it does, your harem is in for some fun times.');
						}
					));
					r.push(`<i>This will cost ${cashFormat(3000)}</i></div>`);
				}

				return r.join(" ");
			}
		},
	]
});
