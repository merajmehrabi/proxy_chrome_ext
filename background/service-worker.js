// Service worker for Smart Proxy Router

// Constants for proxy types and storage keys
const PROXY_TYPES = {
  SOCKS5: 'socks5',
  HTTP: 'http'
};

const STORAGE_KEYS = {
  PROXIES: 'proxies',
  PATTERNS: 'patterns',
  ENABLED: 'enabled',
  BLACKLIST_MODE: 'blacklistMode'
};

// Initialize storage with default values
chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    [STORAGE_KEYS.PROXIES]: [],
    [STORAGE_KEYS.PATTERNS]: [],
    [STORAGE_KEYS.ENABLED]: true,
    [STORAGE_KEYS.BLACKLIST_MODE]: false
  };
  
  await chrome.storage.sync.set(defaults);
});

// Helper function to find matching pattern for a URL
function findMatchingPattern(url, patterns) {
  return patterns.find(pattern => {
    try {
      const regex = new RegExp(pattern.urlPattern);
      return regex.test(url);
    } catch (e) {
      console.error('Invalid pattern:', pattern.urlPattern, e);
      return false;
    }
  });
}

// Helper function to create proxy configuration
function createProxyConfig(proxy) {
  if (!proxy) return { type: 'direct' };

  const config = {
    type: proxy.type,
    host: proxy.host,
    port: proxy.port
  };

  if (proxy.username && proxy.password) {
    config.username = proxy.username;
    config.password = proxy.password;
  }

  return config;
}

// Function to update proxy settings
async function updateProxySettings() {
  try {
    // Check if extension is enabled
    const { enabled } = await chrome.storage.sync.get(STORAGE_KEYS.ENABLED);
    if (!enabled) {
      await chrome.proxy.settings.clear({ scope: 'regular' });
      return;
    }

    // Get patterns, proxies, and mode from storage
    const { patterns, proxies, blacklistMode } = await chrome.storage.sync.get([
      STORAGE_KEYS.PATTERNS,
      STORAGE_KEYS.PROXIES,
      STORAGE_KEYS.BLACKLIST_MODE
    ]);

    // Create proxy rules based on mode and bypass settings
    const rules = {
      proxyRules: patterns.map(pattern => {
        // Skip if pattern is invalid
        if (!pattern.urlPattern) return null;

        // For bypass patterns, return direct connection
        if (pattern.bypass) {
          return {
            condition: { urlFilter: pattern.urlPattern, resourceTypes: ['main_frame'] },
            proxyConfig: { type: 'direct' }
          };
        }

        // Find associated proxy
        const proxy = proxies.find(p => p.id === pattern.proxyId);
        if (!proxy) return null;

        return {
          condition: { urlFilter: pattern.urlPattern, resourceTypes: ['main_frame'] },
          proxyConfig: createProxyConfig(proxy)
        };
      }).filter(rule => rule !== null)
    };

    // Default proxy for blacklist mode
    const defaultProxy = blacklistMode && proxies.length > 0 ? 
      createProxyConfig(proxies[0]) : 
      { type: 'direct' };

    // Set the proxy settings with blacklist/whitelist logic
    await chrome.proxy.settings.set({
      value: {
        mode: 'pac_script',
        pacScript: {
          data: `
            function FindProxyForURL(url, host) {
              const rules = ${JSON.stringify(rules.proxyRules)};
              const blacklistMode = ${blacklistMode};
              const defaultProxy = ${JSON.stringify(defaultProxy)};
              
              for (const rule of rules) {
                const regex = new RegExp(rule.condition.urlFilter);
                if (regex.test(url)) {
                  if (rule.proxyConfig.type === 'direct') {
                    return 'DIRECT';
                  }
                  return \`PROXY \${rule.proxyConfig.host}:\${rule.proxyConfig.port}\`;
                }
              }
              
              // In blacklist mode, use default proxy if no rules match
              // In whitelist mode, use direct connection if no rules match
              if (blacklistMode && defaultProxy.type !== 'direct') {
                return \`PROXY \${defaultProxy.host}:\${defaultProxy.port}\`;
              }
              
              return 'DIRECT';
            }
          `
        }
      },
      scope: 'regular'
    });
  } catch (error) {
    console.error('Proxy configuration error:', error);
    await chrome.proxy.settings.clear({ scope: 'regular' });
  }
}

// Listen for storage changes to update proxy settings
chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEYS.ENABLED] || 
      changes[STORAGE_KEYS.BLACKLIST_MODE] ||
      changes[STORAGE_KEYS.PATTERNS] || 
      changes[STORAGE_KEYS.PROXIES]) {
    updateProxySettings();
  }
});

// Initialize proxy settings when extension loads
updateProxySettings();

// Handle proxy authentication
chrome.webRequest.onAuthRequired.addListener(
  async (details) => {
    if (!details.isProxy) return {};

    try {
      const { proxies } = await chrome.storage.sync.get(STORAGE_KEYS.PROXIES);
      const proxy = proxies.find(p => 
        p.host === details.challenger.host && 
        p.port === details.challenger.port
      );

      if (proxy && proxy.username && proxy.password) {
        return {
          authCredentials: {
            username: proxy.username,
            password: proxy.password
          }
        };
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
    return {};
  },
  { urls: ['<all_urls>'] },
  ['asyncBlocking']
);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_STATUS':
      chrome.storage.sync.get(null, (data) => {
        sendResponse({
          enabled: data[STORAGE_KEYS.ENABLED],
          blacklistMode: data[STORAGE_KEYS.BLACKLIST_MODE],
          proxies: data[STORAGE_KEYS.PROXIES],
          patterns: data[STORAGE_KEYS.PATTERNS]
        });
      });
      return true;

    case 'UPDATE_SETTINGS':
      chrome.storage.sync.set(message.data, () => {
        sendResponse({ success: true });
      });
      return true;
  }
});
