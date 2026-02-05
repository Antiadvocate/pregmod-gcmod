// WARNING This file defines objects referenced in slaveSummaryWidgets.js.
// Either keep this file above the slaveSummaryWidgets.js in the name ordered list
// (tweego process them in this order), or rework the references.

// cSpell:ignore Natr

App.UI.SlaveSummaryImpl = function() {
	const data = App.Data.SlaveSummary;

	const helpers = function() {
		/**
		 * @param {HTMLElement} element
		 * @param {string|string[]} [classNames]
		 */
		function _addClassNames(element, classNames) {
			if (classNames != undefined) { /* eslint-disable-line eqeqeq */
				if (Array.isArray(classNames)) {
					element.classList.add(...classNames);
				} else {
					element.classList.add(classNames);
				}
			}
		}

		/**
		 * @param {Node} container
		 * @param {string} text
		 * @param {string|string[]} [classNames]
		 * @param {boolean} [stdDecor=false]
		 * @param {number} [value]
		 */
		function makeSpan(container, text, classNames, stdDecor = false, value) {
			let r = document.createElement("span");
			_addClassNames(r, classNames);
			if (value != undefined && V.summaryStats) { /* eslint-disable-line eqeqeq */
				text += `[${value}]`;
			}
			r.textContent = stdDecor ? `${capFirstChar(text)}. ` : text + ' ';
			if (container) {
				container.appendChild(r);
			}
			return r;
		}

		/**
		 * @param {Node} container
		 * @param {string} text
		 * @returns {Text}
		 */
		function addText(container, text) {
			const r = document.createTextNode(text);
			if (container) {
				container.appendChild(r);
			}
			return r;
		}

		/**
		 * @param {Node} [container]
		 * @param {string|string[]} [classNames]
		 */
		function makeBlock(container, classNames) {
			let r = document.createElement("span");
			r.classList.add("ssb");
			_addClassNames(r, classNames);
			if (container) {
				container.appendChild(r);
			}
			return r;
		}

		/**
		 * @param {Node} container
		 * @param {string|string[]} [classNames]
		 * @returns {HTMLParagraphElement}
		 */
		function makeParagraph(container, classNames) {
			let r = document.createElement("p");
			r.classList.add("si");
			_addClassNames(r, classNames);
			if (container) {
				container.appendChild(r);
			}
			return r;
		}

		/**
		 * @typedef {object} StyledDesc
		 * @property {string} desc
		 * @property {string|string[]} [style]
		 */

		/** @typedef {{[key: number]: StyledDesc}} StyledRatings */
		/**
		 * @param {Node} container
		 * @param {StyledRatings} ratings
		 * @param {number} [value]
		 * @param {number} [offset] value offset in the ratings dictionary (to eliminate negative values)
		 * @param {boolean} [stdDecor=false]
		 */
		function makeRatedStyledSpan(container, ratings, value, offset = 0, stdDecor = false) {
			const d = App.Ratings.numeric(ratings, value + offset);
			if (d) {
				makeSpan(container, d.desc, d.style, stdDecor, value);
			}
		}

		/**
		 * @param {Node} container
		 * @param {StyledDesc} styledDesc
		 * @param {number} [value]
		 * @param {boolean} [stdDecor]
		 */
		function makeStyledSpan(container, styledDesc, value, stdDecor = false) {
			if (styledDesc) {
				makeSpan(container, styledDesc.desc, styledDesc.style, stdDecor, value);
			}
		}

		/**
		 * @param {Node} container
		 * @param {StyledRatings} ratings
		 * @param {string|number} value
		 */
		function makeMappedStyledSpan(container, ratings, value) {
			const d = ratings[value];
			if (d) {
				makeSpan(container, d.desc, d.style);
			}
		}

		/**
		 * @param {Node} container
		 * @param {{[key: string]: string}} ratings
		 * @param {string|number} value
		 * @param {string|string[]} [classNames]
		 */
		function makeMappedSpan(container, ratings, value, classNames) {
			const d = ratings[value];
			if (d) {
				makeSpan(container, d, classNames);
			}
		}

		/**
		 * Returns first three string characters with the first one uppercased (string -> Str)
		 * @param {string} s
		 * @returns {string}
		 */
		function firstThreeUc(s) {
			return s.charAt(0).toUpperCase() + s.charAt(1) + s.charAt(2);
		}

		/**
		 * @param {FC.ArcologyState} arcology
		 */
		function syncFSData(arcology) {
			arcology = arcology || V.arcologies[0];
			for (const fsp of App.Data.FutureSociety.fsNames) {
				const policy = arcology[fsp];
				const p = fsp.slice(2);
				FSData.policy[p] = {
					active: _.isNil(policy) ? 0 : 1,
					strength: Math.trunc((policy ?? 0) / 10)
				};
			}

			if (FSData.policy.SlimnessEnthusiast.active) {
				FSData.bigButts = -1;
			} else if ((FSData.policy.TransformationFetishist.strength >= 2) || (FSData.policy.HedonisticDecadence.strength >= 2) || (FSData.policy.AssetExpansionist.strength >= 2) || (arcology.FSIntellectualDependencyLawBeauty >= 1)) {
				FSData.bigButts = 1;
			} else {
				FSData.bigButts = 0;
			}
		}

		/**
		 * @typedef {object} FSDatum
		 * @property {number} active FS policy is active (0,1)
		 * @property {number} strength FS decoration level divided by 10
		 */
		const FSData = {
			/** @type {Partial<Record<FC.FSName<FC.FutureSociety>, FSDatum>>}} */
			policy: {},
			/**
			 * -1: disapprove, 0: don't really care, 1: fashionable
			 * @type {-1|0|1} */
			bigButts: 0,
		};

		/**
		 *
		 * @param {ParentNode} container
		 * @param {FC.SlaveState} slave
		 * @param {string} text
		 * @returns {HTMLSpanElement}
		 */
		function referenceSlaveWithPreview(container, slave, text) {
			const preview = App.UI.DOM.referenceSlaveWithPreview(slave, text);
			container.append(preview);
			return preview;
		}

		const longFamilyBits = {
			and: " and ",
			makeBit: s => s + '.',
			daughters10: "Has tons of daughters.",
			daughters5: "Has many daughters.",
			daughters1: "Has several daughters.",
			sisters10: "One of many sisters.",
			sisters5: "Has many sisters.",
			sisters1: "Has several sisters.",
			emotionBind: "Emotionally bonded to you.",
			emotionSlut: "Emotional slut."
		};

		const shortFamilyBits = {
			and: " & ",
			makeBit: s => s,
			daughters10: "tons of daughters",
			daughters5: "many daughters",
			daughters1: "has daughters",
			sisters10: "One of many sisters.",
			sisters5: "Has many sisters.",
			sisters1: "Has several sisters.",
			emotionBind: "E Bonded",
			emotionSlut: "E Slut"
		};

		/**
		 * @param {Node} container
		 * @param {FC.SlaveState} slave
		 * @param {boolean} short
		 */
		function renderFamily(container, slave, short) {
			let handled = 0;
			const bits = short ? shortFamilyBits : longFamilyBits;
			const block = makeBlock();
			const cssClassName = "lightgreen";
			if (areRelated(V.PC, slave) || areDistantlyRelated(V.PC, slave)) {
				addText(block, `Your `);
				if (slave.relationship < -1) {
					makeSpan(block, bits.makeBit(toSentence([...relativeTerms(V.PC, slave), PCrelationshipTerm(slave)])), cssClassName);
					handled = 1;
				} else {
					makeSpan(block, bits.makeBit(relativeTerm(V.PC, slave)), cssClassName);
				}
			}
			if (slave.mother > 0) {
				const ssj = getSlaves().find(s => s.ID === slave.mother)?.value;
				if (ssj) {
					helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
					addText(block, "'s ");
					let spanText = getPronouns(slave).daughter;
					if (slave.relationshipTarget === ssj.ID) {
						spanText += `${bits.and}${relationshipTerm(slave)}`;
						handled = 1;
					}
					makeSpan(block, bits.makeBit(spanText), cssClassName);
				}
			} else if (slave.mother in V.missingTable && V.showMissingSlavesSD && V.showMissingSlaves) {
				addText(block, `${V.missingTable[slave.mother].fullName}'s `);
				makeSpan(block, bits.makeBit(getPronouns(slave).daughter), cssClassName);
			}
			if (slave.father > 0 && slave.father !== slave.mother) {
				const ssj = getSlaves().find(s => s.ID === slave.father)?.value;
				if (ssj) {
					helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
					addText(block, "'s ");
					let spanText = getPronouns(slave).daughter;
					if (slave.relationshipTarget === ssj.ID) {
						spanText += `${bits.and}${relationshipTerm(slave)}`;
						handled = 1;
					}
					makeSpan(block, bits.makeBit(spanText), cssClassName);
				}
			} else if (slave.father in V.missingTable && slave.father !== slave.mother && V.showMissingSlavesSD && V.showMissingSlaves) {
				addText(block, `${V.missingTable[slave.father].fullName}'s `);
				makeSpan(block, bits.makeBit(getPronouns(slave).daughter), cssClassName);
			}
			if (slave.daughters === 1) {
				const ssj = getSlaves().find(s => s.mother === slave.ID || s.father === slave.ID)?.value;
				if (ssj) {
					helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
					addText(block, "'s ");
					let spanText = parentTerm(ssj, slave);
					if (slave.relationshipTarget === ssj.ID) {
						spanText += `${bits.and}${relationshipTerm(slave)}`;
						handled = 1;
					}
					makeSpan(block, bits.makeBit(spanText), cssClassName);
				}
			} else if (slave.daughters > 1) {
				if (slave.daughters > 10) {
					makeSpan(block, bits.daughters10, cssClassName);
				} else if (slave.daughters > 5) {
					makeSpan(block, bits.daughters5, cssClassName);
				} else {
					makeSpan(block, bits.daughters1, cssClassName);
				}
			}
			if (slave.sisters === 1) {
				const ssj = getSlaves().find(s => areSisters(s, slave) > 0)?.value;
				if (ssj) {
					helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
					addText(block, "'s ");
					let spanText = getPronouns(slave).sister;
					if (slave.relationshipTarget === ssj.ID) {
						spanText += `${bits.and}${relationshipTerm(slave)}`;
						handled = 1;
					}
					makeSpan(block, bits.makeBit(spanText), cssClassName);
				}
			} else if (slave.sisters > 1) {
				if (slave.sisters > 10) {
					makeSpan(block, bits.sisters10, cssClassName);
				} else if (slave.sisters > 5) {
					makeSpan(block, bits.sisters5, cssClassName);
				} else {
					makeSpan(block, bits.sisters1, cssClassName);
				}
			}
			if (slave.relationship > 0 && handled !== 1) {
				const ssj = getSlaves().find(s => s.ID === slave.relationshipTarget)?.value;
				if (ssj) {
					helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
					addText(block, "'s ");
					makeSpan(block, bits.makeBit(relationshipTerm(slave)), cssClassName);
				}
			} else if (slave.relationship === -3 && !areRelated(V.PC, slave)) {
				makeSpan(block, bits.makeBit(`Your ${getPronouns(slave).wife}`), cssClassName);
			} else if (slave.relationship === -2) {
				makeSpan(block, bits.emotionBind, cssClassName);
			} else if (slave.relationship === -1) {
				makeSpan(block, bits.emotionSlut, cssClassName);
			}

			if (block.textContent.length > 0) {
				container.appendChild(block);
			}
		}

		return {
			addText,
			makeSpan,
			makeBlock,
			makeParagraph,
			makeStyledSpan,
			makeRatedStyledSpan,
			makeMappedStyledSpan,
			makeMappedSpan,
			firstThreeUc,
			syncFSData,
			FSData,
			referenceSlaveWithPreview,
			renderFamily
		};
	}();

	const bits = function() {
		const addText = helpers.addText;
		const makeSpan = helpers.makeSpan;
		const makeBlock = helpers.makeBlock;
		const makeRatedStyledSpan = helpers.makeRatedStyledSpan;

		/**
		 * Returns index in the hips-ass rating table
		 * @param {FC.SlaveState} slave
		 * @returns {number} 0 if butt is considered too small, 1 is too big, 2 is too big but that's fashionable, -1 otherwise.
		 */
		function hipsAssRating(slave) {
			const bigButts = helpers.FSData.bigButts;
			const bigButtReaction = bigButts > 0 ? 2 : 1;

			if (slave.hips < -1) {
				if (slave.butt > 2 && bigButts <= 0) {
					return bigButtReaction;
				}
			} else if (slave.hips < 0) {
				if (slave.butt > 4 && bigButts <= 0) {
					return bigButtReaction;
				}
			} else if (slave.hips > 2) {
				if (slave.butt < 9) {
					return 0;
				}
			} else if (slave.hips > 1) {
				if (slave.butt < 4 && (bigButts === 0 || (slave.boobs >= 500))) {
					return 0;
				}
			} else if (slave.hips > 0) {
				if (slave.butt > 8) {
					return bigButtReaction;
				} else if (slave.butt < 3 && ((bigButts === 0) || (slave.boobs >= 500))) {
					return 0;
				}
			} else {
				if (slave.butt > 6) {
					if (bigButts <= 0) {
						return bigButtReaction;
					}
				} else if (slave.butt < 2 && (bigButts === 0 || (slave.boobs >= 500))) {
					return 0;
				}
			}
			return -1;
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {FC.Data.SlaveSummary.SmartVibrator} spData
		 * @returns {string}
		 */
		function smartFetishStr(slave, spData) {
			/** @type {string} */
			let value;
			if (slave.piercing.genitals.smart) {
				value = spData.system.piercing;
			} else if (slave.dickAccessory === "smart bullet vibrator") {
				value = spData.system.bullet;
			} else {
				value = spData.system.vibe;
			}
			value += ":";
			if (slave.fetishKnown === 1) {
				if (slave.clitSetting === "off") {
					return value + spData.setting.off;
				} else if ((slave.energy <= 95) && (slave.clitSetting === "all")) {
					return value + spData.setting.all;
				} else if ((slave.energy > 5) && (slave.clitSetting === "none")) {
					return value + spData.setting.none;
				} else if (slave.fetishStrength <= 95 || !smartPiercingReinforcesFetish(slave)) {
					const s = value + spData.setting[slave.clitSetting];
					if (s) {
						return s;
					}
				}
				if (!["anti-men", "anti-women", "men", "women"].includes(slave.clitSetting)) {
					return value + spData.setting.monitoring;
				}
			} else {
				return value + spData.setting[slave.clitSetting];
			}
			return null;
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {FC.Data.SlaveSummary.SmartVibrator} spData
		 * @returns {string}
		 */
		function smartAttractionStr(slave, spData) {
			const sps = spData.setting;
			const cs = slave.clitSetting;
			if (slave.attrKnown === 1) {
				switch (cs) {
					case "women":
						if (slave.attrXX < 95) {
							return sps.women;
						} else {
							return sps.monitoring;
						}
					case "men":
						if (slave.attrXY < 95) {
							return sps.men;
						} else {
							return sps.monitoring;
						}
					case "anti-women":
						if (slave.attrXX > 0) {
							return sps["anti-women"];
						} else {
							return sps.monitoring;
						}
					case "anti-men":
						if (slave.attrXY > 0) {
							return sps["anti-men"];
						} else {
							return sps.monitoring;
						}
				}
			} else {
				switch (cs) {
					// fall-through
					case "women":
					case "men":
					case "anti-women":
					case "anti-men":
						return sps[cs];
				}
			}
			return null;
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortHealth(slave, c) {
			if (slave.health.health < -20) {
				makeSpan(c, "H", ["red", "strong"], true, slave.health.health);
			} else if (slave.health.health <= 20) {
				makeSpan(c, "H", ["yellow", "strong"], true, slave.health.health);
			} else if (slave.health.health > 20) {
				makeSpan(c, "H", ["green", "strong"], true, slave.health.health);
			}
			if (passage() === "Clinic" && V.clinicUpgradeScanner) {
				if (slave.chem > 15) {
					makeSpan(c, `C${Math.ceil(slave.chem / 10)}`, ["cyan", "strong"]);
				} else if (slave.chem <= 15 && slave.assignment === Job.CLINIC) {
					makeSpan(c, `CSafe`, ["green", "strong"]);
				}
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortIllness(slave, c) {
			if (slave.health.illness > 2) {
				makeSpan(c, `Ill${slave.health.illness}`, ["red", "strong"], true, slave.health.illness);
			} else if (slave.health.illness > 0) {
				makeSpan(c, `Ill${slave.health.illness}`, ["yellow", "strong"], true, slave.health.illness);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortTired(slave, c) {
			helpers.makeRatedStyledSpan(c, data.short.health.tiredness, slave.health.tired, 0, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longHealth(slave, c) {
			helpers.makeRatedStyledSpan(c, data.long.health.health, slave.health.health, 100, true);
			if (passage() === "Clinic" && V.clinicUpgradeScanner) {
				if (slave.chem > 15) {
					makeSpan(c, `Carcinogen buildup: ${Math.ceil(slave.chem / 10)}.`, "cyan");
				} else if (slave.chem <= 15 && slave.assignment === Job.CLINIC) {
					makeSpan(c, `Safe chem levels.`, "green");
				}
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longIllness(slave, c) {
			makeRatedStyledSpan(c, data.long.health.illness, slave.health.illness, 0, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longTired(slave, c) {
			makeRatedStyledSpan(c, data.long.health.tiredness, slave.health.tired, 0, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longAge(slave, c) {
			const style = "pink";
			makeSpan(c, V.showAgeDetail ? `Age ${slave.actualAge}` : App.Ratings.numeric(data.long.body.age, slave.actualAge), style, true);
			/*
			 ** No NCS, then do the standard, However because of the wrinkles of Incubators, as long as visual age is greater
			 ** than or equal to physical age, we do the old physical body/Looks for fresh out of the can NCS slaves.
			 */
			if (((slave.geneMods.NCS === 0) || (slave.visualAge >= slave.physicalAge))) {
				if (slave.actualAge !== slave.physicalAge) {
					makeSpan(c, `${slave.physicalAge} year old body`, style, true);
				}
				if (slave.visualAge !== slave.physicalAge) {
					makeSpan(c, `Looks ${slave.visualAge}`, style, true);
				}
			} else {
				/*
				 ** Now the rub. The use of physical Age for the year old body above, basically conflicts with the changes
				 ** that NCS introduces, so here to *distinguish* the changes, we use visual age with the 'year old body'
				 ** and appears, for example: Slave release from incubator at age 10, Her summary would show, 'Age 0. 10
				 ** year old body.' But if she's given NCS a few weeks after release, while she's still before her first
				 ** birthday, it'll appear the same. But once her birthday fires, if we ran with the above code it would
				 ** say: 'Age 1. 11 year old body.' -- this conflicts with the way NCS works though, because she hasn't
				 ** visually aged, so our change here makes it say 'Age 1. Appears to have a 10 year old body.'
				 */
				makeSpan(c, `Appears to have a ${slave.visualAge} year old body`, style, true);
			}
			if (slave.geneMods.NCS === 1) {
				makeSpan(c, "NCS", "orange", true);
			}
			if (slave.geneMods.immortality === 1) {
				makeSpan(c, "Immortal", "orange", true);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longFace(slave, c) {
			const r = App.Ratings.numeric(data.long.body.face, slave.face + 100);
			makeSpan(c, `${r.desc} ${slave.faceShape} face`, r.style, true, slave.face);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longEyes(slave, c) {
			if (!canSee(slave)) {
				makeSpan(c, "Blind.", "red");
			} else if (!canSeePerfectly(slave)) {
				makeSpan(c, "Nearsighted.", "yellow");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longEars(slave, c) {
			if (slave.hears <= -2) {
				makeSpan(c, "Deaf.", "red");
			} else if ((slave.hears === -1) && (slave.earwear !== "hearing aids")) {
				makeSpan(c, "Hard of hearing.", "yellow");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longLips(slave, c) {
			makeRatedStyledSpan(c, data.long.body.lips, slave.lips, 0, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longTeeth(slave, c) {
			helpers.makeMappedStyledSpan(c, data.long.body.teeth, slave.teeth);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longMuscles(slave, c) {
			const h = helpers;
			h.makeStyledSpan(c, App.Ratings.multiNumeric(data.long.body.muscles, [slave.muscles + 100, h.FSData.policy.PhysicalIdealist.active]), slave.muscles, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longVoice(slave, c) {
			if (slave.voice === 0) {
				makeSpan(c, "Mute.", "red");
			} else {
				helpers.makeMappedStyledSpan(c, data.long.accent, slave.accent);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longTitsAndAss(slave, c) {
			const h = helpers;
			h.makeStyledSpan(c,
				App.Ratings.multiNumeric(data.long.body.titsAss,
					[slave.boobs, slave.butt, h.FSData.policy.AssetExpansionist.active, slave.weight + 100, slave.muscles + 100]));
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longHips(slave, c) {
			const di = hipsAssRating(slave);
			if (di >= 0) {
				helpers.makeMappedStyledSpan(c, data.long.body.hipsAss, di);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longWaist(slave, c) {
			makeRatedStyledSpan(c, data.long.body.waist, slave.waist, 100, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longImplants(slave, c) {
			const styles = "pink";
			if ((slave.boobsImplant !== 0) || (slave.buttImplant !== 0) || (slave.lipsImplant !== 0) || (slave.bellyImplant !== -1)) {
				makeSpan(c, "Implants.", styles);
			} else if ((slave.faceImplant > 5) || (slave.waist < -95)) {
				makeSpan(c, "Surgery enhanced.", styles);
			} else {
				makeSpan(c, "All natural.", styles);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longLactation(slave, c) {
			if (slave.lactation === 1) {
				makeSpan(c, "Lactating naturally.", "pink");
			} else if (slave.lactation === 2) {
				makeSpan(c, "Heavy lactation.", "pink");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function milkFlavor(slave, c) {
			if (slave.milkFlavor !== "none" && slave.lactation >= 1) {
				makeSpan(c, `${capFirstChar(slave.milkFlavor)} flavored milk.`, "pink");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longMods(slave, c) {
			const modScore = SlaveStatsChecker.modScore(slave);
			if (slave.piercing.corset.weight === 0 && modScore.piercing < 3 && modScore.tat < 2) {
				return;
			}
			if (modScore.total > 15 || (modScore.piercing > 8 && modScore.tat > 5)) {
				makeSpan(c, "Extensive body mods.");
			} else if (modScore.total > 7) {
				makeSpan(c, "Noticeable body mods.");
			} else {
				makeSpan(c, "Light body mods.");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortAge(slave, c) {
			let r = makeSpan(c, "", "pink");
			if (V.showAgeDetail === 1) {
				r.textContent += slave.actualAge.toString();
			} else if (slave.actualAge >= 18) {
				r.textContent += App.Ratings.numeric(data.short.body.age, slave.actualAge);
			}

			if (slave.actualAge !== slave.physicalAge) {
				r.textContent += ` w ${slave.physicalAge}y-bdy`;
			}
			if (slave.visualAge !== slave.physicalAge) {
				r.textContent += ` Lks${slave.visualAge}`;
			}
			r.textContent += " ";
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortFace(slave, c) {
			makeRatedStyledSpan(c, data.short.body.face, slave.face, 100, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortEyes(slave, c) {
			if (!canSee(slave)) {
				makeSpan(c, "Blind", "red");
			} else if (!canSeePerfectly(slave)) {
				makeSpan(c, "Sight-", "yellow");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortEars(slave, c) {
			if (slave.hears === -2) {
				makeSpan(c, "Deaf", "red");
			} else if ((slave.hears === -1) && (slave.earwear !== "hearing aids")) {
				makeSpan(c, "Hearing-", "yellow");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortLips(slave, c) {
			makeRatedStyledSpan(c, data.short.body.lips, slave.lips, 0, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortTeeth(slave, c) {
			helpers.makeMappedStyledSpan(c, data.short.body.teeth, slave.teeth);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortMuscles(slave, c) {
			const h = helpers;
			h.makeStyledSpan(c, App.Ratings.multiNumeric(data.short.body.muscles, [slave.muscles + 100, h.FSData.policy.PhysicalIdealist.active]), slave.muscles, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortVoice(slave, c) {
			if (slave.voice === 0) {
				makeSpan(c, "Mute", "red");
			} else {
				helpers.makeMappedStyledSpan(c, data.short.accent, slave.accent);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortTitsAndAss(slave, c) {
			const h = helpers;
			h.makeStyledSpan(c,
				App.Ratings.multiNumeric(data.short.body.titsAss,
					[slave.boobs, slave.butt, h.FSData.policy.AssetExpansionist.active, slave.weight + 100, slave.muscles + 100]));
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortHips(slave, c) {
			const di = hipsAssRating(slave);
			if (di >= 0) {
				helpers.makeMappedStyledSpan(c, data.short.body.hipsAss, di);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortWaist(slave, c) {
			makeRatedStyledSpan(c, data.short.body.waist, slave.waist, 100, false);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortImplants(slave, c) {
			if ((slave.boobsImplant === 0) && (slave.buttImplant === 0) && (slave.waist >= -95) && (slave.lipsImplant === 0) && (slave.faceImplant <= 5) && (slave.bellyImplant === -1)) {
				makeSpan(c, "Natr", "pink");
			} else {
				makeSpan(c, "Impl", "pink");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortLactation(slave, c) {
			if (slave.lactation === 1) {
				makeSpan(c, "Lact", "pink");
			} else if (slave.lactation === 2) {
				makeSpan(c, "Lact", "pink");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortMods(slave, c) {
			const modScore = SlaveStatsChecker.modScore(slave);
			if (slave.piercing.corset.weight === 0 && modScore.piercing < 3 && modScore.tat < 2) {
				return;
			} else if (modScore.total > 15 || (modScore.piercing > 8 && modScore.tat > 5)) {
				makeSpan(c, "Mods++");
			} else if (modScore.total > 7) {
				makeSpan(c, "Mods+");
			} else {
				makeSpan(c, "Mods");
			}
			const brands = App.Medicine.Modification.brandRecord(slave);
			if (!jQuery.isEmptyObject(brands)) {
				makeSpan(c, "Br");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortIntelligence(slave, c) {
			if (slave.fetish === Fetish.MINDBROKEN) {
				return;
			}
			const intelligence = slave.intelligence + slave.intelligenceImplant;
			const educationStr = App.Ratings.numeric(data.short.mental.education, slave.intelligenceImplant + 15);
			const intelligenceRating = App.Ratings.numeric(data.short.mental.intelligence, intelligence + 100);
			makeSpan(c, `${intelligenceRating.desc}${educationStr}`, intelligenceRating.style, true, intelligence);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortSkills(slave, c) {
			const sd = data.short.skills;
			let SSkills = (slave.skill.anal + slave.skill.oral);
			let PSU = penetrativeSocialUse();
			if (
				((SSkills + slave.skill.whoring + slave.skill.entertainment) >= 400) &&
				((slave.vagina < 0) || (slave.skill.vaginal >= 100)) &&
				((PSU < 60 && (PSU < 40 || (!canAchieveErection(slave) && slave.clit < 3))) || (slave.skill.penetrative >= 100))
			) {
				helpers.makeStyledSpan(c, sd.mss);
			} else {
				SSkills += slave.skill.vaginal + adjustedPenSkill(slave);
				helpers.makeStyledSpan(c, App.Ratings.multiNumeric(sd.sex, [SSkills, ((slave.vagina >= 0 ? 1 : 0) + (slave.dick > 0 ? 2 : 0))]), Math.trunc(SSkills), true);
				helpers.makeRatedStyledSpan(c, sd.whoring, slave.skill.whoring, 0, true);
				helpers.makeRatedStyledSpan(c, sd.entertainment, slave.skill.entertainment, 0, true);
			}
			helpers.makeRatedStyledSpan(c, sd.combat, slave.skill.combat, 0, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortPrestige(slave, c) {
			helpers.makeMappedStyledSpan(c, data.short.prestige, slave.prestige);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortPornPrestige(slave, c) {
			helpers.makeMappedStyledSpan(c, data.short.pornPrestige, slave.porn.prestige);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longIntelligence(slave, c) {
			if (slave.fetish === Fetish.MINDBROKEN) {
				return;
			}
			const intelligence = slave.intelligence + slave.intelligenceImplant;
			const educationStr = App.Ratings.numeric(data.long.mental.education, slave.intelligenceImplant + 15);
			const intelligenceRating = App.Ratings.numeric(data.long.mental.intelligence, intelligence + 100);
			makeSpan(c, `${intelligenceRating.desc}${educationStr}`, intelligenceRating.style, true, intelligence);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longSkills(slave, c) {
			const sd = data.long.skills;
			let SSkills = (slave.skill.anal + slave.skill.oral);
			let PSU = penetrativeSocialUse();
			if (
				((SSkills + slave.skill.whoring + slave.skill.entertainment) >= 400) &&
				((slave.vagina < 0) || (slave.skill.vaginal >= 100)) &&
				((PSU < 60 && (PSU < 40 || (!canAchieveErection(slave) && slave.clit < 3))) || (slave.skill.penetrative >= 100))
			) {
				helpers.makeStyledSpan(c, sd.mss);
			} else {
				SSkills += slave.skill.vaginal + adjustedPenSkill(slave);
				helpers.makeStyledSpan(c, App.Ratings.multiNumeric(sd.sex, [SSkills, ((slave.vagina >= 0 ? 1 : 0) + (slave.dick > 0 ? 2 : 0))]), Math.trunc(SSkills), true);
				helpers.makeRatedStyledSpan(c, sd.whoring, slave.skill.whoring, 0, true);
				helpers.makeRatedStyledSpan(c, sd.entertainment, slave.skill.entertainment, 0, true);
			}
			helpers.makeRatedStyledSpan(c, sd.combat, slave.skill.combat, 0, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longPrestige(slave, c) {
			helpers.makeMappedStyledSpan(c, data.long.prestige, slave.prestige);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longPornPrestige(slave, c) {
			helpers.makeMappedStyledSpan(c, data.long.pornPrestige, slave.porn.prestige);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longClothes(slave, c) {
			makeSpan(c, App.Ratings.exact(data.long.clothes, slave.clothes, 'Naked.'));
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longCollar(slave, c) {
			helpers.makeMappedSpan(c, data.long.accessory.collar, slave.collar);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longMask(slave, c) {
			helpers.makeMappedSpan(c, data.long.accessory.faceAccessory, slave.faceAccessory);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longMouth(slave, c) {
			helpers.makeMappedSpan(c, data.long.accessory.mouthAccessory, slave.mouthAccessory);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longBelly(slave, c) {
			helpers.makeMappedSpan(c, data.long.accessory.belly, slave.bellyAccessory);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longArms(slave, c) {
			if (["hand gloves", "elbow gloves"].includes(slave.armAccessory)) {
				makeSpan(c, slave.armAccessory, undefined, true);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longLegs(slave, c) {
			if (slave.legAccessory === "short stockings") {
				makeSpan(c, "Short stockings.");
			} else if (slave.legAccessory === "long stockings") {
				makeSpan(c, "Long stockings.");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longShoes(slave, c) {
			if (shoeHeelCategory(slave) > 0) {
				makeSpan(c, slave.shoes, undefined, true);
			} else if (slave.heels === 1) {
				makeSpan(c, "Crawling.", "yellow");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longChastity(slave, c) {
			if (slave.chastityAnus === 1 && slave.chastityPenis === 1 && slave.chastityVagina === 1) {
				makeSpan(c, "Full chastity.");
			} else if (slave.chastityPenis === 1 && slave.chastityVagina === 1) {
				makeSpan(c, "Genital chastity.");
			} else if ((slave.chastityAnus === 1 && slave.chastityVagina === 1) || (slave.chastityAnus === 1 && slave.chastityPenis === 1)) {
				makeSpan(c, "Combined chastity.");
			} else if (slave.chastityVagina === 1) {
				makeSpan(c, "Vaginal chastity.");
			} else if (slave.chastityPenis === 1) {
				makeSpan(c, "Chastity cage.");
			} else if (slave.chastityAnus === 1) {
				makeSpan(c, "Anal chastity.");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longVaginalAcc(slave, c) {
			if (slave.vaginalAttachment === "none") {
				helpers.makeMappedSpan(c, data.long.accessory.vaginal, slave.vaginalAccessory);
			} else {
				switch (slave.vaginalAttachment) {
					case "vibrator":
						makeSpan(c, "Vibrating dildo.");
						break;
					case "smart vibrator":
						makeSpan(c, "Smart vibrating dildo.");
						break;
				}
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longDickAcc(slave, c) {
			switch (slave.dickAccessory) {
				case "sock":
					makeSpan(c, "Cock sock.");
					break;
				case "bullet vibrator":
					makeSpan(c, "Frenulum bullet vibrator.");
					break;
				case "smart bullet vibrator":
					makeSpan(c, "Smart frenulum bullet vibrator.");
					break;
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longButtplug(slave, c) {
			helpers.makeMappedSpan(c, data.long.accessory.buttplug, slave.buttplug);
			helpers.makeMappedSpan(c, data.long.accessory.buttplugAttachment, slave.buttplugAttachment);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortFetish(slave, c) {
			/**
			 * @param {FC.SlaveState} slave
			 */
			function fetishStr(slave) {
				const tbl = data.short.fetish[slave.fetish];
				if (!tbl || typeof tbl === 'string') {
					return tbl;
				}
				return App.Ratings.numeric(tbl, slave.fetishStrength);
			}

			const fStr = fetishStr(slave);
			if (fStr) {
				makeSpan(c, fStr, "lightcoral", true, slave.fetishStrength);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortAttraction(slave, c) {
			const sd = data.short.sexDrive;
			// check for special cases first
			if (slave.energy > 95 && slave.attrXX > 95 && slave.attrXY > 95) {
				helpers.makeStyledSpan(c, sd.synergy.nymphomni);
			} else if (slave.attrXX > 95 && slave.attrXY > 95) {
				helpers.makeStyledSpan(c, sd.synergy.omni);
				helpers.makeRatedStyledSpan(c, sd.energy, slave.energy, 0, true);
			} else {
				helpers.makeRatedStyledSpan(c, sd.XY, slave.attrXY, 0, true);
				helpers.makeRatedStyledSpan(c, sd.XX, slave.attrXX, 0, true);
				helpers.makeRatedStyledSpan(c, sd.energy, slave.energy, 0, true);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortSmartPiercing(slave, c) {
			const s = smartFetishStr(slave, data.short.smartVibrator) || smartAttractionStr(slave, data.short.smartVibrator);
			if (s) {
				makeSpan(c, s);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortBehaviorFlaw(slave, c) {
			helpers.makeMappedSpan(c, data.short.mental.behavioralFlaw, slave.behavioralFlaw, "red");
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortSexFlaw(slave, c) {
			helpers.makeMappedStyledSpan(c, data.short.mental.sexualFlaw, slave.sexualFlaw);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortBehaviorQuirk(slave, c) {
			helpers.makeMappedSpan(c, data.short.mental.behavioralQuirk, slave.behavioralQuirk, "green");
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortSexQuirk(slave, c) {
			helpers.makeMappedSpan(c, data.short.mental.sexualQuirk, slave.sexualQuirk, "green");
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longFetish(slave, c) {
			function fetishStr() {
				const tbl = data.long.fetish[slave.fetish];
				if (!tbl || typeof tbl === 'string') {
					return tbl;
				}
				return App.Ratings.numeric(tbl, slave.fetishStrength);
			}

			const fStr = fetishStr();
			if (fStr) {
				makeSpan(c, fStr, "lightcoral", true, slave.fetishStrength);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longAttraction(slave, c) {
			const sd = data.long.sexDrive;

			// check for special cases first
			if (slave.energy > 95 && slave.attrXX > 95 && slave.attrXY > 95) {
				helpers.makeStyledSpan(c, sd.synergy.nymphomni);
			} else if (slave.attrXX > 95 && slave.attrXY > 95) {
				helpers.makeStyledSpan(c, sd.synergy.omni);
				helpers.makeRatedStyledSpan(c, sd.energy, slave.energy, 0, true);
			} else {
				helpers.makeRatedStyledSpan(c, sd.XY, slave.attrXY, 0, true);
				helpers.makeRatedStyledSpan(c, sd.XX, slave.attrXX, 0, true);
				helpers.makeRatedStyledSpan(c, sd.energy, slave.energy, 0, true);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longSmartPiercing(slave, c) {
			const s = smartFetishStr(slave, data.long.smartVibrator) || smartAttractionStr(slave, data.long.smartVibrator);
			if (s) {
				makeSpan(c, s);
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longBehaviorFlaw(slave, c) {
			helpers.makeMappedSpan(c, data.long.mental.behavioralFlaw, slave.behavioralFlaw, "red");
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longSexFlaw(slave, c) {
			switch (slave.sexualFlaw) {
				case "hates oral":
				case "hates anal":
				case "hates penetration":
				case "shamefast":
					makeSpan(c, slave.sexualFlaw, "red", true);
					break;
				case "idealistic":
				case "repressed":
				case "apathetic":
				case "crude":
				case "judgemental":
					makeSpan(c, `Sexually ${slave.sexualFlaw}.`, "red");
					break;
				case "cum addict":
				case "anal addict":
				case "attention whore":
					makeSpan(c, slave.sexualFlaw, "yellow", true);
					break;
				case "breast growth":
					makeSpan(c, `Breast obsession.`, "yellow");
					break;
				case "abusive":
				case "malicious":
					makeSpan(c, `Sexually ${slave.sexualFlaw}.`, "yellow");
					break;
				case "self hating":
					makeSpan(c, `Self hatred.`, "yellow");
					break;
				case "neglectful":
					makeSpan(c, `Self neglectful.`, "yellow");
					break;
				case "breeder":
					makeSpan(c, `Breeding obsession.`, "yellow");
					break;
				default:
					slave.sexualFlaw = "none";
					break;
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longBehaviorQuirk(slave, c) {
			switch (slave.behavioralQuirk) {
				case "confident":
				case "cutting":
				case "funny":
				case "fitness":
				case "adores women":
				case "adores men":
				case "insecure":
				case "sinful":
				case "advocate":
					makeSpan(c, slave.behavioralQuirk, "green", true);
					break;
				default:
					slave.behavioralQuirk = "none";
					break;
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longSexQuirk(slave, c) {
			switch (slave.sexualQuirk) {
				case "gagfuck queen":
				case "painal queen":
				case "strugglefuck queen":
				case "tease":
				case "romantic":
				case "perverted":
				case "caring":
				case "unflinching":
				case "size queen":
					makeSpan(c, slave.sexualQuirk, "green", true);
					break;
				default:
					slave.sexualQuirk = "none";
					break;
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortFamily(slave, c) {
			helpers.renderFamily(c, slave, true);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortClone(slave, c) {
			if (typeof slave.clone === "string") {
				makeSpan(c, "Clone");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function shortRival(slave, c) {
			if (slave.rivalry !== 0) {
				const block = makeBlock(c, "lightsalmon");
				const ssj = getSlaves().find(s => s.ID === slave.rivalryTarget)?.value;
				if (ssj) {
					if (slave.rivalry <= 1) {
						block.textContent = 'Disl ';
						helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
					} else if (slave.rivalry <= 2) {
						helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
						addText(block, "'s rival");
					} else {
						block.textContent = 'Hates ';
						helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
					}
				}
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longFamily(slave, c) {
			helpers.renderFamily(c, slave, false);
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longClone(slave, c) {
			if (typeof slave.clone === "string") {
				makeSpan(c, slave.clone === PlayerName() ? `Your clone.` : `Clone of ${slave.clone}.`, "deepskyblue");
			}
		}

		/**
		 * @param {FC.SlaveState} slave
		 * @param {Node} c
		 * @returns {void}
		 */
		function longRival(slave, c) {
			if (slave.rivalry !== 0) {
				const block = makeBlock(c);
				const ssj = getSlaves().find(s => s.ID === slave.rivalryTarget)?.value;
				if (ssj) {
					if (slave.rivalry <= 1) {
						makeSpan(block, "Dislikes", "lightsalmon");
						addText(block, ' ');
						helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
						addText(block, '.');
					} else if (slave.rivalry <= 2) {
						helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
						addText(block, "'s ");
						makeSpan(block, "rival.", "lightsalmon");
					} else {
						makeSpan(block, "Hates", "lightsalmon");
						addText(block, ' ');
						helpers.referenceSlaveWithPreview(block, ssj, SlaveFullName(ssj));
						addText(block, '.');
					}
				}
			}
		}

		return {
			long: {
				health: longHealth,
				illness: longIllness,
				tired: longTired,
				age: longAge,
				face: longFace,
				eyes: longEyes,
				ears: longEars,
				lips: longLips,
				teeth: longTeeth,
				muscles: longMuscles,
				voice: longVoice,
				titsAndAss: longTitsAndAss,
				hips: longHips,
				waist: longWaist,
				implants: longImplants,
				lactation: longLactation,
				milkflavor: milkFlavor,
				mods: longMods,
				intelligence: longIntelligence,
				skills: longSkills,
				prestige: longPrestige,
				pornPrestige: longPornPrestige,
				clothes: longClothes,
				collar: longCollar,
				mask: longMask,
				mouth: longMouth,
				belly: longBelly,
				arms: longArms,
				legs: longLegs,
				shoes: longShoes,
				chastity: longChastity,
				vaginalAcc: longVaginalAcc,
				dickAcc: longDickAcc,
				buttplug: longButtplug,
				fetish: longFetish,
				attraction: longAttraction,
				smartPiercing: longSmartPiercing,
				behaviorFlaw: longBehaviorFlaw,
				sexFlaw: longSexFlaw,
				behaviorQuirk: longBehaviorQuirk,
				sexQuirk: longSexQuirk,
				family: longFamily,
				clone: longClone,
				rival: longRival
			},
			short: {
				health: shortHealth,
				illness: shortIllness,
				tired: shortTired,
				age: shortAge,
				face: shortFace,
				eyes: shortEyes,
				ears: shortEars,
				lips: shortLips,
				teeth: shortTeeth,
				muscles: shortMuscles,
				voice: shortVoice,
				titsAndAss: shortTitsAndAss,
				hips: shortHips,
				waist: shortWaist,
				implants: shortImplants,
				lactation: shortLactation,
				mods: shortMods,
				intelligence: shortIntelligence,
				skills: shortSkills,
				prestige: shortPrestige,
				pornPrestige: shortPornPrestige,
				/*
				clothes: shortClothes,
				collar: shortCollar,
				belly: shortBelly,
				arms: shortArms,
				legs: shortLegs,
				shoes: shortShoes,
				chastity: shortChastity,
				vaginalAcc: shortVaginalAcc,
				dickAcc: shortDickAcc,
				buttplug: shortButtplug,
				*/
				fetish: shortFetish,
				attraction: shortAttraction,
				smartPiercing: shortSmartPiercing,
				behaviorFlaw: shortBehaviorFlaw,
				sexFlaw: shortSexFlaw,
				behaviorQuirk: shortBehaviorQuirk,
				sexQuirk: shortSexQuirk,
				family: shortFamily,
				clone: shortClone,
				rival: shortRival
			}
		};
	}();

	return {
		helpers: helpers,
		bits: bits
	};
}();
