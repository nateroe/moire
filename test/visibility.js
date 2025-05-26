// visibility.js - updated to handle both editor and gallery modes

class VisibilityManager {
    constructor(options = {}) {
        this.isPauseOnScroll = options.isPauseOnScroll || false;
        this.scrollThreshold = options.scrollThreshold || 0;
        this.tabHandlers = new Map(); // renderer -> handler function
        this.scrollHandlers = new Map(); // element -> renderer
        
        // Add state for global animation control
        this.globalAnimationActive = false;
       
        this.handleTabVisibilityChange = this.handleTabVisibilityChange.bind(this);
        this.checkAllVisibility  = this.checkAllVisibility .bind(this);
        
        this.init();
    }
    
	startAllAnimations() {
		this.globalAnimationActive = true;
		
		// Only start animations for visible canvases
		this.scrollHandlers.forEach((renderer, element) => {
			const rect = element.getBoundingClientRect();
			const isVisible = (
				rect.bottom >= 0 &&
				rect.top <= window.innerHeight &&
				rect.right >= 0 &&
				rect.left <= window.innerWidth
			);
			
			if (isVisible && !renderer.animationFrame) {
				renderer.startAnimation();
			}
		});
	}
    
    stopAllAnimations() {
        this.globalAnimationActive = false;
        
        // Stop animations for all registered renderers
        this.scrollHandlers.forEach((renderer) => {
            renderer.stopAnimation();
        });
    }
	
    init() {
        // Always handle tab visibility
        document.addEventListener('visibilitychange', this.handleTabVisibilityChange);
        
        // Only handle scroll visibility if enabled
        if (this.isPauseOnScroll) {
            // Use Intersection Observer for efficient scroll detection
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const renderer = this.scrollHandlers.get(entry.target);
                    if (renderer) {
                        if (entry.isIntersecting) {
        console.log(`[VisibilityManager] Pausing renderer for ${renderer.canvas.id}`);
							console.log("SHOW/RESUME (scroll) " + new Date().toLocaleTimeString());
							// Check if this renderer has never been rendered
							if (!renderer.hasRenderedOnce) {
								// This is the first time it's becoming visible
								// So do the initial render now
								renderer.render();
							}
                            // If global animation is active, ensure this renderer is animating
                            if (this.globalAnimationActive && !renderer.animationFrame) {
                                renderer.startAnimation();
                            } else {
                                renderer.resume();
                            }
                        } else {
        console.log(`[VisibilityManager] Resuming renderer for ${renderer.canvas.id}`);
							console.log("HIDE/PAUSE (scroll) " + new Date().toLocaleTimeString());
                            renderer.pause();
                        }
                    }
                });
            }, {
                threshold: 0,
                rootMargin: `${this.scrollThreshold}px`
            });
            
            // Also check on initial load and resize
            window.addEventListener('resize', this.checkAllVisibility.bind(this));
            window.addEventListener('load', this.checkAllVisibility.bind(this));
        }
    }
    
    // Register a renderer for tab visibility changes
    registerRenderer(renderer) {
        console.log(`[VisibilityManager] Registering renderer for ${renderer.canvas.id}`);
        this.tabHandlers.set(renderer, true);
    }
    
    // Register a canvas element for scroll visibility (gallery only)
    registerScrollElement(element, renderer) {
        if (this.isPauseOnScroll && this.observer) {
            this.scrollHandlers.set(element, renderer);
            this.observer.observe(element);
        }
    }
    
    // Handle tab visibility changes
    handleTabVisibilityChange() {
        if (document.hidden) {
            // Page is now hidden
            this.tabHandlers.forEach((_, renderer) => {
                renderer.pause();
            });
            console.log("HIDE/PAUSE " + new Date().toLocaleTimeString());
        } else {
            // Page is visible again
            this.tabHandlers.forEach((_, renderer) => {
                renderer.resume();
            });
            console.log("SHOW/RESUME " + new Date().toLocaleTimeString());
        }
    }
    
    // Check all registered elements for visibility
    checkAllVisibility() {
        this.scrollHandlers.forEach((renderer, element) => {
            const rect = element.getBoundingClientRect();
            const isVisible = (
                rect.bottom >= 0 &&
                rect.top <= window.innerHeight &&
                rect.right >= 0 &&
                rect.left <= window.innerWidth
            );
            
            if (isVisible) {
            console.log(`[VisibilityManager] Element ${element.id} now visible, resuming`);
                renderer.resume();
            } else {
            console.log(`[VisibilityManager] Element ${element.id} now hidden, pausing`);
                renderer.pause();
            }
        });
    }
    
    // Clean up resources
    dispose() {
        document.removeEventListener('visibilitychange', this.handleTabVisibilityChange);
        
        if (this.isPauseOnScroll && this.observer) {
            this.observer.disconnect();
            window.removeEventListener('resize', this.checkAllVisibility);
        }
        
        this.tabHandlers.clear();
        this.scrollHandlers.clear();
    }
}