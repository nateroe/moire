// --- GLOBAL SETUP ---
let appSettings = null;
let animationInterval = null;
let animationStartTime = 0;
let viewportManager = null;  // Replace gl with ViewportSwitchingManager
let renderer = null;         //  MoireRenderer instance
let visibilityManager = null; 
	
// User settings are preferences that are not part of the design, keyframes, or share URL
console.log("Init user settings");
let userSettings = {
	flags: {
		tooltipsEnabled: true,
		randomizeType: true,
		randomizeAmplitude: true,
		randomizeFrequency: true,
		randomizePhase: true,
		randomizeDirection: true
	}
};
	
// Initialize rendering system
function initRenderingSystem() {
	// Create viewport manager for shared WebGL context
	viewportManager = new ViewportSwitchingManager();

	// Get the main canvas and register it
	const canvas = document.getElementById("moireCanvas");
	viewportManager.registerCanvas("moireCanvas", canvas.width, canvas.height);

	// Create renderer for live editing
	const shareContext = false;
	const useGlobalSettings = true;
	renderer = new MoireRenderer(canvas, null, shareContext, viewportManager, useGlobalSettings);
	renderer.webGLManager = viewportManager;

	// Register mini canvas too
	const miniCanvas = document.getElementById("miniCanvas");
	if (miniCanvas) {
		viewportManager.registerCanvas(miniCanvas, miniCanvas.width, miniCanvas.height);		
		renderer.registerSecondaryCanvas(miniCanvas.id);
	}
}

// Initialize settings once during startup
function initAppSettings() {
	// Load from URL, localStorage, or defaults
	appSettings = loadInitialSettings();

	// Set active keyframe
	appSettings.activeKeyframe = appSettings.activeKeyframe || 'k1';
	
	console.log("Initial settings loaded:", appSettings);
	return appSettings;
}

// Load initial settings from all sources
function loadInitialSettings() {
	let settings;
	
	// Try URL first, then localStorage, then defaults
	try {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has("state")) {
			settings = getStateFromUrl();
		}
	} catch (e) {
		console.error("Error loading from URL:", e);
	}
	
	if (!settings) {
		try {
			const stored = localStorage.getItem("moireSettings");
			if (stored) {
				settings = JSON.parse(stored);
			}
		} catch (e) {
			console.error("Error loading from localStorage:", e);
		}
	}
	
	if (!settings) {
		settings = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS));
	}
	
	// Ensure critical values exist with fallbacks
	settings.gridCount = settings.gridCount ?? MoireUtils.DEFAULT_SETTINGS.gridCount;
	settings.waveCount = settings.waveCount ?? MoireUtils.DEFAULT_SETTINGS.waveCount;
	settings.bgColor = settings.bgColor ?? MoireUtils.DEFAULT_SETTINGS.bgColor;
	
	// Return sanitized settings
	return settings;
}

// Save settings to localStorage
function saveSettings() {
    // Original functionality
    localStorage.setItem("moireSettings", JSON.stringify(appSettings));
    
    // Check favorites state (new functionality)
    if (isInFavorites(appSettings.guid)) {
        const isModified = isDesignModified();
        updateFavoriteButton(true, isModified);
        
        // Handle autofave
        if (document.getElementById('autofaveCheckbox') && 
            document.getElementById('autofaveCheckbox').checked && 
            isModified) {
            saveToFavorites();
        }
    }
}

function formatSignedValue(value) {
	if (value === 0) {
		return "0.0";
	} else if (value > 0) {
		return "+" + value.toFixed(2);
	} else {
		return value.toFixed(2); // negative values already have the minus sign
	}
}

