// Audio management for ambient sounds
document.addEventListener('DOMContentLoaded', function() {
    // Audio elements
    const ambientSound = document.getElementById('ambient-sound');
    const natureSound = document.getElementById('nature-sound');
    
    // Control elements
    const audioToggle = document.getElementById('audio-toggle');
    const audioPanel = document.getElementById('audio-panel');
    const closeAudio = document.getElementById('close-audio');
    
    // Track controls
    const toggleNature = document.getElementById('toggle-nature');
    const toggleAmbient = document.getElementById('toggle-ambient');
    const natureVolume = document.getElementById('nature-volume');
    const ambientVolume = document.getElementById('ambient-volume');
    
    // Panel overlay (reuse from mobile.js)
    const panelOverlay = document.getElementById('panel-overlay');
    
    // State tracking
    let audioPanelOpen = false;
    let natureIsPlaying = false;
    let ambientIsPlaying = false;
    
    // Alternative audio sources if the default ones don't load
    const audioSources = {
        nature: [
            'https://assets.codepen.io/21542/forest-ambient.mp3',
            'https://soundbible.com/mp3/forest_ambient-daniel-simon.mp3',
            'https://soundimage.org/wp-content/uploads/2016/07/Summer-Day-Garden.mp3'
        ],
        ambient: [
            'https://assets.codepen.io/21542/howling-wind.mp3',
            'https://soundimage.org/wp-content/uploads/2016/02/Mellow-Eletric-Beat.mp3',
            'https://soundimage.org/wp-content/uploads/2016/03/Peaceful-Garden.mp3'
        ]
    };
    
    // Function to try alternative audio sources if needed
    const tryAlternativeSources = (audio, type, index = 0) => {
        if (index >= audioSources[type].length) return; // No more alternatives
        
        audio.src = audioSources[type][index];
        audio.onerror = () => tryAlternativeSources(audio, type, index + 1);
    };
    
    // Set initial error handlers to try alternative sources
    natureSound.onerror = () => tryAlternativeSources(natureSound, 'nature', 0);
    ambientSound.onerror = () => tryAlternativeSources(ambientSound, 'ambient', 0);
    
    // Initialize volume
    natureSound.volume = 0.5;
    ambientSound.volume = 0.5;
    
    // Toggle the audio panel with improved touch handling
    audioToggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        
        audioPanelOpen = !audioPanelOpen;
        audioPanel.classList.toggle('active', audioPanelOpen);
        panelOverlay.classList.toggle('active', audioPanelOpen);
        
        // Close other panels if open
        document.getElementById('left-panel').classList.remove('active');
        document.getElementById('right-panel').classList.remove('active');
    });
    
    // Also handle touch events explicitly for iOS
    audioToggle.addEventListener('touchend', function(e) {
        e.preventDefault(); // Prevent double-firing with click
        e.stopPropagation();
        
        audioPanelOpen = !audioPanelOpen;
        audioPanel.classList.toggle('active', audioPanelOpen);
        panelOverlay.classList.toggle('active', audioPanelOpen);
        
        // Close other panels if open
        document.getElementById('left-panel').classList.remove('active');
        document.getElementById('right-panel').classList.remove('active');
    }, { passive: false });
    
    // Make sure audio panel itself doesn't close when interacting with it
    audioPanel.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from reaching overlay
    });
    
    audioPanel.addEventListener('touchend', function(e) {
        e.stopPropagation(); // Prevent event from reaching overlay
    });
    
    // Close audio panel
    closeAudio.addEventListener('click', function(e) {
        e.stopPropagation();
        audioPanel.classList.remove('active');
        panelOverlay.classList.remove('active');
        audioPanelOpen = false;
    });
    
    // Toggle nature sounds with robust touch handling
    toggleNature.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleNatureSound();
    });
    
    toggleNature.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleNatureSound();
    }, { passive: false });
    
    // Function to toggle nature sounds
    function toggleNatureSound() {
        if (natureIsPlaying) {
            natureSound.pause();
            toggleNature.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            natureSound.play().catch(error => {
                console.log("Audio play failed, trying user interaction later:", error);
                // We'll handle this when user interacts with the page
            });
            toggleNature.innerHTML = '<i class="fas fa-pause"></i>';
        }
        natureIsPlaying = !natureIsPlaying;
    }
    
    // Toggle ambient music with robust touch handling
    toggleAmbient.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleAmbientSound();
    });
    
    toggleAmbient.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleAmbientSound();
    }, { passive: false });
    
    // Function to toggle ambient sound
    function toggleAmbientSound() {
        if (ambientIsPlaying) {
            ambientSound.pause();
            toggleAmbient.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            ambientSound.play().catch(error => {
                console.log("Audio play failed, trying user interaction later:", error);
                // We'll handle this when user interacts with the page
            });
            toggleAmbient.innerHTML = '<i class="fas fa-pause"></i>';
        }
        ambientIsPlaying = !ambientIsPlaying;
    }
    
    // Volume controls
    natureVolume.addEventListener('input', function() {
        natureSound.volume = this.value;
    });
    
    ambientVolume.addEventListener('input', function() {
        ambientSound.volume = this.value;
    });
    
    // Handle panel overlay clicks
    panelOverlay.addEventListener('click', function() {
        audioPanel.classList.remove('active');
        audioPanelOpen = false;
    });
    
    // P5 integration: use these in your p5 sketch if needed
    window.playAmbientSounds = function() {
        // Accessible from sketch.js
        if (!natureIsPlaying) {
            natureSound.play().catch(e => console.log("Could not autoplay nature sounds"));
            toggleNature.innerHTML = '<i class="fas fa-pause"></i>';
            natureIsPlaying = true;
        }
    };
    
    // Auto-play hint for mobile users
    let audioStarted = false;
    
    // Function to try starting audio when user interacts with page
    const tryAutoPlayAudio = function() {
        if (!audioStarted) {
            // Load the audio files on first interaction
            ambientSound.load();
            natureSound.load();
            
            // Auto-play nature sounds on first interaction
            // Only for non-mobile or if user explicitly requested
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
            
            if (!isMobile) { 
                setTimeout(() => {
                    natureSound.play().then(() => {
                        natureIsPlaying = true;
                        toggleNature.innerHTML = '<i class="fas fa-pause"></i>';
                    }).catch(e => console.log("Auto-play still failed after interaction"));
                }, 1000);
            }
            audioStarted = true;
            
            // Remove listeners after first interaction
            document.removeEventListener('click', tryAutoPlayAudio);
            document.removeEventListener('touchstart', tryAutoPlayAudio);
        }
    };
    
    // Listen for user interaction to start audio
    document.addEventListener('click', tryAutoPlayAudio);
    document.addEventListener('touchstart', tryAutoPlayAudio);
    
    // Add visualization if p5.sound is available
    let audioContext;
    let analyzer;
    
    window.setupAudioVisualization = function() {
        if (typeof p5 !== 'undefined' && p5.SoundFile) {
            try {
                // Create an audio context for visualization
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create analyzer
                analyzer = audioContext.createAnalyser();
                analyzer.fftSize = 256;
                
                // Connect audio elements to analyzer
                if (natureSound && natureSound.play) {
                    const source = audioContext.createMediaElementSource(natureSound);
                    source.connect(analyzer);
                    analyzer.connect(audioContext.destination);
                }
                
                console.log("Audio visualization setup complete");
            } catch (e) {
                console.log("Could not setup audio visualization:", e);
            }
        }
    };
    
    // Function to get audio data for visualization
    window.getAudioData = function() {
        if (analyzer) {
            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyzer.getByteFrequencyData(dataArray);
            return dataArray;
        }
        return null;
    };
    
    // Make sure we can interact with audio controls on mobile
    document.querySelectorAll('.audio-btn, input[type="range"]').forEach(el => {
        el.addEventListener('touchstart', e => {
            e.stopPropagation();
        }, { passive: true });
        
        el.addEventListener('touchmove', e => {
            e.stopPropagation();
        }, { passive: true });
    });
});

// Function to visualize audio in p5 sketch
function visualizeAudio() {
    if (window.getAudioData) {
        const audioData = window.getAudioData();
        if (audioData) {
            // Use the audio data to visualize in the background
            noStroke();
            fill(255, 255, 255, 5); // Very transparent white
            
            const binWidth = width / audioData.length;
            for (let i = 0; i < audioData.length; i++) {
                const amplitude = audioData[i];
                const x = i * binWidth;
                const h = map(amplitude, 0, 255, 0, height/4);
                rect(x, height - h, binWidth, h);
            }
        }
    }
} 