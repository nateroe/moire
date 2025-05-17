
let sharedWebGLManager = null;

/**
 * MoireRenderer.js - Refactored for better decoupling
 */
class MoireRenderer {
    constructor(canvas, initialSettings = null, shareContext = true, webGLManager = null, useGlobalSettings = false) {
        // Accept canvas as-is without DOM lookup
        this.canvas = canvas;
        
        // Ensure canvas has an ID for WebGL manager
        if (!canvas.id) {
            canvas.id = 'moire_' + Math.floor(Math.random() * 10000);
        }
		this.canvasId = canvas.id;
        
		// Track whether to use global settings
        this.useGlobalSettings = useGlobalSettings;
		
         // Store reference or copy based on mode
        if (useGlobalSettings) {
            // Editor mode: don't store settings, will read global
            this.settings = null;
        } else {
            // Gallery mode: store encapsulated copy
            this.settings = initialSettings;
        }
       
        // External animation control
        this.animationController = null; 
        
        // State
        this.hasRenderedOnce = false;
        this.presentationMode = false;
        this.pausedT = 0;
		
		this.secondaryCanvases = []; // This is referenced but never initialized
		this.wasAnimatingBeforePaused = false; // Referenced in pause() but not initialized
		this.pauseTime = 0; // Referenced in pause() but not initialized		
		
        // Use provided manager or create/share one
        if (webGLManager) {
            // Explicitly provided manager takes precedence
            this.webGLManager = webGLManager;
        } else if (shareContext) {
            // Use shared manager if one exists, otherwise create it
            if (!sharedWebGLManager) {
                // Default to ViewportSwitchingManager for better performance
                sharedWebGLManager = new ViewportSwitchingManager();
            }
            this.webGLManager = sharedWebGLManager;
        } else {
            // Create a new isolated manager
            this.webGLManager = new ViewportSwitchingManager();
        }
        
        // Register this canvas with the manager
        if (this.webGLManager && this.webGLManager.registerCanvas) {
            this.webGLManager.registerCanvas(this.canvas, this.canvas.width, this.canvas.height);
        }
    }
    
	/**
	 * Set the shared WebGL manager (called from main app initialization)
	 */
	static setSharedManager(manager) {
		sharedWebGLManager = manager;
	}
		
    /**
     * Render a specific frame at time t (0-1)
     */
    renderFrame(t) {
        const interpolated = this.interpolateSettings(t);
        this.renderSettings(interpolated);

		// Also render to secondary canvases
		for (const canvasId of this.secondaryCanvases) {
			try {
				this.webGLManager.renderToCanvas(canvasId, interpolated);
			} catch (err) {
				console.error(`Error rendering to secondary canvas ${canvasId}:`, err);
			}
		}
		
		return true;
    }
    
    /**
     * Render with specific settings (decoupled from state)
     */
    renderSettings(renderSettings) {
        if (!this.webGLManager) {
            throw new Error('WebGL manager not initialized');
        }
        
        try {
            this.webGLManager.renderToCanvas(this.canvasId, renderSettings);
            this.hasRenderedOnce = true;
            return true;
        } catch (err) {
            console.error('Error rendering:', err);
            return false;
        }
    }
    
    /**
     * Render current state (for compatibility)
     */
    render() {
        let renderSettings;
        if (this.presentationMode && !this.animationController && this.pausedT > 0) {
            renderSettings = this.interpolateSettings(this.pausedT);
        } else {
            renderSettings = this.extractRenderSettings();
        }
        
        return this.renderSettings(renderSettings);
    }
    