// Now modify the updateUIFromSettings function to use these new functions
// This was the original function that we're replacing
function updateUIFromSettings() {
	// Get active keyframe settings
	const activeKeyframe = appSettings.activeKeyframe || 'k1';
	const keyframeSettings = appSettings.keyframes[activeKeyframe];
	
	// Global controls
	document.getElementById("gridCount").value = appSettings.gridCount;
	document.getElementById("waveCount").value = appSettings.waveCount;
	document.getElementById("gridType").value = appSettings.gridType || "0";
	document.getElementById("renderMode").value = appSettings.renderMode || "additive";
	document.getElementById("renderStyle").value = appSettings.renderStyle || "dots";
	document.getElementById("waveOffsetType").value = appSettings.waveOffsetType || "phase";
	
	// Set keyframe radio button
	document.querySelector(`input[name="activeKeyframeControl"][value="${activeKeyframe}"]`).checked = true;
	
	// Apply keyframe-specific settings
	if (keyframeSettings) {
		// Background color
		document.getElementById("bgColor").value = keyframeSettings.bgColor || "#000000";
		
		// Rotation offset
		const rotation = keyframeSettings.rotationOffset || 0;
		document.getElementById("rotationOffset").value = rotation;
		document.getElementById("rotationOffsetNum").value = rotation.toFixed(1);
		document.getElementById("rotationOffsetValue").textContent = rotation.toFixed(1) + "°";

		// Common Hue
		const commonHue = keyframeSettings.commonHue || 0;
		document.getElementById("commonHue").value = commonHue;
		document.getElementById("commonHueNum").value = commonHue.toString();
		document.getElementById("commonHueValue").textContent = commonHue + "°";

		// Common Saturation
		const commonSaturation = keyframeSettings.commonSaturation || 0;
		document.getElementById("commonSaturation").value = commonSaturation;
		document.getElementById("commonSaturationNum").value = commonSaturation.toString();
		document.getElementById("commonSaturationValue").textContent = formatSignedValue(commonSaturation);

		// Common Lightness
		const commonLightness = keyframeSettings.commonLightness || 0;
		document.getElementById("commonLightness").value = commonLightness;
		document.getElementById("commonLightnessNum").value = commonLightness.toString();
		document.getElementById("commonLightnessValue").textContent = formatSignedValue(commonLightness);

		// Update Common Thickness slider and value display
		const commonThickness = keyframeSettings.commonThickness !== undefined ? keyframeSettings.commonThickness : 1.0;
		document.getElementById("commonThickness").value = commonThickness;
		document.getElementById("commonThicknessNum").value = commonThickness.toFixed(2);
		document.getElementById("commonThicknessValue").textContent = "x " + commonThickness.toFixed(2);

		// Update Scale slider and value display
		const scale = keyframeSettings.scale !== undefined ? keyframeSettings.scale : 1.0;
		document.getElementById("scale").value = scale;
		document.getElementById("scaleNum").value = scale.toFixed(2);
		document.getElementById("scaleValue").textContent = "x " + scale.toFixed(2);

		// Common Amp Factor
		const commonAmpFactor = keyframeSettings.commonAmpFactor !== undefined ? keyframeSettings.commonAmpFactor : 1.0;
		document.getElementById("commonAmpFactor").value = commonAmpFactor;
		document.getElementById("commonAmpFactorNum").value = commonAmpFactor.toFixed(2);
		document.getElementById("commonAmpFactorValue").textContent = "x " + commonAmpFactor.toFixed(2);

		// Common Freq Factor
		const commonFreqFactor = keyframeSettings.commonFreqFactor !== undefined ? keyframeSettings.commonFreqFactor : 1.0;
		document.getElementById("commonFreqFactor").value = commonFreqFactor;
		document.getElementById("commonFreqFactorNum").value = commonFreqFactor.toFixed(2);
		document.getElementById("commonFreqFactorValue").textContent = "x " + commonFreqFactor.toFixed(2);

		// Common Direction Offset
		const commonDirectionOffset = keyframeSettings.commonDirectionOffset || 0;
		document.getElementById("commonDirectionOffset").value = commonDirectionOffset;
		document.getElementById("commonDirectionOffsetNum").value = commonDirectionOffset;
		document.getElementById("commonDirectionOffsetValue").textContent = formatSignedValue(commonDirectionOffset) + "°";

		// Per-Grid Phase Offset
		const phaseOffset = keyframeSettings.phaseOffset || 0;
		document.getElementById("phaseOffset").value = phaseOffset;
		document.getElementById("phaseOffsetNum").value = phaseOffset.toFixed(2);
		document.getElementById("phaseOffsetValue").textContent = formatSignedValue(phaseOffset) + "°";

		// Common Phase Offset
		const commonOffset = keyframeSettings.commonOffset || 0;
		document.getElementById("commonOffset").value = commonOffset;
		document.getElementById("commonOffsetNum").value = commonOffset.toFixed(2);
		document.getElementById("commonOffsetValue").textContent = formatSignedValue(commonOffset) + "°";
		
		// Vector offset controls (if applicable)
		if (appSettings.waveOffsetType === "vector") {
			document.getElementById("offsetMagnitude").value = keyframeSettings.offsetMagnitude || 10;
			
			// Update vector offset direction control if it exists
			const container = document.getElementById('vector-offset-direction');
			if (container && container.__vectorOffsetControl) {
				container.__vectorOffsetControl.setAngle(keyframeSettings.offsetAngle || 0);
			}
		}
	}
	
	// Animation settings
	if (appSettings.animSettings) {
		document.getElementById("animationDuration").value = appSettings.animSettings.duration;
		
		const modeRadio = document.querySelector(`input[name="animationMode"][value="${appSettings.animSettings.mode}"]`);
		if (modeRadio) modeRadio.checked = true;
	}
	
	// Show/hide offset controls based on offset type
	toggleWaveOffsetControls();
	
	// Check if grid and wave controls exist before creating or updating
	const gridControlsExist = document.querySelector('.grid-control') !== null;
	const waveControlsExist = document.querySelector('.wave-control') !== null;
	
	if (!gridControlsExist) {
		// If grid controls don't exist yet, create them
		createGridControls(keyframeSettings);
	} else {
		// Otherwise, just update the values
		updateGridControlValues(keyframeSettings);
	}
	
	if (!waveControlsExist) {
		// If wave controls don't exist yet, create them
		createWaveControlsWithDirectionControl(keyframeSettings);
	} else {
		// Otherwise, just update the values
		updateWaveControlValues(keyframeSettings);
	}
	
	// Update keyframe indicators
	updateKeyIndicators();
}

