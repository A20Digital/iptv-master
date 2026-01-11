# blazeskin2

A beautiful Jellyfin theme based on [ElegantFin](https://github.com/lscambo13/ElegantFin) with custom purple branding and "BSyd" logo.

## ✨ Features

- **Based on ElegantFin v25.12.31** - Full styling parity with ElegantFin
- Custom purple color scheme (#692a8d)
- Custom "B" logo replacing Jellyfin branding
- "BSyd" text branding throughout
- Modern dark theme with glass-effect blur
- Rounded corners and smooth transitions
- Optimized Live TV guide
- Material Icons Round support
- Mobile and TV responsive design

## 👇 Installation

### Method 1: Custom CSS (Recommended)

Paste the following in your Jellyfin Custom CSS box:

```css
@import url("https://cdn.jsdelivr.net/gh/A20Digital/iptv-master@main/jellyfin-skins/blazeskin2/Theme/blazeskin2-jellyfin-theme-build-latest-minified.css");
```

### Method 2: Direct Raw URL

```css
@import url("https://raw.githubusercontent.com/A20Digital/iptv-master/main/jellyfin-skins/blazeskin2/Theme/blazeskin2-jellyfin-theme-build-latest-minified.css");
```

### Where to add Custom CSS

**Server-side (all users):**
1. Dashboard → General → Branding
2. Paste in Custom CSS box
3. Save

**Client-side (per user):**
1. Settings → Display
2. Paste in Custom CSS box
3. Save

## 🎨 Customization

### Change accent color

```css
:root {
    --uiAccentColor: #your-color;
    --uiAccentColorLight: #your-lighter-color;
}
```

### Adjust Live TV guide column width

```css
.guide-channelHeaderCell,
.channelPrograms {
    width: 5em; /* default is 4.42em */
}
```

### Enable library card labels

```css
:root {
    --libraryLabelVisibility: block;
}
```

### Show extra card buttons (favorite, played)

```css
:root {
    --extraCardButtonsVisibility: block;
}
```

### Custom login background

```css
:root {
    --loginPageBgUrl: url("YOUR-IMAGE-URL");
}
```

## 🆗 Tested On

- Jellyfin Server v10.11.5
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Jellyfin Android/iOS apps
- TV interfaces

## 📁 Files

```
blazeskin2/
├── Theme/
│   ├── blazeskin2-theme-v1.0.0.css                    # Full source
│   └── blazeskin2-jellyfin-theme-build-latest-minified.css  # Minified
├── skin.json
└── README.md
```

## 🎯 Color Palette

| Element | Color |
|---------|-------|
| Accent | `#692a8d` |
| Accent Light | `#8b4daf` |
| Background Dark | `#0f0a1a` |
| Background Light | `#1a1229` |
| Border | `rgb(75, 55, 100)` |
| Text | `rgb(220, 215, 230)` |
| Dim Text | `rgb(160, 150, 175)` |

## 📝 Credits

- Inspired by [ElegantFin](https://github.com/lscambo13/ElegantFin) by lscambo13
- Created by A20Labs

## 📄 License

MIT License
