/**
 * Decodes version 1 binary format
 * @param {DataView} view - The DataView containing the binary data
 * @param {Number} offset - The current offset in the view
 * @return {Object} Reconstructed application state
 */
function decodeStateV1(view, offset) {
    try {
        // Step 4: Decode the global section
        let globalResult, animResult, keyframesResult;
        [globalResult, offset] = decodeGlobalSection(view, offset);
        
        // Step 5: Decode animation section
        [animResult, offset] = decodeAnimSection(view, offset);
        
        // Step 6: Decode keyframes
        [keyframesResult, offset] = decodeKeyframesV1(view, offset, globalResult.gridCount, globalResult.waveCount);
        
        // Step 7: Decode active keyframe
        const activeKeyframeByte = view.getUint8(offset);
        const activeKeyframe = decodeKeyframeName(activeKeyframeByte);
        
        // Step 8: Construct final state object
        return {
            ...globalResult,
            animSettings: animResult,
            keyframes: keyframesResult,
            activeKeyframe
        };
    } catch (error) {
        // If anything fails, throw an error that will be caught at a higher level
        throw new Error(`Failed to decode state: ${error.message}`);
    }
}

/**
 * Decodes version 2 binary format
 * @param {DataView} view - The DataView containing the binary data
 * @param {Number} offset - The current offset in the view
 * @return {Object} Reconstructed application state
 */
function decodeStateV2(view, offset) {
    try {
        // Decode the global section
        let globalResult, animResult, keyframesResult;
        [globalResult, offset] = decodeGlobalSection(view, offset);
        
        // Decode animation section
        [animResult, offset] = decodeAnimSection(view, offset);
        
        // Decode keyframes with V2 structure
        [keyframesResult, offset] = decodeKeyframesV2(view, offset, globalResult.gridCount, globalResult.waveCount);
        
        // Decode active keyframe
        const activeKeyframeByte = view.getUint8(offset);
        const activeKeyframe = decodeKeyframeName(activeKeyframeByte);
        
        // Construct final state object
        return {
            ...globalResult,
            animSettings: animResult,
            keyframes: keyframesResult,
            activeKeyframe
        };
    } catch (error) {
        // If anything fails, throw an error that will be caught at a higher level
        throw new Error(`Failed to decode V2 state: ${error.message}`);
    }
}

/**
 * Decodes version 3 binary format
 * @param {DataView} view - The DataView containing the binary data
 * @param {Number} offset - The current offset in the view
 * @return {Object} Reconstructed application state
 */
function decodeStateV3(view, offset) {
    try {
        // Decode the global section
        let globalResult, animResult, keyframesResult;
        [globalResult, offset] = decodeGlobalSection(view, offset);
        
        // Decode animation section
        [animResult, offset] = decodeAnimSection(view, offset);
        
        // Decode keyframes with V3 structure
        [keyframesResult, offset] = decodeKeyframesV3(view, offset, globalResult.gridCount, globalResult.waveCount);
        
        // Decode active keyframe
        const activeKeyframeByte = view.getUint8(offset);
        const activeKeyframe = decodeKeyframeName(activeKeyframeByte);
        
        // Construct final state object
        return {
            ...globalResult,
            animSettings: animResult,
            keyframes: keyframesResult,
            activeKeyframe
        };
    } catch (error) {
        // If anything fails, throw an error that will be caught at a higher level
        throw new Error(`Failed to decode V3 state: ${error.message}`);
    }
}

/**
 * Decodes version 4 binary format with angle-based direction
 * @param {DataView} view - The DataView containing the binary data
 * @param {Number} offset - The current offset in the view
 * @return {Object} Reconstructed application state
 */
function decodeStateV4(view, offset) {
    try {
        // Decode the global section
        let globalResult, animResult, keyframesResult;
        [globalResult, offset] = decodeGlobalSection(view, offset);
        
        // Decode animation section
        [animResult, offset] = decodeAnimSection(view, offset);
        
        // Decode keyframes with V4 structure
        [keyframesResult, offset] = decodeKeyframesV4(view, offset, globalResult.gridCount, globalResult.waveCount);
        
        // Decode active keyframe
        const activeKeyframeByte = view.getUint8(offset);
        const activeKeyframe = decodeKeyframeName(activeKeyframeByte);
        
        // Construct final state object
        return {
            ...globalResult,
            animSettings: animResult,
            keyframes: keyframesResult,
            activeKeyframe
        };
    } catch (error) {
        // If anything fails, throw an error that will be caught at a higher level
        throw new Error(`Failed to decode V4 state: ${error.message}`);
    }
}

/**
 * decoder function for V5 format (includes renderStyle)
 */