function resetToDefaults() {
	if (confirm("Reset to defaults? All data will be lost!")) {
		// Get a fresh copy of default settings
		const defaultSettings = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS));
		
		// Only preserve the active keyframe selection
		const activeKeyframe = appSettings.activeKeyframe || 'k1';
		
		// Reset all settings by creating a new object with defaults
		appSettings = {
			// Global settings
			animSettings: defaultSettings.animSettings,
			gridType: defaultSettings.gridType,
			renderMode: defaultSettings.renderMode,
			waveOffsetType: defaultSettings.waveOffsetType,
			gridCount: defaultSettings.gridCount,
			waveCount: defaultSettings.waveCount,
			
			// Use the already deep-copied keyframes
			keyframes: {
				k1: defaultSettings.keyframes.k1,
				k2: defaultSettings.keyframes.k2
			},
			
			// Keep active keyframe
			activeKeyframe: activeKeyframe
		};
		
		// Update UI and save
		updateUIFromSettings();
		saveSettings();
		
		// Get button coordinates for toast positioning
		const button = document.querySelector('button[onclick="resetToDefaults()"]');
		if (button) {
			const rect = button.getBoundingClientRect();
			showToast2(`Reset to defaults`, rect.left + rect.width/2, rect.bottom);
		} else {
			showToast2(`Reset to defaults`); // Default position
		}
	}
}

// Keyframe Management Functions
function copyToOtherKeyframe(event) {
	const sourceKeyframe = appSettings.activeKeyframe;
	const targetKeyframe = sourceKeyframe === 'k1' ? 'k2' : 'k1';
	
	// Get current keyframe settings
	const sourceKeyframeData = appSettings.keyframes[sourceKeyframe];
	
	// Create a deep copy of the source keyframe data
	const keyframeDataCopy = JSON.parse(JSON.stringify(sourceKeyframeData));
	
	// Save to the other keyframe
	appSettings.keyframes[targetKeyframe] = keyframeDataCopy;
	
	// Update renderer settings
	if (renderer) {
		renderer.updateSettings(appSettings);
	}
	
	// Save to localStorage
	saveSettings();
	
	if (event && event.clientX && event.clientY) {
		showToast2(`Copied to ${targetKeyframe.toUpperCase()}`, event.clientX, event.clientY);
	}
}

