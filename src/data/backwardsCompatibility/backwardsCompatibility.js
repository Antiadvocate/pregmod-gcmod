/**
 * All of the code in this file is legacy. Changing it will likely break old saves, as the patching system still uses it.
 *
 * To create a new patch (BC) see the instructions at the top of `/src/data/patches/patch.js`.
 */

// @ts-nocheck this is legacy, all of it's missing/incorrect values where correct when they were implemented. This worked fine with save data structures from release 1258 and before. And saves/new games after 1258 shouldn't be running this code
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable no-lone-blocks */

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {Node} node
 */
App.Update.autoshred = function(node) {
	const defaultGameStateVariables = {
		"nextButton": "Continue",
		"nextLink": "Alpha disclaimer",
		"storedLink": "",
		"ver": "",
		"pmodVer": "",
		"commitHash": "",
		"releaseID": 0,
		"slaveIndices": {},
		"genePool": {},
		"missingTable": {},
		"slaves": [],
		"PC": null,
		"freshPC": 0,
		"IsInPrimePC": 3,
		"IsPastPrimePC": 5000,
		"playerAging": 2,
		"slavePC": 0,
		"saveImported": 0,
		"customVariety": 0,
		"nationalities": {},
		"cheater": 0,
		"cash": 0,
		"cashLastWeek": 0,
		"taintedSaveFile": 0,
		"UI": {
			"slaveSummary": {
				"abbreviation": {
					"clothes": 2,
					"devotion": 2,
					"beauty": 2,
					"diet": 2,
					"drugs": 2,
					"genitalia": 2,
					"health": 2,
					"hormoneBalance": 2,
					"mental": 2,
					"nationality": 2,
					"origins": 2,
					"physicals": 2,
					"race": 2,
					"rules": 2,
					"rulesets": 2,
					"skills": 2
				}
			},
			"compressSocialEffects": 0
		},
		"market": null,
		"FSNamePref": 0,
		"HGFormality": 1,
		"HGSeverity": 0,
		"HGPiercings": 1,
		"abbreviateSidebar": 1,
		"adamPrinciple": 0,
		"allowFamilyTitles": 0,
		"allowMaleSlaveNames": false,
		"autosave": 1,
		"baseDifficulty": 3,
		"dangerousPregnancy": 0,
		"debugMode": 0,
		"debugModeCustomFunction": 0,
		"debugModeEventSelection": 0,
		"difficultySwitch": 0,
		"disableLisping": 0,
		"displayAssignments": 1,
		"expansionRequestsAllowed": 1,
		"extremeUnderage": 0,
		"formatNumbers": 1,
		"fucktoyInteractionsPosition": 1,
		"slaveInteractLongForm": false,
		"slaveInteractHideLabels": false,
		"headGirlSoftensFlaws": 1,
		"headGirlTrainsFlaws": 1,
		"headGirlOverridesQuirks": 0,
		"headGirlTrainsHealth": 1,
		"headGirlTrainsObedience": 1,
		"headGirlTrainsParaphilias": 1,
		"headGirlTrainsSkills": 1,
		"imageChoice": 1,
		"inbreeding": 1,
		"lastBDayEvent": -1,
		"endweekSaveWarning": 1,
		"purchaseStyle": "link",
		"limitFamilies": 0,
		"makeDicks": 0,
		"modRequestsAllowed": 1,
		"neighboringArcologies": 3,
		"neighborDisplay": "list",
		"newDescriptions": 0,
		"newModelUI": 1,
		"ngpParams": {},
		"nicknamesAllowed": 1,
		"positionMainLinks": -1,
		"profiler": 0,
		"realRoyalties": 0,
		"retainCareer": 1,
		"rulesAssistantAuto": 0,
		"rulesAssistantMain": 1,
		"seeAge": 1,
		"seeArcology": 1,
		"seeAvatar": 1,
		"seeBestiality": 0,
		"seeCats": 0,
		"seeCircumcision": 1,
		"seeCustomImagesOnly": 0,
		"seeDesk": 1,
		"seeDetails": 1,
		"seeDicks": 25,
		"seeDicksAffectsPregnancy": 1,
		"seeRandomHair": 1,
		"seeExtreme": 0,
		"seeFaces": 1,
		"seeFCNN": 1,
		"seeHeight": 0,
		"seeHyperPreg": 0,
		"seeIllness": 1,
		"seeImages": 0,
		"seeIncest": 1,
		"seeMainFetishes": 0,
		"seeNationality": 1,
		"seePee": 1,
		"seePreg": 1,
		"seeRace": 1,
		"seeReportImages": 1,
		"seeStretching": 1,
		"seeSummaryImages": 1,
		"seeVectorArtHighlights": 1,
		"setSuperSampling": 2,
		"setZoomSpeed": 1,
		"setPanSpeed": 1,
		"setRotationSpeed": 1,
		"setDefaultView": 1,
		"setAutoFrame": 0,
		"setFaceCulling": true,
		"setTextureResolution": 1024,
		"setShadowMapping": true,
		"setSSAO": true,
		"setSSS": true,
		"setImageSize": 1.25,
		"set3QView": false,
		"seeAnimation": false,
		"animFPS": 12,
		"eventControl": {
			"RIEPerWeek": 1,
			"RIESkip": [],
			"RIERemaining": 0,
			"level": 0,
			"otherTrack": false,
			"events": []
		},
		"aiFaceDetailer": false,
		"aiApiUrl": "http://localhost:7860",
		"aiAutoGen": true,
		"aiAutoGenFrequency": 10,
		"aiUseRAForEvents": false,
		"aiCfgScale": 5,
		"aiTimeoutPerStep": 2.5,
		"aiCachingStrategy": "static",
		"aiCustomImagePrompts": 0,
		"aiCustomStyleNeg": "",
		"aiCustomStylePos": "",
		"aiDynamicCfgEnabled": false,
		"aiDynamicCfgMimic": 6,
		"aiDynamicCfgMinimum": 4,
		"aiLoraPack": true,
		"aiDisabledLoRAs": [],
		"aiNationality": 2,
		"aiGenderHint": 1,
		"aiOpenPose": false,
		"aiOpenPoseModel": "",
		"aiSamplingMethod": "DPM++ 2M SDE Karras",
		"aiSamplingSteps": 20,
		"aiSamplingStepsEvent": 20,
		"aiStyle": 1,
		"aiSchedulingMethod": "karras",
		"aiRestoreFaces": false,
		"aiUpscale": false,
		"aiUpscaleScale": 1.75,
		"aiUpscaler": "SwinIR_4x",
		"aiCheckpoint": "majicmixRealistic_v6.safetensors",
		"aiCustomWorkflow": "",
		"aiUserInterface": 0,
		"aiBaseModel": 0,
		"aiPrebuiltWorkflow": 0,
		"aiPonyTurbo": false,
		"aiPonyLoraStack": "{ \"Styles\\Concept Art DarkSide Style LoRA_Pony XL v6.safetensors\": 0.5, \"Styles\\Digital Art Style SDXL_LoRA_Pony Diffusion V6 XL.safetensors\": 0.2, \"Styles\\Photo 2 Style SDXL_LoRA_Pony Diffusion V6 XL.safetensors\": 0.2 }",
		"aiHeight": 768,
		"aiWidth": 512,
		"aiAgeFilter": true,
		"customClothesPrompts": {},
		"showAgeDetail": 1,
		"showAppraisal": 1,
		"showAssignToScenes": 1,
		"showBodyMods": 1,
		"showBoobCCs": 1,
		"showPotentialSizes": 1,
		"showClothing": 1,
		"showDickCMs": 1,
		"showDistantRelatives": 0,
		"showEWD": 1,
		"showEWM": 1,
		"showEconomicDetails": 0,
		"showHeightCMs": 1,
		"showImplantEffects": 1,
		"showInches": 1,
		"showMissingSlaves": false,
		"racialAttractivenessBonus": 1,
		"showMissingSlavesSD": false,
		"showNeighborDetails": 1,
		"showNumbers": 2,
		"showNumbersMax": 20,
		"showScores": 1,
		"showSexualHistory": 1,
		"showTipsFromEncy": 1,
		"showVignettes": 1,
		"slavePanelStyle": 1,
		"sortSlavesBy": "devotion",
		"sortSlavesMain": 1,
		"sortSlavesOrder": "descending",
		"summaryStats": 0,
		"surnameArcology": "",
		"surnameOrder": 0,
		"surnamePCOverride": 0,
		"surnameScheme": 0,
		"tabChoice": {
			"Main": "all"
		},
		"universalRulesAssignsSelfFacility": 0,
		"universalRulesBirthing": 0,
		"universalRulesCSec": 0,
		"universalRulesChildrenBecomeBreeders": 0,
		"universalRulesConsent": 0,
		"universalRulesFacilityWork": 1,
		"universalRulesImmobileSlavesMaintainMuscles": 0,
		"universalRulesImpregnation": "none",
		"universalRulesSuperfetationImpregnation": 0,
		"universalRulesNewSlavesRA": 1,
		"useAccordion": 1,
		"favSeparateReport": 0,
		"useFSNames": 1,
		"useSlaveListInPageJSNavigation": 0,
		"useSlaveSummaryOverviewTab": 0,
		"useSlaveSummaryTabs": 0,
		"useTabs": 0,
		"verboseDescriptions": 0,
		"verticalizeArcologyLinks": 0,
		"weightAffectsAssets": 1,
		"oversizedBoobShrinkage": 0,
		"maxErectionSizeOption": 0,
		"curativeSideEffects": 1,
		"disableLongDamage": 1,
		"findName": "",
		"findBackground": "",
		"findData": "",
		"underperformersCount": 7,
		"pedoMode": 0,
		"minimumSlaveAge": 16,
		"fertilityAge": 13,
		"potencyAge": 13,
		"AgePenalty": 1,
		"precociousPuberty": 0,
		"loliGrow": 0,
		"retirementAge": 45,
		"customRetirementAge": 45,
		"customMenialRetirementAge": 65,
		"idealAge": 18,
		"targetIdealAge": 18,
		"idealAgeAdoption": 0,
		"sortIncubatorList": "Unsorted",
		"AgeEffectOnTrainerPricingPC": 1,
		"AgeEffectOnTrainerEffectivenessPC": 1,
		"AgeTrainingUpperBoundPC": 14,
		"AgeTrainingLowerBoundPC": 12,
		"childSex": 0,
		"showClothingErection": true,
		"continent": "North America",
		"terrain": "rural",
		"language": "English",
		"AProsperityCapModified": 0,
		"secExpEnabled": 0,
		"customItem": {
			"buttplug": {},
			"vaginalAccessory": {}
		},
		"pregnancyNotice": {
			"enabled": true,
			"accordionCollapsed": -1,
			"nextLockout": false,
			"renderFetus": true,
			"processedSlaves": []
		},
		"donatrix": 0,
		"receptrix": 0,
		"impregnatrix": 0,
		"transplantFetuses": [],
		"mods": {
			"food": {
				"enabled": false,
				"amount": 125000,
				"cost": 25,
				"lastWeek": 125000,
				"market": false,
				"deficit": 0,
				"overstocked": 0,
				"rate": {
					"slave": 8,
					"lower": 14.5,
					"middle": 16,
					"upper": 17.5,
					"top": 19
				},
				"rations": 0,
				"total": 0,
				"warned": false
			}
		}
	};

	const resetOnNGPlus = {
		"policies": {
			"retirement": {
				"sex": 0,
				"milk": 0,
				"cum": 0,
				"births": 0,
				"kills": 0,
				"fate": 0,
				"menial2Citizen": 0,
				"customAgePolicy": 0,
				"physicalAgePolicy": 0
			},
			"SMR": {
				"basicSMR": 1,
				"healthInspectionSMR": 0,
				"educationSMR": 0,
				"frigiditySMR": 0,
				"weightSMR": 0,
				"honestySMR": 0,
				"beauty": {
					"basicSMR": 0,
					"qualitySMR": 0
				},
				"height": {
					"basicSMR": 0,
					"advancedSMR": 0
				},
				"intelligence": {
					"basicSMR": 0,
					"qualitySMR": 0
				},
				"eugenics": {
					"faceSMR": 0,
					"heightSMR": 0,
					"intelligenceSMR": 0
				}
			},
			"childProtectionAct": 1,
			"idealAge": 0,
			"culturalOpenness": 0,
			"proRefugees": 0,
			"publicFuckdolls": 0,
			"proRecruitment": 0,
			"cash4Babies": 0,
			"regularParties": 0,
			"publicPA": 0,
			"coursingAssociation": 0,
			"raidingMercenaries": 0,
			"mixedMarriage": 0,
			"goodImageCampaign": 0,
			"alwaysSubsidizeRep": 0,
			"alwaysSubsidizeGrowth": 0,
			"immigrationCash": 0,
			"immigrationRep": 0,
			"enslavementCash": 0,
			"enslavementRep": 0,
			"cashForRep": 0,
			"oralAppeal": 0,
			"vaginalAppeal": 0,
			"analAppeal": 0,
			"sexualOpenness": 0,
			"bestialityOpenness": 0,
			"gumjobFetishism": 0,
			"gumjobFetishismSMR": 0
		},
		"FCTV": {
			"receiver": -1,
			"channel": {},
			"pcViewership": {
				"count": 0,
				"frequency": 4
			},
			"remote": 0,
			"weekEnabled": 0
		},
		"assistant": null,
		"targetArcology": {
			"fs": "New"
		},
		"plot": 1,
		"plotEventWeek": 0,
		"assignmentRecords": {},
		"marrying": [],
		"organs": [],
		"corp": {
			"Name": "Your corporation",
			"Announced": 0,
			"Incorporated": 0,
			"Market": 0,
			"Econ": 0,
			"CashDividend": 0,
			"Div": 0,
			"ExpandToken": 0,
			"Spec": 0,
			"SpecToken": 0,
			"SpecRaces": [],
			"disableOverhead": 0
		},
		"dividendTimer": 0,
		"dividendRatio": 0,
		"personalShares": 0,
		"publicShares": 0,
		"SF": {},
		"thisWeeksFSWares": 0,
		"thisWeeksIllegalWares": 0,
		"eventQueue": [],
		"eliteAuctioned": 0,
		"slavesSacrificedThisWeek": 0,
		"mercenariesTitle": "",
		"FSReminder": 0,
		"facility": {},
		"boomerangStats": {},
		"econAdvantage": 0,
		"SecExp": {},
		"reminderEntry": "",
		"reminderWeek": "",
		"currentRule": null,
		"costs": 0,
		"seeBuilding": 0,
		"purchasedSagBGone": 0,
		"eliteFail": 0,
		"eliteFailTimer": 0,
		"nurseryGrowthStimsSetting": 0,
		"MadamIgnoresFlaws": 0,
		"MadamNoSex": 0,
		"farmyardBreeding": 0,
		"farmyardRestraints": 0,
		"farmyardShows": 0,
		"farmyardPregSetting": 0,
		"farmyardSlavesAssignThemselves": 0,
		"DJignoresFlaws": 0,
		"DJnoSex": 0,
		"lastWeeksCashIncome": {},
		"lastWeeksCashExpenses": {},
		"lastWeeksRepIncome": {},
		"lastWeeksRepExpenses": {},
		"showAllEntries": {
			"costsBudget": 0,
			"repBudget": 0
		},
		"lastWeeksCashErrors": [],
		"lastWeeksRepErrors": [],
		"econRate": 0,
		"arcologies": [],
		"HackingSkillMultiplier": 0,
		"upgradeMultiplierArcology": 0,
		"upgradeMultiplierMedicine": 0,
		"upgradeMultiplierTrade": 0,
		"JobIDMap": null,
		"averageTrust": 0,
		"averageDevotion": 0,
		"enduringTrust": 0,
		"enduringDevotion": 0,
		"defaultRules": [],
		"rulesToApplyOnce": {},
		"raDefaultMode": 0,
		"raConfirmDelete": 1,
		"addButtonsToSlaveLinks": true,
		"RECheckInIDs": [],
		"deathIDs": {
			"health": [],
			"overdose": [],
			"age": []
		},
		"burstIDs": [],
		"birthIDs": [],
		"induceIDs": [],
		"activeSlave": 0,
		"activeChild": 0,
		"reminders": [],
		"personalLog": [],
		"boomerangSlave": 0,
		"boomerangWeeks": 0,
		"boomerangBuyer": 0,
		"bioreactorPerfectedID": 0,
		"independenceDay": 0,
		"invasionVictory": 0,
		"daughtersVictory": 0,
		"dormitory": 20,
		"dormitoryPopulation": 0,
		"rooms": 5,
		"roomsPopulation": 0,
		"brothelDecoration": "standard",
		"brothelUpgradeDrugs": 0,
		"brothelAdsSpending": 0,
		"brothelAdsOld": 0,
		"brothelAdsModded": 0,
		"brothelAdsImplanted": 0,
		"brothelAdsStacked": 0,
		"brothelAdsPreg": 0,
		"brothelAdsXX": 0,
		"brothelName": "the Brothel",
		"brothel": 0,
		"brothelBoost": {
			"selected": 0,
			"eligible": 0
		},
		"dairyDecoration": "standard",
		"dairyPrepUpgrade": 0,
		"dairyStimulatorsUpgrade": 0,
		"dairyStimulatorsSetting": 0,
		"dairyFeedersUpgrade": 0,
		"dairyFeedersSetting": 0,
		"dairyPregUpgrade": 0,
		"dairyPregSetting": 0,
		"dairyRestraintsUpgrade": 0,
		"dairyRestraintsSetting": 0,
		"dairySlimMaintainUpgrade": 0,
		"dairySlimMaintain": 0,
		"dairyHyperPregRemodel": 0,
		"dairyWeightSetting": 0,
		"dairyHormonesSetting": 0,
		"dairyImplantsSetting": 1,
		"dairyUpgradeMenials": 0,
		"createBioreactors": 0,
		"bioreactorsAnnounced": 0,
		"bioreactorsHerm": 0,
		"bioreactorsXX": 0,
		"bioreactorsXY": 0,
		"bioreactorsBarren": 0,
		"dairyName": "the Dairy",
		"dairy": 0,
		"clubDecoration": "standard",
		"clubUpgradePDAs": 0,
		"clubAdsSpending": 0,
		"clubAdsOld": 0,
		"clubAdsModded": 0,
		"clubAdsImplanted": 0,
		"clubAdsStacked": 0,
		"clubAdsPreg": 0,
		"clubAdsXX": 0,
		"clubName": "the Club",
		"club": 0,
		"servantsQuartersDecoration": "standard",
		"servantsQuartersUpgradeMonitoring": 0,
		"servantsQuarters": 0,
		"servantsQuartersName": "the Servants' Quarters",
		"schoolroomDecoration": "standard",
		"schoolroomUpgradeSkills": 0,
		"schoolroomUpgradeLanguage": 0,
		"schoolroomUpgradeRemedial": 0,
		"schoolroomRemodelBimbo": 0,
		"schoolroom": 0,
		"schoolroomName": "the Schoolroom",
		"spaDecoration": "standard",
		"spa": 0,
		"spaSpots": 0,
		"spaUpgrade": 0,
		"spaFix": 0,
		"spaAggroSpermBan": 1,
		"spaName": "the Spa",
		"incubator": {
			"capacity": 0,
			"tanks": [],
			"tankIndices": {},
			"maleSetting": {
				"imprint": "trust",
				"targetAge": 18
			},
			"femaleSetting": {
				"imprint": "trust",
				"targetAge": 18
			}
		},
		"clinicDecoration": "standard",
		"clinic": 0,
		"clinicUpgradeFilters": 0,
		"clinicUpgradeScanner": 0,
		"clinicUpgradePathogenSequencer": 0,
		"clinicUpgradePurge": 0,
		"clinicObservePregnancy": 1,
		"clinicInflateBelly": 0,
		"clinicRegularCheckups": 1,
		"clinicSpeedGestation": 0,
		"clinicName": "the Clinic",
		"arcadeDecoration": "standard",
		"arcadeUpgradeInjectors": 0,
		"arcadeUpgradeFuckdolls": 0,
		"arcadeUpgradeCollectors": 0,
		"arcadeUpgradeHealth": -1,
		"arcadeName": "the Arcade",
		"arcade": 0,
		"fuckdollsSold": 0,
		"cellblockDecoration": "standard",
		"cellblockUpgrade": 0,
		"cellblock": 0,
		"cellblockName": "the Cellblock",
		"cellblockWardenCumsInside": 1,
		"masterSuiteDecoration": "standard",
		"masterSuiteUpgradeLuxury": 0,
		"masterSuiteUpgradePregnancy": 0,
		"masterSuitePregnancyFertilityDrugs": 0,
		"masterSuitePregnancyFertilitySupplements": 0,
		"masterSuitePregnancySlaveLuxuries": 0,
		"universalHGImpregnateMasterSuiteToggle": 0,
		"masterSuiteHyperPregnancy": 0,
		"masterSuite": 0,
		"masterSuiteName": "the Master Suite",
		"nursery": 0,
		"nurseryNannies": 0,
		"nurseryCribs": 0,
		"nurseryChildren": 0,
		"nannyInfluence": 0,
		"nurseryDecoration": "standard",
		"nurseryWeight": 0,
		"nurseryMuscles": 0,
		"nurseryHormones": 0,
		"nurseryOrgans": 0,
		"nurseryImprintSetting": 0,
		"nurseryWeightSetting": 0,
		"nurseryMusclesSetting": 0,
		"nurseryHormonesSetting": 0,
		"nurseryName": "the Nursery",
		"nurserySex": false,
		"MatronIgnoresFlaws": false,
		"cribs": [],
		"cribsIndices": {},
		"sortNurseryList": "Unsorted",
		"targetAgeNursery": 18,
		"farmyard": 0,
		"farmyardFarmers": [],
		"farmMenials": 0,
		"farmMenialsSpace": 0,
		"farmyardDecoration": "standard",
		"farmyardUpgrades": {
			"pump": 0,
			"fertilizer": 0,
			"hydroponics": 0,
			"machinery": 0,
			"seeds": 0,
			"foodStorage": 150
		},
		"farmyardCrops": 0,
		"farmyardStables": 0,
		"farmyardKennels": 0,
		"farmyardCages": 0,
		"active": {
			"canine": null,
			"hooved": null,
			"feline": null
		},
		"animals": {
			"canine": [],
			"hooved": [],
			"feline": []
		},
		"customAnimals": {},
		"farmyardName": "the Farmyard",
		"HGSuite": 0,
		"HGSuiteSurgery": 1,
		"HGSuiteDrugs": 1,
		"HGSuiteAbortion": 1,
		"HGSuiteHormones": 1,
		"HGSuiteEquality": 0,
		"HGSuiteName": "the Head Girl Suite",
		"pit": null,
		"threatened": [
			[],
			[],
			[],
			[],
			[]
		],
		"dojo": 0,
		"feeder": 0,
		"cockFeeder": 0,
		"suppository": 0,
		"weatherCladding": 0,
		"weatherAwareness": 0,
		"boobAccessibility": 0,
		"servantMilkers": 0,
		"studio": 0,
		"studioFeed": 0,
		"PCSlutContacts": 1,
		"pornStars": {},
		"pregInventor": 0,
		"pregInventorID": 0,
		"pregInventions": 0,
		"FSAnnounced": 0,
		"FSGotRepCredits": 0,
		"FSCreditCount": 5,
		"FSSingleSlaveRep": 10,
		"FSSpending": 0,
		"FSLockinLevel": 100,
		"newCorp": 1,
		"vanillaShareSplit": 1,
		"classSatisfied": {
			"lowerClass": 0,
			"middleClass": 0,
			"upperClass": 0,
			"topClass": 0
		},
		"whoreBudget": {
			"lowerClass": 7,
			"middleClass": 40,
			"upperClass": 200,
			"topClass": 1500
		},
		"sexDemandResult": {
			"lowerClass": 0,
			"middleClass": 0,
			"upperClass": 0,
			"topClass": 0
		},
		"arcadePrice": 2,
		"shelterSlave": 0,
		"shelterSlaveBought": 0,
		"shelterAbuse": 0,
		"pregAccessibility": 0,
		"dickAccessibility": 0,
		"ballsAccessibility": 0,
		"buttAccessibility": 0,
		"boughtItem": {
			"clothing": {
				"bunny": 0,
				"conservative": 0,
				"chains": 0,
				"western": 0,
				"oil": 0,
				"habit": 0,
				"toga": 0,
				"huipil": 0,
				"kimono": 0,
				"harem": 0,
				"qipao": 0,
				"imperialarmor": 0,
				"imperialsuit": 0,
				"egypt": 0,
				"belly": 0,
				"maternityDress": 0,
				"maternityLingerie": 0,
				"lazyClothes": 0,
				"bimbo": 0,
				"courtesan": 0,
				"petite": 0,
				"antebellum": 0,
				"military": 0,
				"cultural": 0,
				"middleEastern": 0,
				"pol": 0,
				"costume": 0,
				"pantsu": 0,
				"career": 0,
				"dresses": 0,
				"bodysuits": 0,
				"casual": 0,
				"underwear": 0,
				"sports": 0,
				"pony": 0,
				"swimwear": 0
			},
			"shoes": {
				"heels": 0
			},
			"toys": {
				"enema": 0,
				"medicalEnema": 0,
				"buckets": 0,
				"dildos": 0,
				"gags": 0,
				"vaginalAttachments": 0,
				"buttPlugs": 0,
				"buttPlugTails": 0,
				"smartVibes": 0,
				"smartVaginalAttachments": 0,
				"smartStrapon": 0
			}
		},
		"dairyPiping": 0,
		"milkPipeline": 0,
		"cumPipeline": 0,
		"wcPiping": 0,
		"slaveDeath": {},
		"playerBred": 0,
		"propOutcome": 0,
		"EliteSires": [],
		"raped": -1,
		"rapedThisWeek": 0,
		"missingParentID": -10000,
		"pregSpeedControl": 0,
		"bodyswapAnnounced": 0,
		"surnamesForbidden": 0,
		"menstruation": 0,
		"FCNNstation": 0,
		"swanSong": 0,
		"failedElite": 0,
		"eugenicsFullControl": 0,
		"badC": 0,
		"poorKnight": 0,
		"imperialEventWeek": 0,
		"assholeKnight": 0,
		"newBaron": 0,
		"badB": 0,
		"schoolSuggestion": 0,
		"TSS": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"TUO": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"GRI": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"SCP": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"LDE": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"TGA": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"TCR": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"TFS": {
			"farmUpgrade": 0,
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0,
			"compromiseWeek": 0
		},
		"futaAddiction": 0,
		"HA": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"NUL": {
			"schoolUpgrade": 0,
			"schoolPresent": 0,
			"schoolProsperity": 0,
			"subsidize": 0,
			"schoolAnnexed": 0,
			"studentsBought": 0,
			"schoolSale": 0
		},
		"IDNumber": 1,
		"week": 1,
		"slaveTutor": {
			"HeadGirl": [],
			"Recruiter": [],
			"Bodyguard": [],
			"Madam": [],
			"DJ": [],
			"Nurse": [],
			"Teacher": [],
			"Attendant": [],
			"Matron": [],
			"Stewardess": [],
			"Milkmaid": [],
			"Farmer": [],
			"Wardeness": []
		},
		"weddingPlanned": 0,
		"personalAttention": {
			"task": "sex"
		},
		"HeadGirlID": 0,
		"HGTimeInGrade": 0,
		"RecruiterID": 0,
		"recruiterTarget": "desperate whores",
		"oldRecruiterTarget": "desperate whores",
		"recruiterProgress": 0,
		"recruiterIdleRule": "number",
		"recruiterIdleNumber": 20,
		"recruiterIOUs": 0,
		"recruiterSpecializations": {
			"beauty": 0,
			"height": 0,
			"intelligence": 0
		},
		"bodyguardTrains": 1,
		"BodyguardID": 0,
		"MadamID": 0,
		"djID": 0,
		"MilkmaidID": 0,
		"milkmaidImpregnates": 0,
		"FarmerID": 0,
		"StewardessID": 0,
		"stewardessImpregnates": 0,
		"SchoolteacherID": 0,
		"AttendantID": 0,
		"MatronID": 0,
		"NurseID": 0,
		"WardenessID": 0,
		"ConcubineID": 0,
		"justiceEvents": [
			"slave deal",
			"slave training",
			"majority deal",
			"indenture deal",
			"virginity deal",
			"breeding deal"
		],
		"prisonCircuit": [
			"low tier criminals",
			"gangs and smugglers",
			"white collar",
			"military prison",
			"juvenile detention"
		],
		"prisonCircuitIndex": 0,
		"ui": "start",
		"tooltipsEnabled": 0,
		"brandTarget": {
			"primary": "left buttock",
			"secondary": "left buttock",
			"local": "left buttock"
		},
		"brandDesign": {
			"primary": "your initials",
			"official": "your initials",
			"local": "your initials"
		},
		"scarTarget": {
			"primary": "left cheek",
			"secondary": "left cheek",
			"local": "left cheek"
		},
		"scarDesign": {
			"primary": "generic",
			"local": "generic"
		},
		"oralTotal": 0,
		"vaginalTotal": 0,
		"analTotal": 0,
		"mammaryTotal": 0,
		"penetrativeTotal": 0,
		"milkTotal": 0,
		"cumTotal": 0,
		"birthsTotal": 0,
		"abortionsTotal": 0,
		"miscarriagesTotal": 0,
		"bestialityTotal": 0,
		"pitKillsTotal": 0,
		"pitFightsTotal": 0,
		"collaboration": 0,
		"traitor": 0,
		"traitorType": 0,
		"traitorWeeks": 0,
		"traitorStats": 0,
		"hackerSupport": 0,
		"hostage": 0,
		"hostageWife": 0,
		"rival": {
			"state": 0,
			"duration": 0,
			"prosperity": 0,
			"power": 0,
			"FS": {
				"name": ""
			},
			"hostageState": 0
		},
		"nationHate": 0,
		"eventResults": {},
		"dispensary": 0,
		"dispensaryUpgrade": 0,
		"organFarmUpgrade": 0,
		"completedOrgans": [],
		"ImplantProductionUpgrade": 0,
		"permaPregImplant": 0,
		"injectionUpgrade": 0,
		"hormoneUpgradeMood": 0,
		"hormoneUpgradeShrinkage": 0,
		"hormoneUpgradePower": 0,
		"pubertyHormones": 0,
		"dietXXY": 0,
		"dietCleanse": 0,
		"cumProDiet": 0,
		"dietFertility": 0,
		"curativeUpgrade": 0,
		"growthStim": 0,
		"reproductionFormula": 0,
		"aphrodisiacUpgrade": 0,
		"aphrodisiacUpgradeRefine": 0,
		"healthyDrugsUpgrade": 0,
		"superFertilityDrugs": 0,
		"bellyImplants": 0,
		"cervixImplants": 0,
		"cervixImplantUpgrade": 0,
		"meshImplants": 0,
		"prostateImplants": 0,
		"youngerOvaries": 0,
		"immortalOvaries": 0,
		"sympatheticOvaries": 0,
		"fertilityImplant": 0,
		"asexualReproduction": 0,
		"animalOvaries": 0,
		"animalTesticles": 0,
		"animalMpreg": 0,
		"geneticMappingUpgrade": 0,
		"toyShop": false,
		"pregnancyMonitoringUpgrade": 0,
		"cloningSystem": 0,
		"geneticFlawLibrary": 0,
		"consumerDrugs": 0,
		"projectN": {
			"status": 0,
			"public": 0,
			"wellFunded": 0,
			"poorlyFunded": 0,
			"phase1": 0,
			"phase2": 0,
			"phase3": 0,
			"phase4": 0,
			"decisionMade": 0,
			"techReleased": 0
		},
		"bodyPuristRiot": 0,
		"puristsFurious": 0,
		"puristRiotDone": 0,
		"subjectDeltaName": "Bubbles",
		"growingNewCat": 0,
		"noDeadShit": 0,
		"surgeryUpgrade": 0,
		"barracks": 0,
		"mercenaries": 0,
		"mercenariesHelpCorp": 0,
		"personalArms": 0,
		"trinkets": {},
		"SPcost": 1000,
		"debtWarned": 0,
		"internationalTrade": 1,
		"internationalVariety": 0,
		"slaveCostFactor": 0.95,
		"menialDemandFactor": 0,
		"menialSupplyFactor": 0,
		"demandTimer": 0,
		"supplyTimer": 0,
		"elapsedDemandTimer": 0,
		"elapsedSupplyTimer": 0,
		"slaveCostRandom": 0,
		"deltaDemand": 0,
		"deltaDemandOld": 0,
		"deltaSupply": 0,
		"deltaSupplyOld": 0,
		"NPCSexSupply": {
			"lowerClass": 3000,
			"middleClass": 3000,
			"upperClass": 3000,
			"topClass": 3000
		},
		"NPCMarketShare": {
			"lowerClass": 1000,
			"middleClass": 1000,
			"upperClass": 1000,
			"topClass": 1000
		},
		"sexSubsidies": {
			"lowerClass": 0,
			"middleClass": 0,
			"upperClass": 0,
			"topClass": 0
		},
		"sexSupplyBarriers": {
			"lowerClass": 0,
			"middleClass": 0,
			"upperClass": 0,
			"topClass": 0
		},
		"facilityCost": 100,
		"enduringRep": 1000,
		"maximumRep": 30000,
		"rep": 0,
		"repLastWeek": 0,
		"arcologyUpgrade": {
			"drones": 0,
			"hydro": 0,
			"apron": 0,
			"grid": 0,
			"spire": 0
		},
		"economy": 100,
		"localEcon": 0,
		"drugsCost": 0,
		"rulesCost": 0,
		"modCost": 0,
		"surgeryCost": 0,
		"AGrowth": 2,
		"ACitizens": 4250,
		"lowerClass": 3120,
		"LSCBase": 800,
		"visitors": 0,
		"rentDefaults": {
			"lowerClass": 20,
			"middleClass": 50,
			"upperClass": 180,
			"topClass": 650
		},
		"rent": {
			"lowerClass": 20,
			"middleClass": 50,
			"upperClass": 180,
			"topClass": 650
		},
		"rentEffectL": 1,
		"middleClass": 890,
		"MCBase": 200,
		"rentEffectM": 1,
		"upperClass": 200,
		"UCBase": 40,
		"rentEffectU": 1,
		"topClass": 40,
		"TCBase": 20,
		"rentEffectT": 1,
		"GDP": 278.6,
		"NPCSlaves": 900,
		"ASlaves": 900,
		"AProsperityCap": 0,
		"revealFoodEffects": 0,
		"building": null,
		"menials": 0,
		"fuckdolls": 0,
		"menialBioreactors": 0,
		"prestigeAuctioned": 0,
		"slaveMarketLimit": 20,
		"slavesSeen": 0,
		"slaveOrphanageTotal": 0,
		"citizenOrphanageTotal": 0,
		"privateOrphanageTotal": 0,
		"breederOrphanageTotal": 0,
		"LurcherID": 0,
		"coursed": 0,
		"StudID": 0,
		"raided": 0,
		"FSSlaveProfLawTrigger": 0,
		"citizenRetirementTrigger": 0,
		"FSSupLawTrigger": 0,
		"FSSubLawTrigger": 0,
		"nicaea": {
			"announced": 0,
			"preparation": 0,
			"involvement": -2,
			"power": 0,
			"held": 0,
			"focus": "",
			"assignment": "",
			"achievement": "",
			"name": "",
			"influence": 0,
			"eventWeek": 0
		},
		"peacekeepers": {
			"state": 1
		},
		"mercRomeo": 0,
		"oralUseWeight": 5,
		"vaginalUseWeight": 5,
		"analUseWeight": 5,
		"mammaryUseWeight": 1,
		"penetrativeUseWeight": 1,
		"weatherToday": {},
		"weatherLastWeek": 0,
		"weatherType": 0,
		"weatherRemaining": 0,
		"customSlave": null,
		"customSlaveOrdered": 0,
		"customSlaveReorder": 0,
		"huskSlave": null,
		"huskSlaveOrdered": 0,
		"JFC": {
			"order": 0,
			"reorder": 0
		},
		"cheatMode": 0,
		"cheatModeM": 1,
		"slaveBotGeneration": 0,
		"experimental": {
			"nursery": 0,
			"food": 0,
			"animalOvaries": 0,
			"dinnerParty": 0,
			"reportMissingClothing": 0,
			"raGrowthExpr": 0,
			"sexOverhaul": 0,
			"interactions": 0,
			"clitoralPenetration": 0,
			"raSortOutput": 0
		},
		"NaNArray": [],
		"recruiterEugenics": 0,
		"prostheticsUpgrade": 0,
		"adjustProstheticsCompleted": 0,
		"adjustProsthetics": [],
		"researchLab": {
			"level": 0,
			"aiModule": 1,
			"tasks": [],
			"maxSpace": 0,
			"hired": 0,
			"menials": 0
		},
		"prosthetics": {},
		"merchantFSWares": [
			"AssetExpansionistResearch",
			"GenderRadicalistResearch",
			"HedonisticDecadenceResearch",
			"SlaveProfessionalismResearch",
			"SlimnessEnthusiastResearch",
			"TransformationFetishistResearch",
			"YouthPreferentialistResearch"
		],
		"merchantIllegalWares": [
			"AnimalOrgans",
			"asexualReproduction",
			"BlackmarketPregAdaptation",
			"childhoodFertilityInducedNCS",
			"PGHack",
			"RapidCellGrowthFormula",
			"optimizedSpermFormula",
			"optimizedBreedingFormula",
			"sympatheticOvaries",
			"UterineRestraintMesh"
		],
		"UterineRestraintMesh": 0,
		"PGHack": 0,
		"BlackmarketPregAdaptation": 0,
		"RapidCellGrowthFormula": 0,
		"immortalityFormula": 0,
		"bioEngineeredFlavoringResearch": 0,
		"optimizedSpermFormula": 0,
		"enhancedProductionFormula": 0,
		"optimizedBreedingFormula": 0,
		"doctor": {
			"state": 0,
			"cost": 500
		},
		"pSurgery": {
			"state": 0,
			"cooldown": 0,
			"nursePreg": 0,
			"disloyal": 0,
			"cost": 0
		},
		"pExoticSurgery": {
			"state": 0,
			"fakePreg": 0,
			"cooldown": 0,
			"visits": 0,
			"clones": []
		},
		"diversePronouns": 0,
		"antiWeatherFreeze": 0,
		"econWeatherDamage": 0,
		"disasterResponse": 0,
		"postSexCleanUp": 1,
		"sideBarOptions": {
			"Style": "expanded",
			"Cash": 1,
			"Upkeep": 1,
			"SexSlaveCount": 1,
			"roomPop": 1,
			"Rep": 1,
			"GSP": 1,
			"Authority": 1,
			"Security": 1,
			"Crime": 1,
			"confirmWeekEnd": 0,
			"notifyFS": 1,
			"notifyIncubator": 1,
			"notifyCorp": 1
		},
		"DefaultBirthDestination": "individually decided fates",
		"heroSlavesPurchased": [],
		"fcnn": [],
		"murderAttemptWeek": 80,
		"illegalDeals": {
			"military": 0,
			"trade": 0,
			"menialDrug": 0,
			"slave": 0
		},
		"tempEventToggle": 0,
		"favorites": [],
		"loans": [],
		"RAActions": {
			"slaves": {}
		}
	};
	const set = new Set(
		Object.getOwnPropertyNames(defaultGameStateVariables).concat(
			Object.getOwnPropertyNames(resetOnNGPlus)
		)
	);

	for (const v in V) {
		if (!set.has(v)) {
			if (V.debugMode) {
				console.log("Not on whitelist, removed:", "V." + v + ":", V[v]);
			}
			delete V[v];
		}
	}
	node.append(`Done!`);
};

