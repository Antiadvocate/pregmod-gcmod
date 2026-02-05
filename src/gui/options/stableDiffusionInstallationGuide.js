// cSpell:ignore Optimise, webui, medvram, rgthree

const A1111InstallHTML = `
<h1>What is Stable Diffusion and Automatic1111's Stable Diffusion WebUI?</h1>
Stable Diffusion is an AI model for generating images given a text prompt. Automatic1111's Stable Diffusion WebUI is a web interface for running Stable Diffusion. It is the easiest way to run Stable Diffusion on your computer, and provides an API that we can use to integrate Stable Diffusion into other applications.

<h1>Steps</h1>
<ol>
	<li>Install Automatic1111's Stable Diffusion WebUI</li>
	<li>Download the relevant models</li>
	<li>Place the models in their corresponding directories</li>
	<li>Configure Automatic1111's Stable Diffusion WebUI</li>
	<li>Running the WebUI</li>
	<li>Confirm successful setup</li>
</ol>

<h2>2. Install Automatic1111's Stable Diffusion WebUI</h2>
<p>Before we start, you need to install the Stable Diffusion WebUI. To do this, follow the detailed instructions for installation on Windows, Linux, and Mac on the <a class="link-external" href="https://github.com/AUTOMATIC1111/stable-diffusion-webui#installation-and-running">Stable Diffusion WebUI GitHub page</a>.</p>

<h2>3. Download the relevant models</h2>
<p>You will now need to download the following models:</p>
<ul>
	<li><a class="link-external" target="_blank" href="https://civitai.com/models/43331?modelVersionId=94640">MajicMix v6</a></li>
	<li><a class="link-external" target="_blank" href="https://huggingface.co/XpucT/Loras/blob/main/LowRA_v2.safetensors">LowRA v2</a></li>
</ul>

<p>Note that MajicMix is a photorealistic model heavily biased towards Asian girls; if you have a more diverse arcology, you may prefer a different base model like <a class="link-external" href="https://civitai.com/models/16804">Life Like Diffusion</a>, or you might want to try a different style entirely, like <a class="link-external" href="https://civitai.com/models/2583?modelVersionId=106922">Hassaku</a> for an anime style. Your results may vary with other models, since generated prompts are tuned primarily for these models, but don't be afraid to experiment.</p>

<h2>4. Place the models in their corresponding directories</h2>
<p>Next, you need to place the models in the appropriate directories in the Stable Diffusion WebUI:</p>
<ul>
	<li>Place MajicMix v6 in <code>stable-diffusion-webui/models/Stable-diffusion</code></li>
	<li>Place LowRA v2 in <code>stable-diffusion-webui/models/Lora</code></li>
</ul>

<h2>5. Configure Automatic1111's Stable Diffusion WebUI</h2>
<p>To prepare the WebUI for running, you need to modify the <code>COMMANDLINE_ARGS</code> line in either <code>webui-user.sh</code> (if you're using Linux/Mac) or <code>webui-user.bat</code> (if you're using Windows) to include the following:</p>
<p>Linux/Mac:</p>
<pre><code>export COMMANDLINE_ARGS="--medvram --no-half-vae --listen --port=7860 --api --cors-allow-origins *"</code></pre>
<p>Windows:</p>
<pre><code>set COMMANDLINE_ARGS=--medvram --no-half-vae --listen --port=7860 --api --cors-allow-origins *</code></pre>

<p>You may need to use <code>--cors-allow-origins null</code> instead of <code>--cors-allow-origins *</code> if you are using a Chromium-based host (Chrome, Edge, FCHost, or similar), <i>and</i> are running Free Cities from a local HTML file rather than a webserver.</p>

<h2>6. Running the WebUI</h2>
<p>Now you can run the WebUI by executing either <code>webui.sh</code> (Linux/Mac) or <code>webui-user.bat</code> (Windows). Note that the WebUI server needs to be running the whole time you're using it.

Once it's running, open your browser and go to <code>localhost:7860</code>. The WebUI should open. In the top left is a dropdown for model selection, pick MajicMix (or a different model of your choice) in that dropdown.</p>

<h2>7. Check it works</h2>
<p>At this point, if you go to a slave's detail page their image should load after a short (<30 seconds) delay. If it doesn't seem to be working, have a look at the terminal window running Automatic1111's Stable Diffusion WebUI to see if there are any errors.</p>
<p>The request will time out if the image can't be generated fast enough; if this is the case for you, try to find a guide to optimizing Stable Diffusion for your particular hardware setup, or disable the "Upscaling/highres fix" option.</p>

<h2>(Optional) 8. Optimise Your Install</h2>

<h3>ADetailer</h3>
<p><a class="link-external" target="_blank" href="https://github.com/Bing-su/adetailer">ADetailer</a> is a performant way to refine your images (taking less than 10ms on some systems)</p>
<p>Follow the instructions on the GitHub page to install. Remember to restart Stable Diffusion!</p>

<h3>ControlNet and OpenPose</h3>
<p><a class="link-external" target="_blank" href="https://github.com/Mikubill/sd-webui-controlnet">ControlNet</a> allows for precise control of image layout. Free Cities can use the OpenPose module to enforce poses on your slave images, which is much more reliable than prompting for the pose.</p>
<p>Follow the instructions on the GitHub page to install. You only need to set up an OpenPose model (you can ignore all the other models). Remember to restart Stable Diffusion!</p>
<p>Custom OpenPose poses (png or json) can be downloaded and placed in <code>resources/OpenPose</code> in your Free Cities install location, and specified from the Customize tab of Slave Interact.</p>

<h3>Webp Images</h3>
<p>WEBP images (~30 kB) take up much less space compared to JPEG (60-200 kB) or PNG (1-2.5 MB). This is one way you can make images quicker to display, and have less saved on your hard disk as well.</p>
<ol>
  <li>In the Automatic1111 WebUI, in the top toolbar and click "Settings"</li>
  <li>Then, click on the top option of the sidebar (Saving images/grids). You might be there by default.</li>
  <li>In the first text field, "File format for images", enter "webp" without quotes.</li>
  <li>Click the "Apply settings" button at the top, then the "Reload UI" button.</li>
</ol>
`;

