// cSpell: ignore dpmpp

App.Art.GenAI.UI.Options = {};

/**
 * @typedef {string} InternalLoraName the internal name of the lora
 */

/**
 * @typedef {object} RecommendedLora
 * @property {InternalLoraName} name
 * @property {string[]} urls the urls links to the model. Ideally on Hugging Face or CivitAI and ideally a page link and a direct download link
 * @property {string} usage the reason this lora is in use
 * @property {FC.GameVariables["aiBaseModel"][]} baseModel an array with all the base models that this lora supports
 */

/** @type {Map<InternalLoraName, RecommendedLora>} */
App.Art.GenAI.UI.Options.recommendedLoRAs = new Map([
	["amputee-000003", {
		name: "amputee-000003",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/amputee-000003.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/amputee-000003.safetensors",
		],
		usage: "Amputation. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["hololive_roboco-san", {
		name: "hololive_roboco-san",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/hololive_roboco-san-10.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/hololive_roboco-san-10.safetensors",
		],
		usage: "Android arms and legs. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["BEReaction", {
		name: "BEReaction",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/BEReaction.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/BEReaction.safetensors",
		],
		usage: "Really large breasts. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["eye-allsclera", {
		name: "eye-allsclera",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/eye-allsclera.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/eye-allsclera.safetensors",
		],
		usage: "Blind eyes. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["Empty Eyes - Drooling v5 - 32dim", {
		get name() {
			if (V.aiUserInterface === 1) {
				return "Empty Eyes - Drooling v5 - 32dim";
			}
			return "empty eyes - drooling v5";
		},
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/Empty%20Eyes%20-%20Drooling%20v5%20-%2032dim.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/Empty%20Eyes%20-%20Drooling%20v5%20-%2032dim.safetensors",
		],
		usage: "Mindbroken slaves. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	// cSpell:ignore-word flaccidfutanarimix
	["flaccidfutanarimix-locon-dim64-alpha64-highLR", {
		name: "flaccidfutanarimix-locon-dim64-alpha64-highLR",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/flaccidfutanarimix-locon-dim64-alpha64-highLR-000003.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/flaccidfutanarimix-locon-dim64-alpha64-highLR-000003.safetensors",
		],
		usage: "Really big futanari (dickgirl) dicks. Required for futas with large dicks to render at all. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["futanari", {
		name: "futanari",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/futanari-000009.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/futanari-000009.safetensors",
		],
		usage: "Normal futanari (dickgirl) dicks. Required for futas with normal dicks to render at all. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	// cSpell:ignore-word micropp
	["micropp_128dim_nai_v2", {
		name: "micropp_128dim_nai_v2",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/micropp_32dim_nai_v2.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/micropp_32dim_nai_v2.safetensors",
		],
		usage: "Small futanari (dickgirl) dicks. Required for futas with small dicks to render at all. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	// cSpell:ignore-word nopussy
	["nopussy_v1", {
		name: "nopussy_v1",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/nopussy_v1.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/nopussy_v1.safetensors",
		],
		usage: "Null gender slaves. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	// cSpell:ignore-word xxmaskedxx
	["xxmaskedxx_lora_v01", {
		name: "xxmaskedxx_lora_v01",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/xxmaskedxx_lora_v01.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/xxmaskedxx_lora_v01.safetensors",
		],
		usage: "Fuckdoll mask. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["Standing Straight v1 - locon 32dim", {
		get name() {
			if (V.aiUserInterface === 1) {
				return "Standing Straight v1 - locon 32dim";
			}
			return "Standing straight  - arms at sides - legs together - v1 - locon 32dim";
		},
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/Standing%20Straight%20%20v1%20-%20locon%2032dim.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/Standing%20Straight%20%20v1%20-%20locon%2032dim.safetensors",
		],
		usage: "Make fuckdolls stand up straight. This will not be used if you are using OpenPose. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["OnlyCocksV1LORA", {
		name: "OnlyCocksV1LORA",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/OnlyCocksV1LORA.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/OnlyCocksV1LORA.safetensors",
		],
		usage: "Improved male penis. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["CatgirlLoraV7", {
		name: "CatgirlLoraV7",
		urls: [
			"https://huggingface.co/NGBot/ampuLora/blob/main/CatgirlLoraV7.safetensors",
			"https://huggingface.co/NGBot/ampuLora/resolve/main/CatgirlLoraV7.safetensors",
		],
		usage: "Catpeople. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}],
	["hugefaketits1", {
		name: "hugefaketits1",
		urls: [
			"https://civitai.com/api/download/models/131998?type=Model&format=SafeTensor",
		],
		usage: "Large boob implants. Part of NGBot's FC LoRA pack.",
		baseModel: [0]
	}], // TODO: test the updated version of this: https://civitai.com/models/97221?modelVersionId=103897
	["LowRA_v2", {
		name: "LowRA_v2",
		urls: [
			"https://huggingface.co/XpucT/Loras/blob/main/LowRA_v2.safetensors",
			"https://huggingface.co/XpucT/Loras/resolve/main/LowRA_v2.safetensors",
		],
		usage: "Makes realistic models have more dynamic contrast. Only used if 'AI style prompting' is set to 'Photorealistic'",
		baseModel: [0]
	}],
	["RobotDog0903", {
		name: "RobotDog0903",
		urls: [
			"https://civitai.com/models/139298/conceptprosthetic-quadruped-girl?modelVersionId=154248",
			"https://civitai.com/api/download/models/154248?type=Model&format=SafeTensor",
		],
		usage: "Quadruped androids",
		baseModel: [0]
	}],
	["ponygirl", {
		name: "ponygirl",
		urls: [
			"https://civitai.com/models/90831?modelVersionId=96789",
			"https://civitai.com/api/download/models/96789?type=Model&format=SafeTensor",
		],
		usage: "Pony Girl outfits, if available",
		baseModel: [0]
	}],
	["Loraeyes_V1", {
		name: "Loraeyes_V1",
		urls: [
			"https://civitai.com/api/download/models/6433?type=Model&format=SafeTensor&size=full&fp=fp16",
		],
		usage: "Fixes some eyes Problems",
		baseModel: [0]
	}],
	["melanin", {
		name: "melanin",
		urls: [
			"https://civitai.com/models/133279?modelVersionId=263127",
			"https://civitai.com/api/download/models/263127?type=Model&format=SafeTensor",
		],
		usage: "Apply a darker skintone for dark skins",
		baseModel: [0]
	}],
	["chastitybelt", {
		name: "chastitybelt",
		urls: [
			"https://civitai.com/models/109401?modelVersionID=117885",
			"https://civitai.com/api/download/models/117885?type=Model&format=SafeTensor",
		],
		usage: "Helps with chastity belt generation",
		baseModel: [0]
	}],
	["womb_tattoo", {
		name: "womb_tattoo",
		urls: [
			"https://civitai.com/models/81409?modelVersionId=86374",
			"https://civitai.com/api/download/models/86374?type=Model&format=SafeTensor",
		],
		usage: "Without it SD1.X models do a really bad job at womb tattoos (lewd crests). With it they do a bit better",
		baseModel: [0]
	}],
	["badanatomy_SDXL_negative_LORA_AutismMix_v1", {
		name: "badanatomy_SDXL_negative_LORA_AutismMix_v1",
		urls: [
			"https://civitai.com/models/430961?modelVersionId=486308",
			"https://civitai.com/api/download/models/486308?type=Model&format=SafeTensor",
		],
		usage: "Helps make Pony checkpoints look better; Less artifacts and better hands",
		baseModel: [2]
	}],
	["lewd_crest_crotch_tattoo_sdxl", {
		name: "lewd_crest_crotch_tattoo_sdxl",
		urls: [
			"https://civitai.com/models/378395?modelVersionId=422506",
			"https://civitai.com/api/download/models/422506?type=Model&format=SafeTensor",
		],
		usage: "Helps SDXL do better womb tattoos (lewd crests)",
		baseModel: [1]
	}],
	["amputee_XL_pony", {
		name: "amputee_XL_pony",
		urls: [
			"https://civitai.com/models/316971/amputee-xl-pony",
		],
		usage: "Amputation. Better with pony models",
		baseModel: [2]
	}],
]);

