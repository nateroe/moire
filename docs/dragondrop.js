// ---- Dragon Drop
// Variables to track dragging state
let draggedItem = null;
let draggedContainer = null;
let originalIndex = -1;
let dragStartX = 0;
let dragStartY = 0;
let dropTarget = null;
let dropPosition = null; // 'before' or 'after'

// Initialize drag functionality for a container
function initDragForContainer(containerId) {
	const container = document.getElementById(containerId);
	if (!container) {
		console.error(`Container with ID ${containerId} not found!`);
		return;
	}
	
	const items = container.querySelectorAll('.grid-control, .wave-control');
	
	items.forEach(item => {
		const handle = item.querySelector('.drag-handle');
		if (!handle) {
			console.error(`Drag handle not found in item:`, item);
			return;
		}
		
		// Set explicit touch-action to prevent browser handling
		handle.style.touchAction = 'none';
		
		// Remove any existing listeners (to prevent duplicates)
		handle.removeEventListener('mousedown', handleDragStart);
		
		// Add new drag start event listener
		handle.addEventListener('mousedown', handleDragStart);
	});
}

// Handle the drag start event
function handleDragStart(e) {
	e.preventDefault();
	e.stopPropagation();
	
	console.log("Drag started on handle");
	
	const item = this.closest('.grid-control, .wave-control');
	if (!item) {
		console.error("Could not find parent item of drag handle");
		return;
	}
	
	// Save the initial drag position
	dragStartX = e.clientX;
	dragStartY = e.clientY;
	
	// Set global drag state
	draggedItem = item;
	draggedContainer = item.parentNode;
	originalIndex = parseInt(item.getAttribute('data-index'));
	
	console.log(`Starting drag of item with index ${originalIndex}, container: ${draggedContainer.id}`);
	
	// Add dragging class for visual feedback
	draggedItem.classList.add('dragging');
	
	// Clone the item for better drag visualization
	const clone = draggedItem.cloneNode(true);
	clone.id = 'dragClone';
	clone.style.position = 'absolute';
	clone.style.zIndex = '1000';
	clone.style.width = draggedItem.offsetWidth + 'px';
	clone.style.opacity = '0.8';
	clone.style.pointerEvents = 'none';
	document.body.appendChild(clone);
	
	// Position the clone at the cursor
	clone.style.top = (e.pageY - 20) + 'px';
	clone.style.left = (e.pageX - 20) + 'px';
	
	// Apply visibility styles to the original item
	draggedItem.style.visibility = 'hidden';
	
	// Add global event listeners
	document.addEventListener('mousemove', handleDragMove);
	document.addEventListener('mouseup', handleDragEnd);
}

// Handle mouse movement during drag
function handleDragMove(e) {
	if (!draggedItem) return;
	
	const clone = document.getElementById('dragClone');
	if (!clone) return;
	
	// Move the clone with the cursor
	clone.style.top = (e.pageY - 20) + 'px';
	clone.style.left = (e.pageX - 20) + 'px';
	
	// Reset all items to normal first
	resetItemPositions();
	
	// Find the element under the cursor
	clone.style.pointerEvents = 'none';
	const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
	clone.style.pointerEvents = 'auto';
	
	if (!elemBelow) return;
	
	// Find the closest item in the container
	const closestItem = elemBelow.closest('.grid-control, .wave-control');
	
	if (closestItem && closestItem !== draggedItem && closestItem.parentNode === draggedContainer) {
		// Get the rect of the item to determine if we're above or below the midpoint
		const rect = closestItem.getBoundingClientRect();
		const midY = rect.top + rect.height / 2;
		
		// Store the drop target and position
		dropTarget = closestItem;
		dropPosition = e.clientY < midY ? 'before' : 'after';
		
		// Create visual indicator of where item will be dropped
		if (dropPosition === 'before') {
			closestItem.style.borderTop = '4px solid #4ba3ff';
			closestItem.style.marginTop = '1px';
		} else {
			closestItem.style.borderBottom = '4px solid #4ba3ff';
			closestItem.style.marginBottom = '1px';
		}
		
		console.log(`Drop target: ${dropTarget.getAttribute('data-index')}, position: ${dropPosition}`);
	} else {
		dropTarget = null;
		dropPosition = null;
	}
}

// Reset all item positions and styles
function resetItemPositions() {
	if (!draggedContainer) return;
	
	const items = draggedContainer.querySelectorAll('.grid-control, .wave-control');
	items.forEach(item => {
		if (item !== draggedItem) {
			item.style.transform = '';
			item.style.marginTop = '';
			item.style.marginBottom = '';
			item.style.borderTop = '';
			item.style.borderBottom = '';
		}
	});
}

