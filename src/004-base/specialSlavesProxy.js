App.SpecialSlavesProxy = class SpecialSlavesProxy {
	constructor() {
	}

	get Attendant() {
		return getSlave(V.AttendantID);
	}
	get Bodyguard() {
		return getSlave(V.BodyguardID);
	}
	get Concubine() {
		return getSlave(V.ConcubineID);
	}
	get DJ() {
		return getSlave(V.djID);
	}
	get Farmer() {
		return getSlave(V.FarmerID);
	}
	get HeadGirl() {
		return getSlave(V.HeadGirlID);
	}
	get Lurcher() {
		return getSlave(V.LurcherID);
	}
	get Madam() {
		return getSlave(V.MadamID);
	}
	get Matron() {
		return getSlave(V.MatronID);
	}
	get Milkmaid() {
		return getSlave(V.MilkmaidID);
	}
	get Nurse() {
		return getSlave(V.NurseID);
	}
	get Recruiter() {
		return getSlave(V.RecruiterID);
	}
	get Schoolteacher() {
		return getSlave(V.SchoolteacherID);
	}
	get Stewardess() {
		return getSlave(V.StewardessID);
	}
	get Stud() {
		return getSlave(V.StudID);
	}
	get Wardeness() {
		return getSlave(V.WardenessID);
	}
};

globalThis.S = new App.SpecialSlavesProxy();
