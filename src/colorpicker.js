// HSV Color Picker Implementation
class HSVColorPicker {
	constructor() {
		// State variables only - NO DOM ACCESS
		this.hsv = { h: 0, s: 100, v: 100 };
		this.initialColor = '#FF0000';
		this.onColorApplied = null;
		this.targetInput = null;
		this.isDragging = false;
		this.initialized = false;
		
		// Bind methods
		this.updateHueGradient = this.updateHueGradient.bind(this);
		this.updateColorArea = this.updateColorArea.bind(this);
		this.updateCursorPosition = this.updateCursorPosition.bind(this);
		this.updateColorPreview = this.updateColorPreview.bind(this);
		this.updateFromHSV = this.updateFromHSV.bind(this);
		this.handleColorAreaClick = this.handleColorAreaClick.bind(this);
		this.handleColorAreaDrag = this.handleColorAreaDrag.bind(this);
		this.handleHexInput = this.handleHexInput.bind(this);
		this.startDrag = this.startDrag.bind(this);
		this.endDrag = this.endDrag.bind(this);
		this.hide = this.hide.bind(this);
		this.show = this.show.bind(this);
		this.applyColor = this.applyColor.bind(this);
	}
	
	// ONE unified initialization method - called once from moire.js
	initialize() {
		if (this.initialized) return;
		
		// DOM element references
		this.overlay = document.getElementById('colorPickerOverlay');
		this.colorArea = document.getElementById('colorArea');
		this.colorCursor = document.getElementById('colorCursor');
		this.colorPreview = document.getElementById('colorPreview');
		this.colorHex = document.getElementById('colorHex');
		this.hueSlider = document.getElementById('hueSlider');
		this.hueValue = document.getElementById('hueValue');
		this.satSlider = document.getElementById('satSlider');
		this.satValue = document.getElementById('satValue');
		this.valSlider = document.getElementById('valSlider');
		this.valValue = document.getElementById('valValue');
		this.closeButton = document.getElementById('colorPickerClose');
		this.cancelButton = document.getElementById('colorPickerCancel');
		this.applyButton = document.getElementById('colorPickerApply');
		
		// Canvas context
		this.ctx = this.colorArea.getContext('2d');
		
		// Set up ALL event handlers
		this.hueSlider.addEventListener('input', () => {
			this.hsv.h = parseInt(this.hueSlider.value);
			this.hueValue.value = this.hsv.h;
			this.updateFromHSV();
		});
		
		this.hueValue.addEventListener('input', () => {
			let h = parseInt(this.hueValue.value);
			if (h < 0) h = 0;
			if (h > 360) h = 360;
			this.hsv.h = h;
			this.hueSlider.value = h;
			this.updateFromHSV();
		});
		
		// Event listeners for saturation slider
		this.satSlider.addEventListener('input', () => {
			this.hsv.s = parseInt(this.satSlider.value);
			this.satValue.value = this.hsv.s;
			this.updateFromHSV();
		});
		
		this.satValue.addEventListener('input', () => {
			let s = parseInt(this.satValue.value);
			if (s < 0) s = 0;
			if (s > 100) s = 100;
			this.hsv.s = s;
			this.satSlider.value = s;
			this.updateFromHSV();
		});
		
		// Event listeners for value/brightness slider
		this.valSlider.addEventListener('input', () => {
			this.hsv.v = parseInt(this.valSlider.value);
			this.valValue.value = this.hsv.v;
			this.updateFromHSV();
		});
		
		this.valValue.addEventListener('input', () => {
			let v = parseInt(this.valValue.value);
			if (v < 0) v = 0;
			if (v > 100) v = 100;
			this.hsv.v = v;
			this.valSlider.value = v;
			this.updateFromHSV();
		});
		
		// Add event listener for hex input
		this.colorHex.addEventListener('input', this.handleHexInput);
		
		// Color area events
		this.colorArea.addEventListener('mousedown', this.startDrag);
		document.addEventListener('mousemove', this.handleColorAreaDrag);
		document.addEventListener('mouseup', this.endDrag);
		
		// Touch events for mobile
		this.colorArea.addEventListener('touchstart', (e) => {
			e.preventDefault();
			this.startDrag(e.touches[0]);
		});
		document.addEventListener('touchmove', (e) => {
			if (this.isDragging) {
				e.preventDefault();
				this.handleColorAreaDrag(e.touches[0]);
			}
		});
		document.addEventListener('touchend', this.endDrag);
		
		// Modal control events
		this.closeButton.addEventListener('click', this.hide);
		this.cancelButton.addEventListener('click', this.hide);
		this.applyButton.addEventListener('click', this.applyColor);
		
		// Click outside to close
		this.overlay.addEventListener('click', (e) => {
			if (e.target === this.overlay) {
				this.hide();
			}
		});
		
		// Mark as initialized
		this.initialized = true;
		
		// Initial color area setup
		this.updateColorArea();
	}
	
	// Handle hex input changes
	handleHexInput(e) {
		    const hexValue = e.target.value;
    
		// Validate hex format (6 digits with optional #)
		const hexPattern = /^#?([0-9A-F]{6})$/i;
		
		if (hexPattern.test(hexValue)) {
			let formattedHex = hexValue;
			
			// Add # if missing
			if (!formattedHex.startsWith('#')) {
				formattedHex = '#' + formattedHex;
			}
			
			// Use the global utility functions
			const rgb = hexToRgb(formattedHex);
			const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
			
			// Update HSV values - note that s and v are already in 0-1 range from rgbToHsv
			// Convert to 0-100 for our internal state
			this.hsv.h = newHsv.h;
			this.hsv.s = newHsv.s * 100;
			this.hsv.v = newHsv.v * 100;
			
			// Update UI controls
			this.hueSlider.value = this.hsv.h;
			this.hueValue.value = this.hsv.h;
			this.satSlider.value = this.hsv.s;
			this.satValue.value = this.hsv.s;
			this.valSlider.value = this.hsv.v;
			this.valValue.value = this.hsv.v;
			
			// Update visuals
			this.updateFromHSV();
			
			// Format the hex value consistently
			this.colorHex.value = formattedHex.toUpperCase();
		}
	}

