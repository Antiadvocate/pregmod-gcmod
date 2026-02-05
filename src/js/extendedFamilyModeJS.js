/* see documentation for details /devNotes/Extended Family Mode Explained.txt */

/** @typedef MinRelative
 * A minimal object that represents an entity in a family tree. Represents properties shared by HumanState, GenepoolRecord, and MissingTableEntry.
 * Does not carry information about the exact nature of sibling relationships (twinning, gender, etc); only usable by the boolean predicates to help find distant relatives.
 * @type {object}
 * @property {number} ID
 * @property {number} mother
 * @property {number} father
 * @property {string} slaveName
 * @property {FC.Zeroable<string>} slaveSurname
 */

/** Given an ID, gets at least a minimal relative entry that represents that ID, from wherever it may be.
 * Returns null if the relative with that ID doesn't exist.
 * @param {number} ID
 * @returns {MinRelative}
 */
globalThis.getMinRelative = function(ID) {
	const relative = getRelative(ID);
	if (relative) {
		return relative;
	}
	const missingEntry = V.missingTable[ID];
	if (missingEntry) {
		return missingEntry;
	}
	return null;
};

/** @typedef Relative
 * An object that represents an entity in a family tree. Represents a group of common properties shared by SlaveState, InfantState, and PlayerState, as well as genepool objects.
 * @type {object}
 * @property {number} ID
 * @property {number} mother
 * @property {number} father
 * @property {string} slaveName
 * @property {FC.Zeroable<string>} slaveSurname
 * @property {number} actualAge
 * @property {number} birthWeek
 * @property {string} genes
 */

/** Given an ID, gets a relative entry that represents that ID, from wherever it may be.
 * Returns null if the relative with that ID doesn't exist.
 * @param {number} ID
 * @returns {Relative}
 */
globalThis.getRelative = function(ID) {
	if (ID === 0) {
		return null; // no need to check anything
	}
	// PC
	if (ID === SID.PC) {
		return V.PC;
	}
	// active slave, child, or tank baby
	const slave = findFather(ID);
	if (slave) {
		return slave;
	}
	// ex-slave
	const genePool = getGenePoolRecordWriteMode(ID);
	if (genePool) {
		return genePool;
	}
	return null;
};

/** Returns true if mother is the mother of daughter
 * @param {MinRelative} daughter
 * @param {MinRelative} mother
 * @returns {boolean}
 */
globalThis.isMotherP = function(daughter, mother) {
	return daughter.mother === mother.ID;
};

/** Returns true if father is the father of daughter
 * @param {MinRelative} daughter
 * @param {MinRelative} father
 * @returns {boolean}
 */
globalThis.isFatherP = function(daughter, father) {
	return daughter.father === father.ID;
};

/** Returns true if parent is either the father or mother of daughter
 * @param {MinRelative} daughter
 * @param {MinRelative} parent
 * @returns {boolean}
 */
globalThis.isParentP = function(daughter, parent) {
	return isMotherP(daughter, parent) || isFatherP(daughter, parent);
};

/** Returns true if grandmother is the grandmother of granddaughter
 * @param {MinRelative} granddaughter
 * @param {MinRelative} grandmother
 * @returns {boolean}
 */
globalThis.isGrandmotherP = function(granddaughter, grandmother) {
	if (!V.showDistantRelatives) {
		return false;
	}

	const father = getMinRelative(granddaughter.father);
	const mother = getMinRelative(granddaughter.mother);
	return (mother && (mother.mother === grandmother.ID)) ||
		(father && (father.mother === grandmother.ID));
};

/** Returns true if grandfather is the grandfather of granddaughter
 * @param {MinRelative} granddaughter
 * @param {MinRelative} grandfather
 * @returns {boolean}
 */
