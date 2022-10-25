const sites = document.querySelector("#site-names")
const website = document.querySelector("#site-name-input") 
const js = document.querySelector("#js-textarea") 
const css = document.querySelector("#css-textarea")
const button = document.querySelector(".submit")

function setErrorRemovalListeners() {
   js.addEventListener("input", () => {
       if (js.parentElement.hasAttribute("data-error")) js.parentElement.removeAttribute("data-error")
   })

   website.addEventListener("input", () => {
        if (website.parentElement.hasAttribute("data-error")) website.parentElement.removeAttribute("data-error")
    })
}

setErrorRemovalListeners()
populateFromStorage()
// make a "valid url" "valid jss" and "valid css" functions for error checking

/**
 * Checks if user string is valid javascript
 * @param {string} js javascript to be validated
 * @returns {boolean} 
 */
function isValidJs(js) {
    let isValid = true; 
    try {
        eval(js)
    } catch (error) {
        isValid = false; 
        console.log(error)
    }
    return isValid
}


/**
 * Checks if user string is a valid url 
 * @param {string} url url to be validated 
 * @returns {boolean}
 */
function isValidUrl(url) {
    let isValid = true; 
    try {
        new URL(url)
    } catch (error) {
        isValid = false; 
        console.log(error)
    }
    return isValid
}

/**
 * Deletes selected saved style (both css and js) 
 * from local storage and background script.  
 * @param {object} payload user defined javascript and css encapsulated in object 
 * @param {div} container container to be deleted 
 */
function deleteEntry(payload, container) {
    const message = {
        action: "delete", 
        payload
    }

    // delete current container from sites div 
    container.remove()
    // delete from local storage
    localStorage.removeItem(payload.website)

    chrome.runtime.sendMessage(message)
}


/**
 * Sends appropiate message to background script and replaces old styles with new ones.
 * @param {string} key website name
 * @param {string} jsInput user inputted javascript 
 * @param {string} cssInput user inputted css
 */
function sendEditMessage(key, jsInput, cssInput) {

    console.log(jsInput.value)
    
    const payload = {
        website: key, 
        js: jsInput.value,
        css: cssInput.value,
    }

    console.log("this is new pl", payload)
    const message = {
        action: "edit", 
        payload
    }
    localStorage.setItem(payload.website, JSON.stringify(payload))
    chrome.runtime.sendMessage(message)

}

/**
 * Populates the required html and event handlers needed to add in edit styles/js functionaly. 
 * @param {object} payload user defined javascript and css encapsulated in object 
 * @param {div} container div that will display the edit menu
 * @param {button} editButton button which prompts the edit menu 
 * @param {button} backButton button which exits the edit menu
 */
function editEntry(payload, container, editButton, backButton) {
    const editContainer = document.createElement("div")
    editContainer.classList.add("edit-container")
    editContainer.classList.add("fade-in")
     
    const jsHeader = document.createElement("h2"); 
    jsHeader.innerText = "Javascript"
    const jsInput = document.createElement("textarea")
    jsInput.rows = 10; jsInput.cols = 10

    const cssHeader = document.createElement("h2"); 
    cssHeader.innerText = "CSS"
    const cssInput = document.createElement("textarea")
    cssInput.rows = 10; cssInput.cols = 10

    const confirmButton = document.createElement("button") 
    confirmButton.innerText = "Confirm"
    confirmButton.classList.add("confirm-button")

    editContainer.append(jsHeader, jsInput, cssHeader, cssInput, confirmButton)
    confirmButton.addEventListener("click", () =>  {sendEditMessage(payload.website, jsInput, cssInput), exit(backButton, editButton, editContainer)})

    // get values from local storage 
    const siteData = JSON.parse( localStorage.getItem(payload.website) )
    console.log("IN EDIT, THIS IS THE SITE DATA", siteData)

    
    jsInput.value = siteData.js
    cssInput.value = siteData.css

    editButton.classList.add("hidden")
    backButton.classList.remove("hidden")
    
    container.append(editContainer)
    backButton.addEventListener("click", () => exit(backButton, editButton, editContainer))

}