App.Art.GenAI.UI.Options.aiClearCaches = () => {
	App.Art.GenAI.sdClient.clearLoraCache();
	App.Art.GenAI.sdClient.clearCheckpointCache();
};

/**
 * @param {InstanceType<App.UI.OptionsGroup>} options
 */
App.Art.GenAI.UI.Options.aiManagement = (options) => {
	const renderQueueOption = async (clicked = false) => {
		const sleep = (ms) => new Promise(r => setTimeout(r, ms));
		// wait for the button to render
		while (!$("button:contains('Interrupt rendering')").length) {
			await sleep(10);
		}
		if (clicked) {
			// send interrupt when clicked
			App.Art.GenAI.sdQueue.interrupt();
		}
		if (App.Art.GenAI.sdQueue.interrupted) {
			$("button:contains('Interrupt rendering')").removeClass("off").addClass("on selected disabled");
			await App.Art.GenAI.sdQueue.resumeAfterInterrupt();
		}
		$("button:contains('Interrupt rendering')").removeClass("on selected disabled").addClass("off");
		App.Art.GenAI.sdQueue.updateQueueCounts();
	};

	options.addCustomOption("Rendering Queue management")
		.addButton("Interrupt rendering and clear the rendering queues", () => renderQueueOption(true))
		.addComment(`<span id="mainQueueCount">N/A</span> main images and <span id="backlogQueueCount">N/A</span> backlog images queued for generation.`);
	// adjust the state of the button when it is rendered
	renderQueueOption();

	options.addCustomOption("Cache database management")
		.addButton("Purge all images", async () => {
			await App.Art.GenAI.staticImageDB.clear();
			await App.Art.GenAI.reactiveImageDB.clear();
			getSlaves().forEach(s => {
				s.custom.aiImageIds.deleteAll();
				s.custom.aiDisplayImageIdx = 0;
			});
		})
		.addButton("Clean unused images (static cache only) *will clean images from unloaded save files", async () => {
			let imageIds = [];
			// removing nonexistant slave images from database
			getSlaves().forEach(s => s.custom.aiImageIds.forEach(i => imageIds.pushUnique(i)));
			const cleanedImgCount = await App.Art.GenAI.staticCache.cleanUnusedImages(imageIds);
			// removing nonexistant image references from slaves
			imageIds = await App.Art.GenAI.staticImageDB.getIndexesList();
			const cleanedRefCount = getSlaves().asArray().reduce((acc, s) => {
				const delCount = s.custom.aiImageIds.deleteWith(i => !imageIds.includes(i)).length;
				if (s.custom.aiDisplayImageIdx >= s.custom.aiImageIds.length) {
					s.custom.aiDisplayImageIdx = s.custom.aiImageIds.length > 0 ? s.custom.aiImageIds.length - 1 : 0;
				}
				return acc + delCount;
			}, 0);
			console.log(`${cleanedImgCount} images cleaned from cache, ${cleanedRefCount} image references removed from slaves.`);
		})
		.addButton("Regenerate images for all slaves", () => {
			// queue all slaves for regeneration in the background
			if (V.aiCachingStrategy === 'static') {
				getSlaves().forEach(s => App.Art.GenAI.staticCache.updateSlave(s)
					.catch(error => {
						console.log(error.message || error);
					}));
			} else {
				// reactive
				getSlaves().forEach(s => App.Art.GenAI.reactiveCache.updateSlave(s)
					.catch(error => {
						console.log(error.message || error);
					}));
			}
			console.log(`${App.Art.GenAI.sdQueue.queue.length} requests queued for rendering.`);
		})
		.addButton("Download an archive of all images in this arcology", async () => {
			await App.Art.GenAI.Archiving.downloadArcology();
		})
		.addButton("Import an archive of all images in this arcology", async () => {
			await App.Art.GenAI.Archiving.importArcology();
		})
		.addComment(`The cache database is shared between games. Current cache size: <span id="cacheCount">Please wait...</span>`);

	if (V.aiCachingStrategy === 'static') {
		App.Art.GenAI.staticImageDB.sizeInfo().then((result) => {
			$("#cacheCount").empty().append(result);
		});
	} else {
		App.Art.GenAI.reactiveImageDB.sizeInfo().then((result) => {
			$("#cacheCount").empty().append(result);
		});
	}
};