globalThis.isGrandfatherP = function(granddaughter, grandfather) {
	if (!V.showDistantRelatives) {
		return false;
	}

	const father = getMinRelative(granddaughter.father);
	const mother = getMinRelative(granddaughter.mother);
	return (mother && (mother.father === grandfather.ID)) ||
		(father && (father.father === grandfather.ID));
};

/** Returns true if grandparent is the either the grandmother or grandfather of granddaughter
 * @param {MinRelative} granddaughter
 * @param {MinRelative} grandparent
 * @returns {boolean}
 */
globalThis.isGrandparentP = function(granddaughter, grandparent) {
	if (!V.showDistantRelatives) {
		return false;
	}

	return isGrandmotherP(granddaughter, grandparent) || isGrandfatherP(granddaughter, grandparent);
};

/** Returns true if slave1 and slave2 share the same father
 * @param {MinRelative} slave1
 * @param {MinRelative} slave2
 * @returns {boolean}
 */
globalThis.sameDad = function(slave1, slave2) {
	return (slave1.father === slave2.father) && (specificDad(slave1));
};

/** Returns true if slave1 and slave2 share the same mother
 * @param {MinRelative} slave1
 * @param {MinRelative} slave2
 * @returns {boolean}
 */
globalThis.sameMom = function(slave1, slave2) {
	return (slave1.mother === slave2.mother) && (specificMom(slave1));
};

/** Returns true if slave1 and slave2 have at least one common parent
 * @param {MinRelative} slave1
 * @param {MinRelative} slave2
 * @returns {boolean}
 */
globalThis.sameParent = function(slave1, slave2) {
	return sameMom(slave1, slave2) || sameDad(slave1, slave2);
};

/** Returns true if ID represents a unique, specific, and traceable character; false if it represents a nonspecific or group ID.
 * @param {number} ID
 * @returns {boolean}
 */
globalThis.specificCharacterID = function(ID) {
	return (
		ID > 0 ||		          // active slave
		ID < -20 ||		          // missing slave
		ID === SID.PC ||	      // player
		ID === SID.FORMERMASTER   // player's old master
	);
};

/** Returns true if the father of slave is a specific, unique character (current or former slave, or the PC)
 * @param {MinRelative} slave
 * @returns {boolean}
 */
globalThis.specificDad = function(slave) {
	return specificCharacterID(slave.father);
};

/** Returns true if the mother of slave is a specific, unique character (current or former slave, or the PC)
 * @param {MinRelative} slave
 * @returns {boolean}
 */
globalThis.specificMom = function(slave) {
	return specificCharacterID(slave.mother);
};

/** Returns true if aunt is the aunt of niece
 * @param {MinRelative} niece
 * @param {MinRelative} aunt
 * @returns {boolean}
 */
globalThis.isAunt = function(niece, aunt) {
	if (!V.showDistantRelatives) {
		return false;
	}

	if (!niece || !aunt || (niece.ID === aunt.ID)) {
		return false;
	}
	const father = getMinRelative(niece.father);
	const mother = getMinRelative(niece.mother);
	if (mother && (mother.ID !== aunt.ID) && !sameTParent(mother, aunt) && sameMom(mother, aunt) && sameDad(mother, aunt)) {
		return true;
	} else if (father && (father.ID !== aunt.ID) && !sameTParent(father, aunt) && sameMom(father, aunt) && sameDad(father, aunt)) {
		return true;
	}

	return false;
};

/** catches the case where a mother is a father or a father a mother - thank you familyAnon, for this code
 * @param {MinRelative} slave1
 * @param {MinRelative} slave2
 * @returns {0|1|2|3}
 */
globalThis.sameTParent = function(slave1, slave2) {
	if (specificMom(slave1) && slave1.mother === slave1.father && slave1.mother === slave2.mother && slave1.mother === slave2.father) {
		return 1; // the slaves have only one total parent between them (i.e. they're both products of the same actor's selfcest)
	} else if (slave1.mother === slave2.father && slave1.father === slave2.mother && specificMom(slave1) && specificDad(slave1) && slave1.mother !== slave1.father) {
		return 2; // both parents are shared but they've swapped roles
	} else if ((slave1.mother === slave2.father || slave1.father === slave2.mother) && specificMom(slave1) && specificMom(slave2) && slave1.mother !== slave1.father) {
		return 3; // one parent is shared, but in a different role
	}
	return 0;
};

