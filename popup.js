// Get the saved stats and render the data in the popup window.
const hostElement = document.getElementById("hosts");
const MAX_ITEMS = 15;

function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return sum(array[a].requests.map(r => r.duration)) <= sum(array[b].requests.map(r => r.duration));
  });
}

function addItem(header, content) {
  let dt = document.createElement("dt");
  let dd = document.createElement("dd");
  dt.textContent = header;
  dd.textContent = content;
  hostElement.appendChild(dt);
  hostElement.appendChild(dd);
}

var gettingStoredStats = browser.storage.local.get();
gettingStoredStats.then(results => {
  if (results.hosts === undefined || results.hosts.length === 0) { return; }
  document.getElementById("cleared-date").textContent = new Date(results.clearedDate);

  while (hostElement.firstChild) {
    hostElement.removeChild(hostElement.firstChild);
  }

  let stats = calculateStats(Object.values(results.hosts).reduce((acc, val) => acc.concat(val.requests.map(r => r.duration)), []));
  addItem("Total", stats);
  let sortedHosts = sorter(results.hosts);
  for (let i=0; i < sortedHosts.length; i++) {
    let key = sortedHosts[i];
    if (i >= MAX_ITEMS) { break; }

    let host = results.hosts[key];
    let stats = calculateStats(host.requests.map(r => r.duration));
    addItem(key, stats);
  }
});

function calculateStats(numbers) {
  let significantDurations = filterOutliers(numbers);
  let rTotal = significantDurations.length;
  let rSum = sum(significantDurations);
  let rAvg = Math.round(avg(significantDurations));
  let rMedian = Math.round(median(significantDurations));
  let rRange = range(significantDurations);
  return `(-outliers) total: ${rTotal}, duration: ${rSum}ms, avg: ${rAvg}ms, median: ${rMedian}ms, range: ${rRange}`;
}

document.getElementById("clear-data").addEventListener('click', function(e) {
  browser.storage.local.clear();
  browser.storage.local.set({ clearedDate: Date.now() });
  browser.runtime.reload();
});

// These should be in a module as soon as I can figure out how those work in a browser addon
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

  let half = Math.floor(numbers.length / 2);

  if (numbers.length % 2) { return numbers[half]; }

  return (numbers[half - 1] + numbers[half]) / 2.0;
}

function filterOutliers(numbers) {
  if (numbers.length < 4) { return numbers; }

  let values = numbers.slice().sort((a, b) => a - b);

  let q1 = getQuantile(values, 25);
  let q3 = getQuantile(values, 75);

  let iqr, maxValue, minValue;
  iqr = q3 - q1;
  maxValue = q3 + iqr * 1.5;
  minValue = q1 - iqr * 1.5;

  return values.filter((x) => (x >= minValue) && (x <= maxValue));
}

function getQuantile (array, quantile) {
  // Get the index the quantile is at
  let index = quantile / 100.0 * (array.length - 1);

  // Check if it has decimal places
  if (index % 1 === 0) {
      return array[index];
  } else {
      // Get the lower index
      let lowerIndex = Math.floor(index);
      // Get the remaining
      let remainder = index - lowerIndex;
      // Add the remaining to the lowerindex value
      return array[lowerIndex] + remainder * (array[lowerIndex + 1] - array[lowerIndex]);
  }
}