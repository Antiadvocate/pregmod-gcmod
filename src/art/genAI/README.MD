# AI Art Generation System

<!-- cSpell:disable -->

## Overview

The AI art generation system (`src/art/genAI/`) enables FC-Pregmod to generate character images using external AI image generation services like Stable Diffusion (via AUTOMATIC1111 WebUI) and ComfyUI. The system builds detailed text prompts from slave properties and manages image generation, caching, and display.

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    AI ART GENERATION FLOW                       │
└────────────────────────────────────────────────────────────────┘

1. User Request
   └─> Slave Interact screen or other UI

2. Prompt Building (buildPrompt.js)
   ├─> Analyzes slave properties
   ├─> Selects appropriate prompt parts
   └─> Combines into final prompt

3. Prompt Parts (prompts/, illustriousPrompts/, ponyPrompts/)
   ├─> Each part handles specific slave attribute
   ├─> Returns text tags for AI model
   └─> Different sets for different AI models

4. Workflow Selection (workflows.js)
   ├─> Chooses generation workflow
   ├─> Configures model settings
   └─> Sets up generation parameters

5. API Communication (stableDiffusion.js)
   ├─> Sends request to AI service
   ├─> Monitors generation progress
   └─> Retrieves generated image

6. Image Storage (reactiveImageDB.js, staticImageDB.js)
   ├─> Caches generated images
   ├─> Manages storage quota
   └─> Enables offline viewing

7. Display (uiSlaveInteract.js, queueOverlay.js)
   ├─> Shows generated image
   ├─> Queue management UI
   └─> Generation progress tracking
```

## Core Components

### **buildPrompt.js** - Prompt Construction

The central orchestrator that builds complete prompts from slave data.

**Key Function:**
```javascript
buildPrompt(slave, options) → App.Art.GenAI.Prompt
```

**Process:**
1. Checks if slave has custom prompt override
2. Selects prompt parts based on AI model (`V.aiBaseModel`)
3. Instantiates appropriate prompt part classes
4. Combines all parts into final prompt object

**Supported Models:**
- **Case 1-2**: SDXL / Pony models (general purpose)
- **Case 6**: Illustrious models (anime/stylized)

### **Prompt Parts** - Modular Prompt Generation

Three directories contain prompt parts for different AI models:

**`prompts/`** - SDXL/Pony Prompts
- General-purpose Stable Diffusion models
- Realistic and semi-realistic styles
- ~30 prompt part files

**`illustriousPrompts/`** - Illustrious Model Prompts
- Anime and stylized art models
- Different tag structure and emphasis
- ~30 prompt part files

**`ponyPrompts/`** - Pony-Specific Prompts
- Specialized for Pony Diffusion models
- Demographics and structure handling
- 2 prompt part files

**Common Prompt Parts:**
- `agePromptPart.js` - Visual age descriptors
- `genderPromptPart.js` - Gender presentation
- `racePromptPart.js` - Racial features
- `hairPromptPart.js` - Hair color, length, style
- `breastsPromptPart.js` - Breast size and shape
- `crotchPromptPart.js` - Genital configuration
- `clothesPromptPart.js` - Clothing and outfits
- `expressionPromptPart.js` - Facial expressions
- `pregPromptPart.js` - Pregnancy stage
- `arousalPromptPart.js` - Arousal state
- `tattooPromptPart.js` - Visible tattoos
- `piercingsPromptPart.js` - Body piercings
- `locationPromptPart.js` - Background setting
- `posturePromptPart.js` - Body pose
- `customPromptPart.js` - User-defined tags

**Each Prompt Part:**
- Extends `App.Art.GenAI.PromptPart` base class
- Analyzes specific slave properties
- Returns appropriate AI model tags
- Can return empty if not applicable

### **stableDiffusion.js** - API Communication

Handles communication with Stable Diffusion WebUI and ComfyUI.

**Key Classes:**
- `App.Art.GenAI.StableDiffusionSettings` - SD WebUI configuration
- `App.Art.GenAI.ComfyUISettings` - ComfyUI configuration

**API Functions:**
- `txt2img()` - Text-to-image generation
- `img2img()` - Image-to-image transformation
- `getProgress()` - Check generation status
- `getModels()` - List available AI models
- `getSamplers()` - List sampling methods
- `getUpscalers()` - List upscaling methods

**Generation Parameters:**
- `prompt` - Positive prompt text
- `negative_prompt` - Things to avoid
- `steps` - Generation steps (quality)
- `cfg_scale` - Prompt adherence strength
- `width/height` - Image dimensions
- `seed` - Reproducibility seed
- `sampler_name` - Sampling algorithm
- `enable_hr` - High-res fix
- `hr_scale` - Upscale factor
- `restore_faces` - Face restoration

### **workflows.js** - Generation Workflows

Defines preset workflows for different generation scenarios.

**Workflow Types:**
- Standard generation
- High-resolution generation
- Face-focused generation
- Full-body generation
- Specific pose workflows

**Workflow Configuration:**
- Model selection
- Sampler settings
- Resolution presets
- Extension configurations (ADetailer, ControlNet)

### **reactiveImageDB.js** - Dynamic Image Storage

Manages generated images in browser IndexedDB for persistence.

**Features:**
- Stores images by slave ID and generation parameters
- Automatic cache management
- Storage quota monitoring
- Image retrieval and deletion
- Reactive updates when images change

**Storage Structure:**
```
IndexedDB: "FCPregmodAIImages"
  └─> Store: "images"
      └─> Key: {slaveID, promptHash, seed}
          └─> Value: {imageBlob, timestamp, metadata}