/** Returns the degree of siblinghood shared by two entities
 * @param {Relative} slave1
 * @param {Relative} slave2
 * @returns {number} - 0: not siblings; 1: twins; 2: full siblings; 3: half-siblings
 */
globalThis.areSisters = function(slave1, slave2) {
	if (slave1.ID === slave2.ID) {
		return 0; // you are not your own sister
	} else if (!specificDad(slave1) && !specificMom(slave1)) {
		return 0; // not related
	} else {
		if (!sameDad(slave1, slave2) && sameMom(slave1, slave2)) {
			return 3; // half sisters
		} else if (sameDad(slave1, slave2) && !sameMom(slave1, slave2)) {
			return 3; // half sisters
		} else if (sameTParent(slave1, slave2) === 3) {
			return 3; // half sisters
		} else if (sameTParent(slave1, slave2) === 2) {
			return 2; // sisters
		} else if (sameDad(slave1, slave2) && sameMom(slave1, slave2)) {
			if (slave1.actualAge === slave2.actualAge && slave1.birthWeek === slave2.birthWeek) {
				return 1; // twins
			} else {
				return 2; // sisters
			}
		} else {
			return 0; // not related
		}
	}
};

/** Returns true if two entities are simple first cousins (i.e. at least one parent of one slave is a full sibling of at least one parent of the other slave)
 * @param {MinRelative} slave1
 * @param {MinRelative} slave2
 * @returns {boolean}
 */
globalThis.areCousins = function(slave1, slave2) {
	if (!V.showDistantRelatives) {
		return false;
	}

	if (!slave1 || !slave2 || (slave1.ID === slave2.ID)) {
		return false; // invalid or self
	}

	if (sameMom(slave1, slave2) || sameDad(slave1, slave2) || sameTParent(slave1, slave2)) {
		return false; // sisters, not cousins
	}

	const slave1Mom = getMinRelative(slave1.mother);
	const slave1Dad = getMinRelative(slave1.father);
	const slave2Mom = getMinRelative(slave2.mother);
	const slave2Dad = getMinRelative(slave2.father);

	if (slave1Mom && slave2Mom && !sameTParent(slave1Mom, slave2Mom) && sameMom(slave1Mom, slave2Mom) && sameDad(slave1Mom, slave2Mom)) {
		return true;
	} else if (slave1Mom && slave2Dad && !sameTParent(slave1Mom, slave2Dad) && sameMom(slave1Mom, slave2Dad) && sameDad(slave1Mom, slave2Dad)) {
		return true;
	} else if (slave1Dad && slave2Mom && !sameTParent(slave1Dad, slave2Mom) && sameMom(slave1Dad, slave2Mom) && sameDad(slave1Dad, slave2Mom)) {
		return true;
	} else if (slave1Dad && slave2Dad && !sameTParent(slave1Dad, slave2Dad) && sameMom(slave1Dad, slave2Dad) && sameDad(slave1Dad, slave2Dad)) {
		return true;
	}

	return false;
};

/** Returns whether two entities are *closely* related (i.e. siblings or parent/child).
 * Distant relatives are not checked by this function.
 * @param {Relative} slave1
 * @param {Relative} slave2
 * @returns {boolean}
 */
globalThis.areRelated = function(slave1, slave2) {
	return (slave1.father === slave2.ID || slave1.mother === slave2.ID || slave2.father === slave1.ID || slave2.mother === slave1.ID || areSisters(slave1, slave2) > 0);
};