function resetCurrentKeyframe(event) {
	if (confirm(`Reset ${appSettings.activeKeyframe.toUpperCase()} to defaults?`)) {
		// Get the active keyframe name
		const activeKeyframe = appSettings.activeKeyframe;
		
		// Create a deep copy of the default keyframe settings
		const defaultKeyframe = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes[activeKeyframe]));
		
		// Apply the defaults to the current keyframe
		appSettings.keyframes[activeKeyframe] = defaultKeyframe;
		
		// Update renderer settings
		if (renderer) {
			renderer.updateSettings(appSettings);
		}
		
		// Update UI and save
		updateUIFromSettings();
		saveSettings();
		
		// Show confirmation toast
		if (event && event.clientX && event.clientY) {
			showToast2(`Reset ${activeKeyframe.toUpperCase()} to defaults`, event.clientX, event.clientY);
		} else {
			showToast(`Reset ${activeKeyframe.toUpperCase()} to defaults`);
		}
	}
}

function createGridControls(keyframeSettings) {
	const gridControls = document.getElementById("gridControls");
	
	// Clear existing controls
	gridControls.innerHTML = "";
	
	// Add "All Active" and "Disable All" buttons above grid controls
	const buttonContainer = document.createElement("div");
	buttonContainer.className = "control-buttons";
	buttonContainer.innerHTML = `
		<button id="allGridsActive" class="small-button">All Active</button>
		<button id="noGridsActive" class="small-button">Disable All</button>
	`;
	gridControls.appendChild(buttonContainer);
	
	// Bind events for these buttons
	document.getElementById("allGridsActive").addEventListener("click", setAllGridsActive);
	document.getElementById("noGridsActive").addEventListener("click", setNoGridsActive);
	
	// Create ALL 8 grid control rows (always create maximum)
	for (let i = 0; i < 8; i++) {
		const grid = keyframeSettings.grids[i];
		const div = document.createElement("div");
		div.className = "grid-control";
		if (!grid.isActive) {
			div.classList.add("inactive-control");
		}
		div.setAttribute("data-index", i);
		
		// Add a persistent name attribute (that won't change during reordering)
		const gridName = grid.name || `Grid ${i + 1}`;
		div.setAttribute("data-name", gridName);

		// Add drag handle
		const handle = document.createElement("div");
		handle.className = "drag-handle";
		div.appendChild(handle);
		
		// Create content container
		const content = document.createElement("div");
		content.className = "control-content";
		
		// Add grid name
		const nameLabel = document.createElement("label");
		nameLabel.textContent = gridName;
		content.appendChild(nameLabel);
		
		// Add isActive checkbox
		const activeCheckbox = document.createElement("label");
		activeCheckbox.className = "active-checkbox tooltip-trigger";
		activeCheckbox.innerHTML = `
			<input type="checkbox" data-index="${i}" class="gridActive" ${grid.isActive ? 'checked' : ''}>
			<span>Active</span>
			<span class="tooltip-text">Enable/disable this grid layer</span>
		`;
		content.appendChild(activeCheckbox);
		
		// Add other controls
		content.innerHTML += `
			<label class="tooltip-trigger">Thickness: 
				<input type="range" min="0" max="1" step="0.01" value="${grid.thickness}" data-index="${i}" class="lineThickness" ${!grid.isActive ? 'disabled' : ''}>
				<span class="tooltip-text">Controls the size of dots in the grid pattern. Higher values create larger dots.</span>
			</label>
			<label class="tooltip-trigger">Width: 
				<input type="number" value="${grid.width}" data-index="${i}" class="cellWidth" ${!grid.isActive ? 'disabled' : ''}>
				<span class="tooltip-text">Horizontal spacing between grid elements in pixels.</span>
			</label>
			<label class="tooltip-trigger">Height: 
				<input type="number" value="${grid.height}" data-index="${i}" class="cellHeight" ${!grid.isActive ? 'disabled' : ''}>
				<span class="tooltip-text">Vertical spacing between grid elements in pixels.</span>
			</label>
			<label class="tooltip-trigger">Color: 
				<div class="color-picker-wrapper">
					<button type="button" class="custom-color-button" style="background-color: ${grid.color};" data-index="${i}" ${!grid.isActive ? 'disabled' : ''}></button>
					<input type="color" value="${grid.color}" data-index="${i}" class="color hidden-color-input" ${!grid.isActive ? 'disabled' : ''}>
				</div>
				<span class="tooltip-text">Sets the color of this grid layer.</span>
			</label>
		`;
		div.appendChild(content);
		
		gridControls.appendChild(div);
	}
	
	// Update which controls are visible based on gridCount
	updateGridControlValues(keyframeSettings);
	
	bindGridEvents();
	setTimeout(() => {
		initDragForContainer("gridControls");
	}, 10);
}


