// Load existent stats with the storage API.
var gettingStoredStats = browser.storage.local.get();

gettingStoredStats.then(results => {
    // Initialize the saved stats if not yet initialized.
    if (!results.hosts) {
        results = {
            currentRequests: { },
            hosts: { }
        };
    }

    browser.webRequest.onBeforeRequest.addListener((evt) => {
        // For a top-level document, documentUrl is undefined
        if (evt.documentUrl !== undefined) { return; }

        results.currentRequests[evt.requestId] = results.currentRequests[evt.requestId] || { };
        results.currentRequests[evt.requestId].startTime = evt.timeStamp;

        // Persist the updated stats.
        browser.storage.local.set(results);

    }, {urls: ["*://localhost/*"]});

    browser.webRequest.onCompleted.addListener((evt) => {
        // For a top-level document, documentUrl is undefined
        if (evt.documentUrl !== undefined) { return; }
        
        let endTime = evt.timeStamp;
        let url = new URL(evt.url);
        let currentRequest = results.currentRequests[evt.requestId];
        currentRequest.duration = endTime - results.currentRequests[evt.requestId].startTime;
        results.hosts[url.href] = results.hosts[url.href] || { requests: [] };
        results.hosts[url.href].requests.push(currentRequest);
        delete results.currentRequests[evt.requestId];

        // Persist the updated stats.
        browser.storage.local.set(results);
        console.debug(results);
        
    }, {urls: ["*://localhost/*"]});
});
