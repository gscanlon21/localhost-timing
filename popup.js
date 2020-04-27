// Get the saved stats and render the data in the popup window.
const MAX_ITEMS = 15;

function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return array[a].duration <= array[b].duration;
  });
}

function addElements(element, array, callback) {
  while(element.firstChild) {
    element.removeChild(element.firstChild);
  }

  for (let i=0; i < array.length; i++) {
    if (i >= MAX_ITEMS) { break; }

    const listItem = document.createElement("li");
    listItem.textContent = callback(array[i]);
    element.appendChild(listItem);
  }
}

var gettingStoredStats = browser.storage.local.get();
gettingStoredStats.then(results => {
  document.getElementById("cleared-date").textContent = new Date(results.clearedDate);
  if (results.host.length === 0) {
    return;
  }

  let hostElement = document.getElementById("hosts");
  let sortedHosts = sorter(results.host);
  addElements(hostElement, sortedHosts, (host) => {
    return `${host}: ${results.host[host].duration} ms`;
  });
});

document.getElementById("clear-data").addEventListener('click', function(e) {
  browser.storage.local.clear();
  browser.storage.local.set({ clearedDate: Date.now() })
})