// Update grid button states based on current active status
function updateGridButtonStates() {
	const activeKeyframe = appSettings.activeKeyframe;
	const grids = appSettings.keyframes[activeKeyframe].grids;
	const gridCount = appSettings.gridCount;
	
	// Count active grids
	const activeCount = grids.slice(0, gridCount).filter(grid => grid.isActive).length;
	
	// Update button states
	const allActiveBtn = document.getElementById("allGridsActive");
	const noneActiveBtn = document.getElementById("noGridsActive");
	
	if (allActiveBtn) {
		allActiveBtn.disabled = (activeCount === gridCount);
	}
	
	if (noneActiveBtn) {
		noneActiveBtn.disabled = (activeCount === 0);
	}
}

// Set all grids active
function setAllGridsActive() {
	// Update both keyframes
	for (const keyframeName of ['k1', 'k2']) {
		const grids = appSettings.keyframes[keyframeName].grids;
		for (let i = 0; i < appSettings.gridCount; i++) {
			grids[i].isActive = true;
		}
	}
	
	// Update UI and render
	updateUIFromSettings();
	saveSettings();
	requestRender();
}

// Set no grids active
function setNoGridsActive() {
	// Update both keyframes
	for (const keyframeName of ['k1', 'k2']) {
		const grids = appSettings.keyframes[keyframeName].grids;
		for (let i = 0; i < appSettings.gridCount; i++) {
			grids[i].isActive = false;
		}
	}
	
	// Update UI and render
	updateUIFromSettings();
	saveSettings();
	requestRender();
}
// ===========
// >>>>> NOTE: for createWaveControls() -- see direction.js createWaveControlsWithDirectionControl()
// ===========

function toggleWaveOffsetControls() {
	const offsetType = document.getElementById("waveOffsetType").value;
	if (offsetType === "phase") {
		document.getElementById("phaseOffsetControls").style.display = "block";
		document.getElementById("vectorOffsetControls").style.display = "none";
	} else {
		document.getElementById("phaseOffsetControls").style.display = "none";
		document.getElementById("vectorOffsetControls").style.display = "block";
	}
	requestRender();
}

function randomizeWave(index) {
	// Get the active keyframe's waves
	const wave = appSettings.keyframes[appSettings.activeKeyframe].waves[index];
	
	// Update model with random values based on flags
	if (userSettings.flags.randomizeType) {
		const waveTypes = ["transverse", "longitude", "amplitude", "hue", "saturation", "lightness", "rotation", "phaseshift"];
		const newType = waveTypes[randomInt(0, waveTypes.length - 1)];
		
		// Update type in BOTH keyframes
		wave.type = newType;
		
		// Also update in the other keyframe
		const otherKeyframeName = appSettings.activeKeyframe === 'k1' ? 'k2' : 'k1';
		const otherWave = appSettings.keyframes[otherKeyframeName].waves[index];
		if (otherWave) {
			otherWave.type = newType;
		}
	}
	
	if (userSettings.flags.randomizeAmplitude) {
		wave.amplitude = parseFloat(randomRange(1, 130).toFixed(1));
	}
	
	if (userSettings.flags.randomizeFrequency) {
		wave.frequency = parseFloat(randomRange(0.001, 5).toFixed(3));
	}
	
	if (userSettings.flags.randomizePhase) {
		wave.phase = randomInt(0, 360);
	}
	
	if (userSettings.flags.randomizeDirection) {
		// Generate a random angle in degrees (0-360)
		wave.directionAngle = randomInt(0, 360);
	}
	
	// Now update UI from model
	updateWaveControlsFromModel(index, wave);
	
	// Save and render
	saveSettings();
	requestRender();
}

