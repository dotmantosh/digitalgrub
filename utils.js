export async function getActiveTab(){
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });

    return tabs[0];
}

export const fetchJobs = () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(["refreshJobs"], (obj) => {
            resolve(obj["refreshJobs"] ? JSON.parse(obj["refreshJobs"]) : [])
        })
    })
}