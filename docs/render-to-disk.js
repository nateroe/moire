// Add to moire.js or create a new file render-to-disk.js

// Global variable to track render state
let isRendering = false;
let shouldCancelRender = false;

function checkFileSystemAPISupport() {
    return 'showDirectoryPicker' in window;
}

// Initialize the base filename on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for File System Access API support
    if (!checkFileSystemAPISupport()) {
        // Disable all render controls
        document.getElementById('renderFPS').disabled = true;
        document.getElementById('renderWidth').disabled = true;
        document.getElementById('renderHeight').disabled = true;
        document.getElementById('renderToDiskButton').disabled = true;
        
        // Add unsupported message
        const renderSection = document.querySelector('#renderToDiskButton').parentElement.parentElement;
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = 'color: #ff4444; font-size: 14px; margin-top: 10px; font-weight: bold;';
        warningDiv.textContent = 'NOT SUPPORTED IN YOUR BROWSER - Use Chrome for this feature';
        renderSection.appendChild(warningDiv);
        
        // Gray out the section
        renderSection.style.opacity = '0.5';
    } else {
		const renderBasename = document.getElementById('designTitle');
		if (renderBasename && !renderBasename.value) {
			// Generate a default filename
			const name = generateRandomName().toLowerCase().replace(' ', '-');
			renderBasename.value = name;
		}
		
		// Update frame count when FPS changes
		const renderFPS = document.getElementById('renderFPS');
		const animationDuration = document.getElementById('animationDuration');
		
		function updateFrameCount() {
			const fps = parseInt(renderFPS.value) || 30;
			const duration = parseFloat(animationDuration.value) || 2.0;
			const frameCount = Math.floor(fps * duration);
			document.getElementById('frameCount').textContent = frameCount;
		}
		
		renderFPS.addEventListener('input', updateFrameCount);
		animationDuration.addEventListener('input', updateFrameCount);
		
		// Initial update
		updateFrameCount();
		
		// Render button handler
		document.getElementById('renderToDiskButton').addEventListener('click', renderAnimationToDisk);
		
		document.getElementById('randomizeFilename').addEventListener('click', function() {
			const renderBasename = document.getElementById('designTitle');
			const name = generateRandomName().toLowerCase().replace(' ', '-');
			renderBasename.value = name;
		});
	}
});

// Update the renderAnimationToDisk function
async function renderAnimationToDisk() {
    // Stop any running animation
    if (animationInterval) {
        stopAnimation();
    }
    
    // Set render state
    isRendering = true;
    shouldCancelRender = false;
 
    // Create modal overlay
    const modalOverlay = createRenderModal();
    document.body.appendChild(modalOverlay);
    
    // Disable all other controls
    disableAllControls();
 
    // Update button visibility
    document.getElementById('renderToDiskButton').style.display = 'none';
    document.getElementById('cancelRenderButton').style.display = 'inline-block';
    
    // Get parameters
    const fps = parseInt(document.getElementById('renderFPS').value) || 30;
    const duration = parseFloat(document.getElementById('animationDuration').value) || 2.0;
    const width = parseInt(document.getElementById('renderWidth').value) || 1920;
    const height = parseInt(document.getElementById('renderHeight').value) || 1080;
    const basename = document.getElementById('designTitle').value || 'render';
    
    const totalFrames = Math.floor(fps * duration);
    const frameDuration = 1000 / fps; // milliseconds per frame
    
    // Request directory access
    let dirHandle;
    try {
        dirHandle = await window.showDirectoryPicker();
    } catch (err) {
        console.log('User cancelled directory selection');
        resetRenderUI();
        return;
    }
    
    // Show progress UI
    const progressDiv = document.getElementById('renderProgress');
    progressDiv.style.display = 'block';
    document.getElementById('totalFrames').textContent = totalFrames;
    
    // Create isolated rendering setup
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    
    // Create separate viewport manager for isolation
    const renderViewport = new ViewportSwitchingManager();
    
    // Create isolated renderer
    const diskRenderer = new MoireRenderer(offscreenCanvas, appSettings, false, renderViewport);
        
    // Give canvas an ID if it doesn't have one
    if (!offscreenCanvas.id) {
        offscreenCanvas.id = 'disk-render-canvas';
    }
    
    // Render state tracking
    const startTime = performance.now();
    let totalRenderTime = 0;
    
    try {
        for (let frame = 0; frame < totalFrames; frame++) {
            // Check for cancellation
            if (shouldCancelRender) {
                console.log('Render cancelled by user');
                showToast('Render cancelled');
                break;
            }
            
            const frameStartTime = performance.now();
            
            // Calculate animation time for this frame
            const animationTime = (frame / fps) * 1000; // milliseconds
            const duration = appSettings.animSettings.duration * 1000;
            const mode = appSettings.animSettings.mode;
            
            // Calculate t value (0-1) based on animation mode
            let t = (animationTime % duration) / duration;
            if (mode === "down") t = 1.0 - t;
            if (mode === "upAndDown" && Math.floor(animationTime / duration) % 2 === 1) t = 1.0 - t;
            
            // Get interpolated settings
            const interpolatedSettings = diskRenderer.interpolateSettings(t);
            
            // Render to the offscreen canvas
            renderViewport.renderToCanvas(offscreenCanvas.id, interpolatedSettings);
            
            // Convert canvas to blob
            const blob = await new Promise(resolve => {
                offscreenCanvas.toBlob(resolve, 'image/png');
            });
            
            // Create filename
            const frameNumber = frame.toString().padStart(4, '0');
            const filename = `${basename}_${frameNumber}.png`;
            
            // Write file
            const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            
            // Update progress
            const frameEndTime = performance.now();
            const frameTime = frameEndTime - frameStartTime;
            totalRenderTime += frameTime;
            
            updateRenderProgress(frame + 1, totalFrames, totalRenderTime, startTime);
            
            // Yield to browser to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        if (!shouldCancelRender) {
            console.log('Render complete!');
            showToast('Render complete!');
        }
        
    } catch (err) {
        console.error('Render error:', err);
        showToast(`Render error: ${err.message}`);
    } finally {
        // Clean up resources
        diskRenderer.dispose();
        renderViewport.dispose();
        progressDiv.style.display = 'none';
        resetRenderUI();
    }
}