	// Updated updateColorPreview
	updateColorPreview() {
		// Convert HSV to RGB for the preview
		// Note: Convert s and v from 0-100 to 0-1 for hsvToRgb
		const rgb = hsvToRgb(this.hsv.h, this.hsv.s / 100, this.hsv.v / 100);
		const hex = rgbToHex(rgb);
		
		// Update the preview elements
		this.colorPreview.style.backgroundColor = hex;
		this.colorHex.value = hex.toUpperCase();
	}

	// Updated updateHueGradient
	updateHueGradient() {
		// Update saturation slider gradient based on current hue
		const hueColor = hsvToRgb(this.hsv.h, 1.0, 1.0);
		this.satSlider.style.background = `linear-gradient(to right, #ffffff, rgb(${hueColor.r}, ${hueColor.g}, ${hueColor.b}))`;
		
		// Update value slider gradient based on current hue and saturation
		const satColor = hsvToRgb(this.hsv.h, this.hsv.s / 100, 1.0);
		this.valSlider.style.background = `linear-gradient(to right, #000000, rgb(${satColor.r}, ${satColor.g}, ${satColor.b}))`;
	}

	// Updated updateColorArea
	updateColorArea() {
		const width = this.colorArea.width;
		const height = this.colorArea.height;
		const ctx = this.ctx;
		
		// Clear the canvas
		ctx.clearRect(0, 0, width, height);
		
		// Draw saturation-value gradient with current hue
		for (let y = 0; y < height; y++) {
			const v = 1 - (y / height); // 0-1 range for hsvToRgb
			
			for (let x = 0; x < width; x++) {
				const s = (x / width); // 0-1 range for hsvToRgb
				const color = hsvToRgb(this.hsv.h, s, v);
				
				ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
				ctx.fillRect(x, y, 1, 1);
			}
		}
		
		// Update cursor position based on current S and V values
		this.updateCursorPosition();
	}
	
	updateCursorPosition() {
		const width = this.colorArea.width;
		const height = this.colorArea.height;
		
		// Calculate position based on saturation and value
		const x = (this.hsv.s / 100) * width;
		const y = (1 - this.hsv.v / 100) * height;
		
		// Update cursor position
		this.colorCursor.style.left = `${x}px`;
		this.colorCursor.style.top = `${y}px`;
	}
	
	
	updateFromHSV() {
		this.updateHueGradient();
		this.updateColorArea();
		this.updateColorPreview();
	}
	
	handleColorAreaClick(e) {
		const rect = this.colorArea.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		// Calculate saturation and value from position
		this.hsv.s = Math.max(0, Math.min(100, (x / rect.width) * 100));
		this.hsv.v = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
		
		// Update inputs
		this.satSlider.value = this.hsv.s;
		this.satValue.value = Math.round(this.hsv.s);
		this.valSlider.value = this.hsv.v;
		this.valValue.value = Math.round(this.hsv.v);
		
		// Update preview
		this.updateFromHSV();
	}
	
	startDrag(e) {
		this.isDragging = true;
		this.handleColorAreaClick(e);
	}
	
	handleColorAreaDrag(e) {
		if (!this.isDragging) return;
		this.handleColorAreaClick(e);
	}
	
	endDrag() {
		this.isDragging = false;
	}
	
	applyColor() {
		if (this.targetInput && this.onColorApplied) {
			// Convert s and v from 0-100 to 0-1 range for hsvToRgb
			const rgb = hsvToRgb(this.hsv.h, this.hsv.s / 100, this.hsv.v / 100);
			const hex = rgbToHex(rgb);
			this.onColorApplied(hex, this.targetInput);
		}
		this.hide();
	}
	
	show(inputElement, callback) {
		this.targetInput = inputElement;
		this.onColorApplied = callback;
		
		// Get the current color from the input
		const currentColor = inputElement.value || '#FF0000';
		this.initialColor = currentColor;
		
		// Convert to HSV and update the picker
		const rgb = hexToRgb(currentColor);
		const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
		
		// Update HSV state (convert 0-1 to 0-100 for UI)
		this.hsv.h = hsv.h;
		this.hsv.s = hsv.s * 100;
		this.hsv.v = hsv.v * 100;
		
		// Update UI
		this.hueSlider.value = this.hsv.h;
		this.hueValue.value = this.hsv.h;
		this.satSlider.value = this.hsv.s;
		this.satValue.value = this.hsv.s;
		this.valSlider.value = this.hsv.v;
		this.valValue.value = this.hsv.v;
		
		this.updateFromHSV();
		
		// Show the overlay
		this.overlay.style.display = 'flex';
	}
	
	hide() {
		this.overlay.style.display = 'none';
		this.targetInput = null;
	}
}

// Simple function that just shows the picker - no initialization logic
function openColorPicker(inputElement, callback) {
	if (window.colorPicker && window.colorPicker.initialized) {
		window.colorPicker.show(inputElement, callback);
	} else {
		console.error("Color picker not initialized");
	}
}