function decodeStateV5(view, offset) {
    try {
        // Decode the global section
        let globalResult, animResult, keyframesResult;
        [globalResult, offset] = decodeGlobalSectionV5(view, offset);
        
        // Decode animation section
        [animResult, offset] = decodeAnimSection(view, offset);
        
        // Decode keyframes with V4 structure
        [keyframesResult, offset] = decodeKeyframesV4(view, offset, globalResult.gridCount, globalResult.waveCount);
        
        // Decode active keyframe
        const activeKeyframeByte = view.getUint8(offset);
        const activeKeyframe = decodeKeyframeName(activeKeyframeByte);
        
        // Construct final state object
        return {
            ...globalResult,
            animSettings: animResult,
            keyframes: keyframesResult,
            activeKeyframe
        };
    } catch (error) {
        // If anything fails, throw an error that will be caught at a higher level
        throw new Error(`Failed to decode V5 state: ${error.message}`);
    }
}


/**
 * Decode global section (same for all versions)
 */
function decodeGlobalSection(view, offset) {
	const global = {};
	
	// gridCount as byte
	global.gridCount = view.getUint8(offset);
	if (global.gridCount < 1 || global.gridCount > 8) {
		throw new Error(`Invalid gridCount: ${global.gridCount}`);
	}
	offset += 1;
	
	// waveCount as byte
	global.waveCount = view.getUint8(offset);
	if (global.waveCount > 15) {
		throw new Error(`Invalid waveCount: ${global.waveCount}`);
	}
	offset += 1;
	
	// gridType as byte
	global.gridType = String(view.getUint8(offset));
	offset += 1;
	
	// renderMode as enum (byte)
	global.renderMode = decodeRenderMode(view.getUint8(offset));
	offset += 1;
	
	// waveOffsetType as enum (byte)
	global.waveOffsetType = decodeWaveOffsetType(view.getUint8(offset));
	offset += 1;
	
	return [global, offset];
}

/**
 * Decoder function for global section with renderStyle
 */
function decodeGlobalSectionV5(view, offset) {
	const global = {};
	
	// gridCount as byte
	global.gridCount = view.getUint8(offset);
	if (global.gridCount < 1 || global.gridCount > 8) {
		throw new Error(`Invalid gridCount: ${global.gridCount}`);
	}
	offset += 1;
	
	// waveCount as byte
	global.waveCount = view.getUint8(offset);
	if (global.waveCount > 15) {
		throw new Error(`Invalid waveCount: ${global.waveCount}`);
	}
	offset += 1;
	
	// gridType as byte
	global.gridType = String(view.getUint8(offset));
	offset += 1;
	
	// renderMode as enum (byte)
	global.renderMode = decodeRenderMode(view.getUint8(offset));
	offset += 1;
	
	// NEW: renderStyle as enum (byte)
	global.renderStyle = decodeRenderStyle(view.getUint8(offset));
	offset += 1;
	
	// waveOffsetType as enum (byte)
	global.waveOffsetType = decodeWaveOffsetType(view.getUint8(offset));
	offset += 1;
	
	return [global, offset];
}



/**
 * Decode keyframes section for V1 format
 */
function decodeKeyframesV1(view, offset, gridCount, waveCount) {
	const keyframeCount = view.getUint8(offset);
	if (keyframeCount > 2) {
		throw new Error(`Invalid keyframe count: ${keyframeCount}`);
	}
	
	offset += 1;
	
	const keyframes = {};
	
	for (let i = 0; i < keyframeCount; i++) {
		// Get keyframe name
		const keyframeByte = view.getUint8(offset);
		const keyframeName = decodeKeyframeName(keyframeByte);
		offset += 1;
		
		// Decode keyframe data
		const keyframe = {};
		
		// bgColor as 3 bytes (RGB)
		const r = view.getUint8(offset);
		const g = view.getUint8(offset + 1);
		const b = view.getUint8(offset + 2);
		keyframe.bgColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		offset += 3;
		
		// rotationOffset as 16-bit float
		keyframe.rotationOffset = view.getInt16(offset) / 100.0;
		offset += 2;
		
		// commonHue as 16-bit integer
		keyframe.commonHue = view.getInt16(offset);
		offset += 2;
		
		// Decode commonThickness
		keyframe.commonThickness = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode scale 
		keyframe.scale = view.getUint16(offset) / 100.0;
		offset += 2;
		
		// Decode commonAmpFactor
		keyframe.commonAmpFactor = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode commonFreqFactor
		keyframe.commonFreqFactor = view.getInt16(offset) / 100.0;
		offset += 2;		
		
		// commonOffset and phaseOffset
		keyframe.commonOffset = view.getInt16(offset) / 100.0;
		offset += 2;
		
		keyframe.phaseOffset = view.getInt16(offset) / 100.0;
		offset += 2;
		
		// offsetAngle and offsetMagnitude
		keyframe.offsetAngle = view.getUint8(offset);
		offset += 1;
		
		keyframe.offsetMagnitude = view.getUint8(offset);
		offset += 1;
		
		// Decode grids for V1
		let grids = [];
		[grids, offset] = decodeGridsV1(view, offset, gridCount);
		keyframe.grids = grids;
		
		// Decode waves for V1
		let waves = [];
		[waves, offset] = decodeWavesV1(view, offset, waveCount);
		keyframe.waves = waves;
		
		// Add keyframe to collection
		keyframes[keyframeName.toLowerCase()] = keyframe;
	}
	
	return [keyframes, offset];
}


