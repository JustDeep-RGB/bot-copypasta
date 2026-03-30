const GeminiExtractor = (() => {

  const TURN_SELECTORS = [
    'conversation-turn',            
    '.conversation-turn',
    'user-query, model-response',   
    '[data-turn-index]',
    '.message-bubble',
  ];

  const USER_CONTENT_SELECTORS = [
    '.user-query-bubble-with-background .query-text',
    '.user-query-bubble .query-text',
    'user-query .query-text',
    '.human-turn .query-text',
    '.human-turn',
    '[class*="user-query"] p',
    '.query-text',
  ];

  const MODEL_CONTENT_SELECTORS = [
    '.model-response-text',
    'model-response .response-content',
    '.response-container .response-content',
    '.markdown.model-response-text',
    '[class*="model-response"] .markdown',
    '[class*="response-content"]',
  ];

  function extractByPairedSelectors() {
    const userEls = [];
    const modelEls = [];

    for (const sel of USER_CONTENT_SELECTORS) {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) {
        found.forEach(el => userEls.push(el));
        break;
      }
    }

    for (const sel of MODEL_CONTENT_SELECTORS) {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) {
        found.forEach(el => modelEls.push(el));
        break;
      }
    }

    if (userEls.length === 0 && modelEls.length === 0) return [];

    const tagged = [];
    userEls.forEach(el => tagged.push({ el, role: 'User', pos: getDocPosition(el) }));
    modelEls.forEach(el => tagged.push({ el, role: 'Assistant', pos: getDocPosition(el) }));

    tagged.sort((a, b) => a.pos - b.pos);

    return dedup(tagged.map(({ el, role }) => ({
      role,
      text: normaliseText(elementToText(el)),
    })));
  }

  function extractByTurnElements() {
    let turns = [];
    for (const sel of TURN_SELECTORS) {
      turns = Array.from(document.querySelectorAll(sel));
      if (turns.length > 0) break;
    }

    if (turns.length === 0) return [];

    const messages = [];

    turns.forEach(turn => {
      
      const classList = turn.className || '';
      const tagName = turn.tagName?.toLowerCase() || '';

      let role;
      if (
        classList.includes('user') ||
        classList.includes('human') ||
        tagName === 'user-query'
      ) {
        role = 'User';
      } else if (
        classList.includes('model') ||
        classList.includes('assistant') ||
        tagName === 'model-response'
      ) {
        role = 'Assistant';
      } else {
        
        role = messages.length % 2 === 0 ? 'User' : 'Assistant';
      }

      const text = normaliseText(elementToText(turn));
      if (text) messages.push({ role, text });
    });

    return dedup(messages);
  }

  function extractByContentFallback() {
    
    const container =
      document.querySelector('main') ||
      document.querySelector('#chat-history') ||
      document.querySelector('.chat-container') ||
      document.body;

    const children = Array.from(container.children);
    if (children.length === 0) return [];

    const messages = [];
    let roleIndex = 0; 

    children.forEach(child => {
      const text = normaliseText(elementToText(child));
      if (!text || text.length < 3) return; 

      const role = roleIndex % 2 === 0 ? 'User' : 'Assistant';
      messages.push({ role, text });
      roleIndex++;
    });

    return dedup(messages);
  }

  function getDocPosition(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function dedup(msgs) {
    const seen = new Set();
    return msgs.filter(({ role, text }) => {
      if (!text) return false;
      const key = `${role}:::${text.slice(0, 120)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function extract() {
    const strategies = [
      { name: 'paired-selectors', fn: extractByPairedSelectors },
      { name: 'turn-elements',   fn: extractByTurnElements    },
      { name: 'content-fallback',fn: extractByContentFallback },
    ];

    for (const { name, fn } of strategies) {
      const result = fn();
      if (result.length > 0) {
        console.info(`[Chat Extractor] Gemini: extracted via "${name}" strategy.`);
        return result;
      }
    }

    console.warn('[Chat Extractor] Gemini: all strategies returned 0 messages.');
    return [];
  }

  return { extract };
})();