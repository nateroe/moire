/**
 * ViewportSwitchingManager - Renders directly to multiple canvases by switching viewports
 * Alternative to WebGLManager's framebuffer approach
 */
class ViewportSwitchingManager {
    constructor() {
        // Create a hidden canvas for the shared WebGL context
        this.sharedCanvas = document.createElement('canvas');
        this.sharedCanvas.width = 1280;
        this.sharedCanvas.height = 720;
        this.sharedCanvas.style.display = 'none';
        document.body.appendChild(this.sharedCanvas);
        
        // Create WebGL context
        this.gl = this.sharedCanvas.getContext('webgl', { 
            premultipliedAlpha: false
        });
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        // Store registered canvases
        this.targetCanvases = new Map();
        
        // Initialize shared resources
        this.program = this.compileShaderProgram();
        this.createBuffers();
        this.initializeUniforms();
        
        console.log("ViewportSwitchingManager initialized");
    }
    
    /**
     * Compile shader program
     */
    compileShaderProgram() {
        const gl = this.gl;
        const program = gl.createProgram();
        
        // Compile vertex shader
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, MoireShaders.vertexShaderSource);
        gl.compileShader(vertexShader);
        
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error("Vertex shader compilation error:", gl.getShaderInfoLog(vertexShader));
            throw new Error("Failed to compile vertex shader");
        }
        
        // Compile fragment shader
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, MoireShaders.fragmentShaderSource);
        gl.compileShader(fragmentShader);
        
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error("Fragment shader compilation error:", gl.getShaderInfoLog(fragmentShader));
            throw new Error("Failed to compile fragment shader");
        }
        
        // Link program
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program linking error:", gl.getProgramInfoLog(program));
            throw new Error("Failed to link shader program");
        }
        
        return program;
    }
    
    /**
     * Create vertex buffers
     */
    createBuffers() {
        const gl = this.gl;
        
        // Create position buffer
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);
        
        // Set up attribute pointer
        const positionLocation = gl.getAttribLocation(this.program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }
    
    /**
     * Initialize uniform locations
     */
    initializeUniforms() {
        const gl = this.gl;
        
        this.uniforms = {
            resolution: gl.getUniformLocation(this.program, "resolution"),
            bgColor: gl.getUniformLocation(this.program, "bgColor"),
            lineThickness: gl.getUniformLocation(this.program, "lineThickness"),
            cellWidth: gl.getUniformLocation(this.program, "cellWidth"),
            cellHeight: gl.getUniformLocation(this.program, "cellHeight"),
            colors: gl.getUniformLocation(this.program, "colors"),
            gridCount: gl.getUniformLocation(this.program, "gridCount"),
            gridActive: gl.getUniformLocation(this.program, "gridActive"),
            rotation: gl.getUniformLocation(this.program, "rotation"),
            commonHue: gl.getUniformLocation(this.program, "commonHue"),
            commonSaturation: gl.getUniformLocation(this.program, "commonSaturation"),
            commonLightness: gl.getUniformLocation(this.program, "commonLightness"),
            gridType: gl.getUniformLocation(this.program, "gridType"),
            renderMode: gl.getUniformLocation(this.program, "renderMode"),
            renderStyle: gl.getUniformLocation(this.program, "renderStyle"),
            waveCount: gl.getUniformLocation(this.program, "waveCount"),
            waveActive: gl.getUniformLocation(this.program, "waveActive"),
            waveTypes: gl.getUniformLocation(this.program, "waveTypes"),
            waveAmplitudes: gl.getUniformLocation(this.program, "waveAmplitudes"),
            waveFrequencies: gl.getUniformLocation(this.program, "waveFrequencies"),
            wavePhases: gl.getUniformLocation(this.program, "wavePhases"),
            waveDirections: gl.getUniformLocation(this.program, "waveDirections"),
            waveOffsetType: gl.getUniformLocation(this.program, "waveOffsetType"),
            commonOffset: gl.getUniformLocation(this.program, "commonOffset"),
            phaseOffset: gl.getUniformLocation(this.program, "phaseOffset"),
            offsetVector: gl.getUniformLocation(this.program, "offsetVector")
        };
    }
    
    /**
     * Register a canvas as a render target
     */
    registerCanvas(canvasIdOrElement, width, height) {
        let canvas;
		if (typeof canvasIdOrElement === 'string') {
			canvas = document.getElementById(canvasIdOrElement);
			if (!canvas) {
				throw new Error(`Canvas with ID ${canvasIdOrElement} not found`);
			}
		} else {
			canvas = canvasIdOrElement;
		}
        
        // Set dimensions if provided
        if (width !== undefined && height !== undefined) {
            canvas.width = width;
            canvas.height = height;
        }
        
        // Store the canvas and its 2D context for direct drawing
		const canvasId = canvas.id || 'canvas_' + Math.floor(Math.random() * 10000);
		this.targetCanvases.set(canvasId, { canvas, ctx: canvas.getContext('2d') });
        
        return canvas;
    }
    
    /**
     * Render to a specific canvas
     */
	renderToCanvas(canvasId, settings) {
		const target = this.targetCanvases.get(canvasId);
		if (!target) {
			throw new Error(`Canvas ${canvasId} not registered`);
		}
		
		const { canvas, ctx } = target;
		const gl = this.gl;
		
		// Start timing
		const t0 = performance.now();
		
		// IMPORTANT: Resize the shared canvas to match the target canvas
		if (this.sharedCanvas.width !== canvas.width || this.sharedCanvas.height !== canvas.height) {
			this.sharedCanvas.width = canvas.width;
			this.sharedCanvas.height = canvas.height;
		}
		
		const t1 = performance.now();
		
		// Use our shader program
		gl.useProgram(this.program);
		
		// Re-bind position buffer
		const positionLocation = gl.getAttribLocation(this.program, "position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		
		const t2 = performance.now();
		
		// Set viewport to match target canvas
		gl.viewport(0, 0, canvas.width, canvas.height);
		
		// Set resolution uniform
		gl.uniform2f(this.uniforms.resolution, canvas.width, canvas.height);
		
		const t3 = performance.now();
		
		// Set all other uniforms
		this.setUniforms(settings);
		
		const t4 = performance.now();
		
		// Clear our shared canvas
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		const t5 = performance.now();
		
		// Draw to our shared canvas
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		
		const t6 = performance.now();
		
		// Copy from shared canvas to target canvas using 2D context
		ctx.drawImage(this.sharedCanvas, 0, 0, canvas.width, canvas.height);
		
		const t7 = performance.now();
	 
	/* 
		// Log timing breakdown for slow frames
		const totalTime = t7 - t0;
		if (totalTime > 10) { // Only log if frame took more than 10ms
			console.log(`[${canvasId}] renderToCanvas breakdown:
		resize canvas: ${(t1-t0).toFixed(1)}ms
		setup program: ${(t2-t1).toFixed(1)}ms
		viewport/resolution: ${(t3-t2).toFixed(1)}ms
		setUniforms: ${(t4-t3).toFixed(1)}ms
		clear: ${(t5-t4).toFixed(1)}ms
		drawArrays: ${(t6-t5).toFixed(1)}ms
		copyToCanvas: ${(t7-t6).toFixed(1)}ms
		TOTAL: ${totalTime.toFixed(1)}ms`);
		}
	*/
	}
    
    /**
     * Set uniforms (same as DirectCanvasManager)
     */
setUniforms(settings) {
    const gl = this.gl;
    const t0 = performance.now();
    
    // Background color
    const rgb = MoireUtils.Color.hexToRgb(settings.bgColor);
    gl.uniform3f(this.uniforms.bgColor, rgb.r / 255, rgb.g / 255, rgb.b / 255);
    
    // Global settings
    gl.uniform1i(this.uniforms.gridCount, settings.gridCount);
    gl.uniform1f(this.uniforms.rotation, settings.rotationOffset);
    gl.uniform1i(this.uniforms.gridType, parseInt(settings.gridType || "0"));
    gl.uniform1i(this.uniforms.renderMode, MoireUtils.Encoding.encodeRenderMode(settings.renderMode));
    
    const renderStyleValue = settings.renderStyle === "lines" ? 1 : 0;
    gl.uniform1i(this.uniforms.renderStyle, renderStyleValue);
    
    // Common HSV values
    gl.uniform1f(this.uniforms.commonHue, settings.commonHue || 0);
    gl.uniform1f(this.uniforms.commonSaturation, settings.commonSaturation || 0);
    gl.uniform1f(this.uniforms.commonLightness, settings.commonLightness || 0);
    
    // Wave settings
    gl.uniform1i(this.uniforms.waveCount, settings.waveCount);
    gl.uniform1i(this.uniforms.waveOffsetType, (settings.waveOffsetType === "phase") ? 0 : 1);
    gl.uniform1f(this.uniforms.commonOffset, settings.commonOffset || 0);
    gl.uniform1f(this.uniforms.phaseOffset, settings.phaseOffset);
    
    // Offset vector
    const angleRad = (settings.offsetAngle || 0) * (Math.PI / 180);
    const offsetX = (settings.offsetMagnitude || 10) * Math.cos(angleRad);
    const offsetY = (settings.offsetMagnitude || 10) * Math.sin(angleRad);
    gl.uniform2f(this.uniforms.offsetVector, offsetX, offsetY);
    
    const t1 = performance.now();
    
    // Grid parameters - potentially expensive due to array allocations
    let thicknesses = new Array(8).fill(0.0);
    let widths = new Array(8).fill(0.0);
    let heights = new Array(8).fill(0.0);
    let colorsArray = new Array(8 * 3).fill(0.0);
    let gridActiveFlags = new Int32Array(8);
    
    const commonThickness = settings.commonThickness !== undefined ? settings.commonThickness : 1.0;
    const scale = settings.scale !== undefined ? settings.scale : 1.0;
    
    for (let i = 0; i < settings.gridCount; i++) {
        const grid = settings.grids[i];
        thicknesses[i] = grid.thickness * commonThickness;
        widths[i] = grid.width * scale;
        heights[i] = grid.height * scale;
        
        let color = MoireUtils.Color.hexToRgb(grid.color);
        colorsArray[i * 3] = color.r / 255.0;
        colorsArray[i * 3 + 1] = color.g / 255.0;
        colorsArray[i * 3 + 2] = color.b / 255.0;
        gridActiveFlags[i] = grid.isActive !== false ? 1 : 0;
    }
    
    const t2 = performance.now();
    
    gl.uniform1fv(this.uniforms.lineThickness, new Float32Array(thicknesses));
    gl.uniform1fv(this.uniforms.cellWidth, new Float32Array(widths));
    gl.uniform1fv(this.uniforms.cellHeight, new Float32Array(heights));
    gl.uniform3fv(this.uniforms.colors, new Float32Array(colorsArray));
    gl.uniform1iv(this.uniforms.gridActive, gridActiveFlags);
    
    const t3 = performance.now();
    
    // Wave parameters - potentially expensive due to more array allocations
    let waveTypes = new Int32Array(15);
    let amplitudes = new Float32Array(15);
    let frequencies = new Float32Array(15);
    let phases = new Float32Array(15);
    let directions = new Float32Array(15 * 2);
    let waveActiveFlags = new Int32Array(15);
    
    const commonAmpFactor = settings.commonAmpFactor !== undefined ? settings.commonAmpFactor : 1.0;
    const commonFreqFactor = settings.commonFreqFactor !== undefined ? settings.commonFreqFactor : 1.0;
    const commonDirectionOffset = settings.commonDirectionOffset || 0;
    
    for (let i = 0; i < settings.waveCount; i++) {
        const wave = settings.waves[i];
        waveTypes[i] = MoireUtils.Encoding.encodeWaveType(wave.type);
        
        amplitudes[i] = wave.amplitude * commonAmpFactor;
        
        let adjustedFrequency = wave.frequency * commonFreqFactor;
        frequencies[i] = adjustedFrequency * (0.0001 * 2.0 * Math.PI);
        
        phases[i] = wave.phase;
        
        const effectiveAngle = (wave.directionAngle || 0) + commonDirectionOffset;
        const rad = effectiveAngle * (Math.PI / 180);
        
        directions[i * 2] = Math.cos(rad);
        directions[i * 2 + 1] = Math.sin(rad);
        waveActiveFlags[i] = wave.isActive !== false ? 1 : 0;
    }
    
    const t4 = performance.now();
    
    gl.uniform1iv(this.uniforms.waveTypes, waveTypes);
    gl.uniform1fv(this.uniforms.waveAmplitudes, amplitudes);
    gl.uniform1fv(this.uniforms.waveFrequencies, frequencies);
    gl.uniform1fv(this.uniforms.wavePhases, phases);
    gl.uniform2fv(this.uniforms.waveDirections, directions);
    gl.uniform1iv(this.uniforms.waveActive, waveActiveFlags);
    
    const t5 = performance.now();
    
	/*
    // Log timing if it took more than 2ms
    const totalTime = t5 - t0;
    if (totalTime > 2) {
        console.log(`[setUniforms] breakdown:
    simple uniforms: ${(t1-t0).toFixed(1)}ms
    grid arrays prep: ${(t2-t1).toFixed(1)}ms
    grid uniforms: ${(t3-t2).toFixed(1)}ms
    wave arrays prep: ${(t4-t3).toFixed(1)}ms
    wave uniforms: ${(t5-t4).toFixed(1)}ms
    TOTAL: ${totalTime.toFixed(1)}ms`);
    }
	*/
}
    
    /**
     * Clean up resources
     */
    dispose() {
        if (this.gl) {
            this.gl.deleteProgram(this.program);
            this.gl.deleteBuffer(this.positionBuffer);
        }
        
        if (this.sharedCanvas && this.sharedCanvas.parentNode) {
            this.sharedCanvas.parentNode.removeChild(this.sharedCanvas);
        }
        
        this.targetCanvases.clear();
    }
}