// Load saved settings
let currentDatabases = [];
let editingDatabaseId = null;

// Database template definitions
const DATABASE_TEMPLATES = {
  default: {
    name: 'Default Template',
    fields: {
      Name: { type: 'title', aiField: 'original_text' },
      Translation: { type: 'rich_text', aiField: 'target_translation' },
      Type: { type: 'select', aiField: 'type' },
      Analysis: { type: 'rich_text', aiField: 'analysis' },
      Examples: { type: 'rich_text', aiField: 'examples' },
      Tags: { type: 'multi_select', aiField: 'tags' },
      URL: { type: 'url', aiField: 'url' }
    }
  },
  'japanese-vocabulary': {
    name: 'Japanese Vocabulary',
    fields: {
      '単語': { type: 'title', aiField: 'word' },
      '読み方': { type: 'rich_text', aiField: 'reading' },
      '意味': { type: 'rich_text', aiField: 'meaning' },
      'ステータス': { type: 'select', aiField: 'status', options: ['知らない単語・表現', '不慣れ', '普通'] },
      '例文': { type: 'rich_text', aiField: 'examples' }
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get([
    'geminiApiKey',
    'targetLanguage',
    'notionDatabases',
    'uiLanguage'
  ]);

  if (settings.geminiApiKey) {
    document.getElementById('geminiApiKey').value = settings.geminiApiKey;
  }
  
  if (settings.targetLanguage) {
    document.getElementById('targetLanguage').value = settings.targetLanguage;
  } else {
    document.getElementById('targetLanguage').value = 'English';
  }

  // Load Notion databases
  currentDatabases = settings.notionDatabases || [];
  renderDatabasesList();

  if (settings.uiLanguage) {
    document.getElementById('uiLanguage').value = settings.uiLanguage;
  } else {
    document.getElementById('uiLanguage').value = 'en';
  }

  // Update UI with current language
  updateUILanguage(settings.uiLanguage || 'en');
  
  // Load statistics
  await loadStatistics();
  
  // Add export/import event listeners
  document.getElementById('exportConfigBtn').addEventListener('click', handleExportConfig);
  document.getElementById('importConfigBtn').addEventListener('click', () => {
    document.getElementById('importConfigInput').click();
  });
  document.getElementById('importConfigInput').addEventListener('change', handleImportConfig);
});

// Save settings
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const geminiApiKey = document.getElementById('geminiApiKey').value.trim();
  const targetLanguage = document.getElementById('targetLanguage').value;
  const uiLanguage = document.getElementById('uiLanguage').value;

  if (!geminiApiKey) {
    showMessage(t('please_enter_api_key', uiLanguage), 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({
      geminiApiKey,
      targetLanguage,
      notionDatabases: currentDatabases,
      uiLanguage
    });

    // Update UI language immediately
    updateUILanguage(uiLanguage);

    showMessage(t('settings_saved', uiLanguage), 'success');
  } catch (error) {
    showMessage(t('failed_to_save', uiLanguage) + ': ' + error.message, 'error');
  }
});

// Reset settings
document.getElementById('resetBtn').addEventListener('click', async () => {
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  
  if (confirm(t('settings_reset_confirm', lang))) {
    document.getElementById('settingsForm').reset();
    document.getElementById('targetLanguage').value = 'English';
    document.getElementById('uiLanguage').value = 'en';
    showMessage(t('settings_reset_message', lang), 'success');
  }
});

