/* Self-contained clothing item definition (custom override)
 * Key: "a blazer and pencil skirt"
 */

App.Data.clothes.set("a blazer and pencil skirt", {
	name: "Blazer and pencil skirt",
	exposure: 0,
	desc: {
		summary: function(slave) {
			const r = [];
			const {He, his} = getPronouns(slave);
			const bothFeet = hasBothLegs(slave);
			r.push("a crisply tailored blazer over a blouse and a pencil skirt");
			if (isAmputee(slave)) {
				r.push(`cut to fit ${his} silhouette cleanly.`);
			}
			if (!hasAnyLegs(slave)) {
				return r.join(" ");
			}
			r.push(`${He} completes the professional look with`);
			switch (slave.shoes) {
				case "pumps":
				case "heels":
				case "platform heels":
					r.push(bothFeet ? "smart pumps." : "a smart pump.");
					break;
				case "flats":
					r.push(bothFeet ? "comfortable flats." : "a comfortable flat.");
					break;
				default:
					r.push("no shoes.");
			}
			return r.join(" ");
		},
		boobs: function() {
			return "The blouse sits neatly beneath the blazer.";
		},
		butt: function() {
			return "The pencil skirt keeps their lines sleek.";
		},
		crotch: function() {
			return "Everything stays strictly business.";
		},
	}
});
