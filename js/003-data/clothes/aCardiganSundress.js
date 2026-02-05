/* Self-contained clothing item definition (custom override)
 * Key: "a cardigan and sundress"
 */

App.Data.clothes.set("a cardigan and sundress", {
	name: "Cardigan and sundress",
	exposure: 0,
	desc: {
		summary: function(slave) {
			const r = [];
			const {He, he, his} = getPronouns(slave);
			const bothFeet = hasBothLegs(slave);
			const feet = bothFeet ? "feet" : "foot";

			r.push("a light cardigan over a breezy sundress");
			if (isAmputee(slave)) {
				r.push(`tailored to accommodate ${his} missing limbs.`);
			}

			// Keep footwear description short to avoid overly verbose text.
			if (!hasAnyLegs(slave)) {
				return r.join(" ");
			}

			r.push(`${He} finishes the look with`);
			switch (slave.shoes) {
				case "flats":
					r.push(bothFeet ? "simple flats." : "a simple flat.");
					break;
				case "boots":
					r.push(bothFeet ? "ankle boots." : "an ankle boot.");
					break;
				case "heels":
				case "pumps":
				case "platform heels":
					r.push(bothFeet ? "a pair of modest heels." : "a modest heel.");
					break;
				default:
					r.push(`nothing on ${his} bare ${feet}.`);
			}

			return r.join(" ");
		},
		boobs: function() {
			return "The cardigan frames their chest tastefully.";
		},
		butt: function() {
			return "The sundress sways with each step.";
		},
		crotch: function() {
			return "The hem keeps things modest.";
		},
	}
});
