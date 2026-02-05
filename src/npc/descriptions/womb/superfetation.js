/**
 * @param {FC.SlaveState} slave
 * @param {DescType} descType
 * @returns {string}
 */
App.Desc.superfetation = function(slave, descType) {
	function daddyName(daddyID) {
		if (daddyID > 0) {
			const lsd = findFather(daddyID);
			if (lsd) {
				return SlaveFullName(lsd);
			}
		} else if (daddyID in V.missingTable && V.showMissingSlaves) {
			return V.missingTable[daddyID].fullName;
		}
		return "another slave";
	}

	const r = [];
	const {
		his, His
	} = getPronouns(slave);
	const slaveWD = WombGetLittersData(slave);
	if (slave.geneticQuirks.superfetation === 2 && slaveWD.litters.length > 1 && V.pregnancyMonitoringUpgrade === 1 && descType !== DescType.MARKET) {
		r.push(`${His} womb contains ${num(slaveWD.litters.length)} separate pregnancies:`);
		for (let litCount = 0; litCount < slaveWD.litters.length; litCount++) {
			const countLitter = slaveWD.litterData[litCount].length;
			const is = countLitter > 1 ? "are" : "is";
			const was = countLitter > 1 ? "were" : "was";
			if (litCount === 0) {
				r.push(`the eldest`);
			} else if (litCount === slaveWD.litters.length - 1) {
				r.push(`and the youngest`);
			} else {
				r.push(`the next`);
			}
			if (countLitter > 1) {
				r.push(`set of ${num(countLitter)},`);
			} else {
				r.push(`one,`);
			}
			r.push(`at ${numberWithPluralOne(slaveWD.litters[litCount], "week")} of development,`);
			if (slaveWD.litterData[litCount][0].fatherID === SID.LAB) {
				r.push(`${is} from the gene lab`);
			} else if (slaveWD.litterData[litCount][0].age > slave.pregData.normalBirth / 8) {
				if (slaveWD.litterData[litCount][0].fatherID === SID.PC) {
					r.push(`${was} fathered by your seed`);
				} else if (slaveWD.litterData[litCount][0].fatherID === SID.CITIZEN) {
					r.push(`${was} fathered by one of your citizens`);
				} else if (slaveWD.litterData[litCount][0].fatherID === SID.FORMERMASTER) {
					r.push(`${was} fathered by your former Master`);
				} else if (slaveWD.litterData[litCount][0].fatherID === SID.ARCOWNER) {
					r.push(`${was} fathered by another arcology owner`);
				} else if (slaveWD.litterData[litCount][0].fatherID === SID.CLIENT) {
					r.push(`${was} fathered by one of your clients`);
				} else if (slaveWD.litterData[litCount][0].fatherID === SID.ELITE) {
					r.push(`${was} fathered by a member of the Societal Elite`);
				} else if (slaveWD.litterData[litCount][0].fatherID === SID.FUTA) {
					r.push(`${was} fathered by the Futanari Sisters`);
				} else if (slaveWD.litterData[litCount][0].fatherID === SID.GENERIC) {
					r.push(`${is} from an unidentifiable source`);
				} else if (slaveWD.litterData[litCount][0].fatherID === slave.ID) {
					r.push(`${is} from ${his} own handiwork`);
				} else {
					r.push(`${was} fathered by ${daddyName(slaveWD.litterData[litCount][0].fatherID)}'s seed`);
				}
			} else {
				r.push(`${is} too young to tell the father of`);
			}
			if (litCount === slaveWD.litters.length - 1) {
				r.push(r.pop() + `.`);
			} else if (slaveWD.litters.length > 3) {
				r.push(r.pop() + `;`);
			} else {
				r.push(r.pop() + `,`);
			}
		}
	}
	return r.join(" ");
};