/**
 * Decode the legacy state format (JSON-based)
 * @param {String} stateParam - The URL-encoded state parameter
 * @return {Object} Reconstructed application state
 */
function decodeLegacyState(stateParam) {
    try {
        // Remove the "state=" prefix if present
        let jsonStr = stateParam;
        if (jsonStr.startsWith("state=")) {
            jsonStr = jsonStr.substring(6);
        }
        
        // Decode the URI components
        jsonStr = decodeURIComponent(jsonStr);
        
        // Parse JSON
        const legacyState = JSON.parse(jsonStr);
        
        // Create result based on defaults
        const result = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS));
        
        // Map global settings
        if (legacyState.global) {
            result.gridType = legacyState.global.gridType || "0";
            result.renderMode = legacyState.global.renderMode || "additive";
            result.waveOffsetType = legacyState.global.waveOffsetType || "phase";
        }
        
        // Map keyframes
        if (legacyState.keyframes) {
            result.keyframes = { k1: {}, k2: {} };
            
            // Handle K1
            if (legacyState.keyframes.K1) {
                const k1 = legacyState.keyframes.K1;
                result.keyframes.k1.bgColor = k1.bgColor || "#000000";
                result.keyframes.k1.rotationOffset = k1.rotationOffset || 0;
                result.keyframes.k1.phaseOffset = k1.phaseOffset || 0;
                result.keyframes.k1.offsetAngle = k1.offsetAngle || 0;
                result.keyframes.k1.offsetMagnitude = k1.offsetMagnitude || 10;
                result.keyframes.k1.commonHue = 0; // Default
                result.keyframes.k1.commonOffset = 0; // Default
                
                // Copy grids and waves if available
                if (Array.isArray(k1.grids)) result.keyframes.k1.grids = k1.grids;
                if (Array.isArray(k1.waves)) {
                    // Convert waves to angle-based format if needed
                    for (let i = 0; i < k1.waves.length; i++) {
                        const wave = k1.waves[i];
                        if (wave.directionAngle === undefined && wave.directionX !== undefined && wave.directionY !== undefined) {
                            wave.directionAngle = Math.atan2(wave.directionY, wave.directionX) * 180 / Math.PI;
                        }
                    }
                    result.keyframes.k1.waves = k1.waves;
                }
            }
            
            // Handle K2
            if (legacyState.keyframes.K2) {
                const k2 = legacyState.keyframes.K2;
                result.keyframes.k2.bgColor = k2.bgColor || "#000000";
                result.keyframes.k2.rotationOffset = k2.rotationOffset || 0;
                result.keyframes.k2.phaseOffset = k2.phaseOffset || 0;
                result.keyframes.k2.offsetAngle = k2.offsetAngle || 0;
                result.keyframes.k2.offsetMagnitude = k2.offsetMagnitude || 10;
                result.keyframes.k2.commonHue = 0; // Default
                result.keyframes.k2.commonOffset = 0; // Default
                
                // Copy grids and waves if available
                if (Array.isArray(k2.grids)) result.keyframes.k2.grids = k2.grids;
                if (Array.isArray(k2.waves)) {
                    // Convert waves to angle-based format if needed
                    for (let i = 0; i < k2.waves.length; i++) {
                        const wave = k2.waves[i];
                        if (wave.directionAngle === undefined && wave.directionX !== undefined && wave.directionY !== undefined) {
                            wave.directionAngle = Math.atan2(wave.directionY, wave.directionX) * 180 / Math.PI;
                        }
                    }
                    result.keyframes.k2.waves = k2.waves;
                }
            }
        }
        
        // Map grid and wave counts
        if (legacyState.ui) {
            result.gridCount = legacyState.ui.gridCount || 2;
            result.waveCount = legacyState.ui.waveCount || 0;
        }
        
        // Map animation settings
        if (legacyState.anim) {
            result.animSettings = {
                duration: legacyState.anim.duration || "2.0",
                mode: legacyState.anim.mode || "upAndDown",
                autoplay: false
            };
        }
        
        // Map active keyframe
        result.activeKeyframe = legacyState.activeKeyframe ? 
            legacyState.activeKeyframe.toLowerCase() : 'k1';
        
        return result;
    } catch (error) {
        console.error("Error parsing legacy state:", error);
        throw new Error("Failed to parse legacy state format");
    }
}