function randomizeAllWaves() {
	const waveCount = parseInt(document.getElementById("waveCount").value);
	for (let i = 0; i < waveCount; i++) {
		randomizeWave(i);
	}
}


// Add these new functions to moire.js

/**
 * Update grid control values without recreating DOM
 * @param {Object} keyframeSettings - The settings for the active keyframe
 */
function updateGridControlValues(keyframeSettings) {
	const gridCount = appSettings.gridCount;
	const allGridControls = document.querySelectorAll('.grid-control');
	
	// Show/hide controls based on gridCount
	allGridControls.forEach((control, i) => {
		if (i < gridCount) {
			control.style.display = '';
			const grid = keyframeSettings.grids[i];
			
			// Update active checkbox
			const activeCheckbox = control.querySelector(`.gridActive[data-index="${i}"]`);
			if (activeCheckbox) {
				activeCheckbox.checked = grid.isActive !== false;
				
				// Update inactive styling
				if (grid.isActive !== false) {
					control.classList.remove('inactive-control');
					control.querySelectorAll('input, button').forEach(element => {
						if (!element.classList.contains('gridActive')) {
							element.disabled = false;
						}
					});
				} else {
					control.classList.add('inactive-control');
					control.querySelectorAll('input, button').forEach(element => {
						if (!element.classList.contains('gridActive')) {
							element.disabled = true;
						}
					});
				}
			}
			
			// Update input values
			const thicknessInput = control.querySelector(`.lineThickness[data-index="${i}"]`);
			if (thicknessInput) thicknessInput.value = grid.thickness;
			
			const widthInput = control.querySelector(`.cellWidth[data-index="${i}"]`);
			if (widthInput) widthInput.value = grid.width;
			
			const heightInput = control.querySelector(`.cellHeight[data-index="${i}"]`);
			if (heightInput) heightInput.value = grid.height;
			
			const colorInput = control.querySelector(`.color[data-index="${i}"]`);
			if (colorInput) colorInput.value = grid.color;
			
			// Update color button background
			const colorButton = control.querySelector(`.custom-color-button[data-index="${i}"]`);
			if (colorButton) colorButton.style.backgroundColor = grid.color;
		} else {
			control.style.display = 'none';
		}
	});
	
	// Update grid button states
	updateGridButtonStates();
}

/**
 * Update wave control values without recreating DOM
 * @param {Object} keyframeSettings - The settings for the active keyframe
 */
function updateWaveControlValues(keyframeSettings) {
	const waveCount = appSettings.waveCount;
	const allWaveControls = document.querySelectorAll('.wave-control');
	
	// Show/hide controls based on waveCount
	allWaveControls.forEach((control, i) => {
		if (i < waveCount) {
			control.style.display = '';
			const wave = keyframeSettings.waves[i];
			
			// Update active checkbox
			const activeCheckbox = control.querySelector(`.waveActive[data-index="${i}"]`);
			if (activeCheckbox) {
				activeCheckbox.checked = wave.isActive !== false;
				
				// Update inactive styling
				if (wave.isActive !== false) {
					control.classList.remove('inactive-control');
					control.querySelectorAll('input, select, button').forEach(element => {
						if (!element.classList.contains('waveActive')) {
							element.disabled = false;
						}
					});
				} else {
					control.classList.add('inactive-control');
					control.querySelectorAll('input, select, button').forEach(element => {
						if (!element.classList.contains('waveActive')) {
							element.disabled = true;
						}
					});
				}
			}
			
			// Update input values - type, amplitude, frequency, phase
			const typeSelect = control.querySelector(`.waveType[data-index="${i}"]`);
			if (typeSelect) typeSelect.value = wave.type;
			
			const amplitudeInput = control.querySelector(`.waveAmplitude[data-index="${i}"]`);
			if (amplitudeInput) amplitudeInput.value = wave.amplitude;
			
			const frequencyInput = control.querySelector(`.waveFrequency[data-index="${i}"]`);
			if (frequencyInput) frequencyInput.value = wave.frequency;
			
			const phaseInput = control.querySelector(`.wavePhase[data-index="${i}"]`);
			if (phaseInput) phaseInput.value = wave.phase;
			
			// Update phase value display
			const phaseValueElem = control.querySelector(`.wavePhaseValue[data-index="${i}"]`);
			if (phaseValueElem) phaseValueElem.textContent = wave.phase + "°";
			
			// Update direction control
			// We have a dedicated function in direction.js for this
			updateWaveControlsFromModel(i, wave);
		} else {
			control.style.display = 'none';
		}
	});
	
	// Update wave button states
	updateWaveButtonStates();
}