App.Art.GenAI.UI.Options.aiCheckpointSettings = () => {
	const el = new DocumentFragment();

	const div = App.UI.DOM.appendNewElement("div", el);
	let checkpoints = [];
	let baseModelData = [];
	let samplers = [];
	let schedulers = [];

	/**
	 * renders everything
	 * called by getSchedulers
	 */
	const render = () => {
		const options = new App.UI.OptionsGroup();

		if (V.aiUserInterface === 1) {
			options.addOption("AI Prebuilt Workflow", "aiPrebuiltWorkflow").addValueList([
				["Simple ComfyUI", 0],
				["BreezeIndigo's Pony Diffusion", 2],
				["Custom Workflow", 1],
			]);
		}

		if (V.aiPrebuiltWorkflow === 1 && V.aiUserInterface === 1) {
			const commentDiv = document.createElement("div");
			commentDiv.append(App.UI.DOM.makeElement("span", "Load a custom workflow. See "));
			commentDiv.append(App.UI.comfyUICustomWorkflowGuide());
			commentDiv.append(App.UI.DOM.makeElement("span", " for instructions."));
			options.addOption("Workflow", "aiCustomWorkflow")
				.showTextBox({unit: '', forceString: true})
				.addComment(commentDiv);

			const option = options.addOption("AI Base Model", "aiBaseModel").addValueList([
				["SD 1.X", 0],
				["SDXL", 1],
				["Pony", 2],
				["Illustrious", 6],
			]);
			if (V.aiBaseModel === 6) {
				option.addComment("Note: FC currently has no support for 'v-prediction' based models");
			}
		} else if (V.aiPrebuiltWorkflow === 2) {
			const extDiv = document.createElement("div");
			extDiv.append(
				App.UI.DOM.makeElement("span", "BreezeIndigo's Pony Diffusion needs some extra extensions installed into ComfyUI. These can be installed using the ComfyManager or manually. Links for each extension are provided below."),
				document.createElement("br"),
				App.UI.DOM.createExternalLink("Skimmed CFG", "https://github.com/Extraltodeus/Skimmed_CFG"),
				document.createElement("br"),
				App.UI.DOM.createExternalLink("ComfyMath", "https://github.com/evanspearman/ComfyMath"),
				document.createElement("br"),
				App.UI.DOM.createExternalLink("NNLatentUpscale (ComfyUI Neural Network Latent Upscale)", "https://github.com/Ttl/ComfyUi_NNLatentUpscale"),
				document.createElement("br"),
			);
			options.addCustom(extDiv);
		}

		if (!(V.aiUserInterface === 1 && V.aiPrebuiltWorkflow === 1)) {
			if (checkpoints.length === 0) {
				options.addCustom(App.UI.DOM.makeElement('span', `Could not fetch valid checkpoints. Make sure you have at least one checkpoint installed.`, ["warning"]));
			} else {
				const checkpointSpan = App.UI.DOM.makeElement('span', ``);
				if (!checkpoints.includes(V.aiCheckpoint)) {
					if (V.aiUserInterface === 0 && V.aiCheckpoint.match(/\s\[.*\]$/) === null) {
						// this is likely an A1111 checkpoint that didn't have a known hash and now it does
						// so see if any checkpoints exist that start with the existing checkpoint path
						for (const entry of checkpoints) {
							if (entry.startsWith(V.aiCheckpoint)) {
								// and fix the checkpoint key
								V.aiCheckpoint = entry;
								break;
							}
						}
					}
				}
				if (!checkpoints.includes(V.aiCheckpoint)) {
					checkpointSpan.classList.add('warning');
					checkpointSpan.textContent = `ERROR: Valid options on your Stable Diffusion installation: ${toSentence(checkpoints)}.`;
					checkpoints.push(V.aiCheckpoint);
				}
				options
					.addOption("Checkpoint Model", "aiCheckpoint")
					.addValueList(checkpoints)
					.showTextBox()
					.addComment(App.UI.DOM.combineNodes(
						`The checkpoint model to use. ${V.aiPrebuiltWorkflow === 2 ? "Note: Using non pony models will likely return very bad results. " : ""}`, checkpointSpan))
					.pulldown();
			}
		}

		if (V.aiPrebuiltWorkflow === 2) {
			V.aiBaseModel = 2;
		} else {
			const baseModelMap = {
				0: "SD 1.X",
				1: "SDXL",
				2: "Pony",
				6: "Illustrious",
			};
			/** @type {string[]} */
			const baseModelStrings = baseModelData.map(val => baseModelMap[val]);

			const option = options.addOption("AI Base Model", "aiBaseModel").addValueList([
				["SD 1.X", 0],
				["SDXL", 1],
				["Pony", 2],
				["Illustrious", 6],
			]);
			if (V.aiBaseModel === 6) {
				option.addComment("Note: FC currently has no support for 'v-prediction' based models");
			}
			if (!baseModelData.includes(V.aiBaseModel)) {
				option.addComment(App.UI.DOM.makeElement("span", `This may be incorrect! Best guess${baseModelData.length === 1 ? "" : "es"}: ${baseModelStrings.toString()}`, ["orange"]));
			}
		}

		if (V.aiUserInterface === 1 && V.aiPrebuiltWorkflow === 2) {
			options.addOption("Pony Diffusion Turbo Model", "aiPonyTurbo").addValue("Enabled", true).on().addValue("Disabled", false).off()
				.addComment("Use preset for the faster (but noticeably lower fidelity) Pony Turbo model");
			options.addOption("Custom LoRA list", "aiPonyLoraStack").showTextBox({large: true, forceString: true})
				.addComment(`Enter a valid JSON with the name of each LoRA and its weight, e.g. { "Style LoRA Example 1.safetensors": 1.0, "Style 	LoRA Example 2.safetensors": 0.5 }`);
			options.addOption("High Res Pass", "aiUpscale").addValue("Enabled", true).on().addValue("Disabled", false).off()
				.addComment("Applies latent upscaling and then an img2img high res pass -- similar to A111's hiRes fix option");
			options.addOption("Face Detailer", "aiFaceDetailer").addValue("Enabled", true).on().addValue("Disabled", false).off()
				.addComment("Face detailer for Pony workflow");
		}

		if (V.aiUserInterface === 0) {
			V.aiSamplingMethod = (V.aiSamplingMethod === "dpmpp_2m_sde") ? "DPM++ 2M SDE" : V.aiSamplingMethod;
			V.aiSchedulingMethod = (V.aiSchedulingMethod === "karras") ? "Karras" : V.aiSchedulingMethod;
		} else if (V.aiUserInterface === 1) {
			V.aiOpenPose = false; // TODO: remove when finished with ComfyUI open pose integration
			V.aiSamplingMethod = (V.aiSamplingMethod === "DPM++ 2M SDE") ? "dpmpp_2m_sde" : V.aiSamplingMethod;
			V.aiSchedulingMethod = (V.aiSchedulingMethod === "Karras") ? "karras" : V.aiSchedulingMethod;
		}

		if (V.aiPrebuiltWorkflow === 0 || V.aiUserInterface === 0) {
			if (samplers.length === 0) {
				// this should never happen
				options.addCustom(App.UI.DOM.makeElement('span', `Could not fetch valid samplers. Check your configuration.`, ["warning"]));
			} else {
				const samplerSpan = App.UI.DOM.makeElement('span', ``);
				if (!samplers.includes(V.aiSamplingMethod)) {
					samplerSpan.classList.add('error');
					samplerSpan.textContent = `ERROR: Valid options on your Stable Diffusion installation: ${toSentence(samplers)}.`;
					samplers.push(V.aiSamplingMethod);
				}
				options
					.addOption("Sampling Method", "aiSamplingMethod")
					.addValueList(samplers)
					.showTextBox()
					.addComment(App.UI.DOM.combineNodes(`The sampling method to use. `, samplerSpan))
					.pulldown();
			}

			if (schedulers.length === 0) {
				// this should never happen
				options.addCustom(App.UI.DOM.makeElement('span', `Could not fetch valid schedulers. Check your configuration.`, ["warning"]));
			} else {
				const schedulerSpan = App.UI.DOM.makeElement('span', ``);
				if (!schedulers.includes(V.aiSchedulingMethod)) {
					schedulerSpan.classList.add('error');
					schedulerSpan.textContent = `ERROR: Valid options on your Stable Diffusion installation: ${toSentence(schedulers)}.`;
					schedulers.push(V.aiSchedulingMethod);
				}
				options
					.addOption("Scheduling Method", "aiSchedulingMethod")
					.addValueList(schedulers)
					.showTextBox()
					.addComment(App.UI.DOM.combineNodes(`The scheduling method to use. `, schedulerSpan))
					.pulldown();
			}

			if (V.aiCfgScale < 1) {
				V.aiCfgScale = 1;
			}
			options.addOption("CFG Scale", "aiCfgScale").showTextBox()
				.addComment("The higher this number, the more the prompt influences the image. Generally between 5 to 12. [for Pony Diffusion, suggest values around 5 to 8]");
			if (V.aiTimeoutPerStep < 0.01) {
				V.aiTimeoutPerStep = 0.01;
			}

			options.addOption("Seconds per Step", "aiTimeoutPerStep").showTextBox()
				.addComment("The maximum number of Seconds (per Step) your system takes to render an image.  This time is from the time the request is sent to the time it is saved divided by the number of Sampling Steps. Please set this at as small a value as reasonable to avoid the game from waiting longer than you are for images to generate.");
			if (V.aiSamplingSteps < 2) {
				V.aiSamplingSteps = 2;
			}
			options.addOption("Sampling Steps", "aiSamplingSteps").showTextBox()
				.addComment("The number of steps used when generating the image. More steps might reduce artifacts but increases generation time. Generally between 20 to 50, but may be as high as 500 if you don't mind long queues in the background.");
			if (V.aiSamplingStepsEvent < 2) {
				V.aiSamplingStepsEvent = 2;
			}
			options.addOption("Event Sampling Steps", "aiSamplingStepsEvent").showTextBox()
				.addComment("The number of steps used when generating an image during events. Generally between 20 to 50 to maintain a reasonable speed.");

			V.aiHeight = Math.max(V.aiHeight, 10);
			let suggestedHeight = "640";
			let suggestedWidth = "384";
			switch (V.aiBaseModel) {
				case 0:
					if ((V.aiWidth + V.aiHeight) !== 1024) {
						suggestedHeight += "; Width + height should equal 1024 for best results";
					}
					break;
				case 1: case 2: case 6:
					suggestedHeight = "1216";
					suggestedWidth = "832";
					if ((V.aiWidth + V.aiHeight) !== 2048) {
						suggestedHeight += "; Width + height should equal 2048 for best results";
					}
					break;
			}
			options.addOption("Height", "aiHeight").showTextBox()
				.addComment(`The height of the image; We suggest ${suggestedHeight}`);
			V.aiWidth = Math.max(V.aiWidth, 10);
			options.addOption("Width", "aiWidth").showTextBox()
				.addComment(`The width of the image; We suggest ${suggestedWidth}`);

			if (V.aiUserInterface === 0) {
				const rfCheckSpan = App.UI.DOM.makeElement('span', `Validating Restore Faces...`);
				App.Art.GenAI.sdClient.canRestoreFaces().then(result => {
					if (result) {
						if (V.aiFaceDetailer && V.aiRestoreFaces) {
							rfCheckSpan.textContent = `Do not use Restore Faces and ADetailer Restore Face at the same time. Pick one.`;
							rfCheckSpan.classList.add("error");
						} else {
							rfCheckSpan.textContent = "";
						}
					} else {
						rfCheckSpan.textContent = `Restore Faces is unavailable on your Stable Diffusion installation.`;
						rfCheckSpan.classList.add("error");
					}
				});
				options.addOption("Restore Faces", "aiRestoreFaces")
					.addValue("Enabled", true).on().addValue("Disabled", false).off()
					.addComment(App.UI.DOM.combineNodes("Use a model to restore faces after the image has been generated. May result in 'samey' faces. ", rfCheckSpan));

				const adCheckSpan = App.UI.DOM.makeElement('span', `Validating ADetailer setup...`);
				App.Art.GenAI.sdClient.hasAdetailer().then(result => {
					if (result) {
						adCheckSpan.textContent = "";
					} else {
						adCheckSpan.textContent = `ADetailer is unavailable on your Stable Diffusion installation.`;
						adCheckSpan.classList.add("error");
					}
				});
				options.addOption("ADetailer restore face", "aiFaceDetailer")
					.addValue("Enabled", true).on().addValue("Disabled", false).off()
					.addComment(App.UI.DOM.combineNodes("Use AI to recognize and re-render faces with better detail. Much better than Restore Faces, but requires more technical setup. ", adCheckSpan));
			} else if (V.aiUserInterface === 1) { // TODO: fix for BI's pony -Erix
				const adCheckSpan = App.UI.DOM.makeElement('span', `Validating Impact-Pack setup...`);
				App.Art.GenAI.sdClient.hasImpactPack().then(result => {
					if (result) {
						adCheckSpan.textContent = "";
					} else {
						adCheckSpan.textContent = `Impact-Pack is unavailable on your ComfyUI installation.`;
						adCheckSpan.classList.add("error");
					}
				});
				options.addOption("Impact-Pack Face Detailer", "aiFaceDetailer")
					.addValue("Enabled", true).on().addValue("Disabled", false).off()
					.addComment(App.UI.DOM.combineNodes("Use AI to recognize and re-render faces with better detail. Much better than without, but requires Impact-Pack. ", adCheckSpan));
			}

			options.addOption("Upscaling/highres fix", "aiUpscale")
				.addValue("Enabled", true).on().addValue("Disabled", false).off()
				.addComment("Use AI upscaling to produce higher-resolution images. Significantly increases both time to generate and image quality.");
			if (V.aiUpscale) {
				options.addOption("Upscaling size", "aiUpscaleScale").showTextBox()
					.addComment("Scales the dimensions of the image by this factor. Defaults to 1.75.");

				const upscalerListSpan = App.UI.DOM.makeElement('span', `Fetching options, please wait...`);
				App.Art.GenAI.sdClient.getUpscalerList().then(list => {
					if (list.length === 0) {
						upscalerListSpan.textContent = `Could not fetch valid upscalers. Check your configuration.`;
						upscalerListSpan.classList.add('error');
					} else {
						upscalerListSpan.textContent = `Valid options on your Stable Diffusion installation: ${toSentence(list)}.`;
						if (!list.includes(V.aiUpscaler)) {
							upscalerListSpan.classList.add('error');
							upscalerListSpan.textContent = "ERROR: " + upscalerListSpan.textContent;
						}
					}
				});
				options.addOption("Upscaling method", "aiUpscaler").showTextBox()
					.addComment(App.UI.DOM.combineNodes(`The method used for upscaling the image. `, upscalerListSpan));
			}

			if (V.aiUserInterface === 0) {
				const opCheckSpan = App.UI.DOM.makeElement('span', `Validating ControlNet and OpenPose setup...`);
				App.Art.GenAI.sdClient.hasOpenPose().then(result => {
					if (result) {
						opCheckSpan.textContent = "";
					} else {
						opCheckSpan.textContent = `OpenPose is unavailable on your Stable Diffusion installation. Check your ControlNet configuration.`;
						opCheckSpan.classList.add("error");
					}
				});
				options.addOption("Strictly control posing", "aiOpenPose")
					.addValue("Enabled", true).on().addValue("Disabled", false).off()
					.addComment(App.UI.DOM.combineNodes(`Use the ControlNet extension's OpenPose module to strictly control slave poses. `, opCheckSpan));
				if (V.aiOpenPose) {
					const opModelList = App.UI.DOM.makeElement('span', `Fetching options, please wait...`);
					App.Art.GenAI.sdClient.getOpenPoseModelList().then(list => {
						if (list.length === 0) {
							opModelList.textContent = `Could not fetch valid OpenPose models. Check your configuration.`;
							opModelList.classList.add('error');
						} else {
							opModelList.textContent = `Valid options on your Stable Diffusion installation: ${toSentence(list)}.`;
							if (!list.includes(V.aiOpenPoseModel)) {
								opModelList.classList.add('error');
								opModelList.textContent = "ERROR: " + opModelList.textContent;
							}
						}
					});
					options.addOption("OpenPose Model", "aiOpenPoseModel").showTextBox()
						.addComment(App.UI.DOM.combineNodes(`The model used for applying the pose to the image. Enter the entire model name, including the checksum (i.e. "control_v11p_sd15_openpose [cab727d4]").`, opModelList));
				}
			}


			const cfgCheckSpan = App.UI.DOM.makeElement('span', 'Use the "Stable Diffusion Dynamic Thresholding" extension.');
			// if (V.aiUserInterface === 1) {
			// 	cfgCheckSpan.textContent = `Fetching Dynamic-Thresholding, please wait...`;
			// 	App.Art.GenAI.sdClient.hasDynamicThresholding().then(result => {
			// 		if (!result) {
			// 			cfgCheckSpan.textContent = 'Dynamic-Thresholding is unavailable on your ComfyUI installation.'
			// 			cfgCheckSpan.classList.add('error');
			// 		} else {
			// 			cfgCheckSpan.textContent = ''
			// 		}
			// 	})
			// }
			options.addOption("CFG Scale Fix", "aiDynamicCfgEnabled")
				.addValue("Enabled", true).on().addValue("Disabled", false).off().addComment(cfgCheckSpan);

			if (V.aiDynamicCfgEnabled) {
				options.addOption("CFG Scale Fix: Mimicked Number", "aiDynamicCfgMimic").showTextBox()
					.addComment("If CFG Scale Fix is on, then set this number to a CFG scale to mimic a normal CFG (5 to 12), and then set your actual CFG to something high (20, 30, etc.)");
				if (V.aiDynamicCfgMimic < 0) {
					V.aiDynamicCfgMimic = 0;
				}
				options.addOption("CFG Scale Fix: Minimum Scale", "aiDynamicCfgMinimum").showTextBox()
					.addComment("CFG Scheduler minimums. Set to around 3 or 4 for best results.");
				if (V.aiDynamicCfgMinimum < 0) {
					V.aiDynamicCfgMinimum = 0;
				}
			}
		}

		div.textContent = "";
		div.append(options.render());
	};

	/**
	 * gets schedulers and then calls render
	 */
	const getSchedulers = () => {
		App.Art.GenAI.sdClient.getSchedulerList()
			.then(list => {
				schedulers = list;
				div.textContent = `Loading...`;
			})
			.finally(() => {
				setTimeout(() => {
					render();
				}, 0);
			});
	};

	/**
	 * gets samplers and then calls getSchedulers
	 */
	const getSamplers = () => {
		App.Art.GenAI.sdClient.getSamplerList()
			.then(list => {
				samplers = list;
				div.textContent = `Waiting on schedulers from ${V.aiUserInterface === 0 ? "A1111" : "ComfyUI"}...`;
			})
			.finally(() => {
				setTimeout(() => {
					getSchedulers();
				}, 0);
			});
	};

	/**
	 * gets base model data and then calls getSamplers
	 */
	const getBaseModelData = () => {
		App.Art.GenAI.sdClient.getCheckpointPotentialBaseModels(V.aiCheckpoint)
			.then(list => {
				baseModelData = list;
				div.textContent = `Waiting on samplers from ${V.aiUserInterface === 0 ? "A1111" : "ComfyUI"}...`;
			})
			.finally(() => {
				setTimeout(() => {
					getSamplers();
				}, 0);
			});
	};

	/**
	 * gets checkpoints and then calls getBaseModelData
	 */
	const getCheckpoints = () => {
		App.Art.GenAI.sdClient.getCheckpointList()
			.then(list => {
				checkpoints = list;
				div.textContent = `Waiting on base model info from ${V.aiUserInterface === 0 ? "A1111" : "ComfyUI"}...`;
			})
			.finally(() => {
				setTimeout(() => {
					getBaseModelData();
				}, 0);
			});
	};

	div.textContent = `Waiting on checkpoints from ${V.aiUserInterface === 0 ? "A1111" : "ComfyUI"}...`;
	setTimeout(() => {
		getCheckpoints();
	}, 0);

	return el;
};

