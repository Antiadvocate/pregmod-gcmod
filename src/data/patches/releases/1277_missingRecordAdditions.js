
App.Patch.register({
	releaseID: 1277,
	descriptionOfChanges: "Adds extra values to existing MissingParentRecords.",
	pre: (div) => {
		for (const [ID, record] of Object.entries(V.missingTable)) {
			const isKing = ["the late king", "the former king"].includes(record.slaveName.toLowerCase());
			record.yours = !isKing;
			 // we have no way of knowing if a normal slave died or not :(
			record.dead = isKing; // but we do know that the king is dead
			if (isKing) {
				let nationality;
				/** @type {FC.Race} */
				let race = "white";
				let relative;
				// give the king an actual name
				// first, try and find relatives in your slaves
				if (getSlaves().some(s => s.father === record.ID)) { // adult children fathered by the King
					relative = getSlaves().find(s => s.father === record.ID).value;
				} else if (getSlaves().some(s => s.pregSource === record.ID)) { // queens still carrying the King's child
					relative = getSlaves().find(s => s.pregSource === record.ID).value;
				} else if (getTankSlaves().some(s => s.father === record.ID)) { // incubator occupants fathered by the King
					relative = getTankSlaves().find(s => s.father === record.ID).value;
				}
				// if any are found, use their nationality, race, and birthSurname
				// unfortunately, while nursery children can be found, they currently lose all the data we need
				if (!!relative) {
					nationality = relative.nationality; // incubator slaves set this to Stateless, which we'll try to handle below
					race = relative.race;
					record.slaveSurname = relative.birthSurname;
					if (nationality === "Stateless") { // if all that's left is an incubator slave, pick a random nationality appropriate to their race
						if (race === "asian") {
							nationality = jsEither(["Japanese", "Cambodian", "Bhutanese", "Thai"]);
						} else if (race === "white") {
							nationality = jsEither(["Luxembourgian", "Belgian", "Danish", "Dutch", "Swedish", "Norwegian", "British", "Monégasque"]);
						} else if (race === "southern european") {
							nationality = "Spanish";
						} else if (race === "middle eastern") {
							nationality = jsEither(["Moroccan", "Omani", "Jordanian", "Bahraini", "Kuwaiti", "Qatari", "Saudi"]);
						} else if (race === "malay") {
							nationality = jsEither(["Bruneian", "Malaysian"]);
						} else if (race === "indo-aryan") {
							nationality = "Emirati";
						} else if (race === "pacific islander") {
							nationality = "Tongan";
						} else if (race === "black") {
							nationality = jsEither(["Swazi, Mosotho"]);
						}
						// this is clumsy, and still defaults to white American names for races unused by realRoyalties, i.e. semitic, amerindian, latina, and mixed
						// could we reverse-engineer nationality from surname instead?
					}
				} else {
					// if no immediate family are found at all, we can default to the realRoyalties method
					// the record is unlikely to be needed in that case, though, so could this be replaced with "a late king" or just "King"?
					nationality = App.Data.misc.royalNationalities.random();
					switch (nationality) {
						case "Japanese":
						case "Cambodian":
						case "Bhutanese":
						case "Thai":
							race = "asian";
							break;
						case "Luxembourgian":
						case "Belgian":
						case "Danish":
						case "Dutch":
						case "Swedish":
						case "Norwegian":
						case "British":
						case "Monégasque":
							race = "white";
							break;
						case "Spanish":
							race = "southern european";
							break;
						case "Moroccan":
						case "Omani":
						case "Jordanian":
						case "Bahraini":
						case "Kuwaiti":
						case "Qatari":
						case "Saudi":
							race = "middle eastern";
							break;
						case "Bruneian":
						case "Malaysian":
							race = "malay";
							break;
						case "Emirati":
							race = "indo-aryan";
							break;
						case "Tongan":
							race = "pacific islander";
							break;
						case "Swazi":
						case "Mosotho":
							race = "black";
							break;
					}
					if (nationality === "Japanese") {
						record.slaveSurname = "Yamato";
					} else if (nationality === "Luxembourgian") {
						record.slaveSurname = "Luxembourg-Nassau";
					} else if (nationality === "Belgian") {
						record.slaveSurname = "Saxe-Coburg and Gotha";
					} else if (nationality === "Danish") {
						record.slaveSurname = "Glücksburg";
					} else if (nationality === "Dutch") {
						record.slaveSurname = "Orange-Nassau";
					} else if (nationality === "Swedish") {
						record.slaveSurname = "Bernadotte";
					} else if (nationality === "Spanish") {
						record.slaveSurname = "Bourbon";
					} else if (nationality === "Norwegian") {
						record.slaveSurname = "Glücksburg";
					} else if (nationality === "Cambodian") {
						record.slaveSurname = "Norodom";
					} else if (nationality === "Moroccan") {
						record.slaveSurname = "Alawi";
					} else if (nationality === "Omani") {
						record.slaveSurname = "Al Said";
					} else if (nationality === "Jordanian") {
						record.slaveSurname = "Hāshim";
					} else if (nationality === "Bruneian") {
						record.slaveSurname = "Bolkiah";
					} else if (nationality === "Emirati") {
						record.slaveSurname = "Al Nahyan";
					} else if (nationality === "Bahraini") {
						record.slaveSurname = "Al Khalifah";
					} else if (nationality === "Kuwaiti") {
						record.slaveSurname = "Al Sabah";
					} else if (nationality === "Malaysian") {
						record.slaveSurname = "Pahang";
					} else if (nationality === "Qatari") {
						record.slaveSurname = "Al Thani";
					} else if (nationality === "Saudi") {
						record.slaveSurname = "Al Saud";
					} else if (nationality === "Tongan") {
						record.slaveSurname = "Tupou";
					} else if (nationality === "Swazi") {
						record.slaveSurname = "Dlamini";
					} else if (nationality === "Mosotho") {
						record.slaveSurname = "Moshesh";
					} else if (nationality === "British") {
						record.slaveSurname = "Windsor";
					} else if (nationality === "Monégasque") {
						record.slaveSurname = "Grimaldi";
					} else if (nationality === "Bhutanese") {
						record.slaveSurname = "Wangchuck";
					} else if (nationality === "Thai") {
						record.slaveSurname = "Chakri";
					}
				}
				record.slaveName = generateName(nationality, race, true);
				const pair = record.slaveSurname ? [record.slaveName, record.slaveSurname] : [record.slaveName];
				if ((V.surnameOrder !== 1 && ["Cambodian", "Chinese", "Ancient Chinese Revivalist", "Hungarian", "Japanese", "Edo Revivalist", "Korean", "Mongolian", "Taiwanese", "Vietnamese"].includes(nationality)) || (V.surnameOrder === 2)) {
					pair.reverse();
				}
				record.fullName = "King " + pair.join(" ");
			}
			V.missingTable[ID] = record;
		}
	},
});
