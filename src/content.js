(() => {
  'use strict';

  function bootstrap() {
    const platform = detectPlatform();

    if (!platform) {
      
      return;
    }

    console.info(`[Chat Extractor] Initialising on platform: ${platform}`);

    const observer = new MutationObserver(() => {
      if (!document.getElementById('ace-fab')) {
        UI.init();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: false,
    });

    UI.init();
  }

  if (document.body) {
    bootstrap();
  } else {
    document.addEventListener('DOMContentLoaded', bootstrap);
  }
})();