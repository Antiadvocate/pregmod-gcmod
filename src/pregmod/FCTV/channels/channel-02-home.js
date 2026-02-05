// cSpell:ignore factly

/**
 * @file channel-02-home.js - FCTV Channel 2: Home and Slave
 *
 * DIY home improvement show hosted by twin sisters.
 * Features modifications for enhanced slave anatomy and home installations.
 */

App.Data.FCTV.channels.set(2, {
	tags: {},
	loop: true,
	intro: `which is currently showing the 'Home and Slave' stream channel. The current show features a set of female twins wearing nothing but tool belts. Their assets aren't particularly noteworthy, but they have a great hourglass figure, toned muscles, and gorgeous girl-next-door faces. The girls are hosting a DIY show, and seem to be performing a lot of the work themselves. The occasional bead of sweat makes their smooth tan skin really stand out.`,
	episode: [
		{
			slaves: [
				App.Data.FCTV.actors.twin,
				App.Data.FCTV.actors.twin,
			],
			get text() {
				const r = [];
				r.push(`<p>It seems like this time they are working on modifications to an apartment to accommodate enormous anatomy. The pair demonstrate how to tastefully modify a doorway so that giant breasts,`);
				if (V.seeDicks === 0) {
					r.push(`<i>smiles</i>,`);
				} else {
					r.push(`testicles,`);
				}
				r.push(`and`);
				if (V.seePreg === 0) {
					r.push(`<i>hairdos</i>`);
				} else {
					r.push(`baby bumps`);
				}
				r.push(`can get through easily. Their final results weren't refined enough to use in your own home, but were pretty amazing for the economy-sized apartment they filmed at.</p>`);
				r.push(`<p>At the end of the show they test out the new doorways by bringing in a somewhat unusual slave. A naked`);
				if (V.seeDicks === 0) {
					r.push(`<i>funny cow</i>`);
				} else {
					r.push(`futanari`);
				}
				r.push(`wearing only a cowbell collar, she has massive milky tits, gigantic`);
				if (V.seeDicks === 0) {
					r.push(`<i>smile,</i>`);
				} else {
					r.push(`balls hanging low in her sack,`);
				}
				r.push(`and a belly engorged with what was probably a`);
				if (V.seePreg === 0) {
					r.push(`<i>five-course dinner.</i>`);
				} else {
					if (V.seeHyperPreg === 0) {
						r.push(`<i>single baby.</i>`);
					} else {
						r.push(`dozen babies.`);
					}
				}
				r.push(`</p><p>The`);
				if (V.seeDicks === 0) {
					r.push(`<i>fun</i>`);
				} else {
					r.push(`futa`);
				}
				r.push(`cow ambles through the modified door without a problem, resulting in a bouncy victory dance from the naked twins.</p>`);

				return r.join(" ");
			}
		},
		{
			slaves: [
				App.Data.FCTV.actors.twin,
				App.Data.FCTV.actors.twin,
			],
			get text() {
				const r = [];
				r.push(`<p>It seems like this time they are working on setting up a slave nutrition system inside a moderately-sized apartment. They're installing a deluxe system that has integrated nutritional sensing in addition to a food system that supplies the unit's two feeder/med-dispenser combo units. Amazingly, the whole thing fits into the kitchen without a problem, as they located the main system housing in the pantry. When they're finished, you couldn't tell the nutrition system is there, except for the two large dildos that are sticking out of the side of a cabinet.</p>`);
				r.push(`<p>After their work is done, you're treated to watching the young twins testing the system out. They each take one feeder and ride it to get a test suppository, before turning around and inhaling the cockfeeders for a small meal. You wonder at their choice for the order of events, sucking the cockfeeder they had just finished ramming up their ass, but they were so enthusiastic about it that you decide they probably liked it that way.</p>`);
				return r.join(" ");
			}
		},
		{
			slaves: [
				App.Data.FCTV.actors.twin,
				App.Data.FCTV.actors.twin,
			],
			get text() {
				const r = [];
				r.push(`<p>It seems like this time they are converting a bedroom into slave quarters. Rather than a complex or large project, this episode showcases a number of small projects. It's a pretty helpful show; a lot of what the nude twins cover will help owners house extra slaves without needing more space. The most interesting parts of the program to you are the slave training and libido upgrades they install.</p>`);
				r.push(`<p>The room is set up so that slaves sleep in something resembling bunk beds, though there are four beds instead of two. Instead of worrying about the lack of space, the twins use the confined sleeping arrangements as an advantage. A simple neural activity monitor combined with a few sources of stimulation or discomfort serve to condition the slaves while they sleep. The twins helpfully demonstrate for their audience the features of these beds. Part of the stain-proof mattress is covered with flexible strips of metal to conduct electricity for stimulation or pain. Focused speakers play naughty sounds, while a dim display can show a stream of pornography or other material without being bright enough to disturb the slave's sleep. The final addition is a quartet of vibrating dildos that extend from the bunk above to stimulate a slave while they sleep.</p>`);
				r.push(`<p>The whole setup seemed impressive, but you aren't really sure how effective it would be... particularly when you compare the likely cost of such a setup to an inexpensive cot on the floor.</p>`);
				return r.join(" ");
			}
		}
	]
});
