App.Art.GenAI.GenderPromptPart = class GenderPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let prompt;

		function ageGenderWord(isFeminine, visualAge) {
			if (visualAge < 18) return isFeminine ? "young woman" : "young man";
			if (visualAge >= 30) return isFeminine ? "mature woman" : "mature man";
			return isFeminine ? "woman" : "man";
		}

		if (this.isFeminine) {
			prompt = "solo, ";
			if (this.slave.race === "catgirl") {
				prompt += "catgirl, catperson" + this.helper.lora("CatgirlLoraV7", .8, "", " ");
			} else {
				prompt += ageGenderWord(true, this.slave.visualAge);
			}
		} else if (this.isMasculine) {
			prompt = "solo, ";
			if (this.slave.race === "catgirl") {
				prompt += "catboy, catperson" + this.helper.lora("CatgirlLoraV7", .8, "", " ");
			} else {
				prompt += ageGenderWord(false, this.slave.visualAge);
			}
		} else {
			if (this.slave.race === "catgirl") {
				prompt = "catperson" + this.helper.lora("CatgirlLoraV7", .8, "", " ");
			} else {
				return [];
			}
		}
		return [prompt];
	}


	/**
	 * @override
	 */
	negative() {
		let facialHair = this.slave.hormoneBalance > -20 ? "beard, mustache, " : ""; // NG make permanent part of negative prompt?
		if (this.isFeminine) {
			if (perceivedGender(this.slave) < -1) {  // Feminine hormone but Masculine appearing
				return [];
			} else { // Feminine hormone, Feminine appearing
				return [`${facialHair}man, boy`];
			}
		}
		if (this.isMasculine) {
			if (perceivedGender(this.slave) > 1) { // Masculine hormone but Feminine appearing
				return [];
			} else { // Masculine hormone, Masculine appearing
				return [`${facialHair}woman, girl`];
			}
		}
		return [];
	}
};
