
// A whitelist for ingame variables. Used to init the game or fill in gaps. Also used as a whitelist. Anything not on this list will be removed on BC.
App.Data.defaultGameStateVariables = {
	/**
	 * This is used to hold data during passage transitions.
	 * The contents of this object are reset near the end of {@link App.EndWeek.nextWeek}() right before autosaving happens
	 * @type {FC.TransitionObject}
	 */
	temp: {},
	// Page
	nextButton: "Continue",
	nextLink: "Alpha disclaimer",
	storedLink: "",
	/**
	 * Stores the traveled passages since the "Main" passage.
	 * Gets reset by the main passage.
	 * See {@link lastPassage} and {@link App.Utils.passageHistoryCleanup}
	 * @type {string[]}
	 */
	passageHistory: [],

	// Version
	ver: "",
	pmodVer: "",
	commitHash: "",
	/**
	 * @type {number} used for patching
	 * See {@link App.Patch.applyAll}
	 */
	releaseID: 0,

	// Slaves
	/** @type {ReadonlyMap<FC.HumanID, Readonly<FC.SlaveState>>} */
	slaves: new Map(),
	/** @type {ReadonlyMap<FC.HumanID, Readonly<FC.InfantState>>} Array of infants in the Nursery */
	cribs: new Map(),
	/**
	 * @readonly
	 * Each slave and the player gets a genepool record when they are created
	 * The records stored here are missing default values! Use the {@link getGenePoolRecord}() function to retrieve them
	 * Do not access this directly. Use {@link addToGenePool}() to add records
	 * @type {Readonly<{[key: string]: Readonly<Partial<FC.GenePoolRecord>>}>}
	 */
	genePool: {},
	/**
	 * @readonly
	 * @type {Readonly<FC.GenePoolRecord>} used by {@link getGenePoolRecord}() to fill in missing defaults
	 * Also see {@link addToGenePool}
	 */
	genePoolDefaults: undefined,
	/** @type {Record<FC.HumanID, FC.MissingParentRecord>} */
	missingTable: {},
	detached: {
		traitor: {
			/** @type {FC.Zeroable<FC.SlaveState>} */
			actor: 0,
			/** @type {FC.Zeroable<string>} */
			type: 0,
			/** @type {number} */
			weeks: 0,
			/** @type {{PCpregSource?: FC.HumanState["pregSource"], PCmother?: FC.HumanID, PCfather?: FC.HumanID, traitorMother?: FC.HumanID[], traitorFather?: FC.HumanID[], traitorPregSources?: FC.HumanState["pregSource"][], traitorMotherTank?: FC.HumanID[], traitorFatherTank?: FC.HumanID[], traitorBody?: FC.HumanID, missingParentTag?: FC.HumanID}} */
			stats: {},
		},
		hostage: {
			/** @type {FC.Zeroable<FC.SlaveState>} */
			actor: 0,
			/** @type {FC.Zeroable<FC.SlaveState>} */
			wife: 0,
		},
		shelter: {
			/** @type {FC.Zeroable<FC.SlaveState>} */
			actor: 0,
			/** @type {FC.Bool} */
			bought: 0,
		},
		boomerang: {
			/** @type {FC.Zeroable<FC.SlaveState>} */
			actor: 0,
			/** @type {FC.Zeroable<string>} */
			buyer: 0,
			/** @type {number} */
			weeks: 0,
			/** @type {{PCpregSource?: FC.HumanState["pregSource"], PCmother?: FC.HumanID, PCfather?: FC.HumanID, boomerangMother?: FC.HumanID[], boomerangFather?: FC.HumanID[], boomerangPregSources?: FC.HumanState["pregSource"][], boomerangMotherTank?: FC.HumanID[], boomerangFatherTank?: FC.HumanID[], boomerangRelationship?: FC.HumanID, boomerangRivalry?: FC.HumanID, boomerangBody?: FC.HumanID, missingParentTag?: FC.HumanID}} */
			stats: {},
		},
	},

	// PC
	/** @type {FC.PlayerState} */
	PC: null,
	freshPC: 0,
	IsInPrimePC: 3,
	IsPastPrimePC: 5000,
	playerAging: 2,
	/** @type {FC.Zeroable<FC.SlaveState>} the enslaved PC from the last play through */
	// TODO: This needs to find some way to survive refresh/new game without showing up on all saves
	// TODO: This needs implemented, as it is currently unimplemented
	// TODO: See https://gitgud.io/pregmodfan/fc-pregmod/-/merge_requests/11956#note_391478
	slavePC: 0,

	// NGP
	saveImported: 0,
	customVariety: 0,
	nationalities: {},

	// Other
	cheater: 0,
	cash: 0,
	cashLastWeek: 0,
	lastCashTransaction: 0,
	taintedSaveFile: 0,

	// UI content
	UI: {
		slaveSummary: {
			abbreviation: {
				clothes: 2,
				devotion: 2,
				beauty: 2,
				diet: 2,
				drugs: 2,
				genitalia: 2,
				health: 2,
				hormoneBalance: 2,
				mental: 2,
				nationality: 2,
				origins: 2,
				physicals: 2,
				race: 2,
				rules: 2,
				rulesets: 2,
				skills: 2,
			}
		},
		compressSocialEffects: 0
	},
	/** @type {App.Markets.Global|null} */
	market: null,
	FSNamePref: 0,
	HGFormality: 1,
	HGSeverity: 0,
	HGPiercings: 1,
	abbreviateSidebar: 1,
	adamPrinciple: 0,
	allowFamilyTitles: 0,
	allowMaleSlaveNames: false,
	autosave: 1,
	baseDifficulty: 3,
	dangerousPregnancy: 0,
	debugMode: 0,
	debugModeCustomFunction: 0,
	debugModeEventSelection: 0,
	/** @type {FC.Bool} If true then the patching system will report any changes that happen */
	reportVerificationChanges: 0,
	difficultySwitch: 0,
	disableLisping: 0,
	displayAssignments: 1,
	expansionRequestsAllowed: 1,
	extremeUnderage: 0,
	formatNumbers: 1,
	fucktoyInteractionsPosition: 1,
	slaveInteractLongForm: false,
	slaveInteractHideLabels: false,
	headGirlSoftensFlaws: 1,
	headGirlTrainsFlaws: 1,
	headGirlOverridesQuirks: 0,
	headGirlTrainsHealth: 1,
	headGirlTrainsObedience: 1,
	headGirlTrainsParaphilias: 1,
	headGirlTrainsSkills: 1,
	/**
	 * | ***Value*** | **Description** 				|
	 * |------------:|:-----------------------------|
	 * | *1*    	 | NoX/Deepmurk's vector art    |
	 * | *2*    	 | Non-embedded vector art      |
	 * | *3*    	 | Revamped embedded vector art |
	 * | *4*    	 | Elohiem's WebGL              |
	 * | *5*    	 | Shokushu's rendered          |
	 * | *6*    	 | Anon's AI image generation   |
	 */
	imageChoice: 1,
	inbreeding: 1,
	lastBDayEvent: -1,
	endweekSaveWarning: 1,
	/** @type {'link'|'button'} */
	purchaseStyle: 'link',
	limitFamilies: 0,
	makeDicks: 0,
	modRequestsAllowed: 1,
	neighboringArcologies: 3,
	neighborDisplay: "list",
	newDescriptions: 0,
	newModelUI: 1,
	ngpParams: {},
	nicknamesAllowed: 1,
	positionMainLinks: -1,
	profiler: 0,
	realRoyalties: 0,
	retainCareer: 1,
	rulesAssistantAuto: 0,
	rulesAssistantFacilitiesAutosurgery: true,
	rulesAssistantMain: 1,
	seeAge: 1,
	seeArcology: 1,
	seeAvatar: 1,
	seeBestiality: 0,
	seeCats: 0,
	seeCircumcision: 1,
	seeCustomImagesOnly: 0,
	seeDesk: 1,
	seeDetails: 1,
	seeDicks: 25,
	seeDicksAffectsPregnancy: 1,
	seeRandomHair: 1,
	seeExtreme: 0,
	seeFaces: 1,
	seeFCNN: 1,
	seeHeight: 0,
	seeHyperPreg: 0,
	seeIllness: 1,
	seeImages: 0,
	seeIncest: 1,
	seeMainFetishes: 0,
	seeNationality: 1,
	seePee: 1,
	seePreg: 1,
	seeRace: 1,
	seeReportImages: 1,
	seeStretching: 1,
	seeSummaryImages: 1,
	seeVectorArtHighlights: 1,
	setSuperSampling: 2,
	setZoomSpeed: 1,
	setPanSpeed: 1,
	setRotationSpeed: 1,
	setDefaultView: 1,
	setAutoFrame: 0,
	setFaceCulling: true,
	setTextureResolution: 1024,
	setShadowMapping: true,
	setSSAO: true,
	setSSS: true,
	setImageSize: 1.25,
	set3QView: false,
	seeAnimation: false,
	animFPS: 12,

	// Tracking random events
	eventControl: {
		/** @type {number}
		 * Random individual events to play each week
		 */
		RIEPerWeek: 1,
		/** @type {number[]}
		 * Slaves who have starred in random individual events the current week
		 */
		RIESkip: [],
		/** @type {number}
		 * Random individual events remaining the current week
		 */
		RIERemaining: 0,
		/** @type {number}
		 * Number of weeks to track events
		 * 0: no tracking,
		 * 2: soft,
		 * 4: medium,
		 * 8: high
		 */
		level: 0,
		/** @type {boolean}
		 * Track also other random events
		 */
		otherTrack: false,
		/** @type {{name: string, weeksPassed: number, triggered: number}[]}
		 * Events tracked in the tracking period
		 */
		events: [],
	},

	// Stable Diffusion settings
	aiFaceDetailer: false,
	aiApiUrl: "http://localhost:7860",
	aiAutoGen: true,
	aiAutoGenFrequency: 10,
	aiQueueOverlay: 1,
	aiUseRAForEvents: false,
	aiCfgScale: 5,
	aiTimeoutPerStep: 5,
	aiChat: 0,
	aiChatUrl: "http://localhost:5000/v1/chat/completions",
	aiChatTemp: 0.5,
	aiChatMinP: 0.05,
	/** @type {'static' | 'reactive'} */
	aiCachingStrategy: 'static',
	aiCustomImagePrompts: 0,
	aiCustomStyleNeg: "",
	aiCustomStylePos: "",
	aiDynamicCfgEnabled: false,
	aiDynamicCfgMimic: 6,
	aiDynamicCfgMinimum: 4,
	aiLoraPack: true,
	aiDisabledLoRAs: [],
	aiNationality: 2,
	/**
	 * * 1: Hormone balance
	 * * 2: Perceived gender
	 * * 3: Pronouns
	 */
	aiGenderHint: 1,
	/**
	 * * 0 = Disabled
	 * * 1 = Assignment Backgrounds
	 * * 2 = Outfit based
	 * @type {0 | 1 | 2}
	 */
	aiLocationBackgrounds: 0,
	aiOpenPose: false,
	aiOpenPoseModel: "",
	aiSamplingMethod: "DPM++ 2M SDE",
	aiSamplingSteps: 28,
	aiSamplingStepsEvent: 28,
	/**
	 * * 0 = Custom
	 * * 1 = Photorealistic
	 * * 2 = Anime/Hentai
	 * * 3 = None
	 * @type {0|1|2|3}
	 */
	aiStyle: 3,
	aiSchedulingMethod: 'Karras',
	aiRestoreFaces: false,
	aiUpscale: false,
	aiUpscaleScale: 1.75,
	aiUpscaler: "SwinIR_4x",
	aiCheckpoint: "majicmixRealistic_v6.safetensors",
	aiCustomWorkflow: "",
	/**
	 * * 0: A1111's Web-Ui
	 * * 1: ComfyUi
	 */
	aiUserInterface: 0,
	/**
	 * * 0: SD 1.X
	 * * 1: SDXL
	 * * 2: Pony
	 * * 3: SD 3 - Unimplemented
	 * * 4: Flux.1 - Unimplemented
	 * * 5: Flow - Unimplemented
	 * * 6: Illustrious
	 * @type {0 | 1 | 2 | 6}
	 */
	aiBaseModel: 0,
	/**
	 * * 0: Simple ComfyUI
	 * * 1: Custom ComfyUI
	 * * 2: BreezeIndigo's Pony Diffusion
	 * @type {0 | 1 | 2}
	 */
	aiPrebuiltWorkflow: 0,
	aiPonyTurbo: false,
	aiPonyLoraStack: `{ "Styles\\Concept Art DarkSide Style LoRA_Pony XL v6.safetensors": 0.5, "Styles\\Digital Art Style SDXL_LoRA_Pony Diffusion V6 XL.safetensors": 0.2, "Styles\\Photo 2 Style SDXL_LoRA_Pony Diffusion V6 XL.safetensors": 0.2 }`,
	aiHeight: 640,
	aiWidth: 384,
	aiAgeFilter: true,
	customClothesPrompts: {},

	showAgeDetail: 1,
	showAppraisal: 1,
	showAssignToScenes: 1,
	showBodyMods: 1,
	showBoobCCs: 1,
	showPotentialSizes: 1,
	showClothing: 1,
	showDickCMs: 1,
	showDistantRelatives: 0,
	showEWD: 1,
	showEWM: 1,
	showEconomicDetails: 0,
	showHeightCMs: 1,
	showImplantEffects: 1,
	showInches: 1,
	/** show missing slave names */
	showMissingSlaves: true,
	racialAttractivenessBonus: 1,
	/** show missing parent names. V.showMissingSlaves must also be true */
	showMissingSlavesSD: true,
	showNeighborDetails: 1,
	/**
	 * | ***Value*** | **Description** |
	 * |------------:|:----------------|
	 * | *0*         | Words only      |
	 * | *1*	     | Both            |
	 * | *2*    	 | Numbers only    |
	 */
	showNumbers: 2,
	showNumbersMax: 20,
	showScores: 1,
	showSexualHistory: 1,
	showTipsFromEncy: 1,
	showVignettes: 1,
	slavePanelStyle: 1,
	sortSlavesBy: "devotion",
	sortSlavesMain: 1,
	sortSlavesOrder: "descending",
	summaryStats: 0,
	surnameArcology: "",
	surnameOrder: 0,
	surnamePCOverride: 0,
	surnameScheme: 0,
	/** @type {{[key: string]: string}} */
	tabChoice: {Main: "penthouse"},
	universalRulesAssignsSelfFacility: 0,
	universalRulesBirthing: 0,
	universalRulesCSec: 0,
	universalRulesChildrenBecomeBreeders: 0,
	universalRulesConsent: 0,
	universalRulesFacilityWork: 1,
	universalRulesImmobileSlavesMaintainMuscles: 0,
	/** @type {"none" | "HG" | "PC" | "Stud" | "Slaves" | "Citizens"} */
	universalRulesImpregnation: "none",
	universalRulesSuperfetationImpregnation: 0,
	universalRulesNewSlavesRA: 1,
	useAccordion: 1,
	favSeparateReport: 0,
	useFSNames: 1,
	useSlaveListInPageJSNavigation: 0,
	useSlaveSummaryOverviewTab: 0,
	useSlaveSummaryTabs: 0,
	useSlaveArcologyTab: 1,
	useTabs: 0,
	verboseDescriptions: 0,
	verticalizeArcologyLinks: 0,
	weightAffectsAssets: 1,
	oversizedBoobShrinkage: 0,
	maxErectionSizeOption: 0,
	curativeSideEffects: 1,
	disableLongDamage: 1,
	// Last-used strings in Locate Slave
	findName: "",
	findBackground: "",
	findData: "",
	underperformersCount: 7,

	/** @type {FC.Bool} */
	pedoMode: 0,
	minimumSlaveAge: 16,
	fertilityAge: 13,
	potencyAge: 13,
	AgePenalty: 1,
	precociousPuberty: 0,
	loliGrow: 0,
	lolifier: 0,
	retirementAge: 45,
	customRetirementAge: 45,
	customMenialRetirementAge: 65,
	idealAge: 18,
	targetIdealAge: 18,
	idealAgeAdoption: 0,
	sortIncubatorList: "Unsorted",
	AgeEffectOnTrainerPricingPC: 1,
	AgeEffectOnTrainerEffectivenessPC: 1,
	AgeTrainingUpperBoundPC: 14,
	AgeTrainingLowerBoundPC: 12,
	childSex: 0,
	showClothingErection: true,

	// Default location
	continent: "North America",
	terrain: "rural",
	language: "English",

	AProsperityCapModified: 0,
	secExpEnabled: 0,
	customItem: {
		/** @type {Map<string, slaveButtplugs>} */
		buttplug: new Map([]),
		/** @type {Map<string, vaginalAccessories>} */
		vaginalAccessory: new Map([]),
	},

	// pregnancy notice data
	// This is used by App.Events.PregnancyNotice
	pregnancyNotice: {
		/** @type {boolean} if false then pregnancy notice events will not happen */
		enabled: true,
		/** @type {-1|0|1}
		 * *
		 * * -1: follow rules for normal accordions
		 * *  0: open
		 * *  1: collapsed
		 */
		accordionCollapsed: -1,
		/** @type {boolean} if true then we disable the next button until all children are processed */
		nextLockout: false,
		/** @type {boolean} if true then the pregnancy notice event will render a visual representation of the ova */
		renderFetus: true,
		/** @type {number[]} FC.HumanState.ID: list of humans that have already been processed this week */
		processedSlaves: [],
	},

	/** @type {number} FC.HumanState.ID */
	donatrix: 0,
	/** @type {number} FC.HumanState.ID */
	receptrix: 0,
	/** @type {number} FC.HumanState.ID */
	impregnatrix: 0,
	/** @type {App.Entity.Fetus[]} */
	transplantFetuses: [],

	// Mods
	mods: {
		/** @type {FC.Mods.Food} */
		food: {
			enabled: false,

			amount: 125000,
			cost: 25,
			lastWeek: 125000,
			market: false,
			deficit: 0,
			overstocked: 0,
			rate: {
				slave: 8,
				lower: 14.5,
				middle: 16,
				upper: 17.5,
				top: 19,
			},
			rations: 0,
			total: 0,
			warned: false,
		}
	},

	// Scenarios
	scenarios: {
		contraceptivesBan: 0,
	}
};

