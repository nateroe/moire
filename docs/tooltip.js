// --- TOOLTIP FUNCTIONS ---

// Function to toggle tooltips visibility
function toggleTooltips() {
	const enabled = document.getElementById('tooltipToggle').checked;
	
	if (enabled) {
		document.body.classList.add('tooltips-enabled');
		document.body.classList.remove('tooltips-disabled');
	} else {
		document.body.classList.remove('tooltips-enabled');
		document.body.classList.add('tooltips-disabled');
	}

	userSettings.flags.tooltipsEnabled = enabled;
	saveUserSettings();
}

// Add CSS rules for toggling tooltips
function addTooltipToggleStyles() {
	const styleElement = document.createElement('style');
	styleElement.textContent = `
		/* Default state - tooltips enabled */
		.tooltips-enabled .tooltip-trigger .tooltip-text {
			/* Default behavior - use existing CSS */
		}
		
		/* Disabled state */
		.tooltips-disabled .tooltip-trigger .tooltip-text {
			display: none !important;
		}
		
		/* Change cursor when tooltips are disabled */
		.tooltips-disabled .tooltip-trigger {
			cursor: default !important;
		}
	`;
	
	document.head.appendChild(styleElement);
}



// --- END TOOLTIP FUNCTIONS ---