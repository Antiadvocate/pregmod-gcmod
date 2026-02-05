/** Render a link that toggles the slave's favorite status
 * @param {FC.SlaveState} slave
 * @param {function():void} [handler]
 * @returns {HTMLAnchorElement}
 */
App.UI.favoriteToggle = function(slave, handler) {
	/**
	 * @returns {HTMLAnchorElement}
	 */
	function favLink() {
		const linkID = `fav-link-${slave.ID}`;
		if (V.favorites.includes(slave.ID)) {
			 const link = App.UI.DOM.link("★", () => {
				V.favorites.deleteAll(slave.ID);
				$(`#${linkID}`).replaceWith(favLink());

				if (handler) {
					handler();
				}
			});
			link.classList.add("unicode-icons", "favorite");
			link.id = linkID;
			return link;
		} else {
			const link = App.UI.DOM.link("☆", () => {
				V.favorites.push(slave.ID);
				$(`#${linkID}`).replaceWith(favLink());

				if (handler) {
					handler();
				}
			});
			link.classList.add("unicode-icons", "not-favorite");
			link.id = linkID;
			return link;
		}
	}

	return favLink();
};
