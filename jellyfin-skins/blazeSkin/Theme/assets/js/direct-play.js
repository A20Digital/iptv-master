/*
 * blazeSkin - Direct Play JavaScript
 * Author: A20Labs
 * Version: 1.0.0
 * 
 * Enables click-to-play for Live TV channels
 * Bypasses info page - click channel card to play immediately
 * 
 * INSTALLATION:
 * Add this to Jellyfin Branding plugin JavaScript field:
 * 
 * const s = document.createElement('script');
 * s.src = 'https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/Theme/assets/js/direct-play.js';
 * document.head.appendChild(s);
 */

(function() {
    'use strict';

    const CONFIG = {
        debug: false,
        toastDuration: 3000,
        accentColor: '#FF6B00'
    };

    const log = (...args) => CONFIG.debug && console.log('[blazeSkin]', ...args);

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    
    function showToast(message) {
        const existing = document.querySelector('.blazeSkin-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'blazeSkin-toast';
        toast.innerHTML = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(30px) scale(0.95)';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.toastDuration);
    }

    // ============================================
    // CHANNEL HELPERS
    // ============================================
    
    function getChannelInfo(card) {
        const id = card.getAttribute('data-id');
        const titleEl = card.querySelector('.cardText') || 
                       card.querySelector('.listItemBodyText') ||
                       card.querySelector('.cardTitle');
        const name = titleEl ? titleEl.textContent.trim() : 'Channel';
        return { id, name };
    }

    function isChannelCard(element) {
        if (!element) return false;
        const type = element.getAttribute('data-type');
        return type === 'TvChannel' || type === 'LiveTvChannel';
    }

    // ============================================
    // PLAYBACK
    // ============================================
    
    function playChannel(channelId, channelName) {
        log('Playing channel:', channelId, channelName);
        
        // Remove previous playing indicator
        document.querySelectorAll('.blazeSkin-playing').forEach(el => {
            el.classList.remove('blazeSkin-playing');
        });
        
        // Add playing indicator to current card
        const card = document.querySelector(`[data-id="${channelId}"]`);
        if (card) card.classList.add('blazeSkin-playing');

        showToast(`▶ <strong>${channelName}</strong>`);

        // Get server ID
        const serverId = window.ApiClient?.serverId?.() || 
                        window.Emby?.ApiClient?.serverId?.();

        // Navigate to video player
        if (serverId) {
            window.location.hash = `#!/video?id=${channelId}&serverId=${serverId}`;
        } else {
            window.location.hash = `#!/video?id=${channelId}`;
        }
    }

    function showChannelInfo(channelId) {
        log('Showing info for:', channelId);
        const serverId = window.ApiClient?.serverId?.() || 
                        window.Emby?.ApiClient?.serverId?.();
        
        if (serverId) {
            window.location.hash = `#!/item?id=${channelId}&serverId=${serverId}`;
        } else {
            window.location.hash = `#!/item?id=${channelId}`;
        }
    }

    // ============================================
    // INFO BUTTON INJECTION
    // ============================================
    
    function addInfoButton(card) {
        if (card.querySelector('.blazeSkin-infoBtn')) return;
        
        const { id } = getChannelInfo(card);
        if (!id) return;

        const btn = document.createElement('button');
        btn.className = 'blazeSkin-infoBtn';
        btn.innerHTML = 'ℹ';
        btn.title = 'View channel info';
        btn.setAttribute('aria-label', 'Channel info');
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showChannelInfo(id);
        });

        // Find container and inject
        const container = card.querySelector('.cardImageContainer') || 
                         card.querySelector('.listItemImage') || 
                         card;
        
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        
        container.appendChild(btn);
        log('Added info button to channel:', id);
    }

    function processChannelCards() {
        const cards = document.querySelectorAll(
            '.card[data-type="TvChannel"], ' +
            '.card[data-type="LiveTvChannel"], ' +
            '.listItem[data-type="TvChannel"], ' +
            '.listItem[data-type="LiveTvChannel"]'
        );
        
        cards.forEach(addInfoButton);
        log(`Processed ${cards.length} channel cards`);
    }

    // ============================================
    // CLICK HANDLER
    // ============================================
    
    function handleClick(e) {
        // Find the card element
        const card = e.target.closest('.card[data-type], .listItem[data-type]');
        
        if (!card || !isChannelCard(card)) return;
        
        // Ignore clicks on info button
        if (e.target.closest('.blazeSkin-infoBtn')) return;
        
        // Ignore clicks on other buttons (like menu buttons)
        if (e.target.closest('button:not(.blazeSkin-infoBtn)')) return;
        
        // Prevent default navigation to info page
        e.preventDefault();
        e.stopPropagation();

        const { id, name } = getChannelInfo(card);
        if (id) {
            playChannel(id, name);
        }
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    
    function handleKeyboard(e) {
        // Press 'i' to view info for focused channel
        if (e.key === 'i' || e.key === 'I') {
            const focused = document.activeElement?.closest('.card[data-type], .listItem[data-type]');
            if (focused && isChannelCard(focused)) {
                const { id } = getChannelInfo(focused);
                if (id) {
                    e.preventDefault();
                    showChannelInfo(id);
                }
            }
        }
    }

    // ============================================
    // DOM OBSERVER
    // ============================================
    
    function observeDOM() {
        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;
                    
                    if (isChannelCard(node) || 
                        node.querySelector?.('[data-type="TvChannel"], [data-type="LiveTvChannel"]')) {
                        shouldProcess = true;
                        break;
                    }
                }
                if (shouldProcess) break;
            }
            
            if (shouldProcess) {
                setTimeout(processChannelCards, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        log('DOM observer started');
    }

    // ============================================
    // INIT
    // ============================================
    
    function init() {
        log('Initializing blazeSkin direct-play...');
        
        // Click handler (capture phase for priority)
        document.addEventListener('click', handleClick, true);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
        
        // Initial processing
        setTimeout(processChannelCards, 500);
        
        // Watch for DOM changes
        observeDOM();
        
        // Re-process on navigation
        window.addEventListener('hashchange', () => {
            setTimeout(processChannelCards, 500);
        });

        // Done
        console.log(
            '%c 🔥 blazeSkin v1.0.0 ',
            'background: linear-gradient(135deg, #FF6B00, #CC5500); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold;'
        );
        console.log(
            '%c Click channels to play directly! Press "i" for channel info. ',
            'color: #FF6B00; font-style: italic;'
        );
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }

})();