```

### **staticImageDB.js** - Custom Image Storage

Handles user-uploaded custom images for slaves.

**Features:**
- Store custom images per slave
- Fallback when AI generation unavailable
- Image replacement and deletion
- Persistent storage

### **archivingAI.js** - Image Export/Import

Provides functionality to export and import AI-generated images.

**Features:**
- Export images to ZIP archive
- Import images from ZIP
- Batch operations
- Metadata preservation

### **queueOverlay.js** - Generation Queue UI

Manages the UI for queued image generation requests.

**Features:**
- Queue visualization
- Progress tracking
- Batch generation
- Cancel/retry operations
- Error handling display

### **uiOptions.js** - AI Settings UI

Provides configuration interface for AI generation settings.

**Settings:**
- API endpoint configuration
- Model selection
- Default generation parameters
- Workflow selection
- Storage management

### **uiSlaveInteract.js** - Slave Interaction Integration

Integrates AI art into slave interaction screens.

**Features:**
- Generate button
- Image display
- Regeneration options
- Custom prompt editing
- Image management

### **openPose.js** - Pose Control

Handles OpenPose/ControlNet integration for pose control.

**Features:**
- Pose template selection
- Pose customization
- ControlNet configuration
- Pose-based generation

### **stableDiffusionHelpers.js** - Utility Functions

Helper functions for AI generation system.

**Utilities:**
- Prompt validation
- Parameter normalization
- Error handling
- API response parsing

## How It Works

### **Generating an Image**

```
Step 1: User clicks "Generate AI Art" button
  └─> uiSlaveInteract.js handles click

Step 2: Build prompt from slave data
  buildPrompt(slave) called
    ├─> Checks V.aiBaseModel (which AI model)
    ├─> Creates appropriate prompt parts
    │   ├─> HairPromptPart analyzes slave.hColor, slave.hLength
    │   ├─> BreastsPromptPart analyzes slave.boobs
    │   ├─> ClothesPromptPart analyzes slave.clothes
    │   └─> ... (30+ prompt parts)
    └─> Combines all parts into final prompt string

Step 3: Configure generation settings
  workflows.js selects appropriate workflow
    ├─> Resolution (512x768, 768x1024, etc.)
    ├─> Sampler (DPM++ 2M, Euler, etc.)
    ├─> Steps (20-30 typically)
    ├─> CFG Scale (5.5-7.5 typically)
    └─> Extensions (ADetailer, ControlNet)

Step 4: Send to AI service
  stableDiffusion.js sends API request
    ├─> POST to http://localhost:7860/sdapi/v1/txt2img
    ├─> Includes prompt, negative prompt, settings
    └─> Returns generation ID

Step 5: Monitor progress
  Poll API for progress
    ├─> GET http://localhost:7860/sdapi/v1/progress
    ├─> Update UI with percentage
    └─> Wait for completion

Step 6: Retrieve and store image
  When complete:
    ├─> Decode base64 image data
    ├─> Store in reactiveImageDB
    ├─> Cache for future viewing
    └─> Display to user

Step 7: Display image
  uiSlaveInteract.js shows image
    ├─> Loads from cache if available
    ├─> Shows generation options
    └─> Allows regeneration
