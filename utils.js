export const localStorageJobsKey = "refreshJobs"
export const localStorageActiveTabsKey = "refreshJobsActiveTab"
export const maxNumOfJobsAllowed = 100;

export const isValidUrl = (url)=>{
    const urlPattern = /^(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    return urlPattern.test(url)
}

export async function getActiveTab(){
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });

    return tabs[0];
}

export const sendMessageToContentScript = (message)=>{
    const tabId = getActiveTab().id
    chrome.tabs.sendMessage(tabId, message);
}

export const fetchJobs = () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get([localStorageJobsKey], (obj) => {
            resolve(obj[localStorageJobsKey] ? JSON.parse(obj[localStorageJobsKey]) : [])
        })
    })
}

export const setJob = async (newJob)=>{
    const jobs = await fetchJobs()
    if(jobs.length === maxNumOfJobsAllowed){
        return // return something so that it can be used to display an error message back to the user
    }
    console.log('I got here')
    chrome.storage.sync.set({[localStorageJobsKey]: JSON.stringify([...jobs, newJob])})
}

export const setJobs = (jobs)=>{
    chrome.storage.sync.set({[localStorageJobsKey]: JSON.stringify(jobs)})
}

export const convertToSeconds = (min = 0, sec = 0)=>{
    console.log(min)
    let seconds = 0
    if(min && min > 0){
        seconds = (min * 60) + sec
        return seconds
    }
    seconds = sec > 0 ? parseInt(sec) : seconds
    console.log(sec)
    return seconds
}