// Content script for SelectWise
let floatingIcon = null;
let analysisPanel = null;
let selectedText = '';
let selectionRange = null;
let currentUILang = 'en';

// Load UI language on startup
(async () => {
  const result = await chrome.storage.sync.get(['uiLanguage']);
  currentUILang = result.uiLanguage || 'en';
})();

// Listen for language changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.uiLanguage) {
    currentUILang = changes.uiLanguage.newValue || 'en';
  }
});

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

function handleTextSelection(e) {
  // Don't interfere with clicks inside our own UI
  if (e.target.closest('.selectwise-icon') || e.target.closest('.selectwise-panel')) {
    return;
  }

  const selection = window.getSelection();
  const text = selection.toString().trim();

  // Remove existing icon if no text is selected
  if (!text || text.length === 0) {
    removeFloatingIcon();
    return;
  }

  // Store selected text and range
  selectedText = text;
  selectionRange = selection.getRangeAt(0);

  // Show floating icon near the selection
  showFloatingIcon(e);
}

function showFloatingIcon(event) {
  removeFloatingIcon();

  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Create floating icon
  floatingIcon = document.createElement('div');
  floatingIcon.className = 'selectwise-icon';
  
  // Use Shadow DOM for style isolation
  const shadow = floatingIcon.attachShadow({ mode: 'open' });
  
  const style = document.createElement('style');
  style.textContent = `
    :host {
      position: fixed;
      z-index: 999999;
      cursor: pointer;
      animation: fadeInScale 0.2s ease-out;
      transition: opacity 0.15s ease-out, transform 0.15s ease-out;
    }
    
    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .icon-container {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: all 0.2s ease;
    }
    
    .icon-container:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
    }
    
    .icon-svg {
      width: 24px;
      height: 24px;
      color: white;
    }
  `;
  
  const container = document.createElement('div');
  container.className = 'icon-container';
  container.innerHTML = `
    <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  `;
  
  shadow.appendChild(style);
  shadow.appendChild(container);
  
  // Position the icon - ensure it stays within viewport
  const iconWidth = 40;
  const iconHeight = 40;
  const padding = 8;
  
  // Calculate initial position (to the right of selection)
  let iconX = rect.right + padding;
  let iconY = rect.top + (rect.height / 2) - (iconHeight / 2);
  
  // Adjust horizontal position if icon would be outside viewport
  const viewportWidth = window.innerWidth;
  if (iconX + iconWidth > viewportWidth - padding) {
    // Put it on the left side instead
    iconX = rect.left - iconWidth - padding;
  }
  
  // Ensure icon stays within horizontal bounds
  if (iconX < padding) {
    iconX = rect.right + padding; // Fallback to right side
    if (iconX + iconWidth > viewportWidth - padding) {
      iconX = viewportWidth - iconWidth - padding; // Stick to right edge
    }
  }
  
  // Adjust vertical position if icon would be outside viewport
  const viewportHeight = window.innerHeight;
  if (iconY < padding) {
    iconY = padding;
  } else if (iconY + iconHeight > viewportHeight - padding) {
    iconY = viewportHeight - iconHeight - padding;
  }
  
  // Use fixed positioning (no need for scrollX/scrollY)
  floatingIcon.style.left = `${iconX}px`;
  floatingIcon.style.top = `${iconY}px`;
  
  // Add click handler
  container.addEventListener('click', handleIconClick);
  
  document.body.appendChild(floatingIcon);
}

function removeFloatingIcon() {
  if (floatingIcon) {
    // Add fade-out animation
    floatingIcon.style.animation = 'fadeOut 0.15s ease-out';
    floatingIcon.style.opacity = '0';
    floatingIcon.style.transform = 'scale(0.5)';
    
    setTimeout(() => {
      if (floatingIcon) {
        floatingIcon.remove();
        floatingIcon = null;
      }
    }, 150);
  }
}

