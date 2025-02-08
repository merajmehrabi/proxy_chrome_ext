// Constants
const STORAGE_KEYS = {
  PROXIES: 'proxies',
  PATTERNS: 'patterns',
  ENABLED: 'enabled',
  BLACKLIST_MODE: 'blacklistMode'
};

// DOM Elements
const elements = {
  enableToggle: document.getElementById('enableToggle'),
  modeToggle: document.getElementById('modeToggle'),
  proxyList: document.getElementById('proxyList'),
  patternList: document.getElementById('patternList'),
  addProxyBtn: document.getElementById('addProxyBtn'),
  addPatternBtn: document.getElementById('addPatternBtn'),
  proxyModal: document.getElementById('proxyModal'),
  patternModal: document.getElementById('patternModal'),
  proxyForm: document.getElementById('proxyForm'),
  patternForm: document.getElementById('patternForm'),
  cancelProxyBtn: document.getElementById('cancelProxyBtn'),
  cancelPatternBtn: document.getElementById('cancelPatternBtn'),
  proxySelect: document.getElementById('proxySelect'),
  bypassToggle: document.getElementById('bypassToggle')
};

// State
let currentState = {
  enabled: true,
  blacklistMode: false,
  proxies: [],
  patterns: []
};

let editingId = null;

// Utility Functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showModal(modal) {
  modal.classList.add('active');
}

function hideModal(modal) {
  modal.classList.remove('active');
  editingId = null;
}