// --- SHARE FEATURE (CLICK) ---
document.getElementById('shareButton').addEventListener('click', (event) => {
	// Generate sharing URL with compressed state
	const shareUrl = generateSharingUrl(appSettings);
	
	// Copy to clipboard
	navigator.clipboard.writeText(shareUrl)
		.then(() => {
			showToast2('Share URL copied to clipboard!', event.clientX, event.clientY);
		})
		.catch(err => {
			console.error('Failed to copy URL: ', err);
			showToast2('Failed to copy URL', event.clientX, event.clientY);
		});
		document.getElementById("shareLinkDiv").textContent = shareUrl;
});

// --- SHARE FEATURE (LOAD) & STATE OVERRIDE ---

function loadUserSettings() {
	try {
		const stored = localStorage.getItem("moireUserSettings");
		if (stored) {
		console.log("Load user settings " + stored);
			const loaded = JSON.parse(stored);
			// Merge with defaults to ensure all properties exist
			userSettings = {
				flags: {
					...userSettings.flags,
					...loaded.flags
				}
			};
		}
	} catch (e) {
		console.error("Error loading user settings:", e);
	}
	
	applyUserSettings();
	
	return userSettings;
}

function saveUserSettings() {
	try {
		const settingsStr = JSON.stringify(userSettings);
		console.log("Save user settings " + settingsStr);
		localStorage.setItem("moireUserSettings", settingsStr);
	} catch (e) {
		console.error("Error saving user settings:", e);
	}
}

function applyUserSettings() {
	console.log("Apply user settings");
	// Apply tooltip setting
	document.getElementById('tooltipToggle').checked = userSettings.flags.tooltipsEnabled;
	toggleTooltips();
	
	// Apply randomization flags to checkboxes
	// (These elements are created in HTML)
	document.getElementById('randomizeTypeFlag').checked = userSettings.flags.randomizeType;
	document.getElementById('randomizeAmplitudeFlag').checked = userSettings.flags.randomizeAmplitude;
	document.getElementById('randomizeFrequencyFlag').checked = userSettings.flags.randomizeFrequency;
	document.getElementById('randomizePhaseFlag').checked = userSettings.flags.randomizePhase;
	document.getElementById('randomizeDirectionFlag').checked = userSettings.flags.randomizeDirection;
}

// Request a render frame, respecting animation state
function requestRender() {
	// If we're already animating, the animation loop will handle rendering soon
   // so we don't need to do anything
   if (animationInterval) {
   	return;
   }
   
   // If we're not animating, render with the current keyframe settings
   const renderSettings = getCurrentRenderSettings();
   viewportManager.renderToCanvas("moireCanvas", renderSettings);
   
   // Also update mini canvas if visible
   const miniContainer = document.getElementById('miniCanvasContainer');
   if (miniContainer && miniContainer.style.display === 'block') {
   	viewportManager.renderToCanvas("miniCanvas", renderSettings);
   }
}

