App.Desc.Player.face = function(PC = V.PC) {
	const r = [];
	let hairLength = '';

	const heightVhLength = PC.hLength / PC.height;
	if (heightVhLength > 0.9) {
		hairLength = `floor-length`;
	} else if (heightVhLength > 0.8) {
		hairLength = `calf-length`;
	} else if (heightVhLength > 0.7) {
		hairLength = `knee-length`;
	} else if (heightVhLength >= 0.6) {
		hairLength = `thigh-length`;
	} else if (heightVhLength >= 0.4) {
		hairLength = `ass-length`;
	} else if (heightVhLength >= 0.2) {
		hairLength = `long`;
	} else if (PC.hLength >= 15) {
		hairLength = `shoulder-length`;
	} else {
		hairLength = `short`;
	}

	if (PC.hStyle.includes("bald") || PC.bald === 1) {
		r.push(`no hair`);
	} else {
		r.push(`${hairLength} ${PC.hColor} hair${PC.hEffect === "none" ? `` : ` with ${PC.hEffect}`},`);
	}
	// hStyle here?
	r.push(`${App.Desc.eyesColor(PC)}, and`);
	switch (PC.faceShape) {
		case "masculine":
			if (PC.face < -95) {
				r.push(`a hideously ugly, but still containing a hint of masculinity, face.`);
			} else if (PC.face < -40) {
				r.push(`an ugly, yet masculine, face.`);
			} else if (PC.face < -10) {
				r.push(`an unattractive, but still masculine face.`);
			} else if (PC.face <= 10) {
				r.push(`an average masculine face.`);
			} else if (PC.face <= 40) {
				r.push(`an attractive masculine face.`);
			} else if (PC.face <= 95) {
				r.push(`a very handsome face.`);
			} else {
				r.push(`a face nothing short of the pinnacle of masculine handsomeness.`);
			}
			break;
		case "androgynous":
			if (PC.face < -95) {
				r.push(`a disturbingly androgynous face that others struggle to look at.`);
			} else if (PC.face < -40) {
				r.push(`an ugly and androgynous face that pleases no one.`);
			} else if (PC.face < -10) {
				r.push(`a strangely androgynous, and rather unattractive, face.`);
			} else if (PC.face <= 10) {
				r.push(`a strangely androgynous face.`);
			} else if (PC.face <= 40) {
				r.push(`an androgynous, yet attractive, face.`);
			} else if (PC.face <= 95) {
				r.push(`a lovely androgynous face with subtle intricacies that capture the eye.`);
			} else {
				r.push(`a face so gorgeously androgynous that you induce sexual confusion in those that look upon you.`);
			}
			break;
		case "cute":
			if (PC.face < -95) {
				r.push(`a very ugly, yet somehow cute face.`);
			} else if (PC.face < -40) {
				r.push(`ugly, but cute, face.`);
			} else if (PC.face < -10) {
				r.push(`an unattractive, yet appealingly cute, face.`);
			} else if (PC.face <= 10) {
				r.push(`an average, but charmingly cute, face.`);
			} else if (PC.face <= 40) {
				r.push(`an attractive and appealingly cute face.`);
			} else if (PC.face <= 95) {
				r.push(`a beautiful, yet disarmingly cute, face.`);
			} else {
				r.push(`an impossibly perfect combination of beauty and cuteness capable of softening anyone's heart.`);
			}
			break;
		case "sensual":
			if (PC.face < -95) {
				r.push(`a very ugly, yet naturally slutty, face.`);
			} else if (PC.face < -40) {
				r.push(`an ugly face that's just lewd enough to not warrant a bag.`);
			} else if (PC.face < -10) {
				r.push(`an unattractive, yet charming, face.`);
			} else if (PC.face <= 10) {
				r.push(`an average, yet sensual, face.`);
			} else if (PC.face <= 40) {
				r.push(`an attractive, sensual face.`);
			} else if (PC.face <= 95) {
				r.push(`a beautiful, sensual face that brings sex to mind.`);
			} else {
				r.push(`a flawless, unbelievably sensual face that`);
				// gender overhaul stuff
				if (PC.title === 1) {
					r.push(`makes women swoon.`);
				} else {
					r.push(`wraps men around your little finger.`);
				}
			}
			break;
		case "exotic":
			if (PC.face < -95) {
				r.push(`a face so hideous and unusual you can't look away.`);
			} else if (PC.face < -40) {
				r.push(`an ugly and unusual face.`);
			} else if (PC.face < -10) {
				r.push(`a distinctively unattractive face.`);
			} else if (PC.face <= 10) {
				r.push(`an average, but interesting, face.`);
			} else if (PC.face <= 40) {
				r.push(`an attractively exotic face that's interesting to look at.`);
			} else if (PC.face <= 95) {
				r.push(`a beautifully exotic face that catches the eye and keeps its gaze.`);
			} else {
				r.push(`a perfect, exotically shaped face that robs anyone that gazes upon it of their ability to look away.`);
			}
			break;
		default:
			if (PC.face < -95) {
				r.push(`a very ugly face.`);
			} else if (PC.face < -40) {
				r.push(`a rather ugly face.`);
			} else if (PC.face < -10) {
				r.push(`an unattractive face.`);
			} else if (PC.face <= 10) {
				r.push(`a rather average face.`);
			} else if (PC.face <= 40) {
				r.push(`a somewhat attractive face.`);
			} else if (PC.face <= 95) {
				r.push(`a quite beautiful face.`);
			} else {
				r.push(`a perfect face.`);
			}
	}
	if (PC.weight > 190) {
		r.push(`It's really quite fat and has ample excess chins piling up beneath it.`);
	} else if (PC.weight > 160) {
		r.push(`It's rather plump, and you're developing another extra chin beneath the first one.`);
	} else if (PC.weight > 130) {
		r.push(`It's a little chubby and sporting an obvious second chin.`);
	} else if (PC.weight > 97) {
		r.push(`It's pleasantly soft, though you've the start of a second chin.`);
	}
	if (PC.faceImplant > 5) {
		r.push(`You've`);
		if (PC.faceImplant > 95) {
			r.push(`had so much cosmetic surgery that your face is located at the bottom of the uncanny`);
			if (PC.face < -10) {
				r.push(`valley in addition to its ugliness.`);
			} else if (PC.face <= 10) {
				r.push(`valley; the only thing really distinctive about it.`);
			} else {
				r.push(`valley, its attractiveness notwithstanding.`);
			}
		} else if (PC.faceImplant > 60) {
			r.push(`obviously gotten a lot of facial cosmetic surgery.`);
		} else if (PC.faceImplant > 30) {
			r.push(`noticeably received facial cosmetic surgery.`);
		} else {
			r.push(`had some facial cosmetic surgery, though it's subtle.`);
		}
	}

	if (PC.horn !== "none") {
		if (PC.horn === "curved succubus horns") {
			r.push(`A pair of majestic ${PC.hornColor} horns jut from the back of your skull and curve around its sides to your face. More than once have you heard them described as "handlebars".`);
		} else if (PC.horn === "backswept horns") {
			r.push(`A pair of powerful ${PC.hornColor} horns jut from the front of your skull, arcing backwards.`);
		} else if (PC.horn === "cow horns") {
			r.push(`A pair of ${PC.hornColor} ${App.Utils.translate("cow")} horns extend from the sides of your head before curving sharply upward.`);
			if (PC.boobs >= 800) {
				r.push(`More than once have you caught them being described as appropriate for your figure.`);
			}
		} else if (PC.horn === "two long oni horns") {
			r.push(`Two long ${PC.hornColor} horns stick straight up out of your forehead.`);
		} else if (PC.horn === "one long oni horn") {
			r.push(`A single long ${PC.hornColor} horn sticks straight up out of the middle of your forehead.`);
		} else if (PC.horn === "small horns") {
			r.push(`A pair of cute little ${PC.hornColor} horns stick out of your head.`);
		}
	}

	if (PC.earShape === "none") {
		if (PC.earT === "none") {
			r.push(`You lack ears, instead having a pair of small, perforated metal disks where they should be.`);
		}
	} else if (PC.earShape === "holes") {
		r.push(`Your ears are missing, leaving a pair of holes plugged with small, perforated metal disks.`);
	} else if (PC.earShape === "damaged") {
		r.push(`Your ears have been severely damaged and have a torn, tattered appearance.`);
	} else if (PC.earShape === "normal" && PC.earT !== "none") {
		// Ears are expected, so lets only mention them if we have two sets
		r.push(`You have normal ears; odd, given what's above them.`);
	} else if (PC.earShape === "robot") {
		r.push(`You have headphone-like high tech cyber-ears.`);// not yet implemented
	} else if (PC.earShape === "pointy") {
		r.push(`You have cute little ${either("elfin", "pointed")} ears.`);
	} else if (PC.earShape === "elven") {
		r.push(`You have long, thin elven ears whose subtle motions tend to give away a little too much about what's on your mind. They're quite sensitive to the touch.`);
	} else if (PC.earShape === "orcish") {
		r.push(`You have small, pointed orcish ears.`);
	} else if (PC.earShape === "cow") {
		r.push(`You have a pair of long, floppy ${App.Utils.translate("cow")} ears. They're so sensitive that it's almost erogenous to have them touched.`);
	} else if (PC.earShape === "sheep") {
		r.push(`You have a pair of cupped ${PC.hColor} wooly sheep ears. They're cute and very fluffy.`);
	} else if (PC.earShape === "gazelle") {
		r.push(`You have a pair of slender, cupped gazelle ears that twitch at the slightest sound.`);
	} else if (PC.earShape === "deer") {
		r.push(`You have slender, cupped dear ears that twitch at the slightest sound.`);
	} else if (PC.earShape === "bird") {
		r.push(`You have small tufts of ${PC.hColor} colored feathers sticking out from behind your ears. The feathers flatten and ruffle depending on your mood.`);
	} else if (PC.earShape === "dragon") {
		r.push(`You have elongated draconic ears coated in small ${PC.hColor} scales.`);
	}
	if (PC.hears === -1 || PC.earShape === "none" || PC.earShape === "holes") {
		r.push(`You wear a hidden hearing aid to help mitigate your poor hearing.`);
	}

	if (!PC.lips.isBetween(10, 21) || PC.lipsImplant > 0) {
		r.push(`You have`);
		if (PC.lips <= 10) {
			r.push(`thin, unattractive lips.`);
		} else if (PC.lips <= 20) {
			r.push(`normal lips.`);
		} else if (PC.lips <= 40) {
			r.push(`full lips.`);
		} else if (PC.lips <= 70) {
			r.push(`plump, beestung lips.`);
		} else if (PC.lips <= 95) {
			r.push(`huge, clearly unnatural lips.`);
		} else {
			r.push(`a facepussy: your lips are so huge that you can't completely close them.`);
		}
	}
	if (V.showImplantEffects === 1) {
		if (FutureSocieties.isActive('FSTransformationFetishist')) {
			if (PC.lipsImplant > 0) {
				r.push(`They are about ${Math.floor((PC.lipsImplant / PC.lips) * 100)}% implant.`);
			}
		}
	}
	if (PC.teeth !== "normal") {
		if (PC.teeth === "crooked") {
			r.push(`You have crooked teeth and should really consider seeing an orthodontist.`);
		} else if (PC.teeth === "straightening braces" || PC.teeth === "cosmetic braces") {
			r.push(`You have braces, and now that you are looking at them, can't keep running your tongue across them.`);
		} else if (PC.teeth === "gapped") {
			r.push(`You have a prominent gap between your front teeth that affects your speech.`);
		} else if (PC.teeth === "removable") {
			r.push(`You have high-quality dentures instead of teeth.`);
		} else if (PC.teeth === "pointy") {
			r.push(`Your teeth have been replaced with realistic implants that mimic the dentition of a carnivore.`);
		} else if (PC.teeth === "fangs") {
			r.push(`Your upper canine teeth have been replaced with realistic implants that mimic fangs.`);
		} else if (PC.teeth === "fang") {
			r.push(`One of your upper canine teeth has been replaced with realistic implant shaped like a fang.`);
		} else if (PC.teeth === "baby") {
			r.push(`You still have your baby teeth.`);
		} else if (PC.teeth === "mixed") {
			r.push(`One of your teeth is loose and going to fall out soon.`);
		}
	}
	if (PC.markings === "beauty mark") {
		r.push(`A pretty distinct beauty mark gives your face some memorability.`);
	}
	if (anyVisionEquals(PC, 1) && PC.eyewear === "corrective glasses") {
		r.push(`You've chosen to forego contact lenses and instead use a pair of stylish glasses to correct your poor vision.`);
	}
	if (PC.smells === -1) {
		r.push(`It's not obvious, but you no longer have a sense of smell${PC.tastes === -1 ? " or taste" : ""}.`);
	} else if (PC.tastes === -1) {
		r.push(`It's not obvious, but you no longer have a sense of taste.`);
	}

	return r.join(" ");
};
