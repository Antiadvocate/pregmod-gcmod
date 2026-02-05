App.Art.GenAI.Ill.AgePromptPart = class AgePromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		let ageTags = ``;
		if (this.slave.visualAge < 5) {
			ageTags = "loli, toddler";
		} else if (this.slave.visualAge < 10) {
			ageTags = `loli, child`;
		} else if (this.slave.visualAge < 16) {
			ageTags = `teen`;
		} else if (this.slave.visualAge < 25) {
			ageTags = `young adult`;
		} else if (this.slave.visualAge < 40) {
			ageTags = `adult, mature`;
		} else if (this.slave.visualAge < 60) {
			if (this.isFeminine) {
				ageTags = `milf`;
			} else {
				ageTags = `dilf`;
			}
		} else {
			ageTags = `elderly`;
		}
		let grade = "";
		if (this.slave.visualAge < 18 && V.aiAgeFilter) {
			if (this.slave.visualAge < 5) {
				grade = "preschooler";
			} else if (this.slave.visualAge < 7) {
				grade = "kindergartner";
			} else {
				grade = ordinalSuffixWords(this.slave.visualAge - 6) + " grader";
			}
		}
		return [ageTags, this.censored ? grade : `${this.slave.visualAge} year old`];
	}
};
