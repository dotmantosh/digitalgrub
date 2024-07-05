
(async ()=>{
    
    const intervals = {};
    const sendMessageToServiceWorker = (message) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (response.success) {
              // Reload started successfully
              console.log('Reload started for URL:', response.sender);
            } else {
              // Reload failed
              console.log('Failed to start reload for URL:', response.sender);
            }
          });
    }
    const activeJob = (job)=>{
        sendMessageToServiceWorker({ action: 'startReload', job: job })
        /* if (job.active) {
            console.log('I activated this job: ', job )
            console.log(job.id, intervals[job.id])
            if(!intervals[job.id]){
                const intervalId = setInterval(async() => {
                console.log('I set the interval')
                await chrome.tabs.query({ url: job.url }, (tabs) => {
                    if (tabs.length > 0) {
                        tabs.forEach((tab) => {
                        chrome.tabs.reload(tab.id);
                        });
                    } else {
                        chrome.tabs.create({ url: job.url, active:true });
                    }
                });
            }, job.interval * 1000);
    
                intervals[job.id] = intervalId;
            }
          
        } */
    }


  function stopJobReload(job) {
    if (intervals[job.id]) {
      clearInterval(intervals[job.id]);
      delete intervals[job.id];
    }
  }
	chrome.runtime.onMessage.addListener(async (obj, sender, sendResponse)=>{
		console.log('I got here')
        const {type, jobs, job} = obj
            if(type === 'getActiveTab'){
                await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length > 0) {
                      sendResponse({ tabId: tabs[0].id });
                    } else {
                      sendResponse({ tabId: null });
                    }
                  });
                  return true;
            }
            if(type === 'jobAdded'){
                console.log(type)
				        console.log(job)
                console.log(sender.tab.url )
				/* activeJob(job) */
                
			}

			if(type === 'onContentLoad'){
				console.log('On Content Load')
        console.log(jobs)
        console.log(sender.tab.url )
				jobs.forEach((job)=>activeJob(job))
			}

			if(type === 'jobStatusChange'){
					jobs.forEach((job)=>{
							if(job.active){
									if(!intervals[job.id]){
											activeJob(job)
									}
							}else{
									stopJobReload(job)
							}
					})
			}
			
			if(type === 'jobDelete'){
					jobs.forEach((job)=>{
							if(intervals[job.id]){
									stopJobReload(job)
							}
					})
			}

	})
    
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

  const fetchJobs = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([localStorageJobsKey], (obj) => {
                resolve(obj[localStorageJobsKey] ? JSON.parse(obj[localStorageJobsKey]) : [])
            })
        })
    }
}); */