App.Patch.register({
	releaseID: 1279,
	descriptionOfChanges: "Adds experimental AI chat.",
	pre: (div) => {
		V.aiChat= 0;
		V.aiChatUrl= "http://localhost:5000/v1/chat/completions";
		V.aiChatTemp= 0.5;
		V.aiChatMinP= 0.05;
	},
});