App.Art.GenAI.UI.Options.aiLoRASettingsRecommended = (availableLoRAs) => {
	const el = new DocumentFragment();

	// TODO:@franklygeorge lora substitutions (with weight scaling)

	/** @type {RecommendedLora[]} */
	let recommendedLoRAs = [];
	App.Art.GenAI.UI.Options.recommendedLoRAs.forEach((lora) => {
		// filter so that recommendedLoRAs only has the LoRAs that are compatible with the current aiBaseModel
		if (lora.baseModel.includes(V.aiBaseModel)) {
			recommendedLoRAs.push(lora);
		}
	});

	/**
	 * @param {string} link
	 */
	const linkToSite = (link) => {
		// cSpell:ignore civitai
		if (link.includes("//civitai")) {
			if (link.includes("/api/download/")) {
				return "CIVITAI (direct download) (account needed)";
			} else {
				return "CIVITAI (account needed)";
			}
		} else if (link.includes("//huggingface")) {
			if (link.includes("/resolve/")) {
				return "Hugging Face (direct download)";
			} else {
				return "Hugging Face";
			}
		} else {
			return link;
		}
	};

	/**
	 * @param {RecommendedLora} lora
	 * @param {boolean} [installed=false]
	 * @returns {HTMLDivElement}
	 */
	const loraDiv = (lora, installed = false) => {
		const lDiv = App.UI.DOM.makeElement("div");
		const links = [];
		let title = lora.name;
		lora.urls.forEach((url) => {
			links.push(App.UI.DOM.link(
				linkToSite(url),
				() => {
					window.open(url, '_blank').focus();
				}
			));
		});
		lora.baseModel.forEach(model => {
			title += model === 0 ? " - SD 1.X" : "";
			title += model === 1 ? " - SDXL" : "";
			title += model === 2 ? " - Pony" : "";
		});

		lDiv.append(
			App.UI.DOM.makeElement("b", title),
			App.UI.DOM.makeElement("br"),
		);
		if (installed) {
			const enableLinksDiv = App.UI.DOM.makeElement("div");
			/**
			 * @param {HTMLDivElement} div
			 */
			const refreshEnableLinks = (div) => {
				div.innerHTML = "";
				let enableLink = (V.aiDisabledLoRAs.includes(lora.name))
					? App.UI.DOM.link("Enable", () => {
						V.aiDisabledLoRAs.splice(V.aiDisabledLoRAs.indexOf(lora.name), 1);
						// TODO:@franklygeorge requeue the preview rendering
						refreshEnableLinks(div);
					})
					: App.UI.DOM.disabledLink("Enable", ["Already enabled"]);
				let disableLink = (!V.aiDisabledLoRAs.includes(lora.name))
					? App.UI.DOM.link("Disable", () => {
						V.aiDisabledLoRAs.push(lora.name);
						// TODO:@franklygeorge requeue the preview rendering
						refreshEnableLinks(div);
					})
					: App.UI.DOM.disabledLink("Disable", ["Already disabled"]);
				div.append(App.UI.DOM.generateLinksStrip([enableLink, disableLink]));
			};

			refreshEnableLinks(enableLinksDiv);
			lDiv.append(enableLinksDiv);
		}
		lDiv.append(
			lora.usage,
			App.UI.DOM.makeElement("br"),
			App.UI.DOM.generateLinksStrip(links),
			App.UI.DOM.makeElement("hr"),
		);

		return lDiv;
	};

	const contentDiv = App.UI.DOM.makeElement("div");
	let recommendedInstalled = [];
	let recommended = [];
	recommendedLoRAs.forEach(lora => {
		if (availableLoRAs.includes(lora.name)) {
			recommendedInstalled.push(lora);
		} else {
			recommended.push(lora);
		}
	});
	// title = `${recommendedInstalled.length} out of ${recommendedLoRAs.length} recommended LoRAs installed`;

	recommended.forEach(lora => {
		contentDiv.append(loraDiv(lora));
	});

	recommendedInstalled.forEach(lora => {
		contentDiv.append(loraDiv(lora, true));
	});

	el.append(contentDiv);

	return el;
};

