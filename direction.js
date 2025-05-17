// --- WAVE DIRECTION CONTROL ---

/**
 * Wave Direction Control class
 * Provides a UI control for selecting direction vectors via angle
 */
class WaveDirectionControl {
	constructor(containerId, index, initialAngle, onChange) {
		this.container = document.getElementById(containerId);
		if (!this.container) {
			console.error(`Container '${containerId}' not found`);
			return;
		}
		
		this.index = index;
		this.angle = initialAngle || 0;
		this.onChange = onChange;
		this.isDragging = false;
		
		// Create the control elements
		this.createControlElements();
		
		// Set the initial angle
		this.updateFromAngle(this.angle);
		
		// Attach event listeners
		this.attachEventListeners();
	}
	
	/**
	 * Create all necessary control elements
	 */
	createControlElements() {
		// Create container for both controls
		const directionContainer = document.createElement('div');
		directionContainer.className = 'direction-control-container';
		directionContainer.setAttribute('data-index', this.index);
		
		// Canvas for visual direction control
		this.canvas = document.createElement('canvas');
		this.canvas.className = 'direction-canvas';
		this.canvas.width = 30;
		this.canvas.height = 30;
		this.canvas.setAttribute('data-index', this.index);
		
		// Label for angle input
		const angleLabel = document.createElement('span');
		angleLabel.textContent = 'Angle:';
		
		// Input for direct angle entry
		this.angleInput = document.createElement('input');
		this.angleInput.type = 'number';
		this.angleInput.min = '-3600';
		this.angleInput.max = '3600';
		this.angleInput.step = '0.1';
		this.angleInput.style.width = '60px';
		this.angleInput.setAttribute('data-index', this.index);
		
		// Degree symbol
		const degreeSpan = document.createElement('span');
		degreeSpan.textContent = '°';
		
		// Put it all together
		const inputGroup = document.createElement('div');
		inputGroup.className = 'direction-input-group';
		inputGroup.appendChild(angleLabel);
		inputGroup.appendChild(this.angleInput);
		inputGroup.appendChild(degreeSpan);
		
		directionContainer.appendChild(this.canvas);
		directionContainer.appendChild(inputGroup);
		
		// Add to the parent container
		this.container.appendChild(directionContainer);
		
		// Store context for drawing
		this.ctx = this.canvas.getContext('2d');
	}
	
	/**
	 * Attach event listeners to both canvas and angle input
	 */
	attachEventListeners() {
		// Canvas events for mouse interaction
		this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
		window.addEventListener('mousemove', this.onMouseMove.bind(this));
		window.addEventListener('mouseup', this.onMouseUp.bind(this));
		
		// For mobile support
		this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
		this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
		this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
		
		// Input event for direct angle entry
		this.angleInput.addEventListener('input', this.onAngleInput.bind(this));
	}
	
	/**
	 * Get center coordinates of the canvas
	 */
	getCenter() {
		return { x: this.canvas.width / 2, y: this.canvas.height / 2 };
	}
	
	/**
	 * Mouse/Touch event handlers
	 */
	onMouseDown(event) {
		event.preventDefault();
		this.isDragging = true;
		this.updateDirectionFromEvent(event);
	}
	
	onMouseMove(event) {
		if (this.isDragging) {
			this.updateDirectionFromEvent(event);
		}
	}
	
	onMouseUp() {
		this.isDragging = false;
	}
	
	onTouchStart(event) {
		event.preventDefault();
		this.isDragging = true;
		this.updateDirectionFromEvent(event.touches[0]);
	}
	
	onTouchMove(event) {
		if (this.isDragging) {
			event.preventDefault();
			this.updateDirectionFromEvent(event.touches[0]);
		}
	}
	
	onTouchEnd() {
		this.isDragging = false;
	}
	
	onAngleInput(event) {
		// Get the angle from the input and update directly
		let angle = parseFloat(event.target.value);
		this.updateFromAngle(angle);
	}
	
	/**
	 * Update direction based on mouse/touch event
	 */
	updateDirectionFromEvent(event) {
		const rect = this.canvas.getBoundingClientRect();
		const center = this.getCenter();
		
		// Calculate relative coordinates
		const dx = event.clientX - rect.left - center.x;
		const dy = event.clientY - rect.top - center.y;
		
		// Calculate angle in degrees (0-360)
		const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
		
		// Update the control with the new angle
		this.updateFromAngle(angle);
	}
	
