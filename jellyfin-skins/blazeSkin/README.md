# 🔥 blazeSkin - FinTV Custom Jellyfin Skin

A custom Jellyfin skin that enables **direct channel playback** - click a channel and it plays immediately without going to the info page first.

## Features

- **Click to Play**: Click any Live TV channel → plays immediately
- **Info Button**: Small ℹ️ icon on each channel card to view details if needed
- **Toast Notifications**: Brief "Now Playing" message when starting playback
- **Keyboard Shortcut**: Press `i` while focused on a channel to view info
- **Blaze Orange Accent**: Custom orange theme color (#FF6B00)
- **Hover Effects**: Visual play indicator when hovering over channels

## Installation

### Method 1: Skin Manager Plugin

1. Open Jellyfin Dashboard → Plugins → Skin Manager
2. Click "Add Skin" or "Upload Skin"
3. Upload the `blazeSkin` folder or paste the CSS/JS content
4. Save and refresh

### Method 2: Manual CSS/JS Injection

If Skin Manager doesn't support custom JS:

1. Go to **Dashboard → General → Custom CSS**
2. Paste the contents of `custom.css`

3. For the JavaScript, you'll need the **Custom Javascript Plugin**:
   - Install from Plugin Catalog
   - Paste contents of `custom.js`

### Method 3: Direct File Placement

Copy the skin files to your Jellyfin web directory:

```bash
# Default paths:
# Linux: /usr/share/jellyfin/web/
# Docker: /jellyfin/web/
# Windows: C:\Program Files\Jellyfin\Server\jellyfin-web\

# Copy files
cp custom.css /path/to/jellyfin/web/blazeSkin.css
cp custom.js /path/to/jellyfin/web/blazeSkin.js
```

Then add to the main index.html:
```html
<link rel="stylesheet" href="blazeSkin.css">
<script src="blazeSkin.js"></script>
```

## Files

| File | Description |
|------|-------------|
| `skin.json` | Skin metadata |
| `custom.css` | Styling and visual enhancements |
| `custom.js` | Direct play functionality |
| `README.md` | This documentation |

## Configuration

Edit the `BLAZE_CONFIG` object in `custom.js`:

```javascript
const BLAZE_CONFIG = {
    debug: false,        // Enable console logging
    showToast: true,     // Show "Now Playing" notifications
    toastDuration: 2000, // Toast display time (ms)
    addInfoButtons: true // Add ℹ️ buttons to channel cards
};
```

## Usage

| Action | Result |
|--------|--------|
| Click channel | Plays immediately |
| Click ℹ️ button | Opens channel info page |
| Press `i` key | Opens info for focused channel |

## Compatibility

- Jellyfin 10.8.x - 10.11.x
- Tested with Live TV from IPTV tuners
- Works with M3U and HDHomeRun sources

## Troubleshooting

**Channels still go to info page:**
- Clear browser cache
- Check browser console for errors
- Ensure JavaScript is being loaded

**Info buttons not appearing:**
- Skin may need a page refresh
- Check if `addInfoButtons` is `true`

**Toast not showing:**
- Check if `showToast` is `true`
- May conflict with other skins

## Author

A20Labs - FinTV Project

## License

MIT License
