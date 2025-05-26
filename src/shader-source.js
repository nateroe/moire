const MoireShaders = {

	vertexShaderSource: `
		precision mediump float;
		attribute vec2 position;
		uniform vec2 resolution;
		varying vec2 uv;
		
		void main() {
			// Calculate aspect ratio
			float aspectRatio = resolution.x / resolution.y;
			
			// Map position [-1,1] to UV coordinates [0,1]
			// and apply aspect ratio correction to the x coordinate
			uv = vec2((position.x * 0.5 + 0.5) * aspectRatio, position.y * 0.5 + 0.5);
			
			gl_Position = vec4(position, 0.0, 1.0);
		}
	`,
		

	fragmentShaderSource: `
		precision mediump float;
		varying vec2 uv;
		uniform vec2 resolution;
		uniform vec3 bgColor;
		uniform float lineThickness[8];
		uniform float cellWidth[8];
		uniform float cellHeight[8];
		uniform vec3 colors[8];
		uniform float rotation;
		uniform float commonHue;
		uniform float commonSaturation;
		uniform float commonLightness;
		uniform int gridCount;
		uniform int gridActive[8];  // 1 if active, 0 if inactive
		uniform int gridType;        // 0: rectangular, nonzero: hexagonal
		uniform int renderMode;
		uniform int renderStyle;        // 0: dots, 1: lines

		// Wave perturbation uniforms
		uniform int waveCount;
		uniform int waveActive[15]; // 1 if active, 0 if inactive
		uniform int waveTypes[15];   // 0: transverse, 1: longitude, 2: amplitude, 3: hue, 4: saturation, 5: lightness, 6: rotation, 7: phaseshift
		uniform float waveAmplitudes[15];
		uniform float waveFrequencies[15]; 
		uniform float wavePhases[15];
		uniform vec2 waveDirections[15]; 
		uniform int waveOffsetType;      // 0: phase, 1: vector
		uniform float phaseOffset;           
		uniform vec2 offsetVector;
		uniform float commonOffset;

		// Wave effect structure to store all calculated effects in one pass
		struct WaveEffects {
			vec2 displacement;      // Combined displacement from transverse and longitude waves
			float amplitudeMod;     // Amplitude modification
			float rotationOffset;   // Rotation offset
			vec3 hsvOffset;         // HSV modifications (x: hue, y: saturation, z: value/lightness)
			float phaseShift;       // Phase shift from phase shift waves
		};

		// Fast sine approximation
		float fastSin(float x) {
			return sin(x);
		}

		// Rotate a point 'p' around the center (0.5,0.5) by angle (in degrees)
		vec2 rotatePoint(vec2 p, float angle) {
			float rad = radians(angle);
			float c = cos(rad);
			float s = sin(rad);
			mat2 rotMatrix = mat2(c, -s, s, c);
			return rotMatrix * (p - vec2(0.5)) + vec2(0.5);
		}

		// Process all waves in a single pass and collect all effects
		WaveEffects processAllWaves(vec2 position, int gridIndex) {
			WaveEffects effects;
			
			// Initialize all effects to their default values
			effects.displacement = vec2(0.0);
			effects.amplitudeMod = 1.0;
			effects.rotationOffset = 0.0;
			effects.hsvOffset = vec3(0.0);
			effects.phaseShift = 0.0;
			
			// First, calculate phase shift waves, as they affect other wave types
			for (int w = 0; w < 15; w++) {
				if (w >= waveCount) break;
				
				// Skip inactive waves
				if (waveActive[w] == 0) continue;
			   
				// Only process phase shift waves in this first pass
				if (waveTypes[w] != 7) continue;
				
				// Skip negligible phase shifts
				if (abs(waveAmplitudes[w]) < 0.5) continue;
				
				// Calculate the dot product for wave position
				float dotProduct = dot(position, waveDirections[w]);
				
				// For phase shift waves, we use their own phase without any offset
				float phase = wavePhases[w];
				
				// Apply the phase shift wave effect with fast sine
				float angleValue = dotProduct * waveFrequencies[w] * 6.2831853 + radians(phase);
				float waveEffect = fastSin(angleValue);
				
				effects.phaseShift += waveAmplitudes[w] * waveEffect;
			}
			
			// Now process all other wave types with the calculated phase shift
			for (int w = 0; w < 15; w++) {
				if (w >= waveCount) break;
				
				// Skip inactive waves
				if (waveActive[w] == 0) continue;
				
				// Skip phase shift waves as they were processed earlier
				if (waveTypes[w] == 7) continue;
				
				// Calculate phase with offsets (common for all wave types)
				float phase = wavePhases[w];
				
				// Add phase shift from phase shift waves
				phase += float(gridIndex) * effects.phaseShift;
				
				// Apply common offset to all waves
				phase += commonOffset;
				
				// Apply offset based on grid index and offset type
				if (waveOffsetType == 0) {
					// Phase offset
					phase += float(gridIndex) * phaseOffset;
				} else if (waveOffsetType == 1 && waveTypes[w] != 0 && waveTypes[w] != 1) {
					// Vector offset is applied directly to position for displacement waves
					// For other wave types, we don't need to do anything as position is already correct
				}
				
				// Calculate the dot product for wave position (common for all wave types)
				float dotProduct = dot(position, waveDirections[w]);
				
				// Calculate wave effect (common for all wave types)
				float angleValue = dotProduct * waveFrequencies[w] * 6.2831853 + radians(phase);
				float waveEffect = fastSin(angleValue);
				
				// Apply the effect based on wave type
				if (waveTypes[w] == 0) {
					// Transverse wave - perpendicular to direction
					vec2 perpendicular = vec2(-waveDirections[w].y, waveDirections[w].x);
					effects.displacement += perpendicular * (waveAmplitudes[w] * waveEffect);
				} 
				else if (waveTypes[w] == 1) {
					// Longitudinal wave - parallel to direction
					effects.displacement += waveDirections[w] * (waveAmplitudes[w] * waveEffect);
				} 
				else if (waveTypes[w] == 2) {
					// Amplitude wave
					float modulation = 0.5 + 0.5 * waveEffect;
					effects.amplitudeMod += waveAmplitudes[w] * 0.05 * modulation; // Scale factor for subtle effect
				} 
				else if (waveTypes[w] == 3) {
					// Hue wave
					effects.hsvOffset.x += waveAmplitudes[w] * waveEffect;
				} 
				else if (waveTypes[w] == 4) {
					// Saturation wave
					effects.hsvOffset.y += waveAmplitudes[w] * waveEffect;
				} 
				else if (waveTypes[w] == 5) {
					// Lightness/value wave
					effects.hsvOffset.z += waveAmplitudes[w] * waveEffect;
				} 
				else if (waveTypes[w] == 6) {
					// Rotation wave (additional rotation offset per grid)
					effects.rotationOffset += float(gridIndex) * waveAmplitudes[w] * waveEffect;
				}
			}
			
			// Apply vector offset if needed (only affects position)
			if (waveOffsetType == 1) {
				effects.displacement += float(gridIndex) * offsetVector;
			}
			
			// Ensure amplitude modifier is never negative
			effects.amplitudeMod = max(0.0, effects.amplitudeMod);
			
			return effects;
		}

		// Fast RGB-HSV approximation (only useful when we need to modify HSV values)
		void fastRgbToHsv(vec3 rgb, out float h, out float s, out float v) {
			float minV = min(min(rgb.r, rgb.g), rgb.b);
			float maxV = max(max(rgb.r, rgb.g), rgb.b);
			v = maxV;
			
			float delta = maxV - minV;
			if (delta < 0.001) {
				h = 0.0;
				s = 0.0;
				return;
			}
			
			s = delta / maxV;
			
			float deltaR = ((maxV - rgb.r) / 6.0 + delta / 2.0) / delta;
			float deltaG = ((maxV - rgb.g) / 6.0 + delta / 2.0) / delta;
			float deltaB = ((maxV - rgb.b) / 6.0 + delta / 2.0) / delta;
			
			if (rgb.r == maxV) h = deltaB - deltaG;
			else if (rgb.g == maxV) h = (1.0 / 3.0) + deltaR - deltaB;
			else h = (2.0 / 3.0) + deltaG - deltaR;
			
			h = mod(h, 1.0);
		}

		// Fast HSV-RGB conversion optimized for performance
		vec3 fastHsvToRgb(float h, float s, float v) {
			if (s <= 0.0) return vec3(v);
			
			h = mod(h, 1.0) * 6.0;
			int i = int(h);
			float f = h - float(i);
			float p = v * (1.0 - s);
			float q = v * (1.0 - s * f);
			float t = v * (1.0 - s * (1.0 - f));
			
			if (i == 0) return vec3(v, t, p);
			else if (i == 1) return vec3(q, v, p);
			else if (i == 2) return vec3(p, v, t);
			else if (i == 3) return vec3(p, q, v);
			else if (i == 4) return vec3(t, p, v);
			else return vec3(v, p, q);
		}

		// Apply HSV modifications to a color
		vec3 applyHsvModification(vec3 color, vec3 hsvOffset) {
			// Skip HSV conversion if offsets are negligible
			if (abs(hsvOffset.x) < 0.5 && abs(hsvOffset.y) < 0.5 && abs(hsvOffset.z) < 0.5) {
				return color;
			}
			
			// Convert RGB to HSV
			float h, s, v;
			fastRgbToHsv(color, h, s, v);
			
			// Apply hue offset
			if (abs(hsvOffset.x) >= 0.5) {
				h = mod(h + hsvOffset.x / 360.0, 1.0);
			}
			
			// Apply saturation offset
			if (abs(hsvOffset.y) >= 0.5) {
				float saturationMultiplier = 1.0 + (hsvOffset.y / 100.0);
				s = clamp(s * saturationMultiplier, 0.0, 1.0);
			}
			
			// Apply lightness/value offset
			if (abs(hsvOffset.z) >= 0.5) {
				float valueAdjustment = hsvOffset.z / 100.0;
				
				if (valueAdjustment > 0.0) {
					v = v + ((1.0 - v) * valueAdjustment);
				} else {
					v = v * (1.0 + valueAdjustment);
				}
				
				v = clamp(v, 0.0, 1.0);
			}
			
			// Convert back to RGB
			return fastHsvToRgb(h, s, v);
		}

		void main() {
			const float REFERENCE_HEIGHT = 720.0;
			float scaleFactor = REFERENCE_HEIGHT / resolution.y;
    float sqrt3 = 1.73205080757; // sqrt(3)

			vec3 finalColor = vec3(0.0);
			float totalAlpha = 0.0;
			
			// For overlay mode, we need to track the topmost visible color
			vec3 overlapColor = bgColor;
			float overlapAlpha = 0.0;
			
			// Check if we need HSV effects based on global controls
			bool needsHsvEffects = (abs(commonHue) > 0.5 || abs(commonSaturation) > 0.5 || abs(commonLightness) > 0.5);
			
			// Pre-compute global HSV offset from uniform values
			vec3 globalHsvOffset = vec3(float(commonHue), float(commonSaturation), float(commonLightness));
			
			for (int i = 0; i < 8; i++) {
				if (i >= gridCount) break;
			 
				// Skip inactive grids
				if (gridActive[i] == 0) continue;       

				vec2 cellPixelSize = vec2(cellWidth[i], cellHeight[i]);
				vec2 refCoord = uv * REFERENCE_HEIGHT; 
				vec2 centeredCoord = refCoord - vec2(resolution.x * scaleFactor / 2.0, REFERENCE_HEIGHT / 2.0);

				// Process all waves in a single pass for this grid
				WaveEffects effects = processAllWaves(centeredCoord, i);
				
				// Apply wave displacement to the coordinate
				vec2 perturbedCoord = centeredCoord + effects.displacement;
			   
				// Calculate base rotation plus any rotation offset waves
				float layerRotation = rotation * float(i) + effects.rotationOffset;
				
				// Apply rotation
				vec2 rotatedCoord = rotatePoint(perturbedCoord, layerRotation);

				float d;    // distance from fragment to the nearest dot center
				
				// For rectangular grids
				if (gridType == 0) {
					if (renderStyle == 0) {
						// Original dot rendering
						vec2 gridIndex = floor(rotatedCoord / cellPixelSize);
						vec2 gridCenter = (gridIndex + 0.5) * cellPixelSize;
						d = length(rotatedCoord - gridCenter);
					} else {
						// Line rendering for rectangular grid
						vec2 normalizedCoord = mod(rotatedCoord, cellPixelSize) / cellPixelSize;
						float distToHorizontal = min(normalizedCoord.y, 1.0 - normalizedCoord.y) * cellPixelSize.y;
						float distToVertical = min(normalizedCoord.x, 1.0 - normalizedCoord.x) * cellPixelSize.x;
						d = min(distToHorizontal, distToVertical);
					}
				} 
				// For hexagonal grids
				else {
					// Calculate base row and column for hexagonal grid (existing code)
					float baseRow = floor(rotatedCoord.y / (cellPixelSize.y * 0.866025));
					float baseOffsetX = mod(baseRow, 2.0) * (cellPixelSize.x / 0.5);
					float baseCol = floor((rotatedCoord.x - baseOffsetX) / cellPixelSize.x);
					
					if (renderStyle == 0) {
						// Original dot rendering for hexagonal grid
						d = 1e9;    // start with a large value
						
						// Original hexagonal dots code (iterate over candidates)
						// Compute a base row and column from rotatedCoord.
						float baseRow = floor(rotatedCoord.y / (cellPixelSize.y * 0.866025));
						float baseOffsetX = mod(baseRow, 2.0) * (cellPixelSize.x / 2.0);
						float baseCol = floor((rotatedCoord.x - baseOffsetX) / cellPixelSize.x);
						
						d = 1e9;    // start with a large value
						
						// Iterate over candidate rows and columns.
						for (int dr = -1; dr <= 1; dr++) {
							float rCandidate = baseRow + float(dr);
							// For each row, the x-offset depends on whether the row is offset.
							float offsetXCandidate = mod(rCandidate, 2.0) * (cellPixelSize.x / 2.0);
							for (int dc = -1; dc <= 1; dc++) {
								float cCandidate = baseCol + float(dc);
								vec2 candidateCenter = vec2(
									cCandidate * cellPixelSize.x + cellPixelSize.x / 2.0 + offsetXCandidate,
									rCandidate * cellPixelSize.y * 0.866025 + cellPixelSize.y / 2.0
								);
								float candidateDist = length(rotatedCoord - candidateCenter);
								d = min(d, candidateDist);
							}
						}
					} else {
						// Direct calculation of hex coordinates using axial coordinate system

						// Line rendering for hexagonal grid
						
						// Grid parameters matching the dot rendering
						float hexSize = cellPixelSize.x / 2.0;
						
						// Find which hex we're in
						float row = floor(rotatedCoord.y / (cellPixelSize.y * 0.866025));
						float rowOffset = mod(row, 2.0) * (cellPixelSize.x / 2.0);
						float col = floor((rotatedCoord.x - rowOffset) / cellPixelSize.x);
						
						// Get the center of THIS hex
						vec2 hexCenter = vec2(
							col * cellPixelSize.x + cellPixelSize.x / 2.0 + rowOffset,
							row * cellPixelSize.y * 0.866025 + cellPixelSize.y / 2.0
						);
						
						// Vector from hex center to current point
						vec2 p = (rotatedCoord - hexCenter) / hexSize;
						
						// For pointy-topped hexagon, use the standard formula
						vec2 ap = abs(p);
						
						// Correct edge distance for pointy-topped hex
						float dist = max(ap.x, ap.y * 0.866025 + ap.x * 0.5);
						
						// More precise cutoff to eliminate the horizontal line
						// The theoretical max distance for a point inside a hex is about 1.15
						if (dist > 1.2) {
							// We're outside this hex's proper boundary
							d = 1e9;
						} else {
							d = abs(dist - 1.0) * hexSize;
						}
					}
				}
				
				// Determine effective spacing.
				float effectiveSpacing;
				if (gridType == 0) {
					effectiveSpacing = max(cellPixelSize.x, cellPixelSize.y);
				} else {
					float diag = sqrt(pow(cellPixelSize.x * 0.5, 2.0) + pow(cellPixelSize.y * 0.75, 2.0));
					effectiveSpacing = min(cellPixelSize.x, diag);
				}
				
				// Apply amplitude modulation to the thickness
				float thicknessModifier = effects.amplitudeMod;
					
				// When thickness is 1.0, we want dots to just touch
				float radius = max(0.5 * lineThickness[i] * thicknessModifier * effectiveSpacing, 0.0);
					
				float edge = 0.4; 
				float circleMask = 1.0 - smoothstep(radius, radius + edge, d);

				// Get the grid color
				vec3 gridColor = colors[i];
				
				// Apply HSV effects if needed
				if (needsHsvEffects || length(effects.hsvOffset) > 0.0) {
					// Combine global HSV offset with wave HSV effects
					vec3 totalOffset = globalHsvOffset + effects.hsvOffset;
					
					// Apply HSV modifications
					gridColor = applyHsvModification(gridColor, totalOffset);
				}
					
				if (renderMode == 1) {
					// OVERLAY MODE: Later layers replace earlier ones (painting-like)
					if (circleMask > 0.01) { // If this grid dot is visible at this pixel
						overlapColor = gridColor;
						overlapAlpha = max(overlapAlpha, circleMask);
					}
				} else {
					// ADDITIVE MODE: Colors add together
					finalColor += gridColor * circleMask;
					totalAlpha = max(totalAlpha, circleMask);
				}
			}
				
			// Final color compositing
			if (renderMode == 1) {
				// Overlay mode
				gl_FragColor = vec4(mix(bgColor, overlapColor, overlapAlpha), 1.0);
			} else if (renderMode == 0) {
				// Additive mode
				gl_FragColor = vec4(mix(bgColor, finalColor, totalAlpha), 1.0);
			} else if (renderMode == 2) {
				// Multiply mode
				vec3 blendedColor = bgColor * finalColor;
				gl_FragColor = vec4(mix(bgColor, blendedColor, totalAlpha), 1.0);
			} else if (renderMode == 3) {
				// Screen mode
				vec3 blendedColor = vec3(1.0) - ((vec3(1.0) - bgColor) * (vec3(1.0) - finalColor));
				gl_FragColor = vec4(mix(bgColor, blendedColor, totalAlpha), 1.0);
			} else if (renderMode == 4) {
				// Difference mode
				vec3 blendedColor = abs(bgColor - finalColor);
				gl_FragColor = vec4(mix(bgColor, blendedColor, totalAlpha), 1.0);
			} else if (renderMode == 5) {
				// Exclusion mode
				vec3 blendedColor = bgColor + finalColor - 2.0 * bgColor * finalColor;
				gl_FragColor = vec4(mix(bgColor, blendedColor, totalAlpha), 1.0);
			} else if (renderMode == 6) {
				// Dodge mode - with protection against division by zero
				vec3 blendedColor = bgColor / (vec3(1.0) - clamp(finalColor, 0.0, 0.999));
				gl_FragColor = vec4(mix(bgColor, blendedColor, totalAlpha), 1.0);
			} else if (renderMode == 7) {
				// Burn mode - with protection against division by zero
				vec3 blendedColor = vec3(1.0) - (vec3(1.0) - bgColor) / clamp(finalColor, 0.001, 1.0);
				gl_FragColor = vec4(mix(bgColor, blendedColor, totalAlpha), 1.0);
			} else if (renderMode == 8) {
				// Hard Light mode
				vec3 blendedColor;
				for (int i = 0; i < 3; i++) {
					if (finalColor[i] < 0.5) {
						blendedColor[i] = 2.0 * bgColor[i] * finalColor[i];
					} else {
						blendedColor[i] = 1.0 - 2.0 * (1.0 - bgColor[i]) * (1.0 - finalColor[i]);
					}
				}
				gl_FragColor = vec4(mix(bgColor, blendedColor, totalAlpha), 1.0);
			} else if (renderMode == 9) {
				// XOR mode
				vec3 blendedColor = mix(bgColor, finalColor, abs(bgColor - finalColor));
				gl_FragColor = vec4(mix(bgColor, blendedColor, totalAlpha), 1.0);
			}

		}
	`
};