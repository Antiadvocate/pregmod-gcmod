// cSpell:ignore ltype, dkeys, mkeys, ssym, ftree

/**
 * @param {FC.HumanState[]} slaves
 * @param {number} filterID
 * @returns {Element}
 */
globalThis.renderFamilyTree = function(slaves, filterID) {
	'use strict';

	const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	const svg = d3.select(svgNode);

	const data = buildFamilyTree(slaves, filterID);

	const ftreeWidth = Math.clamp(data.nodes.length * 45, 600, 1920);
	const ftreeHeight = Math.clamp(data.nodes.length * 35, 480, 1200);

	initFtreeSVG();
	runFtreeSim(data);

	return svgNode;

	function initFtreeSVG() {
		svg.attr('width', ftreeWidth).attr('height', ftreeHeight);

		svg.append('defs').append('marker')
			.attr('id', 'arrowhead')
			.attr('viewBox', '-0 -5 10 10')
			.attr('refX', 13)
			.attr('refY', 0)
			.attr('orient', 'auto')
			.attr('markerWidth', 13)
			.attr('markerHeight', 13)
			.append('svg:path')
			.attr('d', 'M 0,-1 L 5,0 L 0,1')
			.attr('fill', '#a1a1a1')
			.style('stroke', 'none');
	}

	function runFtreeSim(data) {
		let simulation = d3.forceSimulation()
			.force('collide', d3.forceCollide(60).iterations(4))
			.force('charge', d3.forceManyBody().strength(-200).distanceMin(100).distanceMax(1000))
			.force('center', d3.forceCenter(ftreeWidth / 2, ftreeHeight / 2))
			.force('y', d3.forceY(100))
			.force('x', d3.forceX(200));

		let link = svg.append('g')
			.attr('class', 'link')
			.selectAll('link')
			.data(data.links)
			.enter()
			.append('line')
			.attr('marker-end', 'url(#arrowhead)')
			.attr('stroke', function(d) {
				if (d.type === 'homologous') {
					return '#862d59';
				} else if (d.type === 'paternal') {
					return '#24478f';
				} else {
					return '#aa909b';
				}
			})
			.attr('stroke-width', 2)
			.attr('fill', 'none');

		let node = svg.selectAll('.node')
			.data(data.nodes)
			.enter().append('g')
			.attr('class', 'node')
			.call(d3.drag()
				.on('start', dragstarted)
				.on('drag', dragged)
				.on('end', dragended));

		node.append('circle')
			.attr('stroke', function(d) {
				if (d.ID === filterID) {
					return '#ffff20';
				} else {
					return '#5a5a5a';
				}
			})
			.attr('class', 'node-circle')
			.attr('r', 20);

		node.append('text')
			.text(function(d) {
				let ssym;
				if (d.dick > 0 && d.vagina > -1) {
					ssym = '☿';
				} else if (d.dick > 0) {
					ssym = '♂';
				} else if (d.vagina > -1) {
					ssym = '♀';
				} else {
					ssym = '?';
				}
				return `${d.name}(${ssym})`;
			})
			.attr('dy', 4)
			.attr('dx', function(d) {
				return -(8 * d.name.length) / 2;
			})
			.attr('class', 'node-text')
			.style('fill', function(d) {
				if (d.isMother && d.isFather) {
					return '#b84dff';
				} else if (d.isFather) {
					return '#00ffff';
				} else if (d.isMother) {
					return '#ff3399';
				} else if (d.unborn) {
					return '#a3a3c2';
				} else {
					return '#66cc66';
				}
			});

		let ticked = function() {
			link
				.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; });

			node
				.attr("transform", function(d) { return `translate(${d.x}, ${d.y})`; });
		};

		simulation.nodes(data.nodes)
			.on('tick', ticked);

		simulation.force('link', d3.forceLink().links(data.links));

		function dragstarted(event, d) {
			if (!event.active) { simulation.alphaTarget(0.3).restart(); }
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(event, d) {
			d.fx = event.x;
			d.fy = event.y;
		}

		function dragended(event, d) {
			if (!event.active) { simulation.alphaTarget(0); }
			d.fx = null;
			d.fy = null;
		}
	}
};

