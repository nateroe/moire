// --- RED5PRO PUBLISHING FUNCTIONALITY ---
let publisher = null;
let publishStream = null;
let renderStreamInterval = null;

// Stats tracking
let currentBitrate = 0;
let currentResolution = null;
let bytesTransmitted = 0;
let publishStartTime = 0;

const onBitrateUpdate = (bitrate) => {
    currentBitrate = bitrate;
    updatePublishStats();
}

const onResolutionUpdate = (width, height) => {
    currentResolution = { width, height };
    updatePublishStats();
}

const updatePublishStats = () => {
    const publishStatus = document.getElementById('publishStatus');
    if (!publisher) return;
    
    const duration = Math.floor((Date.now() - publishStartTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    let statsText = `Publishing [${timeStr}]`;
    
    if (currentBitrate > 0) {
        const kbps = Math.round(currentBitrate / 1000);
        statsText += ` • ${kbps} kbps`;
    }
    
    if (currentResolution && currentResolution.width && currentResolution.height) {
        statsText += ` • ${currentResolution.width}x${currentResolution.height}`;
    }
    
    publishStatus.textContent = statsText;
    publishStatus.style.color = '#4ba3ff';
}

const onPublisherEvent = (event) => {
    console.log('[Red5ProPublisher] ' + event.type + '.')
    const publishStatus = document.getElementById('publishStatus');
    
    // Update status based on event type
    switch(event.type) {
        case 'Connect.Success':
            publishStatus.textContent = 'Connected to server...';
            publishStatus.style.color = '#4ba3ff';
            break;
        case 'Connect.Failure':
            publishStatus.textContent = 'Failed to connect to server';
            publishStatus.style.color = '#ff4b4b';
            break;
        case 'Publish.Start':
            publishStatus.textContent = 'Stream started successfully';
            publishStatus.style.color = '#4ba3ff';
            publishStartTime = Date.now();
            
            // Initialize resolution from canvas dimensions
            const canvas = document.getElementById('moireCanvas');
            if (canvas && !currentResolution) {
                currentResolution = { width: canvas.width, height: canvas.height };
            }
            
            // Start periodic stats update
            startStatsUpdate();
            break;
        case 'Publish.Fail':
            publishStatus.textContent = 'Failed to start stream';
            publishStatus.style.color = '#ff4b4b';
            break;
        case 'WebRTC.PeerConnection.Open':
            publishStatus.textContent = 'WebRTC connection established';
            publishStatus.style.color = '#4ba3ff';
            try {
                const pc = publisher.getPeerConnection()
                const stream = publisher.getMediaStream()
                // Track bitrate if window.trackBitrate is available
                if (window.trackBitrate) {
                    window.trackBitrate(pc, onBitrateUpdate, onResolutionUpdate)
                } else {
                    // Basic stats tracking fallback
                    trackBasicStats(pc);
                }
                
                // Get video track settings with fallback
                if (stream && stream.getVideoTracks) {
                    stream.getVideoTracks().forEach(function (track) {
                        try {
                            const settings = track.getSettings();
                            if (settings && settings.width && settings.height) {
                                onResolutionUpdate(settings.width, settings.height);
                            } else {
                                // Fallback to canvas dimensions
                                const canvas = document.getElementById('moireCanvas');
                                if (canvas) {
                                    onResolutionUpdate(canvas.width, canvas.height);
                                }
                            }
                        } catch (e) {
                            console.log('Could not get track settings:', e);
                            // Fallback to canvas dimensions
                            const canvas = document.getElementById('moireCanvas');
                            if (canvas) {
                                onResolutionUpdate(canvas.width, canvas.height);
                            }
                        }
                    });
                }
            } catch (e) {
                console.log('Stats tracking error:', e);
            }
            break;
        case 'WebRTC.PeerConnection.Closed':
            publishStatus.textContent = 'WebRTC connection closed';
            publishStatus.style.color = '#ff4b4b';
            stopStatsUpdate();
            break;
        case 'Publish.Unpublish':
            publishStatus.textContent = 'Stream stopped';
            publishStatus.style.color = '#fff';
            stopStatsUpdate();
            break;
    }
}

// Fallback stats tracking if window.trackBitrate isn't available
function trackBasicStats(peerConnection) {
    const statsInterval = setInterval(async () => {
        if (!peerConnection || peerConnection.connectionState === 'closed') {
            clearInterval(statsInterval);
            return;
        }
        
        try {
            const stats = await peerConnection.getStats();
            stats.forEach(report => {
                if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                    const bitrate = report.bytesSent ? (report.bytesSent * 8) / ((Date.now() - publishStartTime) / 1000) : 0;
                    onBitrateUpdate(bitrate);
                }
            });
        } catch (e) {
            console.error('Error getting stats:', e);
        }
    }, 2000);
}

let statsUpdateInterval = null;

function startStatsUpdate() {
    // Update stats every second
    statsUpdateInterval = setInterval(updatePublishStats, 1000);
}

function stopStatsUpdate() {
    if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval);
        statsUpdateInterval = null;
    }
    currentBitrate = 0;
    currentResolution = null;
}

