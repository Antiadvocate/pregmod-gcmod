App.Events.PUndergroundRailroad = class PUndergroundRailroad extends App.Events.BaseEvent {
	execute(node) {
		V.nextButton = "Continue";
		let r = [];

		const traitor = getTraitor();
		const traitorActor = getTraitorActor();

		V.nextButton = " "; // hide button until user makes a selection

		V.collaboration = 0;
		traitor.actor = 0;
		V.hackerSupport = 0;

		const {
			He,
			he, him, himself, his
		} = getPronouns(traitorActor);
		const {
			HeA, HisA,
			heA, hisA, himA
		} = getPronouns(assistant.pronouns().main).appendSuffix("A");
		const {say, title: Master} = getEnunciation(traitorActor);
		V.fcnn.push("...you believe a slave has been contacted by the Daughters of Liberty, please call...");

		if (traitorActor.devotion + traitorActor.trust >= 175) {
			traitor.type = "agent";
		} else if (traitorActor.fuckdoll !== 0 || traitorActor.fetish === Fetish.MINDBROKEN) {
			traitor.type = "broken";
		} else if (traitorActor.trust <= -75) {
			traitor.type = "horror";
		} else if (traitorActor.devotion <= -20 && traitorActor.trust >= 20) {
			traitor.type = "defiant";
		} else {
			traitor.type = "standard";
		}

		/** Determines whether slave actually cares about potential freedom
		 * @param {FC.SlaveState} slave
		 * @returns {boolean}
		 */
		function desiresFreedom(slave) {
			return !isMindbroken(slave) &&
				(slave.devotion < jsRandom(50, 95) || slave.trust < 50);
		}

		r.push(`One fine day, as normal as any day surrounded by your slaves can be, you're sitting at your desk when`);
		if (traitor.type === "agent") {
			// TODO: canMove canWalk variants.
			r.push(`${traitorActor.slaveName} comes bursting into your office. ${He} crashes into your desk and`);
			if (canTalk(traitorActor)) {
				if (traitorActor.lips > 70) {
					r.push(`lisps through ${his} huge lips`);
				} else if (traitorActor.piercing.lips.weight + traitorActor.piercing.tongue.weight > 2) {
					r.push(`lisps through ${his} piercings`);
				} else {
					r.push(`shouts`);
				}
			} else {
				r.push(`gestures`);
			}
			r.push(`that several nondescript citizens ${he} sees occasionally at work have passed messages to ${him} this morning. Apparently, they simply asked whether ${he} wished to be free and the absurdity of it spurred ${him} to alert you. Even more unusual is the unannounced message waiting in your inbox — a message ${V.assistant.name} totally failed to inform you of. When asked,`);
		} else {
			r.push(`a message comes in. ${capFirstChar(V.assistant.name)} totally fails to announce it, which is unusual; when you ask ${himA} why not,`);
		}
		r.push(`${heA} replies`);
		if (V.assistant.personality > 0) {
			r.push(`flirtatiously, "What message, ${properTitle()}?"`);
			switch (V.assistant.appearance) {
				case "monstergirl":
					r.push(`${HisA} avatar's tentacle hair wiggles with incomprehension.`);
					break;
				case "shemale":
					r.push(`${HisA} avatar looks frustrated, ${hisA} hard-on wilting.`);
					break;
				case "amazon":
					r.push(`${HisA} avatar gives a little shriek of frustration.`);
					break;
				case "businesswoman":
					r.push(`${HisA} avatar wears an unaccustomed look of frustration.`);
					break;
				case "fairy":
				case "pregnant fairy":
					r.push(`${HisA} avatar crosses ${hisA} arms and ponders while hovering in the air.`);
					break;
				case "goddess":
					r.push(`${HisA} avatar looks concerned without ${hisA} usual sultry overtone.`);
					break;
				case "hypergoddess":
					r.push(`${HisA} avatar looks concerned without ${hisA} usual sultry overtone.`);
					break;
				case "loli":
					r.push(`${HisA} avatar seems eager to be out of your sight.`);
					break;
				case "preggololi":
					r.push(`${HisA} avatar rubs ${hisA} belly while looking extremely concerned.`);
					break;
				case "angel":
					r.push(`${HisA} avatar's wings droop as a worried look crosses ${hisA} face.`);
					break;
				case "cherub":
					r.push(`A concerned look forms on ${hisA} face as ${heA} hovers nearby.`);
					break;
				case "incubus":
					r.push(`${HisA} avatar looks frustrated, ${hisA} hard-on wilting.`);
					break;
				case "succubus":
					r.push(`${HeA} stops teasing you, a concerned look forming on ${hisA} pretty face.`);
					break;
				case "imp":
					r.push(`A concerned look forms on ${hisA} face as ${heA} hovers nearby.`);
					break;
				case "witch":
					r.push(`A look of worry spreads across ${hisA} face; a lingering dread that ${heA} did something bad.`);
					break;
				case "ERROR_1606_APPEARANCE_FILE_CORRUPT":
					r.push(`${HisA} avatar twitches slightly before sprouting multiple eyes facing all directions.`);
					break;
				case "schoolgirl":
					r.push(`${HisA} avatar puts on such a hard look of concentration that ${hisA} eyes cross.`);
					break;
				default:
					r.push(`${HisA} symbol avatar spins with frustration.`);
			}
		} else {
			r.push(`"You have received no messages in the past thirty seconds, ${properTitle()}."`);
		}
		r.push(`This is disturbing, to say the least. After close investigation, it appears someone has managed to plant a simple text message in your mail system without ${V.assistant.name} or any of your other security systems taking any notice. Worse, your mysterious correspondent seems willing to show off this ability in this petty display rather than simply sending a message anonymously.`);

		App.Events.addParagraph(node, r);
		r = [];

		r.push(
			`"You will free`,
			App.UI.DOM.slaveDescriptionDialog(traitorActor),
			`immediately," it reads. "This is the price of your continued survival. Agree and you buy yourself a few more moments at the top of your heap of shit. Refuse, and you shall fall that much sooner." The message is signed "The Daughters of Liberty."`
		);

		App.Events.addParagraph(node, r);
		r = [];

		if (traitor.type === "agent") {
			r.push(`${traitorActor.slaveName} is left aghast at the contents of the message, but quickly composes ${himself} and`);
			if (canTalk(traitorActor)) {
				r.push(
					`${say}s,`,
					Spoken(traitorActor, `"I think I have an idea, ${Master}. They'll likely take me in if you were to 'free' me and, from there, maybe I could feed you information, ${Master}. I could help expose them to you and they'd be none the wiser of the mistake they've made."`)
				);
			} else {
				r.push(`gestures there may be an opportunity here; they'd likely take ${him} in if ${he} were freed and ${he} could serve you from within the group as a double agent.`);
			}

			App.Events.addParagraph(node, r);
			r = [];

			App.Events.addResponses(node, [
				new App.Events.Result(`Let ${him} go`, agentRelease),
				new App.Events.Result(`Tell ${him} to ignore the Daughters in the future`, agentIgnore)
			]);
		} else if (traitor.type === "broken") {
			r.push(`${traitorActor.slaveName} is mentally absent, so you have your sincere doubts that ${he} actually knows anything about the matters at hand. ${He} does, however, serve as an anchor for your search. You review the surveillance recordings, tracking where and what ${he} was doing during ${his} day. It would appear that several nondescript citizens tried to carry on a conversation with ${him}. Peculiar.`);

			App.Events.addParagraph(node, r);
			r = [];

			App.Events.addResponses(node, [
				new App.Events.Result(`Free ${him}`, brokenFree),
				new App.Events.Result(`Ignore the situation`, brokenIgnore)
			]);
		} else {
			r.push(`You call ${traitorActor.slaveName} in and politely inquire as to whether ${he} knows anything about the matter.`);
			if (traitor.type === "horror") {
				r.push(`${He} breaks down in tears at the mention of it and barely manages to tell you that several nondescript citizens ${he} sees occasionally at work have passed a few messages to ${him}. Apparently, they simply asked whether ${he} wished to be free. Asked whether ${he} does in fact wish to be free,`);
				if (canTalk(traitorActor)) {
					r.push(`${he} sobs a yes.`);
				} else {
					r.push(`${he} weeps and nods.`);
				}
			} else if (traitor.type === "defiant") {
				r.push(`${He} stands ${his} ground and`);
				if (canTalk(traitorActor)) {
					if (traitorActor.lips > 70) {
						r.push(`lisps through ${his} huge lips,`);
					} else if (traitorActor.piercing.lips.weight + traitorActor.piercing.tongue.weight > 2) {
						r.push(`lisps through ${his} piercings,`);
					} else {
						r.push(`shouts,`);
					}
					r.push(Spoken(traitorActor, `"I'm going to ${canWalk(traitorActor) ? "walk" : "get"} out of this shithole or you're going to die a slow, deserved death. That enough for you?"`));
				} else {
					r.push(`gestures you'll free ${him} if you know what's good for you.`);
				}
			} else {
				r.push(`${He} ${canMove(traitorActor) ? "nearly flees" : "quivers"} in terror, but gathers ${his} courage and`);
				if (canTalk(traitorActor)) {
					if (traitorActor.lips > 70) {
						r.push(`lisps meekly through ${his} huge lips`);
					} else if (traitorActor.piercing.lips.weight + traitorActor.piercing.tongue.weight > 2) {
						r.push(`lisps meekly through ${his} piercings`);
					} else {
						r.push(`mumbles meekly`);
					}
				} else {
					r.push(`gestures meekly`);
				}
				r.push(`that several nondescript citizens ${he} sees occasionally at work have passed a few messages to ${him}. Apparently, they simply asked whether ${he} wished to be free. Asked whether ${he} does in fact wish to be free, ${he}`);
				if (canTalk(traitorActor)) {
					if (SlaveStatsChecker.checkForLisp(traitorActor)) {
						r.push(`lisps faintly,`);
					} else {
						r.push(`mutters faintly,`);
					}
					r.push(Spoken(traitorActor, `"I'm sorry, ${Master}. Yes."`));
				} else {
					r.push(`shakily gestures an apology, and admits that ${he} does.`);
				}
			}
			App.Events.addParagraph(node, r);

			const responses = [
				new App.Events.Result(`Free ${him}`, free),
				new App.Events.Result(`Tell ${him} to ignore the Daughters in the future`, ignore),
				new App.Events.Result(`Publicly flog ${him} for treasonous conversation`, flog),
			];

			if (V.seeExtreme === 1) {
				responses.push(new App.Events.Result(`Chemically lobotomize ${him} to extirpate any record of the incident`, lobotomy));
				if (!FutureSocieties.isActive('FSPaternalist')) {
					responses.push(new App.Events.Result(`Publicly execute ${him}`, execute));
				}
			}

			App.Events.addResponses(node, responses);
		}

		/**
		 * What's traitors, precious
		 * @returns {FC.SlaveState}
		 */
		function getTraitorActor() {
			// The order of qualities does not matter.
			const qualities = [
				(s) => s.fuckdoll === 0,
				(s) => s.fetish !== Fetish.MINDBROKEN,
				(s) => canWalk(s),
				(s) => canTalk(s),
				(s) => canSee(s),
				(s) => s.indenture === -1,
				(s) => [Job.CLUB, Job.PUBLIC, Job.WHORE, Job.BROTHEL].includes(s.assignment),
				(s) => s.devotion < 75,
				(s) => s.trust < 75,
			];
			let rankedSlaves = [];
			for (const slave of getSlaves().values()) {
				let value = 0;
				for (const quality of qualities) {
					if (quality(slave)) {
						value++;
					}
				}
				rankedSlaves.push({value: value, slave: slave});
			}

			// Find the highest bar we reached
			const highScore = Math.max(...rankedSlaves.map(s => s.value));

			// Find anyone that ties for first
			rankedSlaves = rankedSlaves.filter(s => s.value === highScore);

			return rankedSlaves.random().slave;
		}

		function sendTraitor() {
			if (traitorActor.relationship > 0) {
				const rel = getSlave(traitorActor.relationshipTarget);
				traitorActor.relationshipTarget = 0;
				traitorActor.relationship = 0;
				if (rel) {
					traitorActor.relationshipTarget = 0;
					traitorActor.relationship = 0;
				} else {
					r.push(`<span class="red">Error, relationshipTarget not found.</span>`);
				}
			}
			traitor.weeks = 1;
			traitor.actor = clone(traitorActor);
			traitor.actor.assignment = Job.REST;
			traitor.actor.pregControl = "none";
			deflate(traitor.actor);
			traitor.stats = {
				PCpregSource: SID.GENERIC,
				PCmother: SID.GENERIC,
				PCfather: SID.GENERIC,
				traitorMother: [],
				traitorFather: [],
				traitorPregSources: [],
				traitorMotherTank: [],
				traitorFatherTank: [],
				traitorBody: 0
			};
			if (traitor.actor.ID === V.PC.pregSource) {
				traitor.stats.PCpregSource = traitor.actor.ID;
			}
			if (V.PC.mother === traitor.actor.ID) {
				traitor.stats.PCmother = traitor.actor.ID;
			}
			if (V.PC.father === traitor.actor.ID) {
				traitor.stats.PCfather = traitor.actor.ID;
			}
			for (const slave of getSlaves().values()) {
				if (slave.ID !== traitor.actor.ID) {
					if (slave.mother === traitor.actor.ID) {
						traitor.stats.traitorMother.push(slave.ID);
					}
					if (slave.father === traitor.actor.ID) {
						traitor.stats.traitorFather.push(slave.ID);
					}
					if (traitor.actor.ID === slave.pregSource) {
						traitor.stats.traitorPregSources.push(slave.ID);
					}
				}
			}
			if (V.incubator.capacity > 0) {
				for (const child of getTankSlaves().values()) {
					if (traitor.actor.ID === child.mother) {
						traitor.stats.traitorMotherTank.push(child.ID);
					}
					if (traitor.actor.ID === child.father) {
						traitor.stats.traitorFatherTank.push(child.ID);
					}
				}
			}
			if (V.nursery > 0) {
				for (const child of getInfants().values()) {
					if (traitor.actor.ID === child.mother) {
						traitor.stats.traitorMotherTank.push(child.ID);
					}
					if (traitor.actor.ID === child.father) {
						traitor.stats.traitorFatherTank.push(child.ID);
					}
				}
			}
			traitor.actor.sisters = 0;
			traitor.actor.daughters = 0;
			if (traitor.actor.bodySwap > 0) {
				const myBody = getSlaves().find(s => s.origBodyOwnerID === traitorActor.ID)?.value;
				if (myBody) {
					traitor.stats.traitorBody = myBody.ID;
				}
			}
			removeSlave(traitorActor);
		}

		function agentRelease() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			r.push(`You inform ${him} that ${he} may act as a double agent for you. ${He} nods and hurries out of the penthouse. ${He} wanders down through the arcology, attracting little notice. One moment the monitors have ${him} struggling through a dense-packed crowd, and the next, they don't.`);
			if (traitorActor.intelligence + traitorActor.intelligenceImplant < 10) {
				r.push(`${He} isn't the brightest slave, but ${he} means well. Hopefully this will not come back to bite you.`);
			} else {
				r.push(`${He} is smart enough to likely do some damage to the group shadowing you, at the very least.`);
			}
			sendTraitor();
			App.Events.addParagraph(frag, r);
			return frag;
		}

		function agentIgnore() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			r.push(`${traitorActor.slaveName} nods ${his} head in acceptance. There is too much at stake to take such a risk. All attempts to use your monitoring systems to find the citizens who contacted ${him} fail; it seems their ability to corrupt your systems is considerable. ${He} keeps ${his} lips shut tight in an effort to prevent rumors from spreading, but <span class="devotion dec">whispers of freedom</span> still manage to run through your chattel.`);
			getSlaves().filter(desiresFreedom).forEach(s => s.devotion -= 5);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		function brokenFree() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			r.push(`You decide to release ${him} into the streets and keep an eye on ${him}. ${He} is quickly scooped up by several citizens, some of which you recognize from the earlier video, and taken away. There is a plot in motion against you, and it extends worryingly deep into your domain.`);
			sendTraitor();
			App.Events.addParagraph(frag, r);
			return frag;
		}

		function brokenIgnore() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			r.push(`You see no reason to humor them. All attempts to use your monitoring systems to find the citizens who visited ${traitorActor.slaveName} fail; it seems their ability to corrupt your systems is considerable. While ${he} doesn't talk, <span class="devotion dec">whispers of freedom</span> still manage to run through your chattel.`);
			getSlaves().filter(desiresFreedom).forEach(s => s.devotion -= 5);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		function free() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			r.push(`You calmly inform ${him} that ${he}'s free to go.`);
			if (traitor.type === "defiant") {
				r.push(`${He} lets out a single harsh laugh and hurries out of the penthouse.`);
			} else {
				r.push(`${He} almost collapses with shock, but turns and hurries out of the penthouse, tears streaming from ${his} eyes.`);
			}
			r.push(`${He} wanders down through the arcology, attracting little notice. One moment the monitors have ${him} struggling through a dense-packed crowd, and the next, they don't.`);
			sendTraitor();
			App.Events.addParagraph(frag, r);
			return frag;
		}

		function ignore() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			if (traitor.type === "defiant") {
				r.push(`${traitorActor.slaveName} merely <span class="devotion dec">smirks</span> when it becomes apparent you aren't going to punish ${him} for ${his} transgressions.`);
			} else {
				r.push(`${traitorActor.slaveName} almost <span class="devotion dec">faints with relief</span> when it becomes apparent you aren't going to punish ${him} for speaking of freedom.`);
			}
			r.push(`All attempts to use your monitoring systems to find the citizens who contacted ${him} fail; it seems their ability to corrupt your systems is considerable. <span class="devotion dec">Whispers of freedom</span> run like wildfire amongst your slaves.`);
			getSlaves().filter(desiresFreedom).forEach(s => s.devotion -= 10);
			traitorActor.devotion -= 15;
			newRumor.weakness();
			App.Events.addParagraph(frag, r);
			return frag;
		}

		function flog() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			r.push(`You announce that a treasonous slave will be publicly flogged. Treason is understood in the Free Cities to be activity that tends to undermine slavery, and public interest is considerable when ${traitorActor.slaveName} is dragged out into a public atrium and secured to a post. You do your duty; the one that passes the sentence should swing the lash. The ordeal is long and bloody. The populace understand the necessity of the punishment, though they are <span class="reputation dec">disturbed</span> that such a thing could happen in your penthouse of all places. The effect on ${traitorActor.slaveName}'s health <span class="health dec">is serious,</span> and ${he} is <span class="trust dec">terrified of failing you again.</span>`);
			traitorActor.trust -= 15;
			repX(-500, "event", traitorActor);
			healthDamage(traitorActor, 30);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		function lobotomy() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			r.push(`You inform ${traitorActor.slaveName} that ${he} is to return to ${his} duties, which ${he} does, mystified. Later in the day ${he} finds ${himself} scheduled for surgery, and meekly goes. As ${he} feels the cool touch of the injector, loaded with powerful chemical lobotomizing agents, ${he} looks up at the camera above the autosurgery with a hint of`);
			if (traitor.type === "defiant") {
				r.push(`regret`);
			} else {
				r.push(`resigned apology`);
			}
			r.push(`in ${his} eyes. When ${he} is released from the surgery's care a few hours later, the hint is gone. <span class="red">As is everything.</span>`);
			applyMindbroken(traitorActor);
			App.Events.addParagraph(frag, r);
			return frag;
		}

		function execute() {
			const frag = new DocumentFragment();
			let r = [];
			unlock();
			r.push(`You announce that a treasonous slave will be publicly executed. Treason is understood in the Free Cities to be activity that tends to undermine slavery, and public interest is considerable when ${traitorActor.slaveName} is dragged out into a public atrium and`);
			if (FutureSocieties.isActive('FSAztecRevivalist')) {
				r.push(`has ${his} heart cut out of ${his} living body.`);
			} else if (FutureSocieties.isActive('FSEdoRevivalist')) {
				r.push(`is boiled alive.`);
			} else if (FutureSocieties.isActive('FSRomanRevivalist')) {
				r.push(`is crucified and left hanging until ${he} perishes.`);
			} else {
				r.push(`is summarily hanged.`);
			}
			r.push(`The populace understands the necessity of the punishment, though they are <span class="reputation dec">disturbed</span> that such a thing could happen in your penthouse of all places. The surviving slaves are <span class="trust dec">terrified</span> at the display, but at least you can be sure they will remember the price of failing you.`);
			repX(-500, "event", traitorActor);
			getSlaves().forEach(function(s) {
				s.trust -= 10 + random(10);
			});
			removeSlave(traitorActor, {dead: true, traitor: true});
			App.Events.addParagraph(frag, r);
			return frag;
		}

		/** unlock Continue button */
		function unlock() {
			V.nextButton = "Continue";
			App.Utils.updateUserButton();
		}
	}
};
