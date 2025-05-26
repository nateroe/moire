// Update version to 7: adds title and guid fields
const BINARY_FORMAT_VERSION = 7;

// Constants for title and guid limits
const MAX_TITLE_LENGTH = 50; // Maximum length for title (in bytes)
const MAX_GUID_LENGTH = 40;  // Maximum length for guid (standard UUID is 36 chars)


// ====== ENCODER ======

/**
 * Encodes app state to compact binary format
 * @param {Object} appSettings - The application state
 * @return {String} Base64 encoded string for URL
 */
function encodeState(appSettings) {
	// Step 1: Create a binary buffer with estimated size
	// We'll allocate extra space just to be safe
	const estimatedSize = calculateBufferSize(appSettings);
	const buffer = new ArrayBuffer(estimatedSize);
	const view = new DataView(buffer);
	let offset = 0;
	
    // Step 2: Write the version (1 byte)
    view.setUint8(offset, BINARY_FORMAT_VERSION);
    offset += 1;
    
	// Step 3: Encode the global section
	offset = encodeGlobalSection(appSettings, view, offset);

    // Encode title with length limit
    if (appSettings.title) {
        const encoder = new TextEncoder();
        let titleBytes = encoder.encode(appSettings.title);
        
        // Enforce maximum length
        if (titleBytes.length > MAX_TITLE_LENGTH) {
            titleBytes = titleBytes.slice(0, MAX_TITLE_LENGTH);
        }
        
        // Write title length (1 byte) followed by title bytes
        view.setUint8(offset, titleBytes.length);
        offset += 1;
        
        for (let i = 0; i < titleBytes.length; i++) {
            view.setUint8(offset + i, titleBytes[i]);
        }
        offset += titleBytes.length;
    } else {
        // No title, write 0 length
        view.setUint8(offset, 0);
        offset += 1;
    }
    
    // Encode guid with length limit
    if (appSettings.guid) {
        const encoder = new TextEncoder();
        let guidBytes = encoder.encode(appSettings.guid);
        
        // Enforce maximum length
        if (guidBytes.length > MAX_GUID_LENGTH) {
            guidBytes = guidBytes.slice(0, MAX_GUID_LENGTH);
        }
        
        // Write guid length (1 byte) followed by guid bytes
        view.setUint8(offset, guidBytes.length);
        offset += 1;
        
        for (let i = 0; i < guidBytes.length; i++) {
            view.setUint8(offset + i, guidBytes[i]);
        }
        offset += guidBytes.length;
    } else {
        // No guid, write 0 length
        view.setUint8(offset, 0);
        offset += 1;
    }
	
	// Step 4: Encode animation section
	offset = encodeAnimSection(appSettings.animSettings, view, offset);
	
	// Step 5: Encode keyframes (using V6 format that includes isActive flags)
	offset = encodeKeyframesV6(appSettings.keyframes, view, offset);
	
	// Step 6: Encode active keyframe as single byte
	const activeKeyframeByte = encodeKeyframeName(appSettings.activeKeyframe);
	view.setUint8(offset, activeKeyframeByte);
	offset += 1;
	
	// Create final binary of exact size
	const finalBinary = new Uint8Array(buffer, 0, offset);
	
	// Step 7: Convert to Base64 for URL safety
	return btoa(String.fromCharCode.apply(null, finalBinary))
		.replace(/\+/g, '-')	 // Replace + with - (URL safe)
		.replace(/\//g, '_')	 // Replace / with _ (URL safe)
		.replace(/=+$/, '');	 // Remove trailing = (padding)
}

/**
 * Calculate required buffer size
 */
function calculateBufferSize(appSettings) {
	// Start with a base size
	let size = 380; // Increased for larger data types, new properties, and isActive flags
	
	// Add space for each grid
	const gridCount = appSettings.gridCount || 2;
	size += gridCount * 13; // Extra byte per grid for isActive flag
	
	// Add space for each wave
	const waveCount = appSettings.waveCount || 0;
	size += waveCount * 21; // Extra byte per wave for isActive flag
	
	// Add space for keyframes
	const keyframeCount = Object.keys(appSettings.keyframes || {}).length || 0;
	size += keyframeCount * 140; // Increased for larger data types + new properties + isActive flags
	
	// Return a buffer that's definitely large enough
	return size;
}

/**
 * Encode global section
 */
function encodeGlobalSection(appSettings, view, offset) {
	// gridCount as byte
	view.setUint8(offset, appSettings.gridCount || 2); 
	offset += 1;
	
	// waveCount as byte
	view.setUint8(offset, appSettings.waveCount || 0);
	offset += 1;
	
	// gridType as byte
	view.setUint8(offset, parseInt(appSettings.gridType || "0"));
	offset += 1;
	
	// renderMode as enum (byte)
	view.setUint8(offset, encodeRenderMode(appSettings.renderMode));
	offset += 1;

	// renderStyle as enum (byte)
	view.setUint8(offset, encodeRenderStyle(appSettings.renderStyle));
	offset += 1
	
	// waveOffsetType as enum (byte)
	view.setUint8(offset, encodeWaveOffsetType(appSettings.waveOffsetType));
	offset += 1;
	
	return offset;
}

/**
 * Encode animation section
 */
function encodeAnimSection(animSettings, view, offset) {
	if (!animSettings) {
		// No animation data, use defaults
		view.setUint16(offset, 20);    // duration (2.0s * 10)
		view.setUint8(offset + 2, 2);  // mode (upAndDown)
		view.setUint8(offset + 3, 0);  // autoplay (false)
		return offset + 4;
	}
	
	// duration as 16-bit value (seconds * 10)
	const durationValue = parseFloat(animSettings.duration) || 2.0;
	view.setUint16(offset, Math.round(durationValue * 10));
	offset += 2;
	
	// mode as enum (byte)
	view.setUint8(offset, encodeAnimMode(animSettings.mode));
	offset += 1;
	
	// autoplay as byte (0 = false, 1 = true)
	view.setUint8(offset, animSettings.autoplay === true ? 1 : 0);
	offset += 1;
	
	return offset;
}

/**
 * Encode keyframes section - V6 format with isActive flags
 */
function encodeKeyframesV6(keyframes, view, offset) {
	if (!keyframes) {
		// No keyframes, store count 0
		view.setUint8(offset, 0);
		return offset + 1;
	}
	
	const keyframeNames = Object.keys(keyframes);
	
	// Store keyframe count
	view.setUint8(offset, keyframeNames.length);
	offset += 1;
	
	// Store each keyframe
	for (let i = 0; i < keyframeNames.length; i++) {
		const name = keyframeNames[i];
		const keyframe = keyframes[name];
		
		// Store keyframe name as byte
		view.setUint8(offset, encodeKeyframeName(name));
		offset += 1;
		
		// Store keyframe data
		
		// bgColor as 3 bytes (RGB)
		const bgColorValues = parseColor(keyframe.bgColor);
		view.setUint8(offset, bgColorValues[0]); // R
		view.setUint8(offset + 1, bgColorValues[1]); // G
		view.setUint8(offset + 2, bgColorValues[2]); // B
		offset += 3;
		
		// rotationOffset with 2 decimal place precision (multiply by 100 to store as integer)
		const rotationOffsetValue = Math.round((keyframe.rotationOffset || 0) * 100);
		view.setInt32(offset, rotationOffsetValue);
		offset += 4; // Int32 is 4 bytes
		
		// commonHue as 32-bit integer for expanded range (-3600 to 3600)
		view.setInt32(offset, keyframe.commonHue || 0);
		offset += 4; // Int32 is 4 bytes

		// commonSaturation as 16-bit signed integer
		view.setInt16(offset, keyframe.commonSaturation || 0);
		offset += 2; // Int16 is 2 bytes

		// commonLightness as 16-bit signed integer
		view.setInt16(offset, keyframe.commonLightness || 0);
		offset += 2; // Int16 is 2 bytes

		// Store commonThickness with 2 decimal place precision
		const commonThicknessValue = Math.round((keyframe.commonThickness || 1.0) * 100);
		view.setUint16(offset, commonThicknessValue);
		offset += 2;

		// Store scale with 2 decimal place precision
		const scaleValue = Math.round((keyframe.scale || 1.0) * 100);
		view.setUint16(offset, scaleValue);
		offset += 2;

		// Store commonAmpFactor with 2 decimal place precision
		const commonAmpFactorValue = Math.round((keyframe.commonAmpFactor || 1.0) * 100);
		view.setUint16(offset, commonAmpFactorValue);
		offset += 2;

		// Store commonFreqFactor with 2 decimal place precision (using setInt16 since it can be negative)
		const commonFreqFactorValue = Math.round((keyframe.commonFreqFactor || 1.0) * 100);
		view.setInt16(offset, commonFreqFactorValue);
		offset += 2;
		
		// Store commonOffset with 2 decimal place precision
		const commonOffsetValue = Math.round((keyframe.commonOffset || 0) * 100);
		view.setInt32(offset, commonOffsetValue);
		offset += 4; // Int32 is 4 bytes
		
		// Store commonDirectionOffset with expanded range (-3600 to 3600)
		const commonDirectionOffsetValue = keyframe.commonDirectionOffset || 0;
		view.setInt32(offset, commonDirectionOffsetValue);
		offset += 4; // Int32 is 4 bytes
		
		// Store phaseOffset with 2 decimal place precision
		const phaseOffsetValue = Math.round((keyframe.phaseOffset || 0) * 100);
		view.setInt32(offset, phaseOffsetValue);
		offset += 4; // Int32 is 4 bytes
		
		// Store offsetAngle as Uint16 for expanded range (0-3600)
		view.setUint16(offset, keyframe.offsetAngle || 0);
		offset += 2; // Uint16 is 2 bytes
		
		// Store offsetMagnitude as byte (0-255 is sufficient)
		view.setUint8(offset, keyframe.offsetMagnitude || 0);
		offset += 1;
		
		// Encode grids with isActive flags
		offset = encodeGridsV6(keyframe.grids, view, offset);
		
		// Encode waves with angles and isActive flags
		offset = encodeWavesV6(keyframe.waves, view, offset);
	}
	
	return offset;
}

/**
 * Encode waves array with direction angles and isActive flags - V6 format
 */
function encodeWavesV6(waves, view, offset) {
	// Store wave count
	view.setUint8(offset, appSettings.waveCount);
	offset += 1;
	
	// Store each wave
	for (let i = 0; i < appSettings.waveCount; i++) {
		const wave = waves[i] || {};
		
		// isActive flag as byte (0 = false, 1 = true)
		view.setUint8(offset, wave.isActive !== false ? 1 : 0); // Default to true if not specified
		offset += 1;
		
		// type as enum (byte)
		view.setUint8(offset, encodeWaveType(wave.type));
		offset += 1;
		
		// amplitude as 16-bit value (0-2550)
		view.setUint16(offset, Math.round((wave.amplitude || 10) * 10));
		offset += 2;
		
		// frequency as 16-bit value
		view.setUint16(offset, Math.round((wave.frequency || 1.0) * 1000));
		offset += 2;
		
		// phase as 32-bit value (expanded range -3600 to 3600)
		view.setInt32(offset, Math.min(2147483647, wave.phase || 0));
		offset += 4; // Int32 is 4 bytes
		
		// Direction angle as 32-bit signed integer (allows any angle value)
		let directionAngle = wave.directionAngle;
		
		// If directionAngle doesn't exist yet, default to 0
		if (directionAngle === undefined) {
			directionAngle = 0;
		}
		
		// Store the raw direction angle value (no normalization to 0-360)
		view.setInt32(offset, Math.round(directionAngle));
		offset += 4; // Int32 is 4 bytes
	}
	
	return offset;
}

/**
 * Encode grids array with isActive flags
 */
function encodeGridsV6(grids, view, offset) {
	if (!Array.isArray(grids)) {
		view.setUint8(offset, 0); // No grids
		return offset + 1;
	}
	
	// Store grid count
	view.setUint8(offset, appSettings.gridCount);
	offset += 1;
	
	// Store each grid
	for (let i = 0; i < appSettings.gridCount; i++) {
		const grid = grids[i] || {};
		
		// isActive flag as byte (0 = false, 1 = true)
		view.setUint8(offset, grid.isActive !== false ? 1 : 0); // Default to true if not specified
		offset += 1;
		
		// thickness as fixed-point (8-bit)
		view.setUint8(offset, Math.round((grid.thickness || 0.25) * 100));
		offset += 1;
		
		// width & height as 16-bit values (expanded range)
		view.setUint16(offset, Math.min(65535, grid.width || 20));
		offset += 2; // Uint16 is 2 bytes
		
		view.setUint16(offset, Math.min(65535, grid.height || 20));
		offset += 2; // Uint16 is 2 bytes
		
		// color as 3 bytes (RGB)
		const colorValues = parseColor(grid.color);
		view.setUint8(offset, colorValues[0]); // R
		view.setUint8(offset + 1, colorValues[1]); // G
		view.setUint8(offset + 2, colorValues[2]); // B
		offset += 3;
	}
	
	return offset;
}


// ====== DECODER ======

/**
 * Main decode function reads and switches on version
 * @param {String} base64String - The encoded state from URL
 * @return {Object} Reconstructed application state
 */
function decodeState(base64String) {
    let result = null;
    
    try {
        // Make the Base64 URL-safe for decoding
        const normalizedBase64 = base64String
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        // Convert Base64 to binary
        const binaryString = atob(normalizedBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create a DataView for reading
        const view = new DataView(bytes.buffer);
        let offset = 0;
        
        // Check the version
        const version = view.getUint8(offset);
        offset += 1;
        
        // Continue with version-specific decoding
        switch (version) {
            case 1:
                result = decodeStateV1(view, offset);
                break;
            case 2:
                result = decodeStateV2(view, offset);
                break;
            case 3:
                result = decodeStateV3(view, offset);
                break;
            case 4:
                result = decodeStateV4(view, offset);
                break;
            case 5:
                result = decodeStateV5(view, offset);
                break;
            case 6:
                result = decodeStateV6(view, offset);
                break;
            case 7:
                result = decodeStateV7(view, offset);
                break;
            default:
                throw new Error(`Unknown format version: ${version}`);
        }
        
        // For legacy versions, generate consistent title and guid
        if (result && version < 7) {
            // Use the encoded state as a seed for both guid and title
            const stateSeed = base64String.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            
            // Set up PRNG with the seed
            const seedRandom = function(seed) {
                return function() {
                    seed = (seed * 9301 + 49297) % 233280;
                    return seed / 233280;
                };
            };
            
            const random = seedRandom(stateSeed);
            
            // Generate guid based on the seed
            result.guid = generateGuidFromSeed(random);
            
            // Generate title based on the seed
            result.title = generateTitleFromSeed(random);
        }
    } catch (error) {
        console.error("Binary decoding failed:", error);
        // Try legacy format as fallback
        result = decodeLegacyState(base64String);
    }

    return result;
}

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
 * Decode animation section (same for all versions)
 */
function decodeAnimSection(view, offset) {
	const anim = {};
	
	// duration as 16-bit value
	anim.duration = (view.getUint16(offset) / 10).toFixed(1);
	offset += 2;
	
	// mode as enum (byte)
	anim.mode = decodeAnimMode(view.getUint8(offset));
	offset += 1;
	
	// autoplay flag
	anim.autoplay = view.getUint8(offset) === 1;
	offset += 1;
	
	return [anim, offset];
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
 * Get application state from URL
 * @throws {Error} If state cannot be parsed from URL
 */
function getStateFromUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	const stateParam = urlParams.get('state');

	console.log("stateParam: " + stateParam);
	
	if (!stateParam) {
		throw new Error('No state parameter in URL');
	}
	
	try {
		// Attempt to decode state from binary format
		return decodeState(stateParam);
	} catch (error) {
		// If binary decoding fails, try legacy JSON format
		try {
            return decodeLegacyState(stateParam);
		} catch (jsonError) {
			// If both methods fail, propagate the original error
			throw error;
		}
	}
}

/**
 * Update URL with current state
 */
function updateStateUrl(state) {
	// Use the binary encoding for smaller URLs
	const encodedState = encodeState(state);
	
	// Update URL without reloading page
	const url = new URL(window.location.href);
	url.searchParams.set('state', encodedState);
	window.history.replaceState({}, '', url);
	
	return encodedState;
}

/**
 * Generate sharing URL
 */
function generateSharingUrl(state) {
	// Use the binary encoding for smaller URLs
	const encodedState = encodeState(state);
	
	let result;
	
	try {
		// Create absolute URL for sharing
		const url = new URL(window.location.pathname, window.location.origin);
		url.searchParams.set('state', encodedState);
		
		result = url.toString();
	} catch (e) {
		// Fallback for file:// URLs or other environments
		result = window.location.href.split('?')[0] + "?state=" + encodedState;
	}
	
	return result;
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