App.Art.GenAI.UI.Options.aiLoRASettingsInstalled = (availableLoRAs) => {
	const el = new DocumentFragment();
	const contentDiv = App.UI.DOM.makeElement("div");

	const note = [
		"You can use these in custom prompts by adding '<lora:[lora name]:[weight]>' to the prompt.",
		"For example if the LoRA is 'futanari' then you might add '<lora:futanari:0.5>' to the prompt.",
		"Some LoRAs require extra tags to work. These tags are often listed on the LoRA's download page."
	];

	contentDiv.append(
		App.UI.DOM.makeElement("p", note.join(" ")),
		App.UI.DOM.makeElement("hr")
	);

	contentDiv.append(
		availableLoRAs.join("  |  ")
	);

	// TODO:@franklygeorge replace the above with a tool that helps the user build valid lora strings out of available lora's

	el.append(contentDiv);

	return el;
};

App.Art.GenAI.UI.Options.aiLoRASettings = () => {
	const el = new DocumentFragment();

	const loraSpan = App.UI.DOM.makeElement('span', ``);
	if (V.aiUserInterface === 1) {
		loraSpan.textContent = `Fetching lora-loader, please wait...`;
		App.Art.GenAI.sdClient.hasRGThreeComfy().then(result => {
			if (!result) {
				loraSpan.textContent = "Couldn't find lora-loader script! is the RGThree ComfyUI extension installed?";
				loraSpan.classList.add('warning');
			} else {
				loraSpan.textContent = "";
			}
		});
	}

	if (V.aiUserInterface === 0 || V.aiPrebuiltWorkflow !== 2) {
		el.append(App.UI.loraInstallationGuide());
		const options = new App.UI.OptionsGroup();
		options.addOption("LoRA models are", "aiLoraPack")
			.addValue("Enabled", true).on().addValue("Disabled", false).off().addComment(loraSpan);
		el.append(options.render());

		const loraListDiv = document.createElement("div");
		setTimeout(() => {
			if (V.aiLoraPack) {
				loraListDiv.textContent = "Loading LoRA list... This may take some time depending on how many LoRAs you have and your storage speed...";
				App.Art.GenAI.sdClient.getLoraList()
					.then((availableLoRAs) => {
						loraListDiv.innerHTML = "";
						const tabBar = new App.UI.Tabs.TabBar("aiLoRASettings");
						tabBar.addTab("Recommended LoRAs", "recommended", App.Art.GenAI.UI.Options.aiLoRASettingsRecommended(availableLoRAs));
						tabBar.addTab("Installed LoRAs", "all", App.Art.GenAI.UI.Options.aiLoRASettingsInstalled(availableLoRAs));
						loraListDiv.append(tabBar.render());
					})
					.catch(e => {
						loraListDiv.innerHTML = "";
						loraListDiv.append(App.UI.DOM.formatException(e));
					});
			} else {
				loraListDiv.textContent = "LoRAs are disabled";
			}
		}, 1);
		el.append(loraListDiv);
	} else if (V.aiPrebuiltWorkflow === 2) {
		// TODO: list `BreezeIndigo's Pony Diffusion`'s expected lora's (with links) (if they can be found)
		// the loras are defined as a json string in `V.aiPonyLoraStack`
	}

	return el;
};

