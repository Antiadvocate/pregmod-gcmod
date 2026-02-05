/* Self-contained clothing item definition (custom override)
 * Key: "yoga set"
 */

App.Data.clothes.set("yoga set", {
	name: "Yoga set",
	exposure: 0,
	desc: {
		summary: function(slave) {
			const r = [];
			const {He, his} = getPronouns(slave);
			r.push("a sporty yoga set: a fitted top and high-waisted leggings");
			if (isAmputee(slave)) {
				r.push(`tailored for ${his} mobility.`);
			}
			return r.join(" ");
		},
		boobs: function() {
			return "The top is supportive and practical.";
		},
		butt: function() {
			return "The leggings flex comfortably with every stretch.";
		},
		crotch: function() {
			return "Everything is covered for training.";
		},
	}
});