```

### **Prompt Building Example**

For a slave with these properties:
```javascript
{
  slaveName: "Alice",
  age: 25,
  hColor: "blonde",
  hLength: 150,
  eyes: "blue",
  skin: "light",
  boobs: 600,
  preg: 20,
  clothes: "a slutty maid outfit",
  assignment: "whoring"
}
```

The system builds a prompt like:
```
masterpiece, best quality, highly detailed, 1girl, solo, portrait,
blonde hair, long hair, blue eyes, fair skin, large breasts,
pregnant, pregnant belly, 20 weeks pregnant,
maid outfit, revealing clothes, slutty,
indoors, bedroom, seductive expression, aroused
```

With negative prompt:
```
lowres, bad anatomy, bad hands, text, error, missing fingers,
extra digit, fewer digits, cropped, worst quality, low quality,
normal quality, jpeg artifacts, signature, watermark, username, blurry
```

## Configuration

### **In-Game Settings** (`V.*` variables)

- `V.aiBaseModel` - Which AI model type (1=SDXL, 2=Pony, 6=Illustrious)
- `V.aiAPIEndpoint` - API URL (default: `http://localhost:7860`)
- `V.aiEnabled` - Enable/disable AI generation
- `V.aiAutoGenerate` - Auto-generate on slave view
- `V.aiCacheImages` - Cache generated images
- `V.aiDefaultWorkflow` - Default generation workflow

### **API Setup**

**AUTOMATIC1111 Stable Diffusion WebUI:**
1. Install SD WebUI: https://github.com/AUTOMATIC1111/stable-diffusion-webui
2. Launch with `--api` flag
3. Set API endpoint in FC-Pregmod settings
4. Select appropriate model in WebUI

**ComfyUI:**
1. Install ComfyUI: https://github.com/comfyanonymous/ComfyUI
2. Enable API server
3. Configure workflow in FC-Pregmod
4. Set API endpoint

### **Recommended Extensions**

- **ADetailer** - Automatic face/hand detail enhancement
- **ControlNet** - Pose and composition control
- **Ultimate SD Upscale** - High-quality upscaling
- **Dynamic Prompts** - Advanced prompt features

## Adding New Prompt Parts

To add support for a new slave attribute:

1. **Create prompt part file:**
```javascript
// src/art/genAI/prompts/myNewPromptPart.js
App.Art.GenAI.MyNewPromptPart = class extends App.Art.GenAI.PromptPart {
    /**
     * @param {FC.SlaveState} slave
     */
    constructor(slave) {
        super();
        
        // Analyze slave property
        if (slave.myNewProperty > 50) {
            this.addTag("high value tag");
        } else {
            this.addTag("low value tag");
        }
    }
};
```

2. **Add to buildPrompt.js:**
```javascript
case 1: case 2:  // SDXL/Pony
    prompts = [
        // ... existing prompt parts
        new App.Art.GenAI.MyNewPromptPart(slave),
    ];
```

3. **Create Illustrious version if needed:**
```javascript
// src/art/genAI/illustriousPrompts/myNewIllustriousPromptPart.js
App.Art.GenAI.Ill.MyNewPromptPart = class extends App.Art.GenAI.PromptPart {
    // Similar structure, different tags for Illustrious models
};
```

## Performance Considerations

**Generation Time:**
- Typical generation: 10-60 seconds
- Depends on: steps, resolution, model, hardware
- Queue system prevents UI blocking

**Storage:**
- Images stored in IndexedDB
- ~500KB-2MB per image
- Browser quota: typically 50-100MB
- Automatic cleanup of old images

**API Load:**
- One request per generation
- Progress polling every 500ms
- Timeout after 5 minutes
- Retry on network errors

## Troubleshooting

**"API endpoint not reachable":**
- Ensure SD WebUI/ComfyUI is running
- Check API endpoint URL in settings
- Verify `--api` flag is set
- Check firewall/antivirus

**"Generation failed":**
- Check browser console for errors
- Verify model is loaded in WebUI
- Check prompt length (max ~75 tokens per chunk)
- Try different sampler/settings

**"Images not saving":**
- Check browser storage quota
- Clear old cached images
- Verify IndexedDB is enabled
- Check browser privacy settings

**"Poor quality images":**
- Increase steps (20-30 recommended)
- Adjust CFG scale (5.5-7.5 typical)
- Enable high-res fix
- Use better AI model
- Add more descriptive tags

## Related Files

- `src/art/artJS.js` - Main art system integration
- `src/interaction/slaveInteract.js` - Slave interaction UI
- `css/art/genAI.css` - AI art styling
- `js/003-data/assistantData.js` - AI model presets

## External Resources

- **AUTOMATIC1111 WebUI**: https://github.com/AUTOMATIC1111/stable-diffusion-webui
- **ComfyUI**: https://github.com/comfyanonymous/ComfyUI
- **Stable Diffusion Models**: https://civitai.com/
- **Prompt Engineering**: https://prompthero.com/stable-diffusion-prompt-guide
- **ControlNet**: https://github.com/lllyasviel/ControlNet

<!-- cSpell:enable -->