    /**
     * Start animation 
     */
    startAnimation() {
		if (typeof requestAnimationFrame === 'undefined') {
			throw new Error('No animation frame API available');
		}
		
		// Initialize timing
		this.animationStartTime = performance.now();
		this.animationFrame = true; // Flag for compatibility
		
		const animate = (timestamp) => {
			if (!this.animationFrame) return;
			
			// Get fresh settings each frame
			const currentSettings = this.getCurrentSettings();
			
			// Use options if provided, otherwise use current settings
			const duration = currentSettings.animSettings.duration * 1000;
			const mode = currentSettings.animSettings.mode;
			
			const elapsed = timestamp - this.animationStartTime;
			
			let t = (elapsed % duration) / duration;
			if (mode === "down") t = 1.0 - t;
			if (mode === "upAndDown" && Math.floor(elapsed / duration) % 2 === 1) t = 1.0 - t;
			
			this.renderFrame(t);
			
			if (this.animationFrame) {
				this.animationFrame = requestAnimationFrame(animate);
			}
		};
		
		this.animationFrame = requestAnimationFrame(animate);
    }
    
    /**
     * Stop animation
     */
    stopAnimation() {
        if (this.animationController) {
            this.animationController.stop();
        }
        
        if (this.animationFrame) {
            if (typeof this.animationFrame === 'number') {
                cancelAnimationFrame(this.animationFrame);
            }
            this.animationFrame = null;
        }
    }
    
    /**
     * Extract settings based on activeKeyframe (for backwards compatibility)
     */
    extractRenderSettings() {
        const activeKeyframe = this.settings.activeKeyframe;
        const keyframeSettings = this.settings.keyframes[activeKeyframe];
        
        return this.createRenderSettings(keyframeSettings);
    }
    
    /**
     * Create render settings from keyframe data
     */
    createRenderSettings(keyframeSettings) {
        return {
            gridCount: this.settings.gridCount,
            waveCount: this.settings.waveCount,
            gridType: this.settings.gridType,
            renderMode: this.settings.renderMode,
            renderStyle: this.settings.renderStyle || "dots",
            waveOffsetType: this.settings.waveOffsetType,
            
            bgColor: keyframeSettings.bgColor,
            rotationOffset: keyframeSettings.rotationOffset,
            commonHue: keyframeSettings.commonHue || 0,
            commonSaturation: keyframeSettings.commonSaturation || 0,
            commonLightness: keyframeSettings.commonLightness || 0,
            commonThickness: keyframeSettings.commonThickness !== undefined ? keyframeSettings.commonThickness : 1.0,
            scale: keyframeSettings.scale !== undefined ? keyframeSettings.scale : 1.0,
            commonAmpFactor: keyframeSettings.commonAmpFactor !== undefined ? keyframeSettings.commonAmpFactor : 1.0,
            commonFreqFactor: keyframeSettings.commonFreqFactor !== undefined ? keyframeSettings.commonFreqFactor : 1.0,
            commonDirectionOffset: keyframeSettings.commonDirectionOffset || 0,
            commonOffset: keyframeSettings.commonOffset || 0,
            phaseOffset: keyframeSettings.phaseOffset || 0,
            offsetAngle: keyframeSettings.offsetAngle || 0,
            offsetMagnitude: keyframeSettings.offsetMagnitude || 10,
            
            grids: keyframeSettings.grids,
            waves: keyframeSettings.waves
        };
    }
    
    // ... rest of the methods remain the same ...
	/**
	 * Register a secondary canvas to also render to
	 */
	registerSecondaryCanvas(canvasId) {
		if (!this.secondaryCanvases.includes(canvasId)) {
			this.secondaryCanvases.push(canvasId);
		}
	}	
	
	/**
	 * Set presentation mode
	 * @param {boolean} enabled - Whether to enable presentation mode
	 */
	setPresentationMode(enabled) {
		const wasPresentation = this.presentationMode;
		this.presentationMode = enabled;
		
		// If switching out of presentation mode while paused, clear pausedT
		if (wasPresentation && !enabled && !this.animationFrame) {
			this.pausedT = 0;
			this.render(); // Re-render to show active keyframe
		}
	}
	
