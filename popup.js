/**
 * popup.js
 *
 * Logic for the extension popup.
 *
 * - Detects whether the current tab is a supported AI platform.
 * - Updates the status banner and highlights the active platform.
 */

'use strict';

(async () => {

  // ─── Platform detection map ──────────────────────────────────────────────────

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

  // ─── Query the active tab ────────────────────────────────────────────────────

  let activeTab = null;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tab;
  } catch (e) {
    console.error('[AI Chat Extractor] Could not query active tab:', e);
  }

  const banner   = document.getElementById('status-banner');
  const platList = document.getElementById('platform-list');

  // Helper to set the status banner style and text
  function setBanner(text, type = 'info') {
    banner.textContent = text;
    banner.className = `status-banner status-banner--${type}`;
  }

  // If we failed to get the tab, show an error
  if (!activeTab?.url) {
    setBanner('⚠ Could not detect the current page.', 'error');
    return;
  }

  // ─── Detect which platform (if any) the tab belongs to ──────────────────────

  let detectedPlatform = null;

  for (const [platform, patterns] of Object.entries(PLATFORM_MAP)) {
    if (patterns.some(regex => regex.test(activeTab.url))) {
      detectedPlatform = platform;
      break;
    }
  }

  // ─── Update UI ───────────────────────────────────────────────────────────────

  if (detectedPlatform) {
    setBanner(
      `✓ You're on ${PLATFORM_LABELS[detectedPlatform]}. Use the 💬 button on the page.`,
      'success'
    );

    // Highlight the active platform row
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