// UI Rendering Functions
function renderProxyList() {
  elements.proxyList.innerHTML = currentState.proxies.map(proxy => `
    <div class="list-item" data-id="${proxy.id}">
      <div class="item-info">
        <strong>${proxy.name}</strong>
        <div>${proxy.type.toUpperCase()} - ${proxy.host}:${proxy.port}</div>
      </div>
      <div class="item-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderPatternList() {
  elements.patternList.innerHTML = currentState.patterns.map(pattern => `
    <div class="list-item" data-id="${pattern.id}">
      <div class="item-info">
        <strong>${pattern.name}</strong>
        <div>${pattern.urlPattern}</div>
        <div>
          ${pattern.bypass ? 
            '<span class="bypass-badge">Bypass</span>' : 
            `Proxy: ${currentState.proxies.find(p => p.id === pattern.proxyId)?.name || 'Not found'}`
          }
        </div>
      </div>
      <div class="item-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    </div>
  `).join('');
}

function updateProxySelect() {
  elements.proxySelect.innerHTML = currentState.proxies.map(proxy =>
    `<option value="${proxy.id}">${proxy.name}</option>`
  ).join('');
}

// Event Delegation Handlers
elements.proxyList.addEventListener('click', (e) => {
  const listItem = e.target.closest('.list-item');
  if (!listItem) return;
  
  const id = listItem.dataset.id;
  
  if (e.target.classList.contains('edit-btn')) {
    editProxy(id);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteProxy(id);
  }
});

elements.patternList.addEventListener('click', (e) => {
  const listItem = e.target.closest('.list-item');
  if (!listItem) return;
  
  const id = listItem.dataset.id;
  
  if (e.target.classList.contains('edit-btn')) {
    editPattern(id);
  } else if (e.target.classList.contains('delete-btn')) {
    deletePattern(id);
  }
});

// Event Handlers
function editProxy(id) {
  const proxy = currentState.proxies.find(p => p.id === id);
  if (!proxy) return;

  editingId = id;
  elements.proxyForm.proxyName.value = proxy.name;
  elements.proxyForm.proxyType.value = proxy.type;
  elements.proxyForm.proxyHost.value = proxy.host;
  elements.proxyForm.proxyPort.value = proxy.port;
  elements.proxyForm.proxyUsername.value = proxy.username || '';
  elements.proxyForm.proxyPassword.value = proxy.password || '';
  
  showModal(elements.proxyModal);
}

async function deleteProxy(id) {
  if (!confirm('Are you sure you want to delete this proxy?')) return;
  
  currentState.proxies = currentState.proxies.filter(p => p.id !== id);
  // Remove associated patterns
  currentState.patterns = currentState.patterns.filter(p => p.proxyId !== id);
  
  await saveState();
  renderUI();
}

function editPattern(id) {
  const pattern = currentState.patterns.find(p => p.id === id);
  if (!pattern) return;

  editingId = id;
  elements.patternForm.patternName.value = pattern.name;
  elements.patternForm.urlPattern.value = pattern.urlPattern;
  elements.patternForm.proxySelect.value = pattern.proxyId;
  if (elements.bypassToggle) {
    elements.bypassToggle.checked = pattern.bypass || false;
  }
  
  showModal(elements.patternModal);
}

async function deletePattern(id) {
  if (!confirm('Are you sure you want to delete this pattern?')) return;
  
  currentState.patterns = currentState.patterns.filter(p => p.id !== id);
  await saveState();
  renderUI();
}

// Form Handlers
elements.proxyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const proxyData = {
    id: editingId || generateId(),
    name: e.target.proxyName.value,
    type: e.target.proxyType.value,
    host: e.target.proxyHost.value,
    port: parseInt(e.target.proxyPort.value),
    username: e.target.proxyUsername.value || null,
    password: e.target.proxyPassword.value || null
  };

  if (editingId) {
    currentState.proxies = currentState.proxies.map(p =>
      p.id === editingId ? proxyData : p
    );
  } else {
    currentState.proxies.push(proxyData);
  }

  await saveState();
  hideModal(elements.proxyModal);
  renderUI();
  e.target.reset();
});

elements.patternForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const patternData = {
    id: editingId || generateId(),
    name: e.target.patternName.value,
    urlPattern: e.target.urlPattern.value,
    proxyId: e.target.proxySelect.value,
    bypass: elements.bypassToggle ? elements.bypassToggle.checked : false
  };

  if (editingId) {
    currentState.patterns = currentState.patterns.map(p =>
      p.id === editingId ? patternData : p
    );
  } else {
    currentState.patterns.push(patternData);
  }

  await saveState();
  hideModal(elements.patternModal);
  renderUI();
  e.target.reset();
});

// Modal Controls
elements.addProxyBtn.addEventListener('click', () => {
  elements.proxyForm.reset();
  showModal(elements.proxyModal);
});

elements.addPatternBtn.addEventListener('click', () => {
  elements.patternForm.reset();
  showModal(elements.patternModal);
});

elements.cancelProxyBtn.addEventListener('click', () => {
  hideModal(elements.proxyModal);
});

elements.cancelPatternBtn.addEventListener('click', () => {
  hideModal(elements.patternModal);
});

// Global Controls
elements.enableToggle.addEventListener('change', async (e) => {
  currentState.enabled = e.target.checked;
  await saveState();
});

if (elements.modeToggle) {
  elements.modeToggle.addEventListener('change', async (e) => {
    currentState.blacklistMode = e.target.checked;
    await saveState();
  });
}

// State Management
async function loadState() {
  try {
    // Get all settings from storage directly
    const data = await chrome.storage.sync.get(null);
    currentState = {
      enabled: data[STORAGE_KEYS.ENABLED] ?? true,
      blacklistMode: data[STORAGE_KEYS.BLACKLIST_MODE] ?? false,
      proxies: data[STORAGE_KEYS.PROXIES] ?? [],
      patterns: data[STORAGE_KEYS.PATTERNS] ?? []
    };
    renderUI();
  } catch (error) {
    console.error('Failed to load state:', error);
    showError('Failed to load settings');
  }
}

async function saveState() {
  try {
    // Save settings directly to storage
    await chrome.storage.sync.set({
      [STORAGE_KEYS.ENABLED]: currentState.enabled,
      [STORAGE_KEYS.BLACKLIST_MODE]: currentState.blacklistMode,
      [STORAGE_KEYS.PROXIES]: currentState.proxies,
      [STORAGE_KEYS.PATTERNS]: currentState.patterns
    });

    // Notify service worker of changes
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      data: currentState
    });
  } catch (error) {
    console.error('Failed to save state:', error);
    showError('Failed to save settings');
  }
}

function renderUI() {
  elements.enableToggle.checked = currentState.enabled;
  if (elements.modeToggle) {
    elements.modeToggle.checked = currentState.blacklistMode;
  }
  renderProxyList();
  renderPatternList();
  updateProxySelect();
}

// Error Handling
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'status-message error';
  errorDiv.textContent = message;
  document.body.insertBefore(errorDiv, document.body.firstChild);
  setTimeout(() => errorDiv.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', loadState);
