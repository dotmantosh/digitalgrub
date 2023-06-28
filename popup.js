import { fetchJobs, getActiveTab } from "./utils.js";

const currentJobsBtn = document.getElementById("current-jobs-btn")
const createNewBtn = document.getElementById("create-new-btn")
/* const historyBtn = document.getElementById("history-btn") */

const currentTab = ''

currentJobsBtn.addEventListener('click', ()=>{switchTab('current-jobs')})
createNewBtn.addEventListener('click', ()=>{switchTab('create-new')})
/* historyBtn.addEventListener('click', ()=>{switchTab('history')}) */

const currentJobsTabDiv = document.getElementById("current-jobs")
const createNewTabDiv = document.getElementById("create-new")
/* const historyTabDiv = document.getElementById("history") */

const switchTab = (tab)=>{

    if(tab === "current-jobs"){
        currentJobsBtn.classList.add("tab-active")
        createNewBtn.classList.remove("tab-active")
       /*  historyBtn.classList.remove("tab-active") */

        currentJobsTabDiv.classList.add("active-section")
        createNewTabDiv.classList.remove("active-section")
        historyTabDiv.classList.remove("active-section")
        
    } else if (tab === "create-new"){
        createNewBtn.classList.add("tab-active")
        currentJobsBtn.classList.remove("tab-active")
        /* historyBtn.classList.remove("tab-active") */

        createNewTabDiv.classList.add("active-section")
        currentJobsTabDiv.classList.remove("active-section")
        historyTabDiv.classList.remove("active-section")
    } else if(tab === "history"){
        historyBtn.classList.add("tab-active")
        createNewBtn.classList.remove("tab-active")
        currentJobsBtn.classList.remove("tab-active")
        
        historyTabDiv.classList.add("active-section")
        createNewTabDiv.classList.remove("active-section")
        currentJobsTabDiv.classList.remove("active-section")
    }
    currentTab = tab
}

const addNewJob = ()=>{}
const editJob = ()=>{}
const deleteJob = ()=>{}
const viewJobs = (jobs)=>{

}

document.addEventListener("DOMContentLoaded", async ()=>{
    const activeTab = await getActiveTab()
    const jobs = await fetchJobs()
    if (jobs && jobs.length){
        viewJobs(jobs)
    } else{
        const currentJobDiv = document.getElementById("current-job")
        const currentJobsActionDiv = document.getElementById("current-jobs-actions")

        currentJobDiv.innerHTML = '<h4>No Jobs to show. Create New</h4>'
        currentJobsActionDiv.classList.add("display-none")
    }
    console.log(jobs)
    console.log(activeTab)


})