function handleIconClick(e) {
  e.stopPropagation();
  removeFloatingIcon();
  
  // Create and show analysis panel
  if (!selectedText) return;
  
  showAnalysisPanel();
  
  // Send message to background script to analyze text
  chrome.runtime.sendMessage({
    action: 'analyzeText',
    text: selectedText,
    url: window.location.href
  }, (response) => {
    if (response.error) {
      updatePanelWithError(response.error);
    } else {
      updatePanelWithResults(response.data);
    }
  });
}

function showAnalysisPanel() {
  // Remove existing panel if any
  if (analysisPanel) {
    analysisPanel.remove();
  }

  analysisPanel = document.createElement('div');
  analysisPanel.className = 'selectwise-panel';
  
  // Use Shadow DOM for style isolation
  const shadow = analysisPanel.attachShadow({ mode: 'open' });
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = getPanelStyles();
  shadow.appendChild(style);
  
  // Add HTML content
  const container = document.createElement('div');
  container.className = 'panel-container';
  container.innerHTML = getPanelHTML();
  shadow.appendChild(container);
  
  // Position panel
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    analysisPanel.style.position = 'fixed';
    
    // Center the panel on screen
    const panelWidth = 480;
    const panelHeight = 600;
    analysisPanel.style.left = `${(window.innerWidth - panelWidth) / 2}px`;
    analysisPanel.style.top = `${Math.max(20, (window.innerHeight - panelHeight) / 2)}px`;
    analysisPanel.style.zIndex = '999999';
  }
  
  document.body.appendChild(analysisPanel);
  
  // Add event listeners
  setupPanelEventListeners(shadow);
  
  // Make panel draggable
  makeDraggable(analysisPanel, shadow.querySelector('.panel-header'));
}

