// cSpell:ignore SensaTech

/**
 * @file channel-00-news.js - FCTV Channel 0: News
 *
 * News channel featuring FCNN (Free Cities News Network) content.
 * Hosted by Kirk McMahon and Jules (Anchor Slave).
 */

App.Data.FCTV.channels.set(0, {
	tags: {},
	loop: true,
	intro: `officially known as the FCNN stream channel and you've started watching the middle of a news segment.`,
	episode: [
		{
			slaves: [
				App.Data.FCTV.actors.kirk,
				App.Data.FCTV.actors.jules
			],
			get text() {
				const r = [];
				r.push(`<p>The segment is being anchored by the middle aged Kirk McMahon, and he's joined by the ever-popular "Anchor Slave", Jules. She's got a nice figure, and the only thing she's wearing to cover her perky breasts is a pair of FCNN pasties. She has on a fine leather collar; the large gold charm hanging from the front seems to be a stylized emblem of a ship's anchor merged with a microphone. The pair seems to be discussing the recent actions and punishment of the reality show slave Slooty.</p>`);
				r.push(`<p>Jules seems to be quite passionate about the subject, the animated way she talks is causing her sizable tits to bounce all over the place. "It doesn't matter how famous or valuable that slut thinks she is, her behavior was just wrong on SO many levels. It makes all of us good slaves look bad. If you ask me, her master's choice of punishment fits the attention whore perfectly!"</p>`);
				r.push(`<p>Kirk's face looks more than a little surprised, but you can't quite tell if it's an act or not. "You won't get any argument from me that she deserves to be punished... but getting chained up with an obedience collar and feeder system in the middle of Times Square, free for public use? A slum like Manhattan, she'll never`);
				if (V.seeExtreme === 0) {
					r.push(`<i>enjoy</i>`);
				} else {
					r.push(`survive`);
				}
				r.push(`the 10 day sentence!"</p>`);
				r.push(`<p>Jules smiles. "That's exactly right, Master McMahon, she's going to be`);
				if (V.seeExtreme === 0) {
					r.push(`<i>hugged until she smiles</i>.`);
				} else {
					r.push(`fucked to death.`);
				}
				r.push(`Her precious popularity in the old world will have the locals lined up all the way to New New Jersey waiting for their turn. I'd never question her master's decision, but if it were me, I'd pump her full of curatives and stimulants during the sentence. That way, she doesn't`);
				if (V.seeExtreme === 0) {
					r.push(`<i>smile</i>`);
				} else {
					r.push(`die or pass out`);
				}
				r.push(`too soon. I think her master is being lenient after the way she badmouthed him in a live broadcast."</p>`);
				return r.join(" ");
			},
		},
		{
			slaves: [
				App.Data.FCTV.actors.red,
			],
			get text() {
				const r = [];
				r.push(`<p>The program is showing some poorly-shot video showing a woman with flaming-red short hair angrily shouting at a large but uncomfortable-looking man. The title text at the bottom says: <b>"EmancipationGate: Emancipation Movement Exposed"</b> The video continues, revealing more of the angry woman. She's short, wearing a sweaty tank top that makes her bushy underarm hair stand out. Based on the audio thus far, it seems she's trying to tell the large man to keep`);
				if (V.seeExtreme === 0) {
					r.push(`<i>hugging their captives until they smile</i>,`);
				} else {
					r.push(`torturing their captives until they die`,);
				}
				r.push(`that it has to be convincing for the camera. The man says he isn't comfortable doing that to kids, but the woman shouts him down by saying they're only migrant man brats before beginning some nonsensical babble about patriarchy and slavery. The video seems to be being shot on a small handheld device, and pans over to reveal a bunch of severely`);
				if (V.seeExtreme === 0) {
					r.push(`<i>hugged</i>`);
				} else {
					r.push(`beaten`);
				}
				r.push(`children in slave chains that look like obvious S & M props to your well-trained eye. The angry woman's rant is still continuing from the background, but suddenly stops to be replaced with a yell: <i>"Get the fuck away from the subjects, you better not be fucking filming any..."</i> and the video cuts out.</p>`);
				r.push(`<p>The segment cuts back to two news anchors, a dark-haired man with a mustache and an aging bottle blonde.</p>`);
				r.push(`<p>The bottle blonde speaks to the viewers. "Some of you may recognize the woman in that video as Angry Red, noted femsupremacist and a leading figure in the old world Emancipation Movement. The video you saw was released along with countless other media files and documents from the movement in the EmancipationGate hacktivist attack. This particular video has been confirmed by computer analysis to be behind the scenes footage from the movement's latest documentary about the horrors of slavery."</p>`);
				r.push(`<p>The mustached man looks knowingly at the camera. "Anyone remotely familiar with Free City slavery knew the documentary was complete bullshit, but what we didn't know was just how far those radicalists were willing to go to make us all look bad."</p>`);
				return r.join(" ");
			},
		},
		{get slaves() {
			const array = [App.Data.FCTV.actors.kirk];
			const slave = App.Data.FCTV.actors.jules;
			slave.vaginalAccessory = "large dildo";
			array.push(slave);
			return array;
		},
		get text() {
			const r = [];
			r.push(`<p>The segment seems to be more of a conversational piece. The two hosts are sitting next to each other on one couch. Samuel Klein, a handsome man with dark blonde hair and a winning smile, can't help but be overshadowed by his cohost. The popular SlaveAnchor Jules might be mistaken for just another gorgeous face and body, but it's her brilliant wit and sure-footed advocacy that made her famous. She's wearing her usual slave anchor collar, and her large natural breasts are only covered by the standard FCNN pasties, leaving the perky flesh free to jiggle enticingly. On this show her lower half is revealed; it's usually hidden behind a desk. The dark red material of her narrow panties matches her auburn hair, and reveals her broad hips and long slender legs.</p>`);
			r.push(`<p>The camera cuts back to two distinguished looking gentlemen, one is labeled by the screen as medical researchers.`);
			if (V.PC.skill.medicine === 100) {
				r.push(`You vaguely recognize both of them from your time studying medicine.`);
			}
			r.push(`</p><p>One of them continues the conversation, apparently answering a question. "That's right, the results of our research tell us what everyone already suspected, but now with an indisputable weight of evidence behind it." The other nods and continues, "our meta analysis examines over two decades of data, and nearly 6,000 independent studies. We can safely say that free city slaves are healthier than the average person living anywhere in the old world. While a few of the wealthiest countries of the old world may surpass one or two areas, our slaves have better nutrition, standard of living, are more psychologically stable, have longer lives, and are happier on average as well." The first gentleman interjects, "We even found strong evidence that the higher sexual tempo and libido-stimulating training given to sex slaves greatly contributes to their life span; they live even longer than the average slave, and even look younger than their age."</p>`);
			r.push(`<p>The camera switches back to the two anchors, showing an excited Jules hefting and bouncing her tits. "They've barely sagged at all since they stopped growing, now I know why!"</p>`);
			r.push(`<p>As the AnchorSlave continues to squeeze, one of the researchers answers from off camera. "That's right, it can be rather amazing. To tell you the truth, we didn't believe it at first, but the evidence made it too hard to ignore." Jules starts looking toward the backstage area trying to signal someone as the other researcher continues. "It's also important not to wear a bra unless you're doing high-impact cardio. We've known since the mid 20th century that wearing bras causes sagging; bras devastate the breasts of`);
			if (V.seePreg === 0) {
				r.push(`<i>friendly</i>`);
			} else {
				r.push(`postpartum`);
			}
			r.push(`women in particular, and promote breast cancer... Despite countless decades-long studies showing us this, the old world insists on forcing women to wear..."</p>`);
			r.push(`<p>It seems that Jules finally got the approval she was looking for, because she immediately reached down between her legs, causing the researcher to distractedly forget what he was saying. Apparently the panties she's wearing are of the dildo variety, because when she removes her hand you can see a tell-tale green indicator light glowing on the front of them. A cute rosy flush comes to Jules cheeks before she apologizes and urges the pair of researchers to continue.</p>`);
			return r.join(" ");
		},},
	]
});
