/* eslint-disable camelcase */
// cSpell:ignore swinir, sdapi, yolov, VBOR, rgthree

App.Art.GenAI.StableDiffusionSettings = class {
	/**
	 * @typedef {object} ConstructorOptions
	 * @param {boolean} [enable_hr=true]
	 * @param {number} [denoising_strength=0.3]
	 * @param {number} [hr_scale=1.7]
	 * @param {string} [hr_upscaler="SwinIR_4x"]
	 * @param {number} [hr_second_pass_steps=10]
	 * @param {string} [prompt=""]
	 * @param {number} [seed=1337]
	 * @param {string} [sampler_name="DPM++ 2M SDE"]
	 * @param {string} [scheduler="automatic"]
	 * @param {number} [steps=20]
	 * @param {number} [cfg_scale=5.5]
	 * @param {number} [width=512]
	 * @param {number} [height=768]
	 * @param {boolean} [restore_faces=true] Whether to use a model to restore faces or not
	 * @param {string} [negative_prompt=""]
	 * @param {string[]} [override_settings=["Discard penultimate sigma: True"]]
	 * @param {object} [alwayson_scripts={}] Always on Scripts (e.g. ADetailer)
	 */

	/**
	 * @param {ConstructorOptions} options The options for the constructor.
	 */
	constructor({
		enable_hr = true,
		denoising_strength = 0.3,
		hr_scale = 1.7,
		hr_upscaler = "SwinIR_4x",
		hr_second_pass_steps = 10,
		prompt = "",
		seed = 1337,
		sampler_name = "DPM++ 2M",
		scheduler = "automatic",
		steps = 20,
		cfg_scale = 5.5,
		width = 512,
		height = 768,
		negative_prompt = "",
		restore_faces = true,
		override_settings = {
			"always_discard_next_to_last_sigma": true,
		},
		alwayson_scripts = {}
	} = {}) {
		this.enable_hr = enable_hr;
		this.denoising_strength = denoising_strength;
		this.firstphase_width = width;
		this.firstphase_height = height;
		this.hr_scale = hr_scale;
		this.hr_upscaler = hr_upscaler;
		this.hr_second_pass_steps = hr_second_pass_steps;
		this.hr_sampler_name = sampler_name;
		this.hr_prompt = prompt;
		this.hr_negative_prompt = negative_prompt;
		this.prompt = prompt;
		this.seed = seed;
		this.sampler_name = sampler_name;
		this.scheduler = scheduler;
		this.batch_size = 1;
		this.n_iter = 1;
		this.steps = steps;
		this.cfg_scale = cfg_scale;
		this.width = width;
		this.height = height;
		this.negative_prompt = negative_prompt;
		this.restore_faces = restore_faces;
		this.override_strings = override_settings; // I think this is wrong, but I will leave it - franklygeorge
		this.override_settings = override_settings; // This is right - franklygeorge
		this.override_settings_restore_afterwards = true;
		this.alwayson_scripts = alwayson_scripts;
	}
};

App.Art.GenAI.ComfyUISettings = class {
	/**
	 * @param {object} prompt
	 */
	constructor(prompt) {
		this.prompt = prompt;
	}
	client_id = '1234';
};


/**
 * @param {string} url
 * @param {number} timeout
 * @param {object} [options]
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeout, options) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);
	const response = await fetch(url, {signal: controller.signal, ...options});
	clearTimeout(id);
	return response;
}


/**
 * @typedef App.Art.GenAI.SdQueueItem
 * @property {number} slaveID
 * @property {string} body
 * @property {boolean} isEventImage
 * @property {[function(object): void]} resolves
 * @property {[function(string): void]} rejects
 */

/**
 * @typedef {object} ArtQueueState
 * @property {boolean} active
 * @property {number} mainQueueCount
 * @property {number} backlogCount
 */

