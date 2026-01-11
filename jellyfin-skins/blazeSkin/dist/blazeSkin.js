/*
 * blazeSkin - FinTV Custom JavaScript
 * Author: A20Labs
 * Version: 1.0.0
 * 
 * Direct play for Live TV channels
 */

(function() {
    'use strict';

    const BLAZE_CONFIG = {
        debug: false,
        toastDuration: 3000,
        accentColor: '#FF6B00'
    };

    function log(...args) {
        if (BLAZE_CONFIG.debug) console.log('[blazeSkin]', ...args);
    }

    // Toast notification
    function showToast(message) {
        const existing = document.querySelector('.blazeSkin-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'blazeSkin-toast';
        toast.innerHTML = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, BLAZE_CONFIG.toastDuration);
    }

    // Get channel info from card element
    function getChannelInfo(card) {
        const id = card.getAttribute('data-id');
        const titleEl = card.querySelector('.cardText') || card.querySelector('.listItemBodyText');
        const name = titleEl ? titleEl.textContent.trim() : 'Channel';
        return { id, name };
    }

    // Play channel directly
    function playChannel(channelId, channelName) {
        log('Playing channel:', channelId, channelName);
        
        // Mark as playing
        document.querySelectorAll('.blazeSkin-playing').forEach(el => {
            el.classList.remove('blazeSkin-playing');
        });
        
        const card = document.querySelector(`[data-id="${channelId}"]`);
        if (card) card.classList.add('blazeSkin-playing');

        showToast(`▶ Playing: <strong>${channelName}</strong>`);

        // Navigate to video player
        const serverId = ApiClient?.serverId?.() || window.ApiClient?.serverId?.();
        if (serverId) {
            window.location.hash = `#!/video?id=${channelId}&serverId=${serverId}`;
        } else {
            // Fallback: use Jellyfin's internal navigation
            window.location.hash = `#!/video?id=${channelId}`;
        }
    }

    // Show channel info page
    function showChannelInfo(channelId) {
        log('Showing info for:', channelId);
        const serverId = ApiClient?.serverId?.() || window.ApiClient?.serverId?.();
        if (serverId) {
            window.location.hash = `#!/item?id=${channelId}&serverId=${serverId}`;
        } else {
            window.location.hash = `#!/item?id=${channelId}`;
        }
    }

    // Add info buttons to channel cards
    function addInfoButtons() {
        const cards = document.querySelectorAll('.card[data-type="TvChannel"], .listItem[data-type="TvChannel"]');
        
        cards.forEach(card => {
            if (card.querySelector('.blazeSkin-infoBtn')) return;
            
            const { id } = getChannelInfo(card);
            if (!id) return;

            const infoBtn = document.createElement('button');
            infoBtn.className = 'blazeSkin-infoBtn';
            infoBtn.innerHTML = 'ℹ';
            infoBtn.title = 'View channel info';
            infoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showChannelInfo(id);
            });

            // Find appropriate container
            const container = card.querySelector('.cardImageContainer') || 
                            card.querySelector('.listItemImage') || 
                            card;
            container.style.position = 'relative';
            container.appendChild(infoBtn);
        });
    }

    // Handle clicks on channel cards
    function handleChannelClick(e) {
        const card = e.target.closest('.card[data-type="TvChannel"], .listItem[data-type="TvChannel"]');
        
        if (!card) return;
        if (e.target.closest('.blazeSkin-infoBtn')) return; // Info button clicked
        if (e.target.closest('button:not(.blazeSkin-infoBtn)')) return; // Other button clicked

        e.preventDefault();
        e.stopPropagation();

        const { id, name } = getChannelInfo(card);
        if (id) {
            playChannel(id, name);
        }
    }

    // Keyboard shortcut: 'i' for info on focused channel
    function handleKeyboard(e) {
        if (e.key === 'i' || e.key === 'I') {
            const focused = document.activeElement?.closest('.card[data-type="TvChannel"], .listItem[data-type="TvChannel"]');
            if (focused) {
                const { id } = getChannelInfo(focused);
                if (id) {
                    e.preventDefault();
                    showChannelInfo(id);
                }
            }
        }
    }

    // Watch for new channel cards (infinite scroll, page navigation)
    function observeDOM() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.matches?.('.card[data-type="TvChannel"], .listItem[data-type="TvChannel"]') ||
                                node.querySelector?.('.card[data-type="TvChannel"], .listItem[data-type="TvChannel"]')) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });
            if (shouldUpdate) {
                setTimeout(addInfoButtons, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize
    function init() {
        log('Initializing blazeSkin...');
        
        // Add click handler (capture phase for priority)
        document.addEventListener('click', handleChannelClick, true);
        
        // Add keyboard handler
        document.addEventListener('keydown', handleKeyboard);
        
        // Initial button injection
        setTimeout(addInfoButtons, 500);
        
        // Watch for DOM changes
        observeDOM();
        
        // Re-inject on navigation
        window.addEventListener('hashchange', () => {
            setTimeout(addInfoButtons, 500);
        });

        log('blazeSkin initialized!');
        console.log('%c blazeSkin v1.0 loaded ', 'background: #FF6B00; color: white; padding: 5px; border-radius: 3px;');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
