import {StoryMoment, Passage} from "twine-sugarcube";

declare module "twine-sugarcube" {
	interface SugarCubeStoryVariables extends FC.GameVariables {
	}

	interface SugarCubeSetupObject {
		// Any usages of the global setup object should be replaced by App.Data.misc
	}

	// These are SugarCube private APIs used in the project
	interface StateAPI {
		expired: StoryMoment[];
		clearTemporary(): void;
		/**
		 * Restores the game state to the last state it was in.
		 * Usually the state that it was in when the latest passage was loaded
		 */
		restore(): void;
	}

	interface UIBarAPI {
		update(): void;
	}

	interface SerialAPI {
		/**
		 * Converts a JavaScript Object Notation (JSON) string with custom revival methods into an object.
		 * @param text A valid JSON string created using Serial.stringify().
		 * @param reviver A function that transforms the results. This function is called for each member of the object.
		 * If a member contains nested objects, the nested objects are transformed before the parent object is.
		 */
		parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;
		/**
		 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string with custom revival methods.
		 * @param value A JavaScript value, usually an object or array, to be converted.
		 * @param replacer A function that transforms the results.
		 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
		 */
		stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
	}
}

export {};