App.Art.GenAI.StableDiffusionClientQueue = class {
	constructor() {
		// Images for this current screen
		/**  @type {Array<App.Art.GenAI.SdQueueItem>} */
		this.queue = [];
		// Images for permanent slaves (i.e. not event) that were requested to be generated in previous screens
		/**  @type {Array<App.Art.GenAI.SdQueueItem>} */
		this.backlogQueue = [];
		this.interrupted = false;
		/** @type {number|null} */
		this.workingOnID = null;
		/** @type {string|null} */
		this.workingOnBody = null;
		/**
		 * @type {Array<function(ArtQueueState): void>}
		 * @private
		 */
		this._statusChangeCallbacks = [];
	}

	resetWorkingOnProperties() {
		this.workingOnBody = null;
		this.workingOnID = null;
	}

	/**
	 * First value is main queue, second backlog queue
	 *
	 * @param {function(ArtQueueState): void} callback
	 */
	registerStatusChangeCallback(callback) {
		this._statusChangeCallbacks.push(callback);
	}

	/**
	 * Updates the queue counts if on the ai image settings page
	 */
	updateQueueCounts() {
		// update queue counts if on the page
		["#mainQueueCount", "#backlogQueueCount"].forEach(queueElement => {
			const queue = $(queueElement);
			let count = 0;
			if (queueElement === "#mainQueueCount") {
				count = this.queue.length;
			} else {
				count = this.backlogQueue.length;
			}
			if (queue !== undefined && queue.length) {
				queue.empty().append(count.toString());
			}
		});
		const state = {
			active: this.workingOnID !== null,
			mainQueueCount: this.queue.length,
			backlogCount: this.backlogQueue.length
		};
		for (const callback of this._statusChangeCallbacks) {
			callback(state);
		}
	}

	/**
	 * @param {App.Art.GenAI.SdQueueItem} top
	 * @param {{body: App.Art.GenAI.SdQueueItem["body"], method: string, headers: {[key: string]: string}}} options
	 */
	openWebSocket(top, options) {
		let client_id = Math.random().toExponential();
		let api_url = V.aiApiUrl.match(/\/\/(.*)/)[1];
		let ws = new WebSocket(`ws://${api_url}/ws?clientId=${client_id}`);
		let obj = {images: []};
		let img_blob;

		ws.onopen = () => {
			let req_body = JSON.parse(options.body);
			req_body.client_id = client_id;
			options.body = JSON.stringify(req_body);
			fetch(`${V.aiApiUrl}/prompt`, options).then(res => {
				if (res.status === 400) {
					res.json().then(res => {
						top.rejects.forEach(reject => reject(`${top.slaveID}: Error sending prompt to ComfyUi - error message: ${res.error.message || res.error}`));
						ws.close();
					});
				}
			});
		};

		ws.onmessage = (ev) => {
			let msg = ev.data;

			if (typeof msg === 'string') {
				let message = JSON.parse(msg);

				if (message.type === 'execution_success') {
					const blobToBase64 = (blob) => {
						return new Promise((resolve, _) => {
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result);
							reader.readAsDataURL(blob.slice(8, -1, 'image/png'));
						});
					};

					blobToBase64(img_blob).then(res => {
						obj.images = [res];
						return obj;
					}).then(obj => {
						top.resolves.forEach(resolve => resolve(obj));
						this.resetWorkingOnProperties();
					}).catch(err => {
						this.resetWorkingOnProperties();
						top.rejects.forEach(reject => reject(`${top.slaveID}: Error fetching Stable Diffusion image - status: ${err}`));
					});
					ws.close();
				}
				if (message.type === 'execution_error') {
					this.resetWorkingOnProperties();
					top.rejects.forEach(reject => reject(`${top.slaveID}: Error during comfyUi execution`));
					ws.close();
				}
				if (message.type === 'execution_interrupted') {
					this.resetWorkingOnProperties();
					top.rejects.forEach(reject => reject());
					ws.close();
				}
			} else {
				img_blob = msg;
			}
		};

		ws.onerror = () => {
			this.resetWorkingOnProperties();
			top.rejects.forEach(reject => reject(`${top.slaveID}: Error connecting to ComfyUi`));
		};

		ws.onclose = () => {
			this.resetWorkingOnProperties();
			this.updateQueueCounts();
			this.process();
		};
	}

	/**
	 * Process the top item in the queue, and continue processing the queue one at a time afterwards
	 * @private
	 */
	process() {
		if (this.workingOnID !== null) {
			return false;
		}
		if (this.interrupted) {
			return false;
		}

		/** @type {App.Art.GenAI.SdQueueItem} */
		let top;
		if (this.queue.length > 0) {
			top = this.queue.shift();
		} else if (this.backlogQueue.length > 0) {
			top = this.backlogQueue.shift();
		} else {
			return false;
		}

		try {
			this.workingOnID = top.slaveID;
			this.workingOnBody = top.body;
			console.debug(`Fetching image for slave ${top.slaveID}, ${this.queue.length} requests remaining in the queue; ${this.backlogQueue.length} in backlog.`);
			if (V.debugMode) {
				console.debug(`SD generation settings`, JSON.parse(top.body));
			}
			const options = {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: top.body,
			};
			if (V.aiUserInterface === 0) {
				fetchWithTimeout(`${V.aiApiUrl}/sdapi/v1/txt2img`, (V.aiTimeoutPerStep * 1000 + 200) * (V.aiFaceDetailer ? V.aiSamplingSteps * 2 : V.aiSamplingSteps), options)
					.then((value) => {
						return value.json();
					}).then(obj => {
						top.resolves.forEach(resolve => resolve(obj));
						this.resetWorkingOnProperties();
						this.updateQueueCounts();
						this.process();
					})
					.catch(err => {
						this.resetWorkingOnProperties();
						top.rejects.forEach(reject => reject(`${top.slaveID}: Error fetching Stable Diffusion image - status: ${err}`));
						this.updateQueueCounts();
						this.process();
					});
			} else {
				this.openWebSocket(top, options);
			}
		} catch (err) {
			this.resetWorkingOnProperties();
			top.rejects.forEach(reject => reject(err));
			this.updateQueueCounts();
			this.process();
		}
		this.updateQueueCounts();
		return true;
	}

	/**
	 * await this in order to block until the queue exits the interrupted state
	 */
	async resumeAfterInterrupt() {
		const sleep = () => new Promise(r => setTimeout(r, 100));
		while (this.interrupted) {
			await sleep();
		}
	}

	/**
	 * await this in order to block until the queue stops processing
	 */
	async resumeAfterProcessing() {
		const sleep = () => new Promise(r => setTimeout(r, 100));
		while (this.workingOnID !== null) {
			await sleep();
		}
	}

	/**
	 * Queue image generation for an entity
	 * @param {number} slaveID or a unique negative value for non-slave entities
	 * @param {string} body of the post request to be sent to txt2img
	 * @param {boolean | false} isEventImage Whether to add the request to the beginning of the queue for a faster response
	 * @returns {Promise<object | null>}
	 */
	async add(slaveID, body, isEventImage = false) {
		if (this.interrupted) {
			await this.resumeAfterInterrupt();
		}

		// if an image request already exists for this ID (and ID is not zero), and it's not an event image
		if (slaveID !== null && slaveID > 0) {
			// Deduplicate requests with the same body
			const comparisonFn = ((/** @type {App.Art.GenAI.SdQueueItem} */ x) => x.body === body);
			// if identical request is currently being processed, can resolve immediately
			if (body === this.workingOnBody) {
				return null;
			}
			// if it's in the backlog queue, and the new request is also for a permanent image, pull it into the foreground queue first
			if (!isEventImage) {
				const blItem = this.backlogQueue.find(comparisonFn);
				if (blItem) {
					this.queue.push(blItem);
					this.backlogQueue.deleteAll(blItem);
				}
			}

			// if identical request is already in the queue, can resolve immediately
			const item = this.queue.find(comparisonFn);
			if (item) {
				return null;
			}
		}
		return new Promise((resolve, reject) => {
			if (isEventImage) {
				// inject event images to the beginning of the queue
				this.queue.unshift({
					slaveID: slaveID,
					body: body,
					isEventImage: isEventImage,
					resolves: [resolve],
					rejects: [reject]
				});
			} else {
				this.queue.push({
					slaveID: slaveID,
					body: body,
					isEventImage: isEventImage,
					resolves: [resolve],
					rejects: [reject]
				});
			}

			this.updateQueueCounts();

			this.process(); // do not await
		});
	}

	onPassageSwitch() {
		this.backlogQueue = [...this.queue.filter((job) => !job.isEventImage), ...this.backlogQueue];
		this.queue = [];
	}

	/**
	 * Stop processing the queue and reject everything in it.
	 */
	async interrupt() {
		if (this.interrupted) { // permit nesting and consecutive calls
			return false;
		}

		this.interrupted = true; // pause processing of the queue and don't accept further interrupts

		// reject everything in the backlog queue
		while (this.backlogQueue.length > 0) {
			const item = this.backlogQueue.pop();
			if (item) {
				item.rejects.forEach(r => r(`${item.slaveID}: Stable Diffusion fetch interrupted`));
			}
		}
		this.backlogQueue = [];

		// and also everything in the main queue
		while (this.queue.length > 0) {
			const item = this.queue.pop();
			if (item) {
				item.rejects.forEach(r => r(`${item.slaveID}: Stable Diffusion fetch interrupted`));
			}
		}
		this.queue = [];

		this.sendInterrupt();

		this.interrupted = false; // resume with next add
		return true;
	}

	sendInterrupt() {
		// tell SD to stop generating the current image
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		};
		let relative_url = V.aiUserInterface === 0 ? '/sdapi/v1/interrupt' : '/interrupt';
		fetchWithTimeout(`${V.aiApiUrl}${relative_url}`, 1000, options)
			.then(() => {
				console.log("Stable Diffusion: Interrupt Sent.");
			}).catch(() => {
				// ignore errors
			});
	}
};


