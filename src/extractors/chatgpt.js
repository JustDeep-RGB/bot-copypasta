const ChatGPTExtractor = (() => {

  const TURN_SELECTOR = '[data-message-author-role]';

  const CONTENT_SELECTORS = [
    '.markdown',
    '.prose',
    '[data-message-author-role] > div > div',   
    '[data-message-author-role]',               
  ];

  function extract() {
    const turns = document.querySelectorAll(TURN_SELECTOR);

    if (turns.length === 0) {
      console.warn('[AI Chat Extractor] ChatGPT: no message turns found.');
      return [];
    }

    const messages = [];
    const seen = new Set(); 

    turns.forEach(turn => {
      const roleAttr = turn.getAttribute('data-message-author-role') || 'unknown';
      const role = roleAttr === 'user' ? 'User' : 'Assistant';

      let contentEl = null;
      for (const sel of CONTENT_SELECTORS) {
        contentEl = turn.querySelector(sel);
        if (contentEl) break;
      }

      if (!contentEl) contentEl = turn;

      const text = normaliseText(elementToText(contentEl));

      if (!text) return; 

      const key = `${role}:::${text.slice(0, 120)}`;
      if (seen.has(key)) return;
      seen.add(key);

      messages.push({ role, text });
    });

    return messages;
  }

  return { extract };
})();