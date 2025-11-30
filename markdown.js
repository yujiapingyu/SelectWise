// Simple Markdown renderer for SelectWise
// Supports basic markdown: **bold**, *italic*, `code`, [link](url), line breaks

function renderMarkdown(text) {
  if (!text) return '';
  
  let html = text;
  
  // Escape HTML first
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_ (but not inside words)
  html = html.replace(/\*([^\*]+?)\*/g, '<em>$1</em>');
  html = html.replace(/\b_([^_]+?)_\b/g, '<em>$1</em>');
  
  // Inline code: `code`
  html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');
  
  // Links: [text](url)
  html = html.replace(/\[([^\]]+?)\]\(([^\)]+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // Line breaks: double newline becomes paragraph break
  html = html.replace(/\n\n/g, '</p><p>');
  
  // Single line breaks
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraph if needed
  if (!html.startsWith('<p>')) {
    html = '<p>' + html + '</p>';
  }
  
  // Lists: lines starting with - or *
  html = html.replace(/<p>([•\-\*])\s+(.+?)<\/p>/g, '<ul><li>$2</li></ul>');
  html = html.replace(/<\/ul><br><ul>/g, ''); // Merge consecutive lists
  
  return html;
}
