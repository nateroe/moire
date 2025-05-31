// UUID generator function using crypto API if available, with fallback
function generateUUID() {
    // Use crypto.randomUUID if available (modern browsers)
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    
    // Fallback implementation using Math.random()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to generate a new ID for the current design
function generateNewId(event) {
    // Generate a new UUID
    appSettings.guid = generateUUID();
    
    // This is now a "new" design that is not in favorites
    updateFavoriteButton(false, false);
    
    // Save settings with the new GUID
    saveSettings();
    
    // Show toast confirmation
    const clientX = event ? event.clientX : window.innerWidth / 2;
    const clientY = event ? event.clientY : window.innerHeight / 2;
    showToast2(`Generated new ID for "${appSettings.title}"`, clientX, clientY);
}

// Load favorites from localStorage
function loadFavorites() {
    const favoritesStr = localStorage.getItem("moireFavorites");
    return favoritesStr ? JSON.parse(favoritesStr) : [];
}

// Save favorites to localStorage
function saveFavorites(favorites) {
    localStorage.setItem("moireFavorites", JSON.stringify(favorites));
}

// Check if current design is in favorites
function isInFavorites(guid) {
    const favorites = loadFavorites();
    return favorites.some(fav => fav.guid === guid);
}

// Get current design state (including guid and title)
function getCurrentDesignState() {
    return {
        guid: appSettings.guid,
        title: appSettings.title,
        description: "",
        state: encodeState(appSettings)
    };
}

// Save current design to favorites
function saveToFavorites() {
    const favorites = loadFavorites();
    const current = getCurrentDesignState();
    
    // Determine if this is an update or new save
    const isUpdate = favorites.some(fav => fav.guid === current.guid);
    
    // Remove any existing favorite with the same guid
    const index = favorites.findIndex(fav => fav.guid === current.guid);
    if (index !== -1) {
        favorites.splice(index, 1);
    }
    
    // Add current design to favorites
    favorites.push(current);
    saveFavorites(favorites);
    
    // Update UI
    updateFavoriteButton(true, false);
    
    return isUpdate;
}

// Remove from favorites
function removeFromFavorites() {
    const favorites = loadFavorites();
    const guid = appSettings.guid;
    
    const index = favorites.findIndex(fav => fav.guid === guid);
    if (index !== -1) {
        favorites.splice(index, 1);
        saveFavorites(favorites);
    }
    
    // Update UI
    updateFavoriteButton(false, false);
}

// Update favorite button state
function updateFavoriteButton(isFavorite, isModified) {
    const starIcon = document.querySelector('.star-icon');
    
    starIcon.classList.remove('filled', 'modified');
    
    if (isFavorite) {
        starIcon.classList.add('filled');
        starIcon.textContent = '★';
        
        if (isModified) {
            starIcon.classList.add('modified');
            starIcon.parentElement.querySelector('.tooltip-text').textContent = 
                `Modified. (click to save to faves)`;
        } else {
            starIcon.parentElement.querySelector('.tooltip-text').textContent = 
                `Saved as "${appSettings.title}"`;
        }
    } else {
        starIcon.textContent = '☆';
        starIcon.parentElement.querySelector('.tooltip-text').textContent = 
            `Save to Favorites`;
    }
}

// Generate random unique title
function generateUniqueTitle() {
    const favorites = loadFavorites();
    let title;
    
    do {
        title = generateRandomName();
    } while (favorites.some(fav => fav.title === title));
    
    return title;
}

// Check if design is modified from saved favorite
function isDesignModified() {
    if (!isInFavorites(appSettings.guid)) return false;
    
    const favorites = loadFavorites();
    const favorite = favorites.find(fav => fav.guid === appSettings.guid);
    
    if (!favorite) return false;
    
    // Compare current state with saved state
    const currentState = encodeState(appSettings);
    return currentState !== favorite.state;
}

function initFavoritesFeature() {
    // If no guid exists, generate one
    if (!appSettings.guid) {
        appSettings.guid = generateUUID();
    }
    
    // If no title exists, generate one
    if (!appSettings.title) {
        appSettings.title = generateUniqueTitle();
    }
    
    // Set the title field
    document.getElementById('designTitle').value = appSettings.title;
    
    // Check if in favorites and update button
    const isFaved = isInFavorites(appSettings.guid);
    const isModified = isFaved ? isDesignModified() : false;
    updateFavoriteButton(isFaved, isModified);
    
    // Set up event handlers
    document.getElementById('favoriteButton').addEventListener('click', toggleFavorite);
    document.getElementById('randomizeTitle').addEventListener('click', randomizeTitle);
    document.getElementById('designTitle').addEventListener('input', handleTitleChange);
    document.getElementById('autofaveCheckbox').addEventListener('change', handleAutofaveChange);
    
    setupTitleFieldValidation();
}

function toggleFavorite(event) {
    if (isInFavorites(appSettings.guid)) {
        if (isDesignModified()) {
            // Modified state - save updates
            saveToFavorites();
            
            // Show toast confirmation
            showToast2(`Updated "${appSettings.title}" in favorites`, event.clientX, event.clientY);
        } else {
            // Already saved - remove from favorites
            removeFromFavorites();
            
            // Show toast confirmation
            showToast2(`Removed "${appSettings.title}" from favorites`, event.clientX, event.clientY);
        }
    } else {
        // Not in favorites - save
        saveToFavorites();
        
        // Show toast confirmation
        showToast2(`Saved "${appSettings.title}" to favorites`, event.clientX, event.clientY);
    }
}

function randomizeTitle(event) {
    const oldTitle = appSettings.title;
    appSettings.title = generateUniqueTitle();
    document.getElementById('designTitle').value = appSettings.title;
    saveSettings();
    
    // Show toast confirmation
    showToast2(`Title changed to "${appSettings.title}"`, event.clientX, event.clientY);
}

function handleTitleChange(event) {
    appSettings.title = event.target.value;
    saveSettings();
    
    // If autofave is on and in favorites, update the saved favorite
    if (document.getElementById('autofaveCheckbox').checked && isInFavorites(appSettings.guid)) {
        saveToFavorites();
        // No toast for autosave
    } else if (isInFavorites(appSettings.guid)) {
        // Mark as modified if in favorites
        updateFavoriteButton(true, true);
    }
}

function handleAutofaveChange(event) {
    if (event.target.checked) {
        // If turning on autofave, check if we need to save
        if (!isInFavorites(appSettings.guid)) {
            // Case 1: Not favorited yet - save it
            saveToFavorites();
            showToast2(`Saved "${appSettings.title}" to favorites`, event.clientX, event.clientY);
        } else if (isDesignModified()) {
            // Case 3: Favorited but dirty - save updates
            saveToFavorites();
            showToast2(`Updated "${appSettings.title}" in favorites`, event.clientX, event.clientY);
        } else {
            // Case 2: Favorited and clean - just enable autosave
            showToast2(`Autosave enabled`, event.clientX, event.clientY);
        }
    } else {
        // Disabled autosave, show toast
        showToast2(`Autosave disabled`, event.clientX, event.clientY);
    }
}

// Add this to your initialization code or favorites.js
function setupTitleFieldValidation() {
    const titleField = document.getElementById('designTitle');
    
    // Define allowed characters (alphanumeric, space, and some punctuation)
    const allowedChars = /^[a-zA-Z0-9 \-_:;.,?!()'"]+$/;
    
    // Add event listener for keypress
    titleField.addEventListener('keypress', function(e) {
        // Check if the pressed key is in our allowed set
        if (!allowedChars.test(e.key)) {
            // If not allowed, prevent the default action (adding the character)
            e.preventDefault();
        }
    });
    
    // Also handle paste events to filter invalid characters
    titleField.addEventListener('paste', function(e) {
        // Prevent default paste behavior
        e.preventDefault();
        
        // Get pasted text
        let pastedText = (e.clipboardData || window.clipboardData).getData('text');
        
        // Filter out invalid characters
        pastedText = pastedText.split('').filter(char => allowedChars.test(char)).join('');
        
        // Truncate to max length
        pastedText = pastedText.substring(0, 50 - this.value.length);
        
        // Insert at cursor position or append
        if (document.selection) {
            // For older browsers
            document.selection.createRange().text = pastedText;
        } else if (this.selectionStart || this.selectionStart === 0) {
            // For modern browsers
            const startPos = this.selectionStart;
            const endPos = this.selectionEnd;
            this.value = this.value.substring(0, startPos) + pastedText + this.value.substring(endPos);
            this.selectionStart = this.selectionEnd = startPos + pastedText.length;
        } else {
            // As fallback, just append
            this.value += pastedText;
        }
        
        // Trigger input event to update model
        this.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Handle initial value and blur events to clean up the field
    function cleanupTitle() {
        titleField.value = titleField.value
            .split('').filter(char => allowedChars.test(char)).join('')
            .substring(0, 50);
    }
    
    titleField.addEventListener('blur', cleanupTitle);
    
    // Call once to clean up any initial value
    cleanupTitle();
}
