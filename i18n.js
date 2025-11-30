// i18n translations for SelectWise
const translations = {
  'en': {
    // Panel
    'panel_title': 'SelectWise Analysis',
    'analyzing': 'Analyzing with AI...',
    'original_text': 'Original Text',
    'translation': 'Translation',
    'analysis': 'Analysis',
    'tags': 'Tags',
    'examples': 'Examples',
    'related_vocabulary': 'Related Vocabulary',
    'save_to_notion': 'Save to Notion',
    'saving': 'Saving...',
    'saved_success': '✓ Saved successfully!',
    'error': 'Error',
    
    // Settings
    'settings_title': 'SelectWise Settings',
    'settings_subtitle': 'Configure your API keys and preferences',
    'gemini_api_key': 'Gemini API Key',
    'gemini_api_key_required': 'Gemini API Key',
    'gemini_api_key_placeholder': 'Enter your Gemini API key',
    'gemini_api_key_helper': 'Get your API key from',
    'target_language': 'Target Language',
    'target_language_required': 'Target Language',
    'target_language_helper': 'Language for translations and analysis',
    'ui_language': 'Interface Language',
    'ui_language_helper': 'Language for user interface',
    'notion_integration': 'Notion Integration (Optional)',
    'notion_token': 'Notion Integration Token',
    'notion_token_placeholder': 'secret_xxxxxxxxxxxxxx',
    'notion_token_helper': 'Create an integration at',
    'notion_database_id': 'Notion Database ID',
    'notion_database_id_placeholder': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'notion_database_id_helper': 'Find the database ID in your Notion database URL',
    'notion_database_structure': 'Required database properties: Name (Title), Translation (Text), Type (Select: Word/Sentence), Analysis (Text), Examples (Text), Tags (Multi-select), URL (URL)',
    'save_settings': 'Save Settings',
    'reset': 'Reset',
    'settings_saved': 'Settings saved successfully!',
    'settings_reset_confirm': 'Are you sure you want to reset all settings?',
    'settings_reset_message': 'Settings reset. Click "Save Settings" to apply.',
    'please_enter_api_key': 'Please enter your Gemini API key',
    'failed_to_save': 'Failed to save settings',
    
    // Popup
    'popup_subtitle': 'AI-Powered Text Analysis',
    'popup_instruction': 'Select any text on a webpage to analyze it with AI!',
    'popup_feature_1': 'Smart translations',
    'popup_feature_2': 'Deep analysis',
    'popup_feature_3': 'Example sentences',
    'popup_feature_4': 'Save to Notion',
    'open_settings': 'Open Settings',
    'popup_footer': 'Made with ❤️ for language learners',
    
    // Notion errors
    'notion_error_title': 'Failed to save to Notion',
    'notion_error_check_token': 'Check: Is the Integration Token correct?',
    'notion_error_check_db': 'Check: Is the Database ID correct? (32 characters)',
    'notion_error_check_share': 'Confirm: Is the database shared with the Integration?',
    'notion_error_check_props': 'Verify: Does the database contain all required properties?',
    'notion_configure': 'Please configure Notion integration in settings'
  },
  
  'zh-CN': {
    // Panel
    'panel_title': 'SelectWise 分析',
    'analyzing': '正在使用 AI 分析...',
    'original_text': '原文',
    'translation': '翻译',
    'analysis': '分析',
    'tags': '标签',
    'examples': '例句',
    'related_vocabulary': '相关词汇',
    'save_to_notion': '保存到 Notion',
    'saving': '保存中...',
    'saved_success': '✓ 保存成功！',
    'error': '错误',
    
    // Settings
    'settings_title': 'SelectWise 设置',
    'settings_subtitle': '配置你的 API 密钥和偏好设置',
    'gemini_api_key': 'Gemini API 密钥',
    'gemini_api_key_required': 'Gemini API 密钥',
    'gemini_api_key_placeholder': '输入你的 Gemini API 密钥',
    'gemini_api_key_helper': '从以下网址获取 API 密钥',
    'target_language': '目标语言',
    'target_language_required': '目标语言',
    'target_language_helper': '用于翻译和分析的语言',
    'ui_language': '界面语言',
    'ui_language_helper': '用户界面显示语言',
    'notion_integration': 'Notion 集成（可选）',
    'notion_token': 'Notion Integration Token',
    'notion_token_placeholder': 'secret_xxxxxxxxxxxxxx',
    'notion_token_helper': '在此处创建集成',
    'notion_database_id': 'Notion 数据库 ID',
    'notion_database_id_placeholder': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'notion_database_id_helper': '在 Notion 数据库 URL 中找到数据库 ID',
    'notion_database_structure': '必需的数据库属性：Name（标题）、Translation（文本）、Type（选择：Word/Sentence）、Analysis（文本）、Examples（文本）、Tags（多选）、URL（网址）',
    'save_settings': '保存设置',
    'reset': '重置',
    'settings_saved': '设置保存成功！',
    'settings_reset_confirm': '确定要重置所有设置吗？',
    'settings_reset_message': '设置已重置。点击"保存设置"以应用。',
    'please_enter_api_key': '请输入你的 Gemini API 密钥',
    'failed_to_save': '保存设置失败',
    
    // Popup
    'popup_subtitle': 'AI 驱动的文本分析',
    'popup_instruction': '在网页上选择任何文本即可使用 AI 分析！',
    'popup_feature_1': '智能翻译',
    'popup_feature_2': '深度分析',
    'popup_feature_3': '例句展示',
    'popup_feature_4': '保存到 Notion',
    'open_settings': '打开设置',
    'popup_footer': '用 ❤️ 为语言学习者打造',
    
    // Notion errors
    'notion_error_title': '保存到 Notion 失败',
    'notion_error_check_token': '检查：Integration Token 是否正确？',
    'notion_error_check_db': '检查：Database ID 是否正确？（32位字符）',
    'notion_error_check_share': '确认：数据库已共享给 Integration？',
    'notion_error_check_props': '验证：数据库包含所有必需的属性？',
    'notion_configure': '请在设置中配置 Notion 集成'
  },
  
  'ja': {
    // Panel
    'panel_title': 'SelectWise 分析',
    'analyzing': 'AIで分析中...',
    'original_text': '原文',
    'translation': '翻訳',
    'analysis': '分析',
    'tags': 'タグ',
    'examples': '例文',
    'related_vocabulary': '関連語彙',
    'save_to_notion': 'Notionに保存',
    'saving': '保存中...',
    'saved_success': '✓ 保存しました！',
    'error': 'エラー',
    
    // Settings
    'settings_title': 'SelectWise 設定',
    'settings_subtitle': 'APIキーと設定を構成',
    'gemini_api_key': 'Gemini APIキー',
    'gemini_api_key_required': 'Gemini APIキー',
    'gemini_api_key_placeholder': 'Gemini APIキーを入力',
    'gemini_api_key_helper': 'APIキーを取得',
    'target_language': 'ターゲット言語',
    'target_language_required': 'ターゲット言語',
    'target_language_helper': '翻訳と分析に使用する言語',
    'ui_language': 'インターフェース言語',
    'ui_language_helper': 'ユーザーインターフェースの言語',
    'notion_integration': 'Notion 統合（オプション）',
    'notion_token': 'Notion Integration Token',
    'notion_token_placeholder': 'secret_xxxxxxxxxxxxxx',
    'notion_token_helper': 'こちらで統合を作成',
    'notion_database_id': 'Notion データベース ID',
    'notion_database_id_placeholder': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'notion_database_id_helper': 'Notion データベース URL でデータベース ID を確認',
    'notion_database_structure': '必要なデータベースプロパティ：Name（タイトル）、Translation（テキスト）、Type（選択：Word/Sentence）、Analysis（テキスト）、Examples（テキスト）、Tags（マルチセレクト）、URL（URL）',
    'save_settings': '設定を保存',
    'reset': 'リセット',
    'settings_saved': '設定を保存しました！',
    'settings_reset_confirm': 'すべての設定をリセットしますか？',
    'settings_reset_message': '設定をリセットしました。「設定を保存」をクリックして適用してください。',
    'please_enter_api_key': 'Gemini APIキーを入力してください',
    'failed_to_save': '設定の保存に失敗しました',
    
    // Popup
    'popup_subtitle': 'AI搭載テキスト分析',
    'popup_instruction': 'Webページのテキストを選択してAIで分析！',
    'popup_feature_1': 'スマート翻訳',
    'popup_feature_2': '詳細な分析',
    'popup_feature_3': '例文表示',
    'popup_feature_4': 'Notion に保存',
    'open_settings': '設定を開く',
    'popup_footer': '言語学習者のために ❤️ で作成',
    
    // Notion errors
    'notion_error_title': 'Notion への保存に失敗しました',
    'notion_error_check_token': '確認：Integration Token は正しいですか？',
    'notion_error_check_db': '確認：Database ID は正しいですか？（32文字）',
    'notion_error_check_share': '確認：データベースは Integration と共有されていますか？',
    'notion_error_check_props': '確認：データベースに必要なプロパティがすべて含まれていますか？',
    'notion_configure': '設定で Notion 統合を構成してください'
  },
  
  'es': {
    // Panel
    'panel_title': 'Análisis SelectWise',
    'analyzing': 'Analizando con IA...',
    'original_text': 'Texto Original',
    'translation': 'Traducción',
    'analysis': 'Análisis',
    'tags': 'Etiquetas',
    'examples': 'Ejemplos',
    'related_vocabulary': 'Vocabulario Relacionado',
    'save_to_notion': 'Guardar en Notion',
    'saving': 'Guardando...',
    'saved_success': '✓ ¡Guardado con éxito!',
    'error': 'Error',
    
    // Settings
    'settings_title': 'Configuración de SelectWise',
    'settings_subtitle': 'Configure sus claves API y preferencias',
    'gemini_api_key': 'Clave API de Gemini',
    'gemini_api_key_required': 'Clave API de Gemini',
    'gemini_api_key_placeholder': 'Ingrese su clave API de Gemini',
    'gemini_api_key_helper': 'Obtenga su clave API de',
    'target_language': 'Idioma de Destino',
    'target_language_required': 'Idioma de Destino',
    'target_language_helper': 'Idioma para traducciones y análisis',
    'ui_language': 'Idioma de la Interfaz',
    'ui_language_helper': 'Idioma de la interfaz de usuario',
    'notion_integration': 'Integración de Notion (Opcional)',
    'notion_token': 'Token de Integración de Notion',
    'notion_token_placeholder': 'secret_xxxxxxxxxxxxxx',
    'notion_token_helper': 'Crear una integración en',
    'notion_database_id': 'ID de Base de Datos de Notion',
    'notion_database_id_placeholder': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'notion_database_id_helper': 'Encuentra el ID en la URL de tu base de datos',
    'save_settings': 'Guardar Configuración',
    'reset': 'Restablecer',
    'settings_saved': '¡Configuración guardada con éxito!',
    'settings_reset_confirm': '¿Estás seguro de que quieres restablecer toda la configuración?',
    'settings_reset_message': 'Configuración restablecida. Haz clic en "Guardar Configuración" para aplicar.',
    'please_enter_api_key': 'Por favor ingresa tu clave API de Gemini',
    'failed_to_save': 'Error al guardar la configuración',
    
    // Popup
    'popup_subtitle': 'Análisis de Texto con IA',
    'popup_instruction': '¡Selecciona cualquier texto en una página web para analizarlo con IA!',
    'popup_feature_1': 'Traducciones inteligentes',
    'popup_feature_2': 'Análisis profundo',
    'popup_feature_3': 'Oraciones de ejemplo',
    'popup_feature_4': 'Guardar en Notion',
    'open_settings': 'Abrir Configuración',
    'popup_footer': 'Hecho con ❤️ para estudiantes de idiomas',
    
    // Notion errors
    'notion_error_title': 'Error al guardar en Notion',
    'notion_error_check_token': 'Verificar: ¿El Integration Token es correcto?',
    'notion_error_check_db': 'Verificar: ¿El Database ID es correcto? (32 caracteres)',
    'notion_error_check_share': 'Confirmar: ¿La base de datos está compartida con la Integration?',
    'notion_error_check_props': 'Verificar: ¿La base de datos contiene todas las propiedades requeridas?',
    'notion_configure': 'Por favor configure la integración de Notion en la configuración'
  },
  
  'fr': {
    // Panel
    'panel_title': 'Analyse SelectWise',
    'analyzing': 'Analyse IA en cours...',
    'original_text': 'Texte Original',
    'translation': 'Traduction',
    'analysis': 'Analyse',
    'tags': 'Étiquettes',
    'examples': 'Exemples',
    'related_vocabulary': 'Vocabulaire Connexe',
    'save_to_notion': 'Enregistrer dans Notion',
    'saving': 'Enregistrement...',
    'saved_success': '✓ Enregistré avec succès !',
    'error': 'Erreur',
    
    // Settings
    'settings_title': 'Paramètres SelectWise',
    'settings_subtitle': 'Configurez vos clés API et préférences',
    'gemini_api_key': 'Clé API Gemini',
    'gemini_api_key_required': 'Clé API Gemini',
    'gemini_api_key_placeholder': 'Entrez votre clé API Gemini',
    'gemini_api_key_helper': 'Obtenez votre clé API sur',
    'target_language': 'Langue Cible',
    'target_language_required': 'Langue Cible',
    'target_language_helper': 'Langue pour les traductions et analyses',
    'ui_language': 'Langue de l\'Interface',
    'ui_language_helper': 'Langue de l\'interface utilisateur',
    'notion_integration': 'Intégration Notion (Optionnel)',
    'notion_token': 'Notion Integration Token',
    'notion_token_placeholder': 'secret_xxxxxxxxxxxxxx',
    'notion_token_helper': 'Créez une intégration sur',
    'notion_database_id': 'ID de Base de Données Notion',
    'notion_database_id_placeholder': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'notion_database_id_helper': 'Trouvez l\'ID de la base de données dans l\'URL Notion',
    'notion_database_structure': 'Propriétés requises de la base de données : Name (Titre), Translation (Texte), Type (Sélection : Word/Sentence), Analysis (Texte), Examples (Texte), Tags (Multi-sélection), URL (URL)',
    'save_settings': 'Enregistrer les Paramètres',
    'reset': 'Réinitialiser',
    'settings_saved': 'Paramètres enregistrés avec succès !',
    'settings_reset_confirm': 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?',
    'settings_reset_message': 'Paramètres réinitialisés. Cliquez sur "Enregistrer les Paramètres" pour appliquer.',
    'please_enter_api_key': 'Veuillez entrer votre clé API Gemini',
    'failed_to_save': 'Échec de l\'enregistrement des paramètres',
    
    // Popup
    'popup_subtitle': 'Analyse de Texte par IA',
    'popup_instruction': 'Sélectionnez n\'importe quel texte sur une page web pour l\'analyser avec l\'IA !',
    'popup_feature_1': 'Traductions intelligentes',
    'popup_feature_2': 'Analyse approfondie',
    'popup_feature_3': 'Phrases d\'exemple',
    'popup_feature_4': 'Enregistrer dans Notion',
    'open_settings': 'Ouvrir les Paramètres',
    'popup_footer': 'Fait avec ❤️ pour les apprenants de langues',
    
    // Notion errors
    'notion_error_title': 'Échec de l\'enregistrement dans Notion',
    'notion_error_check_token': 'Vérifier : Le Integration Token est-il correct ?',
    'notion_error_check_db': 'Vérifier : Le Database ID est-il correct ? (32 caractères)',
    'notion_error_check_share': 'Confirmer : La base de données est-elle partagée avec l\'Integration ?',
    'notion_error_check_props': 'Vérifier : La base de données contient-elle toutes les propriétés requises ?',
    'notion_configure': 'Veuillez configurer l\'intégration Notion dans les paramètres'
  }
};

// Get translation function
function t(key, lang = 'en') {
  return translations[lang]?.[key] || translations['en'][key] || key;
}

// Get current UI language from storage
async function getUILanguage() {
  const result = await chrome.storage.sync.get(['uiLanguage']);
  return result.uiLanguage || 'en';
}
