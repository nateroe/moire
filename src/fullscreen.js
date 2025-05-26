// --- FULLSCREEN FUNCTIONALITY ---

function handleCanvasMouseEnter() {
    document.getElementById('fullscreenButton').style.opacity = '1';
}

function handleCanvasMouseLeave() {
    document.getElementById('fullscreenButton').style.opacity = '0';
}

// Function to reset canvas resolution to original size
function resetCanvasResolution() {
	const canvas = document.getElementById('moireCanvas');
	
	// Get original dimensions from data attributes
	const originalWidth = parseInt(canvas.dataset.originalWidth);
	const originalHeight = parseInt(canvas.dataset.originalHeight);
	
	// Only restore if we have valid original dimensions
	if (originalWidth && originalHeight) {
		// Reset canvas dimensions to original values
		canvas.width = originalWidth;
		canvas.height = originalHeight;
		
		// Reset any added styles
		canvas.style.width = '';
		canvas.style.height = '';
		canvas.style.maxWidth = '';
		canvas.style.maxHeight = '';
		canvas.style.objectFit = '';

		// Update the WebGL viewport to match the restored canvas size
		try {
			const gl = canvas.getContext('webgl');
			if (gl) {
				gl.viewport(0, 0, canvas.width, canvas.height);
				console.log("Reset WebGL viewport to match original canvas size:", canvas.width, "x", canvas.height);
			}
		} catch (e) {
			console.error("Error updating WebGL viewport on fullscreen exit:", e);
		}
		
		// Re-render with original dimensions
		if (typeof requestRender === 'function') {
			requestRender();
		}
	}
}

// Create the fullscreen button element
function createFullscreenButton() {
	const fullscreenBtn = document.createElement('button');
	fullscreenBtn.id = 'fullscreenButton';
	fullscreenBtn.innerHTML = '⛶'; // Unicode fullscreen icon
	fullscreenBtn.style.cssText = `
		position: absolute;
		bottom: 10px;
		right: 10px;
		width: 32px;
		height: 32px;
		background-color: rgba(0, 0, 0, 0.5);
		color: #fff;
		border: 1px solid #555;
		border-radius: 4px;
		cursor: pointer;
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: 100;
	`;
	
	// Add event listener to toggle fullscreen
	fullscreenBtn.addEventListener('click', toggleFullscreen);
	
	return fullscreenBtn;
}

// Function to check if we're currently in fullscreen mode
function isFullscreen() {
	return Boolean(
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullscreenElement
	);
}

let storedFullscreenButton = null; // Global reference to store the button

// Modify toggleFullscreen function
function toggleFullscreen() {
    const canvas = document.getElementById('moireCanvas');
    const canvasContainer = document.getElementById('canvasContainer');
    const element = canvasContainer || canvas;
    
    if (!isFullscreen()) {
        // Store original canvas dimensions
        canvas.dataset.originalWidth = canvas.width;
        canvas.dataset.originalHeight = canvas.height;
    
		// Remove the event listeners from container
		const container = document.getElementById('canvasContainer');
		if (container) {
			container.removeEventListener('mouseenter', handleCanvasMouseEnter);
			container.removeEventListener('mouseleave', handleCanvasMouseLeave);
		}
			
        // Store the button BEFORE entering fullscreen
        storedFullscreenButton = document.getElementById('fullscreenButton');
        if (storedFullscreenButton && storedFullscreenButton.parentNode) {
            // Remove from DOM
            storedFullscreenButton.parentNode.removeChild(storedFullscreenButton);
            console.log("Button removed before entering fullscreen");
        }
        
        // Enter fullscreen after removing button
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen first
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        // Button will be restored in the fullscreenchange event
    }
}

// Function to adjust canvas resolution for fullscreen
function adjustCanvasResolution() {
	if (!isFullscreen()) return;
	
	const canvas = document.getElementById('moireCanvas');
	
	// Get the original canvas dimensions
	const originalWidth = parseInt(canvas.dataset.originalWidth || canvas.width);
	const originalHeight = parseInt(canvas.dataset.originalHeight || canvas.height);
	
	// Get screen dimensions
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;
	
	// Calculate new canvas dimensions while maintaining aspect ratio
	const aspectRatio = originalWidth / originalHeight;
	
	// Set new canvas dimensions at higher resolution
	if (screenWidth / screenHeight > aspectRatio) {
		// Screen is wider than canvas aspect ratio
		canvas.height = screenHeight;
		canvas.width = Math.round(screenHeight * aspectRatio);
	} else {
		// Screen is taller than canvas aspect ratio
		canvas.width = screenWidth;
		canvas.height = Math.round(screenWidth / aspectRatio);
	}
	
	// After setting the canvas width and height, also update CSS dimensions
	canvas.style.width = screenWidth + 'px';
	canvas.style.height = screenHeight + 'px';

	// Remove any conflicting CSS that might constrain the canvas
	canvas.style.maxWidth = 'none';
	canvas.style.maxHeight = 'none';
	canvas.style.position = 'static'; // or try 'absolute' if static doesn't work
	canvas.style.left = '0';
	canvas.style.top = '0';
	canvas.style.transform = 'none';

	// Update the WebGL viewport to match the new canvas size
	try {
		const gl = canvas.getContext('webgl');
		if (gl) {
			gl.viewport(0, 0, canvas.width, canvas.height);
			console.log("Updated WebGL viewport to match canvas size:", canvas.width, "x", canvas.height);
		}
	} catch (e) {
		console.error("Error updating WebGL viewport:", e);
	}

    console.log("WebGL viewport settings:");
    try {
        const gl = canvas.getContext('webgl');
        console.log("WebGL viewport:", gl.getParameter(gl.VIEWPORT));
    } catch (e) {
        console.log("Couldn't get WebGL context info:", e);
    }

	
	// Make sure to re-render after changing canvas dimensions
	if (typeof requestRender === 'function') {
		requestRender();
	}
	
    console.log("AFTER - Canvas dimensions:", canvas.width, "x", canvas.height);
    console.log("AFTER - Canvas CSS dimensions:", canvas.style.width, canvas.style.height);
    console.log("AFTER - Canvas bounding rect:", canvas.getBoundingClientRect());
}