// Extract just the settings needed for rendering from the appSettings object
// this converts a conceptual AppSettings object into a conceptual RenderSettings object,
// matching what interpolateSettings(...) produces
function getCurrentRenderSettings() {
   // Get the active keyframe's settings
   const activeKeyframe = appSettings.activeKeyframe;
   const keyframeSettings = appSettings.keyframes[activeKeyframe];
   
   // Create a clean renderSettings object with only the needed properties
   return {
   	// Global settings
   	gridCount: appSettings.gridCount,
   	waveCount: appSettings.waveCount,
   	gridType: appSettings.gridType,
   	renderMode: appSettings.renderMode,
   	renderStyle: appSettings.renderStyle,
   	waveOffsetType: appSettings.waveOffsetType,
   	
   	// Keyframe-specific settings
   	bgColor: keyframeSettings.bgColor,
   	rotationOffset: keyframeSettings.rotationOffset,
   	commonHue: keyframeSettings.commonHue || 0,
   	commonSaturation: keyframeSettings.commonSaturation || 0,
   	commonLightness: keyframeSettings.commonLightness || 0,
   	commonThickness: keyframeSettings.commonThickness || 1,
   	scale: keyframeSettings.scale || 1,
   	commonAmpFactor: keyframeSettings.commonAmpFactor !== undefined ? keyframeSettings.commonAmpFactor : 1.0,
   	commonFreqFactor: keyframeSettings.commonFreqFactor !== undefined ? keyframeSettings.commonFreqFactor : 1.0,
   	commonDirectionOffset: keyframeSettings.commonDirectionOffset || 0,
   	commonOffset: keyframeSettings.commonOffset || 0,
   	phaseOffset: keyframeSettings.phaseOffset || 0,
   	offsetAngle: keyframeSettings.offsetAngle || 0,
   	offsetMagnitude: keyframeSettings.offsetMagnitude || 10,
   	
   	// Arrays from keyframe
   	grids: keyframeSettings.grids,
   	waves: keyframeSettings.waves
   };
}

// ----------- INIT SUPPORT FUNCTIONS ------

// --- INITIALIZATION ---
(function init() {
	// 0. Load preferences
	loadUserSettings();
	
	// 1. Initialize appSettings from localStorage or defaults
	appSettings = initAppSettings();
	
	// 1.1 Initialize the color picker
	window.colorPicker = new HSVColorPicker();
	window.colorPicker.initialize();
	
	// 1.2 Initialize the rendering system
	initRenderingSystem();

	// 1.3 Init VisibilityManager
    visibilityManager = new VisibilityManager({ isPauseOnScroll: false });
    visibilityManager.registerRenderer(renderer);

	// 2. Try to load URL parameters if present
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has("state")) {
		try {
			// Get state from URL
			const urlState = getStateFromUrl();
			
			// If successful, override appSettings with URL state
			if (urlState) {			
				// Apply URL state
				Object.assign(appSettings, urlState);
				
				// Restore keyframes structure if URL state doesn't have it
				if (!appSettings.keyframes) {
					appSettings.keyframes = keyframes;
					appSettings.activeKeyframe = activeKeyframe;
				}
				
                // Save to localStorage
                saveSettings();
                
                // Redirect to the same page without query parameters
                const cleanUrl = window.location.protocol + "//" + 
                                window.location.host + 
                                window.location.pathname;
                
                // Use replaceState instead of redirect to avoid adding to browser history
                window.history.replaceState({}, "", cleanUrl);
                
                // Log success for debugging
                console.log("Applied state from URL and cleared query parameters");
			}
		} catch (e) {
			console.error("Error parsing state from URL:", e);
		}
	}
	
	// 3. Setup tooltip toggle functionality
	addTooltipToggleStyles();
	document.body.classList.add('tooltips-enabled');
	
	// 4. Update UI from appSettings
	updateUIFromSettings();
	initFavoritesFeature();
	
	// 5. Set up event handlers
	bindEvents();
	bindKeyframeEvents();
	initFullscreenFeature();
	
	// 6. Initial render
	requestRender();
	
	// 7. Start animation if needed
	if (appSettings.animSettings && appSettings.animSettings.autoplay) {
		setTimeout(startAnimation, 100);
	}

})();