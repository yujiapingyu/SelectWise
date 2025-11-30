// Load saved settings
let currentDatabases = [];
let editingDatabaseId = null;

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

  // Notion section
  document.querySelector('.section-title').textContent = t('notion_integration', lang);
  
  // Buttons
  document.querySelector('.btn-primary').textContent = t('save_settings', lang);
  document.querySelector('#resetBtn').textContent = t('reset', lang);
  document.getElementById('addDatabaseBtn').textContent = '+ ' + t('add_database', lang);
  
  // Render databases list with new language
  renderDatabasesList();
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
  
  if (editingDatabaseId) {
    const db = currentDatabases.find(d => d.id === editingDatabaseId);
    title.textContent = t('edit_database', lang);
    tokenInput.value = db.token;
    databaseIdInput.value = db.databaseId;
    nameInput.value = db.name;
  } else {
    title.textContent = t('add_database', lang);
    tokenInput.value = '';
    databaseIdInput.value = '';
    nameInput.value = '';
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
      name: name || 'Untitled Database'
    };
  } else {
    // Add new database
    const newDb = {
      id: Date.now().toString(),
      token,
      databaseId,
      name: name || 'Untitled Database',
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

// Helper function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
