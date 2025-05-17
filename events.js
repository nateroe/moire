function bindGridEvents() {
    document.querySelectorAll(".lineThickness, .cellWidth, .cellHeight, .color").forEach(input => {
        input.addEventListener("input", () => {
            // Update the active keyframe's settings directly
            const index = parseInt(input.getAttribute("data-index"));
            const keyframe = appSettings.keyframes[appSettings.activeKeyframe];
            
            // Update the appropriate property based on input class
            if (input.classList.contains("lineThickness")) {
                keyframe.grids[index].thickness = parseFloat(input.value);
            } else if (input.classList.contains("cellWidth")) {
                keyframe.grids[index].width = parseInt(input.value);
            } else if (input.classList.contains("cellHeight")) {
                keyframe.grids[index].height = parseInt(input.value);
            } else if (input.classList.contains("color")) {
                keyframe.grids[index].color = input.value;
            }
			
			// Also update the custom color button if this event was triggered programmatically
			const colorButton = document.querySelector(`.custom-color-button[data-index="${index}"]`);
			if (colorButton) {
				colorButton.style.backgroundColor = input.value;
			}            
			
            saveSettings();
            requestRender();
        });
    });
	
    // Add event handlers for grid active checkboxes
    document.querySelectorAll(".gridActive").forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const index = parseInt(checkbox.getAttribute("data-index"));
            const isActive = checkbox.checked;
            
            // Update both keyframes with the new active state
            for (const keyframeName of ['k1', 'k2']) {
                appSettings.keyframes[keyframeName].grids[index].isActive = isActive;
            }
            
            // Update the UI for the grid row
            const gridRow = checkbox.closest('.grid-control');
            if (gridRow) {
                if (isActive) {
                    gridRow.classList.remove('inactive-control');
                    gridRow.querySelectorAll('input, button').forEach(element => {
                        if (!element.classList.contains('gridActive')) {
                            element.disabled = false;
                        }
                    });
                } else {
                    gridRow.classList.add('inactive-control');
                    gridRow.querySelectorAll('input, button').forEach(element => {
                        if (!element.classList.contains('gridActive')) {
                            element.disabled = true;
                        }
                    });
                }
            }
            
            // Update button states
            updateGridButtonStates();
            
            // Save settings and re-render
            saveSettings();
            requestRender();
        });
    });	
	
	// Disable default browser color picker on hidden inputs
	document.querySelectorAll('.hidden-color-input').forEach(input => {
		input.addEventListener('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
	});
	
	// Custom color picker buttons
	document.querySelectorAll('.custom-color-button').forEach(button => {
		button.addEventListener('click', function(event) {
			// Prevent any default behavior
			event.preventDefault();
			event.stopPropagation();
			
			const index = this.getAttribute('data-index');
			const hiddenInput = this.parentElement.querySelector('.hidden-color-input');
			
			if (hiddenInput) {
				// Open the color picker
				openColorPicker(hiddenInput, (newColor, inputElement) => {
					// Update the button's color
					this.style.backgroundColor = newColor;
					
					// Update the hidden input and trigger its event handlers
					hiddenInput.value = newColor;
					hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
				});
			} else {
				console.error("Hidden color input not found");
			}
		});
	});
}

