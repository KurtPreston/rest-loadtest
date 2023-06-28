console.log('Start load test');

function createRequest() {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
  
    // Setup our listener to process request state changes
    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4) {
        resolve(xhr.responseText);
      }
    };
  
    // Send request
    const params = new URLSearchParams({
      start: new Date().toISOString(),
      stop: new Date(Date.now() - 10 * 60000).toISOString()
    });
    xhr.open('GET', `http://localhost:8000/?${params.toString()}`);
    xhr.send();
  })
}

window.addEventListener('load', function(event){
  // Load DOM elements fpr displaying data
  const userAgentNode = document.querySelector('.user-agent');
  const totalNumRequestsNode = document.querySelector('.total-requests');
  const durationNode = document.querySelector('.duration');
  const lastHundredNode = document.querySelector('.last-hundred');
  const timeRunningNode = document.querySelector('.time-running');

  // Initialize stats
  let numRequestsComplete = 0;
  let totalDurationSum = 0;
  let lastHundredDuration = new Array();
  let lastHundredDurationSum = 0;

  const testStartTime = Date.now();

  // Function that continuously polls the rest endpoint
  async function createRequestLoop() {
    console.log('Initializing request loop');
    while(true) {
      const start = Date.now();
      await createRequest();
      const end = Date.now();
      const duration = end - start;
      lastHundredDuration.push(duration);
      lastHundredDurationSum += duration;
      if(lastHundredDuration.length > 100) {
        const head = lastHundredDuration.shift();
        lastHundredDurationSum -= head;
      }
      totalDurationSum += duration;
      numRequestsComplete++;
    }
  }

  // Create 10 request loops
  for(let i = 0; i < 10; i++) {
    createRequestLoop();
  }

  // Update display
  setInterval(() => {
    totalNumRequestsNode.textContent = numRequestsComplete;
      
    const totalAvg = totalDurationSum / numRequestsComplete;
    durationNode.textContent = totalAvg;
    
    const rollingAvg = lastHundredDurationSum / lastHundredDuration.length;
    lastHundredNode.textContent = rollingAvg;

    const timeRunning = Date.now() - testStartTime;
    const timeRunningMinutes = Math.floor(timeRunning / 60000);
    const timeRunningSeconds = Math.floor((timeRunning - timeRunningMinutes * 60000) / 1000);
    timeRunningNode.textContent = `${timeRunningMinutes}:${timeRunningSeconds.toString().padStart(2, '0')}`
  }, 50);

  // Show user agent on page
  const chromeVersion = window.navigator.userAgent.match(/Chrome\/[\d\.]+/)[0]
  userAgentNode.textContent = chromeVersion;
});