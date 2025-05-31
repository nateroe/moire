const adjectives = [
    "Aeriform", "Alchemical", "Ambient", "Animated", "Asymmetric", "Astral", "Atmospheric", "Aural", "Auroral",
    "Beaming", "Beatific", "Biomorphic", "Blissed-out", "Blissful", "Bold", "Breezy", "Brilliant", "Bubbly", "Buoyant", 
    "Bursting", "Candescent", "Cascading", "Cavernous", "Celestial", "Chaotic", "Chimeric", "Chromatic", "Chromodynamic", 
    "Cinematic", "Circadian", "Cocooned", "Color-washed", "Colorful", "Constellated", "Coruscating", "Cosmic", "Crystalline", 
    "Crystallized", "Cubist", "Cyclic", "Dancing", "Dazzling", "Delightful", "Delirious", "Diffracted", "Digital", 
    "Dimensional", "Disordered", "Dissolving", "Distorted", "Divergent", "Dizzying", "Dreamlike", "Dreamy", "Dynamic",
    "Echoing", "Eclipsed", "Ecstatic", "Effervescent", "Effulgent", "Electric", "Electromagnetic", "Elated", "Emergent", 
    "Emotive", "Enchanting", "Energetic", "Entrancing", "Entropic", "Ephemeral", "Eruptive", "Ethereal", "Etherealized", 
    "Euphonious", "Euphoric", "Euphorizing", "Evolving", "Exhilarating", "Expansive", "Exponential", "Extraterrestrial", 
    "Exuberant", "Fibonacci", "Flickering", "Floating", "Flowing", "Fluctuating", "Fluid", "Fluorescent", "Flushed", 
    "Fluxing", "Folded", "Fractal", "Fracturing", "Fragrant", "Frenetic", "Frequency-shifted", "Frisson-inducing", 
    "Futuristic", "Galactic", "Gaussian", "Generative", "Geometric", "Giddy", "Glimmering", "Glistening", "Glitchy", 
    "Glorious", "Glowing", "Granular", "Gravitational", "Groovy", "Haloed", "Hallucinatory", "Harmonic", "Harmonious", 
    "Harmonizing", "Heavenly", "Hexagonal", "Holistic", "Holographic", "Hyperreal", "Hyperspace", "Hypertextured", "Hypnotic", 
    "Illuminated", "Illusive", "Illusory", "Immersive", "Impulsive", "Incandescent", "Infinite", "Interference", 
    "Interstellar", "Intoxicating", "Introspective", "Inward", "Iridescent", "Iridescing", "Joyful", "Jubilant", "Juicy", 
    "Kaleidoscopic", "Kinetic", "Labyrinthine", "Laminar", "Levitating", "Light-bending", "Limina", "Liquid", "Living", 
    "Lively", "Logarithmic", "Looping", "Loopy", "Lucent", "Lucid", "Luciferous", "Ludic", "Luminescent", "Luminous", "Lush", 
    "Magical", "Magnetic", "Magnetized", "Majestic", "Mandelbrot", "Manifold", "Meandering", "Meditative", "Melting", 
    "Melodic", "Mercurial", "Mesmerizing", "Metamorphic", "Migratory", "Mind-blowing", "Mind-expanding", "Mirrored", 
    "Modulated", "Moiré", "Molecular", "Moodful", "Moonlit", "Multidimensional", "Multicolored", "Mutating", "Mystical", 
    "Nebular", "Neo-prismatic", "Neon-lit", "Neural", "Non-euclidean", "Non-linear", "Oceanic", "Omniscient", "Opalescent", 
    "Orbiting", "Organic", "Oscillating", "Oscillatory", "Otherworldly", "Panoramic", "Panning", "Paradoxical", "Parametric", 
    "Pearly", "Percolating", "Permutating", "Perplexing", "Phantasmal", "Phantasmagoric", "Phasic", "Phosphorescent", "Photic", 
    "Pillowy", "Pixelated", "Plasmatic", "Playful", "Plush", "Polar", "Polygonal", "Polymorphic", "Prismacolor", "Prismatic", 
    "Procedural", "Psyched", "Pulsating", "Pulsing", "Quantum", "Quasar", "Radiant", "Radiating", "Radiative", "Rainbow-hued", 
    "Recursive", "Refracted", "Reflecting", "Refractive", "Relativistic", "Resonant", "Resplendent", "Reverberating", 
    "Revelatory", "Rhythmic", "Rippled", "Ritualistic", "Sacred", "Scintillating", "Seamless", "Self-similar", "Sensual", 
    "Shaded", "Shattered", "Shimmering", "Silvery", "Singing", "Sinuous", "Skybound", "Slinky", "Smoothed", "Soft-glowing", 
    "Sonic", "Spectral", "Spherical", "Spiraling", "Splendid", "Spontaneous", "Stellar", "Stochastic", "Strobing", "Sublime", 
    "Sun-drenched", "Surreal", "Swelling", "Swirling", "Synchronized", "Synthetic", "Tactile", "Techno-organic", 
    "Teleporting", "Tesselated", "Textural", "Tidal", "Transcendent", "Transformative", "Translucent", "Translunar", 
    "Transmuting", "Transparent", "Trippy", "Turbulent", "Undulating", "Unfolding", "Unwinding", "Uplifting", "Vaporous", 
    "Vectorial", "Velvet", "Verdant", "Vertiginous", "Vibrant", "Vivid", "Vortexing", "Warm", "Wave-like", "Wavelength", 
    "Wavy", "Weightless", "Whimsical", "Whirling", "Wonderful", "Zany"
];