function setupPublishControls() {
    const publishButton = document.getElementById('publishButton');
    const stopPublishButton = document.getElementById('stopPublishButton');
    const serverUrlInput = document.getElementById('serverUrl');
    const streamGuidInput = document.getElementById('streamGuid');
    const publishStatus = document.getElementById('publishStatus');

    // Ensure proper initial state
    publishButton.style.display = 'block';
    stopPublishButton.style.display = 'none';
    publishStatus.textContent = '';
    publishStatus.style.color = '#fff';

    publishButton.addEventListener('click', (event) => {
        // Reset status color
        publishStatus.style.color = '#fff';
        
        // Validate inputs
        const serverUrl = serverUrlInput.value.trim();
        const streamGuid = streamGuidInput.value.trim();

        if (!serverUrl) {
            showToast2('Please enter a server URL', event.clientX, event.clientY);
            publishStatus.textContent = 'Server URL required';
            publishStatus.style.color = '#ff4b4b';
            return;
        }

        if (!streamGuid) {
            showToast2('Please enter a stream GUID', event.clientX, event.clientY);
            publishStatus.textContent = 'Stream GUID required';
            publishStatus.style.color = '#ff4b4b';
            return;
        }

        // Try to parse URL to extract host, protocol, port
        let host, protocol, port;
        try {
            const url = new URL(serverUrl);
            host = url.hostname;
            protocol = url.protocol.replace(':', '');
            port = url.port || (protocol === 'https' ? 443 : 80);
        } catch (error) {
            showToast2('Invalid server URL format', event.clientX, event.clientY);
            publishStatus.textContent = 'Invalid URL format';
            publishStatus.style.color = '#ff4b4b';
            console.error('URL parsing error:', error);
            return;
        }

        // Parse stream GUID to extract app and streamName
        const guidParts = streamGuid.split('/');
        if (guidParts.length !== 2) {
            showToast2('Stream GUID should be in format: app/streamName', event.clientX, event.clientY);
            publishStatus.textContent = 'Invalid GUID format: use app/streamName';
            publishStatus.style.color = '#ff4b4b';
            return;
        }
        const app = guidParts[0];
        const streamName = guidParts[1];

        // Start publishing
        startPublishing(host, protocol, port, app, streamName);
    });

    stopPublishButton.addEventListener('click', stopPublishing);
}

