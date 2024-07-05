import { fetchJobs, getActiveTab, isValidUrl, setJob, setJobs, convertToSeconds } from "./utils.js";

const currentJobsBtn = document.getElementById("current-jobs-btn")
const createNewBtn = document.getElementById("create-new-btn")
/* const historyBtn = document.getElementById("history-btn") */

currentJobsBtn.addEventListener('click', ()=>{switchTab('current-jobs')})
createNewBtn.addEventListener('click', ()=>{switchTab('create-new')})
/* historyBtn.addEventListener('click', ()=>{switchTab('history')}) */

const currentJobsTabDiv = document.getElementById("current-jobs")
const createNewTabDiv = document.getElementById("create-new")
/* const historyTabDiv = document.getElementById("history") */


//Form elements
const urlInput = document.getElementById("url")
const oftenInput = document.getElementById("often")
const oftenMinInput = document.getElementById("often-min")
const durationMinInput = document.getElementById("duration-min-input")
const durationSecInput = document.getElementById("duration-sec-input")
const switchOnInit = document.getElementById("switch-on-init")
const switchOnInitDiv = document.getElementById("switch-on-init-display")
const createBtn = document.getElementById("createbtn")
const createForm =document.getElementById("create-job")
const currentJobDiv = document.getElementById("current-job")
const currentJobsActionDiv = document.getElementById("current-jobs-actions")
const pauseBtn = document.getElementById("pause")
const runBtn = document.getElementById("run")
const deleteBtn = document.getElementById("delete-jobs")

let jobsToWorkOn = [];

let action = 'create'

const ToggleSwitchOnInit = function(e){
    console.log(switchOnInit.checked)
    if(switchOnInit.checked){
        switchOnInitDiv.firstChild.classList.add("checked")
    } else{
        switchOnInitDiv.firstChild.classList.remove("checked")
    }
}

const handleJobArray = (checkbox, job)=>{
    if(checkbox.checked){
        if(jobsToWorkOn.includes(job.id)){
            return
        }
        jobsToWorkOn.push(job.id)
    }else{
        jobsToWorkOn.splice(jobsToWorkOn.indexOf(job.id), 1)
    }
    console.log(jobsToWorkOn)
}

const handleJobObj = (job)=>{
    action = 'edit'
    const intervalObj = moment.duration(job.interval, 'seconds');
    const durationObj = moment.duration(job.duration, 'seconds');
    const intervalMinutes = Math.floor(intervalObj.minutes());
    const durationMinutes = Math.floor(durationObj.minutes());
    const formattedIntervalMinutes = intervalMinutes.toString().padStart(2, '0');
    const formattedDurationMinutes = durationMinutes.toString().padStart(2, '0');
    const formattedIntervalSeconds = intervalObj.seconds().toString().padStart(2, '0');
    const formattedDurationSeconds = durationObj.seconds().toString().padStart(2, '0');
    jobsToWorkOn.push(job.id)
    urlInput.value = job.url
    oftenInput.value = formattedIntervalSeconds
    oftenMinInput.value = formattedIntervalMinutes
    durationMinInput.value = formattedDurationMinutes
    durationSecInput.value = formattedDurationSeconds
    switchOnInit.checked = job.active
    createBtn.textContent = 'Edit'
    createNewTabDiv.classList.add("active-section")
    currentJobsTabDiv.classList.remove("active-section")
    // historyTabDiv.classList.remove("active-section")
}

async function sendMessageToContentScript(message) {
    // Query the active tab
    /* const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})
    console.log(tab)
    chrome.tabs.sendMessage(tab.id, message);
    console.log("lets see if chrome.tabs.sendMessage is sending a message from " + message.type) */
    let response;
    if(message.type === 'getActiveTab'){
        response = await chrome.runtime.sendMessage({ type: 'getActiveTab' });
    }
    
    console.log(response)
    if (response.tabId) {
        chrome.tabs.sendMessage(response.tabId, message);
      // Send message to the content script using the obtained tabId
      console.log(`Message sent from popup to content script: ${message.type}`);
    } else {
      console.log('No active tab found.');
    }
  }

