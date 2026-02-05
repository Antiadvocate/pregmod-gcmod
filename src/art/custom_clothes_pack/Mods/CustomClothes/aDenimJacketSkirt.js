/* Self-contained clothing item definition (custom override)
 * Key: "a denim jacket and skirt"
 */

App.Data.clothes.set("a denim jacket and skirt", {
	name: "Denim jacket and skirt",
	exposure: 1,
	desc: {
		summary: function(slave) {
			const r = [];
			const {He, his} = getPronouns(slave);
			const bothFeet = hasBothLegs(slave);
			r.push("a fitted denim jacket over a simple top and a short skirt");
			if (isAmputee(slave)) {
				r.push(`tailored neatly to ${his} body.`);
			}
			if (!hasAnyLegs(slave)) {
				return r.join(" ");
			}
			r.push(`${He} pairs it with`);
			switch (slave.shoes) {
				case "boots":
					r.push(bothFeet ? "casual boots." : "a casual boot.");
					break;
				case "flats":
					r.push(bothFeet ? "comfortable flats." : "a comfortable flat.");
					break;
				case "heels":
				case "pumps":
					r.push(bothFeet ? "a pair of understated heels." : "an understated heel.");
					break;
				default:
					r.push("no shoes at all.");
			}
			return r.join(" ");
		},
		boobs: function() {
			return "The jacket draws the eye to their upper body.";
		},
		butt: function() {
			return "The skirt sits snugly at the hips.";
		},
		crotch: function() {
			return "The outfit stays decent despite being a bit short.";
		},
	}
});