App.Art.GenAI.UI.Options.aiPromptingSettings = () => {
	const el = new DocumentFragment();
	const options = new App.UI.OptionsGroup();

	options.addOption("AI style prompting", "aiStyle")
		.addValueList([
			["None", 3],
			["Anime/Hentai", 2],
			["Photorealistic", 1],
			["Custom", 0],
		]);

	if (V.aiStyle === 0) {
		options.addOption("AI custom style positive prompt", "aiCustomStylePos").showTextBox({large: true, forceString: true})
			.addComment("Include desired LoRA triggers (<code>&lt;lora:LowRA:0.5&gt;</code>) and general style prompts relevant to your chosen model ('<code>hand drawn, dark theme, black background</code>'), but no slave-specific prompts");
		options.addOption("AI custom style negative prompt", "aiCustomStyleNeg").showTextBox({large: true, forceString: true})
			.addComment("Include undesired general style prompts relevant to your chosen model ('<code>greyscale, photography, forest, low camera angle</code>'), but no slave-specific prompts");
	} else if (V.aiStyle === 1) {
		options.addComment("For best results, use an appropriately-trained photorealistic base model, such as MajicMIX or Life Like Diffusion.");
	} else if (V.aiStyle === 2) {
		options.addComment("For best results, use an appropriately-trained hentai base model, such as Hassaku.");
	}

	options.addOption("Visual age filter", 'aiAgeFilter')
		.addValue("Enabled", true).on().addValue("Disabled", false).off()
		.addComment(`Creating images of characters that <U>appear to be</U> minors may be questionable in some countries, especially if they are generated by AI. Realistic images are even riskier due to their easy confusion with real ones. This option attempts to generate SFW images for them. <span class="red">You may want to check you local laws before disabling this option.</span>`);

	options.addOption("Nationality factor in prompt", "aiNationality")
		.addValue("Strong", 2).addValue("Weak", 1).on().addValue("Disabled", 0).off()
		.addComment("Helps differentiate between ethnicities that share a Free Cities race, like Japanese and Korean or Spanish and Greek. May cause flags/national colors to appear unexpectedly, and can have a negative impact on slaves that belong to a minority race for their nationality.");

	options.addOption("Gender hints come from", "aiGenderHint")
		.addValue("Hormone balance", 1).addValue("Perceived gender", 2).addValue("Pronouns", 3)
		.addComment("How to determine whether to include words like \"woman\" or \"man\" in a prompt.");

	options.addOption("Location Prompts are", "aiLocationBackgrounds")
		.addValue("By outfit", 2).on().addValue("By assignment", 1).on().addValue("Disabled", 0).off()
		.addComment("Adds a background to the prompt, depending on the current job and location of the slave or based off their clothes.");

	options.addOption("Apply RA prompt changes for event images", "aiUseRAForEvents")
		.addValue("Enabled", true).on().addValue("Disabled", false).off()
		.addComment("Apply image generation prompt changes from Rules Assistant for event images, including slave marketplace images. Useful for customizing prompts of non-owned slaves.");

	el.append(options.render());
	return el;
};

