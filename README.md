# Moiré Exploré

An interactive web application for creating, animating, and sharing mesmerizing moiré pattern visualizations.

![Moiré Exploré Screenshot](screenshots/screenshot1.png)

**Live Demo:** [Insert Live URL Here](#)

## Overview

Moiré Exploré is a powerful WebGL-based creative coding tool that generates dynamic moiré patterns by overlapping grid layers with wave perturbations. The app features a comprehensive set of controls allowing users to create complex visual patterns, animate them using a keyframe system, and share their creations with others through an efficient state encoding URL system.

## Features

Here is your reformatted list with dashes instead of numbers:

* **Moiré Pattern Generation**: Core grid-based pattern system with multiple overlapping grid layers
* **Wave Perturbations**: Dynamic wave effects that distort grid patterns
* **Animation System**: Keyframe-based animation between two states (K1 and K2)
* **Rendering Engine**: WebGL-based real-time rendering with optimized shader for smooth performance
* **Fullscreen Mode**: High-resolution presentation mode with keyboard controls
* **Grid Types**: Support for both rectangular and hexagonal grid patterns
* **Rendering Style**: Option to render grids as lines or dots
* **Wave Types**: Multiple wave types (transverse, longitude, amplitude, hue, saturation, lightness, rotation, phase shift)
* **Color Control**: HSV color picker for detailed color customization
* **Blending Modes**: Multiple blending modes (additive, overlay, multiply, screen, etc.)
* **Direction Controls**: Visual angle control for wave propagation
* **Streaming Capability**: Red5 Pro integration to stream patterns live
* **Mini Canvas**: Picture-in-picture view when scrolling away from main canvas
* **Drag and Drop**: Reorder grids and waves via drag handles
* **Random Generation**: Randomize buttons for quick wave exploration
* **Tooltips**: Contextual help throughout the interface
* **State Sharing**: Generates compact URL encoding for sharing created patterns
* **Favorites System**: Save favorites to local storage, view and manage favorites on a gallery page
* **Render to Disk**: Export custom PNG image sequence
* **Pattern Gallery**: Showcase of example patterns with embedded previews
* **Comprehensive Help System**: In-app documentation in addition to contextual tooltips
* **Visibility Management**: Intelligently pauses animations when tab is not visible to save resources
* **Randomization Tools**: One-click randomization of wave parameters
* **Binary State Encoding**: Efficient format for saving/sharing complex states via URL
* **Double-click Parameter Reset**: Quick reset of sliders
* **Responsive Design**: UI adapts to different screen sizes, with specific mobile optimizations, theoretically usable on your phone
* **Multi-Canvas Rendering System**: Manages shared WebGL context across multiple canvases, saving resources and init time
* **Parameter Autosave**: Automatic saving of settings to localStorage (local storage uses JSON)
* **Grid/Wave Active Toggles**: Individual enable/disable controls for each grid and wave
* **Common Parameter Controls**: Common controls that affect all grids or waves at once
* **State Versioning**: Backward compatibility for older state data formats
* **Phase Modulation**: Complex interaction between waves via phase shift
* **Offline Functionality**: Works without internet connection
* **User Preferences System**: Remembers settings like tooltip visibility
* **Self-contained Architecture**: No external dependencies for core functionality


## Screenshots

![Example Pattern 1](screenshots/pattern1.png)

![Example Pattern 2](screenshots/pattern2.png)

![Animation Example](screenshots/animation.gif)

## Usage

### Basic Controls
* Use the grid controls to set up your base pattern
* Add wave perturbations to create dynamic effects
* Experiment with different blending modes and color settings

### Creating Animations
* Set up your first keyframe (K1)
* Switch to the second keyframe (K2) and modify parameters
* Press Play to animate between states
* Adjust duration and animation mode as needed

### Saving & Sharing
* Save interesting patterns to your favorites
* Use the "Generate Share Link" button to create a URL that contains your pattern
* Export PNG sequences for use in video editing software

### Tips for Beginners
* Start with the gallery examples to understand possibilities
* Use the randomize buttons to discover interesting wave combinations
* Use **Active** checkbox to disable grids and waves to understand their contribution
* Tooltips provide context-sensitive help throughout the interface
* Consult the built-in help system for detailed information

### To Create Seamless Loops

To create a seamless loop, both K1 and K2 must appear identical. However if they are actually both identical, then no animation will occur. Hrm.

The solution is to recognize that certain parameters are cyclical and return to the same value every 360°:
* Common Hue Rotation
* An individual grid's Hue angle (edit grid color, in the popup adjust hue angle +/-360)
* Common Phase Offset
* Common Direction Offset
* An individual wave's Phase


## Installation

This application runs entirely in the browser and requires no server-side installation. To run locally:

1. Clone this repository
2. Open `index.html` in a modern web browser

For production deployment, simply copy all files to any web server.

## Browser Compatibility

Moiré Exploré requires a browser with good WebGL support. Tested and confirmed working on:

* Chrome 90+
* Firefox 88+
* Edge 90+
* Safari 14+

## Dependencies

* [Red5 Pro WebRTC SDK](https://www.red5pro.com/docs/development/webrtc/overview/) - Used for streaming capabilities

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) - see the [LICENSE](LICENSE) file for details.

## Copyright

© 2025 Nate Roe. All rights reserved.

---

*Moiré Exploré was created as a tool for digital artists, educators, and anyone interested in exploring the fascinating world of moiré pattern physics and visual mathematics.*