	/**
	 * Animation step function - called on each frame
	 * @param {number} timestamp - Current animation timestamp
	 */
	animationStep(timestamp) {
		// Animation timing
		const duration = this.settings.animSettings.duration * 1000;
		const mode = this.settings.animSettings.mode;
		
		const elapsed = timestamp - this.animationStartTime;
		
		// Calculate animation progress
		let t = (elapsed % duration) / duration;
		if (mode === "down") t = 1.0 - t;
		if (mode === "upAndDown" && Math.floor(elapsed / duration) % 2 === 1) t = 1.0 - t;
		
		// Interpolate between keyframes
		const interpolated = this.interpolateSettings(t);
		
		// Render the interpolated settings
		try {
			this.webGLManager.renderToCanvas(this.canvas.id, interpolated);

			for (const canvasId of this.secondaryCanvases) {
			  this.webGLManager.renderToCanvas(canvasId, interpolated);
			}
		} catch (error) {
			console.error('Animation rendering error:', error);
			this.stopAnimation();
			return;
		}
		
		// Continue animation
		this.animationFrame = requestAnimationFrame(this.animationStep.bind(this));
	}
   
    // New method to pause with continuity
    pause() {
        if (this.animationFrame) {
    console.log(`[${this.canvas.id}] MoireRenderer.pause() called`);
            this.wasAnimatingBeforePaused = true;
            this.pauseTime = performance.now();
            this.stopAnimation();
        }
    }
    
    // New method to resume with continuity
    resume() {
        if (this.wasAnimatingBeforePaused) {
    console.log(`[${this.canvas.id}] MoireRenderer.resume() called`);
            const duration = performance.now() - this.pauseTime;
            this.animationStartTime += duration;
            this.startAnimation();
            this.wasAnimatingBeforePaused = false;
        }
    }	
	
	/**
	 * Update the settings for this renderer
	 * @param {Object} newSettings - New settings to apply
	 * @param {boolean} render - Whether to render after updating settings
	 */
	updateSettings(newSettings, render = true) {
		// Deep merge the new settings with existing settings
		this.settings = MoireRenderer.deepMerge(this.settings, newSettings);
		
		// Render with the new settings if requested
		if (render) {
			this.render();
		}
	}
	
	/**
	 * Load settings from a state string
	 * @param {string} stateString - Encoded state string
	 * @param {boolean} render - Whether to render after loading
	 * @returns {boolean} Success status
	 */
	loadFromState(stateString, render = true) {
		try {
			// Use the existing state decoder from state-encoder.js
			const decodedState = decodeState(stateString);
			
			if (decodedState) {
				this.settings = decodedState;
				
				if (render) {
					this.render();
				}
				
				return true;
			}
		} catch (error) {
			console.error('Error loading from state:', error);
		}
		
		return false;
	}
	
	/**
	 * Get the current state as an encoded string
	 * @returns {string} Encoded state string
	 */
	getStateString() {
		try {
			// Use the existing state encoder from state-encoder.js
			return encodeState(this.settings);
		} catch (error) {
			console.error('Error encoding state:', error);
			return null;
		}
	}
	
	/**
	 * Generate a sharing URL for the current state
	 * @param {string} baseUrl - Base URL to use (optional)
	 * @returns {string} Full sharing URL
	 */
	getSharingUrl(baseUrl = null) {
		const stateString = this.getStateString();
		if (!stateString) {
			return null;
		}
		
		// Use the provided base URL or the current page URL
		const url = baseUrl || window.location.href.split('?')[0];
		
		// Create the full URL with the state parameter
		return `${url}?state=${stateString}`;
	}	
	
	// encapsulate current settings
    getCurrentSettings() {
        return this.useGlobalSettings ? appSettings : this.settings;
    }	
	
