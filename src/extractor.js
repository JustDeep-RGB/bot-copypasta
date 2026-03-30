const Extractor = (() => {

  function autoScroll() {
    return new Promise(resolve => {

      const scrollTarget =
        document.querySelector(
          'main, [role="main"], .chat-container, ' +
          '#chat-history, .conversation-container, ' +
          '[class*="conversation"], [class*="chat-list"]'
        ) || document.documentElement;

      const originalScrollTop = scrollTarget.scrollTop;
      const scrollMax = scrollTarget.scrollHeight;
      const STEP = 800;   
      const DELAY = 80;   
      let current = 0;

      function step() {
        if (current >= scrollMax) {
          
          scrollTarget.scrollTop = originalScrollTop;
          setTimeout(resolve, 300); 
          return;
        }
        scrollTarget.scrollTop = current;
        current += STEP;
        setTimeout(step, DELAY);
      }

      step();
    });
  }

  function formatAsPlainText(messages) {
    return messages
      .map(({ role, text }) => {
        const label = role === 'User' ? 'User' : 'A';
        return `${label}: ${text}`;
      })
      .join('\n\n');
  }

  function formatAsMarkdown(messages) {
    return messages
      .map(({ role, text }) => `## ${role}\n\n${text}`)
      .join('\n\n---\n\n');
  }

  async function run({ scroll = true } = {}) {
    const platform = detectPlatform();

    if (!platform) {
      console.warn('[AI Chat Extractor] Unsupported site.');
      return { messages: [], plainText: '', markdown: '', platform: null, count: 0 };
    }

    if (scroll) {
      await autoScroll();
    }

    let messages = [];
    switch (platform) {
      case 'chatgpt': messages = ChatGPTExtractor.extract(); break;
      case 'claude':  messages = ClaudeExtractor.extract();  break;
      case 'gemini':  messages = GeminiExtractor.extract();  break;
    }

    if (messages.length === 0) {
      console.warn('[AI Chat Extractor] No messages extracted.');
    }

    const plainText = formatAsPlainText(messages);
    const markdown  = formatAsMarkdown(messages);

    return { messages, plainText, markdown, platform, count: messages.length };
  }

  return { run, formatAsPlainText, formatAsMarkdown };
})();