function bindWaveEvents() {
	document.querySelectorAll(".waveType, .waveAmplitude, .waveFrequency, .waveDirectionX, .waveDirectionY").forEach(input => {
		input.addEventListener("input", () => {			
			const index = parseInt(input.getAttribute("data-index"));
			const keyframe = appSettings.keyframes[appSettings.activeKeyframe];
			
			// Update the appropriate property based on input class
			if (input.classList.contains("waveType")) {
				// For wave type, update BOTH keyframes
				const newType = input.value;
				
				// Update active keyframe
				keyframe.waves[index].type = newType;
				
				// Get the other keyframe and update it too
				const otherKeyframeName = appSettings.activeKeyframe === 'k1' ? 'k2' : 'k1';
				const otherKeyframe = appSettings.keyframes[otherKeyframeName];
				
				// Make sure the wave exists in the other keyframe
				if (otherKeyframe.waves && otherKeyframe.waves[index]) {
					otherKeyframe.waves[index].type = newType;
				}
			} else if (input.classList.contains("waveAmplitude")) {
				keyframe.waves[index].amplitude = parseFloat(input.value);
			} else if (input.classList.contains("waveFrequency")) {
				keyframe.waves[index].frequency = parseFloat(input.value);
			} else if (input.classList.contains("waveDirectionX")) {
				keyframe.waves[index].directionX = parseFloat(input.value);
			} else if (input.classList.contains("waveDirectionY")) {
				keyframe.waves[index].directionY = parseFloat(input.value);
			}
			
			saveSettings();
			requestRender();
		});
	});

    // Add event handlers for wave active checkboxes
    document.querySelectorAll(".waveActive").forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const index = parseInt(checkbox.getAttribute("data-index"));
            const isActive = checkbox.checked;
            
            // Update both keyframes with the new active state
            for (const keyframeName of ['k1', 'k2']) {
                appSettings.keyframes[keyframeName].waves[index].isActive = isActive;
            }
            
            // Update the UI for the wave row
            const waveRow = checkbox.closest('.wave-control');
            if (waveRow) {
                if (isActive) {
                    waveRow.classList.remove('inactive-control');
                    waveRow.querySelectorAll('input, select, button').forEach(element => {
                        if (!element.classList.contains('waveActive')) {
                            element.disabled = false;
                        }
                    });
                } else {
                    waveRow.classList.add('inactive-control');
                    waveRow.querySelectorAll('input, select, button').forEach(element => {
                        if (!element.classList.contains('waveActive')) {
                            element.disabled = true;
                        }
                    });
                }
            }
            
            // Update button states
            updateWaveButtonStates();
            
            // Save settings and re-render
            saveSettings();
            requestRender();
        });
    });
	
	// Special handling for phase sliders to update the displayed value
	document.querySelectorAll(".wavePhase").forEach(input => {
		input.addEventListener("input", (e) => {
			const index = parseInt(e.target.getAttribute("data-index"));
			const valueDisplay = document.querySelector(`.wavePhaseValue[data-index='${index}']`);
			if (valueDisplay) {
				valueDisplay.textContent = e.target.value + "°";
			}
			
			// Update the phase value in the settings
			appSettings.keyframes[appSettings.activeKeyframe].waves[index].phase = parseInt(e.target.value);
			
			saveSettings();
			requestRender();
		});
	});
	
	document.querySelectorAll(".randomizeWave").forEach(button => {
		button.addEventListener("click", (e) => {
			const index = parseInt(e.target.getAttribute("data-index"));
			randomizeWave(index);
		});
	});
}

function bindAnimationEvents() {
	// Duration change
	document.getElementById("animationDuration").addEventListener("change", function() {
		// Update only the animation settings
		appSettings.animSettings = appSettings.animSettings || {};
		appSettings.animSettings.duration = parseFloat(document.getElementById("animationDuration").value);
		
		// Save the complete settings object
		saveSettings();
		
		// Log to debug
		console.log("Updated animation duration, new settings:", JSON.stringify(appSettings));
	});
	
	// Mode change
	document.querySelectorAll('input[name="animationMode"]').forEach(radio => {
		radio.addEventListener("change", function() {
			if (this.checked) {
				// Update mode
				appSettings.animSettings = appSettings.animSettings || {};
				appSettings.animSettings.mode = this.value;
				
				// Save complete object
				saveSettings();
			}
		});
	});
}

