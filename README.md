# Smart Proxy Router Chrome Extension

A Chrome extension that allows selective routing of web traffic through different proxy servers based on URL patterns. Configure multiple proxy servers (SOCKS5 and HTTP) and create custom routing rules using URL patterns.

## Features

- Support for both SOCKS5 and HTTP proxies
- URL pattern-based routing using regular expressions
- Easy-to-use popup interface for configuration
- Enable/disable proxy routing with a single click
- Secure storage of proxy credentials
- Cross-device settings sync

## Installation

### Development Installation

1. Clone this repository:
   ```bash
   git clone [repository-url]
   cd proxy_chrome_ext
   ```

2. Add icon files:
   - Create icons as specified in `utils/ICONS_README.md`
   - Place them in the `icons` directory:
     - icon-16.png (16x16)
     - icon-48.png (48x48)
     - icon-128.png (128x128)

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension directory

## Usage

### Adding a Proxy Server

1. Click the extension icon in Chrome's toolbar
2. Click "Add Proxy Server"
3. Fill in the proxy details:
   - Name: A memorable name for the proxy
   - Type: Choose SOCKS5 or HTTP
   - Host: The proxy server host
   - Port: The proxy server port
   - Username/Password: Optional authentication credentials

### Creating Routing Rules

1. Click "Add URL Pattern"
2. Configure the pattern:
   - Name: A descriptive name for the rule
   - URL Pattern: A regular expression to match URLs
   - Proxy: Select which proxy to use for matched URLs
3. Click "Save" to activate the rule

### Managing Rules and Proxies

- Use the toggle switch to enable/disable proxy routing
- Edit or delete existing proxies and patterns using the buttons
- Changes are automatically saved and synced across devices

### Example Patterns

- Match exact domain: `^https?://example\.com/.*`
- Match subdomains: `^https?://.*\.example\.com/.*`
- Match multiple domains: `^https?://(site1|site2)\.com/.*`

## Troubleshooting

### Common Issues

1. Proxy Connection Failed
   - Verify proxy server details are correct
   - Check if proxy server is online
   - Ensure authentication credentials are valid

2. Pattern Not Matching
   - Test your regex pattern on a regex testing site
   - Ensure pattern follows JavaScript regex syntax
   - Check for common regex mistakes (escaping dots, etc.)

3. Extension Not Working
   - Verify extension is enabled
   - Check Chrome's console for error messages
   - Try disabling and re-enabling the extension

## Privacy & Security

- Proxy credentials are stored securely using Chrome's storage API
- All proxy routing is handled locally within the browser
- No data is sent to external servers
- Regular expressions are evaluated locally

## Development

### Project Structure

```
proxy_chrome_ext/
├── manifest.json           # Extension configuration
├── background/
│   └── service-worker.js   # Background proxy handling
├── popup/
│   ├── popup.html         # Popup interface
│   ├── popup.css          # Styles
│   └── popup.js           # UI logic
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── utils/
    └── ICONS_README.md    # Icon specifications
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues, questions, or contributions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Follow the contribution guidelines

## Acknowledgments

- Chrome Extension API Documentation
- Chrome Proxy API
- Regular Expression resources
