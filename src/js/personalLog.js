App.PersonalLog = {
	/**
	 * Opens the Personal Log dialog
	 */
	dialog: function dialog() {
		if (Dialog.isOpen()) {
			Dialog.close();
		}
		Dialog.create("Personal Log", "personal-log-dialog");
		Dialog.append(`<p>You can write your entries using <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" class="link-external">Markdown</a>.</p>`);
		let logEditor = App.UI.DOM.makeElement("textarea", "", ["log-entry-editor"]);
		logEditor.placeholder = "Add a new log entry";
		Dialog.append(logEditor);

		Dialog.append(App.UI.DOM.makeElement("div", App.UI.DOM.link("Save", () => {
			if (logEditor.dataset.index && logEditor.value) {
				V.personalLog[logEditor.dataset.index].log = logEditor.value;
				V.personalLog[logEditor.dataset.index].edited = new Date().toISOString();
			} else if (logEditor.value) {
				V.personalLog.push({
					"timestamp": new Date().toISOString(),
					"edited": null,
					"log": logEditor.value
				});
			}

			// The passage reload will force Twine to save state, if the passage is safe to jump to/from.
			// In unsafe passages (weekend, events, recruitments, slave passages, etc.), there will be a risk
			// to lose modifications if the browser is closed or the page reloads, even if a manual save is made.
			if (getPassagesWithTag("jump-from-safe").map(passage => passage.title).includes(passage()) &&
				getPassagesWithTag("jump-to-safe").map(passage => passage.title).includes(passage())) {
				App.UI.reload();
			}
			dialog();
		}), ["log-entry-save"]));

		let dl = App.UI.DOM.makeElement("dl", null, null);
		for (const [i, log] of V.personalLog.entries()) {
			let dt = App.UI.DOM.makeElement("dt", null, null);
			dt.append(App.UI.DOM.makeElement("span", new Date(Date.parse(log.timestamp)).toLocaleString(), ["log-entry-created"]));
			if (log.edited) {
				dt.append(App.UI.DOM.makeElement("small", `Edited ${new Date(Date.parse(log.edited)).toLocaleString()}`, ["log-entry-edited"]));
			}
			dt.append(App.UI.DOM.generateLinksStrip([
				App.UI.DOM.link("Edit", () => {
					logEditor.value = log.log;
					logEditor.dataset.timestamp = log.timestamp;
					logEditor.dataset.index = i.toString();
				}),
				App.UI.DOM.link("Delete", () => {
					V.personalLog.splice(i, 1);
					dialog();
				})
			]));
			dl.append(dt);
			let dd = App.UI.DOM.makeElement("dd", null, null);
			// @ts-ignore
			dd.innerHTML = marked.parse(log.log);
			dl.append(dd);
		}
		Dialog.append(dl);

		Dialog.open();
	}
};
