'use strict';

(async () => {

  const PLATFORM_MAP = {
    chatgpt: [/chat\.openai\.com/, /chatgpt\.com/],
    claude:  [/claude\.ai/],
    gemini:  [/gemini\.google\.com/],
  };

  const PLATFORM_LABELS = {
    chatgpt: 'ChatGPT',
    claude:  'Claude',
    gemini:  'Google Gemini',
  };

  let activeTab = null;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;
  } catch (e) {
    console.error('[Chat Extractor] Could not query active tab:', e);
  }

  const banner   = document.getElementById('status-banner');
  const platList = document.getElementById('platform-list');

  function setBanner(text, type = 'info') {
    banner.textContent = text;
    banner.className = `status-banner status-banner--${type}`;
  }

  if (!activeTab?.url) {
    setBanner('⚠ Could not detect the current page.', 'error');
    return;
  }

  let detectedPlatform = null;

  for (const [platform, patterns] of Object.entries(PLATFORM_MAP)) {
    if (patterns.some(regex => regex.test(activeTab.url))) {
      detectedPlatform = platform;
      break;
    }
  }

  if (detectedPlatform) {
    setBanner(
      `✓ You're on ${PLATFORM_LABELS[detectedPlatform]}. Use the 💬 button on the page.`,
      'success'
    );

    const activeItem = platList.querySelector(
      `[data-host="${detectedPlatform}"]`
    );
    if (activeItem) activeItem.classList.add('active');

  } else {
    setBanner(
      '⚠ Not a supported platform. Navigate to ChatGPT, Claude, or Gemini.',
      'warning'
    );
  }

})();
