/**
 * @type {FC.Rules.LivingFreezed}
 * @enum {string}
 */
globalThis.LivingRule = Object.freeze({LUXURIOUS: 'luxurious', NORMAL: 'normal', SPARE: 'spare'});
/**
 * @type {FC.Rules.RestFreezed}
 * @enum {string}
 */
globalThis.RestRule = Object.freeze({
	MANDATORY: 'mandatory', MAX: 'permissive', MID: 'restrictive', MIN: 'cruel', NONE: 'none'
});
/**
 * @type {FC.AssignmentFreeze}
 * @enum {string}
 */
globalThis.Job = Object.freeze({
	// Penthouse Assignments
	REST: 'rest',
	FUCKTOY: 'please you',
	CLASSES: 'take classes',
	HOUSE: 'be a servant',
	WHORE: 'whore',
	PUBLIC: 'serve the public',
	SUBORDINATE: 'be a subordinate slave',
	MILKED: 'get milked',
	GLORYHOLE: 'work a glory hole',
	CONFINEMENT: 'stay confined',
	// Leadership Assignments
	BODYGUARD: 'guard you',
	HEADGIRL: 'be your Head Girl',
	HEADGIRLSUITE: 'live with your Head Girl',
	RECRUITER: 'recruit girls',
	AGENT: 'be your agent',
	AGENTPARTNER: 'live with your agent',
	// Facility Assignments
	ARCADE: 'be confined in the arcade',
	MADAM: 'be the Madam',
	BROTHEL: 'work in the brothel',
	WARDEN: 'be the Wardeness',
	CELLBLOCK: 'be confined in the cellblock',
	DJ: 'be the DJ',
	CLUB: 'serve in the club',
	NURSE: 'be the Nurse',
	CLINIC: 'get treatment in the clinic',
	MILKMAID: 'be the Milkmaid',
	DAIRY: 'work in the dairy',
	FARMER: 'be the Farmer',
	FARMYARD: 'work as a farmhand',
	CONCUBINE: 'be your Concubine',
	MASTERSUITE: 'serve in the master suite',
	MATRON: 'be the Matron',
	NURSERY: 'work as a nanny',
	TEACHER: 'be the Schoolteacher',
	SCHOOL: 'learn in the schoolroom',
	STEWARD: 'be the Stewardess',
	QUARTER: 'work as a servant',
	ATTENDANT: 'be the Attendant',
	SPA: 'rest in the spa',
	// Does this one exist?
	BABY_FACTORY: 'labor in the production line',
	// Other
	CHOICE: 'choose her own job',
	// Pseudo-jobs
	LURCHER: '@Lurcher',
	PIT: '@Pit',
	ARENA: "@Arena",
	IMPORTED: '@be imported',
	TANK: '@lay in tank'
});
/**
 * @type {FC.Facilities.FacilityControlledAspectFreeze}
 * @enum {string}
 * */
