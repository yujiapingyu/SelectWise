// History page logic
let currentUILang = 'en';
let allHistory = [];
let filteredHistory = [];

// Load UI language and history on startup
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  currentUILang = settings.uiLanguage || 'en';
  
  updateUILanguage();
  await loadHistory();
  
  // Event listeners
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('clearAllBtn').addEventListener('click', handleClearAll);
  document.getElementById('exportBtn').addEventListener('click', handleExport);
});

// Update UI language
function updateUILanguage() {
  document.querySelector('h1').textContent = '📜 ' + t('history', currentUILang);
  document.getElementById('searchInput').placeholder = t('search_history', currentUILang);
  document.getElementById('clearAllBtn').textContent = t('clear_all', currentUILang);
  document.getElementById('exportBtn').textContent = t('export_history', currentUILang);
  
  // Update info banner
  const infoBanner = document.querySelector('.info-banner-text');
  if (infoBanner) {
    infoBanner.innerHTML = `
      <strong>${t('history_policy', currentUILang)}:</strong> 
      ${t('history_policy_desc', currentUILang)}
    `;
  }
}

// Load history from storage
async function loadHistory() {
  const data = await chrome.storage.local.get(['analysisHistory']);
  allHistory = data.analysisHistory || [];
  filteredHistory = [...allHistory];
  renderHistory();
}

// Render history list
function renderHistory() {
  const container = document.getElementById('historyList');
  
  if (filteredHistory.length === 0) {
    container.innerHTML = `
      <div class="no-history">
        <div class="no-history-icon">📭</div>
        <p>${t('no_history', currentUILang)}</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredHistory.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="item-header">
        <div class="item-meta">
          <div class="item-time">${formatTime(item.timestamp)}</div>
          ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" class="item-url">${escapeHtml(item.url)}</a>` : ''}
        </div>
        <div class="item-actions">
          <button class="btn btn-small btn-primary" data-action="save" data-id="${item.id}">
            ${t('save_again', currentUILang)}
          </button>
          <button class="btn btn-small btn-danger" data-action="delete" data-id="${item.id}">
            ${t('delete_item', currentUILang)}
          </button>
        </div>
      </div>
      
      <div class="original-text">${escapeHtml(item.original_text || item.originalText)}</div>
      
      ${item.target_translation ? `
        <div class="translation">
          <strong>${t('translation', currentUILang)}:</strong> ${escapeHtml(item.target_translation)}
        </div>
      ` : ''}
      
      ${item.tags && item.tags.length > 0 ? `
        <div class="tags">
          ${item.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      
      ${item.analysis ? `
        <div class="analysis-section">
          <button class="analysis-toggle" data-id="${item.id}">
            <span class="analysis-toggle-icon">▶</span>
            <span>${t('analysis', currentUILang)}</span>
          </button>
          <div class="analysis-content" id="analysis-${item.id}">
            ${escapeHtml(item.analysis)}
            ${item.examples && item.examples.length > 0 ? `
              <div class="examples-section">
                <div class="examples-title">${t('examples', currentUILang)}:</div>
                ${item.examples.map(ex => `<div class="example-item">${escapeHtml(ex)}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');
  
  // Add event listeners to action buttons
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleItemAction);
  });
  
  // Add event listeners to analysis toggles
  container.querySelectorAll('.analysis-toggle').forEach(btn => {
    btn.addEventListener('click', handleToggleAnalysis);
  });
}

// Handle item actions (save/delete)
async function handleItemAction(e) {
  const action = e.target.dataset.action;
  const itemId = e.target.dataset.id;
  const item = allHistory.find(h => h.id === itemId);
  
  if (!item) return;
  
  if (action === 'delete') {
    if (confirm(t('delete_confirm', currentUILang))) {
      await deleteItem(itemId);
    }
  } else if (action === 'save') {
    await saveToNotion(item);
  }
}

// Handle toggle analysis
function handleToggleAnalysis(e) {
  const btn = e.currentTarget;
  const itemId = btn.dataset.id;
  const content = document.getElementById(`analysis-${itemId}`);
  
  if (content) {
    content.classList.toggle('show');
    btn.classList.toggle('expanded');
  }
}

// Delete history item
async function deleteItem(itemId) {
  allHistory = allHistory.filter(h => h.id !== itemId);
  filteredHistory = filteredHistory.filter(h => h.id !== itemId);
  
  await chrome.storage.local.set({ analysisHistory: allHistory });
  renderHistory();
  showMessage(t('settings_saved', currentUILang), 'success');
}

// Save item to Notion
async function saveToNotion(item) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveToNotion',
      data: item,
      url: item.url
    });
    
    if (response.success) {
      showMessage(t('saved_success', currentUILang), 'success');
    } else {
      showMessage(response.error || t('failed_to_save', currentUILang), 'error');
    }
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Handle search
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    filteredHistory = [...allHistory];
  } else {
    filteredHistory = allHistory.filter(item => {
      const originalText = (item.original_text || item.originalText || '').toLowerCase();
      const translation = (item.target_translation || '').toLowerCase();
      const tags = (item.tags || []).join(' ').toLowerCase();
      
      return originalText.includes(query) || 
             translation.includes(query) || 
             tags.includes(query);
    });
  }
  
  renderHistory();
}

// Handle clear all
async function handleClearAll() {
  if (!confirm(t('delete_confirm', currentUILang))) return;
  
  allHistory = [];
  filteredHistory = [];
  
  await chrome.storage.local.set({ analysisHistory: [] });
  renderHistory();
  showMessage(t('settings_saved', currentUILang), 'success');
}

// Handle export
function handleExport() {
  const dataStr = JSON.stringify(allHistory, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `selectwise-history-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showMessage(t('config_exported', currentUILang), 'success');
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return t('today', currentUILang);
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} ${currentUILang === 'zh-CN' ? '分钟前' : 'min ago'}`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ${currentUILang === 'zh-CN' ? '小时前' : 'hours ago'}`;
  }
  
  // Format as date
  return date.toLocaleDateString(currentUILang === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Show status message
function showMessage(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type} show`;
  
  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 3000);
}

// HTML escape helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