/**
 * Decode grids array for V1 format
 */
function decodeGridsV1(view, offset, gridCount) {
	const encodedGridCount = view.getUint8(offset);
	offset += 1;
	
	if (encodedGridCount > 8) {
		throw new Error(`Invalid grid count: ${encodedGridCount}`);
	}
	
    const grids = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.grids));
	
	for (let i = 0; i < encodedGridCount; i++) {
		// thickness as fixed-point (8-bit)
        grids[i].thickness = view.getUint8(offset) / 100;
        offset += 1;
        
        // width & height as 8-bit values in V1
        grids[i].width = view.getUint8(offset);
        offset += 1;
        
        grids[i].height = view.getUint8(offset);
        offset += 1;
        
        // color as 3 bytes (RGB)
        const r = view.getUint8(offset);
        const g = view.getUint8(offset + 1);
        const b = view.getUint8(offset + 2);
        grids[i].color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        offset += 3;
	}
	
	return [grids, offset];
}

/**
 * Decode grids array for V2 format
 */
function decodeGridsV2(view, offset, gridCount) {
	const encodedGridCount = view.getUint8(offset);
	offset += 1;
	
	if (encodedGridCount > 8) {
		throw new Error(`Invalid grid count: ${encodedGridCount}`);
	}
	
    const grids = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.grids));
	
	for (let i = 0; i < encodedGridCount; i++) {
		// thickness as fixed-point (8-bit) - same as V1
        grids[i].thickness = view.getUint8(offset) / 100;
        offset += 1;
        
        // V2: width & height as 16-bit values
        grids[i].width = view.getUint16(offset);
        offset += 2;
        
        grids[i].height = view.getUint16(offset);
        offset += 2;
        
        // color as 3 bytes (RGB) - same as V1
        const r = view.getUint8(offset);
        const g = view.getUint8(offset + 1);
        const b = view.getUint8(offset + 2);
        grids[i].color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        offset += 3;
	}
	
	return [grids, offset];
}

/**
 * Decode waves array for V1 format - updated to convert to angle-based format
 */
function decodeWavesV1(view, offset, waveCount) {
    const encodedWaveCount = view.getUint8(offset);
    offset += 1;
    
    if (encodedWaveCount > 15) {
        throw new Error(`Invalid wave count: ${encodedWaveCount}`);
    }
    
    // Create array with default values for all possible waves
    const waves = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.waves));
    
    // Replace defaults with encoded values for active waves
    for (let i = 0; i < encodedWaveCount; i++) {
        // type as enum (byte)
        waves[i].type = decodeWaveType(view.getUint8(offset));
        offset += 1;
        
        // amplitude as 16-bit value
        waves[i].amplitude = view.getUint16(offset) / 10;
        offset += 2;
        
        // frequency as 16-bit value
        waves[i].frequency = view.getUint16(offset) / 1000;
        offset += 2;
        
        // phase as 16-bit value (signed)
        waves[i].phase = view.getInt16(offset);
        offset += 2;
        
        // Read directionX as 8-bit signed
        const dirX = view.getInt8(offset) / 127;
        offset += 1;
        
        // Read directionY as 8-bit signed
        const dirY = view.getInt8(offset) / 127;
        offset += 1;
        
        // Convert vector components to angle for v4 compatibility
        waves[i].directionAngle = Math.atan2(dirY, dirX) * 180 / Math.PI;
    }
    
    return [waves, offset];
}

/**
 * Decode waves array for V2 format - updated to convert to angle-based format
 */
function decodeWavesV2(view, offset, waveCount) {
    const encodedWaveCount = view.getUint8(offset);
    offset += 1;
    
    if (encodedWaveCount > 15) {
        throw new Error(`Invalid wave count: ${encodedWaveCount}`);
    }
    
    // Create array with default values for all possible waves
    const waves = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.waves));
    
    // Replace defaults with encoded values for active waves
    for (let i = 0; i < encodedWaveCount; i++) {
        // type as enum (byte) - same as V1
        waves[i].type = decodeWaveType(view.getUint8(offset));
        offset += 1;
        
        // amplitude as 16-bit value - same as V1
        waves[i].amplitude = view.getUint16(offset) / 10;
        offset += 2;
        
        // frequency as 16-bit value - same as V1
        waves[i].frequency = view.getUint16(offset) / 1000;
        offset += 2;
        
        // V2: phase as 32-bit value (signed)
        waves[i].phase = view.getInt32(offset);
        offset += 4;
        
        // V2: directionX as 16-bit signed with higher precision
        const dirX = view.getInt16(offset) / 10000;
        offset += 2;
        
        // V2: directionY as 16-bit signed with higher precision
        const dirY = view.getInt16(offset) / 10000;
        offset += 2;
        
        // Convert vector components to angle for v4 compatibility
        waves[i].directionAngle = Math.atan2(dirY, dirX) * 180 / Math.PI;
    }
    
    return [waves, offset];
}

