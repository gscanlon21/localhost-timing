// Get the saved stats and render the data in the popup window.
const MAX_ITEMS = 15;

function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return sum(array[a].requests.map(r => r.duration)) <= sum(array[b].requests.map(r => r.duration));
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

function range(numbers) {
  numbers.sort((a, b) => a - b);
  return [numbers[0], numbers[numbers.length - 1]];
}

function sum(numbers) {
  return numbers.reduce((acc, val) => acc + val, 0);   
}

function avg(numbers) {
  return sum(numbers) / numbers.length;   
}

function median(numbers){
  if (numbers.length === 0) { return 0 };

  numbers.sort((a, b) => a - b);

  var half = Math.floor(numbers.length / 2);

  if (numbers.length % 2) { return numbers[half]; }

  return (numbers[half - 1] + numbers[half]) / 2.0;
}

var gettingStoredStats = browser.storage.local.get();
gettingStoredStats.then(results => {
  document.getElementById("cleared-date").textContent = new Date(results.clearedDate);
  if (results.hosts === undefined || results.hosts.length === 0) { return; }

  let hostElement = document.getElementById("hosts");
  let sortedHosts = sorter(results.hosts);
  addElements(hostElement, sortedHosts, (key) => {
    let host = results.hosts[key];
    let rSum = sum(host.requests.map(r => r.duration));
    let rAvg = avg(host.requests.map(r => r.duration));
    let rMedian = median(host.requests.map(r => r.duration));
    let rRange = range(host.requests.map(r => r.duration));
    return `${key}: total = ${rSum} ms, avg = ${rAvg}, median = ${rMedian}, range = ${rRange}`;
  });
});

document.getElementById("clear-data").addEventListener('click', function(e) {
  browser.storage.local.clear();
  browser.storage.local.set({ clearedDate: Date.now() });
  browser.runtime.reload();
});