// Modify the fullscreenchange handler
function handleFullscreenChange() {
    if (isFullscreen()) {
		// Enable presentation mode when entering fullscreen
		if (typeof renderer !== 'undefined' && renderer && renderer.setPresentationMode) {
			renderer.setPresentationMode(true);
		}

        // Double-check the button is gone
        const checkButton = document.getElementById('fullscreenButton');
        if (checkButton && checkButton.parentNode) {
            checkButton.parentNode.removeChild(checkButton);
            console.log("Button removed after entering fullscreen");
        }
        
        // Adjust canvas resolution
        setTimeout(adjustCanvasResolution, 100);
	} else {
		// Disable presentation mode when exiting fullscreen
		if (typeof renderer !== 'undefined' && renderer && renderer.setPresentationMode) {
			renderer.setPresentationMode(false);
		}

		// Reset canvas
		resetCanvasResolution();

		// We're exiting fullscreen - restore the button
		if (storedFullscreenButton) {
			const container = document.getElementById('canvasContainer');
			if (container) {
				container.appendChild(storedFullscreenButton);
				storedFullscreenButton.style.opacity = '0';
				
				// Reattach the hover event listeners
				container.addEventListener('mouseenter', handleCanvasMouseEnter);
				container.addEventListener('mouseleave', handleCanvasMouseLeave);
				
				console.log("Button restored after exiting fullscreen with hover events");
			}
		} else {
			// If we don't have a stored button, recreate everything
			initFullscreenFeature();
		}
	}
}

// Function to initialize fullscreen functionality
function initFullscreenFeature() {
	const canvas = document.getElementById('moireCanvas');
	
	// Create a container for the canvas if it doesn't exist
	let canvasContainer = document.getElementById('canvasContainer');
	
	if (!canvasContainer) {
		// Create container around canvas
		canvasContainer = document.createElement('div');
		canvasContainer.id = 'canvasContainer';
		canvasContainer.style.cssText = `
			position: relative;
			display: inline-block;
			margin: 20px auto;
		`;
		
		// Insert container in place of canvas
		canvas.parentNode.insertBefore(canvasContainer, canvas);
		canvasContainer.appendChild(canvas);
	}
	
	// Add fullscreen button to container
	const fullscreenBtn = createFullscreenButton();
	canvasContainer.appendChild(fullscreenBtn);
	
	// Add hover effect to show fullscreen button
	canvasContainer.addEventListener('mouseenter', handleCanvasMouseEnter);
	canvasContainer.addEventListener('mouseleave', handleCanvasMouseLeave);
		
	// Add double-click listener to toggle fullscreen
	canvas.addEventListener('dblclick', toggleFullscreen);
	
	// Add fullscreen change event listener
	document.addEventListener('fullscreenchange', handleFullscreenChange);
	document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
	document.addEventListener('mozfullscreenchange', handleFullscreenChange);
	document.addEventListener('MSFullscreenChange', handleFullscreenChange);
	
	// Add resize listener to adjust canvas resolution in fullscreen when window is resized
	window.addEventListener('resize', () => {
		if (isFullscreen()) {
			adjustCanvasResolution();
		}
	});
	
	console.log("Fullscreen feature initialized");
}


// Handle keyboard events in fullscreen mode
function handleFullscreenKeyPress(event) {
    // Only handle keypresses in fullscreen mode
    if (!isFullscreen()) return;
    
    // Check if the key pressed is spacebar
    if (event.code === 'Space' || event.keyCode === 32) {
        event.preventDefault(); // Prevent page scrolling
        
        // Toggle animation state
        if (animationInterval) {
            stopAnimation();
        } else {
            startAnimation();
        }
        
        console.log("Spacebar pressed in fullscreen mode - toggled animation");
    }
}


// Call this in the init function of the main moire.js file
// window.addEventListener('load', initFullscreenFeature);