function newJobAdded(job) {
    // Create the elements
    const jobContainer = document.createElement('div');
    jobContainer.className = 'current-job-body';
  
    const urlContainer = document.createElement('div');
    urlContainer.className = 'current-job-body-url';
  
    const urlCheckbox = document.createElement('input');
    urlCheckbox.type = 'checkbox';
    urlCheckbox.name = 'current-job-url';
    urlCheckbox.id = 'current-job-url';
    urlCheckbox.addEventListener('change', ()=>{handleJobArray(urlCheckbox,job)})
  
    const urlLabel = document.createElement('label');
    if(job.url.length > 15){
        urlLabel.textContent = job.url.substring(0,15) + '...'
    }else{
        urlLabel.textContent = job.url;
    }
  
    const rightContainer = document.createElement('div');
    rightContainer.className = 'current-job-body-right';
  
    const statusDiv = document.createElement('div');
    statusDiv.textContent = job.active ? 'Active' : 'Inactive';
    statusDiv.classList.add(`${job.active ? 'job-active': 'job-inactive'}`)
  
    const intervalDiv = document.createElement('div');
    intervalDiv.textContent = job.interval + ' sec';
  
    const durationDiv = document.createElement('div');
    const durationObj = moment.duration(job.duration, 'seconds');
    const days = Math.floor(durationObj.asDays());
    const hours = Math.floor(durationObj.asHours());
    if (job.duration && job.duration > 0){
        if (days > 0){
            durationDiv.textContent = `${days} D, ${hours} hr`
        } else {
            const minutes = Math.floor(durationObj.minutes());
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const formattedSeconds = durationObj.seconds().toString().padStart(2, '0');
            durationDiv.textContent = `${formattedMinutes}:${formattedSeconds}`
        }
    }else{
        durationDiv.textContent = "until stopped"
    }
    
    
    const editDiv = document.createElement('div');
    editDiv.className = "edit-btn"
    editDiv.textContent = 'Edit';
    editDiv.addEventListener('click', ()=>{handleJobObj(job)})
    // Build the structure
    urlContainer.appendChild(urlCheckbox);
    urlContainer.appendChild(urlLabel);
    rightContainer.appendChild(statusDiv);
    rightContainer.appendChild(intervalDiv);
    rightContainer.appendChild(durationDiv);
    rightContainer.appendChild(editDiv);
    jobContainer.appendChild(urlContainer);
    jobContainer.appendChild(rightContainer);
    // Append the job to the #current-jobs div
    currentJobDiv.appendChild(jobContainer, currentJobDiv.firstChild);
}

const addErrorTextForUrlInput = (text)=>{
        urlInput.classList.add("input-error")
        const errorMessageElement = document.createElement("span")
        errorMessageElement.classList.add("input-error-text")
        errorMessageElement.textContent = text
        
        if(!document.querySelector('span.input-error-text')){
            urlInput.insertAdjacentElement("afterend", errorMessageElement)
            return
        }
        errorMessageElement.remove()
}

const addErrorTextForIntervalInput = ()=>{
    oftenInput.classList.add("input-error")
    const errorMessageElement = document.createElement("span")
    errorMessageElement.classList.add("input-error-text")
    errorMessageElement.textContent = "Please add reload interval"
    
    if(!document.querySelector('span.input-error-text')){
        oftenInput.insertAdjacentElement("afterend", errorMessageElement)
        return
    }
    errorMessageElement.remove()
}

