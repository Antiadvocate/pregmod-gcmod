// cSpell:ignore Cortez

/**
 * @file channel-01-talk.js - FCTV Channel 1: Talk
 *
 * Talk show channel featuring competitive reality shows.
 * Currently airing "Next Top Breeder" competition.
 */

App.Data.FCTV.channels.set(1, {
	tags: {},
	loop: true,
	get intro() {
		const r = [];
		r.push(`which is currently showing`);
		if (FCTV.channelCount(1, 12, 'lt')) {
			r.push(`the newest episode of a`);
		} else {
			r.push(`a repeat of the`);
		}
		r.push(`popular competitive reality`);
		if (FCTV.channelCount(1, 0, 'gt')) {
			r.push(`show: Next Top Breeder.`);
		} else {
			r.push(`show where several female citizens are competing for something.`);
		}
		return r.join(" ");
	},
	episode: [
		{
			get text() {
				const r = [];
				const MSL = App.Entity.facilities.masterSuite.employeesIDs().size;

				r.push(`<p>The intro sequence shows a succession of beautiful ladies either participating in a mixture of contrived competitions, or talking and going about their lives in a sorority-like setting.</p>`);
				r.push(`<p>The montage is overlaid with a narrator's voice: "12 of Canadia Arcology's most attractive women are all competing for the privilege of having the arcology owner's children. Clint Miles has desirable genes, and these ladies are determined to prove their worth as gestators. And here in Canadia, there are no restrictions on fertility drugs for the winner, so the competition this season is fierce! ${V.FCTV.channel.two} ladies have already been sent packing, who will be Canadia's... Next Top Breeder!?" The title finally pops up, redundantly labeling the show as 'Next Top Breeder: Canadia'.`);
				if (MSL >= 1 || S.Concubine) {
					r.push(`</p><p>You don't spend very much time actually watching the show; the randy opening, perverted competitions, and constant talk of creampies quickly has`);
					if (MSL >= 1 && S.Concubine) {
						r.push(`<span class="pink">${S.Concubine.slaveName}</span> eager for some attention from ${getPronouns(S.Concubine).possessive} own arcology owner. Of course, the same could be said for the other eager slaves living in your bedroom, and the situation quickly devolves into a lust-filled`);
						if (MSL > 1) {
							r.push(`orgy.`);
						} else {
							r.push(`threesome.`);
						}
					} else if (MSL === 0 && S.Concubine) {
						const {his2, him2, he2} = getPronouns(S.Concubine).appendSuffix(`2`);
						r.push(`<span class="pink">${S.Concubine.slaveName}</span> eager for some attention from ${his2} own arcology owner. You've trained ${him2} well, and ${he2} knows exactly how to please you. You spend the rest of the evening doing something a lot more fun than watching reality TV.`);
					} else {
						r.push(`the pleasure slaves in your bed eager for some attention from their own arcology owner. You spend the rest of the evening doing something a lot more fun than watching reality TV.`);
					}
				}
				r.push(`</p>`);

				return r.join(" ");
			}
		},
	]
});
