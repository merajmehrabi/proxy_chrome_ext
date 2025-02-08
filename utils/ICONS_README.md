# Extension Icons

To complete the extension setup, you need to add icon files in the following sizes:

Required icon files:
- `icons/icon-16.png` (16x16 pixels)
- `icons/icon-48.png` (48x48 pixels)
- `icons/icon-128.png` (128x128 pixels)

## Icon Design Guidelines

1. Create a simple, recognizable icon that represents a proxy routing system
2. Use a consistent design across all sizes
3. Include a network/routing symbol to indicate the extension's purpose
4. Use appropriate padding around the icon
5. Test visibility at smaller sizes

## Creating Icons

You can create these icons using any image editing software (e.g., Photoshop, GIMP, Figma) and save them in PNG format with the following specifications:

- Format: PNG
- Color space: RGB
- Background: Transparent
- Dimensions: Exactly 16x16, 48x48, and 128x128 pixels

## Icon Placement

Place the icon files in the `icons` directory with the exact filenames specified in the manifest.json:

```
proxy_chrome_ext/
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

These icons are referenced in the manifest.json file and will be used by Chrome in various contexts:
- 16x16: Favicon, extension list
- 48x48: Extension management page
- 128x128: Chrome Web Store and installation
