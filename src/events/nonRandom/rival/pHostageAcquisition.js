// cSpell:ignore proph, tranq'd, abou

App.Events.pHostageAcquisition = class pHostageAcquisition extends App.Events.BaseEvent {
	eventPrerequisites() {
		return [
			() => V.rival.hostageState === 2,
			() => !!getHostage().actor
		];
	}

	execute(node) {
		let r = [];
		const hostage = getHostage();
		const hostageActor = hostage.actor;
		const hostageWife = hostage.wife;
		if (hostageActor === 0) {
			return;
		}
		const {
			He, His,
			he, his, him, girl, woman
		} = getPronouns(hostageActor);
		hostageActor.weekAcquired = V.week;
		let closer = 0;

		const {
			his2, woman2, wife2, girl2
		} = getPronouns(hostageWife ? hostageWife : {pronoun: App.Data.Pronouns.Kind.plural}).appendSuffix("2");
		const {girlU} = getNonlocalPronouns(V.seeDicks).appendSuffix("U");
		const {title: Master} = getEnunciation(hostageActor);
		App.Events.drawEventArt(node, hostageActor);

		r.push(`${SlaveFullName(hostageActor)}, once`);
		if (isPCCareerInCategory("wealth")) {
			r.push(`a popular party ${girl}`);
			if (V.PC.career === "rich kid") {
				closer = 1;
			}
		} else if (isPCCareerInCategory("capitalist")) {
			if (V.PC.career === "capitalist") {
				r.push(`a bright young manager`);
			} else if (V.PC.career === "entrepreneur" || V.PC.actualAge > 16) {
				r.push(`a hopeful intern`);
			} else {
				r.push(`a brilliant student`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("mercenary")) {
			if (V.PC.career === "mercenary" || V.PC.career === "recruit" || V.PC.actualAge > 16) {
				r.push(`a logistics officer`);
			} else if (V.PC.career === "child soldier") {
				r.push(`a conscript`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("engineer")) {
			if (V.PC.career === "engineer" || V.PC.career === "construction" || V.PC.actualAge > 16) {
				r.push(`an arcology sales${woman}`);
			} else if (V.PC.career === "worksite helper") {
				r.push(`a prodigy`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("medicine")) {
			if (V.PC.career === "medicine" || V.PC.career === "medical assistant" || V.PC.actualAge > 16) {
				r.push(`a surgical nurse`);
			} else if (V.PC.career === "nurse") {
				r.push(`a nurse`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("slaver")) {
			if (V.PC.career === "slaver" || V.PC.career === "slave overseer" || V.PC.actualAge > 16) {
				r.push(`an abusive pens guard`);
			} else if (V.PC.career === "slave tender") {
				r.push(`a slave caretaker`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("celebrity")) {
			if (V.PC.career === "celebrity" || V.PC.career === "rising star" || V.PC.actualAge > 16) {
				r.push(`a popular groupie`);
			} else if (V.PC.career === "slave tender") {
				r.push(`a child star`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("escort")) {
			if (V.PC.career === "escort" || V.PC.actualAge > 24) {
				r.push(`an expensive escort`);
			} else if (V.PC.career === "prostitute" || V.PC.actualAge > 16) {
				r.push(`a prostitute`);
			} else {
				r.push(`a young prostitute`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("gang")) {
			if (V.PC.career === "gang" || V.PC.career === "hoodlum" || V.PC.actualAge > 16) {
				r.push(`a gang member`);
			} else {
				r.push(`a homeless ${girl}`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("servant")) {
			if (V.PC.career === "servant" || V.PC.career === "handmaiden" || V.PC.actualAge > 16) {
				r.push(`a maid`);
			}
			if (V.PC.career === "child servant") {
				closer = 1;
			}
		} else if (isPCCareerInCategory("BlackHat")) {
			if (V.PC.career === "BlackHat" || V.PC.actualAge > 24) {
				r.push(`a brilliant code breaker`);
			} else if (V.PC.career === "hacker" || V.PC.actualAge > 16) {
				r.push(`a bright hacker`);
			} else {
				r.push(`a young hacker`);
				closer = 1;
			}
		} else if (isPCCareerInCategory("arcology owner")) {
			r.push(`a prominent Free Cities citizen`);
		}
		if (closer === 1) {
			r.push(`dear to you`);
		} else {
			r.push(`of your acquaintance`);
		}
		r.push(`from before you were an arcology owner, and then a pawn in your rival arcology owner's campaign of psychological warfare against you, is now one of your slaves. Your hired mercenaries are en route now with your precious cargo.`);

		switch (V.rival.FS.name) {
			case "Racial Subjugationism":
				if (hostageActor.preg > 0) {
					WombFatherRace(hostageActor, V.arcologies[0].FSSubjugationistRace);
				}
				setHealth(hostageActor, 50, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They kept trying to rape me with ${V.arcologies[0].FSSubjugationistRace} slaves!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s nearly the same as you remember ${him}, albeit a bit more hateful towards ${V.arcologies[0].FSSubjugationistRace} people.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They raped me with ${V.arcologies[0].FSSubjugationistRace} slaves!" ${He}'s nearly the same as you remember ${him}, albeit with a slight ${V.arcologies[0].FSSubjugationistRace} fetish.`));
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} asks`);
					r.push(Spoken(hostageActor, `"Can I spend some time with the ${V.arcologies[0].FSSubjugationistRace} slaves?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} bluntly asks`);
					r.push(Spoken(hostageActor, `"Can I get fucked by some ${V.arcologies[0].FSSubjugationistRace} studs?"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Why do you hate ${V.arcologies[0].FSSubjugationistRace} people so much?! They are a great race, capable of the most sublime love! How dare you ta-"`));
					r.push(`The mercenary captain quickly gags ${him}. "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, I'd hate for anything to happen to my best employer," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future.`);
				}
				break;
			case "Racial Supremacism":
				if (V.seePreg !== 0) {
					hostageActor.pregType = setPregType(hostageActor);
					WombInit(hostageActor);
					WombFatherRace(hostageActor, (V.arcologies[0].FSSubjugationistRace !== 0)
						? V.arcologies[0].FSSubjugationistRace
						: App.Utils.getRaceArrayWithoutParamRace(V.arcologies[0].FSSupremacistRace).random()
					);
				}
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"Thank you... Thank you..."`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s nearly the same as you remember ${him}, albeit acting slightly odd and covered in scars.`);
					hostageActor.weight = 0;
					hostageActor.muscles = 0;
					if (hostageActor.health.health > -20) {
						setHealth(hostageActor, 0, Math.max(hostageActor.health.shortDamage, 10), Math.max(hostageActor.health.longDamage, 10), 0, 100);
					}
					hostageActor.custom.tattoo = "$He has slight scarring from being beaten under your rival's rule.";
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} walks into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"T-thank you... T-thank you..."`));
					r.push(`You gently draw ${his} thin body into a comforting embrace. ${He}'s nearly the same as you remember ${him}, albeit thinner, acting odd and covered in many scars.`);
					hostageActor.weight = -20;
					hostageActor.muscles = -20;
					if (hostageActor.health.health > -40) {
						setHealth(hostageActor, 0, Math.max(hostageActor.health.shortDamage, 20), Math.max(hostageActor.health.longDamage, 20), 1, 100);
					}
					hostageActor.custom.tattoo = "$He has noticeable scarring from being beaten under your rival's rule.";
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shuffles into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"T-thank you..."`));
					r.push(`You gently draw ${his} rail thin body into a comforting embrace, though you can't help but feel ${his}`);
					if (V.seePreg !== 0) {
						r.push(`swollen`);
					} else {
						r.push(`caved-in`);
					}
					r.push(`belly pressing into your own. ${He}'s nearly the same as you remember ${him}, albeit thinner,`);
					if (V.seePreg !== 0) {
						r.push(`pregnant,`);
					}
					r.push(`acting very odd, and heavily covered in scars.`);
					hostageActor.weight = -50;
					hostageActor.muscles = -50;
					if (hostageActor.health.health > -60) {
						setHealth(hostageActor, -10, 25, Math.max(hostageActor.health.longDamage, 25), 2, 100);
					}
					hostageActor.custom.tattoo = "$He has heavy scarring from being beaten under your rival's rule.";
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} attempts to stumble into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`but only makes it several pained steps before collapsing to the ground. You gently pick up ${his} frail,`);
					if (V.seePreg !== 0) {
						r.push(`bloated`);
					} else {
						r.push(`sickly`);
					}
					r.push(`body and hold it in a comforting embrace. A short`);
					r.push(Spoken(hostageActor, `"T-thank you..."`));
					r.push(`escapes ${his} tired lips. ${He}'s nearly the same as you remember ${him}, albeit emaciated,`);
					if (V.seePreg !== 0) {
						r.push(`pregnant,`);
					}
					r.push(`acting very odd and completely covered in scars.`);
					hostageActor.weight = -100;
					hostageActor.muscles = -75;
					if (hostageActor.health.health > -80) {
						setHealth(hostageActor, -20, 30, Math.max(hostageActor.health.longDamage, 30), 3, 100);
					}
					hostageActor.custom.tattoo = "$He has heavy scarring all over $his body from being beaten under your rival's rule.";
				} else {
					r.push(`Your mercenaries radio you upon arrival. "VIP recovered but... ${He} isn't all there."`);
					r.push(`Upon seeing ${him}, it's obvious ${hostageActor.slaveName} has been completely broken. You beckon to the mercenary captain to give ${him} to you. Holding ${him} in your arms, it's clear that the poor ${girl} is barely clinging to life. The mercenary captain apologizes again. "My apologies, we found ${him} like that. I'm sorry," he says as he and his group exit your penthouse, leaving you with the comatose ${hostageActor.slaveName}. ${He} looks the same as you remember, albeit emaciated, battered,`);
					if (V.seePreg !== 0) {
						r.push(`broken, and very pregnant.`);
					} else {
						r.push(`and broken.`);
					}
					r.push(`Although, if ${he} pulls through this, ${he}'ll be devoted to you forever.`);
					applyMindbroken(hostageActor, hostageActor.intelligence);
					hostageActor.weight = -100;
					hostageActor.muscles = -100;
					if (hostageActor.health.health > -100) {
						setHealth(hostageActor, -40, 30, Math.max(hostageActor.health.longDamage, 30), 4, 100);
					}
					hostageActor.custom.tattoo = "$He has intense scarring all over $his body from being beaten under your rival's rule.";
				}
				break;
			case "Repopulation Focus":
				setHealth(hostageActor, 50, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 5);
				WombFlush(hostageActor);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They took my eggs away!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember, though a medical scan reveals that ${his} ovaries contain absolutely zero egg cells.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They took my fertility away!"`));
					r.push(`${He}'s exactly as you remember, though a medical scan reveals that ${his} ovaries contain absolutely zero egg cells.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} says`);
					r.push(Spoken(hostageActor, `"You don't have to worry about knocking me up, I'm sterile!"`));
					r.push(`with a wink. While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} bluntly says`);
					r.push(Spoken(hostageActor, `"I won't let you ruin my body with a child!"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite a lip on ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick freak! My body is undefiled by child and never will be! I know your type! All you want to do is watch my belly swell with —"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, especially given ${his} hatred for pregnancy.`);
				}
				break;
			case "Eugenics":
				setHealth(hostageActor, 50, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 20);
				if (V.seeHyperPreg !== 1) {
					if (V.rival.duration <= 5) {
						r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
						if (V.PC.boobs >= 650) {
							r.push(`ample bust,`);
						} else {
							r.push(`chest,`);
						}
						r.push(`sobbing,`);
						r.push(Spoken(hostageActor, `"They filled me with cum! I think I'm pregnant!"`));
						r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember, though a medical scan reveals that ${he} is carrying ${pregNumberName(hostageActor.pregType, 2)}.`);
					} else if (V.rival.duration <= 10) {
						r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
						if (V.PC.boobs >= 650) {
							r.push(`ample bust`);
						} else {
							r.push(`chest`);
						}
						r.push(`as ${he} breaks down in tears, ${his} rounded middle pressing into your own.`);
						r.push(Spoken(hostageActor, `"They knocked me up!"`));
						r.push(`${He}'s exactly as you remember, though a medical scan reveals that ${he} is carrying ${pregNumberName(hostageActor.pregType, 2)}.`);
					} else if (V.rival.duration <= 15) {
						r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} gravid bulk back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} says`);
						r.push(Spoken(hostageActor, `"Please don't take them from me, I love them..."`));
						r.push(`While ${he} looks the same as you remember, albeit rather pregnant, ${he} certainly doesn't think the same anymore.`);
					} else if (V.rival.duration <= 20) {
						r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} gravid bulk back and forth, unsure of what to make of you. As you step forward, ${he} carefully steps back. After several steps, ${he} bluntly says`);
						r.push(Spoken(hostageActor, `"I won't let you hurt them!"`));
						r.push(`as ${he} covers ${his} pregnant belly. While ${he} looks the same as you remember, albeit very pregnant, ${he} definitely doesn't think the same anymore.`);
					} else {
						hostageActor.trust = 80;
						r.push(`Your mercenaries radio you upon arrival. "This one's got quite a lip on ${him}, you better ready yourself. We're coming in now."`);
						r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
						r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! How dare you steal a woman's purpose away from her! I'll fucking kill you if you try to touch my bab-"`));
						r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, especially when ${he} realizes ${his} babies didn't follow ${him} here.`);
					}
				} else {
					if (V.rival.duration <= 5) {
						r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
						if (V.PC.boobs >= 650) {
							r.push(`ample bust,`);
						} else {
							r.push(`chest,`);
						}
						r.push(`sobbing,`);
						r.push(Spoken(hostageActor, `"They filled me with cum! I think I'm pregnant!"`));
						r.push(`You gently wrap your arms around ${him} in a comforting embrace, yet you can't help but notice how distended ${his} belly is. ${He}'s exactly as you remember, maybe a little heftier, but a medical scan reveals, horrifyingly, that ${he} is carrying over two dozen babies in ${his} womb.`);
					} else if (V.rival.duration <= 10) {
						r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You try to pull ${him} into your`);
						if (V.PC.boobs >= 650) {
							r.push(`ample bust,`);
						} else {
							r.push(`chest,`);
						}
						r.push(`but ${his} huge pregnant belly prevents you. As ${he} breaks down in tears, ${he} moans`);
						r.push(Spoken(hostageActor, `"My womb is soo full..."`));
						r.push(`${He}'s nearly the same as you remember ${him}, save for ${his} huge pregnant belly, which a medical scan reveals contains over two dozen children.`);
					} else if (V.rival.duration <= 15) {
						r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} super gravid bulk back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough for ${his} monstrous belly to bump into your own, ${he} says`);
						r.push(Spoken(hostageActor, `"It feels so good to be stuffed completely full of life. You'll let me enjoy this, won't you?"`));
						r.push(`While ${he} looks the same as you remember, albeit grossly pregnant, ${he} certainly doesn't think the same anymore. A medical exam, much to ${his} enjoyment, reveals ${his} overfilled womb contains nearly two dozen children.`);
					} else if (V.rival.duration <= 20) {
						r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} hyper gravid bulk back and forth, unsure of what to make of you. As you step forward, ${he} carefully steps back. After several steps, ${he} bluntly says`);
						r.push(Spoken(hostageActor, `"Unless you want to put more babies in me, get back!"`));
						r.push(`as ${he} attempts to cover ${his} super-sized pregnant belly. While ${he} looks the same as you remember, albeit grotesquely pregnant, ${he} certainly doesn't think the same anymore. A medical exam, much to ${his} delight, reveals ${his} near bursting womb contains nearly two dozen children.`);
					} else {
						hostageActor.trust = 80;
						r.push(`Your mercenaries radio you upon arrival. "This one's got quite a lip on ${him}, you better ready yourself. We're coming in now."`);
						r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
						r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! How dare you steal a woman's purpose away from her! I'll show you! I hope my new pregnancy makes me burst all over your fucking off-"`));
						r.push(`The mercenary captain quickly gags ${him}. "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid. Also when we raided that arcology, we saw some shit. Girls looking like they were pregnant with elephants or with bellies coated with lumps and bumps. ${He} might be carrying something terrifying in ${his} womb, just lettin' you know," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, save for ${his} notable pot belly, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, especially if ${he} is telling the truth about what lurks in ${his} womb.`);
					}
				}
				break;
			case "Gender Radicalism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 20);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They acted so weird!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember, if not slightly more attached to you.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"Will you be as kind to me as they were?"`));
					r.push(`${He}'s exactly as you remember, if not slightly more attached to you.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} asks`);
					r.push(Spoken(hostageActor, `"Will you love me too?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} bluntly shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me you rapist!"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! Vaginas are for sex, not assholes! Don't you dare come near my ass —"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, given ${his} views on a ${girl}'s place in society.`);
				}
				break;
			case "Gender Fundamentalism":
				setHealth(hostageActor, 20, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 20);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They did such terrible things to my butt!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember, if not a little curious about anal.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They broke my butthole!"`));
					r.push(`${He}'s exactly as you remember, minus ${his} loose rear.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} says`);
					r.push(Spoken(hostageActor, `"Do you want to fuck my butt?`));
					if (V.seeDicks !== 0) {
						r.push(`Maybe touch my penis?`);
					}
					r.push(Spoken(hostageActor, `" While ${he} looks the same as you remember, minus ${his} very loose butthole${(V.seeDicks !== 0) ? ` and minuscule dick` : ``}, ${he} certainly doesn't think the same anymore.`));
				} else if (V.rival.duration <= 20) {
					hostageActor.trust = 60;
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} bluntly says`);
					r.push(Spoken(hostageActor, `"Piss off vagina fucker, slaves' asses are for pounding!"`));
					r.push(`before swinging around revealing ${his} gaping butthole. While ${he} looks the same as you remember, minus ${his} gaping anus${(V.seeDicks !== 0) ? `, tiny cock, and testicles` : ``}, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's quite lively, you better ready yourself.`);
					if (V.seeDicks !== 0) {
						r.push(`${He}'s been rock hard the entire way here, we think ${he} might have something crammed up ${his} rear. What ever it is, it isn't dangerous.`);
					}
					r.push(`We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! Assholes are the superior sex organ!"`));
					if (V.seeDicks !== 0) {
						r.push(`${He} quickly flexes ${his} Kegels several times and blows a load of cum across your shoes.`);
					} else {
						r.push(`${He} spits on your shoes.`);
					}
					r.push(`The mercenary captain quickly pulls ${him} back, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember${(V.seeDicks !== 0) ? `, save for ${his} working cock and balls` : ``}, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, given ${his} penchant for sticking things in butts.`);
				}
				break;
			case "Paternalism":
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"Thank you... Thank you..."`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s nearly the same as you remember ${him}, albeit acting slightly odd and covered in piercings and tattoos.`);
					hostageActor.weight = 0;
					if (hostageActor.health.health > -20) {
						setHealth(hostageActor, 0, Math.max(hostageActor.health.shortDamage, 10), Math.max(hostageActor.health.longDamage, 10), 0, 70);
					}
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} tries to crawl to you. You help ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} sobs`);
					r.push(Spoken(hostageActor, `"T-thank you... T-thank you..."`));
					r.push(`You gently draw ${his} thin body into a comforting embrace. ${He}'s nearly the same as you remember ${him}, albeit thinner, acting odd and covered in piercings and tattoos.`);
					hostageActor.weight = -20;
					hostageActor.muscles = -20;
					if (hostageActor.health.health > -40) {
						setHealth(hostageActor, 0, Math.max(hostageActor.health.shortDamage, 20), Math.max(hostageActor.health.longDamage, 20), 0, 80);
					}
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} tries to crawl to you. You help ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} sobs. You gently draw ${his} rail thin body into a comforting embrace, though you can't help but notice several of ${his} ribs are broken. ${He}'s barely recognizable; being much thinner, acting very odd and covered in piercings and tattoos.`);
					hostageActor.weight = -50;
					hostageActor.muscles = -50;
					if (hostageActor.health.health > -60) {
						setHealth(hostageActor, -10, 25, Math.max(hostageActor.health.longDamage, 25), 1, 90);
					}
				} else if (V.rival.duration <= 20) {
					r.push(`Upon being placed in your office, ${hostageActor.slaveName} curls into a fetal position and begins sobbing. You help ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} pitifully struggles. You gently draw ${his} emaciated body into a comforting embrace and call out ${his} name, having realized ${he} is blind. ${He} immediately calms down and moves closer to you. ${He}'s barely recognizable; being skin and bone, acting very odd and covered in piercings and tattoos.`);
					hostageActor.weight = -100;
					hostageActor.muscles = -80;
					if (hostageActor.health.health > -80) {
						setHealth(hostageActor, -20, 30, Math.max(hostageActor.health.longDamage, 30), 1, 100);
					}
				} else {
					r.push(`Your mercenaries radio you upon arrival. "VIP recovered but... I'm so sorry..."`);
					r.push(`You immediately wretch from the smell that follows the merc troop into your office. You rise to shout at them for tracking it in when you realize what the source of the smell is. A crate containing the twisted, mutilated, inked and pierced body of ${hostageActor.slaveName}. The mercenaries see themselves out as you carefully take a biometric scan of the inert, limbless body before you. ${He} is alive, but barely, and a brain scan shows few signs of activity. You call for some servants to clean ${him} up, hoping that maybe it will draw ${him} out of ${his} stupor. Deep down, you understand the ${girl} you used to know has been twisted and broken completely; never to be the same again.`);
					applyMindbroken(hostageActor, hostageActor.intelligence);
					if (hostageActor.health.health > -100) {
						setHealth(hostageActor, -40, 30, Math.max(hostageActor.health.longDamage, 30), 2, 100);
					}
					hostageActor.weight = -100;
					hostageActor.muscles = -100;
				}
				break;
			case "Degradationism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 0);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They acted so weird!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember, if not slightly more attached to you.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"Will you be as kind to me as they were?"`));
					r.push(`${He}'s exactly as you remember, if not slightly more attached to you.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} asks`);
					r.push(Spoken(hostageActor, `"Will you love me too?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} bluntly says`);
					r.push(Spoken(hostageActor, `"Stay away from me you rapist!"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 100;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! I've seen what you do to your ${girl}s! You're sick! SICK! Don't you —"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember,`);
					if (V.seePreg !== 0) {
						r.push(`minus ${his} rounded belly,`);
					}
					r.push(`but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, seeing as ${he} intends to undermine you at every turn.`);
				}
				break;
			case "Body Purism":
				setHealth(hostageActor, 0, Math.max(hostageActor.health.shortDamage, 15), Math.max(hostageActor.health.longDamage, 15), 0, 20);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} attempts to dive into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust.`);
					} else {
						r.push(`chest.`);
					}
					r.push(`The weight of ${his} huge ${hostageActor.boobs}cc fake tits knocks the wind out of you. You embrace ${him} as best you can as ${he} sobs`);
					r.push(Spoken(hostageActor, `"Look what they did to my chest! They ruined it!"`));
					r.push(`${He} looks similar to how you remember, minus ${his} huge chest of course.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${his} massive ${hostageActor.boobs}cc fake tits into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"Why do these tit balloons feel so good?!"`));
					r.push(`${He} looks similar to how you remember, minus ${his} massive chest of course.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} massive weight back and forth, unsure of what to make of you. As you step forward, ${he} attempts to move closer, only to fall to the ground under the weight of ${his} obscene ${hostageActor.boobs}cc fake tits. You kneel beside ${him}, a hand on ${his} huge fake ass, as ${he} asks`);
					r.push(Spoken(hostageActor, `"Do you like them? I think they should be bigger..."`));
					r.push(`The ${girl} you used to know is barely recognizable under those implants and ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`${hostageActor.slaveName}'s impressive bulk is placed in your office. Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth atop ${his} ${hostageActor.boobs}cc implants, unsure of what to make of you. As you step forward, ${he} screams`);
					r.push(Spoken(hostageActor, `"Don't pop my implants!"`));
					r.push(`The ${girl} you used to know is barely recognizable under those implants and ${he} certainly doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "We got a problem sir. ${He}, um, isn't going to fit... We could try bringing ${him} in through the penthouse balcony, but I'd worry about breaking things."`);
					r.push(`Once ${hostageActor.slaveName}'s immense form is safely in the penthouse, you finally get a good look at ${him}. Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} begins to let out a low growl. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! Flat girls are trash! Real men like big fake tits and asses! You're sick! SICK! Don't you-"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful." He pats ${his} grotesque breast, adding "'Least ${he} won't be going anywhere." He and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. The ${girl} you used to know is barely recognizable under those implants and ${he} certainly doesn't think the same anymore. Odds are high that ${he}'ll cause problems for you in the future, assuming you can find a doctor to remove those ridiculous implants from ${his} once flat chest. Or you could leave ${him} as an immobile ornament, though implants are definitely out of style.`);
				}
				break;
			case "Transformation Fetishism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They told me such horrible things about you!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"You aren't going to force implants into me, are you?" While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`));
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} states`);
					r.push(Spoken(hostageActor, `"Please don't make me into a blow up doll..."`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} screams`);
					r.push(Spoken(hostageActor, `"Keep away from me! I don't want balloons on my chest!"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! I've seen what you do to your girls! Filling them with silicone and implants and shit! Don't you ever THINK abou-"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, given ${his} hatred for implants.`);
				}
				break;
			case "Youth Preferentialism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"This old ${woman2} tried to make me ${his2} pet!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They made me make out with an old lady!"`));
					r.push(`${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} asks`);
					if (V.PC.visualAge >= 50) {
						r.push(Spoken(hostageActor, `"Were you always that attractive?"`));
					} else {
						r.push(Spoken(hostageActor, `"Can I hang out with some MILFs?"`));
					}
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					hostageActor.trust = 40;
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} says`);
					if (V.PC.visualAge >= 50) {
						r.push(Spoken(hostageActor, `"You know, you're soo much older than me... I like that,"`), `with a wink.`);
					} else if (V.PC.visualAge < 35) {
						r.push(Spoken(hostageActor, `"Ew, you're soo young. Keep your hands off me!"`));
					} else {
						r.push(Spoken(hostageActor, `"Can you hook me up with a nice MILF?"`));
					}
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					setHealth(hostageActor, 80, hostageActor.health.shortDamage, hostageActor.health.longDamage);
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"How fucking DARE you split me up from my MILFy ${wife2}! I saw your arcology on the way in, and it's SICK. So many young ${girlU}s, you're sick, you hear me!? SI-"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, given ${his} hatred for young people.`);
				}
				break;
			case "Maturity Preferentialism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"This young ${girl2} kept molesting me!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They made me make out with some young harlot!"`));
					r.push(`${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} asks`);
					if (V.PC.visualAge < 35) {
						r.push(Spoken(hostageActor, `"Were you always that attractive?"`));
					} else {
						r.push(Spoken(hostageActor, `"Can I hang out with the rest of the young ladies?"`));
					}
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					hostageActor.trust = 40;
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} says`);
					if (V.PC.visualAge < 35) {
						r.push(Spoken(hostageActor, `"You know, you're soo young... I like that,"`), `with a wink.`);
					} else if (V.PC.visualAge >= 50) {
						r.push(Spoken(hostageActor, `"Ew, you're soo old. Keep your hands off me!"`));
					} else {
						r.push(Spoken(hostageActor, `"Can you hook me up with a nice young ${girl2}?"`));
					}
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"How fucking DARE you split me up from my youthful ${wife2}! I saw your arcology on the way in, and it's SICK. So many old ladies, you're sick, you hear me!? SI-"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, given ${his} hatred for older people.`);
				}
				break;
			case "Slimness Enthusiasm":
				setHealth(hostageActor, -30, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 40);
				hostageActor.chem = 100;
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} attempts to dive into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust.`);
					} else {
						r.push(`chest.`);
					}
					r.push(`The weight of ${his} huge ${hostageActor.boobs}cc tits knocks the wind out of you. You embrace ${him} as best you can, you hands sinking into ${his} soft butt, as ${he} sobs`);
					r.push(Spoken(hostageActor, `"Look what they did to my chest and ass! They ruined them!"`));
					r.push(`${He} looks similar to how you remember, minus ${his} huge assets of course.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${his} massive ${hostageActor.boobs}cc breasts into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"Why do these meat balloons feel so good?!"`));
					r.push(`${He} looks similar to how you remember, minus ${his} massive assets of course.`);
				} else if (V.rival.duration <= 15) {
					r.push(`${hostageActor.slaveName}'s impressive bulk is placed in your office. Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth atop ${his} ${hostageActor.boobs}cc breasts, causing ${his} chubby body and fat ass to jiggle, unsure of what to make of you. As you step forward, ${he} asks`);
					r.push(Spoken(hostageActor, `"Can you make my tits bigger?"`));
					r.push(`The ${girl} you used to know is barely recognizable under those massive tits and ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`${hostageActor.slaveName}'s impressive bulk is placed in your office. Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth atop ${his} ${hostageActor.boobs}cc implants, causing ${his} plump body and huge ass to jiggle, unsure of what to make of you. As you step forward, ${he} screams`);
					r.push(Spoken(hostageActor, `"Don't take my breasts away!"`));
					r.push(`The ${girl} you used to know is barely recognizable under those immense tits and ${he} certainly doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "We got a problem sir. ${He}, um, isn't going to fit... We could try bringing ${him} in through the penthouse balcony, but I'd worry about breaking things."`);
					r.push(`Once ${hostageActor.slaveName}'s immense form is safely in the penthouse, you finally get a good look at ${him}. Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} begins to let out a low growl. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! Flat girls are trash! Real men like big tits and asses! You're sick! SICK! Don't you —"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful." He pats ${his} grotesque breast, adding "'Least ${he} won't be going anywhere." He and his group exit your penthouse, leaving you with the enraged and struggling ${hostageActor.slaveName}. You sigh at the amount of motion running through ${his} absurd tits, mountainous ass, and obese body. The ${girl} you used to know is barely recognizable under all that flesh and ${he} certainly doesn't think the same anymore. Odds are high that ${he}'ll cause problems for you in the future, once ${his} body sheds the weight. Or you could leave ${him} as an immobile ornament, though assets of that size are definitely out of style.`);
				}
				break;
			case "Asset Expansionism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They told me such horrible things about you!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"You aren't going to make my tits huge, are you?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} pleads`);
					r.push(Spoken(hostageActor, `"Please don't turn me into a big-boobed freak..."`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} screams`);
					r.push(Spoken(hostageActor, `"Keep away from me! I don't want tits bigger than my body!"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! I've seen what you do to your girls! Filling them up with growth drugs! Don't you ever THINK abou-"`));
					r.push(`The mercenary captain quickly gags ${him}. "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, given ${his} hatred for huge assets.`);
				}
				break;
			case "Pastoralism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 70);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"I've never had to exercise so much; I'm exhausted!"`));
					r.push(`You gently wrap your arms around ${his} soft body in a comforting embrace. ${He}'s exactly as you remember.`);
					if (closer && hostageActor.actualAge <= 16 && hostageActor.boobs > 800) {
						r.push(`Well, except for the sizable bosoms pressing against you; puberty was quite generous to ${him}`);
					}
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`feeling the muscles under ${his} chubby body, as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"You aren't going to make me pump iron, are you?"`));
					r.push(`While ${he}'s thinner than you remember, and a little more muscular, ${his} personality is exactly the same.`);
					if (closer && hostageActor.actualAge <= 16 && hostageActor.boobs > 800) {
						r.push(`You can't help but notice the size of ${his} breasts pressing against you; puberty was generous to ${him}`);
					}
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} says`);
					r.push(Spoken(hostageActor, `"I don't want to ever be so heavy again..."`));
					r.push(`${He} is noticeably thinner and much more muscular than you remember; ${he} certainly doesn't think the same anymore, either.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} screams`);
					r.push(Spoken(hostageActor, `"Keep away from me! I don't want ever want to be a fat cow again!"`));
					r.push(`${He} is thin and extremely muscular, a stark difference from the soft, chubby ${girl} you used to know; ${he} certainly doesn't think the same anymore, either.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "We have a problem, sir. This one is a fighter, ${he} already broke one of our guy's jaw. We think ${he} is tranq'd and restrained enough to bring in. Please be ready."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! I'll never be a cow again. DON'T YOU DARE TOUCH ME!"`));
					r.push(`The mercenary captain is thrown back as ${he} explodes out of ${his} restraints, having been preparing to gag ${him}. The rest of the troop center their weapons on ${him}, forcing ${him} to back down. ${He} glares at you as the captain picks himself up and exits your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} grunts as ${he} exits the office for the slave quarters, stopping in the doorway.`);
					r.push(Spoken(hostageActor, `"I'll be your slave, but you're going to be sorry."`));
					r.push(`With a hand on each door frame, ${he} rips it out of the wall. ${He} lets out a single laugh while scowling at you. ${He} is thin and extremely muscular, a stark difference from the soft, chubby ${girl} you used to know; ${he} certainly doesn't think the same anymore, either. Odds are high that ${he}'ll cause problems for you in the future, given ${his} hatred for you and ${his} frightening strength.`);
				}
				break;
			case "Cummunism":
				setHealth(hostageActor, -30, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} attempts to dive into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust.`);
					} else {
						r.push(`chest.`);
					}
					r.push(`The weight of ${his} huge ${hostageActor.boobs}cc tits knocks the wind out of you. You embrace ${him} as best you can, you hands sinking into ${his} soft butt, as ${he} sobs`);
					r.push(Spoken(hostageActor, `"They made me fat! My nipples won't stop leaking milk!"`));
					r.push(`${He} looks similar to how you remember, minus ${his} huge milky assets of course.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${his} massive ${hostageActor.boobs}cc milky breasts into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"Why did they make me into a cow, I don't understand..."`));
					r.push(`${He} looks similar to how you remember, minus ${his} massive assets of course.`);
				} else if (V.rival.duration <= 15) {
					r.push(`${hostageActor.slaveName}'s impressive bulk is placed in your office. Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth atop ${his} ${hostageActor.boobs}cc breasts, causing ${his} chubby body and fat ass to jiggle, unsure of what to make of you. As you step forward, ${he} asks`);
					r.push(Spoken(hostageActor, `"Can you milk me?"`));
					r.push(`The ${girl} you used to know is barely recognizable under all that fat and ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					hostageActor.trust = 40;
					r.push(`${hostageActor.slaveName}'s impressive bulk is placed in your office. Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth atop ${his} ${hostageActor.boobs}cc breasts, causing ${his} fat body and huge ass to jiggle, unsure of what to make of you. As you step forward, ${he} asks`);
					r.push(Spoken(hostageActor, `"I hear a baby will make my milk better, would you like to try?"`));
					r.push(`The ${girl} you used to know is barely recognizable under those immense tits and obese body; ${he} certainly doesn't think the same anymore, either.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "We got a problem sir. ${He}, um, isn't going to fit... We could try bringing ${him} in through the penthouse balcony, but I'd worry about breaking things."`);
					r.push(`Once ${hostageActor.slaveName}'s immense form is safely in the penthouse, you finally get a good look at ${him}. Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} begins to let out a low growl. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! Fit girls are trash! Real men like big soft bodies! You're sick! SICK! Don't you —"`));
					r.push(`The mercenary captain quickly gags ${him}. "My apologies, I did warn you ${he} was a handful." He pats ${his} grotesque breast, adding "'Least ${he} won't be going anywhere." He and his group exit your penthouse, leaving you with the enraged and struggling ${hostageActor.slaveName}. You sigh at the amount of motion running through ${his} absurd tits, mountainous ass, and obese body. The ${girl} you used to know is barely recognizable under all that flesh and ${he} certainly doesn't think the same anymore. Odds are high that ${he}'ll cause problems for you in the future, once ${his} body sheds the weight. Or you could leave ${him} as an immobile ornament, though assets of that size are definitely out of style.`);
				}
				break;
			case "Physical Idealism":
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`${his} added heft knocking the wind out of you. You gently wrap your arms around ${him} in a comforting embrace, your arms gently sinking into ${his} soft flesh, as ${he} sobs,`);
					r.push(Spoken(hostageActor, `"They made me fat! I'm so glad those guys let me puke up all that food; I don't even want to think how big I'd be otherwise!"`));
					r.push(`${He} looks similar to how you remember, thanks to the pudge, though that can be easily rectified.`);
					setHealth(hostageActor, 0, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 0);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${his} meaty body into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"Why did they make me into a sow, I don't understand..."`));
					r.push(`${He} looks similar to how you remember, minus ${his} added weight of course.`);
					setHealth(hostageActor, -10, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 0);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth causing ${his} plump body, big breasts and fat ass to jiggle, unsure of what to make of you. As you step forward, ${he} asks`);
					r.push(Spoken(hostageActor, `"Can I have some food?"`));
					r.push(`The ${girl} you used to know is barely recognizable under all that fat and ${he} certainly doesn't think the same anymore.`);
					setHealth(hostageActor, -30, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 0);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth causing ${his} fat body to jiggle, unsure of what to make of you. As you step forward, ${he} stumbles back. After several steps, ${he} screams`);
					r.push(Spoken(hostageActor, `"Keep away from me! I don't want to work out! Stuffing my face and holes whenever I please is too much fun!"`));
					r.push(`The ${girl} you used to know is barely recognizable under that obese body; ${he} certainly doesn't think the same anymore, either.`);
					setHealth(hostageActor, -50, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 0);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "We got a problem sir. ${He}, um, is rather heavy and can't walk well... We're working our way up, but, do you have a freight elevator by chance?"`);
					r.push(`Once ${hostageActor.slaveName}'s hugely fat ass is safely in the penthouse, you finally get a good look at ${him}. Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} begins to let out a low growl. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! Fit girls are trash! Real men like big soft bodies! You're sick! SICK! Don't you —"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful." He pats ${his} fat coated shoulder, to which ${he} immediately sits down. Several mercs join their captain in trying to pull ${him} back to ${his} feet. A load crack and a groan of pain escapes the captain as he drops to the ground clutching his back. His comrades quickly help him from the penthouse, leaving you to deal with the scowling blob of fat and flesh. ${He} is intent on not budging from that spot and you aren't interested in breaking anything, though you're certain ${he}'ll be begging for food within an hour and easily manipulated. ${He} is massively fat, a stark difference from the fit, thin ${girl} you used to know; ${he} certainly doesn't think the same anymore, either. Odds are high that ${he}'ll cause problems for you in the future, be it breaking furniture or getting stuck in doors, though given ${his} rather laid back life up until this point, ${he} is likely to be quite malleable. Though ${he} is wheezing quite a lot considering ${he} is just sitting there.`);
					setHealth(hostageActor, -80, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 0);
				}
				break;
			case "Hedonistic Decadence":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 70);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"I've never had to exercise so much, I'm exhausted!"`));
					r.push(`You gently wrap your arms around ${his} soft body in a comforting embrace. ${He}'s exactly as you remember.`);
					if (closer && hostageActor.actualAge <= 16 && hostageActor.boobs > 800) {
						r.push(`Well, except for the sizable bosoms pressing against you; puberty was quite generous to ${him}`);
					}
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`feeling the muscles under ${his} chubby body, as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"You aren't going to make me pump iron, are you?"`));
					r.push(`While ${he}'s thinner than you remember, and a little more muscular, ${his} personality is exactly the same.`);
					if (closer && hostageActor.actualAge <= 16 && hostageActor.boobs > 800) {
						r.push(`You can't help but notice the size of ${his} breasts pressing against you; puberty was generous to ${him}`);
					}
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} says`);
					r.push(Spoken(hostageActor, `"I don't want to ever be so heavy again..."`));
					r.push(`${He} is noticeably thinner and much more muscular than you remember; ${he} certainly doesn't think the same anymore, either.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} screams`);
					r.push(Spoken(hostageActor, `"Keep away from me! I don't want ever want to be a fat sow again!"`));
					r.push(`${He} is thin and extremely muscular, a stark difference from the soft, chubby ${girl} you used to know; ${he} certainly doesn't think the same anymore, either.`);
				} else {
					hostageActor.trust = 100;
					r.push(`Your mercenaries radio you upon arrival. "We have a problem, sir. This one is a fighter, ${he} already broke one of our guy's jaw. We think ${he} is tranq'd and restrained enough to bring in. Please be ready."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you sick fuck! I'll never be a cow again. DON'T YOU DARE TOUCH ME!"`));
					r.push(`The mercenary captain is thrown back as ${he} explodes out of ${his} restraints, having been preparing to gag ${him}. The rest of the troop center their weapons on ${him}, forcing ${him} to back down. ${He} glares at you as the captain picks himself up and exits your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} grunts as ${he} exits the office for the slave quarters, stopping in the doorway.`);
					r.push(Spoken(hostageActor, `"I'll be your slave, but you're going to be sorry."`));
					r.push(`With a hand on each door frame, ${he} rips it out of the wall. ${He} lets out a single laugh while scowling at you. ${He} is thin and extremely muscular, a stark difference from the soft, chubby ${girl} you used to know; ${he} certainly doesn't think the same anymore, either. Odds are high that ${he}'ll cause problems for you in the future, given ${his} hatred for you and ${his} frightening strength.`);
				}
				break;
			case "Chattel Religionism":
				setHealth(hostageActor, 50, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They told me such horrible things about you!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"You aren't trying to make some crazy religion, are you?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} pleads`);
					r.push(Spoken(hostageActor, `"Please don't turn me into a disciple of your religion..."`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} screams`);
					r.push(Spoken(hostageActor, `"Keep away from me! I don't want to be part of your cult!"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you crazy psycho! Making your own religion, blasphemous! You think yourself a proph-"`));
					r.push(`The mercenary captain quickly gags ${him}. "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says, as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future.`);
				}
				break;
			case "Multiculturalism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They said such crazy things!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They made me pray for your arcology; why is that?"`));
					r.push(`${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} prays`);
					r.push(Spoken(hostageActor, `"Please pardon this arcology..."`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					hostageActor.trust = 40;
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} drops to ${his}`);
					if (hasBothLegs(hostageActor)) {
						r.push(`${his} knees`);
					} else {
						r.push(`the ground`);
					}
					r.push(`and begins praying`);
					r.push(Spoken(hostageActor, `"Please pardon this arcology's sins! They know not what they do!"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite a mouth on ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a mercy. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Be still, I'll lead your arcology to salvation. Place your faith in me and be sav-"`));
					r.push(`The mercenary captain quickly gags ${him}. "My apologies, I did warn you about that mouth. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the disappointed ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, trying to preach ${his} new faith.`);
				}
				break;
			case "Intellectual Dependency":
				setHealth(hostageActor, 80, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 5);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They tried to teach me the most obscene things!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They made me a whore. I feel so disgusting..."`));
					r.push(`${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 15) {
					hostageActor.devotion = 40;
					hostageActor.trust = 40;
					r.push(`Upon seeing you, ${hostageActor.slaveName} stiffens up and waits for you to make a move. ${He} holds completely still, even as you place a hand on ${his} shoulder. ${He} stutters out a quiet`);
					r.push(Spoken(hostageActor, `"${Master}? W-what may I do f-for you?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					hostageActor.devotion = 65;
					hostageActor.trust = 65;
					r.push(`Upon seeing you, ${hostageActor.slaveName} graciously bows, giving you a lovely view down ${his} cleavage. ${He} holds this position, before stating`);
					r.push(Spoken(hostageActor, `"My body is yours to use."`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else {
					hostageActor.devotion = 100;
					hostageActor.trust = 100;
					r.push(`Upon seeing you, ${hostageActor.slaveName} graciously bows, giving you a lovely view down ${his} cleavage, before resuming ${his} perfect stance.`);
					r.push(Spoken(hostageActor, `"I am your property now and any thoughts of my previous owner are no longer relevant. Any feelings I may have had have been left behind and will not influence me. I am yours to use as you please, no matter what the outcome may be. How may I service you, ${Master}?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				}
				break;
			case "Slave Professionalism":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 0);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They did things to me! My head hurts so much..."`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"I can barely remember things anymore; who were you again? I hate to ask, but... I need a good fuck right now..."`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly can't think the same anymore.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} bounces into your arms.`);
					r.push(Spoken(hostageActor, `"Wanna do it?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} wastes no time in`);
					if (V.PC.dick !== 0) {
						r.push(`unbuckling your pants`);
					} else {
						r.push(`slipping under your skirt`);
					}
					r.push(`and going to town. While ${he} looks the same as you remember${(V.seePreg !== 0) ? `, albeit a little pregnant` : ``}, ${he} definitely doesn't think the same anymore.`);
				} else {
					r.push(`Your mercenaries radio you upon arrival. "This one's got one thing ${his} mind, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with excitement. As you step forward, ${he} struggles against ${his} bindings, desperately trying to get loose. The mercenary captain yanks ${him} back. "My apologies, the only thing left of ${his} mind is a libido it feels like. Please be careful when you unbind ${him}, ${he}'s nothing more than a horny idiot now," he says as he and his group exit your penthouse, leaving you with the dripping ${hostageActor.slaveName}. ${He} looks the same as you remember${(V.seePreg !== 0) ? `, albeit a little pregnant` : ``}, but ${he} acts nothing like the ${girl} you used to know. ${He}'s probably too dumb to manage to cause any trouble, but is likely to be high maintenance given ${his} ineptitude and nymphomania.`);
				}
				break;
			case "Petite Admiration":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"This giant ${woman2} tried to make me ${his2} pet!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They made me make out with a giant!"`));
					r.push(`${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} asks`);
					/* player height check here */
					r.push(Spoken(hostageActor, `"Can I hang out with someone taller than me?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					hostageActor.trust = 40;
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} says`);
					/* player height check here */
					r.push(Spoken(hostageActor, `"Can you hook me up with someone nice and tall?"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"How fucking DARE you split me up from my sweet giant! I saw your arcology on the way in, and it's SICK. So many little girls, you're sick, you hear me!? SI-"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, given ${his} hatred for the short.`);
				}
				break;
			case "Statuesque Glorification":
				setHealth(hostageActor, 60, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"This midget kept molesting me!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					r.push(Spoken(hostageActor, `"They made me get on ${(hasBothLegs(hostageActor)) ? `my knees` : `the ground`} and make out with some tiny harlot!"`));
					r.push(`${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} asks`);
					/* player height check here */

					r.push(Spoken(hostageActor, `"Is there anyone shorter I can hang out with around here?"`));
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					hostageActor.trust = 40;
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} says`);
					/* player height check here */

					r.push(Spoken(hostageActor, `"Can you hook me up with someone on the short side? I didn't really notice anyone on the way in..."`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"How fucking DARE you split me up from my little ${wife2}! There was more love in ${his2} tiny body than in your entire arcology! To think that you fucks place everything on hei-"`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future, given ${his} hatred for tall people.`);
				}
				break;
			default:
				setHealth(hostageActor, 40, hostageActor.health.shortDamage, hostageActor.health.longDamage, 0, 10);
				if (V.rival.duration <= 5) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} dives into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust,`);
					} else {
						r.push(`chest,`);
					}
					r.push(`sobbing,`);
					r.push(Spoken(hostageActor, `"They told me such horrible things about you!"`));
					r.push(`You gently wrap your arms around ${him} in a comforting embrace. ${He}'s exactly as you remember.`);
				} else if (V.rival.duration <= 10) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} gingerly approaches, uncertain if ${he} should. You pull ${him} into your`);
					if (V.PC.boobs >= 650) {
						r.push(`ample bust`);
					} else {
						r.push(`chest`);
					}
					r.push(`as ${he} breaks down in tears.`);
					if (V.rival.FS.name !== "") {
						r.push(Spoken(hostageActor, `"You aren't trying to make some crazy old-timey society, are you?"`));
					} else {
						r.push(Spoken(hostageActor, `"You aren't going to try to make me... do things to you, right?"`));
					}
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 15) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} hesitatingly approaches. Once ${he} is close enough ${he} says`);
					if (V.rival.FS.name !== "") {
						r.push(Spoken(hostageActor, `"Please don't make me play along..."`));
					} else {
						r.push(Spoken(hostageActor, `"I don't want to be your plaything..."`));
					}
					r.push(`While ${he} looks the same as you remember, ${he} certainly doesn't think the same anymore.`);
				} else if (V.rival.duration <= 20) {
					r.push(`Upon seeing you, ${hostageActor.slaveName} shifts ${his} weight back and forth, unsure of what to make of you. As you step forward, ${he} quickly steps back. After several steps, ${he} screams`);
					r.push(Spoken(hostageActor, `"Keep away from me! I don't want to be part of your crazy society!"`));
					r.push(`While ${he} looks the same as you remember, ${he} definitely doesn't think the same anymore.`);
				} else {
					hostageActor.trust = 80;
					r.push(`Your mercenaries radio you upon arrival. "This one's got quite some spunk in ${him}, you better ready yourself. We're coming in now."`);
					r.push(`Upon seeing you, ${hostageActor.slaveName}'s eyes fill with a distinct hatred. As you step forward, ${he} stands ${his} ground. After several steps, ${he} shouts`);
					r.push(Spoken(hostageActor, `"Stay away from me, you crazy psycho! ${V.rival.FS.name !== "" ? `Remaking a fallen empire, madness! You think yourself a king —"` : `You think you can just take whatever you want from people — Fuck, I don't even know if you even THINK of them as people anymore! How dare you even think I —"`}`));
					r.push(`The mercenary captain quickly gags ${him}, "My apologies, I did warn you ${he} was a handful. Please be careful when you unbind ${him}, ${he} may try to do something stupid," he says as he and his group exit your penthouse, leaving you with the enraged ${hostageActor.slaveName}. ${He} looks the same as you remember, but ${he} acts nothing like the ${girl} you used to know. Odds are high that ${he}'ll cause problems for you in the future.`);
				}
		}

		if (V.rival.duration <= 10 || (V.rival.FS.name === "Racial Supremacism" || V.rival.FS.name === "Paternalism") && V.rival.duration <= 20) {
			r.push(`${He} considers you ${his} rescuer, since ${his} previous owner subjected ${him} to unremitting horror in an attempt`);
			if (V.rival.FS.name !== "") {
				r.push(`to offend your philosophy of ${V.rival.FS.name}.`);
			} else {
				r.push(`turn ${him} against you.`);
			}
			r.push(`${He}'s overjoyed to be your slave.`);
		} else if ((V.rival.FS.name === "Racial Supremacism" || V.rival.FS.name === "Paternalism") && V.rival.duration > 20) {
			r.push(`${His} mind and body were destroyed in an attempt to offend your philosophy of ${V.rival.FS.name}. If ${he} ever recovers, ${he}'d consider you ${his} savior and be overjoyed to be your slave.`);
		} else if (V.rival.FS.name === "Slave Professionalism") {
			r.push(`${His} mind was ravaged and perverted by rampant use of psychosuppressants and aphrodisiacs. There is no coming back from the damages done.`);
		} else if (V.rival.FS.name === "Intellectual Dependency") {
			r.push(`${He} has undergone so much slave training that ${he} considers this turn of events ultimately meaningless. You are just ${his} new owner and ${he} will serve you to the best of ${his} abilities; as a slave should.`);
		} else if (V.rival.duration > 20) {
			r.push(`You took everything from ${him} and ${he} hates you as much as ${he} possibly can for it. You ripped ${him} away from heaven to sentence ${him} to a living hell, and ${he} swears to do everything ${he} can to hurt you.`);
		} else {
			r.push(`${He} is horrified by this turn of events. Your rival taught ${him} a great deal about slave life in your arcology and indulged ${his} deepest fantasies. ${hostageActor.slaveName} considers becoming your slave little better than a condemnation to purgatory.`);
		}

		App.Events.addParagraph(node, r);
		node.append(App.UI.newSlaveIntro(hostageActor));
		delete hostage.wife;
		hostage.actor = 0;
	}
};