function addResetOnDoubleClick() {
	// Track mouse clicks for double-click detection
	let lastClickTime = 0;
	let lastClickTarget = null;
	
	// Single listener for all mousedown events
	document.addEventListener('mousedown', function(event) {
		const target = event.target;
		
		// Check if this is a slider we want to handle
		const isNamedSlider = ['rotationOffset', 'commonHue', 'commonSaturation', 'commonLightness', 'phaseOffset', 'commonOffset', 'commonThickness', 'scale'].includes(target.id);
		const isWaveSlider = target.classList.contains('wavePhase');
		
		if (!isNamedSlider && !isWaveSlider) {
			return; // Not a slider we're interested in
		}
		
		const now = new Date().getTime();
		const timeSince = now - lastClickTime;
		
		// Check for double-click (300ms threshold)
		if (lastClickTarget === target && timeSince < 300) {
			// This is a double-click - prevent default to avoid other handlers
			event.preventDefault();
			event.stopPropagation();
			
			// Reset slider to appropriate value (0 for most, 1 for thickness and scale)
			let resetValue = 0;
			if (target.id === 'commonThickness' || target.id === 'scale') {
				resetValue = 1;
			}
			
			target.value = resetValue;
			
			// Update associated displays
			if (isNamedSlider) {
				const id = target.id;
				const numInput = document.getElementById(`${id}Num`);
				const valueDisplay = document.getElementById(`${id}Value`);
				
				if (numInput) numInput.value = "0";
				if (valueDisplay) valueDisplay.textContent = "0°";
			} 
			else if (isWaveSlider) {
				const index = target.getAttribute('data-index');
				const valueDisplay = document.querySelector(`.wavePhaseValue[data-index='${index}']`);
				
				if (valueDisplay) valueDisplay.textContent = "0°";
			}
			
			// Trigger input event to apply changes
			target.dispatchEvent(new Event('input', {bubbles: true}));
			
			// Show feedback
			const name = isNamedSlider ? target.id : `Wave ${parseInt(target.getAttribute('data-index'))+1} Phase`;
			showToast2(`Reset ${name} to 0`, event.clientX, event.clientY);
		}
		
		// Store this click
		lastClickTarget = target;
		lastClickTime = now;
	}, true); // Use capture phase to get the event before other handlers
	
	// Add double-click handling for number inputs too
	document.querySelectorAll('#rotationOffsetNum, #commonHueNum, #commonSaturationNum, #commonLightnessNum, #phaseOffsetNum, #commonOffsetNum').forEach(input => {
		input.addEventListener('dblclick', function(event) {
			const sliderId = this.id.replace('Num', '');
			const slider = document.getElementById(sliderId);
			
			// Reset to appropriate value (0 for most, 1 for thickness and scale)
			let resetValue = 0;
			if (sliderId === 'commonThickness' || sliderId === 'scale') {
				resetValue = 1;
			}
			
			// Reset values
			this.value = resetValue.toString();
			if (slider) {
				slider.value = 0;
				slider.dispatchEvent(new Event('input', {bubbles: true}));
			}
			
			showToast2(`Reset ${sliderId} to 0`, event.clientX, event.clientY);
		});
	});
}


function bindRandomizeFlagEvents() {
	// Bind events for randomization flags
	document.getElementById('randomizeTypeFlag').addEventListener('change', function() {
		userSettings.flags.randomizeType = this.checked;
		saveUserSettings();
	});
	
	document.getElementById('randomizeAmplitudeFlag').addEventListener('change', function() {
		userSettings.flags.randomizeAmplitude = this.checked;
		saveUserSettings();
	});
	
	document.getElementById('randomizeFrequencyFlag').addEventListener('change', function() {
		userSettings.flags.randomizeFrequency = this.checked;
		saveUserSettings();
	});
	
	document.getElementById('randomizePhaseFlag').addEventListener('change', function() {
		userSettings.flags.randomizePhase = this.checked;
		saveUserSettings();
	});
	
	document.getElementById('randomizeDirectionFlag').addEventListener('change', function() {
		userSettings.flags.randomizeDirection = this.checked;
		saveUserSettings();
	});
}

