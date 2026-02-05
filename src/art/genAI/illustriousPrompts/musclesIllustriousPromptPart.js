App.Art.GenAI.Ill.MusclesPromptPart = class MusclesPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.slave.muscles > 95) {
			return ['muscular, bodybuilder'];
		} else if (this.slave.muscles > 60) {
			return ['muscular'];
		} else if (this.slave.muscles > 30) {
			return ['toned'];
		} else {
			return ['slim'];
		}
	}

	/**
	 * @override
	 */
	negative() {
		if (this.slave.muscles < -10) {
			return [`muscular, toned`];
		}
		return [];
	}
};