// Corp data
App.Data.CorpInitData = {
	Name: 'Your corporation',
	Announced: 0,
	Incorporated: 0,
	Market: 0,
	Econ: 0,
	CashDividend: 0,
	Div: 0,
	ExpandToken: 0,
	Spec: 0,
	SpecToken: 0,
	SpecRaces: [],
	disableOverhead: 0,
};

App.Data.projectN = {
	status: 0,
	public: 0,
	wellFunded: 0,
	poorlyFunded: 0,
	phase1: 0,
	phase2: 0,
	phase3: 0,
	phase4: 0,
	decisionMade: 0,
	techReleased: 0,
};

// Black Market
App.Data.FSWares = [
	"AssetExpansionistResearch",
	"GenderRadicalistResearch",
	"HedonisticDecadenceResearch",
	"SlaveProfessionalismResearch",
	"SlimnessEnthusiastResearch",
	"TransformationFetishistResearch",
	"YouthPreferentialistResearch",
];

App.Data.illegalWares = [
	"AnimalOrgans",
	"asexualReproduction",
	"BlackmarketPregAdaptation",
	"childhoodFertilityInducedNCS",
	"PGHack",
	"RapidCellGrowthFormula",
	"optimizedSpermFormula",
	"optimizedBreedingFormula",
	"sympatheticOvaries",
	"UterineRestraintMesh",
];


