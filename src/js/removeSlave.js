/**
 * Removes slave from the game
 * @param {FC.SlaveState} slave
 * @param {FC.MissingParentRecordOptionalParams} [recordExtras] if this object or one of its optional properties is not defined, they default to the defaults as defined in missingTableRecordFromHumanState()
 * @see missingTableRecordFromHumanState
 */
globalThis.removeSlave = function(slave, recordExtras = {}) {
	const AS_ID = slave.ID;
	let missing = false;
	const MID = generateMissingParentID();

	WombChangeID(V.PC, AS_ID, MID);
	if (V.PC.pregSource === MID) {
		missing = true;
	}

	if (V.PC.mother === AS_ID) {
		V.PC.mother = MID;
		missing = true;
	}
	if (V.PC.father === AS_ID) {
		V.PC.father = MID;
		missing = true;
	}
	if (V.PC.sisters > 0) {
		if (areSisters(V.PC, slave) > 0) {
			V.PC.sisters--;
		}
	}
	if (V.PC.daughters > 0) {
		if (slave.father === SID.PC || slave.mother === SID.PC) {
			V.PC.daughters--;
		}
	}

	V.favorites.deleteAll(AS_ID);
	V.reminders.deleteWith(r => r.slaveID === AS_ID);

	V.researchLab.tasks = V.researchLab.tasks.filter((t) => t.slaveID !== AS_ID);

	if (V.slaves.has(AS_ID)) {
		if (V.incubator.capacity > 0) {
			getTankSlaves().forEach(child => {
				if (AS_ID === child.mother) {
					child.mother = MID;
					missing = true;
				}
				if (AS_ID === child.father) {
					child.father = MID;
					missing = true;
				}
			});
		}
		if (V.nursery > 0) {
			getInfants().forEach(child => {
				if (AS_ID === child.mother) {
					child.mother = MID;
					missing = true;
				}
				if (AS_ID === child.father) {
					child.father = MID;
					missing = true;
				}
			});
		}
		getSlaves().forEach(s => {
			WombChangeID(s, AS_ID, MID);
			if (s.pregSource === MID) {
				missing = true;
			}
			if (slave.daughters > 0) {
				if (s.mother === AS_ID) {
					s.mother = MID;
				}
				if (s.father === AS_ID) {
					s.father = MID;
				}
				missing = true;
			}
			if (slave.mother > 0 || slave.father > 0) {
				if (slave.mother === s.ID || slave.father === s.ID) {
					s.daughters--;
				}
			}
			if (slave.sisters > 0) {
				if (areSisters(slave, s) > 0) {
					s.sisters--;
				}
			}
			if (s.cumSource === AS_ID || s.milkSource === AS_ID) {
				deflate(s);
			}
			if (s.ID === slave.relationshipTarget) {
				s.relationship = 0;
				s.relationshipTarget = 0;
			}
			if (s.ID === slave.rivalryTarget) {
				s.rivalry = 0;
				s.rivalryTarget = 0;
			}
			/* moved to saDevotion as a discovery event
				if (s.origBodyOwnerID === AS_ID) {
				s.origBodyOwnerID = 0;
				}
			*/
			if (s.ID === slave.subTarget || slave.subTarget === s.ID) {
				slave.subTarget = 0;
				s.subTarget = 0;
			}

			if (s.partners.has(AS_ID)) {
				missing = true;

				s.partners.delete(AS_ID);
				s.partners.add(MID);
			}
		});

		/* remove from Pit trainee list, if needed */
		if (V.pit && V.pit.trainingIDs) {
			V.pit.trainingIDs.deleteAll(AS_ID);
		}
		/* remove from Pit fighters list, if needed */
		if (V.pit && V.pit.fighterIDs) {
			V.pit.fighterIDs.deleteAll(AS_ID);
		}
		/* reset fighting BG ID, if needed */
		if (V.pit && V.pit.slaveFightingBodyguard === AS_ID) {
			V.slaveFightingBodyguard = null;
		}
		// scheduled pit fight
		if (V.pit && V.pit.slavesFighting?.includes(AS_ID)) {
			V.pit.slavesFighting = null;
		}

		/* remove from Coursing Association, if needed */
		if (V.LurcherID === AS_ID) {
			V.LurcherID = 0;
		}

		if (V.personalAttention.task === PersonalAttention.TRAINING) {
			V.personalAttention.slaves.deleteWith(s => s.ID === AS_ID);
			if (V.personalAttention.slaves.length === 0) {
				App.PersonalAttention.reset();
			}
		}

		/* Remove from facility array or leadership role, if needed */
		removeJob(slave, slave.assignment);

		const traitor = getTraitor().actor;

		if (traitor !== 0) {
			missing = true; /* no exceptions, fetus system relies on this */
			if (AS_ID === traitor.pregSource) {
				traitor.pregSource = SID.GENERIC;
			}
			if (traitor.mother === AS_ID) {
				traitor.mother = MID;
			}
			if (traitor.father === AS_ID) {
				traitor.father = MID;
			}
			if (traitor.origBodyOwnerID === AS_ID) {
				traitor.origBodyOwnerID = 0;
			}
			if (traitor.partners.has(AS_ID)) {
				missing = true;

				traitor.partners.delete(AS_ID);
				traitor.partners.add(MID);
			}
		}
		const boomerang = getBoomerang().actor;
		if (boomerang !== 0) {
			missing = true;
			if (AS_ID === boomerang.pregSource) {
				boomerang.pregSource = SID.GENERIC;
			}
			if (boomerang.mother === AS_ID) {
				boomerang.mother = MID;
			}
			if (boomerang.father === AS_ID) {
				boomerang.father = MID;
			}
			if (boomerang.origBodyOwnerID === AS_ID) {
				boomerang.origBodyOwnerID = 0;
			}
			if (boomerang.partners.has(AS_ID)) {
				missing = true;

				boomerang.partners.delete(AS_ID);
				boomerang.partners.add(MID);
			}
		}

		V.organs.deleteWith(s => s.ID === AS_ID);
		V.completedOrgans.deleteWith(s => s.ID === AS_ID);

		for (let o = 0; o < V.adjustProsthetics.length; o++) {
			if (V.adjustProsthetics[o].slaveID === AS_ID) {
				V.adjustProsthetics.deleteAt(o);
				V.adjustProstheticsCompleted--;
				o--;
			}
		}

		deleteGenePoolRecord(slave);

		Object.values(V.missingTable).forEach(s => {
			if (s.mother === slave.ID || s.father === slave.ID) {
				missing = true;
			}
		});
		if (missing) {
			V.missingTable[MID] = missingTableRecordFromHumanState(slave, MID, recordExtras);
			const traitor = getTraitor();
			const boomerang = getBoomerang();
			if (traitor.actor && traitor.actor.ID === slave.ID) {
				/* To link developing fetuses to their parent */
				traitor.stats.missingParentTag = MID;
			} else if (boomerang.actor && boomerang.actor.ID === slave.ID) {
				boomerang.stats.missingParentTag = MID;
			}
			Object.values(V.missingTable).forEach(s => {
				if (s.mother === slave.ID) {
					s.mother = MID;
				}
				if (s.father === slave.ID) {
					s.father = MID;
				}
			});
		}

		if (V.assignmentRecords[AS_ID]) {
			delete V.assignmentRecords[AS_ID];
		}

		// remove slaves from V.rulesToApplyOnce if needed
		removeFromRulesToApplyOnce(slave);

		// @ts-expect-error read only map
		V.slaves.delete(AS_ID);
		V.JobIDMap = makeJobIdMap(); /* need to call this once more to update count of resting slaves*/

		delete V.RAActions.slaves[slave.ID];
	}
};