// Show status message
function showMessage(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type} show`;

  setTimeout(() => {
    statusEl.classList.remove('show');
  }, 3000);
}

// Update UI language
function updateUILanguage(lang) {
  // Page title and heading
  document.querySelector('h1').textContent = t('settings_title', lang);
  document.querySelector('.subtitle').textContent = t('settings_subtitle', lang);

  // Form labels
  document.querySelector('label[for="geminiApiKey"]').innerHTML = `
    ${t('gemini_api_key', lang)}
    <span class="required">*</span>
  `;
  document.querySelector('#geminiApiKey').placeholder = t('gemini_api_key_placeholder', lang);
  document.querySelectorAll('.helper-text')[0].innerHTML = `
    ${t('gemini_api_key_helper', lang)} <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>
  `;

  document.querySelector('label[for="targetLanguage"]').innerHTML = `
    ${t('target_language', lang)}
    <span class="required">*</span>
  `;
  document.querySelectorAll('.helper-text')[1].textContent = t('target_language_helper', lang);

  document.querySelector('label[for="uiLanguage"]').textContent = t('ui_language', lang);
  document.querySelectorAll('.helper-text')[2].textContent = t('ui_language_helper', lang);

  // Update section titles
  const sectionTitles = document.querySelectorAll('.section-title');
  if (sectionTitles.length >= 3) {
    sectionTitles[0].textContent = '📊 ' + t('statistics', lang);
    sectionTitles[1].textContent = '💾 Backup & Restore';
    sectionTitles[2].textContent = '📝 ' + t('notion_integration', lang);
  }
  
  // Update stat labels
  const statLabels = document.querySelectorAll('.stat-label');
  if (statLabels.length >= 4) {
    statLabels[0].textContent = t('today', lang);
    statLabels[1].textContent = t('this_week', lang);
    statLabels[2].textContent = t('this_month', lang);
    statLabels[3].textContent = t('total_analyses', lang);
  }
  
  // Update backup buttons
  document.getElementById('exportConfigBtn').textContent = '📤 ' + t('export_config', lang);
  document.getElementById('importConfigBtn').textContent = '📥 ' + t('import_config', lang);
  
  // Buttons
  document.querySelector('.btn-primary').textContent = t('save_settings', lang);
  document.querySelector('#resetBtn').textContent = t('reset', lang);
  document.getElementById('addDatabaseBtn').textContent = '+ ' + t('add_database', lang);
  
  // Render databases list with new language
  renderDatabasesList();
  
  // Reload statistics with new language
  loadStatistics();
}

// Database Management Functions
async function renderDatabasesList() {
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  const container = document.getElementById('databasesList');
  
  if (currentDatabases.length === 0) {
    container.innerHTML = `
      <div class="no-databases">
        ${t('no_databases', lang)}
      </div>
    `;
    return;
  }
  
  container.innerHTML = currentDatabases.map(db => `
    <div class="database-card ${db.isDefault ? 'default' : ''}" data-id="${db.id}">
      <div class="database-header">
        <div class="database-title">
          ${escapeHtml(db.name)}
          ${db.isDefault ? `<span class="default-badge">${t('default_database', lang)}</span>` : ''}
        </div>
        <div class="database-actions">
          ${!db.isDefault ? `<button class="btn-small btn-set-default" data-action="setDefault" data-db-id="${db.id}">${t('set_default', lang)}</button>` : ''}
          <button class="btn-small btn-edit" data-action="edit" data-db-id="${db.id}">${t('edit_database', lang)}</button>
          <button class="btn-small btn-delete" data-action="delete" data-db-id="${db.id}">${t('delete_database', lang)}</button>
        </div>
      </div>
      <div class="database-info">
        ID: ${db.databaseId.substring(0, 8)}...
        <span class="database-template">📋 ${DATABASE_TEMPLATES[db.template || 'default']?.name || 'Default'}</span>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to buttons
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      const dbId = btn.dataset.dbId;
      
      if (action === 'edit') {
        editDatabase(dbId);
      } else if (action === 'delete') {
        await deleteDatabase(dbId);
      } else if (action === 'setDefault') {
        await setDefaultDatabase(dbId);
      }
    });
  });
}

// Add database button
document.getElementById('addDatabaseBtn').addEventListener('click', () => {
  editingDatabaseId = null;
  showDatabaseModal();
});

// Show database modal
async function showDatabaseModal() {
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  
  const modal = document.getElementById('databaseModal');
  const title = document.getElementById('modalTitle');
  const tokenInput = document.getElementById('modalToken');
  const databaseIdInput = document.getElementById('modalDatabaseId');
  const nameInput = document.getElementById('modalDatabaseName');
  const templateSelect = document.getElementById('modalTemplate');
  
  if (editingDatabaseId) {
    const db = currentDatabases.find(d => d.id === editingDatabaseId);
    title.textContent = t('edit_database', lang);
    tokenInput.value = db.token;
    databaseIdInput.value = db.databaseId;
    nameInput.value = db.name;
    templateSelect.value = db.template || 'default';
  } else {
    title.textContent = t('add_database', lang);
    tokenInput.value = '';
    databaseIdInput.value = '';
    nameInput.value = '';
    templateSelect.value = 'default';
  }
  
  modal.classList.add('show');
}

// Close modal
document.getElementById('modalCancel').addEventListener('click', () => {
  document.getElementById('databaseModal').classList.remove('show');
});

// Fetch database name when token and ID are entered
async function fetchDatabaseName() {
  const token = document.getElementById('modalToken').value.trim();
  const databaseId = document.getElementById('modalDatabaseId').value.trim();
  const nameInput = document.getElementById('modalDatabaseName');
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  
  if (token && databaseId && databaseId.length === 32) {
    nameInput.value = t('fetching_name', lang);
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getNotionDatabaseName',
        token: token,
        databaseId: databaseId
      });
      
      if (response.success) {
        nameInput.value = response.name;
      } else {
        nameInput.value = 'Error: ' + response.error;
      }
    } catch (error) {
      nameInput.value = 'Error: ' + error.message;
    }
  }
}

document.getElementById('modalToken').addEventListener('blur', fetchDatabaseName);
document.getElementById('modalDatabaseId').addEventListener('blur', fetchDatabaseName);

