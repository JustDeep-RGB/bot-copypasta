function elementToText(el) {
  if (!el) return '';

  const clone = el.cloneNode(true);

  const removeSelectors = [
    'button', 'svg', '[aria-hidden="true"]',
    '.copy-button', '.action-bar', '.message-actions',
    '[data-testid="copy-turn-action-button"]',
    '[data-testid="thumbs-up-button"]',
    '[data-testid="thumbs-down-button"]',
    '.font-size-adjust', '.sr-only',
    'style', 'script',
  ];
  removeSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(node => node.remove());
  });

  return nodeToMarkdown(clone).trim();
}

function nodeToMarkdown(node) {
  
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName.toLowerCase();
  const children = () => Array.from(node.childNodes).map(nodeToMarkdown).join('');

  switch (tag) {
    
    case 'h1': return `\n# ${children().trim()}\n`;
    case 'h2': return `\n## ${children().trim()}\n`;
    case 'h3': return `\n### ${children().trim()}\n`;
    case 'h4': return `\n#### ${children().trim()}\n`;
    case 'h5': return `\n##### ${children().trim()}\n`;
    case 'h6': return `\n###### ${children().trim()}\n`;

    case 'p':
    case 'div':
    case 'section':
    case 'article': {
      const inner = children().trim();
      return inner ? `\n${inner}\n` : '\n';
    }

    case 'br': return '\n';

    case 'pre': {
      const codeEl = node.querySelector('code');
      const langClass = codeEl?.className?.match(/language-(\S+)/);
      const lang = langClass ? langClass[1] : '';
      const code = (codeEl || node).textContent;
      return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }

    case 'code': {
      
      if (node.parentElement?.tagName.toLowerCase() === 'pre') {
        return node.textContent;
      }
      return `\`${node.textContent}\``;
    }

    case 'strong':
    case 'b': return `**${children()}**`;
    case 'em':
    case 'i': return `_${children()}_`;

    case 'blockquote': {
      const lines = children().trim().split('\n');
      return '\n' + lines.map(l => `> ${l}`).join('\n') + '\n';
    }

    case 'ul': {
      const items = Array.from(node.querySelectorAll(':scope > li'))
        .map(li => `- ${nodeToMarkdown(li).trim()}`)
        .join('\n');
      return `\n${items}\n`;
    }

    case 'ol': {
      const items = Array.from(node.querySelectorAll(':scope > li'))
        .map((li, i) => `${i + 1}. ${nodeToMarkdown(li).trim()}`)
        .join('\n');
      return `\n${items}\n`;
    }

    case 'li': return children();

    case 'hr': return '\n---\n';

    case 'a': {
      const href = node.getAttribute('href') || '';
      const text = children().trim();
      return href ? `[${text}](${href})` : text;
    }

    case 'table': return tableToMarkdown(node);

    case 'script':
    case 'style':
    case 'noscript':
    case 'svg':
    case 'img': return '';

    default: return children();
  }
}

function tableToMarkdown(table) {
  const rows = Array.from(table.querySelectorAll('tr'));
  if (rows.length === 0) return '';

  const toRow = (tr) =>
    '| ' + Array.from(tr.querySelectorAll('th, td'))
      .map(cell => cell.textContent.trim().replace(/\|/g, '\\|'))
      .join(' | ') + ' |';

  const headerRow = rows[0];
  const colCount = headerRow.querySelectorAll('th, td').length;
  const separator = '| ' + Array(colCount).fill('---').join(' | ') + ' |';

  const lines = [toRow(headerRow), separator, ...rows.slice(1).map(toRow)];
  return `\n${lines.join('\n')}\n`;
}

function normaliseText(text) {
  return text
    .split('\n')
    .map(line => line.trimEnd())          
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')          
    .trim();
}

function getHostname() {
  return window.location.hostname.toLowerCase();
}

function detectPlatform() {
  const host = getHostname();
  if (host.includes('openai.com') || host.includes('chatgpt.com')) return 'chatgpt';
  if (host.includes('claude.ai')) return 'claude';
  if (host.includes('gemini.google.com')) return 'gemini';
  return null;
}