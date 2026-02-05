App.UI.SlaveInteract.slaveSlaveSwap = function() {
	const node = new DocumentFragment();

	const ss1 = getSlave(V.temp.AS);
	const ss1Clone = clone(ss1);

	const ss2 = getSlave(V.temp.swappingSlave);
	const ss2Clone = clone(ss2);

	const gps1 = /** @type {FC.SlaveState} */ (getGenePoolRecordWriteMode(ss1));
	App.Utils.assignMissingDefaults(gps1, clone(ss1));
	const gps1Clone = clone(gps1);

	const gps2 = /** @type {FC.SlaveState} */ (getGenePoolRecordWriteMode(ss2));
	App.Utils.assignMissingDefaults(gps2, clone(ss2));
	const gps2Clone = clone(gps2);

	App.UI.DOM.appendNewElement("p", node, `You strap ${ss1.slaveName} and ${ss2.slaveName} into the remote surgery and stand back as it goes to work.`);

	bodySwap(ss1, ss2Clone, false);
	bodySwap(gps1, gps2Clone, true);

	bodySwap(ss2, ss1Clone, false);
	bodySwap(gps2, gps1Clone, true);

	// figuring out who has whose body now
	whoHasWho(ss1, ss2, ss2Clone);
	whoHasWho(ss2, ss1, ss1Clone);

	// now to handle whose body it is, name-wise
	bodySwapName(ss1, ss2Clone);
	bodySwapName(ss2, ss1Clone);

	App.Events.addParagraph(node, [
		`After an honestly impressive procedure, ${ss1.slaveName} is recovering nicely.`,
		bodySwapReaction(ss1, ss1Clone)
	]);

	App.UI.DOM.appendNewElement("hr", node);

	App.Events.addParagraph(node, [
		`In the neighboring bed, ${ss2.slaveName} rests peacefully.`,
		bodySwapReaction(ss2, ss2Clone)
	]);

	for (const ss of [ss1, ss2]) {
		if (ss.origBodyOwnerID === ss.ID) {
			// if we got our own original body back, clear our bodyswap records
			ss.bodySwap = 0;
			ss.origBodyOwnerID = 0;
			ss.origBodyOwner = "";
		} else {
			// otherwise, increment the bodyswap counter
			ss.bodySwap++;
		}
	}

	V.temp.activeSlave = 0;
	V.temp.swappingSlave = 0;
	return node;

	/** Update origBodyOwnerID appropriately.
	 * @param {FC.SlaveState} target
	 * @param {FC.SlaveState} opposing
	 * @param {FC.SlaveState} opposingClone
	 */
	function whoHasWho(target, opposing, opposingClone) {
		if (opposingClone.bodySwap === 0) {
			// if my new body came directly from its original owner, give them a reference to me
			opposing.origBodyOwnerID = target.ID;
		} else {
			// if my new body originally belonged to someone else, update the original owner's reference to point to me
			// note that the original owner may also be me; we'll take care of that later (after generating the reaction)
			// but we never want to find a self-reference, since those are always temporary
			const originalOwner = getSlaves().find(s => s.origBodyOwnerID === opposingClone.ID && s.origBodyOwnerID !== s.ID)?.value;
			if (originalOwner) {
				originalOwner.origBodyOwnerID = target.ID;
			}
		}
	}
};
