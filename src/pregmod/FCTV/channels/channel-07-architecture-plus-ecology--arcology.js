/**
 * @file channel-07-architecture-plus-ecology--arcology.js - FCTV Channel 7: "Architecture + Ecology = Arcology"
 */

App.Data.FCTV.channels.set(7, {
	tags: {},
	loop: true,
	get intro() {
		const r = [];
		r.push(`which is currently showing an educational program on arcologies titled: "Architecture + Ecology = Arcology".`);
		if (V.PC.skill.engineering > 50) {
			r.push(`The information is likely to be far too simplistic, considering your knowledge of engineering, but you watch anyway to see how most of your citizens view the massive structures.`);
		} else {
			r.push(`Your practical experience means that this program is unlikely to tell you anything you don't already know, but you watch anyway to see how an average citizen views an arcology.`);
		}
		r.push(`<p>A likely-artificial voice of an older man narrates while the program displays video to demonstrate the topic being narrated. The show looks crisp and professional, but you can tell it doesn't have the budget that the more sexually-charged shows do.</p>`);
		return r.join(" ");
	},
	episode: [
		{
			get text() {
				const r = [];
				r.push(`<p>This episode seems to be focusing on some basics in addition to an arcology's Penthouse.</p>`);
				r.push(`<p>A standard arcology is so huge that it needs to be divided into levels and sectors to make talking about it easier. Levels are the horizontal rows. An arcology is a very large building, and each Level includes many floors. Sectors are slices of those levels. For example, on Levels with four Sectors, each sector includes a quarter of each floor that's part of that Level. Each Sector is typically occupied by facilities, tenants, or both. Sometimes facilities are owned or leased by tenants! Now when your friend tells you to meet them at "promenade B" or mentions that they live in sector "7C", you'll know how those names came about.</p>`);
				r.push(`<p>In most arcologies with a single owner, the uppermost Level is called the Penthouse. It's an entire sector where the owner and slaves under his direct supervision live. With such a large space for a single person or family, there is a great deal of customization possible. Even two arcologies of the same design, built at the same time, are likely to have very different penthouses! It's always worth visiting a penthouse if you get the chance. Not all arcologies are built or owned by a single person, often there is a group or partnership of owners. After all, building a structure as massive as an arcology is an extremely expensive endeavor! In these cases, the term penthouse is typically still used to refer to the top sector, as it is often divided into a number of luxurious penthouse apartments for the owners.</p>`);
				return r.join(" ");
			}
		},
		{
			get text() {
				const r = [];
				r.push(`<p>This episode seems to be focusing on the Promenade and residential areas.</p>`);
				r.push(`<p>Below the penthouse — and potentially some residential sectors — is the Promenade, which is a major social area and hosts most of the businesses which cater to the arcology's citizens. Promenade Sectors are occupied by shops, restaurants, and other amusements. A promenade is critical to the success of an arcology; it allows the arcology to function as a self-contained residence, and is important to the economy. Sometimes it's nice to head over to a different arcology in your Free City for some unique cuisine or shopping, but could you imagine having to go through all that trouble any time you wanted to shop or eat out? While the concept of a promenade is almost universal amongst arcologies, the design, layout, and decoration of each tends to be rather unique, making it a fun experience to visit the promenade of arcologies other than your own.</p>`);
				r.push(`<p>The next area common to all arcologies are the residential sectors filled with apartments and other living arrangements. While designs and layouts differ — some arcologies have luxury residential areas that resemble an old-fashioned neighborhood complete with artificial sky — the purpose is always to house arcology citizens. Residential areas are critical for an arcology, in order to have a functioning self-contained economy. While all citizens in an arcology are fortunate, some are more fortunate than others. Lower-class citizens commonly live in dense efficiency apartments, while wealthy citizens often live in opulent sectors with large apartments. Without citizens there would be nobody to own or operate the stores, restaurants, and other attractions in the arcology, and there would be nobody to purchase those goods or services either!</p>`);
				return r.join(" ");
			}
		},
		{
			get text() {
				const r = [];
				r.push(`<p>This episode seems to be focusing on the lower levels, the Concourse and Service Level.</p>`);
				r.push(`<p>Another common level for an arcology is the Concourse, which is typically located near the bottom of the structure. Like the Promenade, it hosts businesses, but these focus less on the luxury and entertainment needs of citizens than the Promenade. The Concourse typically houses bulk trade, necessary services such as medical clinics, corporate offices, research and development centers, and even education facilities. The best universities in the world are located on the concourse level of an arcology! Of course, the concourse also houses slave markets and slave training facilities. Some arcologies have arenas for sports or other events, while others have venues for sport combat ranging from traditional octagon fighting rings to pits reminiscent of ancient gladiatorial combat. If you're lucky, your arcology may just have a public arcade, where a variety of needs can be met at an affordable price. With research pointing to the benefits of arcades to adolescent development, family-friendly arcologies are quickly adding arcades of their own!</p>`);
				r.push(`<p>The lowest and largest level is typically known as the Service level. Its Sectors are occupied by manufacturing and industry, including the production of food resources such as livestock facilities and dairies. Menial slaves are housed in the Service level, and often work there too. The service level also contains much of an arcology's infrastructure, supplying clean water and electricity to the citizens and businesses. Another common sight in the service level is that of a warehouse, which stores the goods and raw materials an arcology needs, and also facilitates trade with other arcologies. Finally, the Service level may contain barracks and training facilities for mercenaries or arcology militia tasked to protect it from the old world.</p>`);
				return r.join(" ");
			}
		},
	]
});