// instantiate global queue
App.Art.GenAI.sdQueue = new App.Art.GenAI.StableDiffusionClientQueue();

App.Art.GenAI.StableDiffusionClient = class {
	constructor() {
		// only run this if SD image config is enabled
		if (V.imageChoice === 6) {
			this.getLoraList(false); // load the lora list for the first time. The list is reloaded each time the image options page is rendered
		}
	}

	/**
	 * @param {FC.SlaveState} slave
	 * @param {number} steps to use when generating the image
	 * @returns {Promise<InstanceType<App.Art.GenAI.StableDiffusionSettings>>}
	 */
	async buildStableDiffusionSettings(slave, steps) {
		if (V.aiUserInterface === 0) {
			const prompt = buildPrompt(slave);


// Per-character aspect override (portrait/landscape) without changing global settings.
// Useful because a portrait canvas tends to "stand up" side-lying poses to fit.
let width = V.aiWidth;
let height = V.aiHeight;
const aspectOverride = slave?.custom?.aiAspectOverride;
if (aspectOverride === "landscape" && height > width) {
	[width, height] = [height, width];
} else if (aspectOverride === "portrait" && width > height) {
	[width, height] = [height, width];
}

			// TODO: Add more config options to ADetailer, and add ReActor
			const alwaysOnScripts = {};
			if (V.aiFaceDetailer) {
				// API Docs: https://github.com/Bing-su/adetailer/wiki/API
				alwaysOnScripts.ADetailer = {
					args: [
						true, // ad_enable
						true, // skip_img2img
						{
							"ad_model": "face_yolov8s.pt",
							"ad_mask_k": 1,
							"ad_prompt": prompt.face()
						}
					]
				};
			}
			const poseFile = await App.Art.GenAI.getOpenPoseData(slave);
			if (poseFile) {
				// API Docs: https://github.com/Mikubill/sd-webui-controlnet/wiki/API#web-api
				alwaysOnScripts.controlnet = {
					args: [
						{
							"enabled": true,
							"image": poseFile,
							"module": "none",
							"model": V.aiOpenPoseModel
						}
					]
				};
			}

			if (V.aiDynamicCfgEnabled) {
				alwaysOnScripts['Dynamic Thresholding (CFG Scale Fix)'] = {
					"args": [
						true, // Enabled
						V.aiDynamicCfgMimic, // mimic scale (5-12 ish)
						100, // threshold percentile
						"Half Cosine Up", // mimic mode
						V.aiDynamicCfgMinimum, // mimic scale
						"Half Cosine Up", // cfg mode
						V.aiDynamicCfgMinimum // cfg scale
					]
				};
			}

			const settings = new App.Art.GenAI.StableDiffusionSettings({
				cfg_scale: V.aiCfgScale,
				enable_hr: V.aiUpscale,
				height: height,
				hr_upscaler: V.aiUpscaler,
				hr_scale: V.aiUpscaleScale,
				negative_prompt: prompt.negative(),
				prompt: prompt.positive(),
				sampler_name: V.aiSamplingMethod,
				scheduler: V.aiSchedulingMethod,
				seed: slave.natural.artSeed,
				steps: steps,
				width: width,
				restore_faces: V.aiRestoreFaces,
				alwayson_scripts: alwaysOnScripts,
				override_settings: {
					"always_discard_next_to_last_sigma": true,
					"sd_model_checkpoint": V.aiCheckpoint,
				},
			});
			return settings;
		} else {
			const prompt_workflow = await new App.Art.GenAI.ComfyUIWorkflow(slave, steps);

			const settings = new App.Art.GenAI.ComfyUISettings(prompt_workflow);
			return settings;
		}
	}

	/**
	 * Note the long timeout; if SD is actively rendering or loading a model it'll stop responding to API queries.
	 * Do not block on API calls.
	 * @param {string} relativeUrl
	 * @param {string} [method="GET"]
	 * @returns {Promise<Response>}
	 */
	async fetchAPIQuery(relativeUrl, method = "GET") {
		return fetchWithTimeout(`${V.aiApiUrl}${relativeUrl}`, 30000, {method: method});
	}

	/**
	 * Pings the configured SD instance
	 * @param {number} [timeout=5000] timeout in milliseconds
	 * @returns {Promise<boolean>} Returns true if we got a response within the timeout, otherwise returns false
	 */
	async ping(timeout = 5000) {
		// V.aiUserInterface: 0 = A1111; 1 = ComfyUI
		const relativeUrl = V.aiUserInterface === 0 ? "/app_id" : "";
		return fetchWithTimeout(
			`${V.aiApiUrl}${relativeUrl}`, 5000, {method: "GET"}
		).then((res) => {
			return !!res && res.status === 200;
		}).catch(err => {
			console.error(err);
			return false;
		});
	}

	/** @type {string[]} */
	#checkpointCachedList = undefined;

	/**
	 * @type {Promise<string[]>}
	 *
	 * Hack to avoid spamming the SD Server with requests
	 * */
	#checkpointLastPromise = undefined;

	/**
	 * @type {boolean}
	 *
	 * Hack to avoid spamming the SD Server with requests
	 * */
	#checkpointRequestInflight = false;

	clearCheckpointCache() {
		this.#checkpointCachedList = undefined;
	}

	/**
	 * @param {boolean} [useCached=true] if false then we will ask SD WebUI for a fresh list, otherwise we will use a cached version if available
	 * @returns {Promise<string[]>} the names of all checkpoints currently available
	 */
	async getCheckpointList(useCached = true) {
		if (this.#checkpointRequestInflight) {
			const res = await this.#checkpointLastPromise.then(
				(val) => {
					return val;
				},
				(val) => {
					console.error(val);
					return undefined;
				}
			);
			if (res !== undefined) {
				this.#checkpointRequestInflight = false;
				return res;
			}
		}
		const checkpointRequest = async () => {
			if (useCached === true && this.#checkpointCachedList !== undefined) {
				return this.#checkpointCachedList;
			}
			if (V.aiUserInterface === 0) {
				await this.fetchAPIQuery("/sdapi/v1/refresh-checkpoints", "POST");
				return this.fetchAPIQuery(`/sdapi/v1/sd-models`)
					.then((value) => {
						return value.json();
					})
					.then((list) => {
						return list.map(entry => entry.title);
					})
					.catch(err => {
						console.log(`Failed to get checkpoint list from Stable Diffusion - ${err}`);
						return [];
					});
			} else if (V.aiUserInterface === 1) {
				return this.fetchAPIQuery(`/models/checkpoints`)
					.then((value) => {
						return value.json();
					})
					.then((list) => {
						return list;
					})
					.catch(err => {
						console.log(`Failed to get checkpoint list from Stable Diffusion - ${err}`);
						return [];
					});
			}
		};
		this.#checkpointRequestInflight = true;
		this.#checkpointLastPromise = checkpointRequest();
		const res = await this.#checkpointLastPromise;
		this.#checkpointCachedList = res;
		this.#checkpointRequestInflight = false;
		return res;
	}

	/**
	 * This attempts to get the metadata for the given checkpoint.
	 * Most checkpoints don't have metadata.
	 * Returns undefined if there is no metadata or an error occurs, otherwise returns an object.
	 * @param {string} modelPath
	 * @returns {Promise<object|undefined>}
	 */
	async getCheckpointMetadata(modelPath) {
		if (V.aiUserInterface === 0) {
			modelPath = modelPath.replaceAll("\\", "/");
			if (modelPath.includes("/")) {
				modelPath = modelPath.split("/").pop();
			}
			const pathParts = modelPath.split(".");
			pathParts.pop();
			modelPath = pathParts.join(".");
			const metaURL = `/sd_extra_networks/metadata?page=checkpoints&item=${modelPath}`;
			return this.fetchAPIQuery(metaURL)
				.then((rep) => {
					if (!rep.ok) { return; }
					return rep.json();
				})
				.then((value) => {
					if ("metadata" in value) {
						if (typeof value.metadata === "string") {
							return JSON.parse(value.metadata);
						}
					}
					return;
				})
				.catch(err => {
					console.log(`Failed to get checkpoint metadata from Stable Diffusion - ${err}`);
					return;
				});
		} else if (V.aiUserInterface === 1) {
			// cSpell: disable
			const metaURL = `/view_metadata/checkpoints?filename=${encodeURIComponent(modelPath.replaceAll("\\", "/"))}`;
			// cSpell: enable
			return this.fetchAPIQuery(metaURL)
				.then((value) => {
					if (!value.ok) { return; }
					return value.json();
				})
				.catch(err => {
					console.log(`Failed to get checkpoint metadata from Stable Diffusion - ${err}`);
					return;
				});
		}
	}

	/**
	 * This attempts to narrow down the valid base models for the given checkpoint.
	 * This is a best guess and should only be used for informational purposes.
	 * Sadly some checkpoints don't have metadata and pony checkpoints are not different from SDXL in a meaningful way so we guess using the filename.
	 * [0, 1, 2] will be returned if there is no metadata in the checkpoint.
	 * pony and sdxl models will return [1, 2] (metadata) or [1]/[2] (filename guessing).
	 * SD 1.X models will return [0].
	 * @param {string} modelPath
	 * @returns {Promise<FC.GameVariables["aiBaseModel"][]>}
	 */
	async getCheckpointPotentialBaseModels(modelPath) {
		return this.getCheckpointMetadata(modelPath)
			.then((metadata) => {
				/** @type {FC.GameVariables["aiBaseModel"][]} */
				const matches = [];
				let hasUsefulMetadata = false;

				const filenameGuess = () => {
					// we are going to attempt to detect base model types based off their filenames
					if (modelPath.toLowerCase().includes("ill")) {
						// assume it is a Illustrious model
						matches.push(6);
					}
					if (modelPath.toLowerCase().includes("pony")) {
						// assume it is a pony model
						matches.push(2);
					}
					if (matches.length === 0 && modelPath.toLowerCase().includes("xl")) {
						// assume it is a SDXL model
						matches.push(1);
					}
				};

				if (metadata) {
					console.debug("checkpoint metadata:", metadata);
					if ("modelspec.architecture" in metadata) {
						hasUsefulMetadata = true;
						if (metadata["modelspec.architecture"] === "stable-diffusion-xl-v1-base") {
							// cannot be a sd 1.x model
							filenameGuess(); // but it can be some other model
						} else {
							console.error(new Error(`metadata["modelspec.architecture"] === "${metadata["modelspec.architecture"]}" was not handled in getCheckpointPotentialBaseModels`));
						}
					}
				}
				if (!hasUsefulMetadata) {
					filenameGuess();
					matches.push(0); // this may be an sd 1.x model so we add it by default
				}
				return matches;
			})
			.catch(err => {
				console.log(`Failed to get checkpoint base model from Stable Diffusion - ${err}`);
				return [0, 1, 2];
			});
	}

	/**
	 * @returns {Promise<string[]>}
	 */
	async getUpscalerList() {
		let relative_url = V.aiUserInterface === 0 ? `/sdapi/v1/upscalers` : `/object_info/UpscaleModelLoader`;
		return this.fetchAPIQuery(`${relative_url}`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				if (V.aiUserInterface === 0) {
					return list.map(o => o.name);
				} else {
					return list.UpscaleModelLoader.input.required.model_name['0'];
				}
			})
			.catch(err => {
				console.log(`Failed to get upscaler list from Stable Diffusion.`);
				return [];
			});
	}

	/**
	 * @returns {Promise<string[]>}
	 */
	async getSamplerList() {
		let relative_url = V.aiUserInterface === 0 ? `/sdapi/v1/samplers` : `/object_info/KSampler`;
		return this.fetchAPIQuery(`${relative_url}`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				if (V.aiUserInterface === 0) {
					return list.map(o => o.name);
				} else {
					return list.KSampler.input.required.sampler_name['0'];
				}
			})
			.catch(err => {
				console.log(`Failed to get sampler list from Stable Diffusion.`);
				return [];
			});
	}


	/**
	 * @returns {Promise<string[]>}
	 */
	async getSchedulerList() {
		let relative_url = V.aiUserInterface === 0 ? `/sdapi/v1/schedulers` : `/object_info/KSampler`;
		return this.fetchAPIQuery(`${relative_url}`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				if (V.aiUserInterface === 0) {
					return list.map(o => o.label);
				} else {
					return list.KSampler.input.required.scheduler['0'];
				}
			})
			.catch(err => {
				console.log(`Failed to get scheduler list from Stable Diffusion.`);
				return [];
			});
	}



	/** Gets the sysinfo
	 * @returns {Promise<{Version: string}>}
	 */
	async getSysInfo() {
		return this.fetchAPIQuery(`/internal/sysinfo`)
			.then((value) => {
				return value.json();
			})
			.catch(err => {
				console.log(`Failed to get sysinfo from Stable Diffusion.`);
				return {};
			});
	}

	/** Check to see whether a face restore model is configured.
	 * @returns {Promise<boolean>}
	 */
	async canRestoreFaces() {
		return this.fetchAPIQuery(`/sdapi/v1/face-restorers`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				return list.some(o => !!o.cmd_dir);
			})
			.catch(err => {
				console.log(`Failed to get face restorers from Stable Diffusion.`);
				return false;
			});
	}


	/** Check to see if the ADetailer script is installed. Probably should check more than that, but this'll catch the dumb cases.
	 * @returns {Promise<boolean>}
	 */
	async hasAdetailer() {
		return this.fetchAPIQuery(`/sdapi/v1/script-info`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				return list.some(o => o.name === "adetailer");
			})
			.catch(err => {
				console.log(`Failed to get script information from Stable Diffusion.`);
				return false;
			});
	}

	/** Check to see if the ControlNet script is installed.
	 * @returns {Promise<boolean>}
	 */
	async hasControlNet() {
		return this.fetchAPIQuery(`/sdapi/v1/script-info`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				return list.some(o => o.name === "controlnet");
			})
			.catch(err => {
				console.log(`Failed to get script information from Stable Diffusion.`);
				return false;
			});
	}

	/** Check to see if the OpenPose module for ControlNet is set up.
	 * @returns {Promise<boolean>}
	 */
	async _hasOpenPoseControlNetModule() {
		return this.fetchAPIQuery(`/controlnet/module_list`)
			.then((value) => {
				return value.json();
			})
			.then((obj) => {
				return obj.module_list.some(o => o === "openpose");
			})
			.catch(err => {
				console.log(`Failed to get ControlNet Module information from Stable Diffusion.`);
				return false;
			});
	}

	/** Check to see if OpenPose is fully set up.
	 * @returns {Promise<boolean>}
	 */
	async hasOpenPose() {
		const hasCN = await this.hasControlNet();
		if (hasCN) {
			return this._hasOpenPoseControlNetModule();
		} else {
			return false;
		}
	}

	/**
	 * @returns {Promise<string[]>}
	 */
	async getOpenPoseModelList() {
		return this.fetchAPIQuery(`/controlnet/control_types`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				return list.control_types.OpenPose.model_list;
			})
			.catch(err => {
				console.log(`Failed to get OpenPose model list from Stable Diffusion.`);
				return [];
			});
	}

	/**
	 * @param {string} json
	 * @returns {Promise<string>}
	 */
	async renderOpenPoseJSON(json) {
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: `[${json}]`
		};
		return fetchWithTimeout(`${V.aiApiUrl}/controlnet/render_openpose_json`, 30000, options)
			.then(value => {
				return value.json();
			})
			.then(obj => {
				if (obj.info !== "Success") {
					throw new Error(obj.info);
				}
				return obj.images[0];
			});
	}

	/** @type {string[]} */
	#loraCachedList = undefined;

	/**
	 * @type {Promise<string[]>}
	 *
	 * Hack to avoid spamming the SD Server with requests
	 * */
	#loraLastPromise = undefined;

	/**
	 * @type {boolean}
	 *
	 * Hack to avoid spamming the SD Server with requests
	 * */
	#loraRequestInflight = false;

	clearLoraCache() {
		this.#loraCachedList = undefined;
	}

	/**
	 * @param {boolean} [useCached=true] if false then we will ask SD WebUI for a fresh list, otherwise we will use a cached version if available
	 * @returns {Promise<string[]>} the names of all LoRAs currently available, we use internal names by default, falling back to filenames if there is no internal name
	 */
	async getLoraList(useCached = true) {
		if (this.#loraRequestInflight) {
			const res = await this.#loraLastPromise.then(
				(val) => {
					return val;
				},
				(val) => {
					console.error(val);
					return undefined;
				}
			);
			if (res !== undefined) {
				this.#loraRequestInflight = false;
				return res;
			}
		}
		const loraRequest = async () => {
			if (useCached === true && this.#loraCachedList !== undefined) {
				return (!V.aiLoraPack) ? [] : this.#loraCachedList;
			}
			if (V.aiUserInterface === 0) {
				// cSpell: disable
				await this.fetchAPIQuery(`/sdapi/v1/refresh-loras`, "POST"); // Ask SD to update it's list of LoRAs to reflect what is in storage
				// cSpell: enable
			}
			// cSpell: disable
			let relative_url = V.aiUserInterface === 0 ? `/sdapi/v1/loras` : `/models/loras`;
			// cSpell: enable
			/** @type {string[]} */
			let comfyLoraPaths = [];
			/** @type {string[]} */
			let list = await this.fetchAPIQuery(`${relative_url}`)
				.then(
					(value) => { return value.json(); },
					(val) => {
						console.error(val);
						return [];
					}
				)
				.then(
					(list) => {
						let entries = [];
						if (V.aiUserInterface === 0) {
							list.forEach((item) => {
								if ("alias" in item && !entries.includes(item.alias) && item.alias !== "None") {
									// the internal name or the filename without extension if no internal name exists
									entries.push(item.alias);
								} else if ("name" in item && !entries.includes(item.name)) {
									// the filename without extension
									entries.push(item.name);
								}
							});
						} else {
							list.forEach((item) => {
								// add the paths to a list for more processing later
								// we do this because we cannot await inside an existing await
								comfyLoraPaths.push(item);
							});
						}
						return entries;
					},
					(val) => {
						console.error(val);
						return [];
					}
				);
			const addComfyPath = (path) => {
				const item = path.match(/([^\\/]+)\./)[1];
				if (!list.includes(item)) {
					// push filename
					list.push(item);
				}
			};
			for (const path of comfyLoraPaths) {
				// get internal names of LoRAs in ComfyUI
				// cSpell: disable
				const metaURL = `/view_metadata/loras?filename=${encodeURIComponent(path.replaceAll("\\", "/"))}`;
				// cSpell: enable
				try {
					await this.fetchAPIQuery(metaURL)
						.then((value) => { return value.json(); })
						.then((metadata) => {
							if (!metadata || typeof metadata !== "object") {
								// console.debug(`getLoraList(): Failed to get metadata object for "${metaURL}"`);
								addComfyPath(path);
								return;
							}
							if (!("ss_output_name" in metadata)) {
								// console.debug(`getLoraList(): Failed to get 'ss_output_name' for "${metaURL}"`);
								addComfyPath(path);
								return;
							}
							if (
								typeof metadata.ss_output_name === "string" &&
								metadata.ss_output_name.trim() !== "" &&
								metadata.ss_output_name.trim() !== "None" &&
								!list.includes(metadata.ss_output_name.trim())
							) {
								// push internal name
								list.push(metadata.ss_output_name.trim());
							} else {
								addComfyPath(path);
							}
						});
				} catch {
					// console.debug(`getLoraList(): Failed to get metadata for "${metaURL}"`);
					addComfyPath(path);
				}
			}
			this.#loraCachedList = list;
			if (V.debugMode) {
				console.debug("Available LoRAs", list);
			}
			return (!V.aiLoraPack) ? [] : list;
		};
		this.#loraRequestInflight = true;
		this.#loraLastPromise = loraRequest();
		const res = await this.#loraLastPromise;
		this.#loraRequestInflight = false;
		return res;
	}

	/**
	 * @param {InternalLoraName} loraKey The name of the lora to check for as defined in {@link App.Art.GenAI.UI.Options.recommendedLoRAs}
	 * @returns {boolean} returns true if the lora name is a valid lora for the given base model and it is available for use
	 */
	hasLora(loraKey) {
		if (this.#loraCachedList === undefined) {
			// this shouldn't happen, but if it does
			// call getLoraList, but don't wait for it to return
			this.getLoraList();
			// and return false
			return false;
			// this means that the rendering prompt will potentially be wrong this time around, but it allows us to use `hasLora` without async
		}
		if (!V.aiLoraPack) {
			return false; // LoRAs are disabled
		}
		if (V.aiDisabledLoRAs.includes(loraKey)) {
			return false; // this LoRA is disabled
		}
		/** @type {RecommendedLora} */
		const lora = App.Art.GenAI.UI.Options.recommendedLoRAs.get(loraKey);
		if (lora) {
			if (!lora.baseModel.includes(V.aiBaseModel)) {
				return false; // This lora isn't valid for the selected base model
			}
		} else {
			console.error(new Error(`"${loraKey}" is missing from App.Art.GenAI.UI.Options.recommendedLoRAs`));
			// This lora isn't in App.Art.GenAI.UI.Options.recommendedLoRAs, but we let things continue anyways
		}
		return (this.#loraCachedList.includes(loraKey));
	}

	/**
	 * @returns {Promise<boolean>}
	 */
	async hasImpactPack() {
		return this.fetchAPIQuery(`/extensions`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				return list.some(o => o.match("ComfyUI-Impact-Pack"));
			})
			.catch(err => {
				console.log(`Failed to get Impact-Pack extension from ComfyUI.`);
				return false;
			});
	}

	/**
	 * @returns {Promise<boolean>}
	 */
	async hasDynamicThresholding() {
		return this.fetchAPIQuery(`/models/custom_nodes`)// this route can be extremely taxing, esp with a lot of extensions ideally this could be replaced before we use this check
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				return list.some(o => o === "sd-dynamic-thresholding");
			})
			.catch(err => {
				console.log(`Failed to get dynamic-cfg extension from ComfyUI.`);
				return false;
			});
	}

	/**
	 * @returns {Promise<boolean>}
	 */
	async hasRGThreeComfy() {
		return this.fetchAPIQuery(`/extensions`)
			.then((value) => {
				return value.json();
			})
			.then((list) => {
				return list.some(o => o.match("rgthree-comfy"));
			})
			.catch(err => {
				console.log(`Failed to get RGThree-Comfy extension from ComfyUI.`);
				return false;
			});
	}
};

