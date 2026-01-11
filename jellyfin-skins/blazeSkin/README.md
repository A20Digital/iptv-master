# 🔥 blazeSkin Theme for Jellyfin

A modern, dark theme for Jellyfin with **Blaze Orange** accent colors and **direct channel playback** for Live TV.

Based on the [ElegantFin](https://github.com/lscambo13/ElegantFin) template structure.

---

## ⭐ Features

- 🎨 **Dark theme** with Blaze Orange (#FF6B00) accent
- 📺 **Direct Play** - Click Live TV channels to play immediately (no info page)
- ℹ️ **Info Button** - Hover to reveal info button for channel details
- 🎯 **Modern UI** - Rounded corners, smooth animations, hover effects
- 📱 **Responsive** - Works on mobile, desktop, and TV
- ⚡ **Single Import** - One line CSS installation

---

## 👇 Quick Install

### Step 1: Add Theme CSS

**Dashboard → General (or Branding) → Custom CSS**

Paste this single line:

```css
@import url("https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/Theme/blazeSkin-jellyfin-theme-build-latest-minified.css");
```

### Step 2: Add Direct Play JavaScript (Optional)

For **click-to-play** on Live TV channels, install the **Branding plugin**:

1. **Dashboard → Plugins → Catalog** → Search "Branding" → Install
2. **Dashboard → Plugins → Branding** → JavaScript field:

```javascript
const s = document.createElement('script');
s.src = 'https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/Theme/assets/js/direct-play.js';
document.head.appendChild(s);
```

### Step 3: Clear Cache & Refresh

Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

## 🎮 Usage

| Action | Result |
|--------|--------|
| **Click channel card** | Plays immediately |
| **Hover + click ℹ️** | Opens channel info page |
| **Press `i` key** | Shows info for focused channel |

---

## 🧩 Customization

Override any CSS variable in your Custom CSS:

```css
@import url("https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/Theme/blazeSkin-jellyfin-theme-build-latest-minified.css");

:root {
    /* Change accent color */
    --accentColor: #3B82F6;
    --accentColorLight: #60A5FA;
    --accentColorDark: #2563EB;
}
```

---

## 🔗 CDN URLs

| File | URL |
|------|-----|
| **Theme CSS** | `https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/Theme/blazeSkin-jellyfin-theme-build-latest-minified.css` |
| **Direct Play JS** | `https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeSkin/Theme/assets/js/direct-play.js` |

---

## 👤 Author

**A20Labs** - FinTV / BlazeNetworkTV Project

## 📄 License

MIT License