App.Art.GenAI.UI.Options.aiGenerationSettings = () => {
	const el = new DocumentFragment();
	const options = new App.UI.OptionsGroup();

	options.addOption("Caching Strategy", 'aiCachingStrategy')
		.addValue("Reactive", 'reactive').addValue("Static", 'static')
		.addComment("Caching behavior for AI images. Reactive pictures always reflect the state of the slave at the current time. Static refreshes every set amount of weeks, or manually. Images will not be brought across different strategies, but if the model is the same the generated images will be the same as well.");

	if (V.aiCachingStrategy === 'static') {
		options.addOption("Automatic generation", "aiAutoGen")
			.addValue("Enabled", true).on().addValue("Disabled", false).off()
			.addComment("Generate images for new slaves on the fly. If disabled, you will need to manually click to generate each slave's image.");
		if (V.aiAutoGen) {
			if (V.aiAutoGenFrequency < 1) {
				V.aiAutoGenFrequency = 1;
			}
			V.aiAutoGenFrequency = Math.round(V.aiAutoGenFrequency);
			options.addOption("Regeneration Frequency", "aiAutoGenFrequency").showTextBox()
				.addComment("How often (in weeks) regenerate slave images. Slaves will render when 'Weeks Owned' is divisible by this number.");
		}
	}

	options.addOption("Generation Queue Overlay", "aiQueueOverlay")
		.addValue("Enabled", 1).on().addValue("Disabled", 0).off();

	el.append(options.render());
	return el;
};

