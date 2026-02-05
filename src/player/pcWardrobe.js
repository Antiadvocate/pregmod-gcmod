/**
 * UI for the WArdrobe. Refreshes without refreshing the passage.
 * @param {FC.PlayerState} PC
 */
App.UI.playerWardrobe = function(PC) {
	const container = document.createElement("span");
	container.id = "salon";

	container.append(createPage());
	return container;

	/**
	 * creates the page
	 * @returns {DocumentFragment}
	 */
	function createPage() {
	  console.log("test");

	  const el = new DocumentFragment();

	  App.Events.drawEventArt(el, PC);

	  // @ts-ignore
	  let wardrobe = App.UI.SlaveInteract.wardrobe(PC, refresh);

	  el.append(wardrobe);

	  return el;
	}

	function refresh() {
		jQuery(container).empty().append(createPage());
	}
};
