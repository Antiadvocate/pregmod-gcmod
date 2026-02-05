/**
 * @file channels.init.js - FCTV Channels Initialization
 *
 * This file initializes the channels Map that will be populated by individual channel files.
 * Must load before any channel definitions.
 */

// Initialize FCTV data namespace
if (!App.Data.FCTV) {
	App.Data.FCTV = /** @type {any} */ ({});
}

// Initialize channels Map
// Individual channel files will populate this with .set(id, channelData)
App.Data.FCTV.channels = new Map();

// TypeScript definitions for channel structure
/**
 * @typedef {object} FctvChannel
 * @property {FctvTags} [tags] - Content tags for filtering
 * @property {boolean} [disableSelection] - Whether channel can be selected
 * @property {boolean} loop - After initial viewing, should episodes continue in order?
 * @property {string | Function} [intro] - Channel introduction text or function
 * @property {FctvEpisode[]} episode - Array of episodes
 * @property {function(FC.SlaveState, number):string | Node} [outro] - Outro function taking slave and episode number
 */

/**
 * @typedef {object} FctvEpisode
 * @property {string} [title] - Episode title for code organization and display
 * @property {FctvTags} [tags] - Episode-specific content tags
 * @property {FC.SlaveState[]} [slaves] - Actors appearing in this episode
 * @property {(function():string) | string} text - Episode content (HTML embedded)
 */

/**
 * @typedef {object} FctvTags
 * Tags for filtering and categorizing FCTV content. All tags are optional boolean flags.
 * Multiple tags can be combined to accurately describe episode content.
 *
 * Core Content Warnings - Primary content filters for player preferences
 * @property {boolean} [preg] - Pregnancy content (standard pregnancy, any stage)
 * @property {boolean} [hyperPreg] - Hyper-pregnancy content (extreme multiples, rapid pregnancy, fantasy pregnancy)
 * @property {boolean} [loli] - Loli content (restricted by player age preference settings)
 * @property {boolean} [extreme] - Extreme content (very intense or unusual acts, heavy kink)
 * @property {boolean} [dicks] - Male genitalia content (filtered by V.seeDicks setting)
 * @property {boolean} [incest] - Incest content (family relationships, biological or adopted)
 * @property {boolean} [adult] - Adult content (general sexual content flag)
 * @property {boolean} [violence] - Violent content (physical violence, combat, graphic injury)
 */