/**
 * Decode waves array for V3 format - updated to convert to angle-based format
 */
function decodeWavesV3(view, offset, waveCount) {
    const encodedWaveCount = view.getUint8(offset);
    offset += 1;
    
    if (encodedWaveCount > 15) {
        throw new Error(`Invalid wave count: ${encodedWaveCount}`);
    }
    
    // Create array with default values for all possible waves
    const waves = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.waves));
    
    // Replace defaults with encoded values for active waves
    for (let i = 0; i < encodedWaveCount; i++) {
        // type as enum (byte)
        waves[i].type = decodeWaveType(view.getUint8(offset));
        offset += 1;
        
        // amplitude as 16-bit value
        waves[i].amplitude = view.getUint16(offset) / 10;
        offset += 2;
        
        // frequency as 16-bit value
        waves[i].frequency = view.getUint16(offset) / 1000;
        offset += 2;
        
        // phase as 32-bit value (signed)
        waves[i].phase = view.getInt32(offset);
        offset += 4;
        
        // V2: directionX as 16-bit signed with higher precision
        const dirX = view.getInt16(offset) / 10000;
        offset += 2;
        
        // V2: directionY as 16-bit signed with higher precision
        const dirY = view.getInt16(offset) / 10000;
        offset += 2;
        
        // Convert vector components to angle for v4 compatibility
        waves[i].directionAngle = Math.atan2(dirY, dirX) * 180 / Math.PI;
    }
    
    return [waves, offset];
}

/**
 * Decode waves array for V4 format with angle-based direction
 * This is the main change for V4 - directly reading the angle without vector components
 */
function decodeWavesV4(view, offset, waveCount) {
    const encodedWaveCount = view.getUint8(offset);
    offset += 1;
    
    if (encodedWaveCount > 15) {
        throw new Error(`Invalid wave count: ${encodedWaveCount}`);
    }
    
    // Create array with default values for all possible waves
    const waves = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.waves));
    
    // Replace defaults with encoded values for active waves
    for (let i = 0; i < encodedWaveCount; i++) {
        // type as enum (byte)
        waves[i].type = decodeWaveType(view.getUint8(offset));
        offset += 1;
        
        // amplitude as 16-bit value
        waves[i].amplitude = view.getUint16(offset) / 10;
        offset += 2;
        
        // frequency as 16-bit value
        waves[i].frequency = view.getUint16(offset) / 1000;
        offset += 2;
        
        // phase as 32-bit value (signed)
        waves[i].phase = view.getInt32(offset);
        offset += 4;
        
        // Direction angle as 32-bit signed integer - core change for V4
        waves[i].directionAngle = view.getInt32(offset);
        offset += 4;
    }
    
    return [waves, offset];
}

/**
 * Decode keyframes section for V4 format
 */
function decodeKeyframesV4(view, offset, gridCount, waveCount) {
	const keyframeCount = view.getUint8(offset);
	if (keyframeCount > 2) {
		throw new Error(`Invalid keyframe count: ${keyframeCount}`);
	}
	
	offset += 1;
	
	const keyframes = {};
	
	for (let i = 0; i < keyframeCount; i++) {
		// Get keyframe name
		const keyframeByte = view.getUint8(offset);
		const keyframeName = decodeKeyframeName(keyframeByte);
		offset += 1;
		
		// Decode keyframe data
		const keyframe = {};
		
		// bgColor as 3 bytes (RGB)
		const r = view.getUint8(offset);
		const g = view.getUint8(offset + 1);
		const b = view.getUint8(offset + 2);
		keyframe.bgColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		offset += 3;
		
		// rotationOffset as 32-bit float
		keyframe.rotationOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// commonHue as 32-bit integer
		keyframe.commonHue = view.getInt32(offset);
		offset += 4;
		
		// commonSaturation as 16-bit integer
		keyframe.commonSaturation = view.getInt16(offset);
		offset += 2;
		
		// commonLightness as 16-bit integer
		keyframe.commonLightness = view.getInt16(offset);
		offset += 2;
		
		// Decode commonThickness
		keyframe.commonThickness = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode scale 
		keyframe.scale = view.getUint16(offset) / 100.0;
		offset += 2;
		
		// Decode commonAmpFactor
		keyframe.commonAmpFactor = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode commonFreqFactor
		keyframe.commonFreqFactor = view.getInt16(offset) / 100.0;
		offset += 2;		
		
		// commonOffset as 32-bit float
		keyframe.commonOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// commonDirectionOffset as 32-bit integer
		keyframe.commonDirectionOffset = view.getInt32(offset);
		offset += 4;
		
		// phaseOffset as 32-bit float
		keyframe.phaseOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// offsetAngle as 16-bit integer
		keyframe.offsetAngle = view.getUint16(offset);
		offset += 2;
		
		// offsetMagnitude as byte
		keyframe.offsetMagnitude = view.getUint8(offset);
		offset += 1;
		
		// Decode grids
		let grids = [];
		[grids, offset] = decodeGridsV2(view, offset, gridCount);
		keyframe.grids = grids;
		
		// Decode waves - using V4 format with direct angle storage
		let waves = [];
		[waves, offset] = decodeWavesV4(view, offset, waveCount);
		keyframe.waves = waves;
		
		// Add keyframe to collection
		keyframes[keyframeName.toLowerCase()] = keyframe;
	}
	
	return [keyframes, offset];
}

