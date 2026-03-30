const UI = (() => {

  let fab = null;
  let panel = null;
  let toast = null;
  let toastTimer = null;
  let isPanelOpen = false;
  let lastResult = null;

  function showToast(message, type = 'success', duration = 3000) {
    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.className = `ace-toast ace-toast--${type} ace-toast--visible`;

    toastTimer = setTimeout(() => {
      toast.classList.remove('ace-toast--visible');
    }, duration);
  }

  async function copyToClipboard(text, successMsg = '✓ Copied successfully!') {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg, 'success');
    } catch (err) {

      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        showToast(successMsg, 'success');
      } else {
        showToast('Could not access clipboard.', 'error');
      }
    }
  }

  function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  async function runExtraction() {
    setFabState('loading');
    setPanelStatus('Scrolling & extracting…', 'info');

    try {
      lastResult = await Extractor.run({ scroll: true });

      if (lastResult.count === 0) {
        setPanelStatus(
          'No messages found. Try scrolling down and retrying.',
          'warning'
        );
        setFabState('idle');
        return;
      }

      setPanelStatus(`✓ ${lastResult.count} messages extracted.`, 'success');
      setFabState('idle');
      enablePanelButtons();

    } catch (err) {
      console.error('[AI Chat Extractor] Extraction error:', err);
      setPanelStatus('Extraction failed. See console for details.', 'error');
      setFabState('idle');
    }
  }

  function setPanelStatus(msg, type = 'info') {
    const el = panel?.querySelector('.ace-panel-status');
    if (!el) return;
    el.textContent = msg;
    el.className = `ace-panel-status ace-panel-status--${type}`;
  }

  function enablePanelButtons() {
    panel?.querySelectorAll('button[data-action]').forEach(btn => {
      btn.disabled = false;
    });
  }

  function disablePanelButtons() {
    panel?.querySelectorAll('button[data-action]').forEach(btn => {
      btn.disabled = true;
    });
  }

  function setFabState(state) {
    if (!fab) return;
    const icon = fab.querySelector('.ace-fab-icon');
    if (!icon) return;

    if (state === 'loading') {
      icon.textContent = '⏳';
      fab.classList.add('ace-fab--loading');
    } else {
      icon.textContent = '💬';
      fab.classList.remove('ace-fab--loading');
    }
  }

  function openPanel() {
    isPanelOpen = true;
    panel.classList.add('ace-panel--open');
    fab.classList.add('ace-fab--active');
    disablePanelButtons();
    setPanelStatus('Click "Extract" to begin.', 'info');
    lastResult = null;
  }

  function closePanel() {
    isPanelOpen = false;
    panel.classList.remove('ace-panel--open');
    fab.classList.remove('ace-fab--active');
  }

  function togglePanel() {
    isPanelOpen ? closePanel() : openPanel();
  }

  function createFab() {
    const btn = document.createElement('button');
    btn.className = 'ace-fab';
    btn.id = 'ace-fab';
    btn.setAttribute('aria-label', 'AI Chat Extractor');
    btn.setAttribute('title', 'AI Chat Extractor');
    btn.innerHTML = `
      <span class="ace-fab-icon" aria-hidden="true">💬</span>
    `;
    btn.addEventListener('click', togglePanel);
    return btn;
  }

  function createPanel() {
    const el = document.createElement('div');
    el.className = 'ace-panel';
    el.id = 'ace-panel';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Chat Extractor Options');

    el.innerHTML = `
      <div class="ace-panel-header">
        <span class="ace-panel-title">Chat Extractor</span>
        <button class="ace-panel-close" aria-label="Close" title="Close">✕</button>
      </div>

      <p class="ace-panel-status ace-panel-status--info">Click "Extract" to begin.</p>

      <div class="ace-panel-actions">
        <button class="ace-btn ace-btn--primary" id="ace-btn-extract">
          Extract
        </button>

        <button class="ace-btn ace-btn--secondary" id="ace-btn-copy-text"
                data-action="copy-text" disabled>
          Copy as Text
        </button>

        <button class="ace-btn ace-btn--secondary" id="ace-btn-copy-md"
                data-action="copy-md" disabled>
          Copy as Markdown
        </button>

        <button class="ace-btn ace-btn--outline" id="ace-btn-dl-txt"
                data-action="dl-txt" disabled>
          Download .txt
        </button>

        <button class="ace-btn ace-btn--outline" id="ace-btn-dl-md"
                data-action="dl-md" disabled>
          Download .md
        </button>
      </div>

      <p class="ace-panel-footer">
        Works on ChatGPT,Claude,Gemini
      </p>
    `;

    el.querySelector('.ace-panel-close').addEventListener('click', closePanel);

    el.querySelector('#ace-btn-extract').addEventListener('click', () => {
      runExtraction();
    });

    el.querySelector('#ace-btn-copy-text').addEventListener('click', () => {
      if (!lastResult) return;
      copyToClipboard(lastResult.plainText, '✓ Copied as plain text!');
    });

    el.querySelector('#ace-btn-copy-md').addEventListener('click', () => {
      if (!lastResult) return;
      copyToClipboard(lastResult.markdown, '✓ Copied as Markdown!');
    });

    el.querySelector('#ace-btn-dl-txt').addEventListener('click', () => {
      if (!lastResult) return;
      downloadFile(
        lastResult.plainText,
        `chat-export-${Date.now()}.txt`,
        'text/plain'
      );
      showToast('⬇ Downloading .txt file…', 'info');
    });

    el.querySelector('#ace-btn-dl-md').addEventListener('click', () => {
      if (!lastResult) return;
      downloadFile(
        lastResult.markdown,
        `chat-export-${Date.now()}.md`,
        'text/markdown'
      );
      showToast('⬇ Downloading .md file…', 'info');
    });

    return el;
  }

  function createToast() {
    const el = document.createElement('div');
    el.className = 'ace-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    return el;
  }

  function init() {

    if (document.getElementById('ace-fab')) return;

    const host = document.createElement('div');
    host.id = 'ace-host';
    host.style.cssText =
      'position:fixed;z-index:2147483647;bottom:0;right:0;pointer-events:none;';

    fab = createFab();
    panel = createPanel();
    toast = createToast();

    host.appendChild(panel);
    host.appendChild(fab);
    host.appendChild(toast);

    document.body.appendChild(host);

    document.addEventListener('click', (e) => {
      if (
        isPanelOpen &&
        !panel.contains(e.target) &&
        !fab.contains(e.target)
      ) {
        closePanel();
      }
    });
  }

  return { init, showToast };
})();