// The other half of the above whitelist. However, entries in this array will be forced to the values set here upon starting NG+.
App.Data.resetOnNGPlus = {
	policies: {
		retirement: {
			sex: 0,
			milk: 0,
			cum: 0,
			births: 0,
			kills: 0,
			income: 0,

			/** @type {FC.Zeroable<string>} */
			fate: 0,
			menial2Citizen: 0,
			customAgePolicy: 0,
			physicalAgePolicy: 0
		},
		SMR: {
			basicSMR: 1,
			healthInspectionSMR: 0,
			educationSMR: 0,
			frigiditySMR: 0,
			weightSMR: 0,
			honestySMR: 0,

			beauty: {
				basicSMR: 0,
				qualitySMR: 0
			},
			height: {
				basicSMR: 0,
				advancedSMR: 0
			},
			intelligence: {
				basicSMR: 0,
				qualitySMR: 0
			},
			eugenics: {
				faceSMR: 0,
				heightSMR: 0,
				intelligenceSMR: 0
			}
		},

		childProtectionAct: 1,
		idealAge: 0,
		culturalOpenness: 0,
		proRefugees: 0,
		publicFuckdolls: 0,

		proRecruitment: 0,
		cash4Babies: 0,
		regularParties: 0,
		publicPA: 0,
		coursingAssociation: 0,

		raidingMercenaries: 0,
		mixedMarriage: 0,
		goodImageCampaign: 0,
		alwaysSubsidizeRep: 0,
		alwaysSubsidizeGrowth: 0,

		immigrationCash: 0,
		immigrationRep: 0,
		enslavementCash: 0,
		enslavementRep: 0,
		cashForRep: 0,

		oralAppeal: 0,
		vaginalAppeal: 0,
		analAppeal: 0,
		sexualOpenness: 0,
		bestialityOpenness: 0,
		gumjobFetishism: 0,
		gumjobFetishismSMR: 0,

		contraceptivesBan: 0
	},

	FCTV: {
		receiver: -1,
		channel: {},
		pcViewership: {
			count: 0,
			frequency: 4,
		},
		remote: 0,
		weekEnabled: 0
	},
	/** @type {assistant} */
	assistant: null,
	targetArcology: {fs: /** @type {FC.FutureSociety|"New"} */("New")},

	plot: 1,
	plotEventWeek: 0,
	assignmentRecords: {},
	marrying: [], // array of slave being married this week
	organs: [],
	corp: App.Data.CorpInitData,
	dividendTimer: 0,
	dividendRatio: 0,
	personalShares: 0,
	publicShares: 0,
	SF: {},
	/** @type {FC.Zeroable<Array<string>>} */
	thisWeeksFSWares: 0,
	/** @type {FC.Zeroable<Array<string>>} */
	thisWeeksIllegalWares: 0,

	/** @type {Array<Array<App.Events.BaseEvent>>} */
	eventQueue: [],

	eliteAuctioned: 0,
	slavesSacrificedThisWeek: 0,

	mercenariesTitle: "",
	FSReminder: 0,
	facility: {},
	econAdvantage: 0,

	SecExp: {},

	reminderEntry: "",
	reminderWeek: "",
	currentRule: null, // {},
	costs: 0,
	seeBuilding: 0,
	purchasedSagBGone: 0,
	eliteFail: 0,
	eliteFailTimer: 0,
	nurseryGrowthStimsSetting: 0,
	MadamIgnoresFlaws: 0,
	MadamNoSex: 0,
	farmyardBreeding: 0,
	farmyardRestraints: 0,
	farmyardShows: 0,
	farmyardPregSetting: 0,
	/** @type {FC.Bool} if 1 then slaves are allowed to choose empty farm slots when choosing their assignment */
	farmyardSlavesAssignThemselves: 0,
	DJignoresFlaws: 0,
	DJnoSex: 0,

	// Budget
	lastWeeksCashIncome: {},
	lastWeeksCashExpenses: {},
	lastWeeksRepIncome: {},
	lastWeeksRepExpenses: {},
	showAllEntries: {costsBudget: 0, repBudget: 0},
	/** @type {string[]} */
	lastWeeksCashErrors: [],
	/** @type {string[]} */
	lastWeeksRepErrors: [],

	econRate: 0,
	/** @type {FC.ArcologyState[]} */
	arcologies: [],
	/* These variables exist, so skill changes during the week will only influence prizes in the next week */
	HackingSkillMultiplier: 0,
	upgradeMultiplierArcology: 0,
	upgradeMultiplierMedicine: 0,
	upgradeMultiplierTrade: 0,
	/** @type {Record<FC.Assignment, Set<number>>} */
	JobIDMap: null,
	averageTrust: 0,
	averageDevotion: 0,
	enduringTrust: 0,
	enduringDevotion: 0,
	/** @type {FC.RA.Rule[]} */
	defaultRules: [],
	/** @type {{[key: string]: number[]}} */
	rulesToApplyOnce: {},
	raDefaultMode: 0,
	raConfirmDelete: 1,
	addButtonsToSlaveLinks: true,

	/** @type {{ID: FC.HumanID, type: "adoptFollowUp" | "butthole" | "feminization" | "futa" | "MILF" | "orientation" | "ugly"}[]} */
	RECheckInIDs: [],

	/** @type {FC.Zeroable<FC.SlaveState>} */
	activeSlave: 0,
	/** @type {FC.Zeroable<FC.InfantState>} */
	activeChild: 0,
	/** @type {Array<FC.ReminderEntry>} */
	reminders: [],

	personalLog: [],

	bioreactorPerfectedID: 0,

	independenceDay: 0,
	invasionVictory: 0,
	daughtersVictory: 0,

	dormitory: 20,
	dormitoryPopulation: 0,
	rooms: 5,
	roomsPopulation: 0,

	/** @type {FC.FutureSocietyDeco} */
	brothelDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	brothelUpgradeDrugs: 0,
	brothelAdsSpending: 0,
	brothelAdsOld: 0,
	brothelAdsModded: 0,
	brothelAdsImplanted: 0,
	brothelAdsStacked: 0,
	brothelAdsPreg: 0,
	brothelAdsXX: 0,
	brothelName: "the Brothel",
	brothel: 0,
	brothelBoost: {
		selected: 0, eligible: 0
	},
	/** @type {FC.FutureSocietyDeco} */
	dairyDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	dairyPrepUpgrade: 0,
	dairyStimulatorsUpgrade: 0,
	dairyStimulatorsSetting: 0,
	dairyFeedersUpgrade: 0,
	dairyFeedersSetting: 0,
	dairyPregUpgrade: 0,
	dairyPregSetting: 0,
	dairyRestraintsUpgrade: 0,
	dairyRestraintsSetting: 0,
	dairySlimMaintainUpgrade: 0,
	dairySlimMaintain: 0,
	dairyHyperPregRemodel: 0,
	dairyWeightSetting: 0,
	dairyHormonesSetting: 0,
	dairyImplantsSetting: 1,
	dairyUpgradeMenials: 0,
	createBioreactors: 0,
	bioreactorsAnnounced: 0,
	bioreactorsHerm: 0,
	bioreactorsXX: 0,
	bioreactorsXY: 0,
	bioreactorsBarren: 0,
	dairyName: "the Dairy",
	dairy: 0,
	/** @type {FC.FutureSocietyDeco} */
	clubDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	clubUpgradePDAs: 0,
	clubAdsSpending: 0,
	clubAdsOld: 0,
	clubAdsModded: 0,
	clubAdsImplanted: 0,
	clubAdsStacked: 0,
	clubAdsPreg: 0,
	clubAdsXX: 0,
	clubName: "the Club",
	club: 0,
	servantsQuarters: {
		capacity: 0,
		name: "the Servants' Quarters",
		/** @type {FC.FutureSocietyDeco} */
		decoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
		upgrades: {
			monitoring: 0,
		},
		rules: {
			stewardessImpregnates: 0
		}
	},
	/** @type {FC.FutureSocietyDeco} */
	schoolroomDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	schoolroomUpgradeSkills: 0,
	schoolroomUpgradeLanguage: 0,
	schoolroomUpgradeRemedial: 0,
	schoolroomRemodelBimbo: 0,
	schoolroom: 0,
	schoolroomName: "the Schoolroom",
	/** @type {FC.FutureSocietyDeco} */
	spaDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	spa: 0,
	spaSpots: 0,
	spaUpgrade: 0,
	spaFix: 0,
	spaAggroSpermBan: 1,
	spaName: "the Spa",

	incubator: {
		// Everything in here is overwritten by App.Facilities.Incubator.init()
		capacity: 0,
		/** @type {ReadonlyMap<FC.HumanID, Readonly<FC.TankSlaveState>>} */
		tanks: new Map(),
		maleSetting: {
			imprint: "trust",
			targetAge: 18,
		},
		femaleSetting: {
			imprint: "trust",
			targetAge: 18,
		},
	},

	/** @type {FC.FutureSocietyDeco} */
	clinicDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	clinic: 0,
	clinicUpgradeFilters: 0,
	clinicUpgradeScanner: 0,
	clinicUpgradePathogenSequencer: 0,
	clinicUpgradePurge: 0,
	clinicObservePregnancy: 1,
	clinicInflateBelly: 0,
	clinicRegularCheckups: 1,
	clinicSpeedGestation: 0,
	clinicName: "the Clinic",
	/** @type {FC.FutureSocietyDeco} */
	arcadeDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	arcadeUpgradeInjectors: 0,
	arcadeUpgradeFuckdolls: 0,
	arcadeUpgradeCollectors: 0,
	arcadeUpgradeHealth: -1,
	arcadeName: "the Arcade",
	arcade: 0,
	/** Counts arcade slaves converted into fuckdolls. */
	fuckdollsSold: 0,
	/** @type {FC.FutureSocietyDeco} */
	cellblockDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	cellblockUpgrade: 0,
	cellblock: 0,
	cellblockName: "the Cellblock",
	cellblockWardenCumsInside: 1,
	/** @type {FC.FutureSocietyDeco} */
	masterSuiteDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	masterSuiteUpgradeLuxury: 0,
	masterSuiteUpgradePregnancy: 0,				/* Is the upgrade active? */
	masterSuitePregnancyFertilityDrugs: 0,			/* Are slaves being put on fertility drugs? */
	masterSuitePregnancyFertilitySupplements: 0,	/* Are those drugs being supplemented (health benefits and (even) more multiple pregnancies) */
	masterSuitePregnancySlaveLuxuries: 0,			/* Are the slaves being given some nicer things to reduce stress during preg? (health/devotion/trust benefits) */
	universalHGImpregnateMasterSuiteToggle: 0,		/* Will the HG impregnate fertile slaves in the MS? */
	masterSuiteHyperPregnancy: 0,
	masterSuite: 0,
	masterSuiteName: "the Master Suite",

	// Nursery
	/** Counts the number of nannies the nursery can support */
	nursery: 0,
	/** No longer used */
	nurseryNannies: 0,
	/** Counts the number of children the nursery can support */
	nurseryCribs: 0,
	/** Counts the number of children currently in the nursery */
	nurseryChildren: 0,
	/** Check for whether the children are influenced by the nannies */
	nannyInfluence: 0,
	/** @type {FC.FutureSocietyDeco} */
	nurseryDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	nurseryWeight: 0,
	nurseryMuscles: 0,
	nurseryHormones: 0,
	nurseryOrgans: 0,								// not currently in use
	nurseryImprintSetting: 0,
	nurseryWeightSetting: 0,
	nurseryMusclesSetting: 0,
	nurseryHormonesSetting: 0,
	nurseryName: "the Nursery",
	nurserySex: false,
	MatronIgnoresFlaws: false,
	sortNurseryList: "Unsorted",
	targetAgeNursery: 18,

	// Farmyard Subsection
	farmyard: 0,
	farmyardFarmers: [],
	farmMenials: 0,
	farmMenialsSpace: 0,
	/** @type {FC.FutureSocietyDeco} */
	farmyardDecoration: (/** @type {FC.FutureSocietyDeco} */ "standard"),
	farmyardUpgrades: {
		pump: 0,
		fertilizer: 0,
		hydroponics: 0,
		machinery: 0,
		seeds: 0,
		/** available food storage in tons */
		foodStorage: 150,
	},
	farmyardCrops: 0,
	farmyardStables: 0,
	farmyardKennels: 0,
	farmyardCages: 0,
	active: {
		/** @type {string} */
		canine: null,
		/** @type {string} */
		hooved: null,
		/** @type {string} */
		feline: null,
	},
	animals: {
		/** @type {string[]} */
		canine: [],
		/** @type {string[]} */
		hooved: [],
		/** @type {string[]} */
		feline: [],
	},
	/** @type {Map<string, App.Entity.Animal>} */
	customAnimals: new Map(),
	farmyardName: "the Farmyard",

	HGSuite: 0,
	HGSuiteSurgery: 1,
	HGSuiteDrugs: 1,
	HGSuiteAbortion: 1,
	HGSuiteHormones: 1,
	HGSuiteEquality: 0,
	HGSuiteName: "the Head Girl Suite",

	/** @type {FC.Facilities.Pit} */
	pit: null,

	/** Arrays of slaves you've threatened to kill */
	threatened: [
		[],	// this week
		[],	// one week ago
		[],	// two weeks ago
		[],	// three weeks ago
		[], // four weeks ago
	],

	dojo: 0,
	feeder: 0,
	cockFeeder: 0,
	suppository: 0,
	weatherCladding: 0,
	weatherAwareness: 0,
	boobAccessibility: 0,
	servantMilkers: 0,

	studio: 0,
	studioFeed: 0,
	PCSlutContacts: 1,

	/* Porn star counts (prestige 1) and ID's (prestige 3) */
	pornStars: {},

	pregInventor: 0,
	pregInventorID: 0,
	pregInventions: 0,

	FSAnnounced: 0,
	FSGotRepCredits: 0,
	FSCreditCount: 5,
	FSSingleSlaveRep: 10,
	FSSpending: 0,
	FSLockinLevel: 100,

	// new corporation variables
	newCorp: 1,
	vanillaShareSplit: 1,

	/* Slave sexual services and goods variables */
	classSatisfied: {
		lowerClass: 0, middleClass: 0, upperClass: 0, topClass: 0
	},
	whoreBudget: {
		lowerClass: 7, middleClass: 40, upperClass: 200, topClass: 1500
	},
	sexDemandResult: {
		lowerClass: 0, middleClass: 0, upperClass: 0, topClass: 0
	},
	arcadePrice: 2,
	shelterAbuse: 0,

	pregAccessibility: 0,
	dickAccessibility: 0,
	ballsAccessibility: 0,
	buttAccessibility: 0,
	boughtItem: {
		clothing: {
			// alternate clothing access variables
			bunny: 0,
			conservative: 0,
			chains: 0,
			western: 0,
			oil: 0,
			habit: 0,
			toga: 0,
			huipil: 0,
			kimono: 0,
			harem: 0,
			qipao: 0,
			imperialarmor: 0,
			imperialsuit: 0,
			egypt: 0,
			belly: 0,
			maternityDress: 0,
			maternityLingerie: 0,
			lazyClothes: 0,
			bimbo: 0,
			courtesan: 0,
			petite: 0,
			antebellum: 0,
			// non-fs
			military: 0,
			cultural: 0,
			middleEastern: 0,
			pol: 0,
			costume: 0,
			pantsu: 0,
			career: 0,
			dresses: 0,
			bodysuits: 0,
			casual: 0,
			underwear: 0,
			sports: 0,
			pony: 0,
			swimwear: 0,
			// WIP
			newmisc: 0,
		},
		shoes: {
			heels: 0,
		},
		toys: {
			enema: 0,
			medicalEnema: 0,
			buckets: 0,
			dildos: 0,
			gags: 0,
			vaginalAttachments: 0,
			buttPlugs: 0,
			buttPlugTails: 0,
			smartVibes: 0,
			smartVaginalAttachments: 0,
			smartStrapon: 0,
			chastity: 1,
		},
	},
	dairyPiping: 0,
	milkPipeline: 0,
	cumPipeline: 0,
	wcPiping: 0,
	/** @type {Map<number, "oldAge"|"overdosed"|"lowHealth">} */
	slaveDeath: new Map(),
	playerBred: 0,
	propOutcome: 0,
	EliteSires: [],
	raped: -1,
	rapedThisWeek: 0,
	missingParentID: -10000,
	/* animalParts: 0,*/
	pregSpeedControl: 0,
	bodyswapAnnounced: 0,
	surnamesForbidden: 0,
	menstruation: 0,
	menstruationKnown: 0,
	pregnancyKnown: 0,
	FCNNstation: 0,
	swanSong: 0,
	failedElite: 0,
	eugenicsFullControl: 0,
	badC: 0,
	poorKnight: 0,
	imperialEventWeek: 0,
	assholeKnight: 0,
	newBaron: 0,
	badB: 0,

	schoolSuggestion: 0,
	TSS: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},
	TUO: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},
	GRI: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},
	SCP: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},
	LDE: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},
	TGA: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},
	TCR: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},
	TFS: {
		farmUpgrade: 0, schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0, compromiseWeek: 0
	},
	futaAddiction: 0,
	HA: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},
	NUL: {
		schoolUpgrade: 0, schoolPresent: 0, schoolProsperity: 0, subsidize: 0, schoolAnnexed: 0, studentsBought: 0, schoolSale: 0
	},

	IDNumber: 1,

	week: 1,

	slaveTutor: {
		HeadGirl: [],
		Recruiter: [],
		Bodyguard: [],
		Madam: [],
		DJ: [],
		Nurse: [],
		Teacher: [],
		Attendant: [],
		Matron: [],
		Stewardess: [],
		Milkmaid: [],
		Farmer: [],
		Wardeness: []
	},

	weddingPlanned: 0,
	/** @type {{task: FC.PersonalAttention, slaves?: Array<{ID: FC.HumanID, objective: FC.PersonalAttentionTrainingObjective}>}} */
	personalAttention: {task: PersonalAttention.SEX},
	HeadGirlID: 0,
	HGTimeInGrade: 0,
	RecruiterID: 0,
	/** @type {FC.RecruiterTarget} */
	recruiterTarget: "desperate whores",
	/** @type {FC.RecruiterTarget} */
	oldRecruiterTarget: "desperate whores",
	recruiterProgress: 0,
	recruiterIdleRule: "number",
	recruiterIdleNumber: 20,
	recruiterIOUs: 0,
	recruiterSpecializations: {
		/**
		 * * 0: None
		 * * 1: Beautiful
		 */
		beauty: 0,
		/**
		 * * 0: None
		 * * 1: Tall
		 */
		height: 0,
		/**
		 * * 0: None
		 * * 1: Intelligent
		 */
		intelligence: 0,
	},
	bodyguardTrains: 1,
	BodyguardID: 0,
	MadamID: 0,
	djID: 0,
	MilkmaidID: 0,
	milkmaidImpregnates: 0,
	FarmerID: 0,
	StewardessID: 0,
	SchoolteacherID: 0,
	AttendantID: 0,
	MatronID: 0,
	NurseID: 0,
	WardenessID: 0,
	ConcubineID: 0,

	justiceEvents: ["slave deal", "slave training", "majority deal", "indenture deal", "virginity deal", "breeding deal"], /* not in setupVars because we remove events from this array as they occur */
	/** @type {Array<FC.SlaveMarketName>} */
	prisonCircuit: ["low tier criminals", "gangs and smugglers", "white collar", "military prison", "juvenile detention"],
	prisonCircuitIndex: 0,

	ui: "start",
	tooltipsEnabled: 0,
	remindersFromTextSelection: 1,

	brandTarget: {primary: "left buttock", secondary: "left buttock", local: "left buttock"},
	brandDesign: {primary: "your initials", official: "your initials", local: "your initials"},

	scarTarget: {primary: "left cheek", secondary: "left cheek", local: "left cheek"},
	scarDesign: {primary: "generic", local: "generic"},

	oralTotal: 0,
	vaginalTotal: 0,
	analTotal: 0,
	mammaryTotal: 0,
	penetrativeTotal: 0,
	milkTotal: 0,
	cumTotal: 0,
	birthsTotal: 0,
	abortionsTotal: 0,
	miscarriagesTotal: 0,
	bestialityTotal: 0,
	pitKillsTotal: 0,
	pitFightsTotal: 0,

	collaboration: 0,
	hackerSupport: 0,
	/** @type {FC.Rival} */
	rival: {
		state: 0, duration: 0, prosperity: 0, power: 0, FS: {name: ""}, hostageState: 0
	}, /* {state details: 0 - init 1 - inactive (foreign), 2 - active (local), 3 - captured (flag for 5), 4 - defeated, 5 - enslaved} */
	nationHate: 0,
	eventResults: {},

	dispensary: 0,
	dispensaryUpgrade: 0,
	organFarmUpgrade: 0,
	/** @type {FC.Medicine.OrganFarm.GrowingOrgan[]} */
	completedOrgans: [],
	/** @type {FC.Bool} */
	ImplantProductionUpgrade: 0,
	/** @type {FC.Bool} */
	permaPregImplant: 0,
	/** @type {0|1|2|3} */
	injectionUpgrade: 0,
	/** @type {FC.Bool} */
	hormoneUpgradeMood: 0,
	/** @type {FC.Bool} */
	hormoneUpgradeShrinkage: 0,
	/** @type {FC.Bool} */
	hormoneUpgradePower: 0,
	/** @type {FC.Bool} */
	pubertyHormones: 0,
	/** @type {FC.Bool} */
	dietXXY: 0,
	/** @type {FC.Bool} */
	dietCleanse: 0,
	/** @type {FC.Bool} */
	cumProDiet: 0,
	/** @type {FC.Bool} */
	dietFertility: 0,
	/** @type {FC.Bool} */
	curativeUpgrade: 0,
	/** @type {FC.Bool} */
	growthStim: 0,
	/** @type {FC.Bool} */
	reproductionFormula: 0,
	/** @type {FC.Bool} */
	aphrodisiacUpgrade: 0,
	/** @type {FC.Bool} */
	aphrodisiacUpgradeRefine: 0,
	/** @type {FC.Bool} */
	healthyDrugsUpgrade: 0,
	/** @type {FC.Bool} */
	superFertilityDrugs: 0,
	/** @type {FC.Bool} */
	bellyImplants: 0,
	/** @type {0|1|2} */
	cervixImplants: 0,
	/** @type {0|1} */
	cervixImplantUpgrade: 0,
	/** @type {FC.Bool} */
	meshImplants: 0,
	/** @type {FC.Bool} */
	prostateImplants: 0,
	/** @type {FC.Bool} */
	youngerOvaries: 0,
	/** @type {FC.Bool} */
	immortalOvaries: 0,
	/** @type {FC.Bool} */
	sympatheticOvaries: 0,
	/** @type {FC.Bool} */
	fertilityImplant: 0,
	/** @type {FC.Bool} */
	asexualReproduction: 0,
	/** @type {FC.Bool} */
	animalOvaries: 0, /* {pigOvaries: 0, canineOvaries: 0, horseOvaries: 0, cowOvaries: 0} currently unused*/
	/** @type {FC.Bool} */
	animalTesticles: 0, /* {pigTestes: 0, dogTestes: 0, horseTestes: 0, cowTestes: 0} currently unused*/
	/** @type {FC.Bool} */
	animalMpreg: 0, /* {pigMpreg: 0, dogMpreg: 0, horseMpreg: 0, cowMpreg: 0} currently unused*/
	/**
	 * @type {0|1|2|3} *
	 - 0: Not installed
	 - 1: Analyzer (only shows genetic info) [New - Currently unused]
	 - 2: Basic sequencer (basic modification)
	 - 3: Advanced sequencer (advanced modification)
	 */
	geneticMappingUpgrade: 0,
	toyShop: false,
	/** @type {FC.Bool} */
	pregnancyMonitoringUpgrade: 0,
	/** @type {FC.Bool} */
	cloningSystem: 0,
	/** @type {FC.Bool} */
	geneticFlawLibrary: 0,
	consumerDrugs: 0,

	projectN: App.Data.projectN,
	bodyPuristRiot: 0,
	puristsFurious: 0,
	puristRiotDone: 0,
	subjectDeltaName: "Bubbles",
	growingNewCat: 0,
	noDeadShit: 0,

	surgeryUpgrade: 0,

	barracks: 0,
	mercenaries: 0,
	mercenariesHelpCorp: 0,
	personalArms: 0,

	/**
	 * @type {Map<string, FC.TrinketData>}
	 */
	trinkets: new Map([]),
	SPcost: 1000,
	debtWarned: 0,
	internationalTrade: 1,
	internationalVariety: 0,
	slaveCostFactor: 0.95,
	menialDemandFactor: 0,
	menialSupplyFactor: 0,
	demandTimer: 0,
	supplyTimer: 0,
	elapsedDemandTimer: 0,
	elapsedSupplyTimer: 0,
	slaveCostRandom: 0,
	deltaDemand: 0,
	deltaDemandOld: 0,
	deltaSupply: 0,
	deltaSupplyOld: 0,
	NPCSexSupply: {
		lowerClass: 3000, middleClass: 3000, upperClass: 3000, topClass: 3000
	},
	NPCMarketShare: {
		lowerClass: 1000, middleClass: 1000, upperClass: 1000, topClass: 1000
	},
	sexSubsidies: {
		lowerClass: 0, middleClass: 0, upperClass: 0, topClass: 0
	},
	sexSupplyBarriers: {
		lowerClass: 0, middleClass: 0, upperClass: 0, topClass: 0
	},
	facilityCost: 100,
	enduringRep: 1000,
	maximumRep: 30000,
	rep: 0,
	repLastWeek: 0,

	arcologyUpgrade: {
		drones: 0, hydro: 0, apron: 0, grid: 0, spire: 0
	},

	economy: 100,
	localEcon: 0,
	drugsCost: 0,
	rulesCost: 0,
	modCost: 0,
	surgeryCost: 0,
	AGrowth: 2,
	ACitizens: 4250,
	lowerClass: 3120,
	LSCBase: 800,
	visitors: 0,
	rentDefaults: {
		lowerClass: 20, middleClass: 50, upperClass: 180, topClass: 650
	},
	rent: {
		lowerClass: 20, middleClass: 50, upperClass: 180, topClass: 650
	},
	rentEffectL: 1,
	middleClass: 890,
	MCBase: 200,
	rentEffectM: 1,
	upperClass: 200,
	UCBase: 40,
	rentEffectU: 1,
	topClass: 40,
	TCBase: 20,
	rentEffectT: 1,
	GDP: 278.6,
	NPCSlaves: 900,
	ASlaves: 900,
	AProsperityCap: 0,

	revealFoodEffects: 0,
	/** @type {App.Arcology.Building} */
	building: null,

	menials: 0,
	fuckdolls: 0,
	menialBioreactors: 0,
	prestigeAuctioned: 0,
	slaveMarketLimit: 20,
	slavesSeen: 0,

	slaveOrphanageTotal: 0,
	citizenOrphanageTotal: 0,
	privateOrphanageTotal: 0,
	breederOrphanageTotal: 0,

	LurcherID: 0,
	coursed: 0,
	StudID: 0,
	raided: 0,

	FSSlaveProfLawTrigger: 0,
	citizenRetirementTrigger: 0,
	FSSupLawTrigger: 0,
	FSSubLawTrigger: 0,
	nicaea: {
		announced: 0,
		preparation: 0,
		involvement: -2,
		power: 0,
		held: 0,
		focus: "",
		assignment: "",
		achievement: "",
		name: "",
		influence: 0,
		eventWeek: 0
	},
	/** @type {FC.Peacekeepers} */ peacekeepers: {state: 1},
	mercRomeo: 0,

	oralUseWeight: 5,
	vaginalUseWeight: 5,
	analUseWeight: 5,
	mammaryUseWeight: 1,
	penetrativeUseWeight: 1,

	weatherToday: {},
	weatherLastWeek: 0,
	weatherType: 0,
	weatherRemaining: 0,

	/**
	 * I am not a slave object! Do not treat me like one!
	 * @type {FC.CustomSlaveOrder}
	 */
	customSlave: null,
	customSlaveOrdered: 0,
	customSlaveReorder: 0,

	/**
	 * I am not a slave object! Do not treat me like one!
	 * @type {FC.CustomSlaveOrder}
	 * */
	huskSlave: null,
	huskSlaveOrdered: 0,

	/* Job Fulfillment Center */
	JFC: {
		/** @type {FC.Bool} */
		order: 0,
		reorder: 0
	},

	/** @type {FC.Bool} toggles cheats */
	cheatMode: 0,
	/** @type {FC.Bool} if 1 and cheatMode is 1 then the player owns all possible clothes automatically */
	cheatClothes: 0,
	/** @type {FC.Bool} toggles sidebar cheats */
	cheatModeM: 1,
	slaveBotGeneration: 0,
	experimental: {
		nursery: 0,
		/** if true the farmyard is enabled, if false and the farmyard is already established then it is enabled, otherwise the farmyard cannot be established */
		farmyard: false,
		animalOvaries: 0,
		dinnerParty: 0,
		reportMissingClothing: 0,
		raGrowthExpr: 0,
		sexOverhaul: 0,
		slaveHistory: 0,
		interactions: 0,
		clitoralPenetration: 0,
		raSortOutput: 0,
	},
	NaNArray: [],

	/* Misc mod variables */
	recruiterEugenics: 0,

	prostheticsUpgrade: 0,
	adjustProstheticsCompleted: 0,
	/** @type {FC.AdjustProsthetics[]} */
	adjustProsthetics: [],
	/* task: {type: "research"/"craft/craftFit", id: string, workLeft: int, [if constructFit] slaveID: int}*/
	researchLab: {
		level: 0,
		aiModule: 1,
		tasks: [],
		maxSpace: 0,
		hired: 0,
		menials: 0,
	},
	/* prosthetics: {research: int, amount: int} */
	prosthetics: {},

	/* Black Market */
	merchantFSWares: App.Data.FSWares,
	merchantIllegalWares: App.Data.illegalWares,
	UterineRestraintMesh: 0,
	PGHack: 0,
	BlackmarketPregAdaptation: 0,

	/* Gene Mods */
	RapidCellGrowthFormula: 0,
	immortalityFormula: 0,
	bioEngineeredFlavoringResearch: 0,
	optimizedSpermFormula: 0,
	enhancedProductionFormula: 0,
	optimizedBreedingFormula: 0,

	/* Medical Pavilion */
	doctor: {
		state: 0, // controls introduction
		cost: 500,
	},

	/* Cosmetic Surgery Suite */
	pSurgery: {
		state: 0, // controls introduction and if the assistant is mad at you
		cooldown: 0, // weeks until usable
		nursePreg: 0,
		disloyal: 0, // Getting surgery elsewhere upsets the assistant
		cost: 0, // How much you have to spend until she forgives you
	},

	/* Unethical Doctor */
	pExoticSurgery: {
		state: 0, // controls introduction and which halves you've met
		fakePreg: 0, // is the female half teasing a male player?
		cooldown: 0, // weeks until usable
		visits: 0, // how many times you've given them money
		clones: [], // you're starting to get boring, good thing I can fix that
	},

	diversePronouns: 0,

	/* Weather effect on economy */
	antiWeatherFreeze: 0,
	econWeatherDamage: 0,
	disasterResponse: 0,

	postSexCleanUp: 1,

	sideBarOptions: {
		/** @type {'expanded'|'compact'} */
		Style: 'expanded',
		Cash: 1,
		Upkeep: 1,
		SexSlaveCount: 1,
		roomPop: 1,
		Rep: 1,
		GSP: 1,
		Authority: 1,
		Security: 1,
		Crime: 1,
		confirmWeekEnd: 0,
		notifyFS: 1,
		notifyIncubator: 1,
		notifyCorp: 1,
	},
	DefaultBirthDestination: "individually decided fates",
	/** @type {number[]} an array of IDs for all the hero slaves that have been purchased at the market */
	heroSlavesPurchased: [],
	/** @type {string[]} */
	fcnn: [],

	murderAttemptWeek: 80,
	illegalDeals: {
		/** @type {FC.Zeroable<{week: number, company: string}>|-1} */
		military: 0,
		/** @type {FC.Zeroable<{week: number, company: string}>|-1} */
		trade: 0,
		menialDrug: 0,
		/** @type {FC.Zeroable<{type: string, week: number, company: string}>|-1} */
		slave: 0
	},
	tempEventToggle: 0,
	/** @type {Array<number>} */
	favorites: [],
	/**
	 * Any loans the player has taken out.
	 * @type {FC.Loan[]}
	 */
	loans: [],
	/**
	 * @type {FC.RA.Actions}
	 */
	RAActions: {
		slaves: {}
	},
};