// Handle drag end
function handleDragEnd(e) {
	if (!draggedItem) return;
	
	console.log("Drag ended");
	
	// Remove the clone
	const clone = document.getElementById('dragClone');
	if (clone) {
		document.body.removeChild(clone);
	}
	
	// Reset visibility of original item
	draggedItem.style.visibility = '';
	
	// Reset all item positions
	resetItemPositions();
	
	// Remove dragging class
	draggedItem.classList.remove('dragging');
	
	// Perform the actual move if we have a drop target
	if (dropTarget && dropPosition) {
		if (dropPosition === 'before') {
			draggedContainer.insertBefore(draggedItem, dropTarget);
		} else {
			draggedContainer.insertBefore(draggedItem, dropTarget.nextSibling);
		}
		
		// Update data structures
		updatePositionData();
	}
	
	// Clean up
	draggedItem = null;
	draggedContainer = null;
	dropTarget = null;
	dropPosition = null;
	originalIndex = -1;
	
	// Remove document event listeners
	document.removeEventListener('mousemove', handleDragMove);
	document.removeEventListener('mouseup', handleDragEnd);
}

// Update data after repositioning
function updatePositionData() {
	console.log("Updating position data for both keyframes");
	
	// Determine which container we're working with
	const isGridContainer = draggedContainer.id === 'gridControls';
	
	if (isGridContainer) {
		updateGridPositions();
	} else {
		updateWavePositions();
	}
}

// Update grid data after reordering
function updateGridPositions() {
	console.log("Updating grid positions for both keyframes...");
	const gridItems = document.querySelectorAll('#gridControls .grid-control');
	const gridCount = gridItems.length;
	const settings = appSettings;
	
	// Store the old indices and names for both keyframes
	const gridMappings = [];
	
	console.log(`Found ${gridCount} grid items`);
	
	// First, build a mapping of old index to new index
	gridItems.forEach((item, newIndex) => {
		const oldIndex = parseInt(item.getAttribute('data-index'));
		const gridName = item.getAttribute('data-name');
		
		gridMappings.push({
			oldIndex: oldIndex,
			newIndex: newIndex,
			name: gridName
		});
		
		console.log(`Grid item moving from index ${oldIndex} to ${newIndex}`);
	});
	
	// Now update both keyframes using the mapping
	for (const keyframeName of ['k1', 'k2']) {
		const newGrids = [];
		
		// Apply the mapping to this keyframe's grids
		gridMappings.forEach(mapping => {
			// Get the original grid data from this keyframe
			const gridData = settings.keyframes[keyframeName].grids[mapping.oldIndex];
			
			// Keep the name in the data
			newGrids[mapping.newIndex] = {
				...gridData,
				name: mapping.name // Preserve the name
			};
		});
		
		// Update this keyframe's grids array
		settings.keyframes[keyframeName].grids = newGrids;
	}
	
	// Now update the UI elements to match the new indices
	gridItems.forEach((item, newIndex) => {
		// Update data-index to match new position
		item.setAttribute('data-index', newIndex);
		
		// Update all input elements to have the correct data-index
		const inputs = item.querySelectorAll('input, select');
		console.log(`Updating ${inputs.length} input elements with new index ${newIndex}`);
		
		inputs.forEach(input => {
			input.setAttribute('data-index', newIndex);
		});
	});
	
	// Save settings
	saveSettings();
					
	// Refresh the rendering
	requestRender();
}

// Update wave data after reordering
function updateWavePositions() {
	console.log("Updating wave positions for both keyframes...");
	const waveItems = document.querySelectorAll('#waveControls .wave-control');
	const waveCount = waveItems.length;
	const settings = appSettings;
	
	// Store the old indices and names for both keyframes
	const waveMappings = [];
	
	console.log(`Found ${waveCount} wave items`);
	
	// First, build a mapping of old index to new index
	waveItems.forEach((item, newIndex) => {
		const oldIndex = parseInt(item.getAttribute('data-index'));
		const waveName = item.getAttribute('data-name');
		
		waveMappings.push({
			oldIndex: oldIndex,
			newIndex: newIndex,
			name: waveName
		});
		
		console.log(`Wave item moving from index ${oldIndex} to ${newIndex}`);
	});
	
	// Now update both keyframes using the mapping
	for (const keyframeName of ['k1', 'k2']) {
		const newWaves = [];
		
		// Apply the mapping to this keyframe's waves
		waveMappings.forEach(mapping => {
			// Get the original wave data from this keyframe
			const waveData = settings.keyframes[keyframeName].waves[mapping.oldIndex];
			
			// Keep the name in the data
			newWaves[mapping.newIndex] = {
				...waveData,
				name: mapping.name // Preserve the name
			};
		});
		
		// Update this keyframe's waves array
		settings.keyframes[keyframeName].waves = newWaves;
	}
	
	// Now update the UI elements to match the new indices
	waveItems.forEach((item, newIndex) => {
		// Update data-index to match new position
		item.setAttribute('data-index', newIndex);
		
		// Update all input elements to have the correct data-index
		const elements = item.querySelectorAll('input, select, span, button');
		console.log(`Updating ${elements.length} elements with new index ${newIndex}`);
		
		elements.forEach(el => {
			if (el.hasAttribute('data-index')) {
				el.setAttribute('data-index', newIndex);
			}
		});
	});
	
	// Save settings
	saveSettings();
	
	// Refresh the rendering
	requestRender();
}

function initDragAndDrop() {
	// Initialize drag for existing containers
	initDragForContainer("gridControls");
	initDragForContainer("waveControls");
	return Promise.resolve();
}
