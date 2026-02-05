App.Art.GenAI.Ill.PosturePromptPart = class PosturePromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		const slave = asSlave(this.slave);
		const customPrompt = slave?.custom?.aiPrompts?.pose;
		if (customPrompt) {
			return [customPrompt];
		}

		const parts = [];

		let expressiveSex = false;

		if (isAmputee(this.slave)) {
			parts.push(`on chair`); // posture change prevents genning arms/legs, looks more natural
		} else if (isQuadrupedal(this.slave)) {
			parts.push(`all fours`);
		} else if (!canStand(this.slave) || slave?.fuckdoll !== 0) {
			parts.push("kneeling");
		} else {
			switch (slave?.assignment) {
				case Job.ARENA: // training
				case Job.PIT: // fighting
				case Job.MADAM:
				case Job.WARDEN:
				case Job.TEACHER:
				case Job.DJ:
				case Job.BODYGUARD:
				case Job.MILKMAID:
				case Job.HEADGIRL:
				case Job.HEADGIRLSUITE:
				case Job.HOUSE:
				case Job.QUARTER:
				case Job.STEWARD:
				case Job.ATTENDANT:
				case Job.NURSE:
				case Job.AGENT:
				case Job.AGENTPARTNER:
				case Job.FARMER:
				case Job.FARMYARD:
				case Job.MATRON: // head nursery nanny
				case Job.NURSERY: // nanny
				case Job.LURCHER:
					parts.push("standing");
					break;
				case Job.ARCADE:
					parts.push("(all fours), bent over, elbows on ground");
					break;
				case Job.CLUB:
				case Job.GLORYHOLE:
				case Job.PUBLIC:
					if (this.slave.height < 150 || this.slave.visualAge < 14) {
						parts.push("standing");
					} else {
						parts.push("kneeling");
					}
					break;
				case Job.FUCKTOY:
				case Job.BROTHEL:
				case Job.CONCUBINE:
				case Job.MASTERSUITE:
					expressiveSex = true;
					parts.push("on back, spread legs");
					break;
				case Job.CELLBLOCK:
				case Job.CONFINEMENT:
					parts.push("sitting, on ground");
					break;
				case Job.CLASSES:
				case Job.SCHOOL:
				case Job.RECRUITER:
				case Job.TANK:
					parts.push("sitting, on chair");
					break;
				case Job.CLINIC:
					parts.push("on back, resting, sleeping, closed eyes");
					break;
				case Job.SPA:
				case Job.REST:
					parts.push("resting");
					break;
				case Job.WHORE:
					expressiveSex = true;
					parts.push("standing, bent over");
					break;
				case Job.MILKED:
				case Job.DAIRY:
					parts.push("standing, bent over, milking machine");
					break;
				case Job.SUBORDINATE:
				case undefined:
				default:
					parts.push("hallway");
					break;
			}
		}

		if (!isAmputee(this.slave) && !isQuadrupedal(this.slave)) { // no arms pose for amputees and quadrupeds
			if (slave?.fuckdoll !== 0) {
				parts.push("arms at side");
			} else if (this.slave.devotion < -20) {
				if (expressiveSex) {
					parts.push("covering crotch, covering breasts");
				} else {
					if (this.slave.devotion < -20) {
						parts.push(`from side, crossed arms`);
					} else {
						parts.push(`crossed arms`);
					}
				}
			} else if (expressiveSex) {	// these are only valid for not hating and expressive sex work slaves
				if (this.slave.devotion < 21) {
					// doesn't like master
					parts.push("arms at side");
				} else if (this.slave.devotion < 96) {
					// willing
					if (slave?.vagina !== -1) {
						parts.push(`spread pussy`);
					}
				} else {
					// excited
					if (slave?.vagina !== -1) {
						parts.push(`spread pussy, masturbation`);
					}
				}
			}
		}

		if (slave?.fuckdoll !== 0) {
			// do nothing
		} else if (slave?.trust < -50) {
			parts.push(`trembling, head down`);
		} else if (slave?.trust < -20) {
			parts.push(`trembling`);
		}

		return parts;
	}

	/**
	 * @override
	 */
	negative() {
		const slave = asSlave(this.slave);

		let fromAboveWork =
			slave?.assignment === Job.GLORYHOLE ||
			slave?.assignment === Job.PUBLIC ||
			slave?.assignment === Job.FUCKTOY ||
			slave?.assignment === Job.BROTHEL ||
			slave?.assignment === Job.CONCUBINE ||
			slave?.assignment === Job.MASTERSUITE ||
			slave?.assignment === Job.WHORE ||
			slave?.assignment === Job.MILKED ||
			slave?.assignment === Job.DAIRY;

		if (fromAboveWork || !canWalk(this.slave) || isAmputee(this.slave)) {
			return [];
		} else {
			return ["from above"];
		}
	}
};
