/*  */
'use strict';

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.info('[Chat Extractor] Extension installed.');
  } else if (reason === 'update') {
    console.info('[Chat Extractor] Extension updated.');
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'ok' });
  }
  
  return true;
});