console.log("running");
chrome.runtime.onMessage.addListener(gotMessage);

/**
 * adds a style tag to head of document with a user defined string as its content.
 * @param {string} styleString
 */
function addStyle(styleString) {
  const style = document.createElement("style");
  style.textContent = styleString;
  document.head.append(style);
}

/**
 * recieves payload from background script and injects
 * user defind js and css into current webpage.
 * @param {*} message
 * @param {*} sender
 * @param {*} sendResponse
 */
function gotMessage(message, sender, sendResponse) {
  console.log("IN GOT MESSAGE FUNCTION");
  console.log(message);

  eval(message.js);
  addStyle(message.css);
}