function startPublishing(host, protocol, port, app, streamName) {
    const publishButton = document.getElementById('publishButton');
    const stopPublishButton = document.getElementById('stopPublishButton');
    const publishStatus = document.getElementById('publishStatus');

    const serverUrlInput = document.getElementById('serverUrl');
    const streamGuidInput = document.getElementById('streamGuid');

    const serverUrl = serverUrlInput.value.trim();
    const streamGuid = streamGuidInput.value.trim();
    const endpoint = serverUrl + streamGuid;

    // Create a config object for Red5Pro
    const rtcConfig = {
        host: host,
        app: app,
        streamName: streamName,
        protocol: protocol,
        port: port,
        useVideo: true,
        useAudio: false,
        mediaElementId: 'moireCanvas', // null, // no preview needed
        whip: true, // Enable WHIP signaling
        streamManagerAPI: "v1",
        streamManagerNodeGroup: "default",
        endpoint,
    };

    publishStatus.textContent = 'Initializing stream...';
    publishStatus.style.color = '#fff';
    
    // Initialize resolution from canvas
    const canvas = document.getElementById('moireCanvas');
    if (canvas) {
        currentResolution = { width: canvas.width, height: canvas.height };
    }
    
    // Capture the canvas as a media stream
    try {
        publishStream = canvas.captureStream(30); // 30 FPS
        
        // Create and initialize the publisher
        publisher = new red5prosdk.WHIPClient();
        publisher.initWithStream(rtcConfig, publishStream)
            .then(function (publisherImpl) {
                publisher = publisherImpl
                publisher.on('*', onPublisherEvent)
                return publisher.publish()
            })
            .then(() => {
                console.log('WHIP publishing started.');
                publishStatus.textContent = 'Publishing...';
                publishStatus.style.color = '#4ba3ff';
                publishButton.style.display = 'none';
                stopPublishButton.style.display = 'block';
                
                // start rendering if we aren't already
//						startAnimation();
            })
            .catch(err => {
                console.error('WHIP publish failed:', err);
                let errorMessage = 'Publishing failed';
                
                // Provide more specific error messages
                if (err.message) {
                    if (err.message.includes('network')) {
                        errorMessage = 'Network error - check server URL';
                    } else if (err.message.includes('auth') || err.message.includes('unauthorized')) {
                        errorMessage = 'Authentication failed';
                    } else if (err.message.includes('timeout')) {
                        errorMessage = 'Connection timeout';
                    } else {
                        errorMessage = `Publishing failed: ${err.message}`;
                    }
                }
                
                publishStatus.textContent = errorMessage;
                publishStatus.style.color = '#ff4b4b';
                
                // Clean up UI state
                publishButton.style.display = 'block';
                stopPublishButton.style.display = 'none';
                
                // Clean up resources
                if (publishStream) {
                    publishStream.getTracks().forEach(track => track.stop());
                    publishStream = null;
                }
                publisher = null;
            });
    } catch (err) {
        console.error('Failed to capture canvas stream:', err);
        publishStatus.textContent = 'Failed to capture canvas: ' + (err.message || err);
        publishStatus.style.color = '#ff4b4b';
        
        // Clean up UI state
        publishButton.style.display = 'block';
        stopPublishButton.style.display = 'none';
    }
}

function stopPublishing() {
    const publishButton = document.getElementById('publishButton');
    const stopPublishButton = document.getElementById('stopPublishButton');
    const publishStatus = document.getElementById('publishStatus');

    // Stop stats updates
    stopStatsUpdate();

    // Cancel the render stream animation frame if active
    if (renderStreamInterval) {
        cancelAnimationFrame(renderStreamInterval);
        renderStreamInterval = null;
    }

    if (publisher) {
        publisher.unpublish()
            .then(() => {
                console.log('WHIP publishing stopped.');
                publishStatus.textContent = 'Publishing stopped';
                publishStatus.style.color = '#fff';
            })
            .catch(err => {
                console.error('Error stopping publisher:', err);
                publishStatus.textContent = 'Error stopping stream';
                publishStatus.style.color = '#ff4b4b';
            })
            .finally(() => {
                publisher = null;
                if (publishStream) {
                    // Stop all tracks
                    publishStream.getTracks().forEach(track => track.stop());
                    publishStream = null;
                }
                publishButton.style.display = 'block';
                stopPublishButton.style.display = 'none';
                
                // After a few seconds, clear the status
                setTimeout(() => {
                    if (publishStatus.textContent === 'Publishing stopped' || 
                        publishStatus.textContent === 'Error stopping stream') {
                        publishStatus.textContent = '';
                        publishStatus.style.color = '#fff';
                    }
                }, 3000);
            });
    } else {
        publishStatus.textContent = '';
        publishStatus.style.color = '#fff';
        publishButton.style.display = 'block';
        stopPublishButton.style.display = 'none';
    }
}

// Initialize the publisher controls
document.addEventListener('DOMContentLoaded', setupPublishControls);

// Make sure publishing is cleaned up if the page is unloaded
window.addEventListener('beforeunload', () => {
    if (publisher && publisher.isPublishing()) {
        stopPublishing();
    }
});