	/**
	 * Interpolate between keyframes
	 * @param {number} t - Interpolation factor (0-1)
	 * @returns {Object} Interpolated settings
	 */
	interpolateSettings(t) {
		// animate from current settings
		const currentSettings = this.getCurrentSettings();
		
		// Get the keyframes
		const a = currentSettings.keyframes.k1;
		const b = currentSettings.keyframes.k2;
		
		// Utility functions for interpolation
		const lerp = (x, y) => x + (y - x) * t;
		const lerpColor = (c1, c2) => {
			const rgb1 = MoireUtils.Color.hexToRgb(c1);
			const rgb2 = MoireUtils.Color.hexToRgb(c2);
			const hsv1 = MoireUtils.Color.rgbToHsv(rgb1.r, rgb1.g, rgb1.b);
			const hsv2 = MoireUtils.Color.rgbToHsv(rgb2.r, rgb2.g, rgb2.b);
			let dh = hsv2.h - hsv1.h;
			if (dh > 180) { dh -= 360; }
			if (dh < -180) { dh += 360; }
			let h = hsv1.h + t * dh;
			if (h < 0) h += 360;
			if (h >= 360) h -= 360;
			const s = lerp(hsv1.s, hsv2.s);
			const v = lerp(hsv1.v, hsv2.v);
			const rgbInterp = MoireUtils.Color.hsvToRgb(h, s, v);
			return MoireUtils.Color.rgbToHex(rgbInterp);
		};
		// Special function to interpolate angles (handles wrapping)
		const lerpAngle = (a1, a2) => {
			// Handle the case where angles differ by more than 180 degrees
			let delta = a2 - a1;
			
			// Find the shortest path
			if (Math.abs(delta) > 180) {
				// Normalize angles to 0-360 range for proper wrapping calculation
				const norm1 = ((a1 % 360) + 360) % 360;
				const norm2 = ((a2 % 360) + 360) % 360;
				
				// Recalculate delta with normalized angles
				delta = norm2 - norm1;
				
				// Find the shortest path (clockwise or counterclockwise)
				if (delta > 180) delta -= 360;
				if (delta < -180) delta += 360;
				
				// Apply to original unnormalized angle to preserve multiple rotations
				return a1 + delta * t;
			}
			
			// For small differences, just do regular linear interpolation
			return a1 + delta * t;
		};

		// Get the global settings that won't be interpolated
		const gridCount = currentSettings.gridCount;
		const waveCount = currentSettings.waveCount;
		
		// Get default wave template
		const defaultWave = {
			type: "transverse",
			amplitude: 10,
			frequency: 1.0,
			phase: 0,
			directionAngle: 0,
			isActive: true
		};
		
		// Interpolate wave settings
		const interpolatedWaves = [];
		for (let i = 0; i < 15; i++) {
			if (i < waveCount) {
				// Get wave data with defaults if missing
				const waveA = a.waves && a.waves[i] ? a.waves[i] : defaultWave;
				const waveB = b.waves && b.waves[i] ? b.waves[i] : defaultWave;
				
				// For wave type, we don't interpolate but switch halfway
				const type = t < 0.5 ? waveA.type : waveB.type;
				
				// Create interpolated wave
				const interpolatedWave = {
					type: type,
					amplitude: lerp(waveA.amplitude, waveB.amplitude),
					frequency: lerp(waveA.frequency, waveB.frequency),
					phase: lerp(waveA.phase, waveB.phase),
					isActive: waveA.isActive !== false || waveB.isActive !== false
				};
				
				// Handle direction angle interpolation
				// Get the direction angles with proper defaults
				const angleA = waveA.directionAngle !== undefined ? waveA.directionAngle : 0;
				const angleB = waveB.directionAngle !== undefined ? waveB.directionAngle : 0;
				
				// Use angle-based interpolation to find shortest path
				interpolatedWave.directionAngle = lerpAngle(angleA, angleB);
				
				interpolatedWaves.push(interpolatedWave);
			} else {
				// Use defaults for waves beyond the count
				interpolatedWaves.push(JSON.parse(JSON.stringify(defaultWave)));
			}
		}
		
		// Get default grid template
		const defaultGrid = {
			thickness: 0.25,
			width: 20,
			height: 20,
			color: "#FF0000",
			isActive: true
		};
		
		// Interpolate grid settings
		const interpolatedGrids = [];
		for (let i = 0; i < gridCount; i++) {
			// Get grid data with defaults if missing
			const g1 = a.grids && a.grids[i] ? a.grids[i] : defaultGrid;
			const g2 = b.grids && b.grids[i] ? b.grids[i] : defaultGrid;
			
			interpolatedGrids.push({
				thickness: lerp(g1.thickness, g2.thickness),
				width: lerp(g1.width, g2.width),
				height: lerp(g1.height, g2.height),
				color: lerpColor(g1.color, g2.color),
				isActive: g1.isActive !== false || g2.isActive !== false
			});
		}
		
		// Create the interpolated settings object with global settings
		return {
			// Include the global settings unchanged
			gridCount: gridCount,
			waveCount: waveCount,
			gridType: currentSettings.gridType,
			renderMode: currentSettings.renderMode,
			renderStyle: currentSettings.renderStyle || "dots",
			waveOffsetType: currentSettings.waveOffsetType,
			
			// Include interpolated settings
			bgColor: lerpColor(a.bgColor, b.bgColor),
			rotationOffset: lerp(a.rotationOffset, b.rotationOffset),
			commonHue: Math.round(lerp(a.commonHue || 0, b.commonHue || 0)),
			commonSaturation: Math.round(lerp(a.commonSaturation || 0, b.commonSaturation || 0)),
			commonLightness: Math.round(lerp(a.commonLightness || 0, b.commonLightness || 0)),
			commonThickness: lerp(a.commonThickness !== undefined ? a.commonThickness : 1.0, b.commonThickness !== undefined ? b.commonThickness : 1.0),
			scale: lerp(a.scale !== undefined ? a.scale : 1.0, 	b.scale !== undefined ? b.scale : 1.0),
			commonAmpFactor: lerp(a.commonAmpFactor !== undefined ? a.commonAmpFactor : 1.0, b.commonAmpFactor !== undefined ? b.commonAmpFactor : 1.0),
			commonFreqFactor: lerp(a.commonFreqFactor !== undefined ? a.commonFreqFactor : 1.0, b.commonFreqFactor !== undefined ? b.commonFreqFactor : 1.0),
			commonDirectionOffset: lerp(a.commonDirectionOffset || 0, b.commonDirectionOffset || 0),
			commonOffset: lerp(a.commonOffset || 0, b.commonOffset || 0),
			phaseOffset: lerp(a.phaseOffset || 0, b.phaseOffset || 0),
			offsetAngle: lerp(a.offsetAngle || 0, b.offsetAngle || 0),
			offsetMagnitude: lerp(a.offsetMagnitude || 10, b.offsetMagnitude || 10),
			grids: interpolatedGrids,
			waves: interpolatedWaves
		};
	}