// Save database
document.getElementById('modalSave').addEventListener('click', async () => {
  const token = document.getElementById('modalToken').value.trim();
  const databaseId = document.getElementById('modalDatabaseId').value.trim();
  const name = document.getElementById('modalDatabaseName').value.trim();
  const template = document.getElementById('modalTemplate').value;
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  
  if (!token || !databaseId) {
    showMessage(t('please_enter_api_key', lang), 'error');
    return;
  }
  
  if (databaseId.length !== 32) {
    showMessage('Database ID must be 32 characters', 'error');
    return;
  }
  
  if (editingDatabaseId) {
    // Update existing database
    const index = currentDatabases.findIndex(d => d.id === editingDatabaseId);
    currentDatabases[index] = {
      ...currentDatabases[index],
      token,
      databaseId,
      name: name || 'Untitled Database',
      template: template || 'default'
    };
  } else {
    // Add new database
    const newDb = {
      id: Date.now().toString(),
      token,
      databaseId,
      name: name || 'Untitled Database',
      template: template || 'default',
      isDefault: currentDatabases.length === 0 // First database is default
    };
    currentDatabases.push(newDb);
  }
  
  // Save to storage
  await chrome.storage.sync.set({ notionDatabases: currentDatabases });
  
  // Close modal and refresh list
  document.getElementById('databaseModal').classList.remove('show');
  renderDatabasesList();
  showMessage(t('settings_saved', lang), 'success');
});

// Edit database
function editDatabase(id) {
  editingDatabaseId = id;
  showDatabaseModal();
}

// Delete database
async function deleteDatabase(id) {
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  
  if (confirm(t('delete_confirm', lang))) {
    currentDatabases = currentDatabases.filter(d => d.id !== id);
    
    // If deleted database was default, make first one default
    if (currentDatabases.length > 0 && !currentDatabases.some(d => d.isDefault)) {
      currentDatabases[0].isDefault = true;
    }
    
    await chrome.storage.sync.set({ notionDatabases: currentDatabases });
    renderDatabasesList();
    showMessage(t('settings_saved', lang), 'success');
  }
}

// Set default database
async function setDefaultDatabase(id) {
  currentDatabases.forEach(db => {
    db.isDefault = db.id === id;
  });
  
  await chrome.storage.sync.set({ notionDatabases: currentDatabases });
  renderDatabasesList();
  
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  showMessage(t('settings_saved', lang), 'success');
}

// Load and display statistics
async function loadStatistics() {
  const statsData = await chrome.storage.local.get(['statistics']);
  const stats = statsData.statistics || {
    totalAnalyses: 0,
    totalSaves: 0,
    dailyAnalyses: {},
    dailySaves: {}
  };
  
  const today = new Date().toISOString().split('T')[0];
  const todayCount = stats.dailyAnalyses[today] || 0;
  
  // Calculate week count
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  let weekCount = 0;
  Object.entries(stats.dailyAnalyses).forEach(([date, count]) => {
    if (new Date(date) >= weekStart) {
      weekCount += count;
    }
  });
  
  // Calculate month count
  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - 30);
  let monthCount = 0;
  Object.entries(stats.dailyAnalyses).forEach(([date, count]) => {
    if (new Date(date) >= monthStart) {
      monthCount += count;
    }
  });
  
  // Update UI
  document.getElementById('statTodayAnalyses').textContent = todayCount;
  document.getElementById('statWeekAnalyses').textContent = weekCount;
  document.getElementById('statMonthAnalyses').textContent = monthCount;
  document.getElementById('statTotalAnalyses').textContent = stats.totalAnalyses;
}

// Export configuration
async function handleExportConfig() {
  try {
    const syncData = await chrome.storage.sync.get(null);
    const localData = await chrome.storage.local.get(['analysisHistory', 'statistics']);
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings: syncData,
      history: localData.analysisHistory || [],
      statistics: localData.statistics || {}
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `selectwise-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    const settings = await chrome.storage.sync.get(['uiLanguage']);
    const lang = settings.uiLanguage || 'en';
    showMessage(t('config_exported', lang), 'success');
  } catch (error) {
    console.error('Export error:', error);
    showMessage('Export failed: ' + error.message, 'error');
  }
}

// Import configuration
async function handleImportConfig(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    // Validate import data
    if (!importData.version || !importData.settings) {
      throw new Error('Invalid configuration file');
    }
    
    // Ensure all databases have template field (for backward compatibility)
    if (importData.settings.notionDatabases) {
      importData.settings.notionDatabases = importData.settings.notionDatabases.map(db => ({
        ...db,
        template: db.template || 'default' // Add default template if missing
      }));
    }
    
    // Restore settings
    await chrome.storage.sync.set(importData.settings);
    
    // Restore history and statistics
    if (importData.history) {
      await chrome.storage.local.set({ analysisHistory: importData.history });
    }
    if (importData.statistics) {
      await chrome.storage.local.set({ statistics: importData.statistics });
    }
    
    // Reload page
    const lang = importData.settings.uiLanguage || 'en';
    showMessage(t('config_imported', lang), 'success');
    
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    console.error('Import error:', error);
    const settings = await chrome.storage.sync.get(['uiLanguage']);
    const lang = settings.uiLanguage || 'en';
    showMessage(t('invalid_config', lang), 'error');
  }
  
  // Clear file input
  e.target.value = '';
}

// Helper function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
