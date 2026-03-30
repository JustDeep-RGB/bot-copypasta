const ClaudeExtractor = (() => {

  function extractByAttribute() {
    const turns = document.querySelectorAll('[data-is-human-turn]');
    if (turns.length === 0) return [];

    const messages = [];
    const seen = new Set();

    turns.forEach(turn => {
      const isHuman = turn.getAttribute('data-is-human-turn') === 'true';
      const role = isHuman ? 'User' : 'Assistant';

      const contentEl =
        turn.querySelector('.prose') ||
        turn.querySelector('[class*="prose"]') ||
        turn.querySelector('.ProseMirror') ||
        turn;

      const text = normaliseText(elementToText(contentEl));
      if (!text) return;

      const key = `${role}:::${text.slice(0, 120)}`;
      if (seen.has(key)) return;
      seen.add(key);

      messages.push({ role, text });
    });

    return messages;
  }

  function extractByProse() {
    const aiBlocks = document.querySelectorAll(
      '.font-claude-message, [class*="claude-message"], .model-response, [data-test-render-count]'
    );
    const userBlocks = document.querySelectorAll(
      '.font-user-message, [class*="user-message"], [data-is-user="true"]'
    );

    if (aiBlocks.length === 0 && userBlocks.length === 0) return [];

    const tagged = [];

    userBlocks.forEach(el => {
      tagged.push({ el, role: 'User', pos: getDocumentPosition(el) });
    });

    aiBlocks.forEach(el => {
      tagged.push({ el, role: 'Assistant', pos: getDocumentPosition(el) });
    });

    tagged.sort((a, b) => a.pos - b.pos);

    const messages = [];
    const seen = new Set();

    tagged.forEach(({ el, role }) => {
      const text = normaliseText(elementToText(el));
      if (!text) return;

      const key = `${role}:::${text.slice(0, 120)}`;
      if (seen.has(key)) return;
      seen.add(key);

      messages.push({ role, text });
    });

    return messages;
  }

  function extractByAlteration() {
    const proseEls = document.querySelectorAll('.prose, [class*="prose"]');
    if (proseEls.length === 0) return [];

    const messages = [];
    const seen = new Set();

    proseEls.forEach((el, i) => {
      const role = i % 2 === 0 ? 'User' : 'Assistant';
      const text = normaliseText(elementToText(el));
      if (!text) return;

      const key = `${text.slice(0, 120)}`;
      if (seen.has(key)) return;
      seen.add(key);

      messages.push({ role, text });
    });

    return messages;
  }

  function getDocumentPosition(el) {
    const rect = el.getBoundingClientRect();
    return rect.top + window.scrollY;
  }

  function extract() {
    const strategies = [
      { name: 'attribute',   fn: extractByAttribute },
      { name: 'prose-class', fn: extractByProse     },
      { name: 'alternation', fn: extractByAlteration },
    ];

    for (const { name, fn } of strategies) {
      const result = fn();
      if (result.length > 0) {
        console.info(`[AI Chat Extractor] Claude: extracted via "${name}" strategy.`);
        return result;
      }
    }

    console.warn('[AI Chat Extractor] Claude: all strategies returned 0 messages.');
    return [];
  }

  return { extract };
})();