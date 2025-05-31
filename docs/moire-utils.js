// ------------- MOIRE UTILITIES ---------------------
// Consolidated utility functions for Moiré Exploré

const MoireUtils = {
	
	// Color utilities
	Color: {
		/**
		 * Convert hex color string to RGB object
		 * @param {string} hex - Hex color (e.g., "#FF0000")
		 * @returns {Object} RGB object with r, g, b properties (0-255)
		 */
		hexToRgb: function(hex) {
			const bigint = parseInt(hex.substring(1), 16);
			return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
		},
		
		/**
		 * Convert RGB values to HSV object
		 * @param {number} r - Red value (0-255)
		 * @param {number} g - Green value (0-255)
		 * @param {number} b - Blue value (0-255)
		 * @returns {Object} HSV object with h (0-360), s (0-1), v (0-1) properties
		 */
		rgbToHsv: function(r, g, b) {
			r /= 255; g /= 255; b /= 255;
			const max = Math.max(r, g, b), min = Math.min(r, g, b);
			const delta = max - min;
			let h = 0;
			if (delta !== 0) {
				if (max === r) h = 60 * (((g - b) / delta) % 6);
				else if (max === g) h = 60 * (((b - r) / delta) + 2);
				else h = 60 * (((r - g) / delta) + 4);
			}
			if (h < 0) h += 360;
			const s = max === 0 ? 0 : delta / max;
			return { h, s, v: max };
		},
		
		/**
		 * Convert HSV values to RGB object
		 * @param {number} h - Hue (0-360)
		 * @param {number} s - Saturation (0-1)
		 * @param {number} v - Value (0-1)
		 * @returns {Object} RGB object with r, g, b properties (0-255)
		 */
		hsvToRgb: function(h, s, v) {
			const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
			let r1, g1, b1;
			if (h < 60) { r1 = c; g1 = x; b1 = 0; }
			else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
			else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
			else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
			else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
			else { r1 = c; g1 = 0; b1 = x; }
			return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
		},
		
		/**
		 * Convert RGB object to hex color string
		 * @param {Object} rgb - RGB object with r, g, b properties (0-255)
		 * @returns {string} Hex color string (e.g., "#FF0000")
		 */
		rgbToHex: function(rgb) {
			return "#" + [rgb.r, rgb.g, rgb.b].map(x => x.toString(16).padStart(2, "0")).join("");
		},
		
		/**
		 * Convert HSL values to RGB object
		 * @param {number} h - Hue (0-360)
		 * @param {number} s - Saturation (0-100)
		 * @param {number} l - Lightness (0-100)
		 * @returns {Object} RGB object with r, g, b properties (0-255)
		 */
		hslToRgb: function(h, s, l) {
			s /= 100;
			l /= 100;
			const c = (1 - Math.abs(2 * l - 1)) * s;
			const x = c * (1 - Math.abs((h / 60) % 2 - 1));
			const m = l - c / 2;
			let r1, g1, b1;
			if (h < 60) {
				r1 = c; g1 = x; b1 = 0;
			} else if (h < 120) {
				r1 = x; g1 = c; b1 = 0;
			} else if (h < 180) {
				r1 = 0; g1 = c; b1 = x;
			} else if (h < 240) {
				r1 = 0; g1 = x; b1 = c;
			} else if (h < 300) {
				r1 = x; g1 = 0; b1 = c;
			} else {
				r1 = c; g1 = 0; b1 = x;
			}
			return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
		},
		
		/**
		 * Parse color string to RGB array
		 * @param {string} color - Color string (hex)
		 * @returns {Array} RGB values as [r, g, b] (0-255)
		 */
		parseColor: function(color) {
			if (!color || typeof color !== 'string') {
				return [0, 0, 0];
			}
			
			// Remove # if present
			color = color.replace('#', '');
			
			// Handle shortened form (e.g. #ABC)
			if (color.length === 3) {
				color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
			}
			
			// Parse hex values
			const r = parseInt(color.substring(0, 2), 16) || 0;
			const g = parseInt(color.substring(2, 4), 16) || 0;
			const b = parseInt(color.substring(4, 6), 16) || 0;
			
			return [r, g, b];
		}
	},
	
	// Encoding utilities
	Encoding: {
		/**
		 * Convert render mode name to index
		 * @param {string} mode - Render mode name
		 * @returns {number} Mode index
		 */
		encodeRenderMode: function(mode) {
			const modes = [
				'additive',
				'overlay',
				'multiply',
				'screen',
				'difference',
				'exclusion',
				'dodge',
				'burn',
				'hardlight',
				'xor'
			];
			return modes.indexOf(mode.toLowerCase()) || 0;
		},
		
		/**
		 * Convert render mode index to name
		 * @param {number} mode - Render mode index
		 * @returns {string} Mode name
		 */
		decodeRenderMode: function(mode) {
			const modes = [
				'additive',
				'overlay',
				'multiply',
				'screen',
				'difference',
				'exclusion',
				'dodge',
				'burn',
				'hardlight',
				'xor'
			];
			return modes[mode] || 'additive';
		},
		
		/**
		 * Convert render style name to index
		 * @param {string} style - Render style name
		 * @returns {number} Style index
		 */
		encodeRenderStyle: function(style) {
			const styles = [
				'dots',
				'lines'
			];
			return styles.indexOf(style ? style.toLowerCase() : 'dots') || 0;
		},
		
		/**
		 * Convert render style index to name
		 * @param {number} style - Render style index
		 * @returns {string} Style name
		 */
		decodeRenderStyle: function(style) {
			const styles = [
				'dots',
				'lines'
			];
			return styles[style] || 'dots';
		},
		
		/**
		 * Convert wave offset type name to index
		 * @param {string} type - Wave offset type name
		 * @returns {number} Type index
		 */
		encodeWaveOffsetType: function(type) {
			const types = [
				'phase',
				'vector'
			];
			return types.indexOf(type.toLowerCase()) || 0;
		},
		
		/**
		 * Convert wave offset type index to name
		 * @param {number} type - Wave offset type index
		 * @returns {string} Type name
		 */
		decodeWaveOffsetType: function(type) {
			const types = [
				'phase',
				'vector'
			];
			return types[type] || 'phase';
		},
		
		/**
		 * Convert wave type name to index
		 * @param {string} type - Wave type name
		 * @returns {number} Type index
		 */
		encodeWaveType: function(type) {
			const types = [
				'transverse',
				'longitude',
				'amplitude',
				'hue',
				'saturation',
				'lightness',
				'rotation',
				'phaseshift'
			];
			return types.indexOf(type.toLowerCase()) || 0;
		},
		
		/**
		 * Convert wave type index to name
		 * @param {number} type - Wave type index
		 * @returns {string} Type name
		 */
		decodeWaveType: function(type) {
			const types = [
				'transverse',
				'longitude',
				'amplitude',
				'hue',
				'saturation',
				'lightness',
				'rotation',
				'phaseshift'
			];
			return types[type] || 'transverse';
		},
		
		/**
		 * Convert animation mode name to index
		 * @param {string} mode - Animation mode name
		 * @returns {number} Mode index
		 */
		encodeAnimMode: function(mode) {
			const modes = [
				'up',
				'down',
				'upAndDown'
			];
			return modes.indexOf(mode.toLowerCase()) || 0;
		},
		
		/**
		 * Convert animation mode index to name
		 * @param {number} mode - Animation mode index
		 * @returns {string} Mode name
		 */
		decodeAnimMode: function(mode) {
			const modes = [
				'up',
				'down',
				'upAndDown'
			];
			return modes[mode] || 'upAndDown';
		},
		
		/**
		 * Convert keyframe name to index
		 * @param {string} name - Keyframe name
		 * @returns {number} Keyframe index
		 */
		encodeKeyframeName: function(name) {
			return name === 'k2' ? 2 : 1;
		},
		
		/**
		 * Convert keyframe index to name
		 * @param {number} value - Keyframe index
		 * @returns {string} Keyframe name
		 */
		decodeKeyframeName: function(value) {
			return value === 2 ? 'k2' : 'k1';
		}
	},
	
	// Math utilities
	Math: {
		/**
		 * Get a random floating-point number between min and max
		 * @param {number} min - Minimum value (inclusive)
		 * @param {number} max - Maximum value (exclusive)
		 * @returns {number} Random float between min and max
		 */
		randomRange: function(min, max) {
			return Math.random() * (max - min) + min;
		},
		
		/**
		 * Get a random integer between min and max (inclusive)
		 * @param {number} min - Minimum value (inclusive)
		 * @param {number} max - Maximum value (inclusive)
		 * @returns {number} Random integer between min and max
		 */
		randomInt: function(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
	},
	
	// DOM/UI utilities
	DOM: {
		/**
		 * Show a toast notification at the default position
		 * @param {string} message - Message to display
		 */
		showToast: function(message) {
			const toast = document.getElementById("toast");
			toast.textContent = message;
			toast.style.opacity = "1";
			setTimeout(() => {
				toast.style.opacity = "0";
			}, 2000);
		},
		
		/**
		 * Show a toast notification at a specific position
		 * @param {string} message - Message to display
		 * @param {number} x - X coordinate
		 * @param {number} y - Y coordinate
		 */
		showToast2: function(message, x, y) {
			const toast = document.getElementById("toast");
			toast.textContent = message;
			
			// If coordinates are provided, position toast near that point
			if (x !== undefined && y !== undefined) {
				toast.style.bottom = "auto";
				toast.style.left = "auto";
				toast.style.transform = "none";
				
				// Position slightly above and to the right of the mouse
				toast.style.top = (y - 40) + "px";
				toast.style.left = (x + 10) + "px";
			} else {
				// Revert to default bottom-center position
				toast.style.bottom = "20px";
				toast.style.top = "auto";
				toast.style.left = "50%";
				toast.style.transform = "translateX(-50%)";
			}
			
			toast.style.opacity = "1";
			setTimeout(() => {
				toast.style.opacity = "0";
			}, 2000);
		}
	},
	
	// Define DEFAULT_SETTINGS as a static object, not a function
	DEFAULT_SETTINGS: {
		// Global settings (not animated)
		gridType: "0",         // Rectangular
		renderMode: "additive",
		renderStyle: "dots",   // "dots" or "lines"
		waveOffsetType: "phase",
		activeKeyframe: 'k1',
		gridCount: 2,
		waveCount: 0,

		// Animation settings
		animSettings: {
			duration: 2.0,
			mode: "up",
			autoplay: false
		},

		// Keyframes
		keyframes: {
			k1: {
				bgColor: "#000000",
				rotationOffset: 0,
				commonHue: 0, 
				commonSaturation: 0,
				commonLightness: 0,
				commonThickness: 1.0, 
				scale: 1.0, 				
				grids: [],  // Will be initialized below
				// Wave perturbation defaults
				commonAmpFactor: 1.0,
				commonFreqFactor: 1.0,
				commonDirectionOffset: 0,
				commonOffset: 0, // common phase offset
				phaseOffset: 0, // per grid phase offset
				offsetAngle: 0, // per grid offset vector
				offsetMagnitude: 10, // per grid offset vector
				waves: []  // Will be initialized below			
			},
			k2: {
				bgColor: "#000000",
				rotationOffset: 45,
				commonHue: 0, 
				commonSaturation: 0,
				commonLightness: 0,
				commonThickness: 1.0, 
				scale: 1.0, 					
				grids: [],  // Will be initialized below
				// Wave perturbation defaults
				commonAmpFactor: 1.0,
				commonFreqFactor: 1.0,
				commonOffset: 0, // common phase offset
				commonDirectionOffset: 0,
				phaseOffset: 0, // per grid phase offset
				offsetAngle: 0, // per grid offset vector
				offsetMagnitude: 10, // per grid offset vector
				waves: []  // Will be initialized below	
			}
		}
	}
};

// Initialize grids and waves arrays for both keyframes
// Do this after the object is fully defined to use MoireUtils.Color methods
(function initializeDefaults() {
	// Initialize grids for k1
	MoireUtils.DEFAULT_SETTINGS.keyframes.k1.grids = Array.from({ length: 8 }, (_, i) => {
		const hue = (i * 360) / 8;
		const rgb = MoireUtils.Color.hslToRgb(hue, 100, 50);
		return {
			thickness: 0.25,
			width: 20,
			height: 20,
			color: MoireUtils.Color.rgbToHex(rgb),
			isActive: true
		};
	});
	
	// Initialize waves for k1
	MoireUtils.DEFAULT_SETTINGS.keyframes.k1.waves = Array.from({ length: 15 }, () => ({
		type: "transverse",
		amplitude: 10,
		frequency: 1.0,
		phase: 0,
		directionAngle: 0,
		isActive: true
	}));
	
	// Initialize grids for k2
	MoireUtils.DEFAULT_SETTINGS.keyframes.k2.grids = Array.from({ length: 8 }, (_, i) => {
		const hue = (i * 360) / 8;
		const rgb = MoireUtils.Color.hslToRgb(hue, 100, 50);
		return {
			thickness: 0.25,
			width: 20,
			height: 20,
			color: MoireUtils.Color.rgbToHex(rgb),
			isActive: true
		};
	});
	
	// Initialize waves for k2
	MoireUtils.DEFAULT_SETTINGS.keyframes.k2.waves = Array.from({ length: 15 }, () => ({
		type: "transverse",
		amplitude: 10,
		frequency: 1.0,
		phase: 0,
		directionAngle: 0,
		isActive: true
	}));
})();

// For backward compatibility, we expose all functions globally
// This way existing code can still call hexToRgb() etc.
(function() {
	// Expose color utilities
	window.hexToRgb = MoireUtils.Color.hexToRgb;
	window.rgbToHsv = MoireUtils.Color.rgbToHsv;
	window.hsvToRgb = MoireUtils.Color.hsvToRgb;
	window.rgbToHex = MoireUtils.Color.rgbToHex;
	window.hslToRgb = MoireUtils.Color.hslToRgb;
	window.parseColor = MoireUtils.Color.parseColor;

	// Expose encoding utilities
	window.encodeRenderMode = MoireUtils.Encoding.encodeRenderMode;
	window.decodeRenderMode = MoireUtils.Encoding.decodeRenderMode;
	window.encodeRenderStyle = MoireUtils.Encoding.encodeRenderStyle;
	window.decodeRenderStyle = MoireUtils.Encoding.decodeRenderStyle;
	window.encodeWaveOffsetType = MoireUtils.Encoding.encodeWaveOffsetType;
	window.decodeWaveOffsetType = MoireUtils.Encoding.decodeWaveOffsetType;
	window.encodeWaveType = MoireUtils.Encoding.encodeWaveType;
	window.decodeWaveType = MoireUtils.Encoding.decodeWaveType;
	window.encodeAnimMode = MoireUtils.Encoding.encodeAnimMode;
	window.decodeAnimMode = MoireUtils.Encoding.decodeAnimMode;
	window.encodeKeyframeName = MoireUtils.Encoding.encodeKeyframeName;
	window.decodeKeyframeName = MoireUtils.Encoding.decodeKeyframeName;
	
	// Expose math utilities
	window.randomRange = MoireUtils.Math.randomRange;
	window.randomInt = MoireUtils.Math.randomInt;
	
	// Expose DOM utilities
	window.showToast = MoireUtils.DOM.showToast;
	window.showToast2 = MoireUtils.DOM.showToast2;
})();