	/**
	 * Update control from angle (in degrees)
	 */
	updateFromAngle(angle) {
		// Store the original angle (not normalized)
		this.angle = angle;
		
		// Update the input value (use original angle)
		this.angleInput.value = angle.toFixed(1);
		
		// Draw the control with normalized angle for visualization
		this.draw();
		
		// Call the onChange callback with just the angle
		if (this.onChange) {
			this.onChange(this.index, this.angle);
		}
	}
	
	/**
	 * Set the angle programmatically
	 */
	setAngle(angle) {
		this.updateFromAngle(angle);
	}
	
	/**
	 * Draw the control
	 */
	draw() {
		const ctx = this.ctx;
		const { width: w, height: h } = this.canvas;
		const center = this.getCenter();
		const radius = Math.min(w, h) / 2 - 2;
		
		// Use a normalized angle for drawing (0-360)
		const normalizedAngle = ((this.angle % 360) + 360) % 360;
		const angleRad = normalizedAngle * Math.PI / 180;
		
		// Clear canvas
		ctx.clearRect(0, 0, w, h);
		
		// Draw background
		ctx.fillStyle = '#222';
		ctx.fillRect(0, 0, w, h);
		
		// Draw the circular guide
		ctx.strokeStyle = '#666';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
		ctx.stroke();
		
		// Draw the center point
		ctx.fillStyle = 'white';
		ctx.fillRect(center.x - 1, center.y - 1, 2, 2);
		
		// Draw the direction indicator using normalized coordinates
		const dx = Math.cos(angleRad) * radius;
		const dy = Math.sin(angleRad) * radius;
		
		// Draw the line
		ctx.strokeStyle = '#4ba3ff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(center.x, center.y);
		ctx.lineTo(center.x + dx, center.y + dy);
		ctx.stroke();
		
		// Draw the end point
		ctx.fillStyle = '#4ba3ff';
		ctx.beginPath();
		ctx.arc(center.x + dx, center.y + dy, 3, 0, 2 * Math.PI);
		ctx.fill();
	}
}

// --- INTEGRATION WITH EXISTING WAVE CONTROLS ---

/**
 * Create a direction control for a wave
 */