/**
 * @param {boolean} [promptingOnly=true]
 * @returns {HTMLDivElement}
 */
App.Art.GenAI.UI.Options.aiArtSettings = (promptingOnly = false) => {
	let div = document.createElement("div");
	if (promptingOnly) {
		App.UI.DOM.appendNewElement("hr", div);
		// this is used for `Show suggested AI prompts in Customize tab` option when `seeCustomImagesOnly` is enabled
		div.append(App.Art.GenAI.UI.Options.aiPromptingSettings());
	} else {
		div.append(App.UI.DOM.link(`Refresh info (checkpoints, LoRAs, etc) from ${V.aiUserInterface === 0 ? "A1111" : "ComfyUI"}`, () => {
			App.Art.GenAI.UI.Options.aiClearCaches();
			App.UI.reload();
		}));
		div.append(document.createElement("hr"));
		const tabBar = new App.UI.Tabs.TabBar("aiArtSettings");
		tabBar.addTab("Model", "model", App.Art.GenAI.UI.Options.aiCheckpointSettings());
		// cSpell: ignore loras
		tabBar.addTab("LoRAs", "loras", App.Art.GenAI.UI.Options.aiLoRASettings());
		tabBar.addTab("Prompting", "prompting", App.Art.GenAI.UI.Options.aiPromptingSettings());
		tabBar.addTab("Generation", "generation", App.Art.GenAI.UI.Options.aiGenerationSettings());
		div.append(tabBar.render());
		div.append(document.createElement("hr"));
		const options = new App.UI.OptionsGroup();
		App.Art.GenAI.UI.Options.aiManagement(options);
		div.append(options.render());
	}
	return div;
};

/**
 * @param {InstanceType<App.UI.OptionsGroup>} options
 */
App.Art.GenAI.UI.Options.artOptions = (options) => {
	options.addComment("AI art support is experimental. Please follow the setup instructions below to get started.");
	options.addCustom(App.UI.A1111InstallationGuide("A1111 WebUI Installation Guide (easier to use)"));
	options.addCustom(App.UI.comfyUIInstallationGuide("ComfyUI Installation Guide (uses less system resources; faster)"));
	if (V.aiApiUrl.endsWith('/')) { // common error is including a trailing slash, which will fuck us up, so strip it automatically
		V.aiApiUrl = V.aiApiUrl.slice(0, -1);
	}
	options.addOption("API URL", "aiApiUrl")
		.showTextBox()
		.addGlobalCallback(() => {
			App.Art.GenAI.UI.Options.aiClearCaches();
		})
		.addComment("The URL that you use to access Stable Diffusion.");
	options.addOption("AI User Interface", "aiUserInterface").addValueList([
		["A1111", 0],
		["ComfyUI", 1]
	]).addGlobalCallback(val => {
		// automatically change the url if it is set to the default
		if (val === 0 && V.aiApiUrl === "http://localhost:8188") {
			V.aiApiUrl = "http://localhost:7860";
		} else if (val === 1 && V.aiApiUrl === "http://localhost:7860") {
			V.aiApiUrl = "http://localhost:8188";
		}
		App.Art.GenAI.UI.Options.aiClearCaches();
	});
	const promptingOptions = document.createElement("div");
	options.addCustom(promptingOptions);
	promptingOptions.innerHTML = `Attempting to ping ${V.aiUserInterface === 0 ? "A1111" : "ComfyUI"}...<br><br>`;
	App.Art.GenAI.sdClient.ping(10000).then(success => {
		promptingOptions.innerHTML = "";
		if (success === false) {
			const span = App.UI.DOM.appendNewElement("span", promptingOptions, "", ["warning"]);
			span.innerHTML = `Failed to contact ${V.aiUserInterface === 0 ? "A1111" : "ComfyUI"} at <a class="link-external" target="_blank" href="${V.aiApiUrl}">${V.aiApiUrl}</a>! Make sure 'AI User Interface' is set correctly and that the provided url is accessible from this machine.<br><br>`;
			// Even if Stable Diffusion isn't reachable, users should still be able to manage/import/export
			// their local image cache (e.g. importing an archive from another machine).
			promptingOptions.append(document.createElement("hr"));
			const cacheOnly = new App.UI.OptionsGroup();
			cacheOnly.addCustomOption("Cache database management")
			  .addButton("Download an archive of all images in this arcology", async () => {
				await App.Art.GenAI.Archiving.downloadArcology();
			  })
			  .addButton("Import an archive of all images in this arcology", async () => {
				await App.Art.GenAI.Archiving.importArcology();
			  })
			  .addComment(`The cache database is shared between games. Current cache size: <span id="cacheCount">Please wait...</span>`);
			promptingOptions.append(cacheOnly.render());

			if (V.aiCachingStrategy === 'static') {
			  App.Art.GenAI.staticImageDB.sizeInfo().then((result) => {
				$("#cacheCount").empty().append(result);
			  });
			} else {
			  App.Art.GenAI.reactiveImageDB.sizeInfo().then((result) => {
				$("#cacheCount").empty().append(result);
			  });
			}
		} else {
			const span = App.UI.DOM.appendNewElement("span", promptingOptions, "", ["success"]);
			span.innerHTML = `Connected to ${V.aiUserInterface === 0 ? "A1111" : "ComfyUI"} at <a class="link-external" target="_blank" href="${V.aiApiUrl}">${V.aiApiUrl}</a>`;
			promptingOptions.append(document.createElement("br"));
			promptingOptions.append(App.Art.GenAI.UI.Options.aiArtSettings());
		}
	});
};