// cSpell: ignore loras
const loraHTML = `
<h1>Why are LoRAs helpful?</h1>
Slaves in the Free Cities can sometimes have unusual features that Stable Diffusion base models are not trained to handle. LoRAs are small models specifically designed to handle these situations.

<h1>Do I really need all these LoRAs?</h1>
Each of the LoRAs serves a specific purpose; you may install any or all of them at your preference. Without the LoRA for a particular feature, slaves with that feature might not render well.

Note that many of these LoRAs tend to work better on less realistic base models. If you have many slaves with exotic features, it may be worth switching to an anime-style or pseudorealistic model, rather than a realistic one.

Download and copy any LoRAs that you want to use into your '<code>stable-diffusion-webui/models/Lora/</code>' (A1111) or '<code>ComfyUI/models/loras/</code>' (ComfyUI) folder.
`;

const comfyHTML = `
<h1>What is ComfyUI?</h1>
<p>ComfyUI is a Stable Diffusion UI that has a some performance benefits over A1111's webui and allows for more complicated pipelines.</p>

<h3>Download ComfyUI</h3>
<p>Download the <a class="link-external" target="_blank" href="https://github.com/comfyanonymous/ComfyUI/releases/latest">portable</a> version (Windows) or follow the <a class="link-external" target="_blank" href="https://github.com/comfyanonymous/ComfyUI?tab=readme-ov-file#installing">installation instructions</a> (Linux/Mac (M1 or M2))</p>
<p>Edit <code>run_nvidia_gpu.bat</code> or <code>run_cpu.bat</code> (Windows) to include <code> --port=7860  --enable-cors-header *</code> at the end of the first line. If you are on Linux or Mac run <code>python main.py --port=7860  --enable-cors-header *</code> instead</p>
<p>Use <code> --enable-cors-header null</code> instead of <code> --enable-cors-header *</code> if you are using a Chromium-based host (Chrome, Edge, FCHost, or similar) <b>and</b> you are running Free Cities from a local HTML file rather than a webserver.</p>
<p>Place your models in "ComfyUI/models/checkpoints"</p>

<h3>Install ComfyUI extensions</h3>
<p><a class="link-external" target="_blank" href="https://github.com/ltdrdata/ComfyUI-Manager">ComfyUi Manager</a> - For installing extensions + other QoL features</p>
<p><a class="link-external" target="_blank" href="https://github.com/ltdrdata/ComfyUI-Impact-Pack">Impact-Pack</a> - For Face Detailing + other useful nodes</p>
<p><a class="link-external" target="_blank" href="https://github.com/rgthree/rgthree-comfy">rgthree-comfy</a> - A collection of nodes and improvements</p>
<p><a class="link-external" target="_blank" href="https://github.com/mcmonkeyprojects/sd-dynamic-thresholding">Dynamic CFG</a> - For dynamic thresholding of CFG scales</p>
<p>Some extensions useful for building custom workflows:</p>
<p><a class="link-external" target="_blank" href="https://github.com/jags111/efficiency-nodes-comfyui">efficiency-nodes</a> - A collection of ComfyUI custom nodes to help streamline workflows and reduce total node count.</p>
<p><a class="link-external" target="_blank" href="https://github.com/WASasquatch/was-node-suite-comfyui">WAS Node Suite</a> - A node suite for ComfyUI with many new nodes, such as image processing, text processing, and more.</p>

Restart ComfyUI

<h3>Make sure ComfyUI is started</h3>
<p>You should see "Starting server" and the API URL.</p>

<h3>Setup FC for ComfyUI integration</h3>
<p>Switch AI User Interface from A1111 to ComfyUI.</p>
<p>Select your checkpoint model, sampling method, and scheduling method.</p>

<h3>Confirm successful generation</h3>
<p>If the preview image is not being generated and the preview is:</p>
<ol>
	<li>A spinner going forever; It's probably an issue with connecting to ComfyUI. Check API URL and ComfyUI setup.</li>
	<li>A blank grey square; It's probably a prompt related issue, check the ComfyUI terminal, the issue should be mentioned there.</li>
</ol>

`;