function createWaveDirectionControl(waveControl, index, wave) {
    // Find the container for the direction control in this wave control
    const container = waveControl.querySelector('.direction-control');
    if (!container) {
        console.error(`Direction control container not found for wave ${index}`);
        return null;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Get the initial angle from the wave model
    let initialAngle = wave.directionAngle;
    
    // Default to 0 if not defined
    if (initialAngle === undefined) {
        initialAngle = 0;
        
        // Also set the angle in the data model
        const keyframe = appSettings.keyframes[appSettings.activeKeyframe];
        keyframe.waves[index].directionAngle = initialAngle;
    }
    
    // Create and store the control
    const control = new WaveDirectionControl(
        container.id, 
        index, 
        initialAngle, 
        (index, angle) => {
            // Update the model with only the angle
            const keyframe = appSettings.keyframes[appSettings.activeKeyframe];
            keyframe.waves[index].directionAngle = angle;
            
            // Save settings and render
            saveSettings();
            requestRender();
        }
    );
    
    // Store a reference to the control on the canvas element
    const canvas = container.querySelector('.direction-canvas');
    if (canvas) {
        canvas.__waveDirectionControl = control;
    }
    
    return control;
}

// --- MODIFY WAVE CONTROL CREATION FUNCTION ---

/**
 * Modified function to create wave controls with direction control
 * This replaces your existing createWaveControls function
 */
function createWaveControlsWithDirectionControl(keyframeSettings) {
	const waveControls = document.getElementById("waveControls");
	const waveCount = appSettings.waveCount;
	
	console.log(`Using waveCount=${waveCount}`);
	
	waveControls.innerHTML = "";

	// Add "All Active" and "Disable All" buttons above wave controls
	if (waveCount > 0) {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "control-buttons";
        buttonContainer.innerHTML = `
            <button id="allWavesActive" class="small-button">All Active</button>
            <button id="noWavesActive" class="small-button">Disable All</button>
        `;
        waveControls.appendChild(buttonContainer);
        
        // Bind events for these buttons
        document.getElementById("allWavesActive").addEventListener("click", setAllWavesActive);
        document.getElementById("noWavesActive").addEventListener("click", setNoWavesActive);
    }
	
	for (let i = 0; i < waveCount; i++) {
		const wave = keyframeSettings.waves[i];
		const div = document.createElement("div");
		div.className = "wave-control";
		div.setAttribute("data-index", i);

		// apply inactive style
		if (!wave.isActive) {
			div.classList.add("inactive-control");
		}
		
		// Add a persistent name attribute (that won't change during reordering)
		const waveName = wave.name || `Wave ${i + 1}`;
		div.setAttribute("data-name", waveName);
		
		// Add drag handle
		const handle = document.createElement("div");
		handle.className = "drag-handle";
		div.appendChild(handle);
		
		// Create content container
		const content = document.createElement("div");
		content.className = "control-content";

		// Add wave name
		const nameLabel = document.createElement("label");
		nameLabel.textContent = waveName;
		content.appendChild(nameLabel);

		// Add isActive checkbox
		const activeCheckbox = document.createElement("label");
		activeCheckbox.className = "active-checkbox tooltip-trigger";
		activeCheckbox.innerHTML = `
			<input type="checkbox" data-index="${i}" class="waveActive" ${wave.isActive ? 'checked' : ''}>
			<span>Active</span>
			<span class="tooltip-text">Enable/disable this wave effect</span>
		`;
		content.appendChild(activeCheckbox);

		// Add rest of controls
		const controlsHTML = document.createElement('div');
		controlsHTML.innerHTML = `
			<label class="tooltip-trigger">Type: 
				<select class="waveType" data-index="${i}" ${!wave.isActive ? 'disabled' : ''}>
					<option value="transverse" ${wave.type === 'transverse' ? 'selected' : ''}>Transverse</option>
					<option value="longitude" ${wave.type === 'longitude' ? 'selected' : ''}>Longitude</option>
					<option value="amplitude" ${wave.type === 'amplitude' ? 'selected' : ''}>Amplitude</option>
					<option value="hue" ${wave.type === 'hue' ? 'selected' : ''}>Hue</option>
					<option value="saturation" ${wave.type === 'saturation' ? 'selected' : ''}>Saturation</option>
					<option value="lightness" ${wave.type === 'lightness' ? 'selected' : ''}>Lightness</option>
					<option value="rotation" ${wave.type === 'rotation' ? 'selected' : ''}>Rotation</option>
					<option value="phaseshift" ${wave.type === 'phaseshift' ? 'selected' : ''}>Phase Shift</option>
				</select>
				<span class="tooltip-text">Transverse: perpendicular waves. Longitude: parallel waves. Amplitude: size modulation. Hue: color shifting waves. Saturation: color intensity waves. Lightness: brightness waves. Rotation: grid rotation waves. Phase Shift: wave phase offset.</span>
			</label>
			<label class="tooltip-trigger">Amp: 
				<input type="number" min="0" max="100" step="0.1" value="${wave.amplitude}" data-index="${i}" class="waveAmplitude" ${!wave.isActive ? 'disabled' : ''}>
				<span class="tooltip-text">Controls wave effect strength. For hue waves, this is the maximum hue angle shift in degrees.</span>
			</label>
			<label class="tooltip-trigger">Freq: 
				<input type="number" min="0" max="100" step="0.1" value="${wave.frequency}" data-index="${i}" class="waveFrequency" ${!wave.isActive ? 'disabled' : ''}>
				<span class="tooltip-text">Controls oscillation density.</span>
			</label>
			<label class="tooltip-trigger">Phase: 
				<input type="range" min="-360" max="360" step="1" value="${wave.phase}" data-index="${i}" class="wavePhase" ${!wave.isActive ? 'disabled' : ''}>
				<span class="wavePhaseValue" data-index="${i}">${wave.phase}°</span>
				<span class="tooltip-text">Starting position in wave cycle. Double-click to reset.</span>
			</label>
			<div id="wave-direction-${i}" class="direction-control tooltip-trigger">
				<span class="tooltip-text">Sets the direction of the wave propagation.</span>
			</div>
			<button class="randomizeWave tooltip-trigger" data-index="${i}" ${!wave.isActive ? 'disabled' : ''}>Randomize
				<span class="tooltip-text">Generate random parameters for this wave. Obeys Randomize flags above.</span>
			</button>
		`;

		// Append all the children from the temporary container
		while (controlsHTML.firstChild) {
			content.appendChild(controlsHTML.firstChild);
		}
		
		div.appendChild(content);
		waveControls.appendChild(div);
		
		// Initialize the direction control for this wave
		setTimeout(() => {
			createWaveDirectionControl(div, i, wave);
		}, 0);
	}
	
	bindWaveEvents();
	
	// Initialize drag after controls are created
	setTimeout(() => {
		initDragForContainer("waveControls");
	}, 10);
}


// Update wave button states based on current active status
function updateWaveButtonStates() {
    const activeKeyframe = appSettings.activeKeyframe;
    const waves = appSettings.keyframes[activeKeyframe].waves;
    const waveCount = appSettings.waveCount;
    
    // Count active waves
    const activeCount = waves.slice(0, waveCount).filter(wave => wave.isActive).length;
    
    // Update button states
    const allActiveBtn = document.getElementById("allWavesActive");
    const noneActiveBtn = document.getElementById("noWavesActive");
    
    if (allActiveBtn) {
        allActiveBtn.disabled = (activeCount === waveCount);
    }
    
    if (noneActiveBtn) {
        noneActiveBtn.disabled = (activeCount === 0);
    }
}

// Set all waves active
function setAllWavesActive() {
    // Update both keyframes
    for (const keyframeName of ['k1', 'k2']) {
        const waves = appSettings.keyframes[keyframeName].waves;
        for (let i = 0; i < appSettings.waveCount; i++) {
            waves[i].isActive = true;
        }
    }
    
    // Update UI and render
    updateUIFromSettings();
	updateWaveButtonStates();
    saveSettings();
    requestRender();
}

// Set no waves active
function setNoWavesActive() {
    // Update both keyframes
    for (const keyframeName of ['k1', 'k2']) {
        const waves = appSettings.keyframes[keyframeName].waves;
        for (let i = 0; i < appSettings.waveCount; i++) {
            waves[i].isActive = false;
        }
    }
    
    // Update UI and render
    updateUIFromSettings();
	updateWaveButtonStates();
    saveSettings();
    requestRender();
}

// --- INITIALIZATION AND OVERRIDE ---

/**
 * Initialize the direction controls
 */
function initWaveDirectionControls() {
	// Modify the randomizeWave function to update the direction control
	window.originalRandomizeWave = window.randomizeWave;
	window.randomizeWave = function(index) {
		// Call the original function
		window.originalRandomizeWave(index);
		
		// Now update the direction control
		const wave = appSettings.keyframes[appSettings.activeKeyframe].waves[index];
		const directionControl = document.querySelector(`#wave-direction-${index} .direction-canvas`);
		
		if (directionControl) {
			// Find the control container
			const container = document.getElementById(`wave-direction-${index}`);
			
			// Recreate the control with the new values
			setTimeout(() => {
				container.innerHTML = '';
				createWaveDirectionControl(
					document.querySelector(`.wave-control[data-index="${index}"]`),
					index,
					wave
				);
			}, 0);
		}
	};
	
	// Update wave controls for active keyframe
	const activeKeyframe = appSettings.activeKeyframe;
	if (activeKeyframe && appSettings.keyframes[activeKeyframe]) {
		createWaveControlsWithDirectionControl(appSettings.keyframes[activeKeyframe]);
	}
	
	console.log("Wave direction controls initialized!");
}

// Initialize when the document is fully loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
	setTimeout(initWaveDirectionControls, 100);
} else {
	document.addEventListener("DOMContentLoaded", () => {
		setTimeout(initWaveDirectionControls, 100);
	});
}