/**
 * Decode keyframes section for V2 format
 */
function decodeKeyframesV2(view, offset, gridCount, waveCount) {
	const keyframeCount = view.getUint8(offset);
	if (keyframeCount > 2) {
		throw new Error(`Invalid keyframe count: ${keyframeCount}`);
	}
	
	offset += 1;
	
	const keyframes = {};
	
	for (let i = 0; i < keyframeCount; i++) {
		// Get keyframe name
		const keyframeByte = view.getUint8(offset);
		const keyframeName = decodeKeyframeName(keyframeByte);
		offset += 1;
		
		// Decode keyframe data
		const keyframe = {};
		
		// bgColor as 3 bytes (RGB)
		const r = view.getUint8(offset);
		const g = view.getUint8(offset + 1);
		const b = view.getUint8(offset + 2);
		keyframe.bgColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		offset += 3;
		
		// V2: rotationOffset as 32-bit float
		keyframe.rotationOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// V2: commonHue as 32-bit integer
		keyframe.commonHue = view.getInt32(offset);
		offset += 4;
		
		// Decode commonThickness (same as V1)
		keyframe.commonThickness = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode scale (same as V1)
		keyframe.scale = view.getUint16(offset) / 100.0;
		offset += 2;
		
		// Decode commonAmpFactor (same as V1)
		keyframe.commonAmpFactor = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode commonFreqFactor (same as V1)
		keyframe.commonFreqFactor = view.getInt16(offset) / 100.0;
		offset += 2;		
		
		// V2: commonOffset as 32-bit float
		keyframe.commonOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// V2: commonDirectionOffset as 32-bit integer
		keyframe.commonDirectionOffset = view.getInt32(offset);
		offset += 4;
		
		// V2: phaseOffset as 32-bit float
		keyframe.phaseOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// V2: offsetAngle as 16-bit integer
		keyframe.offsetAngle = view.getUint16(offset);
		offset += 2;
		
		// offsetMagnitude as byte (same as V1)
		keyframe.offsetMagnitude = view.getUint8(offset);
		offset += 1;
		
		// Decode grids for V2
		let grids = [];
		[grids, offset] = decodeGridsV2(view, offset, gridCount);
		keyframe.grids = grids;
		
		// Decode waves for V2
		let waves = [];
		[waves, offset] = decodeWavesV2(view, offset, waveCount);
		keyframe.waves = waves;
		
		// Add keyframe to collection
		keyframes[keyframeName.toLowerCase()] = keyframe;
	}
	
	return [keyframes, offset];
}

/**
 * Decode keyframes section for V3 format
 */
