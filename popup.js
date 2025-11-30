// Load UI language and update popup
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  updatePopupUI(lang);
});

// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  // Load UI language
  const settings = await chrome.storage.sync.get(['uiLanguage']);
  const lang = settings.uiLanguage || 'en';
  
  // Update UI text
  document.getElementById('popup-title').textContent = 'SelectWise';
  document.getElementById('popup-subtitle').textContent = t('popup_subtitle', lang);
  document.getElementById('popup-instruction').textContent = t('popup_instruction', lang);
  document.getElementById('feature-1').textContent = t('popup_feature_1', lang);
  document.getElementById('feature-2').textContent = t('popup_feature_2', lang);
  document.getElementById('feature-3').textContent = t('popup_feature_3', lang);
  document.getElementById('feature-4').textContent = t('popup_feature_4', lang);
  document.getElementById('settingsBtn').textContent = '⚙️ ' + t('open_settings', lang);
  document.getElementById('historyBtn').textContent = '📜 ' + t('history', lang);
  document.getElementById('popup-footer').textContent = t('popup_footer', lang);
});

document.getElementById('historyBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'history.html' });
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Update popup UI with translations
function updatePopupUI(lang) {
  document.getElementById('popup-subtitle').textContent = t('popup_subtitle', lang);
  document.getElementById('popup-instruction').textContent = t('popup_instruction', lang);
  document.getElementById('feature-1').textContent = t('feature_translation', lang);
  document.getElementById('feature-2').textContent = t('feature_analysis', lang);
  document.getElementById('feature-3').textContent = t('feature_examples', lang);
  document.getElementById('feature-4').textContent = t('feature_notion', lang);
  document.getElementById('settingsBtn').textContent = t('open_settings', lang);
  document.getElementById('popup-footer').textContent = t('popup_footer', lang);
}
