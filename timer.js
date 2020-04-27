// Load existent stats with the storage API.
var gettingStoredStats = browser.storage.local.get();

gettingStoredStats.then(results => {
    // Initialize the saved stats if not yet initialized.
    if (!results.host) {
        results = {
            currentRequest: {},
            host: {}
        };
    }

    browser.webRequest.onBeforeRequest.addListener((evt) => {
        // For a top-level document, documentUrl is undefined
        if (evt.documentUrl !== undefined) { return; }

        console.debug(evt);

        const url = new URL(evt.url);
        results.currentRequest[evt.requestId] = results.currentRequest[evt.requestId] || {};
        results.currentRequest[evt.requestId].startTime = evt.timeStamp;

        // Persist the updated stats.
        browser.storage.local.set(results);

    }, {urls: ["*://localhost/*"]});

    browser.webRequest.onCompleted.addListener((evt) => {
        // For a top-level document, documentUrl is undefined
        if (evt.documentUrl !== undefined) { return; }
        
        console.debug(evt);

        const endTime = evt.timeStamp;
        const url = new URL(evt.url);
        results.host[url.href] =  results.host[url.href] || {};
        results.host[url.href].duration = results.host[url.href].duration || 0
        results.host[url.href].duration += endTime - results.currentRequest[evt.requestId].startTime;

        // Persist the updated stats.
        browser.storage.local.set(results);
        console.debug(results);

    }, {urls: ["*://localhost/*"]});



    // browser.webNavigation.onCompleted.addListener(evt => {
    //     if (evt.frameId !== 0) { return; }
    // }, {
    //     url: [{schemes: ["http", "https"]}]}
    // );
});
