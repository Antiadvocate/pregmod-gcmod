/* Self-contained clothing item definition (custom override)
 * Key: "a slip dress"
 */

App.Data.clothes.set("a slip dress", {
	name: "Slip dress",
	exposure: 1,
	desc: {
		summary: function(slave) {
			const r = [];
			const {He, his} = getPronouns(slave);
			r.push("a silky slip dress with thin straps");
			if (isAmputee(slave)) {
				r.push(`that drapes elegantly across ${his} body.`);
			}
			return r.join(" ");
		},
		boobs: function() {
			return "The fabric skims their chest softly.";
		},
		butt: function() {
			return "The slip clings lightly as they move.";
		},
		crotch: function() {
			return "The hem is short, but not indecent.";
		},
	}
});