// The keys of this object are a whitelist of options that are set by the player at game start.
// The values are the default values.
// It might be possible to combine this object with defaultGameStateVariables and resetOnNGPlus above,
// but awkwardly, the player-chosen settings are split between defaultGameStateVariables and resetOnNGPlus.
App.Data.defaultGameOptions = {
	baseDifficulty: 3,
	economy: 100,
	econRate: 0,
	difficultySwitch: 0,
	plot: 1,

	targetArcology: {
		fs: /** @type {FC.FutureSociety|"New"} */("New"),
		// It's safe to overwrite V.targetArcology.fs.
		// App.Intro.initNationalities() will create a new ArcologyState and grab only
		// V.targetArcology.name, V.targetArcology.prosperity, V.targetArcology.citizens,
		// V.targetArcology.building,
		// V.targetArcology.fs as a string, V.targetArcology.FSProgress, and V.targetArcology.race if applicable.
		name: "Arcology X-4",
		FSProgress: 30,
		prosperity: 50,
		citizens: 0,
		terrain: "rural",
		continent: "North America",
		language: "English",
	},
	neighboringArcologies: 3,
	terrain: "rural",
	continent: "North America",
	language: "English",
	FSCreditCount: 5,

	internationalTrade: 1,
	internationalVariety: 0,

	showEWD: 1,
	showEWM: 1,
	verboseDescriptions: 0,
	UI: {
		slaveSummary: {
			abbreviation: {
				clothes: 2,
				devotion: 2,
				beauty: 2,
				diet: 2,
				drugs: 2,
				genitalia: 2,
				health: 2,
				hormoneBalance: 2,
				mental: 2,
				nationality: 2,
				origins: 2,
				physicals: 2,
				race: 2,
				rules: 2,
				rulesets: 2,
				skills: 2,
			}
		},
		compressSocialEffects: 0
	},
	useAccordion: 1,
	favSeparateReport: 0,
	useTabs: 0,
	showEconomicDetails: 0,
	showNeighborDetails: 1,
	formatNumbers: 1,
	positionMainLinks: -1,
	newModelUI: 1,
	verticalizeArcologyLinks: 0,
	seeArcology: 1,
	seeDesk: 1,
	seeFCNN: 1,
	showTipsFromEncy: 1,

	tooltipsEnabled: 0,
	remindersFromTextSelection: 1,

	useSlaveSummaryTabs: 0,
	useSlaveListInPageJSNavigation: 0,
	useSlaveSummaryOverviewTab: 0,
	fucktoyInteractionsPosition: 1,
	slaveInteractLongForm: false,
	slaveInteractHideLabels: false,
	endweekSaveWarning: 1,
	/** @type {'link'|'button'} */
	purchaseStyle: 'link',
	raDefaultMode: 0,
	raConfirmDelete: 1,
	addButtonsToSlaveLinks: true,

	sideBarOptions: {
		/** @type {'expanded'|'compact'} */
		Style: 'expanded',
		Cash: 1,
		Upkeep: 1,
		SexSlaveCount: 1,
		roomPop: 1,
		Rep: 1,
		GSP: 1,
		Authority: 1,
		Security: 1,
		Crime: 1,
		confirmWeekEnd: 0,
	},

	seeImages: 0,
	seeCustomImagesOnly: 0,
	imageChoice: 1,
	aiApiUrl: "http://localhost:7860",
	aiLoraPack: true,
	aiDisabledLoRAs: [],
	/**
	 * * 0 = Custom
	 * * 1 = Photorealistic
	 * * 2 = Anime/Hentai
	 * * 3 = None
	 * @type {0|1|2|3}
	 */
	aiStyle: 3,
	aiSchedulingMethod: 'Karras',
	aiCustomStylePos: "",
	aiCustomStyleNeg: "",
	aiNationality: 2,
	/**
	 * 1: Hormone balance
	 * 2: Perceived gender
	 * 3: Pronouns
	 */
	aiGenderHint: 1,
	aiLocationBackgrounds: 0,
	aiAutoGen: true,
	aiAutoGenFrequency: 10,
	aiUseRAForEvents: false,
	aiSamplingMethod: "DPM++ 2M SDE",
	aiCfgScale: 5,
	aiTimeoutPerStep: 5,
	aiSamplingSteps: 28,
	aiSamplingStepsEvent: 28,
	aiHeight: 640,
	aiWidth: 384,
	aiRestoreFaces: false,
	aiFaceDetailer: false,
	aiUpscale: false,
	aiUpscaleScale: 1.75,
	aiUpscaler: "SwinIR_4x",
	aiOpenPose: false,
	aiOpenPoseModel: "",
	seeAvatar: 1,
	seeSummaryImages: 1,
	seeReportImages: 1,

	seeIllness: 1,
	seeExtreme: 0,
	seeStretching: 1,
	seeBestiality: 0,
	seePee: 1,
	seeIncest: 1,
	seeDicks: 25,
	makeDicks: 0,
	seeCircumcision: 1,
	seePreg: 1,
	seeDicksAffectsPregnancy: 1,
	adamPrinciple: 0,
	seeHyperPreg: 0,
	dangerousPregnancy: 0,
	precociousPuberty: 0,

	disableLisping: 0,
	disableLongDamage: 1,
	diversePronouns: 0,
	allowMaleSlaveNames: false,
	/** show missing slave names */
	showMissingSlaves: true,
	racialAttractivenessBonus: 1,

	weightAffectsAssets: 1,
	oversizedBoobShrinkage: 0,
	curativeSideEffects: 1,
	maxErectionSizeOption: 0,

	showAssignToScenes: 1,
	postSexCleanUp: 1,
	showAppraisal: 1,
	showVignettes: 1,
	newDescriptions: 0,
	allowFamilyTitles: 0,
	limitFamilies: 0,
	showDistantRelatives: 0,

	surnameOrder: 0,
	seeRace: 1,
	seeNationality: 1,
	showImplantEffects: 1,
	showClothing: 1,
	showAgeDetail: 1,
	showHeightCMs: 1,
	showBodyMods: 1,
	showSexualHistory: 1,
	showScores: 1,
	showBoobCCs: 1,
	showPotentialSizes: 1,
	showInches: 1,
	showDickCMs: 1,
	showNumbers: 2,
	showNumbersMax: 20,

	realRoyalties: 0,
	inbreeding: 1,
	seeAge: 1,
	/** @type {FC.Bool} */
	pedoMode: 0,
	minimumSlaveAge: 16,
	extremeUnderage: 0,
	retirementAge: 45,
	idealAge: 18,
	fertilityAge: 13,
	potencyAge: 13,
	AgePenalty: 1,
	loliGrow: 0,
	lolifier: 0,

	rulesAssistantMain: 1,
	abbreviateSidebar: 1,
	sortSlavesMain: 1,
	sortSlavesOrder: "descending",
	sortSlavesBy: "devotion",
	slavePanelStyle: 1,
	summaryStats: 0,
	displayAssignments: 1,
	/** show missing parent names. V.showMissingSlaves must also be true */
	showMissingSlavesSD: true,

	// Ultimately we may want just PlayerState() for PC
	PC: {
		title: 1,
		customTitle: undefined,
		customTitleLisp: undefined,
		slaveName: "Anonymous",
		slaveSurname: 0,
		actualAge: 35,
		birthWeek: 26,
		preg: 0,
		pregType: 0,
		scrotum: 4,
		prostate: 1,
		ovaries: 0,
		genes: "XY",
		height: 185,
		natural: {
			height: 170,
			boobs: 500,
		},
		nationality: "Stateless",
		race: "white",
		skin: "light",
		hColor: "blonde",
		eye: {
			"left": {
				"vision": 2,
				"iris": "brown"
			},
			"right": {
				"vision": 2,
				"iris": "brown"
			},
			origColor: "brown",
		},
		faceShape: "normal",
		markings: "none",
		geneticQuirks: {
			macromastia: 0,
			gigantomastia: 0,
			potent: 0,
			fertility: 0,
			hyperFertility: 0,
			superfetation: 0,
			polyhydramnios: 0,
			uterineHypersensitivity: 0,
			galactorrhea: 0,
			gigantism: 0,
			dwarfism: 0,
			neoteny: 0,
			progeria: 0,
			pFace: 0,
			uFace: 0,
			albinism: 0,
			heterochromia: 0,
			rearLipedema: 0,
			wellHung: 0,
			wGain: 0,
			wLoss: 0,
			androgyny: 0,
			mGain: 0,
			mLoss: 0,
			twinning: 0,
			girlsOnly: 0,
		},
		lips: 15,
		shoulders: 0,
		underArmHStyle: "hairless",
		boobs: 200,
		boobsImplant: 0,
		boobsImplantType: "none",
		nipples: "cute",
		hips: 0,
		butt: 2,
		buttImplant: 0,
		buttImplantType: "none",
		dick: 4,
		foreskin: 0,
		// The actual default values are different depending on whether you "Skip Intro",
		// as opposed to clicking through each starting page without changing anything.
		// The values here are the default values if you "Skip Intro".
		balls: 3,
		pubertyXY: 0,
		pubertyAgeXY: 13,
		clit: 0,
		vagina: -1,
		pubertyXX: 0,
		pubertyAgeXX: 13,
		pubicHStyle: "hairless",
		pubicHColor: "blonde",
		anus: 0,
		refreshmentType: 0,
		refreshment: "cigar",
		career: "capitalist",
		rumor: "wealth",
	},
	playerAging: 2,

	SF: {
		Toggle: 0,
	},
	secExpEnabled: 0,
	SecExp: {
		settings: {
			showStats: 0,
			difficulty: 1,
			unitDescriptions: 0,
			battle: {
				enabled: 1,
				allowSlavePrestige: 1,
				force: 0,
				frequency: 1,
				major: {
					enabled: 0,
					gameOver: 1,
					mult: 1,
					force: 0
				}
			},
			rebellion: {
				enabled: 1,
				force: 0,
				gameOver: 1,
				speed: 1
			}
		}
	},
	seeCats: 0,
	mods: {
		food: {
			enabled: false
		}
	},
	experimental: {
		nursery: 0,
		/** if true the farmyard is enabled, if false and the farmyard is already established then it is enabled, otherwise the farmyard cannot be established */
		farmyard: false,
		animalOvaries: 0,
		dinnerParty: 0,
		reportMissingClothing: 0,
		raGrowthExpr: 0,
		sexOverhaul: 0,
		slaveHistory: 0,
		interactions: 0,
		clitoralPenetration: 0,
		raSortOutput: 0,
	},
};