function decodeKeyframesV3(view, offset, gridCount, waveCount) {
	const keyframeCount = view.getUint8(offset);
	if (keyframeCount > 2) {
		throw new Error(`Invalid keyframe count: ${keyframeCount}`);
	}
	
	offset += 1;
	
	const keyframes = {};
	
	for (let i = 0; i < keyframeCount; i++) {
		// Get keyframe name
		const keyframeByte = view.getUint8(offset);
		const keyframeName = decodeKeyframeName(keyframeByte);
		offset += 1;
		
		// Decode keyframe data
		const keyframe = {};
		
		// bgColor as 3 bytes (RGB)
		const r = view.getUint8(offset);
		const g = view.getUint8(offset + 1);
		const b = view.getUint8(offset + 2);
		keyframe.bgColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		offset += 3;
		
		// rotationOffset as 32-bit float
		keyframe.rotationOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// commonHue as 32-bit integer
		keyframe.commonHue = view.getInt32(offset);
		offset += 4;
		
		// NEW in V3: commonSaturation as 16-bit integer
		keyframe.commonSaturation = view.getInt16(offset);
		offset += 2;
		
		// NEW in V3: commonLightness as 16-bit integer
		keyframe.commonLightness = view.getInt16(offset);
		offset += 2;
		
		// Decode commonThickness
		keyframe.commonThickness = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode scale 
		keyframe.scale = view.getUint16(offset) / 100.0;
		offset += 2;
		
		// Decode commonAmpFactor
		keyframe.commonAmpFactor = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode commonFreqFactor
		keyframe.commonFreqFactor = view.getInt16(offset) / 100.0;
		offset += 2;		
		
		// commonOffset as 32-bit float
		keyframe.commonOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// commonDirectionOffset as 32-bit integer
		keyframe.commonDirectionOffset = view.getInt32(offset);
		offset += 4;
		
		// phaseOffset as 32-bit float
		keyframe.phaseOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// offsetAngle as 16-bit integer
		keyframe.offsetAngle = view.getUint16(offset);
		offset += 2;
		
		// offsetMagnitude as byte
		keyframe.offsetMagnitude = view.getUint8(offset);
		offset += 1;
		
		// Decode grids
		let grids = [];
		[grids, offset] = decodeGridsV2(view, offset, gridCount);
		keyframe.grids = grids;
		
		// Decode waves
		let waves = [];
		[waves, offset] = decodeWavesV3(view, offset, waveCount);
		keyframe.waves = waves;
		
		// Add keyframe to collection
		keyframes[keyframeName.toLowerCase()] = keyframe;
	}
	
	return [keyframes, offset];
}


/**
 * Decodes version 6 binary format with isActive flags
 * @param {DataView} view - The DataView containing the binary data
 * @param {Number} offset - The current offset in the view
 * @return {Object} Reconstructed application state
 */
function decodeStateV6(view, offset) {
    try {
        // Decode the global section
        let globalResult, animResult, keyframesResult;
        [globalResult, offset] = decodeGlobalSectionV5(view, offset);
        
        // Decode animation section
        [animResult, offset] = decodeAnimSection(view, offset);
        
        // Decode keyframes with V6 structure
        [keyframesResult, offset] = decodeKeyframesV6(view, offset, globalResult.gridCount, globalResult.waveCount);
        
        // Decode active keyframe
        const activeKeyframeByte = view.getUint8(offset);
        const activeKeyframe = decodeKeyframeName(activeKeyframeByte);
        
        // Construct final state object
        return {
            ...globalResult,
            animSettings: animResult,
            keyframes: keyframesResult,
            activeKeyframe
        };
    } catch (error) {
        // If anything fails, throw an error that will be caught at a higher level
        throw new Error(`Failed to decode V6 state: ${error.message}`);
    }
}

/**
 * Decode keyframes section for V6 format with isActive flags
 */
function decodeKeyframesV6(view, offset, gridCount, waveCount) {
	const keyframeCount = view.getUint8(offset);
	if (keyframeCount > 2) {
		throw new Error(`Invalid keyframe count: ${keyframeCount}`);
	}
	
	offset += 1;
	
	const keyframes = {};
	
	for (let i = 0; i < keyframeCount; i++) {
		// Get keyframe name
		const keyframeByte = view.getUint8(offset);
		const keyframeName = decodeKeyframeName(keyframeByte);
		offset += 1;
		
		// Decode keyframe data
		const keyframe = {};
		
		// bgColor as 3 bytes (RGB)
		const r = view.getUint8(offset);
		const g = view.getUint8(offset + 1);
		const b = view.getUint8(offset + 2);
		keyframe.bgColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		offset += 3;
		
		// rotationOffset as 32-bit float
		keyframe.rotationOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// commonHue as 32-bit integer
		keyframe.commonHue = view.getInt32(offset);
		offset += 4;
		
		// commonSaturation as 16-bit integer
		keyframe.commonSaturation = view.getInt16(offset);
		offset += 2;
		
		// commonLightness as 16-bit integer
		keyframe.commonLightness = view.getInt16(offset);
		offset += 2;
		
		// Decode commonThickness
		keyframe.commonThickness = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode scale 
		keyframe.scale = view.getUint16(offset) / 100.0;
		offset += 2;
		
		// Decode commonAmpFactor
		keyframe.commonAmpFactor = view.getUint16(offset) / 100.0;
		offset += 2;

		// Decode commonFreqFactor
		keyframe.commonFreqFactor = view.getInt16(offset) / 100.0;
		offset += 2;		
		
		// commonOffset as 32-bit float
		keyframe.commonOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// commonDirectionOffset as 32-bit integer
		keyframe.commonDirectionOffset = view.getInt32(offset);
		offset += 4;
		
		// phaseOffset as 32-bit float
		keyframe.phaseOffset = view.getInt32(offset) / 100.0;
		offset += 4;
		
		// offsetAngle as 16-bit integer
		keyframe.offsetAngle = view.getUint16(offset);
		offset += 2;
		
		// offsetMagnitude as byte
		keyframe.offsetMagnitude = view.getUint8(offset);
		offset += 1;
		
		// Decode grids with isActive flags
		let grids = [];
		[grids, offset] = decodeGridsV6(view, offset, gridCount);
		keyframe.grids = grids;
		
		// Decode waves with isActive flags
		let waves = [];
		[waves, offset] = decodeWavesV6(view, offset, waveCount);
		keyframe.waves = waves;
		
		// Add keyframe to collection
		keyframes[keyframeName.toLowerCase()] = keyframe;
	}
	
	return [keyframes, offset];
}

