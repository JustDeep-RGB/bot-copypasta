# Chat Extractor 💬

A production-ready Chrome Extension (Manifest V3) to extract clean, structured chat conversations from AI platforms (ChatGPT, Claude, and Google Gemini) and copy them to your clipboard or download them as Markdown/Text files.

## 🚀 Features

*   **One-Click Extraction**: Floating "Copy Clean Chat" button injected directly into supported sites.
*   **Clean Formatting**: Automatically removes UI clutter, buttons, and icons while preserving paragraphs, lists, and code blocks.
*   **Multiple Formats**:
    *   **Plain Text**: Simple `User: / A:` format.
    *   **Markdown**: Professional formatting with headers and horizontal rules.
*   **Smart Auto-Scroll**: Automatically scrolls to load all messages in long conversations before extraction.
*   **Download Options**: Directly export chats as `.txt` or `.md` files.
*   **Toast Notifications**: Instant feedback when copying or downloading.

## 🌐 Supported Sites

*   **ChatGPT** (chatgpt.com / chat.openai.com)
*   **Claude** (claude.ai)
*   **Google Gemini** (gemini.google.com)

## 🛠 Installation Instructions

### For Brave / Chrome / Edge (Chromium Browsers)

1.  **Download/Clone** this repository to your local machine.
2.  Open your browser and navigate to the extensions page:
    *   **Brave**: `brave://extensions`
    *   **Chrome**: `chrome://extensions`
3.  Enable **"Developer mode"** (usually a toggle in the top-right corner).
4.  Click the **"Load unpacked"** button.
5.  Select the root folder of this project (the directory where you cloned/downloaded it).
6.  The **Chat Extractor** icon should now appear in your extensions list.

## 📖 How to Use

1.  Open any supported AI platform (e.g., [chatgpt.com](https://chatgpt.com)).
2.  Start or open an existing chat conversation.
3.  Look for the **purple 💬 floating button** in the bottom-right corner of the page.
4.  Click the button to open the **Chat Extractor** panel.
5.  Click **⚡ Extract**. The extension will briefly scroll through your chat to ensure all messages are loaded.
6.  Once extraction is complete, click:
    *   **📋 Copy as Text**: Copies to clipboard in plain text.
    *   **📋 Copy as Markdown**: Copies to clipboard with Markdown syntax.
    *   **⬇ Download .txt / .md**: Saves the conversation to your computer.

## 📂 File Structure

```text
.
├── manifest.json         # Extension configuration
├── popup.html            # Extension popup UI
├── popup.css             # Popup styling
├── popup.js              # Popup logic
├── icons/                # Extension icons (16, 32, 48, 128)
├── src/
│   ├── background.js     # Background service worker
│   ├── content.js        # Content script entry point
│   ├── extractor.js      # Main extraction orchestrator
│   ├── styles.css        # Injected UI styles
│   ├── ui.js             # Floating UI overlay logic
│   ├── utils.js          # Shared utility functions
│   └── extractors/       # Site-specific extraction logic
│       ├── chatgpt.js
│       ├── claude.js
│       └── gemini.js
└── README.md
```

## 📜 Technical Requirements

*   **Manifest V3** compliant.
*   Built with **Vanilla JavaScript** (no frameworks).
*   Modular and maintainable code structure.
*   Shadow DOM-like isolation for styles to avoid site interference. 
