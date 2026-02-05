/* eslint-disable no-undef */
"use strict";
/* Main SugarCube configuration file. */

/* Change the starting passage from the default 'start' to 'Alpha disclaimer'. */
Config.passages.start = "Alpha disclaimer";

/* Set description used by Save, for all passages, to give some decent information about game state. */
Config.saves.descriptions = function() {
	let sv = State.variables;
	if (sv.arcologies === undefined || sv.arcologies.length === 0) {
		// no arcology yet...
		return "New Game Setup, Week 0";
	} else {
		return `${App.Utils.isEndWeek() ? "EW! " : ""}${sv.arcologies[0].name}, Week ${sv.week}, ${sv.slaves.size} Slaves, ${cashFormat(sv.cash)}`;
	}
};

/* Disable forward/back buttons in panel. */
Config.history.controls = false;

/* Set Autosaves. */
Config.saves.maxAutoSaves = 1;

/* Save only one game state. */
Config.history.maxStates = 1;

/* Set to 'true' to enable SugarCube's debug mode.
Note: This is an 'engine level' debug mode, completely separate from the game's debug mode. */
Config.debug = false;

/* Set maximum loop iterations. Among other things, this controls the maximum number of slaves the player can own. */
Config.macros.maxLoopIterations = 5000;
