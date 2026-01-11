/*
 * blazeSkin - FinTV Custom Skin
 * Author: A20Labs
 * Version: 1.0.0
 * 
 * Custom JavaScript for direct channel playback
 * Bypasses info page - click channel to play immediately
 */

(function() {
    'use strict';

    const BLAZE_CONFIG = {
        debug: false,
        showToast: true,
        toastDuration: 2000,
        addInfoButtons: true
    };

    // Logging helper
    function log(msg, ...args) {
        if (BLAZE_CONFIG.debug) {
            console.log(`[blazeSkin] ${msg}`, ...args);
        }
    }

    log('Initializing blazeSkin...');

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    
    function showToast(message) {
        if (!BLAZE_CONFIG.showToast) return;
        
        // Remove existing toast
        const existing = document.querySelector('.blazeSkin-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'blazeSkin-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, BLAZE_CONFIG.toastDuration);
    }

    // ============================================
    // DIRECT PLAY FUNCTIONS
    // ============================================
    
    // Play a channel directly by ID
    async function playChannelDirect(channelId, channelName) {
        log('Playing channel:', channelId, channelName);
        
        try {
            // Get the ApiClient from Jellyfin's global scope
            const apiClient = window.ApiClient || 
                              (window.Emby && window.Emby.ApiClient) ||
                              (window.Dashboard && window.Dashboard.getCurrentApiClient && window.Dashboard.getCurrentApiClient());
            
            if (!apiClient) {
                console.error('[blazeSkin] Could not find ApiClient');
                return false;
            }

            // Show toast
            showToast(`▶ Playing: ${channelName || 'Channel'}`);

            // Method 1: Use playbackManager if available
            if (window.playbackManager) {
                await window.playbackManager.play({
                    ids: [channelId],
                    serverId: apiClient.serverId()
                });
                return true;
            }

            // Method 2: Use Emby.Player
            if (window.Emby && window.Emby.Player) {
                await window.Emby.Player.play({
                    ids: [channelId],
                    serverId: apiClient.serverId()
                });
                return true;
            }

            // Method 3: Navigate to direct play URL
            const playUrl = `#!/item?id=${channelId}&serverId=${apiClient.serverId()}&autoplay=true`;
            window.location.hash = playUrl;
            
            return true;
        } catch (err) {
            console.error('[blazeSkin] Playback error:', err);
            return false;
        }
    }

    // Navigate to channel info page
    function showChannelInfo(channelId, event) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        
        const apiClient = window.ApiClient || 
                          (window.Emby && window.Emby.ApiClient);
        
        if (apiClient) {
            window.location.hash = `#!/item?id=${channelId}&serverId=${apiClient.serverId()}`;
        }
    }

    // ============================================
    // INFO BUTTON INJECTION
    // ============================================
    
    function addInfoButton(element, channelId) {
        if (!BLAZE_CONFIG.addInfoButtons) return;
        if (element.querySelector('.blazeSkin-infoBtn')) return;
        
        // Make sure parent has position relative
        const card = element.closest('.card') || element;
        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }
        
        const infoBtn = document.createElement('button');
        infoBtn.className = 'blazeSkin-infoBtn';
        infoBtn.innerHTML = 'ℹ';
        infoBtn.title = 'View channel info';
        infoBtn.setAttribute('data-channel-id', channelId);
        
        infoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showChannelInfo(channelId, e);
        });
        
        card.appendChild(infoBtn);
    }

    // ============================================
    // CLICK HANDLER SETUP
    // ============================================
    
    function setupDirectPlay() {
        // Use event delegation on the document body
        document.body.addEventListener('click', async (event) => {
            // Find the clicked card element
            const card = event.target.closest('[data-id]');
            if (!card) return;
            
            // Check if this is a Live TV channel
            const itemId = card.getAttribute('data-id');
            const itemType = card.getAttribute('data-type');
            const isLiveTv = card.closest('.liveTvItems') || 
                            card.closest('.liveTvChannels') ||
                            card.closest('[data-view="livetv.channels"]') ||
                            card.classList.contains('liveTvChannel') ||
                            itemType === 'TvChannel' ||
                            itemType === 'LiveTvChannel';
            
            // Check if info button was clicked
            if (event.target.closest('.blazeSkin-infoBtn')) {
                return; // Let the info button handler deal with it
            }
            
            // Check if already clicking a play button
            if (event.target.closest('.itemAction[data-action="play"]')) {
                return; // Let default play button work
            }

            if (isLiveTv && itemId) {
                // Prevent default navigation to info page
                event.preventDefault();
                event.stopPropagation();
                
                // Get channel name for toast
                const nameElement = card.querySelector('.cardText') || 
                                   card.querySelector('.cardTitle') ||
                                   card.querySelector('[class*="cardText"]');
                const channelName = nameElement ? nameElement.textContent.trim() : '';
                
                // Play directly
                await playChannelDirect(itemId, channelName);
            }
        }, true); // Use capture phase to intercept before other handlers
        
        log('Direct play handler initialized');
    }

    // ============================================
    // MUTATION OBSERVER FOR DYNAMIC CONTENT
    // ============================================
    
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;
                    
                    // Look for Live TV channel cards
                    const cards = node.querySelectorAll ? 
                                  node.querySelectorAll('[data-id][data-type="TvChannel"], [data-id][data-type="LiveTvChannel"], .liveTvChannel[data-id]') : 
                                  [];
                    
                    cards.forEach((card) => {
                        const channelId = card.getAttribute('data-id');
                        if (channelId) {
                            addInfoButton(card, channelId);
                        }
                    });
                    
                    // Check if node itself is a channel card
                    if (node.matches && node.matches('[data-id][data-type="TvChannel"], [data-id][data-type="LiveTvChannel"]')) {
                        const channelId = node.getAttribute('data-id');
                        if (channelId) {
                            addInfoButton(node, channelId);
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        log('Mutation observer initialized');
    }

    // ============================================
    // ADD INFO BUTTONS TO EXISTING CHANNELS
    // ============================================
    
    function processExistingChannels() {
        const channels = document.querySelectorAll('[data-id][data-type="TvChannel"], [data-id][data-type="LiveTvChannel"], .liveTvChannel[data-id]');
        
        channels.forEach((card) => {
            const channelId = card.getAttribute('data-id');
            if (channelId) {
                addInfoButton(card, channelId);
            }
        });
        
        log(`Processed ${channels.length} existing channels`);
    }

    // ============================================
    // KEYBOARD SHORTCUT (Optional)
    // ============================================
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Press 'i' to show info for focused channel
            if (e.key === 'i' || e.key === 'I') {
                const focused = document.activeElement;
                if (focused && focused.hasAttribute('data-id')) {
                    const itemType = focused.getAttribute('data-type');
                    if (itemType === 'TvChannel' || itemType === 'LiveTvChannel') {
                        e.preventDefault();
                        showChannelInfo(focused.getAttribute('data-id'));
                    }
                }
            }
        });
        
        log('Keyboard shortcuts initialized');
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        log('Starting initialization...');
        
        // Setup all handlers
        setupDirectPlay();
        setupMutationObserver();
        setupKeyboardShortcuts();
        
        // Process any existing channels
        processExistingChannels();
        
        // Re-process when navigating (SPA)
        window.addEventListener('hashchange', () => {
            setTimeout(processExistingChannels, 500);
        });
        
        // Also re-process periodically for dynamic content
        setInterval(processExistingChannels, 3000);
        
        log('blazeSkin fully initialized');
        console.log('%c🔥 blazeSkin Active - Click channels to play directly!', 
                    'color: #FF6B00; font-size: 14px; font-weight: bold;');
    }

    // Wait for DOM and Jellyfin to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small delay to ensure Jellyfin is fully loaded
        setTimeout(init, 1000);
    }

})();