const addNewJob = async (e)=>{
    e.preventDefault()
    const duration = convertToSeconds(durationMinInput.value.length ? parseInt(durationMinInput.value): 0 , durationSecInput.value.length ? parseInt(durationSecInput.value) : 0)

    const interval = convertToSeconds(oftenMinInput.value.length ? parseInt(oftenMinInput.value): 0 , oftenInput.value.length ? parseInt(oftenInput.value) : 0)
    
    if(!urlInput.value.length || interval <= 0){
        return
    }   
    if(!isValidUrl(urlInput.value)){
        if(document.querySelector("span.input-error-text")){
            return
        }
        addErrorTextForUrlInput("Please put a valid url")
        return
    }

    if(!interval || interval < 0){
        addErrorTextForIntervalInput("Please put a valid url")
    }
    const currentJobs = await fetchJobs()
    if(action !== 'edit' && currentJobs.find(job => job.url === urlInput.value)){
        if(document.querySelector("span.input-error-text")){
            return
        }
        addErrorTextForUrlInput("Url already exist")
        return
    }
    
    if(document.querySelector("span.input-error-text")){
        urlInput.classList.remove("input-error")
        document.querySelector("span.input-error-text").remove()
    }
    
    const newJob = {
        url: urlInput.value,
        interval: interval,
        duration: duration,
        active: switchOnInit.checked,
    }
    if(action === 'edit'){
        editJob(newJob)
        createForm.reset()
        /* urlInput.value = ""
        oftenInput.value = 0
        oftenMinInput.value = 0
        durationMinInput.value = 0
        durationSecInput.value = 0
        switchOnInit.checked = true */
        return
    }
    newJob.id = crypto.randomUUID(),
    newJob.createdAt = Date.now(),
    console.log('I got here')
    await setJob(newJob)
    /* urlInput.value = ""
    oftenInput.value = 0
    switchOnInit.checked = true */
    createForm.reset()
    newJobAdded(newJob)
    // const message = {
    //     type: 'jobAdded',
    //     job: newJob,
    // };
    // console.log('I got here')
    // sendMessageToContentScript(message)
}
const editJob = async(values)=>{
    const currentJobs = await fetchJobs()
    const newJobs = currentJobs.map(job => {
        if (jobsToWorkOn.includes(job.id)) {
          // Perform the necessary edit
          return { ...job, ...values }; // Example: Add an "edited" property
        }
        return job; // Return the job as-is if no edit is needed
      });
    setJobs(newJobs)
    updateUI(newJobs)
    if(Object.hasOwn(values, 'active')){
        const message = {
            type: 'jobStatusChange',
            jobs: jobsToWorkOn,
        };
        // sendMessageToContentScript(message)
    }
    jobsToWorkOn = [];
    

}
const deleteJob = async ()=>{
    const currentJobs= await fetchJobs()
    const remainingJobs = currentJobs.filter(job => !jobsToWorkOn.includes(job.id));
    setJobs(remainingJobs)
    updateUI(remainingJobs)
    const message = {
        type: "jobDelete",
        job: jobsToWorkOn
    }
    // sendMessageToContentScript(message)
    jobsToWorkOn = [];
}

function handleJobStatusChange(jobsToWorkOn) {
    
  }
function updateUI(jobs) {
    // Clear the existing UI
    currentJobDiv.innerHTML = '';
  
    // Render the updated job list
    jobs.forEach(job => {
      newJobAdded(job)
    });
}

const viewJobs = async (jobs)=>{
    jobs.forEach((job, index)=>{
        newJobAdded(job)
    })
}

const pauseJobs = ()=>{
    editJob({active: false})
}
const runJobs = ()=>{
    editJob({active: true})
}

const deleteJobs = ()=>{
    deleteJob()
}

switchOnInit.addEventListener("change", ToggleSwitchOnInit.bind(this))
createForm.addEventListener('submit', addNewJob)
pauseBtn.addEventListener('click', pauseJobs)
runBtn.addEventListener('click', runJobs)
deleteBtn.addEventListener('click', deleteJobs)

let currentTab = ''

const switchTab = (tab)=>{

    if(tab === "current-jobs"){
        currentJobsBtn.classList.add("tab-active")
        createNewBtn.classList.remove("tab-active")
       /*  historyBtn.classList.remove("tab-active") */

        currentJobsTabDiv.classList.add("active-section")
        createNewTabDiv.classList.remove("active-section")
        // historyTabDiv.classList.remove("active-section")
        
    } else if (tab === "create-new"){
        action = 'create'
        createNewBtn.classList.add("tab-active")
        currentJobsBtn.classList.remove("tab-active")
        createBtn.textContent = 'Create'
        /* historyBtn.classList.remove("tab-active") */

        createNewTabDiv.classList.add("active-section")
        currentJobsTabDiv.classList.remove("active-section")
        // historyTabDiv.classList.remove("active-section")

        urlInput.value = "" 
        oftenInput.value = ""
        oftenMinInput.value = ""
        durationMinInput.value = ""
        durationSecInput.value = ""
        switchOnInit.value = true
    } else if(tab === "history"){
        // historyBtn.classList.add("tab-active")
        createNewBtn.classList.remove("tab-active")
        currentJobsBtn.classList.remove("tab-active")
        
        // historyTabDiv.classList.add("active-section")
        createNewTabDiv.classList.remove("active-section")
        currentJobsTabDiv.classList.remove("active-section")
    }
    currentTab = tab
}

document.addEventListener("DOMContentLoaded", async ()=>{
    const activeTab = await getActiveTab()
    const jobs = await fetchJobs()
    
    if (jobs && jobs.length){
        const message = {
            type: "onContentLoad",
            jobs
        }
        viewJobs(jobs)
        // sendMessageToContentScript(message)
    } else{
        currentJobDiv.innerHTML = '<h4>No Jobs to show. Create New</h4>'
        currentJobsActionDiv.classList.add("display-none")
    }
})