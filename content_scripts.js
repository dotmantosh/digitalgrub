(async ()=>{
    let currentJobs = [];
    let refreshJobsId = 'refreshJobs'

    chrome.runtime.onMessage.addListener((obj, sender, response)=>{
        const {tabs} = obj
        console.log(tabs)
    })
    
    const fetchJobs = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([refreshJobsId], (obj) => {
                resolve(obj[refreshJobsId] ? JSON.parse(obj[refreshJobsId]) : [])
            })
        })
    }

    const addNewJob = async (newJob)=>{
        console.log(newJob)
        currentJobs = await fetchJobs()
        chrome.storage.sync.set({
            [refreshJobsId]: JSON.stringify([...currentJobs, newJob].sort((a,b)=>a.createdAt - b.createdAt))
        })
        currentJobs = await fetchJobs()  // remove if found redundant
    }
    currentJobs = await fetchJobs()
    console.log(currentJobs)
})()

// Request the tabs data from the background script
/* chrome.runtime.sendMessage({ action: 'getTabs' });

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'tabsData') {
    var tabs = request.tabs;

    // Do something with the tabs data received from the background script
    console.log('Received tabs:', tabs);

    // You can perform any necessary actions with the tabs data here
    // For example, iterate over the tabs and access their properties
  }
}); */