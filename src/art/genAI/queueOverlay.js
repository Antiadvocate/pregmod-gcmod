App.Art.GenAI.UI.QueueOverlay = function() {
	// Internal State
	let toggleVisible = true;
	let generating = false;

	// Setup containers
	const container = document.createElement("div");
	container.classList.add("ai-queue-overlay");
	document.body.append(container);

	const mainQueueSpan = document.createElement("span");
	const backlogSpan = document.createElement("span");


	// Export functionality
	return {init: init, toggle: toggle};

	function init() {
		// Setup content
		const spinnerSpan = document.createElement("span");
		spinnerSpan.classList.add("spinner");
		container.append(spinnerSpan);

		container.append("(Queue: ", mainQueueSpan, " / Backlog: ", backlogSpan, ") ");

		const button = document.createElement("button");
		button.append("\uf410");
		button.onclick = () => App.Art.GenAI.sdQueue.interrupt();
		container.append(button);

		// Callback
		App.Art.GenAI.sdQueue.registerStatusChangeCallback(queueChangeCallback);
	}

	/**
	 * @param {ArtQueueState} status
	 */
	function queueChangeCallback(status) {
		mainQueueSpan.textContent = String(status.mainQueueCount);
		backlogSpan.textContent = String(status.backlogCount);
		generating = status.active;
		updateVisible();
	}

	/**
	 * @param {boolean} visible
	 */
	function toggle(visible) {
		toggleVisible = visible;
		updateVisible();
	}

	function updateVisible() {
		const visible = V.aiQueueOverlay === 1 && toggleVisible && generating;
		if (visible) {
			container.classList.remove("hidden");
		} else {
			container.classList.add("hidden");
		}
	}
}();
