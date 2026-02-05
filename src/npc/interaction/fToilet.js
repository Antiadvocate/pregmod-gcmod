/**
 *
 * @param {App.Entity.SlaveState} slave
 * @returns {DocumentFragment}
 */
App.Interact.fToilet = function(slave) {
	const node = new DocumentFragment();
	let r = [];

	const {
		He, His,
		he, his, him, himself, girl
	} = getPronouns(slave);

    const dick = V.PC.dick !== 0 ? "dick" : "pussy";
    const pants = V.PC.dick !== 0 ? "slacks" : "skirt";

    r.push(`You call ${him} over so you can relieve yourself on ${him}.`);

    if (slave.lipsTat === "degradation") {
        r.push(`${His} facial tattoos label ${him} as being a good enough toilet after all.`);
    }

    if (slave.fetish === Fetish.MINDBROKEN) {
        r.push(`${He} obeys robotically, sitting down in front of you and opening ${his} mouth obediently.`);
        r.push(`${He} barely registers as you pull down your ${pants} and take aim at his ${his} face.`);
        r.push(`With a satisfied groan, you begin to empty your bladder, the yellow stream arching from your ${dick} into ${slave.slaveName}'s waiting mouth.`);
        r.push(`Disappointingly though, ${his} condition prevents ${him} from doing much in response, so a majority of your piss falls out of ${his} mouth and down onto ${his} chest.`);
        r.push(`You order your personal assistant to send another slave over to clean up the mess around ${him} as ${he} can't do it ${himself}, before leaving `);
    }
    else {
        if (slave.devotion <= -20) {
            r.push(`${He} resists upon hearing your commands, but you eventually force ${him} onto ${his} knees, before removing your ${pants}.`);
            r.push(`In one last act of defiance, ${he} refuses to open ${his} mouth for you, which just results in more of a mess as your stream of piss lands squarely on ${his} face.`);
            r.push(`Eventually, your bladder is fully emptied, and a drenched slave stands before you, dripping with rage, humiliation and a large volume of urine.`);
        }
        else if (slave.devotion <= 20) {
            r.push(`Reluctantly, though without resistance, ${he} kneels down before you and opens ${his} mouth in preparation.`);
            r.push(`As you remove your ${pants} and take aim at ${his} mouth,`);
            if (slave.fetish === Fetish.HUMILIATION) {
                r.push(`you notice that ${he} seems far more aroused than most would be in this situation, seemingly getting off on the humiliation of being reduced to your toilet.`);
            }
            else {
                r.push(`${he} still seems to not be aroused by the prospect of being showered in your piss, though ${he} isn't offering any resistance.`);
            }
            r.push(`As you begin to empty your bladder, ${he} keeps ${his} mouth open obediently, though ${he} makes little effort to prevent your piss from falling out of it and onto ${his} chest.`);
        }
        else {
            r.push(`${He} obediently kneels down in front of you and opens ${his} mouth to accept your piss.`);
            r.push(`After a moment to remove your ${pants}, you line up and shower ${him} in your urine.`);
            r.push(`Obediently, ${he} not only allows it to land in ${his} mouth but also drinks as much of it as ${he} can, though some still ends up across ${his} chest and face.`);
            r.push(`Once your bladder seems to be emptied, ${he} moves forward and begins to`);
            if (V.PC.dick !== 0) {
                r.push(`suck your dick, cleaning it up for several minutes before you cum down ${his} throat.`);
            }
            else {
                r.push(`lick your pussy enthusiastically, cleaning up the last drops of piss on it before you shower ${him} in girlcum.`);
            }
        }
    }

	if (canMove(slave) && slave.fetish !== Fetish.MINDBROKEN && V.postSexCleanUp > 0) {
		switch (slave.assignment) {
			case "whore":
				r.push(`${He} heads to the bathroom to clean up before returning to selling ${his} body publicly.`);
				break;
			case "serve the public":
				r.push(`${He} heads to the bathroom to clean up before returning to allowing the public to use ${his} body.`);
				break;
			case "rest":
				r.push(`${He} heads to the bathroom to clean up before crawling back into bed.`);
				break;
			case "get milked":
				r.push(`${He} hurries to the bathroom to clean up`);
				if (slave.lactation > 0) {
					r.push(`before going to get ${his} uncomfortably milk-filled tits drained.`);
				} else {
                    r.push(`before returning to the ${V.dairyName}.`);
                }
				break;
			case "please you":
				r.push(`${He} hurries to the bathroom to clean up before returning to await your next use of ${his} body, as though nothing had happened.`);
				break;
			case "be a subordinate slave":
				r.push(`${He} moves to the bathroom to clean up, though it's only a matter of time before another slave decides to take their turn with ${him}.`);
				break;
        	case "be a servant":
				r.push(`${He} hurries to the bathroom to clean up, since ${his} chores didn't perform themselves while you used ${him}.`);
				break;
			case "be your Head Girl":
				r.push(`${He} hurries to the bathroom to clean up, worried that ${his} charges got up to trouble while you were using ${him}.`);
				break;
			case "guard you":
				r.push(`${He} hurries off to wash up so you'll be unguarded for as little time as possible.`);
				break;
			case "work in the brothel":
				r.push(`${He} goes to wash up so ${his} next customer has no idea what ${he}'s been up to.`);
				break;
			case "serve in the club":
                r.push(`${He} goes to wash up to make ${himself} presentable to the next customer.`);
				break;
			case "work in the dairy":
				r.push(`${He} goes off to carefully wash up to avoid besmirching the nice clean dairy.`);
				break;
			case "work as a farmhand":
				r.push(`${He} goes off to wash up to avoid tainting the food in ${V.farmyardName}.`);
				break;
			case "work as a servant":
				r.push(`${He} rushes to wash up, impatient to get back to ${his} undiminished chores.`);
				break;
			case "work as a nanny":
				r.push(`${He} hurries off to wash up before heading back to the ${V.nurseryName}.`);
		}
	}
    
    r.join(' ');
	App.Events.addParagraph(node, r);
	return node;

}