const comfyCustomWorkflowHTML = `
<h1>Instructions to run custom workflows in FC with a locally hosted copy</h1>

<h2>1. Host FC locally:</h2>
<ol>
  <li>Run the <code>compile.bat</code> (Windows) or <code>compile.sh</code> (Linux/Mac) script inside the FC directory.</li>
  <li>Follow the instructions for installing the required dependencies and wait for the compiler to compile FC.</li>
  <li>Run the <code>serve.bat</code> (Windows) or <code>serve.sh</code> (Linux/Mac) script to start the local server.</li>
  <li>Open your web browser and go to the local server url (usually <a class="link-external" target="_blank" href="http://localhost:6969/bin/FC_pregmod.html"><code>http://localhost:6969/bin/FC_pregmod.html</code></a>).</li>
  <li>Repeat steps 1 & 2 each time you update FC</li>
  <li>Repeat steps 3 & 4 each time you want to play FC</li>
</ol>

<h2>2. Prepare your Workflow:</h2>
<ol>
  <li>Identify the node that holds your seed image and add the word "Seed" (case-insensitive) to its title.</li> 
  <li>Find the nodes containing your positive and negative prompts, and add "Positive Prompt" and "Negative Prompt" (respectively, case-insensitive) to their titles. If both prompts are in the same node, convert one of the prompt widgets to an input and use an extension like WAS Node Suite.</li>
  <li>Ensure that the final generated image is connected to a SaveImageWebsocket node.</li>
</ol>

<h2>3. Save workflow in API format:</h2>
<ol>
  <li>Enable Developer Mode in ComfyUI's settings.</li>
  <li>Click the "Save in API Format" button.</li>
  <li>Create a folder named "workflows" inside the "bin/resources" directory.</li>
  <li>Save your workflow file in the "workflows" folder.</li> 
  <li>In FC, switch the AI Prebuilt Workflow option to Custom Workflow and enter the filename of your saved workflow file into the workflow option field.</li>
</ol>

<p>By following these steps, you should be able to run custom workflows in your locally hosted instance of FC.</p>

`;

/**
 * Generates a link which shows the A1111 installation guide.
 * @param {string} [text] link text to use
 * @returns {HTMLElement} link
 */
App.UI.A1111InstallationGuide = function(text) {
	return App.UI.DOM.link(text ? text : "A1111 WebUI Installation Guide", () => {
		Dialog.create("A1111 WebUI Installation Guide");
		const content = document.createElement("div").innerHTML = A1111InstallHTML;
		Dialog.append(content);
		Dialog.open();
	});
};

/**
 * Generates a link which the LoRA pack installation guide.
 * @param {string} [text] link text to use
 * @returns {HTMLElement} link
 */
App.UI.loraInstallationGuide = function(text) {
	return App.UI.DOM.link(text ? text : "LoRA Installation Guide", () => {
		Dialog.create("Stable Diffusion LoRA Installation Guide");
		const content = document.createElement("div").innerHTML = loraHTML;
		Dialog.append(content);
		Dialog.open();
	});
};

/**
 * Generates a link with the ComfyUI installation guide.
 * @param {string} [text] link text to use
 * @returns {HTMLElement} link
 */
App.UI.comfyUIInstallationGuide = function(text) {
	return App.UI.DOM.link(text ? text : "ComfyUI Installation Guide", () => {
		Dialog.create("ComfyUI Installation Guide");
		const content = document.createElement("div").innerHTML = comfyHTML;
		Dialog.append(content);
		Dialog.open();
	});
};

/**
 * Generates a link with the ComfyUI custom workflow guide.
 * @param {string} [text] link text to use
 * @returns {HTMLElement} link
 */
App.UI.comfyUICustomWorkflowGuide = function(text) {
	return App.UI.DOM.link(text ? text : "ComfyUI Custom Workflow Guide", () => {
		Dialog.create("ComfyUI Custom Workflow Guide");
		const content = document.createElement("div").innerHTML = comfyCustomWorkflowHTML;
		Dialog.append(content);
		Dialog.open();
	});
};
