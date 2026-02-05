/**
 * Gets an object with the active recruiter specializations, including
 * eugenics SMRs if the recruiter is using them
 * @returns {Record<"beauty" | "height" | "intelligence", number>}
 */
globalThis.getActiveRecruiterSpecializations = function() {
	const specs = {
		...V.recruiterSpecializations,
	};

	if (V.recruiterEugenics) {
		if (V.policies.SMR.eugenics.faceSMR) {
			specs.beauty = 1;
		}
		if (V.policies.SMR.eugenics.heightSMR) {
			specs.height = 1;
		}
		if (V.policies.SMR.eugenics.intelligenceSMR) {
			specs.intelligence = 1;
		}
	}

	return specs;
};

/**
 * Get the number of active recruiter specializations, including
 * eugenics SMRs if the recruiter is using them
 * @returns {number}
 */
globalThis.getNumActiveRecruiterSpecializations = function() {
	return Object.values(getActiveRecruiterSpecializations()).reduce((sum, spec) => spec === 0 ? sum : sum+1, 0);
};

/**
 * Get the maximum number of specializations your recruiter could have
 * @param {number} [skill] Check a specific skill level. If you don't pass this, it will use your recruiter's skill
 * @returns {number}
 */
globalThis.getMaxRecruiterSpecializations = function(skill) {
	const useRecruiter = skill === undefined;
	if (useRecruiter) {
		if (!S.Recruiter) {
			return 0;
		}
		skill = S.Recruiter.skill.recruiter;
	}

	if (useRecruiter && App.Data.Careers.Leader.recruiter.includes(S.Recruiter.career)) {
		return 3;
	} else if (skill <= 20) {
		return 0;
	} else if (skill <= 60) {
		return 1;
	} else if (skill <= 120) {
		return 2;
	} else {
		return 3;
	}
};
