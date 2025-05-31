// Create a second, smaller canvas that mirrors the main one
const miniCanvas = document.getElementById('miniCanvas');
const miniCtx = miniCanvas.getContext('2d');
miniCanvas.width = 320;
miniCanvas.height = 180;

// Show mini canvas when main canvas is out of view
window.removeEventListener('scroll', scrollHandler); // Remove any existing handler
let miniControlsCreated = false;

function scrollHandler() {
	const mainCanvas = document.getElementById('moireCanvas'); // Add this line
	const canvasRect = mainCanvas.getBoundingClientRect(); // Update this line
	const miniContainer = document.getElementById('miniCanvasContainer');
	
	if (canvasRect.bottom < 200 || canvasRect.top > window.innerHeight) {
		miniContainer.style.display = 'block';
		
		// Force explicit dimensions and styling
		miniContainer.style.position = 'fixed';
		miniContainer.style.top = '10px';
		miniContainer.style.right = '10px';
		miniContainer.style.zIndex = '900';
		miniContainer.style.border = '1px solid #333';
		miniContainer.style.background = '#000';
		
		// Force a new render to ensure mini canvas is updated
		requestAnimationFrame(() => {
			requestRender();
			// After rendering, update the mini canvas
			requestAnimationFrame(() => {
				// Create controls on first display if not already created
				if (!miniControlsCreated) {
					createMiniControls();
					miniControlsCreated = true;
				}
				
				// Make sure button states are up to date
				updateKeyframeButtonStates();
				updateAnimButtonStates();
			});
		});
	} else {
		miniContainer.style.display = 'none';
	}
}

window.addEventListener('scroll', scrollHandler);

// ---- scroll to top

// Function to scroll to the main canvas
function scrollToMainCanvas() {
	// Get the main canvas element
	const mainCanvas = document.getElementById('moireCanvas');
	const canvasContainer = document.getElementById('canvasContainer');
	
	// Use the container if available, otherwise use the canvas directly
	const targetElement = canvasContainer || mainCanvas;
	
	// Get the element's position relative to the viewport
	const rect = targetElement.getBoundingClientRect();
	
	// Calculate the target scroll position
	// We want to position the element at the top of the viewport with a small margin
	const scrollTargetY = window.scrollY + rect.top - 20; // 20px margin from top
	
	// Scroll to the target position with smooth behavior
	window.scrollTo({
		top: scrollTargetY,
		behavior: 'smooth'
	});
}

// Function to add double-click handler to mini canvas
function addMiniCanvasDoubleClickHandler() {
	const miniCanvas = document.getElementById('miniCanvas');
	
	if (miniCanvas) {
		miniCanvas.addEventListener('dblclick', function(event) {
			// Prevent any default behavior
			event.preventDefault();
			
			// Scroll to the main canvas
			scrollToMainCanvas();
		});
		
		console.log("Double-click handler added to mini canvas");
	} else {
		console.error("Mini canvas element not found");
	}
}



// -- mini controls

