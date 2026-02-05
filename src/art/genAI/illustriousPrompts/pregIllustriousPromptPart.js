App.Art.GenAI.Ill.PregPromptPart = class PregPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (this.censored) {
			return [];
		}

		if (this.slave.bellyPreg >= this.slave.bellyFluid) {
			/**
			 * how big their belly is in CCs
			 *
			 * ||thresholds:|
			 * |-|-|
			 * 100	| bloated
			 * 1500   | early pregnancy
			 * 5000   | obviously pregnant
			 * 10000  | very pregnant
			 * 15000  | full term
			 * 30000  | full term twins
			 * 45000  | full term triplets
			 * 60000  | full term quads
			 * 75000  | full term quints
			 * 90000  | full term sextuplets
			 * 105000 | full term septuplets
			 * 120000 | full term octuplets
			 * 150000 | oversized pregnancy
			 * 300000 | hyperpreg state 1
			 * 450000 | hyperpreg state 2
			 * 600000 | hyperpreg state 3
			 * 750000 | hyperpreg state 4
			 */
			if (this.slave.belly < 100) {
				return [];
			} else if (this.slave.belly < 5000) {
				return ["(belly:1.2)"];
			} else if (this.slave.belly < 8000) {
				return ["early pregnancy"];
			} else if (this.slave.belly < 30000) {
				return ["pregnant"];
			} else if (this.slave.belly < 100000) {
				return ["hyper pregnancy"];
			} else if (this.slave.belly < 150000) {
				return ["(hyper pregnancy:1.2)"];
			} else if (this.slave.belly < 300000) {
				return ["(hyper pregnancy:1.5)"];
			} else if (this.slave.belly < 600000) {
				return ["(hyper pregnancy:1.7)"];
			} else {
				return ["(hyper pregnancy:2.0)"];
			}
		} else {
			/**
			 * how big their belly is in CCs (fluid distension only)
			 *
			 * ||thresholds|
			 * |-|-|
			 * 100   | bloated
			 * 2000  | clearly bloated (2 L)
			 * 5000  | very full (~1 gal)
			 * 10000 | full to bursting (~2 gal)
			 */
			if (this.slave.bellyFluid < 5000) {
				return ["early pregnancy"];
			} else if (this.slave.bellyFluid < 10000) {
				return ["pregnant"];
			}  else {
				return ["hyper pregnancy"];
			}
		}
	}
};
