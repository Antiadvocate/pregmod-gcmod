App.EndWeek.nextWeek = function() {
	V.HackingSkillMultiplier = upgradeMultiplier('hacking');
	V.upgradeMultiplierArcology = upgradeMultiplier('engineering');
	V.upgradeMultiplierMedicine = upgradeMultiplier('medicine');
	V.upgradeMultiplierTrade = upgradeMultiplier('trading');

	const rival = V.arcologies.find(s => s.direction !== 0 && s.rival === 1);
	if (rival && V.rival.prosperity !== 0) {
		V.rival.prosperity = rival.prosperity;
	} else if (!rival) {
		if (getSlaves().filter(s => s.newGamePlus === 0 && s.origin.includes("$He was once an arcology owner like yourself.")).size > 0) {
			V.rival.state = 5;
		} else if (V.plot > 0 && V.rival.prosperity > 0) {
			if (V.arcologies.length > 1) {
				V.rival.state = 2;
			} else if (V.arcologies.length === 1) {
				V.rival.state = 1;
			}
		} else {
			V.rival.state = 4;
		}
	}

	if (V.playerAging !== 0) {
		V.PC.birthWeek += 1;
		if (V.PC.birthWeek >= 52) {
			V.PC.birthWeek = 0;
			if (V.playerAging === 2) {
				V.PC.physicalAge++;
				V.PC.actualAge++;
				if (V.PC.geneMods.NCS === 1 || (V.PC.geneticQuirks.neoteny >= 2 && V.PC.geneticQuirks.progeria !== 2)) {
					/* Induced NCS completely takes over visual aging. Additionally, because of the neoteny aspects of NCS, ovaries don't age quite as fast. */
					/* Unsurprisingly, actual neoteny has the same effect as long as progeria isn't in play. */
					V.PC.ovaryAge += either(0.5, 0.6, 0.7, 0.7, 0.8, 0.9, 1.0);
				} else {
					V.PC.visualAge++;
					V.PC.ovaryAge += either(0.8, 0.9, 0.9, 1.0, 1.0, 1.0, 1.1);
				}
				if (V.PC.physicalAge <= 20 && V.loliGrow > 0) {
					App.EndWeek.Shared.physicalDevelopment(V.PC, true);
				}
				if ((V.PC.ovaries > 0 || V.PC.mpreg > 0) && V.PC.ovaryAge < 0) {
					V.PC.ovaryAge = -100; // once PC can have immortal ovaries, this is where it takes effect
				}
				agePCEffects();
			}
		}
	}
	if (V.PC.geneMods.progenitor === 1 && canGetPregnant(V.PC)) { // Progenitor mod causes ovarian burnout if not put to use.
		if (V.PC.geneticQuirks.superfetation === 2 && V.PC.womb.length > 0) {
			V.PC.ovaryAge += 0.1;
		} else {
			V.PC.ovaryAge += 0.4;
		}
	}
	if (V.PC.majorInjury > 0) {
		V.PC.majorInjury--;
	}
	if (V.PC.induceLactation > 0) {
		V.PC.induceLactation--;
	}
	if (V.PC.lactation === 1) {
		if (V.PC.lactationDuration === 1) {
			let boobsMilkIntegrityPC = 0;
			if (V.PC.boobsMilk > 0) {
				boobsMilkIntegrityPC = V.PC.boobsMilk;
				V.PC.boobs -= V.PC.boobsMilk;
				V.PC.boobsMilk = 0;
			}
			// V.PC.boobsMilk = Math.round(10 * V.PC.lactationAdaptation);
			// V.PC.boobsMilk = milkAmount(V.PC) * 20;
			V.PC.boobsMilk = milkAmount(V.PC) * Math.max((V.PC.lactationAdaptation / 10), 1);
			V.PC.boobsMilk += boobsMilkIntegrityPC;
			V.PC.boobsMilk = Math.round(V.PC.boobsMilk / 10) * 10;
			V.PC.boobs += V.PC.boobsMilk;
		}
	}
	if (V.menstruation === 1) {
		if (V.PC.preg < -1 || (!V.PC.ovaries && !V.PC.mpreg) || V.PC.pubertyXX === 0 || V.PC.ovaryAge >= 47) {
			// Handle sterility. Contraceptives will still continue the cycle.
			V.PC.fertPeak = 1;
		} else if (V.PC.geneticQuirks.superfetation === 2) {
			if (V.PC.womb.length > 0) {
				if (V.PC.fertPeak === 0) {
					V.PC.fertPeak = 1;
				}
				V.PC.fertPeak--;
			} else {
				V.PC.fertPeak = 0;
			}
		} else if (V.PC.pregWeek < 0 || V.PC.preg > 0) {
			V.PC.fertPeak = 2;
		} else {
			if (V.PC.fertPeak === 0) {
				// Assume a standard 4 week cycle (safe - period - safe - risky)
				V.PC.fertPeak += V.PC.geneMods.progenitor === 1 ? 0 : 3;
				V.PC.fertLate--;
			} else if (V.PC.fertPeak > 2) {
				if (V.menstruationKnown > 0 && random(1, 100) > 95) {
					// late period trolling
					V.PC.fertPeak += 1;
				}
				V.PC.fertPeak--;
				V.PC.fertLate--;
			} else if (isMenstruating(V.PC)) {
				// period
				V.PC.fertPeak--;
				V.PC.fertLate = 3;
				V.PC.fertKnown = 1;
			} else if (V.PC.fertPeak > 0) {
				V.PC.fertPeak--;
				V.PC.fertLate--;
			} else if (V.PC.fertPeak < 0) {
				// This logics lets you go into the negatives. This allows multiple risky weeks in a row.
				V.PC.fertPeak++;
			}
			if (V.PC.geneMods.progenitor) {
				V.PC.fertKnown = 1;
				V.PC.fertLate = 0;
			}
		}
		if (V.PC.pregKnown) {
			V.PC.fertKnown = 1;
		}
	} else if (V.PC.geneticQuirks.superfetation === 2 && V.PC.womb.length > 0) {
		if (V.PC.fertPeak === 0) {
			V.PC.fertPeak = 1;
		}
		V.PC.fertPeak--;
	} else if (V.PC.fertPeak !== 0) {
		V.PC.fertPeak = 0;
	}
	if (V.policies.contraceptivesBan && V.PC.preg === -1) {
		V.PC.preg = 0;
	}
	/* irregular leptin production weight gain/loss setter */
	if (V.PC.geneticQuirks.wGain === 2 && V.PC.geneticQuirks.wLoss === 2) {
		V.PC.weightDirection = either(-1, 1);
	} else if (V.PC.geneticQuirks.wLoss === 2) {
		V.PC.weightDirection = -1;
	} else if (V.PC.geneticQuirks.wGain === 2 || V.PC.geneMods.livestock === 1) {
		V.PC.weightDirection = 1;
	} else {
		V.PC.weightDirection = 0;
	}

	// Adding random changes to the economy
	if (V.difficultySwitch === 1) {
		const globalEconSeed = random(1, 100);
		if (globalEconSeed > 98) {
			V.economy += 2;
		} else if (globalEconSeed > 85) {
			V.economy += 1;
		} else if (globalEconSeed <= 2) {
			V.economy -= 2;
		} else if (globalEconSeed <= 25 + V.econRate * 10) {
			V.economy -= 1;
		}
		if (V.economy < 20) {
			V.economy = 20;
		}
		const localEconSeed = random(1, 100);
		if (V.localEcon <= (V.economy + V.econAdvantage)) {
			if (localEconSeed > 95) {
				V.localEcon += 2;
			} else if (localEconSeed > 50) {
				V.localEcon += 1;
			} else if (localEconSeed <= 1) {
				V.localEcon -= 2;
			} else if (localEconSeed <= 10) {
				V.localEcon -= 1;
			}
		} else if (V.localEcon <= (V.economy + V.econAdvantage + 5)) {
			if (localEconSeed > 98) {
				V.localEcon += 2;
			} else if (localEconSeed > 66) {
				V.localEcon += 1;
			} else if (localEconSeed <= 2) {
				V.localEcon -= 2;
			} else if (localEconSeed <= 33) {
				V.localEcon -= 1;
			}
		} else if (localEconSeed > 99) {
			V.localEcon += 2;
		} else if (localEconSeed > 90) {
			V.localEcon += 1;
		} else if (localEconSeed <= 5) {
			V.localEcon -= 2;
		} else if (localEconSeed <= 50) {
			V.localEcon -= 1;
		}
		if (V.localEcon < 20) {
			V.localEcon = 20;
		}

		if (V.localEcon > 100) {
			V.mods.food.cost = Math.max(5 / (1 + (Math.trunc(1000 - 100000 / V.localEcon) / 10) / 100), 3.125);
		} else if (V.localEcon === 100) {
			V.mods.food.cost = 5;
		} else {
			V.mods.food.cost = Math.min(5 * (1 + 1.5 * Math.sqrt(Math.trunc(100000 / V.localEcon - 1000) / 10) / 100), 6.5);
		}
		V.drugsCost = Math.trunc(10000 / V.localEcon);
		if (V.dispensaryUpgrade) {
			V.drugsCost *= 0.5;
		} else if (V.dispensary) {
			V.drugsCost *= 0.75;
		}
		V.rulesCost = Math.trunc(10000 / V.localEcon);
		V.modCost = Math.trunc(5000 / V.localEcon);
		V.surgeryCost = Math.trunc(30000 / (V.localEcon * ((V.PC.career === "medicine" || V.PC.career === "medical assistant" || V.PC.career === "nurse") ? 2 : 1)));
	}

	V.arcologies[0].prosperity = Math.clamp(V.arcologies[0].prosperity, 1, V.AProsperityCap);

	V.averageTrust = 0;
	V.averageDevotion = 0;
	let slavesContributing = 0;
	let oldHG = -1;
	let newHG = -1;
	if (V.studio === 1) {
		for (const genre of App.Porn.getAllGenres()) {
			V.pornStars[genre.fameVar].p1count = 0;
		}
	}
	for (const slave of getSlaves().values()) {
		ageSlaveWeeks(slave);
		if (slave.indenture > 0) {
			slave.indenture -= 1;
		}
		if (slave.induceLactation > 0) {
			slave.induceLactation--;
		}
		if (slave.lactation === 1) {
			if (slave.lactationDuration === 1) {
				let boobsMilkIntegrity = 0;
				if (slave.boobsMilk > 0) {
					boobsMilkIntegrity = slave.boobsMilk;
					slave.boobs -= slave.boobsMilk;
					slave.boobsMilk = 0;
				}
				// slave.boobsMilk = Math.round(10 * slave.lactationAdaptation);
				// slave.boobsMilk = milkAmount(slave) * 20;
				slave.boobsMilk = milkAmount(slave) * Math.max((slave.lactationAdaptation / 10), 1);
				slave.boobsMilk += boobsMilkIntegrity;
				slave.boobsMilk = Math.round(slave.boobsMilk / 10) * 10;
				slave.boobs += slave.boobsMilk;
			}
		}
		if (V.menstruation === 1) {
			if (slave.preg < -1 || (!slave.ovaries && !slave.mpreg) || slave.pubertyXX === 0 || slave.ovaryAge >= 47) {
				// Handle sterility. Contraceptives will still continue the cycle.
				slave.fertPeak = 1;
			} else if (slave.geneticQuirks.superfetation === 2) {
				// Handle Superfetation
				if (slave.womb.length > 0) {
					if (slave.fertPeak === 0) {
						slave.fertPeak = 1;
					}
					slave.fertPeak--;
				} else {
					slave.fertPeak = 0;
				}
			} else if (slave.pregWeek < 0 || slave.preg > 0) {
				slave.fertPeak = 2;
			} else {
				if (slave.fertPeak === 0) {
					// Assume a standard 4 week cycle (safe - period - safe - risky)
					slave.fertPeak += slave.geneMods.progenitor === 1 ? 0 : 3;
					slave.fertLate--;
				} else if (slave.fertPeak > 2) {
					if (V.menstruationKnown > 0 && random(1, 100) > 95) {
						// late period trolling
						slave.fertPeak += 1;
					}
					slave.fertPeak--;
					slave.fertLate--;
				} else if (isMenstruating(slave)) {
					// period
					slave.fertPeak--;
					slave.fertLate = 3;
					slave.fertKnown = 1;
				} else if (slave.fertPeak > 0) {
					slave.fertPeak--;
					slave.fertLate--;
				} else if (slave.fertPeak < 0) {
					// This logics lets you go into the negatives. This allows multiple risky weeks in a row.
					slave.fertPeak++;
				}
				if (slave.geneMods.progenitor) {
					slave.fertKnown = 1;
					slave.fertLate = 0;
				}
			}
			if (slave.pregKnown) {
				slave.fertKnown = 1;
			}
		} else if (slave.geneticQuirks.superfetation === 2 && slave.womb.length > 0) {
			if (slave.fertPeak === 0) {
				slave.fertPeak = 1;
			}
			slave.fertPeak--;
		} else if (slave.fertPeak !== 0) {
			slave.fertPeak = 0;
		}
		if (V.policies.contraceptivesBan && slave.preg === -1) {
			slave.preg = 0;
		}
		slave.trust = Number(slave.trust.toFixed(1));
		slave.devotion = Number(slave.devotion.toFixed(1));
		slave.oldDevotion = slave.devotion;
		slave.oldTrust = slave.trust;
		slave.minorInjury = 0;
		if (slave.sentence > 1) {
			slave.sentence -= 1;
		} else if (slave.sentence === 1) {
			removeJob(slave, slave.assignment);
		}
		if (slave.relationship === 0) {
			slave.relationshipTarget = 0;
		}
		if (slave.rivalry === 0) {
			slave.rivalryTarget = 0;
		} else if (slave.rivalry < 0) {
			slave.rivalryTarget = 0;
			slave.rivalry = 0;
		}
		if (slave.vagina < 0) {
			slave.vaginalAccessory = "none";
			slave.chastityVagina = 0;
			if (slave.piercing) {
				slave.piercing.vagina.weight = 0;
			}
		}
		if (slave.dick === 0) {
			slave.dickAccessory = "none";
			slave.chastityPenis = 0;
			slave.dickTat = 0;
			if (slave.piercing) {
				slave.piercing.dick.weight = 0;
			}
		}
		if (!hasAnyArms(slave)) {
			slave.armsTat = 0;
			slave.nails = 0;
			slave.armAccessory = "none";
		}
		if (!hasAnyLegs(slave)) {
			slave.heels = 0;
			slave.shoes = "none";
			slave.legAccessory = "none";
			slave.legsTat = 0;
		}
		/* irregular leptin production weight gain/loss setter */
		if (slave.geneticQuirks.wGain === 2 && slave.geneticQuirks.wLoss === 2) {
			slave.weightDirection = either(-1, 1);
		} else if (slave.geneticQuirks.wLoss === 2) {
			slave.weightDirection = -1;
		} else if (slave.geneticQuirks.wGain === 2 || slave.geneMods.livestock === 1) {
			slave.weightDirection = 1;
		} else {
			slave.weightDirection = 0;
		}
		/* Fix some possible floating point rounding errors, and bring precision to one decimal place. */
		V.PC.energy = Math.clamp(V.PC.energy.toFixed(1), 0, 100);
		SlaveStatClamp(slave);
		slave.energy = Math.clamp(slave.energy.toFixed(1), 0, 100);
		slave.attrXY = Math.clamp(slave.attrXY.toFixed(1), 0, 100);
		slave.attrXX = Math.clamp(slave.attrXX.toFixed(1), 0, 100);
		if (slave.fetishStrength > 95) {
			slave.fetishStrength = 100;
		} else {
			slave.fetishStrength = Math.clamp(slave.fetishStrength.toFixed(1), 0, 100);
		}
		slave.weight = Math.clamp(slave.weight.toFixed(1), -100, 200);
		slave.butt = Number(slave.butt.toFixed(1));
		slave.muscles = Math.clamp(slave.muscles.toFixed(1), -100, 100);
		slave.face = Math.clamp(slave.face.toFixed(1), -100, 100);
		slave.lips = Math.clamp(slave.lips.toFixed(1), 0, 100);
		slave.skill.oral = Math.clamp(slave.skill.oral.toFixed(1), 0, 100);
		slave.skill.vaginal = Math.clamp(slave.skill.vaginal.toFixed(1), 0, 100);
		slave.skill.penetrative = Math.clamp(slave.skill.penetrative.toFixed(1), 0, 100);
		slave.skill.anal = Math.clamp(slave.skill.anal.toFixed(1), 0, 100);
		slave.skill.whoring = Math.clamp(slave.skill.whoring.toFixed(1), 0, 100);
		slave.skill.entertainment = Math.clamp(slave.skill.entertainment.toFixed(1), 0, 100);
		slave.skill.combat = Math.clamp(slave.skill.combat.toFixed(1), 0, 100);
		slave.lactationAdaptation = Math.clamp(slave.lactationAdaptation.toFixed(1), 0, 200);
		slave.intelligenceImplant = Math.clamp(slave.intelligenceImplant.toFixed(1), -15, 30);
		slave.prematureBirth = 0;
		if (V.HGSuiteEquality === 1 && V.HeadGirlID !== 0 && slave.devotion > 50) {
			if (slave.assignment === Job.HEADGIRLSUITE) {
				newHG = slave.ID;
			} else if (slave.ID === V.HeadGirlID) {
				oldHG = slave.ID;
			}
		}
		/* AVERAGE VALUES UPDATE */
		if (assignmentVisible(slave)) {
			V.averageTrust += slave.trust;
			V.averageDevotion += slave.devotion;
			slavesContributing++;
		} else if (
			![Job.CELLBLOCK, Job.ARCADE, Job.BABY_FACTORY].includes(slave.assignment) &&
			(slave.assignment !== Job.DAIRY || V.dairyRestraintsSetting < 2)
		) {
			V.averageTrust += slave.trust * 0.5;
			V.averageDevotion += slave.devotion * 0.5;
			slavesContributing += 0.5;
		}
		if (V.studio === 1) {
			const activeGenres = App.Porn.getAllGenres().filter((g) => slave.porn.fame[g.fameVar] > 0);
			for (const genre of activeGenres) {
				V.pornStars[genre.fameVar].p1count++;
			}
		}
		if (slave.choosesOwnAssignment > 0) {
			assignJob(slave, Job.CHOICE);
		}
	}
	if (slavesContributing !== 0) {
		V.averageTrust = V.averageTrust / slavesContributing;
		V.averageDevotion = V.averageDevotion / slavesContributing;
	}
	V.enduringTrust = (V.averageTrust + (V.enduringTrust * 3)) / 4;
	V.enduringDevotion = (V.averageDevotion + (V.enduringDevotion * 3)) / 4;

	if (oldHG !== -1 && newHG !== -1) {
		// preserve time in grade during HG swaps
		const oldTimeInGrade = V.HGTimeInGrade;
		removeJob(getSlave(newHG), Job.HEADGIRLSUITE);
		assignJob(getSlave(oldHG), Job.HEADGIRLSUITE);
		assignJob(getSlave(newHG), Job.HEADGIRL);
		getSlave(newHG).diet = Diet.HEALTHY;
		V.HGTimeInGrade = oldTimeInGrade;
	}

	if (V.PC.refreshment.includes("fertility")) {
		V.PC.forcedFertDrugs = Math.max(+V.PC.forcedFertDrugs, 1);
	} else if (V.PC.forcedFertDrugs > 0) {
		V.PC.forcedFertDrugs--;
	}

	if (V.FCTV.receiver > 0) {
		if (V.FCTV.pcViewership.frequency !== -1) {
			// Count down to 0 for a show
			V.FCTV.pcViewership.count = Math.max((V.FCTV.pcViewership.count - 1), 0);
		}
	}

	// resets processed slaves for the pregnancy notice event
	if (V.pregnancyNotice) {
		V.pregnancyNotice.processedSlaves = [];
	}

	V.week++;
	V.arcologies[0].weeks++;

	// Plastic surgeon stuff
	if (V.pSurgery.cooldown > 0) {
		V.pSurgery.cooldown--;
	}
	if (FutureSocieties.isActive('FSRepopulationFocus') || V.pSurgery.nursePreg !== 0) {
		V.pSurgery.nursePreg++;
		if (V.pSurgery.cooldown > 0 && V.pSurgery.nursePreg > 36) {
			V.pSurgery.nursePreg = 0;
		} else if (V.pSurgery.nursePreg > 40) {
			V.pSurgery.nursePreg = -3;
		}
	}

	if (V.doctor.state > 1) {
		V.doctor.state = 1;
	}

	// advance the event queue
	if (V.eventQueue[0] && V.eventQueue[0].length > 0) {
		console.log("These events were queued for this week, but got skipped: ", V.eventQueue[0]);
	}
	V.eventQueue.shift();

	if (V.secExpEnabled > 0) {
		if (V.SecExp.buildings.riotCenter) {
			V.SecExp.buildings.riotCenter.sentUnitCooldown = Math.max(V.SecExp.buildings.riotCenter.sentUnitCooldown - 1, 0);
		}
		V.SecExp.proclamation.cooldown = Math.max(V.SecExp.proclamation.cooldown - 1, 0);
		V.SecExp.war = {};
	}

	App.EndWeek.weather();

	const boomerang = getBoomerang();
	if (boomerang.weeks) {
		boomerang.weeks++;
	} else {
		boomerang.actor = 0;
	}
	const traitor = getTraitor();
	if (traitor.weeks) {
		traitor.weeks++;
	}

	V.thisWeeksFSWares = V.merchantFSWares.randomMany(2);
	V.thisWeeksIllegalWares = V.merchantIllegalWares.randomMany(1);
	V.prisonCircuitIndex++;
	if (V.prisonCircuit[V.prisonCircuitIndex] === "juvenile detention" && (V.minimumSlaveAge >= 16 || V.pedoMode === 1)) {
		V.prisonCircuitIndex++; // skip juvenile detention if juvenile slaves are not allowed, or we're in pedo mode (where all prisoners are juvenile)
	}
	if (V.prisonCircuitIndex >= V.prisonCircuit.length) {
		V.prisonCircuitIndex = 0;
	}

	V.eventControl.RIESkip = [];
	V.eventControl.events = V.eventControl.events.filter(e => e.weeksPassed < V.eventControl.level);
	V.eventControl.events.forEach(e => (e.weeksPassed++));
	V.independenceDay = 1;
	V.coursed = 0;
	V.JFC.reorder = 0;
	V.customSlaveReorder = 0;
	V.prestigeAuctioned = 0;
	V.eliteAuctioned = 0;
	const shelterSlave = getShelterSlave();
	shelterSlave.actor = 0;
	shelterSlave.bought = 0;
	V.slaveMarketLimit = 10 + (V.rep / 1000);
	V.slavesSeen = 0;
	V.slavesSacrificedThisWeek = 0;

	if (V.pit) {
		V.pit.fought = false;
	}

	V.returnTo = "";

	// reset transition object
	App.Utils.resetTransitionObject();

	if (V.autosave !== 0) {
		// @ts-ignore
		Save.browser.auto.save("Week Start Autosave");
	}

	if (V.SF.Toggle && V.SF.FS.Tension > 100) {
		App.Mods.SF.fsIntegration.crisis();
	}
	V.NaNArray = findNaN();

	// regenerate old slave images; the reactive strategy handles this on week end
	if (V.imageChoice === 6 && V.aiAutoGen && V.aiAutoGenFrequency > 0 && V.aiCachingStrategy !== 'reactive') {
		// executing this between DOM loads still picks up the "temporary-images" tag of the event passages, so we'll queue auto regeneration for a DOM to load without the tag. (We're not calling this from the "Main" passage to ensure it isn't over-called by reloading saves)
		(async () => {
			const sleep = () => new Promise(r => setTimeout(r, 100));
			while (isTemporaryImage()) {
				await sleep();
			}
			getSlaves().forEach(s => {
				if ((V.week - s.weekAcquired) % V.aiAutoGenFrequency === 0 && !s.custom.aiAutoRegenExclude){
					App.Art.GenAI.staticCache.updateSlave(s, null, false)
						.catch(error => {
							console.log(error.message || error);
						});
				}
			});
		})();
	}

	function agePCEffects() {
		switch (V.PC.actualAge) {
			case 3:
				V.AgeTrainingLowerBoundPC = 18;
				V.AgeTrainingUpperBoundPC = 20;
				V.AgeEffectOnTrainerPricingPC = .1;
				V.AgeEffectOnTrainerEffectivenessPC = .1;
				break;
			case 4:
				V.AgeTrainingLowerBoundPC = 17;
				V.AgeTrainingUpperBoundPC = 19;
				V.AgeEffectOnTrainerPricingPC = .15;
				V.AgeEffectOnTrainerEffectivenessPC = .15;
				break;
			case 5:
				V.AgeTrainingLowerBoundPC = 16;
				V.AgeTrainingUpperBoundPC = 18;
				V.AgeEffectOnTrainerPricingPC = .35;
				V.AgeEffectOnTrainerEffectivenessPC = .35;
				break;
			case 6:
				V.AgeTrainingLowerBoundPC = 15;
				V.AgeTrainingUpperBoundPC = 17;
				V.AgeEffectOnTrainerPricingPC = .55;
				V.AgeEffectOnTrainerEffectivenessPC = .55;
				break;
			case 7:
				V.AgeTrainingLowerBoundPC = 14;
				V.AgeTrainingUpperBoundPC = 16;
				V.AgeEffectOnTrainerPricingPC = .75;
				V.AgeEffectOnTrainerEffectivenessPC = .75;
				break;
			case 8:
				V.AgeTrainingLowerBoundPC = 13;
				V.AgeTrainingUpperBoundPC = 15;
				V.AgeEffectOnTrainerPricingPC = .85;
				V.AgeEffectOnTrainerEffectivenessPC = .85;
				break;
			case 9:
				V.AgeTrainingLowerBoundPC = 12;
				V.AgeTrainingUpperBoundPC = 14;
				V.AgeEffectOnTrainerPricingPC = 1.00;
				V.AgeEffectOnTrainerEffectivenessPC = 1.00;
				break;
			case 10:
				V.AgeTrainingLowerBoundPC = 11;
				V.AgeTrainingUpperBoundPC = 13;
				V.AgeEffectOnTrainerPricingPC = 1.0005;
				V.AgeEffectOnTrainerEffectivenessPC = 1.0005;
				break;
			case 11:
				V.AgeTrainingLowerBoundPC = 10;
				V.AgeTrainingUpperBoundPC = 12;
				V.AgeEffectOnTrainerPricingPC = 1.01;
				V.AgeEffectOnTrainerEffectivenessPC = 1.01;
				break;
			case 12:
				V.AgeTrainingLowerBoundPC = 9;
				V.AgeTrainingUpperBoundPC = 11;
				V.AgeEffectOnTrainerPricingPC = 1.02;
				V.AgeEffectOnTrainerEffectivenessPC = 1.02;
				break;
			case 13:
				V.AgeTrainingLowerBoundPC = 8;
				V.AgeTrainingUpperBoundPC = 10;
				V.AgeEffectOnTrainerPricingPC = 1.03;
				V.AgeEffectOnTrainerEffectivenessPC = 1.03;
				break;
			case 14:
				V.AgeTrainingLowerBoundPC = 7;
				V.AgeTrainingUpperBoundPC = 9;
				V.AgeEffectOnTrainerPricingPC = 1.04;
				V.AgeEffectOnTrainerEffectivenessPC = 1.04;
				break;
			case 15:
				V.AgeTrainingLowerBoundPC = 6;
				V.AgeTrainingUpperBoundPC = 8;
				V.AgeEffectOnTrainerPricingPC = 1.05;
				V.AgeEffectOnTrainerEffectivenessPC = 1.05;
				break;
			case 16:
				V.AgeTrainingLowerBoundPC = 5;
				V.AgeTrainingUpperBoundPC = 7;
				V.AgeEffectOnTrainerPricingPC = 1.06;
				V.AgeEffectOnTrainerEffectivenessPC = 1.06;
				break;
			case 17:
				V.AgeTrainingLowerBoundPC = 4;
				V.AgeTrainingUpperBoundPC = 6;
				V.AgeEffectOnTrainerPricingPC = 1.07;
				V.AgeEffectOnTrainerEffectivenessPC = 1.07;
				break;
			case 18:
				V.AgeTrainingLowerBoundPC = 3;
				V.AgeTrainingUpperBoundPC = 5;
				V.AgeEffectOnTrainerPricingPC = 1.08;
				V.AgeEffectOnTrainerEffectivenessPC = 1.08;
				break;
		}
	}
};