function cancelRender() {
    shouldCancelRender = true;
}

function resetRenderUI() {
    isRendering = false;
    shouldCancelRender = false;
	
    // Remove modal
    const modal = document.getElementById('renderModal');
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
    
    // Re-enable controls
    enableAllControls();	
	
    document.getElementById('renderToDiskButton').style.display = 'inline-block';
    document.getElementById('cancelRenderButton').style.display = 'none';
}

function updateRenderProgress(currentFrame, totalFrames, totalRenderTime, startTime) {
    document.getElementById('currentFrame').textContent = currentFrame;
    
    // Average frame time
    const avgFrameTime = totalRenderTime / currentFrame;
    document.getElementById('avgFrameTime').textContent = avgFrameTime.toFixed(1);
    
    // Elapsed time
    const elapsed = performance.now() - startTime;
    const elapsedSeconds = Math.floor(elapsed / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedSecondsRemainder = elapsedSeconds % 60;
    document.getElementById('elapsedTime').textContent = 
        `${elapsedMinutes}:${elapsedSecondsRemainder.toString().padStart(2, '0')}`;
    
    // Estimated time remaining
    const framesRemaining = totalFrames - currentFrame;
    const estimatedRemaining = framesRemaining * avgFrameTime;
    const remainingSeconds = Math.floor(estimatedRemaining / 1000);
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingSecondsRemainder = remainingSeconds % 60;
    document.getElementById('remainingTime').textContent = 
        `${remainingMinutes}:${remainingSecondsRemainder.toString().padStart(2, '0')}`;
}

function createRenderModal() {
    const overlay = document.createElement('div');
    overlay.id = 'renderModal';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background-color: #252525;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        width: 400px;
    `;
    
	modal.innerHTML = `
		<h3 style="color: #4ba3ff; margin-bottom: 20px;">Rendering Animation</h3>
		<div id="renderProgress">
			<div>Progress: Frame <span id="currentFrame">0</span> of <span id="totalFrames">0</span></div>
			<div>Average frame time: <span id="avgFrameTime">0</span>ms</div>
			<div>Elapsed: <span id="elapsedTime">0:00</span></div>
			<div>Estimated remaining: <span id="remainingTime">0:00</span></div>
		</div>
		<button id="cancelRenderButton" style="
			margin-top: 20px;
			background-color: #1a1a1a;
			color: #ff4b4b;
			border: 1px solid #ff4b4b;
			padding: 8px 16px;
			border-radius: 4px;
			cursor: pointer;
			font-size: 14px;
			font-weight: bold;
			transition: all 0.2s ease;
		" 
		onmouseover="this.style.backgroundColor='#ff4b4b'; this.style.color='#fff';"
		onmouseout="this.style.backgroundColor='#1a1a1a'; this.style.color='#ff4b4b';">
			Cancel Render
		</button>
	`;
    
    overlay.appendChild(modal);
    
    // Bind cancel button
    overlay.querySelector('#cancelRenderButton').addEventListener('click', cancelRender);
    
    return overlay;
}

function disableAllControls() {
    // Find all input controls and buttons
    const controls = document.querySelectorAll('input, button, select, textarea');
    controls.forEach(control => {
        if (control.id !== 'cancelRenderButton') {
            control.dataset.wasDisabled = control.disabled ? 'true' : 'false';
            control.disabled = true;
        }
    });
    
    // Also disable the canvas
    const canvas = document.getElementById('moireCanvas');
    if (canvas) {
        canvas.style.pointerEvents = 'none';
    }
}

function enableAllControls() {
    const controls = document.querySelectorAll('input, button, select, textarea');
    controls.forEach(control => {
        if (control.dataset.wasDisabled !== 'true') {
            control.disabled = false;
        }
        delete control.dataset.wasDisabled;
    });
    
    const canvas = document.getElementById('moireCanvas');
    if (canvas) {
        canvas.style.pointerEvents = 'auto';
    }
}