App.Art.GenAI.sdClient = new App.Art.GenAI.StableDiffusionClient();


/**
 * Determines whether the current passage has the "temporary-images" tag
 * @returns {boolean}
 */
function isTemporaryImage() {
	return $(`[data-tags*=temporary-images]`).length > 0;
}


App.Art.GenAI.StaticCaching = class {
	/**
	 * @param {FC.SlaveState} slave
	 * @param {boolean | null} isEventImage - Whether request is canceled on passage change and which step setting to use. true => V.aiSamplingStepsEvent, false => V.aiSamplingSteps, null => chosen based on passage tags
	 * @returns {Promise<string | null>} - Base 64 encoded image (could be a jpeg, png, or webp)
	 */
	async fetchImageForSlave(slave, isEventImage = null) {
		let steps = V.aiSamplingSteps;
		// always render owned slaves at full steps and without the passageSwitchHandler.  This allows the player to queue updates for slave images during events.
		if (globalThis.getSlave(slave.ID)) {
			isEventImage = false;
		}
		if (isEventImage === null) {
			isEventImage = isTemporaryImage();
		}
		if (isEventImage === true) {
			steps = V.aiSamplingStepsEvent;
		}

		let settingsSlave = slave;
		if (V.aiUseRAForEvents && isEventImage) {
			settingsSlave = structuredClone(slave);
			DefaultRules(settingsSlave, {aiPromptsOnly: true});
		}
		const settings = await App.Art.GenAI.sdClient.buildStableDiffusionSettings(settingsSlave, steps);
		const body = JSON.stringify(settings);
		// set up a passage switch handler to clear queued generation of event and temporary images upon passage change
		const oldHandler = App.Utils.PassageSwitchHandler.get();
		if (isEventImage || isTemporaryImage()) {
			App.Utils.PassageSwitchHandler.set(() => {
				// find where this request is in the queue
				let rIndex = App.Art.GenAI.sdQueue.queue.findIndex(r => r.slaveID === slave.ID && r.body === body);
				if (rIndex > -1) {
					const rejects = App.Art.GenAI.sdQueue.queue[rIndex].rejects;
					// remove request from the queue as soon as possible
					App.Art.GenAI.sdQueue.queue.splice(rIndex, 1);
					// reject the associated promises
					rejects.forEach(r => r(`${slave.ID} (Event): Stable Diffusion fetch interrupted`));
				} else if (App.Art.GenAI.sdQueue.workingOnID === slave.ID) {
					// if this request is already in progress, send interrupt request
					App.Art.GenAI.sdQueue.sendInterrupt();
				}
				App.Art.GenAI.sdQueue.onPassageSwitch();
				if (oldHandler) {
					oldHandler();
				}
			});
		} else {
			const oldHandler = App.Utils.PassageSwitchHandler.get();
			App.Utils.PassageSwitchHandler.set(() => {
				App.Art.GenAI.sdQueue.onPassageSwitch();
				if (oldHandler) {
					oldHandler();
				}
			});
		}

		const response = await App.Art.GenAI.sdQueue.add(slave.ID, body, isEventImage);
		return response?.images?.[0] || null;
	}

	/**
	 * Update a slave object with a new image
	 * @param {FC.SlaveState} slave - The slave to update
	 * @param {number | null} replacementImageIndex - If provided, replace the image at this index
	 * @param {boolean | null} isEventImage - Whether request is canceled on passage change and which step setting to use. true => V.aiSamplingStepsEvent, false => V.aiSamplingSteps, null => chosen based on passage tags
	 * @returns {FC.PromiseWithProgress<void>}
	 */
	updateSlave(slave, replacementImageIndex = null, isEventImage = null) {
		const progressFns = [];
		const result = Object.assign(
			new Promise((resolve, reject) => {
				(async () => {
					const base64Image = await this.fetchImageForSlave(slave, isEventImage);
					if (base64Image === null) {
						console.log('Image already present in queue, skipping');
						return;
					}
					const imageData = getImageData(base64Image);
					const imagePreexisting = await compareExistingImages(slave, imageData);
					if (!isEventImage) {
						let vSlave = getSlave(slave.ID);
						// if `slave` is owned but the variable has become detached from the main slave pool, save the image changes to the main slave pool instead
						// but don't do it for temporary images because they might be intentionally using a copy of a slave for temporary changes
						if (vSlave && slave !== vSlave) {
							slave = vSlave;
						}
					}
					// If new image, add or replace it in
					if (imagePreexisting === -1) {
						const imageId = await App.Art.GenAI.staticImageDB.putImage({data: imageData, week: V.week});
						if (replacementImageIndex !== null) {
							await App.Art.GenAI.staticImageDB.removeImage(slave.custom.aiImageIds[replacementImageIndex]);
							slave.custom.aiImageIds[replacementImageIndex] = imageId;
						} else {
							slave.custom.aiImageIds.push(imageId);
							slave.custom.aiDisplayImageIdx = slave.custom.aiImageIds.indexOf(imageId);
						}
						// If image already exists, just update the display idx to it
					} else {
						console.log('Generated redundant image, no image stored');
						slave.custom.aiDisplayImageIdx = imagePreexisting;
					}
				})().then(resolve).catch(reject);
			}), {
			/**
			 * Do something when there's progress on generating an image
			 * @param {(progress: number) => void} fn A function to call when there's progress
			 * @returns {FC.PromiseWithProgress<void>}
			 */
				onProgress(fn) {
					progressFns.push(fn);
					return result;
				}
			}
		);

		const interval = setInterval(async () => {
			if (App.Art.GenAI.sdQueue.workingOnID === slave.ID) {
				if (V.aiUserInterface === 0) {
					const response = await fetch(`${V.aiApiUrl}/sdapi/v1/progress?skip_current_image=true`, {
						method: 'GET',
						headers: [
							['accept', 'application/json'],
						],
					});
					const progress = (await response.json()).progress;
					progressFns.forEach((fn) => fn(progress));
				}
			}
		}, 1000);
		result.finally(() => {
			clearInterval(interval);
			progressFns.forEach((fn) => fn(1));
		});

		return result;
	}

	/**
	 * @param {number[]} usedImageIds
	 * @returns {Promise<number>} - Count of unused images cleaned
	 */
	async cleanUnusedImages(usedImageIds) {
		const idx = await App.Art.GenAI.staticImageDB.getIndexesList();
		let count = 0;
		await Promise.all(idx.map(async id => {
			if (!usedImageIds.includes(id)) {
				await App.Art.GenAI.staticImageDB.removeImage(id).then(() => count++);
			}
		}));
		return count;
	}
};

