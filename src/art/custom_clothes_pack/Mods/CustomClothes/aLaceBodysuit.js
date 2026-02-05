/* Self-contained clothing item definition (custom override)
 * Key: "a lace bodysuit"
 */

App.Data.clothes.set("a lace bodysuit", {
	name: "Lace bodysuit",
	exposure: 2,
	desc: {
		summary: function(slave) {
			const r = [];
			const {He, his} = getPronouns(slave);
			r.push("a sheer lace bodysuit that hugs every curve");
			if (isAmputee(slave)) {
				r.push(`tailored to ${his} figure with careful seams.`);
			}
			return r.join(" ");
		},
		boobs: function() {
			return "The lace leaves little to the imagination.";
		},
		butt: function() {
			return "The fabric clings tightly at the hips.";
		},
		crotch: function() {
			return "The bodysuit is daring, but still technically covers them.";
		},
	}
});
