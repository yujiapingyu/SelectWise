// Load saved settings
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get([
    'geminiApiKey',
    'targetLanguage',
    'notionToken',
    'notionDatabaseId',
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

  if (settings.notionToken) {
    document.getElementById('notionToken').value = settings.notionToken;
  }

  if (settings.notionDatabaseId) {
    document.getElementById('notionDatabaseId').value = settings.notionDatabaseId;
  }

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
  const notionToken = document.getElementById('notionToken').value.trim();
  const notionDatabaseId = document.getElementById('notionDatabaseId').value.trim();
  const uiLanguage = document.getElementById('uiLanguage').value;

  if (!geminiApiKey) {
    showMessage(t('please_enter_api_key', uiLanguage), 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({
      geminiApiKey,
      targetLanguage,
      notionToken,
      notionDatabaseId,
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
  document.querySelector('label[for="notionToken"]').textContent = t('notion_token', lang);
  document.querySelector('#notionToken').placeholder = 'secret_xxxxxxxxxxxxxx';
  document.querySelectorAll('.helper-text')[3].innerHTML = `
    ${t('notion_token_helper', lang)} <a href="https://www.notion.so/my-integrations" target="_blank">Notion Integrations</a>
  `;

  document.querySelector('label[for="notionDatabaseId"]').textContent = t('notion_database_id', lang);
  document.querySelector('#notionDatabaseId').placeholder = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  document.querySelectorAll('.helper-text')[4].textContent = t('notion_database_id_helper', lang);
  
  // Add database structure info if it exists
  const structureHelperText = document.querySelectorAll('.helper-text')[5];
  if (structureHelperText) {
    structureHelperText.textContent = t('notion_database_structure', lang);
  }

  // Buttons
  document.querySelector('.btn-primary').textContent = t('save_settings', lang);
  document.querySelector('#resetBtn').textContent = t('reset', lang);
}