/** Returns whether two entities are *distantly* related.
 * @param {MinRelative} slave1
 * @param {MinRelative} slave2
 * @returns {boolean}
 */
globalThis.areDistantlyRelated = function(slave1, slave2) {
	return (
		areCousins(slave1, slave2) ||
		isAunt(slave1, slave2) ||
		isAunt(slave2, slave1) ||
		isGrandparentP(slave1, slave2) ||
		isGrandparentP(slave2, slave1));
};

/** Returns the total number of relatives that an actor has
 * @param {FC.HumanState} slave
 * @returns {number}
 */
globalThis.totalRelatives = function(slave) {
	let relatives = 0;
	if (slave.mother > 0) {
		relatives += 1;
	}
	if (slave.father > 0) {
		relatives += 1;
	}
	if (slave.daughters > 0) {
		relatives += slave.daughters;
	}
	if (slave.sisters > 0) {
		relatives += slave.sisters;
	}
	return relatives;
};

/** Returns the slaves which are mutual children of two entities
 * @param {Relative} slave1
 * @param {Relative} slave2
 * @param {FC.SlaveState[]} slaves
 * @returns {number}
 */
globalThis.mutualChildren = function(slave1, slave2, slaves) {
	return slaves.filter(function(s) {
		return s.ID !== slave1.ID && s.ID !== slave2.ID && s.mother > 0 && s.father > 0 && ((s.mother === slave1.ID && s.father === slave2.ID) || (s.mother === slave2.ID && s.father === slave1.ID));
	}).length;
};

/** Returns a random slave related to a given entity
 * @param {Relative} slave
 * @param {function(FC.SlaveState): boolean} [filterFunction]
 * @returns {FC.SlaveState}
 */
globalThis.randomRelatedSlave = function(slave, filterFunction) {
	if (!slave) {
		return undefined;
	}
	if (typeof filterFunction !== 'function') {
		filterFunction = () => true;
	}
	const arr = getSlaves().filter((s) => areRelated(slave, s) && filterFunction(s));
	return arr.randomValue();
};

/**
 * @param {Relative} slave
 * @returns {FC.SlaveState}
 */
globalThis.randomRelatedAvailableSlave = function(slave) {
	return randomRelatedSlave(slave, (s) => isSlaveAvailable(s));
};

/** Returns gender to use for relationship labels, based on pronoun if enabled; not used for (grand)mother/fatherhood
 * @param {Relative} slave
 * @returns {string}
 */
globalThis.relativeGender = function(slave) {
	const useMaleTerms = (V.diversePronouns || slave.ID === SID.PC);
	let gender = useMaleTerms ? slave.genes : "XX";
	if (V.diversePronouns) { // use pronouns if possible; default to genes if using exotic pronouns or setting disabled
		if (slave.pronoun === App.Data.Pronouns.Kind.female) {
			gender = "XX";
		} else if (slave.pronoun === App.Data.Pronouns.Kind.male) {
			gender = "XY";
		}
	}
	return gender;
};

/** Returns the term used for slave2's sibling relationship to slave1, or null if there is no sibling relationship
 * @param {Relative} slave1
 * @param {Relative} slave2
 * @returns {string}
 */
globalThis.siblingTerm = function(slave1, slave2) {
	const gender = relativeGender(slave2);
	switch (areSisters(slave2, slave1)) {
		case 1:
			if (gender === "XY") {
				return "twin brother";
			} else {
				return "twin sister";
			}
		case 2:
			if (gender === "XY") {
				return "brother";
			} else {
				return "sister";
			}
		case 3:
			if (gender === "XY") {
				return "half-brother";
			} else {
				return "half-sister";
			}
	}
	return null;
};

/** Returns the term used for slave2's parental relationship to slave1, or null if there is no parental relationship
 * @param {Relative} slave1
 * @param {Relative} slave2
 * @returns {string}
 */
