let sites = [];
console.log("background running, these are the sites", sites);

chrome.storage.local.get(["savedSites"], function (result) {
  console.log(result);
  if (result.savedSites) sites = result.savedSites;
});

// listen
chrome.browserAction.onClicked.addListener(openDashboard);
chrome.runtime.onMessage.addListener(gotMessage);
chrome.tabs.onUpdated.addListener(tabUpdated);

/**
 * Checks if a given url already exists.
 * Return index of site if it does, -1 if not found
 * @param {string} website
 * @returns {number}
 */
function siteExists(website) {
  console.log("IN SITE EXISTS");
  for (let i = 0; i < sites.length; i++) {
    if (sites[i].website === website) return i;
  }
  console.log("SITE DOES NOT EXIST");
  return -1;
}

/**
 * Checks if a given url string is in storage.
 * Returns index if found, returns -1 if not found.
 * @param {string} url
 * @returns {number}
 */
function urlInSites(url) {
  console.log("in URL IN SITES function");
  for (let i = 0; i < sites.length; i++) {
    const website = new URL(sites[i].website);
    // check if it's
    console.log(url);
    console.log(website);
    if (url.host.replace("www.", "") === website.host) {
      console.log("found match");
      return i;
    }
  }
  return -1;
}

/**
 * Checks if the current site matches a site in storage every time
 * the tab updates. Sends message to content script using the saved styles
 * for the current site if a match is found.
 * @param {*} tabId
 * @param {*} changeInfo
 * @param {*} tab
 */

function tabUpdated(tabId, changeInfo, tab) {
  console.log("in TAB UPDTED function");

  console.log(tab.url);
  // check if current url is in saved urls
  console.log(urlInSites(new URL(tab.url)));
  //if (changeInfo.status == "complete") {
  const index = urlInSites(new URL(tab.url));
  console.log("THIS IS THE INDEX");
  if (index !== -1) {
    console.log("SENDING MESSAGE");
    chrome.tabs.sendMessage(tabId, sites[index]);
  }
  //}
}

/**
 * Recieves message from dashboard and either:
 * a) Deletes a certain saved style from storage
 * b) Edits a saved style in storage
 * c) Adds a new style to storage
 * @param {object} message
 * @param {*} sender
 * @param {*} sendResponse
 */
function gotMessage(message, sender, sendResponse) {
  console.log("in GOT MESSAGE function");
  console.log(message);

  if (message.action) {
    const { payload } = message;
    const index = siteExists(payload.website);
    if (message.action === "delete") {
      console.log("delete");
      sites.splice(index, 1);
    } else if (message.action === "edit") {
      console.log("edit");
      sites.splice(index, 1, payload);
    } else if (message.action === "add") {
      console.log("add");
      if (index === -1) {
        sites.push(payload);
      } else {
        sites[index] = payload;
      }
    }

    chrome.storage.local.set({ savedSites: sites });
  }
  // if site exists, replace site
}
/**
 * Event handler for when extension icon is clicked. Opens dashboard.
 */
function openDashboard() {
  console.log("in BUTTON CLICKED function");
  chrome.tabs.create({
    url: chrome.extension.getURL("dashboard.html"),
    selected: true,
  });
}
