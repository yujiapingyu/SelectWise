// Background service worker for SelectWise

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeText') {
    analyzeTextWithGemini(request.text, request.url)
      .then(data => sendResponse({ data }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'saveToNotion') {
    saveToNotion(request.data, request.url)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
});

// Analyze text using Gemini API
async function analyzeTextWithGemini(text, url) {
  // Get settings
  const settings = await chrome.storage.sync.get(['geminiApiKey', 'targetLanguage']);
  
  if (!settings.geminiApiKey) {
    throw new Error('Please configure your Gemini API key in settings');
  }
  
  const targetLanguage = settings.targetLanguage || 'English';
  
  // Determine if text is a word/phrase or sentence/paragraph
  const isWord = text.split(/\s+/).length <= 3 && text.length < 50;
  
  // Build the prompt with JSON schema
  const systemPrompt = buildSystemPrompt(targetLanguage, isWord, text);
  
  // Call Gemini API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${settings.geminiApiKey}`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: `${systemPrompt}\n\nText to analyze: "${text}"`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API request failed');
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response (remove markdown code blocks if present)
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const result = JSON.parse(jsonText);
    
    return result;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

// Build system prompt based on target language and text type
function buildSystemPrompt(targetLanguage, isWord, originalText) {
  // Detect if text might be Japanese when target is Chinese
  let sourceLanguageHint = '';
  if (targetLanguage === '中文') {
    // Check if text contains Hiragana or Katakana (Japanese-specific characters)
    const hasHiragana = /[\u3040-\u309F]/.test(originalText);
    const hasKatakana = /[\u30A0-\u30FF]/.test(originalText);
    if (hasHiragana || hasKatakana) {
      sourceLanguageHint = 'The source text is in Japanese. ';
    } else {
      // If only Kanji/Chinese characters, assume Japanese when ambiguous
      const hasOnlyKanji = /^[\u4E00-\u9FAF\s\p{P}]+$/u.test(originalText);
      if (hasOnlyKanji) {
        sourceLanguageHint = 'If the source language is ambiguous between Chinese and Japanese, treat it as Japanese. ';
      }
    }
  }
  
  const basePrompt = `You are a language learning assistant. ${sourceLanguageHint}Analyze the given text and provide a structured JSON response.

Target language for translation: ${targetLanguage}
Source text language: Automatically detect (the original language of the text being analyzed)

Instructions:
1. Determine if the text is a "word/phrase" or "sentence/paragraph"
2. Provide analysis tailored to the text type:
   - For words/phrases: Focus on meaning, part of speech, pronunciation tips, common collocations
   - For sentences/paragraphs: Focus on translation, grammar structure, main ideas, sentiment
3. For pronunciation guidance:
   - DO NOT use romaji (romanization)
   - For Japanese: use Furigana (hiragana/katakana) only in analysis, e.g., 勉強（べんきょう）
   - For other languages: use IPA or native pronunciation guides only in analysis

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks.

JSON Schema:
{
  "original_text": "the input text (keep in original language)",
  "target_translation": "translation in ${targetLanguage}",
  "analysis": "detailed analysis in ${targetLanguage}",
  "examples": ["example 1 in source language", "example 2 in source language"],
  "tags": ["#tag1 in source language", "#tag2", "#tag3"],
  "related_vocabulary": ["word1 in source language", "word2", "word3"]
}

Guidelines:
- original_text: Copy the exact input text (keep original language)
- target_translation: Accurate translation to ${targetLanguage}
- analysis: Write in ${targetLanguage}. ${isWord ? 
    'Include part of speech, definitions, usage context. If pronunciation is needed, use Furigana for Japanese (e.g., 食べる（たべる）), NEVER use romaji' : 
    'Include summary, key grammar points, tone/sentiment analysis'}
- examples: Write in the SOURCE language (same language as original_text). ${isWord ? 
    '2-3 CLEAN example sentences using this word/phrase. DO NOT include any pronunciation, furigana, or romanization in examples' : 
    '1-2 similar expressions or paraphrases. DO NOT include pronunciation in examples'}
- tags: Write in the SOURCE language (same language as original_text). 3-5 relevant tags describing the text (e.g., #商务, #日常, #動詞, #積極的)
- related_vocabulary: Write in the SOURCE language. 3-5 related words or synonyms. DO NOT include pronunciation

Important rules:
- Examples MUST be clean sentences WITHOUT any pronunciation annotations
- Pronunciation (Furigana/IPA) should ONLY appear in the analysis section when necessary
- For Japanese: ALWAYS use Furigana (振り仮名), NEVER romaji
- Keep examples natural and readable

Return ONLY the JSON object, no explanations or markdown.`;

  return basePrompt;
}

// Save to Notion
async function saveToNotion(data, url) {
  // Get Notion settings
  const settings = await chrome.storage.sync.get(['notionToken', 'notionDatabaseId', 'uiLanguage']);
  
  if (!settings.notionToken || !settings.notionDatabaseId) {
    const lang = settings.uiLanguage || 'en';
    const errorMsg = getNotionConfigError(lang);
    throw new Error(errorMsg);
  }
  
  // Determine type
  const isWord = data.original_text.split(/\s+/).length <= 3;
  const type = isWord ? 'Word' : 'Sentence';
  
  // Build Notion page properties
  const properties = {
    Name: {
      title: [
        {
          text: {
            content: data.original_text.substring(0, 100) // Notion title limit
          }
        }
      ]
    }
  };
  
  // Add optional properties if they exist in the database
  // Note: These property names should match your Notion database schema
  const optionalProperties = {
    Translation: data.target_translation,
    Type: type,
    Analysis: data.analysis,
    Examples: data.examples?.join('\n'),
    URL: url
  };
  
  // Try to add optional properties
  for (const [key, value] of Object.entries(optionalProperties)) {
    if (value) {
      if (key === 'Type') {
        properties[key] = { select: { name: value } };
      } else if (key === 'URL') {
        properties[key] = { url: value };
      } else {
        properties[key] = { 
          rich_text: [{ text: { content: value.substring(0, 2000) } }] 
        };
      }
    }
  }
  
  // Add tags as multi-select
  if (data.tags && data.tags.length > 0) {
    properties.Tags = {
      multi_select: data.tags.map(tag => ({ 
        name: tag.replace('#', '').substring(0, 100) 
      }))
    };
  }
  
  // Create Notion page
  const notionUrl = 'https://api.notion.com/v1/pages';
  
  const requestBody = {
    parent: {
      database_id: settings.notionDatabaseId
    },
    properties: properties
  };
  
  try {
    const response = await fetch(notionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API Error:', errorData);
      const lang = settings.uiLanguage || 'en';
      throw new Error(getNotionSaveError(lang));
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Notion Save Error:', error);
    if (error.message.includes('notion_error') || error.message.includes('notion_configure')) {
      throw error; // Re-throw localized errors
    }
    const lang = settings.uiLanguage || 'en';
    throw new Error(getNotionSaveError(lang));
  }
}

// Helper function to get localized Notion configuration error
function getNotionConfigError(lang) {
  const messages = {
    'en': 'Please configure Notion integration in settings',
    'zh-CN': '请在设置中配置 Notion 集成',
    'ja': '設定で Notion 統合を構成してください',
    'es': 'Por favor configure la integración de Notion en la configuración',
    'fr': 'Veuillez configurer l\'intégration Notion dans les paramètres'
  };
  return messages[lang] || messages['en'];
}

// Helper function to get localized Notion save error with checklist
function getNotionSaveError(lang) {
  const messages = {
    'en': `Failed to save to Notion. Please check:
✓ Is the Integration Token correct?
✓ Is the Database ID correct? (32 characters)
✓ Is the database shared with the Integration?
✓ Does the database contain all required properties?`,
    'zh-CN': `保存到 Notion 失败。请检查：
✓ Integration Token 是否正确？
✓ Database ID 是否正确？(32位字符)
✓ 数据库已共享给 Integration？
✓ 数据库包含所有必需的属性？`,
    'ja': `Notion への保存に失敗しました。確認してください：
✓ Integration Token は正しいですか？
✓ Database ID は正しいですか？(32文字)
✓ データベースは Integration と共有されていますか？
✓ データベースに必要なプロパティがすべて含まれていますか？`,
    'es': `Error al guardar en Notion. Por favor verifique:
✓ ¿El Integration Token es correcto?
✓ ¿El Database ID es correcto? (32 caracteres)
✓ ¿La base de datos está compartida con la Integration?
✓ ¿La base de datos contiene todas las propiedades requeridas?`,
    'fr': `Échec de l'enregistrement dans Notion. Veuillez vérifier :
✓ Le Integration Token est-il correct ?
✓ Le Database ID est-il correct ? (32 caractères)
✓ La base de données est-elle partagée avec l'Integration ?
✓ La base de données contient-elle toutes les propriétés requises ?`
  };
  return messages[lang] || messages['en'];
}