globalThis.parentTerm = function(slave1, slave2) {
	if (slave1.mother === slave2.ID && slave1.father === slave2.ID) {
		return "sole parent";
	} else if (slave1.mother === slave2.ID) {
		return "mother";
	} else if (slave1.father === slave2.ID) {
		return "father";
	}
	return null;
};

/**
 * Returns an array of any terms for slave2's relationship to slave1 (i.e. ["daughter"] if slave2 is slave1's daughter, or ["daughter", "niece"] if slave2 is both slave1's daughter and her niece).
 * Performs distant relative checking if enabled.
 * @param {Relative} slave1
 * @param {Relative} slave2
 * @returns {string[]}
 */
globalThis.relativeTerms = function(slave1, slave2) {
	let relations = [];
	const gender = relativeGender(slave2);
	const parent = parentTerm(slave1, slave2);
	if (parent) {
		relations.push(parent);
	} else if (slave2.mother === slave1.ID || slave2.father === slave1.ID) {
		if (gender === "XY") {
			relations.push("son");
		} else {
			relations.push("daughter");
		}
	}
	const sibling = siblingTerm(slave1, slave2);
	if (sibling) {
		relations.push(sibling);
	}
	if (isAunt(slave1, slave2)) {
		if (gender === "XY") {
			relations.push("uncle");
		} else {
			relations.push("aunt");
		}
	}
	if (isAunt(slave2, slave1)) {
		if (gender === "XY") {
			relations.push("nephew");
		} else {
			relations.push("niece");
		}
	}
	if (areCousins(slave2, slave1)) {
		relations.push("cousin");
	}
	if (isGrandfatherP(slave1, slave2)) {
		relations.push("grandfather");
	} else if (isGrandmotherP(slave1, slave2)) {
		relations.push("grandmother");
	} else if (isGrandparentP(slave2, slave1)) {
		if (gender === "XY") {
			relations.push("grandson");
		} else {
			relations.push("granddaughter");
		}
	}

	return relations;
};

/**
 * Returns the term for slave2's relationship to slave1 (i.e. "daughter" if slave2 is slave1's daughter).
 * If multiple relationships exist, a compound noun will be returned (i.e. "daughter, granddaughter and niece")
 * Performs distant relative checking if enabled.
 * @param {Relative} slave1
 * @param {Relative} slave2
 * @returns {string|null} - returns null if the slaves are not related, even distantly.
 */
globalThis.relativeTerm = function(slave1, slave2) {
	const relations = relativeTerms(slave1, slave2);
	if (relations.length > 0) {
		return toSentence(relations);
	}
	return null;
};

/** completely reset all the family counters in the game state (for both PC and slaves) */
globalThis.resetFamilyCounters = function() {
	for (let slave of getSlaves().values()) {
		slave.daughters = 0;
		slave.sisters = 0;
	}
	V.PC.daughters = 0;
	V.PC.sisters = 0;

	for (let slave of getSlaves().values()) {
		if (slave.mother === SID.PC || slave.father === SID.PC) {
			V.PC.daughters++;
		}
		if (areSisters(slave, V.PC)) {
			V.PC.sisters++;
		}
		for (let otherSlave of getSlaves().values()) {
			if (isParentP(otherSlave, slave)) {
				slave.daughters++;
			}
			if (areSisters(otherSlave, slave)) {
				slave.sisters++;
			}
		}
	}
};

/** Set any missing parents to a known ID for the given entity (usually so that a sibling can be safely generated)
 * @param {Relative} slave
 */
globalThis.setMissingParents = function(slave) {
	const gp = isInGenePool(slave.ID) ? getGenePoolRecordWriteMode(slave.ID) : undefined;
	if (!specificMom(slave)) {
		slave.mother = generateMissingParentID();
		if (gp) {
			gp.mother = slave.mother;
		}
	}
	if (!specificDad(slave)) {
		slave.father = generateMissingParentID();
		if (gp) {
			gp.father = slave.father;
		}
	}
};
