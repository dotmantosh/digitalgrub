chrome.tabs.onUpdated.addListener((tabId, currentTab)=>{
  sendTabsToContentScripts(tabId, currentTab)
})
// Get the tabs and send the data to content scripts
async function sendTabsToContentScripts(tabId, currentTab) {
    await chrome.tabs.query({}, function(tabs) {
      console.log(tabs)
      var tabsData = tabs.map(function(tab) {
        return {
          id: tab.id,
          url: tab.url
        };
      });
      
      chrome.tabs.sendMessage(tabId, { action: 'tabsData', tabs: tabsData, currentTab: currentTab });
    });
  }
  
  // Listen for messages from content scripts
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getTabs') {
      sendTabsToContentScripts();
    }
  });