globalThis.FacilityControlledAspect = Object.freeze({
	APHRODISIACS: "aphrodisiacs",
	BUTTPLUG: "buttplug",
	CHASTITY: "chastity",
	CLOTHES: "clothes",
	COLLAR: "collar",
	CURATIVES: "curatives",
	CONTRACEPTIVES: "contraceptives",
	DICK_ACCESSORY: "dickAccessory",
	DIET: "diet",
	DRUGS: "drugs",
	FACE_ACCESSORY: "faceAccessory",
	HORMONES: "hormones",
	LACTATION: "lactation",
	LIVING_RULES: "livingRules",
	MOUTH_ACCESSORY: "mouthAccessory",
	REST: "rest",
	SURGERY_BOOBS_IMPLANTS: "surgeryBoobsImplants",
	SURGERY_BUTT_IMPLANTS: "surgeryButtImplants",
	SURGERY_EYES_PRESENCE: "surgeryEyesPresence",
	SURGERY_FACE_SHAPE: "surgeryFaceShape",
	SURGERY_HEIGHT: "surgeryHeight",
	SURGERY_HIPS: "surgeryHips",
	SURGERY_HOLES_VIRGINITY: "surgeryHolesVirginity",
	SURGERY_LACTATION_IMPLANTS: "surgeryLactationImplants",
	SURGERY_LIPS_IMPLANTS: "surgeryLipsImplants",
	SURGERY_PROSTATE_IMPLANT: "surgeryProstateImplant",
	SURGERY_TENDONS: "surgeryTendons",
	SURGERY_VASECTOMY: "surgeryVasectomy",
	VAGINAL_ACCESSORY: "vaginalAccessory",
	VAGINAL_ATTACHMENT: "vaginalAttachment",
});
/** @enum {FC.PersonalAttention} */
globalThis.PersonalAttention = Object.freeze({
	/** @type {FC.PersonalAttention} */
	TRADE: 'trading',
	/** @type {FC.PersonalAttention} */
	WAR: 'warfare',
	/** @type {FC.PersonalAttention} */
	SLAVING: 'slaving',
	/** @type {FC.PersonalAttention} */
	ENGINEERING: 'engineering',
	/** @type {FC.PersonalAttention} */
	MEDICINE: 'medicine',
	/** @type {FC.PersonalAttention} */
	MAID: 'upkeep',
	/** @type {FC.PersonalAttention} */
	HACKING: 'hacking',
	/** @type {FC.PersonalAttention} */
	SUPPORT_HG: 'HG',
	/** @type {FC.PersonalAttention} */
	WHORING: 'whoring',
	/** @type {FC.PersonalAttention} */
	BUSINESS: 'business',
	/** @type {FC.PersonalAttention} */
	SMUGGLING: 'smuggling',
	/** @type {FC.PersonalAttention} */
	SURVEY: 'defensive survey',
	/** @type {FC.PersonalAttention} */
	DEVELOPMENT: 'development project',
	/** @type {FC.PersonalAttention} */
	TECH: 'technical accidents',
	/** @type {FC.PersonalAttention} */
	FIGHT: 'fighting',
	/** @type {FC.PersonalAttention} */
	SEX: 'sex',
	/** @type {FC.PersonalAttention} */
	RELAX: 'rest and relaxation',
	/** @type {FC.PersonalAttention} */
	PROCLAMATION: 'proclamation',
	/** @type {FC.PersonalAttention} */
	TRAINING: 'slave training',
	/** @type {FC.PersonalAttention} */
	IMAGE: 'popularity',
	/** @type {FC.PersonalAttention} */
	STUDY: 'education',
	/** @type {FC.PersonalAttention} */
	GED: 'degree',
	/** @type {FC.PersonalAttention} */
	EDUCATION: 'advanced education',
	/** @type {FC.PersonalAttention} */
	TEST: 'advanced degree',
});

/**
 * @enum {string}
 */
globalThis.DescType = Object.freeze({
	NORMAL: "normal",
	MARKET: "market",
	EVENT: "event",
	SURGERY: "surgery"
});

/**
 * @type {FC.FetishFreeze}
 * @enum {string}
 */
globalThis.Fetish = Object.freeze({
	NONE: "none",
	MINDBROKEN: "mindbroken",
	SUBMISSIVE: "submissive",
	CUMSLUT: "cumslut",
	HUMILIATION: "humiliation",
	BUTTSLUT: "buttslut",
	BOOBS: "boobs",
	SADIST: "sadist",
	MASOCHIST: "masochist",
	DOM: "dom",
	PREGNANCY: "pregnancy",
	BESTIALITY: "bestiality",
});

/** @enum {FC.BehavioralFlaw} */
globalThis.BehavioralFlaw = Object.freeze({
	/** @type {FC.BehavioralFlaw} */
	NONE: "none",
	/** @type {FC.BehavioralFlaw} */
	ARROGANT: "arrogant",
	/** @type {FC.BehavioralFlaw} */
	BITCHY: "bitchy",
	/** @type {FC.BehavioralFlaw} */
	ODD: "odd",
	/** @type {FC.BehavioralFlaw} */
	HATESMEN: "hates men",
	/** @type {FC.BehavioralFlaw} */
	HATESWOMEN: "hates women",
	/** @type {FC.BehavioralFlaw} */
	GLUTTONOUS: "gluttonous",
	/** @type {FC.BehavioralFlaw} */
	ANOREXIC: "anorexic",
	/** @type {FC.BehavioralFlaw} */
	DEVOUT: "devout",
	/** @type {FC.BehavioralFlaw} */
	LIBERATED: "liberated",
});

/**
 * @type {FC.BehavioralQuirkFreeze}
 * @enum {string}
 */
