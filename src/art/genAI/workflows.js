/* eslint-disable camelcase */

App.Art.GenAI.ComfyUIWorkflow = class {
	constructor(slave, steps) {
		const prompt = buildPrompt(slave);

		// @ts-ignore
		return this.buildWorkflow(prompt, slave, steps);
	}

	async buildSimpleWorkflow(prompt, slave, steps) {
		const hasRGThreeComfy = App.Art.GenAI.sdClient.hasRGThreeComfy();

		let promptWorkflow = {
			1: {
				inputs: {
					ckpt_name: V.aiCheckpoint,
				},
				class_type: "CheckpointLoaderSimple",
				_meta: {
					title: "Load Checkpoint",
				},
			},
			2: {
				inputs: {
					stop_at_clip_layer: -2,
					clip: ["1", 1],
				},
				class_type: "CLIPSetLastLayer",
				_meta: {
					title: "CLIP Set Last Layer",
				},
			},
			3: {
				inputs: {
					width: V.aiWidth,
					height: V.aiHeight,
					batch_size: 1,
				},
				class_type: "EmptyLatentImage",
				_meta: {
					title: "Empty Latent Image",
				},
			},
			4: {
				inputs: {
					text: prompt.positive(),
					clip: ["2", 0],
				},
				class_type: "CLIPTextEncode",
				_meta: {
					title: "CLIP Text Encode (Positive Prompt)",
				},
			},
			5: {
				inputs: {
					text: prompt.negative(),
					clip: ["2", 0],
				},
				class_type: "CLIPTextEncode",
				_meta: {
					title: "CLIP Text Encode (Negative Prompt)",
				},
			},
			6: {
				inputs: {
					seed: slave.natural.artSeed,
					steps: steps,
					cfg: V.aiCfgScale,
					sampler_name: V.aiSamplingMethod,
					scheduler: V.aiSchedulingMethod,
					denoise: 1,
					model: ["1", 0],
					positive: ["4", 0],
					negative: ["5", 0],
					latent_image: ["3", 0],
				},
				class_type: "KSampler",
				_meta: {
					title: "KSampler",
				},
			},
			7: {
				inputs: {
					samples: ["6", 0],
					vae: ["1", 2],
				},
				class_type: "VAEDecode",
				_meta: {
					title: "VAE Decode",
				},
			},
			9: {
				inputs: {
					images: ["7", 0],
				},
				class_type: "SaveImageWebsocket",
				_meta: {
					title: "SaveImageWebsocket",
				},
			},
		};

		if (hasRGThreeComfy) {
			promptWorkflow["4"] = {
				// @ts-ignore
				inputs: {
					prompt: prompt.positive(),
					insert_lora: "CHOOSE",
					insert_embedding: "CHOOSE",
					opt_model: ["1", 0],
					opt_clip: ["2", 0],
				},
				class_type: "Power Prompt (rgthree)",
				_meta: {
					title: "Power Prompt (rgthree)",
				},
			};

			promptWorkflow["5"] = {
				// @ts-ignore
				inputs: {
					prompt: prompt.negative(),
					insert_embedding: "CHOOSE",
					opt_clip: ["2", 0],
				},
				class_type: "Power Prompt - Simple (rgthree)",
				_meta: {
					title: "Power Prompt - Simple (rgthree)",
				},
			};

			promptWorkflow["6"].inputs.model = ["4", 1];
		}

		if (V.aiDynamicCfgEnabled) {
			promptWorkflow[10] = {
				inputs: {
					mimic_scale: V.aiDynamicCfgMimic,
					threshold_percentile: 1,
					mimic_mode: "Half Cosine Up",
					mimic_scale_min: V.aiDynamicCfgMinimum,
					cfg_mode: "Half Cosine Up",
					cfg_scale_min: V.aiDynamicCfgMinimum,
					sched_val: 1,
					separate_feature_channels: "enable",
					scaling_startpoint: "MEAN",
					variability_measure: "AD",
					interpolate_phi: 1,
					model: hasRGThreeComfy ? ["4", 1] : ["1", 0],
				},
				class_type: "DynamicThresholdingFull",
				_meta: {
					title: "DynamicThresholdingFull",
				},
			};
			promptWorkflow["6"].inputs.model = ["10", 0];
		}

		if (V.aiFaceDetailer) {
			promptWorkflow[30] = {
				inputs: {
					guide_size: 512,
					guide_size_for: true,
					max_size: 1024,
					seed: slave.natural.artSeed,
					steps: Math.ceil(steps / 4),
					cfg: V.aiCfgScale,
					sampler_name: V.aiSamplingMethod,
					scheduler: V.aiSchedulingMethod,
					denoise: 0.4,
					feather: 5,
					noise_mask: true,
					force_inpaint: true,
					bbox_threshold: 0.5,
					bbox_dilation: 10,
					bbox_crop_factor: 3,
					sam_detection_hint: "center-1",
					sam_dilation: 0,
					sam_threshold: 0.93,
					sam_bbox_expansion: 0,
					sam_mask_hint_threshold: 0.7,
					sam_mask_hint_use_negative: "False",
					drop_size: 10,
					wildcard: "",
					cycle: 1,
					inpaint_model: false,
					noise_mask_feather: 20,
					image: ["7", 0],
					model: ["1", 0],
					clip: ["2", 0],
					vae: ["1", 2],
					positive: ["28", 0],
					negative: ["5", 0],
					bbox_detector: ["29", 0],
				},
				class_type: "FaceDetailer",
				_meta: {
					title: "FaceDetailer",
				},
			};
			promptWorkflow[29] = {
				inputs: {
					model_name: "bbox/face_yolov8m.pt",
				},
				class_type: "UltralyticsDetectorProvider",
				_meta: {
					title: "UltralyticsDetectorProvider",
				},
			};
			promptWorkflow[28] = {
				inputs: {
					text: prompt.face(),
					clip: ["2", 0],
				},
				class_type: "CLIPTextEncode",
				_meta: {
					title: "CLIP Text Encode (Face Prompt)",
				},
			};

			promptWorkflow["9"].inputs.images[0] = "30";
			if (hasRGThreeComfy) {
				promptWorkflow["8"] = {
					inputs: {
						prompt: prompt.face(),
						insert_lora: "CHOOSE",
						insert_embedding: "CHOOSE",
						opt_model: ["1", 0],
						opt_clip: ["2", 0],
					},
					class_type: "Power Prompt (rgthree)",
					_meta: {
						title: "Power Prompt (rgthree)",
					},
				};
				promptWorkflow[30].inputs.model = ["8", 1];
				promptWorkflow[30].inputs.clip = ["8", 2];
				promptWorkflow[30].inputs.positive = ["8", 0];
			}
			if (V.aiDynamicCfgEnabled) {
				promptWorkflow[30].inputs.model = ["10", 0];
			}
		}

		if (V.aiUpscale) {
			if (!V.aiUpscaler.endsWith(".pth")) {
				V.aiUpscaler = V.aiUpscaler.concat(".pth");
			}
			promptWorkflow[48] = {
				inputs: {
					model_name: V.aiUpscaler,
				},
				class_type: "UpscaleModelLoader",
				_meta: {
					title: "Load Upscale Model",
				},
			};
			promptWorkflow[49] = {
				inputs: {
					upscale_model: ["48", 0],
					image: [V.aiFaceDetailer ? "30" : "7", 0],
				},
				class_type: "ImageUpscaleWithModel",
				_meta: {
					title: "Upscale Image (using Model)",
				},
			};
			promptWorkflow[50] = {
				inputs: {
					upscale_method: "area",
					width: V.aiWidth * V.aiUpscaleScale,
					height: V.aiHeight * V.aiUpscaleScale,
					crop: "disabled",
					image: ["49", 0],
				},
				class_type: "ImageScale",
				_meta: {
					title: "Upscale Image",
				},
			};
			promptWorkflow["9"].inputs.images[0] = "50";
		}
		return promptWorkflow;
	}

	buildPonyWorkflow(prompt, slave) {
		let loraStackOutput = "";

		try {
			let loraStackInput = JSON.parse(V.aiPonyLoraStack);

			let i = 0;
			for (let [key, value] of Object.entries(loraStackInput)) {
				i++;
				loraStackOutput +=
					`"lora_${i}": {"on": true, "lora": "` +
					key +
					`", "strength": ` +
					value +
					`},`;
			}
		} catch (error) {
			loraStackOutput = `
						"lora_1": {
							"on": true,
							"lora": "Styles\\Concept Art DarkSide Style LoRA_Pony XL v6.safetensors",
							"strength": 0.5
						},
						"lora_2": {
							"on": true,
							"lora": "Styles\\Digital Art Style SDXL_LoRA_Pony Diffusion V6 XL.safetensors",
							"strength": 0.2
						},
						"lora_3": {
							"on": true,
							"lora": "Styles\\Photo 2 Style SDXL_LoRA_Pony Diffusion V6 XL.safetensors",
							"strength": 0.2
						}
						`;
		}

		let ponyCheckpoint = V.aiPonyTurbo
			? "ponyDiffusionV6XL_v6TurboMerge.safetensors"
			: V.aiCheckpoint;
		let ponySamplerName = V.aiPonyTurbo ? "dpmpp_sde_gpu" : "ipndm_v";
		let ponySamplerSteps = V.aiPonyTurbo ? 8 : 20;
		let ponySCFG = V.aiPonyTurbo ? 3 : 5;

		// flow controls for hiRes and Face Detailer passes
		let hiResPass = V.aiUpscale ? "19" : "17";
		let faceDetailPass = V.aiFaceDetailer ? "28" : "20";

		let promptWorkflow = {
			1: {
				inputs: {
					ckpt_name: ponyCheckpoint,
				},
				class_type: "CheckpointLoaderSimple",
				_meta: {
					title: "Load Checkpoint",
				},
			},
			2: {
				inputs: {
					PowerLoraLoaderHeaderWidget: {
						type: "PowerLoraLoaderHeaderWidget",
					},
					loraStackOutput,
					"➕ Add Lora": "",
					model: ["8", 0],
					clip: ["1", 1],
				},
				class_type: "Power Lora Loader (rgthree)",
				_meta: {
					title: "Art Style",
				},
			},
			3: {
				inputs: {
					seed: slave?.natural.artSeed,
				},
				class_type: "Seed (rgthree)",
				_meta: {
					title: "Seed",
				},
			},
			4: {
				inputs: {
					text: "score_9, score_8_up, score_7_up",
				},
				class_type: "Text Multiline",
				_meta: {
					title: "High Quality Preset",
				},
			},
			5: {
				inputs: {
					delimiter: ", ",
					clean_whitespace: "true",
					text_a: ["4", 0],
					text_b: ["6", 0],
				},
				class_type: "Text Concatenate",
				_meta: {
					title: "Preset Concat",
				},
			},
			6: {
				inputs: {
					text: "BREAK",
				},
				class_type: "Text Multiline",
				_meta: {
					title: "Preset Break",
				},
			},
			7: {
				inputs: {
					text: ["5", 0],
					clip: ["2", 1],
				},
				class_type: "CLIPTextEncode",
				_meta: {
					title: "Preset Encode",
				},
			},
			8: {
				inputs: {
					Skimming_CFG: ponySCFG,
					model: ["1", 0],
				},
				class_type: "Skimmed CFG - linear interpolation",
				_meta: {
					title: "S-CFG",
				},
			},
			9: {
				inputs: {
					width: V.aiWidth,
					height: V.aiHeight,
					batch_size: 1,
				},
				class_type: "EmptyLatentImage",
				_meta: {
					title: "Empty Latent Image",
				},
			},
			10: {
				inputs: {
					steps_total: ponySamplerSteps,
					refiner_step: 3,
					cfg: V.aiCfgScale,
					sampler_name: ponySamplerName,
					scheduler: "karras",
				},
				class_type: "KSampler Config (rgthree)",
				_meta: {
					title: "KSampler Config",
				},
			},
			11: {
				inputs: {
					op: "Add",
					a: ["10", 2],
					b: 2,
				},
				class_type: "CM_FloatBinaryOperation",
				_meta: {
					title: "SamplerCFGMod",
				},
			},
			12: {
				inputs: {
					scheduler: ["10", 4],
					extra_scheduler: "AYS SDXL",
				},
				class_type: "ImpactSchedulerAdapter",
				_meta: {
					title: "Scheduler Config",
				},
			},
			13: {
				inputs: {
					conditioning1: ["7", 0],
					conditioning2: ["14", 0],
				},
				class_type: "ImpactConcatConditionings",
				_meta: {
					title: "Conditioning Concat",
				},
			},
			14: {
				inputs: {
					text: prompt.positive(),
					clip: ["2", 1],
				},
				class_type: "CLIPTextEncode",
				_meta: {
					title: "Positive Prompt",
				},
			},
			15: {
				inputs: {
					text: prompt.negative(),
					clip: ["2", 1],
				},
				class_type: "CLIPTextEncode",
				_meta: {
					title: "Negative Prompt",
				},
			},
			16: {
				inputs: {
					model: ["2", 0],
					clip: ["2", 1],
					vae: ["1", 2],
					positive: ["13", 0],
					negative: ["15", 0],
				},
				class_type: "ToBasicPipe",
				_meta: {
					title: "ToBasicPipe",
				},
			},
			17: {
				inputs: {
					seed: ["3", 0],
					steps: ["10", 0],
					cfg: ["10", 2],
					sampler_name: ["10", 3],
					scheduler: ["12", 0],
					denoise: 1,
					basic_pipe: ["16", 0],
					latent_image: ["9", 0],
				},
				class_type: "ImpactKSamplerBasicPipe",
				_meta: {
					title: "KSampler",
				},
			},
			18: {
				inputs: {
					version: "SDXL",
					upscale: 1.5,
					latent: ["17", 1],
				},
				class_type: "NNLatentUpscale",
				_meta: {
					title: "NNLatentUpscale",
				},
			},
			19: {
				inputs: {
					add_noise: true,
					noise_seed: ["3", 0],
					steps: ["10", 0],
					cfg: ["11", 0],
					sampler_name: ["10", 3],
					scheduler: ["12", 0],
					start_at_step: ["10", 1],
					end_at_step: ["10", 0],
					return_with_leftover_noise: false,
					basic_pipe: ["24", 0],
					latent_image: ["18", 0],
				},
				class_type: "ImpactKSamplerAdvancedBasicPipe",
				_meta: {
					title: "KSampler 2",
				},
			},
			20: {
				inputs: {
					samples: [hiResPass, 1],
					vae: [hiResPass, 2],
				},
				class_type: "VAEDecode",
				_meta: {
					title: "VAE Decode",
				},
			},
			21: {
				inputs: {
					images: [faceDetailPass, 0],
				},
				class_type: "SaveImageWebsocket",
				_meta: {
					title: "SaveImageWebsocket",
				},
			},
			22: {
				inputs: {
					text: prompt.detailer(),
					clip: ["2", 1],
				},
				class_type: "CLIPTextEncode",
				_meta: {
					title: "High Res Prompt",
				},
			},
			23: {
				inputs: {
					conditioning1: ["7", 0],
					conditioning2: ["22", 0],
					conditioning3: ["13", 0],
				},
				class_type: "ImpactConcatConditionings",
				_meta: {
					title: "Conditioning Concat",
				},
			},
			24: {
				inputs: {
					basic_pipe: ["17", 0],
					positive: ["23", 0],
				},
				class_type: "EditBasicPipe",
				_meta: {
					title: "Edit BasicPipe",
				},
			},
			25: {
				inputs: {
					bbox_threshold: 0.5,
					bbox_dilation: 0,
					crop_factor: 3,
					drop_size: 10,
					sub_threshold: 0.5,
					sub_dilation: 0,
					sub_bbox_expansion: 0,
					sam_mask_hint_threshold: 0.7,
					post_dilation: 0,
					bbox_detector: ["26", 0],
					image: ["20", 0],
					sam_model_opt: ["27", 0],
				},
				class_type: "ImpactSimpleDetectorSEGS",
				_meta: {
					title: "Face Detector",
				},
			},
			26: {
				inputs: {
					model_name: "bbox/face_yolov8m.pt",
				},
				class_type: "UltralyticsDetectorProvider",
				_meta: {
					title: "Face BBox",
				},
			},
			27: {
				inputs: {
					model_name: "sam_vit_b_01ec64.pth",
					device_mode: "AUTO",
				},
				class_type: "SAMLoader",
				_meta: {
					title: "SAM Loader",
				},
			},
			28: {
				inputs: {
					guide_size: 512,
					guide_size_for: true,
					max_size: 1024,
					seed: ["3", 0],
					steps: ["10", 0],
					cfg: ["10", 2],
					sampler_name: ["10", 3],
					scheduler: ["12", 0],
					denoise: 0.5,
					feather: 5,
					noise_mask: true,
					force_inpaint: true,
					wildcard: "",
					refiner_ratio: 0.2,
					cycle: 1,
					inpaint_model: false,
					noise_mask_feather: 20,
					image: ["20", 0],
					segs: ["25", 0],
					basic_pipe: ["29", 0],
				},
				class_type: "DetailerForEachPipe",
				_meta: {
					title: "Face Detailer",
				},
			},
			29: {
				inputs: {
					basic_pipe: [hiResPass, 0],
					positive: ["31", 0],
				},
				class_type: "EditBasicPipe",
				_meta: {
					title: "Edit BasicPipe",
				},
			},
			30: {
				inputs: {
					text: prompt.face(),
					clip: ["2", 1],
				},
				class_type: "CLIPTextEncode",
				_meta: {
					title: "Face Prompt",
				},
			},
			31: {
				inputs: {
					conditioning1: ["7", 0],
					conditioning2: ["30", 0],
					conditioning3: ["22", 0],
					conditioning4: ["13", 0],
				},
				class_type: "ImpactConcatConditionings",
				_meta: {
					title: "Conditioning Concat",
				},
			},
		};

		return promptWorkflow;
	}

	async buildCustomWorkflow(prompt, slave) {
		let workflowName = V.aiCustomWorkflow;
		if (!workflowName.endsWith(".json")) {
			workflowName = workflowName.concat(".json");
		}

		let promptWorkflow = await fetch(`resources/workflows/${workflowName}`)
			.then((workflow) => {
				return workflow.json();
			})
			.then((val) => {
				return val;
			})
			.catch((err) => {
				throw Error(`Couldn't fetch workflow file - ${err}`);
			});

		const prompt_parts = {
			"positive prompt": prompt.positive(),
			"negative prompt": prompt.negative(),
			"detailer prompt": prompt.detailer(),
			"face prompt": prompt.face(),
			seed: slave.natural.artSeed,
		};

		let successful_prompts = [];

		for (let [exp, part] of Object.entries(prompt_parts)) {
			for (let prompt_id in promptWorkflow) {
				/** @type {string} */
				const node_title = promptWorkflow[prompt_id]._meta.title.toLowerCase();

				if (node_title.match(exp)) {
					if (exp === "seed") {
						promptWorkflow[prompt_id].inputs.seed = part;
					} else {
						promptWorkflow[prompt_id].inputs.text = part;
					}
					successful_prompts.push(exp);
					break;
				}
			}
		}

		if (!successful_prompts.includesAll("positive prompt", "seed")) {
			throw Error(
				`No Positive Prompt and/or Seed node found in custom workflow`
			);
		}

		return promptWorkflow;
	}

	buildWorkflow(prompt, slave, steps) {
		switch (V.aiPrebuiltWorkflow) {
			case 1:
				return this.buildCustomWorkflow(prompt, slave);
			case 2:
				return this.buildPonyWorkflow(prompt, slave);
			default:
				return this.buildSimpleWorkflow(prompt, slave, steps);
		}
	}
};
