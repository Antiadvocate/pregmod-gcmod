App.Art.GenAI.TailPromptPart = class TailPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const parts = [];
		// Add a simple generic tail tag whenever a prosthetic tail is attached
		if (this.helper.hasTail(this.slave)) {
			parts.push("tail");
		}
		// Sex tail: prompt a succubus tail explicitly
		if (this.slave.tail === "sex") {
			parts.push("succubus tail");
			return parts;
		}
		// Combat tail: generic mechanical tail description
		if (this.slave.tail === "combat") {
			parts.push("mechanical tail");
			return parts;
		}
		// Stinger tail: prompt explicitly
		if (this.slave.tail === "stinger") {
			parts.push("stinger tail");
			return parts;
		}
		if (this.slave.tailShape && this.slave.tailShape !== "none") {
			parts.push(`${this.slave.tailShape} tail`);
		}
		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		const parts = [];
		const noCustomEars = (
			this.slave.earT === "none" &&
			["normal", "none", "holes", "damaged"].includes(this.slave.earShape)
		);
		if (this.slave.tail === "sex") {
			// Sex tails tend to imply demonic features like wings/horns; push them to negatives
			const hasWings = (
				(this.slave.appendages === "mod" && this.slave.wingsShape && this.slave.wingsShape !== "none") ||
				this.slave.appendages === "flight" ||
				this.slave.appendages === "falcon"
			);
			if (!hasWings) {
				parts.push("wings");
			}
			if (this.slave.horn === "none") {
				parts.push("horns");
			}
			// Avoid the model adding animal/cat ears when a tail is present
			if (noCustomEars) {
				parts.push("animal ears", "cat ears");
			}
			return parts;
		}
		if (this.slave.tail === "stinger") {
			if (this.slave.horn === "none") {
				parts.push("horns");
			}
			if (noCustomEars) {
				parts.push("animal ears", "cat ears");
			}
			return parts;
		}
		if (this.slave.tail === "combat") {
			// Mechanical tails can also cause the model to add animal ears
			if (noCustomEars) {
				parts.push("animal ears", "cat ears");
			}
		}
		if (this.slave.tail === "mod" && this.slave.tailShape && this.slave.tailShape !== "none" && noCustomEars) {
			parts.push(`(animal ears, ${this.slave.tailShape} ears:2)`);
			// Also explicitly downweight generic cat ears
			parts.push("cat ears");
		}
		return parts;
	}
};
