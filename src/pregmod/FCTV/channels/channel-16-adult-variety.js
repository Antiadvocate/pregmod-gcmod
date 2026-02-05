// cSpell:ignore looove, Thurrr.., shty, sheedsh, Bugsh, bugsh, Enthing, Ethrything, Arghhhh, Yershhhhh

/**
 * @file channel-16-adult-variety.js - FCTV Channel 16: Adult Variety
 */

App.Data.FCTV.channels.set(16, {
	tags: {dicks: true},
	loop: true,
	get intro() {
		// All actors are at least 18
		const r = [];
		r.push(`<p>As you snuggle in for the night`);
		if (S.Concubine) {
			r.push(`with your concubine, you`);
		} else {
			r.push(`you`);
		}
		r.push(`begin watching the <i>Age of Slavery</i> channel. With so many new types of arcologies emerging, it's sometimes difficult to tell if you are watching events unfolding on a set or in a real arcology with a historical society.</p>`);
		return r.join(" ");
	},
	episode: [
		{
			get text() {
				const r = [];
				r.push(`<p>"Well, you did well to win the 'cleanest urchin' contest."</p>`);
				r.push(`<p>Currently you seem to be watching a scene from the industrial revolution, in a smoke smudged brick courtyard by a factory. A stout manager, dressed in a black suit, is leading a thin urchin toward a wooden building built out from the main factory.</p>`);
				r.push(`<p>"Thank you, sir," the urchin gulps. "My mother really needs the money. You promised a shilling?"</p>`);
				r.push(`<p>"And I really need to recover these bearings!" The stout man proclaims. "I'm surprised you were so modest, though. Someone with skin as pure as yours doesn't need to be ashamed of it."</p>`);
				r.push(`<p>"Uh, I'm fair like my mother, sir." The waif hugs their arms around their chest.</p>`);
				r.push(`<p>"Well she must be helping keep you clean, boy!" The man laughs, and flings open the door to the outbuilding, revealing a series of tanks about three times as tall as he is.</p>`);
				r.push(`<p>"This one right here," he taps the nearest, "is almost full of water. However, the blasted mixer for the tank has fallen apart." There is enough light entering from the door to show a belt driven mixer hanging above the tank, with a missing plate and empty sockets. "The bearings are about`);
				if (V.showInches === 2) {
					r.push(`an inch`);
				} else {
					r.push(`three centimeters`);
				}
				r.push(`across, and fell right in the damn tank. I can't drain the tank without those bearings because they're valuable, and I can't foul the drain. But I can't seem to fish them out either, it's too dark. That's why I needed someone clean, someone that won't get their filth in my tank. There's a shilling if you can get me back all eight of my bearings in ten minutes."</p>`);
				r.push(`<p>"Just ten minutes sir?"</p>`);
				r.push(`<p>"Time is money. Now strip."</p>`);
				r.push(`<p>The urchin hesitates.</p>`);
				r.push(`<p>"Still shy?" the man leers.</p>`);
				r.push(`<p>"I'll do it." The youth strips off his shirt and steps inside, shutting the door before dropping his trousers.</p>`);
				r.push(`<p>"Hand me your clothes then, NOTHING IN MY TANK." The man grumps.</p>`);
				r.push(`<p>The camera cuts inside to show a dim black and white view of the youth's nude silhouette scrambling up the tank, fumbling with the lid and slipping inside. They pass up a series of bearings quickly for a while, but seem to struggle to find the final ones.</p>`);
				r.push(`<p>"TIME!" Calls the man, holstering his pocket watch.</p>`);
				r.push(`<p>"Sir, I can't find the last two!" The youth splutters.</p>`);
				r.push(`<p>"Can you find the fucking holes!?!" the man roars.</p>`);
				r.push(`<p>"E-eight..." the lad responds, crestfallen.</p>`);
				r.push(`<p>"Then here's the deal. Let's make it interesting. I will double your wages. Double them! Two shillings! If you can find your own fucking asshole and shove the six you have in there, then find the last two. Sloppy idiot."</p>`);
				r.push(`<p>The youth freezes. "Sir?"</p>`);
				r.push(`<p>"You heard me. You're not losing those; polish them! I'm not even peeking, keep your precious privacy."</p>`);
				r.push(`<p>You can see the hesitation in the outline of the desperate youth, then a slump of the shoulders. "Yes, sir."</p>`);
				r.push(`<p>Perched on top of the tank, they bend over with their hand on the mixer and begin inserting the bearings into their new housing. They are each about an inch wide, and the first takes quite some time.</p>`);
				r.push(`<p>"Hurry up, damn it!" the man roars.</p>`);
				r.push(`<p>The urchin jumps, and then jumps again as the bearing slips home. They freeze for a moment, trembling. Then begin pushing in the others.</p>`);
				r.push(`<p>"WELL?"</p>`);
				r.push(`<p>"They're in, sir," he responds weakly, and slips into the tank. The man harrumphs and starts examining his watch again. After a few minutes have passed, the lad pops up with the seventh bearing, and then returns to the bottom. They're clearly holding their breath as long as they can.</p>`);
				r.push(`<p>"TIME!" The man roars again.</p>`);
				r.push(`<p>Spluttering, the youth surfaces. "I-I... I can't find it!" he cries desperately. Splashing his way out of the tank and scrambling toward the door, he pauses to force down a sudden erection. The man flings open the door, letting daylight stream in and briefly washing out the black and white camera. His pants are also open and showing an erection raging as fiercely as he is.</p>`);
				r.push(`<p>"Then you need some blasted motivation! I'll pack those bearings in myself!"</p>`);
				r.push(`<p>The youth shrieks, and in a panic sprints around the tank. The man follows closely, and then chases him out the door. With no time to grab his clothing, the youth squirts out bearings as he runs, before making the relative safety of the street, still nude. A camera from the street reveals an interesting surprise as the desperation on the fleeing youth's face shifts to consternation. Heads on the street turn, too, as he drops the last bearings and spurts white over coal black skin. There was more than water in the tank: he's dyed now as black as night from head to toe.</p>`);
				r.push(`<p>Pointing and laughing uproariously, the man flips the eighth bearing into the air before pocketing it again and buttoning up his pants. The camera pans out to show the factory's name as "Titan's Textiles."</p>`);

				return r.join(" ");
			}
		},
		{
			get slaves() {
				return [App.Data.FCTV.actors.littleCloud];
			},
			get text() {
				const r = [];
				r.push(`Today's show seems to be a Western of some sort, named "Steerswood". The sun is beating down on a young Indian woman standing on a scaffold with a noose around her neck. Her lower arms are bound tightly to each other behind her back keeping her hands free but unable to reach anything. The ropes squeeze her modest breasts so they poke out further than they usually would, and she is forced to stand on tiptoe to avoid choking. Around her are three women who evidently live in the town. They seem to be outraged at the Indian girl.`);

				r.push(`<p>"You fucking whore!" the first one, a blonde, screams.</p>`);
				r.push(`<p>"Tell her, Annie!" the second one chimes in.</p>`);
				r.push(`<p>"I am sick and tired of you. Thieves!" She jabs a trapped breast with her finger to punctuate her words, "Stealing our husbands with your harlotry."</p>`);
				r.push(`<p>"I beg you," the Indian girl replies, "it's very urgent. We are all in great danger! The great Bird..."</p>`);
				r.push(`<p>"Listen to this bitch, Dakota." Annie turns to the second woman. "We are all in great danger," she mimics. She turns back to slap the Indian. "Little Cloud, was it? I don't give a SHIT about the coming of your bird god. The greatest danger my husband has right now is ME. And right now, YOU are in danger for stealing him, bitch."</p>`);
				r.push(`<p>Frantically the girl twists to face the third woman, with a crown of red hair and freckles. "You are Kate, yes? Please, tell them I have done nothing." Kate looks up for a moment, saying nothing. "Your men, they don't even look at us. When they come to the village, they only have eyes for..."</p>`);
				r.push(`<p>In a flash, Kate is choking her. "How DARE you. How DARE you insinuate that my husband is some PERVERT. He is a doctor, and can heal man or beast. I trust you can at least respect a 'medicine man'?"</p>`);
				r.push(`<p>Annie punches one breast, while Dakota slowly twists the nipple on the other one. Cloud shrinks into silence under the assault.</p>`);
				r.push(`<p>"You know what I am thinking, girls," Dakota muses. "I am thinking this might be an honest mistake." The heads of the other two snap around. "Hear me out. I am wondering if she honestly thinks she's not a whore, simply because she doesn't look like one."</p>`);
				r.push(`<p>The others pause for a moment, then start to laugh. "Ahh, I see where this is going. We could teach her. Yes, let's 'help her out'."</p>`);
				r.push(`<p>Kate pulls out a large makeup kit. "Ordered from Sears and Roebuck by my husband, as a 'makeup' present for his dalliances. For all the times I used it I never got his attention. But you know, maybe I just never used <i>enough</i>."</p>`);
				r.push(`<p>The camera pans away and when it returns, the Indian girl's face is positively caked with the most absurdly overdone makeup you have ever seen. It's both hot and hilarious in the same way.</p>`);
				if (S.Concubine && S.Concubine.makeup > 0) {
					r.push(`<p>You look at your own concubine's face. ${App.Desc.makeup(S.Concubine)}It's just the way you like it, but it's nowhere near as messy and overdone as the girl in the show.</p>`);
				}
				r.push(`<p>"Mmmm, good but now the rest of her seems a little plain," Annie frowns. "Don't loose girls wear big boots?"</p>`);
				r.push(`<p>"I can help with that," Dakota smiles.</p>`);
				r.push(`<p>"You've got boots?"</p>`);
				r.push(`<p>"Nope, but I can get her some big red ones." She returns quickly, holding up a large bucket. "You see, my husband has left me to fix the barn all by myself. Waterproofing with pitch, fixing boards, and painting the wood!"</p>`);
				r.push(`<p>The girl squirms, but Dakota and Annie dive in with big sweeping strokes and large brushes. "Leave her bush and asshole clean for customers," giggles Dakota. "As clean as a whore's holes can be," corrects Annie.</p>`);
				r.push(`<p>They step back to inspect their work. "Looks like a whore to me," Kate says.</p>`);
				r.push(`<p>The girl is clearly exhausted and struggling to stay on her feet. Sweat is rolling down her face, and her makeup is already beginning to run around her eyes. Her legs are barn red from her hips to the tip of her toes, and a small puddle of paint is forming under her feet and between her toes. Sweat is pouring off her naked body.</p>`);

				r.push(`<p>"You know." Annie frowns. "She still really doesn't look like a whore to me. Shouldn't she be showing her skills? Spreading her legs?"</p>`);
				r.push(`<p>In a moment they have a barrel set up on end, somewhat behind her and also partly under her. While it is too low for the girl to sit on, the smooth handle of a broken pitchfork is nailed to the side of the barrel and sticking up above it. "Here we go." Annie and Dakota each lift a leg, while Kate crouches down and adjusts the height of the barrel with a few shims, then guides the shaft towards the Indian's crotch. She brushes it slowly against her ass, tickling her hair. Little Cloud freezes, petrified. "Here, then?" Kate asks with a sinister smile, as she slides it forward.</p>`);
				r.push(`<p>"Please no, I'm a v-"</p>`);
				r.push(`<p>Both women drop her legs at the same time, and the girl screams as she tries to catch herself. The intruder does not make it far into her vagina as long as she stays on tiptoe, but she clearly can't lift herself high enough to get off the makeshift dildo entirely. And the noose around her neck keeps her from moving in any lateral direction.</p>`);
				r.push(`<p>"Ahhhh hahaha," the women laugh. "A virgin? YOU? After all you all did to steal our husbands, you harlot?"</p>`);
				r.push(`<p>Annie bursts out laughing. "Sorry, she still doesn't look like a whore to me. What a failure as a woman. I can't imagine any man falling for such a sorry sight. But hearing her beg? With those red legs? She's more like one of my pathetic chickens. Cluck cluck!" She laughs hysterically.</p>`);
				r.push(`<p>"A chicken, hmm?" Dakota ponders for a moment. "Annie, what if we..." she whispers in her ear.</p>`);
				r.push(`<p>Another quick pass of the camera and everyone is back in the middle of town.</p >`);
				r.push(`<p>"Oh, I am going to enjoy this, bitch," Dakota says. She lifts a brush from a new bucket that seems to shimmer with a slight haze. "I fucking hate this stuff. It should be HIS job. Hurts when you get it on your skin until it cools, and it <i>never</i> comes off. Have you ever had pitch on your skin, bitch? Have you ever had it in your <i>hair</i>?"</p >`);
				r.push(`<p>Dakota pauses for a moment to let the pitch drip into the bucket, then approaches the terrified girl. She starts to brush onto the crown of the girl's head and lets it run down her twin black braids. It's not hot enough to burn skin permanently, but certainly warm enough to smear around before it sets as a tacky mess. Dakota begins to work in earnest, using the brush to work it into the hair itself, then around the sides of her face, into her ears, down her neck and around her breasts. She covers everything down to her red "boots" and sex, leaving just the face and breasts bare.</p>`);
				r.push(`<p>"Surprise!" yells Annie from behind, emptying out an enormous bag of feathers over the pitch and turning her from dark to white in an instant. The women collapse to the ground in hysterics, barely able to contain themselves. "She's a chicken... with boobs!" one gasps. "A whore chicken."</p>`);
				r.push(`<p>"Let's see her steal the roosters NOW!"</p>`);
				r.push(`<p>The girl writhes in heat and discomfort and twists for some time, begging for freedom. Finally, she coughs and gasps "Please. At least, give me something to drink."</p>`);
				r.push(`<p>"Well shucks, ladies. If we haven't forgotten our hospitality. After all, we must be on our manners even if she ain't." "Who <i>hasn't</i> forgotten to water chickens?" "Can't have her messing their watering dish though."</p>`);
				r.push(`<p>All three turn to the girl. "Well as it happens we have just the thing for you. Steerswood Tea!" Kate holds up a very large skin apparently full of liquid from the way it sloshes around. Perhaps`);
				if (V.showInches === 2) {
					r.push(`several liters`);
				} else {
					r.push(`a gallon`);
				}
				r.push(`or more? It's an unusual shape. Then she turns it a little so everyone can see the nipple. It's a buttplug, about`);
				if (V.showInches === 2) {
					r.push(`3 inches`);
				} else {
					r.push(`7 centimeters`);
				}
				r.push(`in diameter it seems, with a short but stiff rubber hose coming from the tip.</p>`);
				r.push(`<p>The girl is stirred to new energy, and everyone is treated to the comical sight of the chicken choking and flopping around. In the end though, she has nowhere to go and Dakota plops the skin down on the barrel. Katie adjusts the wedges at the bottom of the barrel again, while Annie tends to the rope.</p>`);
				r.push(`<p>"Steerswood tea," Katie explains, "is a special drink we have made just for you. Plenty to drink, which you wanted, yes?"</p>`);
				r.push(`<p>"Yes, but..."</p>`);
				r.push(`<p>"And you Indians looove that firewater, right?"</p>`);
				r.push(`<p>"I was always too young to..."</p>`);
				r.push(`<p>"But the magic sauce is a little something that each one of us has contributed." The woman all giggle.</p>`);
				r.push(`<p>"W-water?"</p>`);
				r.push(`<p>"There's plenty of water <i>in</i> it," Dakota concedes. She brushes the plug and tube with pitch and tickles Cloud's asshole for a bit before suddenly pushing the tip inside.</p>`);
				r.push(`<p>After some adjustments, the new game becomes clear. The dildo is no longer enough to keep her from sinking, so she rests on the buttplug. The buttplug is far too large to enter her rear and is coated in pitch, making inward progress even slower. However, the buttplug(and her aching rear) is resting on the bladder full of tea. The lower she sinks, the more "tea" she injects into her own asshole, and she has no room to expel the sticky intruder.</p>`);
				r.push(`<p>She frantically rocks up and down, trying to find some new position to escape her discomfort. Tears and drool roll down her face and her makeup is now running down her neck.</p>`);
				r.push(`<p>The women laugh at her new predicament for a while, before hitting her red legs with switches. The girl sinks lower and lower in despair as her abdomen swells larger and larger, growling and bubbling as it swells.</p>`);
				r.push(`<p>"How do you like our hospitality now?" "Think you'll be back soon to tease our husbands?"</p>`);
				r.push(`<p>Little Cloud lets out an enormous wet belch, then two more as she strains her body.</p >`);
				r.push(`<p>"Hahahaha, her breath smells like whiskey and," Annie says as she eyes Kate, "You, to be frank." They both burst out laughing again.</p >`);

				return r.join(" ");
			}
		},
		{
			get slaves() {
				const slave = App.Data.FCTV.actors.littleCloud;
				slave.hStyle = "messy";
				slave.shoeColor = "#c80000";
				slave.shoes = "boots";
				slave.skin = "dyed gray";
				return [slave];
			},
			get text() {
				const r = [];
				r.push(`<p>Today's show seems to be a continuation of Steerswood. The sun is still beating down on a young Indian woman standing on a scaffold with a noose around her neck. However, she is in a terrible predicament. Surrounded by three jealous women from the town tormenting her, she has been dressed as a chicken through tarring and feathering, and is currently absorbing a large amount of mysterious "tea" through her asshole.</p>`);

				r.push(`<p>"Pleathe, *hiccup*, Thurrr.. shty," Little Cloud murmurs.</p>`);
				r.push(`<p>Annie slaps her on the breast. "After all we did for you, making that tea and giving it to your sorry ass."</p>`);
				r.push(`<p>"It's fine." Kate holds up a collection of rubber tubes. "My doc has too many of these anyway. I always did love helping him with the enemas." She soon has it attached near the base of the buttplug, and then running`);

				if (V.seePee !== 0) {
					r.push(`a short distance before it splits. "This much fluid in her bowels, the bladder fills fast. You have to let it drain." She explains as she grabs one end. "Ahh."</p>`);
					r.push(`<p>"Normally we use a smaller one for this, but, well, whores love this sort of thing." She coats the tip in pitch as well, and then shoves the tube into the Indian's urethra. "Oh, she likes that!" Annie exclaims, as Little Cloud bounces and writhes around for just a moment before she realizes that her bladder is now caught in the same terrible tides as her ass.</p>`);
				} else {
					r.push(`about an arm's span.</p>`);
				}

				r.push(`<p>"Then we just run this one up heeere." Katie waves the tip of the other tube in her face. Cloud shudders but keeps her mouth shut. "Oh, but you are so <i>thirsty</i>, right? Well, we had to do this for a man that damn near died to a mountain lion. Slept for three weeks before he started healing." Kate coats the tip in pitch again and then shoves it far up Cloud's nose. Cloud frantically dances at the discomfort as some of the pressure below is released, but freezes a moment later as an <i>extremely</i> unpleasant flavor arrives in her throat.</p>`);
				r.push(`<p>Kate deliberately kinks the hose to shut off the flow for the moment and presses the kink into Cloud's hand, before wrapping her fingers around it. "Up to her now where she wants it," Kate explains. "It's important to give a patient choices, don't you think?" The gagging Indian tries to use her new grip on the hose to pull it out, but Kate bends her fingers painfully further shut. "Uh-uh. Nope." Kate firmly knots another rawhide band around the hose, and then ties the strip around Cloud's wrist, keeping her from reeling in the hose with her fingers. With her arms themselves bound, she can't move around enough to tear out the hose either. "Medicine goes up or down, not out!"</p>`);

				r.push(`<p>At this point, her stomach is so distended that the black pitch is showing around individual feathers. Annie and Dakota lock eyes and giggle, while Kate moves to where the noose is tied.</p>`);
				r.push(`<p>"Ready?" They ask the girl. She can barely open her eyes and doesn't move her head. "Ok then, here we go!"</p>`);
				r.push(`<p>Kate loosens the rope just as Annie and Dakota each lift a leg. With nothing else to support her, the girl's full weight comes to bear on the plug, which finally smears its tarry way home with a "pop." The Indian girl screams and shudders with an impossible... orgasm?</p>`);

				r.push(`<p>Annie releases the noose from the scaffold and shoves her over on her back. "You LIKED that? You disgust me." She is powerless to move, and lays there groaning and drooling beneath the weight of her stomach.</p>`);
				r.push(`<p>"Better finish your drink, little chicken." Dakota wrings out the skin, and the liquid has nowhere to go but in. She neatly wraps rawhide around the bag to make sure the inflation can't reverse, and then covers the whole thing with pitch. It will not be coming undone soon.</p>`);

				r.push(`<p>"You know, her cunt looks empty now. We should give our little hen something to bring back to her chicks." Dakota suggests.</p>`);
				r.push(`<p>"I have just the thing!" Annie lifts up a third bucket with a trowel that appears to contain a selection of`);
				if (V.seeBestiality === 0) {
					r.push(`<i>nuts and seeds.</i>`);
				} else {
					r.push(`nightcrawlers.`);
				}
				r.push(`"</p><p>Perfect for growing birds."</p>`);
				r.push(`<p>She carefully parts the labia with the muddy trowel, then checks to see how deep it can go. "There we go!" Annie proclaims as she slides it to one side and begins tipping in`);
				if (V.seeBestiality === 0) {
					r.push(`<i>birdseed.</i>`);
				} else {
					r.push(`worm after worm.`);
				}
				r.push(`</p><p>When she seems to run out of room, she begins to push them in by hand. After the bucket is low enough, she carefully pulls out her trowel and Dakota seals the slit shut with pitch. Katie recovers Cloud's loin cloth, which they fix as tightly as they can, and secure the knots again with pitch. There is no room at all to push anything out, and she cannot wriggle her loincloth past her hips. Her hands remain tightly bound behind her back, and her enormous stomach makes anything agility related impossible.</p>`);
				r.push(`<p>"You know, I don't think she could see us on the other side of the 'mountain'." Annie aims a kick at the stomach and then tips the rest of the bucket on Cloud's face.</p>`);
				if (V.seeBestiality === 0) {
					r.push(`<p>"<i>Shunflower sheedsh!</i>`);
				} else {
					r.push(`<p>"Bugsh!`);
				}
				r.push(`No! I hate`);
				if (V.seeBestiality === 0) {
					r.push(`<i>shunflower sheedsh!</i>"`);
				} else {
					r.push(`bugsh!"`);
				}
				r.push(`</p><p>Cloud somehow finds strength to squirm frantically and scream, rocking her arms back and forth trying to free them. She freezes again, suddenly aware of the wriggling in her vagina, then thrashes and screams even more.</p>`);
				r.push(`<p>"Shut UP already!" Annie is irate. "I am done hearing you whine about what you like and what you don't like. We gave you drink, we gave you food. Shut. Your. Beak!" Annie rams the round handle of the trowel deep into Cloud's mouth, then ties the middle of the trowel tightly with rawhide before fastening it behind her head. She bends the metal to point down a bit. "See? Silence. And a beak!"</p>`);

				r.push(`<p>"One lasssst thing, though." Kate holds up a few boards. "She doesn't quite have chicken feet!" Using the noose the three haul Cloud's bulk upright, and place her feet on the boards. Careful not to pierce the skin or smash the toes, Kate uses U-shaped nails to firmly trap the girl's toes to the board, giving her comically large "sandals." Another coat of thick red paint on the boards, nails, and legs, and her new feet are finished.</p>`);
				r.push(`<p>Finally, their work is done. Little Cloud is completely unrecognizable. Her face is a slobbery mess, and it's not clear if she is still drooling or if she has begun to leak tea from her mouth. She gives another wet belch, and slouches to the side. Her breasts are the only naturally colored thing left on her body, still trapped and protruding from the now hidden ropes that bind her. Her stomach is so grossly distended that the pitch is showing, giving the impression that her skin is black. The bulge at the back of her loincloth has picked up a few feathers and looks like a sad tail. Her cunt is leaking a single`);
				if (V.seeBestiality === 0) {
					r.push(`<i>sunflower seed</i>`);
				} else {
					r.push(`wriggling worm`);
				}
				r.push(`around the loincloth, with many more trapped inside. And her long slender legs are fixed to boards in a mockery of feet.</p>`);
				r.push(`<p>"Enthing...” she slurs around the trowel. "Ethrything ith..."</p>`);

				r.push(`<p>"Oh it's ending all right." Annie says. "Right, here is how this goes. You are out of here. History. None of us want to touch your filthy sticky hide. If you don't want to <i>pop</i>, I suggest you get back to your little teepee and find someone that cares to help you. If you hurry, you might make it before sundown."</p>`);
				r.push(`<p>"Right," Dakota agrees. "But if you happen to see one of our husbands on the way. If you find one in that fucking little village of yours. <i>If you let him touch your disgusting chicken ass</i>. We will see the pitch on him and <i>know</i>."</p>`);
				r.push(`<p>"May your bird god help you if that happens." Katie chimes in.</p>`);
				r.push(`<p>"Understand?" The three whip her taut stomach like a tom-tom.</p>`);
				r.push(`<p>"Arghhhh! Yershhhhh!"</p>`);
				r.push(`<p>Dakota leans in. "Now cluck! Cluck like a chicken!"</p>`);
				r.push(`<p>Cloud groans deeply, then tries to make a clucking sound around the trowel.</p>`);
				r.push(`<p>"Louder!" Dakota beats the drum again.</p>`);
				r.push(`<p>"Uck! Uck!"</p>`);
				r.push(`<p>"Now RUN, little chicken!"</p>`);
				r.push(`<p>Little Cloud frantically begins to flop and cluck her way out of town into the sunset as fast as she can, chased by the three hysterical women.</p>`);
				return r.join(" ");
			}
		},
	]
});