/**
 * Populates required html and event handlers to display the recently added site
 * which has been stored in the background script.  
 * @param {object} payload user defined javascript and css encapsulated in object
 */
function populateSite(payload) {
    const container = document.createElement("div")
    container.classList.add("container")

    const detailsContainer = document.createElement("div")
    container.classList.add("details-container")

    const buttonsContainer = document.createElement("div")
    container.classList.add("buttons-container")

    const editButton = document.createElement("button")
    editButton.classList.add("edit-button")

    const backButton = document.createElement("button")
    backButton.classList.add("back-button")
    backButton.classList.add("hidden")

    const deleteButton = document.createElement("button")
    deleteButton.classList.add("delete-button")

    const url = document.createElement("h3")
    url.classList.add("url")

    url.innerText = payload.website
    editButton.innerText = "Edit"
    backButton.innerText = "Back"
    deleteButton.innerText = "Delete"

    sites.append(detailsContainer)
    detailsContainer.append(container)
    container.append(url, buttonsContainer)
    buttonsContainer.append(editButton, backButton, deleteButton)

    deleteButton.addEventListener("click", () => deleteEntry(payload, detailsContainer))
    editButton.addEventListener("click", () => editEntry(payload, detailsContainer, editButton, backButton))
    
}


/**
 * Called when user is exits the edit menu for a sepcific style.
 * The edit and back buttons are replaced with eachother and a
 * small fade out animation is run. 
 * @param {button} backButton 
 * @param {button} editButton 
 * @param {div} editContainer 
 */
function exit(backButton, editButton, editContainer) {
    
    editButton.classList.remove("hidden")
    backButton.classList.add("hidden")

    // remove edit container after playing animation
    
    editContainer.classList.remove("fade-in")
    editContainer.addEventListener("animationend", () =>  {
        editContainer.remove()
    })
    editContainer.classList.add("fade-out")
    
}

/**
 * Populates stored styles data to be displayed and edited to the user as they see fit.
 */
function populateFromStorage() {
    
    const items = { ...localStorage };
    console.log("IN POPULATE FROM LOCAL STORAGE")
    console.log("the items in ls are", items)

    // populate items sites div using local storage
    for (const property in items) {
        const payload = JSON.parse(items[property])
        console.log(payload)
        populateSite(payload)
        // add items in background script on browser start
        //chrome.runtime.sendMessage({action: "add", payload})

    }
    
}

button.addEventListener("click", () => {
    console.log("clicked")
    // check if url is valid 
    if ( isValidUrl(website.value.replace("www.", "")) && isValidJs(js.value) ) {
        url = new URL( website.value.replace("www.", "") )

        const payload = {
            website: url.href, 
            js: js.value, 
            css: css.value
        }

        // add site data 
        addSite(payload)
    }else if (! isValidUrl(website.value.replace("www.", "")) ) {
        document.querySelector(".site-name").setAttribute("data-error",  "Invalid Website Name")
    }else {
        document.querySelector(".js-input").setAttribute("data-error",  "Invalid Javascript")
    }
    
    
    
})

/**
 * Sends user defined javascript and css to background script to be stored and ran
 * when the selected site is visited. If site is already in storage, the user is prompted
 * with a warning message asking if they would like to override their previous styles.  
 * @param {object} payload 
 */
function addSite(payload) {
    console.log("in ADDSITE function")
    console.log(sites)
    
    const items = {...localStorage}
    if (items.hasOwnProperty(payload.website)) {
        // alert user that previous styles for website will be overided 
        const override = confirm(`Clicking Ok will override your previous styles for ${payload.website}`)
        if (override) {
            // send edit message to background script
            const message = {action: "edit", payload}
            chrome.runtime.sendMessage(message)
            localStorage.setItem(payload.website, JSON.stringify(payload))
            alert("Your styles have been updated")
        }
    }else { // add new entry at top of page and send add message to background script
        const message = {action: "add", payload}
        chrome.runtime.sendMessage(message)
        populateSite(payload)
        localStorage.setItem(payload.website, JSON.stringify(payload))
    }

}