function bindEvents() {
	bindAnimationEvents();

	// Add double-click reset for all sliders
	addResetOnDoubleClick();

	// Bind grid control events
	bindGridEvents();
	
	// Bind wave control events
	bindWaveEvents();
	
	// Redundant comment
	bindRandomizeFlagEvents();

	// View Favorites button
	document.getElementById("viewFavoritesButton").addEventListener("click", () => {
		// Open favorites.html in a new tab
		window.open("favorites.html", "_blank");
	});
	
	// View Gallery button
	document.getElementById("viewGalleryButton").addEventListener("click", () => {
		// Open gallery.html in a new tab
		window.open("gallery.html", "_blank");
	});
	
	// Global controls
	document.getElementById("bgColor").addEventListener("input", () => {
		// Update active keyframe's bgColor
		appSettings.keyframes[appSettings.activeKeyframe].bgColor = document.getElementById("bgColor").value;
		saveSettings();
		requestRender();
	});
	
	document.getElementById("gridCount").addEventListener("change", () => {
		// Get the old grid count before updating
		const oldGridCount = appSettings.gridCount;
		
		// Get the new count from the input
		const newGridCount = parseInt(document.getElementById("gridCount").value);
		
		// If we're adding grids (newCount > oldCount)
		if (newGridCount > oldGridCount) {
			// Apply changes to both keyframes
			for (const keyframeName of ['k1', 'k2']) {
				const keyframe = appSettings.keyframes[keyframeName];
				
				// If there's at least one existing grid to copy from
				if (oldGridCount > 0) {
					// Get the last grid to copy dimensions from for this keyframe
					const lastGrid = keyframe.grids[oldGridCount - 1];
					
					// For each new grid being added
					for (let i = oldGridCount; i < newGridCount; i++) {
						// The grids array should already have default values from MoireUtils.DEFAULT_SETTINGS
						// We just need to update width and height
						if (!keyframe.grids[i]) {
							keyframe.grids[i] = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.grids[i]));
						}
						
						// Copy just the width and height
						keyframe.grids[i].width = lastGrid.width;
						keyframe.grids[i].height = lastGrid.height;
					}
				}
			}
		}
		
		// Update global gridCount
		appSettings.gridCount = newGridCount;
		
		// Update grid controls for the active keyframe
		createGridControls(appSettings.keyframes[appSettings.activeKeyframe]);
		
		// Save and render
		saveSettings();
		requestRender();
	});
						
	// Rotation Offset slider
	document.getElementById("rotationOffset").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		document.getElementById("rotationOffsetNum").value = value.toFixed(1);
		document.getElementById("rotationOffsetValue").textContent = value.toFixed(1) + "°";
		
		// Update active keyframe's rotationOffset
		appSettings.keyframes[appSettings.activeKeyframe].rotationOffset = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("rotationOffsetNum").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= 0 && value <= 360) {
			document.getElementById("rotationOffset").value = value;
		}
		document.getElementById("rotationOffsetValue").textContent = value.toFixed(1) + "°";
		
		// Update active keyframe's rotationOffset
		appSettings.keyframes[appSettings.activeKeyframe].rotationOffset = value;
		saveSettings();
		requestRender();
	});

	// Common Hue slider
	document.getElementById("commonHue").addEventListener("input", (e) => {
		const value = parseInt(e.target.value);
		document.getElementById("commonHueNum").value = value;
		document.getElementById("commonHueValue").textContent = value + "°";
		
		// Update active keyframe's commonHue
		appSettings.keyframes[appSettings.activeKeyframe].commonHue = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("commonHueNum").addEventListener("input", (e) => {
		const value = parseInt(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= -360 && value <= 360) {
			document.getElementById("commonHue").value = value;
		}
		document.getElementById("commonHueValue").textContent = value + "°";
		
		// Update active keyframe's commonHue
		appSettings.keyframes[appSettings.activeKeyframe].commonHue = value;
		saveSettings();
		requestRender();
	});

	// Common Saturation slider
	document.getElementById("commonSaturation").addEventListener("input", (e) => {
		const value = parseInt(e.target.value);
		document.getElementById("commonSaturationNum").value = value;
		document.getElementById("commonSaturationValue").textContent = value + "%";
		
		// Update active keyframe's commonSaturation
		appSettings.keyframes[appSettings.activeKeyframe].commonSaturation = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("commonSaturationNum").addEventListener("input", (e) => {
		const value = parseInt(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= -100 && value <= 100) {
			document.getElementById("commonSaturation").value = value;
		}
		document.getElementById("commonSaturationValue").textContent = value + "%";
		
		// Update active keyframe's commonSaturation
		appSettings.keyframes[appSettings.activeKeyframe].commonSaturation = value;
		saveSettings();
		requestRender();
	});

	// Common Lightness slider
	document.getElementById("commonLightness").addEventListener("input", (e) => {
		const value = parseInt(e.target.value);
		document.getElementById("commonLightnessNum").value = value;
		document.getElementById("commonLightnessValue").textContent = value + "%";
		
		// Update active keyframe's commonLightness
		appSettings.keyframes[appSettings.activeKeyframe].commonLightness = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("commonLightnessNum").addEventListener("input", (e) => {
		const value = parseInt(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= -100 && value <= 100) {
			document.getElementById("commonLightness").value = value;
		}
		document.getElementById("commonLightnessValue").textContent = value + "%";
		
		// Update active keyframe's commonLightness
		appSettings.keyframes[appSettings.activeKeyframe].commonLightness = value;
		saveSettings();
		requestRender();
	});

	// Common Thickness slider
	document.getElementById("commonThickness").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		document.getElementById("commonThicknessNum").value = value.toFixed(2);
		document.getElementById("commonThicknessValue").textContent = value.toFixed(2);
		
		// Update active keyframe's commonThickness
		appSettings.keyframes[appSettings.activeKeyframe].commonThickness = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("commonThicknessNum").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= 0 && value <= 1) {
			document.getElementById("commonThickness").value = value;
		}
		document.getElementById("commonThicknessValue").textContent = value.toFixed(2);
		
		// Update active keyframe's commonThickness
		appSettings.keyframes[appSettings.activeKeyframe].commonThickness = value;
		saveSettings();
		requestRender();
	});

	// Scale slider
	document.getElementById("scale").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		document.getElementById("scaleNum").value = value.toFixed(2);
		document.getElementById("scaleValue").textContent = value.toFixed(2);
		
		// Update active keyframe's scale
		appSettings.keyframes[appSettings.activeKeyframe].scale = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("scaleNum").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= 0 && value <= 1) {
			document.getElementById("scale").value = value;
		}
		document.getElementById("scaleValue").textContent = value.toFixed(2);
		
		// Update active keyframe's scale
		appSettings.keyframes[appSettings.activeKeyframe].scale = value;
		saveSettings();
		requestRender();
	});
	
	document.getElementById("gridType").addEventListener("input", () => {
		// Update gridType
		appSettings.gridType = document.getElementById("gridType").value;
		saveSettings();
		requestRender();
	});
	
	document.getElementById("renderMode").addEventListener("input", () => {
		// Update renderMode
		appSettings.renderMode = document.getElementById("renderMode").value;
		saveSettings();
		requestRender();
	});

	document.getElementById("renderStyle").addEventListener("input", () => {
		// Update renderStyle
		appSettings.renderStyle = document.getElementById("renderStyle").value;
		saveSettings();
		requestRender();
	});
	
	// Wave-specific controls
	document.getElementById("waveCount").addEventListener("input", () => {
		// Update global waveCount
		appSettings.waveCount = parseInt(document.getElementById("waveCount").value);
		
		// Update wave controls
		createWaveControlsWithDirectionControl(appSettings.keyframes[appSettings.activeKeyframe]);
		
		// Save and render
		saveSettings();
		requestRender();
	});

	document.getElementById("waveOffsetType").addEventListener("change", () => {
		// Update aveOffsetType
		appSettings.waveOffsetType = document.getElementById("waveOffsetType").value;
		
		toggleWaveOffsetControls();
		saveSettings();
		requestRender();
	});
	
	document.getElementById("phaseOffset").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		document.getElementById("phaseOffsetNum").value = value.toFixed(2);
		document.getElementById("phaseOffsetValue").textContent = value.toFixed(2) + "°";
		
		// Update active keyframe's phaseOffset
		appSettings.keyframes[appSettings.activeKeyframe].phaseOffset = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("phaseOffsetNum").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= -360 && value <= 360) {
			document.getElementById("phaseOffset").value = value;
		}
		document.getElementById("phaseOffsetValue").textContent = value.toFixed(2) + "°";
		
		// Update active keyframe's phaseOffset
		appSettings.keyframes[appSettings.activeKeyframe].phaseOffset = value;
		saveSettings();
		requestRender();
	});
	
	document.getElementById("offsetAngle").addEventListener("input", (e) => {
		// Update active keyframe's offsetAngle
		appSettings.keyframes[appSettings.activeKeyframe].offsetAngle = parseFloat(e.target.value);
		document.getElementById("offsetAngleValue").textContent = e.target.value + "°";
		saveSettings();
		requestRender();
	});
	
	document.getElementById("offsetMagnitude").addEventListener("input", () => {
		// Update active keyframe's offsetMagnitude
		appSettings.keyframes[appSettings.activeKeyframe].offsetMagnitude = parseFloat(document.getElementById("offsetMagnitude").value);
		saveSettings();
		requestRender();
	});

	document.getElementById("commonOffset").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		document.getElementById("commonOffsetNum").value = value.toFixed(2);
		document.getElementById("commonOffsetValue").textContent = value.toFixed(2) + "°";
		
		// Update active keyframe's commonOffset
		appSettings.keyframes[appSettings.activeKeyframe].commonOffset = value;
		saveSettings();
		requestRender();
	});				

	document.getElementById("commonOffsetNum").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= -360 && value <= 360) {
			document.getElementById("commonOffset").value = value;
		}
		document.getElementById("commonOffsetValue").textContent = value.toFixed(2) + "°";
		
		// Update active keyframe's commonOffset
		appSettings.keyframes[appSettings.activeKeyframe].commonOffset = value;
		saveSettings();
		requestRender();
	});

	// Common Amp Factor slider
	document.getElementById("commonAmpFactor").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		document.getElementById("commonAmpFactorNum").value = value.toFixed(2);
		document.getElementById("commonAmpFactorValue").textContent = value.toFixed(2);
		
		// Update active keyframe's commonAmpFactor
		appSettings.keyframes[appSettings.activeKeyframe].commonAmpFactor = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("commonAmpFactorNum").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= 0 && value <= 1) {
			document.getElementById("commonAmpFactor").value = value;
		}
		document.getElementById("commonAmpFactorValue").textContent = value.toFixed(2);
		
		// Update active keyframe's commonAmpFactor
		appSettings.keyframes[appSettings.activeKeyframe].commonAmpFactor = value;
		saveSettings();
		requestRender();
	});

	// Common Freq Factor slider
	document.getElementById("commonFreqFactor").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		document.getElementById("commonFreqFactorNum").value = value.toFixed(2);
		document.getElementById("commonFreqFactorValue").textContent = value.toFixed(2);
		
		// Update active keyframe's commonFreqFactor
		appSettings.keyframes[appSettings.activeKeyframe].commonFreqFactor = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("commonFreqFactorNum").addEventListener("input", (e) => {
		const value = parseFloat(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= -1 && value <= 1) {
			document.getElementById("commonFreqFactor").value = value;
		}
		document.getElementById("commonFreqFactorValue").textContent = value.toFixed(2);
		
		// Update active keyframe's commonFreqFactor
		appSettings.keyframes[appSettings.activeKeyframe].commonFreqFactor = value;
		saveSettings();
		requestRender();
	});

	// Common Direction Offset slider
	document.getElementById("commonDirectionOffset").addEventListener("input", (e) => {
		const value = parseInt(e.target.value);
		document.getElementById("commonDirectionOffsetNum").value = value;
		document.getElementById("commonDirectionOffsetValue").textContent = value + "°";
		
		// Update active keyframe's commonDirectionOffset
		appSettings.keyframes[appSettings.activeKeyframe].commonDirectionOffset = value;
		saveSettings();
		requestRender();
	});

	document.getElementById("commonDirectionOffsetNum").addEventListener("input", (e) => {
		const value = parseInt(e.target.value);
		// Only update the slider if the value is within its range
		if (value >= -360 && value <= 360) {
			document.getElementById("commonDirectionOffset").value = value;
		}
		document.getElementById("commonDirectionOffsetValue").textContent = value + "°";
		
		// Update active keyframe's commonDirectionOffset
		appSettings.keyframes[appSettings.activeKeyframe].commonDirectionOffset = value;
		saveSettings();
		requestRender();
	});
	
	document.getElementById("randomizeAllWaves").addEventListener("click", randomizeAllWaves);

	// Add keyboard event listener for fullscreen controls (ie, spacebar)
	document.addEventListener('keydown', handleFullscreenKeyPress);

	// Add drag initialization
	initDragAndDrop();
}

function bindKeyframeEvents() {
	// Add keyframe binding radio button event handlers
	document.querySelectorAll('input[name="activeKeyframeControl"]').forEach(radio => {
		radio.addEventListener('change', (e) => {
			if (e.target.checked) {
				// Update the active keyframe
				appSettings.activeKeyframe = e.target.value; // Just set to 'k1' or 'k2'
				
				// Display the newly active keyframe
				updateUIFromSettings();
				
				// Render the updated settings
				if (!animationInterval) {
					requestRender();	
				}
			}
		});
	});
	
	// Add button event handlers
	document.getElementById('copyToOtherKeyframe').addEventListener('click', copyToOtherKeyframe);
	document.getElementById('clearKeyframes').addEventListener('click', resetCurrentKeyframe);
}