/**
 * @param {FC.HumanState[]} slaves
 * @param {number} filterID
 */
globalThis.buildFamilyTree = function(slaves, filterID) {
	let familyGraph = {nodes: [], links: []};
	let nodeLookup = {};
	/** @type {Map<FC.SpecialID|number, string>} */
	let presetLookup = new Map([
		[SID.CITIZEN, "A citizen"],
		[SID.FORMERMASTER, "Former Master"],
		[SID.ARCOWNER, "An arcology owner"],
		[SID.CLIENT, 'Client'],
		[SID.ELITE, "Social Elite"],
		[SID.LAB, "Gene lab"],
		[SID.FUTA, "A Futanari Sister"],
		[SID.RAPIST, "An unknown rapist"],
	]);
	/** @type {Record<string, Array<string>>} */
	let outdads = {};
	/** @type {Record<string, Array<string>>} */
	let outmoms = {};
	let kids = {};

	const realPC = slaves.deleteWith(s => s.ID === SID.PC).first() || V.PC;
	/** @type {Pick<FC.HumanState, "ID" | "slaveName" | "dick" | "vagina" | "mother" | "father">} */
	let fakePC = {
		slaveName: `${realPC.slaveName} (You)`,
		mother: realPC.mother,
		father: realPC.father,
		dick: realPC.dick,
		vagina: realPC.vagina,
		ID: realPC.ID,
	};
	/** @type {Array<Pick<FC.HumanState, "ID" | "slaveName" | "dick" | "vagina" | "mother" | "father"> & {isMother?: boolean, isFather?: boolean}>} */
	let charList = [fakePC].concat(slaves).concat(getTankSlaves().asArray())
		.concat(getInfants().asArray());

	const missingParentToCharListNode = (/** @type {FC.MissingParentRecord} */ missing) => ({
		ID: missing.ID,
		mother: missing.mother,
		father: missing.father,
		dick: missing.dick,
		vagina: missing.vagina,
		slaveName: missing.slaveName
	});
	if (V.showMissingSlaves) {
		charList.push(...Object.values(V.missingTable).map(missingParentToCharListNode));
	}

	let unborn = {};
	for (const child of getTankSlaves().values()) {
		unborn[child.ID] = true;
	}
	for (const child of getInfants().values()) {
		unborn[child.ID] = true;
	}

	for (const character of charList) {
		let mom = character.mother;
		let dad = character.father;

		if (mom) {
			if (!kids[mom]) {
				kids[mom] = {};
			}
			kids[mom].mother = true;
		}
		if (dad) {
			if (!kids[dad]) {
				kids[dad] = {};
			}
			kids[dad].father = true;
		}
	}

	const haveChar = (ID) => charList.some(c => c.ID === ID);
	for (const character of charList) {
		if (character.mother === SID.GENERIC && character.father === SID.GENERIC && !kids[character.ID]) {
			continue;
		}
		let mom = character.mother;
		if (!haveChar(mom)) {
			if (mom < -6) {
				if (typeof outmoms[mom] === 'undefined') {
					outmoms[mom] = [];
				}
				outmoms[mom].push(character.slaveName);
			} else if (mom < 0 && presetLookup.has(mom)) {
				charList.push({
					ID: mom,
					mother: 0,
					father: 0,
					isFather: true,
					dick: 0,
					vagina: 1,
					slaveName: presetLookup.get(mom)
				});
			}
		}

		let dad = character.father;
		if (!haveChar(dad)) {
			if (dad < -6) {
				if (typeof outdads[dad] === 'undefined') {
					outdads[dad] = [];
				}
				outdads[dad].push(character.slaveName);
			} else if (dad < 0 && presetLookup.has(dad)) {
				charList.push({
					ID: dad,
					mother: 0,
					father: 0,
					isFather: true,
					dick: 1,
					vagina: -1,
					slaveName: presetLookup.get(dad)
				});
			}
		}
	}
	let mkeys = Object.keys(outmoms);
	for (const key of mkeys) {
		const names = outmoms[key];
		const name = toSentence(names);
		// Outside known slaves set
		charList.push({
			ID: Number(key),
			mother: 0,
			father: 0,
			isMother: true,
			dick: 0,
			vagina: 1,
			slaveName: `${name}'s mother`
		});
	}

	let dkeys = Object.keys(outdads);
	for (const key of dkeys) {
		const names = outdads[key];
		const name = toSentence(names);
		// Outside known slaves set
		charList.push({
			ID: Number(key),
			mother: 0,
			father: 0,
			isFather: true,
			dick: 1,
			vagina: -1,
			slaveName: `${name}'s father`
		});
	}

	let charHash = {};
	for (const character of charList) {
		charHash[character.ID] = character;
	}

	let related = {};
	let seen = {};
	let saveTree = {};

	function relatedTo(character, targetID, relIDs = {tree: {}, related: false}) {
		relIDs.tree[character.ID] = true;
		if (related[character.ID]) {
			relIDs.related = true;
			return relIDs;
		}
		if (character.ID === targetID) {
			relIDs.related = true;
		}
		if (seen[character.ID]) {
			return relIDs;
		}
		seen[character.ID] = true;
		if (character.mother !== SID.GENERIC) {
			if (charHash[character.mother]) {
				relatedTo(charHash[character.mother], targetID, relIDs);
			}
		}
		if (character.father !== SID.GENERIC) {
			if (charHash[character.father]) {
				relatedTo(charHash[character.father], targetID, relIDs);
			}
		}
		return relIDs;
	}
	if (filterID) {
		if (charHash[filterID]) {
			let relIDs = relatedTo(charHash[filterID], filterID);
			for (let k in relIDs.tree) {
				related[k] = true;
			}
			for (const character of charList) {
				let pRelIDs = relatedTo(character, filterID);
				if (pRelIDs.related) {
					for (let k in pRelIDs.tree) {
						related[k] = true;
						if (saveTree[k]) {
							for (let k2 in saveTree[k].tree) {
								related[k2] = true;
							}
						}
					}
				}
				saveTree[character.ID] = pRelIDs;
			}
		}
	}

	for (const character of charList) {
		let charID = character.ID;
		if (charID !== filterID) {
			if (character.mother === SID.GENERIC && character.father === SID.GENERIC && !kids[charID]) {
				continue;
			}
			if (filterID && !related[charID]) {
				continue;
			}
		}
		nodeLookup[charID] = familyGraph.nodes.length;
		let charObj = {
			ID: charID,
			name: character.slaveName,
			dick: character.dick,
			unborn: !!unborn[charID],
			vagina: character.vagina
		};
		if (kids[charID]) {
			charObj.isMother = !!kids[charID].mother;
			charObj.isFather = !!kids[charID].father;
		} else {
			charObj.isMother = false;
			charObj.isFather = false;
		}
		familyGraph.nodes.push(charObj);
	}

	for (const character of charList) {
		let charID = character.ID;
		if (character.mother === SID.GENERIC && character.father === SID.GENERIC && !kids[charID]) {
			continue;
		}
		if (filterID && !related[charID]) {
			continue;
		}
		if (typeof nodeLookup[character.mother] !== 'undefined') {
			const ltype = (character.mother === character.father) ? 'homologous' : 'maternal';
			familyGraph.links.push({
				type: ltype,
				target: nodeLookup[charID] * 1,
				source: nodeLookup[character.mother] * 1
			});
		}
		if (character.mother === character.father) {
			continue;
		}
		if (typeof nodeLookup[character.father] !== 'undefined') {
			familyGraph.links.push({type: 'paternal', target: nodeLookup[charID] * 1, source: nodeLookup[character.father] * 1});
		}
	}
	return familyGraph;
};
