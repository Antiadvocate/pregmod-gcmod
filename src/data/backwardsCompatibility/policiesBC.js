/**
 * All of the code in this file is legacy. Changing it will likely break old saves, as the patching system still uses it.
 *
 * To create a new patch (BC) see the instructions at the top of `/src/data/patches/patch.js`.
 */

// @ts-nocheck this is legacy, all of it's missing/incorrect values where correct when they were implemented. This worked fine with save data structures from release 1258 and before. And saves/new games after 1258 shouldn't be running this code
/* eslint-disable jsdoc/require-jsdoc */

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`
 */
App.Update.policies = function() {
	function convertMain(variable, pro, anti) {
		if (V[pro]) {
			V.policies[variable] = 1;
		} else if (V[anti]) {
			V.policies[variable] = -1;
		}
	}

	function convertRetirement(variable, retireType, amountRequired) {
		if (V[retireType] && V[amountRequired]) {
			V.policies.retirement[variable] = V[amountRequired];
		}
	}

	App.Utils.setNonexistentProperties(V.policies, {
		gumjobFetishism: 0,
		gumjobFetishismSMR: 0,
		idealAge: 0
	});

	// Spelling fixes:
	V.policies.sexualOpenness = V.policies.sexualOpenness || V.policies.sexualOpeness || 0;
	V.policies.bestialityOpenness = V.policies.bestialityOpenness || V.policies.bestialityOpeness || 0;
	V.policies.immigrationCash = V.policies.immigrationCash || V.policies.immmigrationCash || 0;
	V.policies.immigrationRep = V.policies.immigrationRep || V.policies.immmigrationRep || 0;

	if (V.releaseID < 1069) {
		App.Utils.moveProperties(V.policies, V, {
			childProtectionAct: "childProtectionAct",
			culturalOpenness: "CulturalOpenness",
			sexualOpenness: V.hasOwnProperty("sexualOpenness") ? "sexualOpenness" : "sexualOpeness",
			proRefugees: "ProRefugees",
			publicFuckdolls: "publicFuckdolls",

			proRecruitment: "ProRecruitment",
			cash4Babies: "Cash4Babies",
			regularParties:"RegularParties",
			publicPA: "PAPublic",
			coursingAssociation: "CoursingAssociation",

			raidingMercenaries: "RaidingMercenaries",
			mixedMarriage: "MixedMarriage",
			goodImageCampaign: "goodImageCampaign",
			alwaysSubsidizeRep: "alwaysSubsidizeRep",
			alwaysSubsidizeGrowth: "alwaysSubsidizeGrowth"
		});

		convertMain('immigrationCash', 'ProImmigrationCash', 'AntiImmigrationCash');
		convertMain('immigrationRep', 'ProImmigrationRep', 'AntiImmigrationRep');
		convertMain('enslavementCash', 'ProEnslavementCash', 'AntiEnslavementCash');
		convertMain('enslavementRep', 'ProEnslavementRep', 'AntiEnslavementRep');
		convertMain('cashForRep', 'CashForRep', 'RepForCash');

		convertMain('oralAppeal', 'OralEncouragement', 'OralDiscouragement');
		convertMain('vaginalAppeal', 'VaginalEncouragement', 'VaginalDiscouragement');
		convertMain('analAppeal', 'AnalEncouragement', 'AnalDiscouragement');

		convertRetirement('sex', 'SexMilestoneRetirement', 'retirementSex');
		convertRetirement('milk', 'MilkMilestoneRetirement', 'retirementMilk');
		convertRetirement('cum', 'CumMilestoneRetirement', 'retirementCum');
		convertRetirement('births', 'BirthsMilestoneRetirement', 'retirementBirths');
		convertRetirement('kills', 'KillsMilestoneRetirement', 'retirementKills');

		const retirementFates = {
			bioreactor: "BioreactorRetirement",
			arcade: "ArcadeRetirement",
			citizen: "CitizenRetirement"
		};
		for (const [k, v] of Object.entries(retirementFates)) {
			if (V[v]) {
				V.policies.retirement.fate = k;
			}
		}
		App.Utils.deleteProperties(V, Object.values(retirementFates));

		App.Utils.moveProperties(V.policies.retirement, V, {
			menial2Citizen: "citizenRetirementMenials",
			physicalAgePolicy: "PhysicalRetirementAgePolicy"
		});

		App.Utils.moveProperties(V.policies.retirement, V, {
			customAgePolicy: "CustomRetirementAgePolicy"
		}, false, true);

		App.Utils.moveProperties(V.policies.SMR, V, {
			basicSMR: "BasicSMR",
			healthInspectionSMR: "HealthInspectionSMR",
			educationSMR: "EducationSMR",
			frigiditySMR: "FrigiditySMR",

			weightSMR: "BasicWeightSMR",
			honestySMR: "HonestySMR"
		});

		App.Utils.moveProperties(V.policies.SMR.beauty, V, {
			basicSMR: "BasicBeautySMR",
			qualitySMR: "QualityBeautySMR"
		});

		App.Utils.moveProperties(V.policies.SMR.height, V, {
			basicSMR: "BasicHeightSMR",
			advancedSMR: "AdvancedHeightSMR"
		});

		App.Utils.moveProperties(V.policies.SMR.intelligence, V, {
			basicSMR: "BasicIntelligenceSMR",
			qualitySMR: "QualityIntelligenceSMR"
		});

		App.Utils.moveProperties(V.policies.SMR.eugenics, V, {
			faceSMR: "FaceEugenicsSMR",
			heightSMR: "HeightEugenicsSMR",
			intelligenceSMR: "IntelligenceEugenicsSMR"
		});
	}
};