globalThis.BehavioralQuirk = Object.freeze({
	NONE: "none",
	CONFIDENT: "confident",
	CUTTING: "cutting",
	FUNNY: "funny",
	FITNESS: "fitness",
	ADORESWOMEN: "adores women",
	ADORESMEN: "adores men",
	INSECURE: "insecure",
	SINFUL: "sinful",
	ADVOCATE: "advocate",
});

/** @enum {FC.SexualFlaw} */
globalThis.SexualFlaw = Object.freeze({
	/** @type {FC.SexualFlaw} */
	NONE: "none",
	/** @type {FC.SexualFlaw} */
	HATESORAL: "hates oral",
	/** @type {FC.SexualFlaw} */
	HATESANAL: "hates anal",
	/** @type {FC.SexualFlaw} */
	HATESPEN: "hates penetration",
	/** @type {FC.SexualFlaw} */
	SHAMEFAST: "shamefast",
	/** @type {FC.SexualFlaw} */
	IDEAL: "idealistic",
	/** @type {FC.SexualFlaw} */
	REPRESSED: "repressed",
	/** @type {FC.SexualFlaw} */
	APATHETIC: "apathetic",
	/** @type {FC.SexualFlaw} */
	CRUDE: "crude",
	/** @type {FC.SexualFlaw} */
	JUDGEMENT: "judgemental",
	/** @type {FC.SexualFlaw} */
	NEGLECT: "neglectful",
	/** @type {FC.SexualFlaw} */
	CUMADDICT: "cum addict",
	/** @type {FC.SexualFlaw} */
	ANALADDICT: "anal addict",
	/** @type {FC.SexualFlaw} */
	ATTENTION: "attention whore",
	/** @type {FC.SexualFlaw} */
	BREASTEXP: "breast growth",
	/** @type {FC.SexualFlaw} */
	ABUSIVE: "abusive",
	/** @type {FC.SexualFlaw} */
	MALICIOUS: "malicious",
	/** @type {FC.SexualFlaw} */
	SELFHATING: "self hating",
	/** @type {FC.SexualFlaw} */
	BREEDER: "breeder",
	/** @type {FC.SexualFlaw} */
	ANIMALLOVER: "animal lover",
});

/**
 * @type {FC.SexualQuirkFreeze}
 * @enum {string}
 */
globalThis.SexualQuirk = Object.freeze({
	NONE: "none",
	GAGFUCK: "gagfuck queen",
	PAINAL: "painal queen",
	STRUGGLE: "strugglefuck queen",
	TEASE: "tease",
	ROMANTIC: "romantic",
	PERVERT: "perverted",
	CARING: "caring",
	UNFLINCHING: "unflinching",
	SIZEQUEEN: "size queen",
});

/**
 * @type {FC.BreastShapeFreeze}
 * @enum {string}
 */
globalThis.BreastShape = Object.freeze({
	NORMAL: "normal",
	PERKY: "perky",
	SAGGY: "saggy",
	TORPEDO: "torpedo-shaped",
	DOWNWARD: "downward-facing",
	WIDE: "wide-set",
	SPHERICAL: "spherical",
});

/**
 * @type {FC.SlaveDietFreeze}
 * @enum {string}
 */
globalThis.Diet = Object.freeze({
	HEALTHY: "healthy",
	RESTRICTED: "restricted",
	CORRECTIVE: "corrective",
	MUSCLE: "muscle building",
	FATTEN: "fattening",
	SLIM: "slimming",
	FEMALE: "XX",
	MALE: "XY",
	FUTA: "XXY",
	CUM: "cum production",
	CLEANSE: "cleansing",
	FERTILITY: "fertility",
	CALORIC: "high caloric",
});

/**
 * @type {FC.DietFreeze}
 * @enum {string}
 */
globalThis.PCDiet = Object.freeze({
	HEALTHY: "healthy",
	RESTRICTED: "restricted",
	CORRECTIVE: "corrective",
	MUSCLE: "muscle building",
	FATTEN: "fattening",
	SLIM: "slimming",
	FEMALE: "XX",
	MALE: "XY",
	FUTA: "XXY",
	CUM: "cum production",
	CLEANSE: "cleansing",
	FERTILITY: "fertility",
	CALORIC: "high caloric",
	EXOTIC: "exotic",
	MEDICINAL: "medicinal",
	WEANING: "weaning",
});

// TODO

/**
 * @type {FC.DrugFreeze}
 * @enum {string}
 */
