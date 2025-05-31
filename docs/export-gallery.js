// export-gallery.js - Handles exporting favorites as an HTML gallery

/**
 * Converts the favorites array to the gallery data structure format
 * @param {Array} favorites - The user's favorites array
 * @returns {Array} - Gallery data structure with a single "Favorites" group
 */
function convertFavoritesToGalleryFormat(favorites) {
    // Create a single "Favorites" group containing all the user's favorites
    return [
        {
            groupTitle: "Favorites",
            patterns: favorites.map(favorite => ({
                title: favorite.title || "Untitled Pattern",
                description: favorite.description || "No description",
                state: favorite.state
            }))
        }
    ];
}

/**
 * Creates and downloads the HTML gallery file
 * @param {Array} favorites - The user's favorites array
 */
async function exportHtmlGallery(favorites) {
    try {
        // Convert favorites to gallery format
        const galleryData = convertFavoritesToGalleryFormat(favorites);
        
        // Format the JavaScript code for the patterns data
        const patternsCode = `const patterns = ${JSON.stringify(galleryData, null, 4)};`;
        
        // Load the template file
        const templateResponse = await fetch('favorites-gallery.tmpl');
        if (!templateResponse.ok) {
            throw new Error(`Failed to load template: ${templateResponse.status}`);
        }
        
        // Get the template content as text
        let templateContent = await templateResponse.text();
        
        // Get the base URL for absolute references
        const baseUrl = new URL('.', window.location.href).href;
        
        // Generate dependencies with absolute URLs
        const dependencies = `
    <link rel="stylesheet" href="${baseUrl}gallery.css">
    <script src="${baseUrl}moire-utils.js"></script>
    <script src="${baseUrl}visibility.js"></script>
    <script src="${baseUrl}names.js"></script>
    <script src="${baseUrl}state-encoder.js"></script>
    <script src="${baseUrl}state-encoder-legacy.js"></script>
    <script src="${baseUrl}shader-source.js"></script>
    <script src="${baseUrl}viewport-switching-manager.js"></script>
    <script src="${baseUrl}moire-renderer.js"></script>
`;
        
        // Replace the dependencies placeholder
        templateContent = templateContent.replace(
            '<!-- DEPENDENCIES_PLACEHOLDER -->', 
            dependencies
        );
        
        // Replace the patterns data placeholder
        templateContent = templateContent.replace(
            '<!-- PATTERNS_DATA_PLACEHOLDER -->', 
            `<script>\n        ${patternsCode}\n    </script>`
        );
        
        // Replace the base URL placeholder in navigation links
        templateContent = templateContent.replace(
            /<a href="index.html"/g, 
            `<a href="${baseUrl}index.html"`
        );
        
        templateContent = templateContent.replace(
            /<a href="favorites.html"/g, 
            `<a href="${baseUrl}favorites.html"`
        );
        
		// Replace the BASE_URL_PLACEHOLDER with a script setting the baseUrl global variable
		templateContent = templateContent.replace(
			'<!-- BASE_URL_PLACEHOLDER -->', 
			`<script>\n        const baseUrl = "${baseUrl}";\n    </script>`
		);
		
        // Create a Blob with the content
        const blob = new Blob([templateContent], { type: 'text/html' });
        
        // Create a download link and trigger it
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'favorites-gallery.html';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100);
        
        return true;
    } catch (error) {
        console.error('Error exporting HTML gallery:', error);
        alert('Failed to export HTML gallery: ' + error.message);
        return false;
    }
}

/**
 * Initializes the export gallery feature
 * Adds the event listener to the export HTML button
 */
function initExportGalleryFeature() {
    const exportHtmlButton = document.getElementById('exportHtmlButton');
    if (exportHtmlButton) {
        exportHtmlButton.addEventListener('click', function() {
            const favorites = loadFavorites();
            if (favorites.length === 0) {
                alert('You have no favorites to export.');
                return;
            }
            
            exportHtmlGallery(favorites)
                .then(success => {
                    if (success) {
                        showToast('HTML gallery exported successfully!');
                    }
                });
        });
    } else {
        console.error('Export HTML button not found');
    }
}
