// cspell:ignore Ooobabooga, KBCPP

/**
 * @param {FC.SlaveState} slave
 * @returns {HTMLParagraphElement}
 */
App.UI.SlaveInteract.chat = function(slave) {
	const p = document.createElement("p");
	p.id = "chat-tab";

	// Inject the chatbox inside this tab
	const chatContainer = document.createElement("div");
	chatContainer.id = "chat-container";
	chatContainer.style.width = "50%";
	chatContainer.style.height = "50%";
	chatContainer.style.background = "rgba(0,0,0,0.8)";
	chatContainer.style.color = "white";
	chatContainer.style.border = "1px solid white";
	chatContainer.style.padding = "10px";
	chatContainer.style.overflow = "hidden";
	chatContainer.style.display = "flex";
	chatContainer.style.flexDirection = "column";
	chatContainer.style.zIndex = "9999";

	// Create the chat history (scrollable)
	const chatHistory = document.createElement("div");
	chatHistory.id = "chat-history";
	chatHistory.style.flexGrow = "1";
	chatHistory.style.overflowY = "auto";
	chatHistory.style.height = "80%";
	chatHistory.style.padding = "5px";
	chatHistory.style.borderBottom = "1px solid white";

	// Create the chat input field
	const chatInput = document.createElement("input");
	chatInput.id = "chat-input";
	chatInput.type = "text";
	chatInput.style.width = "100%";
	chatInput.style.marginTop = "5px";
	chatInput.style.background = "black";
	chatInput.style.color = "white";
	chatInput.style.border = "1px solid white";
	chatInput.style.padding = "5px";

	// Append chat elements inside the tab
	chatContainer.append(chatHistory, chatInput);
	p.append(chatContainer);

	// Extract and Store Description (Directly in Chat Tab)
	let extractedSlaveDescription = "";
	let extractedPlayerDescription = "";
	let extractedFamilyDescription = "";

	function extractSlaveDescription() {
		let slaveLongDescription = App.Desc.longSlave(slave, {noArt: true, links: true});
		if (slaveLongDescription instanceof DocumentFragment) {
			let textParts = [];
			slaveLongDescription.childNodes.forEach(node => {
				if (node.nodeType === Node.TEXT_NODE) {
					textParts.push(node.textContent.trim());
				} else if (node.nodeType === Node.ELEMENT_NODE) {
					textParts.push(node.innerText || node.textContent.trim());
				}
			});
			extractedSlaveDescription = textParts.filter(text => text).join("\n");
		} else if (typeof slaveLongDescription === "string") {
			extractedSlaveDescription = slaveLongDescription.trim();
		}
	}

	function extractPlayerDescription() {
		let playerLongDescription = App.Desc.Player.longDescription(V.PC);
		if (playerLongDescription instanceof DocumentFragment) {
			let textParts = [];
			playerLongDescription.childNodes.forEach(node => {
				if (node.nodeType === Node.TEXT_NODE) {
					textParts.push(node.textContent.trim());
				} else if (node.nodeType === Node.ELEMENT_NODE) {
					textParts.push(node.innerText || node.textContent.trim());
				}
			});
			extractedPlayerDescription = textParts.filter(text => text).join("\n");
		} else if (typeof playerLongDescription === "string") {
			extractedPlayerDescription = playerLongDescription.trim();
		}
	}

	function extractFamilyDescription() {
		let familyLongDescription = App.Desc.family(V.PC, true);
		if (familyLongDescription instanceof DocumentFragment) {
			let textParts = [];
			familyLongDescription.childNodes.forEach(node => {
				if (node.nodeType === Node.TEXT_NODE) {
					textParts.push(node.textContent.trim());
				} else if (node.nodeType === Node.ELEMENT_NODE) {
					textParts.push(node.innerText || node.textContent.trim());
				}
			});
			extractedFamilyDescription = textParts.filter(text => text).join("\n");
		} else if (typeof familyLongDescription === "string") {
			extractedFamilyDescription = familyLongDescription.trim();
		}
	}


	// Call extraction function on tab load
	extractSlaveDescription();
	extractPlayerDescription();
	extractFamilyDescription();

	// Chat Function
	async function sendMessageToAI(userMessage) {
		try {
			const systemMessage = "(role:You are a system that takes user input, game variables, and uses smart sense of the context to write relevant stories to flesh out in-game actions. Immersion is key, do not mention stats or game design elements, only passages that flesh out the users' decisions and the results of their stats/rolls) (Perspective:Always write to the user in first-person, since this is a game in their perspective) (Style:Write one or two paragraphs, regardless of previous replies or user input. Be consistent in length. Sensory details, physical events, and dialogue should be the primary focus of the passages written) [RULES:You will be given details, stat or point increases, and actions the user has made. Write speech ONLY for NPCs, not the user. The user will be roleplaying themselves, do not do it for them! ALWAYS WRITE IN SECOND PERSON PERSPECTIVE ('you do x', 'she does this to you', 'as you x' etc.)]";
			const playerDescriptionContext = extractedPlayerDescription ? `\n\nPlayer Description:\n${extractedPlayerDescription}` : "";
			const familyDescriptionContext = extractedFamilyDescription ? `\n\nFamily Description:\n${extractedFamilyDescription}` : "";
			const slaveDescriptionContext = extractedSlaveDescription ? `\n\nSlave Description:\n${extractedSlaveDescription}` : "";
			const playerTitleContext = `On formal occasions, you are announced as ${PCTitle()}. By slaves, however, you prefer to be called ${properMaster()}.`;


			const response = await fetch(V.aiChatUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					model: "mistral-7b",
					messages: [
						{
							role: "system",
							content: familyDescriptionContext + playerDescriptionContext + playerTitleContext + slaveDescriptionContext + systemMessage
						}, // Include extracted description
						{role: "user", content: userMessage}
					],
					max_tokens: 1024,
					temperature: V.aiChatTemp,
					min_p: V.aiChatMinP,
					repetition_penalty: 1.1
				})
			});

			const data = await response.json();
			console.log("AI Response:", data);

			if (data && data.choices && data.choices.length > 0) {
				return data.choices[0].message.content.trim();
			} else {
				return "⚠️ AI response invalid! Check your self-hosted LLM backend (Ooobabooga, KBCPP) as well as your IP addresses/permissions";
			}
		} catch (error) {
			console.error("Error communicating with AI:", error);
			return "⚠️ Error connecting to AI! ⚠️ Check your self-hosted LLM backend (Ooobabooga, KBCPP) as well as your IP addresses/permissions";
		}
	}

	// Attach event listener inside siChat.js
	chatInput.addEventListener("keypress", async function(event) {
		if (event.key === "Enter") {
			let userMessage = chatInput.value.trim();
			if (userMessage) {
				let userMessageDiv = document.createElement("div");
				userMessageDiv.textContent = "Player: " + userMessage;
				chatHistory.append(userMessageDiv);
				chatInput.value = "";
				chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll

				// Send message to AI using local function
				let aiResponse = await sendMessageToAI(userMessage);

				let aiMessageDiv = document.createElement("div");
				aiMessageDiv.textContent = slave.slaveName + " " + slave.slaveSurname + ":" + aiResponse;
				aiMessageDiv.style.color = "lightblue";
				chatHistory.append(aiMessageDiv);
				chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll
			}
		}
	});

	return p;
};