globalThis.Drug = Object.freeze({
	NONE: "no drugs",
	GROWBREAST: "breast injections",
	GROWBUTT: "butt injections",
	GROWCLIT: "clitoris enhancement",
	GROWLIP: "lip injections",
	GROWNIPPLE: "nipple enhancers",
	GROWPENIS: "penis enhancement",
	GROWTESTICLE: "testicle enhancement",
	INTENSIVEBREAST: "intensive breast injections",
	INTENSIVEBUTT: "intensive butt injections",
	INTENSIVECLIT: "intensive clitoris enhancement",
	INTENSIVEPENIS: "intensive penis enhancement",
	INTENSIVETESTICLE: "intensive testicle enhancement",
	FERTILITY: "fertility drugs",
	SUPERFERTILITY: "super fertility drugs",
	PSYCHOSUPP: "psychosuppressants",
	PSYCHOSTIM: "psychostimulants",
	STEROID: "steroids",
	HYPERBREAST: "hyper breast injections",
	HYPERBUTT: "hyper butt injections",
	HYPERPENIS: "hyper penis enhancement",
	HYPERTESTICLE: "hyper testicle enhancement",
	HORMONEFEMALE: "female hormone injections",
	HORMONEMALE: "male hormone injections",
	PRIAPISM: "priapism agents",
	ANTIAGE: "anti-aging cream",
	APPETITESUPP: "appetite suppressors",
	HORMONEENHANCE: "hormone enhancers",
	HORMONEBLOCK: "hormone blockers",
	ATROPHYPENIS: "penis atrophiers",
	ATROPHYTESTICLE: "testicle atrophiers",
	ATROPHYCLIT: "clitoris atrophiers",
	ATROPHYLABIA: "labia atrophiers",
	ATROPHYNIPPLE: "nipple atrophiers",
	ATROPHYLIP: "lip atrophiers",
	REDISTBREAST: "breast redistributors",
	REDISTBUTT: "butt redistributors",
	SAGBGONE: "sag-B-gone",
	GROWTHSTIM: "growth stimulants",
	STIM: "stimulants",
});

/**
 * @type {FC.ConsumerDrugFreeze}
 * @enum {string}
 */
globalThis.ConsumerDrug = Object.freeze({
	GROW_LIP: "lip enhancers",
	GROW_BREAST: "breast enhancers",
	GROW_BUTT: "butt enhancers",
	GROW_HIP: "hip wideners",
	GROW_PENIS: "penis enlargers",
	GROW_CLIT: "clitoris enlargers",
	GROW_TESTICLE: "testicle enlargers",
	REDUCE_LIP: "lip reducers",
	REDUCE_BREAST: "breast reducers",
	REDUCE_BUTT: "butt reducers",
	REDUCE_PENIS: "penis reducers",
	REDUCE_CLIT: "clitoris reducers",
	REDUCE_TESTICLE: "testicle reducers",
	ENHANCE_STAMINA: "stamina enhancers",
	ENHANCE_FERTILITY: "fertility supplements",
	DETOX: "detox pills",
});

/**
 * @type {FC.FaceShapeFreeze}
 * @enum {string}
 */
globalThis.FaceShape = Object.freeze({
	MASC: "masculine",
	ANDRO: "androgynous",
	NORMAL: "normal",
	CUTE: "cute",
	SENSUAL: "sensual",
	EXOTIC: "exotic",
});

/**
 * @type {FC.GenderGenesFreeze}
 * @enum {string}
 */
globalThis.GenderGenes = Object.freeze({
	FEMALE: "XX",
	MALE: "XY",
	INVIABLE: "YY",
});

/**
 * @type {FC.GestationDrugFreeze}
 * @enum {string}
 */
globalThis.GestationDrug = Object.freeze({
	SLOW: "slow gestation",
	FAST: "speed up",
	LABOR: "labor suppressors",
});

/**
 * @type {FC.InflationLiquidFreeze}
 * @enum {string}
 */
globalThis.InflationLiquid = Object.freeze({
	NONE: "none",
	WATER: "water",
	CUM: "cum",
	MILK: "milk",
	FOOD: "food",
	APHRO: "aphrodisiac",
	CURATIVE: "curative",
	TIGHTEN: "tightener",
	URINE: "urine",
	STIM: "stimulant",
});

/**
 * @type {FC.ToyHoleFreeze}
 * @enum {string}
 */
