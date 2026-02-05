App.Art.GenAI.Ill.HeightPromptPart = class HeightPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.slave.height < 150) {
			if (this.slave.weight > 30) {
				if (V.aiAgeFilter) {
					return ["shortstack"];
				} else {
					return ["shortstack, loli"];
				}
			} else {
				if (V.aiAgeFilter) {
					return ["petite"];
				} else {
					return ["petite, loli"];
				}
			}
		} else if (this.slave.height > 180) {
			if (this.isFeminine) {
				return ["tall"];
			} else {
				return ["tall"];
			}
		}

		return [];
	}
};
