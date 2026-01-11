# 🔥 blazeSkin - FinTV Custom Jellyfin Skin

A custom Jellyfin skin that enables **direct channel playback** - click a channel and it plays immediately without going to the info page first.

## Quick Install (Recommended)

### Step 1: Add Custom CSS

Go to **Dashboard → General → Custom CSS** and paste:

```css
@import url('https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/dist/blazeSkin.css');
```

### Step 2: Add Custom JavaScript

Install the **Jellyfin Branding Plugin**:
1. Go to **Dashboard → Plugins → Catalog**
2. Search for "Branding" and install it
3. Go to **Dashboard → Plugins → Branding**
4. In the JavaScript field, paste:

```javascript
const s = document.createElement('script');
s.src = 'https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/dist/blazeSkin.js';
document.head.appendChild(s);
```

### Step 3: Clear Cache & Refresh

Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

---

## Features

| Feature | Description |
|---------|-------------|
| **Click to Play** | Click any channel card → plays immediately |
| **Info Button** | ℹ️ icon appears on hover → click for channel details |
| **Keyboard Shortcut** | Press `i` on focused channel for info |
| **Now Playing** | Orange border on currently playing channel |
| **Toast Notifications** | Shows "▶ Playing: Channel Name" |
| **Blaze Orange Theme** | #FF6B00 accent color |

---

## CDN URLs

| File | URL |
|------|-----|
| **CSS** | `https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/dist/blazeSkin.css` |
| **JS** | `https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/dist/blazeSkin.js` |

### Alternative (GitHub Raw)

| File | URL |
|------|-----|
| **CSS** | `https://raw.githubusercontent.com/A20Digital/iptv-master/main/jellyfin-skins/blazeSkin/dist/blazeSkin.css` |
| **JS** | `https://raw.githubusercontent.com/A20Digital/iptv-master/main/jellyfin-skins/blazeSkin/dist/blazeSkin.js` |

---

## Files

| File | Description |
|------|-------------|
| `dist/blazeSkin.css` | Compiled CSS (use this) |
| `dist/blazeSkin.js` | Compiled JS (use this) |
| `skin.json` | Skin metadata |
| `custom.css` | Source CSS |
| `custom.js` | Source JS |

---

## Configuration

Edit the `BLAZE_CONFIG` object in `blazeSkin.js`:

```javascript
const BLAZE_CONFIG = {
    debug: false,        // Enable console logging
    toastDuration: 3000, // Toast display time (ms)
    accentColor: '#FF6B00'
};
```

---

## Usage

| Action | Result |
|--------|--------|
| Click channel | Plays immediately |
| Click ℹ️ button | Opens channel info page |
| Press `i` key | Opens info for focused channel |

---

## Compatibility

- Jellyfin 10.8.x - 10.11.x
- Tested with Live TV from IPTV tuners
- Works with M3U and HDHomeRun sources

---

## Troubleshooting

**Channels still go to info page:**
- Clear browser cache (Ctrl+Shift+R)
- Check browser console (F12) for errors
- Ensure Branding plugin is installed and configured

**Info buttons not appearing:**
- Verify JavaScript is loading (check console for "blazeSkin v1.0 loaded")
- Try refreshing the page

**Toast not showing:**
- Check if CSS is loading correctly
- May conflict with other skins

---

## Author

A20Labs - FinTV Project

## License

MIT License