globalThis.ToyHole = Object.freeze({
	ALL: "all her holes",
	MOUTH: "mouth",
	BOOBS: "boobs",
	PUSSY: "pussy",
	ASS: "ass",
	DICK: "dick",
});

/**
 * @type {FC.OvaryImplantTypeFreeze}
 * @enum {string}
 */
globalThis.OvaryImplantType = Object.freeze({
	NONE: 0,
	FERTILITY: "fertility",
	SYMPATHY: "sympathy",
	ASEXUAL: "asexual",
});

/**
 * @type {FC.NippleShapeFreeze}
 * @enum {string}
 */
globalThis.NippleShape = Object.freeze({
	INVERTED: "inverted",
	PARTIAL: "partially inverted",
	FLAT: "flat",
	TINY: "tiny",
	CUTE: "cute",
	PUFFY: "puffy",
	HUGE: "huge",
	FUCKABLE: "fuckable",
});

/**
 * @type {FC.SizingImplantTypeFreeze}
 * @enum {string}
 */
globalThis.SizingImplantType = Object.freeze({
	NORMAL: "normal",
	STRING: "string",
	FILLABLE: "fillable",
	ADVANCED: "advanced fillable",
	HYPER: "hyper fillable",
});

/**
 * @type {FC.SmartPiercingSettingFreeze}
 * @enum {string}
 */
globalThis.SmartPiercingSetting = Object.freeze({
	NONE: "none",
	OFF: "off",
	ALL: "all",
	NODEFAULT: "no default setting",
	RANDOM: "random",
	WOMEN: "women",
	MEN: "men",
	VANILLA: "vanilla",
	ORAL: "oral",
	ANAL: "anal",
	BOOBS: "boobs",
	SUBMISSIVE: "submissive",
	HUMILIATION: "humiliation",
	PREGNANCY: "pregnancy",
	BESTIALITY: "bestiality",
	DOM: "dom",
	MASOCHIST: "masochist",
	SADIST: "sadist",
	ANTIWOMEN: "anti-women",
	ANTIMEN: "anti-men",
});

/**
 * @type {Readonly<{MASTERED_XP: number, SEX_SLAVE_CONTRACT_COST: number}>}
 */
globalThis.Constant = Object.freeze({
	MASTERED_XP: 200,
	SEX_SLAVE_CONTRACT_COST: 1000,
});

/**
 * @type {FC.RevivalSocietyFreeze}
 * @enum {number}
 */
globalThis.RevivalSociety = Object.freeze({
	ANTEBELLUM: 0,
	ARABIAN: 1,
	AZTEC: 2,
	CHINESE: 3,
	EDO: 4,
	EGYPTIAN: 5,
	NEO_IMPERIAL: 6,
	ROMAN: 7
});

/**
 * @type {FC.FSHumanDevelopmentVectorFreeze}
 * @enum {number}
 */
globalThis.FSHumanVector = Object.freeze({
	AGE: 0,
	HEIGHT: 1,
	WEIGHT: 2,
	MODIFICATIONS: 3,
	ASSETS: 4,
	INTELLIGENCE: 5,
	GENDER: 6,
	BREEDING: 7,
	LIFE_QUALITY: 8,
});

/**
 * An enum of special IDs used mainly for {@link App.Entity.HumanState.pregSource}, but also used for {@link App.Entity.HumanState.partners} and some other things
 * @enum {FC.SpecialID}
 */
globalThis.SID = Object.freeze({
	/** @type {FC.SpecialID} -1: the player character */
	PC: -1,
	/** @type {FC.SpecialID} -2: a citizen */
	CITIZEN: -2,
	/** @type {FC.SpecialID} -3: your former master */
	FORMERMASTER: -3,
	/** @type {FC.SpecialID} -4: another arcology owner */
	ARCOWNER: -4,
	/** @type {FC.SpecialID} -5: one of your clients */
	CLIENT: -5,
	/** @type {FC.SpecialID} -6: a social elitist */
	ELITE: -6,
	/** @type {FC.SpecialID} -7: a designer baby made in the lab */
	LAB: -7,
	/** @type {FC.SpecialID} -8: an animal */
	ANIMAL: -8,
	/** @type {FC.SpecialID} -9: a futanari sister */
	FUTA: -9,
	/** @type {FC.SpecialID} -10: a rapist */
	RAPIST: -10,
	/** @type {FC.SpecialID} 0: unidentifiable or unknown */
	GENERIC: 0,
});