// Update UI from model for a specific wave
function updateWaveControlsFromModel(index, wave) {
    document.querySelector(`.waveType[data-index='${index}']`).value = wave.type;
    document.querySelector(`.waveAmplitude[data-index='${index}']`).value = wave.amplitude;
    document.querySelector(`.waveFrequency[data-index='${index}']`).value = wave.frequency;
    
    const phaseElem = document.querySelector(`.wavePhase[data-index='${index}']`);
    phaseElem.value = wave.phase;
    
    const phaseValueElem = document.querySelector(`.wavePhaseValue[data-index='${index}']`);
    if (phaseValueElem) {
        phaseValueElem.textContent = wave.phase + "°";
    }
    
    // Update direction control if it exists
    const container = document.querySelector(`.wave-control[data-index="${index}"]`);
    if (container) {
        // Get the angle directly from the wave model
        let angle = wave.directionAngle;
        
        // Default to 0 if not defined
        if (angle === undefined) {
            angle = 0;
            // Also update the model
            const keyframe = appSettings.keyframes[appSettings.activeKeyframe];
            keyframe.waves[index].directionAngle = angle;
        }
        
        // Find the direction control for this wave
        const directionControl = container.querySelector(`.direction-canvas[data-index="${index}"]`);
        if (directionControl && directionControl.__waveDirectionControl) {
            // If the control instance is attached to the element, update it
            directionControl.__waveDirectionControl.setAngle(angle);
        } else {
            // If no control instance found, recreate it
            const dirContainer = container.querySelector('.direction-control');
            if (dirContainer) {
                setTimeout(() => {
                    createWaveDirectionControl(container, index, wave);
                }, 0);
            }
        }
    }
}		
