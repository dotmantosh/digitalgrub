
/* chrome.tabs.onUpdated.addListener((tabId, currentTab)=>{
  sendTabsToContentScripts(tabId, currentTab)
}) */
// Get the tabs and send the data to content scripts
const localStorageJobsKey = "refreshJobs"
const intervalIds = {}
const timeoutIds = {}

function queryTabs(queryInfo) {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, (tabs) => {
      resolve(tabs);
    });
  });
}
/* const tabs = await queryTabs({}) */
async function sendMessageToContentScript( message) {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})
  chrome.tabs.sendMessage(tab.id, message);
}

const fetchJobs = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([localStorageJobsKey], (obj) => {
      resolve(obj[localStorageJobsKey] ? JSON.parse(obj[localStorageJobsKey]) : [])
    })
  })
}
function stopJobReload(job) {
  if(timeoutIds[job.id]){
    delete timeoutIds[job.id]
  }
  if (intervalIds[job.id]) {
    clearInterval(intervalIds[job.id]);
    delete intervalIds[job.id];
  }
}

function createUrlPattern(url) {
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/^www\./, ''); // Remove 'www.' from the hostname
  const protocol = urlObj.protocol.slice(0, -1); // Remove ':' from the protocol

  return `*://*.${domain}/*`;
}

const setJobInterval = async (job) => {
  
  if (!intervalIds[job.id]) {
    const intervalId = setInterval(async () => {
      console.log('I set the interval for ' + job);
      // console.log(newTabs)
      const urlPattern = job.url.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape special characters
      const matchPattern = `*://*${urlPattern}/*`;
      const matchingTabs = await chrome.tabs.query({ "url": [createUrlPattern(job.url)]});

      console.log(matchingTabs);
      if(!matchingTabs || matchingTabs.length === 0){
        console.log('I created this job')
        chrome.tabs.create({ url: job.url, active: true });
      } else {
        console.log('I reloaded ' + job.url)
        chrome.tabs.reload( matchingTabs[0].id);
      }
    }, job.interval * 1000);

    intervalIds[job.id] = intervalId;
  }
};

const startJobReload = async (job)=>{
  console.log('I got here')
  // const tabs = await chrome.tabs.query({ url: job.url });
  
  if (job.active) {
    if(job.duration && !timeoutIds[job.id]){
      console.log(job.url + ' duration is ' + job.duration)
      const timeoutId = setTimeout(()=>{
        stopJobReload(job)
        delete timeoutIds[job.id]
        console.log('duration stopped the interval')
      },job.duration)
      timeoutIds[job.id] = timeoutId
    }
    setJobInterval(job)
    console.log('I activated this job: ', job )
    console.log(job.id, intervalIds[job.id])
  
  }

}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
  const {type, jobs, job } = obj
  if (type === 'updateJobs') {
    const newJobs = jobs;

    // Check if it's the first time the jobs are created
    chrome.storage.sync.get('refreshJobs', (data) => {
      if (!data.refreshJobs) {
        // Jobs are created for the first time, do something
        console.log('First time jobs created:', newJobs);
        // You can send a message here or perform any other action
      }
    });

    // Save the updated jobs to chrome.storage
    chrome.storage.sync.set({ refreshJobs: newJobs }, () => {
      sendResponse({ success: true });
    });

    // Return true to indicate that we will respond asynchronously
    return true;
  }
  
  if(type === 'startReload'){
    console.log(job)
    sendResponse({ success: true, sender: sender.tabs.url });
    // await startJobReload()
  }
});

const onExtensionInstalled = async()=>{
  chrome.storage.sync.get('refreshJobs', ({ refreshJobs }) => {
    // Check if "refreshJobs" is already defined
    if (!refreshJobs) {
      const jobs = []
      chrome.storage.sync.set({[localStorageJobsKey]: JSON.stringify(jobs)}, () => {
        console.log('Initial value for "refreshJobs" set as an empty array');
      });
    }
  });
  const jobs = await fetchJobs()
  const message = { type: 'onContentLoad', jobs };
  sendMessageToContentScript(message);
    // Get the current value of the "refreshJobs" key in the storage
}

(async function() {
  chrome.runtime.onInstalled.addListener(onExtensionInstalled)
  const jobs = await fetchJobs()
  console.log('i sent message')
  const message = { type: 'onContentLoad', jobs };
  sendMessageToContentScript(message);

})()
// Example: Sending a message to the content script of a specific tab
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes[localStorageJobsKey]) {
    const newJobs = changes[localStorageJobsKey].newValue ? JSON.parse(changes[localStorageJobsKey].newValue) : [];

    if (newJobs) {
      (async () => {
        
        for (const job of newJobs) {
          console.log(job);
          if (job.active) {
            startJobReload(job);
          } else {
            stopJobReload(job);
          }
        }
        console.log('Updated jobs:', newJobs);
        // Perform any necessary actions with the updated jobs
      })();
    }
  }
});