const nouns = [
    "Abstraction", "Abstractionism", "Algorithm", "Alpha", "Amplitude", "Angle", "Animation", "Apparatus", "Archetype", 
    "Array", "Artifact", "Aura", "Automaton", "Axis", "Bitform", "Blueprint", "Blob", "Brushstroke", "Canvas", "Chart", 
    "Chunk", "Circuit", "Code", "Codex", "Collage", "Colorfield", "Complex", "Composition", "Configuration", "Constellation", 
    "Construct", "Continuum", "Contour", "Coordinate", "Creation", "Crystal", "Curve", "Cyberscape", "Data", "Datavis", 
    "Deformation", "Density", "Design", "Diagram", "Dimension", "Display", "Distortion", "Doodad", "Doohickey", "Ecosystem", 
    "Effect", "Element", "Equation", "Essence", "Ether", "Experiment", "Facet", "Feedback", "Field", "Figure", "Fluctuation", 
    "Flux", "Focus", "Flowfield", "Form", "Formation", "Formulation", "Frame", "Fractal", "Frequency", "Frip", "Function", 
    "Fusion", "Galaxy", "Generative", "Geodesic", "Geometry", "Gestalt", "Glimmer", "Glow", "Glyph", "Gradient", "Graph", 
    "Graphic", "Grid", "Gizmo", "Harmonic", "Helix", "Hologram", "Horizon", "Huefield", "Hyperspace", "Illusion", "Image", 
    "Impression", "Index", "Infographic", "Instance", "Interference", "Interface", "Interplay", "Iteration", "Lattice", 
    "Layout", "Layer", "Lens", "Lightform", "Loop", "Luminance", "Manifold", "Mapping", "Matrix", "Membrane", "Mesh", 
    "Metashape", "Methodology", "Microcosm", "Model", "Modulation", "Moiré", "Moment", "Morph", "Mosaic", "Motion", "Nebula", 
    "Network", "Neuron", "Noise", "Node", "Object", "Occlusion", "Orbit", "Output", "Overlay", "Palette", "Parameter", 
    "Particle", "Pattern", "Permutation", "Phase", "Phenomenon", "Photon", "Picture", "Pixel", "Plane", "Point", "Polygrid", 
    "Presence", "Procedural", "Process", "Projection", "Protoform", "Pulse", "Quantum", "Qubit", "Realm", "Refraction", 
    "Region", "Render", "Renderpass", "Representation", "Resonance", "Ripple", "Scene", "Schematic", "Sequence", "Shader", 
    "Shimmer", "Signal", "Signature", "Simulation", "Sine", "Singularity", "Sketch", "Soundscape", "Space", "Spectrum", 
    "Sphere", "Splice", "Spline", "State", "Stipple", "Stream", "Structure", "Stylization", "Subdivision", "Subsurface", 
    "Symmetry", "System", "Tapestry", "Tensor", "Tesseract", "Texture", "Thing", "Thingamabob", "Thingamajig", "Thinglet", 
    "Thingy", "Threshold", "Tiling", "Topography", "Trace", "Trajectory", "Transform", "Transformation", "Transmission", 
    "Undulation", "Unit", "Variation", "Vector", "Vibration", "Vignette", "Visage", "Visual", "Visualization", 
    "Visualizationism", "Volume", "Vortex", "Wave", "Wavelength", "Waveform", "Webbing", "Whatchamacallit", "Whirl", "Widget", 
    "Wireframe", "Wormhole", "X-dimension", "Y-axis", "Z-buffer", "Zenith", "Zone", "Zoodle"
];

function generateRandomName() {
	const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	return `${adjective} ${noun}`;
}

// Helper function to generate a deterministic title from a random function
function generateTitleFromSeed(random) {
    // Use the random function to select words from the existing name generation arrays
    // This assumes you have adjectives and nouns arrays in names.js
    const adjIndex = Math.floor(random() * adjectives.length);
    const nounIndex = Math.floor(random() * nouns.length);
    
    return adjectives[adjIndex] + " " + nouns[nounIndex];
}


// Helper function to generate a deterministic GUID from a random function
function generateGuidFromSeed(random) {
    const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return template.replace(/[xy]/g, function(c) {
        const r = Math.floor(random() * 16);
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
