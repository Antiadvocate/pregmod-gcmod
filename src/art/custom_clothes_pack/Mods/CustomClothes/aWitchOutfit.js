/* Self-contained clothing item definition (custom override)
 * Key: "a witch outfit"
 */

App.Data.clothes.set("a witch outfit", {
	name: "Witch outfit",
	exposure: 1,
	desc: {
		summary: function(slave) {
			const r = [];
			const {He, his} = getPronouns(slave);
			const bothFeet = hasBothLegs(slave);
			r.push("a playful witch outfit with a pointed hat and a short dress");
			if (isAmputee(slave)) {
				r.push(`custom-fitted to ${his} body.`);
			}
			if (!hasAnyLegs(slave)) {
				return r.join(" ");
			}
			r.push(`${He} wears`);
			switch (slave.shoes) {
				case "boots":
					r.push(bothFeet ? "knee-high boots." : "a knee-high boot.");
					break;
				case "heels":
				case "pumps":
					r.push(bothFeet ? "tall heels." : "a tall heel.");
					break;
				default:
					r.push("no footwear.");
			}
			return r.join(" ");
		},
		boobs: function() {
			return "The bodice is snug and theatrical.";
		},
		butt: function() {
			return "The short skirt swishes mischievously.";
		},
		crotch: function() {
			return "The costume stays just this side of proper.";
		},
	}
});