/**
 * @param {FC.SlaveState[]} [slaves]
 * @returns {{[key: string]: number}}
 * @deprecated
 */
App.Update.slaves2indices = function(slaves = V.slaves) {
	return slaves.reduce((acc, slave, i) => {
		acc[slave.ID] = i;
		return acc;
	}, {});
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @returns {DocumentFragment}
 */
App.Update.backwardsCompatibility = function() {
	const f = document.createDocumentFragment();
	let div;
	try {
		div = App.UI.DOM.appendNewElement("div", f, `Checking for old versions... `);
		App.Update.oldVersions(div);

		div = App.UI.DOM.appendNewElement("div", f, `Updating gene pool records... `);
		App.Update.genePoolRecords(div);

		div = App.UI.DOM.appendNewElement("div", f, `Updating global variables... `);
		App.Update.globalVariables(div);

		div = App.UI.DOM.appendNewElement("div", f, `Checking slave record type, updating indices... `);
		App.Update.slaveIndices(div);

		div = App.UI.DOM.appendNewElement("div", f, `Updating player character... `);
		App.Update.playerCharacter(div);

		div = App.UI.DOM.appendNewElement("div", f, `Updating slave records... `);
		App.Update.slaveRecords(div);

		div = App.UI.DOM.appendNewElement("div", f, `Updating human records... `);
		App.Update.humanRecords(div);

		div = App.UI.DOM.appendNewElement("div", f, `Updating Rule Assistant data... `);
		App.Update.RAassistantData(div);

		div = App.UI.DOM.appendNewElement("div", f, `Updating mods... `);
		App.Update.mods(div);

		div = App.UI.DOM.appendNewElement("div", f, `Updating arcology information... `);
		App.Update.arcology(div);

		div = App.UI.DOM.appendNewElement("div", f, `Cleaning up old FCNN headlines... `);
		App.Update.FCNN(div);

		div = App.UI.DOM.appendNewElement("div", f, `Checking for old variables... `);
		App.Update.autoshred(div);

		// leave this at the bottom of BC
		div = App.UI.DOM.appendNewElement("div", f, `Cleaning up... `);
		App.Update.cleanUp(div);

		App.UI.SlaveSummary.settingsChanged();
	} catch (error) {
		$(f).append(`<div><span class="error">Backwards compatibility has failed for your save.</span> Please upload your save to <a class="link-external" href="https://gitgud.io/pregmodfan/fc-pregmod/" target="_blank">https://gitgud.io/pregmodfan/fc-pregmod/</a> with notes on what went wrong so that we can fix the backwards compatibility process for everyone. Thank you!</div>`);
		f.append(App.UI.DOM.formatException(error));
		State.restore();
	}
	return f;
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {Node} node
 */
App.Update.globalVariables = function(node) {
	V.rival = V.rival || {};
	V.rival.FS = V.rival.FS || {};

	if (V.slaves.find(s => s.origin.includes("You were acquainted with $him before you were an arcology owner") && s.newGamePlus === 0)) {
		V.rival.hostageState = 2;
		V.hostage = 0;
		delete V.hostageWife;
	}
	if (V.hostageAnnounced && !V.slaves.find(s => s.origin.includes("You were acquainted with $him before you were an arcology owner") && s.newGamePlus === 0)) {
		V.rival.hostageState = 1;
	}
	V.rival.hostageState = V.rival.hostageState || 0;

	V.rival.state = V.rival.state || 0;
	V.rival.prosperity = V.rival.prosperity || 0;
	V.rival.power = V.rivalryPower || V.rival.power || 0;
	V.rival.duration = V.rivalryDuration || V.rival.duration || 0;
	V.rival.FS.name = V.rivalryFS || V.rival.FS.name || "";
	if (V.rivalRace) {
		V.rival.race = V.rivalRace;
	}
	if (V.rivalryFSRace) {
		V.rival.FS.race = V.rivalryFSRace;
	}
	if (V.rivalryFSAdopted) {
		V.rival.FS.adopted = 1;
	}
	if (V.rivalOwner > 0) {
		V.rival.prosperity = V.rivalOwner;
	}
	if (V.rivalOwner > 0 && V.rivalSet === 0) {
		V.rival.state = 1;
	} else if (V.rivalSet === 1) {
		V.rival.state = 2;
	}
	if (V.rivalOwner === -1) {
		V.rival.state = 3;
	}
	if (V.rivalOwnerEnslaved) {
		V.rival.state = 5;
	}
	if (V.releaseID < 1180) {
		const rivalEnslaved = V.slaves.filter(s => s.newGamePlus === 0 && s.origin.includes("$He was once an arcology owner like yourself.")).length > 0;
		if (V.rival.state === 1 && rivalEnslaved) {
			V.rival.state = 5;
		} else if (V.rival.state === 1 && !rivalEnslaved && V.arcologies.find(a => a.direction !== 0 && a.rival !== 1)) {
			V.rival.state = 4;
		}
	}
	if (V.rivalGender) {
		V.rival.gender = V.rivalGender;
	}

	if (typeof V.peacekeepers.state === "undefined") {
		V.peacekeepers = V.peacekeepers || {};
		delete V.peacekeepers.independent;
		if (V.peacekeepersGone) {
			V.peacekeepers.state = 0;
		} else if (!peacekeepersCanBeEstablished()) {
			V.peacekeepers.state = 1;
		} else if (!V.peacekeepersFate) {
			V.peacekeepers.state = 2;
		} else {
			V.peacekeepers.state = 3;
		}
		V.peacekeepers.tastes = V.peacekeepers.tastes || "";
	}

	if (typeof V.incubator === "number") {
		if (V.incubator > 0) {
			const storage = V.incubator;
			V.incubator = {capacity: storage, tanks: (V.tanks || [])};
		} else {
			App.Facilities.Incubator.init('decommission');
		}
	}

	V.incubator.capacity = V.incubator.capacity || 0;
	V.incubator.tanks = V.incubator.tanks || [];
	if (V.incubator.capacity > 0) {
		// temporary necessary for BC'ing some historical games
		V.incubator.setting = V.incubator.setting || {};

		V.incubator.name = V.incubator.name || V.incubatorName || "the Incubator";
		V.incubator.organs = V.incubator.organs || V.incubatorOrgans || [];
		V.incubator.bulkRelease = V.incubator.bulkRelease || V.incubator.setting.bulkRelease || V.incubatorBulkRelease || 0;

		V.incubator.upgrade = V.incubator.upgrade || {};
		V.incubator.upgrade.speed = V.incubator.upgrade.speed || V.incubatorUpgradeSpeed || 5;
		V.incubator.upgrade.weight = V.incubator.upgrade.weight || V.incubatorUpgradeWeight || 0;
		V.incubator.upgrade.muscles = V.incubator.upgrade.muscles || V.incubatorUpgradeMuscles || 0;
		V.incubator.upgrade.growthStims = V.incubator.upgrade.growthStims || V.incubatorUpgradeGrowthStims || 0;
		V.incubator.upgrade.reproduction = V.incubator.upgrade.reproduction || V.incubatorUpgradeReproduction || 0;
		V.incubator.upgrade.pregAdaptation = V.incubator.upgrade.pregAdaptation || V.incubatorUpgradePregAdaptation || 0;
		V.incubator.upgrade.organs = V.incubator.upgrade.organs || V.incubatorUpgradeOrgans || 0;

		const provisionalPregAdaptation = V.incubator.setting.pregAdaptation || V.incubatorPregAdaptationSetting || 0;

		V.incubator.maleSetting = V.incubator.maleSetting || {...V.incubator.setting};
		V.incubator.maleSetting.targetAge = V.incubator.maleSetting.targetAge || V.targetAge || V.minimumSlaveAge || 18;
		V.incubator.maleSetting.imprint = V.incubator.maleSetting.imprint || V.incubator.setting.imprint || V.incubatorImprintSetting || "trust";
		V.incubator.maleSetting.weight = V.incubator.maleSetting.weight || V.incubator.setting.weight || V.incubatorWeightSetting || 0;
		V.incubator.maleSetting.muscles =  V.incubator.maleSetting.muscles || V.incubator.setting.muscles || V.incubatorMusclesSetting || 0;
		V.incubator.maleSetting.growthStims = V.incubator.maleSetting.growthStims || V.incubator.setting.growthStims || V.incubatorGrowthStimsSetting || 0;
		V.incubator.maleSetting.reproduction = V.incubator.maleSetting.reproduction || V.incubator.setting.reproduction || V.incubatorReproductionSetting || 0;
		V.incubator.maleSetting.pregAdaptation = V.incubator.maleSetting.pregAdaptation || ((provisionalPregAdaptation === 2 || provisionalPregAdaptation === 3) ? 1 : 0);	// Convert to boolean
		V.incubator.maleSetting.pregAdaptationPower = V.incubator.maleSetting.pregAdaptationPower || V.incubator.setting.pregAdaptationPower || V.incubatorPregAdaptationPower || 0;

		V.incubator.femaleSetting = V.incubator.femaleSetting || {...V.incubator.setting};
		V.incubator.femaleSetting.targetAge = V.incubator.femaleSetting.targetAge || V.targetAge || V.minimumSlaveAge || 18;
		V.incubator.femaleSetting.imprint = V.incubator.femaleSetting.imprint || V.incubator.setting.imprint || V.incubatorImprintSetting || "trust";
		V.incubator.femaleSetting.weight = V.incubator.femaleSetting.weight || V.incubator.setting.weight || V.incubatorWeightSetting || 0;
		V.incubator.femaleSetting.muscles = V.incubator.femaleSetting.muscles || V.incubator.setting.muscles || V.incubatorMusclesSetting || 0;
		V.incubator.femaleSetting.growthStims = V.incubator.femaleSetting.growthStims || V.incubator.setting.growthStims || V.incubatorGrowthStimsSetting || 0;
		V.incubator.femaleSetting.reproduction = V.incubator.femaleSetting.reproduction || V.incubator.setting.reproduction || V.incubatorReproductionSetting || 0;
		V.incubator.femaleSetting.pregAdaptation = V.incubator.femaleSetting.pregAdaptation || ((provisionalPregAdaptation === 1 || provisionalPregAdaptation === 3) ? 1 : 0);
		V.incubator.femaleSetting.pregAdaptationPower = V.incubator.femaleSetting.pregAdaptationPower || V.incubator.setting.pregAdaptationPower || V.incubatorPregAdaptationPower || 0;

		for (let i = 0; i < V.incubator.tanks.length; i++) {
			if (!("incubatorSettings" in V.incubator.tanks[i])) {
				const setting = (V.incubator.tanks[i].genes === "XX" ? V.incubator.femaleSetting : V.incubator.maleSetting);
				V.incubator.tanks[i].incubatorSettings = {
					imprint: setting.imprint,
					weight: setting.weight,
					muscles: setting.muscles,
					growthStims: setting.growthStims,
					reproduction: setting.reproduction,
					growTime: V.incubator.tanks[i].growTime,
					pregAdaptation: setting.pregAdaptation,
					pregAdaptationPower: V.incubator.tanks[i].incubatorPregAdaptationPower,
					pregAdaptationInWeek: V.incubator.tanks[i].incubatorPregAdaptationInWeek
				};
			}
		}

		// remove old settings or BC temporary
		delete V.incubator.settings;
	}

	V.incubator.maleSetting = V.incubator.maleSetting ?? {
		imprint: "trust",
		targetAge: 18,
	};

	V.incubator.femaleSetting = V.incubator.femaleSetting ?? {
		imprint: "trust",
		targetAge: 18,
	};

	// variables related to the App.Events.PregnancyNotice event
	V.pregnancyNotice = V.pregnancyNotice || {};
	V.pregnancyNotice.enabled = V.pregnancyNotice.enabled ?? true;
	V.pregnancyNotice.accordionCollapsed = V.pregnancyNotice.accordionCollapsed ?? -1;
	V.pregnancyNotice.nextLockout = V.pregnancyNotice.nextLockout ?? false;
	V.pregnancyNotice.renderFetus = V.pregnancyNotice.renderFetus ?? true;
	V.pregnancyNotice.processedSlaves = V.pregnancyNotice.processedSlaves || [];

	["donatrix", "receptrix", "impregnatrix"].forEach((variable) => {
		V[variable] = V[variable] ?? 0;
		if (typeof V[variable] !== "number") {
			if (typeof V[variable] === "object" && "ID" in V[variable]) {
				V[variable] = V[variable].ID;
			} else {
				V[variable] = 0;
			}
		}
	});

	V.transplantFetuses = V.transplantFetuses || [];

	if (Array.isArray(V.nationalities)) {
		V.nationalities = weightedArray2HashMap(V.nationalities);
	}

	// Records
	if (jQuery.isEmptyObject(V.lastWeeksCashIncome)) {
		setupLastWeeksCash();
	}

	if (jQuery.isEmptyObject(V.lastWeeksRepIncome)) {
		setupLastWeeksRep();
	}

	// Slave mods/surgery
	{
		if (typeof V.brandTarget === "string") {
			V.brandTarget = {primary: V.brandTarget, secondary: "buttock", local: "buttock"};
		} else if (typeof V.brandTarget !== "object") {
			V.brandTarget = {primary: "buttock", secondary: "buttock", local: "buttock"};
		}
		if (typeof V.brandDesign === "string") {
			V.brandDesign = {primary: V.brandDesign, official: V.brandDesign, local: V.brandDesign};
		} else if (typeof V.brandDesign !== "object") {
			V.brandDesign = {primary: "your initials", official: "your initials", local: "your initials"};
		}
		if (typeof V.brandDesign.official === "undefined") {
			V.brandDesign.official = "your personal symbol";
		}
		if (jQuery.isEmptyObject(V.scarTarget)) {
			V.scarTarget = {primary: "left cheek", secondary: "left cheek", local: "left cheek"};
		}
		if (jQuery.isEmptyObject(V.scarDesign)) {
			V.scarDesign = {primary: "generic", local: "generic"};
		}
		App.Utils.moveProperties(V.customItem, V.customItem, {
			vaginalAccessory: "dildos",
			buttplug: "buttPlugs"
		});
		if (V.releaseID <= 1110) {
			V.researchLab.tasks = V.researchLab.tasks.filter((t) => (!(t.hasOwnProperty("slaveID")) || Object.keys(V.slaveIndices).includes(t.slaveID)));
		}

		// Prosthetics
		App.Data.prostheticIDs.forEach(function(id) {
			V.prosthetics[id] = V.prosthetics[id] || {};
			V.prosthetics[id].amount = V.prosthetics[id].amount || 0;
			V.prosthetics[id].research = V.prosthetics[id].research || 0;
		});
	}

	// Reminders
	{
		if (!Array.isArray(V.reminders)) {
			let r = V.reminders;
			V.reminders = [];
			for (let i = 0; i < r.entries.length; i++) {
				App.Reminders.add(r.entries[i], V.week + Number(r.weeks[i]));
			}
			for (let i = 0; i < r.overdue.length; i++) {
				let s = r.overdue[i].split(" ");
				s.splice(s.length - 5, 5);
				s = s.join(" ");
				App.Reminders.add(s, V.week - 1);
			}
		}
	}

	// Display
	{
		if (!V.sideBarOptions.Style) {
			V.sideBarOptions.Style = 'expanded';
		}
		if (typeof V.sideBarOptions.roomPop === "undefined") {
			V.sideBarOptions.roomPop = 1;
		}
		if (typeof V.sideBarOptions.confirmWeekEnd === "undefined") {
			V.sideBarOptions.confirmWeekEnd = 0;
		}
		if (typeof V.sideBarOptions.notifyFS === "undefined") {
			V.sideBarOptions.notifyFS = 1;
		}
		if (typeof V.sideBarOptions.notifyIncubator === "undefined") {
			V.sideBarOptions.notifyIncubator = 1;
		}
		if (typeof V.sideBarOptions.notifyCorp === "undefined") {
			V.sideBarOptions.notifyCorp = 1;
		}
		if (V.sortSlavesBy === "income" || V.sortSlavesBy === "lastWeeksCashIncome") {
			V.sortSlavesBy = "weeklyIncome";
		}

		if (typeof V.abbreviateClothes === "number") {
			V.UI.slaveSummary = App.UI.SlaveSummary.makeNewState();
			for (const key of ["clothes", "devotion", "beauty", "diet", "drugs", "genitalia", "health", "hormoneBalance",
				"mental", "nationality", "origins", "physicals", "race", "rules", "rulesets", "skills"]) {
				V.UI.slaveSummary.abbreviation[key] = V["abbreviate" + capFirstChar(key)] || V.UI.slaveSummary.abbreviation[key];
			}
		}

		if (typeof V.UI.slaveSummary.abbreviation.beauty === "undefined") {
			V.UI.slaveSummary.abbreviation.beauty = 0;
		}

		if (typeof V.UI.compressSocialEffects !== "number") {
			V.UI.compressSocialEffects = 0;
		}

		V.raConfirmDelete = 1;
	}
	V.addButtonsToSlaveLinks = V.addButtonsToSlaveLinks || true;

	if (typeof V.taitorWeeks !== "undefined") {
		V.traitorWeeks = V.taitorWeeks;
	}

	// Orphanages
	if ((typeof V.DefaultBirthDestination === "undefined") || (V.DefaultBirthDestination === "") || (V.DefaultBirthDestination === "anywhere")) {
		V.DefaultBirthDestination = "individually decided fates";
	}

	// Rent
	{
		if (typeof V.LCRent !== "undefined") {
			V.rent.lowerClass = V.LCRent;
		}
		if (typeof V.MCRent !== "undefined") {
			V.rent.middleClass = V.MCRent;
		}
		if (typeof V.UCRent !== "undefined") {
			V.rent.upperClass = V.UCRent;
		}
		if (typeof V.TCRent !== "undefined") {
			V.rent.topClass = V.TCRent;
		}
	}

	// PC
	{
		App.Update.PCDatatypeCleanup(V.PC);
		V.enduringTrust = Number(V.enduringTrust) || 0;
		V.enduringDevotion = Number(V.enduringDevotion) || 0;
		V.averageTrust = Number(V.averageTrust) || 0;
		V.averageDevotion = Number(V.averageDevotion) || 0;
		if (typeof V.trainingRegimen !== "undefined" && typeof V.personalAttention === "number") {
			V.personalAttention = {
				task: PersonalAttention.TRAINING,
				slaves: [{ID: V.personalAttention, objective: App.PersonalAttention.update(V.trainingRegimen)}]
			};
		}
		if (V.personalAttention.task === undefined) {
			if (typeof V.personalAttention === "string") {
				V.personalAttention = {task: V.personalAttention};
			} else if (Array.isArray(V.personalAttention)) {
				V.personalAttention.forEach(s => { s.objective = App.PersonalAttention.update(s.trainingRegimen); delete s.trainingRegimen; });
				V.personalAttention = {
					task: PersonalAttention.TRAINING,
					slaves: V.personalAttention
				};
			}
		}
		if (V.personalAttention.slaves && V.personalAttention.slaves.length > 0 && V.personalAttention.task !== PersonalAttention.TRAINING) {
			V.personalAttention.task = PersonalAttention.TRAINING;
		}
		V.HackingSkillMultiplier = upgradeMultiplier('hacking');
		V.upgradeMultiplierArcology = upgradeMultiplier('engineering');
		V.upgradeMultiplierMedicine = upgradeMultiplier('medicine');
		V.upgradeMultiplierTrade = upgradeMultiplier('trading');
		V.AgeEffectOnTrainerPricingPC = 1;
		V.AgeEffectOnTrainerEffectivenessPC = 1;
		V.AgeTrainingUpperBoundPC = 14;
		V.AgeTrainingLowerBoundPC = 12;
		V.IsInPrimePC = 3;
		V.IsPastPrimePC = 5000;
	}

	// Menials
	{
		if (typeof V.AMenials !== "undefined") {
			V.ASlaves += Math.trunc(V.AMenials / 2);
		}
		if (typeof V.helots !== "undefined") {
			V.menials = V.helots;
		}
		if (typeof V.TradeShowHelots !== "undefined") {
			V.TradeShowMenials = V.TradeShowHelots;
		}
	}

	// Items/upgrades purchased
	{
		if (V.merchantFSWares.length === 0) {
			V.merchantFSWares = Array.from(App.Data.FSWares);
		}
		if (V.merchantIllegalWares.length === 0) {
			V.merchantIllegalWares = Array.from(App.Data.illegalWares);
		}
	}

	// Shopping for slaves
	if (jQuery.isEmptyObject(V.huskSlave)) {
		V.huskSlave = new App.Entity.CustomSlaveOrder();
	}
	if (V.prisonCircuit.length === 0) {
		V.prisonCircuit = ["low tier criminals", "gangs and smugglers", "white collar", "military prison"];
		V.prisonCircuitIndex = random(0, V.prisonCircuit.length - 1);
	}
	if (V.prisonCircuit.length === 4) {
		V.prisonCircuit.push("juvenile detention");
	}

	App.Update.CustomSlaveOrder(V.huskSlave);
	App.Update.CustomSlaveOrder(V.customSlave);

	if (V.heroSlavesPuchased) { // fix typo
		V.heroSlavesPurchased = Array.from(V.heroSlavesPuchased);
	}

	// Farmyard
	App.Facilities.Farmyard.BC();

	// Pit
	App.Facilities.Pit.BC();

	if (Object.values(V.SecExp).length <= 1) {
		App.Mods.SecExp.Obj.Init();
	} else {
		App.Mods.SecExp.Obj.BC();
	}
	App.Mods.SF.BC();

	// FS
	{
		if (V.FSGotRepCredits === 0) {
			if (V.FSGotRepCreditSix === 1) {
				V.FSGotRepCredits = 7;
			} else if (V.FSGotRepCreditFive === 1) {
				V.FSGotRepCredits = 6;
			} else if (V.FSGotRepCreditFour === 1) {
				V.FSGotRepCredits = 5;
			} else if (V.FSGotRepCreditThree === 1) {
				V.FSGotRepCredits = 4;
			} else if (V.FSGotRepCreditTwo === 1) {
				V.FSGotRepCredits = 3;
			} else if (V.FSGotRepCreditOne === 1) {
				V.FSGotRepCredits = 2;
			} else if (V.FSAnnounced === 1) {
				V.FSGotRepCredits = 1;
			}
		}
		if (typeof V.arcologies[0].FSAztecRevivalist === "undefined") {
			for (let bci = 0; bci < V.arcologies.length; bci++) {
				V.arcologies[bci].FSAztecRevivalist = null;
			}
		}
		if (typeof V.arcologies[0].FSHedonisticDecadence === "undefined") {
			for (let bci = 0; bci < V.arcologies.length; bci++) {
				V.arcologies[bci].FSHedonisticDecadence = null;
				V.arcologies[bci].FSHedonisticDecadenceResearch = 0;
			}
		}
		if (typeof V.arcologies[0].FSIntellectualDependency === "undefined") {
			for (let bci = 0; bci < V.arcologies.length; bci++) {
				V.arcologies[bci].FSIntellectualDependency = null;
				V.arcologies[bci].FSIntellectualDependencyResearch = 0;
			}
		}
		if (typeof V.arcologies[0].FSSlaveProfessionalism === "undefined") {
			for (let bci = 0; bci < V.arcologies.length; bci++) {
				V.arcologies[bci].FSSlaveProfessionalism = null;
				V.arcologies[bci].FSSlaveProfessionalismResearch = 0;
			}
		}
		if (typeof V.arcologies[0].FSPetiteAdmiration === "undefined") {
			for (let bci = 0; bci < V.arcologies.length; bci++) {
				V.arcologies[bci].FSPetiteAdmiration = null;
				V.arcologies[bci].FSPetiteAdmirationResearch = 0;
			}
		}
		if (typeof V.arcologies[0].FSStatuesqueGlorification === "undefined") {
			for (let bci = 0; bci < V.arcologies.length; bci++) {
				V.arcologies[bci].FSStatuesqueGlorification = null;
				V.arcologies[bci].FSStatuesqueGlorificationResearch = 0;
			}
		}
		if (typeof V.arcologies[0].FSCummunism === "undefined") {
			for (let bci = 0; bci < V.arcologies.length; bci++) {
				V.arcologies[bci].FSCummunism = null;
				V.arcologies[bci].FSCummunismResearch = 0;
			}
		}
		if (typeof V.arcologies[0].FSIncestFetishist === "undefined") {
			for (let bci = 0; bci < V.arcologies.length; bci++) {
				V.arcologies[bci].FSIncestFetishist = null;
				V.arcologies[bci].FSIncestFetishistResearch = 0;
			}
		}
		for (let bci = 0; bci < V.arcologies.length; bci++) {
			if (V.arcologies[bci].FSHedonisticDecadence === 0) {
				V.arcologies[bci].FSHedonisticDecadence = null;
				V.arcologies[bci].FSHedonisticDecadenceResearch = 0;
			}
		}
		if ( V.arcologies[0].FSRestart !== null && V.playerBredTube) {
			V.playerBred = 2;
		}
	}

	// Arcologies
	{
		if (jQuery.isEmptyObject(V.arcologies)) {
			V.arcologies = [];
			V.arcologies[0] = {
				name: "Arcology X-",
				direction: 0,
				government: 1,
				honeymoon: 0,
				prosperity: 50,
				FSSupremacist: null,
				FSSupremacistRace: 0,
				FSSubjugationist: null,
				FSSubjugationistRace: 0,
				FSGenderRadicalist: null,
				FSGenderFundamentalist: null,
				FSPaternalist: null,
				FSDegradationist: null,
				FSBodyPurist: null,
				FSTransformationFetishist: null,
				FSYouthPreferentialist: null,
				FSMaturityPreferentialist: null,
				FSSlimnessEnthusiast: null,
				FSAssetExpansionist: null,
				FSPastoralist: null,
				FSPhysicalIdealist: null,
				FSChattelReligionist: null,
				FSRomanRevivalist: null,
				FSNeoImperialist: null,
				FSEgyptianRevivalist: null,
				FSEdoRevivalist: null,
				FSArabianRevivalist: null,
				FSChineseRevivalist: null,
				FSAntebellumRevivalist: null,
				FSNull: null,
				FSRepopulationFocus: null,
				FSRestart: null,
				FSHedonisticDecadence: null,
				FSIntellectualDependency: null,
				FSSlaveProfessionalism: null,
				FSPetiteAdmiration: null,
				FSStatuesqueGlorification: null,
				embargo: 1,
				embargoTarget: -1,
				influenceTarget: -1,
				influenceBonus: 0,
				rival: 0
			};
		}
	}

	// Player Arcology: object
	{
		App.Update.playerArcologyDatatypeCleanup();
		// FS
		{
			if ((typeof V.FSSupremacist !== "undefined") && V.FSSupremacist !== null) {
				V.arcologies[0].FSSupremacist = V.FSSupremacist;
				V.arcologies[0].FSSupremacistRace = V.FSSupremacistRace;
			} else if (typeof V.arcologies[0].FSSupremacist === "undefined") {
				V.arcologies[0].FSSupremacist = null;
			}
			if ((typeof V.FSSupremacistLawME !== "undefined") && V.FSSupremacistLawME !== 0) {
				V.arcologies[0].FSSupremacistLawME = V.FSSupremacistLawME;
			} else if (typeof V.arcologies[0].FSSupremacistLawME === "undefined") {
				V.arcologies[0].FSSupremacistLawME = 0;
			}
			if (V.arcologies[0].FSSupremacistRace === "middle") {
				V.arcologies[0].FSSupremacistRace = "middle eastern";
			} else if (V.arcologies[0].FSSupremacistRace === "pacific") {
				V.arcologies[0].FSSupremacistRace = "pacific islander";
			} else if (V.arcologies[0].FSSupremacistRace === "southern") {
				V.arcologies[0].FSSupremacistRace = "southern european";
			} else if (V.arcologies[0].FSSupremacistRace === "mixed") {
				V.arcologies[0].FSSupremacistRace = "mixed race";
			}
			if ((typeof V.FSSubjugationist !== "undefined") && V.FSSubjugationist !== null) {
				V.arcologies[0].FSSubjugationist = V.FSSubjugationist;
				V.arcologies[0].FSSubjugationistRace = V.FSSubjugationistRace;
			} else if (typeof V.arcologies[0].FSSubjugationist === "undefined") {
				V.arcologies[0].FSSubjugationist = null;
			}
			if ((typeof V.FSSubjugationistLawME !== "undefined") && V.FSSubjugationistLawME !== 0) {
				V.arcologies[0].FSSubjugationistLawME = V.FSSubjugationistLawME;
			} else if (typeof V.arcologies[0].FSSubjugationistLawME === "undefined") {
				V.arcologies[0].FSSubjugationistLawME = 0;
			}
			if (V.arcologies[0].FSSubjugationistRace === "middle") {
				V.arcologies[0].FSSubjugationistRace = "middle eastern";
			} else if (V.arcologies[0].FSSubjugationistRace === "pacific") {
				V.arcologies[0].FSSubjugationistRace = "pacific islander";
			} else if (V.arcologies[0].FSSubjugationistRace === "southern") {
				V.arcologies[0].FSSubjugationistRace = "southern european";
			} else if (V.arcologies[0].FSSubjugationistRace === "mixed") {
				V.arcologies[0].FSSubjugationistRace = "mixed race";
			}
			if ((typeof V.FSDegradationist !== "undefined") && V.FSDegradationist !== null) {
				V.arcologies[0].FSDegradationist = V.FSDegradationist;
			} else if (typeof V.arcologies[0].FSDegradationist === "undefined") {
				V.arcologies[0].FSDegradationist = null;
			}
			if ((typeof V.FSDegradationistLaw !== "undefined") && V.FSDegradationistLaw !== 0) {
				V.arcologies[0].FSDegradationistLaw = V.FSDegradationistLaw;
			} else if (typeof V.arcologies[0].FSDegradationistLaw === "undefined") {
				V.arcologies[0].FSDegradationistLaw = 0;
			}
			if ((typeof V.FSPaternalist !== "undefined") && V.FSPaternalist !== null) {
				V.arcologies[0].FSPaternalist = V.FSPaternalist;
			} else if (typeof V.arcologies[0].FSPaternalist === "undefined") {
				V.arcologies[0].FSPaternalist = null;
			}
			if ((typeof V.FSPaternalistLaw !== "undefined") && V.FSPaternalistLaw !== 0) {
				V.arcologies[0].FSPaternalistLaw = V.FSPaternalistLaw;
			} else if (typeof V.arcologies[0].FSPaternalistLaw === "undefined") {
				V.arcologies[0].FSPaternalistLaw = 0;
			}
			if ((typeof V.FSGenderFundamentalist !== "undefined") && V.FSGenderFundamentalist !== null) {
				V.arcologies[0].FSGenderFundamentalist = V.FSGenderFundamentalist;
			} else if (typeof V.arcologies[0].FSGenderFundamentalist === "undefined") {
				V.arcologies[0].FSGenderFundamentalist = null;
			}
			if ((typeof V.FSGenderFundamentalistSMR !== "undefined") && V.FSGenderFundamentalistSMR !== 0) {
				V.arcologies[0].FSGenderFundamentalistSMR = V.FSGenderFundamentalistSMR;
			} else if (typeof V.arcologies[0].FSGenderFundamentalistSMR === "undefined") {
				V.arcologies[0].FSGenderFundamentalistSMR = 0;
			}
			delete V.arcologies[0].FSGenderFundamentalistLaw;
			if ((typeof V.FSGenderRadicalist !== "undefined") && V.FSGenderRadicalist !== null) {
				V.arcologies[0].FSGenderRadicalist = V.FSGenderRadicalist;
			} else if (typeof V.arcologies[0].FSGenderRadicalist === "undefined") {
				V.arcologies[0].FSGenderRadicalist = null;
			}
			if (typeof V.arcologies[0].FSGenderRadicalistLawBeauty === "undefined") {
				V.arcologies[0].FSGenderRadicalistLawBeauty = 0;
			}
			if (typeof V.arcologies[0].FSGenderRadicalistLawFuta === "undefined") {
				V.arcologies[0].FSGenderRadicalistLawFuta = 0;
			}
			delete V.arcologies[0].FSGenderRadicalistLawDicks;
			delete V.arcologies[0].FSGenderRadicalistSMR;
			if ((typeof V.FSBodyPurist !== "undefined") && V.FSBodyPurist !== null) {
				V.arcologies[0].FSBodyPurist = V.FSBodyPurist;
			} else if (typeof V.arcologies[0].FSBodyPurist === "undefined") {
				V.arcologies[0].FSBodyPurist = null;
			}
			if ((typeof V.FSBodyPuristLaw !== "undefined") && V.FSBodyPuristLaw !== 0) {
				V.arcologies[0].FSBodyPuristLaw = V.FSBodyPuristLaw;
			} else if (typeof V.arcologies[0].FSBodyPuristLaw === "undefined") {
				V.arcologies[0].FSBodyPuristLaw = 0;
			}
			if ((typeof V.FSPhysicalIdealist !== "undefined") && V.FSPhysicalIdealist !== null) {
				V.arcologies[0].FSPhysicalIdealist = V.FSPhysicalIdealist;
			} else if (typeof V.arcologies[0].FSPhysicalIdealist === "undefined") {
				V.arcologies[0].FSPhysicalIdealist = null;
			}
			if ((typeof V.FSPhysicalIdealistSMR !== "undefined") && V.FSPhysicalIdealistSMR !== 0) {
				V.arcologies[0].FSPhysicalIdealistSMR = V.FSPhysicalIdealistSMR;
			} else if (typeof V.arcologies[0].FSPhysicalIdealistSMR === "undefined") {
				V.arcologies[0].FSPhysicalIdealistSMR = 0;
			}
			if ((typeof V.FSTransformationFetishist !== "undefined") && V.FSTransformationFetishist !== null) {
				V.arcologies[0].FSTransformationFetishist = V.FSTransformationFetishist;
			} else if (typeof V.arcologies[0].FSTransformationFetishist === "undefined") {
				V.arcologies[0].FSTransformationFetishist = null;
			}
			if ((typeof V.FSTransformationFetishistSMR !== "undefined") && V.FSTransformationFetishistSMR !== 0) {
				V.arcologies[0].FSTransformationFetishistSMR = V.FSTransformationFetishistSMR;
			} else if (typeof V.arcologies[0].FSTransformationFetishistSMR === "undefined") {
				V.arcologies[0].FSTransformationFetishistSMR = 0;
			}
			delete V.arcologies[0].FSTransformationFetishistLaw;
			if ((typeof V.FSAssetExpansionist !== "undefined") && V.FSAssetExpansionist !== null) {
				V.arcologies[0].FSAssetExpansionist = V.FSAssetExpansionist;
			} else if (typeof V.arcologies[0].FSAssetExpansionist === "undefined") {
				V.arcologies[0].FSAssetExpansionist = null;
			}
			if ((typeof V.FSAssetExpansionistSMR !== "undefined") && V.FSAssetExpansionistSMR !== 0) {
				V.arcologies[0].FSAssetExpansionistSMR = V.FSAssetExpansionistSMR;
			} else if (typeof V.arcologies[0].FSAssetExpansionistSMR === "undefined") {
				V.arcologies[0].FSAssetExpansionistSMR = 0;
			}
			delete V.arcologies[0].FSAssetExpansionistLaw;
			if ((typeof V.FSSlimnessEnthusiast !== "undefined") && V.FSSlimnessEnthusiast !== null) {
				V.arcologies[0].FSSlimnessEnthusiast = V.FSSlimnessEnthusiast;
			} else if (typeof V.arcologies[0].FSSlimnessEnthusiast === "undefined") {
				V.arcologies[0].FSSlimnessEnthusiast = null;
			}
			if ((typeof V.FSSlimnessEnthusiastSMR !== "undefined") && V.FSSlimnessEnthusiastSMR !== 0) {
				V.arcologies[0].FSSlimnessEnthusiastSMR = V.FSSlimnessEnthusiastSMR;
			} else if (typeof V.arcologies[0].FSSlimnessEnthusiastSMR === "undefined") {
				V.arcologies[0].FSSlimnessEnthusiastSMR = 0;
			}
			if (typeof V.arcologies[0].FSSlimnessEnthusiastFoodLaw === "undefined") {
				V.arcologies[0].FSSlimnessEnthusiastFoodLaw = 0;
			}
			if ((typeof V.FSMaturityPreferentialist !== "undefined") && V.FSMaturityPreferentialist !== null) {
				V.arcologies[0].FSMaturityPreferentialist = V.FSMaturityPreferentialist;
			} else if (typeof V.arcologies[0].FSMaturityPreferentialist === "undefined") {
				V.arcologies[0].FSMaturityPreferentialist = null;
			}
			if ((typeof V.FSMaturityPreferentialistLaw !== "undefined") && V.FSMaturityPreferentialistLaw !== 0) {
				V.arcologies[0].FSMaturityPreferentialistLaw = V.FSMaturityPreferentialistLaw;
			} else if (typeof V.arcologies[0].FSMaturityPreferentialistLaw === "undefined") {
				V.arcologies[0].FSMaturityPreferentialistLaw = 0;
			}
			if ((typeof V.FSYouthPreferentialist !== "undefined") && V.FSYouthPreferentialist !== null) {
				V.arcologies[0].FSYouthPreferentialist = V.FSYouthPreferentialist;
			} else if (typeof V.arcologies[0].FSYouthPreferentialist === "undefined") {
				V.arcologies[0].FSYouthPreferentialist = null;
			}
			if ((typeof V.FSYouthPreferentialistLaw !== "undefined") && V.FSYouthPreferentialistLaw !== 0) {
				V.arcologies[0].FSYouthPreferentialistLaw = V.FSYouthPreferentialistLaw;
			} else if (typeof V.arcologies[0].FSYouthPreferentialistLaw === "undefined") {
				V.arcologies[0].FSYouthPreferentialistLaw = 0;
			}
			if ((typeof V.FSPastoralist !== "undefined") && V.FSPastoralist !== null) {
				V.arcologies[0].FSPastoralist = V.FSPastoralist;
			} else if (typeof V.arcologies[0].FSPastoralist === "undefined") {
				V.arcologies[0].FSPastoralist = null;
			}
			if ((typeof V.FSPastoralistLaw !== "undefined") && V.FSPastoralistLaw !== 0) {
				V.arcologies[0].FSPastoralistLaw = V.FSPastoralistLaw;
			} else if (typeof V.arcologies[0].FSPastoralistLaw === "undefined") {
				V.arcologies[0].FSPastoralistLaw = 0;
			}
			if ((typeof V.FSChattelReligionist !== "undefined") && V.FSChattelReligionist !== null) {
				V.arcologies[0].FSChattelReligionist = V.FSChattelReligionist;
			} else if (typeof V.arcologies[0].FSChattelReligionist === "undefined") {
				V.arcologies[0].FSChattelReligionist = null;
			}
			if ((typeof V.FSChattelReligionistLaw !== "undefined") && V.FSChattelReligionistLaw !== 0) {
				V.arcologies[0].FSChattelReligionistLaw = V.FSChattelReligionistLaw;
			} else if (typeof V.arcologies[0].FSChattelReligionistLaw === "undefined") {
				V.arcologies[0].FSChattelReligionistLaw = 0;
			}
			if (typeof V.arcologies[0].FSChattelReligionistLaw2 === "undefined") {
				V.arcologies[0].FSChattelReligionistLaw2 = 0;
			}
			if ((typeof V.FSRomanRevivalist !== "undefined") && V.FSRomanRevivalist !== null) {
				V.arcologies[0].FSRomanRevivalist = V.FSRomanRevivalist;
			} else if (typeof V.arcologies[0].FSRomanRevivalist === "undefined") {
				V.arcologies[0].FSRomanRevivalist = null;
			}
			if ((typeof V.FSRomanRevivalistLaw !== "undefined") && V.FSRomanRevivalistLaw !== 0) {
				V.arcologies[0].FSRomanRevivalistLaw = V.FSRomanRevivalistLaw;
			} else if (typeof V.arcologies[0].FSRomanRevivalistLaw === "undefined") {
				V.arcologies[0].FSRomanRevivalistLaw = 0;
			}
			if ((typeof V.FSNeoImperialist !== "undefined") && V.FSNeoImperialist !== null) {
				V.arcologies[0].FSNeoImperialist = V.FSNeoImperialist;
			} else if (typeof V.arcologies[0].FSNeoImperialist === "undefined") {
				V.arcologies[0].FSNeoImperialist = null;
			}
			if ((typeof V.FSNeoImperialistLaw1 !== "undefined") && V.FSNeoImperialistLaw1 !== 0) {
				V.arcologies[0].FSNeoImperialistLaw1 = V.FSNeoImperialistLaw1;
			} else if (typeof V.arcologies[0].FSNeoImperialistLaw1 === "undefined") {
				V.arcologies[0].FSNeoImperialistLaw1 = 0;
			}
			if ((typeof V.FSNeoImperialistLaw2 !== "undefined") && V.FSNeoImperialistLaw2 !== 0) {
				V.arcologies[0].FSNeoImperialistLaw2 = V.FSNeoImperialistLaw2;
			} else if (typeof V.arcologies[0].FSNeoImperialistLaw2 === "undefined") {
				V.arcologies[0].FSNeoImperialistLaw2 = 0;
			}
			if ((typeof V.FSEgyptianRevivalist !== "undefined") && V.FSEgyptianRevivalist !== null) {
				V.arcologies[0].FSEgyptianRevivalist = V.FSEgyptianRevivalist;
			} else if (typeof V.arcologies[0].FSEgyptianRevivalist === "undefined") {
				V.arcologies[0].FSEgyptianRevivalist = null;
			}
			if ((typeof V.FSEgyptianRevivalistLaw !== "undefined") && V.FSEgyptianRevivalistLaw !== 0) {
				V.arcologies[0].FSEgyptianRevivalistLaw = V.FSEgyptianRevivalistLaw;
			} else if (typeof V.arcologies[0].FSEgyptianRevivalistLaw === "undefined") {
				V.arcologies[0].FSEgyptianRevivalistLaw = 0;
			}
			if (typeof V.arcologies[0].FSEgyptianRevivalistIncestPolicy === "undefined") {
				V.arcologies[0].FSEgyptianRevivalistIncestPolicy = 0;
			}
			if (typeof V.arcologies[0].FSEgyptianRevivalistInterest === "undefined") {
				V.arcologies[0].FSEgyptianRevivalistInterest = 0;
			}
			if ((typeof V.FSEdoRevivalist !== "undefined") && V.FSEdoRevivalist !== null) {
				V.arcologies[0].FSEdoRevivalist = V.FSEdoRevivalist;
			} else if (typeof V.arcologies[0].FSEdoRevivalist === "undefined") {
				V.arcologies[0].FSEdoRevivalist = null;
			}
			if ((typeof V.FSEdoRevivalistLaw !== "undefined") && V.FSEdoRevivalistLaw !== 0) {
				V.arcologies[0].FSEdoRevivalistLaw = V.FSEdoRevivalistLaw;
			}
			if ((typeof V.FSArabianRevivalist !== "undefined") && V.FSArabianRevivalist !== null) {
				V.arcologies[0].FSArabianRevivalist = V.FSArabianRevivalist;
			} else if (typeof V.arcologies[0].FSArabianRevivalist === "undefined") {
				V.arcologies[0].FSArabianRevivalist = null;
			}
			if ((typeof V.FSArabianRevivalistLaw !== "undefined") && V.FSArabianRevivalistLaw !== 0) {
				V.arcologies[0].FSArabianRevivalistLaw = V.FSArabianRevivalistLaw;
			}
			if ((typeof V.FSChineseRevivalist !== "undefined") && V.FSChineseRevivalist !== null) {
				V.arcologies[0].FSChineseRevivalist = V.FSChineseRevivalist;
			} else if (typeof V.arcologies[0].FSChineseRevivalist === "undefined") {
				V.arcologies[0].FSChineseRevivalist = null;
			}
			if ((typeof V.FSChineseRevivalistLaw !== "undefined") && V.FSChineseRevivalistLaw !== 0) {
				V.arcologies[0].FSChineseRevivalistLaw = V.FSChineseRevivalistLaw;
			}
			if (typeof V.arcologies[0].FSAntebellumRevivalist === "undefined") {
				V.arcologies[0].FSAntebellumRevivalist = null;
			}
			if (typeof V.arcologies[0].FSAntebellumRevivalistSMR === "undefined") {
				V.arcologies[0].FSAntebellumRevivalistSMR = 0;
			}
			if (typeof V.arcologies[0].FSAntebellumRevivalistLaw1 === "undefined") {
				V.arcologies[0].FSAntebellumRevivalistLaw1 = 0;
			}
			if (typeof V.arcologies[0].FSAntebellumRevivalistLaw2 === "undefined") {
				V.arcologies[0].FSAntebellumRevivalistLaw2 = 0;
			}
			delete V.arcologies[0].FSNullLaw;

			for (const fs of Object.keys(App.Data.FutureSociety.records)) {
				// @ts-expect-error
				if (V.arcologies[0][fs] === "unset") {
					V.arcologies[0][fs] = null;
				}
			}

			if (V.arcologies[0].FSSubjugationist !== null && !Number.isFinite(V.arcologies[0].FSSubjugationist)) {
				V.arcologies[0].FSSubjugationist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSSubjugationist`);
			}
			if (V.arcologies[0].FSGenderRadicalist !== null && !Number.isFinite(V.arcologies[0].FSGenderRadicalist)) {
				V.arcologies[0].FSGenderRadicalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSGenderRadicalist`);
			}
			if (V.arcologies[0].FSRestart !== null && !Number.isFinite(V.arcologies[0].FSRestart)) {
				V.arcologies[0].FSRestart = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSRestart`);
			}
			if (V.arcologies[0].FSRepopulationFocus !== null && !Number.isFinite(V.arcologies[0].FSRepopulationFocus)) {
				V.arcologies[0].FSRepopulationFocus = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSRepopulationFocus`);
			}
			if (V.arcologies[0].FSSupremacist !== null && !Number.isFinite(V.arcologies[0].FSSupremacist)) {
				V.arcologies[0].FSSupremacist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSSupremacist`);
			}
			if (V.arcologies[0].FSBodyPurist !== null && !Number.isFinite(V.arcologies[0].FSBodyPurist)) {
				V.arcologies[0].FSBodyPurist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSBodyPurist`);
			}
			if (V.arcologies[0].FSPaternalist !== null && !Number.isFinite(V.arcologies[0].FSPaternalist)) {
				V.arcologies[0].FSPaternalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSPaternalist`);
			}
			if (V.arcologies[0].FSSlimnessEnthusiast !== null && !Number.isFinite(V.arcologies[0].FSSlimnessEnthusiast)) {
				V.arcologies[0].FSSlimnessEnthusiast = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSSlimnessEnthusiast`);
			}
			if (V.arcologies[0].FSGenderFundamentalist !== null && !Number.isFinite(V.arcologies[0].FSGenderFundamentalist)) {
				V.arcologies[0].FSGenderFundamentalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSGenderFundamentalist`);
			}
			if (V.arcologies[0].FSMaturityPreferentialist !== null && !Number.isFinite(V.arcologies[0].FSMaturityPreferentialist)) {
				V.arcologies[0].FSMaturityPreferentialist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSMaturityPreferentialist`);
			}
			if (V.arcologies[0].FSYouthPreferentialist !== null && !Number.isFinite(V.arcologies[0].FSYouthPreferentialist)) {
				V.arcologies[0].FSYouthPreferentialist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSYouthPreferentialist`);
			}
			if (V.arcologies[0].FSTransformationFetishist !== null && !Number.isFinite(V.arcologies[0].FSTransformationFetishist)) {
				V.arcologies[0].FSTransformationFetishist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSTransformationFetishist`);
			}
			if (V.arcologies[0].FSHedonisticDecadence !== null && !Number.isFinite(V.arcologies[0].FSHedonisticDecadence)) {
				V.arcologies[0].FSHedonisticDecadence = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSHedonisticDecadence`);
			}
			if (V.arcologies[0].FSPhysicalIdealist !== null && !Number.isFinite(V.arcologies[0].FSPhysicalIdealist)) {
				V.arcologies[0].FSPhysicalIdealist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSPhysicalIdealist`);
			}
			if (V.arcologies[0].FSPastoralist !== null && !Number.isFinite(V.arcologies[0].FSPastoralist)) {
				V.arcologies[0].FSPastoralist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSPastoralist`);
			}
			if (V.arcologies[0].FSAssetExpansionist !== null && !Number.isFinite(V.arcologies[0].FSAssetExpansionist)) {
				V.arcologies[0].FSAssetExpansionist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSAssetExpansionist`);
			}
			if (V.arcologies[0].FSDegradationist !== null && !Number.isFinite(V.arcologies[0].FSDegradationist)) {
				V.arcologies[0].FSDegradationist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSDegradationist`);
			}
			if (V.arcologies[0].FSRomanRevivalist !== null && !Number.isFinite(V.arcologies[0].FSRomanRevivalist)) {
				V.arcologies[0].FSRomanRevivalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSRomanRevivalist`);
			}
			if (V.arcologies[0].FSNeoImperialist !== null && !Number.isFinite(V.arcologies[0].FSNeoImperialist)) {
				V.arcologies[0].FSNeoImperialist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSNeoImperialist`);
			}
			if (V.arcologies[0].FSChattelReligionist !== null && !Number.isFinite(V.arcologies[0].FSChattelReligionist)) {
				V.arcologies[0].FSChattelReligionist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSChattelReligionist`);
			}
			if (V.arcologies[0].FSChineseRevivalist !== null && !Number.isFinite(V.arcologies[0].FSChineseRevivalist)) {
				V.arcologies[0].FSChineseRevivalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSChineseRevivalist`);
			}
			if (V.arcologies[0].FSArabianRevivalist !== null && !Number.isFinite(V.arcologies[0].FSArabianRevivalist)) {
				V.arcologies[0].FSArabianRevivalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSArabianRevivalist`);
			}
			if (V.arcologies[0].FSEdoRevivalist !== null && !Number.isFinite(V.arcologies[0].FSEdoRevivalist)) {
				V.arcologies[0].FSEdoRevivalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSEdoRevivalist`);
			}
			if (V.arcologies[0].FSEgyptianRevivalist !== null && !Number.isFinite(V.arcologies[0].FSEgyptianRevivalist)) {
				V.arcologies[0].FSEgyptianRevivalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSEgyptianRevivalist`);
			}
			if (V.arcologies[0].FSAztecRevivalist !== null && !Number.isFinite(V.arcologies[0].FSAztecRevivalist)) {
				V.arcologies[0].FSAztecRevivalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSAztecRevivalist`);
			}
			if (V.arcologies[0].FSAntebellumRevivalist !== null && !Number.isFinite(V.arcologies[0].FSAntebellumRevivalist)) {
				V.arcologies[0].FSAntebellumRevivalist = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSAntebellumRevivalist`);
			}
			if (V.arcologies[0].FSIntellectualDependency !== null && !Number.isFinite(V.arcologies[0].FSIntellectualDependency)) {
				V.arcologies[0].FSIntellectualDependency = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSIntellectualDependency`);
			}
			if (V.arcologies[0].FSSlaveProfessionalism !== null && !Number.isFinite(V.arcologies[0].FSSlaveProfessionalism)) {
				V.arcologies[0].FSSlaveProfessionalism = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSSlaveProfessionalism`);
			}
			if (V.arcologies[0].FSPetiteAdmiration !== null && !Number.isFinite(V.arcologies[0].FSPetiteAdmiration)) {
				V.arcologies[0].FSPetiteAdmiration = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSPetiteAdmiration`);
			}
			if (V.arcologies[0].FSStatuesqueGlorification !== null && !Number.isFinite(V.arcologies[0].FSStatuesqueGlorification)) {
				V.arcologies[0].FSStatuesqueGlorification = 10;
				App.UI.DOM.appendNewElement("div", node, `Fixed NaN FS value for FSStatuesqueGlorification`);
			}
			// Cat Mod
			if (V.arcologies[0].FSBodyPuristCatLaw === undefined) {
				V.arcologies[0].FSBodyPuristCatLaw = 0;
			}
			// Clean up FS in player arcology
			App.Update.playerFSDatatypeCleanup();
		}
	}

	App.Update.policies();

	// Player Arcology
	{
		if (typeof V.assistant === "number") {
			App.Update.assistantBC();
		} else {
			assistant.object();
		}
		if (V.week > 11 && V.assistant.personality === 0) {
			V.assistant.personality = -1;
		}
		App.Update.FCTV();
		if (jQuery.isEmptyObject(V.arcologyUpgrade)) {
			V.arcologyUpgrade = {
				drones: 0,
				hydro: 0,
				apron: 0,
				grid: 0,
				spire: 0
			};
			V.arcologyUpgrade.drones = (V.AProsperityCap > 60) ? 1 : 0;
			V.arcologyUpgrade.hydro = (V.AProsperityCap > 80) ? 1 : 0;
			V.arcologyUpgrade.apron = (V.AProsperityCap > 100) ? 1 : 0;
			V.arcologyUpgrade.grid = (V.AProsperityCap > 120) ? 1 : 0;
			V.arcologyUpgrade.spire = (V.AProsperityCap > 240) ? 1 : 0;
		}
		if (jQuery.isEmptyObject(V.building)) {
			if (typeof V.sectors !== "undefined") {
				App.Update.sectorsToBuilding();
			} else {
				V.building = App.Arcology.defaultBuilding();
			}
		}
		if (V.arcologyUpgrade.spire === 1 && !V.building.usedUpgrades.includes("spire")) {
			V.building.usedUpgrades.push("spire");
		}
		if (!V.building.sections.map(s => s.id).includes("penthouse")) {
			V.building.sections.push(new App.Arcology.Section("penthouse", [[new App.Arcology.Cell.Penthouse()]]));
		}

		if (!(V.trinkets instanceof Map) && jQuery.isEmptyObject(V.trinkets)) {
			V.trinkets = new Map([]);
			switch (V.PC.career) {
				case "arcology owner":
					V.trinkets.set("a miniature model of your first arcology", {});
					break;
				case "wealth":
					V.trinkets.set("a collection of diplomas from expensive schools", {});
					break;
				case "trust fund":
					V.trinkets.set("a diploma from your expensive boarding school", {});
					break;
				case "rich kid":
					V.trinkets.set("an extensive collection of pricey Old World trading cards.", {});
					break;
				case "capitalist":
				case "entrepreneur":
				case "business kid":
					V.trinkets.set("a framed low denomination piece of paper money from your native country", {});
					break;
				case "mercenary":
					V.trinkets.set("a battered old assault rifle", {});
					break;
				case "recruit":
					V.trinkets.set("a battered old pistol", {});
					break;
				case "child soldier":
					V.trinkets.set("a combat knife", {});
					break;
				case "slaver":
					V.trinkets.set("a framed picture of a slave with her sale price scrawled across the bottom", {});
					break;
				case "slave overseer":
					V.trinkets.set("a framed picture of slave pens you used to lord over", {});
					break;
				case "slave tender":
					V.trinkets.set("a framed picture of you hosing down a slave for market", {});
					break;
				case "engineer":
					V.trinkets.set("an artist's impression of an early arcology design", {});
					break;
				case "construction":
					V.trinkets.set("the blueprints of a proto-arcology you helped construct", {});
					break;
				case "worksite helper":
					V.trinkets.set("the hardhat you used to wear around worksites", {});
					break;
				case "medicine":
					V.trinkets.set("a framed postsurgical x-ray", {});
					break;
				case "medical assistant":
					V.trinkets.set("your personal set of surgical tools", {});
					break;
				case "nurse":
					V.trinkets.set("a framed picture of you outside the clinic you worked in", {});
					break;
				case "celebrity":
					V.trinkets.set("a framed copy of the first news story featuring yourself", {});
					break;
				case "rising star":
					V.trinkets.set("a framed poster of the first movie you starred in", {});
					break;
				case "child star":
					V.trinkets.set("a copy of the movie that gave you fame", {});
					break;
				case "BlackHat":
					V.trinkets.set("a news clipping of your first successful live hack", {});
					break;
				case "hacker":
					V.trinkets.set("an old USB stick that ruined a corporation", {});
					break;
				case "script kiddy":
					V.trinkets.set("a CD containing your first foray into scripting", {});
					break;
				case "escort":
					V.trinkets.set("a copy of the first porno you starred in", {});
					break;
				case "prostitute":
					V.trinkets.set("a nude pinup of you from the brothel you used to work in", {});
					break;
				case "child prostitute":
					V.trinkets.set("a pair of your used underwear", {});
					break;
				case "servant":
					V.trinkets.set("a framed picture of your late Master", {});
					break;
				case "handmaiden":
					V.trinkets.set("a framed picture of your late Master's family", {});
					break;
				case "child servant":
					V.trinkets.set("a framed picture of your late Master patting your head", {});
					break;
				case "gang":
					V.trinkets.set("your favorite handgun, whose sight has instilled fear in many", {});
					break;
				case "hoodlum":
					V.trinkets.set("a hood ornament stolen from a fancy Old World vehicle", {});
					break;
				case "street urchin":
					V.trinkets.set("your trusty knife, whose kept you safe many a night", {});
					break;
			}
		} else if (Array.isArray(V.trinkets)) {
			const newTrinkets = new Map([]);
			const trinketConverters = new Map([
				[`best in show balls`, /a best in show ribbon awarded to (.*?) for.*balls/g],
				[`best in show milk cow`, /a best in show ribbon awarded to (.*?) as a milk cow/g],
				[`best in show breeder`, /a best in show ribbon awarded to (.*?) as a breeder/g],
				[`famous courtesan`, /a framed article written about (.*?) when.*debuted as a famous courtesan/g],
				[`famous whore`, /a framed pornographic advertisement for (.*?) from the week.*became a famous whore/g],
				[`a cloth napkin`, /a cloth napkin skillfully folded into the shape of (.*?) given to you by (.*)/g],
				[`catgirl icon`, /a gorgeous quasi-religious icon made by (.*?) showing you creating the catgirl race/g],
				[`cat clay sculpture`, /a small, elegant clay sculpture made by (.*?) showing you surrounded by happy catgirl slaves/g],
				[`cat drawing`, /a pretty drawing of you and (.*?) cuddling together peacefully/g],
				[`cat crayon`, /a red construction paper heart with crude crayon figures of you and (.*?) holding hands above text reading/g],
			]);
			for (const trinket of V.trinkets) {
				let slaveName = "";
				let category = "";
				let napkinShape = "";
				for (const [newName, regex] of trinketConverters) {
					const conversionResult = regex.exec(trinket);
					if (conversionResult && conversionResult[1]) {
						if (newName === "a cloth napkin") {
							slaveName = conversionResult[2];
							napkinShape = conversionResult[1];
						} else {
							slaveName = conversionResult[1];
						}
						category = newName;
						break;
					}
				}
				if (slaveName) {
					if (!newTrinkets.get(category)) {
						newTrinkets.set(category, []);
					}
					newTrinkets.get(category).push({
						name: slaveName,
						id: null,
						napkinShape: napkinShape ? napkinShape : undefined,
					});
				} else {
					if (newTrinkets.get(trinket)) {
						newTrinkets.set(trinket, newTrinkets.get(trinket) + 1);
					} else {
						newTrinkets.set(trinket, 1);
					}
				}
			}
			V.trinkets = newTrinkets;
		}
	}

	// Clean up neighbor's arcologies
	App.Update.arcologiesDatatypeCleanup();

	// Corp
	{
		V.corp.disableOverhead = V.corp.disableOverhead || 0;
		// move from "V.corpDivArcade" format to "V.corp.DivArcade" (put corp into one object)
		for (let variable in State.variables) {
			if (variable.startsWith('corp') && variable !== "corp") {
				console.log("Corp: moving V." + variable, V[variable], "to V.corp." + variable.slice(4));
				if (Array.isArray(V[variable])) {
					V.corp[variable.slice(4)] = Array.from(V[variable]);
				} else if (typeof V[variable] === "object") {
					V.corp[variable.slice(4)] = {};
					Object.assign(V.corp[variable.slice(4)], V[variable]);
				} else {
					V.corp[variable.slice(4)] = V[variable];
				}
			}
		}
		// current foreignRevenue used to be used for old foreignRevenue
		let c = App.Corporate.ledger.current;
		App.Corporate.ledger.old.foreignRevenue = c.foreignRevenue;
		if (c.operations === undefined) {
			c.operations = 0;
			c.overhead = 0;
			c.economicBoost = 0;
		}
		/* Corporation variables added*/
		if (V.corp.ExpandToken > 1) {
			V.corp.ExpandToken = 1;
		}
		V.dividendTimer = V.dividendTimer || 13;
		if (V.corp.SpecNationality === 0) {
			delete V.corp.SpecNationality;
		}

		/* Removing the old Corp from save*/
		if (V.corp.Value) {
			cashX(Math.min(Math.trunc((V.corp.Value / (V.publicShares + V.personalShares)) * V.personalShares), 1000000), "stocksTraded");
			/* Paying the player for his old corporation, so they can get the new one started with haste. It should perhaps have a message going with it*/
			if (typeof V.sectors !== "undefined") {
				for (let i = 0; i < V.sectors.length; i++) {
					if (V.sectors[i].type === "CorporateMarket") {
						V.sectors[i].type = "Markets";
						break;
					}
				}
			}
		}

		/* if we managed to end up in a state where the corp isn't properly defined, forcefully reset it to starting conditions */
		if (typeof V.corp.Incorporated === "undefined") {
			V.corp = clone(App.Data.CorpInitData);
		}
		if (!("Name" in V.corp)) {
			V.corp.Name = 'Your corporation';
		}
	}

	// Organs
	{
		let newOrgans = [];
		V.organs.forEach(o => {
			if (o.type === "eyes") {
				newOrgans.push({type: "leftEye", weeksToCompletion: o.weeksToCompletion, ID: o.ID});
				newOrgans.push({type: "rightEye", weeksToCompletion: o.weeksToCompletion, ID: o.ID});
			} else {
				newOrgans.push(o);
			}
		});
		V.organs = newOrgans;

		newOrgans = [];
		V.completedOrgans.forEach(o => {
			if (o.type === "eyes") {
				newOrgans.push({type: "leftEye", ID: o.ID});
				newOrgans.push({type: "rightEye", ID: o.ID});
			} else {
				newOrgans.push(o);
			}
		});
		V.completedOrgans = newOrgans;
	}

	// Slave death
	if (!(V.slaveDeath instanceof Map)) {
		V.slaveDeath = new Map();
	}

	App.Update.FacilityDatatypeCleanup();

	if (typeof V.TFS.compromiseWeek === "undefined") {
		V.TFS.compromiseWeek = 0;
	}

	// Pornstars
	{
		/* migrate to new genre-driven pornstar object */
		if (typeof V.pornStars === "number") {
			const oldPornStars = V.pornStars;

			V.pornStars = {};
			V.pornStars.general = {p1count: oldPornStars, p3ID: V.pornStarID};
			V.pornStars.fuckdoll = {p1count: V.pornStarFuckdolls, p3ID: V.pornStarFuckdollID};
			V.pornStars.rape = {p1count: V.pornStarRapees, p3ID: V.pornStarRapeID};
			V.pornStars.preggo = {p1count: V.pornStarPreggos, p3ID: V.pornStarPreggoID};
			V.pornStars.BBW = {p1count: V.pornStarBBWs, p3ID: V.pornStarBBWID};
			V.pornStars.gainer = {p1count: V.pornStarGainers, p3ID: V.pornStarGainerID};
			V.pornStars.stud = {p1count: V.pornStarStuds, p3ID: V.pornStarStudID};
			V.pornStars.loli = {p1count: V.pornStarLolis, p3ID: V.pornStarLoliID};
			V.pornStars.deepThroat = {p1count: V.pornStarDeepThroats, p3ID: V.pornStarDeepThroatID};
			V.pornStars.struggleFuck = {p1count: V.pornStarStruggleFucks, p3ID: V.pornStarStruggleFuckID};
			V.pornStars.painal = {p1count: V.pornStarPainals, p3ID: V.pornStarPainalID};
			V.pornStars.tease = {p1count: V.pornStarTeases, p3ID: V.pornStarTeaseID};
			V.pornStars.romantic = {p1count: V.pornStarRomantics, p3ID: V.pornStarRomanticID};
			V.pornStars.pervert = {p1count: V.pornStarPerverts, p3ID: V.pornStarPervertID};
			V.pornStars.caring = {p1count: V.pornStarCarings, p3ID: V.pornStarCaringID};
			V.pornStars.unflinching = {p1count: V.pornStarUnflinchings, p3ID: V.pornStarUnflinchingID};
			V.pornStars.sizeQueen = {p1count: V.pornStarSizeQueens, p3ID: V.pornStarSizeQueenID};
			V.pornStars.neglectful = {p1count: V.pornStarNeglectfuls, p3ID: V.pornStarNeglectfulID};
			V.pornStars.cumAddict = {p1count: V.pornStarCumAddicts, p3ID: V.pornStarCumAddictID};
			V.pornStars.analAddict = {p1count: V.pornStarAnalAddicts, p3ID: V.pornStarAnalAddictID};
			V.pornStars.attentionWhore = {p1count: V.pornStarAttentionWhores, p3ID: V.pornStarAttentionWhoreID};
			V.pornStars.breastGrowth = {p1count: V.pornStarBreastGrowths, p3ID: V.pornStarBreastGrowthID};
			V.pornStars.abusive = {p1count: V.pornStarAbusives, p3ID: V.pornStarAbusiveID};
			V.pornStars.malicious = {p1count: V.pornStarMalicious, p3ID: V.pornStarMaliciousID};
			V.pornStars.selfHating = {p1count: V.pornStarSelfHatings, p3ID: V.pornStarSelfHatingID};
			V.pornStars.breeder = {p1count: V.pornStarBreeders, p3ID: V.pornStarBreederID};
			V.pornStars.sub = {p1count: V.pornStarSubs, p3ID: V.pornStarSubID};
			V.pornStars.cumSlut = {p1count: V.pornStarCumSluts, p3ID: V.pornStarCumSlutID};
			V.pornStars.anal = {p1count: V.pornStarAnals, p3ID: V.pornStarAnalID};
			V.pornStars.humiliation = {p1count: V.pornStarHumiliations, p3ID: V.pornStarHumiliationID};
			V.pornStars.boobs = {p1count: V.pornStarBoobs, p3ID: V.pornStarBoobsID};
			V.pornStars.dom = {p1count: V.pornStarDoms, p3ID: V.pornStarDomID};
			V.pornStars.sadist = {p1count: V.pornStarSadists, p3ID: V.pornStarSadistID};
			V.pornStars.masochist = {p1count: V.pornStarMasochists, p3ID: V.pornStarMasochistID};
			V.pornStars.pregnancy = {p1count: V.pornStarPregnancySluts, p3ID: V.pornStarPregnancyID};
		}

		/* make sure that any new genres get added correctly (and populate V.pornStars for very old games) */
		const pornGenres = App.Porn.getAllGenres();
		for (let genre in pornGenres) {
			if (V.pornStars[pornGenres[genre].fameVar] === undefined) {
				V.pornStars[pornGenres[genre].fameVar] = {p1count: 0, p3ID: 0};
			}
		}
		if (V.PCSlutContacts === 0) {
			V.PCSlutContacts = 1;
		}
	}

	// Slave services and goods variables
	{
		if (typeof V.lowerClassSatisfied !== "undefined") {
			V.classSatisfied.lowerClass = V.lowerClassSatisfied;
		}
		if (typeof V.sexSubsidiesLC !== "undefined") {
			V.sexSubsidies.lowerClass = V.sexSubsidiesLC;
		}
		if (typeof V.sexSupplyBarriersLC !== "undefined") {
			V.sexSupplyBarriers.lowerClass = V.sexSupplyBarriersLC;
		}

		if (V.localEcon > 100) {
			V.mods.food.cost = Math.max(5 / (1 + (Math.trunc(1000-100000/V.localEcon)/10)/100), 3.125);
		} else if (V.localEcon === 100) {
			V.mods.food.cost = 5;
		} else {
			V.mods.food.cost = Math.min(5 * (1 + 1.5 * Math.sqrt(Math.trunc(100000/V.localEcon-1000)/10)/100), 6.5);
		}
	}

	// Purge prosthetics that belong to slaves that no longer exist (there was a bug)
	for (let o = 0; o < V.adjustProsthetics.length; o++) {
		if (!getSlave(V.adjustProsthetics[o].slaveID, true)) {
			V.adjustProsthetics.deleteAt(o);
			o--;
		}
	}

	// Recalculate finished prosthetics
	V.adjustProstheticsCompleted = 0;
	for (const prosthetic of V.adjustProsthetics) {
		if (prosthetic.workLeft <= 0) {
			V.adjustProstheticsCompleted++;
		}
	}

	// Nicaea
	if (!(typeof V.nicaea === 'object' && V.nicaea !== null)) { // Taking over the old V.nicaea which defaulted to 0 and was unused.
		V.nicaea = {};
	}
	V.nicaea.announced = V.nicaea.announced || V.nicaeaAnnounced || 0;
	V.nicaea.preparation = V.nicaea.preparation || V.nicaeaPreparation || 0;
	V.nicaea.involvement = V.nicaea.involvement || V.nicaeaInvolvement || -2;
	V.nicaea.power = V.nicaea.power || V.nicaeaPower || 0;
	V.nicaea.held = V.nicaea.held || V.nicaeaHeld || 0;
	V.nicaea.focus = V.nicaea.focus || V.nicaeaFocus || "";
	V.nicaea.assignment = V.nicaea.assignment || V.nicaeaAssignment || "";
	V.nicaea.achievement = V.nicaea.achievement || V.nicaeaAchievement || "";
	V.nicaea.name = V.nicaea.name || V.nicaeaName || "";
	V.nicaea.influence = V.nicaea.influence || V.nicaeaInfluence || 0;

	V.shelterAbuse = Math.max(+V.shelterAbuse, 0) || 0;

	App.Update.EconomyDatatypeCleanup();

	// Menials
	V.menials = Math.max(+V.menials, 0) || 0;
	V.fuckdolls = Math.max(+V.fuckdolls, 0) || 0;
	V.menialBioreactors = Math.max(+V.menialBioreactors, 0) || 0;

	V.ACitizens = Math.max(+V.ACitizens, 0) || 0;
	V.ASlaves = Math.max(+V.ASlaves, 0) || V.NPCSlaves + V.menials + V.fuckdolls + V.menialBioreactors;

	// Materials costs
	V.drugsCost = Math.trunc(10000 / V.localEcon);
	V.rulesCost = Math.trunc(10000 / V.localEcon);
	V.modCost = Math.trunc(5000 / V.localEcon);
	V.surgeryCost = Math.trunc(30000 / (V.localEcon * ((V.PC.career === "medicine" || V.PC.career === "medical assistant" || V.PC.career === "nurse") ? 2 : 1)));
	V.facilityCost = +V.facilityCost || 100;

	// Schools
	for (const school of App.Data.misc.schools.keys()) {
		V[school].studentsBought = Math.max(+V[school].studentsBought, 0) || 0;
		V[school].schoolProsperity = Math.clamp(+V[school].schoolProsperity, -10, 10) || 0;
	}

	// Job Fulfillment Center (JFC)
	V.JFC.order = V.JFC.order || V.JFCOrder || 0;
	if (V.JFCReorder) { // Property removed if not in use
		V.JFC.reorder = V.JFCReorder;
	}
	if (jsDef(V.JFC.role) && V.JFC.role === "") {
		delete V.JFC.role;
	}

	// Cosmetic Surgery Suite
	V.pSurgery = V.pSurgery || {};
	V.pSurgery.state = V.pSurgery.state || 0;
	V.pSurgery.cooldown = V.playerSurgery || V.pSurgery.cooldown || 0;
	V.pSurgery.nursePreg = V.pSurgery.nursePreg || 0;
	V.pSurgery.disloyal = V.pSurgery.disloyal || 0;
	V.pSurgery.cost = V.pSurgery.cost || 0;

	// eventResults
	V.eventResults.snatch = V.eventResults.snatch || V.PSnatch || 0;
	V.eventResults.aid = V.eventResults.aid || V.PAid || 0;
	V.eventResults.aidTarget = V.eventResults.aidTarget || V.PAidTarget || "";
	V.eventResults.strip = V.eventResults.strip || V.PStrip || 0;

	// item purchase records
	V.boughtItem.clothing.bunny = V.boughtItem.clothing.bunny || V.clothesBoughtBunny || 0;
	V.boughtItem.clothing.conservative = V.boughtItem.clothing.conservative || V.clothesBoughtConservative || 0;
	V.boughtItem.clothing.chains = V.boughtItem.clothing.chains || V.clothesBoughtChains || 0;
	V.boughtItem.clothing.western = V.boughtItem.clothing.western || V.clothesBoughtWestern || 0;
	V.boughtItem.clothing.oil = V.boughtItem.clothing.oil || V.clothesBoughtOil || 0;
	V.boughtItem.clothing.habit = V.boughtItem.clothing.habit || V.clothesBoughtHabit || 0;
	V.boughtItem.clothing.toga = V.boughtItem.clothing.toga || V.clothesBoughtToga || 0;
	V.boughtItem.clothing.huipil = V.boughtItem.clothing.huipil || V.clothesBoughtHuipil || 0;
	V.boughtItem.clothing.kimono = V.boughtItem.clothing.kimono || V.clothesBoughtKimono || 0;
	V.boughtItem.clothing.harem = V.boughtItem.clothing.harem || V.clothesBoughtHarem || 0;
	V.boughtItem.clothing.qipao = V.boughtItem.clothing.qipao || V.clothesBoughtQipao || 0;
	V.boughtItem.clothing.egypt = V.boughtItem.clothing.egypt || V.clothesBoughtEgypt || 0;
	V.boughtItem.clothing.belly = V.boughtItem.clothing.belly || V.clothesBoughtBelly || 0;
	V.boughtItem.clothing.maternityDress = V.boughtItem.clothing.maternityDress || V.clothesBoughtMaternityDress || 0;
	V.boughtItem.clothing.maternityLingerie = V.boughtItem.clothing.maternityLingerie || V.clothesBoughtMaternityLingerie || 0;
	V.boughtItem.clothing.lazyClothes = V.boughtItem.clothing.lazyClothes || V.clothesBoughtLazyClothes || 0;
	V.boughtItem.clothing.bimbo = V.boughtItem.clothing.bimbo || V.clothesBoughtBimbo || 0;
	V.boughtItem.clothing.courtesan = V.boughtItem.clothing.courtesan || V.clothesBoughtCourtesan || 0;
	V.boughtItem.shoes.heels = V.boughtItem.shoes.heels || V.shoesBoughtHeels || 0;
	V.boughtItem.clothing.petite = V.boughtItem.clothing.petite || V.clothesBoughtPetite || 0;
	// non-fs
	V.boughtItem.clothing.military = V.boughtItem.clothing.military || V.clothesBoughtMilitary || 0;
	V.boughtItem.clothing.cultural = V.boughtItem.clothing.cultural || V.clothesBoughtCultural || 0;
	V.boughtItem.clothing.middleEastern = V.boughtItem.clothing.middleEastern || V.clothesBoughtMiddleEastern || 0;
	V.boughtItem.clothing.pol = V.boughtItem.clothing.pol || V.clothesBoughtPol || 0;
	V.boughtItem.clothing.costume = V.boughtItem.clothing.costume || V.clothesBoughtCostume || 0;
	V.boughtItem.clothing.pantsu = V.boughtItem.clothing.pantsu || V.clothesBoughtPantsu || 0;
	V.boughtItem.clothing.career = V.boughtItem.clothing.career || V.clothesBoughtCareer || 0;
	V.boughtItem.clothing.dresses = V.boughtItem.clothing.dresses || V.clothesBoughtDresses || 0;
	V.boughtItem.clothing.bodysuits = V.boughtItem.clothing.bodysuits || V.clothesBoughtBodysuits || 0;
	V.boughtItem.clothing.casual = V.boughtItem.clothing.casual || V.clothesBoughtCasual || 0;
	V.boughtItem.clothing.underwear = V.boughtItem.clothing.underwear || V.clothesBoughtUnderwear || 0;
	V.boughtItem.clothing.boughtSports = V.boughtItem.clothing.boughtSports || V.clothesBoughtSports || 0;
	V.boughtItem.clothing.boughtPony = V.boughtItem.clothing.boughtPony || V.clothesBoughtPony || 0;
	V.boughtItem.clothing.boughtSwimwear = V.boughtItem.clothing.boughtSwimwear || V.clothesBoughtSwimwear || 0;

	V.boughtItem.toys.dildos = V.boughtItem.toys.dildos || V.toysBoughtDildos || 0;
	V.boughtItem.toys.smartStrapon = V.boughtItem.toys.smartStrapon || 0;
	V.boughtItem.toys.smartVibes = V.boughtItem.toys.smartVibes || V.toysBoughtSmartVibes || 0;
	V.boughtItem.toys.vaginalAttachments = V.boughtItem.toys.vaginalAttachments || V.toysBoughtVaginalAttachments || 0;
	V.boughtItem.toys.smartVaginalAttachments = V.boughtItem.toys.smartVaginalAttachments || 0;
	V.boughtItem.toys.buttPlugs = V.boughtItem.toys.buttPlugs || V.toysBoughtButtPlugs || 0;
	V.boughtItem.toys.buttPlugTails = V.boughtItem.toys.buttPlugTails || V.toysBoughtButtPlugTails || 0;

	V.boughtItem.toys.buckets = V.boughtItem.toys.buckets || V.buckets || 0;
	V.boughtItem.toys.enema = V.boughtItem.toys.enema || V.enema || 0;
	V.boughtItem.toys.medicalEnema = V.boughtItem.toys.medicalEnema || V.medicalEnema || 0;

	V.building.findCells(cell => cell instanceof App.Arcology.Cell.Shop && (cell.type === "Hedonistic Decadence" || cell.type === "Hedonism")).forEach(cell => cell.type = "Hedonistic");
	V.building.findCells(cell => cell instanceof App.Arcology.Cell.Shop && cell.type === "Repopulation Focus").forEach(cell => cell.type = "Repopulationist");
	V.building.findCells(cell => cell instanceof App.Arcology.Cell.Shop && cell.type === "Neo Imperialist").forEach(cell => cell.type = "Neo-Imperialist");

	V.experimental.raGrowthExpr = V.experimental.raGrowthExpr || 0;
	V.experimental.reportMissingClothing = V.experimental.reportMissingClothing || 0;
	V.experimental.sexOverhaul = V.experimental.sexOverhaul || 0;
	V.experimental.interactions = V.experimental.interactions || 0;
	V.experimental.clitoralPenetration = V.experimental.clitoralPenetration || 0;

	V.experimental.raSortOutput = V.experimental.raSortOutput || 0;
	V.favSeparateReport = V.favSeparateReport || V.experimental.favSeparateReport || 0;

	// Budget
	V.showAllEntries.costsBudget = V.showAllEntries.costsBudget || 0;
	V.showAllEntries.repBudget = V.showAllEntries.repBudget || 0;
	if (typeof V.lastWeeksCashErrors === "string") {
		if (V.lastWeeksCashErrors === "Errors: ") {
			V.lastWeeksCashErrors = [];
		} else {
			V.lastWeeksCashErrors = [V.lastWeeksCashErrors];
		}
	}
	if (typeof V.lastWeeksRepErrors === "string") {
		if (V.lastWeeksRepErrors === "Errors: ") {
			V.lastWeeksRepErrors = [];
		} else {
			V.lastWeeksRepErrors = [V.lastWeeksRepErrors];
		}
	}

	if (V.facility.farmyard) {
		App.Utils.moveProperties(V.facility.farmyard, V.facility.farmyard, {
			whoreIncome: "farmhandIncome",
			whoreCosts: "farmhandCosts",
			slaveFoodCounts: "food"
		},
		false, true);
	}

	V.farmyardSlavesAssignThemselves = V.farmyardSlavesAssignThemselves ?? 0;

	V.showPotentialSizes = V.showPotentialSizes ?? 1;

	// remapping variables
	if (V.releaseID < 1240 && "pedo_mode" in V) {
		V.pedoMode = V.pedo_mode;
		delete V.pedo_mode;
	}

	V.aiDisabledLoRAs = V.aiDisabledLoRAs ?? [];

	node.append(`Done!`);
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {Node} node
 */
App.Update.slaveIndices = function(node) {
	if (!Array.isArray(V.slaves)) { return; } // future proofing; if we move to an object and this was somehow called it could be bad
	for (let bci = 0; bci < V.slaves.length; bci++) {
		if (typeof V.slaves[bci] !== "object") {
			V.slaves.deleteAt(bci);
			bci--;
			continue;
		}
	}
	V.slaveIndices = App.Update.slaves2indices();
	node.append(`Done!`);
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {Node} node
 */
App.Update.playerCharacter = function(node) {
	App.Update.Player(V.PC);
	node.append(`Done!`);
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {Node} node
 */
App.Update.slaveRecords = function(node) {
	const detachedSlaves = [
		V.hostage,
		V.boomerangSlave,
		V.traitor,
		V.shelterSlave
	];

	const updateRecord = (slave) => {
		App.Update.Slave(slave);
		App.Update.SlaveDataSchemeCleanup(slave);
		App.Update.SlaveDatatypeCleanup(slave);
	};

	V.slaves.forEach((slave) => updateRecord(slave));
	for (const slave of detachedSlaves) {
		if (typeof slave !== "undefined" && slave !== 0) {
			updateRecord(slave);
		}
	}

	if (V.incubator.tanks.length > 0) {
		let incubatorDiv = document.createElement("div");
		node.append(incubatorDiv);
		incubatorDiv.append(`Checking and fixing records for incubator tanks... `);
		V.incubator.tanks.forEach((slave) => {
			App.Update.Slave(slave);
			App.Update.SlaveDataSchemeCleanup(slave);
			App.Update.SlaveDatatypeCleanup(slave, true);
			/* pass second argument as true so that slaveAgeDatatypeCleanup is not run */
		});
		incubatorDiv.append(`Done!`);
	}

	if (V.cribs.length > 0) {
		let nurseryDiv = document.createElement("div");
		node.append(nurseryDiv);
		nurseryDiv.append(`Checking and fixing records for nursery cribs... `);
		V.cribs.forEach((child) => {
			if (child.actualAge < 3) {
				// infants are not slaves, they need their own update code (but there isn't much yet)
				// note that some infants have been *converted into* corrupted slaves by bad old BCs...no attempt is made to fix them here
				if (child.spermY === undefined) {
					child.spermY = normalRandInt(50, 5);
				}
				if (!child.natural) {
					child.natural = new App.Entity.GeneticState();
					if (child.geneticQuirks.dwarfism === 2 && child.geneticQuirks.gigantism !== 2) {
						child.natural.height = Height.randomAdult(child, {limitMult: [-4, -1], spread: 0.15});
					} else if (child.geneticQuirks.gigantism === 2) {
						child.natural.height = Height.randomAdult(child, {limitMult: [3, 10], spread: 0.15});
					} else {
						child.natural.height = Height.randomAdult(child);
					}
					child.natural.boobs = adjustBreastSize(child);
				}
				if (!child.natural?.boobs) {
					child.natural.boobs = adjustBreastSize(child);
				}
				App.Facilities.Nursery.InfantDatatypeCleanup(child);
				child.inbreedingCoeff = ibc.coeff(child);
			} else {
				App.Update.Slave(child);
				App.Update.SlaveDataSchemeCleanup(child);
				App.Facilities.Nursery.ChildDatatypeCleanup(child);
			}
		});
		V.cribsIndices = V.cribs.reduce((acc, child, i) => { acc[child.ID] = i; return acc; }, {});
		nurseryDiv.append(`Done!`);
	}

	// fix anything that has to do with fetuses
	V.slaves.concat([V.PC]).forEach(human => {
		human.womb.forEach(fetus => {
			// variables releated to App.Events.PregnancyNotice
			fetus.noticeData = fetus.noticeData || {};
			fetus.noticeData.fate = fetus.noticeData.fate || (() => {
				if (fetus.age < 2) {
					return (fetus.reserve !== "") ? fetus.reserve : "undecided";
				} else if (fetus.age < 6) {
					return "wait";
				} else {
					return (fetus.reserve !== "") ? fetus.reserve : "nothing";
				}
			})();
			fetus.noticeData.cheatAccordionCollapsed = fetus.noticeData.cheatAccordionCollapsed ?? true;
		});
	});

	// update clitoridal drugs
	V.slaves.concat([V.PC]).forEach(s => {
		if (s.drugs.includes("penis") && s.dick === 0 && s.vagina >= 0) {
			s.drugs = s.drugs.replace("penis", "clitoris");
		}
	});

	// if we updated from legacy to extended family mode, reset the EFM controllers
	if (V.relationLinks) {
		resetFamilyCounters();
	}

	// Jobs
	{
		V.JobIDMap = makeJobIdMap();
	}

	node.append(`Done!`);
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {string} primaryMessage
 * @param {string|undefined} [secondaryMessage=undefined]
 * @param {Node|undefined} [node=undefined]
 */
App.Update.logIssue = (primaryMessage, secondaryMessage=undefined, node=undefined) => {
	// if (node !== undefined) {
	// 	const primaryDiv = App.UI.DOM.makeElement("div");
	// 	primaryDiv.innerHTML = `&emsp;${primaryMessage}`;
	// 	primaryDiv.classList.add(["orange"]);
	// 	node.appendChild(primaryDiv);
	// 	if (secondaryMessage) {
	// 		const secondaryDiv = App.UI.DOM.makeElement("div");
	// 		secondaryDiv.innerHTML = `&emsp;&emsp;${secondaryMessage}`;
	// 		node.appendChild(secondaryDiv);
	// 	}
	// }
	console.warn(primaryMessage, secondaryMessage ? secondaryMessage : "");
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * Updates a HumanState object
 * @param {FC.HumanState} actor
 * @param {"normal"|"PC"|"detached"|"hero"|"incubator"} slaveType
 * @param {Node} [node=undefined]
 * @returns {FC.HumanState} this should be assigned to the original variable, with the exception of hero slave templates
 * @example V.PC = App.Update.human(V.PC, "PC");
 */
App.Update.human = (actor, slaveType, node=undefined) => {
	let slaveLoc = (actor.ID === -1) ? "V.PC" : "Slave";
	if (slaveType === "detached") {
		if (actor.ID === V.hostage.ID) {
			slaveLoc = "V.hostage";
		} else if (actor.ID === V.boomerangSlave.ID) {
			slaveLoc = "V.boomerangSlave";
		} else if (actor.ID === V.traitor) {
			slaveLoc = "V.traitor";
		} else if (actor.ID === V.shelterSlave) {
			slaveLoc = "V.shelterSlave";
		}
	} else if (slaveType === "hero") {
		slaveLoc = `App.Data.HeroSlaves "${actor.slaveName} ${actor.slaveSurname}" template`;
	} else if (slaveType === "incubator") {
		slaveLoc = "V.incubator.tanks";
	}

	// console.log(`Starting property migration on HumanState with ID: ${actor.ID}`);


	// ----------------------------------- delete any unneeded properties here -----------------------------------

	if (actor.ID === -1) {
		App.Utils.deleteProperties(actor, ["devotion", "sexualEnergy"]);
	}

	// before version 1241 all slaves that were created in the intro that were related to the PC got some of the variables from PlayerState
	// lets fix that
	if (V.releaseID < 1241 && actor.ID !== -1) {
		App.Utils.deleteProperties(actor, [
			"majorInjury", "criticalDamage", "newVag", "digestiveSystem", "weaningDuration", "oldEnergy", "deferredNeed",
			"sexualEnergy"
		]);
	}

	// Incubator tank slaves keep `incubatorSettings` after release
	if (slaveType !== "incubator") {
		App.Utils.deleteProperties(actor, [
			"incubatorSettings", "incubatorPregAdaptationPower", "incubatorPregAdaptationInWeek",
			// Nursery leaves variables after release
			"growTime"
		]);
	}

	// some old variable that don't belong on HumanState
	App.Utils.deleteProperties(actor, [
		"effectiveWhoreClass", "maxWhoreClass", "needCap", "milkOutput", "cumOutput", "curStillBirth",
		"lastWeeksCashExpenses", "slavesKnockedUp", "reservedChildren", "reservedChildrenNursery",
		"fertDrugs", "staminaPills", "storedCum", "slavesFathered"
	]);

	// ----------------------------------- variable assignment and fixing -----------------------------------

	if (V.releaseID < 1251) {
		if (actor.race === "catgirl" && actor.earImplant === 1) {
			actor.earImplant = 0;
			actor.earTNatural = 1;
		}
	}


	// ----------------------------------- automated beyond this point -----------------------------------
	if (slaveType !== "hero") {
		// console.log(`Adding any missing properties to HumanState with ID: ${actor.ID}`);
		const base = (actor.ID === -1) ? new App.Entity.PlayerState() : new App.Entity.SlaveState();
		_.merge(base, actor); // (deep) write values that are in actor to base overwritting as needed
		actor = base; // set actor to base, now actor has any keys that it was missing from base
	}

	const baseKeys = Object.keys((actor.ID === -1) ? new App.Entity.PlayerState() : new App.Entity.SlaveState());

	// console.log(`Checking HumanState with ID '${actor.ID}' for unexpected keys`);
	Object.keys(actor).forEach((key) => {
		if (!baseKeys.includes(key)) {
			if (key === "pornFameBonus") { return; } // TODO:@franklygeorge `pornFameBonus` is supposed to be proxied so that it doesn't end up on `SlaveState`, but it is. So figure out why and fix it
			if (key === "paraphiliaSatisfied") { return; } // TODO:@franklygeorge another proxied property that is leaking. This is from the same proxy, so maybe the proxy is broken?
			if (key === "slaveUsedRest") { return; } // TODO:@franklygeorge same and same
			if (key === "inappropriateLactation") { return; } // TODO:@franklygeorge same and same
			if (key === "fetishChanged") { return; } // TODO:@franklygeorge same
			if (key === "napkin") { return; } // TODO:@franklygeorge filter this until the way napkin gifts work is changed. Maybe make it more dynamic? Adding other gifts to `src/events/RESS/review/aGift.js`?
			// traitor and boomerang slaves (and a few others?) have a `missingParentTag` property
			if (key === "missingParentTag") { return; }
			if (["incubatorSettings", "incubatorPregAdaptationPower", "incubatorPregAdaptationInWeek"].includes(key)) { return; }

			App.Update.logIssue(
				`${slaveLoc} with ID "${actor.ID}" has an unhandled property "${key}" with the value of "${actor[key]}".`,
				undefined,
				node
			);
		}
	});

	return actor;
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * Updates HumanState objects. This includes all slaves and V.PC
 * Visually errors when there is an unexpected problem
 * @param {Node} node
 */
App.Update.humanRecords = (node) => {
	let heroSlaves = [
		// dickless slaves
		...App.Data.HeroSlaves.XX,
		...App.Data.HeroSlaves.XXFruitGirls,
		// dickless extreme slaves
		...App.Data.HeroSlaves.XXExtreme,
		...App.Data.HeroSlaves.XXFruitGirlsExtreme,
		// dicked slaves
		...App.Data.HeroSlaves.XY,
		// dicked extreme slaves
		...App.Data.HeroSlaves.XYExtreme,
	];

	// clone and clean heroSlaves
	heroSlaves = heroSlaves.map((hero) => {
		hero = clone(hero);
		App.Utils.deleteProperties(hero, [
			"removedLimbs"
		]);
		return hero;
	});

	// hero slave templates
	heroSlaves.forEach((slave) => App.Update.human(slave, "hero", node));

	// normal slaves
	V.slaves.forEach((slave) => overwriteSlave(slave.ID, App.Update.human(slave, "normal", node)));

	// detached slaves
	V.hostage = (V.hostage) ? App.Update.human(V.hostage, "detached", node) : V.hostage;
	V.boomerangSlave = (V.boomerangSlave) ? App.Update.human(V.boomerangSlave, "detached", node) : V.boomerangSlave;
	V.traitor = (V.traitor) ? App.Update.human(V.traitor, "detached", node) : V.traitor;
	V.shelterSlave = (V.shelterSlave) ? App.Update.human(V.shelterSlave, "detached", node) : V.shelterSlave;

	// incubator slaves
	V.incubator.tanks.forEach((slave, index) => V.incubator.tanks[index] = App.Update.human(slave, "incubator", node));

	// PC
	V.PC = App.Update.human(V.PC, "PC", node);

	node.append(`Done!`);
};

/**
 * @param {Node} node
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 */
App.Update.genePoolRecords = function(node) {
	Object.values(V.missingTable).forEach(s => {
		if (!jsDef(s.mother)) {
			s.mother = 0;
		}
		if (!jsDef(s.father)) {
			s.father = 0;
		}
		if (!jsDef(s.inbreedingCoeff)) {
			s.inbreedingCoeff = 0;
		}
	});

	if (!Array.isArray(V.genePool)) {
		node.append(`Done!`);
		return; // nothing to do because the gene pool has been moved to the new verification system
	}

	let ibCoeff = ibc.coeff_slaves(V.genePool);
	V.genePool.forEach(g => { g.inbreedingCoeff = ibCoeff[g.ID]; });
	V.slaveIndices = App.Update.slaves2indices(); // we're going to need to compare to active slaves, if they exist

	let playerExists = V.genePool.findIndex(p => p.ID === -1);
	if (playerExists === -1) {
		V.genePool.push(clone(V.PC));
	}
	for (let bci = 0; bci < V.genePool.length; bci++) {
		if (V.genePool[bci].ID !== -1) {
			App.Update.Slave(V.genePool[bci], true);
			let slave = V.genePool[bci];

			deduplication(slave);
			let dontDeleteMe = 0;
			if (typeof getSlave(slave.ID, true) !== "undefined") {
				/* are we still in the main slave pool? */
				dontDeleteMe = 1;
			}
			if (V.traitor !== 0) {
				if (isImpregnatedBy(V.traitor, slave, true) || V.traitor.ID === slave.ID) {
					/* did we impregnate the traitor, or are we the traitor? */
					dontDeleteMe = 1;
				}
			}
			if (V.boomerangSlave !== 0) {
				if (isImpregnatedBy(V.boomerangSlave, slave, true) || V.boomerangSlave.ID === slave.ID) {
					/* did we impregnate the boomerang, or are we the boomerang? */
					dontDeleteMe = 1;
				}
			}
			if (isImpregnatedBy(V.PC, slave, true)) {
				/* did we impregnate the PC */
				dontDeleteMe = 1;
			}
			if (dontDeleteMe === 0) {
				/* avoid going through this loop if possible */
				const slaves = V.slaves;
				for (let bci2 = 0; bci2 < slaves.length; bci2++) {
					if (isImpregnatedBy(slaves[bci2], slave, true)) {
						/* have we impregnated a slave on the slaves array? */
						dontDeleteMe = 1;
						break;
					}
				}
			}
			if (dontDeleteMe === 0) {
				V.genePool.deleteAt(bci);
				bci--;
				continue;
			}
			if (typeof slave.origSkin === "undefined") {
				slave.origSkin = slave.skin;
			}
			if (typeof slave.origRace === "undefined") {
				slave.origRace = slave.race;
			}
			if (V.releaseID < 1059) {
				if (typeof slave.eyesImplant === "undefined") {
					slave.eyesImplant = 0;
				}
				let oldEyes;
				if (slave.origEye === "implant") {
					slave.eyesImplant = 1;
					oldEyes = V.genePool.find(function(s) { return s.ID === slave.ID; });
					slave.origEye = oldEyes.origEye;
				}
				if (slave.origEye === "none") {
					slave.eyes = -3;
					oldEyes = V.genePool.find(function(s) { return s.ID === slave.ID; });
					slave.origEye = oldEyes.origEye;
				}
				if (slave.eyeColor === "empty") {
					slave.eyeColor = slave.origEye;
					slave.eyes = -4;
				}
			}

			App.Update.GenePoolRecordCleanup(slave, bci);
			V.genePool[bci] = slave;
		} else {
			App.Update.Player(V.genePool[bci], true);
			let player = V.genePool[bci];

			deduplication(player);
			if (typeof player.origSkin === "undefined") {
				player.origSkin = player.skin;
			}
			if (typeof player.origRace === "undefined") {
				player.origRace = player.race;
			}

			App.Update.GenePoolRecordCleanup(player, bci);
			V.genePool[bci] = player;
		}

		missingParentCheck(V.genePool[bci].ID, bci);
	}
	node.append(`Done!`);

	function deduplication(slave, index) {
		/* Check for duplicate IDs, keep the first entry and delete the others */
		if (V.genePool.map(function(s) { return s.ID; }).count(slave.ID) > 1) {
			for (let bci2 = index + 1; bci2 < V.genePool.length; bci2++) {
				if (V.genePool[bci2].ID === slave.ID) {
					V.genePool.deleteAt(bci2);
					bci2--;
				}
			}
		}
	}

	function missingParentCheck(slave, index) {
		// if a genepool entry doesn't have specific parent information, but the "live" copy of the same slave does, copy it into the genepool
		const liveSlave = slave;
		if (liveSlave) {
			if (liveSlave.mother && V.genePool[index].mother === 0) {
				V.genePool[index].mother = liveSlave.mother;
			}
			if (liveSlave.father && V.genePool[index].father === 0) {
				V.genePool[index].father = liveSlave.father;
			}
		}
	}
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {Node} node
 */
App.Update.RAassistantData = function(node) {
	const ruleIDs = V.defaultRules.map(rule => rule.ID);
	const slaveIDs = V.slaves.map(slave => slave.ID);
	V.defaultRules = V.defaultRules.map(rule => App.Update.RARuleDatatypeCleanup(rule));

	for (const ruleID of Object.keys(V.rulesToApplyOnce)) {
		if (!ruleIDs.includes(ruleID)) {
			delete V.rulesToApplyOnce[ruleID];
		} else {
			for (const slaveID of V.rulesToApplyOnce[ruleID]) {
				if (!slaveIDs.includes(slaveID)) {
					V.rulesToApplyOnce[ruleID].deleteAll(slaveID);
				}
			}
		}
	}

	node.append(`Done!`);
};

/**
 * @param {Node} node
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 */
App.Update.arcology = function(node) {
	if (V.continent === "Europe") {
		const prompt = App.UI.DOM.appendNewElement('div', node);
		prompt.id = "location-prompt"; // so we can replace the whole prompt later after the user clicks a link
		V.continent = "Central Europe"; // picks a valid default right now in case the user doesn't interact
		const altLocations = [
			"Southern Europe",
			"Western Europe",
			"Eastern Europe",
			"Scandinavia",
			"Central Europe"
		];
		prompt.append(`General Arcology location detected: Europe. Please specify exact location of arcology. Currently selected: ${V.continent}. Other possibilities: `,
			App.UI.DOM.generateLinksStrip(altLocations.map(l => makeLinkForLocation(l))));
	} else {
		node.append(`Done!`);
	}

	function makeLinkForLocation(l) {
		return App.UI.DOM.link(l, () => {
			V.continent = l;
			App.UI.DOM.replace("#location-prompt", `Arcology location specified at ${l}.`);
		});
	}

	if (!("weeks" in V.arcologies[0])) {
		V.arcologies[0].weeks = V.week;
	}
};

/**
 * @param {Node} node
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 */
App.Update.oldVersions = function(node) {
	V.slaves.filter(s => s.career === 0).forEach(s => s.career = "a slave");
	V.slaves.filter(s => s.origin === 0).forEach(s => s.origin = "");
	if (V.releaseID === 1021 || V.releaseID === 1020 || V.releaseID === 1019 || V.releaseID === 2022) {
		V.releaseID = 1022;
	}
	if (V.releaseID === 1043) {
		V.slaves.forEach(s => {
			if (s.skill && s.skill.whore) {
				s.skill.whoring = s.skill.whore / 2;
			}
		});
		V.tanks.forEach(s => {
			if (s.skill && s.skill.whore) {
				s.skill.whoring = s.skill.whore / 2;
			}
		});
		V.cribs.forEach(s => {
			if (s.skill && s.skill.whore) {
				s.skill.whoring = s.skill.whore / 2;
			}
		});
	}
	/* unify cybermod & vanilla */
	/* limbs */
	if (V.releaseID < 1045) {
		if (typeof V.limbs !== "undefined") {
			V.adjustProsthetics = [];
			V.limbs.forEach((l) => {
				switch (l.type) {
					case "simple":
						V.adjustProsthetics.push({id: "basicL", workLeft: l.weeksToCompletion * 10, slaveID: l.ID});
						break;
					case "sex":
						V.adjustProsthetics.push({id: "sexL", workLeft: l.weeksToCompletion * 10, slaveID: l.ID});
						break;
					case "beauty":
						V.adjustProsthetics.push({id: "beautyL", workLeft: l.weeksToCompletion * 10, slaveID: l.ID});
						break;
					case "combat":
						V.adjustProsthetics.push({id: "combatL", workLeft: l.weeksToCompletion * 10, slaveID: l.ID});
						break;
					case "cyber":
						V.adjustProsthetics.push({id: "cyberneticL", workLeft: l.weeksToCompletion * 10, slaveID: l.ID});
						break;
				}
			});
		}
		if (typeof V.limbsCompleted !== "undefined") {
			V.adjustProstheticsCompleted = V.limbsCompleted;
		}

		/* lab */
		if (typeof V.researchLab.level === "undefined") {
			V.researchLab.level = 0;
			if (typeof V.researchLab.built !== "undefined") {
				if (V.researchLab.built === "true") {
					V.researchLab.level = 1;
					if (V.prostheticsUpgrade === 0) {
						V.prostheticsUpgrade = 1;
					}
				}
				delete V.researchLab.built;
			}
		}
		if (typeof V.researchLab.speed === "undefined") {
			V.researchLab.speed = ((V.researchLab.hired * 3) + V.researchLab.menials) * V.researchLab.aiModule;
		}
		if (typeof V.researchLab.tasks === "undefined") {
			V.researchLab.tasks = [];
		}
		if (typeof V.researchLab.research !== "undefined") {
			if (V.researchLab.research !== "none") {
				let id;
				switch (V.researchLab.research) {
					case "Basic prosthetics interface":
						id = "interfaceP1";
						break;
					case "Advanced prosthetics interface":
						id = "interfaceP2";
						break;
					case "Basic prosthetic limbs":
						id = "basicL";
						break;
					case "Advanced sex limbs":
						id = "sexL";
						break;
					case "Advanced beauty limbs":
						id = "beautyL";
						break;
					case "Advanced combat limbs":
						id = "combatL";
						break;
					case "Cybernetic limbs":
						id = "cyberneticL";
						break;
					case "Ocular implants":
						id = "ocular";
						break;
					case "Cochlear implants":
						id = "cochlear";
						break;
					case "Electrolarynx":
						id = "electrolarynx";
						break;
				}
				V.researchLab.tasks.push({type: "research", id: id, workLeft: V.researchLab.productionTime});
			}
			delete V.researchLab.research;
		}
		if (typeof V.researchLab.manufacture !== "undefined") {
			if (V.researchLab.manufacture !== "none") {
				let id;
				switch (V.researchLab.manufacture) {
					case "Basic prosthetics interface":
						id = "interfaceP1";
						break;
					case "Advanced prosthetics interface":
						id = "interfaceP2";
						break;
					case "Basic prosthetic limbs":
						id = "basicL";
						break;
					case "Advanced sex limbs":
						id = "sexL";
						break;
					case "Advanced beauty limbs":
						id = "beautyL";
						break;
					case "Advanced combat limbs":
						id = "combatL";
						break;
					case "Cybernetic limbs":
						id = "cyberneticL";
						break;
					case "Ocular implants":
						id = "ocular";
						break;
					case "Cochlear implants":
						id = "cochlear";
						break;
					case "Electrolarynx":
						id = "electrolarynx";
						break;
				}
				V.researchLab.tasks.push({type: "craft", id: id, workLeft: V.researchLab.productionTime});
			}
			delete V.researchLab.manufacture;
		}
		delete V.researchLab.productionTime;

		/* stockpile */
		if (jQuery.isEmptyObject(V.prosthetics)) {
			if (!jQuery.isEmptyObject(V.stockpile)) {
				if (typeof V.stockpile.cochlearImplant === "undefined") {
					V.stockpile.cochlearImplant = 0;
				}
				if (typeof V.stockpile.electrolarynx === "undefined") {
					V.stockpile.electrolarynx = 0;
				}
				if (typeof V.stockpile.interfacePTail === "undefined") {
					V.stockpile.interfacePTail = 0;
				}
				if (typeof V.stockpile.modPTail === "undefined") {
					V.stockpile.modPTail = 0;
				}
				if (typeof V.stockpile.warPTail === "undefined") {
					V.stockpile.warPTail = 0;
				}
				if (typeof V.stockpile.sexPTail === "undefined") {
					V.stockpile.sexPTail = 0;
				}
				V.prosthetics = {
					interfaceP1: {amount: V.stockpile.basicPLimbInterface, research: V.researchLab.basicPLimbInterface},
					interfaceP2: {amount: V.stockpile.advPLimbInterface, research: V.researchLab.advPLimbInterface},
					basicL: {amount: V.stockpile.basicPLimb, research: V.researchLab.basicPLimb},
					sexL: {amount: V.stockpile.advSexPLimb, research: V.researchLab.advSexPLimb},
					beautyL: {amount: V.stockpile.advGracePLimb, research: V.researchLab.advGracePLimb},
					combatL: {amount: V.stockpile.advCombatPLimb, research: V.researchLab.advCombatPLimb},
					cyberneticL: {amount: V.stockpile.cyberneticPLimb, research: V.researchLab.cyberneticPLimb},
					ocular: {amount: V.stockpile.ocularImplant, research: V.researchLab.ocularImplant},
					cochlear: {amount: V.stockpile.cochlearImplant, research: V.researchLab.cochlearImplant},
					electrolarynx: {amount: V.stockpile.electrolarynx, research: V.researchLab.electrolarynx},
					interfaceTail: {amount: V.stockpile.interfacePTail, research: 0},
					modT: {amount: V.stockpile.modPTail, research: 0},
					combatT: {amount: V.stockpile.warPTail, research: 0},
					sexT: {amount: V.stockpile.sexPTail, research: 0},
					erectile: {amount: V.stockpile.erectileImplant, research: V.researchLab.erectileImplant}
				};
				delete V.researchLab.basicPLimbInterface;
				delete V.researchLab.advPLimbInterface;
				delete V.researchLab.basicPLimb;
				delete V.researchLab.advSexPLimb;
				delete V.researchLab.advGracePLimb;
				delete V.researchLab.advCombatPLimb;
				delete V.researchLab.cyberneticPLimb;
				delete V.researchLab.ocularImplant;
				delete V.researchLab.cochlearImplant;
				delete V.researchLab.electrolarynx;
				delete V.researchLab.erectileImplant;
			}
		}
	}
	if (V.releaseID < 1047) {
		if (V.loliGrow > 0) {
			V.loliGrow = 1;
		} else {
			V.loliGrow = 0;
		}
	}
	if (V.releaseID < 1055) {
		if (V.disableLisping === 0) {
			V.disableLisping = 1;
		} else {
			V.disableLisping = 0;
		}
	}
	if (V.releaseID < 1057) {
		node.append(`Standardizing player object... `);
		if (typeof V.PC.actualAge === "undefined") {
			if (V.PC.age === 1) {
				V.PC.actualAge = 20;
			} else if (V.PC.age === 3) {
				V.PC.actualAge = 50;
			} else {
				V.PC.actualAge = 35;
			}
		}
		if (typeof V.PC.markings === "undefined") {
			V.PC.markings = "none";
		}
		if (typeof V.PC.pregKnown === "undefined") {
			if (V.PC.preg > 0) {
				V.PC.pregKnown = 1;
			} else {
				V.PC.pregKnown = 0;
			}
		}
		if (typeof V.PC.pregWeek === "undefined") {
			if (V.PC.preg > 0) {
				V.PC.pregWeek = V.PC.preg;
			} else {
				V.PC.pregWeek = 0;
			}
		}
		if (typeof V.PC.pregType === "undefined") {
			if (V.PC.preg > 0) {
				V.PC.pregType = 1;
			} else {
				V.PC.pregType = 0;
			}
		}
		if (typeof V.PC.belly === "undefined") {
			if (V.PC.preg > 0) {
				V.PC.belly = getPregBellySize(V.PC);
			} else {
				V.PC.belly = 0;
			}
		}
		if (typeof V.PC.skin === "undefined") {
			V.PC.skin = "light";
		}
		if (typeof V.PC.origSkin === "undefined") {
			V.PC.origSkin = V.PC.skin;
		}
		if (typeof V.PC.eyeColor === "undefined") {
			V.PC.eyeColor = "blue";
		}
		if (typeof V.PC.origEye === "undefined") {
			V.PC.origEye = V.PC.eyeColor;
		}
		if (typeof V.PC.pupil === "undefined") {
			if (V.PC.eyeColor === "catlike") {
				V.PC.pupil = "catlike";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "serpent-like") {
				V.PC.pupil = "serpent-like";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "devilish") {
				V.PC.pupil = "devilish";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "demonic") {
				V.PC.pupil = "demonic";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "hypnotic") {
				V.PC.pupil = "hypnotic";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "heart-shaped") {
				V.PC.pupil = "heart-shaped";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "wide-eyed") {
				V.PC.pupil = "wide-eyed";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "almond-shaped") {
				V.PC.pupil = "almond-shaped";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "bright") {
				V.PC.pupil = "bright";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "teary") {
				V.PC.pupil = "teary";
				V.PC.eyeColor = "blue";
			} else if (V.PC.eyeColor === "vacant") {
				V.PC.pupil = "vacant";
				V.PC.eyeColor = "blue";
			} else {
				V.PC.pupil = "circular";
			}
		}
		if (typeof V.PC.sclerae === "undefined") {
			V.PC.sclerae = "white";
		}
		if (typeof V.PC.race === "undefined") {
			V.PC.race = "white";
		}
		if (typeof V.PC.origRace === "undefined") {
			V.PC.origRace = V.PC.race;
		}
		if (typeof V.PC.hColor === "undefined") {
			V.PC.hColor = "blonde";
		}
		if (typeof V.PC.origHColor === "undefined") {
			V.PC.origHColor = V.PC.hColor;
		}
		if (typeof V.PC.nationality === "undefined") {
			V.PC.nationality = "Stateless";
		}
		if (V.PC.boobsBonus === -0.5) {
			V.PC.boobsBonus = -1;
		}
		if (typeof V.PC.sclerae === "undefined") {
			V.PC.sclerae = "white";
		}
		if (typeof V.PC.fetish === "undefined") {
			V.PC.fetish = "none";
		}
		if (typeof V.PC.behavioralFlaw === "undefined") {
			V.PC.behavioralFlaw = "none";
		}
		if (typeof V.PC.behavioralQuirk === "undefined") {
			V.PC.behavioralQuirk = "none";
		}
		if (typeof V.PC.sexualFlaw === "undefined") {
			V.PC.sexualFlaw = "none";
		}
		if (typeof V.PC.sexualQuirk === "undefined") {
			V.PC.sexualQuirk = "none";
		}
		if (typeof V.PC.pubicHStyle === "undefined") {
			V.PC.pubicHStyle = "hairless";
		}
		if (typeof V.PC.underArmHStyle === "undefined") {
			V.PC.underArmHStyle = "hairless";
		}
		if (typeof V.PC.eggType === "undefined") {
			V.PC.eggType = "human";
		}
		if (typeof V.PC.ballType === "undefined") {
			V.PC.ballType = "human";
		}
		if (V.releaseID < 1032) {
			if (V.PC.pregSource === -1) {
				V.PC.pregSource = -6;
			} else if (V.PC.pregSource === -2) {
				V.PC.pregSource = -5;
			} else if (V.PC.pregSource === -6) {
				V.PC.pregSource = -1;
			} else if (V.PC.pregSource === -5) {
				V.PC.pregSource = -2;
			}
		}
		if (typeof V.PC.genes === "undefined") {
			if (V.PC.title === 1) {
				V.PC.genes = "XY";
			} else {
				V.PC.genes = "XX";
			}
		}

		/* player object converter */
		let newPC = basePlayer();
		newPC.slaveName = V.PC.name;
		newPC.slaveSurname = V.PC.surname;
		newPC.birthName = V.PC.name;
		if (V.PC.slaveSurname) {
			newPC.birthSurname = V.PC.surname;
		} else {
			newPC.birthSurname = "";
		}
		newPC.title = V.PC.title;
		newPC.genes = V.PC.genes;
		newPC.career = V.PC.career;
		newPC.rumor = V.PC.rumor;
		newPC.birthWeek = V.PC.birthWeek;
		newPC.refreshment = V.PC.refreshment;
		newPC.refreshmentType = V.PC.refreshmentType;
		newPC.actualAge = V.PC.actualAge;
		newPC.physicalAge = V.PC.physicalAge;
		newPC.visualAge = V.PC.visualAge;
		newPC.ovaryAge = V.PC.ovaryAge;
		newPC.ageImplant = V.PC.ageImplant;
		newPC.nationality = V.PC.nationality;
		newPC.race = V.PC.race;
		newPC.origRace = V.PC.origRace;
		newPC.skin = V.PC.skin;
		newPC.origSkin = V.PC.origSkin;
		newPC.markings = V.PC.markings;
		newPC.hColor = V.PC.hColor;
		newPC.origHColor = V.PC.origHColor;
		newPC.eye.origColor = V.PC.origEye;
		newPC.eye.left.iris = V.PC.eyeColor;
		newPC.eye.left.pupil = V.PC.pupil;
		newPC.eye.left.sclera = V.PC.sclerae;
		newPC.eye.right.iris = V.PC.eyeColor;
		newPC.eye.right.pupil = V.PC.pupil;
		newPC.eye.right.sclera = V.PC.sclerae;
		newPC.faceShape = V.PC.faceShape;
		newPC.skill.trading = V.PC.trading;
		newPC.skill.warfare = V.PC.warfare;
		newPC.skill.hacking = V.PC.hacking;
		newPC.skill.slaving = V.PC.slaving;
		newPC.skill.engineering = V.PC.engineering;
		newPC.skill.medicine = V.PC.medicine;
		newPC.skill.cumTap = V.PC.cumTap;
		newPC.father = V.PC.father;
		newPC.mother = V.PC.mother;
		newPC.sisters = V.PC.sisters;
		newPC.daughters = V.PC.daughters;
		newPC.counter.birthsTotal = V.PC.births;
		newPC.counter.birthElite = V.PC.birthElite;
		newPC.counter.birthMaster = V.PC.birthMaster;
		newPC.counter.birthDegenerate = V.PC.birthDegenerate;
		newPC.counter.birthClient = V.PC.birthClient;
		newPC.counter.birthArcOwner = V.PC.birthArcOwner;
		newPC.counter.birthCitizen = V.PC.birthCitizen;
		newPC.counter.birthFutaSis = V.PC.birthFutaSis;
		newPC.counter.birthSelf = V.PC.birthSelf;
		newPC.counter.birthLab = V.PC.birthLab;
		newPC.counter.birthOther = V.PC.birthOther;
		if (typeof V.PC.laborCount !== "undefined") {
			newPC.counter.laborCount = V.PC.laborCount;
		}
		newPC.counter.slavesFathered = V.PC.slavesFathered;
		newPC.counter.slavesKnockedUp = V.PC.slavesKnockedUp;
		newPC.counter.storedCum = V.PC.storedCum;
		newPC.preg = V.PC.preg;
		newPC.pregType = V.PC.pregType;
		newPC.pregWeek = V.PC.pregWeek;
		newPC.pregKnown = V.PC.pregKnown;
		newPC.fertKnown = V.PC.fertKnown;
		newPC.fertPeak = V.PC.fertPeak;
		newPC.forcedFertDrugs = V.PC.forcedFertDrugs;
		newPC.belly = V.PC.belly;
		newPC.bellyPreg = V.PC.bellyPreg;
		newPC.pregSource = V.PC.pregSource;
		newPC.pregMood = V.PC.pregMood;
		newPC.labor = V.PC.labor;
		newPC.badRumors.birth = V.PC.badRumors.birth;
		newPC.badRumors.penetrative = V.PC.badRumors.penetrative;
		newPC.badRumors.weakness = V.PC.badRumors.weakness;
		newPC.pubicHStyle = V.PC.pubicHStyle;
		newPC.underArmHStyle = V.PC.underArmHStyle;
		if (V.PC.dick === 1) {
			newPC.dick = 4;
			newPC.prostate = 1;
			if (V.PC.ballsImplant === 4 || V.PC.balls === 4) {
				newPC.balls = 30;
				newPC.scrotum = 7;
			} else if (V.PC.ballsImplant === 3 || V.PC.balls === 3) {
				newPC.balls = 14;
				newPC.scrotum = 6;
			} else if (V.PC.ballsImplant === 2 || V.PC.balls === 2) {
				newPC.balls = 9;
				newPC.scrotum = 5;
			} else if (V.PC.ballsImplant === 1 || V.PC.balls === 1) {
				newPC.balls = 5;
				newPC.scrotum = 4;
			} else {
				newPC.balls = 3;
				newPC.scrotum = 3;
			}
			if (V.PC.ballsImplant > 0) {
				newPC.ballsImplant = newPC.balls - 3;
			}
		} else {
			newPC.dick = 0;
			newPC.prostate = 0;
			newPC.balls = 0;
			newPC.scrotum = 0;
		}
		newPC.newVag = V.PC.newVag;
		if (V.PC.vagina === 1) {
			newPC.ovaries = 1;
			newPC.vaginaLube = 1;
			if (V.PC.newVag === 1) {
				newPC.vagina = 1;
			} else if (V.PC.career === "escort" || V.PC.birthsTotal >= 10 || V.PC.career === "servant") {
				newPC.vagina = 4;
			} else if (V.PC.birthsTotal > 2) {
				newPC.vagina = 3;
			} else if (V.PC.career === "gang" || V.PC.career === "celebrity" || V.PC.career === "wealth" || V.PC.birthsTotal > 0) {
				newPC.vagina = 2;
			} else {
				newPC.vagina = 1;
			}
		}
		if (V.PC.boobs === 1) {
			if (V.PC.boobsBonus === -3) {
				newPC.boobs = 400;
			} else if (V.PC.boobsBonus === -2) {
				newPC.boobs = 500;
			} else if (V.PC.boobsBonus === -1) {
				newPC.boobs = 700;
			} else if (V.PC.boobsBonus === 1) {
				newPC.boobs = 1100;
			} else if (V.PC.boobsBonus === 2) {
				newPC.boobs = 1300;
			} else if (V.PC.boobsBonus === 3) {
				newPC.boobs = 1500;
			} else {
				newPC.boobs = 900;
			}
		} else if (V.PC.genes === "XX") {
			newPC.boobs = 200;
		} else {
			newPC.boobs = 100;
		}
		if (V.PC.boobsImplant === 1) {
			newPC.boobsImplant = newPC.boobs - 900;
		}
		newPC.lactation = V.PC.lactation;
		newPC.lactationDuration = V.PC.lactationDuration;
		newPC.genes = V.PC.genes;
		if (V.PC.butt === 3) {
			newPC.butt = 5;
		} else if (V.PC.butt === 2) {
			newPC.butt = 4;
		} else if (V.PC.butt === 1) {
			newPC.butt = 3;
		} else {
			newPC.butt = 2;
		}
		if (V.PC.buttImplant === 1) {
			newPC.buttImplant = newPC.butt - 2;
		}
		newPC.geneticQuirks = clone(V.PC.geneticQuirks);
		if (V.arcologies[0].FSPhysicalIdealist !== null) {
			newPC.muscles = 100;
		} else if (V.PC.title === 1) {
			newPC.muscles = 50;
		} else {
			newPC.muscles = 30;
		}
		if (V.PC.title === 0) {
			newPC.hLength = 15;
			newPC.waist = -20;
			newPC.voice = 2;
			newPC.shoulders = -1;
			newPC.hips = 1;
		}
		if (V.PC.career === "escort") {
			newPC.anus = 1;
			newPC.clothes = "a slutty outfit";
			newPC.intelligenceImplant = 15;
		} else if (V.PC.career === "servant") {
			newPC.clothes = "a nice maid outfit";
			newPC.intelligenceImplant = 0;
		}
		if (typeof V.PCWounded !== "undefined") {
			newPC.majorInjury = V.PCWounded;
		}
		if (typeof V.girls !== "undefined") {
			if (V.girls === 1) {
				newPC.rules.living = "spare";
			} else if (V.girls === 2) {
				newPC.rules.living = "normal";
			} else {
				newPC.rules.living = "luxurious";
			}
		}
		if (typeof V.playerGetsMilked !== "undefined") {
			if (V.playerGetsMilked === 2) {
				newPC.rules.lactation = "sell";
			} else if (V.playerGetsMilked === 1) {
				newPC.rules.lactation = "maintain";
			}
		}

		V.PC = clone(newPC);

		if (typeof V.PC.name === "undefined") {
			if (typeof V.PCName !== "undefined") {
				V.PC.name = V.PCName;
			}
		}
		if (typeof V.PC.surname === "undefined") {
			V.PC.surname = 0;
		}
		if (typeof V.PC.faceShape === "undefined") {
			V.PC.faceShape = "normal";
		}
	}
	if (V.releaseID < 1123) {
		// old PC eye state enumerations didn't match, but the player couldn't change PC's vision, so just overwrite it with the correct "normal" value
		V.PC.eye.left.vision = 2;
		V.PC.eye.right.vision = 2;
		// remove old compatibility state
		delete V.PC.origEye;
	}
	if (typeof V.PC.spermY === "undefined") {
		V.PC.spermY = 50; // exactly
	}
	if (V.releaseID < 1175) {
		V.PC.earTEffectColor = "none";
		V.PC.earTEffect = "none";
		V.PC.tailEffectColor = "none";
		V.PC.tailEffect = "none";
		V.PC.PBack = 0;
		V.PC.wingsShape = "none";
		V.PC.appendagesColor = "none";
		V.PC.appendagesEffectColor = "none";
		V.PC.appendagesEffect = "none";
		V.PC.patternColor = "black";
		V.PC.hEffectColor = "none";
		V.PC.hEffect = "none";
		V.PC.haircuts = 0;
	}
	if (V.releaseID < 1184) {
		if (V.PC.career === "arcology owner") {
			V.PC.skill.combat = 100;
		} else if (V.PC.career === "mercenary") {
			V.PC.skill.combat = 70;
		} else if (V.PC.career === "recruit" || V.PC.career === "slaver" || V.PC.career === "gang") {
			V.PC.skill.combat = 50;
		} else if (V.PC.career === "child soldier" || V.PC.career === "slave overseer" || V.PC.career === "hoodlum" || V.personalArms > 0) {
			V.PC.skill.combat = 30;
		} else if (V.PC.career === "street urchin") {
			V.PC.skill.combat = 10;
		}
	}

	if (V.releaseID < 1185) {
		if (V.nurseryNannies > 0) {
			V.nurseryCribs = V.nursery;
			V.nursery = V.nurseryNannies;
			V.nurseryNannies = 0;
		}
	}

	if (V.releaseID < 1195) {
		V.RECheckInIDs = [];
		if (V.REFeminizationCheckinIDs.length > 0) {
			V.REFeminizationCheckinIDs.forEach((s) => { V.RECheckInIDs.push({ID: s, type: "feminization"}); });
		}
		if (V.REMILFCheckinIDs.length > 0) {
			V.REMILFCheckinIDs.forEach((s) => { V.RECheckInIDs.push({ID: s, type: "MILF"}); });
		}
		if (V.REOrientationCheckinIDs.length > 0) {
			V.REOrientationCheckinIDs.forEach((s) => { V.RECheckInIDs.push({ID: s, type: "orientation"}); });
		}
		if (V.REUglyCheckinIDs.length > 0) {
			V.REUglyCheckinIDs.forEach((s) => { V.RECheckInIDs.push({ID: s, type: "ugly"}); });
		}
		if (V.REButtholeCheckinIDs.length > 0) {
			V.REButtholeCheckinIDs.forEach((s) => { V.RECheckInIDs.push({ID: s, type: "butthole"}); });
		}
		if (V.REFutaSisterCheckinIDs.length > 0) {
			V.REFutaSisterCheckinIDs.forEach((s) => { V.RECheckInIDs.push({ID: s, type: "futa"}); });
		}
		if (V.REReductionCheckinIDs.length > 0) {
			V.REReductionCheckinIDs.forEach((s) => { V.RECheckInIDs.push({ID: s, type: "reduction"}); });
		}
	}

	if (V.releaseID < 1198 && V.geneticMappingUpgrade > 0) {
		V.geneticMappingUpgrade++;
	}

	if ((typeof V.familyTesting === "undefined") && V.releaseID < 1065) {
		// possibly vanilla FC; compel V.familyTesting to 0 so that the family upgrade will run on slaves
		V.familyTesting = 0;
	}
	if (V.familyTesting === 0) {
		V.limitFamilies = 1;
		V.relationLinks = {}; // init temp structure for mapping relationships from legacy to extended family mode
	}
	if (V.releaseID <= 1116 && V.pregnancyMonitoringUpgrade === 3) {
		V.pregnancyMonitoringUpgrade = 1;
	}
	// assume we're caught up on plot events if we were running the old plot event system
	if (V.releaseID <= 1123) {
		V.plotEventWeek = App.Events.effectiveWeek();
	}
	if (V.releaseID <= 1198) {
		if (V.imageChoice === 0) { // because randomly changing shit that was working just fine (and breaking people's saves with it) is actually a bad idea
			V.imageChoice = 5;
		}
	}
	if (V.releaseID < 1207) {
		V.slaves.forEach(s => {
			if (s.geneMods.NCS === 1 || (s.geneticQuirks.neoteny >= 2 && s.geneticQuirks.progeria !== 2)) {
				s.ovaryAge = Math.max(s.ovaryAge, Math.min(s.physicalAge * 0.5, s.physicalAge - 2, 45));
			} else {
				s.ovaryAge = Math.max(s.ovaryAge, Math.min(s.physicalAge * 0.8, s.physicalAge - 2, 45));
			}
		});
	}
	if (V.releaseID < 1252) {
		// Events Control
		{
			if (typeof V.RIEPerWeek !== "undefined") {
				V.eventControl = {
					RIEPerWeek: V.RIEPerWeek || 1,
					RIERemaining: V.RIERemaining ?? 0,
					RIESkip: V.RIESkip ?? [],
					level: 0,
					otherTrack: false,
					events: [],
				};
				delete V.RIEPerWeek;
				delete V.RIERemaining;
				delete V.RIESkip;
			}
		}
	}
	if (V.releaseID < 1253) {
		V.aiAgeFilter = true;
	}
	node.append(`Done!`);
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {Node} node
 */
App.Update.FCNN = function(node) {
	// the game state should not contain any FCNN headlines that we can generate dynamically
	V.fcnn = _.difference(V.fcnn, App.FCNN.getAllValidText(false));
	node.append(`Done!`);
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {Node} node
 */
App.Update.cleanUp = function(node) {
	/* leave this at the bottom of BC */
	// if (V.releaseID < App.Version.release) {
	// 	V.releaseID = App.Version.release;
	// } // BC is now a legacy patch. We don't want it to change the releaseID
	// /* reset NaNArray */
	// V.NaNArray = findNaN();
	node.append(`Done!`);
};

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 */
App.Update.sectorsToBuilding = function() {
	V.building = new App.Arcology.Building(V.terrain, []);
	const B = V.building;
	const S = V.sectors;

	B.sections.push(new App.Arcology.Section("penthouse", [
		[new App.Arcology.Cell.Penthouse()]
	]));
	if (V.arcologyUpgrade.spire === 1) {
		B.sections.push(new App.Arcology.Section("spire", [
			[
				sectorToApartment(S[1]), sectorToApartment(S[2])
			],
			[
				sectorToApartment(S[3]), sectorToApartment(S[4])
			]
		]));
	}
	B.sections.push(new App.Arcology.Section("apartments",
		[
			[sectorToApartment(S[8]), sectorToApartment(S[9]), sectorToApartment(S[10]), sectorToApartment(S[11])],
			[sectorToApartment(S[12]), sectorToApartment(S[13]), sectorToApartment(S[14]), sectorToApartment(S[15])],
			[sectorToApartment(S[16]), sectorToApartment(S[17]), sectorToApartment(S[18]), sectorToApartment(S[19])],
		]));

	function sectorToApartment(sector) {
		const a = new App.Arcology.Cell.Apartment(sector.ownership);
		if (sector.type === "LuxuryApartments") {
			a.type = 1;
		} else if (sector.type === "DenseApartments") {
			a.type = 3;
		}
		return a;
	}

	B.sections.push(new App.Arcology.Section("shops", [
		[sectorToShop(S[5]), sectorToShop(S[6]), sectorToShop(S[7])]
	]));

	function sectorToShop(sector) {
		return new App.Arcology.Cell.Shop(sector.ownership, sector.type);
	}

	B.sections.push(new App.Arcology.Section("markets",
		[
			[sectorToMarket(S[20]), sectorToMarket(S[21]), sectorToMarket(S[22]), sectorToMarket(S[23]), sectorToMarket(S[24])]
		]));

	function sectorToMarket(sector) {
		const m = new App.Arcology.Cell.Market(sector.ownership);
		if (sector.type === "transportHub") {
			m.type = "Transport Hub";
		} else if (sector.type === "CorporateMarket") {
			m.type = "Corporate Market";
		} else {
			m.type = sector.type;
		}
		return m;
	}

	B.sections.push(new App.Arcology.Section("manufacturing",
		[
			[sectorToManu(S[25]), sectorToManu(S[26]), sectorToManu(S[27]), sectorToManu(S[28]), sectorToManu(S[29])]
		]));

	function sectorToManu(sector) {
		const m = new App.Arcology.Cell.Manufacturing(sector.ownership);
		if (sector.type === "weapManu") {
			m.type = "Weapon Manufacturing";
		} else {
			m.type = sector.type;
		}
		return m;
	}
};