/**
 * Decode grids array for V6 format with isActive flags
 */
function decodeGridsV6(view, offset, gridCount) {
	const encodedGridCount = view.getUint8(offset);
	offset += 1;
	
	if (encodedGridCount > 8) {
		throw new Error(`Invalid grid count: ${encodedGridCount}`);
	}
	
    const grids = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.grids));
	
	for (let i = 0; i < encodedGridCount; i++) {
		// Read isActive flag
		grids[i].isActive = view.getUint8(offset) !== 0;
		offset += 1;
		
		// thickness as fixed-point (8-bit)
        grids[i].thickness = view.getUint8(offset) / 100;
        offset += 1;
        
        // width & height as 16-bit values
        grids[i].width = view.getUint16(offset);
        offset += 2;
        
        grids[i].height = view.getUint16(offset);
        offset += 2;
        
        // color as 3 bytes (RGB)
        const r = view.getUint8(offset);
        const g = view.getUint8(offset + 1);
        const b = view.getUint8(offset + 2);
        grids[i].color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        offset += 3;
	}
	
	return [grids, offset];
}

/**
 * Decode waves array for V6 format with isActive flags
 */
function decodeWavesV6(view, offset, waveCount) {
    const encodedWaveCount = view.getUint8(offset);
    offset += 1;
    
    if (encodedWaveCount > 15) {
        throw new Error(`Invalid wave count: ${encodedWaveCount}`);
    }
    
    // Create array with default values for all possible waves
    const waves = JSON.parse(JSON.stringify(MoireUtils.DEFAULT_SETTINGS.keyframes.k1.waves));
    
    // Replace defaults with encoded values for active waves
    for (let i = 0; i < encodedWaveCount; i++) {
        // Read isActive flag
        waves[i].isActive = view.getUint8(offset) !== 0;
        offset += 1;
        
        // type as enum (byte)
        waves[i].type = decodeWaveType(view.getUint8(offset));
        offset += 1;
        
        // amplitude as 16-bit value
        waves[i].amplitude = view.getUint16(offset) / 10;
        offset += 2;
        
        // frequency as 16-bit value
        waves[i].frequency = view.getUint16(offset) / 1000;
        offset += 2;
        
        // phase as 32-bit value (signed)
        waves[i].phase = view.getInt32(offset);
        offset += 4;
        
        // Direction angle as 32-bit signed integer
        waves[i].directionAngle = view.getInt32(offset);
        offset += 4;
    }
    
    return [waves, offset];
}


function decodeStateV7(view, offset) {
    // Decode the global section
    let globalResult, animResult, keyframesResult;
    [globalResult, offset] = decodeGlobalSectionV5(view, offset);
    
    // Decode title
    const titleLength = view.getUint8(offset);
    offset += 1;
    
    let title = "";
    if (titleLength > 0) {
        const titleBytes = new Uint8Array(titleLength);
        for (let i = 0; i < titleLength; i++) {
            titleBytes[i] = view.getUint8(offset + i);
        }
        offset += titleLength;
        
        // Convert bytes to string
        const decoder = new TextDecoder();
        title = decoder.decode(titleBytes);
    }
    
    // Decode guid
    const guidLength = view.getUint8(offset);
    offset += 1;
    
    let guid = "";
    if (guidLength > 0) {
        const guidBytes = new Uint8Array(guidLength);
        for (let i = 0; i < guidLength; i++) {
            guidBytes[i] = view.getUint8(offset + i);
        }
        offset += guidLength;
        
        // Convert bytes to string
        const decoder = new TextDecoder();
        guid = decoder.decode(guidBytes);
    }
    
    // Continue decoding the rest of the state
    [animResult, offset] = decodeAnimSection(view, offset);
    [keyframesResult, offset] = decodeKeyframesV6(view, offset, globalResult.gridCount, globalResult.waveCount);
    
    const activeKeyframeByte = view.getUint8(offset);
    const activeKeyframe = decodeKeyframeName(activeKeyframeByte);
    
    // Construct final state object
    return {
        ...globalResult,
        title: title,
        guid: guid,
        animSettings: animResult,
        keyframes: keyframesResult,
        activeKeyframe
    };
}