	/**
	 * Resize the canvas maintaining aspect ratio
	 * @param {number} width - New width (optional)
	 * @param {number} height - New height (optional)
	 */
	resize(width, height) {
		if (!this.canvas) return;
		
		// If dimensions are provided, set them
		if (width !== undefined && height !== undefined) {
			this.canvas.width = width;
			this.canvas.height = height;
		}
		
		// Render with the new dimensions
		this.render();
	}
	
	/**
	 * Clean up resources when the renderer is no longer needed
	 */
	dispose() {
		// Stop any ongoing animation
		this.stopAnimation();
		
		// If this is the main renderer with a dedicated WebGL manager, dispose it
		if (this.isMainRenderer && this.webGLManager !== sharedWebGLManager) {
			this.webGLManager.dispose();
		}
		
		// Clear references
		this.webGLManager = null;
		this.canvas = null;
		this.settings = null;
	}
	
	/**
	 * Helper method to deep merge objects
	 * @param {Object} target - Target object
	 * @param {Object} source - Source object
	 * @returns {Object} Merged result
	 */
	static deepMerge(target, source) {
		// Create a deep copy of the target
		const result = JSON.parse(JSON.stringify(target));
		
		// If source is null or not an object, return the target
		if (!source || typeof source !== 'object') {
			return result;
		}
		
		// Merge properties
		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				if (source[key] instanceof Object && key in result) {
					// Recursively merge objects
					result[key] = MoireRenderer.deepMerge(result[key], source[key]);
				} else {
					// Copy primitive values or replace objects
					result[key] = source[key];
				}
			}
		}
		
		return result;
	}	
}