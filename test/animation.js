// --- ANIMATION & KEYFRAME CONTROLLER ---
// This controller ties the UI controls to the MoireRenderer's animation methods

// UI Update Functions
function updateKeyIndicators() {
	// Update the body class for CSS styling
	document.body.classList.remove("bound-to-k1", "bound-to-k2");
	document.body.classList.add(`bound-to-${appSettings.activeKeyframe}`);
	
	// Also update the radio button state to match
	document.querySelector(`input[name="activeKeyframeControl"][value="${appSettings.activeKeyframe}"]`).checked = true;
	
	// Indicate which keyframe is active in the status indicators
	document.querySelectorAll(".key-indicator").forEach(el => {
		el.classList.remove("active-keyframe");
	});
	
	const activeId = appSettings.activeKeyframe === 'k1' ? "k1Status" : "k2Status";
	document.getElementById(activeId).classList.add("active-keyframe");
	
	// Update text to simply show which keyframe is selected
	document.getElementById("k1Status").textContent = "keyframe 1";
	document.getElementById("k2Status").textContent = "keyframe 2";
	
	console.log(`Updated key indicators for active keyframe: ${appSettings.activeKeyframe}`);
}



// Animation Control Functions - Now delegate to renderer
function startAnimation() {
	// Update UI
	document.getElementById("startButton").disabled = true;
	document.getElementById("stopButton").disabled = false;
	
	// Update animation settings
	appSettings.animSettings.autoplay = true;
	saveSettings();
	
	// Use MoireRenderer's animation system
	if (renderer) {
		renderer.startAnimation();
		
		// Store animation state for UI components
		animationInterval = renderer.animationFrame; // Reference for UI components
	}
}

function stopAnimation() {
	// Update UI
	document.getElementById("startButton").disabled = false;
	document.getElementById("stopButton").disabled = true;
	
	// Update animation settings
	if (appSettings.animSettings) {
		appSettings.animSettings.autoplay = false;
		saveSettings();
	}
	
	// Use MoireRenderer's animation system
	if (renderer) {
		renderer.stopAnimation();
		animationInterval = null; // Clear reference
	}


	// Request a render to display the active keyframe
	requestRender();
}

// Helper function to check if animation is running
function isAnimating() {
	return renderer && renderer.animationFrame !== null;
}

// Export for visibility.js compatibility
window.animationInterval = null; // Maintain compatibility with visibility.js

// Update animationInterval reference when animation state changes
Object.defineProperty(window, 'animationInterval', {
	get: function() {
		return renderer ? renderer.animationFrame : null;
	},
	set: function(value) {
		// Allow visibility.js to clear this
		if (value === null && renderer) {
			renderer.animationFrame = null;
		}
	}
});