App.Art.GenAI.staticCache = new App.Art.GenAI.StaticCaching();



App.Art.GenAI.ReactiveCaching = class {
	/**
	 * @param {FC.SlaveState} slave
	 * @param {boolean | null} isEventImage - Whether request is canceled on passage change and which step setting to use. true => V.aiSamplingStepsEvent, false => V.aiSamplingSteps, null => chosen based on passage tags
	 * @returns {Promise<string>} - Base 64 encoded image (could be a jpeg, png, or webp)
	 */
	async fetchImageForSlave(slave, isEventImage = null) {
		let steps = V.aiSamplingSteps;
		// always render owned slaves at full steps and without the passageSwitchHandler.  This allows the player to queue updates for slave images during events.
		if (globalThis.getSlave(slave.ID)) {
			isEventImage = false;
		}
		if (isEventImage === null) {
			isEventImage = isTemporaryImage();
		}
		if (isEventImage === true) {
			steps = V.aiSamplingStepsEvent;
		}

		let settingsSlave = slave;
		if (V.aiUseRAForEvents && isEventImage) {
			settingsSlave = structuredClone(slave);
			DefaultRules(settingsSlave, {aiPromptsOnly: true});
		}
		const settings = await App.Art.GenAI.sdClient.buildStableDiffusionSettings(settingsSlave, steps);
		const body = JSON.stringify(settings);
		// set up a passage switch handler to clear queued generation of event and temporary images upon passage change
		const oldHandler = App.Utils.PassageSwitchHandler.get();
		if (isEventImage || isTemporaryImage()) {
			App.Utils.PassageSwitchHandler.set(() => {
				// find where this request is in the queue
				const rIndex = App.Art.GenAI.sdQueue.queue.findIndex(r => r.slaveID === slave.ID && r.body === body);
				if (rIndex > -1) {
					const rejects = App.Art.GenAI.sdQueue.queue[rIndex].rejects;
					// remove request from the queue as soon as possible
					App.Art.GenAI.sdQueue.queue.splice(rIndex, 1);
					// reject the associated promises
					rejects.forEach(r => r(`${slave.ID} (Event): Stable Diffusion fetch interrupted`));
				} else if (App.Art.GenAI.sdQueue.workingOnID === slave.ID) {
					// if this request is already in progress, send interrupt request
					App.Art.GenAI.sdQueue.sendInterrupt();
				}
				App.Art.GenAI.sdQueue.onPassageSwitch();
				if (oldHandler) {
					oldHandler();
				}
			});
		} else {
			const oldHandler = App.Utils.PassageSwitchHandler.get();
			App.Utils.PassageSwitchHandler.set(() => {
				App.Art.GenAI.sdQueue.onPassageSwitch();
				if (oldHandler) {
					oldHandler();
				}
			});
		}

		const response = await App.Art.GenAI.sdQueue.add(slave.ID, body, isEventImage);
		return response?.images?.[0] || null;
	}

	/**
	 * Update a slave object with a new image
	 * @param {FC.SlaveState} slave - The slave to update
	 * @param {number | null} replacementImageIndex - If provided, replace the image at this index
	 * @param {boolean | null} isEventImage - Whether request is canceled on passage change and which step setting to use. true => V.aiSamplingStepsEvent, false => V.aiSamplingSteps, null => chosen based on passage tags
	 */
	async updateSlave(slave, replacementImageIndex = null, isEventImage = null) {
		const base64Image = await this.fetchImageForSlave(slave, isEventImage);
		if (base64Image === null) {
			console.log('Image already present in queue, skipping');
			return;
		}
		const imageData = getImageData(base64Image);
		const imagePreexisting = await compareExistingImages(slave, imageData);
		const vSlave = getSlave(slave.ID);
		// if `slave` is owned but the variable has become detached from the main slave pool, save the image changes to the main slave pool instead
		if (vSlave && slave !== vSlave) {
			slave = vSlave;
		}
		// If new image, add or replace it in
		if (imagePreexisting === -1) {
			const imageId = await App.Art.GenAI.reactiveImageDB.putImage({data: imageData});
			if (replacementImageIndex !== null) {
				await App.Art.GenAI.reactiveImageDB.removeImage(slave.custom.aiImageIds[replacementImageIndex]);
				slave.custom.aiImageIds[replacementImageIndex] = imageId;
			} else {
				slave.custom.aiImageIds.push(imageId);
				slave.custom.aiDisplayImageIdx = slave.custom.aiImageIds.indexOf(imageId);
			}
			// If image already exists, just update the display idx to it
		} else {
			console.log('Generated redundant image, no image stored');
			slave.custom.aiDisplayImageIdx = imagePreexisting;
		}
	}
};

