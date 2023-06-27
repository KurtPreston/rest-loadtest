console.log('Start load test');

function createRequest() {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
  
    // Setup our listener to process request state changes
    xhr.onreadystatechange = function () {
      if(xhr.readyState === 4) {
        resolve();
      }
    };
  
    // Send request
    xhr.open('GET', 'http://localhost:8000');
    xhr.send();
  })
}

window.addEventListener('load', function(event){
  // Load DOM elements fpr displaying data
  const userAgentNode = document.querySelector('.user-agent');
  const totalNumRequestsNode = document.querySelector('.total-requests');
  const durationNode = document.querySelector('.duration');
  const lastHundredNode = document.querySelector('.last-hundred');

  // Initialize stats
  let numRequestsComplete = 0;
  let totalDurationSum = 0;
  let lastHundredDuration = new Array();
  let lastHundredDurationSum = 0;

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
      
      totalNumRequestsNode.textContent = numRequestsComplete;
      
      const totalAvg = totalDurationSum / numRequestsComplete;
      durationNode.textContent = totalAvg;
      
      const rollingAvg = lastHundredDurationSum / lastHundredDuration.length;
      lastHundredNode.textContent = rollingAvg;
    }
  }

  // Create 10 request loops
  for(let i = 0; i < 10; i++) {
    createRequestLoop();
  }

  // Show user agent on page
  const chromeVersion = window.navigator.userAgent.match(/Chrome\/[\d\.]+/)[0]
  userAgentNode.textContent = chromeVersion;
});