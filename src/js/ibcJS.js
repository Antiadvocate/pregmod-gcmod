/**
 * @typedef IBCRelative
 * A very simple object that represents an entity in a family tree.
 * Represents a group of common properties shared by SlaveState, InfantState, and PlayerState,
 * as well as genepool objects.
 * @type {object}
 * @property {number} ID
 * @property {number} mother
 * @property {number} father
 * @property {number} [inbreedingCoeff]
 */

globalThis.ibc = (() => {
	let realWorld =
	{

		/**
		 * returns the player
		 * @returns {FC.PlayerState}
		 */
		getPlayerCharacter() { return V.PC; },

		/**
		 * returns a GenePoolRecord or better for the given id, returns null if nothing is found
		 * @param {number} id
		 * @returns {FC.GenePoolRecord}
		 */
		findSlaveState(id) {
			let record;
			record = getSlave(id, true);
			if (!record) {
				if (Array.isArray(V.genePool)) {
					record = V.genePool.find((s) => { return s.ID === id; });
				} else {
					record = getGenePoolRecordWriteMode(id);
				}
			}
			record = record || ((id in V.missingTable) ? V.missingTable[id] : null) || null;
			return record;
		},

		/**
		 * get all FC.GenePoolRecords that exist
		 * @returns {Array<FC.GenePoolRecord | FC.MissingParentRecord>}
		 */
		getSlavesAndSuch() {
			/** @type {Array<FC.GenePoolRecord | FC.MissingParentRecord>} */
			let allSlaveRecords = [].concat(getSlaveStates(true))
				// @ts-ignore you shouldn't access V.genePool directly because it isn't supposed to change; this is an exception; For normal use use getGenePoolRecord()
				.concat(Object.values(V.genePool))
				.concat(Object.values(V.missingTable));

			if (V.temp?.activeSlave) { allSlaveRecords.push(V.temp.activeSlave); }


			return allSlaveRecords;
		},

		/**
		 * get all FC.FetusGenetics that exist in the main slave pool
		 * @returns {FC.FetusGenetics[]}
		 */
		getFetuses() {
			/** @type {FC.FetusGenetics[]} */
			return getSlaves().filter(s => s.preg > 0).map(s => s.womb.map(i => i.genetics)).reduce((res, cur) => res.concat(cur), []);
		}
	};

	let hasInbreedingCoefficient = (s) => "inbreedingCoeff" in s && s.inbreedingCoeff !== -1;

	// These IDs are considered to be unknown parents
	let orNull = (s) => specificCharacterID(s) ? s : null;

	/** The player's old master is a known parent, but we don't normally have a slavelike object
	 * for him. We use this one instead, wherever necessary.
	 * @type {IBCRelative} */
	const oldMaster = {
		ID: SID.FORMERMASTER,
		mother: 0,
		father: 0,
		inbreedingCoeff: 0
	};

	/** Create a node for the given ID
	 * @param {number} id
	 */
	function IBCNode(id) {
		this.id = id; // Node ID
		this.mother = null;
		this.father = null;
		this._coeff = null; // Cached CoI
		this._ancestorNodeCount = null;
	}

	class CoancestryCache {
		valuesByLeastParentId = {};

		coefficientOfInbreeding(node) {
			if (node._coeff === null) { node._coeff = this.kinship(node.mother, node.father); }

			return node._coeff;
		}

		kinship(motherNode, fatherNode) {  // also known as "coancestry"; this is equal to the coefficient of inbreeding for any children the two given parents may have
			if (!motherNode || !fatherNode) {
				return 0;
			} else if (motherNode === fatherNode) {
				// just two simple rules are needed to express it: self-with-self coancestry is (1 + coefficient of inbreeding of self) / 2, and...
				return (1 + this.coefficientOfInbreeding(motherNode)) / 2;
			}

			return this.kinshipCache(motherNode.id, fatherNode.id,
				() => {
					let p1 = motherNode;
					let p2 = fatherNode;
					if (p1._ancestorNodeCount > p2._ancestorNodeCount) {
						// (to exercise the second rule mentioned in the comment below, it's fine to step up to either person's parents; but here the stepping up is aimed into
						// the larger of the two ancestry trees, in a crude effort to keep the kinship() arguments at about the same generational level when possible, thereby
						// maybe maximizing the chance that the same few pairs of arguments will keep coming into the function - which may possibly make caching extra effective.
						// as the wording here indicates, the benefit of this has not actually been verified, but what the heck it's simple)
						let p_ = p1;
						p1 = p2;
						p2 = p_;
					}

					// ...one-with-another coancestry is (one-with-other's-father coancestry + one-with-other's-mother coancestry) / 2
					return (this.kinship(p1, p2.mother) + this.kinship(p1, p2.father)) / 2;
				});
		}

		kinshipCache(motherId, fatherId, calculateValue) {  // this method exists solely for caching purposes
			let id1 = motherId;
			let id2 = fatherId;
			if (id1 > id2) { let id_ = id1; id1 = id2; id2 = id_; }

			let vs = this.valuesByLeastParentId;

			let vs1 = vs[id1];
			if (vs1 === undefined) { vs1 = vs[id1] = []; }

			// cache format, conceptually: a set of arrays of numbers. the top-level set is indexed by id1. a lower-level array has the format
			// [id, kinship value, id, kinship value, ...] with the id in an entry corresponding to id2 here and with the pairs in the array being kept invariably sorted by id.
			return this._kinshipCache(vs1, id2, calculateValue);
		}

		_kinshipCache(vs, id, calculateValue) {  // this method exists solely for caching purposes
			let entryCount = vs.length / 2;

			// do a simple binary search
			let searchRangeStart = 0;
			let searchRangeEnd = entryCount;
			while (searchRangeEnd > searchRangeStart) {
				let middleIndex = searchRangeStart + Math.floor((searchRangeEnd - searchRangeStart) / 2);
				let idThere = vs[middleIndex * 2];
				if (idThere === id) {
					return vs[middleIndex * 2 + 1]; // cached value found
				} else if (id < idThere) {
					searchRangeEnd = middleIndex;
				} else {
					searchRangeStart = middleIndex + 1;
				}
			}

			// the appropriate location for the cached value was found, but the value isn't there yet, so add it
			let v = calculateValue();
			vs.splice(searchRangeStart * 2, 0, id, v);
			return v;
		}
	}

	/** Make nodes for an array of slaves
	 * @param {typeof realWorld} world
	 * @param {IBCRelative[]} slaves
	 * @param {boolean} [ignoreCoeffs=false]
	 * @returns {{[key:number]: IBCNode}|{}}
	 */
	let nodesSlaves = (world, slaves, ignoreCoeffs = false) => {
		let nodes = {};

		/** Recursively create the nodes we need, moving upwards from the given slave
		 * @param {IBCRelative} s
		 */
		let createNodeRec = s => {
			if (!(s.ID in nodes)) {
				nodes[s.ID] = new IBCNode(s.ID);

				// Certain parents (e.g. 0, societal elite) are not considered to be related, despite
				// having the same ID; convert them to null
				const m = orNull(s.mother);
				const f = orNull(s.father);

				// Ensure that parent nodes are created
				[m, f].forEach(p => {
					if (p !== null && !(p in nodes)) { // Not created, we have to do something
						if (p === SID.PC) {
							createNodeRec(world.getPlayerCharacter());
						} else {
							// Search for a slave state, genePool entry, or missingTable entry
							let gp = world.findSlaveState(p);
							if (gp !== null) {
								// If we find one, we might have ancestry information: recurse
								createNodeRec(gp);
							} else {
								// Otherwise, just create a plain node
								nodes[p] = new IBCNode(p);
							}
						}
					}
				});

				// Set parents to the actual nodes
				nodes[s.ID].mother = (m === null) ? m : nodes[m];
				nodes[s.ID].father = (f === null) ? f : nodes[f];

				// Try to use a cached CoI for performance
				let sg = world.findSlaveState(s.ID);
				if (!ignoreCoeffs && sg !== null && hasInbreedingCoefficient(sg)) {
					nodes[s.ID]._coeff = sg.inbreedingCoeff;
				}
			}
		};

		slaves.forEach(s => createNodeRec(s));

		let detectCycle = function(node, visited, recStack) { // doesn't have to be fast, will only be called after the stack explodes
			visited[node.id] = true;
			recStack.push(node.id);
			if (node.father) {
				if (!visited[node.father.id] && detectCycle(node.father, visited, recStack)) {
					return true;
				} else if (recStack.includes(node.father.id)) {
					recStack.push(node.father.id);
					return true;
				}
			}
			if (node.mother) {
				if (!visited[node.mother.id] && detectCycle(node.mother, visited, recStack)) {
					return true;
				} else if (recStack.includes(node.mother.id)) {
					recStack.push(node.mother.id);
					return true;
				}
			}
			recStack.pop();
			return false;
		};

		let countSelfAndAncestors = function(node) {
			if (node === null) { return 0 + 0; }  // no self, no ancestors

			if (node._ancestorNodeCount === null) { node._ancestorNodeCount = countSelfAndAncestors(node.mother) + countSelfAndAncestors(node.father); }

			return 1 + node._ancestorNodeCount;  // 1 self, maybe some ancestors
		};
		for (let slave of slaves) {
			try {
				countSelfAndAncestors(nodes[slave.ID]);
			} catch (e) {
				// probably a cycle, try to go find it and throw a better error
				const visited = {};
				const recStack = []; // track back edges in node graph
				const IDToName = (id) => {
					try {
						return SlaveFullName(world.findSlaveState(id));
					} catch {
						return ``;
					}
				};
				if (detectCycle(nodes[slave.ID], visited, recStack)) {
					throw new Error(`Heritance cycle detected: ${toSentence(recStack.map(s => `${s} (${IDToName(s)})`), " was born to ", " was born to ")}, making them their own ancestor...`);
				} else {
					throw e; // not a cycle? no idea then
				}
			}
		}

		return nodes;
	};

	/** Determine the coefficients of inbreeding of an array of slaves. Returns a mapping of their
	 * ID to their coefficient of inbreeding
	 * @param {typeof realWorld} world
	 * @param {IBCRelative[]} slaves
	 * @param {boolean} [ignoreCoeffs=false]
	 * @returns {{[key: number]: number}}
	 */
	let coeffSlaves = (world, slaves, ignoreCoeffs = false) => {
		/** @type {{[key: number]: number}} */
		let ret = {};
		if (!ignoreCoeffs) {
			// First, pull as many existing CoI off the slaves
			slaves.forEach(s => {
				let sg = world.findSlaveState(s.ID);
				if (sg !== null && hasInbreedingCoefficient(sg)) {
					ret[s.ID] = sg.inbreedingCoeff;
				}
			});
		}

		// Now do any we haven't done already
		slaves = slaves.filter(s => (!(s.ID in ret)));
		if (slaves.length > 0) {
			let nodes = nodesSlaves(world, slaves, ignoreCoeffs);
			let coancestryCache = new CoancestryCache();

			// Compute coefficients
			slaves.forEach(s => {
				ret[s.ID] = coancestryCache.coefficientOfInbreeding(nodes[s.ID]);
			});
		}

		return ret;
	};

	/** Determine the kinship between slaves `a` and `b`
	 * @param {typeof realWorld} world
	 * @param {IBCRelative|0} [a] or zero
	 * @param {IBCRelative|0} [b] or zero
	 * @param {boolean} [ignoreCoeffs=false]
	 * @returns {number}
	 */
	let kinshipSlaves = (world, a, b, ignoreCoeffs = false) => {
		if (!a || !b) {
			return 0;
		}

		return kinshipOneMany(world, a, [b], ignoreCoeffs)[b.ID];
	};

	/** Determine the coefficient of inbreeding of a single slave
	 * @param {typeof realWorld} world
	 * @param {IBCRelative} slave
	 * @param {boolean} [ignoreCoeffs=false]
	 * @returns {number}
	 */
	let coeffSlave = (world, slave, ignoreCoeffs = false) => {
		if (!ignoreCoeffs && hasInbreedingCoefficient(slave)) {
			return slave.inbreedingCoeff;
		}

		let gp = world.findSlaveState(slave.ID);
		if (!ignoreCoeffs && gp !== null && hasInbreedingCoefficient(gp)) {
			return gp.inbreedingCoeff;
		}

		return coeffSlaves(world, [slave], ignoreCoeffs)[slave.ID];
	};

	/** Determine the kinship between one and many slaves. Returns an mapping from the ID of each of
	 * the slaves in `others` to its kinship with slave `a`
	 * @param {typeof realWorld} world
	 * @param {IBCRelative} a
	 * @param {IBCRelative[]} others
	 * @param {boolean} [ignoreCoeffs=false]
	 * @returns {{[key: number]: number}}
	 */
	let kinshipOneMany = (world, a, others, ignoreCoeffs = false) => {
		let nodes = nodesSlaves(world, others.concat([a]), ignoreCoeffs);

		let ks = {0: 0};
		let coancestryCache = new CoancestryCache();
		others.forEach(s => {
			ks[s.ID] = coancestryCache.kinship(nodes[a.ID], nodes[s.ID]);
		});

		return ks;
	};

	/** Recalculate the inbreeding coefficient for all slaves dependent on the passed IDs (e.g. the
	 * slaves themselves and all of their children). This will replace the inbreeding coefficients
	 * wherever they exist with the computed values, ignoring all cached values.
	 * This should be called if parents are changed.
	 * @param {typeof realWorld} world
	 * @param {number[]} ids
	 */
	let recalculateCoeffIDs = (world, ids) => {
		// These are all the slave-like objects, i.e. they have ID, mother, and father. There will
		// be multiple elements with the same ID: we want this, since we have to replace all
		// occurrences of the COI for the affected slaves
		/** @type {IBCRelative[]} */
		let allSlaveRecords = world.getSlavesAndSuch();
		allSlaveRecords.push(world.getPlayerCharacter());
		// Add a fake entry for the PC's old master
		allSlaveRecords.push(oldMaster);

		// Gather the genetics of all current fetuses
		let allFetuses = world.getFetuses();

		/** Recursively find all of the given ID's children, born and unborn
		 * @param {number} id
		 * @param {Set<number>} curSlaves
		 * @param {Set<FC.FetusGenetics>} curFetuses
		 * @param {Set<number>} curFetusParents
		 */
		let findChildrenRec = (id, curSlaves, curFetuses, curFetusParents) => {
			// Add fetuses
			allFetuses.filter(f => (f.father === id || f.mother === id)).forEach(f => {
				// We may have to manually add the parents later
				if (specificCharacterID(f.father)) {
					curFetusParents.add(f.father);
				}
				if (specificCharacterID(f.mother)) {
					curFetusParents.add(f.mother);
				}

				curFetuses.add(f);
			});

			// Recursively add slaves
			allSlaveRecords.filter(s => (s.father === id || s.mother === id)).forEach(s => {
				if (!curSlaves.has(s.ID)) {
					curSlaves.add(s.ID);
					findChildrenRec(s.ID, curSlaves, curFetuses, curFetusParents);
				}
			});
		};

		// We only need slave IDs, since we have to update all of their entries (including GP)
		/** @type {Set<number>} */
		let neededSlaveIds = new Set();
		// Since each fetus has a unique record, a set still suffices
		/** @type {Set<FC.FetusGenetics>} */
		let neededFetuses = new Set();
		/** @type {Set<number>} */
		let neededParentIds = new Set();

		// Find all the children of the IDs we need to do
		ids.forEach(id => {
			neededSlaveIds.add(id);
			findChildrenRec(id, neededSlaveIds, neededFetuses, neededParentIds);
		});

		// Now we assemble the tree from the slaves
		let neededSlaves = allSlaveRecords.filter(s => (neededSlaveIds.has(s.ID) || neededParentIds.has(s.ID)));
		let nodes = nodesSlaves(world, neededSlaves, true);

		// Now calculate the inbreeding coefficients (they're cached in the tree once calculated)
		let coancestryCache = new CoancestryCache();
		neededSlaves.filter(s => neededSlaveIds.has(s.ID)).forEach(s => {
			s.inbreedingCoeff = coancestryCache.coefficientOfInbreeding(nodes[s.ID]);
		});

		// Finally, handle all of the kinship for the fetuses
		neededFetuses.forEach(f => {
			if (orNull(f.mother) === null || orNull(f.father) === null) {
				f.inbreedingCoeff = 0;
				return;
			}

			f.inbreedingCoeff = coancestryCache.kinship(nodes[f.mother], nodes[f.father]);
		});
	};

	/** Recalculate the coefficient of inbreeding for a single slave
	 * @see recalculateCoeffIDs
	 * @param {typeof realWorld} world
	 * @param {number} id
	 */
	let recalculateCoeffID = (world, id) => {
		return recalculateCoeffIDs(world, [id]);
	};

	return {
		// TODO:@franklygeorge replace these camelcase function names
		_test: {
			// eslint-disable-next-line camelcase
			coeff_slave: coeffSlave,
		},
		coeff: coeffSlave.bind(null, realWorld),
		// eslint-disable-next-line camelcase
		coeff_slaves: coeffSlaves.bind(null, realWorld),
		kinship: kinshipSlaves.bind(null, realWorld),
		// eslint-disable-next-line camelcase
		kinship_one_many: kinshipOneMany.bind(null, realWorld),
		// eslint-disable-next-line camelcase
		recalculate_coeff_ids: recalculateCoeffIDs.bind(null, realWorld),
		// eslint-disable-next-line camelcase
		recalculate_coeff_id: recalculateCoeffID.bind(null, realWorld)
	};
})();