App.Art.GenAI.reactiveCache = new App.Art.GenAI.ReactiveCaching();




/**
 * Search slave's existing images for a match with the new image.
 * @param {FC.HumanState} slave - The slave we're updating
 * @param {string} newImageData - new image
 * @returns {Promise<number>} index of the image in aiImageIds or -1
 */
async function compareExistingImages(slave, newImageData) {
	const aiImages = await Promise.all(
		slave.custom.aiImageIds.map(id =>
			App.Art.GenAI.staticImageDB.getImage(id)
				.catch(() => null)  // Return null if the image is not found or there's an error
		)
	);

	return aiImages.findIndex(img => img && img.data === newImageData);
}

/**
 * Add mime type to a base64 encoded image
 * @param {string} base64Image
 * @returns {string} data string
 */
function getImageData(base64Image) {
	if (V.aiUserInterface === 1) {
		return base64Image;
	}
	const mimeType = getMimeType(base64Image);
	return `data:${mimeType};base64,${base64Image}`;
}

/**
 * @param {string} base64Image
 * @returns {string}
 */
function getMimeType(base64Image) {
	const jpegCheck = "/9j/";
	const pngCheck = "iVBOR";
	const webpCheck = "UklGR";

	if (base64Image.startsWith(jpegCheck)) {
		return "image/jpeg";
	} else if (base64Image.startsWith(pngCheck)) {
		return "image/png";
	} else if (base64Image.startsWith(webpCheck)) {
		return "image/webp";
	} else {
		return "unknown";
	}
}
