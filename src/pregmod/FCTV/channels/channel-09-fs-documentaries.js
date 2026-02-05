// cSpell:ignore Subjugationists

/**
 * @file channel-09-fs-documentaries.js - FCTV Channel 9: FS Documentaries
 */

App.Data.FCTV.channels.set(9, {
	tags: {},
	loop: true,
	intro: ` which is currently showing a documentary on the `,
	episode: [
		{
			get slaves() {
				const slave = App.Data.FCTV.actors.FSmodel;
				slave.belly = 10000;
				if (V.seeHyperPreg === 1) {
					slave.belly *= 2;
				}
				if (V.imageChoice === 4) { // compensate for WebGL's smaller bellies
					slave.belly *= 2;
				}
				slave.preg = 35;
				slave.makeup = 2;
				slave.clothes = "nice business attire";
				slave.shoes = "none";
				return [slave];
			},
			get text() {
				const r = [];
				r.push(`surging Repopulation movement: "Continuing the Dream". After the opening credits, the documentary introduces a young and extremely pregnant woman as the commentator. The program makes an impassioned argument about the need for a new generation of citizens and slaves that were born into the dream of the Free Cities. The woman is wearing semi-conservative business attire, and has on elegant makeup. She looks somewhat plain when compared to the hyper-sexualized style of other FCTV shows, though she does make it plain over the course of the program that she loves sex more than ever. She tends to use herself as an example to show that pregnancy no longer means limitations or sacrifice, instead emphasizing that she's on her fifth pregnancy and would rather be with child than without.`);
				r.push(`<p>The woman makes two main points during the course of the documentary. The first is that the combined population of the Free Cities needs to grow explosively for 'Free City Society' to become stable. She points out several economic reasons, including the drive to invest in research and infrastructure. She has interviews with experts explaining the need for independence; that the Free Cities are still dependent on the old world industrially and financially, and that the population must expand dramatically to avoid going down with the metaphorical ship. The more Free Cities there are, the more they become free and independent of the old world.</p>`);
				r.push(`<p>The second point concerns the source of the new citizens and slaves that the Free Cities need. Her arguments concerning citizens focus on the unique culture of the Free Cities, and the direction that the future society will take. She points out that immigrants from the old world are rooted in its decaying culture. She asks her viewers how long it took them to adapt to their new lives, and how often they find themselves doubting their new home subconsciously. She admits that even she sometimes finds something wrong or repulsive, until she realizes that it's the ghost of her past life clinging to her. A noted psychologist talks about the strong hold people's earlier lives has on them, and how developing the promise of the Free Cities will need a generation untainted by the old world. The documentary's argument for slaves largely comes down to the fact that second-generation slaves are happier, better adjusted, and simply better slaves.`);
				if (policies.countEugenicsSMRs() > 0) {
					r.push(`It also points out the practical problems that the mass importation of slaves will cause in the gene pool.`);
				}
				r.push(`</p><p>Overall, it's a convincing documentary, if a little too emotional for your tastes.</p>`);
				return r.join(" ");
			}
		},
		{
			get slaves() {
				const slave = App.Data.FCTV.actors.FSmodel;
				if (!FutureSocieties.isActive('FSGenderFundamentalist')) {
					slave.dick = 6;
					slave.boobs = 750;
					slave.clothes = "nice business attire";
					slave.shoes = "flats";
				} else if (!FutureSocieties.isActive('FSGenderRadicalist')) {
					slave.faceShape = "masculine";
					slave.waist = 120;
					slave.weight = 120;
					slave.boobs = 100;
					slave.butt = 0;
					slave.hips = -1;
					slave.shoulders = 1;
					slave.dick = 2;
					slave.clothes = "conservative clothing";
					slave.shoes = "flats";
				}
				return [slave];
			},
			get text() {
				const r = [];
				if (!FutureSocieties.isActive('FSGenderFundamentalist')) {
					r.push(`increasingly-popular Gender Radicalist movement titled: "Power, not Biology". After the opening credits, the documentary introduces an androgynous documentarian in a nicely-cut suit. The finely tailored suit doesn't try to hide the person's breasts, which seem to be a pretty average D-cup. Similarly, another bulge is visible stretching down one of the pants legs. The futanari opens with a pretty simple question: "Am I a man, or am I a woman?" The documentary is focused on answering that question in the context of a modern era where medical science means that genitalia are irrelevant. It argues that a person's body no longer has any relation to their sexuality or ambition, that being free means choosing the body that pleases you most, and that society needs new criteria from which to determine gender.`);
					r.push(`<p>The criteria suggested by the documentary is power. The idea is simple; the powerful are male, the weak are female. It argues that the biology and sexual proclivities of a person simply can't represent them any longer. The powerful are often free to choose the body and activities they wish to pursue, while the weak have those decisions made for them. It's a practical argument, and the documentary gives a long list of evidence supporting it, from expert interviews to ancient civilizations that followed a similar idea. The concept is somewhat appealing to you; after all, you wield extraordinary power, and a large part of that power includes altering the bodies of others. Whatever you choose to do, you can't see any reason to let your slaves and citizens criticize you for it.</p>`);
				} else if (!FutureSocieties.isActive('FSGenderRadicalist')) {
					r.push(`conservative Gender Fundamentalism movement titled: "It's Eve, NOT Steve". After the outdated graphics finish displaying the garish opening credits, a portly man in late middle age introduces himself as Reverend Brad, the apparent commentator of the program. You don't pay much attention, but learn that apparently the Futanari Sisters are whore agents of Satan. You also learn that you're apparently destined for hell because of the medical technology in your penthouse that could be used to alter someone's naughty bits. You did get a good laugh when the reverend started yelling that choir boys are boys, and if he wanted a girl he would've found a nun.`);
					r.push(`<p>You have to admit that most of the show is complete bullshit, but you can't deny that it's useful for controlling your citizens. As long as they're filling their heads with this bullshit, they won't be getting any dangerous ideas from somewhere else. In a more practical sense, it's a lot easier to manage an arcology and a house full of slaves when you don't have to worry about crazy gender issues or people disliking pregnant slaves.</p>`);
				}
				return r.join(" ");
			}
		},
		{
			get slaves() {
				const array = [];
				let slave = App.Data.FCTV.actors.FSmodel;
				if (!FutureSocieties.isActive('FSSlimnessEnthusiast')) {
					slave.dick = 4;
					slave.boobs = 100;
					slave.hLength = 10;
					slave.hColor = "black";
					slave.clothes = "conservative clothing";
					slave.shoes = "flats";
				} else if (!FutureSocieties.isActive('FSAssetExpansionist')) {
					slave.weight = -30;
					slave.butt = 0;
					slave.boobs = 450;
					slave.clothes = "a halter top dress"; // changed from "a slave gown" until WebGL model is changed
					slave.shoes = "heels";
				}
				array.push(slave);

				slave = baseSlave();
				slave.devotion = 0;
				slave.trust = 0;
				slave.hLength = 50;
				slave.hStyle = "luxurious";
				slave.hColor = "blonde";
				slave.boobs = 700;
				slave.boobShape = "perky";
				slave.waist = 180;
				slave.butt = 3;
				slave.hips = 3;
				slave.clothes = "a ball gown";
				slave.shoes = "heels";

				array.push(slave);
				return array;
			},

			get text() {
				const r = [];
				if (!FutureSocieties.isActive('FSSlimnessEnthusiast')) {
					r.push(`growing Asset Expansionist movement titled: "More of a Good Thing". After a brief set of opening credits the documentary dives immediately into short clips of numerous interviews with stacked women stating that they love having big tits and a big ass. Eventually, a man and woman are introduced as the hosts of the program. Both are finely dressed in the recent fashions, and despite the subject of the documentary, they don't have humongous assets. The woman does have huge breasts, wide hips, and a large derrière; the man has a noticeable bulge in his pants, but nothing extreme. The hosts explain that seeing Asset Expansionism as a call for ridiculous size is something of a misconception. They emphasize that it's about the freedom to enjoy more of a good thing.`);
					r.push(`<p>The documentary makes several arguments in favor of the movement, and is clear about explaining the natural biological attraction humans have to large assets. By interviewing stacked members of the movement and psychological experts alike, they try to demonstrate how larger assets lead to happier and more pleasurable lives, both in and out of the bedroom. The documentary neatly tops off its argument by demonstrating how assets have been expanding naturally since the start of the twentieth century, and claiming that it's silly to idolize the way humans looked before modern nutrition and medicine. Western countries in the old world already had average bust sizes of D-cup or larger by the turn of the century, the hosts claim that trying to go back to smaller sizes is synonymous with reducing the prosperity of free citizens.</p>`);
				} else if (!FutureSocieties.isActive('FSAssetExpansionist')) {
					r.push(`Slimness Enthusiast counter movement titled: "Slim Is In". Artistic opening credits play across the screen before a slim woman walks up and begins talking to the camera conversationally. She seems to be in her mid to late thirties, and is wearing conservative makeup to accent her natural beauty. Her narrow waist combines with her slim hips and full shoulders to create a balanced but muted hourglass profile. It's a look that was popular for decades on fashion models in the old world, and it improves the attractiveness of her B- or C-cup breasts and taut butt. It's obvious that the woman aspires to be a role model in addition to being the documentary's commentator.`);
					r.push(`<p>Much of the documentary's arguments center around the concept of fashion and the privileged. They point out how in the past societal changes have altered what people find attractive, giving skin tans as an example. When most worked outside and only the privileged stayed indoors pale skin was considered attractive. When the world changed and most people worked indoors, suddenly the tan skin of those with leisure time to spend outside came into vogue. She argues that modern hormones can easily expand the assets of the masses, but that only the privileged can afford to sculpt themselves into an ideal form like hers. She points out that even though the masses may imitate with surgery, they'll never be able to copy the naturally good bone structure and vibrancy of the well-bred elite.</p>`);
				}
				return r.join(" ");
			}
		},
		{
			get slaves() {
				const array = [];
				let slave;
				if (!FutureSocieties.isActive('FSTransformationFetishist')) {
					slave = App.Data.FCTV.actors.FSmodel;
					slave.devotion = 100;
					slave.trust = 100;
					slave.hLength = 50;
					slave.hStyle = "luxurious";
					slave.hColor = "blonde";
					slave.boobs = 700;
					slave.boobShape = "perky";
					slave.waist = 100;
					slave.butt = 3;
					slave.hips = 3;
					slave.clothes = "a ball gown";
					slave.shoes = "heels";
					array.push(slave);

					slave = baseSlave();
					slave.dick = 4;
					slave.boobs = 100;
					slave.hLength = 10;
					slave.hColor = "grey";
					slave.clothes = "conservative clothing";
					slave.shoes = "flats";
					array.push(slave);
				} else if (!FutureSocieties.isActive('FSBodyPurist')) {
					slave = baseSlave();
					slave.dick = 4;
					slave.boobs = 100;
					slave.hLength = 10;
					slave.hColor = "grey";
					slave.clothes = "a military uniform"; // closest thing to a noir detective trenchcoat we have
					slave.shoes = "flats";
					array.push(slave);
				}
				return array;
			},
			get text() {
				const r = [];
				if (!FutureSocieties.isActive('FSTransformationFetishist')) {
					r.push(`spreading Body Purist movement titled: "Don't Settle for Imitations". The opening credits are displayed over a series of comparison images showing beautiful breasts and asses next to obviously artificial imitations of the same. The screen splits and shows the two hosts in their own environments side by side. One is an extremely attractive doctor, her body is exquisitely curvy underneath her lab coat and her face is an impossible combination of beautiful and cute. The other host is an artist with graying hair; he's working in his studio to create a life-size sculpture of the first host. He starts off the documentary by asking why people are so eager to destroy the natural beauty of the human form. The doctor continues by asking why people are so impatient that they get implants instead of using a superior process of targeted hormonal growth.`);
					r.push(`<p>The documentary keeps up the two-viewpoint style and approaches the issue from two directions. The first is the stark aesthetic differences between natural and artificial bodies. It demonstrates why implants always fall short of the beauty they seek to imitate, and how those with implants are doomed to a vicious cycle of surgery to try and recapture the beauty they lost in the initial surgery. The other angle, presented by the doctor, is a lot more practical. It points out the numerous shortcomings of implants when compared to natural growth, such as the frequent need for maintenance surgeries, the significant extra health risks, the reduced pleasure and sensitivity felt by implant patients, and the extreme difficulty of a patient to get what they want. Taken together the argument is pretty simple: why get implants when other medical options are cheaper, safer, more effective, healthier, and more attractive?</p>`);
				} else if (!FutureSocieties.isActive('FSBodyPurist')) {
					r.push(`rise of the Transformation Fetish titled: "The Mass Insanity of Adding Mass". The opening credits are styled to look like a psychological case study from a mental institution. When the credits finish, the video cuts to a scene of a man sitting behind a desk, the whole shot is high contrast due to the harsh lighting from a lone desk lamp. The middle-aged man screams 'hard-boiled' and looks like he walked straight out of a noir film to host this documentary. His opening monologue makes it pretty clear that this documentary has a lot of parallels with a crime documentary. Worse, is that the evidence and expert witnesses available to the producers were apparently overwhelming, because the program seems rushed trying to fit as much as it can into a narrow time slot.`);
					r.push(`<p>Evidence and whatever else be damned, this isn't the kind of documentary that should be on the FCTV stream in your arcology. You tell ${V.assistant.name} to remind you to send a complaint in the morning.</p>`);
				}
				return r.join(" ");
			}
		},
		{
			get slaves() {
				const slave = App.Data.FCTV.actors.FSmodel;
				slave.belly = 10000;
				if (V.seeHyperPreg === 1) {
					slave.belly *= 2;
				}
				if (V.imageChoice === 4) { // compensate for WebGL's smaller bellies
					slave.belly *= 2;
				}
				slave.preg = 35;
				slave.makeup = 2;
				slave.clothes = "nice business attire";
				slave.shoes = "none";
				return [slave];
			},
			get text() {
				const r = [];
				r.push(`surging Repopulation movement: "Continuing the Dream". After the opening credits, the documentary introduces a young and extremely pregnant woman as the commentator. The program makes an impassioned argument about the need for a new generation of citizens and slaves that were born into the dream of the Free Cities. The woman is wearing semi-conservative business attire, and has on elegant makeup. She looks somewhat plain when compared to the hyper-sexualized style of other FCTV shows, though she does make it plain over the course of the program that she loves sex more than ever. She tends to use herself as an example to show that pregnancy no longer means limitations or sacrifice, instead emphasizing that she's on her fifth pregnancy and would rather be with child than without.`);
				r.push(`<p>The woman makes two main points during the course of the documentary. The first is that the combined population of the Free Cities needs to grow explosively for 'Free City Society' to become stable. She points out several economic reasons, including the drive to invest in research and infrastructure. She has interviews with experts explaining the need for independence; that the Free Cities are still dependent on the old world industrially and financially, and that the population must expand dramatically to avoid going down with the metaphorical ship. The more Free Cities there are, the more they become free and independent of the old world.</p>`);
				r.push(`<p>The second point concerns the source of the new citizens and slaves that the Free Cities need. Her arguments concerning citizens focus on the unique culture of the Free Cities, and the direction that the future society will take. She points out that immigrants from the old world are rooted in its decaying culture. She asks her viewers how long it took them to adapt to their new lives, and how often they find themselves doubting their new home subconsciously. She admits that even she sometimes finds something wrong or repulsive, until she realizes that it's the ghost of her past life clinging to her. A noted psychologist talks about the strong hold people's earlier lives has on them, and how developing the promise of the Free Cities will need a generation untainted by the old world. The documentary's argument for slaves largely comes down to the fact that second-generation slaves are happier, better adjusted, and simply better slaves.`);
				if (policies.countEugenicsSMRs() > 0) {
					r.push(`It also points out the practical problems that the mass importation of slaves will cause in the gene pool.`);
				}
				r.push(`</p><p>Overall, it's a convincing documentary, if a little too emotional for your tastes.</p>`);
				return r.join(" ");
			}
		},
	],
});
