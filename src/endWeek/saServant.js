/**
 * @param {FC.ReportSlave} slave
 * @param {number} [stewardessBonus=0] - bonus from facility leader effects
 * @returns {string}
 */
App.SlaveAssignment.servant = function saServant(slave, stewardessBonus = 0) {
	/** @type {string[]} */
	const r = [];

	const {
		he, him, his, himself, He, His, wife
	} = getPronouns(slave);

	let cash = 0;

	jobPreface(slave);
	if (App.Entity.facilities.servantsQuarters.established) {
		if ((V.universalRulesFacilityWork === 1 && slave.assignment === window.Job.HOUSE && App.EndWeek.saVars.facilitySpots.servantsQuarters > 0) || (slave.assignment === window.Job.QUARTER)) {
			facilityEffects(slave);
		}
	}
	jobReaction(slave);
	jobEffects(slave);
	physicalEffects(slave);
	if (V.showVignettes === 1 && (slave.assignment === window.Job.QUARTER || slave.assignment === window.Job.HOUSE)) {
		assignmentVignette(slave);
	}

	return r.join(" ");


	/**
	 * @param {FC.SlaveState} slave
	 *
	 */
	function jobPreface(slave) {
		r.push(`works as a servant. ${He} performs the lowest jobs in your penthouse, cleaning up after your other slaves, bathing them, helping them dress, and giving them sexual relief.`);
	}

	/**
	 * @param {FC.SlaveState} slave
	 *
	 */
	function facilityEffects(slave) {
		if (slave.assignment === window.Job.HOUSE) {
			r.push(`Since there's extra space in the servants' quarters, ${V.assistant.name} attaches ${him} to the cadre of maids there.`);
			App.EndWeek.saVars.facilitySpots.servantsQuarters--;
		}
		if (S.Stewardess) {
			const hasSex = App.EndWeek.saVars.flSex.has(slave.ID);
			const impregData = App.EndWeek.saVars.flImpreg[slave.ID];
			const baseSexCount = Math.trunc(2 + S.Stewardess.energy / 20);
			const {his:hisS} = getPronouns(S.Stewardess);
			r.push(`This brings ${him} under ${S.Stewardess.slaveName}'s supervision. The Stewardess`);
			if (slave.devotion < -20) {
				if (hasSex || impregData) {
					r.push(`subjects ${him} to <span class="trust dec">corrective rape</span> when ${his} service is imperfect, <span class="devotion inc">when ${he} steps out of line,</span> or when the Stewardess just feels like raping ${him}, forcing the poor slave to <span class="yellowgreen">find refuge in work.</span>`);
					if (impregData) { // Sex is already done in servantQuartersReport
						r.push(`${S.Stewardess.slaveName} focuses ${hisS} attention on ${slave.slaveName}'s ${slave.mpreg === 1 ? `ass` : `pussy`},`);
						if (impregData.virginityLoss) {
							r.push(`taking ${his} <span class="virginity loss">${slave.mpreg === 1 ? `anal virginity` : `virginity`}</span> and ensuring`);
						}
						r.push(`ensuring ${his} ${slave.mpreg === 1 ? `anal womb` : `womb`} is always full of cum.`);

						if (impregData.success && slave.pregKnown === 1) {
							r.push(`${He} is now <span class="pregnant">carrying ${S.Stewardess.slaveName}'s child.</span>`);
						}
						if (slave.fetish === Fetish.PREGNANCY) {
							r.push(`Despite ${his} reluctance, ${he} <span class="devotion inc">shamefully gets off</span> from being bred this way.`);
							slave.devotion++;
						}
					} else {
						SimpleSexAct.Slaves(slave, S.Stewardess, jsRandom(baseSexCount, baseSexCount + 3));
						slave.need -= [Fetish.SUBMISSIVE, Fetish.MASOCHIST].includes(slave.fetish) ? 20 : 5;
					}
				} else {
					r.push(`applies <span class="trust dec">harsh punishments</span> when ${his} service is imperfect, <span class="devotion inc">when ${he} steps out of line,</span> or when the Stewardess just feels like hurting ${him}, forcing the poor slave to <span class="yellowgreen">find refuge in work.</span>`);
				}
				slave.devotion += 2;
				slave.trust -= 2;
			} else if (slave.devotion <= 20) {
				if (impregData) { // Sex is already done in servantQuartersReport
					r.push(`regularly breeds ${his} ${slave.mpreg === 1 ? `ass`: `pussy`},`);
					if (impregData.virginityLoss) {
						r.push(`taking ${his} <span class="virginity loss">${slave.mpreg === 1 ? `anal virginity` : `virginity`}</span> and`);
					}
					r.push(`encouraging the poor slave to <span class="devotion inc">keep ${his} head down</span> and <span class="cash inc">work harder.</span>`);

					if (impregData.success && slave.pregKnown === 1) {
						r.push(`${S.Stewardess.slaveName}'s efforts pay off and has <span class="pregnant">successfully impreganted ${slave.slaveName}.</span>`);
					}
					if (slave.fetish === Fetish.PREGNANCY) {
						r.push(`${He} <span class="devotion inc">enjoys all the attention</span> ${his} ${slave.mpreg === 1 ? `anal womb` : `womb`} receives from ${S.Stewardess.slaveName}.`);
						slave.devotion++;
					}
				} else if (hasSex) {
					r.push(`molests ${him}, encouraging the poor slave to <span class="devotion inc">keep ${his} head down</span> and <span class="cash inc">work harder.</span>`);
					SimpleSexAct.Slaves(slave, S.Stewardess, jsRandom(baseSexCount, baseSexCount + 3));
					slave.need -= [Fetish.SUBMISSIVE, Fetish.MASOCHIST].includes(slave.fetish) ? 20 : 10;
				} else {
					r.push(`punishes ${him} when appropriate, encouraging the poor slave to <span class="devotion inc">keep ${his} head down</span> and <span class="cash inc">work harder.</span>`);
				}
				slave.devotion += 2;
			} else {
				 if (impregData) { // Sex is already done in servantQuartersReport
					r.push(`routinely requests ${he} present ${his} ${slave.mpreg === 1 ? `ass` : `pussy`} for breeding.`);
					r.push(`${He} <span class="devotion inc">willingly complies,</span>`);
					if (impregData.virginityLoss) {
						r.push(`letting ${S.Stewardess.slaveName} take ${his} <span class="virginity loss">${slave.mpreg === 1 ? `anal virginity` : `virginity`} in the process.</span>`);
					} else {
						const skill = slave.mpreg === 1 ? slave.skill.anal : slave.skill.vaginal;
						r.push(`using ${his} ${slave.mpreg === 1 ? anusDesc(slave) : vaginaDesc(slave)} to ${skill > 60 ? `skillfully` : `enthusiastically`} empty ${S.Stewardess.slaveName}'s balls.`);
					}
					if (impregData.success && slave.pregKnown === 1) {
						r.push(`${He} is now <span class="pregnant">pregnant with ${S.Stewardess.slaveName}'s child.</span>`);
					}
					if (slave.fetish === Fetish.PREGNANCY) {
						r.push(`${He} <span class="devotion inc">loves being full of</span> ${S.Stewardess.slaveName}'s potent seed.`);
						slave.devotion++;
					}
				} else if (hasSex) {
					r.push(`uses <span class="devotion inc">sex as a reward,</span> getting ${him} off when ${he} <span class="cash inc">works harder.</span>`);
					SimpleSexAct.Slaves(S.Stewardess, slave, jsRandom(baseSexCount - 1, baseSexCount + 2));
					slave.need -= (20 + (3 * S.Stewardess.skill.penetrative / 30));
				} else {
					r.push(`<span class="devotion inc">rewards and praises ${him} accordingly,</span> inspiring ${him} to <span class="cash inc">work ${his} hardest.</span>`);
				}
				slave.devotion++;
			}
			// Portion that calculates upkeep reduction, we call it income
			if (!(canHear(slave))) {
				r.push(`However, ${his} inability to hear often leaves ${him} oblivious to ${S.Stewardess.slaveName}'s orders, limiting their meaningful interactions.`);
				cash = stewardessBonus / 4 * healthPenalty(slave);
			} else if ((slave.hears === -1 && slave.earwear !== "hearing aids") || (slave.hears === 0 && slave.earwear === "muffling ear plugs")) {
				r.push(`However, ${he} often doesn't catch what ${S.Stewardess.slaveName} says, leading to frustration, confusion and less work done.`);
				cash = stewardessBonus / 2 * healthPenalty(slave);
			} else {
				cash = stewardessBonus * healthPenalty(slave);
			}
			if (slave.assignment === window.Job.HOUSE) {
				cashX(cash, "slaveAssignmentHouse", slave);
			} else if (slave.assignment === window.Job.QUARTER) {
				cashX(cash, "slaveAssignmentQuarter", slave);
			} else {
				cashX(cash, "serving income in an unregistered building", slave);
			}
		}
	}

	/**
	 * @param {FC.SlaveState} slave
	 *
	 */
	function jobReaction(slave) {
		r.push(`${He} is`);
		if (slave.trust < -20) {
			r.push(`frightened of punishment and works very hard, <span class="cash inc">reducing the upkeep</span> of your slaves.`);
		} else if (slave.devotion < -20) {
			if (slave.trust >= 20) {
				r.push(`uninterested in doing such work and barely lifts a finger to <span class="cash inc">reduce the upkeep</span> of your slaves.`);
			} else {
				r.push(`reluctant, requiring your other slaves to force ${his} services, and does not <span class="cash inc">reduce upkeep</span> of your slaves much.`);
			}
		} else if (slave.devotion <= 20) {
			r.push(`hesitant, requiring your other slaves to demand ${his} services, and only slightly <span class="cash inc">reduces upkeep</span> of your slaves.`);
		} else if (slave.devotion <= 50) {
			r.push(`obedient, offering your other slaves ${his} services, and moderately <span class="cash inc">reduces the upkeep</span> of your slaves.`);
		} else if (slave.devotion <= 95) {
			r.push(`devoted, happily giving your other slaves ${his} services, and <span class="cash inc">reduces the upkeep</span> of your slaves.`);
		} else {
			r.push(`so happy to serve your other slaves that ${he} often sees to their needs before they know they have them, and greatly <span class="cash inc">reduces the upkeep</span> of your slaves.`);
		}

		if (App.SlaveAssignment.PartTime.efficiencyModifier(slave) < 1) {
			r.push(`Some time of ${his} day is taken up by ${his} part-time job, <span class="cash dec">reducing</span> the time spent cleaning.`);
		}
	}

	/**
	 * @param {FC.SlaveState} slave
	 */
	function doOralUse(slave) {
		// TODO: this flat unchecked oral sex is a bit problematic
		// who is she serving and why aren't they benefiting?
		// is the current number of servants correct to accomplish this task?
		// why can't the player prevent this on-assignment sex while still getting the other benefits of having a servant?
		let oralUse = jsRandom(5, 10);
		if (V.policies.gumjobFetishism === 1) {
			if (slave.teeth !== "removable") {
				oralUse = Math.trunc(oralUse / 2);
			} else {
				oralUse = Math.trunc(oralUse * 1.5);
			}
		}
		oralUse = Math.ceil(oralUse * restEffects(slave, 11));
		actX(slave, "oral", oralUse);
	}

	/**
	 * @param {FC.SlaveState} slave
	 */
	function jobEffects(slave) {
		doOralUse(slave);

		if (slave.relationship === -2) {
			r.push(`${He} does ${his} best to perfect your domesticity due to ${his} emotional bond to you.`);
		} else if (slave.relationship === -3 && slave.devotion > 50) {
			r.push(`${He} does ${his} very best to be the perfect house${wife}, making ${him} an outstanding servant.`);
		}

		if (App.Data.Careers.General.servant.includes(slave.career)) {
			r.push(`${He} has experience with house keeping from ${his} life before ${he} was a slave, making ${him} more effective.`);
		} else if (slave.skill.servant >= Constant.MASTERED_XP) {
			r.push(`${He} has experience with house keeping from working for you, making ${him} more effective.`);
		} else {
			slave.skill.servant += jsRandom(1, Math.ceil((slave.intelligence + slave.intelligenceImplant) / 15) + 8);
		}

		if (slave.fetishStrength > 60) {
			if (slave.fetish === Fetish.SUBMISSIVE && slave.fetishKnown === 1) {
				r.push(`${His} natural affinity for submission increases ${his} effectiveness.`);
			} else if (slave.fetishKnown === 1 && slave.fetish === Fetish.DOM) {
				r.push(`${His} sexual appetite for domination reduces ${his} effectiveness.`);
			}
		}

		if (slave.energy < 20) {
			r.push(`${His} frigidity allows ${him} to ignore the intercourse all around ${him}, making ${him} very efficient.`);
		} else if (slave.energy < 40) {
			r.push(`${His} low sex drive keeps ${him} from becoming too distracted by the intercourse all around ${him}, making ${him} more efficient.`);
		}

		if (!canSeePerfectly(slave)) {
			r.push(`${His} bad vision makes ${him} a worse servant.`);
		}

		if (slave.lactation > 0) {
			r.push(`Since ${he} is lactating,`);
			if (slave.devotion > 20 || slave.trust < -20) {
				r.push(`${he} serves`);
			} else {
				r.push(`and disobedient, ${he} is restrained to serve`);
			}
			r.push(`as a drink dispenser at mealtimes, and makes a meaningful contribution to ${his} fellow slaves' nutrition in concert with the feeding systems.`);
			slave.lactationDuration = 2;
			if (slave.boobsMilk > 0) {
				slave.boobs -= slave.boobsMilk;
				slave.boobsMilk = 0;
			}
		}

		if (App.Entity.facilities.servantsQuarters.upgrade('monitoring')) {
			r.push(`The enhanced monitoring systems ensures ${he} is always busy and working, improving ${his} effectiveness.`);
			if (slave.fetish !== Fetish.MINDBROKEN && slave.devotion < 20 && jsRandom(0, 3) === 1) {
				if (isHorny(slave) && jsRandom(0, 1) === 1) {
					r.push(`Unable to control ${his} libido, ${slave.slaveName} is caught desperately dry humping a bed ${he} should be making;`);
				} else {
					r.push(`A camera catches ${him} slacking off and skipping out on assigned work;`);
				}
				r.push(`${S.Stewardess ? S.Stewardess.slaveName : V.assistant.name} is immediately informed to punish ${him} appropriately, <span class="devotion inc">increasing ${his} obedience.</span>`);
				slave.devotion += S.Stewardess ? 3 : 2;
				if (slave.trust > -30) {
					r.push(`Realizing ${he} is always being watched <span class="trust dec">increases ${his} fear of you.</span>`);
					slave.trust -= 2;
				}
			}
		}
	}

	/**
	 * @param {FC.ReportSlave} slave
	 */
	function physicalEffects(slave) {
		if (slave.health.illness > 0 || slave.health.tired > 60) {
			r.push(`${He} is<span class="health dec">`);
			if (slave.health.tired > 60) {
				if (slave.health.illness === 1) {
					r.push(`feeling under the weather and`);
				} else if (slave.health.illness === 2) {
					r.push(`somewhat ill and`);
				} else if (slave.health.illness === 3) {
					r.push(`sick and`);
				} else if (slave.health.illness === 4) {
					r.push(`very sick and`);
				} else if (slave.health.illness === 5) {
					r.push(`terribly ill and`);
				}
			} else {
				if (slave.health.illness === 1) {
					r.push(`feeling under the weather,`);
				} else if (slave.health.illness === 2) {
					r.push(`somewhat ill,`);
				} else if (slave.health.illness === 3) {
					r.push(`sick,`);
				} else if (slave.health.illness === 4) {
					r.push(`very sick,`);
				} else if (slave.health.illness === 5) {
					r.push(`terribly ill,`);
				}
			}
			if (slave.health.tired > 90) {
				r.push(`exhausted,`);
			} else if (slave.health.tired > 60) {
				r.push(`fatigued,`);
			}
			r.push(`</span> limiting ${his} effectiveness.`);
		}
		if (slave.assignment === window.Job.QUARTER) {
			if (slaveResting(slave)) {
				r.push(`${He} is assigned easy tasks <span class="health inc">so ${he} may rest</span> while still being productive.`);
			} else if (slave.health.tired + 11 >= 90 && !willWorkToDeath(slave)) {
				r.push(`${He} attempts to refuse to work due to ${his} exhaustion, but can do little to avoid it or the resulting`);
				if (S.Stewardess) {
					r.push(`<span class="trust dec">severe punishment</span> by ${S.Stewardess.slaveName}. ${His} slacking is kept in check by your watchful Stewardess keeping ${him} on task, but by the end of ${his} shift, <span class="devotion dec">${his} thoughts are made clear in the poor job ${he} did.</span>`);
				} else {
					r.push(`<span class="trust dec">severe punishment.</span> ${He} <span class="devotion dec">accomplishes little,</span> having chosen ${his} overall well-being over the consequences.`);
				}
				slave.devotion -= 10;
				slave.trust -= 5;
			} else {
				r.push(`${His} days are long, but not overly exhausting;`);
				if (slave.devotion > 20) {
					r.push(`there's plenty of opportunities for ${him} to relax, be it drifting into a meditative trance while cleaning or even just taking a seat while folding sheets.`);
				} else {
					r.push(`<span class="health dec">${he}'d find ${himself} less tired</span> if ${he} simply could only learn to lose ${himself} in ${his} work.`);
				}
			}
			tired(slave);
		} else if (slave.assignment === window.Job.HOUSE) {
			if (slaveResting(slave)) {
				r.push(`${He} is assigned easy tasks <span class="health inc">so ${he} may rest</span> while still being productive.`);
			} else if (slave.health.tired + 11 >= 90 && !willWorkToDeath(slave)) {
				r.push(`${He} attempts to refuse to work due to ${his} exhaustion, but can do little to avoid it or the resulting`);
				if (App.Entity.facilities.servantsQuarters.established && V.universalRulesFacilityWork === 1 && App.Entity.facilities.servantsQuarters.hasFreeSpace && S.Stewardess) {
					r.push(`<span class="trust dec">severe punishment</span> by ${S.Stewardess.slaveName}. ${His} slacking is kept in check by your watchful Stewardess keeping ${him} on task, but by the end of ${his} shift, <span class="devotion dec">${his} thoughts are made clear in the poor job ${he} did.</span>`);
				} else {
					r.push(`<span class="trust dec">severe punishment.</span> ${He} <span class="devotion dec">accomplishes little,</span> having chosen ${his} overall well-being over the consequences.`);
				}
				slave.devotion -= 10;
				slave.trust -= 5;
			} else {
				r.push(`${His} days are long, but not overly exhausting;`);
				if (slave.devotion > 20) {
					r.push(`there's plenty of opportunities for ${him} to relax, be it drifting into a meditative trance while cleaning or even just taking a seat while folding sheets.`);
				} else {
					r.push(`<span class="health dec">${he}'d find ${himself} less tired</span> if ${he} simply could only learn to lose ${himself} in ${his} work.`);
				}
			}
			tired(slave);
		}
	}

	/**
	 * @param {FC.SlaveState} slave
	 */
	function assignmentVignette(slave) {
		const vignette = GetVignette(slave);
		r.push(`<span class="story-label">This week</span> ${vignette.text}`);
		if (vignette.type === "cash") {
			let modifier = FResult(slave);
			const cashVign = Math.trunc(modifier * vignette.effect);
			if (vignette.effect > 0) {
				r.push(`<span class="cash inc">making you an extra ${cashFormat(cashVign)}.</span>`);
			} else if (vignette.effect < 0) {
				r.push(`<span class="cash dec">losing you ${cashFormat(Math.abs(cashVign))}.</span>`);
			} else {
				r.push(`an incident without lasting effect.`);
			}
			if (slave.assignment === window.Job.HOUSE) {
				if (vignette.effect > 0) {
					cashX(cashVign, "slaveAssignmentHouseVign", slave);
				} else if (vignette.effect < 0) {
					cashX(forceNeg(cashVign), "slaveAssignmentHouseVign", slave);
				}
			} else if (slave.assignment === window.Job.QUARTER) {
				if (vignette.effect > 0) {
					cashX(cashVign, "slaveAssignmentQuarterVign", slave);
				} else if (vignette.effect < 0) {
					cashX(forceNeg(cashVign), "slaveAssignmentQuarterVign", slave);
				}
			} else {
				if (vignette.effect > 0) {
					cashX(cashVign, "vignette serving income in an unregistered building", slave);
				} else if (vignette.effect < 0) {
					cashX(forceNeg(cashVign), "vignette serving expense in an unregistered building", slave);
				}
			}
		} else if (vignette.type === "devotion") {
			if (vignette.effect > 0) {
				if (slave.devotion > 50) {
					r.push(`<span class="devotion inc">increasing ${his} devotion to you.</span>`);
				} else if (slave.devotion >= -20) {
					r.push(`<span class="devotion inc">increasing ${his} acceptance of you.</span>`);
				} else if (slave.devotion > -10) {
					r.push(`<span class="devotion inc">reducing ${his} dislike of you.</span>`);
				} else {
					r.push(`<span class="devotion inc">reducing ${his} hatred of you.</span>`);
				}
			} else if (vignette.effect < 0) {
				if (slave.devotion > 50) {
					r.push(`<span class="devotion dec">reducing ${his} devotion to you.</span>`);
				} else if (slave.devotion >= -20) {
					r.push(`<span class="devotion dec">reducing ${his} acceptance of you.</span>`);
				} else if (slave.devotion > -10) {
					r.push(`<span class="devotion dec">increasing ${his} dislike of you.</span>`);
				} else {
					r.push(`<span class="devotion dec">increasing ${his} hatred of you.</span>`);
				}
			} else {
				r.push(`an incident without lasting effect.`);
			}
			slave.devotion += vignette.effect;
		} else if (vignette.type === "trust") {
			if (vignette.effect > 0) {
				if (slave.trust > 20) {
					r.push(`<span class="trust inc">increasing ${his} trust in you.</span>`);
				} else if (slave.trust > -10) {
					r.push(`<span class="trust inc">reducing ${his} fear of you.</span>`);
				} else {
					r.push(`<span class="trust inc">reducing ${his} terror of you.</span>`);
				}
			} else if (vignette.effect < 0) {
				if (slave.trust > 20) {
					r.push(`<span class="trust dec">reducing ${his} trust in you.</span>`);
				} else if (slave.trust >= -20) {
					r.push(`<span class="trust dec">increasing ${his} fear of you.</span>`);
				} else {
					r.push(`<span class="trust dec">increasing ${his} terror of you.</span>`);
				}
			} else {
				r.push(`an incident without lasting effect.`);
			}
			slave.trust += vignette.effect;
		} else if (vignette.type === "health") {
			if (vignette.effect > 0) {
				r.push(`<span class="health inc">improving ${his} health.</span>`);
			} else if (vignette.effect < 0) {
				r.push(`<span class="health dec">affecting ${his} health.</span>`);
			} else {
				r.push(`an incident without lasting effect.`);
			}
			improveCondition(slave, 2 * vignette.effect);
		} else {
			let modifier = FResult(slave);
			if (vignette.effect > 0) {
				r.push(`<span class="reputation inc">gaining you a bit of reputation.</span>`);
			} else if (vignette.effect < 0) {
				r.push(`<span class="reputation dec">losing you a bit of reputation.</span>`);
			} else {
				r.push(`an incident without lasting effect.`);
			}
			repX((modifier * vignette.effect * 0.1), "vignette", slave);
		}
	}
};
