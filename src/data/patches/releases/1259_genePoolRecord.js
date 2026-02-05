App.Patch.register({
	releaseID: 1259,
	descriptionOfChanges: "Move V.genePool from an array to an object; Add App.Entity.GenePoolRecord",
	pre: (div) => {
		App.Patch.log("Adding V.genePoolDefaults");
		// we use a static copy of App.Entity.GenePoolRecord here as it may have changed since this patch was released
		// @ts-expect-error V.genePoolDefaults is a read only property
		V.genePoolDefaults = {
			"releaseID": 1259,
			"seed": "",
			"ID": 0,
			"slaveName": "blank",
			"slaveSurname": 0,
			"birthName": "blank",
			"birthSurname": 0,
			"pronoun": 0,
			"genes": "XX",
			"natural": {
				"height": 170,
				"boobs": 500,
				"artSeed": 13552227457244
			},
			"father": 0,
			"mother": 0,
			"clone": 0,
			"cloneID": 0,
			"birthWeek": 2,
			"actualAge": 18,
			"visualAge": 18,
			"physicalAge": 18,
			"ovaryAge": 18,
			"nationality": "slave",
			"race": "white",
			"origRace": "white",
			"career": "a slave",
			"health": {
				"condition": 0,
				"shortDamage": 0,
				"longDamage": 0,
				"illness": 0,
				"tired": 0,
				"health": 0
			},
			"markings": "none",
			"eye": {
				"left": {
					"type": 1,
					"vision": 2,
					"iris": "brown",
					"pupil": "circular",
					"sclera": "white"
				},
				"right": {
					"type": 1,
					"vision": 2,
					"iris": "brown",
					"pupil": "circular",
					"sclera": "white"
				},
				"origColor": "brown"
			},
			"hears": 0,
			"smells": 0,
			"tastes": 0,
			"voice": 2,
			"voiceImplant": 0,
			"electrolarynx": 0,
			"accent": 0,
			"earImplant": 0,
			"earShape": "normal",
			"earT": "none",
			"earTNatural": 0,
			"earTColor": "hairless",
			"earTEffectColor": "none",
			"earTEffect": "none",
			"horn": "none",
			"hornColor": "none",
			"PLimb": 0,
			"leg": {
				"left": {
					"type": 1,
					"scar": {},
					"brand": {}
				},
				"right": {
					"type": 1,
					"scar": {},
					"brand": {}
				}
			},
			"arm": {
				"left": {
					"type": 1,
					"scar": {},
					"brand": {}
				},
				"right": {
					"type": 1,
					"scar": {},
					"brand": {}
				}
			},
			"heels": 0,
			"tail": "none",
			"PTail": 0,
			"tailShape": "none",
			"tailColor": "none",
			"tailEffectColor": "none",
			"tailEffect": "none",
			"appendages": "none",
			"appendagesColor": "none",
			"appendagesEffectColor": "none",
			"appendagesEffect": "none",
			"PBack": 0,
			"wingsShape": "none",
			"patternColor": "black",
			"hColor": "brown",
			"origHColor": "brown",
			"hEffectColor": "none",
			"hEffect": "none",
			"pubicHColor": "brown",
			"underArmHColor": "brown",
			"eyebrowHColor": "brown",
			"hLength": 60,
			"eyebrowFullness": "natural",
			"hStyle": "neat",
			"pubicHStyle": "neat",
			"underArmHStyle": "neat",
			"eyebrowHStyle": "natural",
			"skin": "light",
			"origSkin": "light",
			"face": 0,
			"faceImplant": 0,
			"ageImplant": 0,
			"faceShape": "normal",
			"lips": 15,
			"lipsImplant": 0,
			"lipsTat": 0,
			"teeth": "normal",
			"weight": 0,
			"muscles": 0,
			"height": 170,
			"heightImplant": 0,
			"waist": 0,
			"hips": 0,
			"hipsImplant": 0,
			"butt": 0,
			"buttImplant": 0,
			"buttImplantType": "none",
			"buttTat": 0,
			"shoulders": 0,
			"shouldersImplant": 0,
			"boobs": 0,
			"boobsImplant": 0,
			"boobsImplantType": "none",
			"boobShape": "normal",
			"nipples": "cute",
			"areolae": 0,
			"areolaeShape": "circle",
			"boobsTat": 0,
			"vagina": 0,
			"vaginaLube": 0,
			"vaginaTat": 0,
			"ovaImplant": 0,
			"wombImplant": "none",
			"ballType": "human",
			"eggType": "human",
			"broodmother": 0,
			"broodmotherFetuses": 0,
			"broodmotherOnHold": 0,
			"broodmotherCountDown": 0,
			"labia": 0,
			"clit": 0,
			"foreskin": 0,
			"anus": 0,
			"analArea": 1,
			"dick": 0,
			"dickTat": 0,
			"prostate": 0,
			"prostateImplant": 0,
			"balls": 0,
			"ballsImplant": 0,
			"scrotum": 0,
			"ovaries": 0,
			"anusTat": 0,
			"brand": {},
			"piercing": {
				"ear": {
					"weight": 0,
					"desc": ""
				},
				"nose": {
					"weight": 0,
					"desc": ""
				},
				"eyebrow": {
					"weight": 0,
					"desc": ""
				},
				"lips": {
					"weight": 0,
					"desc": ""
				},
				"tongue": {
					"weight": 0,
					"desc": ""
				},
				"nipple": {
					"weight": 0,
					"desc": ""
				},
				"areola": {
					"weight": 0,
					"desc": ""
				},
				"navel": {
					"weight": 0,
					"desc": ""
				},
				"corset": {
					"weight": 0,
					"desc": ""
				},
				"genitals": {
					"weight": 0,
					"desc": "",
					"smart": false
				},
				"vagina": {
					"weight": 0,
					"desc": ""
				},
				"dick": {
					"weight": 0,
					"desc": ""
				},
				"anus": {
					"weight": 0,
					"desc": ""
				}
			},
			"shouldersTat": 0,
			"armsTat": 0,
			"legsTat": 0,
			"backTat": 0,
			"stampTat": 0,
			"chem": 0,
			"addict": 0,
			"devotion": 0,
			"intelligence": 0,
			"intelligenceImplant": 0,
			"geneticQuirks": {
				"macromastia": 0,
				"gigantomastia": 0,
				"potent": 0,
				"fertility": 0,
				"hyperFertility": 0,
				"superfetation": 0,
				"polyhydramnios": 0,
				"uterineHypersensitivity": 0,
				"galactorrhea": 0,
				"gigantism": 0,
				"dwarfism": 0,
				"neoteny": 0,
				"progeria": 0,
				"pFace": 0,
				"uFace": 0,
				"albinism": 0,
				"heterochromia": 0,
				"rearLipedema": 0,
				"wellHung": 0,
				"wGain": 0,
				"wLoss": 0,
				"androgyny": 0,
				"mGain": 0,
				"mLoss": 0,
				"twinning": 0,
				"girlsOnly": 0
			},
			"spermY": 50,
			"bellyTat": 0,
			"abortionTat": -1,
			"birthsTat": -1,
			"pubertyAgeXX": 13,
			"pubertyXX": 0,
			"pubertyAgeXY": 13,
			"pubertyXY": 0,
			"scar": {},
			"premature": 0,
			"vasectomy": 0,
			"hormoneBalance": 0,
			"behavioralFlaw": "none",
			"behavioralQuirk": "none",
			"sexualFlaw": "none",
			"sexualQuirk": "none",
			"geneMods": {
				"NCS": 0,
				"rapidCellGrowth": 0,
				"immortality": 0,
				"flavoring": 0,
				"aggressiveSperm": 0,
				"livestock": 0,
				"progenitor": 0
			},
			"milkFlavor": "none",
			"albinismOverride": null,
			"inbreedingCoeff": 0,
			"trueVirgin": 0
		};

		/** @type {FC.GenePoolRecord[]} */
		App.Patch.log("Moving V.genePool from an array to an object");
		// @ts-ignore
		const GenePoolArray = /** @type {FC.GenePoolRecord[]} */ (_.cloneDeep(V.genePool));
		// @ts-expect-error V.genePoolDefaults is a read only property
		V.genePool = {};
		GenePoolArray.forEach((record) => {
			// we exclude duplicates because the new system cannot have duplicate IDs
			// and the old system just grabbed the first match for a given ID
			if (!isInGenePool(/** @type {FC.HumanState} */ (record))) {
				// send the record through verification to make sure it is up to date
				if (record.ID === -1) {
					App.Verify.playerState(/** @type {FC.PlayerState} */ (record), "PC GenePool record", div);
				} else {
					App.Verify.slaveState(
						`Slave GenePool record for ID '${record.ID}'`,
						/** @type {FC.SlaveState} */ (record),
						"gene pool",
						div
					);
				}
				// App.Verify.*State can add missing records to the gene pool
				// we want to make sure all records are complete and up to data
				// so delete any existing record for this id
				deleteGenePoolRecord(/** @type {FC.HumanState} */ (record), true);
				// add the record to the gene pool
				addToGenePool(/** @type {FC.HumanState} */ (record));
			}
		});
	},
});