function getPanelStyles() {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :host {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .panel-container {
      width: 480px;
      max-height: 80vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .panel-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }
    
    .panel-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    .panel-content {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #6b7280;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .error-message {
      background: #fee2e2;
      color: #991b1b;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #fca5a5;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .section:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .original-text {
      background: #f9fafb;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 3px solid #667eea;
      font-size: 15px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .translation {
      font-size: 15px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .analysis-content {
      background: #f0fdf4;
      padding: 12px 16px;
      border-radius: 8px;
      color: #166534;
      line-height: 1.6;
    }
    
    .markdown-content p {
      margin: 0 0 8px 0;
    }
    
    .markdown-content p:last-child {
      margin-bottom: 0;
    }
    
    .markdown-content strong {
      font-weight: 600;
      color: #065f46;
    }
    
    .markdown-content em {
      font-style: italic;
    }
    
    .markdown-content code {
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }
    
    .markdown-content a {
      color: #0ea5e9;
      text-decoration: none;
    }
    
    .markdown-content a:hover {
      text-decoration: underline;
    }
    
    .markdown-content ul {
      margin: 8px 0;
      padding-left: 20px;
    }
    
    .markdown-content li {
      margin: 4px 0;
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .tag {
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .examples-list, .vocabulary-list {
      list-style: none;
    }
    
    .examples-list li, .vocabulary-list li {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .examples-list li:last-child, .vocabulary-list li:last-child {
      border-bottom: none;
    }
    
    .panel-footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
    }
    
    .btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-1px);
    }
    
    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }
    
    .save-status {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
      margin-top: 8px;
      display: none;
    }
    
    .save-status.success {
      background: #d1fae5;
      color: #065f46;
    }
    
    .save-status.error {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .save-status.show {
      display: block;
    }
  `;
}

function getPanelHTML() {
  return `
    <div class="panel-header">
      <div class="panel-title">
        <span>⚡</span>
        <span>${t('panel_title', currentUILang)}</span>
      </div>
      <button class="close-btn" id="closeBtn">✕</button>
    </div>
    <div class="panel-content" id="panelContent">
      <div class="loading">
        <div class="spinner"></div>
        <p>${t('analyzing', currentUILang)}</p>
      </div>
    </div>
    <div class="panel-footer" id="panelFooter" style="display: none;">
      <button class="btn btn-primary" id="saveToNotion">${t('save_to_notion', currentUILang)}</button>
      <div class="save-status" id="saveStatus"></div>
    </div>
  `;
}

function setupPanelEventListeners(shadow) {
  const closeBtn = shadow.getElementById('closeBtn');
  const saveBtn = shadow.getElementById('saveToNotion');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (analysisPanel) {
        analysisPanel.remove();
        analysisPanel = null;
      }
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveToNotion);
  }
}

function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function updatePanelWithResults(data) {
  if (!analysisPanel) return;
  
  const shadow = analysisPanel.shadowRoot;
  const content = shadow.getElementById('panelContent');
  const footer = shadow.getElementById('panelFooter');
  
  content.innerHTML = `
    <div class="section">
      <div class="section-title">${t('original_text', currentUILang)}</div>
      <div class="original-text">${escapeHtml(data.original_text)}</div>
    </div>
    
    <div class="section">
      <div class="section-title">${t('translation', currentUILang)}</div>
      <div class="translation">${escapeHtml(data.target_translation)}</div>
    </div>
    
    <div class="section">
      <div class="section-title">${t('analysis', currentUILang)}</div>
      <div class="analysis-content markdown-content">${renderMarkdown(data.analysis)}</div>
    </div>
    
    ${data.tags && data.tags.length > 0 ? `
      <div class="section">
        <div class="section-title">${t('tags', currentUILang)}</div>
        <div class="tags-container">
          ${data.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
    ` : ''}
    
    ${data.examples && data.examples.length > 0 ? `
      <div class="section">
        <div class="section-title">${t('examples', currentUILang)}</div>
        <ul class="examples-list">
          ${data.examples.map(ex => `<li>${escapeHtml(ex)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${data.related_vocabulary && data.related_vocabulary.length > 0 ? `
      <div class="section">
        <div class="section-title">${t('related_vocabulary', currentUILang)}</div>
        <ul class="vocabulary-list">
          ${data.related_vocabulary.map(word => `<li>${escapeHtml(word)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `;
  
  // Store the data for saving to Notion
  analysisPanel.dataset.analysisData = JSON.stringify(data);
  
  // Show footer with save button
  footer.style.display = 'flex';
  footer.style.flexDirection = 'column';
}

function updatePanelWithError(error) {
  if (!analysisPanel) return;
  
  const shadow = analysisPanel.shadowRoot;
  const content = shadow.getElementById('panelContent');
  
  content.innerHTML = `
    <div class="error-message">
      <strong>${t('error', currentUILang)}:</strong> ${escapeHtml(error)}
    </div>
  `;
}

function handleSaveToNotion() {
  if (!analysisPanel) return;
  
  const shadow = analysisPanel.shadowRoot;
  const statusEl = shadow.getElementById('saveStatus');
  const saveBtn = shadow.getElementById('saveToNotion');
  
  const dataStr = analysisPanel.dataset.analysisData;
  if (!dataStr) return;
  
  const data = JSON.parse(dataStr);
  
  saveBtn.disabled = true;
  statusEl.textContent = t('saving', currentUILang);
  statusEl.className = 'save-status show';
  
  chrome.runtime.sendMessage({
    action: 'saveToNotion',
    data: data,
    url: window.location.href
  }, (response) => {
    saveBtn.disabled = false;
    
    if (response.success) {
      statusEl.textContent = '✓ ' + t('saved_successfully', currentUILang);
      statusEl.className = 'save-status success show';
    } else {
      statusEl.textContent = '✗ ' + (response.error || t('failed_to_save', currentUILang));
      statusEl.className = 'save-status error show';
    }
    
    setTimeout(() => {
      statusEl.classList.remove('show');
    }, 3000);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for clicks outside to close panel
document.addEventListener('mousedown', (e) => {
  if (analysisPanel && !e.target.closest('.selectwise-panel') && !e.target.closest('.selectwise-icon')) {
    const clickedInsidePanel = analysisPanel.shadowRoot.contains(e.target);
    if (!clickedInsidePanel) {
      analysisPanel.remove();
      analysisPanel = null;
    }
  }
});
