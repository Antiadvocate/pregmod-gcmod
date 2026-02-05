/**
 * @param {FC.InfantState} infant
 * @returns {DocumentFragment}
 */
App.UI.ChildInteract.mainPage = function(infant) {
	const el = new DocumentFragment();

	App.Utils.scheduleSidebarRefresh();

	el.append(App.UI.ChildInteract.navigation(infant));

	/**
	 * @typedef {object} siCategory
	 * @property {string} title
	 * @property {string} id
	 * @property {DocumentFragment|HTMLElement} node
	 */

	/** @type {Array<siCategory>} */
	const tabs = [
		{
			title: "Description",
			id: "description",
			get node() { return App.UI.ChildInteract.description(infant); }
		},
		{
			title: "Customize",
			id: "customize",
			get node() { return App.UI.SlaveInteract.custom(infant, refresh); }
		},
		{
			title: "Family",
			id: "family-tab",
			get node() { return App.UI.SlaveInteract.family(infant); }
		}
	];

	const contentHolder = document.createElement("span");
	contentHolder.append(content());
	el.append(contentHolder);

	return el;

	function content() {
		if (V.slaveInteractLongForm) {
			return displayWithoutTabs();
		} else {
			return displayWithTabs();
		}
	}

	function refresh() {
		jQuery(contentHolder).empty().append(content());
	}

	/**
	 * @returns {DocumentFragment}
	 */
	function displayWithTabs() {
		const tabBar = new App.UI.Tabs.TabBar("ChildInteract");
		const f = new DocumentFragment();
		tabBar.customNode = f;

		for (const tab of tabs) {
			tabBar.addTab(tab.title, tab.id, tab.node);
		}
		return tabBar.render();
	}

	/**
	 * @returns {DocumentFragment}
	 */
	function displayWithoutTabs() {
		const el = new DocumentFragment();
		for (const tab of tabs) {
			App.UI.DOM.appendNewElement("h2", el, tab.title);
			el.append(tab.node);
		}
		return el;
	}
};
