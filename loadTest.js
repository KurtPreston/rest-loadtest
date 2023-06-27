console.log('Start load test');

let numRequestsComplete = 0;
let requestDurationSum = 0;
let lastHundredDuration = new Array();
let lastHundredDurationSum = 0;

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
    requestDurationSum += duration;
    numRequestsComplete++;
    const totalNode = document.querySelector('.total-requests');
    if(totalNode) {
      totalNode.textContent = numRequestsComplete;
    }
    const durationNode = document.querySelector('.duration');
    if(duration) {
      const avg = requestDurationSum / numRequestsComplete;
      durationNode.textContent = avg;
    }
    const lastHundredNode = document.querySelector('.last-hundred');
    if(lastHundredNode) {
      const avg = lastHundredDurationSum / lastHundredDuration.length;
      lastHundredNode.textContent = avg;
    }
  }
}

// Create 10 request loops
for(let i = 0; i < 10; i++) {
  createRequestLoop();
}