// Create mini controls for the mini canvas
function createMiniControls() {
	const miniContainer = document.getElementById('miniCanvasContainer');
	
	// Create control container
	const controlsDiv = document.createElement('div');
	controlsDiv.id = 'miniControls';
	controlsDiv.className = 'mini-controls';
	
	// Add keyframe controls
	const keyframeDiv = document.createElement('div');
	keyframeDiv.className = 'mini-keyframe-controls';
	
	// K1 button
	const k1Button = document.createElement('button');
	k1Button.className = 'mini-key-btn';
	k1Button.dataset.keyframe = 'k1';
	k1Button.textContent = 'K1';
	k1Button.addEventListener('click', () => {
		if (appSettings.activeKeyframe !== 'k1') {
			// Update the active keyframe
			appSettings.activeKeyframe = 'k1';
			
			// Update both mini and main UI
			updateKeyframeButtonStates();
			
			// Update the main UI radio buttons
			document.querySelector('input[name="activeKeyframeControl"][value="k1"]').checked = true;
			
			// Display the newly active keyframe
			updateUIFromSettings();
			
			// Render the updated settings
			if (!animationInterval) {
				requestRender();	
			}
		}
	});
	
	// K2 button
	const k2Button = document.createElement('button');
	k2Button.className = 'mini-key-btn';
	k2Button.dataset.keyframe = 'k2';
	k2Button.textContent = 'K2';
	k2Button.addEventListener('click', () => {
		if (appSettings.activeKeyframe !== 'k2') {
			// Update the active keyframe
			appSettings.activeKeyframe = 'k2';
			
			// Update both mini and main UI
			updateKeyframeButtonStates();
			
			// Update the main UI radio buttons
			document.querySelector('input[name="activeKeyframeControl"][value="k2"]').checked = true;
			
			// Display the newly active keyframe
			updateUIFromSettings();
			
			// Render the updated settings
			if (!animationInterval) {
				requestRender();	
			}
		}
	});
	
	keyframeDiv.appendChild(k1Button);
	keyframeDiv.appendChild(k2Button);
	
	// Add animation controls
	const animDiv = document.createElement('div');
	animDiv.className = 'mini-anim-controls';
	
	// Play button
	const playButton = document.createElement('button');
	playButton.id = 'miniPlayButton';
	playButton.className = 'mini-anim-btn';
	playButton.innerHTML = '&#9654;'; // Play symbol
	playButton.addEventListener('click', () => {
		if (!animationInterval) {
			startAnimation();
			updateAnimButtonStates();
		}
	});
	
	// Stop button
	const stopButton = document.createElement('button');
	stopButton.id = 'miniStopButton';
	stopButton.className = 'mini-anim-btn';
	stopButton.innerHTML = '&#9632;'; // Stop symbol
	stopButton.addEventListener('click', () => {
		if (animationInterval) {
			stopAnimation();
			updateAnimButtonStates();
		}
	});
	
	animDiv.appendChild(playButton);
	animDiv.appendChild(stopButton);
	
	// Add everything to the control container
	controlsDiv.appendChild(keyframeDiv);
	controlsDiv.appendChild(animDiv);
	
	// Add the controls to the mini canvas container
	miniContainer.appendChild(controlsDiv);
	
	// Initialize button states
	updateKeyframeButtonStates();
	updateAnimButtonStates();
}

// Update the keyframe button states based on the current active keyframe
function updateKeyframeButtonStates() {
    const k1Button = document.querySelector('.mini-key-btn[data-keyframe="k1"]');
    const k2Button = document.querySelector('.mini-key-btn[data-keyframe="k2"]');
    
    if (!k1Button || !k2Button) return; // Exit if buttons don't exist yet
    
    if (appSettings.activeKeyframe === 'k1') {
        k1Button.classList.add('active-keyframe');
        k2Button.classList.remove('active-keyframe');
    } else {
        k1Button.classList.remove('active-keyframe');
        k2Button.classList.add('active-keyframe');
    }
}

// Update the animation button states based on whether animation is running
function updateAnimButtonStates() {
    const playButton = document.getElementById('miniPlayButton');
    const stopButton = document.getElementById('miniStopButton');
    
    if (!playButton || !stopButton) return; // Exit if buttons don't exist yet
    
    if (animationInterval) {
        playButton.classList.add('active-anim');
        playButton.classList.remove('inactive-anim');
        stopButton.classList.remove('active-anim');
        stopButton.classList.add('inactive-anim');
    } else {
        playButton.classList.remove('active-anim');
        playButton.classList.add('inactive-anim');
        stopButton.classList.add('active-anim');
        stopButton.classList.remove('inactive-anim');
    }
}

// Hook into animation functions to update mini controls if visible
function initMiniControls() {
	const originalStartAnimation = startAnimation;
	startAnimation = function() {
		originalStartAnimation();
		updateAnimButtonStates();
	};

	const originalStopAnimation = stopAnimation;
	stopAnimation = function() {
		originalStopAnimation();
		updateAnimButtonStates();
	};

	// Also hook into updateKeyIndicators to update mini controls
	const originalUpdateKeyIndicators = updateKeyIndicators;
	updateKeyIndicators = function() {
		originalUpdateKeyIndicators();
		if (miniControlsCreated) {
			updateKeyframeButtonStates();
		}
	};
	
	// Add our double-click handler
	addMiniCanvasDoubleClickHandler();
}

initMiniControls();

// Initialize the mini controls if the container is already visible
if (document.getElementById('miniCanvasContainer').style.display === 'block' && !miniControlsCreated) {
	createMiniControls();
	miniControlsCreated = true;
}