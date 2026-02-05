declare namespace FC {
	/**@deprecated */
	type SlaveStateOrZero = Zeroable<SlaveState>;
	/**@deprecated */
	type HumanStateOrZero = Zeroable<HumanState>;

	type DefaultGameStateVariables = typeof App.Data.defaultGameStateVariables;
	type ResetOnNGPVariables = typeof App.Data.resetOnNGPlus;

	interface Enunciation {
		title: string;
		say: string;
	}

	interface Rival {
		/**
		- 0: Init
		- 1: Not established
		- 2: Established
		- 3: Captured
		- 4: Killed / Accepted offer
		- 5: Enslaved
		 */
		state: number;
		duration: number;
		prosperity: number;
		power: number;
		race?: FC.Race;
		/**
		- 1: Female
		- 2: Male
		 */
		gender?: number;
		ID?: number;
		FS: {
			name: string;
			race?: FC.Race;
			adopted?: number;
		}
		/**
			- 0: Unknown / Gone
			- 1: Announced
			- 2: Rescued
			- 3: Given in. Currently unused, is checked but commented out within src/endWeek/saDevotion.js
			*/
		hostageState: number,
	}

	interface Peacekeepers {
		/**
		- 0: Gone
		- 1: Not established
		- 2: Established
		- 3: Independent
		 */
		state: number;
		generalName?: string;
		strength?: number;
		attitude?: number;
		undermining?: number;
		influenceAnnounced?: number;
		tastes?: string;
	}

	export type RecruiterTarget = "desperate whores" | "young migrants" | "recent divorcees" |
		"expectant mothers" | "dissolute sissies" | "reassignment candidates" | "other arcologies";

	interface DeprecatedGameVariables {
		/** @deprecated */
		surgeryType: string;

		/** @deprecated */
		relationLinks?: Record<number, {father: number, mother: number}>;

		/** @deprecated */
		spire: number;
		/** @deprecated */
		customPronouns?: Record<number, Data.Pronouns.Definition>;
		/** @deprecated */
		returnTo: string;
	}

	export type HeadGirlTraining = "health" | "paraphilia" | "soften" | "flaw" | "obedience" |
		"entertain skill" | "oral skill" | "fuck skill" | "penetrative skill" | "anal skill" | "whore skill";

	export interface HeadGirlTrainee {
		ID: number;
		training: HeadGirlTraining;
	}

	export interface ReminderEntry {
		message: string | Node;
		week: number;
		category: string;
		slaveID?: number;
	}

	export interface SlaveTrinketData {
		name: string,
		id?: number | null
		extra?: string,
		napkinShape?: string,
	}

	export interface TrinketData {
		slaveTrinket: boolean,
		/** if slaveTrinket is false this is used to keep track of how many of the given trinket the player has */
		count? : number,
		data? : Set<SlaveTrinketData>,
	}

	/**
	 * These variables shall not be in the game state and there is a hope they will be exterminated in the future
	 */
	interface TemporaryVariablesInTheGameState {
		brothelSpots?: number;
		clubSpots?: number;
		dairySpots?: number;
		brothelSlavesGettingHelp?: number;
		clubSlavesGettingHelp?: number;

		milkmaidDevotionThreshold?: number;
		milkmaidDevotionBonus?: number;
		milkmaidTrustThreshold?: number;
		milkmaidTrustBonus?: number;
		milkmaidHealthBonus?: number;

		event?: InstanceType<typeof App.Events.BaseEvent>;

		arcadeDemandDegResult?: 1 | 2 | 3 | 4 | 5;

		heroSlaves: HeroSlaveTemplate[]; // TODO: leave this here until custom hero slave are reworked
	}

	export interface TransitionObject {
		[key: string]: any; // lets anything be stored in here while also allowing some properties to be typed without TSC screaming at us

		// Starting Passages
		/** if true then we will pick 3-6 random heros from the hero slave database instead of using the normal cheat slaves */
		newCheatGirls?: boolean;
		/** allows the player to change the amount of cash they start with. Doesn't change V.cheater. Deleted after the starting girls passage */
		limitedCheatStart?: boolean;

		// Misc
		/** a slave ID for the active slave */
		AS?: HumanID;
		/**
		 * use V.temp.AS instead if the actor exists on the game state.
		 * use this if the data doesn't exist on the game state yet and needs to traverse passages.
		 */
		activeSlave?: Zeroable<SlaveState>;
		/** the index of the active fetus in V.AS's womb */
		activeFetus?: number;
		/** a slave ID */
		swappingSlave?: HumanID;
		gameover?:
			"idiot ball" | "debt" | "birth complications" | "ownership" |
			"sisters" | "major battle defeat" | "Rebellion defeat" |
			"Idiot Ball 2 The Dumbassening" |
			"Idiot Ball 3 Totally Not Idiot Ball 2 Again" |
			"starving citizens" | "loanshark" | "no slaves";
		prostheticsConfig?:
			"main" | "hearing" | "voice" | "detachTail" | "attachTail" |
			"detachAppendages" | "attachAppendages" |
			"attachWings";
		/** how many slaves can the player import into their new game when using New Game Plus */
		slavesToImportMax?: number;
		/** the currently selected arcology; used for neighbor interaction */
		activeArcologyIdx?: number;
		showEmptyBudgetEntries?: {
			cash?: Bool;
			rep?: Bool;
		};
		/** Used in the cheat editor; The edited actor */
		cheatActor?: FC.HumanState;
		applyCareerBonus?: Bool;
		careerBonusNeeded?: HumanID[];

		customLanguage?: string;
		
		/** track impreg actions made to slaves */
		slaveIdsImpregnanted?: Set<number>
	}

	export interface GameVariables extends DefaultGameStateVariables, ResetOnNGPVariables,
		DeprecatedGameVariables, TemporaryVariablesInTheGameState {}
}
