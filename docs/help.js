// Help system

const helpContent = {
	main: `
		<h3>Getting Started</h3>
		<p>Welcome to Moiré Exploré! This tool allows you to create animated moiré patterns with wave perturbations.</p>
		
		<h4>Basic Workflow</h4>
		<ol>
			<li>Configure your grid and wave settings using the controls below the canvas.</li>
			<li>Configure two keyframes (K1 and K2) that define the start and end states of your animation.</li>
			<li>Click "Play" to animate between these states.</li>
		</ol>

		<h4>Key Concepts</h4>
		<p><strong>Grids:</strong> The patterns are formed by overlapping grid layers. Each grid can be customized.</p>
		<p><strong>Waves:</strong> Add movement and distortion to your grids with wave perturbations.</p>
		<p><strong>Keyframes:</strong> Define two states (K1 and K2) to animate between.</p>
		
		<h4>Quick Start</h4>
		<ol>
			<li>Stop animation (click &#9632; Stop)</li>
			<li>In the Global section, click Reset to Defaults</li>
			<li>In the Animation section, set Duration to 120 seconds</li>
			<li>In the Wave Perturbation section, Set Number of Waves to 10</li>
			<li>Set Per Grid Phase Offset to 2.0</li>
			<li>Click Randomize All Waves</li>
			<li>Scroll up to the Keyframes section, click Copy to Other Keyframe</li>
			<li>Now click Edit K2</li>
			<li>In the Grids section, slide Common Hue Rotation fully right (360°)</li>
			<li>In the Wave Perturbation section, slide Common Phase Offset fully right (360°)</li>
			<li>Click "Play" to animate between these states in a seamless loop</li>
		</ol>
		
		<h3>Help Topics</h3>
		<ul>
			<li><a href="#" onclick="showHelp('favorites'); return false;">Favorites</a></li>
			<li><a href="#" onclick="showHelp('animation'); return false;">Animation Controls</a></li>
			<li><a href="#" onclick="showHelp('globalControls'); return false;">Global Controls</a></li>
			<li><a href="#" onclick="showHelp('keyframes'); return false;">Using Keyframes</a></li>
			<li><a href="#" onclick="showHelp('grids'); return false;">Grid Settings</a></li>
			<li><a href="#" onclick="showHelp('colorPicker'); return false;">Color Picker</a></li>
			<li><a href="#" onclick="showHelp('waves'); return false;">Wave Perturbations</a></li>
			<li><a href="#" onclick="showHelp('fullscreen'); return false;">Fullscreen Mode</a></li>
			<li><a href="#" onclick="showHelp('redFive'); return false;">Publish to Red5 Pro</a></li>
			<li><a href="#" onclick="showHelp('renderToDisk'); return false;">Render to Disk</a></li>
			<li><a href="#" onclick="showHelp('sharing'); return false;">Share Your Creations</a></li>
			<li><a href="#" onclick="showHelp('about'); return false;">About</a></li>
		</ul>
	`,
	
	animation: `
		<h3>Animation Controls</h3>
		<p>The animation system interpolates between two keyframes (K1 and K2).</p>
		
		<h4>Settings</h4>
		<ul>
			<li><strong>Duration:</strong> How long the animation cycle takes to complete (in seconds)</li>
			<li><strong>Mode:</strong>
				<ul>
					<li><strong>Up:</strong> Animate from K1 to K2</li>
					<li><strong>Down:</strong> Animate from K2 to K1</li>
					<li><strong>Up & Down:</strong> Alternate direction while looping between K1 and K2.</li>
				</ul>
			</li>
		</ul>
		
		<h4>Mini Controls</h4>
		<p>When you scroll down the page, a mini-canvas appears in the top-right corner with animation controls:</p>
		<ul>
			<li>K1/K2 buttons: Switch between keyframes</li>
			<li>Play/Stop buttons: Control animation</li>
			<li>Double-click the mini-canvas to jump back to the main canvas</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,

	globalControls: `
		<h3>Global Controls</h3>
		<p>These settings affect the overall appearance and behavior of your moiré pattern.</p>
		
		<h4>Grid Structure</h4>
		<ul>
			<li><strong>Grid Count:</strong> Determines how many grid layers are rendered (2-8)</li>
			<li><strong>Grid Type:</strong>
				<ul>
					<li><strong>Rectangular:</strong> Creates a regular square/rectangular grid pattern</li>
					<li><strong>Hexagonal:</strong> Creates a honeycomb-like pattern with six-sided cells</li>
				</ul>
			</li>
			<li><strong>Blending Mode:</strong>
				<ul>
					<li><strong>Additive:</strong> Colors from all grid layers are summed together. Where multiple grids overlap, their RGB values add up to create brighter, more intense areas.</li>
					<li><strong>Overlay:</strong> Later grid layers replace earlier ones in a painting-like fashion. Only the topmost visible grid's color is shown at any pixel.</li>
					<li><strong>Multiply:</strong> Colors are multiplied together, resulting in darker areas where grids overlap. White has no effect, black results in black.</li>
					<li><strong>Screen:</strong> Inverse of multiply - colors are inverted, multiplied, and inverted again. Black has no effect, white results in white.</li>
					<li><strong>Difference:</strong> Subtracts the darker color from the lighter one, creating high contrast effects in overlap areas.</li>
					<li><strong>Exclusion:</strong> Similar to difference but with lower contrast, creating subtle color shifts in overlap areas.</li>
					<li><strong>Dodge:</strong> Divides bottom layer by inverted top layer, creating brightening effects. Useful for intense light interactions.</li>
					<li><strong>Burn:</strong> Inverts bottom layer, divides by top layer, then inverts the result. Creates darkening effects in overlaps.</li>
					<li><strong>Hard Light:</strong> Combination of screen and multiply based on the top color's brightness. Creates pronounced contrast.</li>
					<li><strong>XOR:</strong> Shows colors that appear in only one layer, creating distinctive edge patterns at grid intersections.</li>
				</ul>
			</li>
		</ul>
		
		<h4>Global Appearance Controls</h4>
		<ul>
			<li><strong>Canvas Background:</strong> Sets the background color for the entire canvas</li>
			<li><strong>Rotation Offset:</strong> Controls how much each subsequent grid rotates relative to the previous one</li>
			<li><strong>Common Hue Rotation:</strong> Rotates the hue of all grid colors by the same amount</li>
			<li><strong>Common Saturation:</strong> Adjusts the saturation of all grid colors. Negative values decrease saturation, positive values increase it.</li>
			<li><strong>Common Lightness:</strong> Adjusts the lightness of all grid colors. Negative values darken colors, positive values brighten them.</li>
			<li><strong>Common Thickness:</strong> Controls overall dot thickness for all grids</li>
			<li><strong>Scale:</strong> Scale factor for grid spacing (width and height)</li>
		</ul>
		
		<h4>Tips</h4>
		<ul>
			<li>To create looping animations, use Common Hue Offset: choose -360, 0, or 360 for K1, and a different one for K2</li>
			<li>For dramatic effects, try animating high contrast between grid colors and background</li>
			<li>Double-click on sliders to reset them to their default values</li>
			<li>Try different blending modes for completely different visual effects with the same pattern</li>
			<li>The Reset to Defaults button is useful if you want to start fresh</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,
	
	grids: `
		<h3>Grid Settings</h3>
		<p>The moiré effect is created by overlapping multiple grid layers, each with its own settings.</p>
		
		<h4>Individual Grid Settings</h4>
		<p>Each grid layer has its own properties that can be adjusted:</p>
		<ul>
			<li><strong>Thickness:</strong> Controls the size of the dots in the grid (0 = invisible, 1 = maximum size)</li>
			<li><strong>Width:</strong> The horizontal spacing between grid elements in pixels</li>
			<li><strong>Height:</strong> The vertical spacing between grid elements in pixels</li>
			<li><strong>Color:</strong> The color of the grid dots</li>
		</ul>
		
		<h4>Working with Grids</h4>
		<ul>
			<li>You can drag and reorder grids using the handle on the left side</li>
			<li>The order of grids affects how they blend together</li>
			<li>Each grid can be individually customized with different spacing and colors</li>
			<li>Try varying the thickness between grids to create depth perception</li>
		</ul>
		
		<h4>Tips</h4>
		<ul>
			<li>Try subtle rotation effects by setting K2 grid rotation differently</li>
			<li>To create looping animations, use Common Hue Offset: choose -360, 0, or 360 for K1, and a different one for K2</li>
			<li>For dramatic effects, try animating high contrast between grid colors and background</li>
			<li>When using multiple grids, try varying the thickness to create depth</li>
			<li>Experiment with complementary colors for adjacent grids</li>	
			<li>Double-click on sliders to reset them to their default values</li>
			<li>You can drag and reorder grids using the handle on the left side</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,

	colorPicker: `
		<h3>Color Picker</h3>
		<p>The color picker provides an intuitive way to choose colors for your grid layers.</p>
		
		<h4>Using the Color Picker</h4>
		<ol>
			<li>Click on any color box in the grid controls to open the color picker</li>
			<li>Select colors using the color area (saturation/value) and hue slider</li>
			<li>Fine-tune with the HSV sliders or enter a hex value directly</li>
			<li>Click "Apply" to set the color or "Cancel" to close without changes</li>
		</ol>
		
		<h4>Color Selection Methods</h4>
		<ul>
			<li><strong>Color Area:</strong> Click or drag in the main color square to set saturation and value</li>
			<li><strong>Hue Slider:</strong> Drag to change the base color hue</li>
			<li><strong>HSV Controls:</strong> Use sliders for precise control of Hue, Saturation, and Value</li>
			<li><strong>Hex Input:</strong> Type a CSS hex color code (e.g., #FF0000 for red)</li>
		</ul>
		
		<h4>Tips</h4>
		<ul>
			<li>Contrasting colors between grid layers often create the most striking moiré effects</li>
			<li>Experiment with shades of the same hue for subtle patterns</li>
			<li>Consider the background color when choosing grid colors for best visibility</li>
			<li>Use complementary colors (opposite on the color wheel) for vibrant visual effects</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,

	waves: `
		<h3>Wave Perturbations</h3>
		<p>Wave perturbations distort the grid patterns with various wave effects, creating dynamic and organic patterns.</p>
		
		<h4>Wave Settings</h4>
		<ul>
			<li><strong>Number of Waves:</strong> How many wave effects to apply (0-15)</li>
			<li><strong>Wave Offset Type:</strong>
				<ul>
					<li><strong>Phase Offset:</strong> Each grid layer has the wave's phase shifted by a fixed amount</li>
					<li><strong>Vector Offset:</strong> Each grid layer has the wave's position shifted by a vector amount</li>
				</ul>
			</li>
		</ul>
		
		<h4>Individual Wave Settings</h4>
		<p>Each wave has its own properties:</p>
		<ul>
			<li><strong>Wave Type:</strong>
				<ul>
					<li><strong>Transverse:</strong> Displaces grid points perpendicular to the wave direction</li>
					<li><strong>Longitude:</strong> Displaces grid points parallel to the wave direction</li>
					<li><strong>Amplitude:</strong> Modulates the size of the grid dots instead of their position</li>
					<li><strong>Hue:</strong> Shifts the hue (color) of grid dots based on wave patterns</li>
					<li><strong>Saturation:</strong> Modulates the color saturation based on wave patterns</li>
					<li><strong>Lightness:</strong> Modulates the brightness/darkness based on wave patterns</li>
					<li><strong>Rotation:</strong> Modulates the rotation angle of grid layers, creating swirling effects</li>
					<li><strong>Phase Shift:</strong> Modulates the phase of other waves, creating complex interactions</li>
				</ul>
			</li>
			<li><strong>Amplitude:</strong> Controls how strong the wave effect is. 
				<ul>
					<li>For displacement waves: controls the maximum distance of displacement</li>
					<li>For color waves: controls the maximum color shift (hue shift in degrees, saturation or lightness as percentage)</li>
					<li>For rotation waves: controls the maximum rotation angle in degrees</li>
					<li>For phase shift waves: controls the maximum phase offset in degrees applied to other waves</li>
				</ul>
			</li>
			<li><strong>Frequency:</strong> Controls how tightly packed the wave oscillations are</li>
			<li><strong>Phase:</strong> Controls the starting position in the wave cycle (0-360°)</li>
			<li><strong>Direction:</strong> Sets the angle of the wave's propagation
				<ul>
					<li>Use the circular control to set direction visually by clicking and dragging</li>
					<li>You can also enter a precise angle in degrees</li>
				</ul>
			</li>
		</ul>
		
		<h4>Tips</h4>
		<ul>
			<li>To create looping animations, use Common Phase Offset: choose -360, 0, or 360 for K1, and a different one for K2</li>
			<li>Use the "Randomize" buttons to quickly discover interesting wave combinations</li>
			<li>Randomization flags are not part of any keyframe or animation -- they only apply when you click the button.</li>
			<li>For dramatic rainbow effects, use multiple hue waves with different directions</li>
			<li>Try combining different wave types for complex movements</li>
			<li>When using per-grid phase offset, small values create interesting subtle differences between layers</li>
			<li>You can drag and reorder waves using the handle on the left side</li>
			<li>Double-click on phase sliders to reset them to 0°</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,

	keyframes: `
		<h3>Using Keyframes</h3>
		<p>Keyframes allow you to save different states of your moiré pattern and animate between them. The interface is always bound to one keyframe at any given time.</p>
		
		<h4>Working with Keyframes</h4>
		<ol>
			<li><strong>Select a keyframe to edit:</strong> Use the "Edit K1" or "Edit K2" radio buttons to choose which keyframe you're modifying</li>
			<li><strong>Configure your keyframe:</strong> Any changes you make to the controls automatically update the currently selected keyframe</li>
			<li><strong>Switch between keyframes:</strong> Toggle between K1 and K2 to set up both states of your animation</li>
			<li><strong>Copy to other keyframe:</strong> Use the "Copy to Other Keyframe" button to duplicate your current settings to the other keyframe</li>
			<li><strong>Reset current keyframe:</strong> Use the "Reset Current Keyframe" button to revert to default settings</li>
			<li><strong>Start Animation:</strong> Click "Play" to animate between K1 and K2</li>
		</ol>
		
		<h4>Animation Parameters</h4>
		<ul>
			<li><strong>Duration:</strong> How long (in seconds) it takes to transition between keyframes</li>
			<li><strong>Mode:</strong>
				<ul>
					<li><strong>Up:</strong> Animate from K1 to K2</li>
					<li><strong>Down:</strong> Animate from K2 to K1</li>
					<li><strong>Up & Down:</strong> Continuously cycle between K1 and K2</li>
				</ul>
			</li>
		</ul>
		
		<h4>Tips</h4>
		<ul>
			<li>Changes to controls automatically update the currently selected keyframe</li>
			<li>Create subtle animations by making small differences between K1 and K2</li>
			<li>For smooth phase animations, set keyframes with 360° phase difference</li>
			<li>For dramatic transitions, try different grid types or render modes between keyframes</li>
			<li>You can edit keyframes while animating, but the display shows the animation, not the selected keyframe</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,
	
	fullscreen: `
		<h3>Fullscreen Mode</h3>
		<p>Moiré Exploré includes a fullscreen mode for optimal viewing and presentation.</p>
		
		<h4>How to Enter Fullscreen</h4>
		<ul>
			<li>Click the fullscreen button (⛶) in the bottom-right corner of the canvas</li>
			<li>Double-click anywhere on the canvas</li>
		</ul>
		
		<h4>Controls in Fullscreen Mode</h4>
		<ul>
			<li>Press <strong>Spacebar</strong> to toggle animation play/pause</li>
			<li>Press <strong>Escape</strong> or double-click the canvas to exit fullscreen</li>
		</ul>
		
		<h4>Notes</h4>
		<ul>
			<li>Fullscreen mode displays your pattern at the highest possible resolution</li>
			<li>The canvas will automatically resize to fill your screen</li>
			<li>Animation settings are preserved when entering and exiting fullscreen</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,
	
		publishing: `
			<h3>Publishing to Red5 Pro</h3>
			<p>You can stream your moiré patterns live to a Red5 Pro server using the WebRTC-based WHIP protocol.</p>
			
			<h4>How to Publish</h4>
			<ol>
				<li>Enter your Red5 Pro server URL (e.g., https://your-red5pro-server.com)</li>
				<li>Enter the Stream GUID in the format "app/streamName" (e.g., live/canvasTest)</li>
				<li>Click the "Publish" button to start streaming</li>
				<li>Click "Stop Publishing" when you want to end the stream</li>
			</ol>
			
			<h4>Requirements</h4>
			<ul>
				<li>A Red5Pro server with WHIP support</li>
				<li>Valid server URL with protocol (https or wss)</li>
				<li>Proper Stream GUID format (app/streamName)</li>
				<li>An active animation or pattern to stream</li>
			</ul>
			
			<h4>Tips</h4>
			<ul>
				<li>For best results, start an animation before publishing</li>
				<li>Higher FPS (frames per second) streams require more bandwidth</li>
				<li>Remember to stop publishing when you're done to free up resources</li>
			</ul>
			
			<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
		`,
		
	sharing: `
		<h3>Sharing Your Creations</h3>
		<p>Create a link to share your moiré patterns and animations.</p>
		
		<h4>How to Share</h4>
		<ol>
			<li>Configure your pattern and set keyframes</li>
			<li>Click the "Generate Share Link" button at the bottom of the controls</li>
			<li>A URL will be generated and copied to your clipboard</li>
			<li>Share this URL with others - when they open it, they'll see exactly what you created</li>
		</ol>
		
		<h4>What Gets Shared</h4>
		<p>Your share link includes:</p>
		<ul>
			<li>All grid settings (count, type, render mode, colors, dimensions)</li>
			<li>All wave settings and parameters</li>
			<li>Animation settings (duration, mode)</li>
			<li>Both keyframes (K1 and K2) if you've set them</li>
			<li>Potentially over 260 parameters!</li>
		</ul>
		
		<h4>Privacy Note</h4>
		<p>All pattern data is encoded directly in the URL - no data is stored on any server. The patterns exist only in your browser and in the browsers of people you share links with.</p>
		
		<h4>Tips</h4>
		<ul>
			<li>Create different share links for different variations of your pattern</li>
			<li>For best results, set both keyframes before sharing animations</li>
			<li>Use share links to bookmark your favorite patterns</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,
	
	favorites: `
		<h3>Favorites System</h3>
		<p>The Favorites feature lets you save, organize, and reuse your pattern designs.</p>
		
		<h4>Saving a Design</h4>
		<ul>
			<li>Each pattern automatically gets a unique title (visible in the "Title" field)</li>
			<li>Click the star icon (☆) to save the current pattern to your favorites</li>
			<li>The star will fill (★) to indicate the pattern is saved</li>
			<li>If you modify a saved pattern, the star turns red to indicate unsaved changes</li>
		</ul>
		
		<h4>Managing Favorites</h4>
		<ul>
			<li><strong>Title:</strong> Give your pattern a descriptive name (or give them all the same name, whatever)</li>
			<li><strong>Randomize:</strong> Click the dice button to generate a random name</li>
			<li><strong>Autosave:</strong> Enable to automatically save changes to favorites</li>
			<li><strong>New ID:</strong> Generate a new unique identifier for your pattern, creating a separate copy that won't affect the original in favorites</li>
			<li><strong>View Favorites:</strong> Visit the Favorites page to see all your saved patterns</li>
		</ul>
		
		<h4>Favorites Page</h4>
		<p>The Favorites page (favorites.html) lets you:</p>
		<ul>
			<li>View all your saved patterns</li>
			<li>Play animations for any saved pattern</li>
			<li>Edit titles and descriptions by clicking on them</li>
			<li>Delete individual patterns</li>
			<li>Open patterns in the editor</li>
		</ul>
		
		<h4>Storage</h4>
		<p>Favorites are stored in your browser's localStorage. They persist between sessions but are limited to the browser you used to save them.</p>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,

	renderToDisk: `
		<h3>Render to Disk</h3>
		<p>The Render to Disk feature allows you to export your animation as a sequence of high-resolution PNG images, which can be used to create videos using external software.</p>
		
		<h4>Prerequisites</h4>
		<ul>
			<li>This feature requires a modern browser that supports the File System Access API (Chrome, Edge, or other Chromium-based browsers)</li>
			<li>You'll need to select a folder where the images will be saved</li>
		</ul>
		
		<h4>Settings</h4>
		<ul>
			<li><strong>FPS:</strong> Frames per second for the output (higher values create smoother animations but more files)</li>
			<li><strong>Width/Height:</strong> Resolution of the output images in pixels</li>
			<li><strong>Frame Count:</strong> Automatically calculated based on animation duration × FPS</li>
		</ul>
		
		<h4>Export Process</h4>
		<ol>
			<li>Configure your animation's appearance and duration</li>
			<li>Set resolution and FPS in the Render to Disk section</li>
			<li>Click "Render... frames to disk"</li>
			<li>Choose a directory when prompted</li>
			<li>Wait for the rendering to complete (progress is displayed)</li>
			<li>Files will be named with sequential numbering (e.g., pattern_0001.png, pattern_0002.png)</li>
		</ol>
		
		<h4>Creating Videos</h4>
		<p>To create a video from the PNG sequence, use software like:</p>
		<ul>
			<li>FFmpeg (command line): <code>ffmpeg -r [FPS] -i pattern_%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4</code></li>
			<li>Adobe Premiere, After Effects, DaVinci Resolve, or other video editing software</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,

	redFive: `
		<h3>Red5 Pro Publishing</h3>
		<p>Stream your moiré patterns live to a <a href="https://www.red5.net/">Red5 Pro</a> server using the WebRTC-based WHIP protocol.</p>
		
		<h4>How to Publish</h4>
		<ol>
			<li>Enter your Red5 Pro server URL (e.g., https://your-red5pro-server.com)</li>
			<li>Enter the Stream GUID in the format "app/streamName" (e.g., live/canvasTest)</li>
			<li>Click the "Publish Video" button to start streaming</li>
			<li>Click "Stop Publishing" when you want to end the stream</li>
		</ol>
		
		<h4>Requirements</h4>
		<ul>
			<li>A Red5 Pro server</li>
			<li>Valid server URL with protocol (https or wss)</li>
			<li>Proper Stream GUID format (app/streamName)</li>
		</ul>
		
		<h4>Tips</h4>
		<ul>
			<li>For best results, start an animation before publishing</li>
			<li>Remember to stop publishing when you're done to free up resources</li>
		</ul>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`,
	
	about: `
		<h3>About Moiré Exploré</h3>
		
		<p>Moiré Exploré is an interactive WebGL-based tool that brings together mathematics, art, and programming to create mesmerizing visual patterns. Developed with a passion for creative coding and generative art, this application empowers artists, designers, and curious explorers to experiment with moiré effects through an intuitive interface.</p>
		
		<h4>Features</h4>
		<ul>
			<li>Real-time WebGL rendering for smooth, high-performance graphics</li>
			<li>Advanced wave perturbation system with directional controls</li>
			<li>Keyframe animation with interpolation between states</li>
			<li>High-resolution fullscreen mode for presentations</li>
			<li>Shareable link generation for easy collaboration</li>
		</ul>
		
		<h4>Creator</h4>
		<p>This tool was lovingly crafted by an artist-programmer dedicated to exploring the intersection of mathematics and visual creativity. Through meticulous attention to detail and thoughtful UI design, the creator has made complex wave dynamics and moiré mathematics accessible to everyone.</p>
		
		<h4>Copyright</h4>
		<p>© 2025 Nate Roe. All rights reserved.</p>
		<p>This application is protected by copyright law. Unauthorized reproduction or distribution of this software, or any portion of it, may result in severe civil and criminal penalties.</p>
		
		<p>For more information or to report issues, please contact the creator through the project repository.</p>
		
		<p><a href="#" onclick="showHelp('main'); return false;">Back to Main Help</a></p>
	`
};

function showHelp(topic) {
	document.getElementById('helpContent').innerHTML = helpContent[topic] || helpContent.main;
	document.getElementById('helpOverlay').style.display = 'block';
}

function closeHelp() {
	document.getElementById('helpOverlay').style.display = 'none';
}

// Add tooltip help to any element
function addTooltip(element, helpText) {
	const tooltip = document.createElement('span');
	tooltip.className = 'tooltip';
	tooltip.innerHTML = `<span class="icon">?</span><span class="tooltip-text">${helpText}</span>`;
	element.parentNode.insertBefore(